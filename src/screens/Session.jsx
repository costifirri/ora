import { ArrowLeft } from 'lucide-react'
import { CUES, PATTERNS } from '../data.js'

export default function Session({ app }) {
  const { s, setS, stopSession, breath, gentle, pattern } = app
  const b = breath(s.t)
  const narrated = s.sessionKind !== 'respiro'
  const cues = CUES[s.sessionKind] || []

  const nameOf = {
    respiro: PATTERNS[pattern].name,
    scansione: 'Scansione del corpo',
    nota: 'Notare le emozioni',
    letto: 'A letto · per dormire',
    tornare: 'Tornare al respiro',
  }[s.sessionKind]

  const scale = narrated
    ? 0.94 + 0.06 * (0.5 - Math.cos(s.t * Math.PI / 6) / 2)
    : b.scale

  const status = s.running
    ? (narrated
      ? `Passo ${s.cue + 1} di ${cues.length} · ${Math.floor(s.t / 60)}:${String(Math.floor(s.t % 60)).padStart(2, '0')}`
      : `${b.word} · ${b.remain}s · ciclo ${b.cycle}`)
    : 'Siediti come stai. Senza suono, schermo basso.'

  return (
    <div className="screen full dark">
      <div className="full-head">
        <button className="btn-back" onClick={stopSession} aria-label="Chiudi la sessione">
          <ArrowLeft size={18} strokeWidth={2.75} />
        </button>
        <div className="kicker">{nameOf}</div>
        <div style={{ width: 40 }} />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28 }}>
        <div className="session-outer">
          <div className="session-halo" />
          <div className="session-circle" style={{ transform: `scale(${scale.toFixed(3)})` }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: narrated ? 17 : 24, lineHeight: 1.2, color: 'var(--surface)' }}>
              {narrated ? cues[s.cue] : (s.running ? b.word : 'Pronta')}
            </div>
          </div>
        </div>
        <div style={{ fontSize: 14, color: 'rgba(249,244,237,.6)', fontVariantNumeric: 'tabular-nums', textAlign: 'center', maxWidth: 280, lineHeight: 1.5 }}>
          {status}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button className="btn-light" onClick={() => setS(prev => ({ running: !prev.running }))}>
          {s.running ? 'Pausa' : s.t > 0 ? 'Riprendi' : 'Inizia'}
        </button>
        <div style={{ textAlign: 'center', fontSize: 12, color: 'rgba(249,244,237,.45)' }}>
          {gentle ? 'Fermati quando vuoi. Non si conta niente.' : `Sessione ${s.sessionMins} minuti`}
        </div>
      </div>
    </div>
  )
}
