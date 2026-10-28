// Mage Animals — Dados do jogo: personagens, magias, inimigos, biomas, idiomas, palavras, missões, ranking e recompensas.
'use strict';

const CHARS=[
 {id:'gato',name:'GATO',emoji:'🐱',spell:'cometa',color:'#5ad0ff',robe:'#26427f',robeDark:'#0f1b3d',fur:'#d6ac7c',lives:3,unlock:0,passive:{scoreMul:1.1}},
 {id:'coelho',name:'COELHO',emoji:'🐰',spell:'raio',color:'#c07aff',robe:'#5e2c94',robeDark:'#2a1248',fur:'#f7d9e4',lives:3,unlock:3,passive:{enemySpeedMul:.85}},
 {id:'raposa',name:'RAPOSA',emoji:'🦊',spell:'explosao',color:'#ff4a3a',robe:'#a8222e',robeDark:'#4a0c14',fur:'#ea6c2c',lives:3,unlock:5,passive:{splashR:95}},
 {id:'coruja',name:'CORUJA',emoji:'🦉',spell:'vortice',color:'#ffc23a',robe:'#2f6e40',robeDark:'#123a1e',fur:'#7a5638',lives:4,unlock:7,passive:{keepCombo:true}}
];
// ⚙️ passivas dos magos = DADOS (o motor só lê as chaves; nenhum "if id === …" no combate):
//  scoreMul (pontos ×) · enemySpeedMul (velocidade dos inimigos ×) · splashR (raio do dano em área ao completar) · keepCombo (erro não zera o combo)
const PASSIVE_DEF={scoreMul:1,enemySpeedMul:1,splashR:0,keepCombo:false};
const passive=(ch,k)=>{const p=ch&&ch.passive;return p&&p[k]!=null?p[k]:PASSIVE_DEF[k]};
CHARS.forEach((c,i)=>c.lvl=[1,2,4,6][i]);

const SPELLS=[
 {id:'cometa',ic:'☄️',c:'#5ad0ff'},{id:'explosao',ic:'💥',c:'#ff8a3a'},{id:'raio',ic:'⚡',c:'#b9e6ff'},
 {id:'vortice',ic:'🌀',c:'#4dffa0'},
 // feitiços de emergência de TODOS os magos (js/systems/combat.js) — substituíram os Meteoros
 {id:'congelar',ic:'❄️',c:'#aef0ff',shared:true},{id:'arcana',ic:'💥',c:'#ff9ad8',shared:true}
];

// Tipos lógicos de inimigo (iguais em todos os biomas; só a arte muda)
const ENEMY={
 rock:{hp:1,r:21,spd:1,pts:10},
 crystal:{hp:2,r:23,spd:.8,pts:25},
 ghost:{hp:1,r:19,spd:1.5,pts:15},
 boss:{hp:3,r:44,spd:.45,pts:120}
};

// ---------- BIOMAS (skins de fase) ----------
// art: qual desenho usar para cada tipo · fx: cor das partículas · trail: rastro · themes: índices em THEMES
const BIOMES=[
 {id:'cosmic',ic:'☄️',themes:[0,1,2,3,4],cycle:true,art:{rock:'rock',crystal:'crystal',ghost:'ghost',boss:'meteor'},
  fx:{rock:'#ffa040',crystal:'#b080ff',ghost:'#6affb0',boss:'#ff8a3a'},trail:'ember'},
 {id:'zombie',ic:'🧟',themes:[5],art:{rock:'zombie',crystal:'tomb',ghost:'candy',boss:'pumpkin'},
  fx:{rock:'#8aff6a',crystal:'#b8a8d8',ghost:'#ff8ad8',boss:'#ff9a2a'},trail:'goo'},
 {id:'ocean',ic:'🌊',themes:[6],art:{rock:'bubble',crystal:'urchin',ghost:'jelly',boss:'octo'},
  fx:{rock:'#7ae8ff',crystal:'#ffd24a',ghost:'#ff9af0',boss:'#c77bff'},trail:'bubble'}
];

const THEMES=[
 {id:'night',sky:['#060920','#1d1450','#46277e'],m1:'#2a1d5c',m2:'#150e34',neb:'#8a5cff',tw:['#2c3048','#6a7092'],roof:'#2f3a7a',win:'#ffbe5a',stars:1},
 {id:'day',sky:['#1a2a5c','#4a6aa8','#e0a874'],m1:'#4a5a8a',m2:'#2a3458',neb:'#ffd0a0',tw:['#5a4632','#c8a070'],roof:'#3a62b0',win:'#ffd27a',stars:.25,sun:1},
 {id:'ice',sky:['#06122a','#123a6a','#4a8ac0'],m1:'#2a4a7a',m2:'#122444',neb:'#7adfff',tw:['#3a4a68','#a8c0e0'],roof:'#9ad4ff',win:'#9adfff',stars:.9},
 {id:'forest',sky:['#04120c','#0f3226','#2c6a4a'],m1:'#163a2a',m2:'#0a1e16',neb:'#6aff9a',tw:['#283e2a','#6a8a58'],roof:'#2a6a3a',win:'#b0ff8a',stars:.8},
 {id:'crystal',sky:['#0a0614','#1e0f2e','#3a1a4a'],m1:'#2a1838',m2:'#120a1a',neb:'#5ad0ff',tw:['#1c1828','#4a4060'],roof:'#241c38',win:'#5ad0ff',stars:1},
 {id:'haunted',kind:'zombie',sky:['#0a0612','#26103a','#3e2a4a'],m1:'#1e1430',m2:'#0e0a18',neb:'#7aff5a',tw:['#241c30','#5a4a6a'],roof:'#3a1a4a',win:'#9aff6a',stars:.7,moonCol:'#d8ff9a'},
 {id:'abyss',kind:'ocean',sky:['#01141e','#04384e','#0a6a7a'],m1:'#06303e',m2:'#031c26',neb:'#4af0ff',tw:['#1a3a48','#4a8a98'],roof:'#1a5a6a',win:'#7af8ff',stars:0}
];

