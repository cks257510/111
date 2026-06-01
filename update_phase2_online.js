(function(){
  'use strict';
  const PB = window.POKEBATTLE || (window.POKEBATTLE = {});
  const PHASE2 = PB.phase2Online = PB.phase2Online || {
    ready:false,
    players:{},
    champion:null,
    rooms:{},
    listings:{},
    rankings:{ko:{},damage:{},tank:{}},
    tab:'ranked',
    playerMarketPage:0,
    onlineListReady:false,
    roomAutoStarted:{},
    lastWagerPrompt:100
  };
  const TABS = [
    ['ranked','경쟁전'], ['players','플레이어'], ['champion','챔피언'], ['friendly','친선배틀'],
    ['challenge','챌린지'], ['market','시스템마켓'], ['playerMarket','플레이어마켓'], ['rankings','랭킹']
  ];
  const TYPE_COLOR = { 노말:'#a8a878', 불꽃:'#f08030', 물:'#6890f0', 전기:'#f8d030', 풀:'#78c850', 얼음:'#98d8d8', 격투:'#c03028', 독:'#a040a0', 땅:'#e0c068', 비행:'#a890f0', 에스퍼:'#f85888', 벌레:'#a8b820', 바위:'#b8a038', 고스트:'#705898', 드래곤:'#7038f8', 악:'#705848', 강철:'#b8b8d0' };
  const TRAINER_INTRO = ['trainer-extra/ggoma.mp4','trainer-extra/backpack.mp4','trainer-extra/elitesprite.mp4','trainer-extra/clubpoke.mp4'];
  function core(){ return PB.core; }
  function online(){ return PB.online || {}; }
  function db(){ return online().db || null; }
  function uid(){ return online().uid || null; }
  function slot(){ return online().selectedSlot || 'char1'; }
  function key(){ return uid() ? `${uid()}_${slot()}` : ''; }
  function esc(v){ return String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
  function now(){ return Date.now(); }
  function toast(msg){ PB.ui?.showToast?.(msg); }
  function curChar(){ return online().selectedCharacter || null; }
  function curPlayer(){ return core()?.getPlayer?.('p1') || null; }
  function stateKeyOf(chKey){ return String(chKey || '').replace(/[^a-zA-Z0-9_-]/g,'_'); }
  function getBaseById(id){ return core()?.state?.pokemonById?.get?.(Number(id)); }
  function pName(p){ return p?.currentName || p?.base?.nameKo || p?.nameKo || '포켓몬'; }
  function displayPublicPokemonName(p){ const n=p?.name||p?.currentName||'포켓몬'; const o=p?.originalName||p?.baseName||p?.baseKo||''; return o && o!==n ? `${n}(${o})` : n; }
  function getPrice(base){
    try { if (PB.online && typeof PB.online.calculatePokemonPrice === 'function') return PB.online.calculatePokemonPrice(base); } catch(e){}
    try { if (window.PB_MARKET_PRICES && base?.nameKo && window.PB_MARKET_PRICES[base.nameKo]) return Number(window.PB_MARKET_PRICES[base.nameKo]); } catch(e){}
    const stats = base?.speciesStats || base?.stats || {};
    const total = ['hp','attack','defense','spAttack','spDefense','speed'].reduce((s,k)=>s+Number(stats[k]||0),0);
    return Math.max(400, Math.round((800 + total*8)/100)*100);
  }
  function renderMini(base, size=42){
    const src = base?.image || base?.sprite || base?.asset || base?.spriteUrl || '';
    const color = TYPE_COLOR[(base?.type || [])[0]] || '#74d4ff';
    if (src) return `<span class="p2-mini" style="width:${size}px;height:${size}px;"><img src="${esc(src)}" alt="${esc(base.nameKo)}"></span>`;
    return `<span class="p2-mini" style="width:${size}px;height:${size}px;background:${color};">${esc(String(base?.nameKo||'?').slice(0,1))}</span>`;
  }
  function getHeldNames(p){
    const items = p?.heldItems || (p?.heldItem ? [p.heldItem] : []);
    if (!items.length) return '없음';
    return items.map(it => it?.nameKo || it?.name || it?.id || '지닌물건').join(', ');
  }
  function normalizeBloodline(value){
    const v = String(value || 'normal');
    if (['우수혈통','superior','great','blue'].includes(v)) return '우수혈통';
    if (['고대혈통','ancient','gold'].includes(v)) return '고대혈통';
    if (['뮤의 후손','mew','mew_descendant','purple'].includes(v)) return '뮤의 후손';
    if (v.includes('우수')) return '우수혈통';
    if (v.includes('고대')) return '고대혈통';
    if (v.includes('뮤')) return '뮤의 후손';
    return '일반혈통';
  }
  function bloodClass(value){
    const label = normalizeBloodline(value);
    if (label === '우수혈통') return 'p2-blood p2-blood-blue';
    if (label === '고대혈통') return 'p2-blood p2-blood-gold';
    if (label === '뮤의 후손') return 'p2-blood p2-blood-purple';
    return 'p2-blood p2-blood-gray';
  }
  function bloodBadge(value){ return `<span class="${bloodClass(value)}">${esc(normalizeBloodline(value))}</span>`; }
  function compactPokemonPublic(p){
    if (!p?.base) return null;
    return {
      uid: p.uid || (`p_${p.base.id}_${Math.random().toString(36).slice(2,7)}`),
      baseId: Number(p.base.id || p.id || 0),
      name: pName(p),
      originalName: p?.base?.nameKo || p?.originalName || '',
      level: Math.min(100, Number(p.level || 5)),
      types: (p.base.type || []).slice(0,2),
      heldItems: (p.heldItems || (p.heldItem ? [p.heldItem] : [])).map(it => ({ id: it.id || '', nameKo: it.nameKo || it.name || it.id || '지닌물건' })),
      status: p.status || '정상',
      currentHp: Number(p.currentHp ?? p.maxHp ?? 1),
      maxHp: Number(p.maxHp || 1),
      bloodline: p.bloodline || 'normal',
      koCount: Number(p.koCount || 0),
      koStars: Math.min(5, Math.floor(Number(p.koCount || 0)/10)),
      damageDealt: Number(p.competitiveDamageDealt || p.damageDealt || 0),
      damageTaken: Number(p.competitiveDamageTaken || p.damageTaken || 0),
      isShiny: Boolean(p.isShiny)
    };
  }
  function compactPokemonBattle(p){
    const pub = compactPokemonPublic(p);
    if (!pub) return null;
    return {
      ...pub,
      candyUsed:Number(p.candyUsed||0), enhanceLevel:Number(p.enhanceLevel||0), preventEvolution:Boolean(p.preventEvolution),
      moves:(p.moves || []).slice(0,4).map(m => ({...m}))
    };
  }
  function inflatePokemonForBattle(data){
    const c = core();
    const base = getBaseById(data?.baseId);
    if (!c || !base) return null;
    const p = c.createRuntimePokemon(base, Math.min(100, Number(data.level || 5)));
    p.uid = data.uid || p.uid;
    p.currentName = data.name || p.currentName;
    p.heldItems = Array.isArray(data.heldItems) ? data.heldItems.map(it=>({...it})) : [];
    p.heldItem = p.heldItems[0] || null;
    p.moves = Array.isArray(data.moves) && data.moves.length ? data.moves.slice(0,4).map(m=>({...m})) : p.moves;
    p.bloodline = data.bloodline || p.bloodline || 'normal';
    p.koCount = Number(data.koCount || 0);
    p.koStars = Math.min(5, Math.floor(Number(p.koCount||0)/10));
    c.recalculateRuntimeStats?.(p, { fullHeal:true });
    p.currentHp = Math.min(p.maxHp, Number(data.currentHp || p.maxHp));
    return p;
  }
  function getMyPublicPayload(){
    const ch = curChar();
    const player = curPlayer();
    const squad = (player?.squad || []).slice(0,3).map(compactPokemonPublic).filter(Boolean);
    const battleTeam = (player?.squad || []).slice(0,3).map(compactPokemonBattle).filter(Boolean);
    const main = squad[0] || null;
    const st = ch?.competitive || { tier:'beginner', rank:3, points:0, promotionReady:false };
    const tierLabel = getTierLabel(st);
    return {
      uid: uid(), slot: slot(), key: key(), nickname: ch?.nickname || ch?.name || online().nickname || '', hair: ch?.hair || '',
      characterName: ch?.name || player?.name || '트레이너', tier: st.tier || 'beginner', rank: Number(st.rank || 3), points: Number(st.points || 0), promotionReady: Boolean(st.promotionReady), tierLabel,
      rankWins: Number(st.wins || 0), rankLosses: Number(st.losses || 0), onlineWins: Number(ch?.onlinePvp?.wins || 0), onlineLosses: Number(ch?.onlinePvp?.losses || 0), rankValue: rankValueOf(st),
      money: Number(player?.money || 0), mainPokemon: main, squad, battleTeam, status:'온라인', updatedAt: now()
    };
  }
  function getTierLabel(st){
    const tiers = { beginner:'비기너', monster:'몬스터볼', super:'수퍼볼', hyper:'하이퍼볼', master:'마스터볼' };
    if (!st) return '비기너';
    if (st.tier === 'beginner') return `비기너 ${Number(st.points||0)}/50`;
    return `${tiers[st.tier] || st.tier} ${Number(st.rank || 3)}티어 ${Number(st.points||0)}/100`;
  }
  function rankValueOf(st){
    const order = { beginner:0, monster:1, super:2, hyper:3, master:4 };
    const tier = order[String(st?.tier || 'beginner')] || 0;
    const rank = Math.max(1, Math.min(3, Number(st?.rank || 3)));
    const inner = String(st?.tier || 'beginner') === 'beginner' ? 0 : (3 - rank) * 100;
    return tier * 1000 + inner + Number(st?.points || 0);
  }
  async function publishMe(){
    const d = db(), k = key();
    if (!d || !uid() || !curChar()) return false;
    const pub = getMyPublicPayload();
    try {
      await d.ref(`playerPublicList/${k}`).set(pub);
      await publishRankings();
      await maybeRegisterFirstChampion(pub);
      return true;
    } catch(error){ console.warn('온라인 공개 정보 저장 실패', error); return false; }
  }
  async function maybeRegisterFirstChampion(pub){
    if (!pub || pub.tier !== 'master' || !db()) return;
    try {
      await db().ref('competitive/champion').transaction((cur) => {
        if (cur && cur.key && !cur.deleted) return cur;
        return { ...pub, championSince: now(), championCount: 1, reason:'firstMasterball' };
      });
    } catch(error){ console.warn('챔피언 등록 실패', error); }
  }
  async function publishRankings(){
    const d = db(), k = key(); if (!d || !uid() || !curChar()) return;
    const pub = getMyPublicPayload();
    const updates = {};
    (pub.squad || []).forEach((p, idx) => {
      const id = `${k}_${p.uid || idx}`.replace(/[^a-zA-Z0-9_-]/g,'_');
      const base = { uid:uid(), slot:slot(), key:k, nickname:pub.nickname, characterName:pub.characterName, pokemonName:p.name, baseId:p.baseId, level:p.level, updatedAt:now() };
      updates[`competitive/rankings/ko/${id}`] = { ...base, score:Number(p.koCount||0), stars:Number(p.koStars||0) };
      updates[`competitive/rankings/damage/${id}`] = { ...base, score:Number(p.damageDealt||0) };
      updates[`competitive/rankings/tank/${id}`] = { ...base, score:Number(p.damageTaken||0) };
    });
    try { if (Object.keys(updates).length) await d.ref().update(updates); } catch(error){ console.warn('랭킹 저장 실패', error); }
  }
  function subscribeFirebase(){
    const d = db();
    if (!d || PHASE2.ready) return;
    PHASE2.ready = true;
    d.ref('playerPublicList').on('value', snap => { PHASE2.players = snap.val() || {}; renderSoon(); });
    d.ref('competitive/champion').on('value', snap => { PHASE2.champion = snap.val() || null; renderSoon(); });
    d.ref('battleRooms').limitToLast(80).on('value', snap => { PHASE2.rooms = snap.val() || {}; renderSoon(); maybeAutoNoticeRooms(); });
    d.ref('market/playerListings').limitToLast(200).on('value', snap => { PHASE2.listings = snap.val() || {}; renderSoon(); });
    d.ref('competitive/rankings').on('value', snap => { PHASE2.rankings = snap.val() || {ko:{},damage:{},tank:{}}; renderSoon(); });
    publishMe();
  }
  let renderTimer = null;
  function renderSoon(){ if (renderTimer) return; renderTimer = setTimeout(()=>{ renderTimer=null; try{ PB.ui?.renderAll?.(); decorate(); }catch(e){} },80); }
  function playersArray(){
    return Object.entries(PHASE2.players || {}).map(([id,p])=>({ id,...p })).filter(p => p && !p.hidden && !p.deleted && p.uid && p.characterName);
  }
  function isMe(k){ return k && k === key(); }
  function renderTabRow(){
    return `<div class="online-tab-row p2-tabs">${TABS.map(([id, label]) => `<button data-p2-tab="${id}" class="${(PHASE2.tab||'ranked')===id?'active':''}">${label}</button>`).join('')}</div>`;
  }
  function renderCompetitiveCategory(){
    const tab = PHASE2.tab || 'ranked';
    let body = '';
    if (tab === 'players') body = renderPlayersView();
    else if (tab === 'champion') body = renderChampionView();
    else if (tab === 'friendly') body = renderFriendlyView();
    else if (tab === 'playerMarket') body = renderPlayerMarketView();
    else if (tab === 'rankings') body = renderRankingsView();
    else if (tab === 'challenge' || tab === 'market' || tab === 'ranked') {
      // 기존 1차 렌더러의 탭과 연결하기 위해 online.view 동기화
      if (online()) online().view = tab === 'market' ? 'market' : tab === 'challenge' ? 'challenge' : 'ranked';
      body = (PB.phase2Online.__baseRenderCategory ? PB.phase2Online.__baseRenderCategory() : '<div></div>');
      body = String(body).replace(/<div class="online-tab-row">[\s\S]*?<\/div>/, '');
    }
    return `<section class="placeholder-stack p2-online-shell">${renderTabRow()}${body}</section>`;
  }
  function renderPlayersView(){
    const all = playersArray().sort((a,b)=>(Number(b.rankValue||0)-Number(a.rankValue||0)) || Number(b.updatedAt||0)-Number(a.updatedAt||0));
    const rows = all.map((p,i)=>renderPlayerRow({...p, rankNo:i+1})).join('') || '<div class="p2-card">접속/저장된 플레이어가 없습니다.</div>';
    return `<div class="p2-card"><h3>온라인 플레이어</h3><p>순위는 경쟁전 티어와 포인트 기준입니다. 메인포켓몬과 지닌물건, 상태만 공개되고 기술은 비공개입니다.</p></div><div class="p2-list">${rows}</div>`;
  }
  function renderPlayerRow(p){
    const main = p.mainPokemon || (p.squad||[])[0];
    const base = getBaseById(main?.baseId);
    const held = main?.heldItems?.length ? main.heldItems.map(it=>it.nameKo||it.id).join(', ') : '없음';
    const types = (main?.types||[]).map(t=>`<span class="p2-type" style="background:${TYPE_COLOR[t]||'#789'}">${esc(t)}</span>`).join('');
    const self = p.key === key();
    return `<div class="p2-player-row ${self?'p2-me-row':''}">
      <div class="p2-rank-no">${Number(p.rankNo||0)}</div>${renderMini(base,46)}
      <div class="p2-grow"><b>${self?'내 정보 · ':''}${esc(p.nickname || '')} ${esc(p.characterName || '트레이너')}</b><small>${esc(p.tierLabel || '')} · 경쟁전 ${Number(p.rankWins||0)}승 ${Number(p.rankLosses||0)}패 · 친선 ${Number(p.onlineWins||0)}승 ${Number(p.onlineLosses||0)}패</small><div>${main ? `${esc(displayPublicPokemonName(main))} Lv.${esc(main.level)} ${types}` : '메인 포켓몬 없음'}</div><small>지닌물건 ${esc(held)} · 상태 ${esc(main?.status || '정상')}</small></div>
      <div class="p2-col"><button class="p2-btn" data-p2-view-player="${esc(p.key||p.id)}">출전목록</button>${self?'':`<button class="p2-btn alt" data-p2-friendly="${esc(p.key||p.id)}">친선도전</button>`}</div>
    </div>`;
  }
  function renderChampionView(){
    const champ = PHASE2.champion;
    const me = getMyPublicPayload();
    const incoming = roomArray().filter(r => r.mode === 'champion' && r.targetKey === key() && r.status === 'pending');
    const mine = roomArray().filter(r => r.mode === 'champion' && (r.challengerKey === key() || r.targetKey === key())).slice(0,4);
    const canSelfRegister = !champ?.key && me.tier === 'master';
    const champCard = champ?.key ? renderChampionCard(champ) : `<div class="p2-card"><h3>포켓몬챔피언 없음</h3><p>최초로 마스터볼 티어에 오른 캐릭터가 챔피언으로 등록됩니다.</p>${canSelfRegister?'<button class="p2-btn" data-p2-register-champion="1">챔피언 등록</button>':''}</div>`;
    return `${champCard}<div class="p2-card"><h3>챔피언 도전</h3><p>챔피언에게 도전 신청 후 수락되면 배틀방이 생성됩니다. 도전자가 이기면 챔피언이 교체됩니다.</p>${champ?.key && champ.key!==key()?`<button class="p2-btn" data-p2-champion-challenge="${esc(champ.key)}">챔피언에게 도전</button>`:'<span class="p2-muted">현재 도전 가능한 챔피언이 없습니다.</span>'}</div><div class="p2-card"><h3>받은 도전</h3>${incoming.map(renderRoomRequest).join('') || '<p>받은 도전이 없습니다.</p>'}</div><div class="p2-card"><h3>배틀방</h3>${mine.map(renderRoomStatus).join('') || '<p>진행 중인 챔피언 방이 없습니다.</p>'}</div>`;
  }
  function renderChampionCard(champ){
    const main = champ.mainPokemon || (champ.squad||[])[0];
    const base = getBaseById(main?.baseId);
    return `<div class="p2-card p2-champ"><h3>현재 포켓몬챔피언</h3><div class="p2-player-row">${renderMini(base,58)}<div class="p2-grow"><b>${esc(champ.nickname || '')} ${esc(champ.characterName || '챔피언')}</b><small>${esc(champ.tierLabel || '마스터볼')}</small><div>${esc(main?.name || '메인 포켓몬')} Lv.${esc(main?.level || '')}</div><small>챔피언 등극 ${new Date(Number(champ.championSince||Date.now())).toLocaleDateString()}</small></div></div></div>`;
  }
  function renderFriendlyView(){
    const others = playersArray().filter(p=>p.key!==key());
    const rooms = roomArray().filter(r => r.mode === 'friendly' && (r.challengerKey === key() || r.targetKey === key())).slice(0,4);
    return `<div class="p2-card"><h3>실시간 친선배틀</h3><p>상대에게 재화를 걸고 도전합니다. 수락 후 실시간 턴제 배틀방에서 진행됩니다.</p><p>내 친선 기록: ${Number(getMyPublicPayload().onlineWins||0)}승 ${Number(getMyPublicPayload().onlineLosses||0)}패</p></div><div class="p2-list">${others.map(renderFriendlyPlayer).join('') || '<div class="p2-card">도전 가능한 플레이어가 없습니다.</div>'}</div><div class="p2-card"><h3>친선 배틀방</h3>${rooms.map(renderRoomStatus).join('') || '<p>진행 중인 친선 방이 없습니다.</p>'}</div>`;
  }
  function renderFriendlyPlayer(p){
    const main = p.mainPokemon || (p.squad||[])[0]; const base = getBaseById(main?.baseId);
    return `<div class="p2-player-row">${renderMini(base,46)}<div class="p2-grow"><b>${esc(p.characterName||'트레이너')}</b><small>${esc(p.tierLabel||'')} · 친선 ${Number(p.onlineWins||0)}승 ${Number(p.onlineLosses||0)}패</small><div>${esc(main ? displayPublicPokemonName(main) : '포켓몬 없음')}</div></div><button class="p2-btn" data-p2-friendly="${esc(p.key)}">도전</button></div>`;
  }
  function renderRoomRequest(room){
    const opponent = room.challenger || room.target || {};
    return `<div class="p2-room"><b>${esc(opponent.characterName || '도전자')}</b><span>${room.mode==='friendly'?`재화 ${Number(room.wager||0)} · 친선 ${Number(opponent.onlineWins||0)}승 ${Number(opponent.onlineLosses||0)}패`:'챔피언 도전'}</span><button class="p2-btn" data-p2-room-accept="${esc(room.id)}">수락</button><button class="p2-btn alt" data-p2-room-decline="${esc(room.id)}">거절</button></div>`;
  }
  function renderRoomStatus(room){
    const isTarget = room.targetKey === key();
    const opponent = isTarget ? room.challenger : room.target;
    const statusLabel = room.status === 'pending' ? '수락 대기' : room.status === 'accepted' ? '입장 가능' : room.status === 'inProgress' ? '진행 중' : room.status === 'readying' ? '입장 대기' : room.status === 'completed' ? '완료' : room.status;
    const result = room.result?.winnerKey ? `<small>승자: ${esc(room.result.winnerName || room.result.winnerKey)}</small>` : '';
    const records = room.mode==='friendly' ? `<small>내 친선 ${Number(getMyPublicPayload().onlineWins||0)}승 ${Number(getMyPublicPayload().onlineLosses||0)}패 · 상대 ${Number(opponent?.onlineWins||0)}승 ${Number(opponent?.onlineLosses||0)}패</small>` : '';
    const start = (room.status === 'accepted' || room.status === 'inProgress' || room.status === 'readying') ? `<button class="p2-btn" data-p2-room-start="${esc(room.id)}">배틀방 입장</button>` : '';
    const accept = room.status === 'pending' && isTarget ? `<button class="p2-btn" data-p2-room-accept="${esc(room.id)}">수락</button>` : '';
    return `<div class="p2-room"><b>${esc(opponent?.characterName || '상대')}</b><span>${esc(statusLabel)} ${room.mode==='friendly'?`· ${Number(room.wager||0)}원`:''}</span>${records}${result}${accept}${start}</div>`;
  }
  function roomArray(){ return Object.entries(PHASE2.rooms||{}).map(([id,r])=>({id,...r})).sort((a,b)=>Number(b.updatedAt||b.createdAt||0)-Number(a.updatedAt||a.createdAt||0)); }
  function renderPlayerMarketView(){
    const listings = Object.entries(PHASE2.listings || {}).map(([id,l])=>({id,...l})).filter(l=>!l.sold && !l.cancelled).sort((a,b)=>Number(b.createdAt||0)-Number(a.createdAt||0));
    const pageSize = 8, pages = Math.max(1, Math.ceil(listings.length/pageSize));
    PHASE2.playerMarketPage = (Number(PHASE2.playerMarketPage||0)+pages)%pages;
    const rows = listings.slice(PHASE2.playerMarketPage*pageSize, PHASE2.playerMarketPage*pageSize+pageSize).map(renderListingRow).join('') || '<div class="p2-card">판매 게시된 포켓몬이 없습니다.</div>';
    const reserve = (curPlayer()?.reserve || []).slice(0,12).map(p => `<button class="p2-btn alt" data-p2-list-pokemon="${esc(p.uid)}">${esc(pName(p))} 가격 직접 입력</button>`).join('') || '<span class="p2-muted">게시 가능한 리저브 포켓몬 없음</span>';
    return `<div class="p2-card"><div class="p2-title-row"><h3>플레이어 마켓</h3><span>${PHASE2.playerMarketPage+1}/${pages}</span></div><p>다른 플레이어가 올린 포켓몬을 구매합니다. 판매 포켓몬의 기술도 확인할 수 있습니다.</p><div class="online-mini-row"><button class="p2-btn alt" data-p2-player-market-page="prev">◀</button><button class="p2-btn alt" data-p2-player-market-page="next">▶</button></div></div><div class="p2-list">${rows}</div><div class="p2-card"><h3>판매 게시</h3><p>리저브 포켓몬을 게시하면 보관함에서 빠지고, 팔리면 정산됩니다.</p><div class="online-mini-row">${reserve}</div></div>${renderMyListings()}`;
  }
  function renderListingRow(l){
    const base = getBaseById(l.pokemon?.baseId); const mine = l.sellerKey === key();
    return `<div class="p2-player-row">${renderMini(base,48)}<div class="p2-grow"><b>${esc(displayPublicPokemonName(l.pokemon) || base?.nameKo || '포켓몬')}</b><small>Lv.${esc(l.pokemon?.level || 5)} · 판매자 ${esc(l.sellerName || '')}</small><div>${bloodBadge(l.pokemon?.bloodline)} ${l.pokemon?.isShiny?'✨ 이로치':''}</div><button class="p2-btn alt" style="margin-top:6px;padding:5px 9px;font-size:11px;" data-p2-listing-moves="${esc(l.id)}">기술</button></div><div class="p2-col"><b>${Number(l.price||0)}원</b>${mine?`<button class="p2-btn alt" data-p2-cancel-listing="${esc(l.id)}">취소</button>`:`<button class="p2-btn" data-p2-buy-listing="${esc(l.id)}">구매</button>`}</div></div>`;
  }
  function renderMyListings(){
    const mine = Object.entries(PHASE2.listings || {}).map(([id,l])=>({id,...l})).filter(l=>l.sellerKey===key()).slice(0,10);
    if (!mine.length) return '';
    return `<div class="p2-card"><h3>내 판매글</h3>${mine.map(l=>`<div class="p2-room"><b>${esc(l.pokemon?.name || '포켓몬')}</b><span>${l.sold?'판매완료':l.cancelled?'취소됨':'판매중'} · ${Number(l.price||0)}원</span>${l.sold && !l.settled?`<button class="p2-btn" data-p2-claim-sale="${esc(l.id)}">정산</button>`:''}</div>`).join('')}</div>`;
  }
  function renderRankingsView(){
    const tierGroups = [ ['monster','몬스터볼 랭킹'], ['super','수퍼볼 랭킹'], ['hyper','하이퍼볼 랭킹'], ['master','마스터볼 랭킹'] ];
    return `<div class="p2-card"><h3>TOP10 랭킹</h3><p>경쟁전 배틀 기록 기준입니다.</p></div>` + tierGroups.map(([tier,label])=>`<div class="p2-card"><h3>${label}</h3><div class="p2-rank-grid">${renderRankingTable('ko','KO 랭킹','KO',tier)}${renderRankingTable('damage','데미지 랭킹','누적 피해',tier)}${renderRankingTable('tank','탱커 랭킹','버틴피해',tier)}</div></div>`).join('');
  }
  function renderRankingTable(kind,title,label,tier){
    const list = Object.values(PHASE2.rankings?.[kind] || {}).filter(r=>Number(r.score||0)>0 && (!tier || (r.tier===tier || (tier==='monster' && r.tier==='beginner')))).sort((a,b)=>Number(b.score||0)-Number(a.score||0)).slice(0,10);
    return `<div class="p2-card"><h3>${title}</h3>${list.map((r,i)=>`<div class="p2-rank-row"><b>${i+1}</b><span>${esc(r.pokemonName || '포켓몬')}</span><small>${esc(r.nickname||'')} ${esc(r.characterName||'')}</small><em>${Number(r.score||0)} ${label}</em></div>`).join('') || '<p>아직 기록 없음</p>'}</div>`;
  }
  async function createRoom(mode, targetKey, wager=0){
    if (!db() || !uid() || !curChar()) { toast('로그인 후 이용하세요.'); return; }
    const target = PHASE2.players?.[targetKey] || null;
    if (!target || targetKey === key()) { toast('상대를 찾을 수 없습니다.'); return; }
    const player = curPlayer();
    if (mode === 'friendly' && Number(player?.money||0) < Number(wager||0)) { toast('걸 재화가 부족합니다.'); return; }
    const id = db().ref('battleRooms').push().key;
    const me = getMyPublicPayload();
    const room = { id, mode, status:'pending', challengerKey:key(), targetKey, challenger:me, target, wager:Number(wager||0), createdAt:now(), updatedAt:now() };
    try { await db().ref(`battleRooms/${id}`).set(room); toast('도전 신청 완료'); }
    catch(error){ console.warn(error); toast('도전 신청 실패'); }
  }
  async function acceptRoom(id){
    const room = PHASE2.rooms?.[id];
    if (!room || room.targetKey !== key()) return;
    try { await db().ref(`battleRooms/${id}`).update({ status:'accepted', target:getMyPublicPayload(), acceptedAt:now(), updatedAt:now() }); toast('배틀방 수락 완료'); }
    catch(error){ console.warn(error); toast('수락 실패'); }
  }
  async function declineRoom(id){
    const room = PHASE2.rooms?.[id]; if (!room) return;
    try { await db().ref(`battleRooms/${id}`).update({ status:'declined', updatedAt:now() }); } catch(e){}
  }
  function startRoomBattle(id){
    if (window.PB_REALTIME_PVP && typeof window.PB_REALTIME_PVP.enterRoom === 'function') {
      window.PB_REALTIME_PVP.enterRoom(id);
      return;
    }
    toast('실시간 배틀 모듈을 불러오는 중입니다.');
  }
  async function handleRoomBattleComplete(payload, room, isChallenger, myTeam, oppTeam, label){
    const won = payload?.winnerId === 'p1';
    applyOnlineBattleStats(payload, myTeam, oppTeam);
    const winnerKey = won ? key() : (isChallenger ? room.targetKey : room.challengerKey);
    const winnerPub = won ? getMyPublicPayload() : (isChallenger ? room.target : room.challenger);
    const result = { winnerKey, winnerName:winnerPub?.characterName || '', completedBy:key(), completedAt:now() };
    const updates = { status:'completed', result, updatedAt:now() };
    if (room.mode === 'champion') {
      if (winnerKey === room.challengerKey) {
        updates.championChanged = true;
      }
    }
    try { await db()?.ref(`battleRooms/${room.id}`).update(updates); } catch(error){ console.warn('방 결과 저장 실패', error); }
    if (room.mode === 'champion' && winnerKey === room.challengerKey) {
      try { await db()?.ref('competitive/champion').set({ ...room.challenger, championSince:now(), championCount:Number(room.challenger?.championCount||0)+1, reason:'challengeWin' }); } catch(error){ console.warn('챔피언 교체 실패', error); }
    }
    if (room.mode === 'friendly' && Number(room.wager||0)>0) {
      if (won) core()?.addMoney?.('p1', Number(room.wager||0));
      else core()?.spendMoney?.('p1', Number(room.wager||0));
    }
    core()?.healPlayerTeam?.('p1');
    await wrappedSave();
    setTimeout(()=>{ core()?.returnToLobby?.(); toast(`${label} ${won?'승리':'패배'}`); }, won ? 3500 : 1800);
    return true;
  }
  function applyOnlineBattleStats(payload, playerTeam, opponentTeam){
    const player = curPlayer(); if (!player) return;
    const stats = payload?.stats || {};
    const originals = new Map((player.squad||[]).map(p=>[p.uid,p]));
    (playerTeam||[]).forEach(clone=>{
      const src = originals.get(clone.sourceUid); if (!src) return;
      const st = stats[clone.uid] || {};
      const kos = Number(st.kos||0);
      src.koCount = Number(src.koCount||0) + kos;
      src.koStars = Math.min(5, Math.floor(Number(src.koCount||0)/10));
      src.competitiveDamageDealt = Number(src.competitiveDamageDealt||0) + Number(st.damageDealt||0);
      if (Number(st.deaths||0) === 0) src.competitiveDamageTaken = Number(src.competitiveDamageTaken||0) + Number(st.damageTaken||0);
    });
  }
  async function registerChampionNow(){ const me = getMyPublicPayload(); await db()?.ref('competitive/champion').transaction(cur=> cur && cur.key ? cur : { ...me, championSince:now(), championCount:1, reason:'manualMasterball' }); toast('챔피언 등록 완료'); }
  async function listPokemon(uidValue){
    const player = curPlayer(); const idx = (player?.reserve||[]).findIndex(p=>p.uid===uidValue);
    if (!player || idx<0) { toast('리저브에서 찾을 수 없습니다.'); return; }
    const p = player.reserve[idx];
    const suggested = Math.max(300, Math.floor(getPrice(p.base)*0.75));
    const input = prompt(`${pName(p)} 판매 가격을 입력하세요`, String(suggested));
    if (input === null) return;
    const price = Math.max(1, Math.min(999999, parseInt(String(input).replace(/[^0-9]/g,''),10) || suggested));
    const [removed] = player.reserve.splice(idx,1);
    const listing = { sellerUid:uid(), sellerSlot:slot(), sellerKey:key(), sellerName:curChar()?.name || player.name || '', price, pokemon:compactPokemonBattle(removed), publicPokemon:compactPokemonPublic(removed), createdAt:now(), updatedAt:now(), sold:false };
    const ref = db()?.ref('market/playerListings').push();
    try { await ref.set({ id:ref.key, ...listing }); await wrappedSave(); toast(`${price}원에 판매 게시 완료`); }
    catch(error){ player.reserve.push(removed); console.warn(error); toast('판매 게시 실패'); }
  }
  async function buyListing(id){
    const l = PHASE2.listings?.[id]; const player = curPlayer();
    if (!l || l.sold || l.cancelled || !player) return;
    if (l.sellerKey === key()) { toast('내 판매글입니다.'); return; }
    if (Number(player.money||0) < Number(l.price||0)) { toast('재화가 부족합니다.'); return; }
    const p = inflatePokemonForBattle(l.pokemon);
    if (!p) { toast('포켓몬 데이터를 복구할 수 없습니다.'); return; }
    const txRef = db()?.ref(`market/playerListings/${id}`);
    try {
      const res = await txRef.transaction(cur => {
        if (!cur || cur.sold || cur.cancelled) return cur;
        cur.sold = true; cur.buyerUid = uid(); cur.buyerSlot = slot(); cur.buyerKey = key(); cur.buyerName = curChar()?.name || ''; cur.soldAt = now(); cur.updatedAt = now(); return cur;
      });
      if (!res.committed) { toast('이미 판매되었습니다.'); return; }
      core()?.spendMoney?.('p1', Number(l.price||0));
      core()?.addPokemonToReserve?.('p1', p);
      await wrappedSave();
      toast(`${pName(p)} 구매 완료`);
    } catch(error){ console.warn(error); toast('구매 실패'); }
  }
  async function cancelListing(id){
    const l = PHASE2.listings?.[id]; if (!l || l.sellerKey !== key() || l.sold) return;
    const p = inflatePokemonForBattle(l.pokemon);
    try { await db()?.ref(`market/playerListings/${id}`).update({ cancelled:true, updatedAt:now() }); if (p) core()?.addPokemonToReserve?.('p1',p); await wrappedSave(); toast('판매 취소'); } catch(error){ console.warn(error); }
  }
  async function claimSale(id){
    const l = PHASE2.listings?.[id]; if (!l || l.sellerKey !== key() || !l.sold || l.settled) return;
    try { await db()?.ref(`market/playerListings/${id}`).update({ settled:true, settledAt:now() }); core()?.addMoney?.('p1', Number(l.price||0)); await wrappedSave(); toast(`정산 +${Number(l.price||0)}원`); } catch(error){ console.warn(error); }
  }
  function showPlayerPopup(k){
    const p = PHASE2.players?.[k]; if (!p) return;
    const rows = (p.squad||[]).map(mon=>{ const base=getBaseById(mon.baseId); const held=mon.heldItems?.length?mon.heldItems.map(it=>it.nameKo||it.id).join(', '):'없음'; return `<div class="p2-player-row">${renderMini(base,48)}<div class="p2-grow"><b>${esc(mon.name)}</b><small>Lv.${esc(mon.level)} · ${esc((mon.types||[]).join('/'))}</small><div>${bloodBadge(mon.bloodline)} <span>지닌물건 ${esc(held)}</span></div><small>상태 ${esc(mon.status||'정상')} · 기술 비공개</small></div></div>`; }).join('') || '<p>출전 포켓몬 없음</p>';
    openP2Modal(`${p.characterName || '플레이어'} 출전포켓몬`, rows);
  }
  function openP2Modal(title, html){
    const root = document.getElementById('modal-root'); if (!root) return;
    root.innerHTML = `<div class="overlay"><div class="modal-card p2-modal"><div class="modal-header"><h2>${esc(title)}</h2><button class="close-btn" data-p2-close-modal="1">✕</button></div><div class="modal-body">${html}</div></div></div>`;
  }
  function decorate(){
    const d = db(); if (d && !PHASE2.ready) subscribeFirebase();
    // 메인 화면 팝업 보정
  }
  async function wrappedSave(){
    try {
      if (window.PB_ONLINE_V3?.saveCharacter) {
        const ok = await window.PB_ONLINE_V3.saveCharacter();
        await publishMe();
        return ok;
      }
    } catch(e){ console.warn(e); }
    await publishMe();
    return true;
  }
  function patchLeagueRender(){
    if (!PB.league) PB.league = {};
    if (!PHASE2.__baseRenderCategory) PHASE2.__baseRenderCategory = PB.league.renderCategory;
    PB.league.renderCategory = renderCompetitiveCategory;
  }
  function patchSaveAndBattle(){
    if (PHASE2.__patchedSaveBattle) return;
    PHASE2.__patchedSaveBattle = true;
    // 기존 저장 함수 래핑
    const tryWrap = () => {
      if (window.PB_ONLINE_V3 && !window.PB_ONLINE_V3.__phase2SaveWrapped) {
        const orig = window.PB_ONLINE_V3.saveCharacter;
        window.PB_ONLINE_V3.saveCharacter = async function(){ const res = await orig.apply(this, arguments); await publishMe(); return res; };
        window.PB_ONLINE_V3.__phase2SaveWrapped = true;
      }
    };
    tryWrap(); setTimeout(tryWrap,1000);
    if (PB.battleEngine && !PB.battleEngine.__phase2Wrapped) {
      PB.battleEngine.__phase2Wrapped = true;
      const origStart = PB.battleEngine.startBattle;
      PB.battleEngine.startBattle = function(opts){
        const options = opts || {};
        const origComplete = options.onComplete;
        options.onComplete = function(payload){
          let handled = false;
          if (typeof origComplete === 'function') handled = origComplete(payload) || false;
          setTimeout(()=>{ publishRankings(); publishMe(); }, 900);
          return handled;
        };
        return origStart.call(this, options);
      };
    }
  }
  function maybeAutoNoticeRooms(){ /* 현재는 렌더링에서 알림 */ }
  function bindEvents(){
    if (PHASE2.__eventsBound) return; PHASE2.__eventsBound = true;
    document.addEventListener('click', async (e)=>{
      const tab = e.target.closest('[data-p2-tab]'); if (tab){ PHASE2.tab = tab.dataset.p2Tab; if (['ranked','challenge','market'].includes(PHASE2.tab)) online().view = PHASE2.tab; PB.ui?.renderAll?.(); return; }
      const vp = e.target.closest('[data-p2-view-player]'); if (vp){ showPlayerPopup(vp.dataset.p2ViewPlayer); return; }
      const fr = e.target.closest('[data-p2-friendly]'); if (fr){ const w = Math.max(0, parseInt(prompt('걸 재화를 입력하세요', String(PHASE2.lastWagerPrompt||100))||'0',10)||0); PHASE2.lastWagerPrompt=w; await createRoom('friendly', fr.dataset.p2Friendly, w); return; }
      const cc = e.target.closest('[data-p2-champion-challenge]'); if (cc){ await createRoom('champion', cc.dataset.p2ChampionChallenge, 0); return; }
      if (e.target.closest('[data-p2-register-champion]')) { await registerChampionNow(); return; }
      const ac = e.target.closest('[data-p2-room-accept]'); if (ac){ await acceptRoom(ac.dataset.p2RoomAccept); return; }
      const dc = e.target.closest('[data-p2-room-decline]'); if (dc){ await declineRoom(dc.dataset.p2RoomDecline); return; }
      const st = e.target.closest('[data-p2-room-start]'); if (st){ startRoomBattle(st.dataset.p2RoomStart); return; }
      const lp = e.target.closest('[data-p2-list-pokemon]'); if (lp){ await listPokemon(lp.dataset.p2ListPokemon); return; }

      const lm = e.target.closest('[data-p2-listing-moves]'); if (lm){ const l=PHASE2.listings?.[lm.dataset.p2ListingMoves]; const moves=(l?.pokemon?.moves||[]).map(m=>`<div class="p2-card"><b>${esc(m.nameKo||m.name||'기술')}</b><p>${esc(m.type||'노말')} · ${esc(m.category||'')} · 위력 ${esc(m.power||'-')} · 명중 ${esc(m.accuracy||'-')}</p><p>${esc(m.description||'설명 없음')}</p></div>`).join('') || '<p>공개된 기술이 없습니다.</p>'; document.getElementById('modal-root').innerHTML=`<div class="overlay"><div class="modal-card p2-modal"><div class="modal-header"><h2>기술 목록</h2><button class="close-btn" data-p2fp-close-modal="1">✕</button></div><div class="modal-body">${moves}</div></div></div>`; return; }
      const bl = e.target.closest('[data-p2-buy-listing]'); if (bl){ await buyListing(bl.dataset.p2BuyListing); return; }
      const cl = e.target.closest('[data-p2-cancel-listing]'); if (cl){ await cancelListing(cl.dataset.p2CancelListing); return; }
      const cs = e.target.closest('[data-p2-claim-sale]'); if (cs){ await claimSale(cs.dataset.p2ClaimSale); return; }
      const pg = e.target.closest('[data-p2-player-market-page]'); if (pg){ const active = Object.values(PHASE2.listings||{}).filter(l=>!l.sold&&!l.cancelled).length; const pages=Math.max(1,Math.ceil(active/8)); PHASE2.playerMarketPage=(PHASE2.playerMarketPage+(pg.dataset.p2PlayerMarketPage==='next'?1:-1)+pages)%pages; PB.ui?.renderAll?.(); return; }
      if (e.target.closest('[data-p2-close-modal]')) { const root=document.getElementById('modal-root'); if(root) root.innerHTML=''; return; }
    }, true);
  }
  function injectStyles(){
    if (document.getElementById('phase2-online-style')) return;
    const style = document.createElement('style'); style.id='phase2-online-style';
    style.textContent = `
      .p2-online-shell{color:#fff!important}.p2-online-shell *{box-sizing:border-box}.p2-tabs{gap:6px;overflow-x:auto;padding:2px 0 8px}.p2-tabs button{white-space:nowrap}
      .p2-card{border:1px solid rgba(116,215,255,.28);background:rgba(6,18,34,.38);backdrop-filter:blur(12px);border-radius:20px;padding:12px;margin:8px 0;color:#fff!important;box-shadow:0 12px 28px rgba(0,0,0,.18)}
      .p2-card h3{margin:0 0 6px;color:#fff!important;font-weight:1000}.p2-card p,.p2-card small,.p2-muted{color:rgba(255,255,255,.78)!important;font-weight:800}.p2-title-row{display:flex;align-items:center;justify-content:space-between;gap:10px}.p2-list{display:grid;gap:8px}.p2-player-row{display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;border:1px solid rgba(255,255,255,.13);border-radius:18px;padding:9px;background:rgba(255,255,255,.08);color:#fff!important}.p2-player-row b{color:#fff!important}.p2-player-row small{display:block;color:rgba(255,255,255,.72)!important;font-size:11px}.p2-grow{min-width:0}.p2-col{display:flex;flex-direction:column;gap:6px;align-items:flex-end}.p2-btn{border:1px solid rgba(116,215,255,.35);border-radius:14px;padding:8px 10px;background:linear-gradient(180deg,rgba(116,215,255,.2),rgba(255,255,255,.08));color:#fff!important;font-weight:1000}.p2-btn.alt{background:rgba(255,255,255,.1);color:#fff!important}.p2-rank-no{width:26px;height:26px;border-radius:999px;background:rgba(255,255,255,.14);display:flex;align-items:center;justify-content:center;font-weight:1000;color:#ffe58a}.p2-me-row{border-color:rgba(255,217,92,.55)!important;background:rgba(255,217,92,.10)!important}.p2-mini{display:inline-flex;border-radius:999px;align-items:center;justify-content:center;overflow:hidden;font-weight:1000;color:#fff;flex:0 0 auto}.p2-mini img{width:100%;height:100%;object-fit:contain}.p2-type{display:inline-flex;border-radius:999px;padding:2px 6px;margin-left:3px;color:#fff;font-size:10px;font-weight:1000}.p2-room{display:grid;grid-template-columns:1fr auto auto auto;gap:8px;align-items:center;padding:8px;border-radius:14px;background:rgba(255,255,255,.08);margin:6px 0}.p2-room b,.p2-room span{color:#fff!important}.p2-champ{border-color:rgba(255,210,85,.55);background:linear-gradient(135deg,rgba(124,79,255,.24),rgba(255,210,85,.12))}.p2-rank-grid{display:grid;gap:8px}.p2-rank-row{display:grid;grid-template-columns:24px 1fr;gap:4px;align-items:center;padding:6px;border-bottom:1px solid rgba(255,255,255,.08);color:#fff}.p2-rank-row small{grid-column:2;color:rgba(255,255,255,.66)!important}.p2-rank-row em{grid-column:2;font-style:normal;color:#ffd86b;font-weight:1000}.p2-blood{display:inline-flex;border-radius:999px;padding:3px 8px;color:#06101f!important;font-weight:1000;font-size:11px;box-shadow:none!important;text-shadow:none!important}.p2-blood-gray{background:#c6cbd4!important}.p2-blood-blue{background:#6ac7ff!important}.p2-blood-gold{background:#ffd45c!important}.p2-blood-purple{background:#b68cff!important}.p2-modal{background:rgba(8,20,38,.96)!important;color:#fff!important}.p2-modal h2,.p2-modal b,.p2-modal p,.p2-modal span,.p2-modal small{color:#fff!important}
    `;
    document.head.appendChild(style);
  }
  function init(){
    if (!PB.core || !PB.ui || !PB.league || !window.PB_ONLINE_V3) { setTimeout(init,120); return; }
    injectStyles(); patchLeagueRender(); patchSaveAndBattle(); bindEvents(); subscribeFirebase();
    const origRender = PB.ui.renderAll;
    if (!PB.ui.__phase2OnlineRenderWrap) {
      PB.ui.__phase2OnlineRenderWrap = true;
      PB.ui.renderAll = function(){ const r=origRender.apply(this,arguments); setTimeout(()=>{ patchLeagueRender(); decorate(); },0); return r; };
    }
    publishMe(); decorate();
  }
  document.addEventListener('DOMContentLoaded', ()=>setTimeout(init,240));
})();
