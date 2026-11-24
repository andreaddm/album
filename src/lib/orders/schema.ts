import { z } from "zod";
import { MAX_CART_QUANTITY } from "@/lib/cart/constants";

export const purchaseItemSchema = z.object({
  productId: z.uuid(),
  quantity: z.number().int().min(1).max(MAX_CART_QUANTITY),
});

export const purchaseRequestSchema = z.object({
  firstName: z.string().trim().min(1, "Inserisci il nome.").max(80),
  lastName: z.string().trim().min(1, "Inserisci il cognome.").max(80),
  email: z.email("Inserisci un indirizzo email valido."),
  phone: z.string().trim().min(6, "Inserisci un telefono.").max(30),
  street: z.string().trim().min(1, "Inserisci l'indirizzo.").max(120),
  houseNumber: z.string().trim().min(1, "Inserisci il numero civico.").max(16),
  postalCode: z
    .string()
    .trim()
    .regex(/^[0-9]{5}$/, "Il CAP deve avere 5 cifre."),
  city: z.string().trim().min(1, "Inserisci la città.").max(80),
  province: z.string().trim().min(2, "Inserisci la provincia.").max(40),
  notes: z.string().trim().max(1000, "Le note sono troppo lunghe."),
  privacyAccepted: z.literal(true, {
    error: "Prendi visione dell'informativa privacy.",
  }),
  companyFax: z.string().optional(),
  idempotencyKey: z.uuid(),
  items: z
    .array(purchaseItemSchema)
    .min(1, "Il carrello è vuoto.")
    .max(20)
    .superRefine((items, context) => {
      const seen = new Set<string>();
      items.forEach((item, index) => {
        if (seen.has(item.productId)) {
          context.addIssue({
            code: "custom",
            message: "Prodotto ripetuto.",
            path: [index, "productId"],
          });
        }
        seen.add(item.productId);
      });
    }),
});

export type PurchaseRequestInput = z.infer<typeof purchaseRequestSchema>;

export function fieldErrorsFromSchema(error: z.ZodError) {
  const fields: Record<string, string> = {};

  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !fields[key]) {
      fields[key] = issue.message;
    }
  }

  return fields;
}
