import { paragraphsFromBody } from "@/lib/settings/page-defaults";

export function PageBody({ text }: { text: string }) {
  const paragraphs = paragraphsFromBody(text);

  if (paragraphs.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 text-base leading-7 text-ink/85">
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="whitespace-pre-wrap">
          {paragraph}
        </p>
      ))}
    </div>
  );
}
