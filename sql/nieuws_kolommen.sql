-- VERVANGEN (10-11-2026): deze twee kolommen zitten nu ook in
-- sql/rol-werkend-maken.sql. Draai dat bestand; dit hoef je niet meer
-- apart te doen. Hieronder blijft staan waarom het nodig was.

-- Nieuws: de twee ontbrekende kolommen (9-11-2026)
--
-- WAAROM
-- Een nieuwsbericht opslaan in het CMS mislukte altijd. Het scherm stuurde
-- de velden cat (rubriek) en uitgelicht mee, en die kolommen bestaan niet in
-- de tabel. De database weigerde dan de hele rij:
--     "Could not find the 'cat' column of 'nieuws' in the schema cache"
-- Het scherm meldde ondertussen wél "Nieuwsbericht opgeslagen!". Dat laatste
-- is in beheer.html rechtgezet: er komt nu pas een melding als de database
-- het heeft bevestigd.
--
-- De velden staan al jaren in het scherm en Margareth vult ze in, dus ze
-- horen er gewoon bij te komen in plaats van uit het scherm te verdwijnen.
--
-- Draaien: Supabase → SQL Editor → plakken → Run. Mag meerdere keren.

alter table public.nieuws add column if not exists cat        text;
alter table public.nieuws add column if not exists uitgelicht boolean not null default false;

-- Controle: dit hoort beide kolommen terug te geven.
select column_name, data_type, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'nieuws'
  and column_name in ('cat', 'uitgelicht')
order by column_name;
