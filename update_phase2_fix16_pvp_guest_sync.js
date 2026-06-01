(function(){
  'use strict';
  const PB = window.POKEBATTLE || (window.POKEBATTLE = {});
  const S = PB.fix16PvpGuestSync = PB.fix16PvpGuestSync || { bound:false, timer:null, lastEndKey:'' };
  const core = () => PB.core;
  const ui = () => PB.ui;
  const online = () => PB.online || {};
  const uid = () => online().uid || '';
  const slot = () => online().selectedSlot || 'char1';
  const myKey = () => uid() ? `${uid()}_${slot()}` : '';
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const finite = (n,d=0) => { n=Number(n); return Number.isFinite(n) ? n : d; };
  const teamAlive = team => (team || []).some(p => finite(p?.currentHp ?? p?.hp, 0) > 0);

  function currentRoom(){ return PB.phase2PvpV12?.room || null; }
  function isPvpActive(){ const v=PB.phase2PvpV12; return !!(v && v.active && v.room); }
  function isCompleted(room){ return !!(room && (room.status === 'completed' || room.pvpV12?.phase === 'completed' || room.pvpV12?.lastResult?.syncState?.completed)); }
  function lastSync(room){ return room?.pvpV12?.lastResult?.syncState || PB.battleEngine?.exportPvpSyncState?.() || {}; }

  function statRows(sync){
    const stats = sync?.stats || {};
    const rows = Object.values(stats).map(s => `<tr><td>${esc(s.name || s.pokemonName || '포켓몬')}</td><td>${finite(s.damageDealt,0)}</td><td>${finite(s.survivedDamage ?? s.damageTaken,0)}</td></tr>`).join('');
    if(rows) return rows;
    const mons = [...(sync?.playerTeam || []), ...(sync?.opponentTeam || [])];
    return mons.map(m => `<tr><td>${esc(m.name || m.currentName || '포켓몬')}</td><td>${finite(m.damageDealt,0)}</td><td>${finite(m.survivedDamage ?? m.damageTaken,0)}</td></tr>`).join('') || '<tr><td colspan="3">통계 없음</td></tr>';
  }

  function winnerText(room, sync){
    const mine = myKey();
    const result = room?.result || {};
    if(result.winnerKey){ return result.winnerKey === mine ? '승리했습니다!' : '패배했습니다.'; }
    const hostAlive = teamAlive(sync?.playerTeam), guestAlive = teamAlive(sync?.opponentTeam);
    const amHost = room?.challengerKey === mine;
    if(hostAlive && !guestAlive) return amHost ? '승리했습니다!' : '패배했습니다.';
    if(guestAlive && !hostAlive) return amHost ? '패배했습니다.' : '승리했습니다!';
    return '배틀이 종료되었습니다.';
  }

  function showPvpEnd(room){
    if(!room || !isCompleted(room)) return;
    const sync = lastSync(room);
    const key = `${room.id || ''}:${room.pvpV12?.lastResult?.seq || 0}:${room.status || ''}`;
    const existing = document.querySelector('#battle-action-grid .fix16-pvp-endstats');
    if(existing && S.lastEndKey === key) return;
    S.lastEndKey = key;
    if(core()?.state) core().state.currentScreen = 'battle';
    try{ ui()?.renderAll?.(); }catch(e){}
    const grid = document.getElementById('battle-action-grid');
    if(!grid) return;
    grid.innerHTML = `<div class="fix16-pvp-endstats"><h3>${esc(winnerText(room, sync))}</h3><h4>배틀 통계</h4><table><thead><tr><th>포켓몬</th><th>딜량</th><th>버틴피해</th></tr></thead><tbody>${statRows(sync)}</tbody></table><button type="button" class="action-button" data-fix16-pvp-exit="1"><span class="action-title">나가기</span><span class="action-sub">로비로 이동</span></button></div>`;
    const log = document.getElementById('battle-log');
    if(log) log.textContent = '배틀이 종료되었습니다. 통계를 확인한 뒤 나가기를 눌러주세요.';
  }

  async function exitToLobby(){
    const v = PB.phase2PvpV12;
    if(v){
      try{ v.roomRef?.off?.('value'); }catch(e){ try{ v.roomRef?.off?.(); }catch(_){} }
      v.active = false; v.started = false; v.sent = false; v.submitting = false; v.resolving = false; v.roomId = null; v.roomRef = null; v.room = null;
    }
    if(PB.fix15Final){ PB.fix15Final.endLocked=false; PB.fix15Final.endPayload=null; PB.fix15Final.lastEndHtml=''; }
    if(core()?.state){ core().state.currentScreen = 'lobby'; core().state.currentCategory = core().state.currentCategory || 'squad'; core().state.selectedItemId = null; }
    const modal = document.getElementById('modal-root'); if(modal) modal.innerHTML = '';
    try{ ui()?.renderAll?.(); ui()?.syncBgmForScreen?.(); }catch(e){}
  }

  function bind(){
    if(S.bound) return; S.bound = true;
    document.addEventListener('click', e => {
      const btn = e.target.closest?.('[data-fix16-pvp-exit]');
      if(!btn) return;
      e.preventDefault(); e.stopImmediatePropagation(); exitToLobby();
    }, true);
    S.timer = setInterval(() => {
      if(!isPvpActive()) return;
      const room = currentRoom();
      if(isCompleted(room)) showPvpEnd(room);
    }, 250);
  }

  function css(){
    if(document.getElementById('fix16-pvp-guest-sync-style')) return;
    const st = document.createElement('style');
    st.id = 'fix16-pvp-guest-sync-style';
    st.textContent = `.fix16-pvp-endstats{width:100%;background:rgba(255,255,255,.97)!important;color:#06101f!important;border-radius:18px;padding:12px;box-sizing:border-box}.fix16-pvp-endstats *{color:#06101f!important;-webkit-text-fill-color:#06101f!important}.fix16-pvp-endstats h3,.fix16-pvp-endstats h4{margin:0 0 8px;text-align:center}.fix16-pvp-endstats table{width:100%;border-collapse:collapse;background:#fff!important}.fix16-pvp-endstats td,.fix16-pvp-endstats th{padding:5px;border-bottom:1px solid rgba(0,0,0,.14);text-align:center}.fix16-pvp-endstats .action-button{margin-top:10px;background:#111827!important}.fix16-pvp-endstats .action-button *{color:#fff!important;-webkit-text-fill-color:#fff!important}`;
    document.head.appendChild(st);
  }

  function init(){ css(); bind(); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true}); else init();
})();
