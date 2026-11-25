"use client";

import { useState, type FormEvent } from "react";
import { updateStoreSettings } from "@/app/admin/impostazioni/actions";
import type { SettingsTabId } from "@/components/admin/settings-tabs";
import { Button } from "@/components/ui/button";
import { Field, TextArea } from "@/components/ui/field";
import {
  MAX_HOMEPAGE_HOW_STEPS,
  MAX_HOMEPAGE_WHY_ITEMS,
  MIN_HOMEPAGE_HOW_STEPS,
  MIN_HOMEPAGE_WHY_ITEMS,
  type HomepageCopyItem,
} from "@/lib/settings/homepage-defaults";

export type SettingsValues = {
  storeName: string;
  notificationEmail: string;
  whatsappNumber: string;
  homepageHeadline: string;
  homepageIntro: string;
  unavailableMessage: string;
  featuredLimit: 3 | 6 | 9;
  homepageEyebrow: string;
  homepageCtaCatalog: string;
  homepageCtaHow: string;
  homepageFeaturedTitle: string;
  homepageHowTitle: string;
  homepageHowSteps: HomepageCopyItem[];
  homepageWhyTitle: string;
  homepageWhyItems: HomepageCopyItem[];
  homepageWhyCta: string;
  privacyTitle: string;
  privacyBody: string;
  cookieTitle: string;
  cookieBody: string;
  aboutTitle: string;
  aboutBody: string;
};

