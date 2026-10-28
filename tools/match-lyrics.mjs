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

/** "[mm:ss.xx] texto" → tempos das linhas com texto (o texto é descartado aqui) */
const lrcTimes = s => String(s || '').split('\n').map(l => { const m = l.match(/^\[(\d+):(\d+(?:\.\d+)?)\]\s*(.*)$/); return m && /\p{L}/u.test(m[3]) ? +m[1] * 60 + +m[2] : null; }).filter(x => x != null);
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
  const L = String(synced || '').split('\n').map(l => { const m = l.match(/^\[(\d+):(\d+(?:\.\d+)?)\]\s*(.*)$/); return m && /\p{L}/u.test(m[3]) ? { t: +m[1] * 60 + +m[2], c: (m[3].match(/\p{L}/gu) || []).length, w: m[3].split(/\s+/).filter(x => /\p{L}/u.test(x)).length } : null; }).filter(Boolean);
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
    if (!best || a.m > best.m) best = { id: c.id, n: L.length, ...a };
  }
  if (best && best.m >= MIN_M) { s.lrc = { id: best.id, segs: best.segs, m: best.m };
    const d = difficulty((res.find(x => x.id === best.id) || {}).syncedLyrics); s.lv = lvOf(d.cps); s.cps = d.cps; s.wpl = d.wpl; console.log(`✓ ${s.title} · LRCLIB ${best.id} · ${best.n} linhas · ${Math.round(best.m * 100)}% batendo · ajuste ${best.global}s · ${best.segs.length} trecho(s)`); }
  else { delete s.lrc; console.log(`✕ ${s.title} · ${best ? 'melhor só ' + Math.round(best.m * 100) + '% batendo' : 'sem letra sincronizada'} (${artist} / ${track})`); }
  await sleep(700);
}
writeFileSync(OUT, head + `const SONG_CATALOG=[\n${cat.map(x => JSON.stringify(x)).join(',\n')}\n];\n`);
console.log(`\n🎤 ${cat.filter(x => x.lrc).length}/${cat.length} músicas com letra ligada`);
