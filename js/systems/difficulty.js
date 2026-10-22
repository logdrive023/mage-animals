// Mage Animals — js/systems/difficulty.js · 📈 Curva de dificuldade das PALAVRAS (efeito "bola de neve" cadenciado).
//  Onda 1: 3–5 letras, só palavras sem acento · Onda 2: 4–6, acentos simples entram (15%) · Onda 3: 5–7 (22%)
//  Onda 4+ (ponto de virada): 6–9 letras e, a cada 3 ondas, +1 letra (teto 12); acentos/ç sobem 2%/onda (máx. 50%).
//  Sempre MISTURADO: 15% uma faixa abaixo (respiro) e 10% uma acima (tempero) — nunca fica monótono.
//  Ritmo sem degraus: intervalo entre entradas cai ~7% por onda; inimigos na tela e tamanho da onda sobem devagar.
//  Misericórdia (todos os modos): erros seguidos ou vida ≤ 1/3 → os próximos 2 inimigos vêm 30% mais lentos.
// Tudo é cálculo puro e barato (chamado só no spawn), sem custo por quadro.
'use strict';

const Difficulty={
 on:true, // false = curva antiga (usado na comparação com bots)
 range(w){
  if(w<=1)return[3,5];if(w===2)return[4,6];if(w===3)return[5,7];
  const g=Math.floor((w-4)/3);return[Math.min(9,6+g),Math.min(12,9+g)];
 },
 accentChance(w){return w<=1?0:w===2?.15:w===3?.22:Math.min(.5,.28+(w-4)*.02)},
 /** palavra para um inimigo: faixa da onda ajustada pelo tipo (fantasma rápido = curta · cristal/chefe = longa) + mistura */
 pick(kind,w){
  let[a,b]=this.range(w);
  if(kind==='ghost'){a=Math.max(3,a-2);b=Math.max(a,b-2)}
  else if(kind==='crystal'){a++;b++}
  else if(kind==='boss'){a+=2;b+=3}
  const r=Math.random();
  if(w>1&&r<.15){a=Math.max(3,a-2);b=Math.max(a,b-2)}else if(r>.9){a++;b+=2}
  return pickByLen(a,b,Math.random()<this.accentChance(w));
 },
 // ⏱️ tempo justo: o intervalo entre entradas acompanha o TAMANHO médio das palavras da onda (palavra maior → mais
 // tempo até o próximo) e encolhe ~4,5% por onda (bola de neve). Calibrado com bots de 25/45/70 WPM: chegam às
 // mesmas ondas da curva antiga, mas a dificuldade cresce pelas palavras, sem picos de quantidade.
 avgLen(w){const[a,b]=this.range(w);return(a+b)/2},
 gap(w){return Math.max(.5,(.25+.28*this.avgLen(w))*Math.pow(.955,w-1))},
 maxOn(w){return w<=3?3:Math.min(14,3+Math.floor((w-2)*.6))},
 size(w){return Math.round(4+2.6*w)}
};
// sorteia entre os comprimentos [a,b] (proporcional a quantas palavras existem de cada tamanho), evitando repetir a inicial
// de quem já está na tela. Sem palavra acentuada nessa faixa (ou no celular) → usa as sem acento; faixa vazia → alarga.
function pickByLen(a,b,acc){
 const L=POOL.byLen,src=acc&&L.acc.length?L.acc:L.plain;
 let cand=null,tot=0;
 for(let k=0;k<4&&!tot;k++){tot=0;for(let n=a;n<=b;n++){const l=src[n];if(l)tot+=l.length}if(!tot){a=Math.max(3,a-1);b++}}
 if(!tot)return pickWord('m');
 let w='';
 for(let tries=0;tries<12;tries++){
  let r=Math.random()*tot;for(let n=a;n<=b;n++){const l=src[n];if(!l)continue;if(r<l.length){w=l[r|0];break}r-=l.length}
  const f=norm(w)[0];let clash=false;for(let j=0;j<G.enemies.length;j++){const e=G.enemies[j];if(e.nw[0]===f||e.word===w){clash=true;break}}
  if(!clash)break;
 }
 return w;
}
