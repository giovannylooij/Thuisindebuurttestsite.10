-- Feature 5 — Huisstijl-kleuren fase 2: 6 secties × kleurrollen
--
-- Voer dit één keer uit in Supabase → SQL Editor, ná
-- sql/huisstijl_instellingen.sql (die blijft ook gewoon bestaan/werken,
-- dit is een nieuwe, aparte tabel). Raakt geen bestaande tabellen.
--
-- Zolang deze tabel niet bestaat, blijft de website exact de huidige
-- kleuren gebruiken (elke rij hieronder is gezaaid met de kleur die de
-- site nu al heeft) — er verandert dus niets totdat iemand in het CMS
-- bewust een kleur aanpast en op "Toepassen" klikt.

create table if not exists huisstijl_secties (
  sectie text not null,
  rol text not null,
  kleur text not null,
  updated_at timestamptz not null default now(),
  primary key (sectie, rol)
);

insert into huisstijl_secties (sectie, rol, kleur) values
  ('merk', 'koptekst', '#1d2530'),
  ('merk', 'body', '#4a5563'),
  ('merk', 'muted', '#7a8392'),
  ('navigatie', 'achtergrond', 'rgba(250,243,230,0.92)'),
  ('navigatie', 'tekst', '#4a5563'),
  ('navigatie', 'actief', '#2D7F7B'),
  ('hero', 'achtergrond', '#FFFFFF'),
  ('hero', 'eyebrow', '#3f8f7a'),
  ('hero', 'tekst', '#1d2530'),
  ('band', 'wit', '#FFFFFF'),
  ('band', 'creme', '#faf3e6'),
  ('band', 'accent', '#e0f2f1'),
  ('knop', 'primair', '#2D7F7B'),
  ('knop', 'primair_hover', '#1F5F5B'),
  ('knop', 'secundair_rand', '#2D7F7B'),
  ('footer', 'achtergrond', '#1F5F5B'),
  ('footer', 'tekst', '#DDE7E6'),
  ('footer', 'link', '#3f8f7a')
on conflict (sectie, rol) do nothing;

alter table huisstijl_secties enable row level security;

create policy "huisstijl_secties_select_all"
  on huisstijl_secties for select
  using (true);

create policy "huisstijl_secties_update_superadmin"
  on huisstijl_secties for update
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'superadmin'
    )
  );
