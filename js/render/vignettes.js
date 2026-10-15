// Mage Animals — js/render/vignettes.js · Menu vivo: vinhetas aconchegantes com os magos em rotinas do dia a dia (idle loops).
// API pública: VIGNETTES (registro das cenas), drawVignette(), randomMenuScene(), drawMenuScene().
// 🐱 Taverna (bebe leite da caneca, cauda balançando, brasas da lareira)
// 🐰 Forja Arcana (martelinho mágico polindo o cristal do cajado, chamas azuis, faíscas e purpurina)
// 🦊 Biblioteca (livro folheando sozinho + xícara de chá levada à boca por telecinese)
// 🦉 Observatório (olhando pela luneta, pena mágica escrevendo num pergaminho, constelações e estrelas cadentes)
// 🔥 RARA (12%): Festa na Fogueira — os 4 magos ao redor de uma fogueira mágica colorida
// Fundo de cada cena é pré-renderizado; por quadro só animam os elementos vivos.
'use strict';

const MENU_SCENES=[
 {id:'tavern',ch:'gato',ic:'🍺',ax:170,ay:128,s:1.45},
 {id:'forge',ch:'coelho',ic:'⚒️',ax:128,ay:118,s:1.5},
 {id:'library',ch:'raposa',ic:'📖',ax:118,ay:132,s:1.45},
 {id:'observatory',ch:'coruja',ic:'🔭',ax:196,ay:158,s:1.3},
 {id:'kingdom',ch:'gato',ic:'🏛️',ax:316,ay:128,s:.46,dyn:true}, // 🏛️ o Reino (mapa da Vila) com o mago escolhido em primeiro plano
 {id:'campfire',ch:'all',ic:'🔥',rare:true,cast:[
  {ch:'gato',ax:40,ay:150,s:1.1},{ch:'coruja',ax:418,ay:150,s:1.1},{ch:'coelho',ax:118,ay:206,s:.95},{ch:'raposa',ax:352,ay:206,s:.95}]}
];
const CAMPFIRE_CHANCE=.12;
const menuScene={id:'tavern',ch:'gato',v:0,t:0,cheer:0,blink:0,blinkIn:2.5};
// 🎨 variações de fundo por cena (0 = original). Sorteada ao entrar na cena, nunca repete a anterior da mesma cena.
const BG_VARIANTS=3,_lastV={};
function rollVariant(id){const f=(location.hash.match(/[#&]v=(\d)/)||[])[1];if(f!=null)return(+f)%BG_VARIANTS;let v;do v=(Math.random()*BG_VARIANTS)|0;while(v===_lastV[id]&&BG_VARIANTS>1);return _lastV[id]=v}
const sceneBg=new Map(),vignetteCv=mkCanvas(W,H),mAvCvs={};
const avCv=id=>mAvCvs[id]||(mAvCvs[id]=mkCanvas(140,140));
// partículas do menu num anel fixo (sem alocação)
const MENU_FX=DeviceManager.menuFx; // 1 no desktop · 0,4 no mobile (menos elementos secundários por quadro)
const MP=Array.from({length:DeviceManager.isMobile?70:200},()=>({life:0,max:1,x:0,y:0,vx:0,vy:0,col:'#fff',s:1,g:0,star:false}));let mpI=0;
function mEmit(x,y,vx,vy,life,col,s,g,star){if(MENU_FX<1&&Math.random()>MENU_FX)return;const p=MP[mpI];mpI=(mpI+1)%MP.length;p.x=x;p.y=y;p.vx=vx;p.vy=vy;p.life=p.max=life;p.col=col;p.s=s;p.g=g||0;p.star=!!star}

// sem .find()/arrays novos por quadro: cena atual em cache; elenco solo pré-montado
let _curId=null,_cur=MENU_SCENES[0];
const curScene=()=>{if(_curId!==menuScene.id){_curId=menuScene.id;_cur=MENU_SCENES[0];for(let i=0;i<MENU_SCENES.length;i++)if(MENU_SCENES[i].id===_curId){_cur=MENU_SCENES[i];break}}return _cur};
for(const s of MENU_SCENES)if(!s.cast)s.solo=[s];
const castOf=S=>S.cast||S.solo;
const sceneForChar=id=>(MENU_SCENES.find(s=>s.ch===id&&!s.dyn)||MENU_SCENES[0]).id;
function setMenuScene(id,newV){const s=MENU_SCENES.find(x=>x.id===id)||MENU_SCENES[0];if(s.dyn)s.ch=CHARS[selected].id;if(newV||s.id!==menuScene.id)menuScene.v=rollVariant(s.id);menuScene.id=s.id;menuScene.ch=s.ch} // Reino: governa o mago selecionado
function randomMenuScene(){
 const force=(location.hash.match(/scene=(\w+)/)||[])[1];if(force)return setMenuScene(force);
 if(Math.random()<CAMPFIRE_CHANCE)return setMenuScene('campfire',true);
 const pool=MENU_SCENES.filter(s=>!s.rare&&s.id!==menuScene.id);setMenuScene(pool[(Math.random()*pool.length)|0].id);
}
// ponto do retrato (140×140) → tela, para um membro do elenco
// pontos do retrato → tela num anel de 12 objetos reutilizados (zero alocação; nenhum resultado vive além do quadro)
const _PR=Array.from({length:12},()=>({x:0,y:0}));let _pri=0;
const P=(m,px,py)=>{const o=_PR[_pri];_pri=(_pri+1)%12;o.x=m.ax+px*m.s;o.y=m.ay+py*m.s;return o};
const mouthOf=m=>P(m,70,76);
function gemPos(m){m=m||castOf(curScene())[0];return P(m,103+GEM_LOCAL.x*.78,134+GEM_LOCAL.y*.78)}
const CH_ID={};for(const c of CHARS)CH_ID[c.id]=c;
const furOf=id=>CH_ID[id].fur;
const CAT_TAIL_TIP=shade(CH_ID.gato.fur,-.25),ZERO_POSE={dy:0,rot:0};
// paleta arco-íris pré-calculada (a fogueira e as notas não montam strings de cor por quadro)
const HUE36=Array.from({length:36},(_,i)=>hslHex(i*10)),HUE12=Array.from({length:12},(_,i)=>HUE36[i*3]);
const hue=d=>HUE36[(((d%360)+360)%360/10)|0];
const FL1=['','','#fff6d8'],FL2=['','','#ffffff'],FL3=['','','#ffffff'];
// marshmallow: 32 tons do cru ao tostado, calculados uma vez
const MARSH=Array.from({length:32},(_,i)=>{const k=i/31;return k<.6?mix('#fffaf0','#f0c070',k/.6):mix('#f0c070','#9a5a2a',(k-.6)/.4)});
const FORGE_GEMS=[[462,'#7ad0ff'],[486,'#ff7aff'],[512,'#9aff8a']],GLITTER=['#ff9aff','#9ae6ff','#d8b0ff','#fff'],SCOPE_RINGS=[30,80,130,162],LUTE_STR=[-1.5,0,1.5],SIDES=[-1,1];
const _PV={x:0,y:0},_MT={x:0,y:0};
let _hammerG=null,_scopeG=null,_scrollG=null;
const ease=k=>k<=0?0:k>=1?1:k*k*(3-2*k);
// reação fofa ao escolher o mago: pulinho de vitória + rajada de magia saindo da(s) gema(s)
function menuCheer(){
 menuScene.cheer=1;
 for(const m of castOf(curScene())){const g=gemPos(m),col=CHARS.find(c=>c.id===m.ch).color;
  for(let i=0;i<30;i++){const a=Math.random()*6.283,v=rand(40,190);mEmit(g.x,g.y,Math.cos(a)*v,Math.sin(a)*v-40,rand(.6,1.2),i%3?col:'#ffffff',rand(1.4,3),60,true)}}
}

// ---------- fundos pré-renderizados ----------
function planks(c,x0,y0,x1,y1,c0,c1,vertical,R){
 const g=c.createLinearGradient(0,y0,0,y1);g.addColorStop(0,c0);g.addColorStop(1,c1);c.fillStyle=g;c.fillRect(x0,y0,x1-x0,y1-y0);
 c.strokeStyle='rgba(0,0,0,.35)';c.lineWidth=2;
 if(vertical){for(let x=x0;x<x1;x+=44+R()*10){c.beginPath();c.moveTo(x,y0);c.lineTo(x,y1);c.stroke()}}
 else{for(let y=y0;y<y1;y+=26){c.beginPath();c.moveTo(x0,y);c.lineTo(x1,y);c.stroke()}}
 c.strokeStyle='rgba(255,220,180,.04)';c.lineWidth=1;for(let i=0;i<60;i++){const x=x0+R()*(x1-x0),y=y0+R()*(y1-y0);c.beginPath();c.moveTo(x,y);vertical?c.lineTo(x+R()*3,y+20+R()*40):c.lineTo(x+20+R()*40,y+R()*2);c.stroke()}
}
function stoneWall(c,x0,y0,x1,y1,base,R){
 c.fillStyle=shade(base,-.5);c.fillRect(x0,y0,x1-x0,y1-y0);
 for(let y=y0,row=0;y<y1;y+=24,row++)for(let x=x0-(row%2)*26;x<x1;x+=52){c.fillStyle=shade(base,-.25+R()*.3);c.beginPath();c.roundRect(x+2,y+2,48,20,4);c.fill();c.fillStyle='rgba(255,255,255,.05)';c.fillRect(x+4,y+3,44,2)}
}
function nightWindow(c,x,y,w,h,R,o){
 o=o||{};const sky=o.sky||['#0c1240','#3a2a6e'];
 c.fillStyle='#2a1a0e';c.beginPath();c.roundRect(x-8,y-8,w+16,h+16,[w/2+8,w/2+8,6,6]);c.fill();
 const g=c.createLinearGradient(0,y,0,y+h);g.addColorStop(0,sky[0]);g.addColorStop(1,sky[1]);c.fillStyle=g;c.beginPath();c.roundRect(x,y,w,h,[w/2,w/2,2,2]);c.fill();
 if(o.sun){c.fillStyle='#ffd27a';c.beginPath();c.arc(x+w*.62,y+h*.72,16,0,6.283);c.fill();c.fillStyle='rgba(90,40,90,.55)';c.fillRect(x,y+h*.78,w,h*.22)} // sol se pondo atrás dos morros
 else{c.fillStyle='#fff';for(let i=0;i<22;i++){c.globalAlpha=.4+R()*.6;c.fillRect(x+R()*w,y+10+R()*h*.7,1.4,1.4)}c.globalAlpha=1;
  c.fillStyle='#fff8e0';c.beginPath();c.arc(x+w*.68,y+h*.3,11,0,6.283);c.fill();c.fillStyle=sky[0];c.beginPath();c.arc(x+w*.68-5,y+h*.3-3,10,0,6.283);c.fill()}
 if(o.snow){c.fillStyle='#fff';for(let i=0;i<26;i++){c.globalAlpha=.5+R()*.5;c.beginPath();c.arc(x+R()*w,y+8+R()*h*.9,1+R()*1.3,0,6.283);c.fill()}c.globalAlpha=1;c.fillStyle='#eef4ff';c.beginPath();c.roundRect(x-10,y+h+4,w+20,7,4);c.fill()}
 c.strokeStyle='#2a1a0e';c.lineWidth=5;c.beginPath();c.moveTo(x+w/2,y);c.lineTo(x+w/2,y+h);c.moveTo(x,y+h*.52);c.lineTo(x+w,y+h*.52);c.stroke();
}
function bookshelf(c,x0,y0,x1,y1,R){
 c.fillStyle='#2a160c';c.fillRect(x0,y0,x1-x0,y1-y0);
 const cols=['#8a2a2a','#2a4a8a','#2a6a3a','#8a6a2a','#5a2a6a','#a04a2a','#3a5a6a'];
 for(let y=y0+12;y<y1-20;y+=66){
  c.fillStyle='#4a2a14';c.fillRect(x0,y+52,x1-x0,8);
  for(let x=x0+6;x<x1-12;){const w=7+R()*9,h=30+R()*20,tilt=R()<.12;c.save();c.translate(x,y+52);if(tilt)c.rotate(-.18);c.fillStyle=cols[(R()*cols.length)|0];c.fillRect(0,-h,w,h);c.fillStyle='rgba(255,217,138,.55)';c.fillRect(1,-h+5,w-2,2);c.fillRect(1,-10,w-2,2);c.restore();x+=w+1+(tilt?6:0)}
 }
 c.strokeStyle='#1a0c06';c.lineWidth=6;c.strokeRect(x0+3,y0,x1-x0-6,y1-y0);
}
// bandeirinhas/luzes penduradas (x0→x1, curva para baixo)
function bunting(c,x0,x1,y,sag,cols,R,lights){
 c.strokeStyle='rgba(30,16,8,.8)';c.lineWidth=1.5;c.beginPath();c.moveTo(x0,y);c.quadraticCurveTo((x0+x1)/2,y+sag*2,x1,y);c.stroke();
 const n=Math.round((x1-x0)/26);for(let i=1;i<n;i++){const k=i/n,px=x0+(x1-x0)*k,py=y+sag*4*k*(1-k);
  if(lights){c.globalAlpha=.25;c.fillStyle=cols[i%cols.length];c.beginPath();c.arc(px,py+5,9,0,6.283);c.fill();c.globalAlpha=1;c.beginPath();c.arc(px,py+5,3.4,0,6.283);c.fill()}
  else{c.fillStyle=cols[i%cols.length];c.beginPath();c.moveTo(px-8,py);c.lineTo(px+8,py);c.lineTo(px,py+14);c.fill()}}
}
// cristal facetado (caverna de cristal / céu)
function crystal(c,x,y,h,col,tilt){c.save();c.translate(x,y);c.rotate(tilt||0);c.fillStyle=col;c.beginPath();c.moveTo(-h*.22,0);c.lineTo(-h*.2,-h*.7);c.lineTo(0,-h);c.lineTo(h*.2,-h*.7);c.lineTo(h*.22,0);c.fill();c.fillStyle='rgba(255,255,255,.35)';c.beginPath();c.moveTo(-h*.08,-h*.05);c.lineTo(-h*.08,-h*.7);c.lineTo(0,-h*.92);c.lineTo(0,-h*.05);c.fill();c.restore()}
function gear(c,x,y,r,col,teeth){c.fillStyle=col;c.beginPath();for(let i=0;i<teeth*2;i++){const a=i/(teeth*2)*6.283,rr=i%2?r:r*1.18;c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr)}c.fill();c.fillStyle='rgba(0,0,0,.45)';c.beginPath();c.arc(x,y,r*.38,0,6.283);c.fill()}
function softBlob(c,x,y,rx,ry,col,a){c.save();c.globalAlpha=a;const g=c.createRadialGradient(x,y,0,x,y,rx);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.translate(x,y);c.scale(1,ry/rx);c.beginPath();c.arc(0,0,rx,0,6.283);c.fill();c.restore()}
function pine(c,x,y,h,col){c.fillStyle=col;c.fillRect(x-3,y-h*.18,6,h*.18);for(let i=0;i<4;i++){const w=h*(.42-i*.08),yy=y-h*.12-i*h*.2;c.beginPath();c.moveTo(x-w,yy);c.lineTo(x,yy-h*.36);c.lineTo(x+w,yy);c.fill()}}
// 🏛️ fundo do Reino: céu alto + o mapa ilustrado da Vila (js/render/villagemap.js) + campos até a base do menu
const KMAP={ox:63,oy:34,k:.74}; // mapa 640×380 → 474×281, centrado na faixa de cima (a parte de baixo fica sob o menu)
const KSKY=[{sky:['#0b0e2a','#26205a'],stars:1,hill:'#2a2a5e'},{sky:['#2a1850','#e0784a'],stars:.25,hill:'#4a2a5a',sun:'#ffcf7a',tint:'rgba(255,140,60,.13)'},{sky:['#16306a','#f0a8a0'],stars:.1,hill:'#3a4a7a',sun:'#fff0c8',tint:'rgba(255,190,215,.11)'}];
function paintKingdom(c,x,v){
 const k=KMAP.k,gy=KMAP.oy+104*k,K=KSKY[v||0];
 let g=x.createLinearGradient(0,0,0,gy+20);g.addColorStop(0,K.sky[0]);g.addColorStop(1,K.sky[1]);x.fillStyle=g;x.fillRect(0,0,W,gy+20);
 x.fillStyle='#fff';for(let i=0;i<70*K.stars;i++){x.globalAlpha=.25+((i*37)%70)/100;x.fillRect((i*149+i*i)%W,(i*53)%Math.round(gy-20),1.4,1.4)}x.globalAlpha=1;
 if(K.sun){softBlob(x,520,gy-40,90,60,K.sun,.5);x.fillStyle=K.sun;x.beginPath();x.arc(520,gy-38,18,0,6.283);x.fill()}
 x.fillStyle=K.hill;x.beginPath();x.moveTo(0,gy);[[0,gy-36],[40,gy-60],[90,gy-30],[150,gy-66],[220,gy-34],[380,gy-40],[450,gy-70],[520,gy-34],[570,gy-62],[600,gy-40],[600,gy]].forEach(p=>x.lineTo(p[0],p[1]));x.fill();
 g=x.createLinearGradient(0,gy,0,H);g.addColorStop(0,'#1f5a42');g.addColorStop(.5,'#16402f');g.addColorStop(1,'#0c2419');x.fillStyle=g;x.fillRect(0,gy-2,W,H);
 x.fillStyle='rgba(120,220,140,.07)';for(const[a,b,r]of[[40,gy+80,60],[560,gy+70,60],[300,KMAP.oy+300,140],[120,520,110],[480,560,120]]){x.beginPath();x.ellipse(a,b,r,r*.4,0,0,6.283);x.fill()}
 x.save();x.translate(KMAP.ox,KMAP.oy);x.scale(k,k);paintVillage(x,Village.data.lv);x.restore();
 // estrada que sai da praça e desce até a base (por cima do mapa, entre a Taverna e o Estábulo)
 const road=()=>{x.beginPath();x.moveTo(300,KMAP.oy+250*k);x.bezierCurveTo(286,KMAP.oy+330*k,250,470,300,680)};
 x.lineCap='round';road();x.strokeStyle='#8a7a5a';x.lineWidth=14;x.stroke();road();x.strokeStyle='#b8a47a';x.lineWidth=9;x.stroke();
 for(const[a,b,h,col]of[[236,330,12,'#7ae8ff'],[340,380,10,'#c9a6ff'],[214,440,13,'#ffd24a'],[352,500,11,'#7ae8ff'],[230,560,12,'#c9a6ff'],[120,350,10,'#7ae8ff'],[480,360,10,'#ffd24a'],[470,540,12,'#7ae8ff']]){vmGlow(x,a,b-6,18,col,.4);vmCrystal(x,a,b,h,col,.2)}
 for(const[a,b,s]of[[18,gy+40,.9],[44,gy+70,1],[20,gy+120,1.1],[580,gy+40,.9],[556,gy+80,1],[584,gy+130,1.1],[40,400,1.2],[560,420,1.2],[150,470,1],[450,480,1],[90,600,1.3],[520,620,1.3],[230,640,1],[400,650,1.1]])vmTree(x,a,b,s);
 if(K.tint){x.fillStyle=K.tint;x.fillRect(0,0,W,H)} // luz do entardecer/amanhecer sobre o Reino inteiro
 return c;
}
// paletas por variação: [0] original · [1] e [2] novas (mesmo layout, mesma posição dos objetos animados)
const BGV={
 tavern:[{wall:['#5a3418','#2a170a'],floor:['#3a2010','#1a0e06'],rug:'rgba(140,30,30,.55)',stone:'#7a6a5a'},
  {wall:['#6a4222','#36200c'],floor:['#4a2a14','#1e1008'],rug:'rgba(30,110,120,.55)',stone:'#8a7058',win:{sky:['#ff9a5a','#7a3a8a'],sun:1},flags:1},     // entardecer + bandeirinhas
  {wall:['#4a2c18','#22130a'],floor:['#32200e','#160c04'],rug:'rgba(90,40,130,.55)',stone:'#6a6a78',win:{sky:['#18224a','#4a5a8a'],snow:1},xmas:1}],     // noite de neve + guirlanda
 forge:[{stone:'#4a5060',floor:['#34343e','#141418']},
  {stone:'#4a3a6a',floor:['#2a2440','#100c1a'],crystals:1},          // caverna de cristal
  {stone:'#6a4a3a',floor:['#3a2a22','#160e0a'],gears:1}],            // oficina de cobre
 library:[{bg:['#3a2440','#140a16'],sg:['#7a3aaa','#2a6aaa','#aa3a5a','#3a9a6a','#aa8a2a'],rug:'rgba(60,30,90,.6)'},
  {bg:['#1e3a34','#08140f'],sg:['#2a8a5a','#aac84a','#1a6a7a','#d0a84a','#4aaa8a'],rug:'rgba(20,80,60,.6)',ivy:1},   // esmeralda + heras
  {bg:['#1a2450','#080a1c'],sg:['#2a4aca','#6a8aff','#aa3a8a','#2aaaca','#d0b04a'],rug:'rgba(30,50,120,.6)',orbs:1}],   // safira + orbes
 observatory:[{sky:['#040620','#1a1450','#2a1a5a'],stone:'#4a4660',hill:'#120e2e'},
  {sky:['#020c18','#0a2a3a','#14304a'],stone:'#3e4a5a',hill:'#0a1a24',aurora:1},                 // aurora boreal
  {sky:['#0a0420','#2a1050','#4a1a5a'],stone:'#544060',hill:'#1a0a28',nebula:1,planet:1}],       // nebulosa + planeta com anel
 campfire:[{sky:['#04061c','#16123e','#2a1a48'],ground:['#16261c','#060c08'],far:'#0c1430',near:'#070c20',hill:'#141a3c'},
  {sky:['#0c0618','#2a123a','#4a1e3a'],ground:['#2a1a0c','#0c0804'],far:'#2a1418',near:'#160a0c',hill:'#24142a',leaves:1},    // outono
  {sky:['#060c22','#1a2a52','#3a4a7a'],ground:['#5a6a8a','#141c30'],far:'#1a2a48',near:'#0e1830',hill:'#24345a',snow:1}]      // inverno
};
function paintScene(id,v){
 v=v||0;const c=mkCanvas(W,H),x=c.getContext('2d'),R=rng(id.length*97+3+v*1013),Pv=(BGV[id]||[])[v]||(BGV[id]||[])[0]||{};
 if(id==='kingdom')return paintKingdom(c,x,v);
 if(id==='tavern'){
  planks(x,0,0,W,360,Pv.wall[0],Pv.wall[1],true,R);
  x.fillStyle='#24140a';x.fillRect(0,28,W,18);x.fillRect(0,340,W,10);
  nightWindow(x,48,78,96,120,R,Pv.win);
  if(Pv.flags)bunting(x,0,W,48,16,['#ff6a6a','#ffd24a','#6aff9a','#7ad0ff','#c79aff'],R);
  if(Pv.xmas){bunting(x,0,W,48,14,['#ff5a5a','#ffd24a','#7aff9a','#7ad0ff'],R,true);
   x.strokeStyle='#2a6a3a';x.lineWidth=9;x.beginPath();x.arc(480,104,20,0,6.283);x.stroke();x.fillStyle='#ff4a4a';for(let i=0;i<6;i++){const a=i/6*6.283;x.beginPath();x.arc(480+Math.cos(a)*20,104+Math.sin(a)*20,3,0,6.283);x.fill()}
   x.fillStyle='#c83a3a';x.beginPath();x.moveTo(480,122);x.lineTo(472,136);x.lineTo(488,136);x.fill()} // guirlanda sobre a lareira
  x.fillStyle='#3a2210';x.fillRect(26,250,150,8);const bc=['#6aff9a','#ff6a8a','#ffd24a','#7ad0ff'];for(let i=0;i<5;i++){x.fillStyle=bc[i%4];x.globalAlpha=.75;x.beginPath();x.roundRect(36+i*27,216,14,34,[6,6,2,2]);x.fill();x.globalAlpha=1;x.fillStyle='#2a1a0e';x.fillRect(40+i*27,210,6,8)}
  stoneWall(x,400,140,580,360,Pv.stone,R);                                               // lareira
  x.fillStyle='#4a3020';x.fillRect(388,132,204,14);
  x.fillStyle='#0e0604';x.beginPath();x.moveTo(430,360);x.lineTo(430,250);x.quadraticCurveTo(480,200,530,250);x.lineTo(530,360);x.fill();
  x.fillStyle='#4a2a12';x.beginPath();x.roundRect(440,334,80,12,5);x.fill();x.beginPath();x.roundRect(448,324,64,11,5);x.fill();
  planks(x,0,360,W,H,Pv.floor[0],Pv.floor[1],false,R);
  x.fillStyle=Pv.rug;x.beginPath();x.ellipse(280,420,210,40,0,0,6.283);x.fill();x.strokeStyle='rgba(255,200,120,.25)';x.lineWidth=3;x.beginPath();x.ellipse(280,420,190,32,0,0,6.283);x.stroke();
 }else if(id==='forge'){
  stoneWall(x,0,0,W,360,Pv.stone,R);
  x.fillStyle='#1a1a2a';x.fillRect(0,0,W,30);
  x.fillStyle='#2a2a3a';x.beginPath();x.moveTo(20,360);x.lineTo(20,200);x.quadraticCurveTo(115,120,210,200);x.lineTo(210,360);x.fill();  // fornalha arcana
  x.fillStyle='#3a4258';for(let y=210;y<350;y+=16)for(let k=0;k<4;k++){x.fillRect(28+k*45+(y/16%2)*20,y,40,13)}
  x.fillStyle='#040818';x.beginPath();x.moveTo(60,340);x.lineTo(60,250);x.quadraticCurveTo(115,200,170,250);x.lineTo(170,340);x.fill();
  x.strokeStyle='#7ad0ff';x.globalAlpha=.35;x.lineWidth=2;for(const[a,b]of[[115,186],[40,226],[190,226]]){x.beginPath();x.arc(a,b,7,0,6.283);x.moveTo(a,b-5);x.lineTo(a,b+5);x.moveTo(a-5,b);x.lineTo(a+5,b);x.stroke()}x.globalAlpha=1; // runas
  x.strokeStyle='#1a1410';x.lineWidth=5;x.beginPath();x.moveTo(470,70);x.lineTo(470,150);x.moveTo(520,70);x.lineTo(530,150);x.stroke();  // ferramentas penduradas
  x.fillStyle='#2a2420';x.fillRect(452,138,36,18);x.fillRect(518,140,24,10);x.fillStyle='#4a3a2a';x.fillRect(440,62,110,8);
  if(Pv.crystals){for(const[a,b,h,col,t]of[[250,360,46,'#b07aff',-.2],[276,360,62,'#d0a0ff',.05],[300,360,38,'#7ad0ff',.3],[580,360,52,'#b07aff',-.15],[598,360,34,'#7ad0ff',.2],[300,40,40,'#9a7ad0',3.14],[360,40,28,'#7ad0ff',3.0],[230,40,30,'#c9a6ff',3.3]]){softBlob(x,a,b-h*.5,h,h,col,.25);crystal(x,a,b,h,col,t)}}
  if(Pv.gears){gear(x,300,110,34,'#8a5a32',10);gear(x,352,150,22,'#a8743a',8);gear(x,580,250,40,'#7a4e2a',12);
   x.strokeStyle='#5a4a3a';x.lineWidth=3;for(let i=0;i<9;i++){x.beginPath();x.ellipse(250,40+i*14,4,7,0,0,6.283);x.stroke()}x.fillStyle='#3a2a1a';x.fillRect(240,166,20,14)}
  planks(x,0,360,W,H,Pv.floor[0],Pv.floor[1],false,R);
 }else if(id==='library'){
  const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,Pv.bg[0]);g.addColorStop(1,Pv.bg[1]);x.fillStyle=g;x.fillRect(0,0,W,H);
  x.fillStyle='rgba(255,220,160,.06)';x.beginPath();x.arc(300,120,92,0,6.283);x.fill();
  x.fillStyle='#1a0c1a';x.beginPath();x.arc(300,120,74,0,6.283);x.fill();                                  // rosácea
  const sg=Pv.sg;for(let i=0;i<10;i++){x.fillStyle=sg[i%5];x.globalAlpha=.55;x.beginPath();x.moveTo(300,120);x.arc(300,120,68,i*.628,(i+1)*.628);x.fill()}x.globalAlpha=1;
  x.strokeStyle='#1a0c1a';x.lineWidth=4;for(let i=0;i<10;i++){x.beginPath();x.moveTo(300,120);x.lineTo(300+Math.cos(i*.628)*70,120+Math.sin(i*.628)*70);x.stroke()}x.beginPath();x.arc(300,120,22,0,6.283);x.stroke();
  bookshelf(x,0,40,150,370,R);bookshelf(x,470,40,W,370,R);
  if(Pv.ivy){x.strokeStyle='#2a6a3a';x.lineWidth=2.5;for(const[sx,len]of[[20,120],[70,80],[118,140],[490,100],[540,150],[586,90]]){x.beginPath();x.moveTo(sx,40);for(let yy=0;yy<=len;yy+=10)x.lineTo(sx+Math.sin(yy*.12)*6,40+yy);x.stroke();
    x.fillStyle='#3a9a4a';for(let yy=8;yy<len;yy+=13){x.beginPath();x.ellipse(sx+Math.sin(yy*.12)*6+(yy%26?5:-5),40+yy,5,3,yy%26?.5:-.5,0,6.283);x.fill()}}}
  if(Pv.orbs){for(const[a,b,col]of[[200,70,'#7ad0ff'],[410,60,'#c9a6ff'],[180,250,'#ffd98a'],[420,280,'#7ad0ff']]){softBlob(x,a,b,34,34,col,.35);x.fillStyle=col;x.beginPath();x.arc(a,b,5,0,6.283);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(a-1.5,b-1.5,1.8,0,6.283);x.fill()}}
  planks(x,0,370,W,H,'#3a2214','#140a06',false,R);
  x.fillStyle=Pv.rug;x.beginPath();x.ellipse(300,430,230,44,0,0,6.283);x.fill();x.strokeStyle='rgba(255,217,138,.3)';x.lineWidth=3;x.beginPath();x.ellipse(300,430,206,36,0,0,6.283);x.stroke();
 }else if(id==='observatory'){
  const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,Pv.sky[0]);g.addColorStop(.55,Pv.sky[1]);g.addColorStop(1,Pv.sky[2]);x.fillStyle=g;x.fillRect(0,0,W,H);
  if(Pv.nebula){softBlob(x,170,120,190,90,'#ff6ac8',.28);softBlob(x,330,200,220,80,'#6a7aff',.25);softBlob(x,90,230,120,60,'#c86aff',.2)}
  if(Pv.aurora){for(const[y0,amp,col,a]of[[90,30,'#3affa0',.22],[130,24,'#3ad8ff',.18],[70,20,'#a0ff6a',.14]]){x.save();x.globalAlpha=a;const ag=x.createLinearGradient(0,y0-40,0,y0+90);ag.addColorStop(0,'rgba(0,0,0,0)');ag.addColorStop(.35,col);ag.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=ag;
   x.beginPath();x.moveTo(0,y0);for(let i=0;i<=24;i++)x.lineTo(i*25,y0+Math.sin(i*.55+y0)*amp);for(let i=24;i>=0;i--)x.lineTo(i*25,y0+90+Math.sin(i*.55+y0)*amp*.6);x.fill();x.restore()}}
  for(let i=0;i<520;i++){const k=R();x.globalAlpha=.12+R()*.3;x.fillStyle='#fff';x.fillRect(k*W,30+k*220+(R()-.5)*90,.9,.9)}x.globalAlpha=1;
  for(const[rr,a]of[[160,.08],[80,.16]]){const mg=x.createRadialGradient(470,110,20,470,110,rr);mg.addColorStop(0,`rgba(230,225,255,${a})`);mg.addColorStop(1,'rgba(230,225,255,0)');x.fillStyle=mg;x.fillRect(0,0,W,H)}
  if(Pv.planet){ // planeta com anel no lugar da lua (a luneta continua apontando para ele)
   x.save();x.translate(470,110);x.rotate(-.35);x.strokeStyle='rgba(255,220,170,.55)';x.lineWidth=5;x.beginPath();x.ellipse(0,0,66,15,0,Math.PI,6.283);x.stroke();
   const pg=x.createLinearGradient(0,-38,0,38);pg.addColorStop(0,'#ffcf8a');pg.addColorStop(.5,'#e0806a');pg.addColorStop(1,'#8a4a7a');x.fillStyle=pg;x.beginPath();x.arc(0,0,38,0,6.283);x.fill();
   x.fillStyle='rgba(255,255,255,.12)';x.fillRect(-38,-10,76,6);x.fillRect(-36,8,72,4);x.beginPath();x.ellipse(0,0,66,15,0,0,Math.PI);x.stroke();x.restore()}
  else{x.fillStyle='#fffbf0';x.beginPath();x.arc(470,110,40,0,6.283);x.fill();x.fillStyle='rgba(120,110,170,.2)';for(const[a,b,r]of[[-12,-6,9],[10,12,7],[4,-18,5]]){x.beginPath();x.arc(470+a,110+b,r,0,6.283);x.fill()}}
  x.fillStyle=Pv.hill;x.beginPath();x.moveTo(0,320);for(let i=0;i<=12;i++)x.lineTo(i*50,300-R()*50);x.lineTo(W,H);x.lineTo(0,H);x.fill();
  stoneWall(x,0,330,W,H,Pv.stone,R);
  x.fillStyle='rgba(0,0,0,.35)';x.fillRect(0,330,W,8);
 }else{ // campfire: clareira na floresta sob as estrelas
  let g=x.createLinearGradient(0,0,0,320);g.addColorStop(0,Pv.sky[0]);g.addColorStop(.7,Pv.sky[1]);g.addColorStop(1,Pv.sky[2]);x.fillStyle=g;x.fillRect(0,0,W,H);
  for(let i=0;i<300;i++){x.globalAlpha=.15+R()*.6;x.fillStyle='#fff';const s=R()<.1?1.6:.9;x.fillRect(R()*W,R()*250,s,s)}x.globalAlpha=1;
  const mg=x.createRadialGradient(512,64,8,512,64,90);mg.addColorStop(0,'rgba(255,240,210,.25)');mg.addColorStop(1,'rgba(255,240,210,0)');x.fillStyle=mg;x.fillRect(400,0,200,170);
  x.fillStyle='#fff4dc';x.beginPath();x.arc(512,64,20,0,6.283);x.fill();x.fillStyle=Pv.sky[0];x.beginPath();x.arc(503,58,18,0,6.283);x.fill(); // lua crescente
  x.fillStyle=Pv.hill;x.beginPath();x.moveTo(0,250);for(let i=0;i<=12;i++)x.lineTo(i*50,232-Math.sin(i*1.3)*22-R()*14);x.lineTo(W,320);x.lineTo(0,320);x.fill();
  const pines=[];for(let i=0;i<9;i++)pines.push([10+i*72+R()*20,300,90+R()*50,Pv.far]);for(const px of[18,92,508,582])pines.push([px,330,150+R()*30,Pv.near]);
  for(const p of pines){pine(x,p[0],p[1],p[2],p[3]);if(Pv.snow){x.fillStyle='rgba(235,242,255,.85)';for(let i=0;i<4;i++){const w=p[2]*(.42-i*.08)*.7,yy=p[1]-p[2]*.12-i*p[2]*.2-p[2]*.36;x.beginPath();x.moveTo(p[0]-w*.5,yy+p[2]*.2);x.lineTo(p[0],yy);x.lineTo(p[0]+w*.5,yy+p[2]*.2);x.quadraticCurveTo(p[0],yy+p[2]*.12,p[0]-w*.5,yy+p[2]*.2);x.fill()}}}
  if(Pv.snow){x.fillStyle='#fff';for(let i=0;i<90;i++){x.globalAlpha=.3+R()*.6;x.beginPath();x.arc(R()*W,R()*290,.8+R()*1.4,0,6.283);x.fill()}x.globalAlpha=1}
  g=x.createLinearGradient(0,290,0,H);g.addColorStop(0,Pv.ground[0]);g.addColorStop(1,Pv.ground[1]);x.fillStyle=g;x.fillRect(0,290,W,H-290);
  if(Pv.leaves){const lc=['#d8642a','#e8a03a','#b0402a','#c8803a'];for(let i=0;i<70;i++){x.fillStyle=lc[i%4];x.globalAlpha=.55+R()*.4;x.beginPath();x.ellipse(R()*W,300+R()*130,3.5,2,R()*3,0,6.283);x.fill()}x.globalAlpha=1}
  x.fillStyle='rgba(255,150,70,.12)';x.beginPath();x.ellipse(300,352,250,62,0,0,6.283);x.fill();
  x.strokeStyle=Pv.snow?'rgba(255,255,255,.18)':Pv.leaves?'rgba(200,150,80,.22)':'rgba(120,180,110,.25)';x.lineWidth=1.5;for(let i=0;i<70;i++){const gx=R()*W,gy=300+R()*120;x.beginPath();x.moveTo(gx,gy);x.lineTo(gx+(R()-.5)*4,gy-6-R()*6);x.stroke()} // grama
  x.fillStyle='#5a3418';x.save();x.translate(300,356);x.rotate(.28);x.beginPath();x.roundRect(-36,-6,72,12,6);x.fill();x.rotate(-.56);x.beginPath();x.roundRect(-36,-6,72,12,6);x.fill();x.restore(); // lenha
  for(let i=0;i<11;i++){const a=i/11*6.283,sx=300+Math.cos(a)*50,sy=358+Math.sin(a)*14;x.fillStyle=shade('#6a6a7a',-.2+R()*.3);x.beginPath();x.ellipse(sx,sy,9,6,0,0,6.283);x.fill()} // pedras
 }
 return c;
}
function paintVignette(){
 const c=vignetteCv.getContext('2d');let g=c.createRadialGradient(W/2,H*.4,H*.25,W/2,H*.45,H*.85);g.addColorStop(0,'rgba(5,6,18,0)');g.addColorStop(1,'rgba(5,6,18,.75)');c.fillStyle=g;c.fillRect(0,0,W,H);
 g=c.createLinearGradient(0,H*.5,0,H);g.addColorStop(0,'rgba(8,9,22,0)');g.addColorStop(1,'rgba(8,9,22,.92)');c.fillStyle=g;c.fillRect(0,H*.5,W,H*.5);
}
paintVignette();

// ---------- elementos animados ----------
const FIRE_ORANGE=['#ff4a10','#ff9a2a','#ffe9a0'],FIRE_BLUE=['#1a3aff','#3a9aff','#d0f4ff'];
const FLAME_S=[1,.72,.4];
function flame(c,x,y,sc,t,cols){const f=1+.14*Math.sin(t*15+x)+.08*Math.sin(t*23),C=cols||FIRE_ORANGE;for(let i=0;i<3;i++){const s=FLAME_S[i];c.fillStyle=C[i];c.beginPath();c.moveTo(x-12*s*sc,y);c.quadraticCurveTo(x-15*s*sc,y-24*s*sc*f,x+Math.sin(t*8+x)*4*sc,y-46*s*sc*f);c.quadraticCurveTo(x+15*s*sc,y-24*s*sc*f,x+12*s*sc,y);c.fill()}}
function candle(c,x,y,t){c.fillStyle='#f4ead0';c.fillRect(x-3,y,6,14);c.globalCompositeOperation='lighter';c.drawImage(softGlow('#ffb050'),x-26,y-30,52,52);c.fillStyle='#ffd27a';c.beginPath();c.ellipse(x+Math.sin(t*9+x)*.6,y-4,2.2,4.5+Math.sin(t*13+x)*.6,0,0,6.283);c.fill();c.globalCompositeOperation='source-over'}
function steam(c,x,y,t){c.lineWidth=2.4;c.lineCap='round';c.strokeStyle='#ffffff';for(let i=0;i<3;i++){const ph=((t*.45+i/3)%1);c.globalAlpha=.32*(1-ph);c.beginPath();for(let k=0;k<=10;k++){const yy=y-ph*34-k*3,xx=x+(i-1)*6+Math.sin(t*2.2+k*.6+i)*4;k?c.lineTo(xx,yy):c.moveTo(xx,yy)}c.stroke()}c.globalAlpha=1}
const paw=(c,x,y,r,fur)=>{c.fillStyle=fur;c.beginPath();c.arc(x,y,r,0,6.283);c.fill();c.fillStyle='rgba(0,0,0,.18)';c.beginPath();c.arc(x+r*.25,y+r*.3,r*.55,0,3.1);c.fill()};
// ciclo "levar à boca": repouso → sobe → gole → desce. k=0 na mesa, 1 na boca
const _SIP={k:0,sip:false,s:0,after:9}; // resultado reutilizado (consumido no mesmo quadro)
function sipCycle(t,per,start,up,hold,down){
 const q=_SIP,u=t%per;q.k=0;q.sip=false;q.s=0;q.after=9;if(u<start)return q;
 const v=u-start;if(v<up){q.k=ease(v/up);return q}
 if(v<up+hold){q.k=1;q.sip=true;q.s=(v-up)/hold;return q}
 if(v<up+hold+down){q.k=1-ease((v-up-hold)/down);q.after=0;return q}
 q.after=v-up-hold-down;return q;
}
function drawMug(c,x,y,rot){
 c.save();c.translate(x,y);c.rotate(rot);
 c.fillStyle='#8a5a2a';c.beginPath();c.roundRect(-15,-17,30,34,5);c.fill();
 c.strokeStyle='#4a2a10';c.lineWidth=3;c.beginPath();c.moveTo(-15,-8);c.lineTo(15,-8);c.moveTo(-15,8);c.lineTo(15,8);c.stroke();
 c.strokeStyle='#8a5a2a';c.lineWidth=5;c.beginPath();c.arc(18,0,8,-1.2,1.2);c.stroke();
 c.fillStyle='#fff8ee';c.beginPath();c.ellipse(0,-16,14,4,0,0,6.283);c.fill();
 c.restore();
}
function drawCup(c,x,y,rot){
 c.save();c.translate(x,y);c.rotate(rot);
 c.fillStyle='#f4eef8';c.beginPath();c.moveTo(-11,-9);c.lineTo(11,-9);c.quadraticCurveTo(10,8,0,8);c.quadraticCurveTo(-10,8,-11,-9);c.fill();
 c.strokeStyle='#f4eef8';c.lineWidth=3;c.beginPath();c.arc(13,-2,5,-1.3,1.3);c.stroke();
 c.fillStyle='#8a4a1a';c.beginPath();c.ellipse(0,-9,10,2.6,0,0,6.283);c.fill();
 c.strokeStyle='#7a5ab0';c.lineWidth=1.2;c.beginPath();c.moveTo(-8,-3);c.lineTo(8,-3);c.stroke();
 c.restore();
}
// constelações do observatório (coordenadas de tela, céu)
const SHOOTING=[[6.5,0,120,60,260,90],[9.3,4.1,560,40,-220,110],[11.7,7.3,300,20,180,60]];
const CONSTEL=[[[34,46],[64,58],[94,52],[118,70],[124,100],[158,104],[164,72],[124,70]],[[214,34],[244,62],[276,44],[306,74],[338,52]],[[380,196],[408,170],[440,184],[470,160],[506,176],[540,150]]];
const NOTES=Array.from({length:14},()=>({life:0,x:0,y:0,vx:0,col:'#fff',g:'♪',ph:0}));let noteI=0;

const SCN={
 tavern:{
  back(c,t,dt){
   c.globalCompositeOperation='lighter';const fl=.8+.2*Math.sin(t*9)*Math.sin(t*5.3);c.globalAlpha=fl;c.drawImage(softGlow('#ff8a2a'),330,140,300,300);c.drawImage(softGlow('#ff8a2a'),60,120,520,520);c.globalAlpha=1;
   flame(c,470,330,1,t);flame(c,492,332,.75,t+1.3);flame(c,452,334,.6,t+2.1);c.globalCompositeOperation='source-over';
   // brasas da lareira: fluxo constante + estalos ocasionais
   if(Math.random()<dt*12)mEmit(480+rand(-24,24),300,rand(-12,12),-rand(30,80),rand(.8,1.8),Math.random()<.5?'#ffb040':'#ff6a1a',rand(1,2.2),-15);
   if(Math.random()<dt*.7)for(let i=0;i<9;i++)mEmit(476+rand(-10,10),314,rand(-70,70),-rand(60,150),rand(.4,.9),Math.random()<.5?'#ffe08a':'#ff8a2a',rand(1,1.8),260,true);
   candle(c,420,118,t);
   // cauda do gato balançando por trás do manto
   const m=curScene(),b=P(m,90,124),sw=Math.sin(t*1.6),s=m.s,fur=furOf('gato');
   c.strokeStyle=fur;c.lineWidth=9*s;c.lineCap='round';c.beginPath();c.moveTo(b.x,b.y);
   c.bezierCurveTo(b.x+34*s,b.y+6*s,b.x+42*s+sw*8*s,b.y-30*s,b.x+28*s+sw*20*s,b.y-56*s);c.stroke();
   c.fillStyle=CAT_TAIL_TIP;c.beginPath();c.arc(b.x+28*s+sw*20*s,b.y-56*s,5*s,0,6.283);c.fill();
  },
  eyes:t=>sipCycle(t,7.5,3.2,.8,1.6,.8).sip,
  front(c,t){
   c.fillStyle='#5a3418';c.beginPath();c.ellipse(285,336,190,22,0,0,6.283);c.fill();c.fillStyle='#7a4a22';c.beginPath();c.ellipse(285,330,186,18,0,0,6.283);c.fill(); // mesa
   c.strokeStyle='rgba(255,220,180,.12)';c.lineWidth=1.5;c.beginPath();c.ellipse(285,330,160,13,0,0,6.283);c.stroke();
   c.fillStyle='#3a200e';c.fillRect(150,350,14,80);c.fillRect(406,350,14,80);
   // caneca de leite: sobe até a boca, gole com os olhos fechados, volta à mesa (bigodinho de leite!)
   const m=curScene(),M=mouthOf(m),q=sipCycle(t,7.5,3.2,.8,1.6,.8),k=q.k;
   const r1x=M.x+24,r1y=M.y+12;
   const x=395+(r1x-395)*k,y=307+(r1y-307)*k-Math.sin(k*Math.PI)*28,rot=-.62*k+(q.sip?Math.sin(q.s*Math.PI*4)*.05:0);
   drawMug(c,x,y,rot);
   if(k>.02){const fur=furOf('gato');paw(c,x-15,y+8,6.5,fur);paw(c,x+19,y+3,6,fur)}
   if(k===0)steam(c,x,y-19,t);
   if(q.after<1.8){c.globalAlpha=Math.min(1,(1.8-q.after)*1.5);c.fillStyle='#fffaf2';c.beginPath();c.ellipse(M.x-5,M.y+1,5.5,2.4,.25,0,6.283);c.ellipse(M.x+5,M.y+1,5.5,2.4,-.25,0,6.283);c.fill();c.globalAlpha=1}
  }},
 forge:{
  hit:-1,flash:0,
  back(c,t,dt){
   // forja arcana: chamas AZUIS
   const fl=.75+.25*Math.sin(t*7)*Math.sin(t*3.7);c.globalCompositeOperation='lighter';c.globalAlpha=fl;c.drawImage(softGlow('#2a7aff'),-10,140,250,250);c.drawImage(softGlow('#3a8aff'),-130,30,500,500);c.globalAlpha=1;
   flame(c,100,338,1.15,t,FIRE_BLUE);flame(c,130,340,.85,t+.7,FIRE_BLUE);flame(c,76,340,.7,t+1.9,FIRE_BLUE);c.globalCompositeOperation='source-over';
   if(Math.random()<dt*8)mEmit(112+rand(-34,34),300,rand(-8,8),-rand(30,70),rand(.8,1.5),Math.random()<.5?'#7ad0ff':'#c8f0ff',rand(1,2),-10);
  },
  front(c,t,dt){
   c.fillStyle='#2a2a30';c.beginPath();c.moveTo(430,322);c.lineTo(560,322);c.lineTo(548,334);c.lineTo(510,334);c.lineTo(506,362);c.lineTo(484,362);c.lineTo(480,334);c.lineTo(450,334);c.quadraticCurveTo(424,330,430,322);c.fill(); // bigorna
   c.fillStyle='#4a4a54';c.fillRect(434,318,124,6);c.fillStyle='#1a1a20';c.fillRect(470,362,50,10);
   for(let gi=0;gi<3;gi++){const gx=FORGE_GEMS[gi][0],gc=FORGE_GEMS[gi][1];c.fillStyle=gc;c.beginPath();c.moveTo(gx,306);c.lineTo(gx+7,314);c.lineTo(gx,318);c.lineTo(gx-7,314);c.fill();c.fillStyle='rgba(255,255,255,.6)';c.fillRect(gx-2,309,2,3)} // gemas já polidas
   // martelinho mágico: ergue devagar e bate na gema do cajado
   const g=gemPos(),pv=_PV;pv.x=g.x+46;pv.y=g.y+32;const L=Math.hypot(46,32),a0=Math.atan2(g.y-pv.y,g.x-pv.x),per=1.15,u=(t%per)/per;
   const raise=u<.7?ease(u/.7):u<.8?1-(u-.7)/.1:Math.sin((u-.8)/.2*Math.PI)*.12,a=a0+raise*1.25;
   const hx=pv.x+Math.cos(a)*L,hy=pv.y+Math.sin(a)*L;
   const idx=Math.floor(t/per-.8);
   if(idx!==this.hit){this.hit=idx;this.flash=1;
    for(let i=0;i<16;i++){const an=-Math.PI*rand(.05,.95),v=rand(80,220);mEmit(g.x,g.y,Math.cos(an)*v,Math.sin(an)*v,rand(.3,.7),Math.random()<.5?'#ffd24a':'#fff6d0',rand(1,1.8),420,true)}   // faíscas
    for(let i=0;i<8;i++)mEmit(g.x+rand(-8,8),g.y+rand(-8,8),rand(-30,30),rand(-40,-5),rand(1.1,2),GLITTER[i%4],rand(.9,1.6),-8,true)} // purpurina
   this.flash=Math.max(0,this.flash-dt*6);
   if(this.flash>0){c.globalCompositeOperation='lighter';c.globalAlpha=this.flash;c.drawImage(glowSprite('#fff4c0'),g.x-26,g.y-26,52,52);c.globalAlpha=1;c.globalCompositeOperation='source-over'}
   c.strokeStyle='#7a4a22';c.lineWidth=4;c.lineCap='round';c.beginPath();c.moveTo(pv.x,pv.y);c.lineTo(hx,hy);c.stroke();
   c.save();c.translate(hx,hy);c.rotate(a);if(!_hammerG){_hammerG=c.createLinearGradient(0,-10,0,10);_hammerG.addColorStop(0,'#c8ccd8');_hammerG.addColorStop(1,'#5a5e6e')}c.fillStyle=_hammerG;c.beginPath();c.roundRect(-6,-10,12,20,3);c.fill();c.fillStyle='#e8ecf8';c.fillRect(-6,-10,3,20);c.restore();
   paw(c,pv.x,pv.y,7,furOf('coelho'));
  }},
 library:{
  back(c,t,dt){
   candle(c,300,24,t+1);if(MENU_FX===1){candle(c,60,32,t);candle(c,540,32,t+.5)}
   // livro gigante flutuando, folheando sozinho
   const bx=432,by=176+Math.sin(t*1.6)*8,tilt=Math.sin(t*1.1)*.05;
   c.globalCompositeOperation='lighter';c.globalAlpha=.7;c.drawImage(softGlow('#b07aff'),bx-110,by-90,220,180);c.globalAlpha=1;c.globalCompositeOperation='source-over';
   c.save();c.translate(bx,by);c.rotate(tilt);
   c.fillStyle='#5a1a2a';c.beginPath();c.moveTo(-74,-6);c.lineTo(0,6);c.lineTo(74,-6);c.lineTo(74,52);c.lineTo(0,62);c.lineTo(-74,52);c.fill();  // capa
   for(let si=0;si<2;si++){const s=SIDES[si];c.fillStyle='#f4e8d0';c.beginPath();c.moveTo(0,4);c.quadraticCurveTo(s*36,-14,s*68,-8);c.lineTo(s*68,48);c.quadraticCurveTo(s*36,40,0,56);c.fill();
    c.strokeStyle='rgba(80,50,30,.35)';c.lineWidth=1.4;for(let k=0;k<6;k++){c.beginPath();c.moveTo(s*12,6+k*8);c.quadraticCurveTo(s*36,-6+k*8,s*60,-2+k*8);c.stroke()}}
   const fp=(t*.3)%1;if(fp<.4){const k=ease(fp/.4),ang=Math.PI*k;c.fillStyle='#fff8e8';c.beginPath();c.moveTo(0,4);c.quadraticCurveTo(Math.cos(ang)*34,-20-Math.sin(ang)*10,Math.cos(ang)*66,-10-Math.sin(ang)*16);c.lineTo(Math.cos(ang)*66,44-Math.sin(ang)*16);c.quadraticCurveTo(Math.cos(ang)*34,36,0,56);c.fill();
    c.strokeStyle='rgba(80,50,30,.25)';c.lineWidth=1;c.stroke()} // página virando
   c.restore();
   if(Math.random()<dt*9)mEmit(bx+rand(-55,55),by+rand(-10,30),rand(-6,6),-rand(18,40),rand(1,1.8),Math.random()<.5?'#c9a6ff':'#7ad0ff',rand(1.2,2.4),-4,true); // runas subindo
  },
  front(c,t,dt){
   const tx=372,ty=318;c.fillStyle='#4a2a14';c.beginPath();c.ellipse(tx,ty,44,10,0,0,6.283);c.fill();c.fillStyle='#2a160a';c.fillRect(tx-4,ty+6,8,70);
   c.fillStyle='#e8e0f4';c.beginPath();c.ellipse(tx,ty-3,18,5,0,0,6.283);c.fill();                       // pires
   // xícara levitando até a boca da raposa (telecinese)
   const m=curScene(),M=mouthOf(m),q=sipCycle(t,8.5,3.4,1.3,1.6,1.2),k=q.k;
   const r0x=tx,r0y=ty-12,r1x=M.x+22,r1y=M.y+12;
   const x=r0x+(r1x-r0x)*k+Math.sin(t*3)*3*Math.sin(k*Math.PI),y=r0y+(r1y-r0y)*k-Math.sin(k*Math.PI)*46+Math.sin(t*4)*2*k,rot=-.55*k+(q.sip?Math.sin(q.s*Math.PI*3)*.05:0);
   if(k>.01){
    const g=gemPos();c.globalCompositeOperation='lighter';
    c.globalAlpha=.5*Math.min(1,k*3);c.drawImage(softGlow('#b07aff'),x-34,y-34,68,68);
    c.strokeStyle='rgba(200,160,255,.55)';c.lineWidth=2;c.setLineDash(DASH67);c.lineDashOffset=-t*40;c.beginPath();c.moveTo(g.x,g.y);c.quadraticCurveTo((g.x+x)/2+20,Math.min(g.y,y)-40,x,y);c.stroke();c.setLineDash(NODASH);
    c.globalAlpha=1;c.globalCompositeOperation='source-over';
    if(Math.random()<dt*30)mEmit(x+rand(-10,10),y+rand(-6,8),rand(-10,10),rand(-10,14),rand(.5,1),Math.random()<.5?'#c9a6ff':'#ffd9ff',rand(1,1.8),-6,true); // rastro brilhante
   }
   drawCup(c,x,y,rot);
   if(!q.sip)steam(c,x,y-11,t);
  }},
 observatory:{
  back(c,t,dt){
   for(let i=0,n=(46*MENU_FX)|0;i<n;i++){const x=(i*137.5)%W,y=(i*71.3)%300+10;c.globalAlpha=.35+.65*Math.abs(Math.sin(t*(.6+i%5*.4)+i));c.fillStyle='#fff';c.fillRect(x|0,y|0,i%7?1:2,i%7?1:2)}c.globalAlpha=1;
   // constelações acendendo uma de cada vez
   c.lineWidth=1.2;for(let ci=0;ci<CONSTEL.length;ci++){const pts=CONSTEL[ci],a=.12+.5*Math.max(0,Math.sin(t*.45+ci*2.1));
    c.strokeStyle='#aac8ff';c.globalAlpha=a;c.beginPath();for(let pi=0;pi<pts.length;pi++){const p=pts[pi];pi?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1])}c.stroke();
    c.globalCompositeOperation='lighter';c.globalAlpha=Math.min(1,a+.3);const sp=starSprite('#cfe0ff');for(let pi=0;pi<pts.length;pi++)c.drawImage(sp,pts[pi][0]-5,pts[pi][1]-5,10,10);c.globalAlpha=1;c.globalCompositeOperation='source-over'}
   // estrelas cadentes
   for(let si=0,sn=MENU_FX<1?1:3;si<sn;si++){const[per,off,x0,y0,dx,dy]=SHOOTING[si];const sp=((t+off)%per)/per;if(sp>.16)continue;const k=sp/.16,x=x0+k*dx,y=y0+k*dy,len=Math.hypot(dx,dy),ux=dx/len,uy=dy/len;
    c.strokeStyle='#ffffff';c.lineWidth=2;c.globalAlpha=1-k*.6;c.beginPath();c.moveTo(x,y);c.lineTo(x-ux*30,y-uy*30);c.stroke();c.globalAlpha=(1-k*.6)*.35;c.beginPath();c.moveTo(x-ux*30,y-uy*30);c.lineTo(x-ux*60,y-uy*60);c.stroke();c.globalAlpha=1; // cauda em 2 tons (sem gradiente novo por quadro)
    c.globalCompositeOperation='lighter';c.drawImage(glowSprite('#cfe0ff'),x-10,y-10,20,20);c.globalCompositeOperation='source-over'}
  },
  post(cx,ch){closeEye(cx,ch,0)}, // pisca um olho: o outro está na luneta
  front(c,t,dt){
   for(let i=-1;i<8;i++){const x=i*84+20;c.fillStyle='#55516e';c.fillRect(x,342,52,30);c.fillStyle='#6e6a8a';c.fillRect(x,338,52,6);c.fillStyle='rgba(0,0,0,.3)';c.fillRect(x,370,52,4)} // ameias
   c.fillStyle='#46425e';c.fillRect(0,372,W,24);
   // luneta de latão encostada no olho da coruja
   const m=curScene(),E=P(m,80,63),ang=-.6+Math.sin(t*.3)*.025,ca=Math.cos(ang),sa=Math.sin(ang),mt=_MT;mt.x=E.x+4+ca*74;mt.y=E.y+sa*74;
   c.strokeStyle='#3a2a1a';c.lineWidth=5;c.lineCap='round';c.beginPath();c.moveTo(mt.x,mt.y);c.lineTo(mt.x-26,344);c.moveTo(mt.x,mt.y);c.lineTo(mt.x+32,344);c.moveTo(mt.x,mt.y);c.lineTo(mt.x+4,348);c.stroke();
   c.save();c.translate(E.x+4,E.y);c.rotate(ang);
   if(!_scopeG){_scopeG=c.createLinearGradient(0,-15,0,15);_scopeG.addColorStop(0,'#ffe8a0');_scopeG.addColorStop(.5,'#c9962a');_scopeG.addColorStop(1,'#6a4a10')}c.fillStyle=_scopeG;
   c.beginPath();c.moveTo(8,-6);c.lineTo(168,-14);c.lineTo(168,14);c.lineTo(8,6);c.fill();
   c.fillStyle='#4a3010';for(let ri=0;ri<4;ri++){const k=SCOPE_RINGS[ri];c.fillRect(k,-15+k*.03,6,30-k*.06)}
   c.fillStyle='#2a1a0a';c.beginPath();c.roundRect(-2,-5,12,10,2);c.fill();
   c.fillStyle='#9ad8ff';c.globalAlpha=.6;c.beginPath();c.ellipse(170,0,4,13,0,0,6.283);c.fill();c.globalAlpha=1;
   c.restore();
   c.fillStyle='#2a1a0a';c.beginPath();c.arc(mt.x,mt.y,6,0,6.283);c.fill();
   // pergaminho flutuante + pena mágica escrevendo sozinha
   const bob=Math.sin(t*1.3)*5,x0=30,y0=168+bob,w=128,h=118,per=11,u=t%per,p=Math.min(1,u/8),fade=u>9.6?1-(u-9.6)/1.4:1;
   c.globalCompositeOperation='lighter';c.globalAlpha=.35;c.drawImage(softGlow('#ffd98a'),x0-30,y0-30,w+60,h+60);c.globalAlpha=1;c.globalCompositeOperation='source-over';
   if(!_scrollG){_scrollG=c.createLinearGradient(0,0,0,h);_scrollG.addColorStop(0,'#f6e8c8');_scrollG.addColorStop(1,'#dcc496')}c.save();c.translate(0,y0);c.fillStyle=_scrollG;c.fillRect(x0,0,w,h);c.restore();
   c.fillStyle='#b8925a';c.beginPath();c.roundRect(x0-6,y0-7,w+12,11,5);c.fill();c.beginPath();c.roundRect(x0-6,y0+h-4,w+12,11,5);c.fill();
   c.strokeStyle='#4a2a8a';c.lineWidth=1.5;c.globalAlpha=fade;let qx=x0+w-20,qy=y0+h*.5;
   for(let i=0;i<5;i++){const lw=i===4?w*.45:w-28,li=Math.max(0,Math.min(1,p*5-i)),ly=y0+20+i*20;if(li<=0)break;
    c.beginPath();for(let xx=0;xx<=lw*li;xx+=2.5){const yy=ly+Math.sin(xx*.55+i*1.7)*2.4+Math.sin(xx*1.9+i)*1.2;xx?c.lineTo(x0+14+xx,yy):c.moveTo(x0+14,yy)}c.stroke();
    if(li<1||i===4){qx=x0+14+lw*li;qy=ly+Math.sin(lw*li*.55+i*1.7)*2.4}}
   c.globalAlpha=1;
   if(p>=1){qx=x0+w+8;qy=y0+30+Math.sin(t*2)*4}else qy+=Math.sin(t*18)*1.2;
   c.save();c.translate(qx,qy);c.rotate(-.6);
   c.fillStyle='#f8f4ff';c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(10,-22,6,-52);c.quadraticCurveTo(-8,-28,0,0);c.fill();
   c.fillStyle='#c9a6ff';c.beginPath();c.moveTo(2,-14);c.quadraticCurveTo(12,-30,6,-52);c.quadraticCurveTo(4,-30,2,-14);c.fill();
   c.strokeStyle='#8a6ad0';c.lineWidth=1;c.beginPath();c.moveTo(0,0);c.lineTo(6,-50);c.stroke();c.restore();
   c.globalCompositeOperation='lighter';c.drawImage(glowSprite('#c9a6ff'),qx-8,qy-8,16,16);c.globalCompositeOperation='source-over';
   if(p<1&&Math.random()<dt*10)mEmit(qx,qy,rand(-12,12),rand(-20,0),rand(.4,.8),Math.random()<.5?'#ffd98a':'#c9a6ff',rand(.8,1.4),20,true);
  }},
 // 🏛️ o Reino: cristal da torre pulsando, brilho da mina e faíscas subindo dos cristais (o resto é fundo pronto)
 kingdom:{
  back(c,t,dt){
   const k=KMAP.k,sl=Village.lv('sanct'),th=70+sl*5,tx=320*k,ty=KMAP.oy+(200-th-14)*k;
   c.globalCompositeOperation='lighter';
   c.globalAlpha=.35+.25*Math.sin(t*2.2);c.drawImage(softGlow('#7ae8ff'),tx-90,ty-90,180,180);
   if(Village.lv('mine')){const mx=112*k,my=KMAP.oy+100*k;c.globalAlpha=.3+.2*Math.sin(t*1.7+1);c.drawImage(softGlow('#ffd24a'),mx-60,my-50,120,100)}
   if(Village.lv('forge')){const fx=505*k,fy=KMAP.oy+118*k;c.globalAlpha=.25+.2*Math.abs(Math.sin(t*5));c.drawImage(softGlow('#ff8a3a'),fx-40,fy-30,80,60)}
   c.globalAlpha=1;c.globalCompositeOperation='source-over';
   if(Math.random()<dt*5)mEmit(tx+rand(-16,16),ty+rand(-6,10),rand(-8,8),-rand(18,40),rand(1,1.8),Math.random()<.5?'#9af0ff':'#ffffff',rand(1,1.8),-6,true);
   if(Math.random()<dt*2)mEmit(rand(40,560),KMAP.oy+rand(120,330)*k,rand(-6,6),-rand(6,16),rand(1.4,2.4),Math.random()<.5?'#c9a6ff':'#7ae8ff',rand(.8,1.3),-2,true); // vaga-lumes de cristal
  },
  front(){}
 },
 // ✨ cena rara: Festa na Fogueira
 campfire:{
  hue:0,beat:-1,clap:-1,toast:-1,
  POSES:[{dy:0,rot:0},{dy:0,rot:0},{dy:0,rot:0},{dy:0,rot:0}], // poses reutilizadas (sem objeto novo por quadro)
  pose(i,m,t){const b=t*1.6,o=this.POSES[i];
   if(m.ch==='coruja'){o.dy=-Math.abs(Math.sin(b*Math.PI))*5;o.rot=Math.sin(b*Math.PI)*.08}       // balança a cabeça no ritmo
   else if(m.ch==='gato'){o.dy=0;o.rot=Math.sin(b*Math.PI*.5)*.05}
   else if(m.ch==='raposa'){o.dy=-Math.abs(Math.sin(b*Math.PI))*3;o.rot=0}
   else{o.dy=0;o.rot=Math.sin(t*1.2)*.03}
   return o;
  },
  back(c,t,dt){
   const col=HUE12[((t*1.5)|0)%12];
   c.globalCompositeOperation='lighter';c.globalAlpha=.55+.15*Math.sin(t*8);c.drawImage(softGlow(col),300-230,330-230,460,460);c.globalAlpha=.5;c.drawImage(softGlow('#ff9a3a'),300-150,340-150,300,300);c.globalAlpha=1;
   const fh=t*40;FL1[0]=hue(fh);FL1[1]=hue(fh+40);FL2[0]=hue(fh+120);FL2[1]=hue(fh+160);FL3[0]=hue(fh+240);FL3[1]=hue(fh+280);
   flame(c,300,352,1.35,t,FL1);flame(c,282,354,.85,t+1.1,FL2);flame(c,318,354,.9,t+2.3,FL3);
   c.globalCompositeOperation='source-over';
   if(Math.random()<dt*16)mEmit(300+rand(-16,16),318,rand(-18,18),-rand(50,120),rand(.8,1.7),HUE12[(Math.random()*12)|0],rand(1.2,2.2),-20,Math.random()<.45);
  },
  front(c,t,dt){
   const S=curScene(),poses=menuScene.poses||ZERO_POSE,b=t*1.6;
   // 🐱 alaúde (gato) — patinha dedilhando (no espaço do retrato do gato)
   c.save();applyMember(c,S.cast[0],poses[0]||ZERO_POSE);c.save();c.translate(80,106);c.rotate(-.55);
    c.fillStyle='#6a3a1a';c.fillRect(-48,-3,40,6);c.fillStyle='#4a2410';c.fillRect(-56,-5,10,10);
    c.fillStyle='#c07a3a';c.beginPath();c.ellipse(0,0,17,13,0,0,6.283);c.fill();c.strokeStyle='#7a4a1a';c.lineWidth=1.5;c.stroke();
    c.fillStyle='#2a140a';c.beginPath();c.arc(-2,0,4,0,6.283);c.fill();
    c.strokeStyle='rgba(255,240,200,.6)';c.lineWidth=.6;for(let li=0;li<3;li++){const o=LUTE_STR[li];c.beginPath();c.moveTo(-54,o);c.lineTo(12,o);c.stroke()}
    c.restore();paw(c,84,104+Math.sin(t*12)*4,5.5,furOf('gato'));c.restore();
   // notas musicais saindo do alaúde no ritmo
   const bi=Math.floor(b);if(bi!==this.beat){this.beat=bi;const m=S.cast[0],o=P(m,84,92),n=NOTES[noteI];noteI=(noteI+1)%NOTES.length;
    n.life=2.4;n.x=o.x;n.y=o.y;n.vx=rand(12,34);n.col=HUE12[(Math.random()*12)|0];n.g=Math.random()<.5?'♪':'♫';n.ph=Math.random()*6}
   c.font='900 18px Nunito, sans-serif';c.textAlign='center';
   for(let ni=0;ni<NOTES.length;ni++){const n=NOTES[ni];if(n.life<=0)continue;n.life-=dt;n.x+=n.vx*dt;n.y-=34*dt;const a=Math.min(1,n.life/1.2),x=n.x+Math.sin(n.life*3+n.ph)*6;
    c.globalAlpha=a*.6;c.globalCompositeOperation='lighter';c.drawImage(glowSprite(n.col),x-12,n.y-18,24,24);c.globalCompositeOperation='source-over';c.globalAlpha=a;c.fillStyle=n.col;c.fillText(n.g,x,n.y)}
   c.globalAlpha=1;c.textAlign='left';
   // 🐰 marshmallow tostando na ponta do cajado
   const rb=S.cast[2],g=gemPos(rb),end=_PV;end.x=284;end.y=300+Math.sin(t*2)*2;const tu=t%10,tk=Math.min(1,tu/8.5);
   c.strokeStyle='#8a5a2a';c.lineWidth=3;c.lineCap='round';c.beginPath();c.moveTo(g.x,g.y);c.quadraticCurveTo((g.x+end.x)/2,g.y-6,end.x,end.y);c.stroke();
   const mc=MARSH[(tk*31)|0];
   c.save();c.translate(end.x,end.y);c.rotate(.5);c.fillStyle=mc;c.beginPath();c.roundRect(-7,-6,14,12,4);c.fill();c.fillStyle='rgba(255,255,255,.35)';c.fillRect(-5,-5,4,3);c.restore();
   if(tk>.5&&Math.random()<dt*4)mEmit(end.x,end.y-6,rand(-4,4),-rand(15,30),rand(.8,1.4),'#c8c0b8',rand(1.4,2.4),-5);
   const ti=Math.floor(t/10);if(ti!==this.toast){if(this.toast>=0)for(let i=0;i<12;i++){const a=Math.random()*6.283;mEmit(end.x,end.y,Math.cos(a)*60,Math.sin(a)*60,rand(.4,.8),i%2?'#fff6d0':'#ffb0e0',rand(1,1.8),80,true)}this.toast=ti}
   // 🦊 palminhas no ritmo
   c.save();applyMember(c,S.cast[3],poses[3]||ZERO_POSE);{const ph=b%1,d=2+11*Math.sin(ph*Math.PI),fur=furOf('raposa');
    c.fillStyle=CH_ID.raposa.robe;for(let si=0;si<2;si++){const s=SIDES[si];c.beginPath();c.ellipse(70+s*(d+8),98,6,11,s*.9,0,6.283);c.fill()}
    paw(c,70-d,92,5.5,fur);paw(c,70+d,92,5.5,fur)}c.restore();
   const ci=Math.floor(b);if(ci!==this.clap){this.clap=ci;const o=P(S.cast[3],70,88);for(let i=0;i<6;i++){const a=-Math.PI*rand(.1,.9);mEmit(o.x,o.y,Math.cos(a)*70,Math.sin(a)*70,rand(.3,.6),i%2?'#ffd98a':'#ffffff',rand(.9,1.4),60,true)}}
  }}
};

