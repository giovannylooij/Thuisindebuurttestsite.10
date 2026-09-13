-- Aparte telefoonkolom voor aanmeldingen van buurtinitiatieven (F3)
--
-- Voer dit één keer uit in Supabase → SQL Editor, VÓÓRDAT de website-update
-- met het nieuwe aanmeldformulier live gaat. Het formulier stuurt voortaan een
-- `telefoon`-veld mee; zonder deze kolom mislukt elke aanmelding.
--
-- Veilig: voegt alleen een lege kolom toe (of doet niets als hij al bestaat).
-- Bestaande aanvragen en de kolom `email_of_telefoon` blijven ongewijzigd.
-- `email_of_telefoon` bevat vanaf nu altijd het e-mailadres.

alter table buurtgroep_aanvragen
  add column if not exists telefoon text;

-- Laat de Supabase-API de nieuwe kolom direct herkennen.
notify pgrst, 'reload schema';
