const CACHE_NAME = 'elvan-cache-v2';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/manifest.webmanifest',
    '/assets/instagram/profile.jpg',
    '/assets/style.css',
    '/assets/mobile.css'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener('fetch', (event) => {
    // Skip service worker caching for local development (e.g., Vite dev server)
    if (event.request.url.includes('localhost') || event.request.url.includes('127.0.0.1')) {
        return; // Let the browser handle it directly
    }

    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).catch(() => {
                // Return a fallback response or just ignore network failures
                console.warn('SW: Fetch failed for:', event.request.url);
                return new Response('Network error', { status: 503, statusText: 'Service Unavailable' });
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
