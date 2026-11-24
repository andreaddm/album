import type { Metadata } from "next";
import { CartContents } from "@/components/cart/cart-contents";
import { getStorePublicSettings } from "@/lib/products/queries";

export const metadata: Metadata = {
  title: "Carrello",
  description: "Riepilogo degli album scelti, senza spese di spedizione.",
};

export default async function CartPage() {
  const settings = await getStorePublicSettings();
  const unavailableMessage =
    settings?.unavailableMessage?.trim() || "Non disponibile";
  const storeName = settings?.storeName?.trim() || "Album";

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
      <h1 className="font-serif text-5xl text-ink">Carrello</h1>
      <div className="mt-8">
        <CartContents
          unavailableMessage={unavailableMessage}
          storeName={storeName}
          whatsappNumber={settings?.whatsappNumber}
        />
      </div>
    </main>
  );
}
