// ─── DomPlace Service Worker v2 ──────────────────────────────────────────────
// Strategy:
//   • Navigation requests (HTML pages) → Network First (always fetch fresh)
//   • /api/ requests → Network First (with cache fallback)
//   • Static assets (/_next/static/*) → Cache First (versioned URLs, safe to cache)
//   • Other assets (images, fonts) → Stale While Revalidate
//   • Cache busting: CACHE_VERSION increments with each deployment

const CACHE_VERSION = 'domplace-v2';
const RUNTIME_CACHE = 'domplace-runtime-v2';

// ─── Install: pre-cache critical assets ───────────────────────────────────────
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      return cache.addAll([
        '/',
        '/manifest.json',
      ]);
    })
  );
});

// ─── Activate: clean old caches ───────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_VERSION && key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// ─── Fetch: smart routing ────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // 1. Navigation requests → Network First (always get fresh HTML)
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          // Offline fallback: serve cached HTML
          return caches.match('/');
        })
    );
    return;
  }

  // 2. API requests → Network First (always fetch fresh data)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, clone);
              // Trim runtime cache to prevent unbounded growth
              trimCache(RUNTIME_CACHE, 50);
            });
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // 3. Next.js static assets (versioned by hash in URL) → Cache First
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone));
          }
          return response;
        }).catch(() => new Response('Offline', { status: 503 }));
      })
    );
    return;
  }

  // 4. Other static assets (images, fonts, etc.) → Stale While Revalidate
  if (request.destination === 'image' || request.destination === 'font' || request.destination === 'style') {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request).then((response) => {
          if (response.ok && response.type === 'basic') {
            const clone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, clone);
              trimCache(RUNTIME_CACHE, 100);
            });
          }
          return response;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // 5. Everything else → Network First with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && response.type === 'basic') {
          const clone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// ─── Helper: trim cache to prevent unbounded growth ───────────────────────────
function trimCache(cacheName, maxItems) {
  caches.open(cacheName).then((cache) => {
    cache.keys().then((keys) => {
      if (keys.length > maxItems) {
        const deletePromises = keys.slice(0, keys.length - maxItems).map((key) => cache.delete(key));
        Promise.all(deletePromises);
      }
    });
  });
}
