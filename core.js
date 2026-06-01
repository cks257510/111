(function () {
  'use strict';

  const POKEBATTLE = window.POKEBATTLE || (window.POKEBATTLE = {});

  const TYPE_COLORS = {
    노말: '#A8A878', 불꽃: '#F08030', 물: '#6890F0', 전기: '#F8D030', 풀: '#78C850',
    얼음: '#98D8D8', 격투: '#C03028', 독: '#A040A0', 땅: '#E0C068', 비행: '#A890F0',
    에스퍼: '#F85888', 벌레: '#A8B820', 바위: '#B8A038', 고스트: '#705898', 드래곤: '#7038F8',
    악: '#705848', 강철: '#B8B8D0'
  };

  const TYPE_NAMES = ['노말', '불꽃', '물', '전기', '풀', '얼음', '격투', '독', '땅', '비행', '에스퍼', '벌레', '바위', '고스트', '드래곤', '악', '강철'];

  const TYPE_EFFECTIVENESS = {
    노말: { 강함: {}, 약함: { 바위: 0.5, 강철: 0.5 }, 무효: { 고스트: 0 } },
    불꽃: { 강함: { 풀: 2, 얼음: 2, 벌레: 2, 강철: 2 }, 약함: { 불꽃: 0.5, 물: 0.5, 바위: 0.5, 드래곤: 0.5 }, 무효: {} },
    물: { 강함: { 불꽃: 2, 땅: 2, 바위: 2 }, 약함: { 물: 0.5, 풀: 0.5, 드래곤: 0.5 }, 무효: {} },
    전기: { 강함: { 물: 2, 비행: 2 }, 약함: { 전기: 0.5, 풀: 0.5, 드래곤: 0.5 }, 무효: { 땅: 0 } },
    풀: { 강함: { 물: 2, 땅: 2, 바위: 2 }, 약함: { 불꽃: 0.5, 풀: 0.5, 독: 0.5, 비행: 0.5, 벌레: 0.5, 드래곤: 0.5, 강철: 0.5 }, 무효: {} },
    얼음: { 강함: { 풀: 2, 땅: 2, 비행: 2, 드래곤: 2 }, 약함: { 불꽃: 0.5, 물: 0.5, 얼음: 0.5, 강철: 0.5 }, 무효: {} },
    격투: { 강함: { 노말: 2, 얼음: 2, 바위: 2, 악: 2, 강철: 2 }, 약함: { 독: 0.5, 비행: 0.5, 에스퍼: 0.5, 벌레: 0.5 }, 무효: { 고스트: 0 } },
    독: { 강함: { 풀: 2 }, 약함: { 독: 0.5, 땅: 0.5, 바위: 0.5, 고스트: 0.5 }, 무효: { 강철: 0 } },
    땅: { 강함: { 불꽃: 2, 전기: 2, 독: 2, 바위: 2, 강철: 2 }, 약함: { 풀: 0.5, 벌레: 0.5 }, 무효: { 비행: 0 } },
    비행: { 강함: { 풀: 2, 격투: 2, 벌레: 2 }, 약함: { 전기: 0.5, 바위: 0.5, 강철: 0.5 }, 무효: {} },
    에스퍼: { 강함: { 격투: 2, 독: 2 }, 약함: { 에스퍼: 0.5, 강철: 0.5 }, 무효: { 악: 0 } },
    벌레: { 강함: { 풀: 2, 에스퍼: 2, 악: 2 }, 약함: { 불꽃: 0.5, 격투: 0.5, 독: 0.5, 비행: 0.5, 고스트: 0.5, 강철: 0.5 }, 무효: {} },
    바위: { 강함: { 불꽃: 2, 얼음: 2, 비행: 2, 벌레: 2 }, 약함: { 격투: 0.5, 땅: 0.5, 강철: 0.5 }, 무효: {} },
    고스트: { 강함: { 에스퍼: 2, 고스트: 2 }, 약함: { 악: 0.5, 강철: 0.5 }, 무효: { 노말: 0 } },
    드래곤: { 강함: { 드래곤: 2 }, 약함: { 강철: 0.5 }, 무효: {} },
    악: { 강함: { 에스퍼: 2, 고스트: 2 }, 약함: { 격투: 0.5, 악: 0.5, 강철: 0.5 }, 무효: {} },
    강철: { 강함: { 얼음: 2, 바위: 2 }, 약함: { 불꽃: 0.5, 물: 0.5, 전기: 0.5, 강철: 0.5 }, 무효: {} }
  };

  const STATS_META = [
    { key: 'hp', label: 'HP' },
    { key: 'attack', label: '공격' },
    { key: 'defense', label: '방어' },
    { key: 'spAttack', label: '특수공격' },
    { key: 'spDefense', label: '특수방어' },
    { key: 'speed', label: '스피드' }
  ];

  const SETTINGS_KEY = 'pokebattle-settings-v2';
  const DEFAULT_IV = 31;
  const DEFAULT_EV = 0;
  const DEFAULT_NATURE = 1.0;
  const STARTER_PICK_COUNT = 2;
  const MAX_SEASONS = 20;
  const MAX_ENHANCE = 10;
  const EGG_IDS = { regular: 'mystery_egg', giant: 'huge_egg', special: 'special_egg' };
  const EGG_ITEM_META = {
    [EGG_IDS.regular]: { id: EGG_IDS.regular, nameKo: '알', category: '알', description: '부화하면 미진화 포켓몬 1마리를 얻습니다.', asset: 'egg_basic.png' },
    [EGG_IDS.giant]: { id: EGG_IDS.giant, nameKo: '거대알', category: '거대알', description: '부화하면 일반 포켓몬 위주로 1~2마리를 얻고, 아주 낮은 확률로 전설이 포함됩니다.', asset: 'egg_huge.png' },
    [EGG_IDS.special]: { id: EGG_IDS.special, nameKo: '특별알', category: '특별알', description: '2마리 확정. 종족값 높은 포켓몬 또는 전설 1마리 확정.', asset: 'spegg.png' }
  };




  const MEGA_EVOLUTION_MAP = {
    '루카리오': { id: 10001, nameKo: '메가루카리오', nameEn: 'Mega Lucario', statBoosts: { attack: 35, defense: 18, spAttack: 25, spDefense: 18, speed: 20 }, mediaNameKo: '메가루카리오' },
    '피죤투': { id: 10002, nameKo: '메가피죤투', nameEn: 'Mega Pidgeot', statBoosts: { attack: 0, defense: 5, spAttack: 55, spDefense: 10, speed: 20 }, mediaNameKo: '메가피죤투' },
    '전룡': { id: 10003, nameKo: '메가전룡', nameEn: 'Mega Ampharos', statBoosts: { attack: 20, defense: 20, spAttack: 50, spDefense: 20, speed: -10 }, mediaNameKo: '메가전룡' },
    '레쿠쟈': { id: 10004, nameKo: '메가레쿠쟈', nameEn: 'Mega Rayquaza', statBoosts: { attack: 30, defense: 20, spAttack: 30, spDefense: 20, speed: 20 }, mediaNameKo: '메가레쿠쟈' },
    '가디안': { id: 10005, nameKo: '메가가디안', nameEn: 'Mega Gardevoir', statBoosts: { attack: 20, defense: 10, spAttack: 40, spDefense: 20, speed: 20 }, mediaNameKo: '메가가디안' },
    '헤라크로스': { id: 10006, nameKo: '메가헤라크로스', nameEn: 'Mega Heracross', statBoosts: { attack: 60, defense: 40, spAttack: 0, spDefense: 10, speed: -10 }, mediaNameKo: '메가헤라크로스' },
    '헬가': { id: 10007, nameKo: '메가헬가', nameEn: 'Mega Houndoom', statBoosts: { attack: 20, defense: 10, spAttack: 30, spDefense: 10, speed: 20 }, mediaNameKo: '메가헬가' },
    '독침붕': { id: 10008, nameKo: '메가독침붕', nameEn: 'Mega Beedrill', statBoosts: { attack: 60, defense: 0, spAttack: -30, spDefense: 0, speed: 70 }, mediaNameKo: '메가독침붕' }
  };
  const STARTER_NAMES_BY_GEN = {
    '1세대': ['이상해씨', '파이리', '꼬부기'],
    '3세대': ['나무지기', '아차모', '물짱이'],
    '4세대': ['모부기', '불꽃숭이', '팽도리'],
    '5세대': ['주리비얀', '뚜꾸리', '수댕이'],
    '8세대': ['흥나숭', '염버니', '울머기']
  };

  const STARTER_ABILITY_MAP = {
    '이상해씨': { ability: '심록' }, '이상해풀': { ability: '심록' }, '이상해꽃': { ability: '심록', hiddenAbility: '엽록소' },
    '파이리': { ability: '맹화' }, '리자드': { ability: '맹화' }, '리자몽': { ability: '맹화', hiddenAbility: '선파워' },
    '꼬부기': { ability: '급류' }, '어니부기': { ability: '급류' }, '거북왕': { ability: '급류', hiddenAbility: '젖은접시' },
    '나무지기': { ability: '심록' }, '나무돌이': { ability: '심록' }, '나무킹': { ability: '심록', hiddenAbility: '곡예' },
    '아차모': { ability: '맹화' }, '영치코': { ability: '맹화' }, '번치코': { ability: '맹화', hiddenAbility: '가속' },
    '물짱이': { ability: '급류' }, '늪짱이': { ability: '급류' }, '대짱이': { ability: '급류', hiddenAbility: '습기' },
    '모부기': { ability: '심록' }, '수풀부기': { ability: '심록' }, '토대부기': { ability: '심록', hiddenAbility: '껍질갑옷' },
    '불꽃숭이': { ability: '맹화' }, '파이숭이': { ability: '맹화' }, '초염몽': { ability: '맹화', hiddenAbility: '철주먹' },
    '팽도리': { ability: '급류' }, '팽태자': { ability: '급류' }, '엠페르트': { ability: '급류', hiddenAbility: '오기' },
    '주리비얀': { ability: '심록' }, '샤비': { ability: '심록' }, '샤로다': { ability: '심록', hiddenAbility: '심술꾸러기' },
    '뚜꾸리': { ability: '맹화' }, '차오꿀': { ability: '맹화' }, '염무왕': { ability: '맹화', hiddenAbility: '무모' },
    '수댕이': { ability: '급류' }, '쌍검자비': { ability: '급류' }, '대검귀': { ability: '급류', hiddenAbility: '껍질갑옷' },
    '흥나숭': { ability: '심록', hiddenAbility: '그래스메이커' }, '채키몽': { ability: '심록', hiddenAbility: '그래스메이커' }, '고릴타': { ability: '심록', hiddenAbility: '그래스메이커' },
    '염버니': { ability: '맹화', hiddenAbility: '리베로' }, '래비풋': { ability: '맹화', hiddenAbility: '리베로' }, '에이스번': { ability: '맹화', hiddenAbility: '리베로' },
    '울머기': { ability: '급류', hiddenAbility: '스나이퍼' }, '누겔레온': { ability: '급류', hiddenAbility: '스나이퍼' }, '인텔리레온': { ability: '급류', hiddenAbility: '스나이퍼' }
  };

  const ABILITY_DESCRIPTIONS = {
    '심록': 'HP가 최대치의 1/3 이하일 때 풀 타입 기술의 위력이 1.5배가 됩니다.',
    '맹화': 'HP가 최대치의 1/3 이하일 때 불꽃 타입 기술의 위력이 1.5배가 됩니다.',
    '급류': 'HP가 최대치의 1/3 이하일 때 물 타입 기술의 위력이 1.5배가 됩니다.',
    '엽록소': '쾌청일 때 스피드가 2배가 됩니다.',
    '선파워': '쾌청일 때 특수공격이 1.5배가 되지만 턴 종료마다 HP가 조금 줄어듭니다.',
    '젖은접시': '비가 내릴 때 턴 종료마다 HP를 조금 회복합니다.',
    '곡예': '지닌물건이 없을 때 스피드가 2배가 됩니다.',
    '가속': '매 턴 종료 시 스피드가 1랭크 상승합니다.',
    '습기': '자폭, 대폭발처럼 쓰러지며 사용하는 기술을 막습니다.',
    '껍질갑옷': '급소 공격을 맞지 않습니다.',
    '철주먹': '주먹 계열 기술의 위력이 1.2배가 됩니다.',
    '오기': '상대 때문에 능력치가 내려가면 공격이 2랭크 상승합니다.',
    '심술꾸러기': '자신에게 적용되는 능력치 변화의 방향이 반대로 바뀝니다.',
    '무모': '반동 데미지를 받는 기술의 위력이 1.2배가 됩니다.'
  };


  function createDungeonProgress() {
    return { leagueBattlesCompleted: 0, usedAtBattleCount: null, attemptedAtBattleCount: null };
  }


  function getEnhanceCost(targetLevel) {
    const lv = Math.max(1, Math.min(MAX_ENHANCE, Number(targetLevel || 1)));
    return ({1:10000,2:15000,3:20000,4:20000,5:25000})[lv] || 25000;
  }

  function getEnhanceRate(targetLevel) {
    const lv = Math.max(1, Math.min(MAX_ENHANCE, Number(targetLevel || 1)));
    return ({1:0.80,2:0.80,3:0.80,4:0.60,5:0.70,6:0.20,7:0.50})[lv] || 0.50;
  }

  function getEnhanceSummary(runtimePokemon) {
    const current = Math.max(0, Number(runtimePokemon?.enhanceLevel || 0));
    const target = Math.min(MAX_ENHANCE, current + 1);
    return {
      current,
      target,
      unlocked: true,
      meetsLevel: Number(runtimePokemon?.level || 0) >= 36,
      cost: getEnhanceCost(target),
      rate: getEnhanceRate(target),
      canProtect: target >= 5
    };
  }

  function applyEnhanceBonuses(runtimePokemon) {
    if (!runtimePokemon?.stats) return;
    const enhance = Math.max(0, Number(runtimePokemon.enhanceLevel || 0));
    const prevMax = Math.max(1, Number(runtimePokemon.maxHp || runtimePokemon.stats.hp || 1));
    const prevHp = Math.max(0, Number(runtimePokemon.currentHp || prevMax));
    let hpBonus = 0;
    let attackBonus = 0;
    let spAttackBonus = 0;
    for (let step = 1; step <= enhance; step += 1) {
      if (step <= 4) hpBonus += 12 + step * 3;
      else if (step % 2 === 1) attackBonus += 9 + Math.floor(step / 2);
      else spAttackBonus += 9 + Math.floor(step / 2);
    }
    runtimePokemon.stats.hp = Math.max(1, Number(runtimePokemon.stats.hp || 1) + hpBonus);
    runtimePokemon.stats.attack = Math.max(1, Number(runtimePokemon.stats.attack || 1) + attackBonus);
    runtimePokemon.stats.spAttack = Math.max(1, Number(runtimePokemon.stats.spAttack || 1) + spAttackBonus);
    runtimePokemon.maxHp = runtimePokemon.stats.hp;
    const ratio = prevHp / prevMax;
    runtimePokemon.currentHp = Math.max(1, Math.min(runtimePokemon.maxHp, Math.round(runtimePokemon.maxHp * ratio)));
    runtimePokemon.enhanceBonus = { hpBonus, attackBonus, spAttackBonus };
  }

  function getOwnedSpeciesBases(playerId, options = {}) {
    const ids = getOwnedSpeciesIdSet(playerId, options);
    return state.allPokemon.filter((pokemon) => ids.has(Number(pokemon?.id || 0)));
  }

  function getSpecialEggPool(playerId) {
    const excluded = getOwnedSpeciesIdSet(playerId, { includeEggs: true });
    const all = state.allPokemon.filter((pokemon) => pokemon && !pokemon.isMegaEvolution && !excluded.has(Number(pokemon.id || 0)));
    const sorted = all.slice().sort((a, b) => Number(b.statTotal || 0) - Number(a.statTotal || 0));
    const legendary = sorted.filter((pokemon) => shouldExcludeLegend(pokemon));
    const elite = sorted.filter((pokemon) => !shouldExcludeLegend(pokemon) && Number(pokemon.statTotal || 0) >= 500);
    const regular = sorted.filter((pokemon) => !shouldExcludeLegend(pokemon));
    return { legendary, elite, regular };
  }

  function getPreviousEvolutionBase(basePokemon) {
    if (!basePokemon) return null;
    return (state.allPokemon || []).find((candidate) => Number(candidate?.evolution?.nextEvoId) === Number(basePokemon.id)) || null;
  }

  function canDevolveWithStone(runtimePokemon) {
    const held = getHeldItems(runtimePokemon);
    const hasStone = held.some((item) => normalizeItemId(item.id) === 'everstone');
    return Boolean(hasStone && getPreviousEvolutionBase(runtimePokemon?.base));
  }

  function devolvePokemon(runtimePokemon) {
    const prev = getPreviousEvolutionBase(runtimePokemon?.base);
    if (!prev) return { ok:false, message:'되돌릴 진화 전 포켓몬이 없습니다.' };
    const held = getHeldItems(runtimePokemon);
    const hasStone = held.some((item) => normalizeItemId(item.id) === 'everstone');
    if (!hasStone) return { ok:false, message:'변함없는돌을 지니게 해야 합니다.' };
    syncRuntimePokemon(runtimePokemon, prev);
    return { ok:true, message:`${prev.nameKo} 상태로 되돌렸습니다.`, pokemon: runtimePokemon };
  }

  function sellReservePokemon(playerId, uid) {
    const player = getPlayer(playerId || state.activePlayerId);
    if (!player) return { ok:false, message:'플레이어를 찾지 못했습니다.' };
    const index = (player.reserve || []).findIndex((pokemon) => pokemon.uid === uid);
    if (index < 0) return { ok:false, message:'판매할 포켓몬이 없습니다.' };
    const [sold] = player.reserve.splice(index, 1);
    const amount = sold && sold.marketFree ? 0 : 200;
    addMoney(player.id, amount);
    return { ok:true, pokemon:sold, amount };
  }

  function tryEnhancePokemon(playerId, uid, useProtection = false) {
    const player = getPlayer(playerId || state.activePlayerId);
    if (!player) return { ok:false, message:'플레이어를 찾지 못했습니다.' };
    const runtimePokemon = [...(player.squad || []), ...(player.reserve || [])].find((pokemon) => pokemon.uid === uid);
    if (!runtimePokemon) return { ok:false, message:'포켓몬을 찾지 못했습니다.' };
    const summary = getEnhanceSummary(runtimePokemon);
    if (!summary.unlocked) return { ok:false, message:'강화 조건을 확인해 주세요.' };
    if (!summary.meetsLevel) return { ok:false, message:'36레벨 이후부터 강화할 수 있습니다.' };
    if (summary.current >= MAX_ENHANCE) return { ok:false, message:'이미 10강입니다.' };
    if (!spendMoney(player.id, summary.cost)) return { ok:false, message:'재화가 부족합니다.' };
    let usedProtection = false;
    if (useProtection && summary.canProtect) {
      const consumed = consumeBagItem(player.id, 'enhance_guard', 1);
      if (consumed) usedProtection = true;
    }
    const success = Math.random() <= summary.rate;
    if (success) {
      runtimePokemon.enhanceLevel = summary.target;
      const beforeBloodline = String(runtimePokemon.bloodline || 'normal');
      const isSuperiorOrAbove = ['elite','superior','great','ancient','mew','mew_descendant','우수혈통','고대혈통','뮤의 후손'].includes(beforeBloodline) || beforeBloodline.includes('우수') || beforeBloodline.includes('고대') || beforeBloodline.includes('뮤');
      if (isSuperiorOrAbove && summary.target >= 7) runtimePokemon.bloodline = 'mew';
      else if (isSuperiorOrAbove && summary.target >= 5) runtimePokemon.bloodline = 'ancient';
      recalculateRuntimeStats(runtimePokemon, { preserveRatio: true });
      const bloodlineMsg = beforeBloodline !== String(runtimePokemon.bloodline || 'normal') ? ' · 혈통 자동 업그레이드!' : '';
      return { ok:true, success:true, pokemon:runtimePokemon, message:`강화 성공! ${summary.target}강${bloodlineMsg}`, usedProtection };
    }
    if (summary.target >= 5 && !usedProtection) {
      runtimePokemon.enhanceLevel = Math.max(0, summary.current - 1);
      recalculateRuntimeStats(runtimePokemon, { preserveRatio: true });
      return { ok:true, success:false, pokemon:runtimePokemon, message:`강화 실패... ${runtimePokemon.enhanceLevel}강으로 하락`, usedProtection };
    }
    recalculateRuntimeStats(runtimePokemon, { preserveRatio: true });
    return { ok:true, success:false, pokemon:runtimePokemon, message:'강화 실패... 단계는 유지', usedProtection };
  }


  const state = {
    gameMode: 'single',
    season: 1,
    currentScreen: 'title',
    currentCategory: 'squad',
    activePlayerId: 'p1',
    selectedSwap: null,
    selectedItemId: null,
    welcomeDismissed: false,
    settings: {
      sfx: true,
      animationSpeed: '상',
      bgmVolume: 0.7,
      language: 'ko'
    },
    players: {
      p1: createEmptyPlayer('p1', '레드'),
      p2: createEmptyPlayer('p2', '그린')
    },
    allPokemon: [],
    pokemonById: new Map(),
    itemsById: new Map(),
    itemList: [],
    typeColors: TYPE_COLORS,
    typeEffectiveness: TYPE_EFFECTIVENESS,
    defenseEffectiveness: buildDefenseEffectiveness(TYPE_EFFECTIVENESS, TYPE_NAMES),
    typeNames: TYPE_NAMES,
    statsMeta: STATS_META,
    uiBound: false,
    helperSeen: { p1: { league: false, dungeon: false }, p2: { league: false, dungeon: false } },
    dungeonProgressByPlayer: { p1: createDungeonProgress(), p2: createDungeonProgress() },
    dungeonProgress: createDungeonProgress(),
    starterDraft: {
      mode: 'single',
      activePlayerId: 'p1',
      selections: { p1: [], p2: [] },
      starterPool: []
    },
    shopInventoryByPlayer: {},
    seasonStarterEggPoolBySeason: {},
    localBestSquadBoard: { p1: { bestStreak:0, registeredAt:null, squadNames:[] }, p2: { bestStreak:0, registeredAt:null, squadNames:[] } }
  };

  function createEmptyPlayer(id, name) {
    return {
      id,
      name,
      seasonLabel: '시즌 1',
      squad: [],
      reserve: [],
      money: 150,
      bag: {
        holdables: [],
        consumables: [
          { id: 'pp_aid', nameKo: 'PP에이드', amount: 1, category: '소비 아이템', description: '기술 하나의 현재 PP를 10 회복합니다.' },
          { id: 'rare_candy', nameKo: '이상한사탕', amount: 2, category: '소비 아이템', description: '선택 후 포켓몬을 터치하면 레벨이 1 오른다.' },
          { id: 'auto_dungeon_ticket', nameKo: '자동던전이용권', amount: 0, category: '소비 아이템', description: '선택한 던전을 즉시 클리어하고 보상을 받습니다.' }
        ]
      }
    };
  }

  function buildDefenseEffectiveness(attackChart, types) {
    return types.reduce((acc, defenseType) => {
      const attackEntries = [];
      const defendEntries = [];

      types.forEach((attackingType) => {
        const record = attackChart[attackingType] || { 강함: {}, 약함: {}, 무효: {} };
        let multiplier = 1;
        if (Object.prototype.hasOwnProperty.call(record.강함 || {}, defenseType)) multiplier = record.강함[defenseType];
        if (Object.prototype.hasOwnProperty.call(record.약함 || {}, defenseType)) multiplier = record.약함[defenseType];
        if (Object.prototype.hasOwnProperty.call(record.무효 || {}, defenseType)) multiplier = record.무효[defenseType];
        if (multiplier !== 1) defendEntries.push({ type: attackingType, multiplier });

        const against = attackChart[defenseType] || { 강함: {}, 약함: {}, 무효: {} };
        let attackMultiplier = 1;
        if (Object.prototype.hasOwnProperty.call(against.강함 || {}, attackingType)) attackMultiplier = against.강함[attackingType];
        if (Object.prototype.hasOwnProperty.call(against.약함 || {}, attackingType)) attackMultiplier = against.약함[attackingType];
        if (Object.prototype.hasOwnProperty.call(against.무효 || {}, attackingType)) attackMultiplier = against.무효[attackingType];
        if (attackMultiplier !== 1) attackEntries.push({ type: attackingType, multiplier: attackMultiplier });
      });

      acc[defenseType] = {
        attack: sortByMultiplier(attackEntries),
        defense: sortByMultiplier(defendEntries)
      };
      return acc;
    }, {});
  }

  function sortByMultiplier(entries) {
    const order = { 2: 0, 1.5: 1, 1: 2, 0.5: 3, 0: 4 };
    return entries.sort((a, b) => {
      const oa = Object.prototype.hasOwnProperty.call(order, a.multiplier) ? order[a.multiplier] : 99;
      const ob = Object.prototype.hasOwnProperty.call(order, b.multiplier) ? order[b.multiplier] : 99;
      if (oa !== ob) return oa - ob;
      return a.type.localeCompare(b.type, 'ko');
    });
  }

  function loadSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      state.settings = {
        sfx: typeof parsed.sfx === 'boolean' ? parsed.sfx : true,
        animationSpeed: parsed.animationSpeed === '하' ? '하' : '상',
        bgmVolume: Number.isFinite(Number(parsed.bgmVolume)) ? Math.max(0, Math.min(1, Number(parsed.bgmVolume))) : 0.7,
        language: parsed.language === 'en' ? 'en' : 'ko'
      };
    } catch (error) {
      console.warn('설정 로드에 실패했습니다.', error);
    }
  }

  function saveSettings() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings));
    } catch (error) {
      console.warn('설정 저장에 실패했습니다.', error);
    }
  }


  function createMegaEntry(baseEntry) {
    const megaMeta = MEGA_EVOLUTION_MAP[baseEntry?.nameKo];
    if (!baseEntry || !megaMeta) return null;
    const speciesStats = { ...(baseEntry.speciesStats || baseEntry.stats || {}) };
    Object.entries(megaMeta.statBoosts || {}).forEach(([key, delta]) => {
      speciesStats[key] = Math.max(1, Number(speciesStats[key] || 1) + Number(delta || 0));
    });
    return {
      ...JSON.parse(JSON.stringify(baseEntry)),
      id: megaMeta.id,
      nameKo: megaMeta.nameKo,
      nameEn: megaMeta.nameEn,
      finalFormKo: megaMeta.nameKo,
      finalFormEn: megaMeta.nameEn,
      ability: null,
      hiddenAbility: null,
      speciesStats,
      stats: { ...speciesStats },
      statTotal: Object.values(speciesStats).reduce((sum, value) => sum + Number(value || 0), 0),
      battleNote: `${baseEntry.battleNote || ''} 메가진화 후에는 고속 화력 에이스로 운용할 수 있다.`.trim(),
      evolution: null,
      megaBaseNameKo: baseEntry.nameKo,
      megaEligibleLevel: 70,
      isMegaEvolution: true,
      mediaNameKo: megaMeta.mediaNameKo || megaMeta.nameKo
    };
  }

  function combinePokemonDatabases() {
    const sources = [
      typeof POKEMON_DATABASE !== 'undefined' ? POKEMON_DATABASE : window.POKEMON_DATABASE,
      typeof POKEMON_DATABASE_2 !== 'undefined' ? POKEMON_DATABASE_2 : window.POKEMON_DATABASE_2,
      typeof POKEMON_DATABASE_3 !== 'undefined' ? POKEMON_DATABASE_3 : window.POKEMON_DATABASE_3,
      typeof POKEMON_DATABASE_4 !== 'undefined' ? POKEMON_DATABASE_4 : window.POKEMON_DATABASE_4,
      typeof POKEMON_DATABASE_35 !== 'undefined' ? POKEMON_DATABASE_35 : window.POKEMON_DATABASE_35
    ];

    const combined = [];
    const seen = new Set();
    sources.forEach((list) => {
      if (!Array.isArray(list)) return;
      list.forEach((entry) => {
        if (!entry || typeof entry.id !== 'number' || seen.has(entry.id)) return;
        seen.add(entry.id);
        if (!entry.speciesStats) entry.speciesStats = { ...(entry.stats || {}) };
        entry.statsCategory = '종족치';
        const starterMeta = STARTER_ABILITY_MAP[entry.nameKo];
        if (starterMeta) {
          entry.ability = starterMeta.ability || entry.ability || null;
          entry.hiddenAbility = starterMeta.hiddenAbility || entry.hiddenAbility || null;
        }
        combined.push(entry);
      });
    });
    const megaEntries = combined
      .map((entry) => createMegaEntry(entry))
      .filter(Boolean);
    megaEntries.forEach((entry) => combined.push(entry));
    combined.sort((a, b) => a.id - b.id);
    state.allPokemon = combined;
    state.pokemonById = new Map(combined.map((pokemon) => [pokemon.id, pokemon]));
  }

  function parseItemDatabase() {
    state.itemList = [];
    state.itemsById = new Map();
    const raw = typeof window.ITEM_DATABASE_RAW === 'string'
      ? window.ITEM_DATABASE_RAW
      : (typeof ITEM_DATABASE_RAW !== 'undefined' ? ITEM_DATABASE_RAW : '');
    if (!raw) return;

    const entries = raw.match(/[a-zA-Z0-9_]+\s*\{[\s\S]*?\n\s*\}/g) || [];
    entries.forEach((chunk) => {
      const id = normalizeItemId(matchValue(chunk, /id\s+([a-z0-9_]+)/i));
      const rank = Number(matchValue(chunk, /rank\s+(\d+)/i) || 0);
      const nameKo = cleanInline(matchValue(chunk, /name_ko\s+([^,\n]+)/i));
      const nameEn = cleanInline(matchValue(chunk, /name_en\s+([^,\n]+)/i));
      const category = cleanInline(matchValue(chunk, /category\s+([^,\n]+)/i));
      const descriptionKo = cleanInline(matchValue(chunk, /description_ko\s+([^,\n]+)/i));
      const battleEffectKo = cleanInline(matchValue(chunk, /battle_effect_ko\s+([^,\n]+)/i));
      const primaryColor = cleanInline(matchValue(chunk, /primary_color\s+([^,\s}]+)/i) || '#7ecfff');
      const secondaryColor = cleanInline(matchValue(chunk, /secondary_color\s+([^,\s}]+)/i) || primaryColor);
      if (!id || !nameKo) return;
      const item = { id, rank, nameKo, nameEn, category, description: descriptionKo, battleEffect: battleEffectKo, colorA: primaryColor, colorB: secondaryColor };
      state.itemList.push(item);
      state.itemsById.set(id, item);
    });
    state.itemList.sort((a, b) => (a.rank || 999) - (b.rank || 999));
  }

  function normalizeItemId(id) {
    return String(id || '').trim().toLowerCase();
  }


  function getHeldItems(runtimePokemon) {
    if (!runtimePokemon) return [];
    if (Array.isArray(runtimePokemon.heldItems)) {
      runtimePokemon.heldItems = runtimePokemon.heldItems.filter(Boolean);
    } else if (runtimePokemon.heldItem) {
      runtimePokemon.heldItems = [{ ...runtimePokemon.heldItem }];
    } else {
      runtimePokemon.heldItems = [];
    }
    runtimePokemon.heldItem = runtimePokemon.heldItems[0] || null;
    return runtimePokemon.heldItems;
  }

  function syncHeldItemAlias(runtimePokemon) {
    if (!runtimePokemon) return;
    const items = getHeldItems(runtimePokemon);
    runtimePokemon.heldItem = items[0] || null;
  }

  function matchValue(chunk, regex) {
    const match = chunk.match(regex);
    return match ? match[1] : '';
  }

  function cleanInline(value) {
    return String(value || '').replace(/^['"`]+|['"`]+$/g, '').trim();
  }

  function shouldExcludeLegend(pokemon) {
    if (!pokemon) return true;
    const name = `${pokemon.nameKo || ''} ${pokemon.finalFormKo || ''}`;
    const legendaryKeywords = ['아르세우스', '루기아', '칠색조', '뮤츠', '뮤', '제크로무', '게노세크트', '기라티나', '코스모그', '코스모움', '솔가레오', '루나아라'];
    return legendaryKeywords.some((keyword) => name.includes(keyword));
  }

  function getTrueStarterCandidates() {
    const starterNameSet = new Set(Object.values(STARTER_NAMES_BY_GEN).flat());
    return state.allPokemon.filter((pokemon) => starterNameSet.has(pokemon?.nameKo));
  }

  function getCurrentSpeciesId(runtimePokemon) {
    return Number(runtimePokemon?.base?.id || runtimePokemon?.id || 0);
  }

  function getEggItemMeta(itemId) {
    return EGG_ITEM_META[normalizeItemId(itemId)] || null;
  }

  function getStarterIdSet() {
    return new Set(getTrueStarterCandidates().map((pokemon) => Number(pokemon?.id)));
  }

  function getOwnedSpeciesIdSet(playerId, options = {}) {
    const player = getPlayer(playerId || state.activePlayerId);
    const includeEggs = options.includeEggs !== false;
    const ids = new Set();
    if (!player) return ids;
    [...(player.squad || []), ...(player.reserve || [])].forEach((pokemon) => {
      const id = getCurrentSpeciesId(pokemon);
      if (id) ids.add(id);
    });
    if (includeEggs) {
      (player.bag?.consumables || []).forEach((entry) => {
        (entry.eggs || []).forEach((egg) => {
          const id = Number(egg?.pokemonId || 0);
          if (id) ids.add(id);
        });
      });
    }
    return ids;
  }

  function playerHasSpecies(playerId, speciesId, options = {}) {
    return getOwnedSpeciesIdSet(playerId, options).has(Number(speciesId || 0));
  }

  function getPrimaryType(basePokemon) {
    return Array.isArray(basePokemon?.type) && basePokemon.type.length ? String(basePokemon.type[0] || '') : '';
  }

  function ensureSeasonStarterEggPool(season = state.season) {
    const seasonNo = Math.max(1, Number(season || state.season || 1));
    if (Array.isArray(state.seasonStarterEggPoolBySeason?.[seasonNo]) && state.seasonStarterEggPoolBySeason[seasonNo].length >= 2) {
      return state.seasonStarterEggPoolBySeason[seasonNo].slice(0, 2);
    }
    const starterPool = shuffle(getTrueStarterCandidates().filter((pokemon) => pokemon && !pokemon.isMegaEvolution && !shouldExcludeLegend(pokemon)));
    const chosen = [];
    const usedTypes = new Set();
    starterPool.forEach((pokemon) => {
      if (chosen.length >= 2) return;
      const primaryType = getPrimaryType(pokemon);
      if (primaryType && usedTypes.has(primaryType)) return;
      chosen.push(Number(pokemon.id));
      if (primaryType) usedTypes.add(primaryType);
    });
    starterPool.forEach((pokemon) => {
      if (chosen.length >= 2) return;
      const id = Number(pokemon?.id || 0);
      if (id && !chosen.includes(id)) chosen.push(id);
    });
    state.seasonStarterEggPoolBySeason = { ...(state.seasonStarterEggPoolBySeason || {}), [seasonNo]: chosen.slice(0, 2) };
    return state.seasonStarterEggPoolBySeason[seasonNo].slice(0, 2);
  }

  function isRegularEggBase(basePokemon) {
    if (!basePokemon || basePokemon.isMegaEvolution) return false;
    if (shouldExcludeLegend(basePokemon)) return false;
    const all = state.allPokemon || [];
    const hasPreviousEvolution = all.some((candidate) => Number(candidate?.evolution?.nextEvoId) === Number(basePokemon.id));
    const canEvolveFurther = Boolean(basePokemon.evolution?.nextEvoId);
    return !hasPreviousEvolution && canEvolveFurther;
  }

  function getRegularEggPool(playerId, season = state.season) {
    const excluded = getOwnedSpeciesIdSet(playerId, { includeEggs: true });
    const seasonalStarterIds = new Set(ensureSeasonStarterEggPool(season));
    const starterIds = getStarterIdSet();
    return state.allPokemon.filter((pokemon) => {
      if (!isRegularEggBase(pokemon)) return false;
      const id = Number(pokemon?.id || 0);
      if (!id || excluded.has(id)) return false;
      if (starterIds.has(id) && !seasonalStarterIds.has(id)) return false;
      return true;
    });
  }

  function getHugeEggPool(playerId, season = state.season) {
    const excluded = getOwnedSpeciesIdSet(playerId, { includeEggs: true });
    const legendary = state.allPokemon.filter((pokemon) => pokemon && !pokemon.isMegaEvolution && shouldExcludeLegend(pokemon) && !excluded.has(Number(pokemon.id || 0)));
    const regular = getRegularEggPool(playerId, season);
    return { legendary, regular };
  }

  function pickEggBaseForPlayer(playerId, eggType, season = state.season) {
    const normalized = normalizeItemId(eggType);
    if (normalized === EGG_IDS.giant) {
      const pools = getHugeEggPool(playerId, season);
      if (pools.legendary.length && (Math.random() < 0.08 || !pools.regular.length)) {
        return shuffle(pools.legendary)[0] || null;
      }
      return shuffle(pools.regular)[0] || shuffle(pools.legendary)[0] || null;
    }
    if (normalized === EGG_IDS.special) {
      const pools = getSpecialEggPool(playerId);
      return shuffle(pools.elite)[0] || shuffle(pools.regular)[0] || shuffle(pools.legendary)[0] || null;
    }
    return shuffle(getRegularEggPool(playerId, season))[0] || null;
  }

  function ensureConsumableEntry(player, seed) {
    if (!player?.bag) return null;
    if (!player.bag.consumables) player.bag.consumables = [];
    const normalized = normalizeItemId(seed?.id);
    let target = player.bag.consumables.find((item) => normalizeItemId(item.id) === normalized);
    if (!target) {
      target = { ...seed, id: normalized, amount: Number(seed?.amount || 0) };
      player.bag.consumables.push(target);
    }
    return target;
  }

  function syncEggEntryAmount(entry) {
    if (!entry) return;
    entry.eggs = Array.isArray(entry.eggs) ? entry.eggs.filter(Boolean) : [];
    entry.amount = entry.eggs.length;
  }

  function queueEggForPlayer(playerId, eggType, payload = {}) {
    const player = getPlayer(playerId || state.activePlayerId);
    const meta = getEggItemMeta(eggType);
    if (!player || !meta) return null;
    const seasonNo = Math.max(1, Number(payload.season || state.season || 1));
    const basePokemon = payload.basePokemon || state.pokemonById.get(Number(payload.pokemonId || 0)) || pickEggBaseForPlayer(player.id, meta.id, seasonNo);
    if (!basePokemon) return null;
    const entry = ensureConsumableEntry(player, { ...meta, eggs: [] });
    entry.eggs = Array.isArray(entry.eggs) ? entry.eggs : [];
    const egg = { pokemonId: Number(basePokemon.id), eggType: meta.id, seasonAwarded: seasonNo };
    entry.eggs.push(egg);
    syncEggEntryAmount(entry);
    return { entry, egg, basePokemon, meta };
  }

  function addPokemonToCollection(playerId, runtimePokemon) {
    const player = getPlayer(playerId || state.activePlayerId);
    if (!player || !runtimePokemon) return false;
    const speciesId = getCurrentSpeciesId(runtimePokemon);
    // v3: 포켓몬 중복 획득 허용
    if ((player.squad || []).length < 3) player.squad.push(runtimePokemon);
    else player.reserve.push(runtimePokemon);
    return true;
  }

  
function hatchEgg(playerId, eggType) {
    const player = getPlayer(playerId || state.activePlayerId);
    const normalized = normalizeItemId(eggType);
    const entry = player?.bag?.consumables?.find((item) => normalizeItemId(item.id) === normalized);
    if (!player || !entry) return { ok: false, message: '부화할 알이 없습니다.' };
    entry.eggs = Array.isArray(entry.eggs) ? entry.eggs : [];
    if (!entry.eggs.length) {
      syncEggEntryAmount(entry);
      return { ok: false, message: '부화할 알이 없습니다.' };
    }
    let egg = entry.eggs.shift();
    syncEggEntryAmount(entry);
    const hatched = [];
    const makeOne = (preferredBase = null) => {
      let basePokemon = preferredBase || state.pokemonById.get(Number(egg?.pokemonId || 0)) || null;
      if (!basePokemon) {
        basePokemon = pickEggBaseForPlayer(player.id, normalized, Number(egg?.seasonAwarded || state.season || 1));
      }
      if (!basePokemon) return null;
      const runtimePokemon = createRuntimePokemon(basePokemon, 5);
      const added = addPokemonToCollection(player.id, runtimePokemon);
      if (!added) return null;
      return { basePokemon, runtimePokemon };
    };
    if (normalized === EGG_IDS.special) {
      const pools = getSpecialEggPool(player.id);
      const guaranteed = (Math.random() < 0.25 && pools.legendary.length)
        ? (shuffle(pools.legendary)[0] || shuffle(pools.elite)[0] || shuffle(pools.regular)[0] || null)
        : (shuffle(pools.elite)[0] || shuffle(pools.regular)[0] || shuffle(pools.legendary)[0] || null);
      const first = makeOne(guaranteed);
      if (first) hatched.push(first);
      const second = makeOne();
      if (second) hatched.push(second);
    } else if (normalized === EGG_IDS.giant) {
      const first = makeOne();
      if (first) hatched.push(first);
      const twoCount = Math.random() < 0.22;
      if (twoCount) {
        const second = makeOne();
        if (second) hatched.push(second);
      }
    } else {
      const one = makeOne();
      if (one) hatched.push(one);
    }
    player.bag.consumables = (player.bag.consumables || []).filter((item) => !(normalizeItemId(item.id) == normalized && Number(item.amount || 0) <= 0));
    if (!hatched.length) return { ok: false, message: '새로 얻을 수 있는 포켓몬이 더 없습니다.' };
    return {
      ok: true,
      eggType: normalized,
      basePokemon: hatched[0].basePokemon,
      runtimePokemon: hatched[0].runtimePokemon,
      allHatched: hatched,
      remaining: Number(entry.amount || 0)
    };
  }

  function getStarterDraftPool() {
    return Object.entries(STARTER_NAMES_BY_GEN).map(([gen, names]) => ({
      generation: gen,
      pokemon: names.map((name) => state.allPokemon.find((entry) => entry.nameKo === name)).filter(Boolean)
    })).filter((group) => group.pokemon.length);
  }

  function beginStarterDraft(mode) {
    state.season = 1;
    state.gameMode = mode === 'duo' ? 'duo' : 'single';
    state.activePlayerId = 'p1';
    state.dungeonProgress = getDungeonProgress('p1');
    state.currentCategory = 'squad';
    state.currentScreen = 'starter';
    state.selectedSwap = null;
    state.selectedItemId = null;
    state.welcomeDismissed = false;
    state.seasonStarterEggPoolBySeason = {};
    ensureSeasonStarterEggPool(1);
    resetAllDungeonProgress();
    state.players.p1 = createEmptyPlayer('p1', '레드');
    state.players.p2 = createEmptyPlayer('p2', '그린');
    state.starterDraft = {
      mode: state.gameMode,
      activePlayerId: 'p1',
      selections: { p1: [], p2: [] },
      starterPool: getStarterDraftPool()
    };
    POKEBATTLE.ui.showScreen('starter');
    POKEBATTLE.ui.renderAll();
  }

  function toggleStarterChoice(pokemonId) {
    const pid = state.starterDraft.activePlayerId || 'p1';
    const picks = state.starterDraft.selections[pid] || [];
    const numericId = Number(pokemonId);
    const exists = picks.includes(numericId);
    if (exists) state.starterDraft.selections[pid] = picks.filter((id) => id !== numericId);
    else if (picks.length < STARTER_PICK_COUNT) state.starterDraft.selections[pid] = [...picks, numericId];
    else return false;
    POKEBATTLE.ui?.playUiSound?.('starting');
    POKEBATTLE.ui.renderAll();
    return true;
  }

  function finalizeStarterDraft() {
    const picks = state.starterDraft.selections[state.starterDraft.activePlayerId] || [];
    if (picks.length !== STARTER_PICK_COUNT) return false;
    if (state.gameMode === 'duo' && state.starterDraft.activePlayerId === 'p1') {
      state.starterDraft.activePlayerId = 'p2';
      POKEBATTLE.ui.renderAll();
      return true;
    }
    assignStarterSquadsFromDraft();
    if (POKEBATTLE.league?.initialize) POKEBATTLE.league.initialize(state.gameMode);
    state.currentScreen = 'lobby';
    POKEBATTLE.ui.showScreen('lobby');
    POKEBATTLE.ui.renderAll();
    POKEBATTLE.ui.openWelcomeModal();
    return true;
  }

  function assignHiddenAbilityStarter(playerId) {
    const player = getPlayer(playerId);
    if (!player) return;
    const allParty = [...(player.squad || []), ...(player.reserve || [])].filter(Boolean);
    allParty.forEach((pokemon) => {
      pokemon.useHiddenAbility = false;
      pokemon.hiddenEligibleDisplay = false;
      pokemon.ability = pokemon.visibleAbility || pokemon.base?.ability || null;
    });
    const squadStarters = (player.squad || []).filter((pokemon) => pokemon?.starterHiddenCandidate && hasNextEvolution(pokemon.base));
    const chosen = squadStarters[0] || null;
    if (!chosen) return;
    chosen.useHiddenAbility = true;
    chosen.hiddenEligibleDisplay = true;
    chosen.ability = (!hasNextEvolution(chosen.base) && chosen.hiddenAbility) ? chosen.hiddenAbility : (chosen.visibleAbility || chosen.base?.ability || null);
  }

  function assignStarterSquadsFromDraft() {
    state.players.p1 = createEmptyPlayer('p1', '레드');
    state.players.p2 = createEmptyPlayer('p2', '그린');
    const redIds = state.starterDraft.selections.p1 || [];
    const greenIds = (state.gameMode === 'duo' ? state.starterDraft.selections.p2 : []);
    state.players.p1.squad = redIds.map((id) => state.pokemonById.get(id)).filter(Boolean).map((pokemon) => { const runtime = createRuntimePokemon(pokemon, 5); runtime.marketFree = true; runtime.originTag = 'initial_starter'; return runtime; });
    if (state.gameMode === 'duo') {
      state.players.p2.squad = greenIds.map((id) => state.pokemonById.get(id)).filter(Boolean).map((pokemon) => { const runtime = createRuntimePokemon(pokemon, 5); runtime.marketFree = true; runtime.originTag = 'initial_starter'; return runtime; });
    } else {
      const chosen = new Set(redIds);
      const aiPool = shuffle(getTrueStarterCandidates().filter((pokemon) => !chosen.has(pokemon.id)));
      state.players.p2.squad = aiPool.slice(0, STARTER_PICK_COUNT).map((pokemon) => { const runtime = createRuntimePokemon(pokemon, 5); runtime.marketFree = true; runtime.originTag = 'initial_starter'; return runtime; });
    }
    state.players.p1.reserve = [];
    state.players.p2.reserve = [];
    grantInitialDungeonRewards('p1');
    if (state.gameMode === 'duo') grantInitialDungeonRewards('p2');
    assignHiddenAbilityStarter('p1');
    if (state.gameMode === 'duo') assignHiddenAbilityStarter('p2');
  }


function getInitialRouteRewardBases(count = 2, playerId = state.activePlayerId) {
  const all = state.allPokemon || [];
  const isTrueUnevolved = (pokemon) => {
    if (!pokemon || pokemon.isMegaEvolution) return false;
    if (shouldExcludeLegend(pokemon)) return false;
    const hasPreviousEvolution = all.some((candidate) => Number(candidate?.evolution?.nextEvoId) === Number(pokemon.id));
    const canEvolveFurther = Boolean(pokemon.evolution?.nextEvoId);
    return !hasPreviousEvolution && canEvolveFurther;
  };
  const seen = new Set();
  const pool = all.filter((pokemon) => {
    if (!isTrueUnevolved(pokemon)) return false;
    const id = Number(pokemon?.id);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
  const owned = getOwnedSpeciesIdSet(playerId, { includeEggs: false });
  const filtered = pool.filter((pokemon) => !owned.has(Number(pokemon?.id || 0)));
  const shuffled = shuffle(filtered.length ? filtered : pool);
  return shuffled.slice(0, Math.max(0, Number(count || 0)));
}

function grantInitialDungeonRewards(playerId) {
  const rewards = getInitialRouteRewardBases(1, playerId).map((basePokemon) => { const runtime = createRuntimePokemon(basePokemon, 5); runtime.marketFree = true; runtime.originTag = 'initial_random_reward'; return runtime; });
  const player = getPlayer(playerId || state.activePlayerId);
  if (!player) return rewards;
  rewards.forEach((runtime) => {
    addPokemonToCollection(playerId, runtime);
  });
  return rewards;
}

  function getStarterDraftState() {
    return state.starterDraft;
  }

  function isUnevolvedCandidate(pokemon) {
    return getTrueStarterCandidates().some((entry) => entry.id === pokemon?.id);
  }

  function shuffle(list) {

    const cloned = list.slice();
    for (let i = cloned.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
    }
    return cloned;
  }

  function calculateStatsForLevel(basePokemon, level, overrides = {}) {
    const src = basePokemon?.speciesStats || basePokemon?.stats || {};
    const lv = Math.max(1, Math.min(100, Number(level || 1)));
    const iv = Number(overrides.iv ?? DEFAULT_IV);
    const ev = Number(overrides.ev ?? DEFAULT_EV);
    const nature = Number(overrides.nature ?? DEFAULT_NATURE);
    const stats = {};
    ['hp', 'attack', 'defense', 'spAttack', 'spDefense', 'speed'].forEach((key) => {
      const base = Number(src[key] || 1);
      if (key === 'hp') {
        stats[key] = Math.max(1, Math.floor((((2 * base) + iv + Math.floor(ev / 4)) * lv) / 100) + lv + 10);
      } else {
        const raw = Math.floor((((2 * base) + iv + Math.floor(ev / 4)) * lv) / 100) + 5;
        stats[key] = Math.max(1, Math.floor(raw * nature));
      }
    });
    return stats;
  }

  function recalculateRuntimeStats(runtimePokemon, options = {}) {
    if (!runtimePokemon?.base) return;
    const prevMaxHp = Math.max(1, Number(runtimePokemon.maxHp || 1));
    const prevHp = Math.max(0, Number(runtimePokemon.currentHp || prevMaxHp));
    runtimePokemon.stats = calculateStatsForLevel(runtimePokemon.base, runtimePokemon.level);
    runtimePokemon.maxHp = Number(runtimePokemon.stats.hp || 1);
    applyEnhanceBonuses(runtimePokemon);
    if (options.fullHeal) runtimePokemon.currentHp = runtimePokemon.maxHp;
    else {
      const ratio = prevHp / prevMaxHp;
      runtimePokemon.currentHp = Math.max(0, Math.min(runtimePokemon.maxHp, Math.round(runtimePokemon.maxHp * ratio)));
    }
  }

  function hasNextEvolution(basePokemon) {
    return Boolean(basePokemon?.evolution?.nextEvoId);
  }

  function createRuntimePokemon(basePokemon, level) {
    const actualLevel = Math.max(1, Math.min(100, Number(level || 1)));
    const stats = calculateStatsForLevel(basePokemon, actualLevel);
    const maxHp = Number(stats.hp || 1);
    return {
      uid: `${basePokemon.id}-${Math.random().toString(36).slice(2, 10)}`,
      id: basePokemon.id,
      level: actualLevel,
      baseLevel: actualLevel,
      exp: 0,
      heldItems: [],
      heldItem: null,
      candyUsed: 0,
      enhanceLevel: 0,
      base: basePokemon,
      currentName: basePokemon.nameKo,
      currentTypes: Array.isArray(basePokemon.type) ? basePokemon.type.slice() : [],
      speciesStats: { ...(basePokemon.speciesStats || basePokemon.stats || {}) },
      starterHiddenCandidate: Boolean(basePokemon.hiddenAbility),
      useHiddenAbility: false,
      ability: basePokemon.ability || null,
      visibleAbility: basePokemon.ability || null,
      hiddenAbility: basePokemon.hiddenAbility || null,
      hiddenEligibleDisplay: false,
      statCalc: { levelBase: actualLevel, iv: DEFAULT_IV, ev: DEFAULT_EV, nature: DEFAULT_NATURE },
      stats: { ...stats },
      maxHp,
      currentHp: maxHp,
      battle: null,
      status: null,
      moves: (basePokemon.moves || []).slice(0, 3).map((move) => ({ ...move, currentPP: move.pp || 1, maxPP: move.pp || 1 }))
    };
  }

  function syncRuntimePokemon(runtimePokemon, nextBase) {
    if (!runtimePokemon || !nextBase) return;
    const hpRatio = runtimePokemon.maxHp > 0 ? runtimePokemon.currentHp / runtimePokemon.maxHp : 1;
    runtimePokemon.base = nextBase;
    runtimePokemon.id = nextBase.id;
    runtimePokemon.currentName = nextBase.nameKo;
    runtimePokemon.currentTypes = Array.isArray(nextBase.type) ? nextBase.type.slice() : [];
    runtimePokemon.moves = (nextBase.moves || []).slice(0, 3).map((move) => ({ ...move, currentPP: move.pp || 1, maxPP: move.pp || 1 }));
    runtimePokemon.visibleAbility = nextBase.ability || null;
    runtimePokemon.hiddenAbility = nextBase.hiddenAbility || null;
    runtimePokemon.hiddenEligibleDisplay = Boolean(runtimePokemon.useHiddenAbility);
    runtimePokemon.ability = runtimePokemon.useHiddenAbility && !hasNextEvolution(nextBase) && nextBase.hiddenAbility
      ? nextBase.hiddenAbility
      : (nextBase.ability || null);
    recalculateRuntimeStats(runtimePokemon, { preserveRatio: true });
    runtimePokemon.currentHp = Math.max(1, Math.min(runtimePokemon.maxHp, Math.round(runtimePokemon.maxHp * hpRatio)));
  }

  function maybeEvolve(runtimePokemon) {
    const megaMeta = MEGA_EVOLUTION_MAP[runtimePokemon?.base?.nameKo];
    if (megaMeta && Number(runtimePokemon.level || 0) >= 50) {
      const megaBase = state.pokemonById.get(megaMeta.id);
      if (megaBase && runtimePokemon.base?.id !== megaBase.id) {
        syncRuntimePokemon(runtimePokemon, megaBase);
        runtimePokemon.ability = null;
        runtimePokemon.visibleAbility = null;
        runtimePokemon.hiddenAbility = null;
        runtimePokemon.useHiddenAbility = false;
        runtimePokemon.hiddenEligibleDisplay = false;
        return megaBase;
      }
    }
    if (getHeldItems(runtimePokemon).some((item) => normalizeItemId(item.id) === 'everstone')) return null;
    if (!runtimePokemon?.base?.evolution?.nextEvoId) return null;
    const evoLevel = Number(runtimePokemon.base.evolution.evoLevel || 0);
    if (runtimePokemon.level < evoLevel) return null;
    const nextBase = state.pokemonById.get(runtimePokemon.base.evolution.nextEvoId);
    if (!nextBase) return null;
    syncRuntimePokemon(runtimePokemon, nextBase);
    if (runtimePokemon.useHiddenAbility && !hasNextEvolution(nextBase) && nextBase.hiddenAbility) {
      runtimePokemon.ability = nextBase.hiddenAbility;
      runtimePokemon.hiddenEligibleDisplay = true;
    }
    return nextBase;
  }

  function applyLevelReward(runtimePokemon, gainedLevels, options = {}) {
    if (!runtimePokemon) return [];
    const events = [];
    const gain = Math.max(0, Number(gainedLevels || 0));
    const prevLevel = Number(runtimePokemon.level || 1);
    runtimePokemon.level = Math.min(100, prevLevel + gain);
    if (options.countAsBase !== false) {
      runtimePokemon.baseLevel = Math.min(100, Number(runtimePokemon.baseLevel || prevLevel) + gain);
    }
    if (options.fromCandy) {
      runtimePokemon.candyUsed = Number(runtimePokemon.candyUsed || 0) + gain;
    }
    if (runtimePokemon.level !== prevLevel) {
      recalculateRuntimeStats(runtimePokemon, { fullHeal: true });
      events.push(`${runtimePokemon.currentName}의 레벨이 Lv.${runtimePokemon.level}로 올랐다!`);
    }
    let evolved = maybeEvolve(runtimePokemon);
    while (evolved) {
      recalculateRuntimeStats(runtimePokemon, { fullHeal: true });
      events.push(`${evolved.nameKo}(으)로 진화했다!`);
      evolved = maybeEvolve(runtimePokemon);
    }
    runtimePokemon.currentHp = runtimePokemon.maxHp;
    return events;
  }



  function getAllPartyPokemon(playerOrId) {
    const player = typeof playerOrId === 'string' ? getPlayer(playerOrId) : playerOrId;
    if (!player) return [];
    return [...(player.squad || []), ...(player.reserve || [])];
  }

  function healPlayerTeam(playerOrId) {
    getAllPartyPokemon(playerOrId).forEach((pokemon) => {
      pokemon.currentHp = pokemon.maxHp;
      if (pokemon.battle) pokemon.battle = null;
      (pokemon.moves || []).forEach((move) => {
        move.currentPP = move.maxPP;
      });
    });
  }

  function setPlayerTeamLevel(playerOrId, level) {
    const targetLevel = Math.max(1, Math.min(100, Number(level || 1)));
    getAllPartyPokemon(playerOrId).forEach((pokemon) => {
      pokemon.level = Math.min(100, targetLevel + Number(pokemon.candyUsed || 0));
      pokemon.baseLevel = targetLevel;
      if (!pokemon.preventEvolution) {
        while (maybeEvolve(pokemon)) {}
      }
      recalculateRuntimeStats(pokemon, { fullHeal: true });
      pokemon.currentHp = pokemon.maxHp;
    });
  }

  function levelUpWholeTeam(playerOrId, gainedLevels, options = {}) {
    const events = [];
    getAllPartyPokemon(playerOrId).forEach((pokemon) => {
      events.push(...applyLevelReward(pokemon, gainedLevels, options));
      pokemon.currentHp = pokemon.maxHp;
    });
    return events;
  }

  function assignStarterSquads() {
    const candidates = shuffle(getTrueStarterCandidates());
    const pool = candidates.slice(0, 6);

    state.players.p1 = createEmptyPlayer('p1', '레드');
    state.players.p2 = createEmptyPlayer('p2', '그린');

    const redTeam = pool.slice(0, STARTER_PICK_COUNT).map((pokemon) => createRuntimePokemon(pokemon, 5));
    const greenTeam = pool.slice(STARTER_PICK_COUNT, STARTER_PICK_COUNT * 2).map((pokemon) => createRuntimePokemon(pokemon, 5));

    state.players.p1.squad = redTeam;
    state.players.p2.squad = greenTeam;
    state.players.p1.reserve = [];
    state.players.p2.reserve = [];
  }

  function getActivePlayer() {

    return state.players[state.activePlayerId];
  }

  function getPlayer(playerId) {
    return state.players[playerId];
  }

  function getBestStatKeys(player) {
    const best = {};
    STATS_META.forEach(({ key }) => {
      best[key] = Math.max(0, ...player.squad.map((pokemon) => Number(pokemon?.stats?.[key] || 0)));
    });
    return best;
  }

  function startGame(mode) {
    state.shopInventoryByPlayer = {};
    beginStarterDraft(mode);
  }

  function setCategory(category) {
    state.currentCategory = category;
    state.selectedSwap = null;
    if (category !== 'items') state.selectedItemId = null;
    POKEBATTLE.ui?.playUiSound?.('change');
    POKEBATTLE.ui.renderAll();
  }

  function setActivePlayer(playerId) {
    if (playerId !== 'p1' && playerId !== 'p2') return;
    if (playerId === 'p2' && state.gameMode !== 'duo') return;
    state.activePlayerId = playerId;
    state.dungeonProgress = getDungeonProgress(playerId);
    state.selectedSwap = null;
    state.selectedItemId = null;
    POKEBATTLE.ui.renderAll();
  }

  function setSetting(key, value) {
    if (key === 'sfx') state.settings.sfx = Boolean(value);
    if (key === 'animationSpeed') state.settings.animationSpeed = value === '하' ? '하' : '상';
    if (key === 'bgmVolume') state.settings.bgmVolume = Math.max(0, Math.min(1, Number(value) || 0));
    if (key === 'language') state.settings.language = value === 'en' ? 'en' : 'ko';
    saveSettings();
    if (key === 'bgmVolume' && POKEBATTLE.ui?.syncBgmVolume) POKEBATTLE.ui.syncBgmVolume();
    POKEBATTLE.ui.renderSettingsModal();
    POKEBATTLE.ui.renderAll?.();
  }

  function resolveSelection(type, uid) {
    const player = getActivePlayer();
    const current = state.selectedSwap;
    if (!current || current.playerId !== player.id) {
      state.selectedSwap = { playerId: player.id, type, uid };
      POKEBATTLE.ui?.playUiSound?.('change');
      POKEBATTLE.ui.renderAll();
      return;
    }
    if (current.type === type && current.uid === uid) {
      state.selectedSwap = null;
      POKEBATTLE.ui?.playUiSound?.('cancel');
      POKEBATTLE.ui.renderAll();
      return;
    }
    const swapped = swapPokemonBetweenSlots(player, current, { playerId: player.id, type, uid });
    state.selectedSwap = null;
    if (swapped) { POKEBATTLE.ui?.playUiSound?.('abutton'); POKEBATTLE.ui.showToast('포켓몬 위치를 교체했습니다.'); }
    POKEBATTLE.ui.renderAll();
  }

  function swapPokemonBetweenSlots(player, source, target) {
    const sourceRef = getContainerRef(player, source.type);
    const targetRef = getContainerRef(player, target.type);
    if (!sourceRef || !targetRef) return false;
    const sourceIndex = sourceRef.findIndex((pokemon) => pokemon.uid === source.uid);
    const targetIndex = targetRef.findIndex((pokemon) => pokemon.uid === target.uid);
    if (sourceIndex < 0 || targetIndex < 0) return false;
    [sourceRef[sourceIndex], targetRef[targetIndex]] = [targetRef[targetIndex], sourceRef[sourceIndex]];
    assignHiddenAbilityStarter(player.id);
    return true;
  }

  function getContainerRef(player, type) {
    if (type === 'squad') return player.squad;
    if (type === 'reserve') return player.reserve;
    return null;
  }

  function selectItem(itemId) {
    const normalized = normalizeItemId(itemId);
    state.selectedSwap = null;
    state.selectedItemId = state.selectedItemId === normalized ? null : normalized;
    POKEBATTLE.ui?.playUiSound?.('change');
    POKEBATTLE.ui.renderAll();
  }

  function toggleHeldItem(runtimeUid) {
    const player = getActivePlayer();
    const pokemon = [...player.squad, ...player.reserve].find((entry) => entry.uid === runtimeUid);
    if (!pokemon) return;
    const consumable = player.bag.consumables.find((entry) => normalizeItemId(entry.id) === normalizeItemId(state.selectedItemId));
    if (consumable) {
      if (normalizeItemId(consumable.id) === 'rare_candy') {
        if (consumable.amount <= 0) {
          POKEBATTLE.ui.showToast('이상한사탕이 부족합니다.');
          return;
        }
        consumable.amount -= 1;
        const events = applyLevelReward(pokemon, 1, { fromCandy: true, countAsBase: false });
        pokemon.currentHp = pokemon.maxHp;
        POKEBATTLE.ui?.playUiSound?.('abutton');
        POKEBATTLE.ui.showToast(events[0] || `${pokemon.currentName}의 레벨이 올랐습니다.`);
        if (events[1]) POKEBATTLE.ui.showToast(events[1]);
        POKEBATTLE.ui.renderAll();
        return;
      }
      POKEBATTLE.ui.showToast('이 아이템은 배틀 중 가방에서 사용합니다.');
      return;
    }

    player.bag.holdables = player.bag.holdables || [];
    const equipped = getHeldItems(pokemon);

    if (!state.selectedItemId) {
      const removed = equipped.pop();
      if (removed) {
        const returned = player.bag.holdables.find((entry) => normalizeItemId(entry.id) === normalizeItemId(removed.id));
        if (returned) returned.amount = Number(returned.amount || 0) + 1;
        else player.bag.holdables.push({ ...removed, amount: 1 });
        syncHeldItemAlias(pokemon);
        POKEBATTLE.ui?.playUiSound?.('cancel');
        POKEBATTLE.ui.showToast('지닌물건을 해제했습니다.');
        POKEBATTLE.ui.renderAll();
      }
      return;
    }

    const bagEntry = player.bag.holdables.find((entry) => normalizeItemId(entry.id) === normalizeItemId(state.selectedItemId) && Number(entry.amount || 0) > 0);
    if (!bagEntry) {
      POKEBATTLE.ui.showToast('보유한 지닌물건만 장착할 수 있습니다.');
      state.selectedItemId = null;
      POKEBATTLE.ui.renderAll();
      return;
    }

    if (equipped.some((entry) => normalizeItemId(entry.id) === normalizeItemId(state.selectedItemId))) {
      POKEBATTLE.ui.showToast('같은 지닌물건은 한 포켓몬에게 중복 장착할 수 없습니다.');
      return;
    }

    if (equipped.length >= 2) {
      POKEBATTLE.ui.showToast('포켓몬당 지닌물건은 2개까지만 장착할 수 있습니다.');
      return;
    }

    bagEntry.amount -= 1;
    const item = state.itemsById.get(normalizeItemId(state.selectedItemId)) || state.itemsById.get(state.selectedItemId) || bagEntry;
    equipped.push({ ...item });
    syncHeldItemAlias(pokemon);
    POKEBATTLE.ui?.playUiSound?.('abutton');
    POKEBATTLE.ui.showToast(`${pokemon.currentName}에게 ${item.nameKo}를 장착했습니다.`);
    POKEBATTLE.ui.renderAll();
  }


  function getHoldableInventory(playerId) {
    const player = getPlayer(playerId || state.activePlayerId);
    return (player?.bag?.holdables || []).filter((item) => Number(item.amount || 0) > 0);
  }

  function getHoldableCatalog() {
    return state.itemList.filter((item) => cleanInline(item.category) === '지닌물건');
  }

  function getConsumables(playerId) {
    const player = getPlayer(playerId || state.activePlayerId);
    return player ? player.bag.consumables : [];
  }

  function consumeBagItem(playerId, itemId) {
    const player = getPlayer(playerId || state.activePlayerId);
    if (!player) return false;
    const target = player.bag.consumables.find((item) => normalizeItemId(item.id) === normalizeItemId(itemId));
    if (!target || target.amount <= 0) return false;
    target.amount -= 1;
    return true;
  }

  function refundBagItem(playerId, itemId) {
    const player = getPlayer(playerId || state.activePlayerId);
    if (!player) return;
    const target = player.bag.consumables.find((item) => normalizeItemId(item.id) === normalizeItemId(itemId));
    if (target) target.amount += 1;
  }

  function startQuickBattle() {
    if (!POKEBATTLE.battleEngine?.startBattle) return;
    POKEBATTLE.battleEngine.startBattle({
      playerId: state.activePlayerId,
      opponentId: state.activePlayerId === 'p1' ? 'p2' : 'p1',
      isDuo: state.gameMode === 'duo'
    });
  }



function cloneRuntimePokemonForBattle(runtimePokemon) {
  if (!runtimePokemon?.base) return null;
  const clone = createRuntimePokemon(runtimePokemon.base, Number(runtimePokemon.level || runtimePokemon.baseLevel || 5));
  clone.baseLevel = Number(runtimePokemon.baseLevel || runtimePokemon.level || 5);
  clone.exp = Number(runtimePokemon.exp || 0);
  clone.candyUsed = Number(runtimePokemon.candyUsed || 0);
  clone.heldItems = getHeldItems(runtimePokemon).map((item) => ({ ...item }));
  clone.heldItem = clone.heldItems[0] || null;
  clone.currentName = runtimePokemon.currentName || clone.currentName;
  clone.currentTypes = Array.isArray(runtimePokemon.currentTypes) ? runtimePokemon.currentTypes.slice() : clone.currentTypes;
  clone.visibleAbility = runtimePokemon.visibleAbility || clone.visibleAbility || null;
  clone.hiddenAbility = runtimePokemon.hiddenAbility || clone.hiddenAbility || null;
  clone.ability = runtimePokemon.ability || clone.ability || null;
  clone.useHiddenAbility = Boolean(runtimePokemon.useHiddenAbility);
  clone.hiddenEligibleDisplay = Boolean(runtimePokemon.hiddenEligibleDisplay);
  clone.moves = (runtimePokemon.moves || []).slice(0, 3).map((move) => ({ ...move }));
  recalculateRuntimeStats(clone, { fullHeal: true });
  return clone;
}

function startFriendlyBattle() {
  if (state.gameMode !== 'duo' || !POKEBATTLE.battleEngine?.startBattle) return false;
  const red = getPlayer('p1');
  const green = getPlayer('p2');
  const playerTeam = (red?.squad || []).map(cloneRuntimePokemonForBattle).filter(Boolean);
  const opponentTeam = (green?.squad || []).map(cloneRuntimePokemonForBattle).filter(Boolean);
  return POKEBATTLE.battleEngine.startBattle({
    playerId: 'p1',
    opponentId: 'p2',
    playerTeam,
    opponentTeam,
    playerName: red?.name || '레드',
    opponentName: green?.name || '그린',
    isDuo: true,
    mode: 'friendly',
    specialBgm: 'hgssrival.mp3',
    onComplete: () => {
      window.setTimeout(() => {
        returnToLobby();
        POKEBATTLE.ui?.showToast?.('친선배틀이 종료되었습니다.');
      }, 5000);
      return true;
    }
  });
}

  function addConsumable(playerId, itemId, amount = 1) {
    const player = getPlayer(playerId || state.activePlayerId);
    if (!player) return false;
    const normalized = normalizeItemId(itemId);
    const source = state.itemList.find((item) => normalizeItemId(item.id) === normalized) || getEggItemMeta(normalized);
    const target = ensureConsumableEntry(player, {
      id: normalized,
      nameKo: source?.nameKo || itemId,
      amount: 0,
      category: source?.category || '소비아이템',
      description: source?.description || ''
    });
    target.amount += Math.max(1, Number(amount || 1));
    return true;
  }

  function addPokemonToReserve(playerId, runtimePokemon) {
    const player = getPlayer(playerId || state.activePlayerId);
    if (!player || !runtimePokemon) return false;
    const speciesId = getCurrentSpeciesId(runtimePokemon);
    // v3: 포켓몬 중복 획득 허용
    let safety = 8;
    while (safety > 0) {
      const evolved = maybeEvolve(runtimePokemon);
      if (!evolved) break;
      safety -= 1;
    }
    player.reserve.push(runtimePokemon);
    return true;
  }

  function getReferenceLevel(playerId) {
    const player = getPlayer(playerId || state.activePlayerId);
    const lead = player?.squad?.[0];
    return Number(lead?.baseLevel || lead?.level || 5);
  }

  function getHelperSeen(category, playerId) {
    const pid = playerId || state.activePlayerId;
    return Boolean(state.helperSeen?.[pid]?.[category]);
  }

  function markHelperSeen(category, playerId) {
    const pid = playerId || state.activePlayerId;
    if (!state.helperSeen[pid]) state.helperSeen[pid] = {};
    state.helperSeen[pid][category] = true;
  }


  function getDungeonProgress(playerId) {
    const pid = playerId || state.activePlayerId || 'p1';
    if (!state.dungeonProgressByPlayer) state.dungeonProgressByPlayer = { p1: createDungeonProgress(), p2: createDungeonProgress() };
    if (!state.dungeonProgressByPlayer[pid]) state.dungeonProgressByPlayer[pid] = createDungeonProgress();
    if (pid === state.activePlayerId) state.dungeonProgress = state.dungeonProgressByPlayer[pid];
    return state.dungeonProgressByPlayer[pid];
  }

  function resetDungeonProgress(playerId) {
    const pid = playerId || state.activePlayerId || 'p1';
    if (!state.dungeonProgressByPlayer) state.dungeonProgressByPlayer = { p1: createDungeonProgress(), p2: createDungeonProgress() };
    state.dungeonProgressByPlayer[pid] = createDungeonProgress();
    if (pid === state.activePlayerId) state.dungeonProgress = state.dungeonProgressByPlayer[pid];
    return state.dungeonProgressByPlayer[pid];
  }

  function resetAllDungeonProgress() {
    resetDungeonProgress('p1');
    resetDungeonProgress('p2');
  }


  function getShopCatalog() {
    return state.itemList
      .filter((item) => normalizeItemId(item.id) !== 'egg_shard')
      .map((item) => {
        const normalized = normalizeItemId(item.id);
        const isHoldable = cleanInline(item.category) === '지닌물건';
        let price = isHoldable ? 70 + Number(item.rank || 1) * 10 : 26 + Number(item.rank || 1) * 4;
        if (['choice_band', 'choice_specs', 'choice_scarf', 'life_orb'].includes(normalized)) price += 35;
        if (['leftovers', 'black_sludge'].includes(normalized)) price += 28;
        if (normalized === 'light_ball') price += 16;
        if (normalized === 'rare_candy') price = 200;
        if (normalized === 'revive_shard') price = 200;
        if (['pp_aid', 'pp_aide'].includes(normalized)) price = 36;
        if (['good_potion'].includes(normalized)) price = 100;
        if (['recovery_potion'].includes(normalized)) price = 220;
        if (['enhance_guard'].includes(normalized)) price = 260;
        if (normalized === 'focus_sash') price = 200;
        if (['everstone'].includes(normalized)) price = 55;
        if (['auto_dungeon_ticket'].includes(normalized)) price = 110;
        if (normalized === 'mystery_egg') price = 700;
        if (normalized === 'huge_egg') price = 6000;
        if (['paralyze_heal', 'antidote', 'burn_heal', 'ice_heal', 'awakening_spray'].includes(normalized)) price = 20;
        if (['reset_herb', 'plus_power', 'defend_up', 'special_up', 'special_guard', 'speed_up', 'critical_cutter', 'effect_guard'].includes(normalized)) price = 34;
        return { ...item, price };
      })
      .sort((a, b) => {
        const catA = cleanInline(a.category) === '지닌물건' ? 0 : 1;
        const catB = cleanInline(b.category) === '지닌물건' ? 0 : 1;
        return catA - catB || Number(a.rank || 0) - Number(b.rank || 0) || Number(a.price || 0) - Number(b.price || 0) || String(a.nameKo || '').localeCompare(String(b.nameKo || ''), 'ko');
      });
  }

  function sampleShopInventory(playerId, forceRefresh = false) {
    const pid = playerId || state.activePlayerId;
    if (!forceRefresh && state.shopInventoryByPlayer[pid]?.length) return state.shopInventoryByPlayer[pid];
    state.shopInventoryByPlayer[pid] = getShopCatalog();
    return state.shopInventoryByPlayer[pid];
  }

  function getFriendlyShopInventory(playerId, forceRefresh = false) {
    return sampleShopInventory(playerId, forceRefresh).slice();
  }

  function refreshFriendlyShopInventory(playerId) {
    return sampleShopInventory(playerId, true).slice();
  }

  function consumeFriendlyShopInventoryItem(playerId, itemId) {
    return;
  }

  function addMoney(playerId, amount) {
    const player = getPlayer(playerId || state.activePlayerId);
    if (!player) return 0;
    player.money = Math.max(0, Number(player.money || 0) + Number(amount || 0));
    return player.money;
  }

  function spendMoney(playerId, amount) {
    const player = getPlayer(playerId || state.activePlayerId);
    const cost = Math.max(0, Number(amount || 0));
    if (!player || Number(player.money || 0) < cost) return false;
    player.money -= cost;
    return true;
  }

  function buyShopItem(playerId, itemId) {
    const pid = playerId || state.activePlayerId;
    const entry = getShopCatalog().find((item) => normalizeItemId(item.id) === normalizeItemId(itemId));
    if (!entry) return { ok:false, message:'구매할 수 없는 아이템입니다.' };
    if (!spendMoney(pid, entry.price)) return { ok:false, message:'재화가 부족합니다.' };
    if (cleanInline(entry.category) === '지닌물건') {
      const player = getPlayer(pid);
      if (!player.bag.holdables) player.bag.holdables = [];
      const ex = player.bag.holdables.find((it) => normalizeItemId(it.id) === normalizeItemId(entry.id));
      if (ex) ex.amount = Number(ex.amount || 0) + 1;
      else player.bag.holdables.push({ id: entry.id, nameKo: entry.nameKo, amount: 1, category: entry.category, description: entry.description, colorA: entry.colorA, rank: entry.rank, battleEffect: entry.battleEffect });
    } else {
      addConsumable(pid, entry.id, 1);
    }
    return { ok:true, item:entry };
  }

  function returnToLobby() {
    state.currentScreen = 'lobby';
    POKEBATTLE.ui.renderAll();
    setTimeout(() => { try { POKEBATTLE.ui?.syncBackgroundMusic?.('lobby', true); } catch (error) {} }, 60);
  }

  function bindEvents() {
    if (state.uiBound) return;
    state.uiBound = true;
    document.querySelectorAll('[data-start-mode]').forEach((button) => {
      button.addEventListener('click', (event) => {
        if (event) event.preventDefault();
        POKEBATTLE.ui?.playUiSound?.('start');
        startGame(button.dataset.startMode);
      });
    });
    document.querySelectorAll('[data-nav]').forEach((button) => {
      button.addEventListener('click', () => { POKEBATTLE.ui?.playUiSound?.('category'); setCategory(button.dataset.nav); });
    });
    const settingsButton = document.getElementById('open-settings-btn');
    const typeButton = document.getElementById('open-type-chart-btn');
    const battleTypeButton = document.getElementById('battle-type-chart-btn');
    if (settingsButton) settingsButton.addEventListener('click', () => { POKEBATTLE.ui?.playUiSound?.('change'); POKEBATTLE.ui.openSettingsModal(); });
    if (typeButton) typeButton.addEventListener('click', () => { POKEBATTLE.ui?.playUiSound?.('change'); POKEBATTLE.ui.openTypeChartModal(); });
    if (battleTypeButton) battleTypeButton.addEventListener('click', () => { POKEBATTLE.ui?.playUiSound?.('change'); POKEBATTLE.ui.openTypeChartModal(); });
  }

  function boot() {
    loadSettings();
    combinePokemonDatabases();
    parseItemDatabase();
    bindEvents();
    if (!state.allPokemon.length) {
      console.error('포켓몬 데이터 로딩에 실패했습니다.');
    }
    POKEBATTLE.ui.init();
    POKEBATTLE.ui.renderAll();
  }

  POKEBATTLE.core = {
    state,
    TYPE_COLORS,
    TYPE_NAMES,
    TYPE_EFFECTIVENESS,
    STATS_META,
    boot,
    startGame,
    setCategory,
    setActivePlayer,
    setSetting,
    getActivePlayer,
    getPlayer,
    getBestStatKeys,
    resolveSelection,
    saveSettings,
    isUnevolvedCandidate,
    createRuntimePokemon,
    shouldExcludeLegend,
    getTrueStarterCandidates,
    getStarterDraftState,
    toggleStarterChoice,
    finalizeStarterDraft,
    beginStarterDraft,
    applyLevelReward,
    maybeEvolve,
    getAllPartyPokemon,
    healPlayerTeam,
    setPlayerTeamLevel,
    levelUpWholeTeam,
    addConsumable,
    queueEggForPlayer,
    hatchEgg,
    getEggItemMeta,
    ensureSeasonStarterEggPool,
    getOwnedSpeciesIdSet,
    playerHasSpecies,
    addPokemonToCollection,
    addPokemonToReserve,
    getReferenceLevel,
    getHelperSeen,
    markHelperSeen,
    getDungeonProgress,
    resetDungeonProgress,
    resetAllDungeonProgress,
    getAbilityDescription: (name) => ABILITY_DESCRIPTIONS[name] || '배틀에서 적용되는 특성과 효과를 확인할 수 있습니다.',
    selectItem,
    toggleHeldItem,
    getHoldableInventory,
    getHoldableCatalog,
    getConsumables,
    getShopCatalog,
    getFriendlyShopInventory,
    refreshFriendlyShopInventory,
    addMoney,
    spendMoney,
    buyShopItem,
    consumeBagItem,
    refundBagItem,
    startQuickBattle,
    startFriendlyBattle,
    returnToLobby,
    normalizeItemId,
    getHeldItems,
    syncRuntimePokemon,
    calculateStatsForLevel,
    recalculateRuntimeStats,
    DEFAULT_IV,
    DEFAULT_EV,
    DEFAULT_NATURE,
    MAX_SEASONS,
    EGG_IDS,
    MAX_ENHANCE,
    getEnhanceSummary,
    tryEnhancePokemon,
    sellReservePokemon,
    canDevolveWithStone,
    devolvePokemon,
    getPreviousEvolutionBase
  };

  document.addEventListener('DOMContentLoaded', boot);
})();
