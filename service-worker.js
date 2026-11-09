const CACHE_NAME = 'snake-v18';
const FILES_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './index.js',
  './block.js',
  './analytics.js',
  './track.js',
  './sw-register.js',
  './manifest.json',
  './favicon.ico',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  if (url.origin !== self.location.origin) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request).then(r => r || fetch(event.request))
  );
});
