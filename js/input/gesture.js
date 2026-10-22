// Mage Animals — js/input/gesture.js · Entrada dupla no touch: ✍️ Desenhar Letra (gestos) ou ⌨️ Teclado Virtual.
// Reconhecimento: algoritmo $P Point-Cloud (Vatavu, Anthony & Wobbrock, 2012) — independente da ordem e da direção dos
// traços e com suporte a letras de vários traços (A, E, H, T, X…). Os modelos são letras MAIÚSCULAS desenhadas à mão
// num quadro 100×100 (+ algumas minúsculas comuns). Um leve viés favorece as letras que fazem sentido no momento.
'use strict';

// ---------- modelos (traços em 0..100, y para baixo) ----------
const _arc=(cx,cy,rx,ry,a0,a1,n=14)=>Array.from({length:n+1},(_,i)=>{const a=(a0+(a1-a0)*i/n)*Math.PI/180;return[cx+Math.cos(a)*rx,cy+Math.sin(a)*ry]});
const GLYPHS={
 a:[[[0,100],[50,0],[100,100]],[[22,62],[78,62]]],
 b:[[[0,0],[0,100]],[[0,0],[60,0],[82,12],[82,38],[60,50],[0,50]],[[0,50],[66,50],[92,63],[92,88],[66,100],[0,100]]],
 c:[_arc(55,50,45,50,-45,-315)],
 d:[[[0,0],[0,100]],[[0,0],[45,0],[85,20],[95,50],[85,80],[45,100],[0,100]]],
 e:[[[90,0],[0,0],[0,100],[90,100]],[[0,50],[70,50]]],
 f:[[[90,0],[0,0],[0,100]],[[0,50],[70,50]]],
 g:[_arc(55,50,45,50,-45,-330),[[98,58],[98,90]],[[60,58],[98,58]]],
 h:[[[0,0],[0,100]],[[100,0],[100,100]],[[0,50],[100,50]]],
 i:[[[50,0],[50,100]]],
 j:[[[75,0],[75,72],[66,92],[45,100],[24,92],[12,72]]],
 k:[[[0,0],[0,100]],[[90,0],[0,58]],[[28,40],[92,100]]],
 l:[[[0,0],[0,100],[80,100]]],
 m:[[[0,100],[0,0],[50,62],[100,0],[100,100]]],
 n:[[[0,100],[0,0],[100,100],[100,0]]],
 o:[_arc(50,50,45,50,-90,270,20)],
 p:[[[0,100],[0,0],[60,0],[86,12],[86,40],[60,52],[0,52]]],
 q:[_arc(50,48,45,48,-90,270,20),[[58,70],[100,108]]],
 r:[[[0,100],[0,0],[60,0],[86,12],[86,38],[60,50],[0,50]],[[30,50],[92,100]]],
 s:[[[90,12],[70,0],[30,0],[8,12],[8,34],[30,47],[70,53],[92,66],[92,88],[70,100],[30,100],[8,88]]],
 t:[[[0,0],[100,0]],[[50,0],[50,100]]],
 u:[[[0,0],[0,68],[14,92],[50,100],[86,92],[100,68],[100,0]]],
 v:[[[0,0],[50,100],[100,0]]],
 w:[[[0,0],[25,100],[50,30],[75,100],[100,0]]],
 x:[[[0,0],[100,100]],[[100,0],[0,100]]],
 y:[[[0,0],[50,50]],[[100,0],[50,50],[50,100]]],
 z:[[[0,0],[100,0],[0,100],[100,100]]]
};
// variantes (minúsculas e jeitos comuns de escrever)
const GLYPH_ALT=[
 ['a',[_arc(45,62,38,36,-20,340,16),[[84,26],[84,100]]]],
 ['e',[[[10,58],[90,58],[86,32],[58,16],[26,22],[10,52],[20,86],[50,100],[86,88]]]],
 ['i',[[[20,0],[80,0]],[[50,0],[50,100]],[[20,100],[80,100]]]],
 ['j',[[[30,0],[95,0]],[[75,0],[75,72],[66,92],[45,100],[24,92],[12,72]]]],
 ['y',[[[0,0],[50,50],[100,0]],[[50,50],[50,100]]]],
 ['n',[[[0,30],[0,100]],[[0,58],[22,36],[52,30],[80,40],[86,62],[86,100]]]],
 ['h',[[[0,0],[0,100]],[[0,62],[30,42],[68,42],[86,62],[86,100]]]],
 ['r',[[[0,30],[0,100]],[[0,62],[24,38],[60,30],[88,36]]]],
 ['t',[[[42,0],[42,84],[56,100],[82,95]],[[10,32],[80,32]]]],
 ['b',[[[0,0],[0,100]],_arc(42,68,40,32,-180,180,14)]],
 ['d',[[[90,0],[90,100]],_arc(48,68,40,32,0,360,14)]],
 ['m',[[[0,100],[0,30]],[[0,50],[12,32],[30,30],[44,44],[46,100]],[[46,50],[58,32],[78,30],[92,44],[94,100]]]],
 ['u',[[[0,0],[0,68],[14,92],[50,100],[86,92],[100,68]],[[100,0],[100,100]]]],
 ['g',[_arc(48,32,38,32,0,360,14),[[86,10],[86,92],[70,104],[40,108],[18,96]]]],
 ['q',[_arc(48,32,38,32,0,360,14),[[86,10],[86,112]]]]
];

