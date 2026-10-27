// Mage Animals — js/systems/combat.js · ⚔️ Camadas do loop do ARCADE (chamadas por js/core/game.js nos pontos certos).
//  1. Sobrecarga Arcana — sequência de palavras PERFEITAS (sem nenhum erro nem ⌫). 5+ seguidas = pontos e Aura ×2,
//     borda da tela pulsando (css/game.css .stage.overload) e trilha no máximo. Qualquer erro ou ⌫ zera na hora.
//     (É um contador separado do combo: o combo/multiplicador e a passiva da Coruja continuam iguais.)
//  2. Feitiços de emergência — custam mana e têm recarga: ❄️ Congelar (Espaço) paralisa tudo por 4 s;
//     💥 Explosão Arcana (Enter) elimina o inimigo mais perigoso e atinge quem está em volta. Substituem os Meteoros.
//  3. Inimigos táticos — 🛡️ Escudeiro (2 palavras: a 1ª quebra o escudo), 👻 Camuflado (a palavra some e volta),
//     🔮 Invocador (fica no fundo criando lacaios até ser destruído).
//  4. Ritmo — mini-chefe a cada 5 ondas (uma FRASE: 3+ palavras em sequência, ritmo um pouco mais lento) e, ao
//     vencê-lo, 15 s de 💎 Chuva de Cristais (sem dano na torre; cada cristal vale Aura).
// Desempenho: só números e flags por inimigo (objetos do pool), nada é alocado por quadro.
'use strict';

const ARC={
 OVER_AT:5,OVER_MUL:2,
 FREEZE_COST:60,FREEZE_T:4,FREEZE_CD:10,
 BLAST_COST:45,BLAST_CD:6,BLAST_R:95,WIPE_ZONE:.6, // 💥 Arcana = limpeza de pânico: estilhaça quem já passou de 60% do caminho
 // 🚨 tensão por proximidade: progresso = 1 − distância/distância inicial até a torre
 DANGER_AT:.8,CLUTCH_AT:.9,CLUTCH_PTS:100,CLUTCH_SLOW:.22,
 // ⚡ Relâmpagos (rushers): palavras curtíssimas, velocidade ~dobrada
 RUSH_FROM:3,RUSH_P:.13,RUSH_SPD:1.9,RUSH_SPD_MOBILE:1.6,
 // ritmo geral do arcade (mais spawns, passo um pouco mais rápido)
 PACE_SPD:1.08,PACE_GAP:.86,
 SHIELD_FROM:4,SHIELD_P:.14,
 CAM_FROM:6,CAM_ON:1.7,CAM_OFF:1.1,
 SUMMON_FROM:7,SUMMON_P:.1,SUMMON_EVERY:3.6,SUMMON_Y:150,MINION_MAX:3,
 BOSS_EVERY:5,BOSS_SLOW:.88,BOSS_GAP:1.18,
 BONUS_T:15,BONUS_AURA:2,BONUS_GAP:.42,BONUS_MAX:7, // ~25–30 cristais por Chuva → ~50–110 de Aura (construir a Mina custa 120)
 GOLD_P:.05,GOLD_MUL:10,GOLD_SPD:1.4,                 // 🌟 cristal dourado: raro (no máx. 1 por Chuva), mais rápido, vale 10×
 STOP:.045,STOP_BOSS:.11,STOP_GOLD:.09,               // ⏸️ pausa no golpe (hit-stop): o mundo congela um instante ao derrotar
 NOTE_MILE:25,                                        // 🎵 a cada 25 letras certas seguidas: marco na tela
 NEM_FROM:3,NEM_P:.12,NEM_MIN:2,NEM_MASTER:3,NEM_AURA:3,DOM_AURA:10, // 😈 nêmesis (js/systems/meta.js)
 WORD_AURA:0 // Aura só vem da Chuva de Cristais e do mini-chefe (a Sobrecarga dobra as duas)
};
const arcOn=()=>!!(G&&G.mode==='arcade');
const ARC_GEMS=['#ff8ad8','#8ad8ff','#ffd24a','#9be07a','#c9a6ff','#ffb35a']; // paleta fixa: os brilhos ficam em cache por cor
const ARC_GOLD='#fff1a8';

