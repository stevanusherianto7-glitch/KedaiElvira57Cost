self.addEventListener('install', (event) => {
  console.log('Service Worker: Installed');
});

self.addEventListener('fetch', (event) => {
  // Ini syarat minimal: adanya event fetch
  event.respondWith(fetch(event.request));
});
