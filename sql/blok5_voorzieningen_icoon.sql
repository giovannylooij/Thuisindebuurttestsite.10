-- Voorzieningen: een icoon erbij (30-10-2026)
--
-- Aanvulling op sql/blok5_voorzieningen.sql. Buurtinitiatieven en
-- activiteiten hebben al een icoon dat je in het CMS kiest uit de
-- mediabibliotheek; voorzieningen krijgen datzelfde.
--
-- icoon_url    het webadres van het plaatje in de opslagmap
-- icoon_label  de naam van het icoon, zodat het CMS laat zien welke gekozen is
--
-- Voegt alleen kolommen toe. Veilig om twee keer te draaien.

alter table voorzieningen add column if not exists icoon_url   text;
alter table voorzieningen add column if not exists icoon_label text;

-- Controle achteraf:
-- select column_name from information_schema.columns
--  where table_name = 'voorzieningen' and column_name like 'icoon%';
