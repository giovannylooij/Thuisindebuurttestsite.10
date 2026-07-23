-- Feature 6 — RLS-audit (read-only, wijzigt niets)
--
-- Voer dit uit in Supabase → SQL Editor en plak het resultaat terug in de
-- chat (screenshot van de resultatentabel is prima). Dit laat zien welke
-- tabellen Row Level Security aan hebben staan en welke policies er per
-- tabel gelden — dat is precies wat vanuit de code niet te zien is.

select
  t.tablename,
  t.rowsecurity as rls_aan,
  p.policyname,
  p.cmd as actie,
  p.roles,
  p.qual as "using_voorwaarde",
  p.with_check as "with_check_voorwaarde"
from pg_tables t
left join pg_policies p
  on p.schemaname = t.schemaname and p.tablename = t.tablename
where t.schemaname = 'public'
order by t.tablename, p.cmd;
