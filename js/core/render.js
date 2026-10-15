// Mage Animals — Renderização: cenários dos biomas, torre, mago, retratos, inimigos e caches de sprites.
// Regra de performance: tudo que tem shadowBlur/gradiente pesado é desenhado UMA vez num canvas fora da tela
// (pre-rendering) e depois só copiado com drawImage a cada quadro.
'use strict';

const cv=$('game');
const ctx=cv.getContext('2d',{alpha:false,willReadFrequently:false});
const W=600,H=680; // coordenadas LÓGICAS do jogo (independem da resolução física do canvas)
const TX=W/2,TTOP=H-128,THW=78;
const SPAWN_Y=112,PORTAL_T=.45; // inimigos surgem logo abaixo do HUD, por um portal

// ================== NITIDEZ (High-DPI) ==================
// Todo canvas fora da tela é criado em RS× a resolução lógica (RS = devicePixelRatio × escala de exibição),
// guarda o tamanho lógico em lw/lh e já vem com o contexto escalado: o código desenha em unidades do jogo
// e o resultado tem pixels nativos da tela — sem esticar imagem pequena (que era a causa do borrão).
const RS=Math.min(DeviceManager.isMobile?1.25:2,Math.max(1,DeviceManager.dpr*Math.max(1,(Math.min(860,Math.max(screen.availHeight||0,innerHeight)-62))/H)));
function mkCanvas(w,h){
 const c=document.createElement('canvas');c.lw=Math.max(1,Math.ceil(w));c.lh=Math.max(1,Math.ceil(h));
 c.width=Math.ceil(c.lw*RS);c.height=Math.ceil(c.lh*RS);
 const x=c.getContext('2d');x.setTransform(RS,0,0,RS,0,0);x.imageSmoothingQuality='high';return c;
}
// Canvas principal: buffer = tamanho exibido em CSS × devicePixelRatio; o contexto é escalado para 600×680 lógicos
let CV_K=1;
function fitCanvas(){
 const r=cv.getBoundingClientRect();if(!r.height)return;
 cv.parentElement.style.setProperty('--cvh',r.height+'px'); // altura exibida do canvas (o widget central do menu se ancora nela no celular)
 if(typeof labelScale==='function')labelScale(); // fonte dos rótulos acompanha o tamanho exibido
 // HQ: densidade nativa da tela · Lite: no máximo 1 pixel por pixel CSS (×0,75 em telas comuns) → até 4× menos pixels em telas HiDPI
 const dpr=DeviceManager.dpr,lite=typeof PERF!=='undefined'&&!PERF.hq,dens=lite?Math.min(dpr*.75,1):dpr;
 const k=Math.min(3,Math.max(.5,Math.max(r.height/H,r.width/W)*dens)); // max: no menu do celular o canvas pode estar recortado (object-fit:cover)
 const w=Math.round(W*k),h=Math.round(H*k);
 if(DeviceManager.isMobile&&cv.width&&Math.abs(w-cv.width)/cv.width<.06&&cv.dataset.fit)return; // ±6%: o CSS escala, o buffer fica
 if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h;cv.dataset.fit='1'}
 CV_K=k;ctx.setTransform(k,0,0,k,0,0);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 if(typeof draw==='function'&&typeof state!=='undefined')try{draw(0)}catch(e){} // redesenha já: trocar o buffer limpa o canvas (evita piscar)
}
if(window.ResizeObserver)new ResizeObserver(fitCanvas).observe(cv);
addEventListener('resize',fitCanvas);
(function watchDpr(){const m=matchMedia('(resolution: '+(window.devicePixelRatio||1)+'dppx)');const f=()=>{m.removeEventListener('change',f);fitCanvas();watchDpr()};m.addEventListener('change',f)})();
// drawImage(img,x,y) de um canvas lógico desenha no tamanho lógico (lw×lh), não no tamanho físico
// Se o sprite já está no ATLAS (img.at), desenha o recorte da textura única da GPU: sem trocar de textura a cada partícula.
const _drawImage=CanvasRenderingContext2D.prototype.drawImage;
CanvasRenderingContext2D.prototype.drawImage=function(img,a,b,c,d,e,f,g,h){
 const n=arguments.length,at=img.at;
 if(n===3){if(at)return _drawImage.call(this,at.img,at.sx,at.sy,at.sw,at.sh,a,b,img.lw,img.lh);return img.lw?_drawImage.call(this,img,a,b,img.lw,img.lh):_drawImage.call(this,img,a,b)}
 if(n===5){if(at)return _drawImage.call(this,at.img,at.sx,at.sy,at.sw,at.sh,a,b,c,d);return _drawImage.call(this,img,a,b,c,d)}
 return _drawImage.call(this,img,a,b,c,d,e,f,g,h);
};
// ================== ATLAS DE SPRITES ==================
// Canvas pequenos ficam na memória da CPU: cada drawImage de um deles (cor diferente por partícula) era uma
// transferência lenta para a GPU — medido: 46 partículas ≈ 6 ms. Todos os brilhos/estrelas vão para UMA folha
// (prateleiras), convertida em ImageBitmap (textura residente na GPU) → as partículas viram recortes da mesma textura.
const ATLAS={cv:document.createElement('canvas'),x:0,y:0,row:0,list:[],bmp:null,pending:false,full:false};
ATLAS.cv.width=ATLAS.cv.height=2048;ATLAS.cx=ATLAS.cv.getContext('2d');
function atlasAdd(s){
 // 📱 celular: sem atlas. Medido no modo mobile: cada drawImage da folha 2048² custava ~5 ms (textura de 16 MB reenviada
 // a cada flush) contra ~0,4 ms do canvas próprio do sprite. No desktop (GPU dedicada) o atlas continua mais rápido.
 if(DeviceManager.isMobile)return s;
 const w=s.width,h=s.height,A=ATLAS;if(A.full)return s;
 if(A.x+w+2>A.cv.width){A.x=0;A.y+=A.row+2;A.row=0}
 if(A.y+h>A.cv.height){A.full=true;return s} // folha cheia: o sprite continua desenhado do próprio canvas
 _drawImage.call(A.cx,s,A.x,A.y);s._sx=A.x;s._sy=A.y;A.x+=w+2;A.row=Math.max(A.row,h);A.list.push(s);
 if(!A.pending&&window.createImageBitmap){A.pending=true;setTimeout(atlasBake,60)} // agrupa vários sprites novos num único bake
 return s;
}
function atlasBake(){
 const A=ATLAS,items=A.list.slice();
 createImageBitmap(A.cv).then(b=>{A.pending=false;const old=A.bmp;A.bmp=b;for(const s of items)s.at={img:b,sx:s._sx,sy:s._sy,sw:s.width,sh:s.height};if(old&&old.close)old.close();if(A.list.length>items.length&&!A.pending){A.pending=true;setTimeout(atlasBake,60)}})
 .catch(()=>{A.pending=false});
}

// (cenário e torre: movido para js/core/scenery.js)

// ================== SPRITES DE BRILHO (substituem shadowBlur) ==================
const glowCache=new Map(),starCache=new Map();
function glowSprite(col){
 let s=glowCache.get(col);if(s)return s;
 s=mkCanvas(32,32);const c=s.getContext('2d'),g=c.createRadialGradient(16,16,0,16,16,16);
 g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.18,hexA(col,.95));g.addColorStop(.45,hexA(col,.35));g.addColorStop(1,hexA(col,0));
 c.fillStyle=g;c.fillRect(0,0,32,32);glowCache.set(col,s);return atlasAdd(s);
}
// brilho suave (sem núcleo branco) para iluminação ambiente do cajado e flashes de luz
const softCache=new Map();
function softGlow(col){
 let s=softCache.get(col);if(s)return s;
 s=mkCanvas(64,64);const c=s.getContext('2d'),g=c.createRadialGradient(32,32,0,32,32,32);
 g.addColorStop(0,hexA(col,.42));g.addColorStop(.45,hexA(col,.16));g.addColorStop(1,hexA(col,0));
 c.fillStyle=g;c.fillRect(0,0,64,64);softCache.set(col,s);return atlasAdd(s);
}
function starSprite(col){
 let s=starCache.get(col);if(s)return s;
 s=mkCanvas(32,32);const c=s.getContext('2d');
 let g=c.createRadialGradient(16,16,0,16,16,15);g.addColorStop(0,hexA(col,.5));g.addColorStop(1,hexA(col,0));c.fillStyle=g;c.fillRect(0,0,32,32);
 c.fillStyle=col;c.beginPath();c.moveTo(16,2);c.quadraticCurveTo(16,16,30,16);c.quadraticCurveTo(16,16,16,30);c.quadraticCurveTo(16,16,2,16);c.quadraticCurveTo(16,16,16,2);c.fill();
 c.fillStyle='#fff';c.beginPath();c.arc(16,16,2.5,0,7);c.fill();starCache.set(col,s);return atlasAdd(s);
}

