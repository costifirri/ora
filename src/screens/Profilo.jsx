import { TONES } from '../data.js'

const INTENTS = [
  { label: 'Imparare a meditare', tone: 'sage' },
  { label: 'Fermarmi prima di reagire', tone: 'accent' },
  { label: 'Conoscermi meglio', tone: 'sage' },
  { label: 'Conversazioni più vere', tone: 'accent' },
]

const TOGGLES = [
  { k: 'reminders', label: 'Promemoria gentili', note: 'Due al giorno, negli orari in cui rispondi' },
  { k: 'sync', label: 'Sincronizza l’orologio', note: 'Passi, sonno e battito' },
  { k: 'gentle', label: 'Modalità senza sensi di colpa', note: 'Nasconde serie, punteggi e conteggi' },
  { k: 'share', label: 'Condividi il report', note: 'Manda un riassunto alla tua terapeuta' },
]

export default function Profilo({ app }) {
  const { p, setP, gentle, name, flash, exportData, spikes } = app

  const weekSummary = gentle
    ? 'Due picchi forti, entrambi di sera, entrambi dopo una giornata senza pause. Nei giorni con dieci minuti di pratica non ne è arrivato nessuno.'
    : `${p.checkins.length} check-in registrati, ${spikes.length} picchi forti. Nei giorni con pratica, la sera è più calma.`

  return (
    <div className="screen">
      <div style={{ padding: '4px 0 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ width: 64, height: 64, borderRadius: 999, background: 'var(--sage-100)', color: 'var(--sage-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 24, flex: 'none' }}>
          {name[0]}
        </span>
        <span style={{ minWidth: 0 }}>
          <span style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: 24 }}>{name}</span>
          <span style={{ display: 'block', fontSize: 13, color: 'var(--muted)' }}>Percorso calma · sei settimane insieme</span>
        </span>
      </div>

      <div className="stack">
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
            Con una chiave API Anthropic, Ora risponde davvero a quello che scrivi. Senza, usa frasi preparate.
            La chiave resta su questo dispositivo.
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

        <div className="card sand">
          <div className="h-card" style={{ marginBottom: 10 }}>Questa settimana</div>
          <div style={{ fontSize: 14, color: 'rgba(32,30,29,.65)', lineHeight: 1.55 }}>{weekSummary}</div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button className="btn-outline" style={{ flex: 1, minHeight: 46 }} onClick={() => flash(weekSummary)}>
              Report settimanale
            </button>
            <button className="btn-outline" style={{ flex: 1, minHeight: 46 }} onClick={exportData}>
              Esporta i dati
            </button>
          </div>
        </div>

        <div className="fineprint">Ora · v1.2 · i tuoi dati restano su questo dispositivo</div>
      </div>
    </div>
  )
}
