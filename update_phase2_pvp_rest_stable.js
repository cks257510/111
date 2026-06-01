(function(){
  'use strict';
  const PB = window.POKEBATTLE || (window.POKEBATTLE = {});
  const ST = PB.phase2PvpRestStable = PB.phase2PvpRestStable || {active:false, roomId:null, roomRef:null, room:null, started:false, lastTurn:0, resolving:false, sent:false, rest:false};
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const now=()=>Date.now();
  const core=()=>PB.core;
  const ui=()=>PB.ui;
  const online=()=>PB.online||{};
  const db=()=>online().db||null;
  const uid=()=>online().uid||null;
  const slot=()=>online().selectedSlot||'char1';
  const myKey=()=>uid()?`${uid()}_${slot()}`:'';
  const player=()=>core()?.getPlayer?.('p1')||core()?.getActivePlayer?.()||null;
  const curChar=()=>online().selectedCharacter||null;
  const toast=m=>ui()?.showToast?.(m);
  function baseById(id){ return core()?.state?.pokemonById?.get?.(Number(id)); }
  function monName(p){ return p?.currentName||p?.name||p?.base?.nameKo||p?.nameKo||'포켓몬'; }
  function compact(p){
    if(!p?.base) return null;
    return {uid:p.uid||`p_${p.base.id}_${Math.random().toString(36).slice(2,7)}`,sourceUid:p.sourceUid||p.uid||'',baseId:Number(p.base.id||0),name:monName(p),level:Math.min(100,Number(p.level||5)),maxHp:Number(p.maxHp||p.stats?.hp||1),currentHp:Math.max(0,Number(p.currentHp??p.maxHp??1)),status:p.status||'',bloodline:p.bloodline||'normal',enhanceLevel:Number(p.enhanceLevel||0),statStages:{...(p.statStages||{})},volatile:{...(p.volatile||{})},stats:{...(p.stats||{})},heldItems:(p.heldItems||(p.heldItem?[p.heldItem]:[])).map(it=>({...(it||{})})),moves:(p.moves||[]).slice(0,4).map(m=>({...m,currentPP:Number(m.currentPP??m.pp??m.maxPP??10),maxPP:Number(m.maxPP??m.pp??10)}))};
  }
  function inflate(d){
    const b=baseById(d?.baseId), c=core(); if(!b||!c?.createRuntimePokemon) return null;
    const p=c.createRuntimePokemon(b, Math.min(100,Number(d.level||5)));
    p.uid=d.uid||p.uid; p.sourceUid=d.sourceUid||p.sourceUid; p.currentName=d.name||p.currentName; p.bloodline=d.bloodline||p.bloodline||'normal'; p.enhanceLevel=Number(d.enhanceLevel||0);
    try{ c.recalculateRuntimeStats?.(p,{fullHeal:true}); }catch(e){}
    if(d.stats) p.stats={...(p.stats||{}),...d.stats};
    p.maxHp=Number(d.maxHp||p.maxHp||1); p.currentHp=Math.max(0,Math.min(p.maxHp,Number(d.currentHp??p.maxHp))); p.status=d.status||'';
    p.statStages={...(d.statStages||{})}; p.volatile={...(d.volatile||{})};
    p.heldItems=Array.isArray(d.heldItems)?d.heldItems.map(it=>({...it})):[]; p.heldItem=p.heldItems[0]||null;
    if(Array.isArray(d.moves)&&d.moves.length) p.moves=d.moves.slice(0,4).map(m=>({...m}));
    return p;
  }
  function team(){ return (player()?.squad||[]).slice(0,3).map(compact).filter(Boolean); }
  function pubTeam(pub){ return (pub?.battleTeam||pub?.squad||[]).slice(0,3).map(x=>inflate(x)).filter(Boolean).map(compact); }
  function isHost(room){ return myKey() && room?.challengerKey===myKey(); }
  function isGuest(room){ return myKey() && room?.targetKey===myKey(); }
  function otherKey(room){ return isHost(room)?room.targetKey:room.challengerKey; }
  function alive(list){ return (list||[]).some(p=>Number(p?.currentHp||0)>0); }
  function firstAlive(list){ const n=(list||[]).findIndex(p=>Number(p?.currentHp||0)>0); return n<0?0:n; }
  function ensureCss(){ if(document.getElementById('pvp-rest-stable-style')) return; const s=document.createElement('style'); s.id='pvp-rest-stable-style'; s.textContent=`
    .stable-rest-shell{position:relative;min-height:calc(100dvh - 150px);height:calc(100dvh - 150px);overflow:hidden;background:transparent!important;border:0!important;margin:0!important;padding:0!important;}
    .stable-rest-exit{position:absolute;right:12px;top:12px;z-index:12;border:1px solid rgba(255,255,255,.35);border-radius:999px;background:rgba(0,0,0,.55);color:#fff!important;padding:9px 14px;font-weight:1000;}
    .stable-rest-main{position:absolute;right:17%;bottom:18%;z-index:8;width:84px;height:84px;display:flex;align-items:center;justify-content:center;cursor:pointer;touch-action:manipulation;}
    .stable-rest-main img{max-width:100%;max-height:100%;object-fit:contain;filter:drop-shadow(0 6px 16px rgba(0,0,0,.35));}
    .stable-rest-main span{display:flex;width:68px;height:68px;align-items:center;justify-content:center;border-radius:50%;background:#ffd84f;color:#06101f;font-weight:1000;}
    .stable-rest-main.jump{animation:stableRestJump 1s ease-in-out 1;}
    @keyframes stableRestJump{0%,100%{transform:translateY(0)}35%{transform:translateY(-26px)}70%{transform:translateY(4px)}}
    .stable-pvp-wait{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;width:100%;min-height:116px;background:rgba(255,255,255,.92);border-radius:18px;color:#06101f!important;font-weight:1000;text-align:center;padding:16px;}
    .stable-pvp-wait button{border:0;border-radius:999px;background:#111827;color:#fff!important;font-weight:1000;padding:9px 14px;}
    .battle-action-grid .action-button,.battle-action-grid .action-button span,.battle-action-grid .action-button div:not(.type-badge),.battle-move-button,.battle-move-button *:not(.type-badge):not(.battle-category-pill){color:#050b18!important;-webkit-text-fill-color:#050b18!important;text-shadow:none!important;}
  `; document.head.appendChild(s); }
  function renderRest(){
    ensureCss(); ST.rest=true; try{ clearInterval(PB.phase2ContentFix3?.restTimer); clearInterval(PB.phase2ContentHotfix?.restTimer); clearInterval(PB.phase2ContentV2?.restTimer); }catch(e){}
    const shell=document.querySelector('.p2-online-shell')||document.getElementById('content-area')||document.querySelector('.content-scroll'); if(!shell) return;
    const tabs=document.querySelector('.p2-tabs')?.outerHTML || document.querySelector('.online-tab-row')?.outerHTML || '';
    const m=(player()?.squad||[])[0]; const src=m?.base?.image||m?.base?.sprite||'';
    shell.innerHTML=tabs+`<section class="stable-rest-shell"><button type="button" class="stable-rest-exit" data-stable-rest-exit="1">나가기</button><div class="stable-rest-main" data-stable-rest-main="1">${src?`<img src="${esc(src)}" alt="${esc(monName(m))}">`:`<span>${esc(String(monName(m)).slice(0,1))}</span>`}</div></section>`;
  }
  function leaveRest(){ ST.rest=false; if(PB.phase2Online) PB.phase2Online.tab='ranked'; ui()?.renderAll?.(); }
  function showWait(msg){ core().state.currentScreen='battle'; ui()?.renderAll?.(); const grid=document.getElementById('battle-action-grid'); if(grid) grid.innerHTML=`<div class="stable-pvp-wait"><div>${esc(msg)}</div><button type="button" data-stable-pvp-exit="1">나가기</button></div>`; const log=document.getElementById('battle-log'); if(log) log.textContent=msg; }
  function stopPvp(){ if(ST.roomRef){ try{ST.roomRef.off();}catch(e){} } ST.active=false; ST.roomId=null; ST.roomRef=null; ST.room=null; ST.started=false; ST.sent=false; ST.resolving=false; }
  async function exitPvp(){ const d=db(); if(ST.roomId&&d){ try{ await d.ref(`battleRooms/${ST.roomId}`).update({status:'cancelled',cancelledBy:myKey(),updatedAt:now()}); }catch(e){} } stopPvp(); core().state.currentScreen='lobby'; ui()?.renderAll?.(); }
  function makeInitial(room){ const h = isHost(room)?team():pubTeam(room.challenger); const g = isGuest(room)?team():pubTeam(room.target); return {version:5,phase:'select',turn:1,hostKey:room.challengerKey,guestKey:room.targetKey,actions:null,lastResult:null,teams:{[room.challengerKey]:h,[room.targetKey]:g},createdAt:now(),updatedAt:now()}; }
  function syncFromEngine(){ try{return PB.battleEngine?.exportPvpSyncState?.();}catch(e){return null;} }
  function auto(sync){ if(!sync) return sync; const fix=(team,idx)=>{idx=Number(idx||0); return team?.[idx]&&Number(team[idx].currentHp||0)>0?idx:firstAlive(team);}; sync.allyIndex=fix(sync.playerTeam,sync.allyIndex); sync.enemyIndex=fix(sync.opponentTeam,sync.enemyIndex); sync.completed=!(alive(sync.playerTeam)&&alive(sync.opponentTeam)); return sync; }
  function startLocal(room){
    if(ST.started) return; const p=room.pvpStable; if(!p?.teams) return;
    const mine=isHost(room)?p.teams[room.challengerKey]:p.teams[room.targetKey]; const opp=isHost(room)?p.teams[room.targetKey]:p.teams[room.challengerKey];
    const myT=(mine||[]).map(inflate).filter(Boolean), opT=(opp||[]).map(inflate).filter(Boolean); if(!myT.length||!opT.length){ toast('배틀 팀을 불러오지 못했습니다.'); return; }
    ST.started=true; ST.lastTurn=Number(p.lastResult?.turn||0); ST.sent=!!p.actions?.[myKey()];
    try{ if(PB.phase2FinalStability) PB.phase2FinalStability.active=false; if(PB.phase2ContentFix3) PB.phase2ContentFix3.active=false; }catch(e){}
    PB.battleEngine?.startBattle?.({playerId:'p1',opponentId:'online_pvp_enemy',playerName:curChar()?.name||player()?.name||'나',opponentName:(isHost(room)?room.target:room.challenger)?.characterName||'상대 플레이어',playerTeam:myT,opponentTeam:opT,mode:'online_pvp',isDuo:true,skipLevelReward:true,theme:'city',onComplete:(payload)=>{ renderStats(payload); return true; }});
  }
  function renderStats(payload){
    const stats=payload?.stats || syncFromEngine()?.stats || {}; const vals=Object.values(stats);
    const rows=vals.map(s=>`<tr><td>${esc(s.name||s.pokemonName||'포켓몬')}</td><td>${Number(s.damageDealt||0)}</td><td>${Number(s.survivedDamage||s.damageTaken||0)}</td></tr>`).join('') || '<tr><td colspan="3">통계 없음</td></tr>';
    const grid=document.getElementById('battle-action-grid'); if(grid) grid.innerHTML=`<div class="fix3-endstats"><h3>배틀 통계</h3><table><thead><tr><th>포켓몬</th><th>딜량</th><th>버틴피해</th></tr></thead><tbody>${rows}</tbody></table><button class="action-button" data-stable-end-exit="1"><span class="action-title">나가기</span></button></div>`;
  }
  async function enterRoom(id){
    const d=db(); if(!d||!uid()){toast('로그인 후 이용하세요.'); return;} stopPvp(); const ref=d.ref(`battleRooms/${id}`); const snap=await ref.get(); const r={id,...(snap.val()||{})}; if(!r.id || !(isHost(r)||isGuest(r))){ toast('참가 가능한 방이 아닙니다.'); return; }
    ST.active=true; ST.roomId=id; ST.roomRef=ref; ST.room=r; ST.started=false; ST.lastTurn=0; ST.sent=false; showWait('상대방 대기 중...');
    await ref.update({status:'readying',[`stableReady/${myKey()}`]:true,updatedAt:now()}).catch(e=>console.warn(e));
    ref.on('value', async sn=>{ const room={id,...(sn.val()||{})}; if(!ST.active||room.id!==ST.roomId) return; ST.room=room; await onRoom(room); });
  }
  async function onRoom(room){
    const readyH=!!room.stableReady?.[room.challengerKey], readyG=!!room.stableReady?.[room.targetKey]; if(!(readyH&&readyG)){ showWait('상대방 대기 중...'); return; }
    if(!room.pvpStable && isHost(room)){ await db().ref(`battleRooms/${room.id}`).transaction(cur=>{ if(!cur) return cur; if(!cur.pvpStable) cur.pvpStable=makeInitial({id:room.id,...cur}); cur.status='inProgress'; cur.updatedAt=now(); return cur; }); return; }
    if(!room.pvpStable){ showWait('배틀 준비 중...'); return; }
    startLocal(room); const p=room.pvpStable;
    const lr=p.lastResult; if(lr && Number(lr.turn||0)>ST.lastTurn){ ST.lastTurn=Number(lr.turn||0); ST.sent=false; try{ PB.battleEngine?.importPvpSyncState?.(auto(lr.syncState),{reverse:!isHost(room)}); }catch(e){ console.warn('PVP 반영 실패',e); } setTimeout(()=>PB.battleEngine?.clearPvpWaiting?.(),80); if(room.status==='completed'||p.phase==='completed'){ renderStats({stats:lr.syncState?.stats||{}}); } }
    if(isHost(room) && !ST.resolving && p.phase==='select' && p.actions?.[room.challengerKey] && p.actions?.[room.targetKey]){ ST.resolving=true; try{ await resolveHost(room); }catch(e){ console.warn('stable pvp resolve failed',e); await recover(room); } ST.resolving=false; }
    const mine=p.actions?.[myKey()], other=p.actions?.[otherKey(room)]; if(mine&&!other) showWait('상대방이 선택하는 중');
  }
  async function resolveHost(room){ const p=room.pvpStable, h=room.challengerKey, g=room.targetKey; let sync; try{ sync=await PB.battleEngine?.resolvePvpSyncedTurn?.(p.actions[h],p.actions[g]); }catch(e){ console.warn(e); sync=syncFromEngine(); } sync=auto(sync||{}); const hAlive=alive(sync.playerTeam), gAlive=alive(sync.opponentTeam); const u={}; u[`battleRooms/${room.id}/pvpStable/actions`]=null; u[`battleRooms/${room.id}/pvpStable/lastResult`]={turn:Number(p.turn||1),syncState:sync,createdAt:now()}; u[`battleRooms/${room.id}/pvpStable/updatedAt`]=now(); if(!hAlive||!gAlive||sync.completed){const winnerKey=hAlive&&!gAlive?h:gAlive&&!hAlive?g:(hAlive?h:g); u[`battleRooms/${room.id}/status`]='completed'; u[`battleRooms/${room.id}/result`]={winnerKey,winnerName:(winnerKey===h?room.challenger:room.target)?.characterName||'',completedAt:now(),sameUi:true}; u[`battleRooms/${room.id}/pvpStable/phase`]='completed'; if(room.mode==='champion'&&winnerKey===h) u['competitive/champion']={...room.challenger,championSince:now(),reason:'sameUiChallengeWin'};} else {u[`battleRooms/${room.id}/pvpStable/turn`]=Number(p.turn||1)+1; u[`battleRooms/${room.id}/pvpStable/phase`]='select';} await db().ref().update(u); }
  async function recover(room){ const sync=auto(syncFromEngine()||{playerTeam:room.pvpStable?.teams?.[room.challengerKey]||[],opponentTeam:room.pvpStable?.teams?.[room.targetKey]||[],log:['턴을 복구했습니다.'],completed:false}); await db().ref().update({[`battleRooms/${room.id}/pvpStable/actions`]:null,[`battleRooms/${room.id}/pvpStable/lastResult`]:{turn:Number(room.pvpStable?.turn||1),syncState:sync,createdAt:now()},[`battleRooms/${room.id}/pvpStable/turn`]:Number(room.pvpStable?.turn||1)+1,[`battleRooms/${room.id}/pvpStable/phase`]:'select',[`battleRooms/${room.id}/pvpStable/updatedAt`]:now()}); }
  async function submit(action){ if(!ST.active||!ST.roomId||!db()) return; ST.sent=true; showWait('상대방이 선택하는 중'); await db().ref(`battleRooms/${ST.roomId}/pvpStable/actions/${myKey()}`).set({...action,at:now()}); }
  document.addEventListener('click', async e=>{
    const rest=e.target.closest?.('[data-p2-tab="rest"]'); if(rest){ e.preventDefault(); e.stopImmediatePropagation(); if(PB.phase2Online) PB.phase2Online.tab='rest'; renderRest(); return; }
    if(e.target.closest?.('[data-stable-rest-exit]')){ e.preventDefault(); e.stopImmediatePropagation(); leaveRest(); return; }
    const rp=e.target.closest?.('[data-stable-rest-main]'); if(rp){ e.preventDefault(); e.stopImmediatePropagation(); rp.classList.remove('jump'); void rp.offsetWidth; rp.classList.add('jump'); return; }
    const start=e.target.closest?.('[data-p2-room-start]'); if(false && start){ e.preventDefault(); e.stopImmediatePropagation(); await enterRoom(start.dataset.p2RoomStart); return; }
    if(e.target.closest?.('[data-stable-pvp-exit]')){ e.preventDefault(); e.stopImmediatePropagation(); await exitPvp(); return; }
    if(e.target.closest?.('[data-stable-end-exit]')){ e.preventDefault(); e.stopImmediatePropagation(); stopPvp(); core().state.currentScreen='lobby'; ui()?.renderAll?.(); return; }
    if(!ST.active) return;
    const act=e.target.closest?.('[data-battle-action]'); if(act){ const a=act.dataset.battleAction; if(['fight','bag','pokemon','info'].includes(a)){ e.preventDefault(); e.stopImmediatePropagation(); PB.battleEngine?.clearPvpWaiting?.(); PB.battleEngine?.handleRootAction?.(a); return; } }
    const root=e.target.closest?.('[data-battle-root]'); if(root){e.preventDefault();e.stopImmediatePropagation();PB.battleEngine?.setMenu?.('root');return;}
    const mv=e.target.closest?.('[data-battle-move]'); if(mv){e.preventDefault();e.stopImmediatePropagation();await submit({type:'move',index:Number(mv.dataset.battleMove||0)});return;}
    const sw=e.target.closest?.('[data-battle-switch]'); if(sw){e.preventDefault();e.stopImmediatePropagation();await submit({type:'switch',index:Number(sw.dataset.battleSwitch||0)});return;}
    const item=e.target.closest?.('[data-battle-item]'); if(item){e.preventDefault();e.stopImmediatePropagation();await submit({type:'item',itemId:item.dataset.battleItem});return;}
    const im=e.target.closest?.('[data-battle-item-move]'); if(im){e.preventDefault();e.stopImmediatePropagation();await submit({type:'item',itemId:'pp_aid',moveIndex:Number(im.dataset.battleItemMove||0)});return;}
    const ip=e.target.closest?.('[data-battle-item-pokemon]'); if(ip){e.preventDefault();e.stopImmediatePropagation();await submit({type:'item',itemId:'revive_shard',targetIndex:Number(ip.dataset.battleItemPokemon||0)});return;}
  }, true);
  window.PB_STABLE_PVP = { enterRoom, close:stopPvp, renderRest };
  ensureCss();
})();
