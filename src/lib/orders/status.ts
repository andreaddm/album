export const ORDER_STATUSES = [
  "new",
  "to_contact",
  "confirmed",
  "shipped",
  "completed",
  "rejected",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: "Nuova",
  to_contact: "Da contattare",
  confirmed: "Confermata",
  shipped: "Spedita",
  completed: "Completata",
  rejected: "Rifiutata",
};

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value);
}

export function formatAdminDateTime(value: string) {
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Rome",
  }).format(new Date(value));
}

export function formatAdminDate(value: string) {
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
    timeZone: "Europe/Rome",
  }).format(new Date(value));
}
