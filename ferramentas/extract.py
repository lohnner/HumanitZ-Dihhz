import json, os, sys, re
from pak import Pak
from extra import load, read_enum, read_locres
from tex import load_icon

OUT = r"C:\Users\rodri\OneDrive\Documentos\HumanitZ"
ICONS = os.path.join(OUT, 'img', 'icons')
os.makedirs(ICONS, exist_ok=True)

p = Pak()
files = sorted(p.files)
C = 'HumanitZ/Content/'

def find(name):
    return next(f for f in files if f.endswith('/' + name + '.uasset'))[:-7]

loc = {lang: read_locres(p.read(f'{C}Localization/Game/{lang}/Game.locres')) for lang in ('pt-BR', 'en')}

def txt(t):
    if not t: return {'en': '', 'pt': ''}
    if isinstance(t, str): return {'en': t, 'pt': t}
    if 'src' in t:
        k = (t['ns'], t['key'])
        en = loc['en'].get(k, t['src']); pt = loc['pt-BR'].get(k, en)
        return {'en': en, 'pt': pt}
    return {'en': str(t.get('key', '')), 'pt': str(t.get('key', ''))}

enums = {}
for e in ['E_ItemTypes', 'E_SpecificType', 'E_ClothingPosition', 'E_CraftingStation', 'Enum_Professions',
          'E_ResourceType', 'Enum_SkillBookType', 'E_BuildCategory']:
    try: enums.update(read_enum(p, find(e)))
    except Exception as ex: print('enum fail', e, ex)
def en(v): return enums.get(v, v.split('::')[-1] if isinstance(v, str) else v)

def obj(path): return path.split('.')[0] if path and path != 'None' else None

