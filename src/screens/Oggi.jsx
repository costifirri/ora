import { PenLine, RotateCw, Sparkle, MessageCircle, LifeBuoy } from 'lucide-react'
import { COURSE, MOVE_SLOTS } from '../data.js'
import { nowCard } from '../nowCard.js'

// Le cinque cose che devono restare a un tocco, sempre. Tutto il resto sta
// nelle altre due schede: qui la home torna a dire una cosa sola.
const SCORCIATOIE = [
  { k: 'come', label: 'Come stai', Icona: Sparkle, vai: ({ apriRuota }) => apriRuota() },
  { k: 'duro', label: 'Momento duro', Icona: LifeBuoy, vai: ({ setS }) => setS({ screen: 'pausa', pausaStep: 0, pausaT: 0 }) },
  { k: 'gira', label: 'Pensiero', Icona: RotateCw, vai: ({ setS }) => setS({ screen: 'pensiero' }) },
  { k: 'ora', label: 'Parla', Icona: MessageCircle, vai: ({ setS }) => setS({ screen: 'coach' }) },
  { k: 'scrivi', label: 'Scrivi', Icona: PenLine, vai: ({ setS }) => setS({ screen: 'diario' }) },
]

const ora = ts => new Date(ts).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })

export default function Oggi({ app }) {
  const { p, setS, day, patchDay, markDone, flash, startSession, kindForCourse, name, logged, todayCheckins, weekResponses, dueLoops, openSteps, closeLoop } = app
  const card = nowCard({ day, p, logged, todayCheckins, weekResponses })

  const apriRuota = () => setS({ screen: 'checkin', core: null, nuance: null, intensity: 3, checkinTag: null })

  const act = () => {
    if (card.act === 'riposo') setS({ screen: 'riposo' })
    else if (card.act === 'course') startSession(kindForCourse(p.courseStep), COURSE[p.courseStep].mins, 'meditate', p.courseStep)
    else if (card.act === 'respiro') startSession('respiro', 3, card.kind === 'step' ? 'scarico' : null)
    else if (card.act === 'letto') startSession('letto', 8, 'letto')
    else if (card.act === 'sera') setS({ screen: 'sera', seraStep: 0, seraT: 0, seraDraft: '' })
    else if (card.act === 'legami') setS({ screen: 'te' })
    else { markDone(card.key); flash('Segnato.') }
  }

  return (
    <div className="screen">
      <header className="home-head">
        <div style={{ minWidth: 0 }}>
          <h1 className="h-page" style={{ margin: 0 }}>{card.greeting}{name ? `, ${name}` : ''}</h1>
          {card.opener && <div className="meta" style={{ marginTop: 6, lineHeight: 1.45 }}>{card.opener}</div>}
        </div>
        <button className="avatar-btn" onClick={() => setS({ screen: 'profile' })} aria-label="Il tuo profilo">{name ? name[0] : 'O'}</button>
      </header>

      <div className="stack">
        <div className="now-card">
          <div className="now-line">{card.line}</div>
          <div className="now-title">{card.title}</div>
          <div className="now-body">{card.body}</div>

          <div style={{ display: 'flex', gap: 10, marginTop: 18, alignItems: 'center' }}>
            <button className="btn-primary" style={{ flex: 1, width: 'auto', minHeight: 54 }} onClick={act}>
              {card.cta}
            </button>
            {card.kind === 'step' && (
              <button
                className="btn-outline"
                style={{ minHeight: 54 }}
                onClick={() => {
                  markDone(card.key)
                  flash(card.key === 'move' ? 'Segnato.' : 'Va bene così. Ti ritrovo al momento dopo.')
                }}
              >
                {card.skipLabel}
              </button>
            )}
          </div>

          {card.canReschedule && (
            <div className="reschedule">
              <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 10 }}>
                {day.moveMoved ? 'Spostala di nuovo, se serve.' : 'Adesso non ci sta? Scegli quando.'}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {MOVE_SLOTS.map(sl => {
                  const on = day.moveWhen === sl.when
                  return (
                    <button
                      key={sl.label}
                      className="slot-chip"
                      style={{
                        background: on ? 'var(--sage-500)' : 'var(--sage-100)',
                        color: on ? 'var(--surface)' : 'var(--sage-700)',
                        borderColor: on ? 'var(--sage-500)' : 'rgba(122,138,94,.4)',
                      }}
                      onClick={() => {
                        patchDay({ moveWhen: sl.when, movePos: sl.pos, moveMoved: true })
                        flash(sl.pos === 7
                          ? 'Spostata a domani mattina. Oggi non ti pesa addosso.'
                          : `Spostata: ${sl.label.toLowerCase()}.`)
                      }}
                    >
                      {sl.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div className="scorciatoie">
          {SCORCIATOIE.map(({ k, label, Icona, vai }) => (
            <button key={k} className="scorciatoia" onClick={() => vai({ setS, apriRuota })}>
              <span className="scorciatoia-tondo"><Icona size={19} strokeWidth={2.6} /></span>
              <span>{label}</span>
            </button>
          ))}
        </div>

        {todayCheckins.length > 0 && (
          <div className="oggi-righe">
            Oggi: {todayCheckins.slice(-3).map(c => `${ora(c.ts)} ${c.word.toLowerCase()}`).join(' · ')}
          </div>
        )}

        {dueLoops.map(l => (
          <div key={l.id} className="card sand">
            <div className="kicker" style={{ color: 'var(--sage-700)', marginBottom: 8 }}>L’avevi messo da parte</div>
            <div style={{ fontSize: 15, lineHeight: 1.55, color: 'rgba(32,30,29,.85)' }}>{l.text}</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5, marginTop: 8 }}>
              È l’ora che avevi scelto. Conta ancora quanto allora?
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button className="btn-primary" style={{ flex: 1, width: 'auto', minHeight: 46, fontSize: 15 }} onClick={() => closeLoop(l.id)}>
                No, lascialo andare
              </button>
              <button className="btn-outline" style={{ minHeight: 46 }} onClick={() => setS({ screen: 'pensiero' })}>
                Sì, riprendiamolo
              </button>
            </div>
          </div>
        ))}

        {openSteps.map(l => (
          <div key={l.id} className="step-open">
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="kicker" style={{ color: 'rgba(86,99,63,.8)', marginBottom: 6 }}>Un passo che ti sei data</div>
              <div style={{ fontSize: 14.5, lineHeight: 1.5, color: 'var(--forest)' }}>{l.action}</div>
              <div style={{ fontSize: 12, color: 'rgba(61,71,43,.65)', lineHeight: 1.45, marginTop: 4 }}>
                per: {l.text.toLowerCase()}
              </div>
            </div>
            <button
              className="btn-outline"
              style={{ minHeight: 42, padding: '0 16px', flex: 'none', borderColor: 'rgba(86,99,63,.4)', color: 'var(--sage-700)' }}
              onClick={() => { closeLoop(l.id); flash('Fatto. Quel giro si è chiuso davvero.') }}
            >
              Fatto
            </button>
          </div>
        ))}

        {(p.daily?.items || []).map(item => (
          <div key={item.kind} className="daily-card">
            <div className="kicker" style={{ color: 'rgba(86,99,63,.8)', marginBottom: 8 }}>
              {item.kind === 'segno' ? (p.profile.segno || 'Il tuo segno') : item.kind === 'fatto' ? 'Lo sapevi' : 'Un pensiero'}
            </div>
            <div className="daily-text">{item.text}</div>
          </div>
        ))}

        {card.later && (
          <div style={{ fontSize: 12.5, color: 'rgba(32,30,29,.42)', textAlign: 'center', padding: '4px 20px', lineHeight: 1.5 }}>
            {card.later}
          </div>
        )}
      </div>
    </div>
  )
}
