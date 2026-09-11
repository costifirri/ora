// Il lavoro: quanto ci metti, e come ti lascia.
//
// Due cose separate, perche' non sono la stessa: l'impegno (quante ore, quanto
// pesante, a che ora hai staccato) e lo stato d'animo (come stai mentre ci sei
// dentro, e per colpa di cosa).
//
// Regola di questo file: non dico mai niente che i dati non reggano. Sotto una
// certa soglia taccio e lo dichiaro, invece di spacciare due giornate per una
// tendenza. Una frase falsa su come stai vale meno di nessuna frase.

import { HARD, POSITIVE, CORE } from './data.js'

const GIORNO = 86400000

export const chiave = (d = new Date()) => {
  const z = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`
}

export const CARICHI = [
  { k: 'leggero', label: 'Leggera', nota: 'Ci stava dentro tutto, senza correre.' },
  { k: 'giusto', label: 'Giusta', nota: 'Impegnativa ma sostenibile.' },
  { k: 'troppo', label: 'Troppo', nota: 'Più di quanto ci stia in una giornata.' },
]

export const CARICO_LABEL = { leggero: 'leggera', giusto: 'giusta', troppo: 'troppo pesante' }

// Le cause, divise: quelle che pesano e quelle che tengono su. Servono
// entrambe — un registro che raccoglie solo il brutto racconta una bugia.
export const CAUSE = [
  { k: 'riunioni', label: 'Riunioni', segno: 'pesa' },
  { k: 'scadenze', label: 'Scadenze', segno: 'pesa' },
  { k: 'troppo', label: 'Troppo da fare', segno: 'pesa' },
  { k: 'interruzioni', label: 'Interruzioni', segno: 'pesa' },
  { k: 'persona', label: 'Una persona', segno: 'pesa' },
  { k: 'incertezza', label: 'Non so cosa aspettarmi', segno: 'pesa' },
  { k: 'senso', label: 'Poco senso', segno: 'pesa' },
  { k: 'risultato', label: 'Un risultato', segno: 'tiene' },
  { k: 'scambio', label: 'Uno scambio buono', segno: 'tiene' },
  { k: 'riconoscimento', label: 'Mi hanno vista', segno: 'tiene' },
  { k: 'concentrazione', label: 'Ore di concentrazione', segno: 'tiene' },
  { k: 'niente', label: 'Niente di preciso', segno: 'neutro' },
]

export const causaLabel = k => CAUSE.find(c => c.k === k)?.label || k

export const ORE = [4, 6, 7, 8, 9, 10, 11, 12]

// Le emozioni, le stesse del resto dell'app: al lavoro non ne servono altre.
export const UMORI = CORE.map(c => c.key)

export const vuoto = () => ({ giorni: {}, momenti: [] })

export const giornoDi = (lavoro, d = new Date()) => (lavoro?.giorni || {})[chiave(d)] || null

export const momentiDi = (lavoro, d = new Date()) => {
  const k = chiave(d)
  return (lavoro?.momenti || []).filter(m => chiave(new Date(m.ts)) === k)
}

const hhmm = min => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(Math.round(min % 60)).padStart(2, '0')}`

// --- La settimana -------------------------------------------------------

export function settimana(lavoro, ora = Date.now()) {
  const da = ora - 7 * GIORNO
  const giorni = Object.entries(lavoro?.giorni || {})
    .map(([k, g]) => ({ ...g, k, quando: g.ts || new Date(k).getTime() }))
    .filter(g => g.quando >= da)
    .sort((a, b) => a.quando - b.quando)

  const conOre = giorni.filter(g => g.ore != null)
  const oreTot = conOre.reduce((s, g) => s + g.ore, 0)
  const staccati = giorni.map(g => g.staccato).filter(Boolean)
    .map(t => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5)))

  return {
    giorni,
    quante: giorni.length,
    oreTot,
    mediaOre: conOre.length ? oreTot / conOre.length : null,
    troppi: giorni.filter(g => g.carico === 'troppo').length,
    staccoMedio: staccati.length >= 2 ? hhmm(staccati.reduce((a, b) => a + b, 0) / staccati.length) : null,
  }
}

// --- Quello che si vede davvero -----------------------------------------

/**
 * Osservazioni oneste. Ognuna ha la sua soglia: sotto quella non compare.
 * Torna { righe: [], mancano: string|null }
 */
