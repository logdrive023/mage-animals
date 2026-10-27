// Mage Animals — js/systems/pvp.js · Batalha online em tempo real (usa o motor do Duelo PVC em duel.js).
// Justiça e sincronia:
//  · a MESMA semente gera a mesma sequência (palavra/letra/runa + especial) nos dois aparelhos (pvpSeq) — sem
//    acentos, igual em celular e PC; o rival só informa o ÍNDICE da palavra, o texto vem da sequência local;
//  · cada jogador é DONO da própria vida: quem acerta manda atk{n,d}; quem recebe VALIDA (ordem, dano máximo possível
//    da palavra n, ritmo de digitação), aplica e confirma com hp{v,k};
//  · o atacante ainda limita a vida informada por um TETO (vida inicial − dano enviado + curas/escudos do rival):
//    mentir a própria vida não adianta;
//  · fim: ao zerar qualquer vida, as entradas travam por PVP.SETTLE s (mensagens em trânsito chegam) e cada lado
//    decide com os mesmos números — um zerado = vitória/derrota, os dois = EMPATE.
// Dinâmica: "⚡ Primeiro!" (quem termina a palavra n antes), palavras especiais (💛 cura · 🛡️ escudo · ❄️ congela ·
// 💥 crítico), morte súbita após 60 s, série melhor de 3 com revanche direta, emotes (1–4), equilíbrio celular × PC.
'use strict';

// RECON: segundos de espera pela volta do rival (o convidado, que é quem reconecta, espera 2 s a mais)
const PVP={FIRST:1.3,SD_T:60,SD_EVERY:10,SD_INC:.1,BAL:1.2,HEAL:15,ICE:1.2,CRIT:2,MAX_CPS:30,SP_FROM:3,SP_P:.2,SETTLE:1,EMO_CD:1.2,RECON:10};
const PVP_SP={gold:{ic:'💛',col:'#ffd24a'},shield:{ic:'🛡️',col:'#7ad0ff'},ice:{ic:'❄️',col:'#aef0ff'},crit:{ic:'💥',col:'#ff7a3a'}},PVP_SPK=Object.keys(PVP_SP);

