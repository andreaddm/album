"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProductImage } from "@/lib/products/types";

export function ImageCarousel({
  images,
  name,
}: {
  images: ProductImage[];
  name: string;
}) {
  const [index, setIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-sand px-6 text-center">
        <p className="font-serif text-2xl text-ink">{name}</p>
      </div>
    );
  }

  const image = images[index] ?? images[0];

  return (
    <div className="relative">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-sand">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(min-width: 1024px) 30vw, 100vw"
          className="object-cover"
        />
      </div>
      {images.length > 1 ? (
        <div className="mt-3 flex items-center justify-between gap-3">
          <button
            type="button"
            className="rounded-full border border-ink/15 px-3 py-2 text-sm text-ink hover:bg-sand"
            onClick={() =>
              setIndex((current) => (current === 0 ? images.length - 1 : current - 1))
            }
          >
            Precedente
          </button>
          <p className="text-sm text-stone">
            {index + 1} / {images.length}
          </p>
          <button
            type="button"
            className="rounded-full border border-ink/15 px-3 py-2 text-sm text-ink hover:bg-sand"
            onClick={() =>
              setIndex((current) => (current === images.length - 1 ? 0 : current + 1))
            }
          >
            Successiva
          </button>
        </div>
      ) : null}
    </div>
  );
}
