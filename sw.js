/* VITA offline cache - keeps the app shell and CDN libraries on the phone.
   Bump CACHE_VERSION whenever you upload new versions of the pages. */
const CACHE_VERSION = 'vita-v1';
const SHELL = ['./', 'index.html', 'dashboard.html', 'setup.html', 'manifest.json'];
const CDN_HOSTS = ['cdn.tailwindcss.com', 'cdnjs.cloudflare.com', 'www.gstatic.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => Promise.all(SHELL.map((url) => cache.add(url).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Stale-while-revalidate: answer from the phone instantly, refresh the copy in the background.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin && !CDN_HOSTS.includes(url.hostname)) return; // Firebase database traffic is never cached

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_VERSION);
    const cached = await cache.match(req);
    const refresh = fetch(req).then((res) => {
      if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
      return res;
    }).catch(() => null);
    if (cached) { event.waitUntil(refresh); return cached; }
    const fresh = await refresh;
    if (fresh) return fresh;
    if (req.mode === 'navigate') {
      const home = await cache.match('index.html');
      if (home) return home;
    }
    return new Response('Offline', { status: 503, statusText: 'Offline' });
  })());
});
