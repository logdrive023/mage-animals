// Mage Animals — js/config/dictionary.js · 📖 Dicionário trilíngue (catálogo de palavras do jogo).
// Cada linha de DICT_SRC é um CONCEITO: "categoria|pt|en|es". Formas alternativas separadas por "/".
// Cobre todas as palavras de WORD_BANK + WORD_EXTRA dos três idiomas; formas que não estão no banco de um idioma
// aparecem como tradução (sem status escrita/não escrita). Notas só com informação documentada (origem,
// falso cognato, uso): DICT_NOTES[forma pt principal] = [[tipo, pt, en, es], …] — tipo o=origem · f=falso amigo · u=uso.
'use strict';

const DICT_CATS={mag:'🔮',ele:'🔥',cos:'🌌',nat:'🌿',cri:'🐉',lug:'🏰',obj:'🗡️',gem:'💎',pes:'🧙',cor:'✋',adj:'✨',abs:'💭'};

const DICT_SRC=`cos|lua|moon|luna
cos|sol|sun|sol
ele|fogo|fire|fuego
ele|gelo|ice|hielo
ele|raio|thunderbolt|rayo
mag|runa/runas|rune|runa
mag|orbe|orb|orbe
ele|luz|light|luz
pes|mago|mage|mago
cri|fada|fairy|hada
cri|elfo|elf|elfo
cri|asa|wing|ala
nat|onda|wave|ola
cos|céu|sky|cielo
gem|gema|gem|gema
gem|rubi|ruby|rubí
gem|ouro|gold|oro
obj|capa|cape|capa
obj|mapa|map|mapa
obj|vela|candle|vela
cor|olho|eye|ojo
cri|lobo|wolf|lobo
cri|urso|bear|oso
lug|toca|burrow|madriguera
nat|rio|river|río
nat|mar|sea|mar
abs|voo|flight|vuelo
cri|ave|bird|ave
cri|pena|feather|pluma
obj|elmo|helmet|yelmo
obj|arco|bow|arco
nat|lago|lake|lago
nat|ilha|island|isla
obj|sino|bell|campana
pes|rei|king|rey
cri|pata|paw|pata
ele|neve|snow|nieve
abs|mel|honey|miel
abs|chá|tea|té
cos|dia|day|día
mag|aura|aura|aura
mag|alma|soul|alma
abs|mito|myth|mito
nat|raiz|root|raíz
nat|flor|flower|flor
cri|gato|cat|gato
obj|cubo|cube|cubo
obj|dado|die|dado
cri|fera|beast|fiera
gem|jade|jade|jade
lug|muro|wall|muro
nat|pico|peak|pico
gem|ônix|onyx|ónix
obj|trono|throne|trono
abs|zero|zero|cero
abs|nada|nothing|nada
abs|vida|life|vida
ele|vento|wind|viento
mag|magia|magic|magia
ele|chama|flame|llama
ele|brasa|ember/cinder|brasa
ele|nuvem|cloud|nube
nat|terra|earth|tierra
ele|água|water|agua
gem|pedra|stone|piedra
cos|astro|celestial body|astro
cos|noite|night|noche
nat|trevo|clover|trébol
pes|bruxa|witch|bruja
obj|livro|book|libro
ele|névoa|mist|niebla
ele|neblina|fog|neblina
ele|bruma|haze|bruma
ele|cinza/cinzas|ash|ceniza
ele|faísca/fagulha/centelha|spark|chispa
cri|garra|claw|garra
cri|presa|fang|colmillo
cos|cometa|comet|cometa
cos|estrela|star|estrella
mag|feitiço|spell|hechizo
mag|varinha|wand|varita
cri|dragão|dragon|dragón
mag|poção|potion|poción
cos|galáxia|galaxy|galaxia
ele|trovão|thunder|trueno
mag|sombra|shadow|sombra
cri|coruja|owl|lechuza
cri|raposa|fox|zorro
cri|coelho|rabbit|conejo
lug|castelo|castle|castillo
obj|escudo|shield|escudo
obj|cajado|staff|bastón
mag|amuleto|amulet|amuleto
cos|eclipse|eclipse|eclipse
cos|aurora|aurora|aurora
mag|vórtice|vortex|vórtice
cos|meteoro|meteor|meteoro
cos|planeta|planet|planeta
mag|encanto|charm|encanto
mag|portal|portal|portal
gem|safira|sapphire|zafiro
gem|cristal|crystal|cristal
mag|oráculo|oracle|oráculo
cri|fênix|phoenix|fénix
obj|tesouro|treasure|tesoro
obj|lâmina|blade|hoja
obj|relíquia|relic|reliquia
mag|selo|seal/sigil|sello
lug|torre|tower|torre
lug|ponte|bridge|puente
nat|vulcão|volcano|volcán
cri|gárgula|gargoyle|gárgola
cri|golem|golem|golem
obj|espada|sword|espada
adj|mágico|magical|mágico
mag|arcano|arcane|arcano
abs|fúria|fury|furia
abs|lenda|legend|leyenda
ele|tempestade|storm/tempest|tormenta/tempestad
cos|constelação|constellation|constelación
mag|encantamento|enchantment|encantamiento
ele|relâmpago|lightning|relámpago
lug|labirinto|labyrinth|laberinto
mag|invocação|summoning|invocación
obj|pergaminho|parchment/scroll|pergamino
pes|feiticeiro|sorcerer|hechicero
pes|alquimista|alchemist|alquimista
cos|supernova|supernova|supernova
abs|cataclismo|cataclysm|cataclismo
cos|meteorito|meteorite|meteorito
pes|arquimago|archmage|archimago
mag|transmutação|transmutation|transmutación
mag|maldição|curse|maldición
pes|necromante|necromancer|nigromante
lug|encruzilhada|crossroads|encrucijada
cos|firmamento|firmament|firmamento
adj|misterioso|mysterious|misterioso
mag|espírito|spirit|espíritu
abs|mistério|mystery|misterio
mag|grimório|grimoire|grimorio
obj|caldeirão|cauldron|caldero
cri|unicórnio|unicorn|unicornio
nat|floresta/bosque|forest|bosque
nat|montanha|mountain|montaña
pes|guardião|guardian|guardián
mag|profecia|prophecy|profecía
mag|sortilégio|sortilege|sortilegio
lug|fortaleza|fortress|fortaleza
cos|nebulosa|nebula|nebulosa
adj|encantado|enchanted|encantado
abs|sal|salt|sal
abs|cor|color|color
abs|paz|peace|paz
abs|voz|voice|voz
cor|mão|hand|mano
abs|pão|bread|pan
obj|elo|link|eslabón
abs|eco|echo|eco
ele|gás|gas|gas
obj|véu|veil|velo
lug|lar|home|hogar
obj|nau|carrack|nao
abs|tom|tone|tono
abs|som|sound|sonido
abs|dom|gift|don
abs|era|era|era
obj|fio|thread|hilo
abs|ovo|egg|huevo
cri|cão|dog|perro
abs|neo|neo-|neo-
obj|ímã|magnet|imán
obj|arpa|harp|arpa
abs|base|base|base
cri|bico|beak|pico
cor|boca|mouth|boca
abs|bolo|cake|pastel/tarta
nat|cabo|headland|cabo
lug|casa|house|casa
obj|cera|wax|cera
lug|chão|floor|suelo
pes|dama|lady|dama
cor|dedo|finger|dedo
abs|eixo|axis|eje
obj|faca|knife|cuchillo
abs|fome|hunger|hambre
ele|frio|cold|frío
obj|giz|chalk|tiza
abs|jogo|game|juego
abs|lado|side|lado
nat|lama|mud|lodo
obj|lata|can|lata
cri|leão|lion|león
obj|lima|file/lime|lima
abs|lixo|trash|basura
lug|loja|shop|tienda
obj|lupa|magnifying glass|lupa
abs|luta|fight|lucha
obj|mala|suitcase|maleta
mag|mana|mana|maná
abs|meta|goal|meta
lug|mina|mine|mina
obj|nave|ship|nave
abs|nota|note|nota
abs|obra|work|obra
cri|pato|duck|pato
nat|pera|pear|pera
obj|pipa|kite|papalote
lug|poço|well|pozo
cos|polo|pole|polo
cri|rato|mouse|ratón
obj|rede|net|red
obj|roda|wheel|rueda
nat|rosa|rose|rosa
abs|rota|route|ruta
cri|sapo|toad|sapo
obj|seda|silk|seda
abs|sopa|soup|sopa
cri|teia|web|telaraña
obj|tela|screen|pantalla
lug|teto|ceiling|techo
obj|vaso|vase|jarrón
lug|vila|village|pueblo
abs|zona|zone|zona
cri|ogro|ogre|ogro
cri|titã|titan|titán
pes|xamã|shaman|chamán
cri|gnomo|gnome|gnomo
ele|lava|lava|lava
obj|baú|chest|cofre
obj|anel|ring|anillo
gem|joia|jewel|joya
nat|areia|sand|arena
pes|bruxo|wizard|brujo
mag|veneno|poison|veneno
ele|vapor|steam|vapor
ele|chuva|rain|lluvia
cor|dente|tooth|diente
cri|tigre|tiger|tigre
lug|porta|door|puerta
abs|ideia|idea|idea
ele|fumaça|smoke|humo
nat|pântano|swamp|pantano
nat|relva|grass|hierba
ele|orvalho|dew|rocío
ele|geada|frost|escarcha
ele|brisa|breeze|brisa
ele|tufão|typhoon|tifón
ele|granizo|hail|granizo
nat|cascata|waterfall|cascada
nat|deserto|desert|desierto
nat|caverna|cave|cueva
lug|ruína|ruin|ruina
lug|templo|temple|templo
lug|altar|altar|altar
abs|escuridão/trevas|darkness|oscuridad/tinieblas
nat|abismo|abyss|abismo
obj|cálice|chalice|cáliz
obj|adaga|dagger|daga
obj|lança|spear|lanza
cri|escama|scale|escama
cri|sereia|mermaid|sirena
cri|quimera|chimera|quimera
cri|hidra|hydra|hidra
cri|grifo|griffin|grifo
cri|duende|goblin|duende
cri|troll|troll|trol
cri|vampiro|vampire|vampiro
cri|morcego|bat|murciélago
cri|aranha|spider|araña
cri|falcão|falcon|halcón
cri|águia|eagle|águila
cri|corvo|raven|cuervo
cri|cisne|swan|cisne
cri|tritão|triton|tritón
cri|kraken|kraken|kraken
nat|lótus|lotus|loto
cos|lunar|lunar|lunar
cos|solar|solar|solar
mag|astral|astral|astral
cos|cósmico|cosmic|cósmico
adj|etéreo|ethereal|etéreo
adj|místico|mystic|místico
adj|sombrio|gloomy|sombrío
adj|sagrado|sacred|sagrado
adj|divino|divine|divino
adj|oculto|hidden|oculto
adj|antigo|ancient|antiguo
adj|eterno|eternal|eterno
adj|feroz|fierce|feroz
adj|veloz|swift|veloz
adj|bravo|angry|bravo
pes|herói|hero|héroe
pes|vilão|villain|villano
pes|ninja|ninja|ninja
pes|pirata|pirate|pirata
pes|monge|monk|monje
pes|druida|druid|druida
pes|bardo|bard|bardo
pes|clérigo|cleric|clérigo
pes|ladino|rogue|pícaro
obj|bússola|compass|brújula
obj|mochila|backpack|mochila
obj|tocha|torch|antorcha
obj|corda|rope|cuerda
obj|chave|key|llave
obj|moeda|coin|moneda
obj|colar|necklace|collar
obj|coroa|crown|corona
obj|cetro|scepter|cetro
obj|frasco|flask|frasco
mag|elixir|elixir|elixir
mag|tônico|tonic|tónico
nat|pólen|pollen|polen
nat|semente|seed|semilla
nat|folha|leaf|hoja
nat|galho|branch|rama
nat|tronco|trunk|tronco
nat|selva|jungle|selva
nat|campo|field|campo
nat|prado|meadow|prado
nat|colina|hill|colina
nat|vale|valley|valle
nat|geleira|glacier|glaciar
nat|iceberg|iceberg|iceberg
nat|cratera|crater|cráter
ele|magma|magma|magma
gem|carvão|coal|carbón
gem|ferro|iron|hierro
gem|cobre|copper|cobre
gem|prata|silver|plata
gem|bronze|bronze|bronce
gem|quartzo|quartz|cuarzo
gem|âmbar|amber|ámbar
gem|pérola|pearl|perla
gem|coral|coral|coral
gem|opala|opal|ópalo
gem|topázio|topaz|topacio
gem|granada|garnet|granate
obj|dreno|drain|drenaje
mag|ilusão|illusion|ilusión
mag|hipnose|hypnosis|hipnosis
ele|furacão|hurricane|huracán
ele|tornado|tornado|tornado
ele|nevasca|blizzard|ventisca
obj|machado|axe|hacha
obj|martelo|hammer|martillo
obj|besta|crossbow|ballesta
ele|explosão|explosion|explosión
adj|ancestral|ancestral|ancestral
mag|teletransporte|teleportation|teletransporte
adj|invisível|invisible|invisible
abs|gravidade|gravity|gravedad
abs|magnetismo|magnetism|magnetismo
abs|eletricidade|electricity|electricidad
adj|cristalino|crystalline|cristalino
abs|iluminação|illumination|iluminación
ele|redemoinho|whirlwind|remolino
ele|avalanche|avalanche|avalancha
ele|terremoto|earthquake|terremoto
ele|maremoto|tsunami|maremoto
ele|ventania|gale|vendaval
ele|trovoada|thunderstorm|tormenta eléctrica
nat|arquipélago|archipelago|archipiélago
nat|cordilheira|mountain range|cordillera
cos|horizonte|horizon|horizonte
cos|crepúsculo|twilight/dusk|crepúsculo
cos|madrugada|small hours|madrugada
cos|alvorada|dawn/sunrise|amanecer
abs|eternidade|eternity|eternidad
abs|infinito|infinity|infinito
cos|universo|universe|universo
abs|dimensão|dimension|dimensión
lug|catacumba|catacomb|catacumba
lug|masmorra/calabouço|dungeon|mazmorra/calabozo
lug|cidadela|citadel|ciudadela
lug|santuário|sanctuary/shrine|santuario
lug|biblioteca|library|biblioteca
lug|observatório|observatory|observatorio
lug|laboratório|laboratory|laboratorio
mag|alquimia|alchemy|alquimia
mag|bruxaria|witchcraft|brujería
mag|feitiçaria|sorcery|hechicería
mag|adivinhação|divination|adivinación
mag|clarividência|clairvoyance|clarividencia
mag|premonição|premonition|premonición
abs|pesadelo|nightmare|pesadilla
pes|sonâmbulo|sleepwalker|sonámbulo
abs|devaneio|daydream|ensueño
abs|fantasia|fantasy|fantasía
abs|aventura|adventure|aventura
abs|expedição|expedition|expedición
abs|exploração|exploration|exploración
abs|descoberta|discovery|descubrimiento
obj|armadura|armor|armadura
obj|estandarte|banner|estandarte
obj|catapulta|catapult|catapulta
obj|tridente|trident|tridente
obj|bumerangue|boomerang|bumerán
cri|serpente|serpent|serpiente
cri|escorpião|scorpion|escorpión
cri|centauro|centaur|centauro
pes|guerreiro|warrior|guerrero
pes|arqueiro|archer|arquero
pes|paladino|paladin|paladín
pes|cavaleiro|knight|caballero
obj|lanterna|lantern|linterna
abs|essência|essence|esencia
ele|labareda|blaze|llamarada
ele|incêndio|conflagration|incendio
gem|esmeralda|emerald|esmeralda
gem|diamante|diamond|diamante
gem|turquesa|turquoise|turquesa
gem|obsidiana|obsidian|obsidiana
obj|pingente|pendant|colgante
nat|árvore|tree|árbol
ele|brilho|glow|brillo
cri|chifre|horn|cuerno
nat|carvalho|oak|roble
cos|luz estelar|starlight|luz estelar
gem|pedra-da-lua|moonstone|piedra de luna
obj|tomo|tome|tomo
mag|glifo|glyph|glifo
mag|totem|totem|tótem
cri|fantasma|ghost|fantasma
cri|gigante|giant|gigante
abs|missão|quest|misión
lug|cripta|crypt|cripta
lug|túmulo|tomb|tumba
obj|espelho|mirror|espejo
pes|patrulheiro|ranger|explorador
cos|meia-noite|midnight|medianoche
cos|pôr do sol|sunset|atardecer
ele|ciclone|cyclone|ciclón`;

