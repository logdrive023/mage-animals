// Mage Animals — Interface: idioma, perfil, modais com abas (Perfil, Missões, Duelo, Ranking), menu, HUD e painéis.
'use strict';

// ================== IDIOMA ==================
function applyI18n(){
 document.documentElement.lang=LANG;document.title=t('meta.title');
 document.querySelectorAll('[data-i18n]').forEach(el=>{el.innerHTML=t(el.dataset.i18n)});
 document.querySelectorAll('[data-tip-key]').forEach(el=>{el.dataset.tip=esc(t(el.dataset.tipKey))});
 const b=$('musicBtn');if(b)b.textContent=MUS.on?t('music.on'):t('music.off');
}
function changeLang(l){keepNick();setLang(l);applyI18n();updateAccUI();UIC.mode='';updateUI(true);renderProfile();renderSide();renderEnemyList();renderNav();if(modalOpen)renderModal();if(state==='menu')showMenu();if(state==='paused')showPause();snd(880,.06,'triangle',.04)}
const mmName=m=>t('music.modes.'+m);
const swatch=s=>s.c==='rainbow'?'conic-gradient(#f44,#fd4,#4f8,#4cf,#a6f,#f44)':s.c||'linear-gradient(135deg,#5ad0ff,#ff8a3a)';

// ================== CARTÃO DE PERFIL + NAVEGAÇÃO ==================
// ✨ Aura: chip reutilizado no perfil e no cabeçalho do duelo
const auraChip=cls=>`<span class="aurachip ${cls||''}" data-tip="${esc(t('aura.tip'))}">✨ <b>${fmtN(profile.aura)}</b> ${t('aura.name')}${profile.streak>1?`<em>🔥${profile.streak}</em>`:''}</span>`;
function renderProfile(){
 const need=xpNeed(profile.level),ca=claimableAch();
 // 🧭 perfil enxuto: avatar · nome + título · Aura numa linha; barra de XP com o nível; próxima recompensa numa linha só
 //  (o @handle, o XP total e o botão das torres saíram daqui: estão no Perfil e no menu "Progresso")
 const pct=Math.min(100,profile.xp/need*100)|0;
 $('profile').innerHTML=`<button class="pav aura b-${profile.border}" onclick="openProfile(false,${ca?"'stats'":"'perfil'"})" aria-label="${esc(t('nav.profileButton'))}${ca?' · '+esc(t('side.achReady',{n:ca})):''}"><div class="pin" aria-hidden="true">${profile.avatar}</div>${ca?`<i class="pbadge" aria-hidden="true">${ca}</i>`:''}</button>
 <div class="pinfo"><div class="pname"><span>${esc(nickOr())}</span><button class="pedit" onclick="openProfile()" aria-label="${esc(t('side.editNick'))}">✏️</button></div>
  <div class="ptitle">${esc(titleName(profile.activeTitle))}</div>${auraChip()}</div>
 <div class="pxp"><div class="xptxt"><b>${t('ui.lvl')} ${profile.level}</b><span>${fmtN(profile.xp)} / ${fmtN(need)} ${t('ui.xp')}</span></div>
  <div class="xpbar" role="progressbar" aria-label="${esc(t('ui.xp'))}" aria-valuemin="0" aria-valuemax="${need}" aria-valuenow="${profile.xp}"><i style="width:${pct}%"></i></div>
  <div class="pnext" id="nextReward"></div></div>
 <button class="popen" onclick="openProfile(false,'perfil')"><span aria-hidden="true">👤</span>${t('side.openProfile')}<i aria-hidden="true">›</i></button>`; // 👤 atalho explícito (antes só o avatar abria o perfil)
 renderNextReward();renderNav();
}
// gatilho de progresso: mostra a próxima recompensa de nível e quanto falta
function nextLevelReward(){
 for(let l=profile.level+1;l<=profile.level+25;l++){
  const ch=CHARS.find(c=>c.lvl===l&&isLocked(c));if(ch)return{l,txt:'🐾 '+ch.emoji+' '+charName(ch)};
  const r=rewardsAt(l);if(r.length)return{l,txt:r[0]};
 }
 return null;
}
function renderNextReward(){
 const n=nextLevelReward(),el=$('nextReward');if(!el)return;
 if(!n){el.innerHTML=`✨ ${t('side.allDone')}`;return}
 let left=xpNeed(profile.level)-profile.xp;for(let l=profile.level+1;l<n.l;l++)left+=xpNeed(l);
 // uma linha: "🎁 Nv 10: +1 Baú · faltam 1.275 XP" (a barra de XP logo acima já mostra o progresso)
 el.innerHTML=`<span>🎁 <b>${t('ui.lvl')} ${n.l}:</b> ${esc(n.txt.replace(/^🎁\s*/,''))}</span><em>${t('side.xpLeft',{n:fmtN(left)})}</em>`;
}
function renderNav(){
 const q=claimableQuests()+(canClaimLogin()?1:0),nc=Chests.count();
 const vp=Village.pending(),vh=vp>=Math.max(50,Village.cap()*.5);
 const on=typeof Net!=='undefined'&&Net.active(),lobby=typeof Net!=='undefined'&&Net.state==='lobby';
 // 🧭 menu simples: 3 grupos curtos, rótulos em texto normal, aviso = bolinha com número (sem piscar) + descrito no aria-label
 const item=(modalId,ic,key,badge,badgeTxt)=>`<button class="pill${badge?' hot':''}" onclick="openModal('${modalId}')"${badge?` aria-label="${esc(t('side.nav.'+key)+' · '+badgeTxt)}"`:''}><span aria-hidden="true">${ic}</span><b>${t('side.nav.'+key)}</b>${badge?`<i class="badge" aria-hidden="true">${badge}</i>`:''}</button>`;
 const grp=(key,items)=>`<div class="navgrp" role="group" aria-label="${esc(t('side.grp.'+key))}"><h3 aria-hidden="true">${t('side.grp.'+key)}</h3>${items}</div>`;
 $('nav').innerHTML=grp('battle',item('duel','⚔️','duelBot')+item('online','🌐','online',lobby?'1v1':on?'●':'',t('side.badge.online'))+item('ranking','🏆','ranking'))
  +grp('progress',item('missions','📜','missions',q||'',t('side.badge.claim',{n:q}))+item('village','🏛️','kingdom',vh?'💎':'',t('side.badge.mine'))+item('collection','👕','collection',nc?'🎁'+nc:'',t('side.badge.chests',{n:nc}))+item('dictionary','📖','dictionary')+item('towers','🏰','towers'))
  +grp('social',`<button class="pill" onclick="openProfile(false,'perfil')"><span aria-hidden="true">👤</span><b>${t('side.nav.profile')}</b></button>`+item('friends','👥','friends'));
 const mb=$('mbarChest');if(mb)mb.textContent=nc?nc:'';
}

// ================== MODAIS ==================
let modalOpen=false,draftNick='',firstRun=false,claimMsg='';
const modal={kind:null,tab:null};
const MODAL_TABS={
 profile:[['perfil','👤','nav.profile'],['stats','📊','nav.stats'],['chars','🦊','nav.characters'],['audio','🎶','nav.audio']],
 missions:[['daily','☀️','missions.daily'],['weekly','📆','missions.weekly'],['login','🎁','missions.login']],
 village:[['realm','🗺️','village.tab.realm'],['story','📜','village.tab.story'],['build','🏗️','village.tab.build']], // 👑 Meu Reino em 3 abas
 ranking:[['words','⌨️','rank.mode.words'],['letters','✍️','rank.mode.letters'],['runes','🔮','rank.mode.runes'],['songs','🎵','rank.mode.songs']]
};
// duelo online não pausa: abrir modal/gaveta no meio dele travaria o teclado com o rival atacando
const inOnlineDuel=()=>state==='play'&&!!(G&&G.duel&&G.duel.online);
function openModal(kind,tab){
 if(inOnlineDuel()){snd(200,.08,'triangle',.04);return}
 if(state==='play')pause();
 keepNick();modal.kind=kind;modal.tab=tab||(kind==='ranking'?GAME_STYLE:MODAL_TABS[kind]?MODAL_TABS[kind][0][0]:null);claimMsg=''; // ranking abre no modo que você está jogando
 if(kind==='missions')questsRefresh();
 if(kind==='friends')FriendsUI.open();
 if(kind==='village')VillageUI.open();
 modalOpen=true;$('modal').classList.remove('hide');renderModal();
}
function openProfile(first,tab){firstRun=!!first;draftNick=profile.nickname;openModal('profile',tab||'perfil');if(modal.tab==='perfil')setTimeout(()=>{const n=$('nick');if(n){n.focus();n.select()}},60)}
function keepNick(){const n=$('nick');if(n)draftNick=n.value}
function setTab(tb){keepNick();modal.tab=tb;claimMsg='';renderModal();snd(660,.05,'triangle',.03)}
function closeModal(){
 keepNick();
 if(modal.kind==='profile')PlayerIdentity.setDisplayName(draftNick.trim()||nickOr()); // só o apelido muda; o @handle é fixo
 saveProfile();renderProfile();renderSide();$('modal').classList.add('hide');modalOpen=false;modal.kind=null;
 if(state==='menu')showMenu();
 if(firstRun){firstRun=false;if(canClaimLogin())openModal('missions','login')}
}
const closeProfile=closeModal;

function renderModal(){
 const k=modal.kind,tabs=MODAL_TABS[k];
 const head={profile:firstRun?t('profile.welcome'):t('profile.title'),missions:t('missions.title'),duel:t('duel.title'),ranking:t('ranking.title'),help:t('help.title'),towers:'🏰 '+t('towers.title'),collection:'👕 '+t('col.title'),online:'🌐 '+t('online.title'),friends:'👥 '+t('friends.title'),village:`<span class="ksp">✦</span>👑 ${t('village.title')}<span class="ksp">✦</span>`,dictionary:'📖 '+t('dict.title'),songs:'🎵 '+t('song.title'),songedit:'✏️ '+t('song.ed.title')}[k];
 let sub='';
 if(k==='profile'){const need=xpNeed(profile.level);sub=`<div class="mlevel"><span class="lvchip">${t('ui.lvl').toUpperCase()} ${profile.level}</span><div class="xpbar"><i style="width:${Math.min(100,profile.xp/need*100)}%"></i></div><span class="xpn">${fmtN(profile.xp)} / ${fmtN(need)} XP</span></div>`}
 if(k==='missions')sub=missionsHead();
 if(k==='ranking')sub=`<p class="msub">${t('ranking.note')}</p>`;
 if(k==='dictionary')sub=`<p class="msub">${t('dict.sub')}</p>`;
 if(k==='duel')sub=`<div class="duelsub"><p class="msub">${t('duel.help')}</p>${auraChip('big')}</div>`;
 const badge=id=>id==='stats'?claimableAch():k==='missions'?(id==='login'?(canClaimLogin()?1:0):questList(id).filter(q=>{const p=questProgress(id,q);return p.done&&!p.claimed}).length):k==='village'&&id==='story'&&modal.tab!=='story'&&Village.lv('sanct')>(Village.data.chSeen|0)?'!':0; // 📜 capítulo novo não lido
 const body={profile:()=>(PROFILE_TAB_FN[modal.tab]||PROFILE_TAB_FN.perfil)(),missions:()=>modal.tab==='login'?tabLogin():tabQuests(modal.tab),duel:tabDuel,ranking:tabRanking,help:tabHelp,towers:tabTowers,collection:tabCollection,online:tabOnline,friends:tabFriends,village:tabVillage,dictionary:tabDictionary,songs:tabSongs,songedit:tabSongEdit}[k]();
 $('mbox').innerHTML=`<div class="mhead"><h2>${head}</h2>${sub}</div>
 ${tabs?`<div class="tabs" style="grid-template-columns:repeat(${tabs.length},1fr)" role="tablist">${tabs.map(([id,ic,lab])=>{const n=badge(id);return`<button class="tab ${modal.tab===id?'on':''}" role="tab" aria-selected="${modal.tab===id}" onclick="setTab('${id}')"><span class="tic">${ic}</span><span class="tlabel">${t(lab)}</span>${n?`<span class="badge">${n}</span>`:''}</button>`}).join('')}</div>`:'<div class="tabs notabs"></div>'}
 <div class="tabbody" id="tabBody">${claimMsg?`<div class="claimmsg">${claimMsg}</div>`:''}${body}</div>
 <div class="mact"><button class="btn" onclick="closeModal()">${k==='profile'?(firstRun?t('profile.startPlay'):t('profile.saveClose')):t('ui.ok')}</button></div>`;
 $('tabBody').onclick=e=>{const tl=e.target.closest('.tile[data-k]');if(!tl||tl.disabled)return;keepNick();profile[tl.dataset.k]=tl.dataset.v;saveProfile();renderProfile();renderModal();snd(880,.06,'triangle',.04)};
 document.querySelectorAll('#tabBody canvas[data-ci]').forEach(c=>{const ch=CHARS[+c.dataset.ci];drawCharPortrait(c.getContext('2d'),ch,0,isLocked(ch))});
 document.querySelectorAll('#tabBody canvas[data-tw]').forEach(c=>drawThumb(c.getContext('2d'),+c.dataset.tw));
 $('mbox').classList.toggle('wide',k==='collection'||k==='village'||k==='dictionary');
 $('mbox').classList.toggle('kingdom',k==='village'); // Meu Reino: tema claro (pergaminho)
 if(k==='village')drawVillageMap();if(k==='dictionary')DictUI.mount();if(k==='collection')drawColPreview(performance.now()/1000);
 document.querySelectorAll('#tabBody canvas[data-duel]').forEach(c=>{const L=DUEL_LEVELS[+c.dataset.duel];drawAvatar(c.getContext('2d'),Object.assign({},CHARS.find(x=>x.id===L.base),{robe:L.robe,robeDark:L.robeDark,color:L.color}),0,false)});
}

