"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sendPurchaseRequestEmails } from "@/lib/email/send-purchase-emails";
import { PURCHASE_REQUEST_COOKIE } from "@/lib/orders/constants";
import {
  fieldErrorsFromSchema,
  purchaseRequestSchema,
} from "@/lib/orders/schema";
import { createAdminClient } from "@/lib/supabase/admin";

export type PurchaseRequestResult =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

type PurchasePayload = {
  reference_code: string;
  products_total: number;
  replayed: boolean;
};

export async function submitPurchaseRequest(
  input: unknown,
): Promise<PurchaseRequestResult> {
  const parsed = purchaseRequestSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Controlla i campi evidenziati.",
      fieldErrors: fieldErrorsFromSchema(parsed.error),
    };
  }

  if (parsed.data.companyFax?.trim()) {
    return {
      ok: false,
      message: "Non è stato possibile inviare la richiesta.",
    };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("create_purchase_request", {
    p_idempotency_key: parsed.data.idempotencyKey,
    p_customer_first_name: parsed.data.firstName,
    p_customer_last_name: parsed.data.lastName,
    p_email: parsed.data.email,
    p_phone: parsed.data.phone,
    p_street: parsed.data.street,
    p_house_number: parsed.data.houseNumber,
    p_postal_code: parsed.data.postalCode,
    p_city: parsed.data.city,
    p_province: parsed.data.province,
    p_notes: parsed.data.notes,
    p_items: parsed.data.items.map((item) => ({
      product_id: item.productId,
      quantity: item.quantity,
    })),
  });

  if (error || !isPurchasePayload(data)) {
    return {
      ok: false,
      message: messageFromDatabase(error?.message ?? ""),
    };
  }

  const cookieStore = await cookies();
  cookieStore.set(PURCHASE_REQUEST_COOKIE, data.reference_code, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 30,
  });

  if (!data.replayed) {
    try {
      await sendPurchaseRequestEmails(data.reference_code);
    } catch (emailError) {
      console.error("purchase request emails", emailError);
    }
  }

  redirect("/richiesta-inviata");
}

function isPurchasePayload(value: unknown): value is PurchasePayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Partial<PurchasePayload>;
  return (
    typeof payload.reference_code === "string" &&
    /^RQ-[A-Z2-9]{8}$/.test(payload.reference_code) &&
    typeof payload.replayed === "boolean"
  );
}

function messageFromDatabase(message: string) {
  if (message.includes("PRODUCT_UNAVAILABLE")) {
    return "Un album non è più disponibile. Torna al carrello e rimuovilo.";
  }

  if (message.includes("RATE_LIMIT")) {
    return "Hai inviato troppe richieste. Riprova tra qualche minuto.";
  }

  if (message.includes("INVALID_")) {
    return "Controlla i dati e riprova.";
  }

  return "Non è stato possibile inviare la richiesta. Riprova.";
}
