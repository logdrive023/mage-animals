// Mage Animals — js/render/villagemap.js · 🗺️ Ilustração do Reino (Vila dos Magos), 100% desenhada em código.
// Dois estilos:
//  · paintVillage        → modal "Meu Reino": ilha flutuante diurna (nuvens, rio com ponte e cascata, praça com fonte,
//                          floresta, prédios em tons pastel com telhado roxo). Cada prédio muda com o nível.
//  · paintVillageClassic → versão noturna, usada só como fundo da cena "kingdom" do menu (js/render/vignettes.js).
// Desempenho: a cena é desenhada UMA vez num canvas em cache (chave = níveis + tamanho) — zero custo por quadro.
// Os nomes/níveis são placas HTML por cima (texto nítido no celular, clicáveis).
'use strict';

// ===================================================================================================
// Clássico (noite) — fundo da cena "kingdom" do menu
// ===================================================================================================
const VMAP_CLASSIC={W:640,H:380,pos:{sanct:[320,205],mine:[112,138],lab:[92,262],forge:[505,128],tavern:[205,316],market:[528,268],barn:[405,318]}};

function vmStars(c,n,seed){let s=seed;const r=()=>(s=(s*16807)%2147483647)/2147483647;c.fillStyle='#fff';for(let i=0;i<n;i++){c.globalAlpha=.25+r()*.7;const x=r()*VMAP_CLASSIC.W,y=r()*70,z=r()*1.4+.3;c.fillRect(x,y,z,z)}c.globalAlpha=1}
let _vkL=null; // luzes registradas enquanto o mapa do modal é pintado (reacesas no crepúsculo: vkDusk)
function vmGlow(c,x,y,r,col,a){if(_vkL)_vkL.push([x,y,r,col,a]);const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,hexA(col,a));g.addColorStop(1,hexA(col,0));c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,6.283);c.fill()}
function vmCrystal(c,x,y,h,col,lean){
 const w=h*.32;c.save();c.translate(x,y);c.rotate(lean||0);
 const g=c.createLinearGradient(-w,0,w,0);g.addColorStop(0,shade(col,.45));g.addColorStop(.5,col);g.addColorStop(1,shade(col,-.35));c.fillStyle=g;
 c.beginPath();c.moveTo(0,-h);c.lineTo(w,-h*.7);c.lineTo(w*.8,0);c.lineTo(-w*.8,0);c.lineTo(-w,-h*.7);c.closePath();c.fill();
 c.fillStyle='rgba(255,255,255,.55)';c.beginPath();c.moveTo(0,-h);c.lineTo(-w*.35,-h*.65);c.lineTo(-w*.2,-h*.1);c.lineTo(0,-h*.7);c.fill();c.restore();
}
function vmTree(c,x,y,s){c.fillStyle='#3a2616';c.fillRect(x-2*s,y-6*s,4*s,8*s);c.fillStyle='#14382a';c.beginPath();c.moveTo(x,y-34*s);c.lineTo(x+13*s,y-6*s);c.lineTo(x-13*s,y-6*s);c.fill();c.fillStyle='#1d4a36';c.beginPath();c.moveTo(x,y-34*s);c.lineTo(x+13*s,y-6*s);c.lineTo(x+2*s,y-6*s);c.fill()}
/** casa em perspectiva leve: frente + lateral + telhado de duas águas */
function vmHouse(c,x,y,w,h,o){
 const d=w*.42,dy=d*.5,rh=o.rh||w*.5,wall=o.wall||'#c9b08a',roof=o.roof||'#6a4ab0';
 c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.ellipse(x+d*.4,y+3,w*.75,8,0,0,6.283);c.fill();
 c.fillStyle=shade(wall,-.28);c.beginPath();c.moveTo(x+w/2,y);c.lineTo(x+w/2+d,y-dy);c.lineTo(x+w/2+d,y-dy-h);c.lineTo(x+w/2,y-h);c.fill();
 c.fillStyle=wall;c.fillRect(x-w/2,y-h,w,h);
 if(o.stone){c.strokeStyle='rgba(0,0,0,.18)';c.lineWidth=1;for(let yy=y-h+6;yy<y;yy+=7){c.beginPath();c.moveTo(x-w/2,yy);c.lineTo(x+w/2,yy);c.stroke()}}
 else{c.strokeStyle='rgba(60,30,10,.45)';c.lineWidth=2;c.strokeRect(x-w/2,y-h,w,h);c.beginPath();c.moveTo(x-w/2,y-h*.5);c.lineTo(x+w/2,y-h*.5);c.stroke()}
 c.fillStyle=shade(roof,-.25);c.beginPath();c.moveTo(x,y-h-rh);c.lineTo(x+d,y-h-rh-dy);c.lineTo(x+w/2+d+4,y-h-dy+2);c.lineTo(x+w/2+4,y-h+2);c.closePath();c.fill();
 c.fillStyle=roof;c.beginPath();c.moveTo(x-w/2-5,y-h+2);c.lineTo(x,y-h-rh);c.lineTo(x+w/2+5,y-h+2);c.closePath();c.fill();
 c.strokeStyle=shade(roof,-.45);c.lineWidth=1.5;for(let i=1;i<4;i++){const k=i/4;c.beginPath();c.moveTo(x-(w/2+5)*(1-k),y-h+2-(rh)*k*.98);c.lineTo(x+(w/2+5)*(1-k),y-h+2-(rh)*k*.98);c.stroke()}
 c.fillStyle='#3a2414';c.beginPath();c.roundRect(x-w*.12,y-h*.55,w*.24,h*.55,[w*.12,w*.12,0,0]);c.fill();
 vmGlow(c,x-w*.32,y-h*.62,10,o.light||'#ffd27a',.45);vmGlow(c,x+w*.32,y-h*.62,10,o.light||'#ffd27a',.45);
 c.fillStyle=o.light||'#ffd27a';c.fillRect(x-w*.38,y-h*.72,w*.13,h*.2);c.fillRect(x+w*.25,y-h*.72,w*.13,h*.2);
}
function vmSite(c,x,y,s){
 c.fillStyle='rgba(0,0,0,.3)';c.beginPath();c.ellipse(x,y+2,34*s,8*s,0,0,6.283);c.fill();
 c.fillStyle='#7a7f96';for(const[a,b,r]of[[-18,-4,7],[-6,-6,8],[8,-4,7],[16,-9,5],[-12,-12,5]]){c.beginPath();c.arc(x+a*s,y+b*s,r*s,0,6.283);c.fill()}
 c.strokeStyle='#a87a4a';c.lineWidth=3*s;c.beginPath();c.moveTo(x-22*s,y);c.lineTo(x-22*s,y-44*s);c.moveTo(x+22*s,y);c.lineTo(x+22*s,y-44*s);c.moveTo(x-26*s,y-40*s);c.lineTo(x+26*s,y-40*s);c.moveTo(x-22*s,y-20*s);c.lineTo(x+22*s,y-36*s);c.stroke();
}
function paintVillageClassic(c,lv){
 const W=VMAP_CLASSIC.W,H=VMAP_CLASSIC.H,P=VMAP_CLASSIC.pos;
 let g=c.createLinearGradient(0,0,0,120);g.addColorStop(0,'#0b0e2a');g.addColorStop(1,'#26205a');c.fillStyle=g;c.fillRect(0,0,W,H);vmStars(c,70,7);
 vmGlow(c,480,30,90,'#9a6aff',.22);vmGlow(c,140,20,70,'#5ad0ff',.16);
 c.fillStyle='#2a2a5e';c.beginPath();c.moveTo(0,110);[[60,60],[120,92],[190,50],[260,90],[330,58],[400,94],[470,46],[540,86],[600,62],[640,90],[640,130],[0,130]].forEach(p=>c.lineTo(p[0],p[1]));c.fill();
 c.fillStyle='#1c2048';c.beginPath();c.moveTo(0,118);[[80,86],[150,112],[230,80],[310,110],[380,84],[460,112],[540,80],[640,108],[640,140],[0,140]].forEach(p=>c.lineTo(p[0],p[1]));c.fill();
 g=c.createLinearGradient(0,100,0,H);g.addColorStop(0,'#1f5a42');g.addColorStop(1,'#16402f');c.fillStyle=g;c.beginPath();c.roundRect(-10,104,W+20,H,28);c.fill();
 c.fillStyle='rgba(120,220,140,.08)';for(const[x,y,r]of[[90,190,60],[250,280,70],[470,200,60],[560,340,50],[60,340,50],[330,120,60]]){c.beginPath();c.ellipse(x,y,r,r*.45,0,0,6.283);c.fill()}
 c.lineCap='round';c.lineJoin='round';
 const river=()=>{c.beginPath();c.moveTo(600,104);c.bezierCurveTo(560,170,640,210,580,250);c.bezierCurveTo(530,290,560,330,620,380)};
 river();c.strokeStyle='#123a6a';c.lineWidth=34;c.stroke();river();c.strokeStyle='#2a8fd8';c.lineWidth=26;c.stroke();river();c.strokeStyle='rgba(160,230,255,.55)';c.lineWidth=3;c.setLineDash([10,14]);c.stroke();c.setLineDash([]);
 for(const[x,y,h]of[[566,150,12],[612,214,10],[556,262,13],[590,320,11],[610,360,9]]){vmGlow(c,x,y-h*.5,16,'#5ad0ff',.4);vmCrystal(c,x,y,h,'#7ae8ff',.2)}
 c.strokeStyle='#8a7a5a';c.lineWidth=16;
 for(const id of['mine','lab','forge','tavern','market','barn']){const[x,y]=P[id];c.beginPath();c.moveTo(320,212);c.quadraticCurveTo((x+320)/2,(y+212)/2+20,x,y+6);c.stroke()}
 c.strokeStyle='#b8a47a';c.lineWidth=11;
 for(const id of['mine','lab','forge','tavern','market','barn']){const[x,y]=P[id];c.beginPath();c.moveTo(320,212);c.quadraticCurveTo((x+320)/2,(y+212)/2+20,x,y+6);c.stroke()}
 const sl=lv.sanct|0;
 c.fillStyle='#5a5e78';c.beginPath();c.ellipse(320,214,128,60,0,0,6.283);c.fill();
 c.fillStyle='#7a7f9a';c.beginPath();c.ellipse(320,210,124,56,0,0,6.283);c.fill();
 c.strokeStyle='#5a5e78';c.lineWidth=2;for(let a=0;a<6.283;a+=.26){c.beginPath();c.moveTo(320+Math.cos(a)*92,210+Math.sin(a)*41);c.lineTo(320+Math.cos(a)*124,210+Math.sin(a)*56);c.stroke()}
 c.fillStyle='#2a6a4a';c.beginPath();c.ellipse(320,210,90,40,0,0,6.283);c.fill();
 c.fillStyle='#8a8fa8';c.beginPath();c.ellipse(320,206,56,24,0,0,6.283);c.fill();c.fillStyle='#a4a9c2';c.beginPath();c.ellipse(320,202,46,19,0,0,6.283);c.fill();
 const th=70+sl*5,tx=320,ty=200;
 vmGlow(c,tx,ty-th-10,60+sl*5,'#5ad0ff',.35);
 g=c.createLinearGradient(tx-20,0,tx+20,0);g.addColorStop(0,'#5a5e88');g.addColorStop(.5,'#b8bcd8');g.addColorStop(1,'#4a4e78');c.fillStyle=g;
 c.beginPath();c.moveTo(tx-22,ty);c.lineTo(tx-14,ty-th);c.lineTo(tx+14,ty-th);c.lineTo(tx+22,ty);c.closePath();c.fill();
 c.fillStyle='#e8b86a';for(const k of[.3,.62]){c.fillRect(tx-20+k*6,ty-th*k-3,40-k*12,4)}
 c.fillStyle='#3a3e68';c.fillRect(tx-16,ty-th-8,32,10);
 const nC=2+Math.min(5,Math.ceil(sl/2));for(let i=0;i<nC;i++){const a=(i/(nC-1||1)-.5)*1.1;vmCrystal(c,tx+a*22,ty-th-6,22+sl*1.6-Math.abs(a)*10,'#6ad8ff',a*.5)}
 vmCrystal(c,tx,ty-th-4,30+sl*2.4,'#9af0ff',0);
 for(let i=0;i<4;i++){const a=i*1.57+.4;vmCrystal(c,tx+Math.cos(a)*44,ty+Math.sin(a)*14,10+sl,'#5ad0ff',a)}
 const ml=lv.mine|0;let[x,y]=P.mine;
 if(!ml)vmSite(c,x,y,1);else{
  c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.ellipse(x,y+4,62,12,0,0,6.283);c.fill();
  c.fillStyle='#3a3648';c.beginPath();c.moveTo(x-60,y);c.lineTo(x-44,y-46);c.lineTo(x-14,y-66);c.lineTo(x+20,y-58);c.lineTo(x+52,y-30);c.lineTo(x+62,y);c.closePath();c.fill();
  c.fillStyle='#4e4a62';c.beginPath();c.moveTo(x-44,y-46);c.lineTo(x-14,y-66);c.lineTo(x+20,y-58);c.lineTo(x+4,y-40);c.lineTo(x-26,y-36);c.closePath();c.fill();
  c.fillStyle='#120e1e';c.beginPath();c.moveTo(x-16,y);c.lineTo(x-16,y-22);c.quadraticCurveTo(x,y-38,x+16,y-22);c.lineTo(x+16,y);c.fill();
  vmGlow(c,x,y-14,26,'#5ad0ff',.65);
  const nm=3+Math.min(7,ml);for(let i=0;i<nm;i++){const a=i/nm,cx=x-50+a*104,cy=y-8-Math.sin(a*3.14)*40;vmGlow(c,cx,cy-8,16,'#ffd24a',.35);vmCrystal(c,cx,cy,10+((i*7)%9)+ml,'#ffd24a',(a-.5)*.8)}
 }
 const ll=lv.lab|0;[x,y]=P.lab;
 if(!ll)vmSite(c,x,y,1);else{vmHouse(c,x,y,58,40,{wall:'#b89a76',roof:'#6a3ab8',light:'#9affb0'});
  c.fillStyle='#5a4a6a';c.fillRect(x+16,y-80,9,22);for(let i=0;i<3;i++)vmGlow(c,x+20+i*4,y-88-i*10,7+i*2,'#7aff9a',.5);
 }
 const fl=lv.forge|0;[x,y]=P.forge;
 if(!fl)vmSite(c,x,y,1);else{vmHouse(c,x,y,62,42,{wall:'#8a8a9a',roof:'#3a4a6a',light:'#ff9a3a',stone:true});
  c.fillStyle='#4a4a5a';c.fillRect(x-24,y-86,12,26);vmGlow(c,x-18,y-92,14,'#ff8a3a',.55);
  vmGlow(c,x,y-12,30,'#ff7a2a',.45+fl*.03);c.fillStyle='#2a2a34';c.fillRect(x+34,y-10,16,6);c.fillRect(x+38,y-4,8,6);
 }
 const tl=lv.tavern|0;[x,y]=P.tavern;
 if(!tl)vmSite(c,x,y,1);else{vmHouse(c,x,y,66,42,{wall:'#c9a87a',roof:'#2a5a9a'});
  c.strokeStyle='#5a3a1a';c.lineWidth=2;c.beginPath();c.moveTo(x-40,y-34);c.lineTo(x-40,y-12);c.moveTo(x-46,y-34);c.lineTo(x-34,y-34);c.stroke();
  c.fillStyle='#e8b86a';c.fillRect(x-45,y-30,10,10);c.fillStyle='#fff';c.fillRect(x-45,y-30,10,3);
 }
 [x,y]=P.market;
 c.fillStyle='rgba(0,0,0,.3)';c.beginPath();c.ellipse(x,y+3,50,10,0,0,6.283);c.fill();
 c.fillStyle='#6a4a2a';c.fillRect(x-40,y-22,80,22);c.fillStyle='#8a6a3a';c.fillRect(x-40,y-24,80,4);
 c.strokeStyle='#5a3a1a';c.lineWidth=3;c.beginPath();c.moveTo(x-40,y-22);c.lineTo(x-40,y-58);c.moveTo(x+40,y-22);c.lineTo(x+40,y-58);c.stroke();
 for(let i=0;i<8;i++){c.fillStyle=i%2?'#f0e6ff':'#7a3ab8';c.beginPath();c.moveTo(x-46+i*11.5,y-58);c.lineTo(x-46+(i+1)*11.5,y-58);c.lineTo(x-44+(i+1)*11.5,y-44);c.lineTo(x-44+i*11.5,y-44);c.fill()}
 c.fillStyle='#3a1a6a';c.fillRect(x-30,y-76,60,15);c.fillStyle='#ffd98a';c.font='900 10px Cinzel, serif';c.textAlign='center';c.fillText('MÍSTICO',x,y-65);c.textAlign='left';
 for(const[a,col]of[[-24,'#ff7aa8'],[-6,'#7ae8ff'],[12,'#ffd24a'],[26,'#9aff7a']]){c.fillStyle=col;c.beginPath();c.arc(x+a,y-28,4,0,6.283);c.fill()}
 [x,y]=P.barn;
 c.fillStyle='rgba(0,0,0,.3)';c.beginPath();c.ellipse(x,y+3,58,11,0,0,6.283);c.fill();
 c.fillStyle='#5a3a1e';c.fillRect(x-44,y-34,88,34);c.fillStyle='#2a1a0e';c.fillRect(x-34,y-26,68,26);
 c.fillStyle='#8a4a2a';c.beginPath();c.moveTo(x-52,y-32);c.lineTo(x,y-58);c.lineTo(x+52,y-32);c.closePath();c.fill();
 c.strokeStyle='#a87a4a';c.lineWidth=2.5;for(let i=0;i<7;i++){c.beginPath();c.moveTo(x-56+i*18,y+12);c.lineTo(x-56+i*18,y-2);c.stroke()}c.beginPath();c.moveTo(x-58,y+4);c.lineTo(x+56,y+4);c.stroke();
 for(const[a,b]of[[-16,-6],[8,-4],[28,8]]){c.fillStyle='#f4f0e8';c.beginPath();c.ellipse(x+a,y+b,9,6,0,0,6.283);c.fill();c.fillStyle='#2a2430';c.beginPath();c.arc(x+a+8,y+b-2,3.4,0,6.283);c.fill()}
 for(const[tx2,ty2,s]of[[22,170,1],[40,120,.8],[200,128,.8],[250,112,.7],[400,118,.7],[440,138,.8],[600,180,.8],[30,300,1],[290,360,.9],[470,370,.9],[150,210,.7],[630,300,.8]])vmTree(c,tx2,ty2,s);
 for(const[fx,fy,h,col]of[[180,170,9,'#c9a6ff'],[440,232,8,'#7ae8ff'],[250,240,7,'#ffd24a'],[60,220,8,'#c9a6ff'],[380,150,7,'#7ae8ff']]){vmGlow(c,fx,fy-5,14,col,.45);vmCrystal(c,fx,fy,h,col,.3)}
}

