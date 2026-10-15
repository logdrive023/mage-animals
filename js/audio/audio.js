// Mage Animals — Áudio: efeitos sonoros + Jukebox procedural (Web Audio API, nenhum arquivo de som).
// Trilhas: Marcha dos Arcanos (partitura ABC) · Taverna dos Arcanos (lofi medieval) · Caçada em Velen (batalha)
//          · Floresta Antiga (atmosférica) · Modo Dinâmico (alterna sozinho conforme a tensão do jogo).
'use strict';

let AC;const SFX={vol:store.get('sfxVol',.8)};
function getAC(){if(!AC)AC=new(window.AudioContext||window.webkitAudioContext)();return AC}
// Notas de digitação em harmonia com a trilha: escala pentatônica do tom da música que está tocando
// (Ré menor na Marcha/Taverna, Mi menor em Velen, Lá menor na Floresta). Cada letra sobe um grau da escala.
const LETTER_SCALES={marcha:[62,65,67,69,72,74,77,79,81,84],taverna:[62,65,67,69,72,74,77,79,81,84],velen:[64,67,69,71,74,76,79,81,83,86],floresta:[69,72,74,76,79,81,84,86,88,91]};
function pluck(m,t,v){const f=440*Math.pow(2,(m-69)/12),g=AC.createGain();g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v*SFX.vol,t+.006);g.gain.exponentialRampToValueAtTime(.0001,t+.32);g.connect(AC.destination);
 for(const[ty,mul,a]of[['sine',1,1],['triangle',2,.25]]){const o=AC.createOscillator(),og=AC.createGain();o.type=ty;o.frequency.value=f*mul;og.gain.value=a;o.connect(og);og.connect(g);o.start(t);o.stop(t+.34)}}
function letterNote(i){try{getAC();const sc=LETTER_SCALES[MUS.cur]||LETTER_SCALES.marcha;pluck(sc[(i-1)%sc.length],AC.currentTime,.05)}catch(e){}}
function letterChord(){try{getAC();const sc=LETTER_SCALES[MUS.cur]||LETTER_SCALES.marcha,t0=AC.currentTime;[0,2,4,7].forEach((k,j)=>pluck(sc[k],t0+j*.045,.045))}catch(e){}}
function snd(f,d=.1,type='sine',v=.06,slide=0,delay=0){try{getAC();const t=AC.currentTime+delay,o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(slide,t+d);g.gain.setValueAtTime(Math.max(.0001,v*SFX.vol),t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g).connect(AC.destination);o.start(t);o.stop(t+d+.02)}catch(e){}}

// ================== PARTITURA ABC: "Marcha dos Arcanos" ==================
const ABC_TUNE=`X: 1
T: Marcha dos Arcanos
C: Mage's Charge
M: 4/4
L: 1/16
Q: 1/4=136
K: Dmin
z2 d2f2d2 A2d2f2d2 | z2 e2g2e2 A2e2g2e2 | z2 d2f2d2 A2d2f2d2 | z2 ^c2e2c2 A2c2e2c2 |
d4- d2fe d2A2 F2D2 | g4- g2ag f2e2 d2c2 | d4- d2fe d2A2 F2D2 | e4- e2fe ^c2A2 E2C2 |
f2A2 f2A2 g2A2 g2A2 | a2d2 f2a2 d'2a2 f2d2 | b2g2 d2g2 a2f2 d2f2 | e2^c2 A2c2 e2g2 f2e2 |
[DFAd]8- [DFAd]4 z4 |]`;

