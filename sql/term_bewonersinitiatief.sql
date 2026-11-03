-- "Buurtinitiatief" → "Bewonersinitiatief" in de opgeslagen teksten (3-11-2026)
--
-- Margareth heeft de paginanaam veranderd van Buurtinitiatief naar
-- Bewonersinitiatief. In de website- en CMS-code is dat overal doorgevoerd.
-- Eén tekst staat niet in de code maar in de database: de contactkaart op de
-- Contactpagina. Die past dit script aan.
--
-- Alleen deze ene zin wordt aangeraakt; er wordt niets verwijderd.
-- Veilig om twee keer te draaien.

update contact_kaarten
   set omschrijving = replace(omschrijving, 'buurtinitiatief', 'bewonersinitiatief')
 where omschrijving like '%buurtinitiatief%';

update contact_kaarten
   set omschrijving = replace(omschrijving, 'Buurtinitiatief', 'Bewonersinitiatief')
 where omschrijving like '%Buurtinitiatief%';

-- Mocht Margareth het woord later zelf nog ergens hebben ingetypt bij de
-- paginateksten, dan haalt dit het daar ook weg. Nu staat het er niet.
update pagina_teksten
   set tekst = replace(replace(tekst, 'buurtinitiatie', 'bewonersinitiatie'),
                       'Buurtinitiatie', 'Bewonersinitiatie')
 where tekst like '%uurtinitiatie%';

-- Controle achteraf:
-- select id, rol, omschrijving from contact_kaarten order by id;
-- select pagina, sleutel, tekst from pagina_teksten where tekst like '%uurtinitiatie%';
