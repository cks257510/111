(function(){
  'use strict';
  const PB = window.POKEBATTLE || (window.POKEBATTLE = {});
  const F25 = PB.fix25PvpWaitNewCharacter = PB.fix25PvpWaitNewCharacter || { patched:false, hideUntil:0, lastRoomSeq:0, lastRoomId:null, lastIndicatorText:'' };
  const HAIR_ASSETS = ['hair1.png','hair2.png','hair3.png','hair4.png'];
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
  function saveLocalStore(){ try{ const o=online(); localStorage.setItem('pokebattle-online-expansion-v1', JSON.stringify(o.localStore || {})); }catch(e){} }
  function sanitizeName(v, fallback){ return String(v || fallback || '트레이너').trim().slice(0,12) || String(fallback || '트레이너'); }
  function hasSavedTeam(ch){ return !!(ch?.player && (((ch.player.squad||[]).length>0) || ((ch.player.reserve||[]).length>0))); }
  function currentPlayerHasTeam(){ const p=core()?.getPlayer?.('p1'); return !!(p && (((p.squad||[]).length>0) || ((p.reserve||[]).length>0))); }
  function selectedCharacter(){ return online().selectedCharacter || null; }
  function isFreshCharacter(ch=selectedCharacter()){
    return !!(ch && (ch.__freshCharacter === true || ch.__needsStarter === true || (!hasSavedTeam(ch) && ch.createdAt && now()-finite(ch.createdAt,0)<24*60*60*1000)));
  }
  function compactPlayer(player){
    if(!player) return null;
    const mon = (p)=> p?.base ? {
      baseId:Number(p.base.id || p.id || 0), level:finite(p.level,5), currentHp:finite(p.currentHp ?? p.maxHp,1),
      candyUsed:finite(p.candyUsed,0), enhanceLevel:finite(p.enhanceLevel,0), preventEvolution:Boolean(p.preventEvolution),
      heldItems:deep(p.heldItems || []), koCount:finite(p.koCount,0), koStars:finite(p.koStars,0), totalExp:finite(p.totalExp,0),
      bloodline:p.bloodline || null, competitiveDamageDealt:finite(p.competitiveDamageDealt || p.damageDealt,0),
      competitiveDamageTaken:finite(p.competitiveDamageTaken || p.damageTaken,0), isShiny:Boolean(p.isShiny), shinyKey:p.shinyKey || null,
      moves:(p.moves || []).slice(0,4).map(m=>({...m}))
    } : null;
    return { id:'p1', name:player.name || '트레이너', money:finite(player.money,0), bag:deep(player.bag || {holdables:[],consumables:[]}), squad:(player.squad||[]).map(mon).filter(Boolean), reserve:(player.reserve||[]).map(mon).filter(Boolean), ownerSlot:slot(), ownerCharacterName:selectedCharacter()?.name || '' };
  }
  async function saveFreshProfileOnly(ch, s){
    const o=online(); if(!ch || !s) return false;
    const clean = {...ch, slot:s, player:null, __freshCharacter:true, __needsStarter:true, updatedAt:now()};
    o.characters = o.characters || {}; o.characters[s] = clean; o.selectedCharacter = clean;
    o.localStore = o.localStore || {}; o.localStore.characters = o.localStore.characters || {}; o.localStore.characters[s] = clean; saveLocalStore();
    if(db() && uid()){
      try{
        await db().ref(`characters/${uid()}/${s}`).set(clean);
        await db().ref(`saves/${uid()}/${s}`).remove().catch(()=>{});
      }catch(e){ console.warn('fix25 fresh profile save failed', e); }
    }
    return true;
  }
  async function createCharacterClean(s){
    const o=online(); if(!s) return;
    const input=document.getElementById('online-character-name');
    const name=sanitizeName(input?.value, s==='char2'?'캐릭터2':'캐릭터1');
    const ch={ slot:s, name, nickname:name, hair:o.selectedHair || HAIR_ASSETS[0], createdAt:now(), updatedAt:now(), competitive:{tier:'beginner',rank:3,points:0,promotionReady:false,wins:0,losses:0}, challenge:{badges:{},badgePoints:0,allClearRewarded:false}, titles:{owned:{},equipped:''}, player:null, __freshCharacter:true, __needsStarter:true };
    o.characters = o.characters || {}; o.characters[s]=ch;
    o.selectedSlot=s; o.selectedCharacter=ch; o.creatingSlot=null; o.selectedHair=ch.hair;
    o.localStore = o.localStore || {}; o.localStore.characters = o.localStore.characters || {}; o.localStore.characters[s]=ch; saveLocalStore();
    if(db() && uid()){
      try{
        await db().ref(`characters/${uid()}/${s}`).set(ch);
        await db().ref(`saves/${uid()}/${s}`).remove().catch(()=>{});
        await db().ref(`playerPublicList/${uid()}_${s}`).remove().catch(()=>{});
      }catch(e){ console.warn('fix25 create clean failed', e); }
    }
    try{ window.PB_ONLINE_V3?.renderAuthPanel?.(); }catch(e){}
    try{ ui()?.renderAll?.(); }catch(e){}
    toast('새 캐릭터 생성 완료');
  }
  async function startFreshCharacter(){
    const o=online(), ch=o.selectedCharacter; if(!ch) return false;
    if(!isFreshCharacter(ch) && hasSavedTeam(ch)) return false;
    ch.player = null; ch.__freshCharacter = true; ch.__needsStarter = true; o.characters[o.selectedSlot || slot()] = ch;
    await saveFreshProfileOnly(ch, o.selectedSlot || slot());
    try{
      if(core()?.state){
        core().state.players.p1 = core().createEmptyPlayer ? core().createEmptyPlayer('p1', ch.name || '레드') : {id:'p1',name:ch.name||'레드',money:0,squad:[],reserve:[],bag:{holdables:[],consumables:[]}};
        core().state.players.p2 = core().createEmptyPlayer ? core().createEmptyPlayer('p2', '그린') : {id:'p2',name:'그린',money:0,squad:[],reserve:[],bag:{holdables:[],consumables:[]}};
      }
    }catch(e){}
    PB.core?.startGame?.('single');
    return true;
  }
  function patchFreshCreateAndStart(){
    if(F25.createStartBound) return; F25.createStartBound=true;
    window.addEventListener('click', async (e)=>{
      const save=e.target?.closest?.('[data-character-save]');
      if(save){ e.preventDefault(); e.stopImmediatePropagation(); await createCharacterClean(save.dataset.characterSave); return; }
      const start=e.target?.closest?.('[data-start-mode="single"]');
      if(start && selectedCharacter() && !hasSavedTeam(selectedCharacter())){
        e.preventDefault(); e.stopImmediatePropagation(); await startFreshCharacter(); return;
      }
    }, true);
  }
  function patchSaveCharacterGuard(){
    const api=window.PB_ONLINE_V3; if(!api || api.__fix25SaveGuard || typeof api.saveCharacter!=='function') return;
    api.__fix25SaveGuard=true;
    const old=api.saveCharacter;
    api.saveCharacter=async function(s=slot()){
      const o=online(); const ch=o.selectedCharacter;
      const c=core(); const screen=c?.state?.currentScreen || '';
      const player=c?.getPlayer?.('p1');
      if(ch && isFreshCharacter(ch) && !(screen==='lobby' && currentPlayerHasTeam())){
        return saveFreshProfileOnly(ch, s || o.selectedSlot || slot());
      }
      if(ch && isFreshCharacter(ch) && screen==='lobby' && currentPlayerHasTeam()){
        ch.__freshCharacter=false; ch.__needsStarter=false; ch.player=compactPlayer(player);
        o.characters = o.characters || {}; o.characters[s || o.selectedSlot || slot()] = ch;
      }
      return old.apply(this, arguments);
    };
  }
  function patchFinalizeStarter(){
    const c=core(); if(!c || c.__fix25FinalizePatch || typeof c.finalizeStarterDraft!=='function') return;
    c.__fix25FinalizePatch=true;
    const old=c.finalizeStarterDraft;
    c.finalizeStarterDraft=function(){
      const wasFresh=isFreshCharacter();
      const res=old.apply(this, arguments);
      if(wasFresh && c.state?.currentScreen==='lobby' && currentPlayerHasTeam()){
        const o=online(), ch=o.selectedCharacter;
        if(ch){
          const p=c.getPlayer?.('p1'); if(p) p.name=ch.name || ch.nickname || p.name;
          ch.__freshCharacter=false; ch.__needsStarter=false; ch.player=compactPlayer(p); ch.updatedAt=now();
          o.characters = o.characters || {}; o.characters[o.selectedSlot || slot()] = ch;
          o.localStore = o.localStore || {}; o.localStore.characters = o.localStore.characters || {}; o.localStore.characters[o.selectedSlot || slot()] = ch; saveLocalStore();
          setTimeout(()=>window.PB_ONLINE_V3?.saveCharacter?.(o.selectedSlot || slot()), 120);
        }
      }
      return res;
    };
  }
  function isPvpActive(){ return !!(PB.phase2PvpV12?.active || PB.phase2FullPvpPatch?.active); }
  function pvpState(){ return PB.phase2PvpV12 || PB.phase2FullPvpPatch || {}; }
  function pvpRoom(){ return PB.phase2PvpV12?.room || PB.phase2FullPvpPatch?.room || null; }
  function pvpCompleted(){ const r=pvpRoom(); return !!(r && (/^(completed|cancelled|declined|abandoned|deleted)$/.test(String(r.status||'')) || r.pvpV12?.phase==='completed' || r.pvp2?.phase==='completed')); }
  function shouldShowWaiting(){
    if(!isPvpActive() || pvpCompleted()) return false;
    if(now() < F25.hideUntil) return false;
    return true;
  }
  function applyPvpWaitingIndicator(){
    const node=document.getElementById('battle-turn-indicator'); if(!node) return;
    if(shouldShowWaiting()){
      node.textContent='상대방을 기다리는 중';
      node.classList.remove('hidden','red','green');
      node.classList.add('fix25-pvp-waiting');
      F25.lastIndicatorText=node.textContent;
    }else if(isPvpActive()){
      node.classList.add('hidden');
      node.classList.remove('fix25-pvp-waiting','red','green');
      if(/의\s*턴|Turn|상대방/.test(node.textContent||'')) node.textContent='';
    }
  }
  function patchPvpResultHide(){
    if(F25.pvpResultWatch) return; F25.pvpResultWatch=true;
    setInterval(()=>{
      const r=pvpRoom(); if(!r) { applyPvpWaitingIndicator(); return; }
      const id=r.id || PB.phase2PvpV12?.roomId || PB.phase2FullPvpPatch?.roomId || '';
      const seq=finite(r.pvpV12?.lastResult?.seq ?? r.pvp2?.lastResult?.turn ?? 0,0);
      const key=id+':'+seq;
      if(id && seq && key!==F25.lastRoomId){
        F25.lastRoomId=key;
        F25.hideUntil=now()+1250;
        const node=document.getElementById('battle-turn-indicator');
        if(node){ node.classList.add('hidden'); node.textContent=''; node.classList.remove('fix25-pvp-waiting','red','green'); }
        setTimeout(applyPvpWaitingIndicator, 1300);
      }
      applyPvpWaitingIndicator();
    },160);
  }
  function patchBattleEngineWaiting(){
    const be=PB.battleEngine; if(!be || be.__fix25WaitPatch) return;
    be.__fix25WaitPatch=true;
    const oldSet=be.setPvpWaiting;
    be.setPvpWaiting=function(message){ const res=oldSet ? oldSet.call(this, '상대방을 기다리는 중') : undefined; setTimeout(applyPvpWaitingIndicator,0); return res; };
    const oldClear=be.clearPvpWaiting;
    be.clearPvpWaiting=function(){ const res=oldClear ? oldClear.apply(this, arguments) : undefined; setTimeout(applyPvpWaitingIndicator,0); return res; };
    const oldImport=be.importPvpSyncState;
    if(typeof oldImport==='function'){
      be.importPvpSyncState=function(){
        F25.hideUntil=now()+1250;
        const node=document.getElementById('battle-turn-indicator'); if(node){ node.classList.add('hidden'); node.textContent=''; }
        const res=oldImport.apply(this, arguments);
        setTimeout(applyPvpWaitingIndicator,1300);
        return res;
      };
    }
  }
  function patchUiRender(){
    if(!PB.ui || PB.ui.__fix25RenderPatch) return;
    PB.ui.__fix25RenderPatch=true;
    const old=PB.ui.renderAll;
    PB.ui.renderAll=function(){ const res=old.apply(this,arguments); setTimeout(applyPvpWaitingIndicator,0); return res; };
  }
  function css(){
    if(document.getElementById('fix25-style')) return;
    const st=document.createElement('style'); st.id='fix25-style'; st.textContent=`
      #battle-turn-indicator.fix25-pvp-waiting{display:flex!important;align-items:center;justify-content:center;margin:6px auto 8px;padding:7px 12px;border-radius:999px;background:rgba(15,23,42,.88)!important;color:#fff!important;-webkit-text-fill-color:#fff!important;font-weight:1000;letter-spacing:-.02em;box-shadow:0 6px 18px rgba(0,0,0,.22);}
      #battle-turn-indicator.fix25-pvp-waiting.hidden{display:flex!important;}
    `; document.head.appendChild(st);
  }
  function init(){
    css(); patchFreshCreateAndStart(); patchSaveCharacterGuard(); patchFinalizeStarter(); patchBattleEngineWaiting(); patchPvpResultHide(); patchUiRender(); applyPvpWaitingIndicator();
    setInterval(()=>{ patchSaveCharacterGuard(); patchFinalizeStarter(); patchBattleEngineWaiting(); patchUiRender(); }, 1800);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', ()=>setTimeout(init,520), {once:true}); else setTimeout(init,520);
})();
