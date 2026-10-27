// Mage Animals — js/render/sprites.js · 🖼️ Sprites oficiais dos magos (folha em js/render/chars-sheet.data.js).
// Na carga: recorta cada mago da folha e REMOVE o fundo azul-escuro com um preenchimento a partir das bordas do recorte
// (só some o fundo conectado à borda — os contornos escuros dentro do desenho ficam). Halos de brilho azulados viram
// semitransparentes. Resultado: 1 canvas por mago, desenhado com drawImage (custo ~0 por quadro).
// Magos sem recorte em CHAR_SPRITES continuam no desenho procedural (drawAvatar / drawWizard) — fallback automático.
'use strict';

// recorte (x,y,w,h) na imagem de origem · feet = y da linha do chão · gem = ponta do cajado (coordenadas da MESMA imagem)
// src: 'sheet' = folha principal (CHAR_SHEET_URI) · 'gato'/'coruja' = imagens avulsas (CHAR_IMG_URIS) — na folha eles vieram cortados
const CHAR_SPRITES={
 // key = até que brilho o azul-escuro ligado à borda conta como fundo: 200 na folha (contorno nítido, solta o halo do cajado);
 //  95 nas imagens avulsas pequenas (contorno suave: com 200 o preenchimento vazava para a túnica azul do Gato)
 gato:{src:'gato',x:6,y:10,w:136,h:162,feet:165,gem:[20,46],key:95},
 coelho:{src:'sheet',x:238,y:44,w:347,h:532,feet:562,gem:[537,241]},
 raposa:{src:'sheet',x:595,y:50,w:434,h:526,feet:553,gem:[992,236]},
 coruja:{src:'coruja',x:14,y:20,w:150,h:150,feet:160,gem:[127,48],key:95} // corta a ponta do cajado da raposa (x<14) e a faixa cinza da tela (x≥164)
};
const spriteFigH=R=>R.feet-R.y; // altura da figura (topo do recorte → pés): base da escala, igual para todos os magos

// 🔙 magos de COSTAS (CHAR_BACK_URI: arte com fundo azul liso, já recortada na área dos magos) — usados no mago da TORRE.
//  Mapeamento pela cor do manto (escolha do usuário): azul=Gato · verde=Coruja · vermelho=Raposa · turquesa=Coelho.
//  Na arte eles estão sobre o piso da torre (escuro, igual às sombras dos mantos) → cada um é cortado na linha `cut`, logo
//  abaixo da borda de trás da torre; no jogo um parapeito de pedra na frente cobre esse corte (como na arte conceitual).
//  seeds = pontos do corpo e da gema (a gema flutua solta entre as garras do cajado) · ex = região do vizinho a descartar
//  ax = eixo do corpo (fica em TX) · stoneY = daqui para baixo também some o cinza claro das pedras da borda de trás.
const backStaffR=y=>789-(y-50)*.16; // cajado da Raposa: divisa entre a Raposa e o Coelho
const CHAR_BACK={
 scale:.36,
 gato:{x:0,y:40,w:345,cut:435,stoneY:405,ax:155,gem:[285,96],seeds:[[155,380],[285,96]],ex:(x,y)=>x>=265&&y>=215},
 coruja:{x:260,y:0,w:345,cut:435,stoneY:405,ax:395,gem:[540,67],seeds:[[395,380],[540,67]],ex:(x,y)=>x<272&&y>250},
 raposa:{x:495,y:25,w:335,cut:435,stoneY:405,ax:615,gem:[769,91],seeds:[[615,380],[769,91]],ex:(x,y)=>y>165&&x>backStaffR(y)},
 coelho:{x:715,y:125,w:300,cut:465,stoneY:435,ax:825,gem:[966,182],seeds:[[825,400],[966,182]],ex:(x,y)=>x<backStaffR(y)+2}
};
/** recorte de um mago de costas: tira o azul do fundo (e o cinza claro das pedras abaixo de stoneY) a partir das bordas,
 *  apaga a região do vizinho e fica só com o que está ligado às sementes (corpo + gema) */
