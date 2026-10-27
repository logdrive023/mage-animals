// Mage Animals — js/render/runes.js · Modo Símbolos & Runas: escolha das runas por onda e o badge ilustrado nos inimigos.
// Cada forma vira um sprite pré-renderizado (por elemento e estado: apagada / próxima / concluída) → por quadro só drawImage.
'use strict';

// ---------- curva de aprendizado: famílias liberadas por onda ----------
const RUNE_FAM_ORDER=['lines','angles','curves','closed','loops'];
function runeFamsFor(w){const out=[];for(const id of RUNE_FAM_ORDER){const f=RUNE_FAMILIES.find(x=>x.id===id);if(w>=f.wave)out.push(id)}return out}
const runeNewFamily=w=>{for(const f of RUNE_FAMILIES)if(f.wave>1&&f.wave===w)return f.id;return null};
// escolhe a(s) forma(s) de um inimigo; evita repetir a 1ª forma de quem já está na tela (a mira continua sem ambiguidade)
function pickRune(kind,w){
 const fams=runeFamsFor(w),newest=fams[fams.length-1];
 const pool=RUNE_SHAPES.filter(s=>fams.includes(s.fam)),fresh=RUNE_SHAPES.filter(s=>s.fam===newest);
 const pick1=()=>{const src=fams.length>1&&Math.random()<.5?fresh:pool;return src[(Math.random()*src.length)|0]};
 const clash=code=>{for(let i=0;i<G.enemies.length;i++)if(G.enemies[i].word&&G.enemies[i].word[0]===code[0])return true;return false};
 for(let tries=0;tries<16;tries++){
  let code,combo=null;
  if(kind==='boss'){ // chefe: runa ancestral composta (2 formas), só com famílias já liberadas
   const ok=RUNE_COMBOS.filter(r=>r.seq.every(id=>fams.includes(RUNE_BY_ID[id].fam)));
   if(ok.length){combo=ok[(Math.random()*ok.length)|0];code=combo.code}else{const a=pick1(),b=pick1();code=a.code+b.code}
  }else if(w>=RUNE_CURVE.chainFrom&&kind!=='crystal'&&Math.random()<RUNE_CURVE.chainChance){const a=pick1();let b=pick1();if(b===a)b=pick1();code=a.code+b.code} // corrente de 2 só nas ondas altas (cristal já aguenta 2 golpes)
  else code=pick1().code;
  if(!clash(code)||tries===15)return{code,combo};
 }
}
// ---------- sprites das formas ----------
const _runeSpr=new Map();
const RUNE_CELL=26;
function runeSprite(sh,state,col){ // state 0 = apagada · 1 = próxima (cor do elemento) · 2 = concluída (dourado/branco)
 const key=sh.code+state+col;let s=_runeSpr.get(key);if(s)return s;
 s=mkCanvas(RUNE_CELL+8,RUNE_CELL+8);const c=s.getContext('2d'),k=RUNE_CELL/100,o=4;
 c.lineCap='round';c.lineJoin='round';
 const path=()=>{c.beginPath();for(const st of sh.strokes){st.forEach(([x,y],i)=>i?c.lineTo(o+x*k,o+y*k):c.moveTo(o+x*k,o+y*k))}};
 const main=state===2?'#fff2c0':state===1?col:'rgba(200,208,240,.38)';
 if(state){path();c.strokeStyle=state===2?'rgba(255,214,110,.45)':hexA(col,.42);c.lineWidth=7;c.stroke()} // brilho (sem shadowBlur)
 path();c.strokeStyle=main;c.lineWidth=state?3:2.4;c.stroke();
 _runeSpr.set(key,s);return s;
}
const runeColor=e=>RUNE_EL_COLOR[e.runeEl]||RUNE_EL_COLOR.raio;
const runeBadgeW=n=>n*(RUNE_CELL+8)+(n-1)*4;
// badge: caixa escura com borda do elemento; formas concluídas acesas, a próxima pulsando, as restantes apagadas
function drawRuneBadge(c,e,x,y,isT,hot){
 const n=e.word.length,w=runeBadgeW(n),col=runeColor(e),bx=x-8,by=y-30;
 c.fillStyle=isT?'rgba(20,16,50,.94)':'rgba(6,8,24,.82)';c.strokeStyle=hot?'#ff4a6a':isT?'#ffd98a':hexA(col,.55);c.lineWidth=isT||hot?2:1.4;
 c.beginPath();c.roundRect(bx,by,w+16,RUNE_CELL+16,9);c.fill();c.stroke();
 for(let i=0;i<n;i++){
  const sh=RUNE_BY_CODE[e.word[i]],st=i<e.typed?2:i===e.typed?1:0,px=x+i*(RUNE_CELL+12),py=by+4;
  if(st===1){c.globalAlpha=.65+.35*Math.sin(T*6);c.drawImage(runeSprite(sh,1,col),px,py);c.globalAlpha=1}
  else c.drawImage(runeSprite(sh,st,col),px,py);
  if(i<n-1){c.fillStyle=i<e.typed?'#ffd98a':'rgba(200,208,240,.35)';c.fillRect(px+RUNE_CELL+7,py+RUNE_CELL/2+3,3,3)} // elo da cadeia
 }
}
// texto da barra de digitação no modo runas: os glifos das formas
function runeGlyphs(code){let s='';for(let i=0;i<code.length;i++){const sh=RUNE_BY_CODE[code[i]];s+=(i?' ':'')+(sh?sh.glyph:code[i])}return s}

