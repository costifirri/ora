import { ArrowRight, Check } from 'lucide-react'
import { COURSE, PATTERNS } from '../data.js'

export default function Pratica({ app }) {
  const { p, setS, startSession, kindForCourse, gentle, pattern } = app
  const doneN = p.courseDone.filter(Boolean).length

  const quick = [
    { label: 'Respiro guidato', meta: PATTERNS[pattern].name, start: () => startSession('respiro', 3) },
    { label: 'Scansione del corpo', meta: '5 minuti · per tornare nel corpo', start: () => startSession('scansione', 5) },
    { label: 'Nota le emozioni', meta: '4 minuti · per guardarle senza seguirle', start: () => startSession('nota', 4) },
    { label: 'Rituale della sera', meta: '6 minuti · respiro, tre righe, una domanda', start: () => setS({ screen: 'sera', seraStep: 0, seraT: 0, seraDraft: '' }) },
  ]

  return (
    <div className="screen">
      <div style={{ padding: '4px 0 16px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, lineHeight: 1.1, margin: 0 }}>Pratica</h1>
        <div className="meta" style={{ marginTop: 4 }}>
          {gentle
            ? `${doneN === 0 ? 'Si comincia dal primo passo' : doneN === 1 ? 'Un passo fatto' : doneN + ' passi fatti'}. Il percorso aspetta te, non il contrario.`
            : `${doneN} di 7 · un passo alla volta`}
        </div>
      </div>

      <div className="stack">
        <div className="card surface" style={{ padding: '8px 18px 14px' }}>
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

        <div className="card sand">
          <div className="h-card" style={{ marginBottom: 4 }}>Pratiche brevi</div>
          <div style={{ fontSize: 13, color: 'rgba(32,30,29,.6)', lineHeight: 1.5, marginBottom: 14 }}>
            Da usare quando la giornata stringe, non solo quando è tutto in ordine.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {quick.map(q => (
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

        <div className="card surface">
          <div className="h-card" style={{ marginBottom: 10 }}>Cosa stai imparando</div>
          <div style={{ fontSize: 14, color: 'rgba(32,30,29,.65)', lineHeight: 1.55 }}>
            Nelle prime due settimane la mente scapperà decine di volte per sessione. Accorgersene è l’esercizio: ogni ritorno al respiro è una ripetizione, come in palestra.
          </div>
        </div>
      </div>
    </div>
  )
}
