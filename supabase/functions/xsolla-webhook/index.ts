import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

function hex(bytes: ArrayBuffer) {
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let i = 0; i < left.length; i += 1) diff |= left.charCodeAt(i) ^ right.charCodeAt(i);
  return diff === 0;
}

Deno.serve(async (request) => {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const webhookSecret = Deno.env.get("XSOLLA_WEBHOOK_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!webhookSecret || !supabaseUrl || !serviceKey) return new Response("Webhook not configured", { status: 503 });

  const rawBody = await request.text();
  const headerSignature = request.headers.get("authorization") || "";
  const provided = headerSignature.match(/^Signature\s+([a-f0-9]{40})$/i)?.[1]?.toLowerCase();
  if (!provided) return new Response("Invalid signature", { status: 400 });
  const expected = hex(await crypto.subtle.digest("SHA-1", new TextEncoder().encode(rawBody + webhookSecret)));
  if (!constantTimeEqual(expected, provided)) return new Response("Invalid signature", { status: 400 });

  let event: any;
  try { event = JSON.parse(rawBody); } catch { return new Response("Invalid JSON", { status: 400 }); }
  if (event?.notification_type === "user_validation") {
    const userId = String(event?.user?.id ?? "");
    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await admin.auth.admin.getUserById(userId);
    return data?.user && !error ? new Response("", { status: 204 }) : new Response("Invalid user", { status: 400 });
  }
  if (event?.notification_type !== "payment") {
    // Refund/chargeback handling must be configured before a live launch.
    console.warn("Unsupported Xsolla notification type", event?.notification_type);
    return new Response("Unsupported notification", { status: 501 });
  }

  const externalId = String(event?.transaction?.external_id ?? "");
  const transactionId = String(event?.transaction?.id ?? "");
  if (!externalId || !transactionId) return new Response("Missing transaction reference", { status: 400 });
  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await admin.rpc("apply_xsolla_wallet_purchase", { p_order_id: externalId, p_transaction_id: transactionId });
  if (error) {
    console.error("Xsolla payment credit failed", error.code, error.message);
    return new Response("Payment could not be fulfilled", { status: 500 });
  }
  return new Response("", { status: 204 });
});
