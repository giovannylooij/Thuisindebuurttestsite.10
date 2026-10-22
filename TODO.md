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
      **Brainstorm (14-09), nog niet uitgevoerd.** Uitwerking hieronder.

      **Nu:**
      - Alle paginateksten staan vast in de websitecode.
      - De CMS-schermen Contact en Doneren slaan alleen op in de browser
        (`localStorage`) en bereiken de site nooit.
      - In Supabase is geen tabel voor teksten.

      **Besluiten Giovanny:**
      - [x] Omvang: **paginakoppen**. Per pagina label, titel en intro.
      - [x] Je/u: **vaste tekst, zoals Margareth typt.** Het automatisch
            wisselen tussen "jouw" en "uw" vervalt voor deze teksten.
      - [x] **Alleen gewone tekst.** Een witregel wordt een nieuwe alinea.
      - [x] **Contact en Doneren meenemen:** die schermen gaan ook naar
            Supabase opslaan.

      **Plan:**
      - [ ] SQL (Giovanny draait): tabel bijv. `pagina_teksten` (pagina, label,
            titel, intro). Iedereen mag lezen, alleen ingelogde beheerders
            mogen schrijven.
      - [ ] CMS: nieuw scherm "Paginateksten" met per pagina label, titel en
            intro, opslaan naar Supabase.
      - [ ] CMS: Contact en Doneren omzetten van `localStorage` naar Supabase.
      - [ ] Website: 11 paginakoppen lezen uit de tabel. Is een veld leeg, dan
            blijft de huidige tekst uit de code staan (nooit een lege pagina).
            Pagina's: Buurtinitiatieven (2 alinea's), Activiteiten, Agenda,
            Buurtatlas, Partners, Netwerken, Nieuws, Doe mee, Doneren, Contact,
            Boek. De homepage valt erbuiten (andere opbouw, eventueel later).
      - [ ] Testen: lokaal, daarna live met Giovanny ingelogd.

      **Nog te beslissen of te weten:**
      - [ ] De Nieuws-intro bevat een link naar BNS, maar gewone tekst kan
            geen link bevatten. Kiezen tussen:
            - die intro vast laten staan
            - een webadres in de tekst automatisch klikbaar maken
            - de link weglaten
      - [ ] Wie mag bewerken: alleen superadmin, of ook beheerders van een
            buurtinitiatief?
      - [ ] De Doneren-kop staat in u-vorm, de rest van de site in je-vorm.
            Margareth kan dat gelijktrekken zodra het veld er is.
      - [ ] De standaardtekst van Contact en Doneren noemt nog
            `doneren@thuisindebuurt.org`. Meenemen in het rechtzetten.
      - Een extra ophaalstap bij het laden van de site, net als bij het menu.
        Klein effect op de snelheid.
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

**Status: live (14-09, commit `2cb7bd3`), lokaal én live getest.**
- [x] Live gecontroleerd: `index.html` en `beheer.html` zijn identiek aan
      lokaal.
      - Activiteiten-pagina ongewijzigd (10 activiteiten in dezelfde 3 groepen,
        "Gesorteerd op type")
      - homepage "10 terugkerende activiteiten"
      - Buurtatlas "Activiteiten · 10", ook na een bezoek aan de Agenda
      - detailpagina met aanmeldformulier
      - CMS (onderschepte opslag): activiteit en buurtinitiatief hebben
        dezelfde 5 secties en 17 velden, Terugkerend alleen bij activiteit, en
        opslaan stuurt `wat` en `uitgebreide_omschrijving` mee
      - geen consolefouten
- [x] Echte opslagtest (14-09, Giovanny ingelogd, met toestemming):
      - Koffie & Soep: "Wat" = TEST, opgeslagen via het CMS
      - de database toonde `wat` = "TEST"; overige velden en status ongewijzigd
      - de live detailpagina toonde "Wat: TEST"
      - daarna weer leeggemaakt en opgeslagen, `wat` = "" in de database
      - CMS doorgeklikt: waarden in beide bewerkschermen komen overeen met de
        database, "Nieuwe activiteit" opent goed
      - geen consolefouten
- Opgevallen tijdens het testen (niet aangepast):
  - Parklunch Belgisch Park heeft als e-mail "activiteiten @thuisindebuurt.nl"
    (met spatie). Mail naar dat adres komt niet aan.
  - Er staat een gepubliceerd buurtinitiatief "test 2", waarschijnlijk een
    testrestant.
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

**Brainstorm met Giovanny (14-09), besluiten:**
- [x] **Werkwijze:** Margareth maakt een categorie aan in het scherm
      Categorieën. Daarna koppelt ze die **via het item zelf**: in het
      bewerkscherm van een buurtinitiatief of activiteit kiest ze hem in de
      keuzelijst "Categorie". Die keuzelijst leest al uit de categorieëntabel.
- [x] **Een categorie geldt altijd voor buurtinitiatieven én activiteiten.** De
      knoppen "Koppelen aan" gaan weg.
- [x] **Website:** een categorie verschijnt pas als filterknop op de
      Buurtinitiatieven-pagina als er minstens één buurtinitiatief aan hangt.
      Nu staan ook lege categorieën er (bijv. Kunst en Cultuur, 0).
- [x] **Kleur en icoon** blijven alleen voor herkenning in het CMS. De site houdt
      zijn eigen vaste kleuren.

**Echte test (14-09, Giovanny ingelogd, met toestemming):**
- [x] **Toevoegen werkt.** Via het formulier onderaan de categorie "TEST"
      aangemaakt. Hij verscheen in de database (id 13, volgorde 8) en in de
      CMS-lijst. De databaserechten zijn dus **geen** probleem.
- [x] **Keuzelijst werkt.** "TEST" stond meteen in de keuzelijst "Categorie" van
      een activiteit (bekeken, niet opgeslagen).
- [x] **Website toonde "TEST" direct als filterknop**, terwijl er niets aan hing.
      Klikken gaf "0 buurtinitiatieven gevonden". Dit bevestigt dat het besluit
      "pas tonen als er iets aan hangt" nodig is.
- [x] **Verwijderen werkt.** Via de prullenbak met bevestigingsvraag verwijderd.
      Weg uit de database, de CMS-lijst en de filterknoppen van de website.
- [x] Geen consolefouten.
- **Conclusie:** het toevoegen zelf werkt. Wat "niet werkt" is de bediening:
  - de knop "+ Nieuwe categorie" rechtsboven doet niets
  - het echte formulier staat onderaan, onder alle kaarten, en is makkelijk te
    missen
  - "Koppelen aan" doet niets

