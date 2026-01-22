// 🦅 DIGIY Service Worker - RESTO PRO
// Strategy: Network First (HTML) + Stale-While-Revalidate (assets)

const VERSION = "v2";
const CACHE_NAME = `digiy-resto-caisse-${VERSION}`;
const SCOPE = "/digiy-resto-caisse/";

// ✅ Mets ici UNIQUEMENT ce qui existe vraiment
const PRECACHE = [
  `${SCOPE}`,
  `${SCOPE}index.html`,
  `${SCOPE}guard.js`,
  // `${SCOPE}pin.html`,        // décommente seulement si le fichier existe
  `${SCOPE}manifest.json`
];

// --- Helpers
const isGET = (req) => req.method === "GET";
const sameOrigin = (url) => url.origin === self.location.origin;
const inScope = (url) => url.pathname.startsWith(SCOPE);
const isHTML = (req) => req.mode === "navigate" || (req.headers.get("accept") || "").includes("text/html");

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);

    // ✅ Precache SAFE : on ne casse pas l’install si 1 fichier est manquant
    await Promise.all(PRECACHE.map(async (u) => {
      try {
        const res = await fetch(u, { cache: "no-cache" });
        if (res.ok) await cache.put(u, res.clone());
      } catch (_) {}
    }));

    self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)));
    await self.clients.claim();
  })());
});

// ✅ Network First pour navigation (index.html / pages)
async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const fresh = await fetch(request);
    if (fresh && fresh.ok) cache.put(request, fresh.clone());
    return fresh;
  } catch (e) {
    const cached = await cache.match(request);
    return cached || caches.match(`${SCOPE}index.html`);
  }
}

// ✅ Stale-While-Revalidate pour assets locaux (js/css/icons)
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then((fresh) => {
    if (fresh && fresh.ok) cache.put(request, fresh.clone());
    return fresh;
  }).catch(() => null);

  return cached || (await fetchPromise) || cached;
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // ✅ On ne gère que:
  // - GET
  // - même domaine
  // - dans /digiy-resto-caisse/
  if (!isGET(req) || !sameOrigin(url) || !inScope(url)) return;

  // Pages (navigation)
  if (isHTML(req)) {
    event.respondWith(networkFirst(req));
    return;
  }

  // Assets
  event.respondWith(staleWhileRevalidate(req));
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

console.log("🦅 DIGIY SW chargé", CACHE_NAME);
