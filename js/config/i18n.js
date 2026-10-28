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
// 📱 Mobile / entrada por toque
i18nExtend({
 'pt-BR':{input:{draw:'✍️ Desenhar Letra',keys:'⌨️ Teclado Virtual',meteor:'Meteoros'},mobile:{profile:'Perfil',collection:'Coleção'},menu:{tapPlay:'[ Toque em JOGAR ]'}},
 en:{input:{draw:'✍️ Draw Letter',keys:'⌨️ Virtual Keyboard',meteor:'Meteors'},mobile:{profile:'Profile',collection:'Collection'},menu:{tapPlay:'[ Tap PLAY ]'}},
 es:{input:{draw:'✍️ Dibujar Letra',keys:'⌨️ Teclado Virtual',meteor:'Meteoros'},mobile:{profile:'Perfil',collection:'Colección'},menu:{tapPlay:'[ Toca JUGAR ]'}}
});

// 🎮 Estilo de controle (mobile) + curva em dente de serra + Mercy
i18nExtend({
 'pt-BR':{controls:{title:'ESCOLHA SEU ESTILO DE FEITIÇO',sub:'Você pode trocar depois no ⚙️ do menu de pausa.',drawTitle:'Desenhar Feitiço',drawSub:'Desenhe as letras na tela com o dedo',keysTitle:'Teclado Virtual',keysSub:'Digite usando o teclado do celular',recommended:'Recomendado',back:'Voltar',pauseLabel:'Controle'},
  hud:{saw:{welcome:'✨ BOAS-VINDAS, APRENDIZ ✨',tension:'⚡ A TENSÃO AUMENTA ⚡',peak:'👻 PICO: FANTASMA RÁPIDO! 👻',breather:'🍃 RESPIRO — VOCÊ ESTÁ MANDANDO BEM 🍃',boss:'👑 MINI-CHEFE À VISTA! 👑'},mercy:'🐢 Fôlego extra!',miniBossDown:'+{n} Aura ✨'}},
 en:{controls:{title:'CHOOSE YOUR SPELL STYLE',sub:'You can change it later from ⚙️ in the pause menu.',drawTitle:'Draw Spell',drawSub:'Draw the letters on screen with your finger',keysTitle:'Virtual Keyboard',keysSub:'Type using the phone keyboard',recommended:'Recommended',back:'Back',pauseLabel:'Controls'},
  hud:{saw:{welcome:'✨ WELCOME, APPRENTICE ✨',tension:'⚡ THE TENSION RISES ⚡',peak:'👻 PEAK: FAST GHOST! 👻',breather:'🍃 BREATHER — YOU ARE DOING GREAT 🍃',boss:'👑 MINI-BOSS AHEAD! 👑'},mercy:'🐢 Second wind!',miniBossDown:'+{n} Aura ✨'}},
 es:{controls:{title:'ELIGE TU ESTILO DE HECHIZO',sub:'Puedes cambiarlo luego en ⚙️ del menú de pausa.',drawTitle:'Dibujar Hechizo',drawSub:'Dibuja las letras en la pantalla con el dedo',keysTitle:'Teclado Virtual',keysSub:'Escribe con el teclado del móvil',recommended:'Recomendado',back:'Volver',pauseLabel:'Control'},
  hud:{saw:{welcome:'✨ BIENVENIDO, APRENDIZ ✨',tension:'⚡ LA TENSIÓN AUMENTA ⚡',peak:'👻 PICO: ¡FANTASMA RÁPIDO! 👻',breather:'🍃 RESPIRO — ¡LO ESTÁS HACIENDO GENIAL! 🍃',boss:'👑 ¡MINI JEFE A LA VISTA! 👑'},mercy:'🐢 ¡Aire extra!',miniBossDown:'+{n} Aura ✨'}}
});


// 🔮 Widget central do menu: falas do personagem + dicas (listas com o mesmo tamanho em todos os idiomas)
// (também restaura controls.back = "Troca de alvo" do Como Jogar, que a etapa anterior sobrescreveu sem querer)
i18nExtend({
 'pt-BR':{controls:{back:'Troca de alvo',goBack:'Voltar'},widget:{label:'Diz {n}:',tipLabel:'Dica mágica',next:'Toque para a próxima fala'},
  quips:{
   gato:['Não me olhe assim, o leite quente me dá +50 de Mana!','Digitar sem olhar para as garras é uma arte.','Sete vidas? Prefiro três corações e um bom combo.','Se a palavra tem acento, eu tenho paciência. Às vezes.','Ronronar não lança feitiço… mas ajuda a concentrar.'],
   coelho:['Rápido como um raio, fofo como uma nuvem de algodão.','Pisquei e já digitei a onda inteira. Você viu?','Minhas orelhas captam o sussurro de cada tecla.','Cenoura? Não, obrigado. Eu me alimento de WPM.','Quem disse que fofura não causa dano crítico?'],
   raposa:['Errar o acento em "DRAGÃO" transforma fogo em purpurina!','Um bom golpe de fogo resolve 90% dos problemas. Os outros 10% também.','Astúcia é escolher o inimigo mais perto primeiro.','Minha cauda é laranja; meu combo, lendário.','Explosões em área: porque digitar uma vez é mais elegante.'],
   coruja:['Sabedoria é saber que 60 FPS é melhor que 30 FPS.','Hu-hu! Precisão vale mais que pressa… quase sempre.','Li todos os grimórios. Duas vezes. Em três idiomas.','Eu nunca perco o combo. Faz parte do meu charme.','Quem observa as estrelas aprende a esperar a palavra certa.']},
  tips:{
   common:['Dica: Combos altos enchem a mana mais rápido. Com ela cheia, ESPAÇO chama uma chuva de meteoros!','Dica: Errou uma letra? ⌫ troca de alvo sem perder a calma.','Dica: Chefes têm tempo por palavra — comece pelas letras do meio da tela.','Dica: Missões diárias renovam à meia-noite. Não deixe a ofensiva cair!'],
   desktop:['Dica: Mantenha os dedos na fileira do meio (A S D F … J K L Ç).','Dica: F2 liga e desliga a música; Esc pausa a partida.'],
   mobile:['Dica: No celular, faça traços firmes e contínuos para desenhar a letra.','Dica: Desenhe a letra em MAIÚSCULA e grande — o feitiço entende melhor.','Dica: No modo desenho, "A" vale pelo "Ã": acentos não precisam ser desenhados.']}},
 en:{controls:{back:'Switch target',goBack:'Back'},widget:{label:'{n} says:',tipLabel:'Magic tip',next:'Tap for the next line'},
  quips:{
   gato:['Don\'t look at me like that — warm milk gives me +50 Mana!','Typing without looking at your claws is an art.','Nine lives? I\'d rather have three hearts and a good combo.','If the word has an accent, I have patience. Sometimes.','Purring doesn\'t cast spells… but it helps me focus.'],
   coelho:['Fast as lightning, fluffy as a cotton cloud.','I blinked and typed the whole wave. Did you see?','My ears catch the whisper of every key.','Carrots? No thanks. I run on WPM.','Who said cuteness can\'t crit?'],
   raposa:['Miss the accent in "DRAGÃO" and fire turns into glitter!','A good fire strike solves 90% of problems. The other 10% too.','Cunning means picking the closest enemy first.','My tail is orange; my combo, legendary.','Area explosions: because typing once is more elegant.'],
   coruja:['Wisdom is knowing 60 FPS beats 30 FPS.','Hoo-hoo! Precision beats haste… almost always.','I\'ve read every grimoire. Twice. In three languages.','I never lose my combo. It\'s part of my charm.','Those who watch the stars learn to wait for the right word.']},
  tips:{
   common:['Tip: High combos fill your mana faster. When it\'s full, SPACE calls a meteor shower!','Tip: Missed a letter? ⌫ switches target — stay calm.','Tip: Bosses time each word — start with the enemies mid-screen.','Tip: Daily quests reset at midnight. Don\'t break your streak!'],
   desktop:['Tip: Keep your fingers on the home row (A S D F … J K L).','Tip: F2 toggles music; Esc pauses the match.'],
   mobile:['Tip: On mobile, use firm, continuous strokes to draw the letter.','Tip: Draw the letter in UPPERCASE and big — the spell reads it better.','Tip: In draw mode, "A" counts for "Ã": you don\'t need to draw accents.']}},
 es:{controls:{back:'Cambiar objetivo',goBack:'Volver'},widget:{label:'Dice {n}:',tipLabel:'Consejo mágico',next:'Toca para la siguiente frase'},
  quips:{
   gato:['No me mires así, ¡la leche caliente me da +50 de Maná!','Escribir sin mirar las garras es un arte.','¿Siete vidas? Prefiero tres corazones y un buen combo.','Si la palabra lleva tilde, yo tengo paciencia. A veces.','Ronronear no lanza hechizos… pero ayuda a concentrarse.'],
   coelho:['Rápido como un rayo, suave como una nube de algodón.','Parpadeé y ya escribí toda la oleada. ¿Lo viste?','Mis orejas captan el susurro de cada tecla.','¿Zanahoria? No, gracias. Me alimento de PPM.','¿Quién dijo que la ternura no causa crítico?'],
   raposa:['¡Fallar la tilde en "DRAGÃO" convierte el fuego en purpurina!','Un buen golpe de fuego resuelve el 90% de los problemas. El otro 10% también.','La astucia es elegir primero al enemigo más cercano.','Mi cola es naranja; mi combo, legendario.','Explosiones en área: porque escribir una vez es más elegante.'],
   coruja:['Sabiduría es saber que 60 FPS es mejor que 30 FPS.','¡Ju-ju! La precisión vale más que la prisa… casi siempre.','Leí todos los grimorios. Dos veces. En tres idiomas.','Nunca pierdo el combo. Es parte de mi encanto.','Quien observa las estrellas aprende a esperar la palabra correcta.']},
  tips:{
   common:['Consejo: Los combos altos llenan el maná más rápido. Lleno, ¡ESPACIO invoca una lluvia de meteoros!','Consejo: ¿Fallaste una letra? ⌫ cambia de objetivo sin perder la calma.','Consejo: Los jefes tienen tiempo por palabra — empieza por los enemigos del centro.','Consejo: Las misiones diarias se renuevan a medianoche. ¡No rompas tu racha!'],
   desktop:['Consejo: Deja los dedos en la fila central (A S D F … J K L Ñ).','Consejo: F2 activa la música; Esc pausa la partida.'],
   mobile:['Consejo: En el móvil, haz trazos firmes y continuos para dibujar la letra.','Consejo: Dibuja la letra en MAYÚSCULA y grande — el hechizo la entiende mejor.','Consejo: En modo dibujo, "A" vale por "Ã": no hace falta dibujar tildes.']}}
});


// 🔮 Modo Símbolos & Runas
i18nExtend({
 'pt-BR':{style:{words:'⌨️ Palavras',runes:'🔮 Runas',draw:'✍️ Letras',keys:'⌨️ Teclado'},
  runes:{newFamily:'✨ NOVAS RUNAS: {n} ✨',bossWarn:'👑 RUNA ANCESTRAL — DESENHE AS DUAS FORMAS 👑',
   fam:{lines:'LINHAS',angles:'ÂNGULOS',curves:'CURVAS E ARCOS',closed:'FORMAS FECHADAS',loops:'LOOPS ARCANOS',ancient:'RUNAS ANCESTRAIS'}},
  quips:{},tips:{}},
 en:{style:{words:'⌨️ Words',runes:'🔮 Runes',draw:'✍️ Letters',keys:'⌨️ Keyboard'},
  runes:{newFamily:'✨ NEW RUNES: {n} ✨',bossWarn:'👑 ANCIENT RUNE — DRAW BOTH SHAPES 👑',
   fam:{lines:'LINES',angles:'ANGLES',curves:'CURVES & ARCS',closed:'CLOSED SHAPES',loops:'ARCANE LOOPS',ancient:'ANCIENT RUNES'}}},
 es:{style:{words:'⌨️ Palabras',runes:'🔮 Runas',draw:'✍️ Letras',keys:'⌨️ Teclado'},
  runes:{newFamily:'✨ NUEVAS RUNAS: {n} ✨',bossWarn:'👑 RUNA ANCESTRAL — DIBUJA LAS DOS FORMAS 👑',
   fam:{lines:'LÍNEAS',angles:'ÁNGULOS',curves:'CURVAS Y ARCOS',closed:'FORMAS CERRADAS',loops:'BUCLES ARCANOS',ancient:'RUNAS ANCESTRALES'}}}
});

// 👕 Coleção, baús e cosméticos
i18nExtend({
 'pt-BR':{nav:{collection:'COLEÇÃO'},
  col:{title:'Coleção',bonus:'Bônus passivo dos itens',openChest:'Abrir Baú ({n})',owned:'{n} de {m} itens',fromChest:'Encontrado em baús',equip:'Equipar',equipped:'Equipado',itemBonus:'Bônus de itens (+{n}%)',
   f:{all:'Tudo',hat:'Chapéus',cape:'Capas',staff:'Cajados',aura:'Auras'}},
  chest:{name:'Baú',title:'BAÚ MÁGICO',tapOpen:'Toque no baú para abrir!',tapCards:'Toque nas cartas para revelar',collectAll:'COLETAR TUDO',openAnother:'Abrir outro ({n})',dup:'Duplicata Convertida: +{n} Aura'},
  tiers:{common:'Comum',rare:'Raro',epic:'Épico',legendary:'Lendário'},
  items:{h_navy:'Chapéu Marinho',h_forest:'Chapéu da Floresta',h_crimson:'Chapéu Carmesim',h_starry:'Chapéu Estrelado',h_crown:'Coroa Real',h_cosmos:'Chapéu do Cosmos',
   c_wool:'Capa de Lã',c_sky:'Capa Celeste',c_royal:'Manto Real',c_ember:'Manto de Brasa',c_frost:'Manto Glacial',c_aurora:'Manto da Aurora',
   s_oak:'Cajado de Carvalho',s_moss:'Cajado de Musgo',s_ruby:'Cajado de Rubi',s_amethyst:'Cajado de Ametista',s_sun:'Cetro Solar',s_void:'Cetro do Vazio',
   a_spark:'Aura de Centelhas',a_ember:'Aura de Brasas',a_frost:'Aura Gélida',a_bloom:'Aura Florescente',a_storm:'Aura da Tempestade',a_phoenix:'Aura da Fênix'}},
 en:{nav:{collection:'COLLECTION'},
  col:{title:'Collection',bonus:'Passive item bonus',openChest:'Open Chest ({n})',owned:'{n} of {m} items',fromChest:'Found in chests',equip:'Equip',equipped:'Equipped',itemBonus:'Item bonus (+{n}%)',
   f:{all:'All',hat:'Hats',cape:'Capes',staff:'Staffs',aura:'Auras'}},
  chest:{name:'Chest',title:'MAGIC CHEST',tapOpen:'Tap the chest to open it!',tapCards:'Tap the cards to reveal them',collectAll:'COLLECT ALL',openAnother:'Open another ({n})',dup:'Duplicate Converted: +{n} Aura'},
  tiers:{common:'Common',rare:'Rare',epic:'Epic',legendary:'Legendary'},
  items:{h_navy:'Navy Hat',h_forest:'Forest Hat',h_crimson:'Crimson Hat',h_starry:'Starry Hat',h_crown:'Royal Crown',h_cosmos:'Cosmos Hat',
   c_wool:'Wool Cape',c_sky:'Sky Cape',c_royal:'Royal Robe',c_ember:'Ember Robe',c_frost:'Frost Robe',c_aurora:'Aurora Robe',
   s_oak:'Oak Staff',s_moss:'Moss Staff',s_ruby:'Ruby Staff',s_amethyst:'Amethyst Staff',s_sun:'Sun Scepter',s_void:'Void Scepter',
   a_spark:'Spark Aura',a_ember:'Ember Aura',a_frost:'Frost Aura',a_bloom:'Bloom Aura',a_storm:'Storm Aura',a_phoenix:'Phoenix Aura'}},
 es:{nav:{collection:'COLECCIÓN'},
  col:{title:'Colección',bonus:'Bono pasivo de los objetos',openChest:'Abrir Cofre ({n})',owned:'{n} de {m} objetos',fromChest:'Se encuentra en cofres',equip:'Equipar',equipped:'Equipado',itemBonus:'Bono de objetos (+{n}%)',
   f:{all:'Todo',hat:'Sombreros',cape:'Capas',staff:'Báculos',aura:'Auras'}},
  chest:{name:'Cofre',title:'COFRE MÁGICO',tapOpen:'¡Toca el cofre para abrirlo!',tapCards:'Toca las cartas para revelarlas',collectAll:'RECOGER TODO',openAnother:'Abrir otro ({n})',dup:'Duplicado Convertido: +{n} Aura'},
  tiers:{common:'Común',rare:'Raro',epic:'Épico',legendary:'Legendario'},
  items:{h_navy:'Sombrero Marino',h_forest:'Sombrero del Bosque',h_crimson:'Sombrero Carmesí',h_starry:'Sombrero Estrellado',h_crown:'Corona Real',h_cosmos:'Sombrero del Cosmos',
   c_wool:'Capa de Lana',c_sky:'Capa Celeste',c_royal:'Manto Real',c_ember:'Manto de Brasas',c_frost:'Manto Glacial',c_aurora:'Manto de la Aurora',
   s_oak:'Báculo de Roble',s_moss:'Báculo de Musgo',s_ruby:'Báculo de Rubí',s_amethyst:'Báculo de Amatista',s_sun:'Cetro Solar',s_void:'Cetro del Vacío',
   a_spark:'Aura de Chispas',a_ember:'Aura de Brasas',a_frost:'Aura Gélida',a_bloom:'Aura Floreciente',a_storm:'Aura de la Tormenta',a_phoenix:'Aura del Fénix'}}
});

// 🔤 Modo Letras (1 letra por inimigo)
i18nExtend({
 'pt-BR':{style:{letters:'✍️ Letras',words:'⌨️ Palavras'}},
 en:{style:{letters:'✍️ Letters',words:'⌨️ Words'}},
 es:{style:{letters:'✍️ Letras',words:'⌨️ Palabras'}}
});

// ✍️ bloco de desenho (celular)
i18nExtend({
 'pt-BR':{input:{padLetters:'✍️ Desenhe a letra aqui — ou direto no céu',padRunes:'🔮 Desenhe a runa aqui — ou direto no céu'}},
 en:{input:{padLetters:'✍️ Draw the letter here — or right on the sky',padRunes:'🔮 Draw the rune here — or right on the sky'}},
 es:{input:{padLetters:'✍️ Dibuja la letra aquí — o directo en el cielo',padRunes:'🔮 Dibuja la runa aquí — o directo en el cielo'}}
});

// 🎁 abrir todos os baús
i18nExtend({
 'pt-BR':{chest:{openAll:'Abrir todos ({n})',titleAll:'{n} BAÚS MÁGICOS',newItems:'{n} itens novos',newItem1:'1 item novo',dupOne:'1 repetido → +{a} Aura',noNew:'Nenhum item novo',dupMany:'{n} repetidos → +{a} Aura'}},
 en:{chest:{openAll:'Open all ({n})',titleAll:'{n} MAGIC CHESTS',newItems:'{n} new items',newItem1:'1 new item',dupOne:'1 duplicate → +{a} Aura',noNew:'No new items',dupMany:'{n} duplicates → +{a} Aura'}},
 es:{chest:{openAll:'Abrir todos ({n})',titleAll:'{n} COFRES MÁGICOS',newItems:'{n} objetos nuevos',newItem1:'1 objeto nuevo',dupOne:'1 repetido → +{a} Aura',noNew:'Ningún objeto nuevo',dupMany:'{n} repetidos → +{a} Aura'}}
});

// 🎁 baús da partida + atalhos do fim de jogo
i18nExtend({
 'pt-BR':{results:{chestGot:'+{n} Baús ganhos nesta partida!',chestGot1:'+1 Baú ganho nesta partida!',chestWave:'Onda {n}',chestLevel:'+{n} nível',chestNext:'Próximo baú: chegue à onda {n}',chestNone:'Nenhum baú desta vez',chestOpen:'ABRIR AGORA ({n})',chestOpened:'Baús abertos',shortcuts:'Atalhos (opcional)'}},
 en:{results:{chestGot:'+{n} Chests earned this match!',chestGot1:'+1 Chest earned this match!',chestWave:'Wave {n}',chestLevel:'+{n} level',chestNext:'Next chest: reach wave {n}',chestNone:'No chest this time',chestOpen:'OPEN NOW ({n})',chestOpened:'Chests opened',shortcuts:'Shortcuts (optional)'}},
 es:{results:{chestGot:'¡+{n} Cofres ganados en esta partida!',chestGot1:'¡+1 Cofre ganado en esta partida!',chestWave:'Oleada {n}',chestLevel:'+{n} nivel',chestNext:'Próximo cofre: llega a la oleada {n}',chestNone:'Ningún cofre esta vez',chestOpen:'ABRIR AHORA ({n})',chestOpened:'Cofres abiertos',shortcuts:'Atajos (opcional)'}}
});

