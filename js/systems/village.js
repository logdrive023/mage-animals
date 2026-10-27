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
// brasão do Reino (escudo roxo com borda dourada e coroa) e o cristal de Aura — SVG inline, nítidos em qualquer tela
const VILLAGE_CREST=`<svg viewBox="0 0 64 74"><defs><linearGradient id="vcrG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8f6ee0"/><stop offset="1" stop-color="#4b3296"/></linearGradient><linearGradient id="vcrB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbe3a0"/><stop offset="1" stop-color="#c9963c"/></linearGradient></defs>
 <path d="M32 3 59 12v20c0 18-11.5 30-27 38C16.5 62 5 50 5 32V12z" fill="url(#vcrB)"/><path d="M32 8.5 54 16v16.4c0 14.8-9.3 25-22 31.8C19.3 57.4 10 47.2 10 32.4V16z" fill="url(#vcrG)"/>
 <path d="M32 9 54 16.4v8C42 20 23 20 10 24.4v-8z" fill="#fff" opacity=".13"/>
 <path d="M21 55c-1.5-5 0-10.5 3.5-14.5L21.5 33l-.3-11.6 7.6 7.4c2.2-.6 4.4-.6 6.4 0l5.6-7.8 1 10.4 4.3 4.6 5.4 3.6c.9.7.8 2.1-.2 2.6l-4.6 2.3c-1.2.6-2.6.6-3.8.1l-1.4 3.4c2.2 2.2 3.1 5.2 2.6 8.4-3.3-.5-6.5-1.5-9.4-3.1-2.6 2.6-6 3.9-9.7 3.7z" fill="#fff"/>
 <path d="M26.5 39.5 31 42l-4.8 1.8M34.5 45l3-1" stroke="#6a4fc0" stroke-width="1.4" fill="none" stroke-linecap="round"/><circle cx="36.6" cy="35.8" r="1.6" fill="#4b3296"/>
 <path d="M44 40.6l3.2.6" stroke="#4b3296" stroke-width="1.2" stroke-linecap="round"/></svg>`;
