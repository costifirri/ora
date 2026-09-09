import { corpoPianta } from './Pianta.jsx'
import { rng, posto, haSete } from '../garden.js'

// L'orto e' una scena sola, non sei riquadri: cielo, collina, staccionata,
// terra. Le piante stanno dentro l'aiuola a profondita' diverse — quelle
// davanti piu' grandi, quelle dietro piu' piccole — e si muovono appena, come
// se ci fosse un filo d'aria.

const L = 360, H = 300          // la tela
const ORIZZONTE = 132

// Il cielo segue l'ora vera del tuo telefono.
const CIELI = {
  alba:     { a: '#f8cba6', b: '#f7e8d2', astro: '#f0a95e', buio: 0.10, stelle: 0, nome: 'alba' },
  giorno:   { a: '#b9d7e5', b: '#eff0df', astro: '#f2cf6b', buio: 0, stelle: 0, nome: 'giorno' },
  tramonto: { a: '#e29169', b: '#f7d9b2', astro: '#dd6f3c', buio: 0.14, stelle: 0, nome: 'tramonto' },
  notte:    { a: '#2b3a58', b: '#55617d', astro: '#efe9d5', buio: 0.46, stelle: 1, nome: 'notte' },
}

export function momento(h) {
  if (h >= 5 && h < 8) return 'alba'
  if (h >= 8 && h < 18) return 'giorno'
  if (h >= 18 && h < 21) return 'tramonto'
  return 'notte'
}

// Un ciuffo d'erba: tre fili storti.
const Ciuffo = ({ x, y, s, colore }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={0.9}>
    <path d="M0 0 Q -1 -5 -3 -8" stroke={colore} strokeWidth="1.4" fill="none" strokeLinecap="round" />
    <path d="M0 0 Q 0 -6 1 -10" stroke={colore} strokeWidth="1.4" fill="none" strokeLinecap="round" />
    <path d="M0 0 Q 2 -4 4 -7" stroke={colore} strokeWidth="1.4" fill="none" strokeLinecap="round" />
  </g>
)

// Un'erbaccia: piu' scomposta di un ciuffo, e con un fiorellino giallo.
const Erbaccia = ({ e, onClick, attrezzo }) => {
  const r = rng(e.id)
  const s = 0.9 + (e.z ?? 0.5) * 0.8
  const x = 26 + e.x * (L - 52)
  const y = 176 + (e.z ?? 0.5) * 112
  const fili = [0, 1, 2, 3, 4].map(i => {
    const dx = (i - 2) * 3 + r() * 2
    const h = 9 + r() * 9
    return <path key={i} d={`M0 0 Q ${dx * 0.5} ${-h * 0.6} ${dx} ${-h}`} stroke="#8e9c62" strokeWidth="1.5" fill="none" strokeLinecap="round" />
  })
  return (
    <g
      transform={`translate(${x} ${y}) scale(${s})`}
      onClick={ev => { ev.stopPropagation(); onClick(e.id) }}
      style={{ cursor: attrezzo === 'mano' ? 'grab' : 'pointer' }}
      role="button" aria-label="Erbaccia da strappare"
    >
      <ellipse cx="0" cy="1" rx="9" ry="2.5" fill="rgba(46,43,37,.10)" />
      {fili}
      <circle cx="2" cy="-13" r="2.2" fill="#e3c85c" />
      <circle cx="-4" cy="-9" r="1.6" fill="#e3c85c" opacity=".8" />
    </g>
  )
}

