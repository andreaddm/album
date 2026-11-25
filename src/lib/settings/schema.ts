import { z } from "zod";
import {
  MAX_HOMEPAGE_HOW_STEPS,
  MAX_HOMEPAGE_WHY_ITEMS,
  MIN_HOMEPAGE_HOW_STEPS,
  MIN_HOMEPAGE_WHY_ITEMS,
} from "@/lib/settings/homepage-defaults";

const homepageCopyItemSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Inserisci il titolo.")
    .max(80, "Il titolo è troppo lungo."),
  text: z
    .string()
    .trim()
    .min(1, "Inserisci il testo.")
    .max(400, "Il testo è troppo lungo."),
});

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
  homepageHeadline: z
    .string()
    .trim()
    .max(160, "Il titolo è troppo lungo.")
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
  featuredLimit: z.coerce
    .number()
    .refine((value) => value === 3 || value === 6 || value === 9, {
      message: "Scegli 3, 6 o 9 album in evidenza.",
    }),
  homepageEyebrow: z
    .string()
    .trim()
    .max(80, "Il testo è troppo lungo.")
    .transform((value) => (value === "" ? null : value)),
  homepageCtaCatalog: z
    .string()
    .trim()
    .max(60, "Il testo del pulsante è troppo lungo.")
    .transform((value) => (value === "" ? null : value)),
  homepageCtaHow: z
    .string()
    .trim()
    .max(60, "Il testo del pulsante è troppo lungo.")
    .transform((value) => (value === "" ? null : value)),
  homepageFeaturedTitle: z
    .string()
    .trim()
    .max(80, "Il titolo è troppo lungo.")
    .transform((value) => (value === "" ? null : value)),
  homepageHowTitle: z
    .string()
    .trim()
    .max(80, "Il titolo è troppo lungo.")
    .transform((value) => (value === "" ? null : value)),
  homepageHowSteps: z
    .array(homepageCopyItemSchema)
    .min(MIN_HOMEPAGE_HOW_STEPS, "Aggiungi almeno un passo.")
    .max(MAX_HOMEPAGE_HOW_STEPS, `Puoi aggiungere al massimo ${MAX_HOMEPAGE_HOW_STEPS} passi.`),
  homepageWhyTitle: z
    .string()
    .trim()
    .max(80, "Il titolo è troppo lungo.")
    .transform((value) => (value === "" ? null : value)),
  homepageWhyItems: z
    .array(homepageCopyItemSchema)
    .min(MIN_HOMEPAGE_WHY_ITEMS, "Aggiungi almeno un motivo.")
    .max(MAX_HOMEPAGE_WHY_ITEMS, `Puoi aggiungere al massimo ${MAX_HOMEPAGE_WHY_ITEMS} motivi.`),
  homepageWhyCta: z
    .string()
    .trim()
    .max(60, "Il testo del pulsante è troppo lungo.")
    .transform((value) => (value === "" ? null : value)),
  privacyTitle: z
    .string()
    .trim()
    .max(120, "Il titolo è troppo lungo.")
    .transform((value) => (value === "" ? null : value)),
  privacyBody: z
    .string()
    .trim()
    .max(20000, "Il testo è troppo lungo.")
    .transform((value) => (value === "" ? null : value)),
  cookieTitle: z
    .string()
    .trim()
    .max(120, "Il titolo è troppo lungo.")
    .transform((value) => (value === "" ? null : value)),
  cookieBody: z
    .string()
    .trim()
    .max(20000, "Il testo è troppo lungo.")
    .transform((value) => (value === "" ? null : value)),
  aboutTitle: z
    .string()
    .trim()
    .max(120, "Il titolo è troppo lungo.")
    .transform((value) => (value === "" ? null : value)),
  aboutBody: z
    .string()
    .trim()
    .max(20000, "Il testo è troppo lungo.")
    .transform((value) => (value === "" ? null : value)),
});

export type StoreSettingsInput = z.infer<typeof storeSettingsSchema>;

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
