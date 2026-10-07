import { useState } from 'react'
import { Check, Dumbbell, UtensilsCrossed, ChevronRight } from 'lucide-react'
import {
  TUTTI, CENE, TIPI, allenamento,
  proposta, piano, settimanaCorpo, chiave,
} from '../corpo.js'

// Il corpo. Non un registro: una cosa che propone.
//
// In cima c'e' sempre una proposta per oggi — un allenamento e una cena — con
// scritto il perche', preso dai dati veri. Sotto, il piano della settimana e
// quello che hai gia' fatto.

const PASTO = [
  { k: 'si', label: 'Come volevo' },
  { k: 'quasi', label: 'Quasi' },
  { k: 'no', label: 'No, e va bene' },
]

export default function Corpo({ app }) {
  const { p, setP, setS, day, patchDay, flash, segnaAllenamento, segnaPasto, segnaPeso } = app
  const [apri, setApri] = useState(null)      // allenamento aperto per intero
  const [sfoglia, setSfoglia] = useState(null) // 'all' | 'cene' | null
  const [kg, setKg] = useState('')

  const pr = proposta(p)
  const sett = settimanaCorpo(p)
  const quanti = p.corpo?.obiettivo ?? 3
  const settimanale = piano(quanti)
  const pastoOggi = (p.corpo?.pasti || {})[chiave()]

  const Scheda = ({ a }) => (
    <div className="card surface">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span className="tondo sage"><Dumbbell size={16} strokeWidth={2.75} color="var(--sage-700)" /></span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: 17 }}>{a.nome}</span>
          <span style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
            {a.min} minuti · {TIPI[a.tipo].label.toLowerCase()} · {a.serve.toLowerCase()}
          </span>
        </span>
      </div>
      <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, lineHeight: 1.5 }}>
        {a.blocchi.map(b => <li key={b}>{b}</li>)}
      </ul>
      <button className="btn-primary" style={{ minHeight: 48, fontSize: 15, marginTop: 14 }}
        onClick={() => {
          if (a.yoga) { setApri(null); setSfoglia(null); setS({ screen: 'yoga', yogaK: a.k }); return }
          segnaAllenamento(a.k); setApri(null); setSfoglia(null)
        }}>
        {a.yoga ? 'Guidami' : 'Fatto, segnalo'}
      </button>
    </div>
  )

  return (
    <div className="screen">
      <div style={{ padding: '4px 0 16px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, lineHeight: 1.1, margin: 0 }}>Corpo</h1>
        <div className="meta" style={{ marginTop: 4, lineHeight: 1.45 }}>
          Quello che ti propongo oggi non è a caso: viene da quanto hai dormito,
          com’è andata al lavoro e da cosa hai fatto ieri.
        </div>
      </div>

      <div className="stack">
        {/* --- La proposta di oggi --- */}
        <div className="card sage">
          <div className="kicker" style={{ color: 'var(--sage-700)', marginBottom: 10 }}>Oggi</div>

          {pr.all ? (
            <>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, lineHeight: 1.2 }}>{pr.all.nome}</div>
              <div style={{ fontSize: 12.5, color: 'rgba(32,30,29,.55)', marginTop: 3 }}>
                {pr.all.min} minuti · {pr.all.serve.toLowerCase()}
              </div>
            </>
          ) : (
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, lineHeight: 1.2 }}>Oggi riposo</div>
          )}
          <div style={{ fontSize: 13.5, color: 'rgba(32,30,29,.72)', lineHeight: 1.55, marginTop: 10 }}>{pr.perche}</div>

          {pr.all && (
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button className="btn-primary" style={{ flex: 1, width: 'auto', minHeight: 48, fontSize: 15 }}
                onClick={() => setApri(pr.all)}>
                Vedi com’è fatto
              </button>
              <button className="btn-outline" style={{ minHeight: 48 }} onClick={() => setSfoglia('all')}>
                Un altro
              </button>
            </div>
          )}

          <div style={{ borderTop: '1px solid rgba(32,30,29,.12)', marginTop: 16, paddingTop: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <UtensilsCrossed size={15} strokeWidth={2.75} color="var(--sage-700)" />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 17 }}>{pr.cena.nome}</span>
            </div>
            <div style={{ fontSize: 13, color: 'rgba(32,30,29,.62)', lineHeight: 1.5 }}>{pr.cena.cosa}</div>
            <div style={{ fontSize: 12.5, color: 'rgba(32,30,29,.5)', marginTop: 4 }}>{pr.cena.min} minuti</div>
            <div style={{ fontSize: 13.5, color: 'rgba(32,30,29,.72)', lineHeight: 1.55, marginTop: 10 }}>{pr.perCena}</div>
            <button className="step-link" style={{ color: 'var(--sage-700)', marginTop: 8 }} onClick={() => setSfoglia('cene')}>
              Un’altra idea →
            </button>
          </div>
        </div>

        {apri && <Scheda a={apri} />}

        {/* --- Com'è andata la cena --- */}
        <div className="card surface">
          <div className="h-card" style={{ marginBottom: 4 }}>La cena di oggi</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 12 }}>
            Non conto niente e non ti do voti: serve solo a vedere, fra un mese, com’è andata nell’insieme.
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {PASTO.map(x => {
              const on = pastoOggi === x.k
              return (
                <button key={x.k} className="chip"
                  style={{
                    minHeight: 40, padding: '6px 15px',
                    background: on ? 'var(--sage-500)' : 'transparent',
                    color: on ? 'var(--surface)' : 'var(--text)',
                    borderColor: on ? 'var(--sage-500)' : 'rgba(32,30,29,.18)',
                  }}
                  onClick={() => segnaPasto(on ? null : x.k)}>
                  {x.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* --- La settimana --- */}
        <div className="sezione">La settimana</div>

        <div className="card sand">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
            <span className="h-card">Il piano</span>
            <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>{quanti} volte a settimana</span>
          </div>
          <div style={{ display: 'flex', gap: 6, margin: '10px 0 14px' }}>
            {[2, 3, 4, 5].map(n => {
              const on = quanti === n
              return (
                <button key={n} className="chip"
                  style={{
                    minWidth: 44, justifyContent: 'center',
                    background: on ? 'var(--sage-500)' : 'transparent',
                    color: on ? 'var(--surface)' : 'var(--text)',
                    borderColor: on ? 'var(--sage-500)' : 'rgba(32,30,29,.18)',
                  }}
                  onClick={() => setP(prev => ({ corpo: { ...(prev.corpo || {}), obiettivo: n } }))}>
                  {n}
                </button>
              )
            })}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {settimanale.map(g => (
              <button key={g.giorno} className="piano-riga"
                onClick={() => g.allenamento && setApri(g.allenamento)}
                style={{ cursor: g.allenamento ? 'pointer' : 'default' }}>
                <span className={`piano-giorno${g.oggi ? ' oggi' : ''}`}>{g.giorno.slice(0, 3)}</span>
                <span style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                  {g.allenamento ? (
                    <>
                      <span style={{ display: 'block', fontSize: 14.5 }}>{g.allenamento.nome}</span>
                      <span style={{ display: 'block', fontSize: 11.5, color: 'rgba(32,30,29,.45)' }}>
                        {g.allenamento.min} minuti
                      </span>
                    </>
                  ) : (
                    <span style={{ fontSize: 14, color: 'rgba(32,30,29,.4)' }}>riposo</span>
                  )}
                </span>
                {g.allenamento && <ChevronRight size={16} strokeWidth={2.75} color="rgba(32,30,29,.3)" />}
              </button>
            ))}
          </div>
          <div className="fineprint" style={{ marginTop: 12, lineHeight: 1.45 }}>
            È una traccia, non un dovere. Se salti un giorno non recuperi niente:
            riprendi da dove sei.
          </div>
        </div>

        <div className="card surface">
          <div className="h-card" style={{ marginBottom: 12 }}>Questi sette giorni</div>
          <div className="numeri">
            <div><span className="numero">{sett.quanti}</span><span>{sett.quanti === 1 ? 'allenamento' : 'allenamenti'}</span></div>
            <div><span className="numero">{sett.minuti}</span><span>minuti in tutto</span></div>
            <div><span className="numero">{sett.pasti ? `${sett.comeVolevo}/${sett.pasti}` : '—'}</span><span>cene come volevi</span></div>
            <div>
              <span className="numero" style={{ fontSize: 22 }}>
                {sett.variazione ? `${sett.variazione.delta >= 0 ? '+' : ''}${sett.variazione.delta.toFixed(1)}` : '—'}
              </span>
              <span>{sett.variazione ? `kg in ${sett.variazione.giorni} giorni` : 'peso non segnato'}</span>
            </div>
          </div>
        </div>

        {/* --- Il peso, in secondo piano --- */}
        <div className="card surface">
          <div className="h-card" style={{ marginBottom: 4 }}>Il peso</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 12 }}>
            Quando vuoi, anche una volta a settimana. Oscilla di un chilo per motivi
            che non c’entrano niente con te: guarda la riga lunga, non il numero di oggi.
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="apikey-input" type="number" inputMode="decimal" step="0.1"
              style={{ flex: 1 }} value={kg} onChange={e => setKg(e.target.value)}
              placeholder="kg" aria-label="Il tuo peso"
            />
            <button className="btn-primary" style={{ width: 'auto', minHeight: 46, padding: '0 22px', fontSize: 15 }}
              disabled={!kg} onClick={() => { segnaPeso(Number(kg)); setKg('') }}>
              Segna
            </button>
          </div>
          {sett.pesi.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 14, fontSize: 12.5, color: 'var(--muted)' }}>
              {sett.pesi.slice(-6).map(x => (
                <span key={x.ts}>
                  {new Date(x.ts).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}: <strong>{x.kg}</strong>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="card surface">
          <div className="h-card" style={{ marginBottom: 4 }}>Sonno e movimento</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 12 }}>
            {day.sleep != null ? `${day.sleep} ore stanotte` : 'Quante ore hai dormito?'}
            {day.moveMin > 0 ? ` · ${day.moveMin} minuti di movimento` : ''}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
            {[4, 5, 6, 7, 8, 9, 10].map(hr => {
              const on = day.sleep === hr
              return (
                <button key={hr} className="chip"
                  style={{
                    minWidth: 46, justifyContent: 'center',
                    background: on ? 'var(--sage-500)' : 'transparent',
                    color: on ? 'var(--surface)' : 'var(--text)',
                    borderColor: on ? 'var(--sage-500)' : 'rgba(32,30,29,.18)',
                  }}
                  onClick={() => patchDay(cur => ({ sleep: cur.sleep === hr ? null : hr }))}>
                  {hr}h
                </button>
              )
            })}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {[10, 20, 30].map(n => (
              <button key={n} className="chip" style={{ background: 'transparent', borderColor: 'rgba(32,30,29,.18)' }}
                onClick={() => patchDay(cur => ({ moveMin: cur.moveMin + n }))}>
                + {n} min
              </button>
            ))}
            {day.moveMin > 0 && (
              <button className="chip" style={{ background: 'transparent', borderColor: 'rgba(32,30,29,.18)' }}
                onClick={() => patchDay({ moveMin: 0 })}>
                Azzera
              </button>
            )}
          </div>
        </div>

        <div className="fineprint" style={{ lineHeight: 1.5, padding: '0 8px' }}>
          Niente calorie e niente conteggi: non sono un dietologo e questa app non
          nasce per farti pesare il cibo. Se hai condizioni di salute o prendi
          farmaci, parlane con chi ti segue prima di cambiare come mangi o ti alleni.
        </div>
      </div>

      {/* --- Sfoglia: altri allenamenti o altre cene --- */}
      {sfoglia && (
        <div className="foglio" role="dialog" onClick={() => setSfoglia(null)}>
          <div className="foglio-carta" onClick={e => e.stopPropagation()}>
            <div className="h-card" style={{ marginBottom: 12 }}>
              {sfoglia === 'all' ? 'Scegli tu' : 'Altre idee per stasera'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {sfoglia === 'all'
                ? TUTTI.map(a => (
                  <button key={a.k} className="specie-row" onClick={() => { setApri(a); setSfoglia(null) }}>
                    <span style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                      <span style={{ display: 'block', fontSize: 15, fontWeight: 600 }}>{a.nome}</span>
                      <span style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                        {a.min} minuti · {TIPI[a.tipo].label.toLowerCase()} · {a.serve.toLowerCase()}
                      </span>
                    </span>
                  </button>
                ))
                : CENE.map(c => (
                  <div key={c.k} className="specie-row" style={{ cursor: 'default' }}>
                    <span style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                      <span style={{ display: 'block', fontSize: 15, fontWeight: 600 }}>{c.nome}</span>
                      <span style={{ display: 'block', fontSize: 12.5, color: 'rgba(32,30,29,.62)', lineHeight: 1.45, marginTop: 2 }}>
                        {c.cosa}
                      </span>
                      <span style={{ display: 'block', fontSize: 11.5, color: 'var(--sage-700)', marginTop: 4 }}>
                        {c.min} minuti{c.tag.length ? ` · ${c.tag.join(' · ')}` : ''}
                      </span>
                    </span>
                  </div>
                ))}
            </div>
            <button className="btn-outline" style={{ minHeight: 48, marginTop: 14 }} onClick={() => setSfoglia(null)}>
              Chiudi
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
