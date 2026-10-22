-- Blok A — teksten op de pagina's beheerbaar maken.
--
-- Eén rij per tekstveld: pagina ('clubjes'), sleutel ('titel') en de tekst.
-- Staat er voor een veld geen rij, dan gebruikt de website de tekst die in de
-- code staat. "Terug naar standaard" in het CMS verwijdert de rij weer.
-- Lezen mag iedereen (anders ziet een bezoeker de tekst niet),
-- schrijven alleen wie is ingelogd in het CMS.

create table if not exists pagina_teksten (
  pagina        text not null,
  sleutel       text not null,
  tekst         text,
  bijgewerkt_op timestamptz not null default now(),
  primary key (pagina, sleutel)
);

alter table pagina_teksten enable row level security;

drop policy if exists "pagina_teksten_public_read" on pagina_teksten;
create policy "pagina_teksten_public_read"
  on pagina_teksten for select
  to public using (true);

drop policy if exists "pagina_teksten_auth_write" on pagina_teksten;
create policy "pagina_teksten_auth_write"
  on pagina_teksten for all
  to authenticated using (true) with check (true);

-- Controle achteraf:
-- select pagina, sleutel, left(tekst, 40) from pagina_teksten order by pagina, sleutel;
