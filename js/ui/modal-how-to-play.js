// Mage Animals — js/ui/modal-how-to-play.js · ❓ "Como Jogar" em 4 abas: Batalha · Vila · Baús · Dicas de digitação.
'use strict';

MODAL_TABS.help=[['battle','⚔️','howto.tab.battle'],['village','🏛️','howto.tab.village'],['chests','🎁','howto.tab.chests'],['tips','⌨️','howto.tab.tips']];
const htCard=(ic,title,txt,cls)=>`<div class="htc ${cls||''}"><span class="htc-ic">${ic}</span><div><b>${title}</b><small>${txt}</small></div></div>`;
function tabHelp(){
 const tab=modal.tab||'battle';
 if(tab==='village'){
  return`<p class="msub center">${t('howto.village.intro')}</p>
  <div class="htgrid">${VILLAGE.buildings.map(B=>htCard(B.ic,t('village.b.'+B.id+'.name'),t('howto.village.'+B.id))).join('')}</div>
  <div class="htnote">💡 ${t('howto.village.tip')}</div>
  <div class="htcta"><button class="btn sm" onclick="openModal('village')">🏛️ ${t('menu.openKingdom')}</button></div>`;
 }
 if(tab==='chests'){
  return`<p class="msub center">${t('howto.chests.intro')}</p>
  <div class="htchests">${CHEST_RARITIES.map(r=>`<div class="htch r-${r.id}" style="--rc:${r.col}"><div class="cx-chest"><i class="lid"></i><i class="body"></i><i class="band"></i><i class="lock"></i></div>
   <b>${t('chest.rarity.'+r.id)}</b><small>${r.chance}% · ✨ ${r.aura[0]}–${r.aura[1]}</small></div>`).join('')}</div>
  <h4>${t('howto.chests.how')}</h4>
  <div class="htgrid">${[['⭐','lvl'],['🌊','waves'],['📆','weekly'],['🎁','login']].map(([ic,k])=>htCard(ic,t('howto.chests.'+k+'T'),t('howto.chests.'+k))).join('')}</div>
  <div class="htnote">🎲 ${t('howto.chests.note')}</div>`;
 }
 if(tab==='tips'){
  return`<div class="htgrid">${[['🖐️','home'],['👀','look'],['🎵','rhythm'],['🎯','accuracy'],['✂️','short'],['🧘','posture']].map(([ic,k])=>htCard(ic,t('howto.tips.'+k+'T'),t('howto.tips.'+k),'tip')).join('')}</div>`;
 }
 // ⚔️ batalha
 const keys=[['A–Z','controls.type'],['⌫','controls.back'],[t('controls.spaceKey'),'controls.space'],['Esc','controls.esc'],['F2','controls.f2']];
 return`<div class="howto">${[['⌨️','s1'],['🔱','s2'],['🏰','s3']].map(([ic,k],i)=>`<div class="hstep"><span class="hic">${ic}</span><b>${i+1}. ${t('help.'+k+'t')}</b><small>${t('help.'+k)}</small></div>`).join('<span class="harrow">➜</span>')}</div>
 <div class="htgrid">${htCard('🔥',t('howto.battle.comboT'),t('howto.battle.combo'))}${htCard('⚡',t('howto.battle.wpmT'),t('howto.battle.wpm'))}${htCard('🌠',t('howto.battle.meteorT'),t('howto.battle.meteor'))}${htCard('📈',t('howto.battle.curveT'),t('howto.battle.curve'))}</div>
 <h4>${t('help.controls')}</h4><div class="hkeys">${keys.map(([k,l])=>`<div><kbd>${k}</kbd><span>${t(l)}</span></div>`).join('')}</div><p class="tip2">${t('help.pauseKeys')}</p>`;
}
