// Mage Animals — js/systems/village.js · 🏛️ Vila dos Magos: reconstrução do Reino (meta-game de longo prazo).
// Persistência: StorageManager (mage_village). Produção passiva da Mina calculada pelo RELÓGIO (sem timers rodando):
// ao abrir/coletar, pending = horas desde a última coleta × Aura/h, limitado ao armazém → funciona com o jogo fechado.
// Os bônus (XP, Mana, ❤ da torre) são lidos UMA vez no início de cada partida (freshState / finishMatch).
'use strict';

const Village={
 data:null,_bon:null,
 load(){
  let v=StorageManager.loadVillage();
  if(!v){v={name:Story.suggestName(),lv:{sanct:1,mine:1,lab:0,forge:0,tavern:0},workers:{},last:Date.now(),introSeen:false};StorageManager.saveVillage(v)}
  for(const B of VILLAGE.buildings)if(typeof v.lv[B.id]!=='number')v.lv[B.id]=0;
  v.workers=v.workers||{};return this.data=v;
 },
 save(){this._bon=null;StorageManager.saveVillage(this.data);if(typeof sceneBg!=='undefined')sceneBg.delete('kingdom')}, // a cena do menu redesenha o Reino
 B(id){return VILLAGE.buildings.find(x=>x.id===id)},
 lv(id){return this.data.lv[id]|0},
 cost(id){return Math.round(this.B(id).base*Math.pow(1.55,this.lv(id)))},
 /** o Santuário pede nível do mago (3 por nível); os outros prédios não passam do nível do Santuário */
 check(id){
  const B=this.B(id),lv=this.lv(id);
  if(lv>=B.max)return'max';
  if(id==='sanct'){if(profile.level<lv*3)return'plevel'}
  else if(lv>=this.lv('sanct'))return'sanct';
  if((profile.aura||0)<this.cost(id))return'aura';
  return'';
 },
 upgrade(id){
  if(this.check(id))return false;
  if(id==='mine')this.collect(); // a produção acumulada é paga na taxa antiga
  profile.aura-=this.cost(id);this.data.lv[id]++;saveProfile();this.save();return true;
 },
 // ---------- habitantes (Taverna) ----------
 slots(){return this.lv('tavern')},
 workersOn(id){let n=0;for(const k in this.data.workers)if(this.data.workers[k]===id)n++;return n},
 used(){return Object.keys(this.data.workers).length},
 mul(id){return 1+VILLAGE.workerBoost*this.workersOn(id)},
 /** toque num mago: livre → Mina → Laboratório → Forja → livre (pula prédios não construídos) */
 cycle(charId){
  const c=CHARS.find(x=>x.id===charId);if(!c||isLocked(c))return;
  const order=['mine','lab','forge'].filter(id=>this.lv(id)>0),cur=this.data.workers[charId];
  if(!cur){if(this.used()>=this.slots()||!order.length)return;this.collect();this.data.workers[charId]=order[0]}
  else{const i=order.indexOf(cur);if(cur==='mine')this.collect();if(i<0||i===order.length-1)delete this.data.workers[charId];else{if(order[i+1]==='mine')this.collect();this.data.workers[charId]=order[i+1]}}
  this.save();
 },
 // ---------- produção passiva ----------
 rate(){return Math.round(VILLAGE.mineRate(this.lv('mine'))*this.mul('mine'))},
 cap(){return Math.round(VILLAGE.mineCap(this.lv('mine'))*this.mul('mine'))},
 pending(){const h=Math.max(0,Date.now()-(this.data.last||Date.now()))/36e5;return Math.min(this.cap(),Math.floor(h*this.rate()))},
 collect(){const p=this.pending();this.data.last=Date.now();if(p>0){profile.aura=(profile.aura||0)+p;saveProfile()}this.save();return p},
 // ---------- bônus das partidas ----------
 bonuses(){
  if(this._bon)return this._bon;
  const lab=this.lv('lab'),fw=this.lv('forge')?this.workersOn('forge'):0;
  return this._bon={xp:Math.round(VILLAGE.labXp(lab)*this.mul('lab')),mana:Math.round(VILLAGE.labMana(lab)*this.mul('lab')),lives:VILLAGE.forgeLives(this.lv('forge')+fw)};
 },
 rename(n){n=String(n||'').replace(/[<>]/g,'').trim().slice(0,28);if(n.length>=3){this.data.name=n;this.save();return true}return false}
};
Village.load();

