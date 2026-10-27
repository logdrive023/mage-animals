// Mage Animals — js/systems/youtube-rhythm.js · 🎵 Ritmo do Bardo (GAME_STYLE 'songs'): digitar no ritmo de uma música.
// Fontes de áudio:
//  · 'drum' — Tambor do Bardo: batida gerada no AudioContext (100% offline, relógio = AC.currentTime, sincronia exata)
//  · 'yt'   — vídeo do YouTube (IFrame API carregada SÓ quando o jogador escolhe uma faixa dessas; precisa de internet e de
//             o jogo estar aberto por http(s): em file:// o YouTube recusa o embed). Relógio = tempo real suavizado em
//             direção a player.getCurrentTime() (lido 4×/s; a API é síncrona mas não precisa ser lida todo quadro).
// Mapa da faixa (chart): notas {t,w} — t em segundos da música; w = palavra opcional (sem w, sai uma palavra do jogo).
//  Gerado pela batida (bpm, offset, 1 palavra a cada N batidas) ou escrito pelo jogador ("12.5 dragão" por linha).
//  Nenhuma letra de música vem com o jogo: as faixas do YouTube são do jogador.
// Cada nota vira um inimigo que nasce SONG_LEAD s antes do tempo dela e só chega na torre SONG_GRACE s depois:
//  terminar a palavra perto do tempo da nota = Perfeito/Ótimo (pontos extras + Aura no fim).
// Integração (js/core/game.js): update → Rhythm.tick · fire → Rhythm.judge · hitTower → Rhythm.missNote ·
//  gameOver → Rhythm.finish · draw → Rhythm.drawHud · pause/resume/clearGame → Rhythm.pause/resume/stop.
'use strict';

const SONG_LEAD=3.4,SONG_GRACE=2.8,SONG_JUDGE={perfect:.45,great:1.1},SONG_PTS={perfect:1.6,great:1.25,ok:1};
const SONG_HIST_MAX=20;
// faixas offline (sempre disponíveis): bpm, duração e palavra a cada N batidas
const SONG_DRUMS=[
 {id:'drum-slow',src:'drum',title:'song.drum.slow',bpm:84,dur:75,every:4,kit:'calm'},
 {id:'drum-march',src:'drum',title:'song.drum.march',bpm:100,dur:100,every:3,kit:'march'},
 {id:'drum-gallop',src:'drum',title:'song.drum.gallop',bpm:126,dur:110,every:3,kit:'gallop'}
];

/** id de 11 caracteres a partir de um link do YouTube (watch, youtu.be, embed, shorts) ou do próprio id */
function ytIdOf(s){
 s=String(s||'').trim();const m=s.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([\w-]{11})/);
 if(m)return m[1];return /^[\w-]{11}$/.test(s)?s:'';
}
/** "12.5 dragão" · "1:02.3 magia" · "75 duas palavras" → notas {t,w}; várias palavras na linha saem a cada 0,6 s */
function parseSongChart(txt){
 const out=[];
 for(const line of String(txt||'').split(/\r?\n/)){
  const m=line.match(/^\s*(?:(\d+):)?(\d+(?:[.,]\d+)?)\s*s?\s+(.+?)\s*$/);if(!m)continue;
  const t0=(m[1]?+m[1]*60:0)+parseFloat(m[2].replace(',','.'));
  const words=m[3].toLowerCase().normalize('NFC').split(/\s+/).map(w=>w.replace(/[^\p{L}]/gu,'').slice(0,14)).filter(Boolean);
  words.forEach((w,i)=>out.push({t:t0+i*.6,w}));
 }
 return out.sort((a,b)=>a.t-b.t);
}
/** notas pela batida: a 1ª entra depois do aviso (SONG_LEAD) e a última termina 2 s antes do fim */
function beatNotes(bpm,offset,every,dur){
 const spb=60/Math.max(30,Math.min(240,bpm)),step=spb*Math.max(1,every),out=[];
 for(let t=offset;t<dur-2;t+=step)if(t>=SONG_LEAD+.6)out.push({t,w:''});
 return out;
}
// 🎼 Modo automático ("só colar o link"): duração máxima jogada de um vídeo longo (a partida termina aqui, com o resultado normal)
const SONG_AUTO_BPM=120,SONG_MAX=480;
/** gerador automático de notas (zero configuração): grade de 120 BPM e densidade que cresce ao longo da faixa —
 *  aquecimento (1 palavra a cada 5 tempos) → miolo (4) → final (3) — com um respiro de 4 tempos a cada 12 palavras.
 *  As palavras saem do banco do jogo na hora do spawn (vocabulário pela "onda" = progresso da faixa). */
function generateSongBeats(dur,bpm){
 const spb=60/(bpm||SONG_AUTO_BPM),end=Math.min(dur,SONG_MAX)-2.5,out=[];
 let t=Math.ceil((SONG_LEAD+.6)/spb)*spb;const start=t;
 while(t<end){
  out.push({t:+t.toFixed(3),w:''});
  const k=(t-start)/Math.max(1,end-start),beats=k<.15?5:k<.55?4:3;
  t+=beats*spb+(out.length%12===0?4*spb:0);
 }
 return out;
}