// palavras por idioma: separadas automaticamente por tamanho (s 3–4, m 5–7, l 8+ letras, sem acento)
const WORD_BANK={
 pt:'lua sol fogo gelo raio runa orbe luz mago fada elfo asa onda céu gema rubi ouro capa mapa vela olho lobo urso toca rio mar voo ave pena elmo arco lago ilha sino rei pata neve mel chá dia aura alma mito raiz flor gato cubo dado fera jade muro pico ônix trono zero nada vida '+
  'vento magia chama brasa nuvem terra água pedra astro noite trevo bruxa livro névoa cinza faísca garra presa cometa estrela feitiço varinha dragão poção galáxia trovão sombra coruja raposa coelho castelo escudo cajado amuleto eclipse aurora vórtice meteoro planeta encanto portal runas safira cristal oráculo fênix tesouro lâmina relíquia selo torre ponte vulcão gárgula golem espada mágico arcano fúria lenda '+
  'tempestade constelação encantamento relâmpago labirinto invocação pergaminho feiticeiro alquimista supernova cataclismo meteorito arquimago transmutação maldição necromante encruzilhada firmamento misterioso espírito mistério grimório caldeirão unicórnio floresta montanha guardião profecia sortilégio fortaleza nebulosa encantado',
 en:'moon sun fire ice rune orb mage fairy elf wing wave sky gem ruby gold cape map eye wolf bear sea owl fox king paw snow star tree leaf rain myth soul glow mist dawn dusk cave fang horn ash oak '+
  'wind magic flame ember cloud earth water stone night spell wand dragon potion galaxy thunder shadow castle shield staff amulet eclipse aurora vortex meteor planet portal sapphire crystal oracle phoenix treasure blade relic tower bridge volcano golem sword arcane legend charm comet '+
  'tempest lightning labyrinth summoning parchment sorcerer alchemist supernova cataclysm meteorite archmage enchantment necromancer firmament mysterious guardian prophecy fortress nebula unicorn mountain thunderbolt starlight moonstone',
 es:'luna sol fuego hielo rayo runa orbe luz mago hada elfo ala ola cielo gema rubí oro capa mapa vela ojo lobo oso mar ave rey pata nieve miel día aura alma mito raíz flor gato fiera jade muro pico '+
  'viento magia llama brasa nube tierra agua piedra astro noche trébol bruja libro niebla ceniza garra cometa estrella hechizo varita dragón poción galaxia trueno sombra lechuza zorro conejo castillo escudo bastón amuleto eclipse aurora vórtice meteoro planeta encanto portal zafiro cristal oráculo fénix tesoro espada reliquia torre puente volcán gárgola golem arcano furia leyenda '+
  'tempestad constelación encantamiento relámpago laberinto invocación pergamino hechicero alquimista supernova cataclismo meteorito archimago maldición nigromante firmamento misterioso espíritu misterio grimorio caldero unicornio montaña guardián profecía fortaleza nebulosa encantado'
};
// 📚 ampliação do dicionário (vocabulário de fantasia/natureza, estilo Dicio) — mesclado sem duplicatas
const WORD_EXTRA={pt:`sal cor paz voz mão pão elo eco gás véu lar nau tom som dom era fio ovo cão neo ímã arpa base bico boca bolo cabo casa cera chão dama dedo eixo faca fome frio giz jogo lado lama lata leão lima lixo loja lupa luta mala mana meta mina nave nota obra pato pera pipa poço polo raio rato rede roda rosa rota sapo seda sino sopa teia tela teto toca vaso vila zona ogro titã xamã gnomo lava baú anel joia areia bruxo veneno vapor chuva dente tigre porta ponte ideia fumaça pântano relva orvalho geada brisa tufão granizo neblina cascata deserto caverna ruína templo altar trevas abismo cálice adaga lança escama sereia quimera hidra grifo duende troll vampiro morcego aranha falcão águia corvo cisne tritão kraken lótus lunar solar astral cósmico etéreo místico sombrio sagrado divino oculto antigo eterno feroz veloz bravo herói vilão ninja pirata monge druida bardo clérigo ladino bússola mochila tocha corda chave moeda colar coroa cetro frasco elixir tônico pólen semente folha galho tronco bosque selva campo prado colina vale geleira iceberg cratera magma faísca fagulha cinzas carvão ferro cobre prata bronze quartzo âmbar pérola coral opala topázio granada dreno ilusão hipnose furacão tornado nevasca machado martelo besta tempestade meteoro explosão ancestral teletransporte invisível gravidade magnetismo eletricidade cristalino iluminação escuridão redemoinho avalanche terremoto maremoto ventania trovoada arquipélago cordilheira horizonte crepúsculo madrugada alvorada eternidade infinito universo dimensão catacumba masmorra calabouço cidadela santuário biblioteca observatório laboratório alquimia bruxaria feitiçaria adivinhação clarividência premonição pesadelo sonâmbulo devaneio fantasia aventura expedição exploração descoberta armadura estandarte catapulta tridente bumerangue serpente escorpião centauro guerreiro arqueiro paladino cavaleiro lanterna essência floresta centelha labareda incêndio esmeralda diamante turquesa obsidiana pingente`,en:`key coin ring ruby lava rope tome sigil glyph totem spark frost storm blaze ghost giant troll witch knight rogue cleric druid bard quest crypt tomb altar temple shrine elixir scroll mirror torch chest jewel crown amber pearl coral onyx opal topaz magma cinder smoke cloud hail breeze gale wizard ranger dungeon lantern scepter garnet emerald diamond quartz obsidian cyclone tornado hurricane blizzard avalanche earthquake twilight midnight sunrise sunset horizon infinity universe dimension illusion hypnosis gravity magnetism thunderstorm catacomb citadel sanctuary library observatory laboratory alchemy witchcraft sorcery nightmare daydream fantasy adventure expedition discovery armor banner catapult crossbow hammer trident boomerang serpent scorpion centaur warrior archer paladin`,es:`llave joya coral lava humo nube perla anillo tomo sello glifo tótem chispa bruma brisa cripta tumba altar templo cofre moneda corona cetro ámbar ópalo cuerda espejo antorcha escarcha tormenta llamarada fantasma gigante caballero pícaro clérigo druida bardo misión mazmorra santuario elixir linterna topacio granate esmeralda diamante cuarzo obsidiana magma ceniza lluvia granizo ciclón tornado huracán ventisca avalancha terremoto crepúsculo medianoche amanecer horizonte infinito universo dimensión ilusión hipnosis gravedad catacumba ciudadela biblioteca observatorio laboratorio alquimia brujería hechicería pesadilla fantasía aventura expedición armadura estandarte catapulta ballesta martillo tridente serpiente escorpión centauro guerrero arquero paladín`};
// e = fácil (3–5 letras, SEM acento/ç) · mp = média sem acento (5–7, o "tempero" das primeiras ondas)
// s 3–4 · m 5–7 · l 8+ · b = chefe (6–9 letras) · w3 = só 3 letras (acolhimento no mobile)
// 📱 celular: TODAS as palavras perdem acentos e ç (CÓSMICA → COSMICA, SÃO → SAO, FAÍSCA → FAISCA)
const POOL={e:[],mp:[],s:[],m:[],l:[],b:[],w3:[],byLen:{plain:[],acc:[]}}; // byLen: palavras por nº de letras (com/sem acento) para a curva da Difficulty
function buildPools(lang){
 for(const k in POOL)if(Array.isArray(POOL[k]))POOL[k].length=0;POOL.byLen={plain:[],acc:[]};
 const mobile=typeof DeviceManager!=='undefined'&&DeviceManager.isMobile,seen=new Set();
 ((WORD_BANK[lang]||WORD_BANK.pt)+' '+(WORD_EXTRA[lang]||'')).normalize('NFC').split(/\s+/).forEach(w0=>{
  if(!w0)return;const plain=w0.normalize('NFD').replace(/[̀-ͯ]/g,''),w=mobile?plain:w0,n=plain.length;
  if(!/^[a-z]+$/.test(plain)||seen.has(w))return;seen.add(w);
  const easy=plain===w;
  if(n>=3&&n<=5&&easy){POOL.e.push(w);if(n===3)POOL.w3.push(w)}
  if(n>=5&&n<=7&&easy)POOL.mp.push(w);
  if(n>=6&&n<=9)POOL.b.push(w);
  if(n>=3&&n<=4)POOL.s.push(w);else if(n>=5&&n<=7)POOL.m.push(w);else if(n>=8)POOL.l.push(w);
  const bl=POOL.byLen[plain===w?'plain':'acc'];(bl[n]||(bl[n]=[])).push(w);
 });
}
// 🔤 modo Letras: o inimigo mostra 1 letra só
const LETTERS='abcdefghijklmnopqrstuvwxyz';

