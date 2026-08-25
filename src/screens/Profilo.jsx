import { TONES, HARD } from '../data.js'

const INTENTS = [
  { label: 'Imparare a meditare', tone: 'sage' },
  { label: 'Fermarmi prima di reagire', tone: 'accent' },
  { label: 'Conoscermi meglio', tone: 'sage' },
  { label: 'Conversazioni più vere', tone: 'accent' },
]

const TOGGLES = [
  { k: 'gentle', label: 'Modalità senza sensi di colpa', note: 'Nasconde serie, punteggi e conteggi' },
]

// Esempi di intenzione "se X, allora Y": si sceglie, poi si può riscrivere.
const INTENTION_EXAMPLES = [
  'Se sento salire la rabbia dopo le 21, allora apro il Momento difficile prima di rispondere.',
  'Se esco di casa in ritardo, allora faccio tre espiri lunghi in ascensore.',
  'Se il telefono mi porta via mezz’ora dopo cena, allora lo lascio in un’altra stanza.',
  'Se qualcuno mi dà fastidio, allora dico come sto in una frase invece di tacere.',
]

const fmtDate = ts => new Date(ts).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })

export default function Profilo({ app }) {
  const { p, s, setP, gentle, name, exportData, spikes, weekResponses, generateReport, localWeekSummary } = app

  const weekAgo = Date.now() - 7 * 24 * 3600 * 1000
  const weekCheckins = p.checkins.filter(c => c.ts >= weekAgo)
  const weekIntense = weekCheckins.filter(c => c.intensity >= 4 && HARD.includes(c.core)).length

  const summary = gentle
    ? `Questa settimana ti sei fermata a dare un nome ${weekCheckins.length === 1 ? 'una volta' : weekCheckins.length + ' volte'}${weekIntense ? `, e ${weekIntense === 1 ? 'una volta' : weekIntense + ' volte'} era forte` : ''}. ${weekResponses.length ? `In ${weekResponses.length === 1 ? 'un caso' : weekResponses.length + ' casi'} hai scelto una risposta invece di reagire.` : 'Il Momento difficile è lì per quando serve.'}`
    : `${p.checkins.length} check-in in tutto, ${spikes.length} picchi forti, ${weekResponses.length} risposte scelte questa settimana.`

  return (
    <div className="screen">
      <div style={{ padding: '4px 0 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ width: 64, height: 64, borderRadius: 999, background: 'var(--sage-100)', color: 'var(--sage-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 24, flex: 'none' }}>
          {name[0]}
        </span>
        <span style={{ minWidth: 0 }}>
          <span style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: 24 }}>{name}</span>
          <span style={{ display: 'block', fontSize: 13, color: 'var(--muted)' }}>Percorso calma · un passo alla volta</span>
        </span>
      </div>

      <div className="stack">
        <div className="card sage">
          <div className="kicker" style={{ color: 'rgba(86,99,63,.75)' }}>La tua regola della settimana</div>
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
            aria-label="Intenzione della settimana"
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

        <div className="card sand">
          <div className="h-card" style={{ marginBottom: 10 }}>Su cosa stai lavorando</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {INTENTS.map(i => (
              <span key={i.label} className="intent-chip" style={{ background: TONES[i.tone].bg, color: TONES[i.tone].fg }}>
                {i.label}
              </span>
            ))}
          </div>
        </div>

        <div className="card surface" style={{ padding: '8px 18px' }}>
          {TOGGLES.map(t => {
            const on = p.settings[t.k]
            return (
              <button
                key={t.k} className="toggle-row" role="switch" aria-checked={on}
                onClick={() => setP(prev => ({ settings: { ...prev.settings, [t.k]: !prev.settings[t.k] } }))}
              >
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 15, fontWeight: 600 }}>{t.label}</span>
                  <span style={{ display: 'block', fontSize: 12, color: 'rgba(32,30,29,.5)', lineHeight: 1.4 }}>{t.note}</span>
                </span>
                <span className="toggle-track" style={{ background: on ? 'var(--sage-500)' : 'rgba(32,30,29,.22)', justifyContent: on ? 'flex-end' : 'flex-start' }}>
                  <span className="toggle-knob" />
                </span>
              </button>
            )
          })}
        </div>

        <div className="card sand">
          <div className="h-card" style={{ marginBottom: 10 }}>Compagna AI</div>
          <div style={{ fontSize: 13, color: 'rgba(32,30,29,.6)', lineHeight: 1.5, marginBottom: 10 }}>
            Con una chiave API Anthropic, Ora risponde davvero a quello che scrivi e ti scrive il report della settimana.
            Senza, usa frasi preparate. La chiave resta su questo dispositivo.
          </div>
          <input
            className="apikey-input"
            type="password"
            value={p.settings.apiKey}
            placeholder="sk-ant-…"
            onChange={e => setP(prev => ({ settings: { ...prev.settings, apiKey: e.target.value.trim() } }))}
            aria-label="Chiave API Anthropic"
          />
          <div style={{ fontSize: 12, marginTop: 8, color: p.settings.apiKey ? 'var(--sage-700)' : 'rgba(32,30,29,.5)' }}>
            {p.settings.apiKey
              ? '✓ Chiave presente su questo dispositivo: Ora risponde davvero.'
              : 'Nessuna chiave su questo dispositivo. La chiave non si sincronizza: va incollata qui, su ogni dispositivo (l’app installata è separata anche da Safari).'}
          </div>
        </div>

        <div className="card surface">
          <div className="h-card" style={{ marginBottom: 10 }}>Questa settimana</div>
          <div style={{ fontSize: 14, color: 'rgba(32,30,29,.65)', lineHeight: 1.55 }}>{summary}</div>

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

          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button
              className="btn-outline" style={{ flex: 1, minHeight: 46 }}
              onClick={generateReport}
              disabled={s.reportLoading}
            >
              {s.reportLoading ? 'Ora sta scrivendo…' : p.weeklyReport ? 'Rigenera il report' : 'Chiedi il report a Ora'}
            </button>
            <button className="btn-outline" style={{ flex: 1, minHeight: 46 }} onClick={exportData}>
              Esporta i dati
            </button>
          </div>
          <div style={{ fontSize: 11.5, color: 'rgba(32,30,29,.45)', lineHeight: 1.45, marginTop: 10 }}>
            Il report legge check-in, movimento e conversazioni. Le tre righe della sera restano fuori: sono solo tue.
          </div>
        </div>

        <div className="fineprint">Ora · v2.1 · i tuoi dati restano su questo dispositivo</div>
      </div>
    </div>
  )
}