// Parser ABC mínimo: cabeçalhos (L, Q, K), notas, oitavas (' ,), acidentes (^ _ =) válidos no compasso,
// armadura de clave (Dmin = Si bemol), pausas (z), acordes [..] e ligaduras (-).
function parseABC(src){
 const head={},body=[];
 src.split('\n').forEach(l=>{const m=l.match(/^([A-Z]):\s*(.*)$/);if(m)head[m[1]]=m[2].trim();else body.push(l)});
 const keySig={dmin:{B:-1},dm:{B:-1},f:{B:-1},c:{},am:{},amin:{},g:{F:1},d:{F:1,C:1}}[(head.K||'C').toLowerCase()]||{};
 const unitDen=+((head.L||'1/8').split('/')[1]);
 const bpm=+((head.Q||'1/4=120').split('=')[1]);
 const s=body.join(' '),base={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
 let i=0,t=0,barAcc={},tie=false;const notes=[];
 const readLen=()=>{let n='';while(/[0-9]/.test(s[i]))n+=s[i++];let v=n?+n:1;if(s[i]==='/'){i++;let d='';while(/[0-9]/.test(s[i]))d+=s[i++];v/=d?+d:2}return v};
 const readNote=()=>{
  let acc=null;while('^_='.includes(s[i])){acc=s[i]==='='?0:(acc||0)+(s[i]==='^'?1:-1);i++}
  const ch=s[i++],L=ch.toUpperCase();let oct=ch===L?4:5;
  while(s[i]==="'"){oct++;i++}while(s[i]===','){oct--;i++}
  const k=L+oct;if(acc!==null)barAcc[k]=acc;
  const a=k in barAcc?barAcc[k]:(keySig[L]||0);
  return 12*(oct+1)+base[L]+a;
 };
 const push=(ps,d)=>{const last=notes[notes.length-1];
  if(tie&&last&&last.t+last.d===t&&last.ps.join()===ps.join())last.d+=d;else notes.push({t,ps,d});tie=false;t+=d};
 while(i<s.length){
  const c=s[i];
  if(c==='|'){barAcc={};i++}
  else if(c==='z'){i++;t+=readLen()}
  else if(c==='-'){tie=true;i++}
  else if(c==='['){i++;const ps=[];while(s[i]!==']')ps.push(readNote());i++;push(ps,readLen())}
  else if('^_=ABCDEFGabcdefg'.includes(c)){const p=readNote();push([p],readLen())}
  else i++;
 }
 return{notes,total:t,bpm,unitDen};
}
const TUNE=parseABC(ABC_TUNE);
const STEPS=Array.from({length:TUNE.total},()=>[]);TUNE.notes.forEach(n=>STEPS[n.t].push(n));
const BAR=16,BARS=Math.ceil(TUNE.total/BAR);
const BASS_ROOTS=[38,45,38,45,38,43,38,45,38,38,43,45,38];
const mtof=m=>440*Math.pow(2,(m-69)/12);

// ================== ESTADO DA MÚSICA ==================
// heat 0..1 (combo + precisão recente) · slow 0..0.3 (erros freiam o andamento) · style: trilha escolhida no Jukebox
const MUS={on:store.get('music',true),vol:store.get('musicVol',.7),style:store.get('musicStyle','dynamic'),
 timer:null,step:0,next:0,bus:null,heat:0,slow:0,cur:null,want:null,wantSince:0,switching:false,switchStart:0,mufBase:0};
function setMusicVol(v){MUS.vol=+v;store.set('musicVol',MUS.vol);musicMix();const q=document.getElementById('musicVol');if(q)q.value=Math.round(MUS.vol*100)}
function setSfxVol(v){SFX.vol=+v;store.set('sfxVol',SFX.vol)}
function setMusicStyle(s){MUS.style=s;store.set('musicStyle',s);if(MUS.bus&&MUS.cur!==desiredTrack()){MUS.want=desiredTrack();beginSwitch(true)}}

const MODES={MUDO:'#6a7090',MARCHA:'#c9a6ff',AVANÇO:'#5ad0ff',BATALHA:'#ffb040',ÉPICA:'#ff5a8a',HESITANTE:'#8a94b8',TAVERNA:'#e8b86a',VELEN:'#ff6a3a',FLORESTA:'#6aff9a'};
function musicMode(){
 if(!MUS.on)return'MUDO';
 if(state==='play'&&MUS.slow>.12)return'HESITANTE';
 const cur=MUS.cur||desiredTrack();
 if(cur==='taverna')return'TAVERNA';if(cur==='velen')return'VELEN';if(cur==='floresta')return'FLORESTA';
 if(state!=='play')return'MARCHA';const h=MUS.heat;return h<.25?'MARCHA':h<.5?'AVANÇO':h<.75?'BATALHA':'ÉPICA';
}
function musicPerf(dt){
 const r=G.recent,acc=r.n?r.sum/r.n:1;
 const tgt=Math.min(1,G.combo/16)*.7+Math.max(0,Math.min(1,(acc-.8)/.2))*.3;
 MUS.heat+=(tgt-MUS.heat)*Math.min(1,dt*(tgt>MUS.heat?.6:2));
 MUS.slow=Math.max(0,MUS.slow-dt*.035);
}
// Erro de digitação: desafina tudo por um instante (modulação do atraso = "pitch bend") e abafa o som
function musicMiss(){
 MUS.slow=Math.min(.3,MUS.slow+.06);MUS.heat=Math.max(0,MUS.heat-.2);
 if(!MUS.bus||!MUS.on)return;const t=AC.currentTime,b=MUS.bus;
 b.wob.delayTime.cancelScheduledValues(t);b.wob.delayTime.setValueAtTime(.006,t);b.wob.delayTime.linearRampToValueAtTime(.03,t+.09);b.wob.delayTime.linearRampToValueAtTime(.006,t+.45);
 b.muf.frequency.cancelScheduledValues(t);b.muf.frequency.setValueAtTime(b.muf.frequency.value,t);b.muf.frequency.exponentialRampToValueAtTime(520,t+.04);b.muf.frequency.setTargetAtTime(MUS.mufBase||18000,t+.12,.22);
}

// ================== CADEIA DE ÁUDIO ==================
// instrumentos → tg (fade de troca de trilha) → master → wob (desafinação) → muf (abafamento) → compressor → saída
function noiseBuf(ac,secs,fn){const b=ac.createBuffer(1,ac.sampleRate*secs,ac.sampleRate),d=b.getChannelData(0);fn(d,ac.sampleRate);return b}
function musicInit(){
 const ac=getAC();if(MUS.bus)return;
 const comp=ac.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=4;comp.connect(ac.destination);
 const muf=ac.createBiquadFilter();muf.type='lowpass';muf.frequency.value=18000;muf.Q.value=.7;muf.connect(comp);
 const wob=ac.createDelay(.1);wob.delayTime.value=.006;wob.connect(muf);
 const master=ac.createGain();master.gain.value=0;master.connect(wob);
 const tg=ac.createGain();tg.gain.value=1;tg.connect(master);
 const lead=ac.createGain();lead.connect(tg);
 const dly=ac.createDelay(1);dly.delayTime.value=60/TUNE.bpm*.75;const fb=ac.createGain();fb.gain.value=.28;const wet=ac.createGain();wet.gain.value=.22;
 lead.connect(dly);dly.connect(fb);fb.connect(dly);dly.connect(wet);wet.connect(tg);
 const drums=ac.createGain();drums.connect(tg);
 const bass=ac.createGain();bass.connect(tg);
 const noise=noiseBuf(ac,1,d=>{for(let k=0;k<d.length;k++)d[k]=Math.random()*2-1});
 // ambiência em loop: lareira + vinil (Taverna) e vento (Floresta)
 const hearth=noiseBuf(ac,4,(d,sr)=>{let lp=0;for(let k=0;k<d.length;k++){lp+=(Math.random()*2-1-lp)*.02;d[k]=lp*.6+(Math.random()*2-1)*.012}
  for(let n=0;n<220;n++){const p=(Math.random()*(d.length-400))|0,a=rand(.15,.7)*(Math.random()<.5?-1:1),len=(rand(20,140))|0;for(let j=0;j<len;j++)d[p+j]+=a*Math.exp(-j/(len*.25))*(Math.random()*2-1)}});
 const wind=noiseBuf(ac,4,d=>{let lp=0;for(let k=0;k<d.length;k++){lp+=(Math.random()*2-1-lp)*.06;d[k]=lp}});
 const ambHearth=ac.createGain();ambHearth.gain.value=0;ambHearth.connect(master);
 let src=ac.createBufferSource();src.buffer=hearth;src.loop=true;const hf=ac.createBiquadFilter();hf.type='lowpass';hf.frequency.value=5200;src.connect(hf);hf.connect(ambHearth);src.start();
 const ambWind=ac.createGain();ambWind.gain.value=0;ambWind.connect(master);
 src=ac.createBufferSource();src.buffer=wind;src.loop=true;const wf=ac.createBiquadFilter();wf.type='bandpass';wf.frequency.value=600;wf.Q.value=.8;src.connect(wf);wf.connect(ambWind);src.start();
 const lfo=ac.createOscillator(),lg=ac.createGain();lfo.frequency.value=.07;lg.gain.value=380;lfo.connect(lg);lg.connect(wf.frequency);lfo.start();
 MUS.bus={master,tg,lead,drums,bass,noise,muf,wob,ambHearth,ambWind};
}

// ================== INSTRUMENTOS ==================
const OUT=n=>MUS.bus[n];
function env(g,t,a,peak,dec,end){g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+end)}
function osc(type,f,t,end,dest,det){const o=AC.createOscillator();o.type=type;o.frequency.value=f;if(det)o.detune.value=det;o.connect(dest);o.start(t);o.stop(t+end+.05);return o}
// Alaúde/cítara: corda dedilhada (ataque rápido, filtro que fecha = brilho que some)
function synLute(m,t,vel=1,dec=.9,bus='lead'){
 const f=mtof(m),fl=AC.createBiquadFilter(),g=AC.createGain();fl.type='lowpass';fl.Q.value=2;fl.frequency.setValueAtTime(3600,t);fl.frequency.exponentialRampToValueAtTime(650,t+dec*.8);
 env(g,t,.004,.085*vel,0,dec);fl.connect(g);g.connect(OUT(bus));
 osc('triangle',f,t,dec,fl,-4);const h=AC.createGain();h.gain.value=.3;h.connect(fl);osc('sawtooth',f*2,t,dec*.5,h,5);
}
// Harpa: corda longa e suave
function synHarp(m,t,vel=1){const f=mtof(m),g=AC.createGain(),fl=AC.createBiquadFilter();fl.type='lowpass';fl.frequency.value=2600;env(g,t,.006,.07*vel,0,2.2);fl.connect(g);g.connect(OUT('lead'));osc('sine',f,t,2.2,fl);const h=AC.createGain();h.gain.value=.25;h.connect(fl);osc('triangle',f*2,t,1,h)}
// Flauta medieval: seno com vibrato e sopro de ruído
function synFlute(m,t,d,vel=1){
 const f=mtof(m),g=AC.createGain();g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.055*vel,t+.07);g.gain.setValueAtTime(.05*vel,t+Math.max(.08,d-.1));g.gain.linearRampToValueAtTime(.0001,t+d+.12);g.connect(OUT('lead'));
 const o=osc('sine',f,t,d+.12,g),l=AC.createOscillator(),lg=AC.createGain();l.frequency.value=5.2;lg.gain.setValueAtTime(0,t);lg.gain.linearRampToValueAtTime(f*.006,t+.25);l.connect(lg);lg.connect(o.frequency);l.start(t);l.stop(t+d+.2);
 const n=AC.createBufferSource(),bf=AC.createBiquadFilter(),ng=AC.createGain();n.buffer=MUS.bus.noise;bf.type='bandpass';bf.frequency.value=f*2;bf.Q.value=6;ng.gain.setValueAtTime(.0001,t);ng.gain.linearRampToValueAtTime(.02*vel,t+.05);ng.gain.linearRampToValueAtTime(.0001,t+d+.1);n.connect(bf);bf.connect(ng);ng.connect(OUT('lead'));n.start(t,Math.random()*.5);n.stop(t+d+.15);
}
// Rabeca (lead de batalha): serra com vibrato rápido
function synFiddle(m,t,d,vel=1){
 const f=mtof(m),g=AC.createGain(),fl=AC.createBiquadFilter();fl.type='lowpass';fl.frequency.value=2400;fl.Q.value=1.5;
 g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.05*vel,t+.04);g.gain.setValueAtTime(.045*vel,t+Math.max(.05,d-.06));g.gain.linearRampToValueAtTime(.0001,t+d+.08);fl.connect(g);g.connect(OUT('lead'));
 const o=osc('sawtooth',f,t,d+.1,fl),l=AC.createOscillator(),lg=AC.createGain();l.frequency.value=6.4;lg.gain.value=f*.008;l.connect(lg);lg.connect(o.frequency);l.start(t);l.stop(t+d+.12);
}
function synDrone(m,t,d){const g=AC.createGain(),fl=AC.createBiquadFilter();fl.type='lowpass';fl.frequency.value=420;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.05,t+.3);g.gain.setValueAtTime(.05,t+d-.2);g.gain.linearRampToValueAtTime(.0001,t+d);fl.connect(g);g.connect(OUT('bass'));osc('sawtooth',mtof(m),t,d,fl,-6);osc('sawtooth',mtof(m+7),t,d,fl,6)}
function synChime(m,t){const g=AC.createGain();env(g,t,.003,.03,0,2);g.connect(OUT('lead'));osc('sine',mtof(m),t,2,g);const h=AC.createGain();h.gain.value=.3;h.connect(g);osc('sine',mtof(m)*2.76,t,.6,h)}
function synBird(t){const g=AC.createGain();g.connect(OUT('lead'));for(let i=0;i<3;i++){const s=t+i*.09,o=AC.createOscillator(),gg=AC.createGain();o.type='sine';o.frequency.setValueAtTime(2600+Math.random()*600,s);o.frequency.exponentialRampToValueAtTime(4200+Math.random()*800,s+.06);env(gg,s,.005,.018,0,.08);o.connect(gg);gg.connect(g);o.start(s);o.stop(s+.1)}}
// percussão
function synTaiko(t,v=1,pitch=90){const o=AC.createOscillator(),g=AC.createGain();o.frequency.setValueAtTime(pitch,t);o.frequency.exponentialRampToValueAtTime(pitch*.52,t+.25);env(g,t,.003,.75*v,0,.55);o.connect(g);g.connect(OUT('drums'));o.start(t);o.stop(t+.6);
 const n=AC.createBufferSource(),f=AC.createBiquadFilter(),ng=AC.createGain();n.buffer=MUS.bus.noise;f.type='lowpass';f.frequency.value=320;env(ng,t,.002,.35*v,0,.12);n.connect(f);f.connect(ng);ng.connect(OUT('drums'));n.start(t,Math.random()*.5);n.stop(t+.15)}
