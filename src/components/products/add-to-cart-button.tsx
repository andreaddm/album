"use client";

import { useState } from "react";
import { MAX_CART_QUANTITY } from "@/lib/cart/constants";
import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";

export function AddToCartButton({
  productId,
  isAvailable,
  unavailableMessage,
  withQuantity = false,
}: {
  productId: string;
  isAvailable: boolean;
  unavailableMessage: string;
  withQuantity?: boolean;
}) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!isAvailable) {
    return (
      <Button type="button" disabled>
        {unavailableMessage}
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {withQuantity ? (
        <label className="flex items-center gap-3 text-sm text-ink">
          Quantità
          <input
            type="number"
            min={1}
            max={MAX_CART_QUANTITY}
            value={quantity}
            onChange={(event) => {
              const next = Number.parseInt(event.target.value, 10);
              if (Number.isNaN(next)) {
                return;
              }
              setQuantity(Math.min(MAX_CART_QUANTITY, Math.max(1, next)));
            }}
            className="w-20 rounded-full border border-ink/20 bg-ivory px-3 py-2"
          />
        </label>
      ) : null}
      <Button
        type="button"
        onClick={() => {
          addItem(productId, withQuantity ? quantity : 1);
          setAdded(true);
        }}
      >
        {added ? "Aggiunto al carrello" : "Aggiungi al carrello"}
      </Button>
    </div>
  );
}
