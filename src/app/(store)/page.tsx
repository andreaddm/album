import { ProductCard } from "@/components/products/product-card";
import { ButtonLink } from "@/components/ui/button";
import {
  getStorePublicSettings,
  listPublishedProducts,
} from "@/lib/products/queries";

const steps = [
  {
    title: "Scegli l'album",
    text: "Sfoglia il catalogo e aggiungi al carrello gli album vuoti che ti interessano.",
  },
  {
    title: "Invia la richiesta",
    text: "Lascia i tuoi recapiti e l'indirizzo. Non è un ordine confermato e non c'è pagamento online.",
  },
  {
    title: "Ti contattiamo",
    text: "Il titolare verifica disponibilità, spese di spedizione e consegna in contrassegno.",
  },
  {
    title: "Personalizzi a casa",
    text: "Ricevi l'album vuoto e incolli le tue fotografie. Il sito non chiede di caricarle.",
  },
] as const;

const benefits = [
  {
    title: "Album vuoti",
    text: "Le fotografie restano tue. Il sito non chiede di caricarle.",
  },
  {
    title: "Nessun pagamento online",
    text: "Invii una richiesta. L'acquisto si conferma solo dopo il contatto.",
  },
  {
    title: "Spedizione da concordare",
    text: "Il prezzo in pagina è solo quello dei prodotti, senza spedizione.",
  },
] as const;

export default async function HomePage() {
  const [products, settings] = await Promise.all([
    listPublishedProducts(),
    getStorePublicSettings(),
  ]);
  const unavailableMessage =
    settings?.unavailableMessage?.trim() || "Non disponibile";
  const featured = [...products]
    .sort((a, b) => Number(b.isAvailable) - Number(a.isAvailable))
    .slice(0, 3);

  return (
    <main>
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <p className="text-sm uppercase tracking-[0.18em] text-terracotta">
          Album fotografici
        </p>
        <h1 className="mt-4 max-w-xl text-5xl leading-tight text-ink sm:text-6xl">
          Vuoti, pronti per le tue fotografie.
        </h1>
        <p className="mt-6 max-w-lg text-lg leading-8 text-stone">
          {settings?.homepageIntro?.trim() ||
            "Scegli un album, invia una richiesta d'acquisto e attendi il contatto del titolare. Le spese di spedizione si concordano dopo, non durante la richiesta."}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/prodotti">Vai al catalogo</ButtonLink>
          <ButtonLink href="#come-funziona" variant="secondary">
            Come funziona
          </ButtonLink>
        </div>
      </section>

      {featured.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <h2 className="font-serif text-4xl text-ink">In evidenza</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                unavailableMessage={unavailableMessage}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section id="come-funziona" className="bg-sand">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <h2 className="text-4xl text-ink">Come funziona</h2>
          <ol className="mt-8 grid gap-6 sm:grid-cols-2">
            {steps.map((step, index) => (
              <li key={step.title} className="rounded-3xl bg-ivory p-6">
                <p className="text-sm text-terracotta">0{index + 1}</p>
                <h3 className="mt-2 text-2xl text-ink">{step.title}</h3>
                <p className="mt-2 leading-7 text-stone">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="font-serif text-4xl text-ink">Perché questi album</h2>
        <ul className="mt-8 grid gap-6 md:grid-cols-3">
          {benefits.map((benefit) => (
            <li key={benefit.title}>
              <h3 className="font-serif text-2xl text-ink">{benefit.title}</h3>
              <p className="mt-2 leading-7 text-stone">{benefit.text}</p>
            </li>
          ))}
        </ul>
        <div className="mt-10">
          <ButtonLink href="/prodotti">Sfoglia il catalogo</ButtonLink>
        </div>
      </section>
    </main>
  );
}
