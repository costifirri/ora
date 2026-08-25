import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

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
