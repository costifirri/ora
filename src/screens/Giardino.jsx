import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, X } from 'lucide-react'
import { rng } from '../garden.js'
import { STAGIONI, stagioneDi, verso, coltiva, riassunto } from '../giardino.js'

// Il giardino, in due modi di guardarlo.
//
// Da lontano: tutto quello che hai fatto, diventato piante, con sopra la
// stagione vera. Da vicino: una pianta sola, grande, e le mani — l'innaffiatoio
// si inclina e l'acqua cade davvero. Non serve a niente e non c'e' niente da
// completare: e' li' per il gusto di farlo.

const L = 1000, H = 620
const SUOLO = 300

const quando = ts => new Date(ts).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })

const posY = z => SUOLO + z * (H - SUOLO - 30)
const posX = x => 30 + x * (L - 60)
const scala = z => 0.55 + z * 0.75

// --- I disegni ----------------------------------------------------------

function Albero({ el, st, grande = 1 }) {
  const r = rng(el.id)
  const s = el.grande * grande
  const h = 120 * s
  const rami = st.chioma
  return (
    <g>
      <path d={`M-7 0 C -5 ${-h * 0.4} -9 ${-h * 0.6} -4 ${-h} L 4 ${-h} C 9 ${-h * 0.6} 5 ${-h * 0.4} 7 0 Z`} fill="#8b6a4a" />
      {[0.55, 0.72].map((t, i) => (
        <path key={i} d={`M0 ${-h * t} Q ${(i ? 26 : -26) * s} ${-h * (t + 0.08)} ${(i ? 40 : -40) * s} ${-h * (t + 0.18)}`}
          stroke="#8b6a4a" strokeWidth={4 * s} fill="none" strokeLinecap="round" />
      ))}
      {rami ? (
        <g>
          {[[0, -h - 18 * s, 52], [-38, -h + 4 * s, 38], [38, -h + 2 * s, 40], [-16, -h - 40 * s, 34], [20, -h - 36 * s, 32]]
            .map(([cx, cy, rr], i) => (
              <ellipse key={i} cx={cx * s} cy={cy} rx={rr * s} ry={rr * s * 0.86} fill={rami}
                opacity={0.92 - i * 0.05} />
            ))}
          {st.fiorAlbero && [...Array(9)].map((_, i) => (
            <circle key={`fi${i}`} cx={(r() * 150 - 75) * s} cy={-h - 20 * s + (r() * 70 - 35) * s} r={4 * s} fill={st.fiorAlbero} />
          ))}
        </g>
      ) : (
        // D'inverno i rami restano nudi, con un po' di neve sopra.
        <g>
          {[[-1, -0.9], [1, -1.05], [-1, -1.15], [1, -1.25]].map(([dir, t], i) => (
            <path key={i} d={`M0 ${h * t} Q ${dir * 30 * s} ${h * t - 20 * s} ${dir * 52 * s} ${h * t - 34 * s}`}
              stroke="#8b6a4a" strokeWidth={3.2 * s} fill="none" strokeLinecap="round" />
          ))}
          {[[-40, -h - 26], [30, -h - 34], [0, -h - 8]].map(([cx, cy], i) => (
            <ellipse key={`n${i}`} cx={cx * s} cy={cy * s} rx={12 * s} ry={4 * s} fill="#f4f6f7" opacity=".9" />
          ))}
        </g>
      )}
    </g>
  )
}

function Cespuglio({ el, st, grande = 1 }) {
  const s = el.grande * grande
  const c = st.cespuglio
  return (
    <g>
      {[[0, 0, 34], [-24, 6, 24], [24, 5, 26], [-10, -16, 22], [13, -18, 20]].map(([cx, cy, rr], i) => (
        <ellipse key={i} cx={cx * s} cy={(cy - rr * 0.7) * s} rx={rr * s} ry={rr * s * 0.82}
          fill={c} opacity={0.95 - i * 0.06} />
      ))}
    </g>
  )
}

