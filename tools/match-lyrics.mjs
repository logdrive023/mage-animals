// Mage Animals — tools/match-lyrics.mjs · 🎤 liga cada Música pronta (js/config/song-catalog.js) a uma letra sincronizada do LRCLIB
// (lrclib.net, banco aberto de letras com tempo) e calcula o AJUSTE de sincronia com o VÍDEO: a letra do LRCLIB segue a faixa de
// áudio; o clipe costuma ter abertura/cenas a mais. O alinhamento compara o início de cada linha com os tempos do canto do
// próprio vídeo (o "g" do catálogo, vindo da legenda dele).
// Grava só {id, segs, m} em cada música — NENHUM texto de letra entra no jogo: o navegador do jogador baixa a letra do LRCLIB
// na hora de tocar (youtube-rhythm.js → songLrcLines).
//
//   node tools/match-lyrics.mjs          → só as músicas sem letra ligada
//   node tools/match-lyrics.mjs --all    → refaz todas
//   node tools/match-lyrics.mjs --stats  → só recalcula a dificuldade (lv 1 Fácil · 2 Médio · 3 Difícil, cps, wpl)
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'js', 'config', 'song-catalog.js');
const WIN = 0.45;     // uma linha "bate" com o vídeo se começa a até 0,45 s de uma frase cantada
const MIN_M = 0.45;   // fração mínima de linhas batendo para aceitar a letra
const sleep = ms => new Promise(r => setTimeout(r, ms));

const src = readFileSync(OUT, 'utf8');
const head = src.slice(0, src.indexOf('const SONG_CATALOG='));
const cat = JSON.parse(src.match(/const SONG_CATALOG=(\[[\s\S]*\]);/)[1]);

/** LRC → linhas com letra EM ORDEM DE TEMPO; a linha com vários tempos ("[00:30.00][01:20.00] refrão") vira uma por tempo.
 *  Mesma regra de lrcRows no jogo (youtube-rhythm.js): o índice dos trechos (segs) conta nesta ordem. */
const lrcRows = s => { const out = []; for (const raw of String(s || '').split('\n')) { const h = raw.match(/^((?:\[\d+:\d+(?:\.\d+)?\])+)\s*(.*)$/); if (!h || !/\p{L}/u.test(h[2])) continue; for (const m of h[1].matchAll(/\[(\d+):(\d+(?:\.\d+)?)\]/g)) out.push({ t: +m[1] * 60 + +m[2], text: h[2] }); } return out.sort((a, b) => a.t - b.t); };
/** só os tempos (o texto é descartado aqui) */
const lrcTimes = s => lrcRows(s).map(x => x.t);
/** distância da frase cantada mais próxima (G em ordem) */
function near(G, x) { let lo = 0, hi = G.length - 1; while (lo < hi) { const md = (lo + hi) >> 1; if (G[md] < x) lo = md + 1; else hi = md; } let d = Math.abs(G[lo] - x); if (lo) d = Math.min(d, Math.abs(G[lo - 1] - x)); return { d, g: Math.abs(G[lo] - x) <= (lo ? Math.abs(G[lo - 1] - x) : 1e9) ? G[lo] : G[lo - 1] }; }
const score = (L, G, o) => { let n = 0; for (const t of L) if (near(G, t + o).d <= WIN) n++; return n; };
/** ajuste global (varre de -20 s a +120 s) e, por linha, a correção local: o clipe pode ter cenas no meio que empurram
 *  só um trecho. Cada linha usa a mediana do desvio das vizinhas que bateram; trechos com o mesmo ajuste viram segmentos. */
