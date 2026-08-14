const CACHE_NAME = 'project2570-cache-v1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png'
];

// ติดตั้ง: เก็บไฟล์หลักของแอปไว้ใน cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

// เปิดใช้งาน: ลบ cache เวอร์ชันเก่าทิ้ง
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ดักจับ request: ใช้ cache ก่อน ถ้าไม่มีค่อยไปเน็ต (cache-first สำหรับไฟล์ในแอป)
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // เฉพาะ same-origin เท่านั้นที่จัดการผ่าน cache (ปล่อย Google Fonts ไปตามปกติ)
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          return res;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});
