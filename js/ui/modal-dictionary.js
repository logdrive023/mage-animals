// Mage Animals — js/ui/modal-dictionary.js · 📖 Modal "Dicionário" (catálogo trilíngue das palavras do jogo).
// Cada card é um conceito (DICT em js/config/dictionary.js) com a palavra em pt · en · es. Status automático pelo
// histórico real (WordHistory): AMARELO = já escrita, PRETO = ainda não; tracejado = não aparece no jogo naquele idioma.
// Busca (qualquer idioma, sem acento), filtro por idioma e por status. A grade é redesenhada sozinha (#dicGrid), sem
// recriar o modal — o campo de busca não perde o foco.
'use strict';

const DictUI={
 q:'',lang:'all',st:'all',open:new Set(),_bank:null,_t:0,
 bank(l){
  if(!this._bank){this._bank={};for(const k of WORD_LANGS)this._bank[k]=new Set(((WORD_BANK[k]||'')+' '+((typeof WORD_EXTRA!=='undefined'&&WORD_EXTRA[k])||'')).split(/\s+/).filter(Boolean).map(norm))}
  return this._bank[l];
 },
 status(l,w){return!this.bank(l).has(norm(w))?'na':WordHistory.has(l,w)?'yes':'no'},
 uiLang(){return wordLangOf(LANG)},
 // progresso por idioma: palavras do banco já escritas / total do banco
 progress(l){const B=this.bank(l);let n=0;for(const w of WordHistory.load()[l])if(B.has(w))n++;return{n,tot:B.size}},
 // estado de um conceito no filtro atual
 info(c){
  const ls=this.lang==='all'?WORD_LANGS:[this.lang];let yes=false,inBank=false;
  for(const l of ls)for(const w of c.f[l]){const s=this.status(l,w);if(s!=='na')inBank=true;if(s==='yes')yes=true}
  return{yes,inBank};
 },
 match(c,q){if(!q)return true;for(const l of WORD_LANGS)for(const w of c.f[l])if(norm(w).includes(q))return true;return false},
 setLang(l){this.lang=l;this.refresh();snd(660,.05,'triangle',.03)},
 setSt(s){this.st=s;this.refresh();snd(660,.05,'triangle',.03)},
 // só os botões de filtro e a grade mudam (o campo de busca fica intacto)
 refresh(){document.querySelectorAll('#dict-modal [data-dl]').forEach(b=>{const on=b.dataset.dl===this.lang;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)});
  document.querySelectorAll('#dict-modal [data-ds]').forEach(b=>{const on=b.dataset.ds===this.st;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)});this.paint()},
 mount(){
  const q=$('dicQ');if(!q)return;
  q.oninput=()=>{this.q=q.value;clearTimeout(this._t);this._t=setTimeout(()=>this.paint(),90)};
  q.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();e.stopPropagation()}}; // Enter não fecha o modal enquanto busca
  $('dicGrid').onclick=e=>{const b=e.target.closest('.dc-more');if(!b)return;const id=+b.dataset.i,box=$('dcn'+id),on=!this.open.has(id);
   on?this.open.add(id):this.open.delete(id);b.setAttribute('aria-expanded',on);if(box)box.hidden=!on;snd(on?880:660,.05,'triangle',.03)};
  this.paint();
 },
 card(c){
  const dl=this.lang==='all'?this.uiLang():this.lang,main=c.f[dl][0],ms=this.status(dl,main),ui=this.uiLang(),ni={pt:1,en:2,es:3}[ui];
  const chip=(l,w)=>{const s=this.status(l,w),tip=s==='yes'?t('dict.tipYes'):s==='no'?t('dict.tipNo'):t('dict.tipNa',{l:t('dict.lang.'+l)});
   return`<span class="dword st-${s}" title="${esc(tip)}">${s==='yes'?'<i aria-hidden="true">✓</i>':''}${esc(w)}<span class="sr">${esc(' — '+tip)}</span></span>`};
  const open=this.open.has(c.id);
  return`<article class="dictcard is-${ms}">
   <div class="dc-top"><span class="dc-cat" title="${esc(t('dict.cat.'+c.cat))}" aria-label="${esc(t('dict.cat.'+c.cat))}">${DICT_CATS[c.cat]}</span><h3 class="dc-word">${esc(main)}</h3>
    ${ms==='na'?'':`<span class="dc-st">${ms==='yes'?'✓ '+t('dict.badgeYes'):'○ '+t('dict.badgeNo')}</span>`}</div>
   <ul class="dc-forms">${WORD_LANGS.map(l=>`<li><abbr title="${esc(t('dict.lang.'+l))}">${l.toUpperCase()}</abbr><span>${c.f[l].map(w=>chip(l,w)).join('')}</span></li>`).join('')}</ul>
   ${c.notes?`<button class="dc-more" data-i="${c.id}" aria-expanded="${open}" aria-controls="dcn${c.id}">💡 ${t('dict.notes')}<i aria-hidden="true">▾</i></button>
   <div class="dc-notes" id="dcn${c.id}" ${open?'':'hidden'}>${c.notes.map(n=>`<p><b class="nt-${n[0]}">${t('dict.nt.'+n[0])}</b>${esc(n[ni])}</p>`).join('')}</div>`:''}
  </article>`;
 },
 paint(){
  const g=$('dicGrid');if(!g)return;const q=norm(this.q.trim()),dl=this.lang==='all'?this.uiLang():this.lang;
  const list=DICT.filter(c=>{if(!this.match(c,q))return false;const I=this.info(c);
   if(this.lang!=='all'&&!I.inBank)return false;
   if(this.st==='yes')return I.yes;if(this.st==='no')return I.inBank&&!I.yes;return true})
   .sort((a,b)=>a.f[dl][0].localeCompare(b.f[dl][0],numLocale()));
  $('dicN').textContent=t('dict.count',{n:list.length});
  g.innerHTML=list.length?list.map(c=>this.card(c)).join(''):`<p class="dict-empty">${t('dict.none')}</p>`;
 }
};
function tabDictionary(){
 const D=DictUI,pill=(k,v,lab,on)=>`<button class="dpill ${on?'on':''}" data-${k}="${v}" aria-pressed="${on}" onclick="DictUI.${k==='dl'?'setLang':'setSt'}('${v}')">${lab}</button>`;
 const prog=WORD_LANGS.map(l=>{const p=D.progress(l),pct=p.tot?Math.round(p.n/p.tot*100):0;
  return`<div class="dp-row"><b>${l.toUpperCase()}</b><div class="dp-bar" role="progressbar" aria-label="${esc(t('dict.lang.'+l))}" aria-valuemin="0" aria-valuemax="${p.tot}" aria-valuenow="${p.n}"><i style="width:${pct}%"></i></div><small>${t('dict.progress',{a:p.n,b:p.tot})}</small></div>`}).join('');
 return`<div class="dict" id="dict-modal">
  <div class="dict-prog">${prog}</div>
  <div class="dict-tools">
   <label class="dict-search"><span aria-hidden="true">🔎</span><input id="dicQ" type="search" value="${esc(D.q)}" placeholder="${esc(t('dict.search'))}" aria-label="${esc(t('dict.search'))}" autocomplete="off" spellcheck="false"></label>
   <div class="dict-pills" role="group" aria-label="${esc(t('dict.langLabel'))}">${pill('dl','all',t('dict.all'),D.lang==='all')}${WORD_LANGS.map(l=>pill('dl',l,l.toUpperCase(),D.lang===l)).join('')}</div>
   <div class="dict-pills" role="group" aria-label="${esc(t('dict.statusLabel'))}">${['all','yes','no'].map(s=>pill('ds',s,t('dict.st.'+s),D.st===s)).join('')}</div>
  </div>
  <div class="dict-legend"><span class="dword st-yes"><i aria-hidden="true">✓</i>${t('dict.legendYes')}</span><span class="dword st-no">${t('dict.legendNo')}</span><span class="dword st-na">${t('dict.legendNa')}</span><small>${t('dict.since')}</small></div>
  <p class="dict-count" id="dicN" aria-live="polite"></p>
  <div class="dict-grid" id="dicGrid"></div>
 </div>`;
}
