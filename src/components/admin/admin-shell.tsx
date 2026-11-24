import Link from "next/link";
import { logoutAdmin } from "@/app/admin/login/actions";
import { Button } from "@/components/ui/button";

export function AdminShell({
  email,
  children,
}: {
  email: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full bg-ivory text-ink">
      <header className="border-b border-ink/10 bg-sand/60">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="font-serif text-2xl text-ink">Amministrazione</p>
            {email ? <p className="text-sm text-stone">{email}</p> : null}
          </div>
          <nav aria-label="Area admin" className="flex flex-wrap items-center gap-3">
            <Link href="/admin" className="text-sm text-ink/80 hover:text-ink">
              Panoramica
            </Link>
            <Link href="/admin/prodotti" className="text-sm text-ink/80 hover:text-ink">
              Prodotti
            </Link>
            <Link href="/admin/richieste" className="text-sm text-ink/80 hover:text-ink">
              Richieste
            </Link>
            <Link href="/admin/impostazioni" className="text-sm text-ink/80 hover:text-ink">
              Impostazioni
            </Link>
            <Link href="/" className="text-sm text-ink/80 hover:text-ink">
              Negozio
            </Link>
            <form action={logoutAdmin}>
              <Button type="submit" variant="secondary" className="px-4 py-2">
                Esci
              </Button>
            </form>
          </nav>
        </div>
      </header>
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">{children}</div>
    </div>
  );
}