// ---------- recompensas cosméticas ----------
// l = nível necessário · ach = liberado por conquista/missão/login (id fica em profile.claimed)
// n = nome canônico salvo no perfil (compatível com saves antigos); o nome exibido vem de t('titles.<id>')
const TITLES=[{id:'apprentice',n:'Aprendiz de Magia',l:1},{id:'conjurer',n:'Conjurador Iniciante',l:3},{id:'wordmaster',n:'Mestre das Palavras',l:5},{id:'runesorcerer',n:'Feiticeiro das Runas',l:8},{id:'archmage',n:'Arquimago Supremo',l:12},{id:'legend',n:'Lenda Arcana',l:16},
 {id:'firefingers',n:'Dedos de Fogo',ach:'wpm60'},{id:'guardian',n:'Guardião da Torre',ach:'wave10'},{id:'zombiehunter',n:'Caçador de Zumbis',ach:'q_d_zombie'},{id:'duelchamp',n:'Campeão do Duelo',ach:'duel_arquimago'}];
const BORDERS=[{id:'bronze',n:'Bronze',l:1},{id:'prata',n:'Prata',l:4},{id:'ouro',n:'Ouro',l:7},{id:'arcana',n:'Arcana',l:10},{id:'cosmica',n:'Cósmica',l:14},{id:'abissal',n:'Abissal',ach:'q_w_boss'}];
const SCOLORS=[{id:'padrao',n:'Personagem',l:1,c:null},{id:'ouro',n:'Dourado',l:2,c:'#ffd24a'},{id:'rubi',n:'Rubi',l:6,c:'#ff4a6a'},{id:'esmeralda',n:'Esmeralda',l:9,c:'#3aff8a'},{id:'arcoiris',n:'Arco-íris',l:11,c:'rainbow'},
 {id:'chama',n:'Chama Arcana',ach:'boss50',c:'#ff6a1a'},{id:'aurora',n:'Aurora',ach:'login7',c:'#7affd8'}];
const AVATARS=[{e:'🧙',l:1},{e:'🔮',l:3},{e:'🐉',l:5},{e:'🦄',l:8},{e:'👑',l:12},{e:'🧚',ach:'login4'},{e:'🧟',ach:'q_d_zombie'}];

// Conquistas permanentes (marcos)
const ACHIEVEMENTS=[
 {id:'words500',ic:'✍️',stat:'totalWords',goal:500,reward:{xp:100}},
 {id:'wpm60',ic:'🔥',stat:'maxWpm',goal:60,reward:{title:'Dedos de Fogo'}},
 {id:'boss50',ic:'👑',stat:'totalBosses',goal:50,reward:{color:'chama'}},
 {id:'kills1000',ic:'⚔️',stat:'totalKills',goal:1000,reward:{xp:300}},
 {id:'wave10',ic:'🏰',stat:'maxWave',goal:10,reward:{title:'Guardião da Torre'}},
 {id:'games10',ic:'🎮',stat:'games',goal:10,reward:{xp:150}},
 {id:'acc98',ic:'🎯',stat:'bestAcc',goal:98,reward:{xp:200}},
 {id:'time1h',ic:'⏱️',stat:'totalTime',goal:3600,reward:{xp:250},fmt:'time'},
 // 📖 vocabulário (Dicionário + nêmesis): stats calculados em statValue (js/core/player.js)
 {id:'vocab100',ic:'📖',stat:'dictWords',goal:100,reward:{xp:200}},
 {id:'vocab500',ic:'📚',stat:'dictWords',goal:500,reward:{xp:500,aura:150}},
 {id:'polyglot',ic:'🌍',stat:'dictLangs',goal:3,reward:{aura:200}},
 {id:'nemesis1',ic:'😈',stat:'nemDom',goal:1,reward:{xp:150}},
 {id:'nemesis25',ic:'★',stat:'nemDom',goal:25,reward:{xp:600,aura:250}},
 {id:'online5',ic:'🌐',stat:'onlineWins',goal:5,reward:{aura:200}}
];