function synFrame(t,v=1){const n=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();n.buffer=MUS.bus.noise;f.type='bandpass';f.frequency.value=900;f.Q.value=1.2;env(g,t,.002,.2*v,0,.16);n.connect(f);f.connect(g);g.connect(OUT('drums'));n.start(t,Math.random()*.5);n.stop(t+.2)}
function synLofiKick(t){const o=AC.createOscillator(),g=AC.createGain(),f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=260;o.frequency.setValueAtTime(115,t);o.frequency.exponentialRampToValueAtTime(42,t+.2);env(g,t,.004,.5,0,.38);o.connect(f);f.connect(g);g.connect(OUT('drums'));o.start(t);o.stop(t+.42)}
function synLofiSnare(t){const n=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();n.buffer=MUS.bus.noise;f.type='bandpass';f.frequency.value=1500;f.Q.value=.7;env(g,t,.003,.11,0,.2);n.connect(f);f.connect(g);g.connect(OUT('drums'));n.start(t,Math.random()*.5);n.stop(t+.24)}
function synLofiHat(t,v=1){const n=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();n.buffer=MUS.bus.noise;f.type='highpass';f.frequency.value=6500;env(g,t,.001,.022*v,0,.035);n.connect(f);f.connect(g);g.connect(OUT('drums'));n.start(t,Math.random()*.5);n.stop(t+.05)}
// instrumentos da Marcha (originais)
function synBell(m,t,d){const o=AC.createOscillator(),g=AC.createGain();o.type='triangle';o.frequency.value=mtof(m);g.gain.setValueAtTime(.035,t);g.gain.exponentialRampToValueAtTime(.0001,t+Math.min(.6,d+.2));o.connect(g);g.connect(OUT('lead'));o.start(t);o.stop(t+.65)}
function synArp(m,t,d,h){const o=AC.createOscillator(),f=AC.createBiquadFilter(),g=AC.createGain();o.type='square';o.frequency.value=mtof(m);f.type='lowpass';f.frequency.value=2600;g.gain.setValueAtTime(.022*h,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(f);f.connect(g);g.connect(OUT('lead'));o.start(t);o.stop(t+d+.02)}
function synCrash(t){synNoise(t,1.1,5000,.11)}
function synLead(m,t,d,vel,bright=.75){
 const f=mtof(m),fl=AC.createBiquadFilter(),g=AC.createGain();
 fl.type='lowpass';fl.Q.value=3;fl.frequency.setValueAtTime(900+bright*4500,t);fl.frequency.exponentialRampToValueAtTime(500+bright*900,t+Math.max(.05,d));
 osc('square',f,t,d+.03,fl,-6);osc('sawtooth',f,t,d+.03,fl,7);
 g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.075*vel,t+.008);g.gain.exponentialRampToValueAtTime(.04*vel,t+d*.5+.02);g.gain.exponentialRampToValueAtTime(.0001,t+d+.06);
 fl.connect(g);g.connect(OUT('lead'));
}
function synBass(m,t,d,type='sawtooth',v=.16){const o=AC.createOscillator(),fl=AC.createBiquadFilter(),g=AC.createGain();o.type=type;o.frequency.value=mtof(m);fl.type='lowpass';fl.frequency.setValueAtTime(900,t);fl.frequency.exponentialRampToValueAtTime(220,t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(fl);fl.connect(g);g.connect(OUT('bass'));o.start(t);o.stop(t+d+.02)}
function synPad(m,t,d,notes,v=.022){const g=AC.createGain();g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+.3);g.gain.setValueAtTime(v,t+d-.2);g.gain.linearRampToValueAtTime(.0001,t+d);g.connect(OUT('bass'));for(const n of notes||[m+12,m+19,m+24])osc('triangle',mtof(n),t,d,g)}
function synKick(t){const o=AC.createOscillator(),g=AC.createGain();o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(42,t+.18);g.gain.setValueAtTime(.55,t);g.gain.exponentialRampToValueAtTime(.0001,t+.3);o.connect(g);g.connect(OUT('drums'));o.start(t);o.stop(t+.32)}
function synNoise(t,d,hp,v){const n=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();n.buffer=MUS.bus.noise;f.type='highpass';f.frequency.value=hp;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);n.connect(f);f.connect(g);g.connect(OUT('drums'));n.start(t,Math.random()*.5);n.stop(t+d+.02)}
function synSnare(t,v=1){synNoise(t,.16,1400,.22*v);const o=AC.createOscillator(),g=AC.createGain();o.type='triangle';o.frequency.setValueAtTime(190,t);g.gain.setValueAtTime(.12*v,t);g.gain.exponentialRampToValueAtTime(.0001,t+.1);o.connect(g);g.connect(OUT('drums'));o.start(t);o.stop(t+.12)}

