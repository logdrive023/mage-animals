// Mage Animals — js/systems/storage.js · Gerenciador de armazenamento (100% local por enquanto).
// TODA leitura/gravação de progresso passa por aqui. Para ligar um banco de dados no futuro basta trocar o
// ADAPTADOR (get/set/remove) — o resto do jogo continua chamando StorageManager e não muda.
// Chaves: mage_profile (perfil completo: level, xp, aura = moedas, chests = baús…) · mage_inventory · preferências avulsas.
'use strict';

// adaptador padrão: localStorage do navegador (síncrono). Um adaptador remoto teria a mesma interface.
const LocalStorageAdapter={
 get(k){try{return localStorage.getItem(k)}catch(e){return null}},
 set(k,v){try{localStorage.setItem(k,v);return true}catch(e){return false}}, // cota cheia / modo privado: falha sem quebrar o jogo
 remove(k){try{localStorage.removeItem(k)}catch(e){}}
};

const StorageManager={
 prefix:'mage_',
 schema:2, // v2 = inventário de cosméticos + baús
 adapter:LocalStorageAdapter,
 read(key,def){const raw=this.adapter.get(this.prefix+key);if(raw==null)return def;try{return JSON.parse(raw)}catch(e){return def}},
 write(key,val){return this.adapter.set(this.prefix+key,JSON.stringify(val))},
 remove(key){this.adapter.remove(this.prefix+key)},

 // ---------- perfil ----------
 // O perfil inteiro é um objeto só (nível, XP, Aura, baús, títulos, missões…). Os campos "de conta" pedidos ficam
 // expostos por summary(): level, xp, aura_coins (= profile.aura, a moeda do jogo) e chests_owned (= profile.chests).
 loadProfile(defaults){
  const p=Object.assign({},defaults,this.read('profile',{}));
  const v=this.read('schema',1);
  if(v<2){ // migração: quem já jogava ganha 2 baús de boas-vindas ao chegar o sistema de coleção
   if(typeof p.chests!=='number')p.chests=2;
   this.write('schema',this.schema);
  }
  if(typeof p.chests!=='number')p.chests=2; // jogador novo também começa com 2
  return p;
 },
 saveProfile(p){return this.write('profile',p)},
 summary(p){return{level:p.level|0,xp:Math.floor(p.xp||0),aura_coins:Math.floor(p.aura||0),chests_owned:p.chests|0}},

 // ---------- inventário de cosméticos ----------
 // owned: ids desbloqueados · equipped: um id (ou null) por categoria
 defaultInventory(){return{owned:[],equipped:{hat:null,cape:null,staff:null,aura:null}}},
 loadInventory(){
  const inv=this.read('inventory',null),d=this.defaultInventory();
  if(!inv||typeof inv!=='object')return d;
  return{owned:Array.isArray(inv.owned)?inv.owned.slice():[],equipped:Object.assign(d.equipped,inv.equipped||{})};
 },
 saveInventory(inv){return this.write('inventory',{owned:inv.owned,equipped:inv.equipped})},

 // ---------- 🏆 ranking segmentado: modo (words/letters/runes) × período (daily/weekly/monthly/all) ----------
 // chave mage_leaderboard_{mode}_{period} = {pk, me:{score,wpm,wave,date}} · pk = identificador do período
 // (2026-10-15 · 2026-W42 · 2026-10 · all). Período virou → a chave zera sozinha na próxima leitura.
 LB_MODES:['words','letters','runes'],LB_PERIODS:['daily','weekly','monthly','all'],
 periodKey(period,d){
  d=d||new Date();const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');
  if(period==='daily')return y+'-'+m+'-'+day;
  if(period==='monthly')return y+'-'+m;
  if(period==='weekly'){const t=new Date(Date.UTC(y,d.getMonth(),d.getDate())),dn=t.getUTCDay()||7;t.setUTCDate(t.getUTCDate()+4-dn);const y0=new Date(Date.UTC(t.getUTCFullYear(),0,1));return t.getUTCFullYear()+'-W'+String(Math.ceil(((t-y0)/864e5+1)/7)).padStart(2,'0')}
  return'all';
 },
 loadBoard(mode,period){
  const pk=this.periodKey(period),b=this.read('leaderboard_'+mode+'_'+period,null);
  return b&&b.pk===pk?b:{pk,me:null};
 },
 /** registra o resultado de uma partida nos 4 períodos do modo (cada campo guarda o melhor) */
 submitScore(mode,r){
  if(!this.LB_MODES.includes(mode))return;
  for(const p of this.LB_PERIODS){const b=this.loadBoard(mode,p),m=b.me||{score:0,wpm:0,wave:0};
   b.me={score:Math.max(m.score,r.score|0),wpm:Math.max(m.wpm,r.wpm|0),wave:Math.max(m.wave,r.wave|0),date:Date.now()};
   this.write('leaderboard_'+mode+'_'+p,b)}
 },

 // ---------- 🆔 identidade: @handle permanente (chave pública) · o apelido fica em profile.nickname ----------
 loadIdentity(){const d=this.read('identity',null);return d&&typeof d.handle==='string'?d:null},
 saveIdentity(d){return this.write('identity',d)},

 // ---------- 👥 amigos: mage_friends_list = [{handle,name,ch,lvl,st,added}] (mock local; vira lista do servidor) ----------
 loadFriendsList(){const f=this.read('friends_list',null);return Array.isArray(f)?f:null},
 saveFriendsList(list){return this.write('friends_list',list)},
 legacyFriends(){const f=this.read('friends',null);return Array.isArray(f)?f:null} // formato antigo (por apelido) → migrado uma vez
};
