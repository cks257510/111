
(function(){
  'use strict';
  const PB = window.POKEBATTLE || (window.POKEBATTLE = {});
  const norm = (v)=>String(v||'').toLowerCase().replace(/[^a-z0-9_가-힣]/g,'');
  const BL_LABEL = { normal:'일반혈통', elite:'우수혈통', ancient:'고대혈통', mew:'뮤의 후손' };
  const SHOP_BLOCK_IDS = new Set(['groudon_skeleton','palkia_pearl','kyogre_heart','dialga_diamond','awakening_lance','fighting_serum','hunting_instinct','storm_claw','unyielding_armor','golden_starlight','infinite_growth_drug','swift_boots','tri_relic_fragment','sealing_chain']);
  const MYTHIC_LIST = [
    ['그란돈의 골격','공격 +20%, 대신 매 턴 HP 소량 감소'], ['백옥','특수공격 +20% 증가'], ['가이오가의 심장','방어/특방 +10%, 급소 피해 감소'], ['금강석','전투 중 한 번, 체력 30% 이하일 때 다음 행동 우선']
  ];
  const ARTISAN_LIST = [
    ['각성의 창','체력 50% 이하가 되면 공격/특수공격 1단계 상승'], ['투지의 혈청','아군이 쓰러진 뒤 교체되면 첫 공격 위력 +25%'], ['사냥 본능','상대 체력 40% 이하일 때 피해 +20%'], ['폭풍 발톱','같은 타입 연속 사용 시 위력 증가, 최대 3회'], ['불굴의 갑옷','체력 30% 이하일 때 방어/특방 1단계 상승'], ['금빛성광','전투 첫 턴 스피드 1단계 상승'], ['무한 성장약','상대를 쓰러뜨리면 랜덤 능력치 상승, 최대 3회'], ['신속의 신발','느리게 행동한 뒤 다음 턴 스피드 크게 상승'], ['삼신기 파편','전투 시작 시 공격/방어/스피드 중 하나 상승'], ['봉인 사슬','초반 능력치 -5%, 체력 50% 이하 시 전체 +10%']
  ];
  function getPlayer(){ return PB.core?.getPlayer?.('p1') || PB.core?.getActivePlayer?.(); }
  function allOwned(){ const p=getPlayer(); return [...(p?.squad||[]), ...(p?.reserve||[])]; }
  function ensureBloodlineV3(p){ if(!p) return; if(!p.bloodline){ const r=Math.random(); p.bloodline = r<.01?'mew':r<.04?'ancient':r<.11?'elite':'normal'; } }
  function labelBloodline(p){ ensureBloodlineV3(p); return BL_LABEL[p?.bloodline || 'normal'] || '일반혈통'; }
  function patchCore(){
    const c=PB.core; if(!c || c.__v3CorePatch) return; c.__v3CorePatch=true;
    const oldShop=c.getShopCatalog;
    c.getShopCatalog=function(){
      const list=(oldShop?oldShop.call(this):[]).filter(it=>{
        const id=norm(it.id);
        if(SHOP_BLOCK_IDS.has(id)) return false;
        if(it.craftType === 'mythic' || it.craftType === 'artisan') return false;
        const d=String(it.description||it.battleEffect||'');
        if(d.includes('신화의 파편') || d.includes('장인의 지식')) return false;
        return true;
      }).map(it=>{
        const id=norm(it.id);
        if(id==='rare_candy') return {...it, price:70};
        if(id==='mystery_egg') return {...it, price:500};
        if(id==='huge_egg') return {...it, price:6000};
        return it;
      });
      return list;
    };
    const oldCreate=c.createRuntimePokemon;
    c.createRuntimePokemon=function(){ const p=oldCreate.apply(this, arguments); ensureBloodlineV3(p); return p; };
    const oldAddReserve=c.addPokemonToReserve;
    if(oldAddReserve) c.addPokemonToReserve=function(playerId, runtimePokemon){ const player=c.getPlayer(playerId||c.state.activePlayerId); if(!player||!runtimePokemon) return false; let safety=8; while(safety-- >0 && c.maybeEvolve){ if(!c.maybeEvolve(runtimePokemon)) break; } player.reserve.push(runtimePokemon); return true; };
    const oldAddCollection=c.addPokemonToCollection;
    if(oldAddCollection) c.addPokemonToCollection=function(playerId, runtimePokemon){ const player=c.getPlayer(playerId||c.state.activePlayerId); if(!player||!runtimePokemon) return false; if((player.squad||[]).length<3) player.squad.push(runtimePokemon); else player.reserve.push(runtimePokemon); return true; };
  }
  function showIntroV3(){
    const c=PB.core; const lobby=document.getElementById('lobby-screen'); if(!c||!lobby||lobby.classList.contains('hidden')) return;
    const p=getPlayer(); if(!p || !(p.squad||[]).length) return;
    const key='pb_intro_v3_seen_' + (window.PB_ONLINE_V3?.getOnlineState?.()?.uid || 'local') + '_' + (window.PB_ONLINE_V3?.getOnlineState?.()?.selectedSlot || 'p1');
    if(localStorage.getItem(key)) { document.body.classList.add('pb-lobby-intro-bg-v3'); return; }
    localStorage.setItem(key,'1'); document.body.classList.add('pb-lobby-intro-bg-v3');
    const old=document.getElementById('pb-intro-v3'); if(old) old.remove();
    const div=document.createElement('div'); div.id='pb-intro-v3';
    div.innerHTML='<div class="pb-intro-card-v3"><p>당신은 배틀에 필요한 몇가지 물건을 챙겨서 최고의 포켓몬들을 다루기 위해 길을 떠났습니다. 경쟁자들을 이기고 올라가서 플레이어 챔피언이 되어보세요.</p><button type="button" class="pb-intro-arrow-v3">▶</button></div>';
    document.body.appendChild(div);
    div.querySelector('button').addEventListener('click',()=>{ div.classList.add('closing'); setTimeout(()=>div.remove(),760); });
  }
  function removeSeasonTexts(){
    const sl=document.getElementById('season-label'); if(sl) sl.textContent='';
    const ti=document.getElementById('turn-indicator'); if(ti) ti.textContent='';
    document.querySelectorAll('#content-area p,#content-area span,#content-area div').forEach(el=>{ if(el.childElementCount===0 && /시즌/.test(el.textContent||'')) el.textContent=el.textContent.replace(/시즌\s*\d+|시즌\s*종료|시즌 제한|시즌/g,'').trim(); });
  }
  function addBloodlineBadges(){
    document.querySelectorAll('[data-select-uid]').forEach(card=>{
      const uid=card.dataset.selectUid; const mon=allOwned().find(x=>x.uid===uid); if(!mon) return; ensureBloodlineV3(mon);
      let badge=card.querySelector('.bloodline-text-v3');
      if(!badge){ badge=document.createElement('span'); badge.className='bloodline-text-v3'; card.appendChild(badge); }
      badge.textContent=labelBloodline(mon);
    });
    document.querySelectorAll('.squad-grid [data-select-uid]').forEach((card, idx)=>{ if(idx===0 && !card.querySelector('.main-pokemon-badge-v3')) card.insertAdjacentHTML('afterbegin','<span class="main-pokemon-badge-v3">메인</span>'); });
    const modalRoot=document.getElementById('modal-root');
    if(modalRoot && modalRoot.textContent.includes('한눈에 보기')){
      allOwned().forEach(mon=>{ const cards=[...modalRoot.querySelectorAll('.placeholder-card')].filter(c=>c.textContent.includes(mon.currentName)); cards.forEach(card=>{ if(!card.querySelector('.bloodline-text-v3')){ const b=document.createElement('span'); b.className='bloodline-text-v3 overview'; b.textContent=labelBloodline(mon); card.style.position='relative'; card.appendChild(b); } }); });
    }
    const snap=PB.battleEngine?.getSnapshot?.();
    [['ally',snap?.ally],['enemy',snap?.enemy]].forEach(([side,mon])=>{
      const card=document.querySelector(`.battle-status-card.${side==='ally'?'ally':'enemy'}`); if(!card||!mon) return;
      let b=card.querySelector('.battle-bloodline-v3'); if(!b){ b=document.createElement('span'); b.className='battle-bloodline-v3'; card.appendChild(b); }
      b.textContent=labelBloodline(mon);
    });
  }
  function addTipButtons(){
    const root=document.getElementById('content-area'); if(!root) return;
    // v8: 스쿼드 상단 혈통 안내 카드는 레이아웃 밀림/중복 원인이어서 더 이상 자동 삽입하지 않습니다.
    if(PB.core?.state?.currentCategory==='items' && !root.querySelector('[data-item-list-popup-v3]')){
      root.insertAdjacentHTML('afterbegin','<div class="placeholder-card craft-list-card-v3"><div class="item-title-row"><h3>제작 목록</h3><span class="mini-badge">지닌물건</span></div><div class="online-mini-row"><button class="chip-btn" data-item-list-popup-v3="mythic">신화 지닌물건</button><button class="chip-btn" data-item-list-popup-v3="artisan">제작 지닌물건</button></div></div>');
    }
  }
  function popup(title, rows){
    const root=document.getElementById('modal-root'); if(!root) return;
    root.innerHTML='<div class="overlay" data-modal-overlay><div class="modal"><div class="modal-header"><div class="modal-title-wrap"><h2>'+title+'</h2><p>목록을 확인합니다.</p></div><button class="mini-icon-btn" data-close-modal>✕</button></div><div class="modal-body"><div class="placeholder-stack">'+rows.map(r=>'<div class="placeholder-card"><h3>'+r[0]+'</h3><p>'+r[1]+'</p></div>').join('')+'</div></div></div></div>';
  }
  function bloodTip(){ popup('혈통 TIP', [['일반혈통','기본 능력치입니다. 확률 80%'],['우수혈통','전체 능력치가 소폭 증가합니다. 파란 오라. 확률 7%'],['고대혈통','주요 능력치가 증가합니다. 노란 오라. 확률 3%'],['뮤의 후손','주요 능력치와 보조 능력치가 함께 증가합니다. 보라 오라. 확률 1%']]); }
  function injectSettingsDelete(){
    const grid=document.querySelector('.settings-grid'); if(!grid || grid.querySelector('[data-delete-character-v3]')) return;
    grid.insertAdjacentHTML('beforeend','<section class="settings-section delete-character-section-v3"><h3>캐릭터 삭제</h3><p>현재 선택 캐릭터를 삭제합니다. 실수 방지를 위해 10번 눌러야 합니다.</p><button type="button" class="settings-choice danger" data-delete-character-v3="1">캐릭터 삭제 0/10</button></section>');
  }
  function patchSettings(){
    if(!PB.ui || PB.ui.__v3SettingsPatch) return; PB.ui.__v3SettingsPatch=true;
    const old=PB.ui.renderSettingsModal;
    PB.ui.renderSettingsModal=function(){ const r=old.apply(this, arguments); setTimeout(injectSettingsDelete,20); return r; };
  }
  function patchBattle(){
    if(!PB.battleEngine || PB.battleEngine.__v3BattlePatch) return; PB.battleEngine.__v3BattlePatch=true;
    const oldStart=PB.battleEngine.startBattle;
    PB.battleEngine.startBattle=function(options){
      const res=oldStart.call(this, options||{});
      const screen=document.getElementById('battle-screen');
      if(screen){ const theme=(options?.theme==='beginner'||options?.mode==='competitive'&&options?.theme==='beginner')?'beginner':'city'; screen.dataset.battleTheme=theme; }
      setTimeout(()=>{ const screen=document.getElementById('battle-screen'); if(screen){ const s=PB.battleEngine.getSnapshot?.(); screen.dataset.battleTheme=s?.theme==='beginner'?'beginner':'city'; }}, 80);
      return res;
    };
  }
  function decorate(){
    patchCore(); patchSettings(); patchBattle(); showIntroV3(); removeSeasonTexts(); addBloodlineBadges(); addTipButtons();
    document.querySelectorAll('[data-start-mode="duo"]').forEach(n=>n.remove());
    document.querySelectorAll('.sell-chip,[data-sell-pokemon]').forEach(n=>n.remove());
    document.querySelectorAll('.stat-value.is-best').forEach(n=>{n.style.color='#ff9c32'; n.style.fontWeight='1000'; n.style.textShadow='0 0 8px rgba(255,156,50,.45)';});
    const screen=document.getElementById('battle-screen'); const snap=PB.battleEngine?.getSnapshot?.(); if(screen && snap?.active) screen.dataset.battleTheme=snap.theme==='beginner'?'beginner':'city';
  }
  function injectStyle(){ if(document.getElementById('update-v3-style')) return; const st=document.createElement('style'); st.id='update-v3-style'; st.textContent=`
    body:not(.theme-basic) .app-root, body:not(.theme-basic) .screen, .battle-screen, .lobby-screen{color:#fff;}
    body .top-shell *, body .bottom-nav *, body .battle-bottom *, body .battle-log, body .battle-turn-indicator{color:#fff!important;}
    body.theme-basic .placeholder-card, body.theme-basic .summary-card, body.theme-basic .pokemon-card, body.theme-basic .reserve-chip, body.theme-basic .online-market-row, body.theme-basic .online-badge-card{font-weight:900;}
    body.theme-basic .placeholder-card *, body.theme-basic .summary-card *, body.theme-basic .pokemon-card *, body.theme-basic .reserve-chip *, body.theme-basic .online-market-row *, body.theme-basic .online-badge-card *{font-weight:900;}
    #season-label,#turn-indicator,#trainer-switcher,.top-second-row{display:none!important;} .top-shell{gap:6px!important;padding-bottom:8px!important;}
    .sell-chip,[data-sell-pokemon]{display:none!important;}
    .stat-value.is-best{color:#ff9c32!important;font-weight:1000!important;text-shadow:0 0 8px rgba(255,156,50,.45)!important;}
    .battle-status-card{background:rgba(93,42,143,.54)!important;border:1px solid rgba(222,179,255,.38)!important;box-shadow:0 12px 30px rgba(26,6,46,.32)!important;backdrop-filter:blur(8px)!important;background-image:none!important;border-radius:18px!important;}
    .battle-status-card *{color:#fff!important;text-shadow:0 2px 5px rgba(0,0,0,.82)!important}.battle-status-card .type-badge{color:#fff!important;text-shadow:none!important;}
    .battle-screen .battle-top{background-size:cover!important;background-position:center!important;background-repeat:no-repeat!important;}
    .battle-screen[data-battle-theme="beginner"] .battle-top{background-image:linear-gradient(rgba(0,0,0,.08),rgba(0,0,0,.16)),url('bgback.jpg')!important;background-color:#10271a!important;}
    .battle-screen[data-battle-theme="city"] .battle-top,.battle-screen:not([data-battle-theme="beginner"]) .battle-top{background-image:linear-gradient(rgba(0,0,0,.12),rgba(0,0,0,.20)),url('citybattle.jpg')!important;background-color:#0a1f34!important;}
    .battle-scene{background:transparent!important;}
    .bloodline-text-v3{position:absolute;right:10px;bottom:8px;font-size:10px;font-weight:1000;border-radius:999px;padding:3px 7px;background:rgba(6,14,28,.72);color:#fff;z-index:4;} .bloodline-text-v3.overview{right:8px;top:8px;bottom:auto}.main-pokemon-badge-v3{position:absolute;left:10px;top:8px;font-size:10px;font-weight:1000;border-radius:999px;padding:3px 8px;background:linear-gradient(90deg,#ff9c32,#ffd06c);color:#101010;z-index:5;}
    .battle-bloodline-v3{position:absolute;right:9px;bottom:6px;font-size:10px;font-weight:1000;border-radius:999px;padding:2px 6px;background:rgba(0,0,0,.45);color:#fff;}
    .bloodline-tip-card-v3,.craft-list-card-v3{border-color:rgba(255,255,255,.28)!important;}
    .delete-character-section-v3 .danger{background:rgba(255,80,80,.18)!important;border-color:rgba(255,120,120,.42)!important;color:#fff!important;}
    .pb-lobby-intro-bg-v3 #lobby-screen,.pb-lobby-intro-bg-v3 .app-root{background-image:linear-gradient(rgba(3,8,18,.28),rgba(3,8,18,.34)),url('pokebackground.png')!important;background-size:cover!important;background-position:center!important;}
    .pb-lobby-intro-bg-v3 #lobby-screen .top-shell,.pb-lobby-intro-bg-v3 #lobby-screen .bottom-nav,.pb-lobby-intro-bg-v3 #content-area>.placeholder-card,.pb-lobby-intro-bg-v3 #content-area>.summary-card,.pb-lobby-intro-bg-v3 #content-area>.pokemon-card,.pb-lobby-intro-bg-v3 #content-area>.reserve-chip{background-color:rgba(13,19,31,.62)!important;backdrop-filter:blur(12px)!important;border-color:rgba(255,255,255,.18)!important;}
    #pb-intro-v3{position:fixed;inset:0;z-index:99999;background:url('pokebackground.png') center/cover no-repeat;display:flex;align-items:flex-end;justify-content:center;padding:24px;transition:opacity .72s ease;}#pb-intro-v3.closing{opacity:0;pointer-events:none}.pb-intro-card-v3{max-width:520px;width:100%;border-radius:22px;background:rgba(255,255,255,.78);color:#050b18;font-weight:1000;line-height:1.65;padding:18px 18px 46px;box-shadow:0 18px 50px rgba(0,0,0,.35);position:relative;border:1px solid rgba(255,255,255,.76);}.pb-intro-card-v3 p{margin:0;color:#050b18!important;font-weight:1000!important}.pb-intro-arrow-v3{position:absolute;right:18px;bottom:12px;color:#e62222!important;background:transparent;font-size:20px;animation:introBlinkV3 1s infinite}@keyframes introBlinkV3{50%{opacity:.35}}
  `; document.head.appendChild(st); }
  document.addEventListener('click', async (e)=>{
    if(e.target.closest('[data-bloodline-tip-v3]')) { bloodTip(); return; }
    const list=e.target.closest('[data-item-list-popup-v3]'); if(list){ const type=list.dataset.itemListPopupV3; popup(type==='mythic'?'신화 지닌물건':'제작 지닌물건', type==='mythic'?MYTHIC_LIST:ARTISAN_LIST); return; }
    const del=e.target.closest('[data-delete-character-v3]'); if(del){ const n=(Number(del.dataset.count||0)+1); del.dataset.count=n; del.textContent=`캐릭터 삭제 ${n}/10`; if(n>=10){ await window.PB_ONLINE_V3?.deleteCurrentCharacter?.(); PB.ui?.closeModal?.(); } return; }
  }, true);
  function tick(){ injectStyle(); decorate(); }
  document.addEventListener('DOMContentLoaded',()=>{ setTimeout(tick,250); /* v8: recurring tick disabled */ });
})();
