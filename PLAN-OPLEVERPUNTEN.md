# Opleverpunten — haalbaarheidsonderzoek

> Alleen onderzoek. Niets in de codebase is aangepast, geen git-acties uitgevoerd.
> Alle beweringen zijn geverifieerd door het daadwerkelijke bestand te lezen, tenzij
> gemarkeerd als **[aanname]**.

## Context: hoe deze codebase in elkaar zit (nodig om de punten te snappen)

- **`index.html`** (de live website, www.thuisindebuurt.nl) is géén los te bewerken
  bestand. De React/JSX-broncode zit gzip+base64-gecodeerd in twee `<script
  type="__bundler/...">`-tags. Er is een build-tool voor: `tools/tib-bundle.mjs`.
  - `node tools/tib-bundle.mjs decode` → pakt de bundel uit naar `bundle-src/*.jsx`
    (bewerkbaar).
  - `node tools/tib-bundle.mjs encode` → bouwt `index.html` weer op vanuit
    `bundle-src/`.
  - **Let op:** `bundle-src/` staat in `.gitignore` (regel 4) en is niet in git
    getrackt (geverifieerd: `git ls-files bundle-src` → 0 bestanden). Alleen de
    encode-stap (`index.html`) wordt gecommit/gepusht. Wie in `bundle-src/*.jsx`
    wijzigt en vergeet te encoden, ziet de wijziging nooit live.
- **`beheer.html`** (het CMS, app.thuisindebuurt.nl) gebruikt dit bundel-mechanisme
  niét — het is gewone leesbare JSX/React in het bestand zelf (geverifieerd: 0
  treffers voor `__bundler/manifest` in `beheer.html` tegen 2 in `index.html`).
  Wijzigingen aan het CMS zijn dus direct te committen, zonder build-stap.
- De map `src/` (met `src/screens/detail.jsx` e.d.) is een ongebruikte, niet
  gekoppelde kopie **[aanname, met sterke aanwijzingen]**: geen build-config
  (geen vite/webpack), `package.json` heeft geen scripts, en niets refereert naar
  `src/App.jsx`. De inhoud kwam wel exact overeen met de live bundel, dus als
  referentie is hij nog bruikbaar, maar bewerk hem niet — het heeft geen effect.
- CMS-instellingen zoals Pagina's en Navigatie-menu (`DATA.pages`, `DATA.nav`)
  staan **niet in Supabase**, maar puur in `localStorage` (`tib-cms-data`) van de
  browser (geverifieerd in `beheer.html:1225-1243`). Dit is relevant voor Punt 4.
- Er bestaat al een **Supabase Edge Function** (`supabase/functions/manage-users/index.ts`),
  gedeployed op project `bxklumejqczcmhrpzstt`. Dat is een bruikbaar precedent voor
  server-side logica (zie Punt 2) — er hoeft niet vanuit het niets een
  serverless-omgeving opgezet te worden.

---

## Punt 1 — "Over deze clubje" → dynamisch "Over [naam]"

**Haalbaarheid: Simpel**