// ---------- Perfil: aba Cosméticos ----------
function tiles(arr,key,cur,val,inner,cls){
 return arr.map(o=>{const ok=isUnlocked(o),v=val(o);
  return`<button class="tile ${cls} ${v===cur?'sel':''} ${ok?'':'locked'}" data-k="${key}" data-v="${esc(v)}" ${ok?'':'disabled'} title="${ok?'':esc(unlockText(o))}">${inner(o)}${ok?'':`<em class="req">${unlockText(o)}</em>`}</button>`}).join('');
}
function tabPerfil(){
 return`<div class="hero">
  <div class="pav big b-${profile.border}"><div class="pin">${profile.avatar}</div></div>
  <div class="herobody"><label for="nick">${t('profile.nick')}</label>
   <input id="nick" maxlength="16" value="${esc(draftNick)}" placeholder="Merlin" autocomplete="off" spellcheck="false">
   <div class="handlerow"><span>🆔 ${t('ident.handle')}</span><b>${esc(PlayerIdentity.handle)}</b><button type="button" class="frcopy" onclick="PlayerIdentity.copyHandle(this)" title="${esc(t('friends.copyHandle'))}">⧉</button><small>🔒 ${t('ident.fixed')}</small></div>
   <div class="heroinfo"><span class="ptitle">🏷️ ${esc(titleName(profile.activeTitle))}</span><span class="spellchip"><i style="background:${swatch(SCOLORS.find(s=>s.id===profile.spellColor)||SCOLORS[0])}"></i>${t('profile.spellColor')}</span></div></div>
 </div>
 <h4>${t('profile.titles')}</h4><div class="grid g3">${tiles(TITLES,'activeTitle',profile.activeTitle,x=>x.n,x=>`<span class="tname">${esc(titleName(x.n))}</span>`,'ttile')}</div>
 <div class="cols">
  <div><h4>${t('profile.avatar')}</h4><div class="grid g4">${tiles(AVATARS,'avatar',profile.avatar,a=>a.e,a=>`<span class="emo">${a.e}</span>`,'sq')}</div></div>
  <div><h4>${t('profile.border')}</h4><div class="grid g3">${tiles(BORDERS,'border',profile.border,b=>b.id,b=>`<span class="pav mini b-${b.id}"><span class="pin"></span></span><small>${t('borders.'+b.id)}</small>`,'sq')}</div></div>
 </div>
 <h4>${t('profile.spellColor')}</h4><div class="grid g7">${tiles(SCOLORS,'spellColor',profile.spellColor,s=>s.id,s=>`<span class="orb" style="background:${swatch(s)}"></span><small>${t('colors.'+s.id)}</small>`,'sq')}</div>
 <p class="tip2">⚙️ ${t('settings.movedHint')} <button class="linkbtn" onclick="setTab('settings')">${t('nav.settings')} ›</button></p>`;
}
// 🔤 switch de Sensibilidade de Acentos (Perfil › Geral e Santuário)
function accToggle(){
 const on=STRICT_ACCENTS;
 return`<div class="acctog ${on?'on':''}"><span class="accic">${on?'Ã':'A'}</span><div class="acctxt"><b>${t('accents.title')}</b><small>${t(on?'accents.onHint':'accents.offHint')}</small></div>
 <button class="switch ${on?'on':''}" role="switch" aria-checked="${on}" aria-label="${esc(t('accents.title'))}" onclick="keepNick();toggleStrictAccents();renderModal()"><i></i><span>${on?t('accents.strict'):t('accents.relaxed')}</span></button></div>`;
}
// botão rápido na barra de digitação
function updateAccUI(){document.body.classList.toggle('acc-strict',STRICT_ACCENTS);const b=$('accBtn');if(!b)return;b.textContent=STRICT_ACCENTS?'Ã':'A';b.classList.toggle('off',!STRICT_ACCENTS);b.title=t('accents.title')+': '+(STRICT_ACCENTS?t('accents.strict'):t('accents.relaxed'))}
// ---------- Perfil: aba Estatísticas & Conquistas ----------
function progressRow(ic,name,desc,p,reward,btn,fmt){
 const f=v=>fmt==='time'?fmtTime(v):fmtN(Math.floor(v)),st=p.claimed?'claimed':p.done?'ready':'';
 return`<div class="ach ${st}"><span class="aic">${ic}</span>
  <div class="abody"><div class="atop"><b>${name}</b><span class="rw">🎁 ${esc(reward)}</span></div>${desc?`<small>${desc}</small>`:''}
   <div class="abar"><i style="width:${p.pct}%"></i><span>${f(Math.min(p.val,p.goal))} / ${f(p.goal)}</span></div></div>
  <button class="claim" ${st==='ready'?'':'disabled'} onclick="${btn}">${p.claimed?t('stats.claimed'):p.done?t('stats.claim'):Math.floor(p.pct)+'%'}</button></div>`;
}
function tabStats(){
 const cards=[['⚔️','stats.kills',fmtN(profile.totalKills),'#ff6a5a',`${fmtN(profile.totalBosses)} ${t('stats.bosses')}`],['✍️','stats.words',fmtN(profile.totalWords),'#5ad0ff'],
  ['⚡','stats.wpm',best.wpm,'#ffd24a',t('stats.topSpeed')],['🎯','stats.acc',String(avgAcc()).replace('.',LANG==='en'?'.':',')+'%','#4dffa0'],
  ['🏆','stats.record',fmtN(best.score),'#ffb040',`${t('stats.maxWave')} ${best.wave}`],['💎','stats.xp',fmtN(profile.totalXp),'#c9a6ff',`${t('menu.level')} ${profile.level}`],
  ['⏱️','stats.time',fmtTime(profile.totalTime),'#7adfff'],['🎮','stats.games',fmtN(profile.games),'#ff7aff',`⚔️ ${t('duel.wins')}: ${profile.duels.wins}`]];
 return`<div class="statgrid">${cards.map(([ic,l,v,c,s])=>`<div class="scard" style="--c:${c}"><span class="sic">${ic}</span><b>${v}</b><span class="sl">${t(l)}</span>${s?`<small>${s}</small>`:''}</div>`).join('')}</div>
 ${statsDeepHTML()}
 <h4>${t('stats.achievements')} <span class="muted">${ACHIEVEMENTS.filter(a=>profile.claimed.includes(a.id)).length} / ${ACHIEVEMENTS.length} ${t('stats.claimedN')}</span></h4>
 <div class="achs">${ACHIEVEMENTS.map(a=>progressRow(a.ic,t('achievements.'+a.id+'.name'),t('achievements.'+a.id+'.desc'),achProgress(a),rewardText(a.reward),`doClaim('${a.id}',event)`,a.fmt)).join('')}</div>`;
}
// 📊 estatísticas profundas (dados que o jogo já guarda): recordes, vocabulário, nêmesis, maestria dos magos, online e música
function statsDeepHTML(){
 const wl=typeof wordLangOf==='function'?wordLangOf(LANG):'pt',nc=Meta.nemCount(wl),vocab=WordHistory.count(wl),on=profile.online||{wins:0,losses:0},sh=Array.isArray(profile.songHistory)?profile.songHistory:[];
 const ss=profile.songStats||{games:sh.length,clears:sh.filter(x=>x.clear).length,perfects:sh.reduce((a,x)=>a+(x.perfect|0),0)}; // perfis de antes dos totais: soma do histórico
 const hl=[['📈',t('stats.d.peak'),Math.max(profile.bestPeak|0,best.wpm|0)+' WPM'],['🔥',t('stats.d.combo'),'x'+(profile.bestCombo|0)],['📚',t('stats.d.vocab'),fmtN(vocab)],['🧠',t('stats.d.dom'),fmtN(nc.d)],
  ['😈',t('stats.d.nem'),fmtN(nc.n)],['🌐',t('stats.d.online'),`${on.wins|0}–${on.losses|0}`],['🎵',t('stats.d.songs'),`${ss.games|0} · 🏆${ss.clears|0}`],['✨',t('stats.d.perfects'),fmtN(ss.perfects|0)]];
 const B=Meta.book(wl),nem=Object.keys(B).filter(k=>Meta.isNem(B[k])).sort((a,b)=>B[b].m-B[a].m).slice(0,6);
 const mast=CHARS.map(c=>{const M=Meta.mastInfo(c.id),lock=isLocked(c);
  return`<div class="mrow ${lock?'locked':''}"><span class="mav">${charIcHTML(c)}</span><div class="mtx"><b>${charName(c)} <em>${t('ui.lvl')} ${M.lv}</em></b>
   <div class="mbar"><i style="width:${Math.round((M.max?1:M.f)*100)}%;--c:${c.color}"></i></div><small>${M.max?'★ '+t('stats.d.max'):fmtN(M.x-M.a)+' / '+fmtN(M.b-M.a)}</small></div></div>`}).join('');
 return`<h4>📊 ${t('stats.d.title')}</h4><div class="dgrid">${hl.map(([ic,l,v])=>`<div class="dcell"><span>${ic}</span><b>${v}</b><small>${l}</small></div>`).join('')}</div>
 <div class="dcols"><div><h4>🏅 ${t('stats.d.mastery')}</h4><div class="mlist">${mast}</div></div>
  <div><h4>😈 ${t('stats.d.nemTitle')}</h4>${nem.length?`<ol class="nemlist">${nem.map(k=>`<li><b>${esc(k.toUpperCase())}</b><span>${t('stats.d.misses',{n:B[k].m})}</span></li>`).join('')}</ol>`:`<p class="tip2">${t('stats.d.noNem')}</p>`}</div></div>`;
}
function doClaim(id,ev){const r=claimAchievement(id);if(!r)return;rewardFx(r.a.reward,r.ups,ev);celebrate(t('achievements.'+r.a.id+'.name'),rewardText(r.a.reward),r.ups)} // 🎆 mesma explosão de recompensa das missões
function celebrate(name,rw,ups){
 [784,988,1175,1568].forEach((f,i)=>snd(f,.2,'triangle',.06,0,i*.07));
 claimMsg=`🎉 <b>${esc(name)}</b>: ${esc(rw)}${ups.length?` · ⭐ ${t('results.levelUp')} ${t('menu.level')} ${profile.level}`:''}`;
 renderProfile();renderSide();renderModal();
}
// ---------- Perfil: aba Personagens → js/ui/modal-profile.js (lista + ficha com lore) ----------
// ---------- Perfil: aba Santuário de Música ----------
function tabAudio(){
 const mv=Math.round(MUS.vol*100),sv=Math.round(SFX.vol*100),cur=MUS.cur||desiredTrack();
 return`<div class="nowplay ${MUS.on?'on':''}"><span class="eq"><i></i><i></i><i></i><i></i><i></i></span>
  <div class="npt"><small>${t('music.nowPlaying')}</small><b id="npName">${t('musicTracks.'+cur+'.name')}</b></div><span class="npmode" id="npMode">♪ ${mmName(musicMode())}</span></div>
 <h4>🎚️ ${t('music.mixer')}</h4><div class="sliders">
  <div class="slider"><span class="sname">${t('music.music')}</span><input type="range" min="0" max="100" value="${mv}" style="--p:${mv}%" oninput="setMusicVol(this.value/100);this.style.setProperty('--p',this.value+'%');this.nextElementSibling.textContent=this.value+'%'"><b>${mv}%</b>
   <button class="mini ${MUS.on?'on':''}" onclick="keepNick();toggleMusic();if(MUS.on)musicStart();renderModal()">${MUS.on?t('settings.on'):t('settings.off')} <kbd>F2</kbd></button></div>
  <div class="slider"><span class="sname">${t('music.effects')}</span><input type="range" min="0" max="100" value="${sv}" style="--p:${sv}%" oninput="setSfxVol(this.value/100);this.style.setProperty('--p',this.value+'%');this.nextElementSibling.textContent=this.value+'%'" onchange="snd(880,.12,'triangle',.06)"><b>${sv}%</b>
   <button class="mini ${SFX.on?'on':''}" onclick="keepNick();toggleSfx();if(SFX.on)snd(880,.12,'triangle',.06);renderModal()">${SFX.on?t('settings.on'):t('settings.off')}</button></div>
 </div>
 <h4>📻 ${t('music.jukebox')}</h4><div class="jukebox">${MUSIC_STYLES.map(s=>{const on=MUS.style===s.id,live=on&&MUS.on;
  return`<button class="jcard ${on?'sel':''}" onclick="pickStyle('${s.id}')"><span class="jic">${s.ic}</span><span class="jtx"><b>${t('musicTracks.'+s.id+'.name')}${s.rec?` <em class="rec">★ ${t('music.recommended')}</em>`:''}</b><small>${t('musicTracks.'+s.id+'.desc')}</small></span>
   <span class="jbpm">${s.bpm} ${t('ui.bpm')}</span>${live?'<span class="jlive">▶</span>':''}</button>`}).join('')}</div>
 <p class="tip2">${t('music.missFx')}</p>`;
}
function pickStyle(id){keepNick();setMusicStyle(id);if(!MUS.on)toggleMusic();musicStart();renderModal();snd(660,.06,'triangle',.04)}
// ---------- Missões ----------
function tabQuests(kind){
 // ordem que dá satisfação: prontas para resgatar no topo, em andamento no meio, recolhidas por último
 const rank=p=>p.done&&!p.claimed?0:p.claimed?2:1;
 const list=questList(kind).map(q=>({q,p:questProgress(kind,q)})).sort((a,b)=>rank(a.p)-rank(b.p));
 const got=list.filter(x=>x.p.claimed).length,ready=list.filter(x=>x.p.done&&!x.p.claimed).length,n=list.length;
 // 📋 resumo da aba: quantas concluídas + aviso de prontas para resgatar + lembrete de que a seleção gira
 return`<div class="qsum"><div class="qsumtx"><b>${t('missions.sumDone',{a:got,b:n})}</b><small>${t(kind==='daily'?'missions.rotateDaily':'missions.rotateWeekly')}</small></div>
  ${ready?`<span class="qready">🎁 ${t('missions.readyN',{n:ready})}</span>`:''}<div class="qsumbar"><i style="width:${n?got/n*100:0}%"></i></div></div>
 <div class="qlist">${list.map(({q,p})=>questCard(kind,q,p)).join('')}</div>`;
}
// badges ricos de recompensa
function rewardBadges(r){
 const b=[];
 if(r.xp)b.push(`<span class="rb xp">⚡ +${fmtN(r.xp)} XP</span>`);
 if(r.aura)b.push(`<span class="rb aura">✨ +${fmtN(r.aura)} ${t('aura.name')}</span>`);
 if(r.title)b.push(`<span class="rb title">👑 ${t('rewards.label.title')}: ${esc(titleName(r.title))}</span>`);
 if(r.border)b.push(`<span class="rb cos">🖼️ ${t('rewards.label.border')}: ${esc(t('borders.'+r.border))}</span>`);
 if(r.color)b.push(`<span class="rb cos">🎨 ${t('rewards.label.color')}: ${esc(t('colors.'+r.color))}</span>`);
 if(r.avatar)b.push(`<span class="rb cos">${r.avatar} ${t('rewards.label.avatar')}</span>`);
 if(r.chests)b.push(`<span class="rb chestb">🎁 +${r.chests} ${t('chest.name')}</span>`);
 return b.join('');
}
function questCard(kind,q,p){
 const st=p.claimed?'got':p.done?'ready':'prog',left=Math.max(0,p.goal-p.val);
 return`<div class="qcard ${st}"><span class="qorb t-${q.tone||'violet'}">${q.ic}</span>
  <div class="qbody"><div class="qtop">${q.cat?`<span class="qcat c-${q.cat}">${t('missions.cat.'+q.cat)}</span>`:''}<b>${t('quests.'+q.id)}</b>${st==='prog'?`<span class="qtag">● ${t('missions.inProgress')}</span>`:''}</div>
   <div class="qbar"><i style="width:${p.pct}%"></i><span>${fmtN(Math.min(p.val,p.goal))} / ${fmtN(p.goal)}</span></div>
   <div class="qrw">${rewardBadges(q.reward)}${st==='prog'?`<em class="qleft">${t('missions.left',{n:fmtN(left)})}</em>`:''}</div></div>
  <div class="qact">${st==='ready'?`<button class="qclaim" onclick="doClaimQuest('${kind}','${q.id}',event)">${t('missions.claim')}</button>`:st==='got'?`<span class="qgot">✓ ${t('missions.claimedTag')}</span>`:''}</div></div>`;
}
function doClaimQuest(kind,id,ev){const r=claimQuest(kind,id);if(!r)return;rewardFx(r.qd.reward,r.ups,ev);afterClaim()}
// cabeçalho do modal de missões: contador de urgência (FOMO) + passe semanal com o baú
function missionsHead(){
 const tab=modal.tab,kind=tab==='weekly'?'weekly':'daily',c=chestProgress();
 const lab=tab==='login'?t('missions.nextLogin'):t(kind==='weekly'?'missions.expiresWeekly':'missions.expiresDaily');
 const pips=Array.from({length:c.goal},(_,i)=>`<i class="${i<c.val?'on':''}"></i>`).join('');
 return`<div class="qurgent"><span class="hg">⏳</span>${lab} <b data-countdown="${kind}">${fmtClock(secsToReset(kind))}</b></div>
 <div class="qpass ${c.ready?'ready':''} ${c.claimed?'opened':''}">
  <div class="chest ${c.ready?'shake':''} ${c.claimed?'open':''}" style="--s:.62"><i class="lid"></i><i class="body"></i><i class="lock"></i></div>
  <div class="qpbody"><div class="qptop"><span>${c.claimed?t('missions.passOpened'):t('missions.passTitle',{n:c.goal})}</span><b>${c.val}/${c.goal}</b></div>
   <div class="qpbar"><i style="width:${c.pct}%"></i><span class="pips">${pips}</span></div>
   <div class="qrw">${rewardBadges(WEEKLY_CHEST.reward)}</div></div>
  ${c.ready?`<button class="qclaim" onclick="doClaimChest(event)">${t('missions.passOpen')}</button>`:c.claimed?`<span class="qgot">✓ ${t('missions.claimedTag')}</span>`:''}</div>`;
}
function doClaimChest(ev){const r=claimChest();if(!r)return;rewardFx(r.r,r.ups,ev,true);afterClaim()}
function afterClaim(){renderProfile();renderSide();renderNav();renderModal()}
// ---------- Login diário: ofensiva de 7 dias ----------
function tabLogin(){
 const L=profile.login,cur=L.streak,can=canClaimLogin();
 const icon=(r,i)=>i===6?'':r.aura&&!r.xp?'💰':r.avatar?'🎁':'💎'; // (🪙 não existe na fonte de emoji do Windows)
 return`<div class="streakhead"><span class="flame">🔥</span><div><b>${t('missions.streakTitle',{n:cur})}</b><small>${t('missions.streakWarn')}</small></div></div>
 <div class="lgrid">${LOGIN_REWARDS.map((r,i)=>{const d=i+1,st=d<cur||(d===cur&&!can)?'got':d===cur?'now':'next',leg=i===6;
  return`<div class="lday ${st} ${leg?'legend':''}"><small>${t('missions.day')} ${d}</small>
   ${leg?`<div class="chest legendary ${st==='got'?'open':''}" style="--s:1"><i class="lid"></i><i class="body"></i><i class="lock"></i></div><strong class="supreme">${t('missions.supreme')}</strong>`:`<span class="lic">${icon(r,i)}</span>`}
   <div class="lrw">${rewardBadges(r)}</div>
   ${st==='now'?`<button class="qclaim" onclick="doClaimLogin(event)">${t('missions.collectToday')}</button>`:st==='got'?`<span class="lcheck">✓</span>`:''}</div>`}).join('')}</div>
 ${!can?`<p class="msub center">${t('missions.comeBack')} · ⏳ <b data-countdown="daily">${fmtClock(secsToReset('daily'))}</b></p>`:''}`;
}
function doClaimLogin(ev){const r=claimLogin();if(!r)return;rewardFx(r.r,r.ups,ev,r.day===7);afterClaim()}
// ---------- efeito de resgate (loop de dopamina): explosão dourada + moedas + saldo subindo ----------
function rewardFx(r,ups,ev,big){
 const layer=$('fxLayer');if(!layer)return;
 const cx=innerWidth/2,cy=innerHeight/2,n=big?60:36,frag=document.createDocumentFragment();
 for(let i=0;i<n;i++){const s=document.createElement('i'),a=Math.random()*6.283,d=rand(120,big?420:300);
  s.className='fxp'+(i%5===0?' coin':i%3===0?' star':'');
  s.style.cssText=`left:${cx}px;top:${cy}px;--dx:${(Math.cos(a)*d).toFixed(0)}px;--dy:${(Math.sin(a)*d*.8-60).toFixed(0)}px;--r:${(rand(-360,360)).toFixed(0)}deg;animation-delay:${(Math.random()*.08).toFixed(2)}s`;frag.appendChild(s)}
 const pop=document.createElement('div');pop.className='fxpop';pop.style.cssText=`left:${cx}px;top:${cy}px`;
 pop.innerHTML=`<div class="fxring"></div><div class="fxtxt">${rewardBadges(r)}</div>${ups&&ups.length?`<div class="fxlv">⭐ ${t('results.levelUp')} · ${t('menu.level')} ${profile.level}</div>`:''}`;
 frag.appendChild(pop);layer.appendChild(frag);
 setTimeout(()=>{layer.innerHTML=''},1700);
 coinSound(big);
}
function coinSound(big){
 // tilintar de moedas (agudos rápidos e aleatórios) + acorde de tesouro
 for(let i=0;i<(big?12:8);i++)snd(rand(1900,2900),.06,'square',.018,0,i*.045+Math.random()*.02);
 [523,659,784,1046].concat(big?[1318,1568]:[]).forEach((f,i)=>snd(f,.35,'triangle',.05,0,.25+i*.07));
}
// contador regressivo ao vivo (1 Hz, só mexe nos elementos visíveis com data-countdown)
setInterval(()=>{if(!modalOpen||modal.kind!=='missions')return;document.querySelectorAll('[data-countdown]').forEach(el=>{el.textContent=fmtClock(secsToReset(el.dataset.countdown))})},1000);// ---------- Duelo ----------
function tabDuel(){
 return`<button class="olbanner" onclick="openModal('online')"><span>🌐</span><div><b>${t('online.bannerTitle')}</b><small>${t('online.bannerSub')}</small></div><i>→</i></button>
 <div class="duels">${DUEL_LEVELS.map((L,i)=>`<div class="dcard" style="--c:${L.color}"><canvas width="140" height="140" data-duel="${i}"></canvas>
  <b>${L.ic} ${t('duel.levels.'+L.id)}</b><span class="dwpm">${L.wpm} WPM</span><span class="stars">${'★'.repeat(i+1)}${'☆'.repeat(2-i)}</span><small>🎁 +${L.xp} XP</small><small class="dstake">✨ ${t('aura.stakes',{w:L.aura[0],l:L.aura[1]})}</small>
  <button class="btn sm" onclick="closeModal();startDuel(${i})">${t('duel.fight')}</button></div>`).join('')}</div>
  ${duelStats()}<h4>📜 ${t('aura.history')}</h4>${duelHistory()}`;
}
// Barra de estatísticas: vitórias/derrotas · aura total · sequência
function duelStats(){
 const d=profile.duels,tot=d.wins+d.losses,pct=tot?Math.round(d.wins/tot*100):0;
 return`<div class="dstats"><div class="dst"><span>⚔️ ${t('aura.wins')} / ${t('aura.losses')}</span><b><i class="gw">${d.wins}</i> / <i class="gl">${d.losses}</i></b><span class="wlbar"><i style="width:${pct}%"></i></span></div>
 <div class="dst aura"><span>✨ ${t('aura.total')}</span><b>${fmtN(profile.aura)}</b><small>#${rankOf('aura')} · ${t('nav.ranking')}</small></div>
 <div class="dst fire ${profile.streak>1?'hot':''}"><span>🔥 ${t('aura.streak')}</span><b>${profile.streak}</b><small>${t('aura.best',{n:profile.bestStreak})}</small></div></div>`;
}
const botName=L=>{const n=charName(CHARS.find(c=>c.id===L.base));return t('duel.levels.'+L.id)+' '+n.charAt(0)+n.slice(1).toLowerCase()}; // "Mestre Raposa"
function duelHistory(){
 const h=profile.duelHistory;if(!h.length)return`<div class="dhist empty">${t('aura.empty')}</div>`;
 return`<div class="dhist">${h.map(x=>{const L=DUEL_LEVELS[x.li]||DUEL_LEVELS[0];return`<div class="drow ${x.win?'w':'l'}"><span class="dres">${x.win?t('aura.win'):t('aura.loss')}</span>
  <span class="dbot" style="--c:${L.color}">${L.ic} ${esc(botName(L))}</span><span class="dwp">⚡ ${x.wpm} WPM</span><span class="dtm">⏱️ ${fmtTime(x.time)}</span>
  <span class="dgain"><b class="${x.aura>=0?'up':'down'}">${x.aura>=0?'+':''}${x.aura} ${t('aura.name')}</b> • +${x.xp} XP</span></div>`}).join('')}</div>`;
}
// ---------- Ranking ----------
// 🏆 #ranking-modal: camada 1 = modo (abas do modal) · camada 2 = período (pílulas) · cabeçalhos clicáveis ordenam
let rankPeriod='all',rankSort='score';
const RANK_PERIODS=[['daily','📅'],['weekly','📆'],['monthly','🗓️'],['all','🌐']];
function setRankPeriod(p){rankPeriod=p;renderModal();snd(660,.05,'triangle',.03)}
function setRankSort(k){rankSort=k;renderModal();snd(720,.05,'triangle',.03)}
function tabRanking(){
 const mode=modal.tab,by=rankSort,list=rankingList(by,mode,rankPeriod),me=list.findIndex(x=>x.me),medal=i=>['🥇','🥈','🥉'][i]||'#'+(i+1);
 const on=k=>by===k?' class="on"':'',th=(k,l)=>`<th${on(k)} class="sortable${by===k?' on':''}" onclick="setRankSort('${k}')">${l}${by===k?' ▾':''}</th>`;
 const row=(x,i)=>`<tr class="${x.me?'me':''}"><td class="pos">${medal(i)}</td><td>${x.fl} ${x.ic} <b>${esc(x.nick)}</b>${x.me?' ⭐':''}</td><td${on('score')}>${fmtN(x.score)}</td><td${on('wpm')}>${x.wpm}</td><td>${x.wave}</td><td${on('aura')}>✨ ${fmtN(x.aura||0)}</td></tr>`;
 const mine=list[me],empty=!mine.score&&!mine.wpm;
 return`<div class="rperiods" id="ranking-modal">${RANK_PERIODS.map(([p,ic])=>`<button class="rper ${rankPeriod===p?'on':''}" onclick="setRankPeriod('${p}')">${ic} ${t('rank.period.'+p)}</button>`).join('')}</div>
 <table class="rank"><tr><th></th><th>${t('profile.nick')}</th>${th('score',t('hud.points'))}${th('wpm',t('hud.wpm'))}<th>${t('hud.wave')}</th>${th('aura',t('aura.name'))}</tr>
 ${list.slice(0,10).map(row).join('')}${me>=10?`<tr class="gap"><td colspan="6">⋯</td></tr>${row(list[me],me)}`:''}</table>
 <p class="msub center">${t('ranking.you')}: <b class="gold">#${me+1}</b>${empty?` · <span class="rempty">${t('rank.playToEnter',{m:t('style.'+mode)})}</span>`:''}</p>`;
}

