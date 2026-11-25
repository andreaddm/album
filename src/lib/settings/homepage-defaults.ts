export type HomepageCopyItem = {
  title: string;
  text: string;
};

export const DEFAULT_HOMEPAGE_EYEBROW = "Album fotografici";
export const DEFAULT_HOMEPAGE_CTA_CATALOG = "Vai al catalogo";
export const DEFAULT_HOMEPAGE_CTA_HOW = "Come funziona";
export const DEFAULT_HOMEPAGE_FEATURED_TITLE = "In evidenza";
export const DEFAULT_HOMEPAGE_HOW_TITLE = "Come funziona";
export const DEFAULT_HOMEPAGE_WHY_TITLE = "Perché questi album";
export const DEFAULT_HOMEPAGE_WHY_CTA = "Sfoglia il catalogo";

export const DEFAULT_HOMEPAGE_HOW_STEPS: HomepageCopyItem[] = [
  {
    title: "Scegli l'album",
    text: "Sfoglia il catalogo e aggiungi al carrello gli album vuoti che ti interessano.",
  },
  {
    title: "Invia la richiesta",
    text: "Lascia i tuoi recapiti e l'indirizzo. Non è un ordine confermato e non c'è pagamento online.",
  },
  {
    title: "Ti contattiamo",
    text: "Il titolare verifica disponibilità, spese di spedizione e consegna in contrassegno.",
  },
  {
    title: "Personalizzi a casa",
    text: "Ricevi l'album vuoto e incolli le tue fotografie. Il sito non chiede di caricarle.",
  },
];

export const DEFAULT_HOMEPAGE_WHY_ITEMS: HomepageCopyItem[] = [
  {
    title: "Album vuoti",
    text: "Le fotografie restano tue. Il sito non chiede di caricarle.",
  },
  {
    title: "Nessun pagamento online",
    text: "Invii una richiesta. L'acquisto si conferma solo dopo il contatto.",
  },
  {
    title: "Spedizione da concordare",
    text: "Il prezzo in pagina è solo quello dei prodotti, senza spedizione.",
  },
];

export const MAX_HOMEPAGE_HOW_STEPS = 8;
export const MIN_HOMEPAGE_HOW_STEPS = 1;
export const MAX_HOMEPAGE_WHY_ITEMS = 6;
export const MIN_HOMEPAGE_WHY_ITEMS = 1;

function parseCopyItem(
  raw: unknown,
  fallback?: HomepageCopyItem,
): HomepageCopyItem | null {
  if (!raw || typeof raw !== "object") {
    return fallback ? { ...fallback } : null;
  }

  const item = raw as Record<string, unknown>;
  const title =
    typeof item.title === "string" && item.title.trim()
      ? item.title.trim()
      : fallback?.title;
  const text =
    typeof item.text === "string" && item.text.trim()
      ? item.text.trim()
      : fallback?.text;

  if (!title || !text) {
    return fallback ? { ...fallback } : null;
  }

  return { title, text };
}

/** Lista variabile (passi Come funziona / motivi Perché). */
export function normalizeVariableCopyItems(
  value: unknown,
  fallback: HomepageCopyItem[],
  limits: { min: number; max: number } = {
    min: MIN_HOMEPAGE_HOW_STEPS,
    max: MAX_HOMEPAGE_HOW_STEPS,
  },
): HomepageCopyItem[] {
  if (!Array.isArray(value) || value.length === 0) {
    return fallback.map((item) => ({ ...item }));
  }

  const items = value
    .map((raw) => parseCopyItem(raw))
    .filter((item): item is HomepageCopyItem => item !== null)
    .slice(0, limits.max);

  if (items.length < limits.min) {
    return fallback.map((item) => ({ ...item }));
  }

  return items;
}
