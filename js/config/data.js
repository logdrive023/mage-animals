// Mage Animals — Dados do jogo: personagens, magias, inimigos, biomas, idiomas, palavras, missões, ranking e recompensas.
'use strict';

const CHARS=[
 {id:'gato',name:'GATO',emoji:'🐱',spell:'cometa',color:'#5ad0ff',robe:'#26427f',robeDark:'#0f1b3d',fur:'#d6ac7c',lives:3,unlock:0},
 {id:'coelho',name:'COELHO',emoji:'🐰',spell:'raio',color:'#c07aff',robe:'#5e2c94',robeDark:'#2a1248',fur:'#f7d9e4',lives:3,unlock:3},
 {id:'raposa',name:'RAPOSA',emoji:'🦊',spell:'explosao',color:'#ff4a3a',robe:'#a8222e',robeDark:'#4a0c14',fur:'#ea6c2c',lives:3,unlock:5},
 {id:'coruja',name:'CORUJA',emoji:'🦉',spell:'vortice',color:'#ffc23a',robe:'#2f6e40',robeDark:'#123a1e',fur:'#7a5638',lives:4,unlock:7}
];
CHARS.forEach((c,i)=>c.lvl=[1,2,4,6][i]);

const SPELLS=[
 {id:'cometa',ic:'☄️',c:'#5ad0ff'},{id:'explosao',ic:'💥',c:'#ff8a3a'},{id:'raio',ic:'⚡',c:'#b9e6ff'},
 {id:'vortice',ic:'🌀',c:'#4dffa0'},{id:'meteoros',ic:'🌠',c:'#d77bff'}
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
// e = fácil (ondas 1–3: 3–5 letras, SEM acento/ç) · s 3–4 · m 5–7 · l 8+ · b = chefe (6–9 letras)
const POOL={e:[],s:[],m:[],l:[],b:[]};
function buildPools(lang){
 POOL.e.length=POOL.b.length=0;
 (WORD_BANK[lang]||WORD_BANK.pt).normalize('NFC').split(' ').forEach(w=>{const plain=w.normalize('NFD').replace(/[̀-ͯ]/g,''),n=plain.length;
  if(n>=3&&n<=5&&plain===w&&/^[a-z]+$/.test(w))POOL.e.push(w);if(n>=6&&n<=9)POOL.b.push(w)});
 POOL.s.length=POOL.m.length=POOL.l.length=0;
 (WORD_BANK[lang]||WORD_BANK.pt).normalize('NFC').split(' ').forEach(w=>{const n=w.normalize('NFD').replace(/[̀-ͯ]/g,'').length;
  if(n>=3&&n<=4)POOL.s.push(w);else if(n>=5&&n<=7)POOL.m.push(w);else if(n>=8)POOL.l.push(w)});
}

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
 {id:'time1h',ic:'⏱️',stat:'totalTime',goal:3600,reward:{xp:250},fmt:'time'}
];

// Missões diárias (reset à meia-noite local) e semanais (reset na segunda-feira)
// tone = cor do orbe do ícone (fire = PVC, blue = digitação, green = bioma, gold = chefes, violet = aura)
const QUESTS={
 daily:[
  {id:'d_words',ic:'✍️',tone:'blue',stat:'words',goal:200,reward:{xp:150}},
  {id:'d_duel',ic:'⚔️',tone:'fire',stat:'duelWins',goal:1,reward:{xp:200,aura:30}},
  {id:'d_zombie',ic:'🧟',tone:'green',stat:'zombieWave',goal:5,reward:{xp:100,title:'Caçador de Zumbis'}}
 ],
 weekly:[
  {id:'w_words',ic:'📖',tone:'blue',stat:'words',goal:1500,reward:{xp:400,aura:80}},
  {id:'w_duels',ic:'🏆',tone:'fire',stat:'duelWins',goal:5,reward:{aura:150}},
  {id:'w_boss',ic:'👑',tone:'gold',stat:'bosses',goal:50,reward:{xp:1000,border:'abissal'}}
 ]
};

// Calendário de login de 7 dias
// Ofensiva de 7 dias: recompensas crescentes; o Dia 7 é o Baú Arcano Lendário
const LOGIN_REWARDS=[{aura:50},{xp:100},{aura:80},{xp:150,avatar:'🧚'},{aura:120},{xp:250},{xp:400,aura:250,color:'aurora'}];
// Passe semanal: concluir N missões (diárias ou semanais) na semana abre o Baú Semanal de Aura
const WEEKLY_CHEST={goal:5,reward:{xp:500,aura:300}};

// 🏰 Skins da torre (cosmético): índice = tema da torre; desbloqueio por nível. -1 = automática (segue o bioma)
const TOWER_SKINS=[{ti:0,l:1},{ti:1,l:3},{ti:2,l:5},{ti:3,l:8},{ti:4,l:11}];

// Padrões de jogabilidade/acessibilidade (sobrescritos pelo que o jogador salvar no localStorage)
const GAME_DEFAULTS={strictAccents:true}; // true = DRAGÃO exige "ã"; false = "dragao" também vale

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
