(function(){
  'use strict';
  const PB = window.POKEBATTLE || (window.POKEBATTLE = {});
  const norm = (v)=>String(v||'').toLowerCase().replace(/[^a-z0-9_가-힣]/g,'');
  const BL_LABEL = { normal:'일반혈통', elite:'우수혈통', ancient:'고대혈통', mew:'뮤의 후손' };
  const BL_COLOR = { normal:'#b7bdc8', elite:'#55aaff', ancient:'#ffd95a', mew:'#c36bff' };
  const SHOP_BLOCK = new Set(['mythic_fragment','artisan_knowledge','groudon_skeleton','palkia_pearl','kyogre_heart','dialga_diamond','awakening_lance','fighting_serum','hunting_instinct','storm_claw','unyielding_armor','golden_starlight','infinite_growth_drug','swift_boots','tri_relic_fragment','sealing_chain']);
  const TM_PRICE = {
    tm_hyper_beam:6000, tm_draco_meteor:5760, tm_dark_pulse:5520, tm_close_combat:5280, tm_thunderbolt:5040,
    tm_shadow_ball:4800, tm_earthquake:4560, tm_ice_beam:4320, tm_ice_punch:4080, tm_thunder_punch:3840,
    tm_fire_punch:3600, tm_flamethrower:3360, tm_dazzling_gleam:3120, tm_fake_out:2940, tm_knock_off:2820,
    tm_swords_dance:2700, tm_dragon_dance:2580, tm_nasty_plot:2460, tm_calm_mind:2340, tm_stealth_rock:2220,
    tm_substitute:2100, tm_rock_slide:1980, tm_icy_wind:1860, tm_trick_room:1740, tm_helping_hand:1620,
    tm_protect:1500, tm_u_turn:1380, tm_taunt:1260, tm_will_o_wisp:1140, tm_thunder_wave:1020
  };
  const TM_NOTES = {
    tm_hyper_beam:'노말 타입 기술머신입니다. 대부분의 포켓몬이 배울 수 있지만 PP가 낮습니다.',
    tm_draco_meteor:'드래곤 타입 포켓몬 전용에 가까운 최강 특수기입니다.',
    tm_dark_pulse:'악/고스트 타입 중심으로 배울 수 있는 특수기입니다.',
    tm_close_combat:'격투 타입 또는 강한 육탄전 포켓몬이 배울 수 있는 물리기입니다.',
    tm_thunderbolt:'전기 타입 중심으로 배울 수 있는 안정적인 특수기입니다.',
    tm_shadow_ball:'고스트 타입 중심으로 배울 수 있는 특수기입니다.',
    tm_earthquake:'땅/바위/강철 계열의 강한 물리 포켓몬이 배울 수 있습니다.',
    tm_ice_beam:'얼음/물 타입 중심으로 배울 수 있는 견제 특수기입니다.',
    tm_ice_punch:'두 발로 걷거나 팔을 쓰는 포켓몬이 배울 수 있는 펀치기입니다.',
    tm_thunder_punch:'두 발로 걷거나 팔을 쓰는 포켓몬이 배울 수 있는 펀치기입니다.',
    tm_fire_punch:'두 발로 걷거나 팔을 쓰는 포켓몬이 배울 수 있는 펀치기입니다.',
    tm_flamethrower:'불꽃 타입 중심으로 배울 수 있는 안정적인 특수기입니다.',
    tm_dazzling_gleam:'에스퍼/풀 타입 중심으로 배울 수 있는 광역 견제기입니다.',
    tm_fake_out:'노말 기술이라 대부분 배울 수 있지만 배틀 초반 운용에 적합합니다.',
    tm_knock_off:'악/고스트 타입과 물리형 포켓몬이 주로 배울 수 있습니다.',
    tm_swords_dance:'변화기는 대부분의 포켓몬이 배울 수 있습니다.',
    tm_dragon_dance:'변화기는 대부분 배울 수 있으나 드래곤/물리형과 궁합이 좋습니다.',
    tm_nasty_plot:'변화기는 대부분의 포켓몬이 배울 수 있습니다.',
    tm_calm_mind:'변화기는 대부분의 포켓몬이 배울 수 있습니다.',
    tm_stealth_rock:'변화기는 대부분의 포켓몬이 배울 수 있습니다.',
    tm_substitute:'변화기는 대부분의 포켓몬이 배울 수 있습니다.',
    tm_rock_slide:'바위/땅 타입 또는 강한 물리형 포켓몬이 배울 수 있습니다.',
    tm_icy_wind:'얼음/물 타입 중심으로 배울 수 있는 속도 견제기입니다.',
    tm_trick_room:'변화기는 대부분의 포켓몬이 배울 수 있습니다.',
    tm_helping_hand:'변화기는 대부분의 포켓몬이 배울 수 있습니다.'
  };
  const PUNCHABLE = new Set('파이리 리자드 리자몽 꼬부기 어니부기 거북왕 니드런♀ 니드리나 니드퀸 니드런♂ 니드리노 니드킹 삐 삐삐 픽시 푸린 푸크린 킬리아 가디안 한바이트 한카리아스 터검니 액슨도 액스라이즈 나무지기 나무돌이 나무킹 아차모 영치코 번치코 물짱이 늪짱이 대짱이 불꽃숭이 파이숭이 초염몽 팽도리 팽태자 엠페르트 뚜꾸리 차오꿀 염무왕 수댕이 쌍검자비 대검귀 주리비얀 샤비 샤로다 피카츄 라이츄 루카리오 리오르 에레키드 에레브 에레키블 알통몬 근육몬 괴력몬 망키 성원숭 팬텀 고우스트 고스트 망나뇽 마기라스 데기라스 포푸니 포푸니라 악비르 악비아르 고릴타 채키몽 흥나숭 버프론'.split(/\s+/));
  const MYTHIC_LIST = [['그란돈의 골격','공격 +20%, 대신 매 턴 HP 소량 감소'],['백옥','특수공격 +20% 증가'],['가이오가의 심장','방어/특방 +10%, 급소 피해 감소'],['금강석','체력 30% 이하일 때 다음 행동 우선']];
  const ARTISAN_LIST = [['각성의 창','체력 50% 이하 시 공격/특수공격 1단계 상승'],['투지의 혈청','아군 기절 뒤 교체 시 첫 공격 +25%'],['사냥 본능','상대 체력 40% 이하일 때 피해 +20%'],['폭풍 발톱','같은 타입 연속 사용 시 위력 증가'],['불굴의 갑옷','체력 30% 이하일 때 방어/특방 상승'],['금빛성광','첫 턴 스피드 1단계 상승'],['무한 성장약','KO 시 랜덤 능력치 상승'],['신속의 신발','느리게 행동 후 다음 턴 스피드 상승'],['삼신기 파편','전투 시작 시 공격/방어/스피드 중 하나 상승'],['봉인 사슬','초반 약화, 체력 50% 이하 시 강화']];
  function core(){ return PB.core; }
  function getPlayer(){ return core()?.getPlayer?.('p1') || core()?.getActivePlayer?.(); }
  function allOwned(){ const p=getPlayer(); return [...(p?.squad||[]), ...(p?.reserve||[])]; }
  function typesOf(mon){ const b=mon?.base||mon||{}; const t=mon?.currentTypes || b.type || b.types || []; return Array.isArray(t)?t:[t].filter(Boolean); }
  function statsOf(mon){ const b=mon?.base||mon||{}; return b.speciesStats || b.stats || {}; }
  function assignBloodlineV4(mon){ if(!mon) return; if(!mon.bloodline || !BL_LABEL[mon.bloodline]){ const r=Math.random(); mon.bloodline = r < .80 ? 'normal' : r < .87 ? 'elite' : r < .90 ? 'ancient' : r < .91 ? 'mew' : 'normal'; } }
  function labelBloodline(mon){ assignBloodlineV4(mon); return BL_LABEL[mon?.bloodline || 'normal'] || '일반혈통'; }
  function isPunchMove(move){ return /펀치|Punch/i.test(String(move?.nameKo||move?.nameEn||'')); }
  function isPunchable(mon){ const name=mon?.currentName || mon?.base?.nameKo || mon?.nameKo || ''; const st=statsOf(mon); return PUNCHABLE.has(name) || typesOf(mon).includes('격투') || Number(st.attack||0) >= 95; }
  function canLearnTMV4(mon, move){
    if(!mon || !move) return false;
    const t=typesOf(mon), st=statsOf(mon), name=move.nameKo;
    if(move.category === '변화') return true;
    if(move.type === '노말') return true;
    if(isPunchMove(move)) return isPunchable(mon);
    if(name === '악의파동') return t.includes('악') || t.includes('고스트') || Number(st.spAttack||0) >= 105;
    if(name === '매지컬샤인') return t.includes('에스퍼') || t.includes('풀') || t.includes('페어리') || ['가디안','픽시','삐삐','푸크린'].includes(mon.currentName||mon.base?.nameKo);
    if(name === '냉동빔') return t.includes('얼음') || t.includes('물');
    if(name === '얼어붙은바람') return t.includes('얼음') || t.includes('물') || t.includes('비행');
    if(name === '지진') return t.includes('땅') || t.includes('바위') || t.includes('강철') || (Number(st.attack||0) >= 105 && !t.includes('비행'));
    if(name === '인파이트') return t.includes('격투') || (isPunchable(mon) && Number(st.attack||0) >= 90);
    if(name === '스톤샤워') return t.includes('바위') || t.includes('땅') || t.includes('격투') || Number(st.attack||0) >= 100;
    if(name === '용성군') return t.includes('드래곤');
    if(name === '탁쳐서떨구기') return t.includes('악') || t.includes('고스트') || Number(st.attack||0) >= 80;
    if(name === '10만볼트') return t.includes('전기');
    if(name === '섀도볼') return t.includes('고스트') || t.includes('에스퍼');
    if(name === '화염방사') return t.includes('불꽃');
    return t.includes(move.type);
  }
  function patchItemsAndShop(){
    const c=core(); if(!c?.state) return;
    const list=c.state.itemList || [];
    list.forEach((it)=>{
      const id=norm(it.id);
      if(id.startsWith('tm_') || it.category === '기술머신'){
        it.category = '기술머신';
        if(TM_PRICE[id]) it.price = TM_PRICE[id];
        else if(Number(it.price||0) > 0 && !it.__v4TmPriceRaised){ it.price = Math.round(Number(it.price) * 3); it.__v4TmPriceRaised = true; }
        if(it.tmMove){
          it.description = `${it.tmMove.nameKo} 기술머신입니다. ${TM_NOTES[id] || '조건에 맞는 포켓몬에게 가르칠 수 있습니다.'}`;
          it.battleEffect = `타입 ${it.tmMove.type} · ${it.tmMove.category} · 위력 ${it.tmMove.power ?? '-'} · PP ${it.tmMove.pp}`;
        }
      }
    });
    if(!c.__v4ShopPatch){
      c.__v4ShopPatch=true;
      const oldShop=c.getShopCatalog;
      c.getShopCatalog=function(){
        return (oldShop?oldShop.apply(this, arguments):(this.state.itemList||[])).filter((it)=>{
          const id=norm(it.id), name=String(it.nameKo||'');
          if(SHOP_BLOCK.has(id)) return false;
          if(it.craftType === 'mythic' || it.craftType === 'artisan') return false;
          if(/신화의\s*파편|신화의파편|장인의\s*지식|장인의지식/.test(name + ' ' + String(it.description||''))) return false;
          return true;
        }).map((it)=>{
          const id=norm(it.id);
          if(TM_PRICE[id]) return {...it, price:TM_PRICE[id], description:it.description, battleEffect:it.battleEffect};
          return it;
        });
      };
    }
    if(!c.__v4ToggleTmPatch){
      c.__v4ToggleTmPatch=true;
      const oldToggle=c.toggleHeldItem;
      c.toggleHeldItem=function(uid){
        const player=c.getActivePlayer?.() || c.getPlayer?.('p1');
        const selected=norm(c.state.selectedItemId);
        const item=(c.state.itemsById?.get?.(selected)) || (c.state.itemList||[]).find(x=>norm(x.id)===selected);
        if(item?.category === '기술머신'){
          const mon=[...(player?.squad||[]), ...(player?.reserve||[])].find(p=>p.uid===uid);
          const bag=(player?.bag?.consumables||[]).find(x=>norm(x.id)===selected);
          if(!mon || !bag || Number(bag.amount||0)<=0){ PB.ui?.showToast?.('기술머신이 부족합니다.'); return; }
          const move=item.tmMove;
          if(!canLearnTMV4(mon, move)){ PB.ui?.showToast?.(`${mon.currentName}는 ${move?.nameKo || '이 기술'}을 배울 수 없습니다.`); return; }
          mon.moves=mon.moves||[];
          if(mon.moves.some(m=>m.nameKo===move.nameKo)){ PB.ui?.showToast?.('이미 배운 기술입니다.'); return; }
          const learned={...move,currentPP:move.pp,maxPP:move.pp};
          if(mon.moves.length>=3) mon.moves[mon.moves.length-1]=learned; else mon.moves.push(learned);
          bag.amount = Math.max(0, Number(bag.amount||0)-1);
          c.state.selectedItemId=null;
          PB.ui?.showToast?.(`${mon.currentName}가 ${move.nameKo}을 배웠습니다.`);
          PB.ui?.renderAll?.();
          return;
        }
        return oldToggle?.apply(this, arguments);
      };
    }
    window.PB_TM_LEARN_V4 = canLearnTMV4;
  }
  function patchCore(){
    const c=core(); if(!c || c.__v4CorePatch) return; c.__v4CorePatch=true;
    const oldCreate=c.createRuntimePokemon;
    c.createRuntimePokemon=function(base, level){ const p=oldCreate.apply(this, arguments); assignBloodlineV4(p); return p; };
    const oldRecalc=c.recalculateRuntimeStats;
    if(oldRecalc) c.recalculateRuntimeStats=function(p, opts){ const r=oldRecalc.apply(this, arguments); assignBloodlineV4(p); return r; };
  }
  function patchDungeon(){
    if(!PB.dungeon || PB.dungeon.__v4DungeonPatch) return; PB.dungeon.__v4DungeonPatch=true;
    const D={route201:{id:'route201',name:'201번도로',boss:'다크라이',min:0,theme:'route',pos:'left:12%;top:76%;'},galaxy:{id:'galaxy',name:'갤럭시단 빌딩',boss:'포푸니라',min:25,theme:'galaxy',pos:'left:69%;top:50%;'},distortion:{id:'distortion',name:'깨어진 세계',boss:'기라티나',min:50,theme:'distortion',pos:'left:51%;top:41%;'}};
    let selected='route201';
    const maxLevel=()=>Math.max(0,...((getPlayer()?.squad||[]).map(p=>Number(p.level||0))));
    const canEnter=(cfg)=> maxLevel()>=cfg.min;
    const mk=(name,lv)=>{ const base=core()?.state?.allPokemon?.find(p=>p.nameKo===name) || core()?.state?.allPokemon?.[0]; return core()?.createRuntimePokemon(base, Math.max(1,lv)); };
    const randomEnemy=(lv)=>{ const c=core(); const pool=(c?.state?.allPokemon||[]).filter(p=>p&&!p.isMegaEvolution&&!c.shouldExcludeLegend?.(p)); return c.createRuntimePokemon(pool[Math.floor(Math.random()*pool.length)]||pool[0], lv); };
    PB.dungeon.renderCategory=function(){ const cfg=D[selected]; const lvl=maxLevel(); return `<section class="panel-card dungeon-map-panel"><div class="section-title-row"><div><h1 class="section-title">던전</h1><p class="section-caption">레벨 조건만 충족하면 도전할 수 있습니다. 현재 최고 Lv.${lvl}</p></div><button class="chip-btn" data-dungeon-map-start="1">도전</button></div><div class="dungeon-map-stage" style="background-image:url('pokemap.jpg');"><button class="dungeon-map-btn route" style="${D.route201.pos}" data-dungeon-map-select="route201"><i></i><span>201번도로</span></button><button class="dungeon-map-btn galaxy" style="${D.galaxy.pos}" data-dungeon-map-select="galaxy"><i></i><span>갤럭시단빌딩</span></button><button class="dungeon-map-btn distortion" style="${D.distortion.pos}" data-dungeon-map-select="distortion"><i></i><span>깨어진세계</span></button></div><div class="placeholder-card"><h3>${cfg.name}</h3><p>보스 ${cfg.boss} · 필요 레벨 ${cfg.min||'없음'} · ${canEnter(cfg)?'도전 가능':'레벨 부족'}</p><p>보상: KO마다 Lv.+1~2, 재화, 알 조각, 신화의 파편, 장인의 지식(갤럭시단/깨어진 세계)</p></div></section>`; };
    PB.dungeon.bindCategory=function(root){ root.querySelectorAll('[data-dungeon-map-select]').forEach(btn=>btn.addEventListener('click',()=>{selected=btn.dataset.dungeonMapSelect; PB.ui?.renderAll?.();})); root.querySelectorAll('[data-dungeon-map-start]').forEach(btn=>btn.addEventListener('click',()=>{ const cfg=D[selected]; if(!canEnter(cfg)) return PB.ui?.showToast?.('출전 포켓몬 레벨이 부족합니다.'); const player=getPlayer(); const lv=Math.max(5, Number(player?.squad?.[0]?.level || maxLevel())); const foe=[randomEnemy(lv), mk(cfg.boss, Math.max(1,lv-3))]; PB.battleEngine.startBattle({playerId:'p1',opponentId:cfg.id+'_boss',playerName:player.name,opponentName:cfg.name,playerTeam:player.squad,opponentTeam:foe,mode:'dungeon',theme:cfg.theme,specialBgm:selected==='route201'?'enter_darkrai.mp3':null,skipLevelReward:true,onComplete:(payload)=>{ const won=payload?.winnerId==='p1'; if(won){ const stats=payload.stats||{}; const koAny=Object.values(stats).some(s=>s&&s.kos>0); player.squad.forEach(p=>{ if(koAny) core().applyLevelReward?.(p,1+Math.floor(Math.random()*2),{}); }); core().addMoney?.('p1',80+Math.floor(Math.random()*80)); core().addConsumable?.('p1','egg_shard',1+Math.floor(Math.random()*3)); if(selected!=='route201'){ core().addConsumable?.('p1','mythic_fragment',selected==='distortion'?2:1); core().addConsumable?.('p1','artisan_knowledge',1); } } core().healPlayerTeam?.('p1'); setTimeout(()=>{core().returnToLobby?.(); PB.ui?.showToast?.(won?'던전 클리어':'던전 패배');},2200); return true;} }); })); };
  }
  function inflatePokemon(data){
    const c=core(); const base=(c?.state?.allPokemon||[]).find(b=>Number(b.id)===Number(data?.baseId)); if(!base) return null;
    const p=c.createRuntimePokemon(base, Number(data.level||5));
    Object.assign(p,{uid:data.uid||p.uid,candyUsed:Number(data.candyUsed||0),enhanceLevel:Number(data.enhanceLevel||0),preventEvolution:Boolean(data.preventEvolution),bloodline:data.bloodline||p.bloodline,koCount:Number(data.koCount||0),koStars:Number(data.koStars||0),totalExp:Number(data.totalExp||0),isShiny:Boolean(data.isShiny),shinyKey:data.shinyKey||null});
    p.heldItems=JSON.parse(JSON.stringify(data.heldItems||[])); p.heldItem=p.heldItems[0]||null;
    c.recalculateRuntimeStats?.(p,{fullHeal:true}); p.currentHp=Math.min(p.maxHp, Number(data.currentHp||p.maxHp)); return p;
  }
  function restoreCharacterToGame(ch){
    const c=core(); if(!c || !ch?.player) return;
    c.state.players.p1 = { id:'p1', name:ch.name || ch.player.name || '트레이너', money:Number(ch.player.money||300), bag:JSON.parse(JSON.stringify(ch.player.bag||{holdables:[],consumables:[]})), squad:(ch.player.squad||[]).map(inflatePokemon).filter(Boolean), reserve:(ch.player.reserve||[]).map(inflatePokemon).filter(Boolean) };
    c.state.activePlayerId='p1'; c.state.gameMode='single'; c.state.currentCategory='squad'; c.state.currentScreen='lobby';
  }
  async function deleteCurrentCharacterV4(){
    const online=window.PB_ONLINE_V3?.getOnlineState?.() || PB.online || {}; const slot=online.selectedSlot || 'char1';
    if(!online.characters || !online.characters[slot]){ PB.ui?.showToast?.('삭제할 캐릭터가 없습니다.'); return false; }
    const deletedName=online.characters[slot].name || slot;
    delete online.characters[slot];
    if(online.localStore?.characters) delete online.localStore.characters[slot];
    const nextSlot=online.characters.char1 ? 'char1' : (online.characters.char2 ? 'char2' : null);
    online.selectedSlot=nextSlot; online.selectedCharacter=nextSlot ? online.characters[nextSlot] : null;
    try { localStorage.setItem('pokebattle-online-expansion-v1', JSON.stringify(online.localStore||{})); } catch(e) {}
    if(online.db && online.uid){
      try{ await online.db.ref(`characters/${online.uid}/${slot}`).remove(); }catch(e){}
      try{ await online.db.ref(`saves/${online.uid}/${slot}`).remove(); }catch(e){}
      try{ await online.db.ref(`playerPublicList/${online.uid}_${slot}`).set({uid:online.uid, slot, deleted:true, hidden:true, updatedAt:Date.now()}); }catch(e){}
    }
    if(online.selectedCharacter) restoreCharacterToGame(online.selectedCharacter);
    else { core().state.currentScreen='title'; PB.ui?.showScreen?.('title'); }
    window.PB_ONLINE_V3?.renderAuthPanel?.(); PB.ui?.renderAll?.(); PB.ui?.showToast?.(`${deletedName} 삭제 완료`); return true;
  }
  function patchOnlineDelete(){ if(window.PB_ONLINE_V3 && !window.PB_ONLINE_V3.__v4DeletePatch){ window.PB_ONLINE_V3.__v4DeletePatch=true; window.PB_ONLINE_V3.deleteCurrentCharacter=deleteCurrentCharacterV4; } }
  function showIntroV4(){
    const online=window.PB_ONLINE_V3?.getOnlineState?.() || PB.online || {}; const c=core(); const lobby=document.getElementById('lobby-screen');
    if(!c||!lobby||lobby.classList.contains('hidden')||!online.selectedCharacter) return;
    const p=getPlayer(); if(!p || !(p.squad||[]).length) return;
    document.body.classList.add('pb-lobby-intro-bg-v4');
    const key='pb_intro_v4_seen_'+(online.uid||'local')+'_'+(online.selectedSlot||'char')+'_'+(online.selectedCharacter.createdAt||online.selectedCharacter.name||'new');
    if(localStorage.getItem(key) || document.getElementById('pb-intro-v4')) return;
    const div=document.createElement('div'); div.id='pb-intro-v4';
    div.innerHTML='<div class="pb-intro-card-v4"><p>당신은 배틀에 필요한 몇가지 물건을 챙겨서 최고의 포켓몬들을 다루기 위해 길을 떠났습니다. 경쟁자들을 이기고 올라가서 플레이어 챔피언이 되어보세요.</p><button type="button" class="pb-intro-arrow-v4">▶</button></div>';
    document.body.appendChild(div);
    div.querySelector('button').addEventListener('click',()=>{ localStorage.setItem(key,'1'); div.classList.add('closing'); setTimeout(()=>div.remove(),760); });
  }
  function addClassesAndDecorate(){
    const area=document.getElementById('content-area'); if(area){ area.classList.toggle('online-view-market', PB.core?.state?.currentCategory==='league' && (PB.online?.view==='market')); area.classList.toggle('online-view-challenge', PB.core?.state?.currentCategory==='league' && (PB.online?.view==='challenge')); }
    document.querySelectorAll('.bloodline-text-v3,.battle-bloodline-v3').forEach(el=>{ const text=el.textContent||''; const key=text.includes('뮤')?'mew':text.includes('고대')?'ancient':text.includes('우수')?'elite':'normal'; el.style.background=BL_COLOR[key]; el.style.color=(key==='ancient'?'#1b1400':'#fff'); el.style.border='1px solid rgba(255,255,255,.55)'; el.style.textShadow='none'; el.style.boxShadow='none'; });
    document.querySelectorAll('[data-select-uid]').forEach(card=>{ const uid=card.dataset.selectUid; const mon=allOwned().find(x=>x.uid===uid); if(!mon) return; let b=card.querySelector('.bloodline-text-v3'); if(b){ const key=mon.bloodline||'normal'; b.style.background=BL_COLOR[key]||BL_COLOR.normal; b.style.color=(key==='ancient'?'#1b1400':'#fff'); b.style.border='1px solid rgba(255,255,255,.55)'; b.style.textShadow='none'; b.style.boxShadow='none'; } });
    document.querySelectorAll('.stat-value.is-best').forEach(n=>{ n.style.color='#ff8a00'; n.style.webkitTextFillColor='#ff8a00'; n.style.border='0'; n.style.boxShadow='none'; n.style.fontWeight='1000'; });
    const moveBtns=document.querySelectorAll('.battle-move-button,.battle-move-button *'); moveBtns.forEach(n=>{ if(!n.classList?.contains('type-badge')) { n.style.color='#050b18'; n.style.textShadow='none'; } });
    // keep delete button visible in any settings modal body
    const modal=document.querySelector('#modal-root .modal'); if(modal && /환경설정|설정/.test(modal.textContent||'') && !modal.querySelector('[data-delete-character-v4]')){
      const body=modal.querySelector('.modal-body')||modal;
      body.insertAdjacentHTML('beforeend','<section class="settings-section delete-character-section-v4"><h3>캐릭터 삭제</h3><p>현재 선택 캐릭터만 삭제합니다. 10번 눌러야 확정됩니다.</p><button type="button" class="settings-choice danger" data-delete-character-v4="1">캐릭터 삭제 0/10</button></section>');
    }
  }
  function popup(title, rows){
    const root=document.getElementById('modal-root'); if(!root) return;
    root.innerHTML='<div class="overlay" data-modal-overlay><div class="modal v4-popup"><div class="modal-header"><div class="modal-title-wrap"><h2>'+title+'</h2><p>목록을 확인합니다.</p></div><button class="mini-icon-btn" data-close-modal type="button">✕</button></div><div class="modal-body"><div class="placeholder-stack">'+rows.map(r=>'<div class="placeholder-card"><h3>'+r[0]+'</h3><p>'+r[1]+'</p></div>').join('')+'</div></div></div></div>';
  }
  function injectStyle(){ if(document.getElementById('update-v4-style')) return; const st=document.createElement('style'); st.id='update-v4-style'; st.textContent=`
    /* v4 readable text: white only on intentionally transparent dark panels, black on white cards */
    body.theme-basic .content-scroll .placeholder-card:not(.bloodline-tip-card-v3):not(.craft-list-card-v3):not(#crafting-panel-v2),
    body.theme-basic .summary-card, body.theme-basic .pokemon-card, body.theme-basic .reserve-chip{color:#050b18!important;}
    body.theme-basic .content-scroll .placeholder-card:not(.bloodline-tip-card-v3):not(.craft-list-card-v3):not(#crafting-panel-v2) :is(p,span,div,h1,h2,h3,h4,strong,small),
    body.theme-basic .summary-card :is(p,span,div,h1,h2,h3,h4,strong,small), body.theme-basic .pokemon-card :is(p,span,div,h1,h2,h3,h4,strong,small), body.theme-basic .reserve-chip :is(p,span,div,h1,h2,h3,h4,strong,small){color:#050b18!important;font-weight:900!important;}
    #content-area.online-view-market .placeholder-card,#content-area.online-view-market .online-market-row,#content-area.online-view-challenge .placeholder-card,#content-area.online-view-challenge .online-badge-card{background:rgba(9,22,40,.22)!important;border:1px solid rgba(126,207,255,.30)!important;box-shadow:0 16px 40px rgba(0,0,0,.18)!important;backdrop-filter:blur(10px)!important;color:#fff!important;}
    #content-area.online-view-market .placeholder-card *,#content-area.online-view-market .online-market-row *,#content-area.online-view-challenge .placeholder-card *,#content-area.online-view-challenge .online-badge-card *{color:#fff!important;text-shadow:0 1px 5px rgba(0,0,0,.6)!important;font-weight:900!important;}
    #content-area.online-view-market .chip-btn,#content-area.online-view-market .online-small-btn,#content-area.online-view-challenge .chip-btn,#content-area.online-view-challenge .online-small-btn{background:rgba(126,207,255,.16)!important;border-color:rgba(126,207,255,.45)!important;color:#fff!important;}
    .bloodline-text-v3,.battle-bloodline-v3{background:rgba(0,0,0,.45)!important;border:1px solid currentColor!important;font-weight:1000!important;}
    .bloodline-text-v3{right:9px!important;bottom:8px!important}.bloodline-text-v3.overview{top:8px!important;bottom:auto!important;}
    .battle-move-button,.battle-move-button :not(.type-badge):not(.battle-category-pill){color:#050b18!important;text-shadow:none!important}.battle-move-button{background:rgba(255,255,255,.92)!important;}
    .stat-value.is-best{color:#ff8a00!important;-webkit-text-fill-color:#ff8a00!important;border:0!important;box-shadow:none!important;text-shadow:0 0 8px rgba(255,138,0,.42)!important;font-weight:1000!important;}
    .battle-screen[data-battle-theme="beginner"] .battle-top{background-image:linear-gradient(rgba(0,0,0,.08),rgba(0,0,0,.20)),url('bgback.jpg')!important;background-size:cover!important;background-position:center!important;--battle-ground:transparent!important;}
    .battle-screen[data-battle-theme="city"] .battle-top,.battle-screen:not([data-battle-theme="beginner"]):not([data-battle-theme="route"]):not([data-battle-theme="galaxy"]):not([data-battle-theme="distortion"]) .battle-top{background-image:linear-gradient(rgba(0,0,0,.12),rgba(0,0,0,.22)),url('citybattle.jpg')!important;background-size:cover!important;background-position:center!important;--battle-ground:transparent!important;}
    .battle-screen[data-battle-theme="beginner"] .battle-top::after,.battle-screen[data-battle-theme="city"] .battle-top::after{display:none!important;}
    .battle-status-card{background:rgba(102,54,154,.48)!important;background-image:none!important;border:1px solid rgba(232,188,255,.42)!important;backdrop-filter:blur(10px)!important;}
    .delete-character-section-v4{margin-top:12px;border:1px solid rgba(255,105,105,.32);border-radius:18px;padding:12px;background:rgba(130,24,32,.18);}.delete-character-section-v4 h3,.delete-character-section-v4 p{color:#fff!important}.delete-character-section-v4 .danger{background:rgba(255,72,72,.24)!important;color:#fff!important;border:1px solid rgba(255,132,132,.48)!important;}
    .pb-lobby-intro-bg-v4 #lobby-screen,.pb-lobby-intro-bg-v4 .app-root{background-image:linear-gradient(rgba(3,8,18,.24),rgba(3,8,18,.34)),url('pokebackground.png')!important;background-size:cover!important;background-position:center!important;}
    .pb-lobby-intro-bg-v4 #lobby-screen .top-shell,.pb-lobby-intro-bg-v4 #lobby-screen .bottom-nav{background:rgba(9,22,40,.56)!important;backdrop-filter:blur(12px)!important;}
    #pb-intro-v2,#pb-intro-v3{display:none!important;}
    #pb-intro-v4{position:fixed;inset:0;z-index:100000;background:url('pokebackground.png') center/cover no-repeat;display:flex;align-items:flex-end;justify-content:center;padding:24px;transition:opacity .72s ease;}#pb-intro-v4.closing{opacity:0;pointer-events:none}.pb-intro-card-v4{max-width:520px;width:100%;border-radius:22px;background:rgba(255,255,255,.78);color:#050b18;font-weight:1000;line-height:1.65;padding:18px 18px 46px;box-shadow:0 18px 50px rgba(0,0,0,.35);position:relative;border:1px solid rgba(255,255,255,.76);}.pb-intro-card-v4 p{margin:0;color:#050b18!important;font-weight:1000!important}.pb-intro-arrow-v4{position:absolute;right:18px;bottom:12px;color:#e62222!important;background:transparent;font-size:20px;animation:introBlinkV4 1s infinite}@keyframes introBlinkV4{50%{opacity:.35}}
  `; document.head.appendChild(st); }
  document.addEventListener('click', async (e)=>{
    const close=e.target.closest('[data-close-modal], .overlay[data-modal-overlay]');
    if(close && (e.target.matches('[data-close-modal]') || e.target.classList.contains('overlay'))){ const root=document.getElementById('modal-root'); if(root) root.innerHTML=''; return; }
    const v4del=e.target.closest('[data-delete-character-v4]');
    if(v4del){ e.preventDefault(); e.stopImmediatePropagation(); const n=Number(v4del.dataset.count||0)+1; v4del.dataset.count=n; v4del.textContent=`캐릭터 삭제 ${n}/10`; if(n>=10){ await deleteCurrentCharacterV4(); const root=document.getElementById('modal-root'); if(root) root.innerHTML=''; } return; }
    const list=e.target.closest('[data-item-list-popup-v3]');
    if(list){ e.preventDefault(); e.stopImmediatePropagation(); const type=list.dataset.itemListPopupV3; popup(type==='mythic'?'신화 지닌물건':'제작 지닌물건', type==='mythic'?MYTHIC_LIST:ARTISAN_LIST); return; }
    const tip=e.target.closest('[data-bloodline-tip-v3]');
    if(tip){ e.preventDefault(); e.stopImmediatePropagation(); popup('혈통 TIP', [['일반혈통','기본 능력치입니다. 확률 80%'],['우수혈통','전체 능력치가 소폭 증가합니다. 파란 오라. 확률 7%'],['고대혈통','주요 능력치가 증가합니다. 노란 오라. 확률 1%'],['뮤의 후손','주요 능력치와 보조 능력치가 함께 증가합니다. 보라 오라. 확률 1%']]); return; }
  }, true);
  function tick(){ injectStyle(); patchCore(); patchOnlineDelete(); patchItemsAndShop(); patchDungeon(); showIntroV4(); addClassesAndDecorate(); }
  document.addEventListener('DOMContentLoaded',()=>{ setTimeout(tick,350); /* v8: recurring tick disabled */ });
})();