export function SettingsForm({
  initial,
  section,
}: {
  initial: SettingsValues;
  section: SettingsTabId;
}) {
  const [values, setValues] = useState(initial);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function update<Key extends keyof SettingsValues>(
    key: Key,
    value: SettingsValues[Key],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function updateHowStep(
    index: number,
    key: keyof HomepageCopyItem,
    value: string,
  ) {
    const next = values.homepageHowSteps.map((item, itemIndex) =>
      itemIndex === index ? { ...item, [key]: value } : item,
    );
    update("homepageHowSteps", next);
  }

  function updateWhyItem(
    index: number,
    key: keyof HomepageCopyItem,
    value: string,
  ) {
    const next = values.homepageWhyItems.map((item, itemIndex) =>
      itemIndex === index ? { ...item, [key]: value } : item,
    );
    update("homepageWhyItems", next);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) {
      return;
    }

    setPending(true);
    setMessage(null);
    setFieldErrors({});

    const result = await updateStoreSettings(values);
    setPending(false);

    if (!result.ok) {
      setMessage(result.message);
      setFieldErrors(result.fieldErrors ?? {});
      return;
    }

    setMessage("Impostazioni salvate.");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 pb-28">
      {section === "negozio" ? (
        <>
          <Field
            id="store-name"
            label="Nome negozio"
            value={values.storeName}
            error={fieldErrors.storeName}
            onChange={(storeName) => update("storeName", storeName)}
          />
          <Field
            id="whatsapp-number"
            label="Numero WhatsApp"
            value={values.whatsappNumber}
            error={fieldErrors.whatsappNumber}
            onChange={(whatsappNumber) => update("whatsappNumber", whatsappNumber)}
          />
          <Field
            id="unavailable-message"
            label="Messaggio prodotti non disponibili"
            value={values.unavailableMessage}
            error={fieldErrors.unavailableMessage}
            onChange={(unavailableMessage) =>
              update("unavailableMessage", unavailableMessage)
            }
          />
        </>
      ) : null}

      {section === "homepage" ? (
        <>
          <Field
            id="homepage-headline"
            label="Titolo homepage"
            value={values.homepageHeadline}
            error={fieldErrors.homepageHeadline}
            onChange={(homepageHeadline) =>
              update("homepageHeadline", homepageHeadline)
            }
            hint="Testo grande sotto il nome negozio (es. Vuoti, pronti per le tue fotografie.)."
          />
          <TextArea
            id="homepage-intro"
            label="Introduzione homepage"
            value={values.homepageIntro}
            error={fieldErrors.homepageIntro}
            onChange={(homepageIntro) => update("homepageIntro", homepageIntro)}
            rows={4}
          />
          <fieldset className="space-y-3 rounded-3xl bg-sand/50 p-5">
            <legend className="font-serif text-2xl text-ink">
              Album in evidenza
            </legend>
            <p className="text-sm text-stone">
              Quanti prodotti con la spunta «Mostra in evidenza» mostrare in
              homepage. Se abbassi il limite, i prodotti in eccesso perdono la
              spunta (restano i primi in ordine alfabetico).
            </p>
            <div className="flex flex-wrap gap-4">
              {([3, 6, 9] as const).map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-2 text-sm text-ink"
                >
                  <input
                    type="radio"
                    name="featured-limit"
                    value={option}
                    checked={values.featuredLimit === option}
                    onChange={() => update("featuredLimit", option)}
                    className="size-4 accent-ink-button"
                  />
                  {option} album
                </label>
              ))}
            </div>
            {fieldErrors.featuredLimit ? (
              <p className="text-sm text-terracotta" role="alert">
                {fieldErrors.featuredLimit}
              </p>
            ) : null}
          </fieldset>
        </>
      ) : null}

      {section === "homepage-2" ? (
        <>
          <Field
            id="homepage-eyebrow"
            label="Etichetta sopra il titolo (senza sfondo)"
            value={values.homepageEyebrow}
            error={fieldErrors.homepageEyebrow}
            onChange={(homepageEyebrow) =>
              update("homepageEyebrow", homepageEyebrow)
            }
            hint="Visibile solo se non ci sono immagini di sfondo."
          />
          <Field
            id="homepage-cta-catalog"
            label="Pulsante catalogo (hero)"
            value={values.homepageCtaCatalog}
            error={fieldErrors.homepageCtaCatalog}
            onChange={(homepageCtaCatalog) =>
              update("homepageCtaCatalog", homepageCtaCatalog)
            }
          />
          <Field
            id="homepage-cta-how"
            label="Pulsante come funziona (hero)"
            value={values.homepageCtaHow}
            error={fieldErrors.homepageCtaHow}
            onChange={(homepageCtaHow) =>
              update("homepageCtaHow", homepageCtaHow)
            }
          />
          <Field
            id="homepage-featured-title"
            label="Titolo sezione in evidenza"
            value={values.homepageFeaturedTitle}
            error={fieldErrors.homepageFeaturedTitle}
            onChange={(homepageFeaturedTitle) =>
              update("homepageFeaturedTitle", homepageFeaturedTitle)
            }
          />

          <fieldset className="space-y-4 rounded-3xl bg-sand/50 p-5">
            <legend className="font-serif text-2xl text-ink">Come funziona</legend>
            <Field
              id="homepage-how-title"
              label="Titolo sezione"
              value={values.homepageHowTitle}
              error={fieldErrors.homepageHowTitle}
              onChange={(homepageHowTitle) =>
                update("homepageHowTitle", homepageHowTitle)
              }
            />
            {fieldErrors.homepageHowSteps ? (
              <p className="text-sm text-terracotta" role="alert">
                {fieldErrors.homepageHowSteps}
              </p>
            ) : null}
            {values.homepageHowSteps.map((step, index) => (
              <div key={`how-${index}`} className="space-y-3 border-t border-ink/10 pt-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-ink">
                    Passo {index + 1}
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    className="px-4 py-2"
                    disabled={
                      values.homepageHowSteps.length <= MIN_HOMEPAGE_HOW_STEPS
                    }
                    onClick={() =>
                      update(
                        "homepageHowSteps",
                        values.homepageHowSteps.filter(
                          (_, itemIndex) => itemIndex !== index,
                        ),
                      )
                    }
                  >
                    Rimuovi
                  </Button>
                </div>
                <Field
                  id={`homepage-how-title-${index}`}
                  label="Titolo"
                  value={step.title}
                  error={fieldErrors[`homepageHowSteps.${index}.title`]}
                  onChange={(title) => updateHowStep(index, "title", title)}
                />
                <TextArea
                  id={`homepage-how-text-${index}`}
                  label="Testo"
                  value={step.text}
                  error={fieldErrors[`homepageHowSteps.${index}.text`]}
                  onChange={(text) => updateHowStep(index, "text", text)}
                  rows={3}
                />
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              className="px-4 py-2"
              disabled={values.homepageHowSteps.length >= MAX_HOMEPAGE_HOW_STEPS}
              onClick={() =>
                update("homepageHowSteps", [
                  ...values.homepageHowSteps,
                  { title: "", text: "" },
                ])
              }
            >
              Aggiungi passo
            </Button>
            <p className="text-xs text-ink/60">
              Da {MIN_HOMEPAGE_HOW_STEPS} a {MAX_HOMEPAGE_HOW_STEPS} passi.
            </p>
          </fieldset>

          <fieldset className="space-y-4 rounded-3xl bg-sand/50 p-5">
            <legend className="font-serif text-2xl text-ink">
              Perché questi album
            </legend>
            <Field
              id="homepage-why-title"
              label="Titolo sezione"
              value={values.homepageWhyTitle}
              error={fieldErrors.homepageWhyTitle}
              onChange={(homepageWhyTitle) =>
                update("homepageWhyTitle", homepageWhyTitle)
              }
            />
            {fieldErrors.homepageWhyItems ? (
              <p className="text-sm text-terracotta" role="alert">
                {fieldErrors.homepageWhyItems}
              </p>
            ) : null}
            {values.homepageWhyItems.map((item, index) => (
              <div key={`why-${index}`} className="space-y-3 border-t border-ink/10 pt-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-ink">
                    Motivo {index + 1}
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    className="px-4 py-2"
                    disabled={
                      values.homepageWhyItems.length <= MIN_HOMEPAGE_WHY_ITEMS
                    }
                    onClick={() =>
                      update(
                        "homepageWhyItems",
                        values.homepageWhyItems.filter(
                          (_, itemIndex) => itemIndex !== index,
                        ),
                      )
                    }
                  >
                    Rimuovi
                  </Button>
                </div>
                <Field
                  id={`homepage-why-title-${index}`}
                  label="Titolo"
                  value={item.title}
                  error={fieldErrors[`homepageWhyItems.${index}.title`]}
                  onChange={(title) => updateWhyItem(index, "title", title)}
                />
                <TextArea
                  id={`homepage-why-text-${index}`}
                  label="Testo"
                  value={item.text}
                  error={fieldErrors[`homepageWhyItems.${index}.text`]}
                  onChange={(text) => updateWhyItem(index, "text", text)}
                  rows={3}
                />
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              className="px-4 py-2"
              disabled={values.homepageWhyItems.length >= MAX_HOMEPAGE_WHY_ITEMS}
              onClick={() =>
                update("homepageWhyItems", [
                  ...values.homepageWhyItems,
                  { title: "", text: "" },
                ])
              }
            >
              Aggiungi motivo
            </Button>
            <p className="text-xs text-ink/60">
              Da {MIN_HOMEPAGE_WHY_ITEMS} a {MAX_HOMEPAGE_WHY_ITEMS} motivi.
            </p>
            <Field
              id="homepage-why-cta"
              label="Pulsante finale"
              value={values.homepageWhyCta}
              error={fieldErrors.homepageWhyCta}
              onChange={(homepageWhyCta) =>
                update("homepageWhyCta", homepageWhyCta)
              }
            />
          </fieldset>
        </>
      ) : null}

      {section === "altro" ? (
        <>
          <fieldset className="space-y-4 rounded-3xl bg-sand/50 p-5">
            <legend className="font-serif text-2xl text-ink">Chi siamo</legend>
            <Field
              id="about-title"
              label="Titolo"
              value={values.aboutTitle}
              error={fieldErrors.aboutTitle}
              onChange={(aboutTitle) => update("aboutTitle", aboutTitle)}
            />
            <TextArea
              id="about-body"
              label="Testo"
              value={values.aboutBody}
              error={fieldErrors.aboutBody}
              onChange={(aboutBody) => update("aboutBody", aboutBody)}
              rows={8}
            />
            <p className="text-xs text-ink/60">
              Separa i paragrafi con una riga vuota. Lo sfondo e la galleria
              immagini si gestiscono sotto.
            </p>
          </fieldset>

          <fieldset className="space-y-4 rounded-3xl bg-sand/50 p-5">
            <legend className="font-serif text-2xl text-ink">Privacy</legend>
            <Field
              id="privacy-title"
              label="Titolo"
              value={values.privacyTitle}
              error={fieldErrors.privacyTitle}
              onChange={(privacyTitle) => update("privacyTitle", privacyTitle)}
            />
            <TextArea
              id="privacy-body"
              label="Testo"
              value={values.privacyBody}
              error={fieldErrors.privacyBody}
              onChange={(privacyBody) => update("privacyBody", privacyBody)}
              rows={10}
            />
          </fieldset>

          <fieldset className="space-y-4 rounded-3xl bg-sand/50 p-5">
            <legend className="font-serif text-2xl text-ink">Cookie</legend>
            <Field
              id="cookie-title"
              label="Titolo"
              value={values.cookieTitle}
              error={fieldErrors.cookieTitle}
              onChange={(cookieTitle) => update("cookieTitle", cookieTitle)}
            />
            <TextArea
              id="cookie-body"
              label="Testo"
              value={values.cookieBody}
              error={fieldErrors.cookieBody}
              onChange={(cookieBody) => update("cookieBody", cookieBody)}
              rows={10}
            />
          </fieldset>
        </>
      ) : null}

      {section === "notifiche" ? (
        <Field
          id="notification-email"
          label="Email notifiche richieste"
          type="email"
          value={values.notificationEmail}
          error={fieldErrors.notificationEmail}
          onChange={(notificationEmail) =>
            update("notificationEmail", notificationEmail)
          }
        />
      ) : null}

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-end p-4 sm:p-6">
        <div className="pointer-events-auto flex max-w-full flex-col items-end gap-2">
          {message ? (
            <p
              className={`rounded-full px-4 py-2 text-sm shadow-sm ${
                message.includes("salvate")
                  ? "bg-ivory text-ink"
                  : "bg-ivory text-terracotta"
              }`}
              role="status"
            >
              {message}
            </p>
          ) : null}
          <Button type="submit" disabled={pending} className="shadow-md">
            {pending ? "Salvataggio…" : "Salva impostazioni"}
          </Button>
        </div>
      </div>
    </form>
  );
}
