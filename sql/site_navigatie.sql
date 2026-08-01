-- Nieuwe tabel voor het hoofdmenu van de website.
--
-- Waarom: de CMS-toggle "In menu" bij Pagina's sloeg de zichtbaarheid alleen op
-- in de localStorage van de browser (via window.__syncToSite). localStorage is
-- per domein gescheiden — het CMS draait op app.thuisindebuurt.nl, de website
-- op www.thuisindebuurt.nl — dus wijzigingen kwamen NOOIT aan op de live site.
-- Deze tabel maakt de menu-zichtbaarheid net als clubjes/activiteiten/agenda
-- een gedeelde bron in Supabase, die zowel het CMS als de website rechtstreeks
-- uitlezen.
--
-- Voer dit één keer uit in Supabase → SQL Editor.

create table if not exists site_navigatie (
  id text primary key,
  label text not null,
  target text not null,
  visible boolean not null default true,
  level integer not null default 0
);

insert into site_navigatie (id, label, target, visible, level) values
  ('nav-1',  'Home',                     '/',             true,  0),
  ('nav-2',  'Buurtinitiatieven',        '/clubjes',      true,  0),
  ('nav-3',  'Activiteiten',             '/activiteiten', true,  0),
  ('nav-4',  'Agenda',                   '/agenda',       true,  0),
  ('nav-5',  'Buurtatlas',               '/buurtatlas',   true,  0),
  ('nav-6',  'Partners',                 '/partners',     true,  0),
  ('nav-7',  'Netwerken',                '/netwerken',    true,  0),
  ('nav-8',  'Nieuws',                   '/nieuws',       true,  0),
  ('nav-9',  'Contact',                  '/contact',      true,  0),
  ('nav-10', 'Doe mee',                  '/doemee',       false, 0),
  ('nav-11', 'Doneren',                  '/doneren',      false, 0),
  ('nav-12', 'Leven is spelen (boek)',   '/boek',         false, 0)
on conflict (id) do nothing;

-- RLS: de website (anon key) moet dit kunnen lezen; het CMS (ingelogde
-- gebruiker) moet het kunnen lezen én wijzigen. Zonder RLS-policies is de
-- tabel met RLS aan voor iedereen ontoegankelijk (dus zowel CMS als site
-- zouden een lege lijst terugkrijgen — geen menu-items zonder deze policies).
alter table site_navigatie enable row level security;

create policy "site_navigatie: publiek leesbaar"
  on site_navigatie for select
  to anon, authenticated
  using (true);

create policy "site_navigatie: ingelogde gebruikers mogen wijzigen"
  on site_navigatie for update
  to authenticated
  using (true)
  with check (true);
