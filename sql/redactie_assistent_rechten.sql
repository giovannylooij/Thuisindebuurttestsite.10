-- Rechten voor de redactie-assistent (9-11-2026)
--
-- WAAROM
-- Een redactie-assistent kon niets opslaan. De schrijfregels op clubjes,
-- activiteiten en nieuws stonden op:
--     get_my_role() = ANY (ARRAY['superadmin','redactie'])
-- De nieuwe rol stond daar niet bij, dus weigerde de database elke poging —
-- in het scherm leek het of de knop Publiceren niets deed.
--
-- En het zien-gedeelte zat alleen in het scherm: de database liet iedereen
-- alles lezen. Een assistent zag andermans werk niet in het CMS, maar had het
-- met de publieke sleutel wél kunnen opvragen. Giovanny wil dat dicht.
--
-- WAT DIT BESTAND DOET — de afspraak ook echt in de database vastleggen:
--
--   SCHRIJVEN
--   * een assistent maakt items en past alleen zijn eigen items aan;
--   * superadmin en redactie doen alles wat géén eigenaar heeft (al het
--     bestaande werk en alles wat zij zelf maken);
--   * een item mét eigenaar kan de redactie niet aanpassen. Draagt de
--     assistent het over (eigenaar leeg), dan kan het weer.
--
--   LEZEN
--   * de website (publieke sleutel, niet ingelogd) ziet wat gepubliceerd is —
--     precies wat hij nu al toont, want de site filtert daar zelf ook op;
--   * superadmin en redactie zien alles, ook concepten;
--   * een assistent ziet alléén zijn eigen werk. Niets van een ander, ook
--     niet wat al gepubliceerd is (keuze Giovanny, 9-11). Wil hij zien wat er
--     op de site staat, dan kijkt hij op de website zelf.
--
-- Dit werkt alleen als sql/redactie_assistent.sql al is gedraaid (dat zet de
-- kolom eigenaar_id erbij).
--
-- Draaien: Supabase → SQL Editor → plakken → Run. Mag meerdere keren.

-- ───────────────────────────────────────────────────────────────────────────
-- 1. Schrijven: clubjes, activiteiten, nieuws en voorzieningen
-- ───────────────────────────────────────────────────────────────────────────
do $$
declare
  t text;
begin
  foreach t in array array['clubjes', 'activiteiten', 'nieuws', 'voorzieningen']
  loop
    execute format('drop policy if exists %I on public.%I', t || '_write_beheer', t);
    execute format('drop policy if exists %I on public.%I', t || '_auth_write', t);
    execute format('drop policy if exists %I on public.%I', t || '_write_redactie', t);
    execute format('drop policy if exists %I on public.%I', t || '_write_assistent', t);

    -- Superadmin en redactie: alles zonder eigenaar.
    execute format($f$
      create policy %I on public.%I
        for all to public
        using      (get_my_role() = any (array['superadmin','redactie']) and eigenaar_id is null)
        with check (get_my_role() = any (array['superadmin','redactie']) and eigenaar_id is null)
    $f$, t || '_write_redactie', t);

    -- Assistent: alleen zijn eigen items. Bij aanmaken moet zijn eigen id
    -- erin staan; bij overdragen mag hij de eigenaar leegmaken, en daarna
    -- kan hij er zelf niet meer bij.
    execute format($f$
      create policy %I on public.%I
        for all to public
        using      (get_my_role() = 'redactie_assistent' and eigenaar_id = auth.uid())
        with check (get_my_role() = 'redactie_assistent'
                    and (eigenaar_id = auth.uid() or eigenaar_id is null))
    $f$, t || '_write_assistent', t);
  end loop;
end $$;

-- ───────────────────────────────────────────────────────────────────────────
-- 2. Lezen: clubjes, activiteiten en nieuws (die hebben een status)
-- ───────────────────────────────────────────────────────────────────────────
do $$
declare
  t text;
begin
  foreach t in array array['clubjes', 'activiteiten', 'nieuws']
  loop
    execute format('drop policy if exists %I on public.%I', t || '_select_public', t);
    execute format('drop policy if exists %I on public.%I', t || '_select_openbaar', t);
    execute format($f$
      create policy %I on public.%I
        for select to public
        using (
          (status = 'Gepubliceerd' and coalesce(get_my_role(), '') <> 'redactie_assistent')
          or get_my_role() = any (array['superadmin','redactie'])
          or (get_my_role() = 'redactie_assistent' and eigenaar_id = auth.uid())
        )
    $f$, t || '_select_openbaar', t);
  end loop;
end $$;

-- Voorzieningen heeft geen status maar een vinkje "zichtbaar".
drop policy if exists voorzieningen_public_read on public.voorzieningen;
drop policy if exists voorzieningen_select_openbaar on public.voorzieningen;
create policy voorzieningen_select_openbaar on public.voorzieningen
  for select to public
  using (
    (zichtbaar is true and coalesce(get_my_role(), '') <> 'redactie_assistent')
    or get_my_role() = any (array['superadmin','redactie'])
    or (get_my_role() = 'redactie_assistent' and eigenaar_id = auth.uid())
  );

-- ───────────────────────────────────────────────────────────────────────────
-- 3. Het wijzigingenlogboek
--    Ook een assistent moet een logregel kunnen wegschrijven, anders ziet
--    Margareth zijn werk niet terug. Alleen toevoegen; lezen blijft zoals het is.
-- ───────────────────────────────────────────────────────────────────────────
do $$
begin
  if exists (select 1 from pg_class where relname = 'wijzigingen'
             and relnamespace = 'public'::regnamespace) then
    drop policy if exists wijzigingen_insert_ingelogd on public.wijzigingen;
    create policy wijzigingen_insert_ingelogd on public.wijzigingen
      for insert to authenticated with check (true);
  end if;
end $$;

-- ───────────────────────────────────────────────────────────────────────────
-- 4. Controle: per tabel hoort er nu één leesregel en twee schrijfregels
--    te staan.
-- ───────────────────────────────────────────────────────────────────────────
select tablename as tabel, policyname as regel, cmd as actie,
       coalesce(qual, '—')       as mag_lezen_wanneer,
       coalesce(with_check, '—') as mag_schrijven_wanneer
from pg_policies
where schemaname = 'public'
  and tablename in ('clubjes', 'activiteiten', 'nieuws', 'voorzieningen')
order by tablename, cmd, policyname;


-- ───────────────────────────────────────────────────────────────────────────
-- LET OP
-- De oude rol "beheerder" (één bewonersinitiatief beheren) valt hierbuiten:
-- die ziet voortaan alleen wat gepubliceerd is en kan niets schrijven. Dat
-- was in de praktijk al zo — zie punt 2 van de testronde van 7-11, waar die
-- rol op negen van de tien schermen vastliep. Gebruik je hem weer, dan moet
-- hij hier apart in.
