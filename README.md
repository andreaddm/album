# Album

Sito per richieste d’acquisto di album fotografici personalizzabili (vuoti).
Specifiche e fasi: [PROJECT_PLAN.md](./PROJECT_PLAN.md).  
Checklist di produzione: [LAUNCH.md](./LAUNCH.md).

## Avvio locale

```bash
npm install
cp .env.example .env.local
npm run dev
```

Compila `.env.local` con le chiavi Supabase (vedi `.env.example`).  
In locale le email usano `EMAIL_PROVIDER=console` (log in terminale).

```bash
npm run build
npm run check:rls
```

## Cosa fa il sito

- Catalogo pubblico in italiano, prezzi in EUR
- Carrello anonimo + richiesta d’acquisto (non è un ordine confermato)
- Area admin: prodotti, media, richieste, impostazioni, log email
- Notifiche email (Resend o console) e link WhatsApp configurabili

## Fuori ambito

Pagamenti online, account acquirente, upload foto degli acquirenti, inventario quantitativo, conferma automatica dell’ordine.

## Prima del lancio

Seguire [LAUNCH.md](./LAUNCH.md): disabilitare signup pubblico, togliere i seed, completare privacy/cookie, configurare Resend e il dominio HTTPS.
