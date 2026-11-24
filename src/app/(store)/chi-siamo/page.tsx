import type { Metadata } from "next";
import { PageIntro } from "@/components/layout/page-intro";

export const metadata: Metadata = {
  title: "Chi siamo",
};

export default function AboutPage() {
  return (
    <PageIntro title="Chi siamo">
      <p>
        Questa pagina accoglierà la storia del progetto, con i testi forniti
        dal titolare. Gli album sono vuoti: le fotografie si applicano dopo
        l&apos;acquisto, in autonomia.
      </p>
    </PageIntro>
  );
}
