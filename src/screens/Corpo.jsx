import { Check } from 'lucide-react'
import { HARD, dailyTip } from '../data.js'
import { todayKey } from '../storage.js'

const MEALS = [
  { k: 'colazione', label: 'Colazione', note: 'Anche piccola, purché ci sia' },
  { k: 'pranzo', label: 'Pranzo', note: 'Con verdure, quando ci sta' },
  { k: 'cena', label: 'Cena', note: 'Presto aiuta il sonno' },
]

// Insight calcolato: confronta i giorni con movimento e quelli senza,
// guardando i picchi intensi registrati nello stesso giorno.
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
  if (a > b) return `In questo periodo i picchi non seguono il movimento: arrivano anche nei giorni in cui cammini. Vale la pena guardare gli inneschi in Conoscerti, più che i chilometri.`
  return `Finora movimento e picchi vanno di pari passo. Servono ancora un po' di giorni per vedere uno schema.`
}

export default function Corpo({ app }) {
  const { p, day, patchDay, todayCheckins } = app
  const insight = movementInsight(p)
  const daysTracked = Object.keys(p.days).length
  const tip = dailyTip({
    hour: new Date().getHours(),
    sleep: day.sleep,
    spikeToday: todayCheckins.some(c => c.intensity >= 4 && HARD.includes(c.core)),
    water: day.water,
    meals: day.meals,
  })

  return (
    <div className="screen">
      <div style={{ padding: '4px 0 16px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, lineHeight: 1.1, margin: 0 }}>Corpo</h1>
        <div className="meta" style={{ marginTop: 4 }}>Quello che registri tu, niente stime</div>
      </div>

      <div className="stack">
        <div className="card surface">
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
            <div className="h-card">Movimento</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>{day.moveMin} min oggi</div>
          </div>
          <div className="body-track" style={{ marginBottom: 14 }}>
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
          <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.5, marginTop: 12 }}>
            {day.moveMin >= 30
              ? 'Mezz’ora fatta. Il resto della giornata parte da un corpo che ha già scaricato qualcosa.'
              : 'Dieci minuti contano quanto trenta, nei giorni storti. Segna quello che è successo davvero.'}
          </div>
        </div>

        <div className="card sand">
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
            <div className="h-card">Sonno</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>
              {day.sleep != null ? `${day.sleep} ore stanotte` : 'non ancora registrato'}
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {[4, 5, 6, 7, 8, 9, 10].map(h => {
              const on = day.sleep === h
              return (
                <button
                  key={h}
                  className="chip"
                  style={{
                    minWidth: 44, justifyContent: 'center',
                    background: on ? 'var(--sage-500)' : 'var(--surface)',
                    color: on ? 'var(--surface)' : 'var(--text)',
                    borderColor: on ? 'var(--sage-500)' : 'rgba(32,30,29,.18)',
                  }}
                  onClick={() => patchDay(cur => ({ sleep: cur.sleep === h ? null : h }))}
                >
                  {h}h
                </button>
              )
            })}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.5, marginTop: 12 }}>
            Un tocco appena sveglia. Serve a vedere come si lega alle giornate, non a farti da sveglia.
          </div>
        </div>

        <div className="card surface">
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
            <div className="h-card">Acqua</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>{day.water} {day.water === 1 ? 'bicchiere' : 'bicchieri'} su 8</div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
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
              className="btn-primary" style={{ flex: 1, width: 'auto', minHeight: 46, fontSize: 15 }}
              onClick={() => patchDay(cur => ({ water: Math.min(8, cur.water + 1) }))}
            >
              + Un bicchiere
            </button>
            <button className="btn-outline" style={{ minHeight: 46, padding: '0 18px' }} onClick={() => patchDay({ water: 0 })}>
              Azzera
            </button>
          </div>
        </div>

        <div className="card sand">
          <div className="h-card" style={{ marginBottom: 12 }}>Nutrimento</div>

          <div style={{ background: 'var(--sage-050)', border: '1px solid rgba(122,138,94,.35)', borderRadius: 24, padding: '16px 18px', marginBottom: 16 }}>
            <div className="kicker" style={{ color: 'rgba(86,99,63,.85)', marginBottom: 8 }}>Oggi</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, lineHeight: 1.3, color: 'var(--forest)' }}>
              {tip.text}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(61,71,43,.85)', lineHeight: 1.5, marginTop: 8 }}>
              {tip.why}
            </div>
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
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: 15, fontWeight: 600, color: on ? 'rgba(32,30,29,.5)' : 'var(--text)' }}>{m.label}</span>
                    <span style={{ display: 'block', fontSize: 12, color: 'rgba(32,30,29,.5)' }}>{m.note}</span>
                  </span>
                </button>
              )
            })}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.5, marginTop: 14 }}>
            Nessun conteggio di calorie. Solo: hai mangiato, sì o no.
          </div>
        </div>

        <div className="card surface">
          <div className="h-card" style={{ marginBottom: 10 }}>Cosa dicono i tuoi giorni</div>
          <div style={{ fontSize: 14, color: 'rgba(32,30,29,.65)', lineHeight: 1.55 }}>
            {insight || `Ancora pochi giorni registrati (${daysTracked}). Continua a segnare movimento e sonno: dopo qualche giorno qui compare come si legano ai tuoi picchi.`}
          </div>
        </div>
      </div>
    </div>
  )
}