// Missões diárias (reset à meia-noite local) e semanais (reset na segunda-feira)
// tone = cor do orbe do ícone (fire = PVC, blue = digitação, green = bioma, gold = chefes, violet = aura)
// 🔄 QUESTS = BANCO de missões: a cada dia/semana sorteia-se uma seleção (questList em player.js, semente = data):
//  diárias = 4 (a fixed + 3 sorteadas) · semanais = 5 (a fixed + 4). cat = categoria mostrada no card.
//  Estatísticas (contadas em player.js/questAdd · questMax): words, duelWins, onlineDuels, onlineWins, bosses, zombieWave(máx),
//  accGames (partidas ≥95% c/ 30+ palavras), spells (feitiços de emergência), nemesis (nêmesis vencidas), combo(máx),
//  wave(máx), village (coletar/evoluir no Reino), songs (partidas no Ritmo do Bardo), perfects (notas Perfeito), games (partidas)
const QUESTS={
 daily:[
  {id:'d_words',ic:'✍️',tone:'blue',cat:'type',stat:'words',goal:200,reward:{xp:150},fixed:true},
  {id:'d_duel',ic:'⚔️',tone:'fire',cat:'duel',stat:'duelWins',goal:1,reward:{xp:200,aura:30}},
  {id:'d_zombie',ic:'🧟',tone:'green',cat:'battle',stat:'zombieWave',goal:5,reward:{xp:100,title:'Caçador de Zumbis'}},
  {id:'d_acc',ic:'🎯',tone:'blue',cat:'type',stat:'accGames',goal:2,reward:{xp:180,aura:20}},
  {id:'d_spells',ic:'❄️',tone:'violet',cat:'battle',stat:'spells',goal:3,reward:{xp:150}},
  {id:'d_combo',ic:'🔥',tone:'gold',cat:'type',stat:'combo',goal:25,reward:{xp:160,aura:20}},
  {id:'d_nem',ic:'😈',tone:'violet',cat:'type',stat:'nemesis',goal:2,reward:{xp:150,aura:25}},
  {id:'d_wave',ic:'🌊',tone:'gold',cat:'battle',stat:'wave',goal:8,reward:{xp:200}},
  {id:'d_village',ic:'🏛️',tone:'green',cat:'realm',stat:'village',goal:2,reward:{aura:40}},
  {id:'d_songs',ic:'🎵',tone:'violet',cat:'music',stat:'songs',goal:1,reward:{xp:150,aura:20}},
  {id:'d_games',ic:'🎮',tone:'blue',cat:'battle',stat:'games',goal:3,reward:{xp:120}},
  {id:'d_over',ic:'⚡',tone:'gold',cat:'type',stat:'overloads',goal:2,reward:{xp:160,aura:20}},
  {id:'d_runes',ic:'🔮',tone:'violet',cat:'battle',stat:'runeGames',goal:1,reward:{xp:140,aura:15}},
  {id:'d_letters',ic:'✍️',tone:'green',cat:'battle',stat:'letterGames',goal:1,reward:{xp:120,aura:15}},
  {id:'d_daily',ic:'📅',tone:'fire',cat:'battle',stat:'dailyRuns',goal:1,reward:{aura:35}},
  {id:'d_chests',ic:'🎁',tone:'gold',cat:'realm',stat:'chestsOpened',goal:1,reward:{xp:100}}
 ],
 weekly:[
  {id:'w_words',ic:'📖',tone:'blue',cat:'type',stat:'words',goal:1500,reward:{xp:400,aura:80},fixed:true},
  {id:'w_duels',ic:'🏆',tone:'fire',cat:'duel',stat:'duelWins',goal:5,reward:{aura:150}}, // duelWins: bot E online (pvpEnd)
  {id:'w_online',ic:'🌐',tone:'fire',cat:'duel',stat:'onlineDuels',goal:3,reward:{xp:300,aura:100}}, // partidas online jogadas (vitória, empate ou derrota)
  {id:'w_boss',ic:'👑',tone:'gold',cat:'battle',stat:'bosses',goal:50,reward:{xp:1000,border:'abissal'}},
  {id:'w_onwin',ic:'🥇',tone:'fire',cat:'duel',stat:'onlineWins',goal:2,reward:{aura:180,chests:1}},
  {id:'w_acc',ic:'🎯',tone:'blue',cat:'type',stat:'accGames',goal:8,reward:{xp:500,aura:100}},
  {id:'w_spells',ic:'💥',tone:'violet',cat:'battle',stat:'spells',goal:20,reward:{xp:400}},
  {id:'w_nem',ic:'😈',tone:'violet',cat:'type',stat:'nemesis',goal:10,reward:{xp:450,aura:120}},
  {id:'w_village',ic:'🏛️',tone:'green',cat:'realm',stat:'village',goal:10,reward:{aura:200}},
  {id:'w_combo',ic:'🔥',tone:'gold',cat:'type',stat:'combo',goal:50,reward:{xp:500,chests:1}},
  {id:'w_perfect',ic:'✨',tone:'violet',cat:'music',stat:'perfects',goal:60,reward:{xp:450,aura:120}},
  {id:'w_over',ic:'⚡',tone:'gold',cat:'type',stat:'overloads',goal:12,reward:{xp:500,aura:120}},
  {id:'w_daily',ic:'📅',tone:'fire',cat:'battle',stat:'dailyRuns',goal:5,reward:{aura:200,chests:1}},
  {id:'w_chests',ic:'🎁',tone:'gold',cat:'realm',stat:'chestsOpened',goal:6,reward:{xp:400,aura:80}},
  {id:'w_songs',ic:'🎵',tone:'violet',cat:'music',stat:'songs',goal:5,reward:{xp:400,aura:100}}
 ]
};
// overloads = Sobrecargas ativadas · runeGames/letterGames = partidas nos modos Runas/Letras · dailyRuns = Desafios do dia · chestsOpened = baús abertos
const Q_STATS=['words','duelWins','onlineDuels','onlineWins','bosses','zombieWave','accGames','spells','nemesis','combo','wave','village','songs','perfects','games','overloads','runeGames','letterGames','dailyRuns','chestsOpened'];

// Calendário de login de 7 dias
// Ofensiva de 7 dias: recompensas crescentes; o Dia 7 é o Baú Arcano Lendário
const LOGIN_REWARDS=[{aura:50},{xp:100},{aura:80},{xp:150,avatar:'🧚'},{aura:120},{xp:250},{xp:400,aura:250,color:'aurora',chests:1}];
// Passe semanal: concluir N missões (diárias ou semanais) na semana abre o Baú Semanal de Aura
const WEEKLY_CHEST={goal:5,reward:{xp:500,aura:300,chests:1}};

// 🏰 Skins da torre (cosmético): índice = tema da torre; desbloqueio por nível. -1 = automática (segue o bioma)
const TOWER_SKINS=[{ti:0,l:1},{ti:1,l:3},{ti:2,l:5},{ti:3,l:8},{ti:4,l:11}];

