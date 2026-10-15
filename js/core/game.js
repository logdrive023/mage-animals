// Mage Animals — Núcleo do jogo (modo arcade): estado, dificuldade, entidades com pooling, física e loop otimizado.
'use strict';

let G=null,state='menu',T=0,castGlow=0;

// ================== QUALIDADE / DESEMPENHO ==================
// 'auto' baixa a qualidade sozinho se o FPS cair (celular fraco) e volta quando estabiliza
const PERF={mode:store.get('quality','auto'),hq:store.get('quality','auto')!=='low',showFps:store.get('showFps',false),fps:60,frames:0,acc:0,low:0,high:0};
function setQuality(m){PERF.mode=m;store.set('quality',m);PERF.hq=m!=='low';fitCanvas()}
function setShowFps(v){PERF.showFps=!!v;store.set('showFps',PERF.showFps)}
function perfSample(dt){
 PERF.frames++;PERF.acc+=dt;if(PERF.acc<1)return;
 PERF.fps=Math.round(PERF.frames/PERF.acc);PERF.frames=0;PERF.acc=0;
 if(PERF.mode!=='auto'||state!=='play')return;
 if(PERF.fps<48){PERF.high=0;if(++PERF.low>=2&&PERF.hq){PERF.hq=false;fitCanvas()}}
 else if(PERF.fps>=57){PERF.low=0;if(++PERF.high>=6&&!PERF.hq){PERF.hq=true;fitCanvas()}}
}
const maxParticles=()=>PERF.hq?900:320;

// ================== DIFICULDADE ==================
// "Easy to learn, hard to master":
//  Ondas 1–3 (fácil): só rochas, palavras de 3–5 letras sem acento, entrada compassada, erros não zeram o combo (1–2).
//  Ondas 4–7 (médio): entram Fantasmas rápidos e Cristais resistentes (2 palavras); combo alto carrega a mana mais rápido.
//  Ondas 8+ (mestre): Chefes com barra de vida, palavras de 6–9 letras e temporizador; velocidade e densidade sobem com o WPM.
const STAGE=w=>w<=3?'easy':w<=7?'medium':'hard';
function wpmFactor(){if(!G||G.wave<8)return 0;return Math.max(0,Math.min(1,(calcWpm()-30)/60))} // 30 WPM → 0 · 90+ WPM → 1
function maxOnScreen(w){const base=w<=3?3:w<=5?5:w<=7?6:Math.min(14,8+Math.floor((w-8)*2/3));return base+Math.round(3*wpmFactor())}
function waveSize(w){return w<=3?6+w*2:w<=7?8+w*3:12+w*3}
function spawnGap(w){return w<=3?1.7:w<=7?1.1:Math.max(.32,.75-(w-8)*.04)}
const isBossWave=w=>w>=8&&(w%2===0||w>=15);
function tierFor(kind,w){
 if(w<=3)return'e';
 if(kind==='boss')return'b';
 if(w<=7)return kind==='crystal'?'m':kind==='ghost'?'s':(Math.random()<.55?'s':'m');
 if(kind==='crystal')return'l';
 const r=Math.random(),pl=w>=10?.2:.08;return r<pl?'l':r<pl+.5?'m':'s';
}
const VEL_BASE=2.2,VEL_PX=10;
function enemySpeed(e){return(VEL_BASE+G.wave*.35)*(1+G.waveTime*.015)*(1+.25*wpmFactor())*VEL_PX*ENEMY[e.kind].spd*(G.ch.id==='coelho'?.85:1)*(e.boost>0?(e.kind==='boss'&&e.rage?1.3:1.15):1)}
// temporizador do chefe: tempo para digitar a palavra atual antes de ele avançar enfurecido
const bossTime=e=>4+e.nw.length*.55;

// ================== PARTIDA ==================
// precisão recente (30 últimas teclas) num anel fixo: zero alocação por tecla/quadro
const RECENT={buf:new Uint8Array(30),n:0,i:0,sum:0};
function recentReset(){RECENT.buf.fill(0);RECENT.n=RECENT.i=RECENT.sum=0}
function recentPush(v){const R=RECENT;if(R.n===30)R.sum-=R.buf[R.i];else R.n++;R.buf[R.i]=v;R.sum+=v;R.i=(R.i+1)%30}
function freshState(mode){
 if(G){drain(G.parts,P_POOL);drain(G.beams,BEAM_POOL);drain(G.rings,RING_POOL);drain(G.texts,TEXT_POOL);drain(G.lights,LIGHT_POOL);drain(G.enemies,ENEMY_POOL)}
 recentReset();const ch=CHARS[selected];
 return{mode,ch,biome:currentBiome,score:0,wave:0,lives:ch.lives,enemies:G?G.enemies:[],parts:G?G.parts:[],beams:G?G.beams:[],rings:G?G.rings:[],texts:G?G.texts:[],lights:G?G.lights:[],
  target:null,combo:0,mana:0,correct:0,errors:0,time:0,waveTime:0,spawnLeft:0,spawnT:0,boss:false,banner:0,clearT:0,shake:0,kills:0,bosses:0,words:0,wordLog:[],flash:0,flashCol:'#ffffff',recent:RECENT,col:spellColor(ch)};
}
function newGame(){
 G=freshState('arcade');MUS.heat=0;MUS.slow=0;
 state='play';hideOverlay();physAcc=0;nextWave();updateUI(true);
}
function nextWave(){
 G.wave++;G.spawnLeft=waveSize(G.wave);G.boss=isBossWave(G.wave);G.spawnT=1.2;G.banner=2.6;G.clearT=0;G.waveTime=0;
 const B=BIOMES[G.biome],ti=B.cycle?B.themes[Math.floor((G.wave-1)/3)%B.themes.length]:B.themes[0];
 if(ti!==themeIdx)renderBg(ti);
 if(B.id==='zombie')questMax('zombieWave',G.wave);
 [523,659,784,1046].forEach((f,i)=>snd(f,.18,'triangle',.05,0,i*.09));
}