function align(L, G) {
  let best = { o: 0, n: -1 };
  for (let o = -20; o <= 120; o += 0.05) { const n = score(L, G, o); if (n > best.n) best = { o, n }; }
  // trechos deslocados: para cada linha, o melhor dos picos secundários na vizinhança (±4 linhas)
  const peaks = [];
  for (let o = -20; o <= 120; o += 0.1) { const n = score(L, G, o); if (n >= Math.max(4, best.n * 0.15)) peaks.push({ o, n }); }
  const offs = L.map((t, i) => {
    const win = L.slice(Math.max(0, i - 4), i + 5);
    let b = { o: best.o, n: win.filter(x => near(G, x + best.o).d <= WIN).length };
    for (const p of peaks) { const n = win.filter(x => near(G, x + p.o).d <= WIN).length; if (n > b.n + 2) b = { o: p.o, n }; }
    return b.o;
  });
  // ajuste fino: mediana do desvio das linhas vizinhas que bateram
  const fine = L.map((t, i) => {
    const ds = [];
    for (let j = Math.max(0, i - 3); j <= Math.min(L.length - 1, i + 3); j++) { const r = near(G, L[j] + offs[j]); if (r.d <= WIN) ds.push(r.g - L[j]); }
    if (!ds.length) return offs[i];
    ds.sort((a, b) => a - b); return ds[ds.length >> 1];
  });
  const segs = [];
  fine.forEach((o, i) => { const v = +o.toFixed(2); if (!segs.length || Math.abs(segs[segs.length - 1][1] - v) > 0.12) segs.push([i, v]); });
  const m = L.filter((t, i) => near(G, t + fine[i]).d <= WIN).length / Math.min(L.length, G.length);
  return { segs, m: +m.toFixed(2), global: +best.o.toFixed(2) };
}
/** 🧭 alinhamento pela música INTEIRA (programação dinâmica): cada linha recebe um ajuste da grade -20…+120 s (passo 0,1);
 *  o custo de uma linha é a distância até o início de fala mais próximo na legenda do vídeo (máx. 3 s; dentro do trecho de
 *  uma fala, máx. 0,4, pois a legenda às vezes junta 2 linhas numa fala), e trocar de ajuste custa SWITCH. Assim o ajuste só
 *  muda quando um trecho inteiro do clipe se desloca (cena no meio), nunca pulando linha a linha. Depois, a linha que cai a
 *  até 0,5 s de um início de fala encosta exatamente nele. */
const SWITCH = 2.5, OMIN = -20, OSTEP = 0.1, ON = 1401;
function spansOf(g) { return g.map(r => ({ a: r[0], b: r[0] + r[1] })).sort((x, y) => x.a - y.a); }
function lineCost(S, x) {
  let lo = 0, hi = S.length - 1; while (lo < hi) { const md = (lo + hi) >> 1; if (S[md].a < x) lo = md + 1; else hi = md; }
  let d = Math.abs(S[lo].a - x), st = S[lo].a; if (lo && Math.abs(S[lo - 1].a - x) < d) { d = Math.abs(S[lo - 1].a - x); st = S[lo - 1].a; }
  const inside = (lo && x >= S[lo - 1].a - .3 && x <= S[lo - 1].b + .3) || (x >= S[lo].a - .3 && x <= S[lo].b + .3);
  return { c: Math.min(3, d <= .35 ? 0 : inside ? Math.min(d, .4) : d), d, st };
}
function alignDP(L, S) {
  const n = L.length; let dp = new Float64Array(ON); const back = [];
  for (let o = 0; o < ON; o++) dp[o] = lineCost(S, L[0] + OMIN + o * OSTEP).c;
  for (let i = 1; i < n; i++) {
    let bi = 0; for (let o = 1; o < ON; o++) if (dp[o] < dp[bi]) bi = o;
    const nd = new Float64Array(ON), bk = new Int16Array(ON);
    for (let o = 0; o < ON; o++) { const stay = dp[o], sw = dp[bi] + SWITCH; nd[o] = Math.min(stay, sw) + lineCost(S, L[i] + OMIN + o * OSTEP).c; bk[o] = stay <= sw ? o : bi; }
    back.push(bk); dp = nd;
  }
  let o = 0; for (let k = 1; k < ON; k++) if (dp[k] < dp[o]) o = k;
  const offs = new Array(n); offs[n - 1] = o; for (let i = n - 1; i > 0; i--) { o = back[i - 1][o]; offs[i - 1] = o; }
  const fine = offs.map((k, i) => { const off = OMIN + k * OSTEP, r = lineCost(S, L[i] + off); return r.d <= .5 ? r.st - L[i] : off; });
  // ordem e respiro: nenhuma linha antes da anterior, e o intervalo entre duas linhas nunca encolhe abaixo de 70% do
  //  original (mín. 0,35 s, máx. 1,2 s) — encostar no início da fala não pode juntar duas frases nem trocar a ordem
  for (let i = 1; i < n; i++) { const g0 = L[i] - L[i - 1], minG = Math.max(.35, Math.min(g0 * .7, 1.2)), prev = L[i - 1] + fine[i - 1]; if (L[i] + fine[i] < prev + minG) fine[i] = prev + minG - L[i]; }
  const segs = []; fine.forEach((f, i) => { const v = +f.toFixed(2); if (!segs.length || Math.abs(segs[segs.length - 1][1] - v) > 0.12) segs.push([i, v]); });
  return segs;
}
/** nota de sincronia (a mesma do tools/backtest-sync.mjs): fração das linhas a até 0,5 s de um início de fala, contando como
 *  certa a linha que cai no mesmo trecho de fala da anterior */
