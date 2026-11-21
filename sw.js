/*
 * Kuzey Hub telefon paneli — servis çalışanı (yalnız https altında, örn. GitHub Pages).
 * Kabuğu (index.html) önbelleğe alır: internet yokken panel açılır ve "Bağlantı yok" gösterir.
 * Ağ öncelikli: çevrimiçiyken her açılışta en yeni sürüm alınır. Anahtar ya da kumanda verisi önbelleğe ALINMAZ.
 */
// Önbellek sürümü panel değiştikçe artar (1.5: v2, 1.6 ortak panel: v3) -> eski kabuk silinir, yeni panel alınır.
// Eşleşmeler localStorage'da (önbellekte değil): korunur.
const CACHE = 'kuzey-panel-v3';
const SHELL = ['./', './index.html'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
  );
});
