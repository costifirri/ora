# Attivare gli account

Finché `src/firebase.js` ha i campi vuoti, Ora funziona come sempre: tutto in locale, nessun
account, nessuna rete. Questi passaggi accendono la registrazione e la sincronizzazione.

Servono circa dieci minuti, una volta sola. Il piano gratuito di Firebase (Spark) regge
tranquillamente decine di persone che usano un'app come questa.

## 1. Crea il progetto

1. Vai su [console.firebase.google.com](https://console.firebase.google.com) e accedi con il tuo
   account Google.
2. **Aggiungi progetto** → chiamalo `ora` → puoi disattivare Google Analytics, non serve.

## 2. Accendi l'accesso via email

1. Nel menù a sinistra: **Build → Authentication → Get started**.
2. Nella scheda **Sign-in method**, apri **Email/Password** e attiva la prima levetta
   (lascia spenta "Email link"). Salva.

## 3. Crea il database

1. **Build → Firestore Database → Create database**.
2. Scegli una posizione europea (`eur3` o `europe-west`) e parti in **production mode**:
   le regole giuste le mettiamo al passo dopo.

## 4. Metti le regole di sicurezza

Nella scheda **Rules** di Firestore, incolla esattamente questo e pubblica:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Ogni persona legge e scrive soltanto il proprio spazio.
    match /users/{uid}/private/{document} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

Questa è la parte che conta davvero: senza queste regole i dati sarebbero leggibili da chiunque,
con queste ogni account vede solo i propri.

## 5. Copia la configurazione nell'app

1. **Impostazioni progetto** (l'ingranaggio in alto a sinistra) → scorri fino a **Le tue app** →
   icona `</>` (**App web**) → dai un nome qualsiasi → **Registra app**.
2. Compare un blocco `firebaseConfig` con sei valori: copiali in `src/firebase.js`.
3. Nella stessa pagina, sezione **Domini autorizzati** di Authentication, aggiungi
   `costifirri.github.io` (localhost c'è già di suo).

Poi `npm run deploy`. Alla prossima apertura l'app chiede di entrare o creare uno spazio.

## Cosa sincronizza e cosa no

| Cosa | Dove vive |
| --- | --- |
| Check-in, inneschi, corpo, legami, percorso, note della sera, regola, chat | Nel tuo spazio: ti seguono su ogni dispositivo, leggibili solo dal tuo account |
| **Chiave API di Ora** | **Solo sul dispositivo dove la incolli.** Non sale mai nel cloud |

La chiave resta fuori di proposito: è una credenziale che comporta addebiti, e un database
compromesso significherebbe chiavi rubate. Ognuno la inserisce una volta per telefono
(`src/cloud.js` → `withoutSecrets`, `src/storage.js` → cassetto `ora-apikey`).

## Al primo accesso

Se apri l'app su un dispositivo dove avevi già dei dati locali e crei il tuo spazio, quei dati
vengono portati su. Se invece lo spazio esiste già, vince quello che c'è nel cloud.

## Costi

Firestore sul piano gratuito dà 50.000 letture e 20.000 scritture al giorno. Ora scrive al massimo
una volta ogni secondo e mezzo, e solo quando cambi qualcosa: per un uso normale sono decine di
scritture al giorno a persona. Se un giorno servisse di più, il passaggio al piano a consumo si fa
dalla console senza toccare il codice.
