// Configurazione Firebase.
//
// Finché i campi qui sotto restano vuoti, l'app funziona esattamente come
// prima: tutto in locale, nessun account, nessuna rete. Appena incolli la
// configurazione del tuo progetto, compare l'accesso e i dati seguono
// l'account su ogni dispositivo.
//
// Dove trovarla: console.firebase.google.com → il tuo progetto →
// Impostazioni progetto → Le tue app → App web → Configurazione SDK.
//
// Questi valori NON sono segreti: identificano il progetto, non autorizzano
// nulla. La sicurezza sta nelle regole Firestore (vedi FIREBASE.md).

export const firebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
}

export const isConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)

// Il modulo Firebase pesa: si carica solo se serve davvero.
let ready = null
export function loadFirebase() {
  if (!isConfigured) return Promise.resolve(null)
  if (!ready) {
    ready = Promise.all([
      import('firebase/app'),
      import('firebase/auth'),
      import('firebase/firestore'),
    ]).then(([app, auth, store]) => {
      const instance = app.getApps().length ? app.getApp() : app.initializeApp(firebaseConfig)
      return {
        auth: auth.getAuth(instance),
        db: store.getFirestore(instance),
        fns: { ...auth, ...store },
      }
    })
  }
  return ready
}

// Messaggi d'errore in italiano, al posto dei codici di Firebase.
export function authError(code) {
  const map = {
    'auth/invalid-email': 'Questo indirizzo email non sembra valido.',
    'auth/missing-password': 'Manca la password.',
    'auth/weak-password': 'La password è troppo corta: servono almeno sei caratteri.',
    'auth/email-already-in-use': 'Esiste già un account con questa email. Prova ad accedere.',
    'auth/invalid-credential': 'Email o password non corrispondono.',
    'auth/wrong-password': 'Email o password non corrispondono.',
    'auth/user-not-found': 'Non c’è nessun account con questa email.',
    'auth/too-many-requests': 'Troppi tentativi. Aspetta qualche minuto e riprova.',
    'auth/network-request-failed': 'Connessione assente.',
  }
  return map[code] || 'Qualcosa non ha funzionato. Riprova tra poco.'
}
