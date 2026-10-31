import math, struct
import numpy as np
from PIL import Image
from extra import load
from skmesh import find_mesh
from tex import load_icon

# ---------------------------------------------------------------------------
# Materiais -> cor base (+ textura opcional)
# ---------------------------------------------------------------------------
_mat_cache = {}

def mat_params(p, name, depth=0):
    if name in _mat_cache: return _mat_cache[name]
    res = {'vec': {}, 'tex': {}, 'parent': None}
    b = find_mesh(p, name) if name else None
    if b and depth < 6:
        try:
            k = load(p, b)
            pr, _ = k.export_props(0)
            par = pr.get('Parent')
            if par and par != name:
                base = mat_params(p, par, depth + 1)
                res['vec'].update(base['vec']); res['tex'].update(base['tex'])
                res['parent'] = par
            for v in pr.get('VectorParameterValues', []) or []:
                res['vec'][v['ParameterInfo']['Name'].lower()] = v.get('ParameterValue')
            for v in pr.get('TextureParameterValues', []) or []:
                tv = v.get('ParameterValue')
                if tv and tv != 'None': res['tex'][v['ParameterInfo']['Name'].lower()] = (tv, k)
            # material base (sem parâmetros): usa as texturas de cor que o pacote referencia
            if not par:
                import re as _re
                for imp in k.imports:
                    if imp.startswith('/') : continue
                    low = imp.lower()
                    if _re.search(r'(basecolor|base_color|albedo|diffuse|_d$|_bc$|_col$|_color$|_alb$)', low) and not _re.search(r'normal|_n$|rough|orm|mask', low):
                        res['tex'].setdefault('basecolor_auto', (imp, k))
        except Exception as ex:
            pass
    _mat_cache[name] = res
    return res

def lin2srgb(c):
    c = np.clip(np.asarray(c, np.float32), 0, 1)
    return np.where(c <= 0.0031308, c * 12.92, 1.055 * np.power(c, 1 / 2.4) - 0.055)

_tex_cache = {}
def texture(p, tname):
    if tname in _tex_cache: return _tex_cache[tname]
    arr = None
    b = find_mesh(p, tname)
    if b:
        try:
            img, _ = load_icon(p, b, 512)
            arr = np.asarray(img.convert('RGB'), np.float32) / 255.0
        except Exception:
            arr = None
    _tex_cache[tname] = arr
    return arr

COLOR_KEYS = ['vehiclecolor', 'vehicle color', 'car color', 'carcolor', 'base color', 'basecolor', 'paint color', 'body color', 'color', 'tint', 'albedo', 'diffuse color', 'main color', 'colour']
TEX_KEYS = ['basecolor', 'base color', 'base_color', 'diffuse', 'difuse', 'albedo', 'color', 'colour', 'base_texture', 'texture']

