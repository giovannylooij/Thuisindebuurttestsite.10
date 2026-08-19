# Snelheidsrapport — www.thuisindebuurt.nl (mobiel)

> Alleen onderzoek, niets aangepast. Gebaseerd op de PageSpeed Insights-meting
> die je aanleverde (mobiel, Moto G Power geëmuleerd, langzame 4G, 1 aug 2026
> 17:51) en op eigen inspectie van de bestanden in deze repo.

## De cijfers

| Categorie | Score |
|---|---|
| **Prestaties** | **28 / 100** |
| Toegankelijkheid | 94 |
| Praktische tips | 100 |
| SEO | 91 |

| Metric | Waarde | Richtlijn (goed) |
|---|---|---|
| First Contentful Paint | **14,6 s** | < 1,8 s |
| Largest Contentful Paint | **15,0 s** | < 2,5 s |
| Total Blocking Time | **1.700 ms** | < 200 ms |
| Cumulative Layout Shift | 0 | < 0,1 (dit is al goed) |
| Speed Index | 14,6 s | < 3,4 s |

Een bezoeker op een middenklasse Android-telefoon met een matige verbinding
ziet dus **15 seconden lang niets**, en de pagina reageert bijna 2 seconden
lang niet op input. Dit is een zeer laag scorende, dus goed te verbeteren
situatie — met één dominante hoofdoorzaak.

## Hoofdoorzaak: JSX wordt in de browser van elke bezoeker gecompileerd

Dit is verreweg de belangrijkste bevinding en verklaart bijna alle andere
meetpunten hieronder.

**Wat er gebeurt:** `index.html` bevat geen kant-en-klare, geoptimaliseerde
JavaScript. In plaats daarvan zit de **volledige Babel-compiler**
(`bundle-src/vendor-babel.js`, **3.137.752 bytes ongecomprimeerd** — groter dan
de rest van de hele site bij elkaar) ingebakken, gevolgd door alle 15
broncode-bestanden van de site als `<script type="text/babel">`
(`bundle-src/template.html:3160-3173`). Bij elk paginabezoek moet de browser:

1. Eerst ~3,1 MB Babel-compiler downloaden en uitvoeren,
2. daarmee **realtime** alle JSX-broncode (React, Buurtinitiatieven, Agenda,
   Detail, enz.) compileren naar bruikbare JavaScript,
3. en pas dán kan React beginnen met renderen.

Al deze scripts staan bovendien **in `<head>`, blokkerend, zonder `async`/
`defer`** (`bundle-src/template.html:3159-3160`: de scripts eindigen pas vlak
vóór `</head>`, `<body>` bevat alleen een lege `<div id="root">`). Niets wordt
getoond voordat dit hele proces klaar is.

**Dit verklaart rechtstreeks:**
- Verkort de JavaScript-uitvoeringstijd: **2,6 s**
- Primaire threadbewerkingen minimaliseren: **3,2 s**
- Beperk niet-gebruikt JavaScript: **2.145 KiB** geschatte besparing (bijna
  alles wat Babel zelf compileert, zoals TypeScript-achtige checks, JSX-
  runtime-hulpfuncties en niet-gebruikte polyfills, telt hierin mee)
- Verklein JavaScript: **559 KiB** geschatte besparing (Babel's eigen code +
  de ongecomprimeerde JSX-bronbestanden zijn nooit geminificeerd)
- Verzoeken voor renderblokkering: **1.070 ms** geschatte besparing
- Verouderde JavaScript-code: **42 KiB** (Babel compileert standaard naar
  brede/oude browsercompatibiliteit, ook voor moderne browsers die dat niet
  nodig hebben)
- 6 lange taken op de hoofdthread (het compileren zelf blokkeert de UI)

### Waarom dit zo gebouwd is (context, geen kritiek)
Deze aanpak (JSX + Babel rechtstreeks in de browser, zonder build-server)
maakt het mogelijk om de site te bewerken/previewen zonder een build-toolchain
te draaien — handig tijdens het maken/itereren. Maar dit is precies het patroon
waar de officiële React-documentatie zelf voor waarschuwt: Babel-standalone is
bedoeld voor demo's/prototypes, nadrukkelijk **niet voor productie**, omdat het
"aanzienlijk trager" is dan vooraf gecompileerde code.

## Overige, kleinere bevindingen

- **Geen cache-headers geconfigureerd** (`vercel.json` bevat alleen redirects,
  geen `headers`-sectie) → "Efficiënte levensduur voor het cachegeheugen
  gebruiken": 86 KiB geschatte besparing. Herhaalbezoekers downloaden nu
  waarschijnlijk vaker opnieuw dan nodig.
