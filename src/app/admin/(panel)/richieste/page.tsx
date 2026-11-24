import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { ButtonLink } from "@/components/ui/button";
import { listAdminOrders } from "@/lib/orders/admin";
import { formatPrice } from "@/lib/products/price";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  formatAdminDateTime,
  isOrderStatus,
} from "@/lib/orders/status";

export const metadata: Metadata = {
  title: "Richieste",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{
  q?: string;
  status?: string;
  from?: string;
  to?: string;
}>;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await connection();
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const status =
    params.status && isOrderStatus(params.status) ? params.status : "all";
  const from = params.from?.trim() ?? "";
  const to = params.to?.trim() ?? "";

  const orders = await listAdminOrders({
    q,
    status,
    from: from || undefined,
    to: to || undefined,
  });

  return (
    <main className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-5xl text-ink">Richieste</h1>
          <p className="mt-3 text-stone">
            Non sono ordini confermati finché non le gestisci tu.
          </p>
        </div>
        <ButtonLink href="/admin" variant="secondary">
          Panoramica
        </ButtonLink>
      </div>

      <form className="grid gap-3 rounded-3xl bg-sand/50 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block text-sm text-ink lg:col-span-2">
          Cerca
          <input
            name="q"
            defaultValue={q}
            placeholder="Codice, email o nome"
            className="mt-2 w-full rounded-full border border-ink/20 bg-ivory px-3 py-2"
          />
        </label>
        <label className="block text-sm text-ink">
          Stato
          <select
            name="status"
            defaultValue={status}
            className="mt-2 w-full rounded-full border border-ink/20 bg-ivory px-3 py-2"
          >
            <option value="all">Tutti</option>
            {ORDER_STATUSES.map((item) => (
              <option key={item} value={item}>
                {ORDER_STATUS_LABELS[item]}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-ink">
          Dal
          <input
            name="from"
            type="date"
            defaultValue={from}
            className="mt-2 w-full rounded-full border border-ink/20 bg-ivory px-3 py-2"
          />
        </label>
        <label className="block text-sm text-ink">
          Al
          <input
            name="to"
            type="date"
            defaultValue={to}
            className="mt-2 w-full rounded-full border border-ink/20 bg-ivory px-3 py-2"
          />
        </label>
        <div className="lg:col-span-4">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full bg-ink-button px-5 py-3 text-sm font-semibold text-ivory"
          >
            Filtra
          </button>
        </div>
      </form>

      {orders.length === 0 ? (
        <p className="text-stone">Nessuna richiesta corrisponde ai filtri.</p>
      ) : (
        <ul className="divide-y divide-ink/10 border-y border-ink/10">
          {orders.map((order) => (
            <li
              key={order.id}
              className="flex flex-wrap items-center justify-between gap-3 py-4"
            >
              <div>
                <Link
                  href={`/admin/richieste/${order.id}`}
                  className="font-serif text-2xl text-ink hover:underline"
                >
                  {order.referenceCode}
                </Link>
                <p className="mt-1 text-sm text-stone">
                  {formatAdminDateTime(order.createdAt)} ·{" "}
                  {order.customerFirstName} {order.customerLastName} ·{" "}
                  {order.email} · {ORDER_STATUS_LABELS[order.status]} ·{" "}
                  {formatPrice(order.productsTotal)}
                </p>
              </div>
              <ButtonLink
                href={`/admin/richieste/${order.id}`}
                variant="secondary"
                className="px-4 py-2"
              >
                Apri
              </ButtonLink>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