def material_look(p, name):
    """Retorna (rgb sRGB 0..1, textura ou None, tipo) para um material."""
    n = (name or '').lower()
    if not name or 'hide' in n: return None
    if 'glass' in n or 'window' in n:
        return (np.array([0.09, 0.11, 0.13]), None, 'glass')
    mp = mat_params(p, name)
    col = None
    for key in COLOR_KEYS:
        for k2, v in mp['vec'].items():
            if k2 == key and v:
                col = lin2srgb(v[:3]); break
        if col is not None: break
    tex = None
    for key in TEX_KEYS + ['basecolor_auto']:
        for k2, (tv, _) in mp['tex'].items():
            if k2 == 'basecolor_auto' and key != 'basecolor_auto': continue
            if key in k2 and not any(s in k2 for s in ('normal', 'rough', 'mask', 'orm', 'ao', 'metal', 'height', 'dirt', 'scratch', 'grunge', 'emmi', 'emissi')):
                t = texture(p, tv)
                if t is not None: tex = t; break
        if tex is not None: break
    if tex is not None and col is not None and float(np.max(col) - np.min(col)) < 0.15:
        tex = tex * float(np.mean(col)) / 0.8   # tint cinza: só escurece/clareia a textura
        col = np.array([1.0, 1.0, 1.0], np.float32)
    elif tex is not None and col is not None and col.mean() > 0.02:
        # cor do veículo tinge a textura: usa a luminância da textura para não escurecer demais
        lum = tex.mean(axis=2, keepdims=True)
        tex = np.clip(lum / max(1e-3, float(lum.mean())) * 0.9, 0, 1).repeat(3, axis=2)
        col = np.asarray(col, np.float32)
    if col is None:
        guess = {'tire': (0.06, 0.06, 0.06), 'rubber': (0.06, 0.06, 0.06), 'black': (0.05, 0.05, 0.05), 'plastic': (0.08, 0.08, 0.08),
                 'chrome': (0.75, 0.75, 0.78), 'bright': (0.7, 0.7, 0.72), 'metal': (0.35, 0.35, 0.37), 'red': (0.6, 0.05, 0.04),
                 'orange': (0.9, 0.45, 0.05), 'leather': (0.25, 0.18, 0.12), 'tan': (0.5, 0.36, 0.22), 'mirror': (0.6, 0.62, 0.65),
                 'reflector': (0.7, 0.7, 0.7), 'bottom': (0.08, 0.08, 0.08), 'rust': (0.35, 0.18, 0.1), 'wood': (0.4, 0.28, 0.16),
                 'light': (0.85, 0.85, 0.8)}
        col = next((np.array(c) for k, c in guess.items() if k in n), np.array([0.45, 0.45, 0.45]) if tex is None else np.array([1.0, 1.0, 1.0]))
        if tex is not None: col = np.array([1.0, 1.0, 1.0])
    kind = 'paint' if 'paint' in n or 'carpaint' in (mp['parent'] or '').lower() else 'other'
    return (np.asarray(col, np.float32), tex, kind)

# ---------------------------------------------------------------------------
# Rasterizador
# ---------------------------------------------------------------------------
def look_at(eye, target, up=(0, 0, 1)):
    f = np.asarray(target, float) - eye; f /= np.linalg.norm(f)
    r = np.cross(f, up); r /= np.linalg.norm(r)
    u = np.cross(r, f)
    return np.stack([r, u, -f])

