// Mage Animals — js/systems/multiplayer.js · Duelo online P2P (WebRTC via PeerJS) com salas por código/link e Lobby.
// Sem servidor próprio: o PeerJS usa o servidor público de sinalização só para os dois navegadores se acharem; depois
// os dados vão direto de um para o outro (DataChannel confiável). A biblioteca é carregada SÓ quando o jogador abre o
// duelo online (nada pesa no carregamento do jogo).
//
// Protocolo (objetos pequenos):
//  hello{p}      perfil (nick, avatar, nível, mago e cores equipadas)  · ready{v}   convidado pronto/não pronto
//  mode{m}       modo escolhido pelo anfitrião                         · emote{i}   balão rápido
//  start{m,seed} começa o duelo (mesma semente = mesma sequência)      · lobby      voltar ao lobby após a partida
//  prog{w,ty,wpm} palavra/progresso do rival · atk{d} dano · hp{v} vida confirmada · ko  caí · bye  saí
'use strict';

const PEER_PREFIX='mage-animals-v1-';
const PEER_LIBS=['https://cdnjs.cloudflare.com/ajax/libs/peerjs/1.5.4/peerjs.min.js','https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js'];
const ONLINE_MODES=[['words','⌨️'],['letters','✍️'],['runes','🔮']];
const EMOTES=['bora','luck','wait','gg'];

