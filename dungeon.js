(function () {
  'use strict';

  const POKEBATTLE = window.POKEBATTLE || (window.POKEBATTLE = {});

  const DUNGEONS = {
    route201: {
      id: 'route201',
      name: '201번도로',
      difficulty: '하',
      theme: 'route',
      battleBand: [0, 1],
      levelOffset: -5,
      boss: '다크라이',
      legendChance: 0.05,
      itemChance: 0.6,
      description: '리그 배틀 누적 0~1회일 때 도전 가능.'
    },
    galaxy: {
      id: 'galaxy',
      name: '갤럭시단 빌딩',
      difficulty: '중',
      theme: 'galaxy',
      battleBand: [2, 3],
      levelOffset: -2,
      boss: '포푸니라',
      legendChance: 0.05,
      itemChance: 0.8,
      hugeEggChance: 0,
      description: '리그 배틀 누적 2~3회일 때 도전 가능.'
    },
    distortion: {
      id: 'distortion',
      name: '깨어진 세계',
      difficulty: '상',
      theme: 'distortion',
      battleBand: [4, Infinity],
      levelOffset: -2,
      boss: '기라티나',
      legendChance: 0.30,
      itemChance: 0.9,
      hugeEggChance: 0.18,
      description: '리그 배틀 누적 4회 이상일 때 도전 가능'
    }
  };

  const LEGENDARY_NAMES = new Set(['뮤츠','뮤','루기아','칠색조','라이코','앤테이','스이쿤','세레비','레지락','레지아이스','레지스틸','라티아스','라티오스','가이오가','그란돈','레쿠쟈','지라치','테오키스','유크시','엠라이트','아그놈','디아루가','펄기아','히드런','레지기가스','기라티나','크레세리아','피오네','마나피','다크라이','쉐이미','아르세우스','코바르온','테라키온','비리디온','토네로스','볼트로스','레시라무','제크로무','랜드로스','큐레무','케르디오','메로엣타','게노세크트']);
  const DISTORTION_ACCESS_NAMES = new Set(['라프라스','전룡','메리프','보송송','핫삼','헤라크로스','라이츄','구구','피죤','피죤투']);

  const state = {
    selectedId: 'route201',
    run: null
  };

  function core() { return POKEBATTLE.core; }
  function currentLanguage() { return POKEBATTLE.core?.state?.settings?.language === 'en' ? 'en' : 'ko'; }
  function tr(ko, en) { return currentLanguage() === 'en' ? en : ko; }
  function normalizeName(name) { return String(name || '').trim(); }

  function getProgress(playerId) {
    return core()?.getDungeonProgress?.(playerId) || core()?.state?.dungeonProgress || { leagueBattlesCompleted: 0, usedAtBattleCount: null, attemptedAtBattleCount: null };
  }

  function currentBattleCount(playerId) {
    return Number(getProgress(playerId).leagueBattlesCompleted || 0);
  }

  function isLegendaryLike(basePokemon) {
    return LEGENDARY_NAMES.has(normalizeName(basePokemon?.nameKo)) || core()?.shouldExcludeLegend?.(basePokemon);
  }

  function bst(basePokemon) {
    const stats = basePokemon?.speciesStats || basePokemon?.stats || {};
    return ['hp','attack','defense','spAttack','spDefense','speed'].reduce((sum, key) => sum + Number(stats[key] || 0), 0);
  }

  function getTier(basePokemon) {
    const total = bst(basePokemon);
    if (total >= 530) return 'high';
    if (total >= 420) return 'mid';
    return 'low';
  }

  function weightedPickByTier(list) {
    const buckets = { high: [], mid: [], low: [] };
    list.forEach((pokemon) => buckets[getTier(pokemon)].push(pokemon));
    const ticketPool = [];
    buckets.high.forEach((p) => { for (let i = 0; i < 40; i += 1) ticketPool.push(p); });
    buckets.mid.forEach((p) => { for (let i = 0; i < 50; i += 1) ticketPool.push(p); });
    buckets.low.forEach((p) => { for (let i = 0; i < 60; i += 1) ticketPool.push(p); });
    if (!ticketPool.length) return list[Math.floor(Math.random() * list.length)] || null;
    return ticketPool[Math.floor(Math.random() * ticketPool.length)] || null;
  }

  function pickUniform(list) {
    if (!Array.isArray(list) || !list.length) return null;
    return list[Math.floor(Math.random() * list.length)] || null;
  }

  function pickRandomEncounter() {
    const all = core().state.allPokemon || [];
    const pool = all.filter((pokemon) => !isLegendaryLike(pokemon));
    return weightedPickByTier(pool) || pool[0] || null;
  }

  function isTrueUnevolved(basePokemon) {
    if (!basePokemon) return false;
    const all = core().state.allPokemon || [];
    const hasPreviousEvolution = all.some((candidate) => Number(candidate?.evolution?.nextEvoId) === Number(basePokemon.id));
    const canEvolveFurther = Boolean(basePokemon.evolution?.nextEvoId);
    return !hasPreviousEvolution && canEvolveFurther;
  }

  function getNormalUnevolvedRewardPool() {
    const all = core().state.allPokemon || [];
    return all.filter((pokemon) => {
      if (!pokemon || pokemon.isMegaEvolution) return false;
      if (isLegendaryLike(pokemon)) return false;
      return isTrueUnevolved(pokemon);
    });
  }

  function getGeneralNormalRewardPool() {
    const all = core().state.allPokemon || [];
    return all.filter((pokemon) => {
      if (!pokemon || pokemon.isMegaEvolution) return false;
      return !isLegendaryLike(pokemon);
    });
  }

  function getNormalEvolvedRewardPool() {
    return getGeneralNormalRewardPool().filter((pokemon) => !isTrueUnevolved(pokemon));
  }

  function getDistortionNormalRewardPool() {
    const evolvedIds = new Set(getNormalEvolvedRewardPool().map((pokemon) => Number(pokemon?.id)));
    const all = core().state.allPokemon || [];
    const seen = new Set();
    return all.filter((pokemon) => {
      if (!pokemon || pokemon.isMegaEvolution) return false;
      if (isLegendaryLike(pokemon)) return false;
      const name = normalizeName(pokemon.nameKo);
      const ok = evolvedIds.has(Number(pokemon.id)) || DISTORTION_ACCESS_NAMES.has(name);
      if (!ok) return false;
      if (seen.has(Number(pokemon.id))) return false;
      seen.add(Number(pokemon.id));
      return true;
    });
  }

  function getLegendaryRewardPool() {
    const all = core().state.allPokemon || [];
    return all.filter((pokemon) => pokemon && !pokemon.isMegaEvolution && isLegendaryLike(pokemon));
  }

  function pickFirstRewardBase(config) {
    const pool = config?.id === 'distortion' ? getDistortionNormalRewardPool() : getNormalUnevolvedRewardPool();
    return pickUniform(pool) || pool[0] || null;
  }

  function pickSecondRewardBase(config, excludedId = null) {
    const legendaryPool = getLegendaryRewardPool().filter((pokemon) => Number(pokemon?.id) !== Number(excludedId));
    const normalPool = (config?.id === 'distortion' ? getDistortionNormalRewardPool() : getNormalUnevolvedRewardPool())
      .filter((pokemon) => Number(pokemon?.id) !== Number(excludedId));
    const legendChance = Math.max(0, Math.min(1, Number(config?.legendChance || 0)));
    const shouldLegend = legendaryPool.length > 0 && Math.random() < legendChance;
    if (shouldLegend) return pickUniform(legendaryPool) || legendaryPool[0] || null;
    return pickUniform(normalPool) || normalPool[0] || null;
  }

  function getPlayerReferenceLevel(playerId) {
    const player = core().getPlayer(playerId);
    const levels = (player?.squad || []).map((pokemon) => Number(pokemon.baseLevel || pokemon.level || 5));
    if (!levels.length) return 5;
    return Math.max(5, ...levels);
  }

  function runtimeWithAutoEvolution(basePokemon, level) {
    const runtime = core().createRuntimePokemon(basePokemon, level);
    let evolved = core().maybeEvolve(runtime);
    while (evolved) evolved = core().maybeEvolve(runtime);
    runtime.currentHp = runtime.maxHp;
    return runtime;
  }

  function chooseDungeonConfig() {
    return DUNGEONS[state.selectedId] || DUNGEONS.route201;
  }

  function availabilityFor(config, playerId) {
    const count = currentBattleCount(playerId);
    const usedAt = getProgress(playerId).usedAtBattleCount;
    const inBand = count >= config.battleBand[0] && count <= config.battleBand[1];
    if (!inBand) return { open: false, reason: `현재 누적 리그 배틀 ${count}회에서는 도전할 수 없습니다.` };
    if (usedAt === count) return { open: false, reason: '현재 MATCH 구간에서는 이미 던전 승리를 완료했습니다. 다음 리그 배틀 후 다시 도전할 수 있습니다.' };
    return { open: true, reason: `현재 누적 리그 배틀 ${count}회 기준으로 도전 가능합니다.` };
  }

  function makeEnemyTeam(config, playerId) {
    const referenceLevel = getPlayerReferenceLevel(playerId);
    const enemyLevel = Math.max(1, referenceLevel + Number(config.levelOffset || 0));
    const bossLevel = config?.id === 'route201' ? Math.max(1, referenceLevel - 3) : enemyLevel;
    const encounterBase = pickRandomEncounter();
    const bossBase = core().state.allPokemon.find((pokemon) => pokemon.nameKo === config.boss);
    return [runtimeWithAutoEvolution(encounterBase, enemyLevel), runtimeWithAutoEvolution(bossBase, bossLevel)];
  }

  function eggRewardCardHtml(eggType, label) {
    const meta = core().getEggItemMeta?.(eggType);
    const asset = meta?.asset || 'egg_basic.png';
    const title = label || meta?.nameKo || '알';
    return `<div style="display:flex;align-items:center;gap:12px;"><img src="${asset}" alt="${title}" style="width:62px;height:62px;object-fit:contain;filter:drop-shadow(0 6px 12px rgba(0,0,0,.28));"><div><div style="font-weight:900;color:#f7fbff;">${title} 획득</div><div style="font-size:12px;color:#b7c5da;">아이템 화면에서 부화</div></div></div>`;
  }

  function grantDungeonRewards(playerId, config) {
    const lines = [];
    let eggPlan = [core().EGG_IDS?.regular || 'mystery_egg'];
    if (config?.id === 'galaxy') eggPlan = [core().EGG_IDS?.regular || 'mystery_egg'];
    if (config?.id === 'distortion') eggPlan = [core().EGG_IDS?.giant || 'huge_egg'];
    if (config?.id === 'distortion' && Math.random() < 0.045) eggPlan = [core().EGG_IDS?.special || 'special_egg'];
    eggPlan.forEach((eggType) => {
      const awarded = core().queueEggForPlayer?.(playerId, eggType, { season: core().state?.season || 1 });
      if (awarded) lines.push({ html: eggRewardCardHtml(eggType, awarded.meta?.nameKo || null) });
      else lines.push('새로 받을 수 있는 포켓몬이 없어 알이 지급되지 않았다.');
    });
    core().addConsumable(playerId, 'rare_candy', 1);
    lines.push('이상한사탕 +1');
    return lines;
  }

  function handleBattleComplete(payload) {
    const config = state.run?.config;
    const playerId = state.run?.playerId || core().state.activePlayerId;
    if (!config) return false;
    core().healPlayerTeam(playerId);
    state.run = null;
    if (payload.winnerId === playerId) {
      const progress = getProgress(playerId);
      progress.usedAtBattleCount = currentBattleCount(playerId);
      const lines = grantDungeonRewards(playerId, config);
      window.setTimeout(() => {
        core().returnToLobby();
        POKEBATTLE.ui.renderAll();
        POKEBATTLE.ui.openRewardModal({ title: `${config.name} 클리어 보상`, lines });
      }, 700);
    } else {
      window.setTimeout(() => {
        core().returnToLobby();
        POKEBATTLE.ui.renderAll();
        POKEBATTLE.ui.showToast('던전에서 패배했다. 승리할 때까지 계속 다시 도전할 수 있다.');
      }, 700);
    }
    return true;
  }

  function startSelectedDungeon() {
    const config = chooseDungeonConfig();
    const activePlayerId = core().state.activePlayerId || 'p1';
    const availability = availabilityFor(config, activePlayerId);
    if (!availability.open) {
      POKEBATTLE.ui.showToast(availability.reason);
      return false;
    }
    const progress = getProgress(activePlayerId);
    progress.attemptedAtBattleCount = currentBattleCount(activePlayerId);
    const player = core().getPlayer(activePlayerId);
    const enemyTeam = makeEnemyTeam(config, activePlayerId);
    if (!player?.squad?.length || enemyTeam.some((pokemon) => !pokemon)) {
      POKEBATTLE.ui.showToast('던전 입장 준비에 실패했습니다.');
      return false;
    }
    core().healPlayerTeam(player);
    state.run = { config, playerId: activePlayerId };
    return POKEBATTLE.battleEngine.startBattle({
      playerId: activePlayerId,
      opponentId: `${config.id}_boss`,
      opponentName: config.name,
      playerName: player.name,
      playerTeam: player.squad,
      opponentTeam: enemyTeam,
      mode: 'dungeon',
      theme: config.theme,
      specialBgm: config.id === 'route201' ? 'enter_darkrai.mp3' : null,
      skipLevelReward: true,
      onComplete: handleBattleComplete
    });
  }

  function renderHelper() { return ''; }

  function renderCard(config, playerId) {
    const selected = state.selectedId === config.id;
    const availability = availabilityFor(config, playerId);
    const bossLine = config.id === 'route201'
      ? `보스: <span style="color:#ff9c43;font-weight:800;">${config.boss}</span>`
      : `보스: <span style="color:#ff9c43;font-weight:800;">${config.boss}</span>`;
    return `<button type="button" class="placeholder-card dungeon-card ${selected ? 'selected' : ''}" data-dungeon-select="${config.id}">
      <div class="item-title-row"><h3>${config.name}</h3><span class="mini-badge">난이도 ${config.difficulty}</span></div>
      <p>${bossLine}</p>
      <p style="color:${availability.open ? '#8df0b8' : '#ffb4aa'};">${config.description}</p><p style="color:#b7c5da;">보상: 알 2개${config.id === 'distortion' ? ' · 낮은 확률 거대알' : ''}</p>
    </button>`;
  }

  function renderCategory() {
    const activePlayerId = core().state.activePlayerId || 'p1';
    const config = chooseDungeonConfig();
    const availability = availabilityFor(config, activePlayerId);
    return `
      <section class="panel-card">
        <div class="section-title-row">
          <div>
            <h1 class="section-title" style="font-size:1.22em;">🌋 ${tr('던전','Dungeon')}</h1>
            <p class="section-caption" style="font-size:1.08em;">${tr('랜덤 적 1마리와 보스를 쓰러뜨리면 알 보상을 얻습니다.','Defeat one random foe and one boss to earn egg rewards.')}</p>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button type="button" class="chip-btn" data-dungeon-start="1" style="color:#ff9c43;font-weight:800;">${tr('던전 입장','Enter Dungeon')}</button>
            <button type="button" class="chip-btn" data-dungeon-auto="1" style="color:#9fd8ff;font-weight:800;">${tr('자동 클리어','Auto Clear')}</button>
          </div>
        </div>
        <div class="summary-grid">
          <div class="summary-card"><div class="summary-label">${tr('현재 누적 리그 배틀','League Battles')}</div><div class="summary-value">${currentBattleCount(activePlayerId)}회</div></div>
          <div class="summary-card"><div class="summary-label">${tr('현재 선택','Selected')}</div><div class="summary-value">${config.name} · ${availability.open ? tr('도전 가능','Open') : tr('잠김','Locked')}</div></div>
          <div class="summary-card"><div class="summary-label">${tr('자동던전권','Auto Tickets')}</div><div class="summary-value">${core().getPlayer(activePlayerId)?.bag?.consumables?.find((item)=>String(item.id)==='auto_dungeon_ticket')?.amount || 0}장</div></div>
        </div>
        <div class="subsection"><div class="subheading"><h3>${tr('던전 목록','Dungeon List')}</h3><span>${tr('각 던전의 조건과 보스를 확인하세요.','Check the boss and conditions for each dungeon.')}</span></div><div class="placeholder-stack">${Object.values(DUNGEONS).map((entry) => renderCard(entry, activePlayerId)).join('')}</div></div>
        <div class="subsection"><div class="subheading"><h3>${tr('도전 조건 / 초기화','Conditions / Reset')}</h3><span>${tr('시즌 초기화와 보상 정보','Season reset info')}</span></div><div class="placeholder-stack"><div class="placeholder-card"><p>${tr('새 시즌이 시작되면 던전 해금용 누적 리그 배틀 수가 초기화됩니다. 보상 알은 아이템 화면에서 부화할 수 있습니다. 깨어진 세계에서는 낮은 확률로 거대알이 나옵니다.','When a new season starts, dungeon unlock battle counts reset. Reward eggs can be hatched from the Items screen, and Distortion World has a low chance to grant a giant egg.')}</p></div></div></div>
        ${renderHelper(activePlayerId)}
      </section>`;
  }


  function autoClearSelectedDungeon() {
    const config = chooseDungeonConfig();
    const activePlayerId = core().state.activePlayerId || 'p1';
    const availability = availabilityFor(config, activePlayerId);
    if (!availability.open) {
      POKEBATTLE.ui.showToast(availability.reason);
      return false;
    }
    const consumed = core().consumeBagItem?.(activePlayerId, 'auto_dungeon_ticket', 1);
    if (!consumed) {
      POKEBATTLE.ui.showToast('자동던전이용권이 부족합니다.');
      return false;
    }
    const progress = getProgress(activePlayerId);
    progress.usedAtBattleCount = currentBattleCount(activePlayerId);
    const lines = grantDungeonRewards(activePlayerId, config);
    core().returnToLobby();
    POKEBATTLE.ui.renderAll();
    POKEBATTLE.ui.openRewardModal({ title: `${config.name} 자동 클리어`, lines });
    return true;
  }

  function bindCategory(root) {
    root.querySelectorAll('[data-dungeon-select]').forEach((button) => {
      button.addEventListener('click', () => {
        state.selectedId = button.dataset.dungeonSelect;
        POKEBATTLE.ui.renderAll();
      });
    });
    root.querySelectorAll('[data-dungeon-start]').forEach((button) => {
      button.addEventListener('click', () => { POKEBATTLE.ui?.playUiSound?.('dungeonbutton'); startSelectedDungeon(); });
    });
    root.querySelectorAll('[data-dungeon-auto]').forEach((button) => {
      button.addEventListener('click', () => { POKEBATTLE.ui?.playUiSound?.('dungeonbutton'); autoClearSelectedDungeon(); });
    });
    root.querySelectorAll('[data-dismiss-helper]').forEach((button) => {
      button.addEventListener('click', () => {
        core().markHelperSeen(button.dataset.dismissHelper);
        POKEBATTLE.ui.renderAll();
      });
    });
  }

  POKEBATTLE.dungeon = {
    version: 'stage-3-dungeon-eggs',
    ready: true,
    state,
    DUNGEONS,
    renderCategory,
    bindCategory,
    startSelectedDungeon,
    autoClearSelectedDungeon,
    availabilityFor
  };
})();
