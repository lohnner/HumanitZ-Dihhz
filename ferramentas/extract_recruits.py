"""Recrutas, traços e tarefas da comunidade (DT_Recruit*, DT_TaskConfig, BP_Recruit_NPC_*) -> js/recruits.js + img/recruits/*.webp"""
import json, os, re
from pak import Pak
from extra import load, read_locres
from tex import load_icon

OUT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(OUT, 'img', 'recruits')
os.makedirs(IMG, exist_ok=True)
p = Pak()
C = 'HumanitZ/Content/'
R = C + 'TSS_Game/KaiAIMapTest/KaiHumanAI/Quest/QuestPreset/Random/Recruit/Data/'
# Estados internos do NPC, não são tarefas que o jogador escolhe
SKIP_TASKS = {'NoTask', 'CampReturn', 'LeaveCamp', 'ChangeCamp'}

loc = {lang: read_locres(p.read(f'{C}Localization/Game/{lang}/Game.locres')) for lang in ('pt-BR', 'en')}
def txt(t):
    if not t: return {'en': '', 'pt': ''}
    if isinstance(t, str): return {'en': t, 'pt': t}
    if 'src' not in t: return {'en': '', 'pt': ''}
    k = (t['ns'], t['key'])
    en = loc['en'].get(k, t['src']); pt = loc['pt-BR'].get(k, en)
    return {'en': en.replace('\r', '').strip(), 'pt': pt.replace('\r', '').strip()}