const LABEL_FONT='800 15px Nunito, sans-serif';
function measure(txt){ctx.font=LABEL_FONT;return ctx.measureText(txt).width}
function pickWord(tier){
 const list=POOL[tier];let w=list[0];
 for(let i=0;i<16;i++){
  w=list[(Math.random()*list.length)|0];const f=norm(w)[0];let clash=false;
  for(let j=0;j<G.enemies.length;j++){const e=G.enemies[j];if(e.nw[0]===f||e.word===w){clash=true;break}}
  if(!clash)break;
 }
 return w;
}
function setWord(e){e.word=pickWord(tierFor(e.kind,G.wave));e.nw=norm(e.word);e.typed=0;e.dw=0;e.lw=measure(e.word.toUpperCase());e.startT=null;if(e.kind==='boss'){e.timer=e.timerMax=bossTime(e);e.rage=false}}
function spawnX(){
 let bestX=rand(40,W-40),bd=-1;
 for(let i=0;i<8;i++){const x=rand(40,W-40);let d=999;for(let j=0;j<G.enemies.length;j++){const e=G.enemies[j];if(e.y<SPAWN_Y+70){const dd=Math.abs(e.x-x);if(dd<d)d=dd}}if(d>bd){bd=d;bestX=x}if(d>90)break}
 return bestX;
}
function spawn(kind){
 if(!kind){const w=G.wave,r=Math.random();kind=(w>=4&&r<.1+w*.015)?'ghost':(w>=4&&r>.86-w*.015)?'crystal':'rock'} // fantasmas e cristais só a partir da onda 4
 const d=ENEMY[kind],e=ENEMY_POOL.get();
 e.kind=kind;e.art=BIOMES[G.biome].art[kind];e.v=(kind==='rock'||kind==='boss')?(Math.random()*3)|0:0;
 e.x=e.px=kind==='boss'?TX+rand(-120,120):spawnX();e.y=e.py=SPAWN_Y+(kind==='boss'?20:0);
 e.age=0;e.r=d.r;e.hp=e.maxHp=d.hp+(kind==='boss'?Math.floor(Math.max(0,G.wave-8)/4):0);e.t=Math.random()*9;e.flash=0;e.boost=0;e.vx=e.vy=0;e.latT=0;e.latF=1;e.latA=0;
 setWord(e);G.enemies.push(e);
 if(kind==='boss'){G.shake=.5;snd(90,.8,'sawtooth',.08,40)}
}
function releaseEnemy(e){if(G.target===e)G.target=null;removeSwap(G.enemies,e);ENEMY_POOL.put(e)}