// ===================================================================================================
// Ilha flutuante (dia) — modal "Meu Reino"
// ===================================================================================================
const VMAP={W:720,H:470,
 // base (no chão) de cada prédio e posição da placa (abaixo dele), no espaço lógico 720×470
 pos:{sanct:[360,214],mine:[152,160],lab:[166,322],forge:[586,162],tavern:[262,380],market:[590,300],barn:[476,380]},
 pin:{sanct:[360,318],mine:[150,198],lab:[166,356],forge:[586,196],tavern:[262,412],market:[590,334],barn:[476,412]},
 cache:null,key:''};
// paleta pastel (paredes creme, madeira quente, telhados roxos, pedra clara)
const VK={wall:'#f6ead2',side:'#e2cfae',wood:'#9a643c',woodD:'#6e442a',roof:'#7f62d2',roofD:'#5c43ad',roofL:'#a58cec',stone:'#e7e2da',stoneD:'#bdb4ab',win:'#ffd877',out:'rgba(72,46,96,.34)'};
const VI={CX:360,CY:248,RX:338,RY:168};
const vkR=a=>1+.035*Math.sin(3*a+.5)+.025*Math.sin(7*a+1.3)+.012*Math.sin(13*a);
function vkRng(seed){let s=seed;return()=>(s=(s*16807)%2147483647)/2147483647}
function vkPoly(c,pts,fill,stroke,lw){c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw||1.2;c.stroke()}}
function vkShadow(c,x,y,rx,ry){c.fillStyle='rgba(70,60,40,.18)';c.beginPath();c.ellipse(x,y,rx,ry,0,0,6.283);c.fill()}
function vkIsland(c,dy,k){c.beginPath();for(let i=0;i<=120;i++){const a=i/120*6.283,r=vkR(a)*(k||1);const x=VI.CX+Math.cos(a)*VI.RX*r,y=VI.CY+Math.sin(a)*VI.RY*r+dy;i?c.lineTo(x,y):c.moveTo(x,y)}c.closePath()}
function vkInside(x,y,k){const a=Math.atan2((y-VI.CY)/VI.RY,(x-VI.CX)/VI.RX),dx=(x-VI.CX)/VI.RX,dy=(y-VI.CY)/VI.RY;return Math.hypot(dx,dy)<vkR(a)*(k||1)}
// ---------- nuvens volumétricas: "bolhas" com luz de cima (branco) e sombra lavanda embaixo ----------
function vkPuff(c,x,y,r,dark){
 // quase todo branco; o lavanda aparece só na borda de baixo (luz vem de cima)
 const g=c.createRadialGradient(x-r*.15,y-r*.55,r*.05,x,y-r*.1,r*1.12);
 g.addColorStop(0,'#ffffff');g.addColorStop(.62,'#ffffff');g.addColorStop(.86,dark?'#ece7f3':'#f4f1f8');g.addColorStop(1,dark?'#dcd4e8':'#e6dfee');
 c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,6.283);c.fill();
}
/** cúmulo solto (fundo): várias bolhas + base achatada */
function vkCloud(c,x,y,s,a){
 c.save();c.globalAlpha=a==null?1:a;
 for(const[dx,dy,r]of[[-34,8,18],[34,8,17],[-14,-4,24],[16,-6,22],[0,8,22]])vkPuff(c,x+dx*s,y+dy*s,r*s,true);
 c.restore();
}
/** borda de baixo da ilha em cada x (para as nuvens abraçarem a base sem cobrir prédios) */
function vkEdgeY(x){let best=null;for(let i=0;i<=90;i++){const a=i/90*Math.PI,r=vkR(a),px=VI.CX+Math.cos(a)*VI.RX*r;if(best===null||Math.abs(px-x)<Math.abs(best[0]-x))best=[px,VI.CY+Math.sin(a)*VI.RY*r]}return best[1]}
/** banco de nuvens ao redor da base: fileira de trás (menor, mais lavanda) + fileira da frente (maior, iluminada) */
function vkCloudBank(c){
 const rnd=vkRng(77),W=VMAP.W,H=VMAP.H,edge=x=>Math.max(vkEdgeY(Math.min(Math.max(x,VI.CX-VI.RX+20),VI.CX+VI.RX-20)),310);
 // sombra lavanda difusa sob o banco (dá peso e assenta as nuvens)
 const sg=c.createLinearGradient(0,H-90,0,H);sg.addColorStop(0,'rgba(214,205,230,0)');sg.addColorStop(1,'rgba(214,205,230,.55)');c.fillStyle=sg;c.beginPath();c.ellipse(VI.CX,H-8,VI.RX*1.02,70,0,0,6.283);c.fill();
 // cúmulos: lóbulos de tamanhos variados, espaçamento irregular; os maiores no meio de cada grupo
 const lobes=(y0,dark,seedStep)=>{let x=-20;while(x<W+30){const big=rnd()<.45,r=big?34+rnd()*22:20+rnd()*14;const e=edge(x);
   vkPuff(c,x,Math.min(H+r*.35,e+y0+r*.42+(rnd()-.5)*10),r,dark);x+=seedStep*(.55+rnd()*.6)+r*.35}};
 lobes(40,true,34);  // atrás: deixa à mostra as camadas de terra/rocha logo abaixo da grama
 lobes(62,false,40); // frente: volume principal, mais baixo
}
function vkPine(c,x,y,s){
 vkShadow(c,x+3*s,y+1,10*s,3.5*s);
 c.fillStyle='#7a5234';c.fillRect(x-2*s,y-7*s,4*s,8*s);
 const T=[[0,'#3f7f3a','#5fa247'],[1,'#468a3e','#6cb34f'],[2,'#4f9644','#7dc25a']];
 for(const[i,dk,lt]of T){const yb=y-6*s-i*9*s,w=(15-i*3.6)*s,h=17*s;
  c.fillStyle=dk;c.beginPath();c.moveTo(x-w,yb);c.quadraticCurveTo(x,yb+4*s,x+w,yb);c.lineTo(x,yb-h);c.closePath();c.fill();
  c.fillStyle=lt;c.beginPath();c.moveTo(x-w*.15,yb+1*s);c.quadraticCurveTo(x-w*.6,yb+1,x-w,yb);c.lineTo(x,yb-h);c.closePath();c.fill()}
}
function vkBush(c,x,y,s){
 vkShadow(c,x+2*s,y+1,13*s,4*s);
 c.fillStyle='#7a5234';c.fillRect(x-1.6*s,y-6*s,3.2*s,7*s);
 for(const[dx,dy,r,col]of[[-6,-12,9,'#4d9442'],[6,-13,9,'#4d9442'],[0,-20,10,'#5aa34a'],[-3,-19,6,'#86c95f'],[4,-11,5,'#78bd57']]){c.fillStyle=col;c.beginPath();c.arc(x+dx*s,y+dy*s,r*s,0,6.283);c.fill()}
}
/** casinha 2,5D: frente + lateral + telhado de duas águas (roxo), contorno suave de ilustração */
function vkHouse(c,x,y,o){
 const w=o.w,h=o.h,d=o.d||w*.42,dy=d*.5,rh=o.rh||w*.55,L=x-w/2,R=x+w/2,wall=o.wall||VK.wall;
 vkShadow(c,x+d*.35,y+3,w*.72+d*.3,10);
 vkPoly(c,[[R,y],[R+d,y-dy],[R+d,y-dy-h],[R,y-h]],o.side||VK.side,VK.out);
 vkPoly(c,[[L,y],[R,y],[R,y-h],[L,y-h]],wall,VK.out);
 if(o.stone){c.strokeStyle='rgba(90,80,100,.22)';c.lineWidth=1;for(let yy=y-h+7,r=0;yy<y;yy+=7,r++){c.beginPath();c.moveTo(L,yy);c.lineTo(R,yy);c.stroke();for(let xx=L+(r%2?6:12);xx<R;xx+=12){c.beginPath();c.moveTo(xx,yy);c.lineTo(xx,yy-7);c.stroke()}}}
 if(o.planks){c.strokeStyle='rgba(80,40,20,.22)';c.lineWidth=1;for(let xx=L+7;xx<R;xx+=7){c.beginPath();c.moveTo(xx,y);c.lineTo(xx,y-h);c.stroke()}}
 if(o.timber){c.strokeStyle=o.beam||VK.wood;c.lineWidth=2.6;c.beginPath();c.moveTo(L+2,y);c.lineTo(L+2,y-h);c.moveTo(R-2,y);c.lineTo(R-2,y-h);c.moveTo(L,y-h*.52);c.lineTo(R,y-h*.52);c.moveTo(L+2,y-h*.52);c.lineTo(L+w*.2,y-h);c.moveTo(R-2,y-h*.52);c.lineTo(R-w*.2,y-h);c.stroke()}
 // telhado: água da direita (visível) + empena da frente + beiral grosso
 const rg=c.createLinearGradient(x,y-h-rh,R+d,y-h);rg.addColorStop(0,o.roofL||VK.roofL);rg.addColorStop(1,o.roof||VK.roof);
 vkPoly(c,[[x,y-h-rh],[x+d,y-h-rh-dy],[R+d+5,y-h-dy+3],[R+5,y-h+3]],rg,VK.out);
 c.strokeStyle='rgba(50,30,110,.22)';c.lineWidth=1;for(const k of[.25,.5,.75]){const px=x+(R+5-x)*k,py=y-h-rh+(rh+3)*k;c.beginPath();c.moveTo(px,py);c.lineTo(px+d,py-dy);c.stroke()}
 vkPoly(c,[[L-2,y-h],[x,y-h-rh+3],[R+2,y-h]],o.gable||wall,VK.out);
 c.strokeStyle=o.roofD||VK.roofD;c.lineWidth=5;c.lineCap='round';c.lineJoin='round';c.beginPath();c.moveTo(L-6,y-h+4);c.lineTo(x,y-h-rh);c.lineTo(R+5,y-h+4);c.stroke();
 if(o.round!==false){c.fillStyle=VK.woodD;c.beginPath();c.arc(x,y-h-rh*.42,5.5,0,6.283);c.fill();c.fillStyle=VK.win;c.beginPath();c.arc(x,y-h-rh*.42,3.8,0,6.283);c.fill()}
 if(o.door!==false){c.fillStyle=VK.woodD;c.beginPath();c.roundRect(x-w*.13,y-h*.52,w*.26,h*.52,[w*.13,w*.13,0,0]);c.fill();c.fillStyle=VK.wood;c.beginPath();c.roundRect(x-w*.1,y-h*.48,w*.2,h*.48,[w*.1,w*.1,0,0]);c.fill();c.fillStyle='#ffd877';c.beginPath();c.arc(x+w*.06,y-h*.24,1.5,0,6.283);c.fill()}
 const win=(wx,wy,ww,wh)=>{if(_vkL)_vkL.push([wx+ww/2,wy+wh/2,13,o.light||VK.win,.42]);c.fillStyle=VK.woodD;c.fillRect(wx-1.5,wy-1.5,ww+3,wh+3);c.fillStyle=o.light||VK.win;c.fillRect(wx,wy,ww,wh);c.strokeStyle=VK.woodD;c.lineWidth=1;c.beginPath();c.moveTo(wx+ww/2,wy);c.lineTo(wx+ww/2,wy+wh);c.moveTo(wx,wy+wh/2);c.lineTo(wx+ww,wy+wh/2);c.stroke()};
 const rows=o.rows||1;for(let r=0;r<rows;r++){const wy=y-h*(rows===1?.72:r?.42:.86);if(o.win!==false){win(x-w*.38,wy,w*.15,h*(rows===1?.22:.15));win(x+w*.23,wy,w*.15,h*(rows===1?.22:.15))}}
 // janelinha na lateral
 if(o.win!==false){c.fillStyle=o.light||VK.win;vkPoly(c,[[R+d*.35,y-h*.62-d*.18],[R+d*.65,y-h*.62-d*.33],[R+d*.65,y-h*.4-d*.33],[R+d*.35,y-h*.4-d*.18]],o.light||VK.win,VK.woodD)}
}
/** torrezinha cilíndrica com chapéu cônico roxo (laboratório, santuário) */
function vkTurret(c,x,y,r,h,o){
 o=o||{};const g=c.createLinearGradient(x-r,0,x+r,0);g.addColorStop(0,o.wl||'#fbf5ea');g.addColorStop(.6,o.w||'#efe4cf');g.addColorStop(1,o.wd||'#d6c6a8');
 c.fillStyle=g;c.beginPath();c.moveTo(x-r,y);c.lineTo(x-r,y-h);c.lineTo(x+r,y-h);c.lineTo(x+r,y);c.ellipse(x,y,r,r*.35,0,0,Math.PI);c.fill();c.strokeStyle=VK.out;c.lineWidth=1.1;c.stroke();
 if(o.win!==false){if(_vkL)_vkL.push([x,y-h*.5,12,o.light||VK.win,.42]);c.fillStyle=VK.woodD;c.beginPath();c.roundRect(x-r*.35,y-h*.62,r*.7,h*.26,[r*.35,r*.35,0,0]);c.fill();c.fillStyle=o.light||VK.win;c.beginPath();c.roundRect(x-r*.25,y-h*.6,r*.5,h*.22,[r*.25,r*.25,0,0]);c.fill()}
 const ch=o.cone||r*2.4,cg=c.createLinearGradient(x-r,0,x+r,0);cg.addColorStop(0,VK.roofL);cg.addColorStop(.55,VK.roof);cg.addColorStop(1,VK.roofD);
 c.fillStyle=cg;c.beginPath();c.moveTo(x-r-4,y-h+2);c.quadraticCurveTo(x-r*.3,y-h-ch*.45,x+(o.bend||0),y-h-ch);c.quadraticCurveTo(x+r*.3,y-h-ch*.45,x+r+4,y-h+2);c.closePath();c.fill();c.strokeStyle=VK.out;c.stroke();
 c.fillStyle='#f2c14e';c.beginPath();c.arc(x+(o.bend||0),y-h-ch,2.6,0,6.283);c.fill();
}
function vkBanner(c,x,y,h){c.strokeStyle='#8a6a4a';c.lineWidth=2;c.beginPath();c.moveTo(x,y);c.lineTo(x,y-h);c.stroke();c.fillStyle='#f2c14e';c.beginPath();c.arc(x,y-h-2,2.5,0,6.283);c.fill();
 vkPoly(c,[[x+1,y-h+3],[x+13,y-h+3],[x+13,y-h+30],[x+7,y-h+25],[x+1,y-h+30]],VK.roof,VK.out);c.fillStyle='#f2c14e';c.beginPath();c.arc(x+7,y-h+13,2.6,0,6.283);c.fill()}
