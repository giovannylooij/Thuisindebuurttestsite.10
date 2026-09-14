# To-do & stand van zaken — Thuis in de Buurt

*Bijgewerkt: 13 september 2026 (opmerkingen deel 2 toegevoegd)*

## Samenvatting

De website en het CMS draaien live en zijn stabiel. In de afgelopen periode zijn
vooral **structurele problemen** opgelost die niet zichtbaar waren maar wel echt
kapot: het domein zonder www werkte niet, CMS-wijzigingen aan het menu bereikten
de website nooit, en de site crashte op onbekende categoriewaarden.

Daarnaast liggen er nu **drie rapporten** klaar met uitgezocht werk:
opleverpunten, snelheid en Margareth's feedback (deel 1).

Van Margareth's feedback (deel 1) zijn alle **tekstwijzigingen en het dubbele
icoontje inmiddels live**. Wat overblijft zijn de zwaardere punten: de velden in
het CMS die aan elkaar vastzitten, en het categorieblok.

De nieuwe categorielijst staat live, alle 19 items zijn eraan gekoppeld, en
het CMS is zo aangepast dat die rommel niet meer kan terugkomen (hernoemen
loopt mee, verwijderen wordt geblokkeerd zolang een categorie in gebruik is).

**Wat nu het meest urgent is:**
1. B4 afmaken (keuze A of B + SQL-migratie) en daarna B3.
2. Rechten-audit database — het gaat om persoonsgegevens.
3. Een besluit over iDEAL (wacht al op een Mollie-account).

**Rode draad in de gevonden problemen:** op meerdere plekken bewaart het CMS
gegevens alleen in de browser (`localStorage`), waardoor wijzigingen de live
website nooit bereiken. Voor het navigatiemenu is dit opgelost door het naar
Supabase te verhuizen. Voor de contactgegevens en pagina-teksten speelt hetzelfde
probleem nog.

---

## ✅ Afgerond

- [x] Detailpagina toont nu de naam ("Over Happy Feet" i.p.v. "Over deze clubje")
- [x] Pagina-toggles in het CMS werken en bereiken nu écht de website
      *(nieuwe Supabase-tabel `site_navigatie`)*
- [x] Agenda en Buurtatlas verborgen in het CMS-menu *(website onaangetast)*
- [x] Domein `thuisindebuurt.nl` zonder www werkt weer *(nameservers naar Hostnet)*
- [x] E-mailadressen: alles naar `info@thuisindebuurt.nl`, `webredactie@` verwijderd
- [x] Hotfix: site crashte op onbekende categoriewaarden
- [x] Rapport opleverpunten, snelheidsrapport, rapport Margareth deel 1 (+ PDF)

---

## 📋 Margareth's opmerkingen deel 1

> Volledige uitwerking met code-locaties staat in `PLAN-OPMERKINGEN-DEEL1.md` (+ PDF).

### Tekstwijzigingen — snel af te ronden
- [x] A1. Intro-tekst Buurtinitiatieven-pagina — **live**
- [x] A2. Detailpagina: verwijst nu naar het aanmeldformulier — **live**
      *(laatste zin schakelt mee als de Contact-tab uitstaat)*
- [x] A3. Bevestigingstekst vervangen — **live**
      ⚠️ *de tekst belooft een bevestigingsmail die nog steeds niet verstuurd wordt*
- [x] A4. "Meld jouw buurtinitiatief aan" — **live** (kop én knop)
- [x] Plusje weg van de knop "Meld jouw buurtinitiatief aan" — **live**

### Velden opschonen
- [x] B1. Veld "Categorie" weg uit het publieke aanmeldformulier — **live**
      *(naamveld meteen over de volle breedte gezet)*
- [x] B2. Veld "WhatsApp" weg uit het CMS — **live** *(was een lege huls die niets opsloeg)*
- [ ] B3. "Wat" loskoppelen van "Categorie" *(zijn nu letterlijk hetzelfde veld)*
      — vraagt een nieuwe kolom in de database
- [ ] B4. "Uitgebreide omschrijving" een écht vrij tekstveld maken
      **→ uitgewerkt, wacht op keuze A of B (tonen op de site of alleen opslaan)
      en op een SQL-migratie die Giovanny draait.** Zie het actieplan.

### Bugs
- [x] C1. Dubbel icoontje op de kaartjes — **live**
      *(alleen bij buurtinitiatieven weggehaald; bij activiteiten is dit het
      enige icoon, dus daar blijft het staan)*
- [x] C2. Vrij typen van een categorie verwijderd — **live**
      *(nieuwe categorieën maak je in het Categorieën-scherm; zo is 'Festival'
      destijds ontstaan)*
- [x] C3. Hernoemen loopt nu mee naar buurtinitiatieven én activiteiten;
      verwijderen wordt geblokkeerd zolang een categorie in gebruik is — **live**
      *(hiermee kan de categorie-rommel niet meer terugkomen)*
- [x] Meegefikst: filterknoppen in het CMS stonden vast op de oude categorieën,
      en nieuwe items kregen standaard het niet meer bestaande 'Sociaal'

### Overig
- [x] D. Nieuwe categorielijst doorgevoerd (7 categorieën) — **live**
      *(Eten · Ontmoeting/Sociaal · Sport en Bewegen · Spel · Lezen, Schrijven
      en Vertellen · Kunst en Cultuur · Evenement/Festival)*
- [x] Kapotte categoriewaarden opgeschoond — **live**
      *(alle 19 items zijn in dezelfde migratie aan een nieuwe categorie
      gekoppeld; niets staat meer los van de lijst)*