// ================== OVERLAYS (menu, pausa, fim de jogo) ==================
function showOverlay(h,cls){const o=$('overlay');o.innerHTML=h;o.className='overlay'+(cls?' '+cls:'')}
function hideOverlay(){$('overlay').className='overlay hide'}
function pickHTML(){return`<div class="pick">${CHARS.map((c,i)=>{const lock=isLocked(c);return`<button class="${i===selected?'sel':''} ${lock?'locked':''}" onclick="selectChar(${i})"><span>${lock?'🔒':c.emoji}</span>${charName(c)}<small>${lock?t('charUi.unlockReq',{w:c.unlock,l:c.lvl}):t('characters.'+c.id+'.trait')}</small></button>`}).join('')}</div>`}
// ---------- Menu inicial: cena viva no canvas + card flutuante de vidro ----------
function showMenu(){
 if(state!=='menu'||!showMenu.done){clearGame();randomMenuScene();showMenu.done=true} // cena aleatória a cada retorno ao menu
 state='menu';
 const sc=curScene();
 const msp=SPELLS.find(s=>s.id===CHARS[selected].spell)||SPELLS[0];
 showOverlay(`<div class="mtop"><div class="mtopl"><button class="mhello mlink" onclick="openProfile(false,'perfil')" title="${esc(t('profile.title'))}">${t('menu.hello')}, <b class="gold">${esc(nickOr())}</b> · ${t('ui.lvl')} ${profile.level} · ${CHARS[selected].emoji} ${charName(CHARS[selected])} <i>›</i></button><button class="mskill mlink" style="--c:${msp.c}" onclick="openProfile(false,'skills')" title="${esc(t('nav.skills'))}"><span>${msp.ic}</span>${t('spells.'+msp.id+'.name')} <i>›</i></button></div>${sc.id==='kingdom'?`<button class="mscene mkingdom" onclick="openModal('village')">🏛️ ${esc(Village.data.name)} · <b>${t('menu.openKingdom')} ›</b></button>`:`<span class="mscene">${t('menu.scenes.'+sc.id)}</span>`}</div>
 ${centerWidgetHTML()}
 ${adventureHTML()}`,'menu');
 Quips.start(); // falas do mago selecionado (recomeça ao trocar de personagem, idioma ou bioma)
 fitMenuMobile();requestAnimationFrame(fitMenuLift); // depois do layout: sobe a cena se o painel cobriria o mago
}
// 📱 menu no celular: cena + card cabem na altura REAL da tela (sem rolar), em qualquer aparelho.
//  1) mede a altura visível (visualViewport: desconta barra do navegador), a barra superior e o card;
//  2) se a cena inteira não couber, compacta o card (classe menu-tight) e mede de novo;
//  3) a cena ocupa a altura que sobra com object-fit:cover (recorta as bordas, nunca distorce).
function fitMenuMobile(){
 const cv=$('game');if(!cv||!DeviceManager.isMobile)return;
 const B=document.body,inMenu=panelEl.classList.contains('menu-mode')&&state==='menu',card=document.querySelector('.overlay.menu .mcard');
 const vh=(window.visualViewport?visualViewport.height:innerHeight),vw=document.documentElement.clientWidth,full=vw*H/W;
 // 🎮 partida: o campo (proporção 600×680, sem recorte) fica com TODA a altura que a barra de digitação deixa livre
 //  — mede a barra de verdade (muda com o modo: teclado, desenho, runas), então serve para qualquer aparelho.
 if(state==='play'||state==='paused'){
  B.classList.remove('menu-tight');const tb=document.querySelector('.typebar'),cs=getComputedStyle($('app'));
  const land=vw>vh&&vh<560;B.classList.toggle('land',land); // celular deitado: barra de digitação AO LADO do campo
  const pads=(parseFloat(cs.paddingTop)||0)+(parseFloat(cs.paddingBottom)||0);
  if(land){const w=Math.floor(Math.min((vh-pads-4)*W/H,Math.max(200,vw-Math.min(380,Math.max(260,vw*.45))-12)));cv.style.width=w+'px';cv.style.height=Math.floor(w*H/W)+'px';return}
  const avail=vh-pads-(tb?tb.offsetHeight:0)-4;
  let w=Math.floor(Math.max(150,Math.min(full,avail))*W/H);
  cv.style.width=w+'px';cv.style.height=Math.floor(w*H/W)+'px';
  document.documentElement.style.setProperty('--tbh',(tb?tb.offsetHeight:0)+'px'); // a camada de desenho vai até a barra
  const dp=$('drawpadTx');if(dp)dp.textContent=t(G&&G.runes?'input.padRunes':'input.padLetters');
  // conferência: bordas/margens não previstas → se a barra ainda passar da tela, encolhe o que sobrou
  const over=tb?tb.getBoundingClientRect().bottom-(vh-(parseFloat(cs.paddingBottom)||0)):0;
  if(over>0){w=Math.floor((w*H/W-over-2)*W/H);cv.style.width=w+'px';cv.style.height=Math.floor(w*H/W)+'px'}
  return;
 }
 if(!inMenu||!card){if(cv.style.height){cv.style.height='';cv.style.width='';B.classList.remove('menu-tight')}return}
 const bar=($('mbar')?$('mbar').offsetHeight:0),pad=16;
 const avail=()=>vh-bar-card.offsetHeight-pad;
 B.classList.remove('menu-tight');
 if(avail()<full*.98)B.classList.add('menu-tight');
 const h=Math.round(Math.max(full*.55,Math.min(full,avail())));
 cv.style.width=vw+'px';cv.style.height=h+'px';
}
addEventListener('resize',()=>{fitMenuMobile();fitMenuLift()});
if(window.visualViewport)visualViewport.addEventListener('resize',()=>{fitMenuMobile();fitMenuLift()});
function pickBiome(i){setBiome(i);renderEnemyList();showMenu();snd(660,.08,'triangle',.04)}
// ---------- Ajuda (modal "Como Jogar") ----------
// "Como Jogar": js/ui/modal-how-to-play.js (tabHelp com 4 abas)
// ---------- Menu de pausa: vidro desfocado + resumo da rodada + ações ----------
function showPause(){
 const duel=G.mode==='duel',d=G.duel;
 const hearts=(n,max)=>'<span class="hearts">'+'❤️'.repeat(Math.max(0,n))+'<i>'+'🖤'.repeat(Math.max(0,max-n))+'</i></span>';
 const cards=duel?[
  ['🏆',t('pause.score'),fmtN(G.words*10)],['❤️',t('pause.hp'),Math.ceil(d.php)+' / '+d.max],['⚡',t('pause.wpm'),calcWpm()],
  ['🎯',t('pause.acc'),calcAcc()+'%'],['🔥',t('pause.combo'),G.combo+' / '+(G.maxCombo||0)],['⚔️',t('pause.bot'),Math.ceil(d.bhp)+' / '+d.max]
 ]:[
  ['🏆',t('pause.score'),fmtN(G.score)],['🌊',t('pause.wave'),G.wave],['⚡',t('pause.wpm'),calcWpm()],
  ['🎯',t('pause.acc'),calcAcc()+'%'],['🔥',t('pause.combo'),G.combo+' / '+(G.maxCombo||0)],['❤️',t('pause.lives'),hearts(G.lives,G.ch.lives)]
 ];
 showOverlay(`<div class="pausecard">
  <div class="phead"><span class="pico">⏸</span><h2>${t('ui.pause')}</h2><small>${duel?t('duel.levels.'+d.L.id)+' · '+d.L.wpm+' WPM':t('biomes.'+BIOMES[G.biome].id+'.name')+' · '+G.ch.emoji+' '+charName(G.ch)}</small></div>
  <div class="pgrid">${cards.map(([ic,l,v])=>`<div class="pmini"><span>${ic}</span><b>${v}</b><small>${l}</small></div>`).join('')}</div>
  <div class="pactions">
   <button class="btn pmain" onclick="resume()">⏩ ${t('ui.resume')} <kbd>ENTER</kbd></button>
   <button class="pact" onclick="restartMatch()">🔄 ${t('ui.restart')} <kbd>R</kbd></button>
   <button class="pact quit" onclick="quitToMenu()">🚪 ${t('ui.menu')} <kbd>M</kbd></button>
  </div>
  ${DeviceManager.isMobile&&!duel&&!G.runes?`<div class="pctl"><span>⚙️ ${t('controls.pauseLabel')}</span><div class="pctlbtns">${[['draw','✍️','controls.drawTitle'],['keys','⌨️','controls.keysTitle']].map(([m,ic,l])=>`<button class="${Input.mode===m?'on':''}" onclick="pickControl('${m}')">${ic} ${t(l)}</button>`).join('')}</div></div>`:''}
  <p class="hint">${t('pause.hint')}<br>${t('pause.quitNote')}</p>
 </div>`,'glass');
}
// ---------- 🔮 Widget central do menu (#vignette-center-widget): seletor de controle (celular) + falas do mago ----------
function playFromMenu(){Quips.stop();if(GAME_STYLE==='songs')return openModal('songs');newGame()} // 🎵 Ritmo do Bardo: primeiro escolhe a música
function centerWidgetHTML(){
 const ch=CHARS[selected];
 const opts=DeviceManager.isMobile?['letters','words','runes','songs']:['words','letters','runes','songs'],on=menuStyleOn();
 const pills=`<div class="mwpills n${opts.length}" role="tablist">${opts.map(m=>`<button class="${on===m?'on':''}" data-m="${m}" onclick="event.stopPropagation();pickMenuControl('${m}')">${t('style.'+m)}</button>`).join('')}</div>`;
 return`<div class="mwidget compact" id="vignette-center-widget">${pills}</div>`; // as falas agora são um balão acima do mago (dialogues.js)
}
// troca com 1 toque, sem redesenhar o menu (a fala atual continua)
const menuStyleOn=()=>GAME_STYLE;
// 📱 Letras → desenhar 1 letra · Palavras → teclado virtual · Runas → formas (o controle ainda pode ser trocado na pausa)
function pickMenuControl(m){
 setGameStyle(m);
 if(DeviceManager.isMobile&&m!=='runes')Input.setMode(m==='letters'?'draw':'keys'); // 🎵 músicas: palavras no teclado
 Input.sync();const on=menuStyleOn();document.querySelectorAll('.mwpills [data-m]').forEach(b=>b.classList.toggle('on',b.dataset.m===on));snd(on==='runes'?988:660,.06,'triangle',.04);
}
// falas do menu: js/systems/dialogues.js (balão acima do mago; Quips = atalho de compatibilidade)
function pickControl(m){Input.setMode(m);if(state==='paused'){showPause();return}newGame()}
function restartMatch(){if(!G)return;if(G.mode==='duel')startDuel(G.duel.li);else playAgain();snd(523,.1,'triangle',.05)}
function quitToMenu(){showMenu();snd(330,.12,'triangle',.05)}
function showGameOver(r){
 const row=(l,v)=>`<div class="row"><span>${l}</span><b>+${v}</b></div>`;
 const hook=Meta.hook(r);
 showOverlay(`<h2>${r.song?t(r.song.clear?'song.clearTitle':'song.overTitle'):t(r.daily?'daily.over':'results.gameOver')}</h2>${r.record?`<p class="record">${t('results.newRecord')}</p>`:''}
 ${failHTML(r)}
 ${hook?`<p class="gohook">🔥 ${esc(hook)}</p>`:''}
 <div class="row2 goquick"><button class="btn" id="goAgain" onclick="playAgain()">↻ ${t(r.daily?'daily.again':'results.again')}</button><button class="btn ghost" onclick="quitToMenu()">🏠 ${t('results.menu')}</button></div>
 ${DeviceManager.isTouch?'':`<div class="kbdhint"><span class="kh-tag">⌨️ ${t('results.shortcuts')}</span><span><kbd>ENTER</kbd> ${t('results.again').toLowerCase()}</span><span><kbd>ESC</kbd> ${t('results.menu').toLowerCase()}</span></div>`}
 ${r.song?songOverHTML(r.song):''}
 ${dailyOverHTML(r.daily)}
 ${goalsHTML(r)}
 <div class="stats"><div><b>${fmtN(r.score)}</b><span>${t('hud.points')}</span></div><div><b>${r.wave}</b><span>${t('hud.wave')}</span></div><div><b>${r.wpm}</b><span>${t('hud.wpm')}</span></div>${r.peak?`<div class="peak" title="${esc(t('results.peakTip'))}"><b>${r.peak}</b><span>${t('results.peak')}</span></div>`:''}<div><b>${r.acc}%</b><span>${t('hud.precision')}</span></div></div>
 ${overChestsHTML(r.chests)}
 <div class="xpbox">${row(t('results.xpScore'),r.xp.xs)}${row(t('results.xpWords',{n:r.words}),r.xp.xw)}${row(t('results.xpWave',{n:r.wave}),r.xp.xo)}${row(esc(r.acc>95?t('results.xpBonusOk'):t('results.xpBonusNo')),r.xp.bonus)}${r.xp.items?row('👕 '+t('col.itemBonus',{n:Inventory.bonuses().xp}),r.xp.items):''}${r.xp.vil?row('🏛️ '+t('village.bonusRow',{n:Village.bonuses().xp}),r.xp.vil):''}
  ${r.aura?`<div class="row arow"><span>${t('arc.auraMatch')}${r.overN?' · '+t('arc.overN',{n:r.overN}):''}</span><b>+${fmtN(r.aura)} ✨</b></div>`:''}
  ${xpFooter(r.before)}</div>
 <div id="lvSlot"></div><div class="rewards" id="rwSlot"></div>
 ${r.fast.length?`<table class="fast"><tr><th>${t('results.fastest')}</th><th>${t('results.time')}</th><th>${t('hud.wpm')}</th></tr>${r.fast.map(f=>`<tr><td>${esc(f.word.toUpperCase())}</td><td>${f.secs.toFixed(2)}s</td><td>${f.wpm}</td></tr>`).join('')}</table>
 <p class="small">${t('results.maxWpmWord')}: <b class="gold">${r.maxW}</b></p>`:''}
 ${pickHTML()}`,'over');
 animateXp(r.before,r.xp.gain,r.rewards);
}
// 💀 derrota clara: a palavra que derrubou a torre, congelada — digitado em dourado, a letra onde travou/errou em vermelho
function failHTML(r){
 const L=r.lastHit;if(!L||L.runes)return r.clutch?`<p class="small goclutch">${t('arc.clutchN',{n:r.clutch})}</p>`:'';
 const up=L.word.toUpperCase(),i=Math.min(L.typed,up.length-1),done=up.slice(0,L.typed),at=up[i]||'',rest=up.slice(i+1);
 const why=L.err?t('arc.failErr',{x:L.err.toUpperCase(),y:at}):L.typed?t('arc.failStop',{y:at}):t('arc.failUntouched');
 return`<div class="gofail"><small>💀 ${t('arc.failTitle')}</small><b class="gw"><span class="ok">${esc(done)}</span><u>${esc(at)}</u><span>${esc(rest)}</span></b><small class="why">${esc(why)}</small>
  ${r.clutch?`<small class="goclutch">${t('arc.clutchN',{n:r.clutch})}</small>`:''}</div>`;
}
// 📅 resultado do desafio do dia: melhor de hoje, tentativas e o texto para compartilhar (copiado para a área de transferência)
function dailyOverHTML(d){
 if(!d)return'';
 return`<div class="godaily"><div><b>📅 ${t('daily.title')}</b><small>${d.isBest?'🏆 '+t('daily.newBest'):t('daily.bestToday',{n:fmtN(d.best),w:d.wave})} · ${t('daily.tries',{n:d.tries})}</small></div>
  <button class="btn ghost" data-share="${esc(d.share)}" onclick="Meta.share(this)">📋 ${t('daily.share')}</button></div>`;
}
// 🎯 barras que enchem na hora: a meta mais perto de completar + a maestria do mago (de onde estava até onde chegou)
function goalBar(ic,lab,a,b,max,sub,cls){
 const p=v=>Math.max(0,Math.min(100,v/max*100)).toFixed(1)+'%';
 return`<div class="gobar ${cls||''}"><div class="gb-top"><span>${ic} ${esc(lab)}</span><small>${sub}</small></div><div class="gb-track"><i class="gb-old" style="width:${p(a)}"></i><i class="gb-new" style="--a:${p(a)};--b:${p(b)}"></i></div></div>`;
}
function goalsHTML(r){
 const g=Meta.nextGoal(r),m=r.mast;let h='';
 if(g)h+=goalBar(g.ic,g.lab,g.a,g.b,g.max,`${fmtN(Math.round(g.b))}/${fmtN(g.max)}${g.unit}`,'next');
 if(m){const c=CHARS.find(x=>x.id===m.id),up=m.B.lv>m.A.lv,B=m.B;
  h+=goalBar(c.emoji,t('mast.bar',{c:charName(c),l:B.lv}),up?0:m.x0-B.a,B.x-B.a,Math.max(1,B.b-B.a),B.max?t('mast.max'):`+${m.gain} · ${fmtN(B.x-B.a)}/${fmtN(B.b-B.a)}`,up?'mast up':'mast');
  if(up)h+=`<p class="gomast">🏅 ${t('mast.up',{c:charName(c),l:B.lv})}${Meta.perksUpTo(m.A.lv,B.lv).map(p=>' · '+esc(p)).join('')}</p>`}
 if(r.nemN||r.domN)h+=`<p class="small gonem">${r.nemN?'😈 '+t('nem.overN',{n:r.nemN}):''}${r.nemN&&r.domN?' · ':''}${r.domN?'📖 '+t('nem.domN',{n:r.domN}):''}</p>`;
 return h?`<div class="gogoals">${h}</div>`:'';
}
// 🎁 painel "baús ganhos nesta partida": os baús entram um a um (pulando) + motivo de cada um + abrir na hora
function overChestsHTML(c){
 if(!c)return'';
 const reasons=c.waves.map(w=>'🌊 '+t('results.chestWave',{n:w})).concat(c.level?['⭐ '+t('results.chestLevel',{n:c.level})]:[]);
 const next=c.next?t('results.chestNext',{n:c.next}):'';
 if(!c.n)return`<div class="mchests none"><span class="chest mc-c" style="--s:.7"><i class="lid"></i><i class="body"></i><i class="lock"></i></span>
  <div class="mc-tx"><b>${t('results.chestNone')}</b><small>${next}</small></div></div>`;
 const shown=Math.min(c.n,5);
 return`<div class="mchests got"><div class="mc-row">${Array.from({length:shown},(_,i)=>`<span class="chest mc-c ${i===shown-1&&c.n>=3?'legendary':''}" style="--s:.78;--d:${(i*.18).toFixed(2)}s"><i class="lid"></i><i class="body"></i><i class="lock"></i></span>`).join('')}${c.n>shown?`<em class="mc-more">+${c.n-shown}</em>`:''}</div>
  <div class="mc-tx"><b>🎁 ${t(c.n===1?'results.chestGot1':'results.chestGot',{n:c.n})}</b><small>${reasons.join(' · ')}</small>${next?`<small class="mc-next">${next}</small>`:''}</div>
  <button class="qclaim mc-open" id="mcOpen" onclick="openChestsFromOver()">${t('results.chestOpen',{n:Chests.count()})}</button></div>`;
}
function openChestsFromOver(){if(Chests.count()>0)ChestUI.start(Chests.count()>1)}
// depois de abrir pelo fim de jogo: atualiza o botão (ou some, se não sobrou nenhum)
function refreshOverChests(){const b=$('mcOpen');if(!b)return;const n=Chests.count();if(n)b.textContent=t('results.chestOpen',{n});else b.outerHTML=`<span class="qgot">✓ ${t('results.chestOpened')}</span>`}
function xpFooter(b){return`<div class="row tot"><span>${esc(nickOr())} · ${esc(titleName(profile.activeTitle))}</span><b id="xpNum">+0 XP</b></div>
 <div class="xpbig"><i id="xpBar" style="width:${b.xp/xpNeed(b.level)*100}%"></i></div><div class="xplv"><span id="xpLv">${t('ui.lvl')} ${b.level}</span><span id="xpNext">${b.xp} / ${xpNeed(b.level)} XP</span></div>`}