// Notas: [tipo, pt, en, es]
const DICT_NOTES={
 'chá':[['o','O português “chá” vem do chinês do norte e de Cantão (cha); o inglês “tea” e o espanhol “té” vêm do dialeto de Fujian (te), difundido pelos comerciantes holandeses.','Portuguese “chá” comes from the Chinese of the north and Canton (cha); English “tea” and Spanish “té” come from the Fujian dialect (te), spread by Dutch traders.','El portugués “chá” viene del chino del norte y de Cantón (cha); el inglés “tea” y el español “té” vienen del dialecto de Fujian (te), difundido por los comerciantes holandeses.']],
 'pão':[['u','O japonês “pan” (pão) veio do português, levado por comerciantes e missionários no século XVI. Atenção: em inglês, “pan” é panela ou frigideira.','Japanese “pan” (bread) came from Portuguese “pão”, brought by 16th-century traders and missionaries. Careful: Spanish “pan” is bread, but English “pan” is a cooking pan.','El japonés “pan” viene del portugués “pão”, llevado por comerciantes y misioneros en el siglo XVI. Ojo: en inglés, “pan” es una sartén u olla.']],
 'feitiço':[['o','Do português “feitiço” vem, pelo francês “fétiche”, o inglês “fetish”: os navegadores portugueses usavam a palavra para os amuletos que viam na África.','English “fetish” comes from Portuguese “feitiço” (spell, charm) via French “fétiche”: Portuguese sailors used it for the amulets they saw in West Africa.','Del portugués “feitiço” viene, a través del francés “fétiche”, el inglés “fetish”: los navegantes portugueses así llamaban a los amuletos que veían en África.']],
 'urso':[['f','Falso amigo: em espanhol, “oso” é urso; o “osso” do português é “hueso”.','False friend: Spanish “oso” means bear, while Portuguese “osso” means bone (Spanish “hueso”).','Falso amigo: en portugués, “osso” significa hueso; el oso se dice “urso”.']],
 'toca':[['f','Em espanhol, “toca” é do verbo tocar (“ele toca”); a toca do animal é “madriguera”.','In Spanish, “toca” is a form of tocar (to touch, to play); an animal’s burrow is “madriguera”.','En portugués, “toca” es la madriguera de un animal; no tiene relación con el verbo tocar.']],
 'pena':[['f','Em espanhol, “pena” é tristeza ou castigo (“¡qué pena!”); a pena da ave é “pluma”.','Spanish “pena” means sorrow or penalty (“¡qué pena!” = what a shame); a bird’s feather is “pluma”. Portuguese “pena” means both feather and pity.','En portugués, “pena” es la pluma del ave y también lástima (“que pena!”).']],
 'sino':[['f','Em espanhol, “sino” é uma conjunção (“no es azul, sino verde”); o sino de igreja é “campana”.','Spanish “sino” is a conjunction meaning “but rather” (“no es azul, sino verde”); a bell is “campana”.','En portugués, “sino” es la campana; no tiene relación con la conjunción “sino”.']],
 'dia':[['o','“Dia” (latim dies) e o inglês “day” (germânico) parecem parentes, mas têm origens diferentes — uma coincidência famosa.','Portuguese/Spanish “dia/día” (Latin dies) and English “day” (Germanic) look related but come from different roots — a famous coincidence.','“Día” (latín dies) y el inglés “day” (germánico) parecen parientes, pero tienen orígenes distintos: una coincidencia famosa.']],
 'dado':[['u','“Dado” também é particípio de dar (“foi dado”), e “dados” são informações — em espanhol, “datos”.','In both languages, “dado” is also the past participle of “to give”; in Portuguese, “dados” also means data (Spanish “datos”).','“Dado” también es el participio de dar (“le he dado”); en portugués, además, “dados” significa datos.']],
 'jade':[['o','Vem do espanhol “piedra de la ijada” (pedra do flanco): acreditava-se que curava dores nos rins.','From Spanish “piedra de la ijada” (stone of the flank), as it was believed to cure kidney pain.','Viene de “piedra de la ijada”, porque se creía que curaba los dolores de riñón.']],
 'muro':[['u','“Muro” costuma ser a parede externa que cerca um terreno; a de dentro de casa é “parede” (em espanhol, “pared”).','In Portuguese and Spanish, “muro” is usually an outer or free-standing wall; the wall inside a house is “parede”/“pared”.','“Muro” suele ser una pared exterior o de cerca; la pared interior de una casa es “pared” (“parede” en portugués).']],
 'zero':[['o','Do árabe ṣifr (vazio), pelo italiano; a mesma raiz deu “cifra”.','From Arabic ṣifr (empty), via Italian; the same root gave “cipher”.','Del árabe ṣifr (vacío), a través del italiano; la misma raíz dio “cifra”.']],
 'nada':[['u','O inglês adotou “nada” do espanhol como forma informal de dizer “nothing”.','English borrowed “nada” from Spanish as an informal word for “nothing”.','El inglés adoptó “nada” del español como forma informal de decir “nothing”.']],
 'chama':[['u','Em espanhol, “llama” é tanto a chama quanto o animal dos Andes (lhama).','Spanish “llama” means both a flame and the Andean animal.','En español, “llama” es la del fuego y también el animal andino.']],
 'cinza':[['u','Em português, “cinza” é também a cor cinzenta.','In Portuguese, “cinza” is also the color gray.','En portugués, “cinza” también es el color gris.']],
 'presa':[['f','Em português, “presa” é o dente das feras e também a vítima do caçador; em espanhol, “presa” é a vítima ou uma represa — o dente é “colmillo”.','Portuguese “presa” means both fang and prey; Spanish “presa” means prey or a dam — a fang is “colmillo”.','En portugués, “presa” es el colmillo y también la víctima; en español, “presa” es la víctima o un embalse, y el diente es “colmillo”.']],
 'cometa':[['o','Do grego komētēs, “cabeludo”: a cauda parecia uma cabeleira. Na Espanha, “cometa” também é a pipa de papel.','From Greek komētēs, “long-haired”: the tail looked like flowing hair. In Spain, “cometa” is also a paper kite.','Del griego komētēs, “cabelludo”, por la cola que parecía una cabellera. En España, “cometa” es también el juguete que vuela con el viento.']],
 'poção':[['o','Do latim potio (bebida). O inglês “poison” (veneno) vem da mesma palavra.','From Latin potio (a drink). English “poison” comes from the same word.','Del latín potio (bebida). El inglés “poison” (veneno) viene de la misma palabra.']],
 'galáxia':[['o','Do grego gala (leite): a Via Láctea parecia um caminho de leite no céu.','From Greek gala (milk): the Milky Way looked like a trail of milk across the sky.','Del griego gala (leche): la Vía Láctea parecía un camino de leche en el cielo.']],
 'coruja':[['u','Em espanhol, “lechuza” é a coruja sem penachos (como a suindara); as que têm “orelhas” de penas são “búhos”.','In Spanish, “lechuza” is an owl without ear tufts (like the barn owl); owls with feather tufts are “búhos”.','“Lechuza” es la que no tiene penachos (como la lechuza común); las que tienen “orejas” de plumas son “búhos”.']],
 'raposa':[['u','“Zorro”, o herói mascarado, significa simplesmente “raposa” em espanhol.','“Zorro”, the masked hero, simply means “fox” in Spanish.','El nombre del héroe enmascarado, el Zorro, significa simplemente eso: zorro.']],
 'escudo':[['u','“Escudo” também foi a moeda de Portugal até o euro (2002) e é o brasão de uma família ou cidade.','“Escudo” was also Portugal’s currency until the euro (2002), and in both languages it means a coat of arms.','“Escudo” fue también la moneda de Portugal hasta el euro (2002) y significa blasón en ambos idiomas.']],
 'cajado':[['u','Em espanhol, “bastón” é também a bengala de quem caminha com apoio.','Spanish “bastón” also means a walking cane.','“Bastón” también es el que se usa para caminar; en portugués, ese es “bengala”.']],
 'eclipse':[['o','Do grego ekleipsis, “abandono, desaparecimento”: o Sol ou a Lua parecem sumir.','From Greek ekleipsis, “abandonment, disappearance”: the Sun or Moon seems to vanish.','Del griego ekleipsis, “abandono, desaparición”: el Sol o la Luna parecen esfumarse.']],
 'aurora':[['o','Em latim, Aurora era a deusa do amanhecer — daí “aurora boreal” para as luzes do céu polar.','In Latin, Aurora was the goddess of dawn — hence “aurora borealis” for the polar lights.','En latín, Aurora era la diosa del amanecer; de ahí “aurora boreal” para las luces del cielo polar.']],
 'meteoro':[['o','Do grego meteōros, “elevado no ar” — por isso a meteorologia estuda o tempo, e não os meteoros.','From Greek meteōros, “raised high in the air” — which is why meteorology studies the weather, not meteors.','Del griego meteōros, “elevado en el aire”; por eso la meteorología estudia el tiempo y no los meteoros.']],
 'meteorito':[['u','Meteoro é o rastro de luz no céu; meteorito é o pedaço que chega ao chão.','A meteor is the streak of light in the sky; a meteorite is the piece that actually reaches the ground.','El meteoro es el destello en el cielo; el meteorito es el fragmento que llega al suelo.']],
 'planeta':[['o','Do grego planētēs, “errante”: os antigos viam esses astros vagarem entre as estrelas fixas.','From Greek planētēs, “wanderer”: ancient astronomers saw them roam among the fixed stars.','Del griego planētēs, “errante”: los antiguos los veían vagar entre las estrellas fijas.']],
 'cristal':[['o','Do grego krystallos, que significava gelo: acreditava-se que o quartzo era gelo petrificado.','From Greek krystallos, meaning ice: quartz was believed to be ice turned to stone.','Del griego krystallos, “hielo”: se creía que el cuarzo era hielo petrificado.']],
 'oráculo':[['o','Do latim oraculum, de orare (falar, rogar): a resposta divina falada por um sacerdote.','From Latin oraculum, from orare (to speak, to pray): a divine answer spoken through a priest.','Del latín oraculum, de orare (hablar, rogar): la respuesta divina pronunciada por un sacerdote.']],
 'tesouro':[['o','Do grego thēsauros (depósito), que também deu “tesauro”, um dicionário de sinônimos.','From Greek thēsauros (storehouse), which also gave “thesaurus”, a dictionary of synonyms.','Del griego thēsauros (depósito), que también dio “tesauro”, un diccionario de sinónimos.']],
 'lâmina':[['u','Em espanhol, a lâmina da espada é “hoja” — a mesma palavra para “folha”.','In Spanish, a sword’s blade is “hoja” — the same word as “leaf”.','La hoja de la espada y la del árbol son la misma palabra en español; en portugués se distinguen: “lâmina” y “folha”.']],
 'vulcão':[['o','Vem de Vulcano, o deus romano do fogo e da forja.','From Vulcan, the Roman god of fire and the forge.','Viene de Vulcano, el dios romano del fuego y de la fragua.']],
 'gárgula':[['o','Do francês gargouille (garganta): nas catedrais, as gárgulas são bicas que escoam a água da chuva.','From French gargouille (throat): on cathedrals, gargoyles are spouts that drain rainwater.','Del francés gargouille (garganta): en las catedrales, las gárgolas son caños que desaguan la lluvia.']],
 'golem':[['o','Vem do hebraico; na lenda judaica de Praga, um rabino dá vida a um gigante de barro.','From Hebrew; in the Jewish legend of Prague, a rabbi brings a clay giant to life.','Viene del hebreo; en la leyenda judía de Praga, un rabino da vida a un gigante de barro.']],
 'arcano':[['u','Do latim arcanus (secreto). No tarô, as cartas se dividem em Arcanos Maiores e Menores.','From Latin arcanus (secret). Tarot cards are divided into the Major and Minor Arcana.','Del latín arcanus (secreto). Las cartas del tarot se dividen en Arcanos Mayores y Menores.']],
 'lenda':[['o','Do latim legenda, “o que deve ser lido”: vidas de santos lidas em voz alta.','From Latin legenda, “things to be read”: lives of saints read aloud.','Del latín legenda, “lo que debe leerse”: vidas de santos leídas en voz alta.']],
 'tempestade':[['o','Do latim tempestas, que significava tempo, estação e também mau tempo.','From Latin tempestas, which meant time, season and also bad weather.','Del latín tempestas, que significaba tiempo, estación y también mal tiempo.']],
 'relâmpago':[['u','Relâmpago é o clarão; trovão é o som; raio é a descarga que atinge o chão.','Lightning is the flash, thunder is the sound; Portuguese “raio” (Spanish “rayo”) is the bolt that strikes the ground.','El relámpago es el destello; el trueno, el sonido; el rayo, la descarga que cae a tierra.']],
 'labirinto':[['o','Na mitologia grega, o Labirinto de Creta prendia o Minotauro.','In Greek myth, the Labyrinth of Crete imprisoned the Minotaur.','En la mitología griega, el Laberinto de Creta encerraba al Minotauro.']],
 'pergaminho':[['o','Vem de Pérgamo, cidade grega famosa por produzir esse material feito de pele.','Named after Pergamon, a Greek city famous for making this writing material from animal skin.','Viene de Pérgamo, ciudad griega famosa por fabricar este material de piel.']],
 'supernova':[['o','“Nova” é latim para “nova”: os astrônomos achavam que surgia uma estrela nova onde, na verdade, uma estrela explodia.','“Nova” is Latin for “new”: astronomers thought a new star had appeared where a star was actually exploding.','“Nova” es latín para “nueva”: los astrónomos creían ver una estrella nueva donde en realidad una estrella explotaba.']],
 'cataclismo':[['o','Do grego kataklysmos, dilúvio.','From Greek kataklysmos, a flood.','Del griego kataklysmos, diluvio.']],
 'arquimago':[['o','O prefixo grego archi- significa “chefe, principal”, como em arcebispo e arquiteto.','The Greek prefix archi- means “chief”, as in archbishop and architect.','El prefijo griego archi- significa “jefe, principal”, como en arzobispo y arquitecto.']],
 'necromante':[['o','Do grego nekros (morto) + manteia (adivinhação). Em espanhol virou “nigromante” por influência do latim niger (negro), ligado à “magia negra”.','From Greek nekros (dead) + manteia (divination). Spanish “nigromante” was influenced by Latin niger (black), linking it to “black magic”.','Del griego nekros (muerto) + manteia (adivinación). En español se volvió “nigromante” por influencia del latín niger (negro).']],
 'grimório':[['o','Do francês grimoire, alteração de grammaire (gramática): livros em latim pareciam misteriosos a quem não sabia lê-los.','From French grimoire, an alteration of grammaire (grammar): books in Latin seemed mysterious to those who couldn’t read them.','Del francés grimoire, alteración de grammaire (gramática): los libros en latín parecían misteriosos a quien no sabía leerlos.']],
 'unicórnio':[['o','Do latim unicornis: uni (um) + cornu (chifre).','From Latin unicornis: uni (one) + cornu (horn).','Del latín unicornis: uni (uno) + cornu (cuerno).']],
 'fortaleza':[['u','Em português e espanhol, “fortaleza” também é a força moral, uma das virtudes cardeais.','In Portuguese and Spanish, “fortaleza” also means fortitude, one of the cardinal virtues.','“Fortaleza” también es la fuerza moral, una de las virtudes cardinales.']],
 'encantado':[['u','Em espanhol, “encantado” (ou “encantada”) é a resposta educada ao conhecer alguém: “prazer”.','In Spanish, “encantado/encantada” is the polite reply when meeting someone: “nice to meet you”.','“Encantado” o “encantada” es la respuesta cortés al conocer a alguien.']],
 'encanto':[['o','Do latim incantare, entoar fórmulas mágicas: o encanto era, de início, um canto.','From Latin incantare, to chant magic formulas: a charm was originally a song.','Del latín incantare, entonar fórmulas mágicas: el encanto era, al principio, un canto.']],
 'sortilégio':[['o','Do latim sortilegus, quem tira a sorte: adivinhação por sorteio.','From Latin sortilegus, one who draws lots: divination by casting lots.','Del latín sortilegus, el que echa suertes: adivinación por sorteo.']],
 'firmamento':[['o','Do latim firmamentum (apoio, sustentação): imaginava-se o céu como uma abóbada firme.','From Latin firmamentum (support): the sky was imagined as a solid dome.','Del latín firmamentum (apoyo): se imaginaba el cielo como una bóveda firme.']],
 'eco':[['o','Na mitologia grega, Eco era uma ninfa condenada a repetir apenas as últimas palavras que ouvia.','In Greek myth, Echo was a nymph doomed to repeat only the last words she heard.','En la mitología griega, Eco era una ninfa condenada a repetir solo las últimas palabras que oía.']],
 'gás':[['o','Palavra criada no século XVII pelo químico flamengo Van Helmont, inspirada no grego chaos.','Coined in the 17th century by the Flemish chemist Van Helmont, inspired by Greek chaos.','Palabra creada en el siglo XVII por el químico flamenco Van Helmont, inspirada en el griego chaos.']],
 'lar':[['o','“Lar” vem dos Lares, deuses protetores da casa romana; o espanhol “hogar” vem do fogo da lareira (latim focus).','Portuguese “lar” comes from the Lares, Roman household gods; Spanish “hogar” comes from the hearth fire (Latin focus).','“Hogar” viene del fuego del fogón (latín focus); el portugués “lar” viene de los Lares, dioses protectores de la casa romana.']],
 'cão':[['o','Vem do latim canis; já o espanhol “perro” tem origem incerta. O espanhol também tem “can”, mais literário (daí “canino”).','Portuguese “cão” comes from Latin canis; Spanish “perro” is of uncertain origin. Spanish also has the literary word “can” (hence “canino”).','El portugués “cão” viene del latín canis; “perro” es de origen incierto. El español conserva “can”, más literario (de ahí “canino”).']],
 'neo':[['u','É um prefixo de origem grega (neos, novo), como em neônio e neologismo.','A prefix of Greek origin (neos, new), as in neon and neologism.','Es un prefijo de origen griego (neos, nuevo), como en neón y neologismo.']],
 'mala':[['f','Em espanhol, “mala” é o feminino de “malo” (ruim); a mala de viagem é “maleta”.','Spanish “mala” is the feminine of “malo” (bad); a suitcase is “maleta”.','En portugués, “mala” es la maleta de viaje; no tiene relación con “malo”.']],
 'mana':[['o','A ideia vem das culturas da Polinésia e da Melanésia, onde mana é um poder espiritual; os jogos adotaram o termo para energia mágica.','The idea comes from Polynesian and Melanesian cultures, where mana is a spiritual power; games adopted the term for magic energy.','La idea viene de las culturas de Polinesia y Melanesia, donde el mana es un poder espiritual; los juegos adoptaron el término para la energía mágica.']],
 'pipa':[['u','Em espanhol, a pipa se chama “papalote” no México e “cometa” na Espanha — a mesma palavra do astro.','In Spanish, a kite is “papalote” in Mexico and “cometa” in Spain — the same word as comet.','Se dice “papalote” en México y “cometa” en España; en portugués es “pipa” (o “papagaio”).']],
 'rato':[['f','Em espanhol, “rato” é um intervalo de tempo (“un rato” = um tempinho); o rato é “ratón”.','Spanish “rato” means a short while (“un rato”); a mouse is “ratón”.','En portugués, “rato” es el ratón; nada que ver con “un rato”.']],
 'rede':[['u','Em português, “rede” é também a cama suspensa de pano; em espanhol ela é “hamaca”, palavra de origem taína.','In Portuguese, “rede” is also a hammock; Spanish “hamaca” (and English “hammock”) come from the Taíno language.','En portugués, “rede” también es la hamaca; “hamaca” viene de la lengua taína.']],
 'tela':[['f','Em espanhol, “tela” é tecido; a tela de um aparelho é “pantalla”.','Spanish “tela” means fabric; a device’s screen is “pantalla”.','En portugués, “tela” es la pantalla de un aparato (y también el lienzo de un cuadro).']],
 'vaso':[['f','Em espanhol, “vaso” é o copo de beber; o vaso de flores é “jarrón” ou “maceta”.','Spanish “vaso” means a drinking glass; a flower vase is “jarrón” or “maceta”.','En portugués, “vaso” es el jarrón o la maceta; el vaso para beber es “copo”.']],
 'lava':[['o','Vem do dialeto de Nápoles, onde designava as torrentes de água da chuva; passou a nomear a rocha derretida do Vesúvio.','From the Neapolitan dialect, where it meant streams of rainwater; it came to name the molten rock of Vesuvius.','Viene del dialecto de Nápoles, donde designaba los torrentes de lluvia; pasó a nombrar la roca fundida del Vesubio.']],
 'areia':[['o','Em espanhol, “arena” é areia — e deu nome à arena dos anfiteatros romanos, cujo chão era coberto de areia.','Spanish “arena” means sand; Roman amphitheater floors were covered with sand, hence the English “arena”.','La “arena” de los anfiteatros romanos se llamaba así porque el suelo estaba cubierto de arena.']],
 'abismo':[['o','Do grego abyssos, “sem fundo”.','From Greek abyssos, “bottomless”.','Del griego abyssos, “sin fondo”.']],
 'sereia':[['u','Em espanhol, “sirena” é a sereia e também a sirene de alarme; em português são palavras diferentes.','Spanish “sirena” means both mermaid and alarm siren; Portuguese uses “sereia” and “sirene”.','En portugués son dos palabras: “sereia” (la del mar) y “sirene” (la alarma).']],
 'quimera':[['u','Monstro grego com partes de leão, cabra e serpente; hoje também quer dizer um sonho impossível.','A Greek monster made of lion, goat and serpent; today it also means an impossible dream.','Monstruo griego con partes de león, cabra y serpiente; hoy también significa un sueño imposible.']],
 'hidra':[['u','Na mitologia grega, a Hidra de Lerna ganhava duas cabeças para cada uma cortada; Hércules a venceu.','In Greek myth, the Hydra of Lerna grew two heads for each one cut off; Heracles defeated it.','En la mitología griega, la Hidra de Lerna sacaba dos cabezas por cada una cortada; Hércules la venció.']],
 'grifo':[['u','Na Espanha, “grifo” também é a torneira.','In Spain, “grifo” also means a tap (faucet).','En España, “grifo” también es el del agua; en portugués, eso es “torneira”.']],
 'duende':[['u','No flamenco, “tener duende” é ter uma emoção e um encanto difíceis de explicar.','In flamenco, “tener duende” means having a hard-to-explain emotional power and charm.','En el flamenco, “tener duende” es tener un encanto y una emoción difíciles de explicar.']],
 'morcego':[['o','“Morcego” e “murciélago” vêm do latim para “rato cego” (mus caecus). Curiosidade: “murciélago” tem as cinco vogais.','Portuguese “morcego” and Spanish “murciélago” come from Latin for “blind mouse” (mus caecus). Fun fact: “murciélago” contains all five vowels.','“Murciélago” y el portugués “morcego” vienen del latín “ratón ciego” (mus caecus). Además, “murciélago” tiene las cinco vocales.']],
 'bravo':[['f','No Brasil, “bravo” costuma significar zangado (“ficou bravo”); em espanhol, “bravo” é feroz ou valente (“toro bravo”). O “brave” do inglês, em português, é “corajoso”.','In Brazil, “bravo” usually means angry; in Spanish it means fierce or brave (“toro bravo”). For English “brave”, Portuguese says “corajoso”.','En Brasil, “bravo” suele significar enojado (“ficou bravo”); para “valiente” se dice “corajoso”.']],
 'coroa':[['o','Do latim corona — daí a coroa solar e o coronavírus, cujo nome vem do aspecto de coroa visto ao microscópio.','From Latin corona — hence the solar corona and the coronavirus, named for its crown-like look under the microscope.','Del latín corona; de ahí la corona solar y el coronavirus, llamado así por su aspecto de corona al microscopio.']],
 'âmbar':[['o','Os gregos chamavam o âmbar de ēlektron; esfregado, ele atrai poeira — daí “eletricidade”.','The Greeks called amber ēlektron; when rubbed it attracts dust — hence “electricity”.','Los griegos llamaban al ámbar ēlektron; al frotarlo atrae el polvo, y de ahí viene “electricidad”.']],
 'eletricidade':[['o','Vem do grego ēlektron (âmbar), que atrai pequenos objetos quando esfregado.','From Greek ēlektron (amber), which attracts small objects when rubbed.','Del griego ēlektron (ámbar), que atrae objetos pequeños al frotarlo.']],
 'cobre':[['o','Do latim cuprum, de Chipre (Cyprium), ilha famosa por suas minas de cobre na Antiguidade.','From Latin cuprum, from Cyprus (Cyprium), an island famous for its copper mines in antiquity.','Del latín cuprum, de Chipre (Cyprium), isla famosa por sus minas de cobre en la Antigüedad.']],
 'prata':[['o','A Argentina deve o nome à prata (latim argentum), assim como o Rio da Prata.','Argentina takes its name from silver (Latin argentum), as does the Río de la Plata.','Argentina debe su nombre a la plata (latín argentum), igual que el Río de la Plata.']],
 'quartzo':[['o','Vem do alemão Quarz, palavra dos mineiros.','From German Quarz, a miners’ word.','Viene del alemán Quarz, palabra de los mineros.']],
 'granada':[['f','A pedra, a bomba e a romã (em espanhol, “granada”) vêm do latim granatum, pelos grãos vermelhos da fruta. Em espanhol, a pedra é “granate”.','The gem, the grenade and Spanish “granada” (pomegranate) all come from Latin granatum, after the fruit’s red seeds. In Spanish, the gem is “granate”.','La piedra, el explosivo y la fruta vienen del latín granatum, por los granos rojos de la granada. En portugués, la piedra se llama “granada”.']],
 'hipnose':[['o','De Hipnos, o deus grego do sono.','From Hypnos, the Greek god of sleep.','De Hipnos, el dios griego del sueño.']],
 'furacão':[['o','Vem do taíno, língua indígena do Caribe, pelo espanhol “huracán”.','From Taíno, an Indigenous language of the Caribbean, via Spanish “huracán”.','Viene del taíno, lengua indígena del Caribe.']],
 'maremoto':[['u','“Tsunami” é japonês: “onda do porto”.','“Tsunami” is Japanese for “harbor wave”.','“Tsunami” es japonés: “ola del puerto”.']],
 'iceberg':[['o','Do holandês ijsberg, “montanha de gelo”.','From Dutch ijsberg, “ice mountain”.','Del neerlandés ijsberg, “montaña de hielo”.']],
 'magma':[['o','Do grego magma, massa amassada, como uma pasta.','From Greek magma, a kneaded mass, like a paste.','Del griego magma, masa amasada, como una pasta.']],
 'madrugada':[['u','O inglês não tem uma palavra única para madrugada; diz “the small hours” ou “early morning”.','English has no single word for “madrugada”; it says “the small hours” or “early morning”.','El inglés no tiene una sola palabra para “madrugada”; dice “the small hours” o “early morning”.']],
 'masmorra':[['o','Vem do árabe maṭmūra, silo subterrâneo.','From Arabic maṭmūra, an underground granary.','Viene del árabe maṭmūra, silo subterráneo.']],
 'cidadela':[['o','Do italiano cittadella, “pequena cidade”.','From Italian cittadella, “little city”.','Del italiano cittadella, “pequeña ciudad”.']],
 'biblioteca':[['f','Falso amigo: o inglês “library” é a biblioteca; a loja de livros é “livraria” (em espanhol, “librería”) e, em inglês, “bookstore”.','False friend: English “library” is “biblioteca”; Portuguese “livraria” and Spanish “librería” mean bookstore.','Falso amigo: el inglés “library” es la biblioteca; la tienda de libros es “librería” (en inglés, “bookstore”).']],
 'alquimia':[['o','Do árabe al-kīmiyā; o “al” é o artigo árabe, como em álgebra. Daí também vem “química”.','From Arabic al-kīmiyā; “al” is the Arabic article, as in algebra. “Chemistry” comes from the same word.','Del árabe al-kīmiyā; “al” es el artículo árabe, como en álgebra. De ahí viene también “química”.']],
 'elixir':[['o','Do árabe al-iksīr, pó que os alquimistas acreditavam transformar metais e curar doenças.','From Arabic al-iksīr, a powder alchemists believed could transform metals and cure illness.','Del árabe al-iksīr, polvo que los alquimistas creían capaz de transformar metales y curar enfermedades.']],
 'pesadelo':[['o','Vem de “pesado”: a sensação de algo sobre o peito. O inglês “nightmare” tem a mesma imagem: “mare” era um espírito que se sentava no peito de quem dormia.','Portuguese “pesadelo” comes from “pesado” (heavy). English “nightmare” has the same image: a “mare” was a spirit that sat on a sleeper’s chest.','Viene de “pesado”: la sensación de algo sobre el pecho. El inglés “nightmare” tiene la misma imagen: el “mare” era un espíritu que se sentaba sobre el pecho del durmiente.']],
 'fantasia':[['u','No Brasil, “fantasia” é também a roupa de Carnaval ou de festa; em inglês, isso é “costume”.','In Brazil, “fantasia” is also a carnival or party costume (English “costume”).','En Brasil, “fantasia” también es el disfraz de Carnaval.']],
 'arqueiro':[['u','Em boa parte da América Latina, “arquero” também é o goleiro de futebol.','In much of Latin America, “arquero” also means a soccer goalkeeper.','En buena parte de América Latina, el “arquero” también es el portero de fútbol.']],
 'cavaleiro':[['u','Em espanhol, “caballero” também quer dizer “senhor” — aparece em portas de banheiro masculino.','Spanish “caballero” also means “gentleman” — you’ll see it on men’s restroom doors.','“Caballero” también significa “señor”, como en la puerta del baño de hombres.']],
 'paladino':[['o','Os paladinos eram os doze cavaleiros de Carlos Magno; do latim palatinus, “do palácio”.','The paladins were Charlemagne’s twelve knights; from Latin palatinus, “of the palace”.','Los paladines eran los doce caballeros de Carlomagno; del latín palatinus, “del palacio”.']],
 'lanterna':[['u','Em espanhol, “linterna” é também a lanterna de pilha, de bolso.','In Spanish, “linterna” also means a flashlight (torch).','En español, “linterna” también es la de pilas, de bolsillo.']],
 'esmeralda':[['o','Do grego smaragdos, pedra verde.','From Greek smaragdos, green stone.','Del griego smaragdos, piedra verde.']],
 'diamante':[['o','Do grego adamas, “invencível”, por causa da dureza.','From Greek adamas, “unconquerable”, because of its hardness.','Del griego adamas, “invencible”, por su dureza.']],
 'turquesa':[['o','Significa “turca”: a pedra chegava à Europa pela Turquia.','It means “Turkish”: the stone reached Europe through Turkey.','Significa “turca”: la piedra llegaba a Europa a través de Turquía.']],
 'obsidiana':[['o','Segundo Plínio, o Velho, o nome homenageia Obsius, um romano que a encontrou na Etiópia.','According to Pliny the Elder, it is named after Obsius, a Roman who found it in Ethiopia.','Según Plinio el Viejo, el nombre honra a Obsius, un romano que la encontró en Etiopía.']],
 'ônix':[['o','Do grego onyx, “unha”, pela cor de algumas variedades.','From Greek onyx, “fingernail”, after the color of some varieties.','Del griego onyx, “uña”, por el color de algunas variedades.']],
 'runa':[['o','Do nórdico antigo rún, “segredo, mistério”.','From Old Norse rún, “secret, mystery”.','Del nórdico antiguo rún, “secreto, misterio”.']],
 'dragão':[['o','Do grego drakōn, serpente grande.','From Greek drakōn, a large serpent.','Del griego drakōn, serpiente grande.']],
 'vela':[['u','Em português e espanhol, “vela” é também a vela do barco.','In Portuguese and Spanish, “vela” also means a ship’s sail.','En español y portugués, “vela” también es la del barco.']],
 'capa':[['u','Em espanhol, “capa” também é camada (“capa de ozono”).','In Spanish, “capa” also means layer (“capa de ozono”).','En español, “capa” también es estrato (“capa de ozono”); en portugués se dice “camada”.']],
 'gema':[['f','Em português, “gema” também é a parte amarela do ovo; em espanhol, essa é “yema”.','In Portuguese, “gema” is also an egg yolk; in Spanish that’s “yema”.','En portugués, “gema” también es la yema del huevo.']],
 'selo':[['u','“Selo” e “sello” são também o selo de carta. O inglês “sigil” é um selo ou símbolo mágico.','Portuguese “selo” and Spanish “sello” also mean a postage stamp. English “sigil” is a magic seal or symbol.','“Sello” y el portugués “selo” también son el de las cartas. El inglés “sigil” es un sello o símbolo mágico.']],
 'pico':[['u','Em espanhol, “pico” é também o bico das aves e a picareta.','In Spanish, “pico” also means a bird’s beak and a pickaxe.','En español, “pico” también es la boca de las aves y la herramienta; en portugués, “bico” y “picareta”.']],
 'lima':[['u','Em português e espanhol, “lima” é a ferramenta de lixar e também a fruta.','In Portuguese and Spanish, “lima” is both a metal file and the lime fruit.','En español y portugués, “lima” es la herramienta y también la fruta.']],
 'cabo':[['u','Em português, “cabo” é também o fio elétrico, o punho de uma ferramenta e uma patente militar.','Portuguese “cabo” also means an electric cable, a tool handle and the military rank of corporal.','En portugués, “cabo” también es el cable eléctrico y el mango de una herramienta; en ambos idiomas es además un rango militar.']],
 'besta':[['f','Em português, “besta” é a arma e também o animal de carga; em espanhol, a arma é “ballesta”, e “bestia” é o animal.','Portuguese “besta” is the crossbow and also a beast of burden; in Spanish, the weapon is “ballesta” and the animal “bestia”.','En portugués, “besta” es la ballesta y también la bestia de carga.']],
 'ladino':[['u','Em português, “ladino” também quer dizer esperto, malandro. O “pícaro” espanhol protagoniza a novela picaresca, como o Lazarillo de Tormes.','Portuguese “ladino” also means crafty. The Spanish “pícaro” is the hero of the picaresque novel, such as Lazarillo de Tormes.','En portugués, “ladino” también significa astuto. El pícaro protagoniza la novela picaresca, como el Lazarillo de Tormes.']],
 'xamã':[['o','Vem do evenki, língua da Sibéria, por meio do russo.','From Evenki, a Siberian language, via Russian.','Viene del evenki, lengua de Siberia, a través del ruso.']],
 'bumerangue':[['o','Vem de uma língua aborígene da Austrália.','From an Aboriginal language of Australia.','Viene de una lengua aborigen de Australia.']],
 'nau':[['u','As naus eram os grandes navios das navegações portuguesas e espanholas dos séculos XV e XVI.','Carracks (“naus”) were the large ships of the Portuguese and Spanish voyages of the 15th and 16th centuries.','Las naos eran los grandes barcos de las navegaciones portuguesas y españolas de los siglos XV y XVI.']],
 'dama':[['u','“Damas” é também o jogo de tabuleiro, em português e espanhol.','In Portuguese and Spanish, “damas” is also the board game checkers.','“Damas” también es el juego de tablero, en español y portugués.']],
 'mago':[['o','Do persa, pelo latim magus — como os Reis Magos. “Magia” vem da mesma raiz.','From Persian, via Latin magus — as in the Magi. “Magic” comes from the same root.','Del persa, a través del latín magus, como los Reyes Magos. “Magia” viene de la misma raíz.']],
 'fada':[['o','Do latim fata (os destinos): as fadas estavam ligadas à sorte das pessoas.','From Latin fata (the fates): fairies were linked to people’s destinies.','Del latín fata (los destinos): las hadas estaban ligadas a la suerte de las personas.']],
 'tridente':[['o','Do latim tri (três) + dens (dente); a arma de Netuno.','From Latin tri (three) + dens (tooth); Neptune’s weapon.','Del latín tri (tres) + dens (diente); el arma de Neptuno.']],
 'kraken':[['o','Monstro marinho das lendas norueguesas.','A sea monster from Norwegian legend.','Monstruo marino de las leyendas noruegas.']],
 'astro':[['u','“Astro” é qualquer corpo celeste; em português e espanhol, também é uma pessoa famosa (“astro do futebol”).','“Astro” is any celestial body; in Portuguese and Spanish it also means a star performer (“astro do futebol”).','“Astro” es cualquier cuerpo celeste; también es una persona famosa (“un astro del fútbol”).']],
 'terra':[['u','Com inicial maiúscula, é o nome do nosso planeta nos três idiomas: Terra, Earth, Tierra.','Capitalized, it is the name of our planet in all three languages: Terra, Earth, Tierra.','Con mayúscula, es el nombre de nuestro planeta en los tres idiomas: Terra, Earth, Tierra.']],
 'nebulosa':[['u','Em português e espanhol, o adjetivo “nebuloso” também quer dizer confuso, pouco claro.','In Portuguese and Spanish, the adjective “nebuloso” also means vague or unclear.','En español y portugués, el adjetivo “nebuloso” también significa confuso, poco claro.']]
};

// Conceitos prontos para a interface: {id, cat, f:{pt:[…], en:[…], es:[…]}, notes}
const DICT=DICT_SRC.split('\n').map((ln,i)=>{const[cat,pt,en,es]=ln.split('|'),sp=s=>s.split('/');const f={pt:sp(pt),en:sp(en),es:sp(es)};return{id:i,cat,f,notes:DICT_NOTES[f.pt[0]]||null}});
