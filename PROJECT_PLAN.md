# PROJECT_PLAN.md

## E-commerce su richiesta per album fotografici personalizzabili

> Documento operativo per realizzare il sito con Cursor.\
> Stack: Next.js + TypeScript + Tailwind CSS + Supabase.\
> Lingua del sito: italiano. Valuta: EUR (€). Fuso orario predefinito:
> Europe/Rome.

------------------------------------------------------------------------

## 1. Obiettivo del progetto

Realizzare un sito elegante e semplice da usare per presentare e vendere
album fotografici vuoti e personalizzati.

Il cliente acquista un album vuoto e successivamente incolla
autonomamente le proprie fotografie. **Il sito non deve prevedere il
caricamento di fotografie da parte degli acquirenti.**

Il sito non incassa pagamenti online e non conferma automaticamente gli
ordini. Il visitatore invia una **richiesta d'acquisto** con i prodotti
desiderati e i propri dati. Il titolare verifica la richiesta, contatta
personalmente il cliente, conferma disponibilità e costi di spedizione e
concorda la spedizione in contrassegno.

Il progetto comprende: - vetrina pubblica e catalogo; - schede prodotto
con immagini e video; - carrello multi-prodotto; - invio di richieste
d'acquisto; - area amministrativa protetta per catalogo, richieste e
impostazioni; - notifiche email e contatto WhatsApp.

## 2. Regole fondamentali del business

1.  Nessun pagamento online.
2.  Nessun account per gli acquirenti.
3.  Il carrello può contenere più prodotti e quantità.
4.  L'invio del modulo crea una richiesta, non un ordine confermato.
5.  Il titolare approva manualmente ogni richiesta e contatta il
    cliente.
6.  La spedizione e il contrassegno vengono concordati manualmente.
7.  Le spese di spedizione non vengono calcolate né mostrate come
    definitive durante la richiesta. Il titolare le comunica
    successivamente.
8.  Non si gestiscono varianti di prodotto.
9.  Non si gestiscono quantità di magazzino: la disponibilità è
    un'impostazione manuale disponibile/non disponibile.
10. Non si raccolgono né si caricano fotografie personali degli
    acquirenti.

## 3. Stack tecnologico e architettura

### Frontend e backend

-   Next.js con App Router e TypeScript.
-   Tailwind CSS per lo stile.
-   React Server Components dove appropriato.
-   Server Actions o Route Handlers per le operazioni che richiedono
    accesso sicuro al database.
-   Validazione condivisa dei dati con uno schema TypeScript
    (preferibilmente Zod).
-   Componenti riutilizzabili per schede prodotto, galleria, carrello,
    moduli e area admin.

### Backend e servizi

-   Supabase PostgreSQL: database.
-   Supabase Auth: autenticazione amministratore.
-   Supabase Storage: immagini dei prodotti.
-   Supabase Row Level Security (RLS): protezione dei dati.
-   Servizio email transazionale da scegliere in fase di configurazione.
    Non vincolare il codice a un fornitore specifico: isolare l'invio
    email in un modulo/adapter.
-   WhatsApp tramite link `wa.me` con testo precompilato; nessuna API
    WhatsApp Business necessaria per la prima versione.

### Principi architetturali

-   Non esporre mai la chiave `service_role` di Supabase al browser.
-   Usare variabili d'ambiente per URL, chiavi e credenziali.
-   Tutte le operazioni privilegiate devono essere eseguite lato server.
-   Il server è la fonte attendibile per prezzi, disponibilità, totali e
    stato delle richieste.
-   Non fidarsi di prezzi, subtotali, totali o disponibilità inviati dal
    browser.
-   Separare la logica di business dai componenti UI.
-   Gestire errori, stati di caricamento e conferme in modo esplicito.

## 4. Identità visiva e UX

### Direzione creativa

Stile elegante, emozionale, minimale e caldo. Il prodotto e le
fotografie dimostrative degli album devono essere protagonisti.

### Palette proposta

-   Avorio: `#FAF8F4`
-   Beige: `#EEE8DE`
-   Marrone scuro: `#332C27`
-   Grigio caldo: `#81786F`
-   Terracotta: `#A8755B`
-   Marrone pulsanti: `#493B32`

### Tipografia

-   Titoli: serif elegante e leggibile.
-   Testi, navigazione e controlli: sans-serif pulita.
-   Gerarchia tipografica chiara e dimensioni accessibili.

### Requisiti UX