**Besluit (14-09):** knop rechtsboven weg, formulier bovenaan (optie A).

**Status (14-09): gebouwd, nog niet gepusht.**
- [x] CMS `beheer.html`, alleen binnen `CategoriesScreen`:
      - knop rechtsboven weg; formulier "Nieuwe categorie" staat bovenaan;
        Enter in het naamveld maakt de categorie aan
      - "Koppelen aan" weg (werd nergens opgeslagen)
      - lege naam geeft een melding, bij aanmaken én hernoemen
      - dubbele naam geeft een melding, zonder op hoofdletters en spaties aan
        de randen te letten, ook bij hernoemen
      - teller "items gekoppeld" telt buurtinitiatieven én activiteiten
      - uitleg bovenaan aangepast: categorie geldt voor beide en je kiest hem
        bij het item; kleur en icoon alleen voor het CMS
- [x] Website `bundle-src/clubjes.jsx`: filterknoppen alleen voor categorieën
      met minstens één buurtinitiatief.
- [x] Lokaal getest (14-09). Wegschrijven werd onderschept, er ging niets naar
      de database:
      - **website:** filterknoppen zonder "Kunst en Cultuur" (0
        buurtinitiatieven), de andere 6 staan er; klik Spel → 1 kaartje, nog
        eens → alle 9
      - **CMS opbouw:** geen knop rechtsboven, formulier "Nieuwe categorie"
        staat vóór de kaarten, één formulier, "Koppelen aan" weg, nieuwe uitleg
      - **tellers:** tellen buurtinitiatieven en activiteiten (bijv. Eten 4 =
        2 + 2)
      - **aanmaken:** een lege naam of alleen spaties geeft een melding en er
        wordt niets opgeslagen; "  eten " geeft "bestaat al" en wordt niet
        opgeslagen; "  TEST F6  " via Enter geeft een melding en wordt
        opgeslagen als "TEST F6" met volgorde 8
      - **hernoemen:** Eten → "Spel" geeft "bestaat al"; leeg geeft een
        melding; "eTEN" (alleen andere hoofdletters) mag en neemt de items mee
      - geen consolefouten
- [x] **Live (14-09, commit `8d1127c`), live getest met Giovanny ingelogd:**
      - live `index.html` en `beheer.html` zijn identiek aan lokaal
      - **website:** filterknoppen zonder "Kunst en Cultuur"; Spel → 1 kaartje
      - **CMS opbouw:** geen knop rechtsboven, formulier bovenaan, "Koppelen
        aan" weg, nieuwe uitleg; tellers tellen beide soorten (Eten 4)
      - **lege naam:** melding "Vul een naam in voor de nieuwe categorie."
      - **" Spel ":** melding in beeld "Er bestaat al een categorie met de naam
        "Spel"."; geen tweede Spel in de database
      - **echte test "TEST F6":** aangemaakt (database id 14, volgorde 8); de
        website kreeg hem binnen maar toonde **geen** filterknop (0
        buurtinitiatieven); daarna verwijderd via de prullenbak en weg uit de
        database (weer 7 categorieën)
      - geen consolefouten
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

## 📋 Margareth's opmerkingen deel 3 *(13 oktober 2026, nog niet uitgevoerd)*

Gecontroleerd in de code en de database op 13-10.

### G1. Concept-activiteiten staan tóch op de website
- 19 activiteiten, waarvan **5 op Concept**: Koffie & Soep, Buurtwandeling,
  Nordic Walking, Schaakavond, Leeskring. Ze staan op de homepage én op de
  Activiteiten-pagina.
- Oorzaak: de site filtert bij activiteiten niet op status (bij
  buurtinitiatieven wel). In september is dit filter bewust teruggedraaid.
- [ ] Alsnog filteren op "Gepubliceerd", op de homepage, Activiteiten, Agenda
      en de Buurtatlas.

### G2. Introtekst moet doorlopen op álle pagina's
**Besluit Giovanny (13-10): optie A, volledig uitlijnen met de rest van de
pagina.**
- [x] Maximale regelbreedte weg uit `template.html`; ook de 90ch van
      Buurtinitiatieven (F2) verwijderd.
- [x] Lokaal getest op 1440px: op Buurtinitiatieven, Activiteiten, Agenda,
      Partners, Netwerken en Buurtatlas is de tekstbreedte exact gelijk aan de
      inhoudsbreedte (1124px).

### G3. Korte omschrijving staat twee keer op de detailpagina
- De korte omschrijving staat onder de titel én nog eens onder "Over ...".
- [x] De tweede is weg; daar staat nu alleen de uitgebreide "Omschrijving"
      (B4). Lokaal getest op Walking Dinner: de korte zin staat nog één keer op
      de pagina.
- **Antwoord op haar vraag** over "1 zin, gebruikt op kaarten en in
  zoekresultaten": dat is de uitleg bij **Korte omschrijving**. Die ene zin
  staat op de kaartjes in het overzicht en bovenaan de detailpagina.

### G4. Waar gaat de melding "Bestaat dit nog?" heen?
- Naar de tabel `meldingen`, zichtbaar in het CMS onder **Meldingen**.
- **Er gaat geen e-mail uit.** Je ziet het dus alleen als je in het CMS kijkt.
- [ ] Besluit: willen we hier een e-mail bij? Dat vraagt de e-mailkoppeling
      (Resend), die ook nog gecontroleerd moet worden.

### G5. Blauwe icoontjes nog zichtbaar in het CMS
- In de lijsten Buurtinitiatieven (`beheer.html` r.1873) en Activiteiten
  (r.2427) staat nog het automatische icoon op basis van de naam.
- [x] Weggehaald; de lijsten tonen nu het zelfgekozen icoon. Lokaal getest:
      buurtinitiatieven 8 van 8 met eigen icoon, activiteiten 13 van 19, nul
      blauwe icoontjes.

### G6/G7. Activiteiten-pagina: tekst, groepen en categorieën
- De site groepeert op het veld **Type** (Ontmoeting, Beweging, Cultuur &
  leren). Dat zijn de "oude categorienamen" die Margareth ziet. De echte
  categorie wordt op die pagina nergens getoond.
- [ ] Groeperen op **categorie** (zoals in september gebouwd en daarna
      teruggedraaid).
- [ ] Introtekst wordt: "Activiteiten, georganiseerd door Thuis in de Buurt
      zelf en haar partners. Gesorteerd op categorie."