### Bevindingen
- De tekst is **geen vaste string** "Over deze clubje" zoals letterlijk gezocht
  (die string komt nergens voor in de repo). Het is een half-dynamische regel:
  `bundle-src/detail.jsx:287`
  ```jsx
  <h2 ...>Over deze {kind === "agenda" ? "activiteit" : kind}</h2>
  ```
  Voor een buurtinitiatief is `kind === "clubje"`, dus dit rendert letterlijk
  "Over deze clubje" — precies het gemelde probleem, grammaticaal fout Nederlands.
  Dezelfde regel wordt ook gebruikt voor `kind === "activiteit"` ("Over deze
  activiteit") en `kind === "agenda"` ("Over deze activiteit").
- Deze code zit gecompileerd in `index.html` (uuid
  `2ddf5bd1-b6d6-4c7f-b6d3-ccade2f52fd4`) — geverifieerd door de gzip-blob uit
  `index.html` te decompressen: de inhoud is identiek aan `bundle-src/detail.jsx`.
- **De naam is al beschikbaar** op het punt waar de tekst wordt gerenderd:
  `bundle-src/detail.jsx:175`
  ```jsx
  const title = item.name || item.t || item.title;
  ```
  Deze `title`-variabele wordt correct gevuld voor alle drie de relevante
  soorten:
  - clubje: `item.name` komt van `naam: c.naam || 'Nieuw buurtinitiatief'`
    (`bundle-src/ui.jsx:446`)
  - activiteit: idem, `bundle-src/ui.jsx:542`
  - agenda: `item.t`/`item.title` komt van `r.titel` (`bundle-src/other.jsx:143-144`)
  Er is dus **geen nieuwe plumbing nodig** — `title` bestaat al 112 regels vóór
  de kop en is in scope.
- Andere plekken met dezelfde vaste tekst: **geen gevonden.** Volledige
  case-insensitieve zoekactie op "over deze" in alle `.html`/`.jsx`/`.js`-bestanden
  (exclusief `node_modules`) leverde alleen deze ene plek op.

### Voorgestelde aanpak
1. `bundle-src/detail.jsx:287` aanpassen naar bijvoorbeeld:
   ```jsx
   <h2 ...>Over {title}</h2>
   ```
   (Dit verandert ook "Over deze activiteit" → "Over [activiteitnaam]" voor
   activiteit/agenda-pagina's — dat lijkt een verbetering, maar bevestig dit met
   Giovanny, zie open vragen.)
2. `node tools/tib-bundle.mjs encode` draaien om `index.html` opnieuw op te bouwen.
3. Committen en pushen (Vercel deployt automatisch) — daarna controleren op
   thuisindebuurt.nl zelf, niet alleen lokaal.

---

## Punt 2 — iDEAL-betaalknop voor activiteiten

**Haalbaarheid: Complex** (functioneel niet moeilijk qua PSP-integratie zelf, maar
er is nieuwe infrastructuur nodig én een aantal zaken moet Giovanny eerst zelf
regelen voordat er gebouwd kan worden)

### Bevindingen

**PSP-keuze.** Van Mollie, Stripe en Adyen past **Mollie** het beste bij deze
stack:
- Mollie's "Payments API" met **hosted checkout** (redirect naar Mollie, daarna
  terug) vereist geen PCI-compliant eigen betaalformulier — belangrijk want dit
  project heeft geen bestaande backend-security-laag.
- Stripe kan ook iDEAL, maar is zwaarder qua SDK/Elements-integratie voor een
  simpele "betaal voor deze activiteit"-flow; Adyen is vooral voor grotere/
  enterprise-partijen (contract, minimale omzeteisen) en past niet bij een
  vrijwilligersorganisatie van dit formaat.
- Conclusie: **Mollie, hosted checkout**, niet een eigen betaalformulier.

**Bestaande aanknopingspunten (goed nieuws — minder nieuw werk dan het lijkt):**
- Er bestaat al een aanmeldflow voor activiteiten: `AanmeldFormulier` in
  `bundle-src/detail.jsx:67-125`. Bij versturen wordt een rij geïnsert in de
  Supabase-tabel **`aanmeldingen`** (`bundle-src/detail.jsx:93`):
  ```js
  { naam, email, telefoon, type, status: 'nieuw', activiteit_id / clubje_id }
  ```
  Dit is exact de deelnemer↔activiteit-koppeling die punt 2 vraagt — geen nieuwe
  koppeltabel nodig, wel uitbreiden.
- Er is al een CMS-scherm dat deze aanmeldingen toont, met status-afhandeling:
  `MeedoenAanvragenScreen` (`beheer.html:5487-5560+`), leest
  `aanmeldingen` gejoined met `clubjes(naam)`/`activiteiten(naam)`. Dit is de
  natuurlijke plek om betaalstatus per activiteit te tonen.
