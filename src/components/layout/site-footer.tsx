import Link from "next/link";
import { WhatsAppLink } from "@/components/layout/whatsapp-link";
import { visitorWhatsAppText } from "@/lib/whatsapp";

const links = [
  { href: "/prodotti", label: "Catalogo" },
  { href: "/chi-siamo", label: "Chi siamo" },
  { href: "/contatti", label: "Contatti" },
  { href: "/privacy", label: "Privacy" },
  { href: "/cookie", label: "Cookie" },
] as const;

export function SiteFooter({
  storeName,
  whatsappNumber,
}: {
  storeName: string;
  whatsappNumber?: string | null;
}) {
  return (
    <footer className="mt-auto border-t border-ink/10 bg-sand">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="font-serif text-2xl text-ink">{storeName}</p>
          <p className="mt-3 max-w-md text-sm leading-6 text-stone">
            Album fotografici vuoti. Le fotografie si incollano dopo
            l&apos;acquisto: il sito non raccoglie immagini personali.
          </p>
          <WhatsAppLink
            number={whatsappNumber}
            text={visitorWhatsAppText(storeName)}
            className="mt-4 inline-flex text-sm text-terracotta underline"
          >
            Scrivi su WhatsApp
          </WhatsAppLink>
        </div>
        <nav aria-label="Piè di pagina">
          <ul className="flex flex-col gap-2 text-sm">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-ink hover:text-terracotta">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-ink/10 px-4 py-4 text-center text-xs text-stone sm:px-6">
        Nessun pagamento online. I recapiti mostrati sono quelli configurati dal
        titolare.
      </div>
    </footer>
  );
}
