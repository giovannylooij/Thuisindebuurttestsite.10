# Actieplan — Opmerkingen website deel 1: Buurtinitiatieven

> Op basis van het document "Opmerkingen website, deel 1 - Buurtinitiatieven.docx"
> (feedback van Margareth). Alles hieronder is teruggezocht in de code; per punt
> staat het exacte bestand en regelnummer. **Nog niets uitgevoerd** — dit is het plan.
>
> Let op: `bundle-src/*.jsx` = bron van de website. Na elke wijziging daar moet
> `node tools/tib-bundle.mjs encode` draaien om `index.html` opnieuw te bouwen.
> `beheer.html` (het CMS) heeft die bouwstap niet nodig.

---

## A. Tekstwijzigingen (klein, geen risico)

### A1. Intro-tekst Buurtinitiatieven-pagina
**Nu:** [`bundle-src/clubjes.jsx:333`](bundle-src/clubjes.jsx#L333)
> "Een buurtinitiatief komt uit de buurt zelf: bewoners die samen iets starten en aanleveren bij Thuis in de Buurt…"

**Wordt:** de nieuwe tekst uit het document (twee alinea's, met verwijzing naar de groene knop).

**Let op:** dezelfde zin staat óók op de homepage ([`bundle-src/home.jsx:174`](bundle-src/home.jsx#L174)), in verkorte vorm. Even afstemmen of die ook mee moet.

**Complexiteit:** Simpel.

### A2. Tekst op de detailpagina van een buurtinitiatief
**Nu:** [`bundle-src/detail.jsx:291`](bundle-src/detail.jsx#L291)
> "Wil je aansluiten? Klik op de tab 'Contact' voor de contactgegevens. Geen verplichtingen — kom een keer kijken…"

**Wordt:** "Wil je aansluiten bij deze activiteit? Vul dan je gegevens hieronder in en klik op 'Aanmelden'. Wil je eerst meer informatie? Klik op de tab 'Contact' voor de contactgegevens."

**Let op:** de huidige tekst heeft een variant voor als de Contact-tab níet zichtbaar is ("Neem contact op met de organisator"). Die logica moet blijven werken: als de beheerder de Contact-tab uitzet, mag de nieuwe tekst niet naar een niet-bestaande tab verwijzen.

**Complexiteit:** Simpel.

### A3. Bevestigingstekst in het aanmeldformulier
**Nu:** [`bundle-src/clubjes.jsx:189`](bundle-src/clubjes.jsx#L189)
> "Margareth (beheerder) ontvangt je aanmelding en plaatst het buurtinitiatief binnen een paar dagen op de site…"

**Wordt:** "Na ontvangst van jouw aanmelding wordt jouw buurtinitiatief binnen een paar dagen op de website geplaatst. Je ontvangt een bevestiging per e-mail."

**Let op ⚠️:** de nieuwe tekst belooft een **bevestigingsmail**. Die wordt op dit moment **niet verstuurd** — het formulier schrijft alleen een rij in de tabel `buurtgroep_aanvragen` ([`clubjes.jsx:164-174`](bundle-src/clubjes.jsx#L164)). Of we plaatsen die belofte niet, of er moet een automatische e-mail bij gebouwd worden (los klusje, zie openstaande vragen).

**Complexiteit:** Simpel (tekst) / Gemiddeld (als de bevestigingsmail er echt moet komen).

### A4. "Meld je buurtinitiatief aan" → "Meld jouw buurtinitiatief aan"
**Nu:** [`bundle-src/clubjes.jsx:187`](bundle-src/clubjes.jsx#L187) (kop van het formulier).
De knop op de pagina zelf ([`clubjes.jsx:375`](bundle-src/clubjes.jsx#L375)) gebruikt al een variabele die "je/jouw" volgt uit de tone-of-voice-instelling.

**Ook een antwoord op haar vraag over de knop:** het "+"-teken is puur decoratief (net als bij "+ Nieuw item"-knoppen in het CMS); de knop opent het aanmeldformulier waarin een bewoner zijn buurtinitiatief kan indienen. Die aanmelding komt in het CMS binnen onder **Inzendingen → Buurtinitiatief aanvragen**, en wordt pas zichtbaar op de site nadat de beheerder hem daar overneemt.

**Complexiteit:** Simpel.

---

## B. Velden weghalen / ontkoppelen in de formulieren

### B1. Veld "Categorie" uit het publieke aanmeldformulier
**Nu:** [`bundle-src/clubjes.jsx:203-207`](bundle-src/clubjes.jsx#L203) — verplichte dropdown. De waarde gaat mee naar de kolom `categorie` in `buurtgroep_aanvragen` ([`clubjes.jsx:166`](bundle-src/clubjes.jsx#L166)).

**Aanpak:** veld uit het formulier halen en bij het opslaan `categorie` leeg (`null`) meesturen; de beheerder kiest de categorie later zelf in het CMS.

**Te checken vooraf:** of de kolom `categorie` in `buurtgroep_aanvragen` leeg mag zijn (NOT NULL-constraint). Zo niet: lege string meesturen of de kolom aanpassen. **[aanname: niet te zien vanuit de code, alleen in Supabase]**

**Complexiteit:** Simpel.

### B2. Veld "WhatsApp" uit het CMS-formulier
**Nu:** [`beheer.html:2052`](beheer.html#L2052) — `<Field label="WhatsApp (optioneel)"><input type="tel" /></Field>`

**Bevinding:** dit veld is een **lege huls** — het heeft geen koppeling aan de opslag (geen `value`/`onChange`), wordt dus nooit bewaard en er is nergens in de website-code iets dat WhatsApp toont. Dat verklaart precies wat Margareth zag: ze vult het in, en er gebeurt niets mee.

**Aanpak:** veld verwijderen. Geen dataverlies mogelijk, want er is nooit iets in opgeslagen.

**Complexiteit:** Simpel.

### B3. "Wat" ontkoppelen van "Categorie"
**Nu:** [`beheer.html:2024`](beheer.html#L2024)
```jsx
<Field label="Wat"><input type="text" value={fd.categorie} onChange={e => up('categorie', e.target.value)} /></Field>
```
"Wat" is dus **letterlijk hetzelfde veld** als Categorie — twee labels, één waarde. Typen in het ene verandert het andere.

**Aanpak:** "Wat" een eigen veld geven (bijv. `fd.wat`) met vrije tekst.

**Te regelen:** de tabel `clubjes` heeft nu **geen** aparte kolom hiervoor — er moet een kolom `wat` bij (kleine SQL-migratie, in dezelfde stijl als `sql/activiteiten_locatie.sql`). Daarna moet de website die tonen in het "Wat"-blokje in plaats van de categorie.

**Complexiteit:** Gemiddeld (kolom + CMS + weergave op de site).

### B4. "Uitgebreide omschrijving" volledig vrij maken en hernoemen naar "Omschrijving"
**Nu:** [`beheer.html:2001-2016`](beheer.html#L2001) — dit is een **nep-tekstverwerker**: een `contentEditable`-blok met vaste sjabloontekst die `{fd.naam}` en `{fd.categorie}` invult:
> "Bij **[naam]** kom je samen met buurtgenoten om [categorie] te beoefenen in een ontspannen sfeer."

Er zit **geen opslag achter**: wat je erin typt wordt nergens bewaard en verschijnt nergens op de website. Dat bevestigt haar vermoeden ("die tekst is toch nergens zichtbaar op de website, toch?") — klopt.

**Besluit Giovanny (9 sep 2026):** het moet een écht vrij tekstveld worden — dus
niet weghalen. Uitgewerkt en klaargezet, wacht nog op één keuze (zie onder).

#### Wat er precies nodig is

**1. Nieuwe kolom in de database.** Ik heb de tabel `clubjes` opgevraagd; de
kolommen zijn: `id, naam, categorie, wijk, omschrijving, voor_wie, waar,
wanneer, kosten, contact, email, telefoon, foto_url, lat, lng, status,
uitgelicht, leden, aangemaakt_op, contact_zichtbaar, beheerder_user_id,
icoon_url, icoon_label`. Er is dus **geen** kolom voor een uitgebreide
omschrijving — `omschrijving` is de korte die op de kaartjes en de detailpagina
staat. Er moet een kolom bij (bijv. `uitgebreide_omschrijving`, type text).
Kleine SQL-migratie die Giovanny één keer in Supabase draait, zoals bij
`site_navigatie`.

**2. Het veld echt aansluiten** in het CMS: sjabloontekst eruit, leeg beginnen,
waarde in de state bijhouden en meesturen bij Opslaan.

**3. Schijn-tekstverwerker vervangen door een gewoon meerregelig tekstvak.**
De knoppen (vet, cursief, lijst, link, afbeelding) doen nu niets blijvends. Ze
wél laten werken betekent opgemaakte HTML opslaan en die op de site tonen —
dat vraagt ontsmetting van de invoer, anders kan er via dat veld code op de
site terechtkomen. Advies: gewoon vrije tekst. Vet/cursief is desgewenst een
aparte, zorgvuldige klus.

#### Openstaande keuze: wel of niet tonen op de site

Margareth vraagt zelf: *"Die tekst is toch nergens zichtbaar op de website,
toch?"* — dat klopt nu. Maar opslaan zonder tonen betekent dat ze een verhaal
typt dat niemand ziet.

Op de detailpagina staat onder **"Over [naam]"** nu alleen de korte
omschrijving (bij de Wijkborrel één zin) — daar is ruimte voor meer.

- **A (advies):** opslaan én tonen op de detailpagina, onder de korte
  omschrijving. Het veld doet dan wat het belooft en detailpagina's worden
  inhoudelijker.
- **B:** alleen opslaan, niet tonen — wordt een intern notitieveld.

**Complexiteit:** Gemiddeld (kolom + CMS + weergave op de site).

---

## C. Echte bugs

### C1. Dubbel icoontje op de kaartjes
**Oorzaak gevonden:** [`bundle-src/clubjes.jsx:402`](bundle-src/clubjes.jsx#L402)
```jsx
<h3 …>{window.getActivityIconJSX && window.getActivityIconJSX(c.name)}<span>{c.name}</span></h3>
```
Naast het icoon dat de beheerder zelf kiest (getoond op [`clubjes.jsx:390-393`](bundle-src/clubjes.jsx#L390)) zet de site er **automatisch nog een icoon bij**, afgeleid uit de náám van het initiatief via trefwoorden ([`bundle-src/ui.jsx:622`](bundle-src/ui.jsx#L622): 'schaak' → paardje, 'wandel' → schoen, enz.). Vandaar twee iconen.

**Aanpak:** de automatische `getActivityIconJSX`-aanroep weghalen uit de kaart-kop.

**Let op:** exact dezelfde constructie staat ook bij activiteiten ([`bundle-src/other.jsx:356`](bundle-src/other.jsx#L356)) — waarschijnlijk daar ook weghalen, even bevestigen.

**Complexiteit:** Simpel.

### C2. Nieuwe categorie toevoegen werkt niet goed
**Oorzaak gevonden:** [`beheer.html:1774+`](beheer.html#L1774), component `CategorieSelect`.
- De dropdown wordt gevuld uit de tabel `categorieen`.
- Typ je een categorie die daar niet in staat, dan schakelt hij over naar een vrij tekstveld met een ×-knop.
- **Die nieuw getypte categorie wordt alleen op dat ene buurtinitiatief gezet — er wordt géén rij toegevoegd aan de tabel `categorieen`.**

Daardoor: de nieuwe categorie verschijnt niet bij andere buurtinitiatieven, en als je het item opnieuw opent staat de waarde weer als "vrije tekst" met een ×-je (want hij zit nog steeds niet in de officiële lijst). Precies wat ze beschrijft.

**Aanpak (twee smaken):**
1. **Simpel + veilig:** het vrije-tekstveld helemaal weghalen uit `CategorieSelect`, zodat je in het buurtinitiatief-formulier alléén uit bestaande categorieën kunt kiezen. Nieuwe categorieën maak je aan in het scherm **Categorieën**. Sluit aan bij haar eigen wens ("ik kies zelf de categorie, wordt anders chaos").
2. **Uitgebreider:** bij het typen van een nieuwe categorie ook echt een rij aanmaken in `categorieen`.

**Advies:** optie 1 — minder kans op rommelige categorieën, en het lost meteen het probleem op dat verderop (C3) beschreven staat.

**Complexiteit:** Simpel (optie 1) / Gemiddeld (optie 2).

### C3. Categorie hernoemen of verwijderen werkt niet door (antwoord op haar vraag)
**Antwoord: nee, dat gebeurt nu niet — en dit is dezelfde oorzaak als de crash van vandaag.**

**Bevinding:** buurtinitiatieven en activiteiten bewaren hun categorie als **losse tekst** (kolom `categorie` met bijv. de tekst "Sociaal"), niet als verwijzing naar een rij in `categorieen`. Gevolg:
- **Hernoemen** ([`beheer.html:3895`](beheer.html#L3895), `saveEdit`): werkt alleen de `categorieen`-tabel bij. Alle buurtinitiatieven/activiteiten blijven de óúde naam bevatten en raken los van de lijst.
- **Verwijderen** ([`beheer.html:3923`](beheer.html#L3923), `handleDelete`): telt hoeveel buurtinitiatieven de categorie gebruiken en waarschuwt, maar verwijdert 'm daarna toch — de items blijven achter met een categorie die niet meer bestaat. (Terzijde: die telling kijkt alleen naar `clubjes`, **niet** naar `activiteiten`.)

Dit is exact het mechanisme achter de storing van vandaag: items met een categorie die nergens meer op matchte lieten de pagina crashen. De crash zelf is al afgevangen (commit `54b60f7`), maar de **oorzaak** — losse tekst in plaats van een echte koppeling — staat nog open.

**Aanpak (in volgorde van grondigheid):**
1. **Minimaal:** bij hernoemen automatisch alle `clubjes` én `activiteiten` met de oude naam meeschrijven naar de nieuwe naam. Bij verwijderen: waarschuwing uitbreiden naar activiteiten, en de betrokken items op een neutrale categorie zetten.
2. **Grondig:** overstappen op een echte koppeling (`categorie_id` als verwijzing naar `categorieen.id`), zodat hernoemen automatisch overal doorwerkt en verwijderen geen wezen meer achterlaat. Dit is een datamigratie en raakt meerdere schermen.

**Advies:** begin met 1 (lost haar praktische probleem op), en houd 2 als aparte, later in te plannen opruimactie.

**Complexiteit:** Gemiddeld (optie 1) / Complex (optie 2).

---

## D. Nieuwe categorielijst

Gewenst voor zowel Buurtinitiatieven als Activiteiten:
Eten · Ontmoeting/Sociaal · Sport en Bewegen · Spel · Lezen, Schrijven en Vertellen · Kunst en Cultuur · Evenement/Festival

**Huidige situatie:** de tabel `categorieen` bevat nu 5 rijen (Buiten, Cultuur, Lezen & leren, Sociaal, Sport).

**Aanpak:** dit kan Margareth in principe zelf via het scherm **Categorieën** (aanmaken werkt daar wél goed). Maar: zolang C3 niet is opgelost, betekent hernoemen/verwijderen van de oude categorieën dat bestaande buurtinitiatieven en activiteiten hun categorie kwijtraken.

**Daarom de volgorde:** eerst C3 (punt 1 daarvan) fixen, dán de categorielijst omzetten — anders moeten alle bestaande items daarna met de hand opnieuw ingedeeld worden.

**Extra aandachtspunt:** er staan op dit moment al een paar items met een kapotte categoriewaarde (bijv. "Happy Feet" heeft letterlijk `klein-ommetje-of-stevige-wandeling` als categorie). Die moeten sowieso een keer rechtgezet worden — handig om in dezelfde slag mee te nemen.

**Complexiteit:** Simpel (lijst zelf) — maar afhankelijk van C3.

---

## E. Haar vraag: "Kan ik deze teksten later zelf aanpassen?"

**Antwoord: nu niet.** De teksten uit A1–A4 staan vast in de broncode van de website. Het CMS heeft geen scherm waarin pagina-teksten van de Buurtinitiatieven-pagina te bewerken zijn (het scherm "Pagina's" gaat alleen over titel, URL en zichtbaarheid in het menu).

Er ís een scherm "Contact" waarin wél teksten staan, maar dat slaat op dezelfde manier op als het navigatiemenu vroeger deed — die wijzigingen bereiken de live site niet (zie het eerdere navigatie-onderzoek). Zou je willen dat Margareth deze teksten zelf beheert, dan is dat een aparte klus in dezelfde stijl als de navigatie-fix: een tabel in Supabase + een klein bewerkscherm.

**Complexiteit:** Gemiddeld, aparte klus.

---

## Aanbevolen volgorde

1. **A1–A4 + B1 + B2 (teksten en dode velden).** Klein, veilig, direct zichtbaar resultaat voor Margareth. In één ronde te doen. *(Wel eerst besluiten over de bevestigingsmail bij A3.)*
2. **C1 (dubbel icoontje).** Eén regel, direct zichtbaar.
3. **C2 (nieuwe categorie via vrij tekstveld uitzetten).** Voorkomt dat er ondertussen nieuwe rommel bij komt.
4. **C3 optie 1 (hernoemen/verwijderen laten doorwerken).** Randvoorwaarde voor de volgende stap.
5. **D (nieuwe categorielijst doorvoeren) + kapotte categoriewaarden opschonen.** Pas ná stap 4, anders dubbel werk.
6. **B3 + B4 ("Wat" en "Omschrijving" ontkoppelen).** Vraagt een kleine SQL-migratie; los in te plannen.
7. **E (teksten zelf beheerbaar maken).** Grootste klus, alleen als Margareth dit echt wil.

---

## Openstaande punten — met voorstel

Deze staan nog open. Per punt staat mijn voorstel erbij; als je het ermee eens
bent hoef je alleen "akkoord" te zeggen, anders geef je een andere richting.

### 1. Homepage-tekst (bij A1)
**Vraag:** moet de verkorte intro-tekst op de homepage ook mee veranderen?

**Voorstel: nee, homepage laten staan.** De nieuwe tekst van Margareth is
geschreven vóór de Buurtinitiatieven-pagina en verwijst naar "de groene knop
hieronder" — die knop staat niet op de homepage. De kortere, wervende variant
past daar beter als opstapje naar de pagina zelf.

### 2. Bevestigingsmail (bij A3)
**Vraag:** de nieuwe tekst belooft "Je ontvangt een bevestiging per e-mail",
maar die mail wordt nu niet verstuurd.

**Voorstel: de belofte voorlopig uit de tekst laten**, dus:
> "Na ontvangst van jouw aanmelding wordt jouw buurtinitiatief binnen een paar
> dagen op de website geplaatst."

Iets beloven wat niet gebeurt levert vragen en wantrouwen op bij bewoners. De
bevestigingsmail apart inplannen (vraagt een e-mailkoppeling, zie ook het punt
over Resend in de bredere lijst) en de zin toevoegen zodra die er echt is.

### 3. "Uitgebreide omschrijving" (bij B4)
**Vraag:** weghalen of er een echt werkend veld van maken?

**Voorstel: weghalen**, en het bestaande, wél werkende veld "Korte omschrijving"
hernoemen naar gewoon **"Omschrijving"**. Dat is precies wat Margareth vraagt
(één vrij tekstveld) zonder nieuwe kolom of extra plek op de site. Blijkt later
dat er behoefte is aan een langer verhaal per buurtinitiatief, dan bouwen we dat
er alsnog bij — dan weten we ook meteen wáár op de pagina het moet komen.

### 4. Automatisch icoontje bij activiteiten (bij C1)
**Vraag:** ook weghalen bij activiteiten, of alleen bij buurtinitiatieven?

**Voorstel: ook bij activiteiten weghalen.** Het is exact dezelfde constructie
([`other.jsx:356`](bundle-src/other.jsx#L356)) en dus hetzelfde dubbele-icoon-
effect zodra daar een eigen icoon gekozen wordt. Eén consistente regel — het
icoon dat de beheerder kiest is leidend — is ook makkelijker uit te leggen.

### 5. Categorie alleen nog kiezen uit de lijst (bij C2)
**Vraag:** akkoord dat er in het buurtinitiatief-formulier niet meer vrij
getypt kan worden?

**Voorstel: ja, vrij typen eruit.** Dit sluit aan bij haar eigen argument
("bewoners mogen dat liever niet zelf doen, wordt chaos"), voorkomt dat er
ongemerkt nieuwe categorieën ontstaan die nergens in de lijst staan, en het is
meteen de bron van de rommelige waarden die nu in de database staan. Nieuwe
categorieën maak je dan bewust aan in het scherm **Categorieën**.

### 6. Hoe voeren we de nieuwe categorielijst door? (bij D)
**Vraag:** de 5 bestaande hernoemen, of verwijderen en 7 nieuwe aanmaken?

**Voorstel: zoveel mogelijk hernoemen**, want dan houden bestaande
buurtinitiatieven en activiteiten automatisch hun indeling (mits C3 eerst is
gefixt). Voorgestelde omzetting:

| Huidig | Wordt |
|---|---|
| Sociaal | Ontmoeting/Sociaal |
| Sport | Sport en Bewegen |
| Cultuur | Kunst en Cultuur |
| Lezen & leren | Lezen, Schrijven en Vertellen |
| Buiten | *(geen tegenhanger — zie hieronder)* |
| — | Eten *(nieuw)* |
| — | Spel *(nieuw)* |
| — | Evenement/Festival *(nieuw)* |

**Aandachtspunt:** de nieuwe lijst heeft geen equivalent voor **"Buiten"**,
terwijl daar nu wel items in zitten (o.a. wandelinitiatieven). Die moeten
handmatig een nieuwe categorie krijgen — waarschijnlijk "Sport en Bewegen" of
"Ontmoeting/Sociaal". Dat is een inhoudelijke keuze; het is het handigst als
Margareth die items zelf even langsloopt, of dat we samen een standaardkeuze
afspreken.

### 7. Ontbrekende icoontjes
Margareth schrijft dat ze "wat handige icoontjes mist" en het daar graag over
wil hebben.

**Voorstel:** ik draai vóór dat gesprek een overzicht uit van álle iconen die nu
beschikbaar zijn (naam + plaatje), zodat zij concreet kan aanwijzen wat er
ontbreekt in plaats van uit het hoofd te moeten bedenken. Daarna is aanvullen
een kleine klus.
