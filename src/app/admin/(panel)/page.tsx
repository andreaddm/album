import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { ButtonLink } from "@/components/ui/button";
import {
  countOrdersByStatus,
  listRecentAdminOrders,
} from "@/lib/orders/admin";
import {
  ORDER_STATUS_LABELS,
  formatAdminDateTime,
} from "@/lib/orders/status";
import { listAdminProducts } from "@/lib/products/admin";
import { formatPrice } from "@/lib/products/price";

export const metadata: Metadata = {
  title: "Amministrazione",
  robots: { index: false, follow: false },
};

export default async function AdminHomePage() {
  await connection();
  const [products, recentOrders, statusCounts] = await Promise.all([
    listAdminProducts(),
    listRecentAdminOrders(5),
    countOrdersByStatus(),
  ]);

  const published = products.filter((product) => product.isPublished).length;
  const newRequests = statusCounts.new + statusCounts.to_contact;

  return (
    <main className="space-y-10">
      <div>
        <h1 className="font-serif text-5xl text-ink">Panoramica</h1>
        <p className="mt-3 text-stone">
          Scorciatoie su catalogo, richieste e impostazioni del negozio.
        </p>
      </div>

      <dl className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl bg-sand/70 p-5">
          <dt className="text-sm text-stone">Prodotti</dt>
          <dd className="mt-2 font-serif text-4xl text-ink">{products.length}</dd>
          <dd className="mt-1 text-sm text-stone">{published} pubblicati</dd>
        </div>
        <div className="rounded-3xl bg-sand/70 p-5">
          <dt className="text-sm text-stone">Da gestire</dt>
          <dd className="mt-2 font-serif text-4xl text-ink">{newRequests}</dd>
          <dd className="mt-1 text-sm text-stone">
            nuove o da contattare
          </dd>
        </div>
        <div className="rounded-3xl bg-sand/70 p-5">
          <dt className="text-sm text-stone">Richieste totali</dt>
          <dd className="mt-2 font-serif text-4xl text-ink">
            {Object.values(statusCounts).reduce((sum, value) => sum + value, 0)}
          </dd>
        </div>
      </dl>

      <div className="flex flex-wrap gap-3">
        <ButtonLink href="/admin/richieste">Vai alle richieste</ButtonLink>
        <ButtonLink href="/admin/prodotti" variant="secondary">
          Prodotti
        </ButtonLink>
        <ButtonLink href="/admin/impostazioni" variant="secondary">
          Impostazioni
        </ButtonLink>
      </div>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-serif text-3xl text-ink">Richieste recenti</h2>
          <Link href="/admin/richieste" className="text-sm text-terracotta underline">
            Vedi tutte
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-stone">Nessuna richiesta ricevuta.</p>
        ) : (
          <ul className="divide-y divide-ink/10 border-y border-ink/10">
            {recentOrders.map((order) => (
              <li key={order.id} className="flex flex-wrap justify-between gap-3 py-3">
                <div>
                  <Link
                    href={`/admin/richieste/${order.id}`}
                    className="text-ink hover:underline"
                  >
                    {order.referenceCode}
                  </Link>
                  <p className="text-sm text-stone">
                    {formatAdminDateTime(order.createdAt)} ·{" "}
                    {order.customerFirstName} {order.customerLastName} ·{" "}
                    {ORDER_STATUS_LABELS[order.status]}
                  </p>
                </div>
                <p className="text-sm text-ink">{formatPrice(order.productsTotal)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