// ================== UI (#village-modal) ==================
const VillageUI={editing:false,flash:'',_iv:0,
 open(){this.editing=false;this.tick()},
 // só o contador da Mina muda sozinho (1×/s, sem redesenhar o modal)
 tick(){clearInterval(this._iv);this._iv=setInterval(()=>{if(!modalOpen||modal.kind!=='village'){clearInterval(this._iv);return}
  const el=$('vPend'),bar=$('vPendBar'),btn=$('vCollect');if(!el)return;const p=Village.pending(),cap=Village.cap();
  el.textContent=fmtN(p);if(bar)bar.style.width=(cap?p/cap*100:0)+'%';if(btn){btn.disabled=p<1;btn.textContent=t('village.collect',{n:fmtN(p)})}},1000)},
 startStory(){Village.data.introSeen=true;Village.save();renderModal();[523,659,784,1046].forEach((f,i)=>snd(f,.25,'triangle',.05,0,i*.1))},
 edit(){this.editing=true;renderModal();setTimeout(()=>{const i=$('vName');if(i){i.focus();i.select()}},40)},
 saveName(){const i=$('vName');if(i&&Village.rename(i.value))snd(988,.08,'triangle',.04);this.editing=false;renderModal()},
 upgrade(id){if(Village.upgrade(id)){this.flash=id;renderModal();renderProfile();[659,784,988].forEach((f,i)=>snd(f,.18,'triangle',.05,0,i*.07));setTimeout(()=>{this.flash=''},900)}else snd(200,.12,'sawtooth',.03)},
 collect(ev){const p=Village.collect();if(p>0){rewardFx({aura:p},[],ev);renderProfile();renderNav()}renderModal()},
 assign(id){Village.cycle(id);renderModal();snd(760,.06,'triangle',.04)},
 /** clique numa placa do mapa: rola até o card do prédio e dá um destaque */
 focus(id){const el=$('vc-'+id);if(!el)return;el.scrollIntoView({behavior:'smooth',block:'center'});el.classList.remove('flash');void el.offsetWidth;el.classList.add('flash');snd(660,.05,'triangle',.03)}
};
function villageEffect(id,lv){
 if(id==='sanct')return t('village.eff.sanct',{n:lv});
 if(id==='mine')return t('village.eff.mine',{n:VILLAGE.mineRate(lv)});
 if(id==='lab')return t('village.eff.lab',{x:VILLAGE.labXp(lv),m:VILLAGE.labMana(lv)});
 if(id==='forge')return t('village.eff.forge',{n:VILLAGE.forgeLives(lv)});
 return t('village.eff.tavern',{n:lv});
}
function tabVillage(){
 const V=Village,d=V.data,U=VillageUI,sl=V.lv('sanct'),bon=V.bonuses();
 const intro=!d.introSeen?`<div class="vintro"><div class="vscroll">📜</div><p>${Story.intro()}</p><button class="btn" onclick="VillageUI.startStory()">⚔️ ${t('story.start')}</button></div>`:'';
 const name=U.editing?`<span class="vrename"><input id="vName" maxlength="28" value="${esc(d.name)}" onkeydown="if(event.key==='Enter'){event.preventDefault();event.stopPropagation();VillageUI.saveName()}"><button class="btn sm" onclick="VillageUI.saveName()">✓</button></span>`
  :`<span class="vname">${esc(d.name)}</span><button class="vedit" onclick="VillageUI.edit()" title="${esc(t('village.rename'))}">✏️</button>`;
 const card=B=>{
  const lv=V.lv(B.id),why=V.check(B.id),cost=V.cost(B.id),fl=U.flash===B.id?' flash':'',built=lv>0;
  let extra='';
  if(B.id==='mine'&&built){const p=V.pending(),cap=V.cap();extra=`<div class="vmine"><div class="vbar"><i id="vPendBar" style="width:${cap?p/cap*100:0}%"></i></div><small>💎 <b id="vPend">${fmtN(p)}</b> / ${fmtN(cap)} · ${fmtN(V.rate())}/h</small>
   <button class="qclaim vcollect" id="vCollect" ${p<1?'disabled':''} onclick="VillageUI.collect(event)">${t('village.collect',{n:fmtN(p)})}</button></div>`}
  if(B.id==='tavern'&&built){extra=`<div class="vworkers"><small>${t('village.slots',{u:V.used(),t:V.slots()})} · ${t('village.assignHint')}</small><div class="vchips">${CHARS.map(c=>{const lk=isLocked(c),w=d.workers[c.id],wb=w?V.B(w):null;
   return`<button class="vchip ${w?'on':''}" ${lk?'disabled':''} onclick="VillageUI.assign('${c.id}')">${lk?'🔒':c.emoji}<span>${charName(c)}</span>${wb?`<i>${wb.ic}</i>`:''}</button>`}).join('')}</div></div>`}
  const wk=['mine','lab','forge'].includes(B.id)&&V.workersOn(B.id)?`<em class="vwk">👥 +${V.workersOn(B.id)*25}%</em>`:'';
  return`<div class="vcard${built?'':' unbuilt'}${fl}" id="vc-${B.id}"><div class="vtop"><span class="vic">${B.ic}</span><div><b>${t('village.b.'+B.id+'.name')}</b><small>${t('village.b.'+B.id+'.desc')}</small></div><span class="vlv">${t('ui.lvl')} ${lv}/${B.max}</span></div>
   <div class="veff">${built?`<span>✅ ${villageEffect(B.id,lv)}</span>`:''}${lv<B.max?`<span class="vnext">⬆️ ${B.id==='forge'&&VILLAGE.forgeLives(lv+1)===VILLAGE.forgeLives(lv)?t('village.forgeNext',{n:(Math.floor(lv/3)+1)*3}):villageEffect(B.id,lv+1)}</span>`:''}${wk}</div>${extra}
   ${lv>=B.max?`<span class="qgot">★ ${t('village.max')}</span>`:`<button class="btn sm vup" ${why?'disabled':''} onclick="VillageUI.upgrade('${B.id}')">${built?t('village.upgrade'):t('village.build')} · ✨ ${fmtN(cost)}</button>${why&&why!=='aura'?`<small class="vwhy">${t('village.why.'+why,{n:lv*3})}</small>`:''}`}</div>`;
 };
 const nextCh=sl<VILLAGE.maxSanct?`<p class="vnextch">🔒 ${t('village.nextCh',{n:sl+1})}</p>`:'';
 return`<div class="vil" id="village-modal">${intro}
  <div class="vbanner"><span class="vcrest"><i>🛡️</i><b>${sl}</b></span><div class="vhead">${name}<small>👑 ${Story.title(sl)} · ${esc(nickOr())} <i>${esc(PlayerIdentity.handle)}</i></small></div><span class="vaura">✨ ${fmtN(profile.aura||0)}</span></div>
  <div class="vscene"><canvas id="vMap" aria-label="${esc(d.name)}"></canvas>${villagePins()}<div class="vplate">${esc(d.name)}</div>
   <i class="vsp" style="left:50%;top:14%"></i><i class="vsp" style="left:17.5%;top:24%"></i><i class="vsp" style="left:90%;top:52%"></i><i class="vsp" style="left:28%;top:62%"></i></div>
  <div class="vbonus"><span>⚗️ +${bon.xp}% XP</span><span>🔮 +${bon.mana}% ${t('village.mana')}</span><span>❤️ +${bon.lives}</span><small>${t('village.bonusNote')}</small></div>
  <details class="vstory"${d.introSeen?'':' open'}><summary>📜 ${t('story.chronicle',{n:sl})}</summary><p>${Story.intro()}</p><p class="vch">${Story.chapter(sl)}</p>${nextCh}</details>
  <div class="vgrid">${VILLAGE.buildings.map(card).join('')}</div></div>`;
}