// ================== EFEITOS (todos via pool) ==================
const PT={SPARK:0,SMOKE:1,SHARD:2,STAR:3,BUBBLE:4};
function emit(type,x,y,vx,vy,life,col,s,drag,g,grow){
 if(G.parts.length>=maxParticles())return;
 const p=P_POOL.get();p.type=type;p.x=x;p.y=y;p.vx=vx;p.vy=vy;p.life=p.max=life;p.col=col;p.s=s;p.drag=drag;p.g=g||0;p.grow=grow||0;
 p.rot=Math.random()*6.28;p.vr=type===PT.SHARD?rand(-9,9):0;G.parts.push(p);
}
const qn=n=>PERF.hq?n:Math.ceil(n*.45); // menos partículas no modo leve
function burst(x,y,col,n,sp){n=qn(n);for(let i=0;i<n;i++){const a=Math.random()*6.283,v=rand(.3,1)*sp;emit(PT.SPARK,x,y,Math.cos(a)*v,Math.sin(a)*v,rand(.5,1.1),col,rand(1.2,3),rand(2.5,4))}}
function starBurst(x,y,col,n,sp,g){n=qn(n);for(let i=0;i<n;i++){const a=Math.random()*6.283,v=rand(.25,1)*sp;emit(PT.STAR,x,y,Math.cos(a)*v,Math.sin(a)*v,rand(.6,1.2),i%2?col:'#ffffff',rand(1.3,2.8),3,g)}}
function shatter(x,y,r,big,col){
 for(let i=0,n=qn(big?20:10);i<n;i++){const a=Math.random()*6.283,v=rand(60,big?280:200);emit(PT.SHARD,x+Math.cos(a)*r*.4,y+Math.sin(a)*r*.4,Math.cos(a)*v,Math.sin(a)*v,rand(.8,1.4),col,rand(3,7)*(big?1.6:1),2.4,70)}
 for(let i=0,n=qn(big?44:22);i<n;i++){const a=Math.random()*6.283,v=rand(80,big?380:260);emit(PT.SPARK,x,y,Math.cos(a)*v,Math.sin(a)*v,rand(.6,1.2),i%3?col:'#ffffff',rand(1.2,2.8),3.2)}
 for(let i=0,n=qn(big?8:4);i<n;i++)emit(PT.SMOKE,x+rand(-r,r)*.5,y+rand(-r,r)*.5,rand(-25,25),rand(-35,5),rand(.8,1.3),'#4a4552',r*.4,1.5,0,r*1.2);
}
function emitTrail(e,dt){
 const bx=-e.vx*.25,by=-e.vy*.25,trail=BIOMES[G.biome].trail,k=PERF.hq?1:.4,big=e.kind==='boss'?2.5:1;
 if(trail==='bubble'){if(Math.random()<dt*7*big*k)emit(PT.BUBBLE,e.x+rand(-.6,.6)*e.r,e.y+rand(-.4,.4)*e.r,rand(-8,8),-rand(25,55),rand(.8,1.5),'#bff6ff',rand(1.5,3.5)*big*.8,.8);return}
 if(trail==='goo'){
  if(e.kind==='ghost'){if(Math.random()<dt*7*k)emit(PT.STAR,e.x+rand(-.5,.5)*e.r,e.y+e.r*.7,bx,by,rand(.4,.8),'#ff9ad8',rand(.8,1.6),2)}
  else if(Math.random()<dt*8*big*k)emit(PT.SPARK,e.x+rand(-.5,.5)*e.r,e.y+e.r*.4,bx*.3,by*.3+10,rand(.5,.9),e.kind==='boss'?'#b07aff':'#8aff6a',rand(1,2)*big*.8,1,80);
  return;
 }
 if(e.kind==='rock'||e.kind==='boss'){
  if(Math.random()<dt*12*big*k)emit(PT.SPARK,e.x+rand(-.5,.5)*e.r,e.y-e.r*.3+rand(-.3,.3)*e.r,bx+rand(-18,18),by-rand(10,40),rand(.4,.9),Math.random()<.5?'#ff8a2a':'#ffd05a',rand(1,2.2)*big*.8,1.2);
  if(Math.random()<dt*6*big*k)emit(PT.SMOKE,e.x+rand(-.4,.4)*e.r,e.y-e.r*.6,bx*.6+rand(-8,8),by*.6-rand(8,24),rand(.9,1.4),e.kind==='boss'?'#3a2a26':'#3a3640',e.r*.3,1,0,e.r*.9);
 }else if(e.kind==='crystal'){if(Math.random()<dt*6*k)emit(PT.SPARK,e.x+rand(-.6,.6)*e.r,e.y+rand(-.6,.6)*e.r,bx,by-10,rand(.4,.8),'#c9a0ff',rand(1,1.8),2)}
 else if(e.kind==='ghost'){if(Math.random()<dt*8*k)emit(PT.SMOKE,e.x+rand(-.5,.5)*e.r,e.y+e.r*.8,bx,by,rand(.5,.9),'#2aff8a',e.r*.18,1.5,0,e.r*.5)}
}
function addBeam(x1,y1,x2,y2,col,life,zig,meteor){const b=BEAM_POOL.get();b.x1=x1;b.y1=y1;b.x2=x2;b.y2=y2;b.col=col;b.life=b.max=life;b.zig=!!zig;b.meteor=!!meteor;b.seed=Math.random()*100;G.beams.push(b)}
function addRing(x,y,r,R,life,col){const o=RING_POOL.get();o.x=x;o.y=y;o.r=r;o.R=R;o.life=o.max=life;o.col=col;G.rings.push(o)}
function addLight(x,y,col,life,R){if(!PERF.hq)return;const o=LIGHT_POOL.get();o.x=x;o.y=y;o.col=col;o.life=o.max=life;o.R=R;G.lights.push(o)}
function floatTxt(x,y,txt,col,size){const o=TEXT_POOL.get();o.x=x;o.y=y;o.txt=txt;o.col=col||'#ffd98a';o.size=size||16;o.font='900 '+o.size+'px Nunito';o.life=1;G.texts.push(o)}
function mult(){return Math.min(5,1+Math.floor(G.combo/4))}
const fxCol=e=>BIOMES[G.biome].fx[e.kind];

