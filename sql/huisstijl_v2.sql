-- Huisstijl-paneel v2 — consolidatie naar 5 gedeelde kleuren
--
-- Idempotent: veilig opnieuw te draaien. Hergebruikt de bestaande tabel
-- huisstijl_secties (aangemaakt in sql/huisstijl_secties.sql) — als die
-- nog niet bestaat, wordt hij hier alsnog aangemaakt. Bestaande rijen
-- (de oude 18 sectie/rol-combinaties: merk.*, navigatie.*, hero.*, band.*,
-- knop.*, footer.*) worden NIET aangeraakt of verwijderd — ze blijven als
-- historische data staan, maar worden door het CMS niet meer gebruikt.
--
-- Nieuw: 5 rijen onder sectie='huisstijl', gezaaid met de kleuren die de
-- site nu al heeft. Plus een INSERT-policy (naast de bestaande SELECT/
-- UPDATE-policies) zodat het CMS veilig upsert() kan gebruiken, ook als
-- deze 5 rijen nog niet bestaan.

create table if not exists huisstijl_secties (
  sectie text not null,
  rol text not null,
  kleur text not null,
  updated_at timestamptz not null default now(),
  primary key (sectie, rol)
);

insert into huisstijl_secties (sectie, rol, kleur) values
  ('huisstijl', 'hoofdkleur', '#2d7f7b'),
  ('huisstijl', 'donker', '#236360'),
  ('huisstijl', 'tekst', '#1d2530'),
  ('huisstijl', 'creme', '#faf3e6'),
  ('huisstijl', 'achtergrond', '#ffffff')
on conflict (sectie, rol) do nothing;

alter table huisstijl_secties enable row level security;

drop policy if exists "huisstijl_secties_select_all" on huisstijl_secties;
create policy "huisstijl_secties_select_all"
  on huisstijl_secties for select
  using (true);

drop policy if exists "huisstijl_secties_update_superadmin" on huisstijl_secties;
create policy "huisstijl_secties_update_superadmin"
  on huisstijl_secties for update
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'superadmin'
    )
  );

-- Nieuw t.o.v. sql/huisstijl_secties.sql: INSERT-policy, zodat een
-- upsert() vanuit het CMS ook werkt als de rij nog niet bestaat.
drop policy if exists "huisstijl_secties_insert_superadmin" on huisstijl_secties;
create policy "huisstijl_secties_insert_superadmin"
  on huisstijl_secties for insert
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'superadmin'
    )
  );
