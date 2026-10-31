"""Gera os tiles do mapa (img/map/z/x_y.webp) e js/mapdata.js com os pontos do mundo.
Coordenadas: u = (Y + S) / S, v = (S - X) / S, com S = 403200 (paisagem 4x4 blocos de 100800)."""
import json, os, math, re, collections
from PIL import Image
from pak import Pak
from extra import load, read_locres
from tex import load_icon

OUT = r"C:\Users\rodri\OneDrive\Documentos\HumanitZ"
S = 403200.0
TILE = 256

p = Pak()
loc_pt = read_locres(p.read('HumanitZ/Content/Localization/Game/pt-BR/Game.locres'))

# alinhamento medido com os 1410 prédios do jogo sobre a imagem do mapa (calib2.json)
CAL = {'scale': 1.016, 'dx': -45, 'dy': -40}
def uv(x, y):
    return [round(((y + S) / S * 4096 * CAL['scale'] + CAL['dx']) / 4096, 5),
            round(((S - x) / S * 4096 * CAL['scale'] + CAL['dy']) / 4096, 5)]
def inside(u, v): return -0.02 <= u <= 1.02 and -0.02 <= v <= 1.02
def tr(t):
    if not isinstance(t, dict): return t
    return loc_pt.get((t.get('ns', ''), t.get('key', '')), t.get('src', ''))

