import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { QUANDO, quandoTs } from '../data.js'

// Quattro passi, meno di un minuto. Non è un posto dove scrivere: è un bivio
// che porta il giro dall'astratto al concreto e poi lo chiude.
export default function Pensiero({ app }) {
  const { setS, saveLoop, flash } = app
  const [passo, setPasso] = useState(0)
  const [testo, setTesto] = useState('')
  const [azione, setAzione] = useState('')

  const KICKER = ['Passo uno · nominalo', 'Passo due · di che tipo è', 'Passo tre · la prima cosa', 'Passo tre · quando lo riprendi']

  const chiudi = (kind, extra) => {
    saveLoop({ text: testo.trim(), kind, ...extra })
    setS({ screen: 'oggi' })
  }

  return (
    <div className="screen full sandbg">
      <div className="full-head">
        <button className="btn-back" onClick={() => setS({ screen: 'oggi' })} aria-label="Indietro">
          <ArrowLeft size={18} strokeWidth={2.75} />
        </button>
        <div className="kicker">{KICKER[passo]}</div>
        <div style={{ width: 40 }} />
      </div>

      <div className="seg-row">
        {[0, 1, 2].map(i => (
          <span key={i} className="seg" style={{ background: i <= Math.min(passo, 2) ? 'var(--sage-500)' : 'rgba(32,30,29,.16)' }} />
        ))}
      </div>

      {passo === 0 && (
        <>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, lineHeight: 1.15, margin: 0 }}>
            Che pensiero sta girando?
          </h2>
          <div style={{ fontSize: 15, color: 'rgba(32,30,29,.65)', lineHeight: 1.55, marginTop: 10 }}>
            Scrivilo com’è, in una riga. Un pensiero che gira è quasi sempre vago:
            metterlo in parole precise gli toglie metà della forza.
          </div>
          <textarea
            className="textarea"
            style={{ background: 'var(--surface)', minHeight: 110, marginTop: 22 }}
            value={testo}
            placeholder="Continuo a pensare che…"
            aria-label="Il pensiero che gira"
            onChange={e => setTesto(e.target.value)}
            autoFocus
          />
          <div style={{ marginTop: 'auto', paddingTop: 20 }}>
            <button className="btn-primary" style={{ minHeight: 52, fontSize: 16 }} disabled={!testo.trim()} onClick={() => setPasso(1)}>
              Avanti
            </button>
            <div style={{ textAlign: 'center', fontSize: 12, color: 'rgba(32,30,29,.5)', marginTop: 12 }}>
              Meno di un minuto. Non serve scriverlo bene.
            </div>
          </div>
        </>
      )}

      {passo === 1 && (
        <>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, lineHeight: 1.15, margin: 0 }}>
            C’è qualcosa che puoi fare?
          </h2>
          <div style={{ fontSize: 15, color: 'rgba(32,30,29,.65)', lineHeight: 1.55, marginTop: 10 }}>
            È l’unica domanda che conta, e divide in due: se puoi agire è un problema,
            e i problemi si risolvono con un passo. Se non puoi, è una preoccupazione,
            e le preoccupazioni non si risolvono pensandoci di più.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 26 }}>
            {[
              { k: 'problema', t: 'Sì, qualcosa dipende da me', n: 'Anche una cosa piccola, anche non risolutiva' },
              { k: 'preoccupazione', t: 'No, non dipende da me', n: 'O comunque non adesso, non oggi' },
            ].map(o => (
              <button
                key={o.k}
                style={{
                  width: '100%', minHeight: 66, padding: '14px 18px', textAlign: 'left', cursor: 'pointer',
                  border: '1px solid rgba(32,30,29,.18)', borderRadius: 24, background: 'var(--surface)',
                }}
                onClick={() => setPasso(o.k === 'problema' ? 2 : 3)}
              >
                <span style={{ display: 'block', fontSize: 15.5, fontWeight: 600 }}>{o.t}</span>
                <span style={{ display: 'block', fontSize: 12.5, color: 'var(--muted)', marginTop: 3 }}>{o.n}</span>
              </button>
            ))}
          </div>
          <div style={{ marginTop: 'auto', paddingTop: 20, textAlign: 'center', fontSize: 12.5, color: 'rgba(32,30,29,.5)', lineHeight: 1.5 }}>
            Se non riesci a decidere: c’è qualcosa che potresti fare nelle prossime
            ventiquattr’ore che cambierebbe le cose? Se no, è una preoccupazione.
          </div>
        </>
      )}

      {passo === 2 && (
        <>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, lineHeight: 1.15, margin: 0 }}>
            Qual è la prima cosa?
          </h2>
          <div style={{ fontSize: 15, color: 'rgba(32,30,29,.65)', lineHeight: 1.55, marginTop: 10 }}>
            Non la soluzione: il primo passo. Deve essere così piccolo che potresti
            farlo oggi anche stanca — una telefonata, una riga scritta, una domanda.
          </div>
          <textarea
            className="textarea"
            style={{ background: 'var(--surface)', minHeight: 90, marginTop: 22 }}
            value={azione}
            placeholder="La prima cosa che faccio è…"
            aria-label="La prima cosa"
            onChange={e => setAzione(e.target.value)}
            autoFocus
          />
          <div style={{ marginTop: 'auto', paddingTop: 20 }}>
            <button
              className="btn-primary" style={{ minHeight: 52, fontSize: 16 }}
              disabled={!azione.trim()}
              onClick={() => chiudi('problema', { action: azione.trim() })}
            >
              È questo il passo
            </button>
            <div style={{ textAlign: 'center', fontSize: 12, color: 'rgba(32,30,29,.5)', marginTop: 12 }}>
              Da adesso non è più un pensiero che gira: è una cosa da fare.
            </div>
          </div>
        </>
      )}

      {passo === 3 && (
        <>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, lineHeight: 1.15, margin: 0 }}>
            Quando lo riprendi?
          </h2>
          <div style={{ fontSize: 15, color: 'rgba(32,30,29,.65)', lineHeight: 1.55, marginTop: 10 }}>
            Non te lo sto togliendo: gli sto dando un orario. Un pensiero che ha
            un appuntamento smette di chiederti attenzione tutto il giorno —
            e quasi sempre, quando arriva l’ora, pesa meno.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24 }}>
            {QUANDO.map(o => (
              <button
                key={o.k}
                style={{
                  width: '100%', minHeight: 60, padding: '13px 18px', textAlign: 'left', cursor: 'pointer',
                  border: '1px solid rgba(32,30,29,.18)', borderRadius: 24, background: 'var(--surface)',
                }}
                onClick={() => chiudi('preoccupazione', { dueAt: quandoTs(o.k), closedAt: o.k === 'mai' ? Date.now() : null })}
              >
                <span style={{ display: 'block', fontSize: 15, fontWeight: 600 }}>{o.label}</span>
                <span style={{ display: 'block', fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>{o.note}</span>
              </button>
            ))}
          </div>
          <div style={{ marginTop: 'auto', paddingTop: 20, textAlign: 'center', fontSize: 12, color: 'rgba(32,30,29,.5)' }}>
            Se torna prima, va bene: ricordati solo che ha già un posto.
          </div>
        </>
      )}
    </div>
  )
}
