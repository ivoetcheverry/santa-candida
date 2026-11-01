const CACHE_NAME = "santa-candida-v2";
const ASSETS = [
  "./",
  "./index.html",
  "./app.js",
  "./ganado.js",
  "./db.js",
  "./servicios.js",
  "./manifest.json",
  "https://cdn.tailwindcss.com",
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"
];

// Instalación: Guardar en caché todos los recursos estáticos
self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Caching app shell y assets...");
      return cache.addAll(ASSETS);
    })
  );
});

// Activación: Limpiar cachés anteriores
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[Service Worker] Limpiando caché antigua:", key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Estrategia Cache First, con fallback a Network y soporte offline
self.addEventListener("fetch", (e) => {
  // Ignorar peticiones a la API de Supabase en vivo si la app intenta sincronizar
  if (e.request.url.includes("supabase.co")) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(e.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseToCache);
          });
          return networkResponse;
        })
        .catch(() => {
          if (e.request.mode === "navigate") {
            return caches.match("./index.html") || caches.match("./");
          }
        });
    })
  );
});