# Ora — app di benessere (mente, corpo, legami)

Implementazione in produzione del design handoff `design_handoff_ora_wellness`: una PWA React
(Vite) in italiano, installabile su iPhone e Android, con tutti i dati salvati sul dispositivo.

## Che cos'è

Una presenza, non uno schedario. L'app apre su **una cosa sola** — quella che conta adesso — scritta
con la voce di Ora. La "Modalità senza sensi di colpa" è attiva di default e nasconde serie,
punteggi e conteggi ovunque.

### Architettura (v3)

Tre tab, più due schermate raggiungibili da lì:

| Dove | Cosa | Uso |
| --- | --- | --- |
| **Ora** (home) | Una scheda sola: la riga di Ora, la cosa di adesso, l'azione. Sotto: Momento difficile e l'ingresso alla conversazione. | Quotidiano, molte volte al giorno |
| **Te** | Sintesi della settimana + la tua regola, poi tre lenti: *Come stai* (emozioni, inneschi, note), *Corpo*, *Legami* | Riflessione, una volta ogni tanto |
| **Pratica** | Il percorso di meditazione e le pratiche brevi | Quando ti siedi |
| Chat con Ora | Dalla home, a un tocco | Quando vuoi parlare |
| Profilo | Dall'avatar in alto a destra | Raramente |

**I sette momenti della giornata non compaiono più come lista.** Restano nel motore
(`src/nowCard.js`): ogni momento ha una finestra oraria, e la home mostra il primo non fatto la cui
finestra contiene l'ora attuale. Niente barra di avanzamento, niente "2 di 7", niente da spuntare —
solo *"Più tardi: …"* come accenno a cosa viene dopo. Fuori da ogni finestra, Ora dice semplicemente
che è lì.

## Avvio

```bash
npm install
npm run dev
```

Build di produzione: `npm run build` (output in `dist/`, pronto per GitHub Pages o qualsiasi
hosting statico — il base path è relativo).

## Installazione sul telefono

Apri l'app pubblicata in Safari (iOS) o Chrome (Android) → *Aggiungi alla schermata Home*.
Manifest, icone e service worker sono già configurati; dopo la prima visita funziona anche offline
(la chat AI esclusa).

## La compagna AI

Senza configurazione, Ora risponde con frasi preparate (fallback a parole chiave, come nel
prototipo). Per le risposte vere: **profilo (avatar) → La voce di Ora** e incolla una chiave API
Anthropic (`sk-ant-…`). Il system prompt e il blocco di contesto utente sono portati verbatim dal
prototipo (`src/ai.js`); le risposte sotto i 25 caratteri vengono scartate in favore del fallback.

**Il modello predefinito è `claude-haiku-4-5`** ($1/$5 per milione di token). Ora scrive due frasi
calde e un report di due paragrafi: non serve un modello da ragionamento, e la differenza di costo
è circa 10× rispetto a Opus. Dal profilo si può passare a Sonnet o Opus.

Attenzione a una differenza d'API tra i modelli, gestita da `tuning()` in `src/ai.js`: **Haiku 4.5
non accetta `output_config.effort`** (restituisce 400) e non ragiona se non glielo si chiede,
mentre sui modelli 5 il ragionamento è attivo di default e si paga come output — lì si passa
`effort: 'low'`.

## Persistenza (localStorage, chiave `ora-state-v1`)

- storico dei check-in (parola, sfumatura, intensità, innesco, timestamp)
- diario e note del rituale della sera (stesso archivio)
- registro delle conversazioni
- risposte scelte nel Momento difficile
- intenzione della settimana e ultimo report generato
- completamento del flusso per giorno (acqua, minuti di movimento, sonno, pasti, spostamento camminata, ascolto)
- avanzamento del percorso di meditazione
- chat e impostazioni

**Esporta i dati** nel profilo scarica tutto come JSON.

### Privacy

Il diario e le tre righe della sera **vengono letti da Ora** (le ultime pagine nel contesto della
chat, tutto il mese nel racconto mensile). È una scelta esplicita dell'utente, presa in v5.0: la
copy in `Sera.jsx`, in `SchemiSection.jsx` e nel `contextBlock` è stata cambiata di conseguenza.
Regola: **se cambia la promessa, cambia anche dove è scritta** — l'app non deve mai dire una cosa
e farne un'altra.

Tutto ciò che Ora ricorda è visibile e cancellabile in *Te → Cosa so di te*. Nessuna memoria
invisibile o non correggibile: è la differenza tra una compagna e una sorveglianza.

La **chiave API non lascia mai il dispositivo**: vive in un cassetto localStorage separato
(`ora-apikey`) e viene esclusa da tutto ciò che si sincronizza (`withoutSecrets` in `src/cloud.js`).
È una credenziale con addebiti: un database compromesso non deve poter diventare una bolletta.

## Account (facoltativi)

`src/firebase.js` nasce con i campi vuoti: così l'app è interamente locale, senza rete né account.
Compilando la configurazione di un progetto Firebase si attivano registrazione via email,
accesso e sincronizzazione — tutto quello che registri segue l'account su qualsiasi dispositivo,
con regole Firestore che lasciano leggere solo al proprietario.

Istruzioni complete, regole di sicurezza e costi: **[FIREBASE.md](FIREBASE.md)**.

Il codice di Firebase è caricato con un import dinamico: chi non attiva gli account non lo scarica
nemmeno.

