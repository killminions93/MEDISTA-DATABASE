/* Hanya kulit aplikasi dicache. Data pengguna, auth dan panggilan API tidak pernah dicache. */
const CACHE='medista-v8-shell-20261105';
const ASSETS=['./','./index.html','./style.css','./app.js','./map-data.js','./doc-export.js','./kk-export.js','./pay.js','./vendor/jspdf.umd.min.js','./vendor/jspdf.plugin.autotable.min.js','./brand.js','./config.js','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-maskable-512.png','./icons/apple-touch-icon.png','./icons/favicon-64.png','./icons/medista-logo.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('medista-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
/* Rangkaian dahulu supaya versi baharu terus sampai; cache hanya bila offline. */
self.addEventListener('fetch',e=>{const req=e.request;const url=new URL(req.url);
 if(req.method!=='GET'||url.origin!==self.location.origin)return;
 e.respondWith(fetch(req).then(res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(req,cp));}return res;})
  .catch(()=>caches.match(req).then(c=>c||(req.mode==='navigate'?caches.match('./index.html'):Response.error()))));
});
/* Notifikasi: mesej data daripada Firebase Cloud Messaging. */
self.addEventListener('push',e=>{let p={};try{p=e.data?e.data.json():{};}catch{}const d=p.data||p.notification||{};
 e.waitUntil(self.registration.showNotification(d.title||'MEDISTA',{body:d.body||'',icon:'./icons/icon-192.png',badge:'./icons/favicon-64.png',tag:(d.view||'medista')+'-'+Date.now(),data:{view:d.view||'dashboard'}}));});
self.addEventListener('notificationclick',e=>{e.notification.close();const view=e.notification.data?.view||'dashboard';
 e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{const c=list.find(x=>x.url.startsWith(self.registration.scope));if(c){c.postMessage({type:'medista-open',view});return c.focus();}return self.clients.openWindow(self.registration.scope+'#'+view);}));});
