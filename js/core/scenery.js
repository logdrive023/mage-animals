// Mage Animals — Cenário do canvas: céu em camadas (parallax), lua e raios de luz, nuvens e névoa em movimento,
// torre medieval (pedras irregulares, ameias 3D, janela gótica, estandarte ao vento, tochas), mago animal e aura mágica.
// Performance: céu, montanhas, nuvens e corpo da torre são pré-renderizados; por quadro só há drawImage + poucos paths.
'use strict';

// ================== CORES ==================
function rgbOf(h){const n=parseInt(h.slice(1),16);return[n>>16,n>>8&255,n&255]}
function mix(a,b,f){const A=rgbOf(a),B=rgbOf(b);return'#'+A.map((v,i)=>Math.max(0,Math.min(255,Math.round(v+(B[i]-v)*f))).toString(16).padStart(2,'0')).join('')}
const shade=(h,f)=>f>=0?mix(h,'#ffffff',f):mix(h,'#000000',-f);

// ================== CAMADAS DO CÉU ==================
let themeIdx=-1;
const skyCv=mkCanvas(W,H),farCv=mkCanvas(W+60,H),nearCv=mkCanvas(W+60,H),raysCv=mkCanvas(W,H),fogCv=mkCanvas(W*2,140);
const MOON={x:W-92,y:92,r:28};
const STARS=Array.from({length:130},()=>({x:Math.random()*W|0,y:Math.random()*(H-240)|0,s:Math.random()<.15?2:1,p:Math.random()*6,v:rand(.6,3.2),c:Math.random()<.22?'#cfe0ff':Math.random()<.12?'#ffe6c0':'#ffffff'}));
const BRIGHT=Array.from({length:6},()=>({x:rand(20,W-140),y:rand(20,H*.42),p:Math.random()*6,v:rand(.5,1.4)}));
const BUBBLES=Array.from({length:22},()=>({x:Math.random()*W,y:Math.random()*H,r:rand(1.5,4.5),v:rand(14,40),p:Math.random()*6}));
const CLOUDS=Array.from({length:7},(_,i)=>({spr:i%3,x:rand(-200,W),y:i<4?rand(110,240):rand(300,380),sp:i<4?rand(3,7):rand(7,13),layer:i<4?0:1,a:i<4?.75:.55}));
const MOTES=Array.from({length:22},(_,i)=>({a:Math.random()*6.28,r:rand(48,118),sp:rand(.15,.45)*(i%2?1:-1),ph:Math.random(),rise:rand(10,22),s:rand(.8,1.8)}));
let cloudSpr=[];

// linha de serra com deslocamento de ponto médio (montanhas mais naturais)
function ridge(R,w,base,amp,rough){
 let pts=[[-10,base-R()*amp*.6],[w+10,base-R()*amp*.6]];
 for(let it=0;it<6;it++){const np=[];for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1];np.push(a,[(a[0]+b[0])/2,(a[1]+b[1])/2+(R()-.5)*amp*Math.pow(rough,it)])}np.push(pts[pts.length-1]);pts=np}
 for(const p of pts)p[1]=Math.min(base+amp*.2,Math.max(base-amp*1.3,p[1]));
 return pts;
}
function paintRidge(c,pts,h,top,bot,rim,snow){
 const minY=Math.min(...pts.map(p=>p[1]));
 c.beginPath();c.moveTo(pts[0][0],h);for(const p of pts)c.lineTo(p[0],p[1]);c.lineTo(pts[pts.length-1][0],h);c.closePath();
 const g=c.createLinearGradient(0,minY,0,h);g.addColorStop(0,top);g.addColorStop(1,bot);c.fillStyle=g;c.fill();
 c.save();c.clip();
 // encostas voltadas para longe da lua (esquerda) ficam na sombra
 for(let i=1;i<pts.length-1;i++){const p=pts[i];if(p[1]<pts[i-1][1]&&p[1]<=pts[i+1][1]){const d=Math.min(150,h-p[1]),g=c.createLinearGradient(0,p[1],0,p[1]+d);g.addColorStop(0,'rgba(0,0,12,.2)');g.addColorStop(1,'rgba(0,0,12,0)');c.fillStyle=g;c.beginPath();c.moveTo(p[0],p[1]);c.lineTo(p[0]-d*.8,p[1]+d);c.lineTo(p[0]+4,p[1]+d);c.fill()}}
 if(snow){c.fillStyle='rgba(235,245,255,.75)';for(let i=1;i<pts.length-1;i++){const p=pts[i];if(p[1]<pts[i-1][1]&&p[1]<=pts[i+1][1]&&p[1]<minY+40){c.beginPath();c.moveTo(p[0],p[1]);c.lineTo(p[0]-14,p[1]+14);c.lineTo(p[0]-4,p[1]+10);c.lineTo(p[0]+3,p[1]+15);c.lineTo(p[0]+12,p[1]+12);c.fill()}}}
 // borda iluminada pela lua
 c.strokeStyle=rim;c.lineWidth=2.5;c.beginPath();for(const p of pts)c.lineTo(p[0],p[1]+1.2);c.stroke();
 c.restore();
}
function fogBand(c,y,h,col,a){const g=c.createLinearGradient(0,y-h,0,y+h);g.addColorStop(0,hexA(col,0));g.addColorStop(.5,hexA(col,a));g.addColorStop(1,hexA(col,0));c.fillStyle=g;c.fillRect(0,y-h,c.canvas.lw||c.canvas.width,h*2)}

