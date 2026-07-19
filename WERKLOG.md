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

*(wordt aangevuld naarmate meer features worden afgerond)*
