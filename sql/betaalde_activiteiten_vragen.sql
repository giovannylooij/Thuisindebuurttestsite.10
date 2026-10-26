-- Betaalde activiteiten — eigen vragen per activiteit (concept).
--
-- Aanvulling op sql/betaalde_activiteiten.sql. Daar zat één vaste vraag in
-- ("eet je iets niet?"), wat alleen past bij een etentje. De beheerder stelt
-- de vragen nu zelf samen, dus de functie past bij elke betaalde activiteit.
--
-- Voegt alleen kolommen toe; er wordt niets gewijzigd of verwijderd.

-- Per activiteit: de lijst eigen vragen. Bijvoorbeeld
-- [{"id":"v1","label":"Eet je iets niet?","soort":"meerkeuze",
--   "opties":["geen vis","geen vlees"],"per_persoon":true}]
--
-- soort is er één uit:
--   meerkeuze  meerdere antwoorden aan te vinken
--   keuze      één antwoord uit de lijst
--   janee      ja of nee
--   tekst      kort tekstveld
-- per_persoon: de vraag wordt aan iedere deelnemer apart gesteld
alter table activiteiten add column if not exists extra_vragen jsonb;

-- Per aanmelding: de antwoorden op vragen die niet per persoon zijn.
-- {"v2":"met de fiets"}
alter table aanmeldingen add column if not exists antwoorden jsonb;

-- De antwoorden per persoon staan in de kolom `deelnemers` die er al is:
-- [{"naam":"Marian de Vries","antwoorden":{"v1":["geen vis"]}}]

-- Controle achteraf:
-- select column_name from information_schema.columns where table_name = 'activiteiten' and column_name = 'extra_vragen';
-- select column_name from information_schema.columns where table_name = 'aanmeldingen' and column_name = 'antwoorden';
