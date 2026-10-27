// Mage Animals — js/systems/chests.js · Baús de recompensa (LÓGICA). A animação fica em js/ui/modal-chests.js.
// Cada baú tem uma RARIDADE sorteada na abertura (Comum → Único, CHEST_RARITIES em data.js) e SEMPRE dá 3 coisas:
// Aura, XP e 1 cosmético (o tier do cosmético depende da raridade; repetido vira Aura).
// O sorteio de TODOS os baús abertos é salvo em profile.pendingChest = {list:[...]} ANTES da animação:
// fechar a aba no meio não perde nada (é coletado no próximo carregamento).
'use strict';

const Chests={
 count(){return profile.chests|0},
 add(n){profile.chests=(profile.chests|0)+n;saveProfile();if(typeof renderNav==='function')renderNav()},
 rollRarity(){let r=Math.random()*100;for(const R of CHEST_RARITIES){if(r<R.chance)return R;r-=R.chance}return CHEST_RARITIES[0]},
 /** sorteia um baú: raridade + as 3 recompensas. `own` = itens já possuídos (inclui os do mesmo lote → repetido dentro do lote vira Aura) */
 roll(own){
  const b=Inventory.bonuses(),R=this.rollRarity(),[x0,x1]=CHEST_DROPS.xp(profile.level);
  const aura=Math.round((R.aura[0]+Math.random()*(R.aura[1]-R.aura[0]))*(1+b.aura/100));
  const xp=Math.round((x0+Math.random()*(x1-x0))*R.xp);
  const it=rollCosmetic(R.items),dup=own.has(it.id);if(!dup)own.add(it.id);
  return{rar:R.id,aura,xp,item:it.id,dup,dupAura:dup?Math.round(ITEM_TIERS[it.tier].dup*(1+b.aura/100)):0};
 },
 /** gasta n baús (ou todos) e devolve a lista sorteada — ainda NÃO aplicada */
 openMany(n){
  n=Math.min(this.count(),Math.max(1,n|0));if(n<=0)return null;
  const own=new Set(Inventory.data.owned),list=[];for(let i=0;i<n;i++)list.push(this.roll(own));
  profile.chests-=n;profile.pendingChest={list};saveProfile();return list;
 },
 /** soma de um lote (para o resumo e para aplicar) */
 total(list){
  const T={aura:0,xp:0,items:[],dups:0,rar:{}};
  for(const R of list){T.aura+=R.aura+R.dupAura;T.xp+=R.xp;if(R.dup)T.dups++;else T.items.push(R.item);T.rar[R.rar]=(T.rar[R.rar]||0)+1}
  return T;
 },
 /** aplica as recompensas pendentes (idempotente). Aceita também os formatos antigos (1 baú / "abrir todos" antigo). */
 collect(){
  const P=profile.pendingChest;if(!P)return null;
  let T;
  if(P.list)T=this.total(P.list);
  else T={aura:(P.aura||0)+(P.dupAura||0),xp:P.xp||0,items:P.items?P.items:(P.dup?[]:[P.item]),dups:P.dups||(P.dup?1:0),rar:{}};
  profile.aura=(profile.aura||0)+T.aura;
  T.items.forEach(id=>Inventory.add(id));
  const ups=addXp(T.xp);profile.pendingChest=null;saveProfile();return{T,ups};
 }
};
// recompensa pendente de uma sessão anterior (aba fechada no meio da abertura) → coleta automaticamente
if(profile.pendingChest)Chests.collect();
