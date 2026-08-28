import { useEffect, useRef, useState } from 'react'
import { FLOW, COURSE, CUES, HARD, CORE, POSITIVE, GOOD_TAGS, SEED_HELPERS, SEED_TRIGGERS, SEED_WEEK, TRIGGER_TAGS, breath, answerFor, localDaily } from './data.js'
import { buildSystem, askOra, weeklyReport, askOpener, extractMemories, monthChapter, dailyLine } from './ai.js'
import { loadPersisted, savePersisted, adoptCloud, todayKey, emptyDay, exportAll, freshStart } from './storage.js'
import { isConfigured } from './firebase.js'
import { watchAuth, loadCloud, saveCloud, signOutNow } from './cloud.js'
import Auth from './screens/Auth.jsx'
import Oggi from './screens/Oggi.jsx'
import Te from './screens/Te.jsx'
import Checkin from './screens/Checkin.jsx'
import Pausa from './screens/Pausa.jsx'
import Pratica from './screens/Pratica.jsx'
import Session from './screens/Session.jsx'
import Sera from './screens/Sera.jsx'
import Coach from './screens/Coach.jsx'
import Profilo from './screens/Profilo.jsx'
import Memoria from './screens/Memoria.jsx'
import Calendario from './screens/Calendario.jsx'
import Diario from './screens/Diario.jsx'
import Pensiero from './screens/Pensiero.jsx'

const TABS = [
  { id: 'oggi', label: 'Ora' },
  { id: 'te', label: 'Te' },
  { id: 'pratica', label: 'Pratica' },
]

const EPHEMERAL = {
  screen: 'oggi', teTab: 'come',
  core: null, nuance: null, intensity: 3, checkinTag: null,
  running: false, t: 0, sessionKind: 'respiro', sessionMins: 8, cue: 0, flowKey: null, courseIdx: null,
  pausaStep: 0, pausaT: 0,
  seraStep: 0, seraT: 0, seraDraft: '',
  openPerson: null, editPerson: null, openerLoading: null,
  convoWho: null, convoTone: null, convoUnsaid: '',
  draft: '', typing: false, toast: null, aiError: null, reportLoading: false, chapterLoading: false,
}

