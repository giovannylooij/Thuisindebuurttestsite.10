-- De redactie-assistent werkend maken (10-11-2026)
--
-- WAAROM DIT BESTAND
-- De kolom eigenaar_id staat er (sql/redactie_assistent.sql) en de lees- en
-- schrijfregels staan er (sql/redactie_assistent_rechten.sql) — dat laatste
-- heb ik van buitenaf nagekeken: met de publieke sleutel komen er nu alleen
-- nog gepubliceerde bewonersinitiatieven terug, concepten niet meer. Goed.
--
-- Er missen nog twee dingen voordat Armando er echt mee kan werken.
--
-- 1. HET CMS MOET DE ROL KUNNEN LEZEN
--    Bij het inloggen haalt beheer.html één rij op: het eigen profiel, voor
--    de rol. Mag dat niet van de database, dan weet het CMS de rol niet en
--    valt het terug op "beheerder" — de rol die op negen van de tien
--    schermen doodloopt. Armando zou dan inloggen en een kapot menu zien,
--    zonder dat ergens staat waarom.
--    Van buitenaf kan ik niet zien of die regel bestaat: anoniem geeft
--    profiles leeg terug, en dat hoort ook zo. Onderstaand blok kijkt het na
--    en zet de regel erbij als hij ontbreekt. Bestaande regels blijven staan.
--
-- 2. DE TWEE ONTBREKENDE NIEUWSKOLOMMEN
--    nieuws.cat bestaat niet — dat heb ik net nagekeken. Een nieuwsbericht
--    opslaan mislukt daardoor altijd. Nieuws is één van de vier schermen van
--    de assistent, dus dit hoort hierbij. (Dit vervangt
--    sql/nieuws_kolommen.sql; dat bestand hoef je niet meer apart te draaien.)
--
-- Draaien: Supabase → SQL Editor → plakken → Run. Mag meerdere keren.
-- Stuur de uitkomst van de drie controles onderaan door.

-- ───────────────────────────────────────────────────────────────────────────
-- 1. Eigen profiel mogen lezen
-- ───────────────────────────────────────────────────────────────────────────
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles'
      and policyname = 'profiles_select_eigen'
  ) then
    create policy profiles_select_eigen on public.profiles
      for select to authenticated
      using (id = auth.uid());
    raise notice 'Regel profiles_select_eigen toegevoegd — iedereen kan nu zijn eigen rol lezen.';
  else
    raise notice 'Regel profiles_select_eigen bestond al — niets veranderd.';
  end if;
end $$;

-- ───────────────────────────────────────────────────────────────────────────
-- 2. De twee ontbrekende nieuwskolommen
-- ───────────────────────────────────────────────────────────────────────────
alter table public.nieuws add column if not exists cat        text;
alter table public.nieuws add column if not exists uitgelicht boolean not null default false;

-- ───────────────────────────────────────────────────────────────────────────
-- CONTROLE — alles in één tabel
--   De SQL-editor van Supabase laat bij meerdere vragen alleen de laatste
--   uitkomst zien, dus hieronder staat het samen. Je hoort te zien:
--     A  minstens één regel op profiles die op (id = auth.uid()) kijkt;
--     B  twee nieuwskolommen: cat en uitgelicht;
--     C  jouw rol superadmin (en straks redactie_assistent zodra Armando er is).
-- ───────────────────────────────────────────────────────────────────────────
select 'A. regel op profiles' as wat,
       policyname || '  (' || cmd || ', voor '
         || array_to_string(roles, '+') || ')  →  '
         || coalesce(qual, 'geen voorwaarde') as uitkomst
from pg_policies
where schemaname = 'public' and tablename = 'profiles'

union all
select 'B. kolom in nieuws',
       column_name || '  (' || data_type || ', standaard '
         || coalesce(column_default, 'leeg') || ')'
from information_schema.columns
where table_schema = 'public' and table_name = 'nieuws'
  and column_name in ('cat', 'uitgelicht')

union all
select 'C. rol in gebruik',
       coalesce(role, '(geen rol ingevuld)') || '  —  ' || count(*)::text || ' gebruiker(s)'
from public.profiles
group by role

order by 1, 2;