function vkSite(c,x,y){ // obra: pedras, tábuas e andaime em tons claros
 vkShadow(c,x,y+3,38,9);
 for(const[a,b,r,col]of[[-20,-3,7,'#cfc8c0'],[-8,-6,8,'#bfb7ae'],[8,-3,7,'#d8d2ca'],[18,-8,5,'#c4bcb3'],[-13,-12,5,'#d8d2ca']]){c.fillStyle=col;c.beginPath();c.arc(x+a,y+b,r,0,6.283);c.fill();c.strokeStyle=VK.out;c.lineWidth=.8;c.stroke()}
 c.strokeStyle=VK.wood;c.lineWidth=3;c.lineCap='round';c.beginPath();c.moveTo(x-24,y);c.lineTo(x-24,y-46);c.moveTo(x+24,y);c.lineTo(x+24,y-46);c.moveTo(x-28,y-42);c.lineTo(x+28,y-42);c.moveTo(x-28,y-22);c.lineTo(x+28,y-22);c.moveTo(x-24,y-22);c.lineTo(x+24,y-42);c.stroke();
 c.fillStyle='#d9a15a';c.fillRect(x+28,y-8,22,4);c.fillRect(x+30,y-12,22,4);
 c.strokeStyle='#8a6a4a';c.lineWidth=1.5;c.beginPath();c.moveTo(x-24,y-46);c.lineTo(x-24,y-60);c.stroke();vkPoly(c,[[x-24,y-60],[x-10,y-56],[x-24,y-52]],'#f2c14e');
}
// ---------- prédios ----------
function vkSanct(c,x,y,sl){
 const th=104+Math.min(sl,10)*4,tw=50;
 vkShadow(c,x+8,y+4,58,13);
 for(const s of[-1,1])vkTurret(c,x+s*44,y+2,13,50+Math.min(sl,10)*2,{cone:34});
 // corpo da torre (leve afunilamento) com faixas douradas
 const g=c.createLinearGradient(x-tw/2,0,x+tw/2,0);g.addColorStop(0,'#fdfbff');g.addColorStop(.55,'#ece8f4');g.addColorStop(1,'#cdc6dc');
 vkPoly(c,[[x-tw/2,y],[x+tw/2,y],[x+tw/2-7,y-th],[x-tw/2+7,y-th]],g,VK.out);
 for(const k of[.36,.72]){const yy=y-th*k,hw=tw/2-7*k;c.fillStyle='#e9b94a';c.fillRect(x-hw-1,yy-3,hw*2+2,6);c.fillStyle='rgba(255,255,255,.5)';c.fillRect(x-hw-1,yy-3,hw*2+2,1.5)}
 const arch=(yy,ww,hh,col)=>{c.fillStyle='#e9b94a';c.beginPath();c.roundRect(x-ww/2-2,yy-hh-2,ww+4,hh+2,[ww/2+2,ww/2+2,0,0]);c.fill();c.fillStyle=col;c.beginPath();c.roundRect(x-ww/2,yy-hh,ww,hh,[ww/2,ww/2,0,0]);c.fill()};
 arch(y,18,26,'#5fb0e8');vmGlow(c,x,y-12,22,'#8fe6ff',.45);arch(y-th*.48,10,16,'#3e4f92');arch(y-th*.84,9,13,'#3e4f92');
 // coroa: plataforma, pináculos roxos e o grande cristal (cresce com o nível)
 c.fillStyle='#e9e4f0';c.fillRect(x-tw/2+3,y-th-8,tw-6,9);c.strokeStyle=VK.out;c.strokeRect(x-tw/2+3,y-th-8,tw-6,9);
 for(const dx of[-17,-6,6,17]){const ch=14+Math.min(sl,10);vkPoly(c,[[dx+x-4,y-th-8],[dx+x,y-th-8-ch],[dx+x+4,y-th-8]],dx<0?VK.roofL:VK.roof,VK.out)}
 const cr=34+Math.min(sl,10)*2.4;vmGlow(c,x,y-th-14-cr*.5,50+sl*4,'#8fe6ff',.5);
 c.fillStyle='#e9b94a';vkPoly(c,[[x-11,y-th-8],[x+11,y-th-8],[x+7,y-th-15],[x-7,y-th-15]],'#e9b94a',VK.out);
 vmCrystal(c,x-11,y-th-14,cr*.45,'#8fdcff',-.35);vmCrystal(c,x+11,y-th-14,cr*.45,'#8fdcff',.35);vmCrystal(c,x,y-th-14,cr,'#a8ecff',0);
 for(const s of[-1,1])vkBanner(c,x+s*72,y+18,62);
}
function vkFountain(c,x,y){
 vkShadow(c,x,y+4,38,9);
 c.fillStyle='#d9d1c3';c.beginPath();c.ellipse(x,y,36,14,0,0,6.283);c.fill();c.strokeStyle=VK.out;c.lineWidth=1;c.stroke();
 c.fillStyle='#ebe5da';c.beginPath();c.ellipse(x,y-3,36,14,0,0,6.283);c.fill();c.stroke();
 const w=c.createLinearGradient(0,y-14,0,y+8);w.addColorStop(0,'#bfeeff');w.addColorStop(1,'#6cc7ef');c.fillStyle=w;c.beginPath();c.ellipse(x,y-4,30,10.5,0,0,6.283);c.fill();
 c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=1.2;c.beginPath();c.ellipse(x,y-4,18,5.5,0,0,6.283);c.stroke();
 c.fillStyle='#e2dbcf';c.fillRect(x-4,y-18,8,13);vmGlow(c,x,y-26,22,'#8fe6ff',.55);vmCrystal(c,x,y-16,20,'#a8ecff',0);
 c.strokeStyle='rgba(255,255,255,.85)';c.lineWidth=1.2;for(const s of[-1,1]){c.beginPath();c.moveTo(x,y-22);c.quadraticCurveTo(x+s*14,y-32,x+s*20,y-6);c.stroke()}
}
function vkMine(c,x,y,lv){
 // montanha rochosa (sempre: faz parte da paisagem)
 const mg=c.createLinearGradient(x-90,y-110,x+90,y);mg.addColorStop(0,'#e6e0d9');mg.addColorStop(1,'#a69d95');
 vkPoly(c,[[x-98,y+4],[x-84,y-44],[x-58,y-82],[x-36,y-66],[x-12,y-108],[x+18,y-84],[x+46,y-98],[x+74,y-50],[x+98,y+4]],mg,VK.out);
 c.fillStyle='rgba(255,255,255,.35)';for(const p of[[[x-58,y-82],[x-48,y-48],[x-70,y-30]],[[x-12,y-108],[x-2,y-62],[x-26,y-58]],[[x+46,y-98],[x+54,y-58],[x+36,y-62]]])vkPoly(c,p,'rgba(255,255,255,.35)');
 c.fillStyle='rgba(80,70,80,.12)';for(const p of[[[x+18,y-84],[x+36,y-40],[x+10,y-30]],[[x+74,y-50],[x+92,y],[x+60,y-6]]])vkPoly(c,p,'rgba(80,70,80,.14)');
 for(const[a,b,s]of[[-86,-4,.9],[-70,6,1],[84,0,.95],[66,10,.85]])vkPine(c,x+a,y+b,s);
 if(!lv){vkSite(c,x+4,y+16);return}
 // entrada com moldura de madeira, trilhos, carrinho e cristais dourados
 c.fillStyle='#3d3150';c.beginPath();c.moveTo(x-18,y+6);c.lineTo(x-18,y-22);c.quadraticCurveTo(x,y-44,x+18,y-22);c.lineTo(x+18,y+6);c.fill();
 vmGlow(c,x,y-12,26,'#ffd877',.4);
 c.strokeStyle=VK.wood;c.lineWidth=5;c.lineCap='butt';c.beginPath();c.moveTo(x-20,y+6);c.lineTo(x-20,y-28);c.moveTo(x+20,y+6);c.lineTo(x+20,y-28);c.moveTo(x-26,y-28);c.lineTo(x+26,y-28);c.stroke();
 c.strokeStyle='#8a7e78';c.lineWidth=1.8;c.beginPath();c.moveTo(x-6,y+6);c.lineTo(x+30,y+36);c.moveTo(x+6,y+6);c.lineTo(x+42,y+32);c.stroke();
 c.strokeStyle=VK.wood;c.lineWidth=2;for(let i=1;i<5;i++){const k=i/5;c.beginPath();c.moveTo(x-6+36*k-2,y+6+30*k+1);c.lineTo(x+6+36*k+2,y+6+26*k-1);c.stroke()}
 const cx=x+44,cy=y+30;vkShadow(c,cx,cy+4,16,4);vkPoly(c,[[cx-14,cy-12],[cx+14,cy-12],[cx+10,cy],[cx-10,cy]],'#8f8a96',VK.out);c.fillStyle='#4a4450';for(const s of[-1,1]){c.beginPath();c.arc(cx+s*7,cy+1,3,0,6.283);c.fill()}
 for(const[a,h,l]of[[-7,10,-.3],[1,12,0],[8,9,.3]]){vmCrystal(c,cx+a,cy-11,h,'#ffd24a',l)}
 const n=2+Math.min(6,lv);for(let i=0;i<n;i++){const k=i/(n-1||1),gx=x-46+k*24+(i%2)*6,gy=y-6+(i%3)*6;vmGlow(c,gx,gy-8,14,'#ffd24a',.4);vmCrystal(c,gx,gy,10+(i*5)%8+Math.min(lv,6),'#ffd24a',(k-.5)*.6)}
}
function vkLab(c,x,y,lv){
 if(!lv)return vkSite(c,x,y);
 vkHouse(c,x+6,y,{w:62,h:40,d:24,wall:'#f6ead2'});
 vkTurret(c,x-30,y+2,14,58,{cone:46,bend:-6});
 c.fillStyle='#b9aea4';c.fillRect(x+22,y-80,10,22);c.fillStyle='#d8cfc6';c.fillRect(x+20,y-82,14,5);
 for(let i=0;i<3;i++){c.fillStyle=`rgba(150,235,170,${(.55-i*.13).toFixed(2)})`;c.beginPath();c.arc(x+27+i*5,y-90-i*11,6+i*2.4,0,6.283);c.fill()}
 // bola de cristal no suporte
 const bx=x+50,by=y+8;c.strokeStyle=VK.woodD;c.lineWidth=2.4;c.beginPath();c.moveTo(bx-8,by);c.lineTo(bx,by-12);c.lineTo(bx+8,by);c.moveTo(bx,by-12);c.lineTo(bx,by);c.stroke();
 vmGlow(c,bx,by-20,20,'#e3a8ff',.55);const bg=c.createRadialGradient(bx-3,by-23,1,bx,by-20,9);bg.addColorStop(0,'#ffffff');bg.addColorStop(.4,'#e6c6ff');bg.addColorStop(1,'#9a6ae0');c.fillStyle=bg;c.beginPath();c.arc(bx,by-20,9,0,6.283);c.fill();
 if(lv>=4){c.fillStyle='#3a3448';c.beginPath();c.ellipse(x-52,y+10,9,6,0,0,6.283);c.fill();vmGlow(c,x-52,y+4,12,'#8dffa8',.6)} // caldeirão a partir do nível 4
}
function vkForge(c,x,y,lv){
 if(!lv)return vkSite(c,x,y);
 c.fillStyle='#c8c3cd';c.fillRect(x+12,y-96,18,54);c.strokeStyle=VK.out;c.strokeRect(x+12,y-96,18,54);c.fillStyle='#9e98a6';c.fillRect(x+9,y-100,24,7);
 for(let i=0;i<3;i++){c.fillStyle=`rgba(190,185,200,${(.6-i*.15).toFixed(2)})`;c.beginPath();c.arc(x+21+i*6,y-108-i*12,7+i*3,0,6.283);c.fill()}
 vkHouse(c,x,y,{w:76,h:44,d:30,wall:'#c2956a',side:'#9c714a',gable:'#cfa47a',planks:true,timber:true,beam:'#6e442a',roof:'#5a4a9e',roofL:'#7f6fc4',roofD:'#3e3180',door:false,light:'#ffb35a'});
 // fornalha acesa no lugar da porta
 c.fillStyle='#3a2f3a';c.beginPath();c.roundRect(x-15,y-26,30,26,[15,15,0,0]);c.fill();
 const f=c.createRadialGradient(x,y-6,2,x,y-8,18);f.addColorStop(0,'#fff2b0');f.addColorStop(.45,'#ffab3a');f.addColorStop(1,'rgba(255,90,40,0)');c.fillStyle=f;c.beginPath();c.roundRect(x-12,y-23,24,23,[12,12,0,0]);c.fill();
 vmGlow(c,x,y-6,34+Math.min(lv,9)*2,'#ff9a3a',.4);
 // bigorna num toco + martelo encostado
 c.fillStyle='#8a5a36';c.fillRect(x+50,y-2,14,8);
 vkPoly(c,[[x+46,y-2],[x+68,y-2],[x+64,y-7],[x+72,y-12],[x+44,y-12],[x+50,y-7]],'#55505e',VK.out);c.fillStyle='rgba(255,255,255,.35)';c.fillRect(x+46,y-12,22,1.6);
 c.strokeStyle='#8a5a36';c.lineWidth=2.4;c.beginPath();c.moveTo(x+76,y+6);c.lineTo(x+82,y-14);c.stroke();c.fillStyle='#6f6a78';c.fillRect(x+77,y-19,10,6);
}
/** cavalinho estilizado (estábulo) */
function vkHorse(c,x,y,s,col,flip){
 c.save();c.translate(x,y);c.scale(flip?-s:s,s);
 vkShadow(c,0,1,13,3);
 c.strokeStyle=shade(col,-.35);c.lineWidth=2.2;c.lineCap='round';for(const lx of[-7,-3,4,8]){c.beginPath();c.moveTo(lx,-6);c.lineTo(lx,0);c.stroke()}
 c.fillStyle=col;c.beginPath();c.ellipse(0,-9,11,5.5,0,0,6.283);c.fill();
 c.beginPath();c.moveTo(6,-12);c.lineTo(11,-22);c.lineTo(15,-21);c.lineTo(12,-11);c.closePath();c.fill();
 c.beginPath();c.ellipse(15.5,-21,5,2.8,.35,0,6.283);c.fill();
 c.fillStyle=shade(col,-.45);c.beginPath();c.moveTo(9,-20);c.quadraticCurveTo(10,-14,7,-11);c.lineTo(8,-19);c.fill(); // crina
 c.beginPath();c.moveTo(-11,-10);c.quadraticCurveTo(-17,-7,-15,0);c.lineTo(-13,-1);c.quadraticCurveTo(-14,-6,-10,-8);c.fill(); // rabo
 c.fillStyle='#2a1d14';c.beginPath();c.arc(15.6,-22.2,.9,0,6.283);c.fill();
 c.restore();
}
function vkTavern(c,x,y,lv){
 if(!lv)return vkSite(c,x,y);
 vkHouse(c,x,y,{w:80,h:54,d:30,timber:true,planks:true,rows:2,wall:'#c99464',side:'#a8764c',gable:'#d4a274',beam:'#6e442a',roof:'#6a4fb8',roofL:'#9179dc',roofD:'#4a3796'});
 // placa da caneca
 c.strokeStyle=VK.woodD;c.lineWidth=2.5;c.beginPath();c.moveTo(x+40+30*.5,y-44);c.lineTo(x+40+30*.5+18,y-50);c.stroke();
 const sx=x+40+30*.5+14,sy=y-44;c.strokeStyle='#5a4030';c.lineWidth=1;c.beginPath();c.moveTo(sx-5,sy-4);c.lineTo(sx-5,sy+2);c.moveTo(sx+5,sy-6);c.lineTo(sx+5,sy);c.stroke();
 vkPoly(c,[[sx-9,sy+2],[sx+9,sy-2],[sx+9,sy+16],[sx-9,sy+20]],'#7a4e2e',VK.out);c.fillStyle='#ffd24a';c.fillRect(sx-4,sy+5,7,9);c.fillStyle='#fff';c.fillRect(sx-4,sy+4,7,3);
 // barris e mesa
 for(const[a,b]of[[-58,12],[-48,4]]){c.fillStyle='#9a643c';c.beginPath();c.roundRect(x+a-7,y+b-12,14,14,4);c.fill();c.strokeStyle='#5a3a22';c.lineWidth=1.4;c.beginPath();c.moveTo(x+a-7,y+b-8);c.lineTo(x+a+7,y+b-8);c.moveTo(x+a-7,y+b-3);c.lineTo(x+a+7,y+b-3);c.stroke()}
 c.fillStyle=VK.wood;c.fillRect(x+52,y+6,22,4);c.fillRect(x+55,y+10,3,8);c.fillRect(x+68,y+10,3,8);
}
function vkMarket(c,x,y){
 vkShadow(c,x,y+4,56,11);
 // bandeirinhas
 c.strokeStyle='#8a6a4a';c.lineWidth=1.2;c.beginPath();c.moveTo(x-58,y-70);c.quadraticCurveTo(x,y-56,x+62,y-72);c.stroke();
 for(let i=0;i<9;i++){const k=(i+.5)/9,px=x-58+120*k,py=y-70+(-4*k*(1-k))*-14+ (k*-2);vkPoly(c,[[px-5,py],[px+5,py],[px,py+9]],['#7f62d2','#f2c14e','#f7a8c8','#8fd8f0'][i%4])}
 // postes, balcão e toldo listrado
 c.strokeStyle=VK.woodD;c.lineWidth=3;c.beginPath();c.moveTo(x-44,y);c.lineTo(x-44,y-52);c.moveTo(x+44,y);c.lineTo(x+44,y-52);c.stroke();
 vkPoly(c,[[x-48,y],[x+48,y],[x+48,y-22],[x-48,y-22]],'#b07a48',VK.out);c.fillStyle='#c99560';c.fillRect(x-50,y-25,100,5);
 for(let i=0;i<8;i++){const x0=x-52+i*13;vkPoly(c,[[x0,y-60],[x0+13,y-60],[x0+15,y-44],[x0+2,y-44]],i%2?'#fbf5ff':VK.roof)}
 c.strokeStyle=VK.out;c.lineWidth=1;c.beginPath();c.moveTo(x-52,y-60);c.lineTo(x+52,y-60);c.stroke();
 for(let i=0;i<8;i++){c.fillStyle=i%2?'#fbf5ff':VK.roof;c.beginPath();c.arc(x-45.5+i*13+.5,y-44,6.5,0,Math.PI);c.fill()}
 for(const[a,col]of[[-34,'#f7a8c8'],[-20,'#8fd8f0'],[-6,'#ffd24a'],[8,'#9be07a'],[22,'#c9a6ff'],[34,'#ffb35a']]){c.fillStyle=col;c.beginPath();c.arc(x+a,y-30,4.6,0,6.283);c.fill();c.fillStyle='rgba(255,255,255,.6)';c.beginPath();c.arc(x+a-1.4,y-31.5,1.4,0,6.283);c.fill()}
 for(const[a,b]of[[-60,8],[56,10]]){vkPoly(c,[[x+a-9,y+b],[x+a+9,y+b],[x+a+9,y+b-14],[x+a-9,y+b-14]],'#c99560',VK.out);c.strokeStyle='rgba(90,50,20,.35)';c.beginPath();c.moveTo(x+a-9,y+b-7);c.lineTo(x+a+9,y+b-7);c.stroke()}
}
function vkBarn(c,x,y,lv){
 // cerca
 c.strokeStyle='#b07a48';c.lineWidth=2.4;for(let i=0;i<6;i++){c.beginPath();c.moveTo(x-80+i*10,y+14-i*1.6);c.lineTo(x-80+i*10,y+2-i*1.6);c.stroke()}
 c.beginPath();c.moveTo(x-82,y+8);c.lineTo(x-30,y);c.moveTo(x+56,y+2);c.lineTo(x+92,y+12);c.stroke();for(let i=0;i<4;i++){c.beginPath();c.moveTo(x+58+i*11,y+8+i*3);c.lineTo(x+58+i*11,y-4+i*3);c.stroke()}
 vkHouse(c,x,y,{w:70,h:34,d:26,wall:'#c98a58',side:'#a86f44',planks:true,door:false,win:false,round:false,gable:'#d99a66'});
 // portão duplo e emblema do cavalo
 c.fillStyle=VK.woodD;c.fillRect(x-16,y-25,32,25);c.strokeStyle='#f3e2c0';c.lineWidth=1.8;c.strokeRect(x-14,y-23,13,23);c.strokeRect(x+1,y-23,13,23);
 c.beginPath();c.moveTo(x-14,y-23);c.lineTo(x-1,y);c.moveTo(x-1,y-23);c.lineTo(x-14,y);c.moveTo(x+1,y-23);c.lineTo(x+14,y);c.moveTo(x+14,y-23);c.lineTo(x+1,y);c.stroke();
 c.fillStyle='#fbf5ea';c.beginPath();c.arc(x,y-47,7.5,0,6.283);c.fill();c.strokeStyle=VK.out;c.lineWidth=1;c.stroke();
 c.fillStyle='#6e442a';c.beginPath();c.moveTo(x-3,y-41);c.lineTo(x-2,y-49);c.quadraticCurveTo(x+1,y-54,x+5,y-51);c.lineTo(x+4,y-47);c.lineTo(x+1,y-47);c.lineTo(x+2,y-41);c.closePath();c.fill();
 // cavalos no cercado
 vkHorse(c,x-60,y+10,.95,'#b8794a',false);vkHorse(c,x+76,y+16,.85,'#f1e6d6',true);
 // fardos de feno
 for(const[a,b]of[[56,10],[66,2]]){c.fillStyle='#f0c867';c.beginPath();c.roundRect(x+a-9,y+b-10,18,11,3);c.fill();c.strokeStyle='#c99a3e';c.lineWidth=1;c.beginPath();c.moveTo(x+a-4,y+b-10);c.lineTo(x+a-4,y+b+1);c.moveTo(x+a+4,y+b-10);c.lineTo(x+a+4,y+b+1);c.stroke()}
}
// ---------- a ilha ----------
function paintVillage(c,lv){
 const W=VMAP.W,H=VMAP.H,P=VMAP.pos,{CX,CY,RX,RY}=VI;c.lineCap='round';c.lineJoin='round';
 // nuvens de trás
 // nuvens atrás da ilha: espiando nas laterais e ao fundo (dentro do canvas: nuvem cortada na borda fica feia)
 for(const[x,y,s,a]of[[80,132,.95,.85],[648,104,.9,.85],[250,46,.55,.45],[500,40,.5,.4],[44,262,1,.9],[684,226,.85,.9]])vkCloud(c,x,y,s,a);
 // parte de baixo da ilha (rocha) e a cascata
 c.beginPath();for(let i=0;i<=60;i++){const a=i/60*Math.PI,r=vkR(a);c.lineTo(CX+Math.cos(a)*RX*r,CY+Math.sin(a)*RY*r+20)}
 c.bezierCurveTo(CX-RX*.72,CY+RY+30,CX-150,H+10,CX,H+18);c.bezierCurveTo(CX+150,H+10,CX+RX*.72,CY+RY+30,CX+RX*vkR(0),CY+20);c.closePath();
 let g=c.createLinearGradient(0,CY,0,H);g.addColorStop(0,'#d7c6ad');g.addColorStop(.55,'#b9a7a8');g.addColorStop(1,'#a698b6');c.fillStyle=g;c.fill();c.strokeStyle=VK.out;c.lineWidth=1;c.stroke();
 c.strokeStyle='rgba(110,80,90,.18)';c.lineWidth=1.4;for(let k=0;k<5;k++){c.beginPath();for(let i=0;i<=40;i++){const a=.15+i/40*(Math.PI-.3),r=vkR(a)*(.96-k*.07);const px=CX+Math.cos(a)*RX*r,py=CY+Math.sin(a)*RY*r+32+k*18;i?c.lineTo(px,py):c.moveTo(px,py)}c.stroke()}
 const fall=c.createLinearGradient(0,318,0,H);fall.addColorStop(0,'#bff0ff');fall.addColorStop(1,'rgba(160,220,250,.2)');c.fillStyle=fall;c.beginPath();c.moveTo(656,320);c.lineTo(680,314);c.lineTo(686,H);c.lineTo(660,H);c.closePath();c.fill();
 c.strokeStyle='rgba(255,255,255,.8)';c.lineWidth=1.4;for(const dx of[662,670,678]){c.beginPath();c.moveTo(dx,326);c.lineTo(dx+2,H-10);c.stroke()}
 // borda de terra e topo gramado
 vkIsland(c,14);c.fillStyle='#b48a5e';c.fill();vkIsland(c,7);c.fillStyle='#7fb04a';c.fill();
 vkIsland(c,0);g=c.createRadialGradient(CX-40,CY-40,30,CX,CY,RX*1.05);g.addColorStop(0,'#cde88a');g.addColorStop(.55,'#a9d469');g.addColorStop(1,'#8cc055');c.fillStyle=g;c.fill();
 c.strokeStyle='rgba(255,255,230,.55)';c.lineWidth=2;c.stroke();
 const rnd=vkRng(9);
 for(let i=0;i<26;i++){const x=CX+(rnd()-.5)*RX*1.7,y=CY+(rnd()-.5)*RY*1.7;if(!vkInside(x,y,.9))continue;c.fillStyle=rnd()<.5?'rgba(255,255,220,.16)':'rgba(70,120,40,.08)';c.beginPath();c.ellipse(x,y,20+rnd()*40,8+rnd()*14,0,0,6.283);c.fill()}
 // rio (vem do fundo, passa pela direita e cai da borda)
 const river=()=>{c.beginPath();c.moveTo(636,162);c.bezierCurveTo(602,206,660,232,642,262);c.bezierCurveTo(628,288,652,304,668,318)};
 river();c.strokeStyle='#6cbde0';c.lineWidth=28;c.stroke();river();c.strokeStyle='#9edcf4';c.lineWidth=21;c.stroke();
 river();c.strokeStyle='rgba(255,255,255,.75)';c.lineWidth=2;c.setLineDash([8,12]);c.stroke();c.setLineDash([]);
 // ponte de madeira
 c.save();c.translate(640,276);c.rotate(-.42);vkShadow(c,2,6,26,5);c.fillStyle='#c99560';c.fillRect(-26,-7,52,14);c.strokeStyle=VK.woodD;c.lineWidth=1;for(let i=-22;i<26;i+=6){c.beginPath();c.moveTo(i,-7);c.lineTo(i,7);c.stroke()}
 c.strokeStyle=VK.woodD;c.lineWidth=2;c.beginPath();c.moveTo(-26,-8);c.quadraticCurveTo(0,-14,26,-8);c.moveTo(-26,8);c.quadraticCurveTo(0,2,26,8);c.stroke();c.restore();
 // caminhos de terra batida até a praça
 const paths=['mine','lab','forge','tavern','market','barn'].map(id=>{const[x,y]=P[id],ex=id==='mine'?x+40:x,ey=y+(id==='mine'?34:8);return[CX,CY+12,(ex+CX)/2,(ey+CY)/2+18,ex,ey]});
 const strokePaths=(col,lw)=>{c.strokeStyle=col;c.lineWidth=lw;for(const p of paths){c.beginPath();c.moveTo(p[0],p[1]);c.quadraticCurveTo(p[2],p[3],p[4],p[5]);c.stroke()}};
 strokePaths('#dcc38c',24);strokePaths('#f2e2b6',18);
 // flores
 for(let i=0;i<190;i++){const x=CX+(rnd()-.5)*RX*1.9,y=CY+(rnd()-.5)*RY*1.9;if(!vkInside(x,y,.93))continue;c.fillStyle=['#fff6c8','#ffd24a','#f7b8d8','#ffffff','#cdb6ff'][i%5];c.beginPath();c.arc(x,y,1.4+rnd()*.8,0,6.283);c.fill()}
 // praça: piso de pedra, anel de cerca viva e calçamento central
 c.fillStyle='#e2d8c4';c.beginPath();c.ellipse(CX,CY+14,118,52,0,0,6.283);c.fill();c.fillStyle='#efe8da';c.beginPath();c.ellipse(CX,CY+11,114,49,0,0,6.283);c.fill();
 c.strokeStyle='rgba(150,130,100,.25)';c.lineWidth=1;for(let a=0;a<6.283;a+=.3){c.beginPath();c.moveTo(CX+Math.cos(a)*90,CY+11+Math.sin(a)*39);c.lineTo(CX+Math.cos(a)*114,CY+11+Math.sin(a)*49);c.stroke()}
 c.strokeStyle='#5f9e44';c.lineWidth=10;c.beginPath();c.ellipse(CX,CY+9,92,39,0,Math.PI*.62,Math.PI*2.38);c.stroke();c.strokeStyle='#7fbf5a';c.lineWidth=4;c.beginPath();c.ellipse(CX,CY+6,92,39,0,Math.PI*.62,Math.PI*2.38);c.stroke();
 // objetos com profundidade: árvores e prédios ordenados pela base (o de baixo cobre o de cima)
 const items=[],avoid=Object.values(P).map(([x,y])=>[x,y]).concat([[CX,CY+10],[CX,CY+32],[640,276]]);
 const pathHit=(x,y)=>paths.some(p=>{for(let k=0;k<=1;k+=.08){const u=1-k,px=u*u*p[0]+2*u*k*p[2]+k*k*p[4],py=u*u*p[1]+2*u*k*p[3]+k*k*p[5];if(Math.hypot(px-x,(py-y)*1.4)<20)return true}return false});
 const riverHit=(x,y)=>x>596&&y>150&&y<330&&Math.abs(x-(642+(y<262?(y-206)*.2:(y-262)*.45)))<30;
 const trnd=vkRng(31);
 for(let i=0;i<260&&items.length<62;i++){
  const a=trnd()*6.283,rr=.55+trnd()*.4,x=CX+Math.cos(a)*RX*rr*vkR(a),y=CY+Math.sin(a)*RY*rr*vkR(a);
  if(!vkInside(x,y,.9))continue;
  if(avoid.some(([ax,ay],j)=>Math.hypot(x-ax,(y-ay)*1.3)<(j===1?120:j===0?150:78)))continue;
  if(pathHit(x,y)||riverHit(x,y))continue;
  const s=.72+(y-80)/360*.5,pine=trnd()<.62;items.push({y,f:()=>pine?vkPine(c,x,y,s):vkBush(c,x,y,s*.95)});
 }
 items.push({y:P.sanct[1],f:()=>vkSanct(c,P.sanct[0],P.sanct[1],lv.sanct|0)});
 items.push({y:CY+32,f:()=>vkFountain(c,CX,CY+32)});
 items.push({y:P.mine[1],f:()=>vkMine(c,P.mine[0],P.mine[1],lv.mine|0)});
 items.push({y:P.lab[1],f:()=>vkLab(c,P.lab[0],P.lab[1],lv.lab|0)});
 items.push({y:P.forge[1],f:()=>vkForge(c,P.forge[0],P.forge[1],lv.forge|0)});
 items.push({y:P.tavern[1],f:()=>vkTavern(c,P.tavern[0],P.tavern[1],lv.tavern|0)});
 items.push({y:P.market[1],f:()=>vkMarket(c,P.market[0],P.market[1])});
 items.push({y:P.barn[1],f:()=>vkBarn(c,P.barn[0],P.barn[1])});
 items.sort((a,b)=>a.y-b.y).forEach(o=>o.f());
 // nuvens da frente: banco contínuo abraçando a base (cobre a rocha, não os prédios)
 vkCloudBank(c);
 // a base some suavemente no pergaminho (sem corte reto na borda do desenho)
 c.save();c.globalCompositeOperation='destination-out';const fade=c.createLinearGradient(0,H-44,0,H);fade.addColorStop(0,'rgba(0,0,0,0)');fade.addColorStop(1,'rgba(0,0,0,1)');c.fillStyle=fade;c.fillRect(0,H-44,W,44);
 const sideL=c.createLinearGradient(0,0,26,0);sideL.addColorStop(0,'rgba(0,0,0,1)');sideL.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=sideL;c.fillRect(0,0,26,H);
 const sideR=c.createLinearGradient(W-26,0,W,0);sideR.addColorStop(0,'rgba(0,0,0,0)');sideR.addColorStop(1,'rgba(0,0,0,1)');c.fillStyle=sideR;c.fillRect(W-26,0,26,H);c.restore();
}
// 🌆 crepúsculo (28/10): a ilha ganha o tom azul-noite do jogo — véu 'source-atop' só sobre o desenho (o fundo segue
//  transparente) — e as luzes registradas na pintura (janelas, cristais, fornalha, fonte, bola de cristal) são reacesas
//  por cima com 'lighter'; estrelas no céu em volta. Tudo assado no cache do mapa: custo zero por quadro.
function vkDusk(c,lights){
 const W=VMAP.W,H=VMAP.H;c.save();c.globalCompositeOperation='source-atop';
 let g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'rgba(18,22,72,.5)');g.addColorStop(.6,'rgba(24,20,70,.42)');g.addColorStop(1,'rgba(8,10,40,.58)');c.fillStyle=g;c.fillRect(0,0,W,H);
 g=c.createRadialGradient(VI.CX,VI.CY-70,20,VI.CX,VI.CY,VI.RX*1.1);g.addColorStop(0,'rgba(150,210,255,.14)');g.addColorStop(1,'rgba(150,210,255,0)');c.fillStyle=g;c.fillRect(0,0,W,H); // luz do cristal do santuário banhando o centro
 c.globalCompositeOperation='lighter';
 for(const[x,y,r,col,a]of lights){const k=Math.min(1,a*1.4),rr=r*1.5;g=c.createRadialGradient(x,y,0,x,y,rr);g.addColorStop(0,hexA(col,k));g.addColorStop(.35,hexA(col,k*.35));g.addColorStop(1,hexA(col,0));c.fillStyle=g;c.fillRect(x-rr,y-rr,rr*2,rr*2)}
 const R=vkRng(5);c.fillStyle='#fff';
 for(let i=0;i<70;i++){const x=R()*W,y=R()*130,a=.25+R()*.6,s=R()<.15?1.8:1;if(vkInside(x,y,1.08)||(x>290&&x<430))continue;c.globalAlpha=a;c.fillRect(x,y,s,s)}
 c.restore();
}
function vmLabelPos(id,top){const p=top?VMAP.pos[id]:VMAP.pin[id];return[(p[0]/VMAP.W*100).toFixed(2),(p[1]/VMAP.H*100).toFixed(2)]}

