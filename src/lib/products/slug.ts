const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugifyName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function isValidSlug(slug: string) {
  return SLUG_PATTERN.test(slug);
}

export async function uniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>,
) {
  const root = isValidSlug(base) ? base : slugifyName(base) || "prodotto";
  let candidate = root;
  let index = 2;

  while (await exists(candidate)) {
    candidate = `${root}-${index}`;
    index += 1;
  }

  return candidate;
}