// pálpebras: posições dos olhos no retrato (espaço 140×140) por espécie
const EYES={gato:[[61,63,5.5,6.5],[79,63,5.5,6.5]],coelho:[[62,62,5,6],[78,62,5,6]],raposa:[[61,61,5,5],[79,61,5,5]],coruja:[[60,63,8,8],[80,63,8,8]]};
function closeEye(c,ch,i){
 const e=(EYES[ch.id]||[])[i];if(!e)return;const[x,y,rx,ry]=e,lid=ch.id==='coruja'?'#e6d2aa':ch.fur;
 c.fillStyle=lid;c.beginPath();c.ellipse(x,y,rx,ry,0,0,6.283);c.fill();c.strokeStyle='#2a1810';c.lineWidth=1.4;c.beginPath();c.arc(x,y-1,rx*.75,.25*Math.PI,.75*Math.PI);c.stroke();
}
function closeEyes(c,ch){closeEye(c,ch,0);closeEye(c,ch,1)}
// transforma o contexto para o espaço do retrato de um membro (com pose: balanço/pulo em torno dos pés)
function applyMember(c,m,ps,jump){c.translate(m.ax,m.ay+(ps.dy||0)-(jump||0));c.scale(m.s,m.s);if(ps.rot){c.translate(70,134);c.rotate(ps.rot);c.translate(-70,-134)}}

