// Il giardino.
//
// Una regola sopra tutte: qui non muore niente. Un'app che ti fa morire le
// piante se non la apri per una settimana e' un'app che ti mette addosso un
// altro dovere, ed e' esattamente quello che Ora non vuole essere. Se le
// dimentichi, le piante rallentano e fanno qualche foglia secca; quando torni,
// bevono e ripartono. Il tempo perso non torna indietro, ma non si perde altro.

const GIORNO = 86400000

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
  const dal = pianta.aggiornataIl || pianta.piantataIl
  const passati = (ora - dal) / GIORNO
  if (passati <= 0) return pianta

  // Quanto e' rimasta all'asciutto dentro questo intervallo, all'ingrosso.
  const seteFine = giorniSenzAcqua(pianta, ora)
  const seteInizio = Math.max(0, seteFine - passati)
  const asciutti = Math.max(0, Math.min(passati, seteFine - sp.sete))
  const bagnati = Math.max(0, passati - asciutti)

  return {
    ...pianta,
    // All'asciutto non si ferma: rallenta a un quarto. Aspettare e' diverso
    // da morire.
    cresciuta: (pianta.cresciuta || 0) + bagnati + asciutti * 0.25,
    // Le foglie secche restano finche' non le togli tu.
    foglieSecche: pianta.foglieSecche || seteFine > sp.sete * 2,
    aggiornataIl: ora,
    // Serve solo per raccontartelo al rientro.
    _dimenticataDa: seteInizio > sp.sete ? Math.round(seteFine) : 0,
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
