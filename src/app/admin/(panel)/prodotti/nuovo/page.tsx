import type { Metadata } from "next";
import { connection } from "next/server";
import { ProductForm } from "@/components/admin/product-form";
import { ButtonLink } from "@/components/ui/button";
import { countFeaturedProducts } from "@/lib/products/admin";
import { getAdminStoreSettings } from "@/lib/settings/admin";

export const metadata: Metadata = {
  title: "Nuovo prodotto",
  robots: { index: false, follow: false },
};

export default async function NewProductPage() {
  await connection();
  const [settings, otherFeaturedCount] = await Promise.all([
    getAdminStoreSettings(),
    countFeaturedProducts(),
  ]);
  const featuredLimit = settings?.featuredLimit ?? 3;

  return (
    <main className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-5xl text-ink">Nuovo prodotto</h1>
          <p className="mt-3 text-stone">
            Dopo la creazione potrai caricare immagini e video.
          </p>
        </div>
        <ButtonLink href="/admin/prodotti" variant="secondary">
          Torna all&apos;elenco
        </ButtonLink>
      </div>
      <ProductForm
        featuredLimit={featuredLimit}
        otherFeaturedCount={otherFeaturedCount}
      />
    </main>
  );
}
