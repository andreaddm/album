import Link from "next/link";

export const SETTINGS_TABS = [
  { id: "negozio", label: "Negozio" },
  { id: "homepage", label: "Homepage 1" },
  { id: "homepage-2", label: "Homepage 2" },
  { id: "altro", label: "Altro" },
  { id: "notifiche", label: "Notifiche" },
] as const;

export type SettingsTabId = (typeof SETTINGS_TABS)[number]["id"];

export function parseSettingsTab(value: string | undefined): SettingsTabId {
  if (
    value === "homepage" ||
    value === "homepage-2" ||
    value === "altro" ||
    value === "notifiche"
  ) {
    return value;
  }
  return "negozio";
}

export function SettingsTabs({ active }: { active: SettingsTabId }) {
  return (
    <nav
      aria-label="Sezioni impostazioni"
      className="flex flex-wrap gap-x-6 gap-y-2 border-b border-ink/15"
    >
      {SETTINGS_TABS.map((tab) => {
        const isActive = tab.id === active;
        return (
          <Link
            key={tab.id}
            href={`/admin/impostazioni?scheda=${tab.id}`}
            className={
              isActive
                ? "-mb-px border-b-2 border-ink pb-3 text-sm font-semibold text-ink"
                : "pb-3 text-sm text-ink/60 hover:text-ink"
            }
            aria-current={isActive ? "page" : undefined}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
