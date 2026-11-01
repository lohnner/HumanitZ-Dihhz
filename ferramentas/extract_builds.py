"""Profissões, aflições e árvores de skills atuais (UI_HMZ_Skill_*) -> js/builds.js + img/skills/*.webp"""
import json, os, re
from pak import Pak
from extra import load, read_locres
from tex import load_icon

OUT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(OUT, 'img', 'skills')
os.makedirs(IMG, exist_ok=True)
p = Pak()
C = 'HumanitZ/Content/'
T = C + 'TSS_Game/Blueprints/HMZSkillSystem/Trees/'
TREES = [('Melee', 'UI_HMZ_Skill_Melee'), ('Firearm', 'UI_HMZ_Skill_Firearm'), ('Bows', 'UI_HMZ_Skill_Bows'), ('Explosive', 'UI_HMZ_Skill_ExplosiveNTraps'),
         ('Crafting', 'UI_HMZ_Skill_CraftingBuilding'), ('Health', 'UI_HMZ_Skill_Health'), ('Hunting', 'UI_HMZ_Skill_Hunting'), ('Movement', 'UI_HMZ_Skill_Movement')]
# linha de DT_Professions -> árvore da profissão
PROF_TREE = {'Unemployed': 'Unemployed', 'Mechanic': 'Mechanic', 'Boxer': 'Boxer', 'Farmer': 'Farmer', 'CarSalesman': 'CarSalesman', 'OutDoorsMan': 'Outdoorsman',
             'Chemist': 'Chemist', 'EMT': 'EMT', 'Thief': 'Thief', 'FireFighter': 'FireFighter', 'ElectricalEngineer': 'ElectricalEngineer', 'MilitaryVet': 'MilitaryVet'}

loc = {lang: read_locres(p.read(f'{C}Localization/Game/{lang}/Game.locres')) for lang in ('pt-BR', 'en')}
def txt(t):
    if not t: return {'en': '', 'pt': ''}
    if isinstance(t, str): return {'en': t, 'pt': t}
    if 'src' not in t: return {'en': '', 'pt': ''}
    k = (t['ns'], t['key'])
    en = loc['en'].get(k, t['src']); pt = loc['pt-BR'].get(k, en)
    return {'en': en.replace('\r', '').strip(), 'pt': pt.replace('\r', '').strip()}

textures = {}
for f in p.files:
    if f.startswith(C) and f.endswith('.uasset'): textures.setdefault(f.split('/')[-1][:-7], f[:-7])
