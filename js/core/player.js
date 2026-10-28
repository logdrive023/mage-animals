// Mage Animals — Jogador: XP, níveis, conquistas, missões diárias/semanais, login, ranking, duelos e persistência (localStorage).
'use strict';

let best=store.get('best',{score:0,wave:0,wpm:0});
const xpNeed=l=>l*250;

const DEF_PROFILE={nickname:'',level:1,xp:0,totalXp:0,totalKills:0,totalWords:0,games:0,
 totalTime:0,totalCorrect:0,totalErrors:0,totalBosses:0,bestAcc:0,claimed:[],
 duels:{wins:0,losses:0},towerSkin:-1,aura:0,streak:0,bestStreak:0,duelHistory:[],
 quests:{day:'',d:{},dClaimed:[],week:'',w:{},wClaimed:[],wDone:0,wChest:false}, // contadores criados por questsRefresh (Q_STATS)
 login:{last:'',streak:0,claimed:''},
 unlockedTitles:['Aprendiz de Magia'],activeTitle:'Aprendiz de Magia',border:'bronze',spellColor:'padrao',avatar:'🧙'};

let profile=StorageManager.loadProfile(DEF_PROFILE); // perfil (nível, XP, Aura = moedas, baús…) via js/systems/storage.js
for(const k of['duels','quests','login'])profile[k]=Object.assign({},DEF_PROFILE[k],profile[k]||{});
profile.quests.d=Object.assign({},DEF_PROFILE.quests.d,profile.quests.d);profile.quests.w=Object.assign({},DEF_PROFILE.quests.w,profile.quests.w);
profile.claimed=profile.claimed||[];profile.duelHistory=Array.isArray(profile.duelHistory)?profile.duelHistory.slice(0,10):[];

let currentBiome=Math.min(BIOMES.length-1,Math.max(0,store.get('biome',0)|0));
function setBiome(i){currentBiome=i;store.set('biome',i);renderBg(BIOMES[i].themes[0]);prewarmBiome(i)}
buildPools((LANGS.find(x=>x.id===LANG)||LANGS[0]).words);

// ---------- nomes exibidos (sempre pelo i18n; o save guarda só ids/nomes canônicos) ----------
const charName=c=>t('characters.'+c.id+'.name');
const titleName=n=>{const ti=TITLES.find(x=>x.n===n);return ti?t('titles.'+ti.id):n};
const nickOr=()=>profile.nickname||t('ui.defaultNick');

const isUnlocked=o=>o.ach?profile.claimed.includes(o.ach):o.l<=profile.level;
const unlockText=o=>o.ach?t('charUi.conquest'):'🔒 '+t('ui.lvl')+' '+o.l;
function grant(id){if(!profile.claimed.includes(id))profile.claimed.push(id)}
function saveProfile(){profile.unlockedTitles=TITLES.filter(isUnlocked).map(x=>x.n);StorageManager.saveProfile(profile)}
const isLocked=c=>!(best.wave>=c.unlock||profile.level>=c.lvl);

function rewardsAt(l){
 return['🎁 +1 '+t('chest.name'),...TITLES.filter(x=>x.l===l).map(x=>t('rewards.title',{n:t('titles.'+x.id)})),...BORDERS.filter(x=>x.l===l).map(x=>t('rewards.border',{n:t('borders.'+x.id)})),
  ...SCOLORS.filter(x=>x.l===l).map(x=>t('rewards.color',{n:t('colors.'+x.id)})),...AVATARS.filter(x=>x.l===l).map(x=>t('rewards.avatar',{n:x.e}))];
}
// cor do feitiço (arco-íris quantizado em 24 tons para o cache de sprites não crescer sem limite)
// chamada a cada passo de física: sem .find() (closure) nem strings novas — cor resolvida em cache, arco-íris em 24 tons pré-calculados
let _scId=null,_scObj=null;const RAINBOW24=Array.from({length:24},(_,i)=>hslHex(i*15));
function spellColor(ch){
 if(profile.spellColor!==_scId){_scId=profile.spellColor;_scObj=null;for(let i=0;i<SCOLORS.length;i++)if(SCOLORS[i].id===_scId){_scObj=SCOLORS[i];break}}
 const s=_scObj;if(!s||!s.c||!isUnlocked(s))return ch.color;return s.c==='rainbow'?RAINBOW24[((performance.now()/1000*90)%360/15)|0]:s.c;
}

