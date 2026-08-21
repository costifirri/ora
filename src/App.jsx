import { useEffect, useRef, useState } from 'react'
import { FLOW, COURSE, CUES, HARD, CORE, HELPERS, PEOPLE, SEED_TRIGGERS, SEED_WEEK, breath, answerFor } from './data.js'
import { buildSystem, askOra } from './ai.js'
import { loadPersisted, savePersisted, todayKey, emptyDay, exportAll } from './storage.js'
import Home from './screens/Home.jsx'
import Checkin from './screens/Checkin.jsx'
import Pausa from './screens/Pausa.jsx'
import Pratica from './screens/Pratica.jsx'
import Session from './screens/Session.jsx'
import Sera from './screens/Sera.jsx'
import Inneschi from './screens/Inneschi.jsx'
import Corpo from './screens/Corpo.jsx'
import Legami from './screens/Legami.jsx'
import Coach from './screens/Coach.jsx'
import Profilo from './screens/Profilo.jsx'

const TABS = [
  { id: 'home', label: 'Flusso' }, { id: 'body', label: 'Corpo' },
  { id: 'legami', label: 'Legami' }, { id: 'coach', label: 'Ora' }, { id: 'profile', label: 'Tu' },
]

const EPHEMERAL = {
  screen: 'home',
  core: null, nuance: null, intensity: 3,
  running: false, t: 0, sessionKind: 'respiro', sessionMins: 8, cue: 0, flowKey: null, courseIdx: null,
  pausaStep: 0, pausaT: 0,
  seraStep: 0, seraT: 0, seraDraft: '',
  openPerson: null, convoWho: null, convoTone: null, convoUnsaid: '',
  draft: '', typing: false, toast: null, aiError: null,
}

