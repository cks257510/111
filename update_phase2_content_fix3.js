(function(){
  'use strict';
  const PB = window.POKEBATTLE || (window.POKEBATTLE = {});
  const FIX = PB.phase2ContentFix3 = PB.phase2ContentFix3 || { active:false, roomId:null, roomRef:null, room:null, localStarted:false, lastTurn:0, resolving:false, actionSent:false, endLocked:false, endPayload:null, allowExitUntil:0, restTimer:null, restRendered:false };
  const esc = (v)=>String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
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
  function nameOf(mon){ return mon?.currentName || mon?.name || mon?.base?.nameKo || mon?.nameKo || '포켓몬'; }
  function baseById(id){ return core()?.state?.pokemonById?.get?.(Number(id)); }
  const BL = { normal:['일반혈통','#bfc5cf','#07111e'], elite:['우수혈통','#55c9ff','#07111e'], ancient:['고대혈통','#ffd84f','#161000'], mew:['뮤의 후손','#b66cff','#07111e'] };
  function bloodKey(v){ const s=String(v||'normal'); if(s.includes('뮤')||s==='mew'||s==='mew_descendant'||s==='purple') return 'mew'; if(s.includes('고대')||s==='ancient'||s==='gold') return 'ancient'; if(s.includes('우수')||s==='elite'||s==='superior'||s==='great'||s==='blue') return 'elite'; return 'normal'; }
  function bloodMeta(v){ return BL[bloodKey(v)] || BL.normal; }
  function alive(team){ return (team||[]).some(p=>Number(p?.currentHp||0)>0); }
  function firstAliveIndex(team){ return Math.max(0,(team||[]).findIndex(p=>Number(p?.currentHp||0)>0)); }
  function compactPokemon(p){
    if(!p?.base) return null;
    return { uid:p.uid||`p_${p.base.id}_${Math.random().toString(36).slice(2,7)}`, sourceUid:p.sourceUid||p.uid||'', baseId:Number(p.base.id||p.id||0), name:nameOf(p), level:Math.min(100,Number(p.level||5)), currentHp:Number(p.currentHp ?? p.maxHp ?? 1), maxHp:Number(p.maxHp||1), status:p.status||'', bloodline:p.bloodline||'normal', enhanceLevel:Number(p.enhanceLevel||0), heldItems:(p.heldItems||(p.heldItem?[p.heldItem]:[])).map(it=>({id:it.id||'',nameKo:it.nameKo||it.name||it.id||'지닌물건',category:it.category||'지닌물건'})), moves:(p.moves||[]).slice(0,4).map(m=>({...m,currentPP:Number(m.currentPP??m.pp??m.maxPP??10),maxPP:Number(m.maxPP??m.pp??10)})) };
  }
  function inflate(data){ const b=baseById(data?.baseId); const c=core(); if(!b||!c) return null; const p=c.createRuntimePokemon(b,Math.min(100,Number(data.level||5))); p.uid=data.uid||p.uid; p.sourceUid=data.sourceUid||p.sourceUid; p.currentName=data.name||p.currentName; p.bloodline=data.bloodline||p.bloodline||'normal'; p.enhanceLevel=Number(data.enhanceLevel||0); if(Array.isArray(data.moves)&&data.moves.length) p.moves=data.moves.slice(0,4).map(m=>({...m})); p.heldItems=Array.isArray(data.heldItems)?data.heldItems.map(it=>({...it})):[]; p.heldItem=p.heldItems[0]||null; c.recalculateRuntimeStats?.(p,{fullHeal:true}); p.maxHp=Number(data.maxHp||p.maxHp||1); p.currentHp=Math.max(0,Math.min(p.maxHp,Number(data.currentHp??p.maxHp))); p.status=data.status||''; return p; }
  function myTeam(){ return (player()?.squad||[]).slice(0,3).map(compactPokemon).filter(Boolean); }
  function teamFromPub(pub){ return (pub?.battleTeam||pub?.squad||[]).slice(0,3).map(x=>compactPokemon(inflate(x))).filter(Boolean); }
  function isHost(room){ return myKey() && room?.challengerKey===myKey(); }
  function isGuest(room){ return myKey() && room?.targetKey===myKey(); }
  function isParticipant(room){ return isHost(room)||isGuest(room); }
  function otherKey(room){ return isHost(room)?room.targetKey:room.challengerKey; }
  function myPub(room){ return isHost(room)?room.challenger:room.target; }
  function oppPub(room){ return isHost(room)?room.target:room.challenger; }

  function installCss(){
    if(document.getElementById('phase2-content-fix3-style')) return;
    const st=document.createElement('style'); st.id='phase2-content-fix3-style'; st.textContent=`
      .bloodline-text-v3,.battle-bloodline-v3,.p2-blood,.rt-blood,.blood-block,.v7-blood-block,.p2fp-blood-fixed,.fix3-blood-chip{display:inline-flex!important;align-items:center!important;justify-content:center!important;border-radius:999px!important;padding:3px 8px!important;min-height:18px!important;line-height:1.1!important;font-size:10px!important;font-weight:1000!important;color:#07111e!important;-webkit-text-fill-color:#07111e!important;background-image:none!important;text-shadow:none!important;box-shadow:none!important;filter:none!important;animation:none!important;transition:none!important;contain:paint!important;border:1px solid rgba(255,255,255,.48)!important;}
      .bloodline-text-v3:before,.battle-bloodline-v3:before,.p2-blood:before,.rt-blood:before,.blood-block:before,.v7-blood-block:before,.bloodline-text-v3:after,.battle-bloodline-v3:after,.p2-blood:after,.rt-blood:after,.blood-block:after,.v7-blood-block:after{content:none!important;display:none!important;}
      .fix3-stat-best,.stat-value.is-best,.pokemon-stat-value.is-best,.squad-stat-value.is-best,[data-best-stat="1"]{color:#ff8a00!important;-webkit-text-fill-color:#ff8a00!important;background:transparent!important;border:0!important;box-shadow:none!important;text-shadow:none!important;animation:none!important;transition:none!important;font-weight:1000!important;}
      .fix3-rest-layer{position:relative;height:calc(100dvh - 145px);min-height:470px;margin:0;border-radius:24px;overflow:hidden;background:transparent!important;border:1px solid rgba(126,207,255,.22);}
      .fix3-rest-grass{position:absolute;right:8px;bottom:18px;width:min(46vw,245px);height:auto;z-index:4;object-fit:contain;image-rendering:auto;}
      .fix3-rest-exit{position:absolute;right:12px;top:12px;z-index:8;border:1px solid rgba(255,255,255,.35);border-radius:999px;background:rgba(0,0,0,.58);color:#fff;padding:9px 14px;font-weight:1000;}
      .fix3-rest-mon img,.fix3-rest-mon span{position:absolute;z-index:5;max-width:72px;max-height:72px;transform-origin:50% 100%;animation:fix3RestWiggle 3.2s ease-in-out forwards;}
      .fix3-rest-mon span{width:62px;height:62px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#ffd84f;color:#06101f;font-weight:1000;}
      @keyframes fix3RestWiggle{0%{opacity:0;transform:translateY(6px) rotate(0)}18%{opacity:1;transform:translateY(0) rotate(-14deg)}45%{transform:rotate(14deg)}68%{transform:rotate(-10deg)}86%{opacity:1;transform:rotate(0)}100%{opacity:0;transform:translateY(4px) rotate(0)}}
      .fix3-gym-type{font-weight:1000!important;border-radius:999px!important;padding:2px 7px!important;display:inline-flex!important;color:#fff!important;-webkit-text-fill-color:#fff!important;text-shadow:none!important;}
      .fix3-endstats{width:100%;background:rgba(255,255,255,.94);border-radius:18px;padding:12px;color:#06101f!important;}
      .fix3-endstats *{color:#06101f!important;-webkit-text-fill-color:#06101f!important;}
      .fix3-endstats table{width:100%;border-collapse:collapse}.fix3-endstats th,.fix3-endstats td{padding:6px;border-bottom:1px solid rgba(0,0,0,.12);text-align:left;}
      .battle-action-grid .action-button,.battle-action-grid .action-button span,.battle-action-grid .action-button small,.battle-move-button,.battle-move-button *:not(.type-badge):not(.battle-category-pill){color:#050b18!important;-webkit-text-fill-color:#050b18!important;text-shadow:none!important;}
      .pvp-ready-wait,.fix3-pvp-wait{background:rgba(255,255,255,.92)!important;color:#06101f!important;border-radius:16px;padding:18px;font-weight:1000;text-align:center;}
      .online-tab-row [data-p2-tab="rest"],.p2-tabs [data-p2-tab="rest"]{display:inline-flex!important;}
    `; document.head.appendChild(st);
  }

  function cleanStrayBloodlines(){
    const keepSel='.pokemon-card,.reserve-chip,.battle-status-card,.p2-card,.rt-mon-card,.modal-card,.p2-player-row,.battle-top,.battle-bottom,.item-panel';
    document.querySelectorAll('.bloodline-text-v3,.battle-bloodline-v3,.p2-blood,.rt-blood,.blood-block,.v7-blood-block,.p2fp-blood-fixed').forEach(el=>{
      const tx=(el.textContent||'').trim();
      if(!/혈통|뮤의 후손/.test(tx)) return;
      if(!el.closest(keepSel)) el.remove();
    });
  }
  function stabilizeBlood(){
    const map=new Map(); try{ const p=player(); [...(p?.squad||[]),...(p?.reserve||[])].forEach(mon=>{ if(mon?.uid) map.set(mon.uid, mon.bloodline||'normal'); }); }catch(e){}
    document.querySelectorAll('.bloodline-text-v3,.battle-bloodline-v3,.p2-blood,.rt-blood,.blood-block,.v7-blood-block,.p2fp-blood-fixed,.fix3-blood-chip').forEach(el=>{
      let key=null; const card=el.closest('[data-select-uid]'); if(card&&map.has(card.dataset.selectUid)) key=map.get(card.dataset.selectUid); if(!key) key=el.dataset.bloodline||el.getAttribute('data-bloodline')||el.textContent;
      const [label,bg,fg]=bloodMeta(key); el.textContent=label; el.dataset.bloodline=bloodKey(key); el.style.setProperty('background',bg,'important'); el.style.setProperty('color',fg,'important'); el.style.setProperty('-webkit-text-fill-color',fg,'important'); el.style.setProperty('box-shadow','none','important'); el.style.setProperty('text-shadow','none','important'); el.style.setProperty('animation','none','important'); el.style.setProperty('transition','none','important');
    });
  }
  function fixBestStats(){
    const p=player(); const mons=(p?.squad||[]).slice(0,3); const statKeys=['hp','attack','defense','spAttack','spDefense','speed'];
    document.querySelectorAll('.stat-value.is-best,.pokemon-stat-value.is-best,.squad-stat-value.is-best,[data-best-stat="1"]').forEach(el=>{el.classList.add('fix3-stat-best');});
    document.querySelectorAll('[data-select-uid]').forEach(card=>{
      const mon=mons.find(m=>m.uid===card.dataset.selectUid); if(!mon) return; const vals=statKeys.map(k=>Number(mon.stats?.[k]||mon[k]||0)); const max=Math.max(...vals); const nums=[...card.querySelectorAll('.stat-value,.pokemon-stat-value,.squad-stat-value')]; nums.forEach(n=>{ const v=parseInt((n.textContent||'').replace(/[^0-9]/g,''),10); if(v===max){ n.classList.add('fix3-stat-best'); n.style.setProperty('color','#ff8a00','important'); n.style.setProperty('-webkit-text-fill-color','#ff8a00','important'); } });
    });
  }

  const typeColors={바위:'#b89a28',풀:'#52a84f',격투:'#b44b43',물:'#4f90e8',고스트:'#705898',강철:'#8fa3b8',전기:'#e5bd22',얼음:'#70c9d0'};
  function colorGymTypes(){
    document.querySelectorAll('.online-badge-card').forEach(card=>{
      const first=card.querySelector('div'); if(!first) return; const t=(first.textContent||'').trim(); const color=typeColors[t]||first.style.color||'#7edcff'; first.classList.add('fix3-gym-type'); first.style.setProperty('background',color,'important'); first.style.setProperty('color','#fff','important');
    });
  }

  function ensureRestTab(){ const tabs=document.querySelector('.p2-tabs,.online-tab-row'); if(!tabs) return; if(!tabs.querySelector('[data-p2-tab="rest"]')){ const btn=document.createElement('button'); btn.dataset.p2Tab='rest'; btn.textContent='쉼터'; tabs.appendChild(btn); } }
  function renderRest(){
    const shell=document.querySelector('.p2-online-shell') || document.getElementById('content-area') || document.querySelector('.content-scroll'); if(!shell) return;
    const tabs=document.querySelector('.p2-tabs')?.outerHTML || document.querySelector('.online-tab-row')?.outerHTML || '';
    const main=(player()?.squad||[])[0]; const src=main?.base?.image||main?.base?.sprite||'';
    shell.innerHTML=tabs+`<section class="fix3-rest-layer"><button class="fix3-rest-exit" data-fix3-rest-exit="1">나가기</button><img src="grass.gif?rest=${Date.now()}" class="fix3-rest-grass" alt="grass"><div class="fix3-rest-mon"></div></section>`;
    const slotEl=shell.querySelector('.fix3-rest-mon'); clearInterval(FIX.restTimer);
    const spawn=()=>{ if(!slotEl) return; const left=52+Math.random()*22; const bottom=21+Math.random()*16; slotEl.innerHTML=src?`<img src="${esc(src)}" style="right:${100-left}%;bottom:${bottom}%">`:`<span style="right:${100-left}%;bottom:${bottom}%">${esc(String(nameOf(main)).slice(0,1))}</span>`; setTimeout(()=>{ if(slotEl) slotEl.innerHTML=''; },3300); };
    setTimeout(spawn,350); FIX.restTimer=setInterval(spawn,5000); FIX.restRendered=true;
  }
  function maybeRest(){ ensureRestTab(); if(PB.phase2Online?.tab==='rest' && !document.querySelector('.fix3-rest-layer')) renderRest(); }

  function renderEndStats(payload){
    const data=payload||FIX.endPayload||{}; const stats=data.stats || PB.battleEngine?.getSnapshot?.()?.stats || {}; const rows=Object.values(stats).map(s=>`<tr><td>${esc(s.name||s.pokemonName||'포켓몬')}</td><td>${Number(s.damageDealt||0)}</td><td>${Number(s.survivedDamage||s.damageTaken||0)}</td></tr>`).join('') || '<tr><td colspan="3">통계 없음</td></tr>';
    const html=`<div class="fix3-endstats"><h3>배틀 통계</h3><table><thead><tr><th>포켓몬</th><th>딜량</th><th>버틴피해</th></tr></thead><tbody>${rows}</tbody></table><button class="action-button" data-fix3-end-exit="1"><span class="action-title">나가기</span><span class="action-sub">로비로 돌아갑니다.</span></button></div>`;
    const grid=document.getElementById('battle-action-grid'); if(grid) grid.innerHTML=html;
    FIX.endLocked=true; FIX.endPayload=data;
  }
  function patchBattleEnd(){ /* fix15 disabled old end wrapper */ return; 
    const be=PB.battleEngine, c=core(); if(be&&!be.__fix3End){ be.__fix3End=true; const old=be.startBattle; be.startBattle=function(opts={}){ const oldComplete=opts.onComplete; return old.call(this,{...opts,onComplete:(payload)=>{ FIX.endLocked=true; FIX.endPayload=payload||{}; let out; try{ out=oldComplete?oldComplete(payload):undefined; }catch(e){ console.warn(e); } setTimeout(()=>renderEndStats(payload),80); setTimeout(()=>renderEndStats(payload),800); return true; }}); }; }
    if(c&&!c.__fix3ReturnGuard){ c.__fix3ReturnGuard=true; const oldRet=c.returnToLobby; c.returnToLobby=function(){ if(FIX.endLocked && Date.now()>(FIX.allowExitUntil||0)){ setTimeout(()=>renderEndStats(),30); return false; } return oldRet.apply(this,arguments); }; const oldCat=c.setCategory; c.setCategory=function(cat){ if(FIX.endLocked && Date.now()>(FIX.allowExitUntil||0)){ setTimeout(()=>renderEndStats(),30); return false; } return oldCat.apply(this,arguments); }; }
  }

  function autoSwitchSync(sync){
    if(!sync) return sync; const fix=(team,idx)=>{ idx=Number(idx||0); if(team?.[idx] && Number(team[idx].currentHp||0)>0) return idx; const n=firstAliveIndex(team); return n<0?idx:n; };
    sync.allyIndex=fix(sync.playerTeam,sync.allyIndex); sync.enemyIndex=fix(sync.opponentTeam,sync.enemyIndex); sync.completed=!(alive(sync.playerTeam)&&alive(sync.opponentTeam)); sync.log=(sync.log||[]).slice(-24); return sync;
  }
  function buildPvp4(room){
    const hTeam=isHost(room)?myTeam():teamFromPub(room.challenger); const gTeam=isGuest(room)?myTeam():teamFromPub(room.target);
    return {version:4,phase:'select',turn:1,hostKey:room.challengerKey,guestKey:room.targetKey,actions:{},lastResult:null,teams:{[room.challengerKey]:hTeam,[room.targetKey]:gTeam},createdAt:now(),updatedAt:now()};
  }
  function startLocal(room){
    if(FIX.localStarted) return; const pvp=room.pvp4; if(!pvp?.teams) return;
    const mine=isHost(room)?pvp.teams[room.challengerKey]:pvp.teams[room.targetKey]; const opp=isHost(room)?pvp.teams[room.targetKey]:pvp.teams[room.challengerKey];
    const myT=(mine||[]).map(inflate).filter(Boolean), opT=(opp||[]).map(inflate).filter(Boolean); if(!myT.length||!opT.length){ toast('배틀 팀 정보를 불러오지 못했습니다.'); return; }
    try{ if(PB.phase2FinalStability){ PB.phase2FinalStability.active=false; PB.phase2FinalStability.roomRef?.off?.(); } }catch(e){}
    FIX.localStarted=true; FIX.lastTurn=Number(pvp.lastResult?.turn||0); FIX.actionSent=!!pvp.actions?.[myKey()];
    PB.battleEngine?.startBattle?.({playerId:'p1',opponentId:'online_pvp_enemy',playerName:curChar()?.name||player()?.name||'나',opponentName:oppPub(room)?.characterName||'상대 플레이어',playerTeam:myT,opponentTeam:opT,mode:'online_pvp',isDuo:true,skipLevelReward:true,theme:'city',onComplete:(payload)=>{ renderEndStats(payload); return true; }});
    setTimeout(decorate,100);
  }
  async function enterRoom(id){
    const d=db(); if(!d||!uid()){ toast('로그인 후 이용하세요.'); return; }
    if(FIX.roomRef){ try{FIX.roomRef.off();}catch(e){} }
    const ref=d.ref(`battleRooms/${id}`); const snap=await ref.get(); const room={id,...(snap.val()||{})}; if(!room?.id||!isParticipant(room)){ toast('참가 가능한 배틀방이 아닙니다.'); return; }
    FIX.active=true; FIX.roomId=id; FIX.room=room; FIX.roomRef=ref; FIX.localStarted=false; FIX.lastTurn=0; FIX.actionSent=false; FIX.resolving=false; FIX.endLocked=false; FIX.endPayload=null;
    core().state.currentScreen='battle'; ui()?.renderAll?.(); showPvpWait('상대방 대기 중...');
    await ref.update({status:'readying',[`ready/${myKey()}`]:true,updatedAt:now()}).catch(e=>console.warn('ready 실패',e));
    ref.on('value', async snap2=>{ const r={id,...(snap2.val()||{})}; if(!r.id||!FIX.active||r.id!==FIX.roomId) return; FIX.room=r; await onRoom(r); });
  }
  async function onRoom(room){
    const readyHost=!!room.ready?.[room.challengerKey], readyGuest=!!room.ready?.[room.targetKey]; if(!(readyHost&&readyGuest)){ showPvpWait('상대방 대기 중...'); return; }
    if(!room.pvp4 && isHost(room)){ await db().ref(`battleRooms/${room.id}`).transaction(cur=>{ if(!cur) return cur; const rr={id:room.id,...cur}; if(!cur.pvp4) cur.pvp4=buildPvp4(rr); cur.status='inProgress'; cur.updatedAt=now(); return cur; }); return; }
    if(!room.pvp4){ showPvpWait('배틀 준비 중...'); return; }
    if(!FIX.localStarted) startLocal(room);
    const pvp=room.pvp4;
    if(pvp.lastResult && Number(pvp.lastResult.turn||0)>FIX.lastTurn){ FIX.lastTurn=Number(pvp.lastResult.turn||0); try{ PB.battleEngine?.importPvpSyncState?.(autoSwitchSync(pvp.lastResult.syncState),{reverse:!isHost(room)}); }catch(e){ console.warn('PVP 결과 반영 실패',e); } FIX.actionSent=false; setTimeout(()=>{try{PB.battleEngine?.clearPvpWaiting?.();}catch(e){} decorate();},120); if(room.status==='completed'||pvp.phase==='completed'){ renderEndStats({stats:pvp.lastResult.syncState?.stats||{},winnerId:room.result?.winnerKey===myKey()?'p1':'enemy'}); } }
    if(isHost(room) && !FIX.resolving && pvp.phase==='select' && pvp.actions?.[room.challengerKey] && pvp.actions?.[room.targetKey]){ FIX.resolving=true; try{ await resolveHost(room); }catch(e){ console.warn('fix3 host resolve failed',e); toast('턴 계산을 복구했습니다.'); await recoverHost(room); } FIX.resolving=false; }
    const mine=pvp.actions?.[myKey()], other=pvp.actions?.[otherKey(room)]; if(mine&&!other) showPvpWait('상대방이 선택하는 중');
  }
  async function resolveHost(room){
    const pvp=room.pvp4, h=room.challengerKey, g=room.targetKey; let sync=await PB.battleEngine.resolvePvpSyncedTurn(pvp.actions[h],pvp.actions[g]); sync=autoSwitchSync(sync); const hAlive=alive(sync.playerTeam), gAlive=alive(sync.opponentTeam); const updates={};
    updates[`battleRooms/${room.id}/pvp4/actions`]=null; updates[`battleRooms/${room.id}/pvp4/lastResult`]={turn:Number(pvp.turn||1),syncState:sync,createdAt:now()}; updates[`battleRooms/${room.id}/pvp4/updatedAt`]=now();
    if(!hAlive||!gAlive||sync.completed){ const winnerKey=hAlive&&!gAlive?h:gAlive&&!hAlive?g:(hAlive?h:g); updates[`battleRooms/${room.id}/status`]='completed'; updates[`battleRooms/${room.id}/result`]={winnerKey,winnerName:(winnerKey===h?room.challenger:room.target)?.characterName||'',completedAt:now(),sameUi:true}; updates[`battleRooms/${room.id}/pvp4/phase`]='completed'; if(room.mode==='champion'&&winnerKey===h) updates['competitive/champion']={...room.challenger,championSince:now(),reason:'sameUiChallengeWin'}; }
    else{ updates[`battleRooms/${room.id}/pvp4/turn`]=Number(pvp.turn||1)+1; updates[`battleRooms/${room.id}/pvp4/phase`]='select'; }
    await db().ref().update(updates);
  }
  async function recoverHost(room){ const sync=autoSwitchSync(PB.battleEngine?.exportPvpSyncState?.() || {completed:false,playerTeam:room.pvp4?.teams?.[room.challengerKey]||[],opponentTeam:room.pvp4?.teams?.[room.targetKey]||[],log:['턴 계산을 복구했습니다.']}); await db().ref().update({[`battleRooms/${room.id}/pvp4/actions`]:null,[`battleRooms/${room.id}/pvp4/lastResult`]:{turn:Number(room.pvp4?.turn||1),syncState:sync,createdAt:now()},[`battleRooms/${room.id}/pvp4/turn`]:Number(room.pvp4?.turn||1)+1,[`battleRooms/${room.id}/pvp4/phase`]:'select',[`battleRooms/${room.id}/pvp4/updatedAt`]:now()}); }
  function showPvpWait(msg){ core().state.currentScreen='battle'; const grid=document.getElementById('battle-action-grid'); if(grid) grid.innerHTML=`<div class="fix3-pvp-wait">${esc(msg)}</div>`; const log=document.getElementById('battle-log'); if(log) log.innerHTML=`<div>${esc(msg)}</div>`; }
  async function submit(action){ if(!FIX.active||!FIX.roomId||!db()) return; FIX.actionSent=true; showPvpWait('상대방이 선택하는 중'); await db().ref(`battleRooms/${FIX.roomId}/pvp4/actions/${myKey()}`).set({...action,at:now()}); }
  function closePvp(){ if(FIX.roomRef){ try{FIX.roomRef.off();}catch(e){} } FIX.active=false; FIX.roomId=null; FIX.roomRef=null; FIX.room=null; FIX.localStarted=false; FIX.actionSent=false; }

  function bind(){
    window.addEventListener('click',async e=>{
      const rest=e.target.closest?.('[data-p2-tab="rest"]'); if(rest){ e.preventDefault(); e.stopImmediatePropagation(); if(PB.phase2Online) PB.phase2Online.tab='rest'; renderRest(); return; }
      const restExit=e.target.closest?.('[data-fix3-rest-exit]'); if(restExit){ e.preventDefault(); e.stopImmediatePropagation(); clearInterval(FIX.restTimer); FIX.restRendered=false; if(PB.phase2Online) PB.phase2Online.tab='ranked'; ui()?.renderAll?.(); return; }
      const end=e.target.closest?.('[data-fix3-end-exit],[data-battle-exit-lobby],[data-final-exit-lobby],[data-content-v2-exit],[data-hotfix-exit-lobby]'); if(end){ e.preventDefault(); e.stopImmediatePropagation(); FIX.allowExitUntil=Date.now()+3000; FIX.endLocked=false; FIX.endPayload=null; closePvp(); if(PB.phase2FinalStability){PB.phase2FinalStability.endShowing=false; PB.phase2FinalStability.allowLobbyUntil=Date.now()+3000;} core().state.currentScreen='lobby'; ui()?.renderAll?.(); return; }
      const start=e.target.closest?.('[data-p2-room-start]'); if(false && start){ e.preventDefault(); e.stopImmediatePropagation(); await enterRoom(start.dataset.p2RoomStart); return; }
      if(FIX.active){
        const act=e.target.closest?.('[data-battle-action]'); if(act){ const a=act.dataset.battleAction; if(['fight','bag','pokemon','info'].includes(a)){ e.preventDefault(); e.stopImmediatePropagation(); PB.battleEngine?.clearPvpWaiting?.(); PB.battleEngine?.handleRootAction?.(a); return; } }
        const root=e.target.closest?.('[data-battle-root]'); if(root){ e.preventDefault(); e.stopImmediatePropagation(); PB.battleEngine?.setMenu?.('root'); return; }
        const bag=e.target.closest?.('[data-battle-bag]'); if(bag){ e.preventDefault(); e.stopImmediatePropagation(); PB.battleEngine?.setMenu?.('bag'); return; }
        const toggle=e.target.closest?.('[data-battle-toggle-info]'); if(toggle){ e.preventDefault(); e.stopImmediatePropagation(); PB.battleEngine?.toggleMoveInfo?.(); return; }
        const mv=e.target.closest?.('[data-battle-move]'); if(mv){ e.preventDefault(); e.stopImmediatePropagation(); await submit({type:'move',index:Number(mv.dataset.battleMove||0)}); return; }
        const sw=e.target.closest?.('[data-battle-switch]'); if(sw){ e.preventDefault(); e.stopImmediatePropagation(); await submit({type:'switch',index:Number(sw.dataset.battleSwitch||0)}); return; }
        const item=e.target.closest?.('[data-battle-item]'); if(item){ e.preventDefault(); e.stopImmediatePropagation(); const id=item.dataset.battleItem; if(['pp_aid','pp_aide','revive_shard'].includes(id)){ PB.battleEngine?.handleBagSelect?.(id); } else await submit({type:'item',itemId:id}); return; }
        const im=e.target.closest?.('[data-battle-item-move]'); if(im){ e.preventDefault(); e.stopImmediatePropagation(); await submit({type:'item',itemId:'pp_aid',moveIndex:Number(im.dataset.battleItemMove||0)}); return; }
        const ip=e.target.closest?.('[data-battle-item-pokemon]'); if(ip){ e.preventDefault(); e.stopImmediatePropagation(); await submit({type:'item',itemId:'revive_shard',targetIndex:Number(ip.dataset.battleItemPokemon||0)}); return; }
      }
    },true);
  }
  function decorate(){ installCss(); cleanStrayBloodlines(); stabilizeBlood(); fixBestStats(); colorGymTypes(); maybeRest(); if(FIX.endLocked && !document.querySelector('.fix3-endstats')) renderEndStats(); }
  function patchEngine(){ const be=PB.battleEngine; if(!be||be.__fix3PvpEngine) return; be.__fix3PvpEngine=true; const oldImport=be.importPvpSyncState?.bind(be); if(oldImport){ be.importPvpSyncState=function(sync,opts){ const r=oldImport(autoSwitchSync(sync),opts); try{be.clearPvpWaiting?.();}catch(e){} setTimeout(decorate,80); return r; }; } const oldResolve=be.resolvePvpSyncedTurn?.bind(be); if(oldResolve){ be.resolvePvpSyncedTurn=async function(a,b){ const out=await oldResolve(a,b); return autoSwitchSync(out); }; } }
  function init(){ if(!core()||!ui()||!PB.battleEngine){ setTimeout(init,140); return; } installCss(); patchEngine(); patchBattleEnd(); bind(); window.PB_REALTIME_PVP = Object.assign(window.PB_REALTIME_PVP||{}, {enterRoom, close:closePvp}); /* v8: disabled old fix3 decorate interval */ /* fix15 removed old end-lock loop */ setTimeout(decorate,800); }
  document.addEventListener('DOMContentLoaded',()=>setTimeout(init,1500));
})();