// ================== COMBATE ==================
function damage(e,dmg,main){
 e.hp-=dmg;e.flash=.18;
 const col=fxCol(e),x=e.x,y=e.y,r=e.r,big=e.kind==='boss';
 burst(x,y,col,big?26:12,170);
 if(G.target===e)G.target=null;
 if(e.hp<=0){
  G.kills++;if(big){G.bosses++;questAdd('bosses',1)}
  let pts=(main?e.word.length*10:0)+ENEMY[e.kind].pts;pts=Math.round(pts*mult()*(G.ch.id==='gato'?1.1:1));
  G.score+=pts;G.mana=Math.min(100,G.mana+(main?10:4)*(1+Math.min(G.combo,20)*.05)); // combo alto carrega a mana mais rápido (até 2×)floatTxt(x,y-r,'+'+pts);
  releaseEnemy(e);
  shatter(x,y,r,big,G.col);burst(x,y,col,10,200);snd(big?120:300,.3,'square',.035,60); // explosão na cor do feitiço usado
  burst(x,y,'#ffd98a',8,280);burst(x,y,G.col,8,280);
  G.flash=Math.max(G.flash,big?.7:.22);G.flashCol=col;addLight(x,y,col,.55,big?360:210);
  if(big){G.shake=.6;addRing(x,y,10,170,.6,col)}
 }else{setWord(e);snd(500,.12,'triangle',.04,250)}
}
function fire(e){
 const ch=G.ch,col=G.col;castGlow=1;const tp=staffTip(1);
 addBeam(tp.x,tp.y,e.x,e.y,col,.36,ch.spell==='raio');
 snd(ch.spell==='raio'?1400:900,.22,'sawtooth',.035,ch.spell==='raio'?300:180);
 for(let i=0,n=qn(16);i<n;i++){const a=rand(-Math.PI,0),v=rand(40,170);emit(PT.STAR,tp.x,tp.y,Math.cos(a)*v,Math.sin(a)*v,rand(.5,1.1),i%3?col:'#ffffff',rand(1.2,2.6),2.6,-15)}
 starBurst(e.x,e.y,col,14,150,20);
 addRing(e.x,e.y,4,e.r*2.2,.25,'#ffffff');addLight(tp.x,tp.y,col,.3,170);
 const secs=Math.max(.08,G.time-(e.startT==null?G.time:e.startT));G.wordLog.push({word:e.word,secs,wpm:Math.min(300,Math.round(e.nw.length/5/(secs/60)))});
 G.words++;questAdd('words',1);
 if(ch.spell==='explosao'){addRing(e.x,e.y,10,95,.45,col);
  for(let i=G.enemies.length-1;i>=0;i--){const o=G.enemies[i];if(o!==e&&Math.hypot(o.x-e.x,o.y-e.y)<95)damage(o,1,false)}}
 if(ch.spell==='vortice')addRing(e.x,e.y,e.r*2.4,4,.4,col);
 if(ch.spell==='cometa')addRing(e.x,e.y,6,44,.3,col);
 G.combo++;G.maxCombo=Math.max(G.maxCombo||0,G.combo);
 if(G.combo%4===0)floatTxt(TX,TTOP-130,t('hud.combo')+' x'+mult(),'#5ad0ff',20);
 damage(e,1,true);
}
function meteors(){
 if(G.mode!=='arcade'||G.mana<100||!G.enemies.length)return;G.mana=0;G.shake=.7;
 for(let i=G.enemies.length-1;i>=0;i--){const e=G.enemies[i];if(!e)continue;addBeam(e.x+rand(-140,140),-20,e.x,e.y,'#d77bff',.5,false,true);addRing(e.x,e.y,8,70,.5,'#d77bff');damage(e,e.kind==='boss'?1:2,false)}
 floatTxt(TX,TTOP-150,t('hud.meteors'),'#e8a0ff',28);snd(200,.8,'sawtooth',.07,40);snd(800,.6,'triangle',.05,100,.05);
}
function hitTower(e){
 const x=e.x,y=e.y,r=e.r,big=e.kind==='boss';releaseEnemy(e);
 G.lives-=big?2:1;G.shake=.5;G.flash=.6;G.flashCol='#ff2a4a';G.combo=0;burst(x,y,'#ff4a6a',30,240);shatter(x,y,r,big,'#ff6a5a');snd(110,.45,'sawtooth',.08,40);
 if(G.lives<=0){G.lives=0;gameOver()}
}
function gameOver(){
 state='over';
 const result=finishMatch({score:G.score,wave:G.wave,words:G.words,kills:G.kills,bosses:G.bosses,time:G.time,correct:G.correct,errors:G.errors,wpm:calcWpm(),acc:calcAcc(),wordLog:G.wordLog});
 [400,300,200,120].forEach((f,i)=>snd(f,.3,'triangle',.06,0,i*.18));
 renderSide();renderProfile();showGameOver(result);
}
const calcWpm=()=>G&&G.time>2?Math.round(G.correct/5/(G.time/60)):0;
const calcAcc=()=>G&&(G.correct+G.errors)?Math.round(G.correct/(G.correct+G.errors)*100):100;

