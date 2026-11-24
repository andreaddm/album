export type EmailEnv = {
  from: string;
  provider: "resend" | "console";
  resendApiKey: string | null;
};

export function getEmailEnv(): EmailEnv {
  const from = process.env.EMAIL_FROM?.trim() || "";
  const resendApiKey = process.env.RESEND_API_KEY?.trim() || null;
  const configured = process.env.EMAIL_PROVIDER?.trim().toLowerCase();

  if (configured === "console") {
    return { from: from || "console@localhost", provider: "console", resendApiKey };
  }

  if (configured === "resend" || resendApiKey) {
    return {
      from: from || "onboarding@resend.dev",
      provider: "resend",
      resendApiKey,
    };
  }

  return {
    from: from || "console@localhost",
    provider: "console",
    resendApiKey,
  };
}
