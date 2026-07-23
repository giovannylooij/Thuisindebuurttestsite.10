-- Feature 1 — "Bestaat dit nog?"-meldknop
--
-- Voer dit één keer uit in Supabase → SQL Editor. Maakt één nieuwe tabel
-- aan voor meldingen vanuit de website ("bestaat dit niet meer"). Raakt
-- geen bestaande tabellen of data.
--
-- item_type: 'clubje' (buurtinitiatief) | 'activiteit' | 'atlas' (Buurtatlas-plek)
-- item_naam wordt gedenormaliseerd opgeslagen, zodat de melding leesbaar
-- blijft in het CMS ook als het onderliggende item later wordt verwijderd.

create table if not exists meldingen (
  id bigint generated always as identity primary key,
  item_type text not null,
  item_id text not null,
  item_naam text not null,
  bestaat_nog boolean not null default false,
  bericht text,
  email text,
  status text not null default 'nieuw',
  gemeld_op timestamptz not null default now()
);

alter table meldingen enable row level security;

drop policy if exists "meldingen_insert_anon" on meldingen;
create policy "meldingen_insert_anon"
  on meldingen for insert
  to anon
  with check (true);

drop policy if exists "meldingen_select_authenticated" on meldingen;
create policy "meldingen_select_authenticated"
  on meldingen for select
  to authenticated
  using (true);

drop policy if exists "meldingen_update_authenticated" on meldingen;
create policy "meldingen_update_authenticated"
  on meldingen for update
  to authenticated
  using (true);

drop policy if exists "meldingen_delete_authenticated" on meldingen;
create policy "meldingen_delete_authenticated"
  on meldingen for delete
  to authenticated
  using (true);