function Fiore({ el, grande = 1 }) {
  const s = el.alto * grande
  const h = 40 * s
  return (
    <g>
      <path d={`M0 0 Q ${3 * s} ${-h * 0.6} 0 ${-h}`} stroke="#7d9660" strokeWidth={2.2 * s} fill="none" strokeLinecap="round" />
      <ellipse cx={-5 * s} cy={-h * 0.5} rx={6 * s} ry={2.6 * s} fill="#7d9660" transform={`rotate(-22 ${-5 * s} ${-h * 0.5})`} />
      {[...Array(el.petali)].map((_, i) => (
        <ellipse key={i} cx={0} cy={-h - 5 * s} rx={3.2 * s} ry={6.4 * s} fill={el.tinta}
          transform={`rotate(${(i / el.petali) * 360} 0 ${-h - 5 * s})`} />
      ))}
      <circle cx={0} cy={-h - 5 * s} r={2.6 * s} fill="#f2e3bd" />
    </g>
  )
}

function Sasso({ el }) {
  const s = el.grande
  return (
    <g transform={`rotate(${el.rot})`}>
      <ellipse cx="2" cy="3" rx={17 * s} ry={7 * s} fill="rgba(60,50,38,.16)" />
      <path d={`M${-16 * s} 0 C ${-18 * s} ${-9 * s} ${-6 * s} ${-14 * s} ${4 * s} ${-12 * s} C ${15 * s} ${-10 * s} ${18 * s} ${-2 * s} ${15 * s} ${2 * s} C ${10 * s} ${6 * s} ${-12 * s} ${6 * s} ${-16 * s} 0 Z`} fill="#8e857a" />
      <path d={`M${-12 * s} ${-3 * s} C ${-12 * s} ${-9 * s} ${-3 * s} ${-12 * s} ${4 * s} ${-10 * s} C ${10 * s} ${-8 * s} ${11 * s} ${-4 * s} ${9 * s} ${-3 * s} Z`} fill="#aca396" />
    </g>
  )
}

// --- Da vicino: le mani -------------------------------------------------

