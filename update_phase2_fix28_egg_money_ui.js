(function(){
  'use strict';
  const PB = window.POKEBATTLE || (window.POKEBATTLE = {});
  const F28 = PB.fix28EggMoneyUi = PB.fix28EggMoneyUi || {patched:false,audio:null,timers:[]};
  const GIF_DELAY_MS = 1000;
  const GIF_DURATION_MS = 5760;
  const RESULT_DELAY_MS = GIF_DELAY_MS + GIF_DURATION_MS;
  const EGG_GIF = 'egg_hatching.gif';
  const EGG_MP3 = 'egg_hatching.mp3';
  const STATS = ['hp','attack','defense','spAttack','spDefense','speed'];

  function core(){ return PB.core; }
  function ui(){ return PB.ui; }
  function online(){ return window.PB_ONLINE_V3; }
  function esc(v){ return String(v ?? '').replace(/[&<>'"]/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m])); }
  function playerId(){ return core()?.state?.activePlayerId || 'p1'; }
  function modalRoot(){
    let root = document.getElementById('modal-root');
    if(!root){ root = document.createElement('div'); root.id = 'modal-root'; document.body.appendChild(root); }
    return root;
  }
  function clearTimers(){ F28.timers.forEach(t=>{ try{ clearTimeout(t); }catch(_){} }); F28.timers=[]; }
  function stopAudio(){
    try{ if(F28.audio){ F28.audio.pause(); F28.audio.currentTime = 0; } }catch(_){}
    F28.audio = null;
  }
  function playHatchAudio(){
    stopAudio();
    try{
      const audio = new Audio(EGG_MP3 + '?fix28=' + Date.now());
      audio.loop = false;
      audio.preload = 'auto';
      audio.volume = 1;
      F28.audio = audio;
      const p = audio.play();
      if(p && p.catch) p.catch(()=>{});
      return audio;
    }catch(e){
      try{ ui()?.playEffectSound?.(EGG_MP3); }catch(_){}
      return null;
    }
  }
  function getBase(entry){ return entry?.basePokemon || entry?.base || core()?.state?.pokemonById?.get?.(Number(entry?.runtimePokemon?.baseId || entry?.baseId || entry?.id)); }
  function statTotal(base){
    const s = base?.speciesStats || base?.stats || base?.baseStats || {};
    const total = STATS.reduce((sum,k)=>sum + Number(s[k] || 0),0);
    return Number.isFinite(total) ? total : 0;
  }
  function resultList(result){
    const list = Array.isArray(result?.allHatched) && result.allHatched.length ? result.allHatched : [{basePokemon:result?.basePokemon, runtimePokemon:result?.runtimePokemon}];
    return list.map(entry => ({...entry, basePokemon:getBase(entry)}));
  }
  function auraClass(result){
    const max = Math.max(0, ...resultList(result).map(e=>statTotal(e.basePokemon)));
    if(max >= 540) return 'f28-aura-red';
    if(max >= 390) return 'f28-aura-blue';
    return '';
  }
  function titleColor(result){
    const first = resultList(result)[0]?.basePokemon || result?.basePokemon;
    return first?.colors?.primary || first?.primaryColor || '#10512c';
  }
  function avatar(base,size=128){
    if(ui()?.renderAvatar) return ui().renderAvatar(base, String(size));
    const src = base?.image || base?.sprite || base?.asset || base?.spriteUrl || '';
    const name = base?.nameKo || '포켓몬';
    if(src) return `<img src="${esc(src)}" alt="${esc(name)}" style="width:${Number(size)||128}px;height:${Number(size)||128}px;object-fit:contain;filter:drop-shadow(0 8px 18px rgba(0,0,0,.24));">`;
    return `<div style="width:${Number(size)||128}px;height:${Number(size)||128}px;border-radius:999px;display:grid;place-items:center;background:rgba(255,255,255,.35);font-weight:1000;color:#123;">${esc(name.slice(0,1))}</div>`;
  }
  function closeToLobby(){
    clearTimers();
    stopAudio();
    const root = modalRoot();
    root.innerHTML = '';
    try{ if(PB.uiState) PB.uiState.activeModal = null; }catch(_){}
    try{ core()?.returnToLobby?.(); }catch(_){}
    try{ ui()?.renderAll?.(); }catch(_){}
  }
  function showResult(result){
    stopAudio();
    const root = modalRoot();
    const list = resultList(result);
    const color = titleColor(result);
    root.innerHTML = `
      <div class="f28-egg-overlay" id="f28-egg-overlay">
        <div class="f28-egg-result-modal" role="dialog" aria-modal="true" aria-labelledby="f28-egg-title">
          <div class="f28-egg-result-scene">
            <div class="f28-egg-result-inner">
              <div class="f28-egg-title" id="f28-egg-title" style="color:${esc(color)};">${list.length>1?'알 부화 결과':esc(list[0]?.basePokemon?.nameKo || list[0]?.runtimePokemon?.currentName || '포켓몬')}</div>
              <div class="f28-egg-list">${list.map(entry=>`<div class="f28-egg-mon"><div class="f28-egg-sprite">${avatar(entry.basePokemon,128)}</div><div class="f28-egg-name">${esc(entry.basePokemon?.nameKo || entry.runtimePokemon?.currentName || '포켓몬')}</div><div class="f28-egg-total">종족값 ${statTotal(entry.basePokemon)}</div></div>`).join('')}</div>
              <button type="button" class="action-button f28-egg-confirm" data-f28-egg-close="1"><span class="action-title">확인</span><span class="action-sub">로비로 이동</span></button>
            </div>
          </div>
        </div>
      </div>`;
  }
  function showCutscene(result){
    const root = modalRoot();
    const aura = auraClass(result);
    root.innerHTML = `
      <div class="f28-egg-overlay" id="f28-egg-overlay">
        <div class="f28-egg-modal" role="dialog" aria-modal="true" aria-label="알 부화">
          <div class="f28-egg-cutscene">
            <div class="f28-egg-gif-wrap ${esc(aura)}">
              <img src="${EGG_GIF}?fix28=${Date.now()}" alt="egg hatching" class="f28-egg-gif">
            </div>
            <div class="f28-egg-caption">알 부화 중...</div>
          </div>
        </div>
      </div>`;
  }
  function showPreparing(){
    const root = modalRoot();
    root.innerHTML = `
      <div class="f28-egg-overlay" id="f28-egg-overlay">
        <div class="f28-egg-modal f28-egg-wait-modal" role="dialog" aria-modal="true" aria-label="알 부화 준비">
          <div class="f28-egg-wait-scene">
            <div class="f28-egg-pulse">알이 흔들리고 있다...</div>
            <div class="f28-egg-wait-copy">잠시 후 부화 장면이 시작됩니다.</div>
          </div>
        </div>
      </div>`;
  }
  function openEggHatchSequence(result){
    if(!result?.ok) return false;
    clearTimers();
    stopAudio();
    try{ if(PB.uiState) PB.uiState.activeModal = 'egg-hatch'; }catch(_){}
    playHatchAudio();
    showPreparing();
    F28.timers.push(setTimeout(()=>showCutscene(result), GIF_DELAY_MS));
    F28.timers.push(setTimeout(()=>showResult(result), RESULT_DELAY_MS));
    return true;
  }
  function handleHatchClick(e){
    const btn = e.target?.closest?.('[data-hatch-egg]');
    if(!btn) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    const result = core()?.hatchEgg?.(playerId(), btn.dataset.hatchEgg);
    if(!result?.ok){ ui()?.showToast?.(result?.message || '부화할 수 없습니다.'); return; }
    openEggHatchSequence(result);
    try{ online()?.saveCharacter?.(); }catch(_){}
  }
  function handleCloseClick(e){
    const btn = e.target?.closest?.('[data-f28-egg-close]');
    if(!btn) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    closeToLobby();
  }
  function patchUiModal(){
    const u = ui();
    if(!u || u.__fix28EggModal) return;
    u.__fix28EggModal = true;
    const old = u.openEggHatchModal;
    u.openEggHatchModal = function(result){
      if(result?.ok !== false && (result?.basePokemon || result?.runtimePokemon || Array.isArray(result?.allHatched))){
        return openEggHatchSequence(result);
      }
      return old ? old.apply(this, arguments) : undefined;
    };
  }
  function injectStyle(){
    if(document.getElementById('fix28-egg-money-style')) return;
    const s = document.createElement('style');
    s.id = 'fix28-egg-money-style';
    s.textContent = `
      #fix12-money-badge{left:50%!important;right:auto!important;top:calc(8px + env(safe-area-inset-top,0px))!important;transform:translateX(-50%)!important;z-index:70!important;max-width:88vw!important;text-align:center!important;white-space:nowrap!important;}
      .f28-egg-overlay{position:fixed;inset:0;z-index:10080;background:rgba(0,0,0,.74);display:flex;align-items:center;justify-content:center;padding:16px;overscroll-behavior:contain;touch-action:none;}
      .f28-egg-modal,.f28-egg-result-modal{width:min(92vw,430px);border-radius:28px;overflow:hidden;background:rgba(10,15,20,.96);border:1px solid rgba(255,255,255,.16);box-shadow:0 28px 80px rgba(0,0,0,.55);}
      .f28-egg-wait-scene{min-height:300px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;background:radial-gradient(circle at 50% 30%,rgba(255,255,255,.10),rgba(0,0,0,.28));padding:20px;text-align:center;}
      .f28-egg-pulse{font-size:20px;font-weight:1000;color:#f9fff4;animation:f28EggPulse .7s ease-in-out infinite alternate;text-shadow:0 2px 12px rgba(0,0,0,.35);}
      .f28-egg-wait-copy{font-size:12px;font-weight:800;color:#ccebd2;}
      @keyframes f28EggPulse{from{transform:scale(1);opacity:.72}to{transform:scale(1.045);opacity:1}}
      .f28-egg-cutscene{min-height:430px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:linear-gradient(180deg,#56d8ba 0%,#d8fff0 70%,#f7fff4 100%);padding:20px;}
      .f28-egg-gif-wrap{position:relative;display:flex;align-items:center;justify-content:center;border-radius:999px;padding:18px;}
      .f28-egg-gif-wrap::before{content:'';position:absolute;inset:-12px;border-radius:999px;opacity:0;filter:blur(14px);animation:f28AuraBreath 1.1s ease-in-out infinite alternate;}
      .f28-aura-blue::before{opacity:1;background:radial-gradient(circle,rgba(66,172,255,.85),rgba(66,172,255,.34) 44%,transparent 72%);box-shadow:0 0 34px rgba(45,152,255,.84),0 0 80px rgba(64,186,255,.38);}
      .f28-aura-red::before{opacity:1;background:radial-gradient(circle,rgba(255,67,57,.88),rgba(255,102,40,.38) 44%,transparent 72%);box-shadow:0 0 38px rgba(255,58,44,.88),0 0 92px rgba(255,120,42,.42);}
      @keyframes f28AuraBreath{from{transform:scale(.94);opacity:.68}to{transform:scale(1.08);opacity:1}}
      .f28-egg-gif{position:relative;z-index:1;width:min(78vw,300px);height:auto;display:block;image-rendering:auto;filter:drop-shadow(0 12px 22px rgba(0,0,0,.20));}
      .f28-egg-caption{margin-top:12px;font-size:13px;font-weight:1000;color:#11362c;letter-spacing:.08em;text-shadow:0 1px 10px rgba(255,255,255,.44);}
      .f28-egg-result-scene{min-height:430px;display:flex;align-items:center;justify-content:center;background:linear-gradient(180deg,#24bf7d 0%,#8cf06c 55%,#ddffc2 100%);padding:20px;text-align:center;}
      .f28-egg-result-inner{width:100%;display:flex;flex-direction:column;align-items:center;gap:14px;}
      .f28-egg-title{font-size:26px;font-weight:1000;text-shadow:0 2px 12px rgba(255,255,255,.45),0 3px 18px rgba(0,0,0,.18);}
      .f28-egg-list{display:flex;gap:12px;flex-wrap:wrap;justify-content:center;align-items:flex-start;}
      .f28-egg-mon{min-width:116px;display:flex;flex-direction:column;align-items:center;gap:5px;}
      .f28-egg-sprite{min-height:132px;display:flex;align-items:center;justify-content:center;}
      .f28-egg-name{font-size:15px;font-weight:1000;color:#10331e;text-shadow:0 1px 10px rgba(255,255,255,.45);}
      .f28-egg-total{font-size:11px;font-weight:900;color:rgba(7,40,24,.70);}
      .f28-egg-confirm{max-width:260px;width:82%;}
    `;
    document.head.appendChild(s);
  }
  function preloadAssets(){
    try{ const img = new Image(); img.src = EGG_GIF; }catch(_){}
    try{ const audio = document.createElement('audio'); audio.preload='auto'; audio.src=EGG_MP3; }catch(_){}
  }
  function init(){
    if(!core() || !ui()){ setTimeout(init,120); return; }
    injectStyle(); preloadAssets(); patchUiModal();
    if(!F28.patched){
      F28.patched = true;
      window.addEventListener('click', handleHatchClick, true);
      window.addEventListener('click', handleCloseClick, true);
    }
    try{ const old = ui().renderAll; if(old && !old.__fix28Wrapped){ const wrapped = function(){ const r = old.apply(this, arguments); setTimeout(()=>{ injectStyle(); patchUiModal(); }, 20); return r; }; wrapped.__fix28Wrapped = true; ui().renderAll = wrapped; } }catch(_){}
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(init,160),{once:true}); else setTimeout(init,120);
})();