// ================== DIGITAÇÃO ==================
// 🔤 Sensibilidade de acentos (persistida em mage_strictAccents)
//  LIGADO (padrão/estrito): DRAGÃO exige "ã"; "a" conta como erro.
//  DESLIGADO (acessível): "dragao" é aceito — teclados sem layout PT-BR e celulares.
let STRICT_ACCENTS=store.get('strictAccents',GAME_DEFAULTS.strictAccents)!==false;
function setStrictAccents(v){STRICT_ACCENTS=!!v;store.set('strictAccents',STRICT_ACCENTS);if(typeof updateAccUI==='function')updateAccUI()}
function toggleStrictAccents(){setStrictAccents(!STRICT_ACCENTS);snd(STRICT_ACCENTS?880:660,.08,'triangle',.04)}
const stripMarks=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'');
// compara 1 caractere digitado com o esperado (maiúsculas/minúsculas nunca importam, para o Caps Lock não punir)
function isCharMatch(inputChar,expectedChar,strictAccents){
 if(!inputChar||!expectedChar)return false;
 if(!strictAccents)return stripMarks(inputChar).toLowerCase()===stripMarks(expectedChar).toLowerCase();
 return inputChar.normalize('NFC').toLowerCase()===expectedChar.normalize('NFC').toLowerCase();
}
const expectedAt=(e,i)=>e.word[i]; // e.word e e.nw têm o mesmo comprimento (palavras em NFC)
function onLetter(ch){
 if(G.mode==='duel')return duelLetter(ch);
 if(!G.target){
  let best=null;for(let i=0;i<G.enemies.length;i++){const e=G.enemies[i];if(isCharMatch(ch,expectedAt(e,0),STRICT_ACCENTS)&&(!best||e.y>best.y))best=e}
  if(!best)return miss(ch);
  G.target=best;
 }
 const e=G.target;
 if(isCharMatch(ch,expectedAt(e,e.typed),STRICT_ACCENTS)){
  e.typed++;G.correct++;recentPush(1);if(e.typed===1)e.startT=G.time;e.dw=measure(e.word.slice(0,e.typed).toUpperCase());
  flashKey(norm(ch),'hit');letterNote(e.typed); // nota na escala da música atual: digitar vira melodia
  // centelha subindo da letra acertada
  const lx=e.x-e.lw/2+e.dw,ly=Math.max(118,Math.min(H-8,e.y+e.r+20))-8;
  for(let k=0;k<2;k++)emit(PT.STAR,lx+rand(-3,3),ly,rand(-14,14),-rand(40,80),rand(.45,.75),k?'#ffd98a':'#7ad0ff',rand(1.2,1.9),2.2,-30);
  if(e.typed>=e.nw.length){letterChord();fire(e)}
 }else miss(ch);
}
function miss(ch){
 G.errors++;recentPush(0);musicMiss();flashKey(norm(ch),'err');snd(140,.12,'sawtooth',.035);
 // margem de erro: nas ondas 1–2 o erro só reduz o combo; depois disso zera (a Coruja nunca perde o combo)
 if(G.ch.id!=='coruja'){if(G.mode==='arcade'&&G.wave<=2)G.combo=Math.max(0,G.combo-2);else G.combo=0}
 if(G.mode==='arcade'&&G.target&&G.wave>=3){G.target.boost=1.5;floatTxt(G.target.x,G.target.y-G.target.r-10,'+15%','#ff5a7a',13)}
 G.shake=Math.max(G.shake,.12);shakeInput();
}
function cancelTarget(){if(!G||!G.target)return;G.target.typed=0;G.target.dw=0;if(G.mode!=='duel')G.target=null}
// volta ao menu: devolve todos os objetos aos pools e limpa a partida
function clearGame(){if(!G)return;drain(G.parts,P_POOL);drain(G.beams,BEAM_POOL);drain(G.rings,RING_POOL);drain(G.texts,TEXT_POOL);drain(G.lights,LIGHT_POOL);drain(G.enemies,ENEMY_POOL);G=null;castGlow=0}

function pause(){if(state!=='play')return;state='paused';showPause()}
function resume(){if(state!=='paused')return;state='play';hideOverlay();physAcc=0}

// ================== ATUALIZAÇÃO (passo fixo) ==================
function updateFx(dt){
 const ps=G.parts;
 for(let i=0;i<ps.length;i++){const p=ps[i],f=1-p.drag*dt;p.vx*=f;p.vy=p.vy*f+p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;p.s+=p.grow*dt;p.rot+=p.vr*dt}
 sweep(ps,P_POOL,ALIVE);
 for(let i=0;i<G.beams.length;i++)G.beams[i].life-=dt;sweep(G.beams,BEAM_POOL,ALIVE);
 for(let i=0;i<G.rings.length;i++)G.rings[i].life-=dt;sweep(G.rings,RING_POOL,ALIVE);
 for(let i=0;i<G.lights.length;i++)G.lights[i].life-=dt;sweep(G.lights,LIGHT_POOL,ALIVE);
 for(let i=0;i<G.texts.length;i++){const o=G.texts[i];o.life-=dt*.8;o.y-=dt*40}sweep(G.texts,TEXT_POOL,ALIVE);
 G.shake=Math.max(0,G.shake-dt);G.flash=Math.max(0,G.flash-dt*1.6);castGlow=Math.max(0,castGlow-dt*2.5);
}
function update(dt){
 G.time+=dt;G.waveTime+=dt;G.banner=Math.max(0,G.banner-dt);G.col=spellColor(G.ch);musicPerf(dt);
 if(PERF.hq&&Math.random()<dt*6){const tp=staffTip(castGlow);emit(PT.STAR,tp.x+rand(-4,4),tp.y+rand(-4,4),rand(-10,10),rand(-32,-10),rand(.8,1.3),G.col,rand(.7,1.4),1)}
 if(G.banner<1.6){
  const mx=maxOnScreen(G.wave);
  G.spawnT-=dt*(G.enemies.length<mx/2?1.8:1);
  if(G.spawnT<=0&&G.enemies.length<mx){
   if(G.boss&&G.spawnLeft<=Math.ceil(waveSize(G.wave)/2)){spawn('boss');G.boss=false}
   else if(G.spawnLeft>0){spawn();G.spawnLeft--}
   G.spawnT=spawnGap(G.wave)*rand(.7,1.25);
  }
 }
 for(let i=G.enemies.length-1;i>=0;i--){
  const e=G.enemies[i];
  e.px=e.x;e.py=e.y;e.t+=dt;e.age+=dt;e.flash=Math.max(0,e.flash-dt);if(e.boost>0)e.boost-=dt;
  if(e.kind==='boss'&&e.age>PORTAL_T){e.timer-=dt;if(e.timer<=0){ // tempo esgotado: o chefe troca de palavra e avança enfurecido
   if(G.target===e)G.target=null;setWord(e);e.rage=true;e.boost=2;G.shake=Math.max(G.shake,.25);floatTxt(e.x,e.y-e.r-26,t('hud.rage'),'#ff5a4a',18);snd(90,.4,'sawtooth',.06,50)}}
  const dx=TX-e.x,dy=TTOP-30-e.y,d=Math.hypot(dx,dy)||1,ux=dx/d,uy=dy/d,v=enemySpeed(e);
  let lat;
  if(e.kind==='ghost'||e.kind==='boss'){
   e.latT-=dt;
   if(e.latT<=0){const gh=e.kind==='ghost';e.latT=rand(.5,1.5);e.latF=rand(gh?4:2,gh?8:4);e.latA=rand(gh?55:35,gh?100:75)*(Math.random()<.5?-1:1)}
   lat=Math.cos(e.t*e.latF)*e.latA*Math.min(1,d/160);
  }else lat=Math.sin(e.t*1.3)*8;
  e.vx=ux*v-uy*lat;e.vy=uy*v+ux*lat;
  e.x=Math.max(e.r,Math.min(W-e.r,e.x+e.vx*dt));e.y+=e.vy*dt;
  emitTrail(e,dt);
  if(d<e.r+44){hitTower(e);if(state!=='play')return}
 }
 updateFx(dt);
 if(G.spawnLeft===0&&!G.boss&&!G.enemies.length){
  G.clearT+=dt;
  if(G.clearT>1.4){if(G.wave%3===0&&G.lives<G.ch.lives){G.lives++;floatTxt(TX,TTOP-140,'+1 ❤','#ff6a7a',22)}nextWave()}
 }
}

