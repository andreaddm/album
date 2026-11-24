"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { useCart } from "@/components/cart/cart-provider";

const links = [
  { href: "/prodotti", label: "Catalogo" },
  { href: "/chi-siamo", label: "Chi siamo" },
  { href: "/contatti", label: "Contatti" },
] as const;

export function SiteHeader({ storeName }: { storeName: string }) {
  const pathname = usePathname();
  const { count } = useCart();
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const visibleCount = hydrated ? count : 0;
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;

  return (
    <header className="sticky top-0 z-20 border-b border-ink/10 bg-ivory/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="font-serif text-2xl tracking-tight text-ink">
          {storeName}
        </Link>

        <nav aria-label="Principale" className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-ink/80 hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/carrello"
            className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-ink hover:bg-sand"
            aria-label={
              visibleCount === 0
                ? "Carrello"
                : `Carrello, ${visibleCount} ${visibleCount === 1 ? "articolo" : "articoli"}`
            }
          >
            <BagIcon />
            <span className="hidden sm:inline">Carrello</span>
            {visibleCount > 0 ? (
              <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-ink px-1.5 text-xs text-ivory">
                {visibleCount}
              </span>
            ) : null}
          </Link>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-sand md:hidden"
            aria-expanded={open}
            aria-controls="menu-mobile"
            onClick={() => setOpenPath(open ? null : pathname)}
          >
            <span className="sr-only">
              {open ? "Chiudi menu" : "Apri menu"}
            </span>
            <MenuIcon open={open} />
          </button>
        </div>
      </div>

      {open ? (
        <nav
          id="menu-mobile"
          aria-label="Mobile"
          className="border-t border-ink/10 px-4 py-3 md:hidden"
        >
          <ul className="flex flex-col">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded-lg px-2 py-3 text-ink hover:bg-sand"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}

function BagIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M6 8h12l-1 12H7L6 8Z" />
      <path d="M9 8V7a3 3 0 0 1 6 0v1" />
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      {open ? (
        <path d="M6 6l12 12M18 6 6 18" />
      ) : (
        <path d="M4 7h16M4 12h16M4 17h16" />
      )}
    </svg>
  );
}
