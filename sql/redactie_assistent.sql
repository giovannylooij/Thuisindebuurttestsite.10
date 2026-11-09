-- Redactie-assistent (9-11-2026)
--
-- Er komen meerdere mensen die zelf bewonersinitiatieven, activiteiten,
-- voorzieningen en nieuws gaan toevoegen. Afspraak met Giovanny:
--
--   * wat een redactie-assistent aanmaakt, is van hém;
--   * andere assistenten zien het niet in het CMS;
--   * Margareth ziet het wél, maar kan het niet aanpassen;
--   * pas als de assistent het overdraagt, kan de redactie eraan werken.
--
-- Daarvoor houdt elke rij bij wie hem heeft aangemaakt: eigenaar_id.
-- Een rij zonder eigenaar is "van de redactie" — dat zijn alle bestaande
-- rijen, en alles wat Margareth of de redactie zelf aanmaakt. Daar verandert
-- dus niets aan.
--
-- Draaien: Supabase → SQL Editor → plakken → Run. Dit mag meerdere keren.

-- 1. De kolom erbij, in de vier tabellen waar een assistent aan werkt.
alter table clubjes       add column if not exists eigenaar_id uuid references auth.users(id) on delete set null;
alter table activiteiten  add column if not exists eigenaar_id uuid references auth.users(id) on delete set null;
alter table nieuws        add column if not exists eigenaar_id uuid references auth.users(id) on delete set null;
alter table voorzieningen add column if not exists eigenaar_id uuid references auth.users(id) on delete set null;

-- 2. Zoeken op eigenaar moet snel blijven.
create index if not exists clubjes_eigenaar_idx       on clubjes (eigenaar_id);
create index if not exists activiteiten_eigenaar_idx  on activiteiten (eigenaar_id);
create index if not exists nieuws_eigenaar_idx        on nieuws (eigenaar_id);
create index if not exists voorzieningen_eigenaar_idx on voorzieningen (eigenaar_id);

-- 3. De nieuwe rol mag in profiles.role staan.
--    Staat er een check-constraint op die kolom met een vaste lijst rollen,
--    dan weigert de database 'redactie_assistent'. Onderstaand blok zoekt zo'n
--    constraint op, haalt hem weg en zet hem terug mét de nieuwe rol.
--    Is er geen constraint, dan gebeurt er niets.
do $$
declare
  naam text;
begin
  select con.conname into naam
  from pg_constraint con
  join pg_class rel on rel.oid = con.conrelid
  join pg_namespace ns on ns.oid = rel.relnamespace
  where rel.relname = 'profiles'
    and ns.nspname = 'public'
    and con.contype = 'c'
    and pg_get_constraintdef(con.oid) ilike '%role%'
  limit 1;

  if naam is not null then
    execute format('alter table public.profiles drop constraint %I', naam);
    alter table public.profiles
      add constraint profiles_role_check
      check (role in ('superadmin', 'redactie', 'redactie_assistent', 'beheerder'));
    raise notice 'Check-constraint % vervangen; redactie_assistent is nu toegestaan.', naam;
  else
    raise notice 'Geen check-constraint op profiles.role gevonden — niets te doen.';
  end if;
end $$;

-- 4. Controle achteraf: dit hoort vier regels terug te geven.
select table_name, column_name
from information_schema.columns
where column_name = 'eigenaar_id'
  and table_name in ('clubjes', 'activiteiten', 'nieuws', 'voorzieningen')
order by table_name;


-- ───────────────────────────────────────────────────────────────────────────
-- NOG NIET GEDAAN: afdwingen in de database zelf
--
-- Hierboven gaat alleen over de kolom. Dat wie-ziet-wat ook écht vastligt,
-- moet in de rechten (RLS) van deze vier tabellen staan. Nu regelt het CMS
-- het: een assistent krijgt andermans rijen niet te zien en de knoppen
-- Opslaan en Verwijderen staan er niet. Wie met de publieke sleutel
-- rechtstreeks de database bevraagt, kan de rijen wél ophalen.
--
-- Dat is geen kleine ingreep: de website leest clubjes, activiteiten,
-- voorzieningen en nieuws met diezelfde publieke sleutel. Een te strak
-- beleid haalt de site onderuit. Het hoort samen met de rechten-audit
-- (sql/rls_audit.sql) in één keer goed gedaan te worden. Daarom staat het
-- hier bewust nog niet in.