/** desenha o mapa no <canvas id="vMap"> do modal (cache por níveis + tamanho) */
function drawVillageMap(){
 const cv=$('vMap');if(!cv)return;
 const r=cv.getBoundingClientRect();if(!r.width)return;
 const d=Math.min(DeviceManager.isMobile?1.5:2,DeviceManager.dpr||1),pw=Math.round(r.width*d),ph=Math.round(r.width*VMAP.H/VMAP.W*d);
 const key=JSON.stringify(Village.data.lv)+'|'+pw;
 if(!VMAP.cache||VMAP.key!==key){
  const off=VMAP.cache&&VMAP.cache.width===pw&&VMAP.cache.height===ph?VMAP.cache:document.createElement('canvas');off.width=pw;off.height=ph;
  const x=off.getContext('2d');x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,pw,ph);x.setTransform(pw/VMAP.W,0,0,ph/VMAP.H,0,0);_vkL=[];paintVillage(x,Village.data.lv);vkDusk(x,_vkL);_vkL=null;VMAP.cache=off;VMAP.key=key; // 🌆 tom do jogo
 }
 if(cv.width!==pw||cv.height!==ph){cv.width=pw;cv.height=ph}
 const cx=cv.getContext('2d');cx.clearRect(0,0,pw,ph);cx.drawImage(VMAP.cache,0,0,pw,ph);
}
// ícones das placas: traço azul-marinho (mesma linguagem da referência; emojis coloridos brigavam com o mapa)
const VK_IC=(p,fill)=>`<svg class="pic" viewBox="0 0 24 24" aria-hidden="true" ${fill?'fill="currentColor" stroke="none"':'fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"'}>${p}</svg>`;
const VK_ICONS={
 sanct:VK_IC('<path d="M3 9.5h18M4 9.5 12 4l8 5.5M6 9.5V17M10 9.5V17M14 9.5V17M18 9.5V17M3.5 20h17M4.5 17.5h15"/>'),
 mine:VK_IC('<path d="M4.5 9C8 5.5 15 4.8 19.5 7.5"/><path d="M12.5 6.5 7 20"/>'),
 lab:VK_IC('<path d="M9.5 3.5h5M10.5 3.5v6L5.2 18.3A1.8 1.8 0 0 0 6.8 21h10.4a1.8 1.8 0 0 0 1.6-2.7L13.5 9.5v-6"/><path d="M7.6 15h8.8"/>'),
 forge:VK_IC('<path d="M3 7.5h12.5c.3 2.6 2.4 4 5.5 4-2.1 1.4-5 1.6-7 2.2v2.3h2.2v3.5H7.6V16h2.2v-2.3C6 13 3.2 10.9 3 7.5z"/>',1),
 tavern:VK_IC('<path d="M5.5 7h9.5v11.5a2 2 0 0 1-2 2H7.5a2 2 0 0 1-2-2z"/><path d="M15 10h2a2.5 2.5 0 0 1 0 5h-2M5.5 10.5H15M8.5 13.5v4M12 13.5v4"/><path d="M6 7c0-2 1.5-3 3-2.4C10 3.2 13 3.4 13.8 5c1.4-.2 1.9 1 1.2 2"/>'),
 market:VK_IC('<path d="M12 2.5l1.9 5.6 5.6 1.9-5.6 1.9L12 17.5l-1.9-5.6-5.6-1.9 5.6-1.9z"/><path d="M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>',1),
 barn:VK_IC('<path d="M7 21h11l-.6-4.6c2.3-1.4 3.3-3.6 2.4-6.8L17.4 5l-1.9 1.4L14 4.8c-3.6.9-6.4 4.1-6.7 8.4l2.6.7 2.6-2.4.6 2.1-5 3.5z"/>',1)
};
/** placas HTML sobre o mapa (nome + nível; clique leva ao card do prédio) */
function villagePins(){
 const V=Village,pin=(id,txt,act,cls)=>{const[l,tp]=vmLabelPos(id);return`<button class="vpin ${cls||''}" style="left:${l}%;top:${tp}%" onclick="${act}">${txt}</button>`};
 let h='';
 for(const B of VILLAGE.buildings){const lv=V.lv(B.id),who=Object.keys(V.data.workers).filter(k=>V.data.workers[k]===B.id).map(k=>(CHARS.find(c=>c.id===k)||{}).emoji||'').join('');
  const name=B.id==='sanct'?esc(V.data.name):t('village.b.'+B.id+'.short');
  h+=pin(B.id,`${B.id==='sanct'?'<span class="prow">':''}${VK_ICONS[B.id]||''}<span class="pn">${name}</span>${B.id==='sanct'?'</span>':' '}<b>${lv?t('ui.lvl')+' '+lv:'🔨'}</b>${who?` <i>${who}</i>`:''}`,`VillageUI.focus('${B.id}')`,(lv?'':'off')+(B.id==='sanct'?' main':''))}
 h+=pin('market',`${VK_ICONS.market}<span class="pn">${t('village.market')}</span>`,`openModal('collection')`,'shop');
 h+=pin('barn',`${VK_ICONS.barn}<span class="pn">${t('village.barn')}</span>`,`VillageUI.focus('tavern')`,'deco');
 if(V.lv('mine')&&V.pending()>=Math.max(20,V.cap()*.25)){const[l,tp]=vmLabelPos('mine',true);h+=`<button class="vbubble" style="left:calc(${l}% + 9%);top:${tp}%" onclick="VillageUI.collect(event)"><i></i>+${fmtN(V.pending())}</button>`}
 return h;
}
