"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import {
  deleteAboutPageImage,
  moveAboutPageImage,
  uploadAboutPageImage,
} from "@/app/admin/impostazioni/about-actions";
import type { AboutPageImage } from "@/lib/settings/about-media";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

export function AboutMediaPanel({ images }: { images: AboutPageImage[] }) {
  const router = useRouter();
  const backgroundInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [backgroundAlt, setBackgroundAlt] = useState("");
  const [galleryAlt, setGalleryAlt] = useState("");
  const [backgroundFileName, setBackgroundFileName] = useState<string | null>(
    null,
  );
  const [galleryFileName, setGalleryFileName] = useState<string | null>(null);

  const background = images.find((item) => item.kind === "background") ?? null;
  const gallery = images.filter((item) => item.kind === "gallery");

  async function run(action: () => Promise<{ ok: boolean; message?: string }>) {
    if (pending) {
      return;
    }

    setPending(true);
    setMessage(null);
    const result = await action();
    setPending(false);

    if (!result.ok) {
      setMessage(result.message ?? "Operazione non riuscita.");
      return;
    }

    router.refresh();
  }

  async function onUpload(
    event: FormEvent<HTMLFormElement>,
    kind: "background" | "gallery",
  ) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("alt", kind === "background" ? backgroundAlt : galleryAlt);

    await run(async () => {
      const result = await uploadAboutPageImage(kind, formData);
      if (result.ok) {
        form.reset();
        if (kind === "background") {
          setBackgroundAlt("");
          setBackgroundFileName(null);
        } else {
          setGalleryAlt("");
          setGalleryFileName(null);
        }
      }
      return result;
    });
  }

  return (
    <section className="space-y-8">
      <div>
        <h2 className="font-serif text-3xl text-ink">Media Chi siamo</h2>
        <p className="mt-2 text-sm text-stone">
          Uno sfondo per l&apos;intestazione e altre immagini in galleria nella
          pagina. JPEG, PNG o WebP, massimo 5 MB ciascuna.
        </p>
      </div>

      <div className="space-y-4 rounded-3xl bg-sand/50 p-5">
        <h3 className="font-serif text-2xl text-ink">Sfondo</h3>
        {background ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={background.src}
                alt={background.alt}
                className="size-20 rounded-xl object-cover"
              />
              <p className="text-ink">{background.alt}</p>
            </div>
            <Button
              type="button"
              variant="secondary"
              className="px-3 py-2"
              disabled={pending}
              onClick={() => run(() => deleteAboutPageImage(background.id))}
            >
              Elimina
            </Button>
          </div>
        ) : (
          <p className="text-sm text-stone">Nessuno sfondo impostato.</p>
        )}
        <form
          onSubmit={(event) => onUpload(event, "background")}
          className="space-y-4"
        >
          <input
            ref={backgroundInputRef}
            name="file"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required
            className="sr-only"
            onChange={(event) => {
              setBackgroundFileName(event.target.files?.[0]?.name ?? null);
            }}
          />
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              disabled={pending}
              onClick={() => backgroundInputRef.current?.click()}
            >
              Cerca file
            </Button>
            <p className="text-sm text-stone">
              {backgroundFileName ?? "Nessun file selezionato"}
            </p>
          </div>
          <Field
            id="about-background-alt"
            label="Testo alternativo"
            value={backgroundAlt}
            onChange={setBackgroundAlt}
          />
          <Button type="submit" disabled={pending}>
            {background ? "Sostituisci sfondo" : "Carica sfondo"}
          </Button>
        </form>
      </div>

      <div className="space-y-4 rounded-3xl bg-sand/50 p-5">
        <h3 className="font-serif text-2xl text-ink">Galleria</h3>
        {gallery.length === 0 ? (
          <p className="text-sm text-stone">Nessuna immagine in galleria.</p>
        ) : (
          <ul className="divide-y divide-ink/10 border-y border-ink/10">
            {gallery.map((item, index) => (
              <li
                key={item.id}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="size-20 rounded-xl object-cover"
                  />
                  <p className="text-ink">{item.alt}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="px-3 py-2"
                    disabled={pending || index === 0}
                    onClick={() =>
                      run(() => moveAboutPageImage(item.id, "up"))
                    }
                  >
                    Su
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="px-3 py-2"
                    disabled={pending || index === gallery.length - 1}
                    onClick={() =>
                      run(() => moveAboutPageImage(item.id, "down"))
                    }
                  >
                    Giù
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="px-3 py-2"
                    disabled={pending}
                    onClick={() => run(() => deleteAboutPageImage(item.id))}
                  >
                    Elimina
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <form
          onSubmit={(event) => onUpload(event, "gallery")}
          className="space-y-4"
        >
          <input
            ref={galleryInputRef}
            name="file"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required
            className="sr-only"
            onChange={(event) => {
              setGalleryFileName(event.target.files?.[0]?.name ?? null);
            }}
          />
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              disabled={pending}
              onClick={() => galleryInputRef.current?.click()}
            >
              Cerca file
            </Button>
            <p className="text-sm text-stone">
              {galleryFileName ?? "Nessun file selezionato"}
            </p>
          </div>
          <Field
            id="about-gallery-alt"
            label="Testo alternativo"
            value={galleryAlt}
            onChange={setGalleryAlt}
          />
          <Button type="submit" disabled={pending}>
            Carica in galleria
          </Button>
        </form>
      </div>

      {message ? (
        <p className="text-sm text-terracotta" role="alert">
          {message}
        </p>
      ) : null}
    </section>
  );
}
