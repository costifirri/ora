import { useState } from 'react'
import { ArrowRight, Check, Clock } from 'lucide-react'
import { COURSE, PATTERNS } from '../data.js'
import { SEQUENZE, durataTotale, propostaCalma } from '../yoga.js'

// Tutto quello che serve a scendere di giro.
//
// Prima c'erano quattro "pratiche brevi" che erano letteralmente i passi 2, 4
// e 5 del percorso: stessa cosa, due porte. Adesso la domanda e' una sola —
// quanto tempo hai — e la risposta cambia con la giornata che hai avuto.

const TEMPI = [5, 15, 30]

export default function Calma({ app }) {
  const { p, setS, startSession, kindForCourse, gentle, pattern } = app
  const [minuti, setMinuti] = useState(15)
  const doneN = p.courseDone.filter(Boolean).length
  const pr = propostaCalma(p, minuti)

  const apriYoga = k => setS({ screen: 'yoga', yogaK: k })

  const faiProposta = () => {
    if (pr.tipo === 'yoga') return apriYoga(pr.seq.k)
    if (pr.tipo === 'respiro') return startSession('respiro', pr.min)
    return startSession(kindForCourse(p.courseStep), COURSE[p.courseStep].mins, null, p.courseStep)
  }

  return (
    <div className="screen">
      <div style={{ padding: '4px 0 16px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, lineHeight: 1.1, margin: 0 }}>Calma</h1>
        <div className="meta" style={{ marginTop: 4, lineHeight: 1.45 }}>
          Yoga e meditazione. Dimmi quanto tempo hai e ti dico cosa ha senso adesso.
        </div>
      </div>

      <div className="stack">
        {/* --- Quanto tempo hai --- */}
        <div className="card sage">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Clock size={15} strokeWidth={2.75} color="var(--sage-700)" />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--sage-700)' }}>Quanto tempo hai adesso?</span>
          </div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
            {TEMPI.map(t => {
              const on = minuti === t
              return (
                <button key={t} className="chip"
                  style={{
                    flex: 1, justifyContent: 'center', minHeight: 44,
                    background: on ? 'var(--sage-500)' : 'var(--surface)',
                    color: on ? 'var(--surface)' : 'var(--text)',
                    borderColor: on ? 'var(--sage-500)' : 'rgba(32,30,29,.16)',
                  }}
                  onClick={() => setMinuti(t)}>
                  {t} min
                </button>
              )
            })}
          </div>

          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, lineHeight: 1.2 }}>
            {pr.tipo === 'yoga' ? pr.seq.nome : pr.tipo === 'respiro' ? pr.titolo : COURSE[p.courseStep].label}
          </div>
          <div style={{ fontSize: 12.5, color: 'rgba(32,30,29,.55)', marginTop: 3 }}>
            {pr.tipo === 'yoga'
              ? `${durataTotale(pr.seq)} minuti · ${pr.seq.serve.toLowerCase()}`
              : pr.tipo === 'respiro'
                ? `${pr.min} minuti · ${PATTERNS[pattern].name.toLowerCase()}`
                : `${COURSE[p.courseStep].mins} minuti · passo ${p.courseStep + 1} del percorso`}
          </div>
          <div style={{ fontSize: 13.5, color: 'rgba(32,30,29,.72)', lineHeight: 1.55, marginTop: 10 }}>{pr.riga}</div>

          <button className="btn-primary" style={{ minHeight: 50, fontSize: 15, marginTop: 14 }} onClick={faiProposta}>
            {pr.tipo === 'yoga' ? 'Guidami' : 'Comincia'}
          </button>
        </div>

        {/* --- Yoga --- */}
        <div className="sezione">Yoga</div>

        {SEQUENZE.map(seq => (
          <button key={seq.k} className="talk-row" style={{ alignItems: 'flex-start', paddingTop: 12, paddingBottom: 12 }}
            onClick={() => apriYoga(seq.k)}>
            <span style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
              <span style={{ display: 'block', fontSize: 15, fontWeight: 600 }}>{seq.nome}</span>
              <span style={{ display: 'block', fontSize: 12, color: 'var(--sage-700)', marginTop: 2 }}>
                {durataTotale(seq)} minuti · {seq.posizioni.length} posizioni · {seq.quando.toLowerCase()}
              </span>
              <span style={{ display: 'block', fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.45, marginTop: 4 }}>
                {seq.perche}
              </span>
            </span>
            <ArrowRight size={18} strokeWidth={2.75} color="var(--sage-500)" style={{ marginTop: 4 }} />
          </button>
        ))}

        {/* --- Meditazione --- */}
        <div className="sezione">Meditazione</div>

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
                <span className="course-badge"
                  style={{
                    borderColor: done ? 'var(--sage-700)' : now ? 'var(--sage-500)' : 'rgba(32,30,29,.2)',
                    background: done ? 'var(--sage-500)' : 'transparent',
                    color: done ? 'var(--surface)' : now ? 'var(--sage-700)' : 'rgba(32,30,29,.5)',
                  }}>
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

        <button className="quick-row" onClick={() => startSession('respiro', 3)}>
          <span style={{ display: 'block' }}>
            <span style={{ display: 'block', fontSize: 15, fontWeight: 600 }}>Solo respiro</span>
            <span style={{ display: 'block', fontSize: 12, color: 'var(--muted)' }}>3 minuti · {PATTERNS[pattern].name}</span>
          </span>
          <ArrowRight size={18} strokeWidth={2.75} color="var(--sage-500)" />
        </button>

        <button className="quick-row" onClick={() => setS({ screen: 'diario', sera: true })}>
          <span style={{ display: 'block' }}>
            <span style={{ display: 'block', fontSize: 15, fontWeight: 600 }}>Chiudi la giornata</span>
            <span style={{ display: 'block', fontSize: 12, color: 'var(--muted)' }}>Tre righe e una domanda, nel diario</span>
          </span>
          <ArrowRight size={18} strokeWidth={2.75} color="var(--sage-500)" />
        </button>

        <div className="fineprint" style={{ lineHeight: 1.5, padding: '0 8px' }}>
          Nello yoga il tempo scritto è un suggerimento, non una regola. Se una
          posizione fa male smetti: fastidio e dolore non sono la stessa cosa.
        </div>
      </div>
    </div>
  )
}
