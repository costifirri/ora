import { specie, crescita, haSete } from '../garden.js'

// Le piante non sono cinque disegni che si scambiano: sono un disegno solo,
// costruito ogni volta a partire da quanto e' cresciuta. Cosi' la crescita si
// vede davvero, giorno per giorno, invece di saltare da un'immagine all'altra.

const VASO = (
  <>
    <path d="M31 74 h38 l-5 22 a4 4 0 0 1 -4 3 h-20 a4 4 0 0 1 -4 -3 z" fill="#c99a72" />
    <rect x="28" y="69" width="44" height="7" rx="3" fill="#d8ac85" />
  </>
)

// Una foglia: ellisse ruotata, attaccata al punto del gambo.
const Foglia = ({ x, y, ang, len, colore, opacita = 1, spessore = 0.42, bordo }) => (
  <ellipse
    cx={x} cy={y} rx={len} ry={len * spessore} fill={colore} opacity={opacita}
    stroke={bordo} strokeWidth={bordo ? 0.7 : 0}
    transform={`rotate(${ang} ${x} ${y})`}
  />
)

// Quello che distingue una lavanda da un basilico non e' il fiore in cima: e'
// la forma. Foglie strette e alte, o larghe e basse, cambiano tutto.
// altezza: quanto sale lo stelo. Non puo' crescere a piacere — sopra ci va il
// fiore, e la tela finisce a zero. fin: fin dove arrivano le foglie lungo lo
// stelo, cosi' la cima resta libera.
const FORMA = {
  lavanda:  { spessore: 0.22, lungh: 0.62, altezza: 0.62, opposte: false, ang: -52, fin: 0.95, nFoglie: 8 },
  basilico: { spessore: 0.46, lungh: 0.80, altezza: 0.68, opposte: true,  ang: -14, fin: 1.00, nFoglie: 4 },
  girasole: { spessore: 0.46, lungh: 0.95, altezza: 0.85, opposte: false, ang: -26, fin: 0.72, nFoglie: 6 },
}