- Er bestaat al een Supabase Edge Function als precedent voor server-side logica:
  `supabase/functions/manage-users/index.ts`, gedeployed op project-ref
  `bxklumejqczcmhrpzstt`. Dat bewijst dat de Supabase CLI/deploy-flow al werkt in
  dit project.
- **Ontbrekend/knelpunt:** het huidige `kosten`-veld op activiteiten
  (`beheer.html:2027, 2294, 6352`; kolom `kosten` op tabel `activiteiten`) is
  **vrije tekst** (bv. "€ 5 per kaart, soep € 2", "Vrijwillige bijdrage") — geen
  gestructureerd bedrag. Voor een echte betaalknop is een apart numeriek
  `prijs`-veld (in centen) nodig, los van de bestaande beschrijvende
  `kosten`-tekst die vaak niet-bedragbaar is ("Gratis", "Eigen boek").

**Waarom dit niet vanuit los client-side HTML kan:**
Bevestigd — er is nu **geen `/api`-map en geen Vercel serverless function** in het
project (geverifieerd: `find . -iname api` levert niets op buiten `node_modules`).
`vercel.json` bevat alleen redirects, geen functions-config. Dit moet dus **nieuw
gebouwd worden**. Zonder server-side initiatie/webhook-verwerking kan een
kwaadwillende de betaalstatus in de browser vervalsen (bv. rechtstreeks
`status: 'betaald'` posten naar Supabase) — vandaar dat dit niet met de huidige
architectuur (alles client-side + Supabase anon key) kan.

Twee opties voor de server-kant, beide haalbaar in deze stack:
- **Vercel serverless functions** (`/api/mollie-create.js`, `/api/mollie-webhook.js`)
  — Vercel detecteert een `/api`-map automatisch, geen extra `vercel.json`-config
  nodig voor een simpele Node function.
- **Supabase Edge Function** (Deno, zoals `manage-users`) — al een werkend
  precedent in dit project, dus mogelijk minder nieuw te leren.
  **[aanname/voorkeur]:** Supabase Edge Function ligt voor de hand omdát het
  patroon er al is en de service-role-key daar al centraal wordt beheerd
  (`supabase secrets set`), in plaats van een tweede geheimenbeheer bij Vercel.

**Benodigde Supabase-uitbreiding (geen nieuwe tabel, wel nieuwe kolommen):**
Op `aanmeldingen` (of een nieuwe koppeltabel als één aanmelding meerdere
betaalpogingen kan hebben — voor v1 volstaat uitbreiden van `aanmeldingen`):
`bedrag` (integer, centen), `betaalstatus` (`open` / `betaald` / `mislukt` /
`verlopen`), `mollie_payment_id` (text), `betaald_op` (timestamp). Op
`activiteiten`: nieuw kolom `prijs` (integer, centen, nullable = gratis) naast de
bestaande vrije-tekst `kosten`.

**Wat de beheerder in het CMS moet zien:**
`MeedoenAanvragenScreen` (`beheer.html:5487+`) uitbreiden met kolommen
naam/bedrag/betaalstatus/datum — het scherm en de query bestaan al, dit is een
uitbreiding, geen nieuw scherm.

### Wat Giovanny zelf moet regelen (vóórdat er gebouwd kan worden)
1. **Mollie-account aanmaken** (mollie.com) — vereist KVK-koppeling (Thuis in de
   Buurt moet een geregistreerde rechtspersoon/stichting zijn bij de KVK om een
   live-account te activeren). Dit kan Claude Code niet voor je doen.
2. **Test-API-key** ophalen uit het Mollie-dashboard (test-modus werkt zonder
   KVK-verificatie, prima om de bouw mee te starten) en **live-API-key** later.
