// Mage Animals — js/systems/story.js · Narrativa do Reino de Arcania.
// Introdução com o nome do jogador (apelido + @handle), nome sugerido do Reino e um capítulo da crônica para cada
// nível do Santuário (a história "anda" conforme a vila é reconstruída). Textos em i18n (story.*).
'use strict';

const Story={
 /** nome inicial do Reino: sorteado de forma estável pelo @handle (o mesmo jogador sempre recebe a mesma sugestão) */
 suggestName(){let h=0;const s=PlayerIdentity.handle;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return VILLAGE.names[Math.abs(h)%VILLAGE.names.length]},
 intro(){return t('story.intro',{n:'<b>'+esc(nickOr())+'</b>',h:esc(PlayerIdentity.handle)})},
 chapter(lv){return t('story.ch.'+Math.max(1,Math.min(VILLAGE.maxSanct,lv)))},
 title(lv){return t('village.titles.'+VILLAGE.titles[Math.min(VILLAGE.titles.length-1,Math.floor((lv-1)/2))])}
};
