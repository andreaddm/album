"use client";

import { useState, type FormEvent } from "react";
import { updateStoreSettings } from "@/app/admin/impostazioni/actions";
import { Button } from "@/components/ui/button";
import { Field, TextArea } from "@/components/ui/field";

type SettingsValues = {
  storeName: string;
  notificationEmail: string;
  whatsappNumber: string;
  homepageIntro: string;
  unavailableMessage: string;
};

export function SettingsForm({ initial }: { initial: SettingsValues }) {
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
    <form onSubmit={onSubmit} className="space-y-5">
      <Field
        id="store-name"
        label="Nome negozio"
        value={values.storeName}
        error={fieldErrors.storeName}
        onChange={(storeName) => update("storeName", storeName)}
      />
      <Field
        id="notification-email"
        label="Email notifiche richieste"
        type="email"
        value={values.notificationEmail}
        error={fieldErrors.notificationEmail}
        onChange={(notificationEmail) => update("notificationEmail", notificationEmail)}
      />
      <Field
        id="whatsapp-number"
        label="Numero WhatsApp"
        value={values.whatsappNumber}
        error={fieldErrors.whatsappNumber}
        onChange={(whatsappNumber) => update("whatsappNumber", whatsappNumber)}
      />
      <TextArea
        id="homepage-intro"
        label="Introduzione homepage"
        value={values.homepageIntro}
        error={fieldErrors.homepageIntro}
        onChange={(homepageIntro) => update("homepageIntro", homepageIntro)}
        rows={4}
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
      {message ? (
        <p
          className={`text-sm ${message.includes("salvate") ? "text-ink" : "text-terracotta"}`}
          role="status"
        >
          {message}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Salvataggio…" : "Salva impostazioni"}
      </Button>
    </form>
  );
}