- [ ] Knop "Per rubriek" wordt "Per categorie".
- [ ] Label op de detailpagina en de Agenda-kaartjes: categorie in plaats van
      Type.

### G8. Icoontjes van activiteiten niet op de website
- 14 van de 19 activiteiten hebben een icoon gekozen, maar de site toont ze
  niet en zet er een automatisch blauw icoon bij.
- [ ] Zelfgekozen icoon tonen, automatisch icoon weg (zoals bij
      buurtinitiatieven).

### G9. Walking Dinner komt wekelijks terug in de kalender
- "Walking Dinner Belgisch Park" staat op **niet-herhalend**, met als wanneer
  "zaterdag 3 april 2027". De weekkalender kijkt alleen of er een dagnaam in de
  tekst staat en toont hem daardoor elke zaterdag.
**Gebouwd en lokaal getest (13-10), nog niet gepusht.**
- [x] `ui.jsx`: `tibDatumUitTekst` herkent een datum in het vrije tekstveld
      "Wanneer" ("3 april 2027", "03-04-2027"); de mapper geeft die mee als
      `datum`.
- [x] `other.jsx` weekkalender: staat Terugkerend uit, dan verschijnt de
      activiteit alleen op die ene datum. Zonder herkenbare datum verschijnt hij
      niet in de kalender, maar nog wel in de lijsten.
- [x] `other.jsx` kalenderweergave per weekdag: alleen terugkerende
      activiteiten.
- [x] Lokaal getest:
      - Walking Dinner staat niet meer in de weekkalender
      - een testactiviteit (eenmalig, woensdag deze week) verscheen precies één
        keer, op woensdag
      - terugkerende activiteiten staan nog op hun eigen dagen
      - kalenderweergave toont geen eenmalige activiteiten
      - geen consolefouten
- [x] **Live (13-10, commit `3687fb7`)**, live nagelopen:
      - weekkalender toont 10 activiteiten deze week, Walking Dinner zit er
        niet meer bij
      - Walking Dinner staat nog wel gewoon in de lijst ernaast
      - kalenderweergave per weekdag: 12 items, geen eenmalige
      - geen consolefouten

**Aanvulling (13-10, op verzoek van Giovanny): eenmalige activiteiten naar de
kolom "Eenmalige Activiteiten".**
- [x] Agenda-pagina: eenmalige activiteiten staan nu links bij de evenementen,
      op datum gesorteerd; rechts alleen terugkerende.
- [x] Het datumblokje toont de echte datum in plaats van de eerstvolgende
      weekdag.
- [x] Lokaal getest: Walking Dinner Belgisch Park staat links met "03 APR",
      rechts staan 12 terugkerende activiteiten, weekkalender ongewijzigd,
      geen consolefouten.
- [x] Gepusht (commit 764922a) en live gecontroleerd op www.thuisindebuurt.nl:
      links 6 eenmalige items (incl. Walking Dinner Belgisch Park 03 apr),
      rechts 12 terugkerende, geen consolefouten.
**Afgelopen evenementen (13-10, "pak op"): klaar, nog niet gepusht.**
- [x] Agenda: afgelopen evenementen staan niet meer tussen de komende; eronder
      staat de knop "Toon afgelopen evenementen (aantal)" die ze erbij zet.
- [x] Homepagina "De eerstvolgende evenementen": afgelopen items eruit, op
      datum gesorteerd, en eenmalige activiteiten horen er nu ook bij.
- [x] Items zonder leesbare datum blijven altijd zichtbaar (onderaan).
- [x] Lokaal getest (13 okt 2026): links 1 komend item (03 apr Walking Dinner
      Belgisch Park), knop toont 5 afgelopen items, rechts 12 terugkerende,
      homepagina 1 kaart (3 Apr Walking Dinner Belgisch Park).
- [x] Gepusht (commit f4741f1) en live gecontroleerd: homepagina 1 komende
      kaart, Agenda links 1 komend item, knop zet 5 afgelopen items erbij,
      rechts 12 terugkerende, geen consolefouten.
- *Let op voor Margareth:* in de agendatabel staat nu geen enkel komend
  evenement meer; alle 5 zijn van mei t/m juli 2026.

**Homepagina "vandaag" + kleur eenmalig (13-10): klaar, nog niet gepusht.**
- [x] Homepagina toont wat er *die dag* te doen is (dinsdag andere items dan
      donderdag), inclusief terugkerende activiteiten. Is er die dag niets,
      dan de eerstvolgende dag met iets (tot 14 dagen vooruit).
- [x] Kop verandert mee: "Vandaag in de buurt / Dit is er vandaag te doen.",
      anders "morgen" of bv. "donderdag 15 oktober".
- [x] Meer dan 3 items op die dag: regel "En nog X activiteiten ...".
- [x] Eenmalige activiteit krijgt nu de groene kleur "Eenmalig" in plaats van
      het oranje van terugkerend (Agenda-pagina + homepagina).
- [x] Dag-logica staat nu één keer in ui.jsx (tibAgendaOpDag /
      tibActiviteitOpDag); de weekkalender gebruikt dezelfde functies.
- [x] Lokaal getest 13-10 (dinsdag): homepagina toont Inloop koffie-ochtend en
      Bridgeclub De Hinde, Piano Lunchconcert terecht niet (eerste dinsdag);
      weekkalender en rechterkolom ongewijzigd; geen consolefouten.
- [x] Gepusht (commit e7fa92b) en live gecontroleerd op 13-10: homepagina
      "Vandaag in de buurt" met Inloop koffie-ochtend en Bridgeclub De Hinde,
      Agenda links het groene eenmalige item, rechts 12 terugkerende.

### G10. Wijk en icoon niet zichtbaar op de website
- `wijk` wordt wel opgeslagen (bijv. Walking Dinner: Belgisch Park) maar nergens
  getoond; het icoon ook niet (zie G8).
- [ ] Wijk tonen op de detailpagina, icoon op de kaartjes.

### G11. Categorieën: kleuren
- Nu 6 vaste kleuren in het CMS en 6 op de website; bij 8 categorieën krijgen
  twee dezelfde kleur.
- [ ] 10 duidelijk verschillende, vrolijke kleuren.
- [ ] **Vraag van Margareth:** zelf een kleur toevoegen of aanpassen? Kan: met
      een kleurkiezer in plaats van vaste kleuren. Dan moet de site de kleur uit
      het CMS gaan gebruiken (nu negeert hij die).

### G11 + G13 — uitgevoerd op 13-10 *(nog niet gepusht, CMS-test open)*

