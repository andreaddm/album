import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductActions } from "@/components/admin/product-actions";
import { ProductForm } from "@/components/admin/product-form";
import { ProductMediaPanel } from "@/components/admin/product-media-panel";
import { ButtonLink } from "@/components/ui/button";
import { getAdminProduct } from "@/lib/products/admin";

export const metadata: Metadata = {
  title: "Modifica prodotto",
  robots: { index: false, follow: false },
};

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <main>
          <p className="text-stone">Caricamento prodotto…</p>
        </main>
      }
    >
      <EditProductDetails params={params} />
    </Suspense>
  );
}

async function EditProductDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getAdminProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <main className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-5xl text-ink">{product.name}</h1>
          <p className="mt-3 text-stone">
            Aggiornato il{" "}
            {new Intl.DateTimeFormat("it-IT", {
              dateStyle: "medium",
              timeStyle: "short",
              timeZone: "Europe/Rome",
            }).format(new Date(product.updatedAt))}
          </p>
        </div>
        <ButtonLink href="/admin/prodotti" variant="secondary">
          Torna all&apos;elenco
        </ButtonLink>
      </div>

      <ProductActions
        productId={product.id}
        productName={product.name}
        slug={product.slug}
        isPublished={product.isPublished}
      />

      <ProductForm
        productId={product.id}
        initial={{
          name: product.name,
          slug: product.slug,
          price: String(product.price),
          shortDescription: product.shortDescription ?? "",
          description: product.description ?? "",
          isPublished: product.isPublished,
          isAvailable: product.isAvailable,
          availabilityNoticeEnabled: product.availabilityNoticeEnabled,
          availabilityNoticeText: product.availabilityNoticeText ?? "",
          features: product.features.map((feature) => ({
            name: feature.name,
            value: feature.value,
          })),
        }}
      />

      <ProductMediaPanel productId={product.id} media={product.media} />
    </main>
  );
}
