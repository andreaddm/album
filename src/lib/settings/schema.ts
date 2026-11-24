import { z } from "zod";

export const storeSettingsSchema = z.object({
  storeName: z.string().trim().min(1, "Inserisci il nome del negozio.").max(120),
  notificationEmail: z
    .union([z.literal(""), z.email("Inserisci un'email valida.")])
    .transform((value) => (value === "" ? null : value)),
  whatsappNumber: z
    .string()
    .trim()
    .max(30, "Il numero è troppo lungo.")
    .regex(/^$|^[+0-9\s()-]{6,30}$/, "Inserisci un numero WhatsApp valido.")
    .transform((value) => (value === "" ? null : value)),
  homepageIntro: z
    .string()
    .trim()
    .max(1000, "Il testo è troppo lungo.")
    .transform((value) => (value === "" ? null : value)),
  unavailableMessage: z
    .string()
    .trim()
    .max(160, "Il messaggio è troppo lungo.")
    .transform((value) => (value === "" ? null : value)),
});

export type StoreSettingsInput = z.infer<typeof storeSettingsSchema>;

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