-   Layout responsive, progettato prima per mobile.
-   Navigazione semplice e coerente.
-   Pulsanti e link con stati hover, focus, disabled e loading.
-   Contrasto adeguato e navigazione da tastiera.
-   Immagini ottimizzate e con testi alternativi.
-   Messaggi di errore comprensibili e vicino al campo interessato.
-   Nessun testo che faccia pensare che una richiesta sia già un ordine
    confermato.

## 5. Pagine pubbliche

### `/` --- Homepage

Sezioni suggerite: 1. Header con logo, navigazione, link catalogo e
icona carrello con conteggio articoli. 2. Hero con immagine emozionale
di un album, titolo, breve messaggio e CTA al catalogo. 3. Presentazione
del servizio: album vuoti da personalizzare con le proprie fotografie.
4. Selezione di prodotti in evidenza. 5. Sezione "Come funziona" in
pochi passaggi. 6. Benefici e qualità dei prodotti. 7. CTA finale verso
il catalogo. 8. Footer con contatti, WhatsApp, informazioni legali e
policy.

### `/prodotti` --- Catalogo

-   Griglia responsive di prodotti pubblicati.
-   Ogni card mostra immagine, nome, prezzo, breve descrizione e azioni.
-   Ogni card può avere un piccolo carosello indipendente con frecce
    precedente/successiva, se sono presenti più immagini.
-   Link "Scopri il prodotto" e azione "Aggiungi al
    carrello"/"Acquista".
-   Prodotto non disponibile: resta visibile con badge "Non
    disponibile"; l'aggiunta al carrello è disabilitata.
-   Eventuale avviso "Scorte limitate" se attivato dall'amministratore.
-   Non mostrare prodotti non pubblicati.

### `/prodotti/[slug]` --- Dettaglio prodotto

-   Nome e prezzo.
-   Galleria media ordinabile: immagini e video nello stesso flusso.
-   Descrizione breve e descrizione completa.
-   Caratteristiche tecniche in elenco/tabella chiara.
-   Indicazioni generali sulla spedizione, senza promettere costi non
    ancora concordati.
-   Stato disponibilità.
-   Avviso scorte limitate, se configurato.
-   Se disponibile, selettore quantità e pulsante per aggiungere al
    carrello.
-   Se non disponibile, pulsante disabilitato e dicitura "Non
    disponibile".
-   Nessun upload di foto da parte dell'acquirente.

### `/carrello` --- Carrello

Carrello multi-prodotto: - Immagine principale, nome prodotto e prezzo
unitario. - Controllo quantità. - Subtotale per riga. - Rimozione
prodotto. - Totale dei prodotti. - CTA per procedere alla richiesta. -
Link per tornare al catalogo. - Indicazione chiara che le spese di
spedizione saranno comunicate dal titolare. - Il carrello può essere
salvato in `localStorage`; contiene solo identificativi e quantità, non
è una fonte attendibile per prezzi o disponibilità. - Quando il carrello
viene caricato, verificare nuovamente che i prodotti esistano e siano
acquistabili. - Se un prodotto diventa non disponibile, segnalarlo e
impedire l'invio finché non viene rimosso o sostituito.

### `/ordine` --- Invio richiesta d'acquisto

Modulo con i seguenti campi obbligatori: - Nome - Cognome - Email -
Telefono - Indirizzo - Numero civico - CAP - Città - Provincia -
Accettazione/ presa visione dell'informativa privacy, secondo la
formulazione approvata

Campo facoltativo: - Note per il venditore

Mostrare riepilogo prodotti, quantità e totale dei prodotti. Non
chiedere dati di pagamento e non calcolare una tariffa di spedizione.

Prima di salvare: - validare i dati lato client per usabilità; -
validare nuovamente lato server; - rileggere da database prodotti,
prezzi e disponibilità; - rifiutare prodotti non esistenti, non
pubblicati o non disponibili; - calcolare il totale esclusivamente con
prezzi recuperati dal database; - applicare protezioni anti-spam e
limiti di frequenza ragionevoli.

Il pulsante deve usare una dicitura non ambigua, ad esempio "Invia
richiesta d'acquisto".

### `/richiesta-inviata` --- Conferma

Dopo il salvataggio riuscito mostrare: - numero/codice identificativo
della richiesta; - riepilogo prodotti e quantità; - totale prodotti,
senza spedizione; - messaggio esplicito: la richiesta è stata ricevuta
ma **non è ancora un ordine confermato**; - il titolare contatterà il
cliente per confermare disponibilità, spedizione e modalità di
contrassegno.

Non mostrare questa pagina come conferma se il salvataggio nel database
è fallito.

### `/chi-siamo`

Pagina gestibile con contenuti essenziali del brand e della storia del
progetto. I testi definitivi saranno forniti dal cliente.

