

const LEVEL_COLORS = ['#e1eecc', '#ffe1d0', '#f6a06b', '#c67139']
const volte = (n, of) => `${n} volt${n === 1 ? 'a' : 'e'} su ${of}`
const fmtDay = ts => new Date(ts).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })

export default function SchemiSection({ app }) {
  const { setS, restorers, p, weekResponses, logged } = app
  const recentNotes = p.seraNotes.slice(-7).reverse()

  return (
    <>
      <div className="card surface">
        <div className="h-card" style={{ marginBottom: 4 }}>Come stai</div>
        <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 14 }}>
          {logged
            ? `L’ultima volta hai detto: ${logged.word.toLowerCase()}.`
            : 'Oggi non hai ancora dato un nome a come stai.'}
        </div>
        <button
          className="btn-primary" style={{ minHeight: 48, fontSize: 15 }}
          onClick={() => setS({ screen: 'checkin', core: null, nuance: null, intensity: 3, checkinTag: null })}
        >
          {logged ? 'Fai un altro check-in' : 'Apri la ruota delle emozioni'}
        </button>
      </div>

      <div className="card sage">
        <div className="h-card" style={{ marginBottom: 4, color: 'var(--forest)' }}>Cosa ti rimette insieme</div>
        <div style={{ fontSize: 13, color: 'rgba(61,71,43,.8)', lineHeight: 1.5, marginBottom: 14 }}>
          {restorers.example
            ? 'Un esempio, per ora. Quando registri una giornata buona, il tocco su “cosa te l’ha data” rende anche questa lista tua.'
            : 'Dai tuoi check-in buoni: non quello che dovrebbe farti bene, quello che te lo ha fatto davvero.'}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: restorers.example ? 10 : 16 }}>
          {restorers.list.map(t => (
            <div key={t.label}>
              {restorers.example ? (
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                  <span style={{ width: 8, height: 8, flex: 'none', borderRadius: 999, background: 'var(--sage-500)', transform: 'translateY(-2px)' }} />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: 14.5, fontWeight: 600, color: 'var(--forest)' }}>{t.label}</span>
                    <span style={{ display: 'block', fontSize: 12.5, color: 'rgba(61,71,43,.85)', lineHeight: 1.45 }}>{t.note}</span>
                  </span>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 14, marginBottom: 6, color: 'var(--forest)' }}>
                    <span style={{ fontWeight: 600 }}>{t.label}</span>
                    <span style={{ color: 'rgba(61,71,43,.7)', whiteSpace: 'nowrap' }}>{volte(t.n, t.of)}</span>
                  </div>
                  <div className="trigger-track" style={{ background: 'rgba(61,71,43,.12)' }}>
                    <div className="trigger-fill" style={{ width: `${Math.round(100 * t.n / t.of)}%`, background: 'var(--sage-500)' }} />
                  </div>
                  <div style={{ fontSize: 12.5, color: 'rgba(61,71,43,.8)', lineHeight: 1.45 }}>{t.note}</div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="card surface">
        <div className="h-card" style={{ marginBottom: 10 }}>Quello che stai imparando</div>
        <div style={{ fontSize: 14, color: 'rgba(32,30,29,.65)', lineHeight: 1.55 }}>
          {weekResponses.length > 0
            ? `Questa settimana, ${weekResponses.length === 1 ? 'una volta' : weekResponses.length + ' volte'} sei arrivata al bordo della reazione e hai scelto una risposta: ${[...new Set(weekResponses.map(x => x.choice.toLowerCase()))].join(', ')}. Non è trattenersi: è scegliere. È esattamente il muscolo che stai allenando.`
            : 'Non sei una persona nervosa: sei una persona che arriva alla sera senza aver messo una pausa da nessuna parte. Ogni volta che userai il Momento difficile, la risposta che scegli verrà contata qui.'}
        </div>
      </div>

      {recentNotes.length > 0 && (
        <div className="card surface">
          <div className="h-card" style={{ marginBottom: 4 }}>Dal diario</div>
          <div style={{ fontSize: 13, color: 'rgba(32,30,29,.6)', lineHeight: 1.5, marginBottom: 10 }}>
            Le ultime pagine, rilette a distanza. Le più recenti le legge anche Ora, per conoscerti meglio.
          </div>
          <button
            className="btn-outline" style={{ width: '100%', minHeight: 46, marginBottom: 12 }}
            onClick={() => setS({ screen: 'diario' })}
          >
            Apri il diario
          </button>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {recentNotes.map((n, i) => (
              <div key={i} style={{ padding: '12px 0', borderTop: '1px solid rgba(32,30,29,.10)' }}>
                <div style={{ fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase', fontWeight: 600, color: 'rgba(32,30,29,.45)', marginBottom: 4 }}>
                  {fmtDay(n.ts)}
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.5, color: 'rgba(32,30,29,.75)', whiteSpace: 'pre-wrap' }}>{n.text}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
