import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Via d'uscita: se una cache guasta impedisce all'app di partire, aprire
// l'indirizzo con ?reset in fondo butta via service worker e cache e ricarica
// pulito. Non tocca i tuoi dati, che stanno altrove.
if (location.search.includes('reset')) {
  Promise.all([
    'serviceWorker' in navigator
      ? navigator.serviceWorker.getRegistrations().then(rs => Promise.all(rs.map(r => r.unregister())))
      : Promise.resolve(),
    'caches' in window ? caches.keys().then(ks => Promise.all(ks.map(k => caches.delete(k)))) : Promise.resolve(),
  ]).catch(() => {}).then(() => location.replace(location.pathname))
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// L'app si aggiorna da sola: quando arriva una versione nuova, il service
// worker prende il controllo e la pagina si ricarica una volta sola. Senza
// questo, l'app installata resterebbe ferma alla versione del giorno prima.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  let ricaricata = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (ricaricata) return
    ricaricata = true
    window.location.reload()
  })

  window.addEventListener('load', () => {
    navigator.serviceWorker.register(import.meta.env.BASE_URL + 'sw.js')
      .then(reg => {
        // Ricontrolla ogni volta che riapri l'app dopo averla lasciata.
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') reg.update().catch(() => {})
        })
      })
      .catch(() => {})
  })
}
