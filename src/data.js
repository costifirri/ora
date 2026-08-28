// Dati e copy portati verbatim dal prototipo "Wellness App.dc.html".

export const CORE = [
  { key: 'Calma', sub: 'stabile', tone: 'sage', nuance: ['Radicata', 'Riposata', 'A mio agio', 'Silenziosa'] },
  { key: 'Serena', sub: 'tiepida', tone: 'sage', nuance: ['Grata', 'Costante', 'Fiduciosa', 'Gentile'] },
  { key: 'Gioiosa', sub: 'luminosa', tone: 'accent', nuance: ['Giocosa', 'Fiera', 'Leggera', 'In contatto'] },
  { key: 'Carica', sub: 'accesa', tone: 'accent', nuance: ['Concentrata', 'Motivata', 'Forte', 'Pronta'] },
  { key: 'Agitata', sub: 'vibrante', tone: 'accent', nuance: ['Impaziente', 'Dispersa', 'Elettrica', 'Nervosa'] },
  { key: 'Ansiosa', sub: 'contratta', tone: 'accent', nuance: ['Preoccupata', 'Tesa', 'Di corsa', 'Sul filo'] },
  { key: 'Arrabbiata', sub: 'accesa', tone: 'accent', nuance: ['Irritata', 'Ferita', 'Sotto pressione', 'Reattiva'] },
  { key: 'Svuotata', sub: 'vuota', tone: 'neutral', nuance: ['Stanca', 'Confusa', 'Sovraccarica', 'Spenta'] },
  { key: 'Giù', sub: 'pesante', tone: 'neutral', nuance: ['Triste', 'Sola', 'Scoraggiata', 'Piatta'] },
]

export const HARD = ['Agitata', 'Ansiosa', 'Arrabbiata']

export const TONES = {
  accent: { bg: '#ffe1d0', border: 'rgba(122,138,94,.4)', fg: '#8c491a', solid: '#c67139' },
  sage: { bg: '#e1eecc', border: 'rgba(122,138,94,.4)', fg: '#56633f', solid: '#7a8a5e' },
  neutral: { bg: '#eee7db', border: 'rgba(32,30,29,.18)', fg: '#474238', solid: '#82796a' },
}

export const PATTERNS = {
  '4-7-8': { name: '4·7·8 — per rallentare', phases: [['Inspira', 4], ['Trattieni', 7], ['Espira', 8]] },
  'Box': { name: 'Box — per stabilizzarsi', phases: [['Inspira', 4], ['Trattieni', 4], ['Espira', 4], ['Trattieni', 4]] },
  'Calm six': { name: 'Sei calmi — per un espiro lungo', phases: [['Inspira', 4], ['Espira', 6]] },
}

export const COURSE = [
  { label: 'Sedersi e non fare niente', mins: 3 },
  { label: 'Seguire il respiro', mins: 5 },
  { label: 'Quando la mente scappa, tornare', mins: 8 },
  { label: 'Scansione del corpo', mins: 10 },
  { label: "Notare l'emozione senza seguirla", mins: 10 },
  { label: 'Stare con il fastidio', mins: 12 },
  { label: 'Meditare senza guida', mins: 15 },
]

export const CUES = {
  scansione: [
    'Appoggia l’attenzione sui piedi. Non cambiare niente.',
    'Sali alle gambe. Nota il peso.',
    'Pancia e petto. Il respiro fa il suo lavoro da solo.',
    'Spalle e mascella. Se sono strette, lasciale essere strette.',
    'Tutto il corpo insieme, come una cosa sola.',
  ],
  nota: [
    'Che emozione c’è adesso? Dalle un nome, in silenzio.',
    'Dove la senti nel corpo? Petto, gola, mani.',
    'Non serve cambiarla. Guardala come guardi il tempo fuori.',
    'Sta già cambiando. Le emozioni lo fanno sempre.',
  ],
  letto: [
    'Il letto ti sostiene. Lascia andare il peso della testa.',
    'Mascella, spalle, mani: molla un millimetro alla volta.',
    'Il respiro rallenta da solo. Non aiutarlo.',
    'Se la giornata torna, va bene. Domani ha il suo posto.',
    'Adesso puoi lasciare andare anche l’attenzione.',
  ],
  tornare: [
    'Segui tre respiri, senza contarli.',
    'La mente è scappata? Bene: te ne sei accorta.',
    'Torna al respiro. Questo è tutto l’esercizio.',
    'Ancora una volta. Senza rimprovero.',
  ],
}

