import { z } from "zod";
import { isValidSlug } from "@/lib/products/slug";

export const productFeatureInputSchema = z.object({
  name: z.string().trim().min(1, "Inserisci il nome della caratteristica.").max(80),
  value: z.string().trim().min(1, "Inserisci il valore.").max(200),
});

export const productInputSchema = z.object({
  name: z.string().trim().min(1, "Inserisci il nome.").max(120),
  slug: z
    .string()
    .trim()
    .min(1, "Inserisci il link prodotto.")
    .max(120)
    .refine(
      isValidSlug,
      "Il link prodotto può contenere solo lettere minuscole, numeri e trattini.",
    ),
  price: z
    .number({ error: "Inserisci un prezzo valido." })
    .finite()
    .min(0, "Il prezzo non può essere negativo.")
    .max(999999.99, "Il prezzo è troppo alto."),
  shortDescription: z.string().trim().max(280).nullable(),
  description: z.string().trim().max(8000).nullable(),
  isPublished: z.boolean(),
  isAvailable: z.boolean(),
  isFeatured: z.boolean(),
  availabilityNoticeEnabled: z.boolean(),
  availabilityNoticeText: z.string().trim().max(160).nullable(),
  features: z.array(productFeatureInputSchema).max(30),
});

export type ProductInput = z.infer<typeof productInputSchema>;

export function fieldErrorsFromSchema(error: z.ZodError) {
  const fields: Record<string, string> = {};

  for (const issue of error.issues) {
    const key = issue.path
      .map((part) => (typeof part === "number" ? String(part) : part))
      .join(".");
    if (key && !fields[key]) {
      fields[key] = issue.message;
    }
  }

  return fields;
}
