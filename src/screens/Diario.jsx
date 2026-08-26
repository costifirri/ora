import { useState } from 'react'
import { ArrowLeft, Trash2 } from 'lucide-react'

const APERTURE = [
  'Oggi mi ha mossa…',
  'Una cosa che non ho detto a nessuno…',
  'Quello che mi gira in testa adesso…',
  'Se domani ricordassi una cosa di oggi…',
]

const giorno = ts => new Date(ts).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })
const ora = ts => new Date(ts).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })

export default function Diario({ app }) {
  const { p, setS, writeNote, removeNote, name } = app
  const [testo, setTesto] = useState('')
  const [apertura] = useState(() => APERTURE[Math.floor(Math.random() * APERTURE.length)])

  const parole = testo.trim() ? testo.trim().split(/\s+/).length : 0

  // Le pagine, dalla più recente: il diario si rilegge all'indietro.
  const pagine = [...p.seraNotes].sort((a, b) => b.ts - a.ts)
  const perGiorno = pagine.reduce((acc, n) => {
    const k = new Date(n.ts).toDateString()
    ;(acc[k] = acc[k] || []).push(n)
    return acc
  }, {})

  const salva = () => {
    writeNote(testo)
    setTesto('')
  }

  return (
    <div className="screen">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 48, marginBottom: 8 }}>
        <button className="btn-back" onClick={() => setS({ screen: 'oggi' })} aria-label="Indietro">
          <ArrowLeft size={18} strokeWidth={2.75} />
        </button>
        <div className="kicker">Il tuo diario</div>
      </div>

      <div style={{ padding: '4px 0 18px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 27, lineHeight: 1.1, margin: 0 }}>Scrivi</h1>
        <div className="meta" style={{ marginTop: 6, lineHeight: 1.5 }}>
          Quando vuoi, quanto vuoi. Non deve essere ordinato né interessante:
          deve solo uscire dalla testa.
        </div>
      </div>

      <div className="stack">
        <div className="card surface">
          <textarea
            className="textarea"
            style={{ background: 'transparent', border: 0, minHeight: 170, padding: 0, fontSize: 15.5 }}
            value={testo}
            placeholder={apertura}
            aria-label="Scrivi nel diario"
            onChange={e => setTesto(e.target.value)}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderTop: '1px solid rgba(32,30,29,.10)', paddingTop: 14 }}>
            <span style={{ flex: 1, fontSize: 12, color: 'rgba(32,30,29,.45)' }}>
              {parole > 0 ? `${parole} parol${parole === 1 ? 'a' : 'e'}` : 'Anche una riga conta.'}
            </span>
            <button
              className="btn-primary" style={{ width: 'auto', minHeight: 46, padding: '0 24px', fontSize: 15 }}
              onClick={salva}
              disabled={!testo.trim()}
            >
              Salva
            </button>
          </div>
        </div>

        {pagine.length === 0 ? (
          <div style={{ fontSize: 13, color: 'rgba(32,30,29,.45)', textAlign: 'center', lineHeight: 1.55, padding: '8px 20px' }}>
            Non hai ancora scritto niente, {name}. La prima pagina è sempre la più difficile:
            comincia da una riga qualsiasi.
          </div>
        ) : (
          Object.entries(perGiorno).map(([k, note]) => (
            <div key={k} className="card sand">
              <div className="kicker" style={{ color: 'var(--sage-700)', marginBottom: 10 }}>{giorno(note[0].ts)}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {note.map(n => (
                  <div key={n.ts} className="log-row" style={{ alignItems: 'flex-start' }}>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: 15, lineHeight: 1.6, color: 'rgba(32,30,29,.85)', whiteSpace: 'pre-wrap' }}>
                        {n.text}
                      </span>
                      <span style={{ display: 'block', fontSize: 11.5, color: 'rgba(32,30,29,.4)', marginTop: 6 }}>
                        {ora(n.ts)}{n.source === 'sera' ? ' · rituale della sera' : ''}
                      </span>
                    </span>
                    <button
                      className="btn-back" style={{ width: 34, height: 34 }}
                      onClick={() => removeNote(n.ts)} aria-label="Cancella questa pagina"
                    >
                      <Trash2 size={14} strokeWidth={2.75} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}

        <div className="fineprint" style={{ lineHeight: 1.5, padding: '0 8px' }}>
          Quello che scrivi qui resta con te. Ora legge le pagine più recenti per conoscerti meglio,
          e le usa quando ti racconta il mese.
        </div>
      </div>
    </div>
  )
}