function addXp(n){
 profile.xp+=n;profile.totalXp+=n;const ups=[];
 while(profile.xp>=xpNeed(profile.level)){profile.xp-=xpNeed(profile.level);profile.level++;ups.push(profile.level);profile.chests=(profile.chests|0)+1} // +1 baú por nível
 return ups;
}
function applyReward(r){ // recompensa genérica: xp, aura, título, borda, cor, avatar
 const ups=r.xp?addXp(r.xp):[];
 if(r.aura)profile.aura=(profile.aura||0)+r.aura;
 if(r.chests)profile.chests=(profile.chests|0)+r.chests;
 if(r.title){const ti=TITLES.find(x=>x.n===r.title);if(ti&&ti.ach)grant(ti.ach);profile.activeTitle=r.title}
 if(r.border){const b=BORDERS.find(x=>x.id===r.border);if(b&&b.ach)grant(b.ach);profile.border=r.border}
 if(r.color){const s=SCOLORS.find(x=>x.id===r.color);if(s&&s.ach)grant(s.ach);profile.spellColor=r.color}
 if(r.avatar){const a=AVATARS.find(x=>x.e===r.avatar);if(a&&a.ach)grant(a.ach);profile.avatar=r.avatar}
 return ups;
}
function rewardText(r){
 const p=[];if(r.xp)p.push('+'+r.xp+' '+t('ui.xp'));if(r.aura)p.push('+'+r.aura+' '+t('aura.name'));if(r.chests)p.push('+'+r.chests+' '+t('chest.name'));if(r.title)p.push(t('rewards.label.title')+' "'+titleName(r.title)+'"');
 if(r.border)p.push(t('rewards.label.border')+' "'+t('borders.'+r.border)+'"');
 if(r.color)p.push(t('rewards.label.color')+' "'+t('colors.'+r.color)+'"');
 if(r.avatar)p.push(t('rewards.label.avatar')+' '+r.avatar);return p.join(' + ');
}

// ---------- estatísticas ----------
const avgAcc=()=>{const s=profile.totalCorrect+profile.totalErrors;return s?Math.round(profile.totalCorrect/s*1000)/10:0};
function fmtTime(s){s=Math.floor(s);const h=Math.floor(s/3600),m=Math.floor(s%3600/60);return h?`${h}h ${String(m).padStart(2,'0')}m`:m?`${m}m ${String(s%60).padStart(2,'0')}s`:`${s}s`}
// stats calculados (vocabulário e online) — os demais vêm direto do perfil
const STAT_FN={
 maxWpm:()=>best.wpm,maxWave:()=>best.wave,
 dictWords:()=>WORD_LANGS.reduce((s,l)=>s+WordHistory.count(l),0),          // palavras diferentes já escritas (pt+en+es)
 dictLangs:()=>WORD_LANGS.filter(l=>WordHistory.count(l)>=25).length,       // idiomas com 25+ palavras
 nemDom:()=>typeof Meta==='undefined'?0:WORD_LANGS.reduce((s,l)=>s+Meta.nemCount(l).d,0), // nêmesis dominadas
 onlineWins:()=>(profile.online&&profile.online.wins)|0
};
function statValue(stat){return STAT_FN[stat]?STAT_FN[stat]():(profile[stat]||0)}