function showDuelResult(r){
 showOverlay(`<h2 class="${r.win?'':'lose'}">${r.win?'🏆 '+t('duel.victory'):'💀 '+t('duel.defeat')}</h2>
 <p>${r.L.ic} ${esc(botName(r.L))} · ${r.L.wpm} WPM</p>
 <div class="auradelta ${r.aura>=0?'up':'down'}"><span>✨ ${fmtN(r.auraBefore)}</span><i>→</i><b>${fmtN(profile.aura)} ${t('aura.name')}</b><em>${r.aura>=0?'+':''}${r.aura}</em>${profile.streak>1?`<small>🔥 ${profile.streak}</small>`:''}</div>
 <div class="stats"><div><b>${r.words}</b><span>${t('stats.words')}</span></div><div><b>${r.wpm}</b><span>${t('hud.wpm')}</span></div><div><b>${r.acc}%</b><span>${t('hud.precision')}</span></div><div><b>${profile.duels.wins}</b><span>${t('duel.wins')}</span></div></div>
 <div class="xpbox">${xpFooter(r.before)}</div><div id="lvSlot"></div><div class="rewards" id="rwSlot"></div>
 <div class="row2"><button class="btn" onclick="startDuel(${r.li})">${t('duel.rematch')}</button><button class="btn ghost" onclick="showMenu()">${t('results.menu')}</button></div>`,'over');
 animateXp(r.before,r.gain,r.rewards);
}
function animateXp(b,gain,rewards){
 let lv=b.level,xp=b.xp,left=gain,shown=0,last=performance.now();
 const rate=gain/Math.min(2600,900+gain*2);
 function step(now){
  const bar=$('xpBar');if(!bar||state!=='over')return;
  const d=Math.min(left,Math.max(0,now-last)*rate);last=now;left-=d;xp+=d;shown+=d;
  while(xp>=xpNeed(lv)){xp-=xpNeed(lv);lv++;levelUpFx(lv)}
  bar.style.width=(xp/xpNeed(lv)*100)+'%';$('xpLv').textContent=t('ui.lvl')+' '+lv;$('xpNext').textContent=Math.floor(xp)+' / '+xpNeed(lv)+' XP';$('xpNum').textContent='+'+Math.round(shown)+' XP';
  if(left>.01)requestAnimationFrame(step);
  else if(rewards.length)$('rwSlot').innerHTML=rewards.map((r,i)=>`<span style="animation-delay:${i*.12}s">${esc(r)}</span>`).join('');
 }
 requestAnimationFrame(step);
}
function levelUpFx(lv){
 const s=$('lvSlot');if(!s)return;
 s.innerHTML=`<div class="lvup">⭐ ${t('results.levelUp')} ⭐<br><span>${t('results.reachedLevel',{n:lv})}</span></div>`;
 [523,659,784,1046,1318].forEach((f,i)=>snd(f,.25,'triangle',.06,0,i*.08));
}