### `/contatti`

-   Email configurata.
-   Numero/link WhatsApp configurato.
-   Eventuali altri recapiti e orari, se forniti.
-   Nessun dato di contatto inventato.

### `/privacy` e `/cookie`

Pagine informative da completare con testi legali verificati dal
titolare e da un consulente competente. Non generare dichiarazioni
legali definitive o inventare titolare del trattamento, finalità, tempi
di conservazione o strumenti di tracciamento.

## 6. WhatsApp

Prevedere un collegamento WhatsApp facilmente raggiungibile, ad esempio
nel footer e/o come pulsante flottante non invasivo.

-   Numero configurabile nell'area amministrativa.
-   Generare un link `https://wa.me/NUMERO?text=...` con numero in
    formato internazionale senza `+`, spazi o trattini.
-   Testo precompilato e codificato correttamente.
-   Dal carrello, se utile, includere nomi e quantità dei prodotti nel
    messaggio.
-   Il contatto WhatsApp diretto non crea automaticamente una richiesta
    nel database.
-   Non simulare una conferma d'ordine via WhatsApp.

## 7. Carrello e prezzi

-   Supportare più prodotti e quantità.
-   Il carrello anonimo può essere persistito in `localStorage`.
-   Memorizzare nel browser solo `product_id` e quantità, evitando di
    considerare attendibili nome e prezzo.
-   Recuperare dal database i dati aggiornati per visualizzare prezzi e
    disponibilità.
-   Validare quantità come interi positivi entro un limite configurabile
    e ragionevole.
-   Il totale è la somma di prezzo unitario × quantità.
-   Spedizione esclusa dal totale e da concordare.
-   In fase di invio richiesta, il server ricalcola tutto.

## 8. Gestione prodotti nell'area amministrativa

### Accesso admin

-   Login protetto.
-   Nessuna registrazione pubblica.
-   Creazione iniziale dell'account amministratore tramite procedura
    sicura di setup Supabase, non da una pagina di registrazione aperta.
-   Protezione server-side di tutte le route admin e di ogni azione
    amministrativa.
-   Logout e gestione sessione.

### Campi prodotto

-   Nome
-   Slug generato automaticamente dal nome, modificabile se necessario e
    univoco
-   Prezzo in EUR
-   Descrizione breve
-   Descrizione completa
-   Caratteristiche tecniche flessibili come coppie nome/valore (es.
    dimensioni, materiali, numero pagine)
-   Stato pubblicazione
-   Stato disponibilità
-   Avviso scorte limitate attivo/disattivo
-   Testo personalizzato dell'avviso, facoltativo
-   Data creazione e data ultimo aggiornamento
-   Media associati e relativo ordinamento

### Azioni disponibili

-   Creare un prodotto.
-   Modificare un prodotto.
-   Pubblicare o togliere dalla pubblicazione.
-   Impostare disponibile/non disponibile.
-   Attivare/disattivare "Scorte limitate".
-   Modificare il testo dell'avviso, ad esempio "Ultimi pezzi
    disponibili".
-   Caricare immagini.
-   Eliminare immagini.
-   Riordinare immagini e video tramite drag-and-drop, con alternativa
    accessibile da tastiera o controlli su/giù.
-   Aggiungere fino a 2 link video per prodotto.
-   Visualizzare anteprima del prodotto.
-   Cercare prodotti.
-   Duplicare un prodotto, generando un nuovo slug univoco e senza
    copiare identificativi.
-   Eliminare definitivamente un prodotto.

### Stati indipendenti

Mantenere separati questi concetti: - `is_published`: decide se il
prodotto compare pubblicamente. - `is_available`: decide se può essere
aggiunto al carrello e acquistato. - `availability_notice_enabled` e
`availability_notice_text`: controllano l'avviso facoltativo "Scorte
limitate".

Regole: - Pubblicato + disponibile: visibile e acquistabile. -
Pubblicato + non disponibile: visibile con "Non disponibile", non
acquistabile. - Non pubblicato: non visibile ai visitatori,
indipendentemente dalla disponibilità. - L'avviso "Scorte limitate" non
deve dichiarare quantità precise, salvo dato reale e gestito in futuro.
È manuale e non automatico.

### Eliminazione irreversibile