// ---------- conquistas permanentes ----------
function achProgress(a){const val=statValue(a.stat),done=val>=a.goal;return{val,goal:a.goal,pct:Math.min(100,val/a.goal*100),done,claimed:profile.claimed.includes(a.id)}}
const claimableAch=()=>ACHIEVEMENTS.filter(a=>{const p=achProgress(a);return p.done&&!p.claimed}).length;
function claimAchievement(id){
 const a=ACHIEVEMENTS.find(x=>x.id===id),p=a&&achProgress(a);
 if(!p||!p.done||p.claimed)return null;
 grant(a.id);const ups=applyReward(a.reward);saveProfile();return{a,ups};
}

// ---------- missões diárias / semanais ----------
const zeroStats=()=>{const o={};for(const k of Q_STATS)o[k]=0;return o};
function questsRefresh(){
 const q=profile.quests,d=dayKey(),w=weekKey();
 if(q.day!==d){q.day=d;q.d=zeroStats();q.dClaimed=[]}
 if(q.week!==w){q.week=w;q.w=zeroStats();q.wClaimed=[];q.wDone=0;q.wChest=false}
 for(const k of Q_STATS){if(!(k in q.d))q.d[k]=0;if(!(k in q.w))q.w[k]=0} // saves antigos ganham os novos contadores
 if(typeof q.wDone!=='number')q.wDone=0;
}
function questAdd(stat,n){if(!n)return;questsRefresh();const q=profile.quests;if(stat in q.d)q.d[stat]+=n;if(stat in q.w)q.w[stat]+=n}
function questMax(stat,v){questsRefresh();const q=profile.quests;if(stat in q.d)q.d[stat]=Math.max(q.d[stat],v);if(stat in q.w)q.w[stat]=Math.max(q.w[stat],v)}
// 🔄 seleção do dia/semana: a fixa + sorteio com semente na data (todo mundo vê as mesmas no mesmo dia; muda à meia-noite / na segunda)
const _qList={};
function questList(kind){
 questsRefresh();const q=profile.quests,key=kind+'|'+(kind==='daily'?q.day:q.week);
 if(_qList[kind]&&_qList[kind].key===key)return _qList[kind].list;
 const pool=QUESTS[kind],fixed=pool.filter(x=>x.fixed),rest=pool.filter(x=>!x.fixed),R=Meta.rng(Meta.hash(key));
 for(let i=rest.length-1;i>0;i--){const j=(R()*(i+1))|0;const tmp=rest[i];rest[i]=rest[j];rest[j]=tmp}
 const list=fixed.concat(rest.slice(0,(kind==='daily'?4:5)-fixed.length));
 for(const id of(kind==='daily'?q.dClaimed:q.wClaimed)){const x=pool.find(p=>p.id===id);if(x&&!list.includes(x))list.push(x)} // resgatadas antes da rotação continuam visíveis
 _qList[kind]={key,list};return list;
}
function questProgress(kind,qd){
 const q=profile.quests,src=kind==='daily'?q.d:q.w,done=(src[qd.stat]||0)>=qd.goal,claimed=(kind==='daily'?q.dClaimed:q.wClaimed).includes(qd.id);
 return{val:src[qd.stat]||0,goal:qd.goal,pct:Math.min(100,(src[qd.stat]||0)/qd.goal*100),done,claimed};
}
function claimQuest(kind,id){
 questsRefresh();const qd=questList(kind).find(x=>x.id===id),p=qd&&questProgress(kind,qd);
 if(!p||!p.done||p.claimed)return null;
 (kind==='daily'?profile.quests.dClaimed:profile.quests.wClaimed).push(id);
 profile.quests.wDone++; // cada missão resgatada avança o passe semanal
 const ups=applyReward(qd.reward);saveProfile();return{qd,ups};
}
// ---------- passe semanal: Baú Semanal de Aura ----------
function chestProgress(){questsRefresh();const q=profile.quests,val=Math.min(WEEKLY_CHEST.goal,q.wDone);return{val,goal:WEEKLY_CHEST.goal,pct:val/WEEKLY_CHEST.goal*100,ready:val>=WEEKLY_CHEST.goal&&!q.wChest,claimed:!!q.wChest}}
function claimChest(){const p=chestProgress();if(!p.ready)return null;profile.quests.wChest=true;const ups=applyReward(WEEKLY_CHEST.reward);saveProfile();return{r:WEEKLY_CHEST.reward,ups}}
const claimableQuests=()=>{questsRefresh();let n=0;for(const k of['daily','weekly'])for(const qd of questList(k)){const p=questProgress(k,qd);if(p.done&&!p.claimed)n++}return n+(chestProgress().ready?1:0)};
// segundos até a virada (meia-noite / segunda-feira) — base do contador regressivo do modal
function secsToReset(kind){const now=new Date(),end=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1);if(kind==='weekly')end.setDate(end.getDate()+((8-end.getDay())%7));return Math.max(0,Math.floor((end-now)/1000))}
function timeToReset(kind){return fmtTime(secsToReset(kind))}
const fmtClock=s=>{const d=Math.floor(s/86400),h=Math.floor(s%86400/3600),m=Math.floor(s%3600/60),x=s%60,p=n=>String(n).padStart(2,'0');return(d?d+'d ':'')+p(h)+'h '+p(m)+'m '+p(x)+'s'};