// ---------- 1. Sobrecarga Arcana ----------
function arcWordDone(){
 if(!arcOn())return;G.streak++;
 if(!G.over&&G.streak>=arcOverAt()){
  G.over=true;setOverloadFx(true);G.overN++;
  floatTxt(TX,TTOP-170,t('arc.overload'),'#ffd24a',30);addRing(TX,TTOP-60,10,200,.6,'#ffd24a');G.flash=Math.max(G.flash,.35);G.flashCol='#ffd24a';
  [659,880,1175,1568].forEach((f,i)=>snd(f,.16,'triangle',.05,0,i*.06));MUS.heat=1;
 }
}
// erro de letra ou ⌫ com palavra começada: a sequência perfeita acaba
function arcBreak(){
 if(!arcOn())return;
 if(G.over){floatTxt(TX,TTOP-150,t('arc.overloadLost'),'#ff8a7a',20);snd(330,.25,'sawtooth',.05,140);wizMiss()} // 🎭 quebra da Sobrecarga: engasgo do mago
 G.streak=0;G.over=false;setOverloadFx(false);
}
function setOverloadFx(on){const s=document.querySelector('.stage');if(s)s.classList.toggle('overload',!!on)}
const arcMul=()=>G&&G.over?ARC.OVER_MUL:1;
/** Aura ganha na partida (creditada no fim, em finishMatch) */
function arcAura(n,x,y){if(!arcOn()||n<=0)return;const v=Math.round(n*arcAuraMul());G.aura+=v;if(x!=null)floatTxt(x,y,'+'+v+' ✨','#c9a6ff',17)}
const arcAuraMul=()=>arcMul()*(1+.5*bl('greed')); // ✨ Sobrecarga ×2 · bênção Ganância +50% cada

// ---------- 2. Feitiços de emergência ----------
function arcCanCast(id){if(!arcOn()||state!=='play'||!G.enemies.length||G.bonus>0||G.blessing)return false;return id==='freeze'?G.mana>=arcCost('freeze')&&G.cdF<=0&&G.frozen<=0:G.mana>=arcCost('blast')&&G.cdB<=0}
function arcFreeze(){
 if(!arcCanCast('freeze')){arcDeny();return}questAdd('spells',1);
 G.mana-=arcCost('freeze');G.frozen=ARC.FREEZE_T;G.cdF=ARC.FREEZE_CD*arcCdMul();setFrozenFx(true);wizFreeze(); // 🎭 finca o cajado + pulso de gelo
 for(let i=0;i<G.enemies.length;i++){const e=G.enemies[i];addRing(e.x,e.y,e.r*.6,e.r*2,.5,'#aef0ff');burst(e.x,e.y,'#dff8ff',8,140)}
 G.flash=.4;G.flashCol='#aef0ff';floatTxt(TX,TTOP-160,t('arc.frozen'),'#bff4ff',28);
 snd(1760,.5,'sine',.05,880);snd(1320,.4,'triangle',.04,660,.06);
}
// o "mais perigoso": o mais perto da torre, com peso para Invocadores e chefes
function arcDanger(e){return e.y+(e.summ?170:0)+(e.kind==='boss'?90:0)}
// 💥 Arcana — limpeza de pânico: estilhaça TODOS os que já estão perto da torre (o chefe perde 1 palavra, escudos quebram).
//  Ninguém perto ainda? Atinge o mais perigoso (e quem estiver em volta dele).
function arcBlast(){
 if(!arcCanCast('blast')){arcDeny();return}questAdd('spells',1);
 const hit=[];for(let i=0;i<G.enemies.length;i++){const e=G.enemies[i];if(!e.gem&&(e.prog||0)>=ARC.WIPE_ZONE)hit.push(e)}
 if(!hit.length){let tg=null;for(let i=0;i<G.enemies.length;i++){const e=G.enemies[i];if(!e.gem&&(!tg||arcDanger(e)>arcDanger(tg)))tg=e}
  if(!tg){arcDeny();return}hit.push(tg);for(let i=0;i<G.enemies.length;i++){const o=G.enemies[i];if(o!==tg&&!o.gem&&Math.hypot(o.x-tg.x,o.y-tg.y)<ARC.BLAST_R)hit.push(o)}}
 G.mana-=arcCost('blast');G.cdB=ARC.BLAST_CD*arcCdMul();wizArcana(); // 🎭 postura de poder com as duas patas + clarão branco
 const tp=staffTip(1);castGlow=1;addRing(TX,TTOP-40,20,260,.6,'#ff7ad0');addRing(TX,TTOP-40,10,180,.45,'#ffffff');
 for(const e of hit){addBeam(tp.x,tp.y,e.x,e.y,'#ff9ad8',.45,true);addRing(e.x,e.y,6,e.r*2.4,.4,'#ff7ad0')}
 G.shake=.7;G.flash=.45;G.flashCol='#ff7ad0';floatTxt(TX,TTOP-160,t('arc.blast'),'#ffb0e8',26);snd(160,.6,'sawtooth',.07,50);snd(900,.35,'triangle',.05,200,.04);
 for(const e of hit)if(G.enemies.includes(e))damage(e,e.kind==='boss'?1:99,false);
}
function arcDeny(){snd(180,.1,'square',.03);shakeInput()}
function setFrozenFx(on){const s=document.querySelector('.stage');if(s)s.classList.toggle('frozen',!!on)}