// 🌐 Duelo online P2P · 👥 Amigos · 🏆 Ranking por modo × período
i18nExtend({
 'pt-BR':{nav:{online:'DUELO ONLINE',friends:'AMIGOS',onlineShort:'Online',friendsShort:'Amigos'},
  online:{title:'Duelo Online',bannerTitle:'Duelo Online contra um amigo',bannerSub:'Crie uma sala, mande o link e lutem em tempo real',
   create:'Criar Sala Online',createSub:'Gere um código e um link de convite para o seu rival.',createBtn:'CRIAR SALA',
   join:'Entrar numa Sala',joinSub:'Cole o código (MAGO-123456) ou abra o link recebido.',joinBtn:'ENTRAR',
   p2pNote:'Conexão direta entre os dois aparelhos (P2P) — sem servidor de jogo.',
   connecting:'Abrindo o portal mágico…',joining:'Entrando na sala {c}…',cancel:'Cancelar',back:'Voltar',
   roomCode:'Código da sala',shareHint:'Mande o link para o seu rival — quando ele entrar, o Lobby abre sozinho.',inviteFor:'Convite para {n}: envie o link abaixo.',
   copy:'Copiar Link de Convite',copied:'Link copiado!',copyFail:'Copie o link acima',share:'Compartilhar',
   shareText:'⚔️ Duelo de magos no Mage Animals! Sala {c} — entre pelo link:',waitingRival:'Aguardando o rival entrar…',closeRoom:'Fechar sala',
   host:'Anfitrião',readyTag:'PRONTO! 🟢',waitingTag:'Aguardando…',chooseMode:'Modo do duelo',hostChooses:'o anfitrião escolhe',
   mode:{words:'Palavras',letters:'Letras',runes:'Símbolos & Runas'},
   modeSub:{words:'Duelo de digitação clássico',letters:'Reação rápida: 1 letra por vez',runes:'Gestos e desenho (ideal no celular)'},
   runesTouch:'Runas são feitas para tela de toque — no PC dá para desenhar com o mouse.',
   imReady:'Estou Pronto!',notReady:'Não estou pronto',start:'Iniciar Duelo',waitReady:'Liberado quando o rival estiver PRONTO',leave:'Sair da sala',
   emote:{bora:'🔥 Bora!',luck:'🍀 Boa sorte!',wait:'⏳ Aguarde um minuto',gg:'🤝 GG!'},
   fight:'LUTE!',vs:'contra',rivalLeft:'o rival desconectou (vitória por W.O.)',record:'Online V-D',rematch:'Revanche / Lobby',
   err:{lib:'Não deu para carregar o módulo online. Verifique a internet e tente de novo.',notfound:'Sala não encontrada. Confira o código ou peça um link novo.',full:'Essa sala já tem dois magos.',left:'O rival saiu da sala.',badcode:'Código inválido — use o formato MAGO-123456.',net:'Falha de conexão. Tente de novo.'}},
  friends:{title:'Amigos',add:'Adicionar',placeholder:'Nickname do amigo',challenge:'Desafiar',remove:'Remover',
   st:{online:'Online',battle:'Em Batalha',offline:'Offline'},empty:'Nenhum amigo ainda — adicione o primeiro!',
   note:'Lista salva neste aparelho. Para duelar, o desafio cria uma sala e você manda o link.',
   msg:{added:'Amigo adicionado!',dup:'Esse amigo já está na lista.',short:'O nickname precisa de 3 letras ou mais.'}},
  rank:{mode:{words:'Palavras',letters:'Letras',runes:'Runas'},period:{daily:'Diário',weekly:'Semanal',monthly:'Mensal',all:'Todos os Tempos'},playToEnter:'jogue no modo {m} para entrar'}},
 en:{nav:{online:'ONLINE DUEL',friends:'FRIENDS',onlineShort:'Online',friendsShort:'Friends'},
  online:{title:'Online Duel',bannerTitle:'Online Duel against a friend',bannerSub:'Create a room, send the link and fight in real time',
   create:'Create Online Room',createSub:'Get a code and an invite link for your rival.',createBtn:'CREATE ROOM',
   join:'Join a Room',joinSub:'Paste the code (MAGO-123456) or open the link you got.',joinBtn:'JOIN',
   p2pNote:'Direct connection between both devices (P2P) — no game server.',
   connecting:'Opening the magic portal…',joining:'Joining room {c}…',cancel:'Cancel',back:'Back',
   roomCode:'Room code',shareHint:'Send the link to your rival — the Lobby opens when they join.',inviteFor:'Invite for {n}: send the link below.',
   copy:'Copy Invite Link',copied:'Link copied!',copyFail:'Copy the link above',share:'Share',
   shareText:'⚔️ Mage duel in Mage Animals! Room {c} — join via link:',waitingRival:'Waiting for your rival…',closeRoom:'Close room',
   host:'Host',readyTag:'READY! 🟢',waitingTag:'Waiting…',chooseMode:'Duel mode',hostChooses:'host chooses',
   mode:{words:'Words',letters:'Letters',runes:'Symbols & Runes'},
   modeSub:{words:'Classic typing duel',letters:'Fast reaction: 1 letter at a time',runes:'Gestures and drawing (best on phone)'},
   runesTouch:'Runes are made for touch screens — on PC you can draw with the mouse.',
   imReady:'I\'m Ready!',notReady:'Not ready',start:'Start Duel',waitReady:'Unlocks when your rival is READY',leave:'Leave room',
   emote:{bora:'🔥 Let\'s go!',luck:'🍀 Good luck!',wait:'⏳ One minute',gg:'🤝 GG!'},
   fight:'FIGHT!',vs:'vs',rivalLeft:'your rival disconnected (win by forfeit)',record:'Online W-L',rematch:'Rematch / Lobby',
   err:{lib:'Could not load the online module. Check your internet and try again.',notfound:'Room not found. Check the code or ask for a new link.',full:'This room already has two mages.',left:'Your rival left the room.',badcode:'Invalid code — use the MAGO-123456 format.',net:'Connection failed. Try again.'}},
  friends:{title:'Friends',add:'Add',placeholder:'Friend\'s nickname',challenge:'Challenge',remove:'Remove',
   st:{online:'Online',battle:'In Battle',offline:'Offline'},empty:'No friends yet — add the first one!',
   note:'List saved on this device. To duel, the challenge creates a room and you send the link.',
   msg:{added:'Friend added!',dup:'That friend is already on the list.',short:'Nickname needs 3+ letters.'}},
  rank:{mode:{words:'Words',letters:'Letters',runes:'Runes'},period:{daily:'Daily',weekly:'Weekly',monthly:'Monthly',all:'All Time'},playToEnter:'play {m} mode to enter'}},
 es:{nav:{online:'DUELO ONLINE',friends:'AMIGOS',onlineShort:'Online',friendsShort:'Amigos'},
  online:{title:'Duelo Online',bannerTitle:'Duelo Online contra un amigo',bannerSub:'Crea una sala, envía el enlace y luchen en tiempo real',
   create:'Crear Sala Online',createSub:'Genera un código y un enlace de invitación para tu rival.',createBtn:'CREAR SALA',
   join:'Entrar a una Sala',joinSub:'Pega el código (MAGO-123456) o abre el enlace recibido.',joinBtn:'ENTRAR',
   p2pNote:'Conexión directa entre los dos dispositivos (P2P) — sin servidor de juego.',
   connecting:'Abriendo el portal mágico…',joining:'Entrando a la sala {c}…',cancel:'Cancelar',back:'Volver',
   roomCode:'Código de la sala',shareHint:'Envía el enlace a tu rival — el Lobby se abre cuando entre.',inviteFor:'Invitación para {n}: envía el enlace de abajo.',
   copy:'Copiar Enlace de Invitación',copied:'¡Enlace copiado!',copyFail:'Copia el enlace de arriba',share:'Compartir',
   shareText:'⚔️ ¡Duelo de magos en Mage Animals! Sala {c} — entra por el enlace:',waitingRival:'Esperando al rival…',closeRoom:'Cerrar sala',
   host:'Anfitrión',readyTag:'¡LISTO! 🟢',waitingTag:'Esperando…',chooseMode:'Modo del duelo',hostChooses:'elige el anfitrión',
   mode:{words:'Palabras',letters:'Letras',runes:'Símbolos y Runas'},
   modeSub:{words:'Duelo de escritura clásico',letters:'Reacción rápida: 1 letra a la vez',runes:'Gestos y dibujo (ideal en el móvil)'},
   runesTouch:'Las runas están hechas para pantalla táctil — en PC puedes dibujar con el ratón.',
   imReady:'¡Estoy Listo!',notReady:'No estoy listo',start:'Iniciar Duelo',waitReady:'Se activa cuando el rival esté LISTO',leave:'Salir de la sala',
   emote:{bora:'🔥 ¡Vamos!',luck:'🍀 ¡Suerte!',wait:'⏳ Espera un minuto',gg:'🤝 ¡GG!'},
   fight:'¡LUCHA!',vs:'contra',rivalLeft:'el rival se desconectó (victoria por abandono)',record:'Online V-D',rematch:'Revancha / Lobby',
   err:{lib:'No se pudo cargar el módulo online. Revisa internet e inténtalo de nuevo.',notfound:'Sala no encontrada. Revisa el código o pide un enlace nuevo.',full:'Esa sala ya tiene dos magos.',left:'El rival salió de la sala.',badcode:'Código inválido — usa el formato MAGO-123456.',net:'Fallo de conexión. Inténtalo de nuevo.'}},
  friends:{title:'Amigos',add:'Añadir',placeholder:'Nickname del amigo',challenge:'Desafiar',remove:'Quitar',
   st:{online:'En línea',battle:'En Batalla',offline:'Desconectado'},empty:'Aún no tienes amigos — ¡añade el primero!',
   note:'Lista guardada en este dispositivo. Para duelar, el desafío crea una sala y tú envías el enlace.',
   msg:{added:'¡Amigo añadido!',dup:'Ese amigo ya está en la lista.',short:'El nickname necesita 3 letras o más.'}},
  rank:{mode:{words:'Palabras',letters:'Letras',runes:'Runas'},period:{daily:'Diario',weekly:'Semanal',monthly:'Mensual',all:'Histórico'},playToEnter:'juega el modo {m} para entrar'}}
});

// 🆔 identidade dupla + amigos por @handle
i18nExtend({
 'pt-BR':{ident:{handle:'Seu @handle',fixed:'permanente — o apelido acima você muda quando quiser',handleTip:'Seu @handle permanente: é por ele que os amigos te acham'},
  profile:{nick:'Apelido (nome de exibição)'},
  friends:{placeholder:'@handle do amigo (ex.: @luna_runas)',yourHandle:'Seu @handle',copyHandle:'Copiar meu @handle',shareHandle:'Mande para os amigos te adicionarem',
   note:'Lista salva neste aparelho (mage_friends_list). Os status são simulados até existir servidor. "Desafiar" cria a sala e copia o link.',
   msg:{added:'Amigo adicionado!',dup:'Esse @handle já está na lista.',noat:'O @handle precisa começar com @ (ex.: @luna_runas).',format:'Use 3 a 20 caracteres: letras minúsculas, números ou _ (ex.: @mago_bruno84).',self:'Esse é o seu próprio @handle 🙂'}}},
 en:{ident:{handle:'Your @handle',fixed:'permanent — you can change the nickname above any time',handleTip:'Your permanent @handle: friends find you by it'},
  profile:{nick:'Nickname (display name)'},
  friends:{placeholder:'Friend\'s @handle (e.g. @luna_runas)',yourHandle:'Your @handle',copyHandle:'Copy my @handle',shareHandle:'Send it so friends can add you',
   note:'List saved on this device (mage_friends_list). Statuses are simulated until there is a server. "Challenge" creates the room and copies the link.',
   msg:{added:'Friend added!',dup:'That @handle is already on the list.',noat:'The @handle must start with @ (e.g. @luna_runas).',format:'Use 3 to 20 characters: lowercase letters, numbers or _ (e.g. @mago_bruno84).',self:'That\'s your own @handle 🙂'}}},
 es:{ident:{handle:'Tu @handle',fixed:'permanente — el apodo de arriba lo cambias cuando quieras',handleTip:'Tu @handle permanente: así te encuentran tus amigos'},
  profile:{nick:'Apodo (nombre visible)'},
  friends:{placeholder:'@handle del amigo (ej.: @luna_runas)',yourHandle:'Tu @handle',copyHandle:'Copiar mi @handle',shareHandle:'Envíalo para que tus amigos te añadan',
   note:'Lista guardada en este dispositivo (mage_friends_list). Los estados son simulados hasta que exista servidor. "Desafiar" crea la sala y copia el enlace.',
   msg:{added:'¡Amigo añadido!',dup:'Ese @handle ya está en la lista.',noat:'El @handle debe empezar con @ (ej.: @luna_runas).',format:'Usa de 3 a 20 caracteres: minúsculas, números o _ (ej.: @mago_bruno84).',self:'Ese es tu propio @handle 🙂'}}}
});

// 📡 presença real + convite direto
i18nExtend({
 'pt-BR':{presence:{invited:'{n} te desafiou para um duelo!',accept:'Aceitar',decline:'Recusar',inv:{sending:'📨 Enviando convite direto…',sent:'✅ Convite enviado! Seu amigo recebeu um aviso na tela.',fail:'⚠️ Não deu para avisar direto — mande o link.'}},
  friends:{st:{checking:'Verificando…'},note:'Status em tempo real: aparece Online quem está com o jogo aberto. "Desafiar" cria a sala, copia o link e avisa o amigo na hora.'}},
 en:{presence:{invited:'{n} challenged you to a duel!',accept:'Accept',decline:'Decline',inv:{sending:'📨 Sending direct invite…',sent:'✅ Invite sent! Your friend got a notice on screen.',fail:'⚠️ Could not notify directly — send the link.'}},
  friends:{st:{checking:'Checking…'},note:'Real-time status: friends with the game open show as Online. "Challenge" creates the room, copies the link and notifies your friend instantly.'}},
 es:{presence:{invited:'¡{n} te desafió a un duelo!',accept:'Aceptar',decline:'Rechazar',inv:{sending:'📨 Enviando invitación directa…',sent:'✅ ¡Invitación enviada! Tu amigo recibió un aviso en pantalla.',fail:'⚠️ No se pudo avisar directo — envía el enlace.'}},
  friends:{st:{checking:'Verificando…'},note:'Estado en tiempo real: aparece En línea quien tiene el juego abierto. "Desafiar" crea la sala, copia el enlace y avisa al amigo al instante.'}}
});

// 🎁 baú que faz subir de nível
i18nExtend({
 'pt-BR':{chest:{levelUp:'Este baú te leva ao nível {l} — e cada nível novo dá +1 baú! (+{n} 🎁)'}},
 en:{chest:{levelUp:'This chest takes you to level {l} — and every new level gives +1 chest! (+{n} 🎁)'}},
 es:{chest:{levelUp:'¡Este cofre te lleva al nivel {l} — y cada nivel nuevo da +1 cofre! (+{n} 🎁)'}}
});

// 🏛️ Vila dos Magos + 📜 Crônica de Arcania
i18nExtend({
 'pt-BR':{nav:{village:'MEU REINO',villageShort:'Reino'},
  village:{title:'Meu Reino',rename:'Renomear o Reino',mana:'Mana',bonusNote:'aplicados no início de cada partida',bonusRow:'Bônus da Vila (+{n}%)',
   upgrade:'Melhorar',build:'Construir',max:'Nível máximo',collect:'Coletar {n} Aura',forgeNext:'próximo ❤ extra no Nv {n}',
   slots:'{u}/{t} vagas',assignHint:'toque num mago: Mina → Laboratório → Forja',
   nextCh:'Próximo capítulo da crônica: Santuário Nv {n}',
   why:{sanct:'Evolua o Santuário primeiro',plevel:'Requer o mago no Nv {n}',max:'Nível máximo'},
   titles:{apprentice:'Guardião Aprendiz',keeper:'Zelador das Runas',protector:'Lorde Protetor',warden:'Sentinela Arcano',archlord:'Arquilorde de Arcania'},
   eff:{sanct:'prédios até Nv {n}',mine:'{n} Aura por hora',lab:'+{x}% XP · +{m}% Mana',forge:'+{n} ❤ na torre',tavern:'{n} vaga(s) de trabalho'},
   b:{sanct:{name:'Santuário Central',desc:'O coração do Reino. Seu nível limita os outros prédios.'},
    mine:{name:'Mina de Cristais',desc:'Gera Aura sozinha, mesmo com o jogo fechado.'},
    lab:{name:'Laboratório Místico',desc:'Pesquisas que dão XP e Mana extras nas partidas.'},
    forge:{name:'Forja de Cajados',desc:'Reforça a barreira: corações extras na torre.'},
    tavern:{name:'Taverna dos Habitantes',desc:'Coloque os magos para trabalhar (+25% por mago).'}}},
  story:{start:'Começar a reconstrução',chronicle:'Crônica do Reino — Capítulo {n}',
   intro:'Por longas eras, os Magos Animais viveram em harmonia no lendário Reino de Arcania. Porém, forças sombrias destruíram suas defesas e espalharam o caos pelas terras arcanas. Até que surgiu {n} ({h})! Guiando os magos sobreviventes, o Lorde Mago assumiu a missão de erguer as barreiras, proteger as fronteiras contra as hordas e reconstruir o reino ancestral.',
   ch:{1:'Entre ruínas e brasas, só o Santuário resistiu. Os poucos magos que restaram acendem a primeira chama de esperança.',
    2:'O cristal do Santuário volta a pulsar. Nas cavernas, os mineiros encontram os primeiros veios de Aura.',
    3:'Fumaça sai das chaminés outra vez: a Forja desperta, e as muralhas ganham as primeiras runas de proteção.',
    4:'Viajantes ouvem falar do Reino renascido. A Taverna enche de vozes, canções e novos habitantes.',
    5:'O Laboratório decifra pergaminhos antigos: os feitiços ficam mais fortes, e as hordas hesitam nas fronteiras.',
    6:'Pela primeira vez em eras, as crianças brincam na praça. O povo te chama de Lorde Protetor.',
    7:'Os Sentinelas Arcanos vigiam as torres dia e noite. As sombras recuam para além das montanhas.',
    8:'Reinos vizinhos enviam emissários com presentes. Arcania volta a ser um farol de magia.',
    9:'As runas ancestrais do Santuário se acendem sozinhas — a magia da terra reconhece o seu governante.',
    10:'Arcania brilha como nos tempos lendários. Mas, nas profundezas, uma sombra antiga desperta… a lenda continua.'}}},
 en:{nav:{village:'MY KINGDOM',villageShort:'Kingdom'},
  village:{title:'My Kingdom',rename:'Rename the Kingdom',mana:'Mana',bonusNote:'applied at the start of every match',bonusRow:'Village bonus (+{n}%)',
   upgrade:'Upgrade',build:'Build',max:'Max level',collect:'Collect {n} Aura',forgeNext:'next extra ❤ at Lv {n}',
   slots:'{u}/{t} slots',assignHint:'tap a mage: Mine → Lab → Forge',
   nextCh:'Next chronicle chapter: Sanctuary Lv {n}',
   why:{sanct:'Upgrade the Sanctuary first',plevel:'Requires mage Lv {n}',max:'Max level'},
   titles:{apprentice:'Apprentice Guardian',keeper:'Rune Keeper',protector:'Lord Protector',warden:'Arcane Warden',archlord:'Archlord of Arcania'},
   eff:{sanct:'buildings up to Lv {n}',mine:'{n} Aura per hour',lab:'+{x}% XP · +{m}% Mana',forge:'+{n} ❤ on the tower',tavern:'{n} work slot(s)'},
   b:{sanct:{name:'Central Sanctuary',desc:'The heart of the Kingdom. Its level caps the other buildings.'},
    mine:{name:'Crystal Mine',desc:'Produces Aura on its own, even with the game closed.'},
    lab:{name:'Mystic Laboratory',desc:'Research that grants extra XP and Mana in matches.'},
    forge:{name:'Staff Forge',desc:'Strengthens the barrier: extra hearts on the tower.'},
    tavern:{name:'Villagers\' Tavern',desc:'Put your mages to work (+25% per mage).'}}},
  story:{start:'Begin the rebuilding',chronicle:'Kingdom Chronicle — Chapter {n}',
   intro:'For long ages, the Animal Mages lived in harmony in the legendary Kingdom of Arcania. But dark forces shattered its defenses and spread chaos across the arcane lands. Until {n} ({h}) arose! Leading the surviving mages, the Mage Lord took up the mission to raise the barriers, guard the borders against the hordes and rebuild the ancient kingdom.',
   ch:{1:'Among ruins and embers, only the Sanctuary stood. The few remaining mages light the first flame of hope.',
    2:'The Sanctuary crystal pulses again. In the caves, miners find the first veins of Aura.',
    3:'Smoke rises from the chimneys once more: the Forge awakens and the walls get their first protective runes.',
    4:'Travelers hear of the reborn Kingdom. The Tavern fills with voices, songs and new villagers.',
    5:'The Laboratory deciphers ancient scrolls: spells grow stronger and the hordes hesitate at the borders.',
    6:'For the first time in ages, children play in the square. The people call you Lord Protector.',
    7:'Arcane Wardens watch the towers day and night. The shadows retreat beyond the mountains.',
    8:'Neighboring kingdoms send envoys with gifts. Arcania is a beacon of magic once again.',
    9:'The Sanctuary\'s ancient runes light up on their own — the magic of the land recognizes its ruler.',
    10:'Arcania shines as in legendary times. But deep below, an ancient shadow awakens… the legend goes on.'}}},
 es:{nav:{village:'MI REINO',villageShort:'Reino'},
  village:{title:'Mi Reino',rename:'Renombrar el Reino',mana:'Maná',bonusNote:'aplicados al inicio de cada partida',bonusRow:'Bono de la Villa (+{n}%)',
   upgrade:'Mejorar',build:'Construir',max:'Nivel máximo',collect:'Recoger {n} Aura',forgeNext:'próximo ❤ extra en Nv {n}',
   slots:'{u}/{t} puestos',assignHint:'toca un mago: Mina → Laboratorio → Forja',
   nextCh:'Próximo capítulo de la crónica: Santuario Nv {n}',
   why:{sanct:'Mejora primero el Santuario',plevel:'Requiere el mago en Nv {n}',max:'Nivel máximo'},
   titles:{apprentice:'Guardián Aprendiz',keeper:'Custodio de Runas',protector:'Lord Protector',warden:'Centinela Arcano',archlord:'Archilord de Arcania'},
   eff:{sanct:'edificios hasta Nv {n}',mine:'{n} Aura por hora',lab:'+{x}% XP · +{m}% Maná',forge:'+{n} ❤ en la torre',tavern:'{n} puesto(s) de trabajo'},
   b:{sanct:{name:'Santuario Central',desc:'El corazón del Reino. Su nivel limita los demás edificios.'},
    mine:{name:'Mina de Cristales',desc:'Genera Aura sola, incluso con el juego cerrado.'},
    lab:{name:'Laboratorio Místico',desc:'Investigaciones que dan XP y Maná extra en las partidas.'},
    forge:{name:'Forja de Báculos',desc:'Refuerza la barrera: corazones extra en la torre.'},
    tavern:{name:'Taberna de los Habitantes',desc:'Pon a los magos a trabajar (+25% por mago).'}}},
  story:{start:'Comenzar la reconstrucción',chronicle:'Crónica del Reino — Capítulo {n}',
   intro:'Durante largas eras, los Magos Animales vivieron en armonía en el legendario Reino de Arcania. Pero fuerzas oscuras destruyeron sus defensas y sembraron el caos en las tierras arcanas. ¡Hasta que surgió {n} ({h})! Guiando a los magos sobrevivientes, el Lord Mago asumió la misión de levantar las barreras, proteger las fronteras de las hordas y reconstruir el reino ancestral.',
   ch:{1:'Entre ruinas y brasas, solo el Santuario resistió. Los pocos magos que quedan encienden la primera llama de esperanza.',
    2:'El cristal del Santuario vuelve a latir. En las cuevas, los mineros hallan las primeras vetas de Aura.',
    3:'El humo vuelve a salir de las chimeneas: la Forja despierta y las murallas reciben sus primeras runas.',
    4:'Los viajeros oyen hablar del Reino renacido. La Taberna se llena de voces, canciones y nuevos habitantes.',
    5:'El Laboratorio descifra pergaminos antiguos: los hechizos se fortalecen y las hordas dudan en las fronteras.',
    6:'Por primera vez en eras, los niños juegan en la plaza. El pueblo te llama Lord Protector.',
    7:'Los Centinelas Arcanos vigilan las torres día y noche. Las sombras retroceden más allá de las montañas.',
    8:'Los reinos vecinos envían emisarios con regalos. Arcania vuelve a ser un faro de magia.',
    9:'Las runas ancestrales del Santuario se encienden solas — la magia de la tierra reconoce a su gobernante.',
    10:'Arcania brilla como en los tiempos legendarios. Pero en las profundidades, una sombra antigua despierta… la leyenda continúa.'}}}
});

