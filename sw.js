// sw.js (v2)
const CACHE = "prater-v2";
const ASSETS = [
  "/Product-Research/",
  "/Product-Research/index.html",
  "/Product-Research/manifest.webmanifest",
  "/Product-Research/icons/icon-192.png",
  "/Product-Research/icons/icon-512.png"
];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
});

self.addEventListener("activate", (e) => {
  self.clients.claim();
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return; // Don’t cache POST/PUT
  e.respondWith(
    caches.match(req).then((res) =>
      res || fetch(req).then((r) => {
        const copy = r.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return r;
      }).catch(() => caches.match("/Product-Research/index.html"))
    )
  );
});
