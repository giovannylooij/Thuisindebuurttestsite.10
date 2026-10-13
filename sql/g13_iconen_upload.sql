-- G13 — uploaden van iconen in het CMS.
-- Bevinding vooraf: de regel "icons_public_insert" stond op rol `public`,
-- waardoor iedereen met de publieke sleutel (die in de website staat) bestanden
-- in de map `icons` kon zetten. Uploaden hoort alleen te kunnen vanuit het CMS,
-- dus nadat iemand is ingelogd.
-- Lezen blijft openbaar: de website toont de iconen aan bezoekers.
-- Uitgevoerd op 13 oktober 2026.

drop policy if exists "icons_public_insert" on storage.objects;

create policy "icons_authenticated_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'icons');

-- TERUGDRAAIEN (zoals het was, let op: dan mag iedereen weer uploaden):
-- drop policy if exists "icons_authenticated_insert" on storage.objects;
-- create policy "icons_public_insert" on storage.objects for insert
--   to public with check (bucket_id = 'icons');
