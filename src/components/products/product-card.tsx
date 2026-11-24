import Link from "next/link";
import { AddToCartButton } from "@/components/products/add-to-cart-button";
import { AvailabilityNote } from "@/components/products/availability-note";
import { ImageCarousel } from "@/components/products/image-carousel";
import { formatPrice } from "@/lib/products/price";
import type { PublishedProduct } from "@/lib/products/types";

export function ProductCard({
  product,
  unavailableMessage,
}: {
  product: PublishedProduct;
  unavailableMessage: string;
}) {
  return (
    <article className="flex flex-col gap-4 rounded-3xl bg-white p-4">
      <ImageCarousel images={product.images} name={product.name} />
      <div className="flex flex-1 flex-col gap-3">
        <div>
          <h2 className="font-serif text-3xl text-ink">
            <Link href={`/prodotti/${product.slug}`}>{product.name}</Link>
          </h2>
          <p className="mt-1 text-lg text-ink">{formatPrice(product.price)}</p>
        </div>
        {product.shortDescription ? (
          <p className="text-sm leading-6 text-stone">{product.shortDescription}</p>
        ) : null}
        <AvailabilityNote
          isAvailable={product.isAvailable}
          noticeEnabled={product.availabilityNoticeEnabled}
          noticeText={product.availabilityNoticeText}
          unavailableMessage={unavailableMessage}
        />
        <div className="mt-auto flex flex-col gap-3 pt-2">
          <Link
            href={`/prodotti/${product.slug}`}
            className="text-sm font-semibold text-ink underline"
          >
            Scopri il prodotto
          </Link>
          <AddToCartButton
            productId={product.id}
            isAvailable={product.isAvailable}
            unavailableMessage={unavailableMessage}
          />
        </div>
      </div>
    </article>
  );
}
