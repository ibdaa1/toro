// TORO Service Worker — cache-first for static, network-first for API
// Bump CACHE version whenever static files change to force a fresh install.
const CACHE = 'toro-v36';
const STATIC = [
  './',
  './index.html',
  './assets/css/main.css',
  './assets/js/i18n.js',
  './assets/js/main.js',
  './assets/js/sw-register.js',
  './assets/lang/ar.json',
  './assets/lang/en.json',
  './manifest.json',
  './favicon.ico',
  './logo.png',
  './assets/img/icon.svg',
  './assets/img/icon-192.png',
  './assets/img/icon-512.png',
  './assets/img/apple-touch-icon.png'
];

// ── INSTALL ────────────────────────────────────────────────────────────────
// Cache each file individually so a single network failure does not abort the
// entire install and leave users with a broken cached shell.
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache =>
      Promise.allSettled(
        STATIC.map(url =>
          cache.add(url).catch(err =>
            console.warn('[SW] Could not cache:', url, err.message)
          )
        )
      )
    ).then(() => self.skipWaiting())
  );
});

// ── ACTIVATE ────────────────────────────────────────────────────────────────
// Delete every old cache (any key that is not the current CACHE name).
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── FETCH ───────────────────────────────────────────────────────────────────
self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);

  // 1. Skip non-GET requests (POST/PUT/DELETE always go to network)
  if (req.method !== 'GET') return;

  // 2. Skip cross-origin requests (Google Fonts, Unsplash, API host, etc.)
  //    These are opaque responses that waste cache quota and can cause bugs.
  if (url.origin !== self.location.origin) return;

  // 3. Always network-first for API calls — never serve stale data
  if (url.pathname.includes('/api/')) return;

  // 4. Cache-first strategy for same-origin static assets
  e.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;

      return fetch(req)
        .then(res => {
          // Only cache valid same-origin responses
          if (!res || res.status !== 200 || res.type !== 'basic') return res;
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(req, clone));
          return res;
        })
        .catch(() => {
          // Offline fallback: serve cached index.html for navigation requests
          if (req.destination === 'document') {
            return caches.match('./index.html').then(cached =>
              cached || new Response('<h1>TORO — You are offline</h1>', {
                headers: { 'Content-Type': 'text/html; charset=utf-8' }
              })
            );
          }
          // For other assets return an empty 503
          return new Response('', { status: 503 });
        });
    })
  );
});
