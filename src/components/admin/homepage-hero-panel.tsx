"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import {
  deleteHomepageHeroImage,
  moveHomepageHeroImage,
  uploadHomepageHeroImage,
} from "@/app/admin/impostazioni/hero-actions";
import type { HomepageHeroImage } from "@/lib/settings/hero";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

export function HomepageHeroPanel({ images }: { images: HomepageHeroImage[] }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [alt, setAlt] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);

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

  async function onUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("alt", alt);

    await run(async () => {
      const result = await uploadHomepageHeroImage(formData);
      if (result.ok) {
        form.reset();
        setAlt("");
        setFileName(null);
      }
      return result;
    });
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl text-ink">Sfondo homepage</h2>
        <p className="mt-2 text-sm text-stone">
          Immagini usate come sfondo nella prima sezione della home (dal nome
          negozio ai pulsanti Catalogo e Come funziona). Se ce n&apos;è più di
          una, scorrono automaticamente con dissolvenza ogni 10 secondi. JPEG,
          PNG o WebP, massimo 5 MB ciascuna (fino a 8 immagini).
        </p>
      </div>

      {images.length === 0 ? (
        <p className="text-sm text-stone">Nessuna immagine di sfondo.</p>
      ) : (
        <ul className="divide-y divide-ink/10 border-y border-ink/10">
          {images.map((item, index) => (
            <li
              key={item.id}
              className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.src}
                  alt={item.alt || "Anteprima"}
                  className="size-20 rounded-xl object-cover"
                />
                <p className="text-ink">{item.alt || "Sfondo homepage"}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="px-3 py-2"
                  disabled={pending || index === 0}
                  onClick={() =>
                    run(() => moveHomepageHeroImage(item.id, "up"))
                  }
                >
                  Su
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="px-3 py-2"
                  disabled={pending || index === images.length - 1}
                  onClick={() =>
                    run(() => moveHomepageHeroImage(item.id, "down"))
                  }
                >
                  Giù
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="px-3 py-2"
                  disabled={pending}
                  onClick={() =>
                    run(() => deleteHomepageHeroImage(item.id))
                  }
                >
                  Elimina
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={onUpload} className="space-y-4 rounded-3xl bg-sand/50 p-5">
        <h3 className="font-serif text-2xl text-ink">Carica immagine</h3>
        <input
          ref={fileInputRef}
          id="homepage-hero-image"
          name="file"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required
          className="sr-only"
          onChange={(event) => {
            setFileName(event.target.files?.[0]?.name ?? null);
          }}
        />
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            disabled={pending}
            onClick={() => fileInputRef.current?.click()}
          >
            Cerca file
          </Button>
          <p className="text-sm text-stone">
            {fileName ?? "Nessun file selezionato"}
          </p>
        </div>
        <Field
          id="homepage-hero-alt"
          label="Testo alternativo"
          value={alt}
          onChange={setAlt}
        />
        <Button type="submit" disabled={pending}>
          Carica
        </Button>
      </form>

      {message ? (
        <p className="text-sm text-terracotta" role="alert">
          {message}
        </p>
      ) : null}
    </section>
  );
}
