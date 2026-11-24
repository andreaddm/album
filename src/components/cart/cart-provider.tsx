"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  CART_CHANGE_EVENT,
  CART_STORAGE_KEY,
  MAX_CART_QUANTITY,
  type StoredCartItem,
} from "@/lib/cart/constants";

type CartContextValue = {
  items: StoredCartItem[];
  count: number;
  addItem: (productId: string, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const items = parseCart(raw);

  const value: CartContextValue = {
    items,
    count: items.reduce((total, item) => total + item.quantity, 0),
    addItem(productId, quantity = 1) {
      updateCart((current) => {
        const existing = current.find((item) => item.productId === productId);
        const nextQuantity = Math.min(
          MAX_CART_QUANTITY,
          (existing?.quantity ?? 0) + quantity,
        );

        if (nextQuantity < 1) {
          return current;
        }

        if (!existing) {
          return [...current, { productId, quantity: nextQuantity }];
        }

        return current.map((item) =>
          item.productId === productId
            ? { ...item, quantity: nextQuantity }
            : item,
        );
      });
    },
    setQuantity(productId, quantity) {
      updateCart((current) => {
        if (quantity < 1) {
          return current.filter((item) => item.productId !== productId);
        }

        return current.map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.min(MAX_CART_QUANTITY, quantity) }
            : item,
        );
      });
    },
    removeItem(productId) {
      updateCart((current) =>
        current.filter((item) => item.productId !== productId),
      );
    },
    clear() {
      updateCart(() => []);
    },
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const cart = useContext(CartContext);

  if (!cart) {
    throw new Error("useCart va usato dentro CartProvider.");
  }

  return cart;
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener(CART_CHANGE_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(CART_CHANGE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getSnapshot() {
  return localStorage.getItem(CART_STORAGE_KEY) ?? "[]";
}

function getServerSnapshot() {
  return "[]";
}

function parseCart(raw: string): StoredCartItem[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.flatMap((item) => {
      if (
        !item ||
        typeof item !== "object" ||
        typeof item.productId !== "string" ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1
      ) {
        return [];
      }

      return [
        {
          productId: item.productId,
          quantity: Math.min(MAX_CART_QUANTITY, item.quantity),
        },
      ];
    });
  } catch {
    return [];
  }
}

function updateCart(change: (current: StoredCartItem[]) => StoredCartItem[]) {
  const next = change(parseCart(getSnapshot()));
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(CART_CHANGE_EVENT));
}
