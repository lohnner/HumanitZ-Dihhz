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
  // plantações -> sementes e colheitas
  const SURV = D.survival || { crops: [], plots: [], traps: [], trapWeapons: [], repairs: {} };
  for (const c of SURV.crops) for (const id of [c.seed, c.out]) if (ITEMS[id]) ITEMS[id].crop = c;
  // missões -> itens pedidos e itens dados como recompensa
  const QLIST = D.quests || [];
  const QBYID = Object.fromEntries(QLIST.map(q => [q.id, q]));
  const questVisible = q => q.known || q.cat === 'main';
  for (const it of list) { it.questAsk = []; it.questReward = []; }
  for (const q of QLIST.filter(questVisible)) {
    for (const o of q.obj) if (o.i && ITEMS[o.i] && !ITEMS[o.i].questAsk.includes(q)) ITEMS[o.i].questAsk.push(q);
    for (const [id] of q.rw.items) if (ITEMS[id]) ITEMS[id].questReward.push(q);
  }

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
          Tudo extraído direto dos arquivos do jogo instalado. Começando agora? Veja o <a href="#/guia">guia para iniciantes</a>.</p>
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
        <a class="stat" href="#/armas"><b>${WLIST.length}</b><span>armas com status</span></a>
        <a class="stat" href="#/missoes"><b>${QLIST.filter(questVisible).length}</b><span>missões</span></a>
        <a class="stat" href="#/personagem"><b>${skillCount}</b><span>skills</span></a>
        <a class="stat" href="#/bestiario"><b>${BEAST.length}</b><span>criaturas</span></a>
        <a class="stat" href="#/recrutas"><b>${REC.people.length}</b><span>recrutas</span></a>
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
      ${weaponBlock(it)}

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

      ${it.crop ? `<h2>Plantio</h2><p>Cresce em <b>${it.crop.seasons.join(' e ').toLowerCase()}</b>, em ${fmt(it.crop.days, 1)} dias. <a href="#/cultivo/plantio">Ver o calendário completo →</a></p>` : ''}
      ${it.questReward.length ? `<h2>Recompensa de missões</h2><p>${it.questReward.map(q => qRef(q.id)).join(', ')}</p>` : ''}
      ${it.questAsk.length ? `<h2>Pedido em missões</h2><p>${it.questAsk.map(q => qRef(q.id)).join(', ')}</p>` : ''}

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
  function pageLocations(q) {
    setTitle('Onde encontrar');
    const tables = Object.keys(D.loot).sort((a, b) => lootName(a).localeCompare(lootName(b), 'pt-BR'));
    const cardT = t => {
      const rows = D.loot[t].filter(r => r[1] > 0 && ITEMS[r[0]]);
      const top = rows.slice().sort((a, b) => b[1] - a[1]).slice(0, 7).map(r => ITEMS[r[0]]).filter(i => i.icon);
      return `<a class="loc-card" href="#/local/${t}" data-table="${esc(t)}" data-label="${esc(norm(lootName(t) + ' ' + lootDesc(t)))}"><h3>${esc(lootName(t))}</h3>
        <div class="muted">${esc(lootDesc(t))}</div><small class="muted">${rows.length} itens possíveis</small><small class="loc-hit" hidden></small>
        <div class="icons">${top.map(i => `<img src="${esc(i.icon)}" alt="${esc(nm(i))}" title="${esc(nm(i))}" loading="lazy">`).join('')}</div></a>`;
    };
    const cardC = c => {
      const rows = D.loot[c.table].filter(r => r[1] > 0 && ITEMS[r[0]]);
      const top = rows.slice().sort((a, b) => b[1] - a[1]).slice(0, 7).map(r => ITEMS[r[0]]).filter(i => i.icon);
      return `<a class="loc-card" href="#/conteiner/${esc(c.id)}" data-table="${esc(c.table)}" data-label="${esc(norm(containerName(c) + ' ' + lootName(c.table)))}"><h3>${esc(containerName(c))}</h3>
        <div class="muted">${esc(lootName(c.table))}</div><small class="muted">${rows.length} itens possíveis · ${range(c.slots)} espaços</small><small class="loc-hit" hidden></small>
        <div class="icons">${top.map(i => `<img src="${esc(i.icon)}" alt="${esc(nm(i))}" title="${esc(nm(i))}" loading="lazy">`).join('')}</div></a>`;
    };
    const section = (title, cards, note = '') => `<section class="loc-section"><h2>${title}</h2>${note}<div class="loc-grid">${cards}</div></section>`;
    const html = `
      <div class="crumbs"><a href="#/">Início</a> › Onde encontrar</div>
      <h1>Locais e contêineres de loot</h1>
      <p class="lead">Clique em um móvel, como o guarda-roupa, para ver tudo o que pode ter dentro e a chance de cada item.</p>
      <div class="filters" style="grid-template-columns:1fr"><label>Buscar móvel, local ou item<input id="locq" type="search" value="${esc(q.q || '')}" placeholder="Ex.: guarda-roupa, geladeira, camiseta…"></label></div>
      <div class="result-bar"><span id="locCount"></span></div>
      ${Object.entries(CONT_GROUP).map(([g, label]) => {
        const rows = CONTAINERS.filter(c => c.group === g).sort((a, b) => containerName(a).localeCompare(containerName(b), 'pt-BR'));
        return rows.length ? section(esc(label), rows.map(cardC).join('')) : '';
      }).join('')}
      ${section('Todas as tabelas de loot', tables.filter(t => !isTrader(t)).map(cardT).join(''), '<p class="muted">As listas de loot do jogo, incluindo as que não têm um móvel específico.</p>')}
      ${section('Comerciantes', tables.filter(isTrader).map(cardT).join(''))}
      <div class="empty-state" id="locEmpty" hidden>Nada encontrado com essa busca.</div>`;
    const after = () => {
      const input = document.getElementById('locq');
      const cards = [...document.querySelectorAll('#app a.loc-card')];
      const itemsOf = {};
      for (const t of Object.keys(D.loot)) itemsOf[t] = D.loot[t].filter(r => r[1] > 0 && ITEMS[r[0]]).sort((a, b) => b[1] - a[1]).map(r => ITEMS[r[0]]);
      // "guarda roupa" e "guarda-roupa" valem o mesmo
      const plain = s => norm(s).replace(/[^a-z0-9]+/g, ' ').trim();
      const apply = () => {
        const n = plain(input.value);
        let shown = 0;
        for (const card of cards) {
          const label = plain(card.dataset.label);
          const hits = n && !label.includes(n) ? itemsOf[card.dataset.table].filter(i => plain(i.name?.pt).includes(n) || plain(i.name?.en).includes(n)) : [];
          const ok = !n || label.includes(n) || hits.length > 0;
          card.hidden = !ok;
          if (ok) shown++;
          const hit = card.querySelector('.loc-hit');
          hit.hidden = !hits.length;
          hit.textContent = hits.length ? `Tem: ${hits.slice(0, 3).map(nm).join(', ')}${hits.length > 3 ? ` e mais ${hits.length - 3}` : ''}` : '';
        }
        document.querySelectorAll('#app .loc-section').forEach(s => { s.hidden = !s.querySelector('a.loc-card:not([hidden])'); });
        document.getElementById('locEmpty').hidden = shown > 0;
        document.getElementById('locCount').textContent = `${shown} ${shown === 1 ? 'resultado' : 'resultados'}`;
        history.replaceState(null, '', '#/locais' + (input.value ? '?q=' + encodeURIComponent(input.value) : ''));
      };
      let timer;
      input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(apply, 120); });
      apply();
    };
    return { html, after };
  }

  const CONTAINERS = D.containers || [];
  const CONT_GROUP = { casa: 'Em casa', comercio: 'Lojas e comércio', veiculo: 'Veículos', fora: 'Ao ar livre', militar: 'Militar e esconderijos', corpo: 'Corpos e covas' };
  const LOWER_WORDS = new Set(['de', 'da', 'do', 'das', 'dos', 'e']);
  // O jogo escreve muitos nomes em maiúsculas
  const containerName = c => {
    const s = txt(c.name);
    if (s !== s.toUpperCase()) return s;
    return s.toLowerCase().split(' ').map((w, i) => i && LOWER_WORDS.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  function pageContainer(id) {
    const c = CONTAINERS.find(x => x.id === id);
    if (!c) return `<div class="empty-state"><h1>Contêiner não encontrado</h1><p><a href="#/locais">Voltar</a></p></div>`;
    const title = containerName(c);
    setTitle(title);
    const sum = tableSum[c.table];
    const rows = D.loot[c.table].filter(r => ITEMS[r[0]] && r[1] > 0).sort((a, b) => b[1] - a[1] || byName(ITEMS[a[0]], ITEMS[b[0]]));
    const others = CONTAINERS.filter(x => x.table === c.table && x !== c);
    const html = `
      <div class="crumbs"><a href="#/">Início</a> › <a href="#/locais">Onde encontrar</a> › ${esc(title)}</div>
      <h1>${esc(title)}</h1>
      <dl class="kv">
        <div><dt>Itens possíveis</dt><dd>${rows.length}</dd></div>
        <div><dt>Espaços</dt><dd>${range(c.slots)}</dd></div>
        <div><dt>Sorteios de item</dt><dd>${range(c.rolls)}</dd></div>
        <div><dt>Chance de surgir um zumbi</dt><dd>${fmt(c.zombie, 0)}%</dd></div>
        <div><dt>Tabela de loot</dt><dd><a href="#/local/${esc(c.table)}">${esc(lootName(c.table))}</a></dd></div>
      </dl>
      ${mapBtn(c.table) ? `<p style="margin-top:14px">${mapBtn(c.table)}</p>` : ''}
      ${others.length ? `<p class="muted">Usa a mesma lista de: ${others.map(x => `<a href="#/conteiner/${esc(x.id)}">${esc(containerName(x))}</a>`).join(', ')}.</p>` : ''}
      <h2>O que pode ter dentro</h2>
      <div class="filters" style="grid-template-columns:1fr"><label>Buscar nesta lista<input id="cq" type="search" placeholder="Nome do item…"></label></div>
      <div class="table-wrap"><table><thead><tr><th>Item</th><th>Categoria</th><th>Raridade aqui</th><th>Chance</th><th class="num">Participação</th></tr></thead><tbody id="cRows">
      ${rows.map(([rid, ch]) => { const it = ITEMS[rid], tr = tierOf(ch).id; return `<tr class="r-${tr}" data-n="${esc(norm(nm(it)) + ' ' + norm(altNm(it)))}">
        <td>${itemCell(it)}</td><td>${esc(typePt(it.type))}</td><td>${badge(tr)}</td>
        <td><div class="bar-cell"><div class="bar"><i style="width:${Math.min(100, ch)}%"></i></div><span>${pct(ch)}</span></div></td>
        <td class="num">${pct(ch / sum * 100)}</td></tr>`; }).join('')}
      </tbody></table></div>
      <div class="notice"><b>Como ler:</b> "Chance" é o valor <code>ChanceToSpawn</code> do item nesta lista, e "Participação" é a fatia aproximada dele no total da lista. Não é a chance exata de encontrar o item ao abrir um móvel, porque o jogo faz vários sorteios e a dificuldade pode mudar o resultado. Alguns móveis colocados no mapa podem usar outra lista.</div>`;
    const after = () => {
      document.getElementById('cq').addEventListener('input', e => {
        const n = norm(e.target.value).trim();
        document.querySelectorAll('#cRows tr').forEach(tr => { tr.hidden = !!n && !tr.dataset.n.includes(n); });
      });
    };
    return { html, after };
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
              <span>${b.hp ? `<span class="tag">Vida: ${fmt(b.hp, 0)}</span>` : ''} ${b.tool ? '<span class="tag">Requer martelo</span>' : ''}
                ${SURV.repairs[b.id] ? `<span class="tag">Reparo: ${esc(repairText(SURV.repairs[b.id]))} = +${fmt(SURV.repairs[b.id].hp, 0)} de vida</span>` : ''}</span></div>
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
  // Armas
  // ---------------------------------------------------------------------------
  const WEAP = D.weapons || {};
  const WTABS = { fogo: 'Armas de fogo', pistol: 'Pistolas', rifle: 'Armas longas', shotgun: 'Escopetas', bow: 'Arcos e bestas', special: 'Especiais', melee: 'Corpo a corpo', thrown: 'Arremessáveis' };
  const WRANGED = ['pistol', 'rifle', 'shotgun', 'bow', 'special'];
  const CMP_MAX = 4;
  // Linhas só de loot repetem a mesma arma com outra grafia: fica a que tem mais chance de spawn
  const WLIST = Object.values(Object.keys(WEAP).filter(id => ITEMS[id]).map(id => ITEMS[id]).reduce((seen, it) => {
    const key = norm(it.id), cur = seen[key];
    if (!cur || it.best > cur.best) seen[key] = it;
    return seen;
  }, {}));
  const weapUses = w => w.dur ? Math.round(w.maxDur / w.dur) : null;
  const ammoLink = id => ITEMS[id] ? `<a href="${link(ITEMS[id])}">${esc(nm(ITEMS[id]))}</a>` : esc(id || '');
  const num = (v, d, unit = '') => v === null || v === undefined ? '—' : fmt(v, d) + unit;
  // better: 1 = maior é melhor, -1 = menor é melhor (usado para destacar no comparador)
  const WCLASS = { Light: 'Leve', Medium: 'Média', Heavy: 'Pesada' };
  const WEDGE = { Bladed: 'Lâmina', Blunt: 'Contundente' };
  const WCLASS_RANK = { Light: 1, Medium: 2, Heavy: 3 };
  // Skills que o jogo aplica a cada classe (GetMeleeDamage, GetStaminaCost e GetPlayRateSpeedMod de BPC_WeaponMelee)
  const WCLASS_SKILLS = {
    Light: ['LightBladedDamage', 'LightBlunt', 'LightCombo', 'LightStamina', 'SwiftStrikes'],
    Medium: ['MediumBladedDamage', 'MediumBlunt', 'MediumCombo', 'MediumStamina'],
    Heavy: ['HeavyBladed', 'HeavyBlunt', 'HeavyStamina', 'PowerHouse']
  };
  const WSTAT = {
    class: { label: 'Classe', text: true, val: (it, w) => WCLASS_RANK[w.weight] || 0, show: (it, w) => w.weight ? `<a href="#/armas?tipo=melee&classe=${w.weight}">${WCLASS[w.weight]}</a>` : '—' },
    edge: { label: 'Tipo', text: true, val: (it, w) => w.edge ? WEDGE[w.edge] : null, show: (it, w) => w.edge ? WEDGE[w.edge] : '—' },
    dmg: { label: 'Dano', better: 1, val: (it, w) => w.dmg ? w.dmg * (w.pellets || 1) : null, show: (it, w) => w.dmg ? fmt(w.dmg) + (w.pellets > 1 ? ` <small class="muted">× ${w.pellets}</small>` : '') : '<span title="O dano vem de explosão ou efeito">—</span>' },
    ammo: { label: 'Munição', text: true, val: (it, w) => w.ammo ? nm(ITEMS[w.ammo] || { id: w.ammo }) : null, show: (it, w) => w.ammo ? ammoLink(w.ammo) : '—' },
    mag: { label: 'Pente', better: 1, val: (it, w) => w.mag, show: (it, w) => num(w.mag, 0) },
    auto: { label: 'Automática', text: true, val: (it, w) => w.auto ? 'Sim' : 'Não', show: (it, w) => w.auto ? 'Sim' : 'Não' },
    gap: { label: 'Intervalo', better: -1, val: (it, w) => Math.max(w.fr || 0, w.delay || 0), show: (it, w) => num(Math.max(w.fr || 0, w.delay || 0), 2, ' s') },
    // Arcos e especiais disparam projéteis físicos: o traço de alcance herdado não vale para eles
    range: { label: 'Alcance', better: 1, val: (it, w) => w.k === 'bow' || w.k === 'special' ? null : w.range / 100, show: (it, w) => w.k === 'bow' || w.k === 'special' ? '—' : num(w.range / 100, 0, ' m') },
    noise: { label: 'Ruído', better: -1, val: (it, w) => w.noise / 100, show: (it, w) => num(w.noise / 100, 0, ' m') },
    stam: { label: 'Fôlego por golpe', better: -1, val: (it, w) => w.stam, show: (it, w) => num(w.stam, 2) },
    hs: { label: 'Golpe na cabeça', better: 1, val: (it, w) => w.hs, show: (it, w) => num(w.hs, 1, '%') },
    uses: { label: 'Usos até quebrar', better: 1, val: (it, w) => weapUses(w), show: (it, w) => num(weapUses(w), 0) },
    bld: { label: 'Contra construções', better: 1, val: (it, w) => w.bld, show: (it, w) => w.bld === undefined ? '—' : '×' + fmt(w.bld, 2) },
    res: { label: 'Contra recursos', better: 1, val: (it, w) => w.res, show: (it, w) => num(w.res, 1) },
    weight: { label: 'Peso', better: -1, val: it => it.weight, show: it => fmt(it.weight, 2) + ' kg' },
    best: { label: 'Raridade', val: it => it.best || 999, show: it => badge(it.tier) }
  };
  const WCOLS_RANGED = ['dmg', 'ammo', 'mag', 'auto', 'gap', 'range', 'noise', 'uses', 'weight', 'best'];
  const WCOLS_MELEE = ['class', 'edge', 'dmg', 'stam', 'hs', 'uses', 'bld', 'res', 'weight', 'best'];
  const WCOLS_THROWN = ['weight', 'best'];
  const wCols = tab => tab === 'melee' ? WCOLS_MELEE : tab === 'thrown' ? WCOLS_THROWN : WCOLS_RANGED;
  const wInTab = (w, tab) => tab === 'fogo' ? WRANGED.includes(w.k) : w.k === tab;

  function pageWeapons(q) {
    setTitle('Armas');
    const html = `
      <div class="crumbs"><a href="#/">Início</a> › Armas</div>
      <h1>Armas</h1>
      <p class="lead">Status de ${WLIST.length} armas, lidos direto dos blueprints do jogo. Clique no título de uma coluna para ordenar e marque até ${CMP_MAX} armas para comparar.</p>
      <div class="filters" style="grid-template-columns:1fr">
        <label>Buscar arma<input id="wq" type="search" value="${esc(q.q || '')}" placeholder="Ex.: AK47, katana, escopeta…"></label>
      </div>
      <div class="chips" id="wTabs">${Object.entries(WTABS).map(([k, v]) => `<button class="chip" data-t="${k}">${esc(v)}</button>`).join('')}</div>
      <div id="wClasses"></div>
      <div id="wCompare"></div>
      <div class="result-bar"><span id="wCount"></span></div>
      <div id="wTable"></div>
      <div class="notice">
        <b>Como ler:</b> são os valores-base da arma, sem bônus de skills, munição especial ou dificuldade.
        Em "45 × 3", cada disparo solta 3 projéteis de 45 de dano, e a ordenação usa o total.
        "Intervalo" é uma estimativa: o jogo guarda dois tempos de disparo e usamos o maior.
        "Usos até quebrar" considera a arma com durabilidade cheia.
        Lançadores e explosivos mostram "—" porque o dano deles vem da explosão, não deste valor.
        A classe corpo a corpo (leve, média ou pesada) é definida pelo próprio jogo para cada arma e decide quais skills valem para ela, então não depende do tamanho ou do dano aparente.
      </div>`;
    return { html, after: () => bindWeapons(q) };
  }

  function bindWeapons(q) {
    const $ = id => document.getElementById(id);
    const state = {
      q: q.q || '', tipo: WTABS[q.tipo] ? q.tipo : 'fogo', ordem: q.ordem || '', asc: q.dir === 'asc',
      classe: WCLASS[q.classe] ? q.classe : '', corte: WEDGE[q.corte] ? q.corte : '',
      cmp: (q.cmp || '').split(',').filter(id => WEAP[id] && ITEMS[id]).slice(0, CMP_MAX)
    };
    const sync = () => {
      const p = new URLSearchParams();
      if (state.q) p.set('q', state.q);
      if (state.tipo !== 'fogo') p.set('tipo', state.tipo);
      if (state.tipo === 'melee' && state.classe) p.set('classe', state.classe);
      if (state.tipo === 'melee' && state.corte) p.set('corte', state.corte);
      if (state.ordem) { p.set('ordem', state.ordem); if (state.asc) p.set('dir', 'asc'); }
      if (state.cmp.length) p.set('cmp', state.cmp.join(','));
      history.replaceState(null, '', '#/armas' + (p.toString() ? '?' + p : ''));
    };
    const renderClasses = () => {
      if (state.tipo !== 'melee') { $('wClasses').innerHTML = ''; return; }
      const melee = WLIST.filter(it => WEAP[it.id].k === 'melee');
      const avg = (rows, key) => rows.reduce((n, it) => n + (WEAP[it.id][key] || 0), 0) / (rows.length || 1);
      $('wClasses').innerHTML = `
        <div class="class-cards">${Object.entries(WCLASS).map(([k, v]) => {
          const rows = melee.filter(it => WEAP[it.id].weight === k);
          const on = state.classe === k;
          const skills = WCLASS_SKILLS[k].map(id => SKILL['Melee.' + id]).filter(Boolean);
          return `<button class="class-card ${on ? 'on' : ''}" data-classe="${k}" aria-pressed="${on}"><b>${v}</b>
            <small>${rows.length} armas · dano médio ${fmt(avg(rows, 'dmg'), 0)} · fôlego médio ${fmt(avg(rows, 'stam'), 1)}</small></button>`;
        }).join('')}</div>
        <div class="chips" id="wEdges"><button class="chip ${!state.corte ? 'on' : ''}" data-corte="">Todos os tipos</button>
          ${Object.entries(WEDGE).map(([k, v]) => `<button class="chip ${state.corte === k ? 'on' : ''}" data-corte="${k}">${v}</button>`).join('')}</div>
        ${state.classe ? `<div class="notice"><b>Skills da classe ${esc(WCLASS[state.classe]).toLowerCase()}:</b>
          ${WCLASS_SKILLS[state.classe].map(id => SKILL['Melee.' + id]).filter(Boolean).map(s => `${esc(txt(s.name))} <small>(${esc(txt(s.desc))})</small>`).join(' · ')}</div>` : ''}`;
    };
    const renderCompare = () => {
      if (!state.cmp.length) { $('wCompare').innerHTML = ''; return; }
      const its = state.cmp.map(id => ITEMS[id]);
      const stats = [...new Set(its.flatMap(it => wCols(WEAP[it.id].k === 'melee' ? 'melee' : WEAP[it.id].k === 'thrown' ? 'thrown' : 'fogo')))];
      const hasStat = (s, it) => wCols(WEAP[it.id].k === 'melee' ? 'melee' : WEAP[it.id].k === 'thrown' ? 'thrown' : 'fogo').includes(s);
      $('wCompare').innerHTML = `<h2>Comparando</h2><div class="table-wrap"><table><thead><tr><th></th>
        ${its.map(it => `<th><div class="cmp-head">${itemCell(it)}<button class="cmp-x" data-rm="${esc(it.id)}" aria-label="Remover ${esc(nm(it))} da comparação" title="Remover">×</button></div></th>`).join('')}
        </tr></thead><tbody>${stats.map(s => {
          const S = WSTAT[s];
          const vals = its.map(it => hasStat(s, it) ? S.val(it, WEAP[it.id]) : null);
          const nums = vals.filter(v => typeof v === 'number');
          const top = S.better && its.length > 1 && new Set(nums).size > 1 ? (S.better > 0 ? Math.max(...nums) : Math.min(...nums)) : null;
          return `<tr><th scope="row">${esc(S.label)}</th>${its.map((it, i) => `<td class="${vals[i] === top && top !== null ? 'cmp-best' : ''}">${hasStat(s, it) ? S.show(it, WEAP[it.id]) : '—'}</td>`).join('')}</tr>`;
        }).join('')}</tbody></table></div>`;
    };
    const renderTable = () => {
      const cols = wCols(state.tipo);
      const sortCol = cols.includes(state.ordem) ? state.ordem : (cols.includes('dmg') ? 'dmg' : 'name');
      const S = WSTAT[sortCol];
      const asc = cols.includes(state.ordem) ? state.asc : false;
      const n = norm(state.q);
      const inClass = w => state.tipo !== 'melee' || ((!state.classe || w.weight === state.classe) && (!state.corte || w.edge === state.corte));
      const rows = WLIST.filter(it => wInTab(WEAP[it.id], state.tipo) && inClass(WEAP[it.id]) && (!n || norm(it.name?.pt).includes(n) || norm(it.name?.en).includes(n) || norm(it.id).includes(n)));
      rows.sort((a, b) => {
        if (!S) return byName(a, b);
        const x = S.val(a, WEAP[a.id]), y = S.val(b, WEAP[b.id]);
        if (x === null || x === undefined) return y === null || y === undefined ? byName(a, b) : 1;
        if (y === null || y === undefined) return -1;
        const c = typeof x === 'string' ? x.localeCompare(y, 'pt-BR') : x - y;
        return (asc ? c : -c) || byName(a, b);
      });
      $('wCount').textContent = `${rows.length} ${rows.length === 1 ? 'arma encontrada' : 'armas encontradas'}`;
      const full = state.cmp.length >= CMP_MAX;
      $('wTable').innerHTML = rows.length ? `<div class="table-wrap w-table"><table><thead><tr><th>Comparar</th><th>Arma</th>
        ${cols.map(c => `<th class="sortable ${WSTAT[c].text || c === 'best' ? '' : 'num'}" data-c="${c}" aria-sort="${c === sortCol ? (asc ? 'ascending' : 'descending') : 'none'}">${esc(WSTAT[c].label)}${c === sortCol ? (asc ? ' ▲' : ' ▼') : ''}</th>`).join('')}
        </tr></thead><tbody>${rows.map(it => {
          const on = state.cmp.includes(it.id);
          return `<tr class="r-${it.tier}"><td><input type="checkbox" class="cmp-check" data-id="${esc(it.id)}" aria-label="Comparar ${esc(nm(it))}" ${on ? 'checked' : ''} ${full && !on ? 'disabled' : ''}></td>
            <td>${itemCell(it)}</td>${cols.map(c => `<td class="${WSTAT[c].text || c === 'best' ? '' : 'num'}">${WSTAT[c].show(it, WEAP[it.id])}</td>`).join('')}</tr>`;
        }).join('')}</tbody></table></div>` : `<div class="empty-state">Nenhuma arma encontrada.</div>`;
    };
    const paintTabs = () => document.querySelectorAll('#wTabs .chip').forEach(c => c.classList.toggle('on', c.dataset.t === state.tipo));
    const render = () => { sync(); paintTabs(); renderClasses(); renderCompare(); renderTable(); };
    $('wClasses').addEventListener('click', e => {
      const c = e.target.closest('[data-classe]'), d = e.target.closest('[data-corte]');
      if (c) state.classe = state.classe === c.dataset.classe ? '' : c.dataset.classe;
      else if (d) state.corte = d.dataset.corte;
      else return;
      render();
    });
    let t;
    $('wq').addEventListener('input', e => { clearTimeout(t); t = setTimeout(() => { state.q = e.target.value; sync(); renderTable(); }, 120); });
    $('wTabs').addEventListener('click', e => {
      const b = e.target.closest('.chip'); if (!b) return;
      state.tipo = b.dataset.t; state.ordem = ''; state.asc = false; state.classe = ''; state.corte = ''; render();
    });
    $('wTable').addEventListener('click', e => {
      const th = e.target.closest('th.sortable'); if (!th) return;
      const c = th.dataset.c;
      if (state.ordem === c) state.asc = !state.asc;
      else { state.ordem = c; state.asc = WSTAT[c].better === -1 || !!WSTAT[c].text || c === 'best'; }
      sync(); renderTable();
    });
    $('wTable').addEventListener('change', e => {
      const box = e.target.closest('.cmp-check'); if (!box) return;
      const id = box.dataset.id;
      state.cmp = box.checked ? [...state.cmp, id].slice(0, CMP_MAX) : state.cmp.filter(x => x !== id);
      sync(); renderCompare(); renderTable();
    });
    $('wCompare').addEventListener('click', e => {
      const b = e.target.closest('[data-rm]'); if (!b) return;
      state.cmp = state.cmp.filter(x => x !== b.dataset.rm);
      sync(); renderCompare(); renderTable();
    });
    render();
  }

  function weaponBlock(it) {
    const w = WEAP[it.id];
    if (!w) return '';
    const cols = wCols(w.k === 'melee' ? 'melee' : w.k === 'thrown' ? 'thrown' : 'fogo').filter(c => c !== 'weight' && c !== 'best');
    const rows = cols.map(c => `<div><dt>${esc(WSTAT[c].label)}</dt><dd>${WSTAT[c].show(it, w)}</dd></div>`);
    if (w.ammoAlt && w.ammoAlt.length) rows.push(`<div><dt>Munição alternativa</dt><dd>${w.ammoAlt.map(ammoLink).join(', ')}</dd></div>`);
    if ((it.att?.Muzzles || []).length) rows.push(`<div><dt>Ruído com silenciador</dt><dd>${num(w.noiseSup / 100, 0, ' m')}</dd></div>`);
    if (w.harvest) rows.push(`<div><dt>Coleta recursos</dt><dd>Sim</dd></div>`);
    return `<h2>Status de combate</h2>
      ${w.k === 'thrown' ? '<p class="muted">Arremessável: o efeito vem do impacto, da explosão ou do fogo, não de um valor de dano fixo.</p>' : ''}
      ${rows.length ? `<dl class="kv">${rows.join('')}</dl>` : ''}
      <p><a href="#/armas?tipo=${w.k}&cmp=${encodeURIComponent(it.id)}">Comparar com outras armas →</a></p>`;
  }

  // ---------------------------------------------------------------------------
  // Missões
  // ---------------------------------------------------------------------------
  const QCAT = { main: 'Principais', side: 'Secundárias', trade: 'Trocas', halloween: 'Halloween' };
  const QVERB = { give: 'Entregar', kill: 'Eliminar', act: 'Concluir', repair: 'Reparar' };
  const qLink = q => `#/missao/${encodeURIComponent(q.id)}`;
  const qRef = id => { const q = QBYID[id]; return q ? `<a href="${qLink(q)}">${esc(txt(q.title))}</a>` : esc(id); };

  function questObjective(o) {
    if (o.i) return `<span class="q-obj">${esc(o.act ? txt(o.act) : QVERB[o.k])} ${ing(o.i, o.n)}</span>`;
    const count = o.n > 1 && !o.hide ? ` <b>×${o.n}</b>` : '';
    return `<span class="q-obj">${esc(o.act ? txt(o.act) : QVERB[o.k])}${txt(o.label) ? ': ' + esc(txt(o.label)) : ''}${count}</span>`;
  }
  function questRewards(q) {
    const r = q.rw;
    const parts = r.items.map(([id, n]) => ing(id, n));
    if (r.xp) parts.push(`<span class="tag">${fmt(r.xp, 0)} XP</span>`);
    if (r.sp) parts.push(`<span class="tag">${r.sp} ${r.sp === 1 ? 'ponto de skill' : 'pontos de skill'}</span>`);
    if (r.rand) parts.push(`<span class="tag">Item sorteado</span>`);
    for (const id of r.recipes) { const x = D.recipes.find(a => a.id === id); parts.push(`<span class="tag">Receita: ${esc(x ? txt(x.name) : id)}</span>`); }
    for (const id of r.builds) { const x = D.buildings.find(a => a.id === id); parts.push(x ? `<a class="tag" href="#/construcoes#b-${esc(id)}">Construção: ${esc(txt(x.name))}</a>` : `<span class="tag">Construção: ${esc(id)}</span>`); }
    return parts.join('');
  }
  const questGiver = q => q.giver.map(g => esc(g.n) + (g.rnd ? ' <small class="muted">(pode aparecer)</small>' : '')).join(', ');
  const questReqs = q => [
    q.level ? `<span class="tag">Nível ${q.level}</span>` : '',
    q.days ? `<span class="tag">${q.days} ${q.days === 1 ? 'dia' : 'dias'} sobrevividos</span>` : '',
    q.once ? `<span class="tag">Só uma vez</span>` : ''
  ].join(' ');

  function pageQuests(q) {
    setTitle('Missões');
    const html = `
      <div class="crumbs"><a href="#/">Início</a> › Missões</div>
      <h1>Missões</h1>
      <p class="lead">${QLIST.filter(questVisible).length} missões lidas dos arquivos do jogo, com objetivos, recompensas, quem entrega e o que vem depois. Sequências aparecem em ordem.</p>
      <div class="filters" style="grid-template-columns:1fr">
        <label>Buscar missão, NPC ou item<input id="qq" type="search" value="${esc(q.q || '')}" placeholder="Ex.: Caesar, rádio, AK47…"></label>
      </div>
      <div class="chips" id="qTabs"><button class="chip" data-t="">Todas</button>
        ${Object.entries(QCAT).map(([k, v]) => `<button class="chip" data-t="${k}">${esc(v)}</button>`).join('')}
        <button class="chip" data-t="nao">Não confirmadas</button></div>
      <div class="result-bar"><span id="qCount"></span></div>
      <div id="qList"></div>`;
    const after = () => {
      const $ = id => document.getElementById(id);
      const state = { q: q.q || '', tipo: QCAT[q.tipo] || q.tipo === 'nao' ? q.tipo : '' };
      const matches = (x, n) => !n || [txt(x.title), txt(x.sum), x.id, ...x.giver.map(g => g.n),
        ...x.obj.flatMap(o => [txt(o.label), o.i && ITEMS[o.i] ? nm(ITEMS[o.i]) : '']),
        ...x.rw.items.map(([id]) => ITEMS[id] ? nm(ITEMS[id]) : '')].some(s => norm(s).includes(n));
      const render = () => {
        const p = new URLSearchParams();
        if (state.q) p.set('q', state.q);
        if (state.tipo) p.set('tipo', state.tipo);
        history.replaceState(null, '', '#/missoes' + (p.toString() ? '?' + p : ''));
        document.querySelectorAll('#qTabs .chip').forEach(c => c.classList.toggle('on', c.dataset.t === state.tipo));
        const n = norm(state.q).trim();
        const rows = QLIST.filter(x => (state.tipo === 'nao' ? !questVisible(x) : questVisible(x) && (!state.tipo || x.cat === state.tipo)) && matches(x, n));
        $('qCount').textContent = `${rows.length} ${rows.length === 1 ? 'missão encontrada' : 'missões encontradas'}`;
        $('qList').innerHTML = (state.tipo === 'nao' ? `<div class="notice">Estas missões existem nos arquivos, mas não encontramos o NPC que as entrega. Podem ser conteúdo cortado, evento ou algo acionado de outra forma.</div>` : '') + (rows.length ? rows.map(x => `
          <div class="recipe">
            <div class="recipe-head"><a href="${qLink(x)}"><b>${esc(txt(x.title) || x.id)}</b></a>
              <span><span class="tag">${esc(QCAT[x.cat] || 'Outras')}</span> ${questReqs(x)}</span></div>
            ${x.giver.length ? `<p class="muted q-meta">Quem entrega: ${questGiver(x)}</p>` : ''}
            ${x.prev.length ? `<p class="muted q-meta">Depois de: ${x.prev.map(qRef).join(', ')}</p>` : ''}
            ${x.obj.length ? `<div class="recipe-flow">${x.obj.map(questObjective).join('')}</div>` : (txt(x.sum) ? `<p class="muted q-meta">${esc(txt(x.sum))}</p>` : '')}
            ${questRewards(x) ? `<div class="recipe-flow q-rewards"><span class="muted">Recompensa:</span>${questRewards(x)}</div>` : ''}
          </div>`).join('') : `<div class="empty-state">Nenhuma missão encontrada.</div>`);
      };
      let t;
      $('qq').addEventListener('input', e => { clearTimeout(t); t = setTimeout(() => { state.q = e.target.value; render(); }, 120); });
      $('qTabs').addEventListener('click', e => { const b = e.target.closest('.chip'); if (b) { state.tipo = b.dataset.t; render(); } });
      render();
    };
    return { html, after };
  }

  function pageQuest(id) {
    const q = QBYID[id];
    if (!q) return `<div class="empty-state"><h1>Missão não encontrada</h1><p><a href="#/missoes">Voltar para a lista</a></p></div>`;
    setTitle(txt(q.title) || q.id);
    const rewards = questRewards(q);
    const dialog = q.dlg.map(d => `<div class="q-line">
        ${d.t ? `<p>${esc(txt(d.t))}</p>` : `<p class="muted">Fala sorteada entre:</p><ul>${d.rand.map(r => `<li>${esc(txt(r))}</li>`).join('')}</ul>`}
        ${d.o.length ? `<ul class="q-opts">${d.o.map(o => `<li>${esc(txt(o))}</li>`).join('')}</ul>` : ''}
      </div>`).join('');
    return `
      <div class="crumbs"><a href="#/">Início</a> › <a href="#/missoes">Missões</a> › ${esc(txt(q.title) || q.id)}</div>
      <h1>${esc(txt(q.title) || q.id)}</h1>
      <p><span class="tag">${esc(QCAT[q.cat] || 'Outras')}</span> ${questReqs(q)}</p>
      ${txt(q.sum) ? `<p class="lead">${esc(txt(q.sum))}</p>` : ''}
      ${!q.known ? `<div class="notice">Não encontramos o NPC que entrega esta missão. Ela pode ser conteúdo cortado, evento ou algo acionado de outra forma.</div>` : ''}
      ${q.giver.length ? `<p><b>Quem entrega:</b> ${questGiver(q)}${q.viaChain ? ' <small class="muted">(deduzido da missão anterior na sequência)</small>' : ''}</p>` : ''}
      ${q.pins.length ? `<p><a class="map-btn" href="#/mapa?missao=${encodeURIComponent(q.id)}">📍 Ver no mapa (${q.pins.length})</a></p>` : ''}
      ${q.obj.length ? `<h2>Objetivos</h2><div class="recipe"><div class="recipe-flow">${q.obj.map(questObjective).join('')}</div></div>` : ''}
      ${rewards ? `<h2>Recompensas</h2><div class="recipe"><div class="recipe-flow">${rewards}</div></div>` : ''}
      ${q.tx.length ? `<h2>Trocas</h2><div class="table-wrap"><table><thead><tr><th>Você entrega</th><th>Quantidade</th><th>Recebe um destes</th></tr></thead><tbody>
        ${q.tx.flatMap(t => t.tiers.map(tier => `<tr><td>${ing(t.i, 1)}</td><td>${tier.given[0] === tier.given[1] ? tier.given[0] : tier.given.join('–')}</td>
          <td><div class="recipe-flow">${tier.any.map(([rid, a, b]) => ing(rid, a === b ? a : 1) + (a !== b ? `<small class="muted">${a}–${b}</small>` : '')).join('')}</div></td></tr>`)).join('')}
        </tbody></table></div>` : ''}
      ${q.prev.length || q.next.length || q.reqQuest ? `<h2>Sequência</h2>
        ${q.prev.length ? `<p><b>Antes:</b> ${q.prev.map(qRef).join(', ')}</p>` : ''}
        ${q.reqQuest ? `<p><b>Requer concluir:</b> ${qRef(q.reqQuest)}</p>` : ''}
        ${q.next.length ? `<p><b>Depois:</b> ${q.next.map(qRef).join(', ')}${q.afterDays ? ` <small class="muted">(libera em ${q.afterDays} ${q.afterDays === 1 ? 'dia' : 'dias'})</small>` : ''}</p>` : ''}` : ''}
      ${dialog ? `<h2>Diálogos</h2><details class="q-dialog"><summary>Mostrar diálogos (contém spoilers)</summary>${dialog}</details>` : ''}`;
  }

  // ---------------------------------------------------------------------------
  // Criador de personagem
  // ---------------------------------------------------------------------------
  const BUILD = D.builds || { trees: [], profs: [], afflictions: [] };
  const SKILL = {};
  for (const t of BUILD.trees) for (const s of t.skills) SKILL[s.id] = Object.assign(s, { tree: t });
  for (const pf of BUILD.profs) for (const s of pf.skills) SKILL[s.id] = Object.assign(s, { prof: pf });
  const skillCount = BUILD.trees.reduce((n, t) => n + t.skills.length, 0) + BUILD.profs.reduce((n, pf) => n + pf.skills.length, 0);

  function pageBuild(q) {
    setTitle('Criador de personagem');
    const html = `
      <div class="crumbs"><a href="#/">Início</a> › Criador de personagem</div>
      <h1>Criador de personagem</h1>
      <p class="lead">Escolha profissão e aflição, marque as skills e veja quantos pontos e qual nível a build pede. O link da página guarda a build para você compartilhar.</p>
      <div class="filters build-picks">
        <label>Profissão<select id="bProf">${BUILD.profs.map(p => `<option value="${esc(p.id)}">${esc(txt(p.name))}</option>`).join('')}</select></label>
        <label>Aflição<select id="bAff"><option value="">Sem aflição</option>${BUILD.afflictions.map(a => `<option value="${esc(a.id)}">${esc(txt(a.name))}</option>`).join('')}</select></label>
      </div>
      <div class="build-layout">
        <div>
          <div class="chips" id="bTabs">${BUILD.trees.map(t => `<button class="chip" data-t="${esc(t.id)}">${esc(txt(t.name))}</button>`).join('')}<button class="chip" data-t="prof">Profissões</button></div>
          <div id="bTree"></div>
        </div>
        <aside class="build-sum" id="bSum"></aside>
      </div>`;
    return { html, after: () => bindBuild(q) };
  }

  function bindBuild(q) {
    const $ = id => document.getElementById(id);
    const profOf = id => BUILD.profs.find(p => p.id === id);
    const state = {
      prof: profOf(q.p) ? q.p : 'Unemployed',
      aff: BUILD.afflictions.some(a => a.id === q.a) ? q.a : '',
      tab: q.aba === 'prof' || BUILD.trees.some(t => t.id === q.aba) ? q.aba : BUILD.trees[0].id,
      skills: new Set((q.s || '').split(',').filter(id => SKILL[id]))
    };
    const free = () => new Set(profOf(state.prof).startIds.filter(Boolean));
    const sync = () => {
      const p = new URLSearchParams();
      if (state.prof !== 'Unemployed') p.set('p', state.prof);
      if (state.aff) p.set('a', state.aff);
      if (state.tab !== BUILD.trees[0].id) p.set('aba', state.tab);
      if (state.skills.size) p.set('s', [...state.skills].join(','));
      history.replaceState(null, '', '#/personagem' + (p.toString() ? '?' + p : ''));
    };
    const card = s => {
      const isFree = free().has(s.id), on = isFree || state.skills.has(s.id);
      return `<button class="skill-card ${on ? 'on' : ''}" data-id="${esc(s.id)}" aria-pressed="${on}" ${isFree ? 'disabled' : ''}>
        ${img(s.icon, '')}<span class="skill-txt"><b>${esc(txt(s.name))}</b><small>${esc(txt(s.desc))}</small>
        <span class="skill-tags">${isFree ? '<span class="tag">Grátis pela profissão</span>' : `<span class="tag">${s.cost} ${s.cost === 1 ? 'ponto' : 'pontos'}</span>`}
          <span class="tag">Nível ${s.lv}</span>${s.root ? '<span class="tag">Inicial</span>' : ''}${s.ult ? '<span class="tag">Final</span>' : ''}</span></span></button>`;
    };
    const goals = list => list.length ? `<p class="muted q-meta"><b>Objetivos da árvore:</b> ${list.map(g => esc(txt(g))).join(' · ')}</p>` : '';
    const renderTree = () => {
      document.querySelectorAll('#bTabs .chip').forEach(c => c.classList.toggle('on', c.dataset.t === state.tab));
      if (state.tab !== 'prof') {
        const t = BUILD.trees.find(x => x.id === state.tab);
        $('bTree').innerHTML = `${goals(t.goals)}<div class="skill-grid">${t.skills.map(card).join('')}</div>`;
        return;
      }
      const chosen = profOf(state.prof);
      const others = BUILD.profs.filter(p => p !== chosen);
      const body = p => `<p class="muted q-meta">${esc(txt(p.desc))}</p><p class="q-meta"><b>Passivo:</b> ${esc(txt(p.passive))}</p>${goals(p.goals)}
        <div class="skill-grid">${p.skills.map(card).join('')}</div>`;
      $('bTree').innerHTML = `<h2>${esc(txt(chosen.name))}</h2>${body(chosen)}<h2>Outras profissões</h2>
        <p class="muted">No jogo, estas árvores ficam trancadas até você cumprir os objetivos de cada uma.</p>
        ${others.map(p => `<details class="q-dialog build-other" ${p.skills.some(s => state.skills.has(s.id)) ? 'open' : ''}><summary>${esc(txt(p.name))}</summary>${body(p)}</details>`).join('')}`;
    };
    const renderSum = () => {
      const prof = profOf(state.prof), aff = BUILD.afflictions.find(a => a.id === state.aff);
      const startFree = free();
      const paid = [...state.skills].filter(id => !startFree.has(id)).map(id => SKILL[id]);
      const pts = paid.reduce((n, s) => n + s.cost, 0);
      const level = paid.reduce((n, s) => Math.max(n, s.lv), 1);
      const foreign = paid.filter(s => s.prof && s.prof !== prof);
      const starters = [...startFree].map(id => SKILL[id]);
      $('bSum').innerHTML = `<h2>Sua build</h2>
        <dl class="kv build-kv"><div><dt>Pontos de skill</dt><dd>${pts}</dd></div><div><dt>Nível mínimo</dt><dd>${level}</dd></div></dl>
        <p class="q-meta"><b>${esc(txt(prof.name))}:</b> ${esc(txt(prof.passive))}</p>
        ${aff ? `<p class="q-meta"><b>${esc(txt(aff.name))}:</b> ${esc(txt(aff.desc))}</p>` : ''}
        ${foreign.length ? `<div class="notice">Você marcou skills de outra profissão. É preciso liberar essas árvores no jogo.</div>` : ''}
        ${starters.length ? `<h3>Grátis pela profissão</h3><ul class="build-list">${starters.map(s => `<li><b>${esc(txt(s.name))}</b> <small class="muted">${esc(txt(s.desc))}</small></li>`).join('')}</ul>` : ''}
        ${paid.length ? `<h3>Skills escolhidas (${paid.length})</h3><ul class="build-list">${paid.map(s => `<li><b>${esc(txt(s.name))}</b> <small class="muted">${esc(txt(s.desc))}</small></li>`).join('')}</ul>` : '<p class="muted">Nenhuma skill marcada ainda.</p>'}
        <div class="build-actions"><button class="more-btn" id="bCopy">Copiar link</button><button class="more-btn" id="bClear">Limpar</button></div>`;
      $('bClear').onclick = () => { state.skills.clear(); state.aff = ''; $('bAff').value = ''; render(); };
      $('bCopy').onclick = async e => {
        const b = e.currentTarget;
        try { await navigator.clipboard.writeText(location.href); b.textContent = 'Link copiado'; }
        catch (err) { b.textContent = 'Copie o endereço da página'; }
      };
    };
    const render = () => { sync(); renderTree(); renderSum(); };
    $('bProf').value = state.prof;
    $('bAff').value = state.aff;
    $('bProf').addEventListener('change', e => { state.prof = e.target.value; render(); });
    $('bAff').addEventListener('change', e => { state.aff = e.target.value; render(); });
    $('bTabs').addEventListener('click', e => { const b = e.target.closest('.chip'); if (b) { state.tab = b.dataset.t; render(); } });
    $('bTree').addEventListener('click', e => {
      const b = e.target.closest('.skill-card'); if (!b || b.disabled) return;
      const id = b.dataset.id;
      if (state.skills.has(id)) state.skills.delete(id); else state.skills.add(id);
      render();
    });
    render();
  }

  // ---------------------------------------------------------------------------
  // Bestiário
  // ---------------------------------------------------------------------------
  const BEAST = D.bestiary || [];
  const BEAST_CAT = { zombie: 'Zumbis', bandit: 'Bandidos', animal: 'Animais' };
  const yn = v => v ? 'Sim' : 'Não';
  // Zumbis e bandidos: vida no modo padrão; a tabela por dificuldade fica na página da criatura
  const beastLife = x => x.hpBy ? x.hpBy.find(p => p.name === 'Padrão').hp : x.hp;
  const BSTAT = {
    zombie: {
      life: ['Vida', beastLife, x => num(beastLife(x), 0)],
      dmg: ['Dano', x => x.dmg, x => num(x.dmg, 1)], bite: ['Mordida', x => x.bite, x => num(x.bite, 1, '%')],
      xp: ['XP', x => x.xp, x => '×' + fmt(x.xp, 1)], armor: ['Blindagem', x => x.armor, x => x.armor ? x.armor + '%' : '—'], sense: ['Percepção', x => x.sense, x => num(x.sense, 0, ' m')]
    },
    bandit: {
      life: ['Vida', beastLife, x => num(beastLife(x), 0)],
      bullet: ['Dano do tiro', x => x.bullet, x => num(x.bullet, 1)], melee: ['Dano corpo a corpo', x => x.melee, x => num(x.melee, 1)], rate: ['Intervalo', x => x.rate, x => num(x.rate, 2, ' s')],
      mag: ['Pente', x => x.mag, x => x.mag ? x.mag : '—'], range: ['Alcance de ataque', x => x.range, x => num(x.range, 1, ' m')], sense: ['Percepção', x => x.sense, x => num(x.sense, 0, ' m')]
    },
    animal: {
      hp: ['Vida', x => x.hp, x => num(x.hp, 0)], dmg: ['Dano', x => x.dmg || 0, x => x.dmg ? fmt(x.dmg, 0) : '—'], speed: ['Velocidade', x => x.speed, x => num(x.speed, 1, ' m/s')],
      meat: ['Carne', x => x.meat, x => num(x.meat, 0)], fat: ['Gordura', x => x.fat, x => x.fat ? x.fat : '—']
    }
  };
  const creatureLink = x => `#/criatura/${encodeURIComponent(x.id)}`;
  const groupMap = g => g.map ? `#/mapa?grupo=${encodeURIComponent(g.cat + ':' + g.map)}` : '';
  const groupPts = g => (window.HZ_MAP ? window.HZ_MAP.pts.filter(p => p.c === g.cat && p.t === g.map).length : 0);

  function pageBestiary(q) {
    setTitle('Bestiário');
    const html = `
      <div class="crumbs"><a href="#/">Início</a> › Bestiário</div>
      <h1>Bestiário</h1>
      <p class="lead">${BEAST.length} criaturas lidas dos arquivos do jogo: zumbis, bandidos e animais, com ataque, recompensa e onde aparecem.</p>
      <div class="filters" style="grid-template-columns:1fr"><label>Buscar criatura<input id="zq" type="search" value="${esc(q.q || '')}" placeholder="Ex.: gigante, lobo, escopeta…"></label></div>
      <div class="chips" id="zTabs">${Object.entries(BEAST_CAT).map(([k, v]) => `<button class="chip" data-t="${k}">${esc(v)}</button>`).join('')}</div>
      <div class="result-bar"><span id="zCount"></span></div>
      <div id="zTable"></div>
      <div class="notice" id="zNote"></div>`;
    const after = () => {
      const $ = id => document.getElementById(id);
      const state = { q: q.q || '', tipo: BEAST_CAT[q.tipo] ? q.tipo : 'zombie', ordem: '', asc: false };
      const NOTE = {
        zombie: '<b>Vida</b> é a do modo Padrão: todos os tipos têm 100 de base, multiplicados pela dificuldade (125 no Padrão). O que muda entre eles é a blindagem, o dano e como reagem aos golpes; veja a tabela por dificuldade na página de cada um. "Dano" é o valor-base, antes da dificuldade. "XP" multiplica a experiência por morte. As imagens mostram uma das aparências possíveis, na pose de referência do modelo. Os nomes são da wiki, porque o jogo não dá nome a estes tipos.',
        bandit: '<b>Vida</b> é a do modo Padrão, a partir de 100 de base. Os demais valores são de base, e a dificuldade também os altera. As imagens mostram uma das aparências possíveis. Os nomes são da wiki.',
        animal: 'Valores-base dos arquivos do jogo. "Carne" e "Gordura" são os valores definidos para cada animal. A dificuldade pode alterar a quantidade de animais no mundo. Os nomes são da wiki.'
      };
      const render = () => {
        const p = new URLSearchParams();
        if (state.q) p.set('q', state.q);
        if (state.tipo !== 'zombie') p.set('tipo', state.tipo);
        history.replaceState(null, '', '#/bestiario' + (p.toString() ? '?' + p : ''));
        document.querySelectorAll('#zTabs .chip').forEach(c => c.classList.toggle('on', c.dataset.t === state.tipo));
        const stats = BSTAT[state.tipo], keys = Object.keys(stats);
        const sort = keys.includes(state.ordem) ? state.ordem : keys[0];
        const n = norm(state.q).trim();
        const rows = BEAST.filter(x => x.cat === state.tipo && (!n || norm(x.name.pt).includes(n) || norm(x.name.en).includes(n)))
          .sort((a, b) => ((state.asc ? 1 : -1) * ((stats[sort][1](a) || 0) - (stats[sort][1](b) || 0))) || txt(a.name).localeCompare(txt(b.name), 'pt-BR'));
        $('zCount').textContent = `${rows.length} ${rows.length === 1 ? 'criatura encontrada' : 'criaturas encontradas'}`;
        $('zNote').innerHTML = NOTE[state.tipo];
        $('zTable').innerHTML = rows.length ? `<div class="table-wrap w-table"><table><thead><tr><th>Criatura</th>
          ${keys.map(k => `<th class="sortable num" data-c="${k}" aria-sort="${k === sort ? (state.asc ? 'ascending' : 'descending') : 'none'}">${esc(stats[k][0])}${k === sort ? (state.asc ? ' ▲' : ' ▼') : ''}</th>`).join('')}</tr></thead><tbody>
          ${rows.map(x => `<tr><td><div class="beast-cell"><a href="${creatureLink(x)}">${img(x.img, txt(x.name))}</a><span><a href="${creatureLink(x)}"><b>${esc(txt(x.name))}</b></a>${x.flags && x.flags.length ? `<br><small class="muted">${x.flags.map(esc).join(' · ')}</small>` : ''}</span></div></td>
            ${keys.map(k => `<td class="num">${stats[k][2](x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` : `<div class="empty-state">Nenhuma criatura encontrada.</div>`;
      };
      let t;
      $('zq').addEventListener('input', e => { clearTimeout(t); t = setTimeout(() => { state.q = e.target.value; render(); }, 120); });
      $('zTabs').addEventListener('click', e => { const b = e.target.closest('.chip'); if (b) { state.tipo = b.dataset.t; state.ordem = ''; state.asc = false; render(); } });
      $('zTable').addEventListener('click', e => {
        const th = e.target.closest('th.sortable'); if (!th) return;
        if (state.ordem === th.dataset.c || (!state.ordem && th.dataset.c === Object.keys(BSTAT[state.tipo])[0])) state.asc = !state.asc;
        else { state.ordem = th.dataset.c; state.asc = false; }
        state.ordem = th.dataset.c; render();
      });
      render();
    };
    return { html, after };
  }

  function pageCreature(id) {
    const x = BEAST.find(b => b.id === id);
    if (!x) return `<div class="empty-state"><h1>Criatura não encontrada</h1><p><a href="#/bestiario">Voltar para o bestiário</a></p></div>`;
    setTitle(txt(x.name));
    const stats = Object.values(BSTAT[x.cat]).map(([label, , show]) => `<div><dt>${esc(label)}</dt><dd>${show(x)}</dd></div>`);
    if (x.cat === 'zombie') stats.push(`<div><dt>Golpes para atordoar</dt><dd>${num(x.stagger, 0)}</dd></div>`);
    if (x.cat === 'bandit') stats.push(`<div><dt>Velocidade de perseguição</dt><dd>${num(x.chase, 1, ' m/s')}</dd></div>`, `<div><dt>Velocidade em corrida</dt><dd>${num(x.sprint, 1, ' m/s')}</dd></div>`);
    if (x.cat === 'animal') {
      stats.push(`<div><dt>Velocidade andando</dt><dd>${num(x.walk, 1, ' m/s')}</dd></div>`, `<div><dt>Agressivo</dt><dd>${yn(x.hostile)}</dd></div>`);
      if (x.bleed) stats.push(`<div><dt>Causa sangramento</dt><dd>${x.bleed}%</dd></div>`);
    }
    const hide = x.hide && ITEMS[x.hide];
    const peers = BEAST.filter(b => b.cat === x.cat && b !== x).slice(0, 12);
    return `
      <div class="crumbs"><a href="#/">Início</a> › <a href="#/bestiario${x.cat === 'zombie' ? '' : '?tipo=' + x.cat}">Bestiário</a> › ${esc(txt(x.name))}</div>
      <div class="beast-head">
        ${x.img ? `<div class="beast-art"><img src="${esc(x.img)}" alt="${esc(txt(x.name))}"></div>` : ''}
        <div class="beast-info">
          <h1>${esc(txt(x.name))}</h1>
          <p><span class="tag">${esc(BEAST_CAT[x.cat])}</span> ${(x.flags || []).map(f => `<span class="tag">${esc(f)}</span>`).join(' ')}</p>
          <dl class="kv">${stats.join('')}</dl>
        </div>
      </div>
      ${x.hpBy ? `<h2>Vida por dificuldade</h2>
        <div class="table-wrap"><table><thead><tr>${x.hpBy.map(p => `<th class="num">${esc(p.name)}</th>`).join('')}</tr></thead>
        <tbody><tr>${x.hpBy.map(p => `<td class="num">${fmt(p.hp, 0)}</td>`).join('')}</tr></tbody></table></div>
        <p class="muted">Valores das dificuldades prontas do jogo, a partir de ${fmt(x.hp, 0)} de vida-base.${x.armor ? ` Com a blindagem, o dano recebido cai ${x.armor}%.` : ''}</p>` : ''}
      ${x.cat !== 'animal' ? `<h2>O que derruba</h2>${x.loot ? `<p><a href="#/local/${esc(x.loot)}">${esc(lootName(x.loot))}</a> <small class="muted">(tabela de loot)</small></p>` : '<p class="muted">Este tipo não deixa loot.</p>'}` : ''}
      ${hide ? `<h2>O que dá ao ser abatido</h2><div class="recipe-flow">${ing(hide.id, 1)}</div>` : ''}
      <h2>Onde aparece</h2>
      ${x.groups.length ? `<div class="table-wrap"><table><thead><tr><th>Grupo</th><th class="num">No mapa</th></tr></thead><tbody>
        ${x.groups.map(g => { const n = g.map ? groupPts(g) : 0; return `<tr><td>${esc(g.t)}</td><td class="num">${n ? `<a class="map-btn" href="${groupMap(g)}">📍 ${n}</a>` : '—'}</td></tr>`; }).join('')}
        </tbody></table></div>` : `<p class="muted">Não aparece em nenhum grupo de spawn comum dos arquivos. Pode ser exclusivo de evento, missão ou acampamento.</p>`}
      ${x.cat === 'bandit' ? `<p><a class="map-btn" href="#/mapa?tipo=bandidos">📍 Ver acampamentos de bandidos</a></p>` : ''}
      <h2>Outras criaturas</h2>
      <p>${peers.map(b => `<a href="${creatureLink(b)}">${esc(txt(b.name))}</a>`).join(' · ')}</p>`;
  }

  // ---------------------------------------------------------------------------
  // Recrutas e comunidade
  // ---------------------------------------------------------------------------
  const REC = D.recruits || { people: [], traits: [], tasks: [], config: {} };
  const DANGER_PT = { None: 'Nenhum', Low: 'Baixo', Medium: 'Médio', High: 'Alto' };
  const TIER_PT = { Tier1: 'Comum', Tier2: 'Nível 2', Tier3: 'Nível 3', TierHidden: 'Oculto' };
  const range = r => r && r[0] !== r[1] ? `${fmt(r[0], 0)}–${fmt(r[1], 0)}` : fmt(r ? r[0] : 0, 0);
  const taskName = type => { const t = REC.tasks.find(x => x.type === type && x.tier === 1); return t ? txt(t.name) : type; };
  const traitName = id => { const t = REC.traits.find(x => x.id === id); return t ? txt(t.name) : id; };
  const recruitPoints = classes => {
    const rx = new RegExp(`\\b(${classes.join('|')})\\b`);
    return window.HZ_MAP ? window.HZ_MAP.pts.filter(p => p.c === 'sobrevivente' && rx.test(p.i || '')).length : 0;
  };

  function pageRecruits(q) {
    setTitle('Recrutas');
    const TABS = { pessoas: 'Recrutas', tracos: 'Traços', tarefas: 'Tarefas' };
    const c = REC.config;
    const html = `
      <div class="crumbs"><a href="#/">Início</a> › Recrutas</div>
      <h1>Recrutas e comunidade</h1>
      <p class="lead">Quem pode entrar na sua base, os traços que cada pessoa pode ter e as tarefas que ela faz. Tudo lido dos arquivos do jogo.</p>
      <dl class="kv">
        <div><dt>Nível ao recrutar</dt><dd>${range(c.level)}</dd></div>
        <div><dt>Moral inicial</dt><dd>${range(c.morale)}</dd></div>
        <div><dt>Traços sorteados</dt><dd>${range(c.good)} bom e ${range(c.bad)} ruim</dd></div>
        <div><dt>Tarefas por pessoa</dt><dd>${range(c.tasks)}</dd></div>
        <div><dt>Chance de vir infectado</dt><dd>${fmt(c.infection, 0)}%</dd></div>
        <div><dt>Fome, sede e sono iniciais</dt><dd>${range(c.hunger)}</dd></div>
      </dl>
      <div class="chips" id="rTabs" style="margin-top:16px">${Object.entries(TABS).map(([k, v]) => `<button class="chip" data-t="${k}">${esc(v)}</button>`).join('')}</div>
      <div class="filters" style="grid-template-columns:1fr"><label>Buscar<input id="rq" type="search" value="${esc(q.q || '')}" placeholder="Nome, traço, tarefa ou item…"></label></div>
      <div id="rBody"></div>`;
    const after = () => {
      const $ = id => document.getElementById(id);
      const state = { tab: TABS[q.aba] ? q.aba : 'pessoas', q: q.q || '', kind: '' };
      const people = n => {
        const rows = REC.people.filter(x => !n || norm(x.name).includes(n));
        return `<p class="muted">Os traços e as tarefas são sorteados quando a pessoa aparece, então não dependem do nome. <a href="#/mapa?tipo=sobrevivente">Ver todos os pontos de recrutamento</a>.</p>
          <div class="recruit-grid">${rows.map(x => { const pts = recruitPoints(x.classes); return `<div class="recruit-card">${img(x.portrait, x.name)}<b>${esc(x.name)}</b>
            ${pts ? `<a class="map-btn" href="#/mapa?recruta=${encodeURIComponent(x.classes.join(','))}">📍 ${pts}</a>` : '<small class="muted">Local não identificado</small>'}</div>`; }).join('')}</div>${rows.length ? '' : '<div class="empty-state">Ninguém encontrado.</div>'}`;
      };
      const traits = n => {
        const rows = REC.traits.filter(t => (!state.kind || t.kind === state.kind) && (!n || norm(txt(t.name)).includes(n) || norm(txt(t.desc)).includes(n)));
        return `<div class="chips" id="rKinds">${[['', 'Todos'], ['good', 'Positivos'], ['bad', 'Negativos']].map(([k, v]) => `<button class="chip ${state.kind === k ? 'on' : ''}" data-k="${k}">${v}</button>`).join('')}</div>
          <div class="skill-grid">${rows.map(t => `<div class="skill-card trait-${t.kind}">${img(t.icon, '')}<span class="skill-txt"><b>${esc(txt(t.name))}</b><small>${esc(txt(t.desc))}</small>
            <span class="skill-tags"><span class="tag">${t.kind === 'good' ? 'Positivo' : 'Negativo'}</span>${t.tier !== 'Tier1' ? `<span class="tag">${TIER_PT[t.tier] || t.tier}</span>` : ''}
              ${t.effects.Chance && t.effects.Chance < 100 ? `<span class="tag">Chance ${fmt(t.effects.Chance, 0)}%</span>` : ''}
              ${t.unlocks.map(u => `<span class="tag">Tarefa: ${esc(taskName(u))}</span>`).join('')}</span>
            ${t.no.length ? `<small>Não combina com: ${t.no.map(id => esc(traitName(id))).join(', ')}</small>` : ''}</span></div>`).join('')}</div>${rows.length ? '' : '<div class="empty-state">Nenhum traço encontrado.</div>'}`;
      };
      const tasks = n => {
        const types = [...new Set(REC.tasks.map(t => t.type))];
        const match = t => !n || [txt(t.name), txt(t.needs), ...t.rewards.map(r => ITEMS[r[0]] ? nm(ITEMS[r[0]]) : r[0])].some(s => norm(s).includes(n));
        const out = types.map(type => {
          const tiers = REC.tasks.filter(t => t.type === type).sort((a, b) => a.tier - b.tier || a.id.localeCompare(b.id));
          if (!tiers.some(match)) return '';
          const first = tiers[0];
          const needsTrait = !REC.config.possible.includes(type);
          return `<div class="recipe"><div class="recipe-head"><span class="item-cell">${img(first.icon, '')}<b>${esc(taskName(type))}</b></span>
              <span>${first.cont ? '<span class="tag">Contínua</span>' : ''} ${needsTrait ? '<span class="tag">Exige traço</span>' : ''}</span></div>
            ${txt(first.needs) ? `<p class="muted q-meta">Precisa de: ${esc(txt(first.needs))}</p>` : ''}
            ${first.req.map(g => `<div class="recipe-flow q-rewards">${g.items.map(id => ing(id, 1)).join('<span class="or-sep">ou</span>')}</div>`).join('')}
            <div class="table-wrap q-rewards"><table><thead><tr><th>Tarefa</th><th>Nível</th><th>Perigo</th><th class="num">Sucesso</th><th class="num">Duração inicial</th><th class="num">Duração-base</th></tr></thead><tbody>
              ${tiers.map(t => `<tr><td>${esc(txt(t.name))}</td><td>${t.tier}</td><td>${DANGER_PT[t.danger] || t.danger}</td><td class="num">${fmt(t.chance, 0)}%</td><td class="num">${fmt(t.first, 2)} min</td><td class="num">${fmt(t.base, 1)} min</td></tr>`).join('')}
            </tbody></table></div>
            ${tiers.filter(t => t.rewards.length).map(t => `<div class="recipe-flow q-rewards"><span class="muted">Nível ${t.tier} pode trazer:</span>${t.rewards.map(([id, a, b, ch]) => ing(id, a === b ? a : 1) + `<small class="muted">${a !== b ? a + '–' + b + ' · ' : ''}${fmt(ch, 0)}%</small>`).join('')}</div>`).join('')}
            ${first.recipes.length ? `<details class="q-dialog q-rewards"><summary>Itens que pode fabricar (${first.recipes.length})</summary><div class="recipe-flow q-rewards">${first.recipes.map(id => ing(id, 1)).join('')}</div></details>` : ''}
          </div>`;
        }).join('');
        return (out || '<div class="empty-state">Nenhuma tarefa encontrada.</div>') + `<div class="notice">O Saque não lista itens porque os arquivos só têm uma lista de teste nele. As durações usam os campos de minutos do jogo, e o que a dificuldade ou os traços mudam não está incluído.</div>`;
      };
      const render = () => {
        const p = new URLSearchParams();
        if (state.tab !== 'pessoas') p.set('aba', state.tab);
        if (state.q) p.set('q', state.q);
        history.replaceState(null, '', '#/recrutas' + (p.toString() ? '?' + p : ''));
        document.querySelectorAll('#rTabs .chip').forEach(c => c.classList.toggle('on', c.dataset.t === state.tab));
        const n = norm(state.q).trim();
        $('rBody').innerHTML = state.tab === 'pessoas' ? people(n) : state.tab === 'tracos' ? traits(n) : tasks(n);
      };
      let t;
      $('rq').addEventListener('input', e => { clearTimeout(t); t = setTimeout(() => { state.q = e.target.value; render(); }, 120); });
      $('rTabs').addEventListener('click', e => { const b = e.target.closest('.chip'); if (b) { state.tab = b.dataset.t; render(); } });
      $('rBody').addEventListener('click', e => { const b = e.target.closest('#rKinds .chip'); if (b) { state.kind = b.dataset.k; render(); } });
      render();
    };
    return { html, after };
  }

  // ---------------------------------------------------------------------------
  // Guia para iniciantes
  // ---------------------------------------------------------------------------
  const GUIDE = D.guide || { pages: [], steps: [], tips: [], spawns: [] };
  const guideText = s => {
    const out = []; let bullets = [];
    const flush = () => { if (bullets.length) { out.push(`<ul class="guide-list">${bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul>`); bullets = []; } };
    const whole = s.trim();
    if (/^-\s.*\s-$/.test(whole)) return `<h2>${esc(whole.replace(/^-\s*|\s*-$/g, ''))}</h2>`;
    for (const line of whole.split(/\n+/)) {
      const t = line.trim(); if (!t) continue;
      if (t.startsWith('- ')) bullets.push(t.slice(2));
      else { flush(); out.push(`<p>${esc(t)}</p>`); }
    }
    flush();
    return out.join('');
  };

  function pageGuide(id) {
    const tabs = [['passos', 'Primeiros passos'], ...GUIDE.pages.map(g => [g.id, txt(g.name)]), ['dicas', 'Dicas rápidas'], ['inicio', 'Onde começar']];
    const cur = tabs.some(t => t[0] === id) ? id : 'passos';
    const label = tabs.find(t => t[0] === cur)[1];
    setTitle('Guia: ' + label);
    let body;
    if (cur === 'passos') {
      const xp = GUIDE.steps.reduce((n, s) => n + s.xp, 0);
      body = `<p class="lead">A sequência de objetivos que o próprio jogo sugere a quem está começando. Completar tudo dá ${fmt(xp, 0)} XP.</p>
        <ol class="guide-steps">${GUIDE.steps.map(s => `<li class="recipe"><div class="recipe-head"><b>${esc(txt(s.name))}</b>
          <span>${s.xp ? `<span class="tag">${fmt(s.xp, 0)} XP</span>` : ''} ${s.sp ? `<span class="tag">${s.sp} ${s.sp === 1 ? 'ponto' : 'pontos'} de skill</span>` : ''}</span></div>
          ${s.text.map(t => guideText(txt(t))).join('')}
          ${s.need.length ? `<p class="muted q-meta">Para concluir: ${s.need.map(x => `${esc(txt(x.name))}${x.n > 1 ? ' ×' + x.n : ''}`).join(' · ')}</p>` : ''}</li>`).join('')}</ol>`;
    } else if (cur === 'dicas') {
      body = `<p class="lead">As dicas das telas de carregamento do jogo.</p><ul class="guide-list guide-tips">${GUIDE.tips.map(t => `<li>${esc(txt(t))}</li>`).join('')}</ul>`;
    } else if (cur === 'inicio') {
      body = `<p class="lead">Os pontos de início que o jogo oferece ao criar um personagem, com a descrição dele. Em ordem do menu do jogo.</p>
        <div class="table-wrap"><table><thead><tr><th>Ponto</th><th>Descrição</th></tr></thead><tbody>
        ${GUIDE.spawns.map(s => `<tr><td><b>${esc(txt(s.name))}</b></td><td>${esc(txt(s.desc))}</td></tr>`).join('')}</tbody></table></div>
        <p><a class="map-btn" href="#/mapa?tipo=spawn">📍 Ver pontos de início no mapa</a></p>
        <p>Depois de escolher onde começar, monte seu personagem no <a href="#/personagem">criador de personagem</a>.</p>`;
    } else {
      const g = GUIDE.pages.find(x => x.id === cur);
      body = `<div class="guide-page">${g.blocks.map(b => b.i ? `<img class="guide-img" src="${esc(b.i)}" alt="" loading="lazy">` : guideText(txt(b.t))).join('')}</div>`;
    }
    const i = tabs.findIndex(t => t[0] === cur), prev = tabs[i - 1], next = tabs[i + 1];
    return `
      <div class="crumbs"><a href="#/">Início</a> › <a href="#/guia">Guia</a> › ${esc(label)}</div>
      <h1>${esc(label)}</h1>
      <div class="chips guide-tabs">${tabs.map(([k, v]) => `<a class="chip ${k === cur ? 'on' : ''}" href="#/guia/${k}">${esc(v)}</a>`).join('')}</div>
      ${body}
      <div class="guide-nav">${prev ? `<a class="more-btn" href="#/guia/${prev[0]}">← ${esc(prev[1])}</a>` : '<span></span>'}${next ? `<a class="more-btn" href="#/guia/${next[0]}">${esc(next[1])} →</a>` : '<span></span>'}</div>`;
  }

  // ---------------------------------------------------------------------------
  // Cultivo, armadilhas e reparos
  // ---------------------------------------------------------------------------
  const SEASONS = ['Primavera', 'Verão', 'Outono', 'Inverno'];
  const buildingById = id => D.buildings.find(b => b.id === id);
  const repairText = r => {
    const name = res => { const it = resItem(res); return it ? nm(it) : res; };
    return [`${r.n}× ${name(r.res)}`, ...r.extra.map(([res, n]) => `${n}× ${name(res)}`)].join(' + ');
  };

  function pageSurvival(tab) {
    const TABS = { plantio: 'Plantio', armadilhas: 'Armadilhas', reparos: 'Reparos' };
    const cur = TABS[tab] ? tab : 'plantio';
    setTitle(TABS[cur]);
    let body;
    if (cur === 'plantio') {
      const frost = SKILL['Farmer.FrostFarmer'];
      body = `
        <p class="lead">Cada semente só cresce em certas estações. Nenhuma das 6 plantas cresce no inverno pelas regras normais.</p>
        <div class="table-wrap"><table class="season-table"><thead><tr><th>Planta</th>${SEASONS.map(s => `<th class="season-col">${s}</th>`).join('')}<th class="num">Crescimento</th><th class="num">Colheita</th></tr></thead><tbody>
          ${SURV.crops.map(c => `<tr><td>${ing(c.seed, 1)}<div class="q-rewards">${ing(c.out, 1)}</div></td>
            ${SEASONS.map(s => `<td class="season-col">${c.seasons.includes(s) ? `<span class="season-yes" title="Cresce em: ${s}">✓</span>` : '<span class="muted" aria-label="Não cresce">—</span>'}</td>`).join('')}
            <td class="num">${fmt(c.days, 1)} ${c.days === 1 ? 'dia' : 'dias'}</td><td class="num">×${c.n}</td></tr>`).join('')}</tbody></table></div>
        ${frost ? `<div class="notice"><b>${esc(txt(frost.name))}</b> (skill do Fazendeiro): ${esc(txt(frost.desc))}</div>` : ''}
        <h2>Onde plantar</h2>
        <div class="table-wrap"><table><thead><tr><th>Estrutura</th><th class="num">Sementes</th><th>Precisa construir com</th></tr></thead><tbody>
          ${SURV.plots.map(x => { const b = buildingById(x.id); return `<tr><td>${b ? `<a href="#/construcoes#b-${esc(b.id)}">${esc(txt(b.name))}</a>` : esc(txt(x.name))}</td><td class="num">${x.seeds}</td>
            <td>${b ? b.req.map(([r, n]) => { const it = resItem(r); return `${n}× ${esc(it ? nm(it) : r)}`; }).join(' · ') : '<span class="muted">Fora do menu de construção</span>'}</td></tr>`; }).join('')}</tbody></table></div>
        <h2>O que cada plantação recebe</h2>
        ${SURV.plots[0].slots.filter(s => txt(s.name) && !/^(Seed|Semente)/i.test(txt(s.name))).map(s => `<div class="recipe"><div class="recipe-head"><b>${esc(txt(s.name))}</b></div><div class="recipe-flow">${s.items.map(i => ing(i, 1)).join('<span class="or-sep">ou</span>')}</div></div>`).join('')}
        <p class="muted">"Colheita" é a quantidade definida para a planta, e "Crescimento" conta dias do jogo sem efeitos de fertilizante ou skills.</p>`;
    } else if (cur === 'armadilhas') {
      const statsById = Object.fromEntries(SURV.traps.map(t => [t.id, t]));
      const blank = { affects: [], weapons: [], need: [], bait: [] };
      const inMenu = D.buildings.filter(b => b.cat === 'Traps' || (statsById[b.id] && statsById[b.id].menu)).map(b => ({ t: statsById[b.id] || blank, b, name: txt(b.name) }));
      const hidden = SURV.traps.filter(t => !t.menu).map(t => ({ t, b: null, name: txt(t.name) || t.id }));
      const byLabel = (a, b) => a.name.localeCompare(b.name, 'pt-BR');
      const trapCard = ({ t, b, name }) => {
          const facts = [
            t.dmg ? `<span class="tag">Dano ${fmt(t.dmg, 0)}</span>` : '', t.explosive ? '<span class="tag">Explosiva</span>' : '',
            t.wear ? `<span class="tag">Desgaste ${fmt(t.wear, 0)} por uso</span>` : '', t.reset ? `<span class="tag">Rearma em ${fmt(t.reset, 1)} s</span>` : '',
            t.uses ? `<span class="tag">Até ${t.uses} ativações</span>` : '', t.lure ? `<span class="tag">Atrai a ${fmt(t.lure, 0)} m</span>` : '',
            t.time ? `<span class="tag">Captura em ${fmt(t.time / 60, 0)} min</span>` : '', t.affects.includes('jogadores') ? '<span class="tag">Também atinge jogadores</span>' : ''
          ].join(' ');
          const desc = b ? txt(b.desc) : txt(t.desc);
          return `<div class="recipe"><div class="recipe-head"><span class="item-cell">${b ? img(b.icon, '') : ''}<b>${esc(name)}</b></span><span>${facts}</span></div>
            ${desc ? `<p class="muted q-meta">${esc(desc)}</p>` : ''}
            ${t.catch ? `<div class="recipe-flow q-rewards"><span class="muted">Captura:</span>${ing(t.catch, 1)}${t.bait.length ? `<span class="muted">Isca:</span>${t.bait.map(i => ing(i, 1)).join('')}` : ''}</div>` : ''}
            ${t.weapons.length ? `<div class="recipe-flow q-rewards"><span class="muted">Arma:</span>${t.weapons.map(i => ing(i, 1)).join('<span class="or-sep">ou</span>')}</div>` : ''}
            ${t.need.length ? `<div class="recipe-flow q-rewards"><span class="muted">Consome:</span>${t.need.map(i => ing(i, 1)).join('')}</div>` : ''}
            ${b ? `<div class="recipe-flow q-rewards"><span class="muted">Construir com:</span>${b.req.map(([r, n]) => { const it = resItem(r); return it ? ing(it.id, n) : `<span class="ing">${esc(r)} <b>×${n}</b></span>`; }).join('')}</div>` : ''}
          </div>`;
      };
      body = `
        <p class="lead">Armadilhas e defesas do menu de construção, com os dados que os arquivos do jogo trazem.</p>
        ${inMenu.sort(byLabel).map(trapCard).join('')}
        <div class="notice">Os valores são de base. Armadilhas sem dano listado não guardam esse número nos dados que lemos.</div>
        ${hidden.length ? `<h2>Fora do menu de construção</h2>
          <p class="muted">Existem nos arquivos, mas estão marcadas para não aparecer no menu. Podem ser conteúdo antigo ou ainda não liberado.</p>
          ${hidden.sort(byLabel).map(trapCard).join('')}` : ''}`;
    } else {
      const rows = Object.entries(SURV.repairs).map(([id, r]) => ({ id, r, b: buildingById(id) })).filter(x => x.b).sort((a, b) => txt(a.b.name).localeCompare(txt(b.b.name), 'pt-BR'));
      body = `
        <p class="lead">Quanto custa consertar cada construção e quanta vida o conserto devolve. Os mesmos dados agora aparecem em <a href="#/construcoes">Construções</a>.</p>
        <div class="table-wrap w-table"><table><thead><tr><th>Construção</th><th>Custo por reparo</th><th class="num">Vida recuperada</th><th class="num">Vida total</th></tr></thead><tbody>
          ${rows.map(({ id, r, b }) => `<tr><td><a class="item-cell" href="#/construcoes#b-${esc(id)}">${img(b.icon, '')}<span>${esc(txt(b.name))}</span></a></td><td>${esc(repairText(r))}</td><td class="num">+${fmt(r.hp, 0)}</td><td class="num">${b.hp ? fmt(b.hp, 0) : '—'}</td></tr>`).join('')}
        </tbody></table></div>`;
    }
    return `
      <div class="crumbs"><a href="#/">Início</a> › Cultivo e defesa › ${esc(TABS[cur])}</div>
      <h1>${esc(TABS[cur])}</h1>
      <div class="chips guide-tabs">${Object.entries(TABS).map(([k, v]) => `<a class="chip ${k === cur ? 'on' : ''}" href="#/cultivo/${k}">${v}</a>`).join('')}</div>
      ${body}`;
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
      case 'locais': res = pageLocations(q); break;
      case 'local': res = pageLocation(parts[1]); key = 'locais'; break;
      case 'conteiner': res = pageContainer(parts[1]); key = 'locais'; break;
      case 'receitas': res = pageRecipes(q); break;
      case 'construcoes': res = pageBuildings(); break;
      case 'armas': res = pageWeapons(q); break;
      case 'personagem': res = pageBuild(q); break;
      case 'cultivo': res = pageSurvival(parts[1]); break;
      case 'guia': res = pageGuide(parts[1]); break;
      case 'recrutas': res = pageRecruits(q); break;
      case 'bestiario': res = pageBestiary(q); break;
      case 'criatura': res = pageCreature(parts[1]); key = 'bestiario'; break;
      case 'missoes': res = pageQuests(q); break;
      case 'missao': res = pageQuest(parts[1]); key = 'missoes'; break;
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
