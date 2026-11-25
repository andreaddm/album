import type { Metadata } from "next";
import { PageBody } from "@/components/layout/page-body";
import { PageIntro } from "@/components/layout/page-intro";
import { getStorePublicSettings } from "@/lib/products/queries";
import {
  DEFAULT_PRIVACY_BODY,
  DEFAULT_PRIVACY_TITLE,
} from "@/lib/settings/page-defaults";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStorePublicSettings();
  return {
    title: settings?.privacyTitle?.trim() || DEFAULT_PRIVACY_TITLE,
  };
}

export default async function PrivacyPage() {
  const settings = await getStorePublicSettings();
  const title = settings?.privacyTitle?.trim() || DEFAULT_PRIVACY_TITLE;
  const body = settings?.privacyBody?.trim() || DEFAULT_PRIVACY_BODY;

  return (
    <PageIntro title={title}>
      <PageBody text={body} />
    </PageIntro>
  );
}
