import struct, zlib, io
from Crypto.Cipher import AES

PAK = r"C:\Program Files (x86)\Steam\steamapps\common\HumanitZ\HumanitZ\Content\Paks\pakchunk0-WindowsNoEditor.pak"
KEY = bytes.fromhex('321166CACD1E2BBEAC9794AAF468DE277001D2EF8F74A8D6B3CC6EDFE87945CA')
aes = AES.new(KEY, AES.MODE_ECB)

class R:
    def __init__(s, b): s.b = b; s.p = 0
    def read(s, n): v = s.b[s.p:s.p+n]; s.p += n; return v
    def u32(s): return struct.unpack('<I', s.read(4))[0]
    def i32(s): return struct.unpack('<i', s.read(4))[0]
    def u64(s): return struct.unpack('<Q', s.read(8))[0]
    def fstr(s):
        n = s.i32()
        if n == 0: return ''
        if n < 0: return s.read(-n*2).decode('utf-16-le')[:-1]
        return s.read(n)[:-1].decode('utf-8', 'replace')

def dec(b):
    return aes.decrypt(b + b'\0' * (-len(b) % 16))

class Pak:
    def __init__(self, path=PAK):
        self.f = open(path, 'rb')
        f = self.f
        f.seek(0, 2); size = f.tell()
        f.seek(size - 300); d = f.read()
        i = d.rfind(struct.pack('<I', 0x5A6F12E1))
        ver, off, sz = struct.unpack('<IQQ', d[i+4:i+24])
        f.seek(off); r = R(dec(f.read(sz)))
        self.mount = r.fstr()
        n = r.i32(); r.u64()
        if r.u32(): r.u64(); r.u64(); r.read(20)
        assert r.u32()
        fdoff, fdsz = r.u64(), r.u64(); r.read(20)
        esz = r.i32(); self.enc = r.read(esz)
        self.unenc_count = r.i32()
        f.seek(fdoff); fd = R(dec(f.read(fdsz)))
        self.files = {}
        for _ in range(fd.i32()):
            dname = fd.fstr()
            for _ in range(fd.i32()):
                fn = fd.fstr(); loc = fd.i32()
                self.files[(dname + fn).lstrip('/')] = loc

    def entry(self, loc):
        r = R(self.enc); r.p = loc
        v = r.u32()
        bs = v & 0x3f
        bs = r.u32() if bs == 0x3f else bs << 11
        cm = (v >> 23) & 0x3f
        encrypted = bool(v & (1 << 22))
        nb = (v >> 6) & 0xffff
        off = r.u32() if v & (1 << 31) else r.u64()
        usz = r.u32() if v & (1 << 30) else r.u64()
        csz = (r.u32() if v & (1 << 29) else r.u64()) if cm else usz
        hdr = 53 + (4 + nb * 16 if cm else 0)
        blocks = []
        if nb == 1 and not encrypted:
            blocks = [(hdr, hdr + csz)]
        else:
            st = hdr
            for _ in range(nb):
                b = r.u32(); blocks.append((st, st + b))
                st += b + ((-b % 16) if encrypted else 0)
        return dict(off=off, usz=usz, csz=csz, cm=cm, enc=encrypted, blocks=blocks)

    def read(self, name):
        e = self.entry(self.files[name])
        f = self.f
        if not e['cm']:
            f.seek(e['off'] + 53)
            n = e['usz']
            raw = f.read(n + (-n % 16 if e['enc'] else 0))
            return (aes.decrypt(raw) if e['enc'] else raw)[:n]
        out = []
        for a, b in e['blocks']:
            f.seek(e['off'] + a)
            n = b - a
            raw = f.read(n + (-n % 16 if e['enc'] else 0))
            if e['enc']: raw = aes.decrypt(raw)
            out.append(zlib.decompress(raw[:n]))
        return b''.join(out)
