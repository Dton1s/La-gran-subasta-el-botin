import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { REAL_MONEY_PRODUCTS, XSOLLA_PROJECT_ID, type RealMoneySku } from "../_shared/real-money-catalog.ts";

const allowedOrigins = new Set([
  "https://nebuladigitalstudio.es",
  "https://www.nebuladigitalstudio.es",
  "http://localhost:8443",
]);

function headersFor(origin: string | null) {
  const headers = new Headers({ "Content-Type": "application/json", "Vary": "Origin" });
  if (origin && allowedOrigins.has(origin)) headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Access-Control-Allow-Headers", "authorization, x-client-info, apikey, content-type");
  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  return headers;
}

Deno.serve(async (request) => {
  const headers = headersFor(request.headers.get("origin"));
  if (request.method === "OPTIONS") return new Response("ok", { headers });
  if (request.method !== "POST") return new Response(JSON.stringify({ error: "method_not_allowed" }), { status: 405, headers });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const apiKey = Deno.env.get("XSOLLA_API_KEY");
  const projectId = Deno.env.get("XSOLLA_PROJECT_ID") || XSOLLA_PROJECT_ID;
  const returnUrl = Deno.env.get("XSOLLA_RETURN_URL") || "https://www.nebuladigitalstudio.es/lagransubasta/";
  if (!supabaseUrl || !anonKey || !serviceKey || !apiKey) {
    return new Response(JSON.stringify({ error: "xsolla_server_not_configured" }), { status: 503, headers });
  }

  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) return new Response(JSON.stringify({ error: "not_authenticated" }), { status: 401, headers });

  try {
    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authorization } }, auth: { persistSession: false, autoRefreshToken: false } });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) return new Response(JSON.stringify({ error: "not_authenticated" }), { status: 401, headers });

    const input = await request.json().catch(() => ({}));
    const sku = typeof input?.sku === "string" ? input.sku : "";
    if (!Object.prototype.hasOwnProperty.call(REAL_MONEY_PRODUCTS, sku)) return new Response(JSON.stringify({ error: "unknown_product" }), { status: 400, headers });
    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: dbProduct, error: productError } = await admin.from("real_money_products").select("sku,active").eq("sku", sku).maybeSingle();
    if (productError || !dbProduct?.active) return new Response(JSON.stringify({ error: "product_unavailable" }), { status: 409, headers });

    const { data: order, error: orderError } = await admin.from("real_money_orders").insert({ user_id: user.id, sku, status: "pending" }).select("id").single();
    if (orderError || !order) throw new Error("Could not create checkout order");

    const project = encodeURIComponent(projectId);
    const basic = btoa(`${projectId}:${apiKey}`);
    const countryHeader = request.headers.get("x-vercel-ip-country") || request.headers.get("cf-ipcountry") || "ES";
    const country = /^[A-Z]{2}$/.test(countryHeader.toUpperCase()) ? countryHeader.toUpperCase() : "ES";
    const xsollaResponse = await fetch(`https://store.xsolla.com/api/v3/project/${project}/admin/payment/token`, {
      method: "POST",
      headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        user: {
          id: { value: user.id },
          name: { value: String(user.user_metadata?.username || user.user_metadata?.display_name || user.email?.split("@")[0] || "Jugador").slice(0, 64) },
          ...(user.email ? { email: { value: user.email } } : {}),
          country: { value: country, allow_modify: true },
        },
        purchase: { items: [{ sku, quantity: 1 }] },
        settings: { mode: "sandbox", currency: "EUR", language: "es", external_id: order.id, return_url: returnUrl },
      }),
    });
    const xsollaData = await xsollaResponse.json().catch(() => ({}));
    if (!xsollaResponse.ok || typeof xsollaData?.token !== "string") {
      await admin.from("real_money_orders").update({ status: "failed", updated_at: new Date().toISOString() }).eq("id", order.id);
      console.error("Xsolla token request failed", xsollaResponse.status);
      return new Response(JSON.stringify({ error: "payment_session_unavailable" }), { status: 502, headers });
    }
    if (xsollaData.order_id) await admin.from("real_money_orders").update({ xsolla_order_id: String(xsollaData.order_id), updated_at: new Date().toISOString() }).eq("id", order.id);
    const checkoutUrl = `https://sandbox-secure.xsolla.com/paystation4/?token=${encodeURIComponent(xsollaData.token)}`;
    return new Response(JSON.stringify({ checkoutUrl, orderId: order.id, sandbox: true }), { status: 200, headers });
  } catch (error) {
    console.error("Checkout creation failed", error instanceof Error ? error.message : "unknown error");
    return new Response(JSON.stringify({ error: "checkout_creation_failed" }), { status: 500, headers });
  }
});