function cutBackSprite(im,R){
 const w=R.w,h=R.cut-R.y,cv=document.createElement('canvas');cv.width=w;cv.height=h;
 const c=cv.getContext('2d',{willReadFrequently:true});c.drawImage(im,R.x,R.y,w,h,0,0,w,h);
 const id=c.getImageData(0,0,w,h),d=id.data,N=w*h,rem=new Uint8Array(N),q=new Int32Array(N),ty=R.stoneY-R.y;let qh=0,qt=0;
 const kill=p=>{const i=p*4,r=d[i],g=d[i+1],b=d[i+2];if(Math.abs(r-41)<30&&Math.abs(g-51)<30&&Math.abs(b-110)<34)return true;
  if(((p/w)|0)<ty)return false;const mx=Math.max(r,g,b),mn=Math.min(r,g,b),L=(r+g+b)/3;return mx-mn<36&&L>45&&L<215};
 const push=p=>{if(!rem[p]&&kill(p)){rem[p]=1;q[qt++]=p}};
 for(let x=0;x<w;x++){push(x);push((h-1)*w+x)}for(let y=0;y<h;y++){push(y*w);push(y*w+w-1)}
 while(qh<qt){const p=q[qh++],x=p%w;if(x>0)push(p-1);if(x<w-1)push(p+1);if(p>=w)push(p-w);if(p<N-w)push(p+w)}
 for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(R.ex(x+R.x,y+R.y))rem[y*w+x]=1;          // vizinho fora
 const keep=new Uint8Array(N);qh=qt=0;
 for(const sd of R.seeds){const s=(sd[1]-R.y)*w+(sd[0]-R.x);if(s>=0&&s<N&&!rem[s]&&!keep[s]){keep[s]=1;q[qt++]=s}}
 while(qh<qt){const p=q[qh++],x=p%w,y=(p/w)|0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const X=x+dx,Y=y+dy;if(X<0||Y<0||X>=w||Y>=h)continue;const n=Y*w+X;if(!rem[n]&&!keep[n]){keep[n]=1;q[qt++]=n}}}
 for(let p=0;p<N;p++)if(!keep[p])d[p*4+3]=0;
 c.putImageData(id,0,0);return cv;
}
const Sprites={
 ready:false,cut:{},back:{},ver:0,
 has(id){return this.ready&&!!this.cut[id]},
 hasBack(id){return this.ready&&!!this.back[id]},
 load(){
  if(typeof CHAR_SHEET_URI==='undefined')return;
  const srcs={sheet:CHAR_SHEET_URI,...(typeof CHAR_IMG_URIS!=='undefined'?CHAR_IMG_URIS:{}),...(typeof CHAR_BACK_URI!=='undefined'?{back:CHAR_BACK_URI}:{})},imgs={};let left=0;
  for(const k in srcs){left++;const im=new Image();imgs[k]=im;im.onload=im.onerror=()=>{if(--left===0)try{this.build(imgs)}catch(e){this.ready=false}};im.src=srcs[k]}
 },
 build(imgs){
  for(const id in CHAR_SPRITES){const R=CHAR_SPRITES[id],im=imgs[R.src||'sheet'];if(!im||!im.naturalWidth)continue; // imagem faltando → esse mago fica no desenho procedural
   const cv=document.createElement('canvas');cv.width=R.w;cv.height=R.h; // 1:1 com a imagem de origem
   const c=cv.getContext('2d',{willReadFrequently:true});c.drawImage(im,R.x,R.y,R.w,R.h,0,0,R.w,R.h);
   keyOutBg(c,R.w,R.h,R.key||200);cv.lw=R.w;cv.lh=R.h;this.cut[id]=cv;
  }
  const bi=imgs.back;if(bi&&bi.naturalWidth)for(const id in CHAR_BACK){if(id==='scale')continue;try{this.back[id]=cutBackSprite(bi,CHAR_BACK[id])}catch(e){}}
  this.ready=true;this.ver++;
  if(typeof AVF!=='undefined')for(const k in AVF)delete AVF[k]; // retratos do menu (celular) refeitos com o sprite
  if(typeof renderSide==='function')renderSide();                                  // cards do painel direito
  if(typeof WZF!=='undefined')WZF.ch=null;if(typeof wizCh!=='undefined')wizCh=null;  // mago da torre: refaz os caches
 }
};
// fundo = azul muito escuro (b um pouco maior que r, pouca luz); halo = azulado mais claro ligado ao fundo (vira translúcido)
function keyOutBg(c,w,h,lim){
 const id=c.getImageData(0,0,w,h),d=id.data,seen=new Uint8Array(w*h),q=new Int32Array(w*h);let qh=0,qt=0;
 const bgLike=i=>{const r=d[i],g=d[i+1],b=d[i+2];return b>=r+5&&r+g+b<lim};
 const push=p=>{if(seen[p])return;seen[p]=1;if(bgLike(p*4))q[qt++]=p};
 for(let x=0;x<w;x++){push(x);push((h-1)*w+x)}for(let y=0;y<h;y++){push(y*w);push(y*w+w-1)}
 while(qh<qt){const p=q[qh++],i=p*4,s=d[i]+d[i+1]+d[i+2];
  d[i+3]=s<70?0:Math.round(255*Math.min(1,(s-70)/(lim-70))*(lim>120?.85:1)); // fundo some; halo/franja ligados ao fundo ficam translúcidos
  const x=p%w;if(x>0)push(p-1);if(x<w-1)push(p+1);if(p>=w)push(p-w);if(p<w*(h-1))push(p+w);
 }
 c.putImageData(id,0,0);
}
/** retrato do mago (cards, cenas do menu, perfil): sprite com respiração ancorada nos pés; senão, o desenho procedural.
 *  Mesmo quadro 140×140 do drawAvatar (pés em y=135) → serve de troca direta em qualquer lugar. */
