import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { timeoutFetch } from "@/lib/supabase/timeout-fetch";

export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
      global: {
        fetch: timeoutFetch,
      },
    },
  );
}
