// Mage Animals — js/systems/chests.js · Baús de recompensa: SEMPRE 3 drops (Aura, XP e 1 cosmético) + abertura animada.
// O sorteio acontece ao abrir e fica guardado em profile.pendingChest até "Coletar Tudo": fechar a aba no meio
// não perde nada (é coletado no próximo carregamento). A animação é 100% DOM/CSS (transform/opacity) com um conjunto
// FIXO de partículas reutilizado — nada é criado durante a animação e o canvas do jogo fica congelado por trás.
'use strict';

const Chests={
 count(){return profile.chests|0},
 add(n){profile.chests=(profile.chests|0)+n;saveProfile();if(typeof renderNav==='function')renderNav()},
 /** sorteia as 3 recompensas */
 roll(){
  const b=Inventory.bonuses(),[a0,a1]=CHEST_DROPS.aura,[x0,x1]=CHEST_DROPS.xp(profile.level);
  const aura=Math.round((a0+Math.random()*(a1-a0))*(1+b.aura/100)),xp=Math.round(x0+Math.random()*(x1-x0));
  const it=rollCosmetic(),dup=Inventory.has(it.id);
  return{aura,xp,item:it.id,dup,dupAura:dup?Math.round(ITEM_TIERS[it.tier].dup*(1+b.aura/100)):0};
 },
 /** gasta 1 baú e devolve o resultado (ainda não aplicado) */
 open(){if(this.count()<=0)return null;profile.chests--;const R=this.roll();profile.pendingChest=R;saveProfile();return R},
 /** aplica as recompensas (idempotente: só aplica o que está pendente) */
 collect(){
  const R=profile.pendingChest;if(!R)return null;
  profile.aura=(profile.aura||0)+R.aura+R.dupAura;
  if(!R.dup)Inventory.add(R.item);
  const ups=addXp(R.xp);profile.pendingChest=null;saveProfile();return{R,ups};
 }
};
// recompensa pendente de uma sessão anterior (aba fechada no meio da abertura) → coleta automaticamente
if(profile.pendingChest)Chests.collect();

// ================== ANIMAÇÃO (overlay dedicado) ==================
const ChestUI={
 open:false,R:null,flipped:0,
 el:null,
 build(){
  if(this.el)return;
  const d=document.createElement('div');d.className='chestfx hide';d.id='chestOverlay';
  d.innerHTML=`<div class="cf-stage">
   <h2 class="cf-title" id="cfTitle"></h2>
   <button class="cf-chestbtn" id="cfChest" aria-label="chest"><span class="chest legendary cf-chest" style="--s:2.1"><i class="lid"></i><i class="body"></i><i class="lock"></i></span><span class="cf-leaks"><i></i><i></i><i></i><i></i><i></i><i></i></span></button>
   <p class="cf-hint" id="cfHint"></p>
   <div class="cf-cards" id="cfCards">${[0,1,2].map(i=>`<button class="cf-card" data-i="${i}"><span class="cf-back">?</span><span class="cf-front"></span></button>`).join('')}</div>
   <div class="cf-actions"><button class="btn cf-collect" id="cfCollect"></button><button class="pact cf-again" id="cfAgain"></button></div>
  </div>
  <div class="cf-burst" id="cfBurst">${Array.from({length:24},(_,i)=>{const a=i/24*6.283+Math.random()*.3,d=160+Math.random()*200;return`<i style="--dx:${(Math.cos(a)*d)|0}px;--dy:${(Math.sin(a)*d*.8)|0}px"></i>`}).join('')}</div>`;
  document.body.appendChild(d);this.el=d;
  $('cfChest').onclick=()=>this.burst();
  $('cfCards').onclick=e=>{const b=e.target.closest('.cf-card');if(b)this.flip(+b.dataset.i)};
  $('cfCollect').onclick=()=>this.collect();
  $('cfAgain').onclick=()=>{this.collect(true)};
 },
 /** Estágio 1 — tensão: o baú treme com luz vazando pelas frestas */
 start(){
  const R=Chests.open();if(!R)return;
  this.build();this.R=R;this.flipped=0;this.open=true;
  const el=this.el;el.className='chestfx s1';
  $('cfTitle').textContent=t('chest.title');$('cfHint').textContent=t('chest.tapOpen');
  $('cfCollect').textContent=t('chest.collectAll');$('cfAgain').textContent='';
  this.fillCards(R);
  for(const c of el.querySelectorAll('.cf-card'))c.classList.remove('flip');
  snd(220,.6,'triangle',.04,330);renderNav();
 },
 /** Estágio 2 — abertura: explosão de brilho mágico; Estágio 3 — os 3 cards emergem de costas */
 burst(){
  if(!this.open||!this.el.classList.contains('s1'))return;
  this.el.className='chestfx s2';
  [523,659,784,1046,1318].forEach((f,i)=>snd(f,.3,'triangle',.06,0,i*.06));coinSound(true);
  setTimeout(()=>{if(this.open){this.el.className='chestfx s2 s3';$('cfHint').textContent=t('chest.tapCards')}},650);
 },
 fillCards(R){
  const it=ITEM_BY_ID[R.item],tier=ITEM_TIERS[it.tier];
  const faces=[
   {cls:'aura',html:`<b class="cf-ic">💰</b><strong>+${fmtN(R.aura)}</strong><small>${t('aura.name')}</small>`},
   {cls:'xp',html:`<b class="cf-ic">⚡</b><strong>+${fmtN(R.xp)}</strong><small>XP</small>`},
   {cls:'item t-'+it.tier,html:`<b class="cf-ic">${it.ic}</b><strong>${esc(t('items.'+it.id))}</strong><small>${tier.ic} ${t('tiers.'+it.tier)} · +${it.xp}% XP${it.aura?' · +'+it.aura+'% Aura':''}</small>${R.dup?`<em class="cf-dup">${t('chest.dup',{n:fmtN(R.dupAura)})}</em>`:''}`}
  ];
  this.el.querySelectorAll('.cf-card').forEach((c,i)=>{const f=c.querySelector('.cf-front');f.className='cf-front '+faces[i].cls;f.innerHTML=faces[i].html;c.style.setProperty('--tc',i===2?tier.col:i===0?'#ffd24a':'#7ad0ff')});
 },
 /** vira um card (revelação); com os 3 virados → Estágio 4 (resumo) */
 flip(i){
  const c=this.el.querySelectorAll('.cf-card')[i];if(!c||c.classList.contains('flip')||!this.el.classList.contains('s3'))return;
  c.classList.add('flip');this.flipped++;
  const it=ITEM_BY_ID[this.R.item],big=i===2&&(it.tier==='epic'||it.tier==='legendary');
  snd(i===2?(big?1318:988):784,.18,'triangle',.05);if(big)coinSound(true);
  if(this.flipped>=3){this.el.classList.add('s4');$('cfHint').textContent='';
   $('cfAgain').textContent=Chests.count()>0?t('chest.openAnother',{n:Chests.count()}):'';}
 },
 /** Estágio 4 — coletar: aplica no perfil/inventário e salva */
 collect(again){
  if(!this.open)return;
  // coletar antes de virar tudo revela o resto automaticamente
  const res=Chests.collect();this.open=false;this.el.className='chestfx hide';
  renderProfile();renderSide();renderNav();if(modalOpen)renderModal();
  if(res&&res.ups.length)rewardFx({},res.ups,null,true);
  snd(880,.12,'triangle',.05);
  if(again&&Chests.count()>0)setTimeout(()=>this.start(),120);
 }
};