// ---------- login diário (calendário de 7 dias) ----------
// a ofensiva só avança se o dia anterior foi COLETADO (só abrir o jogo não conta); roda também na virada da meia-noite
function loginCheck(){
 const L=profile.login,today=dayKey(),y=new Date();y.setDate(y.getDate()-1);
 if(L.last!==today){L.streak=L.claimed===dayKey(y)?(L.streak%7)+1:1;L.last=today;saveProfile()}
}
const canClaimLogin=()=>{loginCheck();return profile.login.claimed!==dayKey()};
function claimLogin(){if(!canClaimLogin())return null;const i=(profile.login.streak-1)%7,r=LOGIN_REWARDS[i];profile.login.claimed=dayKey();const ups=applyReward(r);saveProfile();return{r,ups,day:i+1}}

// ---------- ranking (mock offline + jogador) ----------
// 🏆 segmentado por modo × período. Rivais: a lista mock escalada pelo modo (runas e letras pontuam diferente) e pelo
// período (o diário tem números menores), com variação SEMEADA pelo identificador do período → muda a cada dia/semana/mês,
// mas é a mesma ao reabrir. Você entra com o melhor resultado guardado em mage_leaderboard_{modo}_{período}.
const LB_MODE_K={words:{s:1,w:1},letters:{s:.8,w:.85},runes:{s:.55,w:.35}},LB_PERIOD_K={daily:.32,weekly:.55,monthly:.78,all:1};
function seeded(str){let h=1779033703^str.length;for(let i=0;i<str.length;i++){h=Math.imul(h^str.charCodeAt(i),3432918353);h=h<<13|h>>>19}
 return()=>{h=Math.imul(h^h>>>16,2246822507);h=Math.imul(h^h>>>13,3266489909);return((h^=h>>>16)>>>0)/4294967296}}
function rankingList(by,mode,period){
 mode=mode||'words';period=period||'all';
 const b=StorageManager.loadBoard(mode,period),mine=b.me||(mode==='words'&&period==='all'?{score:best.score,wpm:best.wpm,wave:best.wave}:{score:0,wpm:0,wave:0});
 const me={nick:profile.nickname||t('duel.you'),ic:profile.avatar,score:mine.score,wpm:mine.wpm,wave:mine.wave,aura:profile.aura,fl:'⭐',me:true};
 const rnd=seeded(mode+'|'+period+'|'+b.pk),mk=LB_MODE_K[mode]||LB_MODE_K.words,pk=LB_PERIOD_K[period]||1;
 const bots=LEADERBOARD.map(x=>{const j=period==='all'?1:.7+rnd()*.6;return Object.assign({},x,{score:Math.round(x.score*mk.s*pk*j),wpm:Math.max(8,Math.round(x.wpm*mk.w*(period==='all'?1:.85+rnd()*.25))),wave:Math.max(1,Math.round(x.wave*(mode==='runes'?.75:1)*(period==='all'?1:.6+rnd()*.5)))})});
 return[...bots,me].sort((a,c)=>c[by]-a[by]||(c.me?1:-1));
}
const rankOf=(by,mode,period)=>rankingList(by,mode,period).findIndex(x=>x.me)+1;

