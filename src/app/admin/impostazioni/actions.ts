"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import {
  fieldErrorsFromSchema,
  storeSettingsSchema,
} from "@/lib/settings/schema";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type SettingsResult =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

export async function updateStoreSettings(
  input: unknown,
): Promise<SettingsResult> {
  await requireAdmin();
  const parsed = storeSettingsSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Controlla i campi evidenziati.",
      fieldErrors: fieldErrorsFromSchema(parsed.error),
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("store_settings")
    .update({
      store_name: parsed.data.storeName,
      notification_email: parsed.data.notificationEmail,
      whatsapp_number: parsed.data.whatsappNumber,
      homepage_intro: parsed.data.homepageIntro,
      unavailable_message: parsed.data.unavailableMessage,
    })
    .eq("id", "default");

  if (error) {
    return {
      ok: false,
      message: "Non è stato possibile salvare le impostazioni.",
    };
  }

  await writeAudit("settings.update", "store_settings", null, {
    storeName: parsed.data.storeName,
  });
  updateTag("store-settings");
  return { ok: true };
}

async function writeAudit(
  action: string,
  entity: string,
  entityId: string | null,
  detail: Record<string, unknown>,
) {
  try {
    const admin = await requireAdmin();
    const supabase = createAdminClient();
    await supabase.from("admin_audit_logs").insert({
      actor_id: admin.userId,
      action,
      entity,
      entity_id: entityId,
      detail,
    });
  } catch (error) {
    console.error("audit log", error);
  }
}