// ---------- YouTube IFrame API (carregamento sob demanda, uma vez) ----------
let _ytP=null;
function ytLoad(){
 if(window.YT&&YT.Player)return Promise.resolve();
 if(_ytP)return _ytP;
 _ytP=new Promise((res,rej)=>{
  const prev=window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady=()=>{if(typeof prev==='function')try{prev()}catch(e){}res()};
  const s=document.createElement('script');s.src='https://www.youtube.com/iframe_api';s.async=true;
  s.onerror=()=>{_ytP=null;rej(new Error('net'))};document.head.appendChild(s);
  setTimeout(()=>{if(!(window.YT&&YT.Player)){_ytP=null;rej(new Error('timeout'))}},15000);
 });
 return _ytP;
}

// ---------- Tambor do Bardo (offline) ----------
// agendado à frente no AudioContext (como a trilha do jogo): bumbo nos tempos 1/3, caixa no 2/4, chimbal nas colcheias
const DRUM={timer:0,next:0,step:0,out:null};
function drumOut(){const ac=getAC();if(!DRUM.out){DRUM.out=ac.createGain();DRUM.out.connect(ac.destination)}DRUM.out.gain.value=.9*(typeof MUS!=='undefined'?MUS.vol:.7);return DRUM.out}
function drumHit(kind,t){
 const ac=AC,o=ac.createOscillator(),g=ac.createGain();o.connect(g);g.connect(DRUM.out);
 if(kind==='k'){o.frequency.setValueAtTime(140,t);o.frequency.exponentialRampToValueAtTime(45,t+.16);g.gain.setValueAtTime(.55,t);g.gain.exponentialRampToValueAtTime(.001,t+.22);o.start(t);o.stop(t+.25)}
 else if(kind==='s'){o.type='triangle';o.frequency.setValueAtTime(210,t);g.gain.setValueAtTime(.16,t);g.gain.exponentialRampToValueAtTime(.001,t+.12);o.start(t);o.stop(t+.14)}
 else{o.type='square';o.frequency.setValueAtTime(7200+Math.random()*900,t);g.gain.setValueAtTime(.018,t);g.gain.exponentialRampToValueAtTime(.0005,t+.035);o.start(t);o.stop(t+.04)}
}
function drumTick(){
 const R=Rhythm,tr=R.track;if(!tr||R.paused)return;const ac=AC,e8=60/tr.bpm/2;
 while(DRUM.next<ac.currentTime+.15){
  const s=DRUM.step%8,t=DRUM.next;
  if(tr.kit!=='calm'||s%4===0)drumHit('h',t);
  if(s===0||(s===4&&tr.kit!=='calm')||(tr.kit==='gallop'&&s===3))drumHit('k',t);
  if((s===2||s===6)&&tr.kit!=='calm')drumHit('s',t);
  if(tr.kit==='calm'&&s===4)drumHit('s',t);
  DRUM.next+=e8;DRUM.step++;
 }
}
function drumStart(at){drumOut();DRUM.next=at;DRUM.step=0;clearInterval(DRUM.timer);DRUM.timer=setInterval(drumTick,25)}
function drumStop(){clearInterval(DRUM.timer);DRUM.timer=0}

