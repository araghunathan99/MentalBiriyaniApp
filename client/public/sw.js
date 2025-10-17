// Dynamic cache name with timestamp - updates on each deployment
const CACHE_VERSION = '__CACHE_VERSION__'; // Will be replaced during build
const CACHE_NAME = `mental-biriyani-${CACHE_VERSION}`;

// Only cache the app shell - let HTTP cache-busting handle assets
const urlsToCache = [
  './',
  './index.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip caching for media files (videos, images, audio) - let browser cache handle them
  // This is crucial for iOS PWA where we rely on browser HTTP cache
  const mediaExtensions = ['.mp4', '.mov', '.webm', '.jpg', '.jpeg', '.png', '.gif', '.mp3', '.wav', '.m4a'];
  const isMediaFile = mediaExtensions.some(ext => url.pathname.toLowerCase().endsWith(ext));
  
  if (isMediaFile) {
    // Pass through to network, no service worker caching for media
    event.respondWith(fetch(event.request));
    return;
  }
  
  // For non-media files, use cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          return response;
        });
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
