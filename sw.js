const CACHE_NAME = "santa-candida-offline-v1";

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./logo.png"
];

const CDN_ASSETS = [
  "https://cdn.tailwindcss.com",
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2",
  "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // 1. Cachear archivos locales obligatorios
      await cache.addAll(CORE_ASSETS);

      // 2. Cachear CDNs uno por uno sin que un fallo aborte la instalación
      await Promise.allSettled(
        CDN_ASSETS.map(async (url) => {
          try {
            const response = await fetch(url, { mode: "cors" });
            if (response && (response.ok || response.type === "opaque")) {
              await cache.put(url, response);
            }
          } catch (err) {
            // Si falla con CORS, intentar modo no-cors para guardar respuesta opaca
            try {
              const opaqueRes = await fetch(url, { mode: "no-cors" });
              if (opaqueRes) await cache.put(url, opaqueRes);
            } catch (_) {}
          }
        })
      );
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Ignorar llamadas a la API/Storage de Supabase y métodos POST/PUT/DELETE
  if (req.method !== "GET" || req.url.includes("supabase.co")) {
    return;
  }

  // Navegación HTML: Cache-First con fallback garantizado a index.html
  if (req.mode === "navigate" || (req.headers.get("accept") || "").includes("text/html")) {
    event.respondWith(
      caches.match(req, { ignoreSearch: true }).then((cached) => {
        const networkFetch = fetch(req)
          .then((netRes) => {
            if (netRes && netRes.ok) {
              const copy = netRes.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put("./index.html", copy));
            }
            return netRes;
          })
          .catch(() => null);

        // Si ya está en caché, abrir al instante (0ms) y actualizar en segundo plano
        if (cached) return cached;

        return networkFetch.then((netRes) => {
          return netRes || caches.match("./index.html") || caches.match("./");
        });
      })
    );
    return;
  }

  // Resto de assets (JS, CSS, imágenes, CDNs): Cache-First + guardado dinámico
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((cached) => {
      if (cached) return cached;

      return fetch(req)
        .then((netRes) => {
          if (netRes && (netRes.ok || netRes.type === "opaque")) {
            const copy = netRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return netRes;
        })
        .catch(() => new Response("", { status: 503, statusText: "Offline" }));
    })
  );
});