L'amministratore deve poter eliminare definitivamente un prodotto. -
Richiedere una conferma esplicita prima di procedere. - Nessun cestino e
nessuna funzione di ripristino. - Eliminare il record del prodotto, le
caratteristiche e i media associati. - Eliminare dal Supabase Storage i
file immagine associati, tramite operazione server-side sicura. - I
video esterni non sono file posseduti dal sito: eliminare solo i
relativi record/link dal database. - L'eliminazione dei media deve
gestire eventuali errori parziali e registrare/loggare l'esito. - Le
richieste già ricevute non devono perdere lo storico: `order_items`
conserva snapshot di nome e prezzo. Non usare una cancellazione a
cascata che elimini le righe storiche. - Se un prodotto è referenziato
da richieste storiche, mantenere il riferimento opzionale o nullo e
preservare sempre i campi snapshot.

## 9. Galleria media: immagini e video

Ogni prodotto può avere: - più immagini caricate su Supabase Storage; -
massimo 2 video esterni; - immagini e video nello stesso elenco
ordinabile.

### Immagini

-   Upload tramite area admin.
-   Validare MIME type ed estensione sul server.
-   Limitare dimensione file e dimensioni immagine con soglie
    configurabili.
-   Generare nomi file non prevedibili e percorsi separati per prodotto.
-   Usare formati ottimizzati quando possibile.
-   Salvare nel database il percorso Storage e i metadati, non il file
    binario.
-   Prevedere eliminazione e riordino.

### Video

-   Supportare link YouTube, YouTube Shorts e TikTok.
-   Massimo 2 video per prodotto.
-   Salvare URL originale, piattaforma e posizione.
-   Validare e normalizzare gli URL tramite parser/allowlist dei domini
    supportati.
-   Non accettare codice HTML/iframe arbitrario inserito dall'utente.
-   Generare embed ufficiali in modo sicuro, con attributi e policy
    adeguati.
-   Se l'embed non funziona per privacy, restrizioni della piattaforma o
    contenuto rimosso, mostrare un fallback con pulsante/link "Guarda il
    video".
-   Non scaricare né ospitare localmente i video.

## 10. Richieste d'acquisto (ordini non confermati)

### Stati

-   `new` --- Nuova
-   `to_contact` --- Da contattare
-   `confirmed` --- Confermata
-   `shipped` --- Spedita
-   `completed` --- Completata
-   `rejected` --- Rifiutata

La richiesta nasce sempre nello stato `new`. La modifica dello stato è
manuale dall'area admin.

### Dati da visualizzare

-   Codice richiesta.
-   Data e ora.
-   Dati cliente e recapiti.
-   Indirizzo di spedizione.
-   Prodotti, quantità, prezzi unitari e subtotali.
-   Totale prodotti esclusa spedizione.
-   Note cliente.
-   Stato corrente.

### Regole

-   Il titolare può aprire una richiesta, contattare il cliente e
    aggiornare lo stato.
-   Non eseguire pagamenti o calcoli di spedizione.
-   Non inviare automaticamente una conferma d'ordine quando la
    richiesta viene creata.
-   Le notifiche devono usare termini come "richiesta ricevuta", non
    "ordine confermato".
-   Conservare snapshot del nome e del prezzo prodotto al momento
    dell'invio.
-   Non cancellare automaticamente le richieste quando si elimina un
    prodotto.

## 11. Email

Dopo il salvataggio riuscito della richiesta: 1. inviare una notifica al
titolare con i dettagli della nuova richiesta; 2. inviare al cliente una
ricevuta di presa in carico.

Regola critica: **prima salvare la richiesta nel database, poi tentare
l'invio delle email**. Un errore del servizio email non deve annullare
né perdere la richiesta.

-   Gestire errori email separatamente.
-   Registrare l'esito dell'invio e consentire una strategia di nuovo
    invio dall'admin o tramite processo controllato.
-   Non esporre chiavi del servizio email nel client.
-   Mittente, destinatario e template devono essere configurabili.
-   Il destinatario delle notifiche al titolare è configurabile nelle
    impostazioni.
-   Il fornitore email verrà scelto in fase di deploy/configurazione.

## 12. Area amministrativa: pagine

-   `/admin/login` --- accesso.
-   `/admin` --- dashboard con riepilogo richieste recenti e
    scorciatoie.
-   `/admin/prodotti` --- elenco, ricerca e filtri prodotti.
-   `/admin/prodotti/nuovo` --- creazione prodotto.
-   `/admin/prodotti/[id]` --- modifica, media, anteprima, disponibilità
    e pubblicazione.
-   `/admin/richieste` --- elenco richieste, ricerca e filtro per
    stato/data.
-   `/admin/richieste/[id]` --- dettaglio e aggiornamento stato.
-   `/admin/impostazioni` --- impostazioni generali.

### Impostazioni

