import { useState } from 'react'
import { authError } from '../supabase.js'
import { signIn, signUp, resetPassword } from '../cloud.js'

export default function Auth({ onName }) {
  const [mode, setMode] = useState('in') // 'in' | 'up' | 'reset'
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [note, setNote] = useState(null)

  const submit = async e => {
    e.preventDefault()
    setBusy(true); setError(null); setNote(null)
    try {
      if (mode === 'reset') {
        await resetPassword(email)
        setNote('Ti ho mandato un’email per rifare la password.')
        setMode('in')
      } else if (mode === 'up') {
        // Il nome prima della registrazione: cosi' e' gia' nei dati quando
        // vengono spinti nel tuo spazio appena creato.
        onName(nome.trim())
        const dentro = await signUp(email, password)
        if (!dentro) {
          // Il progetto chiede la conferma via email: dirlo, invece di
          // lasciarla davanti a una schermata che non cambia.
          setNote('Ti ho mandato un’email di conferma. Aprila, poi torna qui e accedi.')
          setMode('in')
        }
      } else {
        await signIn(email, password)
      }
    } catch (err) {
      setError(authError(err.message))
    } finally {
      setBusy(false)
    }
  }

  const title = mode === 'up' ? 'Crea il tuo spazio' : mode === 'reset' ? 'Rifai la password' : 'Bentornata'
  const line = mode === 'up'
    ? 'Serve solo per ritrovare le tue cose su qualsiasi telefono. Nessuno le legge tranne te.'
    : mode === 'reset'
      ? 'Scrivi la tua email: ti mando il link per sceglierne una nuova.'
      : 'Riprendiamo da dove eri.'

  return (
    <div className="screen full" style={{ justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{
          width: 68, height: 68, borderRadius: 999, background: 'var(--sage-500)',
          margin: '0 auto 18px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontSize: 27, color: 'var(--surface)',
        }}>O</div>
        <h1 className="h-page" style={{ margin: 0 }}>{title}</h1>
        <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.55, marginTop: 10, maxWidth: 300, marginInline: 'auto' }}>
          {line}
        </div>
      </div>

      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {mode === 'up' && (
          <input
            className="apikey-input" type="text" autoComplete="given-name"
            value={nome} onChange={e => setNome(e.target.value)}
            placeholder="Come ti chiami" aria-label="Il tuo nome" required maxLength={30}
          />
        )}
        <input
          className="apikey-input" type="email" inputMode="email" autoComplete="email"
          value={email} onChange={e => setEmail(e.target.value)}
          placeholder="La tua email" aria-label="Email" required
        />
        {mode !== 'reset' && (
          <input
            className="apikey-input" type="password"
            autoComplete={mode === 'up' ? 'new-password' : 'current-password'}
            value={password} onChange={e => setPassword(e.target.value)}
            placeholder={mode === 'up' ? 'Scegli una password (almeno 6 caratteri)' : 'La tua password'}
            aria-label="Password" required minLength={6}
          />
        )}

        {error && (
          <div style={{ background: 'var(--terra-100)', border: '1px solid rgba(198,113,57,.4)', borderRadius: 20, padding: '12px 16px', fontSize: 13, lineHeight: 1.5, color: '#8c491a' }}>
            {error}
          </div>
        )}
        {note && (
          <div style={{ background: 'var(--sage-100)', borderRadius: 20, padding: '12px 16px', fontSize: 13, lineHeight: 1.5, color: 'var(--sage-700)' }}>
            {note}
          </div>
        )}

        <button className="btn-primary" style={{ minHeight: 54, fontSize: 16, marginTop: 4 }} disabled={busy}>
          {busy ? 'Un attimo…' : mode === 'up' ? 'Crea il mio spazio' : mode === 'reset' ? 'Mandami il link' : 'Entra'}
        </button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 18, alignItems: 'center' }}>
        {mode === 'in' && (
          <>
            <button className="step-link" style={{ color: 'var(--sage-700)' }} onClick={() => { setMode('up'); setError(null) }}>
              Non hai ancora uno spazio? Creane uno →
            </button>
            <button className="step-link" style={{ color: 'rgba(32,30,29,.5)' }} onClick={() => { setMode('reset'); setError(null) }}>
              Ho dimenticato la password
            </button>
          </>
        )}
        {mode !== 'in' && (
          <button className="step-link" style={{ color: 'var(--sage-700)' }} onClick={() => { setMode('in'); setError(null) }}>
            ← Torna all’accesso
          </button>
        )}
      </div>

      <div style={{ marginTop: 'auto', paddingTop: 24, fontSize: 11.5, color: 'rgba(32,30,29,.45)', lineHeight: 1.5, textAlign: 'center' }}>
        Quello che scrivi resta tuo: nessun altro account può leggerlo.
        La chiave di Ora, se la userai, non lascia mai questo dispositivo.
      </div>
    </div>
  )
}
