// Mage Animals — teste: o balão de fala (dialogues.js) fica dentro da tela e as falas automáticas não cobrem o rosto de nenhum mago.
// Uso no console: await bubbleCheck() → por cena: 6 falas automáticas (dentro da tela + sem cobrir rosto) e 1 clique forçado por mago (dentro da tela).
async function bubbleCheck(){
 if(modalOpen)closeModal();
 const out=[],wait=ms=>new Promise(r=>setTimeout(r,ms));
 const probe=(S,m,auto)=>{
  const b=Dialogues.el.getBoundingClientRect(),cls=Dialogues.el.className;
  if(auto&&!cls.includes(' on'))return{cena:S.id,mago:'auto',tipo:'auto',pos:'pulou (sem lugar livre)',ok:true}; // fala automática adiada é aceitável
  const covers=Dialogues.coversFace(castOf(S)),inside=b.left>=0&&b.right<=innerWidth&&b.top>=0&&b.bottom<=innerHeight;
  return{cena:S.id,mago:m||'auto',tipo:auto?'auto':'clique',pos:cls.includes('mb-left')?'esquerda':cls.includes('mb-side')?'direita':cls.includes('mb-below')?'embaixo':'cima',
   rect:[b.left|0,b.top|0,b.right|0,b.bottom|0],dentro:inside,cobreRosto:covers,ok:inside&&(!auto||!covers)};
 };
 for(const S of MENU_SCENES){
  setMenuScene(S.id);showMenu.done=true;showMenu();syncChrome();fitMenuMobile();fitMenuLift();draw(1/60);
  for(let i=0;i<6;i++){Dialogues.next();await wait(400);out.push(probe(S,null,true))}
  for(const m of castOf(S)){Dialogues.next(true,m);await wait(400);out.push(probe(S,m.ch,false))}
 }
 Dialogues.stop();setMenuScene('tavern');showMenu();
 return{tela:innerWidth+'x'+innerHeight,casos:out.length,pulos:out.filter(o=>o.pos&&o.pos.startsWith('pulou')).length,falhas:out.filter(o=>!o.ok),tudoOk:out.every(o=>o.ok)};
}
