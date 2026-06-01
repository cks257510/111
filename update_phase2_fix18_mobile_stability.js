(function(){
  'use strict';
  const PB = window.POKEBATTLE || (window.POKEBATTLE = {});
  const F18 = PB.fix18MobileStability = PB.fix18MobileStability || { lastHeight:0, mediaTimer:null, renderTimer:null };
  function qs(sel, root=document){ return root.querySelector(sel); }
  function qsa(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }
  function core(){ return PB.core; }
  function ui(){ return PB.ui; }
  function injectCss(){
    if(qs('#fix18-mobile-stability-style')) return;
    const st=document.createElement('style');
    st.id='fix18-mobile-stability-style';
    st.textContent=`
      :root{--app-height:100dvh;--vvh:100dvh;--tap-delay:0ms;}
      html,body{width:100%!important;height:var(--app-height)!important;min-height:var(--app-height)!important;max-height:var(--app-height)!important;overflow:hidden!important;overscroll-behavior:none!important;position:relative!important;}
      body{touch-action:manipulation!important;-webkit-overflow-scrolling:auto!important;}
      #app-root,.app-root{height:var(--app-height)!important;min-height:var(--app-height)!important;max-height:var(--app-height)!important;overflow:hidden!important;contain:layout paint size;}
      .screen{height:var(--app-height)!important;min-height:0!important;max-height:var(--app-height)!important;overflow:hidden!important;backface-visibility:hidden;transform:translateZ(0);}
      .screen.hidden,.screen[aria-hidden="true"]{display:none!important;visibility:hidden!important;pointer-events:none!important;opacity:0!important;}
      .screen:not(.hidden):not([aria-hidden="true"]){pointer-events:auto!important;opacity:1!important;}
      #title-screen{height:var(--app-height)!important;min-height:0!important;overflow:hidden!important;}
      #starter-screen{height:var(--app-height)!important;min-height:0!important;max-height:var(--app-height)!important;overflow-y:auto!important;overflow-x:hidden!important;overscroll-behavior:contain!important;-webkit-overflow-scrolling:touch!important;padding-bottom:calc(24px + env(safe-area-inset-bottom,0px))!important;}
      #lobby-screen,#battle-screen{height:var(--app-height)!important;min-height:0!important;max-height:var(--app-height)!important;display:flex!important;flex-direction:column!important;overflow:hidden!important;}
      #lobby-screen.hidden,#battle-screen.hidden{display:none!important;}
      .top-shell{flex:0 0 auto!important;}
      #content-area,.content-scroll{flex:1 1 auto!important;min-height:0!important;max-height:none!important;overflow-y:auto!important;overflow-x:hidden!important;overscroll-behavior:contain!important;-webkit-overflow-scrolling:touch!important;touch-action:pan-y!important;scroll-behavior:auto!important;}
      .bottom-nav{flex:0 0 auto!important;bottom:0!important;padding-bottom:calc(8px + env(safe-area-inset-bottom,0px))!important;z-index:50!important;}
      #modal-root:empty{display:none!important;pointer-events:none!important;}
      #modal-root:not(:empty){position:fixed!important;inset:0!important;z-index:9999!important;pointer-events:auto!important;}
      #modal-root .overlay{position:fixed!important;inset:0!important;z-index:9999!important;touch-action:pan-y!important;}
      #modal-root .modal-body,#modal-root .safe-shop-grid{max-height:calc(var(--app-height) - 160px)!important;overflow-y:auto!important;overscroll-behavior:contain!important;-webkit-overflow-scrolling:touch!important;}
      .online-tab-row,.online-mini-row,.p2-tabs{touch-action:pan-x pan-y!important;}
      .online-tab-row.p2-tabs,.p2-tabs{display:flex!important;grid-template-columns:none!important;gap:6px!important;overflow-x:auto!important;overflow-y:hidden!important;padding-bottom:8px!important;scroll-behavior:auto!important;overscroll-behavior-x:contain!important;-webkit-overflow-scrolling:touch!important;}
      .online-tab-row.p2-tabs button,.p2-tabs button{flex:0 0 auto!important;white-space:nowrap!important;min-width:max-content!important;}
      button,[role="button"],.pokemon-card,.reserve-chip,.starter-option-card,.action-button,.chip-btn,.p2-btn{touch-action:manipulation!important;user-select:none!important;-webkit-user-select:none!important;}
      .starter-screen .pokemon-avatar,.starter-screen .pokemon-sprite,.starter-screen .pokemon-sprite-video,.starter-screen .starter-option-card{transition:none!important;animation:none!important;will-change:auto!important;}
      .starter-screen .pokemon-avatar{transform:none!important;}
      .starter-screen .pokemon-sprite-video{display:none!important;}
      .starter-screen .f18-starter-img{display:block!important;width:100%!important;height:100%!important;object-fit:contain!important;filter:drop-shadow(0 8px 14px rgba(0,0,0,.26));}
      img[loading="lazy"],video[preload="metadata"]{content-visibility:auto;}
      .p2-online-shell,.placeholder-stack{position:relative!important;z-index:1!important;}
      .f18-no-scrollbar::-webkit-scrollbar{display:none!important;}
    `;
    document.head.appendChild(st);
  }
  function setViewportHeight(){
    const vv=window.visualViewport;
    const raw=Math.round((vv && vv.height) || window.innerHeight || document.documentElement.clientHeight || 0);
    if(!raw) return;
    if(Math.abs(raw-Number(F18.lastHeight||0))<2) return;
    F18.lastHeight=raw;
    document.documentElement.style.setProperty('--app-height', raw+'px');
    document.documentElement.style.setProperty('--vvh', raw+'px');
  }
  function installViewport(){
    if(F18.viewportInstalled) return; F18.viewportInstalled=true;
    let raf=0;
    const schedule=()=>{ if(raf) cancelAnimationFrame(raf); raf=requestAnimationFrame(()=>{raf=0; setViewportHeight();}); };
    setViewportHeight();
    window.addEventListener('resize', schedule, {passive:true});
    window.addEventListener('orientationchange', ()=>setTimeout(schedule,220), {passive:true});
    if(window.visualViewport){
      window.visualViewport.addEventListener('resize', schedule, {passive:true});
      window.visualViewport.addEventListener('scroll', schedule, {passive:true});
    }
    setInterval(schedule,1500);
  }
  function activeScreenId(){ return core()?.state?.currentScreen || (qsa('.screen').find(s=>!s.classList.contains('hidden'))?.id||'').replace('-screen',''); }
  function enforceSingleScreen(){
    const cur=activeScreenId();
    if(!cur) return;
    ['title','starter','lobby','battle'].forEach(k=>{
      const node=qs(`#${k}-screen`); if(!node) return;
      const hide=k!==cur;
      node.classList.toggle('hidden', hide);
      node.setAttribute('aria-hidden', hide?'true':'false');
      if(hide){ try{ node.setAttribute('inert',''); }catch(e){} } else { try{ node.removeAttribute('inert'); }catch(e){} }
    });
  }
  function stabilizeStarterSprites(){
    const screen=qs('#starter-screen'); if(!screen) return;
    qsa('video.pokemon-sprite-video', screen).forEach(v=>{
      const poster=v.getAttribute('poster') || v.dataset.poster || '';
      try{ v.pause(); }catch(e){}
      if(!poster) return;
      const img=document.createElement('img');
      img.className='pokemon-sprite f18-starter-img';
      img.src=poster;
      img.alt=v.getAttribute('alt') || '포켓몬';
      img.loading='eager';
      img.decoding='async';
      v.replaceWith(img);
    });
  }
  function isVisible(el){
    if(!el || !el.isConnected) return false;
    if(el.closest('.hidden,[aria-hidden="true"]')) return false;
    const r=el.getBoundingClientRect();
    const h=F18.lastHeight || window.innerHeight || 800;
    return r.width>1 && r.height>1 && r.bottom>-80 && r.top<h+80;
  }
  function tuneMedia(){
    stabilizeStarterSprites();
    qsa('img').forEach(img=>{
      if(!img.hasAttribute('loading')) img.loading = img.closest('#starter-screen,.battle-screen,.top-shell') ? 'eager' : 'lazy';
      if(!img.hasAttribute('decoding')) img.decoding='async';
    });
    qsa('video').forEach(v=>{
      const visible=isVisible(v);
      if(v.closest('#starter-screen')){ try{v.pause();}catch(e){} return; }
      if(!visible){ try{ v.pause(); }catch(e){} v.preload='metadata'; return; }
      v.preload = v.closest('#battle-screen') ? 'auto' : 'metadata';
      if(v.autoplay || v.closest('#battle-screen,.f17-avatar,.p2-mini')) v.play?.().catch(()=>{});
    });
  }
  function installObservers(){
    if(F18.observerInstalled) return; F18.observerInstalled=true;
    const mo=new MutationObserver(()=>{
      clearTimeout(F18.mediaTimer);
      F18.mediaTimer=setTimeout(()=>{ enforceSingleScreen(); tuneMedia(); },40);
    });
    mo.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','aria-hidden','src','poster']});
    document.addEventListener('visibilitychange',()=>{ if(document.hidden) qsa('video').forEach(v=>{try{v.pause();}catch(e){}}); else setTimeout(tuneMedia,80); },{passive:true});
    ['scroll','touchstart','touchend'].forEach(type=>document.addEventListener(type,()=>{ clearTimeout(F18.mediaTimer); F18.mediaTimer=setTimeout(tuneMedia,180); },{passive:true,capture:true}));
  }
  function installTouchRepair(){
    if(F18.touchInstalled) return; F18.touchInstalled=true;
    document.addEventListener('pointerdown',e=>{
      const root=qs('#modal-root');
      if(root && !root.innerHTML.trim()) root.style.pointerEvents='none';
      const hidden=e.target.closest?.('.hidden,[aria-hidden="true"]');
      if(hidden){ e.stopPropagation(); }
    },{capture:true,passive:true});
    document.addEventListener('click',e=>{
      const tab=e.target.closest?.('[data-p2-tab]');
      if(tab && PB.phase2Online){
        PB.phase2Online.tab=tab.dataset.p2Tab;
        if(['ranked','challenge','market'].includes(PB.phase2Online.tab) && window.PB_ONLINE_V3?.getOnlineState){ window.PB_ONLINE_V3.getOnlineState().view=PB.phase2Online.tab; }
        setTimeout(()=>{ enforceSingleScreen(); tuneMedia(); },30);
      }
    },{capture:true,passive:false});
  }
  function installPwa(){
    if(F18.pwaInstalled) return; F18.pwaInstalled=true;
    const canUsePwa = location.protocol === 'http:' || location.protocol === 'https:';
    // file:// 실행에서는 manifest/serviceWorker/prefetch가 CORS/보안 오류를 만들 수 있으므로 완전히 비활성화한다.
    if(canUsePwa && !qs('link[rel="manifest"]')){
      const l=document.createElement('link'); l.rel='manifest'; l.href='manifest.webmanifest'; document.head.appendChild(l);
    }
    [['theme-color','#050b18'],['apple-mobile-web-app-capable','yes'],['mobile-web-app-capable','yes']].forEach(([name,content])=>{
      if(!qs(`meta[name="${name}"]`)){ const m=document.createElement('meta'); m.name=name; m.content=content; document.head.appendChild(m); }
    });
    if(canUsePwa && 'serviceWorker' in navigator){
      window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}),{once:true});
    }
    if(!canUsePwa) return;
    const assets=['battleinterface.png','pokebackground.png','bgback.jpg','citybattle.jpg','route.jpg','shop.png','monsterball.png','GreatBall.png','UltraBall.png','masterball.png','media-videos/Scorbunny.mp4','media-videos/Sobble.mp4','media-videos/Grookey.mp4','media-videos/PrimalGroudon.mp4','media-videos/PrimalKyogre.mp4'];
    const prefetch=()=>assets.forEach(href=>{ if(qs(`link[href="${href}"]`)) return; const l=document.createElement('link'); l.rel='prefetch'; l.href=href; l.as=/\.mp4$/i.test(href)?'video':'image'; document.head.appendChild(l); });
    (window.requestIdleCallback||((fn)=>setTimeout(fn,900)))(prefetch);
  }
  function init(){ injectCss(); installViewport(); installPwa(); installObservers(); installTouchRepair(); enforceSingleScreen(); tuneMedia(); setTimeout(()=>{ enforceSingleScreen(); tuneMedia(); },600); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();
