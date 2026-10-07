// Il corpo: allenamenti e cene, ma soprattutto il motivo per cui oggi ti
// propongo questo e non altro.
//
// La regola di questo file: ogni proposta porta con se' il perche', e il
// perche' viene dai tuoi dati veri — quanto hai dormito, com'e' andata al
// lavoro, cosa hai fatto ieri. Se non ho dati, lo dico e propongo il default,
// invece di fingere che sia su misura.
//
// Nessun conteggio di calorie, nessun voto sulla giornata: questa app nasce
// per togliere pensieri fissi, non per aggiungerne uno che si misura tre
// volte al giorno.

import { HARD } from './data.js'
import { SEQUENZE, durataTotale } from './yoga.js'

const GIORNO = 86400000

export const chiave = (d = new Date()) => {
  const z = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`
}

// --- Gli allenamenti ----------------------------------------------------

export const TIPI = {
  forza: { label: 'Forza', nota: 'Costruisce muscolo: è quello che cambia la forma, non solo il numero.' },
  cardio: { label: 'Cardio', nota: 'Fiato e consumo. Anche a bassa intensità funziona.' },
  mobilita: { label: 'Mobilità', nota: 'Scioglie quello che il lavoro irrigidisce.' },
  camminata: { label: 'Camminata', nota: 'La cosa più sottovalutata che esista.' },
}

export const ALLENAMENTI = [
  {
    k: 'forza-casa-a', tipo: 'forza', nome: 'Forza a casa · gambe e glutei', min: 30, sforzo: 3,
    serve: 'Niente, o due bottiglie d’acqua',
    blocchi: [
      '3 × 12 squat (scendi lenta, risali veloce)',
      '3 × 10 affondi per gamba',
      '3 × 15 ponte per i glutei, a terra',
      '3 × 30 secondi sedia al muro',
      '2 × 20 slanci indietro per gamba',
    ],
  },
  {
    k: 'forza-casa-b', tipo: 'forza', nome: 'Forza a casa · sopra e centro', min: 28, sforzo: 3,
    serve: 'Niente, o un elastico',
    blocchi: [
      '3 × 8 piegamenti (anche sulle ginocchia)',
      '3 × 12 rematore con bottiglie o elastico',
      '3 × 30 secondi plank',
      '3 × 12 dead bug per lato, a terra',
      '2 × 15 alzate laterali con bottiglie',
    ],
  },
  {
    k: 'forza-palestra-a', tipo: 'forza', nome: 'Palestra · gambe', min: 50, sforzo: 4,
    serve: 'Sala pesi',
    blocchi: [
      'Riscaldamento: 6 minuti di cyclette',
      '4 × 8 squat o pressa',
      '3 × 10 stacco rumeno',
      '3 × 12 affondi camminati',
      '3 × 15 leg curl',
      '3 × 20 polpacci',
    ],
  },
  {
    k: 'forza-palestra-b', tipo: 'forza', nome: 'Palestra · schiena e spalle', min: 45, sforzo: 4,
    serve: 'Sala pesi',
    blocchi: [
      'Riscaldamento: 5 minuti di vogatore',
      '4 × 8 lat machine',
      '3 × 10 rematore con manubri',
      '3 × 12 spinte sopra la testa',
      '3 × 15 alzate laterali',
      '3 × 12 curl bicipiti',
    ],
  },
  {
    k: 'forza-corto', tipo: 'forza', nome: 'Forza breve · tutto il corpo', min: 18, sforzo: 3,
    serve: 'Niente',
    blocchi: [
      '4 giri senza fermarsi:',
      '10 squat',
      '8 piegamenti (anche sulle ginocchia)',
      '12 ponte glutei',
      '30 secondi plank',
      '1 minuto di pausa fra i giri',
    ],
  },
  {
    k: 'cardio-camminata-veloce', tipo: 'cardio', nome: 'Camminata veloce', min: 40, sforzo: 2,
    serve: 'Scarpe comode',
    blocchi: [
      '40 minuti a passo sostenuto',
      'Il ritmo giusto: riesci a parlare ma non a cantare',
      'Se c’è una salita, falla due volte',
    ],
  },
  {
    k: 'cardio-intervalli', tipo: 'cardio', nome: 'Intervalli brevi', min: 24, sforzo: 4,
    serve: 'Un posto dove correre o una cyclette',
    blocchi: [
      '6 minuti facili per scaldarsi',
      '8 × (1 minuto forte / 1 minuto piano)',
      '4 minuti facili per chiudere',
      'Forte vuol dire che non riesci a parlare',
    ],
  },
  {
    k: 'cardio-lungo', tipo: 'cardio', nome: 'Cardio lento e lungo', min: 45, sforzo: 2,
    serve: 'Cyclette, tapis roulant o strada',
    blocchi: [
      '45 minuti a intensità bassa e costante',
      'Devi poter chiacchierare tutto il tempo',
      'È qui che si costruisce il fondo, non negli scatti',
    ],
  },
  {
    k: 'camminata-dieci', tipo: 'camminata', nome: 'Dieci minuti fuori', min: 10, sforzo: 1,
    serve: 'Solo uscire',
    blocchi: [
      '10 minuti, anche attorno all’isolato',
      'Senza telefono in mano, se riesci',
      'Conta più la costanza della durata',
    ],
  },
  {
    k: 'camminata-dopocena', tipo: 'camminata', nome: 'Camminata dopo cena', min: 20, sforzo: 1,
    serve: 'Niente',
    blocchi: [
      '20 minuti tranquilli, entro un’ora dalla cena',
      'Aiuta la digestione e fa dormire meglio',
      'È la più facile da tenere nel tempo',
    ],
  },
]

// Le mobilita' sono le sequenze yoga: stanno scritte in un posto solo, e da
// qui si vedono come allenamenti.
const DA_YOGA = SEQUENZE.map(s => ({
  k: s.k, tipo: 'mobilita', nome: s.nome, min: durataTotale(s), sforzo: 1,
  serve: s.serve, yoga: true,
  blocchi: s.posizioni.map(p => `${p.nome} — ${Math.round(p.sec / 60 * 10) / 10 >= 1 ? Math.round(p.sec / 60) + ' min' : p.sec + ' sec'}`),
}))

export const TUTTI = [...ALLENAMENTI, ...DA_YOGA]

export const allenamento = k => TUTTI.find(a => a.k === k)

// --- Le cene ------------------------------------------------------------
//
// Leggere vuol dire poco pesanti, non poco nutrienti: ognuna ha una fonte di
// proteine, perche' saltarle e' il modo piu' rapido per avere fame alle undici.

export const CENE = [
  {
    k: 'frittata-verdure', nome: 'Frittata di verdure e insalata', min: 15, prot: 'alta',
    cosa: '2 uova, zucchine o spinaci, un filo d’olio, insalata a parte',
    tag: ['veloce', 'post-allenamento'],
    perche: 'Proteine vere in quindici minuti. Dopo i pesi è quella giusta.',
  },
  {
    k: 'pollo-limone', nome: 'Pollo al limone con verdure al forno', min: 30, prot: 'alta',
    cosa: 'Petto di pollo, limone, rosmarino, zucchine e peperoni in teglia',
    tag: ['post-allenamento'],
    perche: 'Si prepara in cinque minuti, poi cuoce da solo mentre fai altro.',
  },
  {
    k: 'salmone-broccoli', nome: 'Salmone al vapore e broccoli', min: 20, prot: 'alta',
    cosa: 'Un trancio di salmone, broccoli, limone, olio a crudo',
    tag: ['post-allenamento'],
    perche: 'Grassi buoni e proteine. Sazia senza appesantire.',
  },
  {
    k: 'vellutata-ceci', nome: 'Vellutata di verdure con ceci', min: 25, prot: 'media',
    cosa: 'Zucca o cavolfiore, brodo, ceci lessati sopra, un filo d’olio',
    tag: ['confortante'],
    perche: 'Calda e consolante senza essere pesante. Per le sere storte.',
  },
  {
    k: 'insalatona-tonno', nome: 'Insalatona con tonno e uovo', min: 10, prot: 'alta',
    cosa: 'Insalata, tonno al naturale, un uovo sodo, pomodorini, mais',
    tag: ['veloce', 'senza fornelli'],
    perche: 'Zero cottura. Quando rientri tardi è questa o il divano.',
  },
  {
    k: 'caprese-ricca', nome: 'Caprese con pane integrale', min: 8, prot: 'media',
    cosa: 'Mozzarella, pomodoro, basilico, una fetta di pane integrale',
    tag: ['veloce', 'senza fornelli'],
    perche: 'Otto minuti. Il pane c’è apposta: senza, dopo due ore hai fame.',
  },
  {
    k: 'zuppa-legumi', nome: 'Zuppa di legumi e verdure', min: 25, prot: 'media',
    cosa: 'Lenticchie o fagioli, sedano, carota, pomodoro, crostini',
    tag: ['confortante'],
    perche: 'Riempie davvero. Fanne il doppio: domani è già pronta.',
  },
  {
    k: 'uova-asparagi', nome: 'Uova in camicia su verdure', min: 15, prot: 'alta',
    cosa: '2 uova, asparagi o spinaci saltati, pepe, scaglie di grana',
    tag: ['veloce', 'post-allenamento'],
    perche: 'Sembra un piatto da ristorante e costa quindici minuti.',
  },
  {
    k: 'tacchino-padella', nome: 'Tacchino in padella con zucchine', min: 18, prot: 'alta',
    cosa: 'Fesa di tacchino a strisce, zucchine, aglio, prezzemolo',
    tag: ['veloce', 'post-allenamento'],
    perche: 'Una padella sola da lavare. Dettaglio che conta, la sera.',
  },
  {
    k: 'greco-pita', nome: 'Yogurt greco salato con verdure crude', min: 7, prot: 'alta',
    cosa: 'Yogurt greco, cetriolo, olio, sale, carote e finocchi crudi',
    tag: ['veloce', 'senza fornelli', 'leggerissima'],
    perche: 'Per le sere in cui non hai fame ma sai che devi mangiare.',
  },
  {
    k: 'minestrone', nome: 'Minestrone con un cucchiaio di parmigiano', min: 20, prot: 'bassa',
    cosa: 'Minestrone di verdure, olio a crudo, parmigiano grattugiato',
    tag: ['confortante', 'leggerissima'],
    perche: 'Quando la giornata è stata troppo e vuoi solo qualcosa di caldo.',
  },
  {
    k: 'bresaola-rucola', nome: 'Bresaola, rucola e grana', min: 6, prot: 'alta',
    cosa: 'Bresaola, rucola, grana a scaglie, limone, pane integrale',
    tag: ['veloce', 'senza fornelli'],
    perche: 'Sei minuti in piedi davanti al frigo. Meglio di saltare la cena.',
  },
  {
    k: 'merluzzo-patate', nome: 'Merluzzo al forno con patate e pomodorini', min: 30, prot: 'alta',
    cosa: 'Filetto di merluzzo, patate a fette sottili, pomodorini, origano',
    tag: [],
    perche: 'Le patate non sono il nemico: sono il motivo per cui non sgranocchi dopo.',
  },
  {
    k: 'omelette-funghi', nome: 'Omelette ai funghi', min: 15, prot: 'alta',
    cosa: '2 uova, funghi trifolati, prezzemolo, insalata a parte',
    tag: ['veloce'],
    perche: 'Saporita con pochissimo. I funghi fanno volume senza peso.',
  },
  {
    k: 'tofu-verdure', nome: 'Tofu saltato con verdure croccanti', min: 18, prot: 'alta',
    cosa: 'Tofu, peperoni, zucchine, salsa di soia, zenzero',
    tag: ['veloce'],
    perche: 'Se vuoi staccare dalla carne senza rinunciare alle proteine.',
  },
  {
    k: 'passato-uovo', nome: 'Passato di verdure con uovo', min: 20, prot: 'media',
    cosa: 'Passato di verdure, un uovo sbattuto dentro a fine cottura',
    tag: ['confortante'],
    perche: 'L’uovo lo trasforma da contorno a cena vera.',
  },
  {
    k: 'gamberi-insalata', nome: 'Gamberi saltati su insalata', min: 14, prot: 'alta',
    cosa: 'Gamberi, aglio, peperoncino, insalata mista, limone',
    tag: ['veloce', 'post-allenamento'],
    perche: 'Pochissimi grassi e tante proteine. Cuoce in quattro minuti.',
  },
  {
    k: 'piadina-leggera', nome: 'Piadina integrale con affettato e verdure', min: 10, prot: 'media',
    cosa: 'Piadina integrale, prosciutto cotto o tacchino, insalata, pomodoro',
    tag: ['veloce'],
    perche: 'Quando vuoi qualcosa che somigli a una coccola senza esagerare.',
  },
]

export const cena = k => CENE.find(c => c.k === k)

// --- Quello che serve per incrociare ------------------------------------

function fatti(p, ora = Date.now()) {
  const corpo = p.corpo || { allenamenti: [], pasti: {}, peso: [] }
  const oggiK = chiave(new Date(ora))
  const ieriK = chiave(new Date(ora - GIORNO))

  const allenamenti = corpo.allenamenti || []
  const ultimi = [...allenamenti].sort((a, b) => b.ts - a.ts)
  const oggiAll = ultimi.filter(a => chiave(new Date(a.ts)) === oggiK)
  const ieriAll = ultimi.filter(a => chiave(new Date(a.ts)) === ieriK)

  const dal = ora - 7 * GIORNO
  const settimana = ultimi.filter(a => a.ts >= dal)

  const giorno = (p.days || {})[oggiK] || {}
  const sonno = giorno.sleep ?? null
  const lavoroOggi = (p.lavoro?.giorni || {})[oggiK] || null
  const checkOggi = (p.checkins || []).filter(c => chiave(new Date(c.ts)) === oggiK)
  const intensiOggi = checkOggi.filter(c => c.intensity >= 4 && HARD.includes(c.core)).length

  // Da quanti giorni non ti muovi.
  let fermi = 0
  for (let i = 1; i <= 14; i++) {
    const k = chiave(new Date(ora - i * GIORNO))
    if (allenamenti.some(a => chiave(new Date(a.ts)) === k)) break
    fermi++
  }

  return { oggiAll, ieriAll, settimana, sonno, lavoroOggi, intensiOggi, fermi, allenamenti }
}

/**
 * Cosa ti propongo oggi, e perche'. Incrocia sonno, lavoro, umore e cosa hai
 * fatto ieri. Ogni ramo spiega da dove viene — se non spiego, non propongo.
 */
export function proposta(p, ora = Date.now()) {
  const f = fatti(p, ora)
  const h = new Date(ora).getHours()

  // --- L'allenamento ---
  let all, perche
  if (f.oggiAll.length) {
    all = null
    perche = `Oggi ti sei già allenata (${f.oggiAll.map(a => allenamento(a.k)?.nome || a.k).join(', ')}). Il recupero è parte dell’allenamento, non una pausa da esso.`
  } else if (f.sonno != null && f.sonno <= 5) {
    all = allenamento('yoga-collo')
    perche = `Hai dormito ${f.sonno} ore. Con poco sonno i pesi rendono meno e costano di più: oggi meglio sciogliersi che spingere.`
  } else if (f.lavoroOggi?.carico === 'troppo' || f.intensiOggi >= 2) {
    all = allenamento('camminata-dopocena')
    perche = f.lavoroOggi?.carico === 'troppo'
      ? 'La giornata di lavoro è stata troppo. Camminare scarica senza chiederti altra energia — e funziona meglio di quanto sembri.'
      : 'Oggi hai segnato momenti intensi. Il movimento lento abbassa la tensione; quello forte adesso la alzerebbe.'
  } else if (f.ieriAll.some(a => allenamento(a.k)?.tipo === 'forza')) {
    all = allenamento('cardio-camminata-veloce')
    perche = 'Ieri hai fatto forza: i muscoli stanno ancora riparando. Oggi cardio leggero, così recuperi muovendoti.'
  } else if (f.fermi >= 3) {
    all = allenamento('forza-corto')
    perche = `Sono ${f.fermi} giorni che non ti alleni. Questo dura diciotto minuti e non serve niente: è fatto apposta per ricominciare senza negoziare.`
  } else if (f.settimana.filter(a => allenamento(a.k)?.tipo === 'forza').length === 0) {
    all = allenamento('forza-casa-a')
    perche = 'Questa settimana non hai ancora fatto forza. È la parte che cambia la forma del corpo, non solo il numero sulla bilancia.'
  } else {
    all = allenamento(h < 12 ? 'cardio-intervalli' : 'forza-casa-b')
    perche = 'Niente di particolare da segnalare oggi: questo tiene insieme il resto della settimana.'
  }

  // --- La cena ---
  const tardi = f.lavoroOggi?.staccato && Number(f.lavoroOggi.staccato.slice(0, 2)) >= 20
  const allenataOggi = f.oggiAll.length > 0
  let candidate, perCena

  if (tardi) {
    candidate = CENE.filter(c => c.min <= 12)
    perCena = `Hai staccato alle ${f.lavoroOggi.staccato}. A quest’ora serve qualcosa che sia pronto prima che tu cambi idea.`
  } else if (allenataOggi) {
    candidate = CENE.filter(c => c.tag.includes('post-allenamento'))
    perCena = 'Ti sei allenata: stasera proteine. Non è un premio, è quello che serve ai muscoli per rifarsi.'
  } else if (f.lavoroOggi?.carico === 'troppo' || f.intensiOggi >= 2) {
    candidate = CENE.filter(c => c.tag.includes('confortante'))
    perCena = 'Giornata pesante. Una cena calda consola davvero — e consolarsi mangiando qualcosa di buono non è un fallimento.'
  } else if (f.sonno != null && f.sonno <= 5) {
    candidate = CENE.filter(c => c.prot === 'alta' && c.min <= 20)
    perCena = 'Hai dormito poco: stasera qualcosa di sostanzioso ma leggero, così la notte non ci litighi.'
  } else {
    candidate = CENE.filter(c => c.prot !== 'bassa')
    perCena = 'Una cena normale, di quelle che si possono ripetere. Sono queste che fanno la differenza, non le settimane perfette.'
  }

  // Ruota per giorno: stabile dentro la giornata, diversa domani.
  const giorniDaSempre = Math.floor(ora / GIORNO)
  const scelta = candidate.length ? candidate[giorniDaSempre % candidate.length] : CENE[0]

  return { all, perche, cena: scelta, perCena, fatti: f }
}

// --- Il piano della settimana -------------------------------------------

const NOMI = ['lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato', 'domenica']

/**
 * Un piano concreto per i prossimi sette giorni: alterna forza e cardio,
 * mette i giorni di scarico dove servono e lascia respiro. Non e' un dogma:
 * e' una traccia, e lo dice.
 */
export function piano(quanti = 3, ora = Date.now()) {
  const schema = {
    2: ['forza-casa-a', null, null, 'forza-casa-b', null, 'camminata-dopocena', null],
    3: ['forza-casa-a', null, 'cardio-camminata-veloce', null, 'forza-casa-b', 'camminata-dopocena', null],
    4: ['forza-casa-a', 'mobilita-schiena', 'cardio-intervalli', null, 'forza-casa-b', 'cardio-lungo', null],
    5: ['forza-palestra-a', 'cardio-camminata-veloce', 'forza-palestra-b', 'mobilita-schiena', 'cardio-intervalli', 'camminata-dopocena', null],
  }[quanti] || []

  const oggi = new Date(ora)
  const lunedi = (oggi.getDay() + 6) % 7

  return schema.map((k, i) => ({
    giorno: NOMI[i],
    oggi: i === lunedi,
    allenamento: k ? allenamento(k) : null,
  }))
}

// --- Riassunti ----------------------------------------------------------

export function settimanaCorpo(p, ora = Date.now()) {
  const corpo = p.corpo || { allenamenti: [], pasti: {}, peso: [] }
  const dal = ora - 7 * GIORNO
  const all = (corpo.allenamenti || []).filter(a => a.ts >= dal)
  const minuti = all.reduce((s, a) => s + (allenamento(a.k)?.min || a.min || 0), 0)
  const pasti = Object.entries(corpo.pasti || {}).filter(([k]) => new Date(k).getTime() >= dal)
  const comeVolevo = pasti.filter(([, v]) => v === 'si').length

  const pesi = [...(corpo.peso || [])].sort((a, b) => a.ts - b.ts)
  let variazione = null
  if (pesi.length >= 2) {
    const primo = pesi.find(x => x.ts >= ora - 30 * GIORNO) || pesi[0]
    const ultimo = pesi[pesi.length - 1]
    if (ultimo.ts !== primo.ts) {
      const g = Math.round((ultimo.ts - primo.ts) / GIORNO)
      variazione = { delta: ultimo.kg - primo.kg, giorni: g, ultimo: ultimo.kg }
    }
  }

  return { quanti: all.length, minuti, pasti: pasti.length, comeVolevo, variazione, pesi }
}

// Una riga per il contesto che passo a Ora.
export function perOra(p, ora = Date.now()) {
  const s = settimanaCorpo(p, ora)
  if (!s.quanti && !s.pasti && !s.variazione) return null
  const pezzi = []
  if (s.quanti) pezzi.push(`${s.quanti} allenamenti negli ultimi 7 giorni (${s.minuti} minuti)`)
  if (s.pasti) pezzi.push(`cene segnate: ${s.comeVolevo} su ${s.pasti} come voleva`)
  if (s.variazione) pezzi.push(`peso ${s.variazione.ultimo} kg, ${s.variazione.delta >= 0 ? '+' : ''}${s.variazione.delta.toFixed(1)} in ${s.variazione.giorni} giorni`)
  return pezzi.join('; ')
}
