(function(){
  'use strict';
  const PB = window.POKEBATTLE || (window.POKEBATTLE = {});
  const FINAL = PB.phase2FinalStability = PB.phase2FinalStability || { active:false, roomId:null, room:null, roomRef:null, localStarted:false, lastTurn:0, resolving:false, actionSent:false, allowLobbyUntil:0, chatUnread:false, chatItems:{}, replyTo:null, settingsCount:0 };
  const esc = (v)=>String(v ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm = (v)=>String(v||'').toLowerCase().replace(/[^a-z0-9_가-힣]/g,'');
  const now = ()=>Date.now();
  function core(){ return PB.core; }
  function ui(){ return PB.ui; }
  function online(){ return PB.online || {}; }
  function db(){ return online().db || null; }
  function uid(){ return online().uid || null; }
  function slot(){ return online().selectedSlot || 'char1'; }
  function myKey(){ return uid() ? `${uid()}_${slot()}` : ''; }
  function curChar(){ return online().selectedCharacter || null; }
  function player(){ return core()?.getPlayer?.('p1') || core()?.getActivePlayer?.() || null; }
  function toast(m){ ui()?.showToast?.(m); }
  function getBase(id){ return core()?.state?.pokemonById?.get?.(Number(id)); }
  function pName(p){ return p?.currentName || p?.name || p?.base?.nameKo || p?.nameKo || '포켓몬'; }
  function bloodKey(v){ const s=String(v||'normal'); if(s.includes('뮤')||s==='mew'||s==='mew_descendant'||s==='purple') return 'mew'; if(s.includes('고대')||s==='ancient'||s==='gold') return 'ancient'; if(s.includes('우수')||s==='elite'||s==='superior'||s==='great'||s==='blue') return 'elite'; return 'normal'; }
  function bloodLabel(k){ k=bloodKey(k); return k==='mew'?'뮤의 후손':k==='ancient'?'고대혈통':k==='elite'?'우수혈통':'일반혈통'; }
  function bloodColor(k){ k=bloodKey(k); return k==='mew'?'#bd79ff':k==='ancient'?'#ffd85d':k==='elite'?'#62c9ff':'#c9ced8'; }
  function serializePokemon(p){
    if(!p?.base) return null;
    return {
      uid:p.uid||`p_${p.base.id}_${Math.random().toString(36).slice(2,7)}`, sourceUid:p.sourceUid||p.uid||'', baseId:Number(p.base.id||p.id||0),
      name:pName(p), level:Math.min(100,Number(p.level||5)), types:(p.base.type||p.currentTypes||[]).slice(0,2),
      currentHp:Number(p.currentHp ?? p.maxHp ?? 1), maxHp:Number(p.maxHp||1), status:p.status||'', bloodline:p.bloodline||'normal',
      enhanceLevel:Number(p.enhanceLevel||0), heldItems:(p.heldItems||(p.heldItem?[p.heldItem]:[])).map(it=>({id:it.id||'',nameKo:it.nameKo||it.name||it.id||'지닌물건',category:it.category||'지닌물건'})),
      moves:(p.moves||[]).slice(0,4).map(m=>({...m,currentPP:Number(m.currentPP??m.pp??m.maxPP??10),maxPP:Number(m.maxPP??m.pp??10)})),
      koCount:Number(p.koCount||0), koStars:Math.min(5,Math.floor(Number(p.koCount||0)/10)),
      damageDealt:Number(p.competitiveDamageDealt||p.damageDealt||0), damageTaken:Number(p.competitiveDamageTaken||p.damageTaken||0), isShiny:Boolean(p.isShiny)
    };
  }
  function inflatePokemon(data){
    const c=core(), base=getBase(data?.baseId); if(!c||!base) return null;
    const p=c.createRuntimePokemon(base, Math.min(100,Number(data.level||5)));
    p.uid=data.uid||p.uid; p.sourceUid=data.sourceUid||p.sourceUid; p.currentName=data.name||p.currentName; p.bloodline=data.bloodline||p.bloodline||'normal'; p.enhanceLevel=Number(data.enhanceLevel||p.enhanceLevel||0);
    p.heldItems=Array.isArray(data.heldItems)?data.heldItems.map(it=>({...it})):[]; p.heldItem=p.heldItems[0]||null;
    if(Array.isArray(data.moves)&&data.moves.length) p.moves=data.moves.slice(0,4).map(m=>({...m}));
    c.recalculateRuntimeStats?.(p,{fullHeal:true});
    p.maxHp=Number(data.maxHp||p.maxHp||1); p.currentHp=Math.max(0,Math.min(p.maxHp,Number(data.currentHp??p.maxHp))); p.status=data.status||'';
    return p;
  }
  function myBattleTeam(){ return (player()?.squad||[]).slice(0,3).map(serializePokemon).filter(Boolean); }
  function teamFromPublic(pub){ return (pub?.battleTeam || pub?.squad || []).slice(0,3).map(x=>serializePokemon(inflatePokemon(x))).filter(Boolean); }
  function isHost(room){ return myKey() === room?.challengerKey; }
  function isGuest(room){ return myKey() === room?.targetKey; }
  function isParticipant(room){ return isHost(room) || isGuest(room); }
  function opponent(room){ return isHost(room) ? room.target : room.challenger; }
  function myPub(room){ return isHost(room) ? room.challenger : room.target; }
  function aliveTeam(team){ return (team||[]).some(p=>Number(p.currentHp||0)>0); }
  function applyScreenBattle(){ if(core()?.state){ core().state.currentScreen='battle'; ui()?.renderAll?.(); } }
  function showBattleMessage(msg){
    applyScreenBattle();
    const log=document.getElementById('battle-log'); if(log) log.innerHTML = `<div class="pvp-ready-wait">${esc(msg)}</div>`;
    const grid=document.getElementById('battle-action-grid'); if(grid) grid.innerHTML = `<div class="pvp-ready-wait big">${esc(msg)}</div>`;
  }
  function buildInitialState(room){
    const hTeam = isHost(room) ? myBattleTeam() : teamFromPublic(room.challenger);
    const gTeam = isGuest(room) ? myBattleTeam() : teamFromPublic(room.target);
    return {version:3, phase:'select', turn:1, hostKey:room.challengerKey, guestKey:room.targetKey, actions:{}, lastResult:null, teams:{[room.challengerKey]:hTeam,[room.targetKey]:gTeam}, createdAt:now(), updatedAt:now()};
  }
  async function initPvpStateIfNeeded(room){
    const d=db(); if(!d||!room?.id) return null;
    const ref=d.ref(`battleRooms/${room.id}`);
    await ref.transaction(cur=>{
      if(!cur) return cur;
      const r={id:room.id,...cur};
      if(!cur.pvp3){ cur.pvp3=buildInitialState(r); }
      cur.status='inProgress'; cur.updatedAt=now();
      return cur;
    });
    const snap=await ref.get(); return {id:room.id,...(snap.val()||{})};
  }
  function startLocalSameUi(room){
    if(FINAL.localStarted) return;
    if(PB.phase2FullPvpPatch){ try{ if(PB.phase2FullPvpPatch.unsub) PB.phase2FullPvpPatch.unsub.off(); }catch(e){} PB.phase2FullPvpPatch.active=false; }
    if(window.PB_REALTIME_PVP?.__oldClose){ try{ window.PB_REALTIME_PVP.__oldClose(); }catch(e){} }
    const state=room.pvp3 || room.pvp2; if(!state?.teams) return;
    const mine = isHost(room) ? state.teams[room.challengerKey] : state.teams[room.targetKey];
    const opp = isHost(room) ? state.teams[room.targetKey] : state.teams[room.challengerKey];
    const myTeam=(mine||[]).map(inflatePokemon).filter(Boolean); const oppTeam=(opp||[]).map(inflatePokemon).filter(Boolean);
    if(!myTeam.length || !oppTeam.length){ toast('배틀 팀 정보를 불러오지 못했습니다.'); return; }
    FINAL.localStarted=true; FINAL.actionSent=!!state.actions?.[myKey()]; FINAL.lastTurn=Number(state.lastResult?.turn||0);
    PB.battleEngine?.startBattle?.({playerId:'p1',opponentId:'online_pvp_enemy',playerName:curChar()?.name||player()?.name||'나',opponentName:opponent(room)?.characterName||'상대 플레이어',playerTeam:myTeam,opponentTeam:oppTeam,mode:'online_pvp',isDuo:true,skipLevelReward:true,theme:'city',onComplete:(payload)=>{ renderEndStats(payload); return true; }});
    setTimeout(decorate,80);
  }
  async function enterRoom(id){
    const d=db(); if(!d||!uid()){ toast('로그인 후 이용하세요.'); return; }
    const ref=d.ref(`battleRooms/${id}`); const snap=await ref.get(); const room={id,...(snap.val()||{})};
    if(!room?.id || !isParticipant(room)){ toast('참가 가능한 배틀방이 아닙니다.'); return; }
    if(FINAL.roomRef){ try{ FINAL.roomRef.off(); }catch(e){} }
    FINAL.active=true; FINAL.roomId=id; FINAL.room=room; FINAL.roomRef=ref; FINAL.localStarted=false; FINAL.lastTurn=0; FINAL.actionSent=false; FINAL.resolving=false;
    showBattleMessage('상대방 대기 중...');
    await ref.update({status:'readying', [`ready/${myKey()}`]:true, updatedAt:now()}).catch(e=>console.warn('ready 저장 실패',e));
    ref.on('value', snap2=>{ const r={id,...(snap2.val()||{})}; if(!r?.id) return; FINAL.room=r; onRoomUpdate(r); });
  }
  async function onRoomUpdate(room){
    if(!FINAL.active || room.id!==FINAL.roomId) return;
    const readyHost=!!room.ready?.[room.challengerKey], readyGuest=!!room.ready?.[room.targetKey];
    if(!(readyHost && readyGuest)){ showBattleMessage('상대방 대기 중...'); return; }
    let current=room;
    if(!current.pvp3 && isHost(current)){ current = await initPvpStateIfNeeded(current) || current; }
    if(!current.pvp3){ showBattleMessage('배틀 준비 중...'); return; }
    if(!FINAL.localStarted) startLocalSameUi(current);
    const pvp=current.pvp3;
    if(pvp?.lastResult && Number(pvp.lastResult.turn||0)>FINAL.lastTurn){
      FINAL.lastTurn=Number(pvp.lastResult.turn||0);
      try{ PB.battleEngine?.importPvpSyncState?.(pvp.lastResult.syncState,{reverse:!isHost(current)}); }catch(e){ console.warn('PVP 결과 반영 실패',e); }
      FINAL.actionSent=false;
      if(current.status==='completed'||pvp.phase==='completed') await settleRoom(current);
      setTimeout(decorate,80);
    }
    if(isHost(current) && FINAL.localStarted && !FINAL.resolving && pvp?.phase==='select' && pvp?.actions?.[current.challengerKey] && pvp?.actions?.[current.targetKey]){
      FINAL.resolving=true;
      try{ await resolveHostTurn(current); }
      catch(e){ console.warn('턴 계산 실패', e); await recoverHostTurn(current, e); }
      FINAL.resolving=false;
    }
    const mineAction=pvp?.actions?.[myKey()]; const otherKey=isHost(current)?current.targetKey:current.challengerKey;
    if(mineAction && !pvp?.actions?.[otherKey]) showWaiting();
  }
  function showWaiting(){
    try{ PB.battleEngine?.setPvpWaiting?.('상대방이 선택하는 중'); }catch(e){}
    const grid=document.getElementById('battle-action-grid'); if(grid) grid.innerHTML='<div class="pvp-ready-wait big">상대방이 선택하는 중</div>';
  }
  async function resolveHostTurn(room){
    const pvp=room.pvp3; const h=room.challengerKey, g=room.targetKey;
    const aH=pvp.actions[h], aG=pvp.actions[g];
    const sync=await PB.battleEngine.resolvePvpSyncedTurn(aH,aG);
    const hAlive=aliveTeam(sync.playerTeam), gAlive=aliveTeam(sync.opponentTeam);
    const updates={};
    updates[`battleRooms/${room.id}/pvp3/actions`]=null;
    updates[`battleRooms/${room.id}/pvp3/lastResult`]={turn:Number(pvp.turn||1),syncState:sync,createdAt:now()};
    updates[`battleRooms/${room.id}/pvp3/updatedAt`]=now();
    if(!hAlive || !gAlive || sync.completed){
      const winnerKey=hAlive&&!gAlive?h:gAlive&&!hAlive?g:(hAlive?h:g);
      const winnerPub=winnerKey===h?room.challenger:room.target;
      updates[`battleRooms/${room.id}/status`]='completed';
      updates[`battleRooms/${room.id}/result`]={winnerKey,winnerName:winnerPub?.characterName||'',completedAt:now(),sameUi:true};
      updates[`battleRooms/${room.id}/pvp3/phase`]='completed';
      if(room.mode==='champion' && winnerKey===room.challengerKey){ updates['competitive/champion']={...room.challenger,championSince:now(),championCount:Number(room.challenger?.championCount||0)+1,reason:'sameUiChallengeWin'}; }
    }else{
      updates[`battleRooms/${room.id}/pvp3/turn`]=Number(pvp.turn||1)+1;
      updates[`battleRooms/${room.id}/pvp3/phase`]='select';
    }
    await db().ref().update(updates);
  }
  async function recoverHostTurn(room, err){
    toast('턴 계산을 복구했습니다. 다음 턴을 진행하세요.');
    let sync=null; try{ sync=PB.battleEngine?.exportPvpSyncState?.(); }catch(e){}
    if(!sync) sync={completed:false,playerTeam:room.pvp3?.teams?.[room.challengerKey]||[],opponentTeam:room.pvp3?.teams?.[room.targetKey]||[],log:['턴 계산을 복구했습니다. 다음 턴을 진행하세요.']};
    sync.log=(sync.log||[]).concat('턴 계산을 복구했습니다. 다음 턴을 진행하세요.').slice(-24);
    await db().ref().update({[`battleRooms/${room.id}/pvp3/actions`]:null,[`battleRooms/${room.id}/pvp3/lastResult`]:{turn:Number(room.pvp3?.turn||1),syncState:sync,createdAt:now()},[`battleRooms/${room.id}/pvp3/turn`]:Number(room.pvp3?.turn||1)+1,[`battleRooms/${room.id}/pvp3/phase`]:'select',[`battleRooms/${room.id}/pvp3/updatedAt`]:now()});
  }
  async function submitAction(action){
    if(!FINAL.active || !FINAL.roomId || !db()) return false;
    FINAL.actionSent=true; showWaiting();
    await db().ref(`battleRooms/${FINAL.roomId}/pvp3/actions/${myKey()}`).set({...action,at:now()});
    return true;
  }
  async function settleRoom(room){
    const k=`pvp3_settled_${room.id}_${myKey()}`; if(localStorage.getItem(k)) return; localStorage.setItem(k,'1');
    const won=room.result?.winnerKey===myKey(); const ch=curChar(); const c=core();
    try{
      if(ch){ ch.onlinePvp=ch.onlinePvp||{wins:0,losses:0}; if(won) ch.onlinePvp.wins=Number(ch.onlinePvp.wins||0)+1; else ch.onlinePvp.losses=Number(ch.onlinePvp.losses||0)+1; }
      if(room.mode==='friendly' && Number(room.wager||0)>0){ if(won)c?.addMoney?.('p1',Number(room.wager||0)); else c?.spendMoney?.('p1',Number(room.wager||0)); }
      c?.healPlayerTeam?.('p1'); await window.PB_ONLINE_V3?.saveCharacter?.();
    }catch(e){ console.warn('배틀 정산 실패',e); }
  }
  function renderEndStats(payload){
    const stats=payload?.stats||{}; const rows=Object.values(stats).map(st=>`<tr><td>${esc(st.name||st.pokemonName||'포켓몬')}</td><td>${Number(st.damageDealt||0)}</td><td>${Number(st.survivedDamage||st.damageTaken||0)}</td></tr>`).join('') || '<tr><td colspan="3">통계 없음</td></tr>';
    const html=`<div class="p2fp-endstats"><h3>배틀 통계</h3><table><thead><tr><th>포켓몬</th><th>딜량</th><th>버틴피해</th></tr></thead><tbody>${rows}</tbody></table><button class="action-button" data-final-exit-lobby="1"><span class="action-title">나가기</span><span class="action-sub">로비로 돌아갑니다.</span></button></div>`;
    const grid=document.getElementById('battle-action-grid'); if(grid) grid.innerHTML=html;
    FINAL.endShowing=true;
  }
  function closePvp(){
    if(FINAL.roomRef){ try{ FINAL.roomRef.off(); }catch(e){} }
    FINAL.active=false; FINAL.roomId=null; FINAL.room=null; FINAL.roomRef=null; FINAL.localStarted=false; FINAL.actionSent=false;
  }
  function bindPvpClicks(){
    window.addEventListener('click', async (e)=>{
      const start=e.target.closest?.('[data-p2-room-start]');
      if(false && start){ e.preventDefault(); e.stopImmediatePropagation(); await enterRoom(start.dataset.p2RoomStart); return; }
      if(!FINAL.active) return;
      const mv=e.target.closest?.('[data-battle-move]'); if(mv){ e.preventDefault(); e.stopImmediatePropagation(); await submitAction({type:'move',index:Number(mv.dataset.battleMove||0)}); return; }
      const sw=e.target.closest?.('[data-battle-switch]'); if(sw){ e.preventDefault(); e.stopImmediatePropagation(); await submitAction({type:'switch',index:Number(sw.dataset.battleSwitch||0)}); return; }
      const item=e.target.closest?.('[data-battle-item]'); if(item){ e.preventDefault(); e.stopImmediatePropagation(); await submitAction({type:'item',itemId:item.dataset.battleItem}); return; }
      const im=e.target.closest?.('[data-battle-item-move]'); if(im){ e.preventDefault(); e.stopImmediatePropagation(); const pending=PB.battleEngine?.getSnapshot?.()?.pendingBagItem||'pp_aid'; await submitAction({type:'item',itemId:pending,moveIndex:Number(im.dataset.battleItemMove||0)}); return; }
      const ip=e.target.closest?.('[data-battle-item-pokemon]'); if(ip){ e.preventDefault(); e.stopImmediatePropagation(); await submitAction({type:'item',itemId:'revive_shard',targetIndex:Number(ip.dataset.battleItemPokemon||0)}); return; }
    }, true);
    document.addEventListener('click', (e)=>{ const ex=e.target.closest('[data-final-exit-lobby],[data-battle-exit-lobby]'); if(ex){ e.preventDefault(); e.stopImmediatePropagation(); FINAL.allowLobbyUntil=Date.now()+3000; closePvp(); if(core()?.state){ core().state.currentScreen='lobby'; ui()?.renderAll?.(); } } }, true);
  }
  function patchBattleEndGuard(){
    const c=core(); if(c && !c.__phase2FinalReturnGuard){
      c.__phase2FinalReturnGuard=true; const old=c.returnToLobby;
      c.returnToLobby=function(){ if((FINAL.endShowing||document.querySelector('.p2fp-endstats')) && Date.now()>(FINAL.allowLobbyUntil||0)) return; return old?.apply(this,arguments); };
    }
    setInterval(()=>{ if((FINAL.endShowing||document.querySelector('.p2fp-endstats')) && core()?.state?.currentScreen==='lobby' && Date.now()>(FINAL.allowLobbyUntil||0)){ core().state.currentScreen='battle'; ui()?.renderAll?.(); } },200);
  }
  function cleanSettings(){
    const roots=[...document.querySelectorAll('.settings-grid,.settings-modal .modal-body,.settings-section, .modal-body')];
    roots.forEach(root=>{
      const blocks=[...root.querySelectorAll('.nickname-change-fullpvp,.delete-character-section-v3,.delete-character-section-v4,.delete-character-section-final')];
      blocks.slice(1).forEach(n=>n.remove());
      root.querySelectorAll('[data-change-nickname-fullpvp],[data-delete-character-v3],[data-delete-character-v4]').forEach(btn=>{ const sec=btn.closest('section'); if(sec) sec.remove(); });
      if(root.classList.contains('settings-grid') || root.closest('.settings-modal')){
        if(!root.querySelector('[data-change-nickname-final]')) root.insertAdjacentHTML('beforeend',`<section class="settings-section nickname-change-final"><h3>닉네임 변경</h3><p>100재화를 사용해 온라인 닉네임을 변경합니다.</p><button type="button" class="settings-choice" data-change-nickname-final="1">닉네임 변경</button></section>`);
        if(!root.querySelector('[data-delete-character-final]')) root.insertAdjacentHTML('beforeend',`<section class="settings-section delete-character-section-final"><h3>캐릭터 삭제</h3><p>현재 선택 캐릭터만 삭제합니다. 10번 눌러야 확정됩니다.</p><button type="button" class="settings-choice danger" data-delete-character-final="1" data-count="0">캐릭터 삭제 0/10</button></section>`);
      }
      root.querySelectorAll('button').forEach(b=>{ if((b.textContent||'').includes('기본테마')){ b.closest('section')?.remove(); b.remove(); } });
    });
  }
  async function changeNickname(){
    const p=player(); if(Number(p?.money||0)<100){ toast('닉네임 변경에는 100재화가 필요합니다.'); return; }
    const name=(prompt('새 닉네임을 입력하세요', online().nickname||curChar()?.nickname||'')||'').trim().slice(0,12); if(!name) return;
    core()?.spendMoney?.('p1',100); online().nickname=name; if(curChar()) curChar().nickname=name;
    try{ await db()?.ref(`users/${uid()}`).update({nickname:name,updatedAt:now()}); await window.PB_ONLINE_V3?.saveCharacter?.(); await publishPublic(); toast('닉네임 변경 완료'); }catch(e){ console.warn(e); toast('닉네임 저장 실패'); }
    ui()?.renderAll?.();
  }
  async function deleteCharacter(){
    const on=online(), s=slot(); if(!on.characters?.[s]){ toast('삭제할 캐릭터가 없습니다.'); return; }
    const other=s==='char1'?'char2':'char1';
    try{ await db()?.ref(`characters/${uid()}/${s}`).remove(); await db()?.ref(`saves/${uid()}/${s}`).remove(); await db()?.ref(`playerPublicList/${myKey()}`).update({hidden:true,deleted:true,updatedAt:now()}).catch(()=>{}); }catch(e){ console.warn('캐릭터 삭제 DB 반영 실패',e); }
    delete on.characters[s]; on.selectedSlot=on.characters[other]?other:null; on.selectedCharacter=on.selectedSlot?on.characters[on.selectedSlot]:null;
    try{ if(window.PB_ONLINE_V3?.renderAuthPanel) window.PB_ONLINE_V3.renderAuthPanel(); }catch(e){}
    ui()?.closeModal?.(); ui()?.renderAll?.(); toast('캐릭터 삭제 완료');
  }
  async function publishPublic(){
    const p=player(), ch=curChar(); if(!db()||!uid()||!ch) return;
    const team=(p?.squad||[]).slice(0,3).map(serializePokemon).filter(Boolean);
    const st=ch.competitive||{tier:'beginner',rank:3,points:0};
    const pub={uid:uid(),slot:slot(),key:myKey(),nickname:online().nickname||ch.nickname||'',characterName:ch.name||p?.name||'트레이너',hair:ch.hair||'',tier:st.tier||'beginner',rank:Number(st.rank||3),points:Number(st.points||0),rankWins:Number(st.wins||0),rankLosses:Number(st.losses||0),onlineWins:Number(ch.onlinePvp?.wins||0),onlineLosses:Number(ch.onlinePvp?.losses||0),mainPokemon:team[0]||null,squad:team,battleTeam:team,status:'온라인',updatedAt:now()};
    await db().ref(`playerPublicList/${myKey()}`).set(pub).catch(()=>{});
  }
  function bindSettingsClicks(){
    document.addEventListener('click', async (e)=>{
      const nn=e.target.closest('[data-change-nickname-final]'); if(nn){ e.preventDefault(); e.stopImmediatePropagation(); await changeNickname(); return; }
      const del=e.target.closest('[data-delete-character-final]'); if(del){ e.preventDefault(); e.stopImmediatePropagation(); const n=Number(del.dataset.count||0)+1; del.dataset.count=n; del.textContent=`캐릭터 삭제 ${n}/10`; if(n>=10) await deleteCharacter(); return; }
    }, true);
  }
  function showTmInfo(id){ const item=core()?.state?.itemsById?.get?.(norm(id)) || (core()?.state?.itemList||[]).find(x=>norm(x.id)===norm(id)); if(!item) return; const root=document.getElementById('modal-root'); if(root){ root.insertAdjacentHTML('beforeend',`<div class="overlay tm-info-overlay-final"><div class="modal-card p2-modal"><div class="modal-header"><h2>${esc(item.nameKo||'기술머신')}</h2><button class="close-btn" data-final-close-top="1">✕</button></div><div class="modal-body"><p>${esc(item.description||'설명이 없습니다.')}</p><p>${esc(item.battleEffect||'')}</p></div></div></div>`); } }
  function bindUtilityClicks(){
    window.addEventListener('click', (e)=>{
      const tm=e.target.closest?.('[data-p2fp-tm-info],.tm-info-btn'); if(tm){ e.preventDefault(); e.stopImmediatePropagation(); showTmInfo(tm.dataset.p2fpTmInfo || tm.dataset.itemId || tm.dataset.selectItem || ''); return; }
      if(e.target.closest?.('[data-final-close-top]')){ e.preventDefault(); e.stopImmediatePropagation(); e.target.closest('.overlay')?.remove(); return; }
      if(e.target.closest?.('[data-hatch-egg]')){ setTimeout(()=>{ try{ ui()?.renderAll?.(); }catch(_){} }, 3600); setTimeout(()=>{ try{ ui()?.renderAll?.(); }catch(_){} }, 7000); }
    }, true);
  }
  function bindChat(){
    document.addEventListener('click', async (e)=>{
      const btn=e.target.closest('#open-chat-btn'); if(btn){ setTimeout(renderChat,20); }
      const send=e.target.closest('[data-final-chat-send]'); if(send){ e.preventDefault(); e.stopImmediatePropagation(); await sendChat(); return; }
      const rep=e.target.closest('[data-final-chat-reply]'); if(rep){ e.preventDefault(); e.stopImmediatePropagation(); FINAL.replyTo=rep.dataset.finalChatReply; renderChat(); return; }
      if(e.target.closest('[data-final-chat-clear-reply]')){ FINAL.replyTo=null; renderChat(); return; }
    }, true);
    setInterval(subscribeChat,1000);
  }
  function subscribeChat(){
    if(FINAL.chatSub || !db()) return; FINAL.chatSub=true;
    db().ref('publicChat').limitToLast(60).on('value', snap=>{ const before=Object.keys(FINAL.chatItems||{}).length; FINAL.chatItems=snap.val()||{}; const after=Object.keys(FINAL.chatItems).length; if(after>before && !document.querySelector('.final-chat-modal')) FINAL.chatUnread=true; updateChatButton(); if(document.querySelector('.final-chat-modal')) renderChat(); }, err=>{ console.warn('채팅 구독 실패',err); FINAL.chatSub=false; });
  }
  function updateChatButton(){ const b=document.getElementById('open-chat-btn'); if(b){ b.innerHTML=`채팅${FINAL.chatUnread?'<span class="chat-alert-dot"></span>':''}`; b.setAttribute('aria-label','채팅'); } }
  function renderChat(){
    FINAL.chatUnread=false; updateChatButton();
    const root=document.getElementById('modal-root'); if(!root) return;
    const arr=Object.entries(FINAL.chatItems||{}).map(([id,v])=>({id,...v})).sort((a,b)=>Number(a.timestamp||0)-Number(b.timestamp||0)).slice(-50);
    const reply=FINAL.replyTo?FINAL.chatItems[FINAL.replyTo]:null;
    root.innerHTML=`<div class="overlay"><div class="modal-card p2-modal final-chat-modal"><div class="modal-header"><h2>채팅</h2><button class="close-btn" data-p2fp-close-modal="1">✕</button></div><div class="modal-body"><div class="final-chat-list">${arr.map(m=>`<div class="final-chat-msg"><div><b>${esc(m.name||'트레이너')}</b><small>${new Date(Number(m.timestamp||Date.now())).toLocaleTimeString()}</small><button data-final-chat-reply="${esc(m.id)}">답글</button></div>${m.replyText?`<blockquote>@${esc(m.replyName||'')} ${esc(m.replyText||'')}</blockquote>`:''}<p>${esc(m.text||'')}</p></div>`).join('')||'<p>채팅이 없습니다.</p>'}</div>${reply?`<div class="final-replying">답글: ${esc(reply.text||'')} <button data-final-chat-clear-reply="1">취소</button></div>`:''}<textarea id="final-chat-input" placeholder="메시지를 입력하세요"></textarea><button class="p2-btn" data-final-chat-send="1">전송</button></div></div></div>`;
  }
  async function sendChat(){
    const input=document.getElementById('final-chat-input') || document.getElementById('p2fp-chat-input'); const text=(input?.value||'').trim(); if(!text){toast('내용을 입력하세요.');return;} if(!db()){toast('Firebase 연결 후 이용하세요.');return;}
    const reply=FINAL.replyTo?FINAL.chatItems[FINAL.replyTo]:null;
    try{ const ref=db().ref('publicChat').push(); await ref.set({uid:uid(),key:myKey(),name:online().nickname||curChar()?.name||'트레이너',text,replyId:FINAL.replyTo||'',replyName:reply?.name||'',replyText:reply?.text||'',timestamp:now()}); input.value=''; FINAL.replyTo=null; await trimChat(); renderChat(); }
    catch(e){ console.warn('채팅 전송 실패',e); toast('채팅 전송 실패: Rules에 publicChat을 추가하세요'); }
  }
  async function trimChat(){ try{ const snap=await db().ref('publicChat').orderByChild('timestamp').once('value'); const arr=[]; snap.forEach(ch=>arr.push({id:ch.key,...ch.val()})); if(arr.length>50){ const updates={}; arr.slice(0,10).forEach(m=>updates[`publicChat/${m.id}`]=null); await db().ref().update(updates); } }catch(e){} }
  function installCss(){
    if(document.getElementById('phase2-final-stability-style')) return;
    const st=document.createElement('style'); st.id='phase2-final-stability-style'; st.textContent=`
      body,body.theme-basic,.app-root,#app{background:#050914!important;color:#fff!important;}
      .theme-basic .panel-card,.theme-basic .placeholder-card,.theme-basic .summary-card,.theme-basic .online-card,.theme-basic .online-panel,.theme-basic .p2-card,.theme-basic .challenge-card,.theme-basic .market-card,.theme-basic .pokemon-card,.theme-basic .reserve-chip,.theme-basic .dungeon-map-panel,.theme-basic .category-panel,.theme-basic .lobby-card,.theme-basic .item-panel,
      .panel-card,.placeholder-card,.summary-card,.online-card,.online-panel,.p2-card,.challenge-card,.market-card,.pokemon-card,.reserve-chip,.dungeon-map-panel,.category-panel,.lobby-card,.item-panel{background:linear-gradient(180deg,rgba(12,27,52,.56),rgba(5,11,26,.42))!important;border-color:rgba(126,207,255,.26)!important;color:#fff!important;backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);box-shadow:0 16px 38px rgba(0,0,0,.22)!important;}
      .modal-card:not(.p2fp-endstats):not(.white-card){background:linear-gradient(180deg,rgba(12,27,52,.78),rgba(5,11,26,.68))!important;color:#fff!important;}
      .settings-section.nickname-change-fullpvp,.settings-section.delete-character-section-v3,.settings-section.delete-character-section-v4{display:none!important;}
      [data-theme-choice="basic"],[data-setting-theme="basic"],button[value="basic"]{display:none!important;}
      .shop-modal .shop-intro,.shop-modal .shop-summary,.shop-modal .modal-title-wrap p{display:none!important;}
      .shop-item-card h3,.shop-item-card .item-title-row h3,.shop-item-card [data-p2fp-tm-info],.shop-item-card .tm-info-btn{color:#fff!important;-webkit-text-fill-color:#fff!important;}
      .shop-price,.shop-item-card .mini-badge{color:#fff!important;-webkit-text-fill-color:#fff!important;background:rgba(0,0,0,.65)!important;}
      .battle-action-grid .action-button,.battle-action-grid .action-button span,.battle-action-grid .action-button small,.battle-move-button,.battle-move-button *:not(.type-badge):not(.battle-category-pill){color:#050b18!important;-webkit-text-fill-color:#050b18!important;text-shadow:none!important;}
      .bloodline-text-v3,.battle-bloodline-v3,.p2-blood,.rt-blood,.blood-block,.v7-blood-block,.p2fp-blood-fixed{display:inline-flex!important;align-items:center!important;justify-content:center!important;border-radius:999px!important;padding:3px 8px!important;font-size:10px!important;font-weight:1000!important;color:#06101f!important;-webkit-text-fill-color:#06101f!important;text-shadow:none!important;box-shadow:none!important;filter:none!important;animation:none!important;transition:none!important;background-image:none!important;border:1px solid rgba(255,255,255,.55)!important;contain:paint!important;}
      .bloodline-text-v3::before,.battle-bloodline-v3::before,.p2-blood::before,.blood-block::before,.v7-blood-block::before,.bloodline-text-v3::after,.battle-bloodline-v3::after,.p2-blood::after,.blood-block::after,.v7-blood-block::after{content:none!important;display:none!important;}
      .blood-normal,.bloodline-normal{background:#c9ced8!important}.blood-elite-chip,.bloodline-elite{background:#62c9ff!important}.blood-ancient-chip,.bloodline-ancient{background:#ffd85d!important}.blood-mew-chip,.bloodline-mew{background:#bd79ff!important;}
      .stat-value.is-best,.pokemon-stat-value.is-best,.squad-stat-value.is-best,[data-best-stat="1"]{color:#ff8a00!important;-webkit-text-fill-color:#ff8a00!important;border:0!important;box-shadow:none!important;text-shadow:none!important;font-weight:1000!important;}
      .pvp-ready-wait{padding:16px;border-radius:18px;background:rgba(255,255,255,.92);color:#06101f!important;font-weight:1000;text-align:center}.pvp-ready-wait.big{font-size:18px;width:100%;}
      .final-chat-modal{max-width:min(92vw,520px)!important;width:min(92vw,520px)!important}.final-chat-list{max-height:48vh;overflow:auto;display:grid;gap:8px}.final-chat-msg{border:1px solid rgba(255,255,255,.16);border-radius:14px;padding:8px;background:rgba(255,255,255,.07);white-space:normal;overflow-wrap:anywhere;word-break:break-word}.final-chat-msg b{color:#ffd95b!important}.final-chat-msg p,.final-chat-msg blockquote{white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-word;color:#fff!important}.final-chat-msg button,.final-replying button{float:right;border:0;border-radius:999px;background:#fff;color:#06101f;font-weight:900;padding:2px 7px}#final-chat-input{box-sizing:border-box;width:100%;max-width:100%;min-height:70px;border-radius:14px;border:1px solid rgba(126,207,255,.26);background:rgba(0,0,0,.28);color:#fff;padding:10px;margin:8px 0;}
      .chat-alert-dot{display:inline-block;width:9px;height:9px;border-radius:50%;background:#ff2d3d;margin-left:5px;box-shadow:0 0 0 2px rgba(0,0,0,.8)}
      .p2fp-endstats{width:100%;background:rgba(255,255,255,.92)!important;border-radius:18px;padding:12px;color:#06101f!important}.p2fp-endstats *{color:#06101f!important}.p2fp-endstats table{width:100%;border-collapse:collapse}.p2fp-endstats th,.p2fp-endstats td{padding:6px;border-bottom:1px solid rgba(0,0,0,.1);text-align:left}
    `; document.head.appendChild(st);
  }
  function decorate(){
    installCss(); cleanSettings(); updateChatButton();
    document.body.classList.remove('theme-basic'); document.body.classList.add('theme-dark');
    document.querySelectorAll('.bloodline-text-v3,.battle-bloodline-v3,.p2-blood,.rt-blood,.blood-block,.v7-blood-block').forEach(el=>{ const k=bloodKey(el.textContent); el.textContent=bloodLabel(k); el.style.setProperty('background',bloodColor(k),'important'); el.style.setProperty('color','#06101f','important'); el.style.setProperty('-webkit-text-fill-color','#06101f','important'); el.style.setProperty('box-shadow','none','important'); el.style.setProperty('animation','none','important'); });
    document.querySelectorAll('.shop-modal .modal-title-wrap p,.shop-modal .shop-intro,.shop-modal .shop-summary').forEach(n=>n.remove());
    document.querySelectorAll('.shop-item-card h3,.shop-item-card .item-title-row h3').forEach(n=>{n.style.setProperty('color','#fff','important');n.style.setProperty('-webkit-text-fill-color','#fff','important');});
  }
  function init(){
    if(!core()||!ui()){ setTimeout(init,120); return; }
    installCss(); bindPvpClicks(); bindSettingsClicks(); bindUtilityClicks(); bindChat(); patchBattleEndGuard();
    const old=window.PB_REALTIME_PVP;
    window.PB_REALTIME_PVP = Object.assign(old||{}, { __oldClose: old?.close, enterRoom, close: closePvp });
    /* v8: disabled old final decorate interval */ setTimeout(decorate,100);
  }
  document.addEventListener('DOMContentLoaded',()=>setTimeout(init,900));
})();
