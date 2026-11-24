import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AdminContext = {
  userId: string;
  email: string | null;
};

/**
 * Restituisce l'utente solo se la sessione è valida e il profilo ha ruolo admin.
 * I visitatori anonimi e gli utenti senza quel ruolo ottengono null.
 */
export async function getAdminContext(): Promise<AdminContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error || profile?.role !== "admin") {
    return null;
  }

  return {
    userId: user.id,
    email: user.email ?? null,
  };
}

export async function requireAdmin(): Promise<AdminContext> {
  const admin = await getAdminContext();

  if (!admin) {
    throw new Error("Operazione riservata all'amministratore.");
  }

  return admin;
}

export async function requireAdminPage(): Promise<AdminContext> {
  const admin = await getAdminContext();

  if (!admin) {
    redirect("/admin/login");
  }

  return admin;
}
