"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  addProductVideo,
  deleteProductMedia,
  moveProductMedia,
  uploadProductImage,
} from "@/app/admin/prodotti/actions";
import type { AdminMediaItem } from "@/lib/products/admin";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

export function ProductMediaPanel({
  productId,
  media,
}: {
  productId: string;
  media: AdminMediaItem[];
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [alt, setAlt] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const videoCount = media.filter((item) => item.kind === "video").length;

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
      const result = await uploadProductImage(productId, formData);
      if (result.ok) {
        form.reset();
        setAlt("");
      }
      return result;
    });
  }

  return (
    <section className="space-y-6">
      <h2 className="font-serif text-3xl text-ink">Media</h2>
      <p className="text-sm text-stone">
        Immagini fino a 5 MB (JPEG, PNG, WebP). Massimo 2 video YouTube o TikTok.
      </p>

      {media.length === 0 ? (
        <p className="text-sm text-stone">Nessun media associato.</p>
      ) : (
        <ul className="divide-y divide-ink/10 border-y border-ink/10">
          {media.map((item, index) => (
            <li
              key={item.id}
              className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-4">
                {item.kind === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.src}
                    alt={item.alt || "Anteprima"}
                    className="size-20 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex size-20 items-center justify-center rounded-xl bg-sand text-sm text-stone">
                    {item.platform}
                  </div>
                )}
                <div>
                  <p className="text-ink">
                    {item.kind === "image"
                      ? item.alt || "Immagine"
                      : `Video ${item.platform}`}
                  </p>
                  {item.kind === "video" ? (
                    <a
                      href={item.watchUrl}
                      className="text-sm text-terracotta underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Apri link
                    </a>
                  ) : null}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="px-3 py-2"
                  disabled={pending || index === 0}
                  onClick={() =>
                    run(() => moveProductMedia(productId, item.id, "up"))
                  }
                >
                  Su
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="px-3 py-2"
                  disabled={pending || index === media.length - 1}
                  onClick={() =>
                    run(() => moveProductMedia(productId, item.id, "down"))
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
                    run(() => deleteProductMedia(productId, item.id))
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
        <label className="block text-sm text-ink" htmlFor="product-image">
          File
          <input
            id="product-image"
            name="file"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required
            className="mt-2 block w-full text-sm"
          />
        </label>
        <Field
          id="product-image-alt"
          label="Testo alternativo"
          value={alt}
          onChange={setAlt}
        />
        <Button type="submit" disabled={pending}>
          Carica
        </Button>
      </form>

      <form
        className="space-y-4 rounded-3xl bg-sand/50 p-5"
        onSubmit={(event) => {
          event.preventDefault();
          run(async () => {
            const result = await addProductVideo(productId, videoUrl);
            if (result.ok) {
              setVideoUrl("");
            }
            return result;
          });
        }}
      >
        <h3 className="font-serif text-2xl text-ink">Aggiungi video</h3>
        <Field
          id="product-video-url"
          label="URL YouTube o TikTok"
          value={videoUrl}
          onChange={setVideoUrl}
        />
        <Button type="submit" disabled={pending || videoCount >= 2}>
          Aggiungi video
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
