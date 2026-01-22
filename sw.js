// 🦅 DIGIY RESTO PRO - Service Worker
const CACHE_NAME = 'digiy-resto-v1';
const ASSETS_TO_CACHE = [
  '/digiy-resto-caisse/',
  '/digiy-resto-caisse/index.html',
  '/digiy-resto-caisse/guard.js',
  '/digiy-resto-caisse/pin.html',
  '/digiy-resto-caisse/manifest.json',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installation...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cache ouvert');
        return cache.addAll(ASSETS_TO_CACHE.map(url => {
          return new Request(url, { cache: 'reload' });
        })).catch(err => {
          console.warn('[SW] Erreur cache assets:', err);
        });
      })
  );
  self.skipWaiting();
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activation...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Suppression ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Stratégie de cache : Network First, fallback sur Cache
self.addEventListener('fetch', (event) => {
  // Ignorer les requêtes non-GET
  if (event.request.method !== 'GET') {
    return;
  }

  // Ignorer les requêtes Supabase (toujours en ligne)
  if (event.request.url.includes('supabase.co')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone la réponse pour la mettre en cache
        const responseToCache = response.clone();
        
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      })
      .catch(() => {
        // Si le réseau échoue, utiliser le cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Si pas en cache, page hors ligne
          return caches.match('/digiy-resto-caisse/index.html');
        });
      })
  );
});

// Message handler pour forcer le skip waiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('🦅 Service Worker RESTO PRO chargé');
