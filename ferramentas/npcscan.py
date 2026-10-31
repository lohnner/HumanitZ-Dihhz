"""Lista oficial de NPCs do jogo (DAsset_QuestLod) -> npcs.json"""
import json, math
from pak import Pak
from extra import load

p = Pak()
Q = 'HumanitZ/Content/TSS_Game/KaiAIMapTest/KaiHumanAI/Quest/'
k = load(p, Q + 'Data/DAsset_QuestLod')
pr, _ = k.export_props(0)
out = []
for d in pr['LODData']:
    cls = (d.get('Class') or '').split('/')[-1].split('.')[0]
    t = d['Transform']['Translation']
    out.append({'cls': cls, 'x': round(t[0]), 'y': round(t[1]), 'z': round(t[2]), 'quest': d.get('QuestOverride'), 'chance': d.get('SpawnChance'),
                'retry': d.get('RetrySpawnMinutes'), 'disabled': d.get('Disabled?'), 'friends': len(d.get('Friendlies') or []), 'data': d.get('Data')})
json.dump(out, open('npcs.json', 'w'), ensure_ascii=False)
print('AllRecruits', pr.get('AllRecruits'))
w = json.load(open('wand_points.json', encoding='utf-8'))
am = [o for o in w if o['cat'] == 'Sobrevivente Amigável']
postos = [o for o in w if o['cat'] == 'Posto de Gasolina']
for o in sorted(out, key=lambda o: o['cls']):
    dw = min(math.dist((o['x'], o['y']), (a['x'], a['y'])) for a in am)
    dp = min(math.dist((o['x'], o['y']), (a['x'], a['y'])) for a in postos)
    print(f"{o['cls'][:34]:34} x={o['x']:7} y={o['y']:8} q={str(o['quest'])[:18]:18} ch={o['chance']} retry={o['retry']} wand={round(dw/100):5}m posto={round(dp/100):5}m")
