// Mage Animals — js/systems/youtube-rhythm.js · 🎵 Ritmo do Bardo (GAME_STYLE 'songs'): digitar no ritmo de uma música.
// Fontes de áudio:
//  · 'drum' — Tambor do Bardo: batida gerada no AudioContext (100% offline, relógio = AC.currentTime, sincronia exata)
//  · 'yt'   — vídeo do YouTube (IFrame API carregada SÓ quando o jogador escolhe uma faixa dessas; precisa de internet e de
//             o jogo estar aberto por http(s): em file:// o YouTube recusa o embed). Relógio = tempo real suavizado em
//             direção a player.getCurrentTime() (lido 4×/s; a API é síncrona mas não precisa ser lida todo quadro).
// Mapa da faixa (chart): notas {t,w} — t em segundos da música; w = palavra opcional (sem w, sai uma palavra do jogo).
//  Gerado pela batida (bpm, offset, 1 palavra a cada N batidas) ou escrito pelo jogador ("12.5 dragão" por linha).
//  Nenhuma letra de música vem com o jogo: as faixas do YouTube são do jogador.
// Cada nota vira um inimigo que nasce SONG_LEAD s antes do tempo dela e só chega na torre SONG_GRACE s depois:
//  terminar a palavra perto do tempo da nota = Perfeito/Ótimo (pontos extras + Aura no fim).
// Integração (js/core/game.js): update → Rhythm.tick · fire → Rhythm.judge · hitTower → Rhythm.missNote ·
//  gameOver → Rhythm.finish · draw → Rhythm.drawHud · pause/resume/clearGame → Rhythm.pause/resume/stop.
'use strict';

const SONG_LEAD=3.4,SONG_GRACE=2.8,SONG_JUDGE={perfect:.45,great:1.1},SONG_PTS={perfect:1.6,great:1.25,ok:1};
const SONG_HIST_MAX=20;
// faixas offline (sempre disponíveis): bpm, duração e palavra a cada N batidas
const SONG_DRUMS=[
 {id:'drum-slow',src:'drum',title:'song.drum.slow',bpm:84,dur:75,every:4,kit:'calm'},
 {id:'drum-march',src:'drum',title:'song.drum.march',bpm:100,dur:100,every:3,kit:'march'},
 {id:'drum-gallop',src:'drum',title:'song.drum.gallop',bpm:126,dur:110,every:3,kit:'gallop'}
];
// 📚 MÚSICAS PRONTAS (js/config/song-catalog.js, gerado por tools/build-song-catalog.mjs): só os TEMPOS de cada frase cantada,
//  quantas palavras ela tem e onde o refrão se repete. Tocam na hora (nenhum pedido ao servidor de legendas); as palavras
//  saem do vocabulário do jogo, no idioma e na dificuldade do jogador, sorteadas a cada partida.
const SONG_CAT_TAGS=['pop','rock','latino','brasil','classic','eletro'];
const SONG_CAT_TIERS={easy:['e'],normal:['s','m'],full:['m','m','l']};
let _songCat=null,songCatTag='',songCatLv=0;
function songCatalog(){
 if(!_songCat)_songCat=(typeof SONG_CATALOG!=='undefined'?SONG_CATALOG:[]).map(x=>({id:x.id,src:'yt',vid:x.vid,title:x.title,tag:x.tag,lang:x.lang,lrc:x.lrc||null,lv:x.lv||2,cat:true,g:x.g,bpm:100,chart:[],lines:[]}));
 return _songCat;
}
/** frases do catálogo → linhas {t,end,text}: 1 palavra do jogo a cada 3 cantadas (1 a 4); o refrão repete as palavras da 1ª vez */
function songCatalogLines(tr){
 const tiers=SONG_CAT_TIERS[songDiff()]||SONG_CAT_TIERS.normal,out=[];
 const pick=()=>{const L=POOL[tiers[(Math.random()*tiers.length)|0]];return L&&L.length?L[(Math.random()*L.length)|0]:'magia'};
 for(const r of tr.g){
  if(r.length>3&&out[r[3]]){out.push({t:r[0],end:r[0]+r[1],text:out[r[3]].text});continue}
  const k=Math.max(1,Math.min(4,Math.ceil(r[2]/3))),ws=[];
  for(let i=0;i<k;i++){let w=pick();for(let j=0;j<6&&ws.includes(w);j++)w=pick();ws.push(w)}
  out.push({t:r[0],end:r[0]+r[1],text:ws.join(' ')});
 }
 return out;
}
/** linhas de um LRC em ordem de tempo: a linha com vários tempos ("[00:30.00][01:20.00] refrão", refrão escrito 1 vez)
 *  vira uma linha por tempo. Só as que têm letra. Mesma regra de tools/match-lyrics.mjs (o índice dos trechos depende dela). */
function lrcRows(s){
 const out=[];
 for(const raw of String(s||'').split('\n')){const h=raw.match(/^((?:\[\d+:\d+(?:\.\d+)?\])+)\s*(.*)$/);if(!h||!/\p{L}/u.test(h[2]))continue;
  for(const m of h[1].matchAll(/\[(\d+):(\d+(?:\.\d+)?)\]/g))out.push({t:+m[1]*60+ +m[2],text:h[2]})}
 return out.sort((a,b)=>a.t-b.t);
}
/** 🎤 letra sincronizada da música pronta: o navegador do jogador baixa do LRCLIB (lrclib.net, CORS aberto, sem chave) e aplica
 *  o ajuste de sincronia com o VÍDEO calculado por tools/match-lyrics.mjs (lrc.segs = [[a partir da linha i, ajuste s]]).
 *  As linhas contam igual ao script: só as que têm alguma letra, na ordem do arquivo. Devolve [] se falhar (máx. 9 s).
 *  1º pelo servidor de legendas (?lrc=, guarda 30 dias para todos os jogadores); senão direto no LRCLIB, que responde 503
 *  "tente em 1 s" quando está cheio: até 4 tentativas, 1,2 s entre elas. */
async function songLrcLines(tr){
 const ctl=typeof AbortController!=='undefined'?new AbortController():null,timer=setTimeout(()=>ctl&&ctl.abort(),9000),sig=ctl?ctl.signal:undefined;
 try{let j=null;const api=songCaptionsApi();
  if(api)try{const r=await fetch(api+'/?lrc='+tr.lrc.id,{signal:sig});if(r.ok){const x=await r.json();if(x&&x.ok&&x.syncedLyrics)j=x}}catch(e){if(sig&&sig.aborted)return[]}
  for(let k=0;!j&&k<4;k++){const r=await fetch('https://lrclib.net/api/get/'+tr.lrc.id,{signal:sig});if(r.ok){j=await r.json();break}if(r.status<500)break;await new Promise(z=>setTimeout(z,1200))}
  if(!j)return[];const out=[];let i=0,si=0;const S=tr.lrc.segs;
  let p0=-1,p1=-1; // ordem e respiro: a frase nunca fica antes da anterior nem a menos de 70% do intervalo original (0,35–1,2 s)
  for(const x of lrcRows(j.syncedLyrics)){
   while(si+1<S.length&&S[si+1][0]<=i)si++;let t1=x.t+S[si][1];
   if(p0>=0)t1=Math.max(t1,p1+Math.max(.35,Math.min((x.t-p0)*.7,1.2)));p0=x.t;p1=t1;
   const text=cueText(x.text);if(text)out.push({t:+t1.toFixed(2),text});i++}
  return out;
 }catch(e){return[]}finally{clearTimeout(timer)}
}
/** letra guardada neste navegador (30 dias; muda se o catálogo trocar a letra ligada) · máx. 40 músicas guardadas */
// CAT_LYR_V: sobe quando muda o jeito de montar a letra (ajustes do catálogo, ordem das linhas) — a letra guardada é refeita
const CAT_LYR_V=2,catSegKey=tr=>tr.lrc?tr.lrc.segs.length+':'+tr.lrc.segs.reduce((a,s)=>a+s[0]*7+s[1],0).toFixed(2):'';
function catLyrGet(tr){const sv=store.get('catLyr',{})||{},c=sv[tr.vid],lid=tr.lrc?tr.lrc.id:0;return c&&c.v===SONG_CAP_V&&c.cv===CAT_LYR_V&&c.sk===catSegKey(tr)&&(c.id|0)===lid&&Date.now()-c.at<30*864e5&&c.lines&&c.lines.length?c.lines:null}
function catLyrPut(tr,lines){const sv=store.get('catLyr',{})||{};sv[tr.vid]={v:SONG_CAP_V,cv:CAT_LYR_V,sk:catSegKey(tr),id:tr.lrc?tr.lrc.id:0,at:Date.now(),lines};
 const ks=Object.keys(sv).sort((a,b)=>sv[b].at-sv[a].at);for(const k of ks.slice(40))delete sv[k];store.set('catLyr',sv)}
/** ⏬ com a tela de músicas aberta, baixa em segundo plano as letras que faltam (na ordem da lista, uma a cada 1,5 s): ao
 *  tocar, a música já começa com a letra. Para ao fechar a tela, ao começar a jogar ou depois de 3 falhas seguidas. */
let _lrcPre=false;
async function songCatPrefetch(){
 if(_lrcPre)return;_lrcPre=true;let fails=0;
 try{for(const tr of songCatalog()){
  if(!modalOpen||state==='play'||fails>=3)break;if(!tr.lrc||catLyrGet(tr))continue;
  const L=await songLrcLines(tr);if(L.length>=3){catLyrPut(tr,L);fails=0}else fails++;
  await new Promise(z=>setTimeout(z,1500))}}finally{_lrcPre=false}
}
function songCatFilter(tag){songCatTag=songCatTag===tag?'':tag;renderModal();snd(660,.05,'triangle',.03)}
function songCatLvFilter(l){songCatLv=songCatLv===l?0:l;renderModal();snd(520+l*120,.05,'triangle',.03)}

/** id de 11 caracteres a partir de um link do YouTube (watch, youtu.be, embed, shorts) ou do próprio id */
function ytIdOf(s){
 s=String(s||'').trim();const m=s.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([\w-]{11})/);
 if(m)return m[1];return /^[\w-]{11}$/.test(s)?s:'';
}
/** "12.5 dragão" · "1:02.3 magia" · "75 duas palavras" → notas {t,w}; várias palavras na linha saem a cada 0,6 s */
function parseSongChart(txt){
 const out=[];
 for(const line of String(txt||'').split(/\r?\n/)){
  const m=line.match(/^\s*(?:(\d+):)?(\d+(?:[.,]\d+)?)\s*s?\s+(.+?)\s*$/);if(!m)continue;
  const t0=(m[1]?+m[1]*60:0)+parseFloat(m[2].replace(',','.'));
  const words=m[3].toLowerCase().normalize('NFC').split(/\s+/).map(w=>w.replace(/[^\p{L}]/gu,'').slice(0,14)).filter(Boolean);
  words.forEach((w,i)=>out.push({t:t0+i*.6,w}));
 }
 return out.sort((a,b)=>a.t-b.t);
}
// 🎤 MODO FRASE (letra da música): cada frase cantada vira UM Asteroide do Bardo grande com a frase inteira.
//  A letra é SEMPRE do jogador (colada como LRC "[mm:ss.xx] frase" ou marcada no editor ao vivo) — o jogo não baixa letras.
// a frase aparece junto com o canto (0,15 s antes; antes 0,6 s, mas o tick usava sem querer o SONG_LEAD de 3,4 s das notas de
//  batida — a frase surgia muito antes de ser cantada e a seguinte já vinha junto)
const SONG_LINE_LEAD=.15,SONG_LINE_GRACE=2.6;
/** LRC → [{t,text}] (aceita várias marcas de tempo na mesma linha e ignora metadados como [ar:] [ti:]) */
function parseLRC(txt){
 const out=[];
 for(const raw of String(txt||'').split(/\r?\n/)){
  const tags=[...raw.matchAll(/\[(\d{1,2}):(\d{1,2}(?:[.,]\d{1,3})?)\]/g)];if(!tags.length)continue;
  const text=raw.replace(/\[[^\]]*\]/g,'').trim();if(!text)continue; // sem limite de caracteres: a frase vem inteira
  for(const m of tags)out.push({t:+m[1]*60+parseFloat(m[2].replace(',','.')),text});
 }
 return out.sort((a,b)=>a.t-b.t);
}
/** tempo "h:mm:ss,mmm" · "mm:ss.mmm" · "m:ss" → segundos */
const tsSec=s=>{const p=String(s).trim().replace(',','.').split(':').map(Number);return p.reduce((a,v)=>a*60+v,0)};
/** limpa uma linha de legenda: tags <i>/<c>/<00:01.000>, marcações [Música]/(aplausos), notas ♪ e espaços extras */
// parênteses com palavras cantadas (vocal de apoio) FICAM — só saem as marcações de som: (Música) (aplausos) (risos) (instrumental)…
const SOUND_TAG=/\((?:m[uú]sic[ao]?|music|applause|aplausos?|laughter|laughs?|risos?|instrumental|cheering|gritos?|vaias?|silence|sil[eê]ncio|inaudible|inaud[ií]vel)\)/gi;
const cueText=s=>String(s||'').replace(/<[^>]*>/g,'').replace(/\[[^\]]*\]/g,'').replace(SOUND_TAG,'').replace(/[()]/g,' ').replace(/[♪♫🎵🎶]/g,'').replace(/\s+/g,' ').trim(); // sem limite de caracteres
/** 🎞️ frases sincronizadas de QUALQUER formato colado ou aberto:
 *   · .srt / .vtt  — blocos "00:00:18,500 --> 00:00:21,000" + texto (usa início E fim)
 *   · .lrc         — "[00:18.50] frase"
 *   · Transcrição do YouTube ("Mostrar transcrição" → copiar): "0:18" numa linha e o texto na seguinte, ou "0:18 texto"
 *  Saída: [{t,text,end?}] em ordem, sem linhas vazias nem repetições consecutivas (legendas "roladas" do YouTube). */