3. Beslissen: **transactiekosten** van Mollie (rond €0,29 per iDEAL-transactie,
   [aanname — tarieven wijzigen, check zelf op mollie.com/pricing]) worden die
   doorberekend aan de deelnemer of door de stichting gedragen?
4. De API-key(s) als secret zetten — via `supabase secrets set` (Edge Function-pad)
   of Vercel environment variables (serverless-function-pad). Dit is een
   eenmalige CLI/dashboard-actie die Giovanny zelf moet doen (Claude Code heeft
   geen toegang tot deze accounts).
5. Beslissen of het bestaande vrije-tekst `kosten`-veld blijft bestaan náást een
   nieuw numeriek `prijs`-veld, of dat `kosten` op termijn vervangen wordt —
   anders krijgt Margareth twee prijsvelden per activiteit die uit elkaar kunnen
   lopen.

### Bouwstappen in volgorde
1. Giovanny regelt Mollie-account + test-key (zie boven).
2. SQL-migratie: `prijs` op `activiteiten`, `bedrag`/`betaalstatus`/
   `mollie_payment_id`/`betaald_op` op `aanmeldingen`.
3. Supabase Edge Function `create-payment`: ontvangt `aanmelding_id`, maakt
   Mollie-payment aan (hosted checkout), slaat `mollie_payment_id` op, retourneert
   de checkout-URL.
4. Supabase Edge Function `mollie-webhook`: ontvangt Mollie's statuscallback,
   valideert, update `betaalstatus` in `aanmeldingen` server-side (nooit
   vanuit de client).
5. `bundle-src/detail.jsx`: `AanmeldFormulier` uitbreiden — als activiteit een
   `prijs` heeft, na het opslaan van de aanmelding de create-payment-function
   aanroepen en doorsturen naar de Mollie-checkout-URL.
6. Bedankpagina/scherm na terugkomst van Mollie ("Betaald, dankjewel...").
7. `MeedoenAanvragenScreen` (CMS) uitbreiden met bedrag/betaalstatus-kolommen.
8. Testen volledig in Mollie test-modus vóór live-key.

---

## Punt 3 — CMS: Agenda en Buurtatlas verbergen voor de beheerder