const Net={
 peer:null,conn:null,role:null,code:'',state:'idle',err:'',mode:'words',
 remote:null,ready:false,joinDraft:'',invitee:'',bubbles:{me:'',them:''},_bt:{},_libP:null,_to:0,
 // ---------- biblioteca ----------
 lib(){
  if(window.Peer)return Promise.resolve();
  if(this._libP)return this._libP;
  const tryLoad=i=>new Promise((ok,fail)=>{const s=document.createElement('script');s.src=PEER_LIBS[i];s.async=true;s.onload=ok;s.onerror=fail;document.head.appendChild(s)})
   .catch(()=>{if(i+1<PEER_LIBS.length)return tryLoad(i+1);throw new Error('lib')});
  return this._libP=tryLoad(0).catch(e=>{this._libP=null;throw e});
 },
 // ---------- código / link ----------
 genCode(){return'MAGO-'+String(Math.floor(100000+Math.random()*900000))},
 /** aceita "MAGO-123456", "mago123456", "123456" ou o link inteiro */
 parseCode(s){const m=String(s||'').toUpperCase().match(/(\d{6})/);return m?'MAGO-'+m[1]:''},
 peerId(code){return PEER_PREFIX+code.replace('-','').toLowerCase()},
 link(){return location.origin+location.pathname+'?room='+this.code},
 me(){const ch=Inventory.dressed(CHARS[selected]);return{nick:nickOr(),handle:PlayerIdentity.handle,av:profile.avatar,lvl:profile.level,ch:CHARS[selected].id,robe:ch.robe,robeDark:ch.robeDark,color:ch.color,touch:DeviceManager.isTouch}},
 set(st,err){this.state=st;this.err=err||'';this.render()},
 render(){if(modalOpen&&modal.kind==='online'){const c=$('olCode');if(c)this.joinDraft=c.value;renderModal()}renderNav()},
 // ---------- anfitrião ----------
 async host(invitee){
  this.reset(true);this.role='host';this.invitee=invitee||'';this.set('loading');
  try{await this.lib()}catch(e){return this.set('error','lib')}
  const open=()=>{
   this.code=this.genCode();const p=new Peer(this.peerId(this.code),{debug:0});this.peer=p;
   p.on('open',()=>{this.set('waiting');if(this.autoCopy){this.autoCopy=false;this.copy()}
    if(this.inviteHandle&&typeof Presence!=='undefined'){const h=this.inviteHandle;this.inviteHandle='';this.invited='sending';this.render();Presence.invite(h,this.code).then(ok=>{this.invited=ok?'sent':'fail';this.render()})}}); // "Desafiar" de um amigo: o link já vai para a área de transferência
   p.on('connection',c=>{
    if(this.conn&&this.conn.open){c.on('open',()=>{c.send({t:'full'});setTimeout(()=>c.close(),400)});return}
    this.bind(c);
   });
   p.on('error',e=>{if(e.type==='unavailable-id'){p.destroy();open()}else if(this.state!=='lobby')this.set('error',e.type||'net')});
   p.on('disconnected',()=>{try{p.reconnect()}catch(_){}}); // sinalização caiu: o duelo em curso (P2P) continua
  };
  open();
 },
 // ---------- convidado ----------
 async join(raw){
  const code=this.parseCode(raw);if(!code)return this.set('idle','badcode');
  this.reset(true);this.role='guest';this.code=code;this.set('joining');
  try{await this.lib()}catch(e){return this.set('error','lib')}
  const p=new Peer({debug:0});this.peer=p;
  p.on('open',()=>{this.bind(p.connect(this.peerId(code),{reliable:true,serialization:'json'}));
   clearTimeout(this._to);this._to=setTimeout(()=>{if(this.state==='joining')this.set('error','notfound')},15000)});
  p.on('error',e=>{if(this.state==='joining'||this.state==='loading')this.set('error',e.type==='peer-unavailable'?'notfound':(e.type||'net'))});
 },
 bind(c){
  this.conn=c;
  c.on('open',()=>{clearTimeout(this._to);this.seen=Date.now();this.beat();this.send({t:'hello',p:this.me()});if(this.role==='host')this.send({t:'mode',m:this.mode})});
  c.on('data',d=>{this.seen=Date.now();this.onData(d)});
  c.on('close',()=>this.onClose());
  c.on('error',()=>this.onClose());
 },
 send(o){try{if(this.conn&&this.conn.open)this.conn.send(o)}catch(_){}},
 // 💓 batimento: o PeerJS nem sempre avisa quando o outro lado some (aba fechada, rede caiu, celular bloqueou).
 //  Cada lado manda ping a cada 2 s; 7 s sem NENHUMA mensagem = desconectado.
 seen:0,_hb:0,
 beat(){clearInterval(this._hb);this._hb=setInterval(()=>{if(!this.conn){clearInterval(this._hb);return}this.send({t:'ping'});if(Date.now()-this.seen>7000){clearInterval(this._hb);try{this.conn.close()}catch(_){}this.onClose()}},2000)},
 onData(d){
  if(!d||typeof d!=='object')return;
  switch(d.t){
   case'hello':this.remote=Object.assign({ready:false},d.p);this.ready=false;this.set('lobby');snd(880,.12,'triangle',.05);break;
   case'full':this.set('error','full');break;
   case'mode':this.mode=ONLINE_MODES.some(m=>m[0]===d.m)?d.m:'words';this.render();break;
   case'ready':if(this.remote){this.remote.ready=!!d.v;this.render();snd(d.v?988:520,.08,'triangle',.04)}break;
   case'emote':this.bubble('them',d.i);break;
   case'start':if(this.role==='guest')startOnlineDuel({mode:d.m,seed:d.seed,lang:d.lang});break;
   case'lobby':if(this.remote)this.remote.ready=false;this.ready=false;if(state!=='play')this.render();break;
   case'bye':this.onClose();break;
   case'ping':break;
   default:if(typeof pvpData==='function')pvpData(d); // prog / atk / hp / ko → batalha (pvp.js)
  }
 },
 onClose(){
  if(!this.conn)return;this.conn=null;const was=this.state;
  if(typeof pvpDisconnected==='function'&&pvpDisconnected())return; // em batalha: vitória por W.O.
  if(was==='lobby'){this.remote=null;this.ready=false;this.set(this.role==='host'?'waiting':'error','left')}
 },
 // ---------- lobby ----------
 setMode(m){if(this.role!=='host')return;this.mode=m;this.send({t:'mode',m});this.render();snd(660,.06,'triangle',.04)},
 toggleReady(){this.ready=!this.ready;this.send({t:'ready',v:this.ready});this.render();snd(this.ready?988:520,.08,'triangle',.04)},
 canStart(){return this.role==='host'&&!!this.remote&&this.remote.ready&&!!(this.conn&&this.conn.open)},
 start(){if(!this.canStart())return;const seed=(Math.random()*2**31)|0;this.send({t:'start',m:this.mode,seed,lang:LANG});startOnlineDuel({mode:this.mode,seed,lang:LANG})},
 emote(i){this.send({t:'emote',i});this.bubble('me',i)},
 bubble(who,i){if(!EMOTES[i])return;this.bubbles[who]=t('online.emote.'+EMOTES[i]);clearTimeout(this._bt[who]);
  this._bt[who]=setTimeout(()=>{this.bubbles[who]='';if(state!=='play')this.render()},2600);
  if(state==='play'&&typeof pvpEmote==='function')pvpEmote(who,this.bubbles[who]);else this.render();snd(1200,.05,'triangle',.03)},
 backToLobby(){this.ready=false;if(this.remote)this.remote.ready=false;this.send({t:'lobby'});showMenu();openModal('online')},
 // ---------- saída ----------
 autoCopy:false,inviteHandle:'',invited:'',
 reset(keepState){
  clearTimeout(this._to);clearInterval(this._hb);try{if(this.conn)this.conn.close()}catch(_){}try{if(this.peer)this.peer.destroy()}catch(_){}
  this.conn=this.peer=null;this.remote=null;this.invited='';this.ready=false;this.code='';this.role=null;this.bubbles={me:'',them:''};
  if(!keepState){this.state='idle';this.err=''}
 },
 leave(){this.send({t:'bye'});this.invitee='';this.reset();this.render()},
 active(){return this.state==='waiting'||this.state==='lobby'},
 // ---------- compartilhar ----------
 async copy(){
  const txt=this.link();let ok=false;
  try{await navigator.clipboard.writeText(txt);ok=true}catch(_){ // fallback (http sem permissão de clipboard)
   const ta=document.createElement('textarea');ta.value=txt;ta.style.cssText='position:fixed;opacity:0';document.body.appendChild(ta);ta.select();try{ok=document.execCommand('copy')}catch(__){}ta.remove()}
  const b=$('olCopy');if(b){b.textContent=ok?'✓ '+t('online.copied'):t('online.copyFail');setTimeout(()=>{const x=$('olCopy');if(x)x.textContent='🔗 '+t('online.copy')},1800)}
  snd(ok?988:300,.08,'triangle',.04);
 },
 share(){const txt=t('online.shareText',{c:this.code});if(navigator.share)navigator.share({title:'Mage Animals',text:txt,url:this.link()}).catch(()=>{});else this.copy()},
 whatsapp(){return'https://wa.me/?text='+encodeURIComponent(t('online.shareText',{c:this.code})+' '+this.link())}
};

