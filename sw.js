// TORO Service Worker — cache-first for static, network-first for API
const CACHE = 'toro-v2';
const STATIC = [
  '/',
  '/index.html',
  '/assets/css/main.css',
  '/assets/js/i18n.js',
  '/assets/js/main.js',
  '/manifest.json',
  '/assets/img/icon.svg'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(STATIC))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = e.request.url;

  // Always network-first for API calls (never cache API responses)
  // Match the specific API path pattern rather than the entire domain
  if (url.includes('/api/')) {
    return; // browser default
  }

  // Cache-first for static assets
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request)
        .then(res => {
          if (!res || res.status !== 200 || res.type !== 'basic') return res;
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => new Response('Offline', { status: 503 }));
    })
  );
});
