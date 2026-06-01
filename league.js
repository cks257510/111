(function () {
  'use strict';

  const POKEBATTLE = window.POKEBATTLE || (window.POKEBATTLE = {});

  const TRAINERS = {
    p1: { id: 'p1', name: '레드', color: '#ff6b6b' },
    p2: { id: 'p2', name: '그린', color: '#68d391' },
    kid: { id: 'kid', name: '반바지꼬마' },
    elite: { id: 'elite', name: '엘리트트레이너' },
    fan: { id: 'fan', name: '애호가클럽' },
    backpacker: { id: 'backpacker', name: '백팩커' },
    ash: { id: 'ash', name: '노간주' },
    taehong: { id: 'taehong', name: '태홍' },
    cynthia: { id: 'cynthia', name: '난천' },
    lance: { id: 'lance', name: '목호' }
  };

  const MAX_SEASONS = 20;

  const state = {
    ready: true,
    initialized: false,
    mode: 'single',
    season: 1,
    stage: 'super',
    standings: {},
    npcCache: {},
    superBattles: [],
    matchGroups: [],
    championBattles: [],
    championParticipants: [],
    pokemonStats: {},
    currentViewMatch: 1,
    championNoticeShown: false,
    seasonMvp: [],
    championRoundKey: 'round1',
    superParticipants: [],
    carryoverAiBySeason: {}
  };

  function isHuman(id) {
    return state.mode === 'duo' ? (id === 'p1' || id === 'p2') : id === 'p1';
  }

  function currentLanguage() {
    return POKEBATTLE.core?.state?.settings?.language === 'en' ? 'en' : 'ko';
  }

  function tr(ko, en) {
    return currentLanguage() === 'en' ? en : ko;
  }

  function trainerLabel(id) {
    const trainer = TRAINERS[id] || { name: id };
    const color = trainer.color ? ` style="color:${trainer.color};font-weight:800;"` : '';
    return `<span${color}>${trainer.name}</span>`;
  }

  function ensureStanding(id) {
    if (!state.standings[id]) state.standings[id] = { id, name: TRAINERS[id]?.name || id, wins: 0, losses: 0, played: 0, points: 0 };
    return state.standings[id];
  }

  function resetStandings(ids) {
    state.standings = {};
    ids.forEach((id) => ensureStanding(id));
  }

  function shuffle(list) {
    const cloned = list.slice();
    for (let i = cloned.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
    }
    return cloned;
  }

  function getChampionAiPool() {
    return ['ash', 'taehong', 'cynthia', 'lance'];
  }

  function getCarryoverAiForSeason(season) {
    const stored = state.carryoverAiBySeason?.[season] || POKEBATTLE.core?.state?.leagueCarryoverAiBySeason?.[season] || [];
    const aiPool = getChampionAiPool();
    const unique = Array.from(new Set((stored || []).filter((id) => aiPool.includes(id))));
    if (unique.length >= 2) return unique.slice(0, 2);
    const fill = shuffle(aiPool.filter((id) => !unique.includes(id))).slice(0, 2 - unique.length);
    return [...unique, ...fill];
  }

  function getSuperLeagueParticipants() {
    if (state.season <= 1) return ['p1', 'p2', 'kid', 'elite', 'fan', 'backpacker'];
    const carryover = getCarryoverAiForSeason(state.season);
    return ['p1', 'p2', ...carryover];
  }

  function pairingIncludes(ids, a, b) {
    return ids.some((battle) => (battle.homeId === a && battle.awayId === b) || (battle.homeId === b && battle.awayId === a));
  }


  function rememberCarryoverForSeason(nextSeason, aiIds) {
    state.carryoverAiBySeason = { ...(state.carryoverAiBySeason || {}), [nextSeason]: aiIds.slice(0, 2) };
    if (POKEBATTLE.core?.state) {
      POKEBATTLE.core.state.leagueCarryoverAiBySeason = { ...(POKEBATTLE.core.state.leagueCarryoverAiBySeason || {}), [nextSeason]: aiIds.slice(0, 2) };
    }
  }

  function buildRoundRobin(ids) {
    const rotated = shuffle(ids);
    const rounds = [];
    const totalRounds = rotated.length - 1;
    for (let round = 0; round < totalRounds; round += 1) {
      const pairings = [];
      for (let i = 0; i < rotated.length / 2; i += 1) {
        const home = rotated[i];
        const away = rotated[rotated.length - 1 - i];
        pairings.push({ homeId: round % 2 === 0 ? home : away, awayId: round % 2 === 0 ? away : home });
      }
      rounds.push(pairings);
      const fixed = rotated[0];
      const rest = rotated.slice(1);
      rest.unshift(rest.pop());
      rotated.splice(0, rotated.length, fixed, ...rest);
    }
    return rounds;
  }

  function buildSuperLeagueSchedule() {
    const ids = getSuperLeagueParticipants();
    state.superParticipants = ids.slice();
    resetStandings(ids);
    let rounds = buildRoundRobin(ids);
    if (state.season <= 1 && rounds.length > 4) {
      let selected = rounds.slice(0, 4);
      if (state.mode === 'duo' && !selected.some((pairings) => pairingIncludes(pairings, 'p1', 'p2'))) {
        const rgRound = rounds.find((pairings) => pairingIncludes(pairings, 'p1', 'p2'));
        if (rgRound) selected[selected.length - 1] = rgRound;
      }
      rounds = selected;
    }
    const all = [];
    rounds.forEach((pairings, roundIdx) => {
      pairings.forEach((battle, battleIdx) => {
        all.push({
          ...battle,
          id: `MATCH${roundIdx + 1}-B${battleIdx + 1}`,
          matchNo: roundIdx + 1,
          battleNo: battleIdx + 1,
          label: `battle ${battleIdx + 1}`,
          done: false,
          stage: 'super'
        });
      });
    });
    state.superBattles = all;
    state.matchGroups = rounds.map((_, idx) => ({ matchNo: idx + 1, id: `MATCH ${idx + 1}`, battles: all.filter((battle) => battle.matchNo === idx + 1) }));
    state.currentViewMatch = 1;
  }

  function initialize(mode) {
    state.mode = mode === 'duo' ? 'duo' : 'single';
    state.season = Number(POKEBATTLE.core?.state?.season || 1);
    state.stage = 'super';
    state.npcCache = state.npcCache || {};
    state.superBattles = [];
    state.matchGroups = [];
    state.championBattles = [];
    state.championParticipants = [];
    state.pokemonStats = {};
    state.currentViewMatch = 1;
    state.championNoticeShown = false;
    state.championRoundKey = 'round1';
    state.carryoverAiBySeason = { ...(POKEBATTLE.core?.state?.leagueCarryoverAiBySeason || state.carryoverAiBySeason || {}) };
    state.initialized = true;
    buildSuperLeagueSchedule();
    syncNpcLevels();
  }

  function getSortedStandings(ids = null) {
    const rows = Object.values(state.standings).filter((row) => !ids || ids.includes(row.id));
    return rows.sort((a, b) => b.points - a.points || b.wins - a.wins || a.losses - b.losses || a.name.localeCompare(b.name, 'ko'));
  }

  function getNextBattleForPlayer(playerId) {
    const list = state.stage === 'super' ? state.superBattles : state.championBattles;
    return list.find((battle) => !battle.done && (battle.homeId === playerId || battle.awayId === playerId));
  }

  function safeFindByName(name) {
    const core = POKEBATTLE.core;
    return core.state.allPokemon.find((pokemon) => pokemon.nameKo === name) || null;
  }

  function getChampionLegendaryPool() {
    const all = POKEBATTLE.core?.state?.allPokemon || [];
    return all.filter((pokemon) => pokemon && !pokemon.isMegaEvolution && POKEBATTLE.core?.shouldExcludeLegend?.(pokemon));
  }

  function championTeams(trainerId) {
    const mapping = {
      ash: ['볼카모스', '버프론', '배바닐라'],
      taehong: ['포푸니라', '갸라도스', '크로뱃'],
      cynthia: ['화강돌', '밀로틱', '한카리아스'],
      lance: ['리자몽', '파비코리', '망나뇽']
    };
    const fixed = mapping[trainerId] || [];
    if (Number(state.season || 1) <= 1) return fixed;
    const keepers = fixed.slice(0, 2).filter((name) => safeFindByName(name));
    const legendaryPool = shuffle(getChampionLegendaryPool().map((pokemon) => pokemon.nameKo));
    const randomLegend = legendaryPool.find((name) => !keepers.includes(name));
    return [...keepers, randomLegend].filter(Boolean).slice(0, 3);
  }


  function isTrueUnevolvedBase(base) {
    if (!base || base.isMegaEvolution) return false;
    if (POKEBATTLE.core?.shouldExcludeLegend?.(base)) return false;
    const all = POKEBATTLE.core?.state?.allPokemon || [];
    const hasPrev = all.some((candidate) => Number(candidate?.evolution?.nextEvoId) === Number(base?.id));
    const canEvolve = Boolean(base?.evolution?.nextEvoId);
    return !hasPrev && canEvolve;
  }

  function getSuperLeagueUnevolvedPool() {
    const core = POKEBATTLE.core;
    return shuffle((core?.state?.allPokemon || []).filter((pokemon) => isTrueUnevolvedBase(pokemon)));
  }

  function ensureThreeNames(names) {
    const pool = getSuperLeagueUnevolvedPool().map((p) => p.nameKo);
    const unique = [];
    for (const name of (names || [])) {
      if (name && !unique.includes(name)) unique.push(name);
    }
    for (const name of pool) {
      if (unique.length >= 3) break;
      if (!unique.includes(name)) unique.push(name);
    }
    return unique.slice(0, 3);
  }

  function buildNpcNames(trainerId) {
    const core = POKEBATTLE.core;
    if (state.stage === 'champion' && ['ash', 'taehong', 'cynthia', 'lance'].includes(trainerId)) {
      return ensureThreeNames(championTeams(trainerId).filter((name) => safeFindByName(name)));
    }
    const pool = getSuperLeagueUnevolvedPool();
    if (trainerId === 'p2' && state.mode !== 'duo' && state.stage === 'super') {
      const starterNames = ['이상해씨','파이리','꼬부기','나무지기','아차모','물짱이','모부기','불꽃숭이','팽도리'];
      const starterPool = shuffle(starterNames.filter((name) => safeFindByName(name)));
      const chosenStarter = starterPool[0] || '피카츄';
      const pool = getSuperLeagueUnevolvedPool().map((p) => p.nameKo).filter((name) => name !== chosenStarter);
      return ensureThreeNames([chosenStarter, ...pool.slice(0, 2)]);
    }
    return ensureThreeNames(pool.slice(0, 3).map((p) => p.nameKo));
  }

  function ensureNpcSquad(trainerId) {
    const core = POKEBATTLE.core;
    if (trainerId === 'p1') return core.getPlayer(trainerId);
    if (trainerId === 'p2' && state.mode === 'duo') return core.getPlayer(trainerId);
    const cached = state.npcCache[trainerId];
    const needsRefresh = !cached
      || cached._stageBuilt !== state.stage
      || Number(cached._seasonBuilt || 0) !== Number(state.season || 1)
      || !Array.isArray(cached.squad)
      || cached.squad.length < 3
      ;
    if (!needsRefresh) return cached;
    const npc = cached || { id: trainerId, name: TRAINERS[trainerId]?.name || trainerId, squad: [], reserve: [], bag: { consumables: [] } };
    const names = buildNpcNames(trainerId);
    npc.squad = names.map((name) => safeFindByName(name)).filter(Boolean).slice(0, 3).map((base) => {
      const mon = core.createRuntimePokemon(base, 5);
      mon.preventEvolution = false;
      return mon;
    });
    while (npc.squad.length < 3) {
      const fillBase = getSuperLeagueUnevolvedPool().find((candidate) => !npc.squad.some((mon) => mon?.base?.nameKo === candidate.nameKo));
      if (!fillBase) break;
      const mon = core.createRuntimePokemon(fillBase, 5);
      mon.preventEvolution = false;
      npc.squad.push(mon);
    }
    const holdables = core.getHoldableCatalog ? core.getHoldableCatalog() : [];
    npc.bag = npc.bag || { consumables: [] };
    npc.bag.consumables = (state.stage === 'champion')
      ? [{ id: 'good_potion', nameKo: '좋은상처약', amount: 1, category: '소비아이템', description: 'HP를 60 회복한다.' }]
      : [];
    npc.squad.forEach((mon) => { mon.heldItems = []; mon.heldItem = null; });
    if (holdables.length && npc.squad.length && Math.random() < 0.6) {
      const holder = npc.squad[Math.floor(Math.random() * npc.squad.length)];
      const item = holdables[Math.floor(Math.random() * holdables.length)];
      holder.heldItems = item ? [{ ...item }] : [];
      holder.heldItem = item ? { ...item } : null;
    }
    npc._stageBuilt = state.stage;
    npc._seasonBuilt = state.season;
    if (trainerId === 'p2' && state.mode !== 'duo' && state.stage === 'super') {
      const corePlayerP2 = POKEBATTLE.core?.getPlayer?.('p2');
      if (corePlayerP2) {
        corePlayerP2.squad = npc.squad.map((mon) => POKEBATTLE.core.cloneRuntimePokemonForBattle ? POKEBATTLE.core.cloneRuntimePokemonForBattle(mon) : JSON.parse(JSON.stringify(mon)));
        corePlayerP2.reserve = [];
        corePlayerP2.bag = JSON.parse(JSON.stringify(npc.bag || { consumables: [] }));
      }
    }
    state.npcCache[trainerId] = npc;
    return npc;
  }

  function getPlayerOrNpc(id) {
    if (id === 'p1') return POKEBATTLE.core.getPlayer(id);
    if (id === 'p2') return state.mode === 'duo' ? POKEBATTLE.core.getPlayer(id) : ensureNpcSquad(id);
    return ensureNpcSquad(id);
  }

  function getReferencePlayerLevel(playerId) {
    const player = getPlayerOrNpc(playerId);
    const squad = player?.squad || [];
    if (!squad.length) return 5;
    return Math.max(5, Math.round(squad.reduce((sum, pokemon) => sum + (pokemon.level || 5), 0) / squad.length));
  }

  function prepareBattleTeams(playerId, opponentId, stage) {
    const core = POKEBATTLE.core;
    const player = getPlayerOrNpc(playerId);
    let opponent = getPlayerOrNpc(opponentId);
    if (opponentId === 'p2' && state.mode !== 'duo' && (opponent?.squad?.length || 0) < 3) {
      delete state.npcCache.p2;
      opponent = ensureNpcSquad('p2');
    }
    core.healPlayerTeam(player);
    core.healPlayerTeam(opponent);
    const refLevel = getReferencePlayerLevel(playerId);
    const targetEnemyLevel = Math.min(200, refLevel);
    if (!isHuman(opponentId)) core.setPlayerTeamLevel(opponent, targetEnemyLevel);
    if (!isHuman(playerId)) core.setPlayerTeamLevel(player, targetEnemyLevel);
    core.healPlayerTeam(player);
    core.healPlayerTeam(opponent);
  }

  function battleLabel(battle) {
    return `${trainerLabel(battle.homeId)} VS ${trainerLabel(battle.awayId)}`;
  }

  function renderBattleRow(battle) {
    return `<div style="padding:10px 12px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);">
      <div style="font-weight:800;margin-bottom:4px;">${currentLanguage() === 'en' ? 'Battle' : '경기'} ${battle.battleNo || 1}</div>
      <div>${battleLabel(battle)}</div>
      <div style="margin-top:4px;color:#9fb0c7;">${battle.done ? (currentLanguage() === 'en' ? `Done · Winner ${TRAINERS[battle.winnerId]?.name || battle.winnerId}` : `완료 · 승자 ${TRAINERS[battle.winnerId]?.name || battle.winnerId}`) : tr('대기 중','Waiting')}</div>
    </div>`;
  }

  function renderScheduleSection() {
    const group = state.matchGroups.find((entry) => entry.matchNo === state.currentViewMatch) || state.matchGroups[0];
    return `<div class="placeholder-card ${group?.battles.every((battle) => battle.done) ? 'league-done' : ''}">
      <div class="type-chart-header">
        <button type="button" class="chip-btn" data-league-nav="prev">◀</button>
        <h3 style="margin:0;">${group ? (group.battles?.[0]?.stage === 'champion' ? (group.matchNo === 1 ? tr('리그 일정 8강전','League Schedule Quarterfinals') : group.matchNo === 2 ? tr('리그 일정 4강전','League Schedule Semifinals') : tr('리그 일정 결승전','League Schedule Final')) : `${tr('리그 일정','League Schedule')} MATCH ${group.matchNo}`) : 'MATCH 1'}</h3>
        <button type="button" class="chip-btn" data-league-nav="next">▶</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px;">${(group?.battles || []).map(renderBattleRow).join('')}</div>
    </div>`;
  }

  function renderTrainerStandings() {
    const ids = state.stage === 'super' ? (state.superParticipants || []) : state.championParticipants;
    return getSortedStandings(ids).map((row, idx) => `<div class="placeholder-card"><h3>${idx + 1}위 · ${trainerLabel(row.id)}</h3><p>${row.wins}승 ${row.losses}패 · ${row.points}점</p></div>`).join('');
  }

  function renderPokemonRankings() {
    const rows = Object.values(state.pokemonStats);
    const sections = [
      { title: 'KO 순위', rows: rows.slice().sort((a, b) => b.kos - a.kos).slice(0, 3), key: 'kos', suffix: 'KO' },
      { title: '데미지 입힌 순위', rows: rows.slice().sort((a, b) => b.damageDealt - a.damageDealt).slice(0, 3), key: 'damageDealt', suffix: '데미지' },
      { title: '죽지 않고 받아낸 데미지 순위', rows: rows.filter((row) => row.deaths === 0).sort((a, b) => b.damageTaken - a.damageTaken).slice(0, 3), key: 'damageTaken', suffix: '데미지' }
    ];
    return sections.map((section) => `<div class="placeholder-card"><h3>${section.title}</h3>${section.rows.length ? section.rows.map((row, idx) => `<p>${idx + 1}. ${row.pokemonName} · ${row.ownerName} · ${row[section.key]} ${section.suffix}</p>`).join('') : '<p>아직 데이터가 없습니다.</p>'}</div>`).join('');
  }


  function allSuperBattlesDone() {
    return state.superBattles.length > 0 && state.superBattles.every((battle) => battle.done);
  }

  function buildChampionBracket() {
    const qualifiers = getSortedStandings(state.superParticipants || ['p1', 'p2']).slice(0, 2).map((row) => row.id);
    state.championParticipants = [...qualifiers, 'ash', 'taehong', 'cynthia', 'lance'];
    state.stage = 'champion';
    resetStandings(state.championParticipants);
    const seeds = shuffle([...state.championParticipants]);
    const battles = [
      { homeId: seeds[0], awayId: seeds[5], id: 'CH-R1-B1', matchNo: 1, battleNo: 1, label: '1라운드 1경기', done: false, stage: 'champion', roundKey: 'round1' },
      { homeId: seeds[1], awayId: seeds[4], id: 'CH-R1-B2', matchNo: 1, battleNo: 2, label: '1라운드 2경기', done: false, stage: 'champion', roundKey: 'round1' },
      { homeId: seeds[2], awayId: seeds[3], id: 'CH-R1-B3', matchNo: 1, battleNo: 3, label: '1라운드 3경기', done: false, stage: 'champion', roundKey: 'round1' }
    ];
    state.championRoundKey = 'round1';
    state.championBattles = battles;
    state.matchGroups = [{ matchNo: 1, id: '챔피언 토너먼트 1라운드', battles }];
    state.currentViewMatch = 1;
  }

  function maybeBuildChampionBracket() {
    if (state.stage !== 'super' || !allSuperBattlesDone()) return;
    buildChampionBracket();
  }

  function championRoundBattles(roundKey) {
    return state.championBattles.filter((battle) => battle.roundKey === roundKey);
  }

  function chooseByeWinner(winners) {
    const nonHuman = winners.filter((id) => !isHuman(id));
    if (nonHuman.length) return nonHuman[Math.floor(Math.random() * nonHuman.length)];
    const qualifiedSuper = state.championParticipants.slice(0, 2).filter((id) => !isHuman(id));
    return winners.find((id) => qualifiedSuper.includes(id)) || winners[Math.floor(Math.random() * winners.length)];
  }

  function maybeAdvanceChampionBracket() {
    if (state.stage !== 'champion') return;
    const roundBattles = championRoundBattles(state.championRoundKey);
    if (!roundBattles.length || !roundBattles.every((battle) => battle.done)) return;

    if (state.championRoundKey === 'round1') {
      const winners = roundBattles.map((battle) => battle.winnerId).filter(Boolean);
      const bye = chooseByeWinner(winners);
      const remaining = winners.filter((id) => id !== bye);
      const battle = { homeId: remaining[0], awayId: remaining[1], id: 'CH-SF-B1', matchNo: 2, battleNo: 1, label: '준결승', done: false, stage: 'champion', roundKey: 'semi', byeToFinal: bye };
      state.championBattles.push(battle);
      state.matchGroups = [
        { matchNo: 1, id: '챔피언 토너먼트 1라운드', battles: championRoundBattles('round1') },
        { matchNo: 2, id: `준결승 · ${TRAINERS[bye]?.name || bye} 부전승`, battles: [battle] }
      ];
      state.currentViewMatch = 2;
      state.championRoundKey = 'semi';
      return;
    }

    if (state.championRoundKey === 'semi') {
      const semi = roundBattles[0];
      const battle = { homeId: semi.byeToFinal, awayId: semi.winnerId, id: 'CH-FINAL-B1', matchNo: 3, battleNo: 1, label: '결승', done: false, stage: 'champion', roundKey: 'final' };
      state.championBattles.push(battle);
      state.matchGroups = [
        { matchNo: 1, id: '챔피언 토너먼트 1라운드', battles: championRoundBattles('round1') },
        { matchNo: 2, id: `준결승 · ${TRAINERS[semi.byeToFinal]?.name || semi.byeToFinal} 부전승`, battles: championRoundBattles('semi') },
        { matchNo: 3, id: '결승', battles: [battle] }
      ];
      state.currentViewMatch = 3;
      state.championRoundKey = 'final';
      return;
    }

    if (state.championRoundKey === 'final') {
      const finalBattle = roundBattles[0];
      state.seasonMvp = Object.values(state.pokemonStats).sort((a, b) => (b.kos * 100 + b.damageDealt) - (a.kos * 100 + a.damageDealt)).slice(0, 3);
      const championSeason = state.season;
      const championName = TRAINERS[finalBattle.winnerId]?.name || finalBattle.winnerId;
      const mvpRows = state.seasonMvp.map((row, idx) => ({ label: `MVP ${idx + 1}`, value: `${row.pokemonName} · ${row.ownerName}` }));
      const hallPayload = {
        season: championSeason,
        championName,
        stats: [
          { label: '챔피언', value: championName },
          ...mvpRows
        ],
        onClose: () => { POKEBATTLE.core?.returnToLobby?.(); POKEBATTLE.ui?.renderAll?.(); }
      };
      if (state.season < MAX_SEASONS) {
        const currentSeason = state.season;
        const aiPool = getChampionAiPool();
        const finalists = [finalBattle.homeId, finalBattle.awayId];
        const nonFinalAi = shuffle(aiPool.filter((id) => !finalists.includes(id)));
        const nextSeasonAi = nonFinalAi.slice(0, 2);
        rememberCarryoverForSeason(currentSeason + 1, nextSeasonAi);
        state.season += 1;
        if (POKEBATTLE.core?.state) {
          POKEBATTLE.core.state.season = state.season;
          POKEBATTLE.core.state.players.p1.seasonLabel = `시즌 ${state.season}`;
          POKEBATTLE.core.state.players.p2.seasonLabel = `시즌 ${state.season}`;
          POKEBATTLE.core.ensureSeasonStarterEggPool?.(state.season);
        }
        resetSeasonProgress();
        state.stage = 'super';
        state.superBattles = [];
        state.matchGroups = [];
        state.championBattles = [];
        state.championParticipants = [];
        state.pokemonStats = {};
        state.superParticipants = [];
        buildSuperLeagueSchedule();
        syncNpcLevels();
        hallPayload.subline = `시즌 ${championSeason} 우승`;
        hallPayload.footer = `다음 시즌 ${state.season} 시작`;
      } else {
        hallPayload.subline = `시즌 ${championSeason} 우승`;
        hallPayload.footer = `시즌 ${MAX_SEASONS} 완료`;
      }
      POKEBATTLE.ui?.openHallOfFameModal?.(hallPayload);
    }
  }

  function renderCategory() {
    if (!state.initialized) initialize(POKEBATTLE.core?.state?.gameMode || 'single');
    const activeId = POKEBATTLE.core?.state?.activePlayerId || 'p1';
    const nextBattle = getNextBattleForPlayer(activeId);
    const helper = '';
    return `
      <section class="panel-card">
        <div class="section-title-row">
          <div>
            <h1 class="section-title" style="font-size:1.22em;">🏆 ${tr('리그','League')}</h1>
            <p class="section-caption" style="font-size:1.08em;">${tr('던전 클리어 후 경기 시작, 슈퍼리그 4경기 후 1위와 2위는 챔피언리그 참가 챔피언리그 트레이너: 노간주, 난천, 태홍, 목호','Start battles after clearing dungeons. After 4 Super League matches, 1st and 2nd place enter the Champion League. Champion trainers: Alder, Cynthia, Taehong, Lance')}</p>
          </div>
          <button type="button" class="chip-btn" data-league-start="1" style="color:#ff9c43;font-weight:800;">${tr('MATCH 시작','Start MATCH')}</button>
        </div>
        <div class="summary-grid">
          <div class="summary-card"><div class="summary-label">${tr('현재 시즌','Season')}</div><div class="summary-value">${currentLanguage() === 'en' ? `Season ${state.season}` : `시즌 ${state.season}`} · ${state.stage === 'super' ? tr('슈퍼리그','Super League') : tr('챔피언 리그','Champion League')}</div></div>
          <div class="summary-card"><div class="summary-label">${tr('다음 경기','Next Battle')}</div><div class="summary-value">${nextBattle ? battleLabel(nextBattle) : tr('진행 가능한 경기가 없음','No battle available')}</div></div>
        </div>
        <div class="subsection"><div class="subheading"><h3>${tr('리그 일정','League Schedule')}</h3><span>${tr('좌우 버튼으로 MATCH 이동','Move between MATCHes with arrows')}</span></div><div class="placeholder-stack">${renderScheduleSection()}</div></div>
        <div class="subsection"><div class="subheading"><h3>${tr('트레이너 순위','Trainer Standings')}</h3><span>${tr('승, 패, 점수','Wins, losses, points')}</span></div><div class="placeholder-stack">${renderTrainerStandings()}</div></div>
        <div class="subsection"><div class="subheading"><h3>${tr('포켓몬 순위','Pokémon Rankings')}</h3><span>${tr('Top 3만 표시','Top 3 only')}</span></div><div class="placeholder-stack">${renderPokemonRankings()}</div></div>
        ${helper}
      </section>`;
  }

  function navMatch(dir) {
    const max = Math.max(1, state.matchGroups.length);
    if (dir === 'prev') state.currentViewMatch = state.currentViewMatch <= 1 ? max : state.currentViewMatch - 1;
    else state.currentViewMatch = state.currentViewMatch >= max ? 1 : state.currentViewMatch + 1;
  }

  function scoreNpcTeam(team) {
    const core = POKEBATTLE.core;
    let bestRank = -1;
    let boostedUid = null;
    team.forEach((p) => {
      const primaryHeld = Array.isArray(p.heldItems) && p.heldItems.length ? p.heldItems[0] : p.heldItem;
      const rank = Number(primaryHeld?.rank || core.state.itemsById.get(core.normalizeItemId(primaryHeld?.id))?.rank || 0);
      if (rank > bestRank) { bestRank = rank; boostedUid = p.uid; }
    });
    return team.reduce((sum, p) => sum + (p.level || 0) * 4 + (p.stats?.attack || 0) + (p.stats?.spAttack || 0) + (p.stats?.defense || 0) + (p.stats?.spDefense || 0) + (p.stats?.speed || 0) + (p.uid === boostedUid ? 18 : 0), 0);
  }

  function autoResolveAiBattle(battle) {
    const home = getPlayerOrNpc(battle.homeId);
    const away = getPlayerOrNpc(battle.awayId);
    const winnerId = scoreNpcTeam(home.squad || []) >= scoreNpcTeam(away.squad || []) ? battle.homeId : battle.awayId;
    const loserId = winnerId === battle.homeId ? battle.awayId : battle.homeId;
    recordResult(battle.id, winnerId, loserId, {});
  }

  function maybeResolveRemainingAiBattles(matchNo) {
    state.superBattles.filter((battle) => battle.matchNo === matchNo && !battle.done).forEach((battle) => {
      if (isHuman(battle.homeId) || isHuman(battle.awayId)) return;
      prepareBattleTeams(battle.homeId, battle.awayId, 'super');
      autoResolveAiBattle(battle);
    });
  }

  function applySuperMatchReward(matchNo) {
    const core = POKEBATTLE.core;
    const ids = state.mode === 'duo' ? ['p1', 'p2'] : ['p1'];
    ids.forEach((id) => {
      core.healPlayerTeam(id);
      core.refreshFriendlyShopInventory?.(id);
    });
    syncNpcLevels();
  }

  function syncNpcLevels() {
    const core = POKEBATTLE.core;
    Object.keys(state.npcCache).forEach((trainerId) => {
      const npc = state.npcCache[trainerId];
      const reference = state.mode === 'duo' ? Math.max(getReferencePlayerLevel('p1'), getReferencePlayerLevel('p2')) : getReferencePlayerLevel('p1');
      const target = Math.max(1, Math.min(200, reference));
      core.setPlayerTeamLevel(npc, target);
      core.healPlayerTeam(npc);
    });
  }

  function updatePokemonStats(statsPayload) {
    Object.values(statsPayload || {}).forEach((row) => {
      if (!row || !row.uid) return;
      if (!state.pokemonStats[row.uid]) state.pokemonStats[row.uid] = { uid: row.uid, pokemonName: row.pokemonName, ownerId: row.ownerId, ownerName: row.ownerName, kos: 0, damageDealt: 0, damageTaken: 0, deaths: 0 };
      const target = state.pokemonStats[row.uid];
      target.pokemonName = row.pokemonName;
      target.ownerName = row.ownerName;
      target.kos += row.kos || 0;
      target.damageDealt += row.damageDealt || 0;
      target.damageTaken += row.damageTaken || 0;
      target.deaths += row.deaths || 0;
    });
  }

  function recordResult(battleId, winnerId, loserId, statsPayload) {
    const battle = [...state.superBattles, ...state.championBattles].find((entry) => entry.id === battleId);
    if (!battle || battle.done) return;
    battle.done = true;
    battle.winnerId = winnerId;
    battle.loserId = loserId;
    updatePokemonStats(statsPayload);
    const winRow = ensureStanding(winnerId);
    const loseRow = ensureStanding(loserId);
    winRow.wins += 1; winRow.played += 1; winRow.points += 3;
    loseRow.losses += 1; loseRow.played += 1;
    if (battle.stage === 'super') {
      maybeResolveRemainingAiBattles(battle.matchNo);
      const group = state.matchGroups.find((entry) => entry.matchNo === battle.matchNo);
      if (group && group.battles.every((entry) => entry.done)) applySuperMatchReward(battle.matchNo);
      maybeBuildChampionBracket();
    } else {
      maybeAdvanceChampionBracket();
    }
    if (battle.stage === 'super' || battle.stage === 'champion') {
      [battle.homeId, battle.awayId].filter((id) => isHuman(id)).forEach((id) => {
        const progress = POKEBATTLE.core?.getDungeonProgress?.(id);
        if (!progress) return;
        progress.leagueBattlesCompleted = Number(progress.leagueBattlesCompleted || 0) + 1;
        progress.attemptedAtBattleCount = null;
        if (Number(progress.leagueBattlesCompleted || 0) % 2 === 0) POKEBATTLE.core?.addConsumable?.(id, 'auto_dungeon_ticket', 1);
      });
      [winnerId, loserId].filter((id) => id === 'p1' || id === 'p2').forEach((id) => {
        const player = POKEBATTLE.core?.getPlayer?.(id);
        if (!player) return;
        player.localCurrentWinStreak = id === winnerId ? Number(player.localCurrentWinStreak || 0) + 1 : 0;
        if (player.localCurrentWinStreak > Number(player.localBestWinStreak || 0)) {
          player.localBestWinStreak = player.localCurrentWinStreak;
          player.localBestSquad = (player.squad || []).map((pokemon) => pokemon.currentName || pokemon.base?.nameKo).slice(0, 3);
        }
      });
    }
  }


  function autoResolvePendingChampionAi(activeId) {
    if (state.stage !== 'champion') return;
    let safety = 12;
    while (safety > 0) {
      safety -= 1;
      const humanNext = getNextBattleForPlayer(activeId);
      if (humanNext) return;
      const pending = state.championBattles.find((battle) => !battle.done);
      if (!pending) return;
      if (isHuman(pending.homeId) || isHuman(pending.awayId)) return;
      prepareBattleTeams(pending.homeId, pending.awayId, pending.stage);
      autoResolveAiBattle(pending);
    }
  }

  function startNextMatch() {
    const activeId = POKEBATTLE.core.state.activePlayerId;
    const dungeonProgress = POKEBATTLE.core?.getDungeonProgress?.(activeId);
    const currentCount = Number(dungeonProgress?.leagueBattlesCompleted || 0);
    if ((activeId === 'p1' || activeId === 'p2') && Number(dungeonProgress?.usedAtBattleCount ?? -1) !== currentCount) {
      POKEBATTLE.ui?.showToast?.('MATCH를 시작하려면 던전을 먼저 클리어해야 합니다.');
      return false;
    }
    maybeBuildChampionBracket();
    autoResolvePendingChampionAi(activeId);
    const next = getNextBattleForPlayer(activeId);
    if (!next) {
      autoResolvePendingChampionAi(activeId);
      const retry = getNextBattleForPlayer(activeId);
      if (!retry) return false;
      let playerIdRetry = retry.homeId;
      let opponentIdRetry = retry.awayId;
      if (activeId === retry.awayId) { playerIdRetry = retry.awayId; opponentIdRetry = retry.homeId; }
      prepareBattleTeams(playerIdRetry, opponentIdRetry, retry.stage);
      return POKEBATTLE.battleEngine.startBattle({
        playerId: playerIdRetry,
        opponentId: opponentIdRetry,
        mode: 'league',
        leagueMatchId: retry.matchNo || null,
        leagueBattleId: retry.id,
        leagueStage: retry.stage
      });
    }
    let playerId = next.homeId;
    let opponentId = next.awayId;
    if (activeId === next.awayId) { playerId = next.awayId; opponentId = next.homeId; }
    prepareBattleTeams(playerId, opponentId, next.stage);
    const trainerIntroSrc = ({ kid:'trainer-extra/ggoma.mp4', backpacker:'trainer-extra/backpack.mp4', fan:'trainer-extra/clubpoke.mp4', elite:'trainer-extra/elitesprite.mp4', p2:'trainer-extra/greensprite.mp4', cynthia:'trainer-extra/nancheon.gif', taehong:'trainer-extra/taehongsprite.gif', lance:'trainer-extra/mokhov.mp4', ash:'trainer-extra/noganjoo.mp4' })[opponentId] || null;
    const specialBgm = ({ cynthia:'cynthia.mp3', taehong:'team_galactic.mp3', ash:'hgsschampion.mp3', lance:'elite_four.mp3' })[opponentId] || null;
    return POKEBATTLE.battleEngine.startBattle({
      playerId,
      opponentId,
      mode: 'league',
      leagueMatchId: next.matchNo || null,
      leagueBattleId: next.id,
      leagueStage: next.stage,
      trainerIntroSrc,
      specialBgm
    });
  }

  function resetSeasonProgress() {
    POKEBATTLE.core?.resetAllDungeonProgress?.();
  }

  POKEBATTLE.league = {
    version: 'stage-9-league-seasons7',
    ready: true,
    state,
    initialize,
    renderCategory,
    startNextMatch,
    recordResult,
    getPlayerOrNpc,
    getNextBattleForPlayer,
    navMatch,
    isHuman,
    resetSeasonProgress
  };
})();
