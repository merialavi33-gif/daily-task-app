const CACHE_NAME = 'task-controller-v1';
const ASSETS_TO_CACHE = [
  './index.html',
  './setup.html',
  './manifest.json'
];

// 1. Install Event - ፋይሎችን በ Cache ውስጥ ማስቀመጥ
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. Activate Event - የቆዩ Cache ፋይሎችን ማጽዳት
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch Event - ኢንተርኔት በሌለ ጊዜ ከ Cache ማሳየት
self.addEventListener('fetch', (event) => {
  // ከ Firebase ዳታቤዝ የሚመጡ ጥያቄዎችን አያያዝ (ለጊዜው በቀጥታ ወደ አውታረ መረብ እንዲሄድ መተው)
  if (event.request.url.includes('firebaseio.com') || event.request.url.includes('googleapis.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((response) => {
        return response;
      }).catch(() => {
        // ኢንተርኔት ከሌለ እና ፋይሉ ካልተገኘ የሚሰጥ አማራጭ
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
