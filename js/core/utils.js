// Mage Animals — Utilitários compartilhados (DOM, texto, números, cores, armazenamento).
'use strict';

const $=id=>document.getElementById(id);

const norm=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();

const rand=(a,b)=>a+Math.random()*(b-a);

function rng(seed){return()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646}}

function hexA(h,a){const n=parseInt(h.slice(1),16);return`rgba(${n>>16},${n>>8&255},${n&255},${a})`}

// preferências avulsas: delegam ao StorageManager (js/systems/storage.js) — um único caminho de persistência
const store={get:(k,d)=>StorageManager.read(k,d),set:(k,v)=>{StorageManager.write(k,v)}};

const esc=s=>String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

// ---------- datas (missões diárias/semanais) ----------
const dayKey=(d=new Date())=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
function weekKey(d=new Date()){const x=new Date(d.getFullYear(),d.getMonth(),d.getDate());x.setDate(x.getDate()-((x.getDay()+6)%7));return'W'+dayKey(x)} // semana começa na segunda

function hslHex(h){const l=.62,a=.38,f=n=>{const k=(n+h/30)%12,v=l-a*Math.max(-1,Math.min(k-3,9-k,1));return Math.round(v*255).toString(16).padStart(2,'0')};return'#'+f(0)+f(8)+f(4)}
