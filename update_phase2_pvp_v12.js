(function(){
  'use strict';
  const PB = window.POKEBATTLE || (window.POKEBATTLE = {});
  const V = PB.phase2PvpV12 = PB.phase2PvpV12 || { active:false, roomId:null, roomRef:null, room:null, started:false, sent:false, resolving:false, lastSeq:0, bound:false, submitting:false };
  const now = () => Date.now();
  const esc = (v)=>String(v ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const core = () => PB.core;
  const ui = () => PB.ui;
  const online = () => PB.online || {};
  const db = () => online().db || null;
  const uid = () => online().uid || null;
  const slot = () => online().selectedSlot || 'char1';
  const myKey = () => uid() ? `${uid()}_${slot()}` : '';
  const isHost = (room) => !!room && room.challengerKey === myKey();
  const isGuest = (room) => !!room && room.targetKey === myKey();
  const validRoom = (room) => !!room && (isHost(room) || isGuest(room));
  const otherKey = (room) => isHost(room) ? room.targetKey : room.challengerKey;
  const toast = (m) => ui()?.showToast?.(m);
  const ch = () => online().selectedCharacter || null;
  const localPlayer = () => core()?.getPlayer?.('p1') || core()?.getActivePlayer?.() || null;
  function clone(v){ try { return JSON.parse(JSON.stringify(v)); } catch(e){ return v; } }
  function finite(n, f=0){ n=Number(n); return Number.isFinite(n) ? n : f; }
  function alive(mon){ return !!mon && finite(mon.currentHp ?? mon.hp, 0) > 0; }
  function teamAlive(team){ return (team||[]).some(alive); }
  function firstAlive(team){ return (team||[]).findIndex(alive); }
  function sanitize(v){
    if(v === undefined || typeof v === 'function' || typeof v === 'symbol') return null;
    if(typeof v === 'number') return Number.isFinite(v) ? v : 0;
    if(v === null || typeof v !== 'object') return v;
    if(Array.isArray(v)) return v.map(sanitize);
    const out = {};
    Object.entries(v).forEach(([k,val])=>{ const s=sanitize(val); if(s !== undefined) out[k]=s; });
    return out;
  }
  function publicTeam(room, key){
    const pub = key === room.challengerKey ? room.challenger : room.target;
    return clone(pub?.battleTeam || pub?.squad || []).slice(0,3).filter(Boolean);
  }
  function makeState(room){
    return sanitize({
      version:12, phase:'selecting', turn:1, seq:0,
      teams:{ [room.challengerKey]:publicTeam(room, room.challengerKey), [room.targetKey]:publicTeam(room, room.targetKey) },
      actions:null, lastResult:null, forceSwitch:null, createdAt:now(), updatedAt:now()
    });
  }
  function baseById(id){ return core()?.state?.pokemonById?.get?.(Number(id)); }
  function inflate(data){
    if(!data) return null;
    const c = core();
    const base = baseById(data.baseId || data.id || data.base?.id);
    let p = null;
    if(base && c?.createRuntimePokemon){ p = c.createRuntimePokemon(base, Math.min(100, finite(data.level, 5))); }
    else { p = { name:data.name || data.nameKo || data.currentName || '포켓몬', currentName:data.currentName || data.name || '포켓몬', level:Math.min(100, finite(data.level,5)), currentTypes:data.types || data.currentTypes || ['노말'], moves:data.moves || [], stats:data.stats || {} }; }
    p.uid = data.uid || p.uid || `pvp_${Math.random().toString(36).slice(2)}`;
    p.sourceUid = data.sourceUid || p.sourceUid || data.uid || '';
    p.currentName = data.nickname || data.currentName || data.name || p.currentName || p.name;
    p.name = data.name || p.name || p.currentName;
    p.nickname = data.nickname || p.nickname || '';
    p.level = Math.min(100, finite(data.level, p.level || 5));
    p.bloodline = data.bloodline || p.bloodline || 'normal';
    p.heldItems = Array.isArray(data.heldItems) ? data.heldItems.map(it=>({...it})) : (p.heldItems || []);
    p.heldItem = p.heldItems[0] || data.heldItem || p.heldItem || null;
    if(Array.isArray(data.moves) && data.moves.length) p.moves = data.moves.slice(0,4).map(m=>({...m}));
    if(c?.recalculateRuntimeStats) c.recalculateRuntimeStats(p, { fullHeal:true });
    p.maxHp = finite(data.maxHp, p.maxHp || p.stats?.hp || 20);
    p.currentHp = Math.max(0, Math.min(p.maxHp, finite(data.currentHp ?? data.hp, p.maxHp)));
    p.status = data.status || p.status || null;
    return p;
  }
  function localTeams(room){
    const p = room?.pvpV12;
    if(!p?.teams) return { mine:[], opp:[] };
    const mk = myKey(); const ok = otherKey(room);
    return { mine:(p.teams[mk]||[]).map(inflate).filter(Boolean), opp:(p.teams[ok]||[]).map(inflate).filter(Boolean) };
  }
  function showBattleShell(){ if(core()?.state) core().state.currentScreen='battle'; try{ ui()?.renderAll?.(); }catch(e){} }
  function grid(){ return document.getElementById('battle-action-grid'); }
  function logEl(){ return document.getElementById('battle-log'); }
  function showWait(msg, exit=true){
    showBattleShell();
    const g=grid();
    if(g) g.innerHTML = `<div class="pvp12-wait"><div>${esc(msg)}</div>${exit?'<button type="button" data-pvp12-exit="1">나가기</button>':''}</div>`;
    const l=logEl(); if(l) l.textContent=msg;
  }
  function normalizeSync(sync){
    sync = sanitize(clone(sync || {})) || {};
    sync.version = finite(sync.version, 12);
    sync.battleId = finite(sync.battleId, 0);
    sync.playerTeam = Array.isArray(sync.playerTeam) ? sync.playerTeam : [];
    sync.opponentTeam = Array.isArray(sync.opponentTeam) ? sync.opponentTeam : [];
    sync.allyIndex = Math.max(0, finite(sync.allyIndex,0));
    sync.enemyIndex = Math.max(0, finite(sync.enemyIndex,0));
    sync.completed = !!sync.completed || !teamAlive(sync.playerTeam) || !teamAlive(sync.opponentTeam);
    sync.updatedAt = now();
    return sanitize(sync);
  }
  function syncFromEngine(){ let s=null; try{s=PB.battleEngine?.exportPvpSyncState?.();}catch(e){} return normalizeSync(s||{}); }
  function importSync(sync, room){
    sync = normalizeSync(sync);
    try { PB.battleEngine?.importPvpSyncState?.(sync, { reverse: !isHost(room) }); }
    catch(e){ console.warn('pvp12 import failed', e); }
  }
  function makeEndStats(sync){
    sync = normalizeSync(sync || syncFromEngine());
    const stats = sync.stats || {};
    let rows = Object.values(stats).map(s=>`<tr><td>${esc(s.name||s.pokemonName||'포켓몬')}</td><td>${finite(s.damageDealt,0)}</td><td>${finite(s.survivedDamage ?? s.damageTaken,0)}</td></tr>`).join('');
    if(!rows) rows = [...(sync.playerTeam||[]),...(sync.opponentTeam||[])].map(m=>`<tr><td>${esc(m.name||m.currentName||'포켓몬')}</td><td>${finite(m.damageDealt,0)}</td><td>${finite(m.survivedDamage ?? m.damageTaken,0)}</td></tr>`).join('') || '<tr><td colspan="3">통계 없음</td></tr>';
    const g=grid();
    if(g) g.innerHTML = `<div class="pvp12-end"><h3>배틀 통계</h3><table><thead><tr><th>포켓몬</th><th>딜량</th><th>버틴피해</th></tr></thead><tbody>${rows}</tbody></table><button type="button" class="action-button" data-pvp12-end-exit="1"><span class="action-title">나가기</span></button></div>`;
  }
  function startLocal(room){
    if(V.started) return;
    const {mine,opp}=localTeams(room);
    if(!mine.length || !opp.length){ toast('배틀 팀을 불러오지 못했습니다.'); return; }
    V.started=true; V.sent=false; V.lastSeq=finite(room.pvpV12?.lastResult?.seq,0);
    try{ ['phase2Realtime','phase2FullPvpPatch','phase2SameUiPvpFix','phase2FinalStability','phase2PvpRestStable','phase2CleanV8','phase2PvpUnifiedV9','phase2PvpUnifiedV10'].forEach(k=>{ if(PB[k]) PB[k].active=false; }); }catch(e){}
    PB.battleEngine?.startBattle?.({
      playerId:'p1', opponentId:'online_pvp_enemy',
      playerName:ch()?.name || localPlayer()?.name || '나',
      opponentName:(isHost(room)?room.target:room.challenger)?.characterName || '상대 플레이어',
      playerTeam:mine, opponentTeam:opp, mode:'online_pvp_v12', isDuo:false, skipLevelReward:true, theme:'city',
      onComplete:(payload)=>{ makeEndStats(syncFromEngine()); return true; }
    });
    setTimeout(()=>PB.battleEngine?.clearPvpWaiting?.(), 80);
  }
  async function enterRoom(id){
    const d=db(); if(!d || !uid()){ toast('로그인 후 이용하세요.'); return; }
    await stop(false);
    const ref=d.ref(`battleRooms/${id}`); const snap=await ref.get(); const room={id, ...(snap.val()||{})};
    if(!validRoom(room)){ toast('참가 가능한 배틀방이 아닙니다.'); return; }
    V.active=true; V.roomId=id; V.roomRef=ref; V.room=room; V.started=false; V.sent=false; V.resolving=false; V.lastSeq=0;
    showWait('상대방 대기 중...');
    await ref.update(sanitize({ status:'readying', [`pvpV12Ready/${myKey()}`]:true, pvpV8Disabled:true, pvpUnifiedV9Disabled:true, pvpUnifiedV10Disabled:true, updatedAt:now() })).catch(e=>console.warn('pvp12 ready failed',e));
    ref.on('value', handleSnapshot);
  }
  function handleSnapshot(snap){
    const room={id:V.roomId, ...(snap.val()||{})};
    if(!V.active || room.id !== V.roomId) return;
    V.room=room;
    onRoom(room).catch(e=>{ console.warn('pvp12 room failed', e); showWait('배틀 동기화 중...'); });
  }
  async function onRoom(room){
    if(room.status==='cancelled' || room.status==='declined'){ toast('배틀방이 종료되었습니다.'); await stop(true); return; }
    const ready=room.pvpV12Ready || {};
    if(!ready[room.challengerKey] || !ready[room.targetKey]){ showWait('상대방 대기 중...'); return; }
    if(!room.pvpV12 && isHost(room)){
      await db().ref(`battleRooms/${room.id}`).transaction(cur=>{ if(!cur) return cur; if(!cur.pvpV12) cur.pvpV12=makeState({id:room.id, ...cur}); cur.status='inProgress'; cur.updatedAt=now(); return sanitize(cur); });
      return;
    }
    if(!room.pvpV12){ showWait('배틀 준비 중...'); return; }
    startLocal(room);
    const p=room.pvpV12;
    const result=p.lastResult;
    if(result && finite(result.seq,0) > V.lastSeq){
      V.lastSeq=finite(result.seq,0); V.sent=false;
      importSync(result.syncState || {}, room);
      if(p.phase==='completed' || room.status==='completed' || result.syncState?.completed){ makeEndStats(result.syncState); return; }
      setTimeout(()=>PB.battleEngine?.clearPvpWaiting?.(), 120);
    }
    if(p.phase==='forceSwitch'){
      V.sent=false;
      if(isHost(room)) await maybeResolveForceSwitch(room);
      renderForceSwitch(room);
      return;
    }
    if(isHost(room) && !V.resolving && p.phase==='selecting' && p.actions?.[room.challengerKey] && p.actions?.[room.targetKey]){
      V.resolving=true;
      try{ await resolveHost(room); }catch(e){ console.warn('pvp12 resolve failed', e); await recoverHost(room); }
      V.resolving=false;
      return;
    }
    const mine=p.actions?.[myKey()]; const other=p.actions?.[otherKey(room)];
    if(mine && !other){ V.sent=true; showWait('상대방이 선택하는 중'); return; }
    if(!mine && !other && p.phase==='selecting'){ V.sent=false; if(V.started) setTimeout(()=>PB.battleEngine?.clearPvpWaiting?.(), 100); }
  }
  function faintNeeds(sync, room){
    const required=[];
    const optional=[];
    const h=room.challengerKey, g=room.targetKey;
    const ht=sync.playerTeam||[], gt=sync.opponentTeam||[];
    const hi=finite(sync.allyIndex,0), gi=finite(sync.enemyIndex,0);
    const hostFainted=ht[hi] && !alive(ht[hi]) && teamAlive(ht);
    const guestFainted=gt[gi] && !alive(gt[gi]) && teamAlive(gt);
    if(hostFainted) required.push(h); else if(guestFainted && teamAlive(ht) && ht.some((m,i)=>i!==hi && alive(m))) optional.push(h);
    if(guestFainted) required.push(g); else if(hostFainted && teamAlive(gt) && gt.some((m,i)=>i!==gi && alive(m))) optional.push(g);
    return { required, optional };
  }
  async function resolveHost(room){
    const p=room.pvpV12; const h=room.challengerKey, g=room.targetKey;
    await db().ref(`battleRooms/${room.id}/pvpV12/phase`).set('resolving').catch(()=>{});
    let sync=null;
    try{ sync=await PB.battleEngine?.resolvePvpSyncedTurn?.(p.actions[h], p.actions[g]); }
    catch(e){ console.warn('resolvePvpSyncedTurn error', e); sync=syncFromEngine(); }
    sync=normalizeSync(sync || syncFromEngine() || {});
    const hostAlive=teamAlive(sync.playerTeam), guestAlive=teamAlive(sync.opponentTeam);
    const seq=finite(p.seq,0)+1; const updates={};
    updates[`battleRooms/${room.id}/pvpV12/actions`]=null;
    updates[`battleRooms/${room.id}/pvpV12/seq`]=seq;
    updates[`battleRooms/${room.id}/pvpV12/lastResult`]={seq, turn:finite(p.turn,1), syncState:sync, createdAt:now()};
    updates[`battleRooms/${room.id}/pvpV12/updatedAt`]=now();
    if(!hostAlive || !guestAlive || sync.completed){
      const winnerKey=hostAlive && !guestAlive ? h : guestAlive && !hostAlive ? g : (hostAlive?h:g);
      const winnerPub=winnerKey===h?room.challenger:room.target;
      updates[`battleRooms/${room.id}/status`]='completed';
      updates[`battleRooms/${room.id}/result`]={winnerKey, winnerName:winnerPub?.characterName||'', completedAt:now(), pvpV12:true};
      updates[`battleRooms/${room.id}/pvpV12/phase`]='completed';
      if(room.mode==='champion' && winnerKey===h) updates['competitive/champion']={...room.challenger, championSince:now(), reason:'challengeWin'};
    } else {
      const need=faintNeeds(sync, room);
      if(need.required.length || need.optional.length){
        updates[`battleRooms/${room.id}/pvpV12/phase`]='forceSwitch';
        updates[`battleRooms/${room.id}/pvpV12/forceSwitch`]={ required:need.required, optional:need.optional, choices:null, syncState:sync, seq };
      } else {
        updates[`battleRooms/${room.id}/pvpV12/turn`]=finite(p.turn,1)+1;
        updates[`battleRooms/${room.id}/pvpV12/phase`]='selecting';
      }
    }
    await db().ref().update(sanitize(updates));
  }
  async function recoverHost(room){
    const p=room.pvpV12||{}; const seq=finite(p.seq,0)+1;
    const sync=normalizeSync(syncFromEngine() || { playerTeam:p.teams?.[room.challengerKey]||[], opponentTeam:p.teams?.[room.targetKey]||[], log:['턴을 복구했습니다.'], completed:false });
    await db().ref().update(sanitize({
      [`battleRooms/${room.id}/pvpV12/actions`]:null,
      [`battleRooms/${room.id}/pvpV12/seq`]:seq,
      [`battleRooms/${room.id}/pvpV12/lastResult`]:{seq, turn:finite(p.turn,1), syncState:sync, createdAt:now(), recovered:true},
      [`battleRooms/${room.id}/pvpV12/turn`]:finite(p.turn,1)+1,
      [`battleRooms/${room.id}/pvpV12/phase`]:'selecting',
      [`battleRooms/${room.id}/pvpV12/updatedAt`]:now()
    }));
  }
  function localForceTeam(fs, room){
    const sync=normalizeSync(fs?.syncState || room.pvpV12?.lastResult?.syncState || syncFromEngine());
    const team=isHost(room)?sync.playerTeam:sync.opponentTeam;
    const active=isHost(room)?finite(sync.allyIndex,0):finite(sync.enemyIndex,0);
    return {sync, team, active};
  }
  function renderForceSwitch(room){
    const p=room.pvpV12; const fs=p.forceSwitch||{}; const choices=fs.choices||{};
    if(choices[myKey()]){ showWait('상대 교체 선택 대기 중...', true); return; }
    const required=(fs.required||[]).includes(myKey()); const optional=(fs.optional||[]).includes(myKey());
    if(!required && !optional){ showWait('상대 교체 선택 대기 중...', true); return; }
    importSync(fs.syncState || p.lastResult?.syncState || {}, room);
    const {team,active}=localForceTeam(fs, room);
    const options=(team||[]).map((m,i)=>({m,i})).filter(x=>x.i!==active && alive(x.m));
    const g=grid();
    if(!g) return;
    g.innerHTML = `<div class="pvp12-switch"><h3>${required?'포켓몬 교체':'상대 포켓몬이 쓰러졌습니다'}</h3><p>${required?'출전할 포켓몬을 선택하세요.':'그대로 진행하거나 포켓몬을 교체할 수 있습니다.'}</p>${optional?'<button type="button" class="action-button" data-pvp12-stay="1"><span class="action-title">그대로</span></button>':''}<div class="pvp12-switch-list">${options.map(x=>`<button type="button" class="action-button" data-pvp12-switch-index="${x.i}"><span class="action-title">${esc(x.m.name||x.m.currentName||'포켓몬')}</span><span class="action-sub">HP ${finite(x.m.currentHp,0)}/${finite(x.m.maxHp,0)}</span></button>`).join('') || '<div>교체 가능한 포켓몬이 없습니다.</div>'}</div></div>`;
  }
  async function submitSwitchChoice(choice){
    if(!V.active || !V.roomId || !db()) return;
    await db().ref(`battleRooms/${V.roomId}/pvpV12/forceSwitch/choices/${myKey()}`).set(sanitize({...choice, at:now()}));
    showWait('상대 교체 선택 대기 중...', true);
  }
  async function maybeResolveForceSwitch(room){
    const fs=room.pvpV12?.forceSwitch; if(!fs) return;
    const required=fs.required||[], optional=fs.optional||[], all=[...new Set([...required,...optional])]; const choices=fs.choices||{};
    if(!all.every(k=>choices[k])) return;
    const sync=normalizeSync(fs.syncState || room.pvpV12?.lastResult?.syncState || {});
    const applyChoice=(key,choice)=>{
      if(!choice || choice.type!=='switch') return;
      const idx=Math.max(0,finite(choice.index,0));
      if(key===room.challengerKey && sync.playerTeam?.[idx] && alive(sync.playerTeam[idx])) sync.allyIndex=idx;
      if(key===room.targetKey && sync.opponentTeam?.[idx] && alive(sync.opponentTeam[idx])) sync.enemyIndex=idx;
    };
    Object.entries(choices).forEach(([k,ch])=>applyChoice(k,ch));
    const p=room.pvpV12; const seq=finite(p.seq,0)+1;
    await db().ref().update(sanitize({
      [`battleRooms/${room.id}/pvpV12/seq`]:seq,
      [`battleRooms/${room.id}/pvpV12/lastResult`]:{seq, turn:finite(p.turn,1), syncState:sync, createdAt:now(), forceSwitchResolved:true},
      [`battleRooms/${room.id}/pvpV12/forceSwitch`]:null,
      [`battleRooms/${room.id}/pvpV12/phase`]:'selecting',
      [`battleRooms/${room.id}/pvpV12/turn`]:finite(p.turn,1)+1,
      [`battleRooms/${room.id}/pvpV12/actions`]:null,
      [`battleRooms/${room.id}/pvpV12/updatedAt`]:now()
    }));
  }
  async function submit(action){
    if(!V.active || !V.started || !V.roomId || !db() || V.sent || V.submitting) return;
    const p=V.room?.pvpV12; if(!p || p.phase!=='selecting') return;
    V.submitting=true; V.sent=true; showWait('상대방이 선택하는 중');
    try{ await db().ref(`battleRooms/${V.roomId}/pvpV12/actions/${myKey()}`).set(sanitize({...action, at:now()})); }
    catch(e){ V.sent=false; toast('행동 저장 실패'); console.warn(e); }
    V.submitting=false;
  }
  async function stop(goLobby){
    if(V.roomRef){ try{ V.roomRef.off('value', handleSnapshot); }catch(e){} }
    V.active=false; V.roomId=null; V.roomRef=null; V.room=null; V.started=false; V.sent=false; V.resolving=false; V.lastSeq=0;
    if(goLobby && core()?.state){ core().state.currentScreen='lobby'; ui()?.renderAll?.(); }
  }
  function renderItemTargets(itemId){
    if(!V.active || !V.started || V.sent) return false;
    const snap=PB.battleEngine?.getSnapshot?.(); const team=snap?.playerTeam || [];
    const norm=String(itemId||'').toLowerCase(); const g=grid(); if(!g) return false;
    if(['pp_aid','pp_aide'].includes(norm)){
      const active=team[finite(snap?.allyIndex,0)] || team[0];
      g.innerHTML=`<div class="pvp12-item-target"><h3>PP 회복 기술 선택</h3>${(active?.moves||[]).map((m,i)=>`<button type="button" class="action-button" data-pvp12-item-move="${i}" data-item-id="${esc(itemId)}"><span class="action-title">${esc(m.nameKo||m.name||'기술')}</span></button>`).join('')}<button class="action-button" data-battle-bag="1"><span class="action-title">뒤로</span></button></div>`; return true;
    }
    const includeFainted=norm==='revive_shard';
    const targets=team.map((m,i)=>({m,i})).filter(x=>includeFainted ? finite(x.m.currentHp,0)<=0 : finite(x.m.currentHp,0)>0);
    g.innerHTML=`<div class="pvp12-item-target"><h3>사용 대상 선택</h3><div class="pvp12-target-list">${targets.map(x=>`<button type="button" class="action-button" data-pvp12-item-target="${x.i}" data-item-id="${esc(itemId)}"><span class="action-title">${esc(x.m.name||x.m.currentName||'포켓몬')}</span><span class="action-sub">HP ${finite(x.m.currentHp,0)}/${finite(x.m.maxHp,0)}</span></button>`).join('') || '<div>사용 가능한 대상이 없습니다.</div>'}</div><button class="action-button" data-battle-bag="1"><span class="action-title">뒤로</span></button></div>`;
    return true;
  }
  function bind(){
    if(V.bound) return; V.bound=true;
    document.addEventListener('click', async (e)=>{
      const start=e.target.closest?.('[data-p2-room-start]');
      if(start){ e.preventDefault(); e.stopImmediatePropagation(); await enterRoom(start.dataset.p2RoomStart); return; }
      if(e.target.closest?.('[data-pvp12-exit]')){ e.preventDefault(); e.stopImmediatePropagation(); if(V.roomId && db()) await db().ref(`battleRooms/${V.roomId}`).update({status:'cancelled', updatedAt:now()}).catch(()=>{}); await stop(true); return; }
      if(e.target.closest?.('[data-pvp12-end-exit]')){ e.preventDefault(); e.stopImmediatePropagation(); await stop(true); return; }
      const stay=e.target.closest?.('[data-pvp12-stay]'); if(stay){ e.preventDefault(); e.stopImmediatePropagation(); await submitSwitchChoice({type:'stay'}); return; }
      const fsw=e.target.closest?.('[data-pvp12-switch-index]'); if(fsw){ e.preventDefault(); e.stopImmediatePropagation(); await submitSwitchChoice({type:'switch', index:finite(fsw.dataset.pvp12SwitchIndex,0)}); return; }
      if(!V.active || !V.started) return;
      const imv=e.target.closest?.('[data-pvp12-item-move]'); if(imv){ e.preventDefault(); e.stopImmediatePropagation(); await submit({type:'item', itemId:imv.dataset.itemId||'pp_aid', moveIndex:finite(imv.dataset.pvp12ItemMove,0)}); return; }
      const itg=e.target.closest?.('[data-pvp12-item-target]'); if(itg){ e.preventDefault(); e.stopImmediatePropagation(); await submit({type:'item', itemId:itg.dataset.itemId, targetIndex:finite(itg.dataset.pvp12ItemTarget,0)}); return; }
      const action=e.target.closest?.('[data-battle-action]');
      if(action){ const a=action.dataset.battleAction; if(['fight','bag','pokemon','info'].includes(a)){ e.preventDefault(); e.stopImmediatePropagation(); if(!V.sent){ PB.battleEngine?.clearPvpWaiting?.(); PB.battleEngine?.handleRootAction?.(a); } return; } }
      const root=e.target.closest?.('[data-battle-root]'); if(root){ e.preventDefault(); e.stopImmediatePropagation(); if(!V.sent) PB.battleEngine?.setMenu?.('root'); return; }
      const bag=e.target.closest?.('[data-battle-bag]'); if(bag){ e.preventDefault(); e.stopImmediatePropagation(); if(!V.sent) PB.battleEngine?.setMenu?.('bag'); return; }
      const mv=e.target.closest?.('[data-battle-move]'); if(mv){ e.preventDefault(); e.stopImmediatePropagation(); await submit({type:'move', index:finite(mv.dataset.battleMove,0)}); return; }
      const sw=e.target.closest?.('[data-battle-switch]'); if(sw){ e.preventDefault(); e.stopImmediatePropagation(); await submit({type:'switch', index:finite(sw.dataset.battleSwitch,0)}); return; }
      const item=e.target.closest?.('[data-battle-item]'); if(item){ e.preventDefault(); e.stopImmediatePropagation(); const id=item.dataset.battleItem; renderItemTargets(id); return; }
    }, true);
  }
  function css(){
    if(document.getElementById('pvp12-style')) return;
    const st=document.createElement('style'); st.id='pvp12-style'; st.textContent=`
      .pvp12-wait,.pvp12-switch,.pvp12-item-target{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;width:100%;min-height:126px;background:rgba(255,255,255,.94);border-radius:18px;color:#06101f!important;font-weight:1000;text-align:center;padding:16px;box-sizing:border-box;}.pvp12-wait *,.pvp12-switch *,.pvp12-item-target *{color:#06101f!important;-webkit-text-fill-color:#06101f!important}.pvp12-wait button{border:0;border-radius:999px;background:#111827;color:#fff!important;-webkit-text-fill-color:#fff!important;font-weight:1000;padding:9px 14px}.pvp12-end{width:100%;background:rgba(255,255,255,.96);color:#06101f!important;border-radius:18px;padding:12px;box-sizing:border-box;}.pvp12-end *{color:#06101f!important;-webkit-text-fill-color:#06101f!important}.pvp12-end table{width:100%;border-collapse:collapse}.pvp12-end td,.pvp12-end th{padding:5px;border-bottom:1px solid rgba(0,0,0,.12);text-align:left}.pvp12-switch-list,.pvp12-target-list{display:grid;grid-template-columns:1fr;gap:8px;width:100%;}
    `; document.head.appendChild(st);
  }
  function init(){ css(); bind(); window.PB_REALTIME_PVP={enterRoom, close:()=>stop(false), __pvpV12:true}; window.PB_STABLE_PVP=window.PB_REALTIME_PVP; }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init, {once:true}); else init();
})();
