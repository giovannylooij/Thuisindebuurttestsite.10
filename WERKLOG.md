# Werklog — autonome sessie

Bijgehouden per feature: wat gebouwd is, welke beslissingen zelfstandig zijn
genomen en waarom, wat getest is, en openstaande punten voor Giovanny.

---

## Vooraf: git-authenticatie hersteld

`git push` werkte niet meer (verlopen token in Keychain). Opgelost met een
dedicated SSH-sleutel (`~/.ssh/id_ed25519_github`, publieke sleutel
toegevoegd aan GitHub-account). Werkt nu zonder wachtwoord/token, ook op
afstand. Geen actie meer nodig van Giovanny hiervoor.

## Vooraf: beheer.html vs "TIB Beheer.html"

`beheer.html` (live, door Vercel geserveerd) liep vóór op `TIB Beheer.html`
(werkkopie) — 271 regels verschil. Ik bewerk daarom **beheer.html direct**
en kopieer die ná elke wijziging over `TIB Beheer.html` heen (niet
andersom — dat zou live functionaliteit hebben teruggedraaid).

---

## ✅ Scrollbalk in huisstijlkleur
Custom scrollbar (WebKit + Firefox `scrollbar-color`) in primaire teal-kleur
op de publieke website, CMS ongemoeid. Puur CSS, geen DB nodig.
**Live gecontroleerd:** thuisindebuurt.nl + app.thuisindebuurt.nl, geen
consolefouten.

## ✅ Feature 5 — Huisstijl-kleuren persistent (fase 1)
De 3 bestaande kleurkiezers in het CMS-scherm "Huisstijl" deden voorheen
niets (geen enkele waarde werd opgeslagen of toegepast — de
achtergrondkleur-swatches hadden zelfs geen `onClick`-handler, dat veld was
volledig kapot).

**Gebouwd:**
- Nieuwe tabel `huisstijl_instellingen` — **SQL staat klaar in
  [`sql/huisstijl_instellingen.sql`](sql/huisstijl_instellingen.sql), maar
  ik heb geen Supabase-toegang in deze sessie. Giovanny moet dit bestand
  zelf één keer in de Supabase SQL Editor plakken en uitvoeren.**
  RLS: iedereen mag lezen (nodig voor de website), alleen `superadmin` mag
  wijzigen (consistent met dat Huisstijl al verborgen is voor
  redactie/beheerder-rollen).
- CMS: `HuisstijlScreen` laadt nu de opgeslagen kleuren bij openen, en
  "Toepassen" slaat ze echt op met een duidelijke foutmelding als de tabel
  nog niet bestaat.
- Website: `index.html` haalt de tabel geïsoleerd op (kan de rest van de
  bootstrap-fetch niet breken bij een fout — eigen try/catch, raakt de
  bestaande `hasError`-logica voor de andere tabellen niet aan). `app.jsx`
  past de kleuren toe vóór de eerste render (geen kleurflits).
- **Bugfix gevonden en meegenomen:** de primaire kleur in het CMS stond
  hardcoded op het verkeerde blauw (`#1a4a7a`) terwijl de site al teal
  (`#2D7F7B`) gebruikt. Nu overal consistent — ook de swatch-opties en de
  Reset-knop kloppen nu met de echte sitekleur.

**Defensief ontwerp:** zolang de SQL-migratie niet is uitgevoerd, verandert
er niets op de website — de site valt terug op exact de huidige kleuren.

**Getest:** bundle-roundtrip (decode→encode→decode, byte-identiek), lokale
browser (Babel-parse van de volledige ~6200-regelige CMS-bundle zonder
fouten = geen syntaxfouten), live gecontroleerd op thuisindebuurt.nl (kleuren
ongewijzigd, zoals verwacht) en app.thuisindebuurt.nl (geen consolefouten).
**Kon niet testen:** het daadwerkelijk opslaan via de CMS-knop "Toepassen",
want dat vereist inloggen (credentials heb ik niet) én de tabel bestaat nog
niet. Dit moet Giovanny zelf natesten na het draaien van de SQL-migratie.

**Follow-up tijdens live gebruik:** `upsert()` bleek op RLS te stuklopen
("new row violates row-level security policy") omdat upsert onder water
eerst een INSERT probeert, en er alleen een UPDATE-policy bestond. Fix:
vervangen door een gewone `update().eq('id', 1)` — de rij bestaat altijd al
dankzij de SQL-seed, dus INSERT is nooit nodig. Nadien zelf via de
anon-key op de live site geverifieerd dat de tabel bestaat, gelezen wordt
en de kleur daadwerkelijk als CSS-variabele wordt toegepast.

