// sw.js — offline for Android & iPhone, with local JSZip cached
const CACHE = 'prater-v17';
const BASE = '/Product-Research/';

const CORE_ASSETS = [
  // entry points
  `${BASE}`,
  `${BASE}index.html`,
  `${BASE}manifest.webmanifest`,
  `${BASE}sw.js`,

  // icons
  `${BASE}icons/icon-180.png`,
  `${BASE}icons/icon-192.png`,
  `${BASE}icons/icon-512.png`,

  // libs used offline (ZIP export)
  `${BASE}libs/jszip.min.js`,

  // share page (optional)
  `${BASE}share/`,
  `${BASE}share/index.html`
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle same-origin
  if (url.origin !== self.location.origin) return;

  // Navigation requests: try exact page from cache, fallback to index.html
  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match(req).then((resp) => {
        if (resp) return resp;
        return caches.match(`${BASE}index.html`) || fetch(req);
      })
    );
    return;
  }

  // Static/asset requests: cache-first, then network
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((net) => {
        const copy = net.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(()=>{});
        return net;
      }).catch(() => cached);
    })
  );
});
