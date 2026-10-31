import struct, re
import numpy as np
from extra import load

def find_mesh(p, name):
    f = [x for x in p.files if x.endswith('/' + name + '.uasset')]
    return f[0][:-7] if f else None

def materials(k):
    """Lista de materiais (ordem dos slots) logo após as props do SkeletalMesh."""
    ei = next(i for i, e in enumerate(k.exports) if k.ref(e['cls']) == 'SkeletalMesh')
    pr, r = k.export_props(ei)
    d = k.ue
    p = r.p + 4 + 2 + 28   # guid flag, strip flags, ImportedBounds
    n = struct.unpack_from('<i', d, p)[0]; p += 4
    mats = []
    for _ in range(n):
        idx = struct.unpack_from('<i', d, p)[0]
        mats.append(k.ref(idx) if idx else None)
        p += 40
    return mats, p

def lods(k):
    """Encontra os buffers de posição pela assinatura (stride 12, N, elem 12, N)."""
    d = k.ue
    out = []
    for m in re.finditer(rb'\x0c\x00\x00\x00(....)\x0c\x00\x00\x00\1', d, re.S):
        n = struct.unpack('<I', m.group(1))[0]
        if n < 50 or n > 2_000_000: continue
        pstart = m.end()
        try:
            out.append(_lod_at(d, m.start(), pstart, n))
        except Exception:
            pass
    return [o for o in out if o]

def _lod_at(d, mstart, pstart, n):
        pos = np.frombuffer(d, np.float32, n * 3, pstart).reshape(n, 3)
        q = pstart + n * 12
        q += 2  # strip flags
        ntc, nv, fullUV, hiTan = struct.unpack_from('<IIii', d, q); q += 16
        if nv != n or ntc > 8 or ntc == 0: return None
        esz, cnt = struct.unpack_from('<ii', d, q); q += 8
        if cnt != n: return None
        q += esz * cnt   # tangentes
        esz2, cnt2 = struct.unpack_from('<ii', d, q); q += 8
        # o array de UVs tem NumVertices*NumTexCoords elementos (ou NumVertices elementos de NumTexCoords UVs)
        if cnt2 == n * ntc: total = cnt2
        elif cnt2 == n: total = n * ntc
        else: return None
        if fullUV:
            uv = np.frombuffer(d, np.float32, total * 2, q).reshape(n, ntc, 2)[:, 0, :]
        else:
            uv = np.frombuffer(d, np.float16, total * 2, q).reshape(n, ntc, 2)[:, 0, :].astype(np.float32)
        q += total * (8 if fullUV else 4)
        if not np.isfinite(pos).all() or not np.isfinite(uv).all(): return None
        return dict(n=n, start=mstart, pos=pos, uv=uv, end=q)

def static_indices_after(d, q, nverts, limit=4096):
    """Malha estática: o index buffer vem depois dos vertex buffers (bool32 b32Bit, i32 1, i32 nbytes, dados)."""
    for p in range(q, min(q + limit, len(d) - 12)):
        b32, esz, nbytes = struct.unpack_from('<iii', d, p)
        if b32 in (0, 1) and esz == 1 and nbytes > 0 and nbytes % (4 if b32 else 2) == 0 and p + 12 + nbytes <= len(d):
            arr = np.frombuffer(d, np.uint32 if b32 else np.uint16, nbytes // (4 if b32 else 2), p + 12)
            if arr.max() < nverts and len(arr) % 3 == 0:
                return arr.astype(np.int64)
    return None

def static_sections(d, lo, hi, nidx, nmats):
    """Seções de malha estática: i32 material, u32 FirstIndex, u32 NumTriangles, u32 MinV, u32 MaxV, ..."""
    p = lo
    zero = struct.pack('<I', 0)
    while True:
        p = d.find(zero, p, hi)
        if p < 4:
            if p < 0: return None
            p += 1; continue
        m0 = struct.unpack_from('<i', d, p - 4)[0]
        t0 = struct.unpack_from('<I', d, p + 4)[0]
        if 0 <= m0 < nmats and 0 < t0 and t0 * 3 <= nidx:
            chain = [(m0, 0, t0)]; base = 3 * t0; q = p + 8
            while base < nidx:
                hit = d.find(struct.pack('<I', base), q, min(q + 200, hi))
                if hit < 0: break
                m = struct.unpack_from('<i', d, hit - 4)[0]; t = struct.unpack_from('<I', d, hit + 4)[0]
                if not (0 <= m < nmats) or t == 0 or base + 3 * t > nidx: break
                chain.append((m, base, t)); base += 3 * t; q = hit + 8
            if base == nidx: return chain
        p += 1

def static_mesh(k):
    """Lê o LOD0 de um UStaticMesh. Retorna dict(pos, uv, idx, sections, mats)."""
    ei = next(i for i, e in enumerate(k.exports) if k.ref(e['cls']) == 'StaticMesh')
    e = k.exports[ei]
    pr, r = k.export_props(ei)
    lo, hi = e['off'], e['off'] + e['size']
    d = k.ue
    L = [l for l in lods(k) if lo <= l['start'] < hi]
    if not L: return None
    l = L[0]   # primeiro LOD serializado = LOD0
    q = l['end']
    # FColorVertexBuffer: strip flags, stride, NumVertices, [elem size, count, dados]
    try:
        stride, ncol = struct.unpack_from('<II', d, q + 2)
        if ncol == l['n'] and stride == 4:
            q = q + 2 + 8 + 8 + 4 * ncol
        else:
            q = q + 2
    except struct.error:
        pass
    idx = static_indices_after(d, q, l['n'])
    if idx is None: return None
    mats = [m for m in (pr.get('StaticMaterials') or [])]
    names = [(sm.get('MaterialInterface') if isinstance(sm, dict) else None) for sm in mats]
    secs = static_sections(d, lo, l['start'], len(idx), max(1, len(names)))
    if secs is None: secs = [(0, 0, len(idx) // 3)]
    return dict(pos=l['pos'], uv=l['uv'], idx=idx, sections=secs, mats=names)

def skeleton(k, pp):
    """Ossos e pose de referência (componente) logo após a lista de materiais."""
    d = k.ue
    n = struct.unpack_from('<i', d, pp)[0]; p = pp + 4
    bones = []
    for _ in range(n):
        i0, i1, par = struct.unpack_from('<iii', d, p); p += 12
        bones.append([k.names[i0], par])
    n2 = struct.unpack_from('<i', d, p)[0]; p += 4
    poses = []
    for _ in range(n2):
        v = struct.unpack_from('<10f', d, p); p += 40
        poses.append(v)
    world = {}
    W = []
    for i, (name, par) in enumerate(bones):
        q = np.array(poses[i][0:4]); t = np.array(poses[i][4:7])
        Rm = quat_to_mat(q)
        if par >= 0:
            PR, PT = W[par]
            Rm = PR @ Rm; t = PR @ t + PT
        W.append((Rm, t)); world[name] = (Rm, t)
    return world

def quat_to_mat(q):
    x, y, z, w = q
    return np.array([[1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)],
                     [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)],
                     [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)]])

