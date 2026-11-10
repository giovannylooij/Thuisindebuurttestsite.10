-- Welk stuk weigert precies? (10-11-2026, versie 3)
--
-- Vastgesteld: geen triggers, rol klopt, rij is zichtbaar, en toch weigert
-- de database het leegmaken van de eigenaar. Dit script probeert drie keer
-- hetzelfde soort opdracht, met één verschil, en rekent daarnaast de
-- voorwaarde uit de regel met de hand na.
--
--   A  niets wijzigen (naam = naam)          → werkt bewerken überhaupt?
--   B  eigenaar op mezelf zetten             → werkt wijzigen van dit veld?
--   C  eigenaar leegmaken                    → dit is wat mislukt
--   D  de voorwaarde uit de regel uitrekenen → zegt die zelf ja of nee?
--
-- VEILIG: alles wordt na afloop teruggezet.

create table if not exists public.tib_diagnose (nr serial primary key, wat text, uitkomst text);
alter table public.tib_diagnose disable row level security;
delete from public.tib_diagnose;

do $$
declare
  mijn_id  uuid := '5808a605-dbbd-4a2a-b063-7c6361dede11';
  rij_id   int  := 38;
  oude_eig uuid;
  ik       text := current_user;
  a text; b text; c text; d text;
begin
  select eigenaar_id into oude_eig from public.clubjes where id = rij_id;

  perform set_config('request.jwt.claims',
          json_build_object('sub', mijn_id, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';

  begin
    update public.clubjes set naam = naam where id = rij_id;
    a := 'GELUKT';
  exception when others then a := 'MISLUKT — ' || SQLERRM; end;

  begin
    update public.clubjes set eigenaar_id = auth.uid() where id = rij_id;
    b := 'GELUKT';
  exception when others then b := 'MISLUKT — ' || SQLERRM; end;

  begin
    update public.clubjes set eigenaar_id = null where id = rij_id;
    c := 'GELUKT';
  exception when others then c := 'MISLUKT — ' || SQLERRM; end;

  -- De voorwaarde uit clubjes_write_assistent, met de hand nagerekend voor
  -- een rij waarvan de eigenaar leeg is.
  select 'rol klopt: '  || coalesce((get_my_role() = 'redactie_assistent')::text, 'onbekend')
      || ' | eigenaar mag leeg zijn: '
      || coalesce(((null::uuid = auth.uid()) or (null::uuid is null))::text, 'onbekend')
      || ' | hele voorwaarde: '
      || coalesce(((get_my_role() = 'redactie_assistent')
                   and ((null::uuid = auth.uid()) or (null::uuid is null)))::text, 'onbekend')
    into d;

  execute format('set local role %I', ik);
  update public.clubjes set eigenaar_id = oude_eig where id = rij_id;

  insert into public.tib_diagnose(wat, uitkomst) values
    ('A. niets wijzigen',        a),
    ('B. eigenaar op mezelf',    b),
    ('C. eigenaar leegmaken',    c),
    ('D. voorwaarde nagerekend', d),
    ('E. eigenaar teruggezet',   coalesce(oude_eig::text, '(leeg)'));
end $$;

select wat, uitkomst from public.tib_diagnose order by nr;
