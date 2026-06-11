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
      if (supabaseUrl && (supabaseUrl.startsWith("sb_publishable_") || supabaseUrl.startsWith("sb_secret_"))) {
        throw new Error(
          `Supabase client initialization failed: NEXT_PUBLIC_SUPABASE_URL has been incorrectly configured with an API key ("${supabaseUrl}"). Please set NEXT_PUBLIC_SUPABASE_URL to your Supabase project API URL (e.g., https://<your-project-ref>.supabase.co) and configure SUPABASE_SERVICE_ROLE_KEY with your secret key.`
        );
      }
      throw new Error(
        `Supabase client is not initialized. Please configure NEXT_PUBLIC_SUPABASE_URL (e.g., https://<your-project-ref>.supabase.co) and SUPABASE_SERVICE_ROLE_KEY in your environment variables. Current URL: "${supabaseUrl || ''}"`
      );
    }
    return rawClient[prop];
  }
});

