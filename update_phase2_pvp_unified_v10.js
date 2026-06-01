(function(){
  'use strict';
  const PB = window.POKEBATTLE || (window.POKEBATTLE = {});
  const S = PB.phase2PvpUnifiedV10 = PB.phase2PvpUnifiedV10 || {
    active:false, roomId:null, roomRef:null, room:null, started:false,
    sent:false, resolving:false, lastSeq:0, submitting:false, bound:false,
    api:null
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
  const player = () => core()?.getPlayer?.('p1') || core()?.getActivePlayer?.() || null;
  const ch = () => online().selectedCharacter || null;
  const toast = m => ui()?.showToast?.(m);
  function isHost(room){ return !!room && room.challengerKey === myKey(); }
  function isGuest(room){ return !!room && room.targetKey === myKey(); }
  function validRoom(room){ return !!room && (isHost(room) || isGuest(room)); }
  function otherKey(room){ return isHost(room) ? room.targetKey : room.challengerKey; }
  function clone(v){ try { return JSON.parse(JSON.stringify(v)); } catch(e){ return v; } }
  function alive(m){ return !!m && Number(m.currentHp ?? m.hp ?? 0) > 0; }
  function teamAlive(t){ return (t || []).some(alive); }
  function firstAlive(t){ return (t || []).findIndex(alive); }
  function finite(n, fallback=0){ n = Number(n); return Number.isFinite(n) ? n : fallback; }
  function sanitize(v){
    if (v === undefined || typeof v === 'function' || typeof v === 'symbol') return null;
    if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
    if (v === null || typeof v !== 'object') return v;
    if (Array.isArray(v)) return v.map(sanitize);
    const out = {};
    Object.entries(v).forEach(([k,val]) => {
      const s = sanitize(val);
      if (s !== undefined) out[k] = s;
    });
    return out;
  }
  function publicTeam(room, key){
    const pub = key === room.challengerKey ? room.challenger : room.target;
    return clone(pub?.battleTeam || pub?.squad || []).slice(0,3).filter(Boolean);
  }
  function makeState(room){
    return sanitize({
      version:10,
      phase:'selecting',
      turn:1,
      seq:0,
      teams:{ [room.challengerKey]: publicTeam(room, room.challengerKey), [room.targetKey]: publicTeam(room, room.targetKey) },
      actions:null,
      lastResult:null,
      forceSwitchKey:null,
      forceSwitchSync:null,
      createdAt:now(), updatedAt:now()
    });
  }
  function baseById(id){ return core()?.state?.pokemonById?.get?.(Number(id)); }
  function inflate(data){
    if(!data) return null;
    const c = core();
    const base = baseById(data.baseId || data.id || data.base?.id);
    let p = null;
    if(base && c?.createRuntimePokemon){
      p = c.createRuntimePokemon(base, Math.min(100, finite(data.level, 5)));
    } else {
      p = { name:data.name || data.nameKo || data.currentName || '포켓몬', currentName:data.currentName || data.nickname || data.name || '포켓몬', level:Math.min(100, finite(data.level,5)), types:data.types || ['노말'], moves:data.moves || [], stats:data.stats || {} };
    }
    p.uid = data.uid || p.uid || `pvp_${Math.random().toString(36).slice(2)}`;
    p.currentName = data.nickname || data.currentName || data.name || p.currentName || p.name;
    p.name = data.name || p.name || p.currentName;
    p.nickname = data.nickname || p.nickname || '';
    p.level = Math.min(100, finite(data.level, p.level || 5));
    p.bloodline = data.bloodline || p.bloodline || 'normal';
    p.heldItems = Array.isArray(data.heldItems) ? data.heldItems.map(it=>({...it})) : (p.heldItems || []);
    p.heldItem = p.heldItems[0] || data.heldItem || p.heldItem || null;
    if(Array.isArray(data.moves) && data.moves.length) p.moves = data.moves.slice(0,4).map(m=>({...m}));
    p.enhanceLevel = finite(data.enhanceLevel, p.enhanceLevel || 0);
    p.koCount = finite(data.koCount, p.koCount || 0);
    if(c?.recalculateRuntimeStats) c.recalculateRuntimeStats(p, { fullHeal:true });
    p.maxHp = finite(data.maxHp, p.maxHp || p.stats?.hp || 20);
    p.currentHp = Math.max(0, Math.min(p.maxHp, finite(data.currentHp ?? data.hp, p.maxHp)));
    return p;
  }
  function localTeams(room){
    const p = room?.pvpUnifiedV10;
    if(!p?.teams) return { mine:[], opp:[] };
    const mk = myKey();
    const ok = otherKey(room);
    return { mine:(p.teams[mk] || []).map(inflate).filter(Boolean), opp:(p.teams[ok] || []).map(inflate).filter(Boolean) };
  }
  function showBattleShell(){
    if(core()?.state) core().state.currentScreen = 'battle';
    try { ui()?.renderAll?.(); } catch(e) {}
  }
  function grid(){ return document.getElementById('battle-action-grid'); }
  function logEl(){ return document.getElementById('battle-log'); }
  function showWait(msg, exit=true){
    showBattleShell();
    const g = grid();
    if(g) g.innerHTML = `<div class="pvp-v10-wait"><div>${esc(msg)}</div>${exit?'<button type="button" data-pvp-v10-exit="1">나가기</button>':''}</div>`;
    const l = logEl(); if(l) l.textContent = msg;
  }
  function syncFromEngine(){
    let s = null;
    try { s = PB.battleEngine?.exportPvpSyncState?.(); } catch(e) { s = null; }
    return normalizeSync(s || {});
  }
  function normalizeSync(sync){
    sync = sanitize(clone(sync || {})) || {};
    sync.version = finite(sync.version, 10);
    sync.battleId = finite(sync.battleId, 0);
    sync.playerTeam = Array.isArray(sync.playerTeam) ? sync.playerTeam : [];
    sync.opponentTeam = Array.isArray(sync.opponentTeam) ? sync.opponentTeam : [];
    const fixIndex = (team, idx) => {
      idx = finite(idx,0);
      if(team?.[idx] && alive(team[idx])) return idx;
      const f = firstAlive(team || []);
      return f >= 0 ? f : Math.max(0, idx);
    };
    sync.allyIndex = fixIndex(sync.playerTeam, sync.allyIndex);
    sync.enemyIndex = fixIndex(sync.opponentTeam, sync.enemyIndex);
    sync.completed = !!sync.completed || !teamAlive(sync.playerTeam) || !teamAlive(sync.opponentTeam);
    sync.updatedAt = now();
    return sanitize(sync);
  }
  function renderStats(sync){
    sync = normalizeSync(sync || syncFromEngine());
    const stats = sync.stats || {};
    let rows = Object.values(stats).map(s => `<tr><td>${esc(s.name || s.pokemonName || '포켓몬')}</td><td>${finite(s.damageDealt,0)}</td><td>${finite(s.survivedDamage ?? s.damageTaken,0)}</td></tr>`).join('');
    if(!rows){
      rows = [...(sync.playerTeam||[]), ...(sync.opponentTeam||[])].map(m => `<tr><td>${esc(m.currentName || m.name || '포켓몬')}</td><td>${finite(m.damageDealt,0)}</td><td>${finite(m.survivedDamage ?? m.damageTaken,0)}</td></tr>`).join('') || '<tr><td colspan="3">통계 없음</td></tr>';
    }
    const g = grid();
    if(g) g.innerHTML = `<div class="pvp-v10-end"><h3>배틀 통계</h3><table><thead><tr><th>포켓몬</th><th>딜량</th><th>버틴피해</th></tr></thead><tbody>${rows}</tbody></table><button type="button" class="action-button" data-pvp-v10-end-exit="1"><span class="action-title">나가기</span></button></div>`;
  }
  function startLocal(room){
    if(S.started) return;
    const { mine, opp } = localTeams(room);
    if(!mine.length || !opp.length){ toast('배틀 팀을 불러오지 못했습니다.'); return; }
    try {
      ['phase2Realtime','phase2FullPvpPatch','phase2SameUiPvpFix','phase2FinalStability','phase2PvpRestStable','phase2CleanV8','phase2PvpUnifiedV9'].forEach(k => { if(PB[k]) PB[k].active = false; });
    } catch(e) {}
    S.started = true; S.sent = false; S.lastSeq = finite(room.pvpUnifiedV10?.lastResult?.seq, 0);
    PB.battleEngine?.startBattle?.({
      playerId:'p1', opponentId:'online_pvp_enemy',
      playerName: ch()?.name || player()?.name || '나',
      opponentName: (isHost(room) ? room.target : room.challenger)?.characterName || '상대 플레이어',
      playerTeam: mine, opponentTeam: opp,
      mode:'online_pvp_unified_v10', isDuo:false, skipLevelReward:true, theme:'city',
      onComplete:(payload)=>{ renderStats(syncFromEngine()); return true; }
    });
    setTimeout(() => PB.battleEngine?.clearPvpWaiting?.(), 80);
  }
  async function enterRoom(id){
    const d = db();
    if(!d || !uid()){ toast('로그인 후 이용하세요.'); return; }
    await stop(false);
    const ref = d.ref(`battleRooms/${id}`);
    const snap = await ref.get();
    const room = { id, ...(snap.val() || {}) };
    if(!validRoom(room)){ toast('참가 가능한 배틀방이 아닙니다.'); return; }
    S.active = true; S.roomId = id; S.roomRef = ref; S.room = room; S.started = false; S.sent = false; S.resolving = false; S.lastSeq = 0;
    showWait('상대방 대기 중...');
    const cleanup = { status:'readying', [`pvpUnifiedV10Ready/${myKey()}`]:true, updatedAt:now() };
    // 오래된 PvP 상태가 새 방에 섞여도 이 모듈만 사용하도록 비활성화 표식을 남긴다.
    cleanup[`pvpV8Disabled`] = true; cleanup[`pvpUnifiedV9Disabled`] = true;
    await ref.update(sanitize(cleanup)).catch(e => console.warn('v10 ready failed', e));
    ref.on('value', handleSnapshot);
  }
  function handleSnapshot(snap){
    const room = { id:S.roomId, ...(snap.val() || {}) };
    if(!S.active || room.id !== S.roomId) return;
    S.room = room;
    onRoom(room).catch(e => { console.warn('pvp v10 handler failed', e); showWait('배틀 동기화 중...'); });
  }
  async function onRoom(room){
    if(room.status === 'cancelled' || room.status === 'declined') { toast('배틀방이 종료되었습니다.'); await stop(true); return; }
    const ready = room.pvpUnifiedV10Ready || {};
    if(!ready[room.challengerKey] || !ready[room.targetKey]){ showWait('상대방 대기 중...'); return; }
    if(!room.pvpUnifiedV10 && isHost(room)){
      await db().ref(`battleRooms/${room.id}`).transaction(cur => {
        if(!cur) return cur;
        if(!cur.pvpUnifiedV10) cur.pvpUnifiedV10 = makeState({ id:room.id, ...cur });
        cur.status = 'inProgress'; cur.updatedAt = now();
        return sanitize(cur);
      });
      return;
    }
    if(!room.pvpUnifiedV10){ showWait('배틀 준비 중...'); return; }
    startLocal(room);
    const p = room.pvpUnifiedV10;
    const result = p.lastResult;
    if(result && finite(result.seq,0) > S.lastSeq){
      S.lastSeq = finite(result.seq,0);
      S.sent = false;
      const sync = normalizeSync(result.syncState || {});
      try { PB.battleEngine?.importPvpSyncState?.(sync, { reverse: !isHost(room) }); }
      catch(e){ console.warn('v10 turnResult replay failed', e); }
      if(p.phase === 'completed' || room.status === 'completed' || sync.completed){ renderStats(sync); return; }
      setTimeout(() => PB.battleEngine?.clearPvpWaiting?.(), 100);
    }
    if(isHost(room) && !S.resolving && p.phase === 'selecting' && p.actions?.[room.challengerKey] && p.actions?.[room.targetKey]){
      S.resolving = true;
      try { await resolveHost(room); } catch(e) { console.warn('pvp v10 resolve failed', e); await recoverHost(room); }
      S.resolving = false;
      return;
    }
    const mine = p.actions?.[myKey()];
    const other = p.actions?.[otherKey(room)];
    if(mine && !other){ S.sent = true; showWait('상대방이 선택하는 중'); return; }
    if(!mine && !other && p.phase === 'selecting'){
      S.sent = false;
      if(S.started) setTimeout(() => PB.battleEngine?.clearPvpWaiting?.(), 100);
    }
  }
  async function resolveHost(room){
    const p = room.pvpUnifiedV10;
    const h = room.challengerKey, g = room.targetKey;
    await db().ref(`battleRooms/${room.id}/pvpUnifiedV10/phase`).set('resolving').catch(()=>{});
    let sync = null;
    try { sync = await PB.battleEngine?.resolvePvpSyncedTurn?.(p.actions[h], p.actions[g]); }
    catch(e){ console.warn('resolvePvpSyncedTurn error', e); sync = syncFromEngine(); }
    sync = normalizeSync(sync || syncFromEngine() || {});
    const hostAlive = teamAlive(sync.playerTeam), guestAlive = teamAlive(sync.opponentTeam);
    const seq = finite(p.seq,0) + 1;
    const updates = {};
    updates[`battleRooms/${room.id}/pvpUnifiedV10/actions`] = null;
    updates[`battleRooms/${room.id}/pvpUnifiedV10/seq`] = seq;
    updates[`battleRooms/${room.id}/pvpUnifiedV10/lastResult`] = { seq, turn:finite(p.turn,1), syncState:sync, createdAt:now() };
    updates[`battleRooms/${room.id}/pvpUnifiedV10/updatedAt`] = now();
    if(!hostAlive || !guestAlive || sync.completed){
      const winnerKey = hostAlive && !guestAlive ? h : guestAlive && !hostAlive ? g : (hostAlive ? h : g);
      const winnerPub = winnerKey === h ? room.challenger : room.target;
      updates[`battleRooms/${room.id}/status`] = 'completed';
      updates[`battleRooms/${room.id}/result`] = { winnerKey, winnerName:winnerPub?.characterName || '', completedAt:now(), unifiedPvp:true, version:10 };
      updates[`battleRooms/${room.id}/pvpUnifiedV10/phase`] = 'completed';
      if(room.mode === 'champion' && winnerKey === h) updates['competitive/champion'] = { ...room.challenger, championSince:now(), reason:'challengeWin' };
    } else {
      updates[`battleRooms/${room.id}/pvpUnifiedV10/turn`] = finite(p.turn,1) + 1;
      updates[`battleRooms/${room.id}/pvpUnifiedV10/phase`] = 'selecting';
    }
    await db().ref().update(sanitize(updates));
  }
  async function recoverHost(room){
    const p = room.pvpUnifiedV10 || {};
    const sync = normalizeSync(syncFromEngine() || { playerTeam:p.teams?.[room.challengerKey] || [], opponentTeam:p.teams?.[room.targetKey] || [], log:['턴을 복구했습니다.'], completed:false });
    const seq = finite(p.seq,0) + 1;
    await db().ref().update(sanitize({
      [`battleRooms/${room.id}/pvpUnifiedV10/actions`]: null,
      [`battleRooms/${room.id}/pvpUnifiedV10/seq`]: seq,
      [`battleRooms/${room.id}/pvpUnifiedV10/lastResult`]: { seq, turn:finite(p.turn,1), syncState:sync, createdAt:now(), recovered:true },
      [`battleRooms/${room.id}/pvpUnifiedV10/turn`]: finite(p.turn,1) + 1,
      [`battleRooms/${room.id}/pvpUnifiedV10/phase`]: 'selecting',
      [`battleRooms/${room.id}/pvpUnifiedV10/updatedAt`]: now()
    }));
  }
  async function submit(action){
    if(!S.active || !S.started || !S.roomId || !db() || S.sent || S.submitting) return;
    const p = S.room?.pvpUnifiedV10;
    if(!p || p.phase !== 'selecting') return;
    S.submitting = true; S.sent = true;
    showWait('상대방이 선택하는 중');
    try { await db().ref(`battleRooms/${S.roomId}/pvpUnifiedV10/actions/${myKey()}`).set(sanitize({ ...action, at:now() })); }
    catch(e){ S.sent=false; toast('행동 저장 실패'); console.warn(e); }
    S.submitting = false;
  }
  async function stop(goLobby){
    if(S.roomRef){ try{ S.roomRef.off('value', handleSnapshot); }catch(e){} }
    S.active=false; S.roomId=null; S.roomRef=null; S.room=null; S.started=false; S.sent=false; S.resolving=false; S.lastSeq=0;
    if(goLobby && core()?.state){ core().state.currentScreen='lobby'; ui()?.renderAll?.(); }
  }
  function bind(){
    if(S.bound) return; S.bound = true;
    document.addEventListener('click', async (e) => {
      const start = e.target.closest?.('[data-p2-room-start]');
      if(start){ e.preventDefault(); e.stopImmediatePropagation(); await enterRoom(start.dataset.p2RoomStart); return; }
      if(e.target.closest?.('[data-pvp-v10-exit]')){ e.preventDefault(); e.stopImmediatePropagation(); if(S.roomId && db()) await db().ref(`battleRooms/${S.roomId}`).update({ status:'cancelled', updatedAt:now() }).catch(()=>{}); await stop(true); return; }
      if(e.target.closest?.('[data-pvp-v10-end-exit]')){ e.preventDefault(); e.stopImmediatePropagation(); await stop(true); return; }
      if(!S.active || !S.started) return;
      const action = e.target.closest?.('[data-battle-action]');
      if(action){
        const a = action.dataset.battleAction;
        if(['fight','bag','pokemon','info'].includes(a)){
          e.preventDefault(); e.stopImmediatePropagation();
          if(!S.sent){ PB.battleEngine?.clearPvpWaiting?.(); PB.battleEngine?.handleRootAction?.(a); }
          return;
        }
      }
      const root = e.target.closest?.('[data-battle-root]');
      if(root){ e.preventDefault(); e.stopImmediatePropagation(); if(!S.sent) PB.battleEngine?.setMenu?.('root'); return; }
      const mv = e.target.closest?.('[data-battle-move]');
      if(mv){ e.preventDefault(); e.stopImmediatePropagation(); await submit({ type:'move', index:finite(mv.dataset.battleMove,0) }); return; }
      const sw = e.target.closest?.('[data-battle-switch]');
      if(sw){ e.preventDefault(); e.stopImmediatePropagation(); await submit({ type:'switch', index:finite(sw.dataset.battleSwitch,0) }); return; }
      const item = e.target.closest?.('[data-battle-item]');
      if(item){ e.preventDefault(); e.stopImmediatePropagation(); const id=item.dataset.battleItem; if(['pp_aid','pp_aide','revive_shard'].includes(id)){ if(!S.sent) PB.battleEngine?.handleBagSelect?.(id); } else await submit({ type:'item', itemId:id }); return; }
      const im = e.target.closest?.('[data-battle-item-move]');
      if(im){ e.preventDefault(); e.stopImmediatePropagation(); await submit({ type:'item', itemId:'pp_aid', moveIndex:finite(im.dataset.battleItemMove,0) }); return; }
      const ip = e.target.closest?.('[data-battle-item-pokemon]');
      if(ip){ e.preventDefault(); e.stopImmediatePropagation(); await submit({ type:'item', itemId:'revive_shard', targetIndex:finite(ip.dataset.battleItemPokemon,0) }); return; }
    }, true);
  }
  function injectCss(){
    if(document.getElementById('pvp-v10-style')) return;
    const st=document.createElement('style'); st.id='pvp-v10-style'; st.textContent = `
      .pvp-v10-wait{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;width:100%;min-height:126px;background:rgba(255,255,255,.94);border-radius:18px;color:#06101f!important;font-weight:1000;text-align:center;padding:16px;box-sizing:border-box;}
      .pvp-v10-wait button{border:0;border-radius:999px;background:#111827;color:#fff!important;font-weight:1000;padding:9px 14px;}
      .pvp-v10-end{width:100%;background:rgba(255,255,255,.94);color:#06101f!important;border-radius:18px;padding:12px;box-sizing:border-box;}.pvp-v10-end *{color:#06101f!important}.pvp-v10-end table{width:100%;border-collapse:collapse}.pvp-v10-end td,.pvp-v10-end th{padding:5px;border-bottom:1px solid rgba(0,0,0,.12);text-align:left;}
      #battle-action-grid .action-button,#battle-action-grid .action-button span,#battle-action-grid .action-button div:not(.type-badge),.battle-move-button,.battle-move-button *:not(.type-badge){color:#050b18!important;-webkit-text-fill-color:#050b18!important;text-shadow:none!important;}
    `; document.head.appendChild(st);
  }
  function reclaim(){ if(S.api){ window.PB_REALTIME_PVP = S.api; window.PB_STABLE_PVP = S.api; } }
  function init(){
    injectCss(); bind();
    S.api = { enterRoom, close:()=>stop(false), __unifiedV10:true };
    reclaim();
    let n=0; const timer=setInterval(()=>{ reclaim(); if(++n>20) clearInterval(timer); }, 500);
    window.addEventListener('load', ()=>setTimeout(reclaim,200));
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true }); else init();
})();