def rot_mat(pitch, yaw, roll):
    """FRotator (graus) -> matriz de rotação do UE."""
    P, Y, R = np.radians([pitch, yaw, roll])
    cp, sp, cy, sy, cr, sr = np.cos(P), np.sin(P), np.cos(Y), np.sin(Y), np.cos(R), np.sin(R)
    # colunas = eixos X, Y, Z (convenção FRotationMatrix do UE, aplicada a vetores coluna)
    X = np.array([cp * cy, cp * sy, sp])
    Yv = np.array([sr * sp * cy - cr * sy, sr * sp * sy + cr * cy, -sr * cp])
    Z = np.array([-(cr * sp * cy + sr * sy), cy * sr - cr * sp * sy, cr * cp])
    return np.stack([X, Yv, Z], axis=1)

def sections(d, idx_pos, nidx, nmats, lo):
    """Encadeia seções (u16 material, u32 BaseIndex, u32 NumTriangles) que cobrem todo o index buffer."""
    best = None
    p = lo
    zero = struct.pack('<I', 0)
    while True:
        p = d.find(zero, p, idx_pos)
        if p < 0: break
        s0 = p - 2
        m0 = struct.unpack_from('<H', d, s0)[0]
        t0 = struct.unpack_from('<I', d, p + 4)[0]
        if m0 < nmats and 0 < t0 and t0 * 3 <= nidx:
            chain = [(m0, 0, t0)]
            base = 3 * t0
            q = p + 8
            while base < nidx:
                # cabeçalho de seção: strip flags 01 00, u16 material, u32 base, u32 tris
                hit = q
                found = False
                while True:
                    hit = d.find(struct.pack('<I', base), hit, idx_pos)
                    if hit < 0: break
                    m = struct.unpack_from('<H', d, hit - 2)[0]
                    t = struct.unpack_from('<I', d, hit + 4)[0]
                    if d[hit - 4:hit - 2] == b'\x01\x00' and m < nmats and t > 0 and base + 3 * t <= nidx:
                        found = True; break
                    hit += 1
                if not found: break
                chain.append((m, base, t)); base += 3 * t; q = hit + 8
            if base == nidx:
                return chain
        p += 1
    return best

def indices_before(d, start, nverts):
    """Varre para trás procurando o cabeçalho do index buffer que termina em `start`."""
    for isz in (2, 4):
        # cabeçalho: u8 isz, i32 isz, i32 num ; dados = num*isz ; fim == start
        # num*isz + 9 = start - hdr  -> testamos candidatos pelo padrão u8,isz
        pat = struct.pack('<Bi', isz, isz)
        p = start
        while True:
            p = d.rfind(pat, 0, p)
            if p < 0: break
            num = struct.unpack_from('<i', d, p + 5)[0]
            if num > 0 and p + 9 + num * isz == start:
                arr = np.frombuffer(d, np.uint16 if isz == 2 else np.uint32, num, p + 9)
                if arr.max() < nverts: return arr.astype(np.int64), p
            if start - p > 60_000_000: break
    return None, None
