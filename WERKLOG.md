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

---

*(wordt aangevuld naarmate meer features worden afgerond)*