// ---------- sessão ----------
const Rhythm={
 track:null,last:null,notes:[],ni:0,t:0,dur:0,beat:-1,paused:false,playing:false,ended:false,
 yt:null,ytT:0,ytRead:0,rt:0,t0:0,pauseAt:0,
 stats:{perfect:0,great:0,ok:0,miss:0},lastJ:'',lastJT:0,

 /** faixas do jogador (YouTube), salvas no navegador */
 custom(){const a=store.get('songs',[]);return Array.isArray(a)?a:[]},
 saveCustom(list){store.set('songs',list.slice(0,30))},
 all(){return SONG_DRUMS.concat(this.custom())},
 find(id){return this.all().find(x=>x.id===id)||null},

 /** escolha no seletor: fecha o modal e começa */
 pick(id){const tr=this.find(id);if(!tr)return;if(modalOpen)closeModal();this.start(tr)},

 async start(tr){
  this.stop();this.track=tr;this.last=tr;this.stats={perfect:0,great:0,ok:0,miss:0};this.lastJ='';this.ended=false;this.beat=-1;this.ni=0;this.t=0;this.paused=false;
  if(tr.src==='drum'){this.dur=tr.dur;this.notes=beatNotes(tr.bpm,tr.offset||0,tr.every||3,tr.dur);this.begin();
   const ac=getAC();if(ac.state==='suspended')ac.resume();this.t0=ac.currentTime+.12;drumStart(this.t0);return}
  // YouTube
  if(location.protocol==='file:'){this.fail('song.err.file');return}
  showOverlay(`<div class="songload"><span class="spin" aria-hidden="true">🎵</span><b>${t('song.loading')}</b><small>${esc(tr.title||'')}</small></div>`,'glass');
  try{await ytLoad()}catch(e){this.fail('song.err.net');return}
  if(this.track!==tr)return; // trocou de faixa enquanto carregava
  const dock=songDock(true);dock.innerHTML='<div id="ytPlayer"></div>';
  this.yt=new YT.Player('ytPlayer',{width:'100%',height:'100%',videoId:tr.vid,
   playerVars:{autoplay:0,controls:0,disablekb:1,fs:0,rel:0,playsinline:1,iv_load_policy:3,origin:location.origin},
   events:{
    onReady:ev=>{if(this.track!==tr)return;const d=ev.target.getDuration()||tr.dur||180,hasChart=tr.chart&&tr.chart.length;
     this.dur=hasChart||!tr.auto?d:Math.min(d,SONG_MAX); // automático: vídeos longos jogam no máximo SONG_MAX s
     this.notes=hasChart?tr.chart.filter(n=>n.t>=.8&&n.t<d):tr.auto?generateSongBeats(d):beatNotes(tr.bpm||100,tr.offset||0,tr.every||4,d);
     songAutoTitle(tr,ev.target);
     ev.target.setVolume(Math.round(100*(typeof MUS!=='undefined'?MUS.vol:.7)));ev.target.playVideo()},
    onStateChange:ev=>{if(this.track!==tr)return;const S=YT.PlayerState;
     if(ev.data===S.PLAYING&&!this.playing){this.playing=true;this.rt=performance.now();this.t=ev.target.getCurrentTime()||0;if(!G||!G.song)this.begin()}
     else if(ev.data===S.ENDED)this.ended=true},
    onError:ev=>{if(this.track===tr)this.fail(ev.data===150||ev.data===101?'song.err.embed':'song.err.video')}
   }});
 },
 /** abre a partida (arcade com G.song) — inimigos só pelo mapa da música, sem ondas/bônus/bênçãos */
 begin(){
  hideOverlay();newGame();G.song=this.track;G.wave=1;G.banner=0;G.spawnLeft=0;G.boss=false;G.bossWave=false;this.playing=true;this.rt=performance.now();
  if(typeof musicMix==='function')musicMix();
  songDock(this.track.src==='yt');
 },
 fail(key){
  this.stop();hideOverlay();if(state!=='menu')showMenu();
  songErr=t(key);openModal('songs'); // o aviso aparece no topo do seletor de músicas
 },
 /** tempo atual da música (s) */
 now(){
  if(!this.track)return 0;
  if(this.track.src==='drum')return Math.max(0,(this.paused?this.pauseAt:AC.currentTime)-this.t0);
  return this.t;
 },
 /** passo fixo do jogo (só em partida de música) */
 tick(dt){
  const tr=this.track;if(!tr||!G)return;
  if(tr.src==='yt'&&this.yt&&this.playing&&!this.paused){
   const now=performance.now();this.t+=(now-this.rt)/1000;this.rt=now;
   if(now-this.ytRead>250){this.ytRead=now;try{const y=this.yt.getCurrentTime();const st=this.yt.getPlayerState();
    if(st===YT.PlayerState.BUFFERING)this.t=y;else if(Math.abs(y-this.t)>.15)this.t=y;else this.t+=(y-this.t)*.25}catch(e){}}
  }
  const T0=this.now(),spb=60/(tr.bpm||100);
  // 🥁 pulso da batida: anel na torre e brilho no cajado (o mago "respira" no ritmo)
  const b=Math.floor((T0-(tr.offset||0))/spb);
  if(b!==this.beat&&b>=0){this.beat=b;addRing(TX,TTOP-34,8,b%4===0?74:52,.32,b%4===0?'#ffe9a8':G.col);castGlow=Math.max(castGlow,b%4===0?.55:.3)}
  // nasce cada nota SONG_LEAD s antes do tempo dela
  while(this.ni<this.notes.length&&this.notes[this.ni].t-SONG_LEAD<=T0){this.spawnNote(this.notes[this.ni],T0);this.ni++}
  G.wave=1+Math.min(7,Math.floor(T0/Math.max(1,this.dur)*8)); // progresso da faixa vira a "onda" (vocabulário e XP)
  if((this.ended||T0>=this.dur)&&this.ni>=this.notes.length&&!G.enemies.length&&state==='play'){G.songClear=true;gameOver()}
 },
 spawnNote(n,T0){
  const k=this.ni%8===7?'crystal':'rock';spawn(k);const e=G.enemies[G.enemies.length-1];if(!e)return;
  if(n.w){e.word=n.w;e.nw=norm(n.w);e.lw=measure(e.word.toUpperCase())}
  const left=Math.max(1.6,n.t+SONG_GRACE-T0),dist=Math.max(60,e.d0-(e.r+44));
  e.songT=n.t;e.songV=dist/left;
 },
 /** palavra completada: julga pela distância até o tempo da nota */
 judge(e){
  if(e.songT==null)return;const d=Math.abs(this.now()-e.songT),j=d<=SONG_JUDGE.perfect?'perfect':d<=SONG_JUDGE.great?'great':'ok';
  this.stats[j]++;this.lastJ=j;this.lastJT=1;
  const bonus=Math.round(e.word.length*10*(SONG_PTS[j]-1)*mult());if(bonus>0)G.score+=bonus;
  const col=j==='perfect'?'#ffe9a8':j==='great'?'#9ae8ff':'#c6cde8';floatTxt(e.x,e.y-e.r-30,t('song.j.'+j),col,j==='perfect'?20:16);
  if(j==='perfect'){const tp=staffTip(1);addRing(tp.x,tp.y,4,40,.3,'#ffe9a8')}
 },
 missNote(e){if(e&&e.songT!=null)this.stats.miss++},
 pause(){
  if(!this.track||this.paused)return;this.paused=true;
  if(this.track.src==='drum'){this.pauseAt=AC.currentTime;drumStop()}
  else if(this.yt)try{this.yt.pauseVideo()}catch(e){}
 },
 resume(){
  if(!this.track||!this.paused)return;this.paused=false;
  if(this.track.src==='drum'){const ac=AC;this.t0+=ac.currentTime-this.pauseAt;DRUM.next=ac.currentTime+.05;clearInterval(DRUM.timer);DRUM.timer=setInterval(drumTick,25)}
  else if(this.yt){this.rt=performance.now();try{this.yt.playVideo()}catch(e){}}
 },
 stop(){
  drumStop();if(this.yt){try{this.yt.destroy()}catch(e){}this.yt=null}
  this.track=null;this.playing=false;this.paused=false;songDock(false);
  if(typeof musicMix==='function')musicMix();
 },
 /** fim da partida (vitória ou derrota): Aura pelo ritmo, histórico da faixa, áudio desligado */
 finish(){
  const tr=this.track;if(!tr||!G)return null;const s=this.stats,total=Math.max(1,this.notes.length);
  const clear=!!G.songClear,aura=Math.round(s.perfect*1.5+s.great*.5)+(clear?20:0);G.aura+=aura;
  const sum={id:tr.id,title:tr.src==='drum'?t(tr.title):tr.title,src:tr.src,clear,perfect:s.perfect,great:s.great,ok:s.ok,miss:s.miss,total,
   pct:Math.round(Math.min(1,this.now()/Math.max(1,this.dur))*100),aura,at:Date.now()};
  const ss=profile.songStats=profile.songStats||{games:0,clears:0,perfects:0};ss.games++;if(clear)ss.clears++;ss.perfects+=s.perfect; // 📊 totais (o histórico guarda só as 20 últimas)
  const h=profile.songHistory=Array.isArray(profile.songHistory)?profile.songHistory:[];
  h.unshift({id:sum.id,title:sum.title,clear,perfect:s.perfect,great:s.great,miss:s.miss,total,pct:sum.pct,wpm:calcWpm(),acc:calcAcc(),score:G.score,at:sum.at});
  if(h.length>SONG_HIST_MAX)h.length=SONG_HIST_MAX;
  this.stop();return sum;
 },
 /** HUD da música (canvas): título, barra de progresso com o tempo, WPM/precisão ao vivo e o último julgamento */
 drawHud(c){
  const tr=this.track;if(!tr||!G||!G.song)return;const T0=this.now(),k=Math.min(1,T0/Math.max(1,this.dur)),x=192,w=188,y=14; // entre o placar (esq.) e a onda/vidas (dir.) do HUD
  // ⭕ anel de aproximação em cada nota: fecha sobre o inimigo exatamente no tempo dela (fica dourado na janela do Perfeito)
  c.save();c.lineWidth=2;
  for(let i=0;i<G.enemies.length;i++){const e=G.enemies[i];if(e.songT==null)continue;const dk=(e.songT-T0)/SONG_LEAD;if(dk<-.15)continue;
   const hot=Math.abs(e.songT-T0)<=SONG_JUDGE.perfect;c.globalAlpha=hot?.95:Math.max(.25,.75-dk*.4);c.strokeStyle=hot?'#ffe9a8':'#9ae8ff';
   c.beginPath();c.arc(lerpX(e),lerpY(e),e.r+6+Math.max(0,dk)*48,0,6.283);c.stroke()}
  c.restore();
  c.save();c.fillStyle='rgba(6,8,26,.78)';c.beginPath();c.roundRect(x-10,y-8,w+20,44,12);c.fill();
  c.strokeStyle='rgba(233,216,188,.55)';c.lineWidth=1.2;c.stroke();
  c.fillStyle='rgba(255,255,255,.1)';c.fillRect(x,y+18,w,5);c.fillStyle=G.col;c.fillRect(x,y+18,w*k,5);
  c.fillStyle='#fff';c.beginPath();c.arc(x+w*k,y+20.5,3.5,0,6.283);c.fill();
  c.font='900 11px Nunito';c.textAlign='left';c.fillStyle='#e9d8bc';
  const title=tr.src==='drum'?t(tr.title):tr.title||'';c.fillText('🎵 '+(title.length>20?title.slice(0,19)+'…':title),x,y+8);
  const mm=s=>Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');
  c.textAlign='right';c.fillStyle='#aab4dc';c.fillText(mm(T0)+' / '+mm(this.dur),x+w,y+8);
  c.font='800 10px Nunito';c.textAlign='center';c.fillStyle='#c6cde8';
  c.fillText(calcWpm()+' WPM · '+calcAcc()+'% · ✨'+this.stats.perfect+' 💫'+this.stats.great,x+w/2,y+33);
  if(this.lastJT>0){this.lastJT=Math.max(0,this.lastJT-1/60);c.globalAlpha=Math.min(1,this.lastJT*2);c.font='900 15px Cinzel';
   c.fillStyle=this.lastJ==='perfect'?'#ffe9a8':this.lastJ==='great'?'#9ae8ff':'#c6cde8';c.fillText(t('song.j.'+this.lastJ),TX,TTOP-150)}
  c.restore();
 }
};