export function schemi(p, ora = Date.now()) {
  const lavoro = p.lavoro || vuoto()
  const giorni = Object.entries(lavoro.giorni).map(([k, g]) => ({ ...g, k }))
  const momenti = lavoro.momenti || []
  const righe = []

  // 1. Quanto lavori, davvero.
  const conOre = giorni.filter(g => g.ore != null).slice(-14)
  if (conOre.length >= 3) {
    const media = conOre.reduce((s, g) => s + g.ore, 0) / conOre.length
    righe.push(`Nelle ultime ${conOre.length} giornate che hai segnato hai lavorato in media ${media.toFixed(1).replace('.', ',')} ore.`)
  }

  // 2. Quante le senti troppo.
  const conCarico = giorni.filter(g => g.carico).slice(-14)
  if (conCarico.length >= 4) {
    const troppi = conCarico.filter(g => g.carico === 'troppo').length
    righe.push(troppi === 0
      ? `Nessuna delle ultime ${conCarico.length} giornate l'hai sentita troppo pesante.`
      : `${troppi} giornate su ${conCarico.length} le hai sentite troppo pesanti.`)
  }

  // 3. A che ora stacchi.
  const staccati = giorni.map(g => g.staccato).filter(Boolean).slice(-10)
  if (staccati.length >= 3) {
    const min = staccati.map(t => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5)))
    const media = min.reduce((a, b) => a + b, 0) / min.length
    const tardi = min.filter(m => m >= 19 * 60).length
    righe.push(`Stacchi in media alle ${hhmm(media)}` +
      (tardi >= 2 ? `, e ${tardi} volte su ${min.length} dopo le sette.` : '.'))
  }

  // 4. Cosa torna, nei momenti pesanti.
  const pesanti = momenti.filter(m => HARD.includes(m.umore) || m.intensita >= 4)
  if (pesanti.length >= 4) {
    const conta = {}
    pesanti.forEach(m => { if (m.causa && m.causa !== 'niente') conta[m.causa] = (conta[m.causa] || 0) + 1 })
    const top = Object.entries(conta).sort((a, b) => b[1] - a[1])[0]
    if (top && top[1] >= 2) {
      righe.push(`Quando al lavoro stai male, la causa che torna più spesso è "${causaLabel(top[0]).toLowerCase()}": ${top[1]} volte su ${pesanti.length}.`)
    }
  }

  // 5. Cosa ti tiene su. Conta quanto il resto.
  const buoni = momenti.filter(m => POSITIVE.includes(m.umore))
  if (buoni.length >= 3) {
    const conta = {}
    buoni.forEach(m => { if (m.causa && m.causa !== 'niente') conta[m.causa] = (conta[m.causa] || 0) + 1 })
    const top = Object.entries(conta).sort((a, b) => b[1] - a[1])[0]
    if (top && top[1] >= 2) {
      righe.push(`Nelle giornate buone torna "${causaLabel(top[0]).toLowerCase()}" (${top[1]} volte). È la cosa che al lavoro ti rimette in asse.`)
    }
  }

  // 6. Il legame tra il carico e come stai. Questo e' il dato che vale di piu'.
  const conCaricoE = giorni.filter(g => g.carico)
  if (conCaricoE.length >= 6) {
    const intensiIn = chiavi => (p.checkins || []).filter(c =>
      chiavi.includes(chiave(new Date(c.ts))) && c.intensity >= 4 && HARD.includes(c.core)).length
    const kTroppo = conCaricoE.filter(g => g.carico === 'troppo').map(g => g.k)
    const kAltri = conCaricoE.filter(g => g.carico !== 'troppo').map(g => g.k)
    if (kTroppo.length >= 2 && kAltri.length >= 2) {
      const a = intensiIn(kTroppo) / kTroppo.length
      const b = intensiIn(kAltri) / kAltri.length
      if (a > b * 1.5 && a >= 0.5) {
        righe.push('Nei giorni che chiami "troppo" segni più momenti intensi che negli altri. Il carico non resta al lavoro.')
      } else if (b > 0 && a <= b) {
        righe.push('Curiosamente, nei giorni pieni non stai peggio che negli altri. Il peso non è solo questione di quantità.')
      }
    }
  }

  // 7. Il sonno prima della giornata pesante.
  const conSonno = conCaricoE.filter(g => (p.days || {})[g.k]?.sleep != null)
  if (conSonno.length >= 5) {
    const poco = conSonno.filter(g => p.days[g.k].sleep <= 6)
    const tanto = conSonno.filter(g => p.days[g.k].sleep >= 7)
    if (poco.length >= 2 && tanto.length >= 2) {
      const qPoco = poco.filter(g => g.carico === 'troppo').length / poco.length
      const qTanto = tanto.filter(g => g.carico === 'troppo').length / tanto.length
      if (qPoco > qTanto + 0.25) {
        righe.push('Quando dormi sei ore o meno, molto più spesso la giornata di lavoro ti sembra troppo. Non è il lavoro che cambia: sei tu che arrivi con meno margine.')
      }
    }
  }

  const mancano = righe.length === 0
    ? (giorni.length + momenti.length === 0
      ? 'Qui non c’è ancora niente. Segna qualche giornata e qualche momento: dopo tre o quattro comincio a vedere qualcosa.'
      : 'Ancora presto per dire qualcosa di sensato. Servono almeno tre giornate segnate — preferisco tacere che inventare una tendenza.')
    : null

  return { righe, mancano }
}

// Una riga secca per il contesto che passo a Ora quando parlate.
export function perOra(p, ora = Date.now()) {
  const s = settimana(p.lavoro, ora)
  if (!s.quante) return null
  const pezzi = [`${s.quante} giornate di lavoro segnate negli ultimi 7 giorni`]
  if (s.mediaOre) pezzi.push(`in media ${s.mediaOre.toFixed(1)} ore`)
  if (s.troppi) pezzi.push(`${s.troppi} sentite come troppo`)
  if (s.staccoMedio) pezzi.push(`stacca in media alle ${s.staccoMedio}`)
  const oggi = momentiDi(p.lavoro)
  if (oggi.length) pezzi.push(`oggi al lavoro ha segnato: ${oggi.map(m => m.umore.toLowerCase()).join(', ')}`)
  return pezzi.join('; ')
}
