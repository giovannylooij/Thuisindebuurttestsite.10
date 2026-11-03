-- "Elke dag" toevoegen aan de frequenties (3-11-2026)
--
-- Margareth (punt 20): activiteit Test 12 loopt van 1 t/m 15 november en zou
-- elke dag in de agenda moeten staan. Dat kon niet: de lijst kende wel week,
-- twee weken en maand, maar geen dag.
--
-- Dit verruimt alleen de controle op het veld `frequentie`. Er worden geen
-- rijen gewijzigd of verwijderd. Veilig om twee keer te draaien.

alter table activiteiten drop constraint if exists activiteiten_frequentie_check;
alter table activiteiten add  constraint activiteiten_frequentie_check
  check (frequentie is null or frequentie in
    ('eenmalig','dagelijks','wekelijks','tweewekelijks','maandelijks','onregelmatig'));

alter table clubjes drop constraint if exists clubjes_frequentie_check;
alter table clubjes add  constraint clubjes_frequentie_check
  check (frequentie is null or frequentie in
    ('eenmalig','dagelijks','wekelijks','tweewekelijks','maandelijks','onregelmatig'));

-- Controle achteraf (hoort geen fout te geven en daarna weer null te zetten):
-- update activiteiten set frequentie = 'dagelijks' where id = (select min(id) from activiteiten);
-- update activiteiten set frequentie = null where frequentie = 'dagelijks';
