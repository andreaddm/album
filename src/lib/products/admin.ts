import "server-only";

import { publicImageUrl } from "@/lib/media/storage";
import { resolveVideoEmbed } from "@/lib/media/video";
import type { ProductFeature, ProductMedia } from "@/lib/products/types";
import { requireSupabasePublicEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type AdminProductListItem = {
  id: string;
  name: string;
  slug: string;
  price: number;
  isPublished: boolean;
  isAvailable: boolean;
  isFeatured: boolean;
  availabilityNoticeEnabled: boolean;
  updatedAt: string;
};

export type AdminProductDetail = AdminProductListItem & {
  shortDescription: string | null;
  description: string | null;
  availabilityNoticeText: string | null;
  createdAt: string;
  features: ProductFeature[];
  media: AdminMediaItem[];
};

export type AdminMediaItem =
  | {
      id: string;
      kind: "image";
      position: number;
      src: string;
      alt: string | null;
      storagePath: string;
    }
  | {
      id: string;
      kind: "video";
      position: number;
      watchUrl: string;
      embedUrl: string | null;
      platform: "youtube" | "tiktok";
    };

type ListFilters = {
  q?: string;
  published?: "all" | "yes" | "no";
  available?: "all" | "yes" | "no";
};

export async function listAdminProducts(
  filters: ListFilters = {},
): Promise<AdminProductListItem[]> {
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select(
      "id, name, slug, price, is_published, is_available, is_featured, availability_notice_enabled, updated_at",
    )
    .order("updated_at", { ascending: false });

  const q = filters.q?.trim();
  if (q) {
    query = query.ilike("name", `%${q}%`);
  }

  if (filters.published === "yes") {
    query = query.eq("is_published", true);
  } else if (filters.published === "no") {
    query = query.eq("is_published", false);
  }

  if (filters.available === "yes") {
    query = query.eq("is_available", true);
  } else if (filters.available === "no") {
    query = query.eq("is_available", false);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error("Impossibile leggere i prodotti.");
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    price: Number(row.price),
    isPublished: row.is_published,
    isAvailable: row.is_available,
    isFeatured: Boolean(row.is_featured),
    availabilityNoticeEnabled: row.availability_notice_enabled,
    updatedAt: row.updated_at,
  }));
}

export async function getAdminProduct(
  id: string,
): Promise<AdminProductDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id, name, slug, price, short_description, description,
      is_published, is_available, is_featured, availability_notice_enabled, availability_notice_text,
      created_at, updated_at,
      product_media (id, media_type, storage_path, external_url, platform, alt_text, position),
      product_features (id, name, value, position)
    `,
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error("Impossibile leggere il prodotto.");
  }

  if (!data) {
    return null;
  }

  const { url } = requireSupabasePublicEnv();
  const media = ((data.product_media ?? []) as Array<{
    id: string;
    media_type: string;
    storage_path: string | null;
    external_url: string | null;
    platform: string | null;
    alt_text: string | null;
    position: number;
  }>)
    .slice()
    .sort((a, b) => a.position - b.position)
    .flatMap((row): AdminMediaItem[] => {
      if (row.media_type === "image" && row.storage_path) {
        return [
          {
            id: row.id,
            kind: "image",
            position: row.position,
            src: publicImageUrl(row.storage_path, url),
            alt: row.alt_text,
            storagePath: row.storage_path,
          },
        ];
      }

      if (
        row.media_type === "video" &&
        row.external_url &&
        (row.platform === "youtube" || row.platform === "tiktok")
      ) {
        const resolved = resolveVideoEmbed(row.external_url, row.platform);
        return [
          {
            id: row.id,
            kind: "video",
            position: row.position,
            watchUrl: resolved.watchUrl,
            embedUrl: resolved.embedUrl,
            platform: row.platform,
          },
        ];
      }

      return [];
    });

  const features: ProductFeature[] = ((data.product_features ?? []) as Array<{
    id: string;
    name: string;
    value: string;
    position: number;
  }>)
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((feature) => ({
      id: feature.id,
      name: feature.name,
      value: feature.value,
    }));

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    price: Number(data.price),
    shortDescription: data.short_description,
    description: data.description,
    isPublished: data.is_published,
    isAvailable: data.is_available,
    isFeatured: Boolean(data.is_featured),
    availabilityNoticeEnabled: data.availability_notice_enabled,
    availabilityNoticeText: data.availability_notice_text,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    features,
    media,
  };
}

export async function countFeaturedProducts(excludeId?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("is_featured", true);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { count, error } = await query;
  if (error) {
    throw new Error("Impossibile contare i prodotti in evidenza.");
  }

  return count ?? 0;
}

export async function slugExists(slug: string, excludeId?: string) {
  const supabase = await createClient();
  let query = supabase.from("products").select("id").eq("slug", slug).limit(1);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error("Impossibile verificare lo slug.");
  }

  return (data?.length ?? 0) > 0;
}

export type { ProductMedia };
