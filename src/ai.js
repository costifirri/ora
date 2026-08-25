// Compagna AI "Ora": system prompt e blocco di contesto portati verbatim dal prototipo.
// In produzione la chiamata va all'API Anthropic; senza chiave si usano le risposte offline.

const API_URL = 'https://api.anthropic.com/v1/messages'

// Ora scrive due frasi calde, non risolve problemi difficili: il modello più
// economico basta e avanza. Gli altri sono lì per chi vuole spendere di più.
export const MODELS = [
  { id: 'claude-haiku-4-5', label: 'Haiku', note: 'Il più economico. Per Ora basta e avanza.' },
  { id: 'claude-sonnet-5', label: 'Sonnet', note: 'Più sfumato. Costa circa tre volte tanto.' },
  { id: 'claude-opus-5', label: 'Opus', note: 'Il più profondo, e il più caro: circa dieci volte Haiku.' },
]
export const DEFAULT_MODEL = 'claude-haiku-4-5'

const modelOf = settings => (MODELS.some(m => m.id === settings?.model) ? settings.model : DEFAULT_MODEL)

// Haiku 4.5 non accetta output_config.effort e non pensa se non glielo chiedi:
// per lui la richiesta più economica è anche la più semplice.
const tuning = model => (model === 'claude-haiku-4-5' ? {} : { output_config: { effort: 'low' } })

function headers(apiKey) {
  return {
    'content-type': 'application/json',
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
    'anthropic-dangerous-direct-browser-access': 'true',
  }
}

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
export async function askOra({ apiKey, settings, system, history }) {
  const messages = history.slice(-10).map(m => ({
    role: m.from === 'me' ? 'user' : 'assistant',
    content: m.text,
  }))
  while (messages.length && messages[0].role === 'assistant') messages.shift()
  if (!messages.length) return ''

  const model = modelOf(settings)
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: headers(apiKey),
    body: JSON.stringify({
      model,
      // Bastano per le 2-4 frasi che il prompt chiede, senza troncare.
      max_tokens: 700,
      ...tuning(model),
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

// Un modo di iniziare, per una persona che hai aggiunto tu.
export async function askOpener({ apiKey, settings, person, userName }) {
  const system = [
    `Sei Ora, la compagna dell’app di benessere di ${userName}. Scrivi in italiano, dandole del tu.`,
    'Ti chiede un modo concreto per aprire una conversazione più vera con una persona che le sta a cuore.',
    'Rispondi con due o tre frasi, in un unico paragrafo: prima una nota su come vanno di solito le conversazioni in quel tipo di legame, poi una domanda precisa da fare, riportata fra virgolette, poi l’invito a lasciare il silenzio.',
    'Niente elenchi, niente emoji, niente titoli, niente retorica. Non inventare fatti su questa persona: sai solo quello che ti dice qui.',
  ].join('\n')
  const who = `Persona: ${person.name}. Relazione: ${person.meta || 'non specificata'}.`
  const model = modelOf(settings)
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: headers(apiKey),
    body: JSON.stringify({
      model,
      max_tokens: 700,
      ...tuning(model),
      system,
      messages: [{ role: 'user', content: who }],
    }),
  })
  if (!res.ok) throw new Error(`errore ${res.status}`)
  const out = await res.json()
  if (out.stop_reason === 'refusal') return ''
  return (out.content || []).filter(b => b.type === 'text').map(b => b.text).join('').trim()
}

// Report settimanale: due paragrafi caldi sui dati veri. Le note della sera
// non vengono mai incluse — l'app promette che nessuno le legge.
export async function weeklyReport({ apiKey, settings, contextBlock, name }) {
  const system = [
    `Sei Ora, la compagna dell’app di benessere di ${name}. Scrivi in italiano, dandole del tu.`,
    'Scrivi il suo report della settimana: esattamente due paragrafi brevi, senza titoli, senza elenchi, senza emoji.',
    'Primo paragrafo: che cosa raccontano i suoi dati, con calore e senza giudizio — uno schema, non un voto. Riformula, non congratularti.',
    'Secondo paragrafo: una sola cosa piccola e concreta da portare nella settimana che viene, legata ai dati.',
    'Se i dati sono pochi, dillo con leggerezza: anche poco è un inizio. Non inventare dati che non ci sono.',
    '',
    contextBlock,
  ].join('\n')
  const model = modelOf(settings)
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: headers(apiKey),
    body: JSON.stringify({
      model,
      max_tokens: 900,
      ...tuning(model),
      system,
      messages: [{ role: 'user', content: 'Scrivi il mio report della settimana.' }],
    }),
  })
  if (!res.ok) throw new Error(`errore ${res.status}`)
  const out = await res.json()
  if (out.stop_reason === 'refusal') return ''
  return (out.content || []).filter(b => b.type === 'text').map(b => b.text).join('').trim()
}
