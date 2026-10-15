// Mage Animals — js/systems/pvp.js · Batalha online em tempo real (usa o motor do Duelo PVC em duel.js).
// Justiça e sincronia:
//  · a MESMA semente gera a mesma sequência de palavras/letras/runas nos dois aparelhos (lista montada do dicionário
//    do idioma do anfitrião, sem acentos — igual em celular e PC);
//  · cada jogador é DONO da própria vida: quem acerta manda atk{d}; quem recebe aplica, confirma com hp{v} e, ao zerar,
//    avisa ko → sem divergência de placar entre os dois lados.
'use strict';

function mulberry32(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
// lista determinística do idioma (sem acento, 3–9 letras, sem duplicatas, na ordem do dicionário)
function duelWordList(lang){
 const seen=new Set(),out=[];
 ((WORD_BANK[lang]||WORD_BANK.pt)+' '+(WORD_EXTRA[lang]||'')).split(/\s+/).forEach(w=>{const p=norm(w);if(/^[a-z]{3,9}$/.test(p)&&!seen.has(p)){seen.add(p);out.push(p)}});
 return{s:out.filter(w=>w.length<=4),m:out.filter(w=>w.length>=5&&w.length<=7),l:out.filter(w=>w.length>=8)};
}
const PVP_RUNES=()=>RUNE_SHAPES.filter(s=>['lines','angles','curves','closed'].includes(s.fam));
let pvpSaved=null;

function startOnlineDuel(cfg){
 if(modalOpen)closeModal();
 const mode=['words','letters','runes'].includes(cfg.mode)?cfg.mode:'words',R=Net.remote||{},base=CHARS.find(c=>c.id===R.ch)||CHARS[0];
 // estilo de entrada só durante o duelo (o salvo do jogador volta no fim)
 pvpSaved={style:GAME_STYLE,input:Input.mode};
 GAME_STYLE=mode==='words'?'words':mode;if(DeviceManager.isMobile&&mode!=='runes')Input.mode=mode==='letters'?'draw':'keys';Input.sync();
 G=freshState('duel');G.runes=mode==='runes';
 G.duel={online:true,mode,li:-1,rng:mulberry32(cfg.seed|0),list:mode==='words'?duelWordList(cfg.lang||LANG):null,n:0,
  L:{id:'online',color:R.color||base.color,wpm:0},rname:R.nick||'?',rav:R.av||'',rwpm:0,
  max:DUEL_HP,php:DUEL_HP,bhp:DUEL_HP,pShow:DUEL_HP,bShow:DUEL_HP,phit:0,bhit:0,queue:[],cd:3.4,koWait:0,
  botCh:Object.assign({},base,{robe:R.robe||base.robe,robeDark:R.robeDark||base.robeDark,color:R.color||base.color}),bot:{word:'',nw:'',typed:0,acc:0,delay:0}};
 G.duel.queue.push(pvpWord(),pvpWord(),pvpWord());
 G.target={word:'',nw:'',typed:0,dw:0,startT:null};
 G.banner=0;MUS.heat=0;MUS.slow=0;botDrawT=-1;
 renderBg(BIOMES[currentBiome].themes[0]);
 nextPlayerWord();
 G.duel.bot.word=G.duel.bot.nw=G.target.word; // o rival começa na mesma palavra
 state='play';hideOverlay();physAcc=0;syncChrome();fitMenuMobile();updateUI(true);
 snd(220,.5,'sawtooth',.05,440);
}
// próxima palavra/letra/runa da sequência compartilhada
function pvpWord(){
 const d=G.duel,r=d.rng;d.n++;
 if(d.mode==='letters')return LETTERS[(r()*26)|0];
 if(d.mode==='runes'){const S=PVP_RUNES(),a=S[(r()*S.length)|0].code;if(d.n>8&&r()<.25){const b=S[(r()*S.length)|0].code;return a+b}return a}
 const L=d.list,x=r(),tier=d.n<6?(x<.6?'s':'m'):(x<.35?'s':x<.85?'m':'l'),list=L[tier].length?L[tier]:L.m;
 return list[(r()*list.length)|0];
}
function pvpDamage(e){
 const d=G.duel,len=e.nw.length,c=1+Math.min(G.combo,10)*.06;
 return Math.round((d.mode==='letters'?9:d.mode==='runes'?13*len:5+len*1.3)*c);
}
function pvpProg(){const e=G.target;Net.send({t:'prog',w:e.word,ty:e.typed,wpm:calcWpm()})}
// mensagens da batalha (chamado pelo Net)
function pvpData(m){
 const d=G&&G.duel;if(!d||!d.online||state!=='play')return;
 if(m.t==='prog'){d.bot.word=d.bot.nw=String(m.w||'');d.bot.typed=m.ty|0;d.rwpm=m.wpm|0}
 else if(m.t==='atk')pvpHitMe(Math.max(0,Math.min(60,m.d|0)));
 else if(m.t==='hp'){d.bhp=Math.max(0,Math.min(d.max,+m.v||0))}
 else if(m.t==='ko')duelEnd(true);
}
// fui atingido: efeitos do ataque do rival, vida autoritativa daqui
function pvpHitMe(dmg){
 const d=G.duel,by=BOT_POS.y+Math.sin(T*1.5)*4;
 addBeam(BOT_POS.x+30,by-60,TX,TTOP-40,d.L.color,.4,false);
 burst(TX,TTOP-40,'#ff4a6a',22,220);addRing(TX,TTOP-40,8,70,.35,d.L.color);
 d.php=Math.max(0,d.php-dmg);d.phit=.3;G.shake=.35;G.flash=.3;G.flashCol='#ff2a4a';
 floatTxt(TX+rand(100,150)*(Math.random()<.5?-1:1),TTOP-40,'-'+dmg,'#ff5a7a',24);snd(160,.3,'sawtooth',.06,60);
 Net.send({t:'hp',v:d.php});
 if(d.php<=0){Net.send({t:'ko'});duelEnd(false)}
}
function pvpEmote(who,txt){if(!G||!G.duel)return;const by=BOT_POS.y;floatTxt(who==='them'?BOT_POS.x:TX,who==='them'?by-170:TTOP-110,txt,'#ffe9a8',18)}
// o rival caiu da conexão no meio da batalha → vitória por W.O.
function pvpDisconnected(){if((state==='play'||state==='paused')&&G&&G.duel&&G.duel.online){pvpEnd(true,'dc');return true}return false}
function pvpRestore(){if(!pvpSaved)return;GAME_STYLE=pvpSaved.style;Input.mode=pvpSaved.input;pvpSaved=null;Input.sync()}
function pvpEnd(win,reason){
 if(state==='over')return;state='over';
 const d=G.duel,b=Inventory.bonuses(),xp=Math.round((win?200:70)*(1+b.xp/100)),aura=win?Math.round(25*(1+b.aura/100)):0,before={level:profile.level,xp:profile.xp};
 profile.online=profile.online||{wins:0,losses:0};profile.online[win?'wins':'losses']++;
 profile.aura=(profile.aura||0)+aura;profile.totalWords+=G.words;profile.totalTime+=G.time;profile.totalCorrect+=G.correct;profile.totalErrors+=G.errors;
 const ups=addXp(xp);saveProfile();pvpRestore();
 (win?[523,659,784,1046,1318]:[400,300,200,120]).forEach((f,i)=>snd(f,.3,'triangle',.06,0,i*.12));
 renderSide();renderProfile();
 showOnlineResult({win,reason,xp,aura,ups,before,rname:d.rname,rav:d.rav,words:G.words,wpm:calcWpm(),acc:calcAcc(),time:G.time,rec:profile.online});
}
function showOnlineResult(r){
 const conn=!!(Net.conn&&Net.conn.open);
 showOverlay(`<h2 class="${r.win?'':'lose'}">${r.win?'🏆 '+t('duel.victory'):'💀 '+t('duel.defeat')}</h2>
 <p>🌐 ${t('online.vs')} ${r.rav} <b>${esc(r.rname)}</b>${r.reason==='dc'?` · <span class="olbad">${t('online.rivalLeft')}</span>`:''}</p>
 <div class="stats"><div><b>${r.words}</b><span>${t('stats.words')}</span></div><div><b>${r.wpm}</b><span>${t('hud.wpm')}</span></div><div><b>${r.acc}%</b><span>${t('hud.precision')}</span></div><div><b>${r.rec.wins}-${r.rec.losses}</b><span>${t('online.record')}</span></div></div>
 <div class="xpbox">${xpFooter(r.before)}${r.aura?`<div class="row"><span>✨ ${t('aura.name')}</span><b>+${r.aura}</b></div>`:''}</div><div id="lvSlot"></div><div class="rewards" id="rwSlot"></div>
 <div class="row2"><button class="btn" ${conn?'':'disabled'} onclick="Net.backToLobby()">⚔️ ${t('online.rematch')}</button><button class="btn ghost" onclick="Net.leave();quitToMenu()">🏠 ${t('results.menu')}</button></div>`,'over');
 animateXp(r.before,r.xp,r.ups.flatMap(rewardsAt).filter(s=>!s.startsWith('🎁')));
}
