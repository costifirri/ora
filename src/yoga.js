// Lo yoga, scritto per essere fatto davvero.
//
// Ogni sequenza ha le posizioni in ordine, quanto stare in ognuna e come si
// fa — non il nome sanscrito e basta. Si possono leggere o farsi guidare dal
// timer, che e' la ragione per cui esistono qui invece che su un video.
//
// Le mobilita' del Corpo pescano da qui: una libreria sola, due porte. Era
// gia' successo di duplicare le stesse cose in due posti, e non si rifa'.

export const SEQUENZE = [
  {
    k: 'yoga-schiena', nome: 'Per la schiena, dopo il computer', min: 14, quando: 'Fine giornata',
    serve: 'Un tappetino o un tappeto',
    perche: 'Stare seduta otto ore accorcia i flessori e blocca la zona lombare. Questa riapre esattamente quello.',
    posizioni: [
      { nome: 'Gatto e mucca', sec: 90, come: 'A quattro zampe. Inspirando inarchi e guardi avanti, espirando arrotondi e guardi l’ombelico. Lenta: due secondi per ogni movimento.' },
      { nome: 'Bambino', sec: 90, come: 'Ginocchia larghe, sedere sui talloni, braccia distese avanti, fronte a terra. Lascia andare le spalle a ogni espiro.' },
      { nome: 'Cane a testa in giù', sec: 60, come: 'Mani e piedi a terra, sedere in alto. Ginocchia piegate quanto serve: conta la schiena lunga, non le gambe dritte.' },
      { nome: 'Affondo basso, destra', sec: 60, come: 'Piede destro avanti fra le mani, ginocchio sinistro a terra. Spingi il bacino avanti finché senti davanti alla coscia sinistra.' },
      { nome: 'Affondo basso, sinistra', sec: 60, come: 'Lo stesso dall’altra parte. Se il ginocchio a terra dà fastidio, mettici sotto un asciugamano.' },
      { nome: 'Piccione, destra', sec: 90, come: 'Ginocchio destro avanti verso il polso destro, gamba sinistra distesa indietro. Scendi sui gomiti se ci arrivi.' },
      { nome: 'Piccione, sinistra', sec: 90, come: 'Dall’altra parte. È la posizione che apre i glutei profondi, quelli che il lavoro da seduta chiude.' },
      { nome: 'Torsione a terra, destra', sec: 60, come: 'Sdraiata, ginocchia al petto, lasciale cadere a destra, braccia aperte, sguardo a sinistra.' },
      { nome: 'Torsione a terra, sinistra', sec: 60, come: 'Dall’altra parte. Non forzare: il peso delle gambe basta.' },
      { nome: 'Savasana', sec: 120, come: 'Sdraiata, braccia lungo i fianchi, palmi in su. Non fare niente. È la posizione più difficile proprio per questo.' },
    ],
  },
  {
    k: 'yoga-mattina', nome: 'Saluto al sole, per cominciare', min: 12, quando: 'Mattina',
    serve: 'Spazio per stendersi',
    perche: 'Scalda tutto il corpo in ordine, dall’alto in basso. È la sequenza più vecchia che esista, e funziona ancora.',
    posizioni: [
      { nome: 'In piedi, mani al petto', sec: 45, come: 'Piedi paralleli, peso distribuito. Tre respiri lunghi prima di muoverti.' },
      { nome: 'Braccia in alto', sec: 30, come: 'Inspirando porta le braccia sopra la testa, guarda le mani, allunga tutto il fianco.' },
      { nome: 'Piegamento in avanti', sec: 45, come: 'Espirando scendi verso i piedi. Ginocchia morbide: non è una gara di flessibilità.' },
      { nome: 'Mezzo sollevamento', sec: 30, come: 'Mani sulle tibie, schiena lunga e piatta, sguardo avanti.' },
      { nome: 'Plank', sec: 45, come: 'Porta i piedi indietro, corpo in linea. Addome attivo, sedere né alto né basso.' },
      { nome: 'Cobra basso', sec: 45, come: 'Scendi a terra, mani sotto le spalle, solleva il petto spingendo con la schiena più che con le braccia.' },
      { nome: 'Cane a testa in giù', sec: 60, come: 'Spingi indietro, sedere in alto, talloni verso terra. Resta per cinque respiri.' },
      { nome: 'Ripeti il giro', sec: 180, come: 'Rifai tutto dall’inizio, tre volte. Dal secondo giro vai a tempo di respiro, non di orologio.' },
      { nome: 'In piedi, occhi chiusi', sec: 60, come: 'Fermati. Senti il battito. Questa è la parte che di solito si salta ed è quella che resta.' },
    ],
  },
  {
    k: 'yoga-sera', nome: 'Yoga dolce della sera', min: 16, quando: 'Prima di dormire',
    serve: 'Un cuscino, se ce l’hai',
    perche: 'Tutto a terra e tutto lento: abbassa il battito invece di alzarlo. Dopo questa si dorme diversamente.',
    posizioni: [
      { nome: 'Seduta, respiro lungo', sec: 120, come: 'Gambe incrociate. Inspira contando quattro, espira contando sei. L’espiro lungo è quello che calma.' },
      { nome: 'Farfalla', sec: 120, come: 'Piante dei piedi unite, ginocchia aperte. Scendi in avanti quanto viene, senza spingere.' },
      { nome: 'Bambino', sec: 120, come: 'Fronte a terra. Se la testa non arriva, mettici sotto un cuscino o un pugno chiuso.' },
      { nome: 'Gambe al muro', sec: 240, come: 'Sdraiata col sedere vicino al muro e le gambe su. Quattro minuti. È la posizione che toglie la stanchezza dalle gambe.' },
      { nome: 'Torsione a terra, destra', sec: 90, come: 'Ginocchia piegate che cadono a destra. Respira dentro il fianco che si apre.' },
      { nome: 'Torsione a terra, sinistra', sec: 90, come: 'Dall’altra parte, stessa lentezza.' },
      { nome: 'Savasana lungo', sec: 180, come: 'Tre minuti di niente. Se ti addormenti, ha funzionato.' },
    ],
  },
  {
    k: 'yoga-ansia', nome: 'Quando sei in ansia', min: 10, quando: 'In qualsiasi momento',
    serve: 'Niente, si può fare anche vestita',
    perche: 'Posizioni basse e chiuse, dove il corpo si sente contenuto. In ansia non serve aprirsi: serve sentire un appoggio.',
    posizioni: [
      { nome: 'Bambino', sec: 120, come: 'Fronte a terra, braccia lungo il corpo. Senti il pavimento sotto la fronte: è un appoggio vero.' },
      { nome: 'Piegamento in avanti, seduta', sec: 90, come: 'Gambe distese, scendi sul busto. Ginocchia piegate quanto vuoi. Lascia pesare la testa.' },
      { nome: 'Gambe al muro', sec: 180, come: 'Tre minuti con le gambe in su. Rallenta il battito senza che tu debba fare niente.' },
      { nome: 'Abbraccio a terra', sec: 90, come: 'Sdraiata, ginocchia al petto, braccia che le tengono. Dondola piano da un lato all’altro.' },
      { nome: 'Respiro 4-7-8', sec: 120, come: 'Inspira 4, trattieni 7, espira 8. Quattro giri. È l’espiro lungo che abbassa l’allarme.' },
    ],
  },
  {
    k: 'yoga-dopo-pesi', nome: 'Dopo l’allenamento', min: 12, quando: 'Subito dopo i pesi',
    serve: 'Un tappetino',
    perche: 'Allunga i gruppi che hai appena accorciato. Fatto subito costa cinque minuti, saltato costa due giorni di indolenzimento.',
    posizioni: [
      { nome: 'Affondo basso, destra', sec: 60, come: 'Apre il flessore dell’anca, che squat e corsa chiudono.' },
      { nome: 'Affondo basso, sinistra', sec: 60, come: 'Dall’altra parte.' },
      { nome: 'Piegamento in avanti, gambe larghe', sec: 90, come: 'In piedi, piedi larghi, scendi al centro. Allunga gli interni coscia.' },
      { nome: 'Piccione, destra', sec: 90, come: 'Per i glutei, dopo gambe o corsa.' },
      { nome: 'Piccione, sinistra', sec: 90, come: 'Dall’altra parte.' },
      { nome: 'Cobra', sec: 60, come: 'Apre il petto dopo le spinte. Spalle lontane dalle orecchie.' },
      { nome: 'Testa al ginocchio, destra', sec: 60, come: 'Seduta, una gamba distesa, scendi sopra. Posteriore della coscia.' },
      { nome: 'Testa al ginocchio, sinistra', sec: 60, come: 'Dall’altra parte.' },
      { nome: 'Savasana breve', sec: 90, come: 'Un minuto e mezzo a terra. Serve al sistema nervoso, non ai muscoli.' },
    ],
  },
  {
    k: 'yoga-collo', nome: 'Collo e spalle, in dieci minuti', min: 10, quando: 'Pausa di lavoro',
    serve: 'Una sedia',
    perche: 'Si fa vestita e seduta, anche in ufficio. È il punto dove va a finire tutto quello che non dici.',
    posizioni: [
      { nome: 'Rotazioni delle spalle', sec: 60, come: 'Dieci indietro e dieci avanti, lentissime. Senti dove si incastra.' },
      { nome: 'Orecchio alla spalla, destra', sec: 60, come: 'Lascia cadere la testa a destra. Mano destra sopra la testa, senza tirare: solo il peso.' },
      { nome: 'Orecchio alla spalla, sinistra', sec: 60, come: 'Dall’altra parte, stesso peso.' },
      { nome: 'Mento al petto', sec: 60, come: 'Testa giù, mani intrecciate dietro la nuca. Respira dentro la nuca.' },
      { nome: 'Aquila con le braccia', sec: 90, come: 'Braccia incrociate davanti, gomiti piegati, spingi i gomiti avanti. Apre fra le scapole.' },
      { nome: 'Apertura allo stipite', sec: 120, come: 'Avambraccio contro lo stipite della porta, ruota il busto dall’altra parte. Un minuto per lato.' },
      { nome: 'Seduta, respiro', sec: 150, come: 'Schiena staccata dallo schienale, spalle basse. Dieci respiri contati.' },
    ],
  },
]

