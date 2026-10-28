// Mage Animals — js/systems/mobile.js · Extras SÓ do celular (iPhone e Android):
//  📲 instalar na tela inicial (PWA, sw.js) · 🔆 tela acesa durante a partida · 📳 vibração (só Android: o Safari não vibra) ·
//  🔋 30 FPS para poupar bateria · 🔠 tecla ampliada no teclado do jogo · 📤 compartilhar o resultado como imagem ·
//  📱↻ dica de girar no modo música · 🔔 aviso de convite de duelo com o jogo em segundo plano.
// Tudo checa MOB() na hora (DeviceManager.isMobile): no PC nada disto aparece nem roda (só o service worker, que é inofensivo).
'use strict';

const MOB=()=>DeviceManager.isMobile;
const IS_IOS=/iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const isStandalone=()=>matchMedia('(display-mode: standalone)').matches||matchMedia('(display-mode: fullscreen)').matches||navigator.standalone===true;

// ---------- 💬 aviso flutuante simples (topo da tela) ----------
function mobToast(html,ms){
 let el=$('mobToast');if(!el){el=document.createElement('div');el.id='mobToast';el.className='mobtoast';el.onclick=()=>el.classList.remove('on');document.body.appendChild(el)}
 el.innerHTML=html;el.classList.add('on');clearTimeout(mobToast._t);mobToast._t=setTimeout(()=>el.classList.remove('on'),ms||4000);
}

// ---------- 📲 PWA: service worker + instalar ----------
let swReg=null,installEvt=null;
if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1')){
 addEventListener('load',()=>navigator.serviceWorker.register('sw.js').then(r=>{swReg=r}).catch(()=>{}));
 // toque na notificação de convite com o jogo já aberto: o service worker avisa e a página entra na sala
 navigator.serviceWorker.addEventListener('message',e=>{const d=e.data||{};if(d.t==='invite-open'&&d.code)mobJoinInvite(d.code)});
}
addEventListener('beforeinstallprompt',e=>{e.preventDefault();installEvt=e;pwaChipSync()}); // Android/Chrome: guardamos o convite de instalar
addEventListener('appinstalled',()=>{installEvt=null;store.set('pwaHide',1);pwaChipSync()});
const pwaCan=()=>MOB()&&!isStandalone()&&(!!installEvt||IS_IOS);
function pwaInstall(){
 if(installEvt){const ev=installEvt;installEvt=null;ev.prompt();ev.userChoice.then(c=>{if(c&&c.outcome==='accepted')store.set('pwaHide',1);pwaChipSync()}).catch(()=>{});return}
 if(IS_IOS)mobToast(`<b>📲 ${t('mob.iosTitle')}</b><span>${t('mob.iosHow')}</span>`,10000); // iPhone: só dá pelo menu Compartilhar do Safari
}
function pwaChipSync(){
 let el=$('pwaChip');const show=pwaCan()&&!store.get('pwaHide',0)&&state==='menu'&&!modalOpen&&!openSheetSide;
 if(!show){if(el&&el.classList.contains('on'))el.classList.remove('on');return}
 if(!el){el=document.createElement('div');el.id='pwaChip';el.className='pwachip';document.body.appendChild(el)}
 if(el.dataset.lang!==LANG){el.dataset.lang=LANG;el.innerHTML=`<button class="pw-go" onclick="pwaInstall()">📲 ${t('mob.install')}</button><button class="pw-x" aria-label="×" onclick="store.set('pwaHide',1);pwaChipSync()">×</button>`} // só remonta ao trocar de idioma
 if(!el.classList.contains('on'))el.classList.add('on');
}

// ---------- 🔆 tela acesa durante a partida (Screen Wake Lock: iPhone iOS 16.4+ e Android) ----------
let wake=null,wakeBusy=false;
function wakeSync(){
 const want=MOB()&&state==='play'&&!document.hidden&&'wakeLock' in navigator;
 if(want&&!wake&&!wakeBusy){wakeBusy=true;navigator.wakeLock.request('screen').then(l=>{wake=l;l.addEventListener('release',()=>{wake=null})}).catch(()=>{}).finally(()=>{wakeBusy=false})}
 else if(!want&&wake){const l=wake;wake=null;l.release().catch(()=>{})}
}

// ---------- 📳 vibração (Android; o Safari do iPhone não tem a API) ----------
const HAPTIC_OK='vibrate' in navigator;
const BUZZ={word:12,miss:18,tower:[50,40,90],perfect:[10,25,10],hit:35,ko:[80,50,160],over:[120,60,220],frozen:[25,25,25,25,25]};
function buzz(k){if(!MOB()||!HAPTIC_OK||!store.get('haptics',true))return;try{navigator.vibrate(BUZZ[k]||k)}catch(_){}}