// 🗺️ placas do mapa do Reino
i18nExtend({
 'pt-BR':{village:{market:'Mercado Místico',barn:'Estábulo',b:{sanct:{short:'Santuário'},mine:{short:'Mina'},lab:{short:'Laboratório'},forge:{short:'Forja'},tavern:{short:'Taverna'}}}},
 en:{village:{market:'Mystic Market',barn:'Stable',b:{sanct:{short:'Sanctuary'},mine:{short:'Mine'},lab:{short:'Lab'},forge:{short:'Forge'},tavern:{short:'Tavern'}}}},
 es:{village:{market:'Mercado Místico',barn:'Establo',b:{sanct:{short:'Santuario'},mine:{short:'Mina'},lab:{short:'Laboratorio'},forge:{short:'Forja'},tavern:{short:'Taberna'}}}}
});

// 🏛️ cena do Reino no menu
i18nExtend({
 'pt-BR':{menu:{openKingdom:'Abrir Meu Reino',scenes:{kingdom:'🏛️ Meu Reino'}}},
 en:{menu:{openKingdom:'Open My Kingdom',scenes:{kingdom:'🏛️ My Kingdom'}}},
 es:{menu:{openKingdom:'Abrir Mi Reino',scenes:{kingdom:'🏛️ Mi Reino'}}}
});

// 🪧 tooltips ricos
i18nExtend({
 'pt-BR':{tip:{locked:'Bloqueado',level:'Requer',waves:'Ondas',lives:'Vidas',spell:'Feitiço',selected:'Mago selecionado',clickPick:'Clique para escolher',
  caster:'Mago',cast:'Lançar',space:'Espaço',active:'Disponível com o seu mago',otherMage:'Escolha o mago dono deste feitiço',
  hits:'Golpes',speed:'Velocidade',from:'Aparece',speeds:{slow:'Lenta',steady:'Firme',normal:'Normal',fast:'Rápida'},
  enemy:{rock:'O inimigo mais comum: desce em linha reta. Uma palavra e já era.',crystal:'Casca resistente: precisa de duas palavras para quebrar.',ghost:'Rápido e traiçoeiro — priorize antes que chegue à torre.',boss:'Chefe com barra de vida e tempo para cada palavra. Ganha mais vida nas ondas altas.'}}},
 en:{tip:{locked:'Locked',level:'Requires',waves:'Waves',lives:'Lives',spell:'Spell',selected:'Selected mage',clickPick:'Click to choose',
  caster:'Mage',cast:'Cast',space:'Space',active:'Available with your mage',otherMage:'Pick the mage who owns this spell',
  hits:'Hits',speed:'Speed',from:'Appears',speeds:{slow:'Slow',steady:'Steady',normal:'Normal',fast:'Fast'},
  enemy:{rock:'The most common foe: falls straight down. One word and it\'s gone.',crystal:'Tough shell: needs two words to break.',ghost:'Fast and sneaky — deal with it before it reaches the tower.',boss:'Boss with a health bar and a timer per word. Gains more health in later waves.'}}},
 es:{tip:{locked:'Bloqueado',level:'Requiere',waves:'Oleadas',lives:'Vidas',spell:'Hechizo',selected:'Mago seleccionado',clickPick:'Haz clic para elegir',
  caster:'Mago',cast:'Lanzar',space:'Espacio',active:'Disponible con tu mago',otherMage:'Elige al mago dueño de este hechizo',
  hits:'Golpes',speed:'Velocidad',from:'Aparece',speeds:{slow:'Lenta',steady:'Firme',normal:'Normal',fast:'Rápida'},
  enemy:{rock:'El enemigo más común: baja en línea recta. Una palabra y listo.',crystal:'Caparazón resistente: necesita dos palabras para romperse.',ghost:'Rápido y traicionero — atiéndelo antes de que llegue a la torre.',boss:'Jefe con barra de vida y tiempo por palabra. Gana más vida en oleadas altas.'}}}
});

// 🎁 abertura de baús com raridades
i18nExtend({
 'pt-BR':{chest:{revealing:'Revelando… (toque para pular)',skip:'Pular ⏭',collectMore:'Coletar e abrir mais ({n})',newShort:'itens novos',dupsShort:'repetidos → Aura',dupShort:'repetido → Aura',
  rarity:{common:'Comum',uncommon:'Incomum',rare:'Raro',special:'Especial',strange:'Estranho',legendary:'Lendário',unique:'Único'}}},
 en:{chest:{revealing:'Revealing… (tap to skip)',skip:'Skip ⏭',collectMore:'Collect and open more ({n})',newShort:'new items',dupsShort:'duplicates → Aura',dupShort:'duplicate → Aura',
  rarity:{common:'Common',uncommon:'Uncommon',rare:'Rare',special:'Special',strange:'Strange',legendary:'Legendary',unique:'Unique'}}},
 es:{chest:{revealing:'Revelando… (toca para saltar)',skip:'Saltar ⏭',collectMore:'Recoger y abrir más ({n})',newShort:'objetos nuevos',dupsShort:'repetidos → Aura',dupShort:'repetido → Aura',
  rarity:{common:'Común',uncommon:'Poco común',rare:'Raro',special:'Especial',strange:'Extraño',legendary:'Legendario',unique:'Único'}}}
});

// 💬 falas do menu + ❓ Como Jogar (4 abas)
i18nExtend({
 'pt-BR':{
  dlg:{lab:{game:'Dica de jogo',typing:'Dica de digitação',words:'Você sabia?'},
   game:['Sabe o segredo? Subir a Mina na Vila garante Aura mesmo quando você não está jogando!','Os baús se abrem sozinhos — e cada um pode ser de Comum até Único. Boa sorte!','Mana cheia? Aperta Espaço: chuva de Meteoros em todos os inimigos!','Chegar às ondas 3, 8 e 15 dá baú no fim da partida.','Coloque magos para trabalhar na Taverna: cada um soma +25% no prédio!'],
   typing:['Olhar para a tela em vez do teclado mantém seus combos vivos!','Deixe os indicadores nas marquinhas do F e do J — é seu ponto de partida.','Precisão vale mais que pressa: errar acelera o inimigo!','Ritmo constante ganha de rajadas. Pense em música, não em corrida.','Palavras longas? Leia em pedaços de 2 ou 3 letras.'],
   words:['“Acentuação” tem 10 letras — e com prática você digita em menos de 1 segundo!','A palavra mais comprida do dicionário tem 46 letras… ainda bem que não aparece aqui!','“Arara” e “Ovo” se leem igual de trás para frente: são palíndromos!','O ç veio do latim e do espanhol antigo: era um “z” pequenininho embaixo do c.','“Feitiço” e “fetiche” vêm da mesma palavra antiga: “feitiço” em português!']},
  howto:{tab:{battle:'Batalha',village:'Vila',chests:'Baús',tips:'Dicas'},
   battle:{comboT:'Combo e multiplicador',combo:'A cada 4 acertos seguidos o multiplicador de pontos sobe (até ×5). Errar quebra a sequência.',
    wpmT:'WPM — velocidade',wpm:'Palavras por minuto. No Duelo, o combo aumenta o dano em +8% por acerto (até +80%).',
    meteorT:'Meteoro',meteor:'Cada palavra enche a mana. Mana cheia + Espaço (ou ☄️) = Meteoros em todos os inimigos.',
    curveT:'Ondas',curve:'Onda 1: palavras de 3–5 letras. Da onda 4 em diante elas crescem aos poucos, com acentos e ç.'},
   village:{intro:'Reconstrua o Reino com a Aura que você ganha. Os bônus valem no início de cada partida.',
    sanct:'Nível do Reino: libera os outros prédios até o mesmo nível.',mine:'Gera Aura por hora, até 8 h acumuladas — mesmo com o jogo fechado.',
    lab:'Pesquisas que dão +XP e +Mana nas partidas.',forge:'Fortalece a barreira: +1 coração na torre nos níveis 3, 6 e 9.',tavern:'Vagas para os magos trabalharem: +25% por mago no prédio.',
    tip:'Colete a Mina sempre que passar pelo menu — o armazém enche e para de produzir.'},
   chests:{intro:'Todo baú dá Aura, XP e 1 item. A raridade é sorteada na hora de abrir.',how:'Como ganhar baús',
    lvlT:'Subir de nível',lvl:'+1 baú a cada nível novo.',wavesT:'Ondas 3, 8 e 15',waves:'Chegar a esses marcos dá baú no fim da partida.',
    weeklyT:'Baú semanal',weekly:'Conclua 5 missões na semana.',loginT:'Login de 7 dias',login:'O dia 7 da ofensiva traz um baú.',
    note:'Quanto mais raro, mais Aura e XP — e mais chance de item Épico ou Lendário.'},
   tips:{homeT:'Posição base',home:'Indicadores no F e no J; os outros dedos descansam na linha do meio.',
    lookT:'Olhe para a tela',look:'Confiar nos dedos libera os olhos para escolher o próximo alvo.',
    rhythmT:'Ritmo constante',rhythm:'Mantenha a cadência: precisão gera mais dano que velocidade bruta!',
    accuracyT:'Precisão primeiro',accuracy:'Cada erro acelera o inimigo por 1,5 s e quebra o combo.',
    shortT:'Leia em pedaços',short:'Divida palavras longas em sílabas de 2–3 letras.',
    postureT:'Postura e pausas',posture:'Ombros soltos e pulsos retos; uma pausa curta entre ondas ajuda.'}}},
 en:{
  dlg:{lab:{game:'Game tip',typing:'Typing tip',words:'Did you know?'},
   game:['Here\'s the secret: upgrading the Mine in the Village earns Aura even when you\'re not playing!','Chests open by themselves — and each can be anything from Common to Unique. Good luck!','Full mana? Hit Space: a rain of Meteors on every enemy!','Reaching waves 3, 8 and 15 gives a chest at the end of the match.','Put mages to work in the Tavern: each one adds +25% to the building!'],
   typing:['Looking at the screen instead of the keyboard keeps your combos alive!','Rest your index fingers on the F and J bumps — that\'s home base.','Accuracy beats speed: a miss makes the enemy faster!','A steady rhythm beats bursts. Think music, not a race.','Long words? Read them in chunks of 2 or 3 letters.'],
   words:['“Accentuation” has 12 letters — with practice you type it in under a second!','The longest English word in major dictionaries has 45 letters… good thing it\'s not here!','“Level” and “radar” read the same backwards: they\'re palindromes!','The letter “ç” comes from a tiny “z” written under the c in old Spanish.','“Spell” once meant “story” — telling a spell was casting words!']},
  howto:{tab:{battle:'Battle',village:'Village',chests:'Chests',tips:'Tips'},
   battle:{comboT:'Combo & multiplier',combo:'Every 4 hits in a row the score multiplier goes up (up to ×5). A miss breaks the streak.',
    wpmT:'WPM — speed',wpm:'Words per minute. In Duels, combo raises damage by +8% per hit (up to +80%).',
    meteorT:'Meteor',meteor:'Each word fills mana. Full mana + Space (or ☄️) = Meteors on every enemy.',
    curveT:'Waves',curve:'Wave 1: 3–5 letter words. From wave 4 on they grow gradually, with accents.'},
   village:{intro:'Rebuild the Kingdom with the Aura you earn. Bonuses apply at the start of every match.',
    sanct:'Kingdom level: unlocks the other buildings up to the same level.',mine:'Produces Aura per hour, up to 8 h stored — even with the game closed.',
    lab:'Research that grants +XP and +Mana in matches.',forge:'Strengthens the barrier: +1 tower heart at levels 3, 6 and 9.',tavern:'Work slots for your mages: +25% per mage in the building.',
    tip:'Collect the Mine whenever you pass by the menu — when storage is full it stops producing.'},
   chests:{intro:'Every chest gives Aura, XP and 1 item. Its rarity is rolled when you open it.',how:'How to earn chests',
    lvlT:'Level up',lvl:'+1 chest for every new level.',wavesT:'Waves 3, 8 and 15',waves:'Reaching these milestones gives a chest at the end of the match.',
    weeklyT:'Weekly chest',weekly:'Complete 5 missions in a week.',loginT:'7-day login',login:'Day 7 of the streak brings a chest.',
    note:'The rarer the chest, the more Aura and XP — and the better the odds of an Epic or Legendary item.'},
   tips:{homeT:'Home row',home:'Index fingers on F and J; the others rest on the middle row.',
    lookT:'Look at the screen',look:'Trusting your fingers frees your eyes to pick the next target.',
    rhythmT:'Steady rhythm',rhythm:'Keep the cadence: accuracy deals more damage than raw speed!',
    accuracyT:'Accuracy first',accuracy:'Each miss speeds the enemy up for 1.5 s and breaks the combo.',
    shortT:'Read in chunks',short:'Split long words into 2–3 letter syllables.',
    postureT:'Posture & breaks',posture:'Relaxed shoulders, straight wrists; a short break between waves helps.'}}},
 es:{
  dlg:{lab:{game:'Consejo de juego',typing:'Consejo de escritura',words:'¿Sabías que…?'},
   game:['¿El secreto? Mejorar la Mina en la Villa te da Aura incluso cuando no juegas.','Los cofres se abren solos — y cada uno puede ser de Común a Único. ¡Suerte!','¿Maná lleno? Pulsa Espacio: ¡lluvia de Meteoros sobre todos los enemigos!','Llegar a las oleadas 3, 8 y 15 da un cofre al final de la partida.','Pon magos a trabajar en la Taberna: ¡cada uno suma +25% al edificio!'],
   typing:['Mirar la pantalla en vez del teclado mantiene vivos tus combos.','Apoya los índices en las marquitas de la F y la J: ese es tu punto de partida.','La precisión vale más que la prisa: ¡fallar acelera al enemigo!','Un ritmo constante gana a las ráfagas. Piensa en música, no en carrera.','¿Palabras largas? Léelas en trozos de 2 o 3 letras.'],
   words:['“Acentuación” tiene 11 letras — ¡con práctica la escribes en menos de un segundo!','La palabra más larga del diccionario español tiene 23 letras… ¡menos mal que no sale aquí!','“Reconocer” y “anilina” se leen igual al revés: ¡son palíndromos!','La “ç” nació como una “z” pequeñita escrita debajo de la c.','“Hechizo” viene del latín “facticius”: ¡algo hecho a mano, artificial!']},
  howto:{tab:{battle:'Batalla',village:'Villa',chests:'Cofres',tips:'Consejos'},
   battle:{comboT:'Combo y multiplicador',combo:'Cada 4 aciertos seguidos el multiplicador de puntos sube (hasta ×5). Fallar rompe la racha.',
    wpmT:'PPM — velocidad',wpm:'Palabras por minuto. En el Duelo, el combo aumenta el daño +8% por acierto (hasta +80%).',
    meteorT:'Meteoro',meteor:'Cada palabra llena el maná. Maná lleno + Espacio (o ☄️) = Meteoros sobre todos los enemigos.',
    curveT:'Oleadas',curve:'Oleada 1: palabras de 3–5 letras. Desde la oleada 4 crecen poco a poco, con tildes.'},
   village:{intro:'Reconstruye el Reino con el Aura que ganas. Los bonos valen al inicio de cada partida.',
    sanct:'Nivel del Reino: desbloquea los demás edificios hasta el mismo nivel.',mine:'Genera Aura por hora, hasta 8 h acumuladas — incluso con el juego cerrado.',
    lab:'Investigaciones que dan +XP y +Maná en las partidas.',forge:'Refuerza la barrera: +1 corazón en la torre en los niveles 3, 6 y 9.',tavern:'Puestos para que trabajen tus magos: +25% por mago en el edificio.',
    tip:'Recoge la Mina cada vez que pases por el menú — si el almacén se llena, deja de producir.'},
   chests:{intro:'Cada cofre da Aura, XP y 1 objeto. La rareza se sortea al abrirlo.',how:'Cómo ganar cofres',
    lvlT:'Subir de nivel',lvl:'+1 cofre por cada nivel nuevo.',wavesT:'Oleadas 3, 8 y 15',waves:'Llegar a esos hitos da un cofre al final de la partida.',
    weeklyT:'Cofre semanal',weekly:'Completa 5 misiones en la semana.',loginT:'Login de 7 días',login:'El día 7 de la racha trae un cofre.',
    note:'Cuanto más raro, más Aura y XP — y más probabilidad de un objeto Épico o Legendario.'},
   tips:{homeT:'Posición base',home:'Índices en la F y la J; los demás dedos descansan en la fila del medio.',
    lookT:'Mira la pantalla',look:'Confiar en los dedos libera la vista para elegir el siguiente objetivo.',
    rhythmT:'Ritmo constante',rhythm:'Mantén la cadencia: ¡la precisión hace más daño que la velocidad bruta!',
    accuracyT:'Precisión primero',accuracy:'Cada fallo acelera al enemigo 1,5 s y rompe el combo.',
    shortT:'Lee en trozos',short:'Divide las palabras largas en sílabas de 2–3 letras.',
    postureT:'Postura y pausas',posture:'Hombros sueltos y muñecas rectas; una pausa corta entre oleadas ayuda.'}}}
});

