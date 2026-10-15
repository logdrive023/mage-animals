// Mage Animals — Duelo de Magos (PVC): você contra um Mago Bot com WPM configurável, 100% offline.
'use strict';

const BOT_POS={x:TX,y:292};
const DUEL_HP=200; // vida de cada mago (≈ 20–40 s de duelo com digitação humana)
const botCv=mkCanvas(140,140),botCx=botCv.getContext('2d');
let botDrawT=0;

function duelWord(){if(G.duel.online)return pvpWord();const L=G.duel.L,list=POOL[L.tiers[(Math.random()*L.tiers.length)|0]];return list[(Math.random()*list.length)|0]}

function startDuel(li){
 const L=DUEL_LEVELS[li],base=CHARS.find(c=>c.id===L.base);
 G=freshState('duel');
 G.duel={li,L,max:DUEL_HP,php:DUEL_HP,bhp:DUEL_HP,pShow:DUEL_HP,bShow:DUEL_HP,phit:0,bhit:0,queue:[],
  botCh:Object.assign({},base,{robe:L.robe,robeDark:L.robeDark,color:L.color}),bot:{word:'',nw:'',typed:0,acc:0,delay:1.6}};
 G.duel.queue.push(duelWord(),duelWord(),duelWord());
 G.target={word:'',nw:'',typed:0,dw:0,startT:null};
 G.banner=1.6;MUS.heat=0;MUS.slow=0;botDrawT=-1;
 renderBg(BIOMES[currentBiome].themes[0]);
 nextPlayerWord();nextBotWord();
 state='play';hideOverlay();physAcc=0;updateUI(true);
 snd(220,.5,'sawtooth',.05,440);
}
function nextPlayerWord(){const d=G.duel,e=G.target;const w=d.queue.shift();d.queue.push(duelWord());e.word=w;e.nw=d.online&&d.mode==='runes'?w:norm(w);e.typed=0;e.startT=null;if(d.online)pvpProg()}
function nextBotWord(){const b=G.duel.bot;b.word=duelWord();b.nw=norm(b.word);b.typed=0;b.acc=0}

function duelLetter(ch){
 const e=G.target,d=G.duel;
 if(d.online&&d.cd>0)return; // contagem 3-2-1: ainda não vale
 if(isCharMatch(ch,e.word[e.typed],STRICT_ACCENTS)){
  e.typed++;G.correct++;recentPush(1);if(e.typed===1)e.startT=G.time;if(d.online&&e.typed<e.nw.length)pvpProg();
  flashKey(norm(ch),'hit');letterNote(e.typed);
  if(e.typed>=e.nw.length){letterChord();playerAttack()}
 }else miss(ch);
}
function playerAttack(){
 const d=G.duel,e=G.target,len=e.nw.length,dmg=d.online?pvpDamage(e):Math.round((5+len*1.3)*(1+Math.min(G.combo,10)*.08));
 if(d.online)Net.send({t:'atk',d:dmg}); // o rival aplica na vida dele e confirma com hp/ko
 const secs=Math.max(.08,G.time-(e.startT==null?G.time:e.startT));G.wordLog.push({word:e.word,secs,wpm:Math.min(300,Math.round(len/5/(secs/60)))});
 G.combo++;G.maxCombo=Math.max(G.maxCombo||0,G.combo);G.words++;if(!d.online||d.mode==='words')questAdd('words',1);
 castGlow=1;const tp=staffTip(1),by=BOT_POS.y+Math.sin(T*1.5)*4;
 addBeam(tp.x,tp.y,BOT_POS.x,by-20,G.col,.4,G.ch.spell==='raio');
 starBurst(BOT_POS.x,by-20,G.col,16,170,10);addRing(BOT_POS.x,by-20,6,60,.35,G.col);addLight(BOT_POS.x,by-20,G.col,.4,200);
 d.bhp=Math.max(0,d.bhp-dmg);d.bhit=.3;G.shake=Math.max(G.shake,.15);
 floatTxt(BOT_POS.x+rand(-40,40),by-90,'-'+dmg,'#ffd98a',24);snd(900,.22,'sawtooth',.035,180);
 if(d.bhp<=0&&!d.online)return duelEnd(true);
 if(d.bhp<=0)d.koWait=3; // online: espera o "ko" do rival (se não vier em 3 s, vitória mesmo assim)
 nextPlayerWord();
}
function botAttack(){
 const d=G.duel,b=d.bot,dmg=Math.round(5+b.nw.length*1.3),by=BOT_POS.y+Math.sin(T*1.5)*4;
 addBeam(BOT_POS.x+30,by-60,TX,TTOP-40,d.L.color,.4,false);
 burst(TX,TTOP-40,'#ff4a6a',22,220);addRing(TX,TTOP-40,8,70,.35,d.L.color);
 d.php=Math.max(0,d.php-dmg);d.phit=.3;G.shake=.35;G.flash=.3;G.flashCol='#ff2a4a';
 floatTxt(TX+rand(100,150)*(Math.random()<.5?-1:1),TTOP-40,'-'+dmg,'#ff5a7a',24);snd(160,.3,'sawtooth',.06,60);
 if(d.php<=0)return duelEnd(false);
 nextBotWord();b.delay=rand(.15,.45);
}
function duelUpdate(dt){
 const d=G.duel,b=d.bot;
 G.time+=dt;G.banner=Math.max(0,G.banner-dt);G.col=spellColor(G.ch);musicPerf(dt);
 d.phit=Math.max(0,d.phit-dt);d.bhit=Math.max(0,d.bhit-dt);
 d.pShow+=(d.php-d.pShow)*Math.min(1,dt*6);d.bShow+=(d.bhp-d.bShow)*Math.min(1,dt*6);
 if(d.online){if(d.cd>0){const c0=Math.ceil(d.cd);d.cd-=dt;const c1=Math.ceil(d.cd);if(c1!==c0)snd(c1>0?660:1046,.18,'triangle',.06)}
  if(d.koWait>0){d.koWait-=dt;if(d.koWait<=0&&state==='play')return duelEnd(true)}}
 else if(G.banner<=.3){
  if(b.delay>0)b.delay-=dt;
  else{
   b.acc+=d.L.wpm*5/60*dt*rand(.8,1.2); // WPM → caracteres por segundo
   while(b.acc>=1&&b.typed<b.nw.length){b.acc-=1;if(Math.random()<d.L.err){b.delay=rand(.3,.6);b.acc=0;break}b.typed++}
   if(b.typed>=b.nw.length)botAttack();
  }
 }
 if(state==='play')updateFx(dt);
}
function duelEnd(win){
 if(G.duel.online)return pvpEnd(win);
 state='over';
 const d=G.duel,r=finishDuel({win,li:d.li,words:G.words,time:G.time,correct:G.correct,errors:G.errors,wpm:calcWpm(),acc:calcAcc(),wordLog:G.wordLog});
 (win?[523,659,784,1046,1318]:[400,300,200,120]).forEach((f,i)=>snd(f,.3,'triangle',.06,0,i*.12));
 renderSide();renderProfile();showDuelResult(r);
}

