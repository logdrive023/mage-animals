// Mage Animals — js/systems/profile.js · Identidade dupla do jogador.
//  · @handle  — permanente e imutável (ex.: @mago_bruno84). Gerado no primeiro acesso; é a "chave primária" pública
//               que os amigos usam para te encontrar. Nunca muda, nem trocando o apelido.
//  · Apelido  — nome de exibição livre (ex.: "Mago Supremo ⚡"), em profile.nickname; muda quando quiser.
// Persistência via StorageManager (mage_identity + mage_profile). Para um servidor no futuro, generate() vira uma
// chamada que reserva o handle e load() passa a buscar o perfil remoto — o resto do jogo continua igual.
'use strict';

const HANDLE_RE=/^@[a-z0-9_]{3,20}$/;
/** texto livre → pedaço válido de handle (minúsculas, sem acento, só a-z 0-9 _) */
function handleSlug(s){return norm(String(s||'')).replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'').slice(0,12)}
const PlayerIdentity={
 data:null,
 load(){
  let d=StorageManager.loadIdentity();
  if(!d||!HANDLE_RE.test(d.handle)){d={handle:this.generate(),created:Date.now()};StorageManager.saveIdentity(d)}
  return this.data=d;
 },
 generate(){
  const base=handleSlug(profile.nickname),pre=base.length>=3?base:['mago','maga','arcano','runico','feiticeiro'][(Math.random()*5)|0];
  return'@'+pre+'_'+(1000+((Math.random()*9000)|0)); // 4 dígitos: menos chance de dois jogadores com o mesmo @handle
 },
 get handle(){return(this.data||this.load()).handle},
 get displayName(){return nickOr()},
 /** apelido: livre (até 16), sem tags HTML — o @handle não muda */
 setDisplayName(name){const n=String(name||'').replace(/[<>]/g,'').trim().slice(0,16);if(n){profile.nickname=n;saveProfile()}return nickOr()},
 summary(){return{handle:this.handle,name:this.displayName,lvl:profile.level,avatar:profile.avatar,ch:CHARS[selected].id}},
 async copyHandle(btn){let ok=false;try{await navigator.clipboard.writeText(this.handle);ok=true}catch(_){}
  if(btn){const o=btn.textContent;btn.textContent=ok?'✓':'⧉';setTimeout(()=>{btn.textContent=o},1400)}snd(ok?988:300,.06,'triangle',.04)}
};
PlayerIdentity.load();
