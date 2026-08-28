import { useState } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { HARD, CORE, TONES } from '../data.js'
import { todayKey } from '../storage.js'

const GIORNI = ['L', 'M', 'M', 'G', 'V', 'S', 'D']

// Il colore di una giornata dice come stavi, non quanto hai spuntato:
// una casella chiara non è un fallimento, è un giorno che non hai raccontato.
function toneOfDay(cks) {
  if (!cks.length) return null
  const forte = cks.find(c => c.intensity >= 4 && HARD.includes(c.core))
  if (forte) return 'accent'
  const last = cks[cks.length - 1]
  return CORE.find(c => c.key === last.core)?.tone || 'neutral'
}

export default function Calendario({ app }) {
  const { p, setS, monthName } = app
  const oggi = new Date()
  const [cursore, setCursore] = useState(new Date(oggi.getFullYear(), oggi.getMonth(), 1))
  const [scelto, setScelto] = useState(null)

  const anno = cursore.getFullYear()
  const mese = cursore.getMonth()
  const chiaveMese = `${anno}-${String(mese + 1).padStart(2, '0')}`
  const giorniNelMese = new Date(anno, mese + 1, 0).getDate()
  const primoGiorno = (new Date(anno, mese, 1).getDay() + 6) % 7 // lunedì = 0

  const perGiorno = dk => {
    const cks = p.checkins.filter(c => todayKey(new Date(c.ts)) === dk)
    const note = p.seraNotes.filter(n => todayKey(new Date(n.ts)) === dk)
    const convo = p.convoLog.filter(c => todayKey(new Date(c.ts)) === dk)
    const pause = p.pauseLog.filter(x => todayKey(new Date(x.ts)) === dk)
    const loops = p.loops.filter(l => todayKey(new Date(l.ts)) === dk)
    const d = p.days[dk]
    const fatto = d ? Object.values(d.done).filter(Boolean).length : 0
    return { cks, note, convo, pause, loops, d, fatto, vuoto: !cks.length && !note.length && !convo.length && !pause.length && !loops.length && !fatto }
  }

  const celle = []
  for (let i = 0; i < primoGiorno; i++) celle.push(null)
  for (let g = 1; g <= giorniNelMese; g++) {
    const dk = `${chiaveMese}-${String(g).padStart(2, '0')}`
    celle.push({ g, dk, ...perGiorno(dk) })
  }

  const futuro = new Date(anno, mese + 1, 1) > oggi
  const dett = scelto ? { dk: scelto, ...perGiorno(scelto) } : null
  const dataLunga = dk => {
    const [y, m, d] = dk.split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })
  }

  return (
    <div className="screen">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 48, marginBottom: 8 }}>
        <button className="btn-back" onClick={() => setS({ screen: 'te' })} aria-label="Indietro">
          <ArrowLeft size={18} strokeWidth={2.75} />
        </button>
        <div className="kicker">Le tue giornate</div>
      </div>

      <div className="stack">
        <div className="card surface">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <button
              className="btn-back" style={{ width: 36, height: 36 }}
              onClick={() => { setScelto(null); setCursore(new Date(anno, mese - 1, 1)) }}
              aria-label="Mese precedente"
            >
              <ChevronLeft size={16} strokeWidth={2.75} />
            </button>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 19, textTransform: 'capitalize' }}>
              {monthName(chiaveMese)}
            </div>
            <button
              className="btn-back" style={{ width: 36, height: 36, opacity: futuro ? .3 : 1 }}
              disabled={futuro}
              onClick={() => { setScelto(null); setCursore(new Date(anno, mese + 1, 1)) }}
              aria-label="Mese successivo"
            >
              <ChevronRight size={16} strokeWidth={2.75} />
            </button>
          </div>

          <div className="cal-grid" style={{ marginBottom: 6 }}>
            {GIORNI.map((g, i) => (
              <div key={i} style={{ textAlign: 'center', fontSize: 10.5, fontWeight: 600, color: 'rgba(32,30,29,.4)' }}>{g}</div>
            ))}
          </div>

          <div className="cal-grid">
            {celle.map((c, i) => {
              if (!c) return <div key={`v${i}`} />
              const tono = toneOfDay(c.cks)
              const oggiQ = c.dk === todayKey()
              const attivo = scelto === c.dk
              const avanti = new Date(anno, mese, c.g) > oggi
              return (
                <button
                  key={c.dk}
                  className={`cal-day${attivo ? ' on' : ''}${oggiQ ? ' today' : ''}`}
                  disabled={avanti}
                  style={{
                    background: tono ? TONES[tono].bg : c.vuoto ? 'transparent' : 'var(--neutral-tint)',
                    color: tono ? TONES[tono].fg : 'rgba(32,30,29,.45)',
                    opacity: avanti ? .25 : 1,
                  }}
                  onClick={() => setScelto(attivo ? null : c.dk)}
                >
                  {c.g}
                  {!c.vuoto && <span className="cal-dot" style={{ background: tono ? TONES[tono].solid : 'rgba(32,30,29,.3)' }} />}
                </button>
              )
            })}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 16, fontSize: 11.5, color: 'rgba(32,30,29,.5)' }}>
            <span><span className="cal-key" style={{ background: TONES.sage.bg }} /> giornata calma</span>
            <span><span className="cal-key" style={{ background: TONES.accent.bg }} /> è arrivato un picco</span>
            <span><span className="cal-key" style={{ background: 'var(--neutral-tint)' }} /> qualcosa di registrato</span>
          </div>
        </div>

        {dett && (
          <div className="card sand">
            <div className="kicker" style={{ color: 'var(--sage-700)', marginBottom: 8 }}>{dataLunga(dett.dk)}</div>
            {dett.vuoto ? (
              <div style={{ fontSize: 14, color: 'rgba(32,30,29,.6)', lineHeight: 1.55 }}>
                Quel giorno non hai registrato niente. Non vuol dire che non sia successo niente:
                vuol dire solo che non passa da qui.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {dett.cks.length > 0 && (
                  <div>
                    <div className="giorno-et">Come stavi</div>
                    <div style={{ fontSize: 14.5, lineHeight: 1.5 }}>
                      {dett.cks.map(c => c.word.toLowerCase() + (c.intensity >= 4 ? ' (forte)' : '')).join(', ')}
                    </div>
                  </div>
                )}
                {dett.pause.length > 0 && (
                  <div>
                    <div className="giorno-et">Nel Momento difficile hai scelto</div>
                    <div style={{ fontSize: 14.5, lineHeight: 1.5 }}>{dett.pause.map(x => x.choice).join('; ')}</div>
                  </div>
                )}
                {dett.loops.length > 0 && (
                  <div>
                    <div className="giorno-et">Un pensiero che girava</div>
                    {dett.loops.map(l => (
                      <div key={l.id} style={{ fontSize: 14.5, lineHeight: 1.5, marginBottom: 6 }}>
                        {l.text}
                        <span style={{ display: 'block', fontSize: 12.5, color: 'rgba(32,30,29,.55)', marginTop: 2 }}>
                          {l.action ? `primo passo: ${l.action}` : l.dueAt ? 'messo da parte' : 'lasciato andare'}
                          {l.closedAt ? ' · chiuso' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {dett.d && (dett.d.moveMin > 0 || dett.d.sleep != null || dett.d.water > 0) && (
                  <div>
                    <div className="giorno-et">Il corpo</div>
                    <div style={{ fontSize: 14.5, lineHeight: 1.5 }}>
                      {[
                        dett.d.moveMin > 0 && `${dett.d.moveMin} minuti di movimento`,
                        dett.d.sleep != null && `${dett.d.sleep} ore di sonno`,
                        dett.d.water > 0 && `${dett.d.water} bicchieri`,
                      ].filter(Boolean).join(' · ')}
                    </div>
                  </div>
                )}
                {dett.convo.length > 0 && (
                  <div>
                    <div className="giorno-et">Hai parlato con</div>
                    <div style={{ fontSize: 14.5, lineHeight: 1.5 }}>
                      {dett.convo.map(c => `${c.who} (${c.tone.toLowerCase()})`).join(', ')}
                    </div>
                  </div>
                )}
                {dett.note.length > 0 && (
                  <div>
                    <div className="giorno-et">Dal diario</div>
                    {dett.note.map((n, i) => (
                      <div key={i} style={{ fontSize: 14.5, lineHeight: 1.55, color: 'rgba(32,30,29,.8)', whiteSpace: 'pre-wrap' }}>{n.text}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {!dett && (
          <div style={{ fontSize: 12.5, color: 'rgba(32,30,29,.45)', textAlign: 'center', lineHeight: 1.5, padding: '0 16px' }}>
            Tocca un giorno per rivederlo. Le caselle vuote non sono giorni persi:
            sono solo giorni che non hai raccontato.
          </div>
        )}
      </div>
    </div>
  )
}
