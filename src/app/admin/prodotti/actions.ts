"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { parseVideoUrl } from "@/lib/media/parse-video";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_PRODUCT_IMAGE_BYTES,
  PRODUCT_IMAGES_BUCKET,
  productImagePath,
} from "@/lib/media/storage";
import {
  countFeaturedProducts,
  getAdminProduct,
  slugExists,
} from "@/lib/products/admin";
import {
  fieldErrorsFromSchema,
  productInputSchema,
  type ProductInput,
} from "@/lib/products/schema";
import { slugifyName, uniqueSlug } from "@/lib/products/slug";
import { getAdminStoreSettings } from "@/lib/settings/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type ActionResult =
  | { ok: true; id?: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

export async function createProduct(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = productInputSchema.safeParse(normalizeProductInput(input));

  if (!parsed.success) {
    return {
      ok: false,
      message: "Controlla i campi evidenziati.",
      fieldErrors: fieldErrorsFromSchema(parsed.error),
    };
  }

  if (await slugExists(parsed.data.slug)) {
    return {
      ok: false,
      message: "Controlla i campi evidenziati.",
      fieldErrors: { slug: "Questo link prodotto è già in uso." },
    };
  }

  const featuredError = await validateFeaturedFlag(parsed.data.isFeatured);
  if (featuredError) {
    return featuredError;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .insert(toProductRow(parsed.data))
    .select("id")
    .single();

  if (error || !data) {
    if (error?.code === "23514" && parsed.data.isFeatured) {
      return {
        ok: false,
        message: "Controlla i campi evidenziati.",
        fieldErrors: {
          isFeatured: "Hai raggiunto il limite di prodotti in evidenza.",
        },
      };
    }
    return { ok: false, message: "Non è stato possibile creare il prodotto." };
  }

  const featuresError = await replaceFeatures(data.id, parsed.data.features);
  if (featuresError) {
    return { ok: false, message: featuresError };
  }

  await writeAudit("product.create", "product", data.id, {
    name: parsed.data.name,
  });
  updateTag("products");
  redirect(`/admin/prodotti/${data.id}`);
}

export async function updateProduct(
  productId: string,
  input: unknown,
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = productInputSchema.safeParse(normalizeProductInput(input));

  if (!parsed.success) {
    return {
      ok: false,
      message: "Controlla i campi evidenziati.",
      fieldErrors: fieldErrorsFromSchema(parsed.error),
    };
  }

  if (await slugExists(parsed.data.slug, productId)) {
    return {
      ok: false,
      message: "Controlla i campi evidenziati.",
      fieldErrors: { slug: "Questo link prodotto è già in uso." },
    };
  }

  const featuredError = await validateFeaturedFlag(
    parsed.data.isFeatured,
    productId,
  );
  if (featuredError) {
    return featuredError;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update(toProductRow(parsed.data))
    .eq("id", productId);

  if (error) {
    if (error.code === "23514" && parsed.data.isFeatured) {
      return {
        ok: false,
        message: "Controlla i campi evidenziati.",
        fieldErrors: {
          isFeatured: "Hai raggiunto il limite di prodotti in evidenza.",
        },
      };
    }
    return { ok: false, message: "Non è stato possibile salvare il prodotto." };
  }

  const featuresError = await replaceFeatures(productId, parsed.data.features);
  if (featuresError) {
    return { ok: false, message: featuresError };
  }

  await writeAudit("product.update", "product", productId, {
    name: parsed.data.name,
  });
  updateTag("products");
  return { ok: true, id: productId };
}

export async function deleteProduct(productId: string): Promise<ActionResult> {
  await requireAdmin();
  const product = await getAdminProduct(productId);

  if (!product) {
    return { ok: false, message: "Prodotto non trovato." };
  }

  const imagePaths = product.media
    .filter((item) => item.kind === "image")
    .map((item) => item.storagePath);

  const admin = createAdminClient();
  if (imagePaths.length > 0) {
    const { error: storageError } = await admin.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .remove(imagePaths);

    if (storageError) {
      console.error("product delete storage", storageError.message);
      await writeAudit("product.delete.storage_error", "product", productId, {
        message: storageError.message,
        paths: imagePaths,
      });
    }
  }

  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", productId);

  if (error) {
    return { ok: false, message: "Non è stato possibile eliminare il prodotto." };
  }

  await writeAudit("product.delete", "product", productId, {
    name: product.name,
    slug: product.slug,
  });
  updateTag("products");
  redirect("/admin/prodotti");
}

export async function duplicateProduct(
  productId: string,
): Promise<ActionResult> {
  await requireAdmin();
  const product = await getAdminProduct(productId);

  if (!product) {
    return { ok: false, message: "Prodotto non trovato." };
  }

  const slug = await uniqueSlug(`${product.slug}-copia`, (candidate) =>
    slugExists(candidate),
  );

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .insert({
      name: `${product.name} (copia)`,
      slug,
      price: product.price,
      short_description: product.shortDescription,
      description: product.description,
      is_published: false,
      is_available: product.isAvailable,
      is_featured: false,
      availability_notice_enabled: product.availabilityNoticeEnabled,
      availability_notice_text: product.availabilityNoticeText,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, message: "Non è stato possibile duplicare il prodotto." };
  }

  if (product.features.length > 0) {
    const { error: featuresError } = await supabase.from("product_features").insert(
      product.features.map((feature, index) => ({
        product_id: data.id,
        name: feature.name,
        value: feature.value,
        position: index,
      })),
    );

    if (featuresError) {
      return {
        ok: false,
        message: "Prodotto duplicato, ma le caratteristiche non sono state copiate.",
      };
    }
  }

  const admin = createAdminClient();
  for (const [index, item] of product.media.entries()) {
    if (item.kind === "video") {
      const { error: videoError } = await supabase.from("product_media").insert({
        product_id: data.id,
        media_type: "video",
        external_url: item.watchUrl,
        platform: item.platform,
        position: index,
      });

      if (videoError) {
        console.error("duplicate video", videoError.message);
      }
      continue;
    }

    const extension = item.storagePath.split(".").pop() || "jpg";
    const newPath = `${data.id}/${crypto.randomUUID()}.${extension}`;
    const { error: copyError } = await admin.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .copy(item.storagePath, newPath);

    if (copyError) {
      console.error("duplicate image copy", copyError.message);
      continue;
    }

    const { error: imageError } = await supabase.from("product_media").insert({
      product_id: data.id,
      media_type: "image",
      storage_path: newPath,
      alt_text: item.alt,
      position: index,
    });

    if (imageError) {
      console.error("duplicate image row", imageError.message);
    }
  }

  await writeAudit("product.duplicate", "product", data.id, {
    sourceId: productId,
  });
  updateTag("products");
  redirect(`/admin/prodotti/${data.id}`);
}

export async function uploadProductImage(
  productId: string,
  formData: FormData,
): Promise<ActionResult> {
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

  const path = productImagePath(productId, file.type);
  if (!path) {
    return { ok: false, message: "Tipo di file non valido." };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("product_media")
    .select("position")
    .eq("product_id", productId)
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
  const { error } = await supabase.from("product_media").insert({
    product_id: productId,
    media_type: "image",
    storage_path: path,
    alt_text: alt,
    position: nextPosition,
  });

  if (error) {
    await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove([path]);
    return { ok: false, message: "Immagine caricata ma non salvata nel catalogo." };
  }

  await writeAudit("product.media.upload", "product", productId, { path });
  updateTag("products");
  return { ok: true, id: productId };
}

export async function addProductVideo(
  productId: string,
  rawUrl: string,
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = parseVideoUrl(rawUrl);

  if (!parsed) {
    return {
      ok: false,
      message: "Inserisci un link YouTube o TikTok valido.",
    };
  }

  const supabase = await createClient();
  const { count, error: countError } = await supabase
    .from("product_media")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId)
    .eq("media_type", "video");

  if (countError) {
    return { ok: false, message: "Non è stato possibile verificare i video." };
  }

  if ((count ?? 0) >= 2) {
    return { ok: false, message: "Puoi aggiungere al massimo 2 video." };
  }

  const { data: existing } = await supabase
    .from("product_media")
    .select("position")
    .eq("product_id", productId)
    .order("position", { ascending: false })
    .limit(1);

  const { error } = await supabase.from("product_media").insert({
    product_id: productId,
    media_type: "video",
    external_url: parsed.watchUrl,
    platform: parsed.platform,
    position: (existing?.[0]?.position ?? -1) + 1,
  });

  if (error) {
    return { ok: false, message: "Non è stato possibile aggiungere il video." };
  }

  await writeAudit("product.media.video", "product", productId, {
    platform: parsed.platform,
  });
  updateTag("products");
  return { ok: true, id: productId };
}

export async function deleteProductMedia(
  productId: string,
  mediaId: string,
): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_media")
    .select("id, media_type, storage_path, position")
    .eq("id", mediaId)
    .eq("product_id", productId)
    .maybeSingle();

  if (error || !data) {
    return { ok: false, message: "Media non trovato." };
  }

  if (data.media_type === "image" && data.storage_path) {
    const { error: storageError } = await supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .remove([data.storage_path]);

    if (storageError) {
      console.error("media delete storage", storageError.message);
      await writeAudit("product.media.storage_error", "product", productId, {
        mediaId,
        message: storageError.message,
      });
    }
  }

  const { error: deleteError } = await supabase
    .from("product_media")
    .delete()
    .eq("id", mediaId);

  if (deleteError) {
    return { ok: false, message: "Non è stato possibile eliminare il media." };
  }

  await compactMediaPositions(productId);
  await writeAudit("product.media.delete", "product", productId, { mediaId });
  updateTag("products");
  return { ok: true, id: productId };
}

export async function moveProductMedia(
  productId: string,
  mediaId: string,
  direction: "up" | "down",
): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_media")
    .select("id, position")
    .eq("product_id", productId)
    .order("position");

  if (error || !data) {
    return { ok: false, message: "Non è stato possibile riordinare i media." };
  }

  const index = data.findIndex((item) => item.id === mediaId);
  if (index < 0) {
    return { ok: false, message: "Media non trovato." };
  }

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= data.length) {
    return { ok: true, id: productId };
  }

  const current = data[index];
  const neighbor = data[swapIndex];
  const { error: firstError } = await supabase
    .from("product_media")
    .update({ position: neighbor.position })
    .eq("id", current.id);

  const { error: secondError } = await supabase
    .from("product_media")
    .update({ position: current.position })
    .eq("id", neighbor.id);

  if (firstError || secondError) {
    return { ok: false, message: "Riordino non riuscito." };
  }

  updateTag("products");
  return { ok: true, id: productId };
}