function mulberry32(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
// lista determinística do idioma (sem acento, 3–9 letras, sem duplicatas, na ordem do dicionário)
function duelWordList(lang){
 const seen=new Set(),out=[];
 ((WORD_BANK[lang]||WORD_BANK.pt)+' '+(WORD_EXTRA[lang]||'')).split(/\s+/).forEach(w=>{const p=norm(w);if(/^[a-z]{3,9}$/.test(p)&&!seen.has(p)){seen.add(p);out.push(p)}});
 return{s:out.filter(w=>w.length<=4),m:out.filter(w=>w.length>=5&&w.length<=7),l:out.filter(w=>w.length>=8)};
}
const PVP_RUNES=()=>RUNE_SHAPES.filter(s=>['lines','angles','curves','closed'].includes(s.fam));
// sequência compartilhada: at(n) → {w, sp} (n começa em 1). Dois geradores (texto e especiais) para um não mexer no outro.
function pvpSeq(seed,mode,lang){
 const r=mulberry32(seed|0),rs=mulberry32((seed^0x5bd1e995)|0),L=mode==='words'?duelWordList(lang):null,S=mode==='runes'?PVP_RUNES():null,out=[];
 const gen=n=>{let w;
  if(mode==='letters')w=LETTERS[(r()*26)|0];
  else if(mode==='runes'){w=S[(r()*S.length)|0].code;if(n>8&&r()<.25)w+=S[(r()*S.length)|0].code}
  else{const x=r(),tier=n<6?(x<.6?'s':'m'):(x<.35?'s':x<.85?'m':'l'),list=L[tier].length?L[tier]:L.m;w=list[(r()*list.length)|0]}
  const q=rs(),k=rs();return{w,sp:n>=PVP.SP_FROM&&q<PVP.SP_P?PVP_SPK[(k*PVP_SPK.length)|0]:''}};
 return{at(n){n=Math.max(1,n|0);while(out.length<n)out.push(gen(out.length+1));return out[n-1]}};
}
// ---------- dano ----------
const pvpBase=(mode,w)=>mode==='letters'?9:mode==='runes'?13*w.length:5+w.length*1.3;
function pvpSdMul(d){return d.ft<PVP.SD_T?1:1+PVP.SD_INC*(1+Math.floor((d.ft-PVP.SD_T)/PVP.SD_EVERY))}
// maior dano possível da palavra n (combo 10, primeiro, crítico, 1 degrau extra de morte súbita pela diferença de relógio)
function pvpCap(d,n,bal){const it=d.seq.at(n);return Math.ceil(pvpBase(d.mode,it.w)*1.6*PVP.FIRST*(it.sp==='crit'?PVP.CRIT:1)*(pvpSdMul(d)+PVP.SD_INC)*bal)+1}

let pvpSaved=null;
function startOnlineDuel(cfg){
 if(modalOpen)closeModal();
 const mode=['words','letters','runes'].includes(cfg.mode)?cfg.mode:'words',R=Net.remote||{},base=CHARS.find(c=>c.id===R.ch)||CHARS[0];
 // estilo de entrada só durante o duelo (o salvo do jogador volta no fim)
 if(!pvpSaved)pvpSaved={style:GAME_STYLE,input:Input.mode};
 GAME_STYLE=mode;if(DeviceManager.isMobile&&mode!=='runes')Input.mode=mode==='letters'?'draw':'keys';Input.sync();
 G=freshState('duel');G.runes=mode==='runes';
 const bal=cfg.bal!==false&&!!DeviceManager.isTouch!==!!R.touch; // equilíbrio só vale quando um está no toque e o outro não
 G.duel={online:true,mode,li:-1,seq:pvpSeq(cfg.seed|0,mode,cfg.lang||LANG),wlang:cfg.lang||LANG,cur:0,qsp:['',''],
  L:{id:'online',color:R.color||base.color,wpm:0},rname:R.nick||'?',rav:R.av||'',rwpm:0,
  max:DUEL_HP,php:DUEL_HP,bhp:DUEL_HP,pShow:DUEL_HP,bShow:DUEL_HP,phit:0,bhit:0,queue:[],cd:3.4,
  ft:0,rDone:0,rCur:1,rChars:0,rAtkN:0,sent:[],hits:[],atkLog:[],recon:0,bRep:DUEL_HP,bAck:0,bCap:DUEL_HP,
  shield:false,rShield:false,frozen:0,rFrozen:0,ending:0,result:'',firsts:0,specials:0,curve:[],curveT:0,best:null,sdOn:false,
  bal,balMe:bal&&DeviceManager.isTouch?PVP.BAL:1,balR:bal&&R.touch?PVP.BAL:1,emoT:0,bub:{me:null,them:null},hidAt:0,away:0,cheat:0,sum:null,
  botCh:Object.assign({},base,{robe:R.robe||base.robe,robeDark:R.robeDark||base.robeDark,color:R.color||base.color}),bot:{word:'',nw:'',typed:0,acc:0,delay:0,sp:''}};
 G.target={word:'',nw:'',typed:0,dw:0,startT:null,sp:''};
 pvpLiveMark(); // 🏳️ marca "luta em andamento": se a página morrer sem aviso, a derrota é registrada na próxima abertura
 G.banner=0;MUS.heat=0;MUS.slow=0;botDrawT=-1;
 renderBg(BIOMES[currentBiome].themes[0]);
 pvpNextWord();
 const b=G.duel.bot,r1=G.duel.seq.at(1);b.word=b.nw=r1.w;b.sp=r1.sp; // o rival começa na mesma palavra
 Net.rematch={me:false,them:false};
 state='play';hideOverlay();physAcc=0;syncChrome();document.body.classList.add('in-online');pvpEmoBar();fitMenuMobile();updateUI(true);
 snd(220,.5,'sawtooth',.05,440);
}
// próxima palavra/letra/runa da sequência compartilhada
function pvpNextWord(){
 const d=G.duel,e=G.target,it=d.seq.at(++d.cur);
 e.word=it.w;e.nw=d.mode==='runes'?it.w:norm(it.w);e.sp=it.sp;e.typed=0;e.startT=null;
 const a=d.seq.at(d.cur+1),b=d.seq.at(d.cur+2);d.queue=[a.w,b.w];d.qsp=[a.sp,b.sp];
 pvpProg();
}
function pvpProg(){Net.send({t:'prog',n:G.duel.cur,ty:G.target.typed,wpm:calcWpm()})}
function pvpSendHp(){const d=G.duel;Net.send({t:'hp',v:d.php,k:d.rAtkN})}
// vida do rival = última informada − meus ataques que ele ainda não confirmou, limitada pelo teto
function pvpRecalcB(){
 const d=G.duel;let pend=0;for(let i=Math.min(d.bAck,d.sent.length);i<d.sent.length;i++)pend+=d.sent[i];
 d.bhp=Math.max(0,Math.min(d.bRep-pend,d.bCap));if(d.bhp<=0)pvpKo();
}
// ---------- eu completei a palavra n ----------
function pvpAttack(){
 const d=G.duel,e=G.target,n=d.cur,sp=e.sp,len=e.nw.length,first=d.rDone<n,c=Math.min(G.combo,10);
 const dmg=Math.round(pvpBase(d.mode,e.nw)*(1+c*.06)*(first?PVP.FIRST:1)*(sp==='crit'?PVP.CRIT:1)*pvpSdMul(d)*d.balMe);
 const secs=Math.max(.08,G.time-(e.startT==null?G.time:e.startT)),wpm=Math.min(300,Math.round(len/5/(secs/60)));
 G.wordLog.push({word:e.word,secs,wpm});if(d.mode==='words'&&(!d.best||wpm>d.best.wpm))d.best={w:e.word,wpm};
 G.combo++;G.maxCombo=Math.max(G.maxCombo||0,G.combo);G.words++;if(d.mode==='words'){questAdd('words',1);WordHistory.add(e.word,d.wlang)}
 if(first)d.firsts++;if(sp)d.specials++;
 const by=BOT_POS.y+Math.sin(T*1.5)*4,pred=d.rShield; // o rival ergueu escudo: este golpe deve ser bloqueado por ele
 if(pred)d.rShield=false;
 Net.send({t:'atk',n,d:dmg,first});d.atkLog.push({n,d:dmg,first}); // o registro permite reenviar o que se perder numa queda
 d.sent.push(pred?0:dmg);d.hits.push([G.time,dmg]);if(d.hits.length>8)d.hits.shift();
 if(!pred)d.bCap-=dmg;
 // efeitos
 castGlow=1;const tp=staffTip(1),col=sp?PVP_SP[sp].col:G.col;
 addBeam(tp.x,tp.y,BOT_POS.x,by-20,col,sp==='crit'?.55:.4,G.ch.spell==='raio');
 starBurst(BOT_POS.x,by-20,col,sp==='crit'?30:16,sp==='crit'?260:170,10);addRing(BOT_POS.x,by-20,6,sp==='crit'?110:60,.35,col);addLight(BOT_POS.x,by-20,col,.4,200);
 if(pred){floatTxt(BOT_POS.x,by-100,t('pvp.blocked'),'#7ad0ff',22);addRing(BOT_POS.x,by-40,40,90,.4,'#7ad0ff')}
 else{d.bhit=.3;floatTxt(BOT_POS.x+rand(-40,40),by-90,'-'+dmg,sp==='crit'?'#ff7a3a':'#ffd98a',sp==='crit'?34:24)}
 G.shake=Math.max(G.shake,sp==='crit'?.45:.15);snd(900,.22,'sawtooth',.035,180);
 if(first){floatTxt(TX,TTOP-150,t('pvp.first'),'#ffe14a',26);addRing(TX,TTOP-60,10,120,.45,'#ffe14a');snd(1568,.12,'triangle',.05)}
 if(sp==='crit'){floatTxt(BOT_POS.x,by-130,t('pvp.crit'),'#ff7a3a',28);snd(120,.3,'square',.05,60)}
 if(sp==='gold'){d.php=Math.min(d.max,d.php+PVP.HEAL);floatTxt(TX-110,TTOP-60,t('pvp.heal',{n:PVP.HEAL}),'#7dffbd',22);starBurst(TX,TTOP-40,'#7dffbd',18,150,8);snd(1046,.25,'triangle',.05,1318);pvpSendHp()}
 if(sp==='shield'){d.shield=true;floatTxt(TX+110,TTOP-70,t('pvp.shield'),'#7ad0ff',22);snd(660,.3,'triangle',.05,990)}
 if(sp==='ice'){d.rFrozen=PVP.ICE;floatTxt(BOT_POS.x,by-120,t('pvp.iceHit'),'#aef0ff',22);burst(BOT_POS.x,by-30,'#aef0ff',24,180);snd(1760,.2,'sine',.05,880)}
 pvpRecalcB();
 nextPlayerWord();
}
// ---------- o rival completou a palavra n ----------
function pvpOnAtk(m){
 const d=G.duel,n=m.n|0;d.rAtkN++;
 if(n<1||n>d.rDone+3){d.cheat++;return pvpSendHp()} // fora de ordem (ou absurdo): ignora
 const it=d.seq.at(n),ok=n===d.rDone+1;d.rChars+=it.w.length;
 let dmg=Math.max(0,Math.min(m.d|0,pvpCap(d,n,d.balR)));
 if(!ok||d.rChars>(d.ft+2)*PVP.MAX_CPS){dmg=0;d.cheat++} // pulou palavra ou rápido demais para um humano
 d.rDone=Math.max(d.rDone,n);
 const by=BOT_POS.y+Math.sin(T*1.5)*4;
 if(ok&&it.sp==='gold'){d.bCap=Math.min(d.max,d.bCap+PVP.HEAL);floatTxt(BOT_POS.x+110,by-60,t('pvp.heal',{n:PVP.HEAL}),'#7dffbd',18);starBurst(BOT_POS.x,by-20,'#7dffbd',14,130,8)}
 if(ok&&it.sp==='shield'){d.rShield=true;let mx=pvpCap(d,d.cur,d.balMe);for(const h of d.hits)if(G.time-h[0]<3)mx=Math.max(mx,h[1]);d.bCap=Math.min(d.max,d.bCap+mx)} // o escudo pode pegar um golpe já em trânsito
 // rs = reenvio após uma queda: o gelo daquele momento já passou
 if(ok&&it.sp==='ice'&&!m.rs){d.frozen=PVP.ICE;floatTxt(TX,TTOP-160,t('pvp.frozen'),'#aef0ff',26);snd(1760,.3,'sine',.05,440)}
 if(d.shield&&dmg>0){d.shield=false;dmg=0;floatTxt(TX,TTOP-110,t('pvp.blocked'),'#7ad0ff',24);addRing(TX,TTOP-40,40,100,.45,'#7ad0ff');snd(520,.2,'triangle',.05,1040)}
 if(dmg>0||(ok&&it.sp==='crit'))pvpHitFx(dmg,it.sp);
 d.php=Math.max(0,d.php-dmg);
 pvpSendHp();
 if(d.php<=0)pvpKo();
}
function pvpHitFx(dmg,sp){
 const d=G.duel,by=BOT_POS.y+Math.sin(T*1.5)*4,col=sp?PVP_SP[sp].col:d.L.color;
 addBeam(BOT_POS.x+30,by-60,TX,TTOP-40,col,.4,false);
 burst(TX,TTOP-40,'#ff4a6a',22,220);addRing(TX,TTOP-40,8,70,.35,col);
 d.phit=.3;G.shake=sp==='crit'?.6:.35;G.flash=.3;G.flashCol='#ff2a4a';
 floatTxt(TX+rand(100,150)*(Math.random()<.5?-1:1),TTOP-40,'-'+dmg,'#ff5a7a',sp==='crit'?32:24);snd(160,.3,'sawtooth',.06,60);
 if(sp==='crit')floatTxt(TX,TTOP-130,t('pvp.crit'),'#ff7a3a',24);
}
// mensagens da batalha (chamado pelo Net)
function pvpData(m){
 const d=G&&G.duel;if(!d||!d.online||state!=='play')return;
 if(m.t==='prog'){const n=m.n|0;if(n<1||n>d.rDone+2)return;const it=d.seq.at(n),b=d.bot;b.word=b.nw=it.w;b.sp=it.sp;b.typed=Math.max(0,Math.min(it.w.length,m.ty|0));d.rwpm=Math.max(0,Math.min(400,m.wpm|0));d.rCur=n}
 else if(m.t==='atk')pvpOnAtk(m);
 else if(m.t==='hp'){d.bRep=Math.max(0,Math.min(d.max,+m.v||0));d.bAck=Math.max(0,m.k|0);pvpRecalcB()}
}
// ---------- tempo: contagem, morte súbita, gelo, curva de WPM, fim ----------
function pvpUpdate(dt){
 const d=G.duel;
 if(d.ending>0&&(d.ending-=dt)<=0){pvpResolve();if(state!=='play')return} // K.O. decide mesmo se a contagem deste lado ainda não acabou
 if(d.recon>0){if((d.recon-=dt)<=0)pvpReconFail();return} // 📡 conexão caiu: a luta fica congelada esperando o rival
 if(d.cd>-1){const c0=Math.ceil(d.cd);d.cd-=dt;const c1=Math.ceil(d.cd);if(c1!==c0&&c0>0)snd(c1>0?660:1046,.18,'triangle',.06)} // continua até −1: o "LUTE!" some
 if(d.cd>0)return;
 d.ft+=dt;d.frozen=Math.max(0,d.frozen-dt);d.rFrozen=Math.max(0,d.rFrozen-dt);d.emoT=Math.max(0,d.emoT-dt);
 for(const k of['me','them']){const u=d.bub[k];if(u&&(u.t-=dt)<=0)d.bub[k]=null}
 if(!d.sdOn&&d.ft>=PVP.SD_T){d.sdOn=true;G.banner=2.2;G.bannerTxt=t('pvp.sd');snd(110,.8,'sawtooth',.06,55);MUS.heat=1}
 if((d.curveT+=dt)>=2){d.curveT=0;if(d.curve.length<90)d.curve.push(calcWpm())}
}
function pvpKo(){const d=G.duel;if(d.ending>0||state!=='play')return;d.ending=PVP.SETTLE;G.target.typed=0;snd(80,.6,'sawtooth',.07,40)}
// decide com os números de agora (já chegaram as mensagens em trânsito)
function pvpResolve(){
 const d=G.duel;pvpRecalcB();const me=d.php<=0,them=d.bhp<=0;
 if(!me&&!them){d.ending=0;return} // falso alarme (ex.: escudo bloqueou o golpe final): a luta continua
 pvpEnd(me&&them?'draw':them?'win':'loss');
}
// ---------- 📡 queda de conexão no meio da luta (O13) ----------
// Saída de propósito (bye) = W.O. na hora. Queda = luta congelada por PVP.RECON s enquanto o convidado tenta voltar;
// na volta, cada lado diz quantos ataques recebeu (sync) e o outro reenvia os que se perderam.
function pvpDisconnected(){
 if(!((state==='play'||state==='paused')&&G&&G.duel&&G.duel.online))return false;
 const d=G.duel;if(d.ending>0){pvpResolve();if(state==='over')return true}
 if(Net._bye){Net._bye=false;pvpEnd('win','wo');return true} // 🏳️ o rival saiu/fechou a aba de propósito: vitória por W.O. na hora
 if(d.recon>0)return true; // já esperando
 d.recon=PVP.RECON+(Net.role==='guest'?2:0);G.target.typed=0;Net.awaitResume();snd(330,.25,'triangle',.05,220);
 return true;
}
// tempo esgotado sem volta: quem estava fora da aba perde; senão, vitória por W.O.
function pvpReconFail(){
 const d=G.duel;Net.stopResume();const away=d.away+(d.hidAt?performance.now()-d.hidAt:0);
 pvpEnd(away>4000?'loss':'win',away>4000?'away':'dc');
}
function pvpResumed(){
 if(!(G&&G.duel&&G.duel.online&&state==='play'))return;const d=G.duel;
 d.recon=0;floatTxt(TX,H/2-90,t('pvp.reconOk'),'#7dffbd',26);snd(988,.12,'triangle',.05,1318);
 Net.send({t:'sync',ack:d.rAtkN});pvpSendHp();pvpProg();
}
// o rival recebeu `ack` ataques meus: reenvia o resto (os que foram para o canal morto)
function pvpOnSync(ack){
 if(!(G&&G.duel&&G.duel.online&&state==='play'))return;const d=G.duel;
 for(const a of d.atkLog.slice(Math.max(0,ack|0)))Net.send(Object.assign({t:'atk',rs:1},a));
 pvpSendHp();
}
// voltei tarde: o anfitrião já tinha decidido a luta → o meu resultado é o oposto do dele
function pvpEndedRemote(res){
 if(!(G&&G.duel&&G.duel.online)||state==='over')return;
 const mine=res==='win'?'loss':res==='loss'?'win':'draw';pvpEnd(mine,mine==='loss'?'timeout':'dc');
}
document.addEventListener('visibilitychange',()=>{if(!(G&&G.duel&&G.duel.online&&state==='play'))return;const d=G.duel;
 if(document.hidden)d.hidAt=performance.now();else if(d.hidAt){d.away+=performance.now()-d.hidAt;d.hidAt=0}});
// 🏳️ fechou a aba no meio da luta = derrota registrada (o rival recebe o 'bye' e ganha por W.O. na hora).
//  beforeunload + pagehide (o celular nem sempre dispara o primeiro). Se a página morrer sem nenhum dos dois
//  (travou, sistema matou a aba), a marca mage_pvp_live fica e a derrota entra na próxima abertura do jogo.
const PVP_LIVE='pvp_live';
function pvpLiveMark(){const d=G.duel;StorageManager.write(PVP_LIVE,{rname:d.rname,rav:d.rav,mode:d.mode,at:Date.now()})}
function pvpLiveClear(){StorageManager.write(PVP_LIVE,null)}
function pvpQuitNow(){
 if(!((state==='play'||state==='paused')&&G&&G.duel&&G.duel.online)||G.duel.quit)return;
 G.duel.quit=true;try{Net.send({t:'bye'});pvpRecord('loss','quit');saveProfile();pvpLiveClear()}catch(_){}
}
addEventListener('beforeunload',pvpQuitNow);addEventListener('pagehide',pvpQuitNow);
(function pvpLiveRecover(){ // abertura do jogo: luta que ficou "pendurada" = derrota por abandono
 const L=StorageManager.read(PVP_LIVE,null);if(!L||!L.at)return;pvpLiveClear();
 profile.online=profile.online||{wins:0,losses:0};profile.online.losses++;
 recordOnlineBattle({res:'loss',reason:'quit',rname:L.rname,rav:L.rav,mode:L.mode,wpm:0,acc:0});saveProfile();
})();
function pvpRestore(){if(!pvpSaved)return;GAME_STYLE=pvpSaved.style;Input.mode=pvpSaved.input;pvpSaved=null;Input.sync()}
function pvpRecord(res,reason){
 const d=G.duel;profile.online=profile.online||{wins:0,losses:0};profile.online.draws=profile.online.draws||0;
 profile.online[res==='win'?'wins':res==='draw'?'draws':'losses']++;
 recordOnlineBattle({res,reason:reason||'',rname:d.rname,rav:d.rav,mode:d.mode,wpm:calcWpm(),acc:calcAcc()});
}
function pvpMySum(){const d=G.duel;return{wpm:calcWpm(),acc:calcAcc(),words:G.words,firsts:d.firsts,specials:d.specials,best:d.best,curve:d.curve.slice()}}
function pvpCleanSum(s){
 s=s&&typeof s==='object'?s:{};const num=(v,mx)=>Math.max(0,Math.min(mx,+v||0))|0;
 return{wpm:num(s.wpm,400),acc:num(s.acc,100),words:num(s.words,999),firsts:num(s.firsts,999),specials:num(s.specials,999),
  best:s.best&&typeof s.best==='object'?{w:String(s.best.w||'').replace(/[^a-z]/gi,'').slice(0,16),wpm:num(s.best.wpm,400)}:null,
  curve:Array.isArray(s.curve)?s.curve.slice(0,90).map(v=>num(v,400)):[]};
}
function pvpEnd(res,reason){
 if(state==='over')return;state='over';if(typeof res==='boolean')res=res?'win':'loss';Net.stopResume();
 const win=res==='win',draw=res==='draw',d=G.duel,b=Inventory.bonuses(),before={level:profile.level,xp:profile.xp};
 const xp=Math.round((win?200:draw?120:70)*(1+b.xp/100)),aura=Math.round((win?25:draw?10:0)*(1+b.aura/100));
 d.result=res;pvpLiveClear();pvpRecord(res,reason);questAdd('onlineDuels',1);if(win){questAdd('duelWins',1);questAdd('onlineWins',1)} // 📋 missões: partidas online e vitórias
 const S=Net.series;if(S.me>=2||S.them>=2){S.me=S.them=S.draws=0}S[win?'me':draw?'draws':'them']++;
 profile.aura=(profile.aura||0)+aura;profile.totalWords+=G.words;profile.totalTime+=G.time;profile.totalCorrect+=G.correct;profile.totalErrors+=G.errors;
 const ups=addXp(xp);saveProfile();pvpRestore();document.body.classList.remove('in-online');
 d.mySum=pvpMySum();Net.send({t:'sum',s:d.mySum});
 (win?[523,659,784,1046,1318]:draw?[523,659,523,659]:[400,300,200,120]).forEach((f,i)=>snd(f,.3,'triangle',.06,0,i*.12));
 renderSide();renderProfile();
 showOnlineResult({res,reason,xp,aura,ups,before,rname:d.rname,rav:d.rav,rec:profile.online});
}
// ---------- tela de resultado: série, comparação lado a lado, gráfico de WPM, revanche direta ----------
function showOnlineResult(r){
 const S=Net.series,done=S.me>=2||S.them>=2,ttl=r.res==='win'?'🏆 '+t('duel.victory'):r.res==='draw'?'🤝 '+t('pvp.drawTitle'):'💀 '+t('duel.defeat');
 const why=r.reason==='dc'?t('online.rivalLeft'):r.reason==='away'?t('pvp.away'):r.reason==='timeout'?t('pvp.timeout'):'';
 showOverlay(`<h2 class="${r.res==='loss'?'lose':''}">${ttl}</h2>
 <p>🌐 ${t('online.vs')} ${esc(r.rav)} <b>${esc(r.rname)}</b>${why?` · <span class="olbad">${why}</span>`:''}</p>
 <div class="pvpseries${done?' done':''}"><span>${t('pvp.series',{a:S.me,b:S.them})}${S.draws?' · 🤝 '+S.draws:''}</span>${done?`<b>${S.me>=2?t('pvp.seriesWin'):t('pvp.seriesLose')}</b>`:''}</div>
 <div id="pvpCmp" class="pvpcmp"></div>
 <div class="xpbox">${xpFooter(r.before)}${r.aura?`<div class="row"><span>✨ ${t('aura.name')}</span><b>+${r.aura}</b></div>`:''}</div><div id="lvSlot"></div><div class="rewards" id="rwSlot"></div>
 <div class="row2 pvpbtns"><button class="btn" id="pvpRm" onclick="pvpRematch()">⚔️ ${t('pvp.rematch')}</button><button class="btn ghost" onclick="Net.backToLobby()">🏰 ${t('pvp.lobby')}</button><button class="btn ghost" onclick="Net.leave();quitToMenu()">🏠 ${t('results.menu')}</button></div>
 <p class="pvprmst" id="pvpRmSt"></p>`,'over');
 pvpRenderCmp();pvpRmRender();
 animateXp(r.before,r.xp,r.ups.flatMap(rewardsAt).filter(s=>!s.startsWith('🎁')));
}
function pvpRenderCmp(){
 const el=$('pvpCmp');if(!el||!G||!G.duel)return;const d=G.duel,a=d.mySum||pvpMySum(),b=d.sum;
 const v=(s,k)=>s?(k==='acc'?s[k]+'%':s[k]):'…';
 const rows=[['hud.wpm','wpm'],['hud.precision','acc'],['stats.words','words'],['pvp.firsts','firsts'],['pvp.specials','specials']].map(([l,k])=>{
  const x=a[k],y=b?b[k]:null,w=y==null?'':x>y?'me':x<y?'them':'';
  return`<div class="pc-row"><b class="${w==='me'?'lead':''}">${v(a,k)}</b><span>${t(l)}</span><b class="${w==='them'?'lead':''}">${v(b,k)}</b></div>`}).join('');
 const bw=s=>s&&s.best&&s.best.w?`${esc(s.best.w.toUpperCase())} · ${s.best.wpm}`:'—';
 el.innerHTML=`<div class="pc-head"><b>${esc(nickOr())}</b><span>VS</span><b>${esc(d.rname)}</b></div>${rows}
  ${d.mode==='words'?`<div class="pc-row best"><b>${bw(a)}</b><span>${t('pvp.bestWord')}</span><b>${b?bw(b):'…'}</b></div>`:''}
  ${pvpChart(a.curve,b?b.curve:[],d.L.color)}${b?'':`<small class="pc-wait">${t('pvp.waitingSum')}</small>`}`;
}
// gráfico de WPM (amostra a cada 2 s) — SVG simples, as duas linhas na mesma escala
function pvpChart(a,b,rc){
 const n=Math.max(a.length,b.length);if(n<2)return'';
 const mx=Math.max(30,...a,...b),W=300,H=70,pt=s=>s.map((v,i)=>`${(i/(n-1)*W).toFixed(1)},${(H-v/mx*H).toFixed(1)}`).join(' ');
 return`<div class="pc-chart"><small>${t('pvp.wpmChart')}</small><svg viewBox="-2 -4 ${W+4} ${H+8}" preserveAspectRatio="none" aria-hidden="true">
  <polyline points="${pt(a)}" fill="none" stroke="#ffd98a" stroke-width="2.5" stroke-linejoin="round"/>${b.length>1?`<polyline points="${pt(b)}" fill="none" stroke="${HEX_COL.test(rc)?rc:'#ff7a5a'}" stroke-width="2.5" stroke-linejoin="round" stroke-dasharray="5 3"/>`:''}</svg>
  <div class="pc-leg"><i style="--c:#ffd98a"></i>${esc(nickOr())}<i style="--c:${HEX_COL.test(rc)?rc:'#ff7a5a'}"></i>${esc(G.duel.rname)}</div></div>`;
}
function pvpOnSum(s){if(!G||!G.duel||!G.duel.online)return;G.duel.sum=pvpCleanSum(s);if(state==='over')pvpRenderCmp()}
// revanche direta: os dois apertam → o anfitrião começa outra luta no mesmo modo (sem voltar ao lobby)
function pvpRematch(){
 if(state!=='over'||!G||!G.duel||!G.duel.online)return;
 if(!(Net.conn&&Net.conn.open))return pvpRmRender();
 Net.rematch.me=true;Net.send({t:'rematch',v:1});snd(988,.08,'triangle',.04);pvpRmRender();pvpRmCheck();
}
function pvpOnRematch(v){Net.rematch.them=!!v;if(state==='over'&&G&&G.duel&&G.duel.online){pvpRmRender();if(v)snd(1175,.1,'triangle',.05);pvpRmCheck()}}
function pvpRmCheck(){if(Net.rematch.me&&Net.rematch.them&&Net.role==='host')setTimeout(()=>{if(state==='over'&&Net.rematch.me&&Net.rematch.them)Net.startMatch()},500)}
function pvpRmRender(){
 const st=$('pvpRmSt'),bt=$('pvpRm');if(!st||!bt)return;const R=Net.rematch,conn=!!(Net.conn&&Net.conn.open);
 bt.disabled=!conn||R.me;bt.classList.toggle('pulse',conn&&R.them&&!R.me);
 st.textContent=!conn?t('online.err.left'):R.me&&R.them?t('pvp.rematchGo'):R.me?t('pvp.rematchWait'):R.them?t('pvp.rematchAsk'):'';
}
// ---------- visual da luta (chamado por drawDuel / drawDuelHUD em duel.js) ----------
function pvpBubble(c,x,y,txt){
 c.font='800 14px Nunito';const w=c.measureText(txt).width+20,x0=Math.max(8,Math.min(W-w-8,x-w/2))|0;
 c.fillStyle='#fff3c8';c.beginPath();c.roundRect(x0,y-24,w,28,12);c.fill();
 c.beginPath();c.moveTo(x-6,y+3);c.lineTo(x+6,y+3);c.lineTo(x,y+12);c.fill();
 c.fillStyle='#2a1600';c.textAlign='left';c.fillText(txt,x0+10,y-5);
}
// palavra do rival: ícone do especial + barra de progresso dele
function pvpRivalExtra(c,bx,bty,bwW,b,by){
 const d=G.duel,n=b.nw.length||1,p=Math.min(1,b.typed/n);
 if(b.sp){c.font='16px Nunito';c.textAlign='left';c.fillText(PVP_SP[b.sp].ic,bx-34,bty)}
 c.fillStyle='rgba(0,0,0,.45)';c.fillRect(bx-10,bty+10,bwW+20,4);c.fillStyle=d.L.color;c.fillRect(bx-10,bty+10,(bwW+20)*p,4);
 if(b.typed>0&&b.typed<n){c.fillStyle='#ffd0d8';for(let i=0;i<3;i++){c.globalAlpha=.35+.65*Math.max(0,Math.sin(T*8-i*.9));c.beginPath();c.arc(bx+bwW+22+i*8,bty-5,2.4,0,6.283);c.fill()}c.globalAlpha=1}
}
// minha palavra: especial (ícone + legenda) e gelo por cima da caixa
function pvpWordExtra(c,wx,wy,ww,e){
 const d=G.duel;
 if(e.sp){const S=PVP_SP[e.sp],pu=1+.08*Math.sin(T*6);c.save();c.translate(wx-56,wy-12);c.scale(pu,pu);c.font='26px Nunito';c.textAlign='center';c.fillText(S.ic,0,9);c.restore();
  c.font='900 12px Nunito';c.textAlign='center';c.fillStyle=S.col;c.fillText(t('pvp.sp.'+e.sp),TX,wy+30);c.textAlign='left'}
 if(d.frozen>0){c.fillStyle='rgba(174,240,255,.42)';c.beginPath();c.roundRect(wx-22,wy-36,ww+44,48,12);c.fill();
  c.font='900 16px Nunito';c.textAlign='center';c.fillStyle='#e8fbff';c.fillText('❄️ '+d.frozen.toFixed(1)+'s',TX,wy+30);c.textAlign='left'}
}
// escudos, gelo no rival e balões de emote
function pvpDrawWorld(c,by){
 const d=G.duel,pu=.5+.5*Math.sin(T*4);
 const shield=(x,y,r)=>{c.fillStyle='rgba(122,208,255,.08)';c.strokeStyle='rgba(122,208,255,'+(.45+.3*pu).toFixed(2)+')';c.lineWidth=3;c.beginPath();c.arc(x,y,r,0,6.283);c.fill();c.stroke();
  c.lineWidth=1.2;c.beginPath();c.arc(x,y,r-7,T%6.283,(T%6.283)+2);c.stroke()};
 if(d.shield)shield(TX,TTOP-50,80);
 if(d.rShield)shield(BOT_POS.x,by-55,84);
 if(d.rFrozen>0){c.strokeStyle='#aef0ff';c.lineWidth=2.5;c.globalAlpha=Math.min(1,d.rFrozen*2);
  for(let i=0;i<8;i++){const a=i/8*6.283+T*.4,x=BOT_POS.x+Math.cos(a)*72,y=by-55+Math.sin(a)*72;c.beginPath();c.moveTo(x-6,y);c.lineTo(x+6,y);c.moveTo(x,y-6);c.lineTo(x,y+6);c.stroke()}
  c.globalAlpha=1}
 if(d.bub.them)pvpBubble(c,BOT_POS.x+80,by-150,d.bub.them.txt);
 if(d.bub.me)pvpBubble(c,TX+125,TTOP-10,d.bub.me.txt); // ao lado do mago (acima fica a caixa da palavra)
}
// tela: gelo, pulsação de morte súbita / vida baixa e o K.O.
function pvpDrawOverlay(c){
 const d=G.duel;
 if(d.frozen>0){c.fillStyle='rgba(150,225,255,'+Math.min(.16,d.frozen*.2).toFixed(3)+')';c.fillRect(0,0,W,H)}
 const low=d.php/d.max<.25&&d.php>0;
 if(d.sdOn||low){const p=.5+.5*Math.sin(T*(low?7:4));c.strokeStyle='rgba(255,40,60,'+(.16+.22*p).toFixed(3)+')';c.lineWidth=low?22:14;c.strokeRect(0,0,W,H)}
 if(d.recon>0){c.fillStyle='rgba(5,8,26,.62)';c.fillRect(0,0,W,H);c.textAlign='center';
  const a=T*5;c.strokeStyle='#5ad0ff';c.lineWidth=5;c.lineCap='round';c.beginPath();c.arc(TX,H/2-110,26,a,a+4.2);c.stroke();c.lineCap='butt';
  c.font='900 30px Cinzel';c.fillStyle='#e8ecff';c.fillText(t('pvp.recon'),TX,H/2-48);
  c.font='800 15px Nunito';c.fillStyle='#9fb0e0';c.fillText(t('pvp.reconSub',{s:Math.ceil(d.recon)}),TX,H/2-20);c.textAlign='left'}
 if(d.ending>0){const k=1+(PVP.SETTLE-d.ending)*.4;c.save();c.translate(TX,H/2-40);c.scale(k,k);c.textAlign='center';c.font='900 76px Cinzel';
  c.lineWidth=10;c.strokeStyle='rgba(40,0,0,.8)';c.strokeText(t('pvp.ko'),0,0);c.fillStyle='#ff5a4a';c.fillText(t('pvp.ko'),0,0);c.restore();c.textAlign='left'}
}
// HUD: corrida (palavra × rival), morte súbita, equilíbrio e a legenda dos especiais na contagem
function pvpDrawHUD(c){
 const d=G.duel,lead=d.cur-d.rCur;c.textAlign='center';
 if(d.cd<=0){c.font='800 11px Nunito';c.fillStyle=lead>0?'#7dffbd':lead<0?'#ff8a7a':'#c8d2f0';c.fillText((lead>0?'⚡ ':lead<0?'⚠️ ':'')+t('pvp.race',{a:d.cur,b:d.rCur}),TX,104)}
 if(d.sdOn){c.font='900 12px Nunito';c.fillStyle='#ff6a5a';c.fillText(t('pvp.sdMul',{m:pvpSdMul(d).toFixed(1)}),TX,120)}
 if(d.balMe>1||d.balR>1){c.font='800 10px Nunito';c.fillStyle='#9fb0e0';c.fillText(t('pvp.balOn'),TX,d.sdOn?134:120)}
 if(d.cd>0){c.font='800 13px Nunito';c.fillStyle='#e8ecff';c.fillText(PVP_SPK.map(k=>PVP_SP[k].ic+' '+t('pvp.sp.'+k)).join('   '),TX,H/2+20);
  if(!DeviceManager.isTouch){c.font='700 11px Nunito';c.fillStyle='#9fb0e0';c.fillText(t('pvp.emoteHint'),TX,H/2+40)}}
 c.textAlign='center';
}
// ---------- emotes durante a luta: balões sobre os magos (teclas 1–4 ou a barra na tela) ----------
function pvpEmote(who,txt){if(!G||!G.duel||!G.duel.online)return;G.duel.bub[who]={txt,t:2.6}}
function pvpEmoBar(){
 let el=$('pvpEmo');if(!el){el=document.createElement('div');el.id='pvpEmo';el.className='pvpemo';const st=document.querySelector('.stage');if(!st)return;st.appendChild(el);
  el.addEventListener('pointerdown',e=>{const b=e.target.closest('[data-e]');if(!b)return;e.preventDefault();Net.emote(+b.dataset.e)})}
 el.innerHTML=EMOTES.map((e,i)=>`<button data-e="${i}" aria-label="${esc(t('online.emote.'+e))}">${esc(t('online.emote.'+e).split(' ')[0])}${DeviceManager.isTouch?'':`<small>${i+1}</small>`}</button>`).join('');
}
