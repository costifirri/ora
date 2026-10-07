import { useEffect, useState } from 'react'
import { ArrowLeft, Pause, Play, ChevronRight, ChevronLeft, Check } from 'lucide-react'
import { sequenza } from '../yoga.js'

// Una sequenza, guidata.
//
// Il motivo per cui lo yoga sta qui dentro e non su un video: il timer scorre
// da solo e tu non devi guardare lo schermo. Ogni posizione dice anche come si
// fa, perche' sapere il nome non serve a niente se non sai dove mettere le
// mani.

const mmss = s => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`

export default function Yoga({ app }) {
  const { s, setS, markDone, flash } = app
  const seq = sequenza(s.yogaK)
  const [i, setI] = useState(0)
  const [resta, setResta] = useState(seq?.posizioni[0]?.sec || 0)
  const [va, setVa] = useState(false)
  const [finita, setFinita] = useState(false)

  const ultima = seq ? i + 1 >= seq.posizioni.length : false

  // La chiusura e' uno stato, non un flag dentro una ref: con la ref l'indice
  // restava uguale, React non rinfrescava niente e dall'ultima posizione non
  // si usciva piu'.
  useEffect(() => {
    if (!finita) return
    setVa(false)
    markDone('move')
    flash('Fatta. Il corpo se ne ricorda più di quanto pensi.')
    setS({ screen: 'calma', yogaK: null })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finita])

  useEffect(() => {
    if (!va || !seq || finita) return
    const t = setInterval(() => {
      setResta(r => {
        if (r > 1) return r - 1
        if (i + 1 >= seq.posizioni.length) setFinita(true)
        else setI(idx => idx + 1)
        return 0
      })
    }, 1000)
    return () => clearInterval(t)
  }, [va, seq, i, finita])

  // Cambiata posizione: riparte il conto della nuova.
  useEffect(() => {
    if (seq && !finita) setResta(seq.posizioni[i].sec)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i])

  if (!seq) return null
  const pos = seq.posizioni[i]
  const quanteRestano = seq.posizioni.slice(i).reduce((a, p) => a + p.sec, 0) - (pos.sec - resta)

  return (
    <div className="screen dark full">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 48 }}>
        <button className="btn-back" onClick={() => setS({ screen: 'calma', yogaK: null })} aria-label="Esci">
          <ArrowLeft size={18} strokeWidth={2.75} />
        </button>
        <div className="kicker" style={{ color: 'rgba(249,244,237,.6)' }}>{seq.nome}</div>
      </div>

      <div style={{ display: 'flex', gap: 4, marginTop: 14 }}>
        {seq.posizioni.map((_, n) => (
          <span key={n} className="seg" style={{ background: n <= i ? 'var(--sage-200)' : 'rgba(249,244,237,.2)' }} />
        ))}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16, padding: '20px 0' }}>
        <div style={{ fontSize: 12.5, color: 'rgba(249,244,237,.5)', letterSpacing: '.08em', textTransform: 'uppercase' }}>
          {i + 1} di {seq.posizioni.length}
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 30, lineHeight: 1.12, margin: 0 }}>{pos.nome}</h2>
        <div style={{ fontSize: 15.5, color: 'rgba(249,244,237,.78)', lineHeight: 1.6 }}>{pos.come}</div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 8 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 46, lineHeight: 1 }}>{mmss(resta)}</span>
          <span style={{ fontSize: 13, color: 'rgba(249,244,237,.45)' }}>
            {mmss(Math.max(0, quanteRestano))} alla fine
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <button
          className="btn-back" style={{ borderColor: 'rgba(249,244,237,.25)', color: 'var(--surface)' }}
          onClick={() => setI(n => Math.max(0, n - 1))} disabled={i === 0} aria-label="Posizione prima"
        >
          <ChevronLeft size={18} strokeWidth={2.75} />
        </button>
        <button className="btn-sera" style={{ flex: 1 }} onClick={() => setVa(v => !v)}>
          {va ? <><Pause size={16} strokeWidth={2.75} /> Pausa</> : <><Play size={16} strokeWidth={2.75} /> {resta === pos.sec ? 'Comincia' : 'Riprendi'}</>}
        </button>
        <button
          className="btn-back" style={{ borderColor: 'rgba(249,244,237,.25)', color: 'var(--surface)' }}
          onClick={() => (ultima ? setFinita(true) : setI(n => n + 1))}
          aria-label={ultima ? 'Ho finito' : 'Posizione dopo'}
        >
          {ultima ? <Check size={18} strokeWidth={2.75} /> : <ChevronRight size={18} strokeWidth={2.75} />}
        </button>
      </div>
      <div style={{ textAlign: 'center', fontSize: 12, color: 'rgba(249,244,237,.45)', marginTop: 12 }}>
        Il tempo è un suggerimento. Se stai bene dove sei, resta di più.
      </div>
    </div>
  )
}
