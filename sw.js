// Mage Animals — sw.js · Service worker: o jogo abre sem internet depois da 1ª visita e vira app instalável.
// Estratégia:
//  · página (index.html): rede primeiro (deploy novo chega na hora); sem rede, a cópia salva;
//  · arquivos do jogo e fontes: cópia salva na hora + atualização em segundo plano. Como cada arquivo leva ?v=…,
//    um deploy novo baixa a versão nova e a antiga do mesmo arquivo é apagada (o cache não cresce);
//  · YouTube, servidor de legendas, PeerJS e o resto de fora: direto da rede, nunca guardados.
// Notificação de convite (tocada com o jogo em segundo plano): o toque abre/foca o jogo já entrando na sala.
const CACHE = 'mage-v1';
const SHELL = ['./', './index.html', './manifest.webmanifest', './assets/icon-192.png', './assets/icon-512.png'];
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(() => {}));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

async function putFresh(req, res) {
  const c = await caches.open(CACHE), u = new URL(req.url);
  // remove as versões antigas do mesmo arquivo (mesmo caminho, outro ?v=)
  if (u.origin === self.location.origin) {
    for (const k of await c.keys()) { const ku = new URL(k.url); if (ku.pathname === u.pathname && ku.search !== u.search) c.delete(k) }
  }
  await c.put(req, res);
}
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const u = new URL(req.url), same = u.origin === self.location.origin;
  if (!same && !FONT_HOSTS.includes(u.hostname)) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(res => { if (res.ok) putFresh(new Request('./index.html'), res.clone()); return res })
      .catch(() => caches.match('./index.html').then(r => r || caches.match('./'))));
    return;
  }
  e.respondWith(caches.match(req).then(hit => {
    const net = fetch(req).then(res => { if (res.ok || res.type === 'opaque') putFresh(req, res.clone()); return res }).catch(() => hit);
    return hit || net;
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const code = e.notification.data && e.notification.data.code, url = './' + (code ? '?room=' + encodeURIComponent(code) : '');
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const w of list) { w.postMessage({ t: 'invite-open', code }); return w.focus() }
    return self.clients.openWindow(url);
  }));
});
