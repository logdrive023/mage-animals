// Mage Animals — js/render/atmos.js · 🌌 Atmosfera das vinhetas do menu: gradação de cor, luz volumétrica, poeira mágica.
// O que é estático vai ASSADO no fundo pré-renderizado (bakeAtmos, chamado por paintScene) → custo zero por quadro.
// Por quadro (drawAtmosBack/drawAtmosFront): 1–5 feixes de luz pulsando (gradientes em cache, 'lighter'),
// contraluz atrás dos magos (1 drawImage cada) e ~40 grãos de poeira/bokeh num anel fixo (sem alocação).
'use strict';

// key = luz principal [x,y,raio,cor] · pool = poça de luz no chão [x,y,rx,ry,cor] · shafts = feixes [x0,y0,x1,y1,larg0,larg1,cor,alfa]
// dust = cores da poeira · grade = [topo,base] (multiply: sombras azul-noite/roxo) · tint = contraluz dos magos · floor = y parede/chão
const ATMOS={
 tavern:{key:[480,292,270,'#ff9a3a'],pool:[440,418,250,52,'#ff8a2a'],shafts:[[96,140,190,470,36,150,'#9ab8ff',.13],[122,140,262,460,20,90,'#c8d8ff',.08]],
  dust:['#ffd9a0','#ffb060','#fff0d0'],grade:['#7a6ab0','#3a2a5a'],tint:'#ff9a4a',floor:360},
 forge:{key:[115,292,250,'#3a8aff'],pool:[170,420,270,48,'#3a7aff'],shafts:[[392,0,318,380,26,120,'#c8a0ff',.09],[440,0,400,380,14,70,'#9ad8ff',.06]],
  dust:['#9ad8ff','#c8f0ff','#d8b0ff'],grade:['#6a7ac0','#2a2a5a'],tint:'#5aa0ff',floor:360},
 library:{key:[300,120,210,'#ffd98a'],pool:[300,440,240,46,'#c9a6ff'],shafts:'rose',
  dust:['#ffd98a','#c9a6ff','#9ad8ff'],grade:['#7a5aaa','#2a1a4a'],tint:'#c9a6ff',floor:370},
 observatory:{key:[470,110,230,'#e6e0ff'],pool:[300,364,290,40,'#9a9aff'],shafts:[[470,110,190,560,24,170,'#cfd8ff',.07]],
  dust:['#cfe0ff','#ffffff','#c9a6ff'],grade:['#5a5ab0','#1a1a4a'],tint:'#aab8ff',floor:330,milky:1},
 kingdom:{key:[300,96,280,'#9ad0ff'],pool:null,shafts:[[520,0,410,430,40,190,'#c8d8ff',.06]],
  dust:['#9af0ff','#c9a6ff','#ffd98a'],grade:['#6a6ab0','#2a3a5a'],tint:'#9ad0ff',floor:0,mist:[150,262,430]},
 campfire:{key:[300,330,290,'#ff9a3a'],pool:[300,362,280,68,'#ff8a3a'],shafts:[[512,64,392,330,22,140,'#e0e8ff',.07]],
  dust:['#ffb060','#ffe08a','#c9a6ff'],grade:['#5a5ab0','#2a2050'],tint:'#ffa050',floor:300,mist:[300]}
};
// variações que mudam a luz: pôr do sol na janela da taverna, aurora no observatório, neve/outono na fogueira
function atmosOf(id,Pv){
 const A=ATMOS[id];if(!A)return null;
 if(id==='tavern'&&Pv.win&&Pv.win.sun)return Object.assign({},A,{shafts:[[96,140,190,470,36,150,'#ffb070',.15],[122,140,262,460,20,90,'#ffd0a0',.09]]});
 if(id==='observatory'&&Pv.aurora)return Object.assign({},A,{tint:'#6affc8',dust:['#a0ffd8','#ffffff','#7ad8ff']});
 if(id==='observatory'&&Pv.nebula)return Object.assign({},A,{tint:'#ff9ae0',dust:['#ffb0e8','#ffffff','#c9a6ff']});
 if(id==='campfire'&&Pv.snow)return Object.assign({},A,{dust:['#ffffff','#e0ecff','#ffb060']});
 return A;
}