// ---------- 3. Inimigos táticos (marcas aplicadas no spawn; o pool reaproveita objetos, então tudo é zerado aqui) ----------
function arcDecorate(e){
 e.shield=0;e.cam=false;e.summ=false;e.minion=false;e.gem=false;e.phrase=null;e.pi=0;e.sT=0;e.hold=false;e.gc='';e.hid=false;e.phRest='';
 e.rush=false;e.prog=0;e.crit=false;e.lastErr='';e.final=false;e.gold=false;e.nem=false;
 if(!arcOn()||G.song)return; // 🎵 Ritmo do Bardo: sem escudeiro/invocador/relâmpago (cada inimigo é uma nota da música)
 const w=G.wave,r=Math.random();
 if(G.bonus>0){e.gem=true;e.gc=ARC_GEMS[(Math.random()*ARC_GEMS.length)|0];e.hp=e.maxHp=1;
  if(!G.goldOut&&G.bonus<ARC.BONUS_T-2&&Math.random()<ARC.GOLD_P){e.gold=true;e.gc=ARC_GOLD;G.goldOut=true} // 🌟 no máx. 1 por Chuva (nunca logo no início)
  return}
 if(e.kind==='rock'&&w>=ARC.SHIELD_FROM&&r<ARC.SHIELD_P)e.shield=1;
 else if(e.kind==='rock'&&w>=ARC.RUSH_FROM&&Math.random()<ARC.RUSH_P&&!G.bossWave)e.rush=true; // ⚡ Relâmpago: palavra curtíssima, entra correndo
 if(e.kind==='ghost'&&w>=ARC.CAM_FROM&&!G.runes)e.cam=true;
 if(e.kind==='crystal'&&w>=ARC.SUMMON_FROM&&r<ARC.SUMMON_P&&!G.enemies.some(o=>o.summ)){e.summ=true;e.sT=ARC.SUMMON_EVERY*.6;e.hp=e.maxHp=3}
 // mini-chefe: uma FRASE (cada vida é uma palavra, em ordem; a lista inteira aparece no selo)
 if(e.kind==='boss'&&!G.runes&&!G.letters){const n=e.hp,list=[];e.phrase=null;for(let i=0;i<n;i++){setWord(e);list.push(e.word)}e.phrase=list;e.pi=0}
}
function arcSpawnMinion(s){
 if(G.enemies.length>=maxOnScreen(G.wave)+2)return;
 let n=0;for(let i=0;i<G.enemies.length;i++)if(G.enemies[i].minion)n++;if(n>=ARC.MINION_MAX)return;
 const d=ENEMY.rock,e=ENEMY_POOL.get();
 e.kind='rock';e.art=BIOMES[G.biome].art.rock;e.v=(Math.random()*3)|0;e.x=e.px=Math.max(30,Math.min(W-30,s.x+rand(-50,50)));e.y=e.py=s.y+14;
 e.age=PORTAL_T*.4;e.r=Math.round(d.r*.72);e.hp=e.maxHp=1;e.mercy=0;e.t=Math.random()*9;e.flash=0;e.boost=0;e.vx=e.vy=0;e.latT=0;e.latF=1;e.latA=0;e.slowF=1.1;
 arcDecorate(e);e.minion=true;e.d0=Math.hypot(TX-e.x,TTOP-30-e.y)||400;setWord(e);G.enemies.push(e);
 addRing(s.x,s.y,6,s.r*2.2,.45,'#c9a6ff');snd(520,.12,'triangle',.04,780);
}
// Invocador: desce até o fundo do campo e fica lá criando lacaios
function arcEnemyTick(e,dt){
 if(!e.summ)return false;
 if(e.y>=ARC.SUMMON_Y){e.hold=true;e.vx=e.vy=0;e.x+=Math.sin(e.t*1.4)*12*dt;e.sT-=dt;if(e.sT<=0){e.sT=ARC.SUMMON_EVERY;arcSpawnMinion(e)}return true}
 return false;
}
// 👻 camuflagem: visível CAM_ON s, escondida CAM_OFF s (a parte já digitada continua visível)
const arcHidden=e=>e.cam&&e.age>PORTAL_T&&(e.t%(ARC.CAM_ON+ARC.CAM_OFF))>ARC.CAM_ON;