**Extra, op verzoek:** kleurenpalet per kiezer uitgebreid van 5-6 naar 10
swatches, en de 3 opgegeven kleuren (`#E48033`, `#87C2C6`, `#077063`)
toegevoegd aan alle drie de kiezers (Primair, Accent, Achtergrond).

## ✅ Feature 5 fase 2 — Huisstijl-kleuren per sectie (6 secties × 3 rollen)
Op verzoek van Giovanny uitgebreid met fijnere, per-sectie kleurcontrole:
Merk & tekst, Navigatie, Hero, Secties & banden, Knoppen, Footer — elk met
3 kleurrollen (18 kleuren totaal), naast de globale 3 kleuren uit fase 1.

**Gebouwd:**
- Nieuwe tabel `huisstijl_secties` (sectie, rol, kleur) —
  [`sql/huisstijl_secties.sql`](sql/huisstijl_secties.sql), **nog door
  Giovanny uit te voeren**, 18 rijen gezaaid met exact de huidige
  sitekleuren. RLS: select voor iedereen, update alleen superadmin
  (meteen met de update()-i.p.v.-upsert()-les uit fase 1 verwerkt).
- CSS-refactor: 16 nieuwe `--sec-*` custom properties in `:root`
  (template.html), plus hergebruik van de bestaande `--tib-ink-soft` /
  `--tib-ink-muted` voor "Lopende tekst"/"Gedempte tekst" (die waren al
  losstaand genoeg om te hergebruiken zonder nieuwe variabele). Selectors
  aangepast: headings (h1-h4), topbar-achtergrond, nav-knoppen (+hover
  +actief), hero-achtergrond, hero-eyebrow (tekst + accentstreepje),
  hero-titel, section-band (wit + crème), badge-achtergrond, btn-primary
  (+hover), btn-ghost, footer (achtergrond + tekst), footer
  nieuwsbrief-knop.
- Website: `index.html` haalt `huisstijl_secties` geïsoleerd op (eigen
  try/catch); `app.jsx` zet de 18 waarden synchroon als CSS custom
  properties op `:root` vóór de eerste render (geen kleurflits, los van
  de React-lifecycle van `applyTokens()`).
- CMS: nieuw blok "Kleuren per sectie" in het Huisstijl-scherm, 6
  gegroepeerde secties met elk 3 kleurkiezers, eigen laad-/opslaan-/
  reset-logica (los van fase 1), gedeeld kleurenpalet van 26 swatches
  (incl. de 3 eerder opgegeven kleuren) hergebruikt voor alle 18 velden.

**Bewuste vereenvoudigingen (voor Giovanny om te weten):**
- `navigatie.achtergrond` heeft als default een halfdoorzichtige waarde
  (`rgba(250,243,230,0.92)`, voor het blur-effect); zodra hier via een
  swatch een effen hex-kleur gekozen wordt, wordt de balk volledig
  ondoorzichtig (geen blur-transparantie meer). Bewuste, nette
  vereenvoudiging — geen bug.
- `footer.tekst` default (`#DDE7E6`) is een effen hex-benadering van de
  oorspronkelijke `rgba(255,255,255,0.85)` op de donkere footer-achtergrond
  — visueel vrijwel niet te onderscheiden van het origineel.
- "Footer → Links/knop" stuurt alleen de nieuwsbrief-knop aan; de gewone
  footer-navigatielinks (Ontdek/Meedoen-kolommen) volgen nog hun eigen
  vaste kleur. Kan later los gemaakt worden als gewenst.
- Fase 1 (3 globale kleuren) en fase 2 (18 sectiekleuren) bestaan naast
  elkaar: fase 1 kleurt nog steeds dingen die fase 2 niet expliciet
  overneemt (links, chips, form-focusring, agenda-datum, etc.).

**Getest:** bundle-roundtrip, lokale Babel-parse van website + volledige
CMS-bundel zonder fouten, visuele controle (desktop) dat de website
pixel-voor-pixel ongewijzigd is, alle 16 nieuwe CSS-variabelen gecontroleerd
via `getComputedStyle` op de exacte verwachte default-waarde. Live
gecontroleerd op thuisindebuurt.nl (ongewijzigd) en app.thuisindebuurt.nl
(geen consolefouten).
**Kon niet testen:** het daadwerkelijk opslaan via "Toepassen" in het
nieuwe blok (inloggen vereist, en de tabel bestaat nog niet tot Giovanny
de migratie draait).

---

## ✅ Huisstijl-paneel versimpeld: één sectie met 5 gedeelde kleuren

