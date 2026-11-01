"""Plantações (DT_CropData), canteiros, armadilhas e reparos (DT_RepairData) -> js/survival.js"""
import json, os, re
from pak import Pak
from extra import load, read_enum, read_locres

OUT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
p = Pak()
C = 'HumanitZ/Content/'
SEASON_PT = {'Spring': 'Primavera', 'Summer': 'Verão', 'Autumn': 'Outono', 'Winter': 'Inverno'}
PLOTS = ['BP_IActor_FarmPlot', 'BP_IActor_CropBed', 'BP_IActor_CropPlot']

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
    """Propriedades herdadas (o filho sobrescreve) e a linhagem"""
    key = bp.lower()
    if key in cache: return cache[key]
    if key not in files: return {}, []
    k = load(p, files[key])
    own, parent = {}, None
    for i, e in enumerate(k.exports):
        if e['name'].startswith('Default__'): own = k.export_props(i)[0]
        elif (k.ref(e['cls']) or '').endswith('GeneratedClass'): parent = k.ref(e['sup'])
    base, lin = chain(parent[:-2]) if parent and parent.endswith('_C') else ({}, [])
    cache[key] = ({**base, **own}, lin + [bp])
    return cache[key]

_, item_rows = load(p, files['dt_itemdatabase']).datatable()
ITEM = {i.lower(): i for i in item_rows if i not in ('Empty', 'None')}
def item(i): return ITEM.get(str(i).lower())
_, buildings = load(p, files['dt_buildings']).datatable()
resources = read_enum(p, files['e_resourcetype'])

# ---------- plantações ----------
seasons = read_enum(p, files['uds_season'])   # atenção: nesse enum 0 = verão, 1 = outono, 2 = inverno, 3 = primavera
_, crops_raw = load(p, files['dt_cropdata']).datatable()
crops = []
for rid, r in crops_raw.items():
    crops.append({'seed': item(rid), 'out': item(r.get('HarvestResult')), 'n': r.get('Count'), 'days': r.get('GrowthTimeDays'), 'stages': len(r.get('Stages') or []),
                  'seasons': [SEASON_PT[seasons[s]] for s in r.get('GrowSeasons') or []]})

plots = []
for bp in PLOTS:
    pr, _ = chain(bp)
    slots = [{'name': txt(s.get('SlotName')), 'items': [item(i) or str(i) for i in s.get('SupportedItems') or []]} for s in pr.get('Slots') or []]
    plots.append({'id': pr.get('BuildDTRowName'), 'name': txt(pr.get('ActorName')), 'seeds': pr.get('MaxSeed'), 'slots': slots, 'progress': txt(pr.get('ProgressName'))})

