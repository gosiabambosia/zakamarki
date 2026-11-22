// Service worker: trzyma pliki aplikacji w pamięci telefonu, żeby działała także offline.
// Zapytania do Wikipedii przechodzą bez zmian.
//
// Strategia „najpierw sieć”: przy każdym otwarciu pytamy serwer o świeże pliki
// (z cache: 'no-cache', czyli z pominięciem 10-minutowej pamięci przeglądarki, którą ustawia
// GitHub Pages; niezmieniony plik serwer odsyła jako krótkie „304 bez zmian”). Kopia w pamięci
// jest używana tylko bez internetu. Dzięki temu nowe wdrożenie widać od razu, nie po kilku otwarciach.
const CACHE = 'zakamarki-v19';
const SHELL = ['./', './index.html', './style.css', './app.js', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png',
  './icons/icon.svg', './icons/apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE)
    .then((c) => c.addAll(SHELL.map((u) => new Request(u, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const res = await fetch(e.request, { cache: 'no-cache' });
      if (res.ok) cache.put(e.request, res.clone());
      return res;
    } catch {
      return (await cache.match(e.request, { ignoreSearch: true })) || Response.error();
    }
  })());
});
