"""Cavalos, reboque, helicópteros, aviões e máquinas -> js/others.js + img/vehicles/*.webp"""
import json, os, time
from pak import Pak
from extra import load, read_locres
from build_vehicles import build_actor, IMG, OUT

p = Pak()
C = 'HumanitZ/Content/'
loc = read_locres(p.read(C + 'Localization/Game/pt-BR/Game.locres'))

def cdo(path):
    k = load(p, path)
    for i, e in enumerate(k.exports):
        if e['name'].startswith('Default__'):
            return k.export_props(i)[0]
    return {}

def chain_props(paths):
    out = {}
    for pth in paths: out.update(cdo(pth))
    return out

def save_img(key, path, **kw):
    t = time.time()
    try:
        img = build_actor(path, **kw)
    except Exception as ex:
        print('  render falhou', key, ex); return None
    if not img: return None
    img.save(os.path.join(IMG, key + '.webp'), 'WEBP', quality=88, method=6)
    print('  img', key, img.size, round(time.time() - t, 1), 's', flush=True)
    return 'img/vehicles/' + key + '.webp'

entries = []

# ---------------- cavalos ----------------
H = C + 'TSS_Game/KaiWorldEffects/Horse/'
base = cdo(H + 'BP_Horse')
move = {}
k = load(p, H + 'BP_Horse')
for i, e in enumerate(k.exports):
    if e['name'] == 'CharMoveComp': move = k.export_props(i)[0]
COATS = {'BP_Horse': ('Tordilho escuro', 'Dark grey'), 'BP_Horse_Child': ('Castanho', 'Brown'), 'BP_Horse_Child1': ('Tordilho claro', 'Light grey'),
         'BP_Horse_Child2': ('Tordilho escuro (fôlego extra)', 'Dark grey (extra stamina)'), 'BP_Horse_Child3': ('Palomino', 'Palomino')}
for bp, (pt, en) in COATS.items():
    paths = [H + 'BP_Horse'] + ([H + bp] if bp != 'BP_Horse' else [])
    pr = chain_props(paths)
    entries.append({
        'id': bp, 'cat': 'horse', 'name': {'pt': 'Cavalo ' + pt.split(' (')[0].lower(), 'en': en + ' horse'}, 'variant': pt,
        'hp': pr.get('Health'), 'stamina': pr.get('MaxStamina'), 'walk': pr.get('WalkSpeed'), 'jog': pr.get('JogSpeed'),
        'sprint': pr.get('SprintSpeed'), 'jump': move.get('JumpZVelocity'), 'step': move.get('MaxStepHeight'),
        'heal': pr.get('Setting_HealOverTime'), 'foodLoss': pr.get('Settings_FoodLossOvertime'),
        'starve': pr.get('Settings_NoFoodHealthLoss'), 'food': pr.get('CompatibleFood') or base.get('CompatibleFood'),
        'img': save_img(bp, H + bp, yaw=60, pitch=10),
    })

saddles = []
for n in ['BP_HorseContainer', 'BP_HorseContainer2', 'BP_HorseContainer3', 'BP_HorseContainer4']:
    pr = chain_props([C + 'TSS_Game/Inventory/Container/BP_HorseContainer'] + ([C + 'TSS_Game/Inventory/Container/' + n] if n != 'BP_HorseContainer' else []))
    saddles.append({'item': pr.get('Row Name'), 'slots': pr.get('Slots')})

# ---------------- reboque ----------------
T = C + 'TSS_Game/Blueprints/Vehicles/Trailer/BP_Trailer_Hitchable_TSS'
pr = cdo(T)
entries.append({'id': 'BP_Trailer_Hitchable_TSS', 'cat': 'trailer', 'name': {'pt': 'Reboque', 'en': 'Trailer'},
                'parts': {'Engate (cada trava)': pr.get('Trailer_Latch_HP_Max'), 'Roda (cada)': pr.get('Trailer_Wheel_HP_Max'),
                          'Roda-guia': pr.get('Trailer_JockeyWheel_HP_Max'), 'Manivela da roda-guia': pr.get('Trailer_JockeyHandle_HP_Max')},
                'img': save_img('BP_Trailer_Hitchable_TSS', T)})