function paintMoon(c,T){
 const{x,y,r}=MOON,sun=T.sun;
 for(const[rr,a]of[[r*6,.10],[r*3.2,.18],[r*1.8,.28]]){const g=c.createRadialGradient(x,y,r*.6,x,y,rr);g.addColorStop(0,sun?`rgba(255,220,150,${a})`:`rgba(220,220,255,${a})`);g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(x-rr,y-rr,rr*2,rr*2)}
 const g=c.createRadialGradient(x-r*.35,y-r*.35,r*.2,x,y,r);g.addColorStop(0,sun?'#fffbe0':'#fffdf2');g.addColorStop(1,sun?'#ffd890':'#cfc8ee');c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,6.283);c.fill();
 if(!sun){c.fillStyle='rgba(120,110,170,.18)';for(const[dx,dy,cr]of[[-.3,-.1,.22],[.25,.3,.16],[.1,-.45,.11],[-.15,.42,.09],[.42,-.05,.08]]){c.beginPath();c.arc(x+dx*r,y+dy*r,cr*r,0,6.283);c.fill()}}
}
function paintSkyDefault(ti){
 const T=THEMES[ti],R=rng(11+ti*31),c=skyCv.getContext('2d');
 let g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,T.sky[0]);g.addColorStop(.55,T.sky[1]);g.addColorStop(1,T.sky[2]);c.fillStyle=g;c.fillRect(0,0,W,H);
 g=c.createRadialGradient(W*.5,H*.72,10,W*.5,H*.72,W*.8);g.addColorStop(0,hexA(T.neb,.16));g.addColorStop(1,hexA(T.neb,0));c.fillStyle=g;c.fillRect(0,0,W,H);
 for(let i=0;i<7;i++){const x=R()*W,y=R()*H*.55,r=90+R()*170,rg=c.createRadialGradient(x,y,0,x,y,r);rg.addColorStop(0,hexA(i%2?T.neb:'#ff7ad8',.10+R()*.06));rg.addColorStop(1,hexA(T.neb,0));c.fillStyle=rg;c.fillRect(0,0,W,H)}
 // via láctea: faixa diagonal de poeira estelar
 if(T.stars>.5){for(let i=0;i<520;i++){const k=R(),x=k*W,y=60+k*260+(R()-.5)*90*(1-Math.abs(k-.5));c.globalAlpha=.15+R()*.35;c.fillStyle='#fff';c.fillRect(x,y,R()<.1?1.6:.8,R()<.1?1.6:.8)}c.globalAlpha=1}
 paintMoon(c,T);
 // montanhas distantes (camada de parallax lenta) + névoa na base
 const f=farCv.getContext('2d');f.clearRect(0,0,farCv.width,H);
 paintRidge(f,ridge(R,farCv.lw,H-235,120,.58),H,shade(T.m1,.12),shade(T.m2,.05),hexA(T.sun?'#fff0c0':'#cfd8ff',.35),ti===2);
 fogBand(f,H-200,34,T.neb,.16);
 // montanhas próximas (camada rápida)
 const n=nearCv.getContext('2d');n.clearRect(0,0,nearCv.width,H);
 const np=ridge(R,nearCv.lw,H-160,85,.55);paintRidge(n,np,H,shade(T.m2,.05),shade(T.m2,-.45),hexA('#cfd8ff',.18),false);
 if(ti===3){n.fillStyle=shade(T.m2,-.5);for(let i=0;i<26;i++){const x=R()*nearCv.lw,p=np[Math.min(np.length-1,Math.round(x/nearCv.lw*(np.length-1)))],y=p[1]+6,hh=14+R()*20;n.beginPath();n.moveTo(x,y-hh);n.lineTo(x-hh*.3,y);n.lineTo(x+hh*.3,y);n.fill()}}
 fogBand(n,H-110,44,'#c8c8ff',.10);
 // sprites de nuvens (translúcidas, tingidas pela nebulosa)
 cloudSpr=[0,1,2].map(i=>{const w=200+i*70,h=70,s=mkCanvas(w,h),cc=s.getContext('2d'),Rc=rng(77+i*13+ti);
  for(let k=0;k<16;k++){const x=w*(.12+Rc()*.76),y=h*(.45+(Rc()-.5)*.35),r=16+Rc()*26,rg=cc.createRadialGradient(x,y,0,x,y,r);rg.addColorStop(0,hexA(mix(T.neb,'#ffffff',.55),T.sun?.32:.16));rg.addColorStop(1,hexA(T.neb,0));cc.fillStyle=rg;cc.fillRect(x-r,y-r,r*2,r*2)}
  return s});
 // névoa que desliza na frente das montanhas
 const fc=fogCv.getContext('2d');fc.clearRect(0,0,fogCv.width,fogCv.height);const Rf=rng(5+ti);
 for(let k=0;k<26;k++){const x=Rf()*fogCv.lw,y=70+(Rf()-.5)*50,r=40+Rf()*60,rg=fc.createRadialGradient(x,y,0,x,y,r);rg.addColorStop(0,hexA(mix(T.neb,'#ffffff',.6),.09));rg.addColorStop(1,'rgba(255,255,255,0)');fc.fillStyle=rg;fc.fillRect(x-r,y-r,r*2,r*2)}
}
// biomas especiais (Zumbi / Abismo) mantêm a pintura própria numa única camada
function mountainsFlat(c,R,w,h,base,amp,col){c.fillStyle=col;c.beginPath();c.moveTo(0,h);c.lineTo(0,base);let x=0;while(x<w){const s=(40+R()*70)*w/W;c.lineTo(x+s*.5,base-amp*(.35+R()*.65));x+=s;c.lineTo(x,base-R()*amp*.25)}c.lineTo(w,h);c.closePath();c.fill()}
function paintSkyKind(c,ti,w,h,seed){
 const T=THEMES[ti],R=rng(seed),k=w/W;
 let g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,T.sky[0]);g.addColorStop(.6,T.sky[1]);g.addColorStop(1,T.sky[2]);c.fillStyle=g;c.fillRect(0,0,w,h);
 for(let i=0;i<6;i++){const x=R()*w,y=R()*h*.6,r=(120+R()*170)*k,rg=c.createRadialGradient(x,y,0,x,y,r);rg.addColorStop(0,hexA(T.neb,.15));rg.addColorStop(1,hexA(T.neb,0));c.fillStyle=rg;c.fillRect(0,0,w,h)}
 if(T.kind==='ocean'){
  for(let i=0;i<5;i++){const x=R()*w,gw=(30+R()*60)*k;g=c.createLinearGradient(0,0,0,h*.8);g.addColorStop(0,'rgba(160,255,255,.16)');g.addColorStop(1,'rgba(160,255,255,0)');c.fillStyle=g;c.beginPath();c.moveTo(x,0);c.lineTo(x+gw,0);c.lineTo(x+gw*2.4-60*k,h*.8);c.lineTo(x-60*k,h*.8);c.fill()}
  mountainsFlat(c,R,w,h,h-200*h/H,90*h/H,T.m1);
  for(let i=0;i<14;i++){const x=R()*w,hh=(40+R()*90)*k;c.strokeStyle=i%2?'#0f5a4a':'#0b4a3c';c.lineWidth=(3+R()*3)*k;c.beginPath();c.moveTo(x,h);for(let y=0;y<hh;y+=6*k)c.lineTo(x+Math.sin(y*.08/k+i)*6*k,h-y);c.stroke()}
  mountainsFlat(c,R,w,h,h-120*h/H,40*h/H,T.m2);
  g=c.createLinearGradient(0,h-60*k,0,h);g.addColorStop(0,'rgba(200,180,120,0)');g.addColorStop(1,'rgba(120,110,80,.5)');c.fillStyle=g;c.fillRect(0,h-60*k,w,60*k);
  return;
 }
 const mx=w-90*k*(w<200?.5:1),my=86*k*(w<200?1.3:1),mr=Math.max(6,34*k*(w<200?2:1));
 const mg=c.createRadialGradient(mx,my,mr*.4,mx,my,mr*3.5);mg.addColorStop(0,hexA(T.moonCol||'#ece6ff',.35));mg.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=mg;c.fillRect(0,0,w,h);
 c.fillStyle=T.moonCol||'#ece6ff';c.beginPath();c.arc(mx,my,mr,0,7);c.fill();
 c.fillStyle='rgba(120,140,60,.35)';c.beginPath();c.arc(mx-mr*.3,my-mr*.2,mr*.22,0,7);c.arc(mx+mr*.35,my+mr*.25,mr*.15,0,7);c.fill();
 c.fillStyle='#0a0612';for(let i=0;i<6;i++){const bx=R()*w*.8,by=(60+R()*160)*k,s=(5+R()*5)*k;c.beginPath();c.moveTo(bx,by);c.quadraticCurveTo(bx-s,by-s*.8,bx-s*2,by);c.quadraticCurveTo(bx-s,by-s*.2,bx,by+s*.3);c.quadraticCurveTo(bx+s,by-s*.2,bx+s*2,by);c.quadraticCurveTo(bx+s,by-s*.8,bx,by);c.fill()}
 for(let i=0;i<8;i++){const x=R()*w,y=h*(.2+R()*.45);c.fillStyle=hexA(T.m1,.28);for(let j=0;j<5;j++){c.beginPath();c.ellipse(x+(j*24-48)*k,y+Math.sin(j*1.7)*6*k,44*k,11*k,0,0,7);c.fill()}}
 mountainsFlat(c,R,w,h,h-215*h/H,110*h/H,T.m1);
 c.fillStyle=T.m2;c.beginPath();c.moveTo(0,h);c.lineTo(0,h-150*h/H);c.quadraticCurveTo(w*.5,h-210*h/H,w,h-140*h/H);c.lineTo(w,h);c.fill();
 for(let i=0;i<12;i++){const x=R()*w,y=h-(120+R()*50)*h/H,s=(7+R()*7)*k;c.beginPath();if(i%3===0){c.fillRect(x-s*.18,y-s*1.6,s*.36,s*1.6);c.fillRect(x-s*.6,y-s*1.2,s*1.2,s*.3)}else{c.moveTo(x-s*.6,y);c.lineTo(x-s*.6,y-s);c.arc(x,y-s,s*.6,Math.PI,0);c.lineTo(x+s*.6,y)}c.fill()}
 c.strokeStyle=T.m2;for(let i=0;i<3;i++){const x=w*(.12+i*.38)+R()*30*k,y=h-150*h/H;c.lineWidth=5*k;c.beginPath();c.moveTo(x,y+20*k);c.lineTo(x,y-60*k);c.stroke();c.lineWidth=2.5*k;c.beginPath();c.moveTo(x,y-30*k);c.lineTo(x-24*k,y-58*k);c.moveTo(x,y-45*k);c.lineTo(x+20*k,y-70*k);c.stroke()}
 g=c.createLinearGradient(0,h*.65,0,h);g.addColorStop(0,'rgba(120,255,90,0)');g.addColorStop(1,'rgba(120,255,90,.13)');c.fillStyle=g;c.fillRect(0,h*.65,w,h*.35);
}
// raios de luz (god rays) pré-renderizados a partir da lua / superfície do mar
function paintRays(ti){
 const T=THEMES[ti],c=raysCv.getContext('2d');c.clearRect(0,0,W,H);
 const ocean=T.kind==='ocean',col=ocean?'170,255,255':T.kind==='zombie'?'200,255,150':T.sun?'255,230,180':'220,215,255';
 for(let i=0;i<5;i++){
  const ox=ocean?80+i*120:MOON.x,oy=ocean?0:MOON.y,g=c.createLinearGradient(ox,oy,TX,H);
  g.addColorStop(0,`rgba(${col},${ocean?.09:.075})`);g.addColorStop(.6,`rgba(${col},.025)`);g.addColorStop(1,`rgba(${col},0)`);c.fillStyle=g;c.beginPath();
  if(ocean){c.moveTo(ox-20,0);c.lineTo(ox+30,0);c.lineTo(ox-30+i*12,H);c.lineTo(ox-110+i*12,H)}
  else{const sp=[-210,-140,-60,20,95][i];c.moveTo(ox-8,oy);c.lineTo(TX+sp,H);c.lineTo(TX+sp+42,H);c.lineTo(ox+8,oy)}
  c.fill();
 }
}
// modo Lite: céu + montanhas distantes + próximas pré-compostos numa única camada (1 drawImage de tela cheia em vez de 3–5)
let bgVer=0,liteVer=-1;const liteBgCv=mkCanvas(W,H),liteBgCx=liteBgCv.getContext('2d');
const STARS_LITE=STARS.filter(s=>s.y<330).slice(0,50); // no Lite as estrelas são desenhadas sobre a camada única → só no céu alto
function liteBg(){if(liteVer!==bgVer){liteVer=bgVer;const TH=THEMES[themeIdx];liteBgCx.clearRect(0,0,W,H);liteBgCx.drawImage(skyCv,0,0);if(!TH.kind){liteBgCx.drawImage(farCv,-30,0);liteBgCx.drawImage(nearCv,-30,0)}}return liteBgCv}
function renderBg(i){
 themeIdx=i;const T=THEMES[i];
 if(T.kind){paintSkyKind(skyCv.getContext('2d'),i,W,H,11+i*31);farCv.getContext('2d').clearRect(0,0,farCv.width,H);nearCv.getContext('2d').clearRect(0,0,nearCv.width,H);cloudSpr=[];fogCv.getContext('2d').clearRect(0,0,fogCv.width,fogCv.height)}
 else paintSkyDefault(i);
 paintRays(i);bgVer++;
}