export async function suggestSlug(name: string, excludeId?: string) {
  await requireAdmin();
  const base = slugifyName(name) || "prodotto";
  return uniqueSlug(base, (candidate) => slugExists(candidate, excludeId));
}

function normalizeProductInput(input: unknown) {
  if (!input || typeof input !== "object") {
    return input;
  }

  const value = input as Record<string, unknown>;
  const priceRaw = value.price;
  const price =
    typeof priceRaw === "number"
      ? priceRaw
      : typeof priceRaw === "string"
        ? Number(priceRaw.replace(",", "."))
        : priceRaw;

  return {
    ...value,
    price,
    shortDescription: emptyToNull(value.shortDescription),
    description: emptyToNull(value.description),
    availabilityNoticeText: emptyToNull(value.availabilityNoticeText),
  };
}

function emptyToNull(value: unknown) {
  if (typeof value !== "string") {
    return value ?? null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toProductRow(data: ProductInput) {
  return {
    name: data.name,
    slug: data.slug,
    price: data.price,
    short_description: data.shortDescription,
    description: data.description,
    is_published: data.isPublished,
    is_available: data.isAvailable,
    is_featured: data.isFeatured,
    availability_notice_enabled: data.availabilityNoticeEnabled,
    availability_notice_text: data.availabilityNoticeText,
  };
}

async function validateFeaturedFlag(
  isFeatured: boolean,
  excludeId?: string,
): Promise<ActionResult | null> {
  if (!isFeatured) {
    return null;
  }

  const [settings, featuredCount] = await Promise.all([
    getAdminStoreSettings(),
    countFeaturedProducts(excludeId),
  ]);
  const limit = settings?.featuredLimit ?? 3;

  if (featuredCount >= limit) {
    return {
      ok: false,
      message: "Controlla i campi evidenziati.",
      fieldErrors: {
        isFeatured: `Puoi mettere in evidenza al massimo ${limit} prodotti.`,
      },
    };
  }

  return null;
}

async function replaceFeatures(
  productId: string,
  features: ProductInput["features"],
) {
  const supabase = await createClient();
  const { error: deleteError } = await supabase
    .from("product_features")
    .delete()
    .eq("product_id", productId);

  if (deleteError) {
    return "Non è stato possibile aggiornare le caratteristiche.";
  }

  if (features.length === 0) {
    return null;
  }

  const { error } = await supabase.from("product_features").insert(
    features.map((feature, index) => ({
      product_id: productId,
      name: feature.name,
      value: feature.value,
      position: index,
    })),
  );

  if (error) {
    return "Non è stato possibile salvare le caratteristiche.";
  }

  return null;
}

async function compactMediaPositions(productId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("product_media")
    .select("id")
    .eq("product_id", productId)
    .order("position");

  if (!data) {
    return;
  }

  for (const [index, item] of data.entries()) {
    await supabase
      .from("product_media")
      .update({ position: index })
      .eq("id", item.id);
  }
}

async function writeAudit(
  action: string,
  entity: string,
  entityId: string | null,
  detail: Record<string, unknown>,
) {
  try {
    const admin = await requireAdmin();
    const supabase = createAdminClient();
    await supabase.from("admin_audit_logs").insert({
      actor_id: admin.userId,
      action,
      entity,
      entity_id: entityId,
      detail,
    });
  } catch (error) {
    console.error("audit log", error);
  }
}
