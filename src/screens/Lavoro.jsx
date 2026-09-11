import { useState } from 'react'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { CORE, HARD, POSITIVE } from '../data.js'
import {
  CARICHI, CARICO_LABEL, CAUSE, ORE, causaLabel,
  giornoDi, momentiDi, settimana, schemi,
} from '../lavoro.js'

const ora = ts => new Date(ts).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })

const tonoDi = umore => (HARD.includes(umore) ? 'duro' : POSITIVE.includes(umore) ? 'buono' : 'medio')

export default function Lavoro({ app }) {
  const { p, setS, segnaGiornata, segnaMomento, togliMomento, name } = app
  const [umore, setUmore] = useState(null)
  const [causa, setCausa] = useState(null)

  const oggi = giornoDi(p.lavoro) || {}
  const momenti = momentiDi(p.lavoro)
  const sett = settimana(p.lavoro)
  const vista = schemi(p)

  const salvaMomento = () => {
    if (!umore) return
    segnaMomento(umore, causa)
    setUmore(null); setCausa(null)
  }

  return (
    <div className="screen">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 48, marginBottom: 8 }}>
        <button className="btn-back" onClick={() => setS({ screen: 'te' })} aria-label="Indietro">
          <ArrowLeft size={18} strokeWidth={2.75} />
        </button>
        <div className="kicker">Il lavoro</div>
      </div>

      <div style={{ padding: '4px 0 16px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 27, lineHeight: 1.12, margin: 0 }}>
          Quanto ci metti, e come ti lascia
        </h1>
        <div className="meta" style={{ marginTop: 7, lineHeight: 1.5 }}>
          Due cose diverse: le ore che ci lasci dentro, e come stai mentre ci sei.
          Segnale separate — così si vede se sono davvero la stessa cosa.
        </div>
      </div>

      <div className="stack">
        {/* --- Come stai adesso, al lavoro --- */}
        <div className="card sage">
          <div className="h-card" style={{ marginBottom: 4 }}>Come stai adesso</div>
          <div style={{ fontSize: 13, color: 'rgba(32,30,29,.6)', lineHeight: 1.5, marginBottom: 12 }}>
            Quante volte vuoi, quando cambia. Con l’ora, così a fine mese si vede l’andamento e non una media.
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {CORE.map(c => {
              const on = umore === c.key
              return (
                <button
                  key={c.key} className="chip"
                  style={{
                    minHeight: 38, padding: '6px 13px', fontSize: 13,
                    background: on ? 'var(--sage-500)' : 'var(--surface)',
                    color: on ? 'var(--surface)' : 'var(--text)',
                    borderColor: on ? 'var(--sage-500)' : 'rgba(32,30,29,.16)',
                  }}
                  onClick={() => setUmore(on ? null : c.key)}
                >
                  {c.key}
                </button>
              )
            })}
          </div>

          {umore && (
            <>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(32,30,29,.5)', marginBottom: 8 }}>
                Per cosa, se lo sai
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                {CAUSE.map(c => {
                  const on = causa === c.k
                  return (
                    <button
                      key={c.k} className="chip"
                      style={{
                        minHeight: 34, padding: '5px 12px', fontSize: 12.5,
                        background: on ? 'var(--sage-700)' : 'transparent',
                        color: on ? 'var(--surface)' : 'var(--text)',
                        borderColor: on ? 'var(--sage-700)' : 'rgba(32,30,29,.16)',
                      }}
                      onClick={() => setCausa(on ? null : c.k)}
                    >
                      {c.label}
                    </button>
                  )
                })}
              </div>
              <button className="btn-primary" style={{ minHeight: 50, fontSize: 15 }} onClick={salvaMomento}>
                Segna questo momento
              </button>
            </>
          )}
        </div>

        {momenti.length > 0 && (
          <div className="card surface">
            <div className="kicker" style={{ color: 'var(--sage-700)', marginBottom: 10 }}>Oggi, al lavoro</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {momenti.map(m => (
                <div key={m.ts} className="log-row">
                  <span className={`pallino ${tonoDi(m.umore)}`} aria-hidden="true" />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: 14.5 }}>
                      {m.umore}{m.causa && m.causa !== 'niente' ? ` · ${causaLabel(m.causa).toLowerCase()}` : ''}
                    </span>
                    <span style={{ display: 'block', fontSize: 11.5, color: 'rgba(32,30,29,.42)', marginTop: 2 }}>
                      {ora(m.ts)}
                    </span>
                  </span>
                  <button className="btn-back" style={{ width: 32, height: 32 }}
                    onClick={() => togliMomento(m.ts)} aria-label="Cancella questo momento">
                    <Trash2 size={13} strokeWidth={2.75} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- La giornata --- */}
        <div className="card surface">
          <div className="h-card" style={{ marginBottom: 4 }}>La giornata di oggi</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 14 }}>
            {oggi.ore != null || oggi.carico
              ? 'Segnata. Puoi correggerla quando vuoi.'
              : 'Segnala a fine giornata, con calma. Non serve essere precisa: a occhio basta.'}
          </div>

          <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(32,30,29,.5)', marginBottom: 8 }}>Quante ore</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {ORE.map(h => {
              const on = oggi.ore === h
              return (
                <button
                  key={h} className="chip"
                  style={{
                    minWidth: 50, justifyContent: 'center',
                    background: on ? 'var(--sage-500)' : 'transparent',
                    color: on ? 'var(--surface)' : 'var(--text)',
                    borderColor: on ? 'var(--sage-500)' : 'rgba(32,30,29,.18)',
                  }}
                  onClick={() => segnaGiornata({ ore: on ? null : h })}
                >
                  {h === 12 ? '12+' : `${h}h`}
                </button>
              )
            })}
          </div>

          <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(32,30,29,.5)', marginBottom: 8 }}>Com’è stata</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
            {CARICHI.map(c => {
              const on = oggi.carico === c.k
              return (
                <button
                  key={c.k} className="chip"
                  style={{
                    minHeight: 40, padding: '6px 16px',
                    background: on ? 'var(--sage-500)' : 'transparent',
                    color: on ? 'var(--surface)' : 'var(--text)',
                    borderColor: on ? 'var(--sage-500)' : 'rgba(32,30,29,.18)',
                  }}
                  onClick={() => segnaGiornata({ carico: on ? null : c.k })}
                >
                  {c.label}
                </button>
              )
            })}
          </div>
          {oggi.carico && (
            <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.45, marginBottom: 16 }}>
              {CARICHI.find(c => c.k === oggi.carico)?.nota}
            </div>
          )}

          <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(32,30,29,.5)', margin: '10px 0 8px' }}>
            A che ora hai staccato
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              className="apikey-input" type="time" style={{ flex: 'none', width: 140, textAlign: 'center' }}
              value={oggi.staccato || ''} onChange={e => segnaGiornata({ staccato: e.target.value || null })}
              aria-label="A che ora hai staccato"
            />
            {oggi.staccato && (
              <button className="step-link" style={{ color: 'rgba(32,30,29,.45)' }}
                onClick={() => segnaGiornata({ staccato: null })}>
                togli
              </button>
            )}
          </div>
          <div className="fineprint" style={{ marginTop: 10, lineHeight: 1.45 }}>
            Non è per fare i conti delle ore: staccare a un’ora e non a un’altra cambia
            la sera che hai, e dopo qualche settimana si vede.
          </div>
        </div>

        {/* --- La settimana --- */}
        {sett.quante > 0 && (
          <div className="card sand">
            <div className="h-card" style={{ marginBottom: 12 }}>Questi sette giorni</div>
            <div className="numeri">
              <div>
                <span className="numero">{sett.oreTot || '—'}</span>
                <span>ore segnate</span>
              </div>
              <div>
                <span className="numero">{sett.quante}</span>
                <span>{sett.quante === 1 ? 'giornata' : 'giornate'}</span>
              </div>
              <div>
                <span className="numero">{sett.troppi}</span>
                <span>{sett.troppi === 1 ? 'sentita troppo' : 'sentite troppo'}</span>
              </div>
              <div>
                <span className="numero" style={{ fontSize: 20 }}>{sett.staccoMedio || '—'}</span>
                <span>stacchi di solito</span>
              </div>
            </div>
          </div>
        )}

        {/* --- Cosa si vede --- */}
        <div className="card surface">
          <div className="h-card" style={{ marginBottom: 10 }}>Quello che si vede</div>
          {vista.mancano ? (
            <div style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.6 }}>{vista.mancano}</div>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, lineHeight: 1.55 }}>
              {vista.righe.map(r => <li key={r}>{r}</li>)}
            </ul>
          )}
        </div>

        <div className="fineprint" style={{ lineHeight: 1.5, padding: '0 8px' }}>
          Niente di questo finisce da qualche parte che non sia tua{name ? `, ${name}` : ''}.
          Non è un cartellino e nessuno lo controlla: serve a te per accorgerti di
          quello che succede prima che diventi normale.
        </div>
      </div>
    </div>
  )
}
