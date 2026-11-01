"""Guia de Sobrevivência (HZ_*), objetivos iniciais (DT_MiniQuest), dicas e pontos de início -> js/guide.js + img/guide/*.webp"""
import json, os, re
from pak import Pak
from extra import load, read_locres
from tex import load_icon

OUT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(OUT, 'img', 'guide')
os.makedirs(IMG, exist_ok=True)
p = Pak()
C = 'HumanitZ/Content/'
G = C + 'TSS_Game/UI/New_UI/Guide/'
# Mesma ordem de leitura de um jogador novo: sobreviver primeiro, sistemas depois
PAGES = [('Intro', 'Introdução', 'Introduction'), ('Vitals', 'Sinais vitais', 'Vitals'), ('Inventory', 'Inventário', 'Inventory'), ('Looting', 'Saque', 'Looting'),
         ('Resources', 'Recursos', 'Resources'), ('Crafting', 'Fabricação', 'Crafting'), ('Building', 'Construção', 'Building'), ('Farming', 'Plantio', 'Farming'),
         ('Fishing', 'Pesca', 'Fishing'), ('Combat', 'Combate', 'Combat'), ('Vehicles', 'Veículos', 'Vehicles'), ('TipsInfo', 'Dicas de sobrevivência', 'Survival tips')]

loc = {lang: read_locres(p.read(f'{C}Localization/Game/{lang}/Game.locres')) for lang in ('pt-BR', 'en')}
def txt(t):
    if not t: return {'en': '', 'pt': ''}
    if isinstance(t, str): return {'en': t, 'pt': t}
    if 'src' not in t: return {'en': '', 'pt': ''}
    k = (t['ns'], t['key'])
    en = loc['en'].get(k, t['src']); pt = loc['pt-BR'].get(k, en)
    return {'en': en.replace('\r', '').strip(), 'pt': pt.replace('\r', '').strip()}

textures = {}
for f in sorted(p.files):
    if f.startswith(C) and f.endswith('.uasset'):
        n = f.split('/')[-1][:-7]
        # prefere a arte do próprio guia quando há nomes repetidos
        if n not in textures or '/Guide/' in f or '/HowTo/' in f: textures[n] = f[:-7]
def picture(name):
    if name not in textures: print('sem textura', name); return None
    target = os.path.join(IMG, name + '.webp')
    if not os.path.exists(target):
        try:
            img, _ = load_icon(p, textures[name], 640)
        except Exception as ex:
            print('imagem falhou', name, ex); return None
        if img.size[0] > 640: img = img.resize((640, 640 * img.size[1] // img.size[0]))
        img.save(target, 'WEBP', quality=80, method=6)
    return 'img/guide/' + name + '.webp'

def walk(path):
    """Percorre a árvore do widget na ordem em que o jogo exibe"""
    k = load(p, path)
    ex = {e['name']: (i, k.ref(e['cls']) or '') for i, e in enumerate(k.exports)}
    def props(n): return k.export_props(ex[n][0])[0]
    root = next((props(n).get('RootWidget') for n, (_, c) in ex.items() if c == 'WidgetTree'), None)
    out = []
    def go(n):
        if not n or n not in ex: return
        d, c = props(n), ex[n][1]
        if c == 'TextBlock':
            t = txt(d.get('Text'))
            if t['en']: out.append({'t': t})
        elif c == 'Image':
            r = (d.get('Brush') or {}).get('ResourceObject')
            src = picture(r) if r else None
            if src: out.append({'i': src})
        for s in d.get('Slots') or []:
            go(props(s).get('Content'))
    go(root)
    return out

pages = [{'id': pid, 'name': {'pt': pt, 'en': en}, 'blocks': walk(G + 'HZ_' + pid)} for pid, pt, en in PAGES]

# ---------- objetivos iniciais, na ordem de NextQuest ----------
_, rows = load(p, C + 'TSS_Game/KaiWorldEffects/HintSystem/DT_MiniQuest').datatable()
targets = {r.get('NextQuest') for r in rows.values()}
start = next(k for k in rows if k not in targets)
steps, seen, cur = [], set(), start
while cur in rows and cur not in seen and cur != 'Done':
    seen.add(cur)
    r = rows[cur]
    xp, sp = r.get('XP') or 0, r.get('SkillPoint') or 0
    # A Fogueira tem 150 em SkillPoint e 0 em XP; os demais dão no máximo 3 pontos: é XP no campo errado
    if sp >= 100 and not xp: xp, sp = sp, 0
    steps.append({'id': cur, 'name': txt(r.get('Name')), 'text': [txt(x.get('Text')) for x in r.get('TextArr') or []],
                  'need': [{'name': txt(x.get('Name')), 'n': x.get('Count', 1)} for x in r.get('Required') or []], 'xp': xp, 'sp': sp})
    cur = r.get('NextQuest')

_, rows = load(p, C + 'TSS_Game/Data/Localization/DT_LoadingTips').datatable()
tips = [txt(r.get('Tip')) for r in rows.values()]
_, rows = load(p, C + 'TSS_Game/UI/CharacterCreator/SpawnSelection/DT_SpawnLocation').datatable()
spawns = [{'name': txt(r.get('Name')), 'desc': txt(r.get('Description'))} for rid, r in rows.items() if rid not in ('Respawn', 'Community')]

with open(os.path.join(OUT, 'js', 'guide.js'), 'w', encoding='utf-8', newline='\n') as fh:
    fh.write('// Gerado automaticamente: Guia de Sobrevivência, objetivos iniciais, dicas e pontos de início\n')
    fh.write('window.HZ_DATA.guide = ')
    json.dump({'pages': pages, 'steps': steps, 'tips': tips, 'spawns': spawns}, fh, ensure_ascii=False, separators=(',', ':'))
    fh.write(';\n')
print('paginas', [(g['id'], len(g['blocks']), sum(1 for b in g['blocks'] if 'i' in b)) for g in pages])
print('passos', len(steps), 'de', start, [s['id'] for s in steps], 'xp', sum(s['xp'] for s in steps), 'sp', sum(s['sp'] for s in steps), [s['id'] for s in steps if s['sp']])
print('dicas', len(tips), 'spawns', [(s['name']['pt'], s['desc']['pt']) for s in spawns][:3], len(spawns))
print('sem pt', sum(1 for g in pages for b in g['blocks'] if 't' in b and b['t']['pt'] == b['t']['en']), 'de', sum(1 for g in pages for b in g['blocks'] if 't' in b))
s = open(os.path.join(OUT, 'js', 'mapdata.js'), encoding='utf-8').read()
print('cat spawn', re.findall(r'"id":"(\w+)","name":"Pontos de spawn"', s))
