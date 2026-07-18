# Haalbaarheidsrapport — 6 features Thuis in de Buurt

*Onderzoek uitgevoerd op 18 juli 2026, uitsluitend op basis van de code in
`/Users/g/Thuisindebuurttestsite.10/` (map "WEBSITE V2" genegeerd). Niet-verifieerbare
punten zijn gemarkeerd met **[aanname]**.*

---

## 0. Architectuur — cruciale context voor álle features

Voordat de features besproken worden, drie bevindingen die elke inschatting beïnvloeden:

**1. De website-code zit gecomprimeerd ín `index.html`.**
`index.html` (519 regels, 3,7 MB) is een "bundler"-bestand: de eigenlijke React-app
(schermen, componenten, CSS-template) zit als **gzip + base64** in twee script-tags
(`<script type="__bundler/manifest">` op regel 512 en `__bundler/template` daarnaast).
Een loader-script (regels 350–470) pakt die assets bij het laden in de browser uit en
draait ze door Babel-standalone. De bundle bevat o.a. deze modules (regelnummers in dit
rapport verwijzen naar de **uitgepakte** module):

| Module in bundle | Inhoud |
|---|---|
| `app.jsx` (241 r.) | Mount, `TWEAK_DEFAULTS`, `applyTokens()` (kleur-tokens) |
| `home.jsx` (339 r.) | Homepage incl. hero |
| `buurtatlas.jsx` (194 r.) | Buurtatlas met kaart + categoriefilter |
| `clubjes.jsx` (427 r.) | Buurtgroepen-overzicht + aanvraagformulier |
| `detail.jsx` (389 r.) | Detailpagina clubje/activiteit/agenda/nieuws |
| `other.jsx` (875 r.) | Agenda, Activiteiten, Partners, Netwerken, Nieuws, Doe mee, Doneren |
| `contact.jsx` (202 r.), `boek.jsx` (225 r.) | Contact- en boekpagina |
| ui/cms-bridge (591 r.) | TopBar, Footer, `CATEGORIES`, merge van Supabase-data |
| template.html (3.032 r.) | HTML-skelet + **alle site-CSS** (regels 1396–2400) |

⚠️ **Gevolg:** elke wijziging aan de website (features 1 t/m 4 en de CSS-kant van 5)
vereist: bundle decoderen → module aanpassen → opnieuw gzippen/base64'en → terugplaatsen
in `index.html`. Dat is scriptbaar, maar het is een extra bouwstap die bij elke feature
terugkomt. **De map `src/` is deels verouderd** (`src/App.jsx` en `src/screens/Home.jsx`
wijken af van de live bundle; `Buurtatlas.jsx` en `other.jsx` zijn wél identiek) — de
bundle in `index.html` is de bron van waarheid, niet `src/`.

**2. Dataflow website:** `index.html` regels 327–345 laden bij paginastart de
Supabase-tabellen `clubjes`, `activiteiten`, `agenda`, `nieuws`, `partners`,
`netwerken`, `categorieen` in `window._tibDefaultData`; de cms-bridge (regels 315–490)
merget dat in de globals `CLUBJES`, `ACTIVITIES`, `AGENDA`, `NEWS`. Formulieren op de
site schrijven rechtstreeks met de anon-key naar `aanmeldingen` (detail.jsx:93,
other.jsx:680), `buurtgroep_aanvragen` (clubjes.jsx:164), `contact_berichten`
(contact.jsx:15) en `boek_bestellingen` (boek.jsx:21). Git-commit `6205065` ("RLS grant
voor anon") bevestigt dat hiervoor RLS-policies bestaan; de policies zelf staan **niet**
in de repo.

**3. Bekende Supabase-tabellen** (uit de backup-lijsten, beheer.html:6093–6110 en 4953–4955):
`aanmeldingen`, `activiteiten`, `agenda`, `boek_bestellingen`, `buurtgroep_aanvragen`,
`buurtgroepen`, `categorieen`, `clubjes`, `contact_berichten`, `formulieren_instellingen`,
`inzending_notities`, `netwerken`, `nieuws`, `partners`, `profiles`,
`terugkerende_activiteiten`. Let op: er bestaat dus **zowel `clubjes` als
`buurtgroepen`** — de code gebruikt overal `clubjes`; `buurtgroepen` lijkt een
legacy-tabel **[aanname — alleen te bevestigen in het Supabase-dashboard]**.

`TIB Beheer.html` (werkkopie, 6.005 regels) loopt achter op `beheer.html` (live, 6.225
regels); dezelfde structuur, maar regelnummers verschuiven. Alle CMS-wijzigingen moeten
in beide (of de werkkopie moet eerst gelijkgetrokken worden).

---

## Feature 1 — "Bestaat dit nog?"-knop

### a) Wat moet er gebeuren
Een klein '!'-icoon bij items op de website. Klik → dialoog "Bestaat dit nog? Ja / Nee".
Bij "Nee" → formulier "Wat heb je te melden?" → insert in een nieuwe Supabase-tabel.
In het CMS een nieuw scherm onder "Inzendingen" met badge-teller.

### b) Geraakte bestanden / tabellen / functies

**Website (bundle in index.html):**
- `detail.jsx` — detailpagina's voor clubje, activiteit, agenda én nieuws (één component,
  routing via `page.kind`, zie detail.jsx:142). Meest logische primaire plek voor de knop.
