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
 g=c.createLinearGradient(0,H-340,0,H-150);g.addColorStop(0,hexA(T.neb,0));g.addColorStop(.62,hexA(mix(T.neb,'#ffffff',.35),.15));g.addColorStop(1,hexA(T.neb,0));c.fillStyle=g;c.fillRect(0,H-340,W,190); // 🌫️ brilho do horizonte (dispersão): dá distância às serras
 // montanhas distantes (camada de parallax lenta) + névoa na base
 const f=farCv.getContext('2d');f.clearRect(0,0,farCv.width,H);
 paintRidge(f,ridge(R,farCv.lw,H-235,120,.58),H,shade(T.m1,.12),shade(T.m2,.05),hexA(T.sun?'#fff0c0':'#cfd8ff',.35),ti===2);
 f.save();f.globalCompositeOperation='source-atop';g=f.createLinearGradient(0,H-360,0,H);g.addColorStop(0,hexA(T.sky[1],0));g.addColorStop(.5,hexA(T.sky[1],.26));g.addColorStop(1,hexA(T.sky[2],.42));f.fillStyle=g;f.fillRect(0,0,farCv.lw,H);f.restore(); // 🏔️ perspectiva aérea: o pé da serra distante some na cor do céu
 fogBand(f,H-200,34,T.neb,.16);
 // montanhas próximas (camada rápida)
 const n=nearCv.getContext('2d');n.clearRect(0,0,nearCv.width,H);
 const np=ridge(R,nearCv.lw,H-160,85,.55);paintRidge(n,np,H,shade(T.m2,.05),shade(T.m2,-.45),hexA('#cfd8ff',.18),false);
 if(ti===3){n.fillStyle=shade(T.m2,-.5);for(let i=0;i<26;i++){const x=R()*nearCv.lw,p=np[Math.min(np.length-1,Math.round(x/nearCv.lw*(np.length-1)))],y=p[1]+6,hh=14+R()*20;n.beginPath();n.moveTo(x,y-hh);n.lineTo(x-hh*.3,y);n.lineTo(x+hh*.3,y);n.fill()}}
 n.save();n.globalCompositeOperation='source-atop';g=n.createLinearGradient(0,H-250,0,H);g.addColorStop(0,hexA(T.sky[2],.16));g.addColorStop(.35,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(2,2,14,.5)');n.fillStyle=g;n.fillRect(0,0,nearCv.lw,H);n.restore(); // serra próxima: cume com véu do céu, base funda (contraste de profundidade)
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
  drawBattleDust(c,dt,12);
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
 drawBattleDust(c,dt,BDUST.length);
}
// ✨ poeira mágica do campo de batalha: deriva devagar e acende ao cruzar o cone de luz da lua (raysCv)
//  Anel fixo (sem alocação); cor segue a luz da cena: dourada na ⚡ Sobrecarga, gelo no ❄️ Congelar.
const BDUST=Array.from({length:DeviceManager.isMobile?14:34},()=>({x:Math.random()*W,y:Math.random()*H,ph:Math.random()*6.283,sp:rand(.5,1.3),s:rand(2.6,5.4)}));
function drawBattleDust(c,dt,n){
 const L=SCENE_LIGHT,ocean=THEMES[themeIdx].kind==='ocean',col=L.ov>.5?'#ffd98a':L.fz>.5?'#cff4ff':ocean?'#c8fff6':'#e8e4ff';
 c.globalCompositeOperation='lighter';const sp=glowSprite(col);
 for(let i=0;i<n;i++){const d=BDUST[i];
  d.x+=Math.sin(T*.6*d.sp+d.ph)*7*dt;d.y-=(3+d.sp*5)*dt*(ocean?2.4:1);if(d.y<-10){d.y=H+10;d.x=Math.random()*W}
  const k=(d.y-MOON.y)/(H-MOON.y),cx=MOON.x+(TX-MOON.x)*k,lit=ocean?.5:Math.max(0,1-Math.abs(d.x-cx)/(50+Math.max(0,k)*230)); // dentro do cone de luz = mais forte
  c.globalAlpha=(.12+lit*.6+L.ov*.15)*(.45+.55*Math.sin(T*2.1*d.sp+d.ph)**2);const s=d.s*(.85+lit*.4);c.drawImage(sp,(d.x-s/2)|0,(d.y-s/2)|0,s|0,s|0)}
 c.globalAlpha=1;c.globalCompositeOperation='source-over';
}
// 💡 luz da cena sincronizada com os feitiços (valores suavizados: sobem rápido, descem devagar)
//   ❄️ Congelar → a tela esfria (multiply azulado) · ⚡ Sobrecarga → pulso dourado/rosa no ritmo da moldura (.stage.overload)
//   💥 Arcana → clarão branco que se expande a partir da gema e banha o campo
const SCENE_LIGHT={fz:0,ov:0,lt:0};
function sceneLightTick(){
 const L=SCENE_LIGHT,dt=Math.max(0,Math.min(.1,T-L.lt)),f=G&&G.frozen>0?1:0,o=G&&G.over?1:0;L.lt=T;
 L.fz+=(f-L.fz)*Math.min(1,dt*(f>L.fz?6:2.5));L.ov+=(o-L.ov)*Math.min(1,dt*(o>L.ov?5:2));
}
function drawSceneGrade(c){
 const L=SCENE_LIGHT,A=WIZ_ANIM;if(L.fz<.01&&L.ov<.01&&A.arcana<=0)return;
 if(L.fz>.01){c.globalCompositeOperation='multiply';c.globalAlpha=L.fz*.5;c.fillStyle='#b4d2ff';c.fillRect(0,0,W,H);c.globalCompositeOperation='lighter';c.globalAlpha=L.fz*.2;c.fillStyle='#16324a';c.fillRect(0,0,W,H)}
 if(L.ov>.01){const p=.5+.5*Math.sin(T*5.7);c.globalCompositeOperation='lighter';c.globalAlpha=L.ov*(.12+.08*p);c.drawImage(softGlow('#ffc43c'),TX-330,TTOP-260,660,620);c.globalAlpha=L.ov*(.05+.05*(1-p));c.drawImage(softGlow('#ff6ed2'),-120,-80,W+240,H*.8)}
 if(A.arcana>0){const tip=staffTip(castGlow),k=A.arcana,r=(240+(1-k)*300)|0;c.globalCompositeOperation='lighter';c.globalAlpha=k*.5;c.drawImage(softGlow('#ffffff'),(tip.x-r)|0,(tip.y-r)|0,r*2,r*2)}
 c.globalAlpha=1;c.globalCompositeOperation='source-over';
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
  if(i===0)continue; // vão (seteira) no centro da muralha da frente: o mago aparece de corpo inteiro, sem uma ameia na frente dele
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
// 💡 contraluz da gema nas ameias: a luz do cristal só pinta a PEDRA da frente da torre (o desenho das ameias vira máscara
//  com 'source-in'), mais forte perto da gema, ao lançar e na Sobrecarga; gelada enquanto o campo está congelado.
//  Só na qualidade alta (no modo leve/celular fica de fora: são 2 cópias de uma faixa pequena por quadro)
let merlCv=null,merlCx=null;
function drawGemOnMerlons(c,front,col){
 if(!PERF.hq)return;
 if(!merlCv){merlCv=mkCanvas(front.lw,front.lh);merlCx=merlCv.getContext('2d')}
 const tp=staffTip(castGlow),gx=tp.x-TOWER_OX,gy=tp.y-TOWER_OY,w=merlCv.lw,h=merlCv.lh,L=SCENE_LIGHT;
 const k=Math.min(1,.32+castGlow*.45+WIZ_ANIM.strike*.2+L.ov*.18+.05*Math.sin(T*1.8)),cc=L.fz>.5?mix(col,'#aef0ff',.5):col;
 merlCx.globalCompositeOperation='source-over';merlCx.clearRect(0,0,w,h);merlCx.drawImage(front,0,0,w,h);
 merlCx.globalCompositeOperation='source-in';const g=merlCx.createRadialGradient(gx,gy,6,gx,gy,150);g.addColorStop(0,hexA(cc,k));g.addColorStop(.45,hexA(cc,k*.35));g.addColorStop(1,hexA(cc,0));
 merlCx.fillStyle=g;merlCx.fillRect(0,0,w,h);merlCx.globalCompositeOperation='source-over';
 c.globalCompositeOperation='lighter';c.drawImage(merlCv,TOWER_OX,TOWER_OY,w,h);c.globalCompositeOperation='source-over';
}
function drawLighting(c,col){
 // 🎭 gema: pulso CALMO no repouso (~0,3 Hz); no perigo pulsa rápido e mais forte; no triunfo dá um clarão
 const A=WIZ_ANIM,d=A.danger,tr=A.triumph>0?Math.sin(Math.PI*Math.min(1,(1-A.triumph)*1.6)):0;
 const tip=staffTip(castGlow),p=.5+.5*Math.sin(T*(1.8+d*7)),boost=d*.5+tr*.9+A.strike*.4+A.freeze*.5;
 if(A.miss>0&&((A.miss*14)|0)%2===0)col='#8a1426'; // ❌ engasgo: a gema pisca vermelho-escuro (2–3 piscadas) e volta à cor
 else if(A.freeze>.35)col='#aef0ff';                // ❄️ gema gelada durante o fincar do cajado
 else if(SCENE_LIGHT.fz>.5)col=mix(col,'#aef0ff',.45); // ❄️ enquanto o campo está congelado a luz da gema fica fria
 const ovb=SCENE_LIGHT.ov*(.25+.15*Math.sin(T*5.7));  // ⚡ Sobrecarga: halo pulsa junto com a moldura
 c.globalCompositeOperation='lighter';
 if(A.arcana>0){const k=1-A.arcana,R2=(40+k*130)|0;c.globalAlpha=Math.min(1,A.arcana*1.3)*.85;c.drawImage(softGlow('#ffffff'),(tip.x-R2)|0,(tip.y-R2)|0,R2*2,R2*2); // 💥 clarão branco que se expande e ilumina o topo da torre
  c.globalAlpha=A.arcana*.45;c.drawImage(softGlow('#fff3e0'),(TX-80)|0,(TTOP-90)|0,160,130)} // área pequena: barato em GPU de celular
 const R=((PERF.hq?120:80)*(1+(boost+ovb)*.35)+castGlow*(PERF.hq?100:60))|0;c.globalAlpha=Math.min(1,.62+.2*p+castGlow*.3+boost*.25);c.drawImage(softGlow(col),(tip.x-R)|0,(tip.y-R)|0,R*2,R*2);
 const gs=(24+p*10+castGlow*20+boost*18)|0;c.globalAlpha=1;c.drawImage(glowSprite(col),(tip.x-gs/2)|0,(tip.y-gs/2)|0,gs,gs);   // brilho da gema
 if(tr>0){const ss=(16+tr*30)|0;c.globalAlpha=tr;c.drawImage(starSprite('#fff3c0'),(tip.x-ss/2)|0,(tip.y-ss/2)|0,ss,ss);c.globalAlpha=1} // ✨ estrela do triunfo
 c.globalAlpha=Math.min(.75,.18+.1*p+castGlow*.25+boost*.15+ovb+SCENE_LIGHT.fz*.12+A.arcana*.4);c.drawImage(softGlow(col),(tip.x-120)|0,(TTOP-16)|0,240,48); // 🔆 halo da gema derramado sobre as ameias
 c.globalAlpha=Math.min(.75,.2+.12*p+castGlow*.4+boost*.2);c.drawImage(glowSprite(col),(tip.x-48)|0,(tip.y-3)|0,96,6);c.globalAlpha=1; // reflexo anamórfico (lente)
 const sp=starSprite(col);for(let i=0;i<3;i++){const a=T*2.4+i*2.09,r=11+Math.sin(T*3+i)*2,d=(6+Math.sin(T*5+i)*2)|0;c.drawImage(sp,(tip.x+Math.cos(a)*r-d/2)|0,(tip.y+Math.sin(a)*r*.7-d/2)|0,d,d)} // poeira estelar orbitando
 c.globalCompositeOperation='source-over';
 if(!_floorGrad){_floorGrad=c.createLinearGradient(0,H-80,0,H);_floorGrad.addColorStop(0,'rgba(8,6,24,0)');_floorGrad.addColorStop(1,'rgba(8,6,24,.6)')}c.fillStyle=_floorGrad;c.fillRect(0,H-80,W,80);
}
// skin escolhida no perfil (se desbloqueada) ou a torre do bioma atual
function towerSkinIdx(){const k=profile.towerSkin,s=TOWER_SKINS[k];return s&&profile.level>=s.l?s.ti:themeIdx}
function drawTowerAndMage(c,ch,col){
 wizAnimTick(); // 🎭 avança estocada / triunfo / postura de perigo (tempo real)
 sceneLightTick(); // 💡 luz da cena acompanha Congelar / Sobrecarga
 drawTowerShadow(c);
 const ts=towerSprites(towerSkinIdx());c.drawImage(ts.body,TOWER_OX,TOWER_OY);
 const TH=THEMES[themeIdx];
 if(TH.kind!=='ocean'){c.globalCompositeOperation='lighter';c.globalAlpha=.45+.2*Math.sin(T*7.3)*Math.sin(T*3.1+1);c.drawImage(softGlow(TH.win),WIN_GLOW.x-30,WIN_GLOW.y-30,60,60);c.globalAlpha=1;c.globalCompositeOperation='source-over'} // luz da janela tremulando
 drawBanner(c,ch);
 if(ch.auraItem||ch.glowTier){c.globalCompositeOperation='lighter';c.globalAlpha=(ch.auraItem?.55:.4)+.2*Math.sin(T*3);c.drawImage(softGlow(ch.glowCol),TX-70,TTOP-110,140,140);c.globalAlpha=1;c.globalCompositeOperation='source-over'}
 drawWizardLit(c,ch,T,castGlow,col,PERF.hq);
 if(TOWER_USE_BACK&&typeof Sprites!=='undefined'&&Sprites.hasBack(ch.id))drawParapet(c); // 🔙 mago de costas: parapeito na frente
 c.drawImage(ts.front,TOWER_OX,TOWER_OY);
 drawGemOnMerlons(c,ts.front,col); // 💡 contraluz da gema pintando as ameias
 if(TH.kind!=='ocean'){drawTorch(c,TX-71,TTOP-12);drawTorch(c,TX+71,TTOP-12)}
 drawAura(c,col);
 drawLighting(c,col);
}

// ================== MAGO ANIMAL (de costas / perfil 3/4) ==================
const STAFF_BASE={x:26,y:6},STAFF_LEN=100,GEM_LOCAL={x:13,y:-108};
const CAPE_FOLDS=[[-10,-17,-15],[-2,-6,-4],[6,7,6],[12,19,17]]; // dobras da capa: [x no ombro, x na barra, x de controle]
let _clothPat=null;
/** trama de sarja 4×4 (diagonal escura + ponto de brilho): textura da túnica, criada uma vez */
function clothPat(c){
 if(_clothPat)return _clothPat;const p=document.createElement('canvas');p.width=p.height=4;const x=p.getContext('2d');
 x.fillStyle='rgba(0,0,0,.16)';for(let i=0;i<4;i++)x.fillRect(i,3-i,1,1);x.fillStyle='rgba(255,255,255,.07)';x.fillRect(0,0,1,1);x.fillRect(2,2,1,1);
 return _clothPat=c.createPattern(p,'repeat');
}
const WIZ_FOOT=TTOP-1; // 🧍 pés do mago no piso da torre (antes TTOP+4: afundava atrás da ameia da frente)
// 🎭 micro-animações do mago (sem andar): estados com curva própria, avançados em TEMPO REAL (T) — a pausa no golpe
//  congela o mundo, mas a estocada do mago continua (é a resposta física à tecla).
//   strike  1→0 em ~0,14 s  estocada do cajado para a frente/cima (4–8 px) a cada palavra (wizStrike, chamado em fire)
//   triumph 1→0 em 1 s      ergue o cajado ao céu + faísca na gema (wizTriumph: onda/mini-chefe vencidos)
//   danger  0…1 suavizado   postura defensiva inclinada, cajado vibrando e brilhando, orelhas recuando (G.dangerLvl)
//   freeze  1→0 em 0,45 s  ❄️ finca o cajado no chão (desce ~3 px em 2 quadros e sobe), pulso de gelo, orelhas/barra "congeladas"
//   arcana  1→0 em 0,6 s   💥 postura de poder: cajado erguido à frente segurado com as DUAS patas + clarão branco na gema
//   miss    1→0 em 0,2 s   ❌ engasgo: pulinho, cabeça sacode (~100 ms), orelhas caem, gema pisca vermelho-escuro
const WIZ_ANIM={strike:0,triumph:0,danger:0,freeze:0,arcana:0,miss:0,lt:0},STRIKE_T=.14,TRIUMPH_T=1,FREEZE_T=.45,ARCANA_T=.6,MISS_T=.2;
function wizStrike(){WIZ_ANIM.strike=1}
function wizFreeze(){
 WIZ_ANIM.freeze=1;if(!G)return;const tp=staffTip(0);
 addRing(tp.x,tp.y,4,80,.5,'#aef0ff');addRing(TX,WIZ_FOOT-1,6,70,.45,'#dff8ff'); // pulso na gema + impacto do cajado no piso
 for(let i=0,n=qn(16);i<n;i++)emit(PT.STAR,TX+rand(-30,30),WIZ_FOOT-rand(4,74),rand(-12,12),-rand(8,26),rand(.7,1.2),i%2?'#dff8ff':'#aef0ff',rand(1,2),1.5,-6); // geada no corpo
}
function wizArcana(){
 WIZ_ANIM.arcana=1;WIZ_ANIM.strike=0;if(!G)return;const tp=staffTip(0);
 addRing(tp.x,tp.y,6,120,.45,'#ffffff');starBurst(tp.x,tp.y,'#ffffff',12,180,0);
}
function wizMiss(){WIZ_ANIM.miss=1}
function wizTriumph(){
 WIZ_ANIM.triumph=1;if(!G)return;const tp=staffTip(0);
 starBurst(tp.x,tp.y-14,'#ffe9a8',14,150,-30);addRing(tp.x,tp.y-14,4,46,.5,'#ffe9a8');[1175,1568,2093].forEach((f,i)=>snd(f,.14,'triangle',.035,0,.12+i*.07));
}
function wizAnimTick(){
 const A=WIZ_ANIM,dt=Math.max(0,Math.min(.1,T-A.lt));A.lt=T;
 A.strike=Math.max(0,A.strike-dt/STRIKE_T);A.triumph=Math.max(0,A.triumph-dt/TRIUMPH_T);
 A.freeze=Math.max(0,A.freeze-dt/FREEZE_T);A.arcana=Math.max(0,A.arcana-dt/ARCANA_T);A.miss=Math.max(0,A.miss-dt/MISS_T);
 const tgt=G&&state==='play'&&G.mode==='arcade'?(G.dangerLvl===2?1:G.dangerLvl===1?.6:0):0;
 A.danger+=(tgt-A.danger)*Math.min(1,dt*(tgt>A.danger?7:3)); // entra rápido, relaxa devagar
}
const wizAnimating=()=>{const A=WIZ_ANIM;return A.strike>0||A.triumph>0||A.freeze>0||A.arcana>0||A.miss>0||A.danger>.02};
const wizFast=()=>{const A=WIZ_ANIM;return A.strike>0||A.triumph>0||A.freeze>0||A.arcana>0||A.miss>0}; // animações curtas: redesenho a cada quadro
// pose = deslocamento do corpo (ox,oy) + base e ângulo do cajado (bx,by,a) + cabeça (hy) + recuo das orelhas (ear).
//  Usada por drawWizard E por staffTip → o raio do feitiço sai sempre da gema, mesmo no meio de uma animação.
//  live=false: pose neutra (quadros pré-renderizados do celular).
//  hx = sacudida da cabeça · still = quanto a barra/orelhas ficam "congeladas" · two = pata secundária no cajado (0…1)
const _pose={ox:0,oy:0,bx:0,by:0,a:0,hy:0,hx:0,ear:0,still:0,two:0};
const envUp=(v,i,o)=>{const r=v<=0?0:v>1-i?(1-v)/i:v<o?v/o:1;return r*r*(3-2*r)}; // envelope sobe·segura·desce (suavizado)
function wizPose(cast,live){
 const A=WIZ_ANIM,s=live?A.strike:0,tr=live?A.triumph:0,d=live?A.danger:0,fz=live?A.freeze:0,ar=live?A.arcana:0,m=live?A.miss:0,P=_pose;
 const p=s>0?Math.sin(Math.PI*(1-s)):0;                                     // estocada: vai e volta (pico no meio)
 const re=envUp(tr,.18,.3);                                                   // triunfo: sobe, segura, desce
 const plant=fz<=0?0:fz>.92?(1-fz)/.08:Math.pow(fz/.92,2);                    // ❄️ desce em ~2 quadros e sobe devagar
 const pw=envUp(ar,.15,.35);                                                  // 💥 postura de poder
 const hop=m>0?Math.sin(Math.PI*(1-m)):0,shake=m>.5?Math.sin((1-m)*Math.PI*8)*2.2:0; // ❌ pulinho + sacudida nos primeiros ~100 ms
 const jit=d>0?Math.sin(T*53)*1.1*d:0;                                        // vibração nervosa do cajado
 P.ox=cast*2+1.5*p+2.2*d+1.2*pw;P.oy=-1.5*p+1.2*d+1.2*plant-2.2*hop;
 P.bx=STAFF_BASE.x+2*p-3*re-1.5*pw+jit;P.by=STAFF_BASE.y-cast*8-4.5*p-15*re+3.2*plant-10*pw;P.a=-cast*.25-.035*p-.13*re-.07*d-.09*pw; // 💥 erguido e quase na vertical: não cruza o rosto // estocada: gema anda ~6–7 px
 P.hy=1.8*d-2.2*re+.8*m;P.hx=shake;P.ear=Math.min(.6,.3*d+.3*m);P.still=fz>0?Math.min(1,fz*2.5):0;P.two=pw;return P;
}
// 🖼️ mago em SPRITE (folha oficial, js/render/sprites.js): a pose das micro-animações vira transformação do sprite inteiro
//  (desloca, inclina a partir dos pés, sacode) — o desenho é fixo, mas estocada/triunfo/perigo/gelo/Arcana/erro continuam.
const WIZ_SPRITE_H=112,_sx={tx:0,ty:0,rot:0,s:0};
const curChar=()=>G&&G.ch?G.ch:CHARS[selected];
const spriteOn=id=>typeof Sprites!=='undefined'&&Sprites.has(id);
// 🔙 na torre o mago aparece DE COSTAS (CHAR_BACK, olhando para os inimigos); sem essa arte, o sprite de frente; sem nenhum, o desenho.
//  O de costas é cortado na borda da torre → a linha de corte fica BACK_DY px abaixo dos pés, escondida pelo parapeito (drawParapet).
// ⚠️ DESLIGADO (28/10): a arte de costas atual mostra 4 "gatos" de chapéu (sem orelhas de coelho, focinho/cauda de raposa,
//  cabeça de coruja) → na torre todos pareciam o Gato. Volta para os sprites de FRENTE de cada personagem.
//  Religar (true) quando chegar arte de costas em que cada personagem seja reconhecível.
const TOWER_USE_BACK=false;
// 🎨 TOWER_PROC (28/10): na torre o mago é o DESENHO procedural de costas (drawWizard: capa com trama e dobras, contorno,
//  orelhas/cauda/capuz de cada espécie → cada um é reconhecível de costas). false = sprites de frente.
// ⚠️ DESLIGADO a pedido do usuário (28/10): ele prefere os sprites oficiais de FRENTE na torre.
const TOWER_PROC=false;
const BACK_DY=8,_tr={S:null,s:0,ax:0,ay:0,x0:0,y0:0,dy:0,gx:0,gy:0,back:false};
function towerSprite(id){
 if(TOWER_PROC||typeof Sprites==='undefined')return null;
 let R;
 if(TOWER_USE_BACK&&Sprites.hasBack(id)){R=CHAR_BACK[id];_tr.S=Sprites.back[id];_tr.s=CHAR_BACK.scale;_tr.ax=R.ax;_tr.ay=R.cut;_tr.dy=BACK_DY;_tr.back=true}
 else if(Sprites.has(id)){R=CHAR_SPRITES[id];_tr.S=Sprites.cut[id];_tr.s=WIZ_SPRITE_H/spriteFigH(R);_tr.ax=R.x+R.w/2;_tr.ay=R.feet;_tr.dy=0;_tr.back=false}
 else return null;
 _tr.x0=R.x;_tr.y0=R.y;_tr.gx=R.gem[0];_tr.gy=R.gem[1];return _tr;
}
function spriteXform(cast,live){
 const P=wizPose(cast,live),dx=P.bx-STAFF_BASE.x,dy=P.by-(STAFF_BASE.y-cast*8),da=P.a+cast*.25;
 _sx.tx=P.ox+dx*.45+P.hx*.6;_sx.ty=P.oy+dy*.4-cast*2;_sx.rot=da*.45-cast*.04;return _sx;
}
function drawWizardSprite(c,x,y,ch,t,cast,col,live,ref){
 const S=ref.S,s=ref.s,X=spriteXform(cast,live),br=Math.sin(t*2.2);
 c.save();c.translate(x,y+ref.dy);
 if(!ref.back){c.fillStyle='rgba(0,0,0,.45)';c.beginPath();c.ellipse(2,2,28,6,0,0,6.283);c.fill()}   // sombra no piso (o de costas fica atrás do parapeito)
 c.translate(X.tx,X.ty);c.rotate(X.rot);c.scale(1-br*.006,1+br*.014);                                  // pose + 🫁 respiração ancorada na base
 c.drawImage(S,(ref.x0-ref.ax)*s,(ref.y0-ref.ay)*s,S.width*s,S.height*s);
 c.restore();
}
/** parapeito de pedra na frente do mago de costas (cobre a linha de corte do sprite; folga para o pulo do triunfo) */
function drawParapet(c){
 const ti=towerSkinIdx(),k=THW/78;merlon3D(c,THEMES[ti],TX,TTOP+16,92*k,16,k,.8,false);
}
const _tip={x:0,y:0}; // reutilizado: staffTip é chamado todo quadro (sem alocar)
function staffTip(cast){
 const ref=towerSprite(curChar().id);
 if(ref){const X=spriteXform(cast,true),gx=(ref.gx-ref.ax)*ref.s,gy=(ref.gy-ref.ay)*ref.s,co=Math.cos(X.rot),si=Math.sin(X.rot); // gema do sprite
  _tip.x=TX+X.tx+gx*co-gy*si;_tip.y=WIZ_FOOT+ref.dy+X.ty+gx*si+gy*co;return _tip}
 const P=wizPose(cast,true),a=P.a,bx=TX+P.ox+P.bx,by=WIZ_FOOT+P.oy+P.by;_tip.x=bx+GEM_LOCAL.x*Math.cos(a)-GEM_LOCAL.y*Math.sin(a);_tip.y=by+GEM_LOCAL.x*Math.sin(a)+GEM_LOCAL.y*Math.cos(a);return _tip}
// gema lapidada (facetas + reflexo); o brilho é desenhado à parte, direto no canvas principal
function drawGem(c,x,y,s,col){
 const g=c.createLinearGradient(x-s,y-s*1.5,x+s,y+s*1.4);g.addColorStop(0,'#ffffff');g.addColorStop(.35,col);g.addColorStop(1,shade(col,-.5));
 c.fillStyle=g;c.beginPath();c.moveTo(x,y-s*1.5);c.lineTo(x+s,y-s*.3);c.lineTo(x+s*.6,y+s*.9);c.lineTo(x,y+s*1.4);c.lineTo(x-s*.6,y+s*.9);c.lineTo(x-s,y-s*.3);c.closePath();c.fill();
 const rg=c.createRadialGradient(x-s*.15,y-s*.25,0,x,y,s*1.4);rg.addColorStop(0,'rgba(255,255,255,.8)');rg.addColorStop(.3,'rgba(255,255,255,.18)');rg.addColorStop(.7,'rgba(0,0,0,0)');rg.addColorStop(1,'rgba(0,0,20,.35)');c.fillStyle=rg;c.fill(); // 💎 núcleo luminoso + borda funda (volume)
 c.strokeStyle='rgba(10,6,24,.6)';c.lineWidth=.9;c.stroke();
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
 c.globalCompositeOperation='lighter';c.globalAlpha=.85;c.drawImage(glowSprite(col),GEM_LOCAL.x-13,GEM_LOCAL.y-13,26,26);c.globalAlpha=1;c.globalCompositeOperation='source-over'; // halo interno da gema
 drawGem(c,GEM_LOCAL.x,GEM_LOCAL.y,6.2,col);
 c.strokeStyle='#7a4e28';c.lineWidth=2.2;c.lineCap='round';c.beginPath();
 c.moveTo(tx,ty+1);c.quadraticCurveTo(tx-9,ty-4,tx-4,ty-14);c.moveTo(tx,ty+1);c.quadraticCurveTo(tx+10,ty-3,tx+6,ty-14);c.moveTo(tx,ty+1);c.quadraticCurveTo(tx+2,ty-5,tx+1,ty-3);c.stroke();
 c.fillStyle='#e8b86a';c.beginPath();c.arc(tx-4,ty-14,1.3,0,6.283);c.arc(tx+6,ty-14,1.3,0,6.283);c.fill();
}
function drawWizard(c,x,y,ch,t,cast,col,live){
 const ref=towerSprite(ch.id);if(ref)return drawWizardSprite(c,x,y,ch,t,cast,col,live,ref); // 🖼️ de costas › de frente › desenho abaixo
 const Q=wizPose(cast,live),qox=Q.ox,qoy=Q.oy,qbx=Q.bx,qby=Q.by,qa=Q.a,qhy=Q.hy,qhx=Q.hx,ek=1-Q.ear,mv=1-Q.still,qtwo=Q.two; // 🎭 pose da micro-animação
 const fur=ch.fur,br=Math.sin(t*2.2),sway=Math.sin(t*1.7)*mv,furL=shade(fur,.28),furD=shade(fur,-.32),hem=i=>Math.sin(t*1.7+i*1.3)*2.2*mv; // ❄️ mv: barra e cauda param no Congelar
 const bob=br*.8; // 🫁 respiração: o tronco sobe e desce (a cabeça acompanha com um pequeno atraso)
 c.save();c.translate(x+qox,y+qoy);c.lineCap='round';c.lineJoin='round';
 c.fillStyle='rgba(0,0,0,.45)';c.beginPath();c.ellipse(4,2,30,7,0,0,6.283);c.fill();
 // cauda (atrás da capa), balançando ao vento
 if(ch.id==='gato'){c.strokeStyle=fur;c.lineWidth=6;c.beginPath();c.moveTo(-12,-8);c.bezierCurveTo(-30,-6,-42+sway*3,-22,-35+sway*5,-38);c.stroke();c.strokeStyle=furD;c.beginPath();c.moveTo(-37+sway*4.6,-32);c.lineTo(-35+sway*5,-38);c.stroke()}
 if(ch.id==='raposa'){c.save();c.translate(-22,-14);c.rotate(-.95+sway*.12);const g=c.createLinearGradient(0,-26,0,22);g.addColorStop(0,'#ffffff');g.addColorStop(.26,'#fff4ea');g.addColorStop(.32,fur);g.addColorStop(1,furD);c.fillStyle=g;c.beginPath();c.ellipse(0,0,12.5,25,0,0,6.283);c.fill();c.restore()}
 if(ch.id==='coelho'){c.fillStyle='#ffffff';c.beginPath();c.arc(1,-14,7,0,6.283);c.fill()}
 if(ch.id==='coruja'){c.fillStyle=furD;for(let i=-2;i<=2;i++){c.beginPath();c.ellipse(i*4.5,-6+Math.abs(i),3,9,i*.25,0,6.283);c.fill()}}
 // capa (com respiração)
 c.save();c.translate(0,-bob*.5);c.scale(1+br*.006,1+br*.012+cast*.03);
 let g=c.createLinearGradient(-28,0,28,0);g.addColorStop(0,shade(ch.robeDark,-.3));g.addColorStop(.35,ch.robeDark);g.addColorStop(.62,ch.robe);g.addColorStop(.82,shade(ch.robe,.2));g.addColorStop(1,ch.robeDark);
 const cp=new Path2D();cp.moveTo(-15,-52);cp.quadraticCurveTo(-25,-30,-27+hem(0),-2);
 cp.quadraticCurveTo(-18,2+hem(1),-9,-1);cp.quadraticCurveTo(0,3+hem(2),9,-1);cp.quadraticCurveTo(18,2+hem(3),27+hem(4),-2);cp.quadraticCurveTo(25,-30,15,-52);cp.closePath();
 c.fillStyle=g;c.fill(cp);
 c.save();c.clip(cp); // ✨ tecido: trama, dobras, runa bordada e contraluz ficam DENTRO da capa
 c.fillStyle=clothPat(c);c.fillRect(-30,-56,60,62);                                                               // trama da túnica (sarja)
 g=c.createLinearGradient(0,-54,0,2);g.addColorStop(0,'rgba(255,255,255,.1)');g.addColorStop(.35,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(4,2,16,.4)');c.fillStyle=g;c.fillRect(-30,-56,60,62); // ombros iluminados, barra na sombra
 for(let i=0;i<4;i++){const f=CAPE_FOLDS[i],x0=f[0],x1=f[1]+hem(i+1)*.6;                                       // dobras: vale escuro largo + crista clara ao lado
  c.strokeStyle='rgba(6,3,22,.3)';c.lineWidth=5.5;c.beginPath();c.moveTo(x0,-50);c.quadraticCurveTo(f[2],-26,x1,1);c.stroke();
  c.strokeStyle='rgba(6,3,22,.35)';c.lineWidth=1.6;c.stroke();
  c.strokeStyle='rgba(255,255,255,.09)';c.lineWidth=2.4;c.beginPath();c.moveTo(x0+3,-50);c.quadraticCurveTo(f[2]+3.5,-26,x1+3.5,0);c.stroke()}
 c.globalAlpha=.3+cast*.6;c.strokeStyle='#ffd98a';c.lineWidth=1;c.beginPath();c.arc(1,-27,7,0,6.283);c.moveTo(1,-35.5);c.lineTo(1,-18.5);c.moveTo(-7.5,-27);c.lineTo(9.5,-27);c.stroke(); // runa bordada nas costas: acende ao conjurar
 c.beginPath();c.arc(1,-27,3,0,6.283);c.stroke();c.globalAlpha=1;
 c.globalCompositeOperation='lighter';g=c.createLinearGradient(-28,0,28,0);g.addColorStop(0,'rgba(170,190,255,.32)');g.addColorStop(.16,'rgba(0,0,0,0)');g.addColorStop(.8,'rgba(0,0,0,0)');g.addColorStop(1,col);
 c.globalAlpha=.5+cast*.3;c.fillStyle=g;c.fillRect(-30,-56,60,62);c.globalAlpha=1;c.globalCompositeOperation='source-over'; // contraluz: lua à esquerda, gema à direita
 c.restore();
 c.strokeStyle=shade(ch.robeDark,-.62);c.lineWidth=1.3;c.stroke(cp);                                             // contorno limpo
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
 c.save();c.translate(cast*1.5+qhx,-br*.9-Math.sin(t*2.2-.5)*.6-cast*3+qhy);c.rotate(Math.sin(t*.9)*.025); // cabeça: segue o fôlego com atraso + leve balanço
 const hx=2,hy=-63;
 // orelhas/tufos: no perigo (ek < 1) achatam para trás
 if(ch.id==='gato'||ch.id==='raposa'){const big=ch.id==='raposa'?1.25:1,eh=21*big*ek,ew=15*big+(1-ek)*6;for(const s of[-1,1]){c.fillStyle=fur;c.beginPath();c.moveTo(hx+s*6,hy-8);c.lineTo(hx+s*ew,hy-eh);c.lineTo(hx+s*14,hy-4);c.fill();c.fillStyle=ch.id==='raposa'?'#2a1810':'#e8a0a8';c.beginPath();c.moveTo(hx+s*10.5,hy-11*ek);c.lineTo(hx+s*ew,hy-eh);c.lineTo(hx+s*13.4,hy-8);c.fill()}}
 if(ch.id==='coruja'){c.fillStyle=furD;for(const s of[-1,1]){c.beginPath();c.moveTo(hx+s*8,hy-7);c.lineTo(hx+s*(16+(1-ek)*5),hy-18*ek);c.lineTo(hx+s*13,hy-4);c.fill()}}
 if(ch.id==='coruja'){c.fillStyle=ch.robeDark;c.beginPath();c.arc(hx-2,hy+1,17,0,6.283);c.fill()} // capuz verde
 g=c.createRadialGradient(hx+5,hy-5,2,hx,hy,15);g.addColorStop(0,furL);g.addColorStop(1,furD);c.fillStyle=g;c.beginPath();c.arc(hx,hy,13,0,6.283);c.fill();c.strokeStyle='rgba(12,6,20,.55)';c.lineWidth=1.1;c.stroke(); // contorno da cabeça
 if(ch.id==='coruja'){c.fillStyle=shade(fur,.45);c.beginPath();c.ellipse(hx+9,hy+1,6,7,0,0,6.283);c.fill();c.fillStyle='#f6c21a';c.beginPath();c.arc(hx+10,hy-1,3.3,0,6.283);c.fill();c.fillStyle='#120a08';c.beginPath();c.arc(hx+10.6,hy-1,1.7,0,6.283);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(hx+10,hy-2,.7,0,6.283);c.fill();c.fillStyle='#f0c040';c.beginPath();c.moveTo(hx+13,hy+3);c.lineTo(hx+18,hy+5);c.lineTo(hx+13,hy+7);c.fill()}
 else{
  c.fillStyle=ch.id==='coelho'?'#ffffff':ch.id==='raposa'?'#fff4ea':shade(fur,.42);c.beginPath();c.ellipse(hx+11,hy+3,ch.id==='raposa'?8:6.5,ch.id==='raposa'?4.5:5,-.2,0,6.283);c.fill(); // focinho
  c.fillStyle=ch.id==='coelho'?'#f07aa0':'#2a1810';c.beginPath();c.arc(hx+(ch.id==='raposa'?18.5:16.5),hy+1.5,1.9,0,6.283);c.fill();
  const blink=(t%4.3)<.13?.15:1; // 👁️ pisca a cada ~4 s
  c.fillStyle='#120a08';c.beginPath();c.ellipse(hx+8,hy-3,1.7,2.5*blink,-.2,0,6.283);c.fill();if(blink===1){c.fillStyle='#ffffff';c.beginPath();c.arc(hx+8.5,hy-4,.75,0,6.283);c.fill()}
  if(ch.id==='gato'){c.strokeStyle='rgba(255,255,255,.75)';c.lineWidth=.8;c.beginPath();c.moveTo(hx+15,hy+3);c.lineTo(hx+27,hy);c.moveTo(hx+15,hy+4.5);c.lineTo(hx+27,hy+5);c.stroke()}
  if(ch.id==='coelho'){c.fillStyle='rgba(244,150,190,.5)';c.beginPath();c.arc(hx+6,hy+4,2.4,0,6.283);c.fill()}
 }
 if(ch.id==='gato'){c.strokeStyle=shade(fur,-.38);c.lineWidth=1.6;c.lineCap='round';c.beginPath();c.moveTo(hx-9,hy-4);c.lineTo(hx-4,hy-3);c.moveTo(hx-10,hy+1);c.lineTo(hx-5,hy+1);c.moveTo(hx-8,hy+6);c.lineTo(hx-3,hy+5);c.stroke()} // malhado
 if(ch.id==='coruja'){c.strokeStyle=ch.robe;c.lineWidth=4.5;c.beginPath();c.arc(hx-2,hy+1,15.5,Math.PI*.9,Math.PI*1.72);c.stroke();c.strokeStyle='#e8b86a';c.lineWidth=1;c.beginPath();c.arc(hx-2,hy+1,17.8,Math.PI*.95,Math.PI*1.7);c.stroke()}
 // chapéu cônico (gato, ou qualquer mago com chapéu equipado): aba larga + cone com a ponta dobrada que balança
 const flop=Math.sin(t*1.8)*3-cast*3,hv=ch.hatItem;
 if(hv&&hv.style==='crown'){c.save();c.translate(hx,hy-11);c.rotate(-.08);
  c.fillStyle=hv.c2;c.beginPath();c.moveTo(-12,2);c.lineTo(-13,-10);c.lineTo(-7,-4);c.lineTo(-3,-14);c.lineTo(1,-5);c.lineTo(5,-14);c.lineTo(9,-4);c.lineTo(14,-10);c.lineTo(12,2);c.closePath();c.fill();
  c.fillStyle=hv.c1;c.fillRect(-12,-3,24,5);c.fillStyle=hv.gem;c.beginPath();c.arc(-6,-.5,1.6,0,6.283);c.arc(1,-.5,1.6,0,6.283);c.arc(8,-.5,1.6,0,6.283);c.fill();c.restore()}
 else if(ch.id==='gato'||hv){const HR=hv?hv.c1:ch.robe,HD=hv?hv.c2:ch.robeDark,HB=hv&&hv.band||'#e8b86a';c.save();c.translate(hx,hy-9);c.rotate(-.08+cast*.05);
 c.fillStyle='rgba(0,0,0,.3)';c.beginPath();c.ellipse(1,3,24,6,0,0,6.283);c.fill();                               // sombra da aba na cabeça
 g=c.createLinearGradient(0,-6,0,7);g.addColorStop(0,shade(HR,.12));g.addColorStop(1,shade(HD,-.35));c.fillStyle=g;c.beginPath();c.ellipse(0,0,27,7.5,0,0,6.283);c.fill();
 c.strokeStyle='rgba(255,255,255,.14)';c.lineWidth=1;c.beginPath();c.ellipse(0,-.5,26,7,0,Math.PI*1.05,Math.PI*1.95);c.stroke();
 g=c.createLinearGradient(-15,0,15,0);g.addColorStop(0,shade(HD,-.25));g.addColorStop(.6,HR);g.addColorStop(.85,shade(HR,.22));g.addColorStop(1,HD);c.fillStyle=g;
 c.beginPath();c.moveTo(-14,-2);c.bezierCurveTo(-11,-16,-9,-30,-8,-38);c.quadraticCurveTo(-12+flop,-48,-25+flop*1.3,-44);c.quadraticCurveTo(-11+flop,-41,-1,-35);c.bezierCurveTo(5,-26,10,-14,14,-2);c.closePath();c.fill();
 c.strokeStyle='rgba(0,0,0,.28)';c.lineWidth=1.6;c.beginPath();c.moveTo(-6,-4);c.quadraticCurveTo(-4,-22,-5,-35);c.stroke();
 c.strokeStyle=HB;c.lineWidth=4;c.beginPath();c.moveTo(-13.5,-5);c.quadraticCurveTo(0,-1,13.5,-5);c.stroke();
 c.fillStyle='#ffd98a';c.fillRect(4,-8,5,6);c.fillStyle=HD;c.fillRect(5.5,-6.5,2,3);
 c.fillStyle='rgba(255,217,138,.85)';for(const[sx,sy]of[[-7,-14],[5,-18],[-3,-27],[-12+flop,-40]]){c.beginPath();c.arc(sx,sy,.95,0,6.283);c.fill()}
 c.restore();}
 if(ch.id==='coelho'){for(const[dx,r]of[[-6,-.35],[8,.2]]){c.save();c.translate(hx+dx,hy-14);c.rotate(r+Math.sin(t*2+dx)*.07*mv+(dx<0?-1:1)*(1-ek)*.9);c.fillStyle=fur;c.beginPath();c.ellipse(0,-14,5,16,0,0,6.283);c.fill();c.fillStyle='#f4b0c8';c.beginPath();c.ellipse(.5,-13,2.2,11,0,0,6.283);c.fill();c.restore()}}
 c.restore();
 // cajado + braço direito segurando
 const bx=qbx,by=qby,a=qa,lpx=6,lpy=-50; // base/ângulo vêm da pose (estocada, triunfo, tremor do perigo)
 const hpx=bx+lpx*Math.cos(a)-lpy*Math.sin(a),hpy=by+lpx*Math.sin(a)+lpy*Math.cos(a);
 c.save();c.translate(bx,by);c.rotate(a);drawStaff(c,STAFF_LEN,col);c.restore();
 // braço direito: manga afunilada saindo do ombro + pata fechada EM CIMA da haste (mesmo desenho do retrato: avatarSleeve/avatarPaw)
 avatarSleeve(c,11,-45-br*.6,hpx-2.5,hpy+4.5,5.5,7,ch);
 avatarPaw(c,hpx,hpy,4.8,fur,furD,true);
 if(qtwo>.12){ // 💥 Arcana: a pata livre sai de baixo da capa e segura o MEIO do cajado (duas patas = postura de poder)
  const l2x=3,l2y=-30,h2x=bx+l2x*Math.cos(a)-l2y*Math.sin(a),h2y=by+l2x*Math.sin(a)+l2y*Math.cos(a),k=Math.min(1,qtwo*1.4);
  const sx=-12,sy=-42,ex=sx+(h2x-2.5-sx)*k,ey=sy+(h2y+4-sy)*k;c.globalAlpha=Math.min(1,qtwo*2);
  avatarSleeve(c,sx,sy,ex,ey,5.5,7,ch);avatarPaw(c,sx+(h2x-sx)*k,sy+(h2y-sy)*k,4.8,fur,furD,true);c.globalAlpha=1;
 }
 c.restore();
}
// mago com sombra projetada e contorno de luz SEM shadowBlur: silhueta tingida em canvas pequenos
const WZ_W=200,WZ_H=200,WZ_OX=80,WZ_OY=175,wizCv=mkCanvas(WZ_W,WZ_H),wizCx=wizCv.getContext('2d'),tintCv=mkCanvas(WZ_W,WZ_H),tintCx=tintCv.getContext('2d'),shadowCv=mkCanvas(WZ_W,WZ_H),shadowCx=shadowCv.getContext('2d');
function tintInto(dx,dst,src,col){dx.globalCompositeOperation='source-over';dx.clearRect(0,0,WZ_W,WZ_H);dx.drawImage(src,0,0);dx.globalCompositeOperation='source-in';dx.fillStyle=col;dx.fillRect(0,0,WZ_W,WZ_H);dx.globalCompositeOperation='source-over';return dst}
const tintFrom=(src,col)=>tintInto(tintCx,tintCv,src,col);
// o mago é redesenhado (com sombra e contorno tingidos) a 30 Hz quando parado e a cada quadro durante o feitiço;
// nos outros quadros só os 3–4 drawImage dos caches são feitos → ~3 tingimentos a menos por quadro
let wizTick=0,wizCh=null,wizCol='',wizHq=null;
// 📱 celular: o mago é pré-renderizado (corpo + sombra + contorno) em quadros de um ciclo de respiração:
//  16 quadros parados + 4 níveis de feitiço × 6 quadros. No quadro do jogo resta 1 drawImage. Criação preguiçosa
//  (no máximo 1 quadro novo por desenho) e cache refeito só ao trocar de mago/cor/qualidade.
const WZF={N:16,NC:6,P:3.6,M:4,ch:null,col:'',hq:null,idle:null,cast:null};
function wizFrame(ch,t,cast,col,hq){
 if(WZF.ch!==ch||WZF.col!==col||WZF.hq!==hq){WZF.ch=ch;WZF.col=col;WZF.hq=hq;WZF.idle=new Array(WZF.N).fill(null);WZF.cast=[0,1,2,3].map(()=>new Array(WZF.NC).fill(null))}
 const ph=((t%WZF.P)+WZF.P)%WZF.P/WZF.P,lv=cast>.02?Math.min(3,Math.ceil(cast*4)-1):-1;
 const arr=lv<0?WZF.idle:WZF.cast[lv],n=arr.length,i=(ph*n)|0;
 let f=arr[i];if(f)return f;
 // ainda não existe: usa um vizinho pronto (sem custo) e cria este no próximo desenho se não houver nenhum
 for(let k=1;k<n;k++){const g=arr[(i-k+n)%n];if(g){if(!WZF.built){WZF.built=true;arr[i]=buildWizFrame(ch,i/n*WZF.P,lv<0?0:(lv+1)/4,col,hq)}return g}}
 return arr[i]=buildWizFrame(ch,i/n*WZF.P,lv<0?0:(lv+1)/4,col,hq);
}
function buildWizFrame(ch,t,cast,col,hq){
 const f=mkCanvas(WZ_W+8,WZ_H+8),x=f.getContext('2d'),ox=TX-WZ_OX,oy=WIZ_FOOT-WZ_OY;
 wizCx.clearRect(0,0,WZ_W,WZ_H);wizCx.save();wizCx.translate(-ox,-oy);drawWizard(wizCx,TX,WIZ_FOOT,ch,t,cast,col,false);wizCx.restore(); // quadro pré-renderizado: pose neutra
 tintInto(shadowCx,shadowCv,wizCv,'#000');
 x.globalAlpha=.45;x.drawImage(shadowCv,2+4,2+5);
 if(hq){tintFrom(wizCv,col);x.globalCompositeOperation='lighter';x.globalAlpha=.32+cast*.3;x.drawImage(tintCv,2-1.5,2);x.drawImage(tintCv,2+1.5,2-1);x.globalCompositeOperation='source-over'}
 x.globalAlpha=1;x.drawImage(wizCv,2,2);return f;
}
function drawWizardLit(c,ch,t,cast,col,hq){
 const anim=wizAnimating(); // 🎭 celular: durante uma micro-animação o mago é desenhado ao vivo (os quadros em cache têm pose neutra)
 if(DeviceManager.isMobile&&profile.spellColor!=='arcoiris'&&!anim){WZF.built=false;const f=wizFrame(ch,t,cast,col,hq);c.drawImage(f,TX-WZ_OX-2,WIZ_FOOT-WZ_OY-2);return}
 const ox=TX-WZ_OX,oy=WIZ_FOOT-WZ_OY;
 if((wizTick++&1)===0||cast>.02||wizFast()||ch!==wizCh||col!==wizCol||hq!==wizHq){wizCh=ch;wizCol=col;wizHq=hq; // estocada/triunfo: todo quadro (são rápidos)
  wizCx.clearRect(0,0,WZ_W,WZ_H);wizCx.save();wizCx.translate(-ox,-oy);drawWizard(wizCx,TX,WIZ_FOOT,ch,t,cast,col,true);wizCx.restore();
  tintInto(shadowCx,shadowCv,wizCv,'#000');if(hq){tintFrom(wizCv,col);rimInto(cast,col)}
 }
 c.globalAlpha=.45;c.drawImage(shadowCv,ox+4,oy+5);
 if(hq){c.globalCompositeOperation='lighter';c.globalAlpha=.32+cast*.3;c.drawImage(tintCv,ox-1.5,oy);c.drawImage(tintCv,ox+1.5,oy-1);c.globalCompositeOperation='source-over'}
 c.globalAlpha=1;c.drawImage(wizCv,ox,oy);
 if(hq){const L=SCENE_LIGHT;c.globalCompositeOperation='lighter';c.globalAlpha=Math.min(1,.3+.08*Math.sin(T*1.8)+cast*.4+L.ov*.25+WIZ_ANIM.arcana*.6+WIZ_ANIM.strike*.2);c.drawImage(rimCv,ox,oy);c.globalAlpha=1;c.globalCompositeOperation='source-over'} // 💡 a gema ilumina o próprio mago
}
// luz da gema SOBRE o mago: a silhueta pintada com um gradiente radial centrado na gema (mais forte no ombro/cabeça
//  perto do cajado, some do outro lado) → somada com 'lighter' parece luz batendo no personagem. Refeita junto com o mago (30 Hz).
const rimCv=mkCanvas(WZ_W,WZ_H),rimCx=rimCv.getContext('2d');
function rimInto(cast,col){
 const tip=staffTip(cast),gx=tip.x-(TX-WZ_OX),gy=tip.y-(WIZ_FOOT-WZ_OY);
 rimCx.globalCompositeOperation='source-over';rimCx.clearRect(0,0,WZ_W,WZ_H);rimCx.drawImage(wizCv,0,0);rimCx.globalCompositeOperation='source-in';
 const g=rimCx.createRadialGradient(gx,gy,4,gx,gy,115);g.addColorStop(0,hexA(col,.85));g.addColorStop(.3,hexA(col,.4));g.addColorStop(1,hexA(col,0));
 rimCx.fillStyle=g;rimCx.fillRect(0,0,WZ_W,WZ_H);rimCx.globalCompositeOperation='source-over';
}