**G11 kleuren**
- Bevinding: de app had 6 kleuren voor 8 categorieën. Eten en
  Evenement/Festival hadden dezelfde kleur, Sport en Bewegen en Overig ook.
  De website negeerde de kleur uit de app volledig en gebruikte een eigen
  rijtje van 6 kleuren op volgorde.
- [x] Website (`ui.jsx`): de kleur komt nu uit de app; geen kleur in de app =
      terugvallen op het oude rijtje.
- [x] CMS: palet van 10 kleuren plus een neutrale voor Overig, én een
      kleurkiezer voor een eigen kleur. Waarschuwing als een andere categorie
      dezelfde kleur al heeft. Een nieuwe categorie begint bij een vrije kleur.
- [x] Tekst onder het formulier klopt nu: de kleur staat ook op de website.
- [x] Database: de 8 categorieën hebben elk een eigen kleur gekregen
      (`sql/g11_categorie_kleuren.sql`, met de oude waarden erin om terug te
      draaien).
- [x] Lokaal getest: site leest Eten #E07A3A, Ontmoeting/Sociaal #2E8B57,
      Sport en Bewegen #D6453F, Spel #2F6DB5, Lezen #5B52C4, Kunst en Cultuur
      #8E44AD, Evenement/Festival #C2457E, Overig #7A7363.
- [x] Gepusht (commit 34b9ac7) en live gecontroleerd op www.thuisindebuurt.nl:
      de site leest de 8 kleuren uit de app, filterbolletjes kloppen.
- [ ] CMS-scherm Categorieën nog testen met een ingelogde beheerder.

**G13 iconen uploaden**
- Bevinding: de uploadknop toonde alleen een melding; de iconenlijst stond
  vast in de code (64 stuks). Daarnaast mocht *iedereen* met de publieke
  sleutel bestanden in de map `icons` zetten.
- [x] Mediabibliotheek: echte upload (png, svg, jpg, max 1 MB, meerdere
      tegelijk), nette melding per bestand, bestaande naam wordt niet
      overschreven.
- [x] De iconenlijst komt nu uit de opslagmap zelf, met de vaste lijst als
      terugval. Een nieuw icoon staat meteen in de keuzelijst bij
      buurtinitiatieven en activiteiten.
- [x] Rechten aangescherpt: uploaden mag alleen nog ingelogd
      (`sql/g13_iconen_upload.sql`); lezen blijft openbaar.
- [x] Gepusht (commit 34b9ac7); beheer.html staat live op app.thuisindebuurt.nl.
- [ ] Upload nog echt testen met een ingelogde beheerder.
- Nog niet gedaan (bewust): geen verwijderknop voor iconen — een icoon dat nog
  bij een item hoort zou dan een leeg vlak worden.

### G12. Meerdere categorieën per buurtinitiatief of activiteit
- Nu één categorie per item (een tekstveld).
- [ ] Kan, maar is een grotere ingreep: database, CMS (meerkeuze) en de site
      (filters, groepen, labels). Apart inplannen.

### G13. Mediabibliotheek: uploaden werkt niet
- De knop "Uploaden" toont alleen een melding; er gebeurt niets.
- De iconenlijst staat vast in de code (`CMS_ICONEN`), niet uit de opslagmap.
- [ ] Echt uploaden naar de opslagmap `icons` en de lijst daaruit halen, zodat
      een nieuwe set vanzelf verschijnt.

### G14. Scherm Navigatie — uitleg + bevinding
- Bedoeld om menu-items te hernoemen, te verbergen, te verwijderen of toe te
  voegen.
- **Bevinding:** dit scherm slaat alleen op in de browser (`localStorage`) en
  bereikt de website niet. Alleen de aan/uit-schakelaar bij **Pagina's** schrijft
  wel naar de database.
- [x] **Gebouwd 16-10 (nog niet gepusht).** Het scherm Navigatie schrijft nu
      naar de tabel `site_navigatie`: naam wijzigen, volgorde met pijltjes,
      zichtbaar aan/uit, pagina uit het menu halen of toevoegen. Elke
      wijziging gaat meteen naar de database, met melding als dat mislukt.
      Pagina's komen uit een keuzelijst, zodat er geen dode links ontstaan.
- [x] Website (`ui.jsx` + bootstrap in index.html): het hoofdmenu komt nu uit
      die tabel (naam, volgorde, zichtbaarheid), met het vaste rijtje als
      terugval. Lokaal getest: menu volgt de database.
- [x] Nepdingen uit het scherm gehaald: "CTA-knoppen" (hardcoded) en de drie
      schakelaars onder "Mobiel menu" (deden niets).
- [x] SQL gedraaid door Giovanny (16-10): kolom volgorde gevuld 1 t/m 12,
      lezen openbaar, schrijven alleen ingelogd.
- [x] Gepusht (commit b35436f, CMS-versie 1.0.183) en live gecontroleerd:
      het menu op www.thuisindebuurt.nl volgt de database.
- [ ] Scherm Navigatie zelf nog nalopen met een ingelogde beheerder
      (naam wijzigen, pijltjes, schakelaar).
- *Live gevolg (zoals verwacht):* Nieuws staat in de database op verborgen en
  Doneren op zichtbaar, dus het menu toont nu geen Nieuws en wel Doneren.
  In het CMS met één schakelaar terug te zetten.
- *Document voor het gesprek met Margareth:* claude.ai-document
  "Bevindingen Margareth — wat is opgelost" (16-10).
- *Oud, ter info:* in de database staat Nieuws op verborgen en Doneren
  op zichtbaar. Zodra dit live staat, volgt het menu dat: Nieuws verdwijnt uit
  het menu en Doneren komt erbij. In het CMS is dat met één schakelaar terug
  te draaien.

### G15. Scherm Formulieren — uitleg + bevinding
- Drie tabbladen: ingekomen berichten, de onderwerpkeuzes van het
  contactformulier, en instellingen met de ontvangende e-mailadressen.
- **Bevinding:** "Verstuur antwoord" toont alleen een melding en verstuurt
  niets; de instellingen blijven in de browser hangen.
- [x] **Besluit Giovanny 14-10: scherm eruit.** Verwijderd uit het menu en uit
      de code (FormulierenScreen, het lege voorbeeldlijstje `DATA.formulieren`
      en de route). De dashboardkaart "Contact via het contactformulier"
      verwijst nu naar het scherm Contact, waar de echte berichten staan.
- [x] Rolcontrole hersteld: een initiatief-beheerder mocht alléén het scherm
      Formulieren zien; dat bestaat niet meer, dus nu geldt de lijst die er al
      voor klaarstond (dashboard en buurtinitiatieven).