- `clubjes.jsx` regels ±40–120 — kaartjes in het Buurtgroepen-overzicht (optioneel ook daar).
- `buurtatlas.jsx` regels 160–187 — de `place-item`-lijst van de Buurtatlas (voorzieningen
  als "Bakker Vermeer" hebben **geen** detailpagina; de knop moet daar in de lijst/popup).
- `other.jsx` — Partners/Netwerken-secties indien gewenst.

**Nieuwe Supabase-tabel** (bestaat nog niet): bv. `meldingen` met kolommen naar het
patroon van `buurtgroep_aanvragen`: `id`, `item_type` (tekst: 'clubje' | 'activiteit' |
'agenda' | 'partner' | 'atlas'), `item_id`, `item_naam` (denormalisatie, zodat de melding
leesbaar blijft als het item verdwijnt), `bestaat_nog` (boolean), `bericht` (text),
`status` (default `'nieuw'` — lowercase, zie git-commit 6205065), `gemeld_op`
(timestamptz). RLS: INSERT voor `anon`, SELECT/UPDATE/DELETE voor `authenticated`.

**CMS (beheer.html én TIB Beheer.html):**
- `NAV`-array, groep "Inzendingen": beheer.html:1278–1284 → nieuw item `{ id: 'meldingen', … }`.
- Badge-teller: `loadBadges()` beheer.html:5700–5718 → tabel toevoegen aan de `tables`-array
  (telt rijen met `status = 'nieuw'`).
- Nieuw scherm naar het patroon van `BgAanvragenScreen` (beheer.html:5342–5417), incl.
  `NotitieSectie` (beheer.html:5125) voor interne notities.
- Route-tabel beheer.html:5873–5891 → nieuwe route registreren.
- Backup-lijsten beheer.html:6093–6110 (en het duplicaat rond 4953) → tabel toevoegen.

### c) Haalbaarheid: **Gemiddeld**
Het CMS-patroon (scherm + badge + notities) bestaat al vijfmaal en is goed kopieerbaar.
De website-kant is klein maar raakt drie modules in de bundle (bundle-herbouw nodig).

### d) Bouwvolgorde / afhankelijkheden
1. Tabel + RLS-policies aanmaken in Supabase. 2. CMS-scherm + badge (direct testbaar
zonder website). 3. Website-knop + dialoog in `detail.jsx`, daarna `buurtatlas.jsx`.
Geen afhankelijkheid van andere features, maar terminologie ("buurtinitiatief") uit
feature 2 moet vaststaan vóór de teksten geschreven worden.

### e) Open vragen
- Bij welke item-types precies? Advies op basis van code: clubjes (buurtinitiatieven),
  activiteiten en Buurtatlas-plekken; agenda-items zijn eenmalig en verlopen vanzelf.
- Moet de melder een e-mailadres achterlaten (voor terugkoppeling), of anoniem?
- Moet er ook een e-mailnotificatie naar de beheerder? (Vereist een edge function of
  database-webhook; nu bestaat er nergens uitgaande mail behalve Supabase-auth-mails.)

---

## Feature 2 — Rename Buurtgroep → Buurtinitiatief

### a) Wat moet er gebeuren
Overal in website + CMS "buurtgroep(en)" vervangen door "buurtinitiatief/-initiatieven",
en de definitie aanscherpen: buurtinitiatief = aangeleverd **vanuit de buurt**;
activiteit = van Thuis in de Buurt **zelf**. Enkele omschrijvende teksten moeten
inhoudelijk mee (bv. home.jsx:157 "Een buurtgroep is een groepje buurtbewoners…").

### b) Alle vindplaatsen

