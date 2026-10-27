// Mage Animals — js/systems/presence.js · Presença REAL dos amigos + convites diretos (P2P, sem servidor próprio).
// Cada jogador com o jogo aberto fica "escutando" num endereço PeerJS derivado do próprio @handle.
//  · status de um amigo: conecta no endereço dele e pergunta {t:'who'} → ele responde {t:'st',st,name,lvl,ch}.
//    Sem resposta em 6 s (ou endereço inexistente) = Offline. Em duelo online = Em Batalha.
//  · desafiar: além do link, manda {t:'invite',code,from} direto → o amigo vê um aviso com "Aceitar".
// Privacidade: o endereço só é publicado no servidor público do PeerJS para quem TEM amigos na lista (ao abrir o jogo)
// ou quando o jogador abre "Amigos". Sem amigos, nada é carregado nem anunciado.
'use strict';

const PRES_PREFIX='mage-animals-v1-u-';
const presId=handle=>PRES_PREFIX+String(handle).slice(1).replace(/_/g,'-')+'-p'; // '_'→'-' (handles não têm '-'), termina em letra
const Presence={
 peer:null,ready:false,failed:false,pending:{},_p:null,
 /** liga o endereço de escuta → resolve true (pronto) ou false (sem rede, biblioteca falhou ou @handle aberto em outra aba) */
 start(){
  if(this._p)return this._p;
  return this._p=new Promise(async res=>{
   const fail=()=>{this.ready=false;this.failed=true;res(false)};
   try{await Net.lib()}catch(_){return fail()}
   const p=new Peer(presId(PlayerIdentity.handle),{debug:0});this.peer=p;
   const to=setTimeout(()=>{if(!this.ready)fail()},8000);
   p.on('open',()=>{clearTimeout(to);this.ready=true;this.failed=false;res(true)});
   this._bind(p,()=>{clearTimeout(to);fail()});
  });
 },
 /** depois de uma falha: descarta o peer para tentar de novo (ex.: a internet voltou) */
 reset(){try{if(this.peer)this.peer.destroy()}catch(_){}this.peer=null;this._p=null;this.ready=false;this.failed=false},
 _bind(p,onFail){
  p.on('connection',c=>{
   c.on('data',d=>{
    if(!d||typeof d!=='object')return;
    if(d.t==='who')c.send({t:'st',st:this.myStatus(),name:nickOr(),lvl:profile.level,ch:CHARS[selected].id});
    else if(d.t==='invite'&&Net.parseCode(d.code))this.showInvite(d);
   });
   setTimeout(()=>{try{c.close()}catch(_){}},8000); // conexões de consulta são curtas
  });
  p.on('error',e=>{
   if(e.type==='peer-unavailable'){const m=String(e.message||'').match(/peer\s+(\S+)/i);if(m)this.resolve(m[1],null)} // amigo sem o jogo aberto
   else if(!this.ready)onFail(); // unavailable-id (mesmo @handle em outra aba), rede, servidor…
  });
  p.on('disconnected',()=>{try{p.reconnect()}catch(_){}});
 },
 myStatus(){return state==='play'&&G&&G.duel&&G.duel.online?'battle':'online'},
 /** pergunta o status de um amigo → resolve com {st,...} ou null (offline) */
 ask(handle){
  return new Promise(res=>{
   if(!this.peer||this.peer.destroyed||this.peer.disconnected)return res(null);
   const id=presId(handle);if(this.pending[id])return this.pending[id].list.push(res);
   const done=v=>{const pd=this.pending[id];if(!pd)return;delete this.pending[id];clearTimeout(pd.to);try{pd.c.close()}catch(_){}pd.list.forEach(f=>f(v))};
   const c=this.peer.connect(id,{reliable:true,serialization:'json'});
   this.pending[id]={c,list:[res],to:setTimeout(()=>done(null),6000)};
   c.on('open',()=>c.send({t:'who'}));
   c.on('data',d=>{if(d&&d.t==='st')done(d)});
   c.on('error',()=>done(null));
  });
 },
 resolve(id,v){const pd=this.pending[id];if(!pd)return;delete this.pending[id];clearTimeout(pd.to);pd.list.forEach(f=>f(v))},
 /** atualiza o status (e nome/nível/mago reais) de todos os amigos e redesenha só os selos */
 async checkAll(){
  if(this.failed)this.reset();
  if(!(this.ready||await this.start())){ // sem presença: ninguém fica preso em "⏳ verificando"
   for(const f of FriendsManager.cache)f.st='offline';
   if(modalOpen&&modal.kind==='friends')FriendsUI.paint();return;
  }
  await Promise.all(FriendsManager.cache.map(async f=>{
   const r=await this.ask(f.handle);
   f.st=r?(r.st==='battle'?'battle':'online'):'offline';
   if(r){let ch=false;if(r.name&&r.name!==f.name){f.name=String(r.name).slice(0,16);ch=true}if(r.lvl&&r.lvl!==f.lvl){f.lvl=r.lvl|0;ch=true}if(r.ch&&CHARS.some(x=>x.id===r.ch)&&r.ch!==f.ch){f.ch=r.ch;ch=true}if(ch)FriendsManager._save()}
  }));
  if(modalOpen&&modal.kind==='friends')FriendsUI.paint();
 },
 /** convite direto para um amigo online (a sala já foi criada) */
 invite(handle,code){
  if(!this.peer||this.peer.destroyed)return Promise.resolve(false);
  return new Promise(res=>{const c=this.peer.connect(presId(handle),{reliable:true,serialization:'json'}),to=setTimeout(()=>{try{c.close()}catch(_){}res(false)},6000);
   c.on('open',()=>{c.send({t:'invite',code,from:{handle:PlayerIdentity.handle,name:nickOr()}});setTimeout(()=>{clearTimeout(to);try{c.close()}catch(_){}res(true)},600)});
   c.on('error',()=>{clearTimeout(to);res(false)})});
 },
 // aviso de convite recebido (canto da tela, por cima de tudo)
 showInvite(d){
  let el=$('inviteToast');if(!el){el=document.createElement('div');el.id='inviteToast';el.className='invtoast';document.body.appendChild(el)}
  const n=esc((d.from&&d.from.name)||'?'),h=esc((d.from&&d.from.handle)||''),code=Net.parseCode(d.code);
  el.innerHTML=`<b>⚔️ ${t('presence.invited',{n})}</b><small>${h} · ${code}</small><div><button class="btn sm" id="invOk">${t('presence.accept')}</button><button class="btn ghost sm" id="invNo">${t('presence.decline')}</button></div>`;
  el.classList.add('on');[880,1175,1568].forEach((f,i)=>snd(f,.15,'triangle',.05,0,i*.08));
  clearTimeout(this._it);this._it=setTimeout(()=>el.classList.remove('on'),30000);
  $('invNo').onclick=()=>el.classList.remove('on');
  $('invOk').onclick=()=>{el.classList.remove('on');if(state==='play'&&G&&G.duel&&G.duel.online)return;if(state==='play')pause();
   if(modalOpen)closeModal();openModal('online');Net.join(code)};
 }
};
// só quem tem amigos fica escutando desde o início (para receber convites); os demais ligam ao abrir "Amigos"
addEventListener('load',()=>setTimeout(()=>{if((StorageManager.loadFriendsList()||[]).length)Presence.start()},2500));
