-- Punt 16 — zelf de volgorde bepalen (gesprek Margareth, 23-10 / 3-11-2026)
--
-- Margareth wil items in de lijst kunnen verplaatsen: "dat je sport en bewegen
-- naar boven kan zetten of naar onder". In het CMS sleept ze de rij; dat
-- schrijft hieronder het veld `volgorde` weg (1, 2, 3, ...). De website houdt
-- die volgorde aan.
--
-- partners heeft `volgorde` al (sql/blok3_partners.sql) en voorzieningen ook
-- (sql/blok5_voorzieningen.sql). Alleen bewonersinitiatieven en activiteiten
-- misten het veld nog.
--
-- Er wordt niets verwijderd of overschreven: bestaande nummers blijven staan,
-- alleen lege velden worden gevuld. Veilig om twee keer te draaien.

alter table clubjes      add column if not exists volgorde integer;
alter table activiteiten add column if not exists volgorde integer;

-- Vullen met de volgorde zoals die nu op de site staat (op id), zodat er na
-- het draaien van dit script niets verspringt.
with genummerd as (
  select id, row_number() over (order by id) as nr from clubjes
)
update clubjes c
   set volgorde = g.nr
  from genummerd g
 where g.id = c.id
   and c.volgorde is null;

with genummerd as (
  select id, row_number() over (order by id) as nr from activiteiten
)
update activiteiten a
   set volgorde = g.nr
  from genummerd g
 where g.id = a.id
   and a.volgorde is null;

-- Voorzieningen staan allemaal op 0 (de standaardwaarde). Zodra Margareth daar
-- gaat slepen schrijft het CMS 1, 2, 3, ... weg; tot die tijd blijft het op
-- naam gesorteerd. Niets te doen.

-- Controle achteraf:
-- select id, naam, volgorde from clubjes      order by volgorde;
-- select id, naam, volgorde from activiteiten order by volgorde;