// fundo vivo por quadro: estrelas cintilando em frequências diferentes, nuvens e névoa deslizando, parallax sutil
function drawBackground(c,dt){
 const TH=THEMES[themeIdx],par=Math.sin(T*.05);
 if(!PERF.hq){ // caminho leve: 1 camada cacheada + estrelas do céu + nuvens
  c.drawImage(liteBg(),0,0);
  if(TH.stars){for(let i=0;i<STARS_LITE.length;i++){const s=STARS_LITE[i];c.globalAlpha=(.3+.7*Math.abs(Math.sin(T*s.v*.5+s.p)))*TH.stars;c.fillStyle=s.c;c.fillRect(s.x,s.y,s.s,s.s)}c.globalAlpha=1}
  drawCloudLayer(c,dt,0);drawCloudLayer(c,dt,1);
  if(TH.kind==='ocean')drawBubbles(c,dt);
  return;
 }
 c.drawImage(skyCv,0,0);
 if(TH.stars){
  for(let i=0,n=PERF.hq?STARS.length:50;i<n;i++){const s=STARS[i];c.globalAlpha=(.3+.7*Math.abs(Math.sin(T*s.v*.5+s.p)))*TH.stars;c.fillStyle=s.c;c.fillRect(s.x,s.y,s.s,s.s)}
  if(PERF.hq){c.globalCompositeOperation='lighter';const sp=starSprite('#ffffff');for(const b of BRIGHT){const a=Math.max(0,Math.sin(T*b.v+b.p));c.globalAlpha=a*TH.stars;const d=(8+a*8)|0;c.drawImage(sp,(b.x-d/2)|0,(b.y-d/2)|0,d,d)}c.globalCompositeOperation='source-over'}
  c.globalAlpha=1;
 }
 drawCloudLayer(c,dt,0);
 if(!TH.kind)c.drawImage(farCv,(-30+par*6)|0,0);
 if(PERF.hq){c.globalCompositeOperation='lighter';c.globalAlpha=.75+.25*Math.sin(T*.6);c.drawImage(raysCv,0,0);c.globalAlpha=1;c.globalCompositeOperation='source-over'}
 drawCloudLayer(c,dt,1);
 if(!TH.kind){c.drawImage(nearCv,(-30+par*14)|0,0);if(PERF.hq){const fx=-((T*6)%W);c.drawImage(fogCv,fx|0,H-210);c.drawImage(fogCv,(fx+W*2-1)|0,H-210)}}
 if(TH.kind==='ocean')drawBubbles(c,dt);
}
// nuvens e bolhas sem closures por quadro
function drawCloudLayer(c,dt,layer){if(!cloudSpr.length)return;for(let i=0;i<CLOUDS.length;i++){const cl=CLOUDS[i];if(cl.layer!==layer)continue;cl.x+=cl.sp*dt;const s=cloudSpr[cl.spr];if(cl.x>W+20)cl.x=-s.lw;c.globalAlpha=cl.a;c.drawImage(s,cl.x|0,cl.y)}c.globalAlpha=1}
function drawBubbles(c,dt){c.strokeStyle='rgba(200,250,255,.45)';c.lineWidth=1;c.beginPath();
 for(let i=0;i<BUBBLES.length;i++){const b=BUBBLES[i];b.y-=b.v*dt;if(b.y<-10){b.y=H+10;b.x=Math.random()*W}const x=b.x+Math.sin(T*1.5+b.p)*6;c.moveTo(x+b.r,b.y);c.arc(x,b.y,b.r,0,6.283)}c.stroke()}