// ================== HUD DO CANVAS (arcade) ==================
// HUD em cache: o placar é desenhado numa imagem só quando um número muda (pontos, combo, onda, vidas, velocidade,
// inimigos, idioma). Nos outros quadros: 1 drawImage — sem toLocaleString, sem montar strings, sem 6 fillText por quadro.
let hudCv=null,hudCx=null;const HUDK={score:-1,combo:-1,wave:-1,lives:-1,spd:-1,en:-1,max:-1,lang:'',ch:null};
function drawHUD(c){
 const spd=Math.floor(G.waveTime*1.5),mx=maxOnScreen(G.wave),K=HUDK;
 if(K.score!==G.score||K.combo!==G.combo||K.wave!==G.wave||K.lives!==G.lives||K.spd!==spd||K.en!==G.enemies.length||K.max!==mx||K.lang!==LANG||K.ch!==G.ch||K.st!==G.streak||K.ov!==G.over||K.au!==G.aura){
  K.score=G.score;K.combo=G.combo;K.wave=G.wave;K.lives=G.lives;K.spd=spd;K.en=G.enemies.length;K.max=mx;K.lang=LANG;K.ch=G.ch;K.st=G.streak;K.ov=G.over;K.au=G.aura;
  if(DeviceManager.isMobile)domHud(); // 📱 HUD em HTML: nada é desenhado no canvas
  else{if(!hudCv){hudCv=mkCanvas(W,140);hudCx=hudCv.getContext('2d')} // 140: cabe o selo da Sobrecarga abaixo do combo
   hudCx.clearRect(0,0,W,140);drawHUDLayer(hudCx)}
 }
 if(hudCv&&!DeviceManager.isMobile)c.drawImage(hudCv,0,0);
}
// 📱 HUD HTML: só escreve no DOM quando um número muda (mesma detecção do cache do canvas)
const MH={};
function mhSet(id,v){if(MH[id]!==v){MH[id]=v;$(id).textContent=v}}
function domHud(){
 mhSet('mhPtsL','✦ '+t('hud.points'));mhSet('mhWaveL',t('hud.wave'));
 mhSet('mhScore',fmtN(G.score));mhSet('mhWave',String(G.wave));
 mhSet('mhCombo',G.over?t('arc.overHud'):G.streak>0?t('arc.streak',{n:G.streak,m:ARC.OVER_AT}):G.combo>=4?t('hud.combo')+' x'+mult()+' · '+G.combo:'');
 let h='';for(let i=0;i<G.ch.lives;i++)h+=i<G.lives?'❤':'♡';mhSet('mhLives',h);
 mhSet('mhInfo',t('hud.enemies')+' '+G.enemies.length+'/'+maxOnScreen(G.wave));
}
function drawHUDLayer(c){
 hudBox(c,12,12,152,56);
 c.font='800 10px Nunito';c.fillStyle='#e8b86a';c.fillText('✦ '+t('hud.points'),24,30);
 c.font='900 24px Nunito';c.fillStyle='#fff';c.fillText(fmtN(G.score),24,58);
 let ly=74;
 if(G.combo>=4){hudBox(c,12,ly,152,24);c.font='900 11.5px Nunito';c.fillStyle='#5ad0ff';c.fillText(t('hud.combo')+' x'+mult()+'  ·  '+G.combo+' '+t('hud.inRow'),22,ly+16);ly+=30}
 // ⚡ sequência perfeita → Sobrecarga Arcana (js/systems/combat.js)
 if(G.over){hudBox(c,12,ly,152,24);c.fillStyle='rgba(255,210,74,.18)';c.fillRect(14,ly+2,148,20);c.font='900 12px Nunito';c.fillStyle='#ffd24a';c.fillText(t('arc.overHud'),22,ly+16)}
 else if(G.streak>0){hudBox(c,12,ly,152,24);c.font='800 11px Nunito';c.fillStyle='#e8d9a8';c.fillText(t('arc.streak',{n:G.streak,m:ARC.OVER_AT}),22,ly+16);
  c.fillStyle='rgba(255,255,255,.12)';c.fillRect(22,ly+19,132,2);c.fillStyle='#ffd24a';c.fillRect(22,ly+19,132*Math.min(1,G.streak/ARC.OVER_AT),2)}
 if(G.aura>0){c.font='800 10px Nunito';c.fillStyle='#c9a6ff';c.textAlign='right';c.fillText('+'+G.aura+' ✨',158,30);c.textAlign='left'}
 const lw=G.ch.lives*25+20,bw=70+lw,bx=W-12-bw;
 hudBox(c,bx,12,bw,56);
 c.fillStyle='rgba(232,184,106,.35)';c.fillRect(bx+66,20,1,40);
 c.textAlign='center';
 c.font='800 10px Nunito';c.fillStyle='#e8b86a';c.fillText(t('hud.wave'),bx+33,30);c.fillText(t('hud.lives'),bx+66+lw/2,30);
 c.font='900 25px Cinzel, serif';c.fillStyle='#fff';c.fillText(G.wave,bx+33,59);
 for(let i=0;i<G.ch.lives;i++)heart(c,bx+66+(lw-(G.ch.lives-1)*25)/2+i*25,49,19,i<G.lives);
 hudBox(c,bx,74,bw,22);c.font='800 10px Nunito';c.fillStyle='#aab4dc';c.fillText(t('hud.speed')+' x'+(1+G.waveTime*.015).toFixed(2)+'  ·  '+t('hud.enemies')+' '+G.enemies.length+'/'+maxOnScreen(G.wave),bx+bw/2,89);
 c.textAlign='left';
}

