import { Check, Minus, Plus } from 'lucide-react'
import { PEOPLE, QUESTIONS, CONVO_TONES, TONES } from '../data.js'

export default function LegamiSection({ app }) {
  const { p, s, setS, setP, day, patchDay, markDone, flash, sendText } = app

  const saveConvo = () => {
    if (!s.convoWho || !s.convoTone) { flash('Scegli con chi hai parlato e com’è andata.'); return }
    const unsaid = s.convoUnsaid.trim()
    setP(prev => ({ convoLog: [{ who: s.convoWho, tone: s.convoTone, unsaid, ts: Date.now() }, ...prev.convoLog] }))
    markDone('connect')
    setS({ convoWho: null, convoTone: null, convoUnsaid: '' })
    flash(unsaid
      ? 'Salvata. Quello che hai lasciato non detto è il punto di partenza della prossima volta.'
      : 'Salvata. Anche una conversazione leggera tiene il legame in vita.')
  }

  return (
    <>
      <div className="card sage">
        <div className="kicker" style={{ color: 'rgba(86,99,63,.75)' }}>Intenzione della settimana</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 21, lineHeight: 1.2, margin: '8px 0 6px', color: 'var(--forest)' }}>
          Una conversazione oltre la superficie
        </div>
        <div style={{ fontSize: 14, color: 'rgba(61,71,43,.8)', lineHeight: 1.5 }}>
          Le relazioni profonde non nascono da più parole, ma da una domanda in più e da qualche secondo di silenzio in cui non riempi il vuoto.
        </div>
        <button
          className="listen-toggle"
          style={{ background: day.listened ? 'var(--sage-200)' : 'transparent' }}
          onClick={() => patchDay(cur => ({ listened: !cur.listened, done: { ...cur.done, connect: !cur.listened } }))}
        >
          <span style={{
            width: 24, height: 24, flex: 'none', borderRadius: 999, border: '2px solid var(--sage-500)',
            background: day.listened ? 'var(--sage-500)' : 'transparent', color: 'var(--surface)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {day.listened && <Check size={13} strokeWidth={2.75} />}
          </span>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--forest)' }}>Oggi ho ascoltato più di quanto ho parlato</span>
        </button>
      </div>

      <div className="card surface">
        <div className="h-card" style={{ marginBottom: 4 }}>Le persone</div>
        <div style={{ fontSize: 13, color: 'rgba(32,30,29,.6)', marginBottom: 12 }}>Tocca un nome per un modo di iniziare.</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {PEOPLE.map((person, i) => {
            const open = s.openPerson === i
            return (
              <div
                key={person.name}
                className="person-card"
                style={{ borderColor: open ? 'rgba(122,138,94,.4)' : 'rgba(32,30,29,.12)', background: open ? 'var(--sage-050)' : 'transparent' }}
              >
                <button className="person-head" onClick={() => setS(prev => ({ openPerson: prev.openPerson === i ? null : i }))}>
                  <span className="person-avatar" style={{ background: open ? 'var(--sage-100)' : 'var(--neutral-tint)', color: open ? 'var(--sage-700)' : '#474238' }}>
                    {person.initial}
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: 15, fontWeight: 600 }}>{person.name}</span>
                    <span style={{ display: 'block', fontSize: 12, color: 'var(--muted)' }}>{person.meta}</span>
                  </span>
                  {open ? <Minus size={15} strokeWidth={2.75} color="rgba(32,30,29,.4)" /> : <Plus size={15} strokeWidth={2.75} color="rgba(32,30,29,.4)" />}
                </button>
                {open && (
                  <div style={{ padding: '2px 0 14px' }}>
                    <div className="opener-panel">{person.opener}</div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                      <button
                        style={{ flex: 1, minHeight: 46, border: 0, borderRadius: 999, background: 'var(--sage-500)', color: 'var(--surface)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                        onClick={() => {
                          sendText(`Vorrei parlare con ${person.name} ma non so come iniziare.`)
                          setS({ screen: 'coach' })
                        }}
                      >
                        Provala con Ora
                      </button>
                      <button
                        className="btn-outline" style={{ minHeight: 46 }}
                        onClick={() => { setS({ openPerson: null }); flash('Te lo ricordo domani, senza insistere.') }}
                      >
                        Più tardi
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="card sand">
        <div className="h-card" style={{ marginBottom: 4 }}>Domande che aprono</div>
        <div style={{ fontSize: 13, color: 'rgba(32,30,29,.6)', marginBottom: 14 }}>Una alla volta. Poi si ascolta.</div>
        <div style={{ background: 'var(--surface)', borderRadius: 24, padding: '22px 20px', minHeight: 120, display: 'flex', alignItems: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, lineHeight: 1.3 }}>
            {QUESTIONS[p.qIdx % QUESTIONS.length]}
          </div>
        </div>
        <button className="btn-outline" style={{ width: '100%', minHeight: 48, marginTop: 12 }} onClick={() => setP(prev => ({ qIdx: prev.qIdx + 1 }))}>
          Un’altra
        </button>
      </div>

      <div className="card surface">
        <div className="h-card" style={{ marginBottom: 4 }}>Dopo una conversazione</div>
        <div style={{ fontSize: 13, color: 'rgba(32,30,29,.6)', lineHeight: 1.5, marginBottom: 14 }}>
          Tre risposte brevi. È qui che si impara, non durante.
        </div>
        <div style={{ fontSize: 12, color: 'rgba(32,30,29,.5)', fontWeight: 600, marginBottom: 8 }}>Con chi</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {PEOPLE.map(person => {
            const on = s.convoWho === person.name
            const t = TONES.sage
            return (
              <button
                key={person.name} className="chip"
                style={{ background: on ? t.solid : t.bg, color: on ? 'var(--surface)' : t.fg, borderColor: on ? t.solid : t.border }}
                onClick={() => setS({ convoWho: person.name })}
              >
                {person.name}
              </button>
            )
          })}
        </div>
        <div style={{ fontSize: 12, color: 'rgba(32,30,29,.5)', fontWeight: 600, marginBottom: 8 }}>Com’è andata</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {CONVO_TONES.map(c => {
            const on = s.convoTone === c.label
            const t = TONES[c.tone]
            return (
              <button
                key={c.label} className="chip"
                style={{ background: on ? t.solid : t.bg, color: on ? 'var(--surface)' : t.fg, borderColor: on ? t.solid : t.border }}
                onClick={() => setS({ convoTone: c.label })}
              >
                {c.label}
              </button>
            )
          })}
        </div>
        <div style={{ fontSize: 12, color: 'rgba(32,30,29,.5)', fontWeight: 600, marginBottom: 8 }}>Cosa hai lasciato non detto</div>
        <textarea
          className="textarea"
          value={s.convoUnsaid}
          onChange={e => setS({ convoUnsaid: e.target.value })}
          placeholder="Una riga basta"
        />
        <button className="btn-primary" style={{ marginTop: 12, fontSize: 15 }} onClick={saveConvo}>
          {s.convoWho && s.convoTone ? 'Salva questa conversazione' : 'Scegli con chi e com’è andata'}
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 16 }}>
          {p.convoLog.map((l, i) => (
            <div key={i} className="log-row">
              <span style={{ width: 9, height: 9, flex: 'none', borderRadius: 999, background: l.tone === 'Faticosa' ? 'var(--terra-500)' : 'var(--sage-500)', transform: 'translateY(-1px)' }} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 14, fontWeight: 600 }}>{l.who} · {l.tone.toLowerCase()}</span>
                <span style={{ display: 'block', fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.45 }}>
                  {l.unsaid ? `Non detto: ${l.unsaid}` : 'Niente rimasto in sospeso.'}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