function Vicino({ el, st, onEsci }) {
  const box = useRef(null)
  const cv = useRef(null)
  const gocce = useRef([])
  const innaffia = useRef({ x: 190, y: 190, versa: false })
  const [bagnato, setBagnato] = useState(0)
  const [scosso, setScosso] = useState(0)
  const bagnatoRef = useRef(0)

  const CW = 420, CH = 820
  const TERRA = 620

  useEffect(() => {
    let vivo = true
    const ctx = cv.current.getContext('2d')
    let ultimo = performance.now()

    const giro = adesso => {
      if (!vivo) return
      const dt = Math.min(50, adesso - ultimo); ultimo = adesso
      const c = cv.current
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      if (c.width !== c.clientWidth * dpr) { c.width = c.clientWidth * dpr; c.height = c.clientHeight * dpr }
      const k = Math.max(c.clientWidth / CW, c.clientHeight / CH)
      const ox = (c.clientWidth - CW * k) / 2
      const oy = (c.clientHeight - CH * k) / 2
      ctx.setTransform(dpr * k, 0, 0, dpr * k, dpr * ox, dpr * oy)
      ctx.clearRect(-CW, -CH, CW * 3, CH * 3)

      const inn = innaffia.current
      if (inn.versa && gocce.current.length < 150) {
        for (let i = 0; i < 3; i++) {
          gocce.current.push({
            x: inn.x + 56 + (Math.random() * 9 - 4.5),
            y: inn.y + 81,
            vx: 6 + Math.random() * 10,
            vy: 40 + Math.random() * 40,
          })
        }
      }

      ctx.fillStyle = 'rgba(122,165,196,.85)'
      gocce.current = gocce.current.filter(g => {
        g.vy += 1500 * dt / 1000
        g.x += g.vx * dt / 1000
        g.y += g.vy * dt / 1000
        if (g.y >= TERRA) {
          bagnatoRef.current = Math.min(1, bagnatoRef.current + 0.02)
          return false
        }
        ctx.beginPath()
        ctx.ellipse(g.x, g.y, 1.7, 4.2, 0, 0, Math.PI * 2)
        ctx.fill()
        return true
      })

      // La terra si asciuga piano.
      bagnatoRef.current = Math.max(0, bagnatoRef.current - dt / 26000)
      setBagnato(b => (Math.abs(b - bagnatoRef.current) > 0.02 ? bagnatoRef.current : b))

      requestAnimationFrame(giro)
    }
    const id = requestAnimationFrame(giro)
    return () => { vivo = false; cancelAnimationFrame(id) }
  }, [])

  // Riempie lo schermo ritagliando (come "slice" dell'SVG), e il tocco usa la
  // stessa trasformazione: cosi' l'acqua cade esattamente dove hai il dito.
  const mappa = () => {
    const b = box.current.getBoundingClientRect()
    const k = Math.max(b.width / CW, b.height / CH)
    return { b, k, ox: (b.width - CW * k) / 2, oy: (b.height - CH * k) / 2 }
  }

  const dove = e => {
    const { b, k, ox, oy } = mappa()
    return [(e.clientX - b.left - ox) / k, (e.clientY - b.top - oy) / k]
  }

  const giu = e => {
    box.current.setPointerCapture(e.pointerId)
    const [x, y] = dove(e)
    innaffia.current = { x: x - 34, y: y - 26, versa: true }
    setScosso(s => s + 1)
  }
  const muovi = e => {
    if (!innaffia.current.versa) return
    const [x, y] = dove(e)
    innaffia.current = { x: x - 34, y: y - 26, versa: true }
    setScosso(s => s + 1)
  }
  const su = () => { innaffia.current = { ...innaffia.current, versa: false }; setScosso(s => s + 1) }

  const inn = innaffia.current
  const Disegno = el.tipo === 'albero' ? Albero : el.tipo === 'cespuglio' ? Cespuglio : Fiore

  return (
    <div className="vicino-scena" ref={box}
      onPointerDown={giu} onPointerMove={muovi} onPointerUp={su} onPointerCancel={su}
      style={{ touchAction: 'none' }}>
      <svg viewBox={`0 0 ${CW} ${CH}`} className="vicino-svg" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="vcielo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={st.cielo[0]} />
            <stop offset="100%" stopColor={st.cielo[1]} />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width={CW} height={CH} fill="url(#vcielo)" />
        {/* Una collina lontana, per non lasciare il vuoto dietro */}
        <path d={`M-20 ${TERRA - 6} Q ${CW * 0.3} ${TERRA - 76} ${CW * 0.62} ${TERRA - 18} T ${CW + 20} ${TERRA - 30} L ${CW + 20} ${CH} L -20 ${CH} Z`}
          fill={st.prato[0]} opacity=".45" />
        <path d={`M-20 ${TERRA} Q ${CW / 2} ${TERRA - 26} ${CW + 20} ${TERRA} L ${CW + 20} ${CH} L -20 ${CH} Z`} fill={st.terra} />
        <path d={`M-20 ${TERRA} Q ${CW / 2} ${TERRA - 26} ${CW + 20} ${TERRA} L ${CW + 20} ${CH} L -20 ${CH} Z`}
          fill="#33240f" opacity={bagnato * 0.4} style={{ transition: 'opacity .6s' }} />
        <ellipse cx={CW / 2} cy={TERRA + 8} rx="105" ry="15" fill="rgba(60,45,30,.18)" />

        <g transform={`translate(${CW / 2} ${TERRA}) scale(${el.tipo === 'albero' ? 1.9 : el.tipo === 'cespuglio' ? 3.4 : 5})`}>
          <g className="respira">
            <Disegno el={el} st={st} />
          </g>
        </g>

        {/* L'innaffiatoio: si inclina quando versi */}
        <g transform={`translate(${inn.x} ${inn.y}) rotate(${inn.versa ? 36 : 0}) scale(1.25)`} className="innaffiatoio">
          <rect x="0" y="0" width="52" height="40" rx="9" fill="#9fb3bd" />
          <rect x="0" y="0" width="52" height="12" rx="6" fill="#b3c4cc" />
          <path d="M50 8 L74 26 L70 34 L48 20 Z" fill="#9fb3bd" />
          <path d="M6 0 C 16 -18 40 -18 46 -2" stroke="#9fb3bd" strokeWidth="5" fill="none" strokeLinecap="round" />
        </g>
      </svg>
      <canvas ref={cv} className="vicino-acqua" />

      <button className="vicino-esci" onClick={onEsci} aria-label="Torna al giardino">
        <X size={18} strokeWidth={2.75} />
      </button>
      <div className="vicino-riga">
        {inn.versa ? 'Sta bevendo.' : 'Trascina il dito: l’innaffiatoio si inclina e l’acqua cade.'}
      </div>
    </div>
  )
}

