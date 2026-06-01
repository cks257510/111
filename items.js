(function () {
  'use strict';

  const POKEBATTLE = window.POKEBATTLE || (window.POKEBATTLE = {});

  const TYPE_ITEM_MULTIPLIERS = {
    black_glasses: '악',
    black_belt: '격투',
    sharp_beak: '비행',
    charcoal: '불꽃',
    mystic_water: '물',
    miracle_seed: '풀',
    poison_barb: '독'
  };

  function normalizeId(id) {
    return String(id || '').trim().toLowerCase();
  }

  function getEffectiveItems(holder) {
    if (Array.isArray(holder?.heldItems) && holder.heldItems.length) return holder.heldItems.filter(Boolean);
    if (holder?.heldItem) return [holder.heldItem];
    return [];
  }

  function getEffectiveItemIds(holder) {
    return getEffectiveItems(holder).map((item) => normalizeId(item?.id));
  }

  function getEffectiveItemId(holder) {
    return getEffectiveItemIds(holder)[0] || '';
  }

  function getSpeedMultiplier(holder) {
    return getEffectiveItemIds(holder).reduce((multiplier, itemId) => {
      if (itemId === 'choice_scarf') multiplier *= 1.5;
      return multiplier;
    }, 1);
  }

  function getAttackMultiplier(holder, move) {
    const name = String(holder?.currentName || holder?.name || holder?.base?.nameKo || '');
    return getEffectiveItemIds(holder).reduce((multiplier, itemId) => {
      if (itemId === 'choice_band' && move?.category === '물리') multiplier *= 1.5;
      if (itemId === 'light_ball' && name.includes('피카츄') && move?.category === '물리') multiplier *= 2;
      return multiplier;
    }, 1);
  }

  function getSpecialAttackMultiplier(holder, move) {
    const name = String(holder?.currentName || holder?.name || holder?.base?.nameKo || '');
    return getEffectiveItemIds(holder).reduce((multiplier, itemId) => {
      if (itemId === 'choice_specs' && move?.category === '특수') multiplier *= 1.5;
      if (itemId === 'light_ball' && name.includes('피카츄') && move?.category === '특수') multiplier *= 2;
      return multiplier;
    }, 1);
  }

  function getAccuracyMultiplier(holder, context) {
    return getEffectiveItemIds(holder).reduce((multiplier, itemId) => {
      if (itemId === 'zoom_lens' && context?.movesAfterTarget) multiplier *= 1.2;
      return multiplier;
    }, 1);
  }

  function getDamageMultiplier(holder, move, context) {
    return getEffectiveItemIds(holder).reduce((multiplier, itemId) => {
      if (itemId === 'life_orb') multiplier *= 1.3;
      if (itemId === 'expert_belt' && Number(context?.effectiveness || 1) > 1) multiplier *= 1.2;
      if (itemId === 'muscle_band' && move?.category === '물리') multiplier *= 1.1;
      if (itemId === 'wise_glasses' && move?.category === '특수') multiplier *= 1.1;
      const typed = TYPE_ITEM_MULTIPLIERS[itemId];
      if (typed && move?.type === typed) multiplier *= 1.2;
      return multiplier;
    }, 1);
  }

  function canApplyStatusByItem(defender, move) {
    if (move?.category !== '변화') return true;
    return !getEffectiveItemIds(defender).includes('effect_guard');
  }

  function grantsGroundImmunity(holder) {
    return getEffectiveItemIds(holder).includes('air_balloon') && !holder?.volatile?.balloonPopped;
  }

  function enforceChoiceLock(holder, moveIndex) {
    if (!getEffectiveItemIds(holder).some((itemId) => ['choice_band', 'choice_specs', 'choice_scarf'].includes(itemId))) return;
    if (holder.flags.lockedMoveIndex == null) {
      holder.flags.lockedMoveIndex = moveIndex;
    }
  }

  function getLockedMoveIndex(holder) {
    if (!getEffectiveItemIds(holder).some((itemId) => ['choice_band', 'choice_specs', 'choice_scarf'].includes(itemId))) return null;
    return Number.isInteger(holder?.flags?.lockedMoveIndex) ? holder.flags.lockedMoveIndex : null;
  }

  function clearChoiceLock(holder) {
    if (holder?.flags) holder.flags.lockedMoveIndex = null;
  }

  function onDamaged(holder, battleApi, cause) {
    const itemIds = getEffectiveItemIds(holder);
    if (itemIds.includes('air_balloon') && !holder.volatile.balloonPopped && cause !== 'indirect') {
      holder.volatile.balloonPopped = true;
      battleApi?.pushLog?.(`${holder.currentName || holder.name || holder.base?.nameKo || '포켓몬'}의 풍선이 터졌다!`);
    }

    if (itemIds.includes('sitrus_berry') && !holder.flags.sitrusUsed && holder.currentHp > 0 && holder.currentHp <= Math.floor(holder.maxHp / 2)) {
      const heal = Math.max(1, Math.floor(holder.maxHp * 0.25));
      holder.currentHp = Math.min(holder.maxHp, holder.currentHp + heal);
      holder.flags.sitrusUsed = true;
      battleApi?.pushLog?.(`${holder.currentName || holder.name || holder.base?.nameKo || '포켓몬'}는 자뭉열매로 HP를 ${heal} 회복했다!`);
    }
  }

  function afterMoveDamage(holder, dealtDamage, battleApi) {
    const itemIds = getEffectiveItemIds(holder);
    if (itemIds.includes('life_orb') && dealtDamage > 0 && holder.currentHp > 0) {
      const recoil = Math.max(1, Math.floor(holder.maxHp * 0.1));
      holder.currentHp = Math.max(0, holder.currentHp - recoil);
      battleApi?.pushLog?.(`${holder.currentName || holder.name || holder.base?.nameKo || '포켓몬'}는 생명의구슬 반동으로 ${recoil} 피해를 입었다!`);
    }
  }

  function getDisplaySummary(item) {
    if (!item) return '장착된 지닌물건 없음';
    return item.battleEffect || item.description || item.nameKo;
  }

  function isConsumable(itemId) {
    return ['pp_aid', 'pp_aide', 'paralyze_heal', 'antidote', 'burn_heal', 'ice_heal', 'awakening_spray', 'revive_shard', 'reset_herb', 'rare_candy', 'plus_power', 'defend_up', 'special_up', 'special_guard', 'speed_up', 'critical_cutter', 'effect_guard', 'good_potion', 'recovery_potion', 'auto_dungeon_ticket'].includes(normalizeId(itemId));
  }


  function applyBattleToolBuff(pokemon, battleApi, buffKey, label) {
    battleApi?.addTempBattleBuff?.(pokemon, buffKey, 3);
    return { ok: true, message: `${pokemon.name}에게 ${label} 효과가 3턴 동안 적용됩니다.` };
  }


  function holderHasItem(holder, itemId) {
    return getEffectiveItemIds(holder).includes(normalizeId(itemId));
  }

  function preventLethal(holder, cause) {
    if (cause !== 'direct') return false;
    if (!holder || holder.currentHp !== holder.maxHp) return false;
    if (!holder.flags) holder.flags = {};
    if (holder.flags.focusSashUsed) return false;
    if (!holderHasItem(holder, 'focus_sash')) return false;
    holder.flags.focusSashUsed = true;
    return true;
  }

  function applyEndTurnHeldItem(holder, battleApi) {
    if (!holder || holder.currentHp <= 0) return;
    const itemIds = getEffectiveItemIds(holder);
    const name = holder.currentName || holder.name || holder.base?.nameKo || '포켓몬';
    if (itemIds.includes('leftovers') && holder.currentHp < holder.maxHp) {
      const heal = Math.max(1, Math.floor(holder.maxHp / 16));
      holder.currentHp = Math.min(holder.maxHp, holder.currentHp + heal);
      battleApi?.pushLog?.(`${name}는 먹다남은음식으로 HP를 ${heal} 회복했다!`);
    }
    if (itemIds.includes('black_sludge')) {
      const types = holder.currentTypes || holder.base?.types || holder.types || [];
      if (types.includes('독')) {
        if (holder.currentHp < holder.maxHp) {
          const heal = Math.max(1, Math.floor(holder.maxHp / 16));
          holder.currentHp = Math.min(holder.maxHp, holder.currentHp + heal);
          battleApi?.pushLog?.(`${name}는 검은진흙으로 HP를 ${heal} 회복했다!`);
        }
      } else {
        const chip = Math.max(1, Math.floor(holder.maxHp / 8));
        holder.currentHp = Math.max(0, holder.currentHp - chip);
        battleApi?.pushLog?.(`${name}는 검은진흙 때문에 ${chip} 피해를 입었다!`);
      }
    }
  }

  function applyConsumable(params) {
    const { itemId, pokemon, moveIndex, battleApi } = params || {};
    const normalized = normalizeId(itemId);
    if (!pokemon) return { ok: false, message: '대상이 없습니다.' };

    if (normalized === 'pp_aid' || normalized === 'pp_aide') {
      const move = pokemon.moves?.[moveIndex];
      if (!move) return { ok: false, message: '회복할 기술을 먼저 선택하세요.' };
      if (move.currentPP >= move.maxPP) return { ok: false, message: '이미 PP가 가득합니다.' };
      const restored = Math.min(10, Math.max(0, move.maxPP - move.currentPP));
      move.currentPP = Math.min(move.maxPP, move.currentPP + 10);
      battleApi?.pushLog?.(`${pokemon.currentName || pokemon.name}의 ${move.nameKo} PP가 ${restored} 회복되었다!`);
      return { ok: true, message: 'PP에이드를 사용했습니다.' };
    }

    if (normalized === 'paralyze_heal') {
      if (pokemon.status !== 'paralysis') return { ok: false, message: '마비 상태가 아닙니다.' };
      pokemon.status = null;
      battleApi?.pushLog?.(`${pokemon.name}의 마비가 풀렸다!`);
      return { ok: true, message: '마비를 치료했습니다.' };
    }

    if (normalized === 'antidote') {
      if (pokemon.status !== 'poison') return { ok: false, message: '독 상태가 아닙니다.' };
      pokemon.status = null;
      battleApi?.pushLog?.(`${pokemon.name}의 독이 해독되었다!`);
      return { ok: true, message: '독을 치료했습니다.' };
    }

    if (normalized === 'burn_heal') {
      if (pokemon.status !== 'burn') return { ok: false, message: '화상 상태가 아닙니다.' };
      pokemon.status = null;
      battleApi?.pushLog?.(`${pokemon.name}의 화상이 치료되었다!`);
      return { ok: true, message: '화상을 치료했습니다.' };
    }

    if (normalized === 'ice_heal') {
      if (pokemon.status !== 'freeze') return { ok: false, message: '얼음 상태가 아닙니다.' };
      pokemon.status = null;
      battleApi?.pushLog?.(`${pokemon.name}의 얼음 상태가 풀렸다!`);
      return { ok: true, message: '얼음 상태를 치료했습니다.' };
    }

    if (normalized === 'awakening_spray') {
      if (pokemon.status !== 'sleep') return { ok: false, message: '잠든 상태가 아닙니다.' };
      pokemon.status = null;
      pokemon.sleepTurns = 0;
      battleApi?.pushLog?.(`${pokemon.name}가 잠에서 깨어났다!`);
      return { ok: true, message: '잠에서 깨웠습니다.' };
    }

    if (normalized === 'revive_shard') {
      if (pokemon.currentHp > 0) return { ok: false, message: '기절한 포켓몬에게만 사용할 수 있습니다.' };
      pokemon.currentHp = Math.max(1, Math.floor(pokemon.maxHp / 2));
      battleApi?.pushLog?.(`${pokemon.name}가 기력의조각으로 되살아났다!`);
      return { ok: true, message: '포켓몬을 부활시켰습니다.' };
    }

    if (normalized === 'good_potion') {
      if (pokemon.currentHp <= 0) return { ok: false, message: '기절한 포켓몬에게는 사용할 수 없습니다.' };
      if (pokemon.currentHp >= pokemon.maxHp) return { ok: false, message: '이미 HP가 가득합니다.' };
      const before = pokemon.currentHp;
      pokemon.currentHp = Math.min(pokemon.maxHp, pokemon.currentHp + 60);
      const healed = Math.max(0, pokemon.currentHp - before);
      battleApi?.pushLog?.(`${pokemon.name}의 HP가 ${healed} 회복되었다!`);
      return { ok: true, message: '고급상처약으로 HP를 회복했습니다.' };
    }


    if (normalized === 'recovery_potion') {
      if (pokemon.currentHp <= 0) return { ok: false, message: '기절한 포켓몬에게는 사용할 수 없습니다.' };
      if (pokemon.currentHp >= pokemon.maxHp) return { ok: false, message: '이미 HP가 가득합니다.' };
      const before = pokemon.currentHp;
      pokemon.currentHp = Math.min(pokemon.maxHp, pokemon.currentHp + 120);
      const healed = Math.max(0, pokemon.currentHp - before);
      battleApi?.pushLog?.(`${pokemon.name}의 HP가 ${healed} 회복되었다!`);
      return { ok: true, message: '회복약으로 HP를 회복했습니다.' };
    }

    if (normalized === 'auto_dungeon_ticket') {
      return { ok: false, message: '던전 화면에서 사용하는 아이템입니다.' };
    }

    if (normalized === 'enhance_guard') {
      return { ok: false, message: '강화 화면에서 사용하는 아이템입니다.' };
    }

    if (normalized === 'reset_herb') {
      pokemon.statStages = { attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0, accuracy: 0, evasion: 0 };
      battleApi?.pushLog?.(`${pokemon.name}의 능력 단계 변화가 초기화되었다!`);
      return { ok: true, message: '능력 단계 변화를 초기화했습니다.' };
    }

    if (normalized === 'plus_power') return applyBattleToolBuff(pokemon, battleApi, 'attackUp', '공격 상승');
    if (normalized === 'defend_up') return applyBattleToolBuff(pokemon, battleApi, 'defenseUp', '방어 상승');
    if (normalized === 'special_up') return applyBattleToolBuff(pokemon, battleApi, 'spAttackUp', '특수공격 상승');
    if (normalized === 'special_guard') return applyBattleToolBuff(pokemon, battleApi, 'spDefenseUp', '특수방어 상승');
    if (normalized === 'speed_up') return applyBattleToolBuff(pokemon, battleApi, 'speedUp', '스피드 상승');
    if (normalized === 'critical_cutter') return applyBattleToolBuff(pokemon, battleApi, 'critUp', '급소율 상승');
    if (normalized === 'effect_guard') return applyBattleToolBuff(pokemon, battleApi, 'statusGuard', '이상 방어');

    return { ok: false, message: '아직 연결되지 않은 아이템입니다.' };
  }

  POKEBATTLE.items = {
    version: 'stage-2-items',
    ready: true,
    normalizeId,
    getSpeedMultiplier,
    getAttackMultiplier,
    getSpecialAttackMultiplier,
    getAccuracyMultiplier,
    getDamageMultiplier,
    grantsGroundImmunity,
    enforceChoiceLock,
    getLockedMoveIndex,
    clearChoiceLock,
    canApplyStatusByItem,
    onDamaged,
    afterMoveDamage,
    getDisplaySummary,
    isConsumable,
    holderHasItem,
    preventLethal,
    applyEndTurnHeldItem,
    applyConsumable
  };
})();
