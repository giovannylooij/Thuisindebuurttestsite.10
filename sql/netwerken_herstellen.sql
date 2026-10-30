-- Netwerken-scherm werkend maken (31-10-2026)
--
-- Margareth: "netwerken klopt niet met wat op de site staat — de site klopt,
-- het CMS niet." Dat klopt, en het is hetzelfde patroon als bij Partners:
--
--   1. De Netwerken-pagina op de site staat vást in de code. Vier netwerken
--      (Geriatrisch Netwerk, Ouder Worden voor Beginners, Netwerk Mantelzorg
--      en Cultuur Noordelijk Scheveningen) met hun teksten staan letterlijk
--      in het websitebestand.
--   2. In de tabel `netwerken` staan acht hele andere regels: vier namen uit
--      een oude demo-opzet van 16 juni, allemaal dubbel. Die staan nergens op
--      de site. Dát is wat het CMS laat zien.
--   3. Opslaan mislukt bovendien: het scherm stuurt `omschrijving` mee en die
--      kolom bestaat niet, dus de database weigert de hele rij.
--
-- Dit script zet de vier echte netwerken in de database, met alle velden die
-- de site toont, en zet de acht oude regels op onzichtbaar.
--
-- Er wordt NIETS verwijderd. De oude regels blijven staan (op `actief = false`)
-- zodat Margareth zelf kan beslissen of ze weg mogen.
-- Veilig om twee keer te draaien.

-- 1. De velden die de site toont maar de tabel nog niet had
alter table netwerken add column if not exists omschrijving  text;
alter table netwerken add column if not exists contact       text;
alter table netwerken add column if not exists email         text;
alter table netwerken add column if not exists telefoon      text;
alter table netwerken add column if not exists bijeenkomsten text;
alter table netwerken add column if not exists voor_wie      text;
alter table netwerken add column if not exists toegankelijk  text;
alter table netwerken add column if not exists volgorde      integer;

-- 2. Zorgen dat de database zelf een id uitdeelt. Zonder dit kan het CMS geen
--    nieuw netwerk aanmaken (de kolom is een getal zonder teller), en loopt
--    het later stuk op een id dat al bestaat — hetzelfde als bij clubjes.
do $$
declare reeks text;
begin
  reeks := pg_get_serial_sequence('netwerken', 'id');
  if reeks is null then
    execute 'create sequence if not exists netwerken_id_seq owned by netwerken.id';
    execute 'alter table netwerken alter column id set default nextval(''netwerken_id_seq'')';
    reeks := 'netwerken_id_seq';
  end if;
  perform setval(reeks, coalesce((select max(id) from netwerken), 1));
end $$;

-- 3. De oude demo-regels uit beeld halen (niet verwijderen)
update netwerken set actief = false
 where naam in ('BNS Scheveningen', 'Welzijn Scheveningen',
                'Stadsdeel Scheveningen', 'Sportief Den Haag');

-- 4. De vier netwerken die nu op de site staan, in de database.
--    Het id laten we door de database uitdelen.
insert into netwerken (naam, doelgroep, locatie, website, actief, volgorde,
                       omschrijving, contact, email, telefoon, bijeenkomsten, voor_wie, toegankelijk)
select 'Geriatrisch Netwerk Scheveningen', 'Zorg & welzijn', 'Heel Scheveningen',
       'geriatrischnetwerk.nl', true, 1,
       'Samenwerking tussen huisartsen, wijkverpleging en welzijn rond zorg voor kwetsbare ouderen.',
       'Dr. Annelies Verhoef', 'geriatrisch@scheveningen.nl', '070 416 22 30',
       'Maandelijks · 2ᵉ dinsdag · Bibliotheek Scheveningen',
       'Huisartsen, wijkverpleegkundigen, mantelzorgers, casemanagers dementie',
       'Toegankelijk voor mensen met mobiliteitshulpmiddelen'
where not exists (select 1 from netwerken where naam = 'Geriatrisch Netwerk Scheveningen');

insert into netwerken (naam, doelgroep, locatie, website, actief, volgorde,
                       omschrijving, contact, email, telefoon, bijeenkomsten, voor_wie, toegankelijk)
select 'Ouder Worden voor Beginners', 'Sociaal', 'Noordelijk Scheveningen',
       null, true, 2,
       'Maandelijkse gespreksgroep voor 60-plussers over thema''s als zelfstandig blijven wonen, sociale contacten en gezondheid.',
       'Margriet Bouwmeester', 'ouderworden@thuisindebuurt.org', '06 23 45 67 81',
       'Eerste donderdag van de maand · 14:00 – 16:00 · Ichthus',
       'Iedereen vanaf 60 jaar — ervaring niet nodig',
       'Begane grond · ringleiding aanwezig'
where not exists (select 1 from netwerken where naam = 'Ouder Worden voor Beginners');

insert into netwerken (naam, doelgroep, locatie, website, actief, volgorde,
                       omschrijving, contact, email, telefoon, bijeenkomsten, voor_wie, toegankelijk)
select 'Netwerk Mantelzorg Scheveningen', 'Zorg', 'Heel Scheveningen + omliggende wijken',
       'welzijnscheveningen.nl/mantelzorg', true, 3,
       'Ondersteuning en uitwisseling voor mantelzorgers in de wijk — koffie, advies en kortingsregelingen.',
       'Welzijn Scheveningen — Yvonne ten Brink', 'mantelzorg@welzijnscheveningen.nl', '070 416 22 22',
       'Inloop iedere woensdag 10:00 – 12:00',
       'Iedereen die zorgt voor een naaste — geen aanmelding nodig',
       'Volledig rolstoeltoegankelijk'
where not exists (select 1 from netwerken where naam = 'Netwerk Mantelzorg Scheveningen');

insert into netwerken (naam, doelgroep, locatie, website, actief, volgorde,
                       omschrijving, contact, email, telefoon, bijeenkomsten, voor_wie, toegankelijk)
select 'Cultuur Noordelijk Scheveningen', 'Cultuur', 'Statenkwartier · Belgisch Park · Vissershaven',
       null, true, 4,
       'Overleg tussen culturele initiatieven, theater, muziek en buurtfotografen — onderlinge afstemming en gezamenlijke promotie.',
       'Paul Renema', 'cultuur@thuisindebuurt.org', '06 34 56 78 90',
       'Tweemaandelijks · Theater Vlieger',
       'Culturele initiatieven, kunstenaars en buurtorganisaties in Noordelijk Scheveningen',
       'Theater Vlieger heeft een lift en aangepast toilet'
where not exists (select 1 from netwerken where naam = 'Cultuur Noordelijk Scheveningen');

-- Netwerken die er later bij komen krijgen een plek achteraan.
update netwerken set volgorde = 99 where volgorde is null;

-- Controle achteraf:
-- select id, naam, doelgroep, actief, volgorde from netwerken order by actief desc, volgorde;
