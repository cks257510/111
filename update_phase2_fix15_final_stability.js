(function(){
  'use strict';
  const PB = window.POKEBATTLE || (window.POKEBATTLE = {});
  const F = PB.fix15Final = PB.fix15Final || { bound:false, patched:false, endLocked:false, endPayload:null, lastEndHtml:'', deleteCount:0, observer:null };
  const core = () => PB.core;
  const ui = () => PB.ui;
  const online = () => PB.online || {};
  const db = () => online().db || null;
  const uid = () => online().uid || '';
  const slot = () => online().selectedSlot || 'char1';
  const key = () => uid() ? `${uid()}_${slot()}` : '';
  const player = () => core()?.getPlayer?.('p1') || core()?.getActivePlayer?.() || null;
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm = v => String(v || '').trim().toLowerCase().replace(/[^a-z0-9_가-힣]/g,'');
  const finite = (n,d=0) => { n=Number(n); return Number.isFinite(n) ? n : d; };
  const toast = m => ui()?.showToast?.(m);

  function resetAllEndLocks(){
    F.endLocked = false; F.endPayload = null; F.lastEndHtml = '';
    ['phase2ContentV2','phase2ContentHotfix','phase2ContentFix3','phase2FinalFix10','phase2Fix11Stability','fix14Restore'].forEach(k=>{
      const o = PB[k]; if(!o) return;
      if('endLocked' in o) o.endLocked = false;
      if('locked' in o) o.locked = false;
      if('endPayload' in o) o.endPayload = null;
      if('payload' in o) o.payload = null;
      if('lastEndHtml' in o) o.lastEndHtml = '';
      if('allowExit' in o) o.allowExit = true;
      if('allowExitUntil' in o) o.allowExitUntil = Date.now() + 600000;
      if('allowLobbyUntil' in o) o.allowLobbyUntil = Date.now() + 600000;
    });
    window.__FIX9_END_LOCK = false;
    window.__FIX9_LAST_END_STATS = null;
  }

  function statRows(payload){
    const stats = payload?.stats || PB.battleEngine?.getSnapshot?.()?.stats || {};
    const vals = Object.values(stats || {});
    const rows = vals.map(s=>`<tr><td>${esc(s.name || s.pokemonName || '포켓몬')}</td><td>${finite(s.damageDealt,0)}</td><td>${finite(s.survivedDamage ?? s.damageTaken,0)}</td></tr>`).join('');
    return rows || '<tr><td colspan="3">통계 없음</td></tr>';
  }
  function showEndStats(payload){
    F.endLocked = true; F.endPayload = payload || F.endPayload || {};
    if(core()?.state) core().state.currentScreen = 'battle';
    const grid = document.getElementById('battle-action-grid');
    if(!grid) return;
    const html = `<div class="fix15-endstats"><h3>배틀 통계</h3><table><thead><tr><th>포켓몬</th><th>딜량</th><th>버틴피해</th></tr></thead><tbody>${statRows(F.endPayload)}</tbody></table><button type="button" class="action-button fix15-end-exit" data-fix15-end-exit="1"><span class="action-title">나가기</span><span class="action-sub">로비로 이동</span></button></div>`;
    F.lastEndHtml = html;
    grid.innerHTML = html;
    const log = document.getElementById('battle-log');
    if(log) log.textContent = '배틀이 종료되었습니다. 통계를 확인한 뒤 나가기를 눌러주세요.';
  }
  function exitToLobby(){
    resetAllEndLocks();
    if(PB.phase2PvpV12){ PB.phase2PvpV12.active=false; PB.phase2PvpV12.started=false; PB.phase2PvpV12.sent=false; PB.phase2PvpV12.roomId=null; try{ PB.phase2PvpV12.roomRef?.off?.(); }catch(e){} }
    if(core()?.state){ core().state.currentScreen='lobby'; core().state.currentCategory = core().state.currentCategory || 'squad'; core().state.selectedItemId = null; }
    const root = document.getElementById('modal-root'); if(root) root.innerHTML='';
    try{ ui()?.renderAll?.(); ui()?.syncBgmForScreen?.(); }catch(e){}
  }

  function patchEndFlow(){
    const c=core(), be=PB.battleEngine;
    if(c && !c.__fix15ReturnPatch){
      c.__fix15ReturnPatch = true;
      const oldRet = c.returnToLobby?.bind(c);
      c.returnToLobby = function(){ if(F.endLocked){ showEndStats(); return false; } return oldRet ? oldRet() : undefined; };
      const oldSet = c.setCategory?.bind(c);
      c.setCategory = function(cat){ if(F.endLocked){ showEndStats(); return false; } return oldSet ? oldSet(cat) : undefined; };
    }
    if(be && !be.__fix15EndPatch){
      be.__fix15EndPatch = true;
      const old = be.startBattle.bind(be);
      be.startBattle = function(opts={}){
        const orig = opts.onComplete;
        return old({...opts, onComplete:(payload)=>{
          let ret;
          try{ ret = orig ? orig(payload) : undefined; }catch(e){ console.warn('fix15 onComplete inner failed', e); }
          setTimeout(()=>showEndStats(payload), 20);
          return true;
        }});
      };
    }
  }

  function patchPrices(){
    const c=core(); if(!c || c.__fix15PricePatch) return; c.__fix15PricePatch=true;
    const patchItem = (it) => {
      const x = {...(it||{})}; const id=norm(x.id);
      if(id==='rare_candy' || x.nameKo==='이상한사탕') x.price = 200;
      if(id==='mystery_egg' || x.nameKo==='알') x.price = 700;
      if(id==='huge_egg') x.price = 6000;
      if(id==='good_potion') x.price = 100;
      if(id==='revive_shard') x.price = 200;
      return x;
    };
    ['itemList'].forEach(k=>{ if(Array.isArray(c.state?.[k])) c.state[k] = c.state[k].map(patchItem); });
    try{ c.state?.itemsById?.forEach((it,id)=>{ const patched=patchItem(it); if(patched) c.state.itemsById.set(id, patched); }); }catch(e){}
    const oldCat=c.getShopCatalog?.bind(c);
    c.getShopCatalog=function(){ return (oldCat?oldCat():[]).filter(it=>!['mythic_fragment','artisan_knowledge'].includes(norm(it.id))).map(patchItem); };
    const oldInv=c.getFriendlyShopInventory?.bind(c);
    c.getFriendlyShopInventory=function(){ return (oldInv?oldInv.apply(c,arguments):c.getShopCatalog()).filter(it=>!['mythic_fragment','artisan_knowledge'].includes(norm(it.id))).map(patchItem); };
    const oldRefresh=c.refreshFriendlyShopInventory?.bind(c);
    if(oldRefresh) c.refreshFriendlyShopInventory=function(){ return c.getShopCatalog(); };
    const oldBuy=c.buyShopItem?.bind(c);
    c.buyShopItem=function(playerId,itemId){
      const item = c.getShopCatalog().find(it=>norm(it.id)===norm(itemId));
      const p = c.getPlayer?.(playerId||c.state?.activePlayerId||'p1') || player();
      if(item && p && finite(p.money,0) < finite(item.price,0)) return {ok:false,message:'재화가 부족합니다.'};
      const res = oldBuy ? oldBuy(playerId,itemId) : {ok:false,message:'구매 실패'};
      if(res && res.ok===false && /부족|money|재화|insufficient/i.test(String(res.message||''))) res.message='재화가 부족합니다.';
      return res;
    };
  }

  function isSettingsRoot(root){
    if(!root) return false;
    const title = root.querySelector('#settings-title,h2')?.textContent || '';
    const txt = root.textContent || '';
    return /설정|환경설정/.test(title) || (/효과음|배경음악 음량|애니메이션 속도|언어/.test(txt) && !/프렌들리숍|채팅|기술|특성|출전목록|플레이어|상점|타입 상성|스탯 확인|신화 지닌물건|제작 지닌물건/.test(txt));
  }
  function cleanupDeleteUi(){
    const root=document.getElementById('modal-root'); if(!root) return;
    if(isSettingsRoot(root)) return;
    root.querySelectorAll('[data-delete-character-v3],[data-delete-character-v4],[data-delete-character-final],[data-delete-character-fix15],[data-delete-character-v12],.delete-character-section-v3,.delete-character-section-v4,.delete-character-section-final,.delete-character-section-fix15,.delete-character-section-v12,.nickname-change-fullpvp,.nickname-change-final,.nickname-change-fix15').forEach(n=>n.remove());
  }
  function addSettingsControls(){
    const root=document.getElementById('modal-root'); if(!root || !isSettingsRoot(root)) return;
    cleanupDuplicateSettingsControls(root);
    const grid = root.querySelector('.settings-grid,.modal-body') || root.querySelector('.modal'); if(!grid) return;
    if(!grid.querySelector('[data-change-nickname-fix15]')){
      grid.insertAdjacentHTML('beforeend', `<section class="settings-section nickname-change-fix15"><h3>닉네임 변경</h3><p>100재화를 사용해 닉네임을 변경합니다.</p><button type="button" class="settings-choice" data-change-nickname-fix15="1">닉네임 변경</button></section>`);
    }
    if(!grid.querySelector('[data-delete-character-fix15]')){
      grid.insertAdjacentHTML('beforeend', `<section class="settings-section delete-character-section-fix15"><h3>캐릭터 삭제</h3><p>현재 선택한 캐릭터만 삭제합니다. 10번 눌러야 확정됩니다.</p><button type="button" class="settings-choice danger" data-delete-character-fix15="1" data-count="0">캐릭터 삭제 0/10</button></section>`);
    }
  }
  function cleanupDuplicateSettingsControls(root){
    const delSections=[...root.querySelectorAll('.delete-character-section-v3,.delete-character-section-v4,.delete-character-section-final,.delete-character-section-v12')];
    delSections.forEach(n=>n.remove());
    const nickSections=[...root.querySelectorAll('.nickname-change-fullpvp,.nickname-change-final')];
    nickSections.forEach(n=>n.remove());
  }
  async function changeNickname(){
    const p=player(); const o=online(); if(!p || !o.selectedCharacter){ toast('캐릭터를 먼저 선택하세요.'); return; }
    if(finite(p.money,0) < 100){ toast('재화가 부족합니다.'); return; }
    const next = (prompt('새 닉네임을 입력하세요', o.selectedCharacter.nickname || o.selectedCharacter.name || '') || '').trim().slice(0,12);
    if(!next) return;
    p.money = Math.max(0, finite(p.money,0)-100);
    o.selectedCharacter.nickname = next; if(o.characters && o.selectedSlot && o.characters[o.selectedSlot]) o.characters[o.selectedSlot].nickname = next; if(o.localStore?.characters && o.selectedSlot && o.localStore.characters[o.selectedSlot]) o.localStore.characters[o.selectedSlot].nickname = next;
    try{
      if(db() && uid()){
        await db().ref(`characters/${uid()}/${slot()}`).update({nickname:next,updatedAt:Date.now()}).catch(()=>{});
        await db().ref(`playerPublicList/${key()}`).update({nickname:next,updatedAt:Date.now()}).catch(()=>{});
      }
      await window.PB_ONLINE_V3?.saveCharacter?.();
    }catch(e){ console.warn(e); }
    toast('닉네임 변경 완료'); ui()?.renderAll?.(); setTimeout(addSettingsControls,50);
  }
  async function deleteCurrentCharacterOnly(btn){
    const n = finite(btn.dataset.count,0)+1; btn.dataset.count=n; btn.textContent=`캐릭터 삭제 ${n}/10`;
    if(n<10) return;
    const o=online(); const s=slot();
    if(!o.characters || !o.characters[s]){ toast('삭제할 캐릭터가 없습니다.'); return; }
    const name=o.characters[s].name || s;
    delete o.characters[s];
    if(o.localStore?.characters) delete o.localStore.characters[s];
    try{
      if(db() && uid()){
        await db().ref(`characters/${uid()}/${s}`).remove().catch(()=>{});
        await db().ref(`saves/${uid()}/${s}`).remove().catch(()=>{});
        await db().ref(`playerPublicList/${uid()}_${s}`).update({uid:uid(),slot:s,deleted:true,hidden:true,updatedAt:Date.now()}).catch(()=>{});
      }
    }catch(e){ console.warn(e); }
    o.selectedSlot = o.characters.char1 ? 'char1' : (o.characters.char2 ? 'char2' : null);
    o.selectedCharacter = o.selectedSlot ? o.characters[o.selectedSlot] : null;
    try{ window.PB_ONLINE_V3?.saveLocalStore?.(); }catch(e){}
    document.getElementById('modal-root').innerHTML='';
    if(o.selectedCharacter?.player){ core().state.players.p1 = o.selectedCharacter.player; core().state.currentScreen='lobby'; core().state.currentCategory='squad'; }
    else { core().state.currentScreen='title'; }
    toast(`${name} 삭제 완료`); ui()?.renderAll?.();
  }

  function openChat(){
    try{ ui()?.openChatModal?.(true); }catch(e){ toast('채팅창을 열 수 없습니다.'); }
    setTimeout(cleanupDeleteUi, 50);
  }
  function showStats(){
    const snap=PB.battleEngine?.getSnapshot?.();
    const card=m=>m?`<div class="placeholder-card"><b>${esc(m.currentName||m.name||'포켓몬')}</b><p>Lv.${finite(m.level,1)} · HP ${finite(m.currentHp,0)}/${finite(m.maxHp,0)}</p><p>공격 ${finite(m.stats?.attack,0)} · 방어 ${finite(m.stats?.defense,0)} · 특공 ${finite(m.stats?.spAttack,0)} · 특방 ${finite(m.stats?.spDefense,0)} · 스피드 ${finite(m.stats?.speed,0)}</p></div>`:'<div class="placeholder-card">정보 없음</div>';
    const root=document.getElementById('modal-root'); if(!root) return;
    root.innerHTML=`<div class="overlay"><div class="modal"><div class="modal-header"><div class="modal-title-wrap"><h2>스탯 확인</h2></div><button class="close-btn" data-close-modal="1">✕</button></div><div class="modal-body placeholder-stack">${card(snap?.ally)}${card(snap?.enemy)}</div></div></div>`;
  }

  function maybeIntro(){
    const c=core(), p=player(); if(!c || c.state.currentScreen!=='lobby' || !p || !(p.squad||[]).length) return;
    const k=`pb_intro_seen_fix15_${key()}_${online().selectedCharacter?.name||p.name||''}`;
    if(localStorage.getItem(k)==='1') return;
    const root=document.getElementById('modal-root'); if(!root || root.innerHTML.trim()) return;
    document.body.classList.add('fix15-lobby-bg');
    root.innerHTML=`<div class="fix15-intro"><div class="fix15-intro-box"><p>당신은 배틀에 필요한 몇가지 물건을 챙겨서 최고의 포켓몬들을 다루기 위해 길을 떠났습니다. 경쟁자들을 이기고 올라가서 플레이어 챔피언이 되어보세요.</p><button type="button" class="fix15-intro-next" data-fix15-intro-close="1">▶</button></div></div>`;
  }

  function decorate(){
    patchPrices(); patchEndFlow();
    const c=core();
    if(c?.state?.currentScreen==='lobby') document.body.classList.add('fix15-lobby-bg'); else document.body.classList.remove('fix15-lobby-bg');
    cleanupDeleteUi(); addSettingsControls();
    document.querySelectorAll('.shop-item-card,.fix11-shop-card,.safe-shop-card').forEach(card=>{
      const txt=card.textContent||'';
      if(/이상한사탕/.test(txt)) card.innerHTML = card.innerHTML.replace(/\$?500원?|\$?70원?|\$500|\$70/g,'$200');
      if(/\b알\b|>알</.test(card.innerHTML) && !/거대알/.test(txt)) card.innerHTML = card.innerHTML.replace(/\$?500원?|\$500/g,'$700');
    });
    document.querySelectorAll('.shop-price,.fix11-shop-price,.safe-shop-price,.price-pill,.mini-badge').forEach(el=>{
      const card=el.closest('.shop-item-card,.fix11-shop-card,.safe-shop-card,.placeholder-card');
      if(card && /이상한사탕/.test(card.textContent||'')) el.textContent='$200';
      if(card && /\b알\b/.test(card.textContent||'') && !/거대알/.test(card.textContent||'')) el.textContent='$700';
    });
    const root=document.getElementById('modal-root'); if(root && root.innerHTML) cleanupDeleteUi();
  }

  function bind(){
    if(F.bound) return; F.bound=true;
    document.addEventListener('click', async e=>{
      const exit=e.target.closest?.('[data-fix15-end-exit],[data-fix14-exit-lobby],[data-fix11-exit-lobby],[data-fix10-exit-lobby],[data-fix3-end-exit],[data-content-v2-exit],[data-hotfix-exit-lobby],[data-pvp12-end-exit],[data-battle-exit-lobby],[data-final-exit-lobby]');
      if(exit){ e.preventDefault(); e.stopImmediatePropagation(); exitToLobby(); return; }
      const type=e.target.closest?.('#open-type-chart-btn,#battle-type-chart-btn,[data-battle-action="info"]');
      if(type){ e.preventDefault(); e.stopImmediatePropagation(); try{ ui()?.openTypeChartModal?.(); }catch(err){ toast('타입상성표를 열 수 없습니다.'); } setTimeout(cleanupDeleteUi,30); return; }
      const stats=e.target.closest?.('#battle-stats-btn,[data-battle-stats]');
      if(stats){ e.preventDefault(); e.stopImmediatePropagation(); showStats(); setTimeout(cleanupDeleteUi,30); return; }
      const chat=e.target.closest?.('#open-chat-btn,.chat-fab,[data-open-chat]');
      if(chat){ e.preventDefault(); e.stopImmediatePropagation(); openChat(); return; }
      const nn=e.target.closest?.('[data-change-nickname-fix15]');
      if(nn){ e.preventDefault(); e.stopImmediatePropagation(); await changeNickname(); return; }
      const del=e.target.closest?.('[data-delete-character-fix15]');
      if(del){ e.preventDefault(); e.stopImmediatePropagation(); await deleteCurrentCharacterOnly(del); return; }
      const close=e.target.closest?.('[data-close-modal],#close-modal-btn,.close-btn');
      if(close){ setTimeout(cleanupDeleteUi,30); }
      const intro=e.target.closest?.('[data-fix15-intro-close]');
      if(intro){ e.preventDefault(); e.stopImmediatePropagation(); localStorage.setItem(`pb_intro_seen_fix15_${key()}_${online().selectedCharacter?.name||player()?.name||''}`,'1'); const box=document.querySelector('.fix15-intro-box'); if(box){ box.style.opacity='0'; box.style.transform='translateY(14px)'; setTimeout(()=>{ const r=document.getElementById('modal-root'); if(r) r.innerHTML=''; },420); } else { const r=document.getElementById('modal-root'); if(r) r.innerHTML=''; } return; }
      const buy=e.target.closest?.('[data-hotfix-shop-buy],[data-fix11-shop-buy],[data-shop-buy]');
      if(buy){ e.preventDefault(); e.stopImmediatePropagation(); const id=buy.dataset.hotfixShopBuy||buy.dataset.fix11ShopBuy||buy.dataset.shopBuy; const res=core()?.buyShopItem?.(core()?.state?.activePlayerId||'p1', id); toast(res?.ok?`${res.item?.nameKo||'아이템'} 구매 완료`:(res?.message||'구매 실패')); try{ ui()?.playUiSound?.('buy'); }catch(err){} setTimeout(()=>{ try{ PB.phase2Fix11Stability?.openShop?.(); }catch(err){ ui()?.renderAll?.(); } },30); return; }
    }, true);
  }

  function installObserver(){
    if(F.observer) return;
    F.observer = new MutationObserver(()=>{ setTimeout(()=>{ cleanupDeleteUi(); addSettingsControls(); }, 10); });
    F.observer.observe(document.body, { childList:true, subtree:true });
  }

  function css(){
    if(document.getElementById('fix15-final-css')) return;
    const st=document.createElement('style'); st.id='fix15-final-css'; st.textContent=`
      body.fix15-lobby-bg #lobby-screen,body.fix15-lobby-bg .lobby-screen{background:linear-gradient(rgba(4,10,22,.20),rgba(4,10,22,.30)),url('pokebackground.png') center center/contain no-repeat!important;background-color:#06101f!important;}
      body.fix15-lobby-bg #lobby-screen .panel-card,body.fix15-lobby-bg #lobby-screen .placeholder-card,body.fix15-lobby-bg #lobby-screen .menu-card{background:rgba(7,14,29,.58)!important;backdrop-filter:blur(9px)!important;border-color:rgba(126,207,255,.24)!important;}
      .fix15-intro{position:fixed;inset:0;z-index:10000;display:flex;align-items:flex-end;justify-content:center;padding:22px;background:linear-gradient(rgba(0,0,0,.04),rgba(0,0,0,.16)),url('pokebackground.png') center center/contain no-repeat #06101f;box-sizing:border-box}.fix15-intro-box{width:min(92vw,520px);background:rgba(255,255,255,.82);border:1px solid rgba(255,255,255,.68);border-radius:22px;padding:18px 18px 38px;position:relative;transition:.42s ease;box-shadow:0 20px 60px rgba(0,0,0,.35)}.fix15-intro-box p{color:#06101f!important;-webkit-text-fill-color:#06101f!important;font-size:16px;line-height:1.55;font-weight:1000}.fix15-intro-next{position:absolute;right:18px;bottom:10px;background:transparent;border:0;color:#e83232!important;font-size:22px;font-weight:1000;animation:fix15Arrow 1s infinite}@keyframes fix15Arrow{50%{transform:translateX(4px)}}
      .fix15-endstats{width:100%;max-height:58vh;overflow:auto;background:#f7fbff!important;color:#050505!important;-webkit-text-fill-color:#050505!important;border:2px solid rgba(0,0,0,.25)!important;border-radius:18px!important;padding:14px!important;box-sizing:border-box!important;animation:none!important;transition:none!important;}.fix15-endstats *{color:#050505!important;-webkit-text-fill-color:#050505!important;text-shadow:none!important;animation:none!important;transition:none!important}.fix15-endstats table{width:100%;border-collapse:collapse;background:#fff!important}.fix15-endstats th,.fix15-endstats td{border:1px solid rgba(0,0,0,.22);padding:6px;text-align:center}.fix15-endstats .action-button{margin-top:10px;background:#111827!important;color:#fff!important;-webkit-text-fill-color:#fff!important}.fix15-endstats .action-button *{color:#fff!important;-webkit-text-fill-color:#fff!important}
      #modal-root:not(:has(#settings-title)):not(:has(.settings-grid)) [data-delete-character-v3],#modal-root:not(:has(#settings-title)):not(:has(.settings-grid)) [data-delete-character-v4],#modal-root:not(:has(#settings-title)):not(:has(.settings-grid)) [data-delete-character-final],#modal-root:not(:has(#settings-title)):not(:has(.settings-grid)) [data-delete-character-fix15],#modal-root:not(:has(#settings-title)):not(:has(.settings-grid)) .delete-character-section-v3,#modal-root:not(:has(#settings-title)):not(:has(.settings-grid)) .delete-character-section-v4,#modal-root:not(:has(#settings-title)):not(:has(.settings-grid)) .delete-character-section-final,#modal-root:not(:has(#settings-title)):not(:has(.settings-grid)) .delete-character-section-fix15,#modal-root:not(:has(#settings-title)):not(:has(.settings-grid)) .nickname-change-fullpvp,#modal-root:not(:has(#settings-title)):not(:has(.settings-grid)) .nickname-change-final,#modal-root:not(:has(#settings-title)):not(:has(.settings-grid)) .nickname-change-fix15{display:none!important;}
      .delete-character-section-fix15{margin-top:12px;border:1px solid rgba(255,105,105,.32);border-radius:18px;padding:12px;background:rgba(130,24,32,.18)}.delete-character-section-fix15 h3,.delete-character-section-fix15 p,.nickname-change-fix15 h3,.nickname-change-fix15 p{color:#fff!important;-webkit-text-fill-color:#fff!important}.delete-character-section-fix15 .danger{background:rgba(255,72,72,.24)!important;color:#fff!important;border:1px solid rgba(255,132,132,.48)!important;}
      .shop-item-card,.fix11-shop-card,.safe-shop-card{max-width:100%!important;transform:none!important;transition:none!important}.shop-price,.fix11-shop-price,.safe-shop-price,.price-pill,.mini-badge{background:#ffd84f!important;color:#06101f!important;-webkit-text-fill-color:#06101f!important;border-radius:999px!important;padding:4px 9px!important;}
    `; document.head.appendChild(st);
  }

  function init(){ css(); patchPrices(); patchEndFlow(); bind(); installObserver(); setInterval(()=>{ resetNonFinalLocks(); decorate(); maybeIntro(); }, 350); setTimeout(maybeIntro,1200); }
  function resetNonFinalLocks(){
    // Old wrappers are disabled in source, but stale runtime values may exist after previous screens.
    ['phase2ContentV2','phase2ContentHotfix','phase2ContentFix3','phase2FinalFix10','phase2Fix11Stability'].forEach(k=>{ const o=PB[k]; if(o){ if('endLocked' in o) o.endLocked=false; if('locked' in o) o.locked=false; if('endPayload' in o) o.endPayload=null; if('payload' in o) o.payload=null; if('allowExit' in o) o.allowExit=true; } });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init, {once:true}); else init();
})();