- [ ] E. Teksten zelf beheerbaar maken voor Margareth *(grotere klus)*
- [ ] Gesprek over ontbrekende icoontjes — *ik lever vooraf een overzicht van
      alle beschikbare iconen aan*

---

## 📋 Margareth's opmerkingen deel 2 *(13 september 2026, nog niet uitgevoerd)*

### F1. Categoriefilter op Buurtinitiatieven moet werken zoals bij de Buurtatlas
**Probleem:** klik je nu op bijv. "Spel", dan verdwijnt Spel juist en blijft de
rest staan. Dat komt doordat de knop een categorie *aan/uit zet*, terwijl alles
standaard al aan staat. Je zou alleen "Spel" willen zien.

**Gewenst gedrag (net als de Buurtatlas):**
- Klik op een categorie → alleen die categorie is zichtbaar, de rest verdwijnt.
- Klik op een andere categorie → die wordt de enige.
- Klik nog eens op dezelfde categorie → weer alles zichtbaar.
- "Alle categorieën" → alles zichtbaar.

**Status: live (13-09, commit `f30efbb`), lokaal én live getest.**
- [x] `bundle-src/clubjes.jsx`: functie `toggle` gebruikt nu dezelfde logica als
      `buurtatlas.jsx`.
- [x] Groene "actief"-markering staat alleen op de ene gekozen categorie.
- [x] Dubbelklik-functie (`onDoubleClick` / `only`) weggehaald.
- [x] Tip-tekst aangepast: *"klik op een categorie om alleen die te tonen. Klik
      er nog eens op om weer alles te zien. Klik op een stip in de kaart voor
      meer info."*
- [x] Meegenomen: melding bij 0 resultaten aangepast naar *"Geen
      buurtinitiatieven in deze categorie. Kies een andere categorie of meld een
      nieuw buurtinitiatief aan."* (de oude tekst ging nog uit van meerdere
      categorieën tegelijk)
- [x] Getest, lokaal met live data:
      - start: 9 kaartjes, 7 stippen
      - Spel: 1 kaartje, 1 stip
      - Spel nog eens: weer 9 kaartjes, 7 stippen
      - Spel en dan Eten: alleen Eten, 2 kaartjes
      - Kunst en Cultuur: 0 kaartjes, melding zichtbaar
      - Alle categorieën: weer 9 kaartjes
      - Eten in lijstweergave: 2 kaartjes
      - geen consolefouten
- [x] Gepusht en live gecontroleerd. De live `index.html` is identiek aan
      lokaal, alle scenario's hierboven geven live dezelfde uitkomst en er zijn
      geen consolefouten.
- *Bijvangst, niet opgelost:* 2 van de 9 buurtinitiatieven hebben geen stip op
  de kaart, waarschijnlijk omdat er geen coördinaten zijn ingevuld.

### F2. Introtekst onder "Vind jouw buurtinitiatief in de buurt" breder
**Probleem:** de twee alinea's staan in een smalle kolom (ongeveer de helft van
de breedte van de kop), waardoor ze lang en smal onder elkaar staan.

**Oorzaak:** in de opmaak staat een maximale breedte van 60 tekens voor
introteksten (`bundle-src/template.html` regel 1993: `.page-head p { max-width: 60ch }`).
Die regel geldt voor **alle 13 pagina's** met zo'n kop, niet alleen deze.

**Besluit Giovanny:** alleen de introtekst op de Buurtinitiatieven-pagina.

**Status: live (13-09, commit `9b402ac`), lokaal én live getest.**
- [x] Beide alinea's in `bundle-src/clubjes.jsx` hebben `maxWidth: "80ch"`.
      De algemene regel `.page-head p { max-width: 60ch }` in `template.html`
      is **niet** aangepast, dus andere pagina's blijven gelijk.
- [x] Getest op desktop (1440px):
      - Buurtinitiatieven: alinea's 583 → 777px breed, 4 → 3 regels per
        alinea (de kop is 933px breed)
      - Activiteiten, Buurtatlas en Partners: ongewijzigd, 583px
- [x] Getest op mobiel (375px): tekst vult de volle breedte (339px), geen
      horizontaal scrollen.
- [x] Geen consolefouten.
- [x] Gepusht en live gecontroleerd op 1440px: Buurtinitiatieven 777px en
      3 regels, Activiteiten, Buurtatlas en Partners ongewijzigd 583px, geen
      consolefouten.

**Vervolg (13-09): Giovanny wil het nog breder → 90ch.**
*Live (commit `e98edeb`), lokaal én live getest.*
- [x] Beide alinea's `maxWidth: "80ch"` → `"90ch"` in `bundle-src/clubjes.jsx`.
- [x] Getest op desktop (1440px):
      - Buurtinitiatieven: 777 → 874px, eerste alinea 3 regels, tweede 2 regels
        (de kop is 933px breed)
      - Activiteiten en Buurtatlas: ongewijzigd, 583px
- [x] Getest op mobiel (375px): volle breedte (339px), geen horizontaal
      scrollen.
- [x] Gepusht en live gecontroleerd (1440px): Buurtinitiatieven 874px (3 en
      2 regels), Activiteiten en Buurtatlas ongewijzigd 583px, geen
      consolefouten.

### F3. Naam en e-mail overal verplicht in aanmeldformulieren
**Wens:** in elk formulier moet je je naam én een geldig e-mailadres invullen.
Doe je dat niet, dan kun je niet verzenden. Overal dezelfde controle en dezelfde
foutmelding.

**Wat ik in de code zag** *(live draait dezelfde code als `bundle-src`, gecontroleerd):*

