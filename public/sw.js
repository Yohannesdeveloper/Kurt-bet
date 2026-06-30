const CACHE_NAME = "restaurant-os-v1";
const API_CACHE_NAME = "restaurant-os-api-v1";
const STATIC_ASSETS = [
  "/",
  "/dashboard",
  "/kds",
  "/tables",
  "/orders",
  "/menu",
  "/payments",
  "/inventory",
  "/employees",
  "/customers",
  "/reports",
  "/reservations",
  "/settings",
  "/order/self",
];

self.addEventListener("install", (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== API_CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET") return;

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirstWithCache(request, API_CACHE_NAME));
    return;
  }

  if (url.pathname.match(/\.(png|jpg|jpeg|svg|gif|woff2?|css|js)$/)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (url.pathname.startsWith("/order/self") || url.pathname === "/") {
    event.respondWith(networkFirstWithCache(request, CACHE_NAME));
    return;
  }

  event.respondWith(networkFirst(request));
});

async function cacheFirst(request: Request): Promise<Response> {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("Offline", { status: 503 });
  }
}

async function networkFirst(request: Request): Promise<Response> {
  try {
    const response = await fetch(request);
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response("Offline", { status: 503 });
  }
}

async function networkFirstWithCache(request: Request, cacheName: string): Promise<Response> {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;

    if (request.url.includes("/api/orders") || request.url.includes("/api/tables")) {
      return new Response(
        JSON.stringify({ success: true, data: [], offline: true }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: "You are offline", offline: true }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }
}

export {};
