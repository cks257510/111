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
    showMoveInfo: false,
    pendingBagItem: null,
    pendingBagTargetIndex: null,
    waiting: false,
    uiEffects: [],
    log: [],
    options: null,
    stats: {},
    turnSide: 'ally',
    pendingActions: { ally: null, enemy: null },
    delayedActionTimer: null,
    actionNonce: 0,
    moveContext: null
  };

  function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
  function aliveIndex(team) { return team.findIndex((p) => (p?.currentHp || 0) > 0); }
  function hasAlive(team) { return team.some((p) => (p?.currentHp || 0) > 0); }
  function getActive(side) { return side === 'ally' ? state.playerTeam[state.allyIndex] : state.opponentTeam[state.enemyIndex]; }
  function getTeam(side) { return side === 'ally' ? state.playerTeam : state.opponentTeam; }
  function currentActorSide() { return state.options?.isDuo ? state.turnSide : 'ally'; }
  function currentActorId() { return currentActorSide() === 'ally' ? state.playerId : state.opponentId; }

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
    actionGap: 700,
    endTurnGap: 0,
    postChoiceDelay: 140,
    faintPause: 1850
  };

  function queueEffect(effect) {
    state.uiEffects.push(effect);
  }

  function consumeUiEffects() {
    const out = state.uiEffects.slice();
    state.uiEffects.length = 0;
    return out;
  }

  function getHeldItems(pokemon) {
    if (Array.isArray(pokemon?.heldItems) && pokemon.heldItems.length) return pokemon.heldItems.filter(Boolean);
    if (pokemon?.heldItem) return [pokemon.heldItem];
    return [];
  }

  async function waitForFaintAnimationIfNeeded() {
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
    pokemon.volatile = {
      ...(pokemon.volatile || {}),
      protect: false,
      leechSeed: false,
      confusionTurns: 0,
      grounded: Boolean(pokemon.volatile?.grounded)
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
      name: pokemon.currentName,
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
      forceSwitch: state.forceSwitch,
      showMoveInfo: state.showMoveInfo,
      mode: state.options?.mode || 'quick',
      log: state.log.slice(-3),
      turnSide: currentActorSide(),
      turnLabel: state.options?.isDuo ? `${getTrainerName(currentActorId())}의 턴` : '',
      trainerIntroSrc: state.options?.trainerIntroSrc || null,
      specialBgm: state.options?.specialBgm || null,
      battleId: state.battleId,
      theme: state.options?.theme || null
    };
  }

  function startBattle(options) {
    const core = POKEBATTLE.core;
    const playerEntity = options.playerTeam ? { id: options.playerId, name: options.playerName || getTrainerName(options.playerId), squad: options.playerTeam } : (POKEBATTLE.league?.getPlayerOrNpc ? POKEBATTLE.league.getPlayerOrNpc(options.playerId) : core.getPlayer(options.playerId));
    const opponentEntity = options.opponentTeam ? { id: options.opponentId || 'dungeon_enemy', name: options.opponentName || '던전 트레이너', squad: options.opponentTeam } : (POKEBATTLE.league?.getPlayerOrNpc ? POKEBATTLE.league.getPlayerOrNpc(options.opponentId) : core.getPlayer(options.opponentId));
    if (!playerEntity || !opponentEntity) return false;
    state.active = true;
    state.battleId += 1;
    state.playerId = options.playerId || playerEntity.id;
    state.opponentId = options.opponentId || opponentEntity.id;
    state.playerTeam = playerEntity.squad || [];
    state.opponentTeam = opponentEntity.squad || [];
    state.allyIndex = Math.max(0, aliveIndex(state.playerTeam));
    state.enemyIndex = Math.max(0, aliveIndex(state.opponentTeam));
    state.menu = 'root';
    state.forceSwitch = false;
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
    else if (action === 'run' && (state.options?.mode || 'quick') === 'quick') finishBattle(state.opponentId, state.playerId, true);
  }

  function addTempBattleBuff(pokemon, buffKey, turns) {
    pokemon.tempBattleBuffs = pokemon.tempBattleBuffs || {};
    pokemon.tempBattleBuffs[buffKey] = turns;
  }

  function applyStageChange(target, key, amount, keyLabel) {
    const before = Number(target.statStages?.[key] || 0);
    const after = clamp(before + amount, -6, 6);
    target.statStages[key] = after;
    if (after === before) return;
    if (amount >= 2) pushLog(`${target.currentName}의 ${keyLabel}가 크게 올랐다!`);
    else if (amount === 1) pushLog(`${target.currentName}의 ${keyLabel}가 올랐다!`);
    else if (amount <= -2) pushLog(`${target.currentName}의 ${keyLabel}가 크게 떨어졌다!`);
    else pushLog(`${target.currentName}의 ${keyLabel}가 떨어졌다!`);
  }

  function applyStatus(target, status, move = null) {
    if (target.currentHp <= 0) return false;
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
    if (target.volatile.confusionTurns > 0) return false;
    target.volatile.confusionTurns = 2 + Math.floor(Math.random() * 3);
    pushLog(`${target.currentName}는 혼란에 빠졌다!`);
    return true;
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

  function applyMoveEffects(attacker, defender, move, dealtDamage) {
    const raw = `${move.nameKo || ''} ${move.logicRef || ''} ${move.logicExplanation || ''} ${move.description || ''}`;
    if ((/흡수|메가드레인|drain|HP를 흡수/.test(raw)) && dealtDamage > 0) {
      healUser(attacker, Math.max(1, Math.floor(dealtDamage / 2)), 'drain');
    }
    if ((/광합성|회복|recover|synthesis/.test(raw)) && (move.category === '변화' || move.power == null)) {
      healUser(attacker, Math.max(1, Math.floor(attacker.maxHp / 2)), 'heal');
    }
    if ((/씨뿌리기|leech_seed/.test(raw)) && !defender.currentTypes.includes('풀')) {
      defender.volatile.leechSeed = true;
      pushLog(`${defender.currentName}에게 씨앗이 심어졌다!`);
    }
    if (/방어/.test(move.nameKo || '')) {
      attacker.volatile.protect = true;
      pushLog(`${attacker.currentName}는 방어 자세를 취했다!`);
    }
    if (/수면가루|sleep_powder/.test(raw)) applyStatus(defender, 'sleep', move);
    if (/전기자석파|저리가루|stun_spore|paralyze/.test(raw)) applyStatus(defender, 'paralysis', move);
    if (/독가루|독독|poison/.test(raw) && move.category === '변화') applyStatus(defender, 'poison', move);
    if (/화상|will_o_wisp|불꽃세례|burn/.test(raw) && !/화상치료/.test(raw)) applyStatus(defender, 'burn', move);
    if (/혼란|초음파|confuse/.test(raw)) applyConfusion(defender);
    if (/용의춤/.test(raw)) {
      applyStageChange(attacker, 'attack', 1, '공격', attacker);
      applyStageChange(attacker, 'speed', 1, '스피드', attacker);
    }
    if (/울음소리/.test(raw)) applyStageChange(defender, 'attack', -1, '공격', attacker);
    if (/연막|smokescreen/.test(raw)) applyStageChange(defender, 'accuracy', -1, '명중률', attacker);
    if (/철벽|코스믹파워/.test(raw)) applyStageChange(attacker, 'defense', 2, '방어', attacker);
    if (/명상|calm mind/i.test(raw)) { applyStageChange(attacker, 'spAttack', 1, '특수공격'); applyStageChange(attacker, 'spDefense', 1, '특수방어'); }
    if (/칼춤|swords dance/i.test(raw)) applyStageChange(attacker, 'attack', 2, '공격', attacker);
    if (/고속이동/.test(raw)) applyStageChange(attacker, 'speed', 2, '스피드', attacker);
    if (/반동/.test(raw) && dealtDamage > 0) {
      const recoil = Math.max(1, Math.floor(dealtDamage / 4));
      attacker.currentHp = Math.max(0, attacker.currentHp - recoil);
      pushLog(`${attacker.currentName}는 반동으로 ${recoil} 피해를 입었다!`);
    }
  }

  function applyDamage(defender, attacker, amount, side, cause = 'direct') {
    const damage = Math.max(0, Math.floor(amount || 0));
    if (damage <= 0) return { fainted: false, actualDamage: 0 };
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
    const move = attacker.moves?.[moveIndex];
    if (!move || move.currentPP <= 0) return { fainted: false };

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

    move.currentPP = Math.max(0, move.currentPP - 1);
    POKEBATTLE.items?.enforceChoiceLock?.(attacker, moveIndex);
    pushLog(`${attacker.currentName}의 ${move.nameKo}!`);

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
    POKEBATTLE.items?.afterMoveDamage?.(attacker, totalDamage, { pushLog });
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
  }

  function maybeAutoSendNext(side) {
    invalidatePendingAction();
    const team = getTeam(side);
    const next = aliveIndex(team);
    if (next < 0) return false;
    if (side === 'ally' && (state.playerId === 'p1' || state.playerId === 'p2')) {
      state.forceSwitch = true;
      state.menu = 'switch';
      return true;
    }
    if (side === 'ally') state.allyIndex = next;
    else state.enemyIndex = next;
    state.forceSwitch = false;
    pushLog(`${team[next].currentName}가 출전한다.`);
    return true;
  }

  function chooseEnemyMove() {
    const enemy = getActive('enemy');
    const ally = getActive('ally');
    if (!enemy || !ally) return 0;
    let best = 0;
    let bestScore = -Infinity;
    (enemy.moves || []).forEach((move, index) => {
      if (!move || (move.currentPP || 0) <= 0) return;
      const boostedPower = getBoostedMovePower(enemy, move, move.power || 0);
      const effectiveness = getTypeEffectivenessValue(move.type, ally);
      let score = boostedPower > 0 ? boostedPower * Math.max(0.25, effectiveness) : 20;
      if (/물리/.test(String(move.category || '')) && enemy.status === 'burn') score *= 0.6;
      if (/회복|흡수|드레인|기가드레인|메가드레인/.test(`${move.nameKo || ''} ${move.description || ''}`) && enemy.currentHp <= enemy.maxHp * 0.55) score += 22;
      if (/수면|독|마비|혼란|씨뿌리기/.test(`${move.nameKo || ''} ${move.description || ''}`) && !ally.status) score += 25;
      if (effectiveness === 0) score -= 200;
      if (score > bestScore) {
        bestScore = score;
        best = index;
      }
    });
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
    if (!Array.isArray(bag)) return false;
    const entry = bag.find((item) => String(item?.id || '').trim().toLowerCase() === String(itemId || '').trim().toLowerCase());
    if (!entry || Number(entry.amount || 0) <= 0) return false;
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

  function chooseEnemyAction() {
    const enemy = getActive('enemy');
    const enemyEntity = getBattleEntity('enemy');
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
    if (!fled && winnerId !== state.playerId) setTimeout(() => POKEBATTLE.ui?.playEffectSound?.('fail.mp3'), 500);
    state.active = false;
    render();
    const payload = { winnerId, loserId, fled, stats: state.stats, options: state.options };
    const handled = state.options?.onComplete ? state.options.onComplete(payload) : false;
    if (handled) return;
    const isLeague = state.options?.mode === 'league';
    if (isLeague && !fled) {
      const reward = winnerId === state.playerId ? 100 : 50;
      POKEBATTLE.core?.addMoney?.(state.playerId, reward);
      if (winnerId === state.playerId) pushLog(`${versusName} 와(과)의 배틀에서 승리했습니다! 보상으로 $${reward}을 얻었습니다. 5초 후 로비화면으로 이동합니다.`);
      else pushLog(`${versusName} 와(과)의 배틀에서 패배했습니다. 보상으로 $${reward}을 얻었습니다. 5초 후 로비화면으로 이동합니다.`);
      render();
      setTimeout(() => {
        applyPostBattleLevelReward();
        POKEBATTLE.core.state.currentScreen = 'lobby';
        POKEBATTLE.ui?.renderAll?.();
      }, 5000);
      return;
    }
    setTimeout(() => {
      applyPostBattleLevelReward();
      POKEBATTLE.core.state.currentScreen = 'lobby';
      POKEBATTLE.ui?.renderAll?.();
    }, 1000);
  }

  function resolveFaintsAfterSequence() {
    if (!hasAlive(state.playerTeam)) return finishBattle(state.opponentId, state.playerId) || true;
    if (!hasAlive(state.opponentTeam)) return finishBattle(state.playerId, state.opponentId) || true;
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
    const enemyPrio = enemyAction?.type === 'item' ? 6 : getMovePriority(enemyMoveObj);
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
      } else {
        performMove(side, action?.index);
      }
      state.moveContext = null;
      render();
      await waitForFaintAnimationIfNeeded();
      if (resolveFaintsAfterSequence()) { state.waiting = false; render(); return; }
      if (i < order.length - 1) await sleep(TURN_TIMING.actionGap);
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
      else state.enemyIndex = action.index;
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
    else if (pA === pE && allyAction?.type === 'move' && enemyAction?.type === 'move') {
      if (effectiveStat(enemyMon, 'speed') > effectiveStat(allyMon, 'speed')) order = ['enemy', 'ally'];
    }
    for (let i = 0; i < order.length; i += 1) {
      const side = order[i];
      state.moveContext = { movesAfterTarget: i > 0, orderIndex: i, side };
      executeQueuedAction(side, state.pendingActions[side]);
      state.moveContext = null;
      render();
      await waitForFaintAnimationIfNeeded();
      if (resolveFaintsAfterSequence()) { state.pendingActions = { ally: null, enemy: null }; state.turnSide = 'ally'; state.waiting = false; render(); return; }
      if (i < order.length - 1) await sleep(TURN_TIMING.actionGap);
    }
    processEndTurn();
    render();
    await waitForFaintAnimationIfNeeded();
    if (TURN_TIMING.endTurnGap > 0) await sleep(TURN_TIMING.endTurnGap);
    if (resolveFaintsAfterSequence()) { state.pendingActions = { ally: null, enemy: null }; state.turnSide = 'ally'; state.waiting = false; render(); return; }
    state.pendingActions = { ally: null, enemy: null };
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
    const wasForceSwitch = Boolean(state.forceSwitch);
    state.menu = 'root';
    if (state.options?.isDuo) {
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
      state.waiting = false;
      state.menu = 'root';
      state.turnSide = side;
      render();
      return;
    }
    state.forceSwitch = false;
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
    if (itemId === 'revive_shard') {
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
    setMenu,
    toggleMoveInfo,
    consumeUiEffects,
    getTypeEffectivenessValue
  };
})();
