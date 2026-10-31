"""Varre os níveis do mapa principal e lista atores com posição (x, y, z)."""
import json, sys, collections, time, struct
from pak import Pak
from uasset import Pkg

p = Pak()
BASE = 'HumanitZ/Content/BattleRoyaleStarterKit/Maps/BattleRoyale_Map_a/'
LEVELS = [BASE + 'BattleRoyale_Map_a'] + sorted(f[:-5] for f in p.files if f.startswith(BASE + 'Battle_Royale_Map_a/') and f.endswith('.umap'))

COMP_SKIP = ('Component',)

def scan(level):
    k = Pkg(p.read(level + '.umap'), p.read(level + '.uexp'))
    # cabeçalho: offset do mundo (World Composition) fica em WorldTileInfo; lido à parte
    by_outer = collections.defaultdict(dict)
    for i, e in enumerate(k.exports):
        by_outer[e['outer']][e['name']] = i
    out = []
    for i, e in enumerate(k.exports):
        cls = k.ref(e['cls']) or ''
        if cls.endswith('Component') or cls in ('Model', 'Level', 'World', 'BodySetup', 'Texture2D', 'Function', 'Polys'):
            continue
        if not (cls.endswith('_C') or cls in ('PlayerStart', 'StaticMeshActor', 'HZStaticMeshActor', 'Landscape', 'LandscapeStreamingProxy', 'TextRenderActor')):
            continue
        if cls in ('StaticMeshActor', 'HZStaticMeshActor'): continue
        try:
            pr, _ = k.export_props(i)
        except Exception:
            continue
        rc = pr.get('RootComponent')
        loc = None
        if rc and rc in by_outer.get(i + 1, {}):
            try:
                cp, _ = k.export_props(by_outer[i + 1][rc])
                loc = cp.get('RelativeLocation')
            except Exception:
                pass
        if loc is None: continue
        keep = {kk: pr[kk] for kk in ('Name', 'ActorName', 'ContainerName', 'SpawnList', 'NumSpawnCount', 'HighPriorityAI', 'QuestID', 'QuestTag',
                                       'KeyRequired', 'RequirePower?', 'TeleportDestination', 'PlayerStartTag', 'SpawnChance', 'SpawnRadius') if kk in pr}
        sc = None
        if rc and rc in by_outer.get(i + 1, {}):
            try: sc = cp.get('RelativeScale3D')
            except Exception: sc = None
        out.append({'cls': cls, 'name': e['name'], 'loc': [round(v) for v in loc], 'props': keep, 'scale': sc})
    return k, out

if __name__ == '__main__':
    allp = []
    for lv in LEVELS:
        t = time.time()
        k, out = scan(lv)
        print(lv.split('/')[-1], len(k.exports), 'atores', len(out), round(time.time() - t, 1), 's', flush=True)
        for o in out: o['level'] = lv.split('/')[-1]
        allp += out
    json.dump(allp, open('world_actors.json', 'w'), default=str)
    c = collections.Counter(o['cls'] for o in allp)
    for n, v in c.most_common(400): print(v, n)