// (mago na torre: movido para js/core/scenery.js)

// ================== RETRATO (vista de frente, chibi) — designs oficiais dos 4 magos ==================
// 🐱 Gato malhado bege, olhos dourados, chapéu cônico azul-marinho com fivela, cristal azul
// 🐰 Coelho rosa-pálido, olhos pretos brilhantes, manto roxo-imperial, cristal roxo + pedrinha flutuante
// 🦊 Raposa laranja com focinho/peito brancos, manto rubi com broche, cristal de fogo, cauda à esquerda
// 🦉 Coruja marrom/bege, olhos âmbar, capuz verde-floresta com fecho duplo dourado, cristal âmbar
const AV={
 gato:{eye:'#f2b632',stripe:'#a26e3c',muzzle:'#f8ebd8',nose:'#e8889a',inner:'#efa0a8'},
 coelho:{eye:'#1a1020',inner:'#f4a2c2',muzzle:'#fff3f7',nose:'#f07aa0'},
 raposa:{eye:'#f0a020',white:'#fff4ea',dark:'#2a1810'},
 coruja:{eye:'#f6c21a',face:'#ecd8b2',chest:'#dcc49c',mark:'#8a6640',beak:'#e8a032',tuft:'#4e3420'}
};
const GOLD='#e8b86a',GOLD2='#ffd98a';
function eye(c,x,y,rx,ry,iris,pupilW){c.fillStyle='#fff';c.beginPath();c.ellipse(x,y,rx,ry,0,0,7);c.fill();c.fillStyle=iris;c.beginPath();c.ellipse(x,y+.5,rx*.8,ry*.85,0,0,7);c.fill();c.fillStyle='#120a08';c.beginPath();c.ellipse(x,y+.5,pupilW,ry*.65,0,0,7);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(x-rx*.3,y-ry*.35,Math.max(1,rx*.28),0,7);c.fill()}
// olho grande e brilhante (coelho): quase todo pupila, dois reflexos
function shinyEye(c,x,y,rx,ry){c.fillStyle='#1a1020';c.beginPath();c.ellipse(x,y,rx,ry,0,0,7);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(x-rx*.35,y-ry*.38,rx*.36,0,7);c.fill();c.globalAlpha=.7;c.beginPath();c.arc(x+rx*.35,y+ry*.35,rx*.16,0,7);c.fill();c.globalAlpha=1}
// chapéu do gato: cone azul-marinho com ponta dobrada, aba flexível ondulada e fivela dourada
// chapéu equipado (cosmético) para qualquer mago: cone com as cores do item ou coroa
function drawItemHat(c,ch,t){
 const hv=ch.hatItem;
 if(hv.style==='crown'){
  const b=Math.sin(t*2)*.6;c.save();c.translate(0,b);
  const g=c.createLinearGradient(0,26,0,48);g.addColorStop(0,'#fff0a0');g.addColorStop(.5,hv.c1);g.addColorStop(1,hv.c2);c.fillStyle=g;
  c.beginPath();c.moveTo(48,46);c.lineTo(46,28);c.lineTo(56,36);c.lineTo(63,22);c.lineTo(70,34);c.lineTo(77,22);c.lineTo(84,36);c.lineTo(94,28);c.lineTo(92,46);c.closePath();c.fill();
  c.strokeStyle='rgba(90,50,0,.5)';c.lineWidth=1.2;c.stroke();
  c.fillStyle=hv.gem;for(const x of CROWN_GEMS){c.beginPath();c.arc(x,41,2.6,0,6.283);c.fill()}
  c.fillStyle='#fff';c.globalAlpha=.8;c.beginPath();c.arc(62,39.8,1,0,6.283);c.arc(70,39.8,1,0,6.283);c.arc(78,39.8,1,0,6.283);c.fill();c.globalAlpha=1;
  c.restore();return;
 }
 wizHat(c,ch,t,hv);
}
const CROWN_GEMS=[62,70,78];
function wizHat(c,ch,t,hv){
 const w=Math.sin(t*2)*1.6,C1=hv?hv.c1:ch.robe,C2=hv?hv.c2:ch.robeDark,BAND=hv&&hv.band||GOLD;
 if(hv&&hv.glow){c.globalCompositeOperation='lighter';c.globalAlpha=.5+.25*Math.sin(t*3);c.drawImage(softGlow(hv.glow),56,-14,52,52);c.globalAlpha=1;c.globalCompositeOperation='source-over'}
 ch={robe:C1,robeDark:C2};
 c.fillStyle=shade(ch.robeDark,-.15);c.beginPath();c.moveTo(33,47+w*.3);c.quadraticCurveTo(50,36,70,38);c.quadraticCurveTo(90,36,107,46-w*.3);c.quadraticCurveTo(90,55,70,52);c.quadraticCurveTo(50,55,33,47+w*.3);c.fill();
 c.strokeStyle='rgba(255,255,255,.12)';c.lineWidth=1.2;c.beginPath();c.moveTo(36,46);c.quadraticCurveTo(52,38,70,40);c.quadraticCurveTo(88,38,104,45);c.stroke();
 const g=c.createLinearGradient(50,0,92,0);g.addColorStop(0,ch.robeDark);g.addColorStop(.55,ch.robe);g.addColorStop(.8,shade(ch.robe,.18));g.addColorStop(1,ch.robeDark);c.fillStyle=g;
 c.beginPath();c.moveTo(50,45);c.quadraticCurveTo(56,28,66,16);c.quadraticCurveTo(76,4,94+w,8);c.quadraticCurveTo(84,12,82,22);c.quadraticCurveTo(86,34,90,45);c.closePath();c.fill();
 c.strokeStyle='rgba(0,0,0,.25)';c.lineWidth=1.4;c.beginPath();c.moveTo(60,43);c.quadraticCurveTo(64,30,72,18);c.stroke();
 c.fillStyle=BAND;c.beginPath();c.moveTo(51,40);c.quadraticCurveTo(70,35,89,40);c.lineTo(90,46);c.quadraticCurveTo(70,41,50,46);c.fill();
 c.fillStyle=GOLD2;c.beginPath();c.roundRect(64,36.5,12,9,1.5);c.fill();c.fillStyle=ch.robeDark;c.fillRect(67,39,6,4);c.fillStyle=GOLD2;c.fillRect(69.4,39,1.4,4); // fivela
 if(hv&&hv.stars){c.fillStyle='#ffe9a0';for(let i=0;i<HAT_STARS.length;i++){const s=HAT_STARS[i];c.globalAlpha=.6+.4*Math.sin(t*3+i);c.beginPath();c.arc(s[0],s[1],s[2],0,6.283);c.fill()}c.globalAlpha=1}
}
const HAT_STARS=[[62,30,1.4],[74,22,1.1],[80,34,1.3],[70,12,1],[86,10,.9]];
// corpo comum: capa atrás, túnica, faixa, barra dourada, braços, patas e pés
function avatarBody(c,ch,t,fur){
 const D=shade(fur,-.3),sw=Math.sin(t*1.6)*1.5;
 c.fillStyle=shade(ch.robeDark,-.2);c.beginPath();c.moveTo(50,84);c.quadraticCurveTo(36,104,34+sw,128);c.quadraticCurveTo(52,134,70,133);c.quadraticCurveTo(88,134,106-sw,128);c.quadraticCurveTo(104,104,90,84);c.fill(); // capa
 c.strokeStyle=GOLD;c.lineWidth=1.6;c.beginPath();c.moveTo(34+sw,127);c.quadraticCurveTo(52,133,70,132);c.quadraticCurveTo(88,133,106-sw,127);c.stroke();
 c.fillStyle=D;c.beginPath();c.ellipse(60,131,7,4,0,0,7);c.ellipse(80,131,7,4,0,0,7);c.fill();                 // pés
 const g=c.createLinearGradient(44,0,96,0);g.addColorStop(0,ch.robeDark);g.addColorStop(.5,ch.robe);g.addColorStop(.75,shade(ch.robe,.15));g.addColorStop(1,ch.robeDark);c.fillStyle=g;
 c.beginPath();c.moveTo(46,128);c.quadraticCurveTo(46,102,56,84);c.lineTo(84,84);c.quadraticCurveTo(94,102,94,128);c.quadraticCurveTo(70,132,46,128);c.fill();
 c.strokeStyle='rgba(0,0,0,.28)';c.lineWidth=1.6;c.beginPath();c.moveTo(56,94);c.quadraticCurveTo(51,112,52,127);c.moveTo(84,94);c.quadraticCurveTo(89,112,88,127);c.stroke();
 c.strokeStyle=GOLD;c.lineWidth=2.2;c.beginPath();c.moveTo(47,126);c.quadraticCurveTo(70,131,93,126);c.stroke();
 c.strokeStyle=GOLD;c.lineWidth=1.4;c.beginPath();c.moveTo(70,92);c.lineTo(70,129);c.stroke();
 c.fillStyle=shade(ch.robeDark,-.25);c.fillRect(49,108,42,5);c.fillStyle=GOLD2;c.beginPath();c.roundRect(66,107,8,7,1.5);c.fill();c.fillStyle=ch.robeDark;c.fillRect(68.5,109,3,3); // faixa + fivela
 c.fillStyle=ch.robe;c.beginPath();c.ellipse(52,102,8,14,.35,0,7);c.fill();c.beginPath();c.ellipse(94,95,8,13,-.9,0,7);c.fill();
 c.strokeStyle=GOLD;c.lineWidth=1.2;c.beginPath();c.ellipse(49,113,6,3,.35,0,7);c.stroke();
 c.fillStyle=fur;c.beginPath();c.arc(48,116,5.5,0,7);c.fill();c.beginPath();c.arc(106,90,5.5,0,7);c.fill();
 c.fillStyle=shade(ch.robeDark,-.2);c.beginPath();c.ellipse(70,86,16,5,0,0,7);c.fill();                       // gola
}
function drawAvatar(c,ch,t,locked,blink){
 c.clearRect(0,0,140,140);c.save();
 let g=c.createRadialGradient(70,80,5,70,80,68);g.addColorStop(0,hexA(ch.color,.34));g.addColorStop(1,hexA(ch.color,0));c.fillStyle=g;c.fillRect(0,0,140,140);
 c.fillStyle='rgba(0,0,0,.45)';c.beginPath();c.ellipse(70,134,36,5,0,0,7);c.fill();
 // 🌟 aura equipada / brilho de item épico ou lendário (sprites, sem shadowBlur)
 if(ch.auraItem||ch.glowTier){const ac=ch.glowCol;c.globalCompositeOperation='lighter';c.globalAlpha=(.5+.3*Math.sin(t*3))*(ch.glowTier==='legendary'||ch.auraItem?1:.7);c.drawImage(softGlow(ac),6,16,128,128);
  if(ch.auraItem){c.globalAlpha=.6;c.strokeStyle=ac;c.lineWidth=2;c.beginPath();c.ellipse(70,132,40+Math.sin(t*3)*2,7,0,0,6.283);c.stroke();
   if(ch.auraItem.motes||ch.glowTier==='legendary'){const sp=starSprite(ac);for(let i=0;i<4;i++){const a=t*1.6+i*1.571,y=96-((t*.35+i*.25)%1)*80;c.globalAlpha=.8;c.drawImage(sp,70+Math.cos(a)*44-5,y-5,10,10)}}}
  c.globalAlpha=1;c.globalCompositeOperation='source-over'}
 c.translate(0,Math.sin(t*2+ch.unlock)*1.5);
 const fur=ch.fur,P=AV[ch.id]||AV.gato,sw=Math.sin(t*2.4);
 // caudas atrás do corpo
 if(ch.id==='gato'){ // cauda peluda curva do lado direito, listrada
  c.lineCap='round';c.strokeStyle=fur;c.lineWidth=9;c.beginPath();c.moveTo(86,124);c.bezierCurveTo(108,128,122,114,118+sw*3,94);c.stroke();
  c.strokeStyle=P.stripe;c.lineWidth=3;for(const[x,y]of[[100,124],[112,118],[119,106]]){c.beginPath();c.moveTo(x-3,y-3);c.lineTo(x+3,y+3);c.stroke()}
  c.fillStyle=P.stripe;c.beginPath();c.arc(118+sw*3,94,4.5,0,7);c.fill();
 }
 if(ch.id==='raposa'){ // cauda grande e felpuda do lado esquerdo, ponta branca
  c.save();c.translate(34,106);c.rotate(-.75+sw*.08);g=c.createLinearGradient(0,-30,0,26);g.addColorStop(0,P.white);g.addColorStop(.28,P.white);g.addColorStop(.34,fur);g.addColorStop(1,shade(fur,-.25));
  c.fillStyle=g;c.beginPath();c.moveTo(0,26);c.quadraticCurveTo(-18,4,-6,-24);c.quadraticCurveTo(0,-34,6,-24);c.quadraticCurveTo(18,4,0,26);c.fill();c.restore();
 }
 // cajado entalhado com o cristal da cor do mago
 const pulse=.6+.4*Math.sin(t*4),gx=103+GEM_LOCAL.x*.78,gy=134+GEM_LOCAL.y*.78;
 c.drawImage(glowSprite(ch.color),gx-16-pulse*6,gy-16-pulse*6,32+pulse*12,32+pulse*12);
 c.save();c.translate(103,134);c.scale(.78,.78);drawStaff(c,STAFF_LEN,ch.color);c.restore();
 // capuz verde da coruja atrás da cabeça (coelho e raposa usam só a capa, com o capuz abaixado)
 if(ch.id==='coruja'){c.fillStyle=ch.robeDark;c.beginPath();c.arc(70,64,29,Math.PI*.82,Math.PI*2.18);c.lineTo(96,92);c.lineTo(44,92);c.fill()}
 else if(ch.id!=='gato'){c.fillStyle=shade(ch.robeDark,-.1);c.beginPath();c.ellipse(70,86,26,9,0,Math.PI,0);c.fill()}
 avatarBody(c,ch,t,fur);
 // detalhes do peito/fecho de cada um
 if(ch.id==='gato'){c.fillStyle=GOLD2;c.beginPath();c.moveTo(70,88);c.lineTo(62,84);c.lineTo(62,92);c.closePath();c.moveTo(70,88);c.lineTo(78,84);c.lineTo(78,92);c.closePath();c.fill();c.fillStyle=GOLD;c.beginPath();c.arc(70,88,2.6,0,7);c.fill()} // nó dourado
 if(ch.id==='coelho'){c.fillStyle=GOLD2;c.beginPath();c.arc(70,89,3,0,7);c.fill();c.strokeStyle=GOLD;c.lineWidth=1.2;c.beginPath();c.moveTo(58,86);c.lineTo(67,89);c.moveTo(82,86);c.lineTo(73,89);c.stroke()}
 if(ch.id==='raposa'){c.fillStyle=P.white;c.beginPath();c.moveTo(62,84);c.quadraticCurveTo(70,100,78,84);c.fill();c.fillStyle=GOLD2;c.beginPath();c.arc(70,92,3.6,0,7);c.fill();c.fillStyle='#ff4a3a';c.beginPath();c.arc(70,92,1.8,0,7);c.fill()} // peito branco + broche
 if(ch.id==='coruja'){
  c.fillStyle=P.chest;c.beginPath();c.ellipse(70,104,10,15,0,0,7);c.fill();c.strokeStyle=P.mark;c.lineWidth=1.2;for(let i=0;i<3;i++){c.beginPath();c.moveTo(65,98+i*7);c.lineTo(67,101+i*7);c.moveTo(75,98+i*7);c.lineTo(73,101+i*7);c.stroke()}
  c.strokeStyle=GOLD;c.lineWidth=1.2;c.beginPath();c.moveTo(63,89);c.lineTo(77,89);c.stroke();c.fillStyle=GOLD2;c.beginPath();c.arc(63,89,3,0,7);c.arc(77,89,3,0,7);c.fill(); // fecho duplo
 }
 // pedrinha roxa flutuando perto da mão livre do coelho
 if(ch.id==='coelho'){const fy=104+Math.sin(t*2.6)*3,fx=34+Math.cos(t*1.3)*1.5;c.globalCompositeOperation='lighter';c.drawImage(glowSprite(ch.color),fx-11,fy-11,22,22);c.globalCompositeOperation='source-over';drawGem(c,fx,fy,3.4,ch.color)}
 // ---------- cabeças ----------
 if(ch.id==='gato'){
  for(const[ex,s]of[[50,1],[90,-1]]){c.fillStyle=fur;c.beginPath();c.moveTo(ex,58);c.lineTo(ex-s*2,36);c.lineTo(ex+s*15,48);c.fill();c.fillStyle=P.inner;c.beginPath();c.moveTo(ex+s*3,54);c.lineTo(ex+s*1,42);c.lineTo(ex+s*10,48);c.fill()}
  c.fillStyle=fur;c.beginPath();c.ellipse(70,64,22,20,0,0,7);c.fill();
  for(const s of[-1,1]){c.beginPath();c.moveTo(70+s*18,62);c.lineTo(70+s*27,72);c.lineTo(70+s*20,74);c.lineTo(70+s*25,78);c.lineTo(70+s*14,80);c.fill()} // bochechas fofas
  c.strokeStyle=P.stripe;c.lineWidth=2.2;c.lineCap='round';
  for(const s of[-1,1]){c.beginPath();c.moveTo(70+s*20,62);c.lineTo(70+s*15,63);c.moveTo(70+s*21,67);c.lineTo(70+s*16,67);c.stroke()} // listras das bochechas
  c.beginPath();c.moveTo(64,52);c.lineTo(65,57);c.moveTo(70,51);c.lineTo(70,57);c.moveTo(76,52);c.lineTo(75,57);c.stroke(); // listras da testa
  c.fillStyle=P.muzzle;c.beginPath();c.ellipse(64.5,74,7,5.5,0,0,7);c.ellipse(75.5,74,7,5.5,0,0,7);c.fill();
  eye(c,61,63,5.5,6.5,P.eye,1.5);eye(c,79,63,5.5,6.5,P.eye,1.5);
  c.fillStyle=P.nose;c.beginPath();c.moveTo(67,70);c.lineTo(73,70);c.lineTo(70,73);c.fill();
  c.strokeStyle='#5a3a2a';c.lineWidth=1;c.beginPath();c.moveTo(70,73);c.quadraticCurveTo(67,77,64,75);c.moveTo(70,73);c.quadraticCurveTo(73,77,76,75);c.stroke();
  c.strokeStyle='rgba(255,255,255,.75)';c.lineWidth=.9;for(const s of[-1,1])for(let i=0;i<2;i++){c.beginPath();c.moveTo(70+s*12,73+i*3);c.lineTo(70+s*26,71+i*5);c.stroke()}
  if(ch.hatItem)drawItemHat(c,ch,t);else wizHat(c,ch,t);
 }else if(ch.id==='coelho'){
  for(const[ex,r]of[[61,-.12],[79,.12]]){c.save();c.translate(ex,44);c.rotate(r+Math.sin(t*2+ex)*.05);c.fillStyle=fur;c.beginPath();c.ellipse(0,-16,8,26,0,0,7);c.fill();c.fillStyle=P.inner;c.beginPath();c.ellipse(0,-15,4.2,19,0,0,7);c.fill();c.restore()}
  c.fillStyle=fur;c.beginPath();c.ellipse(70,64,21,20,0,0,7);c.fill();
  c.fillStyle=P.muzzle;c.beginPath();c.ellipse(70,73,9,6.5,0,0,7);c.fill();
  c.fillStyle='rgba(244,140,180,.55)';c.beginPath();c.arc(56,71,4.5,0,7);c.arc(84,71,4.5,0,7);c.fill();
  shinyEye(c,62,62,5,6);shinyEye(c,78,62,5,6);
  c.fillStyle=P.nose;c.beginPath();c.ellipse(70,70,3,2.2,0,0,7);c.fill();
  c.strokeStyle='#8a5a6a';c.lineWidth=1;c.beginPath();c.moveTo(70,72);c.quadraticCurveTo(67,76,64,74);c.moveTo(70,72);c.quadraticCurveTo(73,76,76,74);c.stroke();
  c.fillStyle='#fff';c.fillRect(68,74,4,3.5);
 }else if(ch.id==='raposa'){
  for(const[ex,s]of[[50,1],[90,-1]]){c.fillStyle=fur;c.beginPath();c.moveTo(ex,58);c.lineTo(ex-s*4,28);c.lineTo(ex+s*18,48);c.fill();c.fillStyle=P.dark;c.beginPath();c.moveTo(ex-s*1.5,38);c.lineTo(ex-s*4,28);c.lineTo(ex+s*6,34);c.fill();c.fillStyle=P.white;c.beginPath();c.moveTo(ex+s*3,54);c.lineTo(ex+s*1,40);c.lineTo(ex+s*11,48);c.fill()}
  c.fillStyle=fur;c.beginPath();c.moveTo(46,56);c.quadraticCurveTo(70,36,94,56);c.lineTo(88,72);c.quadraticCurveTo(70,90,52,72);c.closePath();c.fill();
  c.fillStyle=P.white;c.beginPath();c.moveTo(48,62);c.quadraticCurveTo(60,76,70,86);c.quadraticCurveTo(80,76,92,62);c.quadraticCurveTo(80,70,70,70);c.quadraticCurveTo(60,70,48,62);c.fill();
  eye(c,61,61,5,4.2,P.eye,1.6);eye(c,79,61,5,4.2,P.eye,1.6);                                                  // olhos amendoados
  c.strokeStyle=P.dark;c.lineWidth=1.4;c.beginPath();c.moveTo(55,58);c.quadraticCurveTo(61,55.5,67,58);c.moveTo(73,58);c.quadraticCurveTo(79,55.5,85,58);c.stroke();
  c.fillStyle=P.dark;c.beginPath();c.ellipse(70,82,3.5,2.6,0,0,7);c.fill();
  c.strokeStyle='#7a3a1a';c.lineWidth=1;c.beginPath();c.moveTo(70,84);c.quadraticCurveTo(66,87,63,85);c.moveTo(70,84);c.quadraticCurveTo(74,87,77,85);c.stroke();
 }else{
  c.fillStyle=P.tuft;for(const[ex,s]of[[48,1],[92,-1]]){c.beginPath();c.moveTo(ex+s*3,52);c.lineTo(ex-s*4,30);c.lineTo(ex+s*14,46);c.fill()} // tufos
  g=c.createRadialGradient(64,56,4,70,64,26);g.addColorStop(0,shade(fur,.18));g.addColorStop(1,shade(fur,-.15));c.fillStyle=g;c.beginPath();c.ellipse(70,64,24,22,0,0,7);c.fill();
  c.strokeStyle=ch.robe;c.lineWidth=5;c.beginPath();c.arc(70,66,26,Math.PI*1.08,Math.PI*1.92);c.stroke();                 // borda do capuz
  c.strokeStyle=GOLD;c.lineWidth=1;c.beginPath();c.arc(70,66,28.4,Math.PI*1.1,Math.PI*1.9);c.stroke();
  c.fillStyle=P.face;c.beginPath();c.arc(60,64,12,0,7);c.arc(80,64,12,0,7);c.fill();
  c.strokeStyle=shade(fur,-.2);c.lineWidth=1.2;c.beginPath();c.arc(60,64,12,0,7);c.moveTo(92,64);c.arc(80,64,12,0,7);c.stroke();
  eye(c,60,63,7.5,7.5,P.eye,4);eye(c,80,63,7.5,7.5,P.eye,4);
  c.strokeStyle=P.tuft;c.lineWidth=2;c.beginPath();c.moveTo(51,54);c.lineTo(66,57);c.moveTo(89,54);c.lineTo(74,57);c.stroke(); // olhar sério
  c.fillStyle=P.beak;c.beginPath();c.moveTo(66,70);c.lineTo(74,70);c.lineTo(70,79);c.fill();
 }
 if(ch.hatItem&&ch.id!=='gato')drawItemHat(c,ch,t); // chapéu cosmético também em coelho, raposa e coruja
 if(blink)closeEyes(c,ch); // piscada (menu vivo)
 if(locked){c.globalCompositeOperation='source-atop';c.fillStyle='rgba(52,56,80,.84)';c.fillRect(0,-8,140,156);c.globalCompositeOperation='source-over'} // bloqueado: silhueta apagada (substitui ctx.filter)
 c.restore();
}