// ================== TORRE MEDIEVAL ==================
function archPath(c,x,y,w,h){c.beginPath();c.moveTo(x-w/2,y+h);c.lineTo(x-w/2,y);c.quadraticCurveTo(x-w/2,y-w*.45,x,y-w*.8);c.quadraticCurveTo(x+w/2,y-w*.45,x+w/2,y);c.lineTo(x+w/2,y+h);c.closePath()}
function gothicWindow(c,T,x,y,w,h,k){
 if(T.kind==='ocean'){ // escotilha redonda
  c.fillStyle='#8a9aa0';c.beginPath();c.arc(x,y+h*.4,w*.75,0,6.283);c.fill();c.fillStyle='#02121a';c.beginPath();c.arc(x,y+h*.4,w*.55,0,6.283);c.fill();
  const g=c.createRadialGradient(x,y+h*.4,0,x,y+h*.4,w*.5);g.addColorStop(0,'#e8ffff');g.addColorStop(1,T.win);c.fillStyle=g;c.beginPath();c.arc(x,y+h*.4,w*.45,0,6.283);c.fill();return;
 }
 c.fillStyle=shade(T.tw[1],.12);archPath(c,x,y,w+6*k,h+4*k);c.fill();                      // moldura de pedra
 c.fillStyle='rgba(0,0,0,.45)';archPath(c,x+.8*k,y+.8*k,w+1.5*k,h+1*k);c.fill();
 const g=c.createRadialGradient(x,y+h*.5,1,x,y+h*.4,h*.95);g.addColorStop(0,'#fff4c8');g.addColorStop(.4,T.win);g.addColorStop(1,shade(T.win,-.6));
 c.fillStyle=g;archPath(c,x,y,w,h);c.fill();                                                 // luz quente de dentro
 c.strokeStyle='rgba(40,22,10,.9)';c.lineWidth=Math.max(.8,1.6*k);c.beginPath();c.moveTo(x,y-w*.75);c.lineTo(x,y+h);c.moveTo(x-w/2,y+h*.38);c.lineTo(x+w/2,y+h*.38);c.stroke(); // caixilhos
 c.fillStyle=shade(T.tw[1],.22);c.fillRect(x-w/2-3*k,y+h,w+6*k,2.6*k);                       // peitoril
 c.save();c.globalCompositeOperation='lighter';const gg=c.createRadialGradient(x,y+h*.4,0,x,y+h*.4,w*2.3);gg.addColorStop(0,hexA(T.win,.32));gg.addColorStop(1,hexA(T.win,0));c.fillStyle=gg;c.fillRect(x-w*2.3,y+h*.4-w*2.3,w*4.6,w*4.6);c.restore();
}
// pedras irregulares projetadas num cilindro (mais estreitas nas bordas) com luz da lua vinda da frente-direita
function towerStones(c,T,cx,top,bot,hw,k,R){
 const taper=8*k;let y=top+2*k,row=0;
 while(y<bot){
  const rh=(12+R()*7)*k,yy=Math.min(rh,bot-y),hwr=hw+taper*(y-top)/Math.max(1,bot-top);
  let a=-Math.PI/2+(row%2?.0:.13*R());
  while(a<Math.PI/2){
   const a1=Math.min(Math.PI/2,a+.2+R()*.2),x0=cx+hwr*Math.sin(a),x1=cx+hwr*Math.sin(a1),am=(a+a1)/2;
   const lit=.5+.5*Math.cos(am-.5),sw=x1-x0-1.3*k;
   if(sw>.6){
    c.fillStyle=shade(T.tw[1],-.62+lit*.72+(R()-.5)*.16);c.beginPath();c.roundRect(x0+.65*k,y+.65*k,sw,Math.max(.5,yy-1.3*k),Math.min(3*k,sw/2,yy/2));c.fill();
    if(sw>2.5){c.fillStyle=`rgba(255,255,255,${(.04+lit*.13).toFixed(3)})`;c.fillRect(x0+1.2*k,y+1*k,sw-.9*k,Math.max(.6,1.1*k));c.fillStyle='rgba(0,0,0,.3)';c.fillRect(x0+1*k,y+yy-2*k,sw-.5*k,Math.max(.6,1.2*k))}
   }
   a=a1;
  }
  y+=rh;row++;
 }
}
function merlon3D(c,T,x,y,w,h,k,lit,back){
 const base=back?shade(T.tw[0],-.25):T.tw[1],d=4*k;
 c.fillStyle=shade(base,-.6+lit*.65);c.fillRect(x-w/2,y-h,w,h);                                       // face frontal
 c.fillStyle=shade(base,-.15+lit*.35);c.beginPath();c.moveTo(x-w/2,y-h);c.lineTo(x+w/2,y-h);c.lineTo(x+w/2-1.5*k,y-h-d);c.lineTo(x-w/2+1.5*k,y-h-d);c.fill(); // topo
 c.fillStyle=`rgba(255,255,255,${(.06+lit*.12).toFixed(3)})`;c.fillRect(x+w/2-2*k,y-h,2*k,h);          // aresta iluminada
 c.fillStyle='rgba(0,0,0,.35)';c.fillRect(x-w/2,y-h,1.6*k,h);c.fillRect(x-w/2,y-h*.48,w,1*k);           // sombra e junta
}
function drawTowerBody(c,ti,cx,top,bot,hw,opts={}){
 const T=THEMES[ti],k=hw/78,R=rng(900+ti*7+Math.round(hw)),taper=8*k;
 c.save();
 c.beginPath();c.moveTo(cx-hw,top);c.lineTo(cx-hw-taper,bot);c.lineTo(cx+hw+taper,bot);c.lineTo(cx+hw,top);c.closePath();
 c.fillStyle=shade(T.tw[0],-.55);c.fill();c.clip();                                              // argamassa
 towerStones(c,T,cx,top,bot,hw,k,R);
 let g=c.createLinearGradient(cx-hw-taper,0,cx+hw+taper,0);                                    // volume do cilindro
 g.addColorStop(0,'rgba(0,0,10,.62)');g.addColorStop(.3,'rgba(0,0,10,.12)');g.addColorStop(.62,'rgba(0,0,0,0)');g.addColorStop(.86,'rgba(200,210,255,.10)');g.addColorStop(1,'rgba(0,0,10,.45)');
 c.fillStyle=g;c.fillRect(cx-hw-taper,top,(hw+taper)*2,bot-top);
 g=c.createLinearGradient(0,top,0,top+34*k);g.addColorStop(0,'rgba(0,0,0,.6)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(cx-hw-taper,top,(hw+taper)*2,34*k); // oclusão sob a plataforma
 // faixa de mísulas (corbels) logo abaixo da plataforma
 for(let a=-1.45;a<=1.45;a+=.26){const x=cx+hw*Math.sin(a),lit=.5+.5*Math.cos(a-.5),w=7*k*Math.cos(a)+1;c.fillStyle=shade(T.tw[1],-.45+lit*.5);c.beginPath();c.moveTo(x-w/2,top+5*k);c.lineTo(x+w/2,top+5*k);c.lineTo(x+w*.3,top+14*k);c.lineTo(x-w*.3,top+14*k);c.fill()}
 // decorações por tema
 if(ti===2){g=c.createLinearGradient(0,top,0,top+60*k);g.addColorStop(0,'rgba(220,240,255,.45)');g.addColorStop(1,'rgba(220,240,255,0)');c.fillStyle=g;c.fillRect(cx-hw-10*k,top,hw*2+20*k,60*k)}
 if(ti===3||T.kind==='zombie'){c.strokeStyle=T.kind==='zombie'?'#3a2a4a':'#2f6a2a';c.lineWidth=2.4*k+.6;
  for(let v=0;v<4;v++){const vx=cx+(-60+v*38)*k;c.beginPath();c.moveTo(vx,top);for(let y=top;y<bot;y+=14*k)c.lineTo(vx+Math.sin(y*.09/k+v)*7*k,y);c.stroke();
   for(let y=top+8*k;y<bot;y+=16*k){c.fillStyle=T.kind==='zombie'?((y/k|0)%3?'#5a3a6a':'#7a4a8a'):((y/k|0)%3?'#4aa33a':'#6ad04a');c.beginPath();c.ellipse(vx+Math.sin(y*.09/k+v)*7*k+5*k,y,5*k,2.6*k,.6,0,7);c.fill()}}}
 if(ti===4){c.strokeStyle='rgba(90,208,255,.9)';c.shadowColor='#5ad0ff';c.shadowBlur=12*k+4;c.lineWidth=1.8*k+.5;
  for(let y=top+30*k;y<bot-10*k;y+=46*k){const rx=cx+38*k;c.beginPath();c.moveTo(rx,y-8*k);c.lineTo(rx+6*k,y);c.lineTo(rx,y+8*k);c.lineTo(rx-6*k,y);c.closePath();c.stroke()}c.shadowBlur=0}
 if(T.kind==='ocean'){const Rb=rng(9);for(let i=0;i<26;i++){c.fillStyle=i%3?'rgba(200,220,210,.55)':'rgba(255,160,190,.6)';c.beginPath();c.arc(cx+(Rb()*2-1)*hw,top+Rb()*(bot-top),(1.5+Rb()*3)*k,0,7);c.fill()}
  for(let i=0;i<3;i++){const bx=cx+(-50+i*50)*k;c.strokeStyle=['#ff7aa8','#ffb05a','#ff5a8a'][i];c.lineWidth=3*k;c.beginPath();c.moveTo(bx,bot);c.lineTo(bx,bot-26*k);c.moveTo(bx,bot-14*k);c.lineTo(bx-10*k,bot-28*k);c.moveTo(bx,bot-18*k);c.lineTo(bx+9*k,bot-32*k);c.stroke()}}
 // janelas góticas (na torre do jogo: uma, à esquerda do estandarte; nas miniaturas: várias)
 if(opts.windows==='many'){for(let wy=top+44*k,n=0;wy<bot-30*k;wy+=80*k,n++)gothicWindow(c,T,cx+(n%2?16:-18)*k,wy,15*k,26*k,k)}
 else gothicWindow(c,T,cx-30*k,top+60*k,16*k,26*k,k);
 c.restore();
 // plataforma superior: aro + piso de pedra
 c.fillStyle=shade(T.tw[0],-.35);c.beginPath();c.ellipse(cx,top,hw+7*k,15*k,0,0,6.283);c.fill();
 g=c.createLinearGradient(0,top-14*k,0,top+12*k);g.addColorStop(0,shade(T.tw[1],.05));g.addColorStop(1,shade(T.tw[0],-.2));c.fillStyle=g;c.beginPath();c.ellipse(cx,top-2*k,hw-3*k,11*k,0,0,6.283);c.fill();
 c.strokeStyle='rgba(0,0,0,.18)';c.lineWidth=Math.max(.5,k);c.beginPath();c.ellipse(cx,top-2*k,hw*.62,6.5*k,0,0,6.283);c.moveTo(cx-hw+4*k,top-2*k);c.lineTo(cx+hw-4*k,top-2*k);c.stroke();
 if(ti===2){c.fillStyle='rgba(235,248,255,.85)';c.beginPath();c.ellipse(cx,top-3*k,hw-6*k,9*k,0,0,7);c.fill();
  c.fillStyle='rgba(200,235,255,.9)';for(let i=-4;i<=4;i++){const ix=cx+i*17*k,iy=top+12*k*Math.sqrt(1-(i*17/86)**2);c.beginPath();c.moveTo(ix-3*k,iy);c.lineTo(ix,iy+(10+(i*7+20)%9)*k);c.lineTo(ix+3*k,iy);c.fill()}}
 // ameias do fundo (lado de dentro visível)
 for(let i=-3;i<=3;i++){const a=i*.42,mx=cx+(hw-2*k)*Math.sin(a),my=top-2*k-11*k*Math.cos(a);merlon3D(c,T,mx,my,15*k*(.75+.25*Math.cos(a)),15*k,k,.35+.3*Math.cos(a-.5),true)}
}
function drawTowerFront(c,ti,cx,top,hw){
 const T=THEMES[ti],k=hw/78;
 for(let i=-3;i<=3;i++){
  const a=i*.43,mx=cx+(hw+4*k)*Math.sin(a),my=top+4*k+11*k*Math.cos(a),w=19*k*(.7+.3*Math.cos(a)),h=19*k,lit=.5+.5*Math.cos(a-.5);
  merlon3D(c,T,mx,my,w,h,k,lit,false);
  const ty=my-h;
  if(ti===2){c.fillStyle='#f0faff';c.beginPath();c.ellipse(mx,ty-1*k,w*.55,3.5*k,0,0,7);c.fill()}
  if(ti===3&&i%2){c.fillStyle='#4aa33a';c.beginPath();c.ellipse(mx-4*k,ty+2*k,6*k,3*k,-.5,0,7);c.ellipse(mx+5*k,ty+4*k,5*k,2.5*k,.5,0,7);c.fill()}
  if(ti===4&&i%2===0){c.save();c.shadowColor='#5ad0ff';c.shadowBlur=14*k+3;const g=c.createLinearGradient(0,ty-16*k,0,ty);g.addColorStop(0,'#c8f4ff');g.addColorStop(1,'#2a6aa8');c.fillStyle=g;c.beginPath();c.moveTo(mx-5*k,ty);c.lineTo(mx,ty-16*k);c.lineTo(mx+5*k,ty);c.fill();c.restore()}
  if(T.kind==='zombie'&&i%3===0&&i!==0){c.fillStyle='#ff9a2a';c.beginPath();c.ellipse(mx,ty-3*k,6*k,5*k,0,0,7);c.fill();c.fillStyle='#3a2a10';c.fillRect(mx-1*k,ty-10*k,2*k,4*k);c.fillStyle='#ffe07a';c.fillRect(mx-3*k,ty-4*k,2*k,2*k);c.fillRect(mx+1*k,ty-4*k,2*k,2*k)}
  if(T.kind==='ocean'&&i%2){c.fillStyle='#ff7aa8';c.beginPath();c.arc(mx,ty-2*k,4*k,0,7);c.fill()}
 }
}
function drawRoof(c,ti,cx,top,hw){
 const T=THEMES[ti],base=top-hw*.6,tip=top-hw*2.9;
 const g=c.createLinearGradient(cx-hw,0,cx+hw,0);g.addColorStop(0,'#0a0b14');g.addColorStop(.6,T.roof);g.addColorStop(.85,shade(T.roof,.2));g.addColorStop(1,'#0a0b14');
 c.fillStyle=g;c.beginPath();c.moveTo(cx-hw*.98,base);c.quadraticCurveTo(cx-hw*.3,base-hw*.7,cx,tip);c.quadraticCurveTo(cx+hw*.3,base-hw*.7,cx+hw*.98,base);c.quadraticCurveTo(cx,base+hw*.28,cx-hw*.98,base);c.fill();
 c.strokeStyle='rgba(0,0,0,.3)';c.lineWidth=.8;for(let i=1;i<5;i++){const yy=base-(base-tip)*i/5,ww=hw*.98*(1-i/5.5);c.beginPath();c.moveTo(cx-ww,yy+hw*.1);c.quadraticCurveTo(cx,yy+hw*.25,cx+ww,yy+hw*.1);c.stroke()}
 if(ti===2){c.fillStyle='rgba(240,250,255,.9)';c.beginPath();c.moveTo(cx-hw*.98,base);c.quadraticCurveTo(cx,base+hw*.28,cx+hw*.98,base);c.quadraticCurveTo(cx,base-hw*.25,cx-hw*.98,base);c.fill()}
 c.strokeStyle='#c9a24a';c.lineWidth=1.2;c.beginPath();c.moveTo(cx,tip);c.lineTo(cx,tip-hw*.35);c.stroke();
 c.save();c.shadowColor=ti===4?'#5ad0ff':T.win;c.shadowBlur=10;c.fillStyle=ti===4?'#9ae8ff':'#ffd98a';c.beginPath();c.moveTo(cx,tip-hw*.7);c.lineTo(cx+hw*.12,tip-hw*.45);c.lineTo(cx,tip-hw*.25);c.lineTo(cx-hw*.12,tip-hw*.45);c.fill();c.restore();
}
// miniaturas do "Conceito Visual": torres altas com telhado, como na arte de referência
function drawThumb(c,ti){
 const w=c.canvas.width,h=c.canvas.height,T=THEMES[ti],R=rng(ti*7+3);
 if(T.kind)paintSkyKind(c,ti,w,h,5+ti*17);
 else{
  const k=w/W;let g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,T.sky[0]);g.addColorStop(.6,T.sky[1]);g.addColorStop(1,T.sky[2]);c.fillStyle=g;c.fillRect(0,0,w,h);
  const mg=c.createRadialGradient(w*.78,h*.12,2,w*.78,h*.12,w*.4);mg.addColorStop(0,T.sun?'rgba(255,230,160,.5)':'rgba(230,225,255,.45)');mg.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=mg;c.fillRect(0,0,w,h);
  c.fillStyle=T.sun?'#fff0c0':'#f4f0ff';c.beginPath();c.arc(w*.78,h*.12,w*.09,0,6.283);c.fill();
  c.fillStyle='#fff';for(let i=0;i<26*T.stars;i++){c.globalAlpha=.3+R()*.7;c.fillRect(R()*w,R()*h*.5,1.1,1.1)}c.globalAlpha=1;
  paintRidge(c,ridge(R,w,h*.78,h*.2,.55),h,shade(T.m1,.1),T.m2,hexA('#cfd8ff',.3),ti===2);
 }
 const cx=w/2,top=h*.34,hw=w*.19;
 drawTowerBody(c,ti,cx,top,h,hw,{windows:'many'});drawTowerFront(c,ti,cx,top,hw);drawRoof(c,ti,cx,top,hw);
 if(ti===3){c.fillStyle='#1e4a22';c.beginPath();c.ellipse(cx-hw*1.5,h-6,hw*.9,hw*.6,0,0,7);c.ellipse(cx+hw*1.6,h-4,hw*.8,hw*.5,0,0,7);c.fill()}
 const g=c.createLinearGradient(0,h*.85,0,h);g.addColorStop(0,'rgba(10,8,30,0)');g.addColorStop(1,'rgba(10,8,30,.6)');c.fillStyle=g;c.fillRect(0,h*.85,w,h*.15);
}
// cache do corpo e das ameias frontais da torre do jogo (o estandarte é animado ao vivo)
const TOWER_OX=TX-THW-28,TOWER_OY=TTOP-48,towerCache=new Map();
const WIN_GLOW={x:TX-30,y:TTOP+72};
function towerSprites(ti){
 let s=towerCache.get(ti);
 if(!s){const body=mkCanvas(THW*2+56,H-TOWER_OY),front=mkCanvas(THW*2+56,100);
  let c=body.getContext('2d');c.translate(-TOWER_OX,-TOWER_OY);drawTowerBody(c,ti,TX,TTOP,H,THW);
  c=front.getContext('2d');c.translate(-TOWER_OX,-TOWER_OY);drawTowerFront(c,ti,TX,TTOP,THW);
  s={body,front};towerCache.set(ti,s)}
 return s;
}
// estandarte de pano tremulando ao vento, com borda dourada e o emblema da pata
function bannerPath(c,x,y,w,h,s,s2,s3){c.beginPath();c.moveTo(x-w/2,y);c.lineTo(x+w/2,y);c.quadraticCurveTo(x+w/2+s*1.6,y+h*.5,x+w/2+s2*2.6,y+h);c.lineTo(x+s3,y+h-9);c.lineTo(x-w/2+s2*2.6,y+h);c.quadraticCurveTo(x-w/2+s*1.6,y+h*.5,x-w/2,y);c.closePath()}
const _bannerGrad=new Map(); // um gradiente por personagem, criado uma vez
function bannerGrad(c,ch,x,w){let g=_bannerGrad.get(ch.id);if(!g){g=c.createLinearGradient(x-w/2,0,x+w/2,0);g.addColorStop(0,ch.robeDark);g.addColorStop(.55,ch.robe);g.addColorStop(1,shade(ch.robeDark,-.2));_bannerGrad.set(ch.id,g)}return g}
function drawBanner(c,ch){
 const x=TX+30,y=TTOP+20,w=26,h=52,s=Math.sin(T*2.3),s2=Math.sin(T*2.3+1.2),s3=Math.sin(T*3.1);
 bannerPath(c,x,y,w,h,s,s2,s3);c.fillStyle=bannerGrad(c,ch,x,w);c.fill();
 c.fillStyle='rgba(0,0,0,.18)';c.beginPath();c.moveTo(x-2+s,y+4);c.quadraticCurveTo(x-1+s*1.5,y+h*.5,x+s3,y+h-10);c.lineTo(x+4+s3,y+h-12);c.quadraticCurveTo(x+3+s*1.5,y+h*.5,x+3+s,y+4);c.fill(); // dobra
 bannerPath(c,x,y,w,h,s,s2,s3);c.strokeStyle='#e8b86a';c.lineWidth=2;c.stroke();
 c.strokeStyle='rgba(255,217,138,.45)';c.lineWidth=1;c.strokeRect(x-w/2+4,y+4,w-8,h-22);
 const ex=x+s*.9,ey=y+24;c.strokeStyle='#e8b86a';c.lineWidth=1.3;c.beginPath();c.arc(ex,ey,9,0,6.283);c.stroke();
 c.fillStyle='#f4ecd8';c.beginPath();c.ellipse(ex,ey+2.5,4.5,3.6,0,0,6.283);c.fill();for(let i=0;i<4;i++){c.beginPath();c.arc(ex+BANNER_PAW[i][0],ey+BANNER_PAW[i][1],1.9,0,6.283);c.fill()}
 c.fillStyle='#c9a24a';c.fillRect(x-w/2-4,y-2,w+8,3.2);c.fillStyle='#ffd98a';c.beginPath();c.arc(x-w/2-4,y-.4,2.4,0,6.283);c.arc(x+w/2+4,y-.4,2.4,0,6.283);c.fill(); // haste
}
const TORCH_COL=['#ff5a1a','#ffb040','#fff2a0'],TORCH_S=[1,.7,.38],BANNER_PAW=[[-5,-2.5],[-1.8,-5.6],[1.8,-5.6],[5,-2.5]];
function drawTorch(c,x,y){
 c.fillStyle='#2a1c10';c.fillRect(x-1.6,y,3.2,9);c.fillStyle='#6a5030';c.beginPath();c.ellipse(x,y,5,2.4,0,0,6.283);c.fill();
 const f=1+.15*Math.sin(T*17+x)+.1*Math.sin(T*23+x*.3);
 c.globalCompositeOperation='lighter';c.drawImage(softGlow('#ffa040'),(x-34)|0,(y-44)|0,68,68);
 for(let i=0;i<3;i++){const col=TORCH_COL[i],s=TORCH_S[i];c.fillStyle=col;c.beginPath();c.moveTo(x-4*s,y);c.quadraticCurveTo(x-5*s,y-8*s*f,x+Math.sin(T*9+x)*1.6,y-15*s*f);c.quadraticCurveTo(x+5*s,y-8*s*f,x+4*s,y);c.fill()}
 c.globalCompositeOperation='source-over';
}
let _shadowGrad=null,_floorGrad=null; // gradientes fixos: criados uma vez
function drawTowerShadow(c){
 if(!_shadowGrad){_shadowGrad=c.createRadialGradient(TX,H,THW*.6,TX,H,THW*2.6);_shadowGrad.addColorStop(0,'rgba(0,0,10,.55)');_shadowGrad.addColorStop(1,'rgba(0,0,10,0)')}
 c.fillStyle=_shadowGrad;c.fillRect(TX-THW*2.6,H-THW*1.6,THW*5.2,THW*1.6);
}
// aura de magia: partículas flutuando ao redor do topo da torre
function drawAura(c,col){
 if(!PERF.hq)return;c.globalCompositeOperation='lighter';const sp=starSprite(col);
 for(const m of MOTES){const a=m.a+T*m.sp,ph=(T*.12+m.ph)%1,x=TX+Math.cos(a)*m.r,y=TTOP-6-ph*m.rise*6+Math.sin(a)*m.r*.22;c.globalAlpha=Math.sin(ph*Math.PI)*.75;const d=(m.s*7)|0;c.drawImage(sp,(x-d/2)|0,(y-d/2)|0,d,d)}
 c.globalAlpha=1;c.globalCompositeOperation='source-over';
}
function drawLighting(c,col){
 const tip=staffTip(castGlow),p=.5+.5*Math.sin(T*4);
 c.globalCompositeOperation='lighter';
 const R=((PERF.hq?120:80)+castGlow*(PERF.hq?100:60))|0;c.globalAlpha=Math.min(1,.7+.2*p+castGlow*.3);c.drawImage(softGlow(col),(tip.x-R)|0,(tip.y-R)|0,R*2,R*2);
 const gs=(26+p*12+castGlow*20)|0;c.globalAlpha=1;c.drawImage(glowSprite(col),(tip.x-gs/2)|0,(tip.y-gs/2)|0,gs,gs);   // brilho da gema
 const sp=starSprite(col);for(let i=0;i<3;i++){const a=T*2.4+i*2.09,r=11+Math.sin(T*3+i)*2,d=(6+Math.sin(T*5+i)*2)|0;c.drawImage(sp,(tip.x+Math.cos(a)*r-d/2)|0,(tip.y+Math.sin(a)*r*.7-d/2)|0,d,d)} // poeira estelar orbitando
 c.globalCompositeOperation='source-over';
 if(!_floorGrad){_floorGrad=c.createLinearGradient(0,H-80,0,H);_floorGrad.addColorStop(0,'rgba(8,6,24,0)');_floorGrad.addColorStop(1,'rgba(8,6,24,.6)')}c.fillStyle=_floorGrad;c.fillRect(0,H-80,W,80);
}
// skin escolhida no perfil (se desbloqueada) ou a torre do bioma atual
function towerSkinIdx(){const k=profile.towerSkin,s=TOWER_SKINS[k];return s&&profile.level>=s.l?s.ti:themeIdx}
function drawTowerAndMage(c,ch,col){
 drawTowerShadow(c);
 const ts=towerSprites(towerSkinIdx());c.drawImage(ts.body,TOWER_OX,TOWER_OY);
 const TH=THEMES[themeIdx];
 if(TH.kind!=='ocean'){c.globalCompositeOperation='lighter';c.globalAlpha=.45+.2*Math.sin(T*7.3)*Math.sin(T*3.1+1);c.drawImage(softGlow(TH.win),WIN_GLOW.x-30,WIN_GLOW.y-30,60,60);c.globalAlpha=1;c.globalCompositeOperation='source-over'} // luz da janela tremulando
 drawBanner(c,ch);
 drawWizardLit(c,ch,T,castGlow,col,PERF.hq);
 c.drawImage(ts.front,TOWER_OX,TOWER_OY);
 if(TH.kind!=='ocean'){drawTorch(c,TX-71,TTOP-12);drawTorch(c,TX+71,TTOP-12)}
 drawAura(c,col);
 drawLighting(c,col);
}

