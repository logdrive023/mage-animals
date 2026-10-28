// Mage Animals — Inicialização: eventos globais (teclado, foco, visibilidade, áudio) e boot.
'use strict';

// O navegador só libera áudio após um gesto do usuário.
['pointerdown','keydown'].forEach(ev=>window.addEventListener(ev,()=>musicStart(),{passive:true}));

// Teclado: atalhos globais, menus e digitação durante a partida.
window.addEventListener('keydown',ev=>{
 if(ev.key==='F2'){ev.preventDefault();toggleMusic();return}
 if(ChestUI.open){if(ev.key==='Escape'||ev.key==='Enter'){ev.preventDefault();if(ChestUI.done)ChestUI.collect(false);else ChestUI.skip()}return} // abertura de baús por cima de tudo
 if(openSheetSide&&ev.key==='Escape'){closeSheets();return}
 if(modalOpen&&modal.kind==='online'&&Net.state==='lobby'&&ev.key==='Enter'&&ev.target.tagName!=='INPUT'&&ev.target.tagName!=='BUTTON'){ev.preventDefault();Net.toggleReady();return} // ⚔️ lobby: Enter = pronto / jogar de novo
 if(modalOpen){if(ev.key==='Escape'||(ev.key==='Enter'&&ev.target.tagName!=='BUTTON')){ev.preventDefault();closeModal()}return}
 if(ev.ctrlKey||ev.altKey||ev.metaKey)return;
 const k=ev.key;
 if(state!=='play'){
  const online=state==='over'&&G&&G.duel&&G.duel.online;
  // Enter também lança a Arcana na partida: se o jogador estava apertando na hora da derrota, não reinicia sem querer
  if(k==='Enter'&&state==='over'&&G&&G.overAt&&performance.now()-G.overAt<400){ev.preventDefault();return}
  if(k==='Enter'){ev.preventDefault();if(state==='paused')resume();else if(online)Net.backToLobby();else if(state==='over'&&G&&G.mode==='duel')startDuel(G.duel.li);else playAgain()} // fim do desafio do dia → repete o desafio
  else if(k==='Escape'&&state==='paused')resume();
  else if(k==='Escape'&&state==='over'){if(online)Net.leave();quitToMenu()} // fim de jogo: ESC = voltar ao menu (atalho mostrado na tela)
  else if(state==='paused'&&(k==='r'||k==='R')){ev.preventDefault();restartMatch()}
  else if(state==='paused'&&(k==='m'||k==='M')){ev.preventDefault();quitToMenu()}
  return;
 }
 if(k==='Escape'){pause();return}
 if(G&&G.blessing){ev.preventDefault();if(k>='1'&&k<='3')arcBlessPick(+k-1);return} // 🎴 escolha da bênção: teclas 1–3
 if(k===' '){ev.preventDefault();if(G&&G.mode==='arcade'&&!(G.song&&Rhythm.hasLyrics))arcFreeze();return} // ❄️ Congelar · 🎤 com letra o ESPAÇO é só o espaço entre palavras
 if(k==='Enter'){ev.preventDefault();if(G&&G.mode==='arcade')arcBlast();return} // 💥 Explosão Arcana
 if(k==='Backspace'){ev.preventDefault();cancelTarget();return}
 if(k==='Tab'){ev.preventDefault();if(G&&G.song)Rhythm.skipLine();return} // ⏭ música: pula a frase da vez (só com 2+ frases acumuladas)
 if(G&&G.duel&&G.duel.online&&k>='1'&&k<='4'){ev.preventDefault();Net.emote(+k-1);return} // emotes na luta online
 if(G&&G.runes&&k.length===1)return; // modo runas: as letras do teclado não lançam feitiço (desenha-se com o mouse/dedo)
 if(k.length===1&&/[a-zà-ÿç]/i.test(k)){ev.preventDefault();onLetter(k.toLowerCase())} // caractere cru: a comparação de acentos fica em isCharMatch()
});

// Economia de CPU/bateria: aba oculta → pausa a partida e PARA o requestAnimationFrame.
document.addEventListener('visibilitychange',()=>{
 if(document.hidden){if(state==='play')pause();stopLoop()}
 else startLoop();
});
window.addEventListener('blur',()=>{if(state==='play'&&!songAdOpen())pause()}); // 📺 clique em "Pular" no anúncio do vídeo não pausa a partida

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