// Padrões de jogabilidade/acessibilidade (sobrescritos pelo que o jogador salvar no localStorage)
const GAME_DEFAULTS={strictAccents:true}; // true = DRAGÃO exige "ã"; false = "dragao" também vale

// 📱 Ajustes SÓ do celular (DeviceManager.isMobile). No desktop a dificuldade do teclado físico não muda.
const MOBILE_TUNING={
 speedMul:.87,            // inimigos 13% mais lentos: tempo para traçar a letra com o dedo
 gestureBias:.68,         // viés do reconhecedor para letras plausíveis (desktop/touch grande: .82) → ~17% mais tolerante
 bossTimeMul:1.6,         // temporizador do chefe mais longo (desenhar leva mais tempo que teclar)
 mercy:{misses:2,slow:.25,time:1.5}, // 2 erros seguidos → inimigo mais próximo 25% mais lento por 1,5 s
 miniBoss:{aura:25,rest:3}           // mini-chefe: +Aura ao vencer e 3 s de respiro
};
// Curva em "dente de serra" (mobile): ciclos de 5 ondas que sobem, aliviam e fecham com um mini-chefe.
//  Os números crescem a cada ciclo (base); a forma do ciclo se repete.
const SAWTOOTH=[
 {id:'welcome', maxOn:0,size:5,gap:1.15,speed:.85,tier:'w3',kinds:'rock'},  // Onda 1 · acolhimento: lentos, 3 letras
 {id:'tension', maxOn:1,size:6,gap:1,   speed:1,  tier:'e', kinds:'rock'},  // Onda 2 · tensão: +1 inimigo na tela
 {id:'peak',    maxOn:1,size:7,gap:.95, speed:1.05,tier:'e',kinds:'ghost'}, // Onda 3 · pico: primeiro Fantasma rápido
 {id:'breather',maxOn:0,size:5,gap:1.25,speed:.9, tier:'e', kinds:'rock'},  // Onda 4 · respiro: spawn 20% mais lento, palavras simples
 {id:'boss',    maxOn:0,size:4,gap:1.1, speed:1,  tier:'e', kinds:'rock',boss:true} // Onda 5 · mini-chefe com barra de vida
];

