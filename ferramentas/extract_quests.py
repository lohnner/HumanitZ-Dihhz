"""Missões (DAsset_QuestData), quem entrega cada uma (blueprints + DAsset_QuestLod) -> js/quests.js"""
import json, os, re
from pak import Pak
from extra import load, read_locres

OUT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
p = Pak()
C = 'HumanitZ/Content/'
Q_DIR = C + 'TSS_Game/KaiAIMapTest/KaiHumanAI/Quest/'
# Teste, demo e o mapa de tutorial: não fazem parte do jogo normal
SKIP = re.compile(r'^(SELECT QUEST|test|TypeTest|Demo\d+|WeaponChain1|Tutorial.*)$')
OBJ_KIND = {'NewEnumerator0': 'give', 'NewEnumerator1': 'kill', 'NewEnumerator2': 'act', 'NewEnumerator3': 'repair'}
NPC_NAME = {'Base': 'Mark', 'Thaiger2': 'Thaiger', 'Random_NPC': None, 'Random_NPC2': None, 'Random_NPC_Fighter': None, 'PlayerLike': None}

loc = {lang: read_locres(p.read(f'{C}Localization/Game/{lang}/Game.locres')) for lang in ('pt-BR', 'en')}
def txt(t):
    if not t: return {'en': '', 'pt': ''}
    if isinstance(t, str): return {'en': t, 'pt': t}
    if 'src' not in t: return {'en': '', 'pt': ''}
    k = (t['ns'], t['key'])
    en = loc['en'].get(k, t['src']); pt = loc['pt-BR'].get(k, en)
    return {'en': en.replace('\r', '').strip(), 'pt': pt.replace('\r', '').strip()}

# mesmo alinhamento de ferramentas/build_map.py
S = 403200.0
CAL = {'scale': 1.016, 'dx': -45, 'dy': -40}
def uv(x, y):
    return [round(((y + S) / S * 4096 * CAL['scale'] + CAL['dx']) / 4096, 5),
            round(((S - x) / S * 4096 * CAL['scale'] + CAL['dy']) / 4096, 5)]
def pin(kind, xyz, title=None):
    if not xyz or not any(xyz): return None
    u, v = uv(xyz[0], xyz[1])
    if not (-0.02 <= u <= 1.02 and -0.02 <= v <= 1.02): return None
    return {'k': kind, 'u': u, 'v': v, **({'t': title} if title else {})}

_, rows = load(p, C + 'TSS_Game/Data/Localization/DT_ItemDatabase').datatable()
ITEM = {i.lower(): i for i in rows if i not in ('Empty', 'None')}
def item(i): return ITEM.get(str(i).lower())

Q = load(p, Q_DIR + 'Data/DAsset_QuestData').export_props(0)[0]['Quests']

# ---------- quem entrega ----------
files = {}
for f in p.files:
    m = re.search(r'/(BP_HumanQuest_[^/]+)\.uasset$', f)
    if m: files[m.group(1)] = f[:-7]
def npc_name(cls, pr):
    short = cls.replace('BP_HumanQuest_', '')
    if short in NPC_NAME: return NPC_NAME[short]
    name = pr.get('AIName')
    return None if not name or name == 'Talk to NPC' else name

npcs = {}
for cls, f in files.items():
    k = load(p, f)
    for i, e in enumerate(k.exports):
        if e['name'].startswith('Default__'): npcs[cls] = k.export_props(i)[0]

givers, pins = {}, {}
def add_giver(q, name, random=False):
    g = givers.setdefault(q, {})
    if name: g[name] = g.get(name, random) and random
    else: g.setdefault('', random)
placed = load(p, Q_DIR + 'Data/DAsset_QuestLod').export_props(0)[0]['LODData']
for lod in placed:
    cls = lod['Class'].split('.')[-1][:-2]
    pr = npcs.get(cls, {})
    q = lod.get('QuestOverride')
    q = q if q and q != 'None' else pr.get('QuestID')
    if q and q != 'None':
        add_giver(q, npc_name(cls, pr))
        pt = pin('giver', lod['Transform']['Translation'], npc_name(cls, pr))
        if pt: pins.setdefault(q, []).append(pt)