// ---------- render ----------
function drawDuel(c,col){
 const d=G.duel,by=BOT_POS.y+Math.sin(T*1.5)*4;
 drawParts(c,true);
 // ilha flutuante do bot
 c.drawImage(glowSprite(d.L.color),BOT_POS.x-90,by+10,180,60);
 c.fillStyle='#1a1430';c.beginPath();c.ellipse(BOT_POS.x,by+18,70,16,0,0,6.283);c.fill();
 c.fillStyle='#2a2246';c.beginPath();c.moveTo(BOT_POS.x-66,by+20);c.lineTo(BOT_POS.x-20,by+70);c.lineTo(BOT_POS.x+8,by+52);c.lineTo(BOT_POS.x+30,by+82);c.lineTo(BOT_POS.x+66,by+20);c.fill();
 c.fillStyle='#3a3060';c.beginPath();c.ellipse(BOT_POS.x,by+14,66,12,0,0,6.283);c.fill();
 if(botDrawT<0||T-botDrawT>1/24||botDrawT>T){botDrawT=T;drawAvatar(botCx,d.botCh,T,false)} // retrato do bot a 24 FPS
 c.drawImage(botCv,BOT_POS.x-77,by-140,154,154);
 if(d.bhit>0){c.globalCompositeOperation='lighter';c.globalAlpha=d.bhit*2.5;c.drawImage(glowSprite('#ff3a3a'),BOT_POS.x-70,by-130,140,140);c.globalAlpha=1;c.globalCompositeOperation='source-over'}
 // palavra do bot (com progresso) acima dele
 const b=d.bot,dtx=(w,a,z)=>G.runes?runeGlyphs(w.slice(a,z)):w.slice(a,z).toUpperCase(),bw=dtx(b.word,0);c.font='800 '+(d.online?18:15)+'px Nunito';const bwW=c.measureText(bw).width,bx=(BOT_POS.x-bwW/2)|0,bty=(by-150)|0;
 c.fillStyle='rgba(40,8,20,.85)';c.strokeStyle=d.L.color;c.lineWidth=1.5;c.beginPath();c.roundRect(bx-10,bty-17,bwW+20,24,6);c.fill();c.stroke();
 const done=dtx(b.word,0,b.typed);c.fillStyle='#ff7a8a';c.fillText(done,bx,bty);c.fillStyle='#d8def5';c.fillText(dtx(b.word,b.typed),bx+c.measureText(done).width+(done&&G.runes?c.measureText(' ').width:0),bty);
 drawTowerAndMage(c,G.ch,col);
 // painel da sua palavra
 const e=G.target,w=dtx(e.word,0);c.font='900 34px Nunito';const ww=c.measureText(w).width,wx=(TX-ww/2)|0,wy=432;
 c.font='800 13px Nunito';c.textAlign='center';c.fillStyle='rgba(200,210,240,.75)';c.fillText(dtx(d.queue[0],0)+'  ·  '+dtx(d.queue[1],0)+'  →',TX,wy-50);c.textAlign='left';
 c.font='900 34px Nunito';c.fillStyle='rgba(8,10,30,.85)';c.strokeStyle='#ffd98a';c.lineWidth=2;c.beginPath();c.roundRect(wx-22,wy-36,ww+44,48,12);c.fill();c.stroke();
 const dn=dtx(e.word,0,e.typed),gap=dn&&G.runes?c.measureText(' ').width:0;c.fillStyle='#ffd98a';c.fillText(dn,wx,wy);c.fillStyle='#fff';c.fillText(dtx(e.word,e.typed),wx+c.measureText(dn).width+gap,wy);
 drawFx(c);drawTexts(c);
}
function hpBar(c,x,y,w,v,show,col){
 c.fillStyle='#060a1e';c.beginPath();c.roundRect(x,y,w,12,6);c.fill();
 c.fillStyle='rgba(255,255,255,.25)';c.fillRect(x+1,y+1,Math.max(0,(w-2)*show/100),10);
 const g=c.createLinearGradient(x,0,x+w,0);g.addColorStop(0,v<30?'#ff3a4a':col);g.addColorStop(1,v<30?'#ff9a5a':'#ffffff');
 c.fillStyle=g;c.beginPath();c.roundRect(x+1,y+1,Math.max(0,(w-2)*v/100),10,5);c.fill();
}
function drawDuelHUD(c){
 const d=G.duel;
 hudBox(c,12,12,236,56);hudBox(c,W-248,12,236,56);
 c.font='900 13px Nunito';c.fillStyle='#fff';c.fillText(profile.avatar+' '+(profile.nickname||t('duel.you')),24,32);
 c.textAlign='right';c.fillText(d.online?d.rname+' '+d.rav:t('duel.levels.'+d.L.id)+' '+d.L.ic,W-24,32);
 c.font='800 10px Nunito';c.fillStyle='#e8b86a';c.fillText(d.online?'🌐 '+d.rwpm+' WPM · '+Math.ceil(d.bhp)+' HP':d.L.wpm+' WPM',W-24,62);c.textAlign='left';c.fillText(Math.ceil(d.php)+' HP',24,62);
 const pc=v=>v/d.max*100;
 hpBar(c,24,40,212,pc(d.php),pc(d.pShow),'#4dffa0');hpBar(c,W-236,40,212,pc(d.bhp),pc(d.bShow),'#ff7a5a');
 c.textAlign='center';c.font='900 26px Cinzel';c.lineWidth=6;c.strokeStyle='rgba(40,20,0,.8)';c.strokeText('VS',TX,48);c.fillStyle='#ffd98a';c.fillText('VS',TX,48);
 if(G.combo>=3){c.font='900 12px Nunito';c.fillStyle='#5ad0ff';c.fillText(t('hud.combo')+' x'+Math.min(10,G.combo)+'  (+'+Math.min(10,G.combo)*8+'% '+t('duel.dmg')+')',TX,86)}
 if(d.online&&d.cd>-.6){const n=Math.ceil(d.cd),txt=n>0?String(n):t('online.fight'),k=1+((d.cd%1)+1)%1*.35;
  c.globalAlpha=Math.min(1,d.cd+.6);c.save();c.translate(TX,H/2-60);c.scale(k,k);c.font='900 '+(n>0?84:56)+'px Cinzel';c.strokeStyle='rgba(60,30,0,.75)';c.lineWidth=10;c.strokeText(txt,0,0);c.fillStyle=n>0?'#ffd98a':'#ff7a5a';c.fillText(txt,0,0);c.restore();c.globalAlpha=1}
 if(G.banner>0){c.globalAlpha=Math.min(1,G.banner*2);c.font='900 50px Cinzel';c.strokeStyle='rgba(60,30,0,.7)';c.lineWidth=8;c.strokeText(t('duel.title'),TX,H/2-60);c.fillStyle='#ffd98a';c.fillText(t('duel.title'),TX,H/2-60);c.globalAlpha=1}
 c.textAlign='left';
}