// ================== INIMIGOS: 12 artes (4 tipos × 3 biomas) ==================
const SHAPES=[0,1,2].map(v=>{const R=rng(101+v*57);return Array.from({length:14},()=>.82+R()*.26)});
function eyes(c,r,col,glow){c.save();c.shadowColor=col;c.shadowBlur=glow;c.fillStyle=col;
 for(const s of[-1,1]){c.beginPath();c.moveTo(s*r*.12,-r*.08);c.lineTo(s*r*.52,-r*.3);c.lineTo(s*r*.44,r*.06);c.closePath();c.fill()}
 c.fillStyle='rgba(255,255,220,.9)';for(const s of[-1,1]){c.beginPath();c.arc(s*r*.36,-r*.12,r*.05,0,7);c.fill()}
 c.restore()}
function blobPath(c,r,shape,n,rot,sy=1){c.beginPath();for(let i=0;i<n;i++){const a=i/n*Math.PI*2+rot;c.lineTo(Math.cos(a)*r*shape[i],Math.sin(a)*r*shape[i]*sy)}c.closePath()}
function ghostBody(c,r,t,g){c.fillStyle=g;c.beginPath();c.arc(0,-r*.1,r*.85,Math.PI,0);c.lineTo(r*.85,r*.8);for(let i=0;i<4;i++){const x0=r*.85-i*r*.425;c.quadraticCurveTo(x0-r*.21,r*(1.1+Math.sin(t*6+i)*.18),x0-r*.425,r*.8)}c.closePath();c.fill()}
function flames(c,r,t,c0,c1){for(let i=0;i<9;i++){const a=-Math.PI+i*Math.PI/8,fl=r*(.75+.4*Math.sin(t*9+i*1.7)),fx=Math.cos(a)*r*.78,fy=Math.sin(a)*r*.55-r*.15;
 const g=c.createLinearGradient(fx,fy,fx,fy-fl);g.addColorStop(0,c0);g.addColorStop(.55,c1);g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;
 c.beginPath();c.moveTo(fx-r*.24,fy);c.quadraticCurveTo(fx-r*.1,fy-fl*.6,fx+Math.sin(t*7+i)*r*.15,fy-fl);c.quadraticCurveTo(fx+r*.1,fy-fl*.6,fx+r*.24,fy);c.fill()}}
