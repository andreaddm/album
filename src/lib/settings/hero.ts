import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { publicImageUrl } from "@/lib/media/storage";
import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";
import { requireSupabasePublicEnv } from "@/lib/supabase/env";

export type HomepageHeroImage = {
  id: string;
  src: string;
  alt: string;
  storagePath: string;
  position: number;
};

function mapHeroRow(
  row: {
    id: string;
    storage_path: string;
    alt_text: string | null;
    position: number;
  },
  baseUrl: string,
): HomepageHeroImage {
  return {
    id: row.id,
    src: publicImageUrl(row.storage_path, baseUrl),
    alt: row.alt_text?.trim() || "Sfondo homepage",
    storagePath: row.storage_path,
    position: row.position,
  };
}

export async function listHomepageHeroImages(): Promise<HomepageHeroImage[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("homepage-hero");

  const { url } = requireSupabasePublicEnv();
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("homepage_hero_images")
    .select("id, storage_path, alt_text, position")
    .order("position", { ascending: true });

  if (error) {
    throw new Error("Impossibile leggere le immagini della homepage.");
  }

  return ((data ?? []) as Array<{
    id: string;
    storage_path: string;
    alt_text: string | null;
    position: number;
  }>).map((row) => mapHeroRow(row, url));
}

export async function listAdminHomepageHeroImages(): Promise<
  HomepageHeroImage[]
> {
  const { url } = requireSupabasePublicEnv();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("homepage_hero_images")
    .select("id, storage_path, alt_text, position")
    .order("position", { ascending: true });

  if (error) {
    throw new Error("Impossibile leggere le immagini della homepage.");
  }

  return ((data ?? []) as Array<{
    id: string;
    storage_path: string;
    alt_text: string | null;
    position: number;
  }>).map((row) => mapHeroRow(row, url));
}
