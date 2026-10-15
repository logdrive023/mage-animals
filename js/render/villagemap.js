// Mage Animals — js/render/villagemap.js · 🗺️ Ilustração do Reino (Vila dos Magos), 100% desenhada em código.
// Cena noturna: céu estrelado, montanhas, rio com cristais, praça circular com a Torre de Cristal (Santuário),
// Mina (cristais + portal), Laboratório, Forja, Taverna, Mercado "MÍSTICO" e Estábulo com ovelhas.
// Cada prédio muda com o nível (obra → prédio → mais cristais/brilho). Desempenho: a cena é desenhada UMA vez
// num canvas em cache (chave = níveis + tamanho) e só redesenhada quando algo muda — zero custo por quadro.
// Os nomes/níveis são placas HTML por cima (texto nítido no celular, clicáveis).
'use strict';

const VMAP={W:640,H:380,
 // posição (base, no chão) de cada prédio no espaço lógico 640×380
 pos:{sanct:[320,205],mine:[112,138],lab:[92,262],forge:[505,128],tavern:[205,316],market:[528,268],barn:[405,318]},
 cache:null,key:''};

function vmStars(c,n,seed){let s=seed;const r=()=>(s=(s*16807)%2147483647)/2147483647;c.fillStyle='#fff';for(let i=0;i<n;i++){c.globalAlpha=.25+r()*.7;const x=r()*VMAP.W,y=r()*70,z=r()*1.4+.3;c.fillRect(x,y,z,z)}c.globalAlpha=1}
function vmGlow(c,x,y,r,col,a){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,hexA(col,a));g.addColorStop(1,hexA(col,0));c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,6.283);c.fill()}
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
 c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.ellipse(x+d*.4,y+3,w*.75,8,0,0,6.283);c.fill(); // sombra
 c.fillStyle=shade(wall,-.28);c.beginPath();c.moveTo(x+w/2,y);c.lineTo(x+w/2+d,y-dy);c.lineTo(x+w/2+d,y-dy-h);c.lineTo(x+w/2,y-h);c.fill(); // lateral
 c.fillStyle=wall;c.fillRect(x-w/2,y-h,w,h); // frente
 if(o.stone){c.strokeStyle='rgba(0,0,0,.18)';c.lineWidth=1;for(let yy=y-h+6;yy<y;yy+=7){c.beginPath();c.moveTo(x-w/2,yy);c.lineTo(x+w/2,yy);c.stroke()}}
 else{c.strokeStyle='rgba(60,30,10,.45)';c.lineWidth=2;c.strokeRect(x-w/2,y-h,w,h);c.beginPath();c.moveTo(x-w/2,y-h*.5);c.lineTo(x+w/2,y-h*.5);c.stroke()}
 // telhado
 c.fillStyle=shade(roof,-.25);c.beginPath();c.moveTo(x,y-h-rh);c.lineTo(x+d,y-h-rh-dy);c.lineTo(x+w/2+d+4,y-h-dy+2);c.lineTo(x+w/2+4,y-h+2);c.closePath();c.fill();
 c.fillStyle=roof;c.beginPath();c.moveTo(x-w/2-5,y-h+2);c.lineTo(x,y-h-rh);c.lineTo(x+w/2+5,y-h+2);c.closePath();c.fill();
 c.strokeStyle=shade(roof,-.45);c.lineWidth=1.5;for(let i=1;i<4;i++){const k=i/4;c.beginPath();c.moveTo(x-(w/2+5)*(1-k),y-h+2-(rh)*k*.98);c.lineTo(x+(w/2+5)*(1-k),y-h+2-(rh)*k*.98);c.stroke()}
 // porta e janelas iluminadas
 c.fillStyle='#3a2414';c.beginPath();c.roundRect(x-w*.12,y-h*.55,w*.24,h*.55,[w*.12,w*.12,0,0]);c.fill();
 vmGlow(c,x-w*.32,y-h*.62,10,o.light||'#ffd27a',.45);vmGlow(c,x+w*.32,y-h*.62,10,o.light||'#ffd27a',.45);
 c.fillStyle=o.light||'#ffd27a';c.fillRect(x-w*.38,y-h*.72,w*.13,h*.2);c.fillRect(x+w*.25,y-h*.72,w*.13,h*.2);
}
/** prédio ainda não construído: canteiro de obras (pedras + andaime) */
function vmSite(c,x,y,s){
 c.fillStyle='rgba(0,0,0,.3)';c.beginPath();c.ellipse(x,y+2,34*s,8*s,0,0,6.283);c.fill();
 c.fillStyle='#7a7f96';for(const[a,b,r]of[[-18,-4,7],[-6,-6,8],[8,-4,7],[16,-9,5],[-12,-12,5]]){c.beginPath();c.arc(x+a*s,y+b*s,r*s,0,6.283);c.fill()}
 c.strokeStyle='#a87a4a';c.lineWidth=3*s;c.beginPath();c.moveTo(x-22*s,y);c.lineTo(x-22*s,y-44*s);c.moveTo(x+22*s,y);c.lineTo(x+22*s,y-44*s);c.moveTo(x-26*s,y-40*s);c.lineTo(x+26*s,y-40*s);c.moveTo(x-22*s,y-20*s);c.lineTo(x+22*s,y-36*s);c.stroke();
}
function vmLabelPos(id){const p=VMAP.pos[id];return[(p[0]/VMAP.W*100).toFixed(2),(p[1]/VMAP.H*100).toFixed(2)]}