// frases melódicas geradas uma vez (sementes fixas) → a música se repete de forma reconhecível
function phrase(seed,scale,bars,density){const R=rng(seed),out=Array.from({length:bars*16},()=>null);
 for(let b=0;b<bars;b++){if(R()<.25)continue;let s=b*16+((R()*2)|0)*2;while(s<(b+1)*16){if(R()<density){const len=[2,2,4,4,6,8][(R()*6)|0];out[s]={m:scale[(R()*scale.length)|0],d:len};s+=len}else s+=2}}
 return out}

const playing=()=>state==='play'&&G;
const hesitant=()=>playing()&&MUS.slow>.12;

// ================== TRILHAS ==================
const TRACKS={
 // Partitura original (versões adaptativas Marcha → Avanço → Batalha → Épica / Hesitante)
 marcha:{len:TUNE.total,amb:[0,0],
  bpm(){if(!playing())return TUNE.bpm;return(TUNE.bpm+Math.min(24,((G.wave||3)-1)*2)+MUS.heat*14)*(1-MUS.slow)},
  step(st,t,sx){
   const inBar=st%BAR,bar=Math.floor(st/BAR),last=bar===BARS-1;
   const h=playing()?MUS.heat:0,hes=hesitant(),boss=playing()&&G.enemies.some(e=>e.kind==='boss');
   const bright=Math.max(.12,.55+h*.45-(playing()?MUS.slow:0)*1.6);
   for(const n of STEPS[st])for(const m of n.ps){const d=n.d*sx*.92,v=n.ps.length>1?.6:1;synLead(m,t,d,v*(hes?.75:1),bright);if(h>.5)synLead(m-12,t,d,.42*v,bright*.7);if(h>.75)synBell(m+12,t,d)}
   const root=BASS_ROOTS[bar]||38;
   if(inBar===0)synPad(root,t,(last?12:16)*sx);
   if(last){if(inBar===0){synBass(root,t,sx*12);synKick(t);if(h>.5)synCrash(t)}return}
   if(hes){if(inBar%4===0)synBass(root,t,sx*3.4)}else if(inBar%2===0)synBass(inBar%4===0?root:root+12,t,sx*1.7);
   if(h>.25&&!hes&&inBar%2===1){const arp=[0,7,12,15,19,24];synArp(root+24+arp[(st>>1)%arp.length],t,sx*.9,h)}
   const four=(h>.5||boss)&&!hes;
   if(inBar===0||(!hes&&inBar===8)||(four&&inBar%4===0))synKick(t);
   if(hes){if(inBar===8)synSnare(t,.8)}else if(inBar===4||inBar===12)synSnare(t);
   if(!hes&&bar%4===3&&inBar>=13)synSnare(t,.55);
   if(h>.75&&!hes&&bar%2===1&&inBar>=12)synSnare(t,.3+(inBar-12)*.12);
   if(h>.5&&!hes&&inBar===0&&bar%4===0)synCrash(t);
   const hat=hes?4:h>.25?1:2;if(inBar%hat===0)synNoise(t,.04,7500,(inBar%4===0?.05:.03)*(hat===1?.8:1));
  }},
 // Taverna dos Arcanos: lofi medieval ~80 BPM, alaúde em swing, flauta, batida abafada, lareira + vinil
 taverna:{len:8*16,amb:[.55,0],
  chords:[[50,53,57,60],[55,59,62,65],[48,52,55,59],[45,48,52,55],[50,53,57,60],[46,50,53,57],[43,46,50,53],[45,49,52,55]],
  mel:phrase(7,[62,64,65,67,69,72,74,76],8,.55),
  bpm(){return 80*(1-(playing()?MUS.slow*.6:0))},
  step(st,t,sx){
   const b=(st>>4)%8,s=st%16,ch=this.chords[b],swing=(s%4===2)?sx*.33:0,tt=t+swing;
   if(s===0){synPad(0,t,16*sx,ch,.016);synBass(ch[0]-12,t,sx*6,'triangle',.14)}
   if(s===10)synBass(ch[0]-12+(b%2?7:0),tt,sx*4,'triangle',.11);
   if(s%2===0){const arp=[0,1,2,3,2,1,2,3][(s>>1)];synLute(ch[arp]+12,tt,s%4===0?.8:.55,.8)}
   const n=this.mel[st%this.mel.length];if(n)synFlute(n.m,tt,n.d*sx*.95,.85);
   if(s===0||s===7)synLofiKick(t+(s===7?sx*.33:0));
   if(s===4||s===12)synLofiSnare(t);
   if(s%2===0)synLofiHat(tt,s%4===0?1:.6);
  }},
 // Caçada em Velen: tambores de guerra, arpejos rápidos em menor harmônico, rabeca; acelera com o combo
 velen:{len:8*16,amb:[0,0],
  roots:[40,40,36,38,40,43,45,47],
  tri:[[52,55,59],[52,55,59],[48,52,55],[50,54,57],[52,55,59],[55,59,62],[57,60,64],[59,63,66]],
  mel:phrase(13,[64,66,67,69,71,72,75,76,79],8,.7),
  bpm(){const c=playing()?Math.min(25,G.combo*1.2):0;return(135+c)*(1-(playing()?MUS.slow:0))},
  step(st,t,sx){
   const b=(st>>4)%8,s=st%16,tr=this.tri[b],root=this.roots[b],h=playing()?MUS.heat:.3;
   if(s===0)synDrone(root-12,t,16*sx);
   const ap=[0,1,2,3,4,5,4,3][s%8],notes=[tr[0],tr[1],tr[2],tr[0]+12,tr[1]+12,tr[2]+12];synLute(notes[ap],t,.5+(s%4===0?.3:0),.35);
   const n=this.mel[st%this.mel.length];if(n)synFiddle(n.m,t,n.d*sx*.9,.9);
   if(s===0||s===6||s===8||s===14)synTaiko(t,1,s===8?75:90);
   if(s===3||s===11)synTaiko(t,.55,140);
   if(s===4||s===12)synFrame(t,1);
   if(h>.5&&b%2===1&&s>=12)synTaiko(t,.4+(s-12)*.12,160);
   if(s%2===1&&h>.35)synFrame(t,.25);
   if(s%4===0)synBass(root,t,sx*3,'sawtooth',.12);
  }},
 // Floresta Antiga: harpa, sinos, pad etéreo, vento e pássaros
 floresta:{len:8*16,amb:[0,.6],
  chords:[[57,60,64,71],[53,57,60,64],[48,55,60,64],[55,59,62,67],[57,60,64,71],[53,57,60,65],[50,57,60,64],[52,56,59,64]],
  mel:phrase(21,[69,71,72,74,76,79,81],8,.35),
  bpm(){return 66*(1-(playing()?MUS.slow*.5:0))},
  step(st,t,sx){
   const b=(st>>4)%8,s=st%16,ch=this.chords[b];
   if(s===0){synPad(0,t,16*sx,ch.map(n=>n-12),.02);synBass(ch[0]-24,t,sx*14,'sine',.12)}
   if(s%2===0){const seq=[0,1,2,3,0,1,2,3],oct=s>=8?12:0;synHarp(ch[seq[s>>1]]+oct,t,s===0?.9:.6)}
   if(s%2===0&&Math.random()<.1)synChime([81,84,86,88,91][(Math.random()*5)|0],t+Math.random()*sx);
   if(b>=4){const n=this.mel[st%this.mel.length];if(n)synFlute(n.m,t,n.d*sx,.6)}
   if(s===8&&Math.random()<.5)synBird(t+Math.random()*sx*4);
  }}
};

