import { ArrowRight, Check, Waves, Sprout } from 'lucide-react'
import { COURSE, PATTERNS } from '../data.js'
import { SUONI, subscribe, stop as fermaSuono } from '../soundscape.js'
import { useEffect, useState } from 'react'
import { Square } from 'lucide-react'

// Tutto quello che serve a scendere di giro, in un posto solo.
//
// L'ordine non e' casuale: prima le cose che puoi fare adesso in tre minuti,
// poi il percorso che chiede continuita', poi i due posti dove non devi fare
// niente. Chi arriva qui di solito arriva perche' ha bisogno subito, non
// perche' vuole studiare.

export default function Calma({ app }) {
  const { p, setS, startSession, kindForCourse, gentle, pattern, apriGiardino } = app
  const doneN = p.courseDone.filter(Boolean).length

  const [suono, setSuono] = useState(null)
  useEffect(() => subscribe(setSuono), [])
  const inAscolto = suono?.attivo ? SUONI.find(x => x.k === suono.attivo) : null

  const subito = [
    { label: 'Respiro guidato', meta: `3 minuti · ${PATTERNS[pattern].name}`, start: () => startSession('respiro', 3) },
    { label: 'Scansione del corpo', meta: '5 minuti · per tornare nel corpo', start: () => startSession('scansione', 5) },
    { label: 'Nota le emozioni', meta: '4 minuti · per guardarle senza seguirle', start: () => startSession('nota', 4) },
    { label: 'Rituale della sera', meta: '6 minuti · respiro, tre righe, una domanda', start: () => setS({ screen: 'sera', seraStep: 0, seraT: 0, seraDraft: '' }) },
  ]

  return (
    <div className="screen">
      <div style={{ padding: '4px 0 16px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, lineHeight: 1.1, margin: 0 }}>Calma</h1>
        <div className="meta" style={{ marginTop: 4, lineHeight: 1.45 }}>
          Le cose che ti fanno scendere di giro. Alcune chiedono qualche minuto,
          altre solo di essere guardate.
        </div>
      </div>

      <div className="stack">
        <div className="card sand">
          <div className="h-card" style={{ marginBottom: 4 }}>Adesso, in pochi minuti</div>
          <div style={{ fontSize: 13, color: 'rgba(32,30,29,.6)', lineHeight: 1.5, marginBottom: 14 }}>
            Da usare quando la giornata stringe, non solo quando è tutto in ordine.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {subito.map(q => (
              <button key={q.label} className="quick-row" onClick={q.start}>
                <span style={{ display: 'block' }}>
                  <span style={{ display: 'block', fontSize: 15, fontWeight: 600 }}>{q.label}</span>
                  <span style={{ display: 'block', fontSize: 12, color: 'var(--muted)' }}>{q.meta}</span>
                </span>
                <ArrowRight size={18} strokeWidth={2.75} color="var(--sage-500)" />
              </button>
            ))}
          </div>
        </div>

        <div className="sezione">Dove non devi fare niente</div>

        {inAscolto ? (
          <div className="suona-pill">
            <span className="onda viva" aria-hidden="true"><span /><span /><span /><span /></span>
            <span style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
              <span style={{ display: 'block', fontSize: 15, fontWeight: 600 }}>{inAscolto.label}, adesso</span>
              <span style={{ display: 'block', fontSize: 12, opacity: .75 }}>Continua anche mentre fai altro</span>
            </span>
            <button
              className="btn-outline"
              style={{ minHeight: 40, padding: '0 14px', flex: 'none', borderColor: 'rgba(122,138,94,.45)', color: 'var(--sage-700)' }}
              onClick={() => fermaSuono()}
            >
              <Square size={13} strokeWidth={2.75} /> Ferma
            </button>
          </div>
        ) : (
          <button className="talk-row" onClick={() => setS({ screen: 'suoni' })}>
            <span className="tondo sand"><Waves size={17} strokeWidth={2.75} color="var(--sage-700)" /></span>
            <span style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
              <span style={{ display: 'block', fontSize: 15, fontWeight: 600 }}>Suoni per stare</span>
              <span style={{ display: 'block', fontSize: 12, color: 'var(--muted)' }}>Pioggia, mare, vento, fuoco</span>
            </span>
            <ArrowRight size={18} strokeWidth={2.75} color="var(--sage-500)" />
          </button>
        )}

        <button className="talk-row" onClick={apriGiardino}>
          <span className="tondo sage"><Sprout size={17} strokeWidth={2.75} color="var(--sage-700)" /></span>
          <span style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
            <span style={{ display: 'block', fontSize: 15, fontWeight: 600 }}>Il giardino</span>
            <span style={{ display: 'block', fontSize: 12, color: 'var(--muted)' }}>Quello che hai fatto, diventato piante</span>
          </span>
          <ArrowRight size={18} strokeWidth={2.75} color="var(--sage-500)" />
        </button>

        <div className="sezione">Il percorso</div>

        <div className="card surface" style={{ padding: '8px 18px 14px' }}>
          <div style={{ fontSize: 12.5, color: 'var(--muted)', padding: '10px 0 4px', lineHeight: 1.45 }}>
            {gentle
              ? `${doneN === 0 ? 'Si comincia dal primo passo' : doneN === 1 ? 'Un passo fatto' : doneN + ' passi fatti'}. Il percorso aspetta te, non il contrario.`
              : `${doneN} di 7 · un passo alla volta`}
          </div>
          {COURSE.map((c, i) => {
            const done = p.courseDone[i]
            const now = i === p.courseStep
            return (
              <button key={c.label} className="course-row" onClick={() => startSession(kindForCourse(i), c.mins, null, i)}>
                <span
                  className="course-badge"
                  style={{
                    borderColor: done ? 'var(--sage-700)' : now ? 'var(--sage-500)' : 'rgba(32,30,29,.2)',
                    background: done ? 'var(--sage-500)' : 'transparent',
                    color: done ? 'var(--surface)' : now ? 'var(--sage-700)' : 'rgba(32,30,29,.5)',
                  }}
                >
                  {done ? <Check size={15} strokeWidth={2.75} /> : i + 1}
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 15, fontWeight: 600, lineHeight: 1.3, color: now ? 'var(--text)' : done ? 'rgba(32,30,29,.5)' : 'rgba(32,30,29,.75)' }}>
                    {c.label}
                  </span>
                  <span style={{ display: 'block', fontSize: 12, color: 'rgba(32,30,29,.5)', marginTop: 2 }}>
                    {c.mins} minuti{done ? ' · fatto' : now ? ' · oggi' : ''}
                  </span>
                </span>
                {now && <ArrowRight size={17} strokeWidth={2.75} color="var(--sage-500)" />}
              </button>
            )
          })}
        </div>

        <div className="card surface">
          <div className="h-card" style={{ marginBottom: 10 }}>Cosa stai imparando</div>
          <div style={{ fontSize: 14, color: 'rgba(32,30,29,.65)', lineHeight: 1.55 }}>
            Nelle prime due settimane la mente scapperà decine di volte per sessione.
            Accorgersene è l’esercizio: ogni ritorno al respiro è una ripetizione, come in palestra.
          </div>
        </div>
      </div>
    </div>
  )
}