// ---------- espelho mágico: onde o vídeo aparece ----------
// O YouTube exige o player VISÍVEL e com pelo menos 200×200 px → moldura fixa, sem cliques (o clique no iframe tiraria o foco
// do jogo e pausaria a partida). No PC fica sobre o topo do painel direito; sem painel (janela estreita/celular), no canto.
function songDock(on){
 let d=document.getElementById('songDock');
 if(!on){if(d){d.classList.remove('on');d.innerHTML=''}return d}
 if(!d){d=document.createElement('div');d.id='songDock';d.className='songdock';d.setAttribute('aria-label','YouTube');document.body.appendChild(d)}
 d.classList.add('on');songDockPlace();return d;
}
function songDockPlace(){
 const d=document.getElementById('songDock');if(!d||!d.classList.contains('on'))return;
 const rp=document.getElementById('rightPanel'),r=rp&&!DeviceManager.isMobile?rp.getBoundingClientRect():null;
 if(r&&r.width>=240&&getComputedStyle(rp).opacity!=='0'){d.style.left=Math.round(r.left+8)+'px';d.style.top=Math.round(r.top+40)+'px';d.style.width=Math.round(Math.min(r.width-16,356))+'px';d.style.right=d.style.bottom='auto'}
 else{d.style.left=d.style.top='auto';d.style.right='10px';d.style.bottom='10px';d.style.width='228px'}
}
addEventListener('resize',songDockPlace);

