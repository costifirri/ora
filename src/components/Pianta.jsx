import { specie, crescita, haSete, rng } from '../garden.js'

// Le piante sono disegnate, non fotografate: e' un orto da libro illustrato.
// Ma un disegno a mano non e' mai simmetrico, ed e' li' che sta la differenza
// tra una pianta e un'icona. Ogni pianta ha un suo seme: da quello escono la
// pendenza del gambo, l'angolo di ogni foglia, il verde esatto. Sempre gli
// stessi, ogni volta che riapri — e' la sua forma, non rumore.

const BASE = 74   // dove la pianta tocca terra, nel sistema 0..100

const Foglia = ({ x, y, ang, len, colore, opacita = 1, spessore = 0.42, bordo }) => (
  <ellipse
    cx={x} cy={y} rx={len} ry={len * spessore} fill={colore} opacity={opacita}
    stroke={bordo} strokeWidth={bordo ? 0.7 : 0}
    transform={`rotate(${ang} ${x} ${y})`}
  />
)

const FORMA = {
  lavanda:  { spessore: 0.22, lungh: 0.62, altezza: 0.62, opposte: false, ang: -52, fin: 0.95, nFoglie: 8 },
  basilico: { spessore: 0.46, lungh: 0.80, altezza: 0.68, opposte: true,  ang: -14, fin: 1.00, nFoglie: 4 },
  girasole: { spessore: 0.46, lungh: 0.95, altezza: 0.85, opposte: false, ang: -26, fin: 0.72, nFoglie: 6 },
}

// Schiarisce o scurisce un colore di poco: due basilici vicini non hanno mai
// esattamente lo stesso verde.
function vira(hex, quanto) {
  const n = parseInt(hex.slice(1), 16)
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
    .map(v => Math.max(0, Math.min(255, Math.round(v + quanto))))
  return `#${c.map(v => v.toString(16).padStart(2, '0')).join('')}`
}

/**
 * Il corpo della pianta, in coordinate 0..100 con la terra a y=74.
 * Torna elementi SVG: chi lo usa decide dove metterli e quanto grandi.
 */
