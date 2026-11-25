import type { Metadata } from "next";
import { connection } from "next/server";
import { AboutMediaPanel } from "@/components/admin/about-media-panel";
import { HomepageHeroPanel } from "@/components/admin/homepage-hero-panel";
import { SettingsForm } from "@/components/admin/settings-form";
import {
  parseSettingsTab,
  SettingsTabs,
} from "@/components/admin/settings-tabs";
import { getEmailEnv } from "@/lib/email/env";
import { listEmailLogs } from "@/lib/orders/admin";
import { formatAdminDateTime } from "@/lib/orders/status";
import { listAdminAboutPageImages } from "@/lib/settings/about-media";
import { getAdminStoreSettings } from "@/lib/settings/admin";
import {
  DEFAULT_HOMEPAGE_CTA_CATALOG,
  DEFAULT_HOMEPAGE_CTA_HOW,
  DEFAULT_HOMEPAGE_EYEBROW,
  DEFAULT_HOMEPAGE_FEATURED_TITLE,
  DEFAULT_HOMEPAGE_HOW_TITLE,
  DEFAULT_HOMEPAGE_WHY_CTA,
  DEFAULT_HOMEPAGE_WHY_TITLE,
} from "@/lib/settings/homepage-defaults";
import { listAdminHomepageHeroImages } from "@/lib/settings/hero";
import {
  DEFAULT_ABOUT_BODY,
  DEFAULT_ABOUT_TITLE,
  DEFAULT_COOKIE_BODY,
  DEFAULT_COOKIE_TITLE,
  DEFAULT_PRIVACY_BODY,
  DEFAULT_PRIVACY_TITLE,
} from "@/lib/settings/page-defaults";

export const metadata: Metadata = {
  title: "Impostazioni",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{
  scheda?: string;
}>;

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await connection();
  const params = await searchParams;
  const scheda = parseSettingsTab(params.scheda);
  const emailEnv = getEmailEnv();
  const [settings, emailLogs, heroImages, aboutImages] = await Promise.all([
    getAdminStoreSettings(),
    listEmailLogs(30),
    listAdminHomepageHeroImages(),
    listAdminAboutPageImages(),
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

  const formInitial = {
    storeName: settings.storeName,
    notificationEmail: settings.notificationEmail ?? "",
    whatsappNumber: settings.whatsappNumber ?? "",
    homepageHeadline: settings.homepageHeadline ?? "",
    homepageIntro: settings.homepageIntro ?? "",
    unavailableMessage: settings.unavailableMessage ?? "",
    featuredLimit: settings.featuredLimit,
    homepageEyebrow: settings.homepageEyebrow ?? DEFAULT_HOMEPAGE_EYEBROW,
    homepageCtaCatalog:
      settings.homepageCtaCatalog ?? DEFAULT_HOMEPAGE_CTA_CATALOG,
    homepageCtaHow: settings.homepageCtaHow ?? DEFAULT_HOMEPAGE_CTA_HOW,
    homepageFeaturedTitle:
      settings.homepageFeaturedTitle ?? DEFAULT_HOMEPAGE_FEATURED_TITLE,
    homepageHowTitle: settings.homepageHowTitle ?? DEFAULT_HOMEPAGE_HOW_TITLE,
    homepageHowSteps: settings.homepageHowSteps,
    homepageWhyTitle: settings.homepageWhyTitle ?? DEFAULT_HOMEPAGE_WHY_TITLE,
    homepageWhyItems: settings.homepageWhyItems,
    homepageWhyCta: settings.homepageWhyCta ?? DEFAULT_HOMEPAGE_WHY_CTA,
    privacyTitle: settings.privacyTitle ?? DEFAULT_PRIVACY_TITLE,
    privacyBody: settings.privacyBody ?? DEFAULT_PRIVACY_BODY,
    cookieTitle: settings.cookieTitle ?? DEFAULT_COOKIE_TITLE,
    cookieBody: settings.cookieBody ?? DEFAULT_COOKIE_BODY,
    aboutTitle: settings.aboutTitle ?? DEFAULT_ABOUT_TITLE,
    aboutBody: settings.aboutBody ?? DEFAULT_ABOUT_BODY,
  };

  return (
    <main className="space-y-8">
      <div>
        <h1 className="font-serif text-5xl text-ink">Impostazioni</h1>
        <p className="mt-3 text-stone">
          Dati pubblici del negozio e destinazione delle notifiche. Nessuna
          credenziale segreta è modificabile da qui.
        </p>
      </div>

      <SettingsTabs active={scheda} />

      {scheda === "negozio" ? (
        <section className="space-y-4">
          <h2 className="font-serif text-3xl text-ink">Negozio</h2>
          <p className="text-sm text-stone">
            Nome, WhatsApp e messaggi usati in tutto il sito.
          </p>
          <SettingsForm initial={formInitial} section="negozio" />
        </section>
      ) : null}

      {scheda === "homepage" ? (
        <div className="space-y-10">
          <section className="space-y-4">
            <h2 className="font-serif text-3xl text-ink">Homepage 1</h2>
            <p className="text-sm text-stone">
              Titolo, introduzione, album in evidenza e immagini di sfondo.
            </p>
            <SettingsForm initial={formInitial} section="homepage" />
          </section>
          <HomepageHeroPanel images={heroImages} />
        </div>
      ) : null}

      {scheda === "homepage-2" ? (
        <section className="space-y-4">
          <h2 className="font-serif text-3xl text-ink">Homepage 2</h2>
          <p className="text-sm text-stone">
            Pulsanti hero, titoli delle sezioni, passi «Come funziona» e motivi
            «Perché questi album».
          </p>
          <SettingsForm initial={formInitial} section="homepage-2" />
        </section>
      ) : null}

      {scheda === "altro" ? (
        <div className="space-y-10">
          <section className="space-y-4">
            <h2 className="font-serif text-3xl text-ink">Altro</h2>
            <p className="text-sm text-stone">
              Testi delle pagine Chi siamo, Privacy e Cookie.
            </p>
            <SettingsForm initial={formInitial} section="altro" />
          </section>
          <AboutMediaPanel images={aboutImages} />
        </div>
      ) : null}

      {scheda === "notifiche" ? (
        <div className="space-y-10">
          <section className="space-y-4">
            <h2 className="font-serif text-3xl text-ink">Notifiche</h2>
            <p className="text-sm text-stone">
              Dove arrivano le segnalazioni delle nuove richieste.
            </p>

            {emailEnv.provider === "console" ? (
              <p
                className="rounded-3xl bg-sand px-5 py-4 text-sm leading-6 text-ink"
                role="status"
              >
                Le email sono in modalità <strong>console</strong>: non arrivano
                in casella, vengono solo scritte nel terminale del server e
                segnate come «inviate» nel log. Per invii reali metti in{" "}
                <code className="text-terracotta">.env.local</code>{" "}
                <code className="text-terracotta">EMAIL_PROVIDER=resend</code>,{" "}
                <code className="text-terracotta">RESEND_API_KEY</code> e{" "}
                <code className="text-terracotta">EMAIL_FROM</code>, poi
                riavvia <code className="text-terracotta">npm run dev</code>.
              </p>
            ) : (
              <p
                className="rounded-3xl bg-sand px-5 py-4 text-sm leading-6 text-ink"
                role="status"
              >
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

            <SettingsForm initial={formInitial} section="notifiche" />
          </section>

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
        </div>
      ) : null}
    </main>
  );
}
