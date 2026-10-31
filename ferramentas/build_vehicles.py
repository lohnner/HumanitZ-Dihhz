"""Renderiza cada veículo a partir dos modelos 3D e materiais do jogo -> img/vehicles/<BP>.webp"""
import os, sys, json, time
import numpy as np
from pak import Pak
from extra import load
from skmesh import find_mesh, materials, lods, indices_before, sections, static_mesh, skeleton, rot_mat
from render import render, material_look

OUT = r"C:\Users\rodri\OneDrive\Documentos\HumanitZ"
IMG = os.path.join(OUT, 'img', 'vehicles')
os.makedirs(IMG, exist_ok=True)
VDIR = 'HumanitZ/Content/TSS_Game/Blueprints/Vehicles/Possession/Blueprints/DrivableVehicles/'

p = Pak()

def bp_chain(name):
    chain = []
    while name and name not in chain:
        chain.append(name)
        k = load(p, VDIR + name)
        nxt = None
        for e in k.exports:
            if k.ref(e['cls']) == 'BlueprintGeneratedClass' and e['sup']:
                s = (k.ref(e['sup']) or '')[:-2]
                if VDIR + s + '.uasset' in p.files: nxt = s
        name = nxt
    return list(reversed(chain))   # raiz -> filho

def gather(name):
    """Componentes (mesclados ao longo da herança) e nós SCS (anexos)."""
    comps, scs = {}, {}
    for bp in bp_chain(name):
        k = load(p, VDIR + bp)
        for i, e in enumerate(k.exports):
            cls = k.ref(e['cls']) or ''
            if cls in ('StaticMeshComponent', 'SkeletalMeshComponent') or e['name'] == 'VehicleMesh':
                try: pr, _ = k.export_props(i)
                except Exception: continue
                key = e['name'].replace('_GEN_VARIABLE', '')
                c = comps.setdefault(key, {'cls': cls})
                if cls: c['cls'] = cls
                c.update(pr)
            elif cls == 'SCS_Node':
                try: pr, _ = k.export_props(i)
                except Exception: continue
                v = pr.get('InternalVariableName')
                if v: scs[v] = pr
    return comps, scs

_mesh_cache = {}
def skel_mesh(name):
    if name in _mesh_cache: return _mesh_cache[name]
    b = find_mesh(p, name)
    k = load(p, b)
    mats, pp = materials(k)
    L = lods(k)
    l = max(L, key=lambda x: x['n'])
    idx, ip = indices_before(k.ue, l['start'], l['n'])
    secs = sections(k.ue, ip, len(idx), len(mats), pp)
    sk = skeleton(k, pp)
    r = dict(pos=l['pos'], uv=l['uv'], idx=idx, sections=secs, mats=mats, skel=sk)
    _mesh_cache[name] = r
    return r

def stat_mesh(name):
    if name in _mesh_cache: return _mesh_cache[name]
    b = find_mesh(p, name)
    r = static_mesh(load(p, b)) if b else None
    _mesh_cache[name] = r
    return r

def part(mesh, overrides, R=None, T=None, S=None):
    pos = mesh['pos'].astype(np.float64)
    if S is not None: pos = pos * S
    if R is not None: pos = pos @ R.T
    if T is not None: pos = pos + T
    mats = list(mesh['mats'])
    for i, o in enumerate(overrides or []):
        if o and i < len(mats): mats[i] = o
    secs = [(material_look(p, mats[m] if m < len(mats) else None), b, n) for m, b, n in (mesh['sections'] or [])]
    return dict(pos=pos.astype(np.float32), uv=mesh['uv'], idx=mesh['idx'], sections=secs)

def build(name):
    comps, scs = gather(name)
    vm = comps.get('VehicleMesh', {})
    skname = vm.get('SkeletalMesh')
    if not skname: return None
    body = skel_mesh(skname)
    parts = [part(body, vm.get('OverrideMaterials'))]
    for key, c in comps.items():
        if key == 'VehicleMesh' or c.get('cls') != 'StaticMeshComponent': continue
        sm = c.get('StaticMesh')
        if not sm or sm == 'None': continue
        if c.get('bVisible') is False or c.get('bHiddenInGame') is True: continue
        node = scs.get(key, {})
        if node.get('ParentComponentOrVariableName') not in (None, 'VehicleMesh', 'None'):
            parent_name = node.get('ParentComponentOrVariableName')
        mesh = stat_mesh(sm)
        if not mesh: continue
        S = np.array(c.get('RelativeScale3D', (1, 1, 1)), float)
        Rc = rot_mat(*c.get('RelativeRotation', (0, 0, 0)))
        Tc = np.array(c.get('RelativeLocation', (0, 0, 0)), float)
        sock = node.get('AttachToName')
        if sock and sock in body['skel']:
            BR, BT = body['skel'][sock]
            R = BR @ Rc; T = BR @ Tc + BT
        else:
            R, T = Rc, Tc
        parts.append(part(mesh, c.get('OverrideMaterials'), R, T, S))
    return render(parts, size=(1100, 650))

