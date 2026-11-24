"use client";

import { useState, type FormEvent } from "react";
import { loginAdmin } from "@/app/admin/login/actions";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) {
      return;
    }

    setPending(true);
    setMessage(null);
    setFieldErrors({});

    try {
      const result = await loginAdmin({ email, password });
      if (!result.ok) {
        setPending(false);
        setMessage(result.message);
        setFieldErrors(result.fieldErrors ?? {});
      }
    } catch (error) {
      if (isNextRedirect(error)) {
        throw error;
      }

      setPending(false);
      setMessage("Accesso non riuscito. Riprova.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Field
        id="admin-email"
        label="Email"
        type="email"
        autoComplete="username"
        value={email}
        onChange={setEmail}
        error={fieldErrors.email}
      />
      <Field
        id="admin-password"
        label="Password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={setPassword}
        error={fieldErrors.password}
      />
      {message ? (
        <p className="text-sm text-terracotta" role="alert">
          {message}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Accesso in corso…" : "Accedi"}
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
