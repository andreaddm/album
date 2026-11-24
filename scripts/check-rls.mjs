/**
 * Verifica rapida RLS con chiave anon (senza sessione).
 * Uso: node scripts/check-rls.mjs
 */
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index), line.slice(index + 1)];
    }),
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const headers = {
  apikey: anon,
  Authorization: `Bearer ${anon}`,
};

async function rest(path, init = {}) {
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: { ...headers, ...(init.headers || {}) },
  });
  const text = await response.text();
  return { status: response.status, text };
}

const checks = [];

function record(name, ok, detail) {
  checks.push({ name, ok, detail });
  console.log(`${ok ? "OK" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

const published = await rest(
  "products?select=id,slug,is_published&is_published=eq.true&limit=5",
);
record(
  "anon legge prodotti pubblicati",
  published.status === 200 && published.text.includes("slug"),
  `status ${published.status}`,
);

const draft = await rest(
  "products?select=id,slug,is_published&slug=eq.album-bozza",
);
const draftEmpty =
  draft.status === 200 &&
  (draft.text === "[]" || !draft.text.includes("album-bozza"));
record(
  "anon non vede bozza album-bozza",
  draftEmpty,
  `status ${draft.status} body=${draft.text.slice(0, 80)}`,
);

const settingsStar = await rest("store_settings?select=*&id=eq.default");
record(
  "anon non legge notification_email via select=*",
  settingsStar.status === 401 ||
    settingsStar.status === 400 ||
    !settingsStar.text.includes("notification_email"),
  `status ${settingsStar.status}`,
);

const settingsPublic = await rest(
  "store_settings?select=store_name,homepage_intro,unavailable_message,whatsapp_number&id=eq.default",
);
record(
  "anon legge colonne pubbliche store_settings",
  settingsPublic.status === 200 && settingsPublic.text.includes("store_name"),
  `status ${settingsPublic.status}`,
);

const orders = await rest("orders?select=id,reference_code&limit=1");
record(
  "anon non legge orders",
  orders.status === 401 ||
    orders.status === 403 ||
    orders.text === "[]" ||
    orders.text.includes("permission denied") ||
    orders.text.includes("42501"),
  `status ${orders.status} body=${orders.text.slice(0, 120)}`,
);

const rpc = await fetch(`${url}/rest/v1/rpc/create_purchase_request`, {
  method: "POST",
  headers: {
    ...headers,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  },
  body: JSON.stringify({}),
});
const rpcText = await rpc.text();
record(
  "anon non esegue create_purchase_request",
  rpc.status === 404 ||
    rpc.status === 401 ||
    rpc.status === 403 ||
    rpcText.includes("PGRST202") ||
    rpcText.includes("permission denied"),
  `status ${rpc.status}`,
);

const failed = checks.filter((check) => !check.ok);
console.log(`\n${checks.length - failed.length}/${checks.length} controlli ok`);
process.exit(failed.length ? 1 : 0);
