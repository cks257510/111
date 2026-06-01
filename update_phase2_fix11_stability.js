(function(){
  'use strict';
  const PB = window.POKEBATTLE || (window.POKEBATTLE = {});
  const FIX = PB.phase2Fix11Stability = PB.phase2Fix11Stability || { locked:false, payload:null, allowExit:false, shopPage:0, patched:false };
  const esc = (v)=>String(v ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm = (v)=>String(v||'').trim().toLowerCase().replace(/[^a-z0-9_가-힣]/g,'');
  const core = ()=>PB.core;
  const ui = ()=>PB.ui;
  const player = ()=>core()?.getPlayer?.(core()?.state?.activePlayerId || 'p1') || core()?.getActivePlayer?.();

  function resetOldEndLocks(){
    try{
      const keys = ['phase2ContentFix3','phase2ContentHotfix','phase2ContentV2','phase2FinalStability','phase2FinalFix10','phase2CleanV8','phase2Fix9VisualMarket','phase2PvpRestStable','phase2FullPvpPatch','phase2SameUiPvpFix'];
      keys.forEach(k=>{
        const obj = PB[k];
        if(!obj) return;
        if('endLocked' in obj) obj.endLocked = false;
        if('endShowing' in obj) obj.endShowing = false;
        if('allowExit' in obj) obj.allowExit = true;
        if('allowExitUntil' in obj) obj.allowExitUntil = Date.now()+100000;
        if('allowLobbyUntil' in obj) obj.allowLobbyUntil = Date.now()+100000;
        if('endPayload' in obj) obj.endPayload = null;
      });
      window.__FIX9_END_LOCK = false;
      window.__FIX9_LAST_END_STATS = null;
    }catch(e){}
  }

  function directLobby(){
    const c=core();
    resetOldEndLocks();
    FIX.locked=false; FIX.payload=null; FIX.allowExit=false;
    if(c?.state){
      c.state.currentScreen='lobby';
      c.state.currentCategory = c.state.currentCategory || 'squad';
      c.state.selectedItemId = null;
      c.state.selectedSwap = null;
    }
    const root=document.getElementById('modal-root'); if(root) root.innerHTML='';
    try{ ui()?.renderAll?.(); }catch(e){ console.warn('render lobby failed',e); }
    setTimeout(()=>{ try{ ui()?.syncBackgroundMusic?.('lobby', true); ui()?.syncBgmForScreen?.(); ui()?.syncBgmVolume?.(); }catch(e){} },80);
  }

  function buildStatsRows(payload){
    const stats = payload?.stats || FIX.payload?.stats || PB.battleEngine?.getSnapshot?.()?.stats || {};
    const vals = Object.values(stats||{}).filter(Boolean);
    if(!vals.length) return '<tr><td colspan="3">통계 없음</td></tr>';
    return vals.map(s=>`<tr><td>${esc(s.name || s.pokemonName || s.currentName || '포켓몬')}</td><td>${Number(s.damageDealt||0)}</td><td>${Number(s.survivedDamage ?? s.damageTaken ?? 0)}</td></tr>`).join('');
  }

  function renderEndStats(payload){
    FIX.locked = true;
    FIX.allowExit = false;
    FIX.payload = payload || FIX.payload || {};
    resetOldEndLocks();
    const c=core(); if(c?.state) c.state.currentScreen='battle';
    const grid=document.getElementById('battle-action-grid');
    if(!grid){ try{ ui()?.renderAll?.(); }catch(e){}; return; }
    grid.innerHTML = `<div class="fix11-endstats" data-fix11-endstats="1">
      <h3>배틀 통계</h3>
      <table><thead><tr><th>포켓몬</th><th>딜량</th><th>버틴피해</th></tr></thead><tbody>${buildStatsRows(FIX.payload)}</tbody></table>
      <button type="button" class="action-button fix11-exit-lobby" data-fix11-exit-lobby="1"><span class="action-title">나가기</span><span class="action-sub">로비로 돌아갑니다.</span></button>
    </div>`;
    const log=document.getElementById('battle-log'); if(log) log.textContent='배틀이 종료되었습니다. 통계를 확인한 뒤 나가기를 눌러주세요.';
  }

  function pricePatch(item){
    const it={...(item||{})}; const id=norm(it.id);
    if(id==='rare_candy') it.price=200;
    if(id==='mystery_egg') it.price=700;
    if(id==='huge_egg') it.price=6000;
    if(id==='good_potion') it.price=100;
    if(id==='revive_shard') it.price=200;
    return it;
  }
  function sortShop(list){
    const isStatus = (it)=>['paralyze_heal','antidote','burn_heal','ice_heal','awakening_spray'].includes(norm(it.id));
    const isCore = (it)=>['rare_candy','good_potion','revive_shard','recovery_potion'].includes(norm(it.id));
    const isEgg = (it)=>['mystery_egg','huge_egg','special_egg'].includes(norm(it.id));
    const isTm = (it)=>norm(it.id).startsWith('tm_');
    const group=(it)=> isCore(it)?0:isEgg(it)?1:isTm(it)?2:(norm(it.id)==='pp_aid'||norm(it.id)==='pp_aide')?8:isStatus(it)?9:3;
    return list.slice().sort((a,b)=>group(a)-group(b) || (group(a)===2 ? Number(b.price||0)-Number(a.price||0) : Number(a.price||0)-Number(b.price||0)) || String(a.nameKo||'').localeCompare(String(b.nameKo||''),'ko'));
  }

  function patchShopApi(){
    const c=core(); if(!c || c.__fix11ShopApi) return; c.__fix11ShopApi=true;
    const baseCatalog = c.getShopCatalog?.bind(c);
    c.getShopCatalog = function(){
      const base = (baseCatalog ? baseCatalog() : (c.state?.itemList||[])).filter(Boolean);
      return sortShop(base.filter(it=>!['mythic_fragment','artisan_knowledge'].includes(norm(it.id))).map(pricePatch));
    };
    c.getFriendlyShopInventory = function(){ return c.getShopCatalog(); };
    c.refreshFriendlyShopInventory = function(){ return c.getShopCatalog(); };
    c.buyShopItem = function(playerId,itemId){
      const pid = playerId || c.state?.activePlayerId || 'p1';
      const entry = c.getShopCatalog().find(it=>norm(it.id)===norm(itemId));
      if(!entry) return {ok:false,message:'구매할 수 없는 아이템입니다.'};
      if(!c.spendMoney?.(pid, Number(entry.price||0))) return {ok:false,message:'재화가 부족합니다.'};
      const p=c.getPlayer?.(pid); if(!p) return {ok:false,message:'플레이어 정보를 찾을 수 없습니다.'};
      const cat=String(entry.category||'');
      if(cat.includes('지닌물건')){
        p.bag = p.bag || {}; p.bag.holdables = p.bag.holdables || [];
        const ex = p.bag.holdables.find(it=>norm(it.id)===norm(entry.id));
        if(ex) ex.amount = Number(ex.amount||0)+1;
        else p.bag.holdables.push({id:entry.id,nameKo:entry.nameKo,amount:1,category:entry.category,description:entry.description,battleEffect:entry.battleEffect,colorA:entry.colorA,rank:entry.rank});
      } else {
        c.addConsumable?.(pid, entry.id, 1);
      }
      try{ ui()?.playUiSound?.('buy'); }catch(e){}
      return {ok:true,item:entry};
    };
  }

  function itemDescription(it){
    let d = it.description || it.battleEffect || '';
    if(norm(it.id).startsWith('tm_')) d += (d?'\n':'') + '기술머신은 배울 수 있는 포켓몬에게 사용하면 해당 기술을 기술 목록에 추가합니다.';
    return d;
  }
  function openShop(page=0){
    patchShopApi();
    resetOldEndLocks();
    const c=core(), p=player(), root=document.getElementById('modal-root'); if(!root||!c) return;
    const items=c.getShopCatalog(); const size=8; const pages=Math.max(1,Math.ceil(items.length/size));
    FIX.shopPage=(Number(page||0)+pages)%pages;
    const rows=items.slice(FIX.shopPage*size,FIX.shopPage*size+size).map(it=>{
      const name=String(it.nameKo||it.id||'아이템').replace(/^기술머신[:：]\s*/, '');
      const desc=itemDescription(it);
      return `<div class="fix11-shop-card"><div class="fix11-shop-row"><div class="fix11-shop-main"><h3>${esc(name)}</h3><p class="fix11-shop-cat">${esc(it.category||'')}</p><p class="fix11-shop-desc">${esc(desc).replace(/\n/g,'<br>')}</p></div><span class="fix11-shop-price">$${Number(it.price||0)}</span></div><div class="fix11-shop-actions">${norm(it.id).startsWith('tm_')?`<button type="button" data-fix11-tm-info="${esc(it.id)}">설명</button>`:''}<button type="button" class="buy" data-fix11-shop-buy="${esc(it.id)}">구매</button></div></div>`;
    }).join('');
    root.innerHTML=`<div class="overlay fix11-shop-overlay"><div class="modal large-modal fix11-shop-modal" role="dialog" aria-modal="true"><div class="modal-header"><div class="modal-title-wrap"><h2>프렌들리숍</h2><p>보유 재화: <span class="money-text">$${Number(p?.money||0)}</span></p></div><button type="button" class="ghost-btn" data-fix11-close-modal="1">닫기</button></div><div class="modal-body"><div class="shop-pager-row"><button type="button" class="chip-btn" data-fix11-shop-page="${FIX.shopPage-1}">◀</button><span class="shop-page-indicator">${FIX.shopPage+1} / ${pages}</span><button type="button" class="chip-btn" data-fix11-shop-page="${FIX.shopPage+1}">▶</button></div><div class="fix11-shop-grid">${rows||'<div class="empty-state">표시할 아이템이 없습니다.</div>'}</div></div></div></div>`;
  }
  function showTmInfo(itemId){
    const root=document.getElementById('modal-root'); const it=core()?.getShopCatalog?.().find(x=>norm(x.id)===norm(itemId)); if(!root||!it) return;
    const name=String(it.nameKo||'기술').replace(/^기술머신[:：]\s*/, '');
    const powerText = /위력\s*\d+/.test(it.description||'') ? String(it.description).replace(/(위력\s*\d+)/g,'<span class="tm-power">$1</span>') : esc(it.description||'');
    root.insertAdjacentHTML('beforeend',`<div class="overlay fix11-tm-overlay"><div class="modal fix11-tm-modal"><div class="modal-header"><div class="modal-title-wrap"><h2>${esc(name)}</h2><p>기술머신 설명</p></div><button type="button" class="ghost-btn" data-fix11-close-top="1">닫기</button></div><div class="modal-body"><p>${powerText}</p><p><b>적용 로직</b><br>사용 가능한 포켓몬에게 배우게 하면 기술 목록에 추가됩니다. 이미 기술이 4개라면 기존 기술 교체 흐름을 사용합니다.</p></div></div></div>`);
  }

  function patchBattleEnd(){ /* fix15 disabled old end wrapper */ return; 
    const u=ui(); if(u && !u.__fix11EndPatch){ u.__fix11EndPatch=true; u.showBattleEndStats = function(payload){ renderEndStats(payload); }; }
    const c=core(); if(c && !c.__fix11CorePatch){ c.__fix11CorePatch=true;
      c.returnToLobby = function(){ if(FIX.locked && !FIX.allowExit){ renderEndStats(); return false; } directLobby(); return true; };
      c.setCategory = function(cat){ if(FIX.locked && !FIX.allowExit){ renderEndStats(); return false; } resetOldEndLocks(); if(c.state){ c.state.currentCategory=cat; c.state.selectedSwap=null; if(cat!=='items') c.state.selectedItemId=null; } try{ ui()?.playUiSound?.('change'); }catch(e){} try{ ui()?.renderAll?.(); }catch(e){} return true; };
    }
    const be=PB.battleEngine; if(be && !be.__fix11StartPatch){ be.__fix11StartPatch=true; const old=be.startBattle; be.startBattle=function(opts={}){ const orig=opts.onComplete; return old.call(this,{...opts,onComplete:(payload)=>{ let ret=false; try{ ret = orig ? orig(payload) : false; }catch(e){ console.warn('onComplete failed',e); } setTimeout(()=>{ resetOldEndLocks(); renderEndStats(payload); },40); return true; }}); }; }
  }

  function installCss(){
    if(document.getElementById('fix11-stability-css')) return;
    const st=document.createElement('style'); st.id='fix11-stability-css'; st.textContent=`
      html,body,#app,.app-root,#lobby-screen,.lobby-screen{background-color:#06111d!important;}
      #lobby-screen,.lobby-screen,body[data-screen="lobby"] #app{background-image:linear-gradient(180deg,rgba(0,6,14,.03),rgba(0,8,18,.18)),url('pokebackground.png')!important;background-size:100% 100%!important;background-position:center center!important;background-repeat:no-repeat!important;}
      #modal-root:empty{display:none!important;pointer-events:none!important;}#modal-root:not(:empty){display:block!important;pointer-events:auto!important;}
      .fix11-endstats{width:100%;max-height:54vh;overflow:auto;background:#f7fbff!important;color:#050505!important;-webkit-text-fill-color:#050505!important;border:2px solid #111!important;border-radius:18px!important;padding:14px!important;box-shadow:0 10px 30px rgba(0,0,0,.22)!important;animation:none!important;transition:none!important;}
      .fix11-endstats *{color:#050505!important;-webkit-text-fill-color:#050505!important;text-shadow:none!important;animation:none!important;transition:none!important;}
      .fix11-endstats table{width:100%;border-collapse:collapse;background:#fff!important;}.fix11-endstats th,.fix11-endstats td{border:1px solid rgba(0,0,0,.25);padding:6px;text-align:center;}.fix11-endstats .action-button{margin-top:10px;background:#111!important;color:#fff!important;-webkit-text-fill-color:#fff!important}.fix11-endstats .action-button *{color:#fff!important;-webkit-text-fill-color:#fff!important;}
      .fix11-shop-modal{background:linear-gradient(180deg,rgba(0,0,0,.06),rgba(0,0,0,.12)),url('shop.png') center center/100% 100% no-repeat!important;background-color:#07111f!important;color:#fff!important;border:1px solid rgba(126,207,255,.25)!important;}
      .fix11-shop-modal .modal-header,.fix11-shop-modal .modal-body,.fix11-shop-card{background:rgba(5,13,25,.30)!important;border-color:rgba(126,207,255,.25)!important;backdrop-filter:blur(6px)!important;color:#fff!important;}
      .fix11-shop-grid{display:grid;gap:10px;max-height:62vh;overflow:auto;padding-right:2px;}.fix11-shop-card{border:1px solid;border-radius:16px;padding:12px;text-align:left;}.fix11-shop-row{display:flex;gap:10px;align-items:flex-start;justify-content:space-between;}.fix11-shop-card h3,.fix11-shop-card p,.fix11-shop-cat,.fix11-shop-desc{color:#fff!important;-webkit-text-fill-color:#fff!important;margin:.15rem 0;}.fix11-shop-price{display:inline-flex;align-items:center;justify-content:center;background:#ffd84f!important;color:#06101f!important;-webkit-text-fill-color:#06101f!important;border-radius:999px;padding:6px 10px;font-weight:1000;white-space:nowrap}.fix11-shop-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:8px}.fix11-shop-actions button{border-radius:999px;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.13);color:#fff;font-weight:900;padding:7px 11px}.fix11-shop-actions .buy{background:linear-gradient(135deg,#1b91ff,#52e2ff);color:#04111d!important;-webkit-text-fill-color:#04111d!important}.fix11-tm-modal{background:rgba(0,0,0,.94)!important;color:#fff!important;border:1px solid rgba(126,207,255,.35)!important}.fix11-tm-modal *{color:#fff!important;-webkit-text-fill-color:#fff!important}.fix11-tm-modal .tm-power{color:#ffd84f!important;-webkit-text-fill-color:#ffd84f!important;font-weight:1000!important;}
      .shop-tip-card,.shop-intro,.shop-summary{display:none!important;}
    `; document.head.appendChild(st);
  }

  function bind(){
    if(FIX.bound) return; FIX.bound=true;
    document.addEventListener('click',function(e){
      const exit=e.target.closest?.('[data-fix11-exit-lobby],.fix11-exit-lobby,[data-fix10-exit-lobby],[data-fix3-end-exit],[data-hotfix-exit-lobby],[data-content-v2-exit],[data-battle-exit-lobby],[data-final-exit-lobby],[data-v8-end-exit]');
      if(exit){ e.preventDefault(); e.stopImmediatePropagation(); FIX.allowExit=true; directLobby(); return; }
      const shop=e.target.closest?.('#open-friendly-shop-btn');
      if(shop){ e.preventDefault(); e.stopImmediatePropagation(); resetOldEndLocks(); const root=document.getElementById('modal-root'); if(root) root.innerHTML=''; openShop(0); return; }
      const pg=e.target.closest?.('[data-fix11-shop-page]'); if(pg){ e.preventDefault(); e.stopImmediatePropagation(); openShop(Number(pg.dataset.fix11ShopPage||0)); return; }
      const buy=e.target.closest?.('[data-fix11-shop-buy]'); if(buy){ e.preventDefault(); e.stopImmediatePropagation(); const res=core()?.buyShopItem?.(core()?.state?.activePlayerId||'p1',buy.dataset.fix11ShopBuy); ui()?.showToast?.(res?.ok?`${res.item?.nameKo||'아이템'} 구매 완료`:(res?.message||'구매 실패')); openShop(FIX.shopPage); return; }
      const tm=e.target.closest?.('[data-fix11-tm-info]'); if(tm){ e.preventDefault(); e.stopImmediatePropagation(); showTmInfo(tm.dataset.fix11TmInfo); return; }
      if(e.target.closest?.('[data-fix11-close-top]')){ e.preventDefault(); e.stopImmediatePropagation(); e.target.closest('.overlay')?.remove(); return; }
      if(e.target.closest?.('[data-fix11-close-modal]')){ e.preventDefault(); e.stopImmediatePropagation(); const root=document.getElementById('modal-root'); if(root) root.innerHTML=''; return; }
      const settings=e.target.closest?.('#open-settings-btn');
      if(settings){ e.preventDefault(); e.stopImmediatePropagation(); resetOldEndLocks(); const root=document.getElementById('modal-root'); if(root) root.innerHTML=''; ui()?.openSettingsModal?.(); return; }
      const nav=e.target.closest?.('[data-nav]');
      if(nav){ resetOldEndLocks(); const root=document.getElementById('modal-root'); if(root) root.innerHTML=''; e.preventDefault(); e.stopImmediatePropagation(); core()?.setCategory?.(nav.dataset.nav); return; }
    }, true);
  }

  function maintenance(){
    patchShopApi(); patchBattleEnd();
    if(!FIX.locked) resetOldEndLocks();
    if(FIX.locked){ resetOldEndLocks(); const grid=document.getElementById('battle-action-grid'); if(!grid?.querySelector?.('.fix11-endstats')) renderEndStats(); }
    document.querySelectorAll('.shop-tip-card,.shop-intro,.shop-summary').forEach(n=>n.remove());
  }
  function init(){ installCss(); patchShopApi(); patchBattleEnd(); bind(); maintenance(); }
  init(); setInterval(maintenance,250);
})();
