"use client";

import { useId, useState, type FormEvent } from "react";
import {
  createProduct,
  updateProduct,
  type ActionResult,
} from "@/app/admin/prodotti/actions";
import { Button } from "@/components/ui/button";
import { CheckboxField, Field, TextArea } from "@/components/ui/field";
import { slugifyName } from "@/lib/products/slug";

type FeatureDraft = { name: string; value: string };

type ProductFormValues = {
  name: string;
  slug: string;
  price: string;
  shortDescription: string;
  description: string;
  isPublished: boolean;
  isAvailable: boolean;
  availabilityNoticeEnabled: boolean;
  availabilityNoticeText: string;
  features: FeatureDraft[];
};

const emptyValues: ProductFormValues = {
  name: "",
  slug: "",
  price: "",
  shortDescription: "",
  description: "",
  isPublished: false,
  isAvailable: true,
  availabilityNoticeEnabled: false,
  availabilityNoticeText: "",
  features: [],
};

export function ProductForm({
  productId,
  initial,
}: {
  productId?: string;
  initial?: Partial<ProductFormValues>;
}) {
  const formId = useId();
  const [values, setValues] = useState<ProductFormValues>({
    ...emptyValues,
    ...initial,
    features: initial?.features ?? [],
  });
  const [slugTouched, setSlugTouched] = useState(Boolean(productId));
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function update<Key extends keyof ProductFormValues>(
    key: Key,
    value: ProductFormValues[Key],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) {
      return;
    }

    setPending(true);
    setMessage(null);
    setFieldErrors({});

    const payload = {
      ...values,
      price: values.price,
      features: values.features.filter(
        (feature) => feature.name.trim() && feature.value.trim(),
      ),
    };

    try {
      const result: ActionResult = productId
        ? await updateProduct(productId, payload)
        : await createProduct(payload);

      if (!result.ok) {
        setPending(false);
        setMessage(result.message);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      setPending(false);
      setMessage("Prodotto salvato.");
    } catch (error) {
      if (isNextRedirect(error)) {
        throw error;
      }

      setPending(false);
      setMessage("Salvataggio non riuscito. Riprova.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <section className="space-y-4">
        <h2 className="font-serif text-3xl text-ink">Dati principali</h2>
        <Field
          id={`${formId}-name`}
          label="Nome"
          value={values.name}
          error={fieldErrors.name}
          onChange={(name) => {
            update("name", name);
            if (!slugTouched) {
              update("slug", slugifyName(name));
            }
          }}
        />
        <Field
          id={`${formId}-slug`}
          label="Slug"
          value={values.slug}
          error={fieldErrors.slug}
          onChange={(slug) => {
            setSlugTouched(true);
            update("slug", slug);
          }}
        />
        <Field
          id={`${formId}-price`}
          label="Prezzo (EUR)"
          value={values.price}
          inputMode="decimal"
          error={fieldErrors.price}
          onChange={(price) => update("price", price)}
        />
        <TextArea
          id={`${formId}-short`}
          label="Descrizione breve"
          value={values.shortDescription}
          error={fieldErrors.shortDescription}
          onChange={(shortDescription) => update("shortDescription", shortDescription)}
          rows={3}
        />
        <TextArea
          id={`${formId}-description`}
          label="Descrizione completa"
          value={values.description}
          error={fieldErrors.description}
          onChange={(description) => update("description", description)}
          rows={8}
        />
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-3xl text-ink">Stati</h2>
        <CheckboxField
          id={`${formId}-published`}
          label="Pubblicato nel catalogo"
          checked={values.isPublished}
          onChange={(isPublished) => update("isPublished", isPublished)}
        />
        <CheckboxField
          id={`${formId}-available`}
          label="Disponibile all'acquisto"
          checked={values.isAvailable}
          onChange={(isAvailable) => update("isAvailable", isAvailable)}
        />
        <CheckboxField
          id={`${formId}-notice`}
          label="Mostra avviso scorte limitate"
          checked={values.availabilityNoticeEnabled}
          onChange={(availabilityNoticeEnabled) =>
            update("availabilityNoticeEnabled", availabilityNoticeEnabled)
          }
        />
        <Field
          id={`${formId}-notice-text`}
          label="Testo avviso (facoltativo)"
          value={values.availabilityNoticeText}
          error={fieldErrors.availabilityNoticeText}
          onChange={(availabilityNoticeText) =>
            update("availabilityNoticeText", availabilityNoticeText)
          }
        />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-serif text-3xl text-ink">Caratteristiche</h2>
          <Button
            type="button"
            variant="secondary"
            className="px-4 py-2"
            onClick={() =>
              update("features", [...values.features, { name: "", value: "" }])
            }
          >
            Aggiungi
          </Button>
        </div>
        {values.features.length === 0 ? (
          <p className="text-sm text-stone">Nessuna caratteristica.</p>
        ) : (
          <ul className="space-y-3">
            {values.features.map((feature, index) => (
              <li
                key={`${formId}-feature-${index}`}
                className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
              >
                <Field
                  id={`${formId}-feature-name-${index}`}
                  label="Nome"
                  value={feature.name}
                  error={fieldErrors[`features.${index}.name`]}
                  onChange={(name) => {
                    const next = values.features.slice();
                    next[index] = { ...next[index], name };
                    update("features", next);
                  }}
                />
                <Field
                  id={`${formId}-feature-value-${index}`}
                  label="Valore"
                  value={feature.value}
                  error={fieldErrors[`features.${index}.value`]}
                  onChange={(value) => {
                    const next = values.features.slice();
                    next[index] = { ...next[index], value };
                    update("features", next);
                  }}
                />
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="secondary"
                    className="px-4 py-2"
                    onClick={() =>
                      update(
                        "features",
                        values.features.filter((_, itemIndex) => itemIndex !== index),
                      )
                    }
                  >
                    Rimuovi
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {message ? (
        <p
          className={`text-sm ${message.includes("salvato") ? "text-ink" : "text-terracotta"}`}
          role="status"
        >
          {message}
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending
          ? "Salvataggio…"
          : productId
            ? "Salva modifiche"
            : "Crea prodotto"}
      </Button>
    </form>
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