// ---------- seletor de músicas (modal 'songs') ----------
let songFormErr='',songErr='';
function tabSongs(){
 const fileWarn=(songErr?`<p class="songwarn">⚠️ ${esc(songErr)}</p>`:'')+(location.protocol==='file:'&&!songErr?`<p class="songwarn">⚠️ ${t('song.err.file')}</p>`:'');songErr='';
 const card=(tr,del)=>{const name=tr.src==='drum'?t(tr.title):esc(tr.title||tr.vid);
  const meta=tr.src==='drum'?`${tr.bpm} BPM · ${Math.round(tr.dur/60*10)/10} min · ${t('song.offline')}`:`${tr.chart&&tr.chart.length?t('song.chartN',{n:tr.chart.length}):tr.auto?'✨ '+t('song.auto'):(tr.bpm||100)+' BPM'} · YouTube`;
  return`<div class="songcard ${tr.src}"><span class="songic" aria-hidden="true">${tr.src==='drum'?'🥁':'📺'}</span><div class="songtx"><b>${name}</b><small>${meta}</small></div>
   ${del?`<button class="songdel" onclick="songDelete('${tr.id}')" aria-label="${esc(t('song.delete'))}">✕</button><button class="songmap" onclick="songEdit('${tr.id}')">✏️ ${t('song.ed.map')}</button>`:''}<button class="btn songplay" onclick="Rhythm.pick('${tr.id}')">▶ ${t('song.play')}</button></div>`};
 const hist=(Array.isArray(profile.songHistory)?profile.songHistory:[]).slice(0,5);
 // 🎯 tela limpa: [ cole o link ] [ JOGAR ] no topo; faixas prontas e as suas logo abaixo; BPM/tempos só no "Avançado"
 return`<div class="songquick"><input id="sgQuick" placeholder="${esc(t('song.quick.ph'))}" autocomplete="off" spellcheck="false" onkeydown="if(event.key==='Enter'){event.preventDefault();songQuick()}">
  <button class="btn" onclick="songQuick()">▶ ${t('song.quick.play')}</button></div>
 <p class="songhint">${t('song.quick.hint')}</p>${quickErr?`<p class="songwarn">⚠️ ${esc(quickErr)}</p>`:''}${fileWarn}
 <h4 class="songh">🥁 ${t('song.ready')}</h4><div class="songlist">${SONG_DRUMS.map(x=>card(x,false)).join('')}</div>
 ${Rhythm.custom().length?`<h4 class="songh">📺 ${t('song.yours')}</h4><div class="songlist">${Rhythm.custom().map(x=>card(x,true)).join('')}</div>`:''}
 <details class="songform"${songFormErr?' open':''}><summary>⚙️ ${t('song.adv')}</summary>
  <p class="songhint">${t('song.advHint')}</p>
  <label>${t('song.f.url')}<input id="sgUrl" placeholder="https://youtu.be/…" autocomplete="off"></label>
  <label>${t('song.f.title')}<input id="sgTitle" maxlength="60" autocomplete="off"></label>
  <div class="songrow"><label>BPM<input id="sgBpm" type="number" min="40" max="220" placeholder="${esc(t('song.auto'))}"></label><label>${t('song.f.offset')}<input id="sgOff" type="number" step="0.1" min="0" value="0"></label><label>${t('song.f.every')}<input id="sgEvery" type="number" min="1" max="16" value="4"></label></div>
  <label>${t('song.f.chart')}<textarea id="sgChart" rows="4" placeholder="4.0 magia&#10;6.5 dragão&#10;1:02.3 estrela"></textarea></label>
  ${songFormErr?`<p class="songwarn">${esc(songFormErr)}</p>`:''}<button class="btn" onclick="songSave()">💾 ${t('song.save')}</button>
 </details>
 ${hist.length?`<h4 class="songh">📜 ${t('song.history')}</h4><table class="fast songhist"><tr><th>${t('song.track')}</th><th>%</th><th>✨</th><th>WPM</th></tr>${hist.map(h=>`<tr><td>${h.clear?'🏆 ':''}${esc(h.title)}</td><td>${h.pct}</td><td>${h.perfect}</td><td>${h.wpm}</td></tr>`).join('')}</table>`:''}`;
}
function songSave(){
 const $v=id=>(document.getElementById(id)||{}).value||'';const vid=ytIdOf($v('sgUrl'));
 if(!vid){songFormErr=t('song.err.url');renderModal();return}
 const chart=parseSongChart($v('sgChart'));
 const bpm=+$v('sgBpm'),auto=!bpm&&!chart.length; // BPM em branco e sem tempos → gerador automático
 const tr={id:'yt-'+vid+'-'+Date.now().toString(36),src:'yt',vid,title:$v('sgTitle').trim().slice(0,60)||vid,auto,bpm:auto?SONG_AUTO_BPM:Math.max(40,Math.min(220,bpm||100)),offset:Math.max(0,+$v('sgOff')||0),every:Math.max(1,Math.min(16,+$v('sgEvery')||4)),chart};
 Rhythm.saveCustom([tr].concat(Rhythm.custom()));songFormErr='';renderModal();snd(880,.08,'triangle',.04);
}
let quickErr='';
/** ▶ "Só jogar": cola o link e joga. Reaproveita a faixa se o vídeo já estiver salvo; senão cria uma automática (o nome
 *  vem do próprio vídeo quando ele carrega — songAutoTitle). */
