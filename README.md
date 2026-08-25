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
prototipo). Per le risposte vere: **Tu → Compagna AI** e incolla una chiave API Anthropic
(`sk-ant-…`). La chiave resta nel localStorage del dispositivo e le chiamate vanno dirette
all'API Anthropic (modello `claude-sonnet-5`, max 500 token; risposte sotto i 25 caratteri
vengono scartate in favore del fallback). Il system prompt e il blocco di contesto utente sono
portati verbatim dal prototipo (`src/ai.js`).

## Persistenza (localStorage, chiave `ora-state-v1`)

- storico dei check-in (parola, sfumatura, intensità, innesco, timestamp)
- note del rituale della sera
- registro delle conversazioni
- risposte scelte nel Momento difficile
- intenzione della settimana e ultimo report generato
- completamento del flusso per giorno (acqua, minuti di movimento, sonno, pasti, spostamento camminata, ascolto)
- avanzamento del percorso di meditazione
- chat e impostazioni

**Esporta i dati** in *Tu* scarica tutto come JSON.

### Privacy

Le tre righe del rituale della sera **non vengono mai inviate all'AI**: né in chat né nel report.
L'app promette "nessuno le leggerà" e il blocco di contesto lo dichiara esplicitamente al modello.
Sono rileggibili solo in *Conoscerti*, sul dispositivo.

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

- **Innesco nel check-in** — una domanda facoltativa "cosa è successo poco prima?" con sei tag.
  Da tre check-in intensi taggati in poi, *Conoscerti* calcola gli inneschi da questi invece che
  dalle fasce orarie.
- **Risposte contate** — la scelta finale del Momento difficile viene salvata: *Conoscerti* mostra
  quante volte hai risposto invece di reagire.
- **Rilettura delle note della sera** — le ultime sette, con la data, in *Conoscerti*.
- **Regola della settimana** — un'intenzione "se X, allora Y" in *Tu*, con esempi da cui partire;
  entra nel contesto dell'AI.
- **Report settimanale AI** — due paragrafi scritti da Ora sui dati veri (senza le note della sera).
  Senza chiave API, un riepilogo locale calcolato.
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
