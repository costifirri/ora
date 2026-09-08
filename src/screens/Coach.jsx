import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowUp, ArrowDown, ChevronUp } from 'lucide-react'

const PROMPTS = [
  'Mi sono arrabbiata, aiutami a capire',
  'Come inizio una conversazione vera?',
  'La mente scappa quando medito',
  'Guardiamo la mia giornata',
]

const stessoGiorno = (a, b) => new Date(a).toDateString() === new Date(b).toDateString()

const giornoLabel = ts => {
  const d = new Date(ts)
  const oggi = new Date()
  if (stessoGiorno(d, oggi)) return 'Oggi'
  const ieri = new Date(oggi)
  ieri.setDate(oggi.getDate() - 1)
  if (stessoGiorno(d, ieri)) return 'Ieri'
  return d.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })
}

export default function Coach({ app }) {
  const { p, s, setS, sendText, liveAI, harvestMemories } = app
  const scrollRef = useRef(null)
  const taRef = useRef(null)

  // Se stai leggendo indietro non ti riporto in fondo di forza: aspetto,
  // e ti dico che è arrivato qualcosa.
  const [inFondo, setInFondo] = useState(true)
  const [inCima, setInCima] = useState(true)
  const [nuovi, setNuovi] = useState(0)

  const misura = () => {
    const el = scrollRef.current
    if (!el) return
    const fondo = el.scrollHeight - el.scrollTop - el.clientHeight < 90
    setInFondo(fondo)
    setInCima(el.scrollTop < 40)
    if (fondo) setNuovi(0)
  }

  // Un'animazione lunga e' sgradevole e puo' anche non arrivare in fondo (scheda
  // in secondo piano, animazioni ridotte per scelta di sistema). Quindi: passo
  // dolce solo per gli spostamenti brevi, salto secco per i lunghi, e in ogni
  // caso mi assicuro di essere arrivata davvero.
  const scorriA = (top, forzaSecco = false) => {
    const el = scrollRef.current
    if (!el) return
    const lontano = Math.abs(top - el.scrollTop) > el.clientHeight * 2
    const ridotte = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const behavior = forzaSecco || lontano || ridotte ? 'auto' : 'smooth'
    el.scrollTo({ top, behavior })
    if (behavior === 'smooth') {
      // Rete di sicurezza: se l'animazione non e' arrivata, ci arrivo io.
      setTimeout(() => {
        const e2 = scrollRef.current
        if (e2 && Math.abs(top - e2.scrollTop) > 4) e2.scrollTop = top
      }, 600)
    }
  }

  const vaiInFondo = (secco = false) => {
    const el = scrollRef.current
    if (!el) return
    scorriA(el.scrollHeight, secco)
    setNuovi(0)
  }

  const vaiInCima = () => scorriA(0)

  // Al primo ingresso parto dal fondo, senza animazione.
  useLayoutEffect(() => { vaiInFondo(true); misura() }, [])

  useEffect(() => {
    if (inFondo) vaiInFondo()
    else setNuovi(n => n + 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.messages.length])

  useEffect(() => { if (inFondo && s.typing) vaiInFondo() }, [s.typing, inFondo])

  // Il campo cresce con quello che scrivi, fino a un massimo.
  const cresci = () => {
    const el = taRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.max(46, Math.min(el.scrollHeight + 2, 130)) + 'px'
  }

  useLayoutEffect(cresci, [s.draft])

  // Alla prima apertura i caratteri possono non essere ancora arrivati: se
  // misuro adesso e basta, il campo nasce alto il triplo del dovuto.
  useEffect(() => {
    const f = requestAnimationFrame(cresci)
    document.fonts?.ready.then(cresci).catch(() => {})
    return () => cancelAnimationFrame(f)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const invia = () => {
    sendText(s.draft)
    setInFondo(true)
    requestAnimationFrame(() => vaiInFondo())
  }

  const tasto = e => {
    // Invio manda, maiuscolo+invio va a capo: si può scrivere più di una riga.
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      invia()
    }
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative' }}>
      <div className="coach-head">
        <button className="btn-back" onClick={() => { harvestMemories(); setS({ screen: 'oggi' }) }} aria-label="Indietro">
          <ArrowLeft size={18} strokeWidth={2.75} />
        </button>
        <span className="coach-avatar">O</span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: 18 }}>Ora</span>
          <span style={{ display: 'block', fontSize: 12, color: 'var(--muted)' }}>
            {s.typing ? 'sta scrivendo…' : liveAI ? 'Compagna AI · conosce la tua giornata, non i tuoi contatti' : 'Compagna AI · risposte offline'}
          </span>
        </span>
        {!inCima && (
          <button className="btn-back" onClick={vaiInCima} aria-label="Vai all’inizio della conversazione" title="All’inizio">
            <ChevronUp size={18} strokeWidth={2.75} />
          </button>
        )}
      </div>

      <div className="chat-area">
      <div className="chat-scroll" ref={scrollRef} onScroll={misura}>
        {p.messages.length > 1 && (
          <div className="chat-inizio">L’inizio della vostra conversazione</div>
        )}

        {p.messages.map((m, i) => {
          const prima = p.messages[i - 1]
          const nuovoGiorno = m.ts && (!prima?.ts || !stessoGiorno(prima.ts, m.ts))
          return (
            <div key={i} style={{ display: 'contents' }}>
              {nuovoGiorno && <div className="chat-giorno"><span>{giornoLabel(m.ts)}</span></div>}
              <div className={`bubble ${m.from === 'me' ? 'me' : 'ora'}`}>{m.text}</div>
            </div>
          )
        })}

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
        {liveAI && s.aiError && (
          <div className="offline-note">
            Ora non ha potuto rispondere davvero ({s.aiError}): questa è una frase preparata.
          </div>
        )}
      </div>

      {!inFondo && (
        <button className="giu-btn" onClick={() => vaiInFondo()} aria-label="Torna in fondo">
          <ArrowDown size={16} strokeWidth={2.75} />
          {nuovi > 0 && <span>{nuovi === 1 ? 'un messaggio nuovo' : `${nuovi} messaggi nuovi`}</span>}
        </button>
      )}
      </div>

      <div className="prompt-row">
        {PROMPTS.map(prompt => (
          <button key={prompt} className="prompt-chip" onClick={() => { sendText(prompt); setInFondo(true) }}>{prompt}</button>
        ))}
      </div>

      <div className="composer">
        <textarea
          ref={taRef}
          rows={1}
          value={s.draft}
          onChange={e => setS({ draft: e.target.value })}
          onKeyDown={tasto}
          placeholder="Racconta a Ora come va"
          aria-label="Messaggio per Ora"
        />
        <button className="send-btn" onClick={invia} aria-label="Invia" disabled={!s.draft.trim()}>
          <ArrowUp size={18} strokeWidth={2.75} />
        </button>
      </div>
    </div>
  )
}
