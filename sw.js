// Service worker: app shell in cache all'installazione, contenuti e font in
// cache runtime (stale-while-revalidate). Incrementare VERSION a ogni release.
const VERSION = 'ab1j-v15';
const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './css/base.css',
  './css/components.css',
  './css/screens.css',
  './js/app.js',
  './js/core/router.js',
  './js/core/store.js',
  './js/core/srs.js',
  './js/core/audio.js',
  './js/core/data.js',
  './js/utils/dom.js',
  './js/exercises/registry.js',
  './js/exercises/teach.js',
  './js/exercises/mcq.js',
  './js/exercises/match.js',
  './js/exercises/trace.js',
  './js/exercises/dictation.js',
  './js/exercises/order.js',
  './js/utils/tiles.js',
  './js/exercises/dialog.js',
  './js/exercises/reading.js',
  './js/exercises/notice.js',
  './js/exercises/cloze.js',
  './js/exercises/conjugate.js',
  './js/core/pronunciation.js',
  './js/screens/pronounce.js',
  './js/screens/sounds.js',
  './js/screens/home.js',
  './js/screens/lesson.js',
  './js/screens/review.js',
  './js/screens/alphabet.js',
  './js/screens/stats.js',
  './js/screens/settings.js',
  './assets/icons/icon.svg'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetched = fetch(e.request)
        .then(res => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(VERSION).then(c => c.put(e.request, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || fetched;
    })
  );
});
