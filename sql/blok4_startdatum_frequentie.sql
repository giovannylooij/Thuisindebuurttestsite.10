-- Blok 4 — Startdatum en frequentie (gesprek Margareth 23-10-2026)
--
-- Nu staat er één vrij tekstveld "Wanneer" ("Elke 2 weken op vrijdagmiddag,
-- van 16.00 tot 18.00 uur"). De agenda moet die tekst raden, en daarom staat
-- de Wijkborrel mogelijk op de verkeerde week en missen de Soepgroep en
-- Happy Feet helemaal.
--
-- Hieronder komen echte velden bij. De weekdag wordt NIET apart opgeslagen:
-- die volgt uit de startdatum, zodat hij nooit kan tegenspreken.
--
-- Dit script voegt alleen kolommen toe. Er wordt niets gewijzigd of
-- verwijderd, en het bestaande veld "wanneer" blijft staan: zolang de nieuwe
-- velden leeg zijn, werkt de site precies zoals nu.
--
-- Veilig om twee keer te draaien.

-- startdatum   de eerste keer dat het doorgaat (bij eenmalig: de enige keer)
-- frequentie   'eenmalig' | 'wekelijks' | 'tweewekelijks' | 'maandelijks' | 'onregelmatig'
-- maand_weken  alleen bij 'maandelijks': welke keren in de maand, als lijst.
--              [1] = 1e, [2,4] = 2e en 4e, [5] = de laatste
-- tot_datum    laatste dag van de reeks (leeg = doorlopend)
-- begintijd    bijv. 16:00
-- eindtijd     bijv. 18:00

alter table activiteiten add column if not exists startdatum  date;
alter table activiteiten add column if not exists frequentie  text;
alter table activiteiten add column if not exists maand_weken jsonb;
alter table activiteiten add column if not exists tot_datum   date;
alter table activiteiten add column if not exists begintijd   time;
alter table activiteiten add column if not exists eindtijd    time;

alter table clubjes add column if not exists startdatum  date;
alter table clubjes add column if not exists frequentie  text;
alter table clubjes add column if not exists maand_weken jsonb;
alter table clubjes add column if not exists tot_datum   date;
alter table clubjes add column if not exists begintijd   time;
alter table clubjes add column if not exists eindtijd    time;

-- Alleen geldige waarden in `frequentie`; leeg mag ook (= nog niet ingevuld).
alter table activiteiten drop constraint if exists activiteiten_frequentie_check;
alter table activiteiten add  constraint activiteiten_frequentie_check
  check (frequentie is null or frequentie in
    ('eenmalig','wekelijks','tweewekelijks','maandelijks','onregelmatig'));

alter table clubjes drop constraint if exists clubjes_frequentie_check;
alter table clubjes add  constraint clubjes_frequentie_check
  check (frequentie is null or frequentie in
    ('eenmalig','wekelijks','tweewekelijks','maandelijks','onregelmatig'));

-- Controle achteraf:
-- select column_name, data_type from information_schema.columns
--  where table_name in ('activiteiten','clubjes')
--    and column_name in ('startdatum','frequentie','maand_weken','tot_datum','begintijd','eindtijd')
--  order by table_name, column_name;
