export function normalizeWhatsAppNumber(raw: string | null | undefined) {
  if (!raw) {
    return null;
  }

  const digits = raw.replace(/\D/g, "");
  if (digits.length < 8) {
    return null;
  }

  return digits;
}

export function buildWhatsAppUrl(
  rawNumber: string | null | undefined,
  text?: string,
) {
  const number = normalizeWhatsAppNumber(rawNumber);
  if (!number) {
    return null;
  }

  const url = new URL(`https://wa.me/${number}`);
  if (text?.trim()) {
    url.searchParams.set("text", text.trim());
  }

  return url.toString();
}

export function customerRequestWhatsAppText(input: {
  storeName: string;
  referenceCode: string;
  customerFirstName: string;
}) {
  return [
    `Ciao ${input.customerFirstName},`,
    `ti contatto per la richiesta ${input.referenceCode} su ${input.storeName}.`,
    `Possiamo parlare di disponibilità, spedizione e contrassegno?`,
  ].join(" ");
}

export function visitorWhatsAppText(storeName: string) {
  return `Ciao, vorrei informazioni sugli album di ${storeName}.`;
}

export function cartWhatsAppText(
  storeName: string,
  lines: Array<{ name: string; quantity: number }>,
) {
  const items =
    lines.length > 0
      ? lines.map((line) => `- ${line.name} × ${line.quantity}`).join("\n")
      : "- (carrello vuoto)";

  return [
    `Ciao, sto guardando gli album di ${storeName}.`,
    `Mi interessa:`,
    items,
    `Vorrei capire disponibilità e spedizione.`,
  ].join("\n");
}