-   Nome attività/negozio.
-   Email destinataria delle richieste.
-   Numero WhatsApp.
-   Testo introduttivo homepage.
-   Messaggio configurabile per prodotti non disponibili.
-   Eventuali dati di contatto e social.
-   Nessuna credenziale segreta deve essere modificabile o mostrata in
    chiaro nell'interfaccia.

## 13. Modello dati Supabase

Schema iniziale suggerito. I nomi possono essere adattati durante
l'implementazione, mantenendo le regole e le relazioni.

### `profiles`

-   `id` UUID, PK e FK a `auth.users.id`
-   `role` (es. `admin`)
-   `created_at`
-   `updated_at`

Per la prima versione è sufficiente un ruolo amministratore. Non creare
registrazione pubblica.

### `products`

-   `id` UUID, PK
-   `name` text, obbligatorio
-   `slug` text, obbligatorio e unique
-   `price` numeric(10,2), non negativo
-   `short_description` text
-   `description` text
-   `is_published` boolean, default false
-   `is_available` boolean, default true
-   `availability_notice_enabled` boolean, default false
-   `availability_notice_text` text, nullable
-   `created_at` timestamptz
-   `updated_at` timestamptz

Usare un tipo numerico adeguato per i prezzi e definire chiaramente
l'arrotondamento a due decimali.

### `product_media`

-   `id` UUID, PK
-   `product_id` UUID, FK a products
-   `media_type` enum/testo controllato: `image` oppure `video`
-   `url`/`storage_path` text
-   `platform` text nullable (`youtube`, `tiktok` o null)
-   `alt_text` text nullable
-   `position` integer
-   `created_at` timestamptz

Per immagini, conservare il percorso Storage e generare URL pubblici o
firmati secondo la configurazione scelta. Per video, conservare l'URL
esterno validato. Applicare il limite di massimo 2 video per prodotto
anche lato server/database, non solo nell'interfaccia.

### `product_features`

-   `id` UUID, PK
-   `product_id` UUID, FK a products
-   `name` text
-   `value` text
-   `position` integer

### `orders`

Nome tabella mantenuto per semplicità tecnica; nell'interfaccia chiamare
sempre il record "richiesta d'acquisto". - `id` UUID, PK -
`reference_code` text, unique, leggibile e non sequenziale se
possibile - `customer_first_name` text - `customer_last_name` text -
`email` text - `phone` text - `street` text - `house_number` text -
`postal_code` text - `city` text - `province` text - `notes` text
nullable - `status` enum/testo controllato - `products_total`
numeric(10,2) - `created_at` timestamptz - `updated_at` timestamptz

Non memorizzare un totale spedizione definitivo: non è noto al momento
della richiesta.

### `order_items`

-   `id` UUID, PK
-   `order_id` UUID, FK a orders
-   `product_id` UUID nullable, FK a products con `ON DELETE SET NULL`
-   `product_name_snapshot` text
-   `unit_price_snapshot` numeric(10,2)
-   `quantity` integer
-   `line_total_snapshot` numeric(10,2)

I campi snapshot sono obbligatori e indipendenti dalla sopravvivenza del
prodotto originale.

### `store_settings`

Per la prima versione può essere una singola riga identificata da una
chiave fissa. - `id` UUID/chiave fissa - `store_name` text -
`notification_email` text - `whatsapp_number` text - `homepage_intro`
text - `unavailable_message` text - `updated_at` timestamptz

### Tabelle/strutture opzionali consigliate

-   `email_logs` o tabella eventi per registrare tentativi di invio
    email.
-   `admin_audit_logs` per registrare operazioni sensibili, soprattutto
    eliminazioni definitive e modifiche alle richieste.

Creare migrazioni SQL versionate nel repository. Non affidarsi a
modifiche manuali non documentate in produzione.

## 14. Sicurezza e RLS

Configurare RLS su tutte le tabelle esposte.

### Visitatori anonimi

-   Possono leggere solo prodotti pubblicati.
-   Possono leggere solo media e caratteristiche associati a prodotti
    pubblicati.
-   Non possono leggere richieste, dati cliente, profili admin, log o
    impostazioni riservate.
-   Possono inviare una richiesta solo attraverso endpoint server
    validato. Evitare policy anonime permissive che consentano di
    leggere o modificare richieste.

### Amministratore

-   Può gestire prodotti, media, caratteristiche, richieste e
    impostazioni solo se autenticato e autorizzato.
-   Verificare il ruolo sul server e nelle policy.
-   Proteggere ogni route e ogni mutation, non solo nascondere i link
    nell'interfaccia.

### Misure aggiuntive

