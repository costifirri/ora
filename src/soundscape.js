// I suoni non sono registrazioni: li costruisce il telefono, partendo da
// rumore filtrato. Cosi' l'app non pesa un megabyte in piu', funzionano senza
// rete, e non finiscono mai — non c'e' un punto in cui il nastro ricomincia.
//
// Vive fuori dai componenti di proposito: se cambi schermata il suono continua,
// che e' tutto il punto di averlo.

export const SUONI = [
  { k: 'pioggia', label: 'Pioggia', nota: 'Fitta e continua, come dietro una finestra.' },
  { k: 'mare', label: 'Mare', nota: 'Onde lunghe che vanno e vengono.' },
  { k: 'vento', label: 'Vento', nota: 'Tra gli alberi, a folate lente.' },
  { k: 'fuoco', label: 'Fuoco', nota: 'Un camino, con i suoi scoppiettii.' },
]

export const DURATE = [
  { min: 15, label: '15 min' },
  { min: 30, label: '30 min' },
  { min: 60, label: "un'ora" },
  { min: 0, label: 'finché non lo spengo' },
]

let ctx = null
let master = null
let nodi = []
let crackleT = null
let fineT = null

let stato = { attivo: null, volume: 0.6, fineAt: null, durata: 30 }
const ascoltatori = new Set()

const avvisa = () => ascoltatori.forEach(fn => fn({ ...stato }))

export function subscribe(fn) {
  ascoltatori.add(fn)
  fn({ ...stato })
  return () => ascoltatori.delete(fn)
}

export const getStato = () => ({ ...stato })

// Rumore di partenza. "brown" e' piu' cupo e profondo del bianco: e' quello
// che regge mare e fuoco, mentre pioggia e vento vogliono il bianco.
function rumore(secondi, tipo) {
  const len = Math.floor(ctx.sampleRate * secondi)
  const buf = ctx.createBuffer(1, len, ctx.sampleRate)
  const d = buf.getChannelData(0)
  if (tipo === 'brown') {
    let ultimo = 0
    for (let i = 0; i < len; i++) {
      const bianco = Math.random() * 2 - 1
      ultimo = (ultimo + 0.02 * bianco) / 1.02
      d[i] = ultimo * 3.5
    }
  } else {
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
  }
  return buf
}

function sorgente(tipo, secondi = 4) {
  const src = ctx.createBufferSource()
  src.buffer = rumore(secondi, tipo)
  src.loop = true
  src.start()
  nodi.push(src)
  return src
}

function filtro(type, frequency, Q = 1) {
  const f = ctx.createBiquadFilter()
  f.type = type
  f.frequency.value = frequency
  f.Q.value = Q
  nodi.push(f)
  return f
}

// Un'oscillazione lentissima, per far respirare il suono invece di lasciarlo
// piatto: e' la differenza tra "onde" e "sibilo".
function lento(periodo, ampiezza, centro, target) {
  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.value = 1 / periodo
  const g = ctx.createGain()
  g.gain.value = ampiezza
  osc.connect(g).connect(target)
  target.value = centro
  osc.start()
  nodi.push(osc, g)
}

function guadagno(v) {
  const g = ctx.createGain()
  g.gain.value = v
  nodi.push(g)
  return g
}

function costruisci(k) {
  if (k === 'pioggia') {
    const alto = sorgente('white')
    const hp = filtro('highpass', 500)
    const lp = filtro('lowpass', 7000)
    alto.connect(hp).connect(lp).connect(guadagno(0.5)).connect(master)
    // Il fondo: la pioggia non e' solo sibilo, sotto c'e' un rimbombo.
    const basso = sorgente('brown')
    const blp = filtro('lowpass', 500)
    basso.connect(blp).connect(guadagno(0.35)).connect(master)
    return
  }

  if (k === 'mare') {
    const src = sorgente('brown', 6)
    const lp = filtro('lowpass', 600, 0.7)
    const g = guadagno(0.5)
    src.connect(lp).connect(g).connect(master)
    // L'onda: nove secondi per salire e scendere, come un respiro molto lungo.
    lento(9, 0.28, 0.42, g.gain)
    lento(9, 260, 620, lp.frequency)
    return
  }

  if (k === 'vento') {
    const src = sorgente('white', 6)
    const bp = filtro('bandpass', 520, 1.4)
    const g = guadagno(0.42)
    src.connect(bp).connect(g).connect(master)
    // Due oscillazioni di periodo diverso: le folate non tornano mai uguali.
    lento(13, 0.2, 0.34, g.gain)
    lento(7, 220, 560, bp.frequency)
    return
  }

  if (k === 'fuoco') {
    const src = sorgente('brown', 5)
    const lp = filtro('lowpass', 420)
    src.connect(lp).connect(guadagno(0.5)).connect(master)
    scoppietta()
  }
}

