-- G11 — elke categorie een eigen, duidelijk verschillende kleur.
-- Reden: er waren 6 kleuren voor 8 categorieen, waardoor Eten en
-- Evenement/Festival dezelfde kleur hadden, en Sport en Bewegen en Overig ook.
-- De website leest deze kleur nu uit (bolletjes, filterknoppen, kaart).
-- Uitgevoerd op 13 oktober 2026.

update categorieen set kleur = '#E07A3A' where id = 6;   -- Eten (oranje)
update categorieen set kleur = '#2E8B57' where id = 7;   -- Ontmoeting/Sociaal (grasgroen)
update categorieen set kleur = '#D6453F' where id = 8;   -- Sport en Bewegen (koraalrood)
update categorieen set kleur = '#2F6DB5' where id = 9;   -- Spel (blauw)
update categorieen set kleur = '#5B52C4' where id = 10;  -- Lezen, Schrijven en Vertellen (indigo)
update categorieen set kleur = '#8E44AD' where id = 11;  -- Kunst en Cultuur (paars)
update categorieen set kleur = '#C2457E' where id = 12;  -- Evenement/Festival (roze)
update categorieen set kleur = '#7A7363' where id = 15;  -- Overig (neutraal grijs)

-- TERUGDRAAIEN (de kleuren zoals ze op 13-10-2026 vóór deze wijziging stonden):
-- update categorieen set kleur = 'oklch(0.65 0.13 65)'  where id = 6;
-- update categorieen set kleur = 'oklch(0.65 0.13 145)' where id = 7;
-- update categorieen set kleur = 'oklch(0.65 0.13 25)'  where id = 8;
-- update categorieen set kleur = 'oklch(0.55 0.13 250)' where id = 9;
-- update categorieen set kleur = 'oklch(0.55 0.04 250)' where id = 10;
-- update categorieen set kleur = 'oklch(0.55 0.13 295)' where id = 11;
-- update categorieen set kleur = 'oklch(0.65 0.13 65)'  where id = 12;
-- update categorieen set kleur = 'oklch(0.65 0.13 25)'  where id = 15;
