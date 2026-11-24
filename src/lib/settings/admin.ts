import "server-only";

import { createClient } from "@/lib/supabase/server";

export type AdminStoreSettings = {
  storeName: string;
  notificationEmail: string | null;
  whatsappNumber: string | null;
  homepageIntro: string | null;
  unavailableMessage: string | null;
  updatedAt: string;
};

export async function getAdminStoreSettings(): Promise<AdminStoreSettings | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("store_settings")
    .select(
      `
      store_name, notification_email, whatsapp_number,
      homepage_intro, unavailable_message, updated_at
    `,
    )
    .eq("id", "default")
    .maybeSingle();

  if (error) {
    throw new Error("Impossibile leggere le impostazioni.");
  }

  if (!data) {
    return null;
  }

  return {
    storeName: data.store_name,
    notificationEmail: data.notification_email,
    whatsappNumber: data.whatsapp_number,
    homepageIntro: data.homepage_intro,
    unavailableMessage: data.unavailable_message,
    updatedAt: data.updated_at,
  };
}
