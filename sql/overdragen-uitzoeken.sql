-- Waarom mislukt het overdragen? (10-11-2026)
--
-- WAT ER GEBEURT
-- Een redactie-assistent klikt op "Overdragen aan Margareth". Het CMS doet dan
-- precies dit:  update clubjes set eigenaar_id = null where id = <nummer>
-- De database antwoordt: new row violates row-level security policy.
--
-- Dat hoort niet te kunnen. De regel die we gedraaid hebben zegt letterlijk
-- dat een assistent de eigenaar leeg MAG maken:
--     with check (get_my_role() = 'redactie_assistent'
--                 and (eigenaar_id = auth.uid() or eigenaar_id is null))
--
-- Dat de melding over de níeuwe rij gaat, betekent dat de database de rij wél
-- mocht aanraken (hij werd gevonden) maar de uitkomst afkeurt. Er staat dus
-- waarschijnlijk nog een oudere regel op de tabel die ik niet heb opgeruimd,
-- of eentje van het type "restrictive" — die werkt als een veto: daar moet
-- áltijd aan voldaan zijn, hoeveel andere regels het ook goedvinden.
--
-- Draaien: Supabase → SQL Editor → plakken → Run. Dit verandert niets, het
-- kijkt alleen. Stuur de hele uitkomst door.

select
  policyname                                   as regel,
  case when permissive = 'PERMISSIVE'
       then 'gewoon (telt mee als "of")'
       else 'VETO (restrictive — moet altijd kloppen)'
  end                                          as soort_regel,
  cmd                                          as actie,
  array_to_string(roles, '+')                  as voor_wie,
  coalesce(qual, '—')                          as mag_de_rij_raken_als,
  coalesce(with_check, '—')                    as mag_de_uitkomst_zijn
from pg_policies
where schemaname = 'public' and tablename = 'clubjes'
order by permissive desc, cmd, policyname;
