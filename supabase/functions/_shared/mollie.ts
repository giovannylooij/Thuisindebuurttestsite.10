// Gedeelde Mollie-code voor de betaalfuncties.
//
// Beide functies (betaling en betaling-webhook) praten met dezelfde API en
// moeten dezelfde vertaling van betaalstatussen gebruiken. Stond die twee
// keer in de code, dan gaan ze vroeg of laat uit elkaar lopen.

const MOLLIE_API = 'https://api.mollie.com/v2'

/** De sleutel staat als secret in Supabase, nooit in de code of in de browser. */
export function mollieSleutel(): string {
  const key = Deno.env.get('MOLLIE_API_KEY')
  if (!key) throw new Error('MOLLIE_API_KEY ontbreekt — zet hem als secret in Supabase.')
  return key
}

/** Werken we met de testsleutel? Handig om in de logs te zien. */
export function isTestModus(): boolean {
  return mollieSleutel().startsWith('test_')
}

export async function mollieVerzoek(pad: string, opties: RequestInit = {}): Promise<any> {
  const res = await fetch(MOLLIE_API + pad, {
    ...opties,
    headers: {
      Authorization: 'Bearer ' + mollieSleutel(),
      'Content-Type': 'application/json',
      ...(opties.headers || {}),
    },
  })
  const tekst = await res.text()
  let body: any = null
  try { body = tekst ? JSON.parse(tekst) : null } catch { /* geen json */ }
  if (!res.ok) {
    const melding = (body && (body.detail || body.title)) || tekst || ('http ' + res.status)
    throw new Error('Mollie: ' + melding)
  }
  return body
}

/* Mollie kent eigen statussen; de database kent dit rijtje (zie
   sql/betaalde_activiteiten.sql):
     open, betaald, wacht, afgebroken, mislukt, contant
   "contant" zet de beheerder zelf met de hand; die komt hier dus nooit uit. */
export function naarBetaalstatus(mollieStatus: string): string {
  switch (mollieStatus) {
    case 'paid':       return 'betaald'
    case 'authorized': return 'wacht'      // geld gereserveerd, nog niet binnen
    case 'pending':    return 'wacht'      // overboeking onderweg
    case 'open':       return 'open'       // nog bezig bij de bank
    case 'canceled':   return 'afgebroken' // bezoeker klikte weg
    case 'expired':    return 'afgebroken' // bezoeker maakte het nooit af
    case 'failed':     return 'mislukt'    // bank weigerde
    default:           return 'open'
  }
}

/** Bedragen gaan bij Mollie als tekst met twee decimalen: "32.50". */
export function euroTekst(bedrag: number): string {
  return (Math.round(bedrag * 100) / 100).toFixed(2)
}

export const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}
