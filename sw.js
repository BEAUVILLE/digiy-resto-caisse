// 🦅 DIGIY Service Worker - RESTO PRO
// Version: 1.0
// Cache strategy: Network First, fallback to Cache

const CACHE_NAME = 'digiy-resto-caisse-v1';
const urlsToCache = [
  '/digiy-resto-caisse/',
  '/digiy-resto-caisse/index.html',
  '/digiy-resto-caisse/guard.js',
  '/digiy-resto-caisse/pin.html',
  '/digiy-resto-caisse/manifest.json'
];

// Installation
self.addEventListener('install', (event) => {
  console.log('🦅 Service Worker: Installation');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ Cache ouvert');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activation
self.addEventListener('activate', (event) => {
  console.log('🦅 Service Worker: Activation');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Suppression ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch - Network First, fallback Cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone la réponse
        const responseToCache = response.clone();
        
        // Met en cache
        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseToCache);
          });
        
        return response;
      })
      .catch(() => {
        // Si réseau échoue, utilise le cache
        return caches.match(event.request);
      })
  );
});

// Message handler
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('🦅 DIGIY Service Worker chargé - RESTO PRO');
