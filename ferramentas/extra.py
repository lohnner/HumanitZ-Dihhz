import struct
from pak import R
from uasset import Pkg

def load(p, base):
    return Pkg(p.read(base + '.uasset'), p.read(base + '.uexp'))

def read_enum(p, base):
    k = load(p, base)
    props, r = k.export_props(0)
    disp = props.get('DisplayNameMap', {})
    names = []
    r.i32()
    n = r.i32()
    for _ in range(n):
        nm = k.fname(r); v = struct.unpack('<q', r.read(8))[0]
        names.append((nm, v))
    out = {}
    for nm, v in names:
        short = nm.split('::')[-1]
        d = disp.get(short)
        if isinstance(d, dict): d = d.get('src')
        out[nm] = d or short
    return out

def read_locres(b):
    r = R(b)
    magic = r.read(16)
    ver = r.read(1)[0]
    stroff = struct.unpack('<q', r.read(8))[0]
    if ver >= 2: r.u32()
    save = r.p
    r.p = stroff
    strings = []
    for _ in range(r.i32()):
        strings.append(r.fstr())
        if ver >= 2: r.i32()
    r.p = save
    out = {}
    for _ in range(r.u32()):
        if ver >= 2: r.u32()
        ns = r.fstr()
        for _ in range(r.u32()):
            if ver >= 2: r.u32()
            key = r.fstr(); r.u32(); idx = r.i32()
            out[(ns, key)] = strings[idx]
    return out
