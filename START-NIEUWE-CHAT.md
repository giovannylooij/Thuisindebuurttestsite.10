# Startprompt voor een nieuwe chat — Thuis in de Buurt

*Bijgewerkt: 10 november 2026. Plak dit hele bestand in een nieuwe chat.*

---

Je werkt aan **Thuis in de Buurt**: een buurtwebsite voor Noordelijk
Scheveningen met een eigen beheerpaneel. Ik ben Giovanny (Gio), de bouwer.
**Margareth** is de beheerder: zij vult de site, is geen techneut, en alles
wat je maakt moet voor haar te begrijpen zijn.

Projectmap: `/Users/g/Desktop/Thuisindebuurttestsite.10`

## Werkafspraken — hier wijk je niet van af

1. **Maak eerst een backup** voordat je iets wijzigt, in `backups/` op mijn
   laptop. Niets verwijderen zonder dat ik het vraag.
2. **Bouwen en testen, dan pas pushen.** Pushen doe je alleen als ík het zeg,
   nooit uit eigen beweging.
3. **Na elke push live controleren**, op www.thuisindebuurt.nl én op
   app.thuisindebuurt.nl. Niet alleen lokaal.
4. **Controleer je eigen werk** (staat ook in CLAUDE.md): na elke
   bestandswijziging het bestand opnieuw uitlezen en vergelijken met wat je
   bedoelde. Pas daarna zeggen dat iets klaar is. "Klaar" zonder die controle
   is niet toegestaan.
5. **Wachtwoorden en sleutels:** de Mollie-sleutel staat alleen als Supabase-
   secret `MOLLIE_API_KEY`, nooit in een bestand, nooit in de chat, nooit in
   git. Log niet in op app.thuisindebuurt.nl — dat is een productieomgeving;
   vul daar nooit een wachtwoord in. Testen doe je lokaal.
6. **Zeg eerlijk wat je niet hebt getest.** Liever "dit kon ik niet
   controleren" dan een aanname die als feit klinkt.

## Hoe het in elkaar zit

| | |
|---|---|
| Website | `index.html` — React met Babel in de browser, alle code zit gezipt in dat ene bestand |
| Bronbestanden site | `bundle-src/*.jsx` — **staan in .gitignore**, alleen `index.html` gaat mee in git |
| Bouwen | `node tools/tib-bundle.mjs encode` — verplicht na elke wijziging in `bundle-src/` |
| Controleren | `node tools/tib-check.mjs` — controleert de JSX én of er dubbele namen tussen bestanden zijn (dat laatste legde ooit de hele site plat) |
| CMS | `beheer.html` — één bestand van ~9.900 regels, één groot `<script type="text/babel">` |
| Database | Supabase, project `bxklumejqczcmhrpzstt` |
| Hosting | Vercel, deploy start vanzelf na een push en duurt een minuut of twee |
| Versie | Een git-hook verhoogt het versienummer in `beheer.html` bij elke commit |

De site leest bij elke keer laden rechtstreeks uit Supabase (bootstrap boven
in `index.html`). Een wijziging in het CMS is dus meteen zichtbaar, zonder
opnieuw bouwen — behalve als je de code zelf aanpast.

**Let op bij het CMS en de site:** die draaien op verschillende adressen
(app. en www.) en delen dus géén localStorage. Alles wat alleen in
localStorage wordt bewaard, bereikt de website nooit. Dat is hier al een paar
keer de oorzaak van "het slaat niet op" geweest.

### Testen zonder in te loggen

Voor het CMS gebruik ik een lokale testkopie met een nep-Supabase ervoor, zodat
je alle schermen kunt doorklikken zonder wachtwoord en zonder de echte database
aan te raken. De opzet staat in de scratchpad-map van de sessie; vraag erom en
ik lever hem aan, of bouw hem opnieuw: kopieer `beheer.html`, zet vóór het
`<script type="text/babel">` een stub die `window.supabase` vervangt (met
`auth.getSession` die een nepsessie teruggeeft en een `from()` die schrijfacties
alleen opschrijft in `window.__TIB_TEST.acties`), en serveer dat met een eigen
server met no-cache headers.

Vul die stub met de **echte rijen** uit de database (ophalen met de publieke
sleutel uit `index.html`, regel 327). Met verzonnen gegevens mis je fouten —
zo bleef een kapot nieuwsscherm lang onopgemerkt.

## Waar we nu staan

Live: **versie 1.0.256**.

**Recent af en live:** de rol Redactie-assistent werkt helemaal — eigen
bewonersinitiatieven, activiteiten, voorzieningen, nieuws en netwerken
aanmaken, bewerken, publiceren en overdragen aan Margareth, en niemand ziet
elkaars werk. Er is ook een handleiding met schermafdrukken
(Handleiding-redactie-assistent.pdf). Verder: de doneerpagina slaat echt op, tooltips op alle knoppen,
Contact verhuisd naar Pagina's, voorvertoning gaat naar het item zelf
(`?pagina=` en `?id=`), één duidelijke publicatieknop, buurtatlas met
gegroepeerde stippen en de wijkgrens in huisstijlgroen, en nieuwsberichten
komen eindelijk op de website.

**Twee dingen om te weten bij dit onderwerp:**

1. **Overdragen gaat via een functie in de database**, niet via een gewone
   wijziging: `public.tib_draag_over(tabel, id)`, zie `sql/overdragen-functie.sql`.
   Een gewone wijziging werd geweigerd, en dat is geen fout in de regels: de
   database staat niet toe dat iemand een rij zo aanpast dat hij hem daarna
   zelf niet meer mag zien — en dat is precies wat overdragen doet. De
   leesregel willen we houden zoals hij is (assistenten zien elkaars werk
   niet), dus doet die functie de controle zelf.
2. **Nieuwe tabellen krijgen in dit project automatisch RLS.** Maak je er een
   aan om iets uit te zoeken, zet die dan uit, anders kun je er zelf niet in
   schrijven.

**Openstaand bij Gio:**
1. Armando aanmaken als Redactie-assistent en samen natesten.
2. `public/iconen/overig.png` uploaden in de Mediabibliotheek, en het kapotte
   `muziek-noot.png` weggooien in Supabase → Storage → icons.
3. Uitzoeken wie er nog op de rol "beheerder" staat — die rol loopt op negen
   van de tien schermen dood.

**Groter werk dat nog wacht:** rechten-audit op de hele database
(`sql/rls_audit.sql`); Mollie-betaling aanzetten (wacht op een eigen
websiteprofiel en op een bevestigingsmail — e-mail zit nergens in het
project); de rol "beheerder" is onbruikbaar; Huisstijl schrijft om het
wijzigingenlogboek heen; de zoomstand van de Buurtatlas slaat niet op.

Lees `TODO.md` voor de volledige stand van zaken en
`TESTRONDE-CMS-2026-11-07.md` voor de doorlichting van het CMS.

## Hoe ik wil dat je werkt

- **Nederlands**, gewone woorden. Geen jargon waar een gewoon woord bestaat.
- Zeg wat er *werkelijk* is gebeurd. Werkt iets niet, zeg dat dan, ook als ik
  net iets anders hoopte.
- Vind je onderweg een andere fout, meld hem — dat is vaker gebeurd dan dat
  de oorspronkelijke vraag het echte probleem was.
- Zet commentaar in de code in het Nederlands, met de reden erbij, zodat
  duidelijk blijft waarom iets zo is.
- Doe grondig werk, maar overleg bij keuzes die ik moet maken in plaats van
  er zelf een te verzinnen.
