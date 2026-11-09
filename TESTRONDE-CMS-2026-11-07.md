# Testronde CMS — 7 november 2026

Algemene doorlichting van app.thuisindebuurt.nl. **Er is niets verwijderd en
niets aangepast.** Alleen gelezen: de code van `beheer.html` en `bundle-src`,
en de database via alleen-lezen opvragingen.

**Wat ik niet heb kunnen testen:** alles waarvoor je moet inloggen. Ik heb geen
wachtwoord en vul er ook geen in. Ik heb dus geen knoppen ingedrukt in het CMS.
Wat hieronder staat komt uit de code en uit de database, niet uit klikken.

---

## Kort samengevat

| | |
|---|---|
| Schermen in het CMS | 25 |
| Daarvan die echt opslaan | 23 |
| **Schermen die "opgeslagen!" melden maar niets bewaren** | **2** |
| Rollen die kloppen | 2 van de 3 |
| Edge Functions bereikbaar | 3 van 3 |

Het CMS is in de kern gezond. Er zijn **drie echte fouten**, waarvan één
(de rol "beheerder") iemand volledig buitensluit.

---

## 1. Doneren & Boek bewaart niets — ERNSTIG

> **Opgelost op 8-11** (lokaal gebouwd en getest, nog niet gepusht). Het
> scherm schrijft nu naar `pagina_teksten`, net als Contact. Zie TODO.md,
> "Doneren & Boek werkt nu echt". Hieronder staat hoe het wás.

Het scherm **Doneren & Boek** slaat niets op in de database. Margareth krijgt
wel de melding *"Doneren-pagina opgeslagen!"*, maar zodra ze haar browser sluit
is de wijziging weg. Op de website is er nooit iets van te zien.

De opslaanknop doet dit:

```js
function saveDoneren() {
  DATA.doneren = { ...doText };      // alleen in het geheugen
  window.__syncToSite && window.__syncToSite();
  window.__showToast && window.__showToast('Doneren-pagina opgeslagen!');
}
```

`__syncToSite()` schrijft naar `localStorage` op **app**.thuisindebuurt.nl. De
website draait op **www**.thuisindebuurt.nl. Dat zijn voor de browser twee
losse opslagplaatsen die elkaar niet kunnen zien. Het enige dat hiermee wordt
bijgewerkt is het voorbeeldvenster ín het CMS — waardoor het lijkt alsof het
werkt.

**Welke velden dit raakt:**

| Veld op de doneerpagina | Opslag |
|---|---|
| Klein kopje ("Doneren") | database — werkt wel, via Pagina's |
| Titel ("De buurt mogelijk maken.") | database — werkt wel, via Pagina's |
| Inleidende tekst | database — werkt wel, via Pagina's |
| "Waar gaat uw hulp naartoe?" | **gaat verloren** |
| "Of bied steun door het kopen van het boek" | **gaat verloren** |
| Donatiebedragen (toevoegen/verwijderen) | **gaat verloren** |
| Alle teksten over het boek | **gaat verloren** |

Drie van de velden zijn dus wél te redden, maar niet via dit scherm: die moeten
via **Pagina's**. Dat is nergens aangegeven, dus niemand kan dat weten.

---

## 2. Buurtatlas bewaart het zoomniveau niet

Zelfde oorzaak, kleiner gevolg. Het enige dat dit scherm opslaat is het
standaard zoomniveau van de kaart, en dat gaat ook via `__syncToSite` — dus
alleen naar de browser van degene die het instelt.

De kaart zelf werkt gewoon: die haalt zijn stippen uit `clubjes`,
`activiteiten` en `partners`, en die tabellen zijn wel in orde.

---

## 3. De rol "beheerder" is onbruikbaar — ERNSTIG

Er zitten twee lijsten in de code die elkaar tegenspreken: één bepaalt wat
iemand in het menu *ziet*, de ander wat iemand *mag openen*. Voor de rol
beheerder lopen die uiteen.

Doorgerekend:

| Rol | Items in het menu | Doodlopend | Mag wel, maar staat niet in het menu |
|---|---|---|---|
| superadmin (Margareth) | 23 | 0 | Agenda, Buurtatlas |
| redactie | 21 | 0 | — |
| **beheerder** | **10** | **9** | **Bewonersinitiatieven** |

Een beheerder ziet dus tien menu-items, waarvan er negen bij aanklikken
"Je hebt geen toegang tot dit scherm" tonen: Pagina's, Doneren & Boek, Contact,
Aanmeldingen, Meedoen aanvragen, Bewonersinitiatief aanvragen, Meldingen,
Contact-berichten en Bestellingen.

En het enige scherm waar deze rol wél in mag — Bewonersinitiatieven, precies
waar de rol voor bedoeld is — is uit zijn menu verborgen. In de praktijk kan
een beheerder alleen het Dashboard gebruiken.

*Nieuwe gebruikers krijgen standaard de rol beheerder.* Wie Margareth nu
aanmaakt, kan dus niets.

