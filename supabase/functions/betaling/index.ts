// betaling — Supabase Edge Function
//
// Twee dingen, allebei vanuit de browser van de bezoeker aan te roepen:
//
//   { "action": "start",  ... }   aanmelding bewaren en de betaling openen
//   { "action": "status", "kenmerk": "TIB-..." }   hoe staat het ermee
//
// Waarom dit op de server moet en niet in de browser kan:
//
//   1. De Mollie-sleutel mag nergens in de website staan. Wie hem heeft kan
//      geld terugstorten en alle betalingen inzien.
//   2. Het bedrag moet hier opnieuw worden uitgerekend. Wat de browser
//      meestuurt is een wens, geen feit — anders meldt iemand zich aan voor
//      één cent.
//   3. Een bezoeker mag de tabel `aanmeldingen` niet teruglezen (dat is
//      bewust zo: daar staan namen, adressen en telefoonnummers in). De
//      aanmelding wordt daarom hier aangemaakt, met de service-sleutel.
//
// Deploy:
//   supabase functions deploy betaling --project-ref bxklumejqczcmhrpzstt
//
// Benodigde secrets:
//   MOLLIE_API_KEY              (test_... of live_...)
//   SUPABASE_SERVICE_ROLE_KEY
// SUPABASE_URL wordt door de runtime zelf meegegeven.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { CORS, json, mollieVerzoek, naarBetaalstatus, euroTekst, isTestModus } from '../_shared/mollie.ts'

/* Waar mag de bezoeker na het betalen heen terugkeren? Een vaste lijst.
   Zou de browser dit vrij mogen bepalen, dan kan iemand de betaalpagina van
   Mollie gebruiken om bezoekers naar een eigen site te sturen. */
const TOEGESTANE_HERKOMST = [
  'https://www.thuisindebuurt.nl',
  'https://thuisindebuurt.nl',
]
const STANDAARD_HERKOMST = 'https://www.thuisindebuurt.nl'

function veiligeHerkomst(herkomst: unknown): string {
  const h = String(herkomst || '').replace(/\/$/, '')
  if (TOEGESTANE_HERKOMST.includes(h)) return h
  // Tijdens het bouwen draait de site op de eigen laptop.
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(h)) return h
  return STANDAARD_HERKOMST
}

/* Het kenmerk doet twee dingen: het staat bij de betaling zodat je hem in het
   bankoverzicht terugvindt, en het is de sleutel waarmee de bedankpagina de
   status opvraagt. Dat tweede betekent dat hij niet te raden mag zijn.
   Letters en cijfers die niet op elkaar lijken (geen 0/O, geen 1/I). */
const TEKENS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
function maakKenmerk(): string {
  const bytes = new Uint8Array(12)
  crypto.getRandomValues(bytes)
  let uit = ''
  bytes.forEach((b) => { uit += TEKENS[b % TEKENS.length] })
  return 'TIB-' + uit
}

/* Welke betaalmethodes mag de bezoeker kiezen? Dat vinkt de beheerder per
   activiteit aan in het CMS (kolom betaalmethodes). De namen zijn dezelfde
   als die van Mollie, maar we vertalen ze toch expliciet: zo kan een rare
   waarde in de database nooit zomaar doorgegeven worden.

   Staat er niets aangevinkt, dan laten we de keuze weg en toont Mollie alles
   wat op het profiel aanstaat. Een lijst van nul methodes zou immers
   betekenen dat er helemaal niet betaald kan worden. */
const MOLLIE_METHODES: Record<string, string> = {
  ideal: 'ideal',
  creditcard: 'creditcard',
  banktransfer: 'banktransfer',
}

function gekozenMethodes(waarde: unknown): string[] {
  const uit: string[] = []
  String(waarde || '').split(',').forEach((stuk) => {
    const m = MOLLIE_METHODES[stuk.trim()]
    if (m && uit.indexOf(m) === -1) uit.push(m)
  })
  return uit
}

function isEmail(waarde: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(waarde)
}

