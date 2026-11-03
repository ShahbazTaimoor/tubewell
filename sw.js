const C='aslam-v1.3.14',F=['./','index.html','manifest.webmanifest','icon-180.png','icon-192.png','icon-512.png'],CDN=['www.gstatic.com','fonts.googleapis.com','fonts.gstatic.com'];
/* Urdu fonts precache mein NAHI — sirf Urdu mode par demand par load hote hain; fetch handler khud runtime-cache kar leta hai (v73) */
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>Promise.all(F.map(u=>c.add(u).catch(()=>{})))));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url),cdn=CDN.includes(u.hostname);if(u.origin!==location.origin&&!cdn)return;
e.respondWith((async()=>{const c=await caches.open(C);const hit=await c.match(r),old=hit&&!cdn?hit.clone():null;
if(hit&&cdn)return hit; /* Firebase/fonts ke versioned files kabhi nahi badalte: seedha cache se */
const net=fetch(r,{cache:'no-cache'}).then(async res=>{if(res&&(res.ok||res.type==='opaque')){if(old&&(r.mode==='navigate'||u.pathname.endsWith('index.html'))){try{const a=await old.text(),b=await res.clone().text();if(a!==b)(await self.clients.matchAll()).forEach(x=>x.postMessage({t:'upd'}))}catch(_){}}c.put(r,res.clone())}return res}).catch(()=>null);
if(hit){e.waitUntil(net);return hit} /* cache se foran kholo, naya version peeche se le lo */
const res=await net;return res||(r.mode==='navigate'?((await c.match('index.html'))||(await c.match('./'))):null)||Response.error()})())});
/* v1.3.12: notification par tap — app wapas khul jaye */
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil((async()=>{const cl=await self.clients.matchAll({type:'window',includeUncontrolled:true});for(const c of cl){if('focus' in c)return c.focus()}return self.clients.openWindow('./')})())});

/* v1.3.14: Level-2 background push (FCM) — app band ho tab bhi; importScripts fail ho (offline) to sirf push band, SW zinda */
try{importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js','https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js')}catch(_){}
try{if(self.firebase&&firebase.messaging&&firebase.messaging.isSupported&&firebase.messaging.isSupported()){firebase.initializeApp({apiKey:"AIzaSyAiHYgg613HVa-3ca2g90K-wPw3ZguOgPg",authDomain:"aslam-tubewell.firebaseapp.com",projectId:"aslam-tubewell",storageBucket:"aslam-tubewell.firebasestorage.app",messagingSenderId:"668678347271",appId:"1:668678347271:web:d876035122ce1f8d6fe8a2"});firebase.messaging().onBackgroundMessage(function(p){try{const n=(p&&p.notification)||{};self.registration.showNotification(n.title||'Tubewell Khata',{body:n.body||'',tag:'twk-push',renotify:true,icon:'icon-192.png',badge:'icon-192.png'})}catch(_){}})}}catch(_){}
