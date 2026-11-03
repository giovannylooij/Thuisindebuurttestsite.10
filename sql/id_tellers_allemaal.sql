-- Alle id-tellers in één keer rechtzetten (3-11-2026)
--
-- Margareth: "Ik kan geen nieuwe partner invoeren." Dezelfde oorzaak als
-- eerder bij bewonersinitiatieven (30-10) en netwerken (31-10): de teller die
-- het volgende id uitdeelt loopt achter op het hoogste id dat al bestaat, of
-- ontbreekt helemaal. De database weigert de rij dan met "duplicate key" of
-- "null value in column id", en het CMS meldt alleen "Opslaan mislukt".
--
-- Dit gebeurt bij elke tabel die ooit met vaste id's is gevuld (een import of
-- een demo-opzet). Daarom nu niet één tabel, maar allemaal tegelijk — en
-- meteen zo dat nieuwe tabellen vanzelf meegaan als je dit ooit opnieuw draait.
--
-- Wat het doet, per tabel met een id dat een getal is:
--   * ontbreekt er een teller, dan wordt die aangemaakt en aan de kolom gekoppeld
--   * daarna wordt de teller op het hoogste bestaande id gezet
-- Er worden geen rijen gewijzigd, toegevoegd of verwijderd.
-- Veilig om twee keer te draaien.

do $$
declare
  t      record;
  reeks  text;
  hoogste bigint;
begin
  for t in
    select c.table_name
      from information_schema.columns c
      join information_schema.tables tb
        on tb.table_schema = c.table_schema
       and tb.table_name  = c.table_name
     where c.table_schema = 'public'
       and c.column_name  = 'id'
       and c.data_type in ('smallint', 'integer', 'bigint')
       and tb.table_type  = 'BASE TABLE'
     order by c.table_name
  loop
    reeks := pg_get_serial_sequence('public.' || quote_ident(t.table_name), 'id');

    -- Geen teller? Er een maken en aan de kolom hangen.
    if reeks is null then
      execute format('create sequence if not exists %I', t.table_name || '_id_seq');
      execute format('alter sequence %I owned by %I.id', t.table_name || '_id_seq', t.table_name);
      execute format('alter table %I alter column id set default nextval(%L)',
                     t.table_name, t.table_name || '_id_seq');
      reeks := t.table_name || '_id_seq';
      raise notice 'teller aangemaakt voor %', t.table_name;
    end if;

    execute format('select coalesce(max(id), 0) from %I', t.table_name) into hoogste;
    -- Bij een lege tabel begint hij gewoon bij 1 (derde waarde is false).
    perform setval(reeks, greatest(hoogste, 1), hoogste > 0);
  end loop;
end $$;

-- Controle achteraf: elke teller met de stand erbij.
-- select sequencename, last_value from pg_sequences
--  where schemaname = 'public' order by sequencename;
--
-- En specifiek voor partners (het punt van Margareth):
-- select max(id) as hoogste_id from partners;
-- select last_value from partners_id_seq;