for cls, pr in npcs.items():
    for q in pr.get('RandomQuests') or []:
        if q != 'None': add_giver(q, npc_name(cls, pr), True)
    q = pr.get('QuestID')
    if q and q != 'None' and q not in givers: add_giver(q, npc_name(cls, pr))
start = load(p, Q_DIR + 'BP_HMZQuestComp')
for i, e in enumerate(start.exports):
    if e['name'].startswith('Default__'):
        for q in start.export_props(i)[0].get('QuestList') or []:
            givers.setdefault(q['ID'], {})

def links(q):
    out = [q['ChainTo']] if q.get('ChainTo') not in (None, 'None', '') else []
    return out + [x for x in (q.get('Reward') or {}).get('QuestUnlocked') or [] if x in Q]

# Entrega alcançável: tem NPC, ou vem de uma missão alcançável
reach = set(q for q in givers if q in Q)
inherited = {}
changed = True
while changed:
    changed = False
    for qid, q in Q.items():
        if qid in reach:
            for nx in links(q):
                if nx in Q and nx not in reach:
                    reach.add(nx); inherited[nx] = qid; changed = True
        req = q.get('QuestRequiredCompleted')
        if qid not in reach and req in reach:
            reach.add(qid); changed = True

def real(qid, q):
    if SKIP.match(qid): return False
    r = q['Reward']
    tx = [t for t in q.get('TraderExchange') or [] if t.get('ID') != 'None']
    has_item = any(item((x.get('Item') or {}).get('RowName')) for x in r.get('Items') or [])
    return bool(q.get('Objectives') or tx or has_item or r.get('Exp') or txt(q.get('Summary'))['en'])

def category(qid, q):
    if qid.startswith('Halloween'): return 'halloween'
    if qid.startswith('Intro'): return 'intro'
    if 'Main' in (q.get('Params') or {}) or qid in ('StartingCamp', 'Doc_Island1', 'Doc_Island2'): return 'main'
    if q.get('TraderExchange') and any(t.get('ID') != 'None' for t in q['TraderExchange']) or qid == 'TradeGeneral': return 'trade'
    return 'side'

def giver_list(qid):
    seen, cur = set(), qid
    while cur and cur not in seen:
        seen.add(cur)
        names = givers.get(cur)
        if names:
            found = [{'n': n, 'rnd': bool(r)} for n, r in sorted(names.items()) if n]
            if found: return found, cur != qid
        cur = inherited.get(cur)
    return [], False

prev = {}
for qid, q in Q.items():
    for nx in links(q): prev.setdefault(nx, []).append(qid)