// ================== 🔮 MODO SÍMBOLOS & RUNAS ==================
// Escada de aprendizado: do traço primitivo (uma linha) às runas ancestrais compostas.
// Cada forma tem um CÓDIGO de 1 caractere: a "palavra" de um inimigo no modo runas é a sequência de códigos das suas formas,
// então mira, dano, combo, chefe com tempo, Mercy e missões funcionam igual ao modo palavras.
// Traços em 0..100 (y para baixo). Formas abertas podem ser desenhadas em qualquer sentido; as de 2 traços em qualquer ordem.
// el = elemento visual do badge (raio = amarelo elétrico, gelo = ciano/azul, fogo = vermelho/laranja, arcano = violeta).
const RUNE_FAMILIES=[
 {id:'lines',  ic:'🟢',wave:1, el:'raio'},   // Nível 1 — linhas e orientações
 {id:'angles', ic:'🟡',wave:2, el:'raio'},   // Nível 2 — ângulos e traços duplos (ondas 2–4)
 {id:'curves', ic:'🔵',wave:5, el:'gelo'},   // Nível 3 — curvas e arcos (ondas 5–7)
 {id:'closed', ic:'🟣',wave:8, el:'fogo'},   // Nível 4 — formas fechadas (ondas 8–10)
 {id:'loops',  ic:'🔴',wave:11,el:'arcano'}, // Nível 5 — loops e nós arcanos (ondas 11+ / elites)
 {id:'ancient',ic:'👑',wave:0, el:'arcano'}  // Nível 6 — runas compostas ancestrais (chefes)
];
// Curva do modo runas: desenhar uma forma leva ~1–2 s (teclar uma letra, ~0,2 s), então a partida tem poucos inimigos,
// entrada espaçada e velocidade que cresce devagar. Calibrada com jogadores simulados (novato / médio / bom).
const RUNE_CURVE={
 maxOn:w=>Math.min(5,Math.max(3,2+Math.floor((w-1)/4))), // na tela ao mesmo tempo: 3 (ondas 1–8) → 4 → 5
 size:w=>5+Math.floor(w*.7),                 // inimigos por onda (onda 1: 5)
 gap:w=>Math.max(1.6,2-w*.02),               // segundos entre entradas (~2 s no início, 1,6 s no fim)
 vel:w=>(2.2+w*.16)*.8,                      // velocidade base (palavras: 2,2 + onda×0,35)
 ramp:.008,                                  // aceleração dentro da onda (palavras: .015)
 bossEvery:5,                                // chefe a cada 5 ondas, com runa ancestral
 bossHp:w=>2+Math.floor(w/10),
 bossTime:n=>7+n*2.5,                        // segundos por runa do chefe (×1,6 no celular)
 chainFrom:14,chainChance:.12,               // correntes de 2 formas só nas ondas altas
 bias:.68                                    // viés do reconhecedor para a forma esperada (mais tolerante)
};
const RUNE_EL_COLOR={raio:'#ffe14a',gelo:'#6ad8ff',fogo:'#ff7a3a',arcano:'#c98aff'};
const RUNE_SHAPES=(()=>{
 const arc=(cx,cy,rx,ry,a0,a1,n=16)=>Array.from({length:n+1},(_,i)=>{const a=(a0+(a1-a0)*i/n)*Math.PI/180;return[cx+Math.cos(a)*rx,cy+Math.sin(a)*ry]});
 const wave=(n=24)=>Array.from({length:n+1},(_,i)=>[i/n*100,50-24*Math.sin(i/n*Math.PI*2)]);
 const lemn=(n=40)=>Array.from({length:n+1},(_,i)=>{const t=i/n*Math.PI*2,d=1+Math.sin(t)**2;return[50+48*Math.cos(t)/d,50+48*Math.sin(t)*Math.cos(t)/d]});
 const spiral=(n=40)=>Array.from({length:n+1},(_,i)=>{const k=i/n,a=k*Math.PI*5,r=4+k*46;return[50+Math.cos(a)*r,50+Math.sin(a)*r]});
 const S=(id,code,fam,glyph,name,strokes,o)=>Object.assign({id,code,fam,glyph,name,strokes},o||{});
 return[
  // 🟢 Família 1 — linhas retas e orientações
  S('hline','a','lines','—','Linha Horizontal',[[[0,50],[100,50]]],{line:0}),
  S('vline','b','lines','|','Linha Vertical',[[[50,0],[50,100]]],{line:90}),
  S('rise','c','lines','/','Diagonal Crescente',[[[0,100],[100,0]]],{line:45}),
  S('fall','d','lines','\\','Diagonal Decrescente',[[[0,0],[100,100]]],{line:135}),
  S('dbl','e','lines','‖','Linha Dupla Paralela',[[[25,0],[25,100]],[[75,0],[75,100]]],{pair:'par'}),
  S('plus','f','lines','+','Linha Cruzada',[[[50,0],[50,100]],[[0,50],[100,50]]],{pair:'plus'}),
  S('cross','g','lines','×','Cruz Diagonal',[[[0,0],[100,100]],[[100,0],[0,100]]],{pair:'x'}),
  // 🟡 Família 2 — ângulos e traços duplos
  S('vee','h','angles','v','Ângulo V',[[[0,0],[50,100],[100,0]]]),
  S('caret','i','angles','^','V Invertido (Cadeado)',[[[0,100],[50,0],[100,100]]]),
  S('less','j','angles','<','Ângulo Lateral Esquerdo',[[[100,0],[0,50],[100,100]]]),
  S('more','k','angles','>','Ângulo Lateral Direito',[[[0,0],[100,50],[0,100]]]),
  S('step','l','angles','└','Degrau / Canto Reto',[[[0,0],[0,100],[100,100]]]),
  S('corner','m','angles','┐','Canto Superior',[[[0,0],[100,0],[100,100]]]),
  S('zzn','n','angles','N','Zigue-Zague Simples',[[[0,100],[0,0],[100,100],[100,0]]]),
  S('zzz','o','angles','Z','Zigue-Zague Invertido',[[[0,0],[100,0],[0,100],[100,100]]]),
  S('bolt','p','angles','⚡','Raio (3 traços)',[[[70,0],[25,52],[75,48],[30,100]]]),
  // 🔵 Família 3 — curvas e arcos
  S('lparen','q','curves','(','Arco Côncavo',[arc(95,50,75,50,120,240)]),
  S('rparen','r','curves',')','Arco Convexo',[arc(5,50,75,50,-60,60)]),
  S('cup','s','curves','U','Semicírculo Inferior',[arc(50,25,48,75,0,180)]),
  S('dome','t','curves','∩','Domo',[arc(50,75,48,75,180,360)]),
  S('tilde','u','curves','~','Onda Suave',[wave()]),
  S('ess','v','curves','S','Curva Dupla',[[[90,12],[70,0],[30,0],[8,14],[10,36],[35,48],[66,53],[92,66],[92,88],[70,100],[30,100],[8,88]]]),
  S('moon','w','curves','☾','Meia-Lua',[arc(60,50,48,50,60,300,18).concat(arc(78,50,32,40,270,90,12))]),
  // 🟣 Família 4 — formas fechadas e geometria
  S('circle','x','closed','○','Círculo',[arc(50,50,50,50,-90,270,24)]),
  S('tri','y','closed','Δ','Triângulo',[[[50,0],[100,100],[0,100],[50,0]]]),
  S('itri','z','closed','∇','Triângulo Invertido',[[[0,0],[100,0],[50,100],[0,0]]]),
  S('square','0','closed','□','Quadrado',[[[0,0],[100,0],[100,100],[0,100],[0,0]]]),
  S('diamond','1','closed','◇','Losango',[[[50,0],[100,50],[50,100],[0,50],[50,0]]]),
  S('oval','2','closed','⬭','Laço / Oval',[arc(50,50,50,26,-90,270,24)]),
  // 🔴 Família 5 — loops e nós arcanos
  S('alpha','3','loops','α','Loop Alpha',[[[100,15],[72,55],[52,78],[28,86],[8,70],[8,42],[28,26],[52,34],[74,64],[100,92]]]),
  S('inf','4','loops','∞','Infinito',[lemn()]),
  S('drop','5','loops','💧','Gota',[[[50,0]].concat(arc(50,66,34,34,-60,240,18)).concat([[50,0]])]),
  S('fish','6','loops','∝','Laço Cruzado / Peixe',[[[0,15],[28,55],[48,78],[72,86],[92,70],[92,42],[72,26],[48,34],[26,64],[0,92]]]),
  S('spiral','7','loops','🌀','Espiral',[spiral()]),
  S('bow','8','loops','🎀','Laço de Nó Superior',[[[15,100],[45,48]].concat(arc(50,28,22,22,110,470,18)).concat([[85,100]])])
 ];
})();
const RUNE_BY_ID={},RUNE_BY_CODE={};for(const s of RUNE_SHAPES){RUNE_BY_ID[s.id]=s;RUNE_BY_CODE[s.code]=s}
// 👑 Família 6 — runas compostas ancestrais (cadeia de 2 formas; usadas pelos chefes e por elites nas ondas altas)
const RUNE_COMBOS=[
 {id:'storm',   seq:['vline','bolt'],    el:'raio'},   // Runa da Tempestade  | + ⚡
 {id:'ward',    seq:['circle','plus'],   el:'gelo'},   // Runa da Proteção    ○ + +
 {id:'arcfire', seq:['tri','vee'],       el:'fogo'},   // Fogo Arcano         Δ + v
 {id:'abyss',   seq:['inf','vline'],     el:'arcano'}, // Abismo              ∞ + |
 {id:'star4',   seq:['plus','cross'],    el:'raio'},   // Estrela de 4 Pontas + + ×
 {id:'tide',    seq:['tilde','moon'],    el:'gelo'},   // Maré Lunar          ~ + ☾
 {id:'eclipse', seq:['circle','moon'],   el:'arcano'}, // Eclipse             ○ + ☾
 {id:'bulwark', seq:['square','hline'],  el:'gelo'},   // Muralha             □ + —
 {id:'crown',   seq:['dome','caret'],    el:'fogo'},   // Coroa Solar         ∩ + ^
 {id:'serpent', seq:['ess','tilde'],     el:'raio'},   // Serpente            S + ~
 {id:'crystal', seq:['diamond','vline'], el:'gelo'},   // Cristal             ◇ + |
 {id:'vortex',  seq:['spiral','circle'], el:'arcano'}, // Vórtice            🌀 + ○
 {id:'arrow',   seq:['more','hline'],    el:'raio'},   // Flecha              > + —
 {id:'phoenix', seq:['drop','tri'],      el:'fogo'},   // Lágrima de Fênix   💧 + Δ
 {id:'fate',    seq:['bow','inf'],       el:'arcano'}, // Laço do Destino    🎀 + ∞
 {id:'throne',  seq:['itri','step'],     el:'fogo'}    // Trono               ∇ + └
];
for(const r of RUNE_COMBOS)r.code=r.seq.map(id=>RUNE_BY_ID[id].code).join('');