function syncScore(L, segs, S) {
  // tempos como o JOGO monta (songLrcLines): ajuste do trecho + regra de ordem e respiro; empurrada > 0,5 s conta como errada
  let si = 0, p0 = -1, p1 = -1; const T = [], bad = new Set();
  L.forEach((t, i) => {
    while (si + 1 < segs.length && segs[si + 1][0] <= i) si++; let x = t + segs[si][1];
    if (p0 >= 0) { const xx = Math.max(x, p1 + Math.max(.35, Math.min((t - p0) * .7, 1.2))); if (xx - x > .5) bad.add(i); x = xx; }
    p0 = t; p1 = x; T.push(x);
  });
  let ok = 0;
  T.forEach((x, k) => {
    if (bad.has(k)) return;
    const span = S.find(g => x >= g.a - .3 && x <= g.b + .3); if (k && span && T[k - 1] >= span.a - .3 && T[k - 1] < x) { ok++; return; } if (lineCost(S, x).d <= .5) ok++; });
  return ok / T.length;
}
/** "Artista - Música ft. X" → {artist, track} para a busca */
function parts(title) {
  const [a, ...r] = String(title).split(' - ');
  const track = (r.join(' - ') || a).replace(/\s*\((feat|ft)[^)]*\)|\s+(ft\.|feat\.?|featuring)\s.*$/i, '').replace(/\s*\([^)]*\)\s*$/, '').trim();
  return { artist: a.split(/,|&| x /i)[0].trim(), track };
}

/** 🎚️ dificuldade pelas FRASES CANTADAS: para cada linha, letras ÷ (tempo até a próxima linha, máx. 8 s, + 2,5 s de folga)
 *  = letras por segundo que a frase exige; a música vale a média entre a mediana e o 80º percentil (os trechos rápidos pesam).
 *  Também guarda a média de palavras por linha. Só números: o texto é descartado aqui. */
function difficulty(synced) {
  const L = lrcRows(synced).map(x => ({ t: x.t, c: (x.text.match(/\p{L}/gu) || []).length, w: x.text.split(/\s+/).filter(y => /\p{L}/u.test(y)).length }));
  const need = L.map((x, i) => x.c / (Math.min(8, L[i + 1] ? L[i + 1].t - x.t : 4) + 2.5)).sort((a, b) => a - b);
  const q = k => need[Math.min(need.length - 1, Math.floor(need.length * k))];
  return { cps: +((q(.5) + q(.8)) / 2).toFixed(2), wpl: +(L.reduce((a, x) => a + x.w, 0) / Math.max(1, L.length)).toFixed(1) };
}
// limites dos níveis (letras/s): abaixo de LV[0] = Fácil · até LV[1] = Médio · acima = Difícil
const LV = [4.385, 5.1]; // terços das 40 músicas do catálogo inicial (13 · 13 · 14)
const lvOf = cps => cps < LV[0] ? 1 : cps < LV[1] ? 2 : 3;
async function getLrc(id) {
  for (let k = 0; k < 12; k++) { const r = await fetch(`https://lrclib.net/api/get/${id}`); if (r.ok) return r.json(); if (r.status < 500) return null; await sleep(2000); }
  return null;
}