// ✍️ guia de traçado das runas
i18nExtend({
 'pt-BR':{runes:{drawThis:'✍️ DESENHE',startHere:'comece no ● verde'}},
 en:{runes:{drawThis:'✍️ DRAW',startHere:'start at the green ●'}},
 es:{runes:{drawThis:'✍️ DIBUJA',startHere:'empieza en el ● verde'}}
});

// 👤 Perfil reorganizado · ✨ Habilidades · ⚙️ Ajustes · 📜 Histórico online · 📖 Lore dos magos (Reino de Valdória)
i18nExtend({
 'pt-BR':{
  nav:{skills:'Habilidades',settings:'Ajustes'},
  settings:{gameplay:'Jogabilidade',runeGuide:'Guia de traçado das runas',runeGuideHint:'Mostra no canto do campo onde começar e para onde ir em cada forma.',movedHint:'Idioma, gráficos, acentos e o guia de runas ficam em'},
  skills:{title:'Habilidade',active:'Ativa',equip:'Equipar',yours:'Sua habilidade',shared:'Poder de todos os magos',others:'Habilidades dos outros magos'},
  history:{title:'Histórico de batalhas',today:'hoje',yesterday:'ontem',f:{all:'Todas',win:'Vitórias',loss:'Derrotas'},win:'VITÓRIA',loss:'DERROTA',dc:'rival saiu',wins:'vitórias',losses:'derrotas',rate:'de aproveitamento',
   empty:'Nenhuma batalha online ainda. Crie uma sala e desafie alguém!',emptyFilter:'Nenhuma batalha com esse resultado.'},
  lore:{sec:{story:'História',origin:'Origem',past:'Passado',ties:'Vínculos',goal:'Motivação',traits:'Personalidade'},
   gato:{epithet:'O Bardo do Cometa',quote:'Toda canção boa termina com uma estrela caindo.',
    story:'Numa noite de tempestade, um cometa atravessou o telhado da Taverna do Caldeirão bem no refrão da sua balada. Em vez de fugir, ele terminou a música — e o cometa obedeceu. Desde então, seus versos acendem estrelas.',
    origin:'Brasalume, vila de pescadores às margens do Lago Espelhado, no sul do Reino de Valdória.',
    past:'Bardo de taverna e contador de causos; pagava a hospedagem com canções e leite quente.',
    ties:'Membro da Guilda dos Menestréis Errantes. Deve um favor antigo ao Barão de Valdória — e o Barão nunca esquece.',
    goal:'Compor a Canção Infinita, capaz de trazer de volta a estrela que guiava seus pais.',
    traits:'Carismático, equilibrado em combate, preguiçoso de manhã. Adora plateia: por isso rende +10% de pontos.'},
   coelho:{epithet:'A Ferreira do Relâmpago',quote:'Se eu esperar, o raio chega primeiro.',
    story:'Forjando um cajado de cristal no alto da montanha, ela foi atingida por um raio que caiu direto na bigorna. O cajado sobreviveu, ela também — e o relâmpago passou a seguir o ritmo do seu martelo.',
    origin:'Minas de Pedrazul, nas montanhas geladas do norte de Valdória.',
    past:'Filha de mineradores, foi a mensageira mais rápida da Ordem do Trovão antes de virar aprendiz de ferreira arcana.',
    ties:'Ordem do Trovão, os mensageiros do reino. Rivalidade amistosa com a Raposa: quem chega primeiro?',
    goal:'Forjar um cajado forte o bastante para deter a Tempestade Cinzenta que ameaça Pedrazul.',
    traits:'Impaciente, prática e veloz. Para ela o mundo é lento — e os inimigos andam 15% mais devagar.'},
   raposa:{epithet:'O Erudito das Chamas',quote:'Uma palavra bem escolhida queima mais que mil espadas.',
    story:'Ao ler em voz alta um grimório proibido, ele pôs fogo em meia ala da Grande Biblioteca de Lumenor. Ninguém descobriu o culpado. Ele guarda o segredo — e o livro — até hoje.',
    origin:'Lumenor, a cidade-estado das mil bibliotecas, a leste do reino.',
    past:'Ex-mercenário da Companhia Rubra. Trocou a espada pelos livros depois de uma batalha que preferia esquecer.',
    ties:'Conselheiro da Duquesa Seraphine de Lumenor. Seus antigos colegas da Companhia Rubra ainda o procuram.',
    goal:'Provar que o conhecimento vence a força — e reconstruir, em segredo, a ala que destruiu.',
    traits:'Elegante, sarcástico, viciado em chá. Suas explosões atingem todos os inimigos próximos.'},
   coruja:{epithet:'A Guardiã das Estrelas',quote:'O céu sempre avisa. Pouca gente olha para cima.',
    story:'Ela previu o eclipse que trouxe as criaturas das palavras, mas o rei não quis ouvir e a dispensou da corte. O eclipse veio. Desde então ela vigia o céu da torre mais alta, para avisar antes que seja tarde.',
    origin:'Torre de Vigília de Altanoite, no pico das Montanhas Cinzentas.',
    past:'Viajante e cartógrafa: mapeou o céu de três reinos e foi astróloga real até cair em desgraça.',
    ties:'Conselho dos Astrônomos. Troca cartas secretas com o Gato, que canta suas profecias nas tavernas.',
    goal:'Decifrar a Profecia das Palavras Perdidas e descobrir de onde vêm as criaturas.',
    traits:'Paciente, metódica, humor seco. Tem +1 vida e um erro nunca quebra seu combo.'}}},
 en:{
  nav:{skills:'Skills',settings:'Settings'},
  settings:{gameplay:'Gameplay',runeGuide:'Rune tracing guide',runeGuideHint:'Shows in the corner of the field where to start and which way to go for each shape.',movedHint:'Language, graphics, accents and the rune guide are in'},
  skills:{title:'Skill',active:'Active',equip:'Equip',yours:'Your skill',shared:'Power of every mage',others:'Other mages\' skills'},
  history:{title:'Battle history',today:'today',yesterday:'yesterday',f:{all:'All',win:'Wins',loss:'Losses'},win:'VICTORY',loss:'DEFEAT',dc:'rival left',wins:'wins',losses:'losses',rate:'win rate',
   empty:'No online battles yet. Create a room and challenge someone!',emptyFilter:'No battles with this result.'},
  lore:{sec:{story:'Story',origin:'Origin',past:'Background',ties:'Allegiances',goal:'Motivation',traits:'Personality'},
   gato:{epithet:'The Comet Bard',quote:'Every good song ends with a falling star.',
    story:'On a stormy night a comet crashed through the roof of the Cauldron Tavern right at the chorus of his ballad. Instead of running, he finished the song — and the comet obeyed. Since then his verses light up stars.',
    origin:'Brasalume, a fishing village on the shores of Mirror Lake, in the south of the Kingdom of Valdoria.',
    past:'Tavern bard and storyteller; he paid for his room with songs and warm milk.',
    ties:'Member of the Guild of Wandering Minstrels. He owes an old favor to the Baron of Valdoria — and the Baron never forgets.',
    goal:'To compose the Endless Song, able to bring back the star that guided his parents.',
    traits:'Charismatic, balanced in combat, lazy in the mornings. Loves an audience: that\'s why he earns +10% points.'},
   coelho:{epithet:'The Lightning Smith',quote:'If I wait, the lightning gets there first.',
    story:'While forging a crystal staff on a mountaintop, she was struck by lightning that hit the anvil. The staff survived, and so did she — and lightning has followed the rhythm of her hammer ever since.',
    origin:'The Bluestone Mines, in the frozen mountains of northern Valdoria.',
    past:'A miners\' daughter, she was the fastest courier of the Order of Thunder before becoming an arcane smith\'s apprentice.',
    ties:'The Order of Thunder, the kingdom\'s couriers. Friendly rivalry with the Fox: who gets there first?',
    goal:'To forge a staff strong enough to stop the Grey Storm threatening Bluestone.',
    traits:'Impatient, practical and fast. To her the world is slow — and enemies move 15% slower.'},
   raposa:{epithet:'The Flame Scholar',quote:'A well-chosen word burns hotter than a thousand swords.',
    story:'Reading a forbidden grimoire aloud, he set half a wing of Lumenor\'s Great Library on fire. No one ever found the culprit. He keeps the secret — and the book — to this day.',
    origin:'Lumenor, the city-state of a thousand libraries, east of the kingdom.',
    past:'Former mercenary of the Crimson Company. He traded his sword for books after a battle he would rather forget.',
    ties:'Advisor to Duchess Seraphine of Lumenor. His old Crimson Company comrades are still looking for him.',
    goal:'To prove that knowledge beats strength — and to secretly rebuild the wing he destroyed.',
    traits:'Elegant, sarcastic, addicted to tea. His explosions hit every nearby enemy.'},
   coruja:{epithet:'The Star Warden',quote:'The sky always warns us. Few people look up.',
    story:'She predicted the eclipse that brought the word creatures, but the king would not listen and dismissed her from court. The eclipse came. Since then she watches the sky from the highest tower, to warn everyone before it is too late.',
    origin:'Highnight Watchtower, on the peak of the Grey Mountains.',
    past:'Traveler and cartographer: she mapped the skies of three kingdoms and was royal astrologer until her fall from grace.',
    ties:'Council of Astronomers. She exchanges secret letters with the Cat, who sings her prophecies in taverns.',
    goal:'To decipher the Prophecy of Lost Words and find out where the creatures come from.',
    traits:'Patient, methodical, dry humor. She has +1 life and a miss never breaks her combo.'}}},
 es:{
  nav:{skills:'Habilidades',settings:'Ajustes'},
  settings:{gameplay:'Jugabilidad',runeGuide:'Guía de trazado de runas',runeGuideHint:'Muestra en la esquina del campo dónde empezar y hacia dónde ir en cada forma.',movedHint:'Idioma, gráficos, tildes y la guía de runas están en'},
  skills:{title:'Habilidad',active:'Activa',equip:'Equipar',yours:'Tu habilidad',shared:'Poder de todos los magos',others:'Habilidades de los otros magos'},
  history:{title:'Historial de batallas',today:'hoy',yesterday:'ayer',f:{all:'Todas',win:'Victorias',loss:'Derrotas'},win:'VICTORIA',loss:'DERROTA',dc:'el rival salió',wins:'victorias',losses:'derrotas',rate:'de efectividad',
   empty:'Aún no hay batallas online. ¡Crea una sala y desafía a alguien!',emptyFilter:'No hay batallas con ese resultado.'},
  lore:{sec:{story:'Historia',origin:'Origen',past:'Pasado',ties:'Vínculos',goal:'Motivación',traits:'Personalidad'},
   gato:{epithet:'El Bardo del Cometa',quote:'Toda buena canción termina con una estrella cayendo.',
    story:'Una noche de tormenta, un cometa atravesó el techo de la Taberna del Caldero justo en el estribillo de su balada. En vez de huir, terminó la canción — y el cometa obedeció. Desde entonces, sus versos encienden estrellas.',
    origin:'Brasalume, aldea de pescadores a orillas del Lago Espejo, en el sur del Reino de Valdoria.',
    past:'Bardo de taberna y cuentacuentos; pagaba el hospedaje con canciones y leche caliente.',
    ties:'Miembro del Gremio de Juglares Errantes. Le debe un viejo favor al Barón de Valdoria — y el Barón nunca olvida.',
    goal:'Componer la Canción Infinita, capaz de traer de vuelta la estrella que guiaba a sus padres.',
    traits:'Carismático, equilibrado en combate, perezoso por la mañana. Ama al público: por eso gana +10% de puntos.'},
   coelho:{epithet:'La Herrera del Relámpago',quote:'Si espero, el rayo llega primero.',
    story:'Forjando un bastón de cristal en lo alto de la montaña, la alcanzó un rayo que cayó directo en el yunque. El bastón sobrevivió, ella también — y desde entonces el relámpago sigue el ritmo de su martillo.',
    origin:'Las Minas de Piedrazul, en las montañas heladas del norte de Valdoria.',
    past:'Hija de mineros, fue la mensajera más rápida de la Orden del Trueno antes de ser aprendiz de herrera arcana.',
    ties:'La Orden del Trueno, los mensajeros del reino. Rivalidad amistosa con el Zorro: ¿quién llega primero?',
    goal:'Forjar un bastón lo bastante fuerte para detener la Tormenta Gris que amenaza Piedrazul.',
    traits:'Impaciente, práctica y veloz. Para ella el mundo es lento — y los enemigos van un 15% más despacio.'},
   raposa:{epithet:'El Erudito de las Llamas',quote:'Una palabra bien elegida quema más que mil espadas.',
    story:'Al leer en voz alta un grimorio prohibido, incendió media ala de la Gran Biblioteca de Lumenor. Nadie descubrió al culpable. Él guarda el secreto — y el libro — hasta hoy.',
    origin:'Lumenor, la ciudad-estado de las mil bibliotecas, al este del reino.',
    past:'Exmercenario de la Compañía Escarlata. Cambió la espada por los libros tras una batalla que prefiere olvidar.',
    ties:'Consejero de la Duquesa Seraphine de Lumenor. Sus antiguos compañeros de la Compañía Escarlata aún lo buscan.',
    goal:'Demostrar que el conocimiento vence a la fuerza — y reconstruir en secreto el ala que destruyó.',
    traits:'Elegante, sarcástico, adicto al té. Sus explosiones alcanzan a todos los enemigos cercanos.'},
   coruja:{epithet:'La Guardiana de las Estrellas',quote:'El cielo siempre avisa. Poca gente mira hacia arriba.',
    story:'Predijo el eclipse que trajo a las criaturas de las palabras, pero el rey no quiso escucharla y la expulsó de la corte. El eclipse llegó. Desde entonces vigila el cielo desde la torre más alta, para avisar antes de que sea tarde.',
    origin:'Torre de Vigía de Altanoche, en la cima de las Montañas Grises.',
    past:'Viajera y cartógrafa: trazó el cielo de tres reinos y fue astróloga real hasta caer en desgracia.',
    ties:'Consejo de Astrónomos. Intercambia cartas secretas con el Gato, que canta sus profecías en las tabernas.',
    goal:'Descifrar la Profecía de las Palabras Perdidas y descubrir de dónde vienen las criaturas.',
    traits:'Paciente, metódica, humor seco. Tiene +1 vida y un error nunca rompe su combo.'}}}
});

// rótulos curtos das abas do Perfil
i18nExtend({
 'pt-BR':{ptab:{perfil:'Perfil',chars:'Personagens',skills:'Habilidades',stats:'Estatísticas',audio:'Música',settings:'Ajustes'}},
 en:{ptab:{perfil:'Profile',chars:'Characters',skills:'Skills',stats:'Stats',audio:'Music',settings:'Settings'}},
 es:{ptab:{perfil:'Perfil',chars:'Personajes',skills:'Habilidades',stats:'Estadísticas',audio:'Música',settings:'Ajustes'}}
});

// ⚔️ Duelo online dinâmico (pvp.js): especiais, primeiro, morte súbita, série, revanche, comparação
i18nExtend({
 'pt-BR':{pvp:{first:'⚡ PRIMEIRO!',firstShort:'quem termina antes causa +30%',crit:'💥 CRÍTICO!',heal:'💛 +{n} vida',shield:'🛡️ ESCUDO!',blocked:'🛡️ BLOQUEADO',
   frozen:'❄️ CONGELADO!',iceHit:'❄️ Rival congelado!',sd:'☠️ MORTE SÚBITA',sdShort:'morte súbita aos 60 s',sdMul:'☠️ Morte súbita · dano ×{m}',ko:'K.O.!',drawTitle:'Empate',
   race:'Palavra {a} · rival {b}',series:'Série melhor de 3: {a} – {b}',seriesWin:'🏆 Você venceu a série!',seriesLose:'💀 O rival venceu a série',
   rematch:'Revanche',lobby:'Lobby',rematchWait:'Aguardando o rival aceitar a revanche…',rematchAsk:'⚔️ O rival quer revanche! Aperte Revanche (ou Enter).',rematchGo:'Revanche aceita — preparando a arena…',
   bal:'Equilibrar celular × PC',balSub:'Quem joga pelo toque causa +20% de dano.',balSame:'Os dois usam o mesmo tipo de controle: sem ajuste.',balOn:'⚖️ Equilíbrio ativo: +20% de dano no toque',
   firsts:'Primeiros',specials:'Especiais',bestWord:'Palavra mais rápida',wpmChart:'WPM ao longo da luta',waitingSum:'aguardando os números do rival…',
   away:'você saiu do jogo no meio da luta',emoteHint:'Teclas 1–4: emotes',
   recon:'RECONECTANDO…',reconSub:'Conexão perdida · aguardando {s} s',reconOk:'📡 Reconectado! A luta continua',timeout:'a reconexão demorou demais',sp:{gold:'cura',shield:'escudo',ice:'congela',crit:'crítico'}},
  history:{draw:'EMPATE',draws:'empates',quit:'abandono'}},
 en:{pvp:{first:'⚡ FIRST!',firstShort:'finish first for +30%',crit:'💥 CRITICAL!',heal:'💛 +{n} HP',shield:'🛡️ SHIELD!',blocked:'🛡️ BLOCKED',
   frozen:'❄️ FROZEN!',iceHit:'❄️ Rival frozen!',sd:'☠️ SUDDEN DEATH',sdShort:'sudden death at 60 s',sdMul:'☠️ Sudden death · damage ×{m}',ko:'K.O.!',drawTitle:'Draw',
   race:'Word {a} · rival {b}',series:'Best of 3: {a} – {b}',seriesWin:'🏆 You won the series!',seriesLose:'💀 Your rival won the series',
   rematch:'Rematch',lobby:'Lobby',rematchWait:'Waiting for your rival to accept…',rematchAsk:'⚔️ Your rival wants a rematch! Press Rematch (or Enter).',rematchGo:'Rematch accepted — preparing the arena…',
   bal:'Balance touch × PC',balSub:'The touch player deals +20% damage.',balSame:'Both use the same kind of controls: no adjustment.',balOn:'⚖️ Balance on: +20% damage on touch',
   firsts:'Firsts',specials:'Specials',bestWord:'Fastest word',wpmChart:'WPM during the fight',waitingSum:'waiting for your rival\'s numbers…',
   away:'you left the game mid-fight',emoteHint:'Keys 1–4: emotes',
   recon:'RECONNECTING…',reconSub:'Connection lost · waiting {s} s',reconOk:'📡 Reconnected! The fight goes on',timeout:'reconnecting took too long',sp:{gold:'heal',shield:'shield',ice:'freeze',crit:'critical'}},
  history:{draw:'DRAW',draws:'draws',quit:'quit'}},
 es:{pvp:{first:'⚡ ¡PRIMERO!',firstShort:'quien termina antes hace +30%',crit:'💥 ¡CRÍTICO!',heal:'💛 +{n} vida',shield:'🛡️ ¡ESCUDO!',blocked:'🛡️ BLOQUEADO',
   frozen:'❄️ ¡CONGELADO!',iceHit:'❄️ ¡Rival congelado!',sd:'☠️ MUERTE SÚBITA',sdShort:'muerte súbita a los 60 s',sdMul:'☠️ Muerte súbita · daño ×{m}',ko:'K.O.!',drawTitle:'Empate',
   race:'Palabra {a} · rival {b}',series:'Mejor de 3: {a} – {b}',seriesWin:'🏆 ¡Ganaste la serie!',seriesLose:'💀 El rival ganó la serie',
   rematch:'Revancha',lobby:'Lobby',rematchWait:'Esperando que el rival acepte…',rematchAsk:'⚔️ ¡El rival quiere revancha! Pulsa Revancha (o Enter).',rematchGo:'Revancha aceptada — preparando la arena…',
   bal:'Equilibrar móvil × PC',balSub:'Quien juega táctil hace +20% de daño.',balSame:'Ambos usan el mismo tipo de control: sin ajuste.',balOn:'⚖️ Equilibrio activo: +20% de daño táctil',
   firsts:'Primeros',specials:'Especiales',bestWord:'Palabra más rápida',wpmChart:'WPM durante la pelea',waitingSum:'esperando los números del rival…',
   away:'saliste del juego en plena pelea',emoteHint:'Teclas 1–4: emotes',
   recon:'RECONECTANDO…',reconSub:'Conexión perdida · esperando {s} s',reconOk:'📡 ¡Reconectado! La pelea sigue',timeout:'la reconexión tardó demasiado',sp:{gold:'cura',shield:'escudo',ice:'congela',crit:'crítico'}},
  history:{draw:'EMPATE',draws:'empates',quit:'abandono'}}
});

