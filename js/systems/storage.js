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
 saveInventory(inv){return this.write('inventory',{owned:inv.owned,equipped:inv.equipped})}
};
