"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProductMedia } from "@/lib/products/types";

export function ProductGallery({
  media,
  name,
}: {
  media: ProductMedia[];
  name: string;
}) {
  const [index, setIndex] = useState(0);
  const [showEmbed, setShowEmbed] = useState(false);
  const current = media[index];

  if (!current) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-3xl bg-sand px-6 text-center">
        <p className="font-serif text-3xl text-ink">{name}</p>
      </div>
    );
  }

  function show(nextIndex: number) {
    setIndex(nextIndex);
    setShowEmbed(false);
  }

  return (
    <div
      className="space-y-3"
      onKeyDown={(event) => {
        if (media.length < 2) {
          return;
        }
        if (event.key === "ArrowLeft") {
          show(index === 0 ? media.length - 1 : index - 1);
        }
        if (event.key === "ArrowRight") {
          show(index === media.length - 1 ? 0 : index + 1);
        }
      }}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-sand">
        {current.kind === "image" ? (
          <Image
            src={current.src}
            alt={current.alt}
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="font-serif text-3xl text-ink">Video</p>
            {showEmbed && current.embedUrl ? (
              <iframe
                className="absolute inset-0 h-full w-full"
                src={current.embedUrl}
                title={`Video di ${name}`}
                allow="fullscreen; picture-in-picture"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            ) : (
              <>
                {current.embedUrl ? (
                  <button
                    type="button"
                    className="rounded-full bg-ink-button px-5 py-3 text-sm font-semibold text-ivory"
                    onClick={() => setShowEmbed(true)}
                  >
                    Guarda il video
                  </button>
                ) : null}
                <a
                  className="text-sm text-ink underline"
                  href={current.watchUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Apri il video
                </a>
              </>
            )}
          </div>
        )}
      </div>
      {media.length > 1 ? (
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="rounded-full border border-ink/15 px-3 py-2 text-sm"
            onClick={() => show(index === 0 ? media.length - 1 : index - 1)}
          >
            Precedente
          </button>
          <p className="text-sm text-stone">
            {index + 1} / {media.length}
          </p>
          <button
            type="button"
            className="rounded-full border border-ink/15 px-3 py-2 text-sm"
            onClick={() => show(index === media.length - 1 ? 0 : index + 1)}
          >
            Successiva
          </button>
        </div>
      ) : null}
    </div>
  );
}
