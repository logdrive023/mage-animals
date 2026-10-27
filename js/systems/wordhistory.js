// Mage Animals — js/systems/wordhistory.js · 📖 Histórico de palavras já escritas (base do Dicionário).
// Guarda, por idioma do banco de palavras (pt · en · es), o conjunto de palavras COMPLETADAS em qualquer modo de
// palavras (arcade, duelo contra o bot, duelo online). Forma normalizada (sem acento, minúscula): no celular e no
// online as palavras vêm sem acento. Persistência: mage_words_typed = {pt:[…], en:[…], es:[…]} — só grava quando
// entra uma palavra nova. Começa a contar a partir desta versão (as partidas antigas não guardavam as palavras).
'use strict';

const WORD_LANGS=['pt','en','es'];
// idioma do banco de palavras em uso (o do jogo; no online, o do anfitrião)
const wordLangOf=lang=>{const l=(LANGS.find(x=>x.id===lang)||{}).words||lang;return WORD_LANGS.includes(l)?l:'pt'};
const WordHistory={
 _s:null,
 load(){
  if(this._s)return this._s;
  const raw=StorageManager.read('words_typed',{})||{};this._s={};
  for(const l of WORD_LANGS)this._s[l]=new Set(Array.isArray(raw[l])?raw[l].map(String):[]);
  return this._s;
 },
 /** palavra completada pelo jogador (lang = idioma do banco; padrão: o idioma atual do jogo) */
 add(word,lang){
  const k=norm(String(word||''));if(k.length<2)return; // letras soltas (modo Letras) não contam
  const S=this.load()[wordLangOf(lang||LANG)];if(!S||S.has(k))return;
  S.add(k);this.save();
 },
 has(lang,word){const S=this.load()[lang];return!!S&&S.has(norm(word))},
 count(lang){return this.load()[lang].size},
 save(){const o={};for(const l of WORD_LANGS)o[l]=[...this._s[l]];StorageManager.write('words_typed',o)}
};