def icon(name):
    """Salva a textura (referência só pelo nome) como .webp pequeno"""
    if not name or name not in textures: return None
    target = os.path.join(IMG, name + '.webp')
    if not os.path.exists(target):
        try:
            img, _ = load_icon(p, textures[name], 64)
        except Exception as ex:
            print('icone falhou', name, ex); return None
        if img.size[0] > 64: img = img.resize((64, 64 * img.size[1] // img.size[0]))
        img.save(target, 'WEBP', quality=85, method=6)
    return 'img/skills/' + name + '.webp'

def key_is_prof(key): return key in PROF_TREE.values()

def read_tree(key, path):
    k = load(p, path)
    skills, texts = [], []
    for i, e in enumerate(k.exports):
        cls = k.ref(e['cls'])
        if cls == 'UI_HMZ_Skill_C':
            pr = k.export_props(i)[0]
            skills.append({
                'id': key + '.' + pr['UniqueName'].replace('Skill_', ''), 'name': txt(pr.get('Name')), 'desc': txt(pr.get('Description')),
                'cost': pr.get('Cost', 1), 'lv': pr.get('RequiredLevel', 1), 'icon': icon(pr.get('SkillImage')),
                'root': bool(pr.get('Enabled?', True)) and not key_is_prof(key), 'ult': bool(pr.get('IsUltimate?')),
            })
        elif cls == 'TextBlock':
            t = txt(k.export_props(i)[0].get('Text'))
            if t['en']: texts.append(t)
    skills.sort(key=lambda s: (s['lv'], s['cost'], s['name']['pt']))
    return skills, texts

NOISE = re.compile(r'^(\d+/\d+|locked|unlocked by.*|skill points?.*|\W*)$', re.I)
def tree_info(key, path):
    skills, texts = read_tree(key, path)
    passive = next((t for t in texts if re.match(r'passive', t['en'], re.I)), None)
    is_title = lambda t: t['en'].isupper() or re.fullmatch(r'fire ?arms?', t['en'], re.I)
    goals = [t for t in texts if t is not passive and not NOISE.match(t['en']) and not is_title(t)]
    title = next((t for t in texts if is_title(t) and not NOISE.match(t['en'])), {'en': key, 'pt': key})
    return {'id': key, 'name': title, 'skills': skills, 'goals': goals,
            **({'passive': {l: re.sub(r'^[^:]+:\s*', '', v) for l, v in passive.items()}} if passive else {})}

trees = [tree_info(key, T + name) for key, name in TREES]
by_en = {}
def name_key(s): return re.sub(r'[^a-z0-9]', '', s.lower())
for t in trees:
    for s in t['skills']: by_en.setdefault(name_key(s['name']['en']), s['id'])

_, rows = load(p, C + 'Coredamage/Data/DT_Professions').datatable()
profs = []
for rid, r in rows.items():
    t = tree_info(PROF_TREE[rid], T + 'Professions/UI_HMZ_Skill_' + PROF_TREE[rid])
    for s in t['skills']: by_en.setdefault(name_key(s['name']['en']), s['id'])
    start =[txt(x) for x in r.get('UnlockedSkillNames') or []]
    profs.append({'id': rid, 'name': txt(r.get('Name')), 'desc': txt(r.get('Description')), 'passive': t.get('passive') or txt(r.get('Passive')),
                  'start': start, 'skills': t['skills'], 'goals': t['goals']})
for pf in profs:
    pf['startIds'] = [by_en.get(name_key(s['en'])) for s in pf['start']]

_, rows = load(p, C + 'Coredamage/Data/DT_Affliction').datatable()
afflictions = [{'id': rid, 'name': txt(r.get('Name')), 'desc': txt(r.get('Description')), 'icon': icon(r.get('Image'))}
               for rid, r in rows.items() if rid not in ('NoAffliction', 'Random')]

with open(os.path.join(OUT, 'js', 'builds.js'), 'w', encoding='utf-8', newline='\n') as fh:
    fh.write('// Gerado automaticamente: profissões, aflições e árvores de skills (DT_Professions, DT_Affliction, UI_HMZ_Skill_*)\n')
    fh.write('window.HZ_DATA.builds = ')
    json.dump({'trees': trees, 'profs': profs, 'afflictions': afflictions}, fh, ensure_ascii=False, separators=(',', ':'))
    fh.write(';\n')
print('arvores', [(t['id'], t['name']['pt'], len(t['skills'])) for t in trees])
print('skills', sum(len(t['skills']) for t in trees), '+', sum(len(pf['skills']) for pf in profs), 'aflicoes', len(afflictions))
print('sem icone', [s['id'] for t in trees for s in t['skills'] if not s['icon']] + [s['id'] for pf in profs for s in pf['skills'] if not s['icon']], [a['id'] for a in afflictions if not a['icon']])
print('raizes', [(s['id'], s['cost'], s['lv']) for t in trees for s in t['skills'] if s['root']])
for t in trees[:2]: print(t['id'], 'goals', [g['pt'] for g in t['goals']])
for pf in profs: print(pf['id'], '|', pf['passive']['pt'], '|', pf['start'] and [s['en'] for s in pf['start']], pf['startIds'], '|', [g['pt'] for g in pf['goals']][:5], [(s['id'], s['cost'], s['lv']) for s in pf['skills']][:2])
print('niveis', sorted({s['lv'] for t in trees for s in t['skills']} | {s['lv'] for pf in profs for s in pf['skills']}))
