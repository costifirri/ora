import { useEffect, useRef } from 'react'
import { ArrowUp } from 'lucide-react'

const PROMPTS = [
  'Mi sono arrabbiata, aiutami a capire',
  'Come inizio una conversazione vera?',
  'La mente scappa quando medito',
  'Guardiamo la mia giornata',
]

export default function Coach({ app }) {
  const { p, s, setS, sendText, liveAI } = app
  const scrollRef = useRef(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [p.messages.length, s.typing])

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div className="coach-head">
        <span className="coach-avatar">O</span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: 18 }}>Ora</span>
          <span style={{ display: 'block', fontSize: 12, color: 'var(--muted)' }}>
            {s.typing ? 'sta scrivendo…' : liveAI ? 'Compagna AI · conosce la tua giornata, non i tuoi contatti' : 'Compagna AI · risposte offline'}
          </span>
        </span>
      </div>

      <div className="chat-scroll" ref={scrollRef}>
        {p.messages.map((m, i) => (
          <div key={i} className={`bubble ${m.from === 'me' ? 'me' : 'ora'}`}>{m.text}</div>
        ))}
        {s.typing && (
          <div className="typing-bubble" aria-label="Ora sta scrivendo">
            <span /><span /><span />
          </div>
        )}
        {!liveAI && (
          <div className="offline-note">
            Adesso Ora è offline: risponde con frasi preparate. Con una chiave API (in Tu), capisce qualsiasi cosa scrivi.
          </div>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
          {PROMPTS.map(prompt => (
            <button key={prompt} className="prompt-chip" onClick={() => sendText(prompt)}>{prompt}</button>
          ))}
        </div>
      </div>

      <div className="composer">
        <input
          value={s.draft}
          onChange={e => setS({ draft: e.target.value })}
          onKeyDown={e => { if (e.key === 'Enter') sendText(s.draft) }}
          placeholder="Racconta a Ora come va"
          aria-label="Messaggio per Ora"
        />
        <button className="send-btn" onClick={() => sendText(s.draft)} aria-label="Invia">
          <ArrowUp size={18} strokeWidth={2.75} />
        </button>
      </div>
    </div>
  )
}
