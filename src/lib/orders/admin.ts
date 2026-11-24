import "server-only";

import {
  isOrderStatus,
  type OrderStatus,
} from "@/lib/orders/status";
import { createClient } from "@/lib/supabase/server";

export type AdminOrderListItem = {
  id: string;
  referenceCode: string;
  status: OrderStatus;
  customerFirstName: string;
  customerLastName: string;
  email: string;
  phone: string;
  productsTotal: number;
  createdAt: string;
};

export type AdminOrderItem = {
  id: string;
  productId: string | null;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type AdminOrderDetail = AdminOrderListItem & {
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  province: string;
  notes: string | null;
  updatedAt: string;
  items: AdminOrderItem[];
};

export type AdminEmailLog = {
  id: string;
  orderId: string | null;
  recipient: string;
  template: "owner_notification" | "customer_receipt";
  status: "pending" | "sent" | "failed";
  error: string | null;
  createdAt: string;
  referenceCode: string | null;
};

type OrderFilters = {
  q?: string;
  status?: OrderStatus | "all";
  from?: string;
  to?: string;
};

export async function listAdminOrders(
  filters: OrderFilters = {},
): Promise<AdminOrderListItem[]> {
  const supabase = await createClient();
  let query = supabase
    .from("orders")
    .select(
      `
      id, reference_code, status, customer_first_name, customer_last_name,
      email, phone, products_total, created_at
    `,
    )
    .order("created_at", { ascending: false });

  const q = filters.q?.trim();
  if (q) {
    query = query.or(
      `reference_code.ilike.%${q}%,email.ilike.%${q}%,customer_first_name.ilike.%${q}%,customer_last_name.ilike.%${q}%`,
    );
  }

  if (filters.status && filters.status !== "all" && isOrderStatus(filters.status)) {
    query = query.eq("status", filters.status);
  }

  if (filters.from) {
    query = query.gte("created_at", `${filters.from}T00:00:00`);
  }

  if (filters.to) {
    query = query.lte("created_at", `${filters.to}T23:59:59.999`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error("Impossibile leggere le richieste.");
  }

  return (data ?? []).map(mapListItem);
}

export async function getAdminOrder(
  id: string,
): Promise<AdminOrderDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id, reference_code, status, customer_first_name, customer_last_name,
      email, phone, street, house_number, postal_code, city, province, notes,
      products_total, created_at, updated_at,
      order_items (
        id, product_id, product_name_snapshot, unit_price_snapshot,
        quantity, line_total_snapshot
      )
    `,
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error("Impossibile leggere la richiesta.");
  }

  if (!data || !isOrderStatus(data.status)) {
    return null;
  }

  const items = ((data.order_items ?? []) as Array<{
    id: string;
    product_id: string | null;
    product_name_snapshot: string;
    unit_price_snapshot: number | string;
    quantity: number;
    line_total_snapshot: number | string;
  }>)
    .slice()
    .sort((a, b) =>
      a.product_name_snapshot.localeCompare(b.product_name_snapshot, "it"),
    )
    .map((item) => ({
      id: item.id,
      productId: item.product_id,
      productName: item.product_name_snapshot,
      unitPrice: Number(item.unit_price_snapshot),
      quantity: item.quantity,
      lineTotal: Number(item.line_total_snapshot),
    }));

  return {
    ...mapListItem(data),
    street: data.street,
    houseNumber: data.house_number,
    postalCode: data.postal_code,
    city: data.city,
    province: data.province,
    notes: data.notes,
    updatedAt: data.updated_at,
    items,
  };
}

export async function listRecentAdminOrders(limit = 5) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id, reference_code, status, customer_first_name, customer_last_name,
      email, phone, products_total, created_at
    `,
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error("Impossibile leggere le richieste recenti.");
  }

  return (data ?? []).map(mapListItem);
}

export async function countOrdersByStatus() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("orders").select("status");

  if (error) {
    throw new Error("Impossibile conteggiare le richieste.");
  }

  const counts: Record<OrderStatus, number> = {
    new: 0,
    to_contact: 0,
    confirmed: 0,
    shipped: 0,
    completed: 0,
    rejected: 0,
  };

  for (const row of data ?? []) {
    if (isOrderStatus(row.status)) {
      counts[row.status] += 1;
    }
  }

  return counts;
}

export async function listEmailLogs(limit = 50): Promise<AdminEmailLog[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("email_logs")
    .select(
      `
      id, order_id, recipient, template, status, error, created_at,
      orders ( reference_code )
    `,
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error("Impossibile leggere i log email.");
  }

  return (data ?? []).map((row) => {
    const order = Array.isArray(row.orders) ? row.orders[0] : row.orders;
    return {
      id: row.id,
      orderId: row.order_id,
      recipient: row.recipient,
      template: row.template,
      status: row.status,
      error: row.error,
      createdAt: row.created_at,
      referenceCode: order?.reference_code ?? null,
    };
  });
}

export async function listEmailLogsForOrder(
  orderId: string,
): Promise<AdminEmailLog[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("email_logs")
    .select("id, order_id, recipient, template, status, error, created_at")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Impossibile leggere i log email della richiesta.");
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    orderId: row.order_id,
    recipient: row.recipient,
    template: row.template,
    status: row.status,
    error: row.error,
    createdAt: row.created_at,
    referenceCode: null,
  }));
}

function mapListItem(row: {
  id: string;
  reference_code: string;
  status: string;
  customer_first_name: string;
  customer_last_name: string;
  email: string;
  phone: string;
  products_total: number | string;
  created_at: string;
}): AdminOrderListItem {
  return {
    id: row.id,
    referenceCode: row.reference_code,
    status: isOrderStatus(row.status) ? row.status : "new",
    customerFirstName: row.customer_first_name,
    customerLastName: row.customer_last_name,
    email: row.email,
    phone: row.phone,
    productsTotal: Number(row.products_total),
    createdAt: row.created_at,
  };
}

