-- Netwerken erbij voor de redactie-assistent (10-11-2026)
--
-- WAAROM
-- Afspraak met Giovanny: een redactie-assistent mag ook netwerken toevoegen,
-- met dezelfde regels als bij bewonersinitiatieven, activiteiten,
-- voorzieningen en nieuws. Wat hij aanmaakt is van hem, een ander ziet het
-- niet, Margareth ziet het wel maar kan het niet aanpassen, en overdragen
-- maakt het weer van de redactie.
--
-- LET OP BIJ DE LEESREGEL
-- De website toont een netwerk zolang "actief" niet uitstaat (zie
-- bundle-src/ui.jsx, tibNetwerken: n.actief !== false). De regel hieronder
-- doet precies hetzelfde met coalesce(actief, true), zodat een netwerk zonder
-- ingevulde waarde gewoon zichtbaar blijft. Zou daar alleen "actief is true"
-- staan, dan vielen die stilletjes van de site af.
--
-- Draaien: Supabase → SQL Editor → plakken → Run. Mag meerdere keren.
-- Draai dit vóórdat de nieuwe versie van het CMS online staat.

-- ───────────────────────────────────────────────────────────────────────────
-- 1. De kolom erbij
-- ───────────────────────────────────────────────────────────────────────────
alter table public.netwerken
  add column if not exists eigenaar_id uuid references auth.users(id) on delete set null;
create index if not exists netwerken_eigenaar_idx on public.netwerken (eigenaar_id);

-- ───────────────────────────────────────────────────────────────────────────
-- 2. Row level security aan, en de oude regels opruimen
--    We halen alle bestaande regels weg en zetten er één compleet stel terug.
--    Zo weten we zeker dat er geen oudere regel blijft staan die alles alsnog
--    doorlaat; bij clubjes kostte zo'n achtergebleven regel ons een middag.
-- ───────────────────────────────────────────────────────────────────────────
alter table public.netwerken enable row level security;

do $$
declare r record;
begin
  for r in select policyname from pg_policies
           where schemaname = 'public' and tablename = 'netwerken'
  loop
    execute format('drop policy %I on public.netwerken', r.policyname);
    raise notice 'Oude regel verwijderd: %', r.policyname;
  end loop;
end $$;

-- Schrijven — superadmin en redactie: alles zonder eigenaar.
create policy netwerken_write_redactie on public.netwerken
  for all to public
  using      (get_my_role() = any (array['superadmin','redactie']) and eigenaar_id is null)
  with check (get_my_role() = any (array['superadmin','redactie']) and eigenaar_id is null);

-- Schrijven — assistent: alleen zijn eigen netwerken.
create policy netwerken_write_assistent on public.netwerken
  for all to public
  using      (get_my_role() = 'redactie_assistent' and eigenaar_id = auth.uid())
  with check (get_my_role() = 'redactie_assistent'
              and (eigenaar_id = auth.uid() or eigenaar_id is null));

-- Lezen — de website ziet wat zichtbaar is; een assistent alleen eigen werk.
create policy netwerken_select_openbaar on public.netwerken
  for select to public
  using (
    (coalesce(actief, true) is true and coalesce(get_my_role(), '') <> 'redactie_assistent')
    or get_my_role() = any (array['superadmin','redactie'])
    or (get_my_role() = 'redactie_assistent' and eigenaar_id = auth.uid())
  );

-- ───────────────────────────────────────────────────────────────────────────
-- 3. Overdragen ook voor netwerken
--    Zelfde functie als eerder, met netwerken erbij in de lijst.
-- ───────────────────────────────────────────────────────────────────────────
create or replace function public.tib_draag_over(p_tabel text, p_id text)
returns text
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  aantal int;
begin
  if p_tabel not in ('clubjes', 'activiteiten', 'nieuws', 'voorzieningen', 'netwerken') then
    raise exception 'Overdragen kan niet voor %', p_tabel;
  end if;
  if auth.uid() is null then
    raise exception 'Niet ingelogd.';
  end if;
  if coalesce(get_my_role(), '') <> 'redactie_assistent' then
    raise exception 'Alleen een redactie-assistent kan een item overdragen.';
  end if;
  execute format(
    'update public.%I set eigenaar_id = null where id::text = $1 and eigenaar_id = $2',
    p_tabel) using p_id, auth.uid();
  get diagnostics aantal = row_count;
  if aantal = 0 then
    raise exception 'Dit item staat niet op uw naam, of bestaat niet meer.';
  end if;
  return 'ok';
end $$;

revoke all     on function public.tib_draag_over(text, text) from public;
grant  execute on function public.tib_draag_over(text, text) to authenticated;

notify pgrst, 'reload schema';

-- ───────────────────────────────────────────────────────────────────────────
-- CONTROLE — dit hoort vier regels te geven: de kolom, en drie regels op
-- netwerken (één lezen, twee schrijven).
-- ───────────────────────────────────────────────────────────────────────────
select 'kolom' as wat, column_name || ' (' || data_type || ')' as uitkomst
from information_schema.columns
where table_schema = 'public' and table_name = 'netwerken' and column_name = 'eigenaar_id'

union all
select 'regel op netwerken', policyname || '  (' || cmd || ')'
from pg_policies
where schemaname = 'public' and tablename = 'netwerken'

order by 1, 2;
