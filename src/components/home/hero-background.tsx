"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const HOLD_MS = 10_000;
const FADE_MS = 3600;

export function HeroBackground({
  images,
}: {
  images: Array<{ id: string; src: string; alt: string }>;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length < 2) {
      return;
    }

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % images.length);
    }, HOLD_MS);

    return () => window.clearInterval(timer);
  }, [images.length]);

  if (images.length === 0) {
    return null;
  }

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {images.map((image, imageIndex) => {
        const active = imageIndex === index;
        return (
          <Image
            key={image.id}
            src={image.src}
            alt=""
            fill
            priority={imageIndex === 0}
            sizes="100vw"
            className="object-cover transition-opacity ease-in-out"
            style={{
              opacity: active ? 1 : 0,
              transitionDuration: `${FADE_MS}ms`,
            }}
          />
        );
      })}
      <div className="absolute inset-0 bg-gradient-to-b from-ink/55 via-ink/45 to-ink/65" />
    </div>
  );
}
