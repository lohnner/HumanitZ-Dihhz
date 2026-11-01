"""Status das armas (blueprints ligados pelo ActorClass de DT_ItemDatabase) -> js/weapons.js"""
import json, os
from pak import Pak
from extra import load, read_enum

OUT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
p = Pak()
C = 'HumanitZ/Content/'
# Não são armas de combate, embora herdem de BP_WeaponBase
SKIP = {'TestBaseRangedWeapon', 'FishingRod', 'ImproFishingRod', 'FlashLight', 'SprayCan', 'Binos'}
# O dano destes não fica no campo Damage (vale 1): vem de explosão ou efeito
LAUNCHERS = 'BPC_WeaponGrenadeLauncher'

files = {}
for f in p.files:
    if f.startswith(C) and f.endswith('.uasset'):
        files.setdefault(f.split('/')[-1][:-7].lower(), f[:-7])

holdable_type = read_enum(p, files['enum_holdabletype'])
holdable_sub = read_enum(p, files['enum_holdablesubtype'])

cache = {}
def chain(bp):
    """Propriedades herdadas (o filho sobrescreve a base) e a linhagem de classes"""
    key = bp.lower()
    if key in cache: return cache[key]
    if key not in files: return {}, []
    k = load(p, files[key])
    own, parent = {}, None
    for i, e in enumerate(k.exports):
        if e['name'].startswith('Default__'): own = k.export_props(i)[0]
        elif (k.ref(e['cls']) or '').endswith('GeneratedClass'): parent = k.ref(e['sup'])
    base, lin = chain(parent[:-2]) if parent and parent.endswith('_C') else ({}, [])
    cache[key] = ({**base, **own}, lin + [bp])
    return cache[key]

def kind(it, pr, lin):
    if pr.get('Throwable'): return 'thrown'
    if pr.get('IsMelee'): return 'melee'
    if 'BP_MasterWeaponBow' in lin: return 'bow'
    if LAUNCHERS in lin or not pr.get('AmmoType'): return 'special'
    if pr.get('IsShotgun?'): return 'shotgun'
    return 'pistol' if it.endswith('NewEnumerator3') else 'rifle'

def row(pr, k):
    dmg = pr.get('Damage')
    w = {'k': k, 'dmg': dmg if dmg and dmg > 1 else None, 'dur': pr.get('DurabilityLoss'), 'maxDur': pr.get('MaxDurability'), 'bld': pr.get('BuildingDamage')}
    if k == 'melee':
        # Classe real da arma: o construction script de BPC_WeaponMelee define Classification a partir destes dois
        # enums (padrão: Light e Bladed), e é ela que as skills consultam. O valor salvo em Classification é ignorado.
        w.update(stam=pr.get('StaminaPerAttack'), hs=pr.get('HeadShotChance'), res=pr.get('DamageToResourceActor'), harvest=bool(pr.get('CanHarvestResources')),
                 weight=holdable_type.get(pr.get('HoldableType'), 'Light'), edge=holdable_sub.get(pr.get('HoldableSubType'), 'Bladed'))
    elif k != 'thrown':
        alt = [a for a in pr.get('OtherAmmoTypes') or [] if a != 'None']
        w.update(pellets=1 + (pr.get('AdditionalProjectilesToFire') or 0), mag=pr.get('AmmoMax'), auto=bool(pr.get('Automatic')),
                 fr=pr.get('Firerate'), delay=pr.get('DelayBetweenShots'), range=pr.get('WeaponTraceLen'),
                 noise=pr.get('GunNoiseDistance'), noiseSup=pr.get('GunNoiseDistance_Suppressed'),
                 ammo=pr.get('AmmoType'), ammoAlt=alt)
    return w

_, rows = load(p, C + 'TSS_Game/Data/Localization/DT_ItemDatabase').datatable()
out = {}
for rid, r in rows.items():
    ac = r.get('ActorClass') or ''
    if '/Weapons/' not in ac or rid in SKIP: continue
    pr, lin = chain(ac.split('/')[-1].split('.')[0])
    if 'Damage' not in pr: print('sem status:', rid); continue
    out[rid] = row(pr, kind(r.get('Type', ''), pr, lin))

# Linhas só das tabelas de loot, com outra grafia do mesmo item
for alias, rid in {'Crowbar': 'CrowBar', 'BaseBallBat': 'BaseballBat'}.items():
    out[alias] = out[rid]

with open(os.path.join(OUT, 'js', 'weapons.js'), 'w', encoding='utf-8', newline='\n') as fh:
    fh.write('// Gerado automaticamente: status das armas (blueprints do jogo)\n')
    fh.write('window.HZ_DATA.weapons = ')
    json.dump(out, fh, ensure_ascii=False, separators=(',', ':'))
    fh.write(';\n')
n = {}
for w in out.values(): n[w['k']] = n.get(w['k'], 0) + 1
print('armas', len(out), n)
