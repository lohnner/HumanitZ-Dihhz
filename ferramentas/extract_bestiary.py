"""Zumbis, bandidos e animais (BP_NodeManager, BP_Node*, blueprints de cada criatura) -> js/bestiary.js + img/creatures/*.webp
Passe --sem-imagens para só atualizar os dados."""
import json, os, re, sys
import numpy as np
from pak import Pak
from extra import load, read_enum
from skmesh import materials, lods, indices_before, sections
from render import render, material_look, texture

OUT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(OUT, 'img', 'creatures')
os.makedirs(IMG, exist_ok=True)
p = Pak()
C = 'HumanitZ/Content/'
NS = C + 'TSS_Game/KaiWorldEffects/NodeSpawner/'
# Argumentos de "Set Diff Value" para Health em ApplyDiffSettings de BP_PawnZombie e BP_KaiHumanAI_Base,
# na ordem VeryEasy, Easy, Default, Hard, VeryHard, Nightmare (índices 0 a 5 de ZombieHealth/HumanHealth)
ZOMBIE_HP_MULT = [0.5, 0.7, 1.1, 1.25, 1.5, 2.0]
HUMAN_HP_MULT = [0.5, 0.7, 1.0, 1.2, 1.4, 2.0]
PRESETS = [('GameDiff_Rookie', 'Iniciante'), ('GameDiff_Default', 'Padrão'), ('GameDiff_Hardcore', 'Hardcore'), ('GameDiff_Nightmare', 'Pesadelo'), ('GameDiff_Headshotonly', 'Só tiro na cabeça')]
# Malhas e texturas que o blueprint define só em tempo de execução
ANIMAL_MESH = {'AnimalWolf': ['SK_Wolf'], 'AnimalBear': ['Bear_Rig'], 'AnimalZBear': ['Bear_Rig'], 'AnimalStag': ['SK_DeerStag'], 'AnimalBuck': ['SK_DeerStag'], 'AnimalDoe': ['SK_DeerDoe'],
               'AnimalZStag': ['SK_DeerStag'], 'AnimalPig': ['SK_Pig'], 'AnimalChicken': ['SK_Chicken'], 'AnimalZDog': ['SK_DogZombie']}
TEXTURE = {'AnimalZBear': 'T_HZ_Bear_Zombified_D', 'AnimalBear': 'brown_bear_col4', 'AnimalRabbit': 'wild_rabbit_col5'}

