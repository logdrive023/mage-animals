// Mage Animals — teste rápido de celular (rodar no console com ?device=mobile): await mobileCheck()
// Para cada modo (Letras, Palavras, Runas) inicia uma partida, simula alguns segundos e confere:
//  · fonte REAL dos rótulos (px na tela) · palavras sem acento/ç · 1 letra no modo Letras
//  · Runas/Letras sem caixa de texto, teclado ou campo focado · barra inferior dentro da tela · tempo de desenho
async function mobileCheck(){
 const out={vw:innerWidth,vh:innerHeight,modes:{}};
 const vis=el=>!!el&&getComputedStyle(el).display!=='none'&&el.getBoundingClientRect().height>0;
 for(const m of['letters','words','runes']){
  if(modalOpen)closeModal();
  pickMenuControl(m);newGame();syncChrome();
  await new Promise(r=>setTimeout(r,250)); // layout do modo partida (ResizeObserver → fitCanvas → labelScale)
  fitCanvas();
  for(let i=0;i<60*12&&state==='play';i++){update(1/60);for(const e of G.enemies)e.y=Math.min(e.y,H*.55)} // inimigos não chegam à torre
  const r=$('game').getBoundingClientRect(),k=r.width/W,words=G.enemies.map(e=>e.word);
  const t0=performance.now();for(let i=0;i<30;i++)draw(1/60);const ms=(performance.now()-t0)/30;
  const tb=document.querySelector('.typebar').getBoundingClientRect();
  const res={
   labelPxOnScreen:+(LBL.px*k).toFixed(1),labelScale:+LBL.s.toFixed(2),canvasCss:Math.round(r.width)+'x'+Math.round(r.height),
   enemies:words.join(','),noAccents:words.every(w=>/^[a-z]+$/.test(w)),
   singleLetter:m!=='letters'||words.every(w=>w.length===1),
   inputboxHidden:!vis($('inputbox')),keyboardHidden:!vis($('kb')),accRowHidden:!vis($('kacc')),
   noFocusedField:!/^(INPUT|TEXTAREA)$/.test((document.activeElement||{}).tagName||''),
   fitsScreen:tb.bottom<=innerHeight+1&&r.top>=0,drawMs:+ms.toFixed(2),
   domHud:vis($('mhud'))&&$('mhScore').textContent!=='',
   gestInside:(()=>{const g=$('gest').getBoundingClientRect();return g.right<=innerWidth+1&&g.bottom<=innerHeight+1})()
  };
  const fails=[];
  if(res.labelPxOnScreen<13)fails.push('rótulo pequeno');
  if(!res.noAccents)fails.push('acento');
  if(!res.singleLetter)fails.push('mais de 1 letra');
  if((m==='runes'||m==='letters')&&!res.inputboxHidden)fails.push('caixa de texto visível');
  if(m==='runes'&&!res.keyboardHidden)fails.push('teclado visível');
  if(m==='words'&&res.keyboardHidden)fails.push('teclado sumiu no modo Palavras');
  if(!res.accRowHidden)fails.push('linha de acentos');
  if(!res.noFocusedField)fails.push('campo focado');
  if(!res.fitsScreen)fails.push('barra fora da tela');
  if(!res.domHud)fails.push('HUD HTML ausente');
  if(!res.gestInside)fails.push('camada de desenho fora da tela');
  res.ok=fails.length?fails.join(' · '):'OK';
  out.modes[m]=res;
  clearGame();state='menu';showMenu();syncChrome();fitMenuMobile(); // (o loop pode estar pausado em aba oculta)
 }
 return out;
}
