// Cache-first for the app shell, network-only for AI calls.
const CACHE = 'gymbuddy-v2';
const SHELL = ['/', '/index.html', '/manifest.webmanifest', '/favicon.svg'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // never cache AI provider calls

  // Navigations go network-first. Cache-first on HTML pins the user to the
  // shell that was current when they first visited: the stale index.html
  // keeps pointing at the old hashed bundle, so deploys never reach anyone
  // who has already opened the app.
  const isNavigation =
    request.mode === 'navigate' || request.destination === 'document';

  if (isNavigation) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE).then(c => c.put('/index.html', copy));
          return response;
        })
        .catch(() => caches.match(request).then(r => r ?? caches.match('/index.html'))),
    );
    return;
  }

  // Hashed build assets are immutable, so cache-first is safe and fast.
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then(c => c.put(request, copy));
        }
        return response;
      });
    }),
  );
});