# O jogo não dá nome a estes tipos: nomes da wiki, a partir do nome interno de cada um
NAMES = {
    'ZombieDefault': ('Andarilho', 'Walker'), 'ZombieDefault2': ('Andarilho (variante)', 'Walker (variant)'), 'ZombieFemale': ('Andarilha', 'Female walker'),
    'ZombieFemale2': ('Garota zumbi', 'Zombie girl'), 'ZombieUrban': ('Zumbi urbano', 'Urban zombie'), 'ZombieRunner': ('Corredor', 'Runner'),
    'ZombieNightRunner': ('Corredor noturno', 'Night runner'), 'ZombieBrute': ('Brutamontes', 'Brute'), 'ZombieBruteRunner': ('Brutamontes corredor', 'Brute runner'),
    'ZombieBruteComp': ('Brutamontes policial', 'Police brute'), 'ZombieBruteCamo': ('Brutamontes camuflado', 'Camo brute'), 'ZombieBrutePrison': ('Brutamontes prisioneiro', 'Prison brute'),
    'ZombieCamo': ('Soldado zumbi', 'Camo zombie'), 'ZombieMilitaryArmor': ('Militar blindado', 'Armored military'), 'ZombieMilitaryArmorV2': ('Militar blindado (variante)', 'Armored military (variant)'),
    'ZombieMilitaryRunner': ('Militar blindado corredor', 'Armored military runner'), 'ZombiePolice1': ('Policial', 'Police'), 'ZombiePolice2': ('Policial (variante)', 'Police (variant)'),
    'ZombieCop': ('Guarda', 'Cop'), 'ZombiePoliceArmor': ('Policial blindado', 'Armored police'), 'ZombiePrison': ('Prisioneiro', 'Prisoner'), 'ZombieMedic': ('Médico zumbi', 'Medic'),
    'ZombiePsycho': ('Paciente', 'Patient'), 'ZombieHazmat': ('Traje contaminado', 'Hazmat'), 'ZombieLeaper': ('Saltador', 'Leaper'), 'ZombieMutant': ('Mutante tóxico', 'Toxic mutant'),
    'ZombieFatty': ('Gordo', 'Fatty'), 'ZombieBellyToxic': ('Barrigudo tóxico', 'Toxic belly'), 'ZombieGiant': ('Gigante', 'Giant'), 'ZombieGiantPrison': ('Gigante prisioneiro', 'Prison giant'),
    'ZombieZanta': ('Papai Noel zumbi', 'Zanta'), 'BanditMelee': ('Bandido com facão', 'Melee bandit'), 'BanditPistol': ('Bandido com pistola', 'Pistol bandit'),
    'BanditRifle': ('Bandido com rifle', 'Rifle bandit'), 'BanditShotgun': ('Bandido com escopeta', 'Shotgun bandit'), 'BanditSniper': ('Atirador de elite', 'Sniper bandit'), 'BanditBoss': ('Chefe dos bandidos', 'Bandit boss'),
    'AnimalBear': ('Urso', 'Bear'), 'AnimalWolf': ('Lobo', 'Wolf'), 'AnimalStag': ('Cervo', 'Stag'), 'AnimalDoe': ('Corça', 'Doe'), 'AnimalBuck': ('Gamo', 'Buck'), 'AnimalRabbit': ('Coelho', 'Rabbit'),
    'AnimalPig': ('Porco', 'Pig'), 'AnimalChicken': ('Galinha', 'Chicken'), 'AnimalZBear': ('Urso zumbi', 'Zombie bear'), 'AnimalZDog': ('Cão zumbi', 'Zombie dog'), 'AnimalZStag': ('Cervo zumbi', 'Zombie stag'),
}
# igual a ZOMBIE e ANIMAL de ferramentas/build_map.py: títulos dos pontos do mapa
ZOMBIE_TITLE = {'Walkers': 'Andarilhos', 'WalkersSmall': 'Andarilhos (grupo pequeno)', 'WalkersLarge': 'Andarilhos (grupo grande)', 'Walkers2': 'Andarilhos',
                'IndoorsMix': 'Mistura (interiores)', 'Mix01': 'Mistura', 'Mix02': 'Mistura', 'Mix03': 'Mistura', 'Police': 'Policiais', 'Military': 'Militares',
                'Runners': 'Corredores', 'BruteRunners': 'Brutamontes corredores', 'Toxic': 'Tóxicos', 'ToxicBelly': 'Barrigudos tóxicos', 'Giant': 'Gigantes',
                'Meds': 'Médicos', 'Leaper': 'Saltadores', 'Fatty': 'Gordos', 'Prison': 'Prisioneiros', 'IslandMix01': 'Mistura da ilha',
                'IslandMilitary': 'Militares da ilha', 'IslandMixIndoor': 'Mistura da ilha (interior)', 'IslandPatient': 'Pacientes', 'ZombieDog': 'Cães zumbis'}
ANIMAL_TITLE = {'Deer': 'Cervo', 'Rabbit': 'Coelho', 'Wolf': 'Lobo', 'Bear': 'Urso', 'ZeekBear': 'Urso zumbi', 'ZeekStag': 'Cervo zumbi', 'Goat': 'Cabra', 'Pig': 'Porco', 'Chicken': 'Galinha'}
EVENTS = {'BP_Node_Event_AirDrop_Zombie': 'Evento: suprimento aéreo', 'BP_Node_Event_HeliCrash_Zombie': 'Evento: helicóptero caído', 'BP_Node_Event_AirDrop_Human': 'Evento: suprimento aéreo',
          'BP_Node_Event_HeliCrash_Human': 'Evento: helicóptero caído', 'BP_NodeHumanAI': 'Acampamentos de bandidos'}
