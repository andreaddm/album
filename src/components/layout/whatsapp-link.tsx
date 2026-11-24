import { buildWhatsAppUrl } from "@/lib/whatsapp";

export function WhatsAppLink({
  number,
  text,
  className = "",
  children,
}: {
  number: string | null | undefined;
  text?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const href = buildWhatsAppUrl(number, text);
  if (!href) {
    return null;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={className}
    >
      {children}
    </a>
  );
}
