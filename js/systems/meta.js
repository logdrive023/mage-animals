// Mage Animals — js/systems/meta.js · 🔁 Motivos para jogar "só mais uma" (progressão entre partidas).
//  1. 📅 Desafio do dia — semente fixa por data (mesmos sorteios de inimigos, palavras e bênçãos para todos) +
//     uma bênção do dia já ativa desde a onda 1. Guarda o melhor do dia e gera um resultado para compartilhar.
//  2. 😈 Nêmesis — palavras que você errou 2+ vezes voltam como inimigos marcados (revanche, +Aura). Acertar 3× seguidas
//     sem erro = 📖 DOMINADA (+Aura, marcada no Dicionário).
//  3. 🏅 Maestria por personagem — XP próprio de cada mago (palavras + ondas + chefes), níveis 1–10 com visuais.
//  4. 🎯 Metas do fim de jogo — o "quase" (recorde, baú, nível) e a barra do próximo desbloqueio mais perto.
// Persistência: mage_daily · mage_nemesis · profile.mastery.
'use strict';

/** troca o Math.random pela semente do desafio do dia só durante fn (sorteios de jogo; partículas continuam livres) */
function withSeed(fn){if(!G||!G.rng)return fn();const r=Math.random;Math.random=G.rng;try{return fn()}finally{Math.random=r}}

const MAST_XP=[0,80,200,380,620,920,1300,1760,2300,2950]; // XP total para chegar a cada nível (1 → 10)
const MAST_PERKS={2:'badge',3:'halo',5:'orbit',7:'trail',10:'crown'};