# Valor do enum Enum_SpawnType -> tabela INV_*
LOOT = {'ZombieBasic': 'INV_ZombieBasic', 'PoliceCab': 'INV_PoliceCabinet', 'Medical': 'INV_MedicalDatabase', 'HazmatLoot': 'INV_HazmatLoot',
        'MilitaryAmmo': 'INV_AmmoMilDatabase', 'Ammo': 'INV_AmmoDatabase', 'EnemyAI': 'INV_EnemyAI'}

files = {}
for f in p.files:
    if f.startswith(C) and f.endswith('.uasset'): files.setdefault(f.split('/')[-1][:-7].lower(), f[:-7])
cache = {}
def chain(bp):
    """Propriedades herdadas (o filho sobrescreve a base)"""
    key = bp.lower()
    if key in cache: return cache[key]
    if key not in files: return {}
    k = load(p, files[key])
    own, parent = {}, None
    for i, e in enumerate(k.exports):
        if e['name'].startswith('Default__'): own = k.export_props(i)[0]
        elif (k.ref(e['cls']) or '').endswith('GeneratedClass'): parent = k.ref(e['sup'])
    base = chain(parent[:-2]) if parent and parent.endswith('_C') else {}
    cache[key] = {**base, **own}
    return cache[key]
def own_comps(bp):
    k = load(p, files[bp.lower()])
    return [e['name'] for e in k.exports]

def skel(name_or_path):
    """Maior LOD legível de uma malha esquelética; aceita nome curto ou caminho /Game/..."""
    path = C + name_or_path.split('.')[0][len('/Game/'):] if name_or_path.startswith('/Game/') else files.get(name_or_path.lower())
    if not path: raise ValueError('malha não encontrada: ' + name_or_path)
    k = load(p, path)
    mats, pp = materials(k)
    l = max(lods(k), key=lambda x: x['n'])
    idx, ip = indices_before(k.ue, l['start'], l['n'])
    return dict(pos=l['pos'], uv=l['uv'], idx=idx, sections=sections(k.ue, ip, len(idx), len(mats), pp), mats=mats)

def looks_for(mats, cid):
    forced = TEXTURE.get(cid)
    tex = texture(p, forced) if forced else None
    white = np.array([1.0, 1.0, 1.0], np.float32)
    return [(white, tex, 'other') if tex is not None else material_look(p, m) for m in mats]

def creature_image(cid, pr, bp):
    """Primeira opção de cada lista do jogo (RandomHeads/Chests/Bottoms); a pose é a de referência do modelo"""
    names = [(pr.get(k) or [None])[0] for k in ('RandomHeads', 'RandomChests', 'RandomBottoms')]
    names = [n for n in names if n and n != 'None'] or ANIMAL_MESH.get(cid, [])
    if not names:   # bandidos: a lista inclui corpos genéricos, então prefere um modelo de bandido
        models = pr.get('RandomModels') or []
        bandits = [m for m in models if '/Bandit' in m] or models
        # as listas se repetem entre as classes: escolhe posições diferentes para as imagens não saírem iguais
        pick = {'BanditPistol': 2, 'BanditRifle': 4, 'BanditShotgun': 6}.get(cid, 0)
        names = [bandits[pick % len(bandits)]] if bandits else []
    # componente do próprio blueprint: malha fixa e materiais trocados (ex.: cervo zumbi)
    overrides = []
    k = load(p, files[bp.lower()])
    for i, e in enumerate(k.exports):
        if 'SkeletalMeshComponent' in (k.ref(e['cls']) or ''):
            d = k.export_props(i)[0]
            if d.get('SkeletalMesh') and not names: names.append(d['SkeletalMesh'])
            overrides = overrides or [o for o in d.get('OverrideMaterials') or []]
    if not names: return None
    target = os.path.join(IMG, cid + '.webp')
    if '--sem-imagens' in sys.argv and os.path.exists(target): return 'img/creatures/' + cid + '.webp'
    parts = []
    for n in names:
        m = skel(n)
        mats = list(m['mats'])
        for i, o in enumerate(overrides):
            if o and i < len(mats): mats[i] = o
        looks = looks_for(mats, cid)
        parts.append(dict(pos=m['pos'].astype(np.float32), uv=m['uv'], idx=m['idx'],
                          sections=[(looks[a] if a < len(looks) else None, b, c) for a, b, c in (m['sections'] or [])]))
    img = render(parts, size=(360, 460), yaw=-62, pitch=6)
    img.save(target, 'WEBP', quality=84, method=6)
    return 'img/creatures/' + cid + '.webp'