// 📖 Dicionário trilíngue (js/ui/modal-dictionary.js)
i18nExtend({
 'pt-BR':{nav:{dictionary:'Dicionário'},dict:{title:'Dicionário',sub:'As palavras dos duelos nos três idiomas — em amarelo, as que você já escreveu.',
   search:'Buscar palavra em qualquer idioma…',all:'Todos',langLabel:'Filtrar por idioma',statusLabel:'Filtrar por status',st:{all:'Todas',yes:'Já escritas',no:'Ainda não'},
   legendYes:'já escrita',legendNo:'ainda não escrita',legendNa:'não aparece no jogo nesse idioma',since:'Conta as palavras escritas a partir desta versão.',
   badgeYes:'Escrita',badgeNo:'Ainda não',count:'{n} palavras',none:'Nenhuma palavra encontrada com esses filtros.',progress:'{a} de {b}',notes:'Curiosidade',
   tipYes:'Você já escreveu esta palavra',tipNo:'Você ainda não escreveu esta palavra',tipNa:'Esta palavra não aparece no jogo em {l}',
   lang:{pt:'português',en:'inglês',es:'espanhol'},nt:{o:'Origem',f:'Falso amigo',u:'Uso'},
   cat:{mag:'Magia',ele:'Elementos e clima',cos:'Céu e cosmos',nat:'Natureza',cri:'Criaturas e animais',lug:'Lugares',obj:'Objetos e armas',gem:'Gemas e materiais',pes:'Personagens',cor:'Corpo',adj:'Qualidades',abs:'Ideias e cotidiano'}}},
 en:{nav:{dictionary:'Dictionary'},dict:{title:'Dictionary',sub:'The duel words in all three languages — the ones you have already typed are in yellow.',
   search:'Search a word in any language…',all:'All',langLabel:'Filter by language',statusLabel:'Filter by status',st:{all:'All',yes:'Typed',no:'Not yet'},
   legendYes:'already typed',legendNo:'not typed yet',legendNa:'not in the game in that language',since:'Counts words typed since this version.',
   badgeYes:'Typed',badgeNo:'Not yet',count:'{n} words',none:'No words match these filters.',progress:'{a} of {b}',notes:'Fun fact',
   tipYes:'You have already typed this word',tipNo:'You have not typed this word yet',tipNa:'This word does not appear in the game in {l}',
   lang:{pt:'Portuguese',en:'English',es:'Spanish'},nt:{o:'Origin',f:'False friend',u:'Usage'},
   cat:{mag:'Magic',ele:'Elements & weather',cos:'Sky & cosmos',nat:'Nature',cri:'Creatures & animals',lug:'Places',obj:'Objects & weapons',gem:'Gems & materials',pes:'Characters',cor:'Body',adj:'Qualities',abs:'Ideas & everyday life'}}},
 es:{nav:{dictionary:'Diccionario'},dict:{title:'Diccionario',sub:'Las palabras de los duelos en los tres idiomas: en amarillo, las que ya escribiste.',
   search:'Buscar una palabra en cualquier idioma…',all:'Todos',langLabel:'Filtrar por idioma',statusLabel:'Filtrar por estado',st:{all:'Todas',yes:'Ya escritas',no:'Aún no'},
   legendYes:'ya escrita',legendNo:'aún no escrita',legendNa:'no aparece en el juego en ese idioma',since:'Cuenta las palabras escritas desde esta versión.',
   badgeYes:'Escrita',badgeNo:'Aún no',count:'{n} palabras',none:'Ninguna palabra coincide con estos filtros.',progress:'{a} de {b}',notes:'Curiosidad',
   tipYes:'Ya escribiste esta palabra',tipNo:'Aún no escribiste esta palabra',tipNa:'Esta palabra no aparece en el juego en {l}',
   lang:{pt:'portugués',en:'inglés',es:'español'},nt:{o:'Origen',f:'Falso amigo',u:'Uso'},
   cat:{mag:'Magia',ele:'Elementos y clima',cos:'Cielo y cosmos',nat:'Naturaleza',cri:'Criaturas y animales',lug:'Lugares',obj:'Objetos y armas',gem:'Gemas y materiales',pes:'Personajes',cor:'Cuerpo',adj:'Cualidades',abs:'Ideas y vida cotidiana'}}}
});
// 👑 Meu Reino: cards dos prédios e bônus (js/systems/village.js)
i18nExtend({
 'pt-BR':{village:{now:'Agora',nextLv:'Nível {n}',onBuild:'Ao construir',notBuilt:'Não construído',missing:'Faltam {n} de Aura',workersBoost:'Habitantes: {n}',
   bonusTitle:'Bônus nas partidas',bonusLives:'Corações',chapters:'{a} de {b}',buildings:'Prédios do Reino'}},
 en:{village:{now:'Now',nextLv:'Level {n}',onBuild:'When built',notBuilt:'Not built',missing:'{n} Aura missing',workersBoost:'Villagers: {n}',
   bonusTitle:'Match bonuses',bonusLives:'Hearts',chapters:'{a} of {b}',buildings:'Kingdom buildings'}},
 es:{village:{now:'Ahora',nextLv:'Nivel {n}',onBuild:'Al construir',notBuilt:'Sin construir',missing:'Faltan {n} de Aura',workersBoost:'Habitantes: {n}',
   bonusTitle:'Bonos en las partidas',bonusLives:'Corazones',chapters:'{a} de {b}',buildings:'Edificios del Reino'}}
});
// ⚔️ Loop do arcade (js/systems/combat.js): Sobrecarga, feitiços de emergência, inimigos táticos, mini-chefe, Chuva de Cristais
i18nExtend({
 'pt-BR':{arc:{overload:'⚡ SOBRECARGA ARCANA!',overloadLost:'Sobrecarga perdida',overHud:'⚡ SOBRECARGA ×2',streak:'✦ Sequência perfeita {n}/{m}',
   frozen:'❄️ CONGELADOS!',blast:'💥 EXPLOSÃO ARCANA!',shieldBroken:'🛡️ escudo quebrado!',freezeName:'CONGELAR',blastName:'EXPLOSÃO',keySpace:'ESPAÇO',keyEnter:'ENTER',
   bonus:'CHUVA DE CRISTAIS',bonusSub:'15 s sem dano na torre — cada cristal vale Aura!',bonusHud:'💎 CHUVA DE CRISTAIS · {s}s · +{n} ✨',bonusEnd:'💎 +{n} Aura na Chuva!',
   auraMatch:'✨ Aura da partida',overN:'⚡ Sobrecargas: {n}'},
  hud:{bossWarn:'Mini-chefe! Digite a FRASE inteira, palavra por palavra'},
  input:{freeze:'Congelar',blast:'Explosão'},
  spells:{congelar:{name:'CONGELAR',sub:'Espaço',tooltip:'Gasta 60 de mana: paralisa TODOS os inimigos por 4 s (recarga 10 s).',tip:'❄️ <b>Congelar</b>: <kbd>Espaço</kbd> paralisa todos os inimigos por 4 s (60 de mana).'},
   arcana:{name:'EXPLOSÃO',sub:'Enter',tooltip:'Gasta 35 de mana: elimina o inimigo mais perigoso e atinge quem está em volta (recarga 4 s).',tip:'💥 <b>Explosão Arcana</b>: <kbd>Enter</kbd> elimina o inimigo mais perigoso (35 de mana).'}},
  tips:{common:['Dica: 5 palavras seguidas SEM ERRAR ativam a Sobrecarga Arcana: pontos e Aura em dobro!','Dica: Errou uma letra? ⌫ troca de alvo — mas quebra a sequência perfeita.','Dica: Mana sobrando? ESPAÇO congela tudo; ENTER explode o inimigo mais perigoso.','Dica: Missões diárias renovam à meia-noite. Não deixe a ofensiva cair!']},
  howto:{battle:{meteorT:'Feitiços de emergência',meteor:'Cada palavra enche a mana. Espaço (❄️) congela todos por 4 s; Enter (💥) elimina o inimigo mais perigoso. Cada um tem recarga.'}}},
 en:{arc:{overload:'⚡ ARCANE OVERLOAD!',overloadLost:'Overload lost',overHud:'⚡ OVERLOAD ×2',streak:'✦ Perfect streak {n}/{m}',
   frozen:'❄️ FROZEN!',blast:'💥 ARCANE BLAST!',shieldBroken:'🛡️ shield broken!',freezeName:'FREEZE',blastName:'BLAST',keySpace:'SPACE',keyEnter:'ENTER',
   bonus:'CRYSTAL RAIN',bonusSub:'15 s with no tower damage — every crystal is worth Aura!',bonusHud:'💎 CRYSTAL RAIN · {s}s · +{n} ✨',bonusEnd:'💎 +{n} Aura from the Rain!',
   auraMatch:'✨ Match Aura',overN:'⚡ Overloads: {n}'},
  hud:{bossWarn:'Mini-boss! Type the whole PHRASE, word by word'},
  input:{freeze:'Freeze',blast:'Blast'},
  spells:{congelar:{name:'FREEZE',sub:'Space',tooltip:'Costs 60 mana: stops EVERY enemy for 4 s (10 s cooldown).',tip:'❄️ <b>Freeze</b>: <kbd>Space</kbd> stops every enemy for 4 s (60 mana).'},
   arcana:{name:'BLAST',sub:'Enter',tooltip:'Costs 35 mana: wipes out the most dangerous enemy and hits those nearby (4 s cooldown).',tip:'💥 <b>Arcane Blast</b>: <kbd>Enter</kbd> wipes out the most dangerous enemy (35 mana).'}},
  tips:{common:['Tip: 5 words in a row with NO mistakes trigger Arcane Overload: double points and Aura!','Tip: Missed a letter? ⌫ switches target — but breaks your perfect streak.','Tip: Spare mana? SPACE freezes everything; ENTER blasts the most dangerous enemy.','Tip: Daily quests reset at midnight. Don\'t break your streak!']},
  howto:{battle:{meteorT:'Emergency spells',meteor:'Each word fills mana. Space (❄️) freezes everything for 4 s; Enter (💥) wipes out the most dangerous enemy. Each has a cooldown.'}}},
 es:{arc:{overload:'⚡ ¡SOBRECARGA ARCANA!',overloadLost:'Sobrecarga perdida',overHud:'⚡ SOBRECARGA ×2',streak:'✦ Racha perfecta {n}/{m}',
   frozen:'❄️ ¡CONGELADOS!',blast:'💥 ¡EXPLOSIÓN ARCANA!',shieldBroken:'🛡️ ¡escudo roto!',freezeName:'CONGELAR',blastName:'EXPLOSIÓN',keySpace:'ESPACIO',keyEnter:'ENTER',
   bonus:'LLUVIA DE CRISTALES',bonusSub:'15 s sin daño en la torre: ¡cada cristal vale Aura!',bonusHud:'💎 LLUVIA DE CRISTALES · {s}s · +{n} ✨',bonusEnd:'💎 ¡+{n} Aura en la Lluvia!',
   auraMatch:'✨ Aura de la partida',overN:'⚡ Sobrecargas: {n}'},
  hud:{bossWarn:'¡Mini jefe! Escribe la FRASE entera, palabra por palabra'},
  input:{freeze:'Congelar',blast:'Explosión'},
  spells:{congelar:{name:'CONGELAR',sub:'Espacio',tooltip:'Cuesta 60 de maná: paraliza a TODOS los enemigos 4 s (recarga 10 s).',tip:'❄️ <b>Congelar</b>: <kbd>Espacio</kbd> paraliza a todos los enemigos 4 s (60 de maná).'},
   arcana:{name:'EXPLOSIÓN',sub:'Enter',tooltip:'Cuesta 35 de maná: elimina al enemigo más peligroso y golpea a los de alrededor (recarga 4 s).',tip:'💥 <b>Explosión Arcana</b>: <kbd>Enter</kbd> elimina al enemigo más peligroso (35 de maná).'}},
  tips:{common:['Consejo: 5 palabras seguidas SIN ERRORES activan la Sobrecarga Arcana: ¡puntos y Aura al doble!','Consejo: ¿Fallaste una letra? ⌫ cambia de objetivo, pero rompe la racha perfecta.','Consejo: ¿Maná de sobra? ESPACIO congela todo; ENTER explota al enemigo más peligroso.','Consejo: Las misiones diarias se renuevan a medianoche. ¡No rompas tu racha!']},
  howto:{battle:{meteorT:'Hechizos de emergencia',meteor:'Cada palabra llena el maná. Espacio (❄️) congela todo 4 s; Enter (💥) elimina al enemigo más peligroso. Cada uno tiene recarga.'}}}
});
// ⚔️ nome do feitiço de emergência 💥: "Arcana" (a Raposa já tem o feitiço "Explosão")
i18nExtend({
 'pt-BR':{arc:{blastName:'ARCANA'},input:{blast:'Arcana'},spells:{arcana:{name:'ARCANA'}}},
 en:{arc:{blastName:'ARCANE'},input:{blast:'Arcane'},spells:{arcana:{name:'ARCANE'}}},
 es:{arc:{blastName:'ARCANA'},input:{blast:'Arcana'},spells:{arcana:{name:'ARCANA'}}}
});
// 🚨 tensão por proximidade · ⚡ Relâmpagos · 💥 Arcana como limpeza de pânico · 💀 derrota clara (js/systems/combat.js)
i18nExtend({
 'pt-BR':{arc:{clutch:'😮‍💨 POR UM TRIZ!',clutchN:'😮‍💨 Por um triz: {n}×',blast:'💥 ESTILHAÇOU!',
   failTitle:'A palavra que derrubou a torre',failErr:'Você digitou “{x}” no lugar de “{y}”',failStop:'Travou no “{y}”',failUntouched:'Ninguém mirou nesta palavra — ela passou direto'},
  spells:{arcana:{tooltip:'Gasta 45 de mana: estilhaça TODOS os inimigos perto da torre (recarga 6 s). Ninguém perto? Atinge o mais perigoso.',tip:'💥 <b>Arcana</b>: <kbd>Enter</kbd> ou clique no ícone — estilhaça todos os inimigos perto da torre (45 de mana).'}},
  tips:{common:{2:'Dica: Situação perdida? ENTER (ou o ícone 💥) estilhaça tudo perto da torre; ESPAÇO congela a tela.'}},
  howto:{battle:{meteor:'Cada palavra enche a mana. Espaço (❄️) congela todos por 4 s; Enter (💥) estilhaça todos os inimigos perto da torre. Cada um tem recarga.'}}},
 en:{arc:{clutch:'😮‍💨 CLOSE CALL!',clutchN:'😮‍💨 Close calls: {n}×',blast:'💥 SHATTERED!',
   failTitle:'The word that brought the tower down',failErr:'You typed “{x}” instead of “{y}”',failStop:'Stuck at “{y}”',failUntouched:'Nobody targeted this word — it walked right in'},
  spells:{arcana:{tooltip:'Costs 45 mana: shatters EVERY enemy near the tower (6 s cooldown). Nobody close? Hits the most dangerous one.',tip:'💥 <b>Arcane</b>: <kbd>Enter</kbd> or click the icon — shatters every enemy near the tower (45 mana).'}},
  tips:{common:{2:'Tip: Things look lost? ENTER (or the 💥 icon) shatters everything near the tower; SPACE freezes the screen.'}},
  howto:{battle:{meteor:'Each word fills mana. Space (❄️) freezes everything for 4 s; Enter (💥) shatters every enemy near the tower. Each has a cooldown.'}}},
 es:{arc:{clutch:'😮‍💨 ¡POR UN PELO!',clutchN:'😮‍💨 Por un pelo: {n}×',blast:'💥 ¡HECHOS AÑICOS!',
   failTitle:'La palabra que derribó la torre',failErr:'Escribiste “{x}” en lugar de “{y}”',failStop:'Te trabaste en la “{y}”',failUntouched:'Nadie apuntó a esta palabra: pasó directo'},
  spells:{arcana:{tooltip:'Cuesta 45 de maná: hace añicos a TODOS los enemigos cerca de la torre (recarga 6 s). ¿Nadie cerca? Golpea al más peligroso.',tip:'💥 <b>Arcana</b>: <kbd>Enter</kbd> o clic en el ícono — hace añicos a todos los enemigos cerca de la torre (45 de maná).'}},
  tips:{common:{2:'Consejo: ¿Todo perdido? ENTER (o el ícono 💥) hace añicos todo cerca de la torre; ESPACIO congela la pantalla.'}},
  howto:{battle:{meteor:'Cada palabra llena el maná. Espacio (❄️) congela todo 4 s; Enter (💥) hace añicos a todos los enemigos cerca de la torre. Cada uno tiene recarga.'}}}
});
// 🔁 "só mais uma": bênçãos, cristal dourado, escala do combo, desafio do dia, nêmesis, maestria e metas (combat.js · meta.js)
i18nExtend({
 'pt-BR':{arc:{gold:'🌟 CRISTAL DOURADO!',noteMile:'🎵 {n} letras seguidas!'},
  bless:{kicker:'Onda {n} vencida',title:'Escolha uma bênção',sub:'Vale até o fim desta partida — e elas se acumulam.',stack:'Nível {n}',
   quick:{n:'Faísca Veloz',d:'A Sobrecarga liga com 1 palavra perfeita a menos.'},thrift:{n:'Mana Econômica',d:'Congelar e Arcana custam 30% menos mana.'},
   cool:{n:'Relógio Arcano',d:'Recargas dos feitiços 40% mais rápidas.'},heart:{n:'Coração Extra',d:'+1 vida máxima e recupera 1 vida agora.'},
   greed:{n:'Ganância',d:'+50% de Aura (Chuva, chefes e nêmesis).'},slow:{n:'Areia do Tempo',d:'Todos os inimigos 10% mais lentos.'},
   chain:{n:'Corrente',d:'Palavras de até 4 letras ricocheteiam no inimigo mais próximo.'},calm:{n:'Calma',d:'Um erro só corta o combo pela metade.'},
   clutch:{n:'Sangue-frio',d:'“Por um triz” vale 3× e devolve 25 de mana.'},mana:{n:'Fonte de Mana',d:'+50% de mana por palavra.'}},
  daily:{title:'Desafio do dia',over:'Fim do desafio',again:'Tentar de novo',newBest:'Novo melhor de hoje!',bestToday:'Melhor de hoje: {n} (onda {w})',tries:'{n}ª tentativa',
   share:'Copiar resultado',copied:'Copiado!',shareHead:'🧙 Mage Animals · Desafio {d}',shareLine:'Onda {w} · {s} pts · {p} PPM',
   btn:'Desafio do dia',bestShort:'Hoje: {n}',new:'Novo hoje!',tip:'Mesmos inimigos e palavras para todos hoje. Bênção do dia: {b}'},
  nem:{beaten:'😈 NÊMESIS VENCIDA!',mastered:'📖 {w} DOMINADA!',overN:'Nêmesis vencidas: {n}',domN:'Palavras dominadas: {n}'},
  mast:{name:'Maestria',bar:'Maestria {c} · nv {l}',max:'Maestria máxima!',up:'{c} chegou à Maestria {l}!',
   perk:{badge:'Selo de maestria no card',halo:'Halo dourado no retrato',orbit:'Faíscas em órbita',trail:'Rastro dourado no feitiço',crown:'Coroa de Arquimago'}},
  goal:{nearScore:'Faltaram só {n} pontos para o seu recorde ({b})!',nearChest1:'Mais 1 onda e você ganhava um baú!',nearChest:'Mais {n} ondas e você ganhava um baú!',
   nearWave:'Mais 1 onda e você igualava sua melhor marca (onda {n})!',nearLevel:'Faltam só {n} XP para o nível {l}!',nearMast:'Faltam {n} de maestria para o nível {l}!',
   build:'{b} nv {l}',char:'Libere {c}',level:'Nível {l}'},
  dict:{st:{nem:'😈 Nêmesis'},nemTip:'sua nêmesis: você costuma errar esta palavra',domTip:'dominada: era nêmesis e você acertou 3× seguidas',legendNem:'Nêmesis',legendDom:'Dominada'}},
 en:{arc:{gold:'🌟 GOLDEN CRYSTAL!',noteMile:'🎵 {n} letters in a row!'},
  bless:{kicker:'Wave {n} cleared',title:'Choose a blessing',sub:'Lasts until the end of this run — and they stack.',stack:'Level {n}',
   quick:{n:'Swift Spark',d:'Overload triggers with 1 fewer perfect word.'},thrift:{n:'Thrifty Mana',d:'Freeze and Arcane cost 30% less mana.'},
   cool:{n:'Arcane Clock',d:'Spell cooldowns 40% faster.'},heart:{n:'Extra Heart',d:'+1 max life and heal 1 now.'},
   greed:{n:'Greed',d:'+50% Aura (Rain, bosses and nemeses).'},slow:{n:'Sands of Time',d:'All enemies 10% slower.'},
   chain:{n:'Chain',d:'Words of up to 4 letters bounce to the nearest enemy.'},calm:{n:'Calm',d:'A typo only halves your combo.'},
   clutch:{n:'Cold Blood',d:'“Close call” is worth 3× and refunds 25 mana.'},mana:{n:'Mana Spring',d:'+50% mana per word.'}},
  daily:{title:'Daily challenge',over:'Challenge over',again:'Try again',newBest:'New best today!',bestToday:'Best today: {n} (wave {w})',tries:'Attempt #{n}',
   share:'Copy result',copied:'Copied!',shareHead:'🧙 Mage Animals · Challenge {d}',shareLine:'Wave {w} · {s} pts · {p} WPM',
   btn:'Daily challenge',bestShort:'Today: {n}',new:'New today!',tip:'Same enemies and words for everyone today. Blessing of the day: {b}'},
  nem:{beaten:'😈 NEMESIS DEFEATED!',mastered:'📖 {w} MASTERED!',overN:'Nemeses defeated: {n}',domN:'Words mastered: {n}'},
  mast:{name:'Mastery',bar:'{c} mastery · lv {l}',max:'Max mastery!',up:'{c} reached Mastery {l}!',
   perk:{badge:'Mastery badge on the card',halo:'Golden halo on the portrait',orbit:'Orbiting sparks',trail:'Golden spell trail',crown:'Archmage crown'}},
  goal:{nearScore:'Only {n} points short of your record ({b})!',nearChest1:'One more wave and you’d get a chest!',nearChest:'{n} more waves and you’d get a chest!',
   nearWave:'One more wave and you’d tie your best (wave {n})!',nearLevel:'Only {n} XP to level {l}!',nearMast:'{n} mastery to level {l}!',
   build:'{b} lv {l}',char:'Unlock {c}',level:'Level {l}'},
  dict:{st:{nem:'😈 Nemesis'},nemTip:'your nemesis: you often miss this word',domTip:'mastered: it was a nemesis and you got it right 3× in a row',legendNem:'Nemesis',legendDom:'Mastered'}},
 es:{arc:{gold:'🌟 ¡CRISTAL DORADO!',noteMile:'🎵 ¡{n} letras seguidas!'},
  bless:{kicker:'Oleada {n} superada',title:'Elige una bendición',sub:'Dura hasta el final de esta partida — y se acumulan.',stack:'Nivel {n}',
   quick:{n:'Chispa Veloz',d:'La Sobrecarga se activa con 1 palabra perfecta menos.'},thrift:{n:'Maná Económico',d:'Congelar y Arcana cuestan 30% menos maná.'},
   cool:{n:'Reloj Arcano',d:'Recargas de hechizos 40% más rápidas.'},heart:{n:'Corazón Extra',d:'+1 vida máxima y recupera 1 vida ahora.'},
   greed:{n:'Codicia',d:'+50% de Aura (Lluvia, jefes y némesis).'},slow:{n:'Arena del Tiempo',d:'Todos los enemigos 10% más lentos.'},
   chain:{n:'Cadena',d:'Las palabras de hasta 4 letras rebotan al enemigo más cercano.'},calm:{n:'Calma',d:'Un error solo corta el combo a la mitad.'},
   clutch:{n:'Sangre Fría',d:'“Por un pelo” vale 3× y devuelve 25 de maná.'},mana:{n:'Fuente de Maná',d:'+50% de maná por palabra.'}},
  daily:{title:'Desafío del día',over:'Fin del desafío',again:'Intentar de nuevo',newBest:'¡Nuevo mejor de hoy!',bestToday:'Mejor de hoy: {n} (oleada {w})',tries:'Intento n.º {n}',
   share:'Copiar resultado',copied:'¡Copiado!',shareHead:'🧙 Mage Animals · Desafío {d}',shareLine:'Oleada {w} · {s} pts · {p} PPM',
   btn:'Desafío del día',bestShort:'Hoy: {n}',new:'¡Nuevo hoy!',tip:'Los mismos enemigos y palabras para todos hoy. Bendición del día: {b}'},
  nem:{beaten:'😈 ¡NÉMESIS VENCIDA!',mastered:'📖 ¡{w} DOMINADA!',overN:'Némesis vencidas: {n}',domN:'Palabras dominadas: {n}'},
  mast:{name:'Maestría',bar:'Maestría {c} · nv {l}',max:'¡Maestría máxima!',up:'¡{c} llegó a Maestría {l}!',
   perk:{badge:'Sello de maestría en la carta',halo:'Halo dorado en el retrato',orbit:'Chispas en órbita',trail:'Estela dorada en el hechizo',crown:'Corona de Archimago'}},
  goal:{nearScore:'¡Te faltaron solo {n} puntos para tu récord ({b})!',nearChest1:'¡Una oleada más y ganabas un cofre!',nearChest:'¡{n} oleadas más y ganabas un cofre!',
   nearWave:'¡Una oleada más e igualabas tu mejor marca (oleada {n})!',nearLevel:'¡Solo faltan {n} XP para el nivel {l}!',nearMast:'¡Faltan {n} de maestría para el nivel {l}!',
   build:'{b} nv {l}',char:'Desbloquea {c}',level:'Nivel {l}'},
  dict:{st:{nem:'😈 Némesis'},nemTip:'tu némesis: sueles fallar esta palabra',domTip:'dominada: era némesis y acertaste 3× seguidas',legendNem:'Némesis',legendDom:'Dominada'}}
});
// 🧹 rodada de polimento: WPM ativo/pico · tooltips por toque · W.O. online · missões online · conquistas de vocabulário
i18nExtend({
 'pt-BR':{results:{peak:'Pico WPM',peakTip:'Sua melhor sequência de 5 palavras seguidas'},
  bless:{tagRun:'Só nesta partida',have:'Você tem',after:'Depois',tapAgain:'Toque de novo para escolher',pressKey:'Tecla {n} ou clique para escolher',confirm:'✓ Tocar de novo',touchHint:'Toque numa carta para ver os detalhes; toque de novo para escolher.'},
  dict:{misses:'Erros',cleanRow:'Acertos seguidos',nemHelp:'Palavra que você errou {n}+ vezes. Ela volta como inimigo marcado 😈 para a revanche — acerte {m}× seguidas sem erro para dominá-la.',domHelp:'Era sua nêmesis e você dominou: acertou 3× seguidas sem erro (+{n} de Aura).'},
  history:{wo:'Vitória por W.O.'},
  quests:{d_duel:'Vença 1 Duelo (bot ou online)',w_duels:'Vença 5 Duelos na semana (bot ou online)',w_online:'Jogue 3 Duelos Online na semana'},
  achievements:{vocab100:{name:'Leitor Voraz',desc:'Escreva 100 palavras diferentes (Dicionário)'},vocab500:{name:'Lexicógrafo',desc:'Escreva 500 palavras diferentes (Dicionário)'},
   polyglot:{name:'Poliglota',desc:'Escreva 25+ palavras em PT, EN e ES'},nemesis1:{name:'Revanche',desc:'Domine 1 palavra nêmesis'},nemesis25:{name:'Senhor das Palavras',desc:'Domine 25 palavras nêmesis'},
   online5:{name:'Duelista da Rede',desc:'Vença 5 Duelos Online'}}},
 en:{results:{peak:'Peak WPM',peakTip:'Your best run of 5 words in a row'},
  bless:{tagRun:'This run only',have:'You have',after:'After',tapAgain:'Tap again to choose',pressKey:'Key {n} or click to choose',confirm:'✓ Tap again',touchHint:'Tap a card to see details; tap again to choose.'},
  dict:{misses:'Misses',cleanRow:'Clean in a row',nemHelp:'A word you missed {n}+ times. It comes back as a marked 😈 enemy for a rematch — get it right {m}× in a row to master it.',domHelp:'It was your nemesis and you mastered it: 3 clean hits in a row (+{n} Aura).'},
  history:{wo:'Win by forfeit'},
  quests:{d_duel:'Win 1 Duel (bot or online)',w_duels:'Win 5 Duels this week (bot or online)',w_online:'Play 3 Online Duels this week'},
  achievements:{vocab100:{name:'Avid Reader',desc:'Type 100 different words (Dictionary)'},vocab500:{name:'Lexicographer',desc:'Type 500 different words (Dictionary)'},
   polyglot:{name:'Polyglot',desc:'Type 25+ words in PT, EN and ES'},nemesis1:{name:'Rematch',desc:'Master 1 nemesis word'},nemesis25:{name:'Lord of Words',desc:'Master 25 nemesis words'},
   online5:{name:'Net Duelist',desc:'Win 5 Online Duels'}}},
 es:{results:{peak:'Pico PPM',peakTip:'Tu mejor racha de 5 palabras seguidas'},
  bless:{tagRun:'Solo esta partida',have:'Tienes',after:'Después',tapAgain:'Toca de nuevo para elegir',pressKey:'Tecla {n} o clic para elegir',confirm:'✓ Toca de nuevo',touchHint:'Toca una carta para ver los detalles; toca de nuevo para elegir.'},
  dict:{misses:'Errores',cleanRow:'Aciertos seguidos',nemHelp:'Palabra que fallaste {n}+ veces. Vuelve como enemigo marcado 😈 para la revancha: acierta {m}× seguidas sin error para dominarla.',domHelp:'Era tu némesis y la dominaste: 3 aciertos seguidos sin error (+{n} de Aura).'},
  history:{wo:'Victoria por abandono'},
  quests:{d_duel:'Gana 1 Duelo (bot u online)',w_duels:'Gana 5 Duelos esta semana (bot u online)',w_online:'Juega 3 Duelos Online esta semana'},
  achievements:{vocab100:{name:'Lector Voraz',desc:'Escribe 100 palabras diferentes (Diccionario)'},vocab500:{name:'Lexicógrafo',desc:'Escribe 500 palabras diferentes (Diccionario)'},
   polyglot:{name:'Políglota',desc:'Escribe 25+ palabras en PT, EN y ES'},nemesis1:{name:'Revancha',desc:'Domina 1 palabra némesis'},nemesis25:{name:'Señor de las Palabras',desc:'Domina 25 palabras némesis'},
   online5:{name:'Duelista de la Red',desc:'Gana 5 Duelos Online'}}}
});
// 🧭 painel esquerdo simplificado (grupos e rótulos em texto normal)
i18nExtend({
 'pt-BR':{side:{editNick:'Editar nome',achReady:'{n} conquista(s) para resgatar',grp:{battle:'Batalhas',progress:'Progresso',social:'Social'},
  nav:{duelBot:'Duelo contra o bot',online:'Duelo online',ranking:'Ranking',missions:'Missões',kingdom:'Meu Reino',collection:'Coleção',dictionary:'Dicionário',towers:'Torres',friends:'Amigos'},
  badge:{online:'sala aberta',claim:'{n} para resgatar',mine:'Aura acumulada na Mina',chests:'{n} baú(s) para abrir'}}},
 en:{side:{editNick:'Edit name',achReady:'{n} achievement(s) to claim',grp:{battle:'Battles',progress:'Progress',social:'Social'},
  nav:{duelBot:'Duel vs bot',online:'Online duel',ranking:'Ranking',missions:'Quests',kingdom:'My Kingdom',collection:'Collection',dictionary:'Dictionary',towers:'Towers',friends:'Friends'},
  badge:{online:'room open',claim:'{n} to claim',mine:'Aura stored in the Mine',chests:'{n} chest(s) to open'}}},
 es:{side:{editNick:'Editar nombre',achReady:'{n} logro(s) para reclamar',grp:{battle:'Batallas',progress:'Progreso',social:'Social'},
  nav:{duelBot:'Duelo contra el bot',online:'Duelo online',ranking:'Ranking',missions:'Misiones',kingdom:'Mi Reino',collection:'Colección',dictionary:'Diccionario',towers:'Torres',friends:'Amigos'},
  badge:{online:'sala abierta',claim:'{n} para reclamar',mine:'Aura acumulada en la Mina',chests:'{n} cofre(s) para abrir'}}}
});
// 👤 atalho do perfil no painel esquerdo
i18nExtend({'pt-BR':{side:{openProfile:'Ver meu perfil',nav:{profile:'Meu perfil'}}},en:{side:{openProfile:'View my profile',nav:{profile:'My profile'}}},es:{side:{openProfile:'Ver mi perfil',nav:{profile:'Mi perfil'}}}});
// 🧭 painel direito reorganizado
i18nExtend({
 'pt-BR':{side:{inUse:'Em uso',unlockShort:'🔒 Onda {w} ou Nv {l}',mySpell:'Magia · {c}',emergency:'Feitiços de emergência (todos os magos)',biomeNow:'Inimigos do bioma: {b}'}},
 en:{side:{inUse:'In use',unlockShort:'🔒 Wave {w} or Lv {l}',mySpell:'Spell · {c}',emergency:'Emergency spells (all mages)',biomeNow:'Enemies of biome: {b}'}},
 es:{side:{inUse:'En uso',unlockShort:'🔒 Oleada {w} o Nv {l}',mySpell:'Hechizo · {c}',emergency:'Hechizos de emergencia (todos los magos)',biomeNow:'Enemigos del bioma: {b}'}}
});
// 🎵 Ritmo do Bardo (GAME_STYLE 'songs' · js/systems/youtube-rhythm.js)
i18nExtend({
 'pt-BR':{style:{songs:'🎵 Músicas'},rank:{mode:{songs:'Músicas'}},song:{title:'Ritmo do Bardo',sub:'Digite no ritmo: cada palavra chega no tempo de uma batida. Terminar perto da batida vale Perfeito ✨ ou Ótimo 💫 (pontos e Aura extras).',
  drums:'Tambor do Bardo (offline)',yours:'Suas faixas do YouTube',none:'Nenhuma faixa ainda. Adicione um vídeo abaixo.',offline:'offline',play:'Tocar',delete:'Apagar faixa',add:'Adicionar faixa do YouTube',
  f:{url:'Link ou ID do vídeo',title:'Nome da faixa',offset:'1ª batida (s)',every:'Palavra a cada N batidas',chart:'Palavras com tempo (opcional) — uma por linha: "segundos palavra"'},
  save:'Salvar faixa',history:'Últimas sessões',track:'Faixa',chartN:'{n} palavras marcadas',loading:'Afinando o alaúde… carregando a música',
  drum:{slow:'Canção da Lareira',march:'Marcha da Torre',gallop:'Galope Arcano'},
  j:{perfect:'Perfeito',great:'Ótimo',ok:'Certo',miss:'Perdidas'},clearTitle:'🎵 Música completa!',overTitle:'🎵 A música parou',cleared:'faixa completa',reached:'chegou a {p}% da faixa',aura:'+{n} ✨ Aura do ritmo',
  err:{file:'O YouTube só funciona com o jogo aberto por um endereço http(s) (por exemplo, um servidor local). O Tambor do Bardo funciona offline.',net:'Não deu para carregar o YouTube (sem internet ou bloqueado).',embed:'O dono deste vídeo não permite tocar fora do YouTube. Tente outro vídeo.',video:'Vídeo indisponível ou link inválido.',url:'Cole um link do YouTube ou o ID de 11 caracteres.'}}},
 en:{style:{songs:'🎵 Songs'},rank:{mode:{songs:'Songs'}},song:{title:'Bard\'s Rhythm',sub:'Type to the beat: each word arrives on a beat. Finishing near the beat scores Perfect ✨ or Great 💫 (extra points and Aura).',
  drums:'Bard\'s Drum (offline)',yours:'Your YouTube tracks',none:'No tracks yet. Add a video below.',offline:'offline',play:'Play',delete:'Delete track',add:'Add a YouTube track',
  f:{url:'Video link or ID',title:'Track name',offset:'1st beat (s)',every:'One word every N beats',chart:'Timed words (optional) — one per line: "seconds word"'},
  save:'Save track',history:'Recent sessions',track:'Track',chartN:'{n} timed words',loading:'Tuning the lute… loading the song',
  drum:{slow:'Hearth Song',march:'Tower March',gallop:'Arcane Gallop'},
  j:{perfect:'Perfect',great:'Great',ok:'Good',miss:'Missed'},clearTitle:'🎵 Song complete!',overTitle:'🎵 The music stopped',cleared:'track complete',reached:'reached {p}% of the track',aura:'+{n} ✨ rhythm Aura',
  err:{file:'YouTube only works when the game is opened from an http(s) address (e.g. a local server). The Bard\'s Drum works offline.',net:'Could not load YouTube (offline or blocked).',embed:'The owner of this video does not allow playback outside YouTube. Try another video.',video:'Video unavailable or invalid link.',url:'Paste a YouTube link or the 11-character ID.'}}},
 es:{style:{songs:'🎵 Canciones'},rank:{mode:{songs:'Canciones'}},song:{title:'Ritmo del Bardo',sub:'Escribe al ritmo: cada palabra llega en un pulso. Terminar cerca del pulso vale Perfecto ✨ o Genial 💫 (puntos y Aura extra).',
  drums:'Tambor del Bardo (sin conexión)',yours:'Tus pistas de YouTube',none:'Aún no hay pistas. Añade un video abajo.',offline:'sin conexión',play:'Tocar',delete:'Borrar pista',add:'Añadir pista de YouTube',
  f:{url:'Enlace o ID del video',title:'Nombre de la pista',offset:'1.er pulso (s)',every:'Una palabra cada N pulsos',chart:'Palabras con tiempo (opcional) — una por línea: "segundos palabra"'},
  save:'Guardar pista',history:'Últimas sesiones',track:'Pista',chartN:'{n} palabras marcadas',loading:'Afinando el laúd… cargando la canción',
  drum:{slow:'Canción del Hogar',march:'Marcha de la Torre',gallop:'Galope Arcano'},
  j:{perfect:'Perfecto',great:'Genial',ok:'Bien',miss:'Perdidas'},clearTitle:'🎵 ¡Canción completa!',overTitle:'🎵 La música se detuvo',cleared:'pista completa',reached:'llegó al {p}% de la pista',aura:'+{n} ✨ Aura del ritmo',
  err:{file:'YouTube solo funciona con el juego abierto desde una dirección http(s) (por ejemplo, un servidor local). El Tambor del Bardo funciona sin conexión.',net:'No se pudo cargar YouTube (sin conexión o bloqueado).',embed:'El dueño de este video no permite reproducirlo fuera de YouTube. Prueba otro video.',video:'Video no disponible o enlace inválido.',url:'Pega un enlace de YouTube o el ID de 11 caracteres.'}}}
});
// ✏️ editor de mapa ao vivo do Ritmo do Bardo
i18nExtend({
 'pt-BR':{song:{ed:{map:'Mapear',title:'Gravar mapa',help:'Escreva as palavras na ordem em que devem aparecer (uma por linha ou separadas por espaço). Depois aperte Gravar: o vídeo toca do começo e você aperta ESPAÇO (ou o botão grande) na batida de cada palavra.',
  ph:'magia dragão estrela…',rec:'Gravar',back:'Voltar',next:'Próxima palavra',tap:'Marcar',space:'ESPAÇO',undo:'Desfazer',stop:'Parar',shift:'Ajuste de todas:',check:'Conferir',
  save:'Salvar mapa',saveplay:'Salvar e jogar',redo:'Gravar de novo',empty:'Nenhuma palavra marcada.',noWords:'Escreva pelo menos uma palavra.',checking:'Conferindo: cada palavra aparece no tempo marcado. Ajuste ±0,05 s se estiver adiantada ou atrasada.'}}},
 en:{song:{ed:{map:'Map',title:'Record map',help:'Write the words in the order they should appear (one per line or separated by spaces). Then press Record: the video plays from the start and you press SPACE (or the big button) on the beat of each word.',
  ph:'magic dragon star…',rec:'Record',back:'Back',next:'Next word',tap:'Mark',space:'SPACE',undo:'Undo',stop:'Stop',shift:'Shift all:',check:'Review',
  save:'Save map',saveplay:'Save and play',redo:'Record again',empty:'No words marked.',noWords:'Write at least one word.',checking:'Reviewing: each word appears at its marked time. Shift ±0.05 s if it feels early or late.'}}},
 es:{song:{ed:{map:'Mapear',title:'Grabar mapa',help:'Escribe las palabras en el orden en que deben aparecer (una por línea o separadas por espacio). Luego pulsa Grabar: el video suena desde el inicio y pulsas ESPACIO (o el botón grande) en el pulso de cada palabra.',
  ph:'magia dragón estrella…',rec:'Grabar',back:'Volver',next:'Siguiente palabra',tap:'Marcar',space:'ESPACIO',undo:'Deshacer',stop:'Parar',shift:'Ajuste de todas:',check:'Revisar',
  save:'Guardar mapa',saveplay:'Guardar y jugar',redo:'Grabar de nuevo',empty:'Ninguna palabra marcada.',noWords:'Escribe al menos una palabra.',checking:'Revisando: cada palabra aparece en su tiempo marcado. Ajusta ±0,05 s si va adelantada o atrasada.'}}}
});
// 🎯 Ritmo do Bardo — modo automático ("só colar o link")
i18nExtend({
 'pt-BR':{song:{quick:{ph:'Cole o link do YouTube aqui',play:'Jogar',hint:'Só isso: as palavras entram sozinhas no ritmo da música. O vídeo aparece numa moldura ao lado do jogo.'},ready:'Faixas prontas (funcionam offline)',auto:'automático',
  adv:'Avançado / Modo editor',advHint:'Opcional. Deixe o BPM em branco para o modo automático, ou use ✏️ Mapear numa faixa para marcar cada palavra na batida.'}},
 en:{song:{quick:{ph:'Paste the YouTube link here',play:'Play',hint:'That\'s it: words arrive on their own to the beat of the song. The video shows in a frame next to the game.'},ready:'Ready tracks (work offline)',auto:'automatic',
  adv:'Advanced / Editor mode',advHint:'Optional. Leave BPM blank for automatic mode, or use ✏️ Map on a track to mark each word on the beat.'}},
 es:{song:{quick:{ph:'Pega aquí el enlace de YouTube',play:'Jugar',hint:'Eso es todo: las palabras llegan solas al ritmo de la canción. El video aparece en un marco junto al juego.'},ready:'Pistas listas (funcionan sin conexión)',auto:'automático',
  adv:'Avanzado / Modo editor',advHint:'Opcional. Deja el BPM vacío para el modo automático, o usa ✏️ Mapear en una pista para marcar cada palabra en el pulso.'}}
});
// 📋 missões rotativas + 📊 estatísticas profundas
i18nExtend({
 'pt-BR':{missions:{sumDone:'{a} de {b} concluídas',rotateDaily:'Novas missões todo dia à meia-noite',rotateWeekly:'Novas missões toda segunda-feira',readyN:'{n} para resgatar',
   cat:{type:'Digitação',battle:'Batalha',duel:'Duelo',realm:'Reino',music:'Música'}},
  quests:{d_acc:'Termine 2 partidas com 95%+ de precisão',d_spells:'Use 3 feitiços de emergência',d_combo:'Faça um combo de 25',d_nem:'Vença 2 nêmesis',d_wave:'Alcance a Onda 8',
   d_village:'Colete ou evolua no Reino 2 vezes',d_songs:'Jogue 1 música no Ritmo do Bardo',d_games:'Jogue 3 partidas',
   w_onwin:'Vença 2 duelos online',w_acc:'Termine 8 partidas com 95%+ de precisão',w_spells:'Use 20 feitiços de emergência',w_nem:'Vença 10 nêmesis',w_village:'Colete ou evolua no Reino 10 vezes',
   w_combo:'Faça um combo de 50',w_perfect:'Acerte 60 notas Perfeitas no Ritmo do Bardo'},
  stats:{d:{title:'Seus números',peak:'Pico de WPM',combo:'Maior combo',vocab:'Palavras diferentes',dom:'Palavras dominadas',nem:'Nêmesis ativas',online:'Online (V–D)',songs:'Músicas (completas)',perfects:'Notas Perfeitas',
   mastery:'Maestria dos magos',max:'nível máximo',nemTitle:'Suas nêmesis',misses:'{n} erros',noNem:'Nenhuma nêmesis ainda — palavras que você erra várias vezes aparecem aqui.'}}},
 en:{missions:{sumDone:'{a} of {b} done',rotateDaily:'New missions every day at midnight',rotateWeekly:'New missions every Monday',readyN:'{n} to claim',
   cat:{type:'Typing',battle:'Battle',duel:'Duel',realm:'Realm',music:'Music'}},
  quests:{d_acc:'Finish 2 games with 95%+ accuracy',d_spells:'Use 3 emergency spells',d_combo:'Reach a 25 combo',d_nem:'Beat 2 nemeses',d_wave:'Reach Wave 8',
   d_village:'Collect or upgrade in the Realm 2 times',d_songs:'Play 1 song in Bard\'s Rhythm',d_games:'Play 3 games',
   w_onwin:'Win 2 online duels',w_acc:'Finish 8 games with 95%+ accuracy',w_spells:'Use 20 emergency spells',w_nem:'Beat 10 nemeses',w_village:'Collect or upgrade in the Realm 10 times',
   w_combo:'Reach a 50 combo',w_perfect:'Hit 60 Perfect notes in Bard\'s Rhythm'},
  stats:{d:{title:'Your numbers',peak:'Peak WPM',combo:'Best combo',vocab:'Different words',dom:'Mastered words',nem:'Active nemeses',online:'Online (W–L)',songs:'Songs (cleared)',perfects:'Perfect notes',
   mastery:'Mage mastery',max:'max level',nemTitle:'Your nemeses',misses:'{n} misses',noNem:'No nemesis yet — words you keep missing show up here.'}}},
 es:{missions:{sumDone:'{a} de {b} completadas',rotateDaily:'Misiones nuevas cada día a medianoche',rotateWeekly:'Misiones nuevas cada lunes',readyN:'{n} para reclamar',
   cat:{type:'Escritura',battle:'Batalla',duel:'Duelo',realm:'Reino',music:'Música'}},
  quests:{d_acc:'Termina 2 partidas con 95%+ de precisión',d_spells:'Usa 3 hechizos de emergencia',d_combo:'Haz un combo de 25',d_nem:'Vence 2 némesis',d_wave:'Alcanza la Oleada 8',
   d_village:'Recolecta o mejora en el Reino 2 veces',d_songs:'Juega 1 canción en Ritmo del Bardo',d_games:'Juega 3 partidas',
   w_onwin:'Gana 2 duelos online',w_acc:'Termina 8 partidas con 95%+ de precisión',w_spells:'Usa 20 hechizos de emergencia',w_nem:'Vence 10 némesis',w_village:'Recolecta o mejora en el Reino 10 veces',
   w_combo:'Haz un combo de 50',w_perfect:'Logra 60 notas Perfectas en Ritmo del Bardo'},
  stats:{d:{title:'Tus números',peak:'Pico de WPM',combo:'Mejor combo',vocab:'Palabras distintas',dom:'Palabras dominadas',nem:'Némesis activas',online:'Online (V–D)',songs:'Canciones (completas)',perfects:'Notas Perfectas',
   mastery:'Maestría de los magos',max:'nivel máximo',nemTitle:'Tus némesis',misses:'{n} fallos',noNem:'Aún no hay némesis: las palabras que fallas varias veces aparecen aquí.'}}}
});
// 👕 Coleção: tooltip rico, progresso por categoria e resumo do baú
i18nExtend({
 'pt-BR':{col:{progress:'Coleção completa',tip:{src:'Mais comum em',locked:'Item ainda não descoberto. Abra baús para encontrá-lo — repetidos viram Aura.',find:'Encontrado em baús',eqOn:'Equipado — toque em Equipado para remover',eqOff:'Toque em Equipar para vestir',
   fx:{common:'Bônus passivo pequeno, ativo em todas as partidas.',rare:'Bônus passivo maior, ativo em todas as partidas.',epic:'Bônus passivo forte + brilho suave no mago.',legendary:'Bônus passivo máximo + partículas especiais ao lançar feitiços.'}}},
  chest:{newTag:'NOVO',catDone:'Categoria completa: {c}!'}},
 en:{col:{progress:'Collection complete',tip:{src:'Most common in',locked:'Item not discovered yet. Open chests to find it — duplicates turn into Aura.',find:'Found in chests',eqOn:'Equipped — tap Equipped to remove',eqOff:'Tap Equip to wear it',
   fx:{common:'Small passive bonus, active in every game.',rare:'Bigger passive bonus, active in every game.',epic:'Strong passive bonus + soft glow on the mage.',legendary:'Maximum passive bonus + special particles when casting.'}}},
  chest:{newTag:'NEW',catDone:'Category complete: {c}!'}},
 es:{col:{progress:'Colección completa',tip:{src:'Más común en',locked:'Objeto aún no descubierto. Abre cofres para encontrarlo — los repetidos se convierten en Aura.',find:'Se encuentra en cofres',eqOn:'Equipado — toca Equipado para quitarlo',eqOff:'Toca Equipar para ponértelo',
   fx:{common:'Bonificación pasiva pequeña, activa en todas las partidas.',rare:'Bonificación pasiva mayor, activa en todas las partidas.',epic:'Bonificación pasiva fuerte + brillo suave en el mago.',legendary:'Bonificación pasiva máxima + partículas especiales al lanzar hechizos.'}}},
  chest:{newTag:'NUEVO',catDone:'¡Categoría completa: {c}!'}}
});
// 👑 Meu Reino em abas + 📜 Crônica em linha do tempo
i18nExtend({
 'pt-BR':{village:{tab:{realm:'Reino',story:'Crônica',build:'Prédios'},st:{title:'Crônica do Reino',prologue:'Prólogo',chapter:'Capítulo {n}',newTag:'NOVO',new:'Novo capítulo para ler!',current:'Capítulo atual',read:'Ler',
  how:'Evolua o Santuário Central (aba Prédios) para destravar o próximo capítulo.'}}},
 en:{village:{tab:{realm:'Realm',story:'Chronicle',build:'Buildings'},st:{title:'Realm Chronicle',prologue:'Prologue',chapter:'Chapter {n}',newTag:'NEW',new:'New chapter to read!',current:'Current chapter',read:'Read',
  how:'Upgrade the Central Sanctuary (Buildings tab) to unlock the next chapter.'}}},
 es:{village:{tab:{realm:'Reino',story:'Crónica',build:'Edificios'},st:{title:'Crónica del Reino',prologue:'Prólogo',chapter:'Capítulo {n}',newTag:'NUEVO',new:'¡Nuevo capítulo para leer!',current:'Capítulo actual',read:'Leer',
  how:'Mejora el Santuario Central (pestaña Edificios) para desbloquear el siguiente capítulo.'}}}
});
// 🎤 modo frase (letra do jogador) + 📃 playlist
i18nExtend({
 'pt-BR':{song:{chorus:'★ Refrão!',lyricsN:'{n} frases',f:{lrc:'Letra sincronizada (LRC, opcional) — cole o arquivo .lrc da música'},
  ed:{map:'Letra & mapa',linesMode:'Uma frase por linha (letra da música) — ESPAÇO marca o início de cada frase',phLines:'Cole aqui a letra: uma frase por linha.\nOu cole um arquivo LRC ([00:12.40] frase) — ele já vem sincronizado.'},
  pl:{loading:'Lendo a playlist…',next:'Próxima música ({a}/{b})'},err:{pl:'Não deu para ler essa playlist (privada, vazia ou bloqueada).'},
  quick:{hint:'Cole o link de um vídeo ou de uma playlist e jogue. Quer digitar a letra? Use ✏️ Letra & mapa na faixa.'}}},
 en:{song:{chorus:'★ Chorus!',lyricsN:'{n} lines',f:{lrc:'Synced lyrics (LRC, optional) — paste the song\'s .lrc file'},
  ed:{map:'Lyrics & map',linesMode:'One line per row (song lyrics) — SPACE marks the start of each line',phLines:'Paste the lyrics here: one line per row.\nOr paste an LRC file ([00:12.40] line) — it is already synced.'},
  pl:{loading:'Reading the playlist…',next:'Next song ({a}/{b})'},err:{pl:'Could not read this playlist (private, empty or blocked).'},
  quick:{hint:'Paste a video or playlist link and play. Want to type the lyrics? Use ✏️ Lyrics & map on the track.'}}},
 es:{song:{chorus:'★ ¡Estribillo!',lyricsN:'{n} frases',f:{lrc:'Letra sincronizada (LRC, opcional) — pega el archivo .lrc de la canción'},
  ed:{map:'Letra y mapa',linesMode:'Una frase por línea (letra de la canción) — ESPACIO marca el inicio de cada frase',phLines:'Pega aquí la letra: una frase por línea.\nO pega un archivo LRC ([00:12.40] frase) — ya viene sincronizado.'},
  pl:{loading:'Leyendo la playlist…',next:'Siguiente canción ({a}/{b})'},err:{pl:'No se pudo leer esta playlist (privada, vacía o bloqueada).'},
  quick:{hint:'Pega el enlace de un video o de una playlist y juega. ¿Quieres escribir la letra? Usa ✏️ Letra y mapa en la pista.'}}}
});
// 🥁 Sincronizar batida
i18nExtend({
 'pt-BR':{song:{sync:{btn:'Sincronizar batida',help:'A música toca do começo. Bata ESPAÇO (ou toque no círculo) em cada batida, uns 10–15 toques. O círculo passa a pulsar sozinho na batida calculada: se estiver junto com a música, salve.',
  taps:'toques',need:'faltam {n}',first:'1ª batida:',quality:'precisão:',save:'Salvar batida',restart:'Recomeçar'}}},
 en:{song:{sync:{btn:'Sync the beat',help:'The song plays from the start. Tap SPACE (or the circle) on every beat, about 10–15 taps. The circle then pulses on the computed beat by itself: if it matches the music, save.',
  taps:'taps',need:'{n} to go',first:'1st beat:',quality:'precision:',save:'Save beat',restart:'Restart'}}},
 es:{song:{sync:{btn:'Sincronizar pulso',help:'La canción suena desde el inicio. Pulsa ESPACIO (o toca el círculo) en cada pulso, unos 10–15 toques. El círculo late solo en el pulso calculado: si coincide con la música, guarda.',
  taps:'toques',need:'faltan {n}',first:'1.er pulso:',quality:'precisión:',save:'Guardar pulso',restart:'Reiniciar'}}}
});
// 🥁 Sincronizar batida — mais toques e estimativa de deriva
i18nExtend({
 'pt-BR':{song:{sync:{help:'A música toca do começo. Bata ESPAÇO (ou toque no círculo) em cada batida — uns 20 a 30 toques (≈15 s). O círculo passa a pulsar sozinho na batida calculada; quando a deriva ficar ✨ e o pulso estiver junto da música, salve.',drift:'deriva ±{s} s em 3 min'}}},
 en:{song:{sync:{help:'The song plays from the start. Tap SPACE (or the circle) on every beat — about 20 to 30 taps (≈15 s). The circle then pulses on the computed beat; when drift shows ✨ and the pulse matches the music, save.',drift:'drift ±{s} s over 3 min'}}},
 es:{song:{sync:{help:'La canción suena desde el inicio. Pulsa ESPACIO (o toca el círculo) en cada pulso — unos 20 a 30 toques (≈15 s). El círculo late solo en el pulso calculado; cuando la deriva sea ✨ y el pulso coincida con la música, guarda.',drift:'deriva ±{s} s en 3 min'}}}
});
// 📺 anúncio/carregamento no vídeo
i18nExtend({'pt-BR':{song:{stall:'Anúncio ou carregando… a partida espera'}},en:{song:{stall:'Ad or loading… the game waits'}},es:{song:{stall:'Anuncio o cargando… la partida espera'}}});
i18nExtend({'pt-BR':{song:{stallTip:'Nada se perde: tudo continua quando a música voltar · pode clicar em “Pular” no vídeo',adTip:'📺 Anúncio? Clique em “Pular”',adWait:'Anúncio no vídeo? Clique em “Pular” no vídeo — a partida começa sozinha'}},
 en:{song:{stallTip:'Nothing is lost: it all resumes when the music is back · you can click “Skip” on the video',adTip:'📺 Ad? Click “Skip”',adWait:'Ad on the video? Click “Skip” on the video — the match starts by itself'}},
 es:{song:{stallTip:'No se pierde nada: todo sigue cuando vuelva la música · puedes pulsar “Omitir” en el video',adTip:'📺 ¿Anuncio? Pulsa “Omitir”',adWait:'¿Anuncio en el video? Pulsa “Omitir” en el video — la partida empieza sola'}}});
