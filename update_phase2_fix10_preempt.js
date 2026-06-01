(function(){
  'use strict';
  const PB = window.POKEBATTLE || (window.POKEBATTLE = {});
  const F = PB.phase2Fix10Preempt = PB.phase2Fix10Preempt || { restTimer:null, restActive:false, shopPage:0 };
  const esc = (v)=>String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm = (v)=>String(v||'').toLowerCase().replace(/[^a-z0-9_가-힣]/g,'');
  const core = ()=>PB.core;
  const ui = ()=>PB.ui;
  function player(){ return core()?.getPlayer?.('p1') || core()?.getActivePlayer?.() || null; }
  function toast(m){ ui()?.showToast?.(m); }
  function pName(p){ return p?.currentName || p?.nickname || p?.name || p?.base?.nameKo || p?.nameKo || '포켓몬'; }
  function spriteOf(p){ return p?.base?.image || p?.base?.sprite || p?.base?.asset || p?.image || p?.sprite || ''; }
  const stationary = new Set(['흥나숭','채키몽','고릴타','염버니','래비풋','에이스번','울머기','누겔레온','인텔리레온','인텔라레온']);
  function patchPrice(item){
    const id = norm(item?.id); const x = {...item};
    if(id==='rare_candy') x.price = 200;
    if(id==='mystery_egg') x.price = 700;
    if(id==='good_potion') x.price = 100;
    if(id==='revive_shard') x.price = 200;
    return x;
  }
  function getShopItems(){
    const c=core();
    let list = (c?.getShopCatalog?.() || c?.getFriendlyShopInventory?.('p1', true) || []);
    const seen = new Set();
    return list.filter(Boolean).filter(it=>{ const id=norm(it.id); if(seen.has(id)) return false; seen.add(id); return !['mythic_fragment','artisan_knowledge'].includes(id); }).map(patchPrice);
  }
  function tmDescription(item){
    const mv = item?.tmMove || item?.move || {};
    const type = mv.type || item?.type || '노말';
    const power = mv.power ?? item?.power ?? '-';
    const accuracy = mv.accuracy ?? item?.accuracy ?? '-';
    const category = mv.category || item?.categoryKo || '기술';
    const logic = String(item?.logic || item?.description || item?.battleEffect || '').trim();
    return `<div class="fix10-tm-info-box">
      <h3>${esc((item?.nameKo || '').replace(/^기술머신[:：]\s*/,''))}</h3>
      <p><b>타입</b> ${esc(type)} · <b>분류</b> ${esc(category)} · <b class="power">위력 ${esc(power)}</b> · <b>명중 ${esc(accuracy)}</b></p>
      <p><b>운용법</b> 상대에게 유리한 타입이면 큰 피해를 노리고, 변화기는 랭크업/견제/보조 용도로 사용합니다.</p>
      <p><b>게임 적용 로직</b> 기술머신을 사용하면 배울 수 있는 포켓몬에게 해당 기술이 등록됩니다. 이미 기술이 가득 차 있으면 기존 기술 1개를 대체하는 방식으로 처리됩니다.</p>
      <p>${esc(logic || '기술 타입, 위력, 명중률, 분류에 따라 배틀 엔진의 데미지/효과 계산에 적용됩니다.')}</p>
    </div>`;
  }
  function openInfo(id){
    const item = getShopItems().find(it=>norm(it.id)===norm(id));
    const root=document.getElementById('modal-root'); if(!root||!item) return;
    root.insertAdjacentHTML('beforeend',`<div class="overlay fix10-info-overlay"><div class="modal fix10-tm-modal"><button type="button" class="close-btn" data-fix10-close-info="1">✕</button>${tmDescription(item)}</div></div>`);
  }
  function openShop(page=0){
    const root=document.getElementById('modal-root'); if(!root) return;
    const p=player() || {};
    const items = getShopItems(); const size=7; const pages=Math.max(1, Math.ceil(items.length/size));
    F.shopPage = ((Number(page)||0)%pages + pages)%pages;
    const rows = items.slice(F.shopPage*size, F.shopPage*size+size).map(it=>{
      const id=norm(it.id), isTm=id.startsWith('tm_')||String(it.category||'').includes('기술머신')||String(it.nameKo||'').includes('기술머신');
      const name=String(it.nameKo||'아이템').replace(/^기술머신[:：]\s*/,'');
      const powerText = it?.tmMove?.power || it?.power;
      return `<div class="fix10-shop-card">
        <div class="fix10-shop-row"><div class="fix10-shop-main"><h3>${esc(name)}</h3><p class="fix10-shop-cat">${esc(it.category||'')}</p><p>${esc(it.battleEffect||it.description||'')}</p>${powerText?`<p class="fix10-power">위력 ${esc(powerText)}</p>`:''}</div><span class="fix10-shop-price">$${Number(it.price||0)}</span></div>
        <div class="fix10-shop-actions">${isTm?`<button type="button" data-fix10-tm-info="${esc(it.id)}">설명</button>`:''}<button type="button" class="buy" data-fix10-shop-buy="${esc(it.id)}">구매</button></div>
      </div>`;
    }).join('');
    root.innerHTML = `<div class="overlay fix10-shop-overlay"><div class="modal large-modal fix10-shop-modal" role="dialog" aria-modal="true"><div class="modal-header"><div class="modal-title-wrap"><h2>프렌들리숍</h2><p>보유 재화: <span class="money-text">$${Number(p.money||0)}</span></p></div><button type="button" class="ghost-btn" data-fix10-shop-close="1">닫기</button></div><div class="modal-body"><div class="shop-pager-row"><button type="button" class="chip-btn" data-fix10-shop-page="${F.shopPage-1}">◀</button><span class="shop-page-indicator">${F.shopPage+1} / ${pages}</span><button type="button" class="chip-btn" data-fix10-shop-page="${F.shopPage+1}">▶</button></div><div class="fix10-shop-grid">${rows || '<div class="empty-state">표시할 아이템이 없습니다.</div>'}</div></div></div></div>`;
  }
  function startRest(){
    const lobby=document.getElementById('lobby-screen'); if(!lobby) return;
    stopRest(false);
    F.restActive=true; if(PB.phase2Online) PB.phase2Online.tab='rest';
    lobby.classList.add('fix10-rest-active');
    const main=(player()?.squad||[])[0]; const src=spriteOf(main); const name=pName(main); const isStationary = stationary.has(name) || /\.mp4(?:\?|$)/i.test(src);
    const overlay=document.createElement('div'); overlay.id='fix10-rest-layer'; overlay.innerHTML=`<button type="button" class="fix10-rest-exit" data-fix10-rest-exit="1">나가기</button><div class="fix10-rest-mon" data-fix10-rest-mon="1"></div>`; lobby.appendChild(overlay);
    const slot=overlay.querySelector('.fix10-rest-mon');
    const renderMon=(x)=>{
      if(!slot) return;
      const style = isStationary ? 'left:50%;bottom:24px;transform:translateX(-50%);' : `left:${x}%;bottom:${20+Math.random()*26}px;`;
      const media = src ? (/\.mp4(?:\?|$)/i.test(src) ? `<video src="${esc(src)}" autoplay loop muted playsinline webkit-playsinline></video>` : `<img src="${esc(src)}" alt="${esc(name)}">`) : `<span>${esc(String(name).slice(0,1))}</span>`;
      slot.innerHTML = `<div class="fix10-rest-pokemon ${isStationary?'stationary':'moving'}" style="${style}">${media}</div>`;
      slot.querySelectorAll('video').forEach(v=>{ try{ v.play?.().catch(()=>{}); }catch(e){} });
    };
    renderMon(18+Math.random()*58);
    if(!isStationary){ F.restTimer=setInterval(()=>renderMon(18+Math.random()*58), 5000); }
  }
  function stopRest(render=true){
    if(F.restTimer) clearInterval(F.restTimer); F.restTimer=null; F.restActive=false;
    const lobby=document.getElementById('lobby-screen'); lobby?.classList.remove('fix10-rest-active');
    document.getElementById('fix10-rest-layer')?.remove();
    if(render){ if(PB.phase2Online) PB.phase2Online.tab='ranked'; ui()?.renderAll?.(); }
  }
  function jumpRest(){ const el=document.querySelector('.fix10-rest-pokemon'); if(!el) return; el.classList.remove('jump'); void el.offsetWidth; el.classList.add('jump'); }
  function installCss(){ if(document.getElementById('fix10-preempt-css')) return; const st=document.createElement('style'); st.id='fix10-preempt-css'; st.textContent=`
    .p2-tabs [data-p2-tab="rest"],.online-tab-row [data-p2-tab="rest"]{text-align:center!important;justify-content:center!important;align-items:center!important;}
    #lobby-screen,.lobby-screen{background-image:linear-gradient(180deg,rgba(1,8,13,.06),rgba(1,8,13,.16)),url('pokebackground.png')!important;background-size:100% 100%!important;background-position:center center!important;background-repeat:no-repeat!important;background-color:#06111d!important;}
    #lobby-screen.fix10-rest-active .top-shell,#lobby-screen.fix10-rest-active #content-area,#lobby-screen.fix10-rest-active .bottom-nav,#lobby-screen.fix10-rest-active #open-type-chart-btn{visibility:hidden!important;pointer-events:none!important;}
    #fix10-rest-layer{position:absolute;inset:0;z-index:50;pointer-events:none;overflow:hidden;background:transparent!important;}
    .fix10-rest-exit{position:absolute;right:12px;top:calc(env(safe-area-inset-top,0px) + 12px);z-index:55;pointer-events:auto;border:1px solid rgba(255,255,255,.42);border-radius:999px;background:rgba(0,0,0,.58);color:#fff;font-weight:1000;padding:10px 14px;box-shadow:0 10px 28px rgba(0,0,0,.34)}
    .fix10-rest-mon{position:absolute;inset:0;pointer-events:none}.fix10-rest-pokemon{position:absolute;z-index:54;pointer-events:auto;transform-origin:50% 100%;}.fix10-rest-pokemon img,.fix10-rest-pokemon video{max-width:92px;max-height:92px;width:auto;height:auto;object-fit:contain;filter:drop-shadow(0 12px 16px rgba(0,0,0,.45));}.fix10-rest-pokemon.moving{animation:fix10RestWiggle 2.2s ease-in-out forwards}.fix10-rest-pokemon.stationary img,.fix10-rest-pokemon.stationary video{max-width:108px;max-height:108px}.fix10-rest-pokemon.jump{animation:fix10RestJump 1s ease-in-out!important}@keyframes fix10RestWiggle{0%{opacity:0;transform:translateY(8px) rotate(0)}18%{opacity:1;transform:translateY(0) rotate(-20deg)}42%{transform:rotate(20deg)}66%{transform:rotate(-12deg)}100%{opacity:1;transform:rotate(0)}}@keyframes fix10RestJump{0%,100%{transform:translateY(0)}35%{transform:translateY(-34px)}65%{transform:translateY(0)}}
    .fix10-shop-modal{background:linear-gradient(180deg,rgba(0,0,0,.18),rgba(0,0,0,.30)),url('shop.png') center center/contain no-repeat!important;background-color:#07111f!important;color:#fff!important;border:1px solid rgba(126,207,255,.25)!important;}
    .fix10-shop-modal .modal-header,.fix10-shop-modal .modal-body,.fix10-shop-card{background:rgba(5,13,25,.38)!important;border-color:rgba(126,207,255,.23)!important;backdrop-filter:blur(7px)!important;color:#fff!important}.fix10-shop-grid{display:grid;gap:10px;max-height:62vh;overflow:auto}.fix10-shop-card{border:1px solid;border-radius:16px;padding:12px}.fix10-shop-row{display:flex;gap:10px;align-items:flex-start;justify-content:space-between}.fix10-shop-card h3,.fix10-shop-card p,.fix10-shop-card .fix10-shop-cat{color:#fff!important;-webkit-text-fill-color:#fff!important;margin:.15rem 0}.fix10-shop-price{display:inline-flex;align-items:center;justify-content:center;background:#ffd84f!important;color:#06101f!important;-webkit-text-fill-color:#06101f!important;border-radius:999px;padding:6px 10px;font-weight:1000;white-space:nowrap}.fix10-power{color:#ffd84f!important;-webkit-text-fill-color:#ffd84f!important;font-weight:1000}.fix10-shop-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:8px}.fix10-shop-actions button{border-radius:999px;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.12);color:#fff;font-weight:900;padding:7px 11px}.fix10-shop-actions .buy{background:linear-gradient(135deg,#1b91ff,#52e2ff);color:#04111d}.fix10-tm-modal{background:rgba(0,0,0,.94)!important;color:#fff!important;border:1px solid rgba(126,207,255,.35)!important}.fix10-tm-modal *{color:#fff!important}.fix10-tm-info-box .power{color:#ffd84f!important;-webkit-text-fill-color:#ffd84f!important}.fix10-tm-info-box p{line-height:1.55}.battle-matchup{font-weight:1000!important;display:inline-block!important;margin-left:6px!important}.battle-matchup.strong{color:#159447!important;-webkit-text-fill-color:#159447!important}.battle-matchup.neutral{color:#050b18!important;-webkit-text-fill-color:#050b18!important}.battle-matchup.weak{color:#e58989!important;-webkit-text-fill-color:#e58989!important}
  `; document.head.appendChild(st); }
  document.addEventListener('click', function(e){
    const shop=e.target.closest?.('#open-friendly-shop-btn'); if(shop){ e.preventDefault(); e.stopImmediatePropagation(); openShop(0); return; }
    const pg=e.target.closest?.('[data-fix10-shop-page]'); if(pg){ e.preventDefault(); e.stopImmediatePropagation(); openShop(Number(pg.dataset.fix10ShopPage||0)); return; }
    const buy=e.target.closest?.('[data-fix10-shop-buy]'); if(buy){ e.preventDefault(); e.stopImmediatePropagation(); const res=core()?.buyShopItem?.(core()?.state?.activePlayerId||'p1',buy.dataset.fix10ShopBuy); toast(res?.ok?`${res.item?.nameKo||'아이템'} 구매 완료`:(res?.message||'구매 실패')); openShop(F.shopPage); return; }
    const info=e.target.closest?.('[data-fix10-tm-info]'); if(info){ e.preventDefault(); e.stopImmediatePropagation(); openInfo(info.dataset.fix10TmInfo); return; }
    if(e.target.closest?.('[data-fix10-shop-close],[data-fix10-close-info]')){ e.preventDefault(); e.stopImmediatePropagation(); if(e.target.closest('[data-fix10-close-info]')) e.target.closest('.overlay')?.remove(); else document.getElementById('modal-root').innerHTML=''; return; }
    const rest=e.target.closest?.('[data-p2-tab="rest"]'); if(rest || (e.target.closest?.('button') && (e.target.closest('button').textContent||'').trim()==='쉼터')){ e.preventDefault(); e.stopImmediatePropagation(); startRest(); return; }
    if(e.target.closest?.('[data-fix10-rest-exit]')){ e.preventDefault(); e.stopImmediatePropagation(); stopRest(true); return; }
    if(e.target.closest?.('[data-fix10-rest-mon],.fix10-rest-pokemon')){ e.preventDefault(); e.stopImmediatePropagation(); jumpRest(); return; }
  }, true);
  installCss();
})();
