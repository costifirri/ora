import { ArrowRight, CalendarDays, PenLine, Briefcase, Target } from 'lucide-react'
import { giornoDi } from '../lavoro.js'
import { settimana as settCoach } from '../coach.js'
import SchemiSection from '../sections/SchemiSection.jsx'
import LegamiSection from '../sections/LegamiSection.jsx'

// Te: tre blocchi, in quest'ordine.
//
// 1. Dove stai andando — l'obiettivo, perche' e' quello che tiene insieme il
//    resto e va visto per primo, non cercato in mezzo a una lista.
// 2. Il tuo racconto — le porte su quello che hai scritto e vissuto.
// 3. Quello che noto — le letture, che sono le uniche cose qui dentro che non
//    hai scritto tu.
//
// La lente "Corpo" non c'e' piu': faceva le stesse cose della scheda Corpo.

const INTENTION_EXAMPLES = [
  'Se sento salire la rabbia dopo le 21, allora apro il Momento difficile prima di rispondere.',
  'Se esco di casa in ritardo, allora faccio tre espiri lunghi prima di partire.',
  'Se il telefono mi porta via la sera, allora lo lascio in un’altra stanza dopo cena.',
  'Se qualcosa mi dà fastidio, allora lo dico in una frase invece di tacere.',
]

const fmtDate = ts => new Date(ts).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })

const Riga = ({ Icona, tondo = 'sand', titolo, sotto, onClick }) => (
  <button className="talk-row" onClick={onClick}>
    <span className={`tondo ${tondo}`}><Icona size={17} strokeWidth={2.75} color="var(--sage-700)" /></span>
    <span style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
      <span style={{ display: 'block', fontSize: 15, fontWeight: 600 }}>{titolo}</span>
      <span style={{ display: 'block', fontSize: 12, color: 'var(--muted)' }}>{sotto}</span>
    </span>
    <ArrowRight size={18} strokeWidth={2.75} color="var(--sage-500)" />
  </button>
)

