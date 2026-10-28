// Mage Animals — tools/build-song-catalog.mjs · 📚 gera js/config/song-catalog.js (Músicas prontas do Ritmo do Bardo).
// Roda no SEU computador, uma vez por música nova: busca a legenda de cada vídeo da lista com o mesmo código do Worker
// (tools/captions-worker.js) e guarda SÓ OS TEMPOS de cada frase cantada e quantas palavras ela tem — nenhuma letra é salva.
// No jogo, cada frase vira um Asteroide do Bardo com palavras do vocabulário do jogo, no tempo exato do canto:
// zero pedidos ao servidor de legendas na hora de jogar (só o vídeo, pelo player oficial do YouTube).
//
//   node tools/build-song-catalog.mjs            → busca as músicas da lista que ainda não estão no catálogo
//   node tools/build-song-catalog.mjs --all      → busca todas de novo
//
// Lista: tools/song-catalog-list.json → [{"vid":"id de 11 letras ou link","tag":"pop","title":"opcional"}]. Um pedido a cada 4 s.
// tag: pop · rock · latino · brasil · classic · eletro (os filtros do seletor). Música fora da lista sai do catálogo.
import { readFileSync, writeFileSync, existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LIST = join(ROOT, 'tools', 'song-catalog-list.json');
const OUT = join(ROOT, 'js', 'config', 'song-catalog.js');
const WAIT_MS = 4000;
const MIN_PHRASES = 12; // menos frases que isso = legenda ruim (só "[Música]"), a música fica de fora

// o Worker é um módulo ES com `export default`: uma cópia .mjs no temporário deixa o Node importar o getCaptions dele
const src = readFileSync(join(ROOT, 'tools', 'captions-worker.js'), 'utf8') + '\nexport { getCaptions };\n';
const tmp = join(mkdtempSync(join(tmpdir(), 'mage-cat-')), 'worker.mjs');
writeFileSync(tmp, src);
const { getCaptions } = await import(pathToFileURL(tmp).href);

const idOf = s => { s = String(s || '').trim(); const m = s.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([\w-]{11})/); return m ? m[1] : /^[\w-]{11}$/.test(s) ? s : ''; };
const sleep = ms => new Promise(r => setTimeout(r, ms));

/** catálogo atual (para só buscar as novas) */
function loadCatalog() {
  if (!existsSync(OUT)) return [];
  const m = readFileSync(OUT, 'utf8').match(/const SONG_CATALOG=(\[[\s\S]*\]);/);
  try { return m ? JSON.parse(m[1]) : []; } catch (e) { return []; }
}
/** nome, canal e se o vídeo aceita ser tocado dentro de outro site (oEmbed responde 401 quando o dono proibiu) */
async function meta(vid) {
  const r = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent('https://www.youtube.com/watch?v=' + vid)}`);
  if (!r.ok) return { embed: false, status: r.status };
  const j = await r.json();
  return { embed: true, title: String(j.title || vid).slice(0, 70), artist: String(j.author_name || '').replace(/VEVO$|\s*-\s*Topic$/i, '').trim().slice(0, 40) };
}
/** frases → [[início, duração, nº de palavras, (refrão: índice da 1ª vez que a frase apareceu)]] (sem texto);
 *  marcações de som e frases sem letra saem. O texto só é usado aqui para achar as repetições e é descartado. */
function timings(lines) {
  const out = [], first = new Map();
  for (const L of lines) {
    const words = String(L.text || '').replace(/\[[^\]]*\]|\([^)]*\)|[♪♫]/g, ' ').split(/\s+/).filter(w => /\p{L}/u.test(w));
    if (!words.length) continue;
    const t = +(+L.t).toFixed(2), d = +Math.max(.5, Math.min(8, (+L.end || +L.t + 2) - +L.t)).toFixed(2);
    const key = words.join(' ').toLowerCase().normalize('NFD').replace(/[^\p{L} ]/gu, ''), row = [t, d, Math.min(12, words.length)];
    if (first.has(key)) row.push(first.get(key)); else first.set(key, out.length);
    out.push(row);
  }
  return out;
}

const list = JSON.parse(readFileSync(LIST, 'utf8'));
const all = process.argv.includes('--all');
const cat = all ? [] : loadCatalog();
const have = new Set(cat.map(x => x.vid));
const order = list.map(x => idOf(x.vid)).filter(Boolean);
let first = true;
for (const item of list) {
  const vid = idOf(item.vid);
  if (!vid) { console.log('✕ link inválido:', item.vid); continue; }
  if (have.has(vid)) { console.log('= já no catálogo:', vid); continue; }
  if (!first) await sleep(WAIT_MS);
  first = false;
  const m = await meta(vid);
  if (!m.embed) { console.log(`✕ ${vid}: o vídeo não pode tocar fora do YouTube (oEmbed ${m.status})`); continue; }
  const res = await getCaptions(vid, 'pt');
  if (!res.ok) { console.log(`✕ ${vid} ${m.title}: sem legenda (${res.error}) ${(res.debug || []).join(' ')}`); if (res.error === 'blocked') break; continue; }
  const g = timings(res.lines);
  if (g.length < MIN_PHRASES) { console.log(`✕ ${vid} ${m.title}: só ${g.length} frases`); continue; }
  cat.push({ id: 'cat-' + vid, vid, title: m.title, artist: m.artist, lang: String(res.lang || '').slice(0, 2), kind: res.kind, tag: item.tag || '', g });
  have.add(vid);
  console.log(`✓ ${vid} ${m.title} · ${g.length} frases · ${res.lang} ${res.kind}`);
}
cat.sort((a, b) => order.indexOf(a.vid) - order.indexOf(b.vid));
// nome limpo: sai "(Official Music Video)", "[4K Remaster]", "(Letra/Lyrics)"… e o traço "|" vira "-"
const tidy = s => String(s).replace(/\s*[([][^)\]]*(official|oficial|video|vídeo|clipe|lyric|letra|remaster|4k|m\/v|audio|áudio)[^)\]]*[)\]]/gi, '').replace(/\s*\|\s*/g, ' - ').replace(/\s+/g, ' ').trim();
const named = Object.fromEntries(list.filter(x => x.title).map(x => [idOf(x.vid), x.title])); // "title" na lista = nome escolhido à mão
const kept = cat.filter(x => order.includes(x.vid)).map(x => Object.assign(x, { title: named[x.vid] || tidy(x.title) }));
const body = kept.map(x => JSON.stringify(x)).join(',\n');
writeFileSync(OUT, `// Mage Animals — js/config/song-catalog.js · 📚 Músicas prontas do Ritmo do Bardo (GERADO por tools/build-song-catalog.mjs: não edite à mão).\n` +
  `// Só tempos: g = [[início s, duração s, nº de palavras cantadas]] de cada frase. Nenhuma letra vem com o jogo:\n` +
  `// as palavras de cada frase saem do vocabulário do jogo na hora de jogar (songCatalogLines em youtube-rhythm.js).\n` +
  `const SONG_CATALOG=[\n${body}\n];\n`);
console.log(`\n📚 ${kept.length} músicas em js/config/song-catalog.js`);
