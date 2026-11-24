export const PRODUCT_IMAGES_BUCKET = "product-images";
export const MAX_PRODUCT_IMAGE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export function extensionForMime(mime: string) {
  if (mime === "image/jpeg") {
    return "jpg";
  }
  if (mime === "image/png") {
    return "png";
  }
  if (mime === "image/webp") {
    return "webp";
  }
  return null;
}

export function productImagePath(productId: string, mime: string) {
  const extension = extensionForMime(mime);
  if (!extension) {
    return null;
  }

  return `${productId}/${crypto.randomUUID()}.${extension}`;
}

export function publicImageUrl(storagePath: string, baseUrl: string) {
  const encoded = storagePath
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

  return `${baseUrl}/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/${encoded}`;
}
