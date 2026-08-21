# Ora — app di benessere (mente, corpo, legami)

Implementazione in produzione del design handoff `design_handoff_ora_wellness`: una PWA React
(Vite) in italiano, installabile su iPhone e Android, con tutti i dati salvati sul dispositivo.

## Che cos'è

Un flusso guidato della giornata — dalla colazione al letto, senza orari — più quattro sezioni:
**Corpo** (movimento, acqua, pasti), **Legami** (conversazioni vere), **Ora** (compagna AI) e
**Tu** (profilo e impostazioni). La "Modalità senza sensi di colpa" è attiva di default e nasconde
serie, punteggi e conteggi in tutta l'app.

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

- storico dei check-in (parola, sfumatura, intensità, timestamp)
- note del rituale della sera
- registro delle conversazioni
- completamento del flusso per giorno (più acqua, spostamento camminata, ascolto)
- avanzamento del percorso di meditazione
- chat e impostazioni

**Esporta i dati** in *Tu* scarica tutto come JSON.

## Scelte rispetto al prototipo

- **Conoscerti è calcolato**: la striscia della settimana e gli inneschi derivano dallo storico
  dei check-in intensi (fasce orarie). Finché i dati non bastano (< 3 picchi) si mostrano gli
  esempi del design, dichiarati come tali.
- **Il percorso avanza**: chiudere una sessione dopo più di 20 secondi segna il passo come fatto
  e sposta l'indicatore al successivo (nel prototipo era statico).
- **Icone Lucide** a stroke 2.75 (freccia indietro, invio, spunte, +/−) come da design system;
  la tab bar usa i punti da 10px come da spec di navigazione.
- Corpo: barre movimento e pasti restano illustrativi (serve un'integrazione salute/orologio);
  l'acqua è reale e per-giorno.

## Struttura

```
src/
  data.js        copy, flusso, ruota delle emozioni, pattern di respiro, cue narrate, fallback chat
  ai.js          system prompt + chiamata API Anthropic
  storage.js     persistenza localStorage e rollover del giorno
  App.jsx        stato, azioni, tick da 100ms (respiro/cue/countdown), routing e tab bar
  screens/       le 11 schermate (Home/Flusso, Checkin, Pausa, Pratica, Session, Sera,
                 Inneschi, Corpo, Legami, Coach, Profilo)
public/          manifest, icone, service worker
```

Il riferimento di design è in `..\design_handoff_ora_wellness` (README + prototipi HTML).