export default function App() {
  const [p, setPRaw] = useState(loadPersisted)
  const [s, setSRaw] = useState(EPHEMERAL)
  const toastT = useRef(null)
  const replyT = useRef(null)

  const setS = patch => setSRaw(prev => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }))
  const setP = patch => setPRaw(prev => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }))

  useEffect(() => { savePersisted(p) }, [p])

  // Un solo tick da 100ms guida respiro, cue narrate e countdown della sera.
  useEffect(() => {
    const timer = setInterval(() => {
      setSRaw(prev => {
        if (prev.screen === 'session' && prev.running) {
          const next = { ...prev, t: prev.t + 0.1 }
          if (prev.sessionKind !== 'respiro') {
            const len = (CUES[prev.sessionKind] || []).length
            next.cue = Math.min(len - 1, Math.floor((prev.t + 0.1) / 22))
          }
          return next
        }
        if (prev.screen === 'pausa' && prev.pausaStep === 2) return { ...prev, pausaT: prev.pausaT + 0.1 }
        if (prev.screen === 'sera' && prev.seraStep === 0) return { ...prev, seraT: prev.seraT + 0.1 }
        return prev
      })
    }, 100)
    return () => clearInterval(timer)
  }, [])
  useEffect(() => () => { clearTimeout(toastT.current); clearTimeout(replyT.current) }, [])

  // --- Giorno corrente ---
  const tk = todayKey()
  const day = p.days[tk] || emptyDay()
  // patch può essere un oggetto o una funzione del giorno corrente (per click rapidi consecutivi)
  const patchDay = patch => setP(prev => {
    const cur = prev.days[tk] || emptyDay()
    return { days: { ...prev.days, [tk]: { ...cur, ...(typeof patch === 'function' ? patch(cur) : patch) } } }
  })
  const markDone = (key, val = true) => patchDay(cur => ({ done: { ...cur.done, [key]: val } }))

  const gentle = p.settings.gentle
  const name = p.settings.name || 'Costanza'
  const pattern = p.settings.pattern || 'Calm six'

  // --- Toast ---
  const flash = toast => {
    setS({ toast })
    clearTimeout(toastT.current)
    toastT.current = setTimeout(() => setS({ toast: null }), 4200)
  }

  // --- Flusso ordinato: la camminata si sposta alla posizione scelta ---
  const orderedFlow = () => {
    const rest = FLOW.filter(x => x.k !== 'move')
    const move = FLOW.find(x => x.k === 'move')
    const at = Math.max(0, Math.min(day.movePos, rest.length))
    return rest.slice(0, at).concat([move], rest.slice(at))
  }

  // --- Check-in di oggi ---
  const todayCheckins = p.checkins.filter(c => todayKey(new Date(c.ts)) === tk)
  const logged = todayCheckins.length ? todayCheckins[todayCheckins.length - 1] : null

  // --- Conoscerti: calcolato dallo storico dei check-in ---
  const spikes = p.checkins.filter(c => HARD.includes(c.core) && c.intensity >= 4)
  const weekStrip = (() => {
    if (!p.checkins.length) return { bars: SEED_WEEK, example: true }
    const labels = ['L', 'M', 'M', 'G', 'V', 'S', 'D']
    const now = new Date()
    const monday = new Date(now)
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
    const bars = labels.map((day2, i) => {
      const d = new Date(monday); d.setDate(monday.getDate() + i)
      const dk = todayKey(d)
      const n = spikes.filter(c => todayKey(new Date(c.ts)) === dk).length
      return { day: day2, level: Math.min(3, n) }
    })
    return { bars, example: false }
  })()
  const triggers = (() => {
    if (spikes.length < 3) return { list: SEED_TRIGGERS, example: !spikes.length ? 'empty' : 'few' }
    const win = spikes.slice(-8)
    const buckets = [
      { label: 'Sera, dopo le 21', test: h => h >= 21, note: n => `${n === 1 ? 'Un picco' : n + ' picchi'} su ${win.length} dopo cena. È il momento in cui la giornata presenta il conto.` },
      { label: 'Fine della giornata', test: h => h >= 17 && h < 21, note: n => `${n} su ${win.length} nel passaggio tra lavoro e casa: i tre respiri sono fatti per lì.` },
      { label: 'Pomeriggio', test: h => h >= 12 && h < 17, note: n => `${n} su ${win.length} nel mezzo della giornata, quasi sempre senza una pausa prima.` },
      { label: 'Mattina', test: h => h < 12, note: n => `${n} su ${win.length} prima di pranzo: le mattine di corsa restano contratte a lungo.` },
    ]
    const list = buckets
      .map(b => {
        const n = win.filter(c => b.test(new Date(c.ts).getHours())).length
        return { label: b.label, n, of: win.length, note: b.note(n) }
      })
      .filter(b => b.n > 0)
      .sort((a, b) => b.n - a.n)
    return { list, example: false }
  })()

  // --- Sessioni ---
  const startSession = (kind, mins, flowKey = null, courseIdx = null) =>
    setS({ screen: 'session', sessionKind: kind, sessionMins: mins, running: true, t: 0, cue: 0, flowKey, courseIdx })

  const kindForCourse = i => (i === 3 ? 'scansione' : i === 4 ? 'nota' : i === 2 ? 'tornare' : 'respiro')

  const stopSession = () => {
    const ran = s.t > 20
    const key = s.flowKey
    const ci = s.courseIdx
    if (ran && key) markDone(key)
    if (ran && ci != null) {
      setP(prev => {
        const courseDone = prev.courseDone.map((d, i) => (i === ci ? true : d))
        const next = courseDone.findIndex(d => !d)
        return { courseDone, courseStep: next === -1 ? COURSE.length - 1 : next }
      })
    }
    setS({ screen: key ? 'home' : 'pratica', running: false, flowKey: null, courseIdx: null })
    if (ran) flash(key === 'letto' ? 'Buonanotte. Domani il flusso riparte dalla colazione.' : 'Ti sei seduta. È tutto quello che serviva.')
  }

  // --- Check-in ---
  const logMood = () => {
    const core = CORE[s.core]
    const word = s.nuance === 'Altro ancora' ? core.key : (s.nuance || core.key)
    const goPausa = HARD.includes(core.key) && s.intensity >= 4
    setP(prev => ({ checkins: [...prev.checkins, { word, core: core.key, intensity: s.intensity, ts: Date.now() }] }))
    markDone('checkin')
    setS({ screen: goPausa ? 'pausa' : 'home', pausaStep: 0, pausaT: 0 })
    flash(goPausa
      ? `Registrato: ${word.toLowerCase()}. Prima di tutto il resto, novanta secondi.`
      : `Registrato: ${word.toLowerCase()}. Ora cercherà uno schema, non un problema.`)
  }

  // --- Chat ---
  const contextBlock = () => {
    const fatti = FLOW.filter(x => day.done[x.k]).map(x => x.title)
    return [
      `Dati di ${name}, oggi:`,
      '- ultimo check-in: ' + (logged ? logged.word + (logged.intensity >= 4 ? ' (intensa)' : '') : 'non ancora fatto oggi'),
      '- passi del flusso completati: ' + (fatti.length ? fatti.join('; ') : 'nessuno'),
      `- passo del percorso di meditazione: ${p.courseStep + 1} di 7 (${COURSE[p.courseStep].label})`,
      `- acqua: ${day.water} bicchieri su 8; ha camminato: ${day.done.move ? 'sì' : 'non ancora'}`,
      '- inneschi noti: ' + triggers.list.map(t => `${t.label} (${t.n}/${t.of})`).join(', '),
      '- cosa la calma: ' + HELPERS.map(h => h.label).join(', '),
      '- persone su cui vuole lavorare: ' + PEOPLE.map(pp => `${pp.name} (${pp.meta})`).join(', '),
    ].join('\n')
  }

  const liveAI = !!p.settings.apiKey
  const sendText = text => {
    if (!text.trim()) return
    const history = [...p.messages, { from: 'me', text }]
    setP({ messages: history })
    setS({ draft: '', typing: true, aiError: null })
    const fallback = answerFor(text)
    const finish = (reply, aiError = null) => {
      setS({ typing: false, aiError })
      setP(prev => ({ messages: [...prev.messages, { from: 'ora', text: reply }] }))
    }
    if (!liveAI) {
      clearTimeout(replyT.current)
      replyT.current = setTimeout(() => finish(fallback), 1400)
      return
    }
    askOra({ apiKey: p.settings.apiKey, system: buildSystem(contextBlock(), name), history })
      .then(answer => finish(answer || fallback))
      .catch(err => finish(fallback, err.message === 'Failed to fetch' ? 'connessione assente' : err.message))
  }

  const app = {
    p, s, setS, setP, day, patchDay, markDone, gentle, name, pattern,
    flash, orderedFlow, logged, todayCheckins, weekStrip, triggers, spikes,
    startSession, stopSession, kindForCourse, logMood, sendText, liveAI,
    breath: t => breath(t, pattern),
    go: screen => setS({ screen }),
    exportData: () => exportAll(p),
  }

  const showTabs = ['home', 'body', 'legami', 'coach', 'profile'].includes(s.screen)

  return (
    <div className="shell">
      {s.screen === 'home' && <Home app={app} />}
      {s.screen === 'checkin' && <Checkin app={app} />}
      {s.screen === 'pausa' && <Pausa app={app} />}
      {s.screen === 'pratica' && <Pratica app={app} />}
      {s.screen === 'session' && <Session app={app} />}
      {s.screen === 'sera' && <Sera app={app} />}
      {s.screen === 'inneschi' && <Inneschi app={app} />}
      {s.screen === 'body' && <Corpo app={app} />}
      {s.screen === 'legami' && <Legami app={app} />}
      {s.screen === 'coach' && <Coach app={app} />}
      {s.screen === 'profile' && <Profilo app={app} />}

      {s.toast && <div className="toast" role="status">{s.toast}</div>}

      {showTabs && (
        <nav className="tabbar">
          {TABS.map(t => {
            const active = s.screen === t.id
            return (
              <button key={t.id} className="tab-btn" onClick={() => setS({ screen: t.id })} aria-current={active ? 'page' : undefined}>
                <span className="tab-dot" style={{ background: active ? 'var(--sage-500)' : 'rgba(32,30,29,.22)' }} />
                <span className="tab-label" style={{ color: active ? 'var(--text)' : 'rgba(32,30,29,.5)' }}>{t.label}</span>
              </button>
            )
          })}
        </nav>
      )}
    </div>
  )
}
