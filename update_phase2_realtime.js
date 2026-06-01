(function(){
  'use strict';
  const PB = window.POKEBATTLE || (window.POKEBATTLE = {});
  const RT = PB.realtimePvp = PB.realtimePvp || { activeRoomId:null, room:null, unsub:null, settling:{} };
  const TYPE_COLOR = { 노말:'#a8a878', 불꽃:'#f08030', 물:'#6890f0', 전기:'#f8d030', 풀:'#78c850', 얼음:'#98d8d8', 격투:'#c03028', 독:'#a040a0', 땅:'#e0c068', 비행:'#a890f0', 에스퍼:'#f85888', 벌레:'#a8b820', 바위:'#b8a038', 고스트:'#705898', 드래곤:'#7038f8', 악:'#705848', 강철:'#b8b8d0' };
  function core(){ return PB.core; }
  function online(){ return PB.online || {}; }
  function db(){ return online().db || null; }
  function uid(){ return online().uid || null; }
  function slot(){ return online().selectedSlot || 'char1'; }
  function myKey(){ return uid() ? `${uid()}_${slot()}` : ''; }
  function curChar(){ return online().selectedCharacter || null; }
  function curPlayer(){ return core()?.getPlayer?.('p1') || null; }
  function esc(v){ return String(v ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function now(){ return Date.now(); }
  function toast(msg){ PB.ui?.showToast?.(msg); }
  function getBaseById(id){ return core()?.state?.pokemonById?.get?.(Number(id)); }
  function pName(p){ return p?.currentName || p?.name || p?.base?.nameKo || p?.nameKo || '포켓몬'; }
  function getHeldNames(p){ const arr=p?.heldItems||[]; return arr.length?arr.map(it=>it.nameKo||it.name||it.id).join(', '):'없음'; }
  function bloodLabel(v){ const s=String(v||'normal'); if(s.includes('우수')||['elite','superior','great','blue'].includes(s)) return '우수혈통'; if(s.includes('고대')||['ancient','gold'].includes(s)) return '고대혈통'; if(s.includes('뮤')||['mew','mew_descendant','purple'].includes(s)) return '뮤의 후손'; return '일반혈통'; }
  function bloodClass(v){ const l=bloodLabel(v); return l.includes('우수')?'rt-blood-blue':l.includes('고대')?'rt-blood-gold':l.includes('뮤')?'rt-blood-purple':'rt-blood-gray'; }
  function bloodBadge(v){ return `<span class="rt-blood ${bloodClass(v)}">${esc(bloodLabel(v))}</span>`; }
  function typeBadge(t){ return `<span class="rt-type" style="background:${TYPE_COLOR[t]||'#778'}">${esc(t)}</span>`; }
  function alive(mon){ return mon && Number(mon.currentHp||0)>0; }
  function firstAlive(team){ return Math.max(0, (team||[]).findIndex(alive)); }
  function current(room, k){ const i = Number(room?.pvp?.active?.[k] || 0); return room?.pvp?.teams?.[k]?.[i] || null; }
  function opponentKey(room){ const k=myKey(); if(room?.challengerKey===k) return room.targetKey; if(room?.targetKey===k) return room.challengerKey; return ''; }
  function isParticipant(room){ const k=myKey(); return room && (room.challengerKey===k || room.targetKey===k); }
  function serializeRuntimePokemon(p){
    if(!p?.base) return null;
    const stats = { hp:Number(p.maxHp||p.hp||1), attack:Number(p.attack||p.stats?.attack||p.base?.stats?.attack||20), defense:Number(p.defense||p.stats?.defense||p.base?.stats?.defense||20), spAttack:Number(p.spAttack||p.stats?.spAttack||p.base?.stats?.spAttack||20), spDefense:Number(p.spDefense||p.stats?.spDefense||p.base?.stats?.spDefense||20), speed:Number(p.speed||p.stats?.speed||p.base?.stats?.speed||20) };
    return { uid:p.uid||`p_${p.base.id}_${Math.random().toString(36).slice(2,8)}`, sourceUid:p.sourceUid||p.uid||'', baseId:Number(p.base.id||p.id||0), name:pName(p), level:Math.min(100,Number(p.level||5)), types:(p.base.type||[]).slice(0,2), stats, maxHp:Number(p.maxHp||stats.hp||1), currentHp:Number(p.currentHp??p.maxHp??stats.hp??1), status:p.status||'', bloodline:p.bloodline||'normal', heldItems:(p.heldItems||(p.heldItem?[p.heldItem]:[])).map(it=>({id:it.id||'', nameKo:it.nameKo||it.name||it.id||'지닌물건'})), moves:(p.moves||[]).slice(0,4).map(m=>({id:m.id||m.nameKo||m.name||'', nameKo:m.nameKo||m.name||'기술', type:m.type||'노말', category:m.category||'물리', power:Number(m.power||0), accuracy:Number(m.accuracy??100), priority:Number(m.priority||0), description:m.description||''})), koCount:Number(p.koCount||0), koStars:Number(p.koStars||0), damageDealt:Number(p.competitiveDamageDealt||p.damageDealt||0), damageTaken:Number(p.competitiveDamageTaken||p.damageTaken||0), isShiny:Boolean(p.isShiny) };
  }
  function runtimeFromCompact(data){
    const c=core(), base=getBaseById(data?.baseId); if(!c||!base) return null;
    const p=c.createRuntimePokemon(base, Math.min(100,Number(data.level||5)));
    p.uid=data.uid||p.uid; p.currentName=data.name||p.currentName; p.bloodline=data.bloodline||p.bloodline||'normal'; p.heldItems=Array.isArray(data.heldItems)?data.heldItems.map(it=>({...it})):[]; p.heldItem=p.heldItems[0]||null; if(Array.isArray(data.moves)&&data.moves.length) p.moves=data.moves.slice(0,4).map(m=>({...m})); if(data.enhanceLevel) p.enhanceLevel=Number(data.enhanceLevel||0); c.recalculateRuntimeStats?.(p,{fullHeal:true}); return p;
  }
  function getMyBattleTeam(){
    const team=(curPlayer()?.squad||[]).slice(0,3).map(p=>{ const clone=runtimeFromCompact({ baseId:p.base?.id||p.baseId, level:p.level, uid:p.uid, name:pName(p), bloodline:p.bloodline, heldItems:p.heldItems||[], moves:p.moves||[], enhanceLevel:p.enhanceLevel }); if(clone){ clone.sourceUid=p.uid; return serializeRuntimePokemon(clone); } return serializeRuntimePokemon(p); }).filter(Boolean);
    return team;
  }
  function getPublicTeam(pub){
    const data=(pub?.battleTeam||pub?.squad||[]).slice(0,3);
    return data.map(x=>{ const r=runtimeFromCompact(x); return r ? serializeRuntimePokemon(r) : null; }).filter(Boolean);
  }
  function initPvpState(room){
    const challengerTeam = room.challengerKey===myKey() ? getMyBattleTeam() : getPublicTeam(room.challenger);
    const targetTeam = room.targetKey===myKey() ? getMyBattleTeam() : getPublicTeam(room.target);
    return { version:1, phase:'select', turn:1, teams:{ [room.challengerKey]:challengerTeam, [room.targetKey]:targetTeam }, active:{ [room.challengerKey]:0, [room.targetKey]:0 }, actions:{}, usedItems:{}, log:['실시간 배틀 시작!'], createdAt:now(), updatedAt:now() };
  }
  async function enterRoom(id){
    const d=db(); if(!d){ toast('Firebase 연결 후 이용하세요.'); return; }
    const room = PB.phase2Online?.rooms?.[id] || RT.room;
    if(!room || !isParticipant(room)){ toast('배틀방을 찾을 수 없습니다.'); return; }
    RT.activeRoomId = id;
    if(RT.unsub){ try{ RT.unsub.off(); }catch(e){} RT.unsub=null; }
    const ref=d.ref(`battleRooms/${id}`);
    RT.unsub=ref;
    ref.on('value', snap=>{ RT.room={ id, ...(snap.val()||{}) }; render(); maybeSettleLocal(RT.room); });
    await ref.transaction(cur=>{
      if(!cur) return cur;
      if(!cur.pvp){ cur.pvp=initPvpState(cur); cur.status='inProgress'; cur.updatedAt=now(); }
      else if(cur.status==='accepted'){ cur.status='inProgress'; cur.updatedAt=now(); }
      return cur;
    });
    render();
  }
  function close(){ if(RT.unsub){ try{ RT.unsub.off(); }catch(e){} } RT.unsub=null; RT.activeRoomId=null; RT.room=null; const el=document.getElementById('rt-pvp-screen'); if(el) el.remove(); }
  function render(){
    const room=RT.room; if(!room || !RT.activeRoomId) return;
    let root=document.getElementById('rt-pvp-screen'); if(!root){ root=document.createElement('div'); root.id='rt-pvp-screen'; document.body.appendChild(root); }
    const my=myKey(), opp=opponentKey(room), pvp=room.pvp||{};
    const myTeam=pvp.teams?.[my]||[], oppTeam=pvp.teams?.[opp]||[];
    const myMon=current(room,my), oppMon=current(room,opp);
    const myAction=pvp.actions?.[my], oppAction=pvp.actions?.[opp];
    const phase=pvp.phase||'select';
    const status=room.status==='completed'||phase==='completed' ? renderCompleted(room) : myAction ? renderWaiting(Boolean(oppAction)) : renderActionPanel(room,myMon,oppMon,myTeam);
    root.innerHTML = `<div class="rt-shell"><div class="rt-head"><b>${room.mode==='champion'?'챔피언 실시간 배틀':'실시간 친선배틀'}</b><span>${esc(room.challenger?.characterName||'P1')} vs ${esc(room.target?.characterName||'P2')}</span><button class="rt-close" data-rt-close="1">나가기</button></div><div class="rt-arena"><div class="rt-side enemy">${renderMonCard(oppMon, oppTeam, '상대')}</div><div class="rt-vs">TURN ${Number(pvp.turn||1)}</div><div class="rt-side ally">${renderMonCard(myMon, myTeam, '나')}</div></div><div class="rt-log">${(pvp.log||[]).slice(-7).map(l=>`<div>${esc(l)}</div>`).join('')}</div><div class="rt-actions">${status}</div></div>`;
  }
  function renderCompleted(room){ const won=room.result?.winnerKey===myKey(); return `<div class="rt-message ${won?'win':'lose'}">${won?'승리!':'패배'}<br><small>결과가 저장되었습니다.</small></div><button class="rt-btn" data-rt-close="1">로비로 돌아가기</button>`; }
  function renderWaiting(oppReady){ return `<div class="rt-message">${oppReady?'턴을 계산하는 중...':'상대방이 선택하는 중'}</div><button class="rt-btn alt" data-rt-cancel-action="1">선택 취소</button>`; }
  function renderMonCard(mon, team, label){
    if(!mon) return `<div class="rt-mon-card"><h3>${label}</h3><p>포켓몬 없음</p></div>`;
    const hp=Math.max(0,Number(mon.currentHp||0)), max=Math.max(1,Number(mon.maxHp||1));
    const pct=Math.max(0,Math.min(100,Math.round(hp/max*100)));
    const types=(mon.types||[]).map(typeBadge).join('');
    const left=(team||[]).filter(alive).length;
    return `<div class="rt-mon-card"><div class="rt-mon-top"><h3>${esc(mon.name)}</h3><span>Lv.${Number(mon.level||5)}</span></div><div>${types} ${bloodBadge(mon.bloodline)}</div><div class="rt-held">지닌물건 ${esc(getHeldNames(mon))}</div><div class="rt-hp"><i style="width:${pct}%"></i></div><div class="rt-hp-text">HP ${hp}/${max} · 남은 포켓몬 ${left}</div></div>`;
  }
  function renderActionPanel(room,myMon,oppMon,myTeam){
    if(!myMon || !oppMon) return '<div class="rt-message">교체할 포켓몬을 기다리는 중</div>';
    const moves=(myMon.moves||[]).slice(0,4).map((m,i)=>{ const eff=getEffectiveness(m.type, oppMon); const label=eff>1?'강함':eff<1?'불리':'보통'; const cls=eff>1?'good':eff<1?'bad':'normal'; return `<button class="rt-btn move" data-rt-move="${i}"><b>${esc(m.nameKo||m.name||'기술')}</b><small>${esc(m.type||'노말')} · ${label}</small></button>`; }).join('') || '<span>기술 없음</span>';
    const switches=(myTeam||[]).map((m,i)=> i!==Number(room.pvp?.active?.[myKey()]||0)&&alive(m)?`<button class="rt-btn alt" data-rt-switch="${i}">${esc(m.name)} 교체</button>`:'').join('');
    const itemUsed=room.pvp?.usedItems?.[myKey()];
    const items=itemUsed?'<span class="rt-muted">아이템 사용 완료</span>':`<button class="rt-btn item" data-rt-item="good_potion">고급상처약</button><button class="rt-btn item" data-rt-item="revive_shard">기력의조각</button>`;
    return `<div class="rt-action-section"><h4>기술</h4><div class="rt-grid">${moves}</div></div><div class="rt-action-section"><h4>교체</h4><div class="rt-grid">${switches || '<span class="rt-muted">교체 가능 없음</span>'}</div></div><div class="rt-action-section"><h4>아이템</h4><div class="rt-grid">${items}</div></div>`;
  }
  function getEffectiveness(type, defender){
    let mult=1; const chart=core()?.state?.typeEffectiveness?.[type]||{}; (defender?.types||[]).forEach(dt=>{ if(Object.prototype.hasOwnProperty.call(chart.강함||{},dt)) mult*=Number(chart.강함[dt]||1); if(Object.prototype.hasOwnProperty.call(chart.약함||{},dt)) mult*=Number(chart.약함[dt]||1); if(Object.prototype.hasOwnProperty.call(chart.무효||{},dt)) mult*=Number(chart.무효[dt]||0); }); return mult;
  }
  async function chooseAction(action){
    const id=RT.activeRoomId, d=db(), k=myKey(); if(!id||!d) return;
    const ref=d.ref(`battleRooms/${id}`);
    await ref.transaction(room=>{
      if(!room?.pvp || room.pvp.phase==='completed') return room;
      room.pvp.actions = room.pvp.actions || {};
      room.pvp.actions[k] = { ...action, at:now() };
      room.pvp.updatedAt=now();
      const a=room.pvp.actions[room.challengerKey], b=room.pvp.actions[room.targetKey];
      if(a && b && room.pvp.phase==='select') resolveTurn(room);
      return room;
    });
  }
  async function cancelAction(){ const id=RT.activeRoomId,d=db(),k=myKey(); if(!id||!d) return; await d.ref(`battleRooms/${id}/pvp/actions/${k}`).remove().catch(()=>{}); }
  function resolveTurn(room){
    const pvp=room.pvp, k1=room.challengerKey, k2=room.targetKey;
    const acts=[{k:k1,a:pvp.actions?.[k1]},{k:k2,a:pvp.actions?.[k2]}].filter(x=>x.a);
    acts.sort((x,y)=> actionPriority(y,room)-actionPriority(x,room) || monSpeed(y.k,room)-monSpeed(x.k,room));
    const log=[...(pvp.log||[]), `턴 ${Number(pvp.turn||1)}`];
    acts.forEach(x=>applyAction(room,x.k,x.a,log));
    [k1,k2].forEach(k=>{ const idx=Number(pvp.active?.[k]||0); if(!alive(pvp.teams?.[k]?.[idx])){ const next=firstAlive(pvp.teams?.[k]||[]); if(next>=0){ pvp.active[k]=next; log.push(`${pvp.teams[k][next].name}(이)가 나왔다!`); } } });
    const k1Alive=(pvp.teams?.[k1]||[]).some(alive), k2Alive=(pvp.teams?.[k2]||[]).some(alive);
    if(!k1Alive || !k2Alive){ const winnerKey=k1Alive?k1:k2; const winnerPub=winnerKey===room.challengerKey?room.challenger:room.target; pvp.phase='completed'; room.status='completed'; room.result={ winnerKey, winnerName:winnerPub?.characterName||'', completedAt:now(), realtime:true }; if(room.mode==='champion' && winnerKey===room.challengerKey) room.championChanged=true; log.push(`${winnerPub?.characterName||'승자'} 승리!`); }
    else { pvp.phase='select'; pvp.turn=Number(pvp.turn||1)+1; pvp.actions={}; }
    pvp.log=log.slice(-24); pvp.updatedAt=now(); room.updatedAt=now();
  }
  function actionPriority(x,room){ if(!x?.a) return 0; if(x.a.kind==='item') return 3000; if(x.a.kind==='switch') return 2000; const mon=current(room,x.k); const move=mon?.moves?.[Number(x.a.moveIndex||0)]||{}; return 1000+Number(move.priority||0)*100; }
  function monSpeed(k,room){ const mon=current(room,k); return Number(mon?.stats?.speed||mon?.speed||0); }
  function applyAction(room,k,a,log){ const pvp=room.pvp, other=k===room.challengerKey?room.targetKey:room.challengerKey; const mon=current(room,k), target=current(room,other); if(!mon || !alive(mon)) return; if(a.kind==='item'){ applyItem(room,k,a.itemId,log); return; } if(a.kind==='switch'){ const to=Number(a.to||0); if(pvp.teams?.[k]?.[to] && alive(pvp.teams[k][to])){ pvp.active[k]=to; log.push(`${mon.name} 교체 → ${pvp.teams[k][to].name}`); } return; } if(!target || !alive(target)) return; const move=mon.moves?.[Number(a.moveIndex||0)]||mon.moves?.[0]; if(!move){ log.push(`${mon.name}은(는) 행동하지 못했다.`); return; } const power=Number(move.power||0); if(power<=0){ log.push(`${mon.name}의 ${move.nameKo||move.name}!`); return; } const eff=getEffectiveness(move.type,target); const atkCat=String(move.category||'물리'); const atk=atkCat.includes('특')?Number(mon.stats?.spAttack||20):Number(mon.stats?.attack||20); const def=atkCat.includes('특')?Number(target.stats?.spDefense||20):Number(target.stats?.defense||20); const stab=(mon.types||[]).includes(move.type)?1.5:1; let dmg=Math.floor((((2*Number(mon.level||5)/5+2)*power*Math.max(1,atk)/Math.max(1,def))/50+2)*stab*eff*(0.9+Math.random()*0.1)); if(eff>0) dmg=Math.max(1,dmg); else dmg=0; target.currentHp=Math.max(0,Number(target.currentHp||0)-dmg); mon.damageDealt=Number(mon.damageDealt||0)+dmg; target.damageTaken=Number(target.damageTaken||0)+dmg; const effText=eff>1?' 효과가 굉장했다!':eff===0?' 효과가 없었다...':eff<1?' 효과가 별로였다.':''; log.push(`${mon.name}의 ${move.nameKo||move.name}! ${target.name}에게 ${dmg} 피해.${effText}`); if(!alive(target)){ mon.koCount=Number(mon.koCount||0)+1; mon.koStars=Math.min(5,Math.floor(Number(mon.koCount||0)/10)); log.push(`${target.name} 쓰러졌다!`); } }
  function applyItem(room,k,id,log){ const pvp=room.pvp; pvp.usedItems=pvp.usedItems||{}; if(pvp.usedItems[k]){ log.push('이미 아이템을 사용했다.'); return; } const team=pvp.teams?.[k]||[]; if(id==='revive_shard'){ const target=team.find(m=>!alive(m)); if(target){ target.currentHp=Math.max(1,Math.floor(Number(target.maxHp||1)*0.5)); log.push(`${target.name} 부활!`); pvp.usedItems[k]=id; } else log.push('부활할 포켓몬이 없다.'); return; } const mon=current(room,k); if(mon){ const heal=Math.max(20,Math.floor(Number(mon.maxHp||1)*0.45)); mon.currentHp=Math.min(Number(mon.maxHp||1),Number(mon.currentHp||0)+heal); log.push(`${mon.name} HP ${heal} 회복!`); pvp.usedItems[k]=id; } }
  async function maybeSettleLocal(room){
    if(!room || room.status!=='completed' || !room.result?.winnerKey || !isParticipant(room)) return;
    const settleKey=`rt_pvp_settled_${room.id}_${myKey()}`; if(localStorage.getItem(settleKey)) return; if(RT.settling[settleKey]) return; RT.settling[settleKey]=true;
    try{
      const won=room.result.winnerKey===myKey(); const ch=curChar(); ch.onlinePvp=ch.onlinePvp||{wins:0,losses:0}; if(won) ch.onlinePvp.wins=Number(ch.onlinePvp.wins||0)+1; else ch.onlinePvp.losses=Number(ch.onlinePvp.losses||0)+1;
      if(room.mode==='friendly' && Number(room.wager||0)>0){ if(won) core()?.addMoney?.('p1',Number(room.wager||0)); else core()?.spendMoney?.('p1',Number(room.wager||0)); }
      if(room.mode==='champion' && room.championChanged && room.result.winnerKey===room.challengerKey){ await db()?.ref('competitive/champion').set({ ...room.challenger, championSince:now(), championCount:Number(room.challenger?.championCount||0)+1, reason:'realtimeChallengeWin' }).catch(()=>{}); }
      core()?.healPlayerTeam?.('p1'); if(window.PB_ONLINE_V3?.saveCharacter) await window.PB_ONLINE_V3.saveCharacter();
      localStorage.setItem(settleKey,'1');
    } catch(e){ console.warn('실시간 배틀 정산 실패',e); }
    finally{ RT.settling[settleKey]=false; }
  }
  function bind(){
    document.addEventListener('click',e=>{
      const closeBtn=e.target.closest('[data-rt-close]'); if(closeBtn){ close(); return; }
      const mv=e.target.closest('[data-rt-move]'); if(mv){ chooseAction({kind:'move',moveIndex:Number(mv.dataset.rtMove||0)}); return; }
      const sw=e.target.closest('[data-rt-switch]'); if(sw){ chooseAction({kind:'switch',to:Number(sw.dataset.rtSwitch||0)}); return; }
      const it=e.target.closest('[data-rt-item]'); if(it){ chooseAction({kind:'item',itemId:it.dataset.rtItem}); return; }
      if(e.target.closest('[data-rt-cancel-action]')){ cancelAction(); return; }
    },true);
  }
  function injectStyles(){ if(document.getElementById('rt-pvp-style')) return; const st=document.createElement('style'); st.id='rt-pvp-style'; st.textContent=`
    #rt-pvp-screen{position:fixed;inset:0;z-index:10000;background:radial-gradient(circle at 50% 20%,rgba(38,128,220,.22),transparent 40%),linear-gradient(180deg,#051423,#030711);color:#fff;padding:12px;overflow:auto}.rt-shell{max-width:760px;margin:0 auto;min-height:100%;display:flex;flex-direction:column;gap:10px}.rt-head{display:flex;align-items:center;justify-content:space-between;gap:10px;border:1px solid rgba(120,210,255,.32);background:rgba(255,255,255,.08);border-radius:18px;padding:10px 12px}.rt-close,.rt-btn{border:1px solid rgba(126,207,255,.34);background:rgba(255,255,255,.92);color:#051426!important;border-radius:14px;padding:9px 10px;font-weight:1000}.rt-btn.alt{background:rgba(126,207,255,.18);color:#fff!important}.rt-arena{display:grid;grid-template-columns:1fr;gap:10px}.rt-vs{text-align:center;font-weight:1000;color:#8edcff}.rt-mon-card{border:1px solid rgba(126,207,255,.28);border-radius:22px;padding:12px;background:linear-gradient(180deg,rgba(120,70,210,.35),rgba(40,20,80,.34));box-shadow:0 16px 34px rgba(0,0,0,.28)}.rt-mon-top{display:flex;align-items:center;justify-content:space-between;gap:10px}.rt-mon-top h3{margin:0;color:#fff}.rt-type{display:inline-flex;border-radius:999px;padding:2px 7px;margin:3px 3px 3px 0;font-size:11px;color:#fff;font-weight:1000}.rt-held,.rt-hp-text,.rt-muted{color:rgba(255,255,255,.75);font-size:12px;font-weight:800}.rt-hp{height:12px;background:rgba(0,0,0,.38);border-radius:999px;overflow:hidden;margin:8px 0}.rt-hp i{display:block;height:100%;background:linear-gradient(90deg,#34d369,#c8ff79);border-radius:999px}.rt-log{border:1px solid rgba(255,255,255,.14);border-radius:18px;padding:10px;background:rgba(0,0,0,.32);min-height:120px;font-weight:800}.rt-actions{border:1px solid rgba(126,207,255,.28);border-radius:20px;padding:10px;background:rgba(255,255,255,.08)}.rt-action-section{margin-bottom:10px}.rt-action-section h4{margin:0 0 6px;color:#fff}.rt-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.rt-btn.move{text-align:left}.rt-btn.move small{display:block;color:#333;font-weight:900}.rt-message{text-align:center;font-size:20px;font-weight:1000;padding:18px;color:#fff}.rt-message.win{color:#8dffbc}.rt-message.lose{color:#ff9d9d}.rt-blood{display:inline-flex;border-radius:999px;padding:3px 8px;font-size:11px;font-weight:1000;color:#050b18!important;text-shadow:none!important;box-shadow:none!important}.rt-blood-gray{background:#c6cbd4!important}.rt-blood-blue{background:#61c8ff!important}.rt-blood-gold{background:#ffd75e!important}.rt-blood-purple{background:#bd8cff!important}
    .battle-matchup{font-weight:1000!important}.battle-matchup:has(*){color:inherit}.battle-action-grid .action-button,.battle-action-grid .action-button span,.battle-move-button,.battle-move-button :not(.type-badge):not(.battle-category-pill){color:#050b18!important;-webkit-text-fill-color:#050b18!important;text-shadow:none!important}.stat-value.is-best{color:#ff8a00!important;-webkit-text-fill-color:#ff8a00!important;border:0!important;box-shadow:none!important;text-shadow:none!important}.item-title-row h3,.item-title-row span,.items-category-title{color:#ffd95b!important}.bloodline-text-v3,.battle-bloodline-v3,.p2-blood{box-shadow:none!important;text-shadow:none!important;filter:none!important;background-image:none!important;color:#06101f!important}.bloodline-text-v3{border-radius:999px!important;padding:3px 8px!important}
  `; document.head.appendChild(st); }
  function decorate(){
    document.querySelectorAll('.battle-matchup').forEach(n=>{ const t=n.textContent||''; if(t.includes('강함')) n.style.color='#159447'; else if(t.includes('약함')||t.includes('불리')) n.style.color='#e27c7c'; else n.style.color='#050b18'; });
    document.querySelectorAll('.bloodline-text-v3,.battle-bloodline-v3').forEach(el=>{ const t=el.textContent||''; let bg='#c6cbd4'; if(t.includes('우수')) bg='#61c8ff'; else if(t.includes('고대')) bg='#ffd75e'; else if(t.includes('뮤')) bg='#bd8cff'; el.style.background=bg; el.style.color='#06101f'; el.style.boxShadow='none'; el.style.textShadow='none'; });
  }
  function init(){ injectStyles(); bind(); /* v8: recurring decorate disabled */ }
  document.addEventListener('DOMContentLoaded',()=>setTimeout(init,360));
  window.PB_REALTIME_PVP = { enterRoom, close };
})();
