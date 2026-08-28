// Persistenza locale: chi sei, la tua storia, quello che Ora ha capito di te,
// piu' il giorno corrente. Tutto resta sul dispositivo (o nel tuo spazio, se
// hai un account).

import { DEFAULT_PEOPLE } from './data.js'
import { DEFAULT_MODEL } from './ai.js'

const KEY = 'ora-state-v1'
// La chiave API vive in un cassetto suo, sempre e solo su questo dispositivo:
// così non può finire per sbaglio nel documento sincronizzato.
const API_KEY = 'ora-apikey'

export function readApiKey() {
  try { return localStorage.getItem(API_KEY) || '' } catch { return '' }
}
function writeApiKey(v) {
  try { v ? localStorage.setItem(API_KEY, v) : localStorage.removeItem(API_KEY) } catch { /* ignora */ }
}

export function todayKey(d = new Date()) {
  const p = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export const EMPTY_DONE = { checkin: false, meditate: false, move: false, connect: false, scarico: false, sera: false, letto: false }

export const DEFAULT_PERSISTED = {
  checkins: [],        // {word, core, intensity, tag?, ts}
  seraNotes: [],       // {text, ts, source:'diario'|'sera'} — diario e righe della sera, insieme
  convoLog: [],        // {who, tone, unsaid, ts}
  pauseLog: [],        // {choice, ts} — risposte scelte nel Momento difficile
  loops: [],           // {id, text, kind:'problema'|'preoccupazione', action?, dueAt?, ts, closedAt?}
  people: structuredClone(DEFAULT_PEOPLE), // {id, name, meta, opener} — modificabili

  // --- Memoria: chi sei, cosa mi hai detto, cosa ho capito ---
  profile: { lavoro: '', ritmi: '', pesa: '', bene: '', voce: '', segno: '' },
  memories: [],        // {id, text, ts, source:'chat'|'tu'} — cose durature che le hai detto
  chapters: [],        // {month:'2026-08', text, ts} — il racconto di un mese, scritto da Ora
  memoryUpTo: 0,       // fin dove ho gia' estratto ricordi dalla chat (indice messaggi)
  daily: null,         // {date, forKinds:[], items:[{kind,text}]} — le cose di oggi

  intention: '',       // intenzione settimanale "se X, allora Y"
  weeklyReport: null,  // {text, ts} — ultimo report generato
  days: {},            // 'YYYY-MM-DD' -> {done, water, moveWhen, movePos, moveMoved, listened, moveMin, sleep, meals}
  courseStep: 0,
  courseDone: [false, false, false, false, false, false, false],
  qIdx: 0,
  seraQIdx: 0,
  messages: [{ from: 'ora', text: 'Ciao, sono Ora. Conosco la tua giornata, non i tuoi contatti. Come va, adesso?' }],
  settings: { gentle: true, apiKey: '', model: DEFAULT_MODEL, dailyKinds: ['pensiero'], name: '', pattern: 'Calm six' },
}

export function loadPersisted() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...structuredClone(DEFAULT_PERSISTED), settings: { ...DEFAULT_PERSISTED.settings, apiKey: readApiKey() } }
    const data = JSON.parse(raw)
    // I giorni salvati da versioni precedenti potrebbero non avere i campi nuovi
    const days = Object.fromEntries(
      Object.entries(data.days || {}).map(([k, v]) => [k, {
        ...emptyDay(),
        ...v,
        done: { ...EMPTY_DONE, ...(v.done || {}) },
        meals: { colazione: false, pranzo: false, cena: false, ...(v.meals || {}) },
      }]),
    )
    return {
      ...structuredClone(DEFAULT_PERSISTED),
      ...data,
      days,
      // Una lista vuota è una scelta legittima; solo l'assenza va seminata.
      people: Array.isArray(data.people) ? data.people : structuredClone(DEFAULT_PEOPLE),
      profile: { ...DEFAULT_PERSISTED.profile, ...(data.profile || {}) },
      // La chiave arriva dal cassetto locale. Se è ancora vuoto perché questo
      // dispositivo viene da una versione precedente, la recupero dal vecchio
      // blob: il primo salvataggio la sposta nel cassetto e la toglie da lì.
      settings: {
        ...DEFAULT_PERSISTED.settings,
        ...(data.settings || {}),
        // Prima era una scelta sola: la porto nella lista senza perderla.
        dailyKinds: Array.isArray(data.settings?.dailyKinds)
          ? data.settings.dailyKinds
          : (data.settings?.dailyKind ? [data.settings.dailyKind] : ['pensiero']),
        apiKey: readApiKey() || data.settings?.apiKey || '',
      },
    }
  } catch {
    return structuredClone(DEFAULT_PERSISTED)
  }
}

export function savePersisted(p) {
  try {
    writeApiKey(p.settings.apiKey)
    const { apiKey, ...settings } = p.settings
    localStorage.setItem(KEY, JSON.stringify({ ...p, settings }))
  } catch { /* quota o modalità privata: si continua in memoria */ }
}

// Adotta lo stato che arriva dal cloud, tenendo la chiave di questo dispositivo.
export function adoptCloud(cloud) {
  const days = Object.fromEntries(
    Object.entries(cloud.days || {}).map(([k, v]) => [k, {
      ...emptyDay(),
      ...v,
      done: { ...EMPTY_DONE, ...(v.done || {}) },
      meals: { colazione: false, pranzo: false, cena: false, ...(v.meals || {}) },
    }]),
  )
  return {
    ...structuredClone(DEFAULT_PERSISTED),
    ...cloud,
    days,
    people: Array.isArray(cloud.people) ? cloud.people : structuredClone(DEFAULT_PEOPLE),
    profile: { ...DEFAULT_PERSISTED.profile, ...(cloud.profile || {}) },
    settings: {
      ...DEFAULT_PERSISTED.settings,
      ...(cloud.settings || {}),
      dailyKinds: Array.isArray(cloud.settings?.dailyKinds)
        ? cloud.settings.dailyKinds
        : (cloud.settings?.dailyKind ? [cloud.settings.dailyKind] : ['pensiero']),
      apiKey: readApiKey(),
    },
  }
}

export function emptyDay() {
  return {
    done: { ...EMPTY_DONE }, water: 0, moveWhen: 'Pomeriggio', movePos: 2, moveMoved: false, listened: false,
    moveMin: 0, sleep: null, meals: { colazione: false, pranzo: false, cena: false },
  }
}

// Ricomincia da zero: sparisce tutto quello che hai registrato, restano
// la chiave, il modello scelto e il tuo nome.
// La chiave e' della persona, non del dispositivo: uscendo se ne va con lei,
// cosi' su un telefono condiviso nessuno spende il credito di un altro.
export function clearApiKey() { writeApiKey('') }

export function freshStart(settings) {
  return { ...structuredClone(DEFAULT_PERSISTED), settings: { ...settings } }
}

export function exportAll(p) {
  const blob = new Blob([JSON.stringify(p, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `ora-dati-${todayKey()}.json`
  a.click()
  URL.revokeObjectURL(url)
}