function cuteEyes(c,r,y,gap,size){for(const s of[-1,1]){c.fillStyle='#1a1020';c.beginPath();c.ellipse(s*r*gap,y,r*size*.8,r*size,0,0,7);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(s*r*gap-r*size*.3,y-r*size*.4,r*size*.32,0,7);c.fill()}}

const ART={
 rock(c,r,v,t){
  const glow=c.createRadialGradient(0,0,r*.5,0,0,r*1.7);glow.addColorStop(0,'rgba(255,120,30,.28)');glow.addColorStop(1,'rgba(255,120,30,0)');c.fillStyle=glow;c.fillRect(-r*2,-r*2,r*4,r*4);
  blobPath(c,r,SHAPES[v],10,v*.7);
  const g=c.createRadialGradient(-r*.35,-r*.4,1,0,0,r*1.15);g.addColorStop(0,'#74727e');g.addColorStop(.45,'#3a3842');g.addColorStop(1,'#121216');c.fillStyle=g;c.fill();
  c.strokeStyle='#08080c';c.lineWidth=1.6;c.stroke();
  c.save();c.clip();
  for(const[x,y,s]of[[-.42,.3,.2],[.36,.4,.15],[.3,-.5,.13],[-.1,.62,.1]]){c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.ellipse(x*r,y*r,s*r,s*r*.8,0,0,7);c.fill();c.strokeStyle='rgba(255,255,255,.12)';c.lineWidth=1;c.beginPath();c.ellipse(x*r,y*r+1,s*r,s*r*.8,0,.2,Math.PI-.2);c.stroke()}
  c.strokeStyle='rgba(255,130,40,.75)';c.lineWidth=1.3;c.shadowColor='#ff8a2a';c.shadowBlur=6;c.beginPath();c.moveTo(-r*.8,r*.1);c.lineTo(-r*.55,r*.25);c.lineTo(-r*.6,r*.5);c.moveTo(r*.85,-r*.1);c.lineTo(r*.6,r*.05);c.stroke();c.restore();
  c.strokeStyle='rgba(255,255,255,.14)';c.lineWidth=2;c.beginPath();c.arc(0,0,r*.85,Math.PI*1.05,Math.PI*1.5);c.stroke();
  eyes(c,r,'#ffa830',12);c.strokeStyle='#ff9a30';c.lineWidth=2;c.beginPath();c.arc(0,r*.52,r*.24,Math.PI*1.15,Math.PI*1.85);c.stroke();
 },
 crystal(c,r,v,t){
  c.shadowColor='#a060ff';c.shadowBlur=20;
  for(const[i,[x0,y0,x1,y1]]of[[-.6,.55,-1.05,-.45],[.6,.55,1.0,-.35],[-.4,.65,-.25,-1.25],[.4,.65,.35,-1.15],[-.75,.7,-1.15,.25],[.75,.7,1.15,.3]].entries()){const g=c.createLinearGradient(x0*r,y0*r,x1*r,y1*r);g.addColorStop(0,'#2a1060');g.addColorStop(1,i%2?'#c090ff':'#8a50f0');c.fillStyle=g;c.beginPath();c.moveTo(x0*r-r*.22,y0*r);c.lineTo(x1*r,y1*r);c.lineTo(x0*r+r*.22,y0*r);c.closePath();c.fill()}
  const g=c.createLinearGradient(-r*.6,-r,r*.6,r);g.addColorStop(0,'#e0c8ff');g.addColorStop(.5,'#8a50f0');g.addColorStop(1,'#3a1888');c.fillStyle=g;
  c.beginPath();c.moveTo(-r*.55,r*.75);c.lineTo(-r*.62,-r*.3);c.lineTo(0,-r*1.08);c.lineTo(r*.62,-r*.3);c.lineTo(r*.55,r*.75);c.lineTo(0,r*.95);c.closePath();c.fill();
  c.shadowBlur=0;c.strokeStyle='rgba(255,255,255,.4)';c.lineWidth=1;c.beginPath();c.moveTo(0,-r*1.08);c.lineTo(0,r*.95);c.moveTo(-r*.62,-r*.3);c.lineTo(0,-r*.1);c.lineTo(r*.62,-r*.3);c.stroke();
  eyes(c,r*.85,'#ff7aff',14);
  c.globalCompositeOperation='lighter';for(let i=0;i<3;i++){const a=t*1.5+i*2.1,sx=Math.cos(a)*r*1.1,sy=Math.sin(a)*r*.9,s=(2+Math.sin(t*6+i)*1.5)*r/23;c.fillStyle='rgba(230,200,255,.9)';c.beginPath();c.moveTo(sx,sy-s*3);c.lineTo(sx+s*.7,sy);c.lineTo(sx,sy+s*3);c.lineTo(sx-s*.7,sy);c.fill();c.beginPath();c.moveTo(sx-s*3,sy);c.lineTo(sx,sy+s*.7);c.lineTo(sx+s*3,sy);c.lineTo(sx,sy-s*.7);c.fill()}
 },
 ghost(c,r,v,t){
  c.shadowColor='#4dff9a';c.shadowBlur=22;
  const g=c.createLinearGradient(0,-r,0,r*1.2);g.addColorStop(0,'rgba(170,255,210,.95)');g.addColorStop(.6,'rgba(60,220,140,.85)');g.addColorStop(1,'rgba(20,140,80,.2)');
  ghostBody(c,r,t,g);
  c.beginPath();c.ellipse(-r*.95,r*.2+Math.sin(t*5)*r*.1,r*.22,r*.13,-.6,0,7);c.ellipse(r*.95,r*.2-Math.sin(t*5)*r*.1,r*.22,r*.13,.6,0,7);c.fill();
  c.shadowBlur=0;c.fillStyle='rgba(255,255,255,.35)';c.beginPath();c.ellipse(-r*.35,-r*.6,r*.22,r*.12,-.5,0,7);c.fill();
  c.fillStyle='#062a18';c.beginPath();c.ellipse(-r*.3,-r*.15,r*.16,r*.25,0,0,7);c.ellipse(r*.3,-r*.15,r*.16,r*.25,0,0,7);c.fill();
  c.fillStyle='#062a18';c.beginPath();c.ellipse(0,r*.3,r*.13,r*.17+Math.sin(t*4)*r*.04,0,0,7);c.fill();
 },
 meteor(c,r,v,t){
  flames(c,r,t,'rgba(255,110,20,.95)','rgba(255,200,60,.6)');
  c.shadowColor='#ff6a1a';c.shadowBlur=34;blobPath(c,r,SHAPES[v],14,0,.92);
  const g=c.createRadialGradient(-r*.3,-r*.3,4,0,0,r*1.1);g.addColorStop(0,'#7a4426');g.addColorStop(.6,'#3a1c10');g.addColorStop(1,'#1a0a06');c.fillStyle=g;c.fill();c.shadowBlur=0;
  c.save();c.strokeStyle='rgba(255,140,40,.85)';c.shadowColor='#ff8a2a';c.shadowBlur=8;c.lineWidth=2.2;c.beginPath();c.moveTo(-r*.75,-r*.2);c.lineTo(-r*.52,r*.08);c.lineTo(-r*.66,r*.42);c.moveTo(r*.62,-r*.55);c.lineTo(r*.45,-r*.25);c.lineTo(r*.7,-r*.05);c.stroke();c.restore();
  c.save();c.shadowColor='#ffb030';c.shadowBlur=22;const fg=c.createLinearGradient(0,-r*.4,0,r*.6);fg.addColorStop(0,'#fff0a0');fg.addColorStop(1,'#ff7a1a');c.fillStyle=fg;
  for(const s of[-1,1]){c.beginPath();c.moveTo(s*r*.12,-r*.05);c.lineTo(s*r*.5,-r*.38);c.lineTo(s*r*.52,r*.05);c.closePath();c.fill()}
  c.beginPath();c.moveTo(-r*.55,r*.2);for(let i=0;i<=6;i++)c.lineTo(-r*.55+i*r*.183,r*(i%2?.32:.2));c.lineTo(r*.5,r*.45);for(let i=6;i>=0;i--)c.lineTo(-r*.55+i*r*.183,r*(i%2?.58:.68));c.closePath();c.fill();c.restore();
 },
 zombie(c,r,v,t){
  c.rotate(Math.sin(t*4)*.08);
  c.fillStyle='#5aa040';c.beginPath();c.roundRect(-r*1.0,r*.3,r*.5,r*.26,r*.12);c.roundRect(r*.5,r*.3+Math.sin(t*4)*2,r*.5,r*.26,r*.12);c.fill();
  const g=c.createRadialGradient(-r*.3,-r*.35,2,0,0,r);g.addColorStop(0,'#c8f89a');g.addColorStop(1,'#4a9a3a');c.fillStyle=g;c.beginPath();c.ellipse(0,0,r*.85,r*.8,0,0,7);c.fill();
  c.strokeStyle='#2a5a20';c.lineWidth=1.5;c.stroke();
  c.fillStyle='#3a2a4a';c.beginPath();c.moveTo(-r*.55,-r*.55);c.quadraticCurveTo(-r*.1,-r*1.05,r*.55,-r*.55);c.quadraticCurveTo(0,-r*.72,-r*.55,-r*.55);c.fill();
  c.strokeStyle='#2a4a1a';c.lineWidth=1.2;c.beginPath();c.moveTo(-r*.05,-r*.5);c.lineTo(r*.42,-r*.3);for(let i=0;i<3;i++){const x=r*.04+i*r*.13,y=-r*.47+i*r*.065;c.moveTo(x-r*.04,y-r*.07);c.lineTo(x+r*.04,y+r*.07)}c.stroke();
  c.fillStyle='#fff';c.beginPath();c.arc(-r*.3,-r*.05,r*.25,0,7);c.fill();c.fillStyle='#1a1020';c.beginPath();c.arc(-r*.26,-r*.02,r*.13,0,7);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(-r*.31,-r*.09,r*.045,0,7);c.fill();
  c.strokeStyle='#1a1020';c.lineWidth=2.2;c.beginPath();c.moveTo(r*.18,-r*.15);c.lineTo(r*.42,r*.07);c.moveTo(r*.42,-r*.15);c.lineTo(r*.18,r*.07);c.stroke();
  c.fillStyle='#3a1020';c.beginPath();c.ellipse(0,r*.36,r*.24,r*.14,0,0,Math.PI);c.fill();c.fillStyle='#fff';c.fillRect(-r*.1,r*.36,r*.09,r*.08);
  c.fillStyle='rgba(255,120,150,.45)';c.beginPath();c.arc(-r*.56,r*.2,r*.1,0,7);c.arc(r*.58,r*.2,r*.1,0,7);c.fill();
 },
 tomb(c,r,v,t){
  const w=r*1.3,h=r*1.7;
  c.fillStyle='#3a6a2a';c.beginPath();c.ellipse(0,h*.5,w*.75,r*.22,0,0,7);c.fill();
  const g=c.createLinearGradient(-w/2,0,w/2,0);g.addColorStop(0,'#5a5a72');g.addColorStop(.5,'#a8a8c4');g.addColorStop(1,'#4a4a60');c.fillStyle=g;
  c.beginPath();c.moveTo(-w/2,h*.5);c.lineTo(-w/2,-h*.15);c.arc(0,-h*.15,w/2,Math.PI,0);c.lineTo(w/2,h*.5);c.closePath();c.fill();c.strokeStyle='#2a2a3a';c.lineWidth=2;c.stroke();
  c.fillStyle='#3a3a50';c.font=`900 ${Math.round(r*.42)}px Nunito,sans-serif`;c.textAlign='center';c.fillText('RIP',0,-h*.2);
  c.strokeStyle='#3a3a50';c.lineWidth=1.3;c.beginPath();c.moveTo(w*.3,-h*.36);c.lineTo(w*.15,-h*.16);c.lineTo(w*.25,0);c.stroke();
  c.shadowColor='#c08aff';c.shadowBlur=12;c.fillStyle='#e8c0ff';c.beginPath();c.ellipse(-w*.2,h*.1,r*.11,r*.15,0,0,7);c.ellipse(w*.2,h*.1,r*.11,r*.15,0,0,7);c.fill();c.shadowBlur=0;
  c.strokeStyle='#2a2a3a';c.lineWidth=2;c.beginPath();c.moveTo(-w*.18,h*.32);c.quadraticCurveTo(0,h*.25,w*.18,h*.32);c.stroke();
  c.fillStyle='#5aa040';for(let i=-3;i<=3;i++){c.beginPath();c.moveTo(i*w*.2-3,h*.5);c.lineTo(i*w*.2,h*.38);c.lineTo(i*w*.2+3,h*.5);c.fill()}
 },
 candy(c,r,v,t){
  c.shadowColor='#ff7ad8';c.shadowBlur=18;
  const g=c.createLinearGradient(0,-r,0,r*1.2);g.addColorStop(0,'#fff0fa');g.addColorStop(.6,'#ffa8e0');g.addColorStop(1,'rgba(255,120,200,.3)');
  ghostBody(c,r,t,g);c.shadowBlur=0;
  c.save();c.clip();c.strokeStyle='rgba(255,70,160,.45)';c.lineWidth=r*.18;c.beginPath();for(let i=-3;i<4;i++){c.moveTo(i*r*.5-r,-r*1.2);c.lineTo(i*r*.5+r,r*1.3)}c.stroke();c.restore();
  c.fillStyle='#ff5ab0';c.beginPath();c.moveTo(0,-r*.95);c.lineTo(-r*.45,-r*1.2);c.lineTo(-r*.4,-r*.75);c.closePath();c.moveTo(0,-r*.95);c.lineTo(r*.45,-r*1.2);c.lineTo(r*.4,-r*.75);c.closePath();c.fill();c.beginPath();c.arc(0,-r*.95,r*.12,0,7);c.fill();
  cuteEyes(c,r,-r*.12,.3,.17);
  c.fillStyle='rgba(255,90,150,.55)';c.beginPath();c.arc(-r*.5,r*.12,r*.1,0,7);c.arc(r*.5,r*.12,r*.1,0,7);c.fill();
  c.strokeStyle='#5a1a3a';c.lineWidth=1.6;c.beginPath();c.arc(0,r*.18,r*.12,.2,Math.PI-.2);c.stroke();
 },
 pumpkin(c,r,v,t){
  flames(c,r,t,'rgba(170,80,255,.95)','rgba(120,255,120,.5)');
  c.shadowColor='#ff9a2a';c.shadowBlur=30;
  for(const[dx,w]of[[-.55,.42],[.55,.42],[-.25,.48],[.25,.48],[0,.45]]){const g=c.createRadialGradient(dx*r-r*.1,-r*.25,2,dx*r,0,r*.9);g.addColorStop(0,'#ffc05a');g.addColorStop(1,'#c45a10');c.fillStyle=g;c.beginPath();c.ellipse(dx*r,r*.05,w*r,r*.8,0,0,7);c.fill()}
  c.shadowBlur=0;c.fillStyle='#3a6a20';c.beginPath();c.roundRect(-r*.08,-r*.95,r*.16,r*.25,3);c.fill();
  c.fillStyle='#ffd24a';c.beginPath();c.moveTo(-r*.5,-r*.62);c.lineTo(-r*.5,-r*1.0);c.lineTo(-r*.25,-r*.8);c.lineTo(0,-r*1.12);c.lineTo(r*.25,-r*.8);c.lineTo(r*.5,-r*1.0);c.lineTo(r*.5,-r*.62);c.closePath();c.fill();
  c.fillStyle='#ff4a8a';c.beginPath();c.arc(0,-r*.78,r*.07,0,7);c.fill();
  c.save();c.shadowColor='#ffe04a';c.shadowBlur=20;c.fillStyle='#fff07a';
  for(const s of[-1,1]){c.beginPath();c.moveTo(s*r*.12,-r*.02);c.lineTo(s*r*.45,-r*.3);c.lineTo(s*r*.48,r*.05);c.closePath();c.fill()}
  c.beginPath();c.moveTo(-r*.5,r*.25);for(let i=0;i<=6;i++)c.lineTo(-r*.5+i*r*.167,r*(i%2?.36:.25));c.lineTo(r*.48,r*.48);for(let i=6;i>=0;i--)c.lineTo(-r*.5+i*r*.167,r*(i%2?.6:.68));c.closePath();c.fill();c.restore();
 },
 bubble(c,r,v,t){
  const s=1+Math.sin(t*3)*.04;c.scale(s,1/s);
  const g=c.createRadialGradient(-r*.3,-r*.35,2,0,0,r);g.addColorStop(0,'rgba(220,255,255,.9)');g.addColorStop(.5,'rgba(90,200,240,.55)');g.addColorStop(1,'rgba(30,110,200,.75)');
  c.shadowColor='#7ae8ff';c.shadowBlur=16;c.fillStyle=g;c.beginPath();c.arc(0,0,r*.9,0,7);c.fill();c.shadowBlur=0;
  c.strokeStyle='rgba(255,255,255,.6)';c.lineWidth=1.5;c.stroke();
  c.fillStyle='rgba(255,255,255,.75)';c.beginPath();c.ellipse(-r*.38,-r*.45,r*.2,r*.11,-.6,0,7);c.fill();
  cuteEyes(c,r,-r*.05,.28,.16);
  c.strokeStyle='#0a2a4a';c.lineWidth=1.8;c.beginPath();c.arc(0,r*.18,r*.16,.2,Math.PI-.2);c.stroke();
  c.strokeStyle='rgba(220,255,255,.7)';c.lineWidth=1;for(const[x,y,rr]of[[.95,-.6,.12],[1.1,-.25,.08],[-1,.4,.1]]){c.beginPath();c.arc(x*r,y*r,rr*r,0,7);c.stroke()}
 },
 urchin(c,r,v,t){
  c.rotate(t*.6);
  c.fillStyle='#ffd24a';for(let i=0;i<16;i++){const a=i/16*Math.PI*2;c.beginPath();c.moveTo(Math.cos(a-.12)*r*.7,Math.sin(a-.12)*r*.7);c.lineTo(Math.cos(a)*r*1.18,Math.sin(a)*r*1.18);c.lineTo(Math.cos(a+.12)*r*.7,Math.sin(a+.12)*r*.7);c.fill()}
  c.rotate(-t*.6);
  const g=c.createRadialGradient(-r*.25,-r*.3,2,0,0,r*.8);g.addColorStop(0,'#c890ff');g.addColorStop(1,'#5a2a9a');c.shadowColor='#c77bff';c.shadowBlur=14;c.fillStyle=g;c.beginPath();c.arc(0,0,r*.75,0,7);c.fill();c.shadowBlur=0;
  c.fillStyle='rgba(255,255,255,.3)';c.beginPath();c.arc(-r*.28,-r*.32,r*.14,0,7);c.fill();
  for(const s of[-1,1]){c.fillStyle='#fff';c.beginPath();c.arc(s*r*.25,-r*.05,r*.17,0,7);c.fill();c.fillStyle='#1a0a2a';c.beginPath();c.arc(s*r*.22,-r*.02,r*.09,0,7);c.fill()}
  c.strokeStyle='#1a0a2a';c.lineWidth=2;c.beginPath();c.moveTo(-r*.42,-r*.3);c.lineTo(-r*.12,-r*.2);c.moveTo(r*.42,-r*.3);c.lineTo(r*.12,-r*.2);c.stroke();
  c.beginPath();c.arc(0,r*.32,r*.12,Math.PI+.3,-.3);c.stroke();
 },
 jelly(c,r,v,t){
  c.strokeStyle='rgba(255,150,230,.75)';c.lineWidth=2.4;c.lineCap='round';
  for(let i=0;i<5;i++){const x0=(-.6+i*.3)*r;c.beginPath();c.moveTo(x0,r*.1);for(let k=1;k<=5;k++)c.lineTo(x0+Math.sin(t*5+i+k)*r*.12,r*.1+k*r*.22);c.stroke()}
  const g=c.createRadialGradient(0,-r*.3,2,0,-r*.1,r);g.addColorStop(0,'rgba(255,230,250,.95)');g.addColorStop(1,'rgba(255,100,210,.55)');
  c.shadowColor='#ff9af0';c.shadowBlur=20;c.fillStyle=g;c.beginPath();const p=1+Math.sin(t*4)*.06;c.ellipse(0,-r*.1,r*.85*p,r*.7/p,0,Math.PI,0);
  for(let i=0;i<6;i++){const x=r*.85*p-i*r*.283*p;c.quadraticCurveTo(x-r*.14,r*.22,x-r*.283*p,r*.1)}c.closePath();c.fill();c.shadowBlur=0;
  c.fillStyle='rgba(255,255,255,.5)';c.beginPath();c.ellipse(-r*.3,-r*.5,r*.18,r*.09,-.5,0,7);c.fill();
  cuteEyes(c,r,-r*.18,.25,.14);
  c.fillStyle='rgba(255,80,160,.5)';c.beginPath();c.arc(-r*.45,0,r*.08,0,7);c.arc(r*.45,0,r*.08,0,7);c.fill();
 },
 octo(c,r,v,t){
  c.fillStyle='#8a4ad8';c.strokeStyle='#8a4ad8';c.lineCap='round';
  for(let i=0;i<6;i++){const x0=(-.65+i*.26)*r;c.lineWidth=r*.2;c.beginPath();c.moveTo(x0,r*.3);for(let k=1;k<=6;k++)c.lineTo(x0+Math.sin(t*4+i*1.3+k*.8)*r*.18+(i-2.5)*k*r*.05,r*.3+k*r*.15);c.stroke()}
  const g=c.createRadialGradient(-r*.3,-r*.45,4,0,-r*.1,r*1.05);g.addColorStop(0,'#d8a8ff');g.addColorStop(.6,'#8a4ad8');g.addColorStop(1,'#4a1a8a');
  c.shadowColor='#c77bff';c.shadowBlur=30;c.fillStyle=g;c.beginPath();c.ellipse(0,-r*.15,r*.95,r*.85,0,0,7);c.fill();c.shadowBlur=0;
  c.fillStyle='rgba(255,255,255,.18)';for(const[x,y,s]of[[-.5,-.6,.12],[.45,-.55,.1],[.2,-.85,.08],[-.15,-.45,.07]]){c.beginPath();c.arc(x*r,y*r,s*r,0,7);c.fill()}
  for(const s of[-1,1]){c.fillStyle='#fff';c.beginPath();c.ellipse(s*r*.32,-r*.1,r*.2,r*.24,0,0,7);c.fill();c.fillStyle='#1a0a2a';c.beginPath();c.ellipse(s*r*.3,-r*.06,r*.1,r*.15,0,0,7);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(s*r*.27,-r*.14,r*.04,0,7);c.fill()}
  c.strokeStyle='#2a0a4a';c.lineWidth=3;c.beginPath();c.moveTo(-r*.55,-r*.42);c.lineTo(-r*.15,-r*.3);c.moveTo(r*.55,-r*.42);c.lineTo(r*.15,-r*.3);c.stroke();
  c.fillStyle='#2a0a4a';c.beginPath();c.ellipse(0,r*.22,r*.14,r*.1,0,0,7);c.fill();
  c.fillStyle='#ffd24a';c.beginPath();c.moveTo(-r*.4,-r*.92);c.lineTo(-r*.4,-r*1.2);c.lineTo(-r*.2,-r*1.05);c.lineTo(0,-r*1.28);c.lineTo(r*.2,-r*1.05);c.lineTo(r*.4,-r*1.2);c.lineTo(r*.4,-r*.92);c.closePath();c.fill();
 }
};
// período de animação de cada arte (s); 0 = estática
const ART_PERIOD={rock:0,crystal:4.19,ghost:1.047,meteor:.7,zombie:1.571,tomb:0,candy:1.047,pumpkin:.7,bubble:2.094,urchin:10.47,jelly:1.571,octo:1.571};
const SPR_FRAMES=12,sprCache=new Map();