// ---------- $P Point-Cloud ----------
const P_N=32;
function pResample(pts,n){
 let L=0;for(let i=1;i<pts.length;i++)if(pts[i].s===pts[i-1].s)L+=Math.hypot(pts[i].x-pts[i-1].x,pts[i].y-pts[i-1].y);
 const I=L/(n-1),out=[{x:pts[0].x,y:pts[0].y,s:pts[0].s}];let D=0;const P=pts.map(p=>({x:p.x,y:p.y,s:p.s}));
 for(let i=1;i<P.length;i++){
  if(P[i].s!==P[i-1].s)continue;
  const d=Math.hypot(P[i].x-P[i-1].x,P[i].y-P[i-1].y);
  if(I>0&&D+d>=I){const k=(I-D)/d,q={x:P[i-1].x+k*(P[i].x-P[i-1].x),y:P[i-1].y+k*(P[i].y-P[i-1].y),s:P[i].s};out.push(q);P.splice(i,0,q);D=0}
  else D+=d;
 }
 while(out.length<n){const l=P[P.length-1];out.push({x:l.x,y:l.y,s:l.s})}
 return out.slice(0,n);
}
function pNormalize(pts){
 let minX=1e9,minY=1e9,maxX=-1e9,maxY=-1e9;for(const p of pts){minX=Math.min(minX,p.x);minY=Math.min(minY,p.y);maxX=Math.max(maxX,p.x);maxY=Math.max(maxY,p.y)}
 const sz=Math.max(maxX-minX,maxY-minY)||1;let cx=0,cy=0;
 const o=pts.map(p=>({x:(p.x-minX)/sz,y:(p.y-minY)/sz}));for(const p of o){cx+=p.x;cy+=p.y}cx/=o.length;cy/=o.length;
 for(const p of o){p.x-=cx;p.y-=cy}return o;
}
const _used=new Uint8Array(64); // buffer reutilizado (sem alocar por comparação)
function pCloudDist(a,b,start,limit){
 const n=a.length,used=_used;used.fill(0,0,n);let sum=0,i=start;
 do{let min=1e9,idx=-1;for(let j=0;j<n;j++)if(!used[j]){const dx=a[i].x-b[j].x,dy=a[i].y-b[j].y,d=dx*dx+dy*dy;if(d<min){min=d;idx=j}}
  used[idx]=1;sum+=(1-((i-start+n)%n)/n)*Math.sqrt(min);if(sum>=limit)return sum; // já perdeu para o melhor: abandona
  i=(i+1)%n}while(i!==start);
 return sum;
}
function pMatch(a,b,limit){const n=a.length,step=Math.floor(Math.pow(n,.5));let best=limit;for(let i=0;i<n;i+=step){const d1=pCloudDist(a,b,i,best);if(d1<best)best=d1;const d2=pCloudDist(b,a,i,best);if(d2<best)best=d2}return best}
const toPts=strokes=>{const p=[];strokes.forEach((st,s)=>st.forEach(([x,y])=>p.push({x,y,s})));return p};
const P_TEMPLATES=Object.entries(GLYPHS).concat(GLYPH_ALT).map(([ch,strokes])=>({ch,pts:pNormalize(pResample(toPts(strokes),P_N))}));
// candidatos: letras que fazem sentido agora recebem um pequeno desconto (não força a resposta: só desempata formas parecidas)
function recognize(strokes,cands){
 const pts=[];strokes.forEach((st,s)=>st.forEach(p=>pts.push({x:p.x,y:p.y,s})));
 if(pts.length<2)return null;
 const c=pNormalize(pResample(pts,P_N));let best=null,bd=1e9;
 const bias=typeof DeviceManager!=='undefined'&&DeviceManager.isMobile?MOBILE_TUNING.gestureBias:.82; // mobile: ~17% mais permissivo
 for(const T of P_TEMPLATES){const k=cands&&cands.has(T.ch)?bias:1,lim=bd/k,raw=pMatch(c,T.pts,lim);
  if(raw>=lim)continue; // abandonado: nunca compete (evita empate falso por arredondamento de (bd/k)·k)
  const d=raw*k;if(d<bd){bd=d;best=T.ch}}
 return{ch:best,score:bd};
}