// 🎤 letra sincronizada direto na barra de link
i18nExtend({
 'pt-BR':{song:{quick:{lrc:'Tenho a letra sincronizada (LRC) — opcional',lrcHint:'Cole o conteúdo de um arquivo .lrc desta música: cada frase vira um Asteroide do Bardo no momento em que é cantada. Sem letra, o jogo usa palavras próprias no ritmo.'},err:{lrc:'Não reconheci a letra: cada linha precisa começar com o tempo, como [00:18.50].'}}},
 en:{song:{quick:{lrc:'I have the synced lyrics (LRC) — optional',lrcHint:'Paste the contents of this song\'s .lrc file: each line becomes a Bard Asteroid right when it is sung. Without lyrics, the game uses its own words to the beat.'},err:{lrc:'Lyrics not recognized: each line must start with a timestamp, like [00:18.50].'}}},
 es:{song:{quick:{lrc:'Tengo la letra sincronizada (LRC) — opcional',lrcHint:'Pega el contenido de un archivo .lrc de esta canción: cada frase se vuelve un Asteroide del Bardo justo cuando se canta. Sin letra, el juego usa sus propias palabras al ritmo.'},err:{lrc:'No reconocí la letra: cada línea debe empezar con el tiempo, como [00:18.50].'}}}
});
// 🎞️ transcrição do YouTube + legendas .srt/.vtt
i18nExtend({
 'pt-BR':{song:{quick:{lrc:'Tenho a legenda/letra com os tempos — opcional',file:'Abrir arquivo .srt, .vtt ou .lrc',found:'{n} frases encontradas',
   lrcHint:'Funciona com: a transcrição do YouTube (embaixo do vídeo → ⋯ → Mostrar transcrição → selecione e copie tudo), legendas .srt/.vtt ou .lrc. Cada frase vira um Asteroide do Bardo no momento em que é falada ou cantada.'},
  f:{lrc:'Frases com tempo (transcrição do YouTube, .srt, .vtt ou .lrc)'},ed:{phLines:'Cole aqui a letra (uma frase por linha) — ou a transcrição do YouTube, uma legenda .srt/.vtt ou um .lrc, que já vêm sincronizados.'},
  err:{lrc:'Não encontrei os tempos: cole a transcrição do YouTube, uma legenda .srt/.vtt ou um .lrc.'}}},
 en:{song:{quick:{lrc:'I have the subtitles/lyrics with timings — optional',file:'Open a .srt, .vtt or .lrc file',found:'{n} lines found',
   lrcHint:'Works with: the YouTube transcript (below the video → ⋯ → Show transcript → select and copy everything), .srt/.vtt subtitles or .lrc. Each line becomes a Bard Asteroid right when it is spoken or sung.'},
  f:{lrc:'Timed lines (YouTube transcript, .srt, .vtt or .lrc)'},ed:{phLines:'Paste the lyrics here (one line per row) — or the YouTube transcript, a .srt/.vtt subtitle or a .lrc, which are already synced.'},
  err:{lrc:'No timings found: paste the YouTube transcript, a .srt/.vtt subtitle or a .lrc.'}}},
 es:{song:{quick:{lrc:'Tengo los subtítulos/letra con los tiempos — opcional',file:'Abrir archivo .srt, .vtt o .lrc',found:'{n} frases encontradas',
   lrcHint:'Funciona con: la transcripción de YouTube (debajo del video → ⋯ → Mostrar transcripción → selecciona y copia todo), subtítulos .srt/.vtt o .lrc. Cada frase se vuelve un Asteroide del Bardo justo cuando se dice o se canta.'},
  f:{lrc:'Frases con tiempo (transcripción de YouTube, .srt, .vtt o .lrc)'},ed:{phLines:'Pega aquí la letra (una frase por línea) — o la transcripción de YouTube, un subtítulo .srt/.vtt o un .lrc, que ya vienen sincronizados.'},
  err:{lrc:'No encontré los tiempos: pega la transcripción de YouTube, un subtítulo .srt/.vtt o un .lrc.'}}}
});
// 🎞️ servidor de legendas (Cloudflare Worker)
i18nExtend({
 'pt-BR':{song:{cap:{loading:'Buscando a legenda do vídeo…',hint:'Só cole o link e jogue: as frases vêm das legendas do próprio vídeo, no tempo da fala. Vídeo sem legenda usa palavras no ritmo.',
   api:'Servidor de legendas (URL do seu Worker na Cloudflare)',apiHint:'Com o servidor configurado, as frases vêm sozinhas das legendas do vídeo. Vale só para este navegador.',apiBuiltIn:'O jogo já vem com um servidor configurado; preencha só se quiser usar outro.',badUrl:'Use o endereço completo do Worker, começando com https://'}}},
 en:{song:{cap:{loading:'Fetching the video subtitles…',hint:'Just paste the link and play: lines come from the video\'s own subtitles, timed to the speech. Videos without subtitles use words to the beat.',
   api:'Subtitle server (your Cloudflare Worker URL)',apiHint:'With the server set, lines come straight from the video subtitles. Applies to this browser only.',apiBuiltIn:'The game already ships with a server; fill this only to use another one.',badUrl:'Use the full Worker address, starting with https://'}}},
 es:{song:{cap:{loading:'Buscando los subtítulos del video…',hint:'Solo pega el enlace y juega: las frases vienen de los subtítulos del propio video, al ritmo del habla. Videos sin subtítulos usan palabras al ritmo.',
   api:'Servidor de subtítulos (URL de tu Worker en Cloudflare)',apiHint:'Con el servidor configurado, las frases vienen solas de los subtítulos del video. Solo vale para este navegador.',apiBuiltIn:'El juego ya trae un servidor configurado; rellena solo si quieres usar otro.',badUrl:'Usa la dirección completa del Worker, empezando por https://'}}}
});
// 🎚️ dificuldade do modo frase
i18nExtend({
 'pt-BR':{song:{diff:{title:'Dificuldade das frases',easy:'Fácil',normal:'Normal',full:'Completo',
   easyTip:'Fácil: só as palavras-chave de cada frase (a frase inteira aparece de apoio) e bem mais tempo para terminar.',
   normalTip:'Normal: a frase inteira, com mais tempo depois que ela é cantada.',
   fullTip:'Completo: a frase inteira no ritmo do cantor — para quem digita rápido.'}}},
 en:{song:{diff:{title:'Line difficulty',easy:'Easy',normal:'Normal',full:'Full',
   easyTip:'Easy: only the key words of each line (the full line shows as a guide) and much more time to finish.',
   normalTip:'Normal: the whole line, with extra time after it is sung.',
   fullTip:'Full: the whole line at the singer\'s pace — for fast typists.'}}},
 es:{song:{diff:{title:'Dificultad de las frases',easy:'Fácil',normal:'Normal',full:'Completo',
   easyTip:'Fácil: solo las palabras clave de cada frase (la frase completa aparece de apoyo) y mucho más tiempo para terminar.',
   normalTip:'Normal: la frase completa, con más tiempo después de cantada.',
   fullTip:'Completo: la frase completa al ritmo del cantante — para quien escribe rápido.'}}}
});
// 🎵 painel da música
i18nExtend({'pt-BR':{song:{side:{noLyrics:'Esta música está sem legenda: as palavras chegam no ritmo da batida.'}}},en:{song:{side:{noLyrics:'This song has no subtitles: words arrive on the beat.'}}},es:{song:{side:{noLyrics:'Esta canción no tiene subtítulos: las palabras llegan al ritmo del pulso.'}}}});
// 🏷️ selo de letra salva + pausa do servidor
i18nExtend({
 'pt-BR':{song:{cap:{ok:'letra salva',okTip:'Frases já baixadas: joga com a letra sincronizada, sem pedir nada ao servidor.',days:'{n} dia(s)',old:'letra vencida (busca de novo ao tocar)',wait:'sem letra por enquanto (tenta de novo mais tarde)',auto:'letra buscada ao tocar',
   note:'✅ = letra salva neste navegador. Por enquanto cada letra fica salva por 7 dias; depois disso é buscada de novo quando você tocar a música.',cool:'Servidor de legendas em pausa: tenta de novo em ~{m} min. Enquanto isso, a música toca com palavras no ritmo.'}}},
 en:{song:{cap:{ok:'lyrics saved',okTip:'Lines already downloaded: plays with synced lyrics without asking the server.',days:'{n} day(s)',old:'lyrics expired (fetched again on play)',wait:'no lyrics yet (retries later)',auto:'lyrics fetched on play',
   note:'✅ = lyrics saved in this browser. For now each set of lyrics is kept for 7 days; after that it is fetched again when you play the song.',cool:'Subtitle server paused: retrying in ~{m} min. Meanwhile the song plays with words to the beat.'}}},
 es:{song:{cap:{ok:'letra guardada',okTip:'Frases ya descargadas: juega con la letra sincronizada sin pedir nada al servidor.',days:'{n} día(s)',old:'letra vencida (se busca de nuevo al tocar)',wait:'sin letra por ahora (reintenta más tarde)',auto:'letra buscada al tocar',
   note:'✅ = letra guardada en este navegador. Por ahora cada letra se guarda 7 días; después se busca de nuevo cuando toques la canción.',cool:'Servidor de subtítulos en pausa: reintenta en ~{m} min. Mientras tanto la canción suena con palabras al ritmo.'}}}
});
// ⚔️ online: fim da luta → lobby sozinho, os dois marcam "pronto" e a luta começa em 3 s
i18nExtend({'pt-BR':{online:{goIn:'⚔️ Os dois prontos! A luta começa em {s}…',again:'Jogar de novo',waitRival:'Esperando o rival marcar pronto…'},pvp:{lobbyIn:'Lobby em {s}s',lobbyHint:'Voltando ao lobby: lá os dois marcam se querem jogar de novo (Enter).'}},
 en:{online:{goIn:'⚔️ Both ready! Fight starts in {s}…',again:'Play again',waitRival:'Waiting for the rival to get ready…'},pvp:{lobbyIn:'Lobby in {s}s',lobbyHint:'Back to the lobby: there both of you choose to play again (Enter).'}},
 es:{online:{goIn:'⚔️ ¡Los dos listos! La lucha empieza en {s}…',again:'Jugar de nuevo',waitRival:'Esperando a que el rival esté listo…'},pvp:{lobbyIn:'Lobby en {s}s',lobbyHint:'Volviendo al lobby: allí los dos eligen si juegan de nuevo (Enter).'}}});
