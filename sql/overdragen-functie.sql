-- Overdragen aan Margareth: via een functie (10-11-2026)
--
-- WAAROM
-- Een assistent kon zijn item niet overdragen. De database weigerde het met
-- "new row violates row-level security policy". Nagespeeld in de database
-- zelf, met deze uitslag:
--
--   niets wijzigen           → lukt
--   eigenaar op zichzelf     → lukt
--   eigenaar leegmaken       → MISLUKT
--   de schrijfregel zegt zelf dat leegmaken mag  → waar
--
-- Het enige verschil bij de mislukte poging: de rij verdwijnt daarmee uit
-- het zicht van de assistent (hij mag alleen rijen zien met zijn eigen id).
-- De database staat niet toe dat je een rij zo wijzigt dat je hem daarna
-- zelf niet meer mag zien. Dat zit in de leesregel, dus aan de schrijfregel
-- sleutelen helpt niet — en de leesregel willen we juist zo houden:
-- assistenten zien elkaars werk niet.
--
-- WAT DIT BESTAND DOET
-- Het overdragen gaat voortaan door één functie. Die controleert zelf of het
-- item echt van de aanroeper is, en voert daarna de wijziging uit met de
-- rechten van de eigenaar van de database. De regels op de tabel blijven
-- precies zoals ze zijn.
--
-- Wat de functie weigert:
--   * een andere tabel dan de vier waar dit over gaat;
--   * iemand die geen redactie-assistent is;
--   * een item dat niet op naam van de aanroeper staat.
--
-- Draaien: Supabase → SQL Editor → plakken → Run. Mag meerdere keren.
-- Draai dit vóórdat de nieuwe versie van het CMS online staat.

create or replace function public.tib_draag_over(p_tabel text, p_id text)
returns text
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  aantal int;
begin
  if p_tabel not in ('clubjes', 'activiteiten', 'nieuws', 'voorzieningen') then
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

-- Alleen wie ingelogd is mag hem aanroepen.
revoke all     on function public.tib_draag_over(text, text) from public;
grant  execute on function public.tib_draag_over(text, text) to authenticated;

-- Controle: dit hoort één regel terug te geven.
select p.proname as functie,
       case when p.prosecdef then 'draait met de rechten van de database-eigenaar'
            else 'draait met de rechten van de aanroeper' end as hoe,
       pg_get_function_arguments(p.oid) as verwacht
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname = 'tib_draag_over';
