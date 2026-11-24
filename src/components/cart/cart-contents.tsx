"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  loadCartCatalog,
  type CartCatalogItem,
} from "@/app/(store)/carrello/actions";
import { MAX_CART_QUANTITY } from "@/lib/cart/constants";
import { useCart } from "@/components/cart/cart-provider";
import { WhatsAppLink } from "@/components/layout/whatsapp-link";
import { ButtonLink } from "@/components/ui/button";
import { formatPrice } from "@/lib/products/price";
import { cartWhatsAppText } from "@/lib/whatsapp";

export function CartContents({
  unavailableMessage,
  storeName,
  whatsappNumber,
}: {
  unavailableMessage: string;
  storeName: string;
  whatsappNumber?: string | null;
}) {
  const { items, setQuantity, removeItem } = useCart();
  const [catalog, setCatalog] = useState<CartCatalogItem[] | null>(null);

  useEffect(() => {
    let active = true;

    loadCartCatalog().then((products) => {
      if (active) {
        setCatalog(products);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  if (items.length === 0) {
    return (
      <div className="space-y-4">
        <p>Il carrello è vuoto.</p>
        <ButtonLink href="/prodotti">Vai al catalogo</ButtonLink>
      </div>
    );
  }

  if (!catalog) {
    return <p>Caricamento del carrello…</p>;
  }

  const lines = items.map((item) => {
    const product = catalog.find((entry) => entry.id === item.productId);

    if (!product) {
      return {
        ...item,
        name: "Prodotto non più disponibile",
        slug: "",
        unitPrice: 0,
        isAvailable: false,
        found: false,
      };
    }

    return {
      ...item,
      name: product.name,
      slug: product.slug,
      unitPrice: product.price,
      isAvailable: product.isAvailable,
      found: true,
    };
  });

  const total = lines.reduce(
    (sum, line) =>
      line.found && line.isAvailable ? sum + line.unitPrice * line.quantity : sum,
    0,
  );
  const hasBlockedLine = lines.some((line) => !line.found || !line.isAvailable);

  return (
    <div className="space-y-6">
      <ul className="divide-y divide-ink/10">
        {lines.map((line) => (
          <li key={line.productId} className="flex flex-col gap-3 py-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                {line.found ? (
                  <Link
                    href={`/prodotti/${line.slug}`}
                    className="font-serif text-2xl text-ink"
                  >
                    {line.name}
                  </Link>
                ) : (
                  <p className="font-serif text-2xl text-ink">{line.name}</p>
                )}
                <p className="mt-1 text-sm text-stone">
                  {line.found
                    ? `${formatPrice(line.unitPrice)} ciascuno`
                    : "Rimuovilo per continuare."}
                </p>
                {line.found && !line.isAvailable ? (
                  <p className="mt-1 text-sm font-semibold text-terracotta">
                    {unavailableMessage}
                  </p>
                ) : null}
              </div>
              <p className="text-ink">
                {line.found && line.isAvailable
                  ? formatPrice(line.unitPrice * line.quantity)
                  : "—"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                Quantità
                <input
                  type="number"
                  min={1}
                  max={MAX_CART_QUANTITY}
                  value={line.quantity}
                  onChange={(event) => {
                    const next = Number.parseInt(event.target.value, 10);
                    if (!Number.isNaN(next)) {
                      setQuantity(line.productId, next);
                    }
                  }}
                  className="w-20 rounded-full border border-ink/20 bg-ivory px-3 py-2"
                />
              </label>
              <button
                type="button"
                className="text-sm text-ink underline"
                onClick={() => removeItem(line.productId)}
              >
                Rimuovi
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="space-y-2 border-t border-ink/10 pt-4">
        <p className="flex justify-between text-lg">
          <span>Totale prodotti</span>
          <span>{formatPrice(total)}</span>
        </p>
        <p className="text-sm leading-6 text-stone">
          Le spese di spedizione non sono incluse. Il titolare le comunica
          dopo la richiesta.
        </p>
        {hasBlockedLine ? (
          <p className="text-sm text-terracotta">
            C’è un prodotto non disponibile. Rimuovilo prima di inviare la
            richiesta.
          </p>
        ) : (
          <ButtonLink href="/ordine">Invia richiesta d&apos;acquisto</ButtonLink>
        )}
        <WhatsAppLink
          number={whatsappNumber}
          text={cartWhatsAppText(
            storeName,
            lines
              .filter((line) => line.found)
              .map((line) => ({ name: line.name, quantity: line.quantity })),
          )}
          className="inline-flex text-sm text-terracotta underline"
        >
          Oppure chiedi info su WhatsApp
        </WhatsAppLink>
      </div>
    </div>
  );
}
