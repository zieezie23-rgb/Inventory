/* Inventory PWA service worker — v3.9.2 */
const CACHE_NAME = 'inventory-command-center-v3.9.2';
const BASE = self.registration.scope;
const CORE_ASSETS = [
  './', './index.html', './styles.css?v=3.9.2', './app.js?v=3.9.2',
  './manifest.webmanifest', './vendor/pptxgen.min.js', './assets/icon-192.png', './assets/icon-512.png',
  './assets/icon-512-maskable.png', './vendor/jszip.min.js',
  './templates/xlsx-template.json', './templates/template-styles.xml'
].map(path => new URL(path, BASE).toString());

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Cache shell resources individually so one optional file cannot block installation.
    await Promise.all(CORE_ASSETS.map(async url => {
      try {
        const response = await fetch(url, {cache: 'reload'});
        if (response.ok) await cache.put(url, response);
      } catch (_) { /* Network may be temporarily unavailable. */ }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith('inventory-command-center-') && key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.href.startsWith(BASE)) return;

  // Always try the latest page when opening the installed app; use cached shell offline.
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response && response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(new URL('./index.html', BASE).toString(), response.clone());
        }
        return response;
      } catch (_) {
        return (await caches.match(new URL('./index.html', BASE).toString())) || Response.error();
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response && response.ok) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone()).catch(() => {});
      }
      return response;
    } catch (_) {
      return Response.error();
    }
  })());
});
