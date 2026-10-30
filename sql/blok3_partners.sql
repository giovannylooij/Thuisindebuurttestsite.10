-- Blok 3 — Partners-scherm werkend maken (30-10-2026)
--
-- Wat er misging (nagekeken in de code en de database):
--   1. Het CMS toont bij élke partner "Verborgen". Het scherm kijkt naar een
--      veld `zichtbaar`, maar de tabel heeft `actief`. Dat veld bestaat niet,
--      dus leest het scherm "leeg" en dat toont hij als verborgen.
--   2. Opslaan mislukt. Het scherm stuurt `zichtbaar`, `contact` en `email`
--      mee; geen van drieën bestaat in de tabel, dus de database weigert
--      de hele rij.
--   3. En zelfs als het was opgeslagen: de Partners-pagina op de site staat
--      vast in de code. De vier partners met hun teksten staan letterlijk in
--      het bestand. Het CMS-scherm stuurde dus sowieso niets aan.
--
-- Dit script voegt de ontbrekende kolommen toe en zet de teksten die nu in de
-- code staan in de database, zodat de pagina er precies hetzelfde uitziet maar
-- vanaf nu wél door Margareth te beheren is.
--
-- Er wordt niets verwijderd. Veilig om twee keer te draaien.

-- 1. Ontbrekende kolommen
alter table partners add column if not exists contact    text;
alter table partners add column if not exists email      text;
alter table partners add column if not exists slug       text;
alter table partners add column if not exists korte_naam text;
alter table partners add column if not exists subtitel   text;
alter table partners add column if not exists volgorde   integer;

-- 2. De teksten die nu in de website-code staan, naar de database.
--    `coalesce` zorgt dat een al ingevulde waarde blijft staan.
update partners set
  slug       = coalesce(slug, 'bns'),
  korte_naam = coalesce(korte_naam, 'BNS'),
  subtitel   = coalesce(subtitel, 'Bewonersvereniging Noordelijk Scheveningen'),
  website    = coalesce(website, 'bnsscheveningen.nl'),
  volgorde   = coalesce(volgorde, 1),
  omschrijving = coalesce(omschrijving, 'Behartigt de belangen van bewoners van Noordelijk Scheveningen — overleg met gemeente, ruimtelijke ordening, leefbaarheid.')
where naam ilike 'BNS%';

update partners set
  slug       = coalesce(slug, 'bibliotheek'),
  korte_naam = coalesce(korte_naam, 'Bibliotheek'),
  subtitel   = coalesce(subtitel, 'Bibliotheek Den Haag'),
  website    = coalesce(website, 'bibliotheekdenhaag.nl'),
  volgorde   = coalesce(volgorde, 2),
  omschrijving = coalesce(omschrijving, 'Onderdeel van Bibliotheek Den Haag. Locatie voor lezen, leren, ontmoeten en veel TIB-activiteiten.')
where naam ilike 'Bibliotheek%';

update partners set
  slug       = coalesce(slug, 'ichthus'),
  korte_naam = coalesce(korte_naam, 'Ichthus'),
  subtitel   = coalesce(subtitel, 'Buurtcentrum & ontmoeting'),
  website    = coalesce(website, 'ichthusscheveningen.nl'),
  volgorde   = coalesce(volgorde, 3),
  omschrijving = coalesce(omschrijving, 'Buurtcentrum in de Vissershaven. Gastvrij thuis voor koffieochtenden, soepmiddagen en bingo.')
where naam ilike '%Ichthus%';

update partners set
  slug       = coalesce(slug, 'welzijn'),
  korte_naam = coalesce(korte_naam, 'Welzijn'),
  subtitel   = coalesce(subtitel, 'Zorg & welzijn in de wijk'),
  website    = coalesce(website, 'welzijnscheveningen.nl'),
  volgorde   = coalesce(volgorde, 4),
  omschrijving = coalesce(omschrijving, 'Welzijnswerk in de wijk — van eenzaamheidsbestrijding tot dagactiviteiten voor ouderen.')
where naam ilike 'Welzijn%';

-- Partners die er later bij komen krijgen een plek achteraan.
update partners set volgorde = 99 where volgorde is null;

-- Controle achteraf:
-- select id, naam, korte_naam, slug, volgorde, actief, website from partners order by volgorde;