gamediff = chain('BP_GameDiffNew')
def presets(param, base, mult):
    return [{'name': label, 'hp': round(base * mult[int((gamediff[key].get('Params') or {}).get(param, 2))])} for key, label in PRESETS]

spawn = read_enum(p, files['enum_spawntype'])
def loot_table(v): return LOOT.get(spawn.get(v))

manager = chain('BP_NodeManager')['AIList']

# Grupos de spawn por tipo de criatura
groups = {}
for f in sorted(files):
    path = files[f]
    if '/NodeSpawner/' not in path: continue
    bp = path.split('/')[-1]
    title, kind = None, None
    m = re.match(r'BP_NodeZeek(.+)$', bp)
    a = re.match(r'BP_NodeAnimal(.+)$', bp)
    if m: title, kind = ZOMBIE_TITLE.get(m.group(1), m.group(1)), 'horda'
    elif a: title, kind = ANIMAL_TITLE.get(a.group(1), a.group(1)), 'animal'
    elif bp in EVENTS: title = EVENTS[bp]
    if not title: continue
    pr = chain(bp)
    for key in pr.get('SpawnList') or {}:
        lst = groups.setdefault(key, [])
        if not any(g['t'] == title for g in lst):
            lst.append({'t': title, **({'map': ('Zumbis: ' + title if kind == 'horda' else title), 'cat': kind} if kind else {}), 'n': pr.get('NumSpawnCount')})

