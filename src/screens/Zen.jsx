import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ArrowLeft, Waves, Circle, Sprout, Wind } from 'lucide-react'
import { corpoPianta } from '../components/Pianta.jsx'
import { rng } from '../garden.js'

// Il giardino zen.
//
// Qui non c'e' niente da curare e niente che muore: nessuna sete, nessuna
// erbaccia, nessun cartellino che ti dice cosa hai trascurato. Si rastrella la
// sabbia con il dito, si spostano i sassi, e basta. Il senso e' il gesto, non
// il risultato: e' l'unica parte dell'app dove non stai facendo niente di
// utile, ed e' esattamente il punto.

const W = 1000, H = 760          // il campo, in coordinate sue
const DENTI = 5                  // quanti solchi lascia il rastrello
const PASSO = 15                 // quanto sono distanti
const MAX_TRATTI = 44            // oltre, i piu' vecchi si perdono nella sabbia

const SASSI = [
  { k: 'tondo', d: 'M0 0 m-40 0 a40 34 0 1 0 80 0 a40 34 0 1 0 -80 0' },
  { k: 'alto', d: 'M-22 30 C -34 4, -26 -30, -4 -32 C 20 -34, 32 -6, 26 22 C 22 34, -8 40, -22 30 Z' },
  { k: 'piatto', d: 'M-46 8 C -40 -12, -12 -20, 14 -16 C 40 -12, 50 2, 44 14 C 36 28, -34 30, -46 8 Z' },
]

const VERDI = [
  { k: 'felce', nome: 'Felce' },
  { k: 'basilico', nome: 'Cespuglio' },
  { k: 'lavanda', nome: 'Lavanda' },
]

const ATTREZZI = [
  { k: 'rastrello', label: 'Rastrella', Icona: Waves },
  { k: 'sassi', label: 'Sassi', Icona: Circle },
  { k: 'verde', label: 'Verde', Icona: Sprout },
  { k: 'liscia', label: 'Liscia', Icona: Wind },
]