// ================== RENDER ==================
let ALPHA=0; // fração entre dois passos de física (interpolação de movimento → suave em 90/120 Hz)
const lerpX=e=>e.px+(e.x-e.px)*ALPHA,lerpY=e=>e.py+(e.y-e.py)*ALPHA;

// (fundo, torre e iluminação: movido para js/core/scenery.js)

function drawEnemies(c){
 for(let i=0;i<G.enemies.length;i++){
  const e=G.enemies[i],x=lerpX(e),y=lerpY(e),s=enemySprite(e.art,e.r,e.v,e.t),hw=s.lw/2;
  if(e.age<PORTAL_T){ // surge por um portal arcano, já em velocidade constante
   const k=e.age/PORTAL_T,ease=1-(1-k)*(1-k)*(1-k),rr=e.r*(.6+ease*1.1);
   c.globalAlpha=1-k;c.strokeStyle='#c9a6ff';c.lineWidth=3;c.beginPath();c.ellipse(x,y,rr,rr*.42,0,0,6.283);c.stroke();
   const sc=.35+.65*ease;c.globalAlpha=ease;c.drawImage(s,(x-hw*sc)|0,(y-hw*sc)|0,(s.lw*sc)|0,(s.lw*sc)|0);c.globalAlpha=1;
  }else c.drawImage(s,(x-hw)|0,(y-hw)|0);
  if(e.flash>0||e.boost>0){c.globalCompositeOperation='lighter';
   if(e.flash>0){c.globalAlpha=Math.min(1,e.flash*4);c.drawImage(glowSprite('#ffffff'),(x-e.r*1.6)|0,(y-e.r*1.6)|0,(e.r*3.2)|0,(e.r*3.2)|0)}
   if(e.boost>0){c.globalAlpha=.4+.4*Math.sin(T*20);c.strokeStyle='#ff3c5a';c.lineWidth=3;c.beginPath();c.arc(x,y,e.r*1.25,0,6.283);c.stroke()}
   c.globalAlpha=1;c.globalCompositeOperation='source-over'}
 }
}
let _bossGrad=null;const bossGrad=c=>_bossGrad||(_bossGrad=(()=>{const g=c.createLinearGradient(0,0,96,0);g.addColorStop(0,'#ff3a4a');g.addColorStop(1,'#ffb040');return g})());
function drawLabels(c){
 c.font=LABEL_FONT;
 for(let i=0;i<G.enemies.length;i++){
  const e=G.enemies[i],ex=lerpX(e),ey=lerpY(e),x=(ex-e.lw/2)|0,y=Math.max(118,Math.min(H-8,ey+e.r+20))|0,isT=G.target===e,hot=e.boost>0;
  c.fillStyle=isT?'rgba(20,16,50,.92)':'rgba(6,8,24,.75)';c.strokeStyle=hot?'#ff4a6a':isT?'#ffd98a':'rgba(120,140,220,.35)';c.lineWidth=isT||hot?2:1;
  c.beginPath();c.roundRect(x-8,y-15,e.lw+16,21,6);c.fill();c.stroke();
  if(e._w!==e.word||e._ty!==e.typed){e._w=e.word;e._ty=e.typed;const up=e.word.toUpperCase();e.upA=up.slice(0,e.typed);e.upB=up.slice(e.typed)} // cache: zero strings novas por quadro
  if(e.typed){c.fillStyle='#ffd98a';c.fillText(e.upA,x,y)}
  c.fillStyle='#fff';c.fillText(e.upB,x+e.dw,y);
  if(e.kind==='boss'){
   // barra de vida própria do chefe + temporizador da palavra
   const bw=96,bx=(ex-bw/2)|0,by=(ey-e.r-24)|0,f=e.hp/e.maxHp;
   c.fillStyle='rgba(6,8,24,.85)';c.beginPath();c.roundRect(bx-2,by-2,bw+4,12,6);c.fill();
   c.save();c.translate(bx,by);c.fillStyle=bossGrad(c);c.beginPath();c.roundRect(0,0,Math.max(2,bw*f),8,4);c.fill();c.restore();
   c.fillStyle='rgba(6,8,24,.9)';for(let j=1;j<e.maxHp;j++)c.fillRect(bx+bw*j/e.maxHp-1,by,2,8);
   const tf=Math.max(0,e.timer/e.timerMax);c.fillStyle='rgba(255,255,255,.12)';c.fillRect(x-8,y+8,e.lw+16,4);
   c.fillStyle=tf>.5?'#ffd24a':tf>.25?'#ff9a2a':'#ff3a4a';c.fillRect(x-8,y+8,(e.lw+16)*tf,4);
  }else if(e.maxHp>1)for(let j=0;j<e.maxHp;j++){c.fillStyle=j<e.hp?'#ff6aff':'#3a2a50';c.fillRect((ex-(e.maxHp-1)*6+j*12-3)|0,(ey-e.r-11)|0,6,6)}
 }
}
function drawBeams(c){
 c.lineCap='round';c.lineJoin='round';
 for(let n=0;n<G.beams.length;n++){
  const b=G.beams[n],a=b.life/b.max;
  c.beginPath();c.moveTo(b.x1,b.y1);
  if(b.zig){for(let i=1;i<9;i++){const k=i/9;c.lineTo(b.x1+(b.x2-b.x1)*k+rand(-15,15),b.y1+(b.y2-b.y1)*k+rand(-15,15))}}
  c.lineTo(b.x2,b.y2);
  // feixe duplo de neon em camadas (sem shadowBlur): aura larga → corpo colorido → núcleo branco
  c.strokeStyle=b.col;c.globalAlpha=.16*a;c.lineWidth=(b.meteor?46:40)*a+8;c.stroke();
  c.globalAlpha=.32*a;c.lineWidth=(b.meteor?26:22)*a+5;c.stroke();
  c.globalAlpha=.95*a;c.lineWidth=(b.meteor?14:11)*a+3;c.stroke();
  c.strokeStyle='#ffffff';c.globalAlpha=a;c.lineWidth=4.5*a+1.5;c.stroke();c.globalAlpha=1;
  if(PERF.hq&&!b.zig){
   const dx=b.x2-b.x1,dy=b.y2-b.y1,len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len,N=28,turns=len/55;
   for(let s=-1;s<=1;s+=2){c.beginPath();for(let i=0;i<=N;i++){const k=i/N,o=Math.sin(k*turns*6.283+T*26*s)*(b.meteor?14:10)*a*Math.min(1,k*6)*s;c.lineTo(b.x1+dx*k+nx*o,b.y1+dy*k+ny*o)}
    c.strokeStyle=s>0?b.col:'#ffffff';c.globalAlpha=(s>0?.9:.85)*a;c.lineWidth=2.4*a+.6;c.stroke();c.globalAlpha=1}
  }
  const R=(40*a+12)|0;c.drawImage(glowSprite(b.col),(b.x2-R)|0,(b.y2-R)|0,R*2,R*2);
  if(!b.meteor){const r2=(30*a+8)|0;c.drawImage(glowSprite(b.col),(b.x1-r2)|0,(b.y1-r2)|0,r2*2,r2*2)}
 }
}
function drawParts(c,smoke){
 const ps=G.parts;
 for(let i=0;i<ps.length;i++){
  const p=ps[i];if((p.type===PT.SMOKE)!==smoke)continue;
  const a=p.life/p.max;
  switch(p.type){
   case PT.SMOKE:c.globalAlpha=.3*a*Math.min(1,(p.max-p.life)*6);c.fillStyle=p.col;c.beginPath();c.arc(p.x,p.y,p.s,0,6.283);c.fill();break;
   case PT.SHARD:{const s=p.s,cs=Math.cos(p.rot),sn=Math.sin(p.rot);c.globalAlpha=a;c.fillStyle=p.col;c.beginPath();
    c.moveTo(p.x+(-s)*cs-(-s*.5)*sn,p.y+(-s)*sn+(-s*.5)*cs);c.lineTo(p.x+s*cs-(-s*.2)*sn,p.y+s*sn+(-s*.2)*cs);c.lineTo(p.x+(-s*.2)*cs-s*sn,p.y+(-s*.2)*sn+s*cs);c.fill();break}
   case PT.STAR:{const d=(p.s*6.5)|0;c.globalAlpha=a;c.drawImage(starSprite(p.col),(p.x-d/2)|0,(p.y-d/2)|0,d,d);break}
   case PT.BUBBLE:c.globalAlpha=a*.8;c.strokeStyle=p.col;c.lineWidth=1.2;c.beginPath();c.arc(p.x,p.y,p.s,0,6.283);c.stroke();break;
   default:{const d=(p.s*7)|0;c.globalAlpha=a;c.drawImage(glowSprite(p.col),(p.x-d/2)|0,(p.y-d/2)|0,d,d)}
  }
 }
 c.globalAlpha=1;
}
function drawFx(c){
 c.globalCompositeOperation='lighter';
 for(let i=0;i<G.lights.length;i++){const l=G.lights[i],R=l.R|0;c.globalAlpha=l.life/l.max;c.drawImage(softGlow(l.col),(l.x-R)|0,(l.y-R)|0,R*2,R*2)}
 c.globalAlpha=1;
 for(let i=0;i<G.rings.length;i++){const r=G.rings[i],a=r.life/r.max,rad=Math.max(1,r.r+(r.R-r.r)*(1-a));
  c.strokeStyle=r.col;c.globalAlpha=.3*a;c.lineWidth=9;c.beginPath();c.arc(r.x,r.y,rad,0,6.283);c.stroke();c.globalAlpha=a;c.lineWidth=3;c.stroke();c.globalAlpha=1}
 drawBeams(c);drawParts(c,false);
 c.globalCompositeOperation='source-over';
}
function drawTexts(c){
 c.textAlign='center';c.lineJoin='round';
 for(let i=0;i<G.texts.length;i++){const o=G.texts[i];c.globalAlpha=Math.min(1,o.life*1.5);c.font=o.font;c.strokeStyle='rgba(6,8,24,.85)';c.lineWidth=4;c.strokeText(o.txt,o.x|0,o.y|0);c.fillStyle=o.col;c.fillText(o.txt,o.x|0,o.y|0)}
 c.globalAlpha=1;c.textAlign='left';
}
function draw(dt){
 const c=ctx;if(themeIdx<0)renderBg(BIOMES[currentBiome].themes[0]);
 if(!G&&state==='menu'){drawMenuScene(c,dt);drawFpsBadge(c);return} // menu vivo (js/core/menu.js)
 const ch=G?G.ch:CHARS[selected],col=G?G.col:spellColor(ch);
 c.save();
 if(G&&G.shake>0)c.translate(rand(-1,1)*G.shake*14|0,rand(-1,1)*G.shake*14|0);
 drawBackground(c,dt);
 if(G&&G.mode==='duel'){
  drawDuel(c,col);c.restore();
  if(G.flash>0){c.globalCompositeOperation='lighter';c.fillStyle=hexA(G.flashCol,Math.min(.45,G.flash*.5));c.fillRect(0,0,W,H);c.globalCompositeOperation='source-over'}
  drawDuelHUD(c);drawFpsBadge(c);return}
 if(G)drawParts(c,true);
 if(G)drawEnemies(c);
 drawTowerAndMage(c,ch,col);
 if(G){drawFx(c);drawLabels(c);drawTexts(c)}
 c.restore();
 if(G){
  if(G.flash>0){c.globalCompositeOperation='lighter';c.fillStyle=hexA(G.flashCol,Math.min(.45,G.flash*.5));c.fillRect(0,0,W,H);c.globalCompositeOperation='source-over'}
  drawHUD(c);
  if(G.banner>0){
   const a=Math.min(1,G.banner,(2.6-G.banner)*3);c.globalAlpha=a;c.textAlign='center';c.lineJoin='round';
   c.font='900 46px Cinzel';c.strokeStyle='rgba(60,30,0,.7)';c.lineWidth=8;c.strokeText(t('hud.wave')+' '+G.wave,TX,H/2-90);c.fillStyle='#ffd98a';c.fillText(t('hud.wave')+' '+G.wave,TX,H/2-90);
   c.font='700 16px Nunito';c.fillStyle='#c6cde8';c.fillText(G.boss?t('hud.bossWarn'):G.wave===4?t('hud.stageMedium'):G.wave===8?t('hud.stageHard'):t('biomes.'+BIOMES[G.biome].id+'.name').toUpperCase(),TX,H/2-60);
   c.globalAlpha=1;c.textAlign='left';
  }
 }
 drawFpsBadge(c);
}
function drawFpsBadge(c){if(!PERF.showFps)return;c.font='800 11px Nunito';c.fillStyle='rgba(0,0,0,.6)';c.fillRect(W-74,H-22,66,16);c.fillStyle=PERF.fps>=55?'#4dffa0':PERF.fps>=40?'#ffd24a':'#ff5a7a';c.fillText(PERF.fps+' FPS '+(PERF.hq?'HQ':'LITE'),W-70,H-10)}