# ---------- armadilhas ----------
traps = []
seen = set()
for key, path in sorted(files.items()):
    if not re.search(r'/(BuildingSystem/Blueprints/Buildings/Traps/TrapTypes/.+/|KaiWorldEffects/InteractActor/Child/Traps/)BP_[^/]+$', path) and 'BP_DoorMeleeTrap' not in path: continue
    bp = path.split('/')[-1]
    pr, lin = chain(bp)
    row = pr.get('DT_BuildingName') or pr.get('BuildDTRowName')
    if not row or row not in buildings or row in seen or row == 'None': continue
    seen.add(row)
    kind = 'kai' if 'BuildDTRowName' in pr else 'build'
    dmg = None
    if 'BP_MasterDoor1AxisTrap' in lin: dmg = pr.get('TrapDamageMelee')
    elif 'BP_MasterWindowTrap' in lin: dmg = pr.get('TrapDamageProjectile')
    elif 'BP_Master_SnapTrap' in lin: dmg = pr.get('TrapDamage') or None
    weapons = [item((x.get('Item') or {}).get('RowName')) for x in pr.get('TrapRequiredWeapon') or []] if lin and any(n in lin for n in ('BP_MasterDoor1AxisTrap', 'BP_MasterWindowTrap')) else []
    need = [item((x.get('Item') or {}).get('RowName')) for x in pr.get('TrapRequiredItems') or []] if 'BP_MasterWindowTrap' in lin else []
    # Nas armadilhas construídas, Slots é só o número de espaços; nas de interação é a lista com a isca
    slots = pr.get('Slots') if isinstance(pr.get('Slots'), list) else []
    bait = [i for s in slots for i in (s.get('SupportedItems') or []) if i != 'NADA'] if pr.get('TrapItem') else []
    br = buildings[row]
    traps.append({'id': row, 'name': txt(br.get('BuildingName')), 'desc': txt(br.get('Description')), 'menu': bool(br.get('ShowInBuildMenu', True)), 'dmg': dmg, 'wear': pr.get('TrapDamagePerUsage') if kind == 'build' else None, 'reset': pr.get('TrapResetDelay'), 'uses': pr.get('TrapTriggerMax'),
                  'lure': (pr.get('TrapLureRange') or 0) / 100 or None, 'time': pr.get('TrapTime'), 'catch': item(pr.get('TrapItem')), 'bait': [item(i) or i for i in bait],
                  'weapons': [w for w in weapons if w], 'need': [n for n in need if n], 'explosive': bool(pr.get('TrapActorToSpawn')),
                  'affects': sorted({'zumbis' if 'Zombie' in a else 'jogadores' for a in pr.get('TrapAffectedCharacter') or [] if re.search('Zombie|Player', a)}) if kind == 'build' else []})

_, trap_rows = load(p, files['dt_trapsettings']).datatable()
trap_weapons = [{'id': item((r.get('ItemReference') or {}).get('RowName')), 'ammo': item((r.get('RequiredAmmo') or {}).get('RowName'))} for r in trap_rows.values()]

# ---------- reparos ----------
by_prefab = {str(r.get('BuildingPrefab')).split('.')[-1]: rid for rid, r in buildings.items()}
_, repair_rows = load(p, files['dt_repairdata']).datatable()
repairs, unmatched = {}, []
for rid, r in repair_rows.items():
    target = by_prefab.get(r.get('Building')) or (rid if rid in buildings else None)
    if not target: unmatched.append((rid, r.get('Building'))); continue
    extra = [[resources.get(x.get('ResourceType') or x.get('Resource'), '?'), x.get('Amount', 1)] for x in r.get('Extra') or []]
    repairs[target] = {'res': resources.get(r.get('Resource')), 'n': r.get('Amount', 1), 'hp': r.get('HealthToAdd'), 'extra': extra}

with open(os.path.join(OUT, 'js', 'survival.js'), 'w', encoding='utf-8', newline='\n') as fh:
    fh.write('// Gerado automaticamente: plantações, canteiros, armadilhas e reparos (DT_CropData, DT_RepairData, DT_TrapSettings, blueprints)\n')
    fh.write('window.HZ_DATA.survival = ')
    json.dump({'crops': crops, 'plots': plots, 'traps': traps, 'trapWeapons': trap_weapons, 'repairs': repairs}, fh, ensure_ascii=False, separators=(',', ':'))
    fh.write(';\n')
print('crops', [(c['seed'], c['out'], c['days'], c['seasons'], c['n']) for c in crops])
print('plots', [(x['id'], x['name']['pt'], x['seeds'], [(s['name']['pt'], s['items'][:7]) for s in x['slots']], x['progress']['pt']) for x in plots])
print('traps', len(traps))
for t in traps: print(' ', t['id'], {a: t[a] for a in ('dmg', 'wear', 'reset', 'uses', 'lure', 'time', 'catch', 'bait', 'weapons', 'need', 'explosive', 'affects') if t[a]})
print('menu Traps sem dados', [rid for rid, r in buildings.items() if r.get('ShowInBuildMenu', True) and 'Trap' in rid and rid not in seen])
print('armas', trap_weapons)
print('reparos', len(repairs), 'sem par', unmatched, 'extra', {k: v['extra'] for k, v in repairs.items() if v['extra']}, 'res None', [k for k, v in repairs.items() if not v['res']])