function paintVillage(c,lv){
 const W=VMAP.W,H=VMAP.H;
 // céu e montanhas
 let g=c.createLinearGradient(0,0,0,120);g.addColorStop(0,'#0b0e2a');g.addColorStop(1,'#26205a');c.fillStyle=g;c.fillRect(0,0,W,H);vmStars(c,70,7);
 vmGlow(c,480,30,90,'#9a6aff',.22);vmGlow(c,140,20,70,'#5ad0ff',.16);
 c.fillStyle='#2a2a5e';c.beginPath();c.moveTo(0,110);[[60,60],[120,92],[190,50],[260,90],[330,58],[400,94],[470,46],[540,86],[600,62],[640,90],[640,130],[0,130]].forEach(p=>c.lineTo(p[0],p[1]));c.fill();
 c.fillStyle='#1c2048';c.beginPath();c.moveTo(0,118);[[80,86],[150,112],[230,80],[310,110],[380,84],[460,112],[540,80],[640,108],[640,140],[0,140]].forEach(p=>c.lineTo(p[0],p[1]));c.fill();
 // chão
 g=c.createLinearGradient(0,100,0,H);g.addColorStop(0,'#1f5a42');g.addColorStop(1,'#16402f');c.fillStyle=g;c.beginPath();c.roundRect(-10,104,W+20,H,28);c.fill();
 c.fillStyle='rgba(120,220,140,.08)';for(const[x,y,r]of[[90,190,60],[250,280,70],[470,200,60],[560,340,50],[60,340,50],[330,120,60]]){c.beginPath();c.ellipse(x,y,r,r*.45,0,0,6.283);c.fill()}
 // rio
 c.lineCap='round';c.lineJoin='round';
 const river=()=>{c.beginPath();c.moveTo(600,104);c.bezierCurveTo(560,170,640,210,580,250);c.bezierCurveTo(530,290,560,330,620,380)};
 river();c.strokeStyle='#123a6a';c.lineWidth=34;c.stroke();river();c.strokeStyle='#2a8fd8';c.lineWidth=26;c.stroke();river();c.strokeStyle='rgba(160,230,255,.55)';c.lineWidth=3;c.setLineDash([10,14]);c.stroke();c.setLineDash([]);
 for(const[x,y,h]of[[566,150,12],[612,214,10],[556,262,13],[590,320,11],[610,360,9]]){vmGlow(c,x,y-h*.5,16,'#5ad0ff',.4);vmCrystal(c,x,y,h,'#7ae8ff',.2)}
 // caminhos de pedra até a praça
 c.strokeStyle='#8a7a5a';c.lineWidth=16;
 for(const id of['mine','lab','forge','tavern','market','barn']){const[x,y]=VMAP.pos[id];c.beginPath();c.moveTo(320,212);c.quadraticCurveTo((x+320)/2,(y+212)/2+20,x,y+6);c.stroke()}
 c.strokeStyle='#b8a47a';c.lineWidth=11;
 for(const id of['mine','lab','forge','tavern','market','barn']){const[x,y]=VMAP.pos[id];c.beginPath();c.moveTo(320,212);c.quadraticCurveTo((x+320)/2,(y+212)/2+20,x,y+6);c.stroke()}
 // praça circular com degraus
 const sl=lv.sanct|0;
 c.fillStyle='#5a5e78';c.beginPath();c.ellipse(320,214,128,60,0,0,6.283);c.fill();
 c.fillStyle='#7a7f9a';c.beginPath();c.ellipse(320,210,124,56,0,0,6.283);c.fill();
 c.strokeStyle='#5a5e78';c.lineWidth=2;for(let a=0;a<6.283;a+=.26){c.beginPath();c.moveTo(320+Math.cos(a)*92,210+Math.sin(a)*41);c.lineTo(320+Math.cos(a)*124,210+Math.sin(a)*56);c.stroke()}
 c.fillStyle='#2a6a4a';c.beginPath();c.ellipse(320,210,90,40,0,0,6.283);c.fill();
 c.fillStyle='#8a8fa8';c.beginPath();c.ellipse(320,206,56,24,0,0,6.283);c.fill();c.fillStyle='#a4a9c2';c.beginPath();c.ellipse(320,202,46,19,0,0,6.283);c.fill();
 // ---------- Santuário: torre de cristal (cresce com o nível) ----------
 const th=70+sl*5,tx=320,ty=200;
 vmGlow(c,tx,ty-th-10,60+sl*5,'#5ad0ff',.35);
 g=c.createLinearGradient(tx-20,0,tx+20,0);g.addColorStop(0,'#5a5e88');g.addColorStop(.5,'#b8bcd8');g.addColorStop(1,'#4a4e78');c.fillStyle=g;
 c.beginPath();c.moveTo(tx-22,ty);c.lineTo(tx-14,ty-th);c.lineTo(tx+14,ty-th);c.lineTo(tx+22,ty);c.closePath();c.fill();
 c.fillStyle='#e8b86a';for(const k of[.3,.62]){c.fillRect(tx-20+k*6,ty-th*k-3,40-k*12,4)}
 c.fillStyle='#3a3e68';c.fillRect(tx-16,ty-th-8,32,10);
 const nC=2+Math.min(5,Math.ceil(sl/2));for(let i=0;i<nC;i++){const a=(i/(nC-1||1)-.5)*1.1;vmCrystal(c,tx+a*22,ty-th-6,22+sl*1.6-Math.abs(a)*10,'#6ad8ff',a*.5)}
 vmCrystal(c,tx,ty-th-4,30+sl*2.4,'#9af0ff',0);
 for(let i=0;i<4;i++){const a=i*1.57+.4;vmCrystal(c,tx+Math.cos(a)*44,ty+Math.sin(a)*14,10+sl,'#5ad0ff',a)} // cristais na base
 // ---------- Mina ----------
 const ml=lv.mine|0;let[x,y]=VMAP.pos.mine;
 if(!ml)vmSite(c,x,y,1);else{
  c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.ellipse(x,y+4,62,12,0,0,6.283);c.fill();
  c.fillStyle='#3a3648';c.beginPath();c.moveTo(x-60,y);c.lineTo(x-44,y-46);c.lineTo(x-14,y-66);c.lineTo(x+20,y-58);c.lineTo(x+52,y-30);c.lineTo(x+62,y);c.closePath();c.fill();
  c.fillStyle='#4e4a62';c.beginPath();c.moveTo(x-44,y-46);c.lineTo(x-14,y-66);c.lineTo(x+20,y-58);c.lineTo(x+4,y-40);c.lineTo(x-26,y-36);c.closePath();c.fill();
  c.fillStyle='#120e1e';c.beginPath();c.moveTo(x-16,y);c.lineTo(x-16,y-22);c.quadraticCurveTo(x,y-38,x+16,y-22);c.lineTo(x+16,y);c.fill();
  vmGlow(c,x,y-14,26,'#5ad0ff',.65);
  const nm=3+Math.min(7,ml);for(let i=0;i<nm;i++){const a=i/nm,cx=x-50+a*104,cy=y-8-Math.sin(a*3.14)*40;vmGlow(c,cx,cy-8,16,'#ffd24a',.35);vmCrystal(c,cx,cy,10+((i*7)%9)+ml,'#ffd24a',(a-.5)*.8)}
 }
 // ---------- Laboratório ----------
 const ll=lv.lab|0;[x,y]=VMAP.pos.lab;
 if(!ll)vmSite(c,x,y,1);else{vmHouse(c,x,y,58,40,{wall:'#b89a76',roof:'#6a3ab8',light:'#9affb0'});
  c.fillStyle='#5a4a6a';c.fillRect(x+16,y-80,9,22);for(let i=0;i<3;i++)vmGlow(c,x+20+i*4,y-88-i*10,7+i*2,'#7aff9a',.5); // chaminé com fumaça verde
 }
 // ---------- Forja ----------
 const fl=lv.forge|0;[x,y]=VMAP.pos.forge;
 if(!fl)vmSite(c,x,y,1);else{vmHouse(c,x,y,62,42,{wall:'#8a8a9a',roof:'#3a4a6a',light:'#ff9a3a',stone:true});
  c.fillStyle='#4a4a5a';c.fillRect(x-24,y-86,12,26);vmGlow(c,x-18,y-92,14,'#ff8a3a',.55);
  vmGlow(c,x,y-12,30,'#ff7a2a',.45+fl*.03);c.fillStyle='#2a2a34';c.fillRect(x+34,y-10,16,6);c.fillRect(x+38,y-4,8,6); // bigorna
 }
 // ---------- Taverna ----------
 const tl=lv.tavern|0;[x,y]=VMAP.pos.tavern;
 if(!tl)vmSite(c,x,y,1);else{vmHouse(c,x,y,66,42,{wall:'#c9a87a',roof:'#2a5a9a'});
  c.strokeStyle='#5a3a1a';c.lineWidth=2;c.beginPath();c.moveTo(x-40,y-34);c.lineTo(x-40,y-12);c.moveTo(x-46,y-34);c.lineTo(x-34,y-34);c.stroke();
  c.fillStyle='#e8b86a';c.fillRect(x-45,y-30,10,10);c.fillStyle='#fff';c.fillRect(x-45,y-30,10,3); // placa da caneca
 }
 // ---------- Mercado "MÍSTICO" (atalho para a Coleção) ----------
 [x,y]=VMAP.pos.market;
 c.fillStyle='rgba(0,0,0,.3)';c.beginPath();c.ellipse(x,y+3,50,10,0,0,6.283);c.fill();
 c.fillStyle='#6a4a2a';c.fillRect(x-40,y-22,80,22);c.fillStyle='#8a6a3a';c.fillRect(x-40,y-24,80,4);
 c.strokeStyle='#5a3a1a';c.lineWidth=3;c.beginPath();c.moveTo(x-40,y-22);c.lineTo(x-40,y-58);c.moveTo(x+40,y-22);c.lineTo(x+40,y-58);c.stroke();
 for(let i=0;i<8;i++){c.fillStyle=i%2?'#f0e6ff':'#7a3ab8';c.beginPath();c.moveTo(x-46+i*11.5,y-58);c.lineTo(x-46+(i+1)*11.5,y-58);c.lineTo(x-44+(i+1)*11.5,y-44);c.lineTo(x-44+i*11.5,y-44);c.fill()}
 c.fillStyle='#3a1a6a';c.fillRect(x-30,y-76,60,15);c.fillStyle='#ffd98a';c.font='900 10px Cinzel, serif';c.textAlign='center';c.fillText('MÍSTICO',x,y-65);c.textAlign='left';
 for(const[a,col]of[[-24,'#ff7aa8'],[-6,'#7ae8ff'],[12,'#ffd24a'],[26,'#9aff7a']]){c.fillStyle=col;c.beginPath();c.arc(x+a,y-28,4,0,6.283);c.fill()}
 // ---------- Estábulo com ovelhas ----------
 [x,y]=VMAP.pos.barn;
 c.fillStyle='rgba(0,0,0,.3)';c.beginPath();c.ellipse(x,y+3,58,11,0,0,6.283);c.fill();
 c.fillStyle='#5a3a1e';c.fillRect(x-44,y-34,88,34);c.fillStyle='#2a1a0e';c.fillRect(x-34,y-26,68,26);
 c.fillStyle='#8a4a2a';c.beginPath();c.moveTo(x-52,y-32);c.lineTo(x,y-58);c.lineTo(x+52,y-32);c.closePath();c.fill();
 c.strokeStyle='#a87a4a';c.lineWidth=2.5;for(let i=0;i<7;i++){c.beginPath();c.moveTo(x-56+i*18,y+12);c.lineTo(x-56+i*18,y-2);c.stroke()}c.beginPath();c.moveTo(x-58,y+4);c.lineTo(x+56,y+4);c.stroke();
 for(const[a,b]of[[-16,-6],[8,-4],[28,8]]){c.fillStyle='#f4f0e8';c.beginPath();c.ellipse(x+a,y+b,9,6,0,0,6.283);c.fill();c.fillStyle='#2a2430';c.beginPath();c.arc(x+a+8,y+b-2,3.4,0,6.283);c.fill()}
 // árvores das bordas + cristais flutuando
 for(const[tx2,ty2,s]of[[22,170,1],[40,120,.8],[200,128,.8],[250,112,.7],[400,118,.7],[440,138,.8],[600,180,.8],[30,300,1],[290,360,.9],[470,370,.9],[150,210,.7],[630,300,.8]])vmTree(c,tx2,ty2,s);
 for(const[fx,fy,h,col]of[[180,170,9,'#c9a6ff'],[440,232,8,'#7ae8ff'],[250,240,7,'#ffd24a'],[60,220,8,'#c9a6ff'],[380,150,7,'#7ae8ff']]){vmGlow(c,fx,fy-5,14,col,.45);vmCrystal(c,fx,fy,h,col,.3)}
}
/** desenha o mapa no <canvas id="vMap"> do modal (cache por níveis + tamanho) */
function drawVillageMap(){
 const cv=$('vMap');if(!cv)return;
 const r=cv.getBoundingClientRect();if(!r.width)return;
 const d=Math.min(DeviceManager.isMobile?1.25:2,DeviceManager.dpr||1),pw=Math.round(r.width*d),ph=Math.round(r.width*VMAP.H/VMAP.W*d);
 const key=JSON.stringify(Village.data.lv)+'|'+pw;
 if(!VMAP.cache||VMAP.key!==key){
  const off=VMAP.cache&&VMAP.cache.width===pw&&VMAP.cache.height===ph?VMAP.cache:document.createElement('canvas');off.width=pw;off.height=ph;
  const x=off.getContext('2d');x.setTransform(pw/VMAP.W,0,0,ph/VMAP.H,0,0);paintVillage(x,Village.data.lv);VMAP.cache=off;VMAP.key=key;
 }
 if(cv.width!==pw||cv.height!==ph){cv.width=pw;cv.height=ph}
 cv.getContext('2d').drawImage(VMAP.cache,0,0,pw,ph);
}
/** placas HTML sobre o mapa (nome + nível; clique leva ao card do prédio) */
function villagePins(){
 const V=Village,pin=(id,txt,act,cls)=>{const[l,tp]=vmLabelPos(id);return`<button class="vpin ${cls||''}" style="left:${l}%;top:${tp}%" onclick="${act}">${txt}</button>`};
 let h='';
 for(const B of VILLAGE.buildings){const lv=V.lv(B.id),who=Object.keys(V.data.workers).filter(k=>V.data.workers[k]===B.id).map(k=>(CHARS.find(c=>c.id===k)||{}).emoji||'').join('');
  h+=pin(B.id,`${B.ic} <span class="pn">${t('village.b.'+B.id+'.short')} </span><b><span class="pn">${lv?t('ui.lvl')+' ':''}</span>${lv||'🔨'}</b>${who?` <i>${who}</i>`:''}`,`VillageUI.focus('${B.id}')`,lv?'':'off')}
 h+=pin('market',`🛍️<span class="pn"> ${t('village.market')}</span>`,`openModal('collection')`,'shop');
 h+=pin('barn',`🐑<span class="pn"> ${t('village.barn')}</span>`,`VillageUI.focus('tavern')`,'deco');
 if(V.lv('mine')&&V.pending()>=Math.max(20,V.cap()*.25)){const[l,tp]=vmLabelPos('mine');h+=`<button class="vbubble" style="left:${l}%;top:${tp}%" onclick="VillageUI.collect(event)">💎 +${fmtN(V.pending())}</button>`}
 return h;
}
