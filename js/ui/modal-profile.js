// Mage Animals — js/ui/modal-profile.js · Perfil do Mago reorganizado: cada aba com UMA finalidade.
// 👤 Perfil (identidade e visual) · 🦊 Personagens (escolha + lore) · ✨ Habilidades · 📊 Estatísticas · 🎶 Música · ⚙️ Ajustes
// Atalhos no menu inicial: o chip "Olá, … ›" abre o Perfil e o chip da magia abre Habilidades.
'use strict';

MODAL_TABS.profile=[['perfil','👤','ptab.perfil'],['chars','🦊','ptab.chars'],['skills','✨','ptab.skills'],['stats','📊','ptab.stats'],['audio','🎶','ptab.audio'],['settings','⚙️','ptab.settings']]; // rótulos curtos: as 6 abas cabem visíveis
const PROFILE_TAB_FN={perfil:()=>tabPerfil(),chars:()=>tabChars(),skills:()=>tabSkills(),stats:()=>tabStats(),audio:()=>tabAudio(),settings:()=>tabSettings()};

// ---------- ⚙️ Ajustes: geral + jogabilidade (antes espalhados no Perfil e na Música) ----------
let RUNE_GUIDE_ON=store.get('runeGuide',true)!==false;
function toggleRuneGuide(){RUNE_GUIDE_ON=!RUNE_GUIDE_ON;store.set('runeGuide',RUNE_GUIDE_ON)}
function setSwitch(on,ic,title,hint,act,labOn,labOff){
 return`<div class="acctog ${on?'on':''}"><span class="accic">${ic}</span><div class="acctxt"><b>${title}</b><small>${hint}</small></div>
 <button class="switch ${on?'on':''}" role="switch" aria-checked="${on}" aria-label="${esc(title)}" onclick="keepNick();${act};renderModal()"><i></i><span>${on?labOn:labOff}</span></button></div>`;
}
function tabSettings(){
 return`<h4>🌍 ${t('settings.general')}</h4>
 <div class="genrow"><span class="glab">${t('settings.language')}</span><div class="langs">${LANGS.map(l=>`<button class="langb ${LANG===l.id?'sel':''}" onclick="changeLang('${l.id}')"><span>${l.fl}</span>${l.n}</button>`).join('')}</div></div>
 <div class="genrow"><span class="glab">${t('settings.graphics')}</span><div class="langs">${[['auto','⚙️'],['high','✨'],['low','🍃']].map(([m,ic])=>`<button class="langb ${PERF.mode===m?'sel':''}" onclick="keepNick();setQuality('${m}');renderModal()"><span>${ic}</span>${t('settings.quality.'+m)}</button>`).join('')}
  <button class="langb ${PERF.showFps?'sel':''}" onclick="keepNick();setShowFps(!PERF.showFps);renderModal()"><span>📈</span>${t('settings.showFps')}</button></div></div>
 <h4>🎮 ${t('settings.gameplay')}</h4>
 ${accToggle()}
 ${setSwitch(RUNE_GUIDE_ON,'✍️',t('settings.runeGuide'),t('settings.runeGuideHint'),'toggleRuneGuide()',t('settings.on'),t('settings.off'))}`;
}

