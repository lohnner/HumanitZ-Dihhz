// Mapa interativo leve: tiles de imagem + pontos desenhados em um único <canvas>.
(() => {
  'use strict';

  const M = window.HZ_MAP;
  const LS_KEY = 'hz-map-cats';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  // categorias cujo nome aparece escrito no mapa ao aproximar (nível de zoom mínimo)
  const LABEL_AT = { regiao: 0, spawn: 2, posto: 2, bunker: 2, npcfixo: 2.6, amigavel: 3.2, basesobr: 2.4, missaop: 2.4, missao: 2.6, comercial: 3, comunidade: 3,
    restaurante: 3, leitura: 3, estrutura: 3, industrial: 3.4, amigavel: 3.4, esconderijo: 4, trancado: 4 };
  const GROUP_LABEL = { Lojas: 2.4, 'Comida e hospedagem': 2.8, 'Serviços e locais públicos': 3, Industrial: 3.4 };
  const DENSE = 120;   // categorias com muitos pontos viram bolinhas quando o mapa está afastado

  // ícone de cada categoria: círculo escuro, borda na cor da categoria e emoji no centro (pré-desenhado uma vez)
  const sprites = new Map();
  function sprite(c, px) {
    const dpr = window.devicePixelRatio || 1;
    const key = c.id + px + 'x' + dpr;
    let cv = sprites.get(key);
    if (cv) return cv;
    const n = Math.ceil(px * dpr);
    cv = document.createElement('canvas'); cv.width = cv.height = n;
    const g = cv.getContext('2d');
    g.scale(dpr, dpr);
    const r = px / 2;
    g.beginPath(); g.arc(r, r, r - 1.2, 0, Math.PI * 2);
    g.fillStyle = 'rgba(18,20,18,.92)'; g.fill();
    g.lineWidth = Math.max(1.8, px / 12); g.strokeStyle = c.color; g.stroke();
    g.font = `${Math.round(px * 0.56)}px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif`;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(c.icon || '•', r, r + px * 0.04);
    sprites.set(key, cv);
    return cv;
  }

  function loadEnabled() {
    const def = Object.fromEntries(M.cats.map(c => [c.id, c.on]));
    try { return Object.assign(def, JSON.parse(localStorage.getItem(LS_KEY) || '{}')); } catch (e) { return def; }
  }
  function saveEnabled(on) { try { localStorage.setItem(LS_KEY, JSON.stringify(on)); } catch (e) { } }

  function html() {
    const groups = {};
    for (const c of M.cats) (groups[c.group] = groups[c.group] || []).push(c);
    return `
      <div class="map-page">
        <aside class="map-side" id="mapSide">
          <div class="map-side-head">
            <h1>Mapa</h1>
            <button class="map-close" id="mapSideClose" aria-label="Fechar">✕</button>
          </div>
          <p class="muted map-intro">Mapa oficial do jogo com ${M.pts.length.toLocaleString('pt-BR')} pontos: prédios e objetos nas posições reais do jogo,
            com os nomes dos locais vindos do <a href="https://wand.com/pt/maps/humanitz/humanitz-world" target="_blank" rel="noopener">mapa da Wand</a>.</p>
          <div class="map-search">
            <input id="mapSearch" type="search" placeholder="Buscar local… (ex.: Rossville, bunker, farmácia)" autocomplete="off">
            <div id="mapResults" class="map-results" hidden></div>
          </div>
          <div class="map-focus-list" id="mapFocusList" hidden></div>
          <div class="map-bulk"><button id="mapAll">Mostrar tudo</button><button id="mapNone">Ocultar tudo</button></div>
          <div class="map-cats" id="mapCats">
            ${Object.entries(groups).map(([g, cs]) => `
              <details class="map-group" ${['Locais', 'Lojas'].includes(g) ? 'open' : ''}>
                <summary class="map-group-title"><input type="checkbox" data-group="${esc(g)}" aria-label="Ligar ou desligar ${esc(g)}">
                  <span>${esc(g)}</span><span class="map-cat-n">${cs.reduce((n, c) => n + c.n, 0)}</span></summary>
                ${cs.map(c => `<label class="map-cat" title="${esc(c.desc || '')}">
                  <input type="checkbox" data-cat="${c.id}">
                  <span class="map-ico" style="border-color:${c.color}">${c.icon ? esc(c.icon) : ''}</span>
                  <span class="map-cat-name">${esc(c.name)}</span><span class="map-cat-n">${c.n}</span></label>`).join('')}
              </details>`).join('')}
          </div>
        </aside>
        <div class="map-view" id="mapView" tabindex="0" aria-label="Mapa do jogo">
          <div class="map-tiles" id="mapTiles"></div>
          <canvas class="map-canvas" id="mapCanvas"></canvas>
          <div class="map-pop" id="mapPop" hidden></div>
          <button class="map-layers-btn" id="mapLayersBtn">☰ Camadas</button>
          <div class="map-focus" id="mapFocus" hidden></div>
          <div class="map-zoom">
            <button id="mapZoomIn" aria-label="Aproximar">+</button>
            <button id="mapZoomOut" aria-label="Afastar">−</button>
            <button id="mapReset" aria-label="Ver mapa inteiro">⤢</button>
          </div>
          <div class="map-coords" id="mapCoords"></div>
        </div>
      </div>`;
  }

  function mount(query) {
    const view = document.getElementById('mapView');
    const tilesEl = document.getElementById('mapTiles');
    const canvas = document.getElementById('mapCanvas');
    const ctx = canvas.getContext('2d');
    const pop = document.getElementById('mapPop');
    const side = document.getElementById('mapSide');
    const catColor = Object.fromEntries(M.cats.map(c => [c.id, c.color]));
    const catName = Object.fromEntries(M.cats.map(c => [c.id, c.name]));
    const catById = Object.fromEntries(M.cats.map(c => [c.id, c]));
    const icoHtml = id => `<span class="map-ico" style="border-color:${catColor[id]}">${esc(catById[id].icon || '')}</span>`;
    let iconPx = 22;
    // modo foco: #/mapa?tipo=ferragens mostra só esse tipo de local e aproxima neles
    let focus = String((query && query.tipo) || '').split(',').filter(id => catById[id]);
    // #/mapa?loot=INV_HardwareStore: mostra os locais exatos onde os contêineres dessa tabela estão
    const ALL = M.pts.slice();
    const lootRows = query && query.loot && window.HZ_LOOTPTS ? window.HZ_LOOTPTS[query.loot] : null;
    if (lootRows && lootRows.length) {
      const label = window.HZ_lootName ? window.HZ_lootName(query.loot) : query.loot;
      catById.lootfocus = { id: 'lootfocus', name: 'Onde aparece: ' + label, color: '#ffd84d', icon: '📦', group: '', n: lootRows.length };
      catColor.lootfocus = '#ffd84d'; catName.lootfocus = catById.lootfocus.name;
      const regs = M.pts.filter(p => p.c === 'regiao');
      lootRows.slice().sort((a, b) => b[2] - a[2]).forEach(([u, v, n, t]) => {
        const near = regs.reduce((best, r) => (r.u - u) ** 2 + (r.v - v) ** 2 < (best.u - u) ** 2 + (best.v - v) ** 2 ? r : best, regs[0]);
        ALL.push({ c: 'lootfocus', u, v, t: t || 'Local sem nome', i: n + (n === 1 ? ' contêiner' : ' contêineres') + ' com esse loot', a: near && near.t });
      });
      focus = ['lootfocus'];
    }
    // #/mapa?missao=ID: mostra quem entrega a missão, o objetivo e o local de entrega
    const quest = query && query.missao && window.HZ_DATA.quests ? window.HZ_DATA.quests.find(q => q.id === query.missao) : null;
    if (quest && quest.pins.length) {
      const title = (quest.title && quest.title.pt) || quest.id;
      catById.questfocus = { id: 'questfocus', name: 'Missão: ' + title, color: '#ffd84d', icon: '❗', group: '', n: quest.pins.length };
      catColor.questfocus = '#ffd84d'; catName.questfocus = catById.questfocus.name;
      const QPIN = { giver: 'Quem entrega', goal: 'Objetivo', turnin: 'Entrega da missão' };
      const regs = M.pts.filter(p => p.c === 'regiao');
      quest.pins.forEach(({ k, u, v, t }) => {
        const near = regs.reduce((best, r) => (r.u - u) ** 2 + (r.v - v) ** 2 < (best.u - u) ** 2 + (best.v - v) ** 2 ? r : best, regs[0]);
        ALL.push({ c: 'questfocus', u, v, t: t || QPIN[k], i: QPIN[k], a: near && near.t });
      });
      focus = ['questfocus'];
    }
    // #/mapa?grupo=horda:Zumbis: Corredores: mostra só os pontos com esse título dentro de uma categoria
    const groupKey = query && query.grupo ? String(query.grupo) : '';
    const groupCat = groupKey.slice(0, groupKey.indexOf(':')), groupTitle = groupKey.slice(groupKey.indexOf(':') + 1);
    let groupRows = groupCat ? M.pts.filter(p => p.c === groupCat && p.t === groupTitle) : [];
    let groupSource = groupCat, groupLabel = groupTitle;
    // #/mapa?recruta=Ed,Magnus: pontos de recrutamento onde essa pessoa pode aparecer
    if (query && query.recruta) {
      const classes = String(query.recruta).split(',').filter(c => /^\w+$/.test(c));
      const rx = classes.length ? new RegExp(`\\b(${classes.join('|')})\\b`) : null;
      groupRows = rx ? M.pts.filter(p => p.c === 'sobrevivente' && rx.test(p.i || '')) : [];
      groupSource = 'sobrevivente'; groupLabel = 'Onde pode aparecer: ' + classes[classes.length - 1];
    }
    if (groupRows.length) {
      const icon = catById[groupSource].icon;
      catById.groupfocus = { id: 'groupfocus', name: groupLabel, color: catColor[groupSource], icon, group: '', n: groupRows.length };
      catColor.groupfocus = catColor[groupSource]; catName.groupfocus = groupLabel;
      groupRows.forEach(p => ALL.push({ ...p, c: 'groupfocus' }));
      focus = ['groupfocus'];
    }
    const isFocus = id => focus.includes(id);
    let on = loadEnabled();

    // estado da câmera: s = tamanho do mapa em px de tela; ox/oy = posição do canto do mapa
    let W = 0, H = 0, s = 0, ox = 0, oy = 0, minS = 0;
    const maxS = M.size * 4;
    let selected = null, frame = 0;
    const tiles = new Map();

    function fit() {
      W = view.clientWidth; H = view.clientHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      minS = Math.min(W, H) * 0.95;
    }
    function reset() {
      s = minS; ox = (W - s) / 2; oy = (H - s) / 2; draw();
    }
    function fitFocus() {
      const pts = ALL.filter(p => isFocus(p.c));
      if (!pts.length) return reset();
      const us = pts.map(p => p.u), vs = pts.map(p => p.v);
      const u0 = Math.min(...us), u1 = Math.max(...us), v0 = Math.min(...vs), v1 = Math.max(...vs);
      const pad = 0.1;
      s = Math.max(minS, Math.min(M.size * 1.2, Math.min(W / (u1 - u0 + pad), H / (v1 - v0 + pad))));
      ox = W / 2 - (u0 + u1) / 2 * s; oy = H / 2 - (v0 + v1) / 2 * s; draw();
    }
    const home = () => focus.length ? fitFocus() : reset();
    function clamp() {
      s = Math.max(minS, Math.min(maxS, s));
      const m = 80;
      ox = Math.min(W - m, Math.max(m - s, ox));
      oy = Math.min(H - m, Math.max(m - s, oy));
    }
    function zoomAt(f, cx, cy) {
      const ns = Math.max(minS, Math.min(maxS, s * f));
      ox = cx - (cx - ox) * ns / s; oy = cy - (cy - oy) * ns / s; s = ns;
      draw();
    }
    function flyTo(u, v, targetS) {
      s = Math.max(minS, Math.min(maxS, targetS || Math.max(s, M.size * 1.2)));
      ox = W / 2 - u * s; oy = H / 2 - v * s; draw();
    }
    const draw = () => { if (!frame) frame = requestAnimationFrame(render); };

    // ---------- tiles ----------
    function renderTiles() {
      const z = Math.max(0, Math.min(M.zmax, Math.ceil(Math.log2(s / M.tile))));
      const n = 2 ** z, ts = s / n;
      const x0 = Math.max(0, Math.floor(-ox / ts)), x1 = Math.min(n - 1, Math.floor((W - ox) / ts));
      const y0 = Math.max(0, Math.floor(-oy / ts)), y1 = Math.min(n - 1, Math.floor((H - oy) / ts));
      const keep = new Set();
      // nível de baixo (z-1) fica por trás enquanto o detalhe carrega, para não piscar
      for (const zz of z > 0 ? [z - 1, z] : [z]) {
        const nn = 2 ** zz, tts = s / nn;
        const a0 = Math.max(0, Math.floor(-ox / tts)), a1 = Math.min(nn - 1, Math.floor((W - ox) / tts));
        const b0 = Math.max(0, Math.floor(-oy / tts)), b1 = Math.min(nn - 1, Math.floor((H - oy) / tts));
        for (let x = a0; x <= a1; x++) for (let y = b0; y <= b1; y++) {
          const key = `${zz}/${x}_${y}`;
          keep.add(key);
          let im = tiles.get(key);
          if (!im) {
            im = new Image(); im.decoding = 'async'; im.draggable = false; im.alt = '';
            im.className = 'map-tile z' + (zz === z ? 'top' : 'low');
            im.onload = () => im.classList.add('ok');
            im.src = `img/map/${key}.webp`;
            tiles.set(key, im); tilesEl.appendChild(im);
          }
          im.style.zIndex = zz === z ? 2 : 1;
          // +0.5px evita linhas finas entre tiles
          im.style.transform = `translate3d(${ox + x * tts}px, ${oy + y * tts}px, 0)`;
          im.style.width = im.style.height = (tts + 0.5) + 'px';
        }
      }
      for (const [key, im] of tiles) if (!keep.has(key)) { im.remove(); tiles.delete(key); }
      void x0; void x1; void y0; void y1;
    }

    // ---------- pontos ----------
    const zoomLevel = () => Math.log2(s / minS);   // 0 = mapa inteiro
    function render() {
      frame = 0;
      clamp();
      renderTiles();
      ctx.clearRect(0, 0, W, H);
      const zl = zoomLevel();
      iconPx = zl < 0.8 ? 18 : zl < 1.8 ? 22 : zl < 2.8 ? 26 : 30;
      const dotR = zl < 1 ? 2.6 : 3.4;
      const labels = [];
      const icons = [];
      for (const p of ALL) {
        if (!on[p.c]) continue;
        const x = ox + p.u * s, y = oy + p.v * s;
        if (p.r) {   // área (zona radioativa)
          const rr = Math.max(6, p.r * s);
          if (x < -rr || y < -rr || x > W + rr || y > H + rr) continue;
          ctx.beginPath(); ctx.arc(x, y, rr, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(155,226,45,.18)'; ctx.fill();
          ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(155,226,45,.9)'; ctx.stroke();
        }
        if (x < -20 || y < -20 || x > W + 20 || y > H + 20) continue;
        if (p.c === 'regiao') { labels.push([p, x, y]); continue; }
        const c = catById[p.c];
        if (c.n > DENSE && zl < 1.6 && p !== selected) {
          // muitos pontos e mapa afastado: bolinha leve (o ícone aparece ao aproximar)
          ctx.beginPath(); ctx.arc(x, y, dotR, 0, Math.PI * 2);
          ctx.fillStyle = c.color; ctx.fill();
          ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(0,0,0,.7)'; ctx.stroke();
        } else {
          icons.push([p, x, y]);
        }
        const la = LABEL_AT[p.c] !== undefined ? LABEL_AT[p.c] : GROUP_LABEL[c.group];
        if (isFocus(p.c) || (la !== undefined && zl >= la)) labels.push([p, x, y]);
      }
      // ícones por cima das bolinhas; o selecionado por último e maior
      for (const [p, x, y] of icons) {
        if (p === selected) continue;
        const img = sprite(catById[p.c], iconPx);
        ctx.drawImage(img, x - iconPx / 2, y - iconPx / 2, iconPx, iconPx);
      }
      if (selected && on[selected.c] && selected.c !== 'regiao') {
        const x = ox + selected.u * s, y = oy + selected.v * s, sz = iconPx + 12;
        ctx.beginPath(); ctx.arc(x, y, sz / 2 + 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fill();
        ctx.drawImage(sprite(catById[selected.c], sz), x - sz / 2, y - sz / 2, sz, sz);
      }
      // rótulos com detecção simples de sobreposição (evita a "sopa de nomes")
      const boxes = [];
      ctx.textBaseline = 'middle';
      if (focus.length) {
        // no modo foco, os locais procurados têm prioridade sobre os nomes das regiões
        for (const [, x, y] of icons) boxes.push([x - iconPx / 2, y - iconPx / 2, iconPx, iconPx]);
        labels.sort((a, b) => (a[0].c === 'regiao' ? 1 : 0) - (b[0].c === 'regiao' ? 1 : 0));
      } else {
        labels.sort((a, b) => (a[0].c === 'regiao' ? -1 : 0) - (b[0].c === 'regiao' ? -1 : 0));
      }
      for (const [p, x, y] of labels) {
        const big = p.c === 'regiao';
        ctx.font = big ? '700 14px "Segoe UI", system-ui, sans-serif' : '600 12px "Segoe UI", system-ui, sans-serif';
        const text = big ? p.t.toUpperCase() : p.t;
        const w = ctx.measureText(text).width;
        const bx = big ? x - w / 2 : x + iconPx / 2 + 4, by = y - 9, bw = w, bh = 18;
        if (boxes.some(b => bx < b[0] + b[2] && bx + bw > b[0] && by < b[1] + b[3] && by + bh > b[1])) continue;
        boxes.push([bx - 3, by, bw + 6, bh]);
        ctx.lineWidth = 3.5; ctx.strokeStyle = 'rgba(10,12,10,.9)'; ctx.lineJoin = 'round';
        ctx.strokeText(text, bx, y);
        ctx.fillStyle = big ? '#f6ecd0' : '#fff';
        ctx.fillText(text, bx, y);
      }
      placePop();
    }

    // ---------- popup ----------
    function placePop() {
      if (!selected) { pop.hidden = true; return; }
      const x = ox + selected.u * s, y = oy + selected.v * s;
      if (x < 0 || y < 0 || x > W || y > H) { pop.style.visibility = 'hidden'; return; }
      pop.style.visibility = 'visible';
      pop.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
      pop.classList.toggle('below', y < 240);     // perto do topo: abre para baixo
      pop.classList.toggle('left', x > W - 260);  // perto da direita: abre para a esquerda
    }
    // tabelas de loot ligadas a este tipo de local
    function lootLinks(cid) {
      const tabs = Object.entries(M.lootMap || {}).filter(([, ids]) => ids.includes(cid)).map(([t]) => t);
      if (!tabs.length || !window.HZ_lootName) return '';
      return `<div class="map-pop-loot">O que tem aqui: ${tabs.map(t => `<a href="#/local/${t}">${esc(window.HZ_lootName(t))}</a>`).join(', ')}</div>`;
    }
    function select(p) {
      selected = p;
      if (!p) { pop.hidden = true; draw(); return; }
      const km = (v) => (v * 4.032).toFixed(2);
      pop.innerHTML = `<div class="map-pop-in">${icoHtml(p.c)}
        <div><b>${esc(p.t)}</b><div class="muted">${esc(catName[p.c])}${p.a ? ' · perto de ' + esc(p.a) : ''}</div>${p.i ? `<div>${esc(p.i)}</div>` : ''}
        ${p.f ? `<details class="map-pop-names"><summary>Nomes possíveis (${(M.fighterNames || []).length})</summary>${esc((M.fighterNames || []).join(', '))}</details>` : ''}
        ${lootLinks(p.c)}
        <div class="map-pop-coord">X ${km(p.u)} km · Y ${km(p.v)} km</div></div>
        <button class="map-pop-x" aria-label="Fechar">✕</button></div>`;
      pop.hidden = false;
      pop.querySelector('.map-pop-x').onclick = (e) => { e.stopPropagation(); select(null); };
      draw();
    }
    function hit(cx, cy) {
      let best = null, bd = (iconPx / 2 + 4) ** 2;
      for (const p of ALL) {
        if (!on[p.c]) continue;
        const dx = ox + p.u * s - cx, dy = oy + p.v * s - cy, d = dx * dx + dy * dy;
        if (d < bd) { bd = d; best = p; }
      }
      if (!best) {   // clique dentro de zona radioativa
        for (const p of ALL) if (p.r && on[p.c]) {
          const dx = ox + p.u * s - cx, dy = oy + p.v * s - cy;
          if (dx * dx + dy * dy < (p.r * s) ** 2) return p;
        }
      }
      return best;
    }

    // ---------- interação (mouse, toque, pinça) ----------
    const ptrs = new Map();
    let moved = false, pinch = null;
    view.addEventListener('pointerdown', e => {
      if (e.target.closest('.map-pop, .map-zoom, .map-layers-btn')) return;
      view.setPointerCapture(e.pointerId);
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      moved = false;
      if (ptrs.size === 2) {
        const [a, b] = [...ptrs.values()];
        pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) };
      }
    });
    view.addEventListener('pointermove', e => {
      const rect = view.getBoundingClientRect();
      const prev = ptrs.get(e.pointerId);
      if (!prev) {
        const u = (e.clientX - rect.left - ox) / s, v = (e.clientY - rect.top - oy) / s;
        coords.textContent = u >= 0 && u <= 1 && v >= 0 && v <= 1 ? `X ${(u * 4.032).toFixed(2)} km · Y ${(v * 4.032).toFixed(2)} km` : '';
        view.style.cursor = hit(e.clientX - rect.left, e.clientY - rect.top) ? 'pointer' : 'grab';
        return;
      }
      const cur = { x: e.clientX, y: e.clientY };
      if (ptrs.size === 2 && pinch) {
        ptrs.set(e.pointerId, cur);
        const [a, b] = [...ptrs.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        zoomAt(d / pinch.d, (a.x + b.x) / 2 - rect.left, (a.y + b.y) / 2 - rect.top);
        pinch.d = d; moved = true;
        return;
      }
      const dx = cur.x - prev.x, dy = cur.y - prev.y;
      if (Math.abs(dx) + Math.abs(dy) > 2) moved = true;
      ox += dx; oy += dy; ptrs.set(e.pointerId, cur);
      view.style.cursor = 'grabbing';
      draw();
    });
    const up = e => {
      const had = ptrs.has(e.pointerId);
      ptrs.delete(e.pointerId);
      if (ptrs.size < 2) pinch = null;
      view.style.cursor = 'grab';
      if (had && !moved && e.type === 'pointerup') {
        const rect = view.getBoundingClientRect();
        select(hit(e.clientX - rect.left, e.clientY - rect.top));
      }
    };
    view.addEventListener('pointerup', up);
    view.addEventListener('pointercancel', up);
    view.addEventListener('wheel', e => {
      e.preventDefault();
      const rect = view.getBoundingClientRect();
      zoomAt(Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0018)), e.clientX - rect.left, e.clientY - rect.top);
    }, { passive: false });
    view.addEventListener('dblclick', e => {
      const rect = view.getBoundingClientRect();
      zoomAt(2, e.clientX - rect.left, e.clientY - rect.top);
    });
    view.addEventListener('keydown', e => {
      const k = { ArrowLeft: [60, 0], ArrowRight: [-60, 0], ArrowUp: [0, 60], ArrowDown: [0, -60] }[e.key];
      if (k) { ox += k[0]; oy += k[1]; draw(); e.preventDefault(); }
      if (e.key === '+' || e.key === '=') zoomAt(1.4, W / 2, H / 2);
      if (e.key === '-') zoomAt(1 / 1.4, W / 2, H / 2);
      if (e.key === 'Escape') select(null);
    });
    const coords = document.getElementById('mapCoords');
    document.getElementById('mapZoomIn').onclick = () => zoomAt(1.6, W / 2, H / 2);
    document.getElementById('mapZoomOut').onclick = () => zoomAt(1 / 1.6, W / 2, H / 2);
    document.getElementById('mapReset').onclick = () => { select(null); reset(); };

    // ---------- camadas ----------
    const boxes = [...document.querySelectorAll('#mapCats input[data-cat]')];
    const groupBoxes = [...document.querySelectorAll('#mapCats input[data-group]')];
    const groupCats = g => M.cats.filter(c => c.group === g);
    const syncBoxes = () => {
      boxes.forEach(b => { b.checked = !!on[b.dataset.cat]; });
      groupBoxes.forEach(b => {
        const cs = groupCats(b.dataset.group), n = cs.filter(c => on[c.id]).length;
        b.checked = n === cs.length; b.indeterminate = n > 0 && n < cs.length;
      });
    };
    const persist = () => { if (!focus.length) saveEnabled(on); };
    syncBoxes();
    document.getElementById('mapCats').addEventListener('change', e => {
      const b = e.target.closest('input'); if (!b) return;
      if (b.dataset.group) groupCats(b.dataset.group).forEach(c => { on[c.id] = b.checked; });
      else on[b.dataset.cat] = b.checked;
      persist(); syncBoxes();
      if (selected && !on[selected.c]) select(null);
      draw();
    });
    document.getElementById('mapAll').onclick = () => { M.cats.forEach(c => on[c.id] = true); persist(); syncBoxes(); draw(); };
    document.getElementById('mapNone').onclick = () => { M.cats.forEach(c => on[c.id] = false); persist(); syncBoxes(); select(null); draw(); };

    // ---------- modo foco ----------
    const focusEl = document.getElementById('mapFocus'), focusList = document.getElementById('mapFocusList');
    function applyFocus() {
      if (!focus.length) { focusEl.hidden = true; focusList.hidden = true; return; }
      on = Object.fromEntries(M.cats.map(c => [c.id, isFocus(c.id) || c.id === 'regiao']));
      if (catById.lootfocus) on.lootfocus = true;
      if (catById.questfocus) on.questfocus = true;
      if (catById.groupfocus) on.groupfocus = true;
      syncBoxes();
      const pts = ALL.filter(p => isFocus(p.c));
      const names = focus.map(id => catById[id].name).join(' e ');
      focusEl.innerHTML = `${icoHtml(focus[0])}<b>${esc(names)}</b><span class="muted">${pts.length} ${pts.length === 1 ? 'local' : 'locais'}</span>
        <button id="mapFocusClear">✕ Ver todos os locais</button>`;
      focusEl.hidden = false;
      focusList.innerHTML = `<div class="map-group-title">Onde encontrar</div>` + pts.map(p => `<button data-i="${ALL.indexOf(p)}">${icoHtml(p.c)}
        <span>${esc(p.t)}<small>${p.c === 'lootfocus' || p.c === 'questfocus' ? esc(p.i) + ' · ' : ''}${p.a ? 'perto de ' + esc(p.a) : ''}</small></span></button>`).join('');
      focusList.hidden = false;
      document.getElementById('mapFocusClear').onclick = () => {
        focus = []; on = loadEnabled(); syncBoxes(); applyFocus(); select(null);
        history.replaceState(null, '', '#/mapa'); reset();
      };
    }
    focusList.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      const p = ALL[+b.dataset.i];
      flyTo(p.u, p.v, M.size * 1.5); select(p); side.classList.remove('open');
    });
    applyFocus();
    document.getElementById('mapLayersBtn').onclick = () => side.classList.toggle('open');
    document.getElementById('mapSideClose').onclick = () => side.classList.remove('open');

    // ---------- busca ----------
    const sIn = document.getElementById('mapSearch'), sOut = document.getElementById('mapResults');
    sIn.addEventListener('input', () => {
      const q = norm(sIn.value).trim();
      if (!q) { sOut.hidden = true; return; }
      const fighterHit = (M.fighterNames || []).some(n => norm(n) === q);   // ex.: "ava" acha os NPCs de nome sorteado
      const r = ALL.filter(p => norm(p.t).includes(q) || norm(catName[p.c]).includes(q) || norm(p.a).includes(q) || (fighterHit && p.f))
        .sort((a, b) => (norm(b.t).startsWith(q) ? 1 : 0) - (norm(a.t).startsWith(q) ? 1 : 0) || (a.c === 'regiao' ? -1 : 0) - (b.c === 'regiao' ? -1 : 0))
        .slice(0, 40);
      sOut.innerHTML = r.length ? r.map(p => `<button data-i="${ALL.indexOf(p)}">${icoHtml(p.c)}
          <span>${esc(p.t)}<small>${esc(catName[p.c])}${p.a ? ' · perto de ' + esc(p.a) : ''}</small></span></button>`).join('') : '<div class="muted" style="padding:8px">Nada encontrado.</div>';
      sOut.hidden = false;
    });
    sOut.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      const p = ALL[+b.dataset.i];
      if (!on[p.c]) { on[p.c] = true; persist(); syncBoxes(); }
      flyTo(p.u, p.v, M.size * 1.5); select(p);
      sOut.hidden = true; side.classList.remove('open');
    });

    const ro = new ResizeObserver(() => { const keep = s && s > minS; fit(); if (!keep) home(); else draw(); });
    ro.observe(view);
    fit(); home();
    return () => { ro.disconnect(); if (frame) cancelAnimationFrame(frame); };
  }

  window.HZMapPage = { html, mount };
})();