export default function App() {
  const [p, setPRaw] = useState(loadPersisted)
  const [s, setSRaw] = useState(EPHEMERAL)
  // undefined = sto ancora guardando chi sei; null = nessun account
  const [user, setUser] = useState(isConfigured ? undefined : null)
  const [syncing, setSyncing] = useState(false)
  const toastT = useRef(null)
  const replyT = useRef(null)
  const cloudT = useRef(null)
  const uidRef = useRef(null)

  const setS = patch => setSRaw(prev => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }))
  const setP = patch => setPRaw(prev => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }))

  useEffect(() => { savePersisted(p) }, [p])

  // Chi sei: la sessione resta valida anche offline, una volta entrata.
  useEffect(() => {
    if (!isConfigured) return
    let stop
    watchAuth(u => setUser(u)).then(fn => { stop = fn })
    return () => { if (stop) stop() }
  }, [])

  // Al primo accesso: se lassù c'è già qualcosa lo adotto, altrimenti
  // ci porto quello che c'è su questo dispositivo.
  useEffect(() => {
    if (!user) { uidRef.current = null; return }
    if (uidRef.current === user.uid) return
    uidRef.current = user.uid
    let alive = true
    setSyncing(true)
    loadCloud(user.uid)
      .then(cloud => {
        if (!alive) return
        if (cloud) setPRaw(adoptCloud(cloud))
        else return saveCloud(user.uid, p)
      })
      .catch(() => {})
      .finally(() => { if (alive) setSyncing(false) })
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Salvataggio in cloud, con un respiro di ritardo per non scrivere a ogni tocco.
  useEffect(() => {
    if (!user || uidRef.current !== user.uid || syncing) return
    clearTimeout(cloudT.current)
    cloudT.current = setTimeout(() => { saveCloud(user.uid, p).catch(() => {}) }, 1500)
    return () => clearTimeout(cloudT.current)
  }, [p, user, syncing])

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
    // Se i check-in intensi portano i tag "cosa è successo poco prima",
    // gli inneschi si calcolano da quelli: sono i più fedeli.
    const tagged = win.filter(c => c.tag)
    if (tagged.length >= 3) {
      const list = TRIGGER_TAGS
        .map(t => ({ label: t.label, n: tagged.filter(c => c.tag === t.key).length, of: win.length, note: t.note }))
        .filter(t => t.n > 0)
        .sort((a, b) => b.n - a.n)
      return { list, example: false, fromTags: true }
    }
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

  // Cosa ti rimette insieme: lo stesso conto degli inneschi, dall'altra parte.
  // Qui non serve una soglia d'intensità: una calma lieve vale quanto una piena.
  const goodCheckins = p.checkins.filter(c => POSITIVE.includes(c.core))
  const restorers = (() => {
    const tagged = goodCheckins.filter(c => c.tag).slice(-10)
    if (tagged.length < 3) return { list: SEED_HELPERS, example: true }
    const list = GOOD_TAGS
      .map(t => ({ label: t.label, n: tagged.filter(c => c.tag === t.key).length, of: tagged.length, note: t.note }))
      .filter(t => t.n > 0)
      .sort((a, b) => b.n - a.n)
    return { list, example: false }
  })()

  // Risposte scelte nel Momento difficile negli ultimi 7 giorni
  const weekAgo = Date.now() - 7 * 24 * 3600 * 1000
  const weekResponses = p.pauseLog.filter(x => x.ts >= weekAgo)

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
    setS({ screen: key ? 'oggi' : 'pratica', running: false, flowKey: null, courseIdx: null })
    if (ran) flash(key === 'letto' ? 'Buonanotte. Domani il flusso riparte dalla colazione.' : 'Ti sei seduta. È tutto quello che serviva.')
  }

  // --- Check-in ---
  const logMood = () => {
    const core = CORE[s.core]
    const word = s.nuance === 'Altro ancora' ? core.key : (s.nuance || core.key)
    const goPausa = HARD.includes(core.key) && s.intensity >= 4
    setP(prev => ({ checkins: [...prev.checkins, { word, core: core.key, intensity: s.intensity, tag: s.checkinTag || undefined, ts: Date.now() }] }))
    markDone('checkin')
    setS({ screen: goPausa ? 'pausa' : 'oggi', pausaStep: 0, pausaT: 0, checkinTag: null })
    flash(goPausa
      ? `Registrato: ${word.toLowerCase()}. Prima di tutto il resto, novanta secondi.`
      : `Registrato: ${word.toLowerCase()}. Ora cercherà uno schema, non un problema.`)
  }

  // --- Chat ---
  // Quello che Ora sa di te, dal piu' stabile al piu' passeggero.
  const contextBlock = () => {
    const fatti = FLOW.filter(x => day.done[x.k]).map(x => x.title)
    const weekCheckins = p.checkins.filter(c => c.ts >= weekAgo)
    const pr = p.profile
    const day2 = ts => new Date(ts).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })

    const chiSei = [
      pr.lavoro && `- di lavoro: ${pr.lavoro}`,
      pr.ritmi && `- i suoi ritmi: ${pr.ritmi}`,
      pr.pesa && `- cosa le pesa di solito: ${pr.pesa}`,
      pr.bene && `- cosa le fa bene: ${pr.bene}`,
      pr.voce && `- come vuole che le parli: ${pr.voce}`,
      '- persone che le stanno a cuore: ' + (p.people.filter(x => x.name).map(pp => `${pp.name}${pp.meta ? ` (${pp.meta})` : ''}`).join(', ') || 'nessuna indicata'),
    ].filter(Boolean)

    const capitoli = p.chapters.slice(-3).map(c => `${c.month}: ${c.text}`)
    const ricordi = p.memories.slice(-25).map(m => `- ${m.text}`)
    const righe = p.seraNotes.slice(-3).map(n => `- ${day2(n.ts)}: ${n.text}`)

    return [
      `Chi e' ${name}:`,
      ...chiSei,
      '',
      capitoli.length ? 'Quello che hai capito di lei nei mesi passati:' : null,
      ...(capitoli.length ? capitoli : []),
      capitoli.length ? '' : null,
      ricordi.length ? 'Cose che ti ha detto e che ricordi:' : null,
      ...(ricordi.length ? ricordi : []),
      ricordi.length ? '' : null,
      righe.length ? 'Le sue ultime righe della sera (scritte per se stessa: trattale con delicatezza):' : null,
      ...(righe.length ? righe : []),
      righe.length ? '' : null,
      'Oggi:',
      '- ultimo check-in: ' + (logged ? logged.word + (logged.intensity >= 4 ? ' (intensa)' : '') + (logged.tag ? `, innesco: ${logged.tag}` : '') : 'non ancora fatto oggi'),
      '- passi della giornata gia' + "'" + ' fatti: ' + (fatti.length ? fatti.join('; ') : 'nessuno'),
      `- passo del percorso di meditazione: ${p.courseStep + 1} di 7 (${COURSE[p.courseStep].label})`,
      `- acqua: ${day.water} bicchieri su 8; movimento: ${day.moveMin} minuti` + (day.sleep != null ? `; ha dormito ${day.sleep} ore` : ''),
      '',
      'Ultimi sette giorni:',
      `- check-in: ${weekCheckins.length}, di cui intensi: ${weekCheckins.filter(c => c.intensity >= 4 && HARD.includes(c.core)).length}`,
      `- volte in cui ha scelto una risposta invece di reagire: ${weekResponses.length}` + (weekResponses.length ? ` (${weekResponses.map(x => x.choice).join('; ')})` : ''),
      '- inneschi ricorrenti: ' + triggers.list.map(t => `${t.label} (${t.n}/${t.of})`).join(', '),
      p.intention ? `- la regola che si e' data: ${p.intention}` : null,
      restorers.example
        ? '- cosa la rimette insieme: non ancora osservato (troppi pochi check-in buoni con un tag); non darlo per noto'
        : '- cosa la rimette insieme, dai suoi dati: ' + restorers.list.map(t => `${t.label} (${t.n}/${t.of})`).join(', '),
      `- check-in buoni negli ultimi 7 giorni: ${goodCheckins.filter(c => c.ts >= weekAgo).length}`,
      openLoops.length
        ? '- pensieri che sta tenendo da parte: ' + openLoops.slice(-4).map(l => `"${l.text}"${l.kind === 'problema' ? ` (primo passo: ${l.action})` : ' (parcheggiato)'}`).join('; ')
        : null,
    ].filter(x => x !== null).join('\n')
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
    askOra({ apiKey: p.settings.apiKey, settings: p.settings, system: buildSystem(contextBlock(), name), history })
      .then(answer => finish(answer || fallback))
      .catch(err => finish(fallback, err.message === 'Failed to fetch' ? 'connessione assente' : err.message))
  }

  // Registra la risposta scelta nel Momento difficile: è il dato che conta.
  const logPauseChoice = (label, word) => {
    setP(prev => ({ pauseLog: [...prev.pauseLog, { choice: label, ts: Date.now() }] }))
    setS({ screen: 'oggi' })
    flash(`Hai scelto ${word}. Questa è una risposta, non una reazione: contala.`)
  }

  const generateReport = () => {
    if (!liveAI) {
      flash('Per il report scritto da Ora serve la chiave API in Tu. Intanto: ' + localWeekSummary())
      return
    }
    setS({ reportLoading: true })
    weeklyReport({ apiKey: p.settings.apiKey, settings: p.settings, contextBlock: contextBlock(), name })
      .then(text => {
        setS({ reportLoading: false })
        if (text) setP({ weeklyReport: { text, ts: Date.now() } })
        else flash('Il report non è arrivato. Riprova tra poco.')
      })
      .catch(err => {
        setS({ reportLoading: false })
        flash(`Il report non è arrivato (${err.message}).`)
      })
  }

  // Chiede a Ora un modo di iniziare, per una persona aggiunta da te.
  const makeOpener = person => {
    if (!person.name.trim()) { flash('Dai prima un nome a questa persona.'); return }
    if (!liveAI) { flash('Per questo serve la chiave API, nel tuo profilo.'); return }
    setS({ openerLoading: person.id })
    askOpener({ apiKey: p.settings.apiKey, settings: p.settings, person, userName: name })
      .then(text => {
        setS({ openerLoading: null })
        if (text) {
          setP(prev => ({ people: prev.people.map(x => (x.id === person.id ? { ...x, opener: text } : x)) }))
          flash('Ora ti ha scritto un modo di iniziare.')
        } else flash('Non è arrivato niente. Riprova tra poco.')
      })
      .catch(err => { setS({ openerLoading: null }); flash(`Non è arrivato (${err.message}).`) })
  }

  // --- Una cosa per oggi ----------------------------------------------------
  // Una sola volta al giorno. Se la chiamata fallisce resta il testo locale:
  // 'tried' impedisce di riprovare a ogni apertura.
  const dailyKinds = p.settings.dailyKinds?.length ? p.settings.dailyKinds : ['pensiero']
  const firma = dailyKinds.join(',')
  useEffect(() => {
    // 'forKinds' registra cosa hai chiesto: cosi' un tentativo fallito non si
    // ripete a ogni apertura, ma cambiare le preferenze rigenera subito.
    if (p.daily && p.daily.date === tk && p.daily.forKinds?.join(',') === firma) return
    // L'oroscopo senza chiave non si puo' scrivere: si mostra solo quello che
    // c'e' davvero, invece di promettere una cosa e darne un'altra.
    const locali = dailyKinds
      .filter(k => k !== 'segno' || liveAI)
      .map(k => ({ kind: k, text: liveAI && k === 'segno' ? '' : localDaily(k) }))
      .filter(x => x.text)
    setP({ daily: { date: tk, forKinds: dailyKinds, items: locali } })
    if (!liveAI) return
    dailyKinds.forEach(kind => {
      dailyLine({
        apiKey: p.settings.apiKey, settings: p.settings, kind,
        segno: p.profile.segno, contextBlock: contextBlock(), name,
      })
        .then(text => {
          if (!text) return
          setP(prev => {
            const altri = (prev.daily?.items || []).filter(x => x.kind !== kind)
            const ordinati = [...altri, { kind, text }]
              .sort((a, b) => dailyKinds.indexOf(a.kind) - dailyKinds.indexOf(b.kind))
            return { daily: { date: tk, forKinds: dailyKinds, items: ordinati } }
          })
        })
        .catch(() => {})
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tk, firma, p.settings.apiKey])

  // --- Memoria -------------------------------------------------------------

  // Alla fine di una chiacchierata tiene quello che vale la pena ricordare.
  const harvestMemories = () => {
    if (!liveAI) return
    const fresh = p.messages.slice(p.memoryUpTo)
    const mine = fresh.filter(m => m.from === 'me')
    if (mine.length === 0) return
    const exchange = fresh.map(m => `${m.from === 'me' ? name : 'Ora'}: ${m.text}`).join('\n')
    const upTo = p.messages.length
    extractMemories({ apiKey: p.settings.apiKey, settings: p.settings, exchange, known: p.memories, userName: name })
      .then(found => {
        setP(prev => ({
          memoryUpTo: upTo,
          memories: [
            ...prev.memories,
            ...found
              .filter(t => !prev.memories.some(m => m.text.toLowerCase() === t.toLowerCase()))
              .map((text, i) => ({ id: `m-${Date.now()}-${i}`, text, ts: Date.now(), source: 'chat' })),
          ],
        }))
      })
      .catch(() => { setP({ memoryUpTo: upTo }) })
  }

  // Il mese piu' recente che si e' chiuso e che Ora non ha ancora raccontato.
  const pendingMonth = (() => {
    if (!p.checkins.length && !p.seraNotes.length) return null
    const stamps = [...p.checkins.map(c => c.ts), ...p.seraNotes.map(n => n.ts)]
    const now = new Date()
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const months = [...new Set(stamps.map(ts => {
      const d = new Date(ts)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    }))].filter(m => m !== thisMonth).sort()
    const told = new Set(p.chapters.map(c => c.month))
    return months.reverse().find(m => !told.has(m)) || null
  })()

  const monthName = m => {
    const [y, mm] = m.split('-')
    return new Date(Number(y), Number(mm) - 1, 1)
      .toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })
  }

  // Raccoglie il materiale grezzo di un mese e chiede a Ora di raccontarlo.
  const writeChapter = month => {
    if (!liveAI) { flash('Per il racconto del mese serve la chiave, nel tuo profilo.'); return }
    const inMonth = ts => {
      const d = new Date(ts)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === month
    }
    const day2 = ts => new Date(ts).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })
    const cks = p.checkins.filter(c => inMonth(c.ts))
    const notes = p.seraNotes.filter(n => inMonth(n.ts))
    const convos = p.convoLog.filter(c => inMonth(c.ts))
    const pauses = p.pauseLog.filter(x => inMonth(x.ts))
    const days = Object.entries(p.days).filter(([k]) => k.startsWith(month))
    const material = [
      `Check-in (${cks.length}): ` + (cks.map(c => `${day2(c.ts)} ${c.word}${c.intensity >= 4 ? ' (forte)' : ''}${c.tag ? ` [${c.tag}]` : ''}`).join(', ') || 'nessuno'),
      `Momenti difficili risolti con una risposta (${pauses.length}): ` + (pauses.map(x => `${day2(x.ts)} ${x.choice}`).join('; ') || 'nessuno'),
      `Conversazioni (${convos.length}): ` + (convos.map(c => `${c.who} ${c.tone}${c.unsaid ? ` — non detto: ${c.unsaid}` : ''}`).join('; ') || 'nessuna'),
      `Giorni con movimento: ${days.filter(([, d]) => d.moveMin >= 10 || d.done?.move).length} su ${days.length} registrati`,
      'Righe della sera:',
      ...(notes.length ? notes.map(n => `- ${day2(n.ts)}: ${n.text}`) : ['- nessuna']),
    ].join('\n')
    setS({ chapterLoading: true })
    monthChapter({ apiKey: p.settings.apiKey, settings: p.settings, monthLabel: monthName(month), material, userName: name })
      .then(text => {
        setS({ chapterLoading: false })
        if (!text) { flash('Il racconto non e’ arrivato. Riprova tra poco.'); return }
        setP(prev => ({ chapters: [...prev.chapters.filter(c => c.month !== month), { month, text, ts: Date.now() }] }))
        flash(`Ora ha raccontato ${monthName(month)}.`)
      })
      .catch(err => { setS({ chapterLoading: false }); flash(`Non e’ arrivato (${err.message}).`) })
  }

  // --- Il pensiero che gira -------------------------------------------------
  const saveLoop = ({ text, kind, action, dueAt, closedAt }) => {
    setP(prev => ({
      loops: [...prev.loops, { id: `l-${Date.now()}`, text, kind, action: action || null, dueAt: dueAt || null, ts: Date.now(), closedAt: closedAt || null }],
    }))
    flash(kind === 'problema'
      ? 'Non è più un pensiero che gira: è un passo.'
      : closedAt ? 'Lasciato andare. Se torna, sai che ha già avuto il suo posto.'
        : 'Parcheggiato. Ha un orario: non deve chiederti attenzione fino ad allora.')
  }
  const closeLoop = id => setP(prev => ({
    loops: prev.loops.map(l => (l.id === id ? { ...l, closedAt: Date.now() } : l)),
  }))
  // Aperti = non chiusi. In scadenza = parcheggiati la cui ora è arrivata.
  const openLoops = p.loops.filter(l => !l.closedAt)
  const dueLoops = openLoops.filter(l => l.kind === 'preoccupazione' && l.dueAt && l.dueAt <= Date.now())

  // --- Diario ---------------------------------------------------------------
  const writeNote = text => {
    const t = text.trim()
    if (!t) return
    setP(prev => ({ seraNotes: [...prev.seraNotes, { text: t, ts: Date.now(), source: 'diario' }] }))
    flash('Scritto. Resta qui, e Ora lo legge per conoscerti.')
  }
  const removeNote = ts => setP(prev => ({ seraNotes: prev.seraNotes.filter(n => n.ts !== ts) }))

  const localWeekSummary = () => {
    const wc = p.checkins.filter(c => c.ts >= weekAgo)
    const intense = wc.filter(c => c.intensity >= 4 && HARD.includes(c.core)).length
    const n = (x, one, many) => `${x} ${x === 1 ? one : many}`
    const buoni = wc.filter(c => POSITIVE.includes(c.core)).length
    return `${n(wc.length, 'check-in', 'check-in')} questa settimana: ${n(buoni, 'volta stavi bene', 'volte stavi bene')}, ${n(intense, 'picco forte', 'picchi forti')}, ${n(weekResponses.length, 'risposta scelta', 'risposte scelte')} invece di reagire.`
  }

  const app = {
    p, s, setS, setP, day, patchDay, markDone, gentle, name, pattern,
    flash, orderedFlow, logged, todayCheckins, weekStrip, triggers, spikes,
    weekResponses, restorers, goodCheckins, logPauseChoice, generateReport, localWeekSummary, makeOpener,
    harvestMemories, pendingMonth, monthName, writeChapter, dailyKinds,
    writeNote, removeNote,
    saveLoop, closeLoop, openLoops, dueLoops,
    resetAll: () => { setPRaw(freshStart(p.settings)); setS({ screen: 'oggi' }); flash('Ricominciamo da qui.') },
    startSession, stopSession, kindForCourse, logMood, sendText, liveAI,
    breath: t => breath(t, pattern),
    go: screen => setS({ screen }),
    exportData: () => exportAll(p),
    user, hasAccounts: isConfigured,
    leave: () => { signOutNow().then(() => { setPRaw(loadPersisted()); setS({ screen: 'oggi' }) }) },
  }

  const showTabs = ['oggi', 'te', 'pratica'].includes(s.screen)

  // Con gli account attivi, prima di tutto c'è la porta.
  if (user === undefined) return <div className="shell" />
  if (isConfigured && user === null) return <div className="shell"><Auth /></div>

  return (
    <div className="shell">
      {s.screen === 'oggi' && <Oggi app={app} />}
      {s.screen === 'te' && <Te app={app} />}
      {s.screen === 'pratica' && <Pratica app={app} />}
      {s.screen === 'checkin' && <Checkin app={app} />}
      {s.screen === 'pausa' && <Pausa app={app} />}
      {s.screen === 'session' && <Session app={app} />}
      {s.screen === 'sera' && <Sera app={app} />}
      {s.screen === 'coach' && <Coach app={app} />}
      {s.screen === 'profile' && <Profilo app={app} />}
      {s.screen === 'memoria' && <Memoria app={app} />}
      {s.screen === 'calendario' && <Calendario app={app} />}
      {s.screen === 'diario' && <Diario app={app} />}
      {s.screen === 'pensiero' && <Pensiero app={app} />}

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