// ---------- ✨ Habilidades: a magia do mago ativo em destaque + o poder comum + as dos outros magos ----------
function skillCard(c,i,big){
 const sp=SPELLS.find(s=>s.id===c.spell)||SPELLS[0],lk=isLocked(c),on=i===selected;
 return`<div class="skc ${big?'big':''} ${on?'on':''} ${lk?'locked':''}" style="--c:${sp.c}">
  <span class="skic">${sp.ic}</span>
  <div class="skbody"><div class="sktop"><b>${t('spells.'+sp.id+'.name')}</b><em>${t('spells.'+sp.id+'.sub')}</em>${on?`<span class="skon">✓ ${t('skills.active')}</span>`:''}</div>
   <small>${t('spells.'+sp.id+'.tooltip')}</small>
   <div class="skmeta"><span>${c.emoji} ${charName(c)}</span><span>${'❤'.repeat(c.lives)} ${t('tip.lives')}</span></div>
   <p class="skpass">${t('characters.'+c.id+'.desc')}</p></div>
  ${big?'':lk?`<span class="sklock">🔒 ${t('charUi.unlockReq',{w:c.unlock,l:c.lvl})}</span>`:on?'':`<button class="btn sm" onclick="keepNick();selectChar(${i});renderModal()">${t('skills.equip')}</button>`}</div>`;
}
function tabSkills(){
 const c=CHARS[selected];
 return`<h4>${t('skills.yours')}</h4>${skillCard(c,selected,true)}
 <h4>${t('skills.shared')}</h4>
 ${SPELLS.filter(s=>s.shared).map(me=>`<div class="skc shared" style="--c:${me.c}"><span class="skic">${me.ic}</span><div class="skbody"><div class="sktop"><b>${t('spells.'+me.id+'.name')}</b><em><kbd>${t('spells.'+me.id+'.sub')}</kbd></em></div><small>${t('spells.'+me.id+'.tip')}</small></div></div>`).join('')}
 <h4>${t('skills.others')}</h4><div class="skgrid">${CHARS.map((x,i)=>i===selected?'':skillCard(x,i,false)).join('')}</div>`;
}

// ---------- 🦊 Personagens: lista à esquerda (quem está sendo visto) + ficha com habilidade e lore ----------
let charView=-1;
function viewChar(i){keepNick();charView=i;renderModal();snd(700,.05,'triangle',.03)}
const LORE_SECS=[['origin','🗺️'],['past','🎒'],['ties','🛡️'],['goal','🎯'],['traits','🎭']];
function tabChars(){
 if(charView<0||!CHARS[charView])charView=selected;
 const i=charView,c=CHARS[i],lk=isLocked(c),sp=SPELLS.find(s=>s.id===c.spell)||SPELLS[0],L='lore.'+c.id+'.';
 const list=CHARS.map((x,k)=>`<button class="chrow ${k===i?'on':''} ${isLocked(x)?'locked':''}" role="tab" aria-selected="${k===i}" onclick="viewChar(${k})" style="--c:${x.color}">
   <canvas width="140" height="140" data-ci="${k}"></canvas><span><b>${x.emoji} ${charName(x)}</b><small>${isLocked(x)?'🔒 '+t('charUi.locked'):k===selected?t('charUi.equipped'):t('characters.'+x.id+'.trait')}</small></span></button>`).join('');
 return`<div class="chview">
  <div class="chlist" role="tablist">${list}</div>
  <article class="chsheet" style="--c:${c.color}">
   <header class="chhead"><canvas width="140" height="140" data-ci="${i}"></canvas>
    <div><small class="chepi">${t(L+'epithet')}</small><h3>${c.emoji} ${charName(c)}</h3>
     <div class="chchips"><span>${t('characters.'+c.id+'.trait')}</span><span>${sp.ic} ${t('spells.'+sp.id+'.name')}</span><span>${'❤'.repeat(c.lives)}</span></div>
     ${lk?`<p class="chlock">🔒 ${t('charUi.unlockReq',{w:c.unlock,l:c.lvl})}</p>`:i===selected?`<p class="chequip">${t('charUi.equipped')}</p>`:`<button class="btn sm" onclick="keepNick();selectChar(${i});renderModal()">${t('skills.equip')}</button>`}</div></header>
   <div class="chskill"><b>${t('skills.title')}</b><span>${t('characters.'+c.id+'.desc')}</span></div>
   <blockquote class="chquote">“${t(L+'quote')}”</blockquote>
   <p class="chstory"><b>📜 ${t('lore.sec.story')}</b> ${t(L+'story')}</p>
   <div class="chlore">${LORE_SECS.map(([k,ic])=>`<div class="chl"><b>${ic} ${t('lore.sec.'+k)}</b><span>${t(L+k)}</span></div>`).join('')}</div>
  </article></div>`;
}
