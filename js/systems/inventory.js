// Mage Animals — js/systems/inventory.js · Inventário de cosméticos: posse, equipamento, bônus passivos e o mago "vestido".
// Persistência pelo StorageManager. O mago vestido é um objeto em CACHE (refeito só quando o equipamento muda),
// então o loop do jogo não aloca nada por quadro.
'use strict';

const Inventory={
 data:StorageManager.loadInventory(),
 ver:0,                // muda a cada alteração → invalida caches
 _bon:null,_bonVer:-1,
 _dress:{},            // por personagem: {ver, obj}
 has(id){return this.data.owned.includes(id)},
 /** adiciona um item; retorna false se já tinha (duplicata) */
 add(id){if(!ITEM_BY_ID[id]||this.has(id))return false;this.data.owned.push(id);this.save();return true},
 equipped(cat){const id=this.data.equipped[cat];return id&&this.has(id)?ITEM_BY_ID[id]:null},
 isEquipped(id){const it=ITEM_BY_ID[id];return!!it&&this.data.equipped[it.cat]===id},
 /** equipa (ou, se já estava equipado, remove) — salva na hora */
 toggle(id){const it=ITEM_BY_ID[id];if(!it||!this.has(id))return;this.data.equipped[it.cat]=this.data.equipped[it.cat]===id?null:id;this.save()},
 save(){this.ver++;StorageManager.saveInventory(this.data)},
 /** bônus passivos somados dos itens equipados: {xp:%, aura:%} */
 bonuses(){
  if(this._bonVer!==this.ver){let xp=0,aura=0;for(const c of ITEM_CATS){const it=this.equipped(c);if(it){xp+=it.xp;aura+=it.aura}}this._bon={xp,aura};this._bonVer=this.ver}
  return this._bon;
 },
 /** personagem com os cosméticos aplicados (capa → manto, cajado → cristal, chapéu, aura, tier mais alto) */
 dressed(ch){
  const c=this._dress[ch.id];if(c&&c.ver===this.ver)return c.obj;
  const hat=this.equipped('hat'),cape=this.equipped('cape'),staff=this.equipped('staff'),aura=this.equipped('aura');
  let top=0;for(const it of[hat,cape,staff,aura])if(it)top=Math.max(top,['common','rare','epic','legendary'].indexOf(it.tier));
  const o=Object.assign({},ch,{
   base:ch,
   robe:cape?cape.v.robe:ch.robe,robeDark:cape?cape.v.robeDark:ch.robeDark,
   color:staff?staff.v.gem:ch.color,
   hatItem:hat?hat.v:null,auraItem:aura?aura.v:null,
   glowTier:top>=3?'legendary':top>=2?'epic':null,                 // épico: brilho suave · lendário: partículas no feitiço
   glowCol:aura?aura.v.col:staff?staff.v.gem:ch.color
  });
  this._dress[ch.id]={ver:this.ver,obj:o};return o;
 }
};
// sorteio de um cosmético pelo tier (Comum 70% · Raro 20% · Épico 8% · Lendário 2%)
function rollCosmetic(weights){ // weights opcional: pesos por tier (raridade do baú); sem ele, as chances padrão dos tiers
 const W=weights||{legendary:ITEM_TIERS.legendary.chance,epic:ITEM_TIERS.epic.chance,rare:ITEM_TIERS.rare.chance,common:ITEM_TIERS.common.chance};
 const tot=W.legendary+W.epic+W.rare+W.common;let r=Math.random()*tot,tier='common';
 for(const k of['legendary','epic','rare','common']){const ch=W[k]||0;if(r<ch){tier=k;break}r-=ch}
 const pool=COSMETICS.filter(it=>it.tier===tier);return pool[(Math.random()*pool.length)|0];
}
