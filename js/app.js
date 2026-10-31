(() => {
  'use strict';

  const D = window.HZ_DATA;
  const app = document.getElementById('app');

  // ---------------------------------------------------------------------------
  // Traduções e rótulos
  // ---------------------------------------------------------------------------
  const TYPE_PT = {
    Melee: 'Arma branca', Pistol: 'Pistola', Rifle: 'Arma longa', Health: 'Medicina', Thirst: 'Bebida',
    Hunger: 'Comida', Stamina: 'Energia', Crafting: 'Material', Item: 'Utilidade', Vehicle: 'Peça de veículo',
    Ammo: 'Munição', Compass: 'Bússola', Building: 'Construção', Watch: 'Relógio', GunRepair: 'Reparo de arma',
    Clothing: 'Roupa', Armour: 'Vestuário / Armadura', Battery: 'Bateria', Jack: 'Ferramenta de carro',
    Fireworks: 'Fogos', Treatment: 'Tratamento', Mine: 'Explosivo', Consumable: 'Consumível',
    SkillBook: 'Livro / Revista', WalkieTalkie: 'Rádio', None: 'Outros'
  };
  const TYPE_EFFECT = { Health: 'Saúde', Thirst: 'Sede', Hunger: 'Fome', Stamina: 'Energia' };
  const SUB_PT = {
    CarPart: 'Peça de carro', EnergyDrink: 'Energético', Alcohol: 'Álcool', BluntWeapon: 'Contundente',
    BladedWeapon: 'Lâmina', Firearm: 'Arma de fogo', Cloth: 'Tecido', Vegetable: 'Vegetal', Fruit: 'Fruta',
    Medicine: 'Remédio', FreshWater: 'Água potável', DirtyWater: 'Água suja', BasicMaterial: 'Material básico', Meat: 'Carne'
  };
  const SLOT_PT = { Head: 'Cabeça', Face: 'Rosto', Eye: 'Olhos', UpperBody: 'Torso', Pants: 'Pernas', Boots: 'Pés', Gloves: 'Mãos', Body: 'Corpo' };
  const STATION_PT = {
    'Self': 'Inventário (sem estação)', 'Workbench Lvl 1': 'Bancada Nv. 1', 'Workbench Lvl 2': 'Bancada Nv. 2',
    'Cooking Station': 'Estação de cozinha', 'Campfire': 'Fogueira', 'Medical Station': 'Estação médica',
    'Distiller': 'Destilador', 'Furnace': 'Fornalha', 'AmmoBench': 'Bancada de munição', 'FatConverter': 'Conversor de gordura',
    'MeleeBench': 'Bancada de armas brancas', 'Tanning Rack': 'Varal de curtume', 'Tailoring Bench': 'Bancada de costura',
    'Salting Table': 'Mesa de salga', 'CementMixer': 'Betoneira'
  };
  const PROF_PT = {
    Unemployed: '', Mechanic: 'Mecânico', 'JuniorBiodiesel Researcher': 'Pesquisador de biodiesel',
    EmergencyMedicalTechnician: 'Socorrista', ApprenticeGunsmith: 'Aprendiz de armeiro', AmateurBoxer: 'Boxeador amador',
    Farmer: 'Fazendeiro', FoodServiceWorker: 'Cozinheiro', SundayFisherman: 'Pescador de domingo', CarSalesman: 'Vendedor de carros',
    Outdoorsman: 'Mateiro', Chemist: 'Químico', EMT: 'Paramédico', MilitaryVet: 'Veterano militar', Thief: 'Ladrão',
    FireFighter: 'Bombeiro', ElectricalEngineer: 'Engenheiro eletricista'
  };
  const BCAT_PT = { Defense: 'Defesa', Other: 'Outros', Crafting: 'Estações de criação', Storage: 'Armazenamento', Traps: 'Armadilhas', Powered: 'Elétricos', Community: 'Comunidade' };
  const ATT_PT = { Sights: 'Miras', Mags: 'Carregadores', Muzzles: 'Bocais / Silenciadores', Tactical: 'Táticos' };

  // Nomes amigáveis das tabelas de loot (INV_*) do jogo
  const LOOT = {
    INV_AmmoDatabase: ['Caixas de munição', 'Munição civil comum'],
    INV_AmmoMilDatabase: ['Munição militar', 'Caixas de munição em áreas militares'],
    INV_Antiques: ['Antiquário', 'Lojas e móveis de antiguidades'],
    INV_AutoParts: ['Peças automotivas', 'Porta-malas e oficinas'],
    INV_AutoPartsBonnet: ['Capô de veículos', 'Peças retiradas do motor de carros'],
    INV_AutoPartsStorage: ['Depósito de autopeças', 'Prateleiras de oficinas mecânicas'],
    INV_BasicLoot_No_Ammo: ['Loot básico (sem munição)', 'Gavetas, armários e caixas genéricas'],
    INV_BasicLoot_w_Ammo: ['Loot básico (com munição)', 'Gavetas, armários e caixas genéricas'],
    INV_BathroomLoot: ['Banheiro', 'Armários de banheiro'],
    INV_BlackMarket: ['Mercado negro', 'Contêineres especiais do mercado negro'],
    INV_BooksMags: ['Livros e revistas', 'Estantes, bancas e bibliotecas'],
    INV_BunkerLoot: ['Bunker', 'Bunkers e esconderijos'],
    INV_CabinetDatabase: ['Armário', 'Armários e cômodas domésticas'],
    INV_CannedFoodDatabase: ['Comida enlatada', 'Prateleiras de mercearia'],
    INV_CharmToys: ['Brinquedos e amuletos', 'Quartos infantis e lojas'],
    INV_ChickenCoopDatabase: ['Galinheiro', 'Galinheiros em fazendas'],
    INV_Clothes: ['Roupas', 'Guarda-roupas e lojas de roupas'],
    INV_CoffeeDatabase: ['Cafeteria', 'Máquinas e balcões de café'],
    INV_DrinksMachine: ['Máquina de bebidas', 'Máquinas de venda de bebidas'],
    INV_DumpsterLoot: ['Lixeira (caçamba)', 'Caçambas de lixo'],
    INV_DumpsterSkipLoot: ['Caçamba de entulho', 'Caçambas de obra'],
    INV_EnemyAI: ['Inimigos humanos (bandidos)', 'Corpos de NPCs hostis'],
    INV_FarmLoot: ['Fazenda', 'Celeiros e galpões de fazenda'],
    INV_Firearms: ['Armas de fogo', 'Armeiros e armários de armas'],
    INV_FishingLoot: ['Pesca', 'Itens obtidos pescando'],
    INV_FoodWaterDatabase: ['Comida e água', 'Despensas e mercados'],
    INV_FridgeDatabase: ['Geladeira', 'Geladeiras domésticas'],
    INV_GraveLoot: ['Túmulos', 'Covas que podem ser escavadas'],
    INV_HardwareStore: ['Loja de ferragens', 'Prateleiras de lojas de construção'],
    INV_HazmatLoot: ['Zona contaminada (Hazmat)', 'Áreas de quarentena e laboratório'],
    INV_HouseElecLoot: ['Eletrônicos domésticos', 'Aparelhos eletrônicos em casas'],
    INV_HouseElecLootStorage: ['Depósito de eletrônicos', 'Caixas de eletrônicos'],
    INV_HouseTrash: ['Lixo doméstico', 'Lixeiras dentro de casas'],
    INV_KitchenCupboardDatabase: ['Armário de cozinha', 'Armários de cozinha'],
    INV_KitchenStorageDatabase: ['Despensa de cozinha', 'Gavetas e despensas'],
    INV_LiquorStore: ['Loja de bebidas', 'Prateleiras de bebidas alcoólicas'],
    INV_LockedVehicles: ['Veículos trancados', 'Porta-malas de carros trancados'],
    INV_MedicalDatabase: ['Suprimentos médicos', 'Hospitais e kits médicos'],
    INV_MeleeWeaponsDataBase: ['Armas brancas', 'Armas corpo a corpo espalhadas pelo mapa'],
    INV_MusicLoot: ['Loja de música', 'Instrumentos e discos'],
    INV_NailsLoot: ['Pregos', 'Caixas de pregos e ferragens'],
    INV_OutdoorsStorage: ['Depósito externo', 'Galpões e caixas ao ar livre'],
    INV_PCDatabase: ['Computadores', 'Escritórios e PCs'],
    INV_PancakeDatabase: ['Lanchonete', 'Balcões de lanchonete'],
    INV_PharmacyDatabase: ['Farmácia', 'Prateleiras de farmácia'],
    INV_PoliceCabinet: ['Armário policial', 'Delegacias'],
    INV_PoliceCabinetS2: ['Armário policial (S2)', 'Delegacias do mapa 2'],
    INV_PoliceClothes: ['Roupas policiais', 'Vestiários da polícia'],
    INV_PostLoot: ['Correios', 'Caixas e encomendas postais'],
    INV_ShopFridge: ['Geladeira de loja', 'Freezers de mercados e postos'],
    INV_Soup: ['Sopas', 'Prateleiras de sopas'],
    INV_SportingGoods: ['Artigos esportivos', 'Lojas de caça e esporte'],
    INV_Sports: ['Esportes', 'Equipamentos esportivos'],
    INV_SupplyDropLoot: ['Suprimento aéreo (Airdrop)', 'Caixas lançadas de avião'],
    INV_SurvivorLoot: ['Acampamento de sobreviventes', 'Mochilas e caixas de sobreviventes'],
    INV_SurvivorLootS2: ['Sobreviventes (S2)', 'Acampamentos do mapa 2'],
    INV_ToiletDatabase: ['Vaso sanitário', 'Caixas de descarga'],
    INV_ToolBox: ['Caixa de ferramentas', 'Caixas de ferramentas pequenas'],
    INV_ToolBoxBig: ['Caixa de ferramentas grande', 'Armários de ferramentas'],
    INV_ToolsShedGarage: ['Garagem / galpão', 'Ferramentas em garagens'],
    INV_TopTierWeapons: ['Armas de elite', 'Locais de alto risco (militares)'],
    INV_TopTierWeaponsS2: ['Armas de elite (S2)', 'Locais de alto risco do mapa 2'],
    INV_TraderAutoParts: ['Comerciante: autopeças', 'Estoque do comerciante'],
    INV_TraderFoodWater: ['Comerciante: comida e água', 'Estoque do comerciante'],
    INV_TraderGeneral: ['Comerciante: geral', 'Estoque do comerciante'],
    INV_TraderMedical: ['Comerciante: médico', 'Estoque do comerciante'],
    INV_TraderWeapons: ['Comerciante: armas', 'Estoque do comerciante'],
    INV_Wardrobe: ['Guarda-roupa', 'Guarda-roupas de casas'],
    INV_WeaponCrate: ['Caixa de armas', 'Caixotes militares'],
    INV_ZombieBasic: ['Zumbis', 'Itens que zumbis derrubam']
  };
  const isTrader = t => t.startsWith('INV_Trader');
  const lootName = t => (LOOT[t] || [t.replace(/^INV_/, '').replace(/([a-z])([A-Z])/g, '$1 $2')])[0];
  const lootDesc = t => (LOOT[t] || [, ''])[1];
  window.HZ_lootName = lootName;
  // botão que abre o mapa só com os locais desse tipo (ex.: todas as lojas de ferragens)
  const mapBtn = t => {
    // locais exatos: contêineres do jogo que usam esta tabela de loot
    const exact = window.HZ_LOOTPTS && window.HZ_LOOTPTS[t];
    if (exact && exact.length) return `<a class="map-btn" href="#/mapa?loot=${t}">📍 Ver no mapa (${exact.length})</a>`;
    const M = window.HZ_MAP, ids = M && M.lootMap && M.lootMap[t];
    if (!ids) return '';
    const n = M.cats.filter(c => ids.includes(c.id)).reduce((s, c) => s + c.n, 0);
    return n ? `<a class="map-btn" href="#/mapa?tipo=${ids.join(',')}">📍 Ver no mapa (${n})</a>` : '';
  };

  // ---------------------------------------------------------------------------
  // Raridade
  // ---------------------------------------------------------------------------
  const TIERS = [
    { id: 'legendary', pt: 'Lendário', min: 0.0001, max: 5, desc: 'Chance abaixo de 5%. Itens de elite: só em airdrops, bunkers, áreas militares ou com muita sorte.' },
    { id: 'epic', pt: 'Muito raro', min: 5, max: 15, desc: 'Chance entre 5% e 15%. Vale a pena revistar locais específicos.' },
    { id: 'rare', pt: 'Raro', min: 15, max: 30, desc: 'Chance entre 15% e 30%. Aparece com alguma frequência nos locais certos.' },
    { id: 'uncommon', pt: 'Incomum', min: 30, max: 60, desc: 'Chance entre 30% e 60%. Encontrado regularmente.' },
    { id: 'common', pt: 'Comum', min: 60, max: 101, desc: 'Chance de 60% ou mais. Está em todo lugar.' },
    { id: 'none', pt: 'Não spawna', min: -1, max: 0.0001, desc: 'Não aparece em nenhuma tabela de loot: é obtido fabricando, comprando, caçando/coletando ou é item especial.' }
  ];
  const tierOf = c => TIERS.find(t => c >= t.min && c < t.max) || TIERS[TIERS.length - 1];
  const TIER = Object.fromEntries(TIERS.map(t => [t.id, t]));

  // ---------------------------------------------------------------------------
  // Índices
  // ---------------------------------------------------------------------------
  const ITEMS = D.items;
  const list = Object.values(ITEMS);
  const tableSum = {};
  for (const [t, rows] of Object.entries(D.loot)) tableSum[t] = rows.reduce((s, r) => s + r[1], 0) || 1;

  for (const it of list) { it.sources = []; it.sold = []; it.crafted = []; it.usedIn = []; it.builds = []; }
  for (const [t, rows] of Object.entries(D.loot)) {
    for (const [id, ch] of rows) {
      const it = ITEMS[id]; if (!it) continue;
      const entry = { table: t, chance: ch, share: ch / tableSum[t] * 100 };
      (isTrader(t) ? it.sold : it.sources).push(entry);
    }
  }
  for (const r of D.recipes) {
    if (ITEMS[r.out]) ITEMS[r.out].crafted.push(r);
    for (const [id] of r.req) if (ITEMS[id] && !ITEMS[id].usedIn.includes(r)) ITEMS[id].usedIn.push(r);
  }
  // recurso de construção -> itens
  const RES = {};
  for (const it of list) if (it.resource && it.resource !== 'Null') (RES[it.resource] = RES[it.resource] || []).push(it);
  const resItem = res => {
    const arr = RES[res] || [];
    const norm = s => s.toLowerCase().replace(/[^a-z]/g, '');
    return arr.find(i => norm(i.id) === norm(res)) || arr.find(i => !i.onlyLoot) || arr[0];
  };
  for (const b of D.buildings) for (const [res] of b.req) { const it = resItem(res); if (it && !it.builds.includes(b)) it.builds.push(b); }

  for (const it of list) {
    it.sources.sort((a, b) => b.chance - a.chance || b.share - a.share);
    const live = it.sources.filter(s => s.chance > 0);
    it.best = live.length ? live[0].chance : 0;
    it.tier = tierOf(it.best).id;
  }

  // ---------------------------------------------------------------------------
  // Utilidades
  // ---------------------------------------------------------------------------
  let lang = 'pt';
  try { lang = localStorage.getItem('hz-lang') || 'pt'; } catch (e) { }

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const nm = it => (it.name && (it.name[lang] || it.name.en)) || it.id;
  const altNm = it => (it.name && (lang === 'pt' ? it.name.en : it.name.pt)) || '';
  const dsc = it => (it.desc && (it.desc[lang] || it.desc.en)) || '';
  const txt = t => (t && (t[lang] || t.en)) || '';
  const fmt = (n, d = 1) => Number(n || 0).toLocaleString('pt-BR', { maximumFractionDigits: d });
  const pct = n => fmt(n, n < 1 ? 2 : 1) + '%';
  const typePt = t => TYPE_PT[t] || t;
  const img = (src, alt = '') => src ? `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy">` : `<span class="noimg">?</span>`;
  const badge = tier => `<span class="badge r-${tier}">${esc(TIER[tier].pt)}</span>`;
  const link = it => it ? `#/item/${encodeURIComponent(it.id)}` : '#/itens';
  const itemCell = (it, extra = '') => it
    ? `<a class="item-cell" href="${link(it)}">${img(it.icon, nm(it))}<span>${esc(nm(it))}${extra}</span></a>`
    : '';
  const ing = (id, n) => {
    const it = ITEMS[id];
    if (!it) return `<span class="ing"><span class="noimg">?</span>${esc(id)}${n > 1 ? ` <b>×${n}</b>` : ''}</span>`;
    return `<a class="ing" href="${link(it)}">${img(it.icon, nm(it))}${esc(nm(it))}${n > 1 ? ` <b>×${n}</b>` : ''}</a>`;
  };
  const searchItems = q => {
    const n = norm(q).trim(); if (!n) return list;
    return list.filter(it => norm(it.name?.pt).includes(n) || norm(it.name?.en).includes(n) || norm(it.id).includes(n));
  };
  const byName = (a, b) => nm(a).localeCompare(nm(b), 'pt-BR');
  const parseQuery = q => Object.fromEntries(new URLSearchParams(q || ''));
  const setTitle = t => { document.title = t ? `${t} — HumanitZ Wiki` : 'HumanitZ Wiki'; };

  const card = it => `
    <a class="card r-${it.tier}" href="${link(it)}" title="${esc(nm(it))}">
      ${img(it.icon, nm(it))}
      <span class="nm">${esc(nm(it))}</span>
      <span class="tp">${esc(typePt(it.type))}</span>
      ${badge(it.tier)}
    </a>`;

  // ---------------------------------------------------------------------------
  // Páginas
  // ---------------------------------------------------------------------------
  function pageHome() {
    setTitle('');
    const counts = {}; for (const it of list) counts[it.type] = (counts[it.type] || 0) + 1;
    const types = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const sample = t => list.filter(i => i.type === t && i.icon).sort((a, b) => b.sources.length - a.sources.length)[0];
    const legendary = list.filter(i => i.tier === 'legendary' && i.icon).sort((a, b) => a.best - b.best).slice(0, 12);
    const lootCount = Object.keys(D.loot).filter(t => !isTrader(t)).length;
    return `
      <section class="hero">
        <h1>Wiki de HumanitZ</h1>
        <p class="lead">Todos os <b>${list.length}</b> itens do jogo com raridade, onde encontrar cada um, receitas de fabricação e construções.
          Tudo extraído direto dos arquivos do jogo instalado.</p>
        <form class="hero-search" id="heroForm">
          <input id="heroInput" type="search" placeholder="Ex.: AK47, bandagem, gasolina, mochila…" autocomplete="off">
          <button class="more-btn" style="margin:0">Buscar</button>
        </form>
      </section>
      <div class="stats">
        <a class="stat" href="#/itens"><b>${list.length}</b><span>itens</span></a>
        <a class="stat" href="#/locais"><b>${lootCount}</b><span>tabelas de loot</span></a>
        <a class="stat" href="#/receitas"><b>${D.recipes.length}</b><span>receitas</span></a>
        <a class="stat" href="#/construcoes"><b>${D.buildings.length}</b><span>construções</span></a>
        <a class="stat" href="#/veiculos"><b>${new Set((D.vehicles || []).map(v => v.title)).size + (D.others || []).length}</b><span>veículos, cavalos e aeronaves</span></a>
        <a class="stat" href="#/raridade"><b>${list.filter(i => i.tier === 'legendary').length}</b><span>itens lendários</span></a>
      </div>
      <h2>Categorias</h2>
      <div class="cat-grid">
        ${types.map(([t, c]) => { const s = sample(t); return `
          <a class="cat" href="#/itens?tipo=${encodeURIComponent(t)}">${s ? img(s.icon) : '<span class="noimg" style="width:36px;height:36px">?</span>'}
            <span>${esc(typePt(t))}<small>${c} itens</small></span></a>`; }).join('')}
      </div>
      <h2>Itens mais raros</h2>
      <p class="muted">Itens com a menor chance de aparecer, mesmo no melhor local possível.</p>
      <div class="grid">${legendary.map(card).join('')}</div>
      <p><a href="#/itens?raridade=legendary">Ver todos os lendários →</a></p>`;
  }

  // ---------------- lista de itens ----------------
  const LIST_PAGE = 120;
  let listShown = LIST_PAGE;
  let listView = 'grid';
  try { listView = localStorage.getItem('hz-view') || 'grid'; } catch (e) { }

  function pageItems(q) {
    setTitle('Itens');
    const types = [...new Set(list.map(i => i.type))].sort((a, b) => typePt(a).localeCompare(typePt(b), 'pt-BR'));
    const slots = Object.keys(SLOT_PT);
    const tables = Object.keys(D.loot).sort((a, b) => lootName(a).localeCompare(lootName(b), 'pt-BR'));
    const opt = (v, label, cur) => `<option value="${esc(v)}" ${v === cur ? 'selected' : ''}>${esc(label)}</option>`;
    listShown = LIST_PAGE;
    const html = `
      <div class="crumbs"><a href="#/">Início</a> › Itens</div>
      <h1>Todos os itens</h1>
      <p class="lead">Filtre por categoria, raridade, parte do corpo ou local onde o item aparece. A raridade é calculada pela maior chance de spawn entre todos os locais de loot.</p>
      <div class="filters" id="filters">
        <label>Buscar<input id="fq" type="search" value="${esc(q.q || '')}" placeholder="Nome do item…"></label>
        <label>Categoria<select id="ftipo"><option value="">Todas</option>${types.map(t => opt(t, typePt(t), q.tipo)).join('')}</select></label>
        <label>Raridade<select id="frar"><option value="">Todas</option>${TIERS.map(t => opt(t.id, t.pt, q.raridade)).join('')}</select></label>
        <label>Local<select id="floc"><option value="">Qualquer</option>${tables.map(t => opt(t, lootName(t), q.local)).join('')}</select></label>
        <label>Ordenar<select id="fsort">
          ${opt('nome', 'Nome', q.ordem || 'nome')}${opt('raro', 'Mais raro primeiro', q.ordem)}${opt('comum', 'Mais comum primeiro', q.ordem)}
          ${opt('peso', 'Peso', q.ordem)}${opt('valor', 'Valor de troca', q.ordem)}${opt('tipo', 'Categoria', q.ordem)}</select></label>
      </div>
      <div class="chips" id="slotChips">
        <button class="chip ${!q.slot ? 'on' : ''}" data-slot="">Todas as partes</button>
        ${slots.map(s => `<button class="chip ${q.slot === s ? 'on' : ''}" data-slot="${s}">${SLOT_PT[s]}</button>`).join('')}
      </div>
      <div class="result-bar"><span id="count"></span>
        <span class="view-toggle"><button data-v="grid" class="${listView === 'grid' ? 'on' : ''}">Grade</button><button data-v="table" class="${listView === 'table' ? 'on' : ''}">Tabela</button></span>
      </div>
      <div id="results"></div>`;
    return { html, after: () => bindItems(q) };
  }

  function bindItems(q) {
    const $ = id => document.getElementById(id);
    const state = { q: q.q || '', tipo: q.tipo || '', raridade: q.raridade || '', local: q.local || '', ordem: q.ordem || 'nome', slot: q.slot || '' };
    const sync = () => {
      const p = new URLSearchParams(Object.entries(state).filter(([k, v]) => v && !(k === 'ordem' && v === 'nome')));
      const h = '#/itens' + (p.toString() ? '?' + p : '');
      history.replaceState(null, '', h);
    };
    const render = () => {
      let r = searchItems(state.q);
      if (state.tipo) r = r.filter(i => i.type === state.tipo);
      if (state.raridade) r = r.filter(i => i.tier === state.raridade);
      if (state.slot) r = r.filter(i => i.slot === state.slot);
      if (state.local) r = r.filter(i => i.sources.concat(i.sold).some(s => s.table === state.local && s.chance > 0));
      const S = {
        nome: byName,
        raro: (a, b) => (a.best || 999) - (b.best || 999) || byName(a, b),
        comum: (a, b) => b.best - a.best || byName(a, b),
        peso: (a, b) => (b.weight || 0) - (a.weight || 0) || byName(a, b),
        valor: (a, b) => (b.trader || 0) - (a.trader || 0) || byName(a, b),
        tipo: (a, b) => typePt(a.type).localeCompare(typePt(b.type), 'pt-BR') || byName(a, b)
      };
      r = r.slice().sort(S[state.ordem] || byName);
      $('count').textContent = `${r.length} ${r.length === 1 ? 'item encontrado' : 'itens encontrados'}`;
      const shown = r.slice(0, listShown);
      let out;
      if (!r.length) out = `<div class="empty-state">Nenhum item encontrado com esses filtros.</div>`;
      else if (listView === 'grid') out = `<div class="grid">${shown.map(card).join('')}</div>`;
      else {
        const loc = state.local;
        out = `<div class="table-wrap"><table><thead><tr><th>Item</th><th>Categoria</th><th>Raridade</th>
          <th class="num">${loc ? 'Chance neste local' : 'Melhor chance'}</th><th class="num">Peso</th><th class="num">Valor</th><th>Melhor local</th></tr></thead><tbody>
          ${shown.map(i => {
            const s = loc ? i.sources.concat(i.sold).find(x => x.table === loc) : i.sources[0];
            return `<tr class="r-${i.tier}"><td>${itemCell(i)}</td><td>${esc(typePt(i.type))}</td><td>${badge(i.tier)}</td>
              <td class="num">${s ? pct(s.chance) : '—'}</td><td class="num">${fmt(i.weight, 2)}</td><td class="num">${i.trader || '—'}</td>
              <td>${i.sources[0] ? `<a href="#/local/${i.sources[0].table}">${esc(lootName(i.sources[0].table))}</a>` : '<span class="muted">—</span>'}</td></tr>`;
          }).join('')}</tbody></table></div>`;
      }
      if (r.length > listShown) out += `<button class="more-btn" id="more">Mostrar mais (${r.length - listShown} restantes)</button>`;
      $('results').innerHTML = out;
      const more = $('more');
      if (more) more.onclick = () => { listShown += LIST_PAGE; render(); };
    };
    let t;
    $('fq').addEventListener('input', e => { clearTimeout(t); t = setTimeout(() => { state.q = e.target.value; listShown = LIST_PAGE; sync(); render(); }, 120); });
    for (const [id, key] of [['ftipo', 'tipo'], ['frar', 'raridade'], ['floc', 'local'], ['fsort', 'ordem']]) {
      $(id).addEventListener('change', e => { state[key] = e.target.value; listShown = LIST_PAGE; sync(); render(); });
    }
    $('slotChips').addEventListener('click', e => {
      const b = e.target.closest('.chip'); if (!b) return;
      state.slot = b.dataset.slot; listShown = LIST_PAGE;
      document.querySelectorAll('#slotChips .chip').forEach(c => c.classList.toggle('on', c === b));
      sync(); render();
    });
    document.querySelector('.view-toggle').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      listView = b.dataset.v; try { localStorage.setItem('hz-view', listView); } catch (err) { }
      document.querySelectorAll('.view-toggle button').forEach(x => x.classList.toggle('on', x === b));
      render();
    });
    render();
  }

  // ---------------- página do item ----------------
  function recipeBlock(r, highlight) {
    const prof = PROF_PT[r.prof];
    const req = r.req.map(([id, n]) => ing(id, n)).join(r.any ? '<span class="or-sep">ou</span>' : '');
    const tags = [
      `<span class="tag">${esc(STATION_PT[r.station] || r.station)}</span>`,
      r.time ? `<span class="tag">${fmt(r.time)}s</span>` : '',
      prof ? `<span class="tag">Profissão: ${esc(prof)}</span>` : '',
      r.needsRecipe ? `<span class="tag">Requer receita aprendida</span>` : '',
      r.hidden ? `<span class="tag">Oculta</span>` : '',
      r.any ? `<span class="tag">Qualquer um dos ingredientes</span>` : ''
    ].join(' ');
    const outIt = ITEMS[r.out];
    return `<div class="recipe">
      <div class="recipe-head"><b>${esc(txt(r.name) || (outIt ? nm(outIt) : r.id))}</b><span>${tags}</span></div>
      <div class="recipe-flow">${req || '<span class="muted">Sem ingredientes</span>'}<span class="arrow">→</span>${ing(r.out, r.n)}
        ${r.also.map(a => ing(a, 1)).join('')}</div>
    </div>`;
  }

  function pageItem(id) {
    const it = ITEMS[id];
    if (!it) return `<div class="empty-state"><h1>Item não encontrado</h1><p><a href="#/itens">Voltar para a lista</a></p></div>`;
    setTitle(nm(it));
    const T = TIER[it.tier];
    const kv = [];
    const add = (k, v) => { if (v !== null && v !== undefined && v !== '' && v !== false) kv.push(`<div><dt>${k}</dt><dd>${v}</dd></div>`); };
    add('Categoria', `<a href="#/itens?tipo=${encodeURIComponent(it.type)}">${esc(typePt(it.type))}</a>`);
    if (it.sub && it.sub !== 'None') add('Subtipo', esc(SUB_PT[it.sub] || it.sub));
    if (it.slot) add('Parte do corpo', `<a href="#/itens?slot=${it.slot}">${esc(SLOT_PT[it.slot] || it.slot)}</a>`);
    add('Peso', fmt(it.weight, 2) + ' kg');
    if (it.stack > 1) add('Pilha máxima', it.stack);
    if (it.trader) add('Valor de troca', it.trader);
    if (it.armor) add('Proteção (armadura)', fmt(it.armor * (it.armor <= 1 ? 100 : 1), 1) + (it.armor <= 1 ? '%' : ''));
    if (it.warmth) add('Aquecimento', fmt(it.warmth, 2));
    if (it.cool) add('Frescor no verão', fmt(it.cool, 2));
    if (it.infection) add('Proteção contra infecção', fmt(it.infection, 2));
    if (it.rain) add('Resistência à chuva', fmt(it.rain, 2));
    if (it.snow) add('Resistência à neve', fmt(it.snow, 2));
    if (it.durLoss) add('Perda de durabilidade', fmt(it.durLoss, 2));
    if (it.decays) add('Estraga', `${fmt(it.decayDay)}% por dia${it.onlyDecayOpened ? ' (só depois de aberto)' : ''}`);
    if (it.cap && (it.cap[0] || it.cap[1])) add('Capacidade aleatória', `${it.cap[0]}–${it.cap[1]}`);
    if (it.inside) add('Contém', ing(it.inside.id, it.inside.n));
    if (it.fertilizer) add('Fertilizante', 'Sim');
    if (it.noVendor) add('Comerciantes', 'Não compram este item');
    add('Chance base (DT_ItemDatabase)', pct(it.chance || 0));
    add('ID interno', `<code>${esc(it.id)}</code>`);

    const eff = [];
    if (TYPE_EFFECT[it.type] && it.v1) eff.push(`${it.v1 > 0 ? '+' : ''}${fmt(it.v1)} ${TYPE_EFFECT[it.type]}`);
    if (TYPE_EFFECT[it.type2] && it.v2) eff.push(`${it.v2 > 0 ? '+' : ''}${fmt(it.v2)} ${TYPE_EFFECT[it.type2]}`);

    const srcRows = it.sources.map(s => `<tr class="r-${tierOf(s.chance).id}">
        <td><a href="#/local/${s.table}">${esc(lootName(s.table))}</a><br><small class="muted">${esc(lootDesc(s.table))}</small>
          ${mapBtn(s.table) ? `<br>${mapBtn(s.table)}` : ''}</td>
        <td>${badge(tierOf(s.chance).id)}</td>
        <td><div class="bar-cell"><div class="bar"><i style="width:${Math.min(100, s.chance)}%"></i></div><span>${pct(s.chance)}</span></div></td>
        <td class="num">${pct(s.share)}</td></tr>`).join('');

    const atts = Object.entries(it.att || {});
    const usedBy = list.filter(o => Object.values(o.att || {}).some(a => a.includes(it.id)));

    return `
      <div class="crumbs"><a href="#/">Início</a> › <a href="#/itens">Itens</a> › <a href="#/itens?tipo=${encodeURIComponent(it.type)}">${esc(typePt(it.type))}</a> › ${esc(nm(it))}</div>
      <section class="item-head r-${it.tier}">
        <div class="item-art">${img(it.icon, nm(it))}</div>
        <div>
          <div class="item-title"><h1>${esc(nm(it))}</h1>${badge(it.tier)}</div>
          <div class="alt-name">${altNm(it) && altNm(it) !== nm(it) ? esc(altNm(it)) + ' · ' : ''}${esc(typePt(it.type))}</div>
          <p class="item-desc">${esc(dsc(it)) || '<span class="muted">Sem descrição no jogo.</span>'}</p>
          ${eff.length ? `<p><b>Efeito ao usar:</b> ${eff.map(esc).join(', ')}</p>` : ''}
          <p class="muted">${it.best ? `Melhor chance de encontrar: <b style="color:var(--rc)">${pct(it.best)}</b> em <a href="#/local/${it.sources[0].table}">${esc(lootName(it.sources[0].table))}</a>. ${esc(T.desc)}` : esc(T.desc)}</p>
          ${it.skillbook ? `<p><b>Ensina:</b> ${it.skillbook.map(s => `<span class="tag">${esc(s)}</span>`).join(' ')}</p>` : ''}
        </div>
      </section>
      <dl class="kv">${kv.join('')}</dl>

      <h2>Onde encontrar</h2>
      ${it.sources.length ? `
        <p class="muted">"Chance" é o valor <code>ChanceToSpawn</code> do item naquela tabela de loot. "Participação" é a fatia aproximada dessa chance dentro de todo o loot da tabela.</p>
        <div class="table-wrap"><table><thead><tr><th>Local / contêiner</th><th>Raridade</th><th>Chance</th><th class="num">Participação</th></tr></thead>
        <tbody>${srcRows}</tbody></table></div>`
        : `<div class="notice">Este item não aparece em nenhuma tabela de loot. ${it.crafted.length ? 'Ele pode ser <b>fabricado</b> (veja abaixo).' : it.sold.length ? 'Ele pode ser <b>comprado</b> de comerciantes.' : 'Ele é obtido por outros meios (caça, coleta, pesca, eventos ou missões).'}</div>`}

      ${it.sold.length ? `<h2>Vendido por comerciantes</h2>
        <div class="table-wrap"><table><thead><tr><th>Comerciante</th><th class="num">Chance no estoque</th></tr></thead><tbody>
        ${it.sold.map(s => `<tr><td><a href="#/local/${s.table}">${esc(lootName(s.table))}</a></td><td class="num">${pct(s.chance)}</td></tr>`).join('')}
        </tbody></table></div>` : ''}

      ${it.crafted.length ? `<h2>Como fabricar</h2>${it.crafted.map(r => recipeBlock(r)).join('')}` : ''}
      ${it.usedIn.length ? `<h2>Usado para fabricar</h2>${it.usedIn.map(r => recipeBlock(r)).join('')}` : ''}
      ${it.builds.length ? `<h2>Usado em construções</h2><div class="grid">${it.builds.map(b => `
        <a class="card" href="#/construcoes#b-${esc(b.id)}">${img(b.icon, txt(b.name))}<span class="nm">${esc(txt(b.name))}</span>
        <span class="tp">${esc(BCAT_PT[b.cat] || b.cat)} · ${b.req.find(r => resItem(r[0]) === it)?.[1] || ''}×</span></a>`).join('')}</div>` : ''}

      ${atts.length ? `<h2>Acessórios compatíveis</h2>${atts.map(([k, ids]) => `<h3>${esc(ATT_PT[k] || k)}</h3><div class="recipe-flow">${ids.map(a => ing(a, 1)).join('')}</div>`).join('')}` : ''}
      ${usedBy.length ? `<h2>Compatível com</h2><div class="recipe-flow">${usedBy.sort(byName).map(o => ing(o.id, 1)).join('')}</div>` : ''}

      <h2>Itens parecidos</h2>
      <div class="grid">${list.filter(o => o !== it && o.type === it.type && (o.slot || null) === (it.slot || null)).sort((a, b) => Math.abs(a.best - it.best) - Math.abs(b.best - it.best)).slice(0, 8).map(card).join('')}</div>`;
  }

  // ---------------- raridade ----------------
  function pageRarity() {
    setTitle('Raridade');
    const count = id => list.filter(i => i.tier === id).length;
    return `
      <div class="crumbs"><a href="#/">Início</a> › Raridade</div>
      <h1>Como funciona a raridade</h1>
      <p class="lead">Cada contêiner do jogo (geladeira, armário, carro, airdrop…) usa uma <b>tabela de loot</b> (<code>INV_*</code>).
        Dentro dela, cada item tem um valor <code>ChanceToSpawn</code> de 0 a 100. A raridade desta wiki usa a <b>maior chance</b> que o item tem em qualquer local de loot (comerciantes não contam).</p>
      <div class="notice">Dica: um item "Raro" pode ser bem fácil de achar se você for direto ao local certo. Abra a página do item e veja a seção <b>Onde encontrar</b>, ordenada da maior para a menor chance.</div>
      <div class="tier-list">
        ${TIERS.map(t => `<a class="tier r-${t.id}" href="#/itens?raridade=${t.id}" style="color:inherit;text-decoration:none">
          <span>${badge(t.id)}</span><b>${count(t.id)} itens</b><span class="muted">${esc(t.desc)}</span></a>`).join('')}
      </div>
      ${TIERS.filter(t => t.id !== 'none').reverse().map(t => {
        const arr = list.filter(i => i.tier === t.id).sort((a, b) => a.best - b.best || byName(a, b));
        return `<h2>${badge(t.id)} ${esc(t.pt)} <small class="muted">(${arr.length})</small></h2>
          <div class="grid">${arr.slice(0, 24).map(card).join('')}</div>
          ${arr.length > 24 ? `<p><a href="#/itens?raridade=${t.id}&ordem=raro">Ver todos os ${arr.length} →</a></p>` : ''}`;
      }).join('')}`;
  }

  // ---------------- locais ----------------
  function pageLocations() {
    setTitle('Onde encontrar');
    const tables = Object.keys(D.loot).sort((a, b) => lootName(a).localeCompare(lootName(b), 'pt-BR'));
    const cardT = t => {
      const rows = D.loot[t].filter(r => r[1] > 0 && ITEMS[r[0]]);
      const top = rows.slice().sort((a, b) => b[1] - a[1]).slice(0, 7).map(r => ITEMS[r[0]]).filter(i => i.icon);
      return `<a class="loc-card" href="#/local/${t}"><h3>${esc(lootName(t))}</h3>
        <div class="muted">${esc(lootDesc(t))}</div><small class="muted">${rows.length} itens possíveis</small>
        <div class="icons">${top.map(i => `<img src="${esc(i.icon)}" alt="${esc(nm(i))}" title="${esc(nm(i))}" loading="lazy">`).join('')}</div></a>`;
    };
    return `
      <div class="crumbs"><a href="#/">Início</a> › Onde encontrar</div>
      <h1>Locais e contêineres de loot</h1>
      <p class="lead">Cada tipo de contêiner usa uma tabela de loot própria. Clique para ver tudo o que pode aparecer e a chance de cada item.</p>
      <h2>Loot do mundo</h2><div class="loc-grid">${tables.filter(t => !isTrader(t)).map(cardT).join('')}</div>
      <h2>Comerciantes</h2><div class="loc-grid">${tables.filter(isTrader).map(cardT).join('')}</div>`;
  }

  function pageLocation(t) {
    const rows = D.loot[t];
    if (!rows) return `<div class="empty-state"><h1>Local não encontrado</h1><p><a href="#/locais">Voltar</a></p></div>`;
    setTitle(lootName(t));
    const sum = tableSum[t];
    const sorted = rows.filter(r => ITEMS[r[0]]).sort((a, b) => b[1] - a[1] || byName(ITEMS[a[0]], ITEMS[b[0]]));
    return `
      <div class="crumbs"><a href="#/">Início</a> › <a href="#/locais">Onde encontrar</a> › ${esc(lootName(t))}</div>
      <h1>${esc(lootName(t))}</h1>
      <p class="lead">${esc(lootDesc(t))}. Tabela do jogo: <code>${esc(t)}</code> · ${sorted.length} entradas.</p>
      ${mapBtn(t) ? `<p>${mapBtn(t)}</p>` : ''}
      <div class="table-wrap"><table><thead><tr><th>Item</th><th>Categoria</th><th>Raridade aqui</th><th>Chance</th><th class="num">Participação</th></tr></thead><tbody>
      ${sorted.map(([id, ch]) => { const it = ITEMS[id]; const tr = tierOf(ch).id; return `<tr class="r-${tr}">
        <td>${itemCell(it)}</td><td>${esc(typePt(it.type))}</td><td>${badge(tr)}</td>
        <td><div class="bar-cell"><div class="bar"><i style="width:${Math.min(100, ch)}%"></i></div><span>${pct(ch)}</span></div></td>
        <td class="num">${pct(ch / sum * 100)}</td></tr>`; }).join('')}
      </tbody></table></div>`;
  }

  // ---------------- receitas ----------------
  function pageRecipes(q) {
    setTitle('Receitas');
    const stations = [...new Set(D.recipes.map(r => r.station))].sort((a, b) => (STATION_PT[a] || a).localeCompare(STATION_PT[b] || b, 'pt-BR'));
    const html = `
      <div class="crumbs"><a href="#/">Início</a> › Receitas</div>
      <h1>Receitas de fabricação</h1>
      <p class="lead">${D.recipes.length} receitas extraídas de <code>DT_CraftingData</code>, agrupadas pela estação onde são feitas.</p>
      <div class="filters" style="grid-template-columns:1fr">
        <label>Buscar receita ou ingrediente<input id="rq" type="search" value="${esc(q.q || '')}" placeholder="Ex.: pregos, curativo, munição…"></label>
      </div>
      <div class="chips" id="stChips"><button class="chip ${!q.estacao ? 'on' : ''}" data-s="">Todas</button>
        ${stations.map(s => `<button class="chip ${q.estacao === s ? 'on' : ''}" data-s="${esc(s)}">${esc(STATION_PT[s] || s)}</button>`).join('')}</div>
      <div id="recipes"></div>`;
    const after = () => {
      const state = { q: q.q || '', s: q.estacao || '' };
      const render = () => {
        const n = norm(state.q);
        const match = r => !n || [r.out, ...r.req.map(x => x[0])].some(id => {
          const it = ITEMS[id]; return norm(id).includes(n) || (it && (norm(it.name.pt).includes(n) || norm(it.name.en).includes(n)));
        }) || norm(txt(r.name)).includes(n);
        const rs = D.recipes.filter(r => (!state.s || r.station === state.s) && match(r));
        const groups = {};
        for (const r of rs) (groups[r.station] = groups[r.station] || []).push(r);
        document.getElementById('recipes').innerHTML = rs.length ? stations.filter(s => groups[s]).map(s =>
          `<h2>${esc(STATION_PT[s] || s)} <small class="muted">(${groups[s].length})</small></h2>${groups[s].map(r => recipeBlock(r)).join('')}`).join('')
          : `<div class="empty-state">Nenhuma receita encontrada.</div>`;
      };
      let t;
      document.getElementById('rq').addEventListener('input', e => { clearTimeout(t); t = setTimeout(() => { state.q = e.target.value; render(); }, 120); });
      document.getElementById('stChips').addEventListener('click', e => {
        const b = e.target.closest('.chip'); if (!b) return;
        state.s = b.dataset.s;
        document.querySelectorAll('#stChips .chip').forEach(c => c.classList.toggle('on', c === b));
        render();
      });
      render();
    };
    return { html, after };
  }

  // ---------------- construções ----------------
  function pageBuildings() {
    setTitle('Construções');
    const groups = {};
    for (const b of D.buildings) (groups[b.cat] = groups[b.cat] || []).push(b);
    const resIng = (res, n) => { const it = resItem(res); return it ? ing(it.id, n) : `<span class="ing"><span class="noimg">?</span>${esc(res)} <b>×${n}</b></span>`; };
    return `
      <div class="crumbs"><a href="#/">Início</a> › Construções</div>
      <h1>Construções</h1>
      <p class="lead">${D.buildings.length} estruturas do menu de construção (<code>DT_Buildings</code>) com os recursos necessários.</p>
      ${Object.keys(groups).sort().map(c => `
        <h2>${esc(BCAT_PT[c] || c)} <small class="muted">(${groups[c].length})</small></h2>
        ${groups[c].sort((a, b) => txt(a.name).localeCompare(txt(b.name), 'pt-BR')).map(b => `
          <div class="recipe" id="b-${esc(b.id)}">
            <div class="recipe-head"><span class="item-cell">${img(b.icon, txt(b.name))}<b>${esc(txt(b.name))}</b></span>
              <span>${b.hp ? `<span class="tag">Vida: ${fmt(b.hp, 0)}</span>` : ''} ${b.tool ? '<span class="tag">Requer martelo</span>' : ''}</span></div>
            ${txt(b.desc) ? `<p class="muted" style="margin:0 0 10px">${esc(txt(b.desc))}</p>` : ''}
            <div class="recipe-flow">${b.req.map(([r, n]) => resIng(r, n)).join('') || '<span class="muted">Sem recursos</span>'}</div>
          </div>`).join('')}`).join('')}`;
  }

  // ---------------- munição ----------------
  function pageAmmo() {
    setTitle('Munição');
    const ammo = list.filter(i => i.type === 'Ammo').sort(byName);
    const special = Object.entries(D.ammo);
    return `
      <div class="crumbs"><a href="#/">Início</a> › Munição</div>
      <h1>Munição</h1>
      <h2>Munições especiais</h2>
      <p class="muted">Modificadores definidos em <code>DT_AmmoDamage</code>.</p>
      <div class="table-wrap"><table><thead><tr><th>Munição</th><th class="num">Multiplicador de dano</th><th class="num">Sangramento</th><th class="num">Fogo</th><th class="num">Perfurar armadura</th></tr></thead><tbody>
      ${special.map(([id, a]) => { const it = ITEMS[id] || list.find(i => norm(i.id) === norm(id)); return `<tr>
        <td>${it ? itemCell(it) : `<code>${esc(id)}</code>`}</td><td class="num">×${fmt(a.DamageMultiplier, 2)}</td>
        <td class="num">${pct(a.BleedChance)}</td><td class="num">${pct(a.FireChance)}</td><td class="num">${pct(a.ArmorPenChance)}</td></tr>`; }).join('')}
      </tbody></table></div>
      <h2>Todos os tipos de munição</h2>
      <div class="grid">${ammo.map(card).join('')}</div>`;
  }

  // ---------------------------------------------------------------------------
  // Veículos
  // ---------------------------------------------------------------------------
  const VEH = D.vehicles || [];
  const VUP = Object.fromEntries((D.vehicleUpgrades || []).map(u => [u.id, u]));
  const BODY_FIX = { BP_Amero: 'sedan', BP_AUGH: 'sedan', BP_LevyLazer: 'suv', BP_LevyLazer_Storage: 'suv' };
  const BODY_PT = { hatch: 'Hatch', sedan: 'Sedã', suv: 'SUV', jeep: 'Jipe', pickup: 'Picape', van: 'Van', truck: 'Caminhonete / caminhão', sport: 'Esportivo', camper: 'Motor-home', military: 'Militar' };
  const DRIVE_PT = d => (/4W/.test(d) ? '4x4' : /Front/.test(d) ? 'Dianteira' : /Rear/.test(d) ? 'Traseira' : d) + (/LimitedSlip/.test(d) ? ' (autoblocante)' : /Open/.test(d) ? ' (diferencial aberto)' : '');
  const UPTYPE_PT = { Front: 'Para-choque dianteiro', Back: 'Proteção traseira', WindowL: 'Janela esquerda', WindowR: 'Janela direita', WindowFront: 'Para-brisa', Storage: 'Porta-malas extra', Tires: 'Rodas / pneus', Windows: 'Janelas', Doors: 'Portas', Bonnet: 'Capô', WindowBack: 'Vidro traseiro' };
  const PART_PT = { CarBattery: 'Bateria', FuelPump: 'Bomba de combustível', StarterMotor: 'Motor de arranque', FanBelt: 'Correia do ventilador' };
  const SPAWN_TIER = { BP_CarSpawner_Common: ['common', 'Comum'], BP_CarSpawner_UnCommon: ['uncommon', 'Incomum'], BP_CarSpawner_NewMix: ['uncommon', 'Incomum'], BP_KaiCarSpawner: ['rare', 'Raro'] };
  const VTIER_ORDER = ['common', 'uncommon', 'rare', 'epic'];

  for (const v of VEH) {
    v.body = BODY_FIX[v.id] || v.body;
    v.display = v.title || txt(v.name) || v.id;
    const ts = v.spawns.map(s => SPAWN_TIER[s.spawner]?.[0]).filter(Boolean);
    v.tier = ts.length ? VTIER_ORDER.find(t => ts.includes(t)) : 'epic';
    v.tierPt = ts.length ? SPAWN_TIER[v.spawns.find(s => SPAWN_TIER[s.spawner][0] === v.tier).spawner][1] : 'Especial';
    const m = v.id.match(/(Black|Blue|Red|White|Yellow|Halloween|Lights|Army|Police|Storage|Extras|Child)$/i) || v.id.match(/_(01)$/);
    v.variant = m ? m[1] : '';
  }
  const VCOLOR = v => {
    const s = v.id.toLowerCase();
    if (s.includes('black')) return '#2b2d2f';
    if (s.includes('blue')) return '#3d6fa8';
    if (s.includes('red')) return '#a8392f';
    if (s.includes('white')) return '#d8d6cf';
    if (s.includes('yellow')) return '#d6a92a';
    if (s.includes('halloween')) return '#d06a1c';
    if (s.includes('police')) return '#26364f';
    if (s.includes('army') || v.body === 'military') return '#5b6b3c';
    if (s.includes('security')) return '#3a3f45';
    return { hatch: '#8c7b5d', sedan: '#7d8a8f', suv: '#6e7c66', jeep: '#7e7046', pickup: '#8a5a3c', van: '#9a9a90', truck: '#5e6e7d', sport: '#b5472f', camper: '#c9bfa5' }[v.body] || '#888';
  };
  // Perfis laterais simplificados (viewBox 0 0 220 90)
  const BODY_PATH = {
    hatch: 'M20 62 L24 44 L60 40 L82 22 L140 20 L176 38 L196 42 L200 62 Z',
    sedan: 'M14 62 L18 46 L58 40 L84 22 L136 22 L164 40 L204 44 L208 62 Z',
    sport: 'M12 62 L16 50 L64 42 L96 28 L136 28 L172 44 L208 48 L210 62 Z',
    suv: 'M14 62 L16 40 L44 36 L60 16 L180 16 L196 38 L208 40 L208 62 Z',
    jeep: 'M18 62 L18 40 L52 38 L62 18 L150 18 L156 38 L204 40 L204 62 Z',
    pickup: 'M12 62 L14 42 L52 38 L72 18 L124 18 L134 38 L210 38 L210 62 Z',
    van: 'M14 62 L14 34 L34 16 L206 14 L208 62 Z',
    truck: 'M10 62 L10 12 L150 12 L150 30 L178 30 L198 44 L210 46 L210 62 Z',
    camper: 'M10 62 L10 10 L170 10 L172 28 L194 32 L208 46 L210 62 Z',
    military: 'M10 62 L12 36 L40 30 L58 14 L176 14 L196 30 L210 34 L210 62 Z'
  };
  const carSvg = (v, h = 90) => {
    const c = VCOLOR(v);
    return `<svg class="car-svg" viewBox="0 0 220 90" height="${h}" role="img" aria-label="${esc(v.display)}">
      <path d="${BODY_PATH[v.body] || BODY_PATH.sedan}" fill="${c}" stroke="rgba(0,0,0,.45)" stroke-width="2" stroke-linejoin="round"/>
      <circle cx="56" cy="64" r="15" fill="#1a1b19" stroke="#555" stroke-width="3"/><circle cx="56" cy="64" r="5" fill="#777"/>
      <circle cx="166" cy="64" r="15" fill="#1a1b19" stroke="#555" stroke-width="3"/><circle cx="166" cy="64" r="5" fill="#777"/>
    </svg>`;
  };
  // Imagem renderizada do modelo 3D do jogo; a silhueta só aparece se a imagem faltar
  const carPic = (v, h = 90) => `<span class="carpic" style="--h:${h}px"><img src="img/vehicles/${esc(v.id)}.webp" alt="${esc(v.display)}" loading="lazy"
      onerror="this.parentNode.classList.add('fallback')">${carSvg(v, h)}</span>`;
  const vlink = v => `#/veiculo/${encodeURIComponent(v.id)}`;
  const vbadge = v => `<span class="badge r-${v.tier}">${esc(v.tierPt)}</span>`;
  const vmax = k => Math.max(...VEH.map(v => v[k] || 0));
  const statBar = (label, val, max, unit = '') => `<div class="vstat"><span>${label}</span>
      <div class="bar"><i style="width:${Math.round((val || 0) / max * 100)}%"></i></div><b>${val != null ? fmt(val, 0) + unit : '—'}</b></div>`;

  // ---------------- outros veículos: cavalos, reboque, aeronaves, cenário ----------------
  const OTH = D.others || [];
  const VCATS = [
    ['carros', 'Carros', 'Veículos terrestres pilotáveis.'],
    ['cavalos', 'Montarias', 'Cavalos que podem ser montados, alimentados e equipados com sela.', 'horse'],
    ['reboques', 'Reboques', 'Reboque que pode ser engatado em carros.', 'trailer'],
    ['aeronaves', 'Helicópteros', 'Aeronaves controladas pelo jogo: entregam suprimentos ou caem em eventos. Não são pilotáveis.', 'air'],
    ['cenario', 'Cenário', 'Veículos que existem no mapa só como objeto de cenário (aviões, destroços, trator). Não são pilotáveis.', 'scenery_air', 'scenery_ground']
  ];
  const oCount = cats => OTH.filter(o => cats.includes(o.cat)).length;
  const kmh = cms => cms != null ? fmt(cms * 0.036, 0) + ' km/h' : '—';
  const opic = (o, h) => `<span class="carpic" style="--h:${h}px">${o.img ? `<img src="${esc(o.img)}" alt="${esc(o.name.pt)}" loading="lazy">` : '<span class="noimg">?</span>'}</span>`;
  const olink = o => `#/veiculo/${encodeURIComponent(o.id)}`;
  const OBADGE = { horse: ['uncommon', 'Montaria'], trailer: ['common', 'Reboque'], air: ['epic', 'Evento'], scenery_air: ['none', 'Cenário'], scenery_ground: ['none', 'Cenário'] };
  const obadge = o => `<span class="badge r-${OBADGE[o.cat][0]}">${OBADGE[o.cat][1]}</span>`;
  const ocard = o => `<a class="vcard r-${OBADGE[o.cat][0]}" href="${olink(o)}"><div class="vart">${opic(o, 150)}</div>
      <div class="vcard-body"><div class="item-title"><b>${esc(o.name.pt)}</b>${obadge(o)}</div>
      ${o.cat === 'horse' ? `<div class="muted" style="font-size:.85rem">Vida ${fmt(o.hp, 0)} · Fôlego ×${fmt(o.stamina, 2)} · Galope ${kmh(o.sprint)}</div>` : ''}
      ${o.cat === 'air' ? `<div class="muted" style="font-size:.85rem">${o.role === 'airdrop' ? 'Entrega o airdrop' : 'Evento com loot e inimigos'}</div>` : ''}
      ${o.cat === 'trailer' ? `<div class="muted" style="font-size:.85rem">Engata em carros</div>` : ''}
      </div></a>`;

  function pageOther(o) {
    setTitle(o.name.pt);
    const kv = [];
    const add = (k, val) => { if (val !== null && val !== undefined && val !== '') kv.push(`<div><dt>${k}</dt><dd>${val}</dd></div>`); };
    let body = '';
    if (o.cat === 'horse') {
      add('Vida', fmt(o.hp, 0)); add('Fôlego (multiplicador)', '×' + fmt(o.stamina, 2));
      add('Velocidade andando', kmh(o.walk)); add('Velocidade trotando', kmh(o.jog)); add('Velocidade galopando', kmh(o.sprint));
      add('Força do pulo', fmt(o.jump, 0)); add('Degrau máximo', fmt(o.step, 0) + ' cm');
      add('Cura com comida', fmt(o.heal, 0) + ' por refeição'); add('Fome por segundo', fmt(o.foodLoss, 3)); add('Dano por fome', fmt(o.starve, 2) + '/s');
      const foods = Object.entries(o.food || {}).sort((a, b) => b[1] - a[1]);
      const sad = (D.saddles || []).map(s => ({ ...s, it: ITEMS[s.item] }));
      const horses = OTH.filter(x => x.cat === 'horse');
      body = `
        <h2>Comidas que o cavalo aceita</h2><p class="muted">Valor de comida que cada item dá ao cavalo.</p>
        <div class="recipe-flow">${foods.map(([id, v]) => ITEMS[id] ? `<a class="ing" href="${link(ITEMS[id])}">${img(ITEMS[id].icon)}${esc(nm(ITEMS[id]))} <b>+${fmt(v, 0)}</b></a>` : `<span class="ing">${esc(id)} <b>+${fmt(v, 0)}</b></span>`).join('')}</div>
        <h2>Selas (armazenamento)</h2><p class="muted">A sela equipada define quantos slots de inventário o cavalo carrega.</p>
        <div class="table-wrap"><table><thead><tr><th>Sela</th><th class="num">Slots</th><th>Como conseguir</th></tr></thead><tbody>
        ${sad.map(s => `<tr><td>${s.it ? itemCell(s.it) : esc(s.item)}</td><td class="num">${s.slots}</td>
          <td>${s.it && s.it.crafted.length ? `Fabricar: ${esc(STATION_PT[s.it.crafted[0].station] || s.it.crafted[0].station)}` : s.it && s.it.sources.length ? `Loot: <a href="#/local/${s.it.sources[0].table}">${esc(lootName(s.it.sources[0].table))}</a> (${pct(s.it.sources[0].chance)})` : '<span class="muted">—</span>'}</td></tr>`).join('')}
        </tbody></table></div>
        <h2>Onde encontrar</h2><div class="notice">Os cavalos não usam spawner aleatório: ficam colocados direto no mapa do jogo. Ao morrer, deixam uma bolsa com o que carregavam.</div>
        <h2>Pelagens</h2><div class="vgrid">${horses.map(x => `<a class="vcard ${x === o ? 'on' : ''}" href="${olink(x)}"><div class="vart">${opic(x, 120)}</div>
          <div class="vcard-body"><b>${esc(x.variant)}</b><div class="muted" style="font-size:.82rem">Vida ${fmt(x.hp, 0)} · Fôlego ×${fmt(x.stamina, 2)}</div></div></a>`).join('')}</div>`;
    } else if (o.cat === 'trailer') {
      body = `<h2>Vida das peças</h2><div class="table-wrap"><table><thead><tr><th>Peça</th><th class="num">Vida máxima</th></tr></thead><tbody>
        ${Object.entries(o.parts).map(([k, v]) => `<tr><td>${esc(k)}</td><td class="num">${fmt(v, 0)}</td></tr>`).join('')}</tbody></table></div>
        <div class="notice">O reboque é engatado na traseira dos carros e as peças podem ser danificadas por tiros e batidas. Se o engate quebrar, o reboque solta.</div>`;
    } else if (o.cat === 'air' && o.role === 'airdrop') {
      add('Velocidade', kmh(o.speed)); add('Controle', 'IA do jogo (não pilotável)');
      body = `<h2>O que faz</h2><div class="notice">O helicóptero atravessa o mapa e solta a caixa de <b>suprimento aéreo</b>. Veja o que pode vir na caixa em
        <a href="#/local/${o.loot}">${esc(lootName(o.loot))}</a>.</div>`;
    } else if (o.cat === 'air') {
      const EV = { BP_Node_Event_HeliCrash_Zombie: 'Versão com zumbis', BP_Node_Event_HeliCrash_Human: 'Versão com bandidos' };
      body = `<h2>Evento</h2><p class="muted">Um helicóptero cai em um ponto do mapa, marcado com um círculo vermelho no mapa, e o local fica guardado por inimigos.</p>
        ${Object.entries(o.events).map(([k, e]) => `<h3>${esc(EV[k] || k)}</h3><p>${e.count ? `${e.count} inimigos: ` : ''}${Object.entries(e.spawn).map(([z, n]) => `<span class="tag">${esc(z)} ×${n}</span>`).join(' ') || '<span class="muted">bandidos variados</span>'}</p>`).join('')}
        <h2>Loot nos destroços</h2><div class="table-wrap"><table><thead><tr><th>Contêiner</th><th>Tabela de loot</th></tr></thead><tbody>
        ${o.containers.map(([t, l]) => `<tr><td>${esc(l)}</td><td><a href="#/local/${t}">${esc(lootName(t))}</a></td></tr>`).join('')}</tbody></table></div>`;
    } else {
      body = `<div class="notice">Objeto de cenário: aparece no mapa, mas não pode ser pilotado nem usado.</div>`;
    }
    add('Blueprint', `<code>${esc(o.id)}</code>`);
    return `
      <div class="crumbs"><a href="#/">Início</a> › <a href="#/veiculos">Veículos</a> › ${esc(o.name.pt)}</div>
      <section class="item-head r-${OBADGE[o.cat][0]}">
        <div class="item-art car-art">${opic(o, 260)}</div>
        <div><div class="item-title"><h1>${esc(o.name.pt)}</h1>${obadge(o)}</div>
          <div class="alt-name">${esc(o.name.en)}</div>
          <p class="muted">${esc((VCATS.find(c => c.slice(3).includes(o.cat)) || [])[2] || '')}</p></div>
      </section>
      <dl class="kv">${kv.join('')}</dl>${body}`;
  }

  function pageVehicles(q) {
    const tab = q.tipo || 'carros';
    if (tab !== 'carros') {
      const c = VCATS.find(x => x[0] === tab) || VCATS[0];
      setTitle(c[1]);
      return `
        <div class="crumbs"><a href="#/">Início</a> › <a href="#/veiculos">Veículos</a> › ${esc(c[1])}</div>
        <h1>${esc(c[1])}</h1><p class="lead">${esc(c[2])}</p>${vtabs(tab)}
        <div class="vgrid">${OTH.filter(o => c.slice(3).includes(o.cat)).map(ocard).join('')}</div>`;
    }
    return pageCars(q);
  }
  const vtabs = cur => `<div class="chips" style="margin:14px 0">${VCATS.map(([k, l, , ...cats]) =>
    `<a class="chip ${cur === k ? 'on' : ''}" href="#/veiculos${k === 'carros' ? '' : '?tipo=' + k}">${esc(l)} (${k === 'carros' ? new Set(VEH.map(v => v.display)).size : oCount(cats)})</a>`).join('')}</div>`;

  function pageCars(q) {
    setTitle('Veículos');
    const models = {};
    for (const v of VEH) (models[v.display] = models[v.display] || []).push(v);
    const maxF = vmax('fuel'), maxH = vmax('hp'), maxS = vmax('slots');
    const groups = Object.entries(models).sort((a, b) => a[0].localeCompare(b[0]));
    const html = `
      <div class="crumbs"><a href="#/">Início</a> › Veículos</div>
      <h1>Veículos</h1>
      <p class="lead">Todos os veículos do jogo: ${groups.length} modelos de carro (${VEH.length} variantes), cavalos, reboque, helicópteros e os veículos de cenário.
        A raridade dos carros vem do spawner em que eles aparecem no mapa.</p>
      ${vtabs('carros')}
      <div class="notice">As imagens foram renderizadas a partir dos modelos 3D e materiais originais do jogo (malha, rodas, peças e pintura de cada variante).
        A iluminação é simplificada, então reflexos, sujeira e efeitos do motor gráfico não aparecem.</div>
      <div class="result-bar"><span>${groups.length} modelos</span>
        <span class="view-toggle"><button data-v="grid" class="${listView === 'grid' ? 'on' : ''}">Cards</button><button data-v="table" class="${listView === 'table' ? 'on' : ''}">Comparar</button></span></div>
      <div id="vres"></div>
      <h2>Spawners de veículos</h2>
      <p class="muted">Cada ponto de spawn no mapa tem uma chance de gerar um carro e sorteia um modelo da sua lista.</p>
      <div class="loc-grid">${Object.entries(D.carSpawners || {}).map(([k, s]) => `
        <div class="loc-card"><h3>${esc(s.label)} <small class="muted">· ${pct(s.chance)} de gerar carro</small></h3>
          <div class="muted"><code>${esc(k)}</code> · ${s.cars.length} entradas</div>
          <div class="recipe-flow" style="margin-top:8px">${[...new Set(s.cars)].map(id => { const v = VEH.find(x => x.id === id); return v ? `<a class="ing" href="${vlink(v)}">${esc(v.display)}${v.variant ? ` <small class="muted">${esc(v.variant)}</small>` : ''}</a>` : ''; }).join('')}</div></div>`).join('')}</div>
      <h2>Upgrades de veículos</h2>
      <p class="muted">Blindagens e melhorias feitas na bancada de veículos (<code>DT_CarUpgrades</code>).</p>
      ${(D.vehicleUpgrades || []).slice().sort((a, b) => (a.type + a.level).localeCompare(b.type + b.level)).map(u => upgradeBlock(u)).join('')}`;
    const after = () => {
      const render = () => {
        const el = document.getElementById('vres');
        if (listView === 'grid') {
          el.innerHTML = `<div class="vgrid">${groups.map(([name, vs]) => {
            const v = vs[0];
            return `<a class="vcard r-${v.tier}" href="${vlink(v)}">
              <div class="vart">${carPic(v, 150)}</div>
              <div class="vcard-body"><div class="item-title"><b>${esc(name)}</b>${vbadge(v)}</div>
                <div class="muted">${esc(BODY_PT[v.body] || v.body)} · Tração ${esc(DRIVE_PT(v.drive))}</div>
                ${statBar('Combustível', v.fuel, maxF)}${statBar('Vida', v.hp, maxH)}${statBar('Porta-malas', v.slots, maxS, ' slots')}
                <div class="muted" style="font-size:.82rem">${v.seats} assentos · ${fmt(v.mass, 0)} kg${vs.length > 1 ? ` · ${vs.length} variantes` : ''}</div>
              </div></a>`;
          }).join('')}</div>`;
        } else {
          const cols = [['display', 'Modelo'], ['body', 'Tipo'], ['tier', 'Raridade'], ['fuel', 'Combustível'], ['hp', 'Vida'], ['slots', 'Porta-malas'], ['seats', 'Assentos'], ['mass', 'Massa (kg)'], ['rpm', 'RPM máx.'], ['drive', 'Tração']];
          let sk = el.dataset.sort || 'display', dir = +(el.dataset.dir || 1);
          const rows = VEH.slice().sort((a, b) => {
            const x = sk === 'tier' ? VTIER_ORDER.indexOf(a.tier) : a[sk], y = sk === 'tier' ? VTIER_ORDER.indexOf(b.tier) : b[sk];
            return (typeof x === 'number' ? x - y : String(x).localeCompare(String(y))) * dir;
          });
          el.innerHTML = `<div class="table-wrap"><table><thead><tr>${cols.map(([k, l]) => `<th class="sortable ${['fuel', 'hp', 'slots', 'seats', 'mass', 'rpm'].includes(k) ? 'num' : ''}" data-k="${k}">${l}${sk === k ? (dir > 0 ? ' ▲' : ' ▼') : ''}</th>`).join('')}</tr></thead><tbody>
            ${rows.map(v => `<tr><td><a class="item-cell" href="${vlink(v)}">${carPic(v, 40)}<span>${esc(v.display)}${v.variant ? ` <small class="muted">${esc(v.variant)}</small>` : ''}</span></a></td>
              <td>${esc(BODY_PT[v.body] || v.body)}</td><td>${vbadge(v)}</td><td class="num">${fmt(v.fuel, 0)}</td><td class="num">${fmt(v.hp, 0)}</td>
              <td class="num">${v.slots ?? '—'}</td><td class="num">${v.seats ?? '—'}</td><td class="num">${fmt(v.mass, 0)}</td><td class="num">${fmt(v.rpm, 0)}</td><td>${esc(DRIVE_PT(v.drive))}</td></tr>`).join('')}
            </tbody></table></div>`;
          el.querySelectorAll('th.sortable').forEach(th => th.onclick = () => {
            el.dataset.dir = el.dataset.sort === th.dataset.k ? -dir : (['display', 'body', 'drive', 'tier'].includes(th.dataset.k) ? 1 : -1);
            el.dataset.sort = th.dataset.k; render();
          });
        }
      };
      document.querySelector('.view-toggle').addEventListener('click', e => {
        const b = e.target.closest('button'); if (!b) return;
        listView = b.dataset.v; try { localStorage.setItem('hz-view', listView); } catch (err) { }
        document.querySelectorAll('.view-toggle button').forEach(x => x.classList.toggle('on', x === b));
        render();
      });
      render();
    };
    return { html, after };
  }

  const upName = u => u.id === 'CarTire' ? 'Pneu (instalação)' : u.id === 'BadCarTire' ? 'Pneu ruim (instalação)'
    : `${u.id.startsWith('CarUpgradeWheels') ? 'Proteção das rodas' : UPTYPE_PT[u.type] || u.type} — Nível ${u.level}`;

  function upgradeBlock(u, car) {
    const fitting = car ? '' : `<div class="muted" style="font-size:.82rem;margin-top:8px">Serve em: ${[...new Set(u.cars.map(id => VEH.find(v => v.id === id)?.display).filter(Boolean))].map(esc).join(', ') || '—'}</div>`;
    return `<div class="recipe">
      <div class="recipe-head"><span class="item-cell">${u.icon ? `<img src="${esc(u.icon)}" alt="">` : ''}<b>${esc(upName(u))}</b></span>
        <span>${u.health ? `<span class="tag">Vida: ${fmt(u.health, 0)}</span>` : ''} ${u.minutes ? `<span class="tag">${fmt(u.minutes)} min</span>` : ''}</span></div>
      <div class="recipe-flow">${u.cost.length ? u.cost.map(([id, n]) => ing(id, n)).join('') : '<span class="muted">Sem custo de fabricação (instalar o item)</span>'}</div>${fitting}</div>`;
  }

  function pageVehicle(id) {
    const other = OTH.find(x => x.id === id);
    if (other) return pageOther(other);
    const v = VEH.find(x => x.id === id);
    if (!v) return `<div class="empty-state"><h1>Veículo não encontrado</h1><p><a href="#/veiculos">Voltar</a></p></div>`;
    setTitle(v.display);
    const variants = VEH.filter(x => x.display === v.display);
    const kv = [];
    const add = (k, val) => { if (val !== null && val !== undefined && val !== '') kv.push(`<div><dt>${k}</dt><dd>${val}</dd></div>`); };
    add('Tipo', esc(BODY_PT[v.body] || v.body));
    add('Tração', esc(DRIVE_PT(v.drive)));
    add('Tanque de combustível', fmt(v.fuel, 0));
    add('Vida máxima', fmt(v.hp, 0));
    add('Porta-malas', v.slots != null ? v.slots + ' slots' : null);
    if (v.weaponSlots) add('Slots de arma', v.weaponSlots);
    add('Assentos', v.seats);
    add('Massa', fmt(v.mass, 0) + ' kg');
    add('RPM máximo', fmt(v.rpm, 0));
    if (v.drain) add('Fator de consumo', fmt(v.drain, 2));
    if (v.noise) add('Alcance do barulho do motor', fmt(v.noise / 100, 0) + ' m');
    add('Blueprint', `<code>${esc(v.id)}</code>`);
    const maxF = vmax('fuel'), maxH = vmax('hp'), maxS = vmax('slots'), maxM = vmax('mass'), maxR = vmax('rpm');
    const ups = v.upgrades.map(u => VUP[u]).filter(Boolean).sort((a, b) => (a.type + a.level).localeCompare(b.type + b.level));
    return `
      <div class="crumbs"><a href="#/">Início</a> › <a href="#/veiculos">Veículos</a> › ${esc(v.display)}</div>
      <section class="item-head r-${v.tier}">
        <div class="item-art car-art">${carPic(v, 230)}</div>
        <div>
          <div class="item-title"><h1>${esc(v.display)}</h1>${vbadge(v)}</div>
          <div class="alt-name">${esc(BODY_PT[v.body] || v.body)}${v.variant ? ' · variante ' + esc(v.variant) : ''}</div>
          <div class="vstats">${statBar('Combustível', v.fuel, maxF)}${statBar('Vida', v.hp, maxH)}${statBar('Porta-malas', v.slots, maxS, ' slots')}
            ${statBar('Massa', v.mass, maxM, ' kg')}${statBar('RPM máx.', v.rpm, maxR)}</div>
        </div>
      </section>
      <dl class="kv">${kv.join('')}</dl>
      ${variants.length > 1 ? `<h2>Variantes</h2><div class="vgrid">${variants.map(x => `
        <a class="vcard r-${x.tier} ${x === v ? 'on' : ''}" href="${vlink(x)}"><div class="vart">${carPic(x, 110)}</div>
          <div class="vcard-body"><b>${esc(x.variant || 'Padrão')}</b><div class="muted" style="font-size:.82rem">Vida ${fmt(x.hp, 0)} · ${x.slots} slots · ${fmt(x.fuel, 0)} comb.</div></div></a>`).join('')}</div>` : ''}
      <h2>Onde aparece</h2>
      ${v.spawns.length ? `<div class="table-wrap"><table><thead><tr><th>Spawner</th><th class="num">Chance de gerar carro</th><th class="num">Chance de ser este modelo</th><th class="num">Chance final por ponto</th></tr></thead><tbody>
        ${v.spawns.map(s => `<tr><td>Spawner ${esc(s.label.toLowerCase())} <small class="muted"><code>${esc(s.spawner)}</code></small></td>
          <td class="num">${pct(s.chance)}</td><td class="num">${pct(s.share)}</td><td class="num">${pct(s.eff)}</td></tr>`).join('')}
        </tbody></table></div>`
        : `<div class="notice">Este veículo não está em nenhum spawner aleatório: aparece só em locais fixos, eventos ou por spawn de administrador (<code>${esc(v.spawnId || v.id)}</code>).</div>`}
      ${v.parts.length ? `<h2>Peças do motor</h2>
        <p class="muted">Chance de cada peça já vir instalada quando o carro aparece, e quanto ela se desgasta com o uso.</p>
        <div class="table-wrap"><table><thead><tr><th>Peça</th><th class="num">Chance de vir instalada</th><th class="num">Durabilidade inicial</th><th class="num">Desgaste</th></tr></thead><tbody>
        ${v.parts.map(pt => { const key = { CarBattery: 'Battery', StarterMotor: 'Starter', FuelPump: 'FuelPump', FanBelt: 'FanBelt' }[pt.item];
          return `<tr><td>${ITEMS[pt.item] ? itemCell(ITEMS[pt.item]) : esc(PART_PT[pt.item] || pt.item)}</td><td class="num">${pct(pt.chance)}</td>
          <td class="num">${pt.dur ? `${fmt(pt.dur[0], 0)}–${fmt(pt.dur[1], 0)}%` : '—'}</td><td class="num">${v.wear[key] != null ? fmt(v.wear[key], 4) : '—'}</td></tr>`; }).join('')}
        </tbody></table></div>` : ''}
      ${ups.length ? `<h2>Upgrades disponíveis</h2>${ups.map(u => upgradeBlock(u, v)).join('')}` : `<h2>Upgrades</h2><p class="muted">Este veículo não tem upgrades na bancada.</p>`}`;
  }

  // ---------------------------------------------------------------------------
  // Roteador
  // ---------------------------------------------------------------------------
  let mapCleanup = null;
  function route() {
    if (mapCleanup) { mapCleanup(); mapCleanup = null; }
    const [h, anchor] = location.hash.replace(/^#\/?/, '').split('#');
    const [path, qs] = h.split('?');
    const parts = path.split('/').map(decodeURIComponent);
    const q = parseQuery(qs);
    let res;
    let key = parts[0] || 'home';
    switch (key) {
      case 'itens': res = pageItems(q); break;
      case 'item': res = pageItem(parts[1]); key = 'itens'; break;
      case 'raridade': res = pageRarity(); break;
      case 'locais': res = pageLocations(); break;
      case 'local': res = pageLocation(parts[1]); key = 'locais'; break;
      case 'receitas': res = pageRecipes(q); break;
      case 'construcoes': res = pageBuildings(); break;
      case 'municao': res = pageAmmo(); break;
      case 'mapa':
        setTitle('Mapa');
        res = window.HZMapPage ? { html: HZMapPage.html(), after: () => { mapCleanup = HZMapPage.mount(q); } }
          : `<div class="empty-state">Dados do mapa não encontrados.</div>`;
        break;
      case 'veiculos': res = pageVehicles(q); break;
      case 'veiculo': res = pageVehicle(parts[1]); key = 'veiculos'; break;
      default: res = pageHome(); key = 'home';
    }
    const html = typeof res === 'string' ? res : res.html;
    document.body.classList.toggle('map-mode', key === 'mapa');
    app.innerHTML = html;
    if (res.after) res.after();
    if (key === 'home') {
      document.getElementById('heroForm').addEventListener('submit', e => {
        e.preventDefault();
        location.hash = '#/itens?q=' + encodeURIComponent(document.getElementById('heroInput').value);
      });
    }
    document.querySelectorAll('#nav a').forEach(a => a.classList.toggle('active', a.dataset.route === key));
    document.getElementById('nav').classList.remove('open');
    if (anchor) { const el = document.getElementById(anchor); if (el) { el.scrollIntoView(); return; } }
    window.scrollTo(0, 0);
  }

  // ---------------------------------------------------------------------------
  // Busca global e idioma
  // ---------------------------------------------------------------------------
  const gs = document.getElementById('globalSearch');
  const pop = document.getElementById('searchPop');
  let sel = -1;
  const renderPop = () => {
    const v = gs.value.trim();
    if (!v) { pop.hidden = true; return; }
    const n = norm(v);
    const r = searchItems(v).sort((a, b) => (norm(nm(a)).startsWith(n) ? 0 : 1) - (norm(nm(b)).startsWith(n) ? 0 : 1) || byName(a, b)).slice(0, 10);
    sel = -1;
    pop.innerHTML = r.length ? r.map(i => `<a href="${link(i)}" class="r-${i.tier}">${img(i.icon)}<span>${esc(nm(i))}<br><small class="muted">${esc(typePt(i.type))}</small></span>${badge(i.tier)}</a>`).join('')
      + `<a href="#/itens?q=${encodeURIComponent(v)}"><span class="muted">Ver todos os resultados →</span></a>`
      : `<div class="empty">Nada encontrado.</div>`;
    pop.hidden = false;
  };
  gs.addEventListener('input', renderPop);
  gs.addEventListener('focus', renderPop);
  gs.addEventListener('keydown', e => {
    const links = [...pop.querySelectorAll('a')];
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length;
      links.forEach((a, i) => a.classList.toggle('sel', i === sel));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const a = links[sel] || links[0];
      if (a) location.hash = a.getAttribute('href');
      pop.hidden = true; gs.blur();
    } else if (e.key === 'Escape') { pop.hidden = true; gs.blur(); }
  });
  document.addEventListener('click', e => { if (!e.target.closest('.global-search')) pop.hidden = true; });
  pop.addEventListener('click', () => { pop.hidden = true; gs.value = ''; });

  const langBtn = document.getElementById('langBtn');
  const paintLang = () => { langBtn.textContent = lang.toUpperCase(); langBtn.title = lang === 'pt' ? 'Mostrar nomes em inglês' : 'Mostrar nomes em português'; };
  langBtn.addEventListener('click', () => {
    lang = lang === 'pt' ? 'en' : 'pt';
    try { localStorage.setItem('hz-lang', lang); } catch (e) { }
    paintLang(); route();
  });
  paintLang();

  document.getElementById('menuBtn').addEventListener('click', () => document.getElementById('nav').classList.toggle('open'));
  window.addEventListener('hashchange', route);
  route();
})();
