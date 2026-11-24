import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-16 sm:px-6">
      <h1 className="font-serif text-5xl text-ink">Pagina non trovata</h1>
      <p className="mt-4 text-stone">
        Questo indirizzo non corrisponde a una pagina o a un album pubblicato.
      </p>
      <div className="mt-8">
        <ButtonLink href="/prodotti">Vai al catalogo</ButtonLink>
      </div>
    </main>
  );
}