- [x] Gepusht (commit 242b6d5), live op app.thuisindebuurt.nl (versie 1.0.181).
- [ ] Na inloggen nog even nalopen: menu zonder Formulieren, dashboardkaart
      verwijst naar Contact.
- *Vervallen met het scherm:* de onderwerpen van het contactformulier konden
  daar "aangepast" worden, maar dat werkte niet (bleef in de browser hangen).
  Bezoekers zien nog steeds dezelfde vijf onderwerpen uit de site. Wil je ze
  echt beheerbaar maken, dan is dat een aparte klus: klein tabelletje in de
  database, een blokje in het scherm Contact, en de site die het uitleest.
- *Mailadressen:* de tabel `formulieren_instellingen` bestaat al en is leeg;
  die pakken we op zodra de e-mailkoppeling (Resend) aangaat.

### Blok 1 — uitgevoerd en live *(13-10, commit `67cd8ef`)*

Raakt alleen de **website** (`bundle-src`), niet het CMS. Geen SQL nodig.

**1. Statusfilter (G1)**
- `ui.jsx`: bij het laden alleen activiteiten met status "Gepubliceerd".
- `other.jsx` (Agenda-pagina): hetzelfde filter bij het ophalen.
- Gevolg: **14 in plaats van 19** activiteiten op de site. Deze 5 verdwijnen
  tot Margareth ze publiceert: Koffie & Soep, Buurtwandeling, Nordic Walking,
  Schaakavond, Leeskring.
- Werkt door op: homepage-teller en -kaartjes, Activiteiten, Agenda,
  weekkalender en de stippen op de Buurtatlas.

**2. Groeperen op categorie (G6/G7)**
- `other.jsx`: groepen komen uit de categorieënlijst in plaats van uit Type.
  Lege groepen worden overgeslagen. Met de huidige gegevens worden dat:
  Eten (2), Ontmoeting/Sociaal (3), Sport en Bewegen (3), Spel (3),
  Kunst en Cultuur (1), Overig (2).
- Introtekst wordt: "Activiteiten, georganiseerd door Thuis in de Buurt zelf en
  haar partners. Gesorteerd op categorie."
- Knop "Per rubriek" wordt "Per categorie".
- `detail.jsx`: het label boven de titel toont de categorie in plaats van Type.
- Agenda-kaartjes: label toont de categorie.
- Type blijft in de database staan, maar wordt nergens meer getoond.

**3. Icoontjes (G8)**
- `other.jsx`: op de kaartjes het **zelfgekozen** icoon tonen, zoals bij
  buurtinitiatieven. Het automatische blauwe icoon verdwijnt helemaal.
- Heeft een activiteit geen icoon, dan blijft het bestaande fotovlak staan.
  Nu hebben 14 van de 19 een icoon; 5 nog niet.

**4. Wijk tonen (G10)**
- `detail.jsx`: rij **Wijk** toevoegen in het blokje Voor wie / Wat / Waar /
  Wanneer / Kosten, voor buurtinitiatieven én activiteiten. Leeg veld = geen rij.

**Status: gebouwd en lokaal getest (13-10), nog niet gepusht.**
- [x] `ui.jsx`: statusfilter terug (`tibIsGepubliceerd`).
- [x] `other.jsx`: Agenda-loader filtert op gepubliceerd; groepen uit de
      categorieënlijst; nieuwe introtekst; "Per categorie"; eigen icoon op de
      kaartjes; automatisch blauw icoon weg.
- [x] `detail.jsx`: label toont de categorie; rij "Wijk" toegevoegd.
- [x] Lokaal getest:
      - 14 activiteiten in de lijst, alleen status "Gepubliceerd"
      - homepage: "14 terugkerende activiteiten"
      - groepen: Eten (2), Ontmoeting/Sociaal (3), Sport en Bewegen (3),
        Spel (3), Kunst en Cultuur (1), Overig (2)
      - knop heet "Per categorie", introtekst aangepast
      - 13 van de 14 kaartjes tonen het eigen icoon (Hatha Yoga heeft er geen),
        0 blauwe icoontjes
      - Walking Dinner: label "Eten", rij "Wijk: Belgisch Park"
      - buurtinitiatief Parklunch: rij "Wijk: Belgisch Park e.o."
      - Agenda-labels tonen categorieën; Buurtatlas "Activiteiten · 14"
      - geen consolefouten
- [x] **Live (13-10, commit `67cd8ef`)** en live nagelopen:
      - 14 activiteiten, alleen status "Gepubliceerd"
      - homepage "14 terugkerende activiteiten"
      - groepen Eten (2), Ontmoeting/Sociaal (3), Sport en Bewegen (3),
        Spel (3), Kunst en Cultuur (1), Overig (2)
      - knop "Per categorie", nieuwe introtekst
      - 13 eigen icoontjes, 0 blauwe
      - Walking Dinner: label "Eten", rij "Wijk: Belgisch Park"
      - Agenda-labels tonen categorieën, Buurtatlas "Activiteiten · 14"
      - geen consolefouten
- [ ] Giovanny/Margareth: zelf nalopen in de site.

**Wat Margareth daarna zelf kan controleren**
1. Homepage: telt "14 terugkerende activiteiten".
2. Activiteiten: groepen heten nu Eten, Ontmoeting/Sociaal, Sport en Bewegen,
   Spel, Kunst en Cultuur, Overig. De knop heet "Per categorie".
3. De 5 concepten staan er niet meer; publiceert ze in het CMS en ze komen
   terug.
4. Op de kaartjes staan haar eigen icoontjes, geen blauwe meer.
5. Detailpagina van bijv. Walking Dinner: label "Eten" en een rij "Wijk" met
   Belgisch Park.

**Niet in blok 1** (staat in blok 2 en verder): dubbele omschrijving op de
detailpagina, bredere introteksten, blauwe icoontjes in het CMS zelf, en de
weekkalender die Walking Dinner elke zaterdag toont.

### Volgorde die ik voorstel
1. ~~G1, G6/G7, G8, G10~~ — live (commit `67cd8ef`)
2. ~~G2, G3, G5~~ — live (commit `35e8ec7`), live gecontroleerd:
   introtekst 1124px op alle pagina's, korte zin nog 1x op de detailpagina,
   CMS-lijsten 8 en 13 eigen icoontjes, 0 blauwe, geen consolefouten