// ---------- 🚨 Tensão por proximidade ----------
// chamado 1× por passo depois de mover os inimigos: maior progresso entre os perigosos → vinheta vermelha + batimento
function arcTension(dt){
 let mx=0;for(let i=0;i<G.enemies.length;i++){const e=G.enemies[i];if(e.gem)continue;e.crit=e.prog>=ARC.DANGER_AT;if(e.prog>mx)mx=e.prog}
 G.danger=mx;const lvl=mx>=ARC.CLUTCH_AT?2:mx>=ARC.DANGER_AT?1:0;
 if(lvl!==G.dangerLvl){G.dangerLvl=lvl;setDangerFx(lvl)}
 if(lvl){G.hbT-=dt;if(G.hbT<=0){G.hbT=lvl===2?.42:.7;snd(58,.16,'sine',.09,38);snd(70,.12,'sine',.06,45,.13)}}else G.hbT=0; // tum-tum
}
let _dangerEl=null;
function setDangerFx(lvl){
 if(!_dangerEl){const s=document.querySelector('.stage');if(!s)return;_dangerEl=document.createElement('i');_dangerEl.className='arc-danger';_dangerEl.setAttribute('aria-hidden','true');s.appendChild(_dangerEl)}
 _dangerEl.className='arc-danger'+(lvl?' on l'+lvl:'');
}
// 😮‍💨 alívio de último instante: palavra completada com o inimigo a um passo da torre
function arcClutch(e){
 if(!arcOn()||(e.prog||0)<ARC.CLUTCH_AT||e.gem)return;
 G.clutch++;G.slowmo=.32;G.shake=Math.max(G.shake,.55);G.flash=Math.max(G.flash,.5);G.flashCol='#fff3c0';
 const pts=Math.round(ARC.CLUTCH_PTS*arcMul()*(1+2*bl('clutch')));G.score+=pts;
 if(bl('clutch'))G.mana=Math.min(100,G.mana+25*bl('clutch')); // 🎴 bênção Sangue-frio: o alívio também devolve mana
 floatTxt(e.x,e.y-e.r-44,t('arc.clutch'),'#fff3a0',26);floatTxt(e.x,e.y-e.r-20,'+'+pts,'#ffd98a',18);
 addRing(e.x,e.y,8,150,.5,'#fff3a0');addRing(TX,TTOP-40,30,220,.55,'#ffd98a');
 [1568,2093,2637,3136].forEach((f,i)=>snd(f,.12,'square',.035,0,i*.045));snd(1046,.4,'triangle',.05,2093,.05); // agudo, rápido e estridente
}
// 💀 derrota clara: guarda a palavra que derrubou a torre (o que faltou e o último erro nela)
function arcFinalHit(e){
 e.final=true;G.lastHit={word:e.word,typed:G.target===e?e.typed:e.typed,err:e.lastErr||'',runes:!!G.runes};
}

