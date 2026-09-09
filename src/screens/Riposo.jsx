import { ArrowLeft } from 'lucide-react'
import { RIPOSO } from '../data.js'

const ORE = [4, 5, 6, 7, 8, 9, 10]

export default function Riposo({ app }) {
  const { day, patchDay, logRest, setS, name, sleepWeek } = app

  const scelto = day.sleep != null || day.rested != null

  return (
    <div className="screen">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 48, marginBottom: 8 }}>
        <button className="btn-back" onClick={() => setS({ screen: 'oggi' })} aria-label="Indietro">
          <ArrowLeft size={18} strokeWidth={2.75} />
        </button>
        <div className="kicker">Al risveglio</div>
      </div>

      <div style={{ padding: '4px 0 18px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 27, lineHeight: 1.1, margin: 0 }}>
          Com’è andata la notte{name ? `, ${name}` : ''}?
        </h1>
        <div className="meta" style={{ marginTop: 8, lineHeight: 1.55 }}>
          Due tocchi, e basta. Il sonno è la leva che muove quasi tutto il resto:
          se lo segni, tra qualche settimana si vede quanto pesa sulle tue giornate.
        </div>
      </div>

      <div className="stack">
        <div className="card surface">
          <div className="h-card" style={{ marginBottom: 4 }}>Quante ore</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>
            {day.sleep != null ? `${day.sleep} ore stanotte` : 'A occhio va benissimo.'}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {ORE.map(hr => {
              const on = day.sleep === hr
              return (
                <button
                  key={hr} className="chip"
                  style={{
                    minWidth: 48, justifyContent: 'center',
                    background: on ? 'var(--sage-500)' : 'transparent',
                    color: on ? 'var(--surface)' : 'var(--text)',
                    borderColor: on ? 'var(--sage-500)' : 'rgba(32,30,29,.18)',
                  }}
                  onClick={() => patchDay(cur => ({ sleep: cur.sleep === hr ? null : hr }))}
                >
                  {hr === 10 ? '10+' : `${hr}h`}
                </button>
              )
            })}
          </div>
        </div>

        <div className="card surface">
          <div className="h-card" style={{ marginBottom: 4 }}>E come ti senti</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>
            Le ore non dicono tutto: sette ore girate male non sono sette ore.
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {RIPOSO.map(r => {
              const on = day.rested === r.k
              return (
                <button
                  key={r.k} className="chip"
                  style={{
                    minHeight: 40, padding: '6px 16px',
                    background: on ? 'var(--sage-500)' : 'transparent',
                    color: on ? 'var(--surface)' : 'var(--text)',
                    borderColor: on ? 'var(--sage-500)' : 'rgba(32,30,29,.18)',
                  }}
                  onClick={() => patchDay(cur => ({ rested: cur.rested === r.k ? null : r.k }))}
                >
                  {r.label}
                </button>
              )
            })}
          </div>
        </div>

        {sleepWeek && (
          <div className="card sand" style={{ fontSize: 13.5, lineHeight: 1.6 }}>
            {sleepWeek}
          </div>
        )}

        <button className="btn-primary" style={{ minHeight: 54, fontSize: 16 }} onClick={logRest} disabled={!scelto}>
          {scelto ? 'Segnato' : 'Scegli almeno una cosa'}
        </button>

        <button className="step-link" style={{ color: 'rgba(32,30,29,.5)' }} onClick={() => setS({ screen: 'oggi' })}>
          Stamattina non mi va
        </button>

        <div className="fineprint" style={{ lineHeight: 1.5, padding: '0 8px' }}>
          L’umore non te lo chiedo qui: quello si segna quando cambia, in qualsiasi
          momento della giornata, dalla home.
        </div>
      </div>
    </div>
  )
}