function songQuick(){
 const el=document.getElementById('sgQuick'),vid=ytIdOf(el?el.value:'');
 if(!vid){quickErr=t('song.err.url');renderModal();const n=document.getElementById('sgQuick');if(n)n.focus();return}
 quickErr='';let tr=Rhythm.custom().find(x=>x.vid===vid);
 if(!tr){tr={id:'yt-'+vid,src:'yt',vid,title:vid,auto:true,bpm:SONG_AUTO_BPM,chart:[]};Rhythm.saveCustom([tr].concat(Rhythm.custom()))}
 Rhythm.pick(tr.id);
}
/** nome automático: o título do vídeo substitui o id assim que o player carrega (só se o jogador não deu um nome) */
function songAutoTitle(tr,p){
 try{const ti=(p.getVideoData()||{}).title;if(!ti||tr.title!==tr.vid)return;tr.title=ti.slice(0,60);
  Rhythm.saveCustom(Rhythm.custom().map(x=>x.id===tr.id?Object.assign({},x,{title:tr.title}):x))}catch(e){}
}
/** bloco do resultado (tela de fim): julgamentos, % da faixa e Aura do ritmo */
function songOverHTML(s){
 return`<div class="songover"><b>🎵 ${esc(s.title)}</b><span>${s.clear?'🏆 '+t('song.cleared'):t('song.reached',{p:s.pct})}</span>
  <div class="songj"><i class="p">✨ ${s.perfect} ${t('song.j.perfect')}</i><i class="g">💫 ${s.great} ${t('song.j.great')}</i><i>✔ ${s.ok} ${t('song.j.ok')}</i><i class="m">✕ ${s.miss} ${t('song.j.miss')}</i></div>
  ${s.aura?`<small>${t('song.aura',{n:s.aura})}</small>`:''}</div>`;
}
function songDelete(id){Rhythm.saveCustom(Rhythm.custom().filter(x=>x.id!==id));renderModal();snd(330,.08,'triangle',.04)}