out = []
for key, path in manager.items():
    short = key.split('::')[-1].replace('E_', '')
    if short == 'MAX': short = 'AnimalWolf'   # o enum do lobo aparece como E_MAX no jogo
    if short not in NAMES: continue
    bp = path.split('/')[-1].split('.')[0]
    pr = chain(bp)
    name = {'pt': NAMES[short][0], 'en': NAMES[short][1]}
    entry = {'id': short, 'name': name, 'groups': groups.get(key, [])}
    if short.startswith('Zombie'):
        comps = own_comps(bp)
        flags = []
        if pr.get('IsRunner'): flags.append('Corre')
        if pr.get('CanMiniJump?'): flags.append('Salta')
        if pr.get('CanDodge'): flags.append('Desvia')
        if pr.get('HardToStagger?'): flags.append('Difícil de atordoar')
        if pr.get('CanCrawl?') is False: flags.append('Não rasteja')
        if any('ToxicSphere' in c for c in comps): flags.append('Área tóxica')
        if pr.get('RandomBackpackChance'): flags.append(f"{round(pr['RandomBackpackChance'] * 100)}% de chance de mochila")
        entry.update(cat='zombie', hp=pr.get('Health'), hpBy=presets('ZombieHealth', pr.get('Health'), ZOMBIE_HP_MULT), dmg=pr.get('BaseDamage'), bite=round((pr.get('BiteChance') or 0) * 100, 1), xp=pr.get('XPMultiplier'),
                     armor=round((pr.get('ArmorDamageReduction') or 0) * 100) if pr.get('IsArmored?') else 0, stagger=pr.get('MaxStaggerHits'),
                     sense=(pr.get('PerceptionRadius') or 0) / 100, flags=flags, loot=None if pr.get('SpawnLoot?') is False else loot_table(pr.get('Item Spawn Type')))
    elif short.startswith('Bandit'):
        lc = chain(pr['LootContainerClass'][:-2]) if pr.get('LootContainerClass') else {}
        # NativeHumanNPC não tem vida própria no blueprint: vem do BP_AttributeComponent padrão
        human_hp = chain('BP_AttributeComponent').get('Health')
        entry.update(cat='bandit', hp=human_hp, hpBy=presets('HumanHealth', human_hp, HUMAN_HP_MULT), melee=pr.get('MeleeDamage'), bullet=pr.get('BulletDamage'), rate=pr.get('FireRate'), mag=pr.get('MaxAmmo'),
                     range=(pr.get('AttackRange') or 0) / 100, sense=(pr.get('PerceptionRadius') or 0) / 100, chase=(pr.get('ChaseSpeed') or 0) / 100, sprint=(pr.get('SprintSpeed') or 0) / 100,
                     loot=loot_table(lc.get('ItemSpawnType')))
    else:
        entry.update(cat='animal', hp=pr.get('Health'), dmg=pr.get('Base Damage'), speed=(pr.get('FleeSpeed') or 0) / 100, walk=(pr.get('RoamSpeed') or 0) / 100,
                     bleed=round((pr.get('BleedChance') or 0) * 100), meat=pr.get('MeatToSpawn'), fat=pr.get('FatToSpawn'), hostile='Base Damage' in pr and bool(pr['Base Damage']))
    try:
        entry['img'] = creature_image(short, pr, bp)
    except Exception as ex:
        entry['img'] = None; print('imagem falhou', short, ex)
    print('  ', short, entry['img'], flush=True)
    out.append(entry)

_, animal_rows = load(p, C + 'TSS_Game/Data/Animal_DT').datatable()
hide = {'AnimalBear': 'Bear', 'AnimalWolf': 'Wolf', 'AnimalStag': 'Deer', 'AnimalDoe': 'Deer', 'AnimalBuck': 'Deer', 'AnimalRabbit': 'Rabbit', 'AnimalPig': 'Pig', 'AnimalChicken': 'Chicken'}
for e in out:
    row = animal_rows.get(hide.get(e['id']))
    if row and row.get('HideNameFromItemDT') not in (None, 'None'): e['hide'] = row['HideNameFromItemDT']

with open(os.path.join(OUT, 'js', 'bestiary.js'), 'w', encoding='utf-8', newline='\n') as fh:
    fh.write('// Gerado automaticamente: zumbis, bandidos e animais (BP_NodeManager, BP_Node*, blueprints)\n')
    fh.write('window.HZ_DATA.bestiary = ')
    json.dump(out, fh, ensure_ascii=False, separators=(',', ':'))
    fh.write(';\n')
n = {}
for e in out: n[e['cat']] = n.get(e['cat'], 0) + 1
print('criaturas', len(out), n, 'sem imagem', [e['id'] for e in out if not e['img']])
print('vida', {e['cat']: e['hpBy'] for e in out if e.get('hpBy')})
print('sem grupo:', [e['id'] for e in out if not e['groups']])
print('sem loot:', [e['id'] for e in out if e['cat'] != 'animal' and not e.get('loot')])
print('faltando nome:', [k for k in manager if k.split('::')[-1].replace('E_', '') not in NAMES])
print('tabelas', sorted({e.get('loot') for e in out if e.get('loot')}))
for e in out:
    if e['cat'] == 'bandit': print(e['id'], {a: e[a] for a in ('hp', 'melee', 'bullet', 'rate', 'mag', 'range', 'sense', 'chase', 'sprint', 'loot')})
    if e['cat'] == 'animal': print(e['id'], {a: e.get(a) for a in ('hp', 'dmg', 'speed', 'walk', 'bleed', 'meat', 'fat', 'hide')})
