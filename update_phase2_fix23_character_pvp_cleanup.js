(function(){
  'use strict';
  const PB = window.POKEBATTLE || (window.POKEBATTLE = {});
  const F23 = PB.fix23CharacterPvpCleanup = PB.fix23CharacterPvpCleanup || { hydrated:{}, activeRoomId:null, lastRoomCleanup:0, observer:null, patched:false };
  const HAIR_ASSETS = ['hair1.png','hair2.png','hair3.png','hair4.png'];
  function online(){ return window.PB_ONLINE_V3?.getOnlineState?.() || PB.online || {}; }
  function core(){ return PB.core; }
  function ui(){ return PB.ui; }
  function db(){ return online().db || null; }
  function uid(){ return online().uid || ''; }
  function slot(){ return online().selectedSlot || 'char1'; }
  function key(s=slot()){ return uid() ? `${uid()}_${s}` : ''; }
  function toast(msg){ try{ ui()?.showToast?.(msg); }catch(e){} }
  function finite(n, f=0){ n=Number(n); return Number.isFinite(n) ? n : f; }
  function esc(v){ return String(v ?? '').replace(/[&<>'"]/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m])); }
  function deep(v){ try{ return JSON.parse(JSON.stringify(v)); }catch(e){ return v; } }
  function hasTeamPlayer(ch){ return !!(ch?.player && ((ch.player.squad||[]).length || (ch.player.reserve||[]).length)); }
  function compactTeamCount(ch){ return (ch?.player?.squad||[]).length + (ch?.player?.reserve||[]).length; }
  function sanitizeCharacter(ch, s){
    if(!ch) return null;
    const out = {...ch};
    out.slot = out.slot || s;
    out.name = String(out.name || out.nickname || (s==='char2'?'캐릭터2':'캐릭터1')).trim();
    out.nickname = String(out.nickname || out.name).trim();
    out.hair = HAIR_ASSETS.includes(out.hair) ? out.hair : HAIR_ASSETS[0];
    out.competitive = out.competitive || {tier:'beginner',rank:3,points:0,promotionReady:false,wins:0,losses:0};
    out.challenge = out.challenge || {badges:{},badgePoints:0,allClearRewarded:false};
    return out;
  }
  async function fetchSave(s){
    const d=db(), u=uid(); if(!d || !u || !s) return null;
    try{
      const snap = await d.ref(`saves/${u}/${s}`).once('value');
      if(snap.exists()) return sanitizeCharacter(snap.val(), s);
    }catch(e){ console.warn('fix23 save fetch failed', e); }
    return null;
  }
  async function fetchCharacter(s){
    const d=db(), u=uid(); if(!d || !u || !s) return null;
    try{
      const snap = await d.ref(`characters/${u}/${s}`).once('value');
      if(snap.exists()) return sanitizeCharacter(snap.val(), s);
    }catch(e){ console.warn('fix23 character fetch failed', e); }
    return null;
  }
  function mergeCharacter(profile, saved, s){
    const base = sanitizeCharacter(profile || saved, s);
    if(!base) return null;
    if(saved && (!hasTeamPlayer(base) || compactTeamCount(saved) >= compactTeamCount(base))){
      const nick = base.nickname || saved.nickname || saved.name;
      const name = base.name || saved.name || nick;
      return sanitizeCharacter({...saved, ...base, player:saved.player || base.player, nickname:nick, name:name, updatedAt:Math.max(finite(saved.updatedAt), finite(base.updatedAt))}, s);
    }
    return base;
  }
  function inflatePokemon(data){
    const c=core(); const base=c?.state?.pokemonById?.get?.(Number(data?.baseId || data?.base?.id || data?.id || 0));
    if(!c || !base) return null;
    const p=c.createRuntimePokemon(base, finite(data.level,5));
    p.uid = data.uid || p.uid;
    p.currentName = data.currentName || data.name || p.currentName;
    p.nickname = data.nickname || p.nickname || '';
    p.candyUsed = finite(data.candyUsed,0);
    p.enhanceLevel = finite(data.enhanceLevel,0);
    p.preventEvolution = Boolean(data.preventEvolution);
    p.heldItems = Array.isArray(data.heldItems) ? deep(data.heldItems) : [];
    p.heldItem = p.heldItems[0] || null;
    p.koCount = finite(data.koCount,0);
    p.koStars = finite(data.koStars,0);
    p.totalExp = finite(data.totalExp,0);
    p.bloodline = data.bloodline || p.bloodline || 'normal';
    p.competitiveDamageDealt = finite(data.competitiveDamageDealt || data.damageDealt,0);
    p.competitiveDamageTaken = finite(data.competitiveDamageTaken || data.damageTaken,0);
    p.isShiny = Boolean(data.isShiny);
    p.shinyKey = data.shinyKey || null;
    if(Array.isArray(data.moves) && data.moves.length) p.moves = data.moves.slice(0,4).map(m=>({...m}));
    try{ c.recalculateRuntimeStats?.(p,{fullHeal:true}); }catch(e){}
    p.currentHp = Math.max(0, Math.min(p.maxHp || 1, finite(data.currentHp ?? data.hp, p.maxHp || 1)));
    return p;
  }
  function inflatePlayer(data, fallbackName){
    const player={ id:'p1', name:data?.name || fallbackName || '트레이너', seasonLabel:'온라인', money:finite(data?.money,0), bag:data?.bag?deep(data.bag):{holdables:[],consumables:[]}, squad:[], reserve:[] };
    player.squad=(data?.squad||[]).map(inflatePokemon).filter(Boolean);
    player.reserve=(data?.reserve||[]).map(inflatePokemon).filter(Boolean);
    player.bag.holdables=Array.isArray(player.bag.holdables)?player.bag.holdables:[];
    player.bag.consumables=Array.isArray(player.bag.consumables)?player.bag.consumables:[];
    return player;
  }
  function loadCharacterIntoGame(ch){
    const c=core(); if(!c || !ch?.player || !hasTeamPlayer(ch)) return false;
    const p=inflatePlayer(ch.player, ch.nickname || ch.name || '트레이너');
    if(!p.squad.length && !p.reserve.length) return false;
    c.state.players.p1 = p;
    c.state.activePlayerId = 'p1';
    c.state.gameMode = 'single';
    c.state.currentCategory = 'squad';
    c.state.currentScreen = 'lobby';
    try{ ui()?.showScreen?.('lobby'); }catch(e){}
    return true;
  }
  async function hydrateSlot(s, force=false){
    const o=online(); if(!uid() || !s) return o.characters?.[s] || null;
    const local = sanitizeCharacter(o.characters?.[s] || o.localStore?.characters?.[s] || null, s);
    if(!force && F23.hydrated[s] && hasTeamPlayer(local)) return local;
    const [profile, saved] = await Promise.all([fetchCharacter(s), fetchSave(s)]);
    const merged = mergeCharacter(profile || local, saved || local, s);
    if(!merged) return local;
    o.characters = o.characters || {}; o.characters[s]=merged;
    o.localStore = o.localStore || {}; o.localStore.characters = o.localStore.characters || {}; o.localStore.characters[s]=merged;
    if(o.selectedSlot === s) o.selectedCharacter = merged;
    try{ localStorage.setItem('pokebattle-online-expansion-v1', JSON.stringify(o.localStore || {})); }catch(e){}
    F23.hydrated[s]=Date.now();
    return merged;
  }
  async function hydrateSelected(force=false){
    const o=online(); const s=o.selectedSlot || slot(); if(!s) return null;
    const ch = await hydrateSlot(s, force);
    if(ch && o.selectedSlot===s){ o.selectedCharacter=ch; if(o.characters) o.characters[s]=ch; }
    return ch;
  }
  async function selectCharacterSafe(s){
    const o=online();
    const ch=await hydrateSlot(s,true) || sanitizeCharacter(o.characters?.[s], s);
    if(!ch){ toast('캐릭터를 찾을 수 없습니다.'); return; }
    o.selectedSlot=s; o.selectedCharacter=ch; o.selectedHair=ch.hair || HAIR_ASSETS[0];
    if(hasTeamPlayer(ch)){ loadCharacterIntoGame(ch); toast('캐릭터 불러오기 완료'); }
    try{ window.PB_ONLINE_V3?.renderAuthPanel?.(); }catch(e){}
    try{ ui()?.renderAll?.(); }catch(e){}
  }
  async function startOnlineSafe(){
    const o=online();
    if(!o.selectedCharacter){ toast('먼저 로그인 후 캐릭터를 선택하세요.'); try{ window.PB_ONLINE_V3?.renderAuthPanel?.(); }catch(e){} return; }
    const ch = await hydrateSelected(true) || o.selectedCharacter;
    if(hasTeamPlayer(ch)){
      loadCharacterIntoGame(ch); try{ window.PB_ONLINE_V3?.renderAuthPanel?.(); }catch(e){} try{ ui()?.renderAll?.(); }catch(e){} return;
    }
    PB.core?.startGame?.('single');
  }
  function compactPlayer(player){
    if(!player) return null;
    const mon = p => p?.base ? { baseId:Number(p.base.id||p.id||0), level:finite(p.level,5), currentHp:finite(p.currentHp ?? p.maxHp,1), candyUsed:finite(p.candyUsed,0), enhanceLevel:finite(p.enhanceLevel,0), preventEvolution:Boolean(p.preventEvolution), heldItems:deep(p.heldItems||[]), koCount:finite(p.koCount,0), koStars:finite(p.koStars,0), totalExp:finite(p.totalExp,0), bloodline:p.bloodline||null, competitiveDamageDealt:finite(p.competitiveDamageDealt,0), competitiveDamageTaken:finite(p.competitiveDamageTaken,0), isShiny:Boolean(p.isShiny), shinyKey:p.shinyKey||null, moves:(p.moves||[]).slice(0,4).map(m=>({...m})) } : null;
    return { id:'p1', name:player.name||'트레이너', money:finite(player.money,0), bag:deep(player.bag||{holdables:[],consumables:[]}), squad:(player.squad||[]).map(mon).filter(Boolean), reserve:(player.reserve||[]).map(mon).filter(Boolean) };
  }
  function patchSaveCharacter(){
    const api=window.PB_ONLINE_V3; if(!api || api.__fix23SavePatch || typeof api.saveCharacter!=='function') return;
    api.__fix23SavePatch=true;
    const old=api.saveCharacter;
    api.saveCharacter=async function(s=slot()){
      const o=online();
      if(o.selectedCharacter){
        o.selectedCharacter.nickname = o.selectedCharacter.nickname || o.selectedCharacter.name || '트레이너';
        if(core()?.getPlayer?.('p1')) o.selectedCharacter.player = compactPlayer(core().getPlayer('p1')) || o.selectedCharacter.player;
        if(o.characters && s) o.characters[s] = o.selectedCharacter;
      }
      return old.apply(this, arguments);
    };
  }
  async function repairSelectedIfNeeded(){
    const o=online(); const s=o.selectedSlot; if(!s || !o.selectedCharacter) return;
    if(!hasTeamPlayer(o.selectedCharacter)) await hydrateSlot(s,false);
    const p=core()?.getPlayer?.('p1');
    const malformed = p && ((p.squad||[]).some(m=>m && !m.base && m.baseId) || (p.reserve||[]).some(m=>m && !m.base && m.baseId));
    if(malformed || (hasTeamPlayer(o.selectedCharacter) && (!p || (!(p.squad||[]).length && !(p.reserve||[]).length)) && core()?.state?.currentScreen==='lobby')) loadCharacterIntoGame(o.selectedCharacter);
  }
  function patchCharacterDelete(){
    const api=window.PB_ONLINE_V3; if(!api || api.__fix23DeletePatch) return;
    api.__fix23DeletePatch=true;
    const old=api.deleteCurrentCharacter;
    api.deleteCurrentCharacter=async function(){
      const before=slot();
      const res = typeof old==='function' ? await old.apply(this,arguments) : false;
      const o=online();
      const remain = o.selectedSlot || (o.characters?.char1?'char1':(o.characters?.char2?'char2':null));
      if(remain){ await selectCharacterSafe(remain); }
      if(db() && uid() && before){
        try{ await db().ref(`playerPublicList/${uid()}_${before}`).update({hidden:true,deleted:true,updatedAt:Date.now()}); }catch(e){}
      }
      return res;
    };
  }
  function titleColorByText(txt){
    if(/지배자|신화|전설|뮤|수호자|불멸/.test(txt)) return '#ffe27a';
    if(/바다|물/.test(txt)) return '#63c8ff';
    if(/대지|그란돈/.test(txt)) return '#d79053';
    if(/불꽃/.test(txt)) return '#ff9a4b';
    if(/풀/.test(txt)) return '#65e46f';
    return '#dff7ff';
  }
  function collapseDuplicateTextNode(node){
    if(!node || node.nodeType!==3) return;
    let s=node.nodeValue;
    s=s.replace(/([가-힣A-Za-z0-9_]{2,12})\s+\1(?=\s|$|·|Lv|\()/g,'$1');
    s=s.replace(/(내 정보 ·\s*)([가-힣A-Za-z0-9_]{2,12})\s+\2/g,'$1$2');
    node.nodeValue=s;
  }
  function cleanupNicknamesAndTitles(){
    document.querySelectorAll('.p2-player-row b,.p2-rank-row small,.f21-mvp-row span,#trainer-name,.online-auth-status,.online-character-card strong').forEach(el=>{
      [...el.childNodes].forEach(collapseDuplicateTextNode);
    });
    document.querySelectorAll('.f17-title-badge,.f21-title-badge,.f22-title-badge').forEach(el=>{
      const raw=(el.textContent||'').replace(/장착중|장착/g,'').trim();
      const color=el.style.getPropertyValue('--title-color') || titleColorByText(raw);
      el.style.setProperty('--title-color', color);
      el.style.color=color; el.style.webkitTextFillColor=color;
    });
  }
  function roomArray(){ return Object.entries(PB.phase2Online?.rooms||{}).map(([id,r])=>({id,...r})); }
  async function cleanupRooms(force=false){
    const d=db(); if(!d || !uid()) return; const t=Date.now(); if(!force && t-F23.lastRoomCleanup<12000) return; F23.lastRoomCleanup=t;
    const me=key();
    for(const r of roomArray()){
      const age=t-finite(r.updatedAt || r.createdAt, t);
      const involved = r.challengerKey===me || r.targetKey===me;
      const invalid = !r.challengerKey || !r.targetKey || r.challengerKey===r.targetKey;
      const ended = /^(completed|cancelled|declined|abandoned|deleted)$/.test(String(r.status||''));
      const staleMine = involved && /^(pending|accepted|readying|inProgress)$/.test(String(r.status||'')) && age > 20*60*1000;
      if(invalid || (ended && age>60*1000) || staleMine){
        try{ await d.ref(`battleRooms/${r.id}`).remove(); }catch(e){}
      }
    }
  }
  async function validateRoomAccess(id){
    const d=db(), me=key(); if(!d || !me || !id){ toast('로그인 후 이용하세요.'); return null; }
    let room=null;
    try{ const snap=await d.ref(`battleRooms/${id}`).once('value'); room=snap.exists()?{id,...snap.val()}:null; }catch(e){ console.warn('fix23 room read failed', e); }
    if(!room){ toast('이미 삭제된 배틀방입니다.'); return null; }
    const mine = room.challengerKey===me || room.targetKey===me;
    const ended = /^(completed|cancelled|declined|abandoned|deleted)$/.test(String(room.status||''));
    if(!mine || ended || !room.challengerKey || !room.targetKey){
      toast('이 캐릭터가 참가할 수 없는 배틀방입니다.');
      if(!room.challengerKey || !room.targetKey || (room.challengerKey===me || room.targetKey===me)){
        try{ await d.ref(`battleRooms/${id}`).remove(); }catch(e){}
      }
      return null;
    }
    return room;
  }
  function patchPvpEnter(){
    const api=window.PB_REALTIME_PVP; if(!api || api.__fix23EnterPatch || typeof api.enterRoom!=='function') return;
    api.__fix23EnterPatch=true;
    const old=api.enterRoom.bind(api);
    api.enterRoom=async function(id){
      const room=await validateRoomAccess(id); if(!room) return;
      const d=db(); F23.activeRoomId=id;
      try{
        const ref=d.ref(`battleRooms/${id}`);
        await ref.child(`presence/${key()}`).set({online:true,at:Date.now()}).catch(()=>{});
        await ref.onDisconnect().remove();
      }catch(e){ console.warn('fix23 onDisconnect room cleanup failed', e); }
      return old(id);
    };
  }
  async function removeActiveRoom(reason='disconnect'){
    const id=F23.activeRoomId || PB.phase2PvpV12?.roomId; if(!id || !db()) return;
    try{ await db().ref(`battleRooms/${id}`).remove(); }catch(e){ try{ await db().ref(`battleRooms/${id}`).update({status:'abandoned',abandonedBy:key(),reason,updatedAt:Date.now()}); }catch(_){} }
    F23.activeRoomId=null;
  }
  function patchRoomClicks(){
    if(F23.roomClicks) return; F23.roomClicks=true;
    window.addEventListener('click', async e=>{
      const start=e.target?.closest?.('[data-p2-room-start]');
      if(start){ e.preventDefault(); e.stopImmediatePropagation(); const id=start.dataset.p2RoomStart; const room=await validateRoomAccess(id); if(room) window.PB_REALTIME_PVP?.enterRoom?.(id); return; }
      const accept=e.target?.closest?.('[data-p2-room-accept]');
      if(accept){ const id=accept.dataset.p2RoomAccept; const d=db(); if(!d) return; const snap=await d.ref(`battleRooms/${id}`).once('value'); const r=snap.exists()?snap.val():null; if(!r || r.targetKey!==key()){ e.preventDefault(); e.stopImmediatePropagation(); toast('이 캐릭터가 수락할 수 없는 신청입니다.'); if(r && (!r.targetKey || !r.challengerKey)) await d.ref(`battleRooms/${id}`).remove().catch(()=>{}); return; } }
    }, true);
    window.addEventListener('beforeunload', ()=>{ const id=F23.activeRoomId || PB.phase2PvpV12?.roomId; if(id && db()) { try{ db().ref(`battleRooms/${id}`).remove(); }catch(e){} } });
    document.addEventListener('visibilitychange', ()=>{ if(document.visibilityState==='hidden' && (F23.activeRoomId || PB.phase2PvpV12?.active)) removeActiveRoom('hidden'); });
  }
  function patchStartAndSelect(){
    if(F23.startSelect) return; F23.startSelect=true;
    window.addEventListener('click', async e=>{
      const select=e.target?.closest?.('[data-character-select]');
      if(select){ e.preventDefault(); e.stopImmediatePropagation(); await selectCharacterSafe(select.dataset.characterSelect); return; }
      const start=e.target?.closest?.('[data-start-mode="single"]');
      if(start){ e.preventDefault(); e.stopImmediatePropagation(); await startOnlineSafe(); return; }
    }, true);
  }
  function injectStyle(){
    if(document.getElementById('fix23-style')) return;
    const st=document.createElement('style'); st.id='fix23-style'; st.textContent=`
      .f17-title-badge,.f21-title-badge,.f22-title-badge{color:var(--title-color,#dff7ff)!important;-webkit-text-fill-color:var(--title-color,#dff7ff)!important;filter:none!important;opacity:1!important;}
      .p2-room[data-f23-invalid="1"]{display:none!important;}
    `; document.head.appendChild(st);
  }
  function patchRender(){
    if(!PB.ui || PB.ui.__fix23RenderPatch) return;
    PB.ui.__fix23RenderPatch=true;
    const old=PB.ui.renderAll;
    PB.ui.renderAll=function(){ const r=old.apply(this,arguments); setTimeout(()=>{ cleanupNicknamesAndTitles(); repairSelectedIfNeeded(); cleanupRooms(false); },0); return r; };
  }
  function init(){
    injectStyle(); patchStartAndSelect(); patchRoomClicks(); patchSaveCharacter(); patchCharacterDelete(); patchPvpEnter(); patchRender(); cleanupNicknamesAndTitles(); repairSelectedIfNeeded(); cleanupRooms(true);
    if(!F23.observer){ F23.observer=new MutationObserver(()=>setTimeout(cleanupNicknamesAndTitles,0)); F23.observer.observe(document.body,{childList:true,subtree:true,characterData:true}); }
    setInterval(()=>{ patchSaveCharacter(); patchCharacterDelete(); patchPvpEnter(); repairSelectedIfNeeded(); cleanupRooms(false); cleanupNicknamesAndTitles(); },2500);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', ()=>setTimeout(init,420), {once:true}); else setTimeout(init,420);
})();
