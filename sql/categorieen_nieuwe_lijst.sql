-- Nieuwe categorielijst voor buurtinitiatieven én activiteiten
--
-- Gewenste lijst (Margareth, sep 2026):
--   Eten · Ontmoeting/Sociaal · Sport en Bewegen · Spel ·
--   Lezen, Schrijven en Vertellen · Kunst en Cultuur · Evenement/Festival
--
-- Voer dit één keer uit in Supabase -> SQL Editor.
--
-- LET OP - waarom deel 2 erbij hoort:
-- Buurtinitiatieven en activiteiten bewaren hun categorie als losse TEKST
-- (kolom `categorie` bevat bijv. 'Sociaal'), niet als verwijzing naar een rij
-- in `categorieen`. Alleen de lijst vervangen zou dus betekenen dat alle 19
-- bestaande items een categorie houden die niet meer in de lijst staat.
-- Daarom zet deel 2 die items in dezelfde slag om.


-- =====================================================================
-- DEEL 1 - De categorielijst zelf
-- =====================================================================
-- Dit is wat het keuzemenu in het CMS toont (bij Buurtinitiatieven,
-- Activiteiten en het scherm Categorieen).

-- Alles in een transactie: deel 1 en deel 2 slagen samen, of er verandert
-- niets. Zo kan er geen tussentoestand ontstaan waarin items los staan.
begin;

delete from categorieen;

insert into categorieen (naam, volgorde, kleur, icoon) values
  ('Eten',                          1, 'oklch(0.65 0.13 65)',  'users'),
  ('Ontmoeting/Sociaal',            2, 'oklch(0.65 0.13 145)', 'users'),
  ('Sport en Bewegen',              3, 'oklch(0.65 0.13 25)',  'activity'),
  ('Spel',                          4, 'oklch(0.55 0.13 250)', 'club'),
  ('Lezen, Schrijven en Vertellen', 5, 'oklch(0.55 0.04 250)', 'book'),
  ('Kunst en Cultuur',              6, 'oklch(0.55 0.13 295)', 'image'),
  ('Evenement/Festival',            7, 'oklch(0.65 0.13 65)',  'calendar');


-- =====================================================================
-- DEEL 2 - Bestaande items meenemen naar de nieuwe lijst
-- =====================================================================
-- Zonder dit staan alle bestaande buurtinitiatieven en activiteiten los
-- van de lijst. Margareth kan elk item daarna alsnog in het CMS aanpassen
-- via het keuzemenu - dat is een kwestie van seconden per item.
--
-- De regels met  <-- CHECK  zijn inhoudelijke keuzes; die mag ze naar
-- eigen inzicht wijzigen.

-- --- Buurtinitiatieven ---------------------------------------------
update clubjes set categorie = 'Ontmoeting/Sociaal'
  where naam in ('Donderdag koffieclub', 'Wijkborrel');

update clubjes set categorie = 'Eten'
  where naam in ('Parklunch Belgisch Park', 'Soepgroep');          -- <-- CHECK (lunch/soep: Eten of Ontmoeting?)

update clubjes set categorie = 'Sport en Bewegen'
  where naam = 'Happy Feet';                                        -- stond op 'Klein ommetje of stevige wandeling'

update clubjes set categorie = 'Spel'
  where naam = 'Jeu de Boules - De Mets';                            -- stond op 'Een ongedwongen potje boulen'

update clubjes set categorie = 'Lezen, Schrijven en Vertellen'
  where naam in ('Schrijversclub Haagse Levensboeken', 'Verhalenclub');

update clubjes set categorie = 'Evenement/Festival'
  where naam = 'test 2';                                            -- testitem, stond op 'Festival'

-- --- Activiteiten ---------------------------------------------------
update activiteiten set categorie = 'Ontmoeting/Sociaal'
  where naam in ('Koffieochtend 50+', 'Digitale Inloop');           -- <-- CHECK (Digitale Inloop past bij geen enkele nieuwe categorie)

update activiteiten set categorie = 'Eten'
  where naam in ('Koffie & Soep', 'Walking Dinner');                -- <-- CHECK (Walking Dinner: Eten of Evenement/Festival?)

update activiteiten set categorie = 'Sport en Bewegen'
  where naam in ('Buurtwandeling', 'Stoelyoga', 'Nordic Walking');

update activiteiten set categorie = 'Spel'
  where naam in ('Schaakavond', 'Klaverjassen (Rotterdams');        -- <-- CHECK (stonden op sport / cultuur)
-- NB: die naam is in de database afgekapt (geen sluithaakje) - staat er echt zo in.

update activiteiten set categorie = 'Lezen, Schrijven en Vertellen'
  where naam = 'Leeskring';

commit;


-- =====================================================================
-- CONTROLE - draai dit na afloop; alles hoort 'in de lijst' te zijn
-- =====================================================================
-- select 'clubje' as soort, naam, categorie,
--        case when categorie in (select naam from categorieen)
--             then 'in de lijst' else 'LOS' end as status
--   from clubjes
-- union all
-- select 'activiteit', naam, categorie,
--        case when categorie in (select naam from categorieen)
--             then 'in de lijst' else 'LOS' end
--   from activiteiten
-- order by status desc, soort, naam;
