import type { Metadata } from "next";
import { connection } from "next/server";
import { SettingsForm } from "@/components/admin/settings-form";
import { getEmailEnv } from "@/lib/email/env";
import { listEmailLogs } from "@/lib/orders/admin";
import { formatAdminDateTime } from "@/lib/orders/status";
import { getAdminStoreSettings } from "@/lib/settings/admin";

export const metadata: Metadata = {
  title: "Impostazioni",
  robots: { index: false, follow: false },
};

export default async function AdminSettingsPage() {
  await connection();
  const emailEnv = getEmailEnv();
  const [settings, emailLogs] = await Promise.all([
    getAdminStoreSettings(),
    listEmailLogs(30),
  ]);

  if (!settings) {
    return (
      <main>
        <h1 className="font-serif text-5xl text-ink">Impostazioni</h1>
        <p className="mt-4 text-stone">
          Impostazioni del negozio non trovate. Controlla il database.
        </p>
      </main>
    );
  }

  return (
    <main className="space-y-10">
      <div>
        <h1 className="font-serif text-5xl text-ink">Impostazioni</h1>
        <p className="mt-3 text-stone">
          Dati pubblici del negozio e destinazione delle notifiche. Nessuna
          credenziale segreta è modificabile da qui.
        </p>
      </div>

      {emailEnv.provider === "console" ? (
        <p className="rounded-3xl bg-sand px-5 py-4 text-sm leading-6 text-ink" role="status">
          Le email sono in modalità <strong>console</strong>: non arrivano in
          casella, vengono solo scritte nel terminale del server e segnate come
          «inviate» nel log. Per invii reali metti in{" "}
          <code className="text-terracotta">.env.local</code>{" "}
          <code className="text-terracotta">EMAIL_PROVIDER=resend</code>,{" "}
          <code className="text-terracotta">RESEND_API_KEY</code> e{" "}
          <code className="text-terracotta">EMAIL_FROM</code>, poi riavvia{" "}
          <code className="text-terracotta">npm run dev</code>.
        </p>
      ) : (
        <p className="rounded-3xl bg-sand px-5 py-4 text-sm leading-6 text-ink" role="status">
          Provider email attivo: <strong>Resend</strong>
          {emailEnv.from ? ` · mittente ${emailEnv.from}` : ""}.
          {!emailEnv.resendApiKey
            ? " Manca RESEND_API_KEY: gli invii falliranno finché non la configuri."
            : ""}{" "}
          {emailEnv.sendCustomerReceipt
            ? "Ricevuta automatica al cliente: attiva."
            : "Ricevuta automatica al cliente: disattiva (solo notifica al venditore)."}
        </p>
      )}

      <SettingsForm
        initial={{
          storeName: settings.storeName,
          notificationEmail: settings.notificationEmail ?? "",
          whatsappNumber: settings.whatsappNumber ?? "",
          homepageIntro: settings.homepageIntro ?? "",
          unavailableMessage: settings.unavailableMessage ?? "",
        }}
      />

      <section className="space-y-4">
        <h2 className="font-serif text-3xl text-ink">Log notifiche email</h2>
        <p className="text-sm text-stone">
          Ogni tentativo di invio (ok o fallito) resta registrato qui.
        </p>
        {emailLogs.length === 0 ? (
          <p className="text-sm text-stone">Nessun tentativo registrato.</p>
        ) : (
          <ul className="divide-y divide-ink/10 border-y border-ink/10">
            {emailLogs.map((log) => (
              <li key={log.id} className="py-3 text-sm">
                <p className="text-ink">
                  {formatAdminDateTime(log.createdAt)} ·{" "}
                  {log.referenceCode ?? "senza codice"} · {log.status}
                </p>
                <p className="text-stone">
                  {log.recipient} ·{" "}
                  {log.template === "owner_notification"
                    ? "Notifica titolare"
                    : "Ricevuta cliente"}
                </p>
                {log.error ? (
                  <p className="text-terracotta">{log.error}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
