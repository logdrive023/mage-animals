// Mage Animals — Internacionalização (i18n): dicionário único e aninhado por idioma.
// Uso: t('caminho.da.chave', {variavel}) · fallback automático para 'pt-BR' · trocar idioma: setLang('en').
// Para adicionar um idioma: copie o bloco 'en', traduza, e inclua-o em LANGS (+ uma lista em WORD_BANK, data.js).
'use strict';

const LANGS=[{id:'pt-BR',fl:'PT',n:'Português',words:'pt'},{id:'en',fl:'EN',n:'English',words:'en'},{id:'es',fl:'ES',n:'Español',words:'es'}];
const FALLBACK_LANG='pt-BR';

const TRANSLATIONS={
 "pt-BR": {
  "intro": {
   "desc": "Um jogo de digitação inspirado nos clássicos arcade como Asteroids. Você é um animal mágico no topo de uma torre e precisa digitar palavras rapidamente para lançar feitiços e destruir os inimigos que se aproximam!",
   "tip1": "Digite para lançar feitiços",
   "tip2": "Derrote inimigos e sobreviva",
   "tip3": "Evolua, desbloqueie magias e novos personagens"
  },
  "controls": {
   "title": "CONTROLES",
   "type": "Digita a palavra do inimigo",
   "back": "Troca de alvo",
   "space": "Meteoros (mana cheia)",
   "esc": "Pausar",
   "f2": "Música on/off",
   "spaceKey": "Espaço"
  },
  "hud": {
   "record": "RECORDE",
   "points": "PONTOS",
   "wave": "ONDA",
   "wpm": "WPM",
   "lives": "VIDAS",
   "precision": "PRECISÃO",
   "total": "Total",
   "combo": "COMBO",
   "inRow": "seguidos",
   "speed": "VEL",
   "enemies": "INIMIGOS",
   "bossWarn": "⚠ UM CHEFE SE APROXIMA ⚠",
   "meteors": "METEOROS!"
  },
  "sections": {
   "concept": "CONCEITO VISUAL",
   "characters": "PERSONAGENS",
   "spells": "MAGIAS",
   "enemies": "INIMIGOS"
  },
  "music": {
   "on": "🎵 MÚSICA ON",
   "off": "🔇 MÚSICA OFF",
   "audio": "ÁUDIO",
   "music": "🎵 Música",
   "effects": "🔊 Efeitos",
   "tip": "♪ A trilha muda de versão conforme seu desempenho (Marcha → Avanço → Batalha → Épica) e fica Hesitante quando você erra.",
   "jukebox": "JUKEBOX MÁGICO",
   "nowPlaying": "Tocando agora",
   "recommended": "Recomendado",
   "mixer": "VOLUME",
   "missFx": "🎯 Ao errar uma letra, a música desafina e abafa por um instante — feedback de falha mágica.",
   "modes": {
    "MUDO": "MUDO",
    "MARCHA": "MARCHA",
    "AVANÇO": "AVANÇO",
    "BATALHA": "BATALHA",
    "ÉPICA": "ÉPICA",
    "HESITANTE": "HESITANTE",
    "TAVERNA": "TAVERNA",
    "VELEN": "VELEN",
    "FLORESTA": "FLORESTA"
   }
  },
  "nav": {
   "missions": "MISSÕES",
   "duel": "DUELO",
   "ranking": "RANKING",
   "profileButton": "⚙ PERFIL & RECOMPENSAS",
   "profile": "Perfil & Cosméticos",
   "stats": "Estatísticas & Conquistas",
   "characters": "Personagens",
   "audio": "Santuário de Música"
  },
  "menu": {
   "hello": "Olá",
   "level": "Nível",
   "choose": "ESCOLHA SEU MAGO",
   "biome": "BIOMA",
   "help": "Digite a palavra de cada inimigo para lançar seu feitiço antes que ele alcance a torre!"
  },
  "ui": {
   "play": "JOGAR",
   "orEnter": "ou pressione ENTER",
   "pause": "PAUSADO",
   "resumeShort": "CONTINUAR",
   "resume": "CONTINUAR",
   "restart": "REINICIAR PARTIDA",
   "menu": "SAIR PARA O MENU",
   "ok": "OK",
   "vs": "VS",
   "lvl": "Nv",
   "xp": "XP",
   "bpm": "BPM",
   "defaultNick": "Mago"
  },
  "pause": {
   "resumeHint": "ENTER ou ESC para voltar",
   "score": "Pontuação",
   "wave": "Onda",
   "wpm": "WPM",
   "acc": "Precisão",
   "combo": "Combo / Maior",
   "lives": "Vidas",
   "hp": "Sua vida",
   "bot": "Oponente",
   "hint": "ENTER ou ESC continua · R reinicia · M sai para o menu",
   "quitNote": "Reiniciar ou sair descarta a partida atual (sem XP)."
  },
  "results": {
   "gameOver": "FIM DE JOGO",
   "newRecord": "🏆 NOVO RECORDE!",
   "again": "JOGAR DE NOVO",
   "menu": "MENU",
   "xpScore": "Pontuação × 0,1",
   "xpWords": "Palavras ({n} × 5)",
   "xpWave": "Onda alcançada ({n} × 50)",
   "xpBonusOk": "Bônus de precisão (+20%)",
   "xpBonusNo": "Bônus de precisão (precisa > 95%)",
   "fastest": "PALAVRAS MAIS RÁPIDAS",
   "time": "TEMPO",
   "maxWpmWord": "⚡ WPM máximo em uma palavra",
   "levelUp": "LEVEL UP!",
   "reachedLevel": "Você alcançou o Nível {n}"
  },
  "profile": {
   "title": "PERFIL DO MAGO",
   "welcome": "BEM-VINDO, MAGO!",
   "saveClose": "SALVAR E FECHAR",
   "startPlay": "COMEÇAR A JOGAR",
   "nick": "NICKNAME DO MAGO",
   "titles": "TÍTULOS",
   "avatar": "AVATAR",
   "border": "BORDA DO PERFIL",
   "spellColor": "COR DO FEITIÇO"
  },
  "stats": {
   "kills": "Inimigos Derrotados",
   "words": "Palavras Digitadas",
   "wpm": "WPM Máximo",
   "acc": "Precisão Média",
   "record": "Recorde",
   "xp": "XP Total",
   "time": "Tempo de Jogo",
   "games": "Partidas",
   "bosses": "chefes",
   "topSpeed": "velocidade histórica",
   "maxWave": "onda máxima",
   "achievements": "CONQUISTAS",
   "claimedN": "resgatadas",
   "claim": "RESGATAR",
   "claimed": "✔ RESGATADO"
  },
  "settings": {
   "on": "LIGADA",
   "off": "DESLIGADA",
   "language": "IDIOMA",
   "graphics": "GRÁFICOS",
   "quality": {
    "auto": "Auto",
    "high": "Alta",
    "low": "Leve"
   },
   "showFps": "Mostrar FPS",
   "general": "GERAL"
  },
  "charUi": {
   "active": "PERSONAGEM ATIVO",
   "equipped": "✔ EQUIPADO",
   "locked": "Bloqueado",
   "unlockReq": "Onda {w} ou Nv {l}",
   "conquest": "🏅 Conquista"
  },
  "missions": {
   "title": "MISSÕES & RECOMPENSAS",
   "daily": "Diárias",
   "weekly": "Semanais",
   "login": "Login Diário",
   "resetsIn": "Renova em {t}",
   "day": "Dia",
   "today": "HOJE",
   "collect": "COLETAR",
   "collected": "✔ COLETADO",
   "comeBack": "Volte amanhã",
   "loginTitle": "RECOMPENSA DIÁRIA",
   "streak": "Sequência de {n} dia(s)"
  },
  "quests": {
   "d_words": "Digite 200 palavras hoje",
   "d_duel": "Vença 1 Duelo PVC",
   "d_zombie": "Alcance a Onda 5 no bioma Zumbi",
   "w_boss": "Derrote 50 Chefes na semana"
  },
  "duel": {
   "title": "DUELO DE MAGOS",
   "pick": "Escolha seu oponente",
   "help": "Digite as palavras para atacar. Combos aumentam o dano. Quem zerar a vida do outro primeiro vence!",
   "levels": {
    "aprendiz": "Aprendiz",
    "mestre": "Mestre",
    "arquimago": "Arquimago"
   },
   "fight": "DUELAR",
   "victory": "VITÓRIA!",
   "defeat": "DERROTA",
   "rematch": "REVANCHE",
   "you": "VOCÊ",
   "dmg": "dano",
   "wins": "Vitórias"
  },
  "ranking": {
   "title": "RANKING GLOBAL",
   "byScore": "Pontuação",
   "byWpm": "WPM",
   "note": "Ranking offline: supere os magos para assumir a posição deles.",
   "you": "Sua posição",
   "up": "🏆 Ranking: você subiu para #{n}!"
  },
  "biomes": {
   "cosmic": {
    "name": "Ameaça Cósmica",
    "desc": "Meteoros e rochas"
   },
   "zombie": {
    "name": "Invasão Zumbi",
    "desc": "Zumbis fofos e fantasminhas de doce"
   },
   "ocean": {
    "name": "Abismo Marinho",
    "desc": "Águas-vivas e monstrinhos de bolha"
   }
  },
  "enemyTypes": {
   "rock": "Comum",
   "crystal": "Resistente",
   "ghost": "Rápido",
   "boss": "Muito Forte"
  },
  "enemies": {
   "rock": "ROCHA",
   "crystal": "CRISTAL",
   "ghost": "FANTASMA",
   "meteor": "CHEFE",
   "zombie": "ZUMBI",
   "tomb": "LÁPIDE",
   "candy": "DOCINHO",
   "pumpkin": "REI ABÓBORA",
   "bubble": "BOLHA",
   "urchin": "OURIÇO",
   "jelly": "ÁGUA-VIVA",
   "octo": "POLVÃO"
  },
  "characters": {
   "gato": {
    "trait": "Equilibrado",
    "desc": "<b>Cometa</b> — feitiço certeiro. Passiva: <b>+10% de pontos</b>.",
    "name": "GATO"
   },
   "coelho": {
    "trait": "Rápido",
    "desc": "<b>Raio</b> — relâmpago instantâneo. Passiva: inimigos <b>15% mais lentos</b>.",
    "name": "COELHO"
   },
   "raposa": {
    "trait": "Poderoso",
    "desc": "<b>Explosão</b> — dano em área nos <b>inimigos próximos</b>.",
    "name": "RAPOSA"
   },
   "coruja": {
    "trait": "Precisão",
    "desc": "<b>Vórtice</b> — <b>+1 vida</b> e erros <b>não quebram o combo</b>.",
    "name": "CORUJA"
   }
  },
  "spells": {
   "cometa": {
    "name": "COMETA",
    "sub": "Rápido"
   },
   "explosao": {
    "name": "EXPLOSÃO",
    "sub": "Área"
   },
   "raio": {
    "name": "RAIO",
    "sub": "Reto"
   },
   "vortice": {
    "name": "VÓRTICE",
    "sub": "Preciso"
   },
   "meteoros": {
    "name": "METEOROS",
    "sub": "Espaço",
    "tip": "🌠 <b>Meteoros</b>: com a mana cheia, aperte <kbd>Espaço</kbd> para atingir todos os inimigos."
   }
  },
  "achievements": {
   "words500": {
    "name": "Escriba Arcano",
    "desc": "Digite 500 palavras"
   },
   "wpm60": {
    "name": "Dedos de Fogo",
    "desc": "Alcance 60 WPM em uma partida"
   },
   "boss50": {
    "name": "Caçador de Chefes",
    "desc": "Derrote 50 Chefes"
   },
   "kills1000": {
    "name": "Exterminador",
    "desc": "Derrote 1.000 inimigos"
   },
   "wave10": {
    "name": "Guardião da Torre",
    "desc": "Alcance a onda 10"
   },
   "games10": {
    "name": "Mago Dedicado",
    "desc": "Jogue 10 partidas"
   },
   "acc98": {
    "name": "Olho de Coruja",
    "desc": "Termine uma partida com 98% de precisão (mín. 50 palavras)"
   },
   "time1h": {
    "name": "Maratonista Mágico",
    "desc": "Jogue 1 hora no total"
   }
  },
  "rewards": {
   "label": {
    "title": "Título",
    "color": "Cor",
    "border": "Borda",
    "avatar": "Avatar"
   },
   "achReady": "🏅 Conquista pronta: {n} (resgate no Perfil)",
   "questReady": "📅 Missão concluída: {n}",
   "newChar": "🐾 Personagem: {n}",
   "title": "🏷️ Título: {n}",
   "border": "🖼️ Borda: {n}",
   "color": "✨ Cor de feitiço: {n}",
   "avatar": "🎭 Avatar: {n}"
  },
  "musicTracks": {
   "dynamic": {
    "name": "Modo Dinâmico",
    "desc": "Calma no menu e no início → Marcha sob pressão → Batalha em ondas altas e chefes. Fica tensa quando você erra."
   },
   "marcha": {
    "name": "Marcha dos Arcanos",
    "desc": "A partitura original, com versões que reagem ao seu combo."
   },
   "taverna": {
    "name": "Taverna dos Arcanos",
    "desc": "Lofi medieval calmo: alaúde, flauta, batida abafada e lareira crepitando."
   },
   "velen": {
    "name": "Caçada em Velen",
    "desc": "Tambores de guerra, arpejos rápidos e rabeca. Acelera conforme o combo cresce."
   },
   "floresta": {
    "name": "Floresta Antiga",
    "desc": "Harpa, sinos, vento e pássaros. Atmosférico e místico."
   }
  },
  "meta": {
   "title": "Mage Animals — Digite para Lançar"
  },
  "titles": {
   "apprentice": "Aprendiz de Magia",
   "conjurer": "Conjurador Iniciante",
   "wordmaster": "Mestre das Palavras",
   "runesorcerer": "Feiticeiro das Runas",
   "archmage": "Arquimago Supremo",
   "legend": "Lenda Arcana",
   "firefingers": "Dedos de Fogo",
   "guardian": "Guardião da Torre",
   "zombiehunter": "Caçador de Zumbis",
   "duelchamp": "Campeão do Duelo"
  },
  "borders": {
   "bronze": "Bronze",
   "prata": "Prata",
   "ouro": "Ouro",
   "arcana": "Arcana",
   "cosmica": "Cósmica",
   "abissal": "Abissal"
  },
  "colors": {
   "padrao": "Personagem",
   "ouro": "Dourado",
   "rubi": "Rubi",
   "esmeralda": "Esmeralda",
   "arcoiris": "Arco-íris",
   "chama": "Chama Arcana",
   "aurora": "Aurora"
  }
 },
 "en": {
  "intro": {
   "desc": "A typing game inspired by arcade classics like Asteroids. You are a magical animal atop a tower — type words fast to cast spells and destroy the enemies closing in!",
   "tip1": "Type to cast spells",
   "tip2": "Defeat enemies and survive",
   "tip3": "Level up, unlock spells and new characters"
  },
  "controls": {
   "title": "CONTROLS",
   "type": "Types the enemy word",
   "back": "Switch target",
   "space": "Meteors (full mana)",
   "esc": "Pause",
   "f2": "Music on/off",
   "spaceKey": "Space"
  },
  "hud": {
   "record": "BEST",
   "points": "SCORE",
   "wave": "WAVE",
   "wpm": "WPM",
   "lives": "LIVES",
   "precision": "ACCURACY",
   "total": "Total",
   "combo": "COMBO",
   "inRow": "in a row",
   "speed": "SPD",
   "enemies": "ENEMIES",
   "bossWarn": "⚠ A BOSS APPROACHES ⚠",
   "meteors": "METEORS!"
  },
  "sections": {
   "concept": "VISUAL CONCEPT",
   "characters": "CHARACTERS",
   "spells": "SPELLS",
   "enemies": "ENEMIES"
  },
  "music": {
   "on": "🎵 MUSIC ON",
   "off": "🔇 MUSIC OFF",
   "audio": "AUDIO",
   "music": "🎵 Music",
   "effects": "🔊 Effects",
   "tip": "♪ The soundtrack changes with your performance (March → Advance → Battle → Epic) and turns Hesitant when you miss.",
   "jukebox": "MAGIC JUKEBOX",
   "nowPlaying": "Now playing",
   "recommended": "Recommended",
   "mixer": "VOLUME",
   "missFx": "🎯 When you miss a letter, the music detunes and muffles for a moment — magic failure feedback.",
   "modes": {
    "MUDO": "MUTED",
    "MARCHA": "MARCH",
    "AVANÇO": "ADVANCE",
    "BATALHA": "BATTLE",
    "ÉPICA": "EPIC",
    "HESITANTE": "HESITANT",
    "TAVERNA": "TAVERN",
    "VELEN": "VELEN",
    "FLORESTA": "FOREST"
   }
  },
  "nav": {
   "missions": "QUESTS",
   "duel": "DUEL",
   "ranking": "RANKING",
   "profileButton": "⚙ PROFILE & REWARDS",
   "profile": "Profile & Cosmetics",
   "stats": "Stats & Achievements",
   "characters": "Characters",
   "audio": "Music Sanctuary"
  },
  "menu": {
   "hello": "Hi",
   "level": "Level",
   "choose": "CHOOSE YOUR MAGE",
   "biome": "BIOME",
   "help": "Type each enemy's word to cast your spell before it reaches the tower!"
  },
  "ui": {
   "play": "PLAY",
   "orEnter": "or press ENTER",
   "pause": "PAUSED",
   "resumeShort": "RESUME",
   "resume": "RESUME",
   "restart": "RESTART MATCH",
   "menu": "QUIT TO MENU",
   "ok": "OK",
   "vs": "VS",
   "lvl": "Lv",
   "xp": "XP",
   "bpm": "BPM",
   "defaultNick": "Mage"
  },
  "pause": {
   "resumeHint": "ENTER or ESC to return",
   "score": "Score",
   "wave": "Wave",
   "wpm": "WPM",
   "acc": "Accuracy",
   "combo": "Combo / Best",
   "lives": "Lives",
   "hp": "Your HP",
   "bot": "Opponent",
   "hint": "ENTER or ESC resumes · R restarts · M quits to menu",
   "quitNote": "Restarting or quitting discards the current match (no XP)."
  },
  "results": {
   "gameOver": "GAME OVER",
   "newRecord": "🏆 NEW RECORD!",
   "again": "PLAY AGAIN",
   "menu": "MENU",
   "xpScore": "Score × 0.1",
   "xpWords": "Words ({n} × 5)",
   "xpWave": "Wave reached ({n} × 50)",
   "xpBonusOk": "Accuracy bonus (+20%)",
   "xpBonusNo": "Accuracy bonus (needs > 95%)",
   "fastest": "FASTEST WORDS",
   "time": "TIME",
   "maxWpmWord": "⚡ Max WPM on a single word",
   "levelUp": "LEVEL UP!",
   "reachedLevel": "You reached Level {n}"
  },
  "profile": {
   "title": "MAGE PROFILE",
   "welcome": "WELCOME, MAGE!",
   "saveClose": "SAVE & CLOSE",
   "startPlay": "START PLAYING",
   "nick": "MAGE NICKNAME",
   "titles": "TITLES",
   "avatar": "AVATAR",
   "border": "PROFILE BORDER",
   "spellColor": "SPELL COLOR"
  },
  "stats": {
   "kills": "Enemies Defeated",
   "words": "Words Typed",
   "wpm": "Max WPM",
   "acc": "Average Accuracy",
   "record": "High Score",
   "xp": "Total XP",
   "time": "Play Time",
   "games": "Matches",
   "bosses": "bosses",
   "topSpeed": "all-time speed",
   "maxWave": "max wave",
   "achievements": "ACHIEVEMENTS",
   "claimedN": "claimed",
   "claim": "CLAIM",
   "claimed": "✔ CLAIMED"
  },
  "settings": {
   "on": "ON",
   "off": "OFF",
   "language": "LANGUAGE",
   "graphics": "GRAPHICS",
   "quality": {
    "auto": "Auto",
    "high": "High",
    "low": "Light"
   },
   "showFps": "Show FPS",
   "general": "GENERAL"
  },
  "charUi": {
   "active": "ACTIVE CHARACTER",
   "equipped": "✔ EQUIPPED",
   "locked": "Locked",
   "unlockReq": "Wave {w} or Lv {l}",
   "conquest": "🏅 Achievement"
  },
  "missions": {
   "title": "QUESTS & REWARDS",
   "daily": "Daily",
   "weekly": "Weekly",
   "login": "Daily Login",
   "resetsIn": "Resets in {t}",
   "day": "Day",
   "today": "TODAY",
   "collect": "COLLECT",
   "collected": "✔ COLLECTED",
   "comeBack": "Come back tomorrow",
   "loginTitle": "DAILY REWARD",
   "streak": "{n}-day streak"
  },
  "quests": {
   "d_words": "Type 200 words today",
   "d_duel": "Win 1 PVC Duel",
   "d_zombie": "Reach Wave 5 in the Zombie biome",
   "w_boss": "Defeat 50 Bosses this week"
  },
  "duel": {
   "title": "MAGE DUEL",
   "pick": "Choose your opponent",
   "help": "Type the words to attack. Combos increase damage. First to drop the other's life to zero wins!",
   "levels": {
    "aprendiz": "Apprentice",
    "mestre": "Master",
    "arquimago": "Archmage"
   },
   "fight": "DUEL",
   "victory": "VICTORY!",
   "defeat": "DEFEAT",
   "rematch": "REMATCH",
   "you": "YOU",
   "dmg": "dmg",
   "wins": "Wins"
  },
  "ranking": {
   "title": "GLOBAL RANKING",
   "byScore": "Score",
   "byWpm": "WPM",
   "note": "Offline ranking: beat the mages to take their spot.",
   "you": "Your position",
   "up": "🏆 Ranking: you climbed to #{n}!"
  },
  "biomes": {
   "cosmic": {
    "name": "Cosmic Threat",
    "desc": "Meteors and rocks"
   },
   "zombie": {
    "name": "Zombie Invasion",
    "desc": "Cute zombies and candy ghosts"
   },
   "ocean": {
    "name": "Ocean Abyss",
    "desc": "Jellyfish and bubble critters"
   }
  },
  "enemyTypes": {
   "rock": "Common",
   "crystal": "Tough",
   "ghost": "Fast",
   "boss": "Very Strong"
  },
  "enemies": {
   "rock": "ROCK",
   "crystal": "CRYSTAL",
   "ghost": "GHOST",
   "meteor": "BOSS",
   "zombie": "ZOMBIE",
   "tomb": "TOMBSTONE",
   "candy": "CANDY",
   "pumpkin": "PUMPKIN KING",
   "bubble": "BUBBLE",
   "urchin": "URCHIN",
   "jelly": "JELLYFISH",
   "octo": "BIG OCTO"
  },
  "characters": {
   "gato": {
    "trait": "Balanced",
    "desc": "<b>Comet</b> — a sure-fire spell. Passive: <b>+10% points</b>.",
    "name": "CAT"
   },
   "coelho": {
    "trait": "Fast",
    "desc": "<b>Lightning</b> — instant bolt. Passive: enemies <b>15% slower</b>.",
    "name": "RABBIT"
   },
   "raposa": {
    "trait": "Powerful",
    "desc": "<b>Explosion</b> — area damage on <b>nearby enemies</b>.",
    "name": "FOX"
   },
   "coruja": {
    "trait": "Precise",
    "desc": "<b>Vortex</b> — <b>+1 life</b> and typos <b>don't break the combo</b>.",
    "name": "OWL"
   }
  },
  "spells": {
   "cometa": {
    "name": "COMET",
    "sub": "Fast"
   },
   "explosao": {
    "name": "EXPLOSION",
    "sub": "Area"
   },
   "raio": {
    "name": "BOLT",
    "sub": "Straight"
   },
   "vortice": {
    "name": "VORTEX",
    "sub": "Precise"
   },
   "meteoros": {
    "name": "METEORS",
    "sub": "Space",
    "tip": "🌠 <b>Meteors</b>: with full mana, press <kbd>Space</kbd> to hit every enemy."
   }
  },
  "achievements": {
   "words500": {
    "name": "Arcane Scribe",
    "desc": "Type 500 words"
   },
   "wpm60": {
    "name": "Fire Fingers",
    "desc": "Reach 60 WPM in a match"
   },
   "boss50": {
    "name": "Boss Hunter",
    "desc": "Defeat 50 Bosses"
   },
   "kills1000": {
    "name": "Exterminator",
    "desc": "Defeat 1,000 enemies"
   },
   "wave10": {
    "name": "Tower Guardian",
    "desc": "Reach wave 10"
   },
   "games10": {
    "name": "Dedicated Mage",
    "desc": "Play 10 matches"
   },
   "acc98": {
    "name": "Owl Eye",
    "desc": "Finish a match with 98% accuracy (min. 50 words)"
   },
   "time1h": {
    "name": "Magic Marathoner",
    "desc": "Play 1 hour in total"
   }
  },
  "rewards": {
   "label": {
    "title": "Title",
    "color": "Color",
    "border": "Border",
    "avatar": "Avatar"
   },
   "achReady": "🏅 Achievement ready: {n} (claim in Profile)",
   "questReady": "📅 Quest complete: {n}",
   "newChar": "🐾 Character: {n}",
   "title": "🏷️ Title: {n}",
   "border": "🖼️ Border: {n}",
   "color": "✨ Spell color: {n}",
   "avatar": "🎭 Avatar: {n}"
  },
  "musicTracks": {
   "dynamic": {
    "name": "Dynamic Mode",
    "desc": "Calm in the menu and early waves → March under pressure → Battle on high waves and bosses. Turns tense when you miss."
   },
   "marcha": {
    "name": "March of the Arcane",
    "desc": "The original score, with versions that react to your combo."
   },
   "taverna": {
    "name": "Arcane Tavern",
    "desc": "Calm medieval lofi: lute, flute, muffled beat and a crackling hearth."
   },
   "velen": {
    "name": "Hunt in Velen",
    "desc": "War drums, fast arpeggios and fiddle. Speeds up as your combo grows."
   },
   "floresta": {
    "name": "Ancient Forest",
    "desc": "Harp, chimes, wind and birds. Atmospheric and mystic."
   }
  },
  "meta": {
   "title": "Mage Animals — Type to Cast"
  },
  "titles": {
   "apprentice": "Magic Apprentice",
   "conjurer": "Novice Conjurer",
   "wordmaster": "Master of Words",
   "runesorcerer": "Rune Sorcerer",
   "archmage": "Supreme Archmage",
   "legend": "Arcane Legend",
   "firefingers": "Fire Fingers",
   "guardian": "Tower Guardian",
   "zombiehunter": "Zombie Hunter",
   "duelchamp": "Duel Champion"
  },
  "borders": {
   "bronze": "Bronze",
   "prata": "Silver",
   "ouro": "Gold",
   "arcana": "Arcane",
   "cosmica": "Cosmic",
   "abissal": "Abyssal"
  },
  "colors": {
   "padrao": "Character",
   "ouro": "Golden",
   "rubi": "Ruby",
   "esmeralda": "Emerald",
   "arcoiris": "Rainbow",
   "chama": "Arcane Flame",
   "aurora": "Aurora"
  }
 },
 "es": {
  "intro": {
   "desc": "Un juego de mecanografía inspirado en clásicos arcade como Asteroids. Eres un animal mágico en lo alto de una torre: ¡escribe rápido para lanzar hechizos y destruir a los enemigos!",
   "tip1": "Escribe para lanzar hechizos",
   "tip2": "Derrota enemigos y sobrevive",
   "tip3": "Evoluciona, desbloquea magias y personajes"
  },
  "controls": {
   "title": "CONTROLES",
   "type": "Escribe la palabra del enemigo",
   "back": "Cambiar objetivo",
   "space": "Meteoros (maná lleno)",
   "esc": "Pausa",
   "f2": "Música on/off",
   "spaceKey": "Espacio"
  },
  "hud": {
   "record": "RÉCORD",
   "points": "PUNTOS",
   "wave": "OLEADA",
   "wpm": "PPM",
   "lives": "VIDAS",
   "precision": "PRECISIÓN",
   "total": "Total",
   "combo": "COMBO",
   "inRow": "seguidos",
   "speed": "VEL",
   "enemies": "ENEMIGOS",
   "bossWarn": "⚠ SE ACERCA UN JEFE ⚠",
   "meteors": "¡METEOROS!"
  },
  "sections": {
   "concept": "CONCEPTO VISUAL",
   "characters": "PERSONAJES",
   "spells": "MAGIAS",
   "enemies": "ENEMIGOS"
  },
  "music": {
   "on": "🎵 MÚSICA ON",
   "off": "🔇 MÚSICA OFF",
   "audio": "AUDIO",
   "music": "🎵 Música",
   "effects": "🔊 Efectos",
   "tip": "♪ La banda sonora cambia según tu desempeño (Marcha → Avance → Batalla → Épica) y se vuelve Vacilante cuando fallas.",
   "jukebox": "ROCOLA MÁGICA",
   "nowPlaying": "Sonando ahora",
   "recommended": "Recomendado",
   "mixer": "VOLUMEN",
   "missFx": "🎯 Al fallar una letra, la música se desafina y se apaga por un instante — señal de fallo mágico.",
   "modes": {
    "MUDO": "SILENCIO",
    "MARCHA": "MARCHA",
    "AVANÇO": "AVANCE",
    "BATALHA": "BATALLA",
    "ÉPICA": "ÉPICA",
    "HESITANTE": "VACILANTE",
    "TAVERNA": "TABERNA",
    "VELEN": "VELEN",
    "FLORESTA": "BOSQUE"
   }
  },
  "nav": {
   "missions": "MISIONES",
   "duel": "DUELO",
   "ranking": "RANKING",
   "profileButton": "⚙ PERFIL Y RECOMPENSAS",
   "profile": "Perfil y Cosméticos",
   "stats": "Estadísticas y Logros",
   "characters": "Personajes",
   "audio": "Santuario Musical"
  },
  "menu": {
   "hello": "Hola",
   "level": "Nivel",
   "choose": "ELIGE TU MAGO",
   "biome": "BIOMA",
   "help": "¡Escribe la palabra de cada enemigo para lanzar tu hechizo antes de que llegue a la torre!"
  },
  "ui": {
   "play": "JUGAR",
   "orEnter": "o pulsa ENTER",
   "pause": "PAUSA",
   "resumeShort": "CONTINUAR",
   "resume": "CONTINUAR",
   "restart": "REINICIAR PARTIDA",
   "menu": "SALIR AL MENÚ",
   "ok": "OK",
   "vs": "VS",
   "lvl": "Nv",
   "xp": "XP",
   "bpm": "BPM",
   "defaultNick": "Mago"
  },
  "pause": {
   "resumeHint": "ENTER o ESC para volver",
   "score": "Puntos",
   "wave": "Oleada",
   "wpm": "PPM",
   "acc": "Precisión",
   "combo": "Combo / Mejor",
   "lives": "Vidas",
   "hp": "Tu vida",
   "bot": "Oponente",
   "hint": "ENTER o ESC continúa · R reinicia · M sale al menú",
   "quitNote": "Reiniciar o salir descarta la partida actual (sin XP)."
  },
  "results": {
   "gameOver": "FIN DEL JUEGO",
   "newRecord": "🏆 ¡NUEVO RÉCORD!",
   "again": "JUGAR OTRA VEZ",
   "menu": "MENÚ",
   "xpScore": "Puntos × 0,1",
   "xpWords": "Palabras ({n} × 5)",
   "xpWave": "Oleada alcanzada ({n} × 50)",
   "xpBonusOk": "Bono de precisión (+20%)",
   "xpBonusNo": "Bono de precisión (necesita > 95%)",
   "fastest": "PALABRAS MÁS RÁPIDAS",
   "time": "TIEMPO",
   "maxWpmWord": "⚡ PPM máximo en una palabra",
   "levelUp": "¡SUBES DE NIVEL!",
   "reachedLevel": "Alcanzaste el Nivel {n}"
  },
  "profile": {
   "title": "PERFIL DEL MAGO",
   "welcome": "¡BIENVENIDO, MAGO!",
   "saveClose": "GUARDAR Y CERRAR",
   "startPlay": "EMPEZAR A JUGAR",
   "nick": "APODO DEL MAGO",
   "titles": "TÍTULOS",
   "avatar": "AVATAR",
   "border": "BORDE DEL PERFIL",
   "spellColor": "COLOR DEL HECHIZO"
  },
  "stats": {
   "kills": "Enemigos Derrotados",
   "words": "Palabras Escritas",
   "wpm": "PPM Máximo",
   "acc": "Precisión Media",
   "record": "Récord",
   "xp": "XP Total",
   "time": "Tiempo de Juego",
   "games": "Partidas",
   "bosses": "jefes",
   "topSpeed": "velocidad histórica",
   "maxWave": "oleada máxima",
   "achievements": "LOGROS",
   "claimedN": "reclamados",
   "claim": "RECLAMAR",
   "claimed": "✔ RECLAMADO"
  },
  "settings": {
   "on": "ACTIVA",
   "off": "APAGADA",
   "language": "IDIOMA",
   "graphics": "GRÁFICOS",
   "quality": {
    "auto": "Auto",
    "high": "Alta",
    "low": "Ligera"
   },
   "showFps": "Mostrar FPS",
   "general": "GENERAL"
  },
  "charUi": {
   "active": "PERSONAJE ACTIVO",
   "equipped": "✔ EQUIPADO",
   "locked": "Bloqueado",
   "unlockReq": "Oleada {w} o Nv {l}",
   "conquest": "🏅 Logro"
  },
  "missions": {
   "title": "MISIONES Y RECOMPENSAS",
   "daily": "Diarias",
   "weekly": "Semanales",
   "login": "Inicio Diario",
   "resetsIn": "Se renueva en {t}",
   "day": "Día",
   "today": "HOY",
   "collect": "COBRAR",
   "collected": "✔ COBRADO",
   "comeBack": "Vuelve mañana",
   "loginTitle": "RECOMPENSA DIARIA",
   "streak": "Racha de {n} día(s)"
  },
  "quests": {
   "d_words": "Escribe 200 palabras hoy",
   "d_duel": "Gana 1 Duelo PVC",
   "d_zombie": "Alcanza la Oleada 5 en el bioma Zombi",
   "w_boss": "Derrota 50 Jefes esta semana"
  },
  "duel": {
   "title": "DUELO DE MAGOS",
   "pick": "Elige a tu oponente",
   "help": "Escribe las palabras para atacar. Los combos aumentan el daño. ¡Gana quien deje primero al otro sin vida!",
   "levels": {
    "aprendiz": "Aprendiz",
    "mestre": "Maestro",
    "arquimago": "Archimago"
   },
   "fight": "DUELAR",
   "victory": "¡VICTORIA!",
   "defeat": "DERROTA",
   "rematch": "REVANCHA",
   "you": "TÚ",
   "dmg": "daño",
   "wins": "Victorias"
  },
  "ranking": {
   "title": "RANKING GLOBAL",
   "byScore": "Puntos",
   "byWpm": "PPM",
   "note": "Ranking offline: supera a los magos para ocupar su puesto.",
   "you": "Tu posición",
   "up": "🏆 Ranking: ¡subiste al #{n}!"
  },
  "biomes": {
   "cosmic": {
    "name": "Amenaza Cósmica",
    "desc": "Meteoros y rocas"
   },
   "zombie": {
    "name": "Invasión Zombi",
    "desc": "Zombis tiernos y fantasmitas de dulce"
   },
   "ocean": {
    "name": "Abismo Marino",
    "desc": "Medusas y monstruitos de burbuja"
   }
  },
  "enemyTypes": {
   "rock": "Común",
   "crystal": "Resistente",
   "ghost": "Rápido",
   "boss": "Muy Fuerte"
  },
  "enemies": {
   "rock": "ROCA",
   "crystal": "CRISTAL",
   "ghost": "FANTASMA",
   "meteor": "JEFE",
   "zombie": "ZOMBI",
   "tomb": "LÁPIDA",
   "candy": "DULCECITO",
   "pumpkin": "REY CALABAZA",
   "bubble": "BURBUJA",
   "urchin": "ERIZO",
   "jelly": "MEDUSA",
   "octo": "PULPÓN"
  },
  "characters": {
   "gato": {
    "trait": "Equilibrado",
    "desc": "<b>Cometa</b> — hechizo certero. Pasiva: <b>+10% de puntos</b>.",
    "name": "GATO"
   },
   "coelho": {
    "trait": "Rápido",
    "desc": "<b>Rayo</b> — relámpago instantáneo. Pasiva: enemigos <b>15% más lentos</b>.",
    "name": "CONEJO"
   },
   "raposa": {
    "trait": "Poderoso",
    "desc": "<b>Explosión</b> — daño en área a <b>enemigos cercanos</b>.",
    "name": "ZORRO"
   },
   "coruja": {
    "trait": "Precisión",
    "desc": "<b>Vórtice</b> — <b>+1 vida</b> y los errores <b>no rompen el combo</b>.",
    "name": "BÚHO"
   }
  },
  "spells": {
   "cometa": {
    "name": "COMETA",
    "sub": "Rápido"
   },
   "explosao": {
    "name": "EXPLOSIÓN",
    "sub": "Área"
   },
   "raio": {
    "name": "RAYO",
    "sub": "Recto"
   },
   "vortice": {
    "name": "VÓRTICE",
    "sub": "Preciso"
   },
   "meteoros": {
    "name": "METEOROS",
    "sub": "Espacio",
    "tip": "🌠 <b>Meteoros</b>: con el maná lleno, pulsa <kbd>Espacio</kbd> para golpear a todos los enemigos."
   }
  },
  "achievements": {
   "words500": {
    "name": "Escriba Arcano",
    "desc": "Escribe 500 palabras"
   },
   "wpm60": {
    "name": "Dedos de Fuego",
    "desc": "Alcanza 60 PPM en una partida"
   },
   "boss50": {
    "name": "Cazador de Jefes",
    "desc": "Derrota 50 Jefes"
   },
   "kills1000": {
    "name": "Exterminador",
    "desc": "Derrota 1.000 enemigos"
   },
   "wave10": {
    "name": "Guardián de la Torre",
    "desc": "Alcanza la oleada 10"
   },
   "games10": {
    "name": "Mago Dedicado",
    "desc": "Juega 10 partidas"
   },
   "acc98": {
    "name": "Ojo de Búho",
    "desc": "Termina una partida con 98% de precisión (mín. 50 palabras)"
   },
   "time1h": {
    "name": "Maratonista Mágico",
    "desc": "Juega 1 hora en total"
   }
  },
  "rewards": {
   "label": {
    "title": "Título",
    "color": "Color",
    "border": "Borde",
    "avatar": "Avatar"
   },
   "achReady": "🏅 Logro listo: {n} (reclámalo en el Perfil)",
   "questReady": "📅 Misión completada: {n}",
   "newChar": "🐾 Personaje: {n}",
   "title": "🏷️ Título: {n}",
   "border": "🖼️ Borde: {n}",
   "color": "✨ Color de hechizo: {n}",
   "avatar": "🎭 Avatar: {n}"
  },
  "musicTracks": {
   "dynamic": {
    "name": "Modo Dinámico",
    "desc": "Calma en el menú y al inicio → Marcha bajo presión → Batalla en oleadas altas y jefes. Se vuelve tensa al fallar."
   },
   "marcha": {
    "name": "Marcha de los Arcanos",
    "desc": "La partitura original, con versiones que reaccionan a tu combo."
   },
   "taverna": {
    "name": "Taberna de los Arcanos",
    "desc": "Lofi medieval tranquilo: laúd, flauta, ritmo suave y chimenea crepitante."
   },
   "velen": {
    "name": "Cacería en Velen",
    "desc": "Tambores de guerra, arpegios rápidos y violín. Acelera según crece el combo."
   },
   "floresta": {
    "name": "Bosque Antiguo",
    "desc": "Arpa, campanillas, viento y pájaros. Atmosférico y místico."
   }
  },
  "meta": {
   "title": "Mage Animals — Escribe para Lanzar"
  },
  "titles": {
   "apprentice": "Aprendiz de Magia",
   "conjurer": "Conjurador Novato",
   "wordmaster": "Maestro de las Palabras",
   "runesorcerer": "Hechicero de Runas",
   "archmage": "Archimago Supremo",
   "legend": "Leyenda Arcana",
   "firefingers": "Dedos de Fuego",
   "guardian": "Guardián de la Torre",
   "zombiehunter": "Cazador de Zombis",
   "duelchamp": "Campeón del Duelo"
  },
  "borders": {
   "bronze": "Bronce",
   "prata": "Plata",
   "ouro": "Oro",
   "arcana": "Arcana",
   "cosmica": "Cósmica",
   "abissal": "Abisal"
  },
  "colors": {
   "padrao": "Personaje",
   "ouro": "Dorado",
   "rubi": "Rubí",
   "esmeralda": "Esmeralda",
   "arcoiris": "Arcoíris",
   "chama": "Llama Arcana",
   "aurora": "Aurora"
  }
 }
};