const VILLAGE_GEM=`<svg viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="vgemG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c8a8ff"/><stop offset="1" stop-color="#6a3fd8"/></linearGradient></defs><path d="M12 1.5c.8 5.4 3.6 8.7 9.5 10.5-5.9 1.8-8.7 5.1-9.5 10.5-.8-5.4-3.6-8.7-9.5-10.5C8.4 10.2 11.2 6.9 12 1.5z" fill="url(#vgemG)"/><path d="M12 4.5c.5 3.6 2.2 6 5.6 7.5" stroke="#fff" stroke-width="1.2" fill="none" opacity=".7" stroke-linecap="round"/></svg>`;
function tabVillage(){
 const V=Village,d=V.data,U=VillageUI,sl=V.lv('sanct'),bon=V.bonuses();
 const intro=!d.introSeen?`<div class="vintro"><div class="vscroll">📜</div><p>${Story.intro()}</p><button class="btn" onclick="VillageUI.startStory()">⚔️ ${t('story.start')}</button></div>`:'';
 const name=U.editing?`<span class="vrename"><input id="vName" maxlength="28" value="${esc(d.name)}" onkeydown="if(event.key==='Enter'){event.preventDefault();event.stopPropagation();VillageUI.saveName()}"><button class="btn sm" onclick="VillageUI.saveName()">✓</button></span>`
  :`<span class="vname">${esc(d.name)}</span><button class="vedit" onclick="VillageUI.edit()" title="${esc(t('village.rename'))}">✏️</button>`;
 // card de prédio: cabeçalho · barra de nível · "Agora → Próximo" · painel próprio (mina/taverna) · rodapé fixo embaixo
 const card=B=>{
  const lv=V.lv(B.id),why=V.check(B.id),cost=V.cost(B.id),fl=U.flash===B.id?' flash':'',built=lv>0,maxed=lv>=B.max;
  let extra='';
  if(B.id==='mine'&&built){const p=V.pending(),cap=V.cap();extra=`<div class="vb-panel vmine"><div class="vb-ptop"><span>💎 <b id="vPend">${fmtN(p)}</b> / ${fmtN(cap)}</span><small>${fmtN(V.rate())}/h</small></div>
   <div class="vbar"><i id="vPendBar" style="width:${cap?p/cap*100:0}%"></i></div>
   <button class="qclaim vcollect" id="vCollect" ${p<1?'disabled':''} onclick="VillageUI.collect(event)">${t('village.collect',{n:fmtN(p)})}</button></div>`}
  if(B.id==='tavern'&&built){extra=`<div class="vb-panel vworkers"><div class="vb-ptop"><span>👥 ${t('village.slots',{u:V.used(),t:V.slots()})}</span></div><small>${t('village.assignHint')}</small><div class="vchips">${CHARS.map(c=>{const lk=isLocked(c),w=d.workers[c.id],wb=w?V.B(w):null;
   return`<button class="vchip ${w?'on':''}" ${lk?'disabled':''} onclick="VillageUI.assign('${c.id}')">${lk?'🔒':c.emoji}<span>${charName(c)}</span>${wb?`<i>${wb.ic}</i>`:''}</button>`}).join('')}</div></div>`}
  const wk=['mine','lab','forge'].includes(B.id)&&V.workersOn(B.id)?`<p class="vwk">👥 ${t('village.workersBoost',{n:B.id==='forge'?'+'+V.workersOn(B.id)+' '+t('ui.lvl'):'+'+V.workersOn(B.id)*25+'%'})}</p>`:''; // forja: habitante = +1 nível (corações)
  const next=B.id==='forge'&&VILLAGE.forgeLives(lv+1)===VILLAGE.forgeLives(lv)?t('village.forgeNext',{n:(Math.floor(lv/3)+1)*3}):villageEffect(B.id,lv+1);
  const seg=Array.from({length:B.max},(_,i)=>`<i class="${i<lv?'on':''}"></i>`).join('');
  const lock=why&&why!=='aura'&&why!=='max'?`<p class="vb-lock">🔒 ${t('village.why.'+why,{n:lv*3})}</p>`:why==='aura'?`<p class="vb-lock aura">${VILLAGE_GEM}${t('village.missing',{n:fmtN(Math.max(0,cost-(profile.aura||0)))})}</p>`:'';
  return`<article class="vcard vb${built?'':' unbuilt'}${maxed?' maxed':''}${fl}" id="vc-${B.id}">
   <header class="vtop"><span class="vic">${B.ic}</span><div><b>${t('village.b.'+B.id+'.name')}</b><small>${t('village.b.'+B.id+'.desc')}</small></div><span class="vlv">${built?t('ui.lvl')+' '+lv:t('village.notBuilt')}</span></header>
   <div class="vb-seg" role="img" aria-label="${esc(t('ui.lvl')+' '+lv+'/'+B.max)}">${seg}<small>${lv}/${B.max}</small></div>
   <div class="vb-eff">${built?`<div class="now"><span>${t('village.now')}</span><b>${villageEffect(B.id,lv)}</b></div>`:''}${maxed?'':`<div class="next"><span>${built?t('village.nextLv',{n:lv+1}):t('village.onBuild')}</span><b>${next}</b></div>`}</div>
   ${wk}${extra}
   <footer class="vb-foot">${maxed?`<span class="qgot">★ ${t('village.max')}</span>`:`${lock}<button class="btn sm vup" ${why?'disabled':''} onclick="VillageUI.upgrade('${B.id}')">${built?t('village.upgrade'):t('village.build')} · ${VILLAGE_GEM}${fmtN(cost)}</button>`}</footer></article>`;
 };
 const nextCh=sl<VILLAGE.maxSanct?`<p class="vnextch">🔒 ${t('village.nextCh',{n:sl+1})}</p>`:'';
 return`<div class="vil" id="village-modal">${intro}
  <div class="vbanner"><span class="vcrest" aria-hidden="true">${VILLAGE_CREST}</span><div class="vhead"><span class="vtl">${name}</span><small><span class="vcrown">👑</span> ${Story.title(sl)} · ${esc(nickOr())} <i>${esc(PlayerIdentity.handle)}</i></small></div><span class="vaura" title="${esc(t('aura.name'))}">${VILLAGE_GEM}${fmtN(profile.aura||0)}</span></div>
  <div class="vscene"><canvas id="vMap" aria-label="${esc(d.name)}"></canvas>${villagePins()}
   <i class="vsp" style="left:50%;top:6%"></i><i class="vsp" style="left:9%;top:30%"></i><i class="vsp" style="left:93%;top:22%"></i><i class="vsp" style="left:74%;top:58%"></i><i class="vsp" style="left:30%;top:48%"></i></div>
  <section class="vb-bonus" aria-label="${esc(t('village.bonusTitle'))}"><h4>${t('village.bonusTitle')}<small>${t('village.bonusNote')}</small></h4>
   <div class="vb-stats"><div><span>⚗️</span><b>+${bon.xp}%</b><small>XP</small></div><div><span>🔮</span><b>+${bon.mana}%</b><small>${t('village.mana')}</small></div><div><span>❤️</span><b>+${bon.lives}</b><small>${t('village.bonusLives')}</small></div></div></section>
  <details class="vstory"${d.introSeen?'':' open'}><summary><span>📜</span><b>${t('story.chronicle',{n:sl})}</b><small>${t('village.chapters',{a:sl,b:VILLAGE.maxSanct})}</small></summary><p>${Story.intro()}</p><p class="vch">${Story.chapter(sl)}</p>${nextCh}</details>
  <h4 class="vb-title">${t('village.buildings')}</h4>
  <div class="vgrid">${VILLAGE.buildings.map(card).join('')}</div></div>`;
}
