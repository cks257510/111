(function(){
  'use strict';
  const PB = window.POKEBATTLE || (window.POKEBATTLE = {});
  const F = PB.fix27StableEndStats = PB.fix27StableEndStats || {
    locked:false,
    payload:null,
    html:'',
    title:'배틀 통계',
    mode:'normal',
    installed:false,
    observer:null,
    lastRoomKey:'',
    exitedAt:0
  };
  const core = () => PB.core;
  const ui = () => PB.ui;
  const be = () => PB.battleEngine;
  const now = () => Date.now();
  const finite = (v,d=0) => { v=Number(v); return Number.isFinite(v) ? v : d; };
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function currentRoom(){
    return PB.phase2PvpV12?.room || PB.phase2FullPvpPatch?.room || null;
  }
  function myPvpKey(){
    const o = PB.online || {};
    return o.uid && o.selectedSlot ? `${o.uid}_${o.selectedSlot}` : '';
  }
  function roomIsCompleted(room){
    if(!room) return false;
    return /^(completed|finished|done)$/i.test(String(room.status||'')) || room.pvpV12?.phase === 'completed' || room.pvp2?.phase === 'completed' || !!room.pvpV12?.lastResult?.syncState?.completed;
  }
  function pvpSync(room){
    return room?.pvpV12?.lastResult?.syncState || room?.pvp2?.lastResult?.syncState || room?.pvp2?.syncState || room?.syncState || null;
  }
  function winnerText(room){
    const key = myPvpKey();
    const winner = room?.result?.winnerKey || room?.winnerKey || room?.pvp2?.winnerKey || room?.pvpV12?.winnerKey || '';
    if(winner) return winner === key ? '승리했습니다!' : '패배했습니다.';
    return '배틀이 종료되었습니다.';
  }
  function normalizeStats(payload){
    const raw = payload?.stats || payload?.syncState?.stats || payload?.pvpV12?.lastResult?.syncState?.stats || be()?.getSnapshot?.()?.stats || {};
    if(Array.isArray(raw)) return raw;
    return Object.values(raw || {});
  }
  function statRows(payload){
    const vals = normalizeStats(payload);
    const rows = vals.map(s => {
      const name = s?.name || s?.pokemonName || s?.currentName || s?.baseName || '포켓몬';
      const dealt = finite(s?.damageDealt ?? s?.damage ?? s?.totalDamage,0);
      const taken = finite(s?.survivedDamage ?? s?.damageTaken ?? s?.taken,0);
      const ko = finite(s?.ko ?? s?.kos ?? s?.kills,0);
      return `<tr><td>${esc(name)}</td><td>${dealt}</td><td>${taken}</td><td>${ko}</td></tr>`;
    }).join('');
    return rows || '<tr><td colspan="4">통계 없음</td></tr>';
  }
  function buildHtml(payload, title){
    const outcome = payload?.outcome || payload?.title || '';
    return `<div class="fix27-endstats" data-fix27-endstats="1">
      <h3>${esc(title || outcome || '배틀 통계')}</h3>
      <p class="fix27-end-note">배틀 종료 화면은 나가기 버튼을 누르기 전까지 유지됩니다.</p>
      <table><thead><tr><th>포켓몬</th><th>딜량</th><th>버틴피해</th><th>KO</th></tr></thead><tbody>${statRows(payload)}</tbody></table>
      <button type="button" class="action-button fix27-end-exit" data-fix27-end-exit="1"><span class="action-title">나가기</span><span class="action-sub">로비로 이동</span></button>
    </div>`;
  }
  function beginLock(payload, title, mode){
    if(now() - F.exitedAt < 1200) return;
    F.locked = true;
    F.payload = payload || F.payload || {};
    F.title = title || F.title || '배틀 통계';
    F.mode = mode || F.mode || 'normal';
    F.html = buildHtml(F.payload, F.title);
    try{ if(core()?.state) core().state.currentScreen = 'battle'; }catch(e){}
    renderEndStats(true);
  }
  function renderEndStats(force){
    if(!F.locked) return;
    const c = core();
    if(c?.state) c.state.currentScreen = 'battle';
    const screen = document.getElementById('battle-screen');
    if(screen){ screen.classList.remove('hidden'); screen.removeAttribute('aria-hidden'); }
    ['title-screen','starter-screen','lobby-screen'].forEach(id=>{
      const n=document.getElementById(id);
      if(n && c?.state?.currentScreen === 'battle') n.classList.add('hidden');
    });
    const grid = document.getElementById('battle-action-grid');
    if(!grid) return;
    if(force || !grid.querySelector('[data-fix27-endstats]')){
      grid.innerHTML = F.html || buildHtml(F.payload || {}, F.title || '배틀 통계');
    }
    const log = document.getElementById('battle-log');
    if(log && !/통계를 확인한 뒤 나가기/.test(log.textContent||'')){
      log.innerHTML = '<div class="battle-log-entry">배틀이 종료되었습니다. 통계를 확인한 뒤 나가기를 눌러주세요.</div>';
    }
    const turn = document.getElementById('battle-turn-indicator');
    if(turn){ turn.classList.add('hidden'); turn.textContent=''; }
  }
  function exitToLobby(){
    F.locked = false; F.payload = null; F.html = ''; F.exitedAt = now();
    try{
      if(PB.fix15Final){ PB.fix15Final.endLocked=false; PB.fix15Final.endPayload=null; PB.fix15Final.lastEndHtml=''; }
      if(PB.fix16PvpGuestSync){ PB.fix16PvpGuestSync.lastEndKey=''; }
      window.__FIX9_END_LOCK = false; window.__FIX9_LAST_END_STATS = null;
    }catch(e){}
    try{
      if(PB.phase2PvpV12){ PB.phase2PvpV12.active=false; PB.phase2PvpV12.started=false; PB.phase2PvpV12.sent=false; PB.phase2PvpV12.roomId=null; }
      if(PB.phase2FullPvpPatch){ PB.phase2FullPvpPatch.active=false; PB.phase2FullPvpPatch.started=false; PB.phase2FullPvpPatch.roomId=null; }
    }catch(e){}
    const c=core();
    if(c?.state){ c.state.currentScreen='lobby'; c.state.currentCategory = c.state.currentCategory || 'squad'; c.state.selectedItemId=null; }
    const root=document.getElementById('modal-root'); if(root) root.innerHTML='';
    try{ ui()?.renderAll?.(); ui()?.syncBgmForScreen?.(); }catch(e){}
  }
  function patchBattleEngine(){
    const engine = be(); if(!engine || engine.__fix27EndStatsPatch) return;
    engine.__fix27EndStatsPatch = true;
    const oldStart = engine.startBattle;
    if(typeof oldStart === 'function'){
      engine.startBattle = function(opts={}){
        if(F.locked){ F.locked=false; F.payload=null; F.html=''; }
        const originalComplete = opts.onComplete;
        return oldStart.call(this, {...opts, onComplete:(payload)=>{
          let ret;
          try{ ret = originalComplete ? originalComplete(payload) : undefined; }catch(e){ console.warn('fix27 onComplete inner failed', e); }
          const mode = opts.mode || payload?.mode || 'normal';
          const title = payload?.winnerName ? `${payload.winnerName} 승리` : (payload?.won === false ? '패배했습니다.' : '배틀 통계');
          setTimeout(()=>beginLock(payload || {stats:engine.getSnapshot?.()?.stats}, title, mode), 80);
          return ret;
        }});
      };
    }
    const oldImport = engine.importPvpSyncState;
    if(typeof oldImport === 'function'){
      engine.importPvpSyncState = function(sync, opts){
        const ret = oldImport.apply(this, arguments);
        if(sync?.completed){
          const room = currentRoom();
          setTimeout(()=>beginLock({stats:sync.stats || {}, syncState:sync, outcome:winnerText(room)}, winnerText(room), 'pvp'), 260);
        }
        return ret;
      };
    }
  }
  function patchUi(){
    const U = ui(); if(!U || U.__fix27EndStatsPatch) return;
    U.__fix27EndStatsPatch = true;
    const oldRender = U.renderAll;
    if(typeof oldRender === 'function'){
      U.renderAll = function(){
        if(F.locked && core()?.state) core().state.currentScreen='battle';
        const res = oldRender.apply(this, arguments);
        if(F.locked) setTimeout(()=>renderEndStats(false), 0);
        return res;
      };
    }
    const oldOpen = U.openBattleEndModal;
    if(typeof oldOpen === 'function'){
      U.openBattleEndModal = function(title, body, onClose){
        beginLock({stats:be()?.getSnapshot?.()?.stats || {}, outcome:title || body}, title || '배틀 통계', 'modal');
        return undefined;
      };
    }
  }
  function checkPvpCompleted(){
    const room=currentRoom();
    if(!room || !roomIsCompleted(room)) return;
    const sync=pvpSync(room);
    const roomKey=String(room.id || PB.phase2PvpV12?.roomId || PB.phase2FullPvpPatch?.roomId || '') + ':' + String(room.updatedAt || room.completedAt || room.result?.completedAt || sync?.updatedAt || '');
    if(F.locked && F.mode==='pvp') { renderEndStats(false); return; }
    if(roomKey && roomKey === F.lastRoomKey && F.locked) return;
    F.lastRoomKey=roomKey;
    beginLock({stats:sync?.stats || room?.stats || {}, syncState:sync, outcome:winnerText(room)}, winnerText(room), 'pvp');
  }
  function bindClicks(){
    if(F.clickBound) return; F.clickBound=true;
    document.addEventListener('click', (e)=>{
      const btn=e.target?.closest?.('[data-fix27-end-exit],.fix27-end-exit,[data-fix16-pvp-exit],[data-fix15-end-exit],[data-fix14-exit-lobby],[data-fix11-exit-lobby],[data-fix10-exit-lobby],[data-fix3-end-exit],[data-content-v2-exit],[data-hotfix-exit-lobby],[data-pvp12-end-exit],[data-battle-exit-lobby],[data-final-exit-lobby]');
      if(btn){ e.preventDefault(); e.stopImmediatePropagation(); exitToLobby(); return; }
    }, true);
  }
  function installObserver(){
    if(F.observer) return;
    const target = document.body || document.documentElement;
    F.observer = new MutationObserver(()=>{ if(F.locked) setTimeout(()=>renderEndStats(false), 0); });
    F.observer.observe(target, {childList:true, subtree:true});
  }
  function css(){
    if(document.getElementById('fix27-stable-end-css')) return;
    const st=document.createElement('style'); st.id='fix27-stable-end-css'; st.textContent=`
      .fix27-endstats{width:100%;max-height:60vh;overflow:auto;background:#f8fbff!important;color:#050505!important;-webkit-text-fill-color:#050505!important;border:2px solid rgba(0,0,0,.25)!important;border-radius:18px!important;padding:14px!important;box-sizing:border-box!important;animation:none!important;transition:none!important;box-shadow:0 10px 28px rgba(0,0,0,.2)!important;}
      .fix27-endstats *{color:#050505!important;-webkit-text-fill-color:#050505!important;text-shadow:none!important;animation:none!important;transition:none!important;}
      .fix27-endstats h3{margin:0 0 6px;font-size:20px;font-weight:1000;}.fix27-end-note{margin:0 0 10px;font-size:12px;font-weight:900;opacity:.75;}
      .fix27-endstats table{width:100%;border-collapse:collapse;background:#fff!important;border-radius:12px;overflow:hidden;}.fix27-endstats th,.fix27-endstats td{border:1px solid rgba(0,0,0,.18);padding:7px 5px;text-align:center;font-size:12px;font-weight:800;}
      .fix27-endstats .action-button{margin-top:12px;width:100%;background:#111827!important;color:#fff!important;-webkit-text-fill-color:#fff!important;border:0!important;}.fix27-endstats .action-button *{color:#fff!important;-webkit-text-fill-color:#fff!important;}
    `; document.head.appendChild(st);
  }
  function init(){
    css(); bindClicks(); patchBattleEngine(); patchUi(); installObserver();
    setInterval(()=>{ patchBattleEngine(); patchUi(); checkPvpCompleted(); if(F.locked) renderEndStats(false); }, 300);
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ()=>setTimeout(init,300), {once:true}); else setTimeout(init,300);
})();
