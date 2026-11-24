"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateOrderStatus } from "@/app/admin/richieste/actions";
import { Button } from "@/components/ui/button";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  type OrderStatus,
} from "@/lib/orders/status";

export function OrderStatusForm({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const router = useRouter();
  const [value, setValue] = useState<OrderStatus>(status);
  const [savedStatus, setSavedStatus] = useState<OrderStatus>(status);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSave() {
    if (pending || value === savedStatus) {
      return;
    }

    setPending(true);
    setMessage(null);
    const result = await updateOrderStatus(orderId, value);
    setPending(false);

    if (!result.ok) {
      setMessage(result.message);
      return;
    }

    setSavedStatus(value);
    setMessage("Stato aggiornato.");
    router.refresh();
  }

  return (
    <div className="space-y-4 rounded-3xl bg-sand/50 p-5">
      <h2 className="font-serif text-3xl text-ink">Stato richiesta</h2>
      <label className="block text-sm text-ink" htmlFor="order-status">
        Stato
        <select
          id="order-status"
          value={value}
          onChange={(event) => setValue(event.target.value as OrderStatus)}
          className="mt-2 w-full rounded-full border border-ink/20 bg-ivory px-3 py-2"
        >
          {ORDER_STATUSES.map((item) => (
            <option key={item} value={item}>
              {ORDER_STATUS_LABELS[item]}
            </option>
          ))}
        </select>
      </label>
      <Button
        type="button"
        disabled={pending || value === savedStatus}
        onClick={onSave}
      >
        {pending ? "Salvataggio…" : "Aggiorna stato"}
      </Button>
      {message ? (
        <p
          className={`text-sm ${message.includes("aggiornato") ? "text-ink" : "text-terracotta"}`}
          role="status"
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
