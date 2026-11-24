"use client";

import { useEffect } from "react";

import { useCart } from "@/components/cart/cart-provider";
import { REQUEST_IDEMPOTENCY_STORAGE_KEY } from "@/lib/orders/constants";

export function ClearCartAfterRequest() {
  const { clear } = useCart();

  useEffect(() => {
    sessionStorage.removeItem(REQUEST_IDEMPOTENCY_STORAGE_KEY);
    clear();
  }, [clear]);

  return null;
}
