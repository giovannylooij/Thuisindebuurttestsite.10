-- Wie mag wat in de database? (9-11-2026)
--
-- Aanleiding: Giovanny kan een bewonersinitiatief niet publiceren. In het CMS
-- zelf werkt die knop — dat heb ik nagespeeld met de echte gegevens uit deze
-- database. Dan blijft over dat de database het wegschrijven weigert.
--
-- Wat ik van buitenaf al zag met de publieke sleutel:
--   * een gewone UPDATE op clubjes wordt toegestaan  (!)
--   * een UPSERT (de manier waarop het CMS opslaat) wordt geweigerd:
--     "new row violates row-level security policy for table clubjes"
-- Het CMS slaat op met een upsert. Lukt dat voor een ingelogde gebruiker ook
-- niet, dan is dit precies de fout die Giovanny ziet.
--
-- Draaien: Supabase → SQL Editor → plakken → Run. Dit verandert niets, het
-- leest alleen. Stuur de uitkomst door.

-- 1. Alle regels op de vier tabellen waar de redactie mee werkt.
select
  tablename                                as tabel,
  policyname                               as regel,
  cmd                                      as actie,
  roles                                    as voor_wie,
  coalesce(qual, '—')                      as mag_lezen_wanneer,
  coalesce(with_check, '—')                as mag_schrijven_wanneer
from pg_policies
where schemaname = 'public'
  and tablename in ('clubjes', 'activiteiten', 'nieuws', 'voorzieningen')
order by tablename, cmd, policyname;

-- 2. Staat row level security eigenlijk aan op die tabellen?
select relname as tabel, relrowsecurity as rls_aan, relforcerowsecurity as rls_afgedwongen
from pg_class
where relnamespace = 'public'::regnamespace
  and relname in ('clubjes', 'activiteiten', 'nieuws', 'voorzieningen');

-- 3. De rollen die nu in gebruik zijn (zonder e-mailadressen).
select role, count(*) as aantal
from public.profiles
group by role
order by aantal desc;
