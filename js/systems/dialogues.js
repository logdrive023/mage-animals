// Mage Animals — js/systems/dialogues.js · 💬 Falas dos magos no menu: balão flutuando ACIMA da cabeça do mago.
// Categorias sorteadas: 🎮 dicas de jogo · ⌨️ dicas de digitação · 📚 curiosidades de palavras · 😺 personalidade (falas
// próprias de cada mago). Aparece sozinho a cada 10–15 s, some depois de 5 s; tocar/clicar no mago força uma nova fala.
// Desempenho: 1 elemento DOM reutilizado, só opacity/transform animam; posição calculada só quando a fala troca.
'use strict';

const Dialogues={
 el:null,tShow:0,tHide:0,bags:{},last:'',
 SHOW:5000,GAP:[10000,15000],FIRST:1800,
 // i18nExtend guarda listas como objetos {0:…,1:…}: converte de volta para array (com fallback pt-BR)
 tr(k){const as=v=>v&&typeof v==='object'?(Array.isArray(v)?v:Object.keys(v).sort((a,b)=>a-b).map(i=>v[i])):null;return as(lookup(TRANSLATIONS[LANG],k))||as(lookup(TRANSLATIONS[FALLBACK_LANG],k))||[]},
 // "saco" embaralhado por categoria: não repete a mesma fala até passar por todas
 draw(key){let b=this.bags[key];if(!b||!b.length){b=this.bags[key]=this.tr(key).slice();for(let i=b.length-1;i>0;i--){const j=(Math.random()*(i+1))|0;[b[i],b[j]]=[b[j],b[i]]}}
  let s=b.pop();if(s===this.last&&b.length)s=b.pop();return s||''},
 /** sorteia categoria: 35% personalidade · 25% jogo · 20% digitação · 20% curiosidade */
 line(m){
  const r=Math.random(),ch=CHARS.find(c=>c.id===m.ch)||CHARS[0];
  if(r<.35)return{ic:ch.emoji,lab:charName(ch),s:this.draw('quips.'+ch.id)};
  if(r<.6)return{ic:'🎮',lab:t('dlg.lab.game'),s:Math.random()<.5?this.draw('dlg.game'):this.draw(DeviceManager.isMobile?'tips.mobile':'tips.desktop')};
  if(r<.8)return{ic:'⌨️',lab:t('dlg.lab.typing'),s:this.draw('dlg.typing')};
  return{ic:'📚',lab:t('dlg.lab.words'),s:this.draw('dlg.words')};
 },
 build(){
  if(this.el&&this.el.isConnected)return;
  const d=document.createElement('div');d.className='mbubble';d.id='mageBubble';d.setAttribute('aria-live','polite');
  d.innerHTML='<small id="mbLab"></small><p id="mbTxt"></p>';
  document.body.appendChild(d);this.el=d; // fixed no body: coordenadas de tela, independe do layout do .stage
 },
 start(){this.stop();if(state!=='menu')return;this.build();this.tShow=setTimeout(()=>this.next(),this.FIRST)},
 stop(){clearTimeout(this.tShow);clearTimeout(this.tHide);if(this.el)this.el.classList.remove('on')},
 /** mostra uma fala; m = membro do elenco que fala (padrão: sorteado entre os da cena) */
 next(byUser,m){
  if(state!=='menu'||modalOpen)return this.schedule();
  this.build();clearTimeout(this.tShow);clearTimeout(this.tHide);
  const S=curScene(),cast=castOf(S),forced=m;
  // fala automática: tenta o elenco em ordem aleatória e fica com o 1º cujo balão não cobre o rosto de ninguém
  const order=forced?[forced]:cast.slice().sort(()=>Math.random()-.5),el=this.el;let ok=false;
  el.classList.remove('on');
  for(const c of order){
   const q=this.line(c);if(!q.s)continue;
   $('mbLab').textContent=q.ic+' '+q.lab;$('mbTxt').textContent=q.s;this.last=q.s;
   this.place(c);if(forced||!this.coversFace(cast)){ok=true;break}
  }
  if(!ok)return this.schedule(); // cena apertada demais (ex.: fogueira numa tela de 320 px): espera a próxima vez — o clique no mago ainda força a fala
  void el.offsetWidth;el.classList.add('on');
  if(byUser)snd(880+Math.random()*220,.05,'triangle',.025);
  this.tHide=setTimeout(()=>{el.classList.remove('on');this.schedule()},this.SHOW);
 },
 schedule(){clearTimeout(this.tShow);this.tShow=setTimeout(()=>this.next(),this.GAP[0]+Math.random()*(this.GAP[1]-this.GAP[0]))},
 /** cabeça do mago (coordenadas da cena) → tela; o balão fica acima dela (ou ao lado, se não couber em cima) */
 headPx(m){
  const cv=$('game'),r=cv.getBoundingClientRect(),cover=getComputedStyle(cv).objectFit==='cover';
  // cover (celular): escala única + recorte · fill (PC): escala X e Y independentes
  const sc=cover?Math.max(r.width/W,r.height/H):r.height/H,sx=cover?sc:r.width/W,offX=cover?(r.width-W*sc)/2:0,offY=cover?(r.height-H*sc)*.58:0,L=typeof menuLift==='number'?menuLift:0;
  return{x:r.left+offX+(m.ax+70*m.s)*sx,y:r.top+offY+(m.ay+16*m.s-L)*sc,w:140*m.s*sx,h:134*m.s*sc,top:r.top,left:r.left,right:r.right,sc};
 },
 /** posiciona o balão: testa os lugares em ordem de preferência e fica com o 1º que não cobre o rosto de nenhum mago da cena.
  *  em cima (livre) → ao lado direita/esquerda → ao lado afinado (tela estreita) → em cima encostando nas plaquinhas → embaixo do rosto → em cima (último caso) */
 place(m){
  const p=this.headPx(m),el=this.el,cast=castOf(curScene()),hr=p.x+p.w*.36,hl=p.x-p.w*.36;
  const set=(kind,maxW)=>{ // aplica um candidato; devolve false se ele não serve nesta tela
   el.classList.remove('mb-side','mb-left','mb-below');el.style.maxWidth=maxW?maxW+'px':'';
   const bw=el.offsetWidth||220,bh=el.offsetHeight||64;let x=p.x,y=p.y-8,side=0;
   if(kind==='up'&&y-bh<p.top+40)return false;
   if(kind==='upTight'&&y-bh<p.top+2)return false;
   if(kind==='upClamp')y=Math.max(y,p.top+bh+4);
   if(kind==='right'||kind==='left'){side=kind==='right'?1:-1;
    if(side>0?hr+bw+6>p.right:hl-bw-6<p.left)return false;
    el.classList.add('mb-side');if(side<0)el.classList.add('mb-left');x=side>0?hr+bw/2+4:hl-bw/2-4;y=Math.max(p.y+p.h*.18,p.top+bh/2+2)}
   if(kind==='below'){if(p.y+p.h*.46+bh>innerHeight-4)return false;el.classList.add('mb-below');y=p.y+p.h*.46}
   x=Math.max(p.left+bw/2+6,Math.min(p.right-bw/2-6,x));
   el.style.setProperty('--tx',side?'0px':Math.max(16-bw/2,Math.min(bw/2-16,p.x-x))+'px'); // a ponta aponta para a cabeça mesmo com o balão encostado na borda
   el.style.left=x+'px';el.style.top=y+'px';return true;
  };
  const rr=p.right-hr-10,rl=hl-p.left-10,narrow=Math.max(rr,rl)>=130?[[rr>=rl?'right':'left',Math.max(rr,rl)]]:[];
  const cands=[['up'],['right'],['left'],...narrow,['upTight'],['below']];
  let first=null;
  for(const[k,w]of cands){if(!set(k,w))continue;if(!first)first=[k,w];if(!this.coversFace(cast))return}
  if(first)set(first[0],first[1]);else set('upClamp'); // nenhum lugar livre: o melhor possível (a fala automática ainda pode ser adiada em next)
 },
 /** o balão (já posicionado, sem o deslocamento da animação) cobre o rosto de algum mago da cena? */
 faceRects(cast){return cast.map(o=>{const p=this.headPx(o);return{x0:p.x-p.w*.2,x1:p.x+p.w*.2,y0:p.y+p.h*.12,y1:p.y+p.h*.42}})},
 coversFace(cast){
  const el=this.el,bw=el.offsetWidth,bh=el.offsetHeight,x=parseFloat(el.style.left),y=parseFloat(el.style.top),cl=el.classList;
  const t=cl.contains('mb-side')?y-bh/2:cl.contains('mb-below')?y:y-bh,b={l:x-bw/2,r:x+bw/2,t,b:t+bh};
  return this.faceRects(cast).some(f=>b.l<f.x1&&b.r>f.x0&&b.t<f.y1&&b.b>f.y0);
 },
 /** toque/clique na cena: se acertou um mago, ele fala */
 hit(ev){
  if(state!=='menu'||modalOpen||ev.target.closest('button,.mcard,.mwidget,.mbubble,input'))return;
  for(const m of castOf(curScene())){const p=this.headPx(m),x0=p.x-p.w*.35,x1=p.x+p.w*.35,y0=p.y-p.h*.12,y1=p.y+p.h*.85;
   if(ev.clientX>=x0&&ev.clientX<=x1&&ev.clientY>=y0&&ev.clientY<=y1){this.next(true,m);return}}
 }
};
// compatibilidade: o resto do jogo chama Quips.start/stop
const Quips={start(){Dialogues.start()},stop(){Dialogues.stop()},next(u){Dialogues.next(u)},tr(k){return Dialogues.tr(k)}};
addEventListener('pointerdown',e=>{if(e.target.closest&&e.target.closest('.stage'))Dialogues.hit(e)});
addEventListener('resize',()=>{if(Dialogues.el)Dialogues.el.classList.remove('on')});
