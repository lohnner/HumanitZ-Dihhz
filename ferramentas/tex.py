import struct, io
from PIL import Image
from pak import R
from uasset import Pkg

FOURCC = {'PF_DXT1': b'DXT1', 'PF_DXT3': b'DXT3', 'PF_DXT5': b'DXT5', 'PF_BC5': b'ATI2', 'PF_BC4': b'ATI1'}

def dds(fmt, w, h, data):
    hdr = bytearray(128)
    hdr[0:4] = b'DDS '
    struct.pack_into('<IIIIIII', hdr, 4, 124, 0x1007 | 0x80000, h, w, len(data), 0, 1)
    pf = 76
    if fmt == 'PF_BC7':
        struct.pack_into('<II4s', hdr, pf, 32, 4, b'DX10')
        struct.pack_into('<I', hdr, 108, 0x1000)
        dx10 = struct.pack('<IIIII', 98, 3, 0, 1, 0)
        return bytes(hdr) + dx10 + data
    if fmt == 'PF_B8G8R8A8':
        struct.pack_into('<IIIIIIII', hdr, pf, 32, 0x41, 0, 32, 0xff0000, 0xff00, 0xff, 0xff000000)
    else:
        struct.pack_into('<II4s', hdr, pf, 32, 4, FOURCC[fmt])
    struct.pack_into('<I', hdr, 108, 0x1000)
    return bytes(hdr) + data

def load_icon(pak, base, want=128):
    k = Pkg(pak.read(base + '.uasset'), pak.read(base + '.uexp'))
    idx = next(i for i, e in enumerate(k.exports) if k.ref(e['cls']) == 'Texture2D')
    props, r = k.export_props(idx)
    r.read(4); r.read(4); r.i32()
    k.fname(r); r.read(8)
    w, h = r.i32(), r.i32(); r.u32()
    fmt = r.fstr(); r.i32(); n = r.i32()
    ubulk = None
    mips = []
    for _ in range(n):
        r.i32()
        flags = r.u32(); r.i32(); size = r.i32(); off = struct.unpack('<q', r.read(8))[0]
        if flags & 0x100:
            if ubulk is None: ubulk = pak.read(base + '.ubulk')
            data = ubulk[off:off + size]
        elif flags & 0x1:
            data = None
        else:
            data = r.read(size)
        mw, mh, _ = r.i32(), r.i32(), r.i32()
        mips.append((mw, mh, data))
    cand = [m for m in mips if m[2] and m[0] >= want] or [m for m in mips if m[2]]
    mw, mh, data = min(cand, key=lambda m: m[0]) if cand else (None, None, None)
    if data is None: raise ValueError('no mip')
    if fmt == 'PF_R8G8B8A8':
        img = Image.frombytes('RGBA', (mw, mh), data)
    elif fmt == 'PF_G8':
        img = Image.frombytes('L', (mw, mh), data)
    else:
        img = Image.open(io.BytesIO(dds(fmt, mw, mh, data)))
        img.load()
    return img.convert('RGBA'), fmt
