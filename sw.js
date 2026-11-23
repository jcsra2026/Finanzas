// Mis Finanzas — abre al instante con la copia guardada y busca actualizaciones en segundo plano.
// Cambia VERSION cuando actualices index.html.
const VERSION = 'mf-v21';
const ARCHIVOS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return; // los datos van directo a Google
  e.respondWith(caches.open(VERSION).then(async cache => {
    const guardado = await cache.match(req, { ignoreSearch: true }) || (req.mode === 'navigate' ? await cache.match('./index.html') : null);
    const deRed = fetch(req).then(r => { if (r && r.ok) cache.put(req, r.clone()); return r; }).catch(() => null);
    if (guardado) { e.waitUntil(deRed); return guardado; }   // al instante; la versión nueva queda lista para la próxima vez
    return (await deRed) || new Response('Sin conexión', { status: 503 });
  }));
});
