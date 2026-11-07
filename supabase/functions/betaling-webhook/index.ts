// betaling-webhook — Supabase Edge Function
//
// Mollie belt deze aan zodra er iets met een betaling gebeurt: betaald,
// afgebroken, mislukt, of een overboeking die binnenkomt. Dit is het enige
// moment waarop een aanmelding op "betaald" gaat.
//
// Mollie stuurt alléén het betaal-id mee, verder niets:
//
//   POST  id=tr_xxxxxxxx     (als formulier, niet als json)
//
// Wat erin staat geloven we niet: we halen de status zelf bij Mollie op met
// de geheime sleutel. Anders kan iedereen die dit adres kent een aanmelding
// op betaald zetten door er een id naartoe te sturen.
//
// Deploy — let op de vlag, zonder die vlag weigert Supabase het verzoek van
// Mollie omdat er geen inlogtoken bij zit:
//   supabase functions deploy betaling-webhook --no-verify-jwt --project-ref bxklumejqczcmhrpzstt
//
// Benodigde secrets: MOLLIE_API_KEY, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { mollieVerzoek, naarBetaalstatus } from '../_shared/mollie.ts'

/* Mollie probeert het opnieuw bij alles wat geen 2xx is. Dat is precies wat
   we willen als wij of Mollie even hapert, maar niet bij een bericht waar we
   toch niets mee kunnen — dan zou hij dagenlang blijven bellen. */
const OK      = () => new Response('ok', { status: 200 })
const NOGMAALS = (waarom: string) => new Response(waarom, { status: 500 })

Deno.serve(async (req) => {
  if (req.method !== 'POST') return OK()

  let mollieId = ''
  try {
    const tekst = await req.text()
    mollieId = new URLSearchParams(tekst).get('id') || ''
  } catch {
    return OK()
  }
  if (!/^tr_[A-Za-z0-9]+$/.test(mollieId)) {
    console.error('webhook zonder bruikbaar id', mollieId.slice(0, 40))
    return OK()
  }

  try {
    const db = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // ── De waarheid komt van Mollie zelf, niet uit het verzoek.
    const betaling = await mollieVerzoek('/payments/' + mollieId)
    const status = naarBetaalstatus(betaling.status)

    const velden: Record<string, unknown> = { betaalstatus: status }
    velden.betaald_op = status === 'betaald'
      ? (betaling.paidAt || new Date().toISOString())
      : null

    const { data, error } = await db
      .from('aanmeldingen')
      .update(velden)
      .eq('mollie_id', mollieId)
      .select('id, kenmerk')

    if (error) {
      console.error('webhook kon niet opslaan', error.message)
      return NOGMAALS('opslaan mislukt')
    }

    if (!data || data.length === 0) {
      /* Geen aanmelding met dit id. Bijvoorbeeld een betaling die buiten de
         site om is aangemaakt, of een testbericht. Niets aan te doen, dus
         ook niet opnieuw laten proberen. */
      console.error('webhook: geen aanmelding bij', mollieId)
      return OK()
    }

    console.log('webhook verwerkt', JSON.stringify({
      mollie: mollieId, mollieStatus: betaling.status, status,
      aanmelding: data[0].id, kenmerk: data[0].kenmerk,
    }))
    return OK()
  } catch (e) {
    /* Mollie even niet bereikbaar of iets anders onverwachts: 500 terug,
       dan probeert Mollie het vanzelf nog een paar keer. */
    console.error('webhook mislukt', String(e && (e as Error).stack || e))
    return NOGMAALS('tijdelijke fout')
  }
})