out = {}
for qid, q in Q.items():
    if not real(qid, q): continue
    r = q['Reward']
    items = {}
    for x in r.get('Items') or []:
        i = item((x.get('Item') or {}).get('RowName'))
        if i: items[i] = items.get(i, 0) + x.get('Amount', 1)
    obj = []
    for o in q.get('Objectives') or []:
        kind = OBJ_KIND[o['Type'].split('::')[-1]]
        i = item(o.get('ObjectiveTag')) if kind == 'give' else None
        name, act = txt(o.get('ObjectiveName')), txt(o.get('OverrideActionName'))
        if not i and not name['en'] and not act['en']: continue
        obj.append({'k': kind, 'n': o.get('Count', 1), 'hide': bool(o.get('HideCount?')), **({'i': i} if i else {}), 'label': name, **({'act': act} if act['en'] else {})})
    tx = []
    for t in q.get('TraderExchange') or []:
        i = item(t.get('ID'))
        if not i: continue
        tiers = [{'given': list(tier['IfGiven']), 'any': [[item(a['ID']) or a['ID'], *a['Count']] for a in tier.get('RandReward') or []]} for tier in t.get('Reward') or []]
        tx.append({'i': i, 'tiers': tiers})
    dlg = []
    for d in q.get('Dialogue') or []:
        rand = [txt(x) for x in d.get('RandomDialogue') or []]
        line = txt(d.get('Dialogue'))
        node = {'t': line} if not rand else {'rand': rand}
        opts = [txt(o.get('Response')) for o in d.get('PlayerOptions') or []]
        node['o'] = [o for o in opts if o['en']]
        if node.get('t', {'en': 1})['en']: dlg.append(node)
    pts = list(pins.get(qid, []))
    for kind, key in (('goal', 'MinimapLocation'), ('turnin', 'TurnIn_MinimapLocation')):
        pt = pin(kind, q.get(key))
        if pt: pts.append(pt)
    who, via_chain = giver_list(qid)
    entry = {
        'id': qid, 'title': txt(q.get('Title')), 'cat': category(qid, q), 'sum': txt(q.get('Summary')), 'giver': who, 'viaChain': via_chain,
        'obj': obj, 'rw': {'items': [[i, n] for i, n in items.items()], 'xp': r.get('Exp') or 0, 'sp': r.get('SkillPoints') or 0,
                           'rand': bool(r.get('RandomItem?')), 'recipes': r.get('RecipeUnlocked') or [], 'builds': r.get('BuildingUnlocked') or []},
        'next': [nx for nx in links(q) if nx in Q], 'afterDays': q.get('ChainQuestAfterDays') or 0, 'prev': prev.get(qid, []),
        'level': q.get('RequiredLevel') or 0, 'days': q.get('RequiredDaysSurvived') or 0,
        'reqQuest': q['QuestRequiredCompleted'] if q.get('QuestRequiredCompleted') not in (None, 'None') else None,
        'once': bool(q.get('CanOnlyBeDoneOnce')), 'pins': pts, 'tx': tx, 'dlg': dlg, 'known': qid in reach,
    }
    out[qid] = entry

# Ordem que mantém cada sequência junta: raízes primeiro, seguindo as continuações
ordered, seen = [], set()
after_req = {}
for qid, e in out.items():
    if e['reqQuest'] in out: after_req.setdefault(e['reqQuest'], []).append(qid)
def walk(qid):
    if qid in seen or qid not in out: return
    seen.add(qid); ordered.append(out[qid])
    for nx in out[qid]['next'] + after_req.get(qid, []):
        # espera o requisito aparecer antes (ex.: a ponte vem depois de religar a energia)
        req = out[nx]['reqQuest'] if nx in out else None
        if req not in out or req in seen: walk(nx)
walk('StartingCamp')  # primeira missão ativa em todo jogo novo (QuestList de BP_HMZQuestComp)
for qid, e in out.items():
    if not e['reqQuest'] and not [x for x in e['prev'] if x in out]: walk(qid)
for qid in out: walk(qid)
for e in ordered:
    e['next'] = [x for x in e['next'] if x in out]
    e['prev'] = [x for x in e['prev'] if x in out]
    if e['reqQuest'] not in out: e['reqQuest'] = None

with open(os.path.join(OUT, 'js', 'quests.js'), 'w', encoding='utf-8', newline='\n') as fh:
    fh.write('// Gerado automaticamente: missões (DAsset_QuestData, DAsset_QuestLod, BP_HumanQuest_*)\n')
    fh.write('window.HZ_DATA.quests = ')
    json.dump(ordered, fh, ensure_ascii=False, separators=(',', ':'))
    fh.write(';\n')
n = {}
for e in ordered: n[e['cat']] = n.get(e['cat'], 0) + 1
print('missoes', len(ordered), n, 'sem NPC:', [e['id'] for e in ordered if not e['known']])
print('com pino', sum(1 for e in ordered if e['pins']), 'com npc', sum(1 for e in ordered if e['giver']))
print('itens faltando:', sorted({a[0] for e in ordered for t in e['tx'] for tier in t['tiers'] for a in tier['any'] if a[0] not in rows}))
print('recipes/builds', [(e['id'], e['rw']['recipes'], e['rw']['builds']) for e in ordered if e['rw']['recipes'] or e['rw']['builds']])