export const FLOW = [
  { k: 'checkin', when: 'Colazione', title: 'Come stai, prima del telefono', dur: '1 min', cta: 'Apri la ruota', act: 'checkin',
    body: 'Due tocchi sulla ruota, con il caffè in mano. Non serve stare bene per rispondere: serve solo dare un nome.' },
  { k: 'meditate', when: 'Mattina', title: 'Siediti e non fare niente', dur: '', cta: 'Inizia la pratica', act: 'course',
    body: 'Il passo di oggi del percorso, tutto qui la mattina: la mente è più morbida e si impara a non reagire prima che serva.' },
  { k: 'move', when: 'Pomeriggio', title: 'Cammina dieci minuti', dur: '10 min', cta: 'Fatto, ho camminato', act: 'move',
    body: 'Nei giorni in cui cammini, la sera reagisci di meno. Se adesso non ci sta, spostala più avanti: non salta, cambia momento.' },
  { k: 'scarico', when: 'Fine della giornata', title: 'Scarica quello che è rimasto', dur: '3 min', cta: 'Tre respiri lunghi', act: 'respiro',
    body: 'Il passaggio tra lavoro e casa è dove nascono i tuoi picchi. Tre respiri qui valgono più di mezz’ora dopo.' },
  { k: 'connect', when: 'Sera', title: 'Una conversazione vera', dur: '', cta: 'Preparala in Legami', act: 'legami',
    body: 'Una persona, una domanda, poi silenzio. In Legami trovi con chi e come iniziare.' },
  { k: 'sera', when: 'Rituale della sera', title: 'Rilassati e chiudi la giornata', dur: '6 min', cta: 'Inizia il rituale', act: 'sera',
    body: 'Due minuti di respiro lento, tre righe su cosa ti ha mossa, una domanda che porti a domani. È la parte serale della pratica: qui si scarica, non si impara.' },
  { k: 'letto', when: 'A letto', title: 'Scansione del corpo per dormire', dur: '8 min', cta: 'Ascolta a occhi chiusi', act: 'letto',
    body: 'L’ultima cosa della giornata. Se ti addormenti prima della fine, ha funzionato.' },
]

export const MOVE_SLOTS = [
  { label: 'Fine della giornata', when: 'Fine della giornata', pos: 3 },
  { label: 'Prima di cena', when: 'Prima di cena', pos: 4 },
  { label: 'Domani mattina', when: 'Domani mattina', pos: 7 },
]

// Persone di partenza: da qui in poi vivono nei dati salvati (p.people)
// e si possono rinominare, aggiungere e togliere.
export const DEFAULT_PEOPLE = [
  { id: 'p-1', name: 'Compagno', meta: 'chi ti vive accanto', opener: 'Con chi ti vive accanto le conversazioni diventano organizzazione: turni, spesa, cosa si mangia. Prova a chiedere una cosa che non c’entra niente con la casa: “C’è qualcosa che ti pesa in questo periodo e che non mi hai detto?” Poi lascia il silenzio, anche se è lungo.' },
  { id: 'p-2', name: 'Famiglia', meta: 'un genitore, una sorella, un fratello', opener: 'In famiglia si parla spesso di logistica e salute, raramente di come si sta. Prova con una cosa vera su di te — “in queste settimane sono stata poco presente” — e poi una domanda sola: “tu come stai davvero?”' },
  { id: 'p-3', name: 'Al lavoro', meta: 'chi vedi ogni giorno e conosci poco', opener: 'Con chi lavori parli solo di scadenze, e va bene così finché non diventa l’unica cosa. Una domanda che apre senza invadere: “cosa ti sta piacendo in questo periodo, fuori da qui?”' },
  { id: 'p-4', name: 'Un’amicizia', meta: 'qualcuno che vorresti sentire di più', opener: 'Le amicizie non si perdono per litigi, si perdono per rinvii. La prossima volta prova a dire una cosa che non hai ancora detto a nessuno di questo mese. Poi taci e ascolta.' },
]

// Usato per chi aggiungi tu, finché non chiedi a Ora un modo di iniziare.
export const GENERIC_OPENER = 'Una frase vera su di te, poi una domanda, poi silenzio. Il silenzio è la parte difficile, non le parole.'