// Modo Dinâmico: calmo (menu/início) → marcha (pressão média) → batalha (ondas altas/chefes/duelo intenso)
function dynamicPick(){
 if(!playing())return'taverna';
 const boss=G.mode==='arcade'&&G.enemies.some(e=>e.kind==='boss'),w=G.mode==='duel'?6:G.wave;
 const I=Math.max(MUS.heat*.9,(w-1)/9,boss?1:0,G.mode==='duel'?.45+MUS.heat*.5:0);
 return I>=.72?'velen':I>=.3?'marcha':'taverna';
}
// No menu inicial toca SEMPRE o lofi da Taverna (exceto como prévia dentro do Santuário de Música)
const desiredTrack=()=>state==='menu'&&!(modalOpen&&modal.tab==='audio')?'taverna':MUS.style==='dynamic'?dynamicPick():MUS.style;
function musicBpm(){return TRACKS[MUS.cur||'marcha'].bpm()}

// troca de trilha com fade: abaixa o volume da trilha atual e entra a próxima do início
function beginSwitch(fast){if(!MUS.bus)return;const now=AC.currentTime;MUS.switching=true;MUS.switchStart=fast?now-.7:now;MUS.bus.tg.gain.cancelScheduledValues(now);MUS.bus.tg.gain.setTargetAtTime(.0001,now,fast?.08:.35)}