def render(parts, size=(1280, 760), yaw=35, pitch=16, ss=2):
    """parts: lista de dicts {pos (N,3), uv (N,2), idx (M,), sections [(look, base, tris)]}
    As posições vêm no sistema do UE (mão esquerda); invertemos Y para não espelhar a imagem."""
    W, H = size[0] * ss, size[1] * ss
    parts = [dict(q, pos=q['pos'] * np.array([1, -1, 1], np.float32)) for q in parts]
    allp = np.concatenate([q['pos'] for q in parts])
    lo, hi = allp.min(0), allp.max(0)
    center = (lo + hi) / 2
    radius = np.linalg.norm(hi - lo) / 2
    yr, pr = math.radians(yaw), math.radians(pitch)
    dirv = np.array([math.cos(pr) * math.cos(yr), math.cos(pr) * math.sin(yr), math.sin(pr)])
    dist = radius * 6
    eye = center + dirv * dist
    R = look_at(eye, center)
    fov = 2 * math.atan(radius * 0.8 / dist)
    focal = (H / 2) / math.tan(fov / 2)
    light = np.array([0.45, -0.55, 0.75]); light /= np.linalg.norm(light)
    view_dir = dirv
    half = (light + view_dir); half /= np.linalg.norm(half)

    zbuf = np.full((H, W), np.inf, np.float32)
    img = np.zeros((H, W, 3), np.float32)
    mask = np.zeros((H, W), bool)

    for q in parts:
        P = q['pos']
        cam = (P - eye) @ R.T
        z = -cam[:, 2]
        sx = W / 2 + focal * cam[:, 0] / z
        sy = H / 2 - focal * cam[:, 1] / z
        idx = q['idx']
        for look, base, ntri in q['sections']:
            if look is None: continue
            col, tex, kind = look
            tri = idx[base:base + ntri * 3].reshape(-1, 3)
            a, b, c = P[tri[:, 0]], P[tri[:, 1]], P[tri[:, 2]]
            nrm = np.cross(b - a, c - a)
            ln = np.linalg.norm(nrm, axis=1); ok = ln > 1e-9
            tri, nrm, ln = tri[ok], nrm[ok], ln[ok]
            nrm = nrm / ln[:, None]
            # orienta a normal para a câmera (malhas com dupla face)
            toward = (eye - P[tri[:, 0]])
            flip = (nrm * toward).sum(1) < 0
            nrm[flip] *= -1
            diff = np.clip(nrm @ light, 0, 1)
            spec = np.clip(nrm @ half, 0, 1) ** (60 if kind == 'paint' else 20)
            shade = 0.38 + 0.72 * diff
            spk = (0.55 if kind == 'paint' else 0.25 if kind == 'glass' else 0.12) * spec
            X = sx[tri]; Y = sy[tri]; Z = z[tri]
            xmin = np.clip(np.floor(X.min(1)), 0, W - 1).astype(int); xmax = np.clip(np.ceil(X.max(1)), 0, W - 1).astype(int)
            ymin = np.clip(np.floor(Y.min(1)), 0, H - 1).astype(int); ymax = np.clip(np.ceil(Y.max(1)), 0, H - 1).astype(int)
            uvs = q['uv'][tri] if tex is not None else None
            for t in range(len(tri)):
                x0, x1, y0, y1 = xmin[t], xmax[t], ymin[t], ymax[t]
                if x1 < x0 or y1 < y0: continue
                xs = np.arange(x0, x1 + 1) + 0.5; ys = np.arange(y0, y1 + 1) + 0.5
                gx, gy = np.meshgrid(xs, ys)
                (ax, bx, cx), (ay, by, cy) = X[t], Y[t]
                den = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy)
                if abs(den) < 1e-12: continue
                w0 = ((by - cy) * (gx - cx) + (cx - bx) * (gy - cy)) / den
                w1 = ((cy - ay) * (gx - cx) + (ax - cx) * (gy - cy)) / den
                w2 = 1 - w0 - w1
                inside = (w0 >= -1e-4) & (w1 >= -1e-4) & (w2 >= -1e-4)
                if not inside.any(): continue
                zz = w0 * Z[t, 0] + w1 * Z[t, 1] + w2 * Z[t, 2]
                sub = zbuf[y0:y1 + 1, x0:x1 + 1]
                upd = inside & (zz < sub)
                if not upd.any(): continue
                sub[upd] = zz[upd]
                if tex is not None:
                    u = (w0 * uvs[t, 0, 0] + w1 * uvs[t, 1, 0] + w2 * uvs[t, 2, 0])[upd] % 1.0
                    v = (w0 * uvs[t, 0, 1] + w1 * uvs[t, 1, 1] + w2 * uvs[t, 2, 1])[upd] % 1.0
                    th, tw = tex.shape[:2]
                    base_c = tex[(v * th).astype(int) % th, (u * tw).astype(int) % tw] * col
                else:
                    base_c = col
                img[y0:y1 + 1, x0:x1 + 1][upd] = np.clip(base_c * shade[t] + spk[t], 0, 1)
                mask[y0:y1 + 1, x0:x1 + 1][upd] = True

    # recorta, fundo transparente, reduz (anti-aliasing)
    rgba = np.zeros((H, W, 4), np.uint8)
    rgba[..., :3] = (img * 255).astype(np.uint8)
    rgba[..., 3] = mask * 255
    out = Image.fromarray(rgba, 'RGBA')
    bbox = out.getbbox()
    if bbox:
        pad = 12 * ss
        bbox = (max(0, bbox[0] - pad), max(0, bbox[1] - pad), min(W, bbox[2] + pad), min(H, bbox[3] + pad))
        out = out.crop(bbox)
    return out.resize((max(1, out.width // ss), max(1, out.height // ss)), Image.LANCZOS)