export const initialOf = name => (name || '?').trim().charAt(0).toUpperCase() || '?'

export const QUESTIONS = [
  'Di cosa ti sei accorta di te stessa quest’anno?',
  'Cosa ti pesa in questo periodo che nessuno ti chiede mai?',
  'Quando ti sei sentita davvero capita l’ultima volta?',
  'C’è qualcosa che vorresti dirmi e non trovi il momento?',
  'Cosa ti fa sentire al sicuro con una persona?',
  'Di cosa hai paura in questo momento della tua vita?',
  'Cosa ti ha fatto ridere di gusto ultimamente?',
  'Che cosa hai cambiato idea su, di recente?',
]

// Le emozioni che vale la pena capire quando ci sono, non solo quando mancano.
export const POSITIVE = ['Calma', 'Serena', 'Gioiosa', 'Carica']

// Tag del check-in quando stai bene: "cosa te l'ha data?"
export const GOOD_TAGS = [
  { key: 'riposo', label: 'Riposo', note: 'Una notte piena, o una pausa vera nel mezzo.' },
  { key: 'movimento', label: 'Movimento', note: 'Il corpo si è mosso prima che la testa si calmasse.' },
  { key: 'persone', label: 'Persone', note: 'Uno scambio con qualcuno che ti ha rimessa in asse.' },
  { key: 'fuori', label: 'Stare fuori', note: 'Luce e aria: il posto conta più di quanto sembri.' },
  { key: 'fatto', label: 'Qualcosa di fatto', note: 'Una cosa portata a termine, anche piccola.' },
  { key: 'sola', label: 'Tempo per te', note: 'Silenzio, o semplicemente nessuno intorno a chiedere.' },
  { key: 'piacere', label: 'Un piacere', note: 'Musica, cibo, un libro: qualcosa di bello e basta.' },
  { key: 'altro', label: 'Niente di preciso', note: 'È arrivata senza un motivo chiaro. Succede, ed è un dato anche questo.' },
]

// Tag facoltativi del check-in: "cosa è successo poco prima?"
export const TRIGGER_TAGS = [
  { key: 'lavoro', label: 'Lavoro', note: 'Messaggi, scadenze o riunioni poco prima del picco.' },
  { key: 'relazioni', label: 'Relazioni', note: 'Uno scambio con qualcuno che ti è rimasto addosso.' },
  { key: 'fretta', label: 'Fretta', note: 'Ritardi e corse: la giornata parte contratta e resta così.' },
  { key: 'stanchezza', label: 'Stanchezza', note: 'Poca energia o poco sonno prima del picco.' },
  { key: 'telefono', label: 'Telefono', note: 'Il telefono in mano poco prima: notizie, social o messaggi.' },
  { key: 'altro', label: 'Niente di preciso', note: 'È arrivato senza un innesco chiaro. Anche questo è un dato.' },
]

// Inneschi di esempio, mostrati finché i check-in non bastano a calcolarli davvero.
export const SEED_TRIGGERS = [
  { label: 'Sera, dopo le 21', n: 5, of: 8, note: 'Cinque picchi su otto sono arrivati dopo cena, in giornate senza nessuna pausa.' },
  { label: 'Messaggi di lavoro fuori orario', n: 4, of: 8, note: 'Il telefono in mano dopo le 20 anticipa il picco di venti minuti, quasi sempre.' },
  { label: 'Fretta e ritardi', n: 3, of: 8, note: 'Quando esci di casa in ritardo, la mattina resta contratta fino a pranzo.' },
  { label: 'Sentirti non ascoltata', n: 2, of: 8, note: 'Due volte su tre è con persone a cui non hai detto la cosa vera prima.' },
]

// Esempi, mostrati finché i tuoi check-in buoni non bastano a calcolarli.
export const SEED_HELPERS = [
  { label: 'Camminare dieci minuti', note: 'Chiude l’onda più in fretta di qualsiasi altra cosa che hai provato.' },
  { label: 'L’espiro lungo', note: 'Tre respiri bastano per far scendere la reattività di un gradino.' },
  { label: 'Dirlo in una frase', note: 'Quando nomini l’emozione a voce, il picco dura circa metà.' },
  { label: 'Dieci minuti da sola', note: 'Non è evitare: è rientrare prima di rispondere.' },
]