3. ~~G9~~ — live (commit `3687fb7`)
4. G11 kleuren, daarna G13 iconen uploaden
5. G14/G15 (CMS-schermen die niets doorsturen)
6. G12 meerdere categorieën, als aparte klus

---

## 🗓️ Gesprek met Margareth — 16 oktober 2026 *(nieuw werk, nog niets gebouwd)*

Zeven punten uit het gesprek en haar mail, gebundeld in vier blokken. Per blok
staat wat er nu is, wat eraan moet gebeuren en welke besluiten er eerst nodig
zijn. Nog niets van dit alles is gebouwd.

### Blok A — Teksten zelf kunnen aanpassen *(gebouwd 22-10, wacht op SQL)*

**Besluiten Giovanny (22-10):** alles beheerbaar (pagina's, homepagina en het
contactblok), platte tekst zoals het nu is, haar tekst wordt letterlijk
overgenomen (de je/u-schakelaar werkt daar dan niet meer op), alleen
superadmin, en het komt in het bestaande scherm Pagina's.

- [x] `sql/blokA_pagina_teksten.sql`: tabel `pagina_teksten` (pagina, sleutel,
      tekst), lezen openbaar, schrijven alleen ingelogd.
- [x] Website: `tibTekst(pagina, sleutel, standaard)` in `ui.jsx`; elke
      paginakop, de zes blokken op de homepagina en het contactblok onderaan
      halen hun tekst daaruit, met de huidige tekst als terugval. Geen rij of
      een lege tekst = de standaardtekst blijft staan.
- [x] De tabel wordt los opgehaald en foutbestendig: bestaat hij nog niet, dan
      blijft de site gewoon werken zonder foutmelding.
- [x] Twee uitzonderingen met een reden: de titel op de homepagina houdt zijn
      regelovergang tot ze hem aanpast, en de link naar BNS in de nieuwsintro
      blijft staan tot die alinea wordt aangepast (staat als waarschuwing in
      het scherm).
- [x] CMS: scherm Pagina's opnieuw gebouwd. Links de pagina's, rechts de
      velden met de huidige tekst als grijze hulptekst, "Terug naar standaard"
      per veld, opslaan per pagina. Alleen superadmin.
- [x] Het oude scherm Pagina's is weg: dat toonde verzonnen gegevens
      ("Herbruikbare secties") en maakte eigen menu-rijen met andere id's dan
      het scherm Navigatie — die botsing is daarmee opgelost.
- [x] Lokaal getest: alle pagina's en de footer tonen onveranderd hun tekst,
      geen foutmelding terwijl de tabel nog niet bestaat, CMS compileert.
- [x] SQL gedraaid door Giovanny (22-10); lezen met de publieke sleutel werkt,
      schrijven ermee wordt geweigerd.
- [x] Samen getest in het echte CMS (22-10), daarna alles teruggedraaid:
      scherm laadt, titel aangepast → stond op de site, "Terug naar standaard"
      → oorspronkelijke tekst terug, veld leegmaken doet hetzelfde en haalt de
      regel uit de database.
- [x] **Blok A afgerond** (besluit Giovanny 22-10).
- *Staat nog in de tabel:* `clubjes.intro1`, een eigen proef van Giovanny met
  exact de standaardtekst. Onschuldig; alleen telt dat veld als "aangepast".
  Weg te halen met "Terug naar standaard" bij de eerste alinea.

### Oorspronkelijk plan
Raakt: "bovenste veld (Informatie) op Buurtinitiatieven", "contactblok onderaan
de site", en punt 1 uit haar mail ("de teksten op de pagina's zelf aanpassen").
Dit is hetzelfde als punt E uit deel 1, dat al sinds september open staat.

- Nu: alle paginateksten staan vast in de code. De twee alinea's bovenaan
  Buurtinitiatieven staan in `clubjes.jsx`, het contactblok en de footerteksten
  in `ui.jsx`. Margareth kan er niets aan veranderen.
- [ ] Nieuwe tabel voor paginateksten (pagina, sleutel, tekst) + een
      CMS-scherm waar ze per pagina de kop, de eyebrow en de alinea's bewerkt.
- [ ] Site leest die teksten, met de huidige tekst als terugval.
- [ ] Contactblok onderaan (footer): e-mailadres, de regel eronder, de
      social-link, en de kolommen.
- **Besluit 1:** welke teksten mag ze aanpassen? Voorstel: per pagina de
  eyebrow, de h1 en de introalinea's, plus het footerblok. Niet de knoppen,
  labels en formuliertekst — daar hangt logica aan.
- **Besluit 2:** opmaak toestaan (vet, link, opsomming) of alleen platte
  tekst? Vet en links kosten een kleine editor; platte tekst is zo klaar.
- **Risico:** het bestaande scherm "Pagina's" schrijft nu nog naar de browser
  én maakt eigen rijen in `site_navigatie` met andere id's dan het scherm
  Navigatie. Dat moet gelijkgetrokken worden, anders krijgen we dubbele
  menu-items.

### Blok B — Agenda opnieuw opbouwen
Raakt: "ActiviteitKalender weg", "lijst eronder weg", "onderscheid eenmalig en
terugkerend weg", "agenda wordt buurtinitiatief en activiteit", en punt 4 uit
haar mail (doorlopende agenda, alles automatisch erin).

- Nu: de Agenda toont een weekkalender, daaronder twee kolommen (Eenmalige
  Activiteiten en Terugkerende Activiteiten). Buurtinitiatieven staan er
  helemaal niet in.