// idioma atual (localStorage) — migra o valor antigo 'pt' para 'pt-BR'
let LANG=store.get('lang',null)||navigator.language||FALLBACK_LANG;
if(LANG==='pt'||/^pt/i.test(LANG))LANG='pt-BR';else LANG=String(LANG).slice(0,2).toLowerCase();
if(!TRANSLATIONS[LANG])LANG=FALLBACK_LANG;

// t('a.b.c',{n:1}): resolve o caminho no idioma atual → fallback pt-BR → a própria chave (e avisa no console)
const _i18nCache=new Map();
function lookup(obj,key){let o=obj;for(const p of key.split('.')){if(o==null)return undefined;o=o[p]}return o}
function t(key,vars){
 let s=_i18nCache.get(key);
 if(s===undefined){
  s=lookup(TRANSLATIONS[LANG],key);
  if(typeof s!=='string')s=lookup(TRANSLATIONS[FALLBACK_LANG],key);
  if(typeof s!=='string'){console.warn('[i18n] chave ausente:',key);s=key}
  _i18nCache.set(key,s);
 }
 if(vars)for(const v in vars)s=s.split('{'+v+'}').join(vars[v]);
 return s;
}
function setLang(l){if(!TRANSLATIONS[l])return;LANG=l;store.set('lang',l);_i18nCache.clear();buildPools((LANGS.find(x=>x.id===l)||LANGS[0]).words)}
const numLocale=()=>LANG==='en'?'en-US':LANG==='es'?'es-ES':'pt-BR';
const fmtN=n=>Math.round(n).toLocaleString(numLocale());

