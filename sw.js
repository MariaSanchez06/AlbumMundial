const CACHE = 'album-mundial-v1';
const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/supabase.min.js',
  './js/config.js',
  './js/app.js',
  './icons/icon.svg',
];

// Instalar: guarda el shell en caché
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

// Activar: elimina cachés antiguas
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: red primero para Supabase, caché primero para el resto
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Supabase API → siempre intentar red; caché como respaldo offline
  if (url.hostname.includes('supabase.co')) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Resto (shell): caché primero, luego red
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      });
    })
  );
});