**Website-bundle (UI-teksten):** 30 voorkomens, verdeeld over:
- `home.jsx`: 57, 95, 100, 107, 136, 153, 157, 194, 197 (hero-CTA "Ontdek de
  Buurtgroepen", pill "actieve buurtgroepen", sectiekop, definitietekst).
- `clubjes.jsx`: 61, 165, 227 (teller, formulierveld, icoon-label) + paginateksten.
- `detail.jsx`: 142, 317, 370 ("← Alle buurtgroepen", breadcrumb-label).
- `contact.jsx`: 25, 26, 93, 126, 127, 193 (rolomschrijvingen, dropdown-optie, FAQ).
- cms-bridge: 99 (navigatielabel "Buurtgroepen"), 228, 237, 350.
- `other.jsx`: 667–684 (variabele `buurtgroepKeuze` → kolom `buurtgroep_keuze`).
- `index.html` zelf (leesbare deel): 6 voorkomens in de vooraf ingebakken
  `_tibDefaultData`/nav-JSON op regel 64.

**CMS `beheer.html`:** ±65 voorkomens, o.a. regels 1161, 1177, 1188, 1195–1196, 1262
(sidebar-label), 1281 ("Buurtgroep aanvragen"), 1313 (rollabel "Buurtgroep-beheerder"),
1524, 1557, 1616, 1773–1804, 1860–1965, 2043, 2107, 2817–2936 (kaartscherm), 3075–3076,
3720, 3774, 3788, 4217, 4356, 4543, 4593, 4766, 4927, 5265, 5334–5335, 5341–5413, 5873,
5891. Zelfde beeld in `TIB Beheer.html` (±62 voorkomens, verschoven regelnummers).

**Database-namen (níét hernoemen — zie risico):**
- Tabel `buurtgroep_aanvragen` (gebruikt in clubjes.jsx:164 en beheer.html:5348/5353/5359).
- Kolom `buurtgroep_keuze` in `aanmeldingen` (other.jsx:684, beheer.html:5265).
- Kolom `naam_buurtgroep` in `buurtgroep_aanvragen` (clubjes.jsx:165, beheer.html:5369/5381).
- Legacy-tabel `buurtgroepen` (alleen in backup-lijsten).
- De hoofdtabel heet al `clubjes` — die bevat het woord "buurtgroep" dus niet.

### c) Haalbaarheid — twee scenario's

| Scenario | Inschatting | Risico |
|---|---|---|
| **Alleen UI-laag** (teksten + labels, DB blijft) | **Simpel** (maar bewerkelijk: ±95 plekken + bundle-herbouw) | Laag. Interne naam ≠ schermnaam is al de praktijk (`clubjes` heet op scherm "Buurtgroepen"). |
| **Ook DB hernoemen** (`buurtgroep_aanvragen` → `initiatief_aanvragen`, kolommen mee) | **Complex** | Hoog: RLS-policies, het live-CMS, de werkkopie, backup-scripts én de website-bundle moeten in één keer synchroon om; bij een misser breken formulieren op de live site. Geen migratietooling in de repo aanwezig. |

**Advies: alleen de UI-laag hernoemen.** De databank kent al het precedent
`clubjes`/"Buurtgroepen"; consistentie in de UI is wat de bezoeker en beheerder zien.

### d) Bouwvolgorde / afhankelijkheden
Eerst uitvoeren, vóór features 1 en 3: die introduceren nieuwe teksten/categorieën die
meteen de juiste term moeten gebruiken. Website-bundle en beide CMS-bestanden in dezelfde
sessie aanpassen om een gemengde site te vermijden.

### e) Open vragen
- Blijft de rol-aanduiding "Buurtgroep-beheerder" (beheer.html:1313) of wordt dat
  "Initiatief-beheerder"?
- Wordt de URL-slug `/clubjes` (beheer.html:1161/1177 en nav-target in index.html:64)
  ook hernoemd? Dit is zichtbaar in de nav-JSON, maar wijzigen raakt nav-configuratie in
  Supabase-data **[aanname: `nav` wordt in de DB of localStorage bewaard — bron is
  `_tibCms.nav`, cms-bridge:470]**.
- Mag de legacy-tabel `buurtgroepen` opgeruimd worden? (Eerst in dashboard controleren of
  er data in staat.)

---

## Feature 3 — Buurtatlas: 4 categorieën

### a) Wat moet er gebeuren
De Buurtatlas krijgt vier hoofdcategorieën: **Voorzieningen, Buurtinitiatief, Partners,
Activiteiten**, inclusief migratie van bestaande items.

### b) Huidige situatie (belangrijkste bevinding: de atlas is grotendeels statisch)
- `buurtatlas.jsx:4–12`: **7 hardgecodeerde categorieën** (`ATLAS_CATEGORIES`):
  Bewonersinitiatieven, Wijkwinkel, Zorg & Welzijn, Verenigingen, Eten & Drinken,
  Partners, Kunst & Cultuur — met vaste kleuren.
- `buurtatlas.jsx:14–29`: **14 hardgecodeerde plekken** (`ATLAS_PLACES`) met lat/lng.
- `buurtatlas.jsx:89–106`: enige live-koppeling — plekken worden via naam-matching
  (`matchPartner`, r.33–40) verrijkt vanuit de `partners`-tabel.
- Filtering: chip-knoppen togglen een `Set` van actieve categorie-id's
  (buurtatlas.jsx:115–123); kaart (`AtlasMap`, r.42–82) en lijst (r.160–187) filteren
  daarop.
- De bestaande `categorieen`-tabel (kolommen `id`, `naam`, `icoon`, `kleur`, `volgorde`
  — zie CategoriesScreen, beheer.html:3711–3800) is een **andere as**: het zijn
  inhoudscategorieën (Sport/Cultuur/Sociaal/…) voor clubjes/activiteiten, niet de
  atlas-hoofdindeling. De website gebruikt daarvan overigens alleen `naam` en kent zelf
  kleuren toe (cms-bridge:266–272) — de `kleur`-kolom uit de DB wordt op de site
  genegeerd (bestaande inconsistentie).
- Het CMS heeft al een eigen kaartscherm (`BuurtatlasScreen`, beheer.html:2788–2936) dat
  pins toont uit **drie live bronnen**: clubjes, activiteiten en partners (regel 2817 e.v.).

### c) Haalbaarheid: **Gemiddeld tot Complex**
Drie van de vier gewenste categorieën kunnen live gevoed worden uit bestaande tabellen
(Buurtinitiatief ← `clubjes`, Partners ← `partners`, Activiteiten ←
`activiteiten`/`terugkerende_activiteiten` — mits die items lat/lng hebben). Voor
**Voorzieningen** (bakker, bibliotheek, strandtent …) bestaat **geen databron**: die 14
plekken zitten alleen hardgecodeerd in `ATLAS_PLACES`. Er is dus een nieuwe tabel
`voorzieningen` nodig (+ CMS-beheerscherm) óf de atlas blijft voor die categorie statisch.

### d) Bouwvolgorde / afhankelijkheden
1. Besluit databron Voorzieningen (nieuwe tabel + CMS-scherm, patroon `PartnersScreen`).
2. Migratiescript: de 14 `ATLAS_PLACES` naar de nieuwe tabel; bestaande cat-mapping:
   `bewoners`→Buurtinitiatief, `org`→Partners, rest→Voorzieningen.
3. `buurtatlas.jsx` herschrijven: `ATLAS_CATEGORIES` → 4 vaste hoofdcategorieën;
   `ATLAS_PLACES` vervangen door live queries (patroon: CMS-BuurtatlasScreen 2817–2870).
4. Bundle herbouwen. Afhankelijk van feature 2 (naam "Buurtinitiatief") en het
   kleurbesluit uit feature 5 (categoriekleuren).

### e) Open vragen
- Moeten de 4 hoofdcategorieën beheerbaar zijn in het CMS, of mogen ze vast in de code?
  (Vast = veel simpeler; de indeling is beleidsmatig en verandert zelden.)
- Wat gebeurt er met de huidige subindeling (Zorg & Welzijn, Eten & Drinken …)? Wordt dat
  een sub-label binnen Voorzieningen of vervalt het?
- Hebben bestaande `clubjes`/`activiteiten`-rijen voldoende lat/lng-data om zinvol op de
  kaart te verschijnen? (Niet controleerbaar vanuit de code; beheer.html:2936 waarschuwt
  al dat alleen items mét coördinaten verschijnen.)

---

## Feature 4 — Homepage scroll-begeleiding

### a) Wat moet er gebeuren
Subtiele geanimeerde pijl onderaan de hero ("Ontdek de buurt ↓") die smooth scrollt naar
de eerste sectie.

### b) Geraakte bestanden
- Bundle-module `home.jsx:84–116` — de hero-sectie (`<section className="hero removable">`);
  de pijl komt ná `hero-grid` (r.89) binnen de sectie; scrolldoel is de intro-sectie
  (r.119–144, `section-band`).
- Template-CSS: `.hero`-regels (template r.1571–1659) voor de pijl-styling + een
  `@keyframes`-animatie (er is al een precedent: `hero-logo-float`, template r.1636–1643,
  inclusief `prefers-reduced-motion`-uitschakeling op r.1644–1646 — zelfde patroon
  toepassen op de pijl).
- Mobiele overrides staan direct leesbaar in `index.html` (regel 130: `.hero { padding:
  28px 0 40px; }`).

### c) Haalbaarheid: **Simpel**
Kleinste feature van de zes. Enige "kosten": bundle-herbouw. Technisch: `ref` op de
intro-sectie + `scrollIntoView({ behavior: 'smooth' })`; geen router-complicaties want de
hero en intro staan in dezelfde `Home`-component.

**Neemt de hero te veel viewport in?** Nee, niet structureel: de hero is **niet**
vh-gebaseerd (padding 60px/80px, template r.1571–1575; logo max 460px, r.1629–1635).
Op mobiel is hij al compact (28px/40px). Op kleinere laptopschermen (≈768–900px hoog)
vult topbar + hero echter wél praktisch het hele eerste scherm, waardoor de
intro-sectie net buiten beeld valt — precies het probleem dat de scroll-pijl oplost.
Advies: pijl toevoegen, hero-hoogte laten zoals hij is; eventueel het lege
`hero-visual`-gebied verkleinen als het logo (nu een zwevende animatie) minder prominent
mag.

**Advies-variant voor deze doelgroep** (deels oudere buurtbewoners, tone-of-voice "je"):
een zichtbare, klikbare knop met tekst ("Ontdek de buurt ↓") in plaats van alleen een
subtiel pijltje; groot touch-target (de site hanteert al min. 44px, index.html regel ±280),
langzame bounce-animatie, uit bij `prefers-reduced-motion`.

### d) Bouwvolgorde / afhankelijkheden
Volledig onafhankelijk; geschikt als eerste "proefrit" voor de bundle-herbouwworkflow.

### e) Open vragen
- Alleen op de homepage, of ook op subpagina's met een `page-head`?
- Moet de pijl verdwijnen zodra de bezoeker scrollt (gebruikelijk patroon)?

---

## Feature 5 — CMS Huisstijl: kleurenfunctie (5 kleuren per sectie)

### a) Huidige situatie
- Het CMS-scherm `HuisstijlScreen` (beheer.html:4178–4371) toont nu 3 kleurvelden
  (primair/accent/achtergrond, r.4181–4182 en 4245–4268) — maar de waarden zijn **alleen
  lokale React-state**: ze worden nergens opgeslagen en zitten óók niet in de
  `__syncToSite()`-payload (beheer.html:5743–5760). De kleurkeuze in het CMS doet op dit
  moment dus feitelijk niets voor de live site.
- De website heeft wél een werkend token-systeem: `applyTokens()` (bundle app.jsx:27–41)
  zet CSS-variabelen (`--tib-blue`, `--tib-green`, `--tib-cream` + afgeleiden) op `:root`
  vanuit `TWEAK_DEFAULTS` (app.jsx:5–22; live primair = `#2D7F7B` teal).
- De site-CSS (template r.1396–2400) gebruikt die variabelen grotendeels, maar bevat ook
  **hardgecodeerde kleuren die buiten het token-systeem vallen** — zie inventarisatie.

### b/1) Kleurinventarisatie (template-CSS r.1396–2400 + overrides in index.html r.55–320)

**Design-tokens (`:root`, template r.1401–1427):**

| Token | Waarde | Rol |
|---|---|---|
| `--tib-blue` | `#2D7F7B` (teal) | Primair: links, actieve nav, chips, agenda-datum, callouts |
| `--tib-blue-deep` | `#1F5F5B` | Footer-achtergrond, button-hover, donkere accenten |
| `--tib-blue-soft` | `#e0f2f1` | Zachte achtergronden: badges, chip-hover, callout |
| `--tib-green` | `#3f8f7a` | Accent: hero-eyebrow, doneer-gradient, footer-knop |
| `--tib-green-soft` | `#e3efe9` | Zachte groene vlakken |
| `--tib-cream` | `#faf3e6` | Formuliervelden, topbar (92% opacity), band na hero |
| `--tib-cream-deep` | `#f3ead6` | `btn-soft`-achtergrond |
| `--tib-ink` / `-soft` / `-muted` | `#1d2530` / `#4a5563` / `#7a8392` | Tekst (koppen / body / meta) |
| `--tib-line` | `#e6dcc4` | Randen/scheidingslijnen |
| `--tib-warn` / `--tib-accent` | `#c98a3a` / `#F07830` | Waarschuwing / oranje accent |

**Kleurgebruik per element/sectie (selectie; hardcoded waarden vetgedrukt = vallen buiten tokens):**

| Element | Kleur | Sectie |
|---|---|---|
| `html, body`, `.tib-shell`, `.hero`, `.section-band` achtergrond | **#FFFFFF** | Basis/hero |
| `.tib-topbar` achtergrond | rgba(250,243,230,.92) (≈ cream) | Navigatie |
| `.tib-nav button.active` | var(--tib-blue) | Navigatie |
| `.btn-primary` / `:hover` | **#2D7F7B !important** / **#1F5F5B !important** | Alle secties |
| `.btn-secondary` / `:hover` | **#2D7F7B** / **#1F5F5B** | Topbar-CTA |
| `.btn-ghost` | transparant + var(--tib-blue) rand | Alle secties |
| `.btn-soft` / `:hover` | var(--tib-cream-deep) / **#ecdfc2** | Kaartjes |
| `.hero-eyebrow` (+ streepje) | var(--tib-green) | Hero |
| `.hero-bg` stippenpatroon | rgba(45,127,123,.07) | Hero |
| `.hero + .section-band` | **#faf3e6** | Intro-band |
| `.section-band-blue` | var(--tib-blue) + wit | Blauwe banden |
| `.badge` standaard | var(--tib-blue-soft)/var(--tib-blue-deep) | Kaartjes |
| `.badge.cat-*` (6 stuks) | **#e3edf6/#2D7F7B, #ece2f0/#6c3e8a, #dfeee5/#2e7563, #fbe9d6/#a55a1c, #f6dede/#99352f, #ece9e0/#5e5949** | Categorielabels |
| `.agenda-date` | var(--tib-blue) + wit | Agenda |
| `.donate-card` | gradient var(--tib-green) → **#2e7563** | Doneerblok |
| `.donate-cta .btn-primary` | wit + var(--tib-blue-deep) (!important) | Doneerblok |
| `.tib-footer` | var(--tib-blue-deep) + wit-transparanten | Footer |
| `.tib-footer .nl-form button` | var(--tib-green) | Footer |
| `.chip` / `.active` | wit/--tib-line → var(--tib-blue) | Filters (Atlas/Clubjes) |
| Formuliervelden | var(--tib-cream) bg, focus var(--tib-blue) | Formulieren |
| `.callout` | var(--tib-blue-soft) + var(--tib-blue) rand | Atlas/detail |
| `.leaflet-container` | **#dde7d4 !important** | Kaarten |
| `.proto-note` | **#fff8e1** / **#78350f** | Prototype-notitie |
| `.ph.ph-green` label | **#275949** | Foto-placeholders |
| Atlas-categoriekleuren | **7 hex-waarden in buurtatlas.jsx:5–11** (JS, niet CSS) | Buurtatlas |
| CMS-categoriekleuren | 6 oklch-waarden (beheer.html:3722) + `_CAT_COLORS` 6 hex (cms-bridge:266) | Badges/kaart |

Belangrijkste knelpunten: de `!important`-hardcodes op `.btn-primary`/`.btn-secondary`,
de zes `cat-*`-badgekleuren, kleuren die in **JS** in plaats van CSS leven
(buurtatlas.jsx, cms-bridge, Leaflet-popups in buurtatlas.jsx:66–72), en drie
verschillende categoriekleur-setjes die niet synchroon lopen.

### b/2) Voorstel: 5 kleurrollen per sectie

| Rol | Nu (voorbeeld hero) | CSS-variabele (voorstel) |
|---|---|---|
| 1. Achtergrond | #FFFFFF | `--sec-bg` |
| 2. Koptekst/tekst | --tib-ink | `--sec-ink` |
| 3. Primaire knop | #2D7F7B | `--sec-btn` |
| 4. Knop-hover | #1F5F5B | `--sec-btn-hover` |
| 5. Accent (eyebrow/lijnen/badges) | --tib-green | `--sec-accent` |

Secties die elk dit vijftal krijgen (aansluitend op de bestaande sectielijst in
HuisstijlScreen r.4214–4224 en `SECTIONS` in home.jsx:54–62): Hero, Intro-band,
Buurtinitiatieven, Agenda, Activiteiten, Partners, Doneerblok, Footer.

### b/3) Technische aanpak — advies en alternatieven

**Aanbevolen: CSS custom properties per sectie + één Supabase-settingstabel.**
1. Nieuwe tabel `huisstijl_instellingen` (of hergebruik van het patroon
   `formulieren_instellingen`): kolommen `sectie`, `rol`, `kleur` — of één JSONB-rij.
   RLS: SELECT voor anon (site moet kunnen lezen), UPDATE alleen superadmin.
2. Website: tabel meenemen in de bootstrap-lijst (index.html:334) en in `applyTokens()`
   per sectie variabelen zetten (`.hero { background: var(--sec-hero-bg, #FFFFFF); }`).
3. CSS-refactor in de template: hardcodes vervangen door variabelen met fallback —
   verplichte voorwaarde, anders doen 5-kleuren-instellingen niets bij o.a. `.btn-primary`.
4. CMS: `HuisstijlScreen` uitbreiden met per-sectie kleurenrijen (swatch-UI bestaat al,
   r.4245–4268) + een échte opslag (nu ontbreekt zelfs die voor de 3 bestaande kleuren).

*Alternatief A — alleen globale tokens persistenten (geen per-sectie):* veel kleiner
(hergebruik `applyTokens`), maar voldoet niet aan de 5-per-sectie-wens. Wel een zinvolle
fase 1. *Alternatief B — kleuren in localStorage zoals de rest van `__syncToSite`:*
werkt alleen op het apparaat van de beheerder, niet voor bezoekers — afvallen.

Voor- en nadelen aanbevolen aanpak: + geen structuurwijziging aan HTML, + fallback naar
huidige kleuren als de tabel leeg is, + WCAG-check kan in het CMS (het paneel toont nu een
nep-"AAA"-badge, r.4361–4366 — die moet echt worden of weg); − grootste refactor van de
zes features, − risico dat een beheerder onleesbare combinaties kiest (mitigatie: swatches
i.p.v. vrije picker, zoals de huidige UI al doet, r.4244).

### c) Haalbaarheid: **Complex**
Niet door de techniek per onderdeel, maar door de breedte: CSS-refactor van ±40
hardgecodeerde declaraties, nieuwe tabel + RLS, bootstrap-uitbreiding, CMS-UI, en
bundle-herbouw. Plus ontwerpbesluiten (welke kleuren mag een niet-technische beheerder
echt aanpassen?).

### d) Bouwvolgorde / afhankelijkheden
Als laatste bouwen. Fase 1: bestaande 3 tokens persistenten (tabel + bootstrap +
`applyTokens`) — daarmee werkt het huidige Huisstijl-scherm eindelijk echt. Fase 2:
per-sectie rollen + CSS-refactor. Feature 3 (atlas-kleuren) en de categoriekleur-chaos
kunnen in fase 2 meegenomen worden.

### e) Open vragen
- Moeten álle 8 secties instelbaar zijn, of volstaan hero, banden, doneerblok en footer
  (de visueel dominante)? Elke extra sectie = extra refactorwerk.
- Mag de vrije hex-input (r.4250) vervallen ten gunste van alleen swatches?
- Vallen de categorie-badgekleuren (nu 3 verschillende setjes) ook onder deze feature?

---

## Feature 6 — Gebruikers optimaliseren

### a) Wat moet er gebeuren
Rollen/rechten kloppend maken, een werkende wachtwoord-vergeten-flow en een volledige
account-aanmaakflow; e-mailtemplates (custom SMTP via Resend) controleren.

### b) Huidige setup (wat de code laat zien)

**Rollen:** 3 stuks in `profiles` (kolommen `id`, `role`, `club_id`): `superadmin`,
`redactie`, `beheerder` (label "Buurtgroep-beheerder", beheer.html:1313).

**Waar wordt op rol gecheckt:**
- *Client-side (CMS):* sidebar verbergt items per rol (`HIDDEN`, beheer.html:1300–1305;
  `BEHEERDER_ROUTES`, r.1296), route-blokkade (r.5896–5900), badge-laden alleen
  superadmin (r.5702), backup-knop alleen superadmin (r.5005, 6205). Profiel wordt bij
  login geladen (r.5682–5692).
- *Server-side:* de edge function `manage-users`
  (supabase/functions/manage-users/index.ts) checkt wél correct server-side op
  superadmin (r.57–68) voor list/invite/update/delete van gebruikers.
- *RLS-policies:* niet in de repo. Of `redactie`/`beheerder` op databaseniveau beperkt
  zijn in wat ze mogen schrijven is **niet verifieerbaar** — zie security-gaten.

**Account aanmaken:** alleen via uitnodiging door een superadmin
(`GebruikersScreen`, beheer.html:4373–4680 → edge `invite`-actie →
`inviteUserByEmail` met `redirectTo: https://app.thuisindebuurt.nl/TIB%20Wachtwoord.html`,
index.ts:98–101, plus directe `profiles`-upsert als trigger-fallback, r.104–108). Er is
géén publieke self-signup — vermoedelijk gewenst voor een CMS.

**Wachtwoord instellen:** `TIB Wachtwoord.html` leest `#access_token` + `type` uit de
URL-hash (r.185–188), accepteert `invite` én `recovery` (r.205) en zet het wachtwoord via
een directe `PUT /auth/v1/user` REST-call (r.233–241). Minimaal 8 tekens (r.222).

**Wachtwoord-vergeten-flow: BESTAAT NIET.** `LoginScreen` (beheer.html:5552–5655) heeft
alleen e-mail + wachtwoord; `resetPasswordForEmail` wordt **nergens** aangeroepen (niet
in beheer.html, TIB Beheer.html of de website-bundle). Het `recovery`-pad in
TIB Wachtwoord.html is dus onbereikbare code: niemand kan een recovery-mail triggeren
zonder tussenkomst van een admin.

**Resend/SMTP + e-mailtemplates:** nergens in de repo terug te vinden — dat is
dashboard-configuratie. **[aanname: eerder geconfigureerd zoals opgegeven; alleen te
controleren in Supabase → Auth → Emails.]** Belangrijk controle­punt: TIB Wachtwoord.html
verwacht links in het **implicit-flow-formaat** (`#access_token=…&type=invite|recovery`,
d.w.z. templates met `{{ .ConfirmationURL }}`). Als een template ooit is omgebouwd naar
`token_hash`/OTP-formaat, toont de pagina "Ongeldige of verlopen link".

### c) Security-gaten (expliciet)

1. **Rolscheiding binnen het CMS is (aantoonbaar) alleen client-side.** Een ingelogde
   `beheerder` of `redactie` kan met dezelfde JWT via de Supabase-API rechtstreeks
   schrijven naar elke tabel waarvoor RLS "authenticated mag schrijven" toestaat. Of dat
   zo is, staat niet in de repo — **dit is de belangrijkste audit-actie**: per tabel de
   policies nalopen (verwacht: alleen superadmin/redactie mag content schrijven; een
   club-beheerder alleen de eigen club).
2. **Ontbrekend profiel = beheerder.** Bij een ontbrekende `profiles`-rij valt de client
   terug op `{ role: 'beheerder' }` (beheer.html:5688). Client-side onschuldig, maar het
   maskeert data-inconsistenties; de edge function heeft die fallback terecht niet.
3. **Anon-schrijfbare tabellen mogen niet anon-leesbaar zijn.** `boek_bestellingen`
   bevat NAW-gegevens (adres, telefoon — zie beheer.html:5540–5544);
   `aanmeldingen`/`contact_berichten` bevatten e-mailadressen. Controleer dat de
   RLS-policies voor `anon` alleen INSERT geven, geen SELECT. Niet verifieerbaar vanuit
   de code.
4. **Recovery-flow onbereikbaar** (zie boven) — beheerders die hun wachtwoord kwijt zijn,
   zijn nu afhankelijk van een superadmin die opnieuw uitnodigt.
5. Klein: de edge function stuurt `Access-Control-Allow-Origin: *` (index.ts:22) — door
   de JWT-check laag risico, maar aanscherpen naar het eigen domein kan. Login-fouten
   worden onvertaald doorgegeven (r.5563), wat account-enumeratie iets makkelijker maakt.
6. De anon-key staat in de HTML — dat is bij Supabase by design en géén lek, *mits* RLS
   overal klopt (zie punt 1/3).

### d) Wat ontbreekt voor een volledige flow + bouwvolgorde
1. "Wachtwoord vergeten?"-link op `LoginScreen` → klein formulier →
   `supabase.auth.resetPasswordForEmail(email, { redirectTo: 'https://app.thuisindebuurt.nl/TIB%20Wachtwoord.html' })`.
   TIB Wachtwoord.html hoeft dan (waarschijnlijk) niet aangepast: het recovery-pad staat klaar.
2. RLS-audit (dashboard) van alle 16 tabellen + `profiles`-trigger controleren.
3. E-mailtemplates (invite + recovery) controleren op Resend-afzender én
   `{{ .ConfirmationURL }}`-formaat; testmail sturen.
4. Optioneel: nette foutteksten op login, en de rolfallback vervangen door een
   foutmelding "geen profiel — neem contact op".

### e) Haalbaarheid: **Gemiddeld** — de code-kant (stap 1, 4) is Simpel; het gewicht zit
in de dashboard-audit (stap 2–3) die buiten de repo valt.

### Open vragen
- Zie "Openstaande vragen" hieronder (RLS, Resend, rol-matrix).

---

## Aanbevolen bouwvolgorde

1. **Feature 2 — Rename (UI-laag).** Fundament: alle andere features schrijven teksten
   die meteen de juiste term ("Buurtinitiatief") moeten dragen. Laag risico, geen
   DB-wijziging. Meteen de kans om de bundle-herbouwworkflow te scripten — die is voor
   4 van de 6 features nodig.
2. **Feature 4 — Scroll-pijl.** Kleinste feature; ideale eerste echte test van de
   bundle-workflow uit stap 1, met direct zichtbaar resultaat.
3. **Feature 6 — Gebruikers/auth.** Security gaat vóór nieuwe functionaliteit: de
   RLS-audit bepaalt bovendien hoe de nieuwe tabellen van features 1, 3 en 5 hun
   policies moeten krijgen — dat wil je één keer goed vaststellen.
4. **Feature 1 — Meldknop.** Bouwt op het bestaande inzendingen-patroon en op de
   RLS-afspraken uit stap 3; terminologie uit stap 1.
5. **Feature 3 — Buurtatlas-categorieën.** Vereist het besluit over de
   voorzieningen-tabel en profiteert van stap 4 (meldknop kan direct in de nieuwe
   atlas-lijst mee).
6. **Feature 5 — Huisstijl-kleuren.** Grootste refactor; in twee fasen (eerst de 3
   bestaande tokens echt persistent maken, daarna per-sectie). Als laatste, zodat de
   kleuren van de nieuwe atlas-categorieën (stap 5) meteen in het systeem vallen.

---

## Openstaande vragen voor Giovanny

**Architectuur / werkwijze**
1. Is er een bestaand script of workflow om de bundle in `index.html` te herbouwen, of is
   dat tot nu toe handwerk? (Zo niet: eerst een klein encode/decode-script maken.)
2. Mag `src/` gelijkgetrokken worden met de live bundle, of is `src/` bewust bevroren?
3. `TIB Beheer.html` loopt 220 regels achter op `beheer.html` — eerst synchroniseren, of
   wijzigingen alleen nog in `beheer.html` doorvoeren?

**Database (alleen in Supabase-dashboard te beantwoorden)**
4. Staat er data in de legacy-tabel `buurtgroepen` en mag die weg?
5. RLS-audit: welke policies staan er nu per tabel voor `anon` en `authenticated`? Kan
   `anon` ergens SELECT-en op inzendings-/besteltabellen (privacygevoelig)?
6. Hebben `clubjes` en `activiteiten` gevulde lat/lng-kolommen (nodig voor feature 3)?

**Auth / e-mail**
7. Is Resend nog actief als custom SMTP, en gebruiken de invite/recovery-templates het
   `{{ .ConfirmationURL }}`-formaat (vereist door TIB Wachtwoord.html)?
8. Moet er self-signup komen, of blijft account-aanmaak invite-only (advies: invite-only)?
9. Welke rechten hoort `redactie` precies te hebben op databaseniveau (schrijven op alle
   content-tabellen, of minder)?

**Functioneel**
10. Feature 1: bij welke item-types komt de meldknop, en wil je een e-mailnotificatie bij
    nieuwe meldingen?
11. Feature 2: gaat de rol-aanduiding "Buurtgroep-beheerder" en de URL-slug `/clubjes` mee
    in de rename?
12. Feature 3: worden de 4 hoofdcategorieën vast in code (advies) of CMS-beheerbaar, en
    blijft er een subindeling binnen "Voorzieningen"?
13. Feature 5: welke secties moeten écht instelbaar zijn, en mag de vrije hex-invoer
    vervallen ten gunste van alleen voorgeselecteerde swatches?
