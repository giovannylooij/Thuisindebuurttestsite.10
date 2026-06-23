// manage-users — Supabase Edge Function
//
// Deploy command:
//   supabase functions deploy manage-users --project-ref bxklumejqczcmhrpzstt
//
// Required secrets (set once via CLI):
//   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key> --project-ref bxklumejqczcmhrpzstt
//
// SUPABASE_URL and SUPABASE_ANON_KEY are injected automatically by the runtime.
//
// POST body shapes:
//   { "action": "list" }
//   { "action": "invite", "email": "...", "club_id": 3 }          // club_id null = geen koppeling
//   { "action": "update", "user_id": "uuid", "role": "beheerder", "club_id": 3 }
//   { "action": "delete", "user_id": "uuid" }
//
// All calls require Authorization: Bearer <access_token> from a superadmin session.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const anonKey    = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // --- Authenticeer de aanroeper via hun JWT ---
    const authHeader = req.headers.get('Authorization') ?? ''
    if (!authHeader.startsWith('Bearer ')) {
      return json({ error: 'Niet geauthenticeerd' }, 401)
    }

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user: caller }, error: authErr } = await callerClient.auth.getUser()
    if (authErr || !caller) {
      return json({ error: 'Ongeldige sessie' }, 401)
    }

    // --- Controleer of de aanroeper superadmin is ---
    const admin = createClient(supabaseUrl, serviceKey)

    const { data: callerProfile } = await admin
      .from('profiles')
      .select('role')
      .eq('id', caller.id)
      .single()

    if (callerProfile?.role !== 'superadmin') {
      return json({ error: 'Geen toegang — superadmin vereist' }, 403)
    }

    // --- Verwerk de actie ---
    const body = await req.json()
    const { action } = body

    // LIST — alle auth-gebruikers met hun profiles
    if (action === 'list') {
      const { data: { users }, error } = await admin.auth.admin.listUsers({ perPage: 1000 })
      if (error) throw error

      const { data: profiles } = await admin.from('profiles').select('id, role, club_id')
      const byId = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]))

      const result = users.map((u) => ({
        id:         u.id,
        email:      u.email ?? '',
        role:       byId[u.id]?.role   ?? 'beheerder',
        club_id:    byId[u.id]?.club_id ?? null,
        created_at: u.created_at,
      }))

      return json({ users: result })
    }

    // INVITE — stuur e-mail uitnodiging + maak profile aan
    if (action === 'invite') {
      const { email, club_id, role } = body
      if (!email) return json({ error: 'E-mailadres is verplicht' }, 400)

      const { data, error } = await admin.auth.admin.inviteUserByEmail(email as string, {
        data: { club_id: club_id ?? null, role: role ?? 'beheerder' },
        redirectTo: 'https://app.thuisindebuurt.nl/TIB%20Wachtwoord.html',
      })
      if (error) throw error

      // Trigger-fallback: voeg profile direct in zodat rechten direct kloppen
      await admin.from('profiles').upsert(
        { id: data.user.id, role: role ?? 'beheerder', club_id: club_id ?? null },
        { onConflict: 'id' },
      )

      return json({ success: true, user_id: data.user.id })
    }

    // UPDATE — wijzig rol en/of club_id in profiles
    if (action === 'update') {
      const { user_id, role, club_id } = body
      if (!user_id) return json({ error: 'user_id is verplicht' }, 400)

      // Bouw alleen de velden die meegegeven zijn
      const patch: Record<string, unknown> = {}
      if (role     !== undefined) patch.role    = role
      if (club_id  !== undefined) patch.club_id = club_id ?? null

      if (Object.keys(patch).length === 0) return json({ error: 'Geen velden om bij te werken' }, 400)

      const { error } = await admin.from('profiles').update(patch).eq('id', user_id)
      if (error) throw error

      return json({ success: true })
    }

    // DELETE — verwijder uit auth.users (cascade verwijdert profiles via FK)
    if (action === 'delete') {
      const { user_id } = body
      if (!user_id) return json({ error: 'user_id is verplicht' }, 400)

      // Prevent self-deletion (extra vangnet naast de frontend-check)
      if (user_id === caller.id) {
        return json({ error: 'Je kunt jezelf niet verwijderen' }, 400)
      }

      const { error } = await admin.auth.admin.deleteUser(user_id as string)
      if (error) throw error

      return json({ success: true })
    }

    return json({ error: `Onbekende actie: ${action}` }, 400)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Onbekende fout'
    return json({ error: msg }, 500)
  }
})
