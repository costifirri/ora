// Il giardino non lo pianti tu: cresce da quello che hai fatto davvero.
//
// Ogni fiore e' un momento in cui hai detto come stavi. Ogni cespuglio e' una
// settimana in cui ti sei fermata a praticare. Ogni albero e' un mese passato
// insieme. Ogni sasso e' una volta in cui hai scelto una risposta invece di
// reagire. Niente e' inventato: se il giardino e' spoglio, e' perche' e'
// presto — non perche' l'app vuole spingerti a riempirlo.
//
// Sopra ci passano le stagioni vere, quelle del calendario.

import { rng } from './garden.js'
import { HARD, POSITIVE } from './data.js'

const GIORNO = 86400000

// --- Le stagioni --------------------------------------------------------

export const STAGIONI = {
  primavera: {
    nome: 'primavera',
    cielo: ['#cfe4ec', '#f2f0e0'],
    prato: ['#8fae63', '#7d9c56'],
    chioma: '#7fa457', cespuglio: '#86a558', fiorAlbero: '#f2c9d8', terra: '#8a6c4c',
    riga: 'È primavera: tutto riparte, anche quello che sembrava fermo.',
  },
  estate: {
    nome: 'estate',
    cielo: ['#bfdcea', '#f6f1dc'],
    prato: ['#7d9c50', '#6b8b45'],
    chioma: '#5f8a43', cespuglio: '#5d8842', fiorAlbero: null, terra: '#8d7052',
    riga: 'È estate: il giardino è al massimo del suo verde.',
  },
  autunno: {
    nome: 'autunno',
    cielo: ['#e3d3bd', '#f6ebd8'],
    prato: ['#a09257', '#8d8049'],
    chioma: '#c98a3c', cespuglio: '#7d8a45', fiorAlbero: null, terra: '#7d6244',
    riga: 'È autunno: le foglie cadono, e va bene che cadano.',
  },
  inverno: {
    nome: 'inverno',
    cielo: ['#c9d3dd', '#eef1f2'],
    prato: ['#b9bfb4', '#a9b1a6'],
    chioma: null, cespuglio: '#93a596', fiorAlbero: null, terra: '#6f6353',
    riga: 'È inverno: sotto la neve non è morto niente, sta solo aspettando.',
  },
}

export function stagioneDi(d = new Date()) {
  const m = d.getMonth()
  if (m >= 2 && m <= 4) return 'primavera'
  if (m >= 5 && m <= 7) return 'estate'
  if (m >= 8 && m <= 10) return 'autunno'
  return 'inverno'
}

// Quanto manca alla prossima, per poterlo dire.
export function verso(d = new Date()) {
  const m = d.getMonth()
  const prossimo = [2, 5, 8, 11].find(x => x > m)
  const anno = prossimo === undefined ? d.getFullYear() + 1 : d.getFullYear()
  const mese = prossimo === undefined ? 2 : prossimo
  const giorni = Math.round((new Date(anno, mese, 1) - d) / GIORNO)
  const dopo = { primavera: 'estate', estate: 'autunno', autunno: 'inverno', inverno: 'primavera' }[stagioneDi(d)]
  return { dopo, giorni }
}

// --- Da quello che hai fatto, a quello che cresce ------------------------

const fmt = ts => new Date(ts).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })

const MAX = { fiori: 46, cespugli: 9, alberi: 7, sassi: 14 }

// Il colore del fiore viene dall'emozione, non a caso: i giorni buoni sono
// chiari, quelli duri piu' profondi. Nessuno dei due e' brutto da guardare.
function tintaFiore(core, intensita) {
  if (POSITIVE.includes(core)) return ['#e79bb6', '#efbb5c', '#cf9ad6', '#f0a86e'][intensita % 4]
  if (HARD.includes(core)) return ['#7286bd', '#9b78b5', '#5f8aa8', '#b96e80'][intensita % 4]
  return ['#dcc9a4', '#cdbb98'][intensita % 2]
}

const settimanaDi = ts => {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return d.getTime()
}

/**
 * Legge lo stato e restituisce cosa c'e' nel giardino, con il perche'.
 */
