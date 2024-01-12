const CACHE_NAME = 'v2'
const urlsToCache = [
    'index.html',
    'index.css',
    'index.js',
    // Add other URLs and assets you want to cache
]
console.log({ urlsToCache })

self.addEventListener('install', (event) => {
    // Parse the URL of the request
    const url = new URL(event.request.url)

    // Check if the root URL has the 'nocache=true' query parameter
    if (url.origin + url.pathname === self.location.origin + '/' && url.searchParams.get('nocache') === 'true') {
        // Bypass cache and go to network
        event.respondWith(fetch(event.request))
        return
    }
    // Ignore non-GET requests and Google Analytics
    if (event.request.method !== 'GET' || event.request.url.includes('google')) {
        return fetch(event.request)
    }
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(urlsToCache).catch((error) => {
                console.error('Caching failed:', error)
                // Optionally, handle the failure case, like skipping caching
            })
        }),
    )
})

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // Use fetch to get the latest version from the network
            const fetchPromise = fetch(event.request).then((networkResponse) => {
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, networkResponse.clone())
                })
                return networkResponse.clone()
            })

            // Return the cached response immediately, if available, while the fetch continues in the background
            return cachedResponse?.clone() || fetchPromise
        }),
    )
})