icon_cache = {}
def icon(path):
    path = obj(path)
    if not path: return None
    if path in icon_cache: return icon_cache[path]
    base = 'HumanitZ/Content/' + path[len('/Game/'):]
    fn = re.sub(r'[^A-Za-z0-9_-]', '_', path.split('/')[-1]) + '.webp'
    res = None
    try:
        if base + '.uasset' in p.files:
            img, fmt = load_icon(p, base, 128)
            if img.size[0] > 128: img = img.resize((128, 128 * img.size[1] // img.size[0]))
            target = os.path.join(ICONS, fn)
            if os.path.exists(target) and icon_cache.get('#' + fn) != path:
                fn = fn[:-5] + '_' + str(abs(hash(path)) % 9999) + '.webp'; target = os.path.join(ICONS, fn)
            img.save(target, 'WEBP', quality=85, method=6)
            icon_cache['#' + fn] = path
            res = 'img/icons/' + fn
    except Exception as ex:
        print('icon fail', path, ex)
    icon_cache[path] = res
    return res

def rowref(s):
    return (s or {}).get('Item', {}).get('RowName')

# ---------- items ----------
k = load(p, C + 'TSS_Game/Data/Localization/DT_ItemDatabase')
_, rows = k.datatable()
items = {}
for rid, r in rows.items():
    if rid in ('Empty', 'None'): continue
    n = txt(r.get('Name'))
    inside = r.get('ItemsInside') or {}
    sb = r.get('SkillBookData') or {}
    att = r.get('SupportedAttachments') or {}
    items[rid] = {
        'id': rid, 'name': n, 'desc': txt(r.get('Desc')),
        'type': en(r.get('Type')), 'sub': en(r.get('SpecificType')),
        'slot': en(r.get('WearOnCharacter')) if en(r.get('Type')) in ('Clothing', 'Armour') else None,
        'chance': r.get('ChanceToSpawn', 0), 'weight': r.get('Weight', 0),
        'stack': r.get('MaxStackSize', 0), 'canStack': r.get('CanStack'),
        'decays': r.get('DoesDecay'), 'decayDay': r.get('DecayPerDay', 0),
        'onlyDecayOpened': r.get('OnlyDecayIfOpened'),
        'durLoss': r.get('DurabilityLoss', 0), 'armor': r.get('ArmorProtectionValue', 0),
        'warmth': r.get('WarmthValue', 0), 'cool': r.get('SummerCoolValue', 0),
        'infection': r.get('InfectionProtection', 0),
        'rain': r.get('ClothingRainModifier', 0), 'snow': r.get('ClothingSnowModifier', 0),
        'trader': r.get('ValueToTrader', 0), 'player': r.get('ValueForPlayer', 0),
        'noVendor': r.get('ExcludeFromVendor?'),
        'v1': r.get('FirstValue', 0), 'type2': en(r.get('SecondItemType')), 'v2': r.get('SecondValue', 0),
        'resource': en(r.get('BuildResource')),
        'skillbook': sb.get('NameToLearn') if r.get('IsSkillBook') else None,
        'skillType': en(sb.get('ApplySkillTo')) if r.get('IsSkillBook') else None,
        'inside': {'id': rowref(inside), 'n': inside.get('Amount', 0)} if rowref(inside) not in (None, 'Empty') else None,
        'cap': r.get('RandCapacity'),
        'att': {kk: [x.get('RowName') if isinstance(x, dict) else x for x in v] for kk, v in att.items() if v} if isinstance(att, dict) else {},
        'fertilizer': r.get('UseAsFertilizer?'),
        'icon': r.get('Icon'),
    }
print('items', len(items))

# ---------- loot tables ----------
loot = {}
for f in files:
    m = re.match(r'HumanitZ/Content/TSS_Game/Data/(INV_[^/]+)\.uasset$', f)
    if not m: continue
    name = m.group(1)
    try:
        kk = load(p, f[:-7]); _, lr = kk.datatable()
    except Exception as ex:
        print('loot fail', name, ex); continue
    entries = []
    for rid, r in lr.items():
        if rid in ('Empty', 'None'): continue
        ch = r.get('ChanceToSpawn', 0)
        entries.append([rid, ch])
        if rid not in items:
            items[rid] = {'id': rid, 'name': txt(r.get('Name')), 'desc': txt(r.get('Desc')), 'type': en(r.get('Type')),
                          'sub': en(r.get('SpecificType')), 'chance': ch, 'weight': r.get('Weight', 0),
                          'icon': r.get('Icon'), 'onlyLoot': True}
    loot[name] = entries
print('loot tables', len(loot))

# ---------- crafting ----------
k = load(p, C + 'TSS_Game/Data/Localization/DT_CraftingData')
_, rows = k.datatable()
recipes = []
for rid, r in rows.items():
    out = rowref(r.get('CraftedIItem'))
    if rid == 'NewRow' or not out or out == 'Empty': continue
    also = [rowref(x) for x in (r.get('AlsoGiveArr') or [])]
    if rowref(r.get('AlsoGiveItem')) not in (None, 'Empty'): also.insert(0, rowref(r.get('AlsoGiveItem')))
    recipes.append({
        'id': rid, 'name': txt(r.get('RecipeName')), 'station': en(r.get('CraftingStation')),
        'out': out, 'n': r['CraftedIItem'].get('Amount', 1),
        'also': [a for a in also if a and a != 'Empty'],
        'req': [[rowref(x), x.get('Amount', 1)] for x in r.get('RequiredItems', []) if rowref(x)],
        'any': r.get('UseAny?'), 'time': r.get('CraftTime'), 'prof': en(r.get('Profession')),
        'needsRecipe': r.get('RequiresRecipe'), 'hidden': r.get('Hidden?'),
    })
print('recipes', len(recipes))

# ---------- buildings ----------
k = load(p, C + 'BuildingSystem/Blueprints/Data/DT_Buildings')
_, rows = k.datatable()
buildings = []
for rid, r in rows.items():
    if not r.get('ShowInBuildMenu', True): continue
    buildings.append({
        'id': rid, 'name': txt(r.get('BuildingName')), 'desc': txt(r.get('Description')),
        'cat': en(r.get('Category')),
        'req': [[en(x.get('ResourceType')), x.get('Amount')] for x in r.get('RequiredResources', [])],
        'hp': r.get('FinishedBuildingHealth'), 'icon': icon(r.get('BuildImage')),
        'tool': r.get('RequiresBuildTool'),
    })
print('buildings', len(buildings))

# ---------- ammo ----------
k = load(p, C + 'TSS_Game/Blueprints/Weapons/Base/DT_AmmoDamage')
_, ammo = k.datatable()

# ---------- icons for items ----------
for i, it in enumerate(items.values()):
    it['icon'] = icon(it.get('icon'))
    if i % 100 == 0: print('icons', i)

data = {'items': items, 'loot': loot, 'recipes': recipes, 'buildings': buildings, 'ammo': ammo}
with open(os.path.join(OUT, 'js', 'data.js'), 'w', encoding='utf-8') as fh:
    fh.write('// Gerado automaticamente a partir dos arquivos do jogo (DT_ItemDatabase, INV_*, DT_CraftingData, DT_Buildings)\n')
    fh.write('window.HZ_DATA = ')
    json.dump(data, fh, ensure_ascii=False, separators=(',', ':'))
    fh.write(';\n')
print('done')

# veículos (gera js/vehicles.js)
import runpy, os as _os
runpy.run_path(_os.path.join(_os.path.dirname(_os.path.abspath(__file__)), 'extract_vehicles.py'), run_name='__main__')
