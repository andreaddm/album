import type { ReactNode } from "react";

export function PageIntro({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="font-serif text-4xl text-ink sm:text-5xl">{title}</h1>
      <div className="mt-6 space-y-4 text-base leading-7 text-ink/85">
        {children}
      </div>
    </main>
  );
}
