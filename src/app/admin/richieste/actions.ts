"use server";

import { requireAdmin } from "@/lib/auth/admin";
import { retryPurchaseEmail } from "@/lib/email/send-purchase-emails";
import { isOrderStatus, type OrderStatus } from "@/lib/orders/status";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type ActionResult =
  | { ok: true }
  | { ok: false; message: string };

export async function updateOrderStatus(
  orderId: string,
  status: string,
): Promise<ActionResult> {
  await requireAdmin();

  if (!isOrderStatus(status)) {
    return { ok: false, message: "Stato non valido." };
  }

  const supabase = await createClient();
  const { data: existing, error: readError } = await supabase
    .from("orders")
    .select("id, status, reference_code")
    .eq("id", orderId)
    .maybeSingle();

  if (readError || !existing) {
    return { ok: false, message: "Richiesta non trovata." };
  }

  if (existing.status === status) {
    return { ok: true };
  }

  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) {
    return { ok: false, message: "Non è stato possibile aggiornare lo stato." };
  }

  await writeAudit("order.status_update", "order", orderId, {
    referenceCode: existing.reference_code,
    from: existing.status,
    to: status as OrderStatus,
  });

  return { ok: true };
}

export async function retryOrderEmail(
  orderId: string,
  template: "owner_notification" | "customer_receipt",
): Promise<ActionResult> {
  await requireAdmin();

  if (
    template !== "owner_notification" &&
    template !== "customer_receipt"
  ) {
    return { ok: false, message: "Template non valido." };
  }

  const result = await retryPurchaseEmail(orderId, template);
  if (!result.ok) {
    return { ok: false, message: result.message };
  }

  await writeAudit("order.email_retry", "order", orderId, { template });
  return { ok: true };
}

async function writeAudit(
  action: string,
  entity: string,
  entityId: string | null,
  detail: Record<string, unknown>,
) {
  try {
    const admin = await requireAdmin();
    const supabase = createAdminClient();
    await supabase.from("admin_audit_logs").insert({
      actor_id: admin.userId,
      action,
      entity,
      entity_id: entityId,
      detail,
    });
  } catch (error) {
    console.error("audit log", error);
  }
}
