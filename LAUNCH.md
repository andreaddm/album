# Checklist di lancio

Usare questa lista prima di mettere online il sito. I seed dimostrativi non vanno in produzione.

## 1. Supabase

- [ ] Progetto dedicato alla produzione (non riusare il progetto di prova se contiene dati finti).
- [ ] Applicate tutte le migrazioni in `supabase/migrations/`.
- [ ] **Signup pubblico disabilitato** (Authentication → Providers / settings).
- [ ] Creato l’account admin (il primo utente Auth diventa admin).
- [ ] Password admin cambiata rispetto a eventuali credenziali di sviluppo.
- [ ] Bucket `product-images` presente, pubblico in lettura, scrittura solo admin.
- [ ] Backup automatici Supabase attivi; annotare come ripristinare un punto nel tempo.
- [ ] Revocare eventuali Personal Access Token usati solo per migrazioni locali.

## 2. Variabili d’ambiente (hosting)

| Variabile | Note |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL progetto |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chiave publishable |
| `SUPABASE_SERVICE_ROLE_KEY` | Solo server, mai `NEXT_PUBLIC_` |
| `NEXT_PUBLIC_SITE_URL` | URL pubblico HTTPS definitivo |
| `EMAIL_PROVIDER` | `resend` in produzione |
| `EMAIL_FROM` | Mittente verificato su Resend |
| `RESEND_API_KEY` | Solo server |
| `SUPABASE_ACCESS_TOKEN` | Non necessario in produzione |

- [ ] Nessun segreto nel repository o nel bundle browser.
- [ ] Dominio con HTTPS.
- [ ] Redirect da HTTP a HTTPS e, se serve, da `www` a apex (o viceversa).

## 3. Email e WhatsApp

- [ ] Dominio/mittente verificato su Resend.
- [ ] In Impostazioni admin: `notification_email` reale del titolare.
- [ ] Inviare una richiesta di prova e controllare entrambe le email + log in admin.
- [ ] Provare «Reinvia» su un log fallito.
- [ ] Numero WhatsApp in formato internazionale (es. `3933…`) in Impostazioni.
- [ ] Verificare footer, Contatti e pulsante WhatsApp.

## 4. Contenuti

- [ ] Rimuovere prodotti seed / richieste di prova.
- [ ] Caricare immagini reali, testi, prezzi, disponibilità.
- [ ] Completare Chi siamo con contenuti del titolare.
- [ ] **Privacy e Cookie**: testi legali verificati (le pagine attuali sono segnaposto).
- [ ] Controllare nome negozio e intro homepage.

## 5. Controlli funzionali minimi

- [ ] Prodotto pubblicato + disponibile: visibile e aggiungibile al carrello.
- [ ] Prodotto pubblicato + non disponibile: badge, non acquistabile.
- [ ] Bozza: non in catalogo / 404 sullo slug.
- [ ] Richiesta d’acquisto → codice `RQ-…` → messaggio «non è ancora un ordine confermato».
- [ ] Totale senza spedizione.
- [ ] `/admin` senza login → login; con login → panoramica.
- [ ] Aggiornamento stato richiesta.
- [ ] Eliminazione prodotto con conferma; snapshot nelle richieste storiche.
- [ ] `npm run build` senza errori.
- [ ] `node scripts/check-rls.mjs` tutto OK contro il progetto di produzione (con env di produzione in locale, con attenzione).

## 6. Deploy

- [ ] Build di produzione (`npm run build` / `npm run start` o piattaforma scelta).
- [ ] Variabili impostate sulla piattaforma di hosting.
- [ ] Smoke test sul dominio pubblico.
- [ ] Annotare procedura di rollback (redeploy commit precedente + backup DB).

## Fuori ambito (non implementare al lancio)

Pagamenti online, account acquirente, upload foto degli acquirenti, inventario quantitativo automatico, conferma ordine senza contatto manuale.
