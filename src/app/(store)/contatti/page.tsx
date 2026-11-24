import type { Metadata } from "next";
import { PageIntro } from "@/components/layout/page-intro";
import { WhatsAppLink } from "@/components/layout/whatsapp-link";
import { getStorePublicSettings } from "@/lib/products/queries";
import { visitorWhatsAppText } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contatti",
};

export default async function ContactPage() {
  const settings = await getStorePublicSettings();
  const whatsappNumber = settings?.whatsappNumber;
  const storeName = settings?.storeName?.trim() || "Album";

  return (
    <PageIntro title="Contatti">
      {whatsappNumber ? (
        <p>
          Puoi scrivere su WhatsApp:{" "}
          <WhatsAppLink
            number={whatsappNumber}
            text={visitorWhatsAppText(storeName)}
            className="text-terracotta underline"
          >
            apri la chat
          </WhatsAppLink>
          . Il messaggio non crea automaticamente una richiesta d&apos;acquisto.
        </p>
      ) : (
        <p>
          Il numero WhatsApp verrà mostrato quando sarà configurato
          nell&apos;area amministrativa.
        </p>
      )}
      <p className="mt-4">
        L&apos;email di notifica delle richieste è riservata al titolare e non
        viene pubblicata in questa pagina. Per un acquisto usa il catalogo e
        invia una richiesta dal carrello.
      </p>
    </PageIntro>
  );
}
