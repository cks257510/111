(function () {
  'use strict';

  const POKEBATTLE = window.POKEBATTLE || (window.POKEBATTLE = {});

  const state = {
    active: false,
    playerId: null,
    opponentId: null,
    playerTeam: [],
    opponentTeam: [],
    allyIndex: 0,
    enemyIndex: 0,
    menu: 'root',
    forceSwitch: false,
    forceSwitchSide: null,
    optionalSwitchSide: null,
    showMoveInfo: false,
    pendingBagItem: null,
    pendingBagTargetIndex: null,
    waiting: false,
    uiEffects: [],
    lastConsumedUiEffects: [],
    log: [],
    options: null,
    stats: {},
    turnSide: 'ally',
    pendingActions: { ally: null, enemy: null },
    delayedActionTimer: null,
    actionNonce: 0,
    moveContext: null,
    weather: null,
    weatherTurns: 0,
    battleId: 0,
    enemyStrategicSwitchUsed: false,
    enemyAiMemory: { userUid: null, lastMoveIndex: null, repeatCount: 0 }
  };


  const SKILL_EFFECT_ASSETS = {
    '불꽃':'skill-effects/fire.gif', '물':'skill-effects/water.gif', '풀':'skill-effects/grass.gif', '전기':'skill-effects/elec.gif',
    '고스트':'skill-effects/darkness.gif', '격투':'skill-effects/fist.gif', '독':'skill-effects/poison.gif',
    '드래곤':'skill-effects/dragon.gif', '노말':'skill-effects/normal.gif', '비행':'skill-effects/wing.gif',
    '땅':'skill-effects/sand.gif', '얼음':'skill-effects/ice.gif', '바위':'skill-effects/silla.gif', '악':'skill-effects/darkpulse.gif',
    '에스퍼':'skill-effects/esper.gif', '강철':'skill-effects/steel.gif', '벌레':'skill-effects/insect.gif'
  };

  function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
  function aliveIndex(team) { return team.findIndex((p) => (p?.currentHp || 0) > 0); }
  function hasAlive(team) { return team.some((p) => (p?.currentHp || 0) > 0); }
  function getActive(side) { return side === 'ally' ? state.playerTeam[state.allyIndex] : state.opponentTeam[state.enemyIndex]; }
  function getTeam(side) { return side === 'ally' ? state.playerTeam : state.opponentTeam; }
  function otherSide(side) { return side === 'ally' ? 'enemy' : 'ally'; }
  function currentActorSide() { return state.options?.isDuo ? state.turnSide : 'ally'; }
  function currentActorId() { return currentActorSide() === 'ally' ? state.playerId : state.opponentId; }
  function isOnlinePvpMode() { return String(state.options?.mode || '').includes('online_pvp'); }

  function pushLog(message) {
    state.log.push(String(message || ''));
    state.log = state.log.slice(-12);
  }

  function sleep(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  function clearDelayedActionTimer() {
    if (state.delayedActionTimer) {
      window.clearTimeout(state.delayedActionTimer);
      state.delayedActionTimer = null;
    }
  }

  function invalidatePendingAction() {
    state.actionNonce += 1;
    clearDelayedActionTimer();
  }

  const TURN_TIMING = {
    actionGap: 950,
    endTurnGap: 0,
    postChoiceDelay: 140,
    faintPause: 1850
  };

  function queueEffect(effect) {
    state.uiEffects.push(effect);
  }

  function consumeUiEffects() {
    const out = state.uiEffects.slice();
    state.lastConsumedUiEffects = (state.lastConsumedUiEffects || []).concat(out.map((effect) => ({ ...(effect || {}) }))).slice(-20);
    state.uiEffects.length = 0;
    return out;
  }

  function getHeldItems(pokemon) {
    if (Array.isArray(pokemon?.heldItems) && pokemon.heldItems.length) return pokemon.heldItems.filter(Boolean);
    if (pokemon?.heldItem) return [pokemon.heldItem];
    return [];
  }

  async function waitForFaintAnimationIfNeeded() {
    if (isOnlinePvpMode()) return;
    const allyFainted = Boolean(getActive('ally') && getActive('ally').currentHp <= 0);
    const enemyFainted = Boolean(getActive('enemy') && getActive('enemy').currentHp <= 0);
    if (allyFainted || enemyFainted) await sleep(TURN_TIMING.faintPause);
  }

  function render() { POKEBATTLE.ui?.renderAll?.(); }
  function setMenu(menu) { state.menu = menu; render(); }
  function toggleMoveInfo() { state.showMoveInfo = !state.showMoveInfo; render(); }

  function getTrainerName(id) {
    if (id === state.opponentId && state.options?.opponentName) return state.options.opponentName;
    if (id === state.playerId && state.options?.playerName) return state.options.playerName;
    const p = POKEBATTLE.core?.getPlayer?.(id);
    if (p) return p.name;
    return id === 'p2' ? '그린' : '레드';
  }

  function ensureBattleFields(pokemon, ownerId) {
    if (!pokemon) return;
    pokemon.ownerId = ownerId;
    pokemon.status = null;
    pokemon.statusCounter = 0;
    pokemon.sleepTurns = 0;
    pokemon.statStages = { attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0, accuracy: 0, evasion: 0 };
    pokemon.uiEffectShownCount = 0;
    pokemon.volatile = {
      ...(pokemon.volatile || {}),
      protect: false,
      protectChain: Number(pokemon.volatile?.protectChain || 0),
      leechSeed: false,
      confusionTurns: 0,
      grounded: Boolean(pokemon.volatile?.grounded),
      digging: Boolean(pokemon.volatile?.digging),
      chargeMove: pokemon.volatile?.chargeMove || null,
      chargeMoveData: pokemon.volatile?.chargeMoveData || null
    };
    pokemon.flags = {};
    pokemon.tempBattleBuffs = {};
    pokemon.moves = (pokemon.moves || []).map((m) => ({ ...m, currentPP: m.currentPP ?? m.pp ?? 1, maxPP: m.maxPP ?? m.pp ?? 1 }));
  }

  function initStatRow(pokemon) {
    state.stats[pokemon.uid] = state.stats[pokemon.uid] || {
      uid: pokemon.uid,
      pokemonName: pokemon.currentName,
      ownerId: pokemon.ownerId,
      ownerName: getTrainerName(pokemon.ownerId),
      kos: 0,
      damageDealt: 0,
      damageTaken: 0,
      deaths: 0,
      survivedDamage: 0
    };
  }

  function particle(name, type) {
    const last = String(name || '').trim().slice(-1);
    const code = last.charCodeAt(0);
    const hasBatchim = code >= 0xac00 && code <= 0xd7a3 ? ((code - 0xac00) % 28) !== 0 : false;
    if (type === 'subject') return `${name}${hasBatchim ? '(이)가' : '(가)'}`;
    if (type === 'with') return `${name}${hasBatchim ? '(과)' : '(와)'}`;
    if (type === 'obj') return `${name}${hasBatchim ? '(을)' : '(를)'}`;
    return name;
  }

  function stageMultiplier(stage) {
    const s = clamp(Number(stage || 0), -6, 6);
    return s >= 0 ? (2 + s) / 2 : 2 / (2 + Math.abs(s));
  }

  function accuracyStageMultiplier(stage) {
    const s = clamp(Number(stage || 0), -6, 6);
    return s >= 0 ? (3 + s) / 3 : 3 / (3 + Math.abs(s));
  }

  function effectiveStat(pokemon, key) {
    const stat = Number(pokemon?.stats?.[key] || 1);
    const stage = Number(pokemon?.statStages?.[key] || 0);
    let value = stat * stageMultiplier(stage);
    if (key === 'attack' && pokemon.status === 'burn') value *= 0.5;
    if (key === 'attack' && pokemon.tempBattleBuffs?.attackUp) value *= 1.2;
    if (key === 'defense' && pokemon.tempBattleBuffs?.defenseUp) value *= 1.2;
    if (key === 'spAttack' && pokemon.tempBattleBuffs?.spAttackUp) value *= 1.2;
    if (key === 'spDefense' && pokemon.tempBattleBuffs?.spDefenseUp) value *= 1.2;
    if (key === 'speed' && pokemon.tempBattleBuffs?.speedUp) value *= 1.2;
    if (key === 'speed' && pokemon.status === 'paralysis') value *= 0.25;
    if (key === 'speed' && getActiveAbility(pokemon) === '곡예' && !getHeldItems(pokemon).length) value *= 2;
    if (key === 'speed') value *= POKEBATTLE.items?.getSpeedMultiplier?.(pokemon) || 1;
    return Math.max(1, Math.floor(value));
  }

  function getActiveAbility(pokemon) {
    return pokemon?.ability || pokemon?.hiddenAbility || pokemon?.visibleAbility || pokemon?.base?.hiddenAbility || pokemon?.base?.ability || null;
  }

  function getBoostedMovePower(attacker, move, basePower) {
    const ability = getActiveAbility(attacker);
    let power = Number(basePower || 0);
    const hpRatio = (attacker?.currentHp || 0) / Math.max(1, attacker?.maxHp || 1);
    if (ability === '심록' && move.type === '풀' && hpRatio <= (1 / 3)) power = Math.floor(power * 1.5);
    if (ability === '맹화' && move.type === '불꽃' && hpRatio <= (1 / 3)) power = Math.floor(power * 1.5);
    if (ability === '급류' && move.type === '물' && hpRatio <= (1 / 3)) power = Math.floor(power * 1.5);
    if (ability === '철주먹' && /(펀치|Punch|주먹)/i.test(`${move.nameKo || ''} ${move.nameEn || ''}`)) power = Math.floor(power * 1.2);
    if (ability === '무모' && /반동/.test(`${move.description || ''} ${move.logicExplanation || ''}`)) power = Math.floor(power * 1.2);
    return power;
  }

  function getCritChance(attacker) {
    const ability = getActiveAbility(attacker);
    if (ability === '껍질갑옷') return 0.0625;
    const critStage = attacker?.tempBattleBuffs?.critUp ? 1 : 0;
    return critStage > 0 ? 0.125 : 0.0625;
  }

  function getTypeEffectivenessValue(moveType, defender) {
    const chart = POKEBATTLE.core?.TYPE_EFFECTIVENESS || {};
    const record = chart?.[moveType] || {};
    return (defender?.currentTypes || defender?.types || []).reduce((multiplier, defenseType) => {
      if (record?.무효 && Object.prototype.hasOwnProperty.call(record.무효, defenseType)) return multiplier * Number(record.무효[defenseType] || 0);
      if (record?.강함 && Object.prototype.hasOwnProperty.call(record.강함, defenseType)) return multiplier * Number(record.강함[defenseType] || 1);
      if (record?.약함 && Object.prototype.hasOwnProperty.call(record.약함, defenseType)) return multiplier * Number(record.약함[defenseType] || 1);
      return multiplier;
    }, 1);
  }

  function getMovePriority(move) {
    const raw = `${move?.nameKo || ''} ${move?.description || ''} ${move?.logicExplanation || ''}`;
    if (/방어|protect/i.test(raw)) return 4;
    if (/전광석화|quick attack/i.test(raw)) return 1;
    return Number(move?.priority || 0);
  }

  function getMoveCategoryStatMultiplier(attacker, move) {
    if (move?.category === '특수') return POKEBATTLE.items?.getSpecialAttackMultiplier?.(attacker, move) || 1;
    return POKEBATTLE.items?.getAttackMultiplier?.(attacker, move) || 1;
  }

  function statusCanApply(defender, status, move) {
    if (!POKEBATTLE.items?.canApplyStatusByItem?.(defender, move)) return false;
    const types = defender?.currentTypes || [];
    if (status === 'burn' && types.includes('불꽃')) return false;
    if (status === 'poison' && (types.includes('독') || types.includes('강철'))) return false;
    return true;
  }

  function calculateAccuracy(attacker, defender, move) {
    if (move.accuracy == null) return true;
    const itemAcc = POKEBATTLE.items?.getAccuracyMultiplier?.(attacker, state.moveContext || {}) || 1;
    const acc = Number(move.accuracy || 100) * accuracyStageMultiplier(attacker?.statStages?.accuracy || 0) / accuracyStageMultiplier(defender?.statStages?.evasion || 0) * itemAcc;
    return Math.random() * 100 < acc;
  }

  function isFissureMove(move) {
    return moveMatches(move, ['fissure', '땅가르기']) || String(move?.logicRef || '').trim().toLowerCase() === 'fissure';
  }

  function calculateOhkoAccuracy(attacker, defender, move) {
    if ((Number(attacker?.level || 1) < Number(defender?.level || 1))) return false;
    const itemAcc = POKEBATTLE.items?.getAccuracyMultiplier?.(attacker, state.moveContext || {}) || 1;
    const base = 30 + (Number(attacker?.level || 1) - Number(defender?.level || 1));
    const staged = base * accuracyStageMultiplier(attacker?.statStages?.accuracy || 0) / accuracyStageMultiplier(defender?.statStages?.evasion || 0) * itemAcc;
    const acc = Math.max(0, Math.min(100, staged));
    return Math.random() * 100 < acc;
  }

  function calculateDamage(attacker, defender, move) {
    const level = Number(attacker.level || 1);
    const power = getBoostedMovePower(attacker, move, move.power || 0);
    const atkKey = move.category === '특수' ? 'spAttack' : 'attack';
    const defKey = move.category === '특수' ? 'spDefense' : 'defense';
    const attack = Math.max(1, Math.floor(effectiveStat(attacker, atkKey) * getMoveCategoryStatMultiplier(attacker, move)));
    const defense = Math.max(1, effectiveStat(defender, defKey));
    const levelTerm = Math.floor((2 * level) / 5) + 2;
    const baseDamage = Math.floor(Math.floor(Math.floor(levelTerm * Math.max(1, power) * attack / defense) / 50) + 2);
    const stab = (attacker.currentTypes || []).includes(move.type) ? 1.5 : 1;
    const effectiveness = getTypeEffectivenessValue(move.type, defender);
    const defenderAbility = getActiveAbility(defender);
    const critChance = defenderAbility === '껍질갑옷' ? 0 : getCritChance(attacker);
    const critical = Math.random() < critChance;
    const crit = critical ? 2 : 1;
    const random = (85 + Math.floor(Math.random() * 16)) / 100;
    const item = POKEBATTLE.items?.getDamageMultiplier?.(attacker, move, { effectiveness }) || 1;
    let modifier = stab;
    modifier *= effectiveness;
    modifier *= crit;
    modifier *= random;
    modifier *= item;
    let damage = Math.floor(baseDamage * modifier);
    if (power > 0 && effectiveness > 0) damage = Math.max(1, damage);
    if (defender?.volatile?.digging && moveMatches(move, ['earthquake', '지진'])) damage = Math.max(1, Math.floor(damage * 2));
    return { damage, effectiveness, crit: critical };
  }

  function statusView(status) {
    const map = {
      paralysis: { label: '마비', color: '#f6d34a' },
      burn: { label: '화상', color: '#ff8b6a' },
      poison: { label: '독', color: '#c57aff' },
      sleep: { label: '잠듦', color: '#85b7ff' },
      freeze: { label: '얼음', color: '#87f3ff' },
      confusion: { label: '혼란', color: '#d2b0ff' }
    };
    return map[status] || null;
  }

  function snapshotPokemon(pokemon) {
    return {
      uid: pokemon.uid,
      name: pokemon.currentName,
      bloodline: pokemon.bloodline || 'normal',
      level: pokemon.level,
      currentHp: pokemon.currentHp,
      maxHp: pokemon.maxHp,
      types: pokemon.currentTypes,
      moves: pokemon.moves,
      status: statusView(pokemon.status) || (pokemon.volatile?.confusionTurns > 0 ? statusView('confusion') : null),
      base: pokemon.base
    };
  }


  function getHeldStatPreview(pokemon, key) {
    let value = Number(pokemon?.stats?.[key] || 1);
    if (key === 'attack') {
      value *= POKEBATTLE.items?.getAttackMultiplier?.(pokemon, { category: '물리' }) || 1;
    }
    if (key === 'spAttack') {
      value *= POKEBATTLE.items?.getSpecialAttackMultiplier?.(pokemon, { category: '특수' }) || 1;
    }
    if (key === 'speed') {
      value = effectiveStat(pokemon, 'speed');
      return Math.max(1, Math.floor(value));
    }
    return Math.max(1, Math.floor(value));
  }

  function getBattleStatSheet() {
    const ally = getActive('ally');
    const enemy = getActive('enemy');
    const mapStats = (pokemon) => {
      if (!pokemon) return null;
      return {
        uid: pokemon.uid,
        name: pokemon.currentName,
        bloodline: pokemon.bloodline || 'normal',
        level: pokemon.level,
        baseStats: { ...(pokemon.base?.speciesStats || pokemon.base?.stats || {}) },
        actualStats: {
          ...(pokemon.stats || {}),
          attack: getHeldStatPreview(pokemon, 'attack'),
          spAttack: getHeldStatPreview(pokemon, 'spAttack'),
          speed: getHeldStatPreview(pokemon, 'speed')
        },
        currentStats: {
          attack: Math.max(1, Math.floor(effectiveStat(pokemon, 'attack') * ((getHeldStatPreview(pokemon, 'attack') || 1) / Math.max(1, Number(pokemon.stats?.attack || 1))))),
          defense: effectiveStat(pokemon, 'defense'),
          spAttack: Math.max(1, Math.floor(effectiveStat(pokemon, 'spAttack') * ((getHeldStatPreview(pokemon, 'spAttack') || 1) / Math.max(1, Number(pokemon.stats?.spAttack || 1))))),
          spDefense: effectiveStat(pokemon, 'spDefense'),
          speed: getHeldStatPreview(pokemon, 'speed')
        },
        stages: { ...(pokemon.statStages || {}) },
        heldItems: getHeldItems(pokemon).map((item) => ({ ...item })),
        heldItem: getHeldItems(pokemon)[0] ? { ...getHeldItems(pokemon)[0] } : null,
        status: statusView(pokemon.status) || (pokemon.volatile?.confusionTurns > 0 ? statusView('confusion') : null)
      };
    };
    return { ally: mapStats(ally), enemy: mapStats(enemy) };
  }

  function getCurrentBench() {
    const side = currentActorSide();
    return getTeam(side).map((p, index) => ({ pokemon: snapshotPokemon(p), index })).filter((entry) => entry.index !== (side === 'ally' ? state.allyIndex : state.enemyIndex) && entry.pokemon.currentHp > 0);
  }

  function getSnapshot() {
    const ally = getActive('ally');
    const enemy = getActive('enemy');
    return {
      active: state.active,
      playerId: state.playerId,
      playerName: getTrainerName(state.playerId),
      opponentId: state.opponentId,
      opponentName: getTrainerName(state.opponentId),
      ally: ally ? snapshotPokemon(ally) : null,
      enemy: enemy ? snapshotPokemon(enemy) : null,
      currentActor: getActive(currentActorSide()) ? snapshotPokemon(getActive(currentActorSide())) : null,
      currentActorId: currentActorId(),
      currentBench: getCurrentBench(),
      allyBench: state.playerTeam.map((p, index) => ({ pokemon: snapshotPokemon(p), index })).filter((entry) => entry.index !== state.allyIndex && entry.pokemon.currentHp > 0),
      playerTeam: state.playerTeam,
      opponentTeam: state.opponentTeam,
      menu: state.menu,
      forceSwitch: state.forceSwitch && (!state.forceSwitchSide || state.forceSwitchSide === currentActorSide()),
      forceSwitchSide: state.forceSwitchSide,
      optionalSwitch: state.optionalSwitchSide === currentActorSide(),
      optionalSwitchSide: state.optionalSwitchSide,
      showMoveInfo: state.showMoveInfo,
      mode: state.options?.mode || 'quick',
      log: state.log.slice(-3),
      turnSide: currentActorSide(),
      turnLabel: state.options?.isDuo ? ((POKEBATTLE.core?.state?.settings?.language === 'en') ? `${getTrainerName(currentActorId())} Turn` : `${getTrainerName(currentActorId())}의 턴`) : '',
      trainerIntroSrc: state.options?.trainerIntroSrc || null,
      specialBgm: state.options?.specialBgm || null,
      battleId: Number.isFinite(Number(state.battleId)) ? Number(state.battleId) : 0,
      theme: state.options?.theme || null
    };
  }

  function startBattle(options) {
    const core = POKEBATTLE.core;
    const playerEntity = options.playerTeam ? { id: options.playerId, name: options.playerName || getTrainerName(options.playerId), squad: options.playerTeam } : (POKEBATTLE.league?.getPlayerOrNpc ? POKEBATTLE.league.getPlayerOrNpc(options.playerId) : core.getPlayer(options.playerId));
    const opponentEntity = options.opponentTeam ? { id: options.opponentId || 'dungeon_enemy', name: options.opponentName || '던전 트레이너', squad: options.opponentTeam } : (POKEBATTLE.league?.getPlayerOrNpc ? POKEBATTLE.league.getPlayerOrNpc(options.opponentId) : core.getPlayer(options.opponentId));
    if (!playerEntity || !opponentEntity) return false;
    state.active = true;
    state.battleId = Number.isFinite(Number(state.battleId)) ? Number(state.battleId) + 1 : 1;
    state.playerId = options.playerId || playerEntity.id;
    state.opponentId = options.opponentId || opponentEntity.id;
    state.playerTeam = playerEntity.squad || [];
    state.opponentTeam = opponentEntity.squad || [];
    if (options?.mode === 'league' && !options?.isDuo && options?.opponentId === 'p2' && state.opponentTeam.length < 3 && POKEBATTLE.league?.getPlayerOrNpc) {
      const refreshedGreen = POKEBATTLE.league.getPlayerOrNpc('p2');
      state.opponentTeam = refreshedGreen?.squad || state.opponentTeam;
    }
    state.allyIndex = Math.max(0, aliveIndex(state.playerTeam));
    state.enemyIndex = Math.max(0, aliveIndex(state.opponentTeam));
    state.menu = 'root';
    state.forceSwitch = false;
    state.forceSwitchSide = null;
    state.optionalSwitchSide = null;
    state.showMoveInfo = false;
    state.pendingBagItem = null;
    state.pendingBagTargetIndex = null;
    invalidatePendingAction();
    state.waiting = false;
    state.uiEffects.length = 0;
    state.log.length = 0;
    state.options = { ...options, playerName: options.playerName || playerEntity.name, opponentName: options.opponentName || opponentEntity.name };
    state.stats = {};
    state.turnSide = 'ally';
    state.pendingActions = { ally: null, enemy: null };
    state.weather = null;
    state.weatherTurns = 0;
    state.enemyStrategicSwitchUsed = false;
    [...state.playerTeam, ...state.opponentTeam].forEach((p) => {
      ensureBattleFields(p, p.ownerId || (state.playerTeam.includes(p) ? state.playerId : state.opponentId));
      initStatRow(p);
    });
    core.state.currentScreen = 'battle';
    pushLog(`${particle(getTrainerName(state.opponentId), 'subject')} 배틀을 걸어왔다!`);
    pushLog(`${particle(getActive('enemy')?.currentName || '', 'with')} 맞선다!`);
    render();
    return true;
  }

  function handleRootAction(action) {
    if (!state.active || state.waiting) return;
    if (action === 'fight') setMenu('moves');
    else if (action === 'bag') setMenu('bag');
    else if (action === 'pokemon') setMenu('switch');
    else if (action === 'info') POKEBATTLE.ui?.openTypeChartModal?.();
    else if (action === 'run' && ((state.options?.mode || 'quick') === 'quick' || state.options?.mode === 'dungeon')) finishBattle(state.opponentId, state.playerId, true);
  }

  function addTempBattleBuff(pokemon, buffKey, turns) {
    pokemon.tempBattleBuffs = pokemon.tempBattleBuffs || {};
    pokemon.tempBattleBuffs[buffKey] = turns;
  }

  function applyStageChange(target, key, amount, keyLabel) {
    const before = Number(target.statStages?.[key] || 0);
    const after = clamp(before + amount, -6, 6);
    target.statStages[key] = after;
    if (after === before) return false;
    if (amount >= 2) pushLog(`${target.currentName}의 ${keyLabel}가 크게 올랐다!`);
    else if (amount === 1) pushLog(`${target.currentName}의 ${keyLabel}가 올랐다!`);
    else if (amount <= -2) pushLog(`${target.currentName}의 ${keyLabel}가 크게 떨어졌다!`);
    else pushLog(`${target.currentName}의 ${keyLabel}가 떨어졌다!`);
    return true;
  }

  const STAGE_LABELS = {
    attack: '공격',
    defense: '방어',
    spAttack: '특수공격',
    spDefense: '특수방어',
    speed: '스피드',
    accuracy: '명중률',
    evasion: '회피율'
  };

  function applyParsedStageEffects(attacker, defender, move) {
    const explanation = String(move?.logicExplanation || '');
    if (!explanation) return 0;
    let applied = 0;
    const chanceRegex = /if\s*random\(100\)\s*<\s*(\d+)\s*:\s*(user|target)\.stages\.(attack|defense|spAttack|spDefense|speed|accuracy|evasion)\s*([+\-]=)\s*(\d+)/gi;
    explanation.replace(chanceRegex, (_, chance, who, statKey, operator, amount) => {
      if (Math.random() * 100 < Number(chance || 0)) {
        const target = who.toLowerCase() === 'user' ? attacker : defender;
        const delta = operator === '-=' ? -Number(amount || 0) : Number(amount || 0);
        if (applyStageChange(target, statKey, delta, STAGE_LABELS[statKey] || statKey)) applied += 1;
      }
      return _;
    });
    const cleaned = explanation.replace(chanceRegex, '');
    const guaranteedRegex = /(user|target)\.stages\.(attack|defense|spAttack|spDefense|speed|accuracy|evasion)\s*([+\-]=)\s*(\d+)/gi;
    cleaned.replace(guaranteedRegex, (_, who, statKey, operator, amount) => {
      const target = who.toLowerCase() === 'user' ? attacker : defender;
      const delta = operator === '-=' ? -Number(amount || 0) : Number(amount || 0);
      if (applyStageChange(target, statKey, delta, STAGE_LABELS[statKey] || statKey)) applied += 1;
      return _;
    });
    return applied;
  }


  function normalizeStatusToken(value) {
    const token = String(value || '').trim().toLowerCase();
    if (token === 'bad_poison' || token === 'toxic') return 'poison';
    if (token === 'paralyze') return 'paralysis';
    return token;
  }

  function applyParsedStatusEffects(attacker, defender, move) {
    const explanation = String(move?.logicExplanation || '');
    if (!explanation) return 0;
    let applied = 0;
    const chanceRegex = /if\s*random\(100\)\s*<\s*(\d+)\s*:\s*(user|target)\.status\s*=\s*'([^']+)'/gi;
    explanation.replace(chanceRegex, (_, chance, who, statusValue) => {
      if (Math.random() * 100 < Number(chance || 0)) {
        const target = who.toLowerCase() === 'user' ? attacker : defender;
        if (applyStatus(target, normalizeStatusToken(statusValue), move)) applied += 1;
      }
      return _;
    });
    const cleaned = explanation.replace(chanceRegex, '');
    const guaranteedRegex = /(user|target)\.status\s*=\s*'([^']+)'/gi;
    cleaned.replace(guaranteedRegex, (_, who, statusValue) => {
      const target = who.toLowerCase() === 'user' ? attacker : defender;
      if (applyStatus(target, normalizeStatusToken(statusValue), move)) applied += 1;
      return _;
    });
    return applied;
  }

  function applyStatus(target, status, move = null) {
    if (target.currentHp <= 0) return false;
    if (Number(target?.volatile?.substituteHp || 0) > 0) { pushLog(`${target.currentName}의 분신이 상태이상을 막았다!`); return false; }
    if (target.tempBattleBuffs?.statusGuard) return false;
    if (target.status) return false;
    if (!statusCanApply(target, status, move)) return false;
    target.status = status;
    if (status === 'sleep') {
      target.sleepTurns = 1 + Math.floor(Math.random() * 3);
      pushLog(`${target.currentName}는 잠들었다!`);
      return true;
    }
    if (status === 'paralysis') pushLog(`${target.currentName}는 마비되었다!`);
    if (status === 'burn') pushLog(`${target.currentName}는 화상을 입었다!`);
    if (status === 'poison') pushLog(`${target.currentName}는 독에 걸렸다!`);
    if (status === 'freeze') pushLog(`${target.currentName}는 얼어붙었다!`);
    return true;
  }

  function applyConfusion(target) {
    if (Number(target?.volatile?.substituteHp || 0) > 0) { pushLog(`${target.currentName}의 분신이 효과를 막았다!`); return false; }
    if (target.volatile.confusionTurns > 0) return false;
    target.volatile.confusionTurns = 2 + Math.floor(Math.random() * 3);
    pushLog(`${target.currentName}는 혼란에 빠졌다!`);
    return true;
  }

  function normalizeMoveToken(value) {
    return String(value || '').trim().toLowerCase().replace(/[\s_-]+/g, '');
  }

  function moveMatches(move, tokens) {
    const set = new Set([normalizeMoveToken(move?.logicRef), normalizeMoveToken(move?.nameKo), normalizeMoveToken(move?.nameEn)]);
    return tokens.some((token) => set.has(normalizeMoveToken(token)));
  }

  function healUser(user, amount, label) {
    const before = user.currentHp;
    user.currentHp = Math.min(user.maxHp, user.currentHp + amount);
    const healed = Math.max(0, user.currentHp - before);
    if (healed > 0 && label) pushLog(`${user.currentName}의 HP가 ${healed} 회복되었다!`);
  }

  function inferMultiHit(move) {
    const raw = `${move.nameKo || ''} ${move.logicRef || ''} ${move.logicExplanation || ''} ${move.description || ''}`;
    if (/구르기|multi_hit|연속/.test(raw)) {
      const r = Math.random();
      if (r < 0.375) return 2;
      if (r < 0.75) return 3;
      if (r < 0.875) return 4;
      return 5;
    }
    return 1;
  }

  function firstAvailableBenchIndex(side) {
    const team = getTeam(side);
    const activeIndex = side === 'ally' ? state.allyIndex : state.enemyIndex;
    const alive = team.map((p, index) => ({ p, index })).filter((entry) => entry.index !== activeIndex && (entry.p?.currentHp || 0) > 0);
    if (!alive.length) return -1;
    alive.sort((a, b) => (b.p.currentHp || 0) - (a.p.currentHp || 0));
    return alive[0].index;
  }

  function performPostAttackSwitch(side) {
    const nextIndex = firstAvailableBenchIndex(side);
    if (nextIndex < 0) return false;
    if (side === 'ally') state.allyIndex = nextIndex;
    else { state.enemyIndex = nextIndex; state.enemyAiMemory = { userUid: null, lastMoveIndex: null, repeatCount: 0 }; }
    POKEBATTLE.items?.clearChoiceLock?.(getActive(side));
    pushLog(`${getActive(side).currentName}가 출전한다.`);
    return true;
  }

  function applyMoveEffects(attacker, defender, move, dealtDamage) {
    const raw = `${move.nameKo || ''} ${move.logicRef || ''} ${move.logicExplanation || ''} ${move.description || ''}`;
    const logicRef = String(move.logicRef || '').trim().toLowerCase();
    const parsedStageEffects = applyParsedStageEffects(attacker, defender, move);
    const parsedStatusEffects = applyParsedStatusEffects(attacker, defender, move);
    if ((/흡수|메가드레인|drain|HP를 흡수/.test(raw)) && dealtDamage > 0) {
      healUser(attacker, Math.max(1, Math.floor(dealtDamage / 2)), 'drain');
    }
    if ((/광합성|회복|recover|synthesis/.test(raw)) && (move.category === '변화' || move.power == null)) {
      healUser(attacker, Math.max(1, Math.floor(attacker.maxHp / 2)), 'heal');
    }
    if (logicRef === 'roost' && (move.category === '변화' || move.power == null)) {
      healUser(attacker, Math.max(1, Math.floor(attacker.maxHp / 2)), 'heal');
    }
    if ((/씨뿌리기|leech_seed/.test(raw) || logicRef === 'leech_seed') && !defender.currentTypes.includes('풀')) {
      defender.volatile.leechSeed = true;
      pushLog(`${defender.currentName}에게 씨앗이 심어졌다!`);
    }
    if (/방어/.test(move.nameKo || '') || logicRef === 'protect') {
      const chain = Number(attacker?.volatile?.protectChain || 0);
      const successChance = chain <= 0 ? 1 : Math.pow(0.5, chain);
      if (Math.random() <= successChance) {
        attacker.volatile.protect = true;
        attacker.volatile.protectChain = chain + 1;
        pushLog(`${attacker.currentName}는 방어 자세를 취했다!`);
      } else {
        attacker.volatile.protect = false;
        attacker.volatile.protectChain = 0;
        pushLog('하지만 실패했다!');
      }
    }
    if (moveMatches(move, ['sleep_powder', '수면가루', 'sing', '노래하기', '노래부르기', 'dark_void', '다크홀'])) applyStatus(defender, 'sleep', move);
    if (parsedStatusEffects === 0 && (/전기자석파|저리가루|뱀눈초리|stun_spore|paralyze|glare/.test(raw) || logicRef === 'thunder_wave' || logicRef === 'glare')) applyStatus(defender, 'paralysis', move);
    if (/독가루|독독|poison/.test(raw) && move.category === '변화') applyStatus(defender, 'poison', move);
    if (/화상|will_o_wisp|불꽃세례|burn/.test(raw) && !/화상치료/.test(raw)) applyStatus(defender, 'burn', move);
    if (/혼란|초음파|confuse/.test(raw)) applyConfusion(defender);
    if (parsedStageEffects === 0 && (/용의춤/.test(raw) || logicRef === 'dragon_dance')) {
      applyStageChange(attacker, 'attack', 1, '공격', attacker);
      applyStageChange(attacker, 'speed', 1, '스피드', attacker);
    }
    if (parsedStageEffects === 0 && /울음소리/.test(raw)) applyStageChange(defender, 'attack', -1, '공격', attacker);
    if (parsedStageEffects === 0 && /연막|smokescreen/.test(raw)) applyStageChange(defender, 'accuracy', -1, '명중률', attacker);
    if (parsedStageEffects === 0 && (/철벽|코스믹파워/.test(raw) || logicRef === 'iron_defense')) applyStageChange(attacker, 'defense', 2, '방어', attacker);
    if (parsedStageEffects === 0 && (/명상|calm mind/i.test(raw) || logicRef === 'calm_mind')) { applyStageChange(attacker, 'spAttack', 1, '특수공격'); applyStageChange(attacker, 'spDefense', 1, '특수방어'); }
    if (parsedStageEffects === 0 && (/나쁜음모|nasty plot/i.test(raw) || logicRef === 'nasty_plot')) applyStageChange(attacker, 'spAttack', 2, '특수공격');
    if (parsedStageEffects === 0 && (/칼춤|swords dance/i.test(raw) || logicRef === 'swords_dance')) applyStageChange(attacker, 'attack', 2, '공격', attacker);
    if (parsedStageEffects === 0 && (/인파이트|close combat/i.test(raw) || logicRef === 'close_combat')) {
      applyStageChange(attacker, 'defense', -1, '방어', attacker);
      applyStageChange(attacker, 'spDefense', -1, '특수방어', attacker);
    }
    if (parsedStageEffects === 0 && (moveMatches(move, ['tail_whip', '꼬리흔들기']) || /tail whip/i.test(raw))) applyStageChange(defender, 'defense', -1, '방어', attacker);
    if (parsedStageEffects === 0 && (moveMatches(move, ['leer', '째려보기']) || /leer/i.test(raw))) applyStageChange(defender, 'defense', -1, '방어', attacker);
    if (parsedStageEffects === 0 && (moveMatches(move, ['sand_attack', '모래뿌리기']) || /sand attack/i.test(raw))) applyStageChange(defender, 'accuracy', -1, '명중률', attacker);
    if (parsedStageEffects === 0 && (moveMatches(move, ['growth', '성장']) || /growth/i.test(raw))) { applyStageChange(attacker, 'attack', 1, '공격', attacker); applyStageChange(attacker, 'spAttack', 1, '특수공격', attacker); }
    if (parsedStageEffects === 0 && (moveMatches(move, ['bulk_up', '벌크업']) || /bulk up/i.test(raw))) { applyStageChange(attacker, 'attack', 1, '공격', attacker); applyStageChange(attacker, 'defense', 1, '방어', attacker); }
    if (parsedStageEffects === 0 && (moveMatches(move, ['harden', '단단해지기']) || /harden/i.test(raw))) applyStageChange(attacker, 'defense', 1, '방어', attacker);
    if (parsedStageEffects === 0 && (moveMatches(move, ['withdraw', '껍질에숨기']) || /withdraw/i.test(raw))) applyStageChange(attacker, 'defense', 1, '방어', attacker);
    if (parsedStageEffects === 0 && (moveMatches(move, ['coil', '똬리틀기']) || /coil/i.test(raw))) { applyStageChange(attacker, 'attack', 1, '공격', attacker); applyStageChange(attacker, 'defense', 1, '방어', attacker); applyStageChange(attacker, 'accuracy', 1, '명중률', attacker); }
    if (parsedStageEffects === 0 && /고속이동/.test(raw)) applyStageChange(attacker, 'speed', 2, '스피드', attacker);
    if (logicRef === 'aqua_ring') {
      attacker.volatile.aquaRing = true;
      pushLog(`${attacker.currentName}는 물의 고리를 둘렀다!`);
    }
    if (logicRef === 'rain_dance') {
      state.weather = 'rain';
      state.weatherTurns = 5;
      pushLog('비가 내리기 시작했다!');
    }
    if (logicRef === 'hail') {
      state.weather = 'hail';
      state.weatherTurns = 5;
      pushLog('싸라기눈이 내리기 시작했다!');
    }
    if (logicRef === 'rest') {
      attacker.status = null;
      healUser(attacker, attacker.maxHp, 'rest');
      attacker.status = 'sleep';
      attacker.sleepTurns = 2;
      pushLog(`${attacker.currentName}는 푹 쉬고 잠들었다!`);
    }
    if (logicRef === 'substitute') {
      const hpCost = Math.floor(attacker.maxHp / 4);
      if (!attacker.volatile.substituteHp && attacker.currentHp > hpCost) {
        attacker.currentHp -= hpCost;
        attacker.volatile.substituteHp = hpCost;
        pushLog(`${attacker.currentName}는 분신을 만들었다!`);
      } else {
        pushLog('하지만 실패했다!');
      }
    }
    if (/반동/.test(raw) && dealtDamage > 0) {
      const recoil = Math.max(1, Math.floor(dealtDamage / 4));
      attacker.currentHp = Math.max(0, attacker.currentHp - recoil);
      pushLog(`${attacker.currentName}는 반동으로 ${recoil} 피해를 입었다!`);
    }
  }

  function applyDamage(defender, attacker, amount, side, cause = 'direct') {
    const damage = Math.max(0, Math.floor(amount || 0));
    if (damage <= 0) return { fainted: false, actualDamage: 0 };
    if (cause === 'direct' && Number(defender?.volatile?.substituteHp || 0) > 0) {
      defender.volatile.substituteHp = Math.max(0, Number(defender.volatile.substituteHp || 0) - damage);
      pushLog(`${defender.currentName}의 분신이 공격을 대신 맞았다!`);
      if (defender.volatile.substituteHp <= 0) {
        defender.volatile.substituteHp = 0;
        pushLog(`${defender.currentName}의 분신이 사라졌다!`);
      }
      return { fainted: false, actualDamage: 0 };
    }
    if (cause === 'direct' && getActiveAbility(defender) === '옹골참' && defender.currentHp === defender.maxHp && damage >= defender.currentHp) {
      defender.currentHp = 1;
      pushLog(`${defender.currentName}는 옹골참으로 버텼다!`);
      return { fainted: false, actualDamage: Math.max(0, defender.maxHp - 1) };
    }
    if (cause === 'direct' && damage >= defender.currentHp && POKEBATTLE.items?.preventLethal?.(defender, cause)) {
      defender.currentHp = 1;
      pushLog(`${defender.currentName}는 기합의띠로 버텼다!`);
      return { fainted: false, actualDamage: Math.max(0, defender.maxHp - 1) };
    }
    const before = defender.currentHp;
    defender.currentHp = Math.max(0, defender.currentHp - damage);
    const actualDamage = Math.max(0, before - defender.currentHp);
    state.stats[attacker.uid].damageDealt += actualDamage;
    state.stats[defender.uid].damageTaken += actualDamage;
    state.stats[defender.uid].survivedDamage += actualDamage;
    if (cause === 'direct' && actualDamage > 0) {
      queueEffect({ type: 'hit', target: side === 'ally' ? 'enemy' : 'ally' });
      queueEffect({ type: 'sound', name: 'hit' });
      if (actualDamage >= Math.floor(defender.maxHp * 0.35)) queueEffect({ type: 'shake', strength: 'small' });
    }
    POKEBATTLE.items?.onDamaged?.(defender, { pushLog }, cause);
    if (defender.currentHp <= 0) {
      queueEffect({ type: 'faint', target: side === 'ally' ? 'enemy' : 'ally' });
      state.stats[attacker.uid].kos += 1;
      state.stats[defender.uid].deaths += 1;
      pushLog(`${defender.currentName}가 기절했다.`);
      return { fainted: true, actualDamage };
    }
    return { fainted: false, actualDamage };
  }

  function performMove(side, moveIndex) {
    const attacker = getActive(side);
    const defender = getActive(side === 'ally' ? 'enemy' : 'ally');
    state.moveContext = { ...(state.moveContext || {}), side, attackerUid: attacker?.uid, defenderUid: defender?.uid };
    if (!attacker || !defender || attacker.currentHp <= 0) return { fainted: false };
    const selectedMove = attacker.moves?.[moveIndex];
    const useStruggle = (!selectedMove || selectedMove.currentPP <= 0) && allMovesExhausted(attacker);
    if ((!selectedMove || selectedMove.currentPP <= 0) && !useStruggle) return { fainted: false };
    const selectedRaw = `${(useStruggle ? getStruggleMove().nameKo : selectedMove?.nameKo) || ''} ${(useStruggle ? getStruggleMove().logicRef : selectedMove?.logicRef) || ''} ${(useStruggle ? getStruggleMove().logicExplanation : selectedMove?.logicExplanation) || ''} ${(useStruggle ? getStruggleMove().description : selectedMove?.description) || ''}`;
    const selectedLogicRef = String((useStruggle ? move.logicRef : selectedMove.logicRef) || '').trim().toLowerCase();
    const selectedIsProtect = /방어/.test((useStruggle ? move.nameKo : selectedMove.nameKo) || '') || selectedLogicRef === 'protect';
    const selectedIsDig = !useStruggle && moveMatches(selectedMove, ['dig', '구멍파기']);
    const selectedIsFly = !useStruggle && moveMatches(selectedMove, ['fly', '공중날기']);
    const selectedIsFissure = !useStruggle && isFissureMove(selectedMove);
    if (!selectedIsProtect) attacker.volatile.protectChain = 0;

    let move = useStruggle ? getStruggleMove() : selectedMove;
    if (attacker.volatile?.chargeMove === 'dig' && attacker.volatile?.digging) {
      move = { ...(attacker.volatile.chargeMoveData || selectedMove) };
      attacker.volatile.chargeMove = null;
      attacker.volatile.chargeMoveData = null;
      attacker.volatile.digging = false;
      pushLog(`${attacker.currentName}가 땅속에서 나타났다!`);
    } else if (attacker.volatile?.chargeMove === 'fly' && attacker.volatile?.flying) {
      move = { ...(attacker.volatile.chargeMoveData || selectedMove) };
      attacker.volatile.chargeMove = null;
      attacker.volatile.chargeMoveData = null;
      attacker.volatile.flying = false;
      pushLog(`${attacker.currentName}가 하늘에서 내려왔다!`);
    } else if (selectedIsDig) {
      selectedMove.currentPP = Math.max(0, selectedMove.currentPP - 1);
      attacker.volatile.chargeMove = 'dig';
      attacker.volatile.chargeMoveData = { ...selectedMove };
      attacker.volatile.digging = true;
      pushLog(`${attacker.currentName}는 땅속으로 파고들었다!`);
      return { fainted: false };
    } else if (selectedIsFly) {
      selectedMove.currentPP = Math.max(0, selectedMove.currentPP - 1);
      attacker.volatile.chargeMove = 'fly';
      attacker.volatile.chargeMoveData = { ...selectedMove };
      attacker.volatile.flying = true;
      pushLog(`${attacker.currentName}는 하늘 높이 날아올랐다!`);
      return { fainted: false };
    }

    if (attacker.status === 'sleep') {
      pushLog(`${attacker.currentName}는 자고 있어 움직일 수 없다!`);
      return { fainted: false };
    }
    if (attacker.status === 'freeze') {
      if (Math.random() < 0.2) {
        attacker.status = null;
        pushLog(`${attacker.currentName}의 얼음 상태가 풀렸다!`);
      } else {
        pushLog(`${attacker.currentName}는 얼어서 움직일 수 없다!`);
        return { fainted: false };
      }
    }
    if (attacker.status === 'paralysis' && Math.random() < 0.25) {
      pushLog(`${attacker.currentName}는 몸이 저려 움직일 수 없다!`);
      return { fainted: false };
    }
    if (attacker.volatile.confusionTurns > 0) {
      pushLog(`${attacker.currentName}는 혼란하고 있다!`);
      attacker.volatile.confusionTurns -= 1;
      if (Math.random() < 0.33) {
        const self = calculateDamage(attacker, attacker, { power: 40, category: '물리', type: '노말' });
        const selfResult = applyDamage(attacker, attacker, self.damage, side === 'ally' ? 'enemy' : 'ally', 'indirect');
        pushLog(`${attacker.currentName}는 혼란으로 자신을 공격했다!`);
        return { fainted: selfResult.fainted };
      }
      if (attacker.volatile.confusionTurns <= 0) pushLog(`${attacker.currentName}의 혼란이 풀렸다!`);
    }

    if (!useStruggle && move === selectedMove) {
      move.currentPP = Math.max(0, move.currentPP - 1);
    }
    POKEBATTLE.items?.enforceChoiceLock?.(attacker, moveIndex);
    pushLog(`${attacker.currentName}의 ${move.nameKo}!`);
    const effectAsset = SKILL_EFFECT_ASSETS[move?.type];
    if (effectAsset) {
      queueEffect({ type: 'skill', asset: effectAsset, label: `${attacker.currentName} · ${move.nameKo}`, moveType: move?.type });
      queueEffect({ type: 'sound', name: 'hit' });
    }

    if (defender?.volatile?.digging && !moveMatches(move, ['earthquake', '지진'])) {
      pushLog(`${defender.currentName}는 땅속에 숨어 있어서 공격이 닿지 않았다!`);
      return { fainted: false };
    }
    if (defender?.volatile?.flying && !moveMatches(move, ['thunder', '번개', 'gust', '바람일으키기'])) {
      pushLog(`${defender.currentName}는 하늘에 있어서 공격이 닿지 않았다!`);
      return { fainted: false };
    }

    if (selectedIsFissure) {
      if (defender.volatile.protect) {
        pushLog(`${defender.currentName}는 방어로 공격을 막았다!`);
        return { fainted: false };
      }
      if (move.type === '땅' && (defender.currentTypes || []).includes('비행') && !defender.volatile?.grounded) {
        pushLog('효과가 없는 것 같다...');
        return { fainted: false };
      }
      if (move.type === '땅' && POKEBATTLE.items?.grantsGroundImmunity?.(defender)) {
        pushLog('효과가 없는 것 같다...');
        return { fainted: false };
      }
      if (Number(attacker?.level || 1) < Number(defender?.level || 1)) {
        pushLog('상대의 레벨이 더 높아 실패했다!');
        return { fainted: false };
      }
      if (!calculateOhkoAccuracy(attacker, defender, move)) {
        pushLog('기술이 빗나갔다!');
        return { fainted: false };
      }
      const damageResult = applyDamage(defender, attacker, Math.max(1, defender.currentHp), side, 'direct');
      if (!damageResult.fainted) {
        defender.currentHp = 0;
        pushLog(`${defender.currentName}는 땅가르기에 휩쓸렸다!`);
        queueEffect({ type: 'faint', target: side === 'ally' ? 'enemy' : 'ally' });
      }
      state.moveContext = null;
      return { fainted: true };
    }

    if (!calculateAccuracy(attacker, defender, move)) {
      pushLog('기술이 빗나갔다!');
      return { fainted: false };
    }

    if ((/자폭|대폭발/.test(move.nameKo || '')) && (getActiveAbility(attacker) === '습기' || getActiveAbility(defender) === '습기')) {
      pushLog('습기 때문에 폭발 기술이 실패했다!');
      return { fainted: false };
    }

    if (move.category === '변화' || move.power == null) {
      applyMoveEffects(attacker, defender, move, 0);
      return { fainted: false };
    }

    if (defender.volatile.protect) {
      pushLog(`${defender.currentName}는 방어로 공격을 막았다!`);
      return { fainted: false };
    }

    if (move.type === '땅' && (defender.currentTypes || []).includes('비행') && !defender.volatile?.grounded) {
      pushLog('효과가 없는 것 같다...');
      return { fainted: false };
    }
    if (move.type === '땅' && POKEBATTLE.items?.grantsGroundImmunity?.(defender)) {
      pushLog('효과가 없는 것 같다...');
      return { fainted: false };
    }

    if (/카운터|미러코트|고정데미지|fixed/i.test(`${move.nameKo || ''} ${move.description || ''} ${move.logicExplanation || ''}`)) {
      const fixed = Math.max(1, Number(move.power || 20));
      const damageResult = applyDamage(defender, attacker, fixed, side, 'direct');
      if (damageResult.fainted) return { fainted: true };
      return { fainted: false };
    }

    const hits = inferMultiHit(move);
    let totalDamage = 0;
    let fainted = false;
    let lastEffectiveness = 1;
    let critHit = false;
    let connectedHits = 0;
    for (let hit = 0; hit < hits; hit += 1) {
      const result = calculateDamage(attacker, defender, move);
      lastEffectiveness = result.effectiveness;
      critHit = critHit || result.crit;
      if (result.effectiveness === 0) {
        pushLog('효과가 없는 것 같다...');
        break;
      }
      const damageResult = applyDamage(defender, attacker, result.damage, side, 'direct');
      totalDamage += damageResult.actualDamage;
      connectedHits += 1;
      if (damageResult.fainted) {
        fainted = true;
        break;
      }
    }

    if (connectedHits > 1) pushLog(`${connectedHits}번 맞았다!`);
    if (lastEffectiveness > 1) pushLog('효과가 굉장했다!');
    else if (lastEffectiveness > 0 && lastEffectiveness < 1) pushLog('효과가 별로인 듯하다...');
    if (critHit) pushLog('급소에 맞았다!');

    applyMoveEffects(attacker, defender, move, totalDamage);
    if (String(move.logicRef || '').trim().toLowerCase() === 'struggle' && attacker.currentHp > 0) {
      const recoil = Math.max(1, Math.floor(attacker.maxHp / 4));
      applyDamage(attacker, attacker, recoil, side === 'ally' ? 'enemy' : 'ally', 'indirect');
      pushLog(`${attacker.currentName}는 발버둥치기의 반동을 받았다!`);
    }
    POKEBATTLE.items?.afterMoveDamage?.(attacker, totalDamage, { pushLog });
    if ((/유턴|u-turn/i.test(`${move.nameKo || ''} ${move.logicRef || ''} ${move.logicExplanation || ''} ${move.description || ''}`) || String(move.logicRef || '').trim().toLowerCase() === 'u_turn') && attacker.currentHp > 0) {
      performPostAttackSwitch(side);
    }
    if (attacker.currentHp <= 0) pushLog(`${attacker.currentName}가 기절했다.`);
    state.moveContext = null;
    return { fainted };
  }

  function processEndTurn() {
    const pair = [['ally', getActive('ally')], ['enemy', getActive('enemy')]];
    pair.forEach(([side, p]) => {
      if (!p || p.currentHp <= 0) return;
      if (p.status === 'poison' || p.status === 'burn') {
        const chip = Math.max(1, Math.floor(p.maxHp / 8));
        const source = side === 'ally' ? getActive('enemy') : getActive('ally');
        applyDamage(p, source || p, chip, side === 'ally' ? 'enemy' : 'ally', 'indirect');
        pushLog(`${p.currentName}는 ${statusView(p.status)?.label || '상태이상'} 때문에 ${chip} 피해를 입었다!`);
      }
      if (p.currentHp > 0 && ['poison','burn','paralysis'].includes(p.status) && Math.random() < 0.10) {
        const oldStatus = statusView(p.status)?.label || '상태이상';
        p.status = null;
        pushLog(`${p.currentName}의 ${oldStatus} 상태가 풀렸다!`);
      }
      if (p.currentHp > 0 && p.volatile.leechSeed) {
        const chip = Math.max(1, Math.floor(p.maxHp / 8));
        const sourceSide = side === 'ally' ? 'enemy' : 'ally';
        const source = getActive(sourceSide);
        applyDamage(p, source || p, chip, sourceSide === 'ally' ? 'ally' : 'enemy', 'indirect');
        if (source && source.currentHp > 0) healUser(source, chip, 'seed');
        pushLog(`${p.currentName}는 씨뿌리기로 HP를 빼앗겼다!`);
      }
      if (p.currentHp > 0 && getActiveAbility(p) === '가속') {
        applyStageChange(p, 'speed', 1, '스피드', p);
      }
      if (p.currentHp > 0 && p.volatile?.aquaRing) {
        healUser(p, Math.max(1, Math.floor(p.maxHp / 16)), 'aqua_ring');
      }
      if (p.currentHp > 0 && state.weather === 'hail' && !(p.currentTypes || []).includes('얼음')) {
        const chip = Math.max(1, Math.floor(p.maxHp / 16));
        const source = side === 'ally' ? getActive('enemy') : getActive('ally');
        applyDamage(p, source || p, chip, side === 'ally' ? 'enemy' : 'ally', 'indirect');
        pushLog(`${p.currentName}는 싸라기눈 때문에 ${chip} 피해를 입었다!`);
      }
      if (p.currentHp > 0) POKEBATTLE.items?.applyEndTurnHeldItem?.(p, { pushLog });
      if (p.currentHp <= 0) {
        queueEffect({ type: 'faint', target: side === 'ally' ? 'ally' : 'enemy' });
        state.stats[p.uid].deaths += 1;
        pushLog(`${p.currentName}가 기절했다.`);
      }
      Object.keys(p.tempBattleBuffs || {}).forEach((key) => {
        p.tempBattleBuffs[key] -= 1;
        if (p.tempBattleBuffs[key] <= 0) delete p.tempBattleBuffs[key];
      });
      p.volatile.protect = false;
      if (p.status === 'sleep' && p.sleepTurns > 0) {
        p.sleepTurns -= 1;
        if (p.sleepTurns <= 0) {
          p.status = null;
          pushLog(`${p.currentName}가 잠에서 깨어났다!`);
        }
      }
    });
    if (state.weatherTurns > 0) {
      state.weatherTurns -= 1;
      if (state.weatherTurns <= 0) {
        if (state.weather === 'rain') pushLog('비가 그쳤다!');
        if (state.weather === 'hail') pushLog('싸라기눈이 그쳤다!');
        state.weather = null;
        state.weatherTurns = 0;
      }
    }
  }

  function maybeAutoSendNext(side) {
    invalidatePendingAction();
    const team = getTeam(side);
    const next = aliveIndex(team);
    if (next < 0) return false;
    const humanControlled = state.options?.isDuo || side === 'ally';
    if (humanControlled) {
      state.forceSwitch = true;
      state.forceSwitchSide = side;
      state.turnSide = side;
      state.menu = 'switch';
      return true;
    }
    if (side === 'ally') state.allyIndex = next;
    else { state.enemyIndex = next; state.enemyAiMemory = { userUid: null, lastMoveIndex: null, repeatCount: 0 }; }
    state.forceSwitch = false;
    state.forceSwitchSide = null;
    pushLog(`${team[next].currentName}가 출전한다.`);
    if (side === 'enemy' && firstAvailableBenchIndex('ally') >= 0) {
      state.optionalSwitchSide = 'ally';
      state.turnSide = 'ally';
      state.menu = 'post-faint-switch';
    }
    return true;
  }


  function getDeterministicDamageEstimate(attacker, defender, move) {
    if (!attacker || !defender || !move) return { damage: 0, effectiveness: 1, accuracy: 1 };
    const effectiveness = getTypeEffectivenessValue(move.type, defender);
    if (effectiveness === 0) return { damage: 0, effectiveness, accuracy: 0 };
    const accuracy = move.accuracy == null ? 1 : Math.max(0.3, Math.min(1, (Number(move.accuracy || 100) * accuracyStageMultiplier(attacker?.statStages?.accuracy || 0) / accuracyStageMultiplier(defender?.statStages?.evasion || 0)) / 100));
    if (isFissureMove(move)) {
      if (Number(attacker?.level || 1) < Number(defender?.level || 1)) return { damage: 0, effectiveness, accuracy: 0 };
      const baseAcc = Math.max(0, Math.min(1, (30 + (Number(attacker?.level || 1) - Number(defender?.level || 1))) / 100));
      return { damage: defender.currentHp, effectiveness, accuracy: baseAcc };
    }
    const level = Number(attacker.level || 1);
    const power = getBoostedMovePower(attacker, move, move.power || 0);
    if (power <= 0) return { damage: 0, effectiveness, accuracy };
    const atkKey = move.category === '특수' ? 'spAttack' : 'attack';
    const defKey = move.category === '특수' ? 'spDefense' : 'defense';
    const attack = Math.max(1, Math.floor(effectiveStat(attacker, atkKey) * getMoveCategoryStatMultiplier(attacker, move)));
    const defense = Math.max(1, effectiveStat(defender, defKey));
    const levelTerm = Math.floor((2 * level) / 5) + 2;
    const baseDamage = Math.floor(Math.floor(Math.floor(levelTerm * Math.max(1, power) * attack / defense) / 50) + 2);
    const stab = (attacker.currentTypes || []).includes(move.type) ? 1.5 : 1;
    const item = POKEBATTLE.items?.getDamageMultiplier?.(attacker, move, { effectiveness }) || 1;
    let damage = Math.floor(baseDamage * stab * effectiveness * 0.925 * item);
    if (power > 0 && effectiveness > 0) damage = Math.max(1, damage);
    return { damage, effectiveness, accuracy };
  }


  function allMovesExhausted(pokemon) {
    return !(pokemon?.moves || []).some((move) => Number(move?.currentPP || 0) > 0);
  }

  function getStruggleMove() {
    return {
      id: 'struggle',
      nameKo: '발버둥치기',
      nameEn: 'Struggle',
      type: '노말',
      category: '물리',
      power: 50,
      accuracy: null,
      pp: 1,
      currentPP: 1,
      maxPP: 1,
      logicRef: 'struggle',
      description: '모든 PP를 소모했을 때 사용하는 최후의 기술입니다.'
    };
  }

  function getEnemyRecoveryCount(enemy) {
    return Number(state.enemyRecoveryUsage?.[enemy?.uid || ''] || 0);
  }

  function markEnemyRecoveryUse(enemy) {
    if (!enemy?.uid) return;
    state.enemyRecoveryUsage = state.enemyRecoveryUsage || {};
    state.enemyRecoveryUsage[enemy.uid] = getEnemyRecoveryCount(enemy) + 1;
  }

  function getMoveAiTags(move) {
    const raw = `${move?.nameKo || ''} ${move?.nameEn || ''} ${move?.description || ''} ${move?.logicExplanation || ''} ${move?.logicRef || ''}`;
    return {
      raw,
      isDamaging: Number(move?.power || 0) > 0 || isFissureMove(move),
      isRecovery: /회복|recover|roost|rest|광합성|synthesis|쉬기/.test(raw),
      isDrain: /흡수|드레인|drain|메가드레인|기가드레인/.test(raw),
      inflictsStatus: /수면|sleep|독가루|poison|마비|paraly|혼란|confus|burn|화상|씨뿌리기|leech_seed|전기자석파|stun_spore|뱀눈초리|glare|다크홀|노래하기|노래부르기/.test(raw),
      isProtect: /방어|protect/.test(raw),
      isWeather: /rain_dance|hail|비바라기|싸라기눈/.test(raw),
      isPivot: /유턴|u-turn|u_turn/.test(raw),
      isSetup: /(stages\.|용의춤|dragon_dance|칼춤|swords_dance|벌크업|bulk_up|명상|calm_mind|나쁜음모|nasty_plot|고속이동|성장|코일|똬리틀기|철벽|iron_defense|단단해지기|껍질에숨기)/.test(raw)
    };
  }

  function parseMoveStageIntent(move) {
    const explanation = String(move?.logicExplanation || '');
    const result = [];
    if (!explanation) return result;
    const chanceRegex = /if\s*random\(100\)\s*<\s*(\d+)\s*:\s*(user|target)\.stages\.(attack|defense|spAttack|spDefense|speed|accuracy|evasion)\s*([+\-]=)\s*(\d+)/gi;
    explanation.replace(chanceRegex, (_, chance, who, statKey, operator, amount) => {
      result.push({ chance: Number(chance || 0) / 100, who: who.toLowerCase(), statKey, delta: operator === '-=' ? -Number(amount || 0) : Number(amount || 0) });
      return _;
    });
    const cleaned = explanation.replace(chanceRegex, '');
    const guaranteedRegex = /(user|target)\.stages\.(attack|defense|spAttack|spDefense|speed|accuracy|evasion)\s*([+\-]=)\s*(\d+)/gi;
    cleaned.replace(guaranteedRegex, (_, who, statKey, operator, amount) => {
      result.push({ chance: 1, who: who.toLowerCase(), statKey, delta: operator === '-=' ? -Number(amount || 0) : Number(amount || 0) });
      return _;
    });
    return result;
  }

  function stageHeadroom(pokemon, statKey, delta) {
    const current = Number(pokemon?.statStages?.[statKey] || 0);
    if (delta > 0) return Math.max(0, 6 - current);
    if (delta < 0) return Math.max(0, current + 6);
    return 0;
  }

  function getEnemyAiPenalty(enemy, moveIndex) {
    const memory = state.enemyAiMemory || {};
    if (memory.userUid !== enemy?.uid) return 0;
    if (memory.lastMoveIndex !== moveIndex) return 0;
    return 8 + (memory.repeatCount || 0) * 9;
  }

  function scoreEnemyMove(enemy, ally, move, index) {
    if (!move || (move.currentPP || 0) <= 0) return -Infinity;
    const tags = getMoveAiTags(move);
    const estimate = getDeterministicDamageEstimate(enemy, ally, move);
    const allyHpRatio = (ally.currentHp || 0) / Math.max(1, ally.maxHp || 1);
    const enemyHpRatio = (enemy.currentHp || 0) / Math.max(1, enemy.maxHp || 1);
    let score = 0;

    if (tags.isDamaging) {
      const expectedDamage = estimate.damage * estimate.accuracy;
      const expectedHpRatio = expectedDamage / Math.max(1, ally.currentHp || 1);
      score += expectedHpRatio * 140;
      score += expectedDamage / Math.max(1, ally.maxHp || 1) * 55;
      if (estimate.effectiveness > 1) score += 20 * estimate.effectiveness;
      if (estimate.effectiveness < 1 && estimate.effectiveness > 0) score -= 12;
      if (estimate.effectiveness === 0) score -= 400;
      if (expectedDamage >= ally.currentHp) score += 140;
      if (estimate.accuracy < 0.7) score -= (0.7 - estimate.accuracy) * 45;
      if (/물리/.test(String(move.category || '')) && enemy.status === 'burn') score -= 18;
      if (tags.isDrain && enemyHpRatio <= 0.7) score += 20 + (1 - enemyHpRatio) * 25;
      if (tags.isPivot) {
        const bestSwitch = bestAvailableSwitchIndexForEnemy();
        if (bestSwitch >= 0 && estimate.effectiveness <= 1 && enemyHpRatio <= 0.65) score += 18;
      }
    }

    if (tags.isRecovery) {
      if (getEnemyRecoveryCount(enemy) >= 2) return -Infinity;
      if (enemyHpRatio <= 0.25) score += 95;
      else if (enemyHpRatio <= 0.45) score += 55;
      else if (enemyHpRatio <= 0.65) score += 18;
      else score -= 20;
      if (enemy.status && /rest|잠자기/i.test(tags.raw)) score += 20;
    }

    if (tags.inflictsStatus) {
      const canSeed = /씨뿌리기|leech_seed/.test(tags.raw) && !ally.currentTypes.includes('풀') && !ally.volatile?.leechSeed;
      const wantsSleep = /sleep|수면|다크홀|노래하기|노래부르기/.test(tags.raw) && !ally.status;
      const wantsPara = /마비|paraly|전기자석파|stun_spore|뱀눈초리|glare/.test(tags.raw) && !ally.status;
      const wantsPoison = /poison|독가루|독독/.test(tags.raw) && !ally.status;
      const wantsBurn = /burn|화상/.test(tags.raw) && !ally.status;
      const wantsConfuse = /혼란|confus/.test(tags.raw) && ally.volatile?.confusionTurns <= 0;
      if (canSeed) score += 34;
      if (wantsSleep) score += 42;
      if (wantsPara) score += 28;
      if (wantsPoison) score += 24;
      if (wantsBurn) score += 22;
      if (wantsConfuse) score += 16;
      if (ally.status && !canSeed && !wantsConfuse) score -= 20;
    }

    if (tags.isSetup) {
      const intents = parseMoveStageIntent(move);
      let setupScore = 0;
      intents.forEach((intent) => {
        const target = intent.who === 'user' ? enemy : ally;
        const room = stageHeadroom(target, intent.statKey, intent.delta);
        if (room <= 0) return;
        if (intent.who === 'user' && intent.delta > 0) {
          const weight = { attack: 18, spAttack: 18, speed: 16, defense: 12, spDefense: 12, accuracy: 10 }[intent.statKey] || 8;
          setupScore += weight * Math.min(room, Math.abs(intent.delta)) * intent.chance;
        } else if (intent.who === 'target' && intent.delta < 0) {
          const weight = { defense: 16, spDefense: 16, attack: 13, speed: 14, accuracy: 12, evasion: 12 }[intent.statKey] || 8;
          setupScore += weight * Math.min(room, Math.abs(intent.delta)) * intent.chance;
        }
      });
      if (enemyHpRatio >= 0.55 && allyHpRatio >= 0.35) score += setupScore;
      else score += setupScore * 0.45;
    }

    if (tags.isProtect) {
      const chain = Number(enemy?.volatile?.protectChain || 0);
      if (chain > 0) score -= 60;
      if (enemyHpRatio <= 0.2 && (enemy.status === 'poison' || enemy.status === 'burn' || ally.volatile?.leechSeed || enemy.volatile?.aquaRing)) score += 18;
      else score -= 16;
    }

    if (tags.isWeather) {
      if (/rain_dance|비바라기/.test(tags.raw) && enemy.currentTypes?.includes('물')) score += 18;
      else if (/hail|싸라기눈/.test(tags.raw) && enemy.currentTypes?.includes('얼음')) score += 18;
      else score -= 8;
      if (state.weather) score -= 12;
    }

    score -= getEnemyAiPenalty(enemy, index);
    return score;
  }

  function chooseEnemyMove() {
    const enemy = getActive('enemy');
    const ally = getActive('ally');
    if (!enemy || !ally) return 0;
    const scored = [];
    (enemy.moves || []).forEach((move, index) => {
      const score = scoreEnemyMove(enemy, ally, move, index);
      if (score > -Infinity) scored.push({ index, score });
    });
    if (!scored.length) return 0;
    scored.sort((a, b) => b.score - a.score);
    const top = scored[0];
    const runner = scored[1];
    let best = top.index;
    if (runner && top.index === (state.enemyAiMemory?.lastMoveIndex ?? null) && top.score - runner.score < 12) best = runner.index;
    const memory = state.enemyAiMemory || { userUid: null, lastMoveIndex: null, repeatCount: 0 };
    const sameUser = memory.userUid === enemy.uid;
    state.enemyAiMemory = {
      userUid: enemy.uid,
      lastMoveIndex: best,
      repeatCount: sameUser && memory.lastMoveIndex === best ? Number(memory.repeatCount || 0) + 1 : 1
    };
    return best;
  }


  function getBattleEntity(side) {
    const id = side === 'ally' ? state.playerId : state.opponentId;
    if (POKEBATTLE.league?.getPlayerOrNpc) {
      const entity = POKEBATTLE.league.getPlayerOrNpc(id);
      if (entity) return entity;
    }
    return POKEBATTLE.core?.getPlayer?.(id) || null;
  }

  function consumeBagItemForSide(side, itemId) {
    const entity = getBattleEntity(side);
    const bag = entity?.bag?.consumables;
    if (!Array.isArray(bag)) {
      // 온라인 PvP에서는 host 브라우저가 상대 플레이어의 실제 가방 객체를 갖고 있지 않다.
      // 상대가 자기 화면에서 보유 아이템을 선택해 Firebase로 보낸 행동은 여기서 효과만 적용한다.
      if (String(state.options?.mode || '').includes('online_pvp')) return true;
      return false;
    }
    const entry = bag.find((item) => String(item?.id || '').trim().toLowerCase() === String(itemId || '').trim().toLowerCase());
    if (!entry || Number(entry.amount || 0) <= 0) {
      if (String(state.options?.mode || '').includes('online_pvp')) return true;
      return false;
    }
    entry.amount -= 1;
    return true;
  }

  function refundBagItemForSide(side, itemId) {
    const entity = getBattleEntity(side);
    const bag = entity?.bag?.consumables;
    if (!Array.isArray(bag)) return false;
    const entry = bag.find((item) => String(item?.id || '').trim().toLowerCase() === String(itemId || '').trim().toLowerCase());
    if (!entry) return false;
    entry.amount = Number(entry.amount || 0) + 1;
    return true;
  }

  function bestAvailableSwitchIndexForEnemy() {
    const ally = getActive('ally');
    const bench = state.opponentTeam.map((pokemon, index) => ({ pokemon, index })).filter((entry) => entry.index !== state.enemyIndex && (entry.pokemon?.currentHp || 0) > 0);
    if (!bench.length || !ally) return -1;
    const scoreBench = (candidate) => {
      const allyThreat = Math.max(...(ally.moves || []).map((move) => getTypeEffectivenessValue(move.type, candidate)).concat([1]));
      const selfThreat = Math.max(...(candidate.moves || []).map((move) => getTypeEffectivenessValue(move.type, ally)).concat([1]));
      return (selfThreat * 10) - (allyThreat * 12) + effectiveStat(candidate, 'speed') / 100;
    };
    bench.sort((a, b) => scoreBench(b.pokemon) - scoreBench(a.pokemon));
    return bench[0]?.index ?? -1;
  }

  function shouldEnemyChampionSwitch() {
    if (!(state.options?.mode === 'league' && state.options?.leagueStage === 'champion')) return false;
    if (state.enemyStrategicSwitchUsed) return false;
    const enemy = getActive('enemy');
    const ally = getActive('ally');
    if (!enemy || !ally || enemy.currentHp <= 0 || ally.currentHp <= 0) return false;
    if (firstAvailableBenchIndex('enemy') < 0) return false;
    const myBest = Math.max(...(enemy.moves || []).map((move) => getTypeEffectivenessValue(move.type, ally)).concat([1]));
    const foeBest = Math.max(...(ally.moves || []).map((move) => getTypeEffectivenessValue(move.type, enemy)).concat([1]));
    return foeBest > 1 && (myBest <= 1 || enemy.currentHp <= Math.floor(enemy.maxHp * 0.35));
  }

  function shouldEnemyFreeSwitchAfterFaint() {
    const enemy = getActive('enemy');
    const ally = getActive('ally');
    if (!enemy || !ally || enemy.currentHp <= 0 || ally.currentHp <= 0) return false;
    if (firstAvailableBenchIndex('enemy') < 0) return false;
    const myBest = Math.max(...(enemy.moves || []).map((move) => getTypeEffectivenessValue(move.type, ally)).concat([1]));
    const foeBest = Math.max(...(ally.moves || []).map((move) => getTypeEffectivenessValue(move.type, enemy)).concat([1]));
    return foeBest > 1 && myBest <= 1;
  }

  function maybeHandlePostReplacementSwitch(replacedSide) {
    const responseSide = otherSide(replacedSide);
    if (firstAvailableBenchIndex(responseSide) < 0) {
      state.optionalSwitchSide = null;
      state.menu = 'root';
      state.turnSide = 'ally';
      return false;
    }
    if (state.options?.mode === 'friendly' && state.options?.isDuo) {
      const responseSide = otherSide(replacedSide);
      if (firstAvailableBenchIndex(responseSide) >= 0) {
        state.optionalSwitchSide = responseSide;
        state.turnSide = responseSide;
        state.menu = 'post-faint-switch';
      } else {
        state.optionalSwitchSide = null;
        state.menu = 'root';
        state.turnSide = 'ally';
      }
      state.waiting = false;
      return true;
    }
    if (state.options?.isDuo) {
      state.optionalSwitchSide = responseSide;
      state.turnSide = responseSide;
      state.menu = 'post-faint-switch';
      return true;
    }
    if (responseSide === 'ally') {
      state.optionalSwitchSide = 'ally';
      state.turnSide = 'ally';
      state.menu = 'post-faint-switch';
      return true;
    }
    if (shouldEnemyFreeSwitchAfterFaint()) {
      const switchIndex = bestAvailableSwitchIndexForEnemy();
      if (switchIndex >= 0) {
        state.enemyIndex = switchIndex;
        state.enemyStrategicSwitchUsed = true;
        pushLog(`${getActive('enemy').currentName}가 출전한다.`);
        return true;
      }
    }
    state.optionalSwitchSide = null;
    state.menu = 'root';
    state.turnSide = 'ally';
    return false;
  }

  function chooseEnemyAction() {
    const enemy = getActive('enemy');
    const enemyEntity = getBattleEntity('enemy');
    const ally = getActive('ally');
    const switchIndex = bestAvailableSwitchIndexForEnemy();
    if (switchIndex >= 0 && enemy && ally) {
      const enemyBest = Math.max(...(enemy.moves || []).map((move, idx) => scoreEnemyMove(enemy, ally, move, idx)).concat([-999]));
      const benchMon = state.opponentTeam[switchIndex];
      const benchBest = Math.max(...(benchMon?.moves || []).map((move) => scoreEnemyMove(benchMon, ally, move, -1)).concat([-999]));
      const foeBest = Math.max(...(ally.moves || []).map((move) => getTypeEffectivenessValue(move.type, enemy)).concat([1]));
      if (shouldEnemyChampionSwitch() || (benchBest > enemyBest + 22 && foeBest > 1 && (enemy.currentHp || 0) > Math.floor((enemy.maxHp || 1) * 0.2))) {
        return { type: 'switch', index: switchIndex };
      }
    }
    const canUsePotion = state.options?.mode === 'league' && state.options?.leagueStage === 'champion';
    if (canUsePotion && enemy && enemy.currentHp > 0) {
      const potion = enemyEntity?.bag?.consumables?.find((item) => String(item?.id || '').trim().toLowerCase() === 'good_potion' && Number(item.amount || 0) > 0);
      if (potion && enemy.currentHp < enemy.maxHp && enemy.currentHp <= Math.floor(enemy.maxHp * 0.4)) {
        return { type: 'item', itemId: 'good_potion', targetIndex: state.enemyIndex };
      }
    }
    return { type: 'move', index: chooseEnemyMove() };
  }

  function finishBattle(winnerId, loserId, fled = false) {
    clearDelayedActionTimer();
    const versusName = getTrainerName(state.opponentId);
    if (!fled && state.options?.leagueBattleId) {
      POKEBATTLE.league?.recordResult?.(state.options.leagueBattleId, winnerId, loserId, state.stats, false);
    }
    const applyPostBattleLevelReward = () => {
      if (fled || state.options?.skipLevelReward) return;
      const rewarded = new Set([state.playerId, state.opponentId].filter((id) => id === 'p1' || id === 'p2'));
      rewarded.forEach((id) => {
        POKEBATTLE.core?.levelUpWholeTeam?.(id, 16);
        POKEBATTLE.core?.healPlayerTeam?.(id);
      });
    };
    if (fled) pushLog('배틀에서 물러났다!');
    else if (winnerId === state.playerId) pushLog(`${versusName}와의 배틀에서 승리했다.`);
    else pushLog(`${versusName}와의 배틀에서 패배했다.`);
    if (!fled && winnerId === state.playerId) POKEBATTLE.ui?.playEffectSound?.('battle_win.mp3');
    if (!fled && winnerId !== state.playerId) POKEBATTLE.ui?.playEffectSound?.('fail.mp3');
    state.forceSwitch = false;
    state.forceSwitchSide = null;
    state.optionalSwitchSide = null;
    state.active = false;
    render();
    const payload = { winnerId, loserId, fled, stats: state.stats, options: state.options };
    const handled = state.options?.onComplete ? state.options.onComplete(payload) : false;
    if (handled) return;
    try { applyPostBattleLevelReward(); } catch (error) { console.warn('post battle reward failed', error); }
    if (POKEBATTLE.ui?.showBattleEndStats) {
      POKEBATTLE.ui.showBattleEndStats(payload);
      return;
    }
    POKEBATTLE.core.state.currentScreen = 'battle';
    render();
    return;
  }

  function resolveFaintsAfterSequence() {
    if (!hasAlive(state.playerTeam)) return finishBattle(state.opponentId, state.playerId) || true;
    if (!hasAlive(state.opponentTeam)) return finishBattle(state.playerId, state.opponentId) || true;
    if (isOnlinePvpMode()) return false;
    let replaced = false;
    if (getActive('ally')?.currentHp <= 0) replaced = maybeAutoSendNext('ally') || replaced;
    if (getActive('enemy')?.currentHp <= 0) replaced = maybeAutoSendNext('enemy') || replaced;
    return replaced;
  }

  async function resolveSingleTurn(playerMoveIndex) {
    const player = getActive('ally');
    const enemy = getActive('enemy');
    const enemyAction = chooseEnemyAction();
    const enemyMove = enemyAction?.type === 'move' ? enemyAction.index : null;
    const playerMove = player?.moves?.[playerMoveIndex];
    const enemyMoveObj = enemy?.moves?.[enemyMove];
    const playerPrio = getMovePriority(playerMove);
    const enemyPrio = enemyAction?.type === 'switch' ? 6 : (enemyAction?.type === 'item' ? 5 : getMovePriority(enemyMoveObj));
    const playerFirst = playerPrio === enemyPrio ? effectiveStat(player, 'speed') >= effectiveStat(enemy, 'speed') : playerPrio > enemyPrio;
    const order = playerFirst ? [['ally', { type: 'move', index: playerMoveIndex }], ['enemy', enemyAction]] : [['enemy', enemyAction], ['ally', { type: 'move', index: playerMoveIndex }]];
    for (let i = 0; i < order.length; i += 1) {
      const [side, action] = order[i];
      if (resolveFaintsAfterSequence()) { state.waiting = false; render(); return; }
      state.moveContext = { movesAfterTarget: i > 0, orderIndex: i, side };
      if (action?.type === 'item') {
        const team = getTeam(side);
        const target = team?.[Number.isInteger(action.targetIndex) ? action.targetIndex : (side === 'ally' ? state.allyIndex : state.enemyIndex)];
        if (consumeBagItemForSide(side, action.itemId)) {
          const result = POKEBATTLE.items?.applyConsumable?.({ itemId: action.itemId, pokemon: target, battleApi: { pushLog, addTempBattleBuff } });
          if (result?.ok) pushLog(`${getTrainerName(side === 'ally' ? state.playerId : state.opponentId)}는 ${result.message}`);
          else refundBagItemForSide(side, action.itemId);
        }
      } else if (action?.type === 'switch') {
        executeQueuedAction(side, action);
      } else {
        performMove(side, action?.index);
      }
      state.moveContext = null;
      render();
      await waitForFaintAnimationIfNeeded();
      if (resolveFaintsAfterSequence()) { state.waiting = false; render(); return; }
      if (i < order.length - 1 && !isOnlinePvpMode()) await sleep(TURN_TIMING.actionGap);
    }
    processEndTurn();
    render();
    await waitForFaintAnimationIfNeeded();
    if (TURN_TIMING.endTurnGap > 0) await sleep(TURN_TIMING.endTurnGap);
    if (resolveFaintsAfterSequence()) { state.waiting = false; render(); return; }
    state.waiting = false;
    render();
  }

  function actionPriority(action, side) {
    if (!action) return -1;
    if (action.type === 'switch') return 6;
    if (action.type === 'item') return 5;
    if (action.type === 'move') return 0;
    return 0;
  }

  function executeQueuedAction(side, action) {
    if (!action) return;
    if (action.type === 'switch') {
      const team = getTeam(side);
      if (side === 'ally') state.allyIndex = action.index;
      else { state.enemyIndex = action.index; state.enemyStrategicSwitchUsed = true; state.enemyAiMemory = { userUid: null, lastMoveIndex: null, repeatCount: 0 }; }
      pushLog(`${getActive(side).currentName}가 출전한다.`);
      return;
    }
    if (action.type === 'item') {
      const actor = getActive(side);
      const team = getTeam(side);
      const target = Number.isInteger(action.targetIndex) ? team?.[action.targetIndex] : actor;
      if (!consumeBagItemForSide(side, action.itemId)) return;
      const result = POKEBATTLE.items?.applyConsumable?.({ itemId: action.itemId, pokemon: target, moveIndex: action.moveIndex, battleApi: { pushLog, addTempBattleBuff } });
      if (!result?.ok) refundBagItemForSide(side, action.itemId);
      return;
    }
    if (action.type === 'move') performMove(side, action.index);
  }

  async function resolveDuoTurn() {
    state.waiting = true;
    state.menu = 'root';
    const allyAction = state.pendingActions.ally;
    const enemyAction = state.pendingActions.enemy;
    const allyMon = getActive('ally');
    const enemyMon = getActive('enemy');
    let order = ['ally', 'enemy'];
    const pA = actionPriority(allyAction, 'ally');
    const pE = actionPriority(enemyAction, 'enemy');
    if (pE > pA) order = ['enemy', 'ally'];
    else if (pA === pE) {
      const bothMoves = allyAction?.type === 'move' && enemyAction?.type === 'move';
      const bothSwitch = allyAction?.type === 'switch' && enemyAction?.type === 'switch';
      if (bothMoves || bothSwitch) {
        if (effectiveStat(enemyMon, 'speed') > effectiveStat(allyMon, 'speed')) order = ['enemy', 'ally'];
      }
    }
    for (let i = 0; i < order.length; i += 1) {
      const side = order[i];
      state.moveContext = { movesAfterTarget: i > 0, orderIndex: i, side };
      executeQueuedAction(side, state.pendingActions[side]);
      state.moveContext = null;
      render();
      await waitForFaintAnimationIfNeeded();
      if (resolveFaintsAfterSequence()) { state.pendingActions = { ally: null, enemy: null }; state.waiting = false; render(); return; }
      if (i < order.length - 1 && !isOnlinePvpMode()) await sleep(TURN_TIMING.actionGap);
    }
    processEndTurn();
    render();
    await waitForFaintAnimationIfNeeded();
    if (TURN_TIMING.endTurnGap > 0) await sleep(TURN_TIMING.endTurnGap);
    if (resolveFaintsAfterSequence()) { state.pendingActions = { ally: null, enemy: null }; state.waiting = false; render(); return; }
    state.pendingActions = { ally: null, enemy: null };
    state.weather = null;
    state.weatherTurns = 0;
    state.enemyStrategicSwitchUsed = false;
    state.turnSide = 'ally';
    state.waiting = false;
    render();
  }

  function passTurn() {
    state.turnSide = state.turnSide === 'ally' ? 'enemy' : 'ally';
    state.menu = 'root';
    render();
  }

  function queueDuoAction(side, action) {
    state.pendingActions[side] = action;
    if (state.pendingActions.ally && state.pendingActions.enemy) resolveDuoTurn();
    else passTurn();
  }

  function handleMove(index) {
    if (!state.active || state.waiting) return;
    state.menu = 'root';
    const side = currentActorSide();
    const locked = POKEBATTLE.items?.getLockedMoveIndex?.(getActive(side));
    if (locked != null && locked !== index) {
      pushLog(`${getActive(side)?.currentName || ''}는 지닌물건 때문에 같은 기술만 사용할 수 있다!`);
      render();
      return;
    }
    if (state.options?.isDuo) {
      queueDuoAction(side, { type: 'move', index });
      return;
    }
    state.waiting = true;
    render();
    invalidatePendingAction();
    const nonce = state.actionNonce;
    state.delayedActionTimer = setTimeout(() => {
      state.delayedActionTimer = null;
      if (!state.active || nonce !== state.actionNonce) return;
      resolveSingleTurn(index).catch((error) => { console.error(error); state.waiting = false; render(); });
    }, TURN_TIMING.postChoiceDelay);
  }

  function handleSwitch(index) {
    if (!state.active || state.waiting) return;
    const side = currentActorSide();
    const team = getTeam(side);
    const activeIndex = side === 'ally' ? state.allyIndex : state.enemyIndex;
    if (index === activeIndex || !team[index] || team[index].currentHp <= 0) return;
    const wasForceSwitch = state.forceSwitchSide === side;
    const wasOptionalSwitch = state.optionalSwitchSide === side;
    state.menu = 'root';
    if (state.options?.isDuo && !wasForceSwitch && !wasOptionalSwitch) {
      state.forceSwitch = false;
      queueDuoAction(side, { type: 'switch', index });
      return;
    }
    clearDelayedActionTimer();
    if (side === 'ally') state.allyIndex = index;
    else state.enemyIndex = index;
    POKEBATTLE.items?.clearChoiceLock?.(getActive(side));
    pushLog(`${getActive(side).currentName}가 출전한다.`);
    if (wasForceSwitch) {
      state.forceSwitch = false;
      state.forceSwitchSide = null;
      state.waiting = false;
      const foeSide = otherSide(side);
      const foe = getActive(foeSide);
      if (foe && foe.currentHp <= 0) {
        maybeAutoSendNext(foeSide);
      } else {
        maybeHandlePostReplacementSwitch(side);
      }
      render();
      return;
    }
    if (wasOptionalSwitch) {
      state.optionalSwitchSide = null;
      state.forceSwitch = false;
      state.forceSwitchSide = null;
      state.waiting = false;
      state.menu = 'root';
      state.turnSide = 'ally';
      render();
      return;
    }
    state.forceSwitch = false;
    state.forceSwitchSide = null;
    state.waiting = true;
    render();
    const nonce = state.actionNonce;
    state.delayedActionTimer = setTimeout(async () => {
      state.delayedActionTimer = null;
      if (!state.active || nonce !== state.actionNonce) return;
      const enemyMove = chooseEnemyMove();
      state.moveContext = { movesAfterTarget: true, side: 'enemy' };
      performMove('enemy', enemyMove);
      state.moveContext = null;
      processEndTurn();
      render();
      await waitForFaintAnimationIfNeeded();
      resolveFaintsAfterSequence();
      state.waiting = false;
      render();
    }, TURN_TIMING.actionGap);
  }

  function handlePostFaintChoice(choice) {
    const side = currentActorSide();
    if (state.optionalSwitchSide !== side) return;
    if (choice === 'switch') {
      state.menu = 'switch';
      render();
      return;
    }
    state.optionalSwitchSide = null;
    state.pendingActions = { ally: null, enemy: null };
    state.menu = 'root';
    state.turnSide = 'ally';
    state.waiting = false;
    render();
  }

  async function resolveEnemyResponseAfterItem(nonce) {
    const enemyMove = chooseEnemyMove();
    state.moveContext = { movesAfterTarget: true, side: 'enemy' };
    performMove('enemy', enemyMove);
    state.moveContext = null;
    processEndTurn();
    render();
    await waitForFaintAnimationIfNeeded();
    resolveFaintsAfterSequence();
    state.waiting = false;
    render();
  }

  function handleBagSelect(itemId) {
    if (!state.active || state.waiting) return;
    if (itemId === 'pp_aid' || itemId === 'pp_aide') {
      state.pendingBagItem = itemId;
      state.menu = 'bag-move-target';
      render();
      return;
    }
    const pokemonTargetItems = ['revive_shard', 'good_potion', 'recovery_potion', 'paralyze_heal', 'antidote', 'burn_heal', 'ice_heal', 'awakening_spray', 'reset_herb', 'plus_power', 'defend_up', 'special_up', 'special_guard', 'speed_up', 'critical_cutter', 'effect_guard'];
    if (pokemonTargetItems.includes(String(itemId || '').trim().toLowerCase())) {
      state.pendingBagItem = itemId;
      state.menu = 'bag-pokemon-target';
      render();
      return;
    }
    const side = currentActorSide();
    if (state.options?.isDuo) {
      queueDuoAction(side, { type: 'item', itemId });
      return;
    }
    const actorId = currentActorId();
    const actorSide = currentActorSide();
    if (!POKEBATTLE.core.consumeBagItem(actorId, itemId)) return;
    const result = POKEBATTLE.items?.applyConsumable?.({ itemId, pokemon: getActive(actorSide), battleApi: { pushLog, addTempBattleBuff } });
    if (!result?.ok) {
      POKEBATTLE.core.refundBagItem(actorId, itemId);
      POKEBATTLE.ui?.showToast?.(result?.message || '사용할 수 없습니다.');
      return;
    }
    state.waiting = true;
    state.menu = 'root';
    render();
    invalidatePendingAction();
    const nonce = state.actionNonce;
    state.delayedActionTimer = setTimeout(async () => {
      state.delayedActionTimer = null;
      if (!state.active || nonce !== state.actionNonce) return;
      try {
        await resolveEnemyResponseAfterItem(nonce);
      } catch (error) {
        console.error(error);
        state.waiting = false;
        render();
      }
    }, TURN_TIMING.actionGap);
  }

  function handleBagMoveTarget(index) {
    const itemId = state.pendingBagItem;
    if (!itemId || !state.active || state.waiting) return;
    const side = currentActorSide();
    state.pendingBagItem = null;
    state.pendingBagTargetIndex = null;
    if (state.options?.isDuo) {
      queueDuoAction(side, { type: 'item', itemId, moveIndex: index });
      return;
    }
    const actorId = currentActorId();
    const actorSide = currentActorSide();
    if (!POKEBATTLE.core.consumeBagItem(actorId, itemId)) return;
    const result = POKEBATTLE.items?.applyConsumable?.({ itemId, pokemon: getActive(actorSide), moveIndex: index, battleApi: { pushLog, addTempBattleBuff } });
    if (!result?.ok) {
      POKEBATTLE.core.refundBagItem(actorId, itemId);
      POKEBATTLE.ui?.showToast?.(result?.message || '사용할 수 없습니다.');
      return;
    }
    state.waiting = true;
    state.menu = 'root';
    render();
    invalidatePendingAction();
    const nonce = state.actionNonce;
    state.delayedActionTimer = setTimeout(async () => {
      state.delayedActionTimer = null;
      if (!state.active || nonce !== state.actionNonce) return;
      try {
        await resolveEnemyResponseAfterItem(nonce);
      } catch (error) {
        console.error(error);
        state.waiting = false;
        render();
      }
    }, TURN_TIMING.actionGap);
  }

  function handleBagPokemonTarget(index) {
    const itemId = state.pendingBagItem;
    if (!itemId || !state.active || state.waiting) return;
    const side = currentActorSide();
    state.pendingBagItem = null;
    state.pendingBagTargetIndex = null;
    const team = getTeam(side);
    const target = team?.[index];
    if (!target) return;
    if (state.options?.isDuo) {
      queueDuoAction(side, { type: 'item', itemId, targetIndex: index });
      return;
    }
    const actorId = currentActorId();
    if (!POKEBATTLE.core.consumeBagItem(actorId, itemId)) return;
    const result = POKEBATTLE.items?.applyConsumable?.({ itemId, pokemon: target, battleApi: { pushLog, addTempBattleBuff } });
    if (!result?.ok) {
      POKEBATTLE.core.refundBagItem(actorId, itemId);
      POKEBATTLE.ui?.showToast?.(result?.message || '사용할 수 없습니다.');
      return;
    }
    state.waiting = true;
    state.menu = 'root';
    render();
    invalidatePendingAction();
    const nonce = state.actionNonce;
    state.delayedActionTimer = setTimeout(async () => {
      state.delayedActionTimer = null;
      if (!state.active || nonce !== state.actionNonce) return;
      try {
        await resolveEnemyResponseAfterItem(nonce);
      } catch (error) {
        console.error(error);
        state.waiting = false;
        render();
      }
    }, TURN_TIMING.actionGap);
  }


  function pvpSerializePokemon(pokemon) {
    if (!pokemon) return null;
    return {
      uid: pokemon.uid || '',
      sourceUid: pokemon.sourceUid || '',
      baseId: Number(pokemon.base?.id || pokemon.baseId || pokemon.id || 0),
      name: pokemon.currentName || pokemon.name || pokemon.base?.nameKo || '포켓몬',
      level: Math.min(100, Number(pokemon.level || 5)),
      maxHp: Number(pokemon.maxHp || pokemon.hp || pokemon.stats?.hp || 1),
      currentHp: Math.max(0, Number(pokemon.currentHp ?? pokemon.maxHp ?? 1)),
      status: pokemon.status || '',
      bloodline: pokemon.bloodline || 'normal',
      enhanceLevel: Number(pokemon.enhanceLevel || 0),
      statStages: { ...(pokemon.statStages || {}) },
      volatile: { ...(pokemon.volatile || {}) },
      tempBattleBuffs: { ...(pokemon.tempBattleBuffs || {}) },
      stats: { ...(pokemon.stats || {}) },
      heldItems: (pokemon.heldItems || (pokemon.heldItem ? [pokemon.heldItem] : [])).map((it) => ({ ...(it || {}) })),
      moves: (pokemon.moves || []).map((m) => ({ ...(m || {}) }))
    };
  }

  function pvpApplyPokemonData(target, data) {
    if (!target || !data) return target;
    target.uid = data.uid || target.uid;
    target.sourceUid = data.sourceUid || target.sourceUid;
    target.currentName = data.name || target.currentName || target.base?.nameKo;
    target.level = Math.min(100, Number(data.level || target.level || 5));
    if (data.bloodline) target.bloodline = data.bloodline;
    target.enhanceLevel = Number(data.enhanceLevel || target.enhanceLevel || 0);
    if (data.stats) target.stats = { ...(target.stats || {}), ...data.stats };
    target.maxHp = Number(data.maxHp || target.maxHp || 1);
    target.currentHp = Math.max(0, Math.min(target.maxHp, Number(data.currentHp ?? target.currentHp ?? target.maxHp)));
    target.status = data.status || '';
    target.statStages = { ...(data.statStages || {}) };
    target.volatile = { ...(target.volatile || {}), ...(data.volatile || {}) };
    target.tempBattleBuffs = { ...(data.tempBattleBuffs || {}) };
    if (Array.isArray(data.heldItems)) { target.heldItems = data.heldItems.map((it) => ({ ...it })); target.heldItem = target.heldItems[0] || null; }
    if (Array.isArray(data.moves)) {
      target.moves = data.moves.map((m, i) => ({ ...(target.moves?.[i] || {}), ...m }));
    }
    return target;
  }

  function pvpApplyTeamData(existing, list) {
    const core = POKEBATTLE.core;
    const out = [];
    (list || []).forEach((data, index) => {
      let target = existing?.[index] || null;
      const currentBaseId = Number(target?.base?.id || 0);
      if (!target || (data.baseId && currentBaseId && Number(data.baseId) !== currentBaseId)) {
        const base = core?.state?.pokemonById?.get?.(Number(data.baseId));
        if (base && core?.createRuntimePokemon) target = core.createRuntimePokemon(base, Number(data.level || 5));
      }
      if (target) out.push(pvpApplyPokemonData(target, data));
    });
    return out;
  }

  function exportPvpSyncState() {
    return {
      version: 2,
      active: !!state.active,
      battleId: Number.isFinite(Number(state.battleId)) ? Number(state.battleId) : 0,
      playerId: state.playerId,
      opponentId: state.opponentId,
      allyIndex: Number(state.allyIndex || 0),
      enemyIndex: Number(state.enemyIndex || 0),
      playerTeam: (state.playerTeam || []).map(pvpSerializePokemon),
      opponentTeam: (state.opponentTeam || []).map(pvpSerializePokemon),
      log: (state.log || []).slice(-24),
      stats: JSON.parse(JSON.stringify(state.stats || {})),
      weather: state.weather || null,
      weatherTurns: Number(state.weatherTurns || 0),
      uiEffects: (state.lastConsumedUiEffects || []).map((effect) => ({ ...(effect || {}) })),
      completed: !state.active,
      updatedAt: Date.now()
    };
  }

  function importPvpSyncState(sync, opts = {}) {
    if (!sync) return false;
    const reverse = !!opts.reverse;
    const localPlayerTeam = reverse ? sync.opponentTeam : sync.playerTeam;
    const localOpponentTeam = reverse ? sync.playerTeam : sync.opponentTeam;
    state.playerTeam = pvpApplyTeamData(state.playerTeam, localPlayerTeam);
    state.opponentTeam = pvpApplyTeamData(state.opponentTeam, localOpponentTeam);
    state.allyIndex = Math.max(0, Number(reverse ? sync.enemyIndex : sync.allyIndex) || 0);
    state.enemyIndex = Math.max(0, Number(reverse ? sync.allyIndex : sync.enemyIndex) || 0);
    state.log = (sync.log || []).slice(-24);
    state.stats = JSON.parse(JSON.stringify(sync.stats || state.stats || {}));
    state.weather = sync.weather || null;
    state.weatherTurns = Number(sync.weatherTurns || 0);
    if (Array.isArray(sync.uiEffects) && sync.uiEffects.length) {
      const mapped = sync.uiEffects.map((effect) => {
        const out = { ...(effect || {}) };
        if (reverse && (out.target === 'ally' || out.target === 'enemy')) out.target = out.target === 'ally' ? 'enemy' : 'ally';
        return out;
      });
      state.uiEffects.push(...mapped);
    }
    state.menu = 'root';
    state.waiting = false;
    state.forceSwitch = false;
    state.forceSwitchSide = null;
    state.optionalSwitchSide = null;
    state.turnSide = 'ally';
    state.active = !sync.completed && (state.playerTeam || []).some((p) => p.currentHp > 0) && (state.opponentTeam || []).some((p) => p.currentHp > 0);
    render();
    return true;
  }

  function normalizePvpAction(action) {
    const a = action || {};
    const type = a.type || a.kind;
    if (type === 'move') return { type: 'move', index: Number(a.index ?? a.moveIndex ?? 0) };
    if (type === 'switch') return { type: 'switch', index: Number(a.index ?? a.to ?? 0) };
    if (type === 'item') return { type: 'item', itemId: a.itemId, targetIndex: Number.isInteger(a.targetIndex) ? a.targetIndex : undefined, moveIndex: Number.isInteger(a.moveIndex) ? a.moveIndex : undefined };
    return { type: 'move', index: 0 };
  }

  async function resolvePvpSyncedTurn(allyAction, enemyAction) {
    if (!state.active) return exportPvpSyncState();
    clearDelayedActionTimer();
    state.lastConsumedUiEffects = [];
    state.options = { ...(state.options || {}), isDuo: true, mode: state.options?.mode || 'pvp' };
    state.pendingActions = { ally: normalizePvpAction(allyAction), enemy: normalizePvpAction(enemyAction) };
    state.menu = 'root';
    state.turnSide = 'ally';
    state.waiting = true;
    await resolveDuoTurn();
    return exportPvpSyncState();
  }

  function setPvpWaiting(message) {
    state.waiting = true;
    state.menu = 'root';
    if (message) pushLog(message);
    render();
  }

  function clearPvpWaiting() {
    state.waiting = false;
    state.menu = 'root';
    render();
  }


  POKEBATTLE.battleEngine = {
    version: 'phase1-bw-engine',
    ready: true,
    startBattle,
    getSnapshot,
    getBattleStatSheet,
    handleRootAction,
    handleMove,
    handleSwitch,
    handleBagSelect,
    handleBagMoveTarget,
    handleBagPokemonTarget,
    handlePostFaintChoice,
    setMenu,
    toggleMoveInfo,
    consumeUiEffects,
    getTypeEffectivenessValue,
    exportPvpSyncState,
    importPvpSyncState,
    resolvePvpSyncedTurn,
    setPvpWaiting,
    clearPvpWaiting
  };
})();
