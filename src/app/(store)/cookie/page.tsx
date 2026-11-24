import type { Metadata } from "next";
import { PageIntro } from "@/components/layout/page-intro";

export const metadata: Metadata = {
  title: "Cookie",
};

export default function CookiePage() {
  return (
    <PageIntro title="Cookie">
      <p>
        La pagina sui cookie sarà completata prima della pubblicazione, dopo
        aver definito gli strumenti effettivamente usati dal sito.
      </p>
    </PageIntro>
  );
}
