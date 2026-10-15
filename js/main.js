// Mage Animals — Inicialização: eventos globais (teclado, foco, visibilidade, áudio) e boot.
'use strict';

// O navegador só libera áudio após um gesto do usuário.
['pointerdown','keydown'].forEach(ev=>window.addEventListener(ev,()=>musicStart(),{passive:true}));

// Teclado: atalhos globais, menus e digitação durante a partida.
window.addEventListener('keydown',ev=>{
 if(ev.key==='F2'){ev.preventDefault();toggleMusic();return}
 if(openSheetSide&&ev.key==='Escape'){closeSheets();return}
 if(modalOpen){if(ev.key==='Escape'||(ev.key==='Enter'&&ev.target.tagName!=='BUTTON')){ev.preventDefault();closeModal()}return}
 if(ev.ctrlKey||ev.altKey||ev.metaKey)return;
 const k=ev.key;
 if(state!=='play'){
  if(k==='Enter'){ev.preventDefault();if(state==='paused')resume();else if(state==='over'&&G&&G.mode==='duel')startDuel(G.duel.li);else newGame()}
  else if(k==='Escape'&&state==='paused')resume();
  else if(state==='paused'&&(k==='r'||k==='R')){ev.preventDefault();restartMatch()}
  else if(state==='paused'&&(k==='m'||k==='M')){ev.preventDefault();quitToMenu()}
  return;
 }
 if(k==='Escape'){pause();return}
 if(k===' '){ev.preventDefault();meteors();return}
 if(k==='Backspace'){ev.preventDefault();cancelTarget();return}
 if(G&&G.runes&&k.length===1)return; // modo runas: as letras do teclado não lançam feitiço (desenha-se com o mouse/dedo)
 if(k.length===1&&/[a-zà-ÿç]/i.test(k)){ev.preventDefault();onLetter(k.toLowerCase())} // caractere cru: a comparação de acentos fica em isCharMatch()
});

// Economia de CPU/bateria: aba oculta → pausa a partida e PARA o requestAnimationFrame.
document.addEventListener('visibilitychange',()=>{
 if(document.hidden){if(state==='play')pause();stopLoop()}
 else startLoop();
});
window.addEventListener('blur',()=>{if(state==='play')pause()});

// Boot
buildKb();applyI18n();applyPanels();renderProfile();renderSide();renderEnemyList();
renderBg(BIOMES[currentBiome].themes[0]);prewarmBiome(currentBiome);
loginCheck();showMenu();updateUI(true);
$('musicVol').value=Math.round(MUS.vol*100);
if(!MUS.on)$('musicBtn').classList.add('off');
updateAccUI();Input.init();
if(!profile.nickname)openProfile(true);
else if(canClaimLogin())openModal('missions','login');
startLoop();