// ---------- HUD das camadas (desenhado por cima de tudo; poucos retângulos e textos por quadro) ----------
// gradientes do selo (fundo de vidro + moldura dourada), criados uma vez por selo: a posição é fixa
const _chipG={};
function chipGrads(c,id,x,y,w,h){
 let o=_chipG[id];if(o)return o;o=_chipG[id]={};
 o.bg=c.createLinearGradient(0,y,0,y+h);o.bg.addColorStop(0,'rgba(26,30,70,.9)');o.bg.addColorStop(1,'rgba(6,8,26,.92)');
 o.gold=c.createLinearGradient(x,y,x+w,y+h);o.gold.addColorStop(0,'#f6e6c4');o.gold.addColorStop(.35,'#b99f7d');o.gold.addColorStop(.65,'#6a5638');o.gold.addColorStop(1,'#e9d8bc');
 return o;
}
function arcSpellChip(c,x,y,id){
 const fr=id==='freeze',cost=arcCost(id),cd=fr?G.cdF:G.cdB,cdMax=(fr?ARC.FREEZE_CD:ARC.BLAST_CD)*arcCdMul(),ready=arcCanCast(id),w=150,h=42;
 const f=cd>0?1-cd/cdMax:Math.min(1,G.mana/cost),col=fr?'#aef0ff':'#ff9ad8';
 const SG=chipGrads(c,id,x,y,w,h);
 c.fillStyle='rgba(0,0,0,.45)';c.beginPath();c.roundRect(x+1,y+4,w,h,10);c.fill();                                   // sombra funda
 c.fillStyle=SG.bg;c.beginPath();c.roundRect(x,y,w,h,10);c.fill();
 c.strokeStyle=SG.gold;c.lineWidth=1.6;c.stroke();                                                                     // ✨ moldura em gradiente dourado
 if(ready){c.strokeStyle=col;c.lineWidth=1.2;c.globalAlpha=.75;c.beginPath();c.roundRect(x+2.5,y+2.5,w-5,h-5,8);c.stroke();c.globalAlpha=1}
 c.fillStyle='rgba(255,240,210,.07)';c.fillRect(x+8,y+1.5,w-16,1);                                                    // brilho do vidro no topo
 if(ready){c.globalAlpha=.16+.12*Math.sin(T*5);c.fillStyle=col;c.beginPath();c.roundRect(x,y,w,h,10);c.fill();c.globalAlpha=1}
 c.fillStyle='rgba(255,255,255,.08)';c.fillRect(x+9,y+h-8,w-18,3);c.fillStyle=cd>0?'#5a6aa8':ready?col:'#4a5a9a';c.fillRect(x+9,y+h-8,(w-18)*f,3);
 // linha 1: feitiço · linha 2: tecla e custo (ou a recarga)
 c.font='900 12.5px Nunito';c.fillStyle=ready?'#ffffff':'#aab4dc';c.fillText((fr?'❄️ ':'💥 ')+t(fr?'arc.freezeName':'arc.blastName'),x+9,y+16);
 c.font='800 10px Nunito';c.fillStyle=ready?'#ffd98a':'#8f9ac4';c.fillText(cd>0?'⏳ '+Math.ceil(cd)+'s':t(fr?'arc.keySpace':'arc.keyEnter')+' · '+cost+' '+t('village.mana').toLowerCase(),x+9,y+29);
}
function arcDrawHud(c){
 if(!arcOn())return;
 c.textAlign='center';c.lineJoin='round';
 if(G.bonus>0&&G.banner<1.6){const txt=t('arc.bonusHud',{s:Math.ceil(G.bonus),n:G.bonusAura});c.font='900 15px Nunito';const w=c.measureText(txt).width+28;
  c.fillStyle='rgba(40,14,70,.85)';c.strokeStyle='#e6c6ff';c.lineWidth=1.5;c.beginPath();c.roundRect(TX-w/2,112,w,28,14);c.fill();c.stroke();c.fillStyle='#fff';c.fillText(txt,TX,131)}
 if(G.frozen>0){c.font='900 18px Nunito';c.strokeStyle='rgba(6,8,24,.85)';c.lineWidth=4;const tx='❄️ '+G.frozen.toFixed(1)+'s';c.strokeText(tx,TX,132);c.fillStyle='#d8f8ff';c.fillText(tx,TX,132)}
 c.textAlign='left';
 if(!DeviceManager.isMobile&&G.bonus<=0){arcSpellChip(c,12,H-54,'freeze');arcSpellChip(c,W-162,H-54,'blast')} // no celular: botões na barra de ações
 if(G.blTxt){const mob=DeviceManager.isMobile,y=mob?150:H-64;c.font='800 13px Nunito';c.strokeStyle='rgba(6,8,24,.85)';c.lineWidth=4;c.strokeText(G.blTxt,12,y);c.fillStyle='#ffe9a8';c.fillText(G.blTxt,12,y)} // 🎴 bênçãos ativas
}

