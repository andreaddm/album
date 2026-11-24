import { formatPrice } from "@/lib/products/price";
import { formatAdminDateTime } from "@/lib/orders/status";

export type EmailOrderItem = {
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type EmailOrderContext = {
  storeName: string;
  referenceCode: string;
  createdAt: string;
  customerFirstName: string;
  customerLastName: string;
  email: string;
  phone: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  province: string;
  notes: string | null;
  productsTotal: number;
  items: EmailOrderItem[];
  siteUrl: string;
};

export function ownerNotificationEmail(context: EmailOrderContext) {
  const subject = `[${context.storeName}] Nuova richiesta ${context.referenceCode}`;
  const text = [
    `È arrivata una nuova richiesta d'acquisto.`,
    ``,
    `Codice: ${context.referenceCode}`,
    `Data: ${formatAdminDateTime(context.createdAt)}`,
    `Cliente: ${context.customerFirstName} ${context.customerLastName}`,
    `Email: ${context.email}`,
    `Telefono: ${context.phone}`,
    `Indirizzo: ${context.street} ${context.houseNumber}, ${context.postalCode} ${context.city} (${context.province})`,
    context.notes ? `Note: ${context.notes}` : null,
    ``,
    `Prodotti:`,
    ...context.items.map(
      (item) =>
        `- ${item.productName} × ${item.quantity} = ${formatPrice(item.lineTotal)}`,
    ),
    `Totale prodotti (spedizione esclusa): ${formatPrice(context.productsTotal)}`,
    ``,
    `Questa non è ancora una conferma d'ordine. Contatta il cliente per disponibilità, spedizione e contrassegno.`,
    context.siteUrl ? `Apri in admin: ${context.siteUrl}/admin/richieste` : null,
  ]
    .filter((line) => line !== null)
    .join("\n");

  const html = `
    <p>È arrivata una nuova <strong>richiesta d'acquisto</strong>.</p>
    <p><strong>Codice:</strong> ${escapeHtml(context.referenceCode)}<br/>
    <strong>Data:</strong> ${escapeHtml(formatAdminDateTime(context.createdAt))}</p>
    <p><strong>Cliente:</strong> ${escapeHtml(context.customerFirstName)} ${escapeHtml(context.customerLastName)}<br/>
    <strong>Email:</strong> ${escapeHtml(context.email)}<br/>
    <strong>Telefono:</strong> ${escapeHtml(context.phone)}<br/>
    <strong>Indirizzo:</strong> ${escapeHtml(`${context.street} ${context.houseNumber}, ${context.postalCode} ${context.city} (${context.province})`)}</p>
    ${context.notes ? `<p><strong>Note:</strong> ${escapeHtml(context.notes)}</p>` : ""}
    <p><strong>Prodotti</strong></p>
    <ul>
      ${context.items
        .map(
          (item) =>
            `<li>${escapeHtml(item.productName)} × ${item.quantity} — ${escapeHtml(formatPrice(item.lineTotal))}</li>`,
        )
        .join("")}
    </ul>
    <p><strong>Totale prodotti (spedizione esclusa):</strong> ${escapeHtml(formatPrice(context.productsTotal))}</p>
    <p>Questa non è ancora una conferma d'ordine. Contatta il cliente per disponibilità, spedizione e contrassegno.</p>
  `;

  return { subject, text, html };
}

export function customerReceiptEmail(context: EmailOrderContext) {
  const subject = `${context.storeName}: richiesta ${context.referenceCode} ricevuta`;
  const text = [
    `Ciao ${context.customerFirstName},`,
    ``,
    `abbiamo ricevuto la tua richiesta d'acquisto. Non è ancora un ordine confermato.`,
    ``,
    `Codice richiesta: ${context.referenceCode}`,
    `Data: ${formatAdminDateTime(context.createdAt)}`,
    ``,
    `Riepilogo:`,
    ...context.items.map(
      (item) =>
        `- ${item.productName} × ${item.quantity} = ${formatPrice(item.lineTotal)}`,
    ),
    `Totale prodotti (spedizione esclusa): ${formatPrice(context.productsTotal)}`,
    ``,
    `Il titolare ti contatterà per disponibilità, spedizione e pagamento in contrassegno.`,
    `Se non hai inviato tu questa richiesta, ignora pure questo messaggio.`,
  ].join("\n");

  const html = `
    <p>Ciao ${escapeHtml(context.customerFirstName)},</p>
    <p>abbiamo ricevuto la tua <strong>richiesta d'acquisto</strong>. <strong>Non è ancora un ordine confermato</strong>.</p>
    <p><strong>Codice richiesta:</strong> ${escapeHtml(context.referenceCode)}<br/>
    <strong>Data:</strong> ${escapeHtml(formatAdminDateTime(context.createdAt))}</p>
    <p><strong>Riepilogo</strong></p>
    <ul>
      ${context.items
        .map(
          (item) =>
            `<li>${escapeHtml(item.productName)} × ${item.quantity} — ${escapeHtml(formatPrice(item.lineTotal))}</li>`,
        )
        .join("")}
    </ul>
    <p><strong>Totale prodotti (spedizione esclusa):</strong> ${escapeHtml(formatPrice(context.productsTotal))}</p>
    <p>Il titolare ti contatterà per disponibilità, spedizione e pagamento in contrassegno.</p>
    <p>Se non hai inviato tu questa richiesta, ignora pure questo messaggio.</p>
  `;

  return { subject, text, html };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
