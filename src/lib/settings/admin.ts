import "server-only";

import {
  DEFAULT_HOMEPAGE_HOW_STEPS,
  DEFAULT_HOMEPAGE_WHY_ITEMS,
  MAX_HOMEPAGE_WHY_ITEMS,
  MIN_HOMEPAGE_WHY_ITEMS,
  normalizeVariableCopyItems,
  type HomepageCopyItem,
} from "@/lib/settings/homepage-defaults";
import { createClient } from "@/lib/supabase/server";

export type AdminStoreSettings = {
  storeName: string;
  notificationEmail: string | null;
  whatsappNumber: string | null;
  homepageHeadline: string | null;
  homepageIntro: string | null;
  unavailableMessage: string | null;
  featuredLimit: 3 | 6 | 9;
  homepageEyebrow: string | null;
  homepageCtaCatalog: string | null;
  homepageCtaHow: string | null;
  homepageFeaturedTitle: string | null;
  homepageHowTitle: string | null;
  homepageHowSteps: HomepageCopyItem[];
  homepageWhyTitle: string | null;
  homepageWhyItems: HomepageCopyItem[];
  homepageWhyCta: string | null;
  privacyTitle: string | null;
  privacyBody: string | null;
  cookieTitle: string | null;
  cookieBody: string | null;
  aboutTitle: string | null;
  aboutBody: string | null;
  updatedAt: string;
};

export async function getAdminStoreSettings(): Promise<AdminStoreSettings | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("store_settings")
    .select(
      `
      store_name, notification_email, whatsapp_number,
      homepage_headline, homepage_intro, unavailable_message,
      featured_limit,
      homepage_eyebrow, homepage_cta_catalog, homepage_cta_how,
      homepage_featured_title, homepage_how_title, homepage_how_steps,
      homepage_why_title, homepage_why_items, homepage_why_cta,
      privacy_title, privacy_body, cookie_title, cookie_body,
      about_title, about_body,
      updated_at
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

  const featuredLimit =
    data.featured_limit === 6 || data.featured_limit === 9
      ? data.featured_limit
      : 3;

  return {
    storeName: data.store_name,
    notificationEmail: data.notification_email,
    whatsappNumber: data.whatsapp_number,
    homepageHeadline: data.homepage_headline,
    homepageIntro: data.homepage_intro,
    unavailableMessage: data.unavailable_message,
    featuredLimit,
    homepageEyebrow: data.homepage_eyebrow,
    homepageCtaCatalog: data.homepage_cta_catalog,
    homepageCtaHow: data.homepage_cta_how,
    homepageFeaturedTitle: data.homepage_featured_title,
    homepageHowTitle: data.homepage_how_title,
    homepageHowSteps: normalizeVariableCopyItems(
      data.homepage_how_steps,
      DEFAULT_HOMEPAGE_HOW_STEPS,
    ),
    homepageWhyTitle: data.homepage_why_title,
    homepageWhyItems: normalizeVariableCopyItems(
      data.homepage_why_items,
      DEFAULT_HOMEPAGE_WHY_ITEMS,
      { min: MIN_HOMEPAGE_WHY_ITEMS, max: MAX_HOMEPAGE_WHY_ITEMS },
    ),
    homepageWhyCta: data.homepage_why_cta,
    privacyTitle: data.privacy_title,
    privacyBody: data.privacy_body,
    cookieTitle: data.cookie_title,
    cookieBody: data.cookie_body,
    aboutTitle: data.about_title,
    aboutBody: data.about_body,
    updatedAt: data.updated_at,
  };
}
