"use client";

import Link from "next/link";
import { useEffect, useId, useState, type FormEvent } from "react";
import { loadCartCatalog, type CartCatalogItem } from "@/app/(store)/carrello/actions";
import { useCart } from "@/components/cart/cart-provider";
import { Button, ButtonLink } from "@/components/ui/button";
import { REQUEST_IDEMPOTENCY_STORAGE_KEY } from "@/lib/orders/constants";
import { formatPrice } from "@/lib/products/price";
import { submitPurchaseRequest } from "@/app/(store)/ordine/actions";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  province: string;
  notes: string;
  privacyAccepted: boolean;
  companyFax: string;
};

const emptyForm: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  street: "",
  houseNumber: "",
  postalCode: "",
  city: "",
  province: "",
  notes: "",
  privacyAccepted: false,
  companyFax: "",
};

export function RequestForm() {
  const { items, clear } = useCart();
  const [catalog, setCatalog] = useState<CartCatalogItem[] | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const formId = useId();

  useEffect(() => {
    let active = true;
    loadCartCatalog().then((products) => {
      if (active) {
        setCatalog(products);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  if (items.length === 0) {
    return (
      <div className="space-y-4">
        <p>Il carrello è vuoto. Aggiungi un album prima di inviare la richiesta.</p>
        <ButtonLink href="/prodotti">Vai al catalogo</ButtonLink>
      </div>
    );
  }

  if (!catalog) {
    return <p>Caricamento del riepilogo…</p>;
  }

  const lines = items.map((item) => {
    const product = catalog.find((entry) => entry.id === item.productId);
    return {
      ...item,
      product,
    };
  });
  const blocked = lines.some((line) => !line.product || !line.product.isAvailable);
  const total = lines.reduce(
    (sum, line) =>
      line.product?.isAvailable
        ? sum + line.product.price * line.quantity
        : sum,
    0,
  );

  function update<Key extends keyof FormState>(key: Key, value: FormState[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || blocked) {
      return;
    }

    setPending(true);
    setMessage(null);
    setFieldErrors({});

    const idempotencyKey = readIdempotencyKey();

    try {
      const result = await submitPurchaseRequest({
        ...form,
        idempotencyKey,
        items: lines.flatMap((line) =>
          line.product
            ? [{ productId: line.product.id, quantity: line.quantity }]
            : [],
        ),
      });

      if (!result.ok) {
        setPending(false);
        setMessage(result.message);
        setFieldErrors(result.fieldErrors ?? {});
      }
    } catch (error) {
      if (isNextRedirect(error)) {
        sessionStorage.removeItem(REQUEST_IDEMPOTENCY_STORAGE_KEY);
        clear();
        throw error;
      }

      setPending(false);
      setMessage("Non è stato possibile inviare la richiesta. Riprova.");
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <section>
        <h2 className="font-serif text-3xl text-ink">Riepilogo</h2>
        <ul className="mt-4 divide-y divide-ink/10">
          {lines.map((line) => (
            <li key={line.productId} className="flex justify-between gap-4 py-3">
              <div>
                <p className="text-ink">
                  {line.product?.name ?? "Prodotto non più disponibile"}
                </p>
                <p className="text-sm text-stone">Quantità {line.quantity}</p>
                {line.product && !line.product.isAvailable ? (
                  <p className="text-sm text-terracotta">Non disponibile</p>
                ) : null}
              </div>
              <p>
                {line.product?.isAvailable
                  ? formatPrice(line.product.price * line.quantity)
                  : "—"}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex justify-between text-lg">
          <span>Totale prodotti</span>
          <span>{formatPrice(total)}</span>
        </p>
        <p className="mt-2 text-sm leading-6 text-stone">
          Le spese di spedizione non sono incluse e verranno comunicate dal
          titolare.
        </p>
        {blocked ? (
          <p className="mt-4 text-sm text-terracotta">
            Rimuovi gli album non disponibili dal carrello prima di continuare.
          </p>
        ) : null}
      </section>

      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        <div className="absolute -left-[9999px]" aria-hidden="true">
          <label>
            Fax
            <input
              tabIndex={-1}
              autoComplete="off"
              value={form.companyFax}
              onChange={(event) => update("companyFax", event.target.value)}
            />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id={`${formId}-first-name`}
            label="Nome"
            autoComplete="given-name"
            value={form.firstName}
            error={fieldErrors.firstName}
            onChange={(value) => update("firstName", value)}
          />
          <Field
            id={`${formId}-last-name`}
            label="Cognome"
            autoComplete="family-name"
            value={form.lastName}
            error={fieldErrors.lastName}
            onChange={(value) => update("lastName", value)}
          />
        </div>
        <Field
          id={`${formId}-email`}
          label="Email"
          type="email"
          autoComplete="email"
          value={form.email}
          error={fieldErrors.email}
          onChange={(value) => update("email", value)}
        />
        <Field
          id={`${formId}-phone`}
          label="Telefono"
          type="tel"
          autoComplete="tel"
          value={form.phone}
          error={fieldErrors.phone}
          onChange={(value) => update("phone", value)}
        />
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_8rem]">
          <Field
            id={`${formId}-street`}
            label="Indirizzo"
            autoComplete="address-line1"
            value={form.street}
            error={fieldErrors.street}
            onChange={(value) => update("street", value)}
          />
          <Field
            id={`${formId}-house-number`}
            label="Numero civico"
            autoComplete="address-line2"
            value={form.houseNumber}
            error={fieldErrors.houseNumber}
            onChange={(value) => update("houseNumber", value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field
            id={`${formId}-postal-code`}
            label="CAP"
            autoComplete="postal-code"
            inputMode="numeric"
            value={form.postalCode}
            error={fieldErrors.postalCode}
            onChange={(value) => update("postalCode", value)}
          />
          <Field
            id={`${formId}-city`}
            label="Città"
            autoComplete="address-level2"
            value={form.city}
            error={fieldErrors.city}
            onChange={(value) => update("city", value)}
          />
          <Field
            id={`${formId}-province`}
            label="Provincia"
            autoComplete="address-level1"
            value={form.province}
            error={fieldErrors.province}
            onChange={(value) => update("province", value)}
          />
        </div>
        <label className="block text-sm text-ink" htmlFor={`${formId}-notes`}>
          Note per il venditore
          <span className="ml-2 text-stone">facoltative</span>
          <textarea
            id={`${formId}-notes`}
            value={form.notes}
            onChange={(event) => update("notes", event.target.value)}
            rows={4}
            className="mt-2 w-full rounded-2xl border border-ink/20 bg-ivory px-3 py-2"
            aria-invalid={fieldErrors.notes ? true : undefined}
          />
        </label>
        {fieldErrors.notes ? (
          <p className="text-sm text-terracotta" role="alert">
            {fieldErrors.notes}
          </p>
        ) : null}
        <label className="flex items-start gap-3 text-sm leading-6 text-ink">
          <input
            type="checkbox"
            className="mt-1"
            checked={form.privacyAccepted}
            onChange={(event) => update("privacyAccepted", event.target.checked)}
            aria-invalid={fieldErrors.privacyAccepted ? true : undefined}
          />
          <span>
            Dichiaro di aver preso visione dell&apos;
            <Link href="/privacy" className="underline">
              informativa privacy
            </Link>
            .
          </span>
        </label>
        {fieldErrors.privacyAccepted ? (
          <p className="text-sm text-terracotta" role="alert">
            {fieldErrors.privacyAccepted}
          </p>
        ) : null}
        {message ? (
          <p className="text-sm text-terracotta" role="alert">
            {message}
          </p>
        ) : null}
        <Button type="submit" disabled={pending || blocked}>
          {pending ? "Invio in corso…" : "Invia richiesta d'acquisto"}
        </Button>
      </form>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  error,
  onChange,
  type = "text",
  autoComplete,
  inputMode,
}: {
  id: string;
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  inputMode?: "numeric" | "text";
}) {
  return (
    <label className="block text-sm text-ink" htmlFor={id}>
      {label}
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        inputMode={inputMode}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className="mt-2 w-full rounded-full border border-ink/20 bg-ivory px-3 py-2"
      />
      {error ? (
        <span id={`${id}-error`} className="mt-1 block text-terracotta" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}

function isNextRedirect(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    String(error.digest).startsWith("NEXT_REDIRECT")
  );
}

function readIdempotencyKey() {
  const existing = sessionStorage.getItem(REQUEST_IDEMPOTENCY_STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const key = crypto.randomUUID();
  sessionStorage.setItem(REQUEST_IDEMPOTENCY_STORAGE_KEY, key);
  return key;
}
