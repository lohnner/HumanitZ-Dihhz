"""Posições de componentes (malha ou decal) por material usado -> mat_positions.json"""
import json, collections, sys
from pak import Pak
from uasset import Pkg

p = Pak()
f = 'HumanitZ/Content/BattleRoyaleStarterKit/Maps/BattleRoyale_Map_a/BattleRoyale_Map_a'
k = Pkg(p.read(f + '.umap'), p.read(f + '.uexp'))
out = []
for i, e in enumerate(k.exports):
    cls = k.ref(e['cls']) or ''
    if cls not in ('StaticMeshComponent', 'DecalComponent', 'HZInstanceSMeshComp'): continue
    owner = e['outer'] - 1
    ocls = k.ref(k.exports[owner]['cls']) if owner >= 0 else ''
    try:
        pr, _ = k.export_props(i)
    except Exception:
        continue
    mats = list(pr.get('OverrideMaterials') or [])
    if pr.get('DecalMaterial'): mats.append(pr['DecalMaterial'])
    loc = pr.get('RelativeLocation')
    if not mats or not loc: continue
    # componentes de decal/malha soltos: a posição relativa é a do mundo quando o dono é um ator simples
    if ocls not in ('StaticMeshActor', 'HZStaticMeshActor', 'DecalActor'): continue
    for m in mats:
        if m: out.append([m, pr.get('StaticMesh') or cls, round(loc[0]), round(loc[1]), round(loc[2])])
json.dump(out, open('mat_positions.json', 'w'))
c = collections.Counter(o[0] for o in out)
print(len(out), len(c))
import re
for n, v in c.most_common():
    if re.search(r'(?i)gas|pump|logo|sign|police|pharm|store|shop|hospital|clinic|church|bank|motel|diner|pizza|burger|bar|laund|post|fire|school|prison|gun|hardware|sport|trader|market', n): print(v, n)
