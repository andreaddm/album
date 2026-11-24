import { Suspense } from "react";
import { connection } from "next/server";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminPage } from "@/lib/auth/admin";

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="p-8 text-stone">Caricamento…</div>}>
      <AdminPanelGate>{children}</AdminPanelGate>
    </Suspense>
  );
}

async function AdminPanelGate({ children }: { children: React.ReactNode }) {
  await connection();
  const admin = await requireAdminPage();
  return <AdminShell email={admin.email}>{children}</AdminShell>;
}