- [ ] Weekkalender eraf.
- [ ] Twee kolommen eraf; één doorlopende lijst op datum.
- [ ] Onderscheid wordt: buurtinitiatief of activiteit (label en kleur).
- [ ] Buurtinitiatieven verschijnen automatisch in de agenda.
- **Besluit 3 (het lastigste):** een doorlopende agenda heeft echte datums
  nodig, maar "wanneer" is nu een vrij tekstveld ("elke dinsdag van 13:30 tot
  17:00"). Drie opties:
  (a) in het CMS echte herhaalvelden toevoegen (dag, frequentie, begin- en
      einddatum) en de agenda rekent de datums uit — netjes, maar Margareth
      moet bij alle bestaande items eenmalig invullen;
  (b) de tekst blijven uitlezen zoals nu — werkt bij "elke dinsdag", gaat mis
      bij alles wat afwijkt;
  (c) terugkerende items niet per datum herhalen, maar één keer tonen op hun
      eerstvolgende datum met de tekst erbij.
  Mijn advies: (a), met (c) als tussenstap zodat de agenda meteen klopt.
- **Besluit 4:** wat gebeurt er met de losse agenda-items (Informatiebijeen-
  komst, Parklunch, Buurtfotografen-expositie)? Blijven die als derde soort
  bestaan, of worden ze voortaan als activiteit ingevoerd?
- ~~**Besluit 5:** blijft de knop "Kalenderweergave" op de pagina
  Activiteiten?~~ **Beslist 22-10: weg.** De knop en de weekweergave
  (`KalenderView`) zijn uit de pagina Activiteiten gehaald; er blijven twee
  knoppen over, Kaart en Lijst. De weekkalender op de Agenda-pagina staat er
  nog (die valt onder blok B).
- **Let op:** veel buurtinitiatieven zijn doorlopend en hebben geen datum. Die
  vallen zonder besluit 3 buiten de agenda.

### Blok C — Kaart op Activiteiten *(gebouwd 22-10)*

**Besluit Giovanny (22-10):** Buurtinitiatieven houdt zijn eigen kaart; er komt
alleen een kaart bij op Activiteiten.

- [x] De kaart van Buurtinitiatieven (`ClubjesMap`) geschikt gemaakt voor
      activiteiten: eigen kopje in het popup-venster en id's als tekst
      ("a12") in plaats van getallen.
- [x] Pagina Activiteiten: knop **Kaart** tussen "Per categorie" en
      "Kalenderweergave", met daaronder een regel hoeveel activiteiten een
      locatie hebben.
- [x] Lokaal getest: 13 van de 13 activiteiten op de kaart, popup toont
      "10 ACTIVITEITEN" op het drukste adres, klikken opent de juiste
      detailpagina. Buurtinitiatieven ongewijzigd (popup "1 BUURTINITIATIEF",
      klikken opent het juiste initiatief). Geen consolefouten.
- [x] Gepusht (commit 8a9758e) en live gecontroleerd: knop Kaart staat er,
      kaart laadt met 3 stippen voor 13 activiteiten.
- [x] **Stippen op de kaart lichter (Giovanny, 22-10) — gedaan.** Elke stip
      krijgt een lichtere tint van zijn eigen kleur (25% naar wit) en de stip
      voor meerdere items is niet langer grijs maar de hoofdkleur van de
      huisstijl, 35% lichter (#77aca9 bij de huidige huisstijl). De kleur
      wordt uit de stylesheet gelezen, dus hij loopt mee als de huisstijl
      verandert. Lokaal getest op beide kaarten, geen consolefouten.
- *Oorspronkelijke notitie:* de stippen op de kaart lichter maken.
- [x] **Activiteiten dezelfde indeling als Buurtinitiatieven (Giovanny,
      22-10).** Je moest eerst op Kaart klikken; nu staat de kaart meteen
      open. De pagina heeft dezelfde opbouw gekregen: tipregel, filterknoppen
      per categorie met rechts Kaart / Lijst / Kalender, de kaart erboven en
      daaronder "x activiteiten gevonden" met de kaartjes, nog steeds
      gegroepeerd per categorie (G6 blijft dus staan). Het filter werkt op de
      kaart én op de lijst tegelijk.
- [x] Gepusht (commit 118ef38) en live gecontroleerd: kaart staat meteen open,
      7 filterknoppen, "13 activiteiten gevonden", geen consolefouten.
- [x] Regel "x van de x activiteiten staan op de kaart" eruit (Giovanny,
      22-10). Gevolg: staat er bij een activiteit geen locatie, dan valt dat
      niet meer op. Desgewenst terug te zetten als melding die alleen
      verschijnt wanneer er iets ontbreekt.
      Vooral de stip voor meerdere items valt nu uit de toon: die is grijs
      (`#4a5563`) terwijl één item de kleur van zijn categorie krijgt. Die
      grijze moet een andere, lichtere kleur worden. Geldt voor de kaart op
      Buurtinitiatieven én op Activiteiten (dezelfde kaart) — de Buurtatlas
      heeft zijn eigen stippen, die apart bekijken.
      Te beslissen: welke kleur wordt het (voorstel: de hoofdkleur van de
      huisstijl in een lichtere tint), en worden de losse stippen ook lichter
      of alleen die ene.

### Oorspronkelijk plan blok C
Punt 3 uit haar mail.

- Nu: de Buurtatlas heeft de goede kaart, met filters en live gegevens uit
  buurtinitiatieven, activiteiten en partners. Buurtinitiatieven heeft een
  eigen, simpelere kaart; Activiteiten heeft helemaal geen kaart.
- ~~De kaart van de Buurtatlas als los onderdeel bruikbaar maken.~~
- ~~Buurtinitiatieven: die kaart gebruiken, gefilterd op buurtinitiatieven.~~
- ~~Activiteiten: dezelfde kaart erbij, gefilterd op activiteiten.~~
- *Achterhaald (22-10):* we hebben niet de Buurtatlas-kaart hergebruikt maar
  de kaart die Buurtinitiatieven al had. Buurtinitiatieven bleef daardoor
  ongemoeid en Activiteiten kreeg dezelfde kaart en indeling. Blok C is klaar.
- **Besluit 6:** vervangt de kaart de huidige kaartweergave op
  Buurtinitiatieven, of komt hij ernaast?
- Technisch het makkelijkste blok; de bouwstenen bestaan al.

### Blok D — Betalen: aanmelden, iDEAL en de doneerpagina
Raakt: "iDEAL bespreken met Armando", "doneerpagina moet het doen" en punt 2
uit haar mail.

- Nu: de doneerpagina is een demo — je kiest een bedrag en krijgt een melding
  "in een echte site ga je nu door naar Donorbox". Er gebeurt niets.
  Aanmelden voor een activiteit kan wel, maar zonder betaling.
- [ ] Doneerpagina echt laten werken.
- [ ] Aanmelden voor een betaalde activiteit met doorverwijzing naar betalen.
- [ ] Bedrag per activiteit in het CMS.
- [ ] Bevestiging na betaling (vraagt de e-mailkoppeling).
- **Voor Armando:** hoe deed de oude website dit, en welke rekening of account
  gebruikt TIB nu? Mollie vraagt een KVK-koppeling; Donorbox heeft TIB mogelijk
  al.
- **Besluit 7:** doneerpagina snel oplossen met de bestaande Donorbox-link, en
  iDEAL pas bouwen als Armando's kant rond is? Dan heeft Margareth volgende
  week al een werkende doneerknop.
- **Let op:** een betaalkoppeling kan niet alleen in de browser; daar hoort een
  stukje server bij. Dat is nieuw voor dit project en vraagt een keuze over
  waar dat draait.

### Volgorde die ik voorstel
1. Blok C (kaart) — klein, zichtbaar resultaat, geen besluiten nodig behalve 6.
2. Blok B (agenda) — zodra besluit 3, 4 en 5 er zijn.
3. Blok A (teksten) — grootste klus, maar wel wat Margareth het vaakst vraagt.
4. Blok D (betalen) — start met de doneerpagina; iDEAL volgt op Armando.

### Nog open van vóór het gesprek
- [ ] Icoon-upload één keer echt uitproberen met een ingelogde beheerder.
- [ ] Scherm Navigatie nalopen na inloggen (pijltjes, hernoemen, schakelaar).
- [ ] Vier vragen over de wekelijkse back-up (zie het blok hieronder).
- [ ] Meerdere categorieën per item (punt 14 van Margareth).
- [ ] Rechten-audit van de database.

---

## 💾 Wekelijkse back-up van de database *(plan, 5 oktober 2026)*

**Waarom:** nu bestaat er alleen een handmatige knop in het CMS. Gaat er iets
mis, dan is er geen recente kopie om op terug te vallen.

**Wat ik heb nagekeken:**
- De back-upknop in het CMS haalt 16 tabellen op en biedt die aan als
  JSON-bestand. **Het menu (`site_navigatie`) en de huisstijlkleuren
  (`huisstijl_secties`) zitten er niet in.**
- Mislukt een tabel, dan komt die als **lege lijst** in het bestand, zonder
  waarschuwing. Je krijgt dan een back-up die compleet lijkt maar dat niet is.
- Er zijn **drie** back-upfuncties in `beheer.html`; de knop rechtsboven en de
  knop bij Instellingen gebruiken verschillende versies.
- **Terugzetten kan nu niet**: er is geen functie om een back-up terug te
  plaatsen.
- Op deze computer staan geen `pg_dump`, `supabase` of `gh`.
- **Supabase-project nagekeken (5 okt):** `thuisindebuurt1.0`
  (`bxklumejqczcmhrpzstt`), organisatie **Luxsoft**, regio eu-north-1,
  **abonnement: gratis**. Op het gratis abonnement maakt Supabase **geen**
  automatische back-ups en is terugzetten naar een eerder tijdstip niet
  mogelijk. Een eigen wekelijkse back-up is dus echt nodig.
- **De database heeft 19 tabellen; de knop neemt er 16 mee.** Ontbreken:
  `site_navigatie`, `huisstijl_secties` en `huisstijl_instellingen`.

### Keuze: waar draait de wekelijkse back-up?

| | Hoe | Voordeel | Nadeel |
|---|---|---|---|
| **A. GitHub Actions** *(advies)* | Gratis taak bij GitHub draait elke week, haalt de tabellen op en bewaart het bestand | Draait altijd, ook als jouw laptop uit staat; gratis; versiebeheer | Sleutel moet als geheim bij GitHub; repo moet privé |
| **B. Supabase betaald abonnement** | Supabase maakt zelf dagelijkse back-ups | Officieel, terugzetten wordt ondersteund | Kost geld (ca. €25 per maand per organisatie); nu staat het op gratis |
| **C. Vercel-taak** | Wekelijkse taak op Vercel schrijft naar Supabase Storage | Alles blijft binnen de bestaande hosting | Extra code die onderhouden moet worden |
| **D. Jouw Mac** | Wekelijkse taak op je eigen computer | Geen externe partij | Draait alleen als de laptop aanstaat |

### Plan bij keuze A
- [ ] **Privacy eerst.** De back-up bevat persoonsgegevens (aanmeldingen,
      bestellingen met adres, contactberichten). Daarom: privé-repo, beperkte
      bewaartermijn en niet in de openbare website-repo.
- [ ] **Sleutel:** een `service_role`-sleutel uit Supabase als geheim bij
      GitHub zetten. Die geeft volledige toegang, dus alleen daar en nergens
      anders. Giovanny plaatst hem zelf; ik krijg hem niet te zien.
- [ ] **Taak:** draait elke week, bijvoorbeeld maandagochtend. Hij haalt
      **alle 19 tabellen** op, dus ook `site_navigatie`, `huisstijl_secties` en
      `huisstijl_instellingen`. De lijst wordt opgehaald uit de database zelf,
      zodat een nieuwe tabel automatisch meegaat.
- [ ] **Controle:** mislukt een tabel, dan mislukt de hele taak zichtbaar, met
      een melding per e-mail. Geen stille lege lijsten meer.
- [ ] **Bewaren:** de laatste 8 weken bewaren, oudere automatisch opruimen.
- [ ] **Terugzetten:** een script dat een back-upbestand terugzet in de
      database, plus een korte handleiding. Eerst oefenen op een testomgeving,
      niet op de echte site.
- [ ] **Testen:** één keer handmatig laten draaien, het bestand controleren op
      aantallen per tabel, en een proef-terugzetting doen.

### Verbeteringen aan de knop in het CMS (los van de automatische back-up)
- [ ] Menu en huisstijl meenemen in de back-up.
- [ ] Mislukte tabellen melden in plaats van stil een lege lijst opnemen.
- [ ] De drie versies terugbrengen naar één.

### Open vragen voor Giovanny
- [x] Abonnement nagekeken: **gratis**, dus geen automatische back-ups.
- [ ] Waar mag de back-up staan: privé-repo bij GitHub, Supabase Storage, of
      allebei?
- [ ] Hoe lang bewaren? Voorstel: 8 weken.
- [ ] Naar welk e-mailadres mag een foutmelding?

---

## 🔢 Versienummer in het CMS *(14-10, klaar, nog niet gepusht)*

- [x] Onder de zijbalk en op het inlogscherm staat "Versie 1.0.x · datum".
- [x] `tools/tib-versie.mjs` zet het nummer op 1.0.<aantal commits> met de
      datum van vandaag.
- [x] Git-hook draait dat script automatisch bij elke commit waarin
      beheer.html meegaat. Kopie in `tools/hooks/pre-commit`; na een verse
      kloon eenmalig installeren met het commando in dat bestand.
- [x] Getest: nummer met de hand op "test" gezet, gecommit, hook zette hem
      terug op 1.0.178 (14-10-2026) en nam hem mee in de commit.
- [x] Gepusht (commit 183a335) en live gecontroleerd: app.thuisindebuurt.nl
      toont op het inlogscherm "Versie 1.0.178 · 14-10-2026".

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
