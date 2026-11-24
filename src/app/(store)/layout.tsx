import { Suspense } from "react";
import { CartProvider } from "@/components/cart/cart-provider";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { WhatsAppFab } from "@/components/layout/whatsapp-fab";
import { getStorePublicSettings } from "@/lib/products/queries";
import { site } from "@/lib/site";

export default async function StoreLayout({ children }: LayoutProps<"/">) {
  const settings = await getStorePublicSettings();
  const storeName = settings?.storeName?.trim() || site.name;
  const whatsappNumber = settings?.whatsappNumber;

  return (
    <CartProvider>
      <a
        href="#contenuto"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-30 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-ivory"
      >
        Vai al contenuto
      </a>
      <Suspense
        fallback={
          <header className="border-b border-ink/10 bg-ivory">
            <div className="mx-auto flex max-w-6xl px-4 py-4 sm:px-6">
              <span className="font-serif text-2xl text-ink">{storeName}</span>
            </div>
          </header>
        }
      >
        <SiteHeader storeName={storeName} />
      </Suspense>
      <div id="contenuto" className="flex flex-1 flex-col">
        {children}
      </div>
      <SiteFooter storeName={storeName} whatsappNumber={whatsappNumber} />
      <WhatsAppFab number={whatsappNumber} storeName={storeName} />
    </CartProvider>
  );
}
