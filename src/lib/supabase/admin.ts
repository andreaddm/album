import "server-only";
import { createClient } from "@supabase/supabase-js";
import { requireSupabasePublicEnv } from "@/lib/supabase/env";

/**
 * Client con chiave service role. Usarlo solo in codice server,
 * mai in componenti o moduli importati dal browser.
 */
export function createAdminClient() {
  const { url } = requireSupabasePublicEnv();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error("Manca SUPABASE_SERVICE_ROLE_KEY.");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
