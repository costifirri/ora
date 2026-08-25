// Account e sincronizzazione. Tutto quello che registri segue l'account,
// con una sola eccezione deliberata: la chiave API non lascia mai il
// dispositivo (è una credenziale con addebiti — vedi withoutSecrets).

import { loadFirebase } from './firebase.js'

const DOC = uid => ['users', uid, 'private', 'state']

export function withoutSecrets(p) {
  const { apiKey, ...settings } = p.settings
  return { ...p, settings }
}

export async function watchAuth(cb) {
  const fb = await loadFirebase()
  if (!fb) { cb(null); return () => {} }
  return fb.fns.onAuthStateChanged(fb.auth, user => cb(user ? { uid: user.uid, email: user.email } : null))
}

export async function signUp(email, password) {
  const fb = await loadFirebase()
  await fb.fns.createUserWithEmailAndPassword(fb.auth, email.trim(), password)
}

export async function signIn(email, password) {
  const fb = await loadFirebase()
  await fb.fns.signInWithEmailAndPassword(fb.auth, email.trim(), password)
}

export async function signOutNow() {
  const fb = await loadFirebase()
  await fb.fns.signOut(fb.auth)
}

export async function resetPassword(email) {
  const fb = await loadFirebase()
  await fb.fns.sendPasswordResetEmail(fb.auth, email.trim())
}

export async function deleteAccount(password) {
  const fb = await loadFirebase()
  const user = fb.auth.currentUser
  if (!user) throw new Error('Non sei collegata.')
  // Firebase richiede un accesso recente per un'operazione così definitiva.
  const cred = fb.fns.EmailAuthProvider.credential(user.email, password)
  await fb.fns.reauthenticateWithCredential(user, cred)
  await fb.fns.deleteDoc(fb.fns.doc(fb.db, ...DOC(user.uid))).catch(() => {})
  await fb.fns.deleteUser(user)
}

export async function loadCloud(uid) {
  const fb = await loadFirebase()
  const snap = await fb.fns.getDoc(fb.fns.doc(fb.db, ...DOC(uid)))
  return snap.exists() ? snap.data() : null
}

export async function saveCloud(uid, p) {
  const fb = await loadFirebase()
  await fb.fns.setDoc(fb.fns.doc(fb.db, ...DOC(uid)), {
    ...withoutSecrets(p),
    updatedAt: Date.now(),
  })
}
