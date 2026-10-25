-- Betaalde activiteiten — concept (nog niet live).
--
-- Voegt alleen kolommen en één tabel toe; er wordt niets gewijzigd of
-- verwijderd aan wat er al staat. Draai je dit twee keer, dan gebeurt er de
-- tweede keer niets.
--
-- 1. activiteiten: wat kost het, hoeveel plekken, welke vragen stellen we erbij
-- 2. aanmeldingen: met hoeveel personen, wie eet wat, en de betaalstatus
-- 3. activiteit_checklist: de afvinklijst van de beheerder per activiteit

-- ── 1. De activiteit zelf ────────────────────────────────────────────────
alter table activiteiten add column if not exists betaald          boolean not null default false;
alter table activiteiten add column if not exists prijs            numeric(8,2);
alter table activiteiten add column if not exists servicekosten    numeric(8,2) not null default 0;
alter table activiteiten add column if not exists max_personen     integer not null default 1;
alter table activiteiten add column if not exists plekken          integer;
alter table activiteiten add column if not exists aanmelden_tot    date;
alter table activiteiten add column if not exists vraag_dieet      boolean not null default true;
alter table activiteiten add column if not exists vraag_adres      boolean not null default false;
alter table activiteiten add column if not exists vraag_telefoon   boolean not null default false;
alter table activiteiten add column if not exists vraag_opmerking  boolean not null default true;
alter table activiteiten add column if not exists betaalmethodes   text not null default 'ideal,creditcard,banktransfer';

-- ── 2. De aanmelding ─────────────────────────────────────────────────────
-- deelnemers: één regel per persoon, bijvoorbeeld
-- [{"naam":"Marian de Vries","geen_vis":true,"geen_vlees":false}, {...}]
alter table aanmeldingen add column if not exists personen     integer not null default 1;
alter table aanmeldingen add column if not exists deelnemers   jsonb;
alter table aanmeldingen add column if not exists adres        text;
alter table aanmeldingen add column if not exists opmerking    text;
alter table aanmeldingen add column if not exists bedrag       numeric(8,2);
alter table aanmeldingen add column if not exists betaalstatus text;
alter table aanmeldingen add column if not exists betaald_op   timestamptz;
alter table aanmeldingen add column if not exists kenmerk      text;
alter table aanmeldingen add column if not exists mollie_id    text;

-- betaalstatus is er één uit dit rijtje (leeg = een gratis activiteit):
--   open        aangemeld, betaling nog niet begonnen of nog bezig
--   betaald     geld binnen
--   wacht       overboeking onderweg
--   afgebroken  bezoeker klikte weg bij de bank
--   mislukt     bank weigerde
--   contant     aan de deur betaald, met de hand gezet
alter table aanmeldingen drop constraint if exists aanmeldingen_betaalstatus_check;
alter table aanmeldingen add constraint aanmeldingen_betaalstatus_check
  check (betaalstatus is null or betaalstatus in
    ('open','betaald','wacht','afgebroken','mislukt','contant'));

create index if not exists aanmeldingen_activiteit_idx on aanmeldingen (activiteit_id);

-- ── 3. De checklist van de beheerder ─────────────────────────────────────
-- Eén rij per afgevinkt punt. Alleen voor het CMS: bezoekers hebben hier
-- niets te zoeken, dus geen publiek leesrecht.
create table if not exists activiteit_checklist (
  activiteit_id bigint not null,
  punt          text   not null,
  gedaan        boolean not null default true,
  bijgewerkt_op timestamptz not null default now(),
  primary key (activiteit_id, punt)
);

alter table activiteit_checklist enable row level security;

drop policy if exists "activiteit_checklist_auth_all" on activiteit_checklist;
create policy "activiteit_checklist_auth_all"
  on activiteit_checklist for all
  to authenticated using (true) with check (true);

-- Controle achteraf:
-- select column_name from information_schema.columns where table_name = 'activiteiten' and column_name in ('betaald','prijs','plekken');
-- select column_name from information_schema.columns where table_name = 'aanmeldingen' and column_name in ('personen','betaalstatus','kenmerk');
-- select * from activiteit_checklist;
