const CACHE_VERSION = 'pokebattle-fix18-mobile-v1';
const RUNTIME_CACHE = 'pokebattle-fix18-runtime-v1';
const CORE_ASSETS = [
  './', './index.html', './core.js', './ui.js', './items.js', './battle-engine.js', './league.js', './dungeon.js', './online_update.js',
  './update_phase2_online.js', './update_phase2_fix16_pvp_guest_sync.js', './update_phase2_fix17_content_mvp_titles.js', './update_phase2_fix18_mobile_stability.js',
  './POKEMON_DATABASE.js', './POKEMON_DATABASE_2.js', './POKEMON_DATABASE_3.js', './POKEMON_DATABASE_4.js', './POKEMON_DATABASE_EXTRA_0422.js', './POKEMON_DATABASE_35.js', './ITEM_DATABASE.js',
  './battleinterface.png', './pokebackground.png', './bgback.jpg', './citybattle.jpg', './monsterball.png', './GreatBall.png', './UltraBall.png', './masterball.png',
  './starter-sprites/Scorbunny.png', './starter-sprites/Sobble.png', './starter-sprites/Grookey.png'
];
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_VERSION).then((cache) => cache.addAll(CORE_ASSETS.map((url) => new Request(url, { cache: 'reload' })).filter(Boolean))).catch(() => null));
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => ![CACHE_VERSION, RUNTIME_CACHE].includes(k)).map((k) => caches.delete(k)))));
  self.clients.claim();
});
function isRuntimeAsset(request) {
  const url = new URL(request.url);
  return /\.(png|jpg|jpeg|gif|webp|mp4|mp3|js|css|webmanifest)$/i.test(url.pathname);
}
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).then((res) => {
      const copy = res.clone(); caches.open(CACHE_VERSION).then((cache) => cache.put('./index.html', copy)); return res;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  if (isRuntimeAsset(req)) {
    event.respondWith(caches.match(req).then((cached) => cached || fetch(req).then((res) => {
      if (res && res.ok) caches.open(RUNTIME_CACHE).then((cache) => cache.put(req, res.clone()));
      return res;
    }).catch(() => cached)));
  }
});
