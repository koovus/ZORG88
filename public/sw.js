// Service worker: intercepts stale cached requests for the old GameMaker game
// and prevents the old LunarLander3.js from ever running.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          // Clear any old caches that may contain the old game's HTML or JS
          return caches.delete(key);
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Block the old game's JavaScript entirely
  if (url.pathname.includes('LunarLander3.js')) {
    event.respondWith(
      new Response('/* old game blocked by service worker */', {
        status: 200,
        headers: { 'Content-Type': 'application/javascript' },
      })
    );
    return;
  }

  // For the root HTML page, always bypass cache and fetch fresh
  if (url.pathname === '/' || url.pathname === '/index.html') {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Everything else: network first, no caching
  event.respondWith(
    fetch(event.request, { cache: 'no-store' }).catch(() => caches.match(event.request))
  );
});
