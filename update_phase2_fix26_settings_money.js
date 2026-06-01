(function(){
  'use strict';
  const PB = window.POKEBATTLE || (window.POKEBATTLE = {});
  const F26 = PB.fix26SettingsMoney = PB.fix26SettingsMoney || {patched:false, zeroStarterSlot:null, zeroStarterUntil:0, cleanedAt:0};
  const now = () => Date.now();
  function online(){ return window.PB_ONLINE_V3?.getOnlineState?.() || PB.online || {}; }
  function core(){ return PB.core; }
  function ui(){ return PB.ui; }
  function db(){ return online().db || null; }
  function uid(){ return online().uid || ''; }
  function slot(){ return online().selectedSlot || 'char1'; }
  function toast(msg){ try{ ui()?.showToast?.(msg); }catch(e){} }
  function deep(v){ try{ return JSON.parse(JSON.stringify(v)); }catch(e){ return v; } }
  function finite(n,f=0){ n=Number(n); return Number.isFinite(n)?n:f; }
  function selectedCharacter(){ return online().selectedCharacter || null; }
  function hasSavedTeam(ch){ return !!(ch?.player && (((ch.player.squad||[]).length>0) || ((ch.player.reserve||[]).length>0))); }
  function isFreshCharacter(ch=selectedCharacter()){
    return !!(ch && (ch.__freshCharacter === true || ch.__needsStarter === true || !hasSavedTeam(ch)));
  }
  function currentPlayer(){ return core()?.getPlayer?.('p1') || core()?.state?.players?.p1 || null; }
  function currentPlayerHasTeam(){ const p=currentPlayer(); return !!(p && (((p.squad||[]).length>0) || ((p.reserve||[]).length>0))); }
  function compactPlayerZero(player){
    if(!player) return null;
    const mon = (p)=> p?.base ? {
      baseId:Number(p.base.id || p.id || 0), level:finite(p.level,5), currentHp:finite(p.currentHp ?? p.maxHp,1),
      candyUsed:finite(p.candyUsed,0), enhanceLevel:finite(p.enhanceLevel,0), preventEvolution:Boolean(p.preventEvolution),
      heldItems:deep(p.heldItems || []), koCount:finite(p.koCount,0), koStars:finite(p.koStars,0), totalExp:finite(p.totalExp,0),
      bloodline:p.bloodline || null, competitiveDamageDealt:finite(p.competitiveDamageDealt || p.damageDealt,0),
      competitiveDamageTaken:finite(p.competitiveDamageTaken || p.damageTaken,0), isShiny:Boolean(p.isShiny), shinyKey:p.shinyKey || null,
      moves:(p.moves || []).slice(0,4).map(m=>({...m}))
    } : null;
    return { id:'p1', name:player.name || selectedCharacter()?.name || '트레이너', money:0, bag:deep(player.bag || {holdables:[],consumables:[]}), squad:(player.squad||[]).map(mon).filter(Boolean), reserve:(player.reserve||[]).map(mon).filter(Boolean), ownerSlot:slot(), ownerCharacterName:selectedCharacter()?.name || '' };
  }
  function forceNewCharacterMoneyZero(reason){
    const c=core(), p=currentPlayer(), o=online(), ch=selectedCharacter(), s=o.selectedSlot || slot();
    if(!p || !ch) return false;
    p.money = 0;
    if(ch.player) ch.player.money = 0;
    if(currentPlayerHasTeam()) ch.player = compactPlayerZero(p);
    ch.updatedAt = now();
    o.characters = o.characters || {}; o.characters[s] = ch;
    o.localStore = o.localStore || {}; o.localStore.characters = o.localStore.characters || {}; o.localStore.characters[s] = ch;
    try{ localStorage.setItem('pokebattle-online-expansion-v1', JSON.stringify(o.localStore || {})); }catch(e){}
    if(db() && uid()){
      try{
        db().ref(`characters/${uid()}/${s}`).update({player:ch.player || null, updatedAt:ch.updatedAt, __freshCharacter:ch.__freshCharacter || false, __needsStarter:ch.__needsStarter || false}).catch(()=>{});
        if(ch.player) db().ref(`saves/${uid()}/${s}`).set(ch.player).catch(()=>{});
      }catch(e){ console.warn('fix26 money zero db sync failed', e); }
    }
    if(reason) console.info('[fix26] new character initial money fixed to 0:', reason);
    return true;
  }
  function patchStarterMoney(){
    const c=core(); if(!c) return;
    if(!c.__fix26StartGameMoney && typeof c.startGame==='function'){
      c.__fix26StartGameMoney=true;
      const old=c.startGame;
      c.startGame=function(mode){
        const ch=selectedCharacter(); const fresh=isFreshCharacter(ch);
        if(fresh){ F26.zeroStarterSlot=slot(); F26.zeroStarterUntil=now()+10*60*1000; }
        const res=old.apply(this, arguments);
        if(fresh) setTimeout(()=>forceNewCharacterMoneyZero('starter draft'),0);
        return res;
      };
    }
    if(!c.__fix26FinalizeMoney && typeof c.finalizeStarterDraft==='function'){
      c.__fix26FinalizeMoney=true;
      const old=c.finalizeStarterDraft;
      c.finalizeStarterDraft=function(){
        const ch=selectedCharacter();
        const freshBefore=isFreshCharacter(ch) || (F26.zeroStarterSlot && F26.zeroStarterSlot===slot() && now()<F26.zeroStarterUntil);
        const res=old.apply(this, arguments);
        if(freshBefore && res!==false){
          F26.zeroStarterSlot=slot(); F26.zeroStarterUntil=now()+2*60*1000;
          setTimeout(()=>forceNewCharacterMoneyZero('starter finalized'),0);
          setTimeout(()=>forceNewCharacterMoneyZero('starter finalized delayed'),180);
          setTimeout(()=>forceNewCharacterMoneyZero('starter finalized save race guard'),650);
        }
        return res;
      };
    }
    const api=window.PB_ONLINE_V3;
    if(api && !api.__fix26SaveMoney && typeof api.saveCharacter==='function'){
      api.__fix26SaveMoney=true;
      const old=api.saveCharacter;
      api.saveCharacter=async function(s=slot()){
        const ch=selectedCharacter();
        const freshOrJustDone = isFreshCharacter(ch) || (F26.zeroStarterSlot && F26.zeroStarterSlot===(s || slot()) && now()<F26.zeroStarterUntil);
        if(freshOrJustDone){
          const p=currentPlayer();
          if(p) p.money=0;
          if(ch?.player) ch.player.money=0;
        }
        const res=await old.apply(this, arguments);
        if(freshOrJustDone) forceNewCharacterMoneyZero('saveCharacter guard');
        return res;
      };
    }
  }

  const DELETE_SELECTORS = [
    '[data-delete-character-v3]','[data-delete-character-v4]','[data-delete-character-v12]','[data-delete-character-final]','[data-delete-character-fix15]','[data-fix9-delete-character]',
    '.delete-character-section-v3','.delete-character-section-v4','.delete-character-section-v12','.delete-character-section-final','.delete-character-section-fix15','.fix9-delete-character'
  ].join(',');
  function isSettingsContext(node){
    const modal = node?.closest?.('.modal,.overlay,#modal-root') || document.getElementById('modal-root');
    if(!modal) return false;
    if(modal.querySelector?.('#settings-title,.settings-grid,[data-setting-key],[data-bgm-preview]')) return true;
    const text=(modal.textContent||'').slice(0,500);
    return /설정|환경설정|효과음|배경음악/.test(text) && !!modal.querySelector?.('.settings-section,.settings-choice');
  }
  function removeDuplicateDeleteSections(settingsRoot){
    if(!settingsRoot) return;
    const nodes=[...settingsRoot.querySelectorAll(DELETE_SELECTORS)];
    const sections=[];
    nodes.forEach(n=>{ const sec=n.closest?.('section') || n; if(sec && !sections.includes(sec)) sections.push(sec); });
    let kept=false;
    sections.forEach(sec=>{
      if(!isSettingsContext(sec)){ sec.remove(); return; }
      const hasDelete=/캐릭터\s*삭제/.test(sec.textContent||'') || sec.querySelector?.('[data-delete-character-v3],[data-delete-character-v4],[data-delete-character-v12],[data-delete-character-final],[data-delete-character-fix15],[data-fix9-delete-character]');
      if(!hasDelete) return;
      if(kept){ sec.remove(); return; }
      kept=true;
      sec.classList.add('fix26-settings-delete-only');
    });
  }
  function cleanupDeleteMenus(){
    const root=document.getElementById('modal-root');
    if(!root) return;
    const nodes=[...root.querySelectorAll(DELETE_SELECTORS)];
    nodes.forEach(n=>{
      const sec=n.closest?.('section') || n;
      if(!isSettingsContext(sec)) sec.remove();
    });
    const settingsGrid=root.querySelector('.settings-grid') || root.querySelector('.modal-body') || root;
    removeDuplicateDeleteSections(settingsGrid);
    F26.cleanedAt=now();
  }
  function patchSettingsRender(){
    if(PB.ui && !PB.ui.__fix26SettingsRender){
      PB.ui.__fix26SettingsRender=true;
      const oldOpen=PB.ui.openSettingsModal;
      if(typeof oldOpen==='function') PB.ui.openSettingsModal=function(){ const res=oldOpen.apply(this,arguments); setTimeout(cleanupDeleteMenus,0); setTimeout(cleanupDeleteMenus,120); return res; };
      const oldRender=PB.ui.renderSettingsModal;
      if(typeof oldRender==='function') PB.ui.renderSettingsModal=function(){ const res=oldRender.apply(this,arguments); setTimeout(cleanupDeleteMenus,0); setTimeout(cleanupDeleteMenus,120); return res; };
      const oldModal=PB.ui.openModal;
      if(typeof oldModal==='function') PB.ui.openModal=function(){ const res=oldModal.apply(this,arguments); setTimeout(cleanupDeleteMenus,0); return res; };
    }
  }
  function css(){
    if(document.getElementById('fix26-style')) return;
    const st=document.createElement('style'); st.id='fix26-style'; st.textContent=`
      #modal-root .modal:not(:has(#settings-title)):not(:has(.settings-grid)):not(:has([data-setting-key])) [data-delete-character-v3],
      #modal-root .modal:not(:has(#settings-title)):not(:has(.settings-grid)):not(:has([data-setting-key])) [data-delete-character-v4],
      #modal-root .modal:not(:has(#settings-title)):not(:has(.settings-grid)):not(:has([data-setting-key])) [data-delete-character-v12],
      #modal-root .modal:not(:has(#settings-title)):not(:has(.settings-grid)):not(:has([data-setting-key])) [data-delete-character-final],
      #modal-root .modal:not(:has(#settings-title)):not(:has(.settings-grid)):not(:has([data-setting-key])) [data-delete-character-fix15],
      #modal-root .modal:not(:has(#settings-title)):not(:has(.settings-grid)):not(:has([data-setting-key])) [data-fix9-delete-character],
      #modal-root .modal:not(:has(#settings-title)):not(:has(.settings-grid)):not(:has([data-setting-key])) .delete-character-section-v3,
      #modal-root .modal:not(:has(#settings-title)):not(:has(.settings-grid)):not(:has([data-setting-key])) .delete-character-section-v4,
      #modal-root .modal:not(:has(#settings-title)):not(:has(.settings-grid)):not(:has([data-setting-key])) .delete-character-section-v12,
      #modal-root .modal:not(:has(#settings-title)):not(:has(.settings-grid)):not(:has([data-setting-key])) .delete-character-section-final,
      #modal-root .modal:not(:has(#settings-title)):not(:has(.settings-grid)):not(:has([data-setting-key])) .delete-character-section-fix15,
      #modal-root .modal:not(:has(#settings-title)):not(:has(.settings-grid)):not(:has([data-setting-key])) .fix9-delete-character{display:none!important;pointer-events:none!important;}
      .fix26-settings-delete-only{margin-top:12px!important;}
    `; document.head.appendChild(st);
  }
  function observe(){
    if(F26.observer) return;
    const root=document.getElementById('modal-root') || document.body;
    F26.observer=new MutationObserver(()=>{ clearTimeout(F26.cleanupTimer); F26.cleanupTimer=setTimeout(cleanupDeleteMenus,20); });
    F26.observer.observe(root,{childList:true,subtree:true});
  }
  function init(){
    css(); patchStarterMoney(); patchSettingsRender(); observe(); cleanupDeleteMenus();
    setInterval(()=>{ patchStarterMoney(); patchSettingsRender(); cleanupDeleteMenus(); }, 800);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', ()=>setTimeout(init,760), {once:true}); else setTimeout(init,760);
})();