export const SEED_WEEK = [
  { day: 'L', level: 1 }, { day: 'M', level: 3 }, { day: 'M', level: 0 }, { day: 'G', level: 2 },
  { day: 'V', level: 1 }, { day: 'S', level: 0 }, { day: 'D', level: 1 },
]

export const SERA_Q = [
  'Che cosa vorresti portare nella giornata di domani?',
  'C’è una persona a cui vuoi dire una cosa vera domani?',
  'Dove sei stata dura con te stessa oggi?',
  'Qual è la cosa più piccola che ti ha fatto bene oggi?',
]

export const CONVO_TONES = [
  { label: 'Leggera', tone: 'sage' }, { label: 'Vera', tone: 'sage' }, { label: 'Faticosa', tone: 'accent' },
]

export const PAUSA_STEPS = [
  { kicker: 'Passo uno · fermati', title: 'Non fare niente per un attimo.', body: 'Non stai rinunciando a rispondere. Stai solo mettendo dello spazio tra quello che è successo e quello che farai.', cta: 'Ci sono' },
  { kicker: 'Passo due · nomina', title: 'Che cosa è arrivato?', body: 'Rabbia, paura, vergogna, fretta. Dirlo con una parola abbassa l’intensità: il cervello smette di reagire e inizia a osservare.', cta: 'L’ho nominata' },
  { kicker: 'Passo tre · respira', title: 'Tre respiri lunghi.', body: 'L’espiro lungo è il segnale che il corpo riconosce come sicurezza. Segui il cerchio, senza forzare.', cta: 'Vai avanti' },
  { kicker: 'Passo quattro · scegli', title: 'Ora puoi scegliere.', body: 'Non la reazione automatica: una risposta. Che cosa vuoi fare adesso?', cta: '' },
]

export const PAUSA_CHOICES = [
  { label: 'Non rispondo adesso', note: 'Lo riprendo quando il corpo è sceso di giri', word: 'il rinvio' },
  { label: 'Dico come sto, senza accusare', note: '“Mi sono sentita messa da parte” invece di “tu sempre”', word: 'la frase vera' },
  { label: 'Esco a camminare dieci minuti', note: 'Il movimento chiude l’onda più in fretta', word: 'la camminata' },
]

export const INTENSITY_LABELS = ['Appena', 'Un po’', 'Abbastanza', 'Molto', 'Travolgente']

