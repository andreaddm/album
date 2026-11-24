import type { Metadata } from "next";
import { ProductCard } from "@/components/products/product-card";
import {
  getStorePublicSettings,
  listPublishedProducts,
} from "@/lib/products/queries";

export const metadata: Metadata = {
  title: "Catalogo",
  description: "Album fotografici vuoti da personalizzare.",
};

export default async function ProductsPage() {
  const [products, settings] = await Promise.all([
    listPublishedProducts(),
    getStorePublicSettings(),
  ]);
  const unavailableMessage =
    settings?.unavailableMessage?.trim() || "Non disponibile";

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6">
      <h1 className="font-serif text-5xl text-ink">Catalogo</h1>
      <p className="mt-4 max-w-2xl leading-7 text-stone">
        Album vuoti. Un prodotto non disponibile resta visibile, ma non si
        può aggiungere al carrello.
      </p>
      {products.length === 0 ? (
        <p className="mt-10 text-ink">Nessun album pubblicato.</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              unavailableMessage={unavailableMessage}
            />
          ))}
        </div>
      )}
    </main>
  );
}
