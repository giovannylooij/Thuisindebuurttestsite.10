-- Testactiviteiten opruimen (4 november 2026)
--
-- Giovanny: "verwijder test 12 en testt uit de database".
-- Dat zijn de twee activiteiten die tijdens het bouwen zijn aangemaakt:
--   id 29  "testt "    (Concept, nooit gepubliceerd)
--   id 31  "Test 12"   (Gepubliceerd, stond dus wel op de site)
--
-- De volledige inhoud van beide rijen is vóór het verwijderen opgeslagen op
-- de laptop, met een kant-en-klaar terugzetscript:
--   backups/activiteiten-29-31-verwijderd-2026-11-04.json
--   backups/activiteiten-29-31-terugzetten-2026-11-04.sql
--
-- Draai dit blok in één keer. De eerste twee selects zijn er om mee te kijken,
-- ze veranderen niets.

-- 1. Dit gaat weg (controleer de namen voordat je verder leest):
select id, naam, status, categorie, aangemaakt_op
  from activiteiten
 where id in (29, 31);

-- 2. Hangen er aanmeldingen aan? Zo ja, die gaan in stap 3 mee.
select id, activiteit_id, status, aangemeld_op
  from aanmeldingen
 where activiteit_id in (29, 31);

-- 3. Weghalen: eerst de aanmeldingen, dan de activiteiten zelf.
delete from aanmeldingen where activiteit_id in (29, 31);
delete from activiteiten  where id in (29, 31);

-- 4. Controle achteraf. Hier horen nul rijen uit te komen.
select id, naam from activiteiten where id in (29, 31);
