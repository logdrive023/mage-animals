// Mage Animals — teste: o painel do menu (balão + "Escolha sua Aventura") não pode cobrir o corpo dos magos.
// Uso no console: menuBodyCheck() → para cada cena, pés do mago (px na tela) × topo do painel. folga ≥ 0 = corpo inteiro visível.
function menuBodyCheck(){
 if(modalOpen)closeModal();
 const out=[];
 for(const S of MENU_SCENES){
  setMenuScene(S.id);showMenu.done=true;showMenu();syncChrome();fitMenuMobile();fitMenuLift();draw(1/60);
  const cv=$('game').getBoundingClientRect(),k=cv.height/H;
  // object-fit:cover no celular: o canvas pode estar recortado em cima/embaixo
  const cover=getComputedStyle($('game')).objectFit==='cover',scale=cover?Math.max(cv.width/W,cv.height/H):k,offY=cover?(cv.height-H*scale)*.58:0;
  const feet=Math.max(...castOf(S).map(m=>m.ay+134*m.s)),head=Math.min(...castOf(S).map(m=>m.ay+18*m.s));
  const L=typeof menuLift==='number'?menuLift:0,feetPx=cv.top+offY+(feet-L)*scale,headPx=cv.top+offY+(head-L)*scale;
  const w=document.querySelector('.mwidget'),c=document.querySelector('.overlay.menu .mcard');
  const top=Math.min(w?w.getBoundingClientRect().top:1e9,c?c.getBoundingClientRect().top:1e9);
  out.push({cena:S.id,sobe:L,cabeca:Math.round(headPx),pes:Math.round(feetPx),painel:Math.round(top),folga:Math.round(top-feetPx),ok:top-feetPx>=-4});
 }
 setMenuScene('tavern');showMenu();
 return{tela:innerWidth+'x'+innerHeight,cenas:out,tudoOk:out.every(o=>o.ok)};
}
