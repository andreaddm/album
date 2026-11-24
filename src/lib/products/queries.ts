import { cacheLife, cacheTag } from "next/cache";
import { resolveVideoEmbed } from "@/lib/media/video";
import type {
  ProductFeature,
  ProductImage,
  ProductMedia,
  PublishedProduct,
  StorePublicSettings,
} from "@/lib/products/types";
import { createPublicClient } from "@/lib/supabase/public";
import { requireSupabasePublicEnv } from "@/lib/supabase/env";

type MediaRow = {
  id: string;
  media_type: string;
  storage_path: string | null;
  external_url: string | null;
  platform: string | null;
  alt_text: string | null;
  position: number;
};

type FeatureRow = {
  id: string;
  name: string;
  value: string;
  position: number;
};

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  price: number | string;
  short_description: string | null;
  description: string | null;
  is_available: boolean;
  availability_notice_enabled: boolean;
  availability_notice_text: string | null;
  product_media: MediaRow[] | null;
  product_features: FeatureRow[] | null;
};

export async function listPublishedProducts(): Promise<PublishedProduct[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("products");

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id, name, slug, price, short_description, description,
      is_available, availability_notice_enabled, availability_notice_text,
      product_media (id, media_type, storage_path, external_url, platform, alt_text, position),
      product_features (id, name, value, position)
    `,
    )
    .eq("is_published", true)
    .order("name");

  if (error) {
    throw new Error("Impossibile leggere il catalogo.");
  }

  return ((data ?? []) as ProductRow[]).map(mapProduct);
}

export async function getPublishedProduct(slug: string) {
  const products = await listPublishedProducts();
  return products.find((product) => product.slug === slug) ?? null;
}

export async function getStorePublicSettings(): Promise<StorePublicSettings | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("store-settings");

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("store_settings")
    .select("store_name, whatsapp_number, homepage_intro, unavailable_message")
    .eq("id", "default")
    .maybeSingle();

  if (error) {
    throw new Error("Impossibile leggere le impostazioni del negozio.");
  }

  if (!data) {
    return null;
  }

  return {
    storeName: data.store_name,
    whatsappNumber: data.whatsapp_number,
    homepageIntro: data.homepage_intro,
    unavailableMessage: data.unavailable_message,
  };
}

function mapProduct(row: ProductRow): PublishedProduct {
  const media = (row.product_media ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .flatMap((item) => mapMedia(item, row.name));
  const features: ProductFeature[] = (row.product_features ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((feature) => ({
      id: feature.id,
      name: feature.name,
      value: feature.value,
    }));

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    price: Number(row.price),
    shortDescription: row.short_description,
    description: row.description,
    isAvailable: row.is_available,
    availabilityNoticeEnabled: row.availability_notice_enabled,
    availabilityNoticeText: row.availability_notice_text,
    media,
    images: media.flatMap((item) => (item.kind === "image" ? [item] : [])),
    features,
  };
}

function mapMedia(row: MediaRow, productName: string): ProductMedia[] {
  if (row.media_type === "image" && row.storage_path) {
    const image: ProductImage = {
      id: row.id,
      src: publicImageUrl(row.storage_path),
      alt: row.alt_text?.trim() || productName,
    };
    return [{ kind: "image", ...image }];
  }

  if (
    row.media_type === "video" &&
    row.external_url &&
    (row.platform === "youtube" || row.platform === "tiktok")
  ) {
    const resolved = resolveVideoEmbed(row.external_url, row.platform);
    return [
      {
        kind: "video",
        id: row.id,
        platform: row.platform,
        watchUrl: resolved.watchUrl,
        embedUrl: resolved.embedUrl,
      },
    ];
  }

  return [];
}

function publicImageUrl(storagePath: string) {
  const { url } = requireSupabasePublicEnv();
  const encoded = storagePath
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

  return `${url}/storage/v1/object/public/product-images/${encoded}`;
}
