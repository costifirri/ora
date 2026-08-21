// Compagna AI "Ora": system prompt e blocco di contesto portati verbatim dal prototipo.
// In produzione la chiamata va all'API Anthropic; senza chiave si usano le risposte offline.

const API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-opus-5'

export function buildSystem(contextBlock, name) {
  return [
    `Sei Ora, la compagna dell’app di benessere di ${name}. Rispondi SEMPRE in italiano, dandole del tu.`,
    'I suoi obiettivi: imparare a meditare, non reagire alle emozioni forti, conoscersi meglio, avere conversazioni più profonde e autentiche.',
    'Tono: caldo, calmo, concreto. Mai retorica motivazionale, mai emoji, mai elenchi puntati, mai fare la terapeuta.',
    'Da due a quattro frasi: prima riconosci quello che ha detto con parole tue, poi offri una cosa concreta e piccola da fare, poi UNA domanda semplice.',
    'Non rispondere mai solo con una domanda secca: dai sempre qualcosa di sostanziale prima.',
    'Quando è utile rimanda a una parte dell’app con il suo nome: Momento difficile (90 secondi prima di reagire), rituale della sera, tre respiri di fine giornata, la ruota delle emozioni, Conoscerti, Legami.',
    'Usa i suoi dati solo se pertinenti; non inventarne altri. Non sei un medico: se emerge qualcosa di grave, suggerisci con delicatezza di parlarne con la sua terapeuta.',
    '',
    contextBlock,
  ].join('\n')
}

// history: [{from:'me'|'ora', text}] — si inviano gli ultimi 10 messaggi.
// Il primo messaggio inviato all'API deve avere ruolo user: si scartano
// i messaggi di Ora in testa (es. il saluto iniziale).
// Risposte sotto i 25 caratteri vengono scartate in favore del fallback.
export async function askOra({ apiKey, system, history }) {
  const messages = history.slice(-10).map(m => ({
    role: m.from === 'me' ? 'user' : 'assistant',
    content: m.text,
  }))
  while (messages.length && messages[0].role === 'assistant') messages.shift()
  if (!messages.length) return ''

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      // Il tetto copre anche il thinking del modello: 1024 lascia spazio
      // alle 2-4 frasi richieste dal prompt senza troncare.
      max_tokens: 1024,
      output_config: { effort: 'low' },
      system,
      messages,
    }),
  })
  if (!res.ok) {
    let reason = `errore ${res.status}`
    if (res.status === 401) reason = 'chiave API non valida'
    else if (res.status === 429) reason = 'troppe richieste, riprova tra poco'
    else if (res.status === 400) {
      try {
        const body = await res.json()
        reason = body?.error?.message || reason
      } catch { /* corpo non leggibile: si tiene il codice */ }
    }
    const err = new Error(reason)
    err.status = res.status
    throw err
  }
  const out = await res.json()
  if (out.stop_reason === 'refusal') return ''
  const txt = (out.content || []).filter(b => b.type === 'text').map(b => b.text).join('').trim()
  return txt.length < 25 ? '' : txt
}