| Formulier | Waar | Naam verplicht? | E-mail verplicht? | Probleem |
|---|---|---|---|---|
| Buurtinitiatief aanmelden | `clubjes.jsx` ~r.197 | ja ("Contactpersoon") | **nee** | Het veld heet "E-mail of telefoon" en accepteert alles, ook "x". Er is geen echt e-mailveld. |
| Aanmelden bij activiteit/initiatief | `detail.jsx` ~r.67 | ja | half | De controle kijkt alleen of er een @ in staat, dus "a@" gaat erdoor. |
| Doe mee (3 tabbladen) | `other.jsx` ~r.721 | ja | ja | Alleen spaties als naam gaat erdoor. |
| Contact | `contact.jsx` ~r.78 | ja | ja | Alleen spaties gaat erdoor. |
| Boek bestellen | `boek.jsx` ~r.114 | ja | ja | Alleen spaties gaat erdoor. |
| "Bestaat dit nog?"-melding | `ui.jsx` ~r.370 | geen naamveld | nee (optioneel) | Zie keuze hieronder. |
| Nieuwsbrief (footer) | `ui.jsx` ~r.240 | geen naamveld | ja | Slaat het adres nergens op, toont alleen "Bedankt". |

Bijkomend: het buurtinitiatief-, contact- én boekformulier tonen ook "Bedankt"
als het opslaan mislukt. De bezoeker denkt dan dat het gelukt is, maar er komt
niets binnen. *(Oorzaak: de code verwacht een foutmelding via `try/catch`,
maar Supabase geeft een fout terug in plaats van hem te "gooien". De fout wordt
dus nooit gezien. "Doe mee", de aanmelding bij een activiteit en de melding
controleren dit wel goed.)*

Verder gecontroleerd: bezoekers kunnen de ingestuurde gegevens niet uitlezen.
Bij een test met de publieke sleutel gaven `buurtgroep_aanvragen`,
`aanmeldingen`, `contact_berichten`, `boek_bestellingen` en `meldingen` niets
terug. Of `buurtgroep_aanvragen` al een aparte telefoonkolom heeft, kon ik
daardoor niet zien. In het CMS toont het scherm met aanvragen nu één veld
"Contact" (`beheer.html` ~r.5655).

**Besluiten Giovanny (13-09), alle voorstellen akkoord:**
- Doen mee: Buurtinitiatief aanmelden, Aanmelden bij activiteit/initiatief,
  Doe mee (3 tabbladen), Contact, Boek bestellen.
- Doen niet mee: "Bestaat dit nog?"-melding (blijft anoniem) en nieuwsbrief
  (blijft alleen e-mail; dat hij niets opslaat staat apart onder Techniek).
- Buurtinitiatief: "E-mail of telefoon" wordt **E-mailadres \*** + **Telefoon**
  (optioneel). "Naam contactpersoon \*" is de verplichte naam.
- Foutmelding: eigen rode melding onder het veld, niet het browser-pop-upje.

**Status: live (13-09, commit `99a3cdb`), lokaal én live getest.**
SQL `sql/buurtgroep_aanvragen_telefoon.sql` is door Giovanny gedraaid. Via de
API is gecontroleerd dat de kolom `telefoon` nu bestaat.

- [x] Gedeelde controle in `bundle-src/ui.jsx`:
      - `tibControleer` haalt spaties weg, checkt verplichte velden en
        e-mailpatroon `naam@domein.xx`
      - `tibOpslaan` vangt mislukte opslag écht af
      - `VeldFout` en `VerplichtUitleg` zorgen voor dezelfde melding en uitleg
        overal
- [x] Opmaak in `template.html`: rode tekst `.veld-fout` en rode rand bij
      `aria-invalid`. Cursor springt naar het eerste veld met een fout.
- [x] Contact, Boek, Doe mee, Buurtinitiatief en Aanmelden bij activiteit
      omgebouwd:
      - sterretjes bij verplichte velden en "Velden met * zijn verplicht."
      - ingevulde waarden worden zonder spaties opgeslagen
- [x] Bij mislukte opslag overal dezelfde tekst: *"Versturen is niet gelukt.
      Probeer het later opnieuw of mail naar info@thuisindebuurt.nl."*
      Geen "Bedankt" meer, en het formulier blijft ingevuld staan.
      (Doe mee liet eerst de technische foutmelding aan bezoekers zien; ook
      aangepast.)
- [x] Buurtinitiatief-formulier: e-mail en telefoon apart.
      `email_of_telefoon` bevat voortaan altijd het e-mailadres, `telefoon` is
      nieuw.
- [x] CMS (`beheer.html`) scherm aanvragen: toont "E-mail" en "Telefoon".
      Oudere aanvragen zonder @ blijven "Contact" heten.
      *Niet getest: daarvoor moet ik inloggen.*
- [x] SQL klaargezet: `sql/buurtgroep_aanvragen_telefoon.sql` (veilig, voegt
      alleen een lege kolom toe).
- [x] Lokaal getest met onderschepte opslag, er is niets naar de database
      gestuurd. Per formulier:
      - leeg: alle verplichte velden rood met eigen melding, cursor op het
        eerste foutveld, niets verstuurd
      - alleen spaties, "a@", "a@b", "naam@domein" en een telefoonnummer als
        e-mail: geweigerd
      - na typen verdwijnt de melding van dat veld
      - nagebootste opslagfout: foutmelding, geen "Bedankt", formulier blijft
        staan
      - geldig: precies 1 keer verstuurd, waarden zonder spaties, "Bedankt"
        zichtbaar
      - Doe mee per tabblad het juiste aantal verplichte velden: TIBber 2,
        Activiteit 5, Partner 4. Meldingen verdwijnen bij wisselen van tabblad.
      - geen React-waarschuwingen (een rand-waarschuwing bij Aanmelden is
        gevonden en opgelost)