const Meta={
 pendingDaily:false,ver:0,
 // ---------- início de cada partida do arcade ----------
 initRun(){
  G.mlv=this.mastLv(G.ch.id);
  if(!this.pendingDaily)return;
  this.pendingDaily=false;const day=this.dayKey();
  G.daily={day};G.rng=this.rng(this.hash('mage'+day));G.runes=G.letters=false; // desafio: sempre no estilo Palavras
  const b=this.dailyBless();blessApply(b);
  floatTxt(TX,TTOP-190,'📅 '+t('daily.title'),'#9ae8ff',22);floatTxt(TX,TTOP-165,b.ic+' '+blessName(b),'#ffe9a8',18);
 },

 // ---------- 📅 Desafio do dia ----------
 dayKey(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')},
 hash(s){let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return h>>>0},
 rng(a){return function(){a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}, // mulberry32
 dailyBless(){return BLESS[this.hash('bless'+this.dayKey())%BLESS.length]},
 daily(){const d=StorageManager.read('daily',null);return d&&d.day===this.dayKey()?d:{day:this.dayKey(),best:0,wave:0,tries:0}},
 dailyEnd(r){
  const d=this.daily(),isBest=r.score>d.best;d.tries++;
  if(isBest){d.best=r.score;d.wave=r.wave}
  StorageManager.write('daily',d);
  return{best:d.best,wave:d.wave,tries:d.tries,isBest,share:this.shareText(r)};
 },
 shareText(r){
  const [y,m,dd]=this.dayKey().split('-'),ch=CHARS.find(c=>c.id===r.ch)||CHARS[0],lost=new Set(G.lost),cells=[];
  for(let w=1;w<=r.wave;w++)cells.push(lost.has(w)?'🟥':isBossWave(w)?'👑':'🟩');
  const rows=[];for(let i=0;i<cells.length;i+=10)rows.push(cells.slice(i,i+10).join(''));
  const extra=[r.overN?'⚡'+r.overN:'',r.clutch?'😮‍💨'+r.clutch:'',r.bl||''].filter(Boolean).join('  ');
  return[t('daily.shareHead',{d:dd+'/'+m}),ch.emoji+' '+t('daily.shareLine',{w:r.wave,s:fmtN(r.score),p:r.wpm}),...rows,extra].filter(Boolean).join('\n');
 },
 share(btn){
  const txt=btn&&btn.dataset.share;if(!txt)return;
  const ok=()=>{btn.textContent='✅ '+t('daily.copied');snd(1175,.12,'triangle',.04)};
  try{navigator.clipboard.writeText(txt).then(ok,()=>this._fallbackCopy(txt,ok))}catch(e){this._fallbackCopy(txt,ok)}
 },
 _fallbackCopy(txt,ok){const ta=document.createElement('textarea');ta.value=txt;ta.style.cssText='position:fixed;opacity:0';document.body.appendChild(ta);ta.select();try{document.execCommand('copy');ok()}catch(e){}ta.remove()},

 // ---------- 😈 Nêmesis ----------
 _n:null,_dirty:false,
 book(lang){if(!this._n)this._n=StorageManager.read('nemesis',{})||{};const L=lang||wordLangOf(LANG);return this._n[L]||(this._n[L]={})},
 save(){if(this._dirty&&this._n){StorageManager.write('nemesis',this._n);this._dirty=false}},
 nemOn(){return G&&G.mode==='arcade'&&!G.runes&&!G.letters&&!G.daily}, // o desafio do dia é igual para todos: sem nêmesis
 isNem(o){return!!o&&o.m>=ARC.NEM_MIN&&!o.d},
 nemMiss(e){
  if(!this.nemOn()||e.gem||e.nw.length<3)return;
  const B=this.book(),k=e.nw,o=B[k]||(B[k]={w:e.word,m:0,c:0,d:0});o.m++;o.c=0;o.w=e.word;this._dirty=true;
 },
 /** palavra completada: conta para dominar a nêmesis e dá a recompensa da revanche */
 nemDone(e){
  if(!this.nemOn())return;
  const o=this.book()[e.nw];if(!o)return;
  const clean=!e.lastErr,was=this.isNem(o);
  if(clean)o.c++;else o.c=0;this._dirty=true;
  if(e.nem&&clean){G.nemN++;questAdd('nemesis',1);arcAura(ARC.NEM_AURA,e.x,e.y-e.r-52);floatTxt(e.x,e.y-e.r-74,t('nem.beaten'),'#ff9ae8',18)}
  if(was&&clean&&o.c>=ARC.NEM_MASTER){o.d=1;G.domN++;arcAura(ARC.DOM_AURA,TX,TTOP-150);floatTxt(TX,TTOP-175,t('nem.mastered',{w:e.word.toUpperCase()}),'#fff1a8',22);
   addRing(TX,TTOP-60,8,200,.6,'#fff1a8');[880,1175,1568,2093].forEach((f,i)=>snd(f,.16,'triangle',.045,0,i*.07))}
 },
 /** sorteia uma nêmesis para virar inimigo (sem repetir a inicial de quem está na tela) */
 nemSpawn(){
  if(!this.nemOn()||G.wave<ARC.NEM_FROM||G.bonus>0||Math.random()>=ARC.NEM_P)return null;
  const B=this.book(),list=[];for(const k in B)if(this.isNem(B[k]))list.push(B[k].w);
  for(let n=0;n<4&&list.length;n++){const w=list.splice((Math.random()*list.length)|0,1)[0],f=norm(w)[0];
   if(!G.enemies.some(o=>o.nw[0]===f||o.word===w))return w}
  return null;
 },
 nemState(lang,w){const o=this.book(lang)[norm(w)];return!o?'':o.d?'dom':this.isNem(o)?'nem':''},
 nemCount(lang){const B=this.book(lang);let n=0,d=0;for(const k in B){if(B[k].d)d++;else if(this.isNem(B[k]))n++}return{n,d}},

 // ---------- 🏅 Maestria por personagem ----------
 mastXp(id){return(profile.mastery&&profile.mastery[id])|0},
 mastLv(id){const x=this.mastXp(id);let l=1;while(l<MAST_XP.length&&x>=MAST_XP[l])l++;return l},
 mastInfo(id,x){x=x==null?this.mastXp(id):x;let l=1;while(l<MAST_XP.length&&x>=MAST_XP[l])l++;const a=MAST_XP[l-1],b=MAST_XP[l];return{lv:l,x,a,b:b||a,f:b?(x-a)/(b-a):1,max:!b}},
 /** XP de maestria da partida: palavras + 5 por onda + 20 por chefe */
 mastAdd(id,m){
  const gain=m.words+m.wave*5+m.bosses*20,x0=this.mastXp(id);
  profile.mastery=profile.mastery||{};profile.mastery[id]=x0+gain;
  const A=this.mastInfo(id,x0),B=this.mastInfo(id,x0+gain);if(B.lv!==A.lv)this.ver++; // retratos do celular refeitos
  return{id,gain,x0,A,B};
 },
 perksUpTo(a,b){const out=[];for(let l=a+1;l<=b;l++)if(MAST_PERKS[l])out.push(t('mast.perk.'+MAST_PERKS[l]));return out},

 // ---------- 🎯 Fim de jogo: o "quase" e o próximo desbloqueio ----------
 hook(r){
  const pb=r.prevBest||{score:0,wave:0};
  if(r.record)return'';
  if(pb.score>0&&r.score>=pb.score*.55)return t('goal.nearScore',{n:fmtN(pb.score-r.score),b:fmtN(pb.score)});
  if(r.chests&&r.chests.next&&r.chests.next-r.wave<=2)return t(r.chests.next-r.wave===1?'goal.nearChest1':'goal.nearChest',{n:r.chests.next-r.wave});
  if(pb.wave&&pb.wave-r.wave===1)return t('goal.nearWave',{n:pb.wave});
  const need=xpNeed(profile.level)-profile.xp;if(need<=xpNeed(profile.level)*.3)return t('goal.nearLevel',{n:fmtN(need),l:profile.level+1});
  if(r.mast&&!r.mast.B.max&&r.mast.B.f>=.7)return t('goal.nearMast',{n:r.mast.B.b-r.mast.B.x,l:r.mast.B.lv+1});
  return'';
 },
 /** a meta mais perto de completar (0–1): prédio do Reino, mago bloqueado ou nível */
 nextGoal(r){
  const c=[],aura=profile.aura||0,aura0=Math.max(0,aura-(r.aura||0));
  for(const B of VILLAGE.buildings){if(Village.check(B.id)!=='aura')continue;const cost=Village.cost(B.id);
   c.push({ic:B.ic,lab:t('goal.build',{b:t('village.b.'+B.id+'.name'),l:Village.lv(B.id)+1}),a:aura0,b:aura,max:cost,unit:' ✨'})}
  for(const ch of CHARS){if(!isLocked(ch))continue;const pw=(r.prevBest||best).wave;
   c.push({ic:ch.emoji,lab:t('goal.char',{c:charName(ch)}),a:Math.min(pw,ch.unlock),b:Math.min(best.wave,ch.unlock),max:ch.unlock,unit:' 🌊'})}
  const lv=profile.level,xn=xpNeed(lv),xb=r.lvUps&&r.lvUps.length?0:Math.max(0,profile.xp-r.xp.gain);
  c.push({ic:'⭐',lab:t('goal.level',{l:lv+1}),a:xb,b:profile.xp,max:xn,unit:' XP'});
  c.forEach(o=>o.f=o.b/o.max);
  return c.filter(o=>o.f<1).sort((x,y)=>y.f-x.f)[0]||null;
 }
};
function startDaily(){Meta.pendingDaily=true;if(typeof Quips!=='undefined')Quips.stop();newGame();snd(784,.12,'triangle',.05)}
/** ↻ jogar de novo: repete o tipo da partida (desafio do dia ou arcade normal) */
function playAgain(){if(G&&G.daily)startDaily();else if(G&&G.song&&Rhythm.last)Rhythm.start(Rhythm.last);else{if(typeof Quips!=='undefined')Quips.stop();newGame()}}
const mastLvOf=id=>Meta.mastLv(id);