// =====================================================================================================
// ✏️ Editor de mapa ao vivo (modal 'songedit'): o vídeo toca e o jogador marca o tempo de cada palavra
//  teclando na batida. Fases (trocadas por data-phase, sem redesenhar o modal — o iframe do player não pode ser recriado):
//   setup  → escreve as palavras (uma por linha ou separadas por espaço) e aperta Gravar
//   rec    → ESPAÇO/ENTER (ou o botão grande, no toque) marca a próxima palavra · ⌫ desfaz · ESC para
//   review → lista das marcas, ajuste fino de todas (±0,05 s), Conferir (toca e mostra cada palavra no tempo), Salvar, Jogar
//   check  → conferência tocando; ESC volta para a revisão
//  Tempo da marca = último getCurrentTime() + tempo real desde a leitura (lido a cada 50 ms) → precisão de poucos ms.
// =====================================================================================================
const SED={tr:null,yt:null,ready:false,phase:'setup',words:[],marks:[],shift:0,timer:0,ytT:0,ytAt:0,playing:false,ci:-1};
const sedWords=txt=>String(txt||'').toLowerCase().normalize('NFC').split(/\s+/).map(w=>w.replace(/[^\p{L}]/gu,'').slice(0,14)).filter(Boolean);
const sedEl=id=>document.getElementById(id);
/** tempo atual do vídeo com interpolação entre leituras */
function sedNow(){return SED.ytT+(SED.playing?(performance.now()-SED.ytAt)/1000:0)}
function songEdit(id){
 const tr=Rhythm.find(id);if(!tr||tr.src!=='yt')return;
 Object.assign(SED,{tr,ready:false,phase:'setup',words:[],marks:[],shift:0,ci:-1});
 openModal('songedit');sedSync();
 if(location.protocol==='file:'){sedStatus(t('song.err.file'));return}
 sedStatus(t('song.loading'));
 ytLoad().then(()=>{
  if(SED.tr!==tr||modal.kind!=='songedit')return;
  SED.yt=new YT.Player('ytEdit',{width:'100%',height:'100%',videoId:tr.vid,
   playerVars:{autoplay:0,controls:0,disablekb:1,fs:0,rel:0,playsinline:1,iv_load_policy:3,origin:location.origin},
   events:{
    onReady:()=>{if(SED.tr!==tr)return;SED.ready=true;try{SED.yt.setVolume(Math.round(100*(typeof MUS!=='undefined'?MUS.vol:.7)))}catch(e){}sedStatus('');sedSync()},
    onStateChange:ev=>{const S=YT.PlayerState;SED.playing=ev.data===S.PLAYING;sedRead();if(ev.data===S.ENDED&&(SED.phase==='rec'||SED.phase==='check'))sedStop()},
    onError:ev=>sedStatus(t(ev.data===150||ev.data===101?'song.err.embed':'song.err.video'))
   }});
 }).catch(()=>sedStatus(t('song.err.net')));
 clearInterval(SED.timer);SED.timer=setInterval(sedTick,50);
}
function sedRead(){if(!SED.yt||!SED.ready)return;try{SED.ytT=SED.yt.getCurrentTime()||0;SED.ytAt=performance.now()}catch(e){}}
function sedStatus(msg){const s=sedEl('sedStatus');if(s){s.textContent=msg;s.hidden=!msg}}
/** a cada 50 ms: relê o vídeo, atualiza o relógio e, na conferência, a palavra da vez */
function sedTick(){
 if(modal.kind!=='songedit'){songEdClose();return}
 sedRead();const tm=sedEl('sedTime');if(tm)tm.textContent=sedNow().toFixed(2)+' s';
 if(SED.phase==='check'){const now=sedNow();let i=-1;for(let k=0;k<SED.marks.length;k++)if(SED.marks[k].t+SED.shift<=now)i=k;else break;
  if(i!==SED.ci){SED.ci=i;const w=sedEl('sedBig');if(w){w.textContent=i>=0?SED.marks[i].w.toUpperCase():'…';w.classList.remove('pop');void w.offsetWidth;w.classList.add('pop')}if(i>=0)snd(1320,.05,'triangle',.03)}}
}
/** atualiza só as partes que mudam (fase, contador, próxima palavra, revisão) — o iframe fica intacto */
function sedSync(){
 const box=sedEl('sedBox');if(!box)return;box.dataset.phase=SED.phase;
 const n=SED.marks.length,N=SED.words.length,cnt=sedEl('sedCount');if(cnt)cnt.textContent=n+' / '+N;
 const nx=sedEl('sedNext');if(nx)nx.textContent=n<N?SED.words[n].toUpperCase():'✓';
 const q=sedEl('sedQueue');if(q)q.textContent=SED.words.slice(n+1,n+6).join(' · ');
 const g=sedEl('sedGo');if(g)g.disabled=!SED.ready;
 const sh=sedEl('sedShift');if(sh)sh.textContent=(SED.shift>=0?'+':'')+SED.shift.toFixed(2)+' s';
 const list=sedEl('sedList');if(list)list.innerHTML=SED.marks.map(m=>`<li><b>${(m.t+SED.shift).toFixed(2)}</b> ${esc(m.w)}</li>`).join('')||`<li>${t('song.ed.empty')}</li>`;
}
function sedRec(){
 if(!SED.ready)return;const ta=sedEl('sedWords');SED.words=sedWords(ta?ta.value:'');
 if(!SED.words.length){sedStatus(t('song.ed.noWords'));return}
 SED.marks=[];SED.shift=0;SED.phase='rec';sedStatus('');
 try{SED.yt.seekTo(0,true);SED.yt.playVideo()}catch(e){}
 sedSync();snd(880,.08,'triangle',.04);
}
function sedMark(){
 if(SED.phase!=='rec'||!SED.playing)return;const n=SED.marks.length;if(n>=SED.words.length)return;
 SED.marks.push({t:Math.max(0,+sedNow().toFixed(3)),w:SED.words[n]});
 const b=sedEl('sedTap');if(b){b.classList.remove('hit');void b.offsetWidth;b.classList.add('hit')}
 letterNote(n%8+1);sedSync();
 if(SED.marks.length>=SED.words.length)setTimeout(sedStop,350); // última palavra marcada → revisão
}
function sedUndo(){if(SED.phase!=='rec'||!SED.marks.length)return;SED.marks.pop();sedSync();snd(330,.06,'triangle',.03)}
function sedStop(){try{SED.yt&&SED.yt.pauseVideo()}catch(e){}SED.phase=SED.words.length||SED.marks.length?'review':'setup';sedSync()}
function sedNudge(d){SED.shift=Math.round((SED.shift+d)*100)/100;sedSync()}
function sedCheck(){if(!SED.ready||!SED.marks.length)return;SED.phase='check';SED.ci=-1;const w=sedEl('sedBig');if(w)w.textContent='…';try{SED.yt.seekTo(Math.max(0,SED.marks[0].t+SED.shift-2),true);SED.yt.playVideo()}catch(e){}sedSync()}
function sedRedo(){try{SED.yt&&SED.yt.pauseVideo()}catch(e){}SED.phase='setup';SED.marks=[];sedSync()}
/** grava o mapa na faixa (com o ajuste fino aplicado) */
function sedSave(play){
 const tr=SED.tr;if(!tr||!SED.marks.length)return;
 const chart=SED.marks.map(m=>({t:Math.max(0,+(m.t+SED.shift).toFixed(3)),w:m.w})).sort((a,b)=>a.t-b.t);
 const list=Rhythm.custom().map(x=>x.id===tr.id?Object.assign({},x,{chart}):x);Rhythm.saveCustom(list);
 snd(988,.1,'triangle',.05);const id=tr.id;songEdClose();
 if(play)Rhythm.pick(id);else openModal('songs');
}
function songEdClose(){clearInterval(SED.timer);SED.timer=0;if(SED.yt){try{SED.yt.destroy()}catch(e){}SED.yt=null}SED.ready=false;SED.playing=false;SED.tr=null}
function tabSongEdit(){
 const tr=SED.tr;if(!tr)return'';const pre=tr.chart&&tr.chart.length?tr.chart.map(n=>n.w).join(' '):'';
 return`<div class="sed" id="sedBox" data-phase="${SED.phase}">
  <div class="sedhead"><b>📺 ${esc(tr.title)}</b><span id="sedTime">0.00 s</span></div>
  <div class="sedvid"><div id="ytEdit"></div><p class="sedbig" id="sedBig"></p></div>
  <p class="songwarn" id="sedStatus" hidden></p>
  <div class="sedp setup"><p class="msub">${t('song.ed.help')}</p>
   <textarea id="sedWords" rows="5" placeholder="${esc(t('song.ed.ph'))}">${esc(pre)}</textarea>
   <div class="sedbtns"><button class="btn" id="sedGo" onclick="sedRec()" disabled>🎙️ ${t('song.ed.rec')}</button><button class="pact" onclick="openModal('songs')">↩ ${t('song.ed.back')}</button></div></div>
  <div class="sedp rec"><div class="sednext"><small>${t('song.ed.next')}</small><b id="sedNext"></b><span id="sedQueue"></span></div>
   <button class="sedtap" id="sedTap" onpointerdown="event.preventDefault();sedMark()">${t('song.ed.tap')} <kbd>${t('song.ed.space')}</kbd></button>
   <div class="sedbtns"><span id="sedCount"></span><button class="pact" onclick="sedUndo()">↶ ${t('song.ed.undo')} <kbd>⌫</kbd></button><button class="pact" onclick="sedStop()">⏹ ${t('song.ed.stop')} <kbd>ESC</kbd></button></div></div>
  <div class="sedp review"><div class="sedbtns"><span>${t('song.ed.shift')} <b id="sedShift"></b></span><button class="pact" onclick="sedNudge(-.05)">−0,05</button><button class="pact" onclick="sedNudge(.05)">+0,05</button><button class="pact" onclick="sedCheck()">▶ ${t('song.ed.check')}</button></div>
   <ol class="sedlist" id="sedList"></ol>
   <div class="sedbtns"><button class="btn" onclick="sedSave(false)">💾 ${t('song.ed.save')}</button><button class="btn" onclick="sedSave(true)">▶ ${t('song.ed.saveplay')}</button><button class="pact" onclick="sedRedo()">🎙️ ${t('song.ed.redo')}</button></div></div>
  <div class="sedp check"><p class="msub">${t('song.ed.checking')}</p><div class="sedbtns"><button class="pact" onclick="sedStop()">⏹ ${t('song.ed.stop')} <kbd>ESC</kbd></button></div></div>
 </div>`;
}
// teclas do gravador: capturadas ANTES do jogo (ESPAÇO/ENTER não abrem a partida, ESC não fecha o modal no meio da gravação)
addEventListener('keydown',ev=>{
 if(modal.kind!=='songedit'||(SED.phase!=='rec'&&SED.phase!=='check'))return;
 const k=ev.key;let used=true;
 if(SED.phase==='rec'&&(k===' '||k==='Enter')){if(!ev.repeat)sedMark()}
 else if(SED.phase==='rec'&&k==='Backspace')sedUndo();
 else if(k==='Escape')sedStop();
 else used=false;
 if(used){ev.preventDefault();ev.stopImmediatePropagation()}
},true);