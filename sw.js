// Service worker minimale: cache-first per gli asset, network-first per il documento.
const CACHE = 'ora-v24'

self.addEventListener('install', e => {
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url)
  if (e.request.method !== 'GET') return
  // Le chiamate a servizi vivi non passano mai dalla cache.
  if (url.hostname === 'api.anthropic.com') return
  if (url.hostname.endsWith('supabase.co')) return

  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const copy = res.clone()
          caches.open(CACHE).then(c => c.put(e.request, copy))
          return res
        })
        .catch(() => caches.match(e.request)
          .then(hit => hit || caches.match('./index.html'))
          .then(hit => hit || caches.match('./'))
          .then(hit => hit || new Response(
            '<meta charset="utf-8"><body style="font-family:system-ui;padding:40px;line-height:1.6;background:#f5ead8;color:#201e1d">' +
            '<p>Non riesco a caricare Ora: sembra che la connessione manchi.</p>' +
            '<p>Riprova fra poco, oppure ricarica la pagina.</p></body>',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } },
          )))
    )
    return
  }

  e.respondWith(
    caches.match(e.request).then(hit => {
      if (hit) return hit
      return fetch(e.request).then(res => {
        if (res.ok && (url.origin === location.origin || url.hostname.includes('fonts.g'))) {
          const copy = res.clone()
          caches.open(CACHE).then(c => c.put(e.request, copy))
        }
        return res
      })
    })
  )
})
