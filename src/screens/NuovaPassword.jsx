import { useState } from 'react'
import { changePassword } from '../cloud.js'
import { authError } from '../supabase.js'

// Dove si atterra dal link "ho dimenticato la password".
//
// Senza questa schermata il link ti faceva rientrare e basta: dentro si', ma
// con la vecchia password ancora sconosciuta — quindi al prossimo dispositivo
// eri di nuovo fuori. Qui la nuova password si scrive davvero.

export default function NuovaPassword({ onFatto, email }) {
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [busy, setBusy] = useState(false)
  const [errore, setErrore] = useState(null)

  const salva = async e => {
    e.preventDefault()
    if (pw.length < 6) return setErrore('Servono almeno sei caratteri.')
    if (pw !== pw2) return setErrore('Le due password non sono uguali.')
    setBusy(true); setErrore(null)
    try {
      await changePassword(pw)
      onFatto()
    } catch (err) {
      setErrore(authError(err.message))
      setBusy(false)
    }
  }

  return (
    <div className="screen full" style={{ justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: 26 }}>
        <div style={{
          width: 68, height: 68, borderRadius: 999, background: 'var(--sage-500)',
          margin: '0 auto 18px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontSize: 27, color: 'var(--surface)',
        }}>O</div>
        <h1 className="h-page" style={{ margin: 0 }}>Scegli una password nuova</h1>
        <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.55, marginTop: 10, maxWidth: 310, marginInline: 'auto' }}>
          Sei rientrata{email ? ` come ${email}` : ''}. Scrivine una nuova adesso,
          così la prossima volta entri senza passare dall’email.
        </div>
      </div>

      <form onSubmit={salva} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input
          className="apikey-input" type="password" autoComplete="new-password"
          value={pw} onChange={e => setPw(e.target.value)}
          placeholder="La nuova password (almeno 6 caratteri)" aria-label="Nuova password" required minLength={6}
        />
        <input
          className="apikey-input" type="password" autoComplete="new-password"
          value={pw2} onChange={e => setPw2(e.target.value)}
          placeholder="Scrivila di nuovo" aria-label="Ripeti la nuova password" required
        />

        {errore && (
          <div style={{ background: 'var(--terra-100)', border: '1px solid rgba(198,113,57,.4)', borderRadius: 20, padding: '12px 16px', fontSize: 13, lineHeight: 1.5, color: '#8c491a' }}>
            {errore}
          </div>
        )}

        <button className="btn-primary" style={{ minHeight: 54, fontSize: 16, marginTop: 4 }} disabled={busy}>
          {busy ? 'Un attimo…' : 'Salva la password'}
        </button>
      </form>

      <div className="fineprint" style={{ textAlign: 'center', marginTop: 18, lineHeight: 1.5 }}>
        Scrivila dove la ritrovi — nel gestore password del telefono, per esempio.
        Non posso vederla né recuperarla: posso solo rimandarti un link come questo.
      </div>
    </div>
  )
}
