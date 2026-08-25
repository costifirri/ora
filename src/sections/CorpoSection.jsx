import { Check } from 'lucide-react'
import { HARD, dailyTip } from '../data.js'
import { todayKey } from '../storage.js'

const MEALS = [
  { k: 'colazione', label: 'Colazione' },
  { k: 'pranzo', label: 'Pranzo' },
  { k: 'cena', label: 'Cena' },
]

// Confronta i giorni con movimento e quelli fermi, sui picchi registrati.
function movementInsight(p) {
  const days = Object.entries(p.days)
  if (days.length < 4) return null
  const spikesOn = dk => p.checkins.filter(
    c => todayKey(new Date(c.ts)) === dk && c.intensity >= 4 && HARD.includes(c.core),
  ).length
  const moved = days.filter(([, d]) => d.moveMin >= 10 || d.done?.move)
  const still = days.filter(([, d]) => !(d.moveMin >= 10 || d.done?.move))
  if (moved.length < 2 || still.length < 2) return null
  const avg = list => list.reduce((a, [dk]) => a + spikesOn(dk), 0) / list.length
  const a = avg(moved), b = avg(still)
  if (a < b) return `Nei giorni in cui ti muovi arrivano meno picchi che nei giorni fermi (${a.toFixed(1)} contro ${b.toFixed(1)} in media). Non è forza di volontà, è sistema nervoso.`
  if (a > b) return 'In questo periodo i picchi non seguono il movimento: arrivano anche nei giorni in cui cammini. Vale la pena guardare gli inneschi qui sopra, più che i chilometri.'
  return 'Finora movimento e picchi vanno di pari passo. Servono ancora un po’ di giorni per vedere uno schema.'
}

export default function CorpoSection({ app }) {
  const { p, day, patchDay, todayCheckins } = app
  const insight = movementInsight(p)
  const tip = dailyTip({
    hour: new Date().getHours(),
    sleep: day.sleep,
    spikeToday: todayCheckins.some(c => c.intensity >= 4 && HARD.includes(c.core)),
    water: day.water,
    meals: day.meals,
  })

  return (
    <>
      <div className="card surface">
        <div className="h-card" style={{ marginBottom: 4 }}>Movimento</div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>{day.moveMin} minuti oggi</div>
        <div className="body-track" style={{ marginBottom: 12 }}>
          <div
            className="body-fill"
            style={{
              width: `${Math.min(100, Math.round(100 * day.moveMin / 30))}%`,
              background: day.moveMin >= 30 ? 'var(--sage-500)' : 'var(--terra-500)',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[10, 20, 30].map(n => (
            <button
              key={n}
              className="chip"
              style={{ background: 'var(--sage-100)', color: 'var(--sage-700)', borderColor: 'rgba(122,138,94,.4)' }}
              onClick={() => patchDay(cur => ({ moveMin: cur.moveMin + n, done: { ...cur.done, move: true } }))}
            >
              + {n} min
            </button>
          ))}
          <button className="chip" style={{ background: 'transparent', borderColor: 'rgba(32,30,29,.18)' }} onClick={() => patchDay({ moveMin: 0 })}>
            Azzera
          </button>
        </div>
      </div>

      <div className="card surface">
        <div className="h-card" style={{ marginBottom: 4 }}>Sonno</div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>
          {day.sleep != null ? `${day.sleep} ore stanotte` : 'Quante ore hai dormito?'}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {[4, 5, 6, 7, 8, 9, 10].map(hr => {
            const on = day.sleep === hr
            return (
              <button
                key={hr}
                className="chip"
                style={{
                  minWidth: 46, justifyContent: 'center',
                  background: on ? 'var(--sage-500)' : 'transparent',
                  color: on ? 'var(--surface)' : 'var(--text)',
                  borderColor: on ? 'var(--sage-500)' : 'rgba(32,30,29,.18)',
                }}
                onClick={() => patchDay(cur => ({ sleep: cur.sleep === hr ? null : hr }))}
              >
                {hr}h
              </button>
            )
          })}
        </div>
      </div>

      <div className="card surface">
        <div className="h-card" style={{ marginBottom: 4 }}>Acqua</div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>
          {day.water} {day.water === 1 ? 'bicchiere' : 'bicchieri'} su 8
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {Array.from({ length: 8 }, (_, i) => (
            <button
              key={i}
              className="glass"
              aria-label={`Segna ${i + 1} bicchieri`}
              style={{
                borderColor: i < day.water ? 'var(--sage-500)' : 'rgba(32,30,29,.22)',
                background: i < day.water ? 'var(--sage-300)' : 'transparent',
              }}
              onClick={() => patchDay({ water: i + 1 })}
            />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn-primary" style={{ flex: 1, width: 'auto', minHeight: 44, fontSize: 15 }}
            onClick={() => patchDay(cur => ({ water: Math.min(8, cur.water + 1) }))}
          >
            + Un bicchiere
          </button>
          <button className="btn-outline" style={{ minHeight: 44, padding: '0 18px' }} onClick={() => patchDay({ water: 0 })}>
            Azzera
          </button>
        </div>
      </div>

      <div className="card sand">
        <div className="h-card" style={{ marginBottom: 12 }}>Nutrimento</div>

        <div style={{ background: 'var(--sage-050)', border: '1px solid rgba(122,138,94,.35)', borderRadius: 24, padding: '16px 18px', marginBottom: 16 }}>
          <div className="kicker" style={{ color: 'rgba(86,99,63,.85)', marginBottom: 8 }}>Oggi</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, lineHeight: 1.3, color: 'var(--forest)' }}>{tip.text}</div>
          <div style={{ fontSize: 13, color: 'rgba(61,71,43,.85)', lineHeight: 1.5, marginTop: 8 }}>{tip.why}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {MEALS.map(m => {
            const on = day.meals[m.k]
            return (
              <button
                key={m.k}
                className="meal-row"
                style={{ border: 0, borderBottom: '1px solid rgba(32,30,29,.10)', background: 'transparent', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                onClick={() => patchDay(cur => ({ meals: { ...cur.meals, [m.k]: !cur.meals[m.k] } }))}
              >
                <span style={{
                  width: 24, height: 24, flex: 'none', borderRadius: 999,
                  border: `2px solid ${on ? 'var(--sage-700)' : 'rgba(32,30,29,.28)'}`,
                  background: on ? 'var(--sage-700)' : 'transparent', color: 'var(--surface)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {on && <Check size={13} strokeWidth={2.75} />}
                </span>
                <span style={{ flex: 1, minWidth: 0, fontSize: 15, fontWeight: 600, color: on ? 'rgba(32,30,29,.5)' : 'var(--text)' }}>
                  {m.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {insight && (
        <div className="card surface">
          <div className="h-card" style={{ marginBottom: 10 }}>Movimento e picchi</div>
          <div style={{ fontSize: 14, color: 'rgba(32,30,29,.65)', lineHeight: 1.55 }}>{insight}</div>
        </div>
      )}
    </>
  )
}
