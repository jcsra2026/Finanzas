// Mis Finanzas — abre al instante (y sin señal) con la copia guardada; busca actualizaciones en segundo plano.
// Cambia VERSION cuando actualices index.html.
const VERSION = 'mf-v31';
const FB = 'https://www.gstatic.com/firebasejs/12.11.0/';
const ARCHIVOS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png',
  FB + 'firebase-app.js', FB + 'firebase-auth.js', FB + 'firebase-firestore.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET') return;
  const propio = url.origin === location.origin;
  const firebase = url.href.startsWith(FB);          // los archivos de Firebase (no los datos)
  if (!propio && !firebase) return;                  // datos e inicio de sesión van directo a Google
  e.respondWith(caches.open(VERSION).then(async cache => {
    const guardado = await cache.match(req, { ignoreSearch: propio }) || (req.mode === 'navigate' ? await cache.match('./index.html') : null);
    if (guardado && firebase) return guardado;         // versión fija: no cambia nunca
    const deRed = fetch(req).then(r => { if (r && r.ok) cache.put(req, r.clone()); return r; }).catch(() => null);
    if (guardado) { e.waitUntil(deRed); return guardado; }
    return (await deRed) || new Response('Sin conexión', { status: 503 });
  }));
});
