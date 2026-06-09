const CACHE = 'album-mundial-v72';
const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/supabase.min.js',
  './js/config.js',
  './js/app.js',
  './icons/icon.svg',
  './icons/copa2026.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Supabase: siempre red, sin caché
  if (url.hostname.includes('supabase.co')) {
    e.respondWith(fetch(e.request));
    return;
  }

  // Shell: caché primero, luego red
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone)).catch(() => {});
        }
        return res;
      }).catch(() => new Response('', { status: 404, statusText: 'Not Found' }));
    })
  );
});