// Suggerimenti di nutrimento: uno al giorno, scelto in base al contesto reale
// (sonno, picchi, pasti già segnati, ora) e ruotato per giorno.
// Tono dell'app: concreto, mai colpevolizzante, niente conteggi.
export const NUTRITION_TIPS = {
  notte: [
    { text: 'Oggi mangia a orari regolari, anche senza fame.', why: 'Dopo una notte corta la fame si sfasa: pasti regolari tengono l’umore più stabile di quanto faccia la fame quando comanda lei.' },
    { text: 'Vacci piano col caffè dopo le due.', why: 'Dopo una notte storta si tende a raddoppiare, e stanotte si paga di nuovo. Un bicchiere d’acqua fa più di quanto sembri.' },
    { text: 'Metti qualcosa di sostanzioso a colazione.', why: 'Con poco sonno il corpo chiede zuccheri veloci tutto il giorno. Proteine al mattino spengono quella richiesta.' },
  ],
  picco: [
    { text: 'Un pasto vero, prima di decidere qualsiasi cosa.', why: 'La fame amplifica la reattività: le stesse cose, a stomaco pieno, pesano meno.' },
    { text: 'Se oggi hai saltato un pasto, recuperalo adesso.', why: 'Nei giorni con un picco forte, spesso poco prima c’è un pasto saltato.' },
  ],
  colazione: [
    { text: 'Metti qualcosa di proteico nella colazione.', why: 'Proteine al mattino tengono la glicemia più piatta: meno fame nervosa verso le undici.' },
    { text: 'Se puoi, mangia qualcosa prima del caffè.', why: 'Il caffè a stomaco vuoto alza il cortisolo su una base già alta. Anche due cucchiai di yogurt cambiano la mattina.' },
    { text: 'Non serve che sia una colazione vera.', why: 'Un frutto e quattro noci contano. È saltare del tutto che si sente nel pomeriggio.' },
  ],
  pranzo: [
    { text: 'Metti una cosa verde nel piatto.', why: 'Non per virtù: le verdure rallentano l’assorbimento e il pomeriggio resta più stabile.' },
    { text: 'Aggiungi una fonte di proteine al pranzo.', why: 'È la differenza tra un pomeriggio lucido e uno che chiede zuccheri alle quattro.' },
    { text: 'Mangia seduta e senza schermo, dieci minuti.', why: 'Il corpo digerisce meglio quando non è in allerta. Dieci minuti bastano.' },
  ],
  cena: [
    { text: 'Cena un po’ prima, se la giornata lo permette.', why: 'Un po’ di distanza tra cena e letto è la cosa che il sonno gradisce di più.' },
    { text: 'Cena calda e semplice.', why: 'Alla sera il corpo chiede di rallentare, non di mettersi a lavorare.' },
    { text: 'Se cerchi dolce dopo cena, guarda cos’hai mangiato a pranzo.', why: 'Spesso non è golosità: è un pranzo troppo leggero che presenta il conto.' },
  ],
  acqua: [
    { text: 'Un bicchiere d’acqua, adesso.', why: 'La disidratazione leggera si sente come stanchezza e irritabilità. Verificarlo costa dieci secondi.' },
  ],
  sempre: [
    { text: 'Tieni qualcosa di pronto in borsa.', why: 'Noci, un frutto: la fame che ti trova fuori casa è quella che decide al posto tuo.' },
    { text: 'Non serve mangiare bene tutti i giorni.', why: 'Serve mangiare abbastanza, quasi tutti i giorni. È una soglia molto più bassa e molto più utile.' },
    { text: 'Nota come stai un’ora dopo il pasto, non durante.', why: 'È lì che si vede se un piatto ti ha sostenuta o solo riempita.' },
    { text: 'Se mangi di corsa, almeno i primi bocconi piano.', why: 'I primi minuti dicono al corpo che è al sicuro. Il resto viene dietro.' },
    { text: 'Una cosa che ti piace davvero, in uno dei pasti.', why: 'Il piacere fa parte del nutrimento: le regole senza piacere durano due settimane.' },
  ],
}

// Indice del giorno: stabile entro la giornata, ruota il giorno dopo.
function dayIndex(now = new Date()) {
  return Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000)
}

// ctx: { hour, sleep, spikeToday, water, meals }
export function dailyTip(ctx, now = new Date()) {
  const { hour, sleep, spikeToday, water, meals } = ctx
  let bucket = 'sempre'
  if (sleep != null && sleep <= 5) bucket = 'notte'
  else if (spikeToday) bucket = 'picco'
  else if (hour < 11 && !meals.colazione) bucket = 'colazione'
  else if (hour >= 11 && hour < 16 && !meals.pranzo) bucket = 'pranzo'
  else if (hour >= 18 && !meals.cena) bucket = 'cena'
  else if (water <= 2 && hour >= 12) bucket = 'acqua'
  const list = NUTRITION_TIPS[bucket]
  return { ...list[dayIndex(now) % list.length], bucket }
}

// Motore del respiro: scala 0.62–1.0 con easing coseno, ferma durante le trattenute.
export function breath(t, patternKey) {
  const phases = (PATTERNS[patternKey] || PATTERNS['Calm six']).phases
  const total = phases.reduce((a, p) => a + p[1], 0)
  const tt = t % total
  let acc = 0, idx = 0, local = 0
  for (let i = 0; i < phases.length; i++) {
    if (tt < acc + phases[i][1]) { idx = i; local = tt - acc; break }
    acc += phases[i][1]
  }
  const word = phases[idx][0], dur = phases[idx][1]
  const eased = 0.5 - Math.cos(Math.PI * (local / dur)) / 2
  let scale = 0.62
  if (word === 'Inspira') scale = 0.62 + 0.38 * eased
  else if (word === 'Espira') scale = 1 - 0.38 * eased
  else scale = phases[idx - 1] && phases[idx - 1][0] === 'Inspira' ? 1 : 0.62
  return { word, scale, remain: Math.ceil(dur - local), cycle: Math.floor(t / total) + 1, total }
}

