import { WhatsAppLink } from "@/components/layout/whatsapp-link";
import { visitorWhatsAppText } from "@/lib/whatsapp";

export function WhatsAppFab({
  number,
  storeName,
}: {
  number: string | null | undefined;
  storeName: string;
}) {
  return (
    <WhatsAppLink
      number={number}
      text={visitorWhatsAppText(storeName)}
      className="fixed bottom-5 right-5 z-20 rounded-full bg-ink-button px-5 py-3 text-sm font-semibold text-ivory shadow-lg hover:bg-ink"
    >
      WhatsApp
    </WhatsAppLink>
  );
}