/** Alleen wat we zelf kennen overnemen; de rest van wat de browser stuurt negeren. */
function schoneDeelnemers(ruw: unknown, personen: number): Array<Record<string, unknown>> {
  const lijst = Array.isArray(ruw) ? ruw : []
  const uit: Array<Record<string, unknown>> = []
  for (let i = 0; i < personen; i++) {
    const p: any = lijst[i] || {}
    uit.push({
      naam: String(p.naam || '').trim().slice(0, 120),
      antwoorden: (p.antwoorden && typeof p.antwoorden === 'object') ? p.antwoorden : {},
    })
  }
  return uit
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const db = createClient(supabaseUrl, serviceKey)

    const body = await req.json().catch(() => ({}))
    const actie = String(body.action || '')

    /* ──────────────── status opvragen ────────────────
       De bedankpagina na het betalen. Geeft bewust geen persoonsgegevens
       terug: alleen hoe de betaling ervoor staat. */
    if (actie === 'status') {
      const kenmerk = String(body.kenmerk || '').trim()
      if (!/^TIB-[A-Z2-9]{12}$/.test(kenmerk)) return json({ status: 'onbekend' })

      const { data, error } = await db
        .from('aanmeldingen')
        .select('betaalstatus, bedrag, personen, activiteit_id, mollie_id, adres')
        .eq('kenmerk', kenmerk)
        .maybeSingle()
      if (error) throw error
      if (!data) return json({ status: 'onbekend' })

      /* De webhook is de echte bron, maar die kan nog onderweg zijn: Mollie
         stuurt hem soms een tel later dan dat de bezoeker al terug is. Staat
         het hier nog op "open", dan vragen we het even rechtstreeks na. */
      let status = data.betaalstatus || 'open'
      if (status === 'open' && data.mollie_id) {
        try {
          const betaling = await mollieVerzoek('/payments/' + data.mollie_id)
          const verse = naarBetaalstatus(betaling.status)
          if (verse !== status) {
            status = verse
            await db.from('aanmeldingen').update({
              betaalstatus: verse,
              betaald_op: verse === 'betaald' ? (betaling.paidAt || new Date().toISOString()) : null,
            }).eq('kenmerk', kenmerk)
          }
        } catch (e) {
          // Mollie even niet bereikbaar: dan tonen we gewoon wat we hebben.
          console.error('status navragen mislukt', String(e))
        }
      }

      /* Het adres wordt bewust pas ná het betalen gevraagd — zo blijft het
         aanmeldformulier kort. Of het gevraagd wordt staat bij de activiteit
         (vraag_adres); het bedankscherm doet de vraag en stuurt hem terug
         met de actie "adres". */
      let naam: string | null = null
      let vraagAdres = false
      if (data.activiteit_id) {
        const { data: act } = await db
          .from('activiteiten').select('naam, vraag_adres').eq('id', data.activiteit_id).maybeSingle()
        naam = (act && act.naam) || null
        vraagAdres = !!(act && act.vraag_adres === true)
      }
      return json({
        status,
        bedrag: data.bedrag,
        personen: data.personen,
        activiteit: naam,
        vraagAdres: vraagAdres,
        adresGegeven: !!(data.adres && String(data.adres).trim()),
      })
    }

    /* ──────────────── adres nasturen ────────────────
       Hoort bij de vraag die het bedankscherm stelt. De sleutel is het
       kenmerk: dat heeft alleen wie zelf betaald heeft. Pas nadat er
       daadwerkelijk betaald is, anders zou het adres van een afgehaakte
       bezoeker alsnog in de lijst komen. */
    if (actie === 'adres') {
      const kenmerk = String(body.kenmerk || '').trim()
      if (!/^TIB-[A-Z2-9]{12}$/.test(kenmerk)) return json({ error: 'Onbekende betaling.' }, 400)

      const adres = String(body.adres || '').trim().slice(0, 200)
      if (adres.length < 4) return json({ error: 'Vul je straatnaam en huisnummer in.' }, 400)

      const { data, error } = await db
        .from('aanmeldingen')
        .select('id, betaalstatus')
        .eq('kenmerk', kenmerk)
        .maybeSingle()
      if (error) throw error
      if (!data) return json({ error: 'Onbekende betaling.' }, 404)
      if (['betaald', 'wacht', 'contant'].indexOf(data.betaalstatus || '') === -1) {
        return json({ error: 'Deze betaling is nog niet rond.' }, 409)
      }

      const { error: bewaarFout } = await db
        .from('aanmeldingen').update({ adres: adres }).eq('id', data.id)
      if (bewaarFout) throw bewaarFout
      return json({ ok: true })
    }

    /* ──────────────── betaling starten ──────────────── */
    if (actie !== 'start') return json({ error: 'Onbekende actie.' }, 400)

    const activiteitId = parseInt(String(body.activiteit_id).replace(/^[a-zA-Z]+/, ''), 10)
    if (isNaN(activiteitId)) return json({ error: 'Geen geldige activiteit.' }, 400)

    const email = String(body.email || '').trim()
    if (!isEmail(email)) return json({ error: 'Vul een geldig e-mailadres in.' }, 400)

    // ── De activiteit ophalen; die bepaalt alles wat met geld te maken heeft.
    const { data: act, error: actFout } = await db
      .from('activiteiten')
      .select('id, naam, status, betaald, prijs, servicekosten, max_personen, plekken, aanmelden_tot, betaalmethodes')
      .eq('id', activiteitId)
      .maybeSingle()
    if (actFout) throw actFout
    if (!act) return json({ error: 'Deze activiteit bestaat niet.' }, 404)
    /* Alleen een gepubliceerde activiteit kan betaald worden. Met de
       testsleutel mag een concept ook: anders zou je om te testen een
       proefactiviteit op de echte website moeten zetten, zichtbaar voor
       iedereen. Met een live sleutel kan dit nooit. */
    if (act.status !== 'Gepubliceerd') {
      if (!isTestModus()) return json({ error: 'Deze activiteit staat niet open.' }, 400)
      console.log('testmodus: betaling toegestaan voor concept-activiteit', activiteitId)
    }
    if (act.betaald !== true) return json({ error: 'Voor deze activiteit hoef je niet te betalen.' }, 400)

    const prijs = Number(act.prijs) || 0
    if (prijs <= 0) return json({ error: 'Voor deze activiteit staat nog geen bedrag ingesteld.' }, 400)

    // ── Kan er nog aangemeld worden? De sluitingsdag telt zelf nog mee.
    if (act.aanmelden_tot) {
      const sluit = new Date(String(act.aanmelden_tot) + 'T23:59:59+01:00')
      if (!isNaN(sluit.getTime()) && new Date() > sluit) {
        return json({ error: 'Aanmelden voor deze activiteit is gesloten.' }, 400)
      }
    }

    // ── Hoeveel personen, en mag dat?
    const maxPersonen = Math.max(1, Number(act.max_personen) || 1)
    let personen = parseInt(String(body.personen), 10)
    if (isNaN(personen) || personen < 1) personen = 1
    if (personen > maxPersonen) {
      return json({ error: 'Je kunt je voor hoogstens ' + maxPersonen + ' personen aanmelden.' }, 400)
    }

    const deelnemers = schoneDeelnemers(body.deelnemers, personen)
    if (!deelnemers[0].naam) return json({ error: 'Vul je naam in.' }, 400)

    // ── Zijn er nog plekken? Afgebroken en mislukte betalingen tellen niet
    //    mee: die plek is weer vrij.
    if (act.plekken) {
      const { data: bezet, error: telFout } = await db
        .from('aanmeldingen')
        .select('personen, betaalstatus')
        .eq('activiteit_id', activiteitId)
      if (telFout) throw telFout
      const bezetteplekken = (bezet || [])
        .filter((r: any) => ['open', 'wacht', 'betaald', 'contant'].includes(r.betaalstatus || 'open'))
        .reduce((n: number, r: any) => n + (Number(r.personen) || 1), 0)
      if (bezetteplekken + personen > Number(act.plekken)) {
        const over = Math.max(0, Number(act.plekken) - bezetteplekken)
        return json({
          error: over === 0
            ? 'Deze activiteit is vol.'
            : 'Er ' + (over === 1 ? 'is nog maar één plek' : 'zijn nog maar ' + over + ' plekken') + ' vrij.',
        }, 409)
      }
    }

    // ── Het bedrag. Dit is het enige dat telt; wat de browser meestuurde
    //    kijken we niet naar.
    const servicekosten = Number(act.servicekosten) || 0
    const totaal = prijs * personen + servicekosten
    if (totaal < 0.01) return json({ error: 'Het bedrag klopt niet.' }, 400)

    const kenmerk = maakKenmerk()

    // ── Eerst de aanmelding bewaren. Gaat Mollie daarna mis, dan staat er
    //    tenminste iets in het CMS in plaats van een verdwenen bezoeker.
    const { data: aanmelding, error: insertFout } = await db
      .from('aanmeldingen')
      .insert([{
        naam: deelnemers[0].naam,
        email: email,
        telefoon: String(body.telefoon || '').trim().slice(0, 40) || null,
        type: 'activiteit',
        status: 'nieuw',
        activiteit_id: activiteitId,
        personen: personen,
        deelnemers: deelnemers,
        antwoorden: (body.antwoorden && typeof body.antwoorden === 'object') ? body.antwoorden : {},
        adres: String(body.adres || '').trim().slice(0, 200) || null,
        opmerking: String(body.opmerking || '').trim().slice(0, 2000) || null,
        bedrag: totaal,
        betaalstatus: 'open',
        kenmerk: kenmerk,
      }])
      .select('id')
      .single()
    if (insertFout) throw insertFout

    // ── En dan pas de betaling bij Mollie.
    const herkomst = veiligeHerkomst(body.herkomst)
    const omschrijving = ('Thuis in de Buurt — ' + (act.naam || 'activiteit')).slice(0, 255)

    const methodes = gekozenMethodes(act.betaalmethodes)

    let betaling: any
    try {
      betaling = await mollieVerzoek('/payments', {
        method: 'POST',
        body: JSON.stringify({
          amount: { currency: 'EUR', value: euroTekst(totaal) },
          description: omschrijving,
          redirectUrl: herkomst + '/?betaling=' + kenmerk,
          webhookUrl: supabaseUrl + '/functions/v1/betaling-webhook',
          metadata: { aanmelding_id: aanmelding.id, kenmerk: kenmerk },
          ...(methodes.length ? { method: methodes } : {}),
        }),
      })
    } catch (e) {
      /* De aanmelding blijft staan, maar wel als mislukt. Margareth ziet dan
         in het CMS dat iemand het probeerde en kan diegene bellen. */
      await db.from('aanmeldingen').update({ betaalstatus: 'mislukt' }).eq('id', aanmelding.id)
      console.error('betaling aanmaken mislukt', String(e))
      return json({ error: 'Het betalen kon niet worden gestart. Probeer het zo nog eens.' }, 502)
    }

    await db.from('aanmeldingen').update({ mollie_id: betaling.id }).eq('id', aanmelding.id)

    const betaalUrl = betaling._links && betaling._links.checkout && betaling._links.checkout.href
    if (!betaalUrl) {
      console.error('Mollie gaf geen betaalpagina terug', JSON.stringify(betaling).slice(0, 500))
      return json({ error: 'Het betalen kon niet worden gestart. Probeer het zo nog eens.' }, 502)
    }

    console.log('betaling gestart', JSON.stringify({
      kenmerk, aanmelding: aanmelding.id, mollie: betaling.id,
      bedrag: euroTekst(totaal), test: isTestModus(),
    }))

    return json({ betaalUrl, kenmerk, bedrag: totaal })
  } catch (e) {
    console.error('betaling: onverwachte fout', String(e && (e as Error).stack || e))
    return json({ error: 'Er ging iets mis. Probeer het zo nog eens.' }, 500)
  }
})