// ---------- 🔋 30 FPS: sempre, nunca ou automático (bateria ≤ 20% e fora da tomada — só o Android informa a bateria) ----------
let BAT=null;
function batterySync(){
 const m=store.get('batterySaver','auto');
 LOW_FPS=MOB()&&(m==='on'||(m==='auto'&&!!BAT&&BAT.level<=.2&&!BAT.charging));
}
function setBatterySaver(m){store.set('batterySaver',m);batterySync()}
if(navigator.getBattery)navigator.getBattery().then(b=>{BAT=b;b.addEventListener('levelchange',batterySync);b.addEventListener('chargingchange',batterySync);batterySync()}).catch(()=>{});

// ---------- 🔠 tecla ampliada: o dedo cobre a letra, então ela aparece grande logo acima (como no teclado do iPhone) ----------
document.addEventListener('pointerdown',e=>{
 if(!MOB()||state!=='play')return;const k=e.target.closest&&e.target.closest('#kb [data-k],#kacc [data-k]');if(!k)return;
 let p=$('kpop');if(!p){p=document.createElement('div');p.id='kpop';p.className='kpop';document.body.appendChild(p)}
 const r=k.getBoundingClientRect();p.textContent=k.textContent;
 p.style.left=Math.round(Math.max(4,Math.min(innerWidth-60,r.left+r.width/2-28)))+'px';p.style.top=Math.round(Math.max(4,r.top-66))+'px';
 p.classList.remove('on');void p.offsetWidth;p.classList.add('on');clearTimeout(p._t);p._t=setTimeout(()=>p.classList.remove('on'),260);
},true);

// ---------- 📤 compartilhar o resultado (imagem 1080×1080 + texto e link) ----------
let lastShare=null;
const gameUrlPath=()=>location.pathname.replace(/index\.html$/,''); // link limpo (sem "index.html")
const canShareUI=()=>MOB()&&!!navigator.share;
/** guarda o que vai na imagem: mago, título, 4 números e o texto da mensagem */
function shareSet(o){lastShare=Object.assign({ch:G&&G.ch?G.ch:CHARS[selected]},o)}
function shareCard(S){
 const cv=document.createElement('canvas');cv.width=cv.height=1080;const c=cv.getContext('2d');
 let g=c.createLinearGradient(0,0,0,1080);g.addColorStop(0,'#1d2360');g.addColorStop(1,'#07091a');c.fillStyle=g;c.fillRect(0,0,1080,1080);
 g=c.createRadialGradient(540,430,20,540,430,420);g.addColorStop(0,'rgba(255,214,130,.35)');g.addColorStop(1,'rgba(255,214,130,0)');c.fillStyle=g;c.fillRect(0,0,1080,1080);
 c.strokeStyle='#e9c878';c.lineWidth=10;c.strokeRect(30,30,1020,1020);c.lineWidth=2;c.strokeRect(50,50,980,980);
 c.textAlign='center';c.fillStyle='#ffe9a8';c.font='900 76px Cinzel, serif';c.fillText('MAGE ANIMALS',540,150);
 const p=document.createElement('canvas');p.width=p.height=140;(typeof drawCharPortrait==='function'?drawCharPortrait:drawAvatar)(p.getContext('2d'),S.ch,.6,false,false);
 c.drawImage(p,540-200,180,400,400);
 c.fillStyle='#ffffff';c.font='900 64px Cinzel, serif';c.fillText(fitTxt(c,S.head,940),540,660);
 if(S.sub){c.fillStyle='#c6cde8';c.font='800 34px Nunito, sans-serif';c.fillText(fitTxt(c,S.sub,940),540,712)}
 const st=S.stats||[],cw=940/Math.max(1,st.length);
 st.forEach(([l,v],i)=>{const x=70+cw*i+cw/2;c.fillStyle='rgba(10,14,40,.85)';c.beginPath();c.roundRect(x-cw/2+10,760,cw-20,170,24);c.fill();c.strokeStyle='rgba(233,200,120,.6)';c.lineWidth=3;c.stroke();
  c.fillStyle='#ffe9a8';c.font='900 64px Nunito, sans-serif';c.fillText(String(v),x,855);c.fillStyle='#aab4dc';c.font='800 28px Nunito, sans-serif';c.fillText(fitTxt(c,String(l).toUpperCase(),cw-40),x,900)});
 c.fillStyle='#8f9ac4';c.font='700 30px Nunito, sans-serif';c.fillText((location.host+gameUrlPath()).replace(/\/$/,''),540,1000);
 return cv;
}
async function shareResult(){
 const S=lastShare;if(!S)return;const url=location.origin+gameUrlPath(),text=S.text+' '+url;
 try{
  const blob=await new Promise(r=>shareCard(S).toBlob(r,'image/png')),file=blob&&new File([blob],'mage-animals.png',{type:'image/png'});
  if(file&&navigator.canShare&&navigator.canShare({files:[file]}))await navigator.share({files:[file],text,title:'Mage Animals'});
  else if(navigator.share)await navigator.share({title:'Mage Animals',text,url});
 }catch(e){if(e&&e.name==='AbortError')return;try{await navigator.clipboard.writeText(text);mobToast('✓ '+t('mob.copied'),2500)}catch(_){}}
}
const shareBtnHTML=()=>canShareUI()?`<button class="btn ghost" onclick="shareResult()">📤 ${t('mob.share')}</button>`:'';

