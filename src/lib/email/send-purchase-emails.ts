import "server-only";

import { getEmailEnv } from "@/lib/email/env";
import { sendEmail } from "@/lib/email/provider";
import {
  customerReceiptEmail,
  ownerNotificationEmail,
  type EmailOrderContext,
} from "@/lib/email/templates";
import { createAdminClient } from "@/lib/supabase/admin";

type EmailTemplate = "owner_notification" | "customer_receipt";

export async function sendPurchaseRequestEmails(referenceCode: string) {
  const context = await loadEmailContext(referenceCode);
  if (!context) {
    console.error("email context missing", referenceCode);
    return;
  }

  const tasks = [dispatchTemplate(context, "owner_notification")];

  if (getEmailEnv().sendCustomerReceipt) {
    tasks.push(dispatchTemplate(context, "customer_receipt"));
  }

  await Promise.all(tasks);
}

export async function retryPurchaseEmail(
  orderId: string,
  template: EmailTemplate,
) {
  const context = await loadEmailContextById(orderId);
  if (!context) {
    return { ok: false as const, message: "Richiesta non trovata." };
  }

  const result = await dispatchTemplate(context, template);
  if (!result.ok) {
    return {
      ok: false as const,
      message: result.error || "Invio non riuscito.",
    };
  }

  return { ok: true as const };
}

async function dispatchTemplate(
  context: EmailOrderContext & { orderId: string; notificationEmail: string | null },
  template: EmailTemplate,
) {
  const supabase = createAdminClient();
  const composed =
    template === "owner_notification"
      ? ownerNotificationEmail(context)
      : customerReceiptEmail(context);

  const recipient =
    template === "owner_notification"
      ? context.notificationEmail
      : context.email;

  if (!recipient) {
    const error =
      template === "owner_notification"
        ? "Email notifiche non configurata nelle impostazioni."
        : "Email cliente mancante.";
    await insertLog(context.orderId, recipient || "mancante", template, "failed", error);
    return { ok: false as const, error };
  }

  const { data: pending, error: pendingError } = await supabase
    .from("email_logs")
    .insert({
      order_id: context.orderId,
      recipient,
      template,
      status: "pending",
    })
    .select("id")
    .single();

  if (pendingError || !pending) {
    console.error("email log insert", pendingError?.message);
    return { ok: false as const, error: "Impossibile registrare il log email." };
  }

  const sent = await sendEmail({
    to: recipient,
    subject: composed.subject,
    text: composed.text,
    html: composed.html,
  });

  if (!sent.ok) {
    await supabase
      .from("email_logs")
      .update({ status: "failed", error: sent.error })
      .eq("id", pending.id);
    return { ok: false as const, error: sent.error };
  }

  await supabase
    .from("email_logs")
    .update({
      status: "sent",
      error: null,
    })
    .eq("id", pending.id);

  return { ok: true as const };
}

async function insertLog(
  orderId: string,
  recipient: string,
  template: EmailTemplate,
  status: "pending" | "sent" | "failed",
  error: string | null,
) {
  const supabase = createAdminClient();
  await supabase.from("email_logs").insert({
    order_id: orderId,
    recipient,
    template,
    status,
    error,
  });
}

async function loadEmailContext(referenceCode: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id, reference_code, created_at, customer_first_name, customer_last_name,
      email, phone, street, house_number, postal_code, city, province, notes,
      products_total,
      order_items (
        product_name_snapshot, unit_price_snapshot, quantity, line_total_snapshot
      )
    `,
    )
    .eq("reference_code", referenceCode)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return toContext(data);
}

async function loadEmailContextById(orderId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id, reference_code, created_at, customer_first_name, customer_last_name,
      email, phone, street, house_number, postal_code, city, province, notes,
      products_total,
      order_items (
        product_name_snapshot, unit_price_snapshot, quantity, line_total_snapshot
      )
    `,
    )
    .eq("id", orderId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return toContext(data);
}

async function toContext(data: {
  id: string;
  reference_code: string;
  created_at: string;
  customer_first_name: string;
  customer_last_name: string;
  email: string;
  phone: string;
  street: string;
  house_number: string;
  postal_code: string;
  city: string;
  province: string;
  notes: string | null;
  products_total: number | string;
  order_items: Array<{
    product_name_snapshot: string;
    unit_price_snapshot: number | string;
    quantity: number;
    line_total_snapshot: number | string;
  }> | null;
}) {
  const supabase = createAdminClient();
  const { data: settings } = await supabase
    .from("store_settings")
    .select("store_name, notification_email")
    .eq("id", "default")
    .maybeSingle();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "";

  return {
    orderId: data.id,
    notificationEmail: settings?.notification_email ?? null,
    storeName: settings?.store_name?.trim() || "Album",
    referenceCode: data.reference_code,
    createdAt: data.created_at,
    customerFirstName: data.customer_first_name,
    customerLastName: data.customer_last_name,
    email: data.email,
    phone: data.phone,
    street: data.street,
    houseNumber: data.house_number,
    postalCode: data.postal_code,
    city: data.city,
    province: data.province,
    notes: data.notes,
    productsTotal: Number(data.products_total),
    items: (data.order_items ?? [])
      .slice()
      .sort((a, b) =>
        a.product_name_snapshot.localeCompare(b.product_name_snapshot, "it"),
      )
      .map((item) => ({
        productName: item.product_name_snapshot,
        quantity: item.quantity,
        unitPrice: Number(item.unit_price_snapshot),
        lineTotal: Number(item.line_total_snapshot),
      })),
    siteUrl,
  };
}