// 📖 regras da batalha online explicadas (lobby, contagem e embaixo das palavras especiais)
i18nExtend({'pt-BR':{pvp:{how:{title:'Como funciona a batalha',intro:'Às vezes uma palavra vem com um ícone: complete-a para ganhar o efeito.',
  gold:'Cura',goldD:'Ao completar, você recupera 15 de vida.',goldB:'Complete: você recupera 15 de vida',goldR:'Se ele completar, recupera 15 de vida',
  shield:'Escudo',shieldD:'Ao completar, bloqueia o próximo golpe do rival.',shieldB:'Complete: bloqueia o próximo golpe do rival',shieldR:'Se ele completar, bloqueia o seu próximo golpe',
  ice:'Congela',iceD:'Ao completar, o rival fica 1,2 s sem conseguir digitar.',iceB:'Complete: o rival fica 1,2 s sem digitar',iceR:'Se ele completar, você fica 1,2 s congelado',
  crit:'Crítico',critD:'Ao completar, o golpe causa o dobro de dano.',critB:'Complete: o golpe causa DANO DOBRADO',critR:'Se ele completar, o golpe dele é dobrado',
  first:'Primeiro!',firstD:'Quem completa a palavra de mesmo número antes do rival causa +30% de dano.',
  combo:'Combo',comboD:'Cada palavra seguida sem errar soma +6% de dano (até 10).',
  sd:'Morte súbita',sdD:'Depois de 60 s, o dano de todos sobe 10% a cada 10 s.'}}},
 en:{pvp:{how:{title:'How the battle works',intro:'Sometimes a word comes with an icon: finish it to get the effect.',
  gold:'Heal',goldD:'When you finish it, you recover 15 HP.',goldB:'Finish: you recover 15 HP',goldR:'If they finish it, they recover 15 HP',
  shield:'Shield',shieldD:'When you finish it, it blocks the rival’s next hit.',shieldB:'Finish: blocks the rival’s next hit',shieldR:'If they finish it, your next hit is blocked',
  ice:'Freeze',iceD:'When you finish it, the rival can’t type for 1.2 s.',iceB:'Finish: the rival can’t type for 1.2 s',iceR:'If they finish it, you freeze for 1.2 s',
  crit:'Critical',critD:'When you finish it, the hit deals double damage.',critB:'Finish: the hit deals DOUBLE DAMAGE',critR:'If they finish it, their hit is doubled',
  first:'First!',firstD:'Whoever finishes the same-numbered word before the rival deals +30% damage.',
  combo:'Combo',comboD:'Each word in a row without mistakes adds +6% damage (up to 10).',
  sd:'Sudden death',sdD:'After 60 s, everyone’s damage rises 10% every 10 s.'}}},
 es:{pvp:{how:{title:'Cómo funciona la batalla',intro:'A veces una palabra trae un icono: complétala para ganar el efecto.',
  gold:'Cura',goldD:'Al completarla, recuperas 15 de vida.',goldB:'Completa: recuperas 15 de vida',goldR:'Si él la completa, recupera 15 de vida',
  shield:'Escudo',shieldD:'Al completarla, bloquea el próximo golpe del rival.',shieldB:'Completa: bloquea el próximo golpe del rival',shieldR:'Si él la completa, bloquea tu próximo golpe',
  ice:'Congela',iceD:'Al completarla, el rival pasa 1,2 s sin poder escribir.',iceB:'Completa: el rival pasa 1,2 s sin escribir',iceR:'Si él la completa, te congelas 1,2 s',
  crit:'Crítico',critD:'Al completarla, el golpe hace el doble de daño.',critB:'Completa: el golpe hace DAÑO DOBLE',critR:'Si él la completa, su golpe se duplica',
  first:'¡Primero!',firstD:'Quien completa la palabra del mismo número antes que el rival hace +30% de daño.',
  combo:'Combo',comboD:'Cada palabra seguida sin errores suma +6% de daño (hasta 10).',
  sd:'Muerte súbita',sdD:'Después de 60 s, el daño de todos sube 10% cada 10 s.'}}}});