function drawCharPortrait(c,ch,t,locked,blink){
 if(!Sprites.has(ch.id))return drawAvatar(c,ch,t,locked,blink);
 const R=CHAR_SPRITES[ch.id],S=Sprites.cut[ch.id],s=118/spriteFigH(R),fy=(R.feet-R.y)*s,br=Math.sin(t*2+ch.unlock);
 c.clearRect(0,0,140,140);c.save();
 const g=c.createRadialGradient(70,82,5,70,82,68);g.addColorStop(0,hexA(ch.color,.3));g.addColorStop(1,hexA(ch.color,0));c.fillStyle=g;c.fillRect(0,0,140,140);
 c.fillStyle='rgba(0,0,0,.3)';c.beginPath();c.ellipse(70,135,36,5,0,0,7);c.fill();c.fillStyle='rgba(0,0,0,.5)';c.beginPath();c.ellipse(70,135,24,3,0,0,7);c.fill();
 c.translate(70,135);c.scale(1-br*.006,1+br*.014);                                  // 🫁 respira a partir do chão
 c.drawImage(S,-R.w*s/2,-fy,R.w*s,R.h*s);
 if(!locked){const gx=(R.gem[0]-R.x-R.w/2)*s,gy=(R.gem[1]-R.feet)*s,p=.5+.5*Math.sin(t*1.8);c.globalCompositeOperation='lighter';c.globalAlpha=.35+.25*p;c.drawImage(glowSprite(ch.color),gx-12,gy-12,24,24)} // brilho calmo da gema
 c.restore();
 if(locked){c.globalCompositeOperation='source-atop';c.fillStyle='rgba(52,56,80,.84)';c.fillRect(0,0,140,140);c.globalCompositeOperation='source-over'}
}
/** gema do sprite no quadro 140×140 do retrato (cenas do menu: brilhos e anel de comemoração saem do cajado certo) */
function portraitGem(id){if(!Sprites.has(id))return null;const R=CHAR_SPRITES[id],s=118/spriteFigH(R);return[70+(R.gem[0]-R.x-R.w/2)*s,135+(R.gem[1]-R.feet)*s]}
Sprites.load();
