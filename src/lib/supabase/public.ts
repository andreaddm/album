import { createClient } from "@supabase/supabase-js";
import { requireSupabasePublicEnv } from "@/lib/supabase/env";

/** Client anonimo, senza cookie. Legge solo ciò che le policy rendono pubblico. */
export function createPublicClient() {
  const { url, anonKey } = requireSupabasePublicEnv();

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
