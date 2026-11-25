import { HeroBackground } from "@/components/home/hero-background";
import { ButtonLink } from "@/components/ui/button";

export function HomeHero({
  storeName,
  eyebrow,
  headline,
  intro,
  ctaCatalog,
  ctaHow,
  images,
}: {
  storeName: string;
  eyebrow: string;
  headline: string;
  intro: string;
  ctaCatalog: string;
  ctaHow: string;
  images: Array<{ id: string; src: string; alt: string }>;
}) {
  const hasBackground = images.length > 0;

  return (
    <section
      className={
        hasBackground
          ? "relative isolate overflow-hidden"
          : "mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20"
      }
    >
      {hasBackground ? <HeroBackground images={images} /> : null}
      <div
        className={
          hasBackground
            ? "relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24"
            : undefined
        }
      >
        <p
          className={
            hasBackground
              ? "font-serif text-5xl tracking-tight text-ivory sm:text-6xl"
              : "text-sm uppercase tracking-[0.18em] text-terracotta"
          }
        >
          {hasBackground ? storeName : eyebrow}
        </p>
        <h1
          className={
            hasBackground
              ? "mt-5 max-w-xl text-4xl leading-tight text-ivory sm:text-5xl"
              : "mt-4 max-w-xl text-5xl leading-tight text-ink sm:text-6xl"
          }
        >
          {headline}
        </h1>
        <p
          className={
            hasBackground
              ? "mt-6 max-w-lg text-lg leading-8 text-ivory/90"
              : "mt-6 max-w-lg text-lg leading-8 text-stone"
          }
        >
          {intro}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/prodotti">{ctaCatalog}</ButtonLink>
          <ButtonLink
            href="#come-funziona"
            variant="secondary"
            className={
              hasBackground
                ? "border-ivory/40 text-ivory hover:bg-ivory/10"
                : undefined
            }
          >
            {ctaHow}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
