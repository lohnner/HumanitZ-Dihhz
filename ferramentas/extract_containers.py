"""Móveis e contêineres saqueáveis (BP_* de Inventory/Container) e a tabela de loot de cada um -> js/containers.js"""
import json, os, re
from pak import Pak
from extra import load, read_enum, read_locres

OUT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
p = Pak()
C = 'HumanitZ/Content/'
# Valor de Enum_SpawnType -> tabela INV_*. "All" fica de fora: não corresponde a uma tabela só
TABLE = {'Basic': 'INV_BasicLoot_w_Ammo', 'Basic No Ammo': 'INV_BasicLoot_No_Ammo', 'FoodDrink': 'INV_FoodWaterDatabase', 'Ammo': 'INV_AmmoDatabase', 'Medical': 'INV_MedicalDatabase',
         'MeleeWeapons': 'INV_MeleeWeaponsDataBase', 'TopTierWeapons': 'INV_TopTierWeapons', 'DirtyWater': 'INV_ToiletDatabase', 'GarageToolShed': 'INV_ToolsShedGarage', 'Fridge': 'INV_FridgeDatabase',
         'EnemyAI': 'INV_EnemyAI', 'ChickenCoop': 'INV_ChickenCoopDatabase', 'DumpsterLoot': 'INV_DumpsterLoot', 'Clothes': 'INV_Clothes', 'PoliceCab': 'INV_PoliceCabinet',
         'KitchenCupboard': 'INV_KitchenCupboardDatabase', 'ShopFridge': 'INV_ShopFridge', 'ZombieBasic': 'INV_ZombieBasic', 'Bathroom': 'INV_BathroomLoot', 'SurvivorLoot': 'INV_SurvivorLoot',
         'ToolBox': 'INV_ToolBox', 'HardwareStore': 'INV_HardwareStore', 'AutoParts': 'INV_AutoParts', 'SupplyDrop': 'INV_SupplyDropLoot', 'HazmatLoot': 'INV_HazmatLoot', 'Wardrobe': 'INV_Wardrobe',
         'PostLoot': 'INV_PostLoot', 'DrinksMachine': 'INV_DrinksMachine', 'GraveLoot': 'INV_GraveLoot', 'Skip': 'INV_DumpsterSkipLoot', 'PC': 'INV_PCDatabase', 'PoliceClothes': 'INV_PoliceClothes',
         'FarmLoot': 'INV_FarmLoot', 'Sport': 'INV_Sports', 'BunkerLoot': 'INV_BunkerLoot', 'MilitaryAmmo': 'INV_AmmoMilDatabase', 'WeaponCrate': 'INV_WeaponCrate', 'ToolBoxBig': 'INV_ToolBoxBig',
         'AutoPartsBonnet': 'INV_AutoPartsBonnet', 'Antiques': 'INV_Antiques', 'Cabinet': 'INV_CabinetDatabase', 'HouseTrash': 'INV_HouseTrash'}
# Sem loot próprio do mundo: bases de herança, itens do jogador e testes
SKIP = re.compile(r'^BP_(Master|PlayerContainer|TraderContainer|DogVest|ContainerDogVest|HorseContainer|ContainerAnimal|ContainerGunRack)|DONOTUSE')
GROUPS = [('veiculo', re.compile(r'AbanVeh|CarWreck|Caravan|Campervan|Police(Car|SUV)|PostVan|VehicleBonnet|ContainerMedical')),
          ('corpo', re.compile(r'EnemyAI|ContainerZombie|Grave')),
          ('militar', re.compile(r'Airdrop|WeaponCrate|WeaponStash|Bunker|Locked|AmmoContainer')),
          ('comercio', re.compile(r'ContainerFridge|DrinksMachine|PostParcel|PoliceCabinet|PoliceLocker|SportsBox|WarehouseBox|AntiqueBox|ContainerPC|CarPartsBox')),
          ('casa', re.compile(r'Bathroom|Cabinet|Wardrobe|Fridge|Kitchen|Toilet|Washing|DirtyClothes|TrashBin|ToolBox|ContainerLocker|Luggage|MedBag|WaterDispenser')),
          ('fora', re.compile(r'.'))]

loc = {lang: read_locres(p.read(f'{C}Localization/Game/{lang}/Game.locres')) for lang in ('pt-BR', 'en')}
def txt(t):
    if not t: return {'en': '', 'pt': ''}
    if isinstance(t, str): return {'en': t, 'pt': t}
    if 'src' not in t: return {'en': '', 'pt': ''}
    k = (t['ns'], t['key'])
    en = loc['en'].get(k, t['src']); pt = loc['pt-BR'].get(k, en)
    return {'en': en.strip(), 'pt': pt.strip()}

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

spawn = read_enum(p, files['enum_spawntype'])
known = {f.split('/')[-1][:-7] for f in p.files if re.search(r'/Data/INV_[^/]+\.uasset$', f)}
grouped, skipped_all = {}, []
for key, path in sorted(files.items()):
    if '/TSS_Game/Inventory/Container/BP_' not in path + '/': continue
    bp = path.split('/')[-1]
    if SKIP.search(bp): continue
    pr = chain(bp)
    if not pr.get('DoesSpawnLoot') or 'ItemSpawnType' not in pr: continue
    kind = spawn.get(pr['ItemSpawnType'])
    table = TABLE.get(kind)
    if not table or table not in known:
        skipped_all.append((bp, kind)); continue
    name = txt(pr.get('ContainerName'))
    group = next(g for g, rx in GROUPS if rx.search(bp))
    e = grouped.setdefault((name['en'].lower(), table), {'id': bp.replace('BP_', ''), 'name': name, 'table': table, 'group': group, 'slots': [], 'rolls': [], 'zombie': 0, 'classes': 0})
    e['slots'].append(pr.get('Slots')); e['rolls'].append(pr.get('RunSpawnCounterTimes')); e['classes'] += 1
    e['zombie'] = max(e['zombie'], pr.get('ZombieSpawnChance') or 0)

out = []
for e in grouped.values():
    e['slots'] = [min(e['slots']), max(e['slots'])]
    e['rolls'] = [min(e['rolls']), max(e['rolls'])]
    out.append(e)

with open(os.path.join(OUT, 'js', 'containers.js'), 'w', encoding='utf-8', newline='\n') as fh:
    fh.write('// Gerado automaticamente: móveis e contêineres saqueáveis (BP_* de Inventory/Container)\n')
    fh.write('window.HZ_DATA.containers = ')
    json.dump(out, fh, ensure_ascii=False, separators=(',', ':'))
    fh.write(';\n')
print('conteineres', len(out), 'fora', skipped_all)
by = {}
for e in out: by.setdefault(e['group'], []).append(e['name']['pt'] + ' [' + e['table'].replace('INV_', '') + ']')
for g, v in by.items(): print(g, len(v), v)
print('wardrobe', [e for e in out if 'Wardrobe' in e['table']])
print('sem nome', [e['id'] for e in out if not e['name']['pt']])
