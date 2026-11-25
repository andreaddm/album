import { HomeHero } from "@/components/home/home-hero";
import { ProductCard } from "@/components/products/product-card";
import { ButtonLink } from "@/components/ui/button";
import {
  getStorePublicSettings,
  listPublishedProducts,
} from "@/lib/products/queries";
import {
  DEFAULT_HOMEPAGE_CTA_CATALOG,
  DEFAULT_HOMEPAGE_CTA_HOW,
  DEFAULT_HOMEPAGE_EYEBROW,
  DEFAULT_HOMEPAGE_FEATURED_TITLE,
  DEFAULT_HOMEPAGE_HOW_STEPS,
  DEFAULT_HOMEPAGE_HOW_TITLE,
  DEFAULT_HOMEPAGE_WHY_CTA,
  DEFAULT_HOMEPAGE_WHY_ITEMS,
  DEFAULT_HOMEPAGE_WHY_TITLE,
} from "@/lib/settings/homepage-defaults";
import { listHomepageHeroImages } from "@/lib/settings/hero";
import { site } from "@/lib/site";

export default async function HomePage() {
  const [products, settings, heroImages] = await Promise.all([
    listPublishedProducts(),
    getStorePublicSettings(),
    listHomepageHeroImages(),
  ]);
  const unavailableMessage =
    settings?.unavailableMessage?.trim() || "Non disponibile";
  const storeName = settings?.storeName?.trim() || site.name;
  const headline =
    settings?.homepageHeadline?.trim() ||
    "Vuoti, pronti per le tue fotografie.";
  const intro =
    settings?.homepageIntro?.trim() ||
    "Scegli un album, invia una richiesta d'acquisto e attendi il contatto del titolare. Le spese di spedizione si concordano dopo, non durante la richiesta.";
  const eyebrow =
    settings?.homepageEyebrow?.trim() || DEFAULT_HOMEPAGE_EYEBROW;
  const ctaCatalog =
    settings?.homepageCtaCatalog?.trim() || DEFAULT_HOMEPAGE_CTA_CATALOG;
  const ctaHow = settings?.homepageCtaHow?.trim() || DEFAULT_HOMEPAGE_CTA_HOW;
  const featuredTitle =
    settings?.homepageFeaturedTitle?.trim() || DEFAULT_HOMEPAGE_FEATURED_TITLE;
  const howTitle =
    settings?.homepageHowTitle?.trim() || DEFAULT_HOMEPAGE_HOW_TITLE;
  const howSteps = settings?.homepageHowSteps?.length
    ? settings.homepageHowSteps
    : DEFAULT_HOMEPAGE_HOW_STEPS;
  const whyTitle =
    settings?.homepageWhyTitle?.trim() || DEFAULT_HOMEPAGE_WHY_TITLE;
  const whyItems = settings?.homepageWhyItems?.length
    ? settings.homepageWhyItems
    : DEFAULT_HOMEPAGE_WHY_ITEMS;
  const whyCta = settings?.homepageWhyCta?.trim() || DEFAULT_HOMEPAGE_WHY_CTA;
  const featuredLimit = settings?.featuredLimit ?? 3;
  const featured = products
    .filter((product) => product.isFeatured)
    .sort((a, b) => Number(b.isAvailable) - Number(a.isAvailable))
    .slice(0, featuredLimit);

  return (
    <main>
      <HomeHero
        storeName={storeName}
        eyebrow={eyebrow}
        headline={headline}
        intro={intro}
        ctaCatalog={ctaCatalog}
        ctaHow={ctaHow}
        images={heroImages}
      />

      {featured.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <h2 className="font-serif text-4xl text-ink">{featuredTitle}</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                unavailableMessage={unavailableMessage}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section id="come-funziona" className="bg-sand">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <h2 className="text-4xl text-ink">{howTitle}</h2>
          <ol className="mt-8 grid gap-6 sm:grid-cols-2">
            {howSteps.map((step, index) => (
              <li key={`${step.title}-${index}`} className="rounded-3xl bg-ivory p-6">
                <p className="text-sm text-terracotta">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 text-2xl text-ink">{step.title}</h3>
                <p className="mt-2 leading-7 text-stone">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="font-serif text-4xl text-ink">{whyTitle}</h2>
        <ul className="mt-8 grid gap-6 md:grid-cols-3">
          {whyItems.map((benefit, index) => (
            <li key={`${benefit.title}-${index}`}>
              <h3 className="font-serif text-2xl text-ink">{benefit.title}</h3>
              <p className="mt-2 leading-7 text-stone">{benefit.text}</p>
            </li>
          ))}
        </ul>
        <div className="mt-10">
          <ButtonLink href="/prodotti">{whyCta}</ButtonLink>
        </div>
      </section>
    </main>
  );
}
