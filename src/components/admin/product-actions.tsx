"use client";

import { useState } from "react";
import {
  deleteProduct,
  duplicateProduct,
} from "@/app/admin/prodotti/actions";
import { Button, ButtonLink } from "@/components/ui/button";

export function ProductActions({
  productId,
  productName,
  slug,
  isPublished,
}: {
  productId: string;
  productName: string;
  slug: string;
  isPublished: boolean;
}) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  async function onDuplicate() {
    if (pending) {
      return;
    }

    setPending(true);
    setMessage(null);

    try {
      const result = await duplicateProduct(productId);
      if (!result.ok) {
        setPending(false);
        setMessage(result.message);
      }
    } catch (error) {
      if (isNextRedirect(error)) {
        throw error;
      }
      setPending(false);
      setMessage("Duplicazione non riuscita.");
    }
  }

  async function onDelete() {
    if (pending) {
      return;
    }

    setPending(true);
    setMessage(null);

    try {
      const result = await deleteProduct(productId);
      if (!result.ok) {
        setPending(false);
        setMessage(result.message);
      }
    } catch (error) {
      if (isNextRedirect(error)) {
        throw error;
      }
      setPending(false);
      setMessage("Eliminazione non riuscita.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {isPublished ? (
          <ButtonLink href={`/prodotti/${slug}`} variant="secondary">
            Anteprima pubblica
          </ButtonLink>
        ) : null}
        <Button
          type="button"
          variant="secondary"
          disabled={pending}
          onClick={onDuplicate}
        >
          Duplica
        </Button>
        {!confirming ? (
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() => setConfirming(true)}
          >
            Elimina definitivamente
          </Button>
        ) : null}
      </div>

      {confirming ? (
        <div className="rounded-3xl border border-terracotta/40 bg-sand/60 p-5">
          <p className="text-ink">
            Eliminare definitivamente «{productName}»? L&apos;operazione non è
            reversibile. Lo storico delle richieste resta con i dati snapshot.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button type="button" disabled={pending} onClick={onDelete}>
              Conferma eliminazione
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={pending}
              onClick={() => setConfirming(false)}
            >
              Annulla
            </Button>
          </div>
        </div>
      ) : null}

      {message ? (
        <p className="text-sm text-terracotta" role="alert">
          {message}
        </p>
      ) : null}
    </div>
  );
}

function isNextRedirect(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    String(error.digest).startsWith("NEXT_REDIRECT")
  );
}