// ---------- 🔮 RUNAS: reconhecimento de formas ----------
// 1) Linhas (— | / \ ‖ + ×) por GEOMETRIA: traço reto (corda/comprimento > 0,9) e ângulo em faixas de 45° → tolerância de
//    ±22,5° (o máximo possível: 25° colocaria uma linha mais perto da diagonal vizinha). 2 traços: paralelos ou cruzados.
// 2) Demais formas pelo $P com cada modelo também girado em ±12° e ±24° (traço torto até ~25° ainda casa).
//    Grade padronizada: os pontos são reamostrados e escalados para um quadro de 64×64 antes da comparação.
const RUNE_GRID=64;
function rotStrokes(strokes,deg){const a=deg*Math.PI/180,c=Math.cos(a),s=Math.sin(a);return strokes.map(st=>st.map(([x,y])=>{const dx=x-50,dy=y-50;return[50+dx*c-dy*s,50+dx*s+dy*c]}))}
const toGrid=pts=>{for(const p of pts){p.x*=RUNE_GRID;p.y*=RUNE_GRID}return pts}; // escala uniforme: não muda a decisão do $P, só a unidade
// formas FECHADAS (início ≈ fim) e quantos cantos cada uma tem — é assim que o olho separa ○ de ◇, Δ de 💧 e □ de S
const RUNE_CLOSED={circle:0,oval:0,inf:0,drop:1,moon:2,tri:3,itri:3,square:4,diamond:4};
// formas ABERTAS de 1 traço: quantos cantos vivos têm (0 = curva suave). Ex.: um ">" estreito parecia ")" para o $P
const RUNE_OPEN_CORNERS={vee:1,caret:1,less:1,more:1,step:1,corner:1,zzn:2,zzz:2,bolt:2,lparen:0,rparen:0,cup:0,dome:0}; // ~ e S ficam de fora: tremida da mão cria cantos falsos neles
const RUNE_TEMPLATES=[];
const RUNE_STRETCH={more:[[.5,1],[.7,1]],less:[[.5,1],[.7,1]],vee:[[1,.5],[1,.7]],caret:[[1,.5],[1,.7]],rparen:[[.45,1],[1.6,1]],lparen:[[.45,1],[1.6,1]],cup:[[1,.5]],dome:[[1,.5]]};
if(typeof RUNE_SHAPES!=='undefined')for(const sh of RUNE_SHAPES){
 // linhas também entram no $P (rotação pequena) como reserva para traço trêmulo que não passou no teste de "reto"
 const rots=sh.id==='circle'||sh.pair?[0]:sh.line!=null?[0,-10,10]:(sh.id==='square'||sh.id==='diamond')?[0,-12,12]:[0,-12,12,-24,24];
 for(const r of rots)RUNE_TEMPLATES.push({ch:sh.code,id:sh.id,closed:sh.id in RUNE_CLOSED,pts:toGrid(pNormalize(pResample(toPts(rotStrokes(sh.strokes,r)),P_N)))});
 // o $P não ignora a proporção: um ">" estreito parecia ")". Ângulos e parênteses ganham versões estreita/larga (rasa/funda)
 const st=RUNE_STRETCH[sh.id];if(st)for(const[sx,sy]of st)RUNE_TEMPLATES.push({ch:sh.code,id:sh.id,closed:false,pts:toGrid(pNormalize(pResample(toPts(sh.strokes.map(s=>s.map(([x,y])=>[50+(x-50)*sx,50+(y-50)*sy]))),P_N)))});
}
// cantos: mudança de direção forte (> 55°) num traço reamostrado
function strokeCorners(st){
 const n=48,P=pResample(st.map(p=>({x:p.x,y:p.y,s:0})),n),k=2;let c=0,prev=false;
 for(let i=k;i<n-k;i++){const ax=P[i].x-P[i-k].x,ay=P[i].y-P[i-k].y,bx=P[i+k].x-P[i].x,by=P[i+k].y-P[i].y;
  const d=Math.abs(Math.atan2(ax*by-ay*bx,ax*bx+ay*by))*180/Math.PI,on=d>55;if(on&&!prev)c++;prev=on}
 return c;
}
function strokeGeo(st){
 let L=0;for(let i=1;i<st.length;i++)L+=Math.hypot(st[i].x-st[i-1].x,st[i].y-st[i-1].y);
 const a=st[0],b=st[st.length-1],d=Math.hypot(b.x-a.x,b.y-a.y);
 let mx=1e9,my=1e9,Mx=-1e9,My=-1e9;for(const p of st){if(p.x<mx)mx=p.x;if(p.y<my)my=p.y;if(p.x>Mx)Mx=p.x;if(p.y>My)My=p.y}
 const size=Math.max(Mx-mx,My-my);
 return{L,size,closed:L>size*2&&d<size*.25,straight:L>10&&d/L>.88,ang:((Math.atan2(-(b.y-a.y),b.x-a.x)*180/Math.PI)%180+180)%180,a,b};
}
const lineCode=ang=>ang<22.5||ang>=157.5?'a':ang<67.5?'c':ang<112.5?'b':'d';
const angDiff=(p,q)=>{const d=Math.abs(p-q)%180;return Math.min(d,180-d)};
function segCross(p1,p2,p3,p4){const d=(p2.x-p1.x)*(p4.y-p3.y)-(p2.y-p1.y)*(p4.x-p3.x);if(!d)return false;
 const u=((p3.x-p1.x)*(p4.y-p3.y)-(p3.y-p1.y)*(p4.x-p3.x))/d,v=((p3.x-p1.x)*(p2.y-p1.y)-(p3.y-p1.y)*(p2.x-p1.x))/d;return u>-.15&&u<1.15&&v>-.15&&v<1.15}
