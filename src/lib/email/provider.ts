import { getEmailEnv } from "@/lib/email/env";

export type OutgoingEmail = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

export type SendEmailResult =
  | { ok: true; providerId: string | null }
  | { ok: false; error: string };

export async function sendEmail(message: OutgoingEmail): Promise<SendEmailResult> {
  const env = getEmailEnv();

  if (!message.to.trim()) {
    return { ok: false, error: "Destinatario email mancante." };
  }

  if (env.provider === "console") {
    console.info("[email:console]", {
      from: env.from,
      to: message.to,
      subject: message.subject,
      text: message.text,
    });
    return { ok: true, providerId: `console-${Date.now()}` };
  }

  if (!env.resendApiKey) {
    return {
      ok: false,
      error: "Manca RESEND_API_KEY per l'invio email.",
    };
  }

  if (!env.from) {
    return { ok: false, error: "Manca EMAIL_FROM." };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.from,
        to: [message.to],
        subject: message.subject,
        text: message.text,
        html: message.html,
      }),
    });

    const payload = (await response.json().catch(() => null)) as {
      id?: string;
      message?: string;
      name?: string;
    } | null;

    if (!response.ok) {
      return {
        ok: false,
        error:
          payload?.message ||
          payload?.name ||
          `Invio Resend non riuscito (${response.status}).`,
      };
    }

    return { ok: true, providerId: payload?.id ?? null };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Errore di rete email.",
    };
  }
}