// Gli scoppiettii: brevissimi, a intervalli irregolari. Sono loro a far
// sembrare un camino quello che altrimenti e' solo un ronzio basso.
function scoppietta() {
  if (!ctx || stato.attivo !== 'fuoco') return
  const ora = ctx.currentTime
  const s = ctx.createBufferSource()
  s.buffer = rumore(0.12, 'white')
  const f = ctx.createBiquadFilter()
  f.type = 'bandpass'
  f.frequency.value = 900 + Math.random() * 2200
  f.Q.value = 3
  const g = ctx.createGain()
  const picco = 0.10 + Math.random() * 0.22
  g.gain.setValueAtTime(0.0001, ora)
  g.gain.exponentialRampToValueAtTime(picco, ora + 0.006)
  g.gain.exponentialRampToValueAtTime(0.0001, ora + 0.10 + Math.random() * 0.12)
  s.connect(f).connect(g).connect(master)
  s.start(ora)
  s.stop(ora + 0.3)
  crackleT = setTimeout(scoppietta, 90 + Math.random() * 700)
}

function pulisci() {
  clearTimeout(crackleT); crackleT = null
  clearTimeout(fineT); fineT = null
  nodi.forEach(n => { try { n.stop ? n.stop() : n.disconnect() } catch { /* gia' fermo */ } })
  nodi.forEach(n => { try { n.disconnect() } catch { /* gia' scollegato */ } })
  nodi = []
}

export async function start(k, durataMin = stato.durata) {
  stop(true)
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
  // Su telefono il contesto nasce sospeso: si sveglia solo dentro un tocco.
  if (ctx.state === 'suspended') await ctx.resume()

  master = ctx.createGain()
  master.gain.value = 0.0001
  master.connect(ctx.destination)

  stato = { ...stato, attivo: k, durata: durataMin, fineAt: durataMin ? Date.now() + durataMin * 60000 : null }
  costruisci(k)

  // Entra piano: due secondi, invece di partire in faccia.
  master.gain.exponentialRampToValueAtTime(Math.max(0.0002, stato.volume), ctx.currentTime + 2)

  if (durataMin) fineT = setTimeout(() => stop(), durataMin * 60000)
  avvisa()
}

export function stop(silenzioso = false) {
  if (!ctx || !stato.attivo) {
    if (!silenzioso) { stato = { ...stato, attivo: null, fineAt: null }; avvisa() }
    return
  }
  const g = master
  const k = stato.attivo
  stato = { ...stato, attivo: null, fineAt: null }
  clearTimeout(crackleT); crackleT = null
  clearTimeout(fineT); fineT = null
  // Esce piano anche lui, poi stacca tutto.
  try {
    g.gain.cancelScheduledValues(ctx.currentTime)
    g.gain.setValueAtTime(Math.max(0.0002, g.gain.value), ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + (silenzioso ? 0.05 : 1.2))
  } catch { /* contesto gia' chiuso */ }
  const daPulire = nodi
  nodi = []
  setTimeout(() => {
    daPulire.forEach(n => { try { n.stop && n.stop() } catch { /* ok */ } })
    daPulire.forEach(n => { try { n.disconnect() } catch { /* ok */ } })
    try { g.disconnect() } catch { /* ok */ }
  }, silenzioso ? 80 : 1400)
  if (k && !silenzioso) avvisa()
  else avvisa()
}

export function setVolume(v) {
  stato = { ...stato, volume: v }
  if (master && ctx && stato.attivo) {
    master.gain.cancelScheduledValues(ctx.currentTime)
    master.gain.setTargetAtTime(Math.max(0.0002, v), ctx.currentTime, 0.1)
  }
  avvisa()
}

export function setDurata(min) {
  clearTimeout(fineT); fineT = null
  stato = { ...stato, durata: min, fineAt: stato.attivo && min ? Date.now() + min * 60000 : null }
  if (stato.attivo && min) fineT = setTimeout(() => stop(), min * 60000)
  avvisa()
}

export { pulisci as _pulisci }