// ---------- extensão do dicionário (módulos novos adicionam textos aqui sem mexer no bloco principal) ----------
function i18nExtend(pack){
 const merge=(a,b)=>{for(const k in b){if(b[k]&&typeof b[k]==='object'){a[k]=a[k]||{};merge(a[k],b[k])}else a[k]=b[k]}};
 for(const l in pack){TRANSLATIONS[l]=TRANSLATIONS[l]||{};merge(TRANSLATIONS[l],pack[l])}_i18nCache.clear();
}
i18nExtend({
 'pt-BR':{
  side:{yourRecord:'SEU RECORDE',maxWave:'ONDA MÁX.',maxWpm:'WPM MÁX.',bestiary:'BESTIÁRIO',nextReward:'Próxima recompensa no {lvl}',xpLeft:'faltam {n} XP',allDone:'Todas as recompensas de nível liberadas!'},
  nav:{duelPvc:'DUELO PVC',rankingGlobal:'RANKING GLOBAL'},
  focus:{hide:'Modo Foco: esconder painel',show:'Mostrar painel'},
  menu:{scenes:{tavern:'🍺 Taverna do Gato',forge:'⚒️ Ferraria do Coelho',library:'📖 Biblioteca da Raposa',observatory:'🔭 Observatório da Coruja'}},
  help:{button:'Como Jogar',title:'COMO JOGAR',s1t:'Digite',s1:'Cada inimigo carrega uma palavra. Digite-a para mirar e lançar o feitiço.',s2t:'Ataque',s2:'Palavras completas viram feitiços. Combos multiplicam os pontos e enchem a mana.',s3t:'Sobreviva',s3:'Não deixe os inimigos tocarem a torre. A cada onda eles ficam mais rápidos.',
   controls:'CONTROLES',tips:'DICAS',tip1:'Errar uma letra acelera o alvo por 1,5 s: precisão vale mais que pressa.',tip2:'Mana cheia + Espaço = chuva de Meteoros em todos os inimigos.',tip3:'Missões diárias e o login de 7 dias dão XP extra todos os dias.',pauseKeys:'Na pausa: R reinicia · M volta ao menu'},
  spells:{usedBy:'Feitiço de {n}',cometa:{tooltip:'Disparo certeiro e veloz. Ideal para manter um ritmo constante.'},explosao:{tooltip:'Explode o alvo e atinge quem estiver por perto. Perfeito para hordas!'},raio:{tooltip:'Relâmpago instantâneo em zigue-zague. Com o Coelho, inimigos ficam 15% mais lentos.'},vortice:{tooltip:'Vórtice preciso: com a Coruja, erros não quebram o combo e você ganha +1 vida.'},meteoros:{tooltip:'Encha a mana e aperte Espaço: chuva de meteoros em TODOS os inimigos.'}},
  bestiary:{hp:'{n} palavra(s) para derrotar',fast:'Muda de direção de repente',boss:'Aparece a cada 5 ondas'}},
 en:{
  side:{yourRecord:'YOUR RECORD',maxWave:'MAX WAVE',maxWpm:'MAX WPM',bestiary:'BESTIARY',nextReward:'Next reward at {lvl}',xpLeft:'{n} XP to go',allDone:'All level rewards unlocked!'},
  nav:{duelPvc:'PVC DUEL',rankingGlobal:'GLOBAL RANKING'},
  focus:{hide:'Focus Mode: hide panel',show:'Show panel'},
  menu:{scenes:{tavern:"🍺 Cat's Tavern",forge:"⚒️ Rabbit's Forge",library:"📖 Fox's Library",observatory:"🔭 Owl's Observatory"}},
  help:{button:'How to Play',title:'HOW TO PLAY',s1t:'Type',s1:'Every enemy carries a word. Type it to aim and cast your spell.',s2t:'Attack',s2:'Finished words become spells. Combos multiply points and fill your mana.',s3t:'Survive',s3:"Don't let enemies touch the tower. They get faster every wave.",
   controls:'CONTROLS',tips:'TIPS',tip1:'A typo speeds up your target for 1.5 s: accuracy beats haste.',tip2:'Full mana + Space = Meteor shower on every enemy.',tip3:'Daily quests and the 7-day login give bonus XP every day.',pauseKeys:'While paused: R restarts · M returns to menu'},
  spells:{usedBy:"{n}'s spell",cometa:{tooltip:'A swift, sure-fire shot. Great for a steady rhythm.'},explosao:{tooltip:'Blows up the target and everyone nearby. Perfect for hordes!'},raio:{tooltip:'Instant zig-zag lightning. With the Rabbit, enemies are 15% slower.'},vortice:{tooltip:"A precise vortex: with the Owl, typos don't break your combo and you get +1 life."},meteoros:{tooltip:'Fill your mana and press Space: a meteor shower on ALL enemies.'}},
  bestiary:{hp:'{n} word(s) to defeat',fast:'Changes direction suddenly',boss:'Shows up every 5 waves'}},
 es:{
  side:{yourRecord:'TU RÉCORD',maxWave:'OLEADA MÁX.',maxWpm:'PPM MÁX.',bestiary:'BESTIARIO',nextReward:'Próxima recompensa en {lvl}',xpLeft:'faltan {n} XP',allDone:'¡Todas las recompensas de nivel desbloqueadas!'},
  nav:{duelPvc:'DUELO PVC',rankingGlobal:'RANKING GLOBAL'},
  focus:{hide:'Modo Foco: ocultar panel',show:'Mostrar panel'},
  menu:{scenes:{tavern:'🍺 Taberna del Gato',forge:'⚒️ Herrería del Conejo',library:'📖 Biblioteca del Zorro',observatory:'🔭 Observatorio del Búho'}},
  help:{button:'Cómo Jugar',title:'CÓMO JUGAR',s1t:'Escribe',s1:'Cada enemigo lleva una palabra. Escríbela para apuntar y lanzar el hechizo.',s2t:'Ataca',s2:'Las palabras completas se vuelven hechizos. Los combos multiplican los puntos y llenan el maná.',s3t:'Sobrevive',s3:'No dejes que los enemigos toquen la torre. Cada oleada son más rápidos.',
   controls:'CONTROLES',tips:'CONSEJOS',tip1:'Un error acelera al objetivo 1,5 s: la precisión vale más que la prisa.',tip2:'Maná lleno + Espacio = lluvia de Meteoros sobre todos los enemigos.',tip3:'Las misiones diarias y el inicio de 7 días dan XP extra cada día.',pauseKeys:'En pausa: R reinicia · M vuelve al menú'},
  spells:{usedBy:'Hechizo de {n}',cometa:{tooltip:'Disparo certero y veloz. Ideal para mantener un ritmo constante.'},explosao:{tooltip:'Explota al objetivo y alcanza a los cercanos. ¡Perfecto para hordas!'},raio:{tooltip:'Relámpago instantáneo en zigzag. Con el Conejo, los enemigos van 15% más lentos.'},vortice:{tooltip:'Vórtice preciso: con el Búho, los errores no rompen el combo y ganas +1 vida.'},meteoros:{tooltip:'Llena el maná y pulsa Espacio: lluvia de meteoros sobre TODOS los enemigos.'}},
  bestiary:{hp:'{n} palabra(s) para derrotar',fast:'Cambia de dirección de repente',boss:'Aparece cada 5 oleadas'}}
});
// curva de dificuldade + menu focado em bioma
i18nExtend({
 'pt-BR':{menu:{chooseBiome:'ESCOLHA SUA AVENTURA',pressEnter:'[ Pressione ENTER ]'},hud:{rage:'FÚRIA!',stageMedium:'⚡ FANTASMAS E CRISTAIS CHEGARAM ⚡',stageHard:'👑 MODO MESTRE: CHEFES COM TEMPO 👑'},bestiary:{boss:'Da onda 8 em diante · tem tempo para cada palavra'}},
 en:{menu:{chooseBiome:'CHOOSE YOUR ADVENTURE',pressEnter:'[ Press ENTER ]'},hud:{rage:'RAGE!',stageMedium:'⚡ GHOSTS AND CRYSTALS HAVE ARRIVED ⚡',stageHard:'👑 MASTER MODE: TIMED BOSSES 👑'},bestiary:{boss:'From wave 8 on · each word is timed'}},
 es:{menu:{chooseBiome:'ELIGE TU AVENTURA',pressEnter:'[ Pulsa ENTER ]'},hud:{rage:'¡FURIA!',stageMedium:'⚡ LLEGARON FANTASMAS Y CRISTALES ⚡',stageHard:'👑 MODO MAESTRO: JEFES CON TIEMPO 👑'},bestiary:{boss:'Desde la oleada 8 · cada palabra tiene tiempo'}}
});