// 📱 retratos do menu no celular: 24 quadros de um ciclo (π s fecha o "respira" do retrato), criados aos poucos
const MOBILE_AV=DeviceManager.isMobile,AV_N=24,AV_P=Math.PI,AVF={};let avBuilt=0;
const DASH67=[6,7],NODASH=[];
function avatarFrame(ch,t){
 if(AVF._v!==Inventory.ver){for(const k in AVF)delete AVF[k];AVF._v=Inventory.ver} // equipamento mudou → quadros refeitos
 let arr=AVF[ch.id];if(!arr)arr=AVF[ch.id]=Array.from({length:AV_N},()=>({cv:null,t:0}));
 const i=((((t%AV_P)+AV_P)%AV_P)/AV_P*AV_N)|0,fr=arr[i];if(fr.cv)return fr;
 for(let k=1;k<AV_N;k++){const g=arr[(i-k+AV_N)%AV_N];if(g.cv){if(!avBuilt){avBuilt=1;buildAv(ch,fr,i)}return g}} // vizinho pronto enquanto este é criado
 buildAv(ch,fr,i);return fr;
}
function buildAv(ch,fr,i){fr.t=i/AV_N*AV_P;fr.cv=mkCanvas(140,140);drawAvatar(fr.cv.getContext('2d'),ch,fr.t,false,false)}
// ⬆️ "lift": quanto a cena sobe (unidades lógicas) para o painel do menu (balão + card) não cobrir o corpo do mago.
// Calculado por fitMenuLift() a partir das posições REAIS na tela (resize, troca de cena/idioma/mago).
let menuLift=0;
function fitMenuLift(){
 const cv=$('game'),S=curScene(),B=document.body;
 const q=()=>[document.querySelector('.overlay.menu .mwidget'),document.querySelector('.overlay.menu .mcard')];
 if(!cv||!S||state!=='menu'||!q()[1]){menuLift=0;B.classList.remove('menu-compact');return}
 const r=cv.getBoundingClientRect();if(!r.height)return;
 const cover=getComputedStyle(cv).objectFit==='cover',sc=cover?Math.max(r.width/W,r.height/H):r.height/H,offY=cover?(r.height-H*sc)*.58:0;
 const cast=castOf(S),feet=Math.max(...cast.map(m=>m.ay+134*m.s))+6,head=Math.min(...cast.map(m=>m.ay+18*m.s));
 const maxLift=Math.max(0,Math.min(110,head-34)); // a cabeça nunca sai por cima (fica abaixo das plaquinhas do topo)
 const need=()=>{const[w,c]=q(),top=Math.min(w?w.getBoundingClientRect().top:1e9,c.getBoundingClientRect().top);return Math.ceil(feet-(top-r.top-offY)/sc)};
 const wasC=B.classList.contains('menu-compact');
 B.classList.remove('menu-compact');let n=need();
 // 1º degrau: painel compacto · histerese de 14: se já estava compacto, só expande com folga clara (não fica alternando no limite)
 if(n>maxLift-(wasC?14:0)){B.classList.add('menu-compact');n=need()}
 menuLift=Math.max(0,Math.min(maxLift,n));               // 2º degrau: a cena sobe o que faltar
}
// a cena desliza até o novo "lift" (≈0,25 s) em vez de pular; troca de cena = posição imediata
let menuLiftV=0,menuLiftScene='';
function drawMenuScene(c,dt){
 const sid=curScene().id;
 if(sid!==menuLiftScene||!dt){menuLiftScene=sid;menuLiftV=menuLift}
 else menuLiftV+=(menuLift-menuLiftV)*Math.min(1,dt*12);
 if(Math.abs(menuLift-menuLiftV)<.3)menuLiftV=menuLift;
 const L=menuLiftV;
 if(L>0){c.save();c.translate(0,-L);_drawMenuScene(c,dt);c.restore();c.fillStyle='#070912';c.fillRect(0,H-L,W,L);return} // faixa de baixo fica sob o card
 _drawMenuScene(c,dt);
}
function _drawMenuScene(c,dt){
 avBuilt=0; // no máximo 1 retrato novo por quadro
 const S=curScene(),st=menuScene,sc=SCN[S.id];st.t+=dt;
 let bg=sceneBg.get(S.id);if(!bg||bg.v!==st.v){bg={v:st.v,cv:paintScene(S.id,st.v)};sceneBg.set(S.id,bg)}
 st.blinkIn-=dt;if(st.blinkIn<=0){st.blink=.14;st.blinkIn=rand(2.4,5)}st.blink=Math.max(0,st.blink-dt);
 st.cheer=Math.max(0,st.cheer-dt*1.5);
 c.drawImage(bg.cv,0,0);
 sc.back(c,st.t,dt);
 const cast=castOf(S),jump=st.cheer>0?Math.sin((1-st.cheer)*Math.PI)*24:0;st.poses=st.poses||[];st.frame=(st.frame|0)+1;const fresh=st.lastScene!==S.id;st.lastScene=S.id;
 for(let i=0;i<cast.length;i++){
  const m=cast[i],ch=m.ch===CHARS[selected].id?Inventory.dressed(CH_ID[m.ch]):CH_ID[m.ch]; // o mago escolhido aparece vestido
  const blink=cast.length>1?((st.t+i*1.7)%4.3)<.13:(st.blink>0||(sc.eyes&&sc.eyes(st.t)));
  const ps=sc.pose?sc.pose(i,m,st.t):ZERO_POSE;st.poses[i]=ps;
  if(MOBILE_AV){ // 📱 celular: retrato vem de um quadro pré-renderizado; piscada/olho fechado desenhados por cima
   const fr=avatarFrame(ch,st.t+i);
   if(st.cheer>0){c.globalCompositeOperation='lighter';c.globalAlpha=st.cheer;const r=(1-st.cheer)*160+30,gp=gemPos(m);c.strokeStyle=ch.color;c.lineWidth=4;c.beginPath();c.arc(gp.x,gp.y-jump,r,0,6.283);c.stroke();c.globalAlpha=1;c.globalCompositeOperation='source-over'}
   c.save();applyMember(c,m,ps,jump);c.drawImage(fr.cv,0,0,140,140);
   if(blink||sc.post){c.translate(0,Math.sin(fr.t*2+ch.unlock)*1.5);if(blink)closeEyes(c,ch);else sc.post(c,ch)}
   c.restore();continue;
  }
  const cv2=avCv(m.ch),cx=cv2.getContext('2d');
  // retrato redesenhado a 30 Hz (cena solo) ou 15 Hz intercalado na Festa (1 por quadro): o balanço/pulo é aplicado no blit, todo quadro
  if(fresh||st.cheer>0||(cast.length>1?((st.frame+i)&3)===0:(st.frame&1)===0)){drawAvatar(cx,ch,st.t+i,false,blink);if(sc.post)sc.post(cx,ch)}
  if(st.cheer>0){c.globalCompositeOperation='lighter';c.globalAlpha=st.cheer;const r=(1-st.cheer)*160+30,gp=gemPos(m);c.strokeStyle=ch.color;c.lineWidth=4;c.beginPath();c.arc(gp.x,gp.y-jump,r,0,6.283);c.stroke();c.globalAlpha=1;c.globalCompositeOperation='source-over'}
  c.save();applyMember(c,m,ps,jump);c.drawImage(cv2,0,0,140,140);c.restore();
 }
 sc.front(c,st.t,dt);
 // partículas (fogo, faíscas, runas, magia)
 c.globalCompositeOperation='lighter';
 for(let pi=0;pi<MP.length;pi++){const p=MP[pi];if(p.life<=0)continue;p.life-=dt;p.vx*=1-dt*1.2;p.vy+=p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;const a=Math.max(0,p.life/p.max),d=(p.s*(p.star?6:5))|0;c.globalAlpha=a;c.drawImage(p.star?starSprite(p.col):glowSprite(p.col),(p.x-d/2)|0,(p.y-d/2)|0,d,d)}
 c.globalAlpha=1;c.globalCompositeOperation='source-over';
 c.drawImage(vignetteCv,0,0);
}