const RUNE_SNAP=1.5; // quão "perto" da forma esperada o desenho precisa ficar para valer por ela (1 = desligado)
function recognizeRune(strokes,cands){
 if(!strokes.length)return null;
 // atalho geométrico (linhas, ‖, +, ×): vale direto se for uma forma esperada; senão o $P ainda pode achar a esperada
 const hasC=cands&&cands.size,geo=ch=>({ch,score:0});let geoGuess=null;
 if(strokes.length===1){const g=strokeGeo(strokes[0]);if(g.straight){geoGuess=geo(lineCode(g.ang));if(!hasC||cands.has(geoGuess.ch))return geoGuess}}
 if(strokes.length===2){
  const g1=strokeGeo(strokes[0]),g2=strokeGeo(strokes[1]);
  if(g1.straight&&g2.straight){
   const par=angDiff(g1.ang,g2.ang)<25,cross=segCross(g1.a,g1.b,g2.a,g2.b);
   if(par&&!cross&&Math.abs(g1.ang-90)<30&&Math.abs(g2.ang-90)<30)geoGuess=geo('e'); // ‖
   else if(cross&&angDiff(g1.ang,g2.ang)>55){
    // + ou ×: o par está mais perto dos eixos (0°/90°) ou das diagonais (45°/135°)?
    const ax=a=>{const m=a%90;return Math.min(m,90-m)};geoGuess=geo((ax(g1.ang)+ax(g2.ang))/2<22.5?'f':'g');
   }
   if(geoGuess&&(!hasC||cands.has(geoGuess.ch)))return geoGuess;
  }
 }
 const pts=[];strokes.forEach((st,si)=>st.forEach(p=>pts.push({x:p.x,y:p.y,s:si})));if(pts.length<2)return null;
 const c=toGrid(pNormalize(pResample(pts,P_N)));
 const bias=typeof RUNE_CURVE!=='undefined'?RUNE_CURVE.bias:.82; // modo runas: mais tolerante com a forma esperada (desktop e celular)
 // 1 traço: fechado → só formas fechadas com nº de cantos compatível (±1); aberto → nunca uma forma fechada
 let filt=null,cn=-1;
 if(strokes.length===1){const g=strokeGeo(strokes[0]);
  cn=strokeCorners(strokes[0]);if(g.closed)filt=T=>T.closed;else filt=T=>!T.closed;
 }
 let best=null,bd=1e9;
 for(let pass=0;pass<2&&!best;pass++) // se o filtro não deixar ninguém, tenta sem filtro
 for(const T of RUNE_TEMPLATES){if(pass===0&&filt&&!filt(T))continue;let k=cands&&cands.has(T.ch)?bias:1;if(cn>=0&&T.closed)k*=1+.5*Math.max(0,Math.abs(RUNE_CLOSED[T.id]-cn)-1); // nº de cantos incompatível: penaliza
  else if(cn>=0&&T.id in RUNE_OPEN_CORNERS&&(RUNE_OPEN_CORNERS[T.id]===0)!==(cn===0))k*=1.6; // canto vivo × curva suave: penaliza (sem excluir — a mão treme)
  const lim=bd/k,raw=pMatch(c,T.pts,lim);if(raw>=lim)continue;const d=raw*k;if(d<bd){bd=d;best=T.ch}}
 // 🎯 "ímã" da forma esperada: se o desenho ficou a até RUNE_SNAP× da melhor forma, vale a que está na tela
 //  (o jogador desenhou "quase igual" — ex.: ")" meio torto lido como ">" — e não é punido por isso)
 if(hasC&&(!best||!cands.has(best))){let cb=null,cd=1e9;
  for(const T of RUNE_TEMPLATES){if(!cands.has(T.ch))continue;const d=pMatch(c,T.pts,cd/bias)*bias;if(d<cd){cd=d;cb=T.ch}}
  if(cb&&(!best||cd<=bd*RUNE_SNAP))return{ch:cb,score:cd/RUNE_GRID};
 }
 if(geoGuess&&(!best||!(hasC&&cands.has(best))))return geoGuess;
 return best?{ch:best,score:bd/RUNE_GRID}:null;
}