-   Mai includere `service_role` nel bundle frontend.
-   Validazione server-side di input, URL video, upload e quantità.
-   Rate limiting per invio richieste e login.
-   Protezione anti-spam; valutare CAPTCHA accessibile se il traffico lo
    richiede.
-   Errori pubblici generici, senza dettagli interni o stack trace.
-   Log server-side senza registrare dati personali non necessari.
-   Cookie/sessioni con impostazioni sicure.
-   Controllare che gli upload siano autorizzati solo per admin.
-   Evitare XSS: trattare descrizioni e note come testo, non HTML
    arbitrario.
-   Sanitizzare e validare i link.
-   Proteggere da richieste duplicate con idempotenza o controlli
    adeguati, dove possibile.

## 15. Privacy, cookie e protezione dati

-   Raccogliere solo i dati necessari per gestire la richiesta.
-   Fornire informativa privacy chiara prima dell'invio.
-   Distinguere l'accettazione/ presa visione necessaria per la gestione
    della richiesta da eventuali consensi marketing, che non vanno
    preselezionati né resi obbligatori senza una base giuridica
    adeguata.
-   Non attivare strumenti non necessari di profilazione o analytics
    senza aver valutato gli obblighi di consenso.
-   Definire con il titolare tempi di conservazione, procedure di
    accesso/cancellazione e ruoli privacy.
-   Non inserire testi legali inventati: completare le pagine
    privacy/cookie con contenuti verificati prima della pubblicazione.
-   Non raccogliere foto degli utenti.

## 16. SEO e prestazioni

-   Metadata per homepage, catalogo e singole schede.
-   Slug leggibili e univoci.
-   Open Graph per condivisione.
-   Sitemap e robots.txt.
-   Dati strutturati Product solo se i dati e le condizioni di vendita
    sono corretti; evitare markup che suggerisca checkout o
    disponibilità falsa.
-   Ottimizzare immagini con il sistema immagini di Next.js o strategia
    equivalente.
-   Lazy loading per media non immediatamente visibili.
-   Evitare caricamento automatico di iframe video pesanti: usare
    anteprime e caricare l'embed quando richiesto, se opportuno.
-   Curare Core Web Vitals e dimensioni bundle.

## 17. Accessibilità e qualità

-   HTML semantico.
-   Label associate ai campi.
-   Messaggi di errore leggibili dagli screen reader.
-   Focus visibile.
-   Tutte le azioni disponibili da tastiera.
-   Non affidare lo stato solo al colore.
-   Test responsive su smartphone, tablet e desktop.
-   Test delle condizioni vuote, errori di rete e caricamenti lenti.

## 18. Flussi principali

### Flusso amministratore: creare un prodotto

1.  Login.
2.  Aprire Prodotti → Nuovo.
3.  Inserire dati e caratteristiche.
4.  Caricare immagini.
5.  Aggiungere fino a 2 link video, se necessari.
6.  Riordinare tutti i media.
7.  Impostare disponibilità e avviso scorte limitate.
8.  Salvare come non pubblicato oppure pubblicare.
9.  Verificare anteprima.

### Flusso amministratore: eliminare un prodotto

1.  Aprire il prodotto o la lista.
2.  Selezionare "Elimina definitivamente".
3.  Mostrare un avviso chiaro che l'azione è irreversibile.
4.  Richiedere conferma esplicita.
5.  Eliminare record e media associati in modo sicuro.
6.  Conservare le righe storiche delle richieste grazie agli snapshot.
7.  Mostrare esito e gestire eventuali errori parziali.

### Flusso cliente: inviare una richiesta

1.  Visitare il catalogo.
2.  Aprire uno o più prodotti disponibili.
3.  Aggiungere prodotti e quantità al carrello.
4.  Aprire il carrello e verificare il riepilogo.
5.  Procedere al modulo.
6.  Inserire i dati di contatto e spedizione.
7.  Inviare la richiesta.
8.  Il server verifica nuovamente prodotti, prezzi e disponibilità e
    calcola il totale.
9.  Salvare richiesta e righe nel database in un'unica transazione.
10. Dopo il salvataggio, tentare gli invii email.
11. Mostrare il codice richiesta e la spiegazione che non è ancora un
    ordine confermato.

### Flusso titolare: gestire una richiesta

1.  Ricevere notifica.
2.  Aprire la richiesta nell'admin.
3.  Verificare i dati e contattare il cliente.
4.  Concordare disponibilità, spedizione e contrassegno.
5.  Aggiornare manualmente lo stato.
6.  Gestire spedizione e completamento fuori dal sistema, almeno nella
    prima versione.

