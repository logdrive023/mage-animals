// Mage Animals — js/render/runes.js · Modo Símbolos & Runas: escolha das runas por onda e o badge ilustrado nos inimigos.
// Cada forma vira um sprite pré-renderizado (por elemento e estado: apagada / próxima / concluída) → por quadro só drawImage.
'use strict';

// ---------- curva de aprendizado: famílias liberadas por onda ----------
const RUNE_FAM_ORDER=['lines','angles','curves','closed','loops'];
function runeFamsFor(w){const out=[];for(const id of RUNE_FAM_ORDER){const f=RUNE_FAMILIES.find(x=>x.id===id);if(w>=f.wave)out.push(id)}return out}
const runeNewFamily=w=>{for(const f of RUNE_FAMILIES)if(f.wave>1&&f.wave===w)return f.id;return null};
// escolhe a(s) forma(s) de um inimigo; evita repetir a 1ª forma de quem já está na tela (a mira continua sem ambiguidade)
function pickRune(kind,w){
 const fams=runeFamsFor(w),newest=fams[fams.length-1];
 const pool=RUNE_SHAPES.filter(s=>fams.includes(s.fam)),fresh=RUNE_SHAPES.filter(s=>s.fam===newest);
 const pick1=()=>{const src=fams.length>1&&Math.random()<.5?fresh:pool;return src[(Math.random()*src.length)|0]};
 const clash=code=>{for(let i=0;i<G.enemies.length;i++)if(G.enemies[i].word&&G.enemies[i].word[0]===code[0])return true;return false};
 for(let tries=0;tries<16;tries++){
  let code,combo=null;
  if(kind==='boss'){ // chefe: runa ancestral composta (2 formas), só com famílias já liberadas
   const ok=RUNE_COMBOS.filter(r=>r.seq.every(id=>fams.includes(RUNE_BY_ID[id].fam)));
   if(ok.length){combo=ok[(Math.random()*ok.length)|0];code=combo.code}else{const a=pick1(),b=pick1();code=a.code+b.code}
  }else if(w>=RUNE_CURVE.chainFrom&&kind!=='crystal'&&Math.random()<RUNE_CURVE.chainChance){const a=pick1();let b=pick1();if(b===a)b=pick1();code=a.code+b.code} // corrente de 2 só nas ondas altas (cristal já aguenta 2 golpes)
  else code=pick1().code;
  if(!clash(code)||tries===15)return{code,combo};
 }
}
// ---------- sprites das formas ----------
const _runeSpr=new Map();
const RUNE_CELL=26;
function runeSprite(sh,state,col){ // state 0 = apagada · 1 = próxima (cor do elemento) · 2 = concluída (dourado/branco)
 const key=sh.code+state+col;let s=_runeSpr.get(key);if(s)return s;
 s=mkCanvas(RUNE_CELL+8,RUNE_CELL+8);const c=s.getContext('2d'),k=RUNE_CELL/100,o=4;
 c.lineCap='round';c.lineJoin='round';
 const path=()=>{c.beginPath();for(const st of sh.strokes){st.forEach(([x,y],i)=>i?c.lineTo(o+x*k,o+y*k):c.moveTo(o+x*k,o+y*k))}};
 const main=state===2?'#fff2c0':state===1?col:'rgba(200,208,240,.38)';
 if(state){path();c.strokeStyle=state===2?'rgba(255,214,110,.45)':hexA(col,.42);c.lineWidth=7;c.stroke()} // brilho (sem shadowBlur)
 path();c.strokeStyle=main;c.lineWidth=state?3:2.4;c.stroke();
 _runeSpr.set(key,s);return s;
}
const runeColor=e=>RUNE_EL_COLOR[e.runeEl]||RUNE_EL_COLOR.raio;
const runeBadgeW=n=>n*(RUNE_CELL+8)+(n-1)*4;
// badge: caixa escura com borda do elemento; formas concluídas acesas, a próxima pulsando, as restantes apagadas
function drawRuneBadge(c,e,x,y,isT,hot){
 const n=e.word.length,w=runeBadgeW(n),col=runeColor(e),bx=x-8,by=y-30;
 c.fillStyle=isT?'rgba(20,16,50,.94)':'rgba(6,8,24,.82)';c.strokeStyle=hot?'#ff4a6a':isT?'#ffd98a':hexA(col,.55);c.lineWidth=isT||hot?2:1.4;
 c.beginPath();c.roundRect(bx,by,w+16,RUNE_CELL+16,9);c.fill();c.stroke();
 for(let i=0;i<n;i++){
  const sh=RUNE_BY_CODE[e.word[i]],st=i<e.typed?2:i===e.typed?1:0,px=x+i*(RUNE_CELL+12),py=by+4;
  if(st===1){c.globalAlpha=.65+.35*Math.sin(T*6);c.drawImage(runeSprite(sh,1,col),px,py);c.globalAlpha=1}
  else c.drawImage(runeSprite(sh,st,col),px,py);
  if(i<n-1){c.fillStyle=i<e.typed?'#ffd98a':'rgba(200,208,240,.35)';c.fillRect(px+RUNE_CELL+7,py+RUNE_CELL/2+3,3,3)} // elo da cadeia
 }
}
// texto da barra de digitação no modo runas: os glifos das formas
function runeGlyphs(code){let s='';for(let i=0;i<code.length;i++){const sh=RUNE_BY_CODE[code[i]];s+=(i?' ':'')+(sh?sh.glyph:code[i])}return s}