// ---------- ✍️ GUIA DE TRAÇADO: mostra COMO desenhar a forma da vez ----------
// Cartão no canto do campo com a forma grande, o ponto de início (●, numerado se tiver mais de 1 traço), a seta de direção
// e um cometa refazendo o traço em loop. Caminho de cada forma calculado 1 vez (cache); por quadro: 2–3 paths simples.
const _runePath=new Map();
function runePath(sh){
 let p=_runePath.get(sh.id);if(p)return p;
 let mx=1e9,my=1e9,Mx=-1e9,My=-1e9,total=0;
 const strokes=sh.strokes.map(st=>{const pts=st.map(([x,y])=>({x,y}));const cum=[0];let L=0;
  for(let i=0;i<pts.length;i++){const q=pts[i];if(q.x<mx)mx=q.x;if(q.y<my)my=q.y;if(q.x>Mx)Mx=q.x;if(q.y>My)My=q.y;if(i){L+=Math.hypot(q.x-pts[i-1].x,q.y-pts[i-1].y);cum.push(L)}}
  total+=L;return{pts,cum,L}});
 p={strokes,total,bx:mx,by:my,bw:Mx-mx,bh:My-my};_runePath.set(sh.id,p);return p;
}
// ponto e direção a uma distância d ao longo de um traço (reutiliza o mesmo objeto)
const _PA={x:0,y:0,ang:0};
function runePathAt(s,d){let i=1;while(i<s.cum.length-1&&s.cum[i]<d)i++;const a=s.pts[i-1],b=s.pts[i],sl=(s.cum[i]-s.cum[i-1])||1,k=Math.max(0,Math.min(1,(d-s.cum[i-1])/sl));
 _PA.x=a.x+(b.x-a.x)*k;_PA.y=a.y+(b.y-a.y)*k;_PA.ang=Math.atan2(b.y-a.y,b.x-a.x);return _PA}