// ================== UI: modal "Duelo Online" (#online-modal) ==================
function onlineJoinFromInput(){const c=$('olCode');Net.joinDraft=c?c.value:'';Net.join(Net.joinDraft)}
function mageCard(p,who,status){
 const base=CHARS.find(c=>c.id===p.ch)||CHARS[0],b=Net.bubbles[who];
 return`<div class="olcard ${who}"><div class="olav" style="--c:${p.color||base.color}"><span>${base.emoji}</span></div>
  <b class="olnick">${p.av||''} ${esc(p.nick||'?')}</b>${p.handle?`<i class="olhandle">${esc(p.handle)}</i>`:''}<small>${t('ui.lvl')} ${p.lvl||1} · ${charName(base)}${p.touch?' · 📱':''}</small>
  <span class="olst ${status.cls}">${status.txt}</span>${b?`<i class="olbubble">${esc(b)}</i>`:''}</div>`;
}
function tabOnline(){
 const N=Net,st=N.state;
 if(st==='loading'||st==='joining')return`<div class="olwait"><div class="olspin"></div><p>${t(st==='joining'?'online.joining':'online.connecting',{c:N.code})}</p><button class="btn ghost sm" onclick="Net.leave()">${t('online.cancel')}</button></div>`;
 if(st==='error')return`<div class="olwait"><div class="olerr">⚠️</div><p>${t('online.err.'+(['lib','notfound','full','left','badcode'].includes(N.err)?N.err:'net'))}</p><button class="btn sm" onclick="Net.leave()">${t('online.back')}</button></div>`;
 if(st==='waiting')return`<div class="olroom" id="online-modal">
  <p class="msub center">${N.invitee?t('online.inviteFor',{n:esc(N.invitee)}):t('online.shareHint')}</p>${N.invited?`<p class="olinv ${N.invited}">${t('presence.inv.'+N.invited)}</p>`:''}
  <div class="olcode"><small>${t('online.roomCode')}</small><b>${N.code}</b></div>
  <div class="ollink"><input readonly value="${esc(N.link())}" onclick="this.select()" aria-label="link"><button class="btn sm" id="olCopy" onclick="Net.copy()">🔗 ${t('online.copy')}</button></div>
  <div class="olshare"><a class="pill-wa" href="${N.whatsapp()}" target="_blank" rel="noopener">🟢 WhatsApp</a>${navigator.share?`<button class="pill-sh" onclick="Net.share()">📤 ${t('online.share')}</button>`:''}</div>
  <div class="olwait inline"><div class="olspin sm"></div><p>${t('online.waitingRival')}</p></div>
  <button class="btn ghost sm" onclick="Net.leave()">${t('online.closeRoom')}</button></div>`;
 if(st==='lobby'&&N.remote){
  const host=N.role==='host',me=N.me(),hostP=host?me:N.remote,guestP=host?N.remote:me;
  const guestReady=host?N.remote.ready:N.ready;
  const stHost={cls:'ok',txt:'👑 '+t('online.host')+' · '+t('online.readyTag')},stGuest=guestReady?{cls:'ok',txt:t('online.readyTag')}:{cls:'wait',txt:t('online.waitingTag')};
  const modes=ONLINE_MODES.map(([m,ic])=>`<button class="olmode ${N.mode===m?'on':''}" ${host?`onclick="Net.setMode('${m}')"`:'disabled'}>${ic} <b>${t('online.mode.'+m)}</b><small>${t('online.modeSub.'+m)}</small></button>`).join('');
  return`<div class="ollobby" id="online-modal">
   <div class="olplayers">${mageCard(hostP,host?'me':'them',stHost)}<div class="olvs">VS</div>${mageCard(guestP,host?'them':'me',stGuest)}</div>
   <h4>${t('online.chooseMode')}${host?'':` <small>(${t('online.hostChooses')})</small>`}</h4><div class="olmodes">${modes}</div>
   ${N.mode==='runes'&&!(me.touch&&N.remote.touch)?`<p class="olnote">📱 ${t('online.runesTouch')}</p>`:''}
   <div class="olemotes">${EMOTES.map((e,i)=>`<button onclick="Net.emote(${i})">${t('online.emote.'+e)}</button>`).join('')}</div>
   <div class="olact">${host?`<button class="btn ${N.canStart()?'':'off'}" ${N.canStart()?'':'disabled'} onclick="Net.start()">⚔️ ${t('online.start')}</button>${N.canStart()?'':`<small>${t('online.waitReady')}</small>`}`
    :`<button class="btn ${N.ready?'ghost':''}" onclick="Net.toggleReady()">${N.ready?'✋ '+t('online.notReady'):'✅ '+t('online.imReady')}</button>`}
    <button class="btn ghost sm" onclick="Net.leave()">🚪 ${t('online.leave')}</button></div>
   <p class="msub center">${t('online.roomCode')}: <b class="gold">${N.code}</b></p></div>`;
 }
 // início: criar ou entrar
 return`<div class="olhome" id="online-modal">
  <div class="olopt"><span class="olic">🏰</span><b>${t('online.create')}</b><small>${t('online.createSub')}</small><button class="btn sm" onclick="Net.host()">${t('online.createBtn')}</button></div>
  <div class="olopt"><span class="olic">🔑</span><b>${t('online.join')}</b><small>${t('online.joinSub')}</small>
   <div class="oljoin"><input id="olCode" maxlength="40" placeholder="MAGO-123456" value="${esc(Net.joinDraft)}" autocomplete="off" spellcheck="false" onkeydown="if(event.key==='Enter'){event.preventDefault();event.stopPropagation();onlineJoinFromInput()}"><button class="btn sm" onclick="onlineJoinFromInput()">${t('online.joinBtn')}</button></div>
   ${N.err==='badcode'?`<small class="olbad">${t('online.err.badcode')}</small>`:''}</div>
  <p class="msub center">🌐 ${t('online.p2pNote')}</p>${battleHistoryHTML()}</div>`;
}

// convite por link: ?room=MAGO-123456 abre o duelo online e entra na sala
addEventListener('load',()=>{
 const code=Net.parseCode(new URLSearchParams(location.search).get('room'));if(!code)return;
 history.replaceState(null,'',location.pathname); // tira o ?room da barra (recarregar não reentra)
 setTimeout(()=>{if(modalOpen)closeModal();openModal('online');Net.join(code)},700);
});
addEventListener('beforeunload',()=>{Net.send({t:'bye'})});
