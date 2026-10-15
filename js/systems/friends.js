// Mage Animals — js/systems/friends.js · Amigos por @handle (mock 100% local, pronto para API).
// FriendsManager expõe métodos ASSÍNCRONOS (list/add/remove/refreshStatuses) que hoje usam o StorageManager
// (mage_friends_list). Para o servidor, troque só o corpo deles por fetch():
//   list()            → GET  /friends                 add(handle)  → POST   /friends {handle}
//   remove(handle)    → DELETE /friends/:handle       refreshStatuses() → GET /friends/status
// A interface (#friends-modal) só conversa com o FriendsManager e com o cache que ele mantém.
'use strict';

const FRIENDS_DEF=[
 {handle:'@mago_zephyr',name:'Mago Zephyr ⚡',ch:'gato',lvl:24},
 {handle:'@luna_runas',name:'LunaRunas 🌙',ch:'coelho',lvl:31},
 {handle:'@kitsune_kai',name:'KitsuneKai',ch:'raposa',lvl:18},
 {handle:'@owl_master',name:'OwlMaster 🦉',ch:'coruja',lvl:12}
];
const FR_STATUS=['online','battle','offline'];
const FriendsManager={
 cache:[], // última lista conhecida (a UI desenha a partir dela, sem esperar)
 _hash(s){let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return Math.abs(h)},
 /** "perfil público" simulado de um handle (no servidor viria do GET /users/:handle) */
 _mockProfile(handle){
  const h=this._hash(handle),words=handle.slice(1).split('_').filter(Boolean);
  const name=words.map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(' ')||handle;
  return{handle,name,ch:CHARS[h%CHARS.length].id,lvl:1+h%40};
 },
 _roll(){const r=Math.random();return r<.42?'online':r<.62?'battle':'offline'},
 _save(){StorageManager.saveFriendsList(this.cache.map(({handle,name,ch,lvl,added})=>({handle,name,ch,lvl,added})))}, // status não é salvo: é "ao vivo"
 async list(){
  let l=StorageManager.loadFriendsList();
  if(!l){ // primeira vez: migra a lista antiga (por apelido) ou usa os amigos padrão
   const old=StorageManager.legacyFriends();
   l=old?old.map(f=>Object.assign(this._mockProfile('@'+(handleSlug(f.nick)||'mago')),{name:f.nick,ch:f.ch||'gato',lvl:f.lvl||1})):FRIENDS_DEF.map(f=>Object.assign({},f));
   StorageManager.saveFriendsList(l);
  }
  const st={};for(const f of this.cache)st[f.handle]=f.st;
  this.cache=l.map(f=>Object.assign({},f,{st:st[f.handle]||this._roll()}));
  return this.cache;
 },
 /** valida e adiciona: precisa começar com @, 3–20 de [a-z 0-9 _], não pode ser você nem repetido */
 async add(raw){
  let h=String(raw||'').trim().toLowerCase();
  if(!h.startsWith('@'))return{ok:false,err:'noat'};
  if(!HANDLE_RE.test(h))return{ok:false,err:'format'};
  if(h===PlayerIdentity.handle)return{ok:false,err:'self'};
  if(this.cache.some(f=>f.handle===h))return{ok:false,err:'dup'};
  const f=Object.assign(this._mockProfile(h),{added:Date.now(),st:this._roll()});
  this.cache.unshift(f);this._save();return{ok:true,friend:f};
 },
 async remove(handle){this.cache=this.cache.filter(f=>f.handle!==handle);this._save();return{ok:true}},
 /** 🎲 simulador de atividade: sorteia de novo o status de alguns amigos (no servidor seria presença real) */
 async refreshStatuses(all){for(const f of this.cache)if(all||Math.random()<.35)f.st=this._roll();return this.cache}
};

