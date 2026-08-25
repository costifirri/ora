import { ArrowLeft, Trash2 } from 'lucide-react'

// I campi di "Chi sei": pochi, stabili, e sempre nelle mani tue.
const CAMPI = [
  { k: 'lavoro', label: 'Di cosa ti occupi', placeholder: 'Lavoro, studio, come sono fatte le tue giornate' },
  { k: 'ritmi', label: 'I tuoi ritmi', placeholder: 'A che ora ti svegli, come dormi di solito, quando sei al meglio' },
  { k: 'pesa', label: 'Cosa ti pesa, di solito', placeholder: 'Le situazioni che ti mettono in difficoltà più spesso' },
  { k: 'bene', label: 'Cosa ti fa bene', placeholder: 'Quello che sai già che ti rimette in asse' },
  { k: 'voce', label: 'Come vuoi che ti parli', placeholder: 'Diretta, dolce, poche parole, con più domande…' },
]

const fmt = ts => new Date(ts).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })

export default function Memoria({ app }) {
  const { p, s, setS, setP, name, pendingMonth, monthName, writeChapter, liveAI } = app

  const setField = (k, v) => setP(prev => ({ profile: { ...prev.profile, [k]: v } }))
  const forget = id => setP(prev => ({ memories: prev.memories.filter(m => m.id !== id) }))
  const dropChapter = month => setP(prev => ({ chapters: prev.chapters.filter(c => c.month !== month) }))

  return (
    <div className="screen">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 48, marginBottom: 8 }}>
        <button className="btn-back" onClick={() => setS({ screen: 'te' })} aria-label="Indietro">
          <ArrowLeft size={18} strokeWidth={2.75} />
        </button>
        <div className="kicker">La mia memoria</div>
      </div>

      <div style={{ padding: '4px 0 18px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 27, lineHeight: 1.1, margin: 0 }}>Cosa so di te</h1>
        <div className="meta" style={{ marginTop: 6, lineHeight: 1.5 }}>
          Tutto quello che ricordo è scritto qui. Puoi correggerlo o cancellarlo quando vuoi:
          non tengo niente che tu non possa vedere.
        </div>
      </div>

      <div className="stack">
        <div className="card sage">
          <div className="kicker" style={{ color: 'rgba(86,99,63,.75)' }}>Chi sei</div>
          <div style={{ fontSize: 13.5, color: 'rgba(61,71,43,.8)', lineHeight: 1.5, margin: '8px 0 14px' }}>
            Le poche cose che non cambiano di settimana in settimana. Bastano due righe per campo:
            servono a non farmi ripartire da zero ogni volta.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {CAMPI.map(c => (
              <div key={c.k}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--forest)', marginBottom: 6 }}>{c.label}</div>
                <textarea
                  className="textarea"
                  style={{ background: 'var(--surface)', minHeight: 60 }}
                  value={p.profile[c.k]}
                  placeholder={c.placeholder}
                  aria-label={c.label}
                  onChange={e => setField(c.k, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="card surface">
          <div className="h-card" style={{ marginBottom: 4 }}>Cose che mi hai detto</div>
          <div style={{ fontSize: 13, color: 'rgba(32,30,29,.6)', lineHeight: 1.5, marginBottom: 12 }}>
            {p.memories.length
              ? 'Le raccolgo dalle nostre chiacchierate, solo quando sembrano durature. Se una non ti somiglia più, toglila.'
              : 'Ancora niente. Le raccoglierò parlando: quando mi racconti qualcosa che vale anche domani, me la segno qui.'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {p.memories.map(m => (
              <div key={m.id} className="log-row" style={{ alignItems: 'center' }}>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 14, lineHeight: 1.5 }}>{m.text}</span>
                  <span style={{ display: 'block', fontSize: 11.5, color: 'rgba(32,30,29,.45)', marginTop: 2 }}>{fmt(m.ts)}</span>
                </span>
                <button
                  className="btn-back" style={{ width: 34, height: 34 }}
                  onClick={() => forget(m.id)} aria-label="Dimentica"
                >
                  <Trash2 size={14} strokeWidth={2.75} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="card sand">
          <div className="h-card" style={{ marginBottom: 4 }}>Il racconto dei mesi</div>
          <div style={{ fontSize: 13, color: 'rgba(32,30,29,.6)', lineHeight: 1.5, marginBottom: 14 }}>
            A mese finito rileggo quello che è successo e te lo racconto in poche righe.
            Poi resta questo, non i dati: è la tua storia, non il tuo archivio.
          </div>

          {pendingMonth && (
            <button
              className="btn-primary" style={{ minHeight: 50, marginBottom: 14 }}
              onClick={() => writeChapter(pendingMonth)}
              disabled={s.chapterLoading}
            >
              {s.chapterLoading ? 'Sto rileggendo…' : `Raccontami ${monthName(pendingMonth)}`}
            </button>
          )}
          {!pendingMonth && p.chapters.length === 0 && (
            <div style={{ fontSize: 12.5, color: 'rgba(32,30,29,.5)', lineHeight: 1.5 }}>
              Il primo racconto arriva quando questo mese sarà finito.
            </div>
          )}
          {!liveAI && pendingMonth && (
            <div style={{ fontSize: 11.5, color: 'rgba(32,30,29,.45)', lineHeight: 1.45, marginTop: -6, marginBottom: 12 }}>
              Serve la chiave, nel tuo profilo.
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[...p.chapters].reverse().map(c => (
              <div key={c.month} style={{ background: 'var(--surface)', borderRadius: 24, padding: '16px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
                  <div className="kicker" style={{ color: 'var(--sage-700)' }}>{monthName(c.month)}</div>
                  <button
                    className="step-link" style={{ color: 'rgba(32,30,29,.4)', fontSize: 12 }}
                    onClick={() => dropChapter(c.month)}
                  >
                    Cancella
                  </button>
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(32,30,29,.8)', whiteSpace: 'pre-wrap' }}>{c.text}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="fineprint" style={{ lineHeight: 1.5, padding: '0 8px' }}>
          {name}, quello che leggi qui è tutto quello che so.
          Le tue righe della sera le leggo anch’io, per capirti meglio: le trovi in Te.
        </div>
      </div>
    </div>
  )
}
