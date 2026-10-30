-- Terugzetbestand: de acht oude netwerk-regels (31-10-2026)
--
-- Op verzoek van Giovanny zijn deze acht regels uit de tabel `netwerken`
-- verwijderd. Het waren vier namen uit een demo-opzet van 16 juni 2026,
-- allemaal dubbel aangemaakt, zonder omschrijving en zonder contactgegevens.
-- Ze stonden nergens op de website en waren al op onzichtbaar gezet.
--
-- Dit bestand zet ze terug zoals ze waren, mocht dat ooit nodig zijn.
-- Ze komen terug op onzichtbaar, met hun oorspronkelijke aanmaakdatum.
-- De id's laten we door de database uitdelen; de oude id's 1 t/m 8 zijn
-- bewust niet afgedwongen, zodat dit nooit botst met wat er dan staat.

insert into netwerken (naam, doelgroep, locatie, website, actief, volgorde, aangemaakt_op) values
  ('BNS Scheveningen',       'Bewonersorganisaties', 'Noordelijk Scheveningen', null, false, 99, '2026-06-16T18:24:42.730243+00:00'),
  ('Welzijn Scheveningen',   'Zorg & welzijn',       'Wijk',                    null, false, 99, '2026-06-16T18:24:42.730243+00:00'),
  ('Stadsdeel Scheveningen', 'Gemeente',             'Den Haag',                null, false, 99, '2026-06-16T18:24:42.730243+00:00'),
  ('Sportief Den Haag',      'Sport & beweging',     'Stad',                    null, false, 99, '2026-06-16T18:24:42.730243+00:00'),
  ('BNS Scheveningen',       'Bewonersorganisaties', 'Noordelijk Scheveningen', null, false, 99, '2026-06-16T18:25:58.153909+00:00'),
  ('Welzijn Scheveningen',   'Zorg & welzijn',       'Wijk',                    null, false, 99, '2026-06-16T18:25:58.153909+00:00'),
  ('Stadsdeel Scheveningen', 'Gemeente',             'Den Haag',                null, false, 99, '2026-06-16T18:25:58.153909+00:00'),
  ('Sportief Den Haag',      'Sport & beweging',     'Stad',                    null, false, 99, '2026-06-16T18:25:58.153909+00:00');
