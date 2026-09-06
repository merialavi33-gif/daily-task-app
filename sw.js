const CACHE_NAME = 'my-pwa-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// 1. መጫን (Install Event) - አስፈላጊ ፋይሎችን በካሽ መያዝ
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. ማምጣት (Fetch Event) - ከइንተርኔት ወይም ከካሽ ማሳየት
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // ካሽ ውስጥ ከተገኘ ከዛው ይመልስ፣ ካልተገኘ ከइንተርኔት ያውርደው
        return response || fetch(event.request);
      })
  );
});

// 3. ማዘመን (Activate Event) - አሮጌ ካሾችን ማጽዳት
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
