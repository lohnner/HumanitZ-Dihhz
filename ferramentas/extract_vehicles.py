import json, os, re
from pak import Pak
from extra import load, read_enum, read_locres
from tex import load_icon

OUT = r"C:\Users\rodri\OneDrive\Documentos\HumanitZ"
ICONS = os.path.join(OUT, 'img', 'icons')
C = 'HumanitZ/Content/'
VDIR = C + 'TSS_Game/Blueprints/Vehicles/Possession/Blueprints/DrivableVehicles/'
SKIP = {'BP_CarMaster', 'BP_PassengerPawn'}

p = Pak()
loc = {lang: read_locres(p.read(f'{C}Localization/Game/{lang}/Game.locres')) for lang in ('pt-BR', 'en')}

def txt(t):
    if not t: return {'en': '', 'pt': ''}
    if isinstance(t, str): return {'en': t, 'pt': t}
    k = (t.get('ns', ''), t.get('key', ''))
    en = loc['en'].get(k, t.get('src', '')); pt = loc['pt-BR'].get(k, en)
    return {'en': en, 'pt': pt}

def bpname(path):
    return path.split('/')[-1].split('.')[0] if path and path != 'None' else None

enums = read_enum(p, VDIR + 'Upgrades/Data/E_CarUpgradeTypes')
for f in p.files:
    if f.endswith('/E_CarComponents.uasset'): enums.update(read_enum(p, f[:-7]))

# ---------- leitura de cada blueprint de veículo ----------
bps = sorted(f[len(VDIR):-7] for f in p.files
             if f.startswith(VDIR) and f.endswith('.uasset') and '/' not in f[len(VDIR):] and f.split('/')[-1].startswith('BP_'))
raw = {}
for name in bps + ['BP_CarMaster']:
    k = load(p, VDIR + name)
    parent = None
    for e in k.exports:
        if k.ref(e['cls']) == 'BlueprintGeneratedClass' and e['sup']:
            sup = (k.ref(e['sup']) or '')[:-2]
            parent = sup if sup in bps + ['BP_CarMaster'] and sup != name else None
    parts = {'cdo': {}, 'move': {}, 'storage': {}, 'comp': {}}
    for i, e in enumerate(k.exports):
        cls = k.ref(e['cls']) or ''
        key = ('cdo' if e['name'].startswith('Default__') else
               'move' if 'VehicleMovement' in cls else
               'storage' if cls == 'BP_VehicleStorage_C' else
               'comp' if cls == 'BP_CarComp_C' else None)
        if not key: continue
        try:
            pr, _ = k.export_props(i)
            parts[key].update(pr)
        except Exception as ex:
            print('fail', name, e['name'], ex)
    raw[name] = {'parent': parent, **parts}

def merged(name, part):
    chain = []
    n = name
    while n:
        chain.append(n); n = raw[n]['parent'] if n in raw else None
    out = {}
    for n in reversed(chain):
        for kk, v in raw[n][part].items():
            if isinstance(v, dict) and isinstance(out.get(kk), dict):
                out[kk] = {**out[kk], **v}
            else:
                out[kk] = v
    return out, chain

# ---------- spawners ----------
spawners = {}
for b, label in [('BP_CarSpawner_Common', 'Comum'), ('BP_CarSpawner_UnCommon', 'Incomum'),
                 ('BP_CarSpawner_NewMix', 'Mix novo'), ('BP_KaiCarSpawner', 'Único (raro)')]:
    k = load(p, C + 'TSS_Game/' + b)
    cdo = next(i for i, e in enumerate(k.exports) if e['name'].startswith('Default__'))
    pr, _ = k.export_props(cdo)
    cars = [bpname(c) for c in pr.get('CarList', [])]
    spawners[b] = {'label': label, 'chance': pr.get('SpawnChance', 0), 'cars': cars}

# ---------- nomes oficiais (DT_VehicleSpawn) ----------
k = load(p, C + 'TSS_Game/Data/DT_VehicleSpawn'); _, vs = k.datatable()
spawnNames = {bpname(r.get('Vehicle')): (rid, txt(r.get('VehicleName'))) for rid, r in vs.items()}

# ---------- upgrades ----------
k = load(p, VDIR + 'Upgrades/Data/DT_CarUpgrades'); _, ups = k.datatable()
UP_ICON = {'Front': 'HZ_CarBumperL', 'Back': 'HZ_CarRearL', 'WindowL': 'HZ_CarLeftL', 'WindowR': 'HZ_CarRightL',
           'WindowFront': 'HZ_CarWindowL', 'Storage': 'HZ_CarStorage', 'Tires': 'HZ_CarWheels'}
