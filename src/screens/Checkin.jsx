import { ArrowLeft } from 'lucide-react'
import { CORE, TONES, HARD, INTENSITY_LABELS, TRIGGER_TAGS } from '../data.js'

export default function Checkin({ app }) {
  const { s, setS, logMood } = app
  const core = s.core != null ? CORE[s.core] : null

  const words = core
    ? core.nuance.concat(['Altro ancora']).map(w => ({ label: w, tone: core.tone }))
    : CORE.map((c, i) => ({ label: c.key, tone: c.tone, idx: i }))

  return (
    <div className="screen full">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 48 }}>
        <button className="btn-back" onClick={() => setS({ screen: 'home' })} aria-label="Indietro">
          <ArrowLeft size={18} strokeWidth={2.75} />
        </button>
        <div className="kicker">{core ? 'Passo due di due' : 'Passo uno di due'}</div>
      </div>
      <h2 className="h-screen" style={{ margin: '10px 0 2px' }}>{core ? 'Quale parola ci somiglia di più?' : 'Che emozione è?'}</h2>
      <div style={{ fontSize: 14, color: 'rgba(32,30,29,.6)' }}>
        {core ? 'La sfumatura aiuta a vedere schemi che sfuggirebbero.' : 'Nessuna emozione è sbagliata. Tocca quella che c’è.'}
      </div>

      <div className="wheel">
        <div className="wheel-dash" />
        <div
          className="wheel-center"
          style={{
            background: core ? TONES[core.tone].bg : 'var(--sand)',
            color: core ? TONES[core.tone].fg : 'rgba(32,30,29,.6)',
          }}
        >
          <div style={{ fontFamily: 'var(--font-display)', fontSize: core ? 20 : 15, lineHeight: 1.05 }}>
            {core ? (s.nuance || core.key) : 'Tocca una parola'}
          </div>
          <div style={{ fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', opacity: .65, marginTop: 4 }}>
            {core ? core.sub : 'nove per iniziare'}
          </div>
        </div>
        {words.map((w, i) => {
          const a = (i / words.length) * Math.PI * 2 - Math.PI / 2
          const t = TONES[w.tone]
          const active = core ? s.nuance === w.label : false
          return (
            <button
              key={w.label}
              className="wheel-word"
              style={{
                left: `${50 + 39 * Math.cos(a)}%`,
                top: `${50 + 39 * Math.sin(a)}%`,
                background: active ? t.solid : t.bg,
                color: active ? 'var(--surface)' : t.fg,
                borderColor: active ? t.solid : t.border,
              }}
              onClick={() => (core ? setS({ nuance: w.label }) : setS({ core: w.idx, nuance: null }))}
            >
              {w.label}
            </button>
          )
        })}
      </div>

      <div style={{ marginTop: 'auto', paddingTop: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {core && s.nuance && (
          <>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(32,30,29,.6)', marginBottom: 8 }}>
                <span>Quanto la senti?</span>
                <span style={{ fontWeight: 600, color: 'var(--sage-700)' }}>{INTENSITY_LABELS[s.intensity - 1]}</span>
              </div>
              <input
                type="range" min={1} max={5} value={s.intensity}
                onChange={e => setS({ intensity: Number(e.target.value) })}
                aria-label="Intensità"
              />
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'rgba(32,30,29,.6)', marginBottom: 8 }}>
                Cosa è successo poco prima? <span style={{ opacity: .6 }}>(facoltativo)</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {TRIGGER_TAGS.map(t => {
                  const on = s.checkinTag === t.key
                  return (
                    <button
                      key={t.key}
                      className="chip"
                      style={{
                        minHeight: 36, padding: '6px 12px', fontSize: 12.5,
                        background: on ? 'var(--sage-500)' : 'var(--neutral-tint)',
                        color: on ? 'var(--surface)' : '#474238',
                        borderColor: on ? 'var(--sage-500)' : 'rgba(32,30,29,.18)',
                      }}
                      onClick={() => setS(prev => ({ checkinTag: prev.checkinTag === t.key ? null : t.key }))}
                    >
                      {t.label}
                    </button>
                  )
                })}
              </div>
            </div>
            <div style={{ fontSize: 13, color: 'rgba(32,30,29,.6)', lineHeight: 1.5 }}>
              {HARD.includes(core.key) && s.intensity >= 4
                ? 'Quando è così forte, dopo il check-in ti porto al Momento difficile: novanta secondi prima di rispondere a chiunque.'
                : 'Registrare senza giudizio è metà del lavoro. L’altra metà è la pratica di oggi.'}
            </div>
            <button className="btn-primary" style={{ minHeight: 52, fontSize: 16 }} onClick={logMood}>Registra come stai</button>
          </>
        )}
      </div>
    </div>
  )
}
