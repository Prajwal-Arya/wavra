self.addEventListener("install", (event) => {
  event.waitUntil(caches.open("wavra-shell-v1").then((cache) => cache.addAll(["/", "/manifest.json", "/icon.svg"])));
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (request.url.includes("/api/stream/")) {
          const copy = response.clone();
          caches.open("wavra-audio-v1").then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