// ================== MAGO ANIMAL (de costas / perfil 3/4) ==================
const STAFF_BASE={x:26,y:6},STAFF_LEN=100,GEM_LOCAL={x:13,y:-108};
const _tip={x:0,y:0}; // reutilizado: staffTip é chamado todo quadro (sem alocar)
function staffTip(cast){const a=-cast*.25,bx=TX+STAFF_BASE.x+cast*2,by=TTOP+4+STAFF_BASE.y-cast*8;_tip.x=bx+GEM_LOCAL.x*Math.cos(a)-GEM_LOCAL.y*Math.sin(a);_tip.y=by+GEM_LOCAL.x*Math.sin(a)+GEM_LOCAL.y*Math.cos(a);return _tip}
// gema lapidada (facetas + reflexo); o brilho é desenhado à parte, direto no canvas principal
function drawGem(c,x,y,s,col){
 const g=c.createLinearGradient(x-s,y-s*1.5,x+s,y+s*1.4);g.addColorStop(0,'#ffffff');g.addColorStop(.35,col);g.addColorStop(1,shade(col,-.5));
 c.fillStyle=g;c.beginPath();c.moveTo(x,y-s*1.5);c.lineTo(x+s,y-s*.3);c.lineTo(x+s*.6,y+s*.9);c.lineTo(x,y+s*1.4);c.lineTo(x-s*.6,y+s*.9);c.lineTo(x-s,y-s*.3);c.closePath();c.fill();
 c.strokeStyle='rgba(255,255,255,.55)';c.lineWidth=.8;c.beginPath();c.moveTo(x-s,y-s*.3);c.lineTo(x,y+s*.1);c.lineTo(x+s,y-s*.3);c.moveTo(x,y-s*1.5);c.lineTo(x,y+s*1.4);c.stroke();
 c.fillStyle='rgba(255,255,255,.9)';c.beginPath();c.moveTo(x-s*.45,y-s*.6);c.lineTo(x-s*.1,y-s*1.1);c.lineTo(x-s*.05,y-s*.45);c.fill();
}
// cajado de madeira entalhada: haste afunilada, entalhes em espiral, nós, anel dourado e garras segurando a gema
function drawStaff(c,len,col){
 const tx=12,ty=-len,ang=Math.atan2(ty,tx),nx=Math.cos(ang+Math.PI/2),ny=Math.sin(ang+Math.PI/2);
 c.beginPath();c.moveTo(nx*3.4,ny*3.4);c.lineTo(tx+nx*2.4,ty+ny*2.4);c.lineTo(tx-nx*2.4,ty-ny*2.4);c.lineTo(-nx*3.4,-ny*3.4);c.closePath();
 const g=c.createLinearGradient(-4,0,4,0);g.addColorStop(0,'#3a2412');g.addColorStop(.55,'#9a6a3a');g.addColorStop(1,'#4a2c14');c.fillStyle=g;c.fill();
 c.strokeStyle='rgba(30,16,6,.75)';c.lineWidth=1;c.beginPath();for(let k=.1;k<.8;k+=.065){const px=tx*k,py=ty*k;c.moveTo(px-nx*3,py-ny*3+2.5);c.lineTo(px+nx*3,py+ny*3-1.5)}c.stroke();
 c.fillStyle='#5a3a1c';for(const k of[.3,.58]){c.beginPath();c.ellipse(tx*k+1.6,ty*k,1.7,2.6,0,0,6.283);c.fill()}
 c.strokeStyle='#e8b86a';c.lineWidth=2.2;for(const k of[.8,.86]){c.beginPath();c.moveTo(tx*k-nx*3.2,ty*k-ny*3.2);c.lineTo(tx*k+nx*3.2,ty*k+ny*3.2);c.stroke()}
 drawGem(c,GEM_LOCAL.x,GEM_LOCAL.y,5.6,col);
 c.strokeStyle='#7a4e28';c.lineWidth=2.2;c.lineCap='round';c.beginPath();
 c.moveTo(tx,ty+1);c.quadraticCurveTo(tx-9,ty-4,tx-4,ty-14);c.moveTo(tx,ty+1);c.quadraticCurveTo(tx+10,ty-3,tx+6,ty-14);c.moveTo(tx,ty+1);c.quadraticCurveTo(tx+2,ty-5,tx+1,ty-3);c.stroke();
 c.fillStyle='#e8b86a';c.beginPath();c.arc(tx-4,ty-14,1.3,0,6.283);c.arc(tx+6,ty-14,1.3,0,6.283);c.fill();
}
function drawWizard(c,x,y,ch,t,cast,col){
 const fur=ch.fur,br=Math.sin(t*2.2),sway=Math.sin(t*1.7),furL=shade(fur,.28),furD=shade(fur,-.32),hem=i=>Math.sin(t*1.7+i*1.3)*2.2;
 c.save();c.translate(x+cast*2,y);c.lineCap='round';c.lineJoin='round';
 c.fillStyle='rgba(0,0,0,.45)';c.beginPath();c.ellipse(4,2,30,7,0,0,6.283);c.fill();
 // cauda (atrás da capa), balançando ao vento
 if(ch.id==='gato'){c.strokeStyle=fur;c.lineWidth=6;c.beginPath();c.moveTo(-12,-8);c.bezierCurveTo(-30,-6,-42+sway*3,-22,-35+sway*5,-38);c.stroke();c.strokeStyle=furD;c.beginPath();c.moveTo(-37+sway*4.6,-32);c.lineTo(-35+sway*5,-38);c.stroke()}
 if(ch.id==='raposa'){c.save();c.translate(-22,-14);c.rotate(-.95+sway*.12);const g=c.createLinearGradient(0,-26,0,22);g.addColorStop(0,'#ffffff');g.addColorStop(.26,'#fff4ea');g.addColorStop(.32,fur);g.addColorStop(1,furD);c.fillStyle=g;c.beginPath();c.ellipse(0,0,12.5,25,0,0,6.283);c.fill();c.restore()}
 if(ch.id==='coelho'){c.fillStyle='#ffffff';c.beginPath();c.arc(1,-14,7,0,6.283);c.fill()}
 if(ch.id==='coruja'){c.fillStyle=furD;for(let i=-2;i<=2;i++){c.beginPath();c.ellipse(i*4.5,-6+Math.abs(i),3,9,i*.25,0,6.283);c.fill()}}
 // capa (com respiração)
 c.save();c.scale(1+br*.006,1+br*.012+cast*.03);
 let g=c.createLinearGradient(-28,0,28,0);g.addColorStop(0,shade(ch.robeDark,-.3));g.addColorStop(.35,ch.robeDark);g.addColorStop(.62,ch.robe);g.addColorStop(.82,shade(ch.robe,.2));g.addColorStop(1,ch.robeDark);
 c.fillStyle=g;c.beginPath();c.moveTo(-15,-52);c.quadraticCurveTo(-25,-30,-27+hem(0),-2);
 c.quadraticCurveTo(-18,2+hem(1),-9,-1);c.quadraticCurveTo(0,3+hem(2),9,-1);c.quadraticCurveTo(18,2+hem(3),27+hem(4),-2);c.quadraticCurveTo(25,-30,15,-52);c.closePath();c.fill();
 c.strokeStyle='rgba(0,0,0,.32)';c.lineWidth=2;c.beginPath();                                                       // dobras
 c.moveTo(-8,-48);c.quadraticCurveTo(-14,-26,-15+hem(1)*.6,-2);c.moveTo(3,-49);c.quadraticCurveTo(1,-26,hem(2)*.6,0);c.moveTo(12,-47);c.quadraticCurveTo(17,-24,18+hem(3)*.6,-2);c.stroke();
 c.strokeStyle='rgba(255,255,255,.1)';c.lineWidth=1.6;c.beginPath();c.moveTo(-4,-48);c.quadraticCurveTo(-7,-26,-6,-2);c.moveTo(7,-48);c.quadraticCurveTo(9,-26,9,-1);c.stroke();
 c.strokeStyle='#e8b86a';c.lineWidth=2.6;c.beginPath();c.moveTo(-27+hem(0),-3);c.quadraticCurveTo(-18,1+hem(1),-9,-2);c.quadraticCurveTo(0,2+hem(2),9,-2);c.quadraticCurveTo(18,1+hem(3),27+hem(4),-3);c.stroke(); // barra dourada
 c.strokeStyle='rgba(255,230,160,.55)';c.lineWidth=1;c.setLineDash([2,3]);c.beginPath();c.moveTo(-26+hem(0),-7);c.quadraticCurveTo(-18,-3+hem(1),-9,-6);c.quadraticCurveTo(0,-2+hem(2),9,-6);c.quadraticCurveTo(18,-3+hem(3),26+hem(4),-7);c.stroke();c.setLineDash([]);
 c.fillStyle=ch.robeDark;c.beginPath();c.ellipse(-17,-36,6,11,.3,0,6.283);c.fill();                               // braço esquerdo sob a capa
 c.fillStyle=shade(ch.robeDark,-.25);c.beginPath();c.ellipse(1,-52,17,6,0,0,6.283);c.fill();                       // gola
 c.strokeStyle='#e8b86a';c.lineWidth=1.2;c.beginPath();c.arc(1,-50,13,.15*Math.PI,.85*Math.PI);c.stroke();
 if(ch.id==='raposa'){c.fillStyle='#fff4ea';c.beginPath();c.moveTo(-6,-53);c.quadraticCurveTo(1,-38,8,-53);c.fill()}
 c.fillStyle='#ffd98a';c.beginPath();c.arc(-11,-49,2.3,0,6.283);c.arc(13,-49,2.3,0,6.283);c.fill();
 if(ch.id==='coruja'){c.strokeStyle='#ffd98a';c.lineWidth=1.2;c.beginPath();c.moveTo(-11,-49);c.lineTo(13,-49);c.stroke()}
 c.restore();
 if(ch.id==='coelho'){const fy=-34+Math.sin(t*2.6)*3;c.globalCompositeOperation='lighter';c.drawImage(glowSprite(ch.color),-37,fy-9,18,18);c.globalCompositeOperation='source-over';drawGem(c,-28,fy,2.8,ch.color)} // pedrinha roxa flutuando
 // cabeça em perfil 3/4 (olhando para os inimigos)
 c.save();c.translate(cast*1.5,-br*.9-cast*3);
 const hx=2,hy=-63;
 if(ch.id==='gato'||ch.id==='raposa'){const big=ch.id==='raposa'?1.25:1;for(const s of[-1,1]){c.fillStyle=fur;c.beginPath();c.moveTo(hx+s*6,hy-8);c.lineTo(hx+s*15*big,hy-21*big);c.lineTo(hx+s*14,hy-4);c.fill();c.fillStyle=ch.id==='raposa'?'#2a1810':'#e8a0a8';c.beginPath();c.moveTo(hx+s*10.5,hy-11);c.lineTo(hx+s*15*big,hy-21*big);c.lineTo(hx+s*13.4,hy-8);c.fill()}}
 if(ch.id==='coruja'){c.fillStyle=furD;for(const s of[-1,1]){c.beginPath();c.moveTo(hx+s*8,hy-7);c.lineTo(hx+s*16,hy-18);c.lineTo(hx+s*13,hy-4);c.fill()}}
 if(ch.id==='coruja'){c.fillStyle=ch.robeDark;c.beginPath();c.arc(hx-2,hy+1,17,0,6.283);c.fill()} // capuz verde
 g=c.createRadialGradient(hx+5,hy-5,2,hx,hy,15);g.addColorStop(0,furL);g.addColorStop(1,furD);c.fillStyle=g;c.beginPath();c.arc(hx,hy,13,0,6.283);c.fill();
 if(ch.id==='coruja'){c.fillStyle=shade(fur,.45);c.beginPath();c.ellipse(hx+9,hy+1,6,7,0,0,6.283);c.fill();c.fillStyle='#f6c21a';c.beginPath();c.arc(hx+10,hy-1,3.3,0,6.283);c.fill();c.fillStyle='#120a08';c.beginPath();c.arc(hx+10.6,hy-1,1.7,0,6.283);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(hx+10,hy-2,.7,0,6.283);c.fill();c.fillStyle='#f0c040';c.beginPath();c.moveTo(hx+13,hy+3);c.lineTo(hx+18,hy+5);c.lineTo(hx+13,hy+7);c.fill()}
 else{
  c.fillStyle=ch.id==='coelho'?'#ffffff':ch.id==='raposa'?'#fff4ea':shade(fur,.42);c.beginPath();c.ellipse(hx+11,hy+3,ch.id==='raposa'?8:6.5,ch.id==='raposa'?4.5:5,-.2,0,6.283);c.fill(); // focinho
  c.fillStyle=ch.id==='coelho'?'#f07aa0':'#2a1810';c.beginPath();c.arc(hx+(ch.id==='raposa'?18.5:16.5),hy+1.5,1.9,0,6.283);c.fill();
  c.fillStyle='#120a08';c.beginPath();c.ellipse(hx+8,hy-3,1.7,2.5,-.2,0,6.283);c.fill();c.fillStyle='#ffffff';c.beginPath();c.arc(hx+8.5,hy-4,.75,0,6.283);c.fill();
  if(ch.id==='gato'){c.strokeStyle='rgba(255,255,255,.75)';c.lineWidth=.8;c.beginPath();c.moveTo(hx+15,hy+3);c.lineTo(hx+27,hy);c.moveTo(hx+15,hy+4.5);c.lineTo(hx+27,hy+5);c.stroke()}
  if(ch.id==='coelho'){c.fillStyle='rgba(244,150,190,.5)';c.beginPath();c.arc(hx+6,hy+4,2.4,0,6.283);c.fill()}
 }
 if(ch.id==='gato'){c.strokeStyle=shade(fur,-.38);c.lineWidth=1.6;c.lineCap='round';c.beginPath();c.moveTo(hx-9,hy-4);c.lineTo(hx-4,hy-3);c.moveTo(hx-10,hy+1);c.lineTo(hx-5,hy+1);c.moveTo(hx-8,hy+6);c.lineTo(hx-3,hy+5);c.stroke()} // malhado
 if(ch.id==='coruja'){c.strokeStyle=ch.robe;c.lineWidth=4.5;c.beginPath();c.arc(hx-2,hy+1,15.5,Math.PI*.9,Math.PI*1.72);c.stroke();c.strokeStyle='#e8b86a';c.lineWidth=1;c.beginPath();c.arc(hx-2,hy+1,17.8,Math.PI*.95,Math.PI*1.7);c.stroke()}
 // chapéu cônico (só o gato): aba larga + cone com a ponta dobrada que balança
 const flop=Math.sin(t*1.8)*3-cast*3;
 if(ch.id==='gato'){c.save();c.translate(hx,hy-9);c.rotate(-.08+cast*.05);
 c.fillStyle='rgba(0,0,0,.3)';c.beginPath();c.ellipse(1,3,24,6,0,0,6.283);c.fill();                               // sombra da aba na cabeça
 g=c.createLinearGradient(0,-6,0,7);g.addColorStop(0,shade(ch.robe,.12));g.addColorStop(1,shade(ch.robeDark,-.35));c.fillStyle=g;c.beginPath();c.ellipse(0,0,27,7.5,0,0,6.283);c.fill();
 c.strokeStyle='rgba(255,255,255,.14)';c.lineWidth=1;c.beginPath();c.ellipse(0,-.5,26,7,0,Math.PI*1.05,Math.PI*1.95);c.stroke();
 g=c.createLinearGradient(-15,0,15,0);g.addColorStop(0,shade(ch.robeDark,-.25));g.addColorStop(.6,ch.robe);g.addColorStop(.85,shade(ch.robe,.22));g.addColorStop(1,ch.robeDark);c.fillStyle=g;
 c.beginPath();c.moveTo(-14,-2);c.bezierCurveTo(-11,-16,-9,-30,-8,-38);c.quadraticCurveTo(-12+flop,-48,-25+flop*1.3,-44);c.quadraticCurveTo(-11+flop,-41,-1,-35);c.bezierCurveTo(5,-26,10,-14,14,-2);c.closePath();c.fill();
 c.strokeStyle='rgba(0,0,0,.28)';c.lineWidth=1.6;c.beginPath();c.moveTo(-6,-4);c.quadraticCurveTo(-4,-22,-5,-35);c.stroke();
 c.strokeStyle='#e8b86a';c.lineWidth=4;c.beginPath();c.moveTo(-13.5,-5);c.quadraticCurveTo(0,-1,13.5,-5);c.stroke();
 c.fillStyle='#ffd98a';c.fillRect(4,-8,5,6);c.fillStyle=ch.robeDark;c.fillRect(5.5,-6.5,2,3);
 c.fillStyle='rgba(255,217,138,.85)';for(const[sx,sy]of[[-7,-14],[5,-18],[-3,-27],[-12+flop,-40]]){c.beginPath();c.arc(sx,sy,.95,0,6.283);c.fill()}
 c.restore();}
 if(ch.id==='coelho'){for(const[dx,r]of[[-6,-.35],[8,.2]]){c.save();c.translate(hx+dx,hy-14);c.rotate(r+Math.sin(t*2+dx)*.07);c.fillStyle=fur;c.beginPath();c.ellipse(0,-14,5,16,0,0,6.283);c.fill();c.fillStyle='#f4b0c8';c.beginPath();c.ellipse(.5,-13,2.2,11,0,0,6.283);c.fill();c.restore()}}
 c.restore();
 // cajado + braço direito segurando
 const bx=STAFF_BASE.x,by=STAFF_BASE.y-cast*8,a=-cast*.25,lpx=6,lpy=-50;
 const hpx=bx+lpx*Math.cos(a)-lpy*Math.sin(a),hpy=by+lpx*Math.sin(a)+lpy*Math.cos(a);
 c.save();c.translate(bx,by);c.rotate(a);drawStaff(c,STAFF_LEN,col);c.restore();
 c.strokeStyle=ch.robe;c.lineWidth=9;c.beginPath();c.moveTo(12,-44-br*.6);c.quadraticCurveTo(hpx+2,-41,hpx-1,hpy+6);c.stroke();
 c.strokeStyle='rgba(0,0,0,.25)';c.lineWidth=2;c.beginPath();c.moveTo(14,-40);c.quadraticCurveTo(hpx,-37,hpx-2,hpy+9);c.stroke();
 c.fillStyle=ch.robeDark;c.beginPath();c.ellipse(hpx,hpy+6,6.5,4.5,-.4,0,6.283);c.fill();c.strokeStyle='#e8b86a';c.lineWidth=1.6;c.stroke();
 c.fillStyle=fur;c.beginPath();c.arc(hpx,hpy,4.7,0,6.283);c.fill();c.fillStyle=furD;c.beginPath();c.arc(hpx+1.2,hpy+1.6,2.2,0,6.283);c.fill();
 c.restore();
}
// mago com sombra projetada e contorno de luz SEM shadowBlur: silhueta tingida em canvas pequenos
const WZ_W=200,WZ_H=175,WZ_OX=80,WZ_OY=150,wizCv=mkCanvas(WZ_W,WZ_H),wizCx=wizCv.getContext('2d'),tintCv=mkCanvas(WZ_W,WZ_H),tintCx=tintCv.getContext('2d'),shadowCv=mkCanvas(WZ_W,WZ_H),shadowCx=shadowCv.getContext('2d');
function tintInto(dx,dst,src,col){dx.globalCompositeOperation='source-over';dx.clearRect(0,0,WZ_W,WZ_H);dx.drawImage(src,0,0);dx.globalCompositeOperation='source-in';dx.fillStyle=col;dx.fillRect(0,0,WZ_W,WZ_H);dx.globalCompositeOperation='source-over';return dst}
const tintFrom=(src,col)=>tintInto(tintCx,tintCv,src,col);
// o mago é redesenhado (com sombra e contorno tingidos) a 30 Hz quando parado e a cada quadro durante o feitiço;
// nos outros quadros só os 3–4 drawImage dos caches são feitos → ~3 tingimentos a menos por quadro
let wizTick=0,wizCh=null,wizCol='',wizHq=null;
function drawWizardLit(c,ch,t,cast,col,hq){
 const ox=TX-WZ_OX,oy=TTOP+4-WZ_OY;
 if((wizTick++&1)===0||cast>.02||ch!==wizCh||col!==wizCol||hq!==wizHq){wizCh=ch;wizCol=col;wizHq=hq;
  wizCx.clearRect(0,0,WZ_W,WZ_H);wizCx.save();wizCx.translate(-ox,-oy);drawWizard(wizCx,TX,TTOP+4,ch,t,cast,col);wizCx.restore();
  tintInto(shadowCx,shadowCv,wizCv,'#000');if(hq)tintFrom(wizCv,col);
 }
 c.globalAlpha=.45;c.drawImage(shadowCv,ox+4,oy+5);
 if(hq){c.globalCompositeOperation='lighter';c.globalAlpha=.32+cast*.3;c.drawImage(tintCv,ox-1.5,oy);c.drawImage(tintCv,ox+1.5,oy-1);c.globalCompositeOperation='source-over'}
 c.globalAlpha=1;c.drawImage(wizCv,ox,oy);
}
