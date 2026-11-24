import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AddToCartButton } from "@/components/products/add-to-cart-button";
import { AvailabilityNote } from "@/components/products/availability-note";
import { ProductGallery } from "@/components/products/product-gallery";
import { formatPrice } from "@/lib/products/price";
import {
  getPublishedProduct,
  getStorePublicSettings,
} from "@/lib/products/queries";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublishedProduct(slug);

  if (!product) {
    return { title: "Prodotto" };
  }

  const description =
    product.shortDescription ??
    `${product.name}, album fotografico vuoto da personalizzare.`;

  return {
    title: product.name,
    description,
    openGraph: {
      title: product.name,
      description,
      images: product.images[0] ? [{ url: product.images[0].src }] : undefined,
    },
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  return (
    <Suspense
      fallback={
        <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
          <p className="text-stone">Caricamento dell&apos;album…</p>
        </main>
      }
    >
      <ProductDetails params={params} />
    </Suspense>
  );
}

async function ProductDetails({ params }: ProductPageProps) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([
    getPublishedProduct(slug),
    getStorePublicSettings(),
  ]);

  if (!product) {
    notFound();
  }

  const unavailableMessage =
    settings?.unavailableMessage?.trim() || "Non disponibile";

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <ProductGallery media={product.media} name={product.name} />
      <div>
        <p className="text-sm text-stone">
          <Link href="/prodotti" className="underline">
            Catalogo
          </Link>
        </p>
        <h1 className="mt-3 font-serif text-5xl text-ink">{product.name}</h1>
        <p className="mt-4 text-2xl text-ink">{formatPrice(product.price)}</p>
        <div className="mt-4">
          <AvailabilityNote
            isAvailable={product.isAvailable}
            noticeEnabled={product.availabilityNoticeEnabled}
            noticeText={product.availabilityNoticeText}
            unavailableMessage={unavailableMessage}
          />
        </div>
        {product.shortDescription ? (
          <p className="mt-6 text-lg leading-8 text-stone">
            {product.shortDescription}
          </p>
        ) : null}
        <div className="mt-8">
          <AddToCartButton
            productId={product.id}
            isAvailable={product.isAvailable}
            unavailableMessage={unavailableMessage}
            withQuantity
          />
        </div>
        <p className="mt-6 text-sm leading-6 text-stone">
          Le spese di spedizione non sono incluse nel prezzo. Il titolare le
          comunica dopo la richiesta, insieme alla consegna in contrassegno.
          L&apos;album arriva vuoto: le fotografie si applicano a casa.
        </p>
      </div>
      {product.description ? (
        <section className="lg:col-span-2">
          <h2 className="font-serif text-3xl text-ink">Descrizione</h2>
          <p className="mt-4 max-w-3xl whitespace-pre-line leading-7 text-ink/85">
            {product.description}
          </p>
        </section>
      ) : null}
      {product.features.length > 0 ? (
        <section className="lg:col-span-2">
          <h2 className="font-serif text-3xl text-ink">Caratteristiche</h2>
          <dl className="mt-4 max-w-3xl divide-y divide-ink/10">
            {product.features.map((feature) => (
              <div
                key={feature.id}
                className="grid gap-1 py-3 sm:grid-cols-[12rem_1fr]"
              >
                <dt className="text-sm text-stone">{feature.name}</dt>
                <dd className="text-ink">{feature.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}
    </main>
  );
}
