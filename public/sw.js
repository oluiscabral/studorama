// Lightweight Service Worker optimized for fast initial load
const CACHE_NAME = 'studorama-v2.6.3';
const ESSENTIAL_FILES = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install event - only cache essential files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  // Skip waiting to activate immediately
  self.skipWaiting();
  
  // Only cache essential files to speed up install
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching essential files');
        return cache.addAll(ESSENTIAL_FILES);
      })
      .catch((error) => {
        console.error('Service Worker: Error caching essential files', error);
      })
  );
});

// Activate event - clean up old caches quickly
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients immediately
      self.clients.claim()
    ])
  );
});

// Fetch event - minimal caching strategy for performance
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Skip development server specific requests
  if (url.pathname.includes('/node_modules/') || 
      url.pathname.includes('/@vite/') ||
      url.pathname.includes('/@fs/') ||
      url.pathname.includes('/src/') ||
      url.searchParams.has('v') ||
      url.pathname.endsWith('.map')) {
    return;
  }
  
  // Only handle essential files and same-origin requests
  if (url.origin === location.origin) {
    // Network first strategy for better performance and fresh content
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache successful responses for essential files
          if (response.ok && ESSENTIAL_FILES.includes(url.pathname)) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseClone);
              })
              .catch(() => {
                // Ignore cache errors to avoid blocking
              });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache only for essential files
          if (ESSENTIAL_FILES.includes(url.pathname)) {
            return caches.match(request);
          }
          throw new Error('Network error and no cache available');
        })
    );
  }
});

// Simplified message handling
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Minimal error handling
self.addEventListener('error', (event) => {
  console.error('Service Worker: Error occurred', event.error);
});