// 📱 iPhone: o vídeo só começa com um toque
i18nExtend({'pt-BR':{song:{tapPlay:'Tocar a música',tapHint:'O navegador pediu um clique para liberar o som: clique em “Tocar a música” (ou no vídeo).',tapHintT:'Seu celular pede um toque para liberar o som: toque em “Tocar a música” (ou no vídeo).'}},
 en:{song:{tapPlay:'Play the song',tapHint:'The browser needs a click to allow sound: click “Play the song” (or the video).',tapHintT:'Your phone needs a tap to allow sound: tap “Play the song” (or the video).'}},
 es:{song:{tapPlay:'Tocar la canción',tapHint:'El navegador pide un clic para activar el sonido: pulsa “Tocar la canción” (o el video).',tapHintT:'Tu móvil pide un toque para activar el sonido: toca “Tocar la canción” (o el video).'}}});
// 📱 extras do celular (js/systems/mobile.js) + D7: chefe na onda 5
i18nExtend({'pt-BR':{bestiary:{boss:'Da onda 5 em diante · tem tempo para cada palavra'},mob:{settings:'Celular',install:'Instalar o jogo',app:'App',installed:'Jogo instalado na tela inicial ✓',
  iosTitle:'Instalar no iPhone',iosHow:'Toque em Compartilhar (quadrado com a seta ⬆️) e depois em “Adicionar à Tela de Início”. O jogo abre em tela cheia e funciona sem internet.',
  haptics:'Vibração',hapticsHint:'Toque curto a cada palavra, tranco quando a torre apanha, vibração no Perfeito e no K.O.',hapticsNo:'Vibração: o iPhone não deixa sites vibrarem (só no Android).',
  battery:'Economia de bateria',bat:{auto:'Automático',on:'Sempre',off:'Nunca'},batteryHint:'Desenha a 30 FPS (a jogabilidade não muda). Automático: liga com bateria ≤ 20% fora da tomada (só o Android informa a bateria).',batOnNow:'ligada agora',
  notif:'Avisos de convite',notifAsk:'Ativar',notifOn:'Avisos de convite ligados',notifDenied:'Avisos bloqueados: libere nas configurações do navegador.',notifNo:'Este navegador não mostra avisos.',notifIos:'No iPhone, os avisos só funcionam com o jogo instalado na tela inicial.',
  share:'Compartilhar',copied:'Texto copiado para colar onde quiser',shareText:'Cheguei à onda {n} com {w} WPM no Mage Animals! Consegue me passar? 🧙',shareTextSong:'Joguei “{s}” com {w} WPM no Mage Animals! 🎵',shareSong:'{p}% da música',
  shareWin:'Venci {n} num duelo de digitação no Mage Animals! ⚔️',shareDuel:'Duelo de digitação contra {n} no Mage Animals ⚔️ Bora uma revanche?',
  rotateTitle:'Dica: gire o celular',rotate:'Deitado, o vídeo e a letra ganham mais espaço.'}},
 en:{bestiary:{boss:'From wave 5 on · each word is timed'},mob:{settings:'Phone',install:'Install the game',app:'App',installed:'Game installed on the home screen ✓',
  iosTitle:'Install on iPhone',iosHow:'Tap Share (the square with the ⬆️ arrow), then “Add to Home Screen”. The game opens full screen and works offline.',
  haptics:'Vibration',hapticsHint:'Short tap on each word, jolt when the tower is hit, buzz on Perfect and K.O.',hapticsNo:'Vibration: the iPhone does not let websites vibrate (Android only).',
  battery:'Battery saver',bat:{auto:'Automatic',on:'Always',off:'Never'},batteryHint:'Draws at 30 FPS (gameplay is the same). Automatic: on at ≤ 20% battery when not charging (only Android reports the battery).',batOnNow:'on now',
  notif:'Invite alerts',notifAsk:'Turn on',notifOn:'Invite alerts on',notifDenied:'Alerts blocked: allow them in the browser settings.',notifNo:'This browser cannot show alerts.',notifIos:'On iPhone, alerts only work with the game installed on the home screen.',
  share:'Share',copied:'Text copied, paste it anywhere',shareText:'I reached wave {n} at {w} WPM in Mage Animals! Can you beat me? 🧙',shareTextSong:'I played “{s}” at {w} WPM in Mage Animals! 🎵',shareSong:'{p}% of the song',
  shareWin:'I beat {n} in a typing duel in Mage Animals! ⚔️',shareDuel:'Typing duel against {n} in Mage Animals ⚔️ Rematch?',
  rotateTitle:'Tip: turn your phone',rotate:'In landscape, the video and the lyrics get more room.'}},
 es:{bestiary:{boss:'Desde la oleada 5 · cada palabra tiene tiempo'},mob:{settings:'Móvil',install:'Instalar el juego',app:'App',installed:'Juego instalado en la pantalla de inicio ✓',
  iosTitle:'Instalar en iPhone',iosHow:'Toca Compartir (el cuadrado con la flecha ⬆️) y luego “Añadir a pantalla de inicio”. El juego abre a pantalla completa y funciona sin internet.',
  haptics:'Vibración',hapticsHint:'Toque corto en cada palabra, sacudida cuando golpean la torre, vibración en Perfecto y K.O.',hapticsNo:'Vibración: el iPhone no deja vibrar a los sitios (solo Android).',
  battery:'Ahorro de batería',bat:{auto:'Automático',on:'Siempre',off:'Nunca'},batteryHint:'Dibuja a 30 FPS (el juego no cambia). Automático: se activa con batería ≤ 20% sin cargar (solo Android informa la batería).',batOnNow:'activado ahora',
  notif:'Avisos de invitación',notifAsk:'Activar',notifOn:'Avisos de invitación activados',notifDenied:'Avisos bloqueados: permítelos en los ajustes del navegador.',notifNo:'Este navegador no muestra avisos.',notifIos:'En iPhone, los avisos solo funcionan con el juego instalado en la pantalla de inicio.',
  share:'Compartir',copied:'Texto copiado para pegarlo donde quieras',shareText:'¡Llegué a la oleada {n} con {w} PPM en Mage Animals! ¿Me superas? 🧙',shareTextSong:'¡Jugué “{s}” con {w} PPM en Mage Animals! 🎵',shareSong:'{p}% de la canción',
  shareWin:'¡Le gané a {n} en un duelo de escritura en Mage Animals! ⚔️',shareDuel:'Duelo de escritura contra {n} en Mage Animals ⚔️ ¿Revancha?',
  rotateTitle:'Consejo: gira el móvil',rotate:'En horizontal, el video y la letra tienen más espacio.'}}});
// 🧭 menu esquerdo: linha curta embaixo de cada item
i18nExtend({'pt-BR':{side:{sub:{duelBot:'Treine contra magos rivais',online:'Desafie um amigo ao vivo',onlineLobby:'Sala aberta: entre no lobby',onlineWait:'Esperando o rival…',ranking:'Os melhores da semana',missions:'Diárias e semanais',kingdom:'Mina, forja e a sua crônica',collection:'Itens, trajes e baús',dictionary:'Palavras que você já escreveu',towers:'Visual da sua torre',profile:'Nível, conquistas e ajustes',friends:'Convide e duele'}}},
 en:{side:{sub:{duelBot:'Train against rival mages',online:'Challenge a friend live',onlineLobby:'Room open: join the lobby',onlineWait:'Waiting for the rival…',ranking:'Best of the week',missions:'Daily and weekly',kingdom:'Mine, forge and your chronicle',collection:'Items, outfits and chests',dictionary:'Words you have typed',towers:'Your tower look',profile:'Level, achievements, settings',friends:'Invite and duel'}}},
 es:{side:{sub:{duelBot:'Entrena contra magos rivales',online:'Desafía a un amigo en vivo',onlineLobby:'Sala abierta: entra al lobby',onlineWait:'Esperando al rival…',ranking:'Los mejores de la semana',missions:'Diarias y semanales',kingdom:'Mina, forja y tu crónica',collection:'Objetos, trajes y cofres',dictionary:'Palabras que ya escribiste',towers:'El aspecto de tu torre',profile:'Nivel, logros y ajustes',friends:'Invita y duela'}}}});
// 📱 tela inicial do celular: botão "Mais" (abre o menu completo)
i18nExtend({'pt-BR':{mob:{more:'Mais'}},en:{mob:{more:'More'}},es:{mob:{more:'Más'}}});
// 🏛️ Reino: gatilhos no mapa (pode melhorar, quase lá, mina cheia) e faixa da próxima meta
i18nExtend({'pt-BR':{village:{trig:{full:'Cheia!',near:'faltam {n}',upTip:'Já dá para melhorar!'},goal:{ready:'{b} pronto para melhorar!',readyN:'{n} prédios prontos para melhorar!',readySub:'Você já tem Aura suficiente — toque para evoluir.',go:'Melhorar',next:'Próxima melhoria: {b} Nv {l}',miss:'faltam {n}',mine:'a Mina junta em ~{h}h'}}},
 en:{village:{trig:{full:'Full!',near:'{n} to go',upTip:'Ready to upgrade!'},goal:{ready:'{b} is ready to upgrade!',readyN:'{n} buildings ready to upgrade!',readySub:'You already have enough Aura — tap to level up.',go:'Upgrade',next:'Next upgrade: {b} Lv {l}',miss:'{n} to go',mine:'the Mine gathers it in ~{h}h'}}},
 es:{village:{trig:{full:'¡Llena!',near:'faltan {n}',upTip:'¡Ya puedes mejorar!'},goal:{ready:'¡{b} listo para mejorar!',readyN:'¡{n} edificios listos para mejorar!',readySub:'Ya tienes Aura suficiente — toca para evolucionar.',go:'Mejorar',next:'Próxima mejora: {b} Nv {l}',miss:'faltan {n}',mine:'la Mina lo junta en ~{h}h'}}}});
// 📋 missões novas: Sobrecarga, modos Runas/Letras, Desafio do dia, baús e músicas na semana
i18nExtend({'pt-BR':{quests:{d_over:'Ative a Sobrecarga Arcana 2 vezes',d_runes:'Jogue 1 partida no modo Runas',d_letters:'Jogue 1 partida no modo Letras',d_daily:'Jogue o Desafio do dia',d_chests:'Abra 1 baú',w_over:'Ative a Sobrecarga Arcana 12 vezes',w_daily:'Jogue o Desafio do dia em 5 dias',w_chests:'Abra 6 baús',w_songs:'Jogue 5 músicas no Ritmo do Bardo'}},
 en:{quests:{d_over:'Trigger Arcane Overload 2 times',d_runes:'Play 1 game in Runes mode',d_letters:'Play 1 game in Letters mode',d_daily:'Play the Daily Challenge',d_chests:'Open 1 chest',w_over:'Trigger Arcane Overload 12 times',w_daily:'Play the Daily Challenge on 5 days',w_chests:'Open 6 chests',w_songs:'Play 5 songs in Bard\'s Rhythm'}},
 es:{quests:{d_over:'Activa la Sobrecarga Arcana 2 veces',d_runes:'Juega 1 partida en modo Runas',d_letters:'Juega 1 partida en modo Letras',d_daily:'Juega el Desafío del día',d_chests:'Abre 1 cofre',w_over:'Activa la Sobrecarga Arcana 12 veces',w_daily:'Juega el Desafío del día en 5 días',w_chests:'Abre 6 cofres',w_songs:'Juega 5 canciones en Ritmo del Bardo'}}});