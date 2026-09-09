# To-do & stand van zaken — Thuis in de Buurt

*Bijgewerkt: 9 september 2026*

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

**Wat nu het meest urgent is:**
1. De categorieën goed regelen — dat blokkeert Margareth's nieuwe categorielijst
   én is de oorzaak van de crash van eerder.
2. B4 afmaken (keuze A/B + SQL-migratie) en daarna B3.
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
- [ ] B2. Veld "WhatsApp" weg uit het CMS *(is een lege huls, slaat niets op)*
- [ ] B3. "Wat" loskoppelen van "Categorie" *(zijn nu letterlijk hetzelfde veld)*
      — vraagt een nieuwe kolom in de database
- [ ] B4. "Uitgebreide omschrijving" een écht vrij tekstveld maken
      **→ uitgewerkt, wacht op keuze A of B (tonen op de site of alleen opslaan)
      en op een SQL-migratie die Giovanny draait.** Zie het actieplan.

### Bugs
- [x] C1. Dubbel icoontje op de kaartjes — **live**
      *(alleen bij buurtinitiatieven weggehaald; bij activiteiten is dit het
      enige icoon, dus daar blijft het staan)*
- [ ] C2. Nieuwe categorie toevoegen werkt niet *(wordt niet opgeslagen in de lijst)*
- [ ] C3. **Categorie hernoemen/verwijderen werkt niet door** naar buurtinitiatieven
      en activiteiten — *dit is de oorzaak van de eerdere crash*

### Overig
- [ ] D. Nieuwe categorielijst doorvoeren (7 categorieën)
      ⚠️ *pas ná C3, anders raken alle bestaande items hun categorie kwijt*
- [ ] Kapotte categoriewaarden in de database opschonen
      *(o.a. "Happy Feet" heeft een hele zin als categorie)*
- [ ] E. Teksten zelf beheerbaar maken voor Margareth *(grotere klus)*
- [ ] Gesprek over ontbrekende icoontjes — *ik lever vooraf een overzicht van
      alle beschikbare iconen aan*

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

1. **Kleine restjes:** B2 (WhatsApp-veld weg) — klein en direct zichtbaar.
2. **B4 afmaken:** keuze A/B maken, SQL draaien, veld aansluiten.
   Daarna B3 (dat vraagt dezelfde soort ingreep).
3. **Categorieblok:** C2 → C3 → D → opschonen kapotte waarden. Deze volgorde is
   belangrijk, anders dubbel werk.
4. **Besluit iDEAL:** zodra het Mollie-account er is.
5. **Rechten-audit** — laag zichtbaar, maar het gaat om persoonsgegevens.
6. **Snelheid** — begin met de vier kleine punten, de grote apart inplannen.
7. **Rest:** opruimen, E (teksten zelf beheerbaar maken).
