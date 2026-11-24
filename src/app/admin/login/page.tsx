import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { LoginForm } from "@/components/admin/login-form";
import { getAdminContext } from "@/lib/auth/admin";

export const metadata: Metadata = {
  title: "Accesso admin",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-full w-full max-w-md flex-1 flex-col justify-center px-4 py-16 sm:px-6">
          <p className="text-stone">Caricamento…</p>
        </main>
      }
    >
      <AdminLoginContent />
    </Suspense>
  );
}

async function AdminLoginContent() {
  await connection();
  const admin = await getAdminContext();
  if (admin) {
    redirect("/admin");
  }

  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-1 flex-col justify-center px-4 py-16 sm:px-6">
      <h1 className="font-serif text-5xl text-ink">Accesso</h1>
      <p className="mt-3 text-stone">
        Area riservata al titolare. La registrazione pubblica non è disponibile.
      </p>
      <div className="mt-8">
        <LoginForm />
      </div>
    </main>
  );
}