- [x] Giovanny: SQL gedraaid in Supabase. Kolom `telefoon` bevestigd via de API.
- [x] Gepusht en live gecontroleerd, met onderschepte opslag zodat er niets in
      de database is gekomen:
      - live `index.html` en `beheer.html` zijn identiek aan lokaal
      - buurtinitiatief-formulier: nieuwe labels, 3 meldingen bij leeg,
        foutmelding bij nagebootste opslagfout, en bij geldig de juiste rij met
        `telefoon` apart
      - contact: spaties en "a@" geweigerd
      - CMS laadt zonder consolefouten tot het inlogscherm
- [ ] Nog open: één echte testaanmelding (alleen met akkoord van Giovanny),
      daarna het CMS-scherm aanvragen bekijken na inloggen en het testrecord
      verwijderen.

### F4. Gekleurde bolletjes in de categorieknoppen beter zichtbaar
**Probleem:** de bolletjes vallen bijna weg, vooral op een geselecteerde knop
(groenblauwe achtergrond). "Sport en Bewegen" is groen op groen, en "Eten" en
"Evenement/Festival" hebben allebei hetzelfde blauw.

**Oorzaak (gevonden in de code):**
- De site gebruikt een vaste lijst van **6 gedempte kleuren** en deelt die toe
  op volgorde (`bundle-src/ui.jsx` regel 267). Er zijn nu 7 categorieën, dus
  de 7e (Evenement/Festival) krijgt weer de kleur van de 1e (Eten).
- Het groen `#3f8f7a` lijkt bijna precies op de knopkleur `#2d7f7b`.
- De bolletjes zijn klein, 10px (`template.html` regel 1988).
- De kleuren die in het CMS bij een categorie staan (kolom `kleur`) gebruikt de
  site helemaal niet. Die zijn ook dubbel: Eten en Evenement/Festival hebben
  daar allebei dezelfde oranje tint.

**Besluit Giovanny (13-09):** alleen de bolletjes **wat feller** maken en/of
een **wit randje** eromheen. **Niet groter maken**, ze blijven 10px.

**Onderbouwing (contrast, ~3:1 is de richtlijn voor goed zichtbaar):**
- Op witte knoppen hadden de oude kleuren al 3,1–6,1. Daar was het probleem
  klein.
