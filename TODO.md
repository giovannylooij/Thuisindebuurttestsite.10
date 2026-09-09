# To-do & stand van zaken — Thuis in de Buurt

*Bijgewerkt: 8 september 2026*

## Samenvatting

De website en het CMS draaien live en zijn stabiel. In de afgelopen periode zijn
vooral **structurele problemen** opgelost die niet zichtbaar waren maar wel echt
kapot: het domein zonder www werkte niet, CMS-wijzigingen aan het menu bereikten
de website nooit, en de site crashte op onbekende categoriewaarden.

Daarnaast liggen er nu **drie rapporten** klaar met uitgezocht werk:
opleverpunten, snelheid en Margareth's feedback (deel 1).

**Wat nu het meest urgent is:**
1. De categorieën goed regelen — dat blokkeert Margareth's nieuwe categorielijst
   én is de oorzaak van de crash van eerder.
2. De kleine tekst- en veldwijzigingen uit Margareth's rapport (snel af te ronden,
   direct zichtbaar voor haar).
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

## 🔶 Klaar, maar nog niet live

- [ ] **Nieuwe intro-tekst Buurtinitiatieven-pagina** — doorgevoerd en lokaal
      getest, staat nog ongecommit. *Alleen nog committen + pushen.*

---

## 📋 Margareth's opmerkingen deel 1

> Volledige uitwerking met code-locaties staat in `PLAN-OPMERKINGEN-DEEL1.md` (+ PDF).

### Tekstwijzigingen — snel af te ronden
- [x] A1. Intro-tekst Buurtinitiatieven-pagina *(zie hierboven, nog te pushen)*
- [ ] A2. Detailpagina: "Wil je aansluiten?" verwijst nu naar de Contact-tab,
      wordt: verwijzing naar het aanmeldformulier
- [ ] A3. Bevestigingstekst "Margareth (beheerder) ontvangt…" vervangen
      ⚠️ *besluit nodig: de nieuwe tekst belooft een bevestigingsmail die nog niet bestaat*
- [ ] A4. "Meld je buurtinitiatief aan" → "Meld jouw buurtinitiatief aan"

### Velden opschonen
- [ ] B1. Veld "Categorie" weg uit het publieke aanmeldformulier
      *(bewoners kiezen niet meer zelf; beheerder doet dit in het CMS)*
- [ ] B2. Veld "WhatsApp" weg uit het CMS *(is een lege huls, slaat niets op)*
- [ ] B3. "Wat" loskoppelen van "Categorie" *(zijn nu letterlijk hetzelfde veld)*
      — vraagt een kleine database-uitbreiding
- [ ] B4. "Uitgebreide omschrijving" weghalen en "Korte omschrijving" hernoemen
      naar "Omschrijving" *(het veld is nu een nep-editor zonder opslag)*

### Bugs
- [ ] C1. Dubbel icoontje op de kaartjes *(site voegt automatisch een tweede icoon toe)*
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

1. **Nu meteen:** de nieuwe intro-tekst pushen (staat klaar).
2. **Korte klus, veel waarde:** A2, A4, B1, B2, C1 — allemaal klein en direct
   zichtbaar voor Margareth. In één ronde te doen.
3. **Categorieblok:** C2 → C3 → D → opschonen kapotte waarden. Deze volgorde is
   belangrijk, anders dubbel werk.
4. **Besluit iDEAL:** zodra het Mollie-account er is.
5. **Rechten-audit** — laag zichtbaar, maar het gaat om persoonsgegevens.
6. **Snelheid** — begin met de vier kleine punten, de grote apart inplannen.
7. **Rest:** B3/B4, opruimen, E.
