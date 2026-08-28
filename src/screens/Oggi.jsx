import { ArrowRight, PenLine, RotateCw } from 'lucide-react'
import { COURSE, MOVE_SLOTS } from '../data.js'
import { nowCard } from '../nowCard.js'

export default function Oggi({ app }) {
  const { p, setS, day, patchDay, markDone, flash, startSession, kindForCourse, name, logged, todayCheckins, weekResponses, dueLoops, closeLoop } = app
  const card = nowCard({ day, p, logged, todayCheckins, weekResponses })

  const act = () => {
    if (card.act === 'checkin') setS({ screen: 'checkin', core: null, nuance: null, intensity: 3, checkinTag: null })
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
          <h1 className="h-page" style={{ margin: 0 }}>{card.greeting}, {name}</h1>
          {card.opener && <div className="meta" style={{ marginTop: 6, lineHeight: 1.45 }}>{card.opener}</div>}
        </div>
        <button className="avatar-btn" onClick={() => setS({ screen: 'profile' })} aria-label="Il tuo profilo">{name[0]}</button>
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

        <button className="pausa-pill" onClick={() => setS({ screen: 'pausa', pausaStep: 0, pausaT: 0 })}>
          <span className="pausa-dot" />
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--sage-700)' }}>Momento difficile</span>
            <span style={{ display: 'block', fontSize: 12, color: 'rgba(140,73,26,.75)' }}>Novanta secondi, in qualsiasi momento</span>
          </span>
        </button>

        <button className="loop-pill" onClick={() => setS({ screen: 'pensiero' })}>
          <span className="loop-dot"><RotateCw size={16} strokeWidth={2.75} color="var(--sage-700)" /></span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--forest)' }}>Un pensiero che gira</span>
            <span style={{ display: 'block', fontSize: 12, color: 'rgba(61,71,43,.75)' }}>Un minuto per fermarlo, invece di rigirarlo</span>
          </span>
        </button>

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

        <button className="talk-row" onClick={() => setS({ screen: 'coach' })}>
          <span className="coach-avatar" style={{ width: 38, height: 38, fontSize: 15 }}>O</span>
          <span style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
            <span style={{ display: 'block', fontSize: 15, fontWeight: 600 }}>Parla con Ora</span>
            <span style={{ display: 'block', fontSize: 12, color: 'var(--muted)' }}>Quando vuoi, anche solo per raccontare</span>
          </span>
          <ArrowRight size={18} strokeWidth={2.75} color="var(--sage-500)" />
        </button>

        <button className="talk-row" onClick={() => setS({ screen: 'diario' })}>
          <span style={{
            width: 38, height: 38, flex: 'none', borderRadius: 999, background: 'var(--sand)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <PenLine size={17} strokeWidth={2.75} color="var(--sage-700)" />
          </span>
          <span style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
            <span style={{ display: 'block', fontSize: 15, fontWeight: 600 }}>Scrivi nel diario</span>
            <span style={{ display: 'block', fontSize: 12, color: 'var(--muted)' }}>
              {p.seraNotes.length ? 'Un pensiero del giorno, o rileggi le pagine' : 'Un pensiero del giorno, senza doverlo ordinare'}
            </span>
          </span>
          <ArrowRight size={18} strokeWidth={2.75} color="var(--sage-500)" />
        </button>

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