// Sprite pré-renderizado (com todo o brilho já "assado"): 1 drawImage por inimigo por quadro
function enemySprite(art,r,v,t){
 const P=ART_PERIOD[art],f=P?((t%P)/P*SPR_FRAMES)|0:0,key=art+'|'+r+'|'+v+'|'+f;
 let s=sprCache.get(key);
 if(!s){const size=Math.ceil(r*5.2);s=mkCanvas(size,size);const c=s.getContext('2d');c.translate(size/2,size/2);ART[art](c,r,v,P?f/SPR_FRAMES*P:0);sprCache.set(key,s)}
 return s;
}
// desenho direto (painéis laterais): usa o mesmo sprite
function drawEnemyArt(c,art,x,y,r,v,t){const s=enemySprite(art,r,v,t);c.drawImage(s,(x-s.lw/2)|0,(y-s.lh/2)|0,s.lw,s.lh)}
// aquece o cache de um bioma em pequenas fatias de tempo ocioso (sem travar o jogo)
function prewarmBiome(bi){
 const jobs=[];for(const kind in BIOMES[bi].art){const art=BIOMES[bi].art[kind],r=ENEMY[kind].r,P=ART_PERIOD[art];for(let v=0;v<(kind==='rock'||kind==='boss'?3:1);v++)for(let f=0;f<(P?SPR_FRAMES:1);f++)jobs.push([art,r,v,P?f/SPR_FRAMES*P+.0001:0])}
 const ric=window.requestIdleCallback||(cb=>setTimeout(()=>cb({timeRemaining:()=>8}),16));
 const run=d=>{while(jobs.length&&d.timeRemaining()>2){const j=jobs.pop();enemySprite(j[0],j[1],j[2],j[3])}if(jobs.length)ric(run)};ric(run);
}