// transformação forma(0..100) → tela, centrada num quadrado de lado `size` (mantém a proporção; linhas finas não explodem)
const _RT={k:1,ox:0,oy:0};
function runeFit(P,cx,cy,size){const k=size/Math.max(P.bw,P.bh,45);_RT.k=k;_RT.ox=cx-(P.bx+P.bw/2)*k;_RT.oy=cy-(P.by+P.bh/2)*k;return _RT}
/** desenha a forma inteira (todos os traços), centrada em (cx,cy) */
function drawRuneShape(c,sh,cx,cy,size,col,lw){
 const P=runePath(sh),T=runeFit(P,cx,cy,size);c.beginPath();
 for(const s of P.strokes)for(let i=0;i<s.pts.length;i++){const q=s.pts[i];i?c.lineTo(T.ox+q.x*T.k,T.oy+q.y*T.k):c.moveTo(T.ox+q.x*T.k,T.oy+q.y*T.k)}
 c.lineCap='round';c.lineJoin='round';c.strokeStyle=col;c.lineWidth=lw;c.stroke();
}
/** fileira de formas (palavra rúnica) centrada em cx; as `typed` primeiras ficam douradas. Devolve a largura. */
function drawRuneRow(c,code,cx,cy,size,typed,colDone,colRest,lw){
 const gap=size*.45,w=code.length*size+(code.length-1)*gap;let x=cx-w/2+size/2;
 for(let i=0;i<code.length;i++){const sh=RUNE_BY_CODE[code[i]];if(sh)drawRuneShape(c,sh,x,cy,size,i<typed?colDone:colRest,lw);x+=size+gap}
 return w;
}
// forma da vez: a próxima do alvo; sem alvo, a 1ª forma do inimigo mais perto da torre (é ele que o 1º traço vai mirar)
function runeGuideShape(){
 if(!G)return null;const e=G.target;
 if(e&&e.word)return RUNE_BY_CODE[e.word[e.typed]]||null;
 let best=null;for(let i=0;i<G.enemies.length;i++){const q=G.enemies[i];if(q.word&&(!best||q.y>best.y))best=q}
 return best?RUNE_BY_CODE[best.word[0]]||null:null;
}
const RUNE_GUIDE={x:14,y:470,s:124};
function drawRuneGuide(c){
 if(!RUNE_GUIDE_ON)return;const sh=runeGuideShape();if(!sh)return;
 const g=RUNE_GUIDE,col=G.target?runeColor(G.target):'#ffd98a',P=runePath(sh),hot=G.guideHot||0;
 // 📱 celular: o campo encolhe na tela → cartão 1,45× maior, encostado no pé do campo (continua à esquerda da torre)
 const sc=DeviceManager.isMobile?1.45:1;c.save();if(sc!==1){const gy=H-(g.s+18)*sc-10;c.translate(g.x,gy);c.scale(sc,sc);c.translate(-g.x,-g.y)}
 if(hot>0)G.guideHot=Math.max(0,hot-1/60*1.2);
 // cartão de vidro (pulsa vermelho logo depois de um erro: "olha aqui como é")
 c.fillStyle='rgba(8,10,30,.78)';c.strokeStyle=hot>0?`rgba(255,90,110,${.5+hot*.5})`:hexA(col,.6);c.lineWidth=hot>0?2.5:1.5;
 c.beginPath();c.roundRect(g.x,g.y,g.s,g.s+18,14);c.fill();c.stroke();
 c.font='900 11px Nunito';c.textAlign='center';c.fillStyle='#ffd98a';c.fillText(t('runes.drawThis'),g.x+g.s/2,g.y+16);
 c.font='700 10px Nunito';c.fillStyle='rgba(200,210,240,.7)';c.fillText(t('runes.startHere'),g.x+g.s/2,g.y+g.s+12);c.textAlign='left';
 const cx=g.x+g.s/2,cy=g.y+18+(g.s-18)/2,size=g.s-44;
 drawRuneShape(c,sh,cx,cy,size,hexA(col,.18),12);drawRuneShape(c,sh,cx,cy,size,'rgba(230,236,255,.35)',3);
 // cometa: percorre os traços em ordem (velocidade constante), pausa no fim e recomeça
 const F=runeFit(P,cx,cy,size),dur=.6+P.total/90,per=dur+.7,u=Math.min(1,(T%per)/dur),dist=u*P.total;
 let acc=0;c.lineCap='round';c.lineJoin='round';
 for(let si=0;si<P.strokes.length;si++){
  const s=P.strokes[si],p0=s.pts[0],sx=F.ox+p0.x*F.k,sy=F.oy+p0.y*F.k,local=dist-acc;
  // trecho já "desenhado" pelo cometa
  if(local>0){c.beginPath();c.moveTo(sx,sy);const lim=Math.min(local,s.L);
   for(let i=1;i<s.pts.length&&s.cum[i]<=lim;i++)c.lineTo(F.ox+s.pts[i].x*F.k,F.oy+s.pts[i].y*F.k);
   const h=runePathAt(s,lim);c.lineTo(F.ox+h.x*F.k,F.oy+h.y*F.k);c.strokeStyle=col;c.lineWidth=5;c.stroke()}
  // início do traço: bolinha (com número se a forma tiver 2+ traços)
  c.fillStyle='#7dffbd';c.beginPath();c.arc(sx,sy,P.strokes.length>1?7:5.5,0,6.283);c.fill();
  if(P.strokes.length>1){c.font='900 9px Nunito';c.textAlign='center';c.fillStyle='#062a18';c.fillText(si+1,sx,sy+3);c.textAlign='left'}
  // seta no fim do traço (direção)
  const e=runePathAt(s,s.L),ex=F.ox+e.x*F.k,ey=F.oy+e.y*F.k,a=e.ang;
  c.fillStyle='rgba(230,236,255,.6)';c.beginPath();c.moveTo(ex+Math.cos(a)*6,ey+Math.sin(a)*6);c.lineTo(ex+Math.cos(a+2.5)*7,ey+Math.sin(a+2.5)*7);c.lineTo(ex+Math.cos(a-2.5)*7,ey+Math.sin(a-2.5)*7);c.fill();
  // cabeça do cometa
  if(local>0&&local<s.L&&u<1){const h=runePathAt(s,local),hx=F.ox+h.x*F.k,hy=F.oy+h.y*F.k;
   c.globalCompositeOperation='lighter';c.drawImage(glowSprite(col),hx-14,hy-14,28,28);c.globalCompositeOperation='source-over';
   c.fillStyle='#fff';c.beginPath();c.arc(hx,hy,3.5,0,6.283);c.fill()}
  acc+=s.L;
 }
 c.restore();
}