def icon(path, size=64):
    """path = /Game/.../Nome.Nome"""
    if not path or path == 'None': return None
    name = path.split('.')[-1]
    base = C + path.split('.')[0][len('/Game/'):]
    target = os.path.join(IMG, name + '.webp')
    if not os.path.exists(target):
        try:
            img, _ = load_icon(p, base, size)
        except Exception as ex:
            print('icone falhou', name, ex); return None
        if img.size[0] > size: img = img.resize((size, size * img.size[1] // img.size[0]))
        img.save(target, 'WEBP', quality=85, method=6)
    return 'img/recruits/' + name + '.webp'

def table(name): return load(p, R + name).datatable()[1]
def tail(v): return str(v).split('::')[-1] if v else None
def num(d):
    return {k: v for k, v in (d or {}).items() if isinstance(v, (int, float)) and not isinstance(v, bool)}

_, items = load(p, C + 'TSS_Game/Data/Localization/DT_ItemDatabase').datatable()
ITEM = {i.lower(): i for i in items if i not in ('Empty', 'None')}
def item(i): return ITEM.get(str(i).lower())
def handle(x): return item(((x or {}).get('ItemHandle') or {}).get('RowName'))

# ---------- traços ----------
def traits(name, kind):
    rows = table(name)
    out = []
    for rid, r in rows.items():
        out.append({'id': rid, 'kind': kind, 'name': txt(r.get('TraitName')), 'desc': txt(r.get('Description')), 'tier': tail(r.get('Tier')), 'icon': icon(r.get('Icon')),
                    'effects': num(r.get('Effects')), 'unlocks': [tail(u) for u in r.get('Unlocks') or []],
                    'no': [str(x) for x in (r.get('IncompatibleTraits') or []) + (r.get('IncompatiblePositiveTraits') or []) + (r.get('IncompatibleNegativeTraits') or [])]})
    return out
trait_list = traits('DT_Recruit_PositiveTraits', 'good') + traits('DT_Recruit_NegativeTraits', 'bad')

# ---------- tarefas ----------
tasks = []
for rid, r in table('DT_TaskConfig').items():
    if rid in SKIP_TASKS: continue
    groups = []
    for g in r.get('RequiredItems') or []:
        its = [handle(x) for x in g.get('RequiredItems') or [] if handle(x)]
        if its: groups.append({'any': bool(g.get('bRequireAny')), 'items': its})
    # O Saque só tem no nível 1 uma lista de teste (maçã, munição e AK47); os outros níveis vêm vazios
    raw_rewards = [] if tail(r.get('Type')) == 'Scavenge' else r.get('ItemRewards') or []
    rewards = [[handle(x), *(x.get('QuantityRange') or [1, 1]), x.get('Chance', 100)] for x in raw_rewards if handle(x)]
    tasks.append({'id': rid, 'name': txt(r.get('TaskName')), 'type': tail(r.get('Type')), 'tier': int(tail(r.get('TaskTier'))[-1]), 'danger': tail(r.get('DangerLevel')),
                  'chance': r.get('SuccessChance'), 'first': r.get('InitialDurationMinutes'), 'base': r.get('BaseDurationMinutes'), 'cont': bool(r.get('bIsContinousTask')),
                  'needs': txt(r.get('RequiredItemsDescription')), 'req': groups, 'rewards': rewards, 'max': r.get('MaxItemsRewarded'),
                  'recipes': [item(x) or str(x) for x in r.get('LimitedRecipeList') or []], 'perSec': num(r.get('StatEffects_PerSec')),
                  'icon': icon(r.get('Icon'))})

# ---------- recrutas ----------
ui = table('DT_RecruitUIConfig')
people = {}
for f in sorted(p.files):
    m = re.search(r'/BP_Recruit_NPC_([^/]+)\.uasset$', f)
    if not m: continue
    k = load(p, f[:-7])
    pr = {}
    for i, e in enumerate(k.exports):
        if e['name'].startswith('Default__'): pr = k.export_props(i)[0]
    name = (pr.get('RandomMaleNames') or [m.group(1)])[0]
    u = ui.get(pr.get('PortraitID')) or {}
    # duas classes podem ser a mesma pessoa (BP_Recruit_NPC_Ed é o Magnus)
    e = people.setdefault(name, {'name': name, 'female': bool(pr.get('IsFemale')), 'portrait': icon(u.get('Portrait'), 128), 'classes': []})
    e['classes'].append(m.group(1))

cfg = table('DT_RecruitConfig')['NPC_Default']
config = {'morale': cfg.get('RandMoraleRange'), 'hunger': cfg.get('RandHungerRange'), 'thirst': cfg.get('RandThirstRange'), 'sleep': cfg.get('RandSleepRange'),
          'infection': cfg.get('InfectionChance'), 'infectionRange': cfg.get('RandInfectionRange'), 'level': cfg.get('RandLevelRange'),
          'good': cfg.get('MaxPositiveTraits'), 'bad': cfg.get('MaxNegativeTraits'), 'tasks': cfg.get('MinMaxTasks'), 'possible': [tail(k) for k in cfg.get('PossibleTasks') or {}]}

with open(os.path.join(OUT, 'js', 'recruits.js'), 'w', encoding='utf-8', newline='\n') as fh:
    fh.write('// Gerado automaticamente: recrutas, traços e tarefas (DT_Recruit*, DT_TaskConfig, BP_Recruit_NPC_*)\n')
    fh.write('window.HZ_DATA.recruits = ')
    json.dump({'people': sorted(people.values(), key=lambda x: x['name']), 'traits': trait_list, 'tasks': tasks, 'config': config}, fh, ensure_ascii=False, separators=(',', ':'))
    fh.write(';\n')
print('pessoas', len(people), 'duplas', [e['name'] + str(e['classes']) for e in people.values() if len(e['classes']) > 1], 'sem retrato', [e['name'] for e in people.values() if not e['portrait']])
print('tracos', len(trait_list), 'sem icone', [t['id'] for t in trait_list if not t['icon']])
print('tiers', sorted({(t['kind'], t['tier']) for t in trait_list}))
print('unlocks', [(t['id'], t['tier'], t['unlocks'], t['effects']) for t in trait_list if t['unlocks']][:14])
print('tier2', [(t['id'], t['name']['pt'], t['effects'], t['no']) for t in trait_list if t['tier'] != 'Tier1'])
print('tarefas', len(tasks), sorted({t['type'] for t in tasks}), 'sem icone', [t['id'] for t in tasks if not t['icon']])
print('req', [(t['id'], t['req']) for t in tasks if t['id'] in ('Hunt', 'Fish', 'Build')])
print('rw', [(t['id'], t['rewards'][:4], len(t['rewards'])) for t in tasks if t['id'] in ('Scavenge', 'Mining', 'MasterMiner')])
print('needs vazio', [t['id'] for t in tasks if not t['needs']['en']])
print('possible', config['possible'], 'tipos fora', sorted({t['type'] for t in tasks} - set(config['possible'])))