function parseTimedText(txt){
 txt=String(txt||'').replace(/\r/g,'').replace(/^﻿/,'');let out=[];
 if(/-->/.test(txt)){ // SRT / VTT
  for(const block of txt.split(/\n\s*\n/)){const ls=block.split('\n').map(x=>x.trim()).filter(Boolean),i=ls.findIndex(x=>x.includes('-->'));if(i<0)continue;
   const m=ls[i].match(/([\d:.,]+)\s*-->\s*([\d:.,]+)/);if(!m)continue;const text=cueText(ls.slice(i+1).join(' '));if(text)out.push({t:tsSec(m[1]),end:tsSec(m[2]),text})}
 }else if(/\[\d{1,2}:\d{1,2}/.test(txt))out=parseLRC(txt);
 else{ // transcrição do YouTube
  let cur=null;
  for(const raw of txt.split('\n')){const s=raw.trim();if(!s)continue;const m=s.match(/^(\d{1,2}(?::\d{2}){1,2})(?:\s+(.*))?$/);
   if(m){if(cur&&cur.text)out.push(cur);cur={t:tsSec(m[1]),text:cueText(m[2]||'')}}
   else if(cur&&!/^\d+\s+(segundos?|seconds?|minutos?|minutes?)/i.test(s))cur.text=cueText(cur.text+' '+s)} // ignora o texto de acessibilidade "2 segundos"
  if(cur&&cur.text)out.push(cur);
 }
 return tidyLines(out);
}
/** ordena, descarta vazias e junta a legenda repetida encostada na anterior (= a mesma fala; estende o fim) */
function tidyLines(out){
 out=out.filter(x=>x.text&&isFinite(x.t)).sort((a,b)=>a.t-b.t);
 const res=[];for(const x of out){const p=res[res.length-1];
  if(p&&x.text===p.text&&(x.t-(p.end||p.t)<=.5||x.t-p.t<=1.5)){if(x.end)p.end=Math.max(p.end||0,x.end);continue}res.push(x)}
 return res;
}
// 🎞️ SERVIDOR DE LEGENDAS (tools/captions-worker.js publicado na Cloudflare): com ele, colar o link já basta —
//  o jogo pede as legendas do vídeo ao Worker e cada frase vira um Asteroide do Bardo no tempo exato da fala.
//  Cole a URL do seu Worker em SONG_CAPTIONS_API (vale para todo mundo que abrir o jogo) ou no campo do Avançado (só neste navegador).
const SONG_CAPTIONS_API='https://mage-legendas.moraesmatheus92.workers.dev';
const SONG_CAP_V=4; // versão da legenda (2 = idioma da voz · 3 = sem cortes · 4 = frases da automática montadas no jogo); versão menor busca de novo
// 🎤 frases a partir das palavras com tempo (legenda automática): corta numa pausa LONGA, ou numa pausa curta se a frase já
//  tem palavras suficientes, ou ao passar do máximo de palavras/segundos. Marcações [Music] são descartadas.
const PHR={long:1.3,short:.55,minW:4,maxW:10,maxS:6.5,tail:.6};
function phrasesFromTimedWords(words){
 const W=words.map(x=>({t:+x.t,w:cueText(x.w)})).filter(x=>x.w&&isFinite(x.t)).sort((a,b)=>a.t-b.t),out=[];let cur=null;
 for(let i=0;i<W.length;i++){const w=W[i],gap=i?w.t-W[i-1].t:99;
  const brk=!cur||gap>PHR.long||(gap>PHR.short&&cur.n>=PHR.minW)||cur.n>=PHR.maxW||w.t-cur.t>PHR.maxS;
  if(brk){if(cur)out.push(cur);cur={t:w.t,last:w.t,text:w.w,n:1}}else{cur.text+=' '+w.w;cur.n++;cur.last=w.t}}
 if(cur)out.push(cur);
 return out.map((p,i)=>({t:p.t,end:Math.min(out[i+1]?out[i+1].t:p.last+PHR.tail+.6,p.last+PHR.tail+.6),text:p.text}));
}
const songCaptionsApi=()=>String(store.get('captionsApi','')||SONG_CAPTIONS_API).trim().replace(/\/+$/,'');
// 🚦 semáforo das legendas: no máximo 1 pedido ao servidor por vez (o mesmo vídeo pedido 2× reaproveita o pedido em andamento)
//  e, se o servidor disser "pausa" (o YouTube bloqueou), o jogo nem pergunta de novo até a pausa acabar (capCoolUntil, salvo).
const SONG_CAP_TTL=7*864e5; // letras salvas valem 7 dias (por enquanto); depois busca de novo (e fica com a antiga se falhar)
let _capQ=Promise.resolve(),_capWait={};
const capCoolUntil=()=>+store.get('capCoolUntil',0)||0;
/** busca as legendas do vídeo no Worker (máx. 8 s). Devolve {lines:[{t,end,text}], err:''|'cooldown'|'none'|'net', retryIn:s} */
function fetchCaptions(vid){
 if(_capWait[vid])return _capWait[vid];
 const run=async()=>{
  const api=songCaptionsApi();if(!api)return{lines:[],err:'net',retryIn:600};
  const cool=capCoolUntil()-Date.now();if(cool>0)return{lines:[],err:'cooldown',retryIn:Math.ceil(cool/1000)};
  const ctl=typeof AbortController!=='undefined'?new AbortController():null,timer=setTimeout(()=>ctl&&ctl.abort(),8000);
  try{const lang=String(typeof LANG!=='undefined'?LANG:'pt').slice(0,2);
   const r=await fetch(api+'/?v='+encodeURIComponent(vid)+'&lang='+lang,{signal:ctl?ctl.signal:undefined});const j=await r.json();
   if(j&&(j.error==='cooldown'||j.error==='blocked')){const s=Math.max(60,+j.retryIn||1800);store.set('capCoolUntil',Date.now()+s*1000);return{lines:[],err:'cooldown',retryIn:s}}
   if(!j||!j.ok||!Array.isArray(j.lines))return{lines:[],err:'none',retryIn:12*3600};
   const lines=Array.isArray(j.words)&&j.words.length?phrasesFromTimedWords(j.words):j.lines.map(x=>({t:+x.t,end:+x.end||undefined,text:cueText(x.text)})); // automática: frases montadas aqui pelas pausas do canto
   return{lines:tidyLines(lines),err:'',retryIn:0};
  }catch(e){return{lines:[],err:'net',retryIn:600}}finally{clearTimeout(timer)}
 };
 const p=_capQ.then(run,run);_capQ=p.catch(()=>{});_capWait[vid]=p;p.finally(()=>{delete _capWait[vid]});return p; // fila: um de cada vez
}
/** estado da letra de uma faixa (selo no seletor): 'ok' salva e válida · 'old' salva mas venceu (busca de novo ao tocar) · 'wait' sem letra, nova tentativa marcada · 'auto' nunca buscou */
function songCapState(tr){
 if(tr.src!=='yt')return'';
 if(tr.lines&&tr.lines.length)return tr.capSrc&&tr.capAt&&Date.now()-tr.capAt>SONG_CAP_TTL?'old':'ok';
 if(tr.capRetryAt&&tr.capRetryAt>Date.now())return'wait';
 return'auto';
}
/** palavras digitáveis de uma frase: só letras (apóstrofo/pontuação/números saem), minúsculas, até 16 letras */
const lyricWords=s=>String(s||'').toLowerCase().normalize('NFC').split(/\s+/).map(w=>w.replace(/[^\p{L}]/gu,'')).filter(Boolean); // palavra inteira, sem corte
/** frases → notas: fim = início da próxima (máx. 8 s); refrão = frase que já apareceu antes (asteroide dourado) */
// 🎚️ DIFICULDADE do modo frase (músicas rápidas): grace = segundos extras depois do fim da frase até o asteroide chegar
//  na torre · key = só palavras-chave · perfect/great = janelas do julgamento (contadas a partir do fim da frase)
const SONG_DIFF={
 easy:{grace:8,key:true,perfect:1.2,great:3}, // folgas maiores desde que a frase nasce junto com o canto (antes nascia ~3 s antes)
 normal:{grace:6.5,key:false,perfect:.7,great:2.2},
 full:{grace:4.5,key:false,perfect:.35,great:1.5}
};
const songDiff=()=>{const d=store.get('songDiff','normal');return SONG_DIFF[d]?d:'normal'};
// palavras de função (artigos, pronomes, preposições, contrações) — no Fácil ficam de fora; a frase continua visível
const SONG_STOP=new Set(('the a an and or but to of in on at for from by with is are was be am i you he she it we they me my your our his her its their '+
 'im ive ill id youre youve were dont cant wont aint its thats theres oh ah yeah uh na la do so no not just that this what all can will '+
 'o os as um uma uns umas de do da dos das e em no na nos nas ao aos que eu tu ele ela nos vos eles elas me te se lhe meu minha teu tua seu sua por pra para com nao mas ja vou vai tem sou foi '+
 'el los las un una del y en yo mi tu su te le lo con sin pero ya es soy fue muy').split(' '));
/** Fácil: até 1/3 das palavras (mín. 1, máx. 3), as mais longas que não são palavras de função, na ordem em que são cantadas */
function keyWords(words){
 const k=Math.max(1,Math.min(3,Math.ceil(words.length/3)));
 const cand=words.map((w,i)=>({w,i})).filter(o=>o.w.length>=3&&!SONG_STOP.has(stripMarks(o.w)));
 const pool=cand.length?cand:words.map((w,i)=>({w,i}));
 return pool.slice().sort((a,b)=>b.w.length-a.w.length||a.i-b.i).slice(0,k).sort((a,b)=>a.i-b.i).map(o=>o.w);
}
// ⌨️ LETRA DIGITÁVEL: o jogador tem teclado latino. Coreano (hangul) vira a Romanização Revisada, sílaba por sílaba
//  ("오빤 강남스타일" → "oppan gangnamseutail", como se canta); a consoante final passa para a sílaba seguinte quando ela
//  começa por vogal (사람이 → sarami). Outras escritas (japonês, chinês, russo, árabe…): a frase vira palavras do jogo,
//  no mesmo tempo e com o mesmo tanto de palavras (1 a cada 2 cantadas, de 1 a 4).
const KO_I='g kk n d tt r m b pp s ss _ j jj ch k t p h'.split(' '),KO_V='a ae ya yae eo e yeo ye o wa wae oe yo u wo we wi yu eu ui i'.split(' ');
const KO_F=',k,k,k,n,n,n,t,l,k,m,p,t,t,p,t,m,p,p,t,t,ng,t,t,k,t,p,t'.split(',');
const KO_FV=',g,kk,ks,n,nj,nh,d,r,lg,lm,lb,ls,lt,lp,lh,m,b,bs,s,ss,ng,j,ch,k,t,p,h'.split(','); // final antes de vogal
function romanizeKo(s){
 let out='';
 for(let i=0;i<s.length;i++){const c=s.charCodeAt(i)-0xac00;if(c<0||c>11171){out+=s[i];continue}
  const ini=Math.floor(c/588),med=Math.floor(c%588/28),fin=c%28,nx=s.charCodeAt(i+1)-0xac00,nxVowel=nx>=0&&nx<=11171&&Math.floor(nx/588)===11;
  out+=(ini===11?'':KO_I[ini])+KO_V[med]+(fin?(nxVowel?KO_FV[fin]:KO_F[fin]):'')}
 return out;
}
const NON_LATIN=/[^\p{Script=Latin}\P{L}]/u;
function typeableText(s,n){
 s=String(s||'');if(/[가-힣]/.test(s))s=romanizeKo(s);
 if(!NON_LATIN.test(s))return{text:s,game:false};
 const k=Math.max(1,Math.min(4,Math.ceil((n||s.split(/\s+/).length)/2))),ws=[];
 for(let i=0;i<k;i++){const L=POOL[i%2?'m':'s'];ws.push(L&&L.length?L[(Math.random()*L.length)|0]:'magia')}
 return{text:ws.join(' '),game:true};
}
function linesToNotes(lines,dur){
 const out=[],seen=new Set(),D=SONG_DIFF[songDiff()],gw=new Map(); // gw: a mesma frase estrangeira ganha as mesmas palavras do jogo (o refrão continua refrão)
 for(let i=0;i<lines.length;i++){const L0=lines[i];let ty=gw.get(L0.text);if(!ty){ty=typeableText(L0.text);gw.set(L0.text,ty)}
  const L=ty.text===L0.text?L0:Object.assign({},L0,{text:ty.text}),all=lyricWords(L.text);if(!all.length||L.t>=dur)continue;
  const nxt=lines[i+1]?lines[i+1].t:Infinity,own=L.end?L.end:Math.min(nxt,L.t+4.5),key=all.join(' '); // legenda (.srt/.vtt) traz o próprio fim
  const nx=Math.max(L.t+.8,Math.min(own,nxt+.05)); // legendas "roladas" se sobrepõem: a frase acaba quando a próxima começa (ordem cantada, uma de cada vez)
  const words=D.key?keyWords(all):all;
  out.push({t:Math.max(.8,L.t),end:Math.min(nx,L.t+8),text:L.text,words,all,chorus:seen.has(key),vi:out.length%3,lead:SONG_LINE_LEAD});seen.add(key)}
 return out;
}
/** notas pela batida: a 1ª entra depois do aviso (SONG_LEAD) e a última termina 2 s antes do fim */
function beatNotes(bpm,offset,every,dur){
 const spb=60/Math.max(30,Math.min(240,bpm)),step=spb*Math.max(1,every),out=[];
 for(let t=offset;t<dur-2;t+=step)if(t>=SONG_LEAD+.6)out.push({t,w:''});
 return out;
}
// 🎼 Modo automático ("só colar o link"): duração máxima jogada de um vídeo longo (a partida termina aqui, com o resultado normal)
const SONG_AUTO_BPM=120,SONG_MAX=480;
/** gerador automático de notas (zero configuração): grade de 120 BPM e densidade que cresce ao longo da faixa —
 *  aquecimento (1 palavra a cada 5 tempos) → miolo (4) → final (3) — com um respiro de 4 tempos a cada 12 palavras.
 *  As palavras saem do banco do jogo na hora do spawn (vocabulário pela "onda" = progresso da faixa). */
function generateSongBeats(dur,bpm,offset){
 const spb=60/(bpm||SONG_AUTO_BPM),off=offset||0,end=Math.min(dur,SONG_MAX)-2.5,out=[];
 let t=off+Math.ceil((SONG_LEAD+.6-off)/spb)*spb;const start=t; // 🥁 com a batida sincronizada a grade parte do 1º tempo real da música
 while(t<end){
  out.push({t:+t.toFixed(3),w:''});
  const k=(t-start)/Math.max(1,end-start),beats=k<.15?5:k<.55?4:3;
  t+=beats*spb+(out.length%12===0?4*spb:0);
 }
 return out;
}

// ---------- YouTube IFrame API (carregamento sob demanda, uma vez) ----------
let _ytP=null;
function ytLoad(){
 if(window.YT&&YT.Player)return Promise.resolve();
 if(_ytP)return _ytP;
 _ytP=new Promise((res,rej)=>{
  const prev=window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady=()=>{if(typeof prev==='function')try{prev()}catch(e){}res()};
  const s=document.createElement('script');s.src='https://www.youtube.com/iframe_api';s.async=true;
  s.onerror=()=>{_ytP=null;rej(new Error('net'))};document.head.appendChild(s);
  setTimeout(()=>{if(!(window.YT&&YT.Player)){_ytP=null;rej(new Error('timeout'))}},15000);
 });
 return _ytP;
}

// ---------- Tambor do Bardo (offline) ----------
// agendado à frente no AudioContext (como a trilha do jogo): bumbo nos tempos 1/3, caixa no 2/4, chimbal nas colcheias
const DRUM={timer:0,next:0,step:0,out:null};
function drumOut(){const ac=getAC();if(!DRUM.out){DRUM.out=ac.createGain();DRUM.out.connect(ac.destination)}DRUM.out.gain.value=.9*(typeof MUS!=='undefined'?MUS.vol:.7);return DRUM.out}
function drumHit(kind,t){
 const ac=AC,o=ac.createOscillator(),g=ac.createGain();o.connect(g);g.connect(DRUM.out);
 if(kind==='k'){o.frequency.setValueAtTime(140,t);o.frequency.exponentialRampToValueAtTime(45,t+.16);g.gain.setValueAtTime(.55,t);g.gain.exponentialRampToValueAtTime(.001,t+.22);o.start(t);o.stop(t+.25)}
 else if(kind==='s'){o.type='triangle';o.frequency.setValueAtTime(210,t);g.gain.setValueAtTime(.16,t);g.gain.exponentialRampToValueAtTime(.001,t+.12);o.start(t);o.stop(t+.14)}
 else{o.type='square';o.frequency.setValueAtTime(7200+Math.random()*900,t);g.gain.setValueAtTime(.018,t);g.gain.exponentialRampToValueAtTime(.0005,t+.035);o.start(t);o.stop(t+.04)}
}
function drumTick(){
 const R=Rhythm,tr=R.track;if(!tr||R.paused)return;const ac=AC,e8=60/tr.bpm/2;
 while(DRUM.next<ac.currentTime+.15){
  const s=DRUM.step%8,t=DRUM.next;
  if(tr.kit!=='calm'||s%4===0)drumHit('h',t);
  if(s===0||(s===4&&tr.kit!=='calm')||(tr.kit==='gallop'&&s===3))drumHit('k',t);
  if((s===2||s===6)&&tr.kit!=='calm')drumHit('s',t);
  if(tr.kit==='calm'&&s===4)drumHit('s',t);
  DRUM.next+=e8;DRUM.step++;
 }
}
function drumStart(at){drumOut();DRUM.next=at;DRUM.step=0;clearInterval(DRUM.timer);DRUM.timer=setInterval(drumTick,25)}
function drumStop(){clearInterval(DRUM.timer);DRUM.timer=0}

// ---------- sessão ----------
const Rhythm={
 track:null,last:null,notes:[],ni:0,t:0,dur:0,beat:-1,paused:false,playing:false,ended:false,
 yt:null,ytT:0,ytRead:0,rt:0,t0:0,pauseAt:0,
 stats:{perfect:0,great:0,ok:0,miss:0},lastJ:'',lastJT:0,

 /** faixas do jogador (YouTube), salvas no navegador */
 custom(){const a=store.get('songs',[]);return Array.isArray(a)?a:[]},
 saveCustom(list){store.set('songs',list.slice(0,30))},
 all(){return SONG_DRUMS.concat(songCatalog(),this.custom())},
 find(id){return this.all().find(x=>x.id===id)||null},

 /** escolha no seletor: fecha o modal e começa */
 pick(id){const tr=this.find(id);if(!tr)return;if(modalOpen)closeModal();this.queue=[];this.start(tr)}, // escolha manual encerra a fila da playlist
 queue:[],qTotal:0,
 /** ⏭ playlist: próxima faixa da fila (botão no resultado) */
 nextInQueue(){const id=this.queue.shift(),tr=id&&this.find(id);if(!tr)return;hideOverlay();this.start(tr)},

 async start(tr){
  this.stop();this.track=tr;this.last=tr;this.stats={perfect:0,great:0,ok:0,miss:0};this.lastJ='';this.ended=false;this.beat=-1;this.ni=0;this.t=0;this.paused=false;
  this.mood=this.moodT=1;this.moodHold=0;this.lastVol=-1;this.hasLyrics=false;sfxApply(); // 🔊 efeitos baixinhos enquanto a faixa toca
  this.diff=songDiff(); // 🎚️ dificuldade escolhida no seletor (vale para a partida inteira)
  this.needBegin=true;this.capNote=''; // a partida abre no 1º "tocando" do vídeo (não dá para olhar G.song: depois de perder, a partida anterior ainda está na memória)
  if(tr.src==='drum'){this.dur=tr.dur;this.notes=beatNotes(tr.bpm,tr.offset||0,tr.every||3,tr.dur);this.begin();
   const ac=getAC();if(ac.state==='suspended')ac.resume();this.t0=ac.currentTime+.12;drumStart(this.t0);return}
  // YouTube
  if(location.protocol==='file:'){this.fail('song.err.file');return}
  this.lyrFake=false;
  if(tr.cat){ // 📚 música pronta: 1º a letra sincronizada (LRCLIB com o ajuste do catálogo; senão o servidor de legendas), guardada
   //  30 dias neste navegador. Sem nenhuma: tempos do catálogo com palavras do jogo, legenda do vídeo ligada e aviso no painel
   const c=catLyrGet(tr);
   if(c)tr.lines=c;
   else{let res={lines:[],err:'net',retryIn:600};
    showOverlay(`<div class="songload"><span class="spin" aria-hidden="true">🎤</span><b>${t('song.cap.loading')}</b><small>${esc(tr.title||'')}</small></div>`,'glass');
    if(tr.lrc){const L=await songLrcLines(tr);if(this.track!==tr)return;if(L.length>=3)res={lines:L,err:'',retryIn:0}}
    if(res.lines.length<3&&songCaptionsApi()){
     res=await Promise.race([fetchCaptions(tr.vid),new Promise(r=>setTimeout(()=>r({lines:[],err:'net',retryIn:600}),5000))]);if(this.track!==tr)return}
    if(res.lines.length>=3){tr.lines=res.lines;catLyrPut(tr,res.lines)}
    else{tr.lines=songCatalogLines(tr);this.lyrFake=true;if(res.err==='cooldown')this.capNote=t('song.cap.cool',{m:Math.ceil(res.retryIn/60)})}}
  }
  // 🎞️ pede a legenda ao servidor SÓ para a música que vai tocar: sem letra ainda, letra de versão antiga ou letra vencida (7 dias).
  //  Falhou: "pausa" do servidor → tenta quando ela acabar · sem legenda → 12 h · rede → 10 min. Letra vencida que falhar continua valendo.
  const hasL=tr.lines&&tr.lines.length,oldCap=tr.capSrc&&(tr.capV|0)<SONG_CAP_V,stale=hasL&&tr.capSrc&&(!tr.capAt||Date.now()-tr.capAt>SONG_CAP_TTL);
  if((oldCap||stale||!hasL)&&!(tr.chart&&tr.chart.length)&&songCaptionsApi()&&!(tr.capRetryAt&&tr.capRetryAt>Date.now()&&!oldCap)){
   showOverlay(`<div class="songload"><span class="spin" aria-hidden="true">🎞️</span><b>${t('song.cap.loading')}</b><small>${esc(tr.title||'')}</small></div>`,'glass');
   const res=await fetchCaptions(tr.vid);if(this.track!==tr)return;
   if(res.lines.length>=3){tr.lines=res.lines;tr.capSrc=1;tr.capV=SONG_CAP_V;tr.capAt=Date.now();tr.capRetryAt=0}
   else{tr.capRetryAt=Date.now()+res.retryIn*1000;if(res.err==='cooldown')this.capNote=t('song.cap.cool',{m:Math.ceil(res.retryIn/60)})}
   Rhythm.saveCustom(Rhythm.custom().map(x=>x.id===tr.id?Object.assign({},x,{lines:tr.lines||[],capSrc:tr.capSrc||0,capV:tr.capV||0,capAt:tr.capAt||0,capRetryAt:tr.capRetryAt||0}):x));
  }
  showOverlay(`<div class="songload"><span class="spin" aria-hidden="true">🎵</span><b>${t('song.loading')}</b><small>${esc(tr.title||'')}</small></div>`,'glass');
  try{await ytLoad()}catch(e){this.fail('song.err.net');return}
  if(this.track!==tr)return; // trocou de faixa enquanto carregava
  const dock=songDock(true);dock.innerHTML='<div id="ytPlayer"></div>'+SONG_DOCK_BAR;songDockAd(true); // até a música começar o vídeo aceita clique: anúncio antes da música → "Pular"
  // 📱 iPhone/Safari só toca vídeo com som depois de um TOQUE (o do menu se perde nas esperas acima): se em 2,5 s não começou,
  //  aparece o botão "Tocar" (o toque chama playVideo) e o vídeo sobe por cima da tela escura para dar para tocar nele também
  setTimeout(()=>{if(this.track!==tr||!this.needBegin)return;let st=-1;try{st=this.yt&&this.yt.getPlayerState()}catch(e){}
   const box=document.querySelector('#overlay .songload');if(!box)return;
   if(st===1||st===3){const o=box.querySelector('small');if(o)o.textContent=t('song.adWait');return} // tocando (anúncio) ou carregando: só a dica do "Pular"
   box.querySelector('small').textContent=t(DeviceManager.isTouch?'song.tapHintT':'song.tapHint');
   const dk=document.getElementById('songDock');if(dk)dk.dataset.tip='▶ '+t('song.tapPlay'); // o rótulo do vídeo também chama para o toque (volta ao do anúncio quando a partida abre)
   if(!box.querySelector('.songtap'))box.insertAdjacentHTML('beforeend',`<button class="btn songtap" onclick="Rhythm.tapPlay()">▶ ${t('song.tapPlay')}</button>`)},2500);
  this.yt=new YT.Player('ytPlayer',{width:'100%',height:'100%',videoId:tr.vid,
   playerVars:Object.assign({autoplay:0,controls:0,disablekb:1,fs:0,rel:0,playsinline:1,iv_load_policy:3,origin:location.origin},this.lyrFake?{cc_load_policy:1,cc_lang_pref:tr.lang||'en'}:{}), // 📚 sem a letra: legenda do vídeo ligada
   events:{
    onReady:ev=>{if(this.track!==tr)return;const d=ev.target.getDuration()||tr.dur||180,hasChart=tr.chart&&tr.chart.length,hasLines=tr.lines&&tr.lines.length;
     this.dur=hasChart||hasLines||!tr.auto?d:Math.min(d,SONG_MAX); // automático: vídeos longos jogam no máximo SONG_MAX s
     this.notes=hasLines?linesToNotes(tr.lines,d):hasChart?tr.chart.filter(n=>n.t>=.8&&n.t<d):tr.auto?generateSongBeats(d,tr.synced?tr.bpm:0,tr.synced?tr.offset:0):beatNotes(tr.bpm||100,tr.offset||0,tr.every||4,d);
     this.hasLyrics=!!hasLines; // 🎤 com letra: ESPAÇO separa palavras (não lança Congelar) — ver main.js
     songAutoTitle(tr,ev.target);
     ev.target.setVolume(Math.round(100*(typeof MUS!=='undefined'?MUS.vol:.7)));ev.target.playVideo()},
    onStateChange:ev=>{if(this.track!==tr)return;const S=YT.PlayerState;
     if(ev.data===S.PLAYING&&this.needBegin){this.needBegin=false;this.playing=true;this.rt=performance.now();this.t=ev.target.getCurrentTime()||0;this.begin()} // ↻ jogar de novo / próxima da playlist também abrem a partida
     else if(ev.data===S.ENDED)this.ended=true},
    onError:ev=>{if(this.track===tr)this.fail(ev.data===150||ev.data===101?'song.err.embed':'song.err.video')}
   }});
 },
 /** abre a partida (arcade com G.song) — inimigos só pelo mapa da música, sem ondas/bônus/bênçãos */
 begin(){
  hideOverlay();newGame();G.song=this.track;G.wave=1;G.banner=0;G.spawnLeft=0;G.boss=false;G.bossWave=false;this.playing=true;this.rt=performance.now();
  if(typeof musicMix==='function')musicMix();
  songSideShow(true);songDock(this.track.src==='yt'); // painel da música primeiro: o vídeo se encaixa no espaço dele
  songDockAd(false);songRefocus();mobRotateHint(); // 📱 em pé: sugere girar o celular
 },
 /** ▶ toque do jogador: libera o som no iPhone (o playVideo vai dentro do gesto) */
 tapPlay(){
  if(!this.yt||!this.needBegin)return;try{this.yt.unMute();this.yt.playVideo()}catch(e){}
  const b=document.querySelector('#overlay .songtap');if(b){b.disabled=true;b.textContent='🎵 '+t('song.loading')}
  setTimeout(()=>{const x=document.querySelector('#overlay .songtap');if(x&&this.needBegin){x.disabled=false;x.textContent='▶ '+t('song.tapPlay')}},2500); // não começou: dá para tentar de novo (ou tocar no vídeo)
 },
 fail(key){
  this.stop();hideOverlay();if(state!=='menu')showMenu();
  songErr=t(key);openModal('songs'); // o aviso aparece no topo do seletor de músicas
 },
 /** tempo atual da música (s) */
 now(){
  if(!this.track)return 0;
  if(this.track.src==='drum')return Math.max(0,(this.paused?this.pauseAt:AC.currentTime)-this.t0);
  return this.t;
 },
 /** passo fixo do jogo (só em partida de música) */
 tick(dt){
  const tr=this.track;if(!tr||!G)return;
  this.mix(dt); // 🔊 volume da faixa segue a digitação
  songSideUpdate(); // 🎵 painel da música (4×/s)
  if(tr.src==='yt'&&this.yt&&this.playing&&!this.paused){
   const now=performance.now();this.t+=(now-this.rt)/1000;this.rt=now;
   // 📱 o tempo do player chega aos saltos (no iPhone ~1×/s): só corrige o relógio quando chega um valor NOVO — reler o
   //  mesmo valor velho puxaria a música para trás a cada leitura (inimigos tremendo)
   if(now-this.ytRead>250){this.ytRead=now;try{const y=this.yt.getCurrentTime();const st=this.yt.getPlayerState();
    if(st===YT.PlayerState.BUFFERING)this.t=y;else if(y!==this.yLast){this.yLast=y;if(Math.abs(y-this.t)>.35)this.t=y;else this.t+=(y-this.t)*.25}}catch(e){}}
  }
  const T0=this.now(),spb=60/(tr.bpm||100);
  // 🥁 pulso da batida: anel na torre e brilho no cajado (o mago "respira" no ritmo)
  const b=Math.floor((T0-(tr.offset||0))/spb);
  if(b!==this.beat&&b>=0){this.beat=b;addRing(TX,TTOP-34,8,b%4===0?74:52,.32,b%4===0?'#ffe9a8':G.col);castGlow=Math.max(castGlow,b%4===0?.55:.3)}
  // nasce cada nota SONG_LEAD s antes do tempo dela
  while(this.ni<this.notes.length&&this.notes[this.ni].t-(this.notes[this.ni].lead!=null?this.notes[this.ni].lead:SONG_LEAD)<=T0){this.spawnNote(this.notes[this.ni],T0);this.ni++} // 🎤 frase: lead próprio (SONG_LINE_LEAD)
  G.wave=1+Math.min(7,Math.floor(T0/Math.max(1,this.dur)*8)); // progresso da faixa vira a "onda" (vocabulário e XP)
  if((this.ended||T0>=this.dur)&&this.ni>=this.notes.length&&!G.enemies.length&&state==='play'){G.songClear=true;gameOver()}
 },
 spawnNote(n,T0){
  if(n.words)return this.spawnLine(n,T0);
  const k=this.ni%8===7?'crystal':'rock';spawn(k);const e=G.enemies[G.enemies.length-1];if(!e)return;
  if(n.w){e.word=n.w;e.nw=norm(n.w);e.lw=measure(e.word.toUpperCase())}
  const left=Math.max(1.6,n.t+SONG_GRACE-T0),dist=Math.max(60,e.d0-(e.r+44));
  e.songT=n.t;e.songV=dist/left;
 },
 /** 🎤 frase: um Asteroide do Bardo grande (tamanho pelo nº de palavras) que só chega na torre depois do fim da frase */
 spawnLine(n,T0){
  spawn('rock');const e=G.enemies[G.enemies.length-1];if(!e)return;
  e.lyric=n;e.r=Math.min(46,30+n.words.length*1.5);e.x=e.px=TX+(this.ni%2?1:-1)*(80+rand(0,25));e.y=e.py=SPAWN_Y;e.d0=Math.hypot(TX-e.x,TTOP-30-e.y)||400; // duas faixas fixas (esq./dir.): legendas seguidas não se cobrem
  e.phrase=n.words;e.pi=0;e.hp=e.maxHp=n.words.length;setWord(e);
  const D=SONG_DIFF[this.diff||'normal'],arrive=Math.max(1.8,Math.max(n.end,n.t+n.words.length*.75)+D.grace-T0),dist=Math.max(60,e.d0-(e.r+44)); // 🎚️ mais tempo no Fácil/Normal
  e.songT=n.end;e.songV=dist/arrive;
  if(n.chorus)floatTxt(e.x,SPAWN_Y+e.r+50,t('song.chorus'),'#ffe9a8',15);
 },
 /** palavra completada: julga pela distância até o tempo da nota (frase: pelo fim da frase, só na última palavra) */
 judge(e){
  if(e.songT==null)return;
  if(e.lyric){ // frase: as palavras do meio só brilham; o julgamento vem na ÚLTIMA (pelo fim da frase cantada)
   if(e.hp>1){starBurst(e.x,e.y,e.lyric.chorus?'#ffe9a8':'#c9a6ff',6,90,0);return}
   const D=SONG_DIFF[this.diff||'normal'],d=this.now()-e.songT,j=d<=D.perfect?'perfect':d<=D.great?'great':'ok',n=e.lyric.words.length;
   this.stats[j]++;this.lastJ=j;this.lastJT=1;if(j==='perfect'){buzz('perfect');songPerfectFx()}
   G.score+=Math.round(n*25*(SONG_PTS[j]-.6)*mult());if(j==='perfect'&&e.lyric.chorus)G.aura+=2; // refrão Perfeito: Aura extra
   floatTxt(e.x,e.y-e.r-30,t('song.j.'+j)+(n>1?' · '+n+'×':''),j==='perfect'?'#ffe9a8':j==='great'?'#9ae8ff':'#c6cde8',j==='perfect'?22:17);
   addRing(e.x,e.y,e.r,e.r*3,.45,e.lyric.chorus?'#ffe9a8':'#c9a6ff');return}
  const d=Math.abs(this.now()-e.songT),j=d<=SONG_JUDGE.perfect?'perfect':d<=SONG_JUDGE.great?'great':'ok';
  this.stats[j]++;this.lastJ=j;this.lastJT=1;if(j==='perfect'){buzz('perfect');songPerfectFx()}
  const bonus=Math.round(e.word.length*10*(SONG_PTS[j]-1)*mult());if(bonus>0)G.score+=bonus;
  const col=j==='perfect'?'#ffe9a8':j==='great'?'#9ae8ff':'#c6cde8';floatTxt(e.x,e.y-e.r-30,t('song.j.'+j),col,j==='perfect'?20:16);
  if(j==='perfect'){const tp=staffTip(1);addRing(tp.x,tp.y,4,40,.3,'#ffe9a8')}
 },
 missNote(e){if(e&&e.songT!=null)this.stats.miss++;this.onTowerHit()},
 /** 🎤 a frase da vez = a mais antiga ainda na tela (ordem cantada). Só ela recebe as teclas; as seguintes esperam apagadas. */
 currentLyric(){let best=null;if(!G)return null;for(let i=0;i<G.enemies.length;i++){const e=G.enemies[i];if(e.lyric&&(!best||e.lyric.t<best.lyric.t))best=e}return best},
 pause(){
  if(!this.track||this.paused)return;this.paused=true;
  if(this.track.src==='drum'){this.pauseAt=AC.currentTime;drumStop()}
  else if(this.yt)try{this.yt.pauseVideo()}catch(e){}
 },
 resume(){
  if(!this.track||!this.paused)return;this.paused=false;
  if(this.track.src==='drum'){const ac=AC;this.t0+=ac.currentTime-this.pauseAt;DRUM.next=ac.currentTime+.05;clearInterval(DRUM.timer);DRUM.timer=setInterval(drumTick,25)}
  else if(this.yt){this.rt=performance.now();try{this.yt.playVideo()}catch(e){}}
 },
 stop(){
  drumStop();if(this.yt){try{this.yt.destroy()}catch(e){}this.yt=null}
  this.track=null;this.playing=false;this.paused=false;songDock(false);if(typeof songSideShow==='function')songSideShow(false);
  if(typeof musicMix==='function')musicMix();if(typeof sfxApply==='function')sfxApply(); // efeitos voltam ao volume normal
 },
 /** fim da partida (vitória ou derrota): Aura pelo ritmo, histórico da faixa, áudio desligado */
 finish(){
  const tr=this.track;if(!tr||!G)return null;const s=this.stats,total=Math.max(1,this.notes.length);
  const clear=!!G.songClear,aura=Math.round(s.perfect*1.5+s.great*.5)+(clear?20:0);G.aura+=aura;
  const sum={id:tr.id,title:tr.src==='drum'?t(tr.title):tr.title,src:tr.src,clear,perfect:s.perfect,great:s.great,ok:s.ok,miss:s.miss,total,
   pct:Math.round(Math.min(1,this.now()/Math.max(1,this.dur))*100),aura,at:Date.now()};
  const ss=profile.songStats=profile.songStats||{games:0,clears:0,perfects:0};ss.games++;if(clear)ss.clears++;ss.perfects+=s.perfect; // 📊 totais (o histórico guarda só as 20 últimas)
  const h=profile.songHistory=Array.isArray(profile.songHistory)?profile.songHistory:[];
  h.unshift({id:sum.id,title:sum.title,clear,perfect:s.perfect,great:s.great,miss:s.miss,total,pct:sum.pct,wpm:calcWpm(),acc:calcAcc(),score:G.score,at:sum.at});
  if(h.length>SONG_HIST_MAX)h.length=SONG_HIST_MAX;
  this.stop();return sum;
 },
 /** HUD da música (canvas): título, barra de progresso com o tempo, WPM/precisão ao vivo e o último julgamento */
 drawHud(c){
  const tr=this.track;if(!tr||!G||!G.song)return;const T0=this.now(),k=Math.min(1,T0/Math.max(1,this.dur)),y=14; // y-2 = 12: o topo das caixas do HUD
  // 📐 encaixada no vão entre o placar (esq., até x 164) e a caixa da onda/vidas (dir., largura pelo nº de vidas — ui.js drawHUDLayer)
  const gapL=172,gapR=W-12-(90+G.ch.lives*25)-8,x=gapL+10,w=Math.max(120,gapR-gapL-20);
  // ⭕ anel de aproximação em cada nota: fecha sobre o inimigo exatamente no tempo dela (fica dourado na janela do Perfeito)
  c.save();c.lineWidth=2;
  for(let i=0;i<G.enemies.length;i++){const e=G.enemies[i];if(e.songT==null)continue;
   if(e.lyric){ // 🎤 frase: halo na cor da variante + anel de tempo que se esvazia do início ao fim da frase cantada
    const L=e.lyric,ex=lerpX(e),ey=lerpY(e),f=Math.max(0,Math.min(1,(L.end-T0)/Math.max(.5,L.end-L.t))),col=L.chorus?'#ffe9a8':LYRIC_VAR[L.vi].glow;
    c.globalCompositeOperation='lighter';c.globalAlpha=.32+.12*Math.sin(T*3+i);c.drawImage(softGlow(col),ex-e.r*2.4,ey-e.r*2.4,e.r*4.8,e.r*4.8);c.globalCompositeOperation='source-over';
    c.globalAlpha=.9;c.strokeStyle=f>0?col:'rgba(255,120,140,.8)';c.lineWidth=3;c.beginPath();c.arc(ex,ey,e.r+8,-1.571,-1.571+6.283*(f>0?f:1));c.stroke();c.lineWidth=2;continue}
   const dk=(e.songT-T0)/SONG_LEAD;if(dk<-.15)continue;
   const hot=Math.abs(e.songT-T0)<=SONG_JUDGE.perfect;c.globalAlpha=hot?.95:Math.max(.25,.75-dk*.4);c.strokeStyle=hot?'#ffe9a8':'#9ae8ff';
   c.beginPath();c.arc(lerpX(e),lerpY(e),e.r+6+Math.max(0,dk)*48,0,6.283);c.stroke()}
  c.restore();
  // 📱 celular (iPhone/Android): o placar é HTML (#mhud) e maior → a caixa da música desce para logo abaixo dele, centrada e
  //  ampliada (o canvas encolhe ~0,6× no celular; sem isso as letras ficam minúsculas e a caixa some atrás da onda/vidas)
  const mob=songHudMob();c.save();if(mob){c.translate(TX,mob.y);c.scale(mob.s,mob.s);c.translate(-x-w/2,-y+8)}
  // mesma moldura dourada e mesma altura (56) das caixas do placar e da onda: as três ficam alinhadas no topo
  if(mob){c.fillStyle='rgba(6,8,26,.78)';c.beginPath();c.roundRect(x-10,y-2,w+20,56,12);c.fill();c.strokeStyle='rgba(233,216,188,.55)';c.lineWidth=1.2;c.stroke()}
  else hudBox(c,x-10,y-2,Math.round(w+20),56);
  const mm=s=>Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0'),clock=mm(T0)+' / '+mm(this.dur);
  c.font='900 11px Nunito';const cw=c.measureText(clock).width; // 📐 o título cabe no espaço que sobra ao lado do relógio (não encosta mais nele)
  const title=tr.src==='drum'?t(tr.title):tr.title||'';c.textAlign='left';c.fillStyle='#e9d8bc';c.fillText(fitTxt(c,'🎵 '+title,w-cw-10),x,y+14);
  c.textAlign='right';c.fillStyle='#aab4dc';c.fillText(clock,x+w,y+14);
  c.fillStyle='rgba(255,255,255,.1)';c.fillRect(x,y+22,w,5);c.fillStyle=G.col;c.fillRect(x,y+22,w*k,5);
  c.fillStyle='#fff';c.beginPath();c.arc(x+w*k,y+24.5,3.5,0,6.283);c.fill();
  c.font='800 10px Nunito';c.textAlign='center';c.fillStyle='#c6cde8';
  c.fillText(fitTxt(c,calcWpm()+' WPM · '+calcAcc()+'% · ✨'+this.stats.perfect+' 💫'+this.stats.great,w),x+w/2,y+44);
  const nx=this.hasLyrics?this.notes[this.ni]:null; // 🎤 próxima frase (prévia discreta sob o painel)
  if(nx&&nx.text&&!songSideOn()){c.font='italic 700 10.5px Nunito';c.fillStyle='rgba(233,216,188,.6)';c.fillText(fitTxt(c,'▸ '+nx.text,w+16),x+w/2,y+68)} // com o painel da música aberto, a próxima frase fica lá
  c.restore();c.save();c.textAlign='center';
  if(this.stalled){c.font='900 15px Nunito';c.fillStyle='rgba(6,8,26,.85)';c.beginPath();c.roundRect(TX-170,H/2-60,340,40,12);c.fill();c.strokeStyle='rgba(233,216,188,.6)';c.lineWidth=1.2;c.stroke();
   c.fillStyle='#ffe9a8';c.fillText('📺 '+t('song.stall'),TX,H/2-34);
   c.font='800 11px Nunito';c.fillStyle='rgba(233,216,188,.8)';c.fillText(fitTxt(c,t('song.stallTip'),330),TX,H/2-6)} // aviso: anúncio/carregamento, a partida espera
  if(this.lastJT>0){this.lastJT=Math.max(0,this.lastJT-1/60);c.globalAlpha=Math.min(1,this.lastJT*2);c.font='900 15px Cinzel';
   c.fillStyle=this.lastJ==='perfect'?'#ffe9a8':this.lastJ==='great'?'#9ae8ff':'#c6cde8';c.fillText(t('song.j.'+this.lastJ),TX,TTOP-150)}
  c.restore();
 }
};

/** 🎵 Perfeito no tempo da música: o mago ergue o cajado um instante (pose do triunfo, mais curta) e a gema solta faíscas douradas */
function songPerfectFx(){
 if(typeof WIZ_ANIM==='undefined')return;WIZ_ANIM.triumph=Math.max(WIZ_ANIM.triumph,.55);castGlow=1;
 const tp=staffTip(1);starBurst(tp.x,tp.y-10,'#ffe9a8',qn(10),120,-30);
}
/** 📱 posição da caixa da música no celular: logo abaixo do placar HTML, em coordenadas do canvas (refeito 2×/s) */
let _shm={t:-1,v:null};
function songHudMob(){
 const now=performance.now();if(now-_shm.t<500)return _shm.v;_shm.t=now;_shm.v=null;
 const mh=document.getElementById('mhud');if(!mh||getComputedStyle(mh).display==='none')return null;
 const cr=cv.getBoundingClientRect(),k=cr.height/H;if(!k)return null;
 const s=Math.min(cr.height<420?1.35:1.6,Math.max(1,.95/(cr.width/W))); // celular deitado: campo baixo → caixa menor // compensa o canvas encolhido (letras do tamanho de ~11 px na tela)
 return _shm.v={y:(mh.getBoundingClientRect().bottom-cr.top)/k+6+8*s,s};
}
// ---------- espelho mágico: onde o vídeo aparece ----------
// O YouTube exige o player VISÍVEL e com pelo menos 200×200 px → moldura fixa, sem cliques (o clique no iframe tiraria o foco
// do jogo e pausaria a partida). No PC fica sobre o topo do painel direito; sem painel (janela estreita/celular), no canto.
function songDock(on){
 let d=document.getElementById('songDock');
 if(!on){if(d){d.classList.remove('on','ad');d.innerHTML=''}return d}
 if(!d){d=document.createElement('div');d.id='songDock';d.className='songdock';d.setAttribute('aria-label','YouTube');document.body.appendChild(d)}
 d.dataset.tip=t('song.adTip');d.classList.add('on');songDockPlace();return d;
}
// 📺 anúncio: o vídeo vira clicável (moldura acesa + "Clique em Pular") só enquanto a música não anda; o clique no iframe
//  não pausa a partida (ver blur em main.js) e, quando a música volta, o teclado volta para o jogo sozinho.
const songAdOpen=()=>{const d=document.getElementById('songDock');return!!d&&d.classList.contains('ad')};
function songDockAd(on){const d=document.getElementById('songDock');if(d)d.classList.toggle('ad',!!on)}
function songRefocus(){
 const a=document.activeElement;if(!a||a.tagName!=='IFRAME')return;
 let k=document.getElementById('songFocus');
 if(!k){k=document.createElement('i');k.id='songFocus';k.tabIndex=-1;k.style.cssText='position:fixed;left:0;top:0;width:1px;height:1px;opacity:0;outline:0';document.body.appendChild(k)}
 k.focus({preventScroll:true});
 if(!document.hasFocus()&&state==='play')pause(); // saiu da janela durante o anúncio: a partida espera pausada
}
// 📱 caixa solta (celular / janela sem painel): barrinha com ✥ (arrastar) e ▁/▢ (minimizar). Posição e tamanho ficam salvos.
const SONG_DOCK_BAR=`<div class="sdbar"><button class="sdgrip" tabindex="-1" aria-label="move" onmousedown="event.preventDefault()">✥</button><button class="sdmin" tabindex="-1" aria-label="minimize" onmousedown="event.preventDefault()" onclick="songDockMini()">▁</button></div>`;
function songDockMini(){const m=!store.get('dockMini',true);store.set('dockMini',m);songDockPlace();snd(m?520:780,.05,'triangle',.03)}
document.addEventListener('pointerdown',e=>{
 const g=e.target.closest&&e.target.closest('#songDock .sdgrip');if(!g)return;e.preventDefault();
 const d=document.getElementById('songDock'),r=d.getBoundingClientRect(),ox=e.clientX-r.left,oy=e.clientY-r.top;try{g.setPointerCapture(e.pointerId)}catch(_){}d.classList.add('drag');
 const mv=ev=>{const x=Math.max(0,Math.min(innerWidth-r.width,ev.clientX-ox)),y=Math.max(0,Math.min(innerHeight-r.height,ev.clientY-oy));d.style.left=x+'px';d.style.top=y+'px'};
 const up=()=>{g.removeEventListener('pointermove',mv);d.classList.remove('drag');store.set('dockPos',{x:parseFloat(d.style.left)/innerWidth,y:parseFloat(d.style.top)/innerHeight})};
 g.addEventListener('pointermove',mv);g.addEventListener('pointerup',up,{once:true});g.addEventListener('pointercancel',up,{once:true});
});
function songDockPlace(){
 const d=document.getElementById('songDock');if(!d||!d.classList.contains('on'))return;
 const slot=document.getElementById('songDockSlot'),sr=slot&&document.body.classList.contains('song-mode')&&!DeviceManager.isMobile?slot.getBoundingClientRect():null;
 d.classList.remove('free','mini');d.style.height='';
 if(sr&&sr.width>=200&&sr.height>0){d.style.left=Math.round(sr.left)+'px';d.style.top=Math.round(sr.top)+'px';d.style.width=Math.round(sr.width)+'px';d.style.right=d.style.bottom='auto';return} // 🎵 painel da música: o vídeo ocupa o espaço reservado no topo
 if(DeviceManager.isMobile){ // 📱 celular: caixa solta, arrastável e minimizável
  const mini=!!store.get('dockMini',true),w=mini?160:Math.min(300,innerWidth-16),h=mini?90:Math.max(200,w*9/16);d.classList.add('free');d.classList.toggle('mini',mini);
  const sm=d.querySelector('.sdmin');if(sm)sm.textContent=mini?'▢':'▁';
  const P=store.get('dockPos',null),st=document.querySelector('.stage'),s=st?st.getBoundingClientRect():{right:innerWidth,top:60};
  let x=P?P.x*innerWidth:s.right-w-6,y=P?P.y*innerHeight:s.top+(s.bottom-s.top)*.36; // padrão: lado direito do campo, abaixo da caixa da música (longe do teclado)
  x=Math.max(0,Math.min(innerWidth-w,x));y=Math.max(0,Math.min(innerHeight-h,y));
  d.style.left=Math.round(x)+'px';d.style.top=Math.round(y)+'px';d.style.width=w+'px';d.style.height=h+'px';d.style.right=d.style.bottom='auto';return}
 const rp=document.getElementById('rightPanel'),r=rp&&!DeviceManager.isMobile?rp.getBoundingClientRect():null;
 if(r&&r.width>=240&&getComputedStyle(rp).opacity!=='0'){d.style.left=Math.round(r.left+8)+'px';d.style.top=Math.round(r.top+40)+'px';d.style.width=Math.round(Math.min(r.width-16,356))+'px';d.style.right=d.style.bottom='auto'}
 else{d.style.left=d.style.top='auto';d.style.right='10px';d.style.bottom='10px';d.style.width='228px'}
}
addEventListener('resize',songDockPlace);

// ---------- seletor de músicas (modal 'songs') ----------
let songFormErr='',songErr='';
function tabSongs(){
 setTimeout(songFillTitles,0);setTimeout(songCatPrefetch,800); // ⏬ letras das Músicas prontas em segundo plano // 🏷️ faixas salvas só com o id ganham o nome do vídeo (em segundo plano; redesenha quando chegar)
 const fileWarn=(songErr?`<p class="songwarn">⚠️ ${esc(songErr)}</p>`:'')+(location.protocol==='file:'&&!songErr?`<p class="songwarn">⚠️ ${t('song.err.file')}</p>`:'');songErr='';
 const card=(tr,del)=>{const name=tr.src==='drum'?t(tr.title):esc(tr.title||tr.vid);
  const meta=tr.src==='drum'?`${tr.bpm} BPM · ${Math.round(tr.dur/60*10)/10} min · ${t('song.offline')}`:`${tr.lines&&tr.lines.length?'🎤 '+t('song.lyricsN',{n:tr.lines.length}):tr.chart&&tr.chart.length?t('song.chartN',{n:tr.chart.length}):tr.auto?'✨ '+t('song.auto')+(tr.synced?' · 🥁 '+tr.bpm+' BPM':''):(tr.bpm||100)+' BPM'} · YouTube`;
  const cs=songCapState(tr),left=tr.capAt?Math.max(0,Math.ceil((tr.capAt+SONG_CAP_TTL-Date.now())/864e5)):0; // 🏷️ selo: letra salva (dias que faltam) · vencida · aguardando · ainda não buscada
  const badge=cs==='ok'?`<em class="capb ok" title="${esc(t('song.cap.okTip'))}">✅ ${t('song.cap.ok')}${tr.capAt?' · '+t('song.cap.days',{n:left}):''}</em>`:cs==='old'?`<em class="capb old">♻️ ${t('song.cap.old')}</em>`:cs==='wait'?`<em class="capb wait">⏳ ${t('song.cap.wait')}</em>`:cs==='auto'?`<em class="capb auto">🎞️ ${t('song.cap.auto')}</em>`:'';
  return`<div class="songcard ${tr.src}${cs==='ok'?' playable':''}"><span class="songic" aria-hidden="true">${tr.src==='drum'?'🥁':'📺'}</span><div class="songtx"><b>${name}</b><small>${meta}</small>${badge}</div>
   ${del?`<button class="songdel" onclick="songDelete('${tr.id}')" aria-label="${esc(t('song.delete'))}">✕</button><button class="songmap" onclick="songEdit('${tr.id}','sync')" title="${esc(t('song.sync.btn'))}">🥁${tr.synced?' ✓':''}</button><button class="songmap" onclick="songEdit('${tr.id}')">✏️ ${t('song.ed.map')}</button>`:''}<button class="btn songplay" onclick="Rhythm.pick('${tr.id}')">▶ ${t('song.play')}</button></div>`};
 const hist0=Array.isArray(profile.songHistory)?profile.songHistory:[],hist=hist0.slice(0,5);
 // 🎯 tela limpa: [ cole o link ] [ JOGAR ] no topo; faixas prontas e as suas logo abaixo; BPM/tempos só no "Avançado"
 //  com o servidor de legendas configurado, a caixa de legenda manual vai para o Avançado (as frases vêm sozinhas)
 const capOn=!!songCaptionsApi(),lrcBox=`<details class="songlrc"><summary>🎤 ${t('song.quick.lrc')}</summary><textarea id="sgQuickLrc" rows="4" placeholder="0:18&#10;…&#10;0:22&#10;…" spellcheck="false"></textarea>
  <label class="songfile">📂 ${t('song.quick.file')}<input type="file" accept=".srt,.vtt,.lrc,.txt,text/plain" onchange="songLoadFile(this,'sgQuickLrc')"></label><small>${t('song.quick.lrcHint')}</small></details>`;
 return`<div class="songquick"><input id="sgQuick" placeholder="${esc(t('song.quick.ph'))}" autocomplete="off" spellcheck="false" onkeydown="if(event.key==='Enter'){event.preventDefault();songQuick()}">
  <button class="btn" onclick="songQuick()">▶ ${t('song.quick.play')}</button></div>
 ${capOn?'':lrcBox}
 <p class="songhint">${t(capOn?'song.cap.hint':'song.quick.hint')}</p>${quickErr?`<p class="songwarn">⚠️ ${esc(quickErr)}</p>`:''}${fileWarn}
 <div class="songdiff" role="radiogroup" aria-label="${esc(t('song.diff.title'))}"><span>🎚️ ${t('song.diff.title')}</span>${['easy','normal','full'].map(d=>`<button class="${songDiff()===d?'on':''}" role="radio" aria-checked="${songDiff()===d}" onclick="songSetDiff('${d}')" title="${esc(t('song.diff.'+d+'Tip'))}">${t('song.diff.'+d)}</button>`).join('')}<small>${t('song.diff.'+songDiff()+'Tip')}</small></div>
 ${songCatHTML(hist0)}
 <h4 class="songh">🥁 ${t('song.ready')}</h4><div class="songlist">${SONG_DRUMS.map(x=>card(x,false)).join('')}</div>
 ${Rhythm.custom().length?`<h4 class="songh">📺 ${t('song.yours')}</h4><p class="songhint">${t('song.cap.note')}${capCoolUntil()>Date.now()?' · 🧊 '+t('song.cap.cool',{m:Math.ceil((capCoolUntil()-Date.now())/6e4)}):''}</p><div class="songlist">${Rhythm.custom().slice().sort((a,b)=>(songCapState(a)==='ok'?0:1)-(songCapState(b)==='ok'?0:1)).map(x=>card(x,true)).join('')}</div>`:''}
 <details class="songform"${songFormErr?' open':''}><summary>⚙️ ${t('song.adv')}</summary>
  <label>🎞️ ${t('song.cap.api')}<input id="sgCapApi" placeholder="https://….workers.dev" autocomplete="off" spellcheck="false" value="${esc(store.get('captionsApi','')||'')}" onchange="songSetCapApi(this.value)"></label>
  <small class="songhint">${t(SONG_CAPTIONS_API?'song.cap.apiBuiltIn':'song.cap.apiHint')}</small>
  ${capOn?lrcBox:''}
  <p class="songhint">${t('song.advHint')}</p>
  <label>${t('song.f.url')}<input id="sgUrl" placeholder="https://youtu.be/…" autocomplete="off"></label>
  <label>${t('song.f.title')}<input id="sgTitle" maxlength="60" autocomplete="off"></label>
  <div class="songrow"><label>BPM<input id="sgBpm" type="number" min="40" max="220" placeholder="${esc(t('song.auto'))}"></label><label>${t('song.f.offset')}<input id="sgOff" type="number" step="0.1" min="0" value="0"></label><label>${t('song.f.every')}<input id="sgEvery" type="number" min="1" max="16" value="4"></label></div>
  <label>${t('song.f.chart')}<textarea id="sgChart" rows="4" placeholder="4.0 magia&#10;6.5 dragão&#10;1:02.3 estrela"></textarea></label>
  <label>🎤 ${t('song.f.lrc')}<textarea id="sgLrc" rows="4" placeholder="0:18&#10;…&#10;0:22&#10;…"></textarea></label>
  <label class="songfile">📂 ${t('song.quick.file')}<input type="file" accept=".srt,.vtt,.lrc,.txt,text/plain" onchange="songLoadFile(this,'sgLrc')"></label>
  ${songFormErr?`<p class="songwarn">${esc(songFormErr)}</p>`:''}<button class="btn" onclick="songSave()">💾 ${t('song.save')}</button>
 </details>
 ${hist.length?`<h4 class="songh">📜 ${t('song.history')}</h4><table class="fast songhist"><tr><th>${t('song.track')}</th><th>%</th><th>✨</th><th>WPM</th></tr>${hist.map(h=>`<tr><td>${h.clear?'🏆 ':''}${esc(h.title)}</td><td>${h.pct}</td><td>${h.perfect}</td><td>${h.wpm}</td></tr>`).join('')}</table>`:''}`;
}
/** 📚 bloco das Músicas prontas: filtros por estilo e cartões com o melhor resultado do jogador (🏆 completou · % alcançado) */
function songCatHTML(hist){
 const cat=songCatalog();if(!cat.length)return'';
 const best={};for(const h of hist){const b=best[h.id]||(best[h.id]={pct:0,clear:false});b.pct=Math.max(b.pct,h.pct|0);if(h.clear)b.clear=true}
 // 🎚️ nível pelas frases cantadas (lv do catálogo: letras por segundo que as frases exigem) — lista do Fácil ao Difícil
 const tags=SONG_CAT_TAGS.filter(g=>cat.some(x=>x.tag===g)),list=cat.filter(x=>(!songCatTag||x.tag===songCatTag)&&(!songCatLv||x.lv===songCatLv)).sort((a,b)=>(a.lv||2)-(b.lv||2));
 const card=tr=>{const b=best[tr.id],res=b?(b.clear?'<em class="catres win">🏆</em>':`<em class="catres">${b.pct}%</em>`):'',lv=tr.lv||2;
  return`<div class="songcard yt cat lv${lv}"><span class="songic" aria-hidden="true">⚡</span><div class="songtx"><b>${esc(tr.title)}</b><small><i class="catlv l${lv}" title="${esc(t('song.lv.tip'))}">${'●'.repeat(lv)}${'○'.repeat(3-lv)} ${t('song.lv.'+lv)}</i> · ${t('song.tag.'+tr.tag)}</small></div>${res}<button class="btn songplay" onclick="Rhythm.pick('${tr.id}')">▶ ${t('song.play')}</button></div>`};
 return`<h4 class="songh">📚 ${t('song.cat.title')} <small>${cat.length}</small></h4><p class="songhint">${t('song.cat.hint')}</p>
 <div class="songtags"><button class="${songCatTag?'':'on'}" onclick="songCatFilter('')">${t('song.cat.all')}</button>${tags.map(g=>`<button class="${songCatTag===g?'on':''}" onclick="songCatFilter('${g}')">${t('song.tag.'+g)}</button>`).join('')}</div>
 <div class="songtags lv">${[1,2,3].map(l=>`<button class="l${l}${songCatLv===l?' on':''}" onclick="songCatLvFilter(${l})">${'●'.repeat(l)} ${t('song.lv.'+l)} <small>${cat.filter(x=>(x.lv||2)===l).length}</small></button>`).join('')}</div>
 <div class="songlist songcat">${list.map((tr,i)=>{const lv=tr.lv||2,head=!i||(list[i-1].lv||2)!==lv; // 🎚️ título fixo a cada nível (gruda no topo ao rolar)
  return(head?`<div class="catsec l${lv}"><span>${'●'.repeat(lv)}${'○'.repeat(3-lv)}</span><b>${t('song.lv.'+lv)}</b><small>${list.filter(x=>(x.lv||2)===lv).length}</small></div>`:'')+card(tr)}).join('')}</div>`;
}
function songSave(){
 const $v=id=>(document.getElementById(id)||{}).value||'';const vid=ytIdOf($v('sgUrl'));
 if(!vid){songFormErr=t('song.err.url');renderModal();return}
 const chart=parseSongChart($v('sgChart')),lines=parseTimedText($v('sgLrc')); // 🎤 LRC/legenda/transcrição colada = modo frase
 const bpm=+$v('sgBpm'),auto=!bpm&&!chart.length&&!lines.length; // BPM em branco e sem tempos → gerador automático
 const tr={id:'yt-'+vid+'-'+Date.now().toString(36),src:'yt',vid,title:$v('sgTitle').trim().slice(0,60)||vid,auto,bpm:auto?SONG_AUTO_BPM:Math.max(40,Math.min(220,bpm||100)),offset:Math.max(0,+$v('sgOff')||0),every:Math.max(1,Math.min(16,+$v('sgEvery')||4)),chart,lines};
 Rhythm.saveCustom([tr].concat(Rhythm.custom()));songFormErr='';renderModal();snd(880,.08,'triangle',.04);
}
let quickErr='';
/** ▶ "Só jogar": cola o link e joga. Reaproveita a faixa se o vídeo já estiver salvo; senão cria uma automática (o nome
 *  vem do próprio vídeo quando ele carrega — songAutoTitle). */
/** id da playlist num link do YouTube (list=…) ou o próprio id (PL…/OL…/UU…, 13+ caracteres) */
function ytListOf(s){s=String(s||'').trim();const m=s.match(/[?&]list=([\w-]{10,})/);if(m)return m[1];return /^(PL|OL|UU|FL|LL)[\w-]{10,}$/.test(s)?s:''}
/** 📃 playlist (simples): carrega a lista no espelho, lê os ids (getPlaylist), salva cada vídeo como faixa AUTOMÁTICA e
 *  toca a 1ª; as outras ficam na fila (botão "Próxima música" no resultado). O nome de cada faixa vem do vídeo ao tocar. */
function songPlaylist(list,seed){ // seed = o vídeo do link (v=): a fila sempre começa por ele (Mix "RD…" do YouTube não o devolve em 1º)
 if(location.protocol==='file:'){quickErr=t('song.err.file');renderModal();return}
 if(modalOpen)closeModal();showOverlay(`<div class="songload"><span class="spin" aria-hidden="true">📃</span><b>${t('song.pl.loading')}</b></div>`,'glass');
 const fail=()=>{try{p&&p.destroy()}catch(e){}songDock(false);hideOverlay();songErr=t('song.err.pl');openModal('songs')};let p=null,tries=0;
 ytLoad().then(()=>{const d=songDock(true);d.innerHTML='<div id="ytList"></div>';
  p=new YT.Player('ytList',{width:'100%',height:'100%',playerVars:{listType:'playlist',list,autoplay:0,controls:0,origin:location.origin},events:{
   onError:fail,
   onReady:()=>{const poll=setInterval(()=>{let ids=null;try{ids=p.getPlaylist()}catch(e){}
    if(ids&&ids.length){clearInterval(poll);try{p.destroy()}catch(e){}if(seed)ids=[seed].concat(ids.filter(x=>x!==seed));
     const have=Rhythm.custom(),add=[];for(const vid of ids.slice(0,100))if(!have.some(x=>x.vid===vid))add.push({id:'yt-'+vid,src:'yt',vid,title:vid,auto:true,bpm:SONG_AUTO_BPM,chart:[],lines:[],pl:list});
     Rhythm.saveCustom(add.concat(have));const order=ids.map(v=>(Rhythm.custom().find(x=>x.vid===v)||{}).id).filter(Boolean);
     hideOverlay();Rhythm.queue=order.slice(1);Rhythm.qTotal=order.length;const first=Rhythm.find(order[0]);if(first)Rhythm.start(first);else fail();
     songFillTitles()} // 🏷️ nomes de todas as faixas da playlist em segundo plano
    else if(++tries>25){clearInterval(poll);fail()}},300)}}});
 }).catch(fail);
}
function songQuick(){
 const el=document.getElementById('sgQuick'),raw=el?el.value:'',list=ytListOf(raw);
 if(list){quickErr='';return songPlaylist(list,ytIdOf(raw))} // 📃 link de playlist (começa pelo vídeo do link, se houver)
 const vid=ytIdOf(raw);
 if(!vid){quickErr=t('song.err.url');renderModal();const n=document.getElementById('sgQuick');if(n)n.focus();return}
 quickErr='';let tr=Rhythm.custom().find(x=>x.vid===vid);
 const lt=document.getElementById('sgQuickLrc'),lines=parseTimedText(lt?lt.value:''); // 🎤 transcrição/legenda/LRC colada junto com o link → modo frase
 const ct=songCatalog().find(x=>x.vid===vid);if(ct&&!lines.length)return Rhythm.pick(ct.id); // 📚 link de uma música pronta: toca na hora
 if(!tr){tr={id:'yt-'+vid,src:'yt',vid,title:vid,auto:true,bpm:SONG_AUTO_BPM,chart:[],lines};Rhythm.saveCustom([tr].concat(Rhythm.custom()))}
 else if(lines.length)Rhythm.saveCustom(Rhythm.custom().map(x=>x.id===tr.id?Object.assign({},x,{lines}):x));
 if(lt&&lt.value.trim()&&!lines.length){quickErr=t('song.err.lrc');renderModal();return}
 Rhythm.pick(tr.id);
}
/** nome automático: o título do vídeo substitui o id assim que o player carrega (só se o jogador não deu um nome) */
function songAutoTitle(tr,p){
 try{const ti=(p.getVideoData()||{}).title;if(!ti||tr.title!==tr.vid)return;tr.title=ti.slice(0,60);
  Rhythm.saveCustom(Rhythm.custom().map(x=>x.id===tr.id?Object.assign({},x,{title:tr.title}):x))}catch(e){}
}
/** bloco do resultado (tela de fim): julgamentos, % da faixa e Aura do ritmo */
function songOverHTML(s){
 return`<div class="songover"><b>🎵 ${esc(s.title)}</b><span>${s.clear?'🏆 '+t('song.cleared'):t('song.reached',{p:s.pct})}</span>
  <div class="songj"><i class="p">✨ ${s.perfect} ${t('song.j.perfect')}</i><i class="g">💫 ${s.great} ${t('song.j.great')}</i><i>✔ ${s.ok} ${t('song.j.ok')}</i><i class="m">✕ ${s.miss} ${t('song.j.miss')}</i></div>
  ${s.aura?`<small>${t('song.aura',{n:s.aura})}</small>`:''}
  ${Rhythm.queue.length?`<button class="btn songnext" onclick="Rhythm.nextInQueue()">⏭ ${t('song.pl.next',{a:Rhythm.qTotal-Rhythm.queue.length+1,b:Rhythm.qTotal})}</button>`:''}</div>`;
}
function songDelete(id){Rhythm.saveCustom(Rhythm.custom().filter(x=>x.id!==id));renderModal();snd(330,.08,'triangle',.04)}

// =====================================================================================================
// ✏️ Editor de mapa ao vivo (modal 'songedit'): o vídeo toca e o jogador marca o tempo de cada palavra
//  teclando na batida. Fases (trocadas por data-phase, sem redesenhar o modal — o iframe do player não pode ser recriado):
//   setup  → escreve as palavras (uma por linha ou separadas por espaço) e aperta Gravar
//   rec    → ESPAÇO/ENTER (ou o botão grande, no toque) marca a próxima palavra · ⌫ desfaz · ESC para
//   review → lista das marcas, ajuste fino de todas (±0,05 s), Conferir (toca e mostra cada palavra no tempo), Salvar, Jogar
//   check  → conferência tocando; ESC volta para a revisão
//  Tempo da marca = último getCurrentTime() + tempo real desde a leitura (lido a cada 50 ms) → precisão de poucos ms.
// =====================================================================================================
const SED={tr:null,yt:null,ready:false,phase:'setup',words:[],marks:[],shift:0,timer:0,ytT:0,ytAt:0,playing:false,ci:-1};
const sedWords=txt=>String(txt||'').toLowerCase().normalize('NFC').split(/\s+/).map(w=>w.replace(/[^\p{L}]/gu,'').slice(0,14)).filter(Boolean);
const sedEl=id=>document.getElementById(id);
/** tempo atual do vídeo com interpolação entre leituras */
function sedNow(){return SED.ytT+(SED.playing?(performance.now()-SED.ytAt)/1000:0)}
function songEdit(id,want){
 const tr=Rhythm.find(id);if(!tr||tr.src!=='yt')return;
 Object.assign(SED,{tr,ready:false,phase:'setup',words:[],marks:[],shift:0,ci:-1,want:want||'',taps:[],fit:null}); // want='sync' → abre direto no Sincronizar batida
 openModal('songedit');sedSync();
 if(location.protocol==='file:'){sedStatus(t('song.err.file'));return}
 sedStatus(t('song.loading'));
 ytLoad().then(()=>{
  if(SED.tr!==tr||modal.kind!=='songedit')return;
  SED.yt=new YT.Player('ytEdit',{width:'100%',height:'100%',videoId:tr.vid,
   playerVars:{autoplay:0,controls:0,disablekb:1,fs:0,rel:0,playsinline:1,iv_load_policy:3,origin:location.origin},
   events:{
    onReady:()=>{if(SED.tr!==tr)return;SED.ready=true;try{SED.yt.setVolume(Math.round(100*(typeof MUS!=='undefined'?MUS.vol:.7)))}catch(e){}sedStatus('');sedSync();if(SED.want==='sync')sedBeatStart()},
    onStateChange:ev=>{const S=YT.PlayerState;SED.playing=ev.data===S.PLAYING;sedRead();if(ev.data===S.ENDED&&(SED.phase==='rec'||SED.phase==='check'))sedStop();if(ev.data===S.ENDED&&SED.phase==='sync')sedBeatStop()},
    onError:ev=>sedStatus(t(ev.data===150||ev.data===101?'song.err.embed':'song.err.video'))
   }});
 }).catch(()=>sedStatus(t('song.err.net')));
 clearInterval(SED.timer);SED.timer=setInterval(sedTick,50);
}
function sedRead(){if(!SED.yt||!SED.ready)return;try{SED.ytT=SED.yt.getCurrentTime()||0;SED.ytAt=performance.now()}catch(e){}}
function sedStatus(msg){const s=sedEl('sedStatus');if(s){s.textContent=msg;s.hidden=!msg}}
/** a cada 50 ms: relê o vídeo, atualiza o relógio e, na conferência, a palavra da vez */
function sedTick(){
 if(modal.kind!=='songedit'){songEdClose();return}
 sedRead();const tm=sedEl('sedTime');if(tm)tm.textContent=sedNow().toFixed(2)+' s';
 if(SED.phase==='sync'&&SED.fit){const F=SED.fit,ph=((sedNow()-F.off)/F.p%1+1)%1,pl=sedEl('sedPulse');if(pl)pl.style.transform=`scale(${(1+.28*Math.pow(1-ph,4)).toFixed(3)})`} // 🥁 o círculo bate na batida calculada: dá para conferir de ouvido
 if(SED.phase==='check'){const now=sedNow();let i=-1;for(let k=0;k<SED.marks.length;k++)if(SED.marks[k].t+SED.shift<=now)i=k;else break;
  if(i!==SED.ci){SED.ci=i;const w=sedEl('sedBig');if(w){w.textContent=i>=0?SED.marks[i].w.toUpperCase():'…';w.classList.remove('pop');void w.offsetWidth;w.classList.add('pop')}if(i>=0)snd(1320,.05,'triangle',.03)}}
}
/** atualiza só as partes que mudam (fase, contador, próxima palavra, revisão) — o iframe fica intacto */
function sedSync(){
 const box=sedEl('sedBox');if(!box)return;box.dataset.phase=SED.phase;
 const n=SED.marks.length,N=SED.words.length,cnt=sedEl('sedCount');if(cnt)cnt.textContent=n+' / '+N;
 const nx=sedEl('sedNext');if(nx)nx.textContent=n<N?SED.words[n].toUpperCase():'✓';
 const q=sedEl('sedQueue');if(q)q.textContent=SED.words.slice(n+1,n+6).join(' · ');
 const g=sedEl('sedGo');if(g)g.disabled=!SED.ready;
 const sh=sedEl('sedShift');if(sh)sh.textContent=(SED.shift>=0?'+':'')+SED.shift.toFixed(2)+' s';
 const list=sedEl('sedList');if(list)list.innerHTML=SED.marks.map(m=>`<li><b>${(m.t+SED.shift).toFixed(2)}</b> ${esc(m.w)}</li>`).join('')||`<li>${t('song.ed.empty')}</li>`;
}
function sedRec(){
 if(!SED.ready)return;const ta=sedEl('sedWords'),txt=ta?ta.value:'',lc=sedEl('sedLines');
 // 🎤 LRC colado (com [mm:ss]) → já vem sincronizado: vai direto para a revisão (modo frase)
 if(/\[\d{1,2}:\d{1,2}|-->|^\s*\d{1,2}:\d{2}\b/m.test(txt)){const L=parseTimedText(txt);if(L.length){SED.lines=true;SED.words=L.map(x=>x.text);SED.marks=L.map(x=>({t:x.t,w:x.text}));SED.shift=0;SED.phase='review';sedStatus('');sedSync();return}}
 SED.lines=!!(lc&&lc.checked); // modo frase: uma frase por linha, ESPAÇO marca o início de cada frase
 SED.words=SED.lines?txt.split(/\r?\n/).map(s=>s.trim()).filter(s=>lyricWords(s).length):sedWords(txt);
 if(!SED.words.length){sedStatus(t('song.ed.noWords'));return}
 SED.marks=[];SED.shift=0;SED.phase='rec';sedStatus('');
 try{SED.yt.seekTo(0,true);SED.yt.playVideo()}catch(e){}
 sedSync();snd(880,.08,'triangle',.04);
}
function sedMark(){
 if(SED.phase!=='rec'||!SED.playing)return;const n=SED.marks.length;if(n>=SED.words.length)return;
 SED.marks.push({t:Math.max(0,+sedNow().toFixed(3)),w:SED.words[n]});
 const b=sedEl('sedTap');if(b){b.classList.remove('hit');void b.offsetWidth;b.classList.add('hit')}
 letterNote(n%8+1);sedSync();
 if(SED.marks.length>=SED.words.length)setTimeout(sedStop,350); // última palavra marcada → revisão
}
function sedUndo(){if(SED.phase!=='rec'||!SED.marks.length)return;SED.marks.pop();sedSync();snd(330,.06,'triangle',.03)}
function sedStop(){try{SED.yt&&SED.yt.pauseVideo()}catch(e){}SED.phase=SED.words.length||SED.marks.length?'review':'setup';sedSync()}
function sedNudge(d){SED.shift=Math.round((SED.shift+d)*100)/100;sedSync()}
function sedCheck(){if(!SED.ready||!SED.marks.length)return;SED.phase='check';SED.ci=-1;const w=sedEl('sedBig');if(w)w.textContent='…';try{SED.yt.seekTo(Math.max(0,SED.marks[0].t+SED.shift-2),true);SED.yt.playVideo()}catch(e){}sedSync()}
function sedRedo(){try{SED.yt&&SED.yt.pauseVideo()}catch(e){}SED.phase='setup';SED.marks=[];sedSync()}
/** grava o mapa na faixa (com o ajuste fino aplicado) */
function sedSave(play){
 const tr=SED.tr;if(!tr||!SED.marks.length)return;
 const marks=SED.marks.map(m=>({t:Math.max(0,+(m.t+SED.shift).toFixed(3)),w:m.w})).sort((a,b)=>a.t-b.t);
 const patch=SED.lines?{lines:marks.map(m=>({t:m.t,text:m.w})),chart:[]}:{chart:marks,lines:[]}; // frases (letra) OU palavras soltas
 const list=Rhythm.custom().map(x=>x.id===tr.id?Object.assign({},x,patch):x);Rhythm.saveCustom(list);
 snd(988,.1,'triangle',.05);const id=tr.id;songEdClose();
 if(play)Rhythm.pick(id);else openModal('songs');
}
function songEdClose(){clearInterval(SED.timer);SED.timer=0;if(SED.yt){try{SED.yt.destroy()}catch(e){}SED.yt=null}SED.ready=false;SED.playing=false;SED.tr=null}
function tabSongEdit(){
 const tr=SED.tr;if(!tr)return'';const hasL=tr.lines&&tr.lines.length,pre=hasL?tr.lines.map(n=>n.text).join('\n'):tr.chart&&tr.chart.length?tr.chart.map(n=>n.w).join(' '):'';
 return`<div class="sed" id="sedBox" data-phase="${SED.phase}">
  <div class="sedhead"><b>📺 ${esc(tr.title)}</b><span id="sedTime">0.00 s</span></div>
  <div class="sedvid"><div id="ytEdit"></div><p class="sedbig" id="sedBig"></p></div>
  <p class="songwarn" id="sedStatus" hidden></p>
  <div class="sedp setup"><p class="msub">${t('song.ed.help')}</p>
   <label class="sedmode"><input type="checkbox" id="sedLines"${hasL||!pre?' checked':''}> 🎤 ${t('song.ed.linesMode')}</label>
   <textarea id="sedWords" rows="6" placeholder="${esc(t('song.ed.phLines'))}">${esc(pre)}</textarea>
   <label class="songfile">📂 ${t('song.quick.file')}<input type="file" accept=".srt,.vtt,.lrc,.txt,text/plain" onchange="songLoadFile(this,'sedWords')"></label>
   <div class="sedbtns"><button class="btn" id="sedGo" onclick="sedRec()" disabled>🎙️ ${t('song.ed.rec')}</button><button class="pact" onclick="sedBeatStart()">🥁 ${t('song.sync.btn')}</button><button class="pact" onclick="openModal('songs')">↩ ${t('song.ed.back')}</button></div></div>
  <div class="sedp rec"><div class="sednext"><small>${t('song.ed.next')}</small><b id="sedNext"></b><span id="sedQueue"></span></div>
   <button class="sedtap" id="sedTap" onpointerdown="event.preventDefault();sedMark()">${t('song.ed.tap')} <kbd>${t('song.ed.space')}</kbd></button>
   <div class="sedbtns"><span id="sedCount"></span><button class="pact" onclick="sedUndo()">↶ ${t('song.ed.undo')} <kbd>⌫</kbd></button><button class="pact" onclick="sedStop()">⏹ ${t('song.ed.stop')} <kbd>ESC</kbd></button></div></div>
  <div class="sedp review"><div class="sedbtns"><span>${t('song.ed.shift')} <b id="sedShift"></b></span><button class="pact" onclick="sedNudge(-.05)">−0,05</button><button class="pact" onclick="sedNudge(.05)">+0,05</button><button class="pact" onclick="sedCheck()">▶ ${t('song.ed.check')}</button></div>
   <ol class="sedlist" id="sedList"></ol>
   <div class="sedbtns"><button class="btn" onclick="sedSave(false)">💾 ${t('song.ed.save')}</button><button class="btn" onclick="sedSave(true)">▶ ${t('song.ed.saveplay')}</button><button class="pact" onclick="sedRedo()">🎙️ ${t('song.ed.redo')}</button></div></div>
  <div class="sedp sync"><p class="msub">${t('song.sync.help')}</p>
   <div class="sedbeat"><button class="sedpulse" id="sedPulse" onpointerdown="event.preventDefault();sedBeatTap()"><b id="sedBpm">— BPM</b><small id="sedTaps">0 ${t('song.sync.taps')}</small></button>
    <div class="sedbinfo"><span>${t('song.sync.first')} <b id="sedOff">—</b></span><span>${t('song.sync.quality')} <b id="sedQ">—</b></span></div></div>
   <div class="sedbtns"><button class="btn" id="sedBSave" onclick="sedBeatSave(false)" disabled>💾 ${t('song.sync.save')}</button><button class="btn" id="sedBPlay" onclick="sedBeatSave(true)" disabled>▶ ${t('song.ed.saveplay')}</button>
    <button class="pact" onclick="sedBeatUndo()">↶ <kbd>⌫</kbd></button><button class="pact" onclick="sedBeatStart()">↺ ${t('song.sync.restart')}</button><button class="pact" onclick="sedBeatStop()">⏹ <kbd>ESC</kbd></button></div></div>
  <div class="sedp check"><p class="msub">${t('song.ed.checking')}</p><div class="sedbtns"><button class="pact" onclick="sedStop()">⏹ ${t('song.ed.stop')} <kbd>ESC</kbd></button></div></div>
 </div>`;
}
// teclas do gravador: capturadas ANTES do jogo (ESPAÇO/ENTER não abrem a partida, ESC não fecha o modal no meio da gravação)
addEventListener('keydown',ev=>{
 if(modal.kind!=='songedit'||(SED.phase!=='rec'&&SED.phase!=='check'&&SED.phase!=='sync'))return;
 const k=ev.key;let used=true;
 if(SED.phase==='sync'){if(k===' '||k==='Enter'){if(!ev.repeat)sedBeatTap()}else if(k==='Backspace')sedBeatUndo();else if(k==='Escape')sedBeatStop();else used=false;
  if(used){ev.preventDefault();ev.stopImmediatePropagation()}return}
 if(SED.phase==='rec'&&(k===' '||k==='Enter')){if(!ev.repeat)sedMark()}
 else if(SED.phase==='rec'&&k==='Backspace')sedUndo();
 else if(k==='Escape')sedStop();
 else used=false;
 if(used){ev.preventDefault();ev.stopImmediatePropagation()}
},true);
// =====================================================================================================
// ☄️ Asteroide do Bardo (modo frase): rocha grande pintada UMA vez por variante+tamanho (cache), com crateras,
//  veios luminosos e contraluz. Variantes: Lunar (violeta), Brasa (laranja), Geada (azul) · Refrão = Dourado.
// =====================================================================================================
const LYRIC_VAR=[
 {id:'lunar',body:['#8a84b8','#3a3560','#16142e'],vein:'#c9a6ff',glow:'#c9a6ff'},
 {id:'ember',body:['#c07a5a','#5a2a1e','#1e0c0a'],vein:'#ffb05a',glow:'#ff8a3a'},
 {id:'frost',body:['#8ab8d8','#2e4e6e','#0c1a2e'],vein:'#a8ecff',glow:'#7ad0ff'}
];
const LYRIC_GOLD={id:'gold',body:['#ffe9a8','#a8762a','#3a2408'],vein:'#fff6d0',glow:'#ffe9a8'};
const _lyrSpr=new Map();
function lyricSprite(e){
 const L=e.lyric,V=L.chorus?LYRIC_GOLD:LYRIC_VAR[L.vi],r=Math.round(e.r),key=V.id+'|'+r;let s=_lyrSpr.get(key);if(s)return s;
 const S=r*2+16;s=mkCanvas(S,S);const c=s.getContext('2d'),cx=S/2,cy=S/2,R=rng(r*31+V.id.length*7);
 const pts=[];for(let i=0;i<18;i++){const a=i/18*6.283,k=.86+R()*.16;pts.push([cx+Math.cos(a)*r*k,cy+Math.sin(a)*r*k])}
 const path=()=>{c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath()};
 let g=c.createRadialGradient(cx-r*.35,cy-r*.4,r*.1,cx,cy,r*1.05);g.addColorStop(0,V.body[0]);g.addColorStop(.55,V.body[1]);g.addColorStop(1,V.body[2]);
 path();c.fillStyle=g;c.fill();
 c.save();path();c.clip();
 for(let i=0;i<7;i++){const a=R()*6.283,d=R()*r*.62,x=cx+Math.cos(a)*d,y=cy+Math.sin(a)*d,cr=r*(.1+R()*.16); // crateras: fundo escuro + borda iluminada em cima
  c.fillStyle='rgba(0,0,10,.35)';c.beginPath();c.arc(x,y,cr,0,6.283);c.fill();c.strokeStyle='rgba(255,255,255,.18)';c.lineWidth=1.2;c.beginPath();c.arc(x,y,cr,3.6,5.8);c.stroke()}
 c.strokeStyle=V.vein;c.globalAlpha=.75;c.lineWidth=1.6;c.lineCap='round'; // veios mágicos
 for(let i=0;i<3;i++){let x=cx+(R()-.5)*r,y=cy+(R()-.5)*r;c.beginPath();c.moveTo(x,y);for(let k=0;k<4;k++){x+=(R()-.5)*r*.5;y+=(R()-.5)*r*.5;c.lineTo(x,y)}c.stroke()}
 c.globalAlpha=1;g=c.createLinearGradient(cx-r,cy-r,cx+r,cy+r);g.addColorStop(0,'rgba(255,255,255,.22)');g.addColorStop(.4,'rgba(255,255,255,0)');g.addColorStop(1,'rgba(0,0,20,.45)');c.fillStyle=g;c.fillRect(0,0,S,S);
 c.restore();
 path();c.strokeStyle='rgba(10,6,24,.7)';c.lineWidth=1.6;c.stroke();
 c.globalCompositeOperation='lighter';c.strokeStyle=V.vein;c.globalAlpha=.45;c.lineWidth=2;c.beginPath();c.arc(cx,cy,r*.94,3.4,5.2);c.stroke(); // contraluz
 c.fillStyle='#fff';c.globalAlpha=.9;c.font='900 '+Math.round(r*.5)+'px Nunito';c.textAlign='center';c.textBaseline='middle';c.fillText(L.chorus?'★':'♪',cx,cy+1); // marca do bardo
 _lyrSpr.set(key,s);return s;
}
/** legenda da frase sob o asteroide: lidas (dourado apagado) · palavra atual (parte digitada em dourado, sublinhada) · próximas (cinza).
 *  Quebra em até 3 linhas; larguras das palavras medidas 1× por frase (cache em e.lyric._w). */
function drawLyricLabel(c,e,ex,ey,isT){
 const L=e.lyric,s=LBL.s,fs=Math.round(15*s),font='800 '+fs+'px Nunito, sans-serif',gap=7*s,maxW=Math.min(W-24,420*s);
 c.font=font;if(!L._w||L._fs!==fs){L._fs=fs;L._up=L.words.map(w=>w.toUpperCase());L._w=L._up.map(w=>c.measureText(w).width)}
 const rows=[[]];let rw=0;for(let i=0;i<L._up.length;i++){const w=L._w[i];if(rw&&rw+gap+w>maxW){rows.push([]);rw=0}rows[rows.length-1].push(i);rw+=(rw?gap:0)+w}
 const lh=fs*1.35,bw=Math.min(maxW,Math.max(...rows.map(r=>r.reduce((a,i,j)=>a+L._w[i]+(j?gap:0),0))))+20*s,bh=rows.length*lh+12*s;
 const bx=Math.max(4,Math.min(W-4-bw,ex-bw/2)),by=Math.max(118,Math.min(H-bh-6,ey+e.r+14*s));
 c.fillStyle=isT?'rgba(22,16,54,.94)':'rgba(8,8,28,.88)';c.strokeStyle=L.chorus?'#ffe9a8':isT?'#ffd98a':'rgba(201,166,255,.6)';c.lineWidth=(isT?2:1.4)*s;
 c.beginPath();c.roundRect(bx,by,bw,bh,9*s);c.fill();c.stroke();
 c.textBaseline='alphabetic';
 if(L.all&&L.words.length<L.all.length){ // 🎚️ Fácil: a frase inteira fica de apoio (pequena, apagada) e só as palavras-chave são digitadas
  if(!L._ctx||L._fs2!==fs){L._fs2=fs;c.font='italic 700 '+Math.round(11*s)+'px Nunito, sans-serif';let ctx=L.text;while(ctx.length>6&&c.measureText(ctx).width>bw-12*s)ctx=ctx.slice(0,-2);L._ctx=ctx===L.text?ctx:ctx+'…'}
  c.font='italic 700 '+Math.round(11*s)+'px Nunito, sans-serif';c.textAlign='center';c.fillStyle='rgba(233,216,188,.55)';c.fillText(L._ctx,bx+bw/2,by-5*s);c.textAlign='left';c.font=font}
 for(let ri=0;ri<rows.length;ri++){const row=rows[ri],tw=row.reduce((a,i,j)=>a+L._w[i]+(j?gap:0),0);let x=bx+(bw-tw)/2;const y=by+6*s+lh*(ri+1)-lh*.28;
  for(const i of row){const up=L._up[i];
   if(i<e.pi){c.fillStyle='rgba(255,217,138,.45)';c.fillText(up,x,y)}
   else if(i===e.pi){const a=up.slice(0,e.typed),b=up.slice(e.typed),aw=e.typed?c.measureText(a).width:0;
    if(a){c.fillStyle='#ffd98a';c.fillText(a,x,y)}c.fillStyle='#ffffff';c.fillText(b,x+aw,y);
    c.fillStyle=isT?'#ffd98a':'rgba(255,255,255,.55)';c.fillRect(x,y+3*s,L._w[i],2*s)}
   else{c.fillStyle='rgba(198,205,232,.62)';c.fillText(up,x,y)}
   x+=L._w[i]+gap}}
}

// =====================================================================================================
// 🔊 A música é a estrela: no modo música os efeitos do jogo ficam baixinhos (sfxLevel × SONG_SFX) e o volume da
//  faixa reage à digitação — acerto mantém (ou devolve aos poucos) o volume cheio; erro abaixa um pouco; a torre
//  atingida abaixa mais. Suavizado no tick (60 Hz) e aplicado no player só quando muda ≥ 2 pontos (setVolume é barato).
// =====================================================================================================
const SONG_SFX=.22,MOOD={miss:.72,hit:.5,missHold:.9,hitHold:1.6};
Object.assign(Rhythm,{
 mood:1,moodT:1,moodHold:0,lastVol:-1,
 onHit(){if(this.moodHold<=0)this.moodT=1},
 onMiss(){this.moodT=Math.min(this.moodT,MOOD.miss);this.moodHold=MOOD.missHold},
 onTowerHit(){this.moodT=MOOD.hit;this.moodHold=MOOD.hitHold},
 mix(dt){
  if(!this.track)return;this.moodHold=Math.max(0,this.moodHold-dt);if(this.moodHold<=0&&this.moodT<1)this.moodT=Math.min(1,this.moodT+dt*.35); // volta sozinho ao normal
  this.mood+=(this.moodT-this.mood)*Math.min(1,dt*(this.moodT<this.mood?9:2.2)); // cai rápido, sobe devagar
  const base=typeof MUS!=='undefined'?MUS.vol:.7;
  if(this.track.src==='drum'){if(DRUM.out&&AC)DRUM.out.gain.setTargetAtTime(.9*base*this.mood,AC.currentTime,.05);return}
  const v=Math.round(100*base*this.mood);if(this.yt&&Math.abs(v-this.lastVol)>=2){this.lastVol=v;try{this.yt.setVolume(v)}catch(e){}}
 }
});
// =====================================================================================================
// 🥁 Sincronizar batida (fase 'sync' do editor): o jogador bate ESPAÇO (ou toca o círculo) junto com a música.
//  beatFit: período inicial = mediana dos intervalos; cada toque recebe o nº do tempo (arredondado) e uma regressão linear
//  t = off + n·p acha BPM e fase. Toques fora do compasso (resíduo > 40% do tempo) são ignorados; BPM levado para 70–180
//  (quem bateu em meio-tempo/dobro). off = 1º tempo ≥ 0 da música. Qualidade = desvio médio dos toques em ms.
// =====================================================================================================
function beatFit(ts){
 if(ts.length<4)return null;
 const d=[];for(let i=1;i<ts.length;i++){const x=ts[i]-ts[i-1];if(x>.25&&x<1.6)d.push(x)}if(d.length<3)return null;
 d.sort((a,b)=>a-b);let p=d[d.length>>1];
 for(let it=0;it<3;it++){ // refina: índices → regressão → descarta os toques muito fora
  const pts=ts.map(t=>({t,n:Math.round((t-ts[0])/p)})).filter(o=>Math.abs((o.t-ts[0])-o.n*p)<p*.4);if(pts.length<4)break;
  const N=pts.length,sx=pts.reduce((a,o)=>a+o.n,0),sy=pts.reduce((a,o)=>a+o.t,0),sxx=pts.reduce((a,o)=>a+o.n*o.n,0),sxy=pts.reduce((a,o)=>a+o.n*o.t,0);
  const b=(N*sxy-sx*sy)/Math.max(1e-9,N*sxx-sx*sx),a=(sy-b*sx)/N;if(b>.2&&b<1.8)p=b;
  if(it===2||pts.length===ts.length){const err=pts.reduce((s,o)=>s+Math.abs(o.t-(a+o.n*p)),0)/N;let P=p;while(60/P<70)P/=2;while(60/P>180)P*=2;
   const ssr=pts.reduce((s,o)=>s+(o.t-(a+o.n*b))**2,0),mn=sx/N,sn=pts.reduce((s,o)=>s+(o.n-mn)**2,0),seB=N>2&&sn>0?Math.sqrt(ssr/(N-2)/sn):1;
   const drift=+(seB*180/b).toFixed(2); // incerteza do período × nº de tempos em 3 min = quanto a grade pode escorregar até o fim da música
   const off=((a%P)+P)%P;return{p:P,bpm:Math.round(60/P*100)/100,off:+off.toFixed(3),err:Math.round(err*1000),n:N,drift}}
 }
 return null;
}
function sedBeatStart(){
 if(!SED.ready){SED.want='sync';return}SED.want='';SED.taps=[];SED.fit=null;SED.phase='sync';sedStatus('');
 try{SED.yt.seekTo(0,true);SED.yt.playVideo()}catch(e){}sedSync();sedBeatUI();snd(880,.08,'triangle',.04);
}
function sedBeatTap(){
 if(SED.phase!=='sync'||!SED.playing)return;SED.taps.push(+sedNow().toFixed(3));SED.fit=beatFit(SED.taps);
 const pl=sedEl('sedPulse');if(pl){pl.classList.remove('hit');void pl.offsetWidth;pl.classList.add('hit')}sedBeatUI();
}
function sedBeatUndo(){if(SED.phase!=='sync'||!SED.taps.length)return;SED.taps.pop();SED.fit=beatFit(SED.taps);sedBeatUI()}
function sedBeatStop(){try{SED.yt&&SED.yt.pauseVideo()}catch(e){}if(SED.phase==='sync'&&!SED.fit){SED.phase='setup';sedSync()}else sedBeatUI()}
function sedBeatUI(){
 const MIN=16,F=SED.fit,ok=F&&SED.taps.length>=MIN,set=(id,v)=>{const e=sedEl(id);if(e)e.textContent=v};
 set('sedBpm',F?F.bpm.toFixed(1)+' BPM':'— BPM');set('sedTaps',SED.taps.length+' '+t('song.sync.taps')+(SED.taps.length<MIN?' · '+t('song.sync.need',{n:MIN-SED.taps.length}):''));
 set('sedOff',F?F.off.toFixed(2)+' s':'—');
 set('sedQ',F?(F.drift<=.15?'✨ ':F.drift<=.4?'👍 ':'⚠️ ')+t('song.sync.drift',{s:F.drift.toFixed(2)})+' · '+F.err+' ms':'—'); // deriva em 3 min: quanto mais toques espalhados, menor
 for(const id of['sedBSave','sedBPlay']){const b=sedEl(id);if(b)b.disabled=!ok}
}
/** grava BPM + 1º tempo na faixa (synced): o modo automático passa a seguir a batida real; com letra/mapa vale para o pulso */
function sedBeatSave(play){
 const tr=SED.tr,F=SED.fit;if(!tr||!F||SED.taps.length<16)return;
 const list=Rhythm.custom().map(x=>x.id===tr.id?Object.assign({},x,{bpm:F.bpm,offset:F.off,synced:true}):x);Rhythm.saveCustom(list);
 snd(988,.1,'triangle',.05);const id=tr.id;songEdClose();if(play)Rhythm.pick(id);else openModal('songs');
}
// =====================================================================================================
// 📺 Anúncio / carregamento no meio do vídeo: o YouTube para o tempo do vídeo (getCurrentTime não anda) mas o jogo
//  continuaria → inimigos derrubariam a torre sem música. stallCheck (chamado no topo do update) lê o player 5×/s:
//  se o tempo do vídeo ficou parado > 0,6 s sem ser pausa nossa, a partida ESPERA (mundo congelado, aviso no HUD);
//  quando o vídeo volta a andar, o relógio é realinhado ao vídeo e tudo continua do mesmo ponto.
// =====================================================================================================
Object.assign(Rhythm,{
 stalled:false,lastY:-1,lastAdv:0,stRead:0,
 stallCheck(){
  if(!this.track||this.track.src!=='yt'||!this.yt||this.paused||!this.playing){if(this.stalled)songDockAd(false);return this.stalled=false}
  const was=this.stalled;
  const now=performance.now();
  if(now-this.stRead>150){this.stRead=now;try{const y=this.yt.getCurrentTime()||0;this.ytState=this.yt.getPlayerState();if(Math.abs(y-this.lastY)>.01||this.lastY<0){this.lastY=y;this.lastAdv=now;if(this.stalled){this.t=y;this.ytRead=now}}}catch(e){}}
  const notPlaying=typeof YT!=='undefined'&&this.ytState!=null&&this.ytState!==YT.PlayerState.PLAYING&&this.ytState!==YT.PlayerState.ENDED; // carregando/pausado pelo player: espera na hora
  const st=(notPlaying||now-this.lastAdv>1600)&&!this.ended; // 1,6 s: no iPhone o tempo do vídeo só anda ~1×/s (antes 0,4 s → "anúncio" falso, partida congelada)
  if(st)this.rt=now; // relógio não acumula enquanto espera
  if(st!==was){songDockAd(st);if(!st)songRefocus()}
  return this.stalled=st;
 }
});
/** 📂 abre um .srt/.vtt/.lrc/.txt do computador e joga o texto no campo (o arquivo nunca sai do navegador) */
function songLoadFile(inp,target){
 const f=inp.files&&inp.files[0];if(!f)return;if(f.size>2e6){inp.value='';return}
 const r=new FileReader();r.onload=()=>{const ta=document.getElementById(target);if(ta){ta.value=String(r.result||'');const n=parseTimedText(ta.value).length;
  const box=ta.closest('details');if(box)box.open=true;snd(n?880:220,.08,'triangle',.04);ta.title=n?t('song.quick.found',{n}):''}};r.readAsText(f);
}
/** grava a URL do servidor de legendas (só neste navegador) e libera nova busca para as faixas que ainda não têm frases */
function songSetCapApi(v){
 v=String(v||'').trim();if(v&&!/^https:\/\/[\w.-]+(\/[\w./-]*)?$/.test(v)){songFormErr=t('song.cap.badUrl');renderModal();return}
 store.set('captionsApi',v);songFormErr='';Rhythm.saveCustom(Rhythm.custom().map(x=>x.lines&&x.lines.length?x:Object.assign({},x,{capTried:0})));renderModal();snd(880,.08,'triangle',.04);
}
/** 🎚️ dificuldade do modo frase (salva no navegador; vale a partir da próxima música) */
function songSetDiff(d){if(!SONG_DIFF[d])return;store.set('songDiff',d);renderModal();snd(d==='easy'?660:d==='normal'?784:988,.06,'triangle',.04)}
/** corta o texto com "…" para caber em maxW (na fonte atual do contexto); cache por texto+largura+fonte */
const _fit=new Map();
function fitTxt(c,s,maxW){
 const k=c.font+'|'+maxW+'|'+s;let r=_fit.get(k);if(r!==undefined)return r;
 r=s;if(c.measureText(r).width>maxW){while(r.length>1&&c.measureText(r+'…').width>maxW)r=r.slice(0,-1);r=r.trimEnd()+'…'}
 if(_fit.size>300)_fit.clear();_fit.set(k,r);return r;
}

// =====================================================================================================
// 🎵 Painel da música (lado direito, só durante uma partida do Ritmo do Bardo): no lugar de personagens/magias/bestiário
//  ficam o vídeo (espelho dourado, largura total do painel), a letra em modo karaokê (frase da vez acesa, já cantadas
//  apagadas, próximas em fila), o progresso e os números ao vivo. Atualizado 4×/s no DOM (só texto/classe que mudou).
// =====================================================================================================
const songSideOn=()=>document.body.classList.contains('song-mode')&&!!document.getElementById('songSide')&&getComputedStyle(document.getElementById('rightPanel')).display!=='none';
const SS={el:null,last:'',lastI:-2,t:0};
function songSideBuild(){
 let el=document.getElementById('songSide');
 if(!el){const rp=document.getElementById('rightPanel');if(!rp)return null;el=document.createElement('section');el.id='songSide';el.className='songside';
  el.innerHTML=`<div class="ssvid" id="songDockSlot"></div>
   <div class="ssstats"><div><b id="ssWpm">0</b><small>WPM</small></div><div><b id="ssAcc">100%</b><small>${t('hud.precision')}</small></div><div><b id="ssPerf">0</b><small>✨ ${t('song.j.perfect')}</small></div><div><b id="ssGreat">0</b><small>💫 ${t('song.j.great')}</small></div></div>
   <div class="ssprog"><span id="ssClock">0:00</span><div class="ssbar"><i id="ssBar"></i></div><span id="ssLines"></span></div>
   <div class="sslyr" id="ssLyr"></div>
   <div class="ssfoot"><span id="ssDiff"></span><button class="pact" onclick="pause()">⏸ ${t('ui.pause')}</button></div>`;
  rp.appendChild(el)}
 SS.el=el;return el;
}
function songSideShow(on){
 document.body.classList.toggle('song-mode',!!on);
 if(on){songSideBuild();SS.lastI=-2;SS.last='';songSideUpdate(true)}
 songDockPlace();
}
function songSideUpdate(force){
 const R=Rhythm;if(!SS.el||!R.track||!G||!G.song)return;const now=performance.now();if(!force&&now-SS.t<250)return;SS.t=now;
 const set=(id,v)=>{const e=document.getElementById(id);if(e&&e.textContent!==String(v))e.textContent=v};
 const T0=R.now(),mm=s=>Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');
 set('ssWpm',calcWpm());set('ssAcc',calcAcc()+'%');set('ssPerf',R.stats.perfect);set('ssGreat',R.stats.great);
 set('ssClock',mm(T0)+' / '+mm(R.dur));const b=document.getElementById('ssBar');if(b)b.style.width=Math.min(100,T0/Math.max(1,R.dur)*100).toFixed(1)+'%';
 set('ssDiff',R.hasLyrics?'🎚️ '+t('song.diff.'+(R.diff||'normal')):'🥁 '+(R.track.bpm||'')+' BPM');
 const box=document.getElementById('ssLyr');if(!box)return;
 if(!R.hasLyrics){if(SS.last!=='none'){SS.last='none';box.innerHTML=`<p class="ssnone">${t('song.side.noLyrics')}</p>${R.capNote?`<p class="ssnone">🧊 ${esc(R.capNote)}</p>`:''}`}return} // 🧊 servidor em pausa: diz quando tentar de novo
 // karaokê: frase da vez = a mais antiga ainda na tela (ou, se nenhuma, a próxima a nascer)
 const cur=R.currentLyric(),ci=cur?R.notes.indexOf(cur.lyric):R.ni;set('ssLines',Math.min(R.notes.length,Math.max(0,ci)+1)+' / '+R.notes.length);
 // 🎤 karaokê: a frase da vez se preenche de dourado do início ao fim do canto (a transição de 250 ms deixa o avanço contínuo)
 const kar=()=>{const n=R.notes[ci],k=box.querySelector('.kar');if(!n||!k)return;k.style.setProperty('--k',(Math.max(0,Math.min(1,(T0-n.t)/Math.max(.4,n.end-n.t)))*100).toFixed(1)+'%')};
 if(ci===SS.lastI){kar();return}SS.lastI=ci;
 const from=Math.max(0,ci-1),to=Math.min(R.notes.length,ci+5);let h='';
 if(R.lyrFake)h=`<p class="ssfake">🎮 ${t('song.side.gameWords')}${R.capNote?' · 🧊 '+esc(R.capNote):''}</p>`; // 📚 sem a letra: deixa claro que são palavras do jogo
 for(let i=from;i<to;i++){const n=R.notes[i];h+=`<p class="ssl${i<ci?' done':i===ci?' cur':''}${n.chorus?' ch':''}">${i===ci?`<span class="kar">${esc(n.text)}</span>`:esc(n.text)}</p>`}
 box.innerHTML=h;kar();
}document.addEventListener('scroll',e=>{if(e.target&&e.target.id==='rightPanel')songDockPlace()},true); // o vídeo acompanha a rolagem do painel
// 🏷️ nomes das faixas sem tocar o vídeo: oEmbed público do YouTube (CORS liberado, sem chave). Usado na importação da
//  playlist e para consertar faixas salvas só com o id. 4 pedidos por vez; quem já tem nome não é buscado de novo.
async function fetchTitle(vid){
 try{const r=await fetch('https://www.youtube.com/oembed?format=json&url='+encodeURIComponent('https://www.youtube.com/watch?v='+vid));if(!r.ok)return'';const j=await r.json();return String(j.title||'').slice(0,60)}catch(e){return''}
}
let _titleBusy=false;
async function songFillTitles(){
 if(_titleBusy)return;const todo=Rhythm.custom().filter(x=>x.src==='yt'&&(!x.title||x.title===x.vid)).map(x=>x.vid);if(!todo.length)return;
 _titleBusy=true;const got={};let i=0;
 const worker=async()=>{while(i<todo.length){const v=todo[i++];const ti=await fetchTitle(v);if(ti)got[v]=ti}};
 await Promise.all([worker(),worker(),worker(),worker()]);_titleBusy=false;
 if(!Object.keys(got).length)return;
 Rhythm.saveCustom(Rhythm.custom().map(x=>got[x.vid]&&(!x.title||x.title===x.vid)?Object.assign({},x,{title:got[x.vid]}):x));
 if(Rhythm.track&&got[Rhythm.track.vid]&&Rhythm.track.title===Rhythm.track.vid)Rhythm.track.title=got[Rhythm.track.vid];
 if(modalOpen&&modal.kind==='songs')renderModal();
}