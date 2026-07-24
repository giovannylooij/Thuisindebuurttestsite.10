-- Locatie-velden voor Activiteiten (adres-geocoding + Buurtatlas-pin)
--
-- Voer dit één keer uit in Supabase → SQL Editor. Voegt alleen kolommen
-- toe aan de bestaande `activiteiten`-tabel — raakt geen bestaande rijen
-- of data. Zonder deze migratie faalt "Opslaan" op een activiteit zodra
-- er iets in het nieuwe "Locatie op de Buurtatlas"-veld is ingevuld
-- (foutmelding: column activiteiten.lat does not exist).
--
-- Zelfde vorm als de bestaande lat/lng-kolommen op `clubjes` en
-- `partners`, zodat buurtatlas.jsx (die al op a.lat/a.lng filtert) de
-- pin automatisch oppikt zodra deze kolommen gevuld zijn.

alter table activiteiten
  add column if not exists adres text,
  add column if not exists lat double precision,
  add column if not exists lng double precision;