// --- Il giardino intero -------------------------------------------------

export default function Giardino({ app }) {
  const { p, setS, name } = app
  const [scelto, setScelto] = useState(null)
  const [vicino, setVicino] = useState(null)

  const oggi = new Date()
  const st = STAGIONI[stagioneDi(oggi)]
  const g = coltiva(p, oggi.getTime())
  const parti = riassunto(g)
  const pross = verso(oggi)
  const vuoto = parti.length === 0

  const tutti = [
    ...g.alberi.map(e => ({ ...e, Disegno: Albero })),
    ...g.cespugli.map(e => ({ ...e, Disegno: Cespuglio })),
    ...g.sassi.map(e => ({ ...e, Disegno: Sasso })),
    ...g.fiori.map(e => ({ ...e, Disegno: Fiore })),
  ].sort((a, b) => a.z - b.z)

  if (vicino) return <Vicino el={vicino} st={st} onEsci={() => setVicino(null)} />

  return (
    <div className="screen">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 48, marginBottom: 8 }}>
        <button className="btn-back" onClick={() => setS({ screen: 'oggi' })} aria-label="Indietro">
          <ArrowLeft size={18} strokeWidth={2.75} />
        </button>
        <div className="kicker">Il tuo giardino · {st.nome}</div>
      </div>

      <div style={{ padding: '4px 0 14px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, lineHeight: 1.12, margin: 0 }}>
          {vuoto ? 'Ancora terra nuda' : `Questo${name ? `, ${name},` : ''} sei tu`}
        </h1>
        <div className="meta" style={{ marginTop: 7, lineHeight: 1.5 }}>
          {vuoto
            ? 'Non c’è niente da piantare: qui cresce quello che fai. Segna come stai, siediti un momento, scrivi una riga — e domani qualcosa sarà spuntato.'
            : 'Non l’hai piantato tu: è cresciuto da quello che hai fatto. Tocca qualsiasi cosa per sapere da dove viene.'}
        </div>
      </div>

      <div className={`giardino-tela st-${st.nome}`}>
        <svg viewBox={`0 0 ${L} ${H}`} role="img" aria-label={`Il tuo giardino in ${st.nome}`}>
          <defs>
            <linearGradient id="gcielo" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={st.cielo[0]} />
              <stop offset="100%" stopColor={st.cielo[1]} />
            </linearGradient>
            <linearGradient id="gprato" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={st.prato[0]} />
              <stop offset="100%" stopColor={st.prato[1]} />
            </linearGradient>
            <clipPath id="gtela"><rect x="0" y="0" width={L} height={H} rx="26" /></clipPath>
          </defs>

          <g clipPath="url(#gtela)">
            <rect x="0" y="0" width={L} height={SUOLO + 10} fill="url(#gcielo)" />
            <circle cx="820" cy="76" r="34" fill={st.nome === 'inverno' ? '#eef2f4' : '#f3d585'} opacity=".9" />
            <path d={`M-20 ${SUOLO} Q 180 ${SUOLO - 70} 420 ${SUOLO - 16} T 1020 ${SUOLO - 30} L 1020 ${H} L -20 ${H} Z`}
              fill={st.prato[0]} opacity=".55" />
            <rect x="0" y={SUOLO - 4} width={L} height={H - SUOLO + 4} fill="url(#gprato)" />

            {[...Array(90)].map((_, i) => {
              const r = rng('erba' + i)
              const x = r() * L, y = SUOLO + 8 + r() * (H - SUOLO - 16)
              return <path key={i} d={`M${x} ${y} q 3 -11 7 -17`} stroke={st.prato[1]} strokeWidth="2.4" fill="none" strokeLinecap="round" opacity=".7" />
            })}

            {tutti.map(el => (
              <g key={el.id}
                transform={`translate(${posX(el.x)} ${posY(el.z)}) scale(${scala(el.z)})`}
                onClick={() => setScelto(el)} style={{ cursor: 'pointer' }} role="button">
                <el.Disegno el={el} st={st} />
              </g>
            ))}

            {/* La stagione, sopra tutto */}
            {st.nome === 'autunno' && [...Array(9)].map((_, i) => (
              <path key={`fo${i}`} className={`cade c${i % 5}`} d="M0 0 q6 -5 11 0 q-5 6 -11 0 z" fill="#c98a3c" opacity=".85" />
            ))}
            {st.nome === 'inverno' && [...Array(14)].map((_, i) => (
              <circle key={`ne${i}`} className={`cade c${i % 5}`} r="3.2" fill="#fbfdfd" opacity=".92" />
            ))}
            {st.nome === 'primavera' && [...Array(9)].map((_, i) => (
              <ellipse key={`pe${i}`} className={`cade c${i % 5}`} rx="4.4" ry="3" fill="#f2c9d8" opacity=".9" />
            ))}
            {st.nome === 'estate' && [0, 1].map(i => (
              <g key={`fa${i}`} className={`farfalla f${i}`}>
                <ellipse cx="-3" cy="0" rx="4.2" ry="2.8" fill="#efd08a" transform="rotate(-20)" />
                <ellipse cx="3" cy="0" rx="4.2" ry="2.8" fill="#e8bf72" transform="rotate(20)" />
              </g>
            ))}
          </g>
        </svg>
      </div>

      <div className="card sand" style={{ fontSize: 13.5, lineHeight: 1.6, marginTop: 12 }}>
        {st.riga} Fra {pross.giorni} {pross.giorni === 1 ? 'giorno' : 'giorni'} comincia {pross.dopo}.
      </div>

      {!vuoto && (
        <div className="card surface" style={{ marginTop: 10 }}>
          <div className="kicker" style={{ color: 'var(--sage-700)', marginBottom: 8 }}>Cosa c’è dentro</div>
          <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 5, fontSize: 13.5, lineHeight: 1.5 }}>
            {parti.map(t => <li key={t}>{t}</li>)}
          </ul>
        </div>
      )}

      <div className="fineprint" style={{ lineHeight: 1.5, padding: '12px 8px 0' }}>
        Niente di tutto questo è inventato: ogni cosa che vedi corrisponde a una volta
        in cui c’eri. Le stagioni sono quelle vere, e passano da sole.
      </div>

      {scelto && (
        <div className="foglio" role="dialog" aria-label={scelto.titolo} onClick={() => setScelto(null)}>
          <div className="foglio-carta" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 14 }}>
              <svg viewBox="-60 -140 120 160" width="76" height="100" aria-hidden="true">
                <g transform={scelto.tipo === 'fiore' ? 'scale(1.6)' : scelto.tipo === 'sasso' ? 'scale(1.6)' : 'scale(.8)'}>
                  <scelto.Disegno el={scelto} st={st} />
                </g>
              </svg>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="h-card">{scelto.titolo}</div>
                <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 4 }}>{quando(scelto.quando)}</div>
              </div>
            </div>
            <div style={{ fontSize: 14.5, lineHeight: 1.6, marginBottom: 16 }}>{scelto.racconto}</div>
            {scelto.tipo !== 'sasso' && (
              <button className="btn-primary" style={{ minHeight: 50, fontSize: 15 }}
                onClick={() => { setVicino(scelto); setScelto(null) }}>
                Avvicinati
              </button>
            )}
            <button className="btn-outline" style={{ minHeight: 48, marginTop: 8 }} onClick={() => setScelto(null)}>
              Chiudi
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