// ================== HUD: caixas e corações pré-renderizados ==================
const hudCache=new Map();
function hudBoxSprite(w,h){
 const key=w+'x'+h;let s=hudCache.get(key);if(s)return s;
 s=mkCanvas(w+24,h+24);const c=s.getContext('2d'),x=12,y=10;
 c.shadowColor='rgba(0,0,0,.55)';c.shadowBlur=12;c.shadowOffsetY=3;
 const bgG=c.createLinearGradient(0,y,0,y+h);bgG.addColorStop(0,'rgba(22,26,62,.86)');bgG.addColorStop(1,'rgba(6,8,24,.86)');
 c.fillStyle=bgG;c.beginPath();c.roundRect(x,y,w,h,8);c.fill();c.shadowColor='transparent';
 const g=c.createLinearGradient(x,y,x,y+h);g.addColorStop(0,'#ffe4a0');g.addColorStop(.5,'#9a6a22');g.addColorStop(1,'#ffd98a');c.strokeStyle=g;c.lineWidth=1.8;c.stroke();
 c.strokeStyle='rgba(232,184,106,.3)';c.lineWidth=1;c.beginPath();c.roundRect(x+3.5,y+3.5,w-7,h-7,5);c.stroke();
 c.fillStyle='#ffd98a';c.shadowColor='#ffd98a';c.shadowBlur=6;
 for(const[a,b]of[[x,y],[x+w,y],[x,y+h],[x+w,y+h]]){c.beginPath();c.moveTo(a,b-4);c.lineTo(a+4,b);c.lineTo(a,b+4);c.lineTo(a-4,b);c.fill()}
 hudCache.set(key,s);return s;
}
function hudBox(c,x,y,w,h){c.drawImage(hudBoxSprite(w,h),x-12,y-10)}
function heartPath(c){c.beginPath();c.moveTo(0,5);c.bezierCurveTo(-1,3,-8,-1,-8,-5);c.bezierCurveTo(-8,-10,-2,-11,0,-6);c.bezierCurveTo(2,-11,8,-10,8,-5);c.bezierCurveTo(8,-1,1,3,0,5);c.closePath()}
const heartSpr=[0,1].map(full=>{const s=mkCanvas(40,40),c=s.getContext('2d');c.translate(20,20);c.scale(1.25,1.25);heartPath(c);
 if(full){c.shadowColor='#ff3a5a';c.shadowBlur=10;const g=c.createLinearGradient(0,-10,0,5);g.addColorStop(0,'#ff6a7a');g.addColorStop(1,'#c41a3a');c.fillStyle=g}else c.fillStyle='#2a1a2e';c.fill();return s});
function heart(c,x,y,s,full){const k=s/20;c.drawImage(heartSpr[full?1:0],(x-20*k)|0,(y-20*k)|0,(40*k)|0,(40*k)|0)}
