const CACHE_NAME = "trading-terminal-v2";
const STATIC_ASSETS = ["/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
        )
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Never cache API routes or Next.js data requests
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_next/data/")
  ) {
    return;
  }

  // Static assets (Next.js build output): cache-first
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const fetchPromise = fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
        return cached || fetchPromise;
      })
    );
    return;
  }

  // Everything else: network-first
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});

// ---- Web Push ----

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = {
      title: "Trading Terminal",
      message: event.data.text(),
      level: "info",
    };
  }

  const level = data.level || "info";
  const icon = "/icons/icon-192.png";

  const vibrate =
    level === "critical"
      ? [200, 100, 200, 100, 200]
      : level === "warning"
        ? [200, 100, 200]
        : [100];

  const options = {
    body: data.message || "",
    icon: icon,
    badge: icon,
    tag: "notif-" + (data.id || Date.now()),
    data: { url: "/notifications/all/unread" },
    vibrate: vibrate,
    requireInteraction: level === "critical" || level === "warning",
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || "Trading Terminal",
      options
    )
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlPath =
    (event.notification.data && event.notification.data.url) || "/";
  const fullUrl = new URL(urlPath, self.location.origin).href;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          try {
            if ("focus" in client) {
              return client.focus().then((c) => {
                if ("navigate" in c) return c.navigate(fullUrl);
              });
            }
          } catch {
            /* ignore, try next */
          }
        }
        return clients.openWindow(fullUrl);
      })
  );
});