// 🖱️ PC: os selos dos feitiços nos cantos do campo também são clicáveis (captura antes do desenho de runas)
const ARC_CHIPS={freeze:[12,-54,150,42],blast:[-162,-54,150,42]};
addEventListener('load',()=>{const st=document.querySelector('.stage'),cv=$('game');if(!st||!cv)return;
 st.addEventListener('pointerdown',ev=>{
  if(!arcOn()||state!=='play'||DeviceManager.isMobile)return;
  const r=cv.getBoundingClientRect(),x=(ev.clientX-r.left)/r.width*W,y=(ev.clientY-r.top)/r.height*H;
  for(const id in ARC_CHIPS){const[cx,cy,w,h]=ARC_CHIPS[id],X=cx<0?W+cx:cx,Y=cy<0?H+cy:cy;
   if(x>=X&&x<=X+w&&y>=Y&&y<=Y+h){ev.preventDefault();ev.stopPropagation();id==='freeze'?arcFreeze():arcBlast();return}}
 },true);
});

// ---------- 4. Mini-chefe e Chuva de Cristais ----------
function arcBonusStart(){
 G.bonus=ARC.BONUS_T;G.bonusDone=true;G.bonusAura=0;G.goldOut=false;G.spawnT=.6;G.banner=2.6;G.bannerTxt=t('arc.bonus');G.bannerSub=t('arc.bonusSub');
 MUS.heat=1;[784,988,1175,1568,1976].forEach((f,i)=>snd(f,.14,'triangle',.045,0,i*.07));
}
function arcBonusUpdate(dt){
 G.bonus-=dt;
 if(G.bonus>0){G.spawnT-=dt;if(G.spawnT<=0&&G.enemies.length<ARC.BONUS_MAX){spawn('crystal');G.spawnT=ARC.BONUS_GAP*rand(.7,1.3)}return}
 // fim: os cristais que sobraram se desfazem sem dano e a próxima onda começa
 for(let i=G.enemies.length-1;i>=0;i--){const e=G.enemies[i];burst(e.x,e.y,e.gc||'#ffffff',8,160);releaseEnemy(e)}
 G.bonus=0;floatTxt(TX,TTOP-170,t('arc.bonusEnd',{n:G.bonusAura}),'#e6c6ff',26);G.clearT=0;nextWave();
}
// 💎/🌟 cristal da Chuva estilhaçado: Aura na hora (o dourado vale 10× e para o mundo por um instante)
function arcGemDown(e,x,y,r){
 const v=Math.round(ARC.BONUS_AURA*(e.gold?ARC.GOLD_MUL:1)*arcAuraMul());G.aura+=v;G.bonusAura+=v;
 if(!e.gold){floatTxt(x,y-r-22,'+'+v+' ✨','#e6c6ff',18);return}
 floatTxt(x,y-r-48,t('arc.gold'),'#fff1a8',26);floatTxt(x,y-r-22,'+'+v+' ✨','#ffe27a',24);
 G.hitStop=Math.max(G.hitStop,ARC.STOP_GOLD);G.flash=Math.max(G.flash,.55);G.flashCol='#fff1a8';G.shake=Math.max(G.shake,.35);
 addRing(x,y,8,170,.6,'#fff1a8');addRing(x,y,4,110,.45,'#ffffff');starBurst(x,y,'#ffe27a',26,260,40);
 [1319,1568,1976,2637,3136].forEach((f,i)=>snd(f,.18,'triangle',.05,0,i*.05)); // tilintar de moedas
}