// ================== 👕 COLEÇÃO: cosméticos, raridades e baús ==================
// Tiers: chance no baú (soma 100), faixa de bônus de XP, cor de borda/brilho e Aura dada se o item sorteado já for seu.
const ITEM_TIERS={
 common:   {ic:'⚪',col:'#c8d0e8',chance:70,xp:[1,2],  dup:60},
 rare:     {ic:'🔵',col:'#4aa8ff',chance:20,xp:[3,5],  dup:150},
 epic:     {ic:'🟣',col:'#b06aff',chance:8, xp:[6,9],  dup:350},   // + brilho suave no mago
 legendary:{ic:'🟡',col:'#ffc83a',chance:2, xp:[10,15],dup:900}    // + partículas especiais ao lançar feitiços
};
const ITEM_CATS=['hat','cape','staff','aura'];
// xp = bônus de XP (%) · aura = bônus de Aura ganha (%) · v = parâmetros visuais aplicados ao mago (retrato e torre)
const COSMETICS=[
 // 🎩 Chapéus (cone = cônico com aba · crown = coroa)
 {id:'h_navy',    cat:'hat',  tier:'common',   ic:'🎩',xp:1, aura:0,v:{style:'cone',c1:'#2f4f9a',c2:'#14244d',band:'#e8b86a'}},
 {id:'h_forest',  cat:'hat',  tier:'common',   ic:'🎩',xp:2, aura:0,v:{style:'cone',c1:'#2f7a4a',c2:'#123a1e',band:'#e8d06a'}},
 {id:'h_crimson', cat:'hat',  tier:'rare',     ic:'🎩',xp:3, aura:0,v:{style:'cone',c1:'#b02a3a',c2:'#4a0c14',band:'#ffd98a'}},
 {id:'h_starry',  cat:'hat',  tier:'rare',     ic:'🎩',xp:5, aura:0,v:{style:'cone',c1:'#5a2c94',c2:'#1e0c3a',band:'#c9a6ff',stars:true}},
 {id:'h_crown',   cat:'hat',  tier:'epic',     ic:'👑',xp:7, aura:1,v:{style:'crown',c1:'#ffd24a',c2:'#b8860b',gem:'#ff4a6a'}},
 {id:'h_cosmos',  cat:'hat',  tier:'legendary',ic:'🌌',xp:12,aura:2,v:{style:'cone',c1:'#1a1a5a',c2:'#05051a',band:'#ffd98a',stars:true,glow:'#9ad8ff'}},
 // 🧥 Capas (cores do manto)
 {id:'c_wool',    cat:'cape', tier:'common',   ic:'🧥',xp:1, aura:0,v:{robe:'#8a5a3a',robeDark:'#3a2414'}},
 {id:'c_sky',     cat:'cape', tier:'common',   ic:'🧥',xp:2, aura:0,v:{robe:'#4a8ad0',robeDark:'#1a3a6a'}},
 {id:'c_royal',   cat:'cape', tier:'rare',     ic:'🧥',xp:4, aura:0,v:{robe:'#6a2aa8',robeDark:'#2a0c4a'}},
 {id:'c_ember',   cat:'cape', tier:'rare',     ic:'🧥',xp:4, aura:0,v:{robe:'#c0381a',robeDark:'#4a1006'}},
 {id:'c_frost',   cat:'cape', tier:'epic',     ic:'❄️',xp:8, aura:1,v:{robe:'#d8f0ff',robeDark:'#5a8ab0'}},
 {id:'c_aurora',  cat:'cape', tier:'legendary',ic:'🌈',xp:13,aura:2,v:{robe:'#2ad0b0',robeDark:'#3a1a7a'}},
 // 🔱 Cajados (cor do cristal — também colore os feitiços quando a cor de feitiço é a padrão)
 {id:'s_oak',     cat:'staff',tier:'common',   ic:'🔱',xp:1, aura:0,v:{gem:'#9ad8ff'}},
 {id:'s_moss',    cat:'staff',tier:'common',   ic:'🔱',xp:2, aura:0,v:{gem:'#6aff9a'}},
 {id:'s_ruby',    cat:'staff',tier:'rare',     ic:'🔱',xp:3, aura:0,v:{gem:'#ff4a6a'}},
 {id:'s_amethyst',cat:'staff',tier:'rare',     ic:'🔱',xp:5, aura:0,v:{gem:'#c07aff'}},
 {id:'s_sun',     cat:'staff',tier:'epic',     ic:'☀️',xp:7, aura:1,v:{gem:'#ffd24a'}},
 {id:'s_void',    cat:'staff',tier:'legendary',ic:'🔮',xp:15,aura:2,v:{gem:'#ff3ad8'}},
 // 🌟 Auras (brilho ao redor do mago; dão bônus de Aura)
 {id:'a_spark',   cat:'aura', tier:'common',   ic:'✨',xp:0, aura:1,v:{col:'#e8ecff'}},
 {id:'a_ember',   cat:'aura', tier:'common',   ic:'🔥',xp:1, aura:1,v:{col:'#ff8a3a'}},
 {id:'a_frost',   cat:'aura', tier:'rare',     ic:'💠',xp:3, aura:2,v:{col:'#6ad8ff'}},
 {id:'a_bloom',   cat:'aura', tier:'rare',     ic:'🌸',xp:4, aura:2,v:{col:'#ff9ad8'}},
 {id:'a_storm',   cat:'aura', tier:'epic',     ic:'⚡',xp:6, aura:3,v:{col:'#ffe14a'}},
 {id:'a_phoenix', cat:'aura', tier:'legendary',ic:'🌅',xp:10,aura:5,v:{col:'#ffb03a',motes:true}}
];
const ITEM_BY_ID={};for(const it of COSMETICS)ITEM_BY_ID[it.id]=it;
// Baú: SEMPRE 3 recompensas — Aura (moedas), XP e 1 cosmético sorteado pelo tier
// ================== 🏛️ VILA DOS MAGOS (meta-game de reconstrução) ==================
// Santuário = nível do Reino (limita os outros prédios). Custos em Aura crescem ×1,55 por nível.
// Efeitos por nível (lv) e por habitante alocado (cada animal na obra soma +25% do efeito daquele prédio):
//  mine   → Aura por hora (acumula offline até o limite do armazém)
//  lab    → +XP% e +Mana% nas partidas
//  forge  → +corações na torre (a cada 3 níveis) — a barreira aguenta mais
//  tavern → vagas de trabalho para os magos desbloqueados
const VILLAGE={
 maxSanct:10,
 buildings:[
  {id:'sanct', ic:'🏛️',base:300,max:10},
  {id:'mine',  ic:'💎',base:120,max:10},
  {id:'lab',   ic:'⚗️',base:180,max:10},
  {id:'forge', ic:'⚒️',base:220,max:9},
  {id:'tavern',ic:'🍺',base:150,max:4}
 ],
 mineRate:lv=>lv?25+lv*20:0,          // Aura/hora
 mineCap:lv=>lv?Math.round((25+lv*20)*8):0, // armazém: 8 h de produção
 labXp:lv=>lv*2,labMana:lv=>lv*4,       // %
 forgeLives:lv=>Math.floor(lv/3),       // +1 ❤ nos níveis 3, 6 e 9
 workerBoost:.25,
 names:['Santuário de Eldoria','Bastião de Lúmen','Refúgio de Arcania','Cidadela das Runas','Vale de Astravel','Torre de Myrrdin','Clareira de Sylvar','Baluarte Estelar'],
 titles:['apprentice','keeper','protector','warden','archlord'] // por faixa de nível do Santuário
};
// 🎁 baús da partida: 1 baú para cada marco de onda alcançado (além do baú de cada nível novo)
const MATCH_CHEST_WAVES=[3,8,15];
const CHEST_DROPS={aura:[100,400],xp:lv=>[60+lv*12,120+lv*20]};
// 🎁 RARIDADES DOS BAÚS — sorteadas NA ABERTURA (surpresa). chance soma 100.
// aura = faixa de Aura · xp = multiplicador do XP base do nível · items = pesos do tier do cosmético (comum/raro/épico/lendário)
// Média de Aura ≈ 260 (igual à de antes): a novidade é a emoção, não inflar a economia.
const CHEST_RARITIES=[
 {id:'common',   chance:40,col:'#b8a48c',aura:[80,180],  xp:1,  items:{common:82,rare:15,epic:3,legendary:0}},
 {id:'uncommon', chance:25,col:'#e8935a',aura:[140,260], xp:1.2,items:{common:68,rare:25,epic:6,legendary:1}},
 {id:'rare',     chance:15,col:'#8ec8ff',aura:[200,380], xp:1.4,items:{common:50,rare:36,epic:12,legendary:2}},
 {id:'special',  chance:9, col:'#3ee6a0',aura:[300,520], xp:1.7,items:{common:30,rare:44,epic:21,legendary:5}},
 {id:'strange',  chance:6, col:'#b46aff',aura:[420,700], xp:2,  items:{common:15,rare:42,epic:33,legendary:10}},
 {id:'legendary',chance:4, col:'#ffc83a',aura:[600,1000],xp:2.5,items:{common:0,rare:30,epic:45,legendary:25}},
 {id:'unique',   chance:1, col:'#ff8ad8',aura:[1000,1600],xp:3, items:{common:0,rare:0,epic:50,legendary:50}}
];
const CHEST_RAR_BY_ID={};for(const r of CHEST_RARITIES)CHEST_RAR_BY_ID[r.id]=r;

