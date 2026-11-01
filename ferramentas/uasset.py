import struct, re
from pak import R

GUIDSUFFIX = re.compile(r'_\d+_[0-9A-F]{32}$')
def clean(n): return GUIDSUFFIX.sub('', n)

class Pkg:
    def __init__(self, ua, ue):
        r = R(ua)
        assert r.u32() == 0x9E2A83C1
        legacy = r.i32()
        if legacy != -4: r.i32()
        r.i32(); r.i32()
        for _ in range(r.i32()): r.read(20)
        self.header = r.i32(); r.fstr(); flags = r.u32()
        nc, no = r.i32(), r.i32()
        if not (flags & 0x80000000): r.fstr()
        r.i32(); r.i32()
        ec, eo, ic, io = r.i32(), r.i32(), r.i32(), r.i32()
        r.p = no; self.names = []
        for _ in range(nc): self.names.append(r.fstr()); r.read(4)
        r.p = io; self.imports = []
        for _ in range(ic):
            r.read(16); r.i32(); self.imports.append(self.fname_raw(r))
        r.p = eo; self.exports = []
        for _ in range(ec):
            cls = r.i32(); sup = r.i32(); r.i32(); outer = r.i32()
            name = self.fname_raw(r); r.u32()
            size, off = struct.unpack('<qq', r.read(16))
            r.read(12 + 16 + 4 + 8 + 20)
            self.exports.append(dict(cls=cls, sup=sup, outer=outer, name=name, size=size, off=off - self.header))
        self.ue = ue

    def fname_raw(self, r):
        i, n = r.i32(), r.i32()
        s = self.names[i]
        return s if n == 0 else f'{s}_{n-1}'

    def ref(self, idx):
        if idx < 0: return self.imports[-idx - 1]
        if idx > 0: return self.exports[idx - 1]['name']
        return None

    def fname(self, r): return self.fname_raw(r)

    # ---------- property parsing ----------
    def props(self, r):
        out = {}
        while True:
            name = self.fname(r)
            if name == 'None': return out
            typ = self.fname(r); size = r.i32(); r.i32()
            tag = {}
            if typ == 'StructProperty': tag['struct'] = self.fname(r); r.read(16)
            elif typ == 'BoolProperty': tag['bool'] = r.read(1)[0]
            elif typ in ('ByteProperty', 'EnumProperty'): tag['enum'] = self.fname(r)
            elif typ in ('ArrayProperty', 'SetProperty'): tag['inner'] = self.fname(r)
            elif typ == 'MapProperty': tag['key'] = self.fname(r); tag['val'] = self.fname(r)
            if r.read(1)[0]: r.read(16)
            start = r.p
            try:
                v = self.value(r, typ, tag, size)
            except Exception as e:
                v = f'<err {typ}: {e}>'
            r.p = start + size
            key = clean(name)
            if key in out:
                if not isinstance(out[key], list) or typ == 'ArrayProperty': out[key] = [out[key]]
                out[key].append(v)
            else:
                out[key] = v

    def text(self, r):
        r.u32(); h = struct.unpack('<b', r.read(1))[0]
        if h == -1:
            return r.fstr() if r.u32() else ''
        if h == 0:
            ns, key, src = r.fstr(), r.fstr(), r.fstr()
            return {'ns': ns, 'key': key, 'src': src}
        if h == 11:
            return {'table': self.fname(r), 'key': r.fstr()}
        return f'<text hist {h}>'

    def value(self, r, typ, tag, size, inner=False):
        if typ == 'BoolProperty': return bool(tag.get('bool')) if not inner else bool(r.read(1)[0])
        if typ == 'IntProperty': return r.i32()
        if typ == 'Int64Property': return struct.unpack('<q', r.read(8))[0]
        if typ == 'UInt64Property': return struct.unpack('<Q', r.read(8))[0]
        if typ == 'UInt32Property': return r.u32()
        if typ == 'FloatProperty': return round(struct.unpack('<f', r.read(4))[0], 4)
        if typ == 'DoubleProperty': return struct.unpack('<d', r.read(8))[0]
        if typ == 'NameProperty': return self.fname(r)
        if typ == 'StrProperty': return r.fstr()
        if typ == 'TextProperty': return self.text(r)
        if typ in ('ObjectProperty', 'ClassProperty', 'InterfaceProperty'): return self.ref(r.i32())
        if typ == 'SoftObjectProperty': p = self.fname(r); r.fstr(); return p
        if typ == 'EnumProperty': return self.fname(r)
        if typ == 'ByteProperty':
            if inner or tag.get('enum') == 'None' and size == 1: return r.read(1)[0]
            return self.fname(r)
        if typ == 'StructProperty': return self.struct(r, tag['struct'], size)
        if typ in ('ArrayProperty', 'SetProperty'):
            if typ == 'SetProperty': r.i32()
            n = r.i32(); it = tag['inner']
            if it == 'StructProperty':
                self.fname(r); self.fname(r); sz = r.i32(); r.i32(); sname = self.fname(r); r.read(16); r.read(1)
                return [self.struct(r, sname, None) for _ in range(n)]
            if it == 'ByteProperty' and n == size - 4:
                return list(r.read(n))
            if it == 'ByteProperty' and size is not None and n * 8 == size - 4:   # array de enum: nomes, não bytes
                return [self.fname(r) for _ in range(n)]
            return [self.value(r, it, {}, None, True) for _ in range(n)]
        if typ == 'MapProperty':
            r.i32(); n = r.i32(); res = {}
            for _ in range(n):
                k = self.value(r, tag['key'], {'struct': '?'}, None, True)
                v = self.value(r, tag['val'], {'struct': '?'}, None, True)
                res[str(k)] = v
            return res
        raise ValueError('unknown ' + typ)

    def struct(self, r, sname, size):
        if sname in ('Vector', 'Rotator'): return struct.unpack('<3f', r.read(12))
        if sname == 'Vector2D': return struct.unpack('<2f', r.read(8))
        if sname in ('LinearColor', 'Quat', 'Vector4'): return struct.unpack('<4f', r.read(16))
        if sname == 'Color': return list(r.read(4))
        if sname == 'IntPoint': return struct.unpack('<2i', r.read(8))
        if sname == 'Guid': return r.read(16).hex()
        if sname in ('DateTime', 'Timespan'): return struct.unpack('<q', r.read(8))[0]
        if sname == 'GameplayTagContainer': return [self.fname(r) for _ in range(r.i32())]
        if sname == 'GameplayTag':
            d = self.props(r)   # gravado como struct com a propriedade TagName
            return d.get('TagName')
        if sname in ('SoftObjectPath', 'SoftClassPath'): p = self.fname(r); r.fstr(); return p
        if sname == '?': return self.props(r)   # valor de mapa: struct com propriedades marcadas
        return self.props(r)

    def export_props(self, i):
        e = self.exports[i]
        r = R(self.ue); r.p = e['off']
        return self.props(r), r

    def datatable(self):
        for i, e in enumerate(self.exports):
            p, r = self.export_props(i)
            r.i32()
            rows = {}
            for _ in range(r.i32()):
                rn = self.fname(r)
                rows[rn] = self.props(r)
            return p, rows