// ---------- 5. 🎴 Bênçãos: ao vencer cada mini-chefe, escolha 1 de 3 (valem até o fim da partida e acumulam) ----------
// Cada partida vira uma "build" diferente. As escolhas são sorteadas entre as que ainda não chegaram ao máximo.
const BLESS=[
 {id:'quick',ic:'⚡',max:2},  // Sobrecarga com 1 palavra perfeita a menos
 {id:'thrift',ic:'💧',max:2}, // feitiços de emergência −30% de mana
 {id:'cool',ic:'⏱️',max:2},   // recargas 40% mais rápidas
 {id:'heart',ic:'❤️',max:3},  // +1 vida máxima (e cura 1)
 {id:'greed',ic:'✨',max:3},  // +50% de Aura
 {id:'slow',ic:'🐌',max:2},   // inimigos 10% mais lentos
 {id:'chain',ic:'🔗',max:1},  // palavras de até 4 letras ricocheteiam no inimigo mais próximo
 {id:'calm',ic:'🧘',max:1},   // um erro só corta o combo pela metade
 {id:'clutch',ic:'🥶',max:2}, // "por um triz" vale ×3 e devolve 25 de mana
 {id:'mana',ic:'🔮',max:2}    // +50% de mana por palavra
];
const bl=id=>G&&G.bl?G.bl[id]|0:0;
const arcOverAt=()=>Math.max(3,ARC.OVER_AT-bl('quick'));
const arcCost=id=>Math.round((id==='freeze'?ARC.FREEZE_COST:ARC.BLAST_COST)*(1-.3*bl('thrift')));
const arcCdMul=()=>Math.pow(.6,bl('cool'));
const blessName=b=>t('bless.'+b.id+'.n'),blessDesc=b=>t('bless.'+b.id+'.d');
function arcBlessOffer(){
 if(G.rng&&Math.random!==G.rng)return withSeed(arcBlessOffer); // 📅 desafio do dia: as mesmas ofertas para todos
 const pool=BLESS.filter(b=>bl(b.id)<b.max),pick=[];
 while(pick.length<3&&pool.length)pick.push(pool.splice((Math.random()*pool.length)|0,1)[0]);
 G.blessDone=true;if(!pick.length)return;
 G.blessing=pick;arcBlessShow();setDangerFx(0);
 [523,659,784,1046,1319].forEach((f,i)=>snd(f,.22,'triangle',.045,0,i*.08));
}
function arcBlessShow(){
 const kb=!DeviceManager.isTouch;document.body.classList.add('blessing'); // celular: o canvas de desenho (#gest) cobre o campo → solta o toque para os cards
 showOverlay(`<div class="blhead"><small>${t('bless.kicker',{n:G.wave})}</small><h2>🎴 ${t('bless.title')}</h2><p>${t('bless.sub')}</p></div>
  <div class="blcards">${G.blessing.map((b,i)=>{const n=bl(b.id);
   const tip=tipCard({ic:b.ic,ac:'#ffd98a',title:esc(blessName(b)),tag:t('bless.tagRun'),desc:esc(blessDesc(b)),
    stats:[['🎴',t('bless.have'),n+' / '+b.max],['⬆️',t('bless.after'),(n+1)+' / '+b.max]],foot:DeviceManager.isTouch?'👆 '+t('bless.tapAgain'):'⌨️ '+t('bless.pressKey',{n:i+1})});
   return`<button class="blcard" style="--d:${(i*.09).toFixed(2)}s" data-tip="${esc(tip)}" onclick="arcBlessTap(${i},this)">
   ${kb?`<kbd>${i+1}</kbd>`:''}<span class="blic">${b.ic}</span><b>${esc(blessName(b))}</b><small>${esc(blessDesc(b))}</small>${n?`<em>${t('bless.stack',{n:n+1})}</em>`:''}<i class="blok">${t('bless.confirm')}</i></button>`}).join('')}</div>
  ${DeviceManager.isTouch?`<p class="small blhint">👆 ${t('bless.touchHint')}</p>`:''}`,'bless');
}
// 📱 toque: 1º toque marca a carta e mostra o tooltip com os detalhes; 2º toque na mesma carta confirma (evita escolha sem querer)
function arcBlessTap(i,el){
 if(!DeviceManager.isTouch||el.classList.contains('armed')){hideTip();arcBlessPick(i);return}
 document.querySelectorAll('.blcard.armed').forEach(c=>c.classList.remove('armed'));el.classList.add('armed');snd(880,.06,'triangle',.035);
}
function blessApply(b){
 G.bl[b.id]=(G.bl[b.id]|0)+1;
 if(b.id==='heart'){G.ch=Object.assign({},G.ch,{lives:G.ch.lives+1});G.lives=Math.min(G.ch.lives,G.lives+1)}
 if(b.id==='mana')G.manaMul*=1.5;
 G.blTxt=BLESS.filter(x=>G.bl[x.id]).map(x=>x.ic+(G.bl[x.id]>1?'×'+G.bl[x.id]:'')).join('  ');
}
function arcBlessPick(i){
 const b=G&&G.blessing&&G.blessing[i];if(!b)return;
 G.blessing=null;blessApply(b);hideOverlay();physAcc=0;document.body.classList.remove('blessing');
 floatTxt(TX,TTOP-175,b.ic+' '+blessName(b),'#ffe9a8',26);addRing(TX,TTOP-60,10,230,.7,'#ffe9a8');starBurst(TX,TTOP-60,'#ffe9a8',24,220,-20);
 G.flash=.4;G.flashCol='#ffe9a8';[784,988,1175,1568].forEach((f,i)=>snd(f,.2,'triangle',.05,0,i*.06));
}
/** 🔗 bênção Corrente: palavra curta completada ricocheteia no inimigo mais próximo */
function arcChain(e){
 if(!bl('chain')||e.nw.length>4)return;
 let best=null,bd=170;for(let i=0;i<G.enemies.length;i++){const o=G.enemies[i];if(o===e||o.gem)continue;const d=Math.hypot(o.x-e.x,o.y-e.y);if(d<bd){bd=d;best=o}}
 if(!best)return;addBeam(e.x,e.y,best.x,best.y,'#9ad8ff',.3,true);snd(1600,.12,'square',.03,800);damage(best,1,false);
}
