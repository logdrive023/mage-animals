// Mage Animals — tools/captions-worker.js · 🎞️ Servidor de legendas para o Ritmo do Bardo (Cloudflare Workers).
// O jogo roda no navegador e o YouTube bloqueia pedidos de outros sites (CORS). Este Worker busca as legendas
// do vídeo do lado do servidor e devolve só os tempos e o texto, em JSON, com os cabeçalhos que liberam o jogo.
//
//   GET https://SEU-WORKER.workers.dev/?v=<id do vídeo>&lang=pt
//   → {ok:true, lang:"pt", kind:"manual"|"auto", lines:[{t:12.4, end:15.1, text:"..."}]}
//   → {ok:false, error:"no_captions"|"bad_id"|"fetch_failed"}
//
// Atenção: usa caminhos internos do YouTube (não é a API oficial). Pode parar de funcionar se o YouTube mudar algo,
// e buscar legendas assim vai contra os termos de uso do YouTube — decisão do dono do projeto.
//
// Opcional (Settings → Variables do Worker): ALLOWED_ORIGINS = "https://seu-usuario.github.io,http://localhost:8766"
// para só o seu jogo poder usar. Sem a variável, qualquer site pode chamar.

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const CACHE_SECONDS = 7 * 86400; // a mesma legenda é servida do cache por 7 dias (o YouTube limita quem pede demais: 429 / "login necessário")

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin') || '';
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
    const allowOrigin = !allowed.length ? '*' : allowed.includes(origin) ? origin : '';
    const cors = {
      'Access-Control-Allow-Origin': allowOrigin || 'null',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin'
    };
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (allowed.length && !allowOrigin) return json({ ok: false, error: 'origin_not_allowed' }, 403, cors);

    const url = new URL(request.url);
    const vid = url.searchParams.get('v') || '';
    const lang = (url.searchParams.get('lang') || 'pt').slice(0, 5).toLowerCase();
    if (!/^[\w-]{11}$/.test(vid)) return json({ ok: false, error: 'bad_id' }, 400, cors);

    // cache da Cloudflare (por vídeo + idioma)
    const cacheKey = new Request(`https://captions.cache/v4/${vid}/${lang}`); // v3: idioma da voz + frases da legenda automática remontadas pelas pausas
    const cache = caches.default;
    const hit = await cache.match(cacheKey);
    if (hit) return new Response(hit.body, { status: 200, headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8', 'X-Cache': 'HIT' } });

    let result;
    try { result = await getCaptions(vid, lang); }
    catch (e) { result = { ok: false, error: 'fetch_failed', detail: String(e && e.message || e).slice(0, 200) }; }

    const body = JSON.stringify(result);
    if (result.ok) ctx.waitUntil(cache.put(cacheKey, new Response(body, { headers: { 'Cache-Control': `max-age=${CACHE_SECONDS}` } })));
    return new Response(body, { status: result.ok ? 200 : 404, headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8', 'X-Cache': 'MISS' } });
  }
};

function json(o, status, headers) {
  return new Response(JSON.stringify(o), { status, headers: { ...headers, 'Content-Type': 'application/json; charset=utf-8' } });
}

/** lista de faixas de legenda do vídeo: 1º pela API interna "player" (cliente Android), senão pela página do vídeo */
// clientes da API interna "player" tentados em ordem (o YouTube exige um token de origem nas legendas do cliente WEB;
// os clientes de app costumam devolver links de legenda que funcionam sem ele). Versões novas: as antigas são recusadas.
const CLIENTS = [
  { name: 'ANDROID', ua: 'com.google.android.youtube/20.10.38 (Linux; U; Android 14) gzip', ctx: { clientName: 'ANDROID', clientVersion: '20.10.38', androidSdkVersion: 34, osName: 'Android', osVersion: '14', hl: 'en', gl: 'US' } },
  { name: 'IOS', ua: 'com.google.ios.youtube/20.10.4 (iPhone16,2; U; CPU iOS 18_3_2 like Mac OS X;)', ctx: { clientName: 'IOS', clientVersion: '20.10.4', deviceMake: 'Apple', deviceModel: 'iPhone16,2', osName: 'iPhone', osVersion: '18.3.2.22D82', hl: 'en', gl: 'US' } },
  { name: 'TVHTML5_EMBED', ua: UA, ctx: { clientName: 'TVHTML5_SIMPLY_EMBEDDED_PLAYER', clientVersion: '2.0', hl: 'en', gl: 'US' }, embed: true }
];
/** faixas de legenda de cada fonte (clientes da API interna e, por último, a página do vídeo) — gera uma por vez */
async function* captionSources(vid, dbg) {
  for (const c of CLIENTS) {
    try {
      const body = { videoId: vid, context: { client: c.ctx }, contentCheckOk: true, racyCheckOk: true };
      if (c.embed) body.context.thirdParty = { embedUrl: 'https://www.youtube.com/' };
      const r = await fetch('https://www.youtube.com/youtubei/v1/player?prettyPrint=false', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'User-Agent': c.ua }, body: JSON.stringify(body)
      });
      const j = r.ok ? await r.json() : null;
      const t = j && j.captions && j.captions.playerCaptionsTracklistRenderer && j.captions.playerCaptionsTracklistRenderer.captionTracks;
      dbg.push(`${c.name}:${r.status}:${j && j.playabilityStatus ? j.playabilityStatus.status : '-'}:${t ? t.length : 0}`);
      if (t && t.length) yield { src: c.name, ua: c.ua, tracks: t };
    } catch (e) { dbg.push(`${c.name}:err`); }
  }
  try {
    const page = await fetch(`https://www.youtube.com/watch?v=${vid}&hl=en`, { headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9', 'Cookie': 'CONSENT=YES+1; SOCS=CAI' } });
    const html = await page.text();
    const m = html.match(/"captionTracks":(\[.*?\])(?:,"audioTracks"|,"translationLanguages")/);
    let t = [];if (m) try { t = JSON.parse(m[1]); } catch (e) {}
    dbg.push(`PAGE:${page.status}:${t.length}`);
    if (t.length) yield { src: 'PAGE', ua: UA, tracks: t };
  } catch (e) { dbg.push('PAGE:err'); }
}
/** texto de legenda → [{t,end,text}]: json3 · srv3 (<p t= d=>) · XML antigo (<text start= dur=>) */
// legenda AUTOMÁTICA (asr): o YouTube quebra o texto a cada ~4 palavras, no meio da frase, e as linhas "rolam"
// (se sobrepõem). Mas cada palavra vem com o próprio tempo (tOffsetMs) → as frases são remontadas pelas PAUSAS do canto:
// nova frase quando a próxima palavra demora > PAUSE s, ou a frase passa de MAX_WORDS palavras / MAX_SEC segundos.
const PAUSE = 0.65, MAX_WORDS = 10, MAX_SEC = 6;
function phrasesFromWords(words) {
  const out = [];let cur = null;
  for (let i = 0; i < words.length; i++) {
    const w = words[i], prev = words[i - 1];
    const brk = !cur || (prev && w.t - prev.t > PAUSE) || cur.n >= MAX_WORDS || w.t - cur.t > MAX_SEC || /^\[.*\]$/.test(w.w);
    if (brk) { if (cur) out.push(cur); cur = { t: w.t, end: w.t + 0.4, text: w.w, n: 1 }; }
    else { cur.text += ' ' + w.w; cur.n++; cur.end = w.t + 0.4; }
  }
  if (cur) out.push(cur);
  for (let i = 0; i < out.length; i++) { const nx = out[i + 1]; out[i].end = +Math.min(nx ? nx.t : out[i].end + 1.2, out[i].end + 1.2).toFixed(3); out[i].t = +out[i].t.toFixed(3); delete out[i].n; }
  return out;
}
function parseTrack(txt, asr) {
  const lines = [];
  if (/^\s*\{/.test(txt)) {
    try {
      const j = JSON.parse(txt), words = [];
      for (const ev of j.events || []) {
        if (!ev.segs) continue;
        const t0 = (ev.tStartMs || 0) / 1000;
        if (asr) { // palavra a palavra, com o tempo de cada uma
          for (const s of ev.segs) { const w = String(s.utf8 || '').replace(/\s+/g, ' ').trim(); if (w) words.push({ t: t0 + (s.tOffsetMs || 0) / 1000, w }); }
          continue;
        }
        const text = ev.segs.map(s => s.utf8 || '').join('').replace(/\s+/g, ' ').trim();
        if (!text) continue;
        lines.push({ t: +t0.toFixed(3), end: +(t0 + (ev.dDurationMs || 2000) / 1000).toFixed(3), text });
      }
      if (asr && words.length) { words.sort((a, b) => a.t - b.t); const ph = phrasesFromWords(words); ph.words = words.map(w => ({ t: +w.t.toFixed(3), w: w.w })); return ph; } // palavras com tempo vão junto: o jogo remonta as frases do jeito dele
    } catch (e) {}
    return lines;
  }
  for (const m of txt.matchAll(/<p\s+t="(\d+)"(?:\s+d="(\d+)")?[^>]*>([\s\S]*?)<\/p>/g)) {
    const text = decode(m[3]).replace(/\s+/g, ' ').trim(), t = +m[1] / 1000;
    if (text) lines.push({ t: +t.toFixed(3), end: +(t + (+m[2] || 2000) / 1000).toFixed(3), text });
  }
  if (lines.length) return lines;
  for (const m of txt.matchAll(/<text start="([\d.]+)"(?: dur="([\d.]+)")?[^>]*>([\s\S]*?)<\/text>/g)) {
    const text = decode(m[3]).replace(/\s+/g, ' ').trim();
    if (text) lines.push({ t: +m[1], end: +m[1] + (+m[2] || 2), text });
  }
  return lines;
}

/** escolhe a faixa: legenda manual no idioma pedido › manual em qualquer idioma › automática no idioma › a primeira */
// idioma da VOZ = idioma da legenda automática (o YouTube só gera "asr" no idioma falado/cantado). Preferência:
// manual no idioma da voz › automática no idioma da voz › manual no idioma pedido › manual EN › qualquer manual › qualquer automática.
// Assim numa música em inglês digita-se o que é cantado, e não a tradução.
function pickTrack(tracks, lang) {
  const base = l => String(l || '').toLowerCase().split('-')[0];
  const manual = tracks.filter(t => t.kind !== 'asr'), auto = tracks.filter(t => t.kind === 'asr');
  const spoken = auto.length ? base(auto[0].languageCode) : '';
  return (spoken && (manual.find(t => base(t.languageCode) === spoken) || auto[0]))
    || manual.find(t => base(t.languageCode) === lang) || manual.find(t => base(t.languageCode) === 'en') || manual[0] || auto[0] || null;
}

/** tenta cada fonte e cada formato até uma legenda vir com conteúdo; `debug` diz o que cada tentativa respondeu */
async function getCaptions(vid, lang) {
  const dbg = [];let found = false;
  for await (const s of captionSources(vid, dbg)) {
    found = true;
    const tr = pickTrack(s.tracks, lang);if (!tr || !tr.baseUrl) continue;
    const base = tr.baseUrl.replace(/&fmt=[^&]*/, '');
    for (const fmt of ['&fmt=json3', '&fmt=srv3', '']) {
      try {
        const r = await fetch(base + fmt, { headers: { 'User-Agent': s.ua } });
        const txt = await r.text();
        dbg.push(`${s.src}/${tr.languageCode}${tr.kind === 'asr' ? '(auto)' : ''}${fmt || '&xml'}:${r.status}:${txt.length}b`);
        const lines = txt ? parseTrack(txt, tr.kind === 'asr') : []; // automática: frases remontadas pelas pausas do canto
        if (lines.length) return { ok: true, lang: tr.languageCode, kind: tr.kind === 'asr' ? 'auto' : 'manual', src: s.src, lines, words: lines.words || null };
      } catch (e) { dbg.push(`${s.src}${fmt}:err`); }
    }
  }
  return { ok: false, error: found ? 'empty_track' : 'no_captions', debug: dbg };
}

function decode(s) {
  return s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/<[^>]*>/g, '');
}
