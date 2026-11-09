import { createClient } from "@supabase/supabase-js";

const projectUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

export const supabaseConfigured = Boolean(projectUrl && publishableKey);

export const supabase = supabaseConfigured
  ? createClient(projectUrl!, publishableKey!, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
      },
    })
  : null;

export const supabaseRedirectUrl = () => {
  const redirect = new URL(window.location.pathname, window.location.origin);
  if (redirect.hostname === "www.nebuladigitalstudio.es") redirect.hostname = "nebuladigitalstudio.es";
  return redirect.toString();
};