export function coltiva(p, ora = Date.now()) {
  const fiori = [...(p.checkins || [])]
    .slice(-MAX.fiori)
    .map((c, i) => {
      const r = rng('fiore' + c.ts)
      return {
        id: `f-${c.ts}`, tipo: 'fiore',
        x: 0.05 + r() * 0.9, z: 0.35 + r() * 0.65,
        tinta: tintaFiore(c.core, c.intensity || 3),
        alto: 0.95 + r() * 0.7,
        petali: 5 + Math.floor(r() * 3),
        quando: c.ts,
        titolo: c.word,
        racconto: `Il ${fmt(c.ts)} ti sei fermata e hai detto: ${String(c.word).toLowerCase()}.`,
      }
    })

  // Le settimane in cui hai praticato almeno una volta.
  const settimane = [...new Set(
    Object.entries(p.days || {})
      .filter(([, d]) => d.done && (d.done.meditate || d.done.sera || d.done.letto))
      .map(([k]) => settimanaDi(new Date(k).getTime())),
  )].sort().slice(-MAX.cespugli)

  const cespugli = settimane.map(w => {
    const r = rng('cespuglio' + w)
    return {
      id: `c-${w}`, tipo: 'cespuglio',
      x: 0.06 + r() * 0.88, z: 0.16 + r() * 0.34,
      grande: 0.75 + r() * 0.5,
      verso: r() > 0.5 ? 1 : -1,
      quando: w,
      titolo: 'Una settimana di pratica',
      racconto: `Nella settimana del ${fmt(w)} ti sei seduta almeno una volta.`,
    }
  })

  // Un albero per ogni mese in cui hai lasciato una traccia.
  const mesi = [...new Set([
    ...(p.checkins || []).map(c => c.ts),
    ...(p.seraNotes || []).map(n => n.ts),
  ].map(ts => { const d = new Date(ts); return new Date(d.getFullYear(), d.getMonth(), 1).getTime() }))]
    .sort().slice(-MAX.alberi)

  const alberi = mesi.map((m, i) => {
    const r = rng('albero' + m)
    const eta = Math.min(1, (ora - m) / (150 * GIORNO))
    return {
      id: `a-${m}`, tipo: 'albero',
      x: mesi.length === 1 ? 0.5 : 0.08 + (i / Math.max(1, mesi.length - 1)) * 0.84 + (r() * 0.06 - 0.03),
      z: 0.02 + r() * 0.1,
      grande: 0.6 + eta * 0.6,
      quando: m,
      titolo: new Date(m).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' }),
      racconto: `Un mese passato insieme. Cresce ancora, da solo.`,
    }
  })

  // Un sasso per ogni volta che ti sei fermata invece di reagire.
  const sassi = [...(p.pauseLog || [])].slice(-MAX.sassi).map(x => {
    const r = rng('sasso' + x.ts)
    return {
      id: `s-${x.ts}`, tipo: 'sasso',
      x: 0.04 + r() * 0.92, z: 0.45 + r() * 0.55,
      grande: 0.7 + r() * 0.6, rot: r() * 60 - 30,
      quando: x.ts,
      titolo: 'Una risposta, non una reazione',
      racconto: `Il ${fmt(x.ts)} hai scelto: ${String(x.choice || '').toLowerCase() || 'di fermarti'}.`,
    }
  })

  return { fiori, cespugli, alberi, sassi }
}

export function riassunto(g) {
  const parti = []
  if (g.alberi.length) parti.push(`${g.alberi.length} ${g.alberi.length === 1 ? 'mese' : 'mesi'}`)
  if (g.cespugli.length) parti.push(`${g.cespugli.length} ${g.cespugli.length === 1 ? 'settimana di pratica' : 'settimane di pratica'}`)
  if (g.fiori.length) parti.push(`${g.fiori.length} ${g.fiori.length === 1 ? 'volta in cui hai detto come stavi' : 'volte in cui hai detto come stavi'}`)
  if (g.sassi.length) parti.push(`${g.sassi.length} ${g.sassi.length === 1 ? 'risposta al posto di una reazione' : 'risposte al posto di reazioni'}`)
  return parti
}
