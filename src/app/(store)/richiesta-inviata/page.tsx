import type { Metadata } from "next";
import { Suspense } from "react";
import { ClearCartAfterRequest } from "@/components/orders/clear-cart";
import { ButtonLink } from "@/components/ui/button";
import { PURCHASE_REQUEST_COOKIE } from "@/lib/orders/constants";
import { formatPrice } from "@/lib/products/price";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";
import { connection } from "next/server";

export const metadata: Metadata = {
  title: "Richiesta inviata",
  description: "La richiesta è stata ricevuta e non è ancora un ordine confermato.",
};

export default function RequestSentPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
          <p className="text-stone">Caricamento della richiesta…</p>
        </main>
      }
    >
      <RequestSent />
    </Suspense>
  );
}

async function RequestSent() {
  await connection();
  const cookieStore = await cookies();
  const code = cookieStore.get(PURCHASE_REQUEST_COOKIE)?.value;

  if (!code || !/^RQ-[A-Z2-9]{8}$/.test(code)) {
    return <MissingRequest />;
  }

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("orders")
    .select(
      `
      reference_code,
      products_total,
      order_items (
        id,
        product_name_snapshot,
        quantity,
        line_total_snapshot
      )
    `,
    )
    .eq("reference_code", code)
    .maybeSingle();

  if (!data) {
    return <MissingRequest />;
  }

  const items = [...(data.order_items ?? [])].sort((a, b) =>
    a.product_name_snapshot.localeCompare(b.product_name_snapshot, "it"),
  );

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
      <ClearCartAfterRequest />
      <h1 className="font-serif text-5xl text-ink">Richiesta ricevuta</h1>
      <p className="mt-4 leading-7 text-ink">
        La richiesta è stata ricevuta, ma non è ancora un ordine confermato. Il
        titolare ti contatterà per disponibilità, spedizione e contrassegno.
      </p>
      <p className="mt-6 text-sm text-stone">Codice richiesta</p>
      <p className="font-serif text-3xl text-ink">{data.reference_code}</p>
      <ul className="mt-8 divide-y divide-ink/10">
        {items.map((item) => (
          <li key={item.id} className="flex justify-between gap-4 py-3">
            <span>
              {item.product_name_snapshot}
              <span className="ml-2 text-sm text-stone">× {item.quantity}</span>
            </span>
            <span>{formatPrice(Number(item.line_total_snapshot))}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 flex justify-between text-lg">
        <span>Totale prodotti</span>
        <span>{formatPrice(Number(data.products_total))}</span>
      </p>
      <p className="mt-2 text-sm text-stone">Spedizione esclusa.</p>
      <div className="mt-8">
        <ButtonLink href="/prodotti" variant="secondary">
          Torna al catalogo
        </ButtonLink>
      </div>
    </main>
  );
}

function MissingRequest() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
      <h1 className="font-serif text-5xl text-ink">Nessuna richiesta da mostrare</h1>
      <p className="mt-4 leading-7 text-stone">
        Questa pagina conferma solo una richiesta appena inviata da questo
        browser.
      </p>
      <div className="mt-8">
        <ButtonLink href="/prodotti">Vai al catalogo</ButtonLink>
      </div>
    </main>
  );
}
