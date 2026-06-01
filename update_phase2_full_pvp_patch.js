(function(){
  'use strict';
  const PB = window.POKEBATTLE || (window.POKEBATTLE = {});
  const PATCH = PB.phase2FullPvpPatch = PB.phase2FullPvpPatch || { active:false, roomId:null, room:null, unsub:null, lastResultTurn:0, resolving:false, actionSent:false, chatUnread:false, chatItems:{}, replyTo:null };
  const TYPE_COLOR={노말:'#a8a878',불꽃:'#f08030',물:'#6890f0',전기:'#f8d030',풀:'#78c850',얼음:'#98d8d8',격투:'#c03028',독:'#a040a0',땅:'#e0c068',비행:'#a890f0',에스퍼:'#f85888',벌레:'#a8b820',바위:'#b8a038',고스트:'#705898',드래곤:'#7038f8',악:'#705848',강철:'#b8b8d0',페어리:'#ee99ac'};
  const esc=(v)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm=(v)=>String(v||'').toLowerCase().replace(/[^a-z0-9_가-힣]/g,'');
  const now=()=>Date.now();
  function core(){return PB.core;} function online(){return PB.online||{};} function db(){return online().db||null;} function uid(){return online().uid||null;} function slot(){return online().selectedSlot||'char1';} function key(){return uid()?`${uid()}_${slot()}`:'';} function curChar(){return online().selectedCharacter||null;} function curPlayer(){return core()?.getPlayer?.('p1')||core()?.getActivePlayer?.()||null;} function toast(m){PB.ui?.showToast?.(m);} 
  function getBase(id){return core()?.state?.pokemonById?.get?.(Number(id));}
  function pName(p){return p?.currentName||p?.name||p?.base?.nameKo||p?.nameKo||'포켓몬';}
  function getAvatarSrc(p){return p?.hair||p?.avatar||p?.profileImage||'hair1.png';}
  function typeBadge(t){return `<span class="p2fp-type" style="background:${TYPE_COLOR[t]||'#789'}">${esc(t)}</span>`;}
  function bloodLabel(v){const s=String(v||'normal'); if(s.includes('우수')||['elite','superior','great','blue'].includes(s))return'우수혈통'; if(s.includes('고대')||['ancient','gold'].includes(s))return'고대혈통'; if(s.includes('뮤')||['mew','mew_descendant','purple'].includes(s))return'뮤의 후손'; return'일반혈통';}
  function bloodClass(v){const l=bloodLabel(v); return l==='우수혈통'?'blood-block-blue':l==='고대혈통'?'blood-block-gold':l==='뮤의 후손'?'blood-block-purple':'blood-block-gray';}
  function bloodBadge(v){return `<span class="blood-block ${bloodClass(v)}">${esc(bloodLabel(v))}</span>`;}
  function itemName(id){const c=core(); return c?.state?.itemsById?.get?.(norm(id))?.nameKo||id;}
  function serializeRuntimePokemon(p){
    if(!p?.base) return null;
    return { uid:p.uid||`p_${p.base.id}_${Math.random().toString(36).slice(2,7)}`, sourceUid:p.sourceUid||p.uid||'', baseId:Number(p.base.id||p.id||0), name:pName(p), level:Math.min(100,Number(p.level||5)), types:(p.base.type||p.currentTypes||[]).slice(0,2), currentHp:Number(p.currentHp??p.maxHp??1), maxHp:Number(p.maxHp||1), status:p.status||'', bloodline:p.bloodline||'normal', enhanceLevel:Number(p.enhanceLevel||0), heldItems:(p.heldItems||(p.heldItem?[p.heldItem]:[])).map(it=>({id:it.id||'',nameKo:it.nameKo||it.name||it.id||'지닌물건',category:it.category||'지닌물건'})), moves:(p.moves||[]).slice(0,4).map(m=>({...m,currentPP:Number(m.currentPP??m.pp??m.maxPP??10),maxPP:Number(m.maxPP??m.pp??10)})), koCount:Number(p.koCount||0), damageDealt:Number(p.competitiveDamageDealt||p.damageDealt||0), damageTaken:Number(p.competitiveDamageTaken||p.damageTaken||0), isShiny:Boolean(p.isShiny) };
  }
  function inflatePokemon(data){const c=core(), base=getBase(data?.baseId); if(!c||!base) return null; const p=c.createRuntimePokemon(base,Math.min(100,Number(data.level||5))); p.uid=data.uid||p.uid; p.sourceUid=data.sourceUid||p.sourceUid; p.currentName=data.name||p.currentName; p.bloodline=data.bloodline||p.bloodline||'normal'; p.enhanceLevel=Number(data.enhanceLevel||p.enhanceLevel||0); p.heldItems=Array.isArray(data.heldItems)?data.heldItems.map(it=>({...it})):[]; p.heldItem=p.heldItems[0]||null; if(Array.isArray(data.moves)&&data.moves.length)p.moves=data.moves.slice(0,4).map(m=>({...m})); c.recalculateRuntimeStats?.(p,{fullHeal:true}); p.maxHp=Number(data.maxHp||p.maxHp||1); p.currentHp=Math.max(0,Math.min(p.maxHp,Number(data.currentHp??p.maxHp))); p.status=data.status||''; return p;}
  function myTeamCompact(){return (curPlayer()?.squad||[]).slice(0,3).map(serializeRuntimePokemon).filter(Boolean);}
  function teamFromPublic(pub){return (pub?.battleTeam||pub?.squad||[]).slice(0,3).map(x=>serializeRuntimePokemon(inflatePokemon(x))).filter(Boolean);}
  function hostKey(room){return room?.challengerKey||'';} function guestKey(room){return room?.targetKey||'';} function isHost(room){return key()===hostKey(room);} function opponentPub(room){return isHost(room)?room.target:room.challenger;} function myPub(room){return isHost(room)?room.challenger:room.target;} function aliveTeam(team){return (team||[]).some(p=>Number(p.currentHp||0)>0);} 
  function buildInitialPvp2(room){
    const hTeam = room.challengerKey===key()?myTeamCompact():teamFromPublic(room.challenger);
    const gTeam = room.targetKey===key()?myTeamCompact():teamFromPublic(room.target);
    return { version:2, phase:'select', turn:1, hostKey:room.challengerKey, guestKey:room.targetKey, actions:{}, lastResult:null, teams:{[room.challengerKey]:hTeam,[room.targetKey]:gTeam}, createdAt:now(), updatedAt:now() };
  }
  async function ensureRoomReady(id){const d=db(); if(!d) return null; const ref=d.ref(`battleRooms/${id}`); let snap=await ref.get(); let room={id,...(snap.val()||{})}; if(!room||(!room.challengerKey&&!room.targetKey)) return null; await ref.transaction(cur=>{ if(!cur) return cur; if(!cur.pvp2){ cur.pvp2=buildInitialPvp2(cur); cur.status='inProgress'; cur.updatedAt=now(); } else if(cur.status==='accepted'){ cur.status='inProgress'; cur.updatedAt=now(); } return cur; }); snap=await ref.get(); return {id,...(snap.val()||{})};}
  function startLocalBattleFromRoom(room){
    const mine=isHost(room)?room.pvp2?.teams?.[room.challengerKey]:room.pvp2?.teams?.[room.targetKey];
    const opp=isHost(room)?room.pvp2?.teams?.[room.targetKey]:room.pvp2?.teams?.[room.challengerKey];
    const myTeam=(mine||[]).map(inflatePokemon).filter(Boolean); const oppTeam=(opp||[]).map(inflatePokemon).filter(Boolean);
    if(!myTeam.length||!oppTeam.length){toast('배틀 팀 정보를 불러오지 못했습니다.'); return false;}
    PATCH.active=true; PATCH.roomId=room.id; PATCH.room=room; PATCH.lastResultTurn=0; PATCH.actionSent=!!room.pvp2?.actions?.[key()];
    PB.battleEngine?.startBattle?.({ playerId:'p1', opponentId:'online_pvp_enemy', playerName:curChar()?.name||curPlayer()?.name||'나', opponentName:opponentPub(room)?.characterName||'상대 플레이어', playerTeam:myTeam, opponentTeam:oppTeam, mode:'online_pvp', isDuo:true, skipLevelReward:true, theme:'city', onComplete:(payload)=>{ return true; } });
    setTimeout(()=>decorate(),50);
    return true;
  }
  async function enterSameUiRoom(id){
    const d=db(); if(!d){toast('Firebase 연결 후 이용하세요.'); return;}
    const room=await ensureRoomReady(id); if(!room){toast('배틀방을 찾을 수 없습니다.'); return;}
    if(key()!==room.challengerKey&&key()!==room.targetKey){toast('참가자가 아닙니다.'); return;}
    if(PATCH.unsub){try{PATCH.unsub.off();}catch(e){}}
    PATCH.roomId=id; PATCH.room=room; PATCH.active=true; startLocalBattleFromRoom(room);
    const ref=d.ref(`battleRooms/${id}`); PATCH.unsub=ref; ref.on('value',snap=>{ const r={id,...(snap.val()||{})}; if(!r?.id) return; PATCH.room=r; onRoomUpdate(r); });
  }
  function closePvp(){if(PATCH.unsub){try{PATCH.unsub.off();}catch(e){}} PATCH.unsub=null; PATCH.active=false; PATCH.roomId=null; PATCH.room=null; PATCH.actionSent=false;}
  async function onRoomUpdate(room){
    if(!PATCH.active||room.id!==PATCH.roomId) return;
    if(room.pvp2?.lastResult && Number(room.pvp2.lastResult.turn||0)>PATCH.lastResultTurn){
      PATCH.lastResultTurn=Number(room.pvp2.lastResult.turn||0);
      const reverse=!isHost(room);
      PB.battleEngine?.importPvpSyncState?.(room.pvp2.lastResult.syncState,{reverse});
      PATCH.actionSent=false;
      if(room.status==='completed'||room.pvp2.phase==='completed') await settleRoom(room);
      setTimeout(()=>decorate(),80);
    }
    if(isHost(room) && !PATCH.resolving && room.pvp2?.phase==='select' && room.pvp2?.actions?.[room.challengerKey] && room.pvp2?.actions?.[room.targetKey]){
      PATCH.resolving=true;
      try{ await resolveHostTurn(room); }catch(e){console.warn('호스트 턴 계산 실패',e); toast('턴 계산 실패'); }
      PATCH.resolving=false;
    }
    if(room.pvp2?.actions?.[key()] && !room.pvp2?.actions?.[isHost(room)?room.targetKey:room.challengerKey]) showPvpWaiting();
  }
  async function resolveHostTurn(room){
    const h=room.challengerKey,g=room.targetKey; const aH=room.pvp2.actions[h], aG=room.pvp2.actions[g];
    const sync=await PB.battleEngine.resolvePvpSyncedTurn(aH,aG);
    const hAlive=aliveTeam(sync.playerTeam), gAlive=aliveTeam(sync.opponentTeam);
    const updates={};
    updates[`battleRooms/${room.id}/pvp2/actions`]=null;
    updates[`battleRooms/${room.id}/pvp2/lastResult`]={turn:Number(room.pvp2.turn||1),syncState:sync,createdAt:now()};
    updates[`battleRooms/${room.id}/pvp2/updatedAt`]=now();
    if(!hAlive||!gAlive||sync.completed){
      const winnerKey=hAlive&&!gAlive?h:gAlive&&!hAlive?g:(sync.playerTeam.some(p=>p.currentHp>0)?h:g);
      const winnerPub=winnerKey===h?room.challenger:room.target;
      updates[`battleRooms/${room.id}/status`]='completed'; updates[`battleRooms/${room.id}/result`]={winnerKey,winnerName:winnerPub?.characterName||'',completedAt:now(),sameUi:true}; updates[`battleRooms/${room.id}/pvp2/phase`]='completed';
      if(room.mode==='champion' && winnerKey===room.challengerKey){ updates['competitive/champion']={...room.challenger,championSince:now(),championCount:Number(room.challenger?.championCount||0)+1,reason:'sameUiChallengeWin'}; }
    }else{ updates[`battleRooms/${room.id}/pvp2/turn`]=Number(room.pvp2.turn||1)+1; updates[`battleRooms/${room.id}/pvp2/phase`]='select'; }
    await db().ref().update(updates);
  }
  async function submitPvpAction(action){
    const room=PATCH.room, d=db(); if(!PATCH.active||!room?.id||!d) return false;
    PATCH.actionSent=true; PB.battleEngine?.setPvpWaiting?.('상대방이 선택하는 중');
    await d.ref(`battleRooms/${room.id}/pvp2/actions/${key()}`).set({...action,at:now()}); return true;
  }
  function showPvpWaiting(){PB.battleEngine?.setPvpWaiting?.('상대방이 선택하는 중'); const grid=document.getElementById('battle-action-grid'); if(grid) grid.innerHTML='<div class="p2fp-wait">상대방이 선택하는 중</div>';}
  async function settleRoom(room){
    const settleKey=`sameui_pvp_settled_${room.id}_${key()}`; if(localStorage.getItem(settleKey)) return; localStorage.setItem(settleKey,'1');
    const won=room.result?.winnerKey===key(); const ch=curChar(); const c=core(); const p=curPlayer();
    if(ch){ ch.onlinePvp=ch.onlinePvp||{wins:0,losses:0}; if(won)ch.onlinePvp.wins=Number(ch.onlinePvp.wins||0)+1; else ch.onlinePvp.losses=Number(ch.onlinePvp.losses||0)+1; }
    if(room.mode==='friendly' && Number(room.wager||0)>0){ if(won)c?.addMoney?.('p1',Number(room.wager||0)); else c?.spendMoney?.('p1',Number(room.wager||0)); }
    c?.healPlayerTeam?.('p1'); await window.PB_ONLINE_V3?.saveCharacter?.(); toast(won?'실시간 배틀 승리':'실시간 배틀 패배');
  }
  function interceptBattleClicks(){
    document.addEventListener('click',async(e)=>{
      if(!PATCH.active) return;
      const mv=e.target.closest('[data-battle-move]'); if(mv){e.preventDefault();e.stopImmediatePropagation(); await submitPvpAction({type:'move',index:Number(mv.dataset.battleMove||0)}); return;}
      const sw=e.target.closest('[data-battle-switch]'); if(sw){e.preventDefault();e.stopImmediatePropagation(); await submitPvpAction({type:'switch',index:Number(sw.dataset.battleSwitch||0)}); return;}
      const item=e.target.closest('[data-battle-item]'); if(item){e.preventDefault();e.stopImmediatePropagation(); await submitPvpAction({type:'item',itemId:item.dataset.battleItem}); return;}
      const im=e.target.closest('[data-battle-item-move]'); if(im){e.preventDefault();e.stopImmediatePropagation(); const pending=PB.battleEngine?.getSnapshot?.()?.pendingBagItem||'pp_aid'; await submitPvpAction({type:'item',itemId:pending,moveIndex:Number(im.dataset.battleItemMove||0)}); return;}
      const ip=e.target.closest('[data-battle-item-pokemon]'); if(ip){e.preventDefault();e.stopImmediatePropagation(); await submitPvpAction({type:'item',itemId:'revive_shard',targetIndex:Number(ip.dataset.battleItemPokemon||0)}); return;}
    },true);
  }

  const EXTRA_TMS=[
    ['tm_counter','카운터','Counter','격투','물리',0,100,20,2100,'받은 물리 피해를 되돌리는 반격기입니다.'],
    ['tm_reversal','기사회생','Reversal','격투','물리',80,100,15,2600,'남은 HP가 낮을수록 강해지는 격투기입니다.'],
    ['tm_fire_blast','불대문자','Fire Blast','불꽃','특수',110,85,5,4200,'강력하지만 명중이 낮은 불꽃 특수기입니다.'],
    ['tm_hydro_pump','하이드로펌프','Hydro Pump','물','특수',110,80,5,4200,'강력하지만 명중이 낮은 물 특수기입니다.'],
    ['tm_leaf_storm','리프스톰','Leaf Storm','풀','특수',130,90,5,4300,'사용 후 특수공격이 크게 떨어지는 풀 특수기입니다.'],
    ['tm_thunder','번개','Thunder','전기','특수',110,70,10,3800,'고위력 전기 특수기입니다.'],
    ['tm_fly','공중날기','Fly','비행','물리',90,95,15,2500,'첫 턴에 하늘로 올라가고 다음 턴 자동 공격합니다.'],
    ['tm_iron_tail','아이언테일','Iron Tail','강철','물리',100,75,15,2500,'강철 타입 물리기입니다.'],
    ['tm_slash','베어가르기','Slash','노말','물리',70,100,20,1600,'급소를 노리기 쉬운 노말 물리기입니다.'],
    ['tm_drain_punch','드레인펀치','Drain Punch','격투','물리',75,100,10,3000,'피해의 일부를 회복하는 격투 펀치기입니다.']
  ];
  const CONSUME_FIRST=['rare_candy','good_potion','revive_shard','recovery_potion','mystery_egg','huge_egg'];
  const STATUS_LAST=['paralyze_heal','antidote','burn_heal','ice_heal','awakening_spray','pp_aid','pp_aide'];
  const TM_ORDER=['tm_hyper_beam','tm_draco_meteor','tm_dark_pulse','tm_close_combat','tm_thunderbolt','tm_shadow_ball','tm_earthquake','tm_ice_beam','tm_ice_punch','tm_thunder_punch','tm_fire_punch','tm_flamethrower','tm_dazzling_gleam','tm_fake_out','tm_knock_off','tm_swords_dance','tm_dragon_dance','tm_nasty_plot','tm_calm_mind','tm_stealth_rock','tm_substitute','tm_rock_slide','tm_icy_wind','tm_trick_room','tm_helping_hand','tm_counter','tm_reversal','tm_fire_blast','tm_hydro_pump','tm_leaf_storm','tm_thunder','tm_fly','tm_iron_tail','tm_slash','tm_drain_punch'];
  function addOrMergeItem(item){const c=core(); if(!c?.state) return; const id=norm(item.id); let old=c.state.itemList.find(x=>norm(x.id)===id); if(old) Object.assign(old,item); else c.state.itemList.push(item); c.state.itemsById?.set?.(id,old||item);}
  function ensureItemPatches(){
    const c=core(); if(!c?.state) return;
    EXTRA_TMS.forEach((m,i)=>addOrMergeItem({id:m[0],rank:95+i,nameKo:'기술머신: '+m[1],nameEn:'TM '+m[2],category:'기술머신',description:m[9],battleEffect:`타입 ${m[3]} · ${m[4]} · 위력 ${m[5]||'-'} · PP ${m[7]}`,price:m[8],tmMove:{id:m[0].replace('tm_',''),nameKo:m[1],nameEn:m[2],type:m[3],category:m[4],power:m[5],accuracy:m[6],pp:m[7],currentPP:m[7],maxPP:m[7],description:m[9]}}));
    addOrMergeItem({id:'focus_sash',rank:21,nameKo:'기합의띠',nameEn:'Focus Sash',category:'지닌물건',description:'HP가 가득 찬 상태에서 쓰러질 피해를 입으면 한 번 1HP로 버틴다. 일회성.',battleEffect:'풀피 상태에서 치명타를 1HP로 한 번 버틴다.',price:300,colorA:'#f8f9f9',colorB:'#e74c3c'});
    addOrMergeItem({id:'huge_egg_shard',rank:75,nameKo:'거대알 조각',nameEn:'Huge Egg Shard',category:'소비아이템',description:'10개를 모으면 거대알로 교환할 수 있습니다.',battleEffect:'거대알 제작 재료',price:0,colorA:'#cf9dff',colorB:'#f3e8ff'});
    const black=c.state.itemList.find(x=>norm(x.id)==='black_sludge'); if(black){black.description='독 타입이면 매 턴 최대 HP의 1/16을 회복한다.'; black.battleEffect='독 타입이면 매 턴 최대 HP의 1/16을 회복한다.';}
    if(!c.__fullPvpShopPatch){c.__fullPvpShopPatch=true; const old=c.getShopCatalog; c.getShopCatalog=function(){ensureItemPatches(); let baseList=(old?old.apply(this,arguments):(this.state.itemList||[])).concat(this.state.itemList||[]); const seen=new Set(); let list=baseList.filter(it=>{const id=norm(it.id), name=String(it.nameKo||''); if(seen.has(id)) return false; seen.add(id); if(['mythic_fragment','artisan_knowledge'].includes(id)) return false; if(it.craftType==='mythic'||it.craftType==='artisan') return false; if(/신화의\s*파편|신화의파편|장인의\s*지식|장인의지식/.test(name+' '+String(it.description||''))) return false; return true;}).map(it=>{const id=norm(it.id); let x={...it}; if(id==='focus_sash')x.price=300; if(id==='rare_candy')x.price=70; if(id==='mystery_egg')x.price=500; if(id==='huge_egg')x.price=6000; const idx=TM_ORDER.indexOf(id); if(idx>=0) x.price=Math.max(Number(x.price||0), Math.max(900, 7000-idx*140)); return x;}); list.sort((a,b)=>{const ia=CONSUME_FIRST.indexOf(norm(a.id)), ib=CONSUME_FIRST.indexOf(norm(b.id)); if(ia>=0||ib>=0)return (ia<0?99:ia)-(ib<0?99:ib); const ta=TM_ORDER.indexOf(norm(a.id)),tb=TM_ORDER.indexOf(norm(b.id)); if(ta>=0||tb>=0)return (ta<0?999:ta)-(tb<0?999:tb); const la=STATUS_LAST.indexOf(norm(a.id)),lb=STATUS_LAST.indexOf(norm(b.id)); if(la>=0||lb>=0)return (la<0?-1:900+la)-(lb<0?-1:900+lb); return Number(a.rank||999)-Number(b.rank||999);}); return list;};}
    if(!c.__fullPvpFocusToggle){c.__fullPvpFocusToggle=true; const oldToggle=c.toggleHeldItem; c.toggleHeldItem=function(runtimeUid){const selected=norm(c.state.selectedItemId); if(selected==='focus_sash'){const player=c.getActivePlayer?.()||c.getPlayer?.('p1'); const mon=[...(player?.squad||[]),...(player?.reserve||[])].find(p=>p.uid===runtimeUid); const inSquad=(player?.squad||[]).includes(mon); if(!mon)return; if((mon.heldItems||[]).some(x=>norm(x.id)==='focus_sash')){toast('이 포켓몬은 이미 기합의띠를 지니고 있습니다.'); return;} if(inSquad && (player.squad||[]).some(p=>p!==mon && (p.heldItems||[]).some(x=>norm(x.id)==='focus_sash'))){toast('출전포켓몬 중 기합의띠는 1마리만 지닐 수 있습니다.'); return;} } return oldToggle.apply(this,arguments);};}
  }
  function canLearnPatched(mon,move){if(!mon||!move)return false; const types=(mon.base?.type||mon.currentTypes||[]), name=move.nameKo||'', cat=move.category||''; const st=mon.base?.speciesStats||mon.base?.stats||{}; if(cat==='변화')return true; if(move.type==='노말')return true; if(/펀치|Punch/.test(name)) return types.includes('격투')||Number(st.attack||0)>=70||['리자몽','루카리오','괴력몬','팬텀','망나뇽','마기라스','번치코','초염몽','고릴타'].includes(pName(mon)); if(name==='악의파동') return types.includes('악')||types.includes('고스트'); if(name==='매지컬샤인') return types.includes('에스퍼')||types.includes('풀')||types.includes('페어리'); if(name==='하이드로펌프') return types.includes('물'); if(name==='리프스톰') return types.includes('풀'); if(name==='불대문자') return types.includes('불꽃'); if(name==='번개'||name==='10만볼트') return types.includes('전기'); if(name==='공중날기') return types.includes('비행')||['리자몽','망나뇽','레쿠쟈'].includes(pName(mon)); if(name==='아이언테일') return types.includes('강철')||Number(st.attack||0)>=80; if(name==='드레인펀치'||name==='카운터'||name==='기사회생'||name==='인파이트') return types.includes('격투')||Number(st.attack||0)>=90; return types.includes(move.type)||Number(st.attack||0)>=110||Number(st.spAttack||0)>=110;}
  function patchTmLearn(){const c=core(); if(!c||c.__fullPvpTmLearn) return; c.__fullPvpTmLearn=true; const old=c.toggleHeldItem; c.toggleHeldItem=function(uidValue){const player=c.getActivePlayer?.()||c.getPlayer?.('p1'); const selected=norm(c.state.selectedItemId); const item=c.state.itemsById?.get?.(selected)||(c.state.itemList||[]).find(x=>norm(x.id)===selected); if(['egg_shard','huge_egg_shard'].includes(selected)){toast('이 아이템은 알 제작에 사용됩니다');return;}
        if(item?.category==='기술머신'){const mon=[...(player?.squad||[]),...(player?.reserve||[])].find(p=>p.uid===uidValue); const bag=(player?.bag?.consumables||[]).find(x=>norm(x.id)===selected); if(!mon||!bag||Number(bag.amount||0)<=0){toast('기술머신이 부족합니다.');return;} if(!canLearnPatched(mon,item.tmMove)){toast(`${pName(mon)}는 ${item.tmMove?.nameKo||'이 기술'}을 배울 수 없습니다.`);return;} mon.moves=mon.moves||[]; if(mon.moves.some(m=>m.nameKo===item.tmMove.nameKo)){toast('이미 배운 기술입니다.');return;} const learned={...item.tmMove,currentPP:item.tmMove.pp,maxPP:item.tmMove.pp}; if(mon.moves.length>=4) mon.moves[mon.moves.length-1]=learned; else mon.moves.push(learned); bag.amount=Math.max(0,Number(bag.amount||0)-1); c.state.selectedItemId=null; toast(`${pName(mon)}가 ${item.tmMove.nameKo}을 배웠습니다.`); PB.ui?.renderAll?.(); return;} return old.apply(this,arguments);};}


  function syncEggStacks(){
    const p=curPlayer(); if(!p?.bag?.consumables) return;
    ['mystery_egg','huge_egg','special_egg'].forEach(id=>{
      const entry=p.bag.consumables.find(x=>norm(x.id)===id); if(!entry) return;
      entry.eggs=Array.isArray(entry.eggs)?entry.eggs:[];
      const amount=Number(entry.amount||0);
      while(entry.eggs.length<amount) entry.eggs.push({ eggType:id, createdAt:now() });
      if(entry.eggs.length>amount) entry.amount=entry.eggs.length;
    });
  }
  function patchEggBuying(){
    const c=core(); if(!c||c.__fullPvpEggBuyPatch) return; c.__fullPvpEggBuyPatch=true;
    const oldBuy=c.buyShopItem;
    c.buyShopItem=function(playerId,itemId){ const res=oldBuy.apply(this,arguments); if(res?.ok && ['mystery_egg','huge_egg','special_egg'].includes(norm(itemId))) setTimeout(syncEggStacks,0); return res; };
    const oldAdd=c.addConsumable;
    if(oldAdd){ c.addConsumable=function(playerId,itemId,amount){ const ok=oldAdd.apply(this,arguments); if(ok && ['mystery_egg','huge_egg','special_egg'].includes(norm(itemId))) setTimeout(syncEggStacks,0); return ok; }; }
  }
  function craftHugeEgg(){const p=curPlayer(); if(!p)return; const e=(p.bag.consumables||[]).find(x=>norm(x.id)==='huge_egg_shard'); if(!e||Number(e.amount||0)<10){toast('거대알 조각이 부족합니다.');return;} e.amount-=10; core()?.addConsumable?.('p1','huge_egg',1); syncEggStacks(); toast('거대알 교환 완료'); PB.ui?.renderAll?.();}

  function patchNicknameChange(){
    document.addEventListener('click',async(e)=>{const b=e.target.closest('[data-change-nickname-fullpvp]'); if(!b)return; e.preventDefault(); const p=curPlayer(); if(Number(p?.money||0)<100){toast('닉네임 변경에는 100재화가 필요합니다.');return;} const name=(prompt('새 닉네임을 입력하세요', online().nickname||'')||'').trim().slice(0,12); if(!name)return; core()?.spendMoney?.('p1',100); online().nickname=name; if(curChar()) curChar().nickname=name; try{await db()?.ref(`users/${uid()}`).update({nickname:name,updatedAt:now()}); await window.PB_ONLINE_V3?.saveCharacter?.(); await publishPublicInfo(); toast('닉네임 변경 완료');}catch(err){console.warn(err);toast('닉네임 저장 실패');} PB.ui?.renderAll?.();},true);
  }
  async function publishPublicInfo(){const d=db(); if(!d||!uid()||!curChar())return; const st=curChar().competitive||{}; const squad=myTeamCompact(); const payload={uid:uid(),slot:slot(),key:key(),nickname:online().nickname||'',hair:curChar().hair||'',characterName:curChar().name||curPlayer()?.name||'트레이너',tier:st.tier||'beginner',rank:Number(st.rank||3),points:Number(st.points||0),tierLabel:getTierLabel(st),rankWins:Number(st.wins||0),rankLosses:Number(st.losses||0),onlineWins:Number(curChar()?.onlinePvp?.wins||0),onlineLosses:Number(curChar()?.onlinePvp?.losses||0),rankValue:rankValue(st),mainPokemon:squad[0]||null,squad:squad.map(x=>{const y={...x}; delete y.moves; return y;}),battleTeam:squad,status:'온라인',presence:'online',updatedAt:now()}; await d.ref(`playerPublicList/${key()}`).update(payload).catch(()=>{});}
  function getTierLabel(st){const t={beginner:'비기너',monster:'몬스터볼',super:'수퍼볼',hyper:'하이퍼볼',master:'마스터볼'}; if((st?.tier||'beginner')==='beginner')return`비기너 ${Number(st?.points||0)}/50`; return`${t[st?.tier]||st?.tier} ${Number(st?.rank||3)}티어 ${Number(st?.points||0)}/100`;}
  function rankValue(st){const o={beginner:0,monster:1,super:2,hyper:3,master:4}; return (o[st?.tier||'beginner']||0)*1000+(3-Number(st?.rank||3))*100+Number(st?.points||0);}
  function presence(){const d=db(); if(!d||!uid())return; const ref=d.ref(`playerPublicList/${key()}`); ref.update({presence:'online',lastSeen:now(),updatedAt:now()}).catch(()=>{}); ref.onDisconnect?.().update({presence:'offline',lastSeen:firebase.database.ServerValue.TIMESTAMP,updatedAt:firebase.database.ServerValue.TIMESTAMP}); setInterval(()=>ref.update({presence:'online',lastSeen:now(),updatedAt:now()}).catch(()=>{}),30000);}

  function showMovesModal(listingId){const l=PB.phase2Online?.listings?.[listingId] || (PB.phase2Online?.listings||{})[listingId]; const moves=l?.pokemon?.moves||[]; const html=moves.map(m=>`<div class="p2fp-move-row"><b>${esc(m.nameKo||m.name||'기술')}</b><span>${esc(m.type||'노말')} · ${esc(m.category||'')} · 위력 ${m.power??'-'} · 명중 ${m.accuracy??'-'} · PP ${m.pp||m.maxPP||'-'}</span><p>${esc(m.description||'설명이 없습니다.')}</p></div>`).join('')||'<p>공개된 기술이 없습니다.</p>'; openModal('기술 목록',html);}
  function openModal(title,html){const root=document.getElementById('modal-root'); if(!root)return; root.innerHTML=`<div class="overlay"><div class="modal-card p2-modal p2fp-modal"><div class="modal-header"><h2>${esc(title)}</h2><button class="close-btn" data-p2fp-close-modal="1">✕</button></div><div class="modal-body">${html}</div></div></div>`;}

  function renderOnlineChat(){
    const messages=Object.entries(PATCH.chatItems||{}).map(([id,m])=>({id,...m})).sort((a,b)=>Number(a.timestamp||0)-Number(b.timestamp||0));
    const html=messages.slice(-50).map(m=>`<div class="p2fp-chat-msg"><div><b>${esc(m.name||'트레이너')}</b><small>${new Date(Number(m.timestamp||Date.now())).toLocaleTimeString()}</small><button class="p2fp-reply" data-chat-reply="${esc(m.id)}">답글</button></div>${m.replyText?`<blockquote>@${esc(m.replyName||'')} ${esc(m.replyText||'')}</blockquote>`:''}<p>${esc(m.text||'')}</p></div>`).join('')||'<p>채팅이 없습니다.</p>';
    const reply=PATCH.replyTo&&PATCH.chatItems[PATCH.replyTo]?`<div class="p2fp-chat-replying">답글: ${esc(PATCH.chatItems[PATCH.replyTo].text||'')} <button data-chat-reply-clear="1">취소</button></div>`:'';
    const root=document.getElementById('modal-root'); if(!root)return; root.innerHTML=`<div class="overlay"><div class="modal-card p2-modal p2fp-chat-modal"><div class="modal-header"><h2>채팅</h2><button class="close-btn" data-p2fp-close-modal="1">✕</button></div><div class="modal-body"><div class="p2fp-chat-list">${html}</div>${reply}<textarea id="p2fp-chat-input" placeholder="메시지를 입력하세요"></textarea><button class="p2-btn" data-chat-send="1">전송</button></div></div></div>`; PATCH.chatUnread=false; updateChatButton(); }
  function updateChatButton(){const b=document.getElementById('open-chat-btn'); if(b){b.innerHTML=`채팅${PATCH.chatUnread?'<span class="chat-alert-dot"></span>':''}`; b.setAttribute('aria-label','채팅');}}
  async function sendChat(){const input=document.getElementById('p2fp-chat-input'); const text=(input?.value||'').trim(); if(!text){toast('내용을 입력하세요.');return;} if(!db()){toast('Firebase 연결 후 이용하세요.');return;} const reply=PATCH.replyTo?PATCH.chatItems[PATCH.replyTo]:null; const ref=db().ref('publicChat').push(); try{await ref.set({uid:uid(),key:key(),name:online().nickname||curChar()?.name||'트레이너',text,replyId:PATCH.replyTo||'',replyName:reply?.name||'',replyText:reply?.text||'',timestamp:now()}); PATCH.replyTo=null; input.value=''; await trimChat();}catch(error){console.warn('채팅 전송 실패',error); toast('채팅 전송 실패');} }
  async function trimChat(){const d=db(); if(!d)return; const snap=await d.ref('publicChat').orderByChild('timestamp').once('value'); const arr=[]; snap.forEach(ch=>arr.push({id:ch.key,...ch.val()})); if(arr.length>50){const remove=arr.slice(0,10); const updates={}; remove.forEach(m=>updates[`publicChat/${m.id}`]=null); await d.ref().update(updates).catch(()=>{});} }
  function subscribeChat(){const d=db(); if(!d||PATCH.chatSub)return; PATCH.chatSub=true; d.ref('publicChat').limitToLast(60).on('value',snap=>{const before=Object.keys(PATCH.chatItems||{}).length; PATCH.chatItems=snap.val()||{}; const after=Object.keys(PATCH.chatItems).length; if(after>before && !document.querySelector('.p2fp-chat-modal')) PATCH.chatUnread=true; updateChatButton(); if(document.querySelector('.p2fp-chat-modal')) renderOnlineChat();});}

  function patchChallengeReward(){const o=PB.online; if(!o||o.__fullChallengeReward)return; o.__fullChallengeReward=true; const interval=setInterval(()=>{document.querySelectorAll('.online-gym-card,.challenge-card,.p2-card').forEach(el=>{if(el.textContent&&el.textContent.includes('모든 배지')) el.innerHTML=el.innerHTML.replace(/이상한사탕[^<]*/g,'이상한사탕 30개, 신화의파편 5개, 5000원을 받습니다.');});},800);}

  function decorate(){
    ensureItemPatches(); patchTmLearn(); patchEggBuying(); syncEggStacks();
    document.body.classList.add('theme-dark'); document.body.classList.remove('theme-basic');
    // Settings nickname/change button
    document.querySelectorAll('.settings-grid,.settings-modal .modal-body,.settings-section').forEach(root=>{if(root&&!root.querySelector('[data-change-nickname-fullpvp]')) root.insertAdjacentHTML('beforeend','<section class="settings-section nickname-change-fullpvp"><h3>닉네임 변경</h3><p>100재화를 사용해 온라인 닉네임을 변경합니다.</p><button type="button" class="settings-choice" data-change-nickname-fullpvp="1">닉네임 변경</button></section>');});
    // best stat values orange
    document.querySelectorAll('.stat-value.is-best,.pokemon-stat-value.is-best,.squad-stat-value.is-best,[data-best-stat="1"]').forEach(el=>{el.style.color='#ff8a00'; el.style.webkitTextFillColor='#ff8a00'; el.style.border='0'; el.style.boxShadow='none'; el.style.textShadow='none';});
    // Bloodline blocks
    document.querySelectorAll('.bloodline-text-v3,.battle-bloodline-v3,.p2-blood,.rt-blood,.blood-block').forEach(el=>{const t=el.textContent||''; const l=bloodLabel(t); el.classList.add('blood-block'); el.classList.remove('blood-block-gray','blood-block-blue','blood-block-gold','blood-block-purple'); el.classList.add(l==='우수혈통'?'blood-block-blue':l==='고대혈통'?'blood-block-gold':l==='뮤의 후손'?'blood-block-purple':'blood-block-gray'); el.style.color='#06101f'; el.style.textShadow='none'; el.style.boxShadow='none'; el.style.filter='none';});
    // Player rows: character image + nick color + presence
    document.querySelectorAll('.p2-player-row').forEach(row=>{const text=row.textContent||''; const playerNameNode=row.querySelector('.p2-grow b'); if(playerNameNode&&!playerNameNode.dataset.fullpvpNick){playerNameNode.dataset.fullpvpNick='1'; playerNameNode.style.color=row.classList.contains('p2-me-row')?'#ffffff':'#ffd95b'; playerNameNode.innerHTML=playerNameNode.innerHTML.replace('내 정보 · ','내 정보 · ');}
      const keyBtn=row.querySelector('[data-p2-view-player],[data-p2-friendly]'); const pkey=keyBtn?.dataset?.p2ViewPlayer||keyBtn?.dataset?.p2Friendly; const pub=pkey?(PB.phase2Online?.players||{})[pkey]:null; const mini=row.querySelector('.p2-mini'); if(mini&&pub?.hair&&!mini.dataset.avatarApplied){mini.dataset.avatarApplied='1'; mini.innerHTML=`<img src="${esc(pub.hair)}" alt="avatar">`; mini.style.background='rgba(255,255,255,.12)';}
      if(pub&&row.querySelector('.p2-grow')&&!row.querySelector('.p2-presence')){row.querySelector('.p2-grow').insertAdjacentHTML('beforeend',`<small class="p2-presence ${pub.presence==='online'?'online':'offline'}">${pub.presence==='online'?'온라인':'오프라인'}</small>`);} });
    // player market move button
    document.querySelectorAll('[data-p2-buy-listing],[data-p2-cancel-listing]').forEach(btn=>{const id=btn.dataset.p2BuyListing||btn.dataset.p2CancelListing; const col=btn.parentElement; if(id&&col&&!col.querySelector('[data-p2fp-show-moves]')) col.insertAdjacentHTML('afterbegin',`<button class="p2-btn alt" data-p2fp-show-moves="${esc(id)}">기술</button>`);});
    document.querySelectorAll('.p2-card h3').forEach(h=>{if(h.textContent.includes('탱커 랭킹')) h.textContent='탱커 랭킹';});
    document.querySelectorAll('.p2-rank-row em').forEach(em=>{if(em.textContent.includes('받은 피해')) em.textContent=em.textContent.replace('받은 피해','버틴피해');});
    document.querySelectorAll('.p2-card p').forEach(p=>{if(p.textContent.includes('경쟁전/온라인 배틀 기록 기준'))p.textContent='경쟁전 배틀 기록 기준입니다.';});
    // item category title yellow only selected titles
    document.querySelectorAll('h1,h2,h3,.section-title,.section-caption,.placeholder-card h3').forEach(el=>{if(['보유 재화','지닌물건','소비 / 알','메인 스쿼드 아이템 장착'].includes((el.textContent||'').trim())) el.classList.add('item-title-yellow-only');});
    // shop item name black and price white, TM desc buttons
    document.querySelectorAll('.shop-item-card h3,.shop-item-card .item-title-row h3').forEach(el=>{el.style.color='#050b18'; el.style.webkitTextFillColor='#050b18';});
    document.querySelectorAll('.shop-price,.shop-item-card .mini-badge').forEach(el=>{el.style.color='#fff'; el.style.webkitTextFillColor='#fff';});
    document.querySelectorAll('.shop-item-card').forEach(card=>{const id=card.dataset.shopBuy||''; if(id&&id.startsWith('tm_')&&!card.querySelector('[data-p2fp-tm-info]')) card.insertAdjacentHTML('beforeend',`<button type="button" class="tm-info-btn" data-p2fp-tm-info="${esc(id)}">설명</button>`);});
    // bag TM desc buttons
    document.querySelectorAll('[data-select-item]').forEach(card=>{const id=card.dataset.selectItem||''; if(id.startsWith('tm_')&&!card.querySelector('[data-p2fp-tm-info]')) card.insertAdjacentHTML('beforeend',`<button type="button" class="tm-info-btn" data-p2fp-tm-info="${esc(id)}">설명</button>`);});
    // egg shard message
    document.querySelectorAll('.toast,.system-toast').forEach(t=>{if((t.textContent||'').includes('배틀 중 가방')) t.textContent='이 아이템은 알 제작에 사용됩니다';});
    updateChatButton();
    const craft=document.getElementById('crafting-panel-v2'); if(craft){const p=curPlayer(); const count=(p?.bag?.consumables||[]).find(x=>norm(x.id)==='huge_egg_shard')?.amount||0; const para=craft.querySelector('p'); if(para) para.textContent='알 조각으로 교환, 파편과 지식으로 희귀 지닌물건을 랜덤 제작합니다'; if(!craft.querySelector('[data-craft-huge-egg]')) craft.querySelector('.online-mini-row')?.insertAdjacentHTML('beforeend',`<button class="chip-btn" data-craft-huge-egg="1">거대알 교환 (${count}/10)</button>`); }
  }
  function showTmInfo(id){const item=core()?.state?.itemsById?.get?.(norm(id))||(core()?.state?.itemList||[]).find(x=>norm(x.id)===norm(id)); if(!item)return; openModal(item.nameKo||'기술머신',`<p>${esc(item.description||'설명이 없습니다.')}</p><p>${esc(item.battleEffect||'')}</p>`);}


  function renderBattleEndStats(payload){
    const stats=payload?.stats||{};
    const rows=Object.values(stats).map(st=>`<tr><td>${esc(st.name||st.pokemonName||'포켓몬')}</td><td>${Number(st.damageDealt||0)}</td><td>${Number(st.survivedDamage||st.damageTaken||0)}</td></tr>`).join('')||'<tr><td colspan="3">통계 없음</td></tr>';
    const grid=document.getElementById('battle-action-grid');
    const html=`<div class="p2fp-endstats"><h3>배틀 통계</h3><table><thead><tr><th>포켓몬</th><th>딜량</th><th>버틴피해</th></tr></thead><tbody>${rows}</tbody></table><button class="action-button" data-battle-exit-lobby="1"><span class="action-title">나가기</span><span class="action-sub">로비로 돌아갑니다.</span></button></div>`;
    if(grid) grid.innerHTML=html; else openModal('배틀 통계',html);
  }
  function patchBattleEndManual(){
    if(!PB.battleEngine||PB.battleEngine.__fullPvpEndPatch) return;
    PB.battleEngine.__fullPvpEndPatch=true;
    const oldStart=PB.battleEngine.startBattle;
    PB.battleEngine.startBattle=function(opts){
      const options={...(opts||{})};
      const oldComplete=options.onComplete;
      options.onComplete=function(payload){
        let handled=false;
        try{ if(typeof oldComplete==='function') handled=oldComplete(payload)||false; }catch(e){console.warn(e);}
        try{ const opt=payload?.options||{}; if(payload?.winnerId==='p1' && opt.mode==='dungeon' && opt.theme==='distortion') core()?.addConsumable?.('p1','huge_egg_shard',1); if(payload?.winnerId==='p1' && opt.mode==='challenge'){ const ch=curChar(); const badges=Object.keys(ch?.challenge?.badges||{}).length; if(badges>=8 && !ch.challenge.__fullPvpRewardFixed){ ch.challenge.__fullPvpRewardFixed=true; core()?.addConsumable?.('p1','rare_candy',27); core()?.addMoney?.('p1',2500); window.PB_ONLINE_V3?.saveCharacter?.(); } } }catch(e){}
        setTimeout(()=>renderBattleEndStats(payload),250);
        return true;
      };
      return oldStart.call(this,options);
    };
    document.addEventListener('click',e=>{ if(e.target.closest('[data-battle-exit-lobby]')){ e.preventDefault(); core().state.currentScreen='lobby'; PB.ui?.renderAll?.(); closePvp(); }},true);
  }

  function bindGlobal(){
    interceptBattleClicks(); patchNicknameChange();
    document.addEventListener('click',async(e)=>{
      const m=e.target.closest('[data-p2fp-show-moves]'); if(m){e.preventDefault();e.stopImmediatePropagation();showMovesModal(m.dataset.p2fpShowMoves);return;}
      const c=e.target.closest('[data-p2fp-close-modal]'); if(c){const root=document.getElementById('modal-root'); if(root)root.innerHTML='';return;}
      const tm=e.target.closest('[data-p2fp-tm-info]'); if(tm){e.preventDefault();e.stopImmediatePropagation();showTmInfo(tm.dataset.p2fpTmInfo);return;}
      const huge=e.target.closest('[data-craft-huge-egg]'); if(huge){e.preventDefault();e.stopImmediatePropagation();craftHugeEgg();return;}
      const chatBtn=e.target.closest('#open-chat-btn'); if(chatBtn){e.preventDefault();e.stopImmediatePropagation();renderOnlineChat();return;}
      const send=e.target.closest('[data-chat-send]'); if(send){await sendChat(); renderOnlineChat();return;}
      const rep=e.target.closest('[data-chat-reply]'); if(rep){PATCH.replyTo=rep.dataset.chatReply; renderOnlineChat();return;}
      if(e.target.closest('[data-chat-reply-clear]')){PATCH.replyTo=null; renderOnlineChat();return;}
    },true);
  }
  function injectCss(){if(document.getElementById('phase2-full-pvp-patch-style'))return; const st=document.createElement('style'); st.id='phase2-full-pvp-patch-style'; st.textContent=`
    body.theme-basic{background:#050914!important} body:not(.theme-basic){background:#050914!important;color:#fff}.screen,.app-shell,.content-scroll{background-color:#050914!important}.theme-basic .app-shell,.theme-basic .screen{background:#050914!important;color:#fff!important}
    .blood-block{display:inline-flex!important;align-items:center;justify-content:center;border-radius:999px!important;padding:3px 8px!important;font-size:11px!important;font-weight:1000!important;color:#06101f!important;text-shadow:none!important;box-shadow:none!important;filter:none!important;background-image:none!important;line-height:1.2!important}.blood-block-gray{background:#c6cbd4!important}.blood-block-blue{background:#56bfff!important}.blood-block-gold{background:#ffd650!important}.blood-block-purple{background:#b777ff!important}.bloodline-text-v3,.battle-bloodline-v3,.p2-blood,.rt-blood{animation:none!important;text-shadow:none!important;box-shadow:none!important;filter:none!important}
    .stat-value.is-best,.pokemon-stat-value.is-best,.squad-stat-value.is-best,[data-best-stat="1"]{color:#ff8a00!important;-webkit-text-fill-color:#ff8a00!important;border:0!important;box-shadow:none!important;text-shadow:none!important;font-weight:1000!important}.battle-action-grid .action-button,.battle-action-grid .action-button span,.battle-action-grid .action-button small,.battle-move-button,.battle-move-button *:not(.type-badge):not(.battle-category-pill){color:#050b18!important;-webkit-text-fill-color:#050b18!important;text-shadow:none!important}.battle-matchup{font-weight:1000!important}.p2fp-wait{padding:18px;border-radius:16px;background:rgba(255,255,255,.92);color:#06101f!important;font-weight:1000;text-align:center}.item-title-yellow-only{color:#ffd95b!important;-webkit-text-fill-color:#ffd95b!important}.shop-item-card h3{color:#050b18!important;-webkit-text-fill-color:#050b18!important}.shop-price,.shop-item-card .mini-badge{color:#fff!important;-webkit-text-fill-color:#fff!important;background:rgba(0,0,0,.65)!important}.tm-info-btn{margin-top:6px;border:1px solid rgba(0,0,0,.2);border-radius:10px;background:rgba(255,255,255,.9);color:#06101f!important;font-weight:1000;padding:5px 8px}.p2fp-type{display:inline-flex;border-radius:999px;padding:2px 6px;margin:0 2px;color:#fff;font-size:10px;font-weight:1000}.p2-presence.online{color:#6dff9b!important}.p2-presence.offline{color:#bbb!important}.p2-player-row .p2-grow>b{color:#ffd95b!important}.p2-me-row .p2-grow>b{color:#fff!important}.p2fp-move-row{border:1px solid rgba(255,255,255,.14);border-radius:12px;padding:8px;margin:6px 0;background:rgba(255,255,255,.06)}.p2fp-move-row b,.p2fp-move-row span,.p2fp-move-row p{color:#fff!important}.p2fp-chat-list{max-height:54vh;overflow:auto;display:grid;gap:8px}.p2fp-chat-msg{border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.07);border-radius:14px;padding:8px}.p2fp-chat-msg b{color:#ffd95b!important}.p2fp-chat-msg small{margin-left:6px;color:#bbb!important}.p2fp-chat-msg p{color:#fff!important;margin:5px 0 0}.p2fp-chat-msg blockquote{margin:6px 0;padding:6px;border-left:3px solid #7edcff;background:rgba(126,220,255,.08);color:#dff8ff!important}.p2fp-reply,.p2fp-chat-replying button{float:right;border:0;border-radius:999px;background:#fff;color:#06101f;font-weight:900;padding:2px 7px}.p2fp-chat-replying{margin:8px 0;color:#fff!important}#p2fp-chat-input{width:100%;min-height:72px;border-radius:14px;border:1px solid rgba(126,207,255,.26);background:rgba(0,0,0,.28);color:#fff;padding:10px;margin:8px 0}.chat-alert-dot{display:inline-block;width:9px;height:9px;border-radius:50%;background:#ff2d3d;margin-left:5px;box-shadow:0 0 0 2px rgba(0,0,0,.8)}.p2fp-endstats{width:100%;background:rgba(255,255,255,.92);border-radius:18px;padding:12px;color:#06101f!important}.p2fp-endstats h3{margin:0 0 8px;color:#06101f!important}.p2fp-endstats table{width:100%;border-collapse:collapse;color:#06101f!important}.p2fp-endstats th,.p2fp-endstats td{padding:6px;border-bottom:1px solid rgba(0,0,0,.1);color:#06101f!important;text-align:left}.p2fp-endstats .action-button{margin-top:10px;color:#06101f!important}
  `; document.head.appendChild(st);}
  function init(){if(!PB.core||!PB.ui||!PB.battleEngine){setTimeout(init,120);return;} injectCss(); bindGlobal(); ensureItemPatches(); patchTmLearn(); patchEggBuying(); syncEggStacks(); patchBattleEndManual(); subscribeChat(); presence(); patchChallengeReward(); if(window.PB_REALTIME_PVP){window.PB_REALTIME_PVP.enterRoom=enterSameUiRoom; window.PB_REALTIME_PVP.close=closePvp;} /* v8: recurring decorate disabled */ setTimeout(decorate,300);}
  document.addEventListener('DOMContentLoaded',()=>setTimeout(init,800));
})();