## 19. Struttura progetto suggerita

Adattare la struttura alle convenzioni correnti di Next.js, mantenendo
separazione tra UI, dominio e accesso dati.

``` text
src/
  app/
    (store)/
      page.tsx
      prodotti/
        page.tsx
        [slug]/page.tsx
      carrello/page.tsx
      ordine/page.tsx
      richiesta-inviata/page.tsx
      chi-siamo/page.tsx
      contatti/page.tsx
      privacy/page.tsx
      cookie/page.tsx
    admin/
      login/page.tsx
      page.tsx
      prodotti/
        page.tsx
        nuovo/page.tsx
        [id]/page.tsx
      richieste/
        page.tsx
        [id]/page.tsx
      impostazioni/page.tsx
    api/ (solo se necessari Route Handlers)
  components/
    layout/
    products/
    cart/
    forms/
    admin/
    ui/
  lib/
    supabase/
    auth/
    validation/
    email/
    whatsapp/
    pricing/
    products/
    orders/
  types/
  styles/
supabase/
  migrations/
  seed.sql
public/
```

Non è obbligatorio seguire esattamente questo albero; evitare però di
concentrare tutta la logica in singole pagine o componenti enormi.

## 20. Variabili d'ambiente

Prevedere almeno: - `NEXT_PUBLIC_SUPABASE_URL` -
`NEXT_PUBLIC_SUPABASE_ANON_KEY` - `SUPABASE_SERVICE_ROLE_KEY` (solo
server) - variabili del provider email (solo server, da definire) - URL
pubblico del sito, se necessario per link email e metadata.

Creare `.env.example` con nomi e descrizioni, senza valori segreti.
Aggiungere `.env*` appropriati a `.gitignore`, mantenendo `.env.example`
versionato.

## 21. Piano di sviluppo per Cursor

Procedere per fasi verificabili. Non generare tutto in un'unica modifica
monolitica.

### Fase 1 --- Fondazioni

-   Inizializzare Next.js, TypeScript, Tailwind.
-   Configurare linting, formattazione e struttura cartelle.
-   Configurare Supabase client/server.
-   Preparare `.env.example`.
-   Creare layout responsive, header e footer.
-   Definire tokens visivi e componenti UI di base.

### Fase 2 --- Database e sicurezza

-   Creare migrazioni SQL.
-   Definire enum/check constraint e indici.
-   Configurare RLS e policy.
-   Implementare helper server per autorizzazione admin.
-   Scrivere seed dati dimostrativi non reali.

### Fase 3 --- Catalogo pubblico

-   Homepage.
-   Lista prodotti pubblicati.
-   Dettaglio prodotto.
-   Galleria immagini/video.
-   Stati disponibile/non disponibile e avviso scorte limitate.
-   Metadata SEO.

### Fase 4 --- Carrello e richiesta

-   Carrello localStorage.
-   Recupero dati aggiornati dal server.
-   Modulo richiesta.
-   Validazione server-side e calcolo prezzi.
-   Salvataggio atomico richiesta + righe.
-   Pagina richiesta inviata.
-   Anti-spam e protezione duplicati.

### Fase 5 --- Area admin prodotti

-   Login e protezione route.
-   CRUD prodotti.
-   Upload e cancellazione immagini.
-   Link video e validazione.
-   Riordino media.
-   Caratteristiche dinamiche.
-   Ricerca, duplicazione e anteprima.
-   Eliminazione irreversibile con conferma e pulizia Storage.

### Fase 6 --- Area admin richieste e impostazioni

-   Elenco e filtri richieste.
-   Dettaglio richiesta e aggiornamento stato.
-   Impostazioni negozio.
-   Log delle notifiche email.

### Fase 7 --- Email e WhatsApp

-   Integrare provider email scelto.
-   Template email al titolare e al cliente.
-   Gestione fallimenti e retry.
-   Link WhatsApp con testo precompilato.

### Fase 8 --- Collaudo e pubblicazione

-   Test funzionali, sicurezza e responsive.
-   Verifica RLS con sessioni anonime e admin.
-   Verifica flussi email.
-   Verifica backup e procedure di deploy.
-   Configurare dominio, HTTPS e variabili d'ambiente.
-   Completare privacy/cookie e contenuti reali prima del lancio.

## 22. Test di accettazione

Il progetto non è pronto finché non sono verificati almeno i seguenti
casi.

### Catalogo e prodotti

-   Un prodotto pubblicato e disponibile è visibile e acquistabile.
-   Un prodotto pubblicato ma non disponibile resta visibile con badge
    "Non disponibile".