// Aura, histórico de duelos e Festa na Fogueira
i18nExtend({
 'pt-BR':{aura:{name:'Aura',tip:'Aura: prestígio ganho nos duelos. Vitórias somam, derrotas tiram.',win:'VITÓRIA',loss:'DERROTA',wins:'Vitórias',losses:'Derrotas',total:'Aura total',streak:'Sequência',best:'melhor {n}',history:'Últimas batalhas',empty:'Nenhuma batalha ainda — desafie um mago!',stakes:'+{w} / {l} Aura',gained:'{n} Aura'},
  ranking:{byAura:'Aura',upAura:'Você subiu para #{n} no ranking de Aura!'},menu:{scenes:{campfire:'✨ Raro: Festa na Fogueira'}}},
 en:{aura:{name:'Aura',tip:'Aura: prestige earned in duels. Wins add, losses subtract.',win:'VICTORY',loss:'DEFEAT',wins:'Wins',losses:'Losses',total:'Total Aura',streak:'Streak',best:'best {n}',history:'Recent battles',empty:'No battles yet — challenge a mage!',stakes:'+{w} / {l} Aura',gained:'{n} Aura'},
  ranking:{byAura:'Aura',upAura:'You climbed to #{n} in the Aura ranking!'},menu:{scenes:{campfire:'✨ Rare: Campfire Party'}}},
 es:{aura:{name:'Aura',tip:'Aura: prestigio ganado en duelos. Las victorias suman, las derrotas restan.',win:'VICTORIA',loss:'DERROTA',wins:'Victorias',losses:'Derrotas',total:'Aura total',streak:'Racha',best:'mejor {n}',history:'Últimas batallas',empty:'Aún no hay batallas — ¡desafía a un mago!',stakes:'+{w} / {l} Aura',gained:'{n} Aura'},
  ranking:{byAura:'Aura',upAura:'¡Subiste al #{n} en el ranking de Aura!'},menu:{scenes:{campfire:'✨ Raro: Fiesta en la Fogata'}}}
});
// 🔤 Sensibilidade de acentos
i18nExtend({
 'pt-BR':{accents:{section:'Jogabilidade',title:'Sensibilidade de Acentos',strict:'Estrito',relaxed:'Acessível',onHint:'DRAGÃO exige digitar “Ã”. Letra sem acento conta como erro.',offHint:'“DRAGAO” também vale — ideal para teclados sem layout PT-BR e celulares.'}},
 en:{accents:{section:'Gameplay',title:'Strict Accents',strict:'Strict',relaxed:'Relaxed',onHint:'DRAGÃO requires typing “Ã”. A plain letter counts as a miss.',offHint:'“DRAGAO” is accepted too — great for non-Portuguese layouts and phones.'}},
 es:{accents:{section:'Jugabilidad',title:'Sensibilidad de Acentos',strict:'Estricto',relaxed:'Accesible',onHint:'DRAGÃO exige escribir “Ã”. Una letra sin tilde cuenta como error.',offHint:'“DRAGAO” también vale — ideal para teclados sin distribución PT-BR y móviles.'}}
});
// 🏰 Personalizar Torre
i18nExtend({
 'pt-BR':{towers:{title:'Personalizar Torre',button:'Torre',hint:'Escolha o visual da sua torre. A automática acompanha o bioma da aventura.',auto:'Automática',n:'Torre {n}'}},
 en:{towers:{title:'Customize Tower',button:'Tower',hint:'Pick your tower look. Automatic follows the adventure biome.',auto:'Automatic',n:'Tower {n}'}},
 es:{towers:{title:'Personalizar Torre',button:'Torre',hint:'Elige el aspecto de tu torre. La automática sigue el bioma de la aventura.',auto:'Automática',n:'Torre {n}'}}
});
// 🎁 Missões & Recompensas (gatilhos de progresso, urgência e ofensiva)
i18nExtend({
 'pt-BR':{missions:{inProgress:'Em andamento',claim:'RESGATAR',claimedTag:'RECOLHIDO',left:'faltam {n}',expiresDaily:'As missões diárias expiram em:',expiresWeekly:'As missões semanais expiram em:',nextLogin:'Próxima recompensa diária em:',
   passTitle:'Conclua {n} missões para abrir o Baú Semanal de Aura',passOpen:'ABRIR BAÚ',passOpened:'Baú Semanal de Aura aberto! Volte na próxima semana.',collectToday:'COLETAR HOJE',supreme:'RECOMPENSA SUPREMA',
   streakTitle:'Ofensiva de {n} dia(s)',streakWarn:'Entre todos os dias — se pular um, a ofensiva volta ao Dia 1.'},quests:{w_words:'Digite 1.500 palavras na semana',w_duels:'Vença 5 Duelos PVC na semana'}},
 en:{missions:{inProgress:'In progress',claim:'CLAIM',claimedTag:'CLAIMED',left:'{n} to go',expiresDaily:'Daily quests expire in:',expiresWeekly:'Weekly quests expire in:',nextLogin:'Next daily reward in:',
   passTitle:'Complete {n} quests to open the Weekly Aura Chest',passOpen:'OPEN CHEST',passOpened:'Weekly Aura Chest opened! Come back next week.',collectToday:'COLLECT TODAY',supreme:'SUPREME REWARD',
   streakTitle:'{n}-day streak',streakWarn:'Log in every day — skip one and the streak resets to Day 1.'},quests:{w_words:'Type 1,500 words this week',w_duels:'Win 5 PVC Duels this week'}},
 es:{missions:{inProgress:'En curso',claim:'RECLAMAR',claimedTag:'RECOGIDO',left:'faltan {n}',expiresDaily:'Las misiones diarias expiran en:',expiresWeekly:'Las misiones semanales expiran en:',nextLogin:'Próxima recompensa diaria en:',
   passTitle:'Completa {n} misiones para abrir el Cofre Semanal de Aura',passOpen:'ABRIR COFRE',passOpened:'¡Cofre Semanal de Aura abierto! Vuelve la próxima semana.',collectToday:'RECOGER HOY',supreme:'RECOMPENSA SUPREMA',
   streakTitle:'Racha de {n} día(s)',streakWarn:'Entra todos los días: si te saltas uno, la racha vuelve al Día 1.'},quests:{w_words:'Escribe 1.500 palabras esta semana',w_duels:'Gana 5 Duelos PVC esta semana'}}
});