// Duelo PVC
const DUEL_LEVELS=[
 {id:'aprendiz',ic:'🧙',wpm:30,err:.06,tiers:['s','s','m'],xp:150,aura:[20,-5],base:'coelho',robe:'#4a3a7a',robeDark:'#221a3c',color:'#9a8aff'},
 {id:'mestre',ic:'🧙‍♂️',wpm:70,err:.04,tiers:['s','m','m'],xp:250,aura:[50,-15],base:'raposa',robe:'#5a1a2a',robeDark:'#2a0a12',color:'#ff5a7a'},
 {id:'arquimago',ic:'👑',wpm:100,err:.025,tiers:['m','m','l'],xp:400,aura:[100,-30],base:'coruja',robe:'#1a1a2a',robeDark:'#08080e',color:'#ff2a4a'}
];

// Ranking global mockado (offline)
const LEADERBOARD=[
 {nick:'ZephyrTheSwift',ic:'🦅',score:48210,wpm:128,wave:21,aura:4820,fl:'🇺🇸'},
 {nick:'LunaRunas',ic:'🌙',score:41980,wpm:117,wave:19,aura:3960,fl:'🇧🇷'},
 {nick:'KitsuneKai',ic:'🦊',score:36450,wpm:109,wave:18,aura:3410,fl:'🇯🇵'},
 {nick:'ElMagoVeloz',ic:'🔥',score:30120,wpm:101,wave:16,aura:2875,fl:'🇪🇸'},
 {nick:'OwlMaster',ic:'🦉',score:25890,wpm:94,wave:15,aura:2240,fl:'🇬🇧'},
 {nick:'Pixel_Bruxa',ic:'🧹',score:21340,wpm:86,wave:13,aura:1690,fl:'🇧🇷'},
 {nick:'TeclaFantasma',ic:'👻',score:17650,wpm:79,wave:12,aura:1180,fl:'🇵🇹'},
 {nick:'StarKeys',ic:'⭐',score:13920,wpm:71,wave:10,aura:760,fl:'🇨🇦'},
 {nick:'CoelhoArcano',ic:'🐰',score:9870,wpm:62,wave:8,aura:415,fl:'🇲🇽'},
 {nick:'NovatoMistico',ic:'🌱',score:5430,wpm:48,wave:6,aura:120,fl:'🇦🇷'}
];


// Jukebox: estilos de trilha disponíveis
const MUSIC_STYLES=[
 {id:'dynamic',ic:'⚡',bpm:'80–160',rec:true},{id:'marcha',ic:'🎺',bpm:'136+'},{id:'taverna',ic:'🎻',bpm:'~80'},
 {id:'velen',ic:'⚔️',bpm:'135+'},{id:'floresta',ic:'🌲',bpm:'~66'}
];
