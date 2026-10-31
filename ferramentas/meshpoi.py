"""Posições (mundo) de todas as malhas estáticas colocadas direto no nível -> mesh_positions.json"""
import json, collections
from pak import Pak
from uasset import Pkg

p = Pak()
f = 'HumanitZ/Content/BattleRoyaleStarterKit/Maps/BattleRoyale_Map_a/BattleRoyale_Map_a'
k = Pkg(p.read(f + '.umap'), p.read(f + '.uexp'))
out = []
for i, e in enumerate(k.exports):
    if k.ref(e['cls']) != 'StaticMeshComponent': continue
    owner = e['outer'] - 1
    if owner < 0: continue
    ocls = k.ref(k.exports[owner]['cls']) or ''
    if ocls not in ('StaticMeshActor', 'HZStaticMeshActor'): continue
    try:
        pr, _ = k.export_props(i)
    except Exception:
        continue
    m, loc = pr.get('StaticMesh'), pr.get('RelativeLocation')
    if m and loc: out.append([m, round(loc[0]), round(loc[1]), round(loc[2])])
json.dump(out, open('mesh_positions.json', 'w'))
print(len(out))
c = collections.Counter(o[0] for o in out)
import re
kw = re.compile(r'(?i)sign|pump|gasstation|petrol|church|hospital|prison|school|firestation|trader|bank|airport|hangar|lighthouse|bunker|radio|mansion|motel|hotel|diner|pizza|burger|bar_|police|pharm|laund|post|sport|gun|hardware|repair|warehouse|farm|barn')
for n, v in c.most_common():
    if kw.search(n): print(v, n)
