import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const isValidUrl = (url) => {
  return url && (url.startsWith("http://") || url.startsWith("https://"));
};

const rawClient = isValidUrl(supabaseUrl) && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

// Proxy wrapper to prevent build crash while throwing clear errors at runtime if keys are missing
export const supabase = new Proxy({}, {
  get(target, prop) {
    if (!rawClient) {
      throw new Error(
        "Supabase client is not initialized. Please configure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment variables."
      );
    }
    return rawClient[prop];
  }
});

