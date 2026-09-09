import { useState } from 'react'
import { ArrowLeft, Droplet, Scissors, Trash2 } from 'lucide-react'
import Pianta from '../components/Pianta.jsx'
import { SPECIE, specie, stadio, comeSta, giorniSenzAcqua, crescita } from '../garden.js'

const VASI = 6

const daQuando = ts => {
  const g = Math.floor((Date.now() - ts) / 86400000)
  if (g <= 0) return 'da oggi'
  if (g === 1) return 'da ieri'
  return `da ${g} giorni`
}

export default function Giardino({ app }) {
  const { p, setS, piantaNuova, innaffia, pota, estirpa, rinomina, innaffiaTutte } = app
  const [aperta, setAperta] = useState(null)   // id della pianta aperta
  const [scelta, setScelta] = useState(false)  // sto scegliendo cosa piantare
  const [nome, setNome] = useState('')

  const giardino = p.garden || []
  const sete = giardino.filter(x => comeSta(x).tono !== 'bene')
  const viva = giardino.find(x => x.id === aperta)

  const chiudi = () => { setAperta(null); setScelta(false); setNome('') }

  return (
    <div className="screen">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 48, marginBottom: 8 }}>
        <button className="btn-back" onClick={() => setS({ screen: 'oggi' })} aria-label="Indietro">
          <ArrowLeft size={18} strokeWidth={2.75} />
        </button>
        <div className="kicker">Il tuo giardino</div>
      </div>

      <div style={{ padding: '4px 0 18px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 27, lineHeight: 1.1, margin: 0 }}>
          {giardino.length === 0 ? 'Un posto vuoto' : sete.length ? 'C’è qualcosa da fare' : 'Va tutto bene'}
        </h1>
        <div className="meta" style={{ marginTop: 8, lineHeight: 1.55 }}>
          {giardino.length === 0
            ? 'Sei vasi, e niente dentro. Pianta qualcosa: crescerà nei giorni veri, piano, mentre fai altro.'
            : sete.length
              ? `${sete.length === 1 ? 'Una pianta ha' : `${sete.length} piante hanno`} bisogno di te. Non è urgente: qui non muore niente.`
              : 'Le tue piante stanno bene. Non devi fare niente — puoi anche solo guardarle.'}
        </div>
      </div>

      <div className="stack">
        {sete.length > 1 && (
          <button className="btn-light" style={{ minHeight: 48, gap: 8 }} onClick={innaffiaTutte}>
            <Droplet size={16} strokeWidth={2.75} /> Innaffia tutte
          </button>
        )}

        <div className="orto">
          {Array.from({ length: VASI }).map((_, i) => {
            const pl = giardino[i]
            if (!pl) {
              return (
                <button key={`vuoto${i}`} className="vaso vuoto" onClick={() => setScelta(true)}>
                  <span className="vaso-piu">+</span>
                  <span className="vaso-testo">Pianta qualcosa</span>
                </button>
              )
            }
            const st = comeSta(pl)
            const sp = specie(pl.specie)
            return (
              <button key={pl.id} className="vaso" onClick={() => setAperta(pl.id)}>
                <Pianta pianta={pl} size={104} />
                <span className="vaso-nome">{pl.nome || sp.nome}</span>
                <span className={`vaso-stato ${st.tono}`}>
                  {st.tono === 'bene' ? stadio(pl).label.toLowerCase() : st.testo}
                </span>
              </button>
            )
          })}
        </div>

        <div className="fineprint" style={{ lineHeight: 1.5, padding: '0 8px' }}>
          Le piante crescono con i giorni veri, non con i tocchi: tornare cento volte
          oggi non le fa crescere di più. Se le dimentichi rallentano e fanno qualche
          foglia secca, ma non muore niente e non ti sgrido. Riprendono da dove erano.
        </div>
      </div>

      {/* --- Scegli cosa piantare --- */}
      {scelta && (
        <div className="foglio" role="dialog" aria-label="Scegli cosa piantare">
          <div className="foglio-carta">
            <div className="h-card" style={{ marginBottom: 4 }}>Cosa pianti?</div>
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
                <button
                  key={sp.k} className="specie-row"
                  onClick={() => { piantaNuova(sp.k, nome); chiudi() }}
                >
                  <Pianta pianta={{ specie: sp.k, cresciuta: 7, ultimaAcqua: Date.now() }} size={54} />
                  <span style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                    <span style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: 16 }}>{sp.nome}</span>
                    <span style={{ display: 'block', fontSize: 12, color: 'var(--muted)', lineHeight: 1.45, marginTop: 2 }}>
                      {sp.nota}
                    </span>
                    <span style={{ display: 'block', fontSize: 11.5, color: 'var(--sage-700)', marginTop: 4 }}>
                      acqua ogni {sp.sete} giorni
                    </span>
                  </span>
                </button>
              ))}
            </div>
            <button className="btn-outline" style={{ minHeight: 48, marginTop: 14 }} onClick={chiudi}>
              Lascia stare
            </button>
          </div>
        </div>
      )}

      {/* --- Una pianta da vicino --- */}
      {viva && (
        <div className="foglio" role="dialog" aria-label="La tua pianta">
          <div className="foglio-carta">
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 }}>
              <Pianta pianta={viva} size={92} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <input
                  className="nome-pianta"
                  value={viva.nome} onChange={e => rinomina(viva.id, e.target.value)}
                  placeholder={specie(viva.specie).nome} maxLength={20} aria-label="Nome della pianta"
                />
                <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 4, lineHeight: 1.5 }}>
                  {specie(viva.specie).nome} · {stadio(viva).label.toLowerCase()}
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.5 }}>
                  piantata {daQuando(viva.piantataIl)}
                </div>
              </div>
            </div>

            <div className="crescita-barra" aria-hidden="true">
              <span style={{ width: `${Math.round(crescita(viva) * 100)}%` }} />
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)', margin: '8px 0 16px', lineHeight: 1.5 }}>
              {comeSta(viva).testo}{' '}
              {giorniSenzAcqua(viva) < 1 ? 'Innaffiata oggi.' : `Ultima acqua ${daQuando(viva.ultimaAcqua)}.`}
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

            {!viva.foglieSecche && (
              <div className="fineprint" style={{ marginTop: 10, lineHeight: 1.45 }}>
                Non c’è niente da potare: si pota solo quando ci sono foglie secche.
              </div>
            )}

            <button className="btn-outline" style={{ minHeight: 48, marginTop: 14 }} onClick={chiudi}>
              Chiudi
            </button>
            <button
              className="step-link" style={{ color: 'rgba(32,30,29,.45)', marginTop: 6, gap: 6 }}
              onClick={() => { estirpa(viva.id); chiudi() }}
            >
              <Trash2 size={13} strokeWidth={2.75} /> Togli dal vaso
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