## Scelte rispetto al prototipo

- **Conoscerti è calcolato**: la striscia della settimana e gli inneschi derivano dallo storico
  dei check-in intensi (fasce orarie). Finché i dati non bastano (< 3 picchi) si mostrano gli
  esempi del design, dichiarati come tali.
- **Il percorso avanza**: chiudere una sessione dopo più di 20 secondi segna il passo come fatto
  e sposta l'indicatore al successivo (nel prototipo era statico).
- **Icone Lucide** a stroke 2.75 (freccia indietro, invio, spunte, +/−) come da design system;
  la tab bar usa i punti da 10px come da spec di navigazione.
- **Corpo è reale**: movimento (minuti), sonno (ore) e pasti si registrano in due tocchi, per giorno.
  Niente integrazione salute/orologio (non accessibile da PWA), quindi niente dati stimati:
  l'insight in fondo confronta i giorni con e senza movimento sui picchi registrati.
- **Tu** ha una sola impostazione reale (modalità senza sensi di colpa): i toggle di sincronizzazione,
  promemoria e condivisione sono stati rimossi perché non facevano nulla. I promemoria push
  richiederebbero un server.

## Estensioni oltre il handoff

Aggiunte per sostenere l'uso quotidiano, nello spirito del design (nessun punteggio, nessuna serie):

- **Innesco nel check-in** — una domanda facoltativa che si ribalta con l'emozione: quando stai male
  *"cosa è successo poco prima?"* (`TRIGGER_TAGS`), quando stai bene *"cosa te l'ha data?"*
  (`GOOD_TAGS`). Da tre check-in taggati in poi, gli inneschi si calcolano da questi invece che
  dalle fasce orarie.
- **Cosa ti rimette insieme** — il conto speculare agli inneschi, sui check-in buoni
  (`POSITIVE`, nessuna soglia d'intensità: una calma lieve vale quanto una piena). Prima questa
  scheda era testo fisso del design (`SEED_HELPERS`) che finiva nel contesto AI etichettato
  "per esperienza": non era la sua esperienza. Ora o è calcolato e lo dice, o è dichiarato esempio
  e il contesto avverte il modello di *non darlo per noto*.
- **Risposte contate** — la scelta finale del Momento difficile viene salvata: *Conoscerti* mostra
  quante volte hai risposto invece di reagire.
- **Rilettura delle note della sera** — le ultime sette, con la data, in *Conoscerti*.
- **Regola della settimana** — un'intenzione "se X, allora Y" in *Tu*, con esempi da cui partire;
  entra nel contesto dell'AI.
- **Report settimanale AI** — due paragrafi scritti da Ora sui dati veri.
  Senza chiave API, un riepilogo locale calcolato.
- **Un pensiero che gira** (pillola in home, sorella del Momento difficile) — lo strumento contro
  la ruminazione. Non e' un posto dove scrivere: e' un bivio di un minuto. Nomini il pensiero
  (astratto → concreto), poi l'unica domanda che divide: *puoi farci qualcosa?* Se si', il primo
  passo piu' piccolo e diventa un'azione; se no, gli dai un orario (`quandoTs` in `data.js`) e a
  quell'ora torna in home a chiederti se conta ancora. Vive in `p.loops`; i pensieri aperti entrano
  nel contesto di Ora, i passi ancora aperti tornano in home (max 2, solo degli ultimi 7 giorni:
  un promemoria, non una lista di cose da fare) e ogni pensiero compare nel calendario, nel giorno
  in cui l'hai scritto.
- **Diario** (dalla home, "Scrivi nel diario") — scrittura libera, quando vuoi, piu' volte al giorno.
  Condivide l'archivio con le tre righe del rituale della sera (`p.seraNotes`, campo `source`):
  un solo mucchio di scritti, cosi' calendario, memoria e racconto dei mesi li leggono tutti
  senza doppioni.
- **Una cosa per oggi** — pensiero, curiosita' e oroscopo, a **selezione multipla**
  (`settings.dailyKinds`). Con la chiave le scrive Ora conoscendoti, una chiamata per tipo;
  senza chiave pensiero e curiosita' ruotano da un elenco locale e l'oroscopo semplicemente non
  compare, invece di mostrare qualcosa che oroscopo non e'.
- **Suggerimento di nutrimento del giorno** — scelto dal contesto reale (sonno breve, picco di oggi,
  pasto non ancora segnato all'ora giusta, acqua bassa), poi ruotato per giorno. Nessuna chiamata AI:
  è istantaneo e funziona offline. I testi vivono in `NUTRITION_TIPS` (`src/data.js`), la selezione
  in `dailyTip()`.

## Struttura

```
src/
  data.js        copy, momenti, ruota delle emozioni, respiro, cue narrate, tip, fallback chat
  nowCard.js     decide la sola cosa che conta adesso (finestre orarie + voce di Ora)
  ai.js          system prompt, chat e report settimanale
  storage.js     persistenza localStorage e rollover del giorno
  App.jsx        stato, azioni, tick da 100ms (respiro/cue/countdown), routing e tab bar
  screens/       Oggi (home), Te, Pratica, Checkin, Pausa, Session, Sera, Coach, Profilo
  sections/      le tre lenti di Te: CorpoSection, SchemiSection, LegamiSection
public/          manifest, icone, service worker
```

Il riferimento di design è in `..\design_handoff_ora_wellness` (README + prototipi HTML).
