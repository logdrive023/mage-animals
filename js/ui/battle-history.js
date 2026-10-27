// Mage Animals — js/ui/battle-history.js · 📜 Histórico de batalhas do Duelo Online.
// Cada duelo online terminado vira uma linha: resultado (texto + cor + ícone, não só cor), rival (apelido e @handle),
// modo, WPM e data. Guarda as 30 mais recentes no perfil (profile.onlineHistory). Filtro: todas · vitórias · derrotas.
'use strict';

const BH_MAX=30,BH_MODE_IC={words:'⌨️',letters:'✍️',runes:'🔮'};
let bhFilter='all';
// res: 'win' | 'loss' | 'draw' (registros antigos só têm win:true/false)
const bhRes=x=>x.res==='draw'?'draw':x.win?'win':'loss';
function recordOnlineBattle(o){
 const R=(typeof Net!=='undefined'&&Net.remote)||{},res=o.res||(o.win?'win':'loss');
 const h=profile.onlineHistory=Array.isArray(profile.onlineHistory)?profile.onlineHistory:[];
 h.unshift({win:res==='win',res,dc:o.reason==='dc',why:o.reason||'',rname:String(o.rname||R.nick||'?').slice(0,24),rav:String(o.rav||R.av||'').slice(0,8),rh:R.handle||'',rch:R.ch||'',
  mode:o.mode||'words',wpm:o.wpm|0,acc:o.acc|0,at:Date.now()});
 if(h.length>BH_MAX)h.length=BH_MAX;
}
function setBhFilter(f){bhFilter=f;renderModal();snd(660,.05,'triangle',.03)}
// "hoje 14:32" · "ontem 09:10" · "12/10 18:05"
function bhWhen(ts){
 const d=new Date(ts),now=new Date(),hm=d.toLocaleTimeString(LANG,{hour:'2-digit',minute:'2-digit'});
 const day=x=>new Date(x.getFullYear(),x.getMonth(),x.getDate()).getTime(),diff=Math.round((day(now)-day(d))/864e5);
 return diff===0?t('history.today')+' '+hm:diff===1?t('history.yesterday')+' '+hm:d.toLocaleDateString(LANG,{day:'2-digit',month:'2-digit'})+' '+hm;
}
function battleHistoryHTML(){
 const h=Array.isArray(profile.onlineHistory)?profile.onlineHistory:[],rec=profile.online||{wins:0,losses:0},dr=rec.draws||0,tot=rec.wins+rec.losses+dr,pct=tot?Math.round(rec.wins/tot*100):0;
 const list=h.filter(x=>bhFilter==='all'||bhFilter===bhRes(x));
 const pills=[['all','📜'],['win','🏆'],['loss','💀']].map(([f,ic])=>`<button class="bhpill ${bhFilter===f?'on':''}" aria-pressed="${bhFilter===f}" onclick="setBhFilter('${f}')">${ic} ${t('history.f.'+f)}</button>`).join('');
 const RES={win:['w','✓ '+t('history.win'),t('duel.victory')],loss:['l','✕ '+t('history.loss'),t('duel.defeat')],draw:['d','＝ '+t('history.draw'),t('history.draw')]};
 const row=x=>{const ch=CHARS.find(c=>c.id===x.rch),[cls,lab,aria]=RES[bhRes(x)],why=x.why||(x.dc?'dc':'');
  return`<li class="bhrow ${cls}"><span class="bhres" aria-label="${esc(aria)}">${lab}</span>
   <span class="bhwho"><b>${esc(x.rav||(ch?ch.emoji:'🧙'))} ${esc(x.rname)}</b>${x.rh?`<small>${esc(x.rh)}</small>`:''}</span>
   <span class="bhmeta"><i title="${esc(t('online.mode.'+x.mode))}">${BH_MODE_IC[x.mode]||'⌨️'} ${t('online.mode.'+x.mode)}</i><i>⚡ ${x.wpm|0} WPM</i>${why==='dc'?`<i class="bhdc">🔌 ${t('history.dc')}</i>`:why==='quit'||why==='away'||why==='timeout'?`<i class="bhdc">🚪 ${t('history.quit')}</i>`:''}</span>
   <time class="bhtime" datetime="${new Date(x.at).toISOString()}">${bhWhen(x.at)}</time></li>`};
 return`<section class="bhist" aria-labelledby="bhTitle">
  <div class="bhhead"><h4 id="bhTitle">📜 ${t('history.title')}</h4>
   <div class="bhsum"><span class="w">🏆 ${rec.wins} ${t('history.wins')}</span><span class="l">💀 ${rec.losses} ${t('history.losses')}</span>${dr?`<span class="d">🤝 ${dr} ${t('history.draws')}</span>`:''}${tot?`<span>${pct}% ${t('history.rate')}</span>`:''}</div></div>
  <div class="bhpills" role="group" aria-label="${esc(t('history.title'))}">${pills}</div>
  ${list.length?`<ol class="bhlist">${list.map(row).join('')}</ol>`:`<p class="bhempty">${h.length?t('history.emptyFilter'):t('history.empty')}</p>`}
 </section>`;
}
