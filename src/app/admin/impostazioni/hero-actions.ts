"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import {
  ALLOWED_IMAGE_TYPES,
  homepageHeroImagePath,
  MAX_PRODUCT_IMAGE_BYTES,
  PRODUCT_IMAGES_BUCKET,
} from "@/lib/media/storage";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type HeroActionResult =
  | { ok: true }
  | { ok: false; message: string };

const MAX_HERO_IMAGES = 8;

export async function uploadHomepageHeroImage(
  formData: FormData,
): Promise<HeroActionResult> {
  await requireAdmin();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Seleziona un'immagine." };
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return {
      ok: false,
      message: "Formato non supportato. Usa JPEG, PNG o WebP.",
    };
  }

  if (file.size > MAX_PRODUCT_IMAGE_BYTES) {
    return { ok: false, message: "L'immagine supera i 5 MB." };
  }

  const path = homepageHeroImagePath(file.type);
  if (!path) {
    return { ok: false, message: "Tipo di file non valido." };
  }

  const supabase = await createClient();
  const { count, error: countError } = await supabase
    .from("homepage_hero_images")
    .select("id", { count: "exact", head: true });

  if (countError) {
    return { ok: false, message: "Non è stato possibile verificare le immagini." };
  }

  if ((count ?? 0) >= MAX_HERO_IMAGES) {
    return {
      ok: false,
      message: `Puoi caricare al massimo ${MAX_HERO_IMAGES} immagini.`,
    };
  }

  const { data: existing } = await supabase
    .from("homepage_hero_images")
    .select("position")
    .order("position", { ascending: false })
    .limit(1);

  const nextPosition = (existing?.[0]?.position ?? -1) + 1;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error: uploadError } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(path, bytes, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return { ok: false, message: "Upload non riuscito." };
  }

  const alt = String(formData.get("alt") ?? "").trim() || null;
  const { error } = await supabase.from("homepage_hero_images").insert({
    storage_path: path,
    alt_text: alt,
    position: nextPosition,
  });

  if (error) {
    await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove([path]);
    return {
      ok: false,
      message: "Immagine caricata ma non salvata nelle impostazioni.",
    };
  }

  await writeAudit("homepage.hero.upload", path);
  updateTag("homepage-hero");
  return { ok: true };
}

export async function deleteHomepageHeroImage(
  imageId: string,
): Promise<HeroActionResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error: readError } = await supabase
    .from("homepage_hero_images")
    .select("id, storage_path, position")
    .eq("id", imageId)
    .maybeSingle();

  if (readError || !data) {
    return { ok: false, message: "Immagine non trovata." };
  }

  const { error: storageError } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .remove([data.storage_path]);

  if (storageError) {
    console.error("homepage hero storage delete", storageError.message);
  }

  const { error } = await supabase
    .from("homepage_hero_images")
    .delete()
    .eq("id", imageId);

  if (error) {
    return { ok: false, message: "Non è stato possibile eliminare l'immagine." };
  }

  await writeAudit("homepage.hero.delete", imageId);
  updateTag("homepage-hero");
  return { ok: true };
}

export async function moveHomepageHeroImage(
  imageId: string,
  direction: "up" | "down",
): Promise<HeroActionResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("homepage_hero_images")
    .select("id, position")
    .order("position", { ascending: true });

  if (error || !data) {
    return { ok: false, message: "Non è stato possibile riordinare le immagini." };
  }

  const index = data.findIndex((item) => item.id === imageId);
  if (index < 0) {
    return { ok: false, message: "Immagine non trovata." };
  }

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= data.length) {
    return { ok: true };
  }

  const current = data[index];
  const other = data[swapIndex];

  const { error: firstError } = await supabase
    .from("homepage_hero_images")
    .update({ position: other.position })
    .eq("id", current.id);

  const { error: secondError } = await supabase
    .from("homepage_hero_images")
    .update({ position: current.position })
    .eq("id", other.id);

  if (firstError || secondError) {
    return { ok: false, message: "Non è stato possibile riordinare le immagini." };
  }

  updateTag("homepage-hero");
  return { ok: true };
}

async function writeAudit(action: string, detail: string) {
  try {
    const admin = await requireAdmin();
    const supabase = createAdminClient();
    await supabase.from("admin_audit_logs").insert({
      actor_id: admin.userId,
      action,
      entity: "homepage_hero_images",
      entity_id: null,
      detail: { detail },
    });
  } catch (error) {
    console.error("audit log", error);
  }
}
