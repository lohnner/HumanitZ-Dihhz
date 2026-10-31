"""Extrai do DAsset_HumanitZLod os prédios, contêineres e helicópteros caídos -> worldlod.json"""
import json
from pak import Pak
from extra import load, read_enum

p = Pak()
k = load(p, 'HumanitZ/Content/TSS_Game/KaiWorldEffects/ProceduralWorld/DAsset_HumanitZLod')
pr, _ = k.export_props(0)
E = read_enum(p, [x for x in p.files if x.endswith('/Enum_SpawnType.uasset')][0][:-7])
def loc(o): t = o['Transform']['Translation']; return [round(t[0]), round(t[1]), round(t[2])]
cn = lambda s: (s or '').split('.')[-1][:-2]
out = {
    'houses': [[cn(h['Class']), *loc(h)] for h in pr['Houses']],
    'containers': [[cn(g['Class']), E.get(g.get('SpawnType'), ''), *loc(g)] for g in pr['Global']],
    'heli': [loc(h) for h in pr['HeliCrashes']],
}
json.dump(out, open('worldlod.json', 'w'))
print({a: len(b) for a, b in out.items()})