// ================== BARRA DE DIGITAÇÃO (DOM só muda quando o valor muda) ==================
const KB={},UIC={typed:null,rest:null,wpm:-1,acc:-1,mode:'',mana:-1,full:null,next:null};
let keyFlash={},badT=0;
function buildKb(){
 $('kb').innerHTML=['qwertyuiop','asdfghjkl','zxcvbnm'].map(r=>`<div>${[...r].map(k=>`<span data-k="${k}">${k.toUpperCase()}</span>`).join('')}</div>`).join('');
 document.querySelectorAll('.kb span').forEach(s=>KB[s.dataset.k]=s);
 // touch + acentos estritos: linha extra com as letras acentuadas do português (só aparece no teclado virtual mobile)
 $('kacc').innerHTML=[...'áàâãéêíóôõúç'].map(k=>`<span data-k="${k}">${k.toUpperCase()}</span>`).join('');
}
function flashKey(k,cls){const el=KB[k];if(!el)return;el.classList.remove('hit','err');void el.offsetWidth;el.classList.add(cls);clearTimeout(keyFlash[k]);keyFlash[k]=setTimeout(()=>el.classList.remove(cls),160)}
function shakeInput(){const ib=$('inputbox');ib.classList.remove('bad');void ib.offsetWidth;ib.classList.add('bad');clearTimeout(badT);badT=setTimeout(()=>ib.classList.remove('bad'),400)}
function updateUI(force){
 const mm=musicMode();if(force||mm!==UIC.mode){const me=$('musicMode');me.textContent='♪ '+mmName(mm);me.style.color=MODES[mm];UIC.mode=mm}
 if(modalOpen&&modal.tab==='audio'){const n=$('npName'),m=$('npMode');if(n&&m){const nm=t('musicTracks.'+(MUS.cur||desiredTrack())+'.name'),mt='♪ '+mmName(mm);if(n.textContent!==nm)n.textContent=nm;if(m.textContent!==mt)m.textContent=mt}}
 if(!G)return;
 const e=G.target,ty=e?(G.runes?runeGlyphs(e.word.slice(0,e.typed)):e.word.slice(0,e.typed)):'',re=e?(G.runes?runeGlyphs(e.word.slice(e.typed)):e.word.slice(e.typed)):'';
 if(force||ty!==UIC.typed){$('typed').textContent=ty;UIC.typed=ty}
 if(force||re!==UIC.rest){$('rest').textContent=re;UIC.rest=re}
 const w=calcWpm();if(force||w!==UIC.wpm){$('wpm').textContent=w;$('wpmArc').style.strokeDashoffset=176-176*Math.min(1,w/100);UIC.wpm=w}
 const a=calcAcc();if(force||a!==UIC.acc){$('prec').textContent=a+'%';UIC.acc=a}
 const m=Math.round(G.mana);if(force||m!==UIC.mana){$('manaFill').style.transform=`scaleX(${m/100})`;UIC.mana=m;const full=m>=100;if(full!==UIC.full){$('mana').classList.toggle('full',full);UIC.full=full}}
 // ❄️/💥 botões do celular acendem quando o feitiço está pronto (mana + recarga)
 const rf=arcCanCast('freeze'),rb=arcCanCast('blast');if(force||rf!==UIC.rf||rb!==UIC.rb){UIC.rf=rf;UIC.rb=rb;$('spF').classList.toggle('ready',rf);$('spB').classList.toggle('ready',rb)}
 const nx=e&&!G.runes?e.nw[e.typed]:null;if(force||nx!==UIC.next){if(UIC.next&&KB[UIC.next])KB[UIC.next].classList.remove('next');if(nx&&KB[nx])KB[nx].classList.add('next');UIC.next=nx}
}