// ---------- 📱↻ modo música em pé: deitado sobra espaço para o vídeo e o campo (3 vezes no máximo) ----------
function mobRotateHint(){
 if(!MOB()||innerWidth>innerHeight)return;const n=store.get('rotHint',0)|0;if(n>=3)return;store.set('rotHint',n+1);
 mobToast(`<b>📱↻ ${t('mob.rotateTitle')}</b><span>${t('mob.rotate')}</span>`,5000);
}

// ---------- 🔔 convite de duelo com o jogo em segundo plano (permissão pedida nos Ajustes) ----------
const NOTIF_OK='Notification' in window;
function notifAsk(){
 if(!NOTIF_OK){mobToast(t(IS_IOS?'mob.notifIos':'mob.notifNo'),6000);return}
 Notification.requestPermission().then(p=>{if(modalOpen)renderModal();mobToast(p==='granted'?'🔔 '+t('mob.notifOn'):t('mob.notifDenied'),4000)}).catch(()=>{});
}
function mobInviteNotify(d){
 if(!MOB()||!document.hidden||!NOTIF_OK||Notification.permission!=='granted'||!swReg)return;
 const n=(d.from&&d.from.name)||'?';
 swReg.showNotification('⚔️ Mage Animals',{body:t('presence.invited',{n}),icon:'assets/icon-192.png',badge:'assets/icon-192.png',tag:'invite',renotify:true,data:{code:Net.parseCode(d.code)},vibrate:[80,40,80]}).catch(()=>{});
}
function mobJoinInvite(code){
 code=Net.parseCode(code);if(!code)return;if(state==='play'&&G&&G.duel&&G.duel.online)return;if(state==='play')pause();
 if(modalOpen)closeModal();openModal('online');Net.join(code);
}

// ---------- ⚙️ Ajustes → "📱 Celular" (só aparece no celular) ----------
function mobSettingsHTML(){
 if(!MOB())return'';const bs=store.get('batterySaver','auto'),np=NOTIF_OK?Notification.permission:'';
 return`<h4>📱 ${t('mob.settings')}</h4>
 ${HAPTIC_OK?setSwitch(store.get('haptics',true),'📳',t('mob.haptics'),t('mob.hapticsHint'),"store.set('haptics',!store.get('haptics',true));buzz('perfect')",t('settings.on'),t('settings.off')):`<p class="msub">📳 ${t('mob.hapticsNo')}</p>`}
 <div class="genrow"><span class="glab">🔋 ${t('mob.battery')}</span><div class="langs">${[['auto','⚙️'],['on','🔋'],['off','⚡']].map(([m,ic])=>`<button class="langb ${bs===m?'sel':''}" onclick="keepNick();setBatterySaver('${m}');renderModal()"><span>${ic}</span>${t('mob.bat.'+m)}</button>`).join('')}</div></div>
 <p class="msub">${t('mob.batteryHint')}${LOW_FPS?' · <b>'+t('mob.batOnNow')+'</b>':''}</p>
 <div class="genrow"><span class="glab">🔔 ${t('mob.notif')}</span><div class="langs">${np==='granted'?`<span class="msub">✅ ${t('mob.notifOn')}</span>`:np==='denied'?`<span class="msub">${t('mob.notifDenied')}</span>`:`<button class="langb" onclick="notifAsk()"><span>🔔</span>${t('mob.notifAsk')}</button>`}</div></div>
 ${pwaCan()?`<div class="genrow"><span class="glab">📲 ${t('mob.app')}</span><div class="langs"><button class="langb" onclick="pwaInstall()"><span>📲</span>${t('mob.install')}</button></div></div>`:isStandalone()?`<p class="msub">📲 ${t('mob.installed')}</p>`:''}`;
}

// ---------- relógio de 1 s: tela acesa e chip de instalar seguem o estado do jogo ----------
setInterval(()=>{wakeSync();pwaChipSync()},1000);
document.addEventListener('visibilitychange',wakeSync);
batterySync();
