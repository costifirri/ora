import { useEffect, useState } from 'react'
import { ArrowLeft, Square } from 'lucide-react'
import { SUONI, DURATE, subscribe, start, stop, setVolume, setDurata } from '../soundscape.js'

const restante = fineAt => {
  if (!fineAt) return null
  const m = Math.max(0, Math.round((fineAt - Date.now()) / 60000))
  return m <= 1 ? 'ancora un minuto' : `ancora ${m} minuti`
}

export default function Suoni({ app }) {
  const { setS } = app
  const [sn, setSn] = useState(null)
  const [, tic] = useState(0)

  useEffect(() => subscribe(setSn), [])
  // Solo per far scendere il conto alla rovescia mentre guardi.
  useEffect(() => {
    const t = setInterval(() => tic(n => n + 1), 20000)
    return () => clearInterval(t)
  }, [])

  if (!sn) return null

  return (
    <div className="screen">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 48, marginBottom: 8 }}>
        <button className="btn-back" onClick={() => setS({ screen: 'oggi' })} aria-label="Indietro">
          <ArrowLeft size={18} strokeWidth={2.75} />
        </button>
        <div className="kicker">Suoni per stare</div>
      </div>

      <div style={{ padding: '4px 0 18px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 27, lineHeight: 1.1, margin: 0 }}>
          Qualcosa intorno
        </h1>
        <div className="meta" style={{ marginTop: 8, lineHeight: 1.55 }}>
          Non devi fare niente. Serve solo qualcosa che riempia il silenzio senza
          chiederti attenzione: mentre lavori, mentre ti addormenti, o quando la
          casa è troppo vuota.
        </div>
      </div>

      <div className="stack">
        <div className="card surface">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {SUONI.map(s => {
              const on = sn.attivo === s.k
              return (
                <button
                  key={s.k}
                  className="suono-row"
                  style={{
                    background: on ? 'var(--sage-500)' : 'transparent',
                    borderColor: on ? 'var(--sage-500)' : 'rgba(32,30,29,.14)',
                    color: on ? 'var(--surface)' : 'var(--text)',
                  }}
                  onClick={() => (on ? stop() : start(s.k))}
                  aria-pressed={on}
                >
                  <span className={`onda${on ? ' viva' : ''}`} aria-hidden="true">
                    <span /><span /><span /><span />
                  </span>
                  <span style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                    <span style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: 17 }}>{s.label}</span>
                    <span style={{ display: 'block', fontSize: 12, opacity: on ? .85 : .55, marginTop: 2 }}>{s.nota}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="card surface">
          <div className="h-card" style={{ marginBottom: 12 }}>Volume</div>
          <input
            className="slider"
            type="range" min="0" max="100"
            value={Math.round(sn.volume * 100)}
            onChange={e => setVolume(Number(e.target.value) / 100)}
            aria-label="Volume"
          />
        </div>

        <div className="card surface">
          <div className="h-card" style={{ marginBottom: 4 }}>Per quanto</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>
            {sn.attivo && sn.fineAt
              ? `Si spegne da solo: ${restante(sn.fineAt)}.`
              : sn.durata === 0
                ? 'Resta acceso finché non lo fermi tu.'
                : 'Si spegne da solo, sfumando.'}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {DURATE.map(d => {
              const on = sn.durata === d.min
              return (
                <button
                  key={d.min} className="chip"
                  style={{
                    minHeight: 38, padding: '6px 14px', fontSize: 13,
                    background: on ? 'var(--sage-500)' : 'transparent',
                    color: on ? 'var(--surface)' : 'var(--text)',
                    borderColor: on ? 'var(--sage-500)' : 'rgba(32,30,29,.18)',
                  }}
                  onClick={() => setDurata(d.min)}
                >
                  {d.label}
                </button>
              )
            })}
          </div>
        </div>

        {sn.attivo && (
          <button className="btn-outline" style={{ minHeight: 52, gap: 10 }} onClick={() => stop()}>
            <Square size={15} strokeWidth={2.75} /> Ferma
          </button>
        )}

        <div className="fineprint" style={{ lineHeight: 1.5, padding: '0 8px' }}>
          Il suono continua anche se esci da qui e usi il resto dell’app. Non è una
          registrazione: lo costruisce il telefono mentre lo ascolti, quindi non si
          ripete mai uguale e funziona anche senza rete.
        </div>
      </div>
    </div>
  )
}
