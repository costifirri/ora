import { useState } from 'react'
import { ArrowLeft, Check, Target, Plus, Minus } from 'lucide-react'
import {
  OBIETTIVI, TIPI, OSTACOLI, settimana, lettura, fattiSettimana,
  ostacoliRicorrenti, lunedi,
} from '../coach.js'

// L'obiettivo, e la revisione settimanale.
//
// Tre schermate in una, perche' sono tre momenti della stessa cosa: scegliere
// cosa conta, guardare come e' andata, decidere l'unica cosa da cambiare.

const data = ts => new Date(ts).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })

export default function Obiettivo({ app }) {
  const { p, setS, name, scegliObiettivo, cambiaBersaglio, chiudiSessione, liveAI, coachRisposta } = app
  const [modo, setModo] = useState(p.coach?.obiettivo ? 'vista' : 'scegli')
  const [passo, setPasso] = useState(0)
  const [ostacolo, setOstacolo] = useState(null)
  const [testo, setTesto] = useState('')
  const [risposta, setRisposta] = useState(null)
  const [attesa, setAttesa] = useState(false)

  const ob = p.coach?.obiettivo
  const sett = settimana(p)
  const ric = ostacoliRicorrenti(p)
  const mancati = sett.impegni.filter(i => !i.centrato)

  // --- Scegliere l'obiettivo ---
  if (modo === 'scegli') {
    return (
      <div className="screen">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 48, marginBottom: 8 }}>
          <button className="btn-back" onClick={() => setS({ screen: 'te' })} aria-label="Indietro">
            <ArrowLeft size={18} strokeWidth={2.75} />
          </button>
          <div className="kicker">Il tuo obiettivo</div>
        </div>

        <div style={{ padding: '4px 0 18px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 27, lineHeight: 1.12, margin: 0 }}>
            Cosa stai cercando di cambiare?
          </h1>
          <div className="meta" style={{ marginTop: 8, lineHeight: 1.55 }}>
            Scegline uno solo. Due obiettivi insieme vogliono dire nessun obiettivo,
            e lo sappiamo tutte.
          </div>
        </div>

        <div className="stack">
          {OBIETTIVI.map(o => (
            <button key={o.k} className="card surface" style={{ textAlign: 'left', border: 0, cursor: 'pointer' }}
              onClick={() => { scegliObiettivo(o); setModo('vista') }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 19 }}>{o.titolo}</div>
              <div style={{ fontSize: 13.5, color: 'rgba(32,30,29,.65)', lineHeight: 1.5, marginTop: 6 }}>{o.perche}</div>
              <div style={{ fontSize: 12.5, color: 'var(--sage-700)', lineHeight: 1.45, marginTop: 10 }}>
                {o.impegni.map(k => TIPI[k].label).join(' · ')}
              </div>
              <div style={{ fontSize: 12.5, color: 'rgba(32,30,29,.5)', lineHeight: 1.45, marginTop: 8, fontStyle: 'italic' }}>
                {o.nota}
              </div>
            </button>
          ))}

          <div className="fineprint" style={{ lineHeight: 1.5, padding: '0 8px' }}>
            Gli impegni sono comportamenti, non risultati: «tre allenamenti» dipende
            da te, «meno due chili» no. Darsi obiettivi che non dipendono da te è il
            modo più rapido per sentirsi fallite mentre si sta facendo tutto giusto.
          </div>
        </div>
      </div>
    )
  }

  // --- La revisione guidata ---
  if (modo === 'sessione') {
    return (
      <div className="screen">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 48, marginBottom: 8 }}>
          <button className="btn-back" onClick={() => setModo('vista')} aria-label="Indietro">
            <ArrowLeft size={18} strokeWidth={2.75} />
          </button>
          <div className="kicker">La settimana · passo {passo + 1} di 3</div>
        </div>

        {passo === 0 && (
          <>
            <div style={{ padding: '4px 0 18px' }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, lineHeight: 1.15, margin: 0 }}>
                Com’è andata, nei fatti
              </h1>
              <div className="meta" style={{ marginTop: 8, lineHeight: 1.5 }}>
                Dal {data(sett.inizio)}. Questi sono i numeri, non un giudizio.
              </div>
            </div>
            <div className="stack">
              {sett.impegni.map(i => (
                <div key={i.k} className="card surface">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className={`tondo ${i.centrato ? 'sage' : 'sand'}`}>
                      {i.centrato ? <Check size={16} strokeWidth={3} color="var(--sage-700)" /> : <Target size={15} strokeWidth={2.75} color="rgba(32,30,29,.45)" />}
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: 15, fontWeight: 600 }}>{i.label}</span>
                      <span style={{ display: 'block', fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>
                        {i.fatto} su {i.bersaglio} {i.unita}
                      </span>
                    </span>
                  </div>
                </div>
              ))}
              <button className="btn-primary" style={{ minHeight: 52, fontSize: 16 }} onClick={() => setPasso(1)}>
                {mancati.length ? 'Cosa si è messo in mezzo' : 'Avanti'}
              </button>
            </div>
          </>
        )}

        {passo === 1 && (
          <>
            <div style={{ padding: '4px 0 18px' }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, lineHeight: 1.15, margin: 0 }}>
                {mancati.length ? 'Cosa si è messo in mezzo?' : 'Cosa ha funzionato?'}
              </h1>
              <div className="meta" style={{ marginTop: 8, lineHeight: 1.5 }}>
                {mancati.length
                  ? 'Non «perché non ce l’hai fatta»: cosa c’era, concretamente. L’ostacolo è un’informazione, la colpa no.'
                  : 'Hai centrato tutto. Vale la pena capire cosa l’ha reso possibile, per poterlo rifare.'}
              </div>
            </div>
            <div className="stack">
              {mancati.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {OSTACOLI.map(o => {
                    const on = ostacolo === o.k
                    return (
                      <button key={o.k} className="chip"
                        style={{
                          minHeight: 38, padding: '6px 14px', fontSize: 13,
                          background: on ? 'var(--sage-500)' : 'transparent',
                          color: on ? 'var(--surface)' : 'var(--text)',
                          borderColor: on ? 'var(--sage-500)' : 'rgba(32,30,29,.18)',
                        }}
                        onClick={() => setOstacolo(on ? null : o.k)}>
                        {o.label}
                      </button>
                    )
                  })}
                </div>
              )}
              <textarea
                className="textarea" style={{ minHeight: 110 }}
                value={testo} onChange={e => setTesto(e.target.value)}
                placeholder={mancati.length ? 'Se vuoi, raccontamelo a parole tue…' : 'Cosa ti ha aiutata?'}
                aria-label="La tua risposta"
              />
              <button
                className="btn-primary" style={{ minHeight: 52, fontSize: 16 }} disabled={attesa}
                onClick={async () => {
                  setAttesa(true)
                  const r = await coachRisposta(ostacolo, testo)
                  setRisposta(r); setAttesa(false); setPasso(2)
                }}>
                {attesa ? 'Ora sta guardando…' : 'Vediamo cosa ne esce'}
              </button>
              <button className="step-link" style={{ color: 'rgba(32,30,29,.5)' }} onClick={() => setModo('vista')}>
                Non adesso
              </button>
            </div>
          </>
        )}

        {passo === 2 && (
          <>
            <div style={{ padding: '4px 0 18px' }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, lineHeight: 1.15, margin: 0 }}>
                Quello che si vede
              </h1>
            </div>
            <div className="stack">
              <div className="card sage" style={{ fontSize: 15, lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
                {risposta}
              </div>
              {!liveAI && (
                <div className="fineprint" style={{ lineHeight: 1.5 }}>
                  Questa l’ho messa insieme io dai tuoi numeri, senza chiave API: è onesta,
                  ma non è una risposta a quello che hai scritto. Con la chiave, Ora legge
                  anche le tue parole.
                </div>
              )}

              {mancati.length > 0 && (
                <div className="card surface">
                  <div className="h-card" style={{ marginBottom: 4 }}>Vuoi abbassare qualcosa?</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 12 }}>
                    Un impegno che non centri mai non è ambizioso: è rotto. Meglio uno più
                    basso e vero che uno alto e finto.
                  </div>
                  {mancati.map(i => (
                    <div key={i.k} className="log-row">
                      <span style={{ flex: 1, minWidth: 0, fontSize: 14.5 }}>{i.label}</span>
                      <button className="btn-back" style={{ width: 34, height: 34 }}
                        onClick={() => cambiaBersaglio(i.k, Math.max(1, i.bersaglio - 1))} aria-label="Abbassa">
                        <Minus size={14} strokeWidth={2.75} />
                      </button>
                      <span style={{ minWidth: 20, textAlign: 'center', fontWeight: 600 }}>{i.bersaglio}</span>
                      <button className="btn-back" style={{ width: 34, height: 34 }}
                        onClick={() => cambiaBersaglio(i.k, Math.min(7, i.bersaglio + 1))} aria-label="Alza">
                        <Plus size={14} strokeWidth={2.75} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button className="btn-primary" style={{ minHeight: 52, fontSize: 16 }}
                onClick={() => { chiudiSessione(ostacolo, testo, risposta); setModo('vista'); setPasso(0); setTesto(''); setOstacolo(null) }}>
                Chiudi la settimana
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  // --- La vista normale ---
  return (
    <div className="screen">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 48, marginBottom: 8 }}>
        <button className="btn-back" onClick={() => setS({ screen: 'te' })} aria-label="Indietro">
          <ArrowLeft size={18} strokeWidth={2.75} />
        </button>
        <div className="kicker">Il tuo obiettivo</div>
      </div>

      <div style={{ padding: '4px 0 16px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 27, lineHeight: 1.12, margin: 0 }}>{ob.testo}</h1>
        {ob.perche && (
          <div className="meta" style={{ marginTop: 8, lineHeight: 1.55 }}>{ob.perche}</div>
        )}
      </div>

      <div className="stack">
        <div className="card sand">
          <div className="h-card" style={{ marginBottom: 4 }}>Questa settimana</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 14 }}>
            Dal {data(sett.inizio)} · {sett.giorniPassati} {sett.giorniPassati === 1 ? 'giorno' : 'giorni'} passati su 7
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sett.impegni.map(i => (
              <div key={i.k}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
                  <span style={{ flex: 1, minWidth: 0, fontSize: 14.5 }}>{i.label}</span>
                  <span style={{ fontSize: 13, color: i.centrato ? 'var(--sage-700)' : 'var(--muted)', fontWeight: 600 }}>
                    {i.fatto}/{i.bersaglio}
                  </span>
                </div>
                <div className="crescita-barra">
                  <span style={{ width: `${Math.min(100, (i.fatto / i.bersaglio) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <button className="btn-primary" style={{ minHeight: 54, fontSize: 16 }} onClick={() => { setPasso(0); setModo('sessione') }}>
          Guardiamo la settimana
        </button>

        {ric && (
          <div className="card surface">
            <div className="kicker" style={{ color: 'var(--sage-700)', marginBottom: 8 }}>Quello che torna</div>
            <div style={{ fontSize: 14, lineHeight: 1.6 }}>
              L’ostacolo che hai nominato più spesso è «{ric.label.toLowerCase()}»: {ric.n} volte.
              Se torna ancora, non è una questione di volontà — è il punto su cui conviene
              cambiare qualcosa nella settimana.
            </div>
          </div>
        )}

        {(p.coach?.sessioni || []).length > 0 && (
          <div className="card surface">
            <div className="h-card" style={{ marginBottom: 10 }}>Le settimane passate</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[...p.coach.sessioni].reverse().slice(0, 4).map(s => (
                <div key={s.ts}>
                  <div style={{ fontSize: 12, color: 'rgba(32,30,29,.45)' }}>
                    settimana del {data(s.settimana)}
                  </div>
                  <div style={{ fontSize: 13.5, lineHeight: 1.55, color: 'rgba(32,30,29,.75)', marginTop: 3 }}>
                    {s.nota || '—'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button className="step-link" style={{ color: 'rgba(32,30,29,.45)' }} onClick={() => setModo('scegli')}>
          Cambia obiettivo
        </button>

        <div className="fineprint" style={{ lineHeight: 1.5, padding: '0 8px' }}>
          Gli impegni si contano da soli: allenamenti, cene, sonno e orari li prende
          da quello che segni nel resto dell’app{name ? `, ${name}` : ''}. Non devi
          spuntare niente due volte.
        </div>
      </div>
    </div>
  )
}