function musicMix(){
 if(!MUS.bus)return;const now=AC.currentTime,b=MUS.bus;
 const vol=(!MUS.on||document.hidden?0:modalOpen?.45:state==='paused'?.18:state==='play'?.85:.45)*MUS.vol;
 b.master.gain.setTargetAtTime(vol,now,.25);
 b.drums.gain.setTargetAtTime(state==='play'||MUS.cur!=='marcha'?1:.35,now,.3);
 const tr=TRACKS[MUS.cur]||TRACKS.marcha,amb=tr.amb;
 b.ambHearth.gain.setTargetAtTime(amb[0]*.09,now,.8);b.ambWind.gain.setTargetAtTime(amb[1]*.12,now,.8);
 const base=hesitant()?1300:state==='paused'?900:18000;
 if(base!==MUS.mufBase){MUS.mufBase=base;b.muf.frequency.setTargetAtTime(base,now,.3)}
}
function musicTick(){
 if(document.hidden){musicMix();return}
 const ac=AC,now=ac.currentTime;if(now>MUS.next+.2)MUS.next=now+.05;
 const want=desiredTrack();
 if(want!==MUS.want){MUS.want=want;MUS.wantSince=now}
 if(!MUS.cur){MUS.cur=want;MUS.step=0}
 else if(MUS.want!==MUS.cur&&!MUS.switching&&(MUS.style!=='dynamic'||now-MUS.wantSince>2.2))beginSwitch(false);
 while(MUS.next<now+.15){
  if(MUS.switching&&MUS.next>=MUS.switchStart+.9){MUS.cur=MUS.want;MUS.step=0;MUS.switching=false;MUS.bus.tg.gain.cancelScheduledValues(MUS.next);MUS.bus.tg.gain.setTargetAtTime(1,MUS.next,.45)}
  const tr=TRACKS[MUS.cur],sx=60/tr.bpm()/4;
  tr.step(MUS.step,MUS.next,sx);
  MUS.next+=sx;MUS.step=(MUS.step+1)%tr.len;
 }
 musicMix();
}
function musicStart(){
 if(!MUS.on)return;try{musicInit();if(AC.state==='suspended')AC.resume();if(MUS.timer)return;MUS.next=AC.currentTime+.1;MUS.timer=setInterval(musicTick,25)}catch(e){}
}
function toggleMusic(){
 MUS.on=!MUS.on;store.set('music',MUS.on);
 if(MUS.on)musicStart();else{clearInterval(MUS.timer);MUS.timer=null;musicMix()}
 const b=document.getElementById('musicBtn');if(b){b.textContent=MUS.on?t('music.on'):t('music.off');b.classList.toggle('off',!MUS.on)}
}
