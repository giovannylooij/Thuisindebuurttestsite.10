-- Feature 5 — Huisstijl-kleuren persistent maken (fase 1)
--
-- Voer dit één keer uit in Supabase → SQL Editor. Maakt één nieuwe tabel aan
-- met precies één instellingenrij; raakt geen bestaande tabellen, kolommen
-- of data. Veilig te draaien op de live database.
--
-- Na het uitvoeren werkt het CMS-scherm "Huisstijl" meteen: de 3 kleuren die
-- daar gekozen worden (primair/accent/achtergrond) worden dan ook echt
-- toegepast op de live website. Zolang deze tabel niet bestaat, blijft de
-- website gewoon de huidige (hardcoded) kleuren gebruiken — er verandert
-- dus niets totdat je dit script draait én zelf een kleur wijzigt in het CMS.

create table if not exists huisstijl_instellingen (
  id integer primary key default 1,
  primary_color text not null default '#2D7F7B',
  accent_color text not null default '#3f8f7a',
  bg_color text not null default '#faf3e6',
  updated_at timestamptz not null default now(),
  constraint huisstijl_instellingen_single_row check (id = 1)
);

-- Startwaarden: exact de kleuren die de website nu al gebruikt, zodat er
-- niets verandert totdat iemand bewust een kleur aanpast in het CMS.
insert into huisstijl_instellingen (id, primary_color, accent_color, bg_color)
values (1, '#2D7F7B', '#3f8f7a', '#faf3e6')
on conflict (id) do nothing;

alter table huisstijl_instellingen enable row level security;

-- Iedereen (ook anonieme bezoekers) mag de kleuren lezen — de website
-- zelf leest deze tabel met de anon-key om de site te kleuren.
create policy "huisstijl_instellingen_select_all"
  on huisstijl_instellingen for select
  using (true);

-- Alleen superadmins mogen de kleuren wijzigen — consistent met de rest
-- van het CMS, waar het Huisstijl-scherm al verborgen is voor de rollen
-- 'redactie' en 'beheerder' (zie HIDDEN-object in shared.jsx/beheer.html).
create policy "huisstijl_instellingen_update_superadmin"
  on huisstijl_instellingen for update
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'superadmin'
    )
  );
