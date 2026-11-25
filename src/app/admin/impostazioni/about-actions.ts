"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import {
  ALLOWED_IMAGE_TYPES,
  aboutPageImagePath,
  MAX_PRODUCT_IMAGE_BYTES,
  PRODUCT_IMAGES_BUCKET,
} from "@/lib/media/storage";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type AboutActionResult =
  | { ok: true }
  | { ok: false; message: string };

const MAX_GALLERY_IMAGES = 12;

export async function uploadAboutPageImage(
  kind: "background" | "gallery",
  formData: FormData,
): Promise<AboutActionResult> {
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

  const path = aboutPageImagePath(kind, file.type);
  if (!path) {
    return { ok: false, message: "Tipo di file non valido." };
  }

  const supabase = await createClient();

  if (kind === "gallery") {
    const { count, error: countError } = await supabase
      .from("about_page_media")
      .select("id", { count: "exact", head: true })
      .eq("kind", "gallery");

    if (countError) {
      return {
        ok: false,
        message: "Non è stato possibile verificare le immagini.",
      };
    }

    if ((count ?? 0) >= MAX_GALLERY_IMAGES) {
      return {
        ok: false,
        message: `Puoi caricare al massimo ${MAX_GALLERY_IMAGES} immagini in galleria.`,
      };
    }
  }

  if (kind === "background") {
    const { data: existingBg } = await supabase
      .from("about_page_media")
      .select("id, storage_path")
      .eq("kind", "background");

    for (const row of existingBg ?? []) {
      await supabase.storage
        .from(PRODUCT_IMAGES_BUCKET)
        .remove([row.storage_path]);
      await supabase.from("about_page_media").delete().eq("id", row.id);
    }
  }

  const { data: existing } = await supabase
    .from("about_page_media")
    .select("position")
    .eq("kind", kind)
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
  const { error } = await supabase.from("about_page_media").insert({
    kind,
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

  await writeAudit("about.media.upload", { kind, path });
  updateTag("about-media");
  return { ok: true };
}

export async function deleteAboutPageImage(
  imageId: string,
): Promise<AboutActionResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error: readError } = await supabase
    .from("about_page_media")
    .select("id, storage_path")
    .eq("id", imageId)
    .maybeSingle();

  if (readError || !data) {
    return { ok: false, message: "Immagine non trovata." };
  }

  const { error: storageError } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .remove([data.storage_path]);

  if (storageError) {
    console.error("about media storage delete", storageError.message);
  }

  const { error } = await supabase
    .from("about_page_media")
    .delete()
    .eq("id", imageId);

  if (error) {
    return { ok: false, message: "Non è stato possibile eliminare l'immagine." };
  }

  await writeAudit("about.media.delete", { imageId });
  updateTag("about-media");
  return { ok: true };
}

export async function moveAboutPageImage(
  imageId: string,
  direction: "up" | "down",
): Promise<AboutActionResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { data: current, error: readError } = await supabase
    .from("about_page_media")
    .select("id, kind, position")
    .eq("id", imageId)
    .maybeSingle();

  if (readError || !current) {
    return { ok: false, message: "Immagine non trovata." };
  }

  const { data, error } = await supabase
    .from("about_page_media")
    .select("id, position")
    .eq("kind", current.kind)
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

  const other = data[swapIndex];
  const { error: firstError } = await supabase
    .from("about_page_media")
    .update({ position: other.position })
    .eq("id", current.id);

  const { error: secondError } = await supabase
    .from("about_page_media")
    .update({ position: current.position })
    .eq("id", other.id);

  if (firstError || secondError) {
    return { ok: false, message: "Non è stato possibile riordinare le immagini." };
  }

  updateTag("about-media");
  return { ok: true };
}

async function writeAudit(action: string, detail: Record<string, unknown>) {
  try {
    const admin = await requireAdmin();
    const supabase = createAdminClient();
    await supabase.from("admin_audit_logs").insert({
      actor_id: admin.userId,
      action,
      entity: "about_page_media",
      entity_id: null,
      detail,
    });
  } catch (error) {
    console.error("audit log", error);
  }
}
