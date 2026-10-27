// Mage Animals — js/ui/modal-adventure.js · Card "Escolha Sua Aventura" (menu principal), estilo vidro premium.
// · Cards de aventura com ícones VETORIAIS de linha (SVG inline, cor por currentColor — nítidos em qualquer tela).
// · A aventura escolhida fica salva (mage_biome via setBiome) e o card abre com ela destacada.
// · Atalhos sem caixas: ícone linear + rótulo, 2 linhas; o último atalho usado fica com destaque dourado (mage_advNav).
// · Idiomas: botões circulares discretos no canto inferior direito.
'use strict';

const svgI=(p,vb)=>`<svg viewBox="${vb||'0 0 24 24'}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
// ícones das aventuras (32 px) — linha limpa, monocromática, acento por CSS
const ADV_ICONS={
 cosmic:svgI('<circle cx="15" cy="9" r="4.2"/><path d="M12 12 4 20M10.2 9.6 3.5 14.5M14.4 13.8 9.5 20.5"/><path d="M14 7.5h.01M16.6 9.8h.01"/>'),
 zombie:svgI('<path d="M6 10a6 6 0 0 1 12 0v4a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3z"/><path d="m8.6 9.4 2 2m0-2-2 2M15.4 9.4l-1.6 1.6"/><path d="M9 14.5h6M10.5 14.5v1.4M13.5 14.5v1.4"/><path d="M12 4V2.5M8.5 4.8 7.6 3.5"/>'),
 ocean:svgI('<path d="M2.5 15c2 0 2-1.6 4-1.6s2 1.6 4 1.6 2-1.6 4-1.6 2 1.6 4 1.6 2-1.6 3-1.6"/><path d="M2.5 19c2 0 2-1.6 4-1.6s2 1.6 4 1.6 2-1.6 4-1.6 2 1.6 4 1.6 2-1.6 3-1.6"/><path d="M7 11c0-4 3-7 7.5-7 2.5 0 4 1.4 4 3.2 0 1.5-1.2 2.6-2.7 2.6-1.4 0-2.3-1-2.3-2.1"/>')
};
// atalhos (ícone 18 px)
const ADV_NAV=[
 ['village','nav.villageShort',svgI('<path d="M3 10 12 4l9 6M5 10v9M19 10v9M9 19v-6h6v6M3 20h18"/>')],
 ['collection','nav.collection',svgI('<path d="M8 4 4 7l2 3 2-1v11h8V9l2 1 2-3-4-3a4 4 0 0 1-8 0z"/>')],
 ['online','nav.onlineShort',svgI('<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.4 2.5 3.4 5.3 3.4 8.5s-1 6-3.4 8.5c-2.4-2.5-3.4-5.3-3.4-8.5s1-6 3.4-8.5z"/>')],
 ['friends','nav.friendsShort',svgI('<circle cx="9" cy="8.5" r="3.2"/><path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5"/><circle cx="16.5" cy="9.5" r="2.6"/><path d="M15.6 14.2c2.4.2 4.2 1.8 4.7 4.3"/>')],
 ['duel','nav.duel',svgI('<path d="M4 4l9 9M20 4l-9 9M7 14l-3 3 3 3 3-3M17 14l3 3-3 3-3-3M4 4h3v3M20 4h-3v3"/>')],
 ['missions','nav.missions',svgI('<path d="M7 4h11a2 2 0 0 1 0 4h-1v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1h10"/><path d="M7 4a2 2 0 0 0-2 2v11M9.5 10h4M9.5 13.5h4"/>')],
 ['ranking','nav.ranking',svgI('<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20h7M10 17h4"/>')],
 ['dictionary','nav.dictionary',svgI('<path d="M4 5.5C6 4.5 9 4.5 12 6c3-1.5 6-1.5 8-.5V19c-2-1-5-1-8 .5-3-1.5-6-1.5-8-.5z"/><path d="M12 6v13.5"/>')]
];
let advLastNav=store.get('advNav','');
const advLabel=s=>s.charAt(0).toUpperCase()+s.slice(1).toLowerCase(); // "COLEÇÃO" → "Coleção" (rótulos uniformes)
function advNav(kind){advLastNav=kind;store.set('advNav',kind);openModal(kind)}
// troca a aventura SEM redesenhar o menu: só move o destaque/check entre os cards (o layout não muda → nada pula)
function advPick(i){
 if(i===currentBiome){snd(520,.05,'triangle',.03);return}
 const cards=document.querySelectorAll('#adventure-modal .adv-card');
 if(cards.length!==BIOMES.length)return pickBiome(i);
 setBiome(i);renderEnemyList();snd(660,.08,'triangle',.04);
 const chk=document.querySelector('#adventure-modal .adv-check');
 cards.forEach((c,k)=>{const on=k===i;c.classList.toggle('on',on);c.setAttribute('aria-checked',on);if(on&&chk)c.appendChild(chk)});
}
// 📅 desafio do dia: bênção do dia + melhor marca de hoje (ou "novo!" se ainda não jogou)
function dailyBtnHTML(){
 const d=Meta.daily(),b=Meta.dailyBless();
 return`<button class="adv-daily${d.tries?'':' fresh'}" onclick="startDaily()" title="${esc(t('daily.tip',{b:blessName(b)}))}"><b>📅 ${t('daily.btn')}</b><small>${b.ic} ${d.tries?t('daily.bestShort',{n:fmtN(d.best)}):t('daily.new')}</small></button>`;
}
function adventureHTML(){
 const nc=Chests.count(),badge=k=>k==='collection'&&nc?`<i class="adv-dot">${nc}</i>`:k==='missions'&&(claimableQuests()+(canClaimLogin()?1:0))?'<i class="adv-dot">!</i>':'';
 return`<div class="mcard adv" id="adventure-modal">
  <h2 class="adv-title">${t('menu.chooseBiome')}</h2>
  <div class="adv-cards" role="radiogroup">${BIOMES.map((b,i)=>{const on=i===currentBiome;
   return`<button class="adv-card bio-${b.id}${on?' on':''}" role="radio" aria-checked="${on}" onclick="advPick(${i})">
    <span class="adv-ic">${ADV_ICONS[b.id]||b.ic}</span><b>${t('biomes.'+b.id+'.name')}</b><small>${t('biomes.'+b.id+'.desc')}</small>
    ${on?'<i class="adv-check" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M3.5 8.5 6.5 11.5 12.5 4.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></i>':''}</button>`}).join('')}</div>
  <div class="adv-playrow"><button class="adv-play" onclick="playFromMenu()"><span>▶</span> ${t('ui.play')}</button>${dailyBtnHTML()}</div>
  <div class="adv-foot"><nav class="adv-nav">${ADV_NAV.map(([k,lab,ic])=>`<button class="${advLastNav===k?'on':''}" onclick="advNav('${k}')">${ic}<span>${advLabel(t(lab))}</span>${badge(k)}</button>`).join('')}</nav>
  <div class="adv-lang" role="group" aria-label="Idioma">${LANGS.map(l=>`<button class="${LANG===l.id?'on':''}" title="${l.n}" aria-pressed="${LANG===l.id}" onclick="changeLang('${l.id}')">${l.id.slice(0,2).toUpperCase()}</button>`).join('')}</div></div>
 </div>`;
}