export function corpoPianta(pianta, { conVaso = true } = {}) {
  const sp = specie(pianta.specie)
  const c = crescita(pianta)
  const sete = haSete(pianta)
  const r = rng(pianta.id || pianta.specie)

  // I capricci di questa pianta, tirati una volta sola.
  const tinta = Math.round(r() * 22 - 11)
  const pendenza = r() * 9 - 4.5
  const altFatt = 0.9 + r() * 0.22

  const verde = sete ? '#94a084' : vira(sp.foglia, tinta)
  const gambo = sete ? '#84906f' : vira(sp.stelo, tinta)

  const forma = FORMA[pianta.specie] || FORMA.basilico
  const alt = (8 + c * 52) * forma.altezza * altFatt
  const cimaX = 50 + pendenza * (alt / 40)
  const cima = BASE - alt

  const corpo = []

  if (pianta.specie === 'cactus') {
    const h = (14 + c * 44) * altFatt
    const w = 11 + c * 7
    corpo.push(<rect key="c" x={50 - w / 2} y={BASE - h} width={w} height={h} rx={w / 2} fill={verde} stroke={vira(verde, -24)} strokeWidth={0.8} />)
    if (c > 0.45) {
      const bh = 10 + c * 16
      const su = BASE - h * (0.62 + r() * 0.16)
      corpo.push(<rect key="b1" x={50 - w / 2 - 11} y={su} width={8} height={bh} rx={4} fill={verde} stroke={vira(verde, -24)} strokeWidth={0.8} />)
      corpo.push(<rect key="b2" x={50 - w / 2 - 11} y={su} width={8} height={7} rx={4} fill={verde} />)
    }
    if (c > 0.7) {
      corpo.push(<rect key="b3" x={50 + w / 2 + 3} y={BASE - h * (0.45 + r() * 0.18)} width={8} height={9 + c * 12} rx={4} fill={verde} stroke={vira(verde, -24)} strokeWidth={0.8} />)
    }
    for (let i = 0; i < Math.round(c * 9); i++) {
      const y = BASE - 6 - i * (h / 10)
      corpo.push(<line key={`sp${i}`} x1={48} y1={y} x2={52} y2={y} stroke="rgba(255,255,255,.5)" strokeWidth={0.8} strokeLinecap="round" />)
    }
    if (c >= 1 && sp.fiore) {
      corpo.push(<circle key="f" cx={50} cy={BASE - h - 4} r={6} fill={sp.fiore} />)
      corpo.push(<circle key="f2" cx={50} cy={BASE - h - 4} r={2.2} fill="#fff3e2" />)
    }
  } else if (pianta.specie === 'felce') {
    const n = Math.max(1, Math.round(1 + c * 6))
    for (let i = 0; i < n; i++) {
      const lato = i % 2 ? 1 : -1
      const spread = (i / Math.max(1, n - 1) - 0.5) * 2 + (r() * 0.3 - 0.15)
      const lung = (18 + c * 30) * altFatt * (0.62 + 0.38 * (1 - Math.abs(spread))) * (0.88 + r() * 0.24)
      const fine = { x: 50 + spread * (14 + c * 20), y: BASE - lung }
      corpo.push(
        <path key={`fr${i}`}
          d={`M50 ${BASE} Q ${50 + spread * 10} ${BASE - lung * 0.6} ${fine.x} ${fine.y}`}
          stroke={verde} strokeWidth={2.2} fill="none" strokeLinecap="round" />,
      )
      for (let j = 1; j <= 4; j++) {
        const t = j / 5
        corpo.push(
          <Foglia key={`ff${i}-${j}`}
            x={50 + (fine.x - 50) * t} y={BASE - lung * t}
            ang={lato * 40 + spread * 30 + (r() * 14 - 7)}
            len={(4 + c * 3.5) * (0.85 + r() * 0.3)} colore={verde} />,
        )
      }
    }
  } else {
    // Il gambo pende un po', e non e' mai dritto.
    corpo.push(
      <path key="st"
        d={`M50 ${BASE} C ${48 + pendenza * 0.4} ${BASE - alt * 0.5}, ${52 + pendenza * 0.8} ${BASE - alt * 0.72}, ${cimaX} ${cima}`}
        stroke={gambo} strokeWidth={2.4 + c * 1.6} fill="none" strokeLinecap="round" />,
    )
    const n = Math.round(c * forma.nFoglie)
    for (let i = 0; i < n; i++) {
      const t = (i + 1) / (n + 1)
      const y = BASE - alt * t * forma.fin
      const xg = 50 + (cimaX - 50) * t * forma.fin
      const len = (7 + c * 9) * forma.lungh * (1 - t * 0.3) * (0.85 + r() * 0.32)
      const lati = forma.opposte ? [-1, 1] : [i % 2 ? 1 : -1]
      lati.forEach(lato => corpo.push(
        <Foglia key={`l${i}-${lato}`}
          x={xg + lato * (len * 0.72)} y={y}
          ang={lato * forma.ang + (r() * 18 - 9)}
          len={len} colore={verde} spessore={forma.spessore} bordo={sete ? '#7f8a72' : gambo} />,
      ))
    }

    if (c >= 0.82 && sp.fiore) {
      if (pianta.specie === 'girasole') {
        for (let i = 0; i < 12; i++) {
          corpo.push(
            <ellipse key={`p${i}`} cx={cimaX} cy={cima - 11} rx={4} ry={9} fill={vira(sp.fiore, i % 2 ? 10 : -10)}
              transform={`rotate(${(i / 12) * 360 + r() * 8} ${cimaX} ${cima - 11})`} />,
          )
        }
        corpo.push(<circle key="cuore" cx={cimaX} cy={cima - 11} r={5.5} fill="#6b4b2a" />)
        corpo.push(<circle key="cuore2" cx={cimaX - 1.2} cy={cima - 12.2} r={1.9} fill="#8a6238" />)
      } else if (pianta.specie === 'lavanda') {
        for (let i = 0; i < 9; i++) {
          const y = cima - 1 - i * 3.6
          const rr = 3.4 - i * 0.25
          const dx = r() * 1.4 - 0.7
          corpo.push(<ellipse key={`spL${i}`} cx={cimaX - 2 + dx} cy={y} rx={rr} ry={rr * 0.85} fill={vira(sp.fiore, -8)} opacity={0.94} />)
          corpo.push(<ellipse key={`spR${i}`} cx={cimaX + 2 + dx} cy={y - 1.6} rx={rr * 0.85} ry={rr * 0.75} fill={vira(sp.fiore, 14)} opacity={0.85} />)
        }
      } else {
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2
          corpo.push(<circle key={`f${i}`} cx={cimaX + Math.cos(a) * 4.5} cy={cima - 4 + Math.sin(a) * 4.5} r={2.6} fill={sp.fiore} />)
        }
        corpo.push(<circle key="fc" cx={cimaX} cy={cima - 4} r={2} fill="#e6c25e" />)
      }
    }
  }

  if (pianta.foglieSecche) {
    corpo.push(<Foglia key="s1" x={41} y={BASE - 5} ang={40} len={7} colore="#b08a5e" opacita={0.92} />)
    corpo.push(<Foglia key="s2" x={60} y={BASE - 11} ang={-32} len={6} colore="#a87f52" opacita={0.88} />)
  }

  if (conVaso) {
    corpo.push(
      <g key="vaso">
        <path d="M31 74 h38 l-5 22 a4 4 0 0 1 -4 3 h-20 a4 4 0 0 1 -4 -3 z" fill="#c99a72" />
        <rect x="28" y="69" width="44" height="7" rx="3" fill="#d8ac85" />
        <ellipse cx="50" cy="72.5" rx="19" ry="3.4" fill="#7b5f45" />
      </g>,
    )
  }

  return corpo
}

// Versione autonoma, per l'anteprima quando scegli cosa piantare.
export default function Pianta({ pianta, size = 108, conVaso = true }) {
  const sp = specie(pianta.specie)
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role="img"
      aria-label={`${sp.nome}${pianta.nome ? `, ${pianta.nome}` : ''}`}>
      <ellipse cx="50" cy="97" rx="26" ry="3.5" fill="rgba(46,43,37,.10)" />
      {corpoPianta(pianta, { conVaso })}
    </svg>
  )
}
