(function(){
  'use strict';
  const PB = window.POKEBATTLE || (window.POKEBATTLE = {});
  const F = PB.phase2Fix12Interactions = PB.phase2Fix12Interactions || { bound:false, patched:false };
  const core=()=>PB.core; const ui=()=>PB.ui;
  const norm=(v)=>String(v||'').trim().toLowerCase().replace(/[^a-z0-9_가-힣]/g,'');
  const player=()=>core()?.getPlayer?.(core()?.state?.activePlayerId||'p1') || core()?.getActivePlayer?.();
  function playRootAudio(src, volume=0.8){
    try{ const a=new Audio(src); a.volume=volume; a.currentTime=0; a.play().catch(()=>{}); setTimeout(()=>{try{a.pause();}catch(e){}},2500); }catch(e){}
  }
  function patchUiSounds(){
    const u=ui(); if(!u || u.__fix12SoundPatch) return; u.__fix12SoundPatch=true;
    const old=u.playUiSound?.bind(u);
    u.playUiSound=function(kind, delay=0){
      if(kind==='buy' || kind==='buying'){ setTimeout(()=>playRootAudio('buying_sound.mp3',0.75), delay||0); return; }
      if(kind==='storedoor'){ setTimeout(()=>playRootAudio('sound/storedoor.mp3',0.8), delay||0); return old ? old(kind, delay) : undefined; }
      return old ? old(kind, delay) : undefined;
    };
  }
  function patchShopApi(){
    const c=core(); if(!c || c.__fix12ShopApi) return; c.__fix12ShopApi=true;
    const baseCatalog=c.getShopCatalog?.bind(c);
    c.getShopCatalog=function(){
      let list=(baseCatalog?baseCatalog():(c.state?.itemList||[])).filter(Boolean).map(it=>({...it}));
      list=list.filter(it=>!['mythic_fragment','artisan_knowledge'].includes(norm(it.id)));
      list.forEach(it=>{ const id=norm(it.id); if(id==='rare_candy') it.price=200; if(id==='mystery_egg') it.price=700; if(id==='huge_egg') it.price=6000; if(id==='good_potion') it.price=100; if(id==='revive_shard') it.price=200; });
      return list;
    };
    const oldBuy=c.buyShopItem?.bind(c);
    c.buyShopItem=function(playerId,itemId){
      const entry=c.getShopCatalog().find(it=>norm(it.id)===norm(itemId));
      if(entry){ const p=c.getPlayer?.(playerId||c.state?.activePlayerId||'p1'); if(!p) return {ok:false,message:'플레이어 정보 없음'}; if(Number(p.money||0)<Number(entry.price||0)) return {ok:false,message:'재화가 부족합니다.'}; p.money=Number(p.money||0)-Number(entry.price||0); if(String(entry.category||'').includes('지닌물건')){ p.bag=p.bag||{}; p.bag.holdables=p.bag.holdables||[]; const ex=p.bag.holdables.find(x=>norm(x.id)===norm(entry.id)); if(ex) ex.amount=Number(ex.amount||0)+1; else p.bag.holdables.push({id:entry.id,nameKo:entry.nameKo,amount:1,category:entry.category,description:entry.description,battleEffect:entry.battleEffect,colorA:entry.colorA,rank:entry.rank}); } else { c.addConsumable?.(playerId||c.state?.activePlayerId||'p1', entry.id, 1); } ui()?.playUiSound?.('buy'); return {ok:true,item:entry}; }
      return oldBuy ? oldBuy(playerId,itemId) : {ok:false,message:'구매 실패'};
    };
  }
  function ensureMoneyBadge(){
    const st=core()?.state; if(!st || st.currentScreen!=='lobby') { document.getElementById('fix12-money-badge')?.remove(); return; }
    const p=player(); if(!p) return;
    let b=document.getElementById('fix12-money-badge');
    if(!b){ b=document.createElement('div'); b.id='fix12-money-badge'; document.body.appendChild(b); }
    b.textContent=`보유 재화: $${Number(p.money||0)}`;
  }
  function cleanupModals(){
    const root=document.getElementById('modal-root'); if(!root) return;
    const txt=root.textContent||'';
    const isSettings=/환경설정|설정/.test(txt) && !/프렌들리숍|기술 목록|출전목록|플레이어|상점/.test(txt);
    if(!isSettings){ root.querySelectorAll('[data-delete-character-v3],[data-delete-character-v4],.delete-character-section-v3,.delete-character-section-v4,.delete-character-section-v12').forEach(n=>n.remove()); }
  }
  function bind(){
    if(F.bound) return; F.bound=true;
    document.addEventListener('pointerdown',e=>{ if(e.target.closest?.('#open-friendly-shop-btn')) playRootAudio('sound/storedoor.mp3',0.8); if(e.target.closest?.('[data-fix11-shop-buy],[data-shop-buy]')) playRootAudio('buying_sound.mp3',0.75); }, true);
    document.addEventListener('click',e=>{
      const sel=e.target.closest?.('[data-select-item]');
      if(sel && document.getElementById('content-area')?.contains(sel)){
        e.preventDefault(); e.stopImmediatePropagation(); ui()?.playUiSound?.('change'); core()?.selectItem?.(sel.dataset.selectItem); setTimeout(()=>ui()?.renderAll?.(),0); return;
      }
      const target=e.target.closest?.('[data-item-target]');
      if(target && document.getElementById('content-area')?.contains(target)){
        e.preventDefault(); e.stopImmediatePropagation(); ui()?.playUiSound?.('abutton'); core()?.toggleHeldItem?.(target.dataset.itemTarget); setTimeout(()=>ui()?.renderAll?.(),0); return;
      }
    }, true);
  }
  function css(){
    if(document.getElementById('fix12-interactions-css')) return;
    const s=document.createElement('style'); s.id='fix12-interactions-css'; s.textContent=`
      #fix12-money-badge{position:fixed;right:12px;top:calc(10px + env(safe-area-inset-top,0px));z-index:32;background:rgba(0,0,0,.45);border:1px solid rgba(255,216,79,.45);color:#ffd84f!important;-webkit-text-fill-color:#ffd84f!important;border-radius:999px;padding:7px 12px;font-weight:1000;font-size:12px;pointer-events:none;backdrop-filter:blur(6px)}
      .item-squad-chip .reserve-meta,.item-squad-chip .reserve-meta *{color:#f6d34a!important;-webkit-text-fill-color:#f6d34a!important;text-shadow:none!important;}
      .p2-player-row small{color:#050b18!important;-webkit-text-fill-color:#050b18!important;font-weight:900!important;}
      .fix11-shop-modal [data-delete-character-v3],.fix11-shop-modal [data-delete-character-v4],.fix11-shop-modal .delete-character-section-v3,.fix11-shop-modal .delete-character-section-v4,.p2-modal [data-delete-character-v3],.p2-modal [data-delete-character-v4],.p2-modal .delete-character-section-v3,.p2-modal .delete-character-section-v4{display:none!important;}
      .fix11-shop-card,.shop-item-card{width:100%!important;max-width:100%!important;box-sizing:border-box!important;transform:none!important;transition:background .12s ease,border-color .12s ease!important;}
      .fix11-shop-grid,.shop-grid{overflow-x:hidden!important;}
      .fix11-shop-card:active,.shop-item-card:active{transform:none!important;}
      #content-area [data-select-item],#content-area [data-item-target]{pointer-events:auto!important;touch-action:manipulation!important;}
    `; document.head.appendChild(s);
  }
  function init(){ css(); patchUiSounds(); patchShopApi(); bind(); setInterval(()=>{ patchUiSounds(); patchShopApi(); cleanupModals(); ensureMoneyBadge(); },300); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init, {once:true}); else init();
})();
