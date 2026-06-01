
(function(){
  'use strict';
  const PB = window.POKEBATTLE || (window.POKEBATTLE = {});
  const esc = (s)=>String(s ?? '').replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const norm = (s)=>String(s||'').trim().toLowerCase();
  const LEGEND = new Set(['뮤츠','루기아','칠색조','그란돈','가이오가','레쿠쟈','디아루가','펄기아','기라티나','다크라이','쉐이미','아르세우스','레시라무','제크로무','게노세크트','원시그란돈','원시가이오가']);
  const REMOVE_NAMES = new Set(['스이쿤','엔테이','앤테이','라이코','파비꼬']);
  const IMAGE_MAP = {
    '뮤츠':'skin-sprites/mtz.png','루기아':'skin-sprites/rga.png','칠색조':'skin-sprites/csj.png','그란돈':'skin-sprites/grd.png','가이오가':'skin-sprites/gga.png','레쿠쟈':'skin-sprites/rkj.png','디아루가':'skin-sprites/drg.png','펄기아':'skin-sprites/pga.png','쉐이미':'skin-sprites/shm.png','아르세우스':'skin-sprites/arc.png','레시라무':'skin-sprites/rsrm.png','제크로무':'skin-sprites/jcr.png','게노세크트':'skin-sprites/gnc.png','원시그란돈':'skin-sprites/grd.png','원시가이오가':'skin-sprites/gga.png',
    '흥나숭':'media-videos/Grookey.mp4','채키몽':'media-videos/Thwackey.mp4','고릴타':'media-videos/Rillaboom.mp4','염버니':'media-videos/Scorbunny.mp4','래비풋':'media-videos/Raboot.mp4','에이스번':'media-videos/Cinderace.mp4','울머기':'media-videos/Sobble.mp4','누겔레온':'media-videos/Drizzile.mp4','인텔리레온':'media-videos/Inteleon.mp4','인텔라레온':'media-videos/Inteleon.mp4',
    '깨비참':'finish-sprites/Spearow.png','라이츄':'finish-sprites/Raichu.png','모래두지':'finish-sprites/Sandshrew.png','고지':'finish-sprites/Sandslash.png','니드퀸':'finish-sprites/Nidoqueen.png','니드런♂':'finish-sprites/Nidoran.png','니드킹':'finish-sprites/Nidoking.png','액스라이즈':'finish-sprites/Haxorus.png','삼삼드래':'finish-sprites/Hydreigon.png','파비코리':'finish-sprites/Altaria.png','빈티나':'finish-sprites/Feebas.png','루카리오':'finish-sprites/Lucario.png','마기라스':'finish-sprites/Tyranitar.png','포푸니':'finish-sprites/Sneasel.png','포푸니라':'skin-sprites/ppnr.png','골뱃':'finish-sprites/Golbat.png','전룡':'finish-sprites/Ampharos.png','루나톤':'finish-sprites/Lunatone.png','꽁어름':'finish-sprites/Bergmite.png','코일':'finish-sprites/Magnemite.png','레어코일':'finish-sprites/Magneton.png','자포코일':'skin2-sprites/magnezone.png','자폭코일':'skin2-sprites/magnezone.png','불비달마':'finish-sprites/Darmanitan.png','팽도리':'finish-sprites/Piplup.png','팽태자':'finish-sprites/Prinplup.png','엠페르트':'finish-sprites/Empoleon.png','갸라도스':'finish-sprites/Gyarados.png',
    '캐터피':'finish-sprites/Caterpie.png','버터플':'finish-sprites/Butterfree.png','이상해씨':'starter-sprites/Bulbasaur.png','이상해풀':'starter-sprites/Ivysaur.png','이상해꽃':'starter-sprites/Venusaur.png','파이리':'starter-sprites/Charmander.png','리자드':'starter-sprites/Charmeleon.png','리자몽':'starter-sprites/Charizard.png','꼬부기':'starter-sprites/Squirtle.png','어니부기':'starter-sprites/Wartortle.png','거북왕':'starter-sprites/Blastoise.png'
  };
  const VIDEO_POSTER = {
    '흥나숭':'starter-sprites/Grookey.png','채키몽':'starter-sprites/Thwackey.png','고릴타':'starter-sprites/Rillaboom.png','염버니':'starter-sprites/Scorbunny.png','래비풋':'starter-sprites/Raboot.png','에이스번':'starter-sprites/Cinderace.png','울머기':'starter-sprites/Sobble.png','누겔레온':'starter-sprites/Drizzile.png','인텔리레온':'starter-sprites/Inteleon.png','인텔라레온':'starter-sprites/Inteleon.png'
  };
  function core(){ return PB.core; }
  function ui(){ return PB.ui; }
  function activePlayer(){ return core()?.getActivePlayer?.(); }
  function applyPokemonDataPatch(){
    const c=core(); if(!c?.state?.allPokemon) return false;
    c.state.allPokemon = c.state.allPokemon.filter(p=>p && !REMOVE_NAMES.has(p.nameKo));
    c.state.allPokemon.forEach(p=>{
      if(p.nameKo==='자폭코일'){ p.nameKo='자포코일'; p.finalFormKo='자포코일'; }
      if(p.finalFormKo==='자폭코일') p.finalFormKo='자포코일';
      if(p.nameKo==='니드런♂') p.nameEn='Nidoran';
      const src=IMAGE_MAP[p.nameKo];
      if(src){ p.image=src; p.sprite=src; p.asset=src; p.media=src; }
      if(VIDEO_POSTER[p.nameKo]) p.poster = VIDEO_POSTER[p.nameKo];
    });
    c.state.pokemonById = new Map(c.state.allPokemon.map(p=>[Number(p.id),p]));
    Object.values(c.state.players||{}).forEach(pl=>{
      ['squad','reserve'].forEach(k=>{ pl[k]=(pl[k]||[]).filter(m=>!REMOVE_NAMES.has(m?.currentName||m?.name||m?.base?.nameKo)); pl[k].forEach(m=>{
        if(m.currentName==='자폭코일') m.currentName='자포코일'; if(m.name==='자폭코일') m.name='자포코일'; if(m.base?.nameKo==='자폭코일') m.base.nameKo='자포코일'; if(m.base?.finalFormKo==='자폭코일') m.base.finalFormKo='자포코일';
        const base=c.state.allPokemon.find(p=>p.nameKo===(m.base?.nameKo||m.currentName||m.name)); if(base){ m.base=base; m.id=base.id; m.currentTypes=Array.isArray(base.type)?base.type.slice():m.currentTypes; }
      }); });
    });
    return true;
  }
  function patchShopPrices(){
    const c=core(); if(!c||c.__fix9ShopPatch) return; c.__fix9ShopPatch=true;
    const pricePatch=(item)=>{ const id=norm(item.id); const x={...item}; if(id==='rare_candy') x.price=200; if(id==='good_potion') x.price=100; if(id==='revive_shard') x.price=200; if(id==='mystery_egg') x.price=700; return x; };
    const oldCat=c.getShopCatalog; if(typeof oldCat==='function') c.getShopCatalog=function(){ return (oldCat.apply(this,arguments)||[]).filter(it=>!['mythic_fragment','artisan_knowledge'].includes(norm(it.id))).map(pricePatch); };
    const oldInv=c.getFriendlyShopInventory; if(typeof oldInv==='function') c.getFriendlyShopInventory=function(){ return (oldInv.apply(this,arguments)||[]).filter(it=>!['mythic_fragment','artisan_knowledge'].includes(norm(it.id))).map(pricePatch); };
  }
  function renderEndStats(payload){
    const c=core(); const stats=payload?.stats || PB.battleEngine?.getSnapshot?.()?.stats || window.__FIX9_LAST_END_STATS || {};
    window.__FIX9_LAST_END_STATS = stats; window.__FIX9_END_LOCK = true;
    if(c?.state) c.state.currentScreen='battle';
    const rows=Object.values(stats||{}).map(s=>`<tr><td>${esc(s.name||s.pokemonName||'포켓몬')}</td><td>${Number(s.damageDealt||0)}</td><td>${Number(s.survivedDamage??s.damageTaken??0)}</td></tr>`).join('') || '<tr><td colspan="3">통계 없음</td></tr>';
    const html=`<div class="fix9-endstats"><h3>배틀 통계</h3><table><thead><tr><th>포켓몬</th><th>딜량</th><th>버틴피해</th></tr></thead><tbody>${rows}</tbody></table><button type="button" class="action-button fix9-exit-lobby" data-fix9-exit-lobby="1"><span class="action-title">나가기</span><span class="action-sub">로비로 돌아갑니다.</span></button></div>`;
    const grid=document.getElementById('battle-action-grid'); if(grid) grid.innerHTML=html; else ui()?.openModal?.('배틀 통계', html);
    const log=document.getElementById('battle-log'); if(log) log.textContent='배틀이 종료되었습니다. 통계를 확인한 뒤 나가기를 눌러주세요.';
  }
  function exitLobby(){ window.__FIX9_END_LOCK=false; window.__FIX9_LAST_END_STATS=null; if(core()?.state){ core().state.currentScreen='lobby'; core().state.currentCategory='squad'; } ui()?.closeModal?.(); ui()?.renderAll?.(); ui()?.syncBgmForScreen?.(); }
  function patchRenderAll(){ const u=ui(); if(!u||u.__fix9RenderPatch) return; u.__fix9RenderPatch=true; const old=u.renderAll; u.renderAll=function(){ if(window.__FIX9_END_LOCK && core()?.state) core().state.currentScreen='battle'; const r=old.apply(this,arguments); if(window.__FIX9_END_LOCK) setTimeout(()=>renderEndStats({stats:window.__FIX9_LAST_END_STATS||{}}),0); return r; }; u.showBattleEndStats=renderEndStats; }
  function insertSettingsDelete(){
    const grid=document.querySelector('.settings-grid,.settings-modal .modal-body,.modal-body'); if(!grid) return;
    // Hide older duplicate delete sections/buttons to keep one visible button.
    grid.querySelectorAll('[data-delete-character-v3],[data-delete-character-v4],[data-delete-character-final]').forEach(b=>{ const sec=b.closest('.settings-section')||b; if(!sec.dataset.fix9Keep) sec.style.display='none'; });
    if(!grid.querySelector('[data-fix9-delete-character]')){
      grid.insertAdjacentHTML('beforeend',`<section class="settings-section fix9-delete-character" data-fix9-keep="1"><h3>캐릭터 삭제</h3><p>현재 플레이 중인 캐릭터만 삭제합니다. 10번 눌러야 확정됩니다.</p><button type="button" class="settings-choice danger" data-fix9-delete-character="1" data-count="0">캐릭터 삭제 0/10</button></section>`);
    }
  }
  async function deleteCurrentChar(){
    const c=core(), o=PB.online; const slot=o?.currentSlot || window.PB_ONLINE_V3?.getCurrentSlot?.() || 'char1';
    try { await window.PB_ONLINE_V3?.deleteCurrentCharacter?.(); return; } catch(e){ console.warn('fix9 delete fallback', e); }
    try { if(o?.characters) delete o.characters[slot]; if(c?.state?.players?.p1){ c.state.players.p1.squad=[]; c.state.players.p1.reserve=[]; } ui()?.closeModal?.(); ui()?.renderAll?.(); } catch(e){}
  }
  function decorateImages(){
    document.querySelectorAll('video').forEach(v=>{ v.setAttribute('loop',''); v.loop=true; v.muted=true; v.playsInline=true; if(!v.dataset.fix9Played){ v.dataset.fix9Played='1'; try{ v.play?.().catch(()=>{}); }catch(e){} } });
    document.querySelectorAll('img').forEach(img=>{
      const alt=img.getAttribute('alt')||''; const src=img.getAttribute('src')||'';
      if(src.endsWith('.mp4')){
        if(LEGEND.has(alt)){ const poster=IMAGE_MAP[alt]||VIDEO_POSTER[alt]||''; if(poster && poster!==src) img.src=poster; }
        else { const video=document.createElement('video'); video.src=src; video.autoplay=true; video.muted=true; video.loop=true; video.playsInline=true; video.setAttribute('playsinline',''); video.setAttribute('webkit-playsinline',''); video.preload='auto'; video.className=img.className; video.style.cssText=img.style.cssText; img.replaceWith(video); try{video.play().catch(()=>{});}catch(e){} }
      }
    });
  }
  function decoratePlayers(){
    document.querySelectorAll('.p2-player-row').forEach(row=>{
      if(!row.querySelector('.fix9-player-character')){
        const img=(PB.online?.currentCharacter?.avatar||PB.online?.currentCharacter?.hair||'hair1.png');
        const mini=row.querySelector('.p2-mini');
        if(mini){ mini.insertAdjacentHTML('beforebegin',`<span class="fix9-player-character"><img src="${esc(img)}" alt="캐릭터"></span>`); }
      }
    });
  }
  function decorate(){
    applyPokemonDataPatch(); patchShopPrices(); patchRenderAll(); insertSettingsDelete(); decorateImages(); decoratePlayers();
    // Remove the old shop info card, fix shop/lobby backgrounds, and preserve transparency.
    document.querySelectorAll('.shop-tip-card').forEach(el=>el.remove());
    document.querySelectorAll('.shop-modal').forEach(el=>{ el.style.backgroundImage="linear-gradient(180deg,rgba(0,0,0,.16),rgba(0,0,0,.32)),url('shop.png')"; el.style.backgroundSize='contain'; el.style.backgroundPosition='center top'; el.style.backgroundRepeat='no-repeat'; el.style.backgroundColor='#07111f'; });
    document.querySelectorAll('.fix9-endstats,.fix9-endstats *').forEach(el=>{ el.style.setProperty('color','#050505','important'); el.style.setProperty('-webkit-text-fill-color','#050505','important'); });
    document.querySelectorAll('.battle-mon.fainting').forEach(el=>{ el.style.animationDuration='.55s'; });
    document.querySelectorAll('.online-market-row,.p2-card').forEach(card=>{ if(/파비꼬|라이코|엔테이|스이쿤/.test(card.textContent||'')) card.style.display='none'; });
  }
  function injectCss(){ if(document.getElementById('fix9-css')) return; const st=document.createElement('style'); st.id='fix9-css'; st.textContent=`
    #lobby-screen,.lobby-screen{background:linear-gradient(180deg,rgba(2,8,14,.10),rgba(2,8,14,.22)),url('pokebackground.png') center top/cover no-repeat!important;}
    #lobby-screen .top-shell,#lobby-screen .bottom-nav,#lobby-screen .panel-card,#lobby-screen .placeholder-card,#lobby-screen .pokemon-card,#lobby-screen .p2-card,#lobby-screen .p2-panel{background:rgba(5,13,25,.42)!important;border-color:rgba(126,207,255,.24)!important;backdrop-filter:blur(8px)!important;}
    .shop-modal{background:linear-gradient(180deg,rgba(0,0,0,.16),rgba(0,0,0,.32)),url('shop.png') center top/contain no-repeat!important;background-color:#07111f!important;color:#fff!important;}
    .shop-modal .modal-header,.shop-modal .modal-body,.shop-modal .shop-item-card{background:rgba(4,12,20,.36)!important;color:#fff!important;border-color:rgba(255,255,255,.18)!important;backdrop-filter:blur(7px)!important;}
    .shop-modal .shop-item-card h3,.shop-modal .shop-item-card p,.shop-modal .shop-item-card span:not(.shop-price):not(.mini-badge){color:#fff!important;-webkit-text-fill-color:#fff!important;}
    .shop-tip-card{display:none!important;}
    .shop-price,.shop-modal .mini-badge.shop-price{background:#ffd84f!important;color:#06101f!important;-webkit-text-fill-color:#06101f!important;border-radius:999px!important;padding:4px 10px!important;font-weight:1000!important;}
    .fix9-endstats{background:#f7fbff!important;color:#050505!important;border:2px solid #111!important;border-radius:18px!important;padding:14px!important;box-shadow:0 10px 30px rgba(0,0,0,.22)!important;}
    .fix9-endstats *{color:#050505!important;-webkit-text-fill-color:#050505!important;}.fix9-endstats table{width:100%;border-collapse:collapse;background:#fff!important}.fix9-endstats th,.fix9-endstats td{border:1px solid rgba(0,0,0,.25);padding:6px;text-align:center}.fix9-endstats .action-button{background:#111!important;color:#fff!important;-webkit-text-fill-color:#fff!important}.fix9-endstats .action-button *{color:#fff!important;-webkit-text-fill-color:#fff!important}
    .fix9-player-character{display:inline-flex;width:42px;height:42px;border-radius:50%;overflow:hidden;border:2px solid rgba(255,216,79,.75);background:rgba(255,255,255,.18);margin-right:6px;vertical-align:middle;flex:0 0 auto}.fix9-player-character img{width:100%;height:100%;object-fit:cover;}
    @keyframes faintOut{0%{opacity:1;transform:translateY(0);clip-path:inset(0 0 0 0)}70%{opacity:.5;transform:translateY(14px);clip-path:inset(0 0 70% 0)}100%{opacity:0;transform:translateY(22px);clip-path:inset(0 0 100% 0)}}.battle-mon.fainting{animation-duration:.55s!important;}
  `; document.head.appendChild(st); }
  document.addEventListener('click', async function(e){
    if(e.target.closest('[data-fix9-exit-lobby],.fix9-exit-lobby')){ e.preventDefault(); e.stopImmediatePropagation(); exitLobby(); return; }
    const del=e.target.closest('[data-fix9-delete-character]'); if(del){ e.preventDefault(); e.stopImmediatePropagation(); const n=Number(del.dataset.count||0)+1; del.dataset.count=n; del.textContent=`캐릭터 삭제 ${n}/10`; if(n>=10){ await deleteCurrentChar(); } return; }
  }, true);
  function init(){ injectCss(); applyPokemonDataPatch(); patchShopPrices(); patchRenderAll(); decorate(); }
  init(); setInterval(decorate,700);
})();