# ---------------------------------------------------------------- tiles
def tiles():
    img, _ = load_icon(p, 'HumanitZ/Content/TSS_Game/KaiWorldEffects/KaiMinimapMap/HZ_FullMap_4Kisland_FINAL', 8192)
    img = img.convert('RGB')
    zmax = int(math.log2(img.size[0] // TILE))   # 4096/256 = 16 -> z=4
    for z in range(zmax + 1):
        size = TILE * 2 ** z
        lvl = img.resize((size, size), Image.LANCZOS) if size != img.size[0] else img
        d = os.path.join(OUT, 'img', 'map', str(z)); os.makedirs(d, exist_ok=True)
        for tx in range(2 ** z):
            for ty in range(2 ** z):
                lvl.crop((tx * TILE, ty * TILE, tx * TILE + TILE, ty * TILE + TILE)).save(
                    os.path.join(d, f'{tx}_{ty}.webp'), 'WEBP', quality=80, method=6)
        print('zoom', z, size)
    return zmax

# ---------------------------------------------------------------- pontos
A = json.load(open('world_actors.json'))
M = json.load(open('mesh_positions.json'))

k = load(p, 'HumanitZ/Content/TSS_Game/UI/CharacterCreator/SpawnSelection/DT_SpawnLocation')
_, spawn_rows = k.datatable()

CATS = {}   # id -> dict
def cat(cid, name, group, color, on=True, desc='', icon=''):
    CATS[cid] = {'id': cid, 'name': name, 'group': group, 'color': color, 'on': on, 'desc': desc, 'icon': icon}
P = []
def add(cid, x, y, title, info='', r=None, label=False):
    u, v = uv(x, y)
    if not inside(u, v): return
    pt = {'c': cid, 'u': u, 'v': v, 't': title}
    if info: pt['i'] = info
    if r: pt['r'] = round(r / S * CAL['scale'], 5)
    if label: pt['l'] = 1
    P.append(pt)

cat('regiao', 'Regiões e cidades', 'Locais', '#f2e2b6', True, 'Nomes das regiões que aparecem ao entrar na área.')
cat('spawn', 'Pontos de spawn', 'Locais', '#4fd1c5', True, 'Locais da tela de seleção de spawn.', '📍')
cat('posto', 'Postos de gasolina', 'Locais', '#ffb020', True, 'Bombas para sifonar combustível com galão.', '⛽')
cat('casa', 'Casas', 'Locais', '#d9a066', False, 'Casas, apartamentos e garagens com loot.', '🏠')
# subcategorias: (id, nome, grupo, ícone, regex no título, tabelas de loot ligadas pelo nome)
LOJA, COMIDA, PUB, IND = 'Lojas', 'Comida e hospedagem', 'Serviços e locais públicos', 'Industrial'
COR = {LOJA: '#5aa9ff', COMIDA: '#ff8a5c', PUB: '#7d8cff', IND: '#a0a7b4'}
SUBS = [
    ('ferragens', 'Loja de ferragens', LOJA, '🔧', r'ferragens|materiais de construcao', ['INV_HardwareStore']),
    ('farmacia', 'Farmácia', LOJA, '💊', r'farmacia$', ['INV_PharmacyDatabase']),
    ('conveniencia', 'Loja de conveniência', LOJA, '🏪', r'conveniencia|quik|quick|esquina', ['INV_CannedFoodDatabase', 'INV_FoodWaterDatabase', 'INV_ShopFridge', 'INV_DrinksMachine']),
    ('supermercado', 'Supermercado', LOJA, '🛒', r'supermercado|centro comercial', ['INV_CannedFoodDatabase', 'INV_FoodWaterDatabase', 'INV_ShopFridge', 'INV_DrinksMachine']),
    ('bebidas', 'Loja de bebidas', LOJA, '🍾', r'bebidas', ['INV_LiquorStore']),
    ('armas', 'Loja de armas', LOJA, '🔫', r'loja de armas|campo de tiro', ['INV_Firearms']),
    ('esportes', 'Artigos esportivos', LOJA, '⚽', r'esporte|esportivos', ['INV_SportingGoods', 'INV_Sports']),
    ('oficina', 'Oficina mecânica', LOJA, '🛠️', r'oficina', ['INV_AutoParts', 'INV_AutoPartsStorage']),
    ('antiguidades', 'Loja de antiguidades', LOJA, '🏺', r'antiguidades', ['INV_Antiques']),
    ('livraria', 'Livraria', LOJA, '📚', r'livraria', ['INV_BooksMags']),
    ('musica', 'Loja de música', LOJA, '🎵', r'musica', ['INV_MusicLoot']),
    ('games', 'Loja de games', LOJA, '🎮', r'games', []),
    ('moveis', 'Loja de móveis', LOJA, '🛋️', r'moveis', []),
    ('lavanderia', 'Lavanderia', LOJA, '🧺', r'lavanderia', []),
    ('correios', 'Correios', LOJA, '✉️', r'correio|postal|postais', ['INV_PostLoot']),
    ('lavarapido', 'Lava-rápido', LOJA, '🧽', r'lavagem|lava-rapido', []),
    ('concessionaria', 'Concessionária', LOJA, '🚘', r'concessionaria', []),
    ('pesca', 'Loja de pesca', LOJA, '🎣', r'isca', []),
    ('comercio', 'Outros comércios', LOJA, '🏬', r'.', []),
    ('restaurante', 'Restaurantes e lanchonetes', COMIDA, '🍔', r'restaurante|lanchonete|fast food|comida|burgers|diner', []),
    ('cafe', 'Cafés', COMIDA, '☕', r'cafe|coffee', ['INV_CoffeeDatabase']),
    ('pizzaria', 'Pizzarias', COMIDA, '🍕', r'pizza', []),
    ('panquecas', 'Casas de panqueca', COMIDA, '🥞', r'panqueca', ['INV_PancakeDatabase']),
    ('sopa', 'Cozinhas de sopa', COMIDA, '🍲', r'sopa|soup|cozinha', ['INV_Soup']),
    ('motel', 'Motéis', COMIDA, '🛏️', r'motel', []),
    ('policia', 'Delegacias', PUB, '👮', r'delegacia', ['INV_PoliceCabinet', 'INV_PoliceCabinetS2', 'INV_PoliceClothes']),
    ('bombeiros', 'Bombeiros', PUB, '🚒', r'bombeiros', []),
    ('saude', 'Hospitais e clínicas', PUB, '🏥', r'hospital|clinica|medic|farmaceutica', ['INV_MedicalDatabase']),
    ('igreja', 'Igrejas', PUB, '⛪', r'igreja', []),
    ('escola', 'Escolas', PUB, '🏫', r'escola', []),
    ('banco', 'Bancos', PUB, '🏦', r'banco$', []),
    ('prisao', 'Prisão', PUB, '⛓️', r'correcional', []),
    ('militar', 'Áreas militares', PUB, '🪖', r'milit|quartel|posto de controle|posto de guarda|heliporto', ['INV_AmmoMilDatabase']),
    ('fazenda', 'Fazendas e celeiros', PUB, '🌾', r'celeiro|fazenda', ['INV_FarmLoot']),
    ('acampamento', 'Acampamentos', PUB, '⛺', r'camp|tenda|acamp|trailer|treehouse', []),
    ('aeroporto', 'Aeroporto e hangares', PUB, '✈️', r'aeroporto|hangar', []),
    ('porto', 'Porto e docas', PUB, '⚓', r'doca|cais|navio', []),
    ('ferrovelho', 'Ferro-velho, aterro e obras', PUB, '🚧', r'ferro-velho|aterro|landfill|canteiro|lumber', []),
    ('parque', 'Parques e quadras', PUB, '🌳', r'parque|playground|quadra|campo de futebol', []),
    ('escritorio', 'Escritórios', PUB, '🏢', r'escritorio|logistica', []),
    ('publico', 'Outros locais', PUB, '🏛️', r'.', []),
    ('energia', 'Energia', IND, '⚡', r'energia', []),
    ('silo', 'Silos', IND, '🌽', r'silo', []),
    ('armazem', 'Armazéns e galpões', IND, '🏭', r'.', []),
]
for sid, nome, grupo, ic, rx, tabs in SUBS:
    cat(sid, nome, grupo, COR[grupo], True, '', ic)
GROUP_OF = {'Edifício Comercial': LOJA, 'Restaurantes e Hospitalidade': COMIDA, 'Comunidade': PUB, 'Industrial': IND}
import unicodedata
def _norm(s): return ''.join(c for c in unicodedata.normalize('NFD', s or '') if unicodedata.category(c) != 'Mn').lower().strip()
def subtype(grupo, title):
    t = _norm(title)
    # um local de outro grupo pode bater primeiro (ex.: "Serviço Postal" está em Comunidade)
    order = [s for s in SUBS if s[2] == grupo] + [s for s in SUBS if s[2] != grupo and s[4] != r'.']
    for s in order:
        if t and s[4] != r'.' and re.search(s[4], t): return s[0]
    return next(s[0] for s in SUBS if s[2] == grupo and s[4] == r'.')
LOOTMAP = {}
for sid, nome, grupo, ic, rx, tabs in SUBS:
    for tb in tabs: LOOTMAP.setdefault(tb, []).append(sid)
BUILDING_CATS = {s[0] for s in SUBS} | {'casa', 'conteiner', 'basesobr'}
cat('basesobr', 'Bases de sobreviventes', 'Locais', '#7ee081', True, '', '🏕️')
cat('bunker', 'Bunkers', 'Locais', '#e05d5d', True, '', '🛡️')
cat('helicrash', 'Helicópteros caídos', 'Locais', '#ff9d6e', True, 'Locais onde o evento de helicóptero caído pode acontecer.', '🚁')
cat('estrutura', 'Estruturas especiais', 'Locais', '#c9a0ff', True, 'Torres, usina, porto, aviões caídos, caverna.', '📡')
cat('conteiner', 'Contêineres de carga', 'Saque', '#4aa3a3', False, '', '📦')
cat('trancado', 'Contêineres trancados', 'Saque', '#e3c14d', True, 'Precisam de chave ou arrombamento.', '🔒')
cat('esconderijo', 'Esconderijos de armas', 'Saque', '#ff8fa3', True, 'Esconderijo único com armas.', '💼')
cat('mochila', 'Mochilas (loot)', 'Saque', '#9aa4b2', False, 'Pontos onde aparecem mochilas com itens.', '🎒')
cat('toxica', 'Zonas radioativas', 'Perigos', '#9be22d', True, 'Área que causa dano de radiação. Use roupa de proteção.', '☢️')
cat('bandidos', 'Bandidos', 'Perigos', '#ff6b4a', True, 'Grupos de inimigos humanos.', '⚔️')
cat('horda', 'Zumbis (pontos de horda)', 'Perigos', '#a05050', False, 'Onde grupos de zumbis aparecem.', '🧟')
cat('missaop', 'Missões principais', 'Missões', '#ffd84d', True, '', '⭐')
cat('missao', 'Missões', 'Missões', '#ffe08a', True, '', '❗')
cat('leitura', 'Leituras (lore)', 'Missões', '#e8d7b0', True, 'Documentos e cartas para ler.', '📖')
cat('npcfixo', 'NPCs de missão e bases', 'NPCs', '#5fe08a', True, 'NPCs com nome que dão missões ou ficam nas bases.', '🧑')
cat('amigavel', 'Sobreviventes aleatórios', 'NPCs', '#7ee0c0', True, 'Podem aparecer neste ponto, com chance. Vários têm nome sorteado, e muitos fazem trocas.', '🙂')
cat('sobrevivente', 'Pontos de recrutamento', 'NPCs', '#9fe39f', False, 'Locais onde sobreviventes podem aparecer para recrutar.', '🤝')
cat('cao', 'Cães companheiros', 'NPCs', '#d9b38c', True, 'Podem ser domesticados.', '🐕')
cat('cavalo', 'Cavalos', 'NPCs', '#c58b4b', True, 'Podem ser montados.', '🐎')
cat('animal', 'Animais (caça)', 'NPCs', '#8fbf6a', False, '', '🦌')
cat('minerio', 'Minérios e pedras', 'Recursos', '#b0b7c3', False, 'Minere com picareta.', '⛏️')
cat('sucata', 'Sucata e chapas de metal', 'Recursos', '#8f99a8', False, '', '🔩')
cat('colmeia', 'Colmeias', 'Recursos', '#f5c542', False, 'Mel e cera.', '🐝')
cat('macieira', 'Macieiras', 'Recursos', '#6ccf5f', False, 'Maçãs.', '🍎')
cat('carro', 'Spawners de carro', 'Veículos', '#cfd6e0', False, 'Pontos onde um carro pode aparecer.', '🚗')

ZOMBIE = {'Walkers': 'Andarilhos', 'WalkersSmall': 'Andarilhos (grupo pequeno)', 'WalkersLarge': 'Andarilhos (grupo grande)', 'Walkers2': 'Andarilhos',
          'IndoorsMix': 'Mistura (interiores)', 'Mix01': 'Mistura', 'Mix02': 'Mistura', 'Mix03': 'Mistura', 'Police': 'Policiais', 'Military': 'Militares',
          'Runners': 'Corredores', 'BruteRunners': 'Brutamontes corredores', 'Toxic': 'Tóxicos', 'ToxicBelly': 'Barrigudos tóxicos', 'Giant': 'Gigantes',
          'Meds': 'Médicos', 'Leaper': 'Saltadores', 'Fatty': 'Gordos', 'Prison': 'Prisioneiros', 'IslandMix01': 'Mistura da ilha',
          'IslandMilitary': 'Militares da ilha', 'IslandMixIndoor': 'Mistura da ilha (interior)', 'IslandPatient': 'Pacientes', 'ZombieDog': 'Cães zumbis'}
ANIMAL = {'Deer': 'Cervo', 'Rabbit': 'Coelho', 'Wolf': 'Lobo', 'Bear': 'Urso', 'ZeekBear': 'Urso zumbi', 'ZeekStag': 'Cervo zumbi',
          'Goat': 'Cabra', 'Pig': 'Porco', 'Chicken': 'Galinha'}
ORE = {'Iron': 'Ferro', 'Copper': 'Cobre', 'Coal': 'Carvão', 'Saltpeter': 'Salitre', 'Stone': 'Pedra', 'Zinc': 'Zinco', 'Magnesium': 'Magnésio', 'Salt': 'Sal-gema'}
HORSE = {'BP_Horse_Child_C': 'Castanho', 'BP_Horse_Child1_C': 'Tordilho claro', 'BP_Horse_Child2_C': 'Tordilho escuro (fôlego extra)', 'BP_Horse_Child3_C': 'Palomino', 'BP_Horse_C': 'Tordilho escuro'}
CARSP = {'BP_CarSpawner_Common_C': ('Comum', 40), 'BP_CarSpawner_UnCommon_C': ('Incomum', 75), 'BP_CarSpawner_NewMix_C': ('Mix novo', 75), 'BP_KaiCarSpawner_C': ('Único (raro)', 15)}
STRUCT = {'BP_RadioTower_C': 'Torre de rádio', 'BP_SignalTower_C': 'Torre de sinal', 'BP_PowerStation_C': 'Usina de energia',
          'BP_PowerStation_Switch_C': 'Interruptor da usina', 'BP_HZ_Port_Ship_C': 'Navio no porto', 'BP_HZ_MS_Ship_ControlTower_C': 'Torre do navio',
          'BP_HZ_Airport_ControlTower1_C': 'Torre de controle do aeroporto', 'BP_Cave_Entrance_C': 'Entrada de caverna', 'BP_HZ_Bridge_C': 'Ponte',
          'BP_BridgeRepair_C': 'Ponte para consertar', 'BP_HZ_ResearchCenterOffice01_C': 'Centro de pesquisa', 'BP_HZ_ResearchLab_Bunker01_C': 'Laboratório (bunker)',
          'BP_HZ_MS_SchoolCampus01_C': 'Escola', 'BP_HZ_Mansion01a_MS_C': 'Mansão', 'BP_HZ_MS_BankBuilding_C': 'Banco', 'BP_HZ_Motel_C': 'Motel',
          'BP_HZ_BarBuilding_C': 'Bar', 'BP_ChemistryStation_C': 'Estação de química', 'BP_HZ_Tower_C': 'Torre',
          'BP_Cr_Plane_01_C': 'Avião caído', 'BP_Cr_Plane_02_C': 'Avião caído', 'BP_Cr_Plane_03_C': 'Avião caído', 'BP_Cr_Plane_04_C': 'Avião caído', 'BP_Cr_Plane_05_C': 'Avião caído',
          'BP_airplane_passenger_747_c_C': 'Boeing 747 parado', 'BP_airplane_passenger_a320_b_C': 'Airbus A320 parado', 'BP_airplane_passenger_bae146_b_C': 'BAe 146 parado',
          'BP_airplane_privatjet_02_c_C': 'Jato particular', 'BP_airplane_sport_01_b_C': 'Avião esportivo', 'BP_HZ_ConvenienceStore01_C': 'Loja de conveniência',
          'BP_HZ_Store01_C': 'Loja', 'BP_HZ_ShopBuilding01_MS_C': 'Loja'}

# prédios que já aparecem com nome nas categorias de locais (evita ponto duplicado)
COVERED_BY_WAND = {'BP_HZ_MS_SchoolCampus01_C', 'BP_HZ_Mansion01a_MS_C', 'BP_HZ_MS_BankBuilding_C', 'BP_HZ_Motel_C',
                   'BP_HZ_BarBuilding_C', 'BP_HZ_ConvenienceStore01_C', 'BP_HZ_Store01_C', 'BP_HZ_ShopBuilding01_MS_C',
                   'BP_PowerStation_C', 'BP_PowerStation_Switch_C'}

for o in A:
    c, (x, y, z), pr = o['cls'], o['loc'], o.get('props', {})
    if c == 'BP_WorldPOIPopup_C':
        n = tr(pr.get('Name')) if pr.get('Name') else None
        if n: add('regiao', x, y, n.title() if n.isupper() else n, label=True)
    elif c.startswith('BP_Bunker') and 'Exterior' in c:
        key = pr.get('KeyRequired')
        info = ('Precisa do cartão: ' + key if key and key != 'None' else 'Entrada de bunker') + (' · precisa de energia' if pr.get('RequirePower?') else '')
        add('bunker', x, y, 'Bunker' + (' (porão)' if 'Cellar' in c else ' (elevador)' if 'Elevator' in c else ''), info)
    elif c == 'BP_ToxicZone_C':
        sc = (o.get('scale') or [1])[0]
        add('toxica', x, y, 'Zona radioativa', f'Raio aproximado: {round(1500 * sc / 100)} m', r=1500 * sc)
    elif c == 'BP_NodeHumanAI_C':
        n = pr.get('NumSpawnCount')
        boss = pr.get('HighPriorityAI')
        q = pr.get('QuestID')
        info = (f'{n} bandidos' if n else 'Bandidos') + (' + chefe' if boss else '') + (f' · missão {q}' if q else '')
        add('bandidos', x, y, 'Acampamento de bandidos', info)
    elif c.startswith('BP_NodeZeek'):
        t = c[len('BP_NodeZeek'):-2]
        add('horda', x, y, 'Zumbis: ' + ZOMBIE.get(t, t), (f"{pr['NumSpawnCount']} zumbis" if pr.get('NumSpawnCount') else ''))
    elif c.startswith('BP_NodeAnimal'):
        t = c[len('BP_NodeAnimal'):-2]
        add('animal', x, y, ANIMAL.get(t, t))
    elif c in HORSE:
        add('cavalo', x, y, 'Cavalo ' + HORSE[c].lower(), 'Pode ser montado')
    elif c == 'BP_GDog_Companion_C':
        add('cao', x, y, 'Cão companheiro', 'Pode ser domesticado')
    elif c == 'BP_RecruitSpawn_C':
        add('sobrevivente', x, y, 'Ponto de recrutamento', 'Pode aparecer: Steven, Shaun, Roger, Robert, Peter, Gerry, Fran, Dixon, Alice ou Ed')
    elif c in CARSP:
        nm, ch = CARSP[c]
        add('carro', x, y, 'Spawner de carro ' + nm.lower(), f'{ch}% de chance de gerar um carro')
    elif c.startswith('BP_StoneCutting_Child_'):
        t = c[len('BP_StoneCutting_Child_'):-2]
        add('minerio', x, y, ORE.get(t, t), 'Minere com picareta')
    elif c == 'BP_IActor_BeeHive_C':
        add('colmeia', x, y, 'Colmeia', 'Mel e cera')
    elif c == 'BP_AppleTree_C':
        add('macieira', x, y, 'Macieira', 'Maçãs')
    elif c == 'BP_KaiUniqueWeaponStashBase_C':
        add('esconderijo', x, y, 'Esconderijo de armas')
    elif c.startswith('BP_BackpackSpawner'):
        add('mochila', x, y, 'Mochila', {'BP_BackpackSpawner_C': 'Loot normal', 'BP_BackpackSpawnerLowTier_C': 'Loot fraco',
                                        'BP_BackpackSpawnerBasic_C': 'Loot básico', 'BP_BackpackSpawner_FullList_C': 'Loot completo'}.get(c, ''))
    elif c in STRUCT and c not in COVERED_BY_WAND:
        add('estrutura', x, y, STRUCT[c])

# ------------- locais do mapa da Wand (posições em coordenadas do jogo; conferidas com o nível)
WAND = {'Ponto de Spawn': 'spawn', 'Posto de Gasolina': 'posto', 'Casa': 'casa', 'Edifício Comercial': 'comercio',
        'Comunidade': 'publico', 'Restaurantes e Hospitalidade': 'restaurante', 'Industrial': 'armazem',
        'Base de Sobreviventes': 'basesobr', 'Contêineres': 'conteiner', 'Contêiner Trancado': 'trancado',
        'Leitura': 'leitura', 'Missão': 'missao', 'Missão Principal': 'missaop', 'Sobrevivente Amigável': 'amigavel',
        'Sucata e Chapas Metálicas': 'sucata',
        # categorias que o jogo já cobre: só entram pontos que não existam perto
        'Bunker': 'bunker', 'Área Irradiada': 'toxica', 'Sobreviventes Hostis': 'bandidos'}
DEFAULT_T = {'casa': 'Casa', 'comercio': 'Comércio', 'publico': 'Prédio público', 'restaurante': 'Restaurante',
             'armazem': 'Área industrial', 'basesobr': 'Base de sobreviventes', 'conteiner': 'Contêineres de carga',
             'trancado': 'Contêiner trancado', 'sucata': 'Sucata e chapas de metal', 'amigavel': 'Sobrevivente amigável',
             'posto': 'Posto de gasolina', 'bunker': 'Bunker', 'toxica': 'Zona radioativa', 'bandidos': 'Sobreviventes hostis',
             'missao': 'Missão', 'missaop': 'Missão principal', 'leitura': 'Leitura'}
# ------------- NPCs: lista oficial do jogo (DAsset_QuestLod), com título da missão em pt-BR
_q = load(p, 'HumanitZ/Content/TSS_Game/KaiAIMapTest/KaiHumanAI/Quest/Data/DAsset_QuestData')
QUESTS = _q.export_props(0)[0].get('Quests') or {}
_f = load(p, 'HumanitZ/Content/TSS_Game/KaiAIMapTest/KaiHumanAI/Quest/QuestPreset/Random/BP_HumanQuest_Random_NPC_Fighter')
_fp = next(_f.export_props(i)[0] for i, e in enumerate(_f.exports) if e['name'].startswith('Default__'))
FIGHTER_NAMES = (_fp.get('RandomFemaleNames') or []) + (_fp.get('RandomMaleNames') or [])
NPC_NAME = {'Base': 'Sobrevivente', 'CampGuard': 'Guarda do acampamento', 'Market': 'Vendedor do mercado negro', 'Cash': 'Comerciante (Cash)',
            'Doctor': 'Médico', 'Random_NPC': 'Sobrevivente', 'Thaiger2': 'Thaiger', 'Halloween': 'NPC de Halloween', 'Halloween1': 'NPC de Halloween',
            'Halloween2': 'NPC de Halloween'}
NPCS = json.load(open('npcs.json', encoding='utf-8'))
for n in NPCS:
    short = n['cls'].replace('BP_HumanQuest_', '')
    fighter = short == 'Random_NPC_Fighter'
    is_random = short.startswith('Random_')
    name = 'Sobrevivente (nome sorteado)' if fighter else NPC_NAME.get(short, short.replace('Random_', ''))
    q = QUESTS.get(n.get('quest')) or {}
    title = tr(q.get('Title')) if q.get('Title') else ''
    parts = []
    if title: parts.append('Missão/conversa: ' + title)
    ch = n.get('chance') or 0
    if ch >= 100: parts.append('Aparece sempre')
    else: parts.append(f"{ch:g}% de chance de aparecer" + (f", tenta de novo a cada {n['retry']:g} min" if n.get('retry') else ''))
    add('amigavel' if is_random else 'npcfixo', n['x'], n['y'], name, ' · '.join(parts))
    if fighter: P[-1]['f'] = 1
NPC_XY = [(n['x'], n['y']) for n in NPCS]

SIGN_TYPES = [('ferragens', 'Loja de Ferragens', r'HardwareStore_Sign'), ('farmacia', 'Farmácia', r'PharmacySign'), ('livraria', 'Livraria', r'BookStoreSign'),
              ('musica', 'Loja de Música', r'MusicStore'), ('esportes', 'Artigos Esportivos', r'SportingGoods'), ('games', 'Loja de Games', r'GameShop_Sign'),
              ('lavanderia', 'Lavanderia', r'Laundromat_Sign'), ('oficina', 'Oficina Mecânica', r'CarRepairShop_ExtSign')]
SIGN_POS = {sid: [(m[1], m[2]) for m in M if re.search(rx, m[0])] for sid, _, rx in SIGN_TYPES}
# ------------- prédios reais do jogo (DAsset_HumanitZLod): cada local é encaixado no prédio, não na porta/rua
import numpy as np
LOD = json.load(open('worldlod.json'))
HOUSES = LOD['houses']
HC = [h[0] for h in HOUSES]
HX = np.array([h[1] for h in HOUSES], float); HY = np.array([h[2] for h in HOUSES], float)
SMALL = re.compile(r'ContainerBox|Awning|GreenHouse|CanopyTent|CammoTent|TriageTent|SecurityBooth|StorageUnit|Shed|WoodAwning|TrainCar|SmallShed|Shelter')
IS_SMALL = np.array([bool(SMALL.search(c)) for c in HC])
def snap(x, y, small_ok=False, cls=None, maxd=5000):
    d = np.hypot(HX - x, HY - y)
    if cls is not None: d = np.where(np.array([bool(re.search(cls, c)) for c in HC]), d, 1e12)
    elif not small_ok: d = np.where(IS_SMALL, 1e12, d)
    i = int(d.argmin())
    return i if d[i] <= maxd else None
for i, c in enumerate(HC):
    if c == 'BP_HZ_GasStation01a':          # os 15 postos reais
        add('posto', HX[i], HY[i], 'Posto de gasolina', 'Bombas para sifonar combustível com galão')
for x, y, z in LOD['heli']:
    add('helicrash', x, y, 'Local de helicóptero caído', 'O evento pode acontecer aqui: zumbis ou bandidos guardam caixas de armas e munição')
USED_HOUSES = {}   # índice do prédio -> subcategoria já marcada
WP = json.load(open('wand_points.json', encoding='utf-8'))
WP.sort(key=lambda w: w['cat'] != 'Posto de Gasolina')   # postos primeiro, para deduplicar a loja do posto
# prédio comercial sem nome: cada placa do jogo identifica só o prédio sem nome mais próximo (até 40 m)
UNNAMED = [w for w in WP if w['cat'] == 'Edifício Comercial' and not (w['t'] or '').strip()]
NAMED_BY_SIGN = {}
for sid, nome, _ in SIGN_TYPES:
    for mx, my in SIGN_POS[sid]:
        if not UNNAMED: break
        b = min(UNNAMED, key=lambda w: (w['x'] - mx) ** 2 + (w['y'] - my) ** 2)
        if (b['x'] - mx) ** 2 + (b['y'] - my) ** 2 < 4000 ** 2:
            NAMED_BY_SIGN[(b['x'], b['y'])] = (sid, nome)
game_pts = {c: [(pt['u'], pt['v']) for pt in P if pt['c'] == c] for c in ('bunker', 'toxica', 'bandidos')}
seen = set()
for w in WP:
    cid = WAND.get(w['cat'])
    if not cid: continue
    u, v = uv(w['x'], w['y'])
    if cid == 'comercio' and 'posto de gasolina' in (w['t'] or '').lower():
        # a loja do posto já está representada pelo ícone do posto
        if any(pt['c'] == 'posto' and (pt['u'] - u) ** 2 + (pt['v'] - v) ** 2 < (12000 / S) ** 2 for pt in P):
            continue
        cid = 'posto'
    key = (cid, round(u, 4), round(v, 4))
    if key in seen: continue          # pontos repetidos na fonte
    seen.add(key)
    if cid in game_pts and any((u - a) ** 2 + (v - b) ** 2 < (25000 / S) ** 2 for a, b in game_pts[cid]):
        continue                       # já existe no dado do jogo (até 250 m)
    if cid == 'amigavel' and any((w['x'] - a) ** 2 + (w['y'] - b) ** 2 < 5000 ** 2 for a, b in NPC_XY):
        continue                       # já veio da lista oficial de NPCs (até 50 m)
    raw = (w['t'] or '').strip()
    if w['cat'] in GROUP_OF:
        named = NAMED_BY_SIGN.get((w['x'], w['y'])) if not raw else None
        if named:
            cid, raw = named
        else:
            cid = subtype(GROUP_OF[w['cat']], raw)
    t = raw or DEFAULT_T.get(cid, CATS[cid]['name'] if cid in CATS else w['cat'])
    if cid == 'posto':
        continue                       # os postos já vêm do prédio real do jogo
    if cid == 'toxica':
        add(cid, w['x'], w['y'], 'Zona radioativa', 'Área com radiação (tamanho não informado)')
        continue
    wx, wy = w['x'], w['y']
    if cid in BUILDING_CATS:
        small = cid in ('casa', 'conteiner', 'armazem', 'acampamento', 'militar', 'fazenda', 'basesobr')
        hi = snap(wx, wy, small_ok=small)
        if hi is not None:
            if USED_HOUSES.get(hi) == cid: continue   # mesmo prédio já marcado nesta categoria
            USED_HOUSES.setdefault(hi, cid)
            wx, wy = HX[hi], HY[hi]
    add(cid, wx, wy, t)

# prédios com tipo conhecido que a lista de locais não tinha
CLASS_SUB = {'BP_HZ_PharmacyStore': 'farmacia', 'BP_HZ_LiquorStore01': 'bebidas', 'BP_HZ_SportStore': 'esportes', 'BP_HZ_SportingStore': 'esportes',
             'BP_HZ_GunStore': 'armas', 'BP_HZ_GunStore02': 'armas', 'BP_HZ_HardwareStore01': 'ferragens', 'BP_HZ_Supermarket01': 'supermercado',
             'BP_HZ_ConvenienceStore01': 'conveniencia', 'BP_HZ_AutoRepairShop': 'oficina', 'BP_HZ_FamilyClinic': 'saude', 'BP_HZ_FireStation01': 'bombeiros',
             'BP_HZ_PostalOffice': 'correios', 'BP_HZ_CarWash': 'lavarapido', 'BP_HZ_Motel': 'motel', 'BP_HZ_Motel_a': 'motel', 'BP_HZ_ChurchBuilding01': 'igreja',
             'BP_HZ_FastFoodRestaurant01': 'restaurante', 'BP_HZ_PancakeHouseBuilding': 'panquecas', 'BP_HZ_ShopBuildingcafe': 'cafe', 'BP_HZ_Dinner01': 'restaurante',
             'BP_HZ_ShopBuildingBook': 'livraria', 'BP_HZ_BookStore': 'livraria', 'BP_HZ_BookStoreNew': 'livraria', 'BP_HZ_FurnitureStore': 'moveis'}
ADDED = collections.Counter()
for i, c in enumerate(HC):
    sid = CLASS_SUB.get(c)
    if not sid or i in USED_HOUSES: continue
    add(sid, HX[i], HY[i], CATS[sid]['name'])
    USED_HOUSES[i] = sid; ADDED[sid] += 1
print('prédios adicionados pelo tipo:', dict(ADDED))

# ------------- onde cada tabela de loot aparece de verdade: contêineres do jogo agrupados por prédio/local
SPAWN2TABLE = {'Ammo': 'INV_AmmoDatabase', 'Basic': 'INV_BasicLoot_w_Ammo', 'Basic No Ammo': 'INV_BasicLoot_No_Ammo', 'FoodDrink': 'INV_FoodWaterDatabase',
    'Medical': 'INV_MedicalDatabase', 'MeleeWeapons': 'INV_MeleeWeaponsDataBase', 'TopTierWeapons': 'INV_TopTierWeapons', 'GarageToolShed': 'INV_ToolsShedGarage',
    'Fridge': 'INV_FridgeDatabase', 'ChickenCoop': 'INV_ChickenCoopDatabase', 'DumpsterLoot': 'INV_DumpsterLoot', 'LockedVehicles': 'INV_LockedVehicles',
    'Clothes': 'INV_Clothes', 'PoliceCab': 'INV_PoliceCabinet', 'KitchenCupboard': 'INV_KitchenCupboardDatabase', 'ShopFridge': 'INV_ShopFridge', 'Bathroom': 'INV_BathroomLoot',
    'SurvivorLoot': 'INV_SurvivorLoot', 'ToolBox': 'INV_ToolBox', 'HardwareStore': 'INV_HardwareStore', 'AutoParts': 'INV_AutoParts', 'SupplyDrop': 'INV_SupplyDropLoot',
    'HazmatLoot': 'INV_HazmatLoot', 'Wardrobe': 'INV_Wardrobe', 'PostLoot': 'INV_PostLoot', 'DrinksMachine': 'INV_DrinksMachine', 'GraveLoot': 'INV_GraveLoot', 'Music': 'INV_MusicLoot',
    'Coffee': 'INV_CoffeeDatabase', 'Soup': 'INV_Soup', 'LiquorStore': 'INV_LiquorStore', 'Skip': 'INV_DumpsterSkipLoot', 'FishingLoot': 'INV_FishingLoot', 'Nails': 'INV_NailsLoot',
    'Antiques': 'INV_Antiques', 'Sport': 'INV_Sports', 'PC': 'INV_PCDatabase', 'PoliceClothes': 'INV_PoliceClothes', 'Cabinet': 'INV_CabinetDatabase', 'HouseTrash': 'INV_HouseTrash',
    'Pancake': 'INV_PancakeDatabase', 'HouseElec': 'INV_HouseElecLoot', 'FarmLoot': 'INV_FarmLoot', 'SportingGoods': 'INV_SportingGoods', 'BunkerLoot': 'INV_BunkerLoot',
    'MilitaryAmmo': 'INV_AmmoMilDatabase', 'StorageAutoParts': 'INV_AutoPartsStorage', 'StorageHouseElectric': 'INV_HouseElecLootStorage', 'StorageOutdoors': 'INV_OutdoorsStorage',
    'StorageKitchen': 'INV_KitchenStorageDatabase', 'CharmToys': 'INV_CharmToys', 'CannedFood': 'INV_CannedFoodDatabase', 'Firearms': 'INV_Firearms', 'Pharmacy': 'INV_PharmacyDatabase',
    'BlackMarket': 'INV_BlackMarket', 'WeaponCrate': 'INV_WeaponCrate', 'BooksMags': 'INV_BooksMags', 'ToolBoxBig': 'INV_ToolBoxBig', 'AutoPartsBonnet': 'INV_AutoPartsBonnet'}
NAMED = [pt for pt in P if pt['c'] in BUILDING_CATS or pt['c'] == 'posto']
NU = np.array([pt['u'] for pt in NAMED]); NV = np.array([pt['v'] for pt in NAMED])
by_table = collections.defaultdict(list)
for cl, sp, x, y, z in LOD['containers']:
    tb = SPAWN2TABLE.get(sp)
    if tb: by_table[tb].append((x, y, cl))
LOOT_PTS = {}
near_m = 3000 / S * CAL['scale']   # 30 m em unidades do mapa
for tb, items in by_table.items():
    groups = []                    # agrupa contêineres próximos (até 25 m) em um único local
    for x, y, cl in items:
        for g in groups:
            if (g[0] / g[2] - x) ** 2 + (g[1] / g[2] - y) ** 2 < 2500 ** 2:
                g[0] += x; g[1] += y; g[2] += 1; break
        else:
            groups.append([x, y, 1])
    rows = []
    for gx, gy, n in groups:
        u, v = uv(gx / n, gy / n)
        if not inside(u, v): continue
        d = np.hypot(NU - u, NV - v)
        i = int(d.argmin())
        title = NAMED[i]['t'] if d[i] < near_m else ''
        rows.append([u, v, n, title])
    LOOT_PTS[tb] = rows
print('tabelas com local exato:', len(LOOT_PTS), 'locais:', sum(len(r) for r in LOOT_PTS.values()))
print('ferragens:', [(r[2], r[3]) for r in LOOT_PTS.get('INV_HardwareStore', [])])

# região mais próxima de cada ponto (para diferenciar locais com o mesmo nome)
REG = [pt for pt in P if pt['c'] == 'regiao']
for pt in P:
    if pt['c'] == 'regiao' or not REG: continue
    near = min(REG, key=lambda r: (r['u'] - pt['u']) ** 2 + (r['v'] - pt['v']) ** 2)
    pt['a'] = near['t']

if __name__ == '__main__':
    import sys
    zmax = tiles() if '--no-tiles' not in sys.argv else 4
    counts = collections.Counter(pt['c'] for pt in P)
    cats = [dict(c, n=counts.get(c['id'], 0)) for c in CATS.values() if counts.get(c['id'])]
    data = {'size': 4096, 'tile': TILE, 'zmax': zmax, 'cats': cats, 'pts': P, 'lootMap': LOOTMAP, 'fighterNames': FIGHTER_NAMES}
    with open(os.path.join(OUT, 'js', 'mapdata.js'), 'w', encoding='utf-8') as fh:
        fh.write('// Gerado automaticamente a partir do nível BattleRoyale_Map_a e do mapa HZ_FullMap_4Kisland_FINAL\n')
        fh.write('window.HZ_MAP = ')
        json.dump(data, fh, ensure_ascii=False, separators=(',', ':'))
        fh.write(';\n')
    with open(os.path.join(OUT, 'js', 'lootmap.js'), 'w', encoding='utf-8') as fh:
        fh.write('// Onde cada tabela de loot aparece: contêineres do jogo agrupados [u, v, quantidade, nome do local]\n')
        fh.write('window.HZ_LOOTPTS = ')
        json.dump(LOOT_PTS, fh, ensure_ascii=False, separators=(',', ':'))
        fh.write(';\n')
    for c in cats: print(c['n'], c['name'])
    print('total', len(P))
