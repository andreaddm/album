import type { Metadata } from "next";
import Image from "next/image";
import { PageBody } from "@/components/layout/page-body";
import { getStorePublicSettings } from "@/lib/products/queries";
import { listAboutPageImages } from "@/lib/settings/about-media";
import {
  DEFAULT_ABOUT_BODY,
  DEFAULT_ABOUT_TITLE,
} from "@/lib/settings/page-defaults";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStorePublicSettings();
  return {
    title: settings?.aboutTitle?.trim() || DEFAULT_ABOUT_TITLE,
  };
}

export default async function AboutPage() {
  const [settings, media] = await Promise.all([
    getStorePublicSettings(),
    listAboutPageImages(),
  ]);
  const title = settings?.aboutTitle?.trim() || DEFAULT_ABOUT_TITLE;
  const body = settings?.aboutBody?.trim() || DEFAULT_ABOUT_BODY;
  const background = media.find((item) => item.kind === "background") ?? null;
  const gallery = media.filter((item) => item.kind === "gallery");

  return (
    <main>
      {background ? (
        <section className="relative isolate overflow-hidden">
          <div aria-hidden className="absolute inset-0">
            <Image
              src={background.src}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-ink/50 via-ink/40 to-ink/65" />
          </div>
          <div className="relative mx-auto max-w-3xl px-4 py-20 sm:px-6 sm:py-28">
            <h1 className="font-serif text-5xl text-ivory sm:text-6xl">
              {title}
            </h1>
          </div>
        </section>
      ) : (
        <div className="mx-auto w-full max-w-3xl px-4 pt-12 sm:px-6 sm:pt-16">
          <h1 className="font-serif text-4xl text-ink sm:text-5xl">{title}</h1>
        </div>
      )}

      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <PageBody text={body} />

        {gallery.length > 0 ? (
          <ul className="mt-12 grid gap-4 sm:grid-cols-2">
            {gallery.map((image) => (
              <li
                key={image.id}
                className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-sand"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 640px) 40vw, 100vw"
                  className="object-cover"
                />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </main>
  );
}