// ================== PAINÉIS LATERAIS ==================
let avatarCvs=[],enemyCvs=[];
function selectChar(i){
 if(isLocked(CHARS[i])||state==='play')return;selected=i;store.set('char',i);renderSide();
 if(state==='menu'){setMenuScene(sceneForChar(CHARS[i].id));menuCheer();showMenu();[784,988,1318].forEach((f,k)=>snd(f,.18,'triangle',.05,0,k*.07))} // o mago escolhido aparece na cena e comemora
 else if(state==='over'){document.querySelectorAll('.pick').forEach(p=>p.outerHTML=pickHTML())}
 snd(880,.08,'triangle',.04);
}
// 🪧 TOOLTIP RICO PADRONIZADO — o mesmo molde para magos, magias e inimigos:
//  cabeçalho (ícone em selo colorido + nome dourado + etiqueta) · descrição · atributos em chips · rodapé (ação/estado)
// retrato do sprite oficial como imagem (tooltip é HTML em data-tip: não cabe um canvas) — 1 dataURL por mago, refeito se os sprites recarregarem
const _portURL={};
function charPortraitURL(ch){
 if(typeof Sprites==='undefined'||!Sprites.has(ch.id))return'';const k=ch.id+'|'+Sprites.ver;if(_portURL[k])return _portURL[k];
 const c=document.createElement('canvas'),x=c.getContext('2d');c.width=c.height=84;x.scale(.6,.6);drawCharPortrait(x,ch,0,false,false);return _portURL[k]=c.toDataURL('image/png'); // 84 px: nítido no ícone de 40 px em tela 2×, e leve no data-tip
}
const charIcHTML=ch=>{const u=charPortraitURL(ch);return u?`<img class="tc-img" src="${u}" alt="">`:ch.emoji};
function tipCard(o){
 const stats=(o.stats||[]).map(([ic,lab,val,cls])=>`<span class="tc-st ${cls||''}"><i>${ic}</i><small>${lab}</small><b>${val}</b></span>`).join('');
 return`<div class="tc" style="--ac:${o.ac||'#e8b86a'}"><div class="tc-h"><span class="tc-ic">${o.ic}</span><div class="tc-t"><b>${o.title}</b>${o.tag?`<em class="tc-tag ${o.tagCls||''}">${o.tag}</em>`:''}</div></div>
  ${o.desc?`<p class="tc-d">${o.desc}</p>`:''}${stats?`<div class="tc-s">${stats}</div>`:''}${o.foot?`<div class="tc-f">${o.foot}</div>`:''}</div>`;
}
const SPEED_TAG=v=>v>=1.3?'fast':v<=.6?'slow':v<1?'steady':'normal';
const ENEMY_IC={rock:'🌑',crystal:'💎',ghost:'👻',boss:'👑'},ENEMY_AC={rock:'#b0a090',crystal:'#c9a6ff',ghost:'#7dffbd',boss:'#ff8a5a'},ENEMY_WAVE={rock:1,crystal:4,ghost:4,boss:8};
function renderSide(){
 // coleção de personagens (grid 2×2): bloqueados mostram a condição no tooltip
 $('chars').innerHTML=CHARS.map((c,i)=>{const lock=isLocked(c);
  const sp=SPELLS.find(s=>s.id===c.spell)||SPELLS[0];
  const tip=tipCard(lock?{ic:'🔒',ac:'#8f9ac4',title:charName(c),tag:t('tip.locked'),tagCls:'off',desc:t('charUi.unlockReq',{w:c.unlock,l:c.lvl}),
     stats:[['⭐',t('tip.level'),t('ui.lvl')+' '+c.lvl],['🌊',t('tip.waves'),c.unlock]]}
   :{ic:charIcHTML(c),ac:c.color,title:charName(c),tag:t('characters.'+c.id+'.trait'),desc:t('characters.'+c.id+'.desc'),
     stats:[['❤️',t('tip.lives'),c.lives],[sp.ic,t('tip.spell'),t('spells.'+sp.id+'.name')],['🏅',t('mast.name'),t('ui.lvl')+' '+Meta.mastLv(c.id)]],
     foot:i===selected?'✅ '+t('tip.selected'):'👆 '+t('tip.clickPick')});
  // 🧭 card = botão (teclado/leitor de tela); em uso marcado; vidas + magia visíveis; bloqueado mostra a condição direto no card
  const ml=lock?0:Meta.mastLv(c.id),sel=i===selected;
  return`<button class="char ${sel?'sel':''} ${lock?'locked':''}" onclick="selectChar(${i})" data-tip="${esc(tip)}" aria-pressed="${sel}"${lock?' aria-disabled="true"':''}>
  ${sel?`<em class="chuse">✓ ${t('side.inUse')}</em>`:''}${ml>=2?`<i class="mlv" title="${esc(t('mast.name'))}">🏅${ml}</i>`:''}
  <div class="avwrap"><canvas width="140" height="140" data-i="${i}"></canvas>${lock?'<span class="lockic">🔒</span>':''}</div>
  <b>${charName(c)}</b>${lock?`<small class="chreq">${t('side.unlockShort',{w:c.unlock,l:c.lvl})}</small>`:`<small>${t('characters.'+c.id+'.trait')}</small><span class="chmeta">❤${c.lives} · ${sp.ic} ${t('spells.'+sp.id+'.name')}</span>`}</button>`}).join('');
 avatarCvs=[...document.querySelectorAll('#chars canvas')].map(c=>({c:c.getContext('2d'),i:+c.dataset.i}));
 // ✨ magias em 2 blocos: a do mago selecionado (com descrição) + os feitiços de emergência (tecla e custo) — sem ícones apagados de outros magos
 const me=CHARS[selected],ms=SPELLS.find(s=>s.id===me.spell)||SPELLS[0];
 const spCard=(s,extra,cls)=>`<div class="spcard ${cls||''}" style="--c:${s.c}" data-tip="${esc(tipCard({ic:s.ic,ac:s.c,title:t('spells.'+s.id+'.name'),tag:t('spells.'+s.id+'.sub'),desc:t('spells.'+s.id+'.tooltip')}))}" tabindex="0"><span class="spic" aria-hidden="true">${s.ic}</span><div><b>${t('spells.'+s.id+'.name')}</b>${extra}</div></div>`;
 const emg=SPELLS.filter(s=>s.shared),keyOf=id=>id==='congelar'?['arc.keySpace',ARC.FREEZE_COST]:['arc.keyEnter',ARC.BLAST_COST];
 $('spells').innerHTML=`<small class="sphead">${t('side.mySpell',{c:me.emoji+' '+charName(me)})}</small>${spCard(ms,`<small>${t('spells.'+ms.id+'.tooltip')}</small>`,'mine')}
  <small class="sphead">${t('side.emergency')}</small><div class="spemg">${emg.map(s=>{const[k,c]=keyOf(s.id);return spCard(s,`<small><kbd>${t(k)}</kbd> · ${c} ${t('village.mana').toLowerCase()}</small>`)}).join('')}</div>`;
 $('bestScore').textContent=fmtN(best.score);$('bestWave').textContent=best.wave;$('bestWpm').textContent=best.wpm;
 drawSide(true);
}
function renderEnemyList(){
 const B=BIOMES[currentBiome];
 // bestiário: só a arte e o nome; detalhes ficam no tooltip
 $('enemyList').innerHTML=Object.keys(ENEMY).map(k=>{const E=ENEMY[k],spd=SPEED_TAG(E.spd);
  const tip=tipCard({ic:ENEMY_IC[k],ac:ENEMY_AC[k],title:t('enemies.'+B.art[k]),tag:t('enemyTypes.'+k),tagCls:k==='boss'?'hot':'',desc:t('tip.enemy.'+k),
   stats:[['💥',t('tip.hits'),E.hp+(k==='boss'?'+':'')],['💨',t('tip.speed'),t('tip.speeds.'+spd)],['🌊',t('tip.from'),t('hud.wave')+' '+ENEMY_WAVE[k]]],
   foot:'🎯 +'+E.pts+' '+t('hud.points').toLowerCase()});
  return`<div class="beast${k==='boss'?' boss':''}" data-tip="${esc(tip)}" tabindex="0"><canvas width="152" height="152" data-k="${k}"></canvas><b>${t('enemies.'+B.art[k])}</b><small>${t('enemyTypes.'+k)}</small></div>`}).join('')
  +`<p class="bbiome">${t('side.biomeNow',{b:t('biomes.'+B.id+'.name')})}</p>`; // 🌍 de qual bioma são estes inimigos
 enemyCvs=[...document.querySelectorAll('#enemyList canvas')].map(c=>{const k=c.dataset.k;return{c:c.getContext('2d'),art:B.art[k],r:k==='boss'?44:34,y:k==='boss'?86:78}});
 drawSide(true);
}
// ================== 👕 COLEÇÃO (#collection-modal): preview ao vivo do mago + bônus passivo + inventário filtrável ==================
let colFilter='all';
const TIER_ORD={legendary:0,epic:1,rare:2,common:3},COL_FILTERS=[['all','✨'],['hat','🎩'],['cape','🧥'],['staff','🔱'],['aura','🌟']];
function tabCollection(){
 const b=Inventory.bonuses(),base=CHARS[selected],ch=Inventory.dressed(base),n=Chests.count();
 const list=COSMETICS.filter(it=>colFilter==='all'||it.cat===colFilter).sort((x,y)=>(Inventory.has(y.id)-Inventory.has(x.id))||TIER_ORD[x.tier]-TIER_ORD[y.tier]);
 return`<div id="collection-modal" class="colm">
  <section class="colprev">
   <div class="colstage g-${ch.glowTier||'none'}" style="--gc:${ch.glowCol}"><canvas width="280" height="280" id="colCv"></canvas></div>
   <b class="colname">${base.emoji} ${charName(base)}</b>
   <div class="colslots">${ITEM_CATS.map(c=>{const it=Inventory.equipped(c);return`<span class="colslot ${it?'t-'+it.tier:''}" title="${esc(t('col.f.'+c))}">${it?it.ic:'＋'}</span>`}).join('')}</div>
   <div class="colbonus"><small>${t('col.bonus')}</small><div><b>+${b.xp}% XP</b><i>|</i><b>+${b.aura}% ${t('aura.name')}</b></div></div>
   <button class="qclaim colopen" ${n?'':'disabled'} onclick="ChestUI.start()">🎁 ${t('col.openChest',{n})}</button>
   ${n>1?`<button class="colopenall" onclick="ChestUI.start(true)">✨ ${t('chest.openAll',{n})}</button>`:''}
   <small class="colcount">${t('col.owned',{n:Inventory.data.owned.length,m:COSMETICS.length})}</small>
  </section>
  <section class="colinv">
   ${colProgress()}
   <div class="colfilters" role="tablist">${COL_FILTERS.map(([id,ic])=>{const all=id==='all'?COSMETICS:COSMETICS.filter(x=>x.cat===id),n=all.filter(x=>Inventory.has(x.id)).length;
    return`<button class="colf ${colFilter===id?'on':''}" role="tab" onclick="setColFilter('${id}')">${ic} ${t('col.f.'+id)} <em>${n}/${all.length}</em></button>`}).join('')}</div>
   <div class="colgrid">${list.map(itemCard).join('')}</div>
  </section></div>`;
}
// 🎁 onde cada tier mais cai: as 2 raridades de baú com maior peso para ele (CHEST_RARITIES[].items) — dica do tooltip
const _tierSrc={};
function tierSource(tier){
 if(_tierSrc[tier])return _tierSrc[tier];
 const top=CHEST_RARITIES.filter(r=>r.items[tier]>0).sort((a,b)=>b.items[tier]*b.chance-a.items[tier]*a.chance).slice(0,2);
 return _tierSrc[tier]=top.map(r=>t('chest.rarity.'+r.id)).join(' · ');
}
// tooltip rico do item (foco/toque): bônus passivo, efeito visual, origem e estado
function itemTip(it,own,eq){
 const T=ITEM_TIERS[it.tier];
 return tipCard({ic:own?it.ic:'?',ac:T.col,title:own?esc(t('items.'+it.id)):'???',tag:T.ic+' '+t('tiers.'+it.tier)+' · '+t('col.f.'+it.cat),
  desc:own?t('col.tip.fx.'+it.tier):t('col.tip.locked'),
  stats:[['⚡','XP','+'+it.xp+'%'],['✨',t('aura.name'),'+'+it.aura+'%'],['🎁',t('col.tip.src'),tierSource(it.tier)]],
  foot:own?(eq?'✓ '+t('col.tip.eqOn'):'👆 '+t('col.tip.eqOff')):'🔒 '+t('col.tip.find')});
}
function itemCard(it){
 const T=ITEM_TIERS[it.tier],own=Inventory.has(it.id),eq=own&&Inventory.isEquipped(it.id),tip=` tabindex="0" data-tip="${esc(itemTip(it,own,eq))}"`;
 if(!own)return`<div class="icard locked t-${it.tier}" style="--tc:${T.col}"${tip}><span class="iic">?</span><b>???</b><small>${T.ic} ${t('tiers.'+it.tier)}</small><em>🎁 ${t('col.fromChest')}</em></div>`;
 return`<div class="icard t-${it.tier} ${eq?'equipd':''}" style="--tc:${T.col}"${tip}>${eq?`<i class="ieqseal" aria-hidden="true">✓</i>`:''}<span class="iic">${it.ic}</span><b>${esc(t('items.'+it.id))}</b><small>${T.ic} ${t('tiers.'+it.tier)}</small><span class="ibon">+${it.xp}% XP${it.aura?' · +'+it.aura+'% '+t('aura.name'):''}</span><button class="ieq ${eq?'on':''}" onclick="equipItem('${it.id}')">${eq?'✓ '+t('col.equipped'):t('col.equip')}</button></div>`;
}
/** 📈 progresso por categoria (completista): possuídos/total de cada tipo + total geral */
function colProgress(){
 const per=ITEM_CATS.map(c=>{const all=COSMETICS.filter(x=>x.cat===c),n=all.filter(x=>Inventory.has(x.id)).length;return{c,n,m:all.length}});
 const N=Inventory.data.owned.length,M=COSMETICS.length;
 return`<div class="colprog"><div class="cpall"><b>${t('col.progress')}</b><span>${N}/${M} · ${Math.round(N/M*100)}%</span><div class="cpbar"><i style="width:${N/M*100}%"></i></div></div>
  ${per.map(p=>`<div class="cpcat ${p.n===p.m?'full':''}"><small>${t('col.f.'+p.c)}</small><b>${p.n}/${p.m}${p.n===p.m?' ★':''}</b><div class="cpbar"><i style="width:${p.n/p.m*100}%"></i></div></div>`).join('')}</div>`;
}
function setColFilter(f){colFilter=f;renderModal();snd(660,.05,'triangle',.03)}
function equipItem(id){Inventory.toggle(id);const sc=$('tabBody').scrollTop;renderModal();$('tabBody').scrollTop=sc;renderSide();snd(Inventory.isEquipped(id)?988:520,.08,'triangle',.04)}
// preview ao vivo: 15 Hz (chamado pelo drawSide) — só um canvas pequeno, o canvas do jogo fica congelado por trás
// 🖼️ prévia com o SPRITE oficial (o mesmo do menu e dos cards); a cor do brilho/gema acompanha o cajado/aura equipados (Inventory.dressed)
function drawColPreview(tm){const c=$('colCv');if(!c)return;const x=c.getContext('2d');x.setTransform(2,0,0,2,0,0);drawCharPortrait(x,Inventory.dressed(CHARS[selected]),tm,false,false)}
// 🏰 Personalizar Torre (modal): automática (segue o bioma) ou uma das 5 skins desbloqueadas por nível
function tabTowers(){
 const cur=profile.towerSkin,tile=(i,inner,lbl,lock)=>`<button class="twtile ${cur===i?'sel':''} ${lock?'locked':''}" ${lock?'disabled':''} onclick="pickTower(${i})">${inner}<b>${lbl}</b>${lock?`<em>🔒 ${t('ui.lvl')} ${lock}</em>`:''}</button>`;
 return`<p class="msub center">${t('towers.hint')}</p><div class="twgrid">
  ${tile(-1,'<span class="twauto">🌍</span>',t('towers.auto'),0)}
  ${TOWER_SKINS.map((s,i)=>tile(i,`<canvas width="108" height="176" data-tw="${s.ti}"></canvas>`,t('towers.n',{n:i+1}),profile.level<s.l?s.l:0)).join('')}</div>`;
}
function pickTower(i){const s=TOWER_SKINS[i];if(s&&profile.level<s.l)return;profile.towerSkin=i;saveProfile();renderModal();snd(880,.06,'triangle',.04)}
let sideFrame=0;
function drawSide(){
 if(modalOpen&&modal.kind==='collection'&&!document.hidden)drawColPreview(performance.now()/1000);
 if(document.hidden||(DeviceManager.isMobile?openSheetSide!=='right':!PANELS.right))return; // mobile: só anima com a gaveta aberta
 const tm=performance.now()/1000;sideFrame++;
 for(let k=0;k<avatarCvs.length;k++){const a=avatarCvs[k],lk=isLocked(CHARS[a.i]),ch=a.i===selected&&!lk?Inventory.dressed(CHARS[a.i]):CHARS[a.i];if(lk){if(a.drawn)continue;a.drawn=true}drawCharPortrait(a.c,ch,tm,lk)} // bloqueado = estático · 🖼️ sprite oficial quando houver
 if(sideFrame&1)return;
 for(let k=0;k<enemyCvs.length;k++){const p=enemyCvs[k];p.c.clearRect(0,0,152,152);drawEnemyArt(p.c,p.art,76,p.y,p.r,0,tm)}
}