export default function Te({ app }) {
  const { p, s, setS, setP, generateReport, localWeekSummary, liveAI, pendingMonth, monthName, writeChapter } = app
  const oggiLavoro = giornoDi(p.lavoro)
  const ob = p.coach?.obiettivo
  const sett = ob ? settCoach(p) : null

  return (
    <div className="screen">
      <div style={{ padding: '4px 0 16px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, lineHeight: 1.1, margin: 0 }}>Te</h1>
        <div className="meta" style={{ marginTop: 4 }}>Dove stai andando, e quello che noto lungo la strada</div>
      </div>

      <div className="stack">
        {/* --- 1. L'obiettivo, in cima --- */}
        {ob ? (
          <button className="card sage" style={{ textAlign: 'left', border: 0, width: '100%', cursor: 'pointer' }}
            onClick={() => setS({ screen: 'obiettivo' })}>
            <div className="kicker" style={{ color: 'var(--sage-700)', marginBottom: 8 }}>Il tuo obiettivo</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, lineHeight: 1.2 }}>{ob.testo}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
              {sett.impegni.map(i => (
                <div key={i.k}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 5 }}>
                    <span style={{ flex: 1, minWidth: 0, fontSize: 13.5 }}>{i.label}</span>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: i.centrato ? 'var(--sage-700)' : 'rgba(32,30,29,.5)' }}>
                      {i.fatto}/{i.bersaglio}
                    </span>
                  </div>
                  <div className="crescita-barra">
                    <span style={{ width: `${Math.min(100, (i.fatto / i.bersaglio) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </button>
        ) : (
          <Riga Icona={Target} tondo="sage" titolo="Darti un obiettivo"
            sotto="Uno solo, tradotto in cose che dipendono da te"
            onClick={() => setS({ screen: 'obiettivo' })} />
        )}

        {/* --- 2. Il tuo racconto --- */}
        <div className="sezione">Il tuo racconto</div>

        <Riga Icona={PenLine} titolo="Il tuo diario"
          sotto={p.seraNotes.length ? `${p.seraNotes.length} ${p.seraNotes.length === 1 ? 'pagina' : 'pagine'}` : 'Ancora nessuna pagina'}
          onClick={() => setS({ screen: 'diario' })} />

        <Riga Icona={CalendarDays} titolo="Le tue giornate"
          sotto="Rivedi un giorno qualsiasi, com’è andato davvero"
          onClick={() => setS({ screen: 'calendario' })} />

        <Riga Icona={Briefcase} titolo="Il lavoro"
          sotto={oggiLavoro ? 'Oggi l’hai segnata' : 'Quanto ci metti, e come ti lascia'}
          onClick={() => setS({ screen: 'lavoro' })} />

        <button className="talk-row" onClick={() => setS({ screen: 'memoria' })}>
          <span className="coach-avatar" style={{ width: 38, height: 38, fontSize: 15 }}>O</span>
          <span style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
            <span style={{ display: 'block', fontSize: 15, fontWeight: 600 }}>Cosa so di te</span>
            <span style={{ display: 'block', fontSize: 12, color: 'var(--muted)' }}>
              {p.profile.lavoro || p.memories.length
                ? `${p.memories.length ? p.memories.length + ' cose che mi hai detto' : 'La tua scheda'}${p.chapters.length ? ` · ${p.chapters.length} mes${p.chapters.length === 1 ? 'e' : 'i'} raccontat${p.chapters.length === 1 ? 'o' : 'i'}` : ''}`
                : 'Raccontami chi sei, così ti parlo davvero'}
            </span>
          </span>
          <ArrowRight size={18} strokeWidth={2.75} color="var(--sage-500)" />
        </button>

        {pendingMonth && (
          <div className="card sage">
            <div className="kicker" style={{ color: 'rgba(86,99,63,.75)' }}>Un mese è finito</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, lineHeight: 1.2, margin: '8px 0 6px', color: 'var(--forest)' }}>
              Vuoi che ti racconti {monthName(pendingMonth)}?
            </div>
            <div style={{ fontSize: 13.5, color: 'rgba(61,71,43,.8)', lineHeight: 1.5, marginBottom: 12 }}>
              Rileggo quello che è successo e ne tengo poche righe. Fra sei mesi saranno l’unica cosa
              che ti resta di questo periodo.
            </div>
            <button className="btn-primary" style={{ minHeight: 48 }} onClick={() => writeChapter(pendingMonth)} disabled={s.chapterLoading}>
              {s.chapterLoading ? 'Sto rileggendo…' : 'Raccontamelo'}
            </button>
          </div>
        )}

        {/* --- 3. Quello che noto --- */}
        <div className="sezione">Quello che noto</div>

        <div className="card sand">
          <div className="h-card" style={{ marginBottom: 10 }}>Questa settimana</div>
          <div style={{ fontSize: 14, color: 'rgba(32,30,29,.7)', lineHeight: 1.55 }}>{localWeekSummary()}</div>

          {p.weeklyReport && (
            <div style={{ marginTop: 14, background: 'var(--sage-050)', borderRadius: 24, padding: '16px 18px' }}>
              <div className="kicker" style={{ color: 'rgba(86,99,63,.8)', marginBottom: 8 }}>
                Ora, il {fmtDate(p.weeklyReport.ts)}
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(32,30,29,.8)', whiteSpace: 'pre-wrap' }}>
                {p.weeklyReport.text}
              </div>
            </div>
          )}

          <button className="btn-outline" style={{ width: '100%', minHeight: 48, marginTop: 14 }}
            onClick={generateReport} disabled={s.reportLoading}>
            {s.reportLoading ? 'Ora sta scrivendo…' : p.weeklyReport ? 'Chiedi a Ora di rileggerla' : 'Chiedi a Ora di leggere la settimana'}
          </button>
          {!liveAI && (
            <div style={{ fontSize: 11.5, color: 'rgba(32,30,29,.45)', lineHeight: 1.45, marginTop: 8 }}>
              Per il report scritto da Ora serve la chiave API, nel tuo profilo.
            </div>
          )}
        </div>

        <SchemiSection app={app} />

        <LegamiSection app={app} />

        <div className="card sage">
          <div className="kicker" style={{ color: 'rgba(86,99,63,.75)' }}>La tua regola</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, lineHeight: 1.2, margin: '8px 0 6px', color: 'var(--forest)' }}>
            Se succede questo, allora faccio quello
          </div>
          <div style={{ fontSize: 13.5, color: 'rgba(61,71,43,.8)', lineHeight: 1.5, marginBottom: 12 }}>
            Una sola regola, scritta prima che serva. Decidere a freddo è più facile che decidere nel momento.
          </div>
          <textarea
            className="textarea" style={{ background: 'var(--surface)', minHeight: 72 }}
            value={p.intention} placeholder="Se… allora…"
            onChange={e => setP({ intention: e.target.value })}
            aria-label="La tua regola della settimana"
          />
          {!p.intention && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
              {INTENTION_EXAMPLES.map(ex => (
                <button key={ex}
                  style={{
                    textAlign: 'left', border: '1px solid rgba(86,99,63,.35)', borderRadius: 18,
                    background: 'transparent', padding: '10px 14px', fontSize: 12.5, lineHeight: 1.45,
                    color: 'var(--forest)', cursor: 'pointer', minHeight: 44,
                  }}
                  onClick={() => setP({ intention: ex })}>
                  {ex}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
