/* Hanya kulit aplikasi dicache. Data pengguna, auth dan panggilan API tidak pernah dicache. */
const CACHE='medista-v4-shell-20261102';
const ASSETS=['./','./index.html','./style.css','./app.js','./map-data.js','./doc-export.js','./brand.js','./config.js','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-maskable-512.png','./icons/apple-touch-icon.png','./icons/favicon-64.png','./icons/medista-logo.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('medista-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
/* Rangkaian dahulu supaya versi baharu terus sampai; cache hanya bila offline. */
self.addEventListener('fetch',e=>{const req=e.request;const url=new URL(req.url);
 if(req.method!=='GET'||url.origin!==self.location.origin)return;
 e.respondWith(fetch(req).then(res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(req,cp));}return res;})
  .catch(()=>caches.match(req).then(c=>c||(req.mode==='navigate'?caches.match('./index.html'):Response.error()))));
});