// ---------- assado no fundo (1× por cena/variação) ----------
function bakeAtmos(x,id,v,Pv){
 const A=atmosOf(id,Pv||{});if(!A)return;const R=rng(id.length*131+(v|0)*977+7);let g;
 x.save();
 // 1) gradação de cor: multiply azul-noite → roxo (sombras profundas sem lavar os tons quentes)
 x.globalCompositeOperation='multiply';x.globalAlpha=.4;g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,A.grade[0]);g.addColorStop(1,A.grade[1]);x.fillStyle=g;x.fillRect(0,0,W,H);
 x.globalAlpha=1;x.globalCompositeOperation='source-over';
 // 2) oclusão ambiente: encontro parede/chão e laterais
 if(A.floor){g=x.createLinearGradient(0,A.floor-34,0,A.floor+44);g.addColorStop(0,'rgba(4,4,18,0)');g.addColorStop(.42,'rgba(4,4,18,.5)');g.addColorStop(1,'rgba(4,4,18,0)');x.fillStyle=g;x.fillRect(0,A.floor-34,W,78)}
 g=x.createLinearGradient(0,0,W,0);g.addColorStop(0,'rgba(8,4,26,.6)');g.addColorStop(.2,'rgba(8,4,26,0)');g.addColorStop(.8,'rgba(8,4,26,0)');g.addColorStop(1,'rgba(8,4,26,.6)');x.fillStyle=g;x.fillRect(0,0,W,H);
 // 3) céu: Via Láctea (observatório)
 x.globalCompositeOperation='lighter';
 if(A.milky){x.save();x.translate(300,170);x.rotate(-.42);
  g=x.createLinearGradient(0,-60,0,60);g.addColorStop(0,'rgba(150,140,255,0)');g.addColorStop(.5,'rgba(190,170,255,.16)');g.addColorStop(1,'rgba(150,140,255,0)');x.fillStyle=g;x.fillRect(-420,-60,840,120);
  g=x.createLinearGradient(0,-22,0,22);g.addColorStop(0,'rgba(255,220,240,0)');g.addColorStop(.5,'rgba(255,225,245,.1)');g.addColorStop(1,'rgba(255,220,240,0)');x.fillStyle=g;x.fillRect(-420,-22,840,44);
  x.fillStyle='#fff';for(let i=0;i<420;i++){const u=R()*840-420,w=(R()+R()+R()-1.5)*40;x.globalAlpha=.15+R()*.5;const s=R()<.06?1.6:.8;x.fillRect(u,w,s,s)}
  x.globalAlpha=1;x.restore()}
 // 4) luz principal (volumétrica) + poça de luz no chão
 const k=A.key;g=x.createRadialGradient(k[0],k[1],0,k[0],k[1],k[2]);g.addColorStop(0,hexA(k[3],.3));g.addColorStop(.4,hexA(k[3],.11));g.addColorStop(1,hexA(k[3],0));x.fillStyle=g;x.fillRect(0,0,W,H);
 if(A.pool){const p=A.pool;x.save();x.translate(p[0],p[1]);x.scale(1,p[3]/p[2]);g=x.createRadialGradient(0,0,0,0,0,p[2]);g.addColorStop(0,hexA(p[4],.24));g.addColorStop(.6,hexA(p[4],.07));g.addColorStop(1,hexA(p[4],0));x.fillStyle=g;x.beginPath();x.arc(0,0,p[2],0,6.283);x.fill();x.restore()}
 // 5) névoa baixa em faixas
 if(A.mist)for(const my of A.mist){g=x.createLinearGradient(0,my-26,0,my+26);g.addColorStop(0,'rgba(200,210,255,0)');g.addColorStop(.5,'rgba(200,210,255,.07)');g.addColorStop(1,'rgba(200,210,255,0)');x.fillStyle=g;x.fillRect(0,my-26,W,52)}
 x.globalCompositeOperation='source-over';
 // 6) granulado fino (textura de pintura: tira o aspecto "plano" dos gradientes)
 for(let i=0;i<1800;i++){x.globalAlpha=.035+R()*.03;x.fillStyle=R()<.5?'#000':'#fff';x.fillRect(R()*W,R()*H,1,1)}
 x.restore();
}

