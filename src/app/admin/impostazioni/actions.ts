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
      homepage_headline: parsed.data.homepageHeadline,
      homepage_intro: parsed.data.homepageIntro,
      unavailable_message: parsed.data.unavailableMessage,
      featured_limit: parsed.data.featuredLimit,
      homepage_eyebrow: parsed.data.homepageEyebrow,
      homepage_cta_catalog: parsed.data.homepageCtaCatalog,
      homepage_cta_how: parsed.data.homepageCtaHow,
      homepage_featured_title: parsed.data.homepageFeaturedTitle,
      homepage_how_title: parsed.data.homepageHowTitle,
      homepage_how_steps: parsed.data.homepageHowSteps,
      homepage_why_title: parsed.data.homepageWhyTitle,
      homepage_why_items: parsed.data.homepageWhyItems,
      homepage_why_cta: parsed.data.homepageWhyCta,
      privacy_title: parsed.data.privacyTitle,
      privacy_body: parsed.data.privacyBody,
      cookie_title: parsed.data.cookieTitle,
      cookie_body: parsed.data.cookieBody,
      about_title: parsed.data.aboutTitle,
      about_body: parsed.data.aboutBody,
    })
    .eq("id", "default");

  if (error) {
    return {
      ok: false,
      message: "Non è stato possibile salvare le impostazioni.",
    };
  }

  await trimFeaturedProducts(parsed.data.featuredLimit);

  await writeAudit("settings.update", "store_settings", null, {
    storeName: parsed.data.storeName,
    featuredLimit: parsed.data.featuredLimit,
  });
  updateTag("store-settings");
  updateTag("products");
  return { ok: true };
}

async function trimFeaturedProducts(limit: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id")
    .eq("is_featured", true)
    .order("name", { ascending: true });

  if (error || !data || data.length <= limit) {
    return;
  }

  const excessIds = data.slice(limit).map((row) => row.id);
  if (excessIds.length === 0) {
    return;
  }

  await supabase
    .from("products")
    .update({ is_featured: false })
    .in("id", excessIds);
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
