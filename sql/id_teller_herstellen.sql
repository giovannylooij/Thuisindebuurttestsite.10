-- Nieuw buurtinitiatief aanmaken mislukt — id-teller loopt achter (30-10-2026)
--
-- Gevonden tijdens het testen van blok 4: klik je in het CMS op "Nieuw
-- buurtinitiatief" en sla je op, dan komt er soms de melding "Opslaan mislukt".
-- In de database staat dan: duplicate key value violates unique constraint
-- "clubjes_pkey".
--
-- Oorzaak: de teller die het volgende id uitdeelt staat lager dan het hoogste
-- id dat al bestaat. Bij `clubjes` stond de teller op 27 terwijl er al een
-- rij 27 was; het hoogste bestaande id is 34. Zo blijft het misgaan totdat de
-- teller voorbij 34 is. Dit gebeurt als er ooit rijen met een eigen id zijn
-- toegevoegd (bijvoorbeeld bij een import), want dan loopt de teller niet mee.
--
-- Dit staat los van blok 4: bestaande items opslaan werkt gewoon, alleen
-- nieuwe aanmaken liep hierop stuk.
--
-- Hieronder wordt de teller op het hoogste bestaande id gezet. Er worden geen
-- rijen gewijzigd of verwijderd. Veilig om twee keer te draaien.

select setval(pg_get_serial_sequence('clubjes', 'id'),
              coalesce((select max(id) from clubjes), 1));

select setval(pg_get_serial_sequence('activiteiten', 'id'),
              coalesce((select max(id) from activiteiten), 1));

-- Controle achteraf: het eerste getal moet groter of gelijk zijn aan het tweede.
-- select last_value from pg_get_serial_sequence('clubjes','id')::regclass;
-- select max(id) from clubjes;