- Op de groenblauwe knop (#2d7f7b) haalt geen enkele kleur 3:1: oud 1,0–1,5,
  feller hooguit 2,3. Een wit randje haalt 4,7.

**Besluit Giovanny (14-09): variant B, feller + wit randje.** Gekozen na een
vergelijking van nu / A / B.

**Status: live (14-09, commit `9fcbc63`), lokaal én live getest.**
- [x] `bundle-src/ui.jsx`: `_CAT_COLORS` wordt `#1a73e8 #8e44d6 #1faa59
      #f57c00 #e53935 #9c7a4a` (was `#2a6fb5 #7e4ca3 #3f8f7a #d97a2c #b94842
      #7a7363`). De reservekleuren en `CAT_FALLBACK` gebruiken dezelfde set.
- [x] `template.html`: `.cat-filter .chip.active .swatch { box-shadow: 0 0 0 2px #fff; }`.
      Een schaduw verandert de maat niet, dus het bolletje blijft 10px.
- [x] `clubjes.jsx`: de filterbalk heeft class `cat-filter`, zodat het randje
      alleen daar geldt.
- [x] Omdat de kleurenlijst gedeeld is, zijn automatisch mee feller: stippen
      op de Buurtinitiatieven-kaart, de kaart op de homepage, het bolletje op
      de detailpagina en de kleurrand van de activiteitenkaartjes.
- [x] Lokaal getest:
      - filterbolletjes in de nieuwe kleuren, allemaal 10×10px
      - wit randje alleen op de actieve knop
      - kaartstippen in de nieuwe kleuren
      - Buurtatlas: oude kleuren en geen randje
      - geen consolefouten
      - screenshots van de echte pagina met Spel en met Sport en Bewegen
        geselecteerd
- [x] Gepusht en live gecontroleerd:
      - live `index.html` is identiek aan lokaal
      - filterbolletjes in de nieuwe kleuren, 10px
      - wit randje alleen op de actieve knop (Sport en Bewegen)
      - Buurtatlas toen nog ongewijzigd (later ook aangepast, zie hieronder)
      - geen consolefouten
      - screenshot van de live filterbalk
**Uitbreiding (14-09): op verzoek van Giovanny ook bij de Buurtatlas.**
*Live (commit `d658a5d`), lokaal én live getest. Giovanny koos variant A:
zo online, labeltekst niet donkerder gemaakt.*
- [x] `bundle-src/buurtatlas.jsx`: `ATLAS_CATEGORIES` krijgt dezelfde fellere
      tinten:
      - Voorzieningen #8e44d6 (was #7e4ca3)
      - Bewonersinitiatief #e53935 (was #b94842)
      - Partners #1a73e8 (was #2a6fb5)
      - Activiteiten #1faa59 (was #3f8f7a)
- [x] Filterbalk krijgt class `cat-filter`, zodat het bestaande witte randje ook
      daar werkt.
- [x] Deze kleuren komen ook terug in de kaartstippen, de pins in de lijst en
      de tekstkleur van de categorielabels in de lijst.
- [x] Lokaal getest:
      - bolletjes 10px in de nieuwe kleuren
      - wit randje alleen op de actieve knop (Partners)
      - kaart, pins en labels in de nieuwe kleuren
      - filter Partners toont 4 plekken
      - Buurtinitiatieven nog goed
      - geen consolefouten
- ⚠️ Nadeel: de labeltekst in de lijst op wit wordt iets minder goed leesbaar.
  Voor gewone tekst is de richtlijn 4,5:
  - Voorzieningen 6,1 → 5,3
  - Bewonersinitiatief 5,2 → 4,2
  - Partners 5,2 → 4,5
  - Activiteiten 3,9 → 3,0 (was al onder 4,5)

  Mogelijke oplossing, nog niet gedaan: de labeltekst een donkerdere tint
  geven en alleen de bolletjes/stippen fel houden.
- [x] Gepusht en live gecontroleerd:
      - live `index.html` is identiek aan lokaal
      - bolletjes 10px in de nieuwe kleuren
      - kaartstippen in de nieuwe kleuren
      - wit randje alleen op de actieve knop (Activiteiten, 10 plekken)
      - geen consolefouten
      - screenshot van de live filterbalk

- Niet in dit punt, alleen genoteerd: Eten en Evenement/Festival hebben nog
  steeds dezelfde kleur (6 kleuren voor 7 categorieën), en de kleuren uit het
  CMS worden nog niet gebruikt.

### F5. Invoerscherm Activiteit precies gelijk maken aan Buurtinitiatief (CMS)
**Wens:** het bewerkscherm van een activiteit in het CMS krijgt exact dezelfde
opbouw en velden als het bewerkscherm van een buurtinitiatief.
*(De foto's kwamen niet mee met het bericht. Uitgewerkt op basis van de code:
`beheer.html` → `ClubjeEdit` ~r.1902 en `ActiviteitEdit` ~r.2198.)*

**Verschil nu:**

| Onderdeel | Buurtinitiatief | Activiteit |
|---|---|---|
| Naam, Categorie | ✅ | ✅ |
| Wijk / gebied | ✅ | ❌ |
| Korte omschrijving | ✅ | ❌ |
| Uitgebreide omschrijving | ✅ *(nep-veld, zie B4)* | ❌ |
| Praktische informatie (Voor wie / Wat / Waar / Wanneer / Kosten) | ✅ eigen blok | alleen Wanneer, Locatie en Kosten, in Basisgegevens |
| Contact: "Contact weergeven op website" + Telefoon | ✅ | ❌ (alleen Contactpersoon en E-mail) |
| Locatie op de Buurtatlas (adres + kaart) | ✅ | ✅ |
| Afbeelding (upload/URL + alt-tekst) | ✅ | ❌ |
| Icoon kiezen | ✅ | ❌ |
| SEO & vindbaarheid | ✅ *(slaat niets op)* | ❌ |
| Zijbalk: Publicatie + "Opslaan als concept" | ✅ | eenvoudiger |
| Zijbalk: Uitlichten op homepagina | ✅ | ❌ |
| Zijbalk: Categorie & tags, Gekoppelde items | ✅ *(vaste nep-waarden)* | ❌ |
| **Type** (Ontmoeting/Beweging/…) | ❌ | ✅ alleen hier |
| **Terugkerend**-schakelaar | ❌ | ✅ alleen hier |

**Database:** de tabel `activiteiten` mist de meeste kolommen die
`clubjes` wel heeft: `wijk`, `omschrijving`, `voor_wie`, `telefoon`,
`contact_zichtbaar`, `lat`, `lng`, `foto_url`, `icoon_url`, `icoon_label`,
`uitgelicht`.
⚠️ **Nagekeken:** het activiteitenscherm heeft al adres- en kaartvelden, maar
de kolommen `adres`/`lat`/`lng` bestaan niet. De migratie ervoor staat klaar in
`sql/activiteiten_locatie.sql`, maar is **nooit gedraaid**. Gevolg: opslaan van
een activiteit mislukt zodra er een locatie is ingevuld. Die migratie meenemen
in de F5-migratie.

**Plan:**
- [ ] SQL-migratie: ontbrekende kolommen toevoegen aan `activiteiten`
      (Giovanny draait die in Supabase). Bestaande data blijft staan.
- [ ] `ActiviteitEdit` in `beheer.html` opnieuw opbouwen volgens `ClubjeEdit`:
      dezelfde secties, dezelfde volgorde, dezelfde teksten (met "activiteit"
      in plaats van "buurtinitiatief").
- [ ] Website: de detailpagina van een activiteit laat de nieuwe velden ook
      echt zien (omschrijving, Voor wie, contact-tab, foto, icoon).
      Nu blijven die leeg voor activiteiten.
- [ ] Nieuwe activiteiten krijgen dezelfde standaardwaarden als nieuwe
      buurtinitiatieven.
- [x] **Besluit Giovanny (13-09):** **Terugkerend blijft behouden**, **Type gaat eruit**.
  - [ ] Type-veld weghalen uit het invoerscherm.
  - [ ] Type-filterknoppen en de Type-kolom weghalen uit het
        activiteitenoverzicht in het CMS (`ActiviteitenScreen` ~r.2323 en
        ~r.2368). Filteren gaat voortaan op Categorie.
  - [ ] Nagaan waar de website `type` gebruikt (`other.jsx` r.168 zet het om
        naar `group`) en daar niets laten breken.
  - [ ] Kolom `type` in de database laten staan. Niet verwijderen, dan gaat er
        geen data verloren.
- [x] **Besluit Giovanny (13-09):** de nep-onderdelen gaan **bij allebei eruit**,
      zowel bij buurtinitiatief als bij activiteit.
  - [ ] Blok "SEO & vindbaarheid" weghalen (`ClubjeEdit` ~r.2124). Slaat niets op.
  - [ ] Zijkaart "Categorie & tags" weghalen (~r.2159). Vaste nep-waarden.
  - [ ] Zijkaart "Gekoppelde items" weghalen (~r.2168). Vaste nep-waarden.
  - [ ] Niet meenemen naar het nieuwe activiteitenscherm.
- [ ] **Volgorde:** eerst B3 ("Wat" los van Categorie) en B4 (echte uitgebreide
      omschrijving) doen. Anders kopiëren we die fouten mee naar activiteiten.
- [ ] Testen:
      - nieuwe activiteit aanmaken met alle velden
      - opslaan, herladen, alles staat er nog
      - zichtbaar op de website
      - bestaande activiteiten zijn niets kwijt

#### Uitwerking F5 (14-09): wat er in de code en database gevonden is
Gecontroleerd in `beheer.html`, `bundle-src/*.jsx`, de database (publieke API)
en de live site.

**Database nu:**
- `activiteiten` heeft 10 rijen en de kolommen `id, naam, type, categorie,
  wanneer, waar, kosten, contact, email, herhalend, status, aangemaakt_op`.
- Het bewerkscherm heeft al adres- en kaartvelden, maar `adres/lat/lng`
  bestaan niet. Opslaan mislukt dus zodra je een locatie invult.
- Voor B3/B4 ontbreken ook bij `clubjes` de kolommen `wat` en
  `uitgebreide_omschrijving`.

**Gevonden problemen die F5 raken:**
1. **Type wordt op de website gebruikt.**
   - De Activiteiten-pagina groepeert op Type: Ontmoeting, Beweging,
     Cultuur & leren (`other.jsx` r.319–322).
   - Het label op de detailpagina (`detail.jsx` r.162) en op de
     Agenda-kaartjes (`other.jsx` r.244) toont ook Type.
   - Type weghalen uit het CMS vraagt dus ook een aanpassing op de site.
2. **Concept-activiteiten staan gewoon live.**
   - 8 van de 10 activiteiten staan op "Concept", maar alle 10 zijn zichtbaar
     op de live Activiteiten-pagina (gecontroleerd).
   - De site filtert bij activiteiten niet op status, bij buurtinitiatieven wel.
3. **Een deel van het buurtinitiatief-scherm werkt zelf niet.** Dat zou dus
   mee gekopieerd worden:
   - **"Voor wie" wordt niet opgeslagen.** Het scherm schrijft naar
     `voor_wie`, maar de opslagfunctie leest `voorWie` (`beheer.html`
     r.6387). Slechts 1 van de 9 buurtinitiatieven heeft een waarde.
   - **Foto wordt niet opgeslagen.** Het scherm gebruikt `photo`, de opslag
     kent alleen `foto_url`. Geen enkel buurtinitiatief heeft een foto, en de
     site toont ook geen foto (`photo: null`).
   - **"Uitlichten op homepagina" doet niets.** `uitgelicht` wordt wel
     opgeslagen, maar komt nergens in de websitecode voor.
4. **B3 en B4 zijn nog niet gebouwd.**
   - "Wat" is nog steeds hetzelfde veld als Categorie.
   - "Uitgebreide omschrijving" is nog de nep-tekstverwerker.
   - B4 wacht op keuze A (tonen) of B (alleen opslaan).

**Voorstel aanpak, in één keer:**
1. **Eén SQL-migratie** (Giovanny draait die):
   - `activiteiten`: `adres, lat, lng, wijk, omschrijving,
     uitgebreide_omschrijving, voor_wie, wat, telefoon, contact_zichtbaar,
     icoon_url, icoon_label` erbij
   - `clubjes`: `wat` en `uitgebreide_omschrijving` erbij
   - Alleen kolommen toevoegen; niets verwijderen, `type` blijft staan.
2. **CMS:** één gedeeld bewerkscherm voor buurtinitiatief én activiteit.
   Daardoor zijn ze gegarandeerd gelijk en blijven ze dat. Verschil: alleen
   de schakelaar Terugkerend bij activiteiten.
   - Eigen veld "Wat" (B3).
   - Echt tekstvak "Uitgebreide omschrijving" (B4).
   - "Voor wie" wordt echt opgeslagen.
   - Weg bij allebei: Type, SEO, Categorie & tags, Gekoppelde items.
3. **Website:**
   - Activiteiten-pagina groepeert op Categorie in plaats van Type.
   - Het label toont de categorie.
   - Detailpagina van een activiteit krijgt dezelfde onderdelen als een
     buurtinitiatief: Wat, Voor wie, omschrijving, contact-tab, icoon, kaart.
4. **Testen:** lokaal met onderschepte opslag, daarna live, zoals bij F3.

**Besluiten Giovanny (14-09):**
- [x] **B4:** A, tonen op de detailpagina. Het veld heet **"Omschrijving"** en
      staat onder "Korte omschrijving". Database-kolom:
      `uitgebreide_omschrijving`.
- [x] ~~Activiteiten-pagina op Categorie~~ en ~~alleen gepubliceerde tonen~~:
      **teruggedraaid (14-09)**. Giovanny wil dat de Activiteiten-pagina op de
      website **precies blijft zoals hij is**: groepen Ontmoeting, Beweging en
      Cultuur & leren, alle 10 activiteiten zichtbaar, dezelfde kaartjes en
      labels. Welke activiteiten blijven, bepaalt hij later zelf via het CMS.
      Type is alleen uit het CMS-scherm weg; de kolom blijft bestaan en bepaalt
      de groep op de site. Nieuwe activiteiten komen in "Ontmoeting".
- [x] **Foto en Uitlichten:** weghalen bij allebei.

**Status (14-09): gebouwd en lokaal getest, NIET gepusht.**
- [x] SQL `sql/f5_activiteit_gelijk_aan_buurtinitiatief.sql` gedraaid door
      Giovanny (14-09). Alle nieuwe kolommen bestaan, gecontroleerd via de API.
- [x] Besluit: Giovanny kiest later zelf via het CMS welke activiteiten blijven.
      De website filtert **niet** op status; alle activiteiten blijven zichtbaar
      zoals nu.
- [x] Na de split opnieuw getest (onderschepte opslag):
      - zelfde secties en zijkaarten
      - labels verschillen alleen in "de activiteit" / "het buurtinitiatief"
      - Terugkerend alleen bij activiteit
      - opslaan stuurt `wat`, `uitgebreide_omschrijving` en `voor_wie` mee
      - nieuwe activiteit zonder id
      - geen consolefouten

**CMS (`beheer.html`):**
- [x] **Twee aparte schermen** (op verzoek van Giovanny, geen gedeeld scherm):
      `ClubjeEdit` en `ActiviteitEdit` hebben exact dezelfde opbouw. Alleen
      activiteit heeft de schakelaar Terugkerend. In de code staat bij beide
      een notitie: wijzig je er één, doe dat bij de ander ook.
      - Secties: Basisgegevens, Praktische informatie, Contact, Locatie, Icoon.
      - Zijkaarten: Publicatie, Hulp.
      - "Wat" (B3) en "Omschrijving" (B4) zijn echte velden.
      - Terugkerend alleen bij activiteit.
      - Weg: Type, Afbeelding, Uitlichten, SEO, Categorie & tags, Gekoppelde
        items, en de nep-tekstverwerker.
- [x] Opslaan:
      - "Voor wie" wordt nu echt opgeslagen (de bug met `voorWie`).
      - Nieuwe vertaling `__mapActiviteitenToDb`.
      - `__supabaseUpsert` meldt nu of het gelukt is; alleen dan verschijnt
        "opgeslagen".
      - Nieuwe buurtinitiatieven krijgen hun id van de database (was een zelf
        verzonnen id).
      - Geen nep-coördinaten meer voor nieuwe items.
- [x] Activiteitenoverzicht: kolom en filterknoppen voor Type weg, filteren op
      categorie. In de lijst met buurtinitiatieven is de ster voor "uitgelicht"
      weg.

**Website (`bundle-src`):**
- [x] `ui.jsx`: gedeelde `tibMapActiviteit`.
      - Alle activiteiten, groep = Type, zelfde standaardlocatie als voorheen
        als er geen eigen locatie is.
      - Leest de nieuwe velden ("Wat", "Omschrijving", "Voor wie", telefoon,
        contact-tab). "Voor wie" van buurtinitiatieven leest nu `voor_wie`.
- [x] **Activiteiten-pagina: ongewijzigd** (groepen, intro, kaartjes en labels
      zijn precies zoals voorheen).
- [x] Detailpagina:
      - contact-tab en aansluittekst ook bij activiteiten
      - "Omschrijving" onder de korte omschrijving
      - knop "Alle ..." gaat naar de juiste lijst
      - label blijft Type
- [x] Agenda: zelfde lijst als voorheen, label blijft Type.

**Lokaal getest** (onderschepte opslag, niets naar de database):
- [x] Website na het terugdraaien, lokaal naast live vergeleken (14-09):
      - Activiteiten-pagina **identiek**: dezelfde intro, groepen Ontmoeting
        (4), Beweging (3) en Cultuur & leren (3), dezelfde kaartjes met tijd,
        "via" en icoon
      - homepage "10 terugkerende activiteiten", zelfde als live
      - Agenda: dezelfde lijst en labels (Type)
      - label op de detailpagina (Type) is gelijk
      - Buurtatlas "Activiteiten · 10", zelfde als live bij direct openen
        (live zakte na een bezoek aan de Agenda naar 0 door de oude code; nu
        blijft het 10)
      - enige verschil: de rij "Wat" op de detailpagina (B3, zie hieronder)
      - geen consolefouten
- [x] CMS:
      - scherm activiteit en buurtinitiatief hebben identieke secties en
        velden; alleen Terugkerend is extra
      - opslaan stuurt `voor_wie`, `wat`, `uitgebreide_omschrijving` en
        `telefoon` echt mee
      - lijst zonder Type, filter Sport en Bewegen toont 3
      - nieuwe activiteit wordt ingevoegd zonder id, daarna verschijnt de
        Verwijderen-knop
      - geen consolefouten
- [ ] Na SQL + publiceren: pushen, live controleren, en een echte opslag in het
      CMS doen (inloggen door Giovanny).

**Zichtbare gevolgen na de push:**
- Activiteiten-pagina, Agenda en Buurtatlas: geen verschil.
- Detailpagina's: de rij "Wat" toont voortaan het eigen veld "Wat" (B3). Tot dat
  in het CMS is ingevuld verdwijnt die rij. Bij buurtinitiatieven stond daar de
  categorie, bij activiteiten het Type.

**Na uitvoering:** bundelen, pushen en live controleren op
www.thuisindebuurt.nl en app.thuisindebuurt.nl.

### F6. Zelf categorieën toevoegen in het CMS werkt niet
**Wens:** Margareth kan zelf een nieuwe categorie toevoegen en die verschijnt
daarna overal: in het CMS, op de website en in de filters.

**Wat ik in de code zag** (`beheer.html`, scherm Categorieën ~r.3830–4039).
Nog niet live nagespeeld, want daarvoor moet ik inloggen:
- **Knop "+ Nieuwe categorie" rechtsboven doet niets.** Hij roept direct
  "aanmaken" aan met een lege naam, en dan stopt de functie zonder melding.
  Het echte formulier staat onderaan de pagina, onder alle kaarten. Dat is
  makkelijk te missen. Dit is waarschijnlijk het "doet het niet".
- **"Koppelen aan"** (Buurtinitiatieven/Activiteiten/Agenda/Nieuws) wordt
  nergens opgeslagen. De knoppen zijn alleen voor de show.
- **Mogelijk databaserechten:** het is onbekend of `categorieen` een regel
  heeft die toevoegen toestaat. Dit staat niet in `sql/rls_audit.sql`. Is die
  regel er niet, dan geeft opslaan een foutmelding. (Eerder hadden we
  hetzelfde probleem bij `site_navigatie`.)
- **Website:** een nieuwe categorie krijgt op de site geen eigen kleur. De site
  deelt 6 vaste kleuren toe op volgorde (zie F4), dus categorie 8 krijgt
  dezelfde kleur als categorie 2.
- **Teller "items gekoppeld"** telt alleen buurtinitiatieven, geen activiteiten.

**Plan:**
- [ ] Knop rechtsboven laten scrollen naar het formulier en de cursor in het
      naamveld zetten, of het formulier bovenaan zetten.
- [ ] Bij een lege naam een melding tonen in plaats van niets doen.
- [ ] Controleren of toevoegen mag in Supabase (SQL Editor → policies op
      `categorieen`). Zo nodig een regel voor toevoegen maken, alleen voor
      ingelogde beheerders.
- [ ] "Koppelen aan" weghalen. Een categorie geldt nu altijd voor
      buurtinitiatieven én activiteiten.
- [ ] Controleren of een dubbele naam wordt geweigerd, bijvoorbeeld twee keer
      "Spel".
- [ ] Teller ook activiteiten laten meetellen.
- [ ] Samen met F4 oplossen dat nieuwe categorieën een eigen kleur krijgen.
- [ ] **Test:**
  - categorie "Test" toevoegen
  - die verschijnt in de keuzelijst bij een buurtinitiatief en een activiteit
  - na publiceren verschijnt die als filterknop op de website
  - daarna weer verwijderen

**Na uitvoering:** pushen en live controleren op app.thuisindebuurt.nl en
www.thuisindebuurt.nl.

---

## 💳 iDEAL-betaling voor activiteiten

> Volledige uitwerking in `PLAN-OPLEVERPUNTEN.md` (punt 2).

- [ ] **Giovanny: Mollie-account aanmaken** *(vereist KVK-koppeling — blokkeert de rest)*
- [ ] Besluit: transactiekosten doorbelasten aan deelnemer of zelf dragen?
- [ ] Database uitbreiden (bedrag, betaalstatus, Mollie-referentie)
- [ ] Betaalkoppeling bouwen (server-side, kan niet vanuit de browser)
- [ ] Bedankscherm na betaling
- [ ] Betaalstatus tonen in het CMS

---

## ⚡ Snelheid

> Volledige uitwerking in `PLAN-PERFORMANCE.md`. Score nu: **28/100** op mobiel.

- [ ] Meta-description toevoegen *(klein, ook goed voor Google)*
- [ ] Cache-instellingen toevoegen *(klein)*
- [ ] Afbeeldingen: vaste afmetingen + moderne formaten *(klein)*
- [ ] Scripts niet meer blokkerend laden *(klein)*
- [ ] **De grote winst:** de website compileert zichzelf nu in de browser van
      elke bezoeker (3 MB aan compiler-code). Vooraf compileren zou de score
      naar verwachting van 28 naar 70-90 tillen — *aparte klus, raakt de
      manier van werken*
- [ ] Ongebruikte opmaakcode opruimen *(als laatste, makkelijk iets te breken)*

---

## 🔒 Techniek & veiligheid

- [ ] **Rechten-audit database** — nooit gecontroleerd of bezoekers persoonlijke
      gegevens (aanmeldingen, bestellingen met adres/telefoon) kunnen uitlezen.
      *Dit zou ik het hoogst prioriteren van dit blok.*
- [ ] Rolscheiding CMS is nu alleen in de browser afgedwongen, niet op de server
- [ ] "Wachtwoord vergeten" ontbreekt volledig in het CMS — beheerders die hun
      wachtwoord kwijt zijn hebben nu een superadmin nodig
- [ ] Controleren of de e-mailkoppeling (Resend) nog actief en juist ingesteld is
- [ ] Nieuwsbrief-aanmelding in de footer slaat het e-mailadres nergens op.
      Hij toont alleen "Bedankt" (`bundle-src/ui.jsx`, `handleNewsletter`).
      *Gevonden bij F3.*
- [ ] Contactgegevens in het CMS bereiken de website niet *(zelfde probleem als
      het menu had — oplossing is bekend)*
- [ ] "Doe mee"/"Doneren"/"Boek"-knoppen reageren niet op de aan/uit-schakelaar

---

## 🧹 Opruimen

- [ ] `TIB Beheer.html` loopt ~220 regels achter op het echte `beheer.html` —
      verwarrend duplicaat
- [ ] Map `src/` is een ongebruikte oude kopie van de website

---

## 💡 Ideeën (nog geen besluit)

- [ ] Buurtinitiatieven ook in de Agenda tonen *(technisch goed mogelijk;
      vraag is of het de agenda niet te druk maakt)*

---

## Voorgestelde volgorde

1. **B4 afmaken:** keuze A of B maken, SQL draaien, veld aansluiten.
   Daarna B3 (dat vraagt dezelfde soort ingreep).
4. **Besluit iDEAL:** zodra het Mollie-account er is.
5. **Rechten-audit** — laag zichtbaar, maar het gaat om persoonsgegevens.
6. **Snelheid** — begin met de vier kleine punten, de grote apart inplannen.
7. **Rest:** opruimen, E (teksten zelf beheerbaar maken).
