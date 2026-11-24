import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/product-form";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Nuovo prodotto",
  robots: { index: false, follow: false },
};

export default function NewProductPage() {
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
      <ProductForm />
    </main>
  );
}