def actor_chain(path):
    """Cadeia de herança de um blueprint qualquer (caminho completo sem extensão)."""
    chain = []
    while path and path not in chain:
        chain.append(path)
        k = load(p, path)
        nxt = None
        for e in k.exports:
            if k.ref(e['cls']) == 'BlueprintGeneratedClass' and e['sup']:
                s = (k.ref(e['sup']) or '')[:-2]
                cand = [f[:-7] for f in p.files if f.endswith('/' + s + '.uasset')]
                if cand: nxt = cand[0]
        path = nxt
    return list(reversed(chain))

def build_actor(path, size=(1100, 650), yaw=35, pitch=16, skip=()):
    """Monta qualquer ator (cavalo, helicóptero, reboque...) a partir dos componentes de malha do blueprint."""
    comps, scs, tmpl2var = {}, {}, {}
    for bp in actor_chain(path):
        k = load(p, bp)
        for i, e in enumerate(k.exports):
            cls = k.ref(e['cls']) or ''
            try:
                if cls in ('StaticMeshComponent', 'SkeletalMeshComponent'):
                    pr, _ = k.export_props(i)
                    key = e['name'].replace('_GEN_VARIABLE', '')
                    c = comps.setdefault(key, {'cls': cls}); c.update(pr)
                elif cls == 'SCS_Node':
                    pr, _ = k.export_props(i)
                    v = pr.get('InternalVariableName')
                    if v: scs[v] = pr
            except Exception:
                continue

    def world(key, depth=0):
        """Transformação acumulada (R, T, S escalar por eixo) do componente até a raiz."""
        c = comps.get(key, {})
        S = np.array(c.get('RelativeScale3D', (1, 1, 1)), float)
        R = rot_mat(*c.get('RelativeRotation', (0, 0, 0)))
        T = np.array(c.get('RelativeLocation', (0, 0, 0)), float)
        node = scs.get(key, {})
        par = node.get('ParentComponentOrVariableName')
        if par and par != 'None' and par in comps and depth < 8:
            PR, PT, PS = world(par, depth + 1)
            sock = node.get('AttachToName')
            pc = comps[par]
            if sock and sock != 'None' and pc.get('cls') == 'SkeletalMeshComponent' and pc.get('SkeletalMesh'):
                try:
                    sk = skel_mesh(pc['SkeletalMesh'])['skel']
                    if sock in sk:
                        BR, BT = sk[sock]
                        R = BR @ R; T = BR @ T + BT
                except Exception:
                    pass
            R = PR @ R; T = PR @ (T * PS) + PT; S = S * PS
        return R, T, S

    parts = []
    for key, c in comps.items():
        if key in skip or c.get('bVisible') is False or c.get('bHiddenInGame') is True: continue
        mname = c.get('StaticMesh') if c['cls'] == 'StaticMeshComponent' else c.get('SkeletalMesh')
        if not mname or mname == 'None': continue
        try:
            mesh = stat_mesh(mname) if c['cls'] == 'StaticMeshComponent' else skel_mesh(mname)
        except Exception as ex:
            print('  malha falhou', mname, ex); continue
        if not mesh: continue
        R, T, S = world(key)
        parts.append(part(mesh, c.get('OverrideMaterials'), R, T, S))
    if not parts: return None
    return render(parts, size=size, yaw=yaw, pitch=pitch)

if __name__ == '__main__':
    import re
    src = open(os.path.join(OUT, 'js', 'vehicles.js'), encoding='utf-8').read()
    vehicles = json.loads(re.search(r'window\.HZ_DATA\.vehicles = (\[.*?\]);\n', src, re.S).group(1))
    only = sys.argv[1:]
    for v in vehicles:
        if only and v['id'] not in only: continue
        t = time.time()
        try:
            img = build(v['id'])
            if img is None: print('sem malha', v['id']); continue
            img.save(os.path.join(IMG, v['id'] + '.webp'), 'WEBP', quality=88, method=6)
            print(v['id'], img.size, round(time.time() - t, 1), 's', flush=True)
        except Exception as ex:
            import traceback; traceback.print_exc()
            print('FALHOU', v['id'], ex, flush=True)