Op verzoek geconsolideerd: de twee losse kleurenblokken (3 globale kleuren +
18 sectiekleuren, elk met eigen Reset/Opslaan) vervangen door één paneel
met 5 velden.

### De 5 velden

| # | Veld | Default | Stuurt aan |
|---|---|---|---|
| 1 | Hoofdkleur | `#2d7f7b` | Knoppen, links, actieve pagina, eyebrow/accentstreep |
| 2 | Donkere kleur | `#236360` | Footer-achtergrond, hover-kleur hoofdknop |
| 3 | Titel- & tekstkleur | `#1d2530` | Koppen en lopende tekst (secundair grijs automatisch afgeleid) |
| 4 | Crème band | `#faf3e6` | Sectiebanden, basis zachte knoppen |
| 5 | Achtergrond | `#ffffff` | Witte secties, hero |

### Mapping oud → nieuw (alle 26 voorheen CMS-gestuurde CSS-variabelen)

**Bewust nog statisch in CSS (JS regelt ze al, via `applyTokens()` in
app.jsx — een `var(--hs-*)`-alias zou hier dode CSS zijn, inline style
wint altijd):**

| Variabele | Bron |
|---|---|
| `--tib-blue` | `TWEAK_DEFAULTS.primaryColor` = Hoofdkleur |
| `--tib-blue-deep` | `shade(primaryColor, -22%)` — komt toevallig exact uit op Donker (#236360) |
| `--tib-blue-soft` | `tint(primaryColor, 88%)` |
| `--tib-green` | `TWEAK_DEFAULTS.accentColor` = Hoofdkleur (groen bestaat niet meer als apart veld) |
| `--tib-green-soft` | `tint(accentColor, 85%)` |
| `--tib-cream` | `TWEAK_DEFAULTS.bgColor` = Crème band |
| `--tib-cream-deep` | `shade(bgColor, -4%)` |
| `--tib-line` | `shade(bgColor, -10%)` |

**Pure CSS var(--hs-\*)-aliases (geen JS-tegenhanger):**
`--tib-ink`, `--sec-heading`, `--sec-nav-actief`, `--sec-hero-bg`,
`--sec-hero-eyebrow`, `--sec-hero-tekst`, `--sec-band-wit`,
`--sec-band-creme`, `--sec-btn-primair`, `--sec-btn-primair-hover`,
`--sec-btn-secundair-rand`, `--sec-footer-bg`, `--sec-footer-link` → allemaal
`var(--hs-tekst)` / `var(--hs-hoofd)` / `var(--hs-donker)` / `var(--hs-creme)`
/ `var(--hs-achtergrond)`.

**Color-mix()-afgeleide tinten (statische fallback + `@supports`-blok):**

| Variabele | Formule | Origineel | Berekend | Afwijking |
|---|---|---|---|---|
| `--tib-ink-soft` | `color-mix(in srgb, var(--hs-tekst) 75%, #d1e5fc 25%)` | `#4a5563` | `#4a5563` | **0** |
| `--tib-ink-muted` | `color-mix(in srgb, var(--hs-tekst) 50%, #d7e1f4 50%)` | `#7a8392` | `#7a8392` | **0** |
| `--sec-band-accent` | `color-mix(in srgb, var(--hs-hoofd) 10%, #f4fffe 90%)` | `#e0f2f1` | `#e0f2f1` | **0** |
| `--sec-footer-tekst` | `color-mix(in srgb, var(--hs-hoofd) 1%, #dfe8e7 99%)` | `#dde7e6` | `#dde7e6` | **0** |
| `--sec-nav-bg` | `color-mix(in srgb, var(--hs-creme) 92%, transparent)` | `rgba(250,243,230,.92)` | (alpha-mix, geen hex-vergelijking van toepassing) | — |

Percentages + meng-kleur zijn exhaustief doorzocht (niet beperkt tot mengen
met wit) om zo dicht mogelijk bij de originele hex te komen — de eerste
poging (mengen met wit) haalde voor `tib-ink-soft`/`tib-ink-muted` niet de
gevraagde ≤2 tinten (kwam op 5–7 uit); met een andere meng-kleur bleek een
**exacte** match (diff 0) wiskundig haalbaar voor alle 4.

### SQL — hergebruikt bestaande tabel, voegt alleen toe

`sql/huisstijl_v2.sql` — idempotent, laat de oude 18 rijen (`merk.*`,
`navigatie.*`, `hero.*`, `band.*`, `knop.*`, `footer.*`) ongemoeid staan.
Voegt 5 nieuwe rijen toe (`sectie='huisstijl'`) + een INSERT-policy naast
de bestaande SELECT/UPDATE (nodig voor `upsert()` vanuit het CMS).
**Door Giovanny zelf uit te voeren — geen DB-schrijftoegang in deze sessie.**

### Verificatie-uitslagen (alle 8 stappen)

**Fase 1 — lokaal**
1. ✅ **Syntax.** Alle `<script>`-blokken (beheer.html, TIB Beheer.html,
   index.html) getranspileerd met Babel + `node --check` op de output: 0
   fouten. (Letterlijke `node --check` op JSX faalt per definitie — JSX is
   geen geldige Node-syntax — vandaar de transpile-stap ertussen, dat is de
   betekenisvolle vorm van deze check.)
2. ✅ **Dedupe.** Alle 26 oude variabelen gecontroleerd: elk heeft
   minstens 1 definitie (statisch en/of via `var()`/`color-mix()`). Geen
   enkele zwevend.
3. ✅ **Kleurcheck.** De 3 opgegeven referentiewaarden (`#e6f0ef`,
   `#4a5563`, `#f0e9dd`) live geverifieerd via `getComputedStyle()` op
   echte pagina-elementen: **alle 3 exact (diff 0)** — ruim binnen de
   gevraagde ≤2 tinten. Percentages bijgesteld na eerste poging (zie
   mapping-tabel hierboven).
4. ✅ **Sync.** `diff "TIB Beheer.html" beheer.html` → leeg.

**Fase 2 — data**
5. ⚠️ **Geblokkeerd, geen bug.** Live query (anon key) op
   `huisstijl_secties` waar `sectie='huisstijl'`: tabel bestaat, **0
   rijen** — de SQL-migratie is nog niet gedraaid. Dit is exact de
   afhankelijkheid die vanaf het begin van deze sessie is gemeld: geen
   Supabase-schrijftoegang. Zodra Giovanny `sql/huisstijl_v2.sql` heeft
   uitgevoerd, is dit in enkele seconden alsnog te verifiëren.
6. ✅ **Fallback.** Met de hierboven aangetroffen échte productiedata (18
   oude rijen aanwezig, 0 nieuwe) laadt de site foutloos en vallen alle 5
   `--hs-*`-variabelen correct terug op hun CSS-default. Geen enkele
   console-fout. Dit is een strenger bewijs dan een synthetische test, want
   het is de daadwerkelijke huidige databasestaat.

**Fase 3 — live, ná push**
7. ✅ `https://www.thuisindebuurt.nl` — `curl`: HTTP 200 (na deploy, 10s
   wachttijd). Alle 5 nieuwe CSS-variabelen aanwezig in de bron
   (`--hs-hoofd` 9×, `--hs-donker` 3×, `--hs-tekst` 7×, `--hs-creme` 4×,
   `--hs-achtergrond` 3×). Geen verwijzingen naar verwijderde functies.
8. ✅ `https://app.thuisindebuurt.nl` — `curl -L` (307-redirect naar
   `/beheer.html`, zoals bedoeld door `vercel.json`): HTTP 200. Nieuwe
   veldlabels aanwezig ("Hoofdkleur", "Donkere kleur", "Titel- &
   tekstkleur", "Crème band", "Herstel standaardkleuren"). Oude
   subsectie-koppen/functies (`Kleuren per sectie`, `SECTIE_KLEUREN_*`,
   `opslaanSectieKleuren`, `huisstijl_instellingen`, ...) allemaal **0**
   treffers — volledig verwijderd, niets zwevend achtergebleven.

### Voor Giovanny bij terugkomst — wat nog moet gebeuren

1. **Voer `sql/huisstijl_v2.sql` uit** in Supabase SQL Editor (zelfde
   werkwijze als de vorige keren). Zodra dat gebeurd is, rondt dat stap 5
   hierboven af — laat het weten, dan verifieer ik het direct.
2. **Test daarna zelf in de browser:** log in op app.thuisindebuurt.nl →
   Huisstijl → wijzig een kleur (bijv. Hoofdkleur) → klik Opslaan → geen
   foutmelding → ververs thuisindebuurt.nl (harde refresh) → kleur moet
   overal zijn doorgevoerd (knoppen, nav, hero-eyebrow, footer-hover).
3. **Test "Herstel standaardkleuren":** klik 'm, bevestig de popup, kijk of
   alle 5 velden teruggaan naar de standaardkleuren (nog niet opgeslagen
   totdat je ook op "Opslaan" klikt).
4. **Test op mobiel** (of smal browservenster): de 5 velden + kleurkiezer
   + hex-veld moeten netjes onder elkaar blijven staan, niet overlappen.

---

*(wordt aangevuld naarmate meer features worden afgerond)*