**Haalbaarheid: Simpel**, met één belangrijk feitelijk voorbehoud (zie risico's).

### Bevindingen
- Er bestaat al een **rollen/rechtensysteem** dat precies doet wat gevraagd
  wordt: per-rol menu-items verbergen zonder de onderliggende data te raken.
  `beheer.html:1297-1309`:
  ```js
  const BEHEERDER_ROUTES = new Set(['dashboard', 'clubjes']); // lijkt ongebruikt/inconsistent, zie hieronder
  const HIDDEN = {
    redactie:  ['gebruikers', 'huisstijl', 'domein'],
    beheerder: ['clubjes', 'activiteiten', 'agenda', 'nieuws', 'partners',
                'netwerken', 'buurtatlas', 'categorieen', 'media', 'menu',
                'gebruikers', 'huisstijl', 'domein'],
  };
  ```
  Voor de rol `beheerder` (initiatief-beheerder/vrijwilliger) zijn 'agenda' en
  'buurtatlas' **al verborgen**. Er zijn drie rollen in het systeem:
  `superadmin`, `redactie`, `beheerder` (`beheer.html:1314, 4842-4844`). Voor
  `superadmin` en `redactie` staan 'agenda'/'buurtatlas' nu **niet** in de
  hidden-lijst, dus die rollen zien ze wel.
- Het NAV-menu (`beheer.html:1257-1289`) is losgekoppeld van wat de **website**
  toont: de site (`index.html`) leest Agenda/Buurtatlas-data rechtstreeks uit
  Supabase (tabellen `agenda`, `activiteiten`, en lat/lng op `clubjes`/
  `activiteiten`/`partners`), niet via de CMS-navigatiestaat. Een item uit de
  CMS-`NAV`-lijst of `HIDDEN`-set halen raakt dus **niet** de website-weergave —
  dat is een aparte databron/component.
- **Buurtatlas-scherm in CMS is puur read-only weergave** (`BuurtatlasScreen`,
  `beheer.html:2898-2990`): het bouwt pins uit `DATA.clubjes`/`DATA.activiteiten`/
  `DATA.partners` (die al ergens anders bewerkt worden — lat/lng wordt ingevuld
  in de losse clubje/activiteit-bewerkformulieren, zie `sql/activiteiten_locatie.sql`).
  Het scherm heeft zelf géén unieke schrijffunctie behalve een niet-kritische
  "standaard zoomniveau"-instelling (`DATA.atlasZoom`, gebruikt als startzoom
  van de publieke kaart — `bundle-src/buurtatlas.jsx:45`). Verbergen van dit
  scherm is dus laag risico.

### Risico ⚠️ — het "Agenda"-scherm is NIET puur automatisch gevuld
Dit is de belangrijkste bevinding van dit punt en wijkt af van de aanname in de
opdracht ("agenda vult zich vanuit aangemaakte activiteiten"):
- De publieke Agenda-pagina (`bundle-src/other.jsx:122-180`, component `Agenda`)
  haalt data uit **twee** bronnen en toont ze gemengd:
  1. Tabel **`activiteiten`** → "Terugkerend"-kaarten (wél automatisch, klopt).
  2. Tabel **`agenda`** → "Eenmalig"-kaarten — dit zijn losse, met de hand
     aangemaakte items met een exacte datum (`titel`, `datum`, `start`, `eind`,
     `locatie`, `tag`, `omschrijving`, …).
- Die tweede tabel wordt **uitsluitend** beheerd via het CMS-scherm
  `AgendaScreen` (`beheer.html:2521-2610`, subtitel in de UI zelf: "Eenmalige
  evenementen met datum en tijd"). Er is geen ander scherm waar Margareth een
  eenmalig, exact-gedateerd evenement (bv. een jaarlijkse buurtdag op 12
  september) kan aanmaken — de `activiteiten`-tabel is bedoeld voor
  **terugkerende** activiteiten (tekstveld `wanneer`, geparsed op weekdag,
  `bundle-src/other.jsx:226-238`) en ondersteunt geen eenmalige exacte datum.
- **Concreet risico:** als het "Agenda"-menu-item in het CMS verdwijnt zonder
  vervanging, verliest Margareth haar enige manier om eenmalige gedateerde
  evenementen aan te maken/bewerken/verwijderen — die blijven dan wél op de
  website staan (goed, dat blijft werken), maar ze kan er niks meer aan
  toevoegen of wijzigen.

### Voorgestelde aanpak
1. **Eerst uitzoeken** (zie open vragen) of Margareth het "Agenda"-scherm
   daadwerkelijk gebruikt voor eenmalige evenementen, of dat dit in de praktijk
   leeg/ongebruikt is.
2. Als leeg/ongebruikt: 'agenda' + 'buurtatlas' toevoegen aan een hidden-lijst
   voor haar rol (waarschijnlijk `superadmin` en/of `redactie` —
   zie open vraag) in `beheer.html:1297-1301`, analoog aan de bestaande
   `HIDDEN.beheerder`-aanpak. Route-definities (`beheer.html:6291, 6297`) laten
   staan zodat de onderliggende schermen niet stuk gaan, alleen uit het menu
   halen.
3. Als wél gebruikt: eerst een alternatieve plek voor eenmalige agenda-items
   bouwen (bijvoorbeeld een "eenmalig"-vinkje + datumveld toevoegen aan het
   Activiteiten-scherm) vóórdat het Agenda-menu-item verdwijnt — anders is dit
   een functieverlies, geen "ruis wegnemen".

---

## Punt 4 — Bug: laatste 3 pagina-toggles werken niet correct

**Haalbaarheid: Simpel** (root cause eenduidig gevonden, fix is een gerichte
codewijziging + eenmalige datacorrectie)

### Root cause — concreet gevonden

`DATA.pages` (`beheer.html:1159-1171`) bevat **12** pagina's. `DATA.nav`
(`beheer.html:1175-1185`) — het menu dat de live website daadwerkelijk toont —
bevat maar **9** entries:

```js
pages: [
  { id: 1,  titel: "Home", ... },            // t/m id 9: elk heeft een match in DATA.nav
  ...
  { id: 9,  titel: "Contact", ... },
  { id: 10, titel: "Doe mee",              slug: "/doemee",  inMenu: false, ... },  // GEEN match in DATA.nav
  { id: 11, titel: "Doneren",              slug: "/doneren", inMenu: false, ... },  // GEEN match in DATA.nav
  { id: 12, titel: "Leven is spelen (boek)", slug: "/boek",  inMenu: false, ... },  // GEEN match in DATA.nav
],
nav: [
  { id: 'nav-1', target: '/', ... }, ... { id: 'nav-9', target: '/contact', ... }
  // stopt bij 9 — geen nav-10/11/12 voor /doemee, /doneren, /boek
],
```

De toggle-functie `toggleMenu()` (`beheer.html:3080-3088`):
```js
function toggleMenu(id, v) {
  const updated = pages.map(p => p.id === id ? { ...p, inMenu: v } : p);
  setPages(updated);
  DATA.pages = updated;
  const navIdx = DATA.nav.findIndex(n => n.target === pages.find(p => p.id === id)?.slug);
  if (navIdx >= 0) DATA.nav[navIdx].visible = v;   // ← wordt overgeslagen voor pagina 10/11/12
  window.__syncToSite && window.__syncToSite();
  ...
}
```
Voor pagina's 10, 11, 12 is `navIdx === -1` (geen matchende `target` in
`DATA.nav`), dus de `if (navIdx >= 0)`-guard slaat de synchronisatie stil over.
De toggle zelf (`p.inMenu`, React-state) flipt wél gewoon — de UI in het CMS
laat dus keurig "aan"/"uit" zien — maar er wordt niets weggeschreven naar
`DATA.nav`, en dát is precies het object dat naar de site gaat.

Op de website zelf (`bundle-src/ui.jsx:565-575`) wordt de menu-zichtbaarheid zo
bepaald:
```js
if (_tibCms.nav && Array.isArray(_tibCms.nav)) {
  var _navMap = {};
  _tibCms.nav.forEach(n => { _navMap[siteId] = n.visible !== false; });
  var _filtered = NAV_ITEMS.filter(n => _navMap[n.id] !== false);
  ...
}
```
Voor een `id` die niet in `_navMap` voorkomt (want geen `nav`-entry) is
`_navMap[n.id]` `undefined`, en `undefined !== false` is `true` — het item blijft
dus altijd staan zoals het toevallig al in de statische `NAV_ITEMS`-lijst stond,
**volledig los van wat de CMS-toggle laat zien.** Dat verklaart exact het
gemelde symptoom: de toggle in het CMS en het werkelijke gedrag op de site lopen
voor deze 3 pagina's blijvend uit elkaar, in beide richtingen, omdat de
koppeling voor hen simpelweg nooit is aangelegd.

**Waarom specifiek de laatste 3:** het is geen paginatie-bug of race condition —
`DATA.pages` en `DATA.nav` zijn twee losse, met de hand onderhouden arrays
(puur `localStorage`, geen Supabase-tabel — geverifieerd in
`beheer.html:1225-1243`). Toen pagina's 10-12 aan `DATA.pages` werden
toegevoegd, is vergeten ze ook aan `DATA.nav` toe te voegen. Het is dus een
**ontbrekende default/koppeling voor nieuw toegevoegde pagina's**, precies zoals
in de opdracht als mogelijke oorzaak genoemd. Het probleem is niet gebonden aan
"de laatste 3 posities" als zodanig — elke toekomstige pagina die aan `pages`
wordt toegevoegd zonder ook een `nav`-entry, vertoont hetzelfde gedrag.

### Voorgestelde fix
1. **Data herstellen:** ontbrekende entries toevoegen aan `DATA.nav`
   (`beheer.html:1175-1185`) voor `/doemee`, `/doneren`, `/boek` — met
   `visible` gelijk aan hun huidige `inMenu`-waarde (nu `false` voor alle drie).
2. **Code robuust maken** in `toggleMenu()` (`beheer.html:3080-3088`): als
   `navIdx === -1`, een nieuwe entry in `DATA.nav` **aanmaken** in plaats van de
   sync stil over te slaan, zodat dit bij een toekomstige nieuwe pagina niet
   opnieuw misgaat.
3. Na de fix expliciet testen: alle 12 pagina's een keer aan/uit togglen in het
   CMS en verifiëren op de live preview én op thuisindebuurt.nl zelf (niet
   alleen lokaal — conform de vaste werkwijze voor dit project).

---

## Aanbevolen volgorde

1. **Punt 4 (bug)** — eerst. Kleinste, meest geïsoleerde wijziging, root cause is
   volledig helder, en het is een bug die het vertrouwen in het CMS ondermijnt
   zolang hij blijft bestaan. Geen afhankelijkheden van de andere punten.
2. **Punt 1 (tekst)** — daarna. Ook heel klein, maar vereist de encode-buildstap
   voor `index.html`; goed om die build-flow in dezelfde sessie te doorlopen en
   te verifiëren dat hij nog probleemloos werkt.
3. **Punt 3 (Agenda/Buurtatlas verbergen)** — daarna, ná beantwoording van de
   open vraag of Margareth het Agenda-scherm actief gebruikt. Simpel qua code,
   maar verkeerd om (zonder dat antwoord) kan functieverlies opleveren.
4. **Punt 2 (iDEAL)** — laatste. Verreweg de grootste scope, vereist eerst
   externe actie van Giovanny (Mollie-account/KVK), nieuwe infrastructuur
   (serverless/edge function, webhook, nieuwe kolommen) en de meeste
   testzorgvuldigheid (echt geld). Logisch sluitstuk na de kleinere, snel te
   valideren punten.

## Openstaande vragen voor Giovanny

1. **Punt 1:** Is het gewenst dat "Over deze activiteit"/"Over deze agenda" ook
   meteen meeveranderen naar "Over [naam]" (ze delen dezelfde coderegel), of
   moet alleen het buurtinitiatief-geval aangepast worden?
2. **Punt 2:** Welke rol heeft Margareth momenteel in het CMS-rollensysteem
   (`superadmin`/`redactie`/`beheerder`) — dit bepaalt in welke plek en met
   welk risico verantwoordelijkheid voor betaalstatussen bij haar terechtkomt?
   En: transactiekosten van Mollie voor rekening van de stichting of doorbelast
   aan de deelnemer?
3. **Punt 2:** Blijft het bestaande vrije-tekst `kosten`-veld op activiteiten
   bestaan náást een nieuw gestructureerd `prijs`-veld, of vervangt één het
   ander op termijn?
4. **Punt 3:** Gebruikt Margareth het CMS-scherm "Agenda" op dit moment
   daadwerkelijk om eenmalige, exact-gedateerde evenementen aan te maken (dus
   los van de terugkerende activiteiten)? Dit bepaalt of verbergen zonder
   meer kan, of dat er eerst een alternatief moet komen.
5. **Punt 3:** Welke rol(len) moeten Agenda/Buurtatlas precies kwijtraken —
   alleen `superadmin` (Margareth), of ook `redactie` als die rol ook gebruikt
   wordt?
