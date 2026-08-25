import { ArrowRight, CalendarDays } from 'lucide-react'
import CorpoSection from '../sections/CorpoSection.jsx'
import SchemiSection from '../sections/SchemiSection.jsx'
import LegamiSection from '../sections/LegamiSection.jsx'

const LENSES = [
  { k: 'come', label: 'Come stai' },
  { k: 'corpo', label: 'Corpo' },
  { k: 'legami', label: 'Legami' },
]

const INTENTION_EXAMPLES = [
  'Se sento salire la rabbia dopo le 21, allora apro il Momento difficile prima di rispondere.',
  'Se esco di casa in ritardo, allora faccio tre espiri lunghi prima di partire.',
  'Se il telefono mi porta via la sera, allora lo lascio in un’altra stanza dopo cena.',
  'Se qualcosa mi dà fastidio, allora lo dico in una frase invece di tacere.',
]

const fmtDate = ts => new Date(ts).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })

export default function Te({ app }) {
  const { p, s, setS, setP, generateReport, localWeekSummary, liveAI, pendingMonth, monthName, writeChapter } = app
  const lens = s.teTab || 'come'

  return (
    <div className="screen">
      <div style={{ padding: '4px 0 16px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, lineHeight: 1.1, margin: 0 }}>Te</h1>
        <div className="meta" style={{ marginTop: 4 }}>Quello che noto, quando lo guardiamo insieme</div>
      </div>

      <div className="stack">
        <button className="talk-row" onClick={() => setS({ screen: 'memoria' })}>
          <span className="coach-avatar" style={{ width: 38, height: 38, fontSize: 15 }}>O</span>
          <span style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
            <span style={{ display: 'block', fontSize: 15, fontWeight: 600 }}>Cosa so di te</span>
            <span style={{ display: 'block', fontSize: 12, color: 'var(--muted)' }}>
              {p.profile.lavoro || p.memories.length
                ? `${p.memories.length ? p.memories.length + ' cose che mi hai detto' : 'La tua scheda'}${p.chapters.length ? ` · ${p.chapters.length} mes${p.chapters.length === 1 ? 'e' : 'i'} raccontat${p.chapters.length === 1 ? 'o' : 'i'}` : ''}`
                : 'Raccontami chi sei, così ti parlo davvero'}
            </span>
          </span>
          <ArrowRight size={18} strokeWidth={2.75} color="var(--sage-500)" />
        </button>

        <button className="talk-row" onClick={() => setS({ screen: 'calendario' })}>
          <span style={{
            width: 38, height: 38, flex: 'none', borderRadius: 999, background: 'var(--sand)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CalendarDays size={18} strokeWidth={2.75} color="var(--sage-700)" />
          </span>
          <span style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
            <span style={{ display: 'block', fontSize: 15, fontWeight: 600 }}>Le tue giornate</span>
            <span style={{ display: 'block', fontSize: 12, color: 'var(--muted)' }}>Rivedi un giorno qualsiasi, com'è andato davvero</span>
          </span>
          <ArrowRight size={18} strokeWidth={2.75} color="var(--sage-500)" />
        </button>

        {pendingMonth && (
          <div className="card sage">
            <div className="kicker" style={{ color: 'rgba(86,99,63,.75)' }}>Un mese è finito</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, lineHeight: 1.2, margin: '8px 0 6px', color: 'var(--forest)' }}>
              Vuoi che ti racconti {monthName(pendingMonth)}?
            </div>
            <div style={{ fontSize: 13.5, color: 'rgba(61,71,43,.8)', lineHeight: 1.5, marginBottom: 12 }}>
              Rileggo quello che è successo e ne tengo poche righe. Fra sei mesi saranno l’unica cosa
              che ti resta di questo periodo.
            </div>
            <button className="btn-primary" style={{ minHeight: 48 }} onClick={() => writeChapter(pendingMonth)} disabled={s.chapterLoading}>
              {s.chapterLoading ? 'Sto rileggendo…' : 'Raccontamelo'}
            </button>
          </div>
        )}

        <div className="card sand">
          <div className="h-card" style={{ marginBottom: 10 }}>Questa settimana</div>
          <div style={{ fontSize: 14, color: 'rgba(32,30,29,.7)', lineHeight: 1.55 }}>{localWeekSummary()}</div>

          {p.weeklyReport && (
            <div style={{ marginTop: 14, background: 'var(--sage-050)', borderRadius: 24, padding: '16px 18px' }}>
              <div className="kicker" style={{ color: 'rgba(86,99,63,.8)', marginBottom: 8 }}>
                Ora, il {fmtDate(p.weeklyReport.ts)}
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(32,30,29,.8)', whiteSpace: 'pre-wrap' }}>
                {p.weeklyReport.text}
              </div>
            </div>
          )}

          <button
            className="btn-outline" style={{ width: '100%', minHeight: 48, marginTop: 14 }}
            onClick={generateReport}
            disabled={s.reportLoading}
          >
            {s.reportLoading ? 'Ora sta scrivendo…' : p.weeklyReport ? 'Chiedi a Ora di rileggerla' : 'Chiedi a Ora di leggere la settimana'}
          </button>
          {!liveAI && (
            <div style={{ fontSize: 11.5, color: 'rgba(32,30,29,.45)', lineHeight: 1.45, marginTop: 8 }}>
              Per il report scritto da Ora serve la chiave API, nel tuo profilo.
            </div>
          )}
        </div>

        <div className="card sage">
          <div className="kicker" style={{ color: 'rgba(86,99,63,.75)' }}>La tua regola</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, lineHeight: 1.2, margin: '8px 0 6px', color: 'var(--forest)' }}>
            Se succede questo, allora faccio quello
          </div>
          <div style={{ fontSize: 13.5, color: 'rgba(61,71,43,.8)', lineHeight: 1.5, marginBottom: 12 }}>
            Una sola regola, scritta prima che serva. Decidere a freddo è più facile che decidere nel momento.
          </div>
          <textarea
            className="textarea"
            style={{ background: 'var(--surface)', minHeight: 72 }}
            value={p.intention}
            placeholder="Se… allora…"
            onChange={e => setP({ intention: e.target.value })}
            aria-label="La tua regola della settimana"
          />
          {!p.intention && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
              {INTENTION_EXAMPLES.map(ex => (
                <button
                  key={ex}
                  style={{
                    textAlign: 'left', border: '1px solid rgba(86,99,63,.35)', borderRadius: 18,
                    background: 'transparent', padding: '10px 14px', fontSize: 12.5, lineHeight: 1.45,
                    color: 'var(--forest)', cursor: 'pointer', minHeight: 44,
                  }}
                  onClick={() => setP({ intention: ex })}
                >
                  {ex}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lens-row" role="tablist" aria-label="Cosa guardare">
          {LENSES.map(l => (
            <button
              key={l.k}
              role="tab"
              aria-selected={lens === l.k}
              className={`lens-btn${lens === l.k ? ' on' : ''}`}
              onClick={() => setS({ teTab: l.k })}
            >
              {l.label}
            </button>
          ))}
        </div>

        {lens === 'come' && <SchemiSection app={app} />}
        {lens === 'corpo' && <CorpoSection app={app} />}
        {lens === 'legami' && <LegamiSection app={app} />}
      </div>
    </div>
  )
}
