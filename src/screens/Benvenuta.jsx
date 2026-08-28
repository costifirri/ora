import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { SEGNI, DAILY_KINDS } from '../data.js'

// La presentazione: si fa una volta, all'inizio, e serve a due cose insieme —
// dare a Ora qualcosa su cui appoggiarsi quando parla, e far vedere a chi arriva
// dove stanno le cose. Ogni passo si può saltare: quello che non dici adesso
// resta scrivibile dal Profilo, e Ora impara comunque strada facendo.

const VOCI = [
  'Diretta, senza giri',
  'Dolce, con calma',
  'Poche parole',
  'Con più domande che risposte',
]

export default function Benvenuta({ app }) {
  const { p, setP, finishOnboarding, name } = app
  const [i, setI] = useState(0)

  const set = (k, v) => setP(prev => ({ profile: { ...prev.profile, [k]: v } }))
  const setSet = (k, v) => setP(prev => ({ settings: { ...prev.settings, [k]: v } }))
  const dailyKinds = p.settings.dailyKinds || []

  const toggleKind = k => setSet('dailyKinds', dailyKinds.includes(k)
    ? dailyKinds.filter(x => x !== k)
    : [...dailyKinds, k])

  const PASSI = [
    {
      titolo: name ? `Ciao ${name}.` : 'Ciao.',
      sotto: 'Sono Ora. Prima di cominciare ti faccio quattro domande su di te: servono a farmi parlare come se ti conoscessi, invece che a caso. Ci vogliono due minuti e puoi saltare tutto.',
      corpo: (
        <div className="card sage" style={{ lineHeight: 1.6, fontSize: 14.5 }}>
          Quello che scrivi qui resta tuo. Lo rileggi, lo correggi o lo cancelli quando vuoi,
          dal <strong>Profilo</strong>. Non c'è niente che io tenga e tu non possa vedere.
        </div>
      ),
      avanti: 'Cominciamo',
    },
    {
      titolo: 'Come vuoi che ti parli?',
      sotto: 'Non è una domanda di forma: cambia davvero il modo in cui ti rispondo.',
      corpo: (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {VOCI.map(v => {
              const on = p.profile.voce === v
              return (
                <button
                  key={v} className="chip"
                  style={{
                    minHeight: 38, padding: '6px 14px', fontSize: 13,
                    background: on ? 'var(--sage-500)' : 'var(--surface)',
                    color: on ? 'var(--surface)' : 'var(--text)',
                    borderColor: on ? 'var(--sage-500)' : 'rgba(32,30,29,.18)',
                  }}
                  onClick={() => set('voce', on ? '' : v)}
                >
                  {v}
                </button>
              )
            })}
          </div>
          <textarea
            className="textarea" style={{ minHeight: 70 }}
            value={p.profile.voce} onChange={e => set('voce', e.target.value)}
            placeholder="Oppure dimmelo a modo tuo"
            aria-label="Come vuoi che ti parli"
          />
        </>
      ),
    },
    {
      titolo: 'Di cosa ti occupi?',
      sotto: 'Come sono fatte le tue giornate, e a che ritmo le vivi. Bastano due righe.',
      corpo: (
        <>
          <textarea
            className="textarea" style={{ minHeight: 84, marginBottom: 10 }}
            value={p.profile.lavoro} onChange={e => set('lavoro', e.target.value)}
            placeholder="Lavoro, studio, chi ho intorno tutto il giorno…"
            aria-label="Di cosa ti occupi"
          />
          <textarea
            className="textarea" style={{ minHeight: 84 }}
            value={p.profile.ritmi} onChange={e => set('ritmi', e.target.value)}
            placeholder="A che ora mi sveglio, come dormo, quando sono al meglio…"
            aria-label="I tuoi ritmi"
          />
        </>
      ),
    },
    {
      titolo: 'Cosa ti pesa, e cosa ti rimette in asse?',
      sotto: 'È la parte che uso di più. Se me lo dici adesso, non devo indovinarlo per settimane.',
      corpo: (
        <>
          <textarea
            className="textarea" style={{ minHeight: 84, marginBottom: 10 }}
            value={p.profile.pesa} onChange={e => set('pesa', e.target.value)}
            placeholder="Le situazioni che mi mettono in difficoltà più spesso…"
            aria-label="Cosa ti pesa"
          />
          <textarea
            className="textarea" style={{ minHeight: 84 }}
            value={p.profile.bene} onChange={e => set('bene', e.target.value)}
            placeholder="Quello che so già che mi fa bene…"
            aria-label="Cosa ti fa bene"
          />
        </>
      ),
    },
    {
      titolo: 'Cosa vuoi trovare, ogni giorno?',
      sotto: 'Compare in home, una cosa sola al giorno. Puoi anche non volerne nessuna.',
      corpo: (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {DAILY_KINDS.map(k => {
              const on = dailyKinds.includes(k.k)
              return (
                <button
                  key={k.k} className="chip"
                  style={{
                    minHeight: 38, padding: '6px 14px', fontSize: 13,
                    background: on ? 'var(--sage-500)' : 'var(--surface)',
                    color: on ? 'var(--surface)' : 'var(--text)',
                    borderColor: on ? 'var(--sage-500)' : 'rgba(32,30,29,.18)',
                  }}
                  onClick={() => toggleKind(k.k)}
                >
                  {k.label}
                </button>
              )
            })}
          </div>
          {dailyKinds.includes('segno') && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(32,30,29,.5)', marginBottom: 8 }}>Il tuo segno</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {SEGNI.map(sg => {
                  const on = p.profile.segno === sg
                  return (
                    <button
                      key={sg} className="chip"
                      style={{
                        minHeight: 36, padding: '6px 12px', fontSize: 12.5,
                        background: on ? 'var(--sage-500)' : 'var(--surface)',
                        color: on ? 'var(--surface)' : 'var(--text)',
                        borderColor: on ? 'var(--sage-500)' : 'rgba(32,30,29,.18)',
                      }}
                      onClick={() => set('segno', on ? '' : sg)}
                    >
                      {sg}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </>
      ),
    },
    {
      titolo: 'Un ultimo passo: la chiave',
      sotto: 'Senza, l’app funziona tutta — tranne il parlare. Con la tua chiave ti rispondo davvero, invece che con frasi pronte.',
      corpo: (
        <>
          <div className="card sage" style={{ fontSize: 13.5, lineHeight: 1.6, marginBottom: 12 }}>
            <strong>Se non hai mai sentito parlare di chiavi</strong>, in due righe: è una specie di
            password personale che permette a Ora di parlare con Claude a nome tuo. Serve perché il
            conto delle risposte resti tuo, e non finisca a qualcun altro.
            <div style={{ marginTop: 10 }}>
              Non è un abbonamento: <strong>carichi un credito e si consuma solo quando Ora ti
              risponde</strong>. Il minimo che si può caricare è circa 5 dollari, ed è già parecchio —
              Ora usa apposta il modello più economico, e ogni risposta costa frazioni di centesimo.
              Per un uso quotidiano normale, quei cinque dollari durano mesi.
            </div>
            <div style={{ marginTop: 10 }}>
              Quando il credito finisce, Ora torna alle frasi pronte e basta. Non ti arriva nessun
              addebito a sorpresa: più di quello che hai caricato non può spendere.
            </div>
          </div>
          <div className="card sand" style={{ fontSize: 13.5, lineHeight: 1.6, marginBottom: 12 }}>
            <ol style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>Vai su <a href="https://console.anthropic.com" target="_blank" rel="noreferrer" style={{ color: 'var(--sage-700)' }}>console.anthropic.com</a> e iscriviti.</li>
              <li>In <strong>API Keys</strong> tocca <strong>Create Key</strong>.</li>
              <li>Copiala subito: viene mostrata una volta sola.</li>
              <li>In <strong>Billing</strong> carichi il credito, anche solo il minimo.</li>
            </ol>
          </div>
          <input
            className="apikey-input" type="password" autoComplete="off" spellCheck={false}
            value={p.settings.apiKey} onChange={e => setSet('apiKey', e.target.value.trim())}
            placeholder="Incolla qui la tua chiave" aria-label="La tua chiave API"
          />
          <div className="fineprint" style={{ marginTop: 10, lineHeight: 1.5 }}>
            La chiave resta su questo dispositivo: non la salvo insieme al resto e non la vede
            nessun altro. È legata al tuo account Anthropic, quindi paghi solo le tue conversazioni.
          </div>
        </>
      ),
      avanti: 'Ho finito',
    },
  ]

  const passo = PASSI[i]
  const ultimo = i === PASSI.length - 1
  const avanti = () => (ultimo ? finishOnboarding() : setI(i + 1))

  return (
    <div className="screen">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 48, marginBottom: 8 }}>
        {i > 0 ? (
          <button className="btn-back" onClick={() => setI(i - 1)} aria-label="Indietro">
            <ArrowLeft size={18} strokeWidth={2.75} />
          </button>
        ) : (
          <div style={{
            width: 40, height: 40, borderRadius: 999, background: 'var(--sage-500)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--surface)',
          }}>O</div>
        )}
        <div className="kicker">{i === 0 ? 'Benvenuta' : `${i} di ${PASSI.length - 1}`}</div>
      </div>

      <div style={{ padding: '4px 0 18px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 27, lineHeight: 1.1, margin: 0 }}>{passo.titolo}</h1>
        <div className="meta" style={{ marginTop: 8, lineHeight: 1.55 }}>{passo.sotto}</div>
      </div>

      <div className="stack">
        {passo.corpo}

        <button className="btn-primary" style={{ minHeight: 54, fontSize: 16 }} onClick={avanti}>
          {passo.avanti || 'Avanti'}
        </button>

        <button
          className="step-link" style={{ color: 'rgba(32,30,29,.5)' }}
          onClick={() => (i === 0 || ultimo ? finishOnboarding() : setI(i + 1))}
        >
          {i === 0 ? 'Salta la presentazione' : ultimo ? 'Salta, lo faccio dopo' : 'Salta questa'}
        </button>
      </div>
    </div>
  )
}
