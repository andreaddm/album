import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { publicImageUrl } from "@/lib/media/storage";
import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";
import { requireSupabasePublicEnv } from "@/lib/supabase/env";

export type AboutMediaKind = "background" | "gallery";

export type AboutPageImage = {
  id: string;
  kind: AboutMediaKind;
  src: string;
  alt: string;
  storagePath: string;
  position: number;
};

function mapRow(
  row: {
    id: string;
    kind: string;
    storage_path: string;
    alt_text: string | null;
    position: number;
  },
  baseUrl: string,
): AboutPageImage | null {
  if (row.kind !== "background" && row.kind !== "gallery") {
    return null;
  }

  return {
    id: row.id,
    kind: row.kind,
    src: publicImageUrl(row.storage_path, baseUrl),
    alt: row.alt_text?.trim() || (row.kind === "background" ? "Sfondo" : "Foto"),
    storagePath: row.storage_path,
    position: row.position,
  };
}

async function loadAboutImages(admin: boolean): Promise<AboutPageImage[]> {
  const { url } = requireSupabasePublicEnv();
  const supabase = admin ? await createClient() : createPublicClient();
  const { data, error } = await supabase
    .from("about_page_media")
    .select("id, kind, storage_path, alt_text, position")
    .order("position", { ascending: true });

  if (error) {
    throw new Error("Impossibile leggere le immagini di Chi siamo.");
  }

  return ((data ?? []) as Array<{
    id: string;
    kind: string;
    storage_path: string;
    alt_text: string | null;
    position: number;
  }>)
    .map((row) => mapRow(row, url))
    .filter((item): item is AboutPageImage => item !== null);
}

export async function listAboutPageImages(): Promise<AboutPageImage[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("about-media");

  return loadAboutImages(false);
}

export async function listAdminAboutPageImages(): Promise<AboutPageImage[]> {
  return loadAboutImages(true);
}
