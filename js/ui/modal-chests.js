// Mage Animals — js/ui/modal-chests.js · 🎁 Abertura de baús (1 ou vários) com revelação AUTOMÁTICA em cascata.
// Fluxo: os baús aparecem misteriosos (tremendo de leve) → um a um descobrem a raridade (raios + faíscas na cor dela)
// e mostram o que deram → resumo com tudo somado → "Coletar tudo". "Pular ⏭" (ou tocar fora) revela tudo na hora.
// Desempenho: só transform/opacity; as faíscas são 6 <i> por baú já no HTML (nada é criado durante a animação) e o
// canvas do jogo fica congelado por trás (ChestUI.open). O tempo total da cascata é limitado (~4 s) mesmo com 20+ baús.
'use strict';

const RAR_IC={common:'📦',uncommon:'🟠',rare:'🔷',special:'💚',strange:'🌀',legendary:'👑',unique:'🌈'};
const ChestUI={
 open:false,el:null,list:null,timers:[],idx:0,done:false,
 build(){
  if(this.el)return;
  const d=document.createElement('div');d.id='chestOverlay';d.className='cx hide';
  d.innerHTML=`<div class="cx-box">
   <h2 class="cx-title" id="cxTitle"></h2><p class="cx-sub" id="cxSub"></p>
   <div class="cx-grid" id="cxGrid"></div>
   <div class="cx-sum" id="cxSum"></div>
   <div class="cx-act"><button class="cx-skip" id="cxSkip"></button><button class="btn cx-collect" id="cxCollect"></button><button class="cx-more" id="cxMore"></button></div></div>`;
  document.body.appendChild(d);this.el=d;
  $('cxSkip').onclick=e=>{e.stopPropagation();this.skip()};
  $('cxCollect').onclick=e=>{e.stopPropagation();this.collect(false)};
  $('cxMore').onclick=e=>{e.stopPropagation();this.collect(true)};
  d.addEventListener('pointerdown',e=>{if(!this.done&&!e.target.closest('button'))this.skip()}); // toque em qualquer lugar = pular
 },
 /** abre 1 baú (all=false) ou todos (all=true) */
 start(all){
  const list=Chests.openMany(all?Chests.count():1);if(!list)return;questAdd('chestsOpened',list.length); // 📋 missão "abra baús"
  this.build();this.list=list;this.idx=0;this.done=false;this.open=true;this.clear();
  const n=list.length,el=this.el;
  el.className='cx'+(n===1?' one':n>6?' many':'');
  $('cxTitle').textContent=n===1?t('chest.title'):t('chest.titleAll',{n});
  $('cxSub').textContent=t('chest.revealing');
  $('cxGrid').innerHTML=list.map((R,i)=>this.cell(R,i)).join('');
  $('cxSum').innerHTML='';$('cxSum').classList.remove('on');
  $('cxSkip').textContent=t('chest.skip');$('cxSkip').style.display=n>1?'':'none';
  $('cxCollect').style.display='none';$('cxMore').style.display='none';
  renderNav();snd(220,.5,'triangle',.04,330);
  // cascata: o total cabe em ~4 s, cada baú entre 0,25 e 0,8 s
  const step=Math.max(.25,Math.min(.8,3.6/n))*1000;
  this.timers.push(setTimeout(()=>this.next(step),n===1?700:550));
 },
 cell(R,i){
  const it=ITEM_BY_ID[R.item],tier=ITEM_TIERS[it.tier],rc=CHEST_RAR_BY_ID[R.rar];
  return`<div class="cx-cell" id="cxc${i}" style="--d:${(i%6)*.13}s;--rc:${rc.col}">
   <div class="cx-fx"><i class="cx-rays"></i>${'<b></b>'.repeat(6)}</div>
   <div class="cx-chest"><i class="lid"></i><i class="body"></i><i class="band"></i><i class="lock">?</i></div>
   <div class="cx-loot"><em class="cx-rar">${RAR_IC[R.rar]} ${t('chest.rarity.'+R.rar)}</em>
    <span class="cx-item" style="--tc:${tier.col}">${it.ic}</span><b class="cx-name" style="color:${tier.col}">${esc(t('items.'+it.id))}</b>
    <small>✨ ${fmtN(R.aura+R.dupAura)} · ⚡ ${fmtN(R.xp)}</small>${R.dup?`<i class="cx-dup">${t('chest.dupShort')}</i>`:''}</div></div>`;
 },
 next(step){
  if(!this.open||this.done)return;
  this.reveal(this.idx++);
  if(this.idx<this.list.length)this.timers.push(setTimeout(()=>this.next(step),step));
  else this.timers.push(setTimeout(()=>this.summary(),700));
 },
 reveal(i,instant){
  const c=$('cxc'+i),R=this.list[i];if(!c)return;
  if(c.classList.contains('r-done')){if(instant)c.classList.add('shown','instant');return} // pular no meio da abertura: termina já
  c.classList.add('r-'+R.rar,'r-done');
  if(instant){c.classList.add('shown','instant');return}
  c.classList.add('pop');
  const k=CHEST_RARITIES.findIndex(x=>x.id===R.rar); // som sobe com a raridade
  snd(440+k*110,.18,'triangle',.05);if(k>=5){snd(1318,.3,'triangle',.05,0,.08);coinSound(true)}
  this.timers.push(setTimeout(()=>c.classList.add('shown'),420));
 },
 skip(){
  if(this.done)return;this.clear();
  for(let i=0;i<this.list.length;i++)this.reveal(i,true);
  snd(880,.12,'triangle',.05);this.summary();
 },
 summary(){
  if(this.done)return;this.done=true;this.clear();
  const T=Chests.total(this.list),n=this.list.length;
  const chips=CHEST_RARITIES.filter(r=>T.rar[r.id]).map(r=>`<span class="cx-chip" style="--rc:${r.col}">${RAR_IC[r.id]} ${T.rar[r.id]}× ${t('chest.rarity.'+r.id)}</span>`).join('');
  // ✨ itens NOVOS entram um a um (atraso por índice) com selo "NOVO" e a cor do tier; o melhor tier ganha destaque
  const icons=T.items.slice(0,12).map((id,i)=>{const it=ITEM_BY_ID[id];return`<i class="cx-new t-${it.tier}" style="--tc:${ITEM_TIERS[it.tier].col};--i:${i}" title="${esc(t('items.'+id))}">${it.ic}<em>${t('chest.newTag')}</em></i>`}).join('')+(T.items.length>12?`<i>+${T.items.length-12}</i>`:'');
  this.total=T; // usado no collect (explosão de recompensa com o total do lote)
  const done=ITEM_CATS.filter(c=>{const all=COSMETICS.filter(x=>x.cat===c);return all.some(x=>T.items.includes(x.id))&&all.every(x=>Inventory.has(x.id)||T.items.includes(x.id))}); // categorias completadas por este lote
  $('cxSum').innerHTML=`${n>1?`<div class="cx-chips">${chips}</div>`:''}
   <div class="cx-tot"><span><b>✨ <i data-cnt="${T.aura}">0</i></b><small>${t('aura.name')}</small></span><span><b>⚡ <i data-cnt="${T.xp}">0</i></b><small>XP</small></span><span><b>🎁 ${T.items.length}</b><small>${t('chest.newShort')}</small></span>${T.dups?`<span><b>♻️ ${T.dups}</b><small>${t('chest.dupsShort')}</small></span>`:''}</div>
   ${icons?`<div class="cx-icons">${icons}</div>`:''}${done.length?`<p class="cx-full">🏆 ${t('chest.catDone',{c:done.map(c=>t('col.f.'+c)).join(', ')})}</p>`:''}`;
  this.countUp();
  $('cxSum').classList.add('on');$('cxSub').textContent='';
  $('cxSkip').style.display='none';
  // o XP do lote pode subir de nível (+1 baú por nível): conta antes para o botão "abrir mais" mostrar o número certo
  let lv=profile.level,xp=profile.xp+T.xp,ups=0;while(xp>=xpNeed(lv)){xp-=xpNeed(lv);lv++;ups++}
  const more=Chests.count()+ups;
  $('cxCollect').textContent=t('chest.collectAll');$('cxCollect').style.display='';
  $('cxMore').textContent=more?t('chest.collectMore',{n:more}):'';$('cxMore').style.display=more?'':'none';
  if(ups)$('cxSub').innerHTML=`<span class="cf-lvup">⭐ ${t('chest.levelUp',{l:lv,n:ups})}</span>`;
  coinSound(n>3);
 },
 clear(){this.timers.forEach(clearTimeout);this.timers.length=0},
 /** totais do resumo contam de 0 até o valor (~0,9 s, ease-out) com um tique a cada degrau */
 countUp(){
  const els=[...document.querySelectorAll('#cxSum [data-cnt]')],t0=performance.now(),D=900;let lastQ=-1;
  const step=now=>{if(!this.open)return;const k=Math.min(1,(now-t0)/D),e=1-Math.pow(1-k,3);
   for(const el of els)el.textContent=fmtN(Math.round(+el.dataset.cnt*e));
   const q=(k*10)|0;if(q!==lastQ&&k<1){lastQ=q;snd(1200+q*90,.03,'square',.012)}
   if(k<1)requestAnimationFrame(step)};
  requestAnimationFrame(step);
 },
 /** aplica tudo, fecha e (opcional) abre os próximos */
 collect(again){
  if(!this.open)return;this.clear();
  const res=Chests.collect();this.open=false;this.el.className='cx hide';
  renderProfile();renderSide();renderNav();if(modalOpen)renderModal();if(state==='over'&&typeof refreshOverChests==='function')refreshOverChests();
  const T=this.total||{aura:0,xp:0,items:[]},n=this.list?this.list.length:1;
  rewardFx(Object.assign({aura:T.aura,xp:T.xp},res&&res.ups.length?{chests:res.ups.length}:{}),res?res.ups:[],null,n>1||!!(res&&res.ups.length)); // 🎆 explosão com o total do lote (+ baús de nível)
  snd(880,.12,'triangle',.05);
  if(again&&Chests.count()>0)setTimeout(()=>this.start(true),160);
 }
};