const all = process.argv.includes('--all'), statsOnly = process.argv.includes('--stats');
if (statsOnly) { // node tools/match-lyrics.mjs --stats → recalcula a dificuldade de todas as músicas já ligadas
  for (const s of cat) {
    if (!s.lrc || (s.cps != null && !all)) continue; // --stats --all: recalcula também as que já têm
    const j = await getLrc(s.lrc.id); if (!j) { console.log('✕ sem resposta:', s.title); continue; }
    const d = difficulty(j.syncedLyrics); s.lv = lvOf(d.cps); s.cps = d.cps; s.wpl = d.wpl;
    console.log(`${'·'.repeat(s.lv)} ${s.title} · ${d.cps} letras/s · ${d.wpl} palavras/linha`);
    await sleep(500);
  }
  writeFileSync(OUT, head + `const SONG_CATALOG=[\n${cat.map(x => JSON.stringify(x)).join(',\n')}\n];\n`);
  process.exit(0);
}
const fi = process.argv.indexOf('--from'), FROM = fi > 0 ? JSON.parse(readFileSync(process.argv[fi + 1], 'utf8').match(/const SONG_CATALOG=(\[[\s\S]*\]);/)[1]) : [];
if (process.argv.includes('--realign')) { // node tools/match-lyrics.mjs --realign → refaz o ajuste (alignDP) e fica com o melhor
  for (const s of cat) {
    if (!s.lrc) continue;
    const j = await getLrc(s.lrc.id); if (!j) { console.log('✕ sem resposta:', s.title); continue; }
    const L = lrcTimes(j.syncedLyrics), S = spansOf(s.g);
    // candidatos: o ajuste atual, o de um catálogo antigo (--from arquivo.js) e o novo (alignDP) — fica o de melhor nota
    const cands = [{ k: 'atual', segs: s.lrc.segs }, { k: 'novo', segs: alignDP(L, S) }];
    const old = FROM.find(x => x.vid === s.vid && x.lrc && x.lrc.id === s.lrc.id); if (old) cands.push({ k: 'antigo', segs: old.lrc.segs });
    for (const c of cands) c.sc = syncScore(L, c.segs, S);
    const best = cands.reduce((a, b) => b.sc > a.sc + 0.005 ? b : a);
    s.lrc.segs = best.segs; s.lrc.m = +best.sc.toFixed(2);
    console.log(`${cands.map(c => c.k + ' ' + Math.round(c.sc * 100) + '%').join(' · ')} → ${best.k} · ${s.title}`);
    await sleep(400);
  }
  writeFileSync(OUT, head + `const SONG_CATALOG=[\n${cat.map(x => JSON.stringify(x)).join(',\n')}\n];\n`);
  process.exit(0);
}
for (const s of cat) {
  if (s.lrc && !all) { console.log('= já ligada:', s.title); continue; }
  const { artist, track } = parts(s.title);
  const G = s.g.map(r => r[0]);
  let res = [];
  try {
    const r = await fetch(`https://lrclib.net/api/search?track_name=${encodeURIComponent(track)}&artist_name=${encodeURIComponent(artist)}`, { headers: { 'User-Agent': 'MageAnimals catalog builder (https://logdrive023.github.io/mage-animals/)' } });
    res = r.ok ? await r.json() : [];
    if (!res.length) { const r2 = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(artist + ' ' + track)}`); res = r2.ok ? await r2.json() : []; }
  } catch (e) { res = []; }
  let best = null;
  for (const c of res.filter(x => x.syncedLyrics).slice(0, 10)) {
    const L = lrcTimes(c.syncedLyrics); if (L.length < 8) continue;
    const a = align(L, G);
    // ⌨️ letra em alfabeto latino ganha preferência (o jogador digita num teclado latino; coreano é romanizado no jogo,
    //  outras escritas viram palavras do jogo): +0,15 na nota de sincronia
    const letters = c.syncedLyrics.match(/\p{L}/gu) || [], lat = letters.filter(x => /\p{Script=Latin}/u.test(x)).length / Math.max(1, letters.length);
    const sc = a.m + (lat >= 0.8 ? 0.15 : 0);
    if (!best || sc > best.sc) best = { id: c.id, n: L.length, sc, ...a };
  }
  if (best && best.m >= MIN_M) { s.lrc = { id: best.id, segs: best.segs, m: best.m };
    const d = difficulty((res.find(x => x.id === best.id) || {}).syncedLyrics); s.lv = lvOf(d.cps); s.cps = d.cps; s.wpl = d.wpl; console.log(`✓ ${s.title} · LRCLIB ${best.id} · ${best.n} linhas · ${Math.round(best.m * 100)}% batendo · ajuste ${best.global}s · ${best.segs.length} trecho(s)`); }
  else { delete s.lrc; console.log(`✕ ${s.title} · ${best ? 'melhor só ' + Math.round(best.m * 100) + '% batendo' : 'sem letra sincronizada'} (${artist} / ${track})`); }
  await sleep(700);
}
writeFileSync(OUT, head + `const SONG_CATALOG=[\n${cat.map(x => JSON.stringify(x)).join(',\n')}\n];\n`);
console.log(`\n🎤 ${cat.filter(x => x.lrc).length}/${cat.length} músicas com letra ligada`);
