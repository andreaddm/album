import type { Metadata } from "next";
import { PageBody } from "@/components/layout/page-body";
import { PageIntro } from "@/components/layout/page-intro";
import { getStorePublicSettings } from "@/lib/products/queries";
import {
  DEFAULT_COOKIE_BODY,
  DEFAULT_COOKIE_TITLE,
} from "@/lib/settings/page-defaults";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStorePublicSettings();
  return {
    title: settings?.cookieTitle?.trim() || DEFAULT_COOKIE_TITLE,
  };
}

export default async function CookiePage() {
  const settings = await getStorePublicSettings();
  const title = settings?.cookieTitle?.trim() || DEFAULT_COOKIE_TITLE;
  const body = settings?.cookieBody?.trim() || DEFAULT_COOKIE_BODY;

  return (
    <PageIntro title={title}>
      <PageBody text={body} />
    </PageIntro>
  );
}