**Nog uit te zoeken:** gebruik je de rol beheerder eigenlijk wel? Zo niet, dan
kan dit blijven staan. Zo ja, dan moeten die twee lijsten gelijkgetrokken.

---

## 4. Gaten in het wijzigingenlogboek

Het logboek is slim opgezet: de gedeelde opslagfuncties (`__supabaseUpsert`,
`__supabaseInsert`, `__supabaseDelete`) loggen vanzelf. Elk scherm dat die
gebruikt staat dus automatisch in Margareths overzicht.

> **Correctie 9-11.** Dit punt klopte maar deels. Bij het bouwen van de
> redactie-assistent bleek dat **Voorzieningen en Categorieën wél loggen** —
> die gebruiken `__logVooraf`, dat ik bij de eerste doorlichting over het
> hoofd heb gezien. Alleen **Huisstijl** schrijft er echt omheen.

Een aantal schermen schrijft rechtstreeks naar de database. Na natellen blijft
hiervan over:

| Scherm | Logt het? |
|---|---|
| Huisstijl | **nee** — alle kleuren van de site veranderen ongemerkt |
| Voorzieningen | ja, via `__logVooraf` |
| Categorieën | ja, via `__logVooraf` |
| Navigatie | ja |
| De zes Inzendingen-schermen | nee — afhandelen en verwijderen van inzendingen |

Dat Margareth niet ziet dat iemand de huisstijlkleuren heeft omgegooid, is het
vervelendst — juist dat valt op de site meteen op.

Voor de Inzendingen-schermen is het de vraag of je dat wilt loggen. Dat is
jouw keuze, geen fout.

---

## Wat wél goed werkt

Dit heb ik nagelopen en in orde bevonden:

**De website leest echt live uit de database.** Bij elke keer laden haalt
`index.html` veertien tabellen op bij Supabase. Een wijziging in het CMS is
dus meteen zichtbaar, zonder opnieuw bouwen. (Behalve bij de twee schermen
hierboven.)

**De oude Partners/Netwerken-fout is weg.** Beide schermen schrijven nu naar
hun eigen tabel, en de website leest die tabellen ook echt. Dat was eerder
niet zo.

**Alle 25 schermen bestaan en zijn bereikbaar** — menu en router kennen
precies dezelfde lijst, er zit geen scherm tussen dat nergens heen gaat.

**De drie Edge Functions draaien:**

| Functie | Antwoord | Betekenis |
|---|---|---|
| `betaling` | 400 | leeft en wijst een leeg verzoek netjes af |
| `betaling-webhook` | 200 | leeft, geeft OK zoals Mollie verwacht |
| `manage-users` | 401 | leeft, eist terecht een inlog |

**Lege velden wissen geen teksten.** Slaat iemand een leeg tekstveld op, dan
valt de site terug op de tekst uit de code in plaats van een lege plek te
tonen. Netjes opgelost.

**De iconenmap werkt:** 64 iconen staan klaar in de opslag.

**Gebruikersbeheer werkt** via de `manage-users` Edge Function, niet via een
losse tabel. Goed opgezet.

---

## Stand van de database

| Tabel | Rijen | |
|---|---|---|
| activiteiten | 19 | |
| site_navigatie | 13 | |
| clubjes | 8 | |
| categorieen | 8 | |
| pagina_teksten | 9 | |
| agenda | 5 | |
| nieuws | 4 | |
| partners | 4 | |
| netwerken | 2 | |
| contact_kaarten | 2 | |
| huisstijl_secties | 25 | |
| **voorzieningen** | **0** | Margareth moet de eerste nog invoeren |
| aanmeldingen | 0 | opgeruimd na de betaaltest |
| meldingen, contact_berichten, buurtgroep_aanvragen, boek_bestellingen | 0 | lege postvakken |

De tabel `huisstijl_instellingen` bestaat nog met één rij, maar wordt nergens
meer gelezen. Dat is bewust zo gelaten en geen probleem.

---

## Kleine dingen, geen haast

- `__supabaseBulkUpsert` staat in de code maar wordt nergens gebruikt.
- In `bundle-src/ui.jsx` wordt `_tibCms` twee keer achter elkaar aangemaakt;
  de eerste is dode code.
- Margareth ziet Agenda en Buurtatlas niet in haar menu, terwijl ze er wel in
  mag. Mogelijk expres — even bevestigen.

---

## Wat ik zou aanpakken, op volgorde

1. **Doneren & Boek laten opslaan in de database.** Nu denkt Margareth dat ze
   iets bewaart terwijl dat niet zo is. Dat is de ergste soort fout.
2. **De rol beheerder.** Eerst de vraag of je hem gebruikt; zo ja, de twee
   lijsten gelijktrekken.
3. **Logboek aanvullen** voor Huisstijl, Categorieën en Voorzieningen.
4. **Buurtatlas-zoom**, of die knop weghalen als het niemand iets kan schelen.

Niets hiervan is gebouwd of veranderd — dit is alleen de bevinding.
