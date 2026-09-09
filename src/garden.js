// Le forme del verde del giardino zen, e il caso riproducibile che le rende
// tutte storte a modo loro.
//
// Qui non c'e' niente da curare: nessuna sete, nessuna scadenza, niente che
// appassisce. Quello che pianti cresce da solo e resta.

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



export const SPECIE = [
  {
    k: 'lavanda', nome: 'Lavanda',
    stelo: '#7d8a63', foglia: '#8b9a69', fiore: '#9184bd',
    nota: 'Spighe viola, sottili.',
  },
  {
    k: 'basilico', nome: 'Basilico',
    stelo: '#5f8a4e', foglia: '#68a04f', fiore: '#eef0e6',
    nota: 'Un cespuglio basso e folto.',
  },
  {
    k: 'girasole', nome: 'Girasole',
    stelo: '#6f8a4a', foglia: '#77a04d', fiore: '#e0a938',
    nota: 'Alto, con un fiore solo in cima.',
  },
  {
    k: 'felce', nome: 'Felce',
    stelo: '#4f7a52', foglia: '#58895a', fiore: null,
    nota: 'Fronde aperte. Non fiorisce mai.',
  },
  {
    k: 'cactus', nome: 'Cactus',
    stelo: '#6b8f6b', foglia: '#79997a', fiore: '#d4757a',
    nota: 'Verde e paziente.',
  },
]

export const specie = k => SPECIE.find(s => s.k === k) || SPECIE[0]

// 0 = appena spuntata, 1 = al massimo. Serve al disegno.
export const crescita = pianta => Math.min(1, (pianta.cresciuta || 0) / 10)

// Nel giardino zen non c'e' sete: resta per compatibilita' del disegno, e
// risponde sempre di no.
export const haSete = () => false