export default function Orto({ giardino, erbacce, attrezzo, onPianta, onErbaccia, onTerra, ora = new Date() }) {
  const mom = momento(ora.getHours())
  const cielo = CIELI[mom]

  // Erba, sassi e fiorellini di sfondo: fissi, non ballano a ogni ridisegno.
  const sfondo = []
  const rs = rng('sfondo-orto')
  for (let i = 0; i < 58; i++) {
    const z = rs()
    sfondo.push({
      x: rs() * L, y: 150 + z * 145, s: 0.7 + z * 1.0,
      colore: z > 0.5 ? '#6f8a52' : '#7d9660',
    })
  }

  // A filari, come si semina davvero: tre file, dalla piu' lontana alla piu'
  // vicina. Lasciate a caso si accavallavano e restava mezza aiuola vuota.
  const RIGHE = [0.06, 0.46, 0.9]
  const ordinate = [...giardino].sort((a, b) => a.piantataIl - b.piantataIl)
  const perRiga = Math.max(1, Math.ceil(ordinate.length / RIGHE.length))

  const disposte = ordinate.map((pl, i) => {
    const riga = Math.min(RIGHE.length - 1, Math.floor(i / perRiga))
    const col = i % perRiga
    const quante = Math.min(perRiga, ordinate.length - riga * perRiga)
    const r = rng('pos-' + pl.id)
    const z = RIGHE[riga]
    // Dentro il filare sono spaziate, ma non allineate col righello.
    const x = quante === 1 ? 0.5 : (col + 0.5) / quante
    return {
      pl,
      px: 46 + (x + (r() * 0.09 - 0.045)) * (L - 92),
      py: 176 + (z + (r() * 0.06 - 0.03)) * 106,
      s: 0.95 + z * 0.62,
      durata: 4.5 + r() * 3.5,
      ritardo: -r() * 6,
    }
  }).sort((a, b) => a.py - b.py)

  const farfalle = mom === 'notte' ? [] : [0, 1]
  const lucciole = mom === 'notte' ? [0, 1, 2, 3] : []

  return (
    <svg
      className="orto-scena" viewBox={`0 0 ${L} ${H}`} role="img"
      aria-label={`Il tuo orto, ${cielo.nome}. ${giardino.length} piante.`}
      onClick={onTerra}
    >
      <defs>
        <linearGradient id="cielo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={cielo.a} />
          <stop offset="100%" stopColor={cielo.b} />
        </linearGradient>
        <linearGradient id="terra" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9d7c58" />
          <stop offset="100%" stopColor="#805f41" />
        </linearGradient>
        <clipPath id="tela"><rect x="0" y="0" width={L} height={H} rx="26" /></clipPath>
      </defs>

      <g clipPath="url(#tela)">
        <rect x="0" y="0" width={L} height={ORIZZONTE + 6} fill="url(#cielo)" />

        {cielo.stelle > 0 && [...Array(26)].map((_, i) => {
          const r = rng('stella' + i)
          return <circle key={i} className="stella" cx={r() * L} cy={r() * 130} r={0.7 + r() * 0.9}
            fill="#fdf6e6" style={{ animationDelay: `${-r() * 4}s` }} />
        })}

        {/* Sole o luna, in alto a destra */}
        {mom === 'notte'
          ? <>
              <circle cx="292" cy="46" r="17" fill={cielo.astro} />
              <circle cx="284" cy="41" r="15" fill={cielo.b} />
            </>
          : <circle cx="292" cy="48" r="19" fill={cielo.astro} opacity={mom === 'giorno' ? 0.95 : 0.85} />}

        {/* Due nuvole morbide, solo di giorno e all'alba */}
        {(mom === 'giorno' || mom === 'alba') && (
          <g fill="#fdf7ec" opacity={mom === 'alba' ? 0.6 : 0.78}>
            <ellipse cx="72" cy="44" rx="26" ry="12" />
            <ellipse cx="94" cy="48" rx="19" ry="9" />
            <ellipse cx="52" cy="49" rx="17" ry="8" />
            <ellipse cx="196" cy="26" rx="20" ry="9" />
            <ellipse cx="213" cy="30" rx="14" ry="7" />
          </g>
        )}

        {/* Due colline, una dietro l'altra */}
        <path d={`M-20 ${ORIZZONTE} Q 70 ${ORIZZONTE - 46} 170 ${ORIZZONTE - 8} T 380 ${ORIZZONTE - 18} L 380 ${H} L -20 ${H} Z`}
          fill={mom === 'notte' ? '#41543f' : '#93a877'} opacity="0.75" />
        <path d={`M-20 ${ORIZZONTE + 4} Q 120 ${ORIZZONTE - 20} 250 ${ORIZZONTE + 6} T 380 ${ORIZZONTE - 2} L 380 ${H} L -20 ${H} Z`}
          fill={mom === 'notte' ? '#3b4d3a' : '#7f9a63'} />

        {/* La staccionata */}
        <g opacity="0.9">
          {[...Array(9)].map((_, i) => (
            <g key={i}>
              <rect x={6 + i * 42} y={ORIZZONTE - 20} width="7" height="26" rx="2.5" fill="#c2a179" />
              <path d={`M${6 + i * 42} ${ORIZZONTE - 20} l3.5 -5 l3.5 5 z`} fill="#cdae88" />
            </g>
          ))}
          <rect x="0" y={ORIZZONTE - 14} width={L} height="4" rx="2" fill="#b8956c" />
          <rect x="0" y={ORIZZONTE - 4} width={L} height="4" rx="2" fill="#b8956c" />
        </g>

        {/* L'aiuola */}
        <path d={`M-10 ${ORIZZONTE + 12} Q ${L / 2} ${ORIZZONTE + 2} ${L + 10} ${ORIZZONTE + 12} L ${L + 10} ${H} L -10 ${H} Z`}
          fill="url(#terra)" />
        <path d={`M-10 ${ORIZZONTE + 12} Q ${L / 2} ${ORIZZONTE + 2} ${L + 10} ${ORIZZONTE + 12} L ${L + 10} ${ORIZZONTE + 20} Q ${L / 2} ${ORIZZONTE + 10} -10 ${ORIZZONTE + 20} Z`}
          fill="#b0906a" opacity="0.75" />

        {/* Tre solchi, come in un orto zappato */}
        {[0, 1, 2].map(i => (
          <path key={`solco${i}`}
            d={`M-10 ${ORIZZONTE + 34 + i * 44} Q ${L / 2} ${ORIZZONTE + 26 + i * 44} ${L + 10} ${ORIZZONTE + 34 + i * 44}`}
            stroke="#5f4830" strokeWidth="1.6" fill="none" opacity="0.28" />
        ))}
        {[...Array(12)].map((_, i) => {
          const r = rng('sasso' + i)
          return <ellipse key={`sa${i}`} cx={r() * L} cy={ORIZZONTE + 20 + r() * 140} rx={1.6 + r() * 2} ry={1.1 + r() * 1.2}
            fill="#5f4830" opacity="0.3" />
        })}

        {sfondo.map((c, i) => <Ciuffo key={i} x={c.x} y={c.y} s={c.s} colore={c.colore} />)}

        {/* Fiorellini di campo, quelli che vengono da soli */}
        {[...Array(9)].map((_, i) => {
          const r = rng('fiorellino' + i)
          const x = r() * L, y = ORIZZONTE + 24 + r() * 132
          const tinta = ['#e4b7c6', '#cfc0e0', '#dcb3cd'][Math.floor(r() * 3)]
          return (
            <g key={`fi${i}`} transform={`translate(${x} ${y})`} opacity="0.85">
              <path d="M0 0 L0 -6" stroke="#7d9660" strokeWidth="1.1" strokeLinecap="round" />
              <circle cy="-7.5" r="2.3" fill={tinta} />
              <circle cy="-7.5" r="0.9" fill="#f7ecd8" />
            </g>
          )
        })}

        {erbacce.map(e => <Erbaccia key={e.id} e={e} attrezzo={attrezzo} onClick={onErbaccia} />)}

        {disposte.map(({ pl, px, py, s, durata, ritardo }) => (
          <g key={pl.id}
            transform={`translate(${px} ${py}) scale(${s})`}
            onClick={ev => { ev.stopPropagation(); onPianta(pl.id) }}
            style={{ cursor: 'pointer' }}
            role="button"
          >
            <ellipse cx="0" cy="2" rx="24" ry="5" fill="rgba(46,43,37,.16)" />
            <g className="dondola" style={{ animationDuration: `${durata}s`, animationDelay: `${ritardo}s` }}>
              <g transform="translate(-50 -74)">
                {corpoPianta(pl, { conVaso: false })}
              </g>
            </g>
            {haSete(pl) && (
              <g transform={`translate(${16 / s} ${-2}) scale(${1 / s})`}>
                <rect x="-1" y="-2" width="2" height="12" rx="1" fill="#a8845c" />
                <circle cy="-9" r="8" fill="#f6e7cf" stroke="rgba(46,43,37,.16)" />
                <path d="M0 -13.2 C 3 -9.6 3.4 -8 2 -6.6 C 0.7 -5.4 -0.7 -5.4 -2 -6.6 C -3.4 -8 -3 -9.6 0 -13.2 Z" fill="#7aa5c4" />
              </g>
            )}
            {pl.foglieSecche && (
              <g transform={`translate(${-16 / s} ${-2}) scale(${1 / s})`}>
                <rect x="-1" y="-2" width="2" height="12" rx="1" fill="#a8845c" />
                <circle cy="-9" r="8" fill="#f6e7cf" stroke="rgba(46,43,37,.16)" />
                <path d="M-3 -12 L3 -6 M3 -12 L-3 -6" stroke="#b4772f" strokeWidth="1.9" strokeLinecap="round" />
              </g>
            )}
          </g>
        ))}

        {farfalle.map(i => (
          <g key={`fa${i}`} className={`farfalla f${i}`} aria-hidden="true">
            <ellipse cx="-2.4" cy="0" rx="3.2" ry="2.2" fill="#efb9c8" transform="rotate(-22)" />
            <ellipse cx="2.4" cy="0" rx="3.2" ry="2.2" fill="#e8a6b8" transform="rotate(22)" />
          </g>
        ))}
        {lucciole.map(i => (
          <circle key={`lu${i}`} className={`lucciola l${i}`} r="2.2" fill="#f4e6a0" aria-hidden="true" />
        ))}

        {/* La notte non e' un altro disegno: e' lo stesso, con meno luce sopra. */}
        {cielo.buio > 0 && <rect x="0" y="0" width={L} height={H} fill="#22305a" opacity={cielo.buio} pointerEvents="none" />}
      </g>
    </svg>
  )
}