// ---------- feixes de luz (geometria + gradiente em cache por cena/variação) ----------
const _atm={key:'',A:null,shafts:[]};
function atmosPrep(id,v){
 const key=id+'|'+v;if(_atm.key===key)return _atm;
 const Pv=(typeof BGV!=='undefined'&&BGV[id]&&(BGV[id][v]||BGV[id][0]))||{},A=atmosOf(id,Pv);_atm.key=key;_atm.A=A;_atm.shafts=[];if(!A)return _atm;
 let list=A.shafts;
 if(list==='rose'){const sg=Pv.sg||['#c9a6ff','#7ad0ff','#ffd98a','#9aff8a','#ff9ac8'];list=[];for(let i=0;i<5;i++){const a=(i-2)*.2,ex=300+Math.sin(a)*330,ey=120+Math.cos(a)*330;list.push([300+(i-2)*14,140,ex,ey,22,96,sg[i%sg.length],.085])}} // vitral: feixes coloridos da rosácea até o tapete
 for(const s of list){const[x0,y0,x1,y1,w0,w1,col,a]=s,g=document.createElement('canvas').getContext('2d').createLinearGradient(x0,y0,x1,y1);
  g.addColorStop(0,hexA(col,1));g.addColorStop(.55,hexA(col,.45));g.addColorStop(1,hexA(col,0));
  const dx=x1-x0,dy=y1-y0,L=Math.hypot(dx,dy);_atm.shafts.push({x0,y0,x1,y1,w0,w1,a,g,nx:-dy/L,ny:dx/L})}
 return _atm;
}
function shaftQuad(c,s,sw,wk){
 const nx=s.nx,ny=s.ny,a=s.w0*wk/2,b=s.w1*wk/2,x1=s.x1+sw,y1=s.y1;
 c.beginPath();c.moveTo(s.x0+nx*a,s.y0+ny*a);c.lineTo(x1+nx*b,y1+ny*b);c.lineTo(x1-nx*b,y1-ny*b);c.lineTo(s.x0-nx*a,s.y0-ny*a);c.closePath();c.fill();
}

// ---------- poeira mágica + bokeh (anel fixo) ----------
const DUST_N=DeviceManager.isMobile?16:44,BOKEH_N=DeviceManager.isMobile?0:6;
const DUST=Array.from({length:DUST_N+BOKEH_N},(_,i)=>({x:Math.random()*W,y:Math.random()*H,vx:0,vy:0,ph:Math.random()*6.283,sp:rand(.4,1.2),s:i<DUST_N?rand(2.4,6):rand(26,54),ci:i%3,bk:i>=DUST_N}));

/** atrás dos magos: feixes de luz respirando + contraluz colorida em cada mago */
function drawAtmosBack(c,t,id,v,cast){
 const P0=atmosPrep(id,v),A=P0.A;if(!A)return;
 c.save();c.globalCompositeOperation='lighter';
 for(let i=0;i<P0.shafts.length;i++){const s=P0.shafts[i];c.fillStyle=s.g;
  const pulse=.72+.28*Math.sin(t*.55+i*1.9)*Math.sin(t*.23+i);
  c.globalAlpha=Math.min(1,s.a*pulse*.9);shaftQuad(c,s,Math.sin(t*.18+i)*8,1.6);   // halo largo e fraco
  c.globalAlpha=Math.min(1,s.a*pulse*1.6);shaftQuad(c,s,Math.sin(t*.18+i)*8,.75)}  // núcleo
 const tg=softGlow(A.tint);
 for(let i=0;i<cast.length;i++){const m=cast[i],r=86*m.s,cx=m.ax+70*m.s,cy=m.ay+74*m.s;c.globalAlpha=.3+.06*Math.sin(t*1.3+i);c.drawImage(tg,cx-r,cy-r,r*2,r*2)} // contraluz: separa o mago do fundo
 c.restore();
}
/** na frente: poeira iluminada (mais forte perto da luz principal) e bokeh desfocado em primeiro plano */
function drawAtmosFront(c,t,dt,id,v){
 const A=atmosPrep(id,v).A;if(!A)return;
 const k=A.key,kr2=k[2]*k[2]*1.6;c.save();c.globalCompositeOperation='lighter';
 for(let i=0;i<DUST.length;i++){const d=DUST[i];
  d.vx+=(Math.sin(t*.7*d.sp+d.ph)*6-d.vx)*dt;d.vy+=(-4-d.sp*5+Math.cos(t*.5+d.ph)*4-d.vy)*dt;
  d.x+=d.vx*dt*(d.bk?.5:1);d.y+=d.vy*dt*(d.bk?.4:1);
  if(d.y<-60){d.y=H+40;d.x=Math.random()*W}if(d.x<-60)d.x=W+50;else if(d.x>W+60)d.x=-50;
  const col=A.dust[d.ci];
  if(d.bk){c.globalAlpha=.1+.06*Math.sin(t*.8+d.ph);c.drawImage(softGlow(col),d.x-d.s,d.y-d.s,d.s*2,d.s*2);continue}
  const dx=d.x-k[0],dy=d.y-k[1],lit=Math.max(0,1-(dx*dx+dy*dy)/kr2),tw=.5+.5*Math.sin(t*2.3*d.sp+d.ph);
  c.globalAlpha=Math.min(1,.18+lit*.7)*(.45+.55*tw);const s=d.s*(.8+lit*.5);c.drawImage(glowSprite(col),(d.x-s/2)|0,(d.y-s/2)|0,s|0,s|0)}
 c.restore();
}
