import { ArrowLeft } from 'lucide-react'
import { SERA_Q } from '../data.js'

const KICKERS = ['Passo uno · respiro', 'Passo due · tre righe', 'Passo tre · domani']
const TITLES = ['Due minuti di respiro.', 'Tre righe, non di più.', 'Una domanda per domani.']
const BODIES = [
  'Chiudi la giornata dal corpo, non dalla testa. Segui il cerchio: se la mente scappa, va bene, torna.',
  'Non un diario: solo quello che ti ha mossa oggi. Serve a te di domani, non a nessun altro.',
  'Portala con te fino a domani senza rispondere adesso. Le risposte migliori arrivano dopo il sonno.',
]
const CTAS = ['Ho respirato', 'Ho scritto', 'La porto a domani']
const FOOTERS = ['Circa due minuti · espiro lungo', 'Nessun obbligo di scrivere', 'Sei minuti in tutto']

export default function Sera({ app }) {
  const { p, s, setS, setP, markDone, flash, breath } = app
  const b = breath(s.seraT)
  const words = s.seraDraft.trim() ? s.seraDraft.trim().split(/\s+/).length : 0

  const next = () => {
    if (s.seraStep < 2) { setS(prev => ({ seraStep: prev.seraStep + 1 })); return }
    if (s.seraDraft.trim()) setP(prev => ({ seraNotes: [...prev.seraNotes, { text: s.seraDraft.trim(), ts: Date.now() }] }))
    markDone('sera')
    setS({ screen: 'oggi', seraDraft: '' })
    flash('Serata chiusa. Domani ti ritrovi la domanda in cima a Oggi.')
  }

  return (
    <div className="screen full dark">
      <div className="full-head">
        <button className="btn-back" onClick={() => setS({ screen: 'oggi' })} aria-label="Indietro">
          <ArrowLeft size={18} strokeWidth={2.75} />
        </button>
        <div className="kicker">{KICKERS[s.seraStep]}</div>
        <div style={{ width: 40 }} />
      </div>

      <div className="seg-row">
        {[0, 1, 2].map(i => (
          <span key={i} className="seg" style={{ background: i <= s.seraStep ? 'var(--sage-200)' : 'rgba(249,244,237,.2)' }} />
        ))}
      </div>

      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, lineHeight: 1.15, margin: 0 }}>{TITLES[s.seraStep]}</h2>
      <div style={{ fontSize: 14.5, color: 'rgba(249,244,237,.65)', lineHeight: 1.55, marginTop: 10 }}>{BODIES[s.seraStep]}</div>

      {s.seraStep === 0 && (
        <div className="breath-wrap" style={{ margin: '30px 0' }}>
          <div
            className="breath-circle"
            style={{
              width: 220, height: 220,
              background: 'radial-gradient(circle at 50% 40%, #8fa073, #56633f)',
              transform: `scale(${b.scale.toFixed(3)})`,
            }}
          >
            <div className="breath-word">{b.word}</div>
          </div>
          <div className="breath-status" style={{ color: 'rgba(249,244,237,.55)' }}>
            {b.word} · {Math.max(0, 120 - Math.floor(s.seraT))}s rimasti
          </div>
        </div>
      )}

      {s.seraStep === 1 && (
        <div style={{ flex: 1, marginTop: 22, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10 }}>
          <textarea
            value={s.seraDraft}
            onChange={e => setS({ seraDraft: e.target.value })}
            placeholder="Oggi mi ha mossa…"
            style={{
              width: '100%', minHeight: 150, padding: 16, borderRadius: 24,
              border: '1px solid rgba(249,244,237,.22)', background: 'rgba(249,244,237,.08)',
              color: 'var(--surface)', fontSize: 15, lineHeight: 1.55, resize: 'none',
            }}
          />
          <div style={{ fontSize: 12, color: 'rgba(249,244,237,.45)' }}>
            {words > 0 ? `${words} parole · nessuno le leggerà` : 'Anche una riga sola conta.'}
          </div>
        </div>
      )}

      {s.seraStep === 2 && (
        <>
          <div style={{ marginTop: 'auto', background: 'rgba(249,244,237,.08)', borderRadius: 26, padding: '24px 20px', minHeight: 150, display: 'flex', alignItems: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 21, lineHeight: 1.3 }}>
              {SERA_Q[p.seraQIdx % SERA_Q.length]}
            </div>
          </div>
          <button
            style={{ alignSelf: 'flex-start', marginTop: 12, minHeight: 44, padding: '10px 0', border: 0, background: 'transparent', color: 'var(--sage-200)', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--sage-100)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--sage-200)')}
            onClick={() => setP(prev => ({ seraQIdx: prev.seraQIdx + 1 }))}
          >
            Un’altra domanda
          </button>
        </>
      )}

      <div style={{ marginTop: 'auto', paddingTop: 20 }}>
        <button className="btn-sera" onClick={next}>{CTAS[s.seraStep]}</button>
        <div style={{ textAlign: 'center', fontSize: 12, color: 'rgba(249,244,237,.45)', marginTop: 12 }}>{FOOTERS[s.seraStep]}</div>
      </div>
    </div>
  )
}
