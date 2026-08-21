export default function Corpo({ app }) {
  const { p, day, patchDay } = app
  const sync = p.settings.sync

  const bars = [
    { label: 'Passi', value: '6.480 su 8.000', pct: 81, color: 'var(--sage-500)' },
    { label: 'Minuti di movimento', value: '32 su 30', pct: 100, color: 'var(--sage-500)' },
    { label: 'Sonno', value: '7h 10m su 8h', pct: 89, color: 'var(--terra-500)' },
  ]
  const meals = [
    { name: 'Avena, frutti di bosco, yogurt', note: '8:10 · proteine 22g', tag: 'Equilibrato', tagBg: 'var(--sage-100)', tagFg: 'var(--sage-700)' },
    { name: 'Riso avanzato con verdure', note: '13:20 · verdure 2 porzioni', tag: 'Equilibrato', tagBg: 'var(--sage-100)', tagFg: 'var(--sage-700)' },
    { name: 'Cena non registrata', note: 'Aggiungila in due tocchi', tag: 'Da fare', tagBg: 'var(--neutral-tint)', tagFg: '#474238' },
  ]

  return (
    <div className="screen">
      <div style={{ padding: '4px 0 16px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, lineHeight: 1.1, margin: 0 }}>Corpo</h1>
        <div className="meta" style={{ marginTop: 4 }}>
          {sync ? 'Orologio sincronizzato · il resto lo registri tu' : 'Sincronizzazione spenta · registri tutto tu'}
        </div>
      </div>

      <div className="stack">
        <div className="card surface">
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
            <div className="h-card">Movimento</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>{sync ? 'sincronizzato 12 min fa' : 'manuale'}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {bars.map(b => (
              <div key={b.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                  <span style={{ fontWeight: 600 }}>{b.label}</span>
                  <span style={{ color: 'rgba(32,30,29,.6)' }}>{b.value}</span>
                </div>
                <div className="body-track">
                  <div className="body-fill" style={{ width: `${b.pct}%`, background: b.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card sand">
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

        <div className="card surface">
          <div className="h-card" style={{ marginBottom: 12 }}>Nutrimento</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {meals.map(m => (
              <div key={m.name} className="meal-row">
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 15, fontWeight: 600 }}>{m.name}</span>
                  <span style={{ display: 'block', fontSize: 12, color: 'rgba(32,30,29,.5)' }}>{m.note}</span>
                </span>
                <span className="tag" style={{ background: m.tagBg, color: m.tagFg }}>{m.tag}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 13, color: 'rgba(32,30,29,.6)', lineHeight: 1.5, marginTop: 14 }}>
            Nei giorni in cui pranzi con le verdure, i check-in del pomeriggio tendono alla calma invece che all’agitazione.
            Sei settimane di dati, non un caso.
          </div>
        </div>
      </div>
    </div>
  )
}
