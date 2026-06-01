(function(){
  'use strict';
  const PB = window.POKEBATTLE || (window.POKEBATTLE = {});
  const S = PB.fix14Restore = PB.fix14Restore || { bound:false, introShown:false, endLocked:false, lastEndHtml:'', restTimer:null };
  const core = () => PB.core;
  const ui = () => PB.ui;
  const online = () => PB.online || {};
  const db = () => online().db || null;
  const uid = () => online().uid || '';
  const slot = () => online().selectedSlot || 'char1';
  const key = () => uid() ? `${uid()}_${slot()}` : `local_${slot()}`;
  const player = () => core()?.getPlayer?.('p1') || core()?.getActivePlayer?.() || null;
  const norm = v => String(v||'').trim().toLowerCase().replace(/[^a-z0-9_가-힣]/g,'');
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const finite = (n,d=0) => { n = Number(n); return Number.isFinite(n) ? n : d; };
  const alive = m => !!m && finite(m.currentHp ?? m.hp, 0) > 0;
  const toast = m => ui()?.showToast?.(m);

  function playSound(src, volume=0.8, start=0){
    try{
      const a = new Audio(src);
      a.volume = Math.max(0, Math.min(1, volume));
      a.addEventListener('loadedmetadata', () => { try{ a.currentTime = Math.min(start, Math.max(0, a.duration - .05)); }catch(e){} }, {once:true});
      try{ a.currentTime = start || 0; }catch(e){}
      a.play().catch(()=>{});
      setTimeout(()=>{ try{ a.pause(); }catch(e){} }, 2600);
    }catch(e){}
  }

  function patchCore(){
    const c = core();
    if(!c || c.__fix14Core) return;
    c.__fix14Core = true;

    const oldCatalog = c.getShopCatalog?.bind(c);
    c.getShopCatalog = function(){
      const list = (oldCatalog ? oldCatalog() : (c.state?.itemList || [])).filter(Boolean).map(it => ({...it}));
      list.forEach(it => {
        const id = norm(it.id);
        if(id === 'rare_candy') it.price = 200;
        if(id === 'mystery_egg') it.price = 700;
        if(id === 'huge_egg') it.price = 6000;
        if(id === 'good_potion') it.price = 100;
        if(id === 'revive_shard') it.price = 200;
      });
      const first = ['rare_candy','good_potion','revive_shard','recovery_potion'];
      const egg = ['mystery_egg','huge_egg','special_egg'];
      const status = ['paralyze_heal','antidote','burn_heal','ice_heal','awakening_spray','pp_aid','pp_aide'];
      const order = it => {
        const id = norm(it.id);
        if(first.includes(id)) return [0, first.indexOf(id)];
        if(egg.includes(id)) return [1, egg.indexOf(id)];
        if(/^tm_/.test(id)) return [2, -finite(it.price, 0)];
        if(status.includes(id)) return [9, status.indexOf(id)];
        return [4, finite(it.rank, 999), String(it.nameKo||'')];
      };
      return list.sort((a,b)=>{ const A=order(a),B=order(b); return A[0]-B[0] || A[1]-B[1] || String(A[2]||'').localeCompare(String(B[2]||''),'ko'); });
    };

    const oldBuy = c.buyShopItem?.bind(c);
    c.buyShopItem = function(playerId, itemId){
      const pid = playerId || c.state?.activePlayerId || 'p1';
      const item = c.getShopCatalog?.().find(x => norm(x.id) === norm(itemId));
      const p = c.getPlayer?.(pid) || c.getActivePlayer?.();
      if(item && p && finite(p.money,0) < finite(item.price,0)) return {ok:false, message:'재화가 부족합니다.'};
      const res = oldBuy ? oldBuy(pid, itemId) : null;
      if(res && res.ok === false && /재화|money|부족|insufficient/i.test(String(res.message||''))) res.message = '재화가 부족합니다.';
      if(res && res.ok) playSound('buying_sound.mp3', 0.85, 0.5);
      return res || {ok:false, message:'구매 실패'};
    };

    const oldHatch = c.hatchEgg?.bind(c);
    c.hatchEgg = function(playerId, eggType){
      const pid = playerId || c.state?.activePlayerId || 'p1';
      const p = c.getPlayer?.(pid) || c.getActivePlayer?.();
      const id = norm(eggType);
      const entry = p?.bag?.consumables?.find(x => norm(x.id) === id);
      if(entry && ['mystery_egg','huge_egg','special_egg'].includes(id)){
        entry.eggs = Array.isArray(entry.eggs) ? entry.eggs : [];
        const amount = Math.max(0, finite(entry.amount,0));
        while(entry.eggs.length < amount) entry.eggs.push({ pokemonId:0, eggType:id, seasonAwarded: finite(c.state?.season,1) });
      }
      return oldHatch ? oldHatch(pid, eggType) : {ok:false,message:'부화할 수 없습니다.'};
    };
  }

  function modal(title, body, opts={}){
    const root = document.getElementById('modal-root');
    if(!root) return;
    root.innerHTML = `<div class="overlay fix14-overlay"><div class="modal fix14-modal" role="dialog" aria-modal="true"><div class="modal-header"><div class="modal-title-wrap"><h2>${esc(title)}</h2></div><button type="button" class="close-btn" data-fix14-close="1">✕</button></div><div class="modal-body">${body}</div></div></div>`;
    root.querySelector('[data-fix14-close]')?.addEventListener('click', () => { root.innerHTML=''; });
  }

  function showStatsModal(){
    const snap = PB.battleEngine?.getSnapshot?.();
    const card = m => m ? `<div class="placeholder-card"><b>${esc(m.currentName||m.name||'포켓몬')}</b><p>Lv.${finite(m.level,1)} · HP ${finite(m.currentHp,0)}/${finite(m.maxHp,0)}</p><p>공격 ${finite(m.stats?.attack,0)} · 방어 ${finite(m.stats?.defense,0)} · 특공 ${finite(m.stats?.spAttack,0)} · 특방 ${finite(m.stats?.spDefense,0)} · 스피드 ${finite(m.stats?.speed,0)}</p></div>` : '<div class="placeholder-card">정보 없음</div>';
    modal('스탯 확인', `<div class="placeholder-stack">${card(snap?.ally)}${card(snap?.enemy)}</div>`);
  }

  function cleanupLeakedDelete(){
    const root = document.getElementById('modal-root');
    if(!root) return;
    const txt = root.textContent || '';
    const settings = /환경설정|설정/.test(txt) && !/채팅|기술|특성|출전목록|플레이어|프렌들리숍|상점|타입 상성|스탯 확인|신화 지닌물건|제작 지닌물건/.test(txt);
    if(!settings){
      root.querySelectorAll('[data-delete-character-v3],[data-delete-character-v4],[data-delete-character-v12],.delete-character-section-v3,.delete-character-section-v4,.delete-character-section-v12,.nickname-change-fullpvp').forEach(n=>n.remove());
    }
  }

  function ensureCraftPanel(){
    const c = document.getElementById('content-area');
    if(!c) return;
    const txt = c.textContent || '';
    if(!/아이템|보유 재화|지닌물건|소비/.test(txt)) return;
    c.querySelectorAll('.fix14-craft-panel').forEach((el,i)=>{ if(i>0) el.remove(); });
    if(c.querySelector('.fix14-craft-panel')) return;
    c.insertAdjacentHTML('beforeend', `<section class="panel-card fix14-craft-panel"><div class="section-title-row"><div><h2 class="section-title">제작</h2><p class="section-caption">알 조각으로 교환, 파편과 지식으로 희귀 지닌물건을 랜덤 제작합니다</p></div></div><div class="fix14-craft-grid"><button class="chip-btn" data-fix14-exchange="egg">알 교환</button><button class="chip-btn" data-fix14-exchange="huge">거대알 교환</button><button class="chip-btn" data-fix14-craft="mythic">신화 지닌물건 제작</button><button class="chip-btn" data-fix14-craft="artisan">제작 지닌물건 제작</button><button class="chip-btn" data-fix14-list="mythic">신화 지닌물건</button><button class="chip-btn" data-fix14-list="artisan">제작 지닌물건</button></div></section>`);
  }

  function renderImportantList(type){
    const mythic = ['그란돈의 골격: 공격 +20%, 매 턴 HP 소량 감소','백옥: 특수공격 +20%','가이오가의 심장: 방어/특방 +10%, 급소 피해 감소','금강석: 체력 30% 이하일 때 다음 행동 우선'];
    const artisan = ['각성의 창: HP 50% 이하 시 공격/특공 상승','투지의 혈청: 아군 기절 뒤 첫 공격 +25%','사냥 본능: 상대 HP 40% 이하 피해 +20%','폭풍 발톱: 같은 타입 연속 사용 시 위력 누적','불굴의 갑옷: HP 30% 이하 방어/특방 상승','금빛성광: 첫 턴 스피드 상승','무한 성장약: KO 시 랜덤 능력치 상승','신속의 신발: 느리게 행동한 뒤 다음 턴 스피드 상승','삼신기 파편: 시작 시 공격/방어/스피드 중 하나 상승','봉인 사슬: 초반 약화, HP 50% 이하 전체 강화'];
    const arr = type === 'mythic' ? mythic : artisan;
    modal(type === 'mythic' ? '신화 지닌물건' : '제작 지닌물건', `<div class="placeholder-stack">${arr.map(x=>`<div class="placeholder-card"><p>${esc(x)}</p></div>`).join('')}</div>`);
  }

  function changeMat(id, delta){
    const p = player(); if(!p) return false;
    p.bag = p.bag || {}; p.bag.consumables = p.bag.consumables || [];
    let e = p.bag.consumables.find(x => norm(x.id) === id);
    if(!e && delta > 0){ e = {id, nameKo:id, amount:0}; p.bag.consumables.push(e); }
    if(!e) return false;
    if(finite(e.amount,0) + delta < 0) return false;
    e.amount = finite(e.amount,0) + delta;
    return true;
  }
  function addHoldable(item){
    const p = player(); if(!p) return;
    p.bag = p.bag || {}; p.bag.holdables = p.bag.holdables || [];
    const e = p.bag.holdables.find(x => norm(x.id) === norm(item.id));
    if(e) e.amount = finite(e.amount,0)+1; else p.bag.holdables.push({...item, amount:1, category:'지닌물건'});
  }
  function handleCraft(type){
    const mythicItems = [
      {id:'groudon_skeleton',nameKo:'그란돈의 골격'}, {id:'palkia_pearl',nameKo:'백옥'}, {id:'kyogre_heart',nameKo:'가이오가의 심장'}, {id:'dialga_diamond',nameKo:'금강석'}
    ];
    const artisanItems = [
      {id:'awakening_lance',nameKo:'각성의 창'}, {id:'fighting_serum',nameKo:'투지의 혈청'}, {id:'hunting_instinct',nameKo:'사냥 본능'}, {id:'storm_claw',nameKo:'폭풍 발톱'}, {id:'unyielding_armor',nameKo:'불굴의 갑옷'}, {id:'golden_starlight',nameKo:'금빛성광'}, {id:'infinite_growth_drug',nameKo:'무한 성장약'}, {id:'swift_boots',nameKo:'신속의 신발'}, {id:'tri_relic_fragment',nameKo:'삼신기 파편'}, {id:'sealing_chain',nameKo:'봉인 사슬'}
    ];
    if(type === 'mythic'){
      if(!changeMat('mythic_fragment', -50)){ toast('신화의 파편이 부족합니다.'); return; }
      const item = mythicItems[Math.floor(Math.random()*mythicItems.length)]; addHoldable(item); toast(`${item.nameKo} 제작 완료`);
    } else {
      if(!changeMat('artisan_knowledge', -30)){ toast('장인의 지식이 부족합니다.'); return; }
      const item = artisanItems[Math.floor(Math.random()*artisanItems.length)]; addHoldable(item); toast(`${item.nameKo} 제작 완료`);
    }
    ui()?.renderAll?.();
  }
  function handleExchange(kind){
    if(kind === 'egg'){
      if(!changeMat('egg_shard', -10)){ toast('알 조각이 부족합니다.'); return; }
      core()?.addConsumable?.('p1','mystery_egg',1); toast('알을 교환했습니다.'); ui()?.renderAll?.(); return;
    }
    if(!changeMat('huge_egg_shard', -10)){ toast('거대알 조각이 부족합니다.'); return; }
    core()?.addConsumable?.('p1','huge_egg',1); toast('거대알을 교환했습니다.'); ui()?.renderAll?.();
  }

  function removeSquadGuideText(){
    document.querySelectorAll('.empty-state,p,div').forEach(n=>{
      if(n.childElementCount === 0 && /현재 단계에서는 시작 포켓몬 2마리와 201번도로 보상 2마리/.test(n.textContent||'')) n.remove();
    });
  }

  function ensureIntro(){
    const c = core(); const p = player();
    if(!c || !p || c.state?.currentScreen !== 'lobby') return;
    if((document.getElementById('modal-root')?.textContent||'').trim()) return;
    if(!(p.squad||[]).length) return;
    const k = `pb_intro_seen_${key()}_${p.name||''}`;
    if(localStorage.getItem(k)) return;
    localStorage.setItem(k,'pending');
    const root = document.getElementById('modal-root'); if(!root) return;
    document.body.classList.add('fix14-intro-bg');
    root.innerHTML = `<div class="fix14-intro"><div class="fix14-intro-box"><p>당신은 배틀에 필요한 몇가지 물건을 챙겨서 최고의 포켓몬들을 다루기 위해 길을 떠났습니다. 경쟁자들을 이기고 올라가서 플레이어 챔피언이 되어보세요.</p><button type="button" class="fix14-intro-next" data-fix14-intro-close="1">▶</button></div></div>`;
  }

  function openOnlineChat(){
    try{ PB.ui?.openChatModal?.(); }catch(e){ modal('채팅','<p>채팅창을 불러오는 중 문제가 발생했습니다.</p>'); }
    setTimeout(cleanupLeakedDelete, 20);
  }

  function showBattleEndStable(payload){
    const grid = document.getElementById('battle-action-grid');
    if(!grid) return;
    const stats = payload?.stats || PB.battleEngine?.exportPvpSyncState?.()?.stats || PB.battleEngine?.getSnapshot?.()?.stats || {};
    let rows = Object.values(stats).map(s => `<tr><td>${esc(s.name||s.pokemonName||'포켓몬')}</td><td>${finite(s.damageDealt,0)}</td><td>${finite(s.survivedDamage ?? s.damageTaken,0)}</td></tr>`).join('');
    if(!rows) rows = '<tr><td colspan="3">통계 없음</td></tr>';
    const html = `<div class="fix14-battle-end"><h3>배틀 통계</h3><table><thead><tr><th>포켓몬</th><th>딜량</th><th>버틴피해</th></tr></thead><tbody>${rows}</tbody></table><button type="button" class="action-button" data-fix14-exit-lobby="1"><span class="action-title">나가기</span><span class="action-sub">로비로 이동</span></button></div>`;
    S.lastEndHtml = html;
    S.endLocked = true;
    grid.innerHTML = html;
  }

  function patchBattleEnd(){ /* fix15 disabled fix14 old end wrapper */ return; 
    const be = PB.battleEngine;
    if(be && !be.__fix14EndPatch){
      be.__fix14EndPatch = true;
      const oldStart = be.startBattle;
      be.startBattle = function(opts={}){
        const original = opts.onComplete;
        return oldStart.call(this, {...opts, onComplete:(payload)=>{
          let result;
          try{ result = original ? original(payload) : undefined; }catch(e){ console.warn(e); }
          setTimeout(()=>showBattleEndStable(payload), 10);
          return true;
        }});
      };
    }
    const c = core();
    if(c && !c.__fix14LobbyGuard){
      c.__fix14LobbyGuard = true;
      const oldReturn = c.returnToLobby?.bind(c);
      c.returnToLobby = function(){ if(S.endLocked){ showBattleEndStable(); return; } return oldReturn ? oldReturn() : undefined; };
    }
  }

  function patchPvpV12(){
    // v12 remains the only loaded realtime PvP handler. This flag tells old helpers not to reattach.
    window.__ALLOW_OLD_PVP = false;
    if(PB.phase2PvpV12) PB.phase2PvpV12.sent = false;
  }

  function decorate(){
    patchCore(); patchBattleEnd(); patchPvpV12(); cleanupLeakedDelete(); ensureCraftPanel(); removeSquadGuideText();
    const c = core();
    if(c?.state?.currentScreen === 'lobby'){
      document.body.classList.add('fix14-lobby-bg');
    } else document.body.classList.remove('fix14-lobby-bg');
    // stabilize important modal/price text
    document.querySelectorAll('.shop-item-card,.fix11-shop-card').forEach(card=>{
      card.innerHTML = card.innerHTML.replace(/기술머신[:：]\s*/g,'');
      if(/이상한사탕/.test(card.textContent||'')) card.innerHTML = card.innerHTML.replace(/\$?500원?|\$?70원?/g,'$200');
      if(/알/.test(card.textContent||'') && !/거대알/.test(card.textContent||'')) card.innerHTML = card.innerHTML.replace(/\$?500원?/g,'$700');
    });
    document.querySelectorAll('.shop-price,.price-pill,.fix11-price-pill').forEach(el=>{ if(/500|70/.test(el.textContent||'') && el.closest('.shop-item-card,.fix11-shop-card')?.textContent?.includes('이상한사탕')) el.textContent='$200'; });
    // if an end screen is locked, stop old scripts replacing it with blank/white variants
    if(S.endLocked && core()?.state?.currentScreen === 'battle'){
      const grid = document.getElementById('battle-action-grid');
      if(grid && !grid.querySelector('[data-fix14-exit-lobby]') && S.lastEndHtml) grid.innerHTML = S.lastEndHtml;
    }
  }

  function bindGlobal(){
    if(S.bound) return; S.bound = true;
    window.addEventListener('click', async (e)=>{
      const target = e.target;
      if(target.closest?.('[data-fix14-close]')){ e.preventDefault(); e.stopImmediatePropagation(); document.getElementById('modal-root').innerHTML=''; return; }
      if(target.closest?.('[data-fix14-intro-close]')){ e.preventDefault(); e.stopImmediatePropagation(); localStorage.setItem(`pb_intro_seen_${key()}_${player()?.name||''}`,'1'); const box=document.querySelector('.fix14-intro-box'); if(box){ box.style.opacity='0'; box.style.transform='translateY(12px)'; setTimeout(()=>{document.getElementById('modal-root').innerHTML='';},420); } else document.getElementById('modal-root').innerHTML=''; return; }
      if(target.closest?.('#open-type-chart-btn,#battle-type-chart-btn,[data-battle-action="info"]')){ e.preventDefault(); e.stopImmediatePropagation(); PB.ui?.openTypeChartModal?.(); return; }
      if(target.closest?.('#battle-stats-btn')){ e.preventDefault(); e.stopImmediatePropagation(); showStatsModal(); return; }
      if(target.closest?.('#open-chat-btn,.chat-fab,[data-open-chat]')){ e.preventDefault(); e.stopImmediatePropagation(); openOnlineChat(); return; }
      const hatch = target.closest?.('[data-hatch-egg]');
      if(hatch){ e.preventDefault(); e.stopImmediatePropagation(); const res = core()?.hatchEgg?.(core()?.state?.activePlayerId||'p1', hatch.dataset.hatchEgg); if(!res?.ok){ toast(res?.message||'부화할 수 없습니다.'); return; } PB.ui?.playUiSound?.('abutton'); if(PB.ui?.openEggHatchModal) PB.ui.openEggHatchModal(res); else { PB.ui?.showToast?.('알이 부화했습니다.'); } PB.ui?.renderAll?.(); return; }
      const list = target.closest?.('[data-fix14-list]');
      if(list){ e.preventDefault(); e.stopImmediatePropagation(); renderImportantList(list.dataset.fix14List); return; }
      const craft = target.closest?.('[data-fix14-craft]');
      if(craft){ e.preventDefault(); e.stopImmediatePropagation(); handleCraft(craft.dataset.fix14Craft); return; }
      const exchange = target.closest?.('[data-fix14-exchange]');
      if(exchange){ e.preventDefault(); e.stopImmediatePropagation(); handleExchange(exchange.dataset.fix14Exchange); return; }
      const exit = target.closest?.('[data-fix14-exit-lobby],[data-content-v2-exit],[data-pvp12-end-exit],[data-hotfix-exit-lobby],[data-battle-exit-lobby]');
      if(exit){ e.preventDefault(); e.stopImmediatePropagation(); S.endLocked=false; S.lastEndHtml=''; if(PB.phase2ContentV2){ PB.phase2ContentV2.endLocked=false; PB.phase2ContentV2.allowExit=true; } if(PB.phase2ContentHotfix){ PB.phase2ContentHotfix.endLocked=false; PB.phase2ContentHotfix.endPayload=null; } try{ if(PB.phase2PvpV12){ PB.phase2PvpV12.active=false; PB.phase2PvpV12.started=false; } }catch(err){} if(core()?.state) core().state.currentScreen='lobby'; PB.ui?.renderAll?.(); return; }
      const buy = target.closest?.('[data-hotfix-shop-buy],[data-fix11-shop-buy],[data-shop-buy]');
      if(buy){ e.preventDefault(); e.stopImmediatePropagation(); const id=buy.dataset.hotfixShopBuy||buy.dataset.fix11ShopBuy||buy.dataset.shopBuy; const res = core()?.buyShopItem?.(core()?.state?.activePlayerId||'p1', id); toast(res?.ok ? `${res.item?.nameKo||'아이템'} 구매 완료` : (res?.message||'구매 실패')); setTimeout(()=>PB.ui?.renderAll?.(),0); return; }
    }, true);
  }

  function css(){
    if(document.getElementById('fix14-restore-css')) return;
    const st = document.createElement('style');
    st.id = 'fix14-restore-css';
    st.textContent = `
      body.fix14-lobby-bg #lobby-screen, body.fix14-intro-bg #lobby-screen{background:linear-gradient(rgba(4,10,22,.28),rgba(4,10,22,.34)),url('pokebackground.png') center center / contain no-repeat !important;background-color:#06101f!important;}
      body.fix14-lobby-bg #lobby-screen .panel-card, body.fix14-lobby-bg #lobby-screen .placeholder-card, body.fix14-lobby-bg #lobby-screen .menu-card{background:rgba(7,14,29,.58)!important;backdrop-filter:blur(9px)!important;border-color:rgba(126,207,255,.24)!important;}
      .fix14-craft-panel{margin-top:14px!important;background:rgba(7,14,29,.58)!important;border:1px solid rgba(126,207,255,.24)!important;backdrop-filter:blur(9px)!important}.fix14-craft-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.fix14-craft-panel .section-title,.fix14-craft-panel .section-caption{color:#fff!important;-webkit-text-fill-color:#fff!important;}
      .fix14-modal{background:rgba(8,12,22,.96)!important;color:#fff!important}.fix14-modal *{color:#fff!important}.fix14-modal .placeholder-card{background:rgba(255,255,255,.08)!important;border-color:rgba(255,255,255,.16)!important}.fix14-modal .close-btn{color:#fff!important;}
      .fix14-intro{position:fixed;inset:0;z-index:10000;display:flex;align-items:flex-end;justify-content:center;padding:22px;background:linear-gradient(rgba(0,0,0,.04),rgba(0,0,0,.16)),url('pokebackground.png') center center / contain no-repeat #06101f;box-sizing:border-box}.fix14-intro-box{width:min(92vw,520px);background:rgba(255,255,255,.82);border:1px solid rgba(255,255,255,.68);border-radius:22px;padding:18px 18px 38px;position:relative;transition:.42s ease;box-shadow:0 20px 60px rgba(0,0,0,.35)}.fix14-intro-box p{color:#06101f!important;-webkit-text-fill-color:#06101f!important;font-size:16px;line-height:1.55;font-weight:1000}.fix14-intro-next{position:absolute;right:18px;bottom:10px;background:transparent;border:0;color:#e83232!important;font-size:22px;font-weight:1000;animation:fix14Arrow 1s infinite}@keyframes fix14Arrow{50%{transform:translateX(4px)}}
      .fix14-battle-end{width:100%;background:rgba(255,255,255,.97)!important;color:#06101f!important;border-radius:18px;padding:12px;box-sizing:border-box}.fix14-battle-end *{color:#06101f!important;-webkit-text-fill-color:#06101f!important}.fix14-battle-end table{width:100%;border-collapse:collapse}.fix14-battle-end td,.fix14-battle-end th{padding:5px;border-bottom:1px solid rgba(0,0,0,.14);text-align:left}.fix14-battle-end .action-button{background:#111827!important}.fix14-battle-end .action-button *{color:#fff!important;-webkit-text-fill-color:#fff!important}
      #battle-action-grid .action-button .action-title,#battle-action-grid .action-button .action-sub{color:#06101f!important;-webkit-text-fill-color:#06101f!important}.fix14-battle-end .action-button .action-title,.fix14-battle-end .action-button .action-sub{color:#fff!important;-webkit-text-fill-color:#fff!important}
      .shop-item-card .item-title-row h3,.fix11-shop-card h3{color:#fff!important;-webkit-text-fill-color:#fff!important}.shop-item-card,.fix11-shop-card{max-width:100%!important;transform:none!important;transition:none!important}.shop-price,.fix11-price-pill,.price-pill{background:#ffd84f!important;color:#06101f!important;-webkit-text-fill-color:#06101f!important;border-radius:999px!important;padding:4px 9px!important;}
      #modal-root:not(:has(.settings-modal)):not(:has(.settings-section)) [data-delete-character-v3],#modal-root:not(:has(.settings-modal)):not(:has(.settings-section)) [data-delete-character-v4],#modal-root:not(:has(.settings-modal)):not(:has(.settings-section)) .delete-character-section-v3,#modal-root:not(:has(.settings-modal)):not(:has(.settings-section)) .delete-character-section-v4{display:none!important;}
    `;
    document.head.appendChild(st);
  }

  function init(){
    css(); bindGlobal(); patchCore(); patchBattleEnd();
    setInterval(decorate, 350);
    setTimeout(ensureIntro, 1300);
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true}); else init();
})();
