import type { Metadata } from "next";
import { PageIntro } from "@/components/layout/page-intro";

export const metadata: Metadata = {
  title: "Privacy",
};

export default function PrivacyPage() {
  return (
    <PageIntro title="Privacy">
      <p>
        L&apos;informativa sarà pubblicata con i testi verificati dal titolare
        e da un consulente. Qui non è riportata un&apos;informativa definitiva.
      </p>
    </PageIntro>
  );
}
