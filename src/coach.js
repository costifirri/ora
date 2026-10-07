// Il mental coaching.
//
// Non frasi motivazionali: un obiettivo tuo, tradotto in due o tre
// comportamenti misurabili, e una volta a settimana una conversazione che
// parte dai numeri veri — non da come ti senti riguardo ai numeri.
//
// Le due regole che tengono in piedi tutto questo:
//
// 1. Gli impegni sono comportamenti, non risultati. "Tre allenamenti" dipende
//    da te; "meno due chili" no. Darsi obiettivi che non dipendono da te e'
//    il modo piu' rapido per sentirsi fallite mentre si sta facendo tutto
//    giusto.
// 2. Quando manchi un impegno la domanda e' "cosa si e' messo in mezzo", mai
//    "perche' non ce l'hai fatta". L'ostacolo e' un'informazione; la colpa
//    non lo e'.

const GIORNO = 86400000

export const chiave = (d = new Date()) => {
  const z = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`
}

// Il lunedi' della settimana di quel giorno.
export function lunedi(ts = Date.now()) {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return d.getTime()
}

// --- Gli impegni che si possono misurare da soli ------------------------

export const TIPI = {
  allenamenti: {
    label: 'Allenamenti', unita: 'volte', suggerito: 3,
    conta: (p, da, a) => (p.corpo?.allenamenti || []).filter(x => x.ts >= da && x.ts < a).length,
  },
  cene: {
    label: 'Cene come le voglio', unita: 'volte', suggerito: 5,
    conta: (p, da, a) => Object.entries(p.corpo?.pasti || {})
      .filter(([k, v]) => v === 'si' && new Date(k).getTime() >= da && new Date(k).getTime() < a).length,
  },
  sonno: {
    label: 'Notti da sette ore o più', unita: 'notti', suggerito: 5,
    conta: (p, da, a) => Object.entries(p.days || {})
      .filter(([k, d]) => (d.sleep ?? 0) >= 7 && new Date(k).getTime() >= da && new Date(k).getTime() < a).length,
  },
  calma: {
    label: 'Momenti di calma', unita: 'volte', suggerito: 3,
    conta: (p, da, a) => Object.entries(p.days || {})
      .filter(([k, d]) => d.done?.meditate && new Date(k).getTime() >= da && new Date(k).getTime() < a).length,
  },
  staccare: {
    label: 'Sere in cui stacco entro le 19', unita: 'sere', suggerito: 3,
    conta: (p, da, a) => Object.values(p.lavoro?.giorni || {})
      .filter(g => g.staccato && g.ts >= da && g.ts < a && Number(g.staccato.slice(0, 2)) < 19).length,
  },
  scrivere: {
    label: 'Sere in cui scrivo due righe', unita: 'sere', suggerito: 3,
    conta: (p, da, a) => {
      const giorni = new Set((p.seraNotes || []).filter(n => n.ts >= da && n.ts < a).map(n => chiave(new Date(n.ts))))
      return giorni.size
    },
  },
}

// Obiettivi tipici, gia' tradotti in comportamenti. Sono un punto di partenza:
// i comportamenti si scelgono e si cambiano.
export const OBIETTIVI = [
  {
    k: 'peso', titolo: 'Perdere un po’ di peso',
    perche: 'Per sentirmi più leggera e più mia, non per un numero.',
    impegni: ['allenamenti', 'cene', 'sonno'],
    nota: 'Il peso non è un comportamento: scende se cambiano le settimane, non se lo fissi.',
  },
  {
    k: 'calma', titolo: 'Reagire di meno',
    perche: 'Per non lasciare che la giornata decida come sto.',
    impegni: ['calma', 'sonno', 'scrivere'],
    nota: 'Si misura in volte in cui ti sei fermata, non in giorni perfetti.',
  },
  {
    k: 'lavoro', titolo: 'Farmi meno mangiare dal lavoro',
    perche: 'Per avere ancora qualcosa addosso quando torno a casa.',
    impegni: ['staccare', 'allenamenti', 'scrivere'],
    nota: 'L’orario in cui stacchi è l’unico pezzo che dipende davvero da te.',
  },
  {
    k: 'energia', titolo: 'Avere più energia',
    perche: 'Per arrivare a sera senza essere svuotata.',
    impegni: ['sonno', 'allenamenti', 'calma'],
    nota: 'L’energia non si cerca: si smette di sprecarla. Il sonno è la leva più grossa.',
  },
]

// Cosa si e' messo in mezzo: le risposte pronte, piu' lo spazio per scrivere.
export const OSTACOLI = [
  { k: 'tempo', label: 'Non ho trovato il tempo' },
  { k: 'stanca', label: 'Ero troppo stanca' },
  { k: 'lavoro', label: 'Il lavoro ha mangiato tutto' },
  { k: 'voglia', label: 'Non ne avevo voglia' },
  { k: 'altri', label: 'C’erano altre persone da seguire' },
  { k: 'dimenticato', label: 'Me ne sono dimenticata' },
  { k: 'troppo', label: 'Mi ero data un obiettivo troppo alto' },
  { k: 'niente', label: 'Niente di preciso' },
]

export const ostacoloLabel = k => OSTACOLI.find(o => o.k === k)?.label || k

// --- Come sta andando ---------------------------------------------------

export function settimana(p, inizio = lunedi()) {
  const fine = inizio + 7 * GIORNO
  const impegni = (p.coach?.impegni || []).map(i => {
    const t = TIPI[i.k]
    const fatto = t ? t.conta(p, inizio, Math.min(fine, Date.now() + 1)) : 0
    return { ...i, label: t?.label || i.k, unita: t?.unita || 'volte', fatto, centrato: fatto >= i.bersaglio }
  })
  const giorniPassati = Math.min(7, Math.max(1, Math.ceil((Date.now() - inizio) / GIORNO)))
  return { inizio, fine, impegni, giorniPassati, centrati: impegni.filter(i => i.centrato).length }
}

// La sessione si fa una volta a settimana, e si apre quando la settimana e'
// abbastanza avanti da avere qualcosa da guardare.
export function sessioneDovuta(p, ora = Date.now()) {
  if (!p.coach?.obiettivo) return false
  const settCorrente = lunedi(ora)
  const giaFatta = (p.coach.sessioni || []).some(s => s.settimana === settCorrente)
  if (giaFatta) return false
  const d = new Date(ora)
  // Dal venerdi' in poi: prima e' troppo presto per dire qualcosa.
  return d.getDay() === 0 || d.getDay() >= 5
}

// Il pezzo che Ora legge prima di parlarti: numeri, non impressioni.
export function fattiSettimana(p, inizio = lunedi()) {
  const s = settimana(p, inizio)
  const righe = s.impegni.map(i =>
    `- ${i.label}: ${i.fatto} su ${i.bersaglio} ${i.unita}${i.centrato ? ' (centrato)' : ''}`)
  const prec = settimana(p, inizio - 7 * GIORNO)
  const confronto = prec.impegni.length
    ? `Settimana prima: ${prec.impegni.map(i => `${i.label} ${i.fatto}/${i.bersaglio}`).join('; ')}.`
    : null
  const ricorrenti = ostacoliRicorrenti(p)
  return [
    `Obiettivo: ${p.coach?.obiettivo?.testo || '—'}${p.coach?.obiettivo?.perche ? ` — perché: ${p.coach.obiettivo.perche}` : ''}`,
    'Questa settimana:',
    ...righe,
    confronto,
    ricorrenti ? `Ostacolo che torna più spesso: ${ricorrenti.label} (${ricorrenti.n} volte).` : null,
  ].filter(Boolean).join('\n')
}

export function ostacoliRicorrenti(p) {
  const conta = {}
  ;(p.coach?.ostacoli || []).forEach(o => { if (o.k && o.k !== 'niente') conta[o.k] = (conta[o.k] || 0) + 1 })
  const top = Object.entries(conta).sort((a, b) => b[1] - a[1])[0]
  return top && top[1] >= 2 ? { k: top[0], label: ostacoloLabel(top[0]), n: top[1] } : null
}

// Quando non c'e' la chiave: una lettura locale, onesta, senza fingere che sia
// stata scritta da qualcuno che ti ha ascoltata.
export function lettura(p, inizio = lunedi()) {
  const s = settimana(p, inizio)
  if (!s.impegni.length) return 'Non hai ancora scelto nessun impegno: senza quelli non c’è niente da guardare.'
  const centrati = s.impegni.filter(i => i.centrato)
  const mancati = s.impegni.filter(i => !i.centrato)
  const r = []

  if (centrati.length === s.impegni.length) {
    r.push('Hai centrato tutto quello che ti eri data. Non succede spesso, e vale la pena notarlo prima di passare oltre.')
  } else if (centrati.length) {
    r.push(`Hai centrato ${centrati.length} impegni su ${s.impegni.length}: ${centrati.map(i => i.label.toLowerCase()).join(', ')}.`)
  } else {
    r.push('Questa settimana non hai centrato nessuno degli impegni. Non è un verdetto su di te: è un’informazione su come era fatta la settimana.')
  }

  mancati.forEach(i => {
    const quanto = i.bersaglio - i.fatto
    r.push(`${i.label}: ${i.fatto} su ${i.bersaglio}. ${quanto === 1 ? 'Ne mancava una sola.' : `Ne mancavano ${quanto}.`}`)
  })

  const ric = ostacoliRicorrenti(p)
  if (ric) r.push(`Nelle settimane scorse l’ostacolo che torna più spesso è «${ric.label.toLowerCase()}». Se torna ancora, forse non è un caso: è il punto su cui vale la pena cambiare qualcosa.`)

  return r.join(' ')
}