- **Afbeeldingen zonder expliciete `width`/`height`** → kleine kans op
  layout shift (CLS is nu toevallig nog 0, maar dit is fragiel) en een
  gemiste optimalisatie-kans (77 KiB geschatte besparing op
  afbeeldingslevering).
- **Geen meta-description** (`bundle-src/template.html` heeft wel `<title>`
  maar geen `<meta name="description">`) → beïnvloedt SEO-score (91/100) en
  hoe de site in zoekresultaten wordt getoond.
- **Verouderde/overbodige CSS**: 50 KiB niet-gebruikte CSS, 5 KiB te
  minificeren CSS — vermoedelijk restanten uit eerdere ontwerpiteraties in
  `template.html`'s ingebakken `<style>`.
- Toegankelijkheid (94) en Praktische tips (100) zijn al sterk; geen actie
  nodig, op een paar kleine ARIA/kop-volgorde-punten na.

## Voorgestelde aanpak, met geschatte impact en complexiteit

| # | Maatregel | Geschatte impact | Complexiteit |
|---|---|---|---|
| 1 | **JSX vooraf compileren** (bouwstap toevoegen die Babel *offline* laat draaien i.p.v. in de browser, en de output minificeren) — dit is de kern van het probleem | Zeer groot — dit raakt vrijwel alle metrics hierboven tegelijk; realistisch een sprong van 28 naar 70-90+ | **Groot** — vereist een build-proces (bv. esbuild/Vite) dat naast/i.p.v. het huidige `tools/tib-bundle.mjs` komt; raakt de manier waarop dit hele project wordt onderhouden en gedeployed |
| 2 | Scripts niet meer blokkerend in `<head>` laden (`defer`, of naar einde van `<body>` verplaatsen) | Middelgroot, op zichzelf al enkele honderden ms | Klein — mits punt 1 nog niet is gedaan, beperkt effect omdat Babel zelf nog steeds moet compileren vóór React kan starten |
| 3 | Cache-headers toevoegen in `vercel.json` voor statische assets | Klein-middelgroot, vooral voor herhaalbezoekers | Klein |
| 4 | Meta-description toevoegen aan `template.html` | Geen snelheidswinst, wel SEO | Zeer klein |
| 5 | Expliciete `width`/`height` op afbeeldingen, en moderne formaten (webp/avif) waar van toepassing | Klein | Klein-middel |
| 6 | Ongebruikte CSS opschonen in `template.html` | Klein | Klein-middel (vereist zorgvuldig testen — makkelijk om per ongeluk iets te breken dat ergens anders nog gebruikt wordt) |

**Belangrijke kanttekening bij punt 1:** dit is verreweg de grootste hefboom,
maar ook de enige maatregel die de kernarchitectuur van het project raakt (het
"bewerk direct de HTML, geen build-server nodig"-principe waar dit hele
project op gebouwd is, inclusief de bestaande `tools/tib-bundle.mjs`
encode/decode-workflow). Dit verdient een apart gesprek over hoe we dat
inpassen zonder de huidige werkwijze (rechtstreeks JSX-bestanden bewerken,
dan encoden) te breken — vandaar dat ik dit nu alleen in kaart breng en niet
alvast bouw.

## Aanbevolen volgorde
1. **Punt 4 (meta-description)** — triviaal, geen risico, doe het gewoon.
2. **Punt 3 (cache-headers)** — klein, veilig, snel te doen.
3. **Punt 5 (afbeeldingen)** — klein, veilig.
4. **Punt 2 (scripts niet-blokkerend)** — kleine losse verbetering, maar het
   echte effect zit vast aan punt 1.
5. **Punt 1 (build-stap voor JSX)** — de grote klus. Dit wil je waarschijnlijk
   los plannen, met een duidelijk beeld van hoe dat de dagelijkse
   bewerk-workflow (JSX aanpassen → site zien veranderen) blijft werken.
6. **Punt 6 (CSS opschonen)** — laatste, want het makkelijkst om per ongeluk
   iets te breken; wil je pas doen als de rest al stabiel staat.

## Openstaande vraag voor Giovanny
Wil je voor punt 1 een volledige overstap naar een echte build-tool (bv. Vite)
die ook meteen de bestaande `tools/tib-bundle.mjs`-workflow vervangt, of liever
een kleinere tussenstap (Babel offline laten compileren als extra stap in het
bestaande encode-script, zodat de dagelijkse workflow van "JSX bewerken →
`node tools/tib-bundle.mjs encode`" verder ongewijzigd blijft)?