// ================== REGISTRO DE VINHETAS ==================
// Cada vinheta desenha a cena completa num ctx de qualquer tamanho (escala a partir de 600×680 lógicos).
// draw(ctx,width,height,time): time em segundos; o dt das partículas é derivado do tempo da própria cena.
function drawVignette(sceneId,ctx,width,height,time){
 if(menuScene.id!==sceneId)setMenuScene(sceneId);
 const dt=Math.max(0,Math.min(.1,time-menuScene.t));
 const sx=(width||W)/W,sy=(height||H)/H;
 if(sx!==1||sy!==1){ctx.save();ctx.scale(sx,sy);drawMenuScene(ctx,dt);ctx.restore()}else drawMenuScene(ctx,dt);
}
const VIGNETTES={
 CAT_TAVERN:     {id:'cat_tavern',     scene:'tavern',      character:'GATO',   bgTheme:'warm_wood',     draw:(ctx,width,height,time)=>drawVignette('tavern',ctx,width,height,time)},
 RABBIT_SMITH:   {id:'rabbit_smith',   scene:'forge',       character:'COELHO', bgTheme:'forge_fire',    draw:(ctx,width,height,time)=>drawVignette('forge',ctx,width,height,time)},
 FOX_LIBRARY:    {id:'fox_library',    scene:'library',     character:'RAPOSA', bgTheme:'mystic_arcane', draw:(ctx,width,height,time)=>drawVignette('library',ctx,width,height,time)},
 OWL_OBSERVATORY:{id:'owl_observatory',scene:'observatory', character:'CORUJA', bgTheme:'night_sky',     draw:(ctx,width,height,time)=>drawVignette('observatory',ctx,width,height,time)},
 CAMPFIRE_PARTY: {id:'campfire_party', scene:'campfire',    character:'TODOS',  bgTheme:'magic_campfire',rare:true,draw:(ctx,width,height,time)=>drawVignette('campfire',ctx,width,height,time)}
};
// as fontes (Cinzel/Nunito) mudam a altura do painel ao terminar de carregar → refaz o encaixe do mago
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{if(state==='menu')fitMenuLift()});
