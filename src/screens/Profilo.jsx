import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { TONES } from '../data.js'
import { deleteAccount } from '../cloud.js'
import { authError } from '../firebase.js'
import { MODELS, DEFAULT_MODEL } from '../ai.js'

const INTENTS = [
  { label: 'Imparare a meditare', tone: 'sage' },
  { label: 'Fermarmi prima di reagire', tone: 'accent' },
  { label: 'Conoscermi meglio', tone: 'sage' },
  { label: 'Conversazioni più vere', tone: 'accent' },
]

export default function Profilo({ app }) {
  const { p, setS, setP, name, exportData, user, hasAccounts, leave, flash, resetAll } = app
  const gentle = p.settings.gentle
  const [killing, setKilling] = useState(false)
  const [wiping, setWiping] = useState(false)
  const [pw, setPw] = useState('')

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
          <div style={{ fontSize: 13, color: 'rgba(32,30,29,.6)', lineHeight: 1.5, marginBottom: 14 }}>
            Con una chiave tua, Ora risponde davvero a quello che scrivi, ti legge la settimana e ti
            suggerisce come aprire una conversazione. Senza, usa frasi preparate: l’app funziona lo stesso.
          </div>

          <ol className="howto">
            <li>
              Apri <a href="https://platform.claude.com/settings/keys" target="_blank" rel="noopener noreferrer">platform.claude.com</a> e accedi
              (o registrati: è un account per sviluppatori, diverso dall’abbonamento a Claude).
            </li>
            <li>In <strong>Billing</strong> carica un piccolo credito: si paga a consumo, il minimo è circa 5 $ e dura a lungo.</li>
            <li>In <strong>API Keys</strong> tocca <strong>Create Key</strong>, dalle un nome e copiala subito: viene mostrata una volta sola.</li>
            <li>Incollala qui sotto. Resta su questo dispositivo e non viene mandata a nessun altro.</li>
          </ol>

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

          {p.settings.apiKey && (
            <div style={{ marginTop: 18, borderTop: '1px solid rgba(32,30,29,.12)', paddingTop: 16 }}>
              <div style={{ fontSize: 12, color: 'rgba(32,30,29,.5)', fontWeight: 600, marginBottom: 10 }}>
                Quanto spendere per ogni risposta
              </div>
              <div className="lens-row" style={{ background: 'rgba(32,30,29,.06)' }}>
                {MODELS.map(m => {
                  const on = (p.settings.model || DEFAULT_MODEL) === m.id
                  return (
                    <button
                      key={m.id}
                      className={`lens-btn${on ? ' on' : ''}`}
                      onClick={() => setP(prev => ({ settings: { ...prev.settings, model: m.id } }))}
                    >
                      {m.label}
                    </button>
                  )
                })}
              </div>
              <div style={{ fontSize: 12.5, color: 'rgba(32,30,29,.6)', lineHeight: 1.5, marginTop: 10 }}>
                {MODELS.find(m => m.id === (p.settings.model || DEFAULT_MODEL))?.note}
              </div>
            </div>
          )}
        </div>

        <div className="card surface">
          <div className="h-card" style={{ marginBottom: 10 }}>I tuoi dati</div>
          <div style={{ fontSize: 13, color: 'rgba(32,30,29,.6)', lineHeight: 1.5, marginBottom: 14 }}>
            {user
              ? <>Il tuo spazio è legato a <strong>{user.email}</strong>: quello che registri ti segue su qualsiasi telefono, e nessun altro account può leggerlo. La chiave di Ora fa eccezione — resta solo qui.</>
              : 'Tutto quello che registri resta su questo dispositivo. Niente account, niente server.'}
          </div>
          <button className="btn-outline" style={{ width: '100%', minHeight: 46 }} onClick={exportData}>
            Esporta i dati
          </button>

          {!wiping ? (
            <button
              className="step-link" style={{ color: 'rgba(32,30,29,.45)', marginTop: 10 }}
              onClick={() => setWiping(true)}
            >
              Ricomincia da zero
            </button>
          ) : (
            <div style={{ marginTop: 14, background: 'var(--sand)', borderRadius: 24, padding: '16px 18px' }}>
              <div style={{ fontSize: 13, lineHeight: 1.55, color: 'rgba(32,30,29,.7)', marginBottom: 12 }}>
                Cancella check-in, righe della sera, conversazioni, ricordi e racconti dei mesi.
                Restano la chiave, il modello e il tuo nome. Se vuoi tenerne una copia, esporta prima.
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-outline" style={{ flex: 1, minHeight: 46 }} onClick={() => setWiping(false)}>
                  Lascia stare
                </button>
                <button
                  className="btn-primary" style={{ flex: 1, width: 'auto', minHeight: 46, fontSize: 15 }}
                  onClick={() => { setWiping(false); resetAll() }}
                >
                  Ricomincia
                </button>
              </div>
            </div>
          )}

          {user && (
            <>
              <button className="btn-outline" style={{ width: '100%', minHeight: 46, marginTop: 10 }} onClick={leave}>
                Esci dal mio spazio
              </button>

              {!killing ? (
                <button
                  className="step-link"
                  style={{ color: 'rgba(32,30,29,.45)', marginTop: 10 }}
                  onClick={() => setKilling(true)}
                >
                  Elimina il mio spazio e tutti i dati
                </button>
              ) : (
                <div style={{ marginTop: 14, background: 'var(--terra-100)', border: '1px solid rgba(198,113,57,.4)', borderRadius: 24, padding: '16px 18px' }}>
                  <div style={{ fontSize: 13, lineHeight: 1.55, color: '#8c491a', marginBottom: 12 }}>
                    Sparisce tutto: check-in, note della sera, conversazioni. Non è recuperabile.
                    Se vuoi tenerne una copia, esporta i dati prima. Scrivi la password per confermare.
                  </div>
                  <input
                    className="apikey-input" type="password" value={pw}
                    onChange={e => setPw(e.target.value)} placeholder="La tua password" aria-label="Password"
                  />
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <button
                      className="btn-outline" style={{ flex: 1, minHeight: 46 }}
                      onClick={() => { setKilling(false); setPw('') }}
                    >
                      Lascia stare
                    </button>
                    <button
                      style={{ flex: 1, minHeight: 46, border: 0, borderRadius: 999, background: 'var(--terra-600)', color: 'var(--surface)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                      onClick={() => {
                        deleteAccount(pw)
                          .then(() => { setPw(''); setKilling(false) })
                          .catch(err => flash(authError(err.code)))
                      }}
                    >
                      Elimina
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {!user && hasAccounts && (
            <div style={{ fontSize: 12, color: 'rgba(32,30,29,.45)', marginTop: 10, lineHeight: 1.45 }}>
              Non sei collegata a nessuno spazio.
            </div>
          )}
        </div>

        <div className="fineprint">Ora · v5.3</div>
      </div>
    </div>
  )
}
