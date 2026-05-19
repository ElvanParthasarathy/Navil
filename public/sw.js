const CACHE_NAME = 'elvan-cache-v2';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/manifest.webmanifest',
    '/favicon.svg',
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
    // Only intercept same-origin requests (for static assets).
    // Let cross-origin requests (like Supabase API) pass through directly.
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    // Skip service worker caching for local development (e.g., Vite dev server)
    if (event.request.url.includes('localhost') || event.request.url.includes('127.0.0.1')) {
        return; // Let the browser handle it directly
    }

    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).catch((err) => {
                console.warn('SW: Fetch failed for:', event.request.url, err);
                // Only return fake 503 for our own assets if offline
                return new Response('Network error: Offline', { status: 503, statusText: 'Service Unavailable' });
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