// qualidade do $P (distância; menor = melhor). Medido: letras bem desenhadas ≤ ~1,0 · Γ (F sem o meio) ≈ 1,3 ·
// rabisco ≈ 1,5 · traço reto solto ≈ 2,3
const GEST_SURE=1.1,GEST_REJECT=1.45;
// ---------- módulo de entrada ----------
const Input={
 mode:'keys',strokes:[],cur:null,timer:0,cv:null,cx:null,k:1,
 get chosen(){return store.get('inputMode',null)!==null}, // o jogador já escolheu o estilo de controle?
 init(){
  this.mode=store.get('inputMode','draw');
  this.cv=$('gest');this.cx=this.cv.getContext('2d');
  // teclado virtual tocável (delegação; pointerdown responde sem o atraso do click)
  $('kb').addEventListener('pointerdown',e=>{const k=e.target.closest('[data-k]');if(!k||state!=='play')return;e.preventDefault();onLetter(k.dataset.k)});
  $('kacc').addEventListener('pointerdown',e=>{const k=e.target.closest('[data-k]');if(!k||state!=='play')return;e.preventDefault();onLetter(k.dataset.k)});
  $('kacts').addEventListener('pointerdown',e=>{const b=e.target.closest('[data-act]');if(!b||state!=='play')return;e.preventDefault();const a=b.dataset.act;if(a==='pause')pause();else if(a==='cancel')cancelTarget();else meteors()}); // ⏸️ abre a pausa (com a troca de controle ⚙️)
  // gestos sobre o canvas
  const c=this.cv;
  c.addEventListener('pointerdown',e=>this.down(e));c.addEventListener('pointermove',e=>this.move(e));
  c.addEventListener('pointerup',e=>this.up(e));c.addEventListener('pointercancel',e=>this.up(e));
  if(window.ResizeObserver)new ResizeObserver(()=>this.fit()).observe(c);
  this.sync();
 },
 setMode(m){this.mode=m;store.set('inputMode',m);this.clear(true);this.sync();snd(m==='draw'?880:660,.06,'triangle',.04)},
 sync(){
  const runes=typeof GAME_STYLE!=='undefined'&&GAME_STYLE==='runes',letters=typeof GAME_STYLE!=='undefined'&&GAME_STYLE==='letters';
  const draw=runes||(DeviceManager.isMobile&&this.mode==='draw'); // letras desenhadas: só no celular · runas: celular e mouse
  document.body.classList.toggle('in-draw',draw);document.body.classList.toggle('in-runes',runes);document.body.classList.toggle('in-letters',letters);
  // runas (e letras desenhadas): nada de campo de texto ativo — tira o foco de qualquer input para o teclado do sistema nunca abrir
  if(draw&&document.activeElement&&/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName))document.activeElement.blur();
  if(typeof fitMenuMobile==='function')fitMenuMobile(); // a barra inferior mudou de altura → reencaixa o campo
  this.fit();
 },
 fit(){const r=this.cv.getBoundingClientRect();if(!r.width)return;const d=DeviceManager.dpr;this.k=d;const w=Math.round(r.width*d),h=Math.round(r.height*d);if(this.cv.width!==w||this.cv.height!==h){this.cv.width=w;this.cv.height=h}this.cx.setTransform(d,0,0,d,0,0)},
 rect:null,
 pos(e){const r=this.rect||(this.rect=this.cv.getBoundingClientRect());return{x:e.clientX-r.left,y:e.clientY-r.top}},
 down(e){
  if(state!=='play'||!document.body.classList.contains('in-draw'))return;
  e.preventDefault();try{this.cv.setPointerCapture(e.pointerId)}catch(_){} // captura falha em ponteiros já encerrados: o traço segue mesmo assim
  clearTimeout(this.timer);
  if(this.cv.classList.contains('fade'))this.clear(true);
  this.rect=this.cv.getBoundingClientRect();
  const p=this.pos(e);this.cur=[p];this.strokes.push(this.cur);this.dot(p);
 },
 move(e){
  if(!this.cur)return;e.preventDefault();
  const r=this.rect||(this.rect=this.cv.getBoundingClientRect()),x=e.clientX-r.left,y=e.clientY-r.top,l=this.cur[this.cur.length-1],dx=x-l.x,dy=y-l.y;
  if(dx*dx+dy*dy<25)return; // < 5 px: descarta (downsampling do traço)
  const p={x,y};this.cur.push(p);this.seg(l,p);
 },
 up(e){
  if(!this.cur)return;this.cur=null;
  // espera por mais traços (A, E, F, H, T, X… têm mais de um). Se o desenho ATÉ AGORA já é uma letra/runa da tela,
  //  confirma rápido (0,34 s); se ainda não bate com nada (ex.: só o "|" do F), dá tempo para o próximo traço (0,85 s).
  clearTimeout(this.timer);let wait=340;
  if(G&&this.strokes.length<4){const c=this.candidates(),runes=G.runes,r=runes?recognizeRune(this.strokes,c):recognize(this.strokes,c);
   if(!r||!r.ch||!c.has(r.ch)||(!runes&&r.score>GEST_SURE))wait=850} // parecido mas incompleto (ex.: Γ do F sem o traço do meio) → espera
  this.timer=setTimeout(()=>this.finish(),wait);
 },
 // rastro mágico: aura larga + núcleo claro + faíscas simples (sem shadowBlur)
 seg(a,b){const c=this.cx;c.lineCap='round';c.strokeStyle='#ffe9a8';c.lineWidth=7;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke()}, // rastro simples: 1 linha, largura fixa
 dot(p,r){const c=this.cx;c.fillStyle='#fff6d0';c.beginPath();c.arc(p.x,p.y,r||3,0,6.283);c.fill()},
 finish(){
  const strokes=this.strokes;this.strokes=[];
  let minX=1e9,minY=1e9,maxX=-1e9,maxY=-1e9;for(const s of strokes)for(const p of s){minX=Math.min(minX,p.x);minY=Math.min(minY,p.y);maxX=Math.max(maxX,p.x);maxY=Math.max(maxY,p.y)}
  if(!strokes.length||Math.max(maxX-minX,maxY-minY)<14){this.clear(false);return} // toque acidental
  const runes=G&&G.runes,r=runes?recognizeRune(strokes,this.candidates()):recognize(strokes,this.candidates());
  this.clear(false);if(!r||state!=='play')return;
  // rabisco/traço solto que não parece letra nenhuma (ex.: o "—" que sobrou depois de um F já aceito): ignora, sem contar erro
  if(!runes&&(!r.ch||r.score>GEST_REJECT)){this.hint('?',(minX+maxX)/2,(minY+maxY)/2);return}
  this.hint(runes?RUNE_BY_CODE[r.ch].glyph:r.ch,(minX+maxX)/2,(minY+maxY)/2);
  onLetter(runes?r.ch:this.toExpected(r.ch));
 },
 // letras plausíveis agora: próxima letra do alvo, ou a primeira letra de cada inimigo na tela
 candidates(){
  const s=new Set();if(!G)return s;
  if(G.target){const ch=G.target.word[G.target.typed];if(ch)s.add(norm(ch))}
  else for(const e of G.enemies)s.add(norm(e.word[0]));
  return s;
 },
 // desenhando, acentos não são exigidos: "a" vale pelo "ã" esperado (o til/acento não dá para desenhar com precisão)
 toExpected(ch){
  if(!G)return ch;
  if(G.target){const exp=G.target.word[G.target.typed];return exp&&norm(exp)===ch?exp:ch}
  for(const e of G.enemies)if(norm(e.word[0])===ch)return e.word[0];
  return ch;
 },
 hint(ch,x,y){const h=$('gestHint');if(DeviceManager.isMobile){const r=this.cv.getBoundingClientRect();x+=r.left;y+=r.top} // celular: a dica é fixa na tela (a camada de desenho passa do campo)
h.textContent=ch.length===1?ch.toUpperCase():ch;h.style.left=x+'px';h.style.top=y+'px';h.classList.remove('pop');void h.offsetWidth;h.classList.add('pop')},
 // dissolução sutil do rastro (opacidade no compositor) e limpeza
 clear(now){
  const c=this.cv;clearTimeout(this.timer);this.cur=null;
  if(now){c.classList.remove('fade');this.cx.clearRect(0,0,c.width,c.height);this.strokes=[];return}
  c.classList.add('fade');setTimeout(()=>{if(this.strokes.length||this.cur)return;this.cx.clearRect(0,0,c.width,c.height);c.classList.remove('fade')},200);
 }
};
