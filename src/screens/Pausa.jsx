import { ArrowLeft } from 'lucide-react'
import { PAUSA_STEPS, PAUSA_CHOICES } from '../data.js'

export default function Pausa({ app }) {
  const { s, setS, breath, logPauseChoice } = app
  const ps = PAUSA_STEPS[s.pausaStep]
  const pb = breath(s.pausaT)

  return (
    <div className="screen full sandbg">
      <div className="full-head">
        <button className="btn-back" onClick={() => setS({ screen: 'oggi' })} aria-label="Indietro">
          <ArrowLeft size={18} strokeWidth={2.75} />
        </button>
        <div className="kicker">{ps.kicker}</div>
        <div style={{ width: 40 }} />
      </div>

      <div className="seg-row">
        {[0, 1, 2, 3].map(i => (
          <span key={i} className="seg" style={{ background: i <= s.pausaStep ? 'var(--terra-500)' : 'rgba(32,30,29,.16)' }} />
        ))}
      </div>

      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 27, lineHeight: 1.15, margin: 0 }}>{ps.title}</h2>
      <div style={{ fontSize: 15, color: 'rgba(32,30,29,.65)', lineHeight: 1.55, marginTop: 10 }}>{ps.body}</div>

      {s.pausaStep === 2 && (
        <div className="breath-wrap" style={{ margin: '34px 0' }}>
          <div
            className="breath-circle"
            style={{
              width: 210, height: 210,
              background: 'radial-gradient(circle at 50% 40%, #d67f48, #8c491a)',
              transform: `scale(${pb.scale.toFixed(3)})`,
            }}
          >
            <div className="breath-word">{pb.word}</div>
          </div>
          <div className="breath-status" style={{ color: 'rgba(32,30,29,.55)' }}>
            {pb.word} · {pb.remain}s · respiro {Math.min(3, pb.cycle)} di 3
          </div>
        </div>
      )}

      {s.pausaStep === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24 }}>
          {PAUSA_CHOICES.map(c => (
            <button
              key={c.label}
              style={{
                width: '100%', minHeight: 60, padding: '14px 18px', border: '1px solid rgba(32,30,29,.18)',
                borderRadius: 24, background: 'var(--surface)', cursor: 'pointer', textAlign: 'left',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--sage-050)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--surface)')}
              onClick={() => logPauseChoice(c.label, c.word)}
            >
              <span style={{ display: 'block', fontSize: 15, fontWeight: 600 }}>{c.label}</span>
              <span style={{ display: 'block', fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>{c.note}</span>
            </button>
          ))}
        </div>
      )}

      <div style={{ marginTop: 'auto', paddingTop: 20 }}>
        {s.pausaStep < 3 && (
          <button
            className="btn-primary" style={{ minHeight: 52, fontSize: 16 }}
            onClick={() => setS(prev => ({ pausaStep: prev.pausaStep + 1, pausaT: 0 }))}
          >
            {ps.cta}
          </button>
        )}
        <div style={{ textAlign: 'center', fontSize: 12, color: 'rgba(32,30,29,.5)', marginTop: 12 }}>
          L’onda di rabbia dura circa novanta secondi. Stai solo aspettando che passi.
        </div>
      </div>
    </div>
  )
}
