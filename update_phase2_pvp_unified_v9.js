(function(){
  'use strict';
  const PB = window.POKEBATTLE || (window.POKEBATTLE = {});
  const U = PB.phase2PvpUnifiedV9 = PB.phase2PvpUnifiedV9 || {
    active:false, roomId:null, roomRef:null, room:null, started:false, sent:false,
    resolving:false, lastSeq:0, unsub:null, submitting:false, lockUntil:0
  };
  const now = () => Date.now();
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const core = () => PB.core;
  const ui = () => PB.ui;
  const online = () => PB.online || {};
  const db = () => online().db || null;
  const uid = () => online().uid || null;
  const slot = () => online().selectedSlot || 'char1';
  const myKey = () => uid() ? `${uid()}_${slot()}` : '';
  const toast = msg => ui()?.showToast?.(msg);
  const player = () => core()?.getPlayer?.('p1') || core()?.getActivePlayer?.() || null;
  const character = () => online().selectedCharacter || null;
  function isHost(room){ return room && room.challengerKey === myKey(); }
  function isGuest(room){ return room && room.targetKey === myKey(); }
  function otherKey(room){ return isHost(room) ? room.targetKey : room.challengerKey; }
  function activeRoomValid(room){ return room && (isHost(room) || isGuest(room)); }
  function clone(v){ try { return JSON.parse(JSON.stringify(v)); } catch(e){ return v; } }
  function alive(mon){ return !!mon && Number(mon.currentHp ?? mon.hp ?? 0) > 0; }
  function teamAlive(team){ return (team || []).some(alive); }
  function firstAlive(team){ return (team || []).findIndex(alive); }
  function safeBase(id){ return core()?.state?.pokemonById?.get?.(Number(id)); }
  function inflate(data){
    if(!data) return null;
    let p = null;
    const c = core();
    const base = safeBase(data.baseId || data.id || data.base?.id);
    if(base && c?.createRuntimePokemon){
      p = c.createRuntimePokemon(base, Math.min(100, Number(data.level || 5)));
    } else {
      p = { name:data.name || data.nameKo || '포켓몬', currentName:data.name || data.nameKo || '포켓몬', level:Number(data.level||5), types:data.types||['노말'], moves:data.moves||[], stats:data.stats||{} };
    }
    p.uid = data.uid || p.uid || `pvp_${Math.random().toString(36).slice(2)}`;
    p.nickname = data.nickname || p.nickname;
    p.currentName = data.nickname || data.currentName || data.name || p.currentName || p.name;
    p.name = data.name || p.name || p.currentName;
    p.level = Math.min(100, Number(data.level || p.level || 5));
    p.moves = Array.isArray(data.moves) && data.moves.length ? data.moves.slice(0,4).map(m=>({...m})) : (p.moves || []);
    p.heldItems = Array.isArray(data.heldItems) ? data.heldItems.map(it=>({...it})) : (Array.isArray(data.held) ? data.held.map(it=>({...it})) : (p.heldItems || []));
    p.heldItem = p.heldItems?.[0] || data.heldItem || p.heldItem || null;
    p.bloodline = data.bloodline || p.bloodline || 'normal';
    p.koCount = Number(data.koCount || p.koCount || 0);
    p.koStars = Math.min(5, Math.floor(Number(p.koCount||0)/10));
    if(c?.recalculateRuntimeStats) c.recalculateRuntimeStats(p, { fullHeal:true });
    p.maxHp = Number(data.maxHp || p.maxHp || p.stats?.hp || 20);
    p.currentHp = Math.max(0, Math.min(p.maxHp, Number(data.currentHp ?? data.hp ?? p.maxHp)));
    return p;
  }
  function serializeFromPublicTeam(team){ return (team || []).slice(0,3).map(x => clone(x)).filter(Boolean); }
  function roomTeams(room){
    const h = serializeFromPublicTeam(room?.challenger?.battleTeam || room?.challenger?.squad || []);
    const g = serializeFromPublicTeam(room?.target?.battleTeam || room?.target?.squad || []);
    return { [room.challengerKey]: h, [room.targetKey]: g };
  }
  function makeState(room){
    return {
      version: 9,
      phase: 'selecting',
      turn: 1,
      seq: 0,
      teams: roomTeams(room),
      actions: null,
      lastResult: null,
      forceSwitchKey: null,
      createdAt: now(),
      updatedAt: now()
    };
  }
  function showBattleShell(){
    if(core()?.state) core().state.currentScreen = 'battle';
    try { ui()?.renderAll?.(); } catch(e) {}
  }
  function grid(){ return document.getElementById('battle-action-grid'); }
  function logEl(){ return document.getElementById('battle-log'); }
  function showWait(msg, withExit=true){
    showBattleShell();
    const g = grid();
    if(g) g.innerHTML = `<div class="pvp-v9-wait"><div>${esc(msg)}</div>${withExit?'<button type="button" data-pvp-v9-exit="1">나가기</button>':''}</div>`;
    const l = logEl(); if(l) l.textContent = msg;
  }
  function syncFromEngine(){ return PB.battleEngine?.exportPvpSyncState?.() || null; }
  function normalizeSync(sync){
    sync = clone(sync || {});
    const fixIndex = (team, idx) => {
      idx = Number(idx || 0);
      if(team?.[idx] && alive(team[idx])) return idx;
      const f = firstAlive(team || []);
      return f < 0 ? Math.max(0, idx) : f;
    };
    sync.playerTeam = sync.playerTeam || [];
    sync.opponentTeam = sync.opponentTeam || [];
    sync.allyIndex = fixIndex(sync.playerTeam, sync.allyIndex);
    sync.enemyIndex = fixIndex(sync.opponentTeam, sync.enemyIndex);
    sync.completed = !!sync.completed || !teamAlive(sync.playerTeam) || !teamAlive(sync.opponentTeam);
    sync.updatedAt = now();
    return sync;
  }
  function currentLocalActiveFainted(sync, hostPerspectiveKey){
    const hostKey = U.room?.challengerKey;
    const guestKey = U.room?.targetKey;
    if(!sync || !hostKey || !guestKey) return null;
    const hTeam = sync.playerTeam || [];
    const gTeam = sync.opponentTeam || [];
    const hIdx = Number(sync.allyIndex || 0);
    const gIdx = Number(sync.enemyIndex || 0);
    if(hTeam[hIdx] && !alive(hTeam[hIdx]) && teamAlive(hTeam)) return hostKey;
    if(gTeam[gIdx] && !alive(gTeam[gIdx]) && teamAlive(gTeam)) return guestKey;
    return null;
  }
  function renderStatsFromSync(sync){
    const stats = sync?.stats || {};
    let rows = Object.values(stats).map(s => `<tr><td>${esc(s.name || s.pokemonName || '포켓몬')}</td><td>${Number(s.damageDealt || 0)}</td><td>${Number(s.survivedDamage || s.damageTaken || 0)}</td></tr>`).join('');
    if(!rows){
      const mons = [...(sync?.playerTeam||[]), ...(sync?.opponentTeam||[])];
      rows = mons.map(m=>`<tr><td>${esc(m.currentName||m.name||'포켓몬')}</td><td>${Number(m.damageDealt||0)}</td><td>${Number(m.damageTaken||0)}</td></tr>`).join('') || '<tr><td colspan="3">통계 없음</td></tr>';
    }
    const g = grid();
    if(g) g.innerHTML = `<div class="pvp-v9-end"><h3>배틀 통계</h3><table><thead><tr><th>포켓몬</th><th>딜량</th><th>버틴피해</th></tr></thead><tbody>${rows}</tbody></table><button type="button" class="action-button" data-pvp-v9-end-exit="1"><span class="action-title">나가기</span></button></div>`;
  }
  function localTeams(room){
    const p = room?.pvpUnifiedV9;
    if(!p?.teams) return { mine:[], opp:[] };
    const mine = isHost(room) ? p.teams[room.challengerKey] : p.teams[room.targetKey];
    const opp = isHost(room) ? p.teams[room.targetKey] : p.teams[room.challengerKey];
    return { mine:(mine||[]).map(inflate).filter(Boolean), opp:(opp||[]).map(inflate).filter(Boolean) };
  }
  function startLocal(room){
    if(U.started) return;
    const { mine, opp } = localTeams(room);
    if(!mine.length || !opp.length){ toast('배틀 팀을 불러오지 못했습니다.'); return; }
    U.started = true;
    U.sent = false;
    U.lastSeq = Number(room.pvpUnifiedV9?.lastResult?.seq || 0);
    try {
      if(PB.phase2CleanV8) PB.phase2CleanV8.active = false;
      if(PB.phase2ContentFix3) PB.phase2ContentFix3.active = false;
      if(PB.phase2FinalStability) PB.phase2FinalStability.active = false;
      if(PB.phase2PvpRestStable) PB.phase2PvpRestStable.active = false;
      if(PB.phase2Realtime) PB.phase2Realtime.activeRoomId = null;
    } catch(e) {}
    PB.battleEngine?.startBattle?.({
      playerId:'p1', opponentId:'online_pvp_enemy',
      playerName: character()?.name || player()?.name || '나',
      opponentName: (isHost(room) ? room.target : room.challenger)?.characterName || '상대 플레이어',
      playerTeam: mine, opponentTeam: opp,
      mode:'online_pvp_unified_v9',
      isDuo:false,
      skipLevelReward:true,
      theme:'city',
      onComplete:(payload)=>{ renderStatsFromSync(syncFromEngine()); return true; }
    });
    setTimeout(()=>PB.battleEngine?.clearPvpWaiting?.(), 60);
  }
  async function enterRoom(id){ /* delegate-to-v10 */ if(window.PB_REALTIME_PVP?.__unifiedV10 && !window.__ALLOW_OLD_PVP){ return window.PB_REALTIME_PVP.enterRoom(id); }
    const d = db();
    if(!d || !uid()){ toast('로그인 후 이용하세요.'); return; }
    await stopPvp(false);
    const ref = d.ref(`battleRooms/${id}`);
    const snap = await ref.get();
    const room = { id, ...(snap.val() || {}) };
    if(!activeRoomValid(room)){ toast('참가 가능한 배틀방이 아닙니다.'); return; }
    U.active = true; U.roomId = id; U.roomRef = ref; U.room = room; U.started = false; U.sent = false; U.resolving = false; U.lastSeq = 0;
    showWait('상대방 대기 중...');
    await ref.update({ status:'readying', [`pvpUnifiedV9Ready/${myKey()}`]: true, updatedAt: now() }).catch(e => console.warn('ready update failed', e));
    ref.on('value', handleRoomSnapshot);
  }
  function handleRoomSnapshot(snap){
    const room = { id: U.roomId, ...(snap.val() || {}) };
    if(!U.active || room.id !== U.roomId) return;
    U.room = room;
    onRoom(room).catch(err => { console.warn('pvp v9 room handler failed', err); showWait('배틀 동기화 중...'); });
  }
  async function onRoom(room){
    if(room.status === 'cancelled' || room.status === 'declined'){
      toast('배틀방이 종료되었습니다.');
      await stopPvp(true);
      return;
    }
    const ready = room.pvpUnifiedV9Ready || {};
    if(!ready[room.challengerKey] || !ready[room.targetKey]){
      showWait('상대방 대기 중...');
      return;
    }
    if(!room.pvpUnifiedV9 && isHost(room)){
      await db().ref(`battleRooms/${room.id}`).transaction(cur => {
        if(!cur) return cur;
        if(!cur.pvpUnifiedV9) cur.pvpUnifiedV9 = makeState({ id: room.id, ...cur });
        cur.status = 'inProgress'; cur.updatedAt = now();
        return cur;
      });
      return;
    }
    if(!room.pvpUnifiedV9){ showWait('배틀 준비 중...'); return; }
    startLocal(room);
    const p = room.pvpUnifiedV9;
    const result = p.lastResult;
    if(result && Number(result.seq || 0) > U.lastSeq){
      U.lastSeq = Number(result.seq || 0);
      U.sent = false;
      const sync = normalizeSync(result.syncState || {});
      try { PB.battleEngine?.importPvpSyncState?.(sync, { reverse: !isHost(room) }); }
      catch(e){ console.warn('guest/host turnResult replay failed', e); }
      if(p.phase === 'completed' || room.status === 'completed' || sync.completed){
        renderStatsFromSync(sync);
        return;
      }
      setTimeout(()=>PB.battleEngine?.clearPvpWaiting?.(), 80);
    }
    if(p.phase === 'forceSwitch'){
      U.sent = false;
      if(p.forceSwitchKey === myKey()) showForceSwitch(room);
      else showWait('상대 포켓몬 교체 대기 중...', true);
      return;
    }
    if(isHost(room) && !U.resolving && p.phase === 'selecting' && p.actions?.[room.challengerKey] && p.actions?.[room.targetKey]){
      U.resolving = true;
      await resolveHost(room).catch(async e => { console.warn('pvp v9 resolve failed', e); await recoverHost(room); });
      U.resolving = false;
      return;
    }
    const mine = p.actions?.[myKey()];
    const other = p.actions?.[otherKey(room)];
    if(mine && !other){ U.sent = true; showWait('상대방이 선택하는 중'); return; }
    if(!mine && !other && p.phase === 'selecting'){
      U.sent = false;
      if(U.started) setTimeout(()=>PB.battleEngine?.clearPvpWaiting?.(), 80);
    }
  }
  async function resolveHost(room){
    const p = room.pvpUnifiedV9;
    const h = room.challengerKey;
    const g = room.targetKey;
    await db().ref(`battleRooms/${room.id}/pvpUnifiedV9/phase`).set('resolving').catch(()=>{});
    let sync = null;
    try {
      sync = await PB.battleEngine?.resolvePvpSyncedTurn?.(p.actions[h], p.actions[g]);
    } catch(e){
      console.warn('resolvePvpSyncedTurn error', e);
      sync = syncFromEngine();
    }
    sync = normalizeSync(sync || syncFromEngine() || {});
    const hostAlive = teamAlive(sync.playerTeam);
    const guestAlive = teamAlive(sync.opponentTeam);
    const updates = {};
    const seq = Number(p.seq || 0) + 1;
    updates[`battleRooms/${room.id}/pvpUnifiedV9/actions`] = null;
    updates[`battleRooms/${room.id}/pvpUnifiedV9/seq`] = seq;
    updates[`battleRooms/${room.id}/pvpUnifiedV9/lastResult`] = { seq, turn:Number(p.turn || 1), syncState:sync, createdAt:now() };
    updates[`battleRooms/${room.id}/pvpUnifiedV9/updatedAt`] = now();
    if(!hostAlive || !guestAlive || sync.completed){
      const winnerKey = hostAlive && !guestAlive ? h : guestAlive && !hostAlive ? g : (hostAlive ? h : g);
      const winnerPub = winnerKey === h ? room.challenger : room.target;
      updates[`battleRooms/${room.id}/status`] = 'completed';
      updates[`battleRooms/${room.id}/result`] = { winnerKey, winnerName:winnerPub?.characterName || '', completedAt:now(), unifiedPvp:true };
      updates[`battleRooms/${room.id}/pvpUnifiedV9/phase`] = 'completed';
      if(room.mode === 'champion' && winnerKey === h) updates['competitive/champion'] = { ...room.challenger, championSince:now(), reason:'challengeWin' };
    } else {
      const fsKey = currentLocalActiveFainted(sync);
      if(fsKey){
        updates[`battleRooms/${room.id}/pvpUnifiedV9/phase`] = 'forceSwitch';
        updates[`battleRooms/${room.id}/pvpUnifiedV9/forceSwitchKey`] = fsKey;
        updates[`battleRooms/${room.id}/pvpUnifiedV9/forceSwitchSync`] = sync;
      } else {
        updates[`battleRooms/${room.id}/pvpUnifiedV9/turn`] = Number(p.turn || 1) + 1;
        updates[`battleRooms/${room.id}/pvpUnifiedV9/phase`] = 'selecting';
        updates[`battleRooms/${room.id}/pvpUnifiedV9/forceSwitchKey`] = null;
        updates[`battleRooms/${room.id}/pvpUnifiedV9/forceSwitchSync`] = null;
      }
    }
    await db().ref().update(updates);
  }
  async function recoverHost(room){
    const p = room.pvpUnifiedV9 || {};
    const sync = normalizeSync(syncFromEngine() || { playerTeam:p.teams?.[room.challengerKey] || [], opponentTeam:p.teams?.[room.targetKey] || [], log:['턴을 복구했습니다.'], completed:false });
    const seq = Number(p.seq || 0) + 1;
    await db().ref().update({
      [`battleRooms/${room.id}/pvpUnifiedV9/actions`]: null,
      [`battleRooms/${room.id}/pvpUnifiedV9/seq`]: seq,
      [`battleRooms/${room.id}/pvpUnifiedV9/lastResult`]: { seq, turn:Number(p.turn || 1), syncState:sync, createdAt:now(), recovered:true },
      [`battleRooms/${room.id}/pvpUnifiedV9/turn`]: Number(p.turn || 1) + 1,
      [`battleRooms/${room.id}/pvpUnifiedV9/phase`]: 'selecting',
      [`battleRooms/${room.id}/pvpUnifiedV9/updatedAt`]: now()
    });
  }
  function showForceSwitch(room){
    const snap = PB.battleEngine?.getSnapshot?.();
    const bench = snap?.allyBench || [];
    const btns = bench.filter(x => x?.pokemon?.currentHp > 0).map(x => `<button type="button" class="action-button" data-pvp-v9-force-switch="${Number(x.index)}"><span class="action-title">${esc(x.pokemon.currentName || x.pokemon.name || '포켓몬')}</span><span class="action-sub">교체</span></button>`).join('');
    const g = grid();
    if(g) g.innerHTML = `<div class="pvp-v9-wait"><div>다음 포켓몬을 선택하세요.</div><div class="pvp-v9-grid">${btns || '<button type="button" data-pvp-v9-exit="1">나가기</button>'}</div></div>`;
  }
  async function submitForceSwitch(index){
    const room = U.room;
    const p = room?.pvpUnifiedV9;
    if(!room || !p || p.phase !== 'forceSwitch' || p.forceSwitchKey !== myKey()) return;
    let sync = normalizeSync(p.forceSwitchSync || p.lastResult?.syncState || {});
    if(isHost(room)) sync.allyIndex = Number(index || 0);
    else sync.enemyIndex = Number(index || 0);
    const seq = Number(p.seq || 0) + 1;
    await db().ref().update({
      [`battleRooms/${room.id}/pvpUnifiedV9/forceSwitchKey`]: null,
      [`battleRooms/${room.id}/pvpUnifiedV9/forceSwitchSync`]: null,
      [`battleRooms/${room.id}/pvpUnifiedV9/actions`]: null,
      [`battleRooms/${room.id}/pvpUnifiedV9/phase`]: 'selecting',
      [`battleRooms/${room.id}/pvpUnifiedV9/turn`]: Number(p.turn || 1) + 1,
      [`battleRooms/${room.id}/pvpUnifiedV9/seq`]: seq,
      [`battleRooms/${room.id}/pvpUnifiedV9/lastResult`]: { seq, turn:Number(p.turn || 1), syncState:sync, forceSwitch:true, createdAt:now() },
      [`battleRooms/${room.id}/pvpUnifiedV9/updatedAt`]: now()
    });
  }
  async function submit(action){
    if(!U.active || !U.started || !U.roomId || !db() || U.sent || U.submitting) return;
    const p = U.room?.pvpUnifiedV9;
    if(!p || p.phase !== 'selecting') return;
    U.submitting = true;
    U.sent = true;
    showWait('상대방이 선택하는 중');
    try { await db().ref(`battleRooms/${U.roomId}/pvpUnifiedV9/actions/${myKey()}`).set({ ...action, at:now() }); }
    catch(e){ U.sent=false; toast('행동 저장 실패'); console.warn(e); }
    U.submitting = false;
  }
  async function stopPvp(goLobby){
    if(U.roomRef){ try{ U.roomRef.off('value', handleRoomSnapshot); }catch(e){} }
    U.active = false; U.roomId = null; U.roomRef = null; U.room = null; U.started = false; U.sent = false; U.resolving = false; U.lastSeq = 0;
    if(goLobby && core()?.state){ core().state.currentScreen = 'lobby'; ui()?.renderAll?.(); }
  }
  function bindEarly(){
    if(U.bound) return; U.bound = true;
    document.addEventListener('click', async (e) => {
      const start = e.target.closest?.('[data-p2-room-start]');
      if(start){ e.preventDefault(); e.stopImmediatePropagation(); await enterRoom(start.dataset.p2RoomStart); return; }
      if(e.target.closest?.('[data-pvp-v9-exit]')){ e.preventDefault(); e.stopImmediatePropagation(); if(U.roomId && db()) await db().ref(`battleRooms/${U.roomId}`).update({ status:'cancelled', updatedAt:now() }).catch(()=>{}); await stopPvp(true); return; }
      if(e.target.closest?.('[data-pvp-v9-end-exit]')){ e.preventDefault(); e.stopImmediatePropagation(); await stopPvp(true); return; }
      const fsw = e.target.closest?.('[data-pvp-v9-force-switch]');
      if(fsw){ e.preventDefault(); e.stopImmediatePropagation(); await submitForceSwitch(Number(fsw.dataset.pvpV9ForceSwitch || 0)); return; }
      if(!U.active || !U.started) return;
      const action = e.target.closest?.('[data-battle-action]');
      if(action){
        const a = action.dataset.battleAction;
        if(['fight','bag','pokemon','info'].includes(a)){
          e.preventDefault(); e.stopImmediatePropagation();
          if(!U.sent){ PB.battleEngine?.clearPvpWaiting?.(); PB.battleEngine?.handleRootAction?.(a); }
          return;
        }
      }
      const root = e.target.closest?.('[data-battle-root]');
      if(root){ e.preventDefault(); e.stopImmediatePropagation(); if(!U.sent) PB.battleEngine?.setMenu?.('root'); return; }
      const mv = e.target.closest?.('[data-battle-move]');
      if(mv){ e.preventDefault(); e.stopImmediatePropagation(); await submit({ type:'move', index:Number(mv.dataset.battleMove || 0) }); return; }
      const sw = e.target.closest?.('[data-battle-switch]');
      if(sw){ e.preventDefault(); e.stopImmediatePropagation(); await submit({ type:'switch', index:Number(sw.dataset.battleSwitch || 0) }); return; }
      const item = e.target.closest?.('[data-battle-item]');
      if(item){
        e.preventDefault(); e.stopImmediatePropagation();
        const id = item.dataset.battleItem;
        if(['pp_aid','pp_aide','revive_shard'].includes(id)) PB.battleEngine?.handleBagSelect?.(id);
        else await submit({ type:'item', itemId:id });
        return;
      }
      const im = e.target.closest?.('[data-battle-item-move]');
      if(im){ e.preventDefault(); e.stopImmediatePropagation(); await submit({ type:'item', itemId:'pp_aid', moveIndex:Number(im.dataset.battleItemMove || 0) }); return; }
      const ip = e.target.closest?.('[data-battle-item-pokemon]');
      if(ip){ e.preventDefault(); e.stopImmediatePropagation(); await submit({ type:'item', itemId:'revive_shard', targetIndex:Number(ip.dataset.battleItemPokemon || 0) }); return; }
    }, true);
  }
  function injectCss(){
    if(document.getElementById('pvp-unified-v9-style')) return;
    const st = document.createElement('style'); st.id = 'pvp-unified-v9-style'; st.textContent = `
      .pvp-v9-wait{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;width:100%;min-height:126px;background:rgba(255,255,255,.94);border-radius:18px;color:#06101f!important;font-weight:1000;text-align:center;padding:16px;box-sizing:border-box;}
      .pvp-v9-wait button{border:0;border-radius:999px;background:#111827;color:#fff!important;font-weight:1000;padding:9px 14px;}
      .pvp-v9-grid{width:100%;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;}
      .pvp-v9-end{width:100%;background:rgba(255,255,255,.94);color:#06101f!important;border-radius:18px;padding:12px;box-sizing:border-box;}
      .pvp-v9-end *{color:#06101f!important;}.pvp-v9-end table{width:100%;border-collapse:collapse}.pvp-v9-end td,.pvp-v9-end th{padding:5px;border-bottom:1px solid rgba(0,0,0,.12);text-align:left}
    `; document.head.appendChild(st);
  }
  function install(){
    injectCss();
    bindEarly();
    const api = { enterRoom, close:()=>stopPvp(false), __unifiedV9:true };
    window.PB_REALTIME_PVP_V9 = api;
    window.PB_REALTIME_PVP = api;
    window.PB_STABLE_PVP = api;
    // Older patches loaded after this file may overwrite the globals. Reclaim them after load, while keeping our early click listener first.
    setTimeout(()=>{ window.PB_REALTIME_PVP = api; window.PB_STABLE_PVP = api; }, 1000);
    window.addEventListener('load', ()=>setTimeout(()=>{ window.PB_REALTIME_PVP = api; window.PB_STABLE_PVP = api; }, 300));
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once:true }); else install();
})();
