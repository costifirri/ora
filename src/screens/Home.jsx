import { Check } from 'lucide-react'
import { COURSE, MOVE_SLOTS } from '../data.js'

export default function Home({ app }) {
  const { p, s, setS, day, patchDay, markDone, flash, orderedFlow, startSession, kindForCourse, gentle, name } = app
  const ord = orderedFlow()
  const doneCount = ord.filter(x => day.done[x.k]).length
  const curIdx = ord.findIndex(x => !day.done[x.k])
  const flowNow = curIdx === -1
    ? 'Giornata chiusa. Buonanotte.'
    : `Se ti va: ${(ord[curIdx].k === 'move' ? day.moveWhen : ord[curIdx].when).toLowerCase()} · nessun orario, apri quello che ti serve`

  const act = x => {
    if (x.act === 'checkin') setS({ screen: 'checkin', core: null, nuance: null, intensity: 3 })
    else if (x.act === 'course') startSession(kindForCourse(p.courseStep), COURSE[p.courseStep].mins, 'meditate', p.courseStep)
    else if (x.act === 'respiro') startSession('respiro', 3, 'scarico')
    else if (x.act === 'letto') startSession('letto', 8, 'letto')
    else if (x.act === 'sera') setS({ screen: 'sera', seraStep: 0, seraT: 0, seraDraft: '' })
    else if (x.act === 'legami') setS({ screen: 'legami' })
    else { markDone(x.k); flash('Segnato. Il flusso ti aspetta al passo dopo.') }
  }

  return (
    <div className="screen">
      <header className="home-head">
        <div>
          <h1 className="h-page" style={{ margin: 0 }}>Buongiorno, {name}</h1>
          <div className="meta" style={{ marginTop: 4 }}>{flowNow}</div>
        </div>
        <button className="avatar-btn" onClick={() => setS({ screen: 'profile' })} aria-label="Profilo">{name[0]}</button>
      </header>

      <div className="stack" style={{ gap: 12 }}>
        <div className="progress-row">
          <div className="progress-track"><div className="progress-fill" style={{ width: `${Math.round(100 * doneCount / ord.length)}%` }} /></div>
          <div style={{ fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{doneCount} di {ord.length}</div>
        </div>

        {ord.map((x, i) => {
          const done = !!day.done[x.k]
          const current = i === curIdx
          const state = current ? 'current' : done ? 'done' : 'upcoming'
          const isNext = !done && !current && i === curIdx + 1
          const dur = x.k === 'meditate' ? `${COURSE[p.courseStep].mins} min` : x.dur
          return (
            <div key={x.k} className={`step ${state}`}>
              <div className="step-row">
                <span className="step-ring">{done ? <Check size={14} strokeWidth={2.75} /> : ''}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span className="step-kicker">{x.k === 'move' ? day.moveWhen : x.when}</span>
                  <span className="step-title">{x.title}</span>
                </span>
                <span className="step-dur">{dur}</span>
              </div>
              {current && (
                <div style={{ paddingTop: 12 }}>
                  <div className="step-body">
                    {x.k === 'move' && day.moveMoved ? 'Spostata. Dieci minuti fuori, quando la giornata lo permette.' : x.body}
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                    <button className="btn-primary" style={{ flex: 1, width: 'auto' }} onClick={() => act(x)}>{x.cta}</button>
                    <button
                      className="btn-outline"
                      onClick={() => {
                        markDone(x.k)
                        flash(x.k === 'move' ? 'Segnato. Il flusso ti aspetta al passo dopo.' : 'Saltato senza colpe. Il flusso continua.')
                      }}
                    >
                      {x.k === 'move' ? 'Fatto' : 'Salta'}
                    </button>
                  </div>
                  {x.k === 'move' && (
                    <div className="reschedule">
                      <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 10 }}>
                        {day.moveMoved ? 'Spostala di nuovo, se serve.' : 'A pranzo non ci sta? Scegli quando.'}
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
                                  ? 'Camminata spostata a domani mattina. Oggi non ti pesa addosso.'
                                  : `Camminata spostata: ${sl.label.toLowerCase()}. Il flusso si riordina da solo.`)
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
              )}
              {(done || isNext) && (
                <div style={{ paddingTop: 8, paddingLeft: 38 }}>
                  <button
                    className="step-link"
                    style={{ color: done ? 'rgba(32,30,29,.5)' : 'var(--sage-700)' }}
                    onClick={() => act(x)}
                  >
                    {done ? 'Rifallo →' : 'Aprilo adesso →'}
                  </button>
                </div>
              )}
            </div>
          )
        })}

        <button className="pausa-pill" onClick={() => setS({ screen: 'pausa', pausaStep: 0, pausaT: 0 })}>
          <span className="pausa-dot" />
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--sage-700)' }}>Momento difficile</span>
            <span style={{ display: 'block', fontSize: 12, color: 'rgba(140,73,26,.75)' }}>In qualsiasi punto della giornata, novanta secondi</span>
          </span>
        </button>

        <div className="home-duo">
          <button className="duo-btn" onClick={() => setS({ screen: 'inneschi' })}>
            <span style={{ display: 'block', fontSize: 14, fontWeight: 600 }}>Conoscerti</span>
            <span style={{ display: 'block', fontSize: 11.5, color: 'var(--muted)' }}>
              {gentle ? 'Inneschi e clima della settimana' : 'Equilibrio 68 · inneschi'}
            </span>
          </button>
          <button className="duo-btn" onClick={() => setS({ screen: 'pratica' })}>
            <span style={{ display: 'block', fontSize: 14, fontWeight: 600 }}>Il percorso</span>
            <span style={{ display: 'block', fontSize: 11.5, color: 'var(--muted)' }}>Imparare a meditare</span>
          </button>
        </div>
      </div>
    </div>
  )
}