// ---------- fim de partida (arcade) ----------
// XP = (Pontuação × 0,1) + (Palavras × 5) + (Onda × 50) + 20% se precisão > 95%
function finishMatch(m){
 const lbMode=typeof GAME_STYLE!=='undefined'?GAME_STYLE:'words';
 const lockedBefore=CHARS.filter(isLocked),readyBefore=new Set(ACHIEVEMENTS.filter(a=>achProgress(a).done).map(a=>a.id)),rankBefore=rankOf('score',lbMode,'all');
 StorageManager.submitScore(lbMode,{score:m.score,wpm:m.wpm,wave:m.wave}); // ranking: modo jogado × dia/semana/mês/sempre
 const qReadyBefore=claimableQuests();
 const xs=Math.round(m.score*.1),xw=m.words*5,xo=m.wave*50,base=xs+xw+xo,bonus=m.acc>95&&m.words>0?Math.round(base*.2):0,items=Math.round((base+bonus)*Inventory.bonuses().xp/100),vil=Math.round((base+bonus)*Village.bonuses().xp/100),gain=base+bonus+items+vil;
 const before={level:profile.level,xp:profile.xp};
 profile.games++;profile.totalKills+=m.kills;profile.totalWords+=m.words;profile.totalBosses+=m.bosses;
 const mc=typeof G!=='undefined'&&G?G.maxCombo|0:0;profile.bestPeak=Math.max(profile.bestPeak|0,m.peak|0);profile.bestCombo=Math.max(profile.bestCombo|0,mc); // 📊 recordes para as Estatísticas
 questAdd('games',1);questMax('wave',m.wave);questMax('combo',mc);if(m.acc>=95&&m.words>=30)questAdd('accGames',1); // 📋 missões novas
 if(m.song){questAdd('songs',1);questAdd('perfects',m.song.perfect|0)}
 else if(GAME_STYLE==='runes')questAdd('runeGames',1);else if(GAME_STYLE==='letters')questAdd('letterGames',1); // 📋 variedade: jogar nos outros modos
 if(typeof G!=='undefined'&&G&&G.daily)questAdd('dailyRuns',1);
 if(m.aura>0)profile.aura=(profile.aura||0)+m.aura; // ✨ Aura da partida (mini-chefe + Chuva de Cristais, ×2 na Sobrecarga)
 profile.totalTime+=m.time;profile.totalCorrect+=m.correct;profile.totalErrors+=m.errors;
 if(m.words>=50)profile.bestAcc=Math.max(profile.bestAcc,m.acc);
 const record=m.score>best.score,prevBest={score:best.score,wave:best.wave}; // 🎯 o "quase" do fim de jogo compara com a marca ANTERIOR
 const mast=m.ch?Meta.mastAdd(m.ch,m):null; // 🏅 maestria do mago usado
 best={score:Math.max(best.score,m.score),wave:Math.max(best.wave,m.wave),wpm:Math.max(best.wpm,m.wpm)};store.set('best',best);
 const lvUps=addXp(gain);
 const cw=MATCH_CHEST_WAVES.filter(w=>m.wave>=w),chests={waves:cw,level:lvUps.length,n:cw.length+lvUps.length,next:MATCH_CHEST_WAVES.find(w=>m.wave<w)||0};
 profile.chests=(profile.chests|0)+cw.length; // os baús de nível já entraram no addXp
 saveProfile();
 const rankAfter=rankOf('score',lbMode,'all'),newAch=ACHIEVEMENTS.filter(a=>!readyBefore.has(a.id)&&achProgress(a).done&&!profile.claimed.includes(a.id));
 const rewards=[...lvUps.flatMap(rewardsAt).filter(s=>!s.startsWith('🎁')),...lockedBefore.filter(c=>!isLocked(c)).map(c=>t('rewards.newChar',{n:c.emoji+' '+charName(c)})),
  ...newAch.map(a=>t('rewards.achReady',{n:t('achievements.'+a.id+'.name')}))];
 if(rankAfter<rankBefore)rewards.push(t('ranking.up',{n:rankAfter}));
 if(mast&&mast.B.lv>mast.A.lv){const c=CHARS.find(x=>x.id===mast.id);rewards.push(t('mast.up',{c:c.emoji+' '+charName(c),l:mast.B.lv}));Meta.perksUpTo(mast.A.lv,mast.B.lv).forEach(p=>rewards.push('🏅 '+p))}
 if(claimableQuests()>qReadyBefore)rewards.push(t('rewards.questReady',{n:t('nav.missions')}));
 const fast=[...m.wordLog].sort((a,b)=>b.wpm-a.wpm).slice(0,5);
 return{...m,xp:{xs,xw,xo,bonus,items,vil,gain},before,lvUps,rewards,record,fast,maxW:fast.length?fast[0].wpm:0,chests,prevBest,mast};
}
// ---------- fim de duelo ----------
function finishDuel(m){
 const L=DUEL_LEVELS[m.li],gain=Math.round((m.win?L.xp:30)*(1+Inventory.bonuses().xp/100)),before={level:profile.level,xp:profile.xp};
 profile.totalWords+=m.words;profile.totalTime+=m.time;profile.totalCorrect+=m.correct;profile.totalErrors+=m.errors;
 if(m.win){profile.duels.wins++;questAdd('duelWins',1);if(L.id==='arquimago')grant('duel_arquimago')}else profile.duels.losses++;
 // Aura: prestígio dos duelos (nunca negativa). Streak = vitórias seguidas.
 const auraBefore=profile.aura,rankBefore=rankOf('aura');
 profile.aura=Math.max(0,profile.aura+(m.win?Math.round(L.aura[0]*(1+Inventory.bonuses().aura/100)):L.aura[1]));const aura=profile.aura-auraBefore;
 profile.streak=m.win?profile.streak+1:0;profile.bestStreak=Math.max(profile.bestStreak,profile.streak);
 profile.duelHistory.unshift({win:!!m.win,li:m.li,wpm:m.wpm|0,time:Math.round(m.time),aura,xp:gain,at:Date.now()});profile.duelHistory.length=Math.min(10,profile.duelHistory.length);
 best.wpm=Math.max(best.wpm,m.wpm);store.set('best',best);
 const lvUps=addXp(gain);
 const cw=MATCH_CHEST_WAVES.filter(w=>m.wave>=w),chests={waves:cw,level:lvUps.length,n:cw.length+lvUps.length,next:MATCH_CHEST_WAVES.find(w=>m.wave<w)||0};
 profile.chests=(profile.chests|0)+cw.length; // os baús de nível já entraram no addXp
 saveProfile();
 const rewards=[...lvUps.flatMap(rewardsAt)];
 if(m.win&&L.id==='arquimago')rewards.push(t('rewards.title',{n:t('titles.duelchamp')}));
 const rankAfter=rankOf('aura');if(rankAfter<rankBefore)rewards.push(t('ranking.upAura',{n:rankAfter}));
 return{...m,L,gain,aura,auraBefore,before,lvUps,rewards};
}

let selected=store.get('char',0); if(!CHARS[selected]||isLocked(CHARS[selected])) selected=0;
