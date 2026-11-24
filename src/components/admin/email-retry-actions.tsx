"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { retryOrderEmail } from "@/app/admin/richieste/actions";
import { Button } from "@/components/ui/button";

export function EmailRetryActions({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function retry(template: "owner_notification" | "customer_receipt") {
    if (pending) {
      return;
    }

    setPending(template);
    setMessage(null);
    const result = await retryOrderEmail(orderId, template);
    setPending(null);

    if (!result.ok) {
      setMessage(result.message);
      return;
    }

    setMessage("Invio registrato. Controlla il log sotto.");
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant="secondary"
          className="px-4 py-2"
          disabled={Boolean(pending)}
          onClick={() => retry("owner_notification")}
        >
          {pending === "owner_notification"
            ? "Invio…"
            : "Reinvia notifica titolare"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="px-4 py-2"
          disabled={Boolean(pending)}
          onClick={() => retry("customer_receipt")}
        >
          {pending === "customer_receipt"
            ? "Invio…"
            : "Reinvia ricevuta cliente"}
        </Button>
      </div>
      {message ? (
        <p className="text-sm text-ink" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