-   Un prodotto non disponibile non può essere aggiunto al carrello.
-   Un prodotto non pubblicato non è visibile al pubblico.
-   L'avviso "Scorte limitate" compare solo se attivato.
-   La galleria ordina correttamente immagini e video.
-   Non è possibile aggiungere più di 2 video per prodotto.
-   URL video non validi o domini non supportati vengono rifiutati.

### Carrello e richiesta

-   È possibile aggiungere più prodotti e modificare le quantità.
-   È possibile rimuovere un prodotto.
-   Il totale viene calcolato correttamente.
-   Modificare il prezzo nel browser non altera il totale salvato.
-   Se un prodotto diventa non disponibile dopo essere stato aggiunto al
    carrello, il server impedisce l'invio.
-   Il modulo valida tutti i campi obbligatori.
-   La richiesta e le righe sono salvate in modo atomico.
-   La conferma non appare se il salvataggio fallisce.
-   La pagina di conferma chiarisce che non è un ordine confermato.
-   La spedizione non viene inventata o conteggiata.

### Admin e cancellazione

-   Un visitatore non autenticato non accede all'admin.
-   Non esiste registrazione pubblica.
-   L'admin può creare, modificare, pubblicare, nascondere e duplicare
    prodotti.
-   L'admin può gestire disponibilità e avviso scorte limitate.
-   L'admin può caricare, eliminare e riordinare media.
-   L'eliminazione richiede conferma.
-   L'eliminazione è definitiva e non esiste ripristino.
-   Le immagini associate vengono rimosse da Storage.
-   Le richieste storiche mantengono nome e prezzo del prodotto
    eliminato.

### Richieste ed email

-   Le richieste compaiono nell'admin.
-   Gli stati sono aggiornabili.
-   Il titolare riceve una notifica dopo il salvataggio.
-   Il cliente riceve una ricevuta di presa in carico.
-   Se l'email fallisce, la richiesta rimane salvata.
-   I visitatori non possono leggere richieste altrui.

### Sicurezza e qualità

-   Nessuna chiave segreta è presente nel bundle browser.
-   RLS impedisce accessi non autorizzati.
-   Form e upload sono validati lato server.
-   Le pagine principali funzionano su mobile e desktop.
-   I moduli sono utilizzabili da tastiera.

## 23. Decisioni da lasciare configurabili

Non bloccare lo sviluppo su dettagli che il titolare potrà decidere in
seguito: - logo e testi definitivi; - nome attività e recapiti; -
provider email; - dominio e hosting; - immagini e contenuti reali; -
testi legali verificati; - eventuali analytics, solo dopo valutazione
privacy.

Usare valori di sviluppo chiaramente fittizi nei seed e non pubblicare
dati dimostrativi in produzione.

## 24. Istruzioni operative per Cursor

1.  Leggere tutto questo documento prima di modificare il progetto.
2.  Prima di implementare, proporre una breve sequenza di attività e
    indicare eventuali ambiguità tecniche reali.
3.  Procedere fase per fase, mantenendo l'applicazione avviabile.
4.  Dopo ogni fase eseguire TypeScript, lint e test disponibili e
    correggere gli errori.
5.  Creare migrazioni SQL versionate per ogni modifica allo schema.
6.  Non inserire segreti nel codice o nei file versionati.
7.  Non implementare pagamenti online, account cliente, upload di
    fotografie degli acquirenti, inventario quantitativo o conferma
    automatica degli ordini: sono fuori ambito.
8.  Non trasformare la richiesta d'acquisto in un ordine confermato
    senza intervento manuale del titolare.
9.  Non eliminare lo storico delle richieste quando si elimina un
    prodotto.
10. Se una decisione non è specificata, scegliere la soluzione più
    semplice, sicura e manutenibile, documentandola invece di introdurre
    funzionalità non richieste.
11. Al termine di ogni fase, riepilogare file creati/modificati,
    decisioni prese, test eseguiti e passaggi manuali ancora necessari.
12. Prima del rilascio, fornire una checklist per configurare Supabase,
    provider email, dominio, variabili d'ambiente, contenuti e policy
    legali.

------------------------------------------------------------------------

## Criterio finale di completamento

Il progetto è completato quando il titolare può gestire autonomamente
catalogo, disponibilità, contenuti media, richieste e impostazioni; il
visitatore può consultare i prodotti, comporre un carrello e inviare una
richiesta d'acquisto; il sistema salva la richiesta in modo sicuro,
invia le notifiche senza rischiare la perdita dei dati e comunica
chiaramente che l'acquisto sarà confermato solo dopo il contatto manuale
del titolare.
