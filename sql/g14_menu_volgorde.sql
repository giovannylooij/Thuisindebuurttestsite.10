-- G14 — het scherm Navigatie werkt nu echt.
--
-- Wat er was: het scherm sloeg alleen iets op in de browser van de beheerder.
-- De tabel site_navigatie bestond al en werd door de website genegeerd.
-- Wat er nu gebeurt: het CMS schrijft naar deze tabel en de website leest het
-- menu eruit (naam, volgorde, zichtbaarheid).
--
-- Deze migratie voegt een kolom `volgorde` toe en zet de rechten goed:
-- iedereen mag het menu lezen (anders ziet een bezoeker geen menu),
-- alleen ingelogde beheerders mogen het wijzigen.

alter table site_navigatie add column if not exists volgorde integer;

-- Beginvolgorde = het nummer dat al in de id stond (nav-1, nav-2, ...).
update site_navigatie
   set volgorde = nullif(regexp_replace(id, '\D', '', 'g'), '')::int
 where volgorde is null;

alter table site_navigatie enable row level security;

drop policy if exists "site_navigatie_public_read" on site_navigatie;
create policy "site_navigatie_public_read"
  on site_navigatie for select
  to public using (true);

drop policy if exists "site_navigatie_auth_write" on site_navigatie;
create policy "site_navigatie_auth_write"
  on site_navigatie for all
  to authenticated using (true) with check (true);

-- Controle achteraf:
-- select id, label, target, visible, volgorde from site_navigatie order by volgorde;