export default function Zen({ app }) {
  const { p, setS, setP, flash } = app
  const zen = p.zen || { tratti: [], sassi: [], piante: [] }

  const box = useRef(null)
  const cv = useRef(null)
  const [attrezzo, setAttrezzo] = useState('rastrello')
  const [trascina, setTrascina] = useState(null)   // {tipo, id} mentre sposti
  const tratto = useRef(null)

  // Sempre a partire dallo stato corrente, mai da una copia catturata prima:
  // due gesti rapidi di fila si sovrascrivevano a vicenda.
  const salva = fn => setP(prev => {
    const base = prev.zen || { tratti: [], sassi: [], piante: [] }
    return { zen: { ...base, ...fn(base) } }
  })

  // --- Disegno della sabbia ---------------------------------------------
  const ridisegna = () => {
    const c = cv.current
    if (!c) return
    const ctx = c.getContext('2d')
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const larg = c.clientWidth, alt = c.clientHeight
    if (c.width !== larg * dpr) { c.width = larg * dpr; c.height = alt * dpr }
    ctx.setTransform(dpr * larg / W, 0, 0, dpr * alt / H, 0, 0)
    ctx.clearRect(0, 0, W, H)

    // La sabbia
    const g = ctx.createLinearGradient(0, 0, 0, H)
    g.addColorStop(0, '#efe2ca')
    g.addColorStop(1, '#e2d2b6')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)

    // Granelli fissi, sempre gli stessi
    const rg = rng('sabbia')
    ctx.fillStyle = 'rgba(120,100,72,.13)'
    for (let i = 0; i < 900; i++) ctx.fillRect(rg() * W, rg() * H, 1.6, 1.6)

    // Le onde attorno ai sassi: si formano da sole, come nella ghiaia vera
    zen.sassi.forEach(s => {
      for (let i = 1; i <= 3; i++) {
        cerchio(ctx, s.x, s.y, (s.r || 44) + i * 17, (s.r || 44) * 0.8 + i * 15)
      }
    })

    // I tuoi solchi
    zen.tratti.forEach(t => solco(ctx, t))
  }

  const cerchio = (ctx, x, y, rx, ry) => {
    ctx.beginPath(); ctx.ellipse(x, y + 3, rx, ry, 0, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(255,250,238,.75)'; ctx.lineWidth = 3.4; ctx.stroke()
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(150,126,92,.35)'; ctx.lineWidth = 2.6; ctx.stroke()
  }

  // Un tratto: cinque solchi paralleli, scavati e con la loro luce sopra.
  const solco = (ctx, punti) => {
    if (punti.length < 4) return
    for (let d = 0; d < DENTI; d++) {
      const off = (d - (DENTI - 1) / 2) * PASSO
      for (const [colore, dy, largh] of [['rgba(154,127,90,.52)', 0, 5.6], ['rgba(255,252,243,.85)', -3.4, 3.6]]) {
        ctx.beginPath()
        for (let i = 0; i < punti.length; i += 2) {
          const x0 = punti[i], y0 = punti[i + 1]
          // La direzione si prende dal punto prima e da quello dopo. Usando
          // solo il successivo, all'ultimo punto non c'era piu' direzione e i
          // denti si chiudevano a punta di freccia.
          const a = Math.max(0, i - 2)
          const b = Math.min(punti.length - 2, i + 2)
          const nx = -(punti[b + 1] - punti[a + 1]), ny = punti[b] - punti[a]
          const len = Math.hypot(nx, ny) || 1
          const px = x0 + (nx / len) * off
          const py = y0 + (ny / len) * off + dy
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py)
        }
        ctx.strokeStyle = colore; ctx.lineWidth = largh
        ctx.lineCap = 'round'; ctx.lineJoin = 'round'
        ctx.stroke()
      }
    }
  }

  useLayoutEffect(ridisegna)
  useEffect(() => {
    const r = () => ridisegna()
    window.addEventListener('resize', r)
    return () => window.removeEventListener('resize', r)
  })

  // --- Il dito -----------------------------------------------------------
  const dove = e => {
    const b = box.current.getBoundingClientRect()
    return [((e.clientX - b.left) / b.width) * W, ((e.clientY - b.top) / b.height) * H]
  }

  const vicino = (lista, x, y, raggio) =>
    [...lista].reverse().find(o => Math.hypot(o.x - x, o.y - y) < raggio)

  const giu = e => {
    const [x, y] = dove(e)
    box.current.setPointerCapture(e.pointerId)

    if (attrezzo === 'sassi') {
      const s = vicino(zen.sassi, x, y, 70)
      if (s) return setTrascina({ tipo: 'sasso', id: s.id })
      const r = rng('sasso' + Date.now())
      const nuovo = {
        id: `s-${Date.now()}`, x, y,
        r: 34 + r() * 22, rot: r() * 360 - 180,
        forma: SASSI[Math.floor(r() * SASSI.length)].k,
        tinta: Math.floor(r() * 3),
      }
      salva(z => ({ sassi: [...z.sassi, nuovo] }))
      return setTrascina({ tipo: 'sasso', id: nuovo.id })
    }

    if (attrezzo === 'verde') {
      const v = vicino(zen.piante, x, y, 70)
      if (v) return setTrascina({ tipo: 'pianta', id: v.id })
      const r = rng('verde' + Date.now())
      const specie = VERDI[Math.floor(r() * VERDI.length)].k
      const nuova = { id: `z-${Date.now()}`, x, y, specie, natoIl: Date.now() }
      salva(z => ({ piante: [...z.piante, nuova] }))
      return setTrascina({ tipo: 'pianta', id: nuova.id })
    }

    if (attrezzo === 'liscia') return

    tratto.current = [Math.round(x), Math.round(y)]
  }

  const muovi = e => {
    if (trascina) {
      const [x, y] = dove(e)
      const campo = trascina.tipo === 'sasso' ? 'sassi' : 'piante'
      salva(z => ({ [campo]: z[campo].map(o => (o.id === trascina.id ? { ...o, x, y } : o)) }))
      return
    }
    if (!tratto.current) return
    const [x, y] = dove(e)
    const n = tratto.current.length
    // Un punto ogni tanto: bastano per una curva morbida, e pesano poco.
    if (Math.hypot(x - tratto.current[n - 2], y - tratto.current[n - 1]) < 16) return
    tratto.current.push(Math.round(x), Math.round(y))
    const ctx = cv.current.getContext('2d')
    ridisegna()
    solco(ctx, tratto.current)
  }

  const su = () => {
    if (trascina) return setTrascina(null)
    const t = tratto.current
    tratto.current = null
    if (!t || t.length < 6) return
    salva(z => ({ tratti: [...z.tratti, t].slice(-MAX_TRATTI) }))
  }

  const liscia = () => {
    if (!zen.tratti.length) return flash('La sabbia è già liscia.')
    salva(() => ({ tratti: [] }))
    flash('Sabbia liscia. Puoi ricominciare.')
  }

  const togli = (campo, id) => salva(z => ({ [campo]: z[campo].filter(o => o.id !== id) }))

  const tinteSasso = [['#b9b1a4', '#9a9184'], ['#a9a5a0', '#8b867f'], ['#c2b3a0', '#a3937f']]

  return (
    <div className="screen">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 48, marginBottom: 8 }}>
        <button className="btn-back" onClick={() => setS({ screen: 'oggi' })} aria-label="Indietro">
          <ArrowLeft size={18} strokeWidth={2.75} />
        </button>
        <div className="kicker">Il giardino</div>
      </div>

      <div style={{ padding: '4px 0 14px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, lineHeight: 1.12, margin: 0 }}>
          Passa il dito sulla sabbia
        </h1>
        <div className="meta" style={{ marginTop: 7, lineHeight: 1.5 }}>
          Non c’è niente da finire e niente da curare. Rastrella, sposta un sasso,
          liscia tutto e ricomincia. Il senso è il gesto.
        </div>
      </div>

      <div
        className="zen-box" ref={box}
        onPointerDown={giu} onPointerMove={muovi} onPointerUp={su} onPointerCancel={su}
        style={{ touchAction: 'none', cursor: attrezzo === 'liscia' ? 'default' : 'crosshair' }}
      >
        <canvas ref={cv} className="zen-sabbia" />

        <svg className="zen-cose" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
          {zen.sassi.map(s => {
            const forma = SASSI.find(f => f.k === s.forma) || SASSI[0]
            const [chiaro, scuro] = tinteSasso[s.tinta || 0]
            const sc = (s.r || 44) / 40
            return (
              <g key={s.id} transform={`translate(${s.x} ${s.y}) rotate(${s.rot || 0}) scale(${sc})`}>
                <ellipse cx="4" cy="16" rx="42" ry="12" fill="rgba(90,74,52,.20)" />
                <path d={forma.d} fill={scuro} />
                <path d={forma.d} fill={chiaro} transform="translate(-2 -4) scale(.94)" />
              </g>
            )
          })}

          {zen.piante.map(v => {
            // Crescono da sole, piano, e non chiedono niente a nessuno.
            const giorni = (Date.now() - v.natoIl) / 86400000
            const finta = { id: v.id, specie: v.specie, cresciuta: Math.min(10, 4.2 + giorni * 0.85), ultimaAcqua: Date.now() }
            return (
              <g key={v.id} transform={`translate(${v.x} ${v.y}) scale(1.7) translate(-50 -74)`}>
                <ellipse cx="50" cy="75" rx="20" ry="4.5" fill="rgba(90,74,52,.18)" />
                <g className="dondola" style={{ animationDuration: '6s', animationDelay: `-${(v.x % 5)}s`, transformOrigin: '50px 74px' }}>
                  {corpoPianta(finta, { conVaso: false })}
                </g>
              </g>
            )
          })}
        </svg>
      </div>

      <div className="attrezzi">
        {ATTREZZI.map(({ k, label, Icona }) => (
          <button
            key={k}
            className={`attrezzo${attrezzo === k ? ' preso' : ''}`}
            onClick={() => (k === 'liscia' ? liscia() : setAttrezzo(k))}
            aria-pressed={attrezzo === k}
          >
            <Icona size={17} strokeWidth={2.75} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="fineprint" style={{ lineHeight: 1.5, padding: '10px 8px 0' }}>
        {attrezzo === 'rastrello' && 'Trascina il dito: la sabbia si apre in cinque solchi. Attorno ai sassi le onde si formano da sole.'}
        {attrezzo === 'sassi' && 'Tocca la sabbia per posare un sasso, o trascinane uno per spostarlo. Tocca due volte un sasso per toglierlo.'}
        {attrezzo === 'verde' && 'Tocca per far crescere qualcosa. Cresce da sé nei giorni, senza che tu debba curarla.'}
      </div>

      {(zen.sassi.length > 0 || zen.piante.length > 0) && attrezzo !== 'rastrello' && (
        <div className="zen-elenco">
          {attrezzo === 'sassi' && zen.sassi.map((s, i) => (
            <button key={s.id} className="chip" onClick={() => togli('sassi', s.id)}>
              togli sasso {i + 1}
            </button>
          ))}
          {attrezzo === 'verde' && zen.piante.map((v, i) => (
            <button key={v.id} className="chip" onClick={() => togli('piante', v.id)}>
              togli {VERDI.find(x => x.k === v.specie)?.nome.toLowerCase() || 'pianta'} {i + 1}
            </button>
          ))}
        </div>
      )}

      <div className="fineprint" style={{ lineHeight: 1.5, padding: '12px 8px 0' }}>
        Quello che disegni resta com’è finché non lo cambi tu. Nessuna pianta ha sete,
        niente appassisce, niente ti aspetta. È l’unico posto dell’app dove non c’è
        proprio niente da fare.
      </div>
    </div>
  )
}
