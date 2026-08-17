// Service worker: app shell in cache all'installazione, contenuti e font in
// cache runtime (stale-while-revalidate). Incrementare VERSION a ogni release.
const VERSION = 'ab1j-v44';
const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './css/base.css',
  './css/components.css',
  './css/screens.css',
  './js/app.js',
  './js/screens/hard_letters.js',
  './js/screens/confusable.js',
  './js/screens/mission_play.js',
  './js/screens/missions.js',
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
  './js/exercises/listen.js',
  './js/exercises/write.js',
  './js/core/keyboard.js',
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

  const url = new URL(e.request.url);
  // Codice e dati (JS, JSON, CSS): RETE PRIMA, cache come riserva offline.
  // Così un deploy nuovo arriva subito, senza restare bloccati su versioni vecchie.
  const isCodeOrData = /\.(js|json|css)$/.test(url.pathname);

  if (isCodeOrData) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(VERSION).then(c => c.put(e.request, copy));
          }
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Tutto il resto (audio, immagini, font): CACHE PRIMA (stabile, pesante).
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
