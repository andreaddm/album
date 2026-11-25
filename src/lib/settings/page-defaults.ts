export const DEFAULT_PRIVACY_TITLE = "Privacy";
export const DEFAULT_PRIVACY_BODY =
  "L'informativa sarà pubblicata con i testi verificati dal titolare e da un consulente. Qui non è riportata un'informativa definitiva.";

export const DEFAULT_COOKIE_TITLE = "Cookie";
export const DEFAULT_COOKIE_BODY =
  "La pagina sui cookie sarà completata prima della pubblicazione, dopo aver definito gli strumenti effettivamente usati dal sito.";

export const DEFAULT_ABOUT_TITLE = "Chi siamo";
export const DEFAULT_ABOUT_BODY =
  "Questa pagina accoglierà la storia del progetto, con i testi forniti dal titolare. Gli album sono vuoti: le fotografie si applicano dopo l'acquisto, in autonomia.";

export function paragraphsFromBody(body: string) {
  return body
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
}
