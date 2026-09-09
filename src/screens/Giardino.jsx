import { useState } from 'react'
import { ArrowLeft, Droplet, Scissors, Trash2, Sprout, Hand } from 'lucide-react'
import Pianta from '../components/Pianta.jsx'
import Orto, { momento } from '../components/Orto.jsx'
import { SPECIE, specie, stadio, comeSta, giorniSenzAcqua, crescita, MAX_ERBACCE } from '../garden.js'

const MAX_PIANTE = 8

const ATTREZZI = [
  { k: 'acqua', label: 'Innaffia', Icona: Droplet },
  { k: 'forbici', label: 'Pota', Icona: Scissors },
  { k: 'mano', label: 'Strappa', Icona: Hand },
  { k: 'semina', label: 'Semina', Icona: Sprout },
]

const SALUTO = {
  alba: 'L’orto si sta svegliando.',
  giorno: 'C’è luce piena.',
  tramonto: 'Il sole sta scendendo.',
  notte: 'È notte, e l’orto dorme.',
}

const daQuando = ts => {
  const g = Math.floor((Date.now() - ts) / 86400000)
  if (g <= 0) return 'da oggi'
  if (g === 1) return 'da ieri'
  return `da ${g} giorni`
}

export default function Giardino({ app }) {
  const { p, setS, piantaNuova, innaffia, pota, estirpa, rinomina, strappa, ortoNotizie } = app
  const [attrezzo, setAttrezzo] = useState('acqua')
  const [aperta, setAperta] = useState(null)
  const [scelta, setScelta] = useState(false)
  const [nome, setNome] = useState('')

  const giardino = p.garden || []
  const erbacce = p.erbacce || []
  const viva = giardino.find(x => x.id === aperta)
  const daFare = giardino.filter(x => comeSta(x).tono !== 'bene').length + erbacce.length
  const mom = momento(new Date().getHours())

  const chiudi = () => { setAperta(null); setScelta(false); setNome('') }

  // Un tocco su una pianta fa quello che dice l'attrezzo in mano. Se non c'e'
  // niente da fare con quell'attrezzo, apre la scheda invece di non fare nulla.
  const toccaPianta = id => {
    const pl = giardino.find(x => x.id === id)
    if (!pl) return
    if (attrezzo === 'acqua') return innaffia(id)
    if (attrezzo === 'forbici' && pl.foglieSecche) return pota(id)
    setAperta(id)
  }

  const toccaErbaccia = id => {
    if (attrezzo === 'mano') return strappa(id)
    setAttrezzo('mano')
  }

  const toccaTerra = () => {
    if (attrezzo === 'semina' && giardino.length < MAX_PIANTE) setScelta(true)
  }

  return (
    <div className="screen">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 48, marginBottom: 8 }}>
        <button className="btn-back" onClick={() => setS({ screen: 'oggi' })} aria-label="Indietro">
          <ArrowLeft size={18} strokeWidth={2.75} />
        </button>
        <div className="kicker">Il tuo orto</div>
      </div>

      <div style={{ padding: '4px 0 14px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, lineHeight: 1.12, margin: 0 }}>
          {giardino.length === 0 ? 'Terra buona, e niente dentro' : daFare ? 'C’è qualcosa da fare' : SALUTO[mom]}
        </h1>
        <div className="meta" style={{ marginTop: 7, lineHeight: 1.5 }}>
          {giardino.length === 0
            ? 'Prendi la paletta e semina dove ti va. Crescerà nei giorni veri, piano, mentre fai altro.'
            : daFare
              ? 'Niente di urgente: qui non muore niente. Guarda i segni sopra le piante.'
              : 'Va tutto bene. Puoi anche solo guardarlo.'}
        </div>
      </div>

      {ortoNotizie && (
        <div className="card sand" style={{ fontSize: 13.5, lineHeight: 1.55, marginBottom: 12 }}>
          {ortoNotizie}
        </div>
      )}

      <Orto
        giardino={giardino} erbacce={erbacce} attrezzo={attrezzo}
        onPianta={toccaPianta} onErbaccia={toccaErbaccia} onTerra={toccaTerra}
      />

      <div className="attrezzi">
        {ATTREZZI.map(({ k, label, Icona }) => {
          const on = attrezzo === k
          const spento = (k === 'semina' && giardino.length >= MAX_PIANTE) || (k === 'mano' && erbacce.length === 0)
          return (
            <button
              key={k} className={`attrezzo${on ? ' preso' : ''}`}
              onClick={() => setAttrezzo(k)} disabled={spento} aria-pressed={on}
            >
              <Icona size={17} strokeWidth={2.75} />
              <span>{label}</span>
            </button>
          )
        })}
      </div>

      <div className="fineprint" style={{ lineHeight: 1.5, padding: '10px 8px 0' }}>
        {attrezzo === 'acqua' && 'Tocca una pianta per innaffiarla. Quando piove, si innaffiano da sole.'}
        {attrezzo === 'forbici' && 'Tocca una pianta con le foglie secche per potarla.'}
        {attrezzo === 'mano' && (erbacce.length ? 'Tocca un’erbaccia per strapparla.' : 'Non ci sono erbacce. Torneranno.')}
        {attrezzo === 'semina' && (giardino.length >= MAX_PIANTE ? 'L’aiuola è piena.' : 'Tocca la terra dove vuoi seminare.')}
      </div>

      <div className="fineprint" style={{ lineHeight: 1.5, padding: '10px 8px 0' }}>
        L’orto vive con i giorni veri, non con i tocchi. Il cielo segue l’ora che è
        adesso da te. Se lo lasci solo, rallenta e si riempie di erbacce — ma non
        muore niente, e quando torni riparte da dov’era.
      </div>

      {/* --- Cosa semini --- */}
      {scelta && (
        <div className="foglio" role="dialog" aria-label="Scegli cosa seminare">
          <div className="foglio-carta">
            <div className="h-card" style={{ marginBottom: 4 }}>Cosa semini?</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 14, lineHeight: 1.5 }}>
              Hanno caratteri diversi: c’è chi ha sete ogni due giorni e chi si arrangia da solo per settimane.
            </div>
            <input
              className="apikey-input" style={{ marginBottom: 12 }}
              value={nome} onChange={e => setNome(e.target.value)}
              placeholder="Un nome, se ti va (facoltativo)" maxLength={20} aria-label="Nome della pianta"
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {SPECIE.map(sp => (
                <button key={sp.k} className="specie-row" onClick={() => { piantaNuova(sp.k, nome); chiudi() }}>
                  <Pianta pianta={{ id: `anteprima-${sp.k}`, specie: sp.k, cresciuta: 8, ultimaAcqua: Date.now() }} size={54} conVaso={false} />
                  <span style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                    <span style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: 16 }}>{sp.nome}</span>
                    <span style={{ display: 'block', fontSize: 12, color: 'var(--muted)', lineHeight: 1.45, marginTop: 2 }}>{sp.nota}</span>
                    <span style={{ display: 'block', fontSize: 11.5, color: 'var(--sage-700)', marginTop: 4 }}>acqua ogni {sp.sete} giorni</span>
                  </span>
                </button>
              ))}
            </div>
            <button className="btn-outline" style={{ minHeight: 48, marginTop: 14 }} onClick={chiudi}>Lascia stare</button>
          </div>
        </div>
      )}

      {/* --- Una pianta da vicino --- */}
      {viva && (
        <div className="foglio" role="dialog" aria-label="La tua pianta">
          <div className="foglio-carta">
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 }}>
              <Pianta pianta={viva} size={92} conVaso={false} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <input
                  className="nome-pianta" value={viva.nome}
                  onChange={e => rinomina(viva.id, e.target.value)}
                  placeholder={specie(viva.specie).nome} maxLength={20} aria-label="Nome della pianta"
                />
                <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 4, lineHeight: 1.5 }}>
                  {specie(viva.specie).nome} · {stadio(viva).label.toLowerCase()}
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.5 }}>
                  seminata {daQuando(viva.piantataIl)}
                </div>
              </div>
            </div>

            <div className="crescita-barra" aria-hidden="true">
              <span style={{ width: `${Math.round(crescita(viva) * 100)}%` }} />
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)', margin: '8px 0 16px', lineHeight: 1.5 }}>
              {comeSta(viva).testo}{' '}
              {giorniSenzAcqua(viva) < 1 ? 'Ha bevuto oggi.' : `Ultima acqua ${daQuando(viva.ultimaAcqua)}.`}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-primary" style={{ flex: 1, width: 'auto', minHeight: 48, fontSize: 15, gap: 8 }}
                onClick={() => innaffia(viva.id)}>
                <Droplet size={15} strokeWidth={2.75} /> Innaffia
              </button>
              <button className="btn-outline" style={{ minHeight: 48, gap: 8 }}
                onClick={() => pota(viva.id)} disabled={!viva.foglieSecche}>
                <Scissors size={15} strokeWidth={2.75} /> Pota
              </button>
            </div>

            <button className="btn-outline" style={{ minHeight: 48, marginTop: 14 }} onClick={chiudi}>Chiudi</button>
            <button className="step-link" style={{ color: 'rgba(32,30,29,.45)', marginTop: 6, gap: 6 }}
              onClick={() => { estirpa(viva.id); chiudi() }}>
              <Trash2 size={13} strokeWidth={2.75} /> Togli dall’aiuola
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
