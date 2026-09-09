// Il giardino.
//
// Una regola sopra tutte: qui non muore niente. Un'app che ti fa morire le
// piante se non la apri per una settimana e' un'app che ti mette addosso un
// altro dovere, ed e' esattamente quello che Ora non vuole essere. Se le
// dimentichi, le piante rallentano e fanno qualche foglia secca; quando torni,
// bevono e ripartono. Il tempo perso non torna indietro, ma non si perde altro.

const GIORNO = 86400000

// Un caso riproducibile: dallo stesso seme escono sempre gli stessi numeri.
// Serve perche' ogni pianta sia storta a modo suo, e resti storta uguale ogni
// volta che riapri — non e' rumore, e' la sua forma.
export function rng(seme) {
  let h = 2166136261
  const t = String(seme)
  for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0 }
  return () => { h = (Math.imul(h, 1664525) + 1013904223) >>> 0; return h / 4294967296 }
}

export const chiaveGiorno = ts => {
  const d = new Date(ts)
  const z = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`
}

// Il tempo che fa non lo decide un tocco: e' gia' deciso, uguale per ogni
// giorno del calendario. Circa un giorno su quattro piove, e la pioggia
// innaffia da sola. Un orto vero non dipende solo da te.
export const piovuto = giorno => rng('pioggia-' + giorno)() < 0.26

export const SPECIE = [
  {
    k: 'lavanda', nome: 'Lavanda', sete: 4,
    stelo: '#7d8a63', foglia: '#8b9a69', fiore: '#9184bd',
    nota: 'Sopporta bene la sete e profuma se la sfiori.',
  },
  {
    k: 'basilico', nome: 'Basilico', sete: 2,
    stelo: '#5f8a4e', foglia: '#68a04f', fiore: '#eef0e6',
    nota: 'Ha sempre sete. In compenso, si mangia.',
  },
  {
    k: 'girasole', nome: 'Girasole', sete: 3,
    stelo: '#6f8a4a', foglia: '#77a04d', fiore: '#e0a938',
    nota: 'Cresce alto, e guarda sempre da una parte sola.',
  },
  {
    k: 'felce', nome: 'Felce', sete: 3,
    stelo: '#4f7a52', foglia: '#58895a', fiore: null,
    nota: 'Non fiorisce mai, e va benissimo così.',
  },
  {
    k: 'cactus', nome: 'Cactus', sete: 12,
    stelo: '#6b8f6b', foglia: '#79997a', fiore: '#d4757a',
    nota: 'Puoi dimenticartene per settimane. Non se la prende.',
  },
]

export const specie = k => SPECIE.find(s => s.k === k) || SPECIE[0]

// Le tappe, misurate in "giorni utili": i giorni in cui la pianta ha avuto
// quello che le serviva. Una pianta lasciata all'asciutto ne accumula meno.
export const STADI = [
  { da: 0, label: 'Appena piantata' },
  { da: 1, label: 'Germoglio' },
  { da: 3, label: 'Giovane' },
  { da: 6, label: 'Adulta' },
  { da: 10, label: 'In fiore' },
]

export const stadio = pianta => {
  const g = pianta.cresciuta || 0
  let s = STADI[0]
  for (const x of STADI) if (g >= x.da) s = x
  // Chi non fiorisce non puo' essere "in fiore": sarebbe una bugia piccola,
  // ma resta una bugia.
  if (s === STADI[4] && !specie(pianta.specie).fiore) return { ...s, label: 'Rigogliosa' }
  return s
}

// 0 = seme, 1 = pianta finita. Serve al disegno.
export const crescita = pianta => Math.min(1, (pianta.cresciuta || 0) / 10)

export const giorniSenzAcqua = (pianta, ora = Date.now()) =>
  Math.max(0, (ora - pianta.ultimaAcqua) / GIORNO)

export const haSete = (pianta, ora = Date.now()) =>
  giorniSenzAcqua(pianta, ora) > specie(pianta.specie).sete

// Fa scorrere il tempo su una pianta. Si chiama quando apri il giardino o
// quando fai qualcosa: non serve nessun timer acceso.
export function matura(pianta, ora = Date.now()) {
  const sp = specie(pianta.specie)
  let t = pianta.aggiornataIl || pianta.piantataIl
  if (t >= ora) return pianta

  let cresciuta = pianta.cresciuta || 0
  let ultimaAcqua = pianta.ultimaAcqua
  let secche = pianta.foglieSecche
  let piogge = 0
  let scoperta = 0   // giorni passati all'asciutto: serve solo per raccontarlo

  // Giorno per giorno, cosi' la pioggia cade al momento giusto invece di
  // essere spalmata su un intervallo.
  let giri = 0
  while (t < ora && giri++ < 400) {
    const passo = Math.min(GIORNO, ora - t)
    const frazione = passo / GIORNO
    const sete = (t - ultimaAcqua) / GIORNO
    const asciutta = sete > sp.sete
    cresciuta += frazione * (asciutta ? 0.25 : 1)
    if (asciutta) scoperta += frazione
    if (sete > sp.sete * 2) secche = true
    t += passo
    if (piovuto(chiaveGiorno(t))) { ultimaAcqua = Math.max(ultimaAcqua, t); piogge++ }
  }

  return {
    ...pianta,
    cresciuta,
    ultimaAcqua,
    foglieSecche: secche,
    aggiornataIl: ora,
    _piogge: piogge,
    _asciutta: Math.round(scoperta),
  }
}

export const maturaTutte = (giardino, ora = Date.now()) => giardino.map(p => matura(p, ora))

export function nuovaPianta(specieK, nome, ora = Date.now()) {
  return {
    id: `g-${ora}-${Math.random().toString(36).slice(2, 7)}`,
    specie: specieK,
    nome: (nome || '').trim(),
    piantataIl: ora,
    ultimaAcqua: ora,
    aggiornataIl: ora,
    cresciuta: 0,
    foglieSecche: false,
  }
}

// Come sta, in una riga sola.
export function comeSta(pianta, ora = Date.now()) {
  const sp = specie(pianta.specie)
  const giorni = giorniSenzAcqua(pianta, ora)
  if (pianta.foglieSecche) return { tono: 'secca', testo: 'Ha delle foglie secche da togliere.' }
  if (giorni > sp.sete) return { tono: 'sete', testo: 'Ha sete.' }
  if (crescita(pianta) >= 1) return { tono: 'bene', testo: sp.fiore ? 'È in fiore.' : 'È al massimo del suo verde.' }
  return { tono: 'bene', testo: 'Sta bene.' }
}

export const daBere = (giardino, ora = Date.now()) =>
  giardino.filter(p => haSete(p, ora) || p.foglieSecche).length


// --- Le erbacce ---
// Spuntano da sole, come in un orto vero. Non fanno danno: tolgono un po' di
// spazio e basta. Strapparle e' la cosa piu' soddisfacente che si possa fare
// qui dentro, e non e' un dovere.
export const MAX_ERBACCE = 5

export function erbacceNuove(erbacce, visto, ora = Date.now()) {
  if (!visto) return { erbacce, visto: ora }
  const fuori = []
  let t = visto
  let giri = 0
  while (t + GIORNO < ora && giri++ < 200) {
    t += GIORNO
    const g = chiaveGiorno(t)
    const r = rng('erba-' + g)
    if (r() < 0.45 && erbacce.length + fuori.length < MAX_ERBACCE) {
      fuori.push({ id: `e-${g}-${Math.round(r() * 1e6)}`, natoIl: t, x: 0.08 + r() * 0.84, z: r() })
    }
  }
  return { erbacce: [...erbacce, ...fuori], visto: ora }
}

// Dove sta una pianta nell'aiuola, se non gliel'ho ancora assegnato.
export function posto(pianta) {
  if (pianta.x != null) return { x: pianta.x, z: pianta.z ?? 0.5 }
  const r = rng(pianta.id)
  return { x: 0.12 + r() * 0.76, z: r() }
}
