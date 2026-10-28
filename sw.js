const C='aslam-v94',F=['./','index.html','manifest.webmanifest','icon-180.png','icon-192.png','icon-512.png'],CDN=['www.gstatic.com','fonts.googleapis.com','fonts.gstatic.com'];
/* Urdu fonts precache mein NAHI — sirf Urdu mode par demand par load hote hain; fetch handler khud runtime-cache kar leta hai (v73) */
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>Promise.all(F.map(u=>c.add(u).catch(()=>{})))));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url),cdn=CDN.includes(u.hostname);if(u.origin!==location.origin&&!cdn)return;
e.respondWith((async()=>{const c=await caches.open(C);const hit=await c.match(r),old=hit&&!cdn?hit.clone():null;
if(hit&&cdn)return hit; /* Firebase/fonts ke versioned files kabhi nahi badalte: seedha cache se */
const net=fetch(r,{cache:'no-cache'}).then(async res=>{if(res&&(res.ok||res.type==='opaque')){if(old&&(r.mode==='navigate'||u.pathname.endsWith('index.html'))){try{const a=await old.text(),b=await res.clone().text();if(a!==b)(await self.clients.matchAll()).forEach(x=>x.postMessage({t:'upd'}))}catch(_){}}c.put(r,res.clone())}return res}).catch(()=>null);
if(hit){e.waitUntil(net);return hit} /* cache se foran kholo, naya version peeche se le lo */
const res=await net;return res||(r.mode==='navigate'?((await c.match('index.html'))||(await c.match('./'))):null)||Response.error()})())});
