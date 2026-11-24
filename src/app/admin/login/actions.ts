"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getAdminContext } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z.email("Inserisci un indirizzo email valido."),
  password: z.string().min(1, "Inserisci la password."),
});

export type LoginResult =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

export async function loginAdmin(input: unknown): Promise<LoginResult> {
  const parsed = loginSchema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }

    return {
      ok: false,
      message: "Controlla i campi evidenziati.",
      fieldErrors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return {
      ok: false,
      message: "Credenziali non valide.",
    };
  }

  const admin = await getAdminContext();
  if (!admin) {
    await supabase.auth.signOut();
    return {
      ok: false,
      message: "Questo account non ha accesso all'area admin.",
    };
  }

  redirect("/admin");
}

export async function logoutAdmin() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
