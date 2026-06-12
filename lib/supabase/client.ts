import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import { timeoutFetch } from "@/lib/supabase/timeout-fetch";

let browserClient: SupabaseClient | null = null;

export function createClient() {
  browserClient ??= createSupabaseClient(
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

  return browserClient;
}