// ================== LOOP (passo fixo 60 Hz + interpolação + pausa em segundo plano) ==================
const STEP=1/60,MAX_STEPS=4;
let physAcc=0,lastT=0,rafId=0,uiT=0,sideT=0,pausedFrame=false;
// teclado virtual e medidores só aparecem durante a partida; no menu/fim de jogo o canvas ganha o espaço
let chromeMenu=null;
let chromePlay=null;const appEl=document.getElementById('app'),panelEl=document.querySelector('.gamepanel');
function syncChrome(){const m=state==='menu'||state==='over',p=state==='play';if(m!==chromeMenu){chromeMenu=m;panelEl.classList.toggle('menu-mode',m)}if(p!==chromePlay){chromePlay=p;appEl.classList.toggle('playing',p)}}
function loop(now){
 rafId=requestAnimationFrame(loop);syncChrome();
 let dt=(now-lastT)/1000;lastT=now;
 if(!(dt>0))dt=0;if(dt>.1)dt=.1; // trava contra saltos (aba voltou, travada do sistema)
 T+=dt;perfSample(dt);
 if(state==='play'){
  physAcc+=dt;let n=0;
  while(physAcc>=STEP&&n<MAX_STEPS&&state==='play'){(G.mode==='duel'?duelUpdate:update)(STEP);physAcc-=STEP;n++}
  if(n===MAX_STEPS)physAcc=0;
  ALPHA=physAcc/STEP;
 }else{physAcc=0;ALPHA=1}
 // pausado: o quadro fica congelado sob o vidro desfocado → não redesenha (o blur do CSS fica barato)
 if(state!=='paused'||!pausedFrame)draw(dt);
 pausedFrame=state==='paused';
 uiT+=dt;if(uiT>.1){uiT=0;updateUI()}
 if(state!=='play'){sideT+=dt;if(sideT>1/15){sideT=0;drawSide()}} // painéis animados só fora da partida (15 Hz)
}
function startLoop(){if(rafId)return;lastT=performance.now();rafId=requestAnimationFrame(loop)}
function stopLoop(){if(rafId){cancelAnimationFrame(rafId);rafId=0}}