# ---------------- helicópteros ----------------
HE = C + 'TSS_Game/KaiWorldEffects/KaiEarDropSys/BP_KaiHelicopter'
k = load(p, HE)
speed = None
for i, e in enumerate(k.exports):
    if 'FloatingPawnMovement' in (k.ref(e['cls']) or ''): speed = k.export_props(i)[0].get('MaxSpeed')
entries.append({'id': 'BP_KaiHelicopter', 'cat': 'air', 'name': {'pt': 'Helicóptero de suprimentos', 'en': 'Supply helicopter'},
                'speed': speed, 'role': 'airdrop', 'loot': 'INV_SupplyDropLoot',
                'img': save_img('BP_KaiHelicopter', HE, skip=('SM_Helicopter_screw_2',))})

ev = {}
for n in ['BP_Node_Event_HeliCrash_Zombie', 'BP_Node_Event_HeliCrash_Human']:
    pr = cdo(C + 'TSS_Game/KaiWorldEffects/NodeSpawner/Events/' + n)
    ev[n] = {'count': pr.get('NumSpawnCount'), 'spawn': {kk.split('::')[-1].replace('E_', ''): v for kk, v in (pr.get('SpawnList') or {}).items() if v}}
crash = C + 'TSS_Game/Blueprints/SecneActors/BP_HeliCrash2'
entries.append({'id': 'BP_HeliCrash2', 'cat': 'air', 'name': {'pt': 'Helicóptero acidentado (evento)', 'en': 'Helicopter crash (event)'},
                'role': 'crash', 'events': ev, 'containers': [['INV_AmmoDatabase', 'Caixa de munição (sorteia 6 vezes)'], ['INV_WeaponCrate', 'Caixote de armas'], ['INV_WeaponCrate', 'Caixote de armas']],
                'img': save_img('BP_HeliCrash2', crash)})

# ---------------- aviões (cenário) ----------------
PLANES = [('airplane_passenger_747/BP_airplane_passenger_747_c', 'Boeing 747 (passageiros)'),
          ('airplane_passenger_a320/BP_airplane_passenger_a320_b', 'Airbus A320 (passageiros)'),
          ('airplane_passenger_bae146/BP_airplane_passenger_bae146_b', 'BAe 146 (passageiros)'),
          ('airplane_privatjet_02/BP_airplane_privatjet_02_c', 'Jato particular'),
          ('airplane_sport_01/BP_airplane_sport_01_b', 'Avião esportivo (monomotor)')]
for path, nm in PLANES:
    key = path.split('/')[-1]
    entries.append({'id': key, 'cat': 'scenery_air', 'name': {'pt': nm, 'en': nm}, 'img': save_img(key, C + 'Airplanes/Blueprints/' + path)})
for i in range(1, 6):
    key = 'BP_Cr_Plane_0%d' % i
    entries.append({'id': key, 'cat': 'scenery_air', 'name': {'pt': 'Avião caído — destroço %d' % i, 'en': 'Crashed airliner %d' % i},
                    'img': save_img(key, C + 'Crashed_Airliner/Blueprints/' + key)})

# ---------------- máquinas (cenário) ----------------
entries.append({'id': 'BP_Tractor_Blueprint', 'cat': 'scenery_ground', 'name': {'pt': 'Trator', 'en': 'Tractor'},
                'img': save_img('BP_Tractor_Blueprint', C + 'Barnyard_Vol3_Barn/Blueprints/BP_Tractor_Blueprint')})
for n, nm in [('BP_Trailer', 'Reboque pequeno (cenário)')]:
    entries.append({'id': n, 'cat': 'scenery_ground', 'name': {'pt': nm, 'en': 'Small trailer (prop)'},
                    'img': save_img(n, C + 'TSS_Game/Blueprints/Vehicles/Trailer/' + n)})

with open(os.path.join(OUT, 'js', 'others.js'), 'w', encoding='utf-8') as fh:
    fh.write('// Gerado automaticamente: cavalos, reboque, helicópteros, aviões e máquinas (blueprints do jogo)\n')
    fh.write('window.HZ_DATA.others = ')
    json.dump(entries, fh, ensure_ascii=False, separators=(',', ':'))
    fh.write(';\nwindow.HZ_DATA.saddles = ')
    json.dump(saddles, fh, ensure_ascii=False, separators=(',', ':'))
    fh.write(';\n')
print('entries', len(entries), 'sem imagem:', [e['id'] for e in entries if not e.get('img')])
