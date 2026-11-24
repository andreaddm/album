import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { formatPrice } from "@/lib/products/price";
import { listAdminProducts } from "@/lib/products/admin";

export const metadata: Metadata = {
  title: "Prodotti",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{
  q?: string;
  published?: string;
  available?: string;
}>;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const published =
    params.published === "yes" || params.published === "no"
      ? params.published
      : "all";
  const available =
    params.available === "yes" || params.available === "no"
      ? params.available
      : "all";

  const products = await listAdminProducts({ q, published, available });

  return (
    <main className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-5xl text-ink">Prodotti</h1>
          <p className="mt-3 text-stone">
            Cerca, filtra e apri un album per modificarlo.
          </p>
        </div>
        <ButtonLink href="/admin/prodotti/nuovo">Nuovo prodotto</ButtonLink>
      </div>

      <form className="grid gap-3 rounded-3xl bg-sand/50 p-5 sm:grid-cols-4">
        <label className="block text-sm text-ink sm:col-span-2">
          Cerca
          <input
            name="q"
            defaultValue={q}
            placeholder="Nome prodotto"
            className="mt-2 w-full rounded-full border border-ink/20 bg-ivory px-3 py-2"
          />
        </label>
        <label className="block text-sm text-ink">
          Pubblicazione
          <select
            name="published"
            defaultValue={published}
            className="mt-2 w-full rounded-full border border-ink/20 bg-ivory px-3 py-2"
          >
            <option value="all">Tutti</option>
            <option value="yes">Pubblicati</option>
            <option value="no">Bozze</option>
          </select>
        </label>
        <label className="block text-sm text-ink">
          Disponibilità
          <select
            name="available"
            defaultValue={available}
            className="mt-2 w-full rounded-full border border-ink/20 bg-ivory px-3 py-2"
          >
            <option value="all">Tutti</option>
            <option value="yes">Disponibili</option>
            <option value="no">Non disponibili</option>
          </select>
        </label>
        <div className="sm:col-span-4">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full bg-ink-button px-5 py-3 text-sm font-semibold text-ivory"
          >
            Filtra
          </button>
        </div>
      </form>

      {products.length === 0 ? (
        <p className="text-stone">Nessun prodotto corrisponde ai filtri.</p>
      ) : (
        <ul className="divide-y divide-ink/10 border-y border-ink/10">
          {products.map((product) => (
            <li key={product.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <Link
                  href={`/admin/prodotti/${product.id}`}
                  className="font-serif text-2xl text-ink hover:underline"
                >
                  {product.name}
                </Link>
                <p className="mt-1 text-sm text-stone">
                  {formatPrice(product.price)} · {product.slug} ·{" "}
                  {product.isPublished ? "Pubblicato" : "Bozza"} ·{" "}
                  {product.isAvailable ? "Disponibile" : "Non disponibile"}
                  {product.availabilityNoticeEnabled ? " · Scorte limitate" : ""}
                </p>
              </div>
              <ButtonLink
                href={`/admin/prodotti/${product.id}`}
                variant="secondary"
                className="px-4 py-2"
              >
                Modifica
              </ButtonLink>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