// Risposte offline, con corrispondenza per parole chiave (answerFor del prototipo).
export function answerFor(text) {
  const t = text.toLowerCase()
  const has = (...ws) => ws.some(w => t.indexOf(w) >= 0)
  if (has('arrabbi', 'rabbia', 'nervos', 'furiosa', 'incazz'))
    return 'La rabbia arriva quasi sempre dove ti sei sentita non vista. Prima di rispondere a chiunque: apri il Momento difficile, novanta secondi. Poi, se vuoi, dimmi cosa è successo poco prima.'
  if (has('ansia', 'ansios', 'paura', 'tesa', 'agitat', 'panico'))
    return 'Quando è ansia, il corpo va prima della testa: tre espiri lunghi e le spalle scendono di un gradino. Dopo ne parliamo. Che cosa temi che accada?'
  if (has('medit', 'mente scappa', 'concentr', 'distra'))
    return 'La mente scappa a tutte, decine di volte per sessione. Accorgersene è l’esercizio: ogni ritorno al respiro è una ripetizione. Non cercare il vuoto, cerca il ritorno.'
  if (has('conversazione', 'parlare', 'amic', 'sorella', 'giulia', 'marco', 'elena', 'legame', 'relazion'))
    return 'Prova così: una frase vera su di te, poi una domanda, poi silenzio. Il silenzio è la parte difficile, non le parole. Con chi vuoi provarci?'
  if (has('stanc', 'sonno', 'dormi', 'svuotat', 'esaust'))
    return 'Nelle ultime settimane le notti peggiori sono arrivate dopo giornate senza nessuna pausa. Stasera fermati al rituale della sera: sei minuti, non serve altro.'
  if (has('trist', 'sola', 'solitud', 'giu', 'giù', 'pian'))
    return 'Grazie per averlo detto. Non c’è niente da sistemare adesso: resta qui un momento. Se vuoi, scrivi tre righe nel rituale della sera — spesso il pensiero pesa meno fuori dalla testa.'
  if (has('lavoro', 'capo', 'collega', 'riunion', 'scadenz', 'ufficio'))
    return 'Il lavoro è il tuo innesco più frequente: cinque picchi su otto sono arrivati dopo messaggi fuori orario. Chiudi la giornata con i tre respiri prima di rientrare in casa.'
  if (has('grazie', 'meglio', 'bene', 'calma', 'tranquill'))
    return 'Bene. Nota com’è fatta questa calma, così la riconosci la prossima volta: dove la senti nel corpo?'
  if (t.trim().endsWith('?'))
    return 'Non ho una risposta pronta, ma ho i tuoi dati: i picchi arrivano di sera, dopo giornate senza pause, e passano prima quando cammini o nomini l’emozione a voce. Da dove vuoi partire?'
  return 'Ti seguo. Dimmi una cosa in più: che cosa è successo poco prima, e dove lo senti nel corpo?'
}

// --- Una cosa per oggi -----------------------------------------------------
// Un motivo onesto per aprire l'app: qualcosa di nuovo da leggere, non un
// debito da saldare. Con la chiave la scrive Ora conoscendoti; senza, ruota
// da qui — offline e gratis.

export const DAILY_THOUGHTS = [
  'Le emozioni forti durano meno di quanto sembra. È l’attesa che le fa sembrare lunghe.',
  'Non serve avere voglia di fare una cosa per farla. Spesso la voglia arriva dopo, non prima.',
  'Quando non sai cosa dire a qualcuno, una domanda vale più di una frase giusta.',
  'La stanchezza mente sul futuro: di sera tutto sembra più difficile di quanto sarà domani.',
  'Fermarsi non è perdere tempo. È l’unico modo per accorgersi di dove si sta andando.',
  'Le cose che rimandi non pesano per quanto sono grandi, ma per quante volte le hai guardate.',
  'Una giornata storta non è una settimana storta, a meno che tu non gliela lasci diventare.',
  'Chi ti conosce davvero si vede da quante domande fa, non da quanti consigli dà.',
  'Il corpo si calma prima della testa. È per questo che si comincia dal respiro.',
  'Dire "non lo so" è quasi sempre più utile che dire una cosa qualsiasi per riempire il silenzio.',
  'Le abitudini non si costruiscono nei giorni facili. Si costruiscono nei giorni in cui le fai male.',
  'Quello che chiami pigrizia, spesso è solo un compito descritto male.',
  'Non tutto quello che senti va risolto. Alcune cose vanno solo attraversate.',
  'La gentilezza verso te stessa non è indulgenza: è la differenza tra ricominciare e smettere.',
]

