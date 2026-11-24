import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { EmailRetryActions } from "@/components/admin/email-retry-actions";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { WhatsAppLink } from "@/components/layout/whatsapp-link";
import { ButtonLink } from "@/components/ui/button";
import {
  getAdminOrder,
  listEmailLogsForOrder,
} from "@/lib/orders/admin";
import {
  ORDER_STATUS_LABELS,
  formatAdminDateTime,
} from "@/lib/orders/status";
import { formatPrice } from "@/lib/products/price";
import { getAdminStoreSettings } from "@/lib/settings/admin";
import { customerRequestWhatsAppText } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Dettaglio richiesta",
  robots: { index: false, follow: false },
};

export default function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <main>
          <p className="text-stone">Caricamento richiesta…</p>
        </main>
      }
    >
      <OrderDetails params={params} />
    </Suspense>
  );
}

async function OrderDetails({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  const [order, emailLogs, settings] = await Promise.all([
    getAdminOrder(id),
    listEmailLogsForOrder(id),
    getAdminStoreSettings(),
  ]);

  if (!order) {
    notFound();
  }

  const storeName = settings?.storeName?.trim() || "Album";

  return (
    <main className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-5xl text-ink">{order.referenceCode}</h1>
          <p className="mt-3 text-stone">
            Ricevuta il {formatAdminDateTime(order.createdAt)} ·{" "}
            {ORDER_STATUS_LABELS[order.status]}
          </p>
        </div>
        <ButtonLink href="/admin/richieste" variant="secondary">
          Torna all&apos;elenco
        </ButtonLink>
      </div>

      <OrderStatusForm orderId={order.id} status={order.status} />

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-3">
          <h2 className="font-serif text-3xl text-ink">Cliente</h2>
          <p>
            {order.customerFirstName} {order.customerLastName}
          </p>
          <p>
            <a className="underline" href={`mailto:${order.email}`}>
              {order.email}
            </a>
          </p>
          <p>
            <a className="underline" href={`tel:${order.phone}`}>
              {order.phone}
            </a>
          </p>
          <WhatsAppLink
            number={order.phone}
            text={customerRequestWhatsAppText({
              storeName,
              referenceCode: order.referenceCode,
              customerFirstName: order.customerFirstName,
            })}
            className="inline-flex text-sm text-terracotta underline"
          >
            Contatta su WhatsApp
          </WhatsAppLink>
        </div>
        <div className="space-y-3">
          <h2 className="font-serif text-3xl text-ink">Spedizione</h2>
          <p>
            {order.street} {order.houseNumber}
          </p>
          <p>
            {order.postalCode} {order.city} ({order.province})
          </p>
        </div>
      </section>

      {order.notes ? (
        <section className="space-y-3">
          <h2 className="font-serif text-3xl text-ink">Note cliente</h2>
          <p className="whitespace-pre-wrap leading-7 text-ink">{order.notes}</p>
        </section>
      ) : null}

      <section className="space-y-4">
        <h2 className="font-serif text-3xl text-ink">Prodotti</h2>
        <ul className="divide-y divide-ink/10 border-y border-ink/10">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-4 py-3">
              <div>
                <p className="text-ink">{item.productName}</p>
                <p className="text-sm text-stone">
                  {formatPrice(item.unitPrice)} × {item.quantity}
                </p>
              </div>
              <p>{formatPrice(item.lineTotal)}</p>
            </li>
          ))}
        </ul>
        <p className="flex justify-between text-lg">
          <span>Totale prodotti</span>
          <span>{formatPrice(order.productsTotal)}</span>
        </p>
        <p className="text-sm text-stone">Spedizione esclusa.</p>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-3xl text-ink">Log email</h2>
        <EmailRetryActions orderId={order.id} />
        {emailLogs.length === 0 ? (
          <p className="text-sm text-stone">
            Nessuna email registrata per questa richiesta.
          </p>
        ) : (
          <ul className="divide-y divide-ink/10 border-y border-ink/10">
            {emailLogs.map((log) => (
              <li key={log.id} className="py-3 text-sm">
                <p className="text-ink">
                  {formatAdminDateTime(log.createdAt)} · {templateLabel(log.template)} ·{" "}
                  {statusLabel(log.status)}
                </p>
                <p className="text-stone">{log.recipient}</p>
                {log.error ? (
                  <p className="text-terracotta">{log.error}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function templateLabel(template: "owner_notification" | "customer_receipt") {
  return template === "owner_notification"
    ? "Notifica titolare"
    : "Ricevuta cliente";
}

function statusLabel(status: "pending" | "sent" | "failed") {
  if (status === "sent") {
    return "inviata";
  }
  if (status === "failed") {
    return "fallita";
  }
  return "in corso";
}
