// Mage Animals — tools/backtest-sync.mjs · 🧪 backtest da sincronia das Músicas prontas.
// Para cada música do catálogo: baixa a letra do LRCLIB, aplica o ajuste do catálogo (lrc.segs) igual ao jogo
// (songLrcLines) e compara o início de cada frase com o início das falas na LEGENDA DO PRÓPRIO VÍDEO (g do catálogo).
// Também confere a jogabilidade no Normal: quantas frases ficam na tela ao mesmo tempo e o WPM que a frase mais apertada exige.
// Só números: nenhum texto de letra é mostrado nem salvo.
//
//   node tools/backtest-sync.mjs            → todas
//   node tools/backtest-sync.mjs Despacito  → só as que têm o texto no nome
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const cat = JSON.parse(readFileSync(join(ROOT, 'js', 'config', 'song-catalog.js'), 'utf8').match(/const SONG_CATALOG=(\[[\s\S]*\]);/)[1]);
const only = process.argv[2] ? process.argv[2].toLowerCase() : '';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const GRACE = 6.5, LEAD = 0.15; // Normal (SONG_DIFF.normal.grace) e SONG_LINE_LEAD do jogo

async function getLrc(id) {
  for (let k = 0; k < 12; k++) { try { const r = await fetch(`https://lrclib.net/api/get/${id}`); if (r.ok) return r.json(); if (r.status < 500) return null; } catch (e) {} await sleep(2000); }
  return null;
}
/** mesmas regras do jogo: só linhas com letra, ajuste do trecho, ordem por tempo, fim = próxima frase (máx. 4,5 s / 8 s) */
function gameLines(synced, segs) {
  const out = []; let i = 0, si = 0, p0 = -1, p1 = -1, inv = 0;
  // linhas em ordem de tempo, uma por marca de tempo (refrão escrito 1 vez com vários tempos) — lrcRows do jogo
  const rows = []; for (const raw of String(synced || '').split('\n')) { const h = raw.match(/^((?:\[\d+:\d+(?:\.\d+)?\])+)\s*(.*)$/); if (!h || !/\p{L}/u.test(h[2])) continue; for (const m of h[1].matchAll(/\[(\d+):(\d+(?:\.\d+)?)\]/g)) rows.push({ t: +m[1] * 60 + +m[2], text: h[2] }); }
  rows.sort((a, b) => a.t - b.t);
  for (const x of rows) {
    while (si + 1 < segs.length && segs[si + 1][0] <= i) si++;
    let t = x.t + segs[si][1];
    if (p0 >= 0) { const tt = Math.max(t, p1 + Math.max(.35, Math.min((x.t - p0) * .7, 1.2))); if (tt - t > .5) inv++; t = tt; } // a mesma regra de ordem e respiro do jogo; empurrada > 0,5 s = ajuste ruim
    p0 = x.t; p1 = t;
    out.push({ t, c: (x.text.match(/\p{L}/gu) || []).length, w: x.text.split(/\s+/).filter(y => /\p{L}/u.test(y)).length }); i++;
  }
  out.inv = inv; // frases que a regra de ordem teve de empurrar mais de 0,5 s (o ajuste salvo as punha antes da anterior)
  out.forEach((L, k) => { const nx = out[k + 1] ? out[k + 1].t : Infinity, own = Math.min(nx, L.t + 4.5); L.end = Math.min(Math.max(L.t + .8, Math.min(own, nx + .05)), L.t + 8); });
  return out;
}
const pct = (a, q) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.min(s.length - 1, Math.floor(s.length * q))] : 0; };

const rows = [];
for (const s of cat) {
  if (only && !s.title.toLowerCase().includes(only)) continue;
  if (!s.lrc) { rows.push({ title: s.title, err: 'sem letra ligada' }); continue; }
  const j = await getLrc(s.lrc.id);
  if (!j) { rows.push({ title: s.title, err: 'LRCLIB sem resposta' }); continue; }
  const L = gameLines(j.syncedLyrics, s.lrc.segs), G = s.g.map(r => r[0]).sort((a, b) => a - b);
  // erro de sincronia. A legenda do vídeo às vezes junta 2 linhas da letra numa fala só: a 1ª linha de cada fala tem de começar
  //  junto com ela (erro = distância até o início) e as seguintes só precisam cair DENTRO do trecho da fala (erro 0 se cair).
  const S = s.g.map(r => ({ a: r[0], b: r[0] + r[1] })).sort((x, y) => x.a - y.a);
  const err = L.map((x, k) => {
    let d = 1e9; for (const g of S) { const v = Math.abs(g.a - x.t); if (v < d) d = v; }
    const inSpan = S.find(g => x.t >= g.a - .3 && x.t <= g.b + .3), prevIn = k && inSpan && L[k - 1].t >= inSpan.a - .3 && L[k - 1].t < x.t;
    return prevIn ? 0 : d;
  });
  const ok = err.filter(d => d <= .5).length / L.length, far = err.filter(d => d > 2).length;
  // jogabilidade (Normal): frase nasce em t-LEAD e chega na torre em max(fim, t + 0,75 s/palavra) + GRACE
  const life = L.map(x => ({ a: x.t - LEAD, b: Math.max(x.end, x.t + x.w * .75) + GRACE, c: x.c }));
  let maxOn = 0; for (const x of life) { const n = life.filter(y => y.a <= x.a && y.b > x.a).length; if (n > maxOn) maxOn = n; }
  const wpm = life.map(x => x.c / 5 / ((x.b - x.a) / 60));
  // falas seguidas muito juntas: menos de 1,2 s entre o início de uma e o da próxima
  const tight = L.filter((x, k) => L[k + 1] && L[k + 1].t - x.t < 1.2).length;
  rows.push({ title: s.title, lv: s.lv, n: L.length, ok: Math.round(ok * 100), med: +pct(err, .5).toFixed(2), p90: +pct(err, .9).toFixed(2), far, maxOn, wpmP90: Math.round(pct(wpm, .9)), wpmMax: Math.round(Math.max(...wpm)), tight, inv: L.inv });
  await sleep(400);
}
console.log('nível | % frases a ≤0,5 s | mediana s | p90 s | >2 s | máx. na tela | WPM p90/máx (Normal) | falas <1,2 s | fora de ordem | música');
for (const r of rows) {
  if (r.err) { console.log(`  ✕  ${r.err} · ${r.title}`); continue; }
  const flag = r.ok < 70 || r.p90 > 1.5 || r.far > 3 || r.inv ? '⚠️' : '✓ ';
  console.log(`${flag} ${'●'.repeat(r.lv || 0).padEnd(3)} | ${String(r.ok).padStart(3)}% | ${r.med.toFixed(2)} | ${r.p90.toFixed(2)} | ${String(r.far).padStart(2)} | ${r.maxOn} | ${String(r.wpmP90).padStart(3)}/${String(r.wpmMax).padStart(3)} | ${String(r.tight).padStart(2)} | ${r.inv} | ${r.title}`);
}
const good = rows.filter(r => !r.err);
console.log(`\nmédia: ${Math.round(good.reduce((a, r) => a + r.ok, 0) / Math.max(1, good.length))}% das frases a até 0,5 s da fala no vídeo · ${good.filter(r => r.ok < 70 || r.p90 > 1.5 || r.far > 3 || r.inv).length} com alerta`);