export const DAILY_FACTS = [
  'Il nervo vago collega il cervello a cuore e intestino: è il motivo per cui un espiro lungo rallenta davvero il battito, senza che tu debba crederci.',
  'Gli esseri umani sono l’unica specie conosciuta che arrossisce. Darwin la chiamava "la più peculiare delle espressioni".',
  'Il cervello consuma circa il venti per cento delle tue energie pur pesando il due per cento del corpo. Pensare stanca letteralmente.',
  'Dormire poco altera il riconoscimento delle espressioni altrui: dopo una notte corta si tende a leggere ostilità dove non c’è.',
  'Camminare a passo lento attiva aree cerebrali legate al pensiero divergente: è per questo che le idee arrivano in movimento.',
  'Le lacrime emotive hanno una composizione chimica diversa da quelle causate dalla cipolla.',
  'Il cuore ha un proprio sistema di neuroni, circa quarantamila: non pensa, ma comunica costantemente con il cervello.',
  'Nominare un’emozione riduce l’attività dell’amigdala. In laboratorio si chiama "affect labeling": dirlo la abbassa davvero.',
  'La percezione del tempo cambia con l’attenzione: le giornate piene sembrano lunghe mentre le vivi e brevi quando le ricordi.',
  'Il contatto con la luce del mattino, anche solo dieci minuti, sposta l’orologio interno più di qualsiasi integratore.',
  'Gli oceani producono più della metà dell’ossigeno che respiri, soprattutto grazie a un plancton invisibile a occhio nudo.',
  'La memoria non registra: ricostruisce. Ogni volta che ricordi qualcosa, lo riscrivi leggermente.',
  'Le api riconoscono i volti umani usando lo stesso meccanismo che usano per distinguere i fiori.',
  'Il silenzio assoluto è insopportabile per la maggior parte delle persone: dopo pochi minuti il cervello inizia a generare suoni propri.',
]

export const SEGNI = [
  'Ariete', 'Toro', 'Gemelli', 'Cancro', 'Leone', 'Vergine',
  'Bilancia', 'Scorpione', 'Sagittario', 'Capricorno', 'Acquario', 'Pesci',
]

export const DAILY_KINDS = [
  { k: 'pensiero', label: 'Un pensiero', note: 'Una riga su cui posarsi un momento.' },
  { k: 'fatto', label: 'Una curiosità', note: 'Qualcosa di vero che forse non sapevi.' },
  { k: 'segno', label: 'Il tuo segno', note: 'L’oroscopo del giorno, scritto da Ora. Per il piacere di leggerlo.' },
]

// Ruota per giorno: stabile entro la giornata, diversa domani.
export function localDaily(kind, now = new Date()) {
  const idx = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000)
  const list = kind === 'fatto' ? DAILY_FACTS : DAILY_THOUGHTS
  return list[idx % list.length]
}


// --- Il pensiero che gira --------------------------------------------------
// La ruminazione e' il pensiero astratto e ripetitivo ("perche' sono fatta
// cosi'"); il pensiero concreto ("cosa e' successo, cosa faccio") non lo e'.
// Questo strumento fa una cosa sola: portare il giro dall'astratto al
// concreto, e chiuderlo. Deve durare meno di un minuto, perche' una mente che
// rimugina non segue un protocollo lungo.

export const QUANDO = [
  { k: 'stasera', label: 'Stasera', note: 'Alle sei, quando la giornata rallenta.' },
  { k: 'domani', label: 'Domani mattina', note: 'Con la testa riposata pesa meno.' },
  { k: 'settimana', label: 'Fra una settimana', note: 'Se fra sette giorni conta ancora, la riprendiamo.' },
  { k: 'mai', label: 'Non la riprendo', note: 'La lascio andare adesso.' },
]

// Momento in cui un pensiero parcheggiato torna a farsi vivo.
export function quandoTs(k, now = new Date()) {
  const d = new Date(now)
  if (k === 'mai') return null
  if (k === 'stasera') {
    d.setHours(18, 0, 0, 0)
    if (d <= now) d.setDate(d.getDate() + 1)
    return d.getTime()
  }
  if (k === 'domani') {
    d.setDate(d.getDate() + 1)
    d.setHours(9, 0, 0, 0)
    return d.getTime()
  }
  d.setDate(d.getDate() + 7)
  d.setHours(9, 0, 0, 0)
  return d.getTime()
}
