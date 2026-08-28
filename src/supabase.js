// Configurazione Supabase.
//
// Finché i due campi qui sotto restano vuoti, l'app funziona esattamente come
// prima: tutto in locale, nessun account, nessuna rete. Appena incolli i valori
// del tuo progetto, compare l'accesso e i dati seguono l'account su ogni
// dispositivo.
//
// Dove trovarli: supabase.com → il tuo progetto → Project Settings → API →
// "Project URL" e la chiave "anon public".
//
// La chiave anon NON è un segreto: identifica il progetto e non autorizza
// niente da sola. La sicurezza sta nelle policy RLS (vedi SUPABASE.md).

export const supabaseUrl = ''
export const supabaseAnonKey = ''

export const isConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// La tabella dove vive lo stato di ogni persona (una riga per account).
export const TABLE = 'ora_state'

// Il client pesa: si carica solo se serve davvero.
let ready = null
export function loadBackend() {
  if (!isConfigured) return Promise.resolve(null)
  if (!ready) {
    ready = import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: true, autoRefreshToken: true },
      }),
    )
  }
  return ready
}

// Messaggi in italiano al posto di quelli tecnici di Supabase.
export function authError(message = '') {
  const m = message.toLowerCase()
  if (m.includes('invalid login credentials')) return 'Email o password non corrispondono.'
  if (m.includes('email not confirmed')) return 'Devi prima confermare l’email: controlla la posta.'
  if (m.includes('user already registered')) return 'Esiste già un account con questa email. Prova ad accedere.'
  if (m.includes('password should be')) return 'La password è troppo corta: servono almeno sei caratteri.'
  if (m.includes('unable to validate email') || m.includes('invalid email')) return 'Questo indirizzo email non sembra valido.'
  if (m.includes('rate limit') || m.includes('too many')) return 'Troppi tentativi. Aspetta qualche minuto e riprova.'
  if (m.includes('failed to fetch') || m.includes('network')) return 'Connessione assente.'
  return 'Qualcosa non ha funzionato. Riprova tra poco.'
}
