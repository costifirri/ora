import { ArrowLeft } from 'lucide-react'
import { TONES } from '../data.js'

const INTENTS = [
  { label: 'Imparare a meditare', tone: 'sage' },
  { label: 'Fermarmi prima di reagire', tone: 'accent' },
  { label: 'Conoscermi meglio', tone: 'sage' },
  { label: 'Conversazioni più vere', tone: 'accent' },
]

export default function Profilo({ app }) {
  const { p, setS, setP, name, exportData } = app
  const gentle = p.settings.gentle

  return (
    <div className="screen">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 48, marginBottom: 8 }}>
        <button className="btn-back" onClick={() => setS({ screen: 'oggi' })} aria-label="Indietro">
          <ArrowLeft size={18} strokeWidth={2.75} />
        </button>
        <div className="kicker">Il tuo profilo</div>
      </div>

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
          <button
            className="toggle-row" role="switch" aria-checked={gentle}
            onClick={() => setP(prev => ({ settings: { ...prev.settings, gentle: !prev.settings.gentle } }))}
          >
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 15, fontWeight: 600 }}>Modalità senza sensi di colpa</span>
              <span style={{ display: 'block', fontSize: 12, color: 'rgba(32,30,29,.5)', lineHeight: 1.4 }}>
                Nasconde serie, punteggi e conteggi
              </span>
            </span>
            <span className="toggle-track" style={{ background: gentle ? 'var(--sage-500)' : 'rgba(32,30,29,.22)', justifyContent: gentle ? 'flex-end' : 'flex-start' }}>
              <span className="toggle-knob" />
            </span>
          </button>
        </div>

        <div className="card sand">
          <div className="h-card" style={{ marginBottom: 10 }}>La voce di Ora</div>
          <div style={{ fontSize: 13, color: 'rgba(32,30,29,.6)', lineHeight: 1.5, marginBottom: 10 }}>
            Con una chiave API Anthropic, Ora risponde davvero a quello che scrivi e ti legge la settimana.
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
          <div style={{ fontSize: 12, marginTop: 8, color: p.settings.apiKey ? 'var(--sage-700)' : 'rgba(32,30,29,.5)', lineHeight: 1.45 }}>
            {p.settings.apiKey
              ? '✓ Chiave presente su questo dispositivo: Ora risponde davvero.'
              : 'Nessuna chiave su questo dispositivo. La chiave non si sincronizza: va incollata qui, su ogni dispositivo (l’app installata è separata anche da Safari).'}
          </div>
        </div>

        <div className="card surface">
          <div className="h-card" style={{ marginBottom: 10 }}>I tuoi dati</div>
          <div style={{ fontSize: 13, color: 'rgba(32,30,29,.6)', lineHeight: 1.5, marginBottom: 14 }}>
            Tutto quello che registri resta su questo dispositivo. Niente account, niente server.
          </div>
          <button className="btn-outline" style={{ width: '100%', minHeight: 46 }} onClick={exportData}>
            Esporta i dati
          </button>
        </div>

        <div className="fineprint">Ora · v3.1</div>
      </div>
    </div>
  )
}