// ================== TOOLTIP DE VIDRO (global, posicionado por JS para nunca ser cortado pelos painéis) ==================
let tipEl=null,tipFor=null;
function showTip(el){
 const html=el.dataset.tip;if(!html)return;tipEl=tipEl||$('gtip');tipFor=el;
 tipEl.innerHTML=html;tipEl.classList.add('on');
 const r=el.getBoundingClientRect(),tw=tipEl.offsetWidth,th=tipEl.offsetHeight;
 let x=r.left+r.width/2-tw/2,y=r.top-th-10,below=false;
 if(y<8){y=r.bottom+10;below=true}
 x=Math.max(8,Math.min(innerWidth-tw-8,x));
 tipEl.style.transform=`translate3d(${x|0}px,${y|0}px,0)`;tipEl.classList.toggle('below',below);
}
function hideTip(){if(tipEl){tipEl.classList.remove('on');tipFor=null}}
// 📱 toque/caneta: tocar num [data-tip] abre o tooltip (fecha sozinho em 3,5 s ou no próximo toque fora).
//  O navegador ainda dispara mousedown/mouseover "de compatibilidade" logo depois do toque → ignorados por 700 ms.
let tipTouchAt=0,tipTimer=0;
document.addEventListener('pointerdown',e=>{
 if(e.pointerType==='mouse')return;tipTouchAt=performance.now();
 const el=e.target.closest('[data-tip]');clearTimeout(tipTimer);
 if(el){showTip(el);tipTimer=setTimeout(hideTip,3500)}else hideTip();
},{passive:true,capture:true});
const tipCompat=()=>performance.now()-tipTouchAt<700;
document.addEventListener('mouseover',e=>{if(tipCompat())return;const el=e.target.closest('[data-tip]');if(el&&el!==tipFor)showTip(el);else if(!el&&tipFor)hideTip()});
document.addEventListener('mousedown',()=>{if(!tipCompat())hideTip()});document.addEventListener('scroll',hideTip,true);
// ♿ teclado: Tab num elemento com tooltip também mostra (cartas de bênção, 😈/★ do Dicionário)
document.addEventListener('focusin',e=>{const el=e.target.closest&&e.target.closest('[data-tip]');if(el&&e.target.matches(':focus-visible'))showTip(el)});
document.addEventListener('focusout',e=>{if(tipFor&&tipFor.contains(e.target))hideTip()});

// ================== MODO FOCO: esconder/mostrar painéis laterais (preferência salva) ==================
const PANELS=Object.assign({left:true,right:true},store.get('panels',{}));
function applyPanels(){
 const app=$('app'),m=DeviceManager.isMobile; // no mobile os painéis viram gavetas: o Modo Foco não se aplica
 app.classList.toggle('hide-left',!m&&!PANELS.left);app.classList.toggle('hide-right',!m&&!PANELS.right);
 $('reopenLeft').classList.toggle('on',!m&&!PANELS.left);$('reopenRight').classList.toggle('on',!m&&!PANELS.right);
 if(!m)closeSheets();
}
// ---------- MOBILE: painéis laterais como gavetas inferiores (bottom sheets) ----------
let openSheetSide=null;
function openSheet(side){
 if(openSheetSide===side)return closeSheets();
 if(inOnlineDuel())return;
 closeSheets();openSheetSide=side;if(state==='play')pause();
 $(side==='left'?'leftPanel':'rightPanel').classList.add('sheet-open');$('sheetbg').classList.add('on');
 if(side==='right'){avatarCvs.forEach(a=>a.drawn=false);drawSide()}
 snd(660,.05,'triangle',.03);
}
function closeSheets(){openSheetSide=null;['leftPanel','rightPanel'].forEach(id=>$(id).classList.remove('sheet-open'));$('sheetbg').classList.remove('on')}
function togglePanel(side){PANELS[side]=!PANELS[side];store.set('panels',PANELS);hideTip();applyPanels();snd(PANELS[side]?660:440,.06,'triangle',.03)}