def up_icon(rid, typ, lvl):
    if rid == 'CarTire': base = 'HZ_Tire'
    elif rid == 'BadCarTire': base = 'HZ_TireBad'
    elif typ in ('Storage', 'Tires') or rid.startswith('CarUpgradeWheels'):
        base = ('HZ_CarStorage' if typ == 'Storage' else 'HZ_CarWheels') + ('' if lvl == 1 else ('L%d' % lvl if typ != 'Storage' else str(lvl)))
    else: base = UP_ICON.get(typ, '') + str(lvl)
    path = C + 'TSS_Game/Art/Icons/Icons2025/' + base
    if path + '.uasset' not in p.files: return None
    fn = base + '.webp'
    if not os.path.exists(os.path.join(ICONS, fn)):
        img, _ = load_icon(p, path, 128)
        if img.size[0] > 128: img = img.resize((128, 128 * img.size[1] // img.size[0]))
        img.save(os.path.join(ICONS, fn), 'WEBP', quality=85, method=6)
    return 'img/icons/' + fn

upgrades = []
carUps = {}
for rid, r in ups.items():
    typ = enums.get(r.get('Type'), r.get('Type'))
    cars = sorted({bpname(c.get('Car')) for pc in r.get('PerCarUpgrades', []) for c in pc.get('Cars', [])})
    u = {'id': rid, 'type': typ, 'level': r.get('Level'), 'health': r.get('Health'),
         'minutes': r.get('CraftTimeMinutes'), 'toolDur': r.get('ToolInHandDurLost'),
         'cost': [[(c.get('Item') or {}).get('RowName'), c.get('Amount')] for c in r.get('CraftCost', [])],
         'icon': up_icon(rid, typ, r.get('Level') or 1), 'cars': cars}
    upgrades.append(u)
    for c in cars: carUps.setdefault(c, []).append(rid)

# ---------- tipo de carroceria (para a silhueta) ----------
def body(name, disp):
    s = (name + ' ' + disp).lower()
    for key, b in [('rhino', 'military'), ('gaz', 'military'), ('apc', 'military'), ('army', 'military'),
                   ('camper', 'camper'), ('boxvan', 'truck'), ('truck', 'truck'), ('pickup', 'pickup'),
                   ('van', 'van'), ('sport', 'sport'), ('rally', 'sport'), ('levy', 'sport'),
                   ('jeep', 'jeep'), ('suv', 'suv'), ('amero', 'suv'), ('augh', 'suv'),
                   ('hatch', 'hatch'), ('sedan', 'sedan')]:
        if key in s: return b
    return 'sedan'

vehicles = []
for name in bps:
    if name in SKIP: continue
    cdo, chain = merged(name, 'cdo')
    if 'VehicleName' not in cdo and 'MaxFuel' not in cdo: continue
    move, _ = merged(name, 'move')
    st, _ = merged(name, 'storage')
    comp, _ = merged(name, 'comp')
    sid, sname = spawnNames.get(name, (None, None))
    display = (sname and sname['en']) or txt(st.get('ContainerName'))['en'] or cdo.get('VehicleName') or name
    nm = sname if sname and sname['en'] else {'en': cdo.get('VehicleName') or display, 'pt': cdo.get('VehicleName') or display}
    diff = (move.get('DifferentialSetup') or {}).get('DifferentialType', '').split('::')[-1]
    sp = []
    for sk, s in spawners.items():
        n = s['cars'].count(name)
        if n: sp.append({'spawner': sk, 'label': s['label'], 'chance': s['chance'], 'share': n / len(s['cars']) * 100,
                         'eff': s['chance'] * n / len(s['cars'])})
    vehicles.append({
        'id': name, 'spawnId': sid, 'name': nm, 'title': cdo.get('VehicleName'),
        'parent': raw[name]['parent'] if raw[name]['parent'] != 'BP_CarMaster' else None,
        'body': body(name, str(cdo.get('VehicleName', ''))),
        'fuel': cdo.get('MaxFuel'), 'drain': cdo.get('FuelDrainFactor'), 'hp': cdo.get('HealthMax'),
        'seats': cdo.get('AvailableSeats'), 'noise': cdo.get('Engine Noise Max Range'),
        'slots': st.get('Slots'), 'weaponSlots': st.get('WeaponSlots'),
        'mass': move.get('Mass'), 'rpm': (move.get('EngineSetup') or {}).get('MaxRPM'), 'drive': diff,
        'split': (move.get('DifferentialSetup') or {}).get('FrontRearSplit'),
        'parts': [{'part': enums.get(c.get('Component'), c.get('Component')), 'item': (c.get('ItemToAdd') or {}).get('RowName'),
                   'chance': c.get('Chance0-100'), 'dur': c.get('RandomDurability')} for c in comp.get('SpawnComponents', [])],
        'wear': {kk.replace('DurabilityLossOvertime', ''): v for kk, v in comp.items() if kk.endswith('DurabilityLossOvertime')},
        'spawns': sp, 'upgrades': carUps.get(name, []),
    })
    print(name, '|', nm['en'], '| fuel', cdo.get('MaxFuel'), '| hp', cdo.get('HealthMax'), '| slots', st.get('Slots'),
          '| mass', move.get('Mass'), '| rpm', (move.get('EngineSetup') or {}).get('MaxRPM'), diff, '| seats', cdo.get('AvailableSeats'))

with open(os.path.join(OUT, 'js', 'vehicles.js'), 'w', encoding='utf-8') as fh:
    fh.write('// Gerado automaticamente a partir dos blueprints de veículos, DT_VehicleSpawn, DT_CarUpgrades e spawners\n')
    fh.write('window.HZ_DATA.vehicles = ')
    json.dump(vehicles, fh, ensure_ascii=False, separators=(',', ':'))
    fh.write(';\nwindow.HZ_DATA.vehicleUpgrades = ')
    json.dump(upgrades, fh, ensure_ascii=False, separators=(',', ':'))
    fh.write(';\nwindow.HZ_DATA.carSpawners = ')
    json.dump(spawners, fh, ensure_ascii=False, separators=(',', ':'))
    fh.write(';\n')
print('vehicles', len(vehicles), 'upgrades', len(upgrades))
