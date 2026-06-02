const CACHE = 'hp-v2'

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ).then(() => self.clients.claim())
))

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return
  if (!event.request.url.startsWith(self.location.origin)) return

  event.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(event.request).then(cached => {
        const fresh = fetch(event.request).then(res => {
          if (res.ok) cache.put(event.request, res.clone())
          return res
        }).catch(() => cached)
        // Cache-first for hashed assets (JS/CSS/fonts), network-first for HTML
        const isAsset = /\.(js|css|woff2?|ttf|svg|png|ico)(\?.*)?$/.test(event.request.url)
        return isAsset && cached ? cached : (fresh ?? cached)
      })
    )
  )
})