export const sequenza = k => SEQUENZE.find(s => s.k === k)

export const durataTotale = s => Math.round(s.posizioni.reduce((a, p) => a + p.sec, 0) / 60)

/**
 * Cosa ti propongo di fare adesso per scendere di giro, incrociando gli stessi
 * segnali del Corpo: il tempo che hai, l'ora, come hai dormito, com'e' andata
 * al lavoro, se ti sei allenata.
 */
export function propostaCalma(p, minuti, ora = Date.now()) {
  const h = new Date(ora).getHours()
  const z = n => String(n).padStart(2, '0')
  const d = new Date(ora)
  const oggiK = `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`

  const giorno = (p.days || {})[oggiK] || {}
  const lavoro = (p.lavoro?.giorni || {})[oggiK] || null
  const allenataOggi = (p.corpo?.allenamenti || []).some(a => {
    const x = new Date(a.ts)
    return `${x.getFullYear()}-${z(x.getMonth() + 1)}-${z(x.getDate())}` === oggiK
  })
  const intensi = (p.checkins || []).filter(c => {
    const x = new Date(c.ts)
    return `${x.getFullYear()}-${z(x.getMonth() + 1)}-${z(x.getDate())}` === oggiK && c.intensity >= 4
  }).length

  if (minuti <= 5) {
    return {
      tipo: 'respiro',
      titolo: 'Respiro, e basta',
      riga: intensi >= 2
        ? 'Hai segnato momenti intensi oggi: cinque minuti di espiro lungo valgono più di mezz’ora dopo.'
        : 'Cinque minuti non cambiano la giornata, ma cambiano i prossimi venti minuti.',
      min: Math.max(3, minuti),
    }
  }

  if (allenataOggi && minuti >= 10) {
    return { tipo: 'yoga', seq: sequenza('yoga-dopo-pesi'), riga: 'Ti sei allenata oggi: questa allunga esattamente quello che hai accorciato.' }
  }
  if (intensi >= 2) {
    return { tipo: 'yoga', seq: sequenza('yoga-ansia'), riga: 'Oggi hai segnato più di un momento intenso. Queste sono posizioni basse e chiuse: servono a sentire un appoggio, non ad aprirsi.' }
  }
  if (lavoro?.carico === 'troppo' || (lavoro?.ore ?? 0) >= 9) {
    return { tipo: 'yoga', seq: sequenza('yoga-schiena'), riga: `Giornata lunga al lavoro${lavoro?.ore ? ` (${lavoro.ore} ore)` : ''}. Stare seduta chiude la zona lombare: questa la riapre.` }
  }
  if (h >= 20) {
    return { tipo: 'yoga', seq: sequenza('yoga-sera'), riga: 'È sera: tutto a terra e tutto lento, per abbassare il battito invece di alzarlo.' }
  }
  if (h < 11) {
    return { tipo: 'yoga', seq: sequenza('yoga-mattina'), riga: 'È mattina: questa scalda tutto il corpo in ordine, dall’alto in basso.' }
  }
  if (giorno.sleep != null && giorno.sleep <= 6) {
    return { tipo: 'yoga', seq: sequenza('yoga-collo'), riga: `Hai dormito ${giorno.sleep} ore: meglio qualcosa di morbido, che si fa anche seduta.` }
  }
  return { tipo: 'meditazione', riga: 'Niente di particolare oggi: il passo del percorso è la cosa che rende di più nel tempo.' }
}
