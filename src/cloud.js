// Account e sincronizzazione, su Supabase. Tutto quello che registri segue
// l'account, con una sola eccezione deliberata: la chiave API non lascia mai
// il dispositivo (è una credenziale con addebiti — vedi withoutSecrets).

import { loadBackend, TABLE } from './supabase.js'

export function withoutSecrets(p) {
  const { apiKey, ...settings } = p.settings
  return { ...p, settings }
}

const utente = session => (session?.user ? { uid: session.user.id, email: session.user.email } : null)

export async function watchAuth(cb) {
  const sb = await loadBackend()
  if (!sb) { cb(null); return () => {} }
  // Prima chi sei adesso, poi resta in ascolto dei cambiamenti.
  try {
    const { data: { session } } = await sb.auth.getSession()
    cb(utente(session))
  } catch {
    cb(null)
  }
  // L'evento serve: quando arrivi dal link "ho dimenticato la password",
  // Supabase ti fa entrare ma la password resta quella vecchia. Senza questo
  // segnale rientri e basta, e la prossima volta sei di nuovo fuori.
  const { data } = sb.auth.onAuthStateChange((evento, sess) => cb(utente(sess), evento))
  return () => data.subscription.unsubscribe()
}

// Ritorna true se sei già dentro; false se il progetto chiede la conferma
// via email, così la schermata può dirtelo invece di lasciarti in attesa.
export async function signUp(email, password) {
  const sb = await loadBackend()
  const { data, error } = await sb.auth.signUp({ email: email.trim(), password })
  if (error) throw error
  return Boolean(data.session)
}

export async function signIn(email, password) {
  const sb = await loadBackend()
  const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password })
  if (error) throw error
}

// Scrive una password nuova su chi e' collegata adesso.
export async function changePassword(nuova) {
  const sb = await loadBackend()
  const { error } = await sb.auth.updateUser({ password: nuova })
  if (error) throw error
}

export async function signOutNow() {
  const sb = await loadBackend()
  await sb.auth.signOut()
}

export async function resetPassword(email) {
  const sb = await loadBackend()
  const { error } = await sb.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: window.location.origin + window.location.pathname,
  })
  if (error) throw error
}

// Cancella i dati e poi l'account, tramite la funzione delete_me creata nel
// progetto (un client non può eliminare un utente da solo). Prima però
// riverifica la password: è un'operazione senza ritorno.
export async function deleteAccount(password) {
  const sb = await loadBackend()
  const { data: { session } } = await sb.auth.getSession()
  if (!session) throw new Error('Non sei collegata.')
  const { error: authErr } = await sb.auth.signInWithPassword({ email: session.user.email, password })
  if (authErr) throw authErr
  await sb.from(TABLE).delete().eq('user_id', session.user.id)
  const { error } = await sb.rpc('delete_me')
  if (error) throw error
  await sb.auth.signOut()
}

export async function loadCloud(uid) {
  const sb = await loadBackend()
  const { data, error } = await sb.from(TABLE).select('data').eq('user_id', uid).maybeSingle()
  if (error) throw error
  return data?.data || null
}

export async function saveCloud(uid, p) {
  const sb = await loadBackend()
  const { error } = await sb.from(TABLE).upsert({
    user_id: uid,
    data: withoutSecrets(p),
    updated_at: new Date().toISOString(),
  })
  if (error) throw error
}
