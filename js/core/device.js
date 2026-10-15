// Mage Animals — js/core/device.js · Detector central de ambiente (unified codebase: desktop + mobile no mesmo código).
// Tudo que é "só no mobile" pergunta a DeviceManager.isMobile; o desktop mantém fidelidade gráfica máxima.
// Teste no desktop: abra com ?device=mobile (ou ?device=desktop para forçar o contrário).
'use strict';

const DeviceManager={
 isMobile:false,isTouch:false,dpr:1,forced:null,
 init(){
  const q=(location.search.match(/device=(mobile|desktop)/)||[])[1]||null;this.forced=q;
  this.isTouch=('ontouchstart' in window)||(navigator.maxTouchPoints>0)||q==='mobile';
  // celular em paisagem tem largura > 768: usa o menor lado da tela para não tratar o telefone deitado como desktop
  this.isMobile=q?q==='mobile':this.isTouch&&Math.min(innerWidth,innerHeight)<=768;
  // no mobile o DPR do canvas fica em no máximo 1,25 (telas 3×/4× matariam a GPU) → menos VRAM, pixels e bateria
  const raw=window.devicePixelRatio||1;
  this.dpr=this.isMobile?Math.min(raw,1.25):raw;
  const b=document.body.classList;
  b.toggle('is-mobile',this.isMobile);b.toggle('is-desktop',!this.isMobile);b.toggle('is-touch',this.isTouch);
 },
 // limites por plataforma (consultados pelo jogo e pelas vinhetas)
 get particleCap(){return this.isMobile?20:100},
 get menuFx(){return this.isMobile?.4:1} // fração de elementos secundários desenhados/emitidos no menu
};
DeviceManager.init();

// Mobile: sombras dinâmicas do Canvas desligadas de vez (ctx.shadowBlur vira no-op). O brilho continua via sprites pré-renderizados.
if(DeviceManager.isMobile){
 // shadowBlur/filter viram no-op: nenhum código (atual ou futuro) consegue ligar blur/sombra dinâmica no celular
 for(const[k,v]of[['shadowBlur',0],['filter','none']]){
  const d=Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype,k);
  if(d&&d.configurable)Object.defineProperty(CanvasRenderingContext2D.prototype,k,{configurable:true,get(){return v},set(){}});
 }
}
// girar o aparelho/redimensionar pode cruzar a fronteira mobile↔desktop: reavalia (sem recarregar) e reajusta o canvas
let _devT=0;
addEventListener('resize',()=>{clearTimeout(_devT);_devT=setTimeout(()=>{const was=DeviceManager.isMobile;DeviceManager.init();
 if(was!==DeviceManager.isMobile){if(typeof applyPanels==='function')applyPanels();if(typeof Input!=='undefined')Input.sync()}
 if(typeof fitCanvas==='function')fitCanvas()},150)});