export default function Pianta({ pianta, size = 108 }) {
  const sp = specie(pianta.specie)
  const c = crescita(pianta)
  const sete = haSete(pianta)
  const secche = pianta.foglieSecche

  // Con la sete il verde vira: non e' malata, e' solo spenta.
  const verde = sete ? '#94a084' : sp.foglia
  const gambo = sete ? '#84906f' : sp.stelo

  const forma = FORMA[pianta.specie] || FORMA.basilico
  const base = 74                              // dove comincia la terra
  const alt = (8 + c * 52) * forma.altezza     // altezza del gambo
  const cima = base - alt

  const corpo = []

  if (pianta.specie === 'cactus') {
    const h = 14 + c * 44
    const w = 11 + c * 7
    corpo.push(<rect key="c" x={50 - w / 2} y={base - h} width={w} height={h} rx={w / 2} fill={verde} />)
    if (c > 0.45) {
      const bh = 10 + c * 16
      corpo.push(<rect key="b1" x={50 - w / 2 - 11} y={base - h * 0.72} width={8} height={bh} rx={4} fill={verde} />)
      corpo.push(<rect key="b2" x={50 - w / 2 - 11} y={base - h * 0.72} width={8} height={7} rx={4} fill={verde} />)
    }
    if (c > 0.7) {
      corpo.push(<rect key="b3" x={50 + w / 2 + 3} y={base - h * 0.55} width={8} height={9 + c * 12} rx={4} fill={verde} />)
    }
    if (c >= 1 && sp.fiore) {
      corpo.push(<circle key="f" cx={50} cy={base - h - 4} r={6} fill={sp.fiore} />)
    }
  } else if (pianta.specie === 'felce') {
    // Niente gambo centrale: tante fronde che partono dalla terra.
    const n = Math.max(1, Math.round(1 + c * 6))
    for (let i = 0; i < n; i++) {
      const lato = i % 2 ? 1 : -1
      const spread = (i / Math.max(1, n - 1) - 0.5) * 2
      const lung = (18 + c * 30) * (0.65 + 0.35 * (1 - Math.abs(spread)))
      const fine = { x: 50 + spread * (14 + c * 20), y: base - lung }
      corpo.push(
        <path
          key={`fr${i}`}
          d={`M50 ${base} Q ${50 + spread * 10} ${base - lung * 0.6} ${fine.x} ${fine.y}`}
          stroke={verde} strokeWidth={2.4} fill="none" strokeLinecap="round"
        />,
      )
      for (let j = 1; j <= 4; j++) {
        const t = j / 5
        const px = 50 + (fine.x - 50) * t
        const py = base - lung * t
        corpo.push(<Foglia key={`ff${i}-${j}`} x={px} y={py} ang={lato * 40 + spread * 30} len={4 + c * 3.5} colore={verde} />)
      }
    }
  } else {
    // Lavanda, basilico, girasole: un gambo e foglie alternate.
    corpo.push(
      <path key="st" d={`M50 ${base} C 48 ${base - alt * 0.5}, 52 ${base - alt * 0.7}, 50 ${cima}`}
        stroke={gambo} strokeWidth={2.6 + c * 1.6} fill="none" strokeLinecap="round" />,
    )
    const n = Math.round(c * forma.nFoglie)
    for (let i = 0; i < n; i++) {
      const t = (i + 1) / (n + 1)
      const y = base - alt * t * forma.fin
      const len = (7 + c * 9) * forma.lungh * (1 - t * 0.3)
      // A coppie o alternate: e' la differenza tra un cespuglio e uno stelo.
      const lati = forma.opposte ? [-1, 1] : [i % 2 ? 1 : -1]
      lati.forEach(lato => corpo.push(
        <Foglia
          key={`l${i}-${lato}`} x={50 + lato * (len * 0.72)} y={y}
          ang={lato * forma.ang} len={len} colore={verde} spessore={forma.spessore}
          bordo={sete ? '#7f8a72' : gambo}
        />,
      ))
    }

    if (c >= 0.82 && sp.fiore) {
      if (pianta.specie === 'girasole') {
        const petali = 12
        for (let i = 0; i < petali; i++) {
          const a = (i / petali) * 360
          corpo.push(
            <ellipse key={`p${i}`} cx={50} cy={cima - 11} rx={4} ry={9} fill={sp.fiore}
              transform={`rotate(${a} 50 ${cima - 11})`} />,
          )
        }
        corpo.push(<circle key="cuore" cx={50} cy={cima - 11} r={5.5} fill="#6b4b2a" />)
      } else if (pianta.specie === 'lavanda') {
        // Una spiga: tanti fiorellini piccoli su per il gambo, sempre piu'
        // stretti verso la punta.
        for (let i = 0; i < 9; i++) {
          const y = cima - 1 - i * 3.6
          const r = 3.4 - i * 0.25
          corpo.push(<ellipse key={`spL${i}`} cx={50 - 2} cy={y} rx={r} ry={r * 0.85} fill={sp.fiore} opacity={0.92} />)
          corpo.push(<ellipse key={`spR${i}`} cx={50 + 2} cy={y - 1.6} rx={r * 0.85} ry={r * 0.75} fill={sp.fiore} opacity={0.8} />)
        }
      } else {
        corpo.push(<circle key="f1" cx={50} cy={cima - 5} r={4.5} fill={sp.fiore} />)
        corpo.push(<circle key="f2" cx={44} cy={cima} r={3.2} fill={sp.fiore} opacity={0.9} />)
      }
    }
  }

  // Le foglie secche: due, curve verso il basso, colore di terra.
  const seccheEl = secche ? (
    <>
      <Foglia x={38} y={base - 6} ang={38} len={7} colore="#b08a5e" opacita={0.9} />
      <Foglia x={62} y={base - 12} ang={-30} len={6} colore="#a87f52" opacita={0.85} />
    </>
  ) : null

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role="img"
      aria-label={`${sp.nome}${pianta.nome ? `, ${pianta.nome}` : ''}`}>
      <ellipse cx="50" cy="97" rx="26" ry="3.5" fill="rgba(46,43,37,.10)" />
      {corpo}
      {seccheEl}
      {VASO}
      <ellipse cx="50" cy="72.5" rx="19" ry="3.4" fill="#7b5f45" />
    </svg>
  )
}
