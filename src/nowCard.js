// Decide la sola cosa che conta adesso. I sette momenti della giornata
// restano nel motore, ma non compaiono mai come lista: qui diventano il
// ritmo con cui Ora sa che ora è.

import { FLOW, COURSE, HARD } from './data.js'

// Finestra oraria di ogni momento. Si sovrappongono di proposito:
// vince il primo non fatto, in ordine di giornata.
const WINDOWS = {
  checkin: [5, 12],
  meditate: [6, 13],
  move: [11, 19],
  scarico: [16, 21],
  connect: [17, 23],
  sera: [19, 24],
  letto: [20, 29], // prosegue oltre la mezzanotte (24 + 5)
}

// La riga di Ora sopra la scheda: la sua voce, non un'etichetta.
const ORA_LINE = {
  checkin: 'Prima del telefono, dimmi come stai.',
  meditate: 'La mattina la mente è più morbida. Ti va di sederti?',
  move: 'Dieci minuti fuori, quando la giornata lo permette.',
  scarico: 'Stai passando dal lavoro a casa. È qui che nascono i tuoi picchi.',
  connect: 'Stasera, una conversazione vera. Una persona, una domanda.',
  sera: 'Chiudiamo la giornata piano.',
  letto: 'Ti accompagno a dormire.',
}

const inWindow = (k, h) => {
  const [from, to] = WINDOWS[k]
  return (h >= from && h < to) || (to > 24 && h + 24 >= from && h + 24 < to)
}

export function greeting(h) {
  if (h < 5) return 'Ancora sveglia'
  if (h < 12) return 'Buongiorno'
  if (h < 18) return 'Ciao'
  return 'Buonasera'
}

// Cosa dice Ora, appena sopra la scheda: reagisce a com'è andata finora.
function oraOpener({ h, logged, spikeToday, respondedToday, allDone }) {
  if (allDone) return 'Hai chiuso la giornata. Non serve altro.'
  if (respondedToday) return 'Oggi ti sei fermata prima di reagire. È la cosa che conta di più.'
  if (spikeToday) return `Prima avevi segnato ${logged.word.toLowerCase()}. Sono qui.`
  if (logged) return `Hai dato un nome a come stai: ${logged.word.toLowerCase()}.`
  if (h >= 21) return 'La giornata sta finendo.'
  return null
}

/**
 * ctx: { day, p, logged, todayCheckins, weekResponses, now }
 * Ritorna { greeting, opener, kind, line, title, body, cta, act, skipLabel, later }
 */
export function nowCard({ day, p, logged, todayCheckins, weekResponses, now = new Date() }) {
  const h = now.getHours()
  const spikeToday = todayCheckins.some(c => c.intensity >= 4 && HARD.includes(c.core))
  const respondedToday = weekResponses.some(x => new Date(x.ts).toDateString() === now.toDateString())

  // La camminata spostata a domani non è più roba di oggi.
  const pending = FLOW.filter(x => !day.done[x.k] && !(x.k === 'move' && day.moveWhen === 'Domani mattina'))
  const allDone = pending.length === 0

  const base = {
    greeting: greeting(h),
    opener: oraOpener({ h, logged, spikeToday, respondedToday, allDone }),
  }

  if (allDone) {
    return {
      ...base,
      kind: 'rest',
      line: 'Per oggi non ti chiedo altro.',
      title: 'Giornata chiusa',
      body: 'Se ti va restiamo un momento, oppure scrivimi. Domani si riparte dalla colazione.',
      cta: 'Tre respiri',
      act: 'respiro',
      later: null,
    }
  }

  const current = pending.find(x => inWindow(x.k, h)) || null

  if (!current) {
    // Nessun momento aperto adesso (di solito notte fonda o primo mattino).
    const next = pending[0]
    return {
      ...base,
      kind: 'rest',
      line: 'Adesso non c’è niente da fare.',
      title: 'Sono qui',
      body: 'Non tutti i momenti della giornata chiedono qualcosa. Se ti va, restiamo un attimo insieme.',
      cta: 'Tre respiri',
      act: 'respiro',
      later: next ? `Più tardi: ${next.title.toLowerCase()}.` : null,
    }
  }

  const nextAfter = pending.find(x => x.k !== current.k)
  const dur = current.k === 'meditate' ? `${COURSE[p.courseStep].mins} min` : current.dur

  return {
    ...base,
    kind: 'step',
    key: current.k,
    line: ORA_LINE[current.k],
    title: current.title,
    body: current.k === 'move' && day.moveMoved
      ? 'Spostata. Dieci minuti fuori, quando la giornata lo permette.'
      : current.body,
    dur,
    cta: current.cta,
    act: current.act,
    skipLabel: current.k === 'move' ? 'Fatto' : 'Non ora',
    canReschedule: current.k === 'move',
    later: nextAfter ? `Più tardi: ${nextAfter.title.toLowerCase()}.` : null,
  }
}
