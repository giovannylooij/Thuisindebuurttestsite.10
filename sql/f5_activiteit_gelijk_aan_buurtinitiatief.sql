-- F5 + B3 + B4: activiteit krijgt dezelfde velden als buurtinitiatief
--
-- Voer dit één keer uit in Supabase → SQL Editor, VÓÓRDAT de nieuwe
-- CMS-/website-versie live gaat.
--
-- Veilig: voegt alleen lege kolommen toe ("if not exists" = doet niets als de
-- kolom al bestaat). Er wordt niets verwijderd of overschreven; ook de kolom
-- `type` bij activiteiten blijft gewoon staan.

begin;

-- Activiteiten: alle velden die het buurtinitiatief-scherm ook heeft.
-- (adres/lat/lng stonden al klaar in sql/activiteiten_locatie.sql maar zijn
-- nooit gedraaid; hier meegenomen.)
alter table activiteiten
  add column if not exists adres                    text,
  add column if not exists lat                      double precision,
  add column if not exists lng                      double precision,
  add column if not exists wijk                     text,
  add column if not exists omschrijving             text,
  add column if not exists uitgebreide_omschrijving text,
  add column if not exists voor_wie                 text,
  add column if not exists wat                      text,
  add column if not exists telefoon                 text,
  add column if not exists contact_zichtbaar        boolean not null default false,
  add column if not exists icoon_url                text,
  add column if not exists icoon_label              text;

-- Buurtinitiatieven:
--   wat                      = B3, eigen veld i.p.v. een kopie van categorie
--   uitgebreide_omschrijving = B4, in het CMS "Omschrijving"
--   adres                    = het adresveld in het CMS werd tot nu toe nergens opgeslagen
alter table clubjes
  add column if not exists wat                      text,
  add column if not exists uitgebreide_omschrijving text,
  add column if not exists adres                    text;

commit;

-- Laat de Supabase-API de nieuwe kolommen direct herkennen.
notify pgrst, 'reload schema';
