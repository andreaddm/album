import type { Metadata } from "next";
import { RequestForm } from "@/components/orders/request-form";

export const metadata: Metadata = {
  title: "Richiesta d'acquisto",
  description:
    "Invia una richiesta d'acquisto. Non è un ordine confermato e non include la spedizione.",
};

export default function OrderPage() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6">
      <h1 className="font-serif text-5xl text-ink">Richiesta d&apos;acquisto</h1>
      <p className="mt-4 max-w-2xl leading-7 text-stone">
        L&apos;invio non conferma l&apos;ordine e non richiede un pagamento.
        Il titolare ti contatterà per disponibilità, spedizione e contrassegno.
      </p>
      <div className="mt-10">
        <RequestForm />
      </div>
    </main>
  );
}