// ================== UI (#friends-modal) ==================
const FriendsUI={draft:'',msg:'',_iv:0,
 async open(){await FriendsManager.list();await FriendsManager.refreshStatuses(true);if(modalOpen&&modal.kind==='friends')renderModal();this.tick()},
 // enquanto o modal está aberto, os status "mudam sozinhos" a cada 12 s (só os selos são atualizados, sem redesenhar)
 tick(){clearInterval(this._iv);this._iv=setInterval(async()=>{
  if(!modalOpen||modal.kind!=='friends'){clearInterval(this._iv);return}
  await FriendsManager.refreshStatuses(false);
  for(const f of FriendsManager.cache){const row=document.querySelector(`.frrow[data-h="${f.handle}"]`);if(!row)continue;
   const s=row.querySelector('.frst'),[ic,cls]=FR_ST[f.st];s.className='frst '+cls;s.textContent=ic+' '+t('friends.st.'+f.st);row.querySelector('.frgo').disabled=f.st==='battle'}
 },12000)},
 async add(){const i=$('frNick');this.draft=i?i.value:'';const r=await FriendsManager.add(this.draft);
  this.msg=r.ok?'added':r.err;if(r.ok)this.draft='';renderModal();snd(r.ok?988:300,.08,'triangle',.04);if(!r.ok){const n=$('frNick');if(n){n.focus()}}},
 async remove(h){await FriendsManager.remove(h);this.msg='';renderModal();snd(420,.08,'triangle',.04)},
 /** Desafiar: cria a sala P2P e copia o link de convite assim que ela abrir */
 challenge(h){const f=FriendsManager.cache.find(x=>x.handle===h);Net.autoCopy=true;openModal('online');Net.host(f?f.name+' ('+h+')':h)}
};
const FR_ST={online:['🟢','ok'],battle:['⚔️','bat'],offline:['⚪','off']};
function friendsAddFromInput(){FriendsUI.add()}
function tabFriends(){
 const U=FriendsUI,m=U.msg;U.msg='';
 if(!FriendsManager.cache.length&&!U._loading){U._loading=true;FriendsUI.open().then(()=>{U._loading=false})}
 const rows=FriendsManager.cache.map(f=>{const c=CHARS.find(x=>x.id===f.ch)||CHARS[0],[ic,cls]=FR_ST[f.st]||FR_ST.offline;
  return`<div class="frrow" data-h="${esc(f.handle)}"><span class="frav" style="--c:${c.color}">${c.emoji}</span>
   <div class="frinfo"><b>${esc(f.name)}</b><small><i class="frh">${esc(f.handle)}</i> · ${t('ui.lvl')} ${f.lvl}</small></div>
   <span class="frst ${cls}">${ic} ${t('friends.st.'+f.st)}</span>
   <button class="btn sm frgo" ${f.st==='battle'?'disabled':''} onclick="FriendsUI.challenge('${esc(f.handle)}')">⚔️ ${t('friends.challenge')}</button>
   <button class="frdel" title="${esc(t('friends.remove'))}" aria-label="${esc(t('friends.remove'))}" onclick="FriendsUI.remove('${esc(f.handle)}')">✕</button></div>`}).join('');
 return`<div class="friends" id="friends-modal">
  <div class="frme"><span>🆔 ${t('friends.yourHandle')}</span><b>${esc(PlayerIdentity.handle)}</b><button class="frcopy" onclick="PlayerIdentity.copyHandle(this)" title="${esc(t('friends.copyHandle'))}">⧉</button><small>${t('friends.shareHandle')}</small></div>
  <div class="fradd"><input id="frNick" maxlength="21" placeholder="${esc(t('friends.placeholder'))}" value="${esc(U.draft)}" autocomplete="off" autocapitalize="none" spellcheck="false" onkeydown="if(event.key==='Enter'){event.preventDefault();event.stopPropagation();friendsAddFromInput()}">
   <button class="btn sm" onclick="friendsAddFromInput()">➕ ${t('friends.add')}</button></div>
  ${m?`<p class="frmsg ${m==='added'?'ok':'bad'}">${t('friends.msg.'+m)}</p>`:''}
  <div class="frlist">${rows||`<p class="msub center">${t('friends.empty')}</p>`}</div>
  <p class="msub center">🔒 ${t('friends.note')}</p></div>`;
}
