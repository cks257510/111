
(function(){
  'use strict';
  const PB = window.POKEBATTLE || (window.POKEBATTLE = {});
  const FIX = PB.phase2SameUiFix = PB.phase2SameUiFix || { lastDecorate:0 };
  const esc = (v)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const now = ()=>Date.now();
  function online(){ return PB.online || {}; }
  function db(){ return online().db || null; }
  function uid(){ return online().uid || null; }
  function slot(){ return online().selectedSlot || 'char1'; }
  function key(){ return uid() ? `${uid()}_${slot()}` : ''; }
  function toast(m){ PB.ui?.showToast?.(m); }
  function bloodKey(txt){
    txt=String(txt||'');
    if(txt.includes('뮤')) return 'mew';
    if(txt.includes('고대')) return 'ancient';
    if(txt.includes('우수')) return 'elite';
    return 'normal';
  }
  function bloodLabel(k){ return k==='mew'?'뮤의 후손':k==='ancient'?'고대혈통':k==='elite'?'우수혈통':'일반혈통'; }
  function bloodColor(k){ return k==='mew'?'#bd79ff':k==='ancient'?'#ffd85d':k==='elite'?'#62c9ff':'#c9ced8'; }

  function installCss(){
    if(document.getElementById('phase2-sameui-fix-style')) return;
    const st=document.createElement('style'); st.id='phase2-sameui-fix-style'; st.textContent = `
      /* 직전 버전 느낌으로 다시 반투명화 */
      body.theme-basic, body, .app-root{background:#050914!important;color:#fff!important;}
      .screen,.app-shell,.content-scroll{background:transparent!important;background-color:transparent!important;}
      .panel-card,.placeholder-card,.summary-card,.online-card,.online-panel,.p2-card,.challenge-card,.market-card,.pokemon-card,.reserve-chip,.dungeon-map-panel,.category-panel,.lobby-card,.item-panel,.modal-card:not(.p2fp-endstats){background:linear-gradient(180deg,rgba(12,27,52,.58),rgba(5,11,26,.46))!important;border-color:rgba(126,207,255,.26)!important;backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);box-shadow:0 16px 38px rgba(0,0,0,.22)!important;color:#fff!important;}
      .modal-card.white-card,.white-card,.p2fp-endstats{background:rgba(255,255,255,.92)!important;color:#06101f!important;}
      .modal-card.white-card *,.white-card *,.p2fp-endstats *{color:#06101f!important;}
      .battle-action-grid .action-button,.battle-action-grid .action-button span,.battle-action-grid .action-button small,.battle-move-button,.battle-move-button *:not(.type-badge):not(.battle-category-pill){color:#050b18!important;-webkit-text-fill-color:#050b18!important;text-shadow:none!important;}
      /* 혈통 블럭 고정: 오라/깜빡임 제거 */
      .bloodline-text-v3,.battle-bloodline-v3,.p2-blood,.rt-blood,.blood-block,.v7-blood-block,.p2fp-blood-fixed{display:inline-flex!important;align-items:center!important;justify-content:center!important;min-height:18px!important;line-height:1.1!important;border-radius:999px!important;padding:3px 8px!important;font-size:10px!important;font-weight:1000!important;color:#06101f!important;-webkit-text-fill-color:#06101f!important;text-shadow:none!important;box-shadow:none!important;filter:none!important;animation:none!important;transition:none!important;background-image:none!important;border:1px solid rgba(255,255,255,.55)!important;contain:paint!important;}
      .bloodline-text-v3::before,.battle-bloodline-v3::before,.p2-blood::before,.blood-block::before,.v7-blood-block::before,.bloodline-text-v3::after,.battle-bloodline-v3::after,.p2-blood::after,.blood-block::after,.v7-blood-block::after{content:none!important;display:none!important;}
      .blood-normal{background:#c9ced8!important}.blood-elite-chip{background:#62c9ff!important}.blood-ancient-chip{background:#ffd85d!important}.blood-mew-chip{background:#bd79ff!important;}
      .p2fp-chat-modal{max-width:min(92vw,520px)!important;width:min(92vw,520px)!important;}
      .p2fp-chat-modal .modal-header h2{font-size:18px!important;white-space:nowrap!important;}
      .p2fp-chat-list{max-height:48vh!important;overflow:auto!important;display:grid!important;gap:8px!important;}
      .p2fp-chat-msg,.p2fp-chat-msg p,.p2fp-chat-msg blockquote{white-space:pre-wrap!important;overflow-wrap:anywhere!important;word-break:break-word!important;max-width:100%!important;}
      #p2fp-chat-input{box-sizing:border-box!important;max-width:100%!important;}
      #open-chat-btn{white-space:nowrap!important;font-size:12px!important;padding-left:8px!important;padding-right:8px!important;}
      .p2fp-wait{background:rgba(255,255,255,.92)!important;color:#06101f!important;}
      .battle-matchup{font-weight:1000!important;}
      .stat-value.is-best,.pokemon-stat-value.is-best,.squad-stat-value.is-best,[data-best-stat="1"]{color:#ff8a00!important;-webkit-text-fill-color:#ff8a00!important;border:0!important;box-shadow:none!important;text-shadow:none!important;}
    `; document.head.appendChild(st);
  }

  function stabilizeBloodline(){
    const byUid = new Map();
    try{ const p=PB.core?.getPlayer?.('p1') || PB.core?.getActivePlayer?.(); [...(p?.squad||[]),...(p?.reserve||[])].forEach(mon=>{ if(mon?.uid) byUid.set(mon.uid, mon.bloodline||'normal'); }); }catch(e){}
    document.querySelectorAll('.bloodline-text-v3,.battle-bloodline-v3,.p2-blood,.rt-blood,.blood-block,.v7-blood-block').forEach(el=>{
      let k = null;
      const card = el.closest('[data-select-uid]');
      if(card && byUid.has(card.dataset.selectUid)) k = byUid.get(card.dataset.selectUid);
      if(!k) k = bloodKey(el.textContent);
      const label = bloodLabel(k);
      if((el.textContent||'').trim() !== label) el.textContent = label;
      el.classList.remove('blood-normal','blood-elite-chip','blood-ancient-chip','blood-mew-chip');
      el.classList.add(k==='mew'?'blood-mew-chip':k==='ancient'?'blood-ancient-chip':k==='elite'?'blood-elite-chip':'blood-normal');
      el.style.setProperty('background', bloodColor(k), 'important');
      el.style.setProperty('color', '#06101f', 'important');
      el.style.setProperty('-webkit-text-fill-color', '#06101f', 'important');
      el.style.setProperty('text-shadow', 'none', 'important');
      el.style.setProperty('box-shadow', 'none', 'important');
      el.style.setProperty('animation', 'none', 'important');
      el.style.setProperty('transition', 'none', 'important');
    });
  }

  function fixChatButton(){
    const b=document.getElementById('open-chat-btn');
    if(!b) return;
    const hasDot=!!b.querySelector('.chat-alert-dot');
    b.innerHTML = `채팅${hasDot?'<span class="chat-alert-dot"></span>':''}`;
    b.setAttribute('aria-label','채팅');
  }

  function patchChatSendFallback(){
    if(FIX.chatBound) return; FIX.chatBound=true;
    document.addEventListener('click', async (e)=>{
      const send=e.target.closest('[data-chat-send]');
      if(!send) return;
      const input=document.getElementById('p2fp-chat-input');
      // 기존 핸들러가 실패하거나 규칙 문제일 때도 사용자에게 반응을 보여주기 위한 후처리
      setTimeout(()=>{
        if(input && input.value.trim()) {
          // 아직 지워지지 않았으면 기존 전송이 실패했을 가능성이 높다.
          // 직접 한 번 더 시도한다.
          const text=input.value.trim();
          const d=db();
          if(!d){ toast('Firebase 연결 후 이용하세요.'); return; }
          d.ref('publicChat').push().set({uid:uid(),key:key(),name:online().nickname||online().selectedCharacter?.name||'트레이너',text,timestamp:now()}).then(()=>{ input.value=''; toast('채팅 전송 완료'); }).catch(err=>{ console.warn('채팅 직접 전송 실패',err); toast('채팅 전송 실패: Rules에서 publicChat을 확인하세요'); });
        }
      },350);
    },false);
  }

  function patchBattleEngineSafety(){
    const be=PB.battleEngine;
    if(!be || be.__sameUiFixSafety) return;
    be.__sameUiFixSafety=true;
    if(typeof be.resolvePvpSyncedTurn==='function'){
      const oldResolve=be.resolvePvpSyncedTurn.bind(be);
      be.resolvePvpSyncedTurn=async function(a,b){
        try{
          const out=await oldResolve(a,b);
          return out || be.exportPvpSyncState?.() || {completed:false};
        }catch(err){
          console.warn('resolvePvpSyncedTurn 안전 복구',err);
          try{ be.clearPvpWaiting?.(); }catch(e){}
          const fallback = be.exportPvpSyncState?.() || {completed:false, log:['턴 계산을 복구했습니다. 다음 턴을 진행하세요.']};
          fallback.log = (fallback.log||[]).concat(['턴 계산을 복구했습니다. 다음 턴을 진행하세요.']).slice(-24);
          return fallback;
        }
      };
    }
    if(typeof be.importPvpSyncState==='function'){
      const oldImport=be.importPvpSyncState.bind(be);
      be.importPvpSyncState=function(sync,opts){
        const r=oldImport(sync,opts);
        try{ be.clearPvpWaiting?.(); }catch(e){}
        setTimeout(()=>{ try{stabilizeBloodline();}catch(e){} },60);
        return r;
      };
    }
  }

  function patchFullPvpEntry(){
    // update_phase2_full_pvp_patch 내부에서 lastResultTurn을 0으로 바꾸지 못한 캐시 상황을 보정.
    const p=PB.phase2FullPvpPatch;
    if(p) p.lastResultTurn = Math.min(Number(p.lastResultTurn||0),0);
  }

  function holdEndScreen(){
    // 배틀 종료 통계 화면이 잠깐 나온 뒤 자동 로비 이동되는 것을 최대한 방지.
    if(FIX.endGuard) return; FIX.endGuard=true;
    document.addEventListener('click', (e)=>{
      if(e.target.closest('[data-battle-exit-lobby]')){
        FIX.allowLobbyUntil=Date.now()+1500;
      }
    },true);
    const c=PB.core;
    if(c && !c.__sameUiReturnGuard){
      c.__sameUiReturnGuard=true;
      const oldReturn=c.returnToLobby;
      c.returnToLobby=function(){
        if(document.querySelector('.p2fp-endstats') && Date.now()>(FIX.allowLobbyUntil||0)) return;
        return oldReturn.apply(this,arguments);
      };
    }
    // state.currentScreen 직접 변경은 막기 어렵기 때문에, 통계가 있으면 즉시 배틀 화면으로 되돌리는 보정
    setInterval(()=>{
      const stats=document.querySelector('.p2fp-endstats');
      if(stats && PB.core?.state?.currentScreen==='lobby' && Date.now()>(FIX.allowLobbyUntil||0)){
        PB.core.state.currentScreen='battle';
        PB.ui?.renderAll?.();
        const grid=document.getElementById('battle-action-grid');
        if(grid && !grid.querySelector('.p2fp-endstats')) grid.appendChild(stats);
      }
    },250);
  }

  function decorate(){
    installCss();
    stabilizeBloodline();
    fixChatButton();
    document.querySelectorAll('.battle-matchup').forEach(n=>{
      const t=n.textContent||'';
      if(t.includes('강함')) n.style.setProperty('color','#159447','important');
      else if(t.includes('약함')||t.includes('불리')) n.style.setProperty('color','#e58c8c','important');
      else n.style.setProperty('color','#050b18','important');
    });
  }

  function init(){
    installCss(); patchBattleEngineSafety(); patchChatSendFallback(); holdEndScreen(); patchFullPvpEntry(); decorate();
    /* v8: recurring decorate disabled */
    /* v8: disabled old mutation observer to prevent squad flicker */
  }
  document.addEventListener('DOMContentLoaded',()=>setTimeout(init,1100));
})();
