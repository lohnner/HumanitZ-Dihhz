"""Mede o desvio entre as coordenadas do jogo e a imagem do mapa: objetos colocados devem cair em prédios/asfalto (cinza)."""
import json
import numpy as np
from PIL import Image, ImageDraw

img = np.asarray(Image.open('fullmap.png').convert('RGB'), np.float32)
# "construído": pixel pouco saturado e não escuro (telhado/asfalto); vegetação é verde e água é azul
sat = img.max(2) - img.min(2)
built = ((sat < 28) & (img.mean(2) > 60)).astype(np.float32)
print('fração construída', built.mean())
M = json.load(open('mesh_positions.json'))
X = np.array([m[1] for m in M], float); Y = np.array([m[2] for m in M], float)
S0 = 403200.0
def score(sc, dx, dy):
    u = ((Y + S0) / S0 * 4096 * sc + dx).astype(int); v = ((S0 - X) / S0 * 4096 * sc + dy).astype(int)
    ok = (u >= 0) & (u < 4096) & (v >= 0) & (v < 4096)
    return built[v[ok], u[ok]].mean()
print('sem ajuste', round(float(score(1, 0, 0)), 4))
best = (0,)
for sc in np.arange(0.97, 1.0301, 0.002):
    for dx in range(-60, 61, 4):
        for dy in range(-60, 61, 4):
            s = score(sc, dx, dy)
            if s > best[0]: best = (float(s), round(float(sc), 4), dx, dy)
print('melhor grosso', best)
_, sc0, dx0, dy0 = best
for sc in np.arange(sc0 - 0.003, sc0 + 0.0031, 0.0005):
    for dx in range(dx0 - 6, dx0 + 7):
        for dy in range(dy0 - 6, dy0 + 7):
            s = score(sc, dx, dy)
            if s > best[0]: best = (float(s), round(float(sc), 5), dx, dy)
print('melhor fino', best)
json.dump({'scale': best[1], 'dx': best[2], 'dy': best[3]}, open('calib.json', 'w'))
# recorte de Rossville: vermelho = sem ajuste, ciano = com ajuste
c = (1600, 1500, 2300, 2200)
im = Image.open('fullmap.png').convert('RGB').crop(c).resize((1400, 1400), Image.LANCZOS)
d = ImageDraw.Draw(im)
for m in M:
    u0 = (m[2] + S0) / S0 * 4096; v0 = (S0 - m[1]) / S0 * 4096
    u1 = u0 * best[1] + best[2]; v1 = v0 * best[1] + best[3]
    for (u, v, col) in ((u0, v0, (255, 40, 40)), (u1, v1, (0, 240, 255))):
        if c[0] <= u < c[2] and c[1] <= v < c[3]:
            a, b = (u - c[0]) * 2, (v - c[1]) * 2
            d.ellipse((a - 1, b - 1, a + 1, b + 1), fill=col)
im.save('calib_check.png')
