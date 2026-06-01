
(function(){
  'use strict';
  const PB = window.POKEBATTLE || (window.POKEBATTLE = {});
  const BL_LABEL = { normal:'일반혈통', elite:'우수혈통', ancient:'고대혈통', mew:'뮤의 후손' };
  const BL_BG = { normal:'#7b8494', elite:'#268cff', ancient:'#ffd13d', mew:'#b25cff' };
  const BL_FG = { normal:'#ffffff', elite:'#ffffff', ancient:'#1b1400', mew:'#ffffff' };
  const norm = (v)=>String(v||'').toLowerCase().replace(/[^a-z0-9_가-힣]/g,'');
  const getCore = ()=>PB.core;
  const getPlayer = ()=>PB.core?.getPlayer?.('p1') || PB.core?.getActivePlayer?.();
  const getMainLevel = ()=>Math.max(1, Number(getPlayer()?.squad?.[0]?.level || 5));
  function forceBloodline(mon){ if(!mon) return; if(!mon.bloodline || !BL_LABEL[mon.bloodline]){ const r=Math.random(); mon.bloodline = r < .80 ? 'normal' : r < .87 ? 'elite' : r < .90 ? 'ancient' : r < .91 ? 'mew' : 'normal'; } }
  function decorateBloodlineBlocks(){
    const all=[...(getPlayer()?.squad||[]),...(getPlayer()?.reserve||[])];
    const byUid=new Map(all.map(p=>[p.uid,p]));
    document.querySelectorAll('.bloodline-text-v3,.battle-bloodline-v3').forEach(el=>{
      const parent=el.closest('[data-select-uid]');
      let key=parent ? (byUid.get(parent.dataset.selectUid)?.bloodline) : null;
      const text=el.textContent||'';
      if(!key) key = text.includes('뮤')?'mew':text.includes('고대')?'ancient':text.includes('우수')?'elite':'normal';
      el.textContent = BL_LABEL[key] || '일반혈통';
      el.style.background = BL_BG[key] || BL_BG.normal;
      el.style.color = BL_FG[key] || '#fff';
      el.style.border = '1px solid rgba(255,255,255,.55)';
      el.style.boxShadow = 'none';
      el.style.textShadow = 'none';
      el.style.padding = '3px 8px';
      el.style.borderRadius = '999px';
      el.style.fontWeight = '1000';
    });
  }
  function patchCoreV6(){
    const c=getCore(); if(!c || c.__v6CorePatch) return; c.__v6CorePatch=true;
    const oldCreate=c.createRuntimePokemon;
    c.createRuntimePokemon=function(base, level){ const p=oldCreate.call(this, base, Math.min(100, Number(level||1))); forceBloodline(p); return p; };
    const oldApply=c.applyLevelReward;
    if(oldApply) c.applyLevelReward=function(p, n, opts){ const res=oldApply.call(this, p, n, opts); if(p){ p.level=Math.min(100, Number(p.level||1)); p.baseLevel=Math.min(100, Number(p.baseLevel||p.level||1)); } return res; };
    const oldSummary=c.getEnhanceSummary;
    if(oldSummary) c.getEnhanceSummary=function(p){ const s=oldSummary.call(this,p); s.unlocked=true; s.meetsLevel=Number(p?.level||0)>=36; if(s.target>=5){ s.rate=({5:.30,6:.20,7:.14,8:.10,9:.07,10:.04})[s.target]||.04; } return s; };
    const oldShop=c.getShopCatalog;
    if(oldShop) c.getShopCatalog=function(){ return oldShop.call(this).filter(it=>{ const id=norm(it.id), name=String(it.nameKo||''); return !['artisan_knowledge','mythic_fragment'].includes(id) && !/장인의\s*지식|신화의\s*파편|신화의파편/.test(name); }); };
  }
  function patchDungeonV6(){
    if(!PB.dungeon || PB.dungeon.__v6DungeonPatch) return; PB.dungeon.__v6DungeonPatch=true;
    const D={
      route201:{id:'route201',name:'201번도로',boss:'다크라이',min:0,theme:'route',pos:'left:12%;top:76%;'},
      galaxy:{id:'galaxy',name:'갤럭시단 빌딩',boss:'포푸니라',min:25,theme:'galaxy',pos:'left:69%;top:50%;'},
      distortion:{id:'distortion',name:'깨어진 세계',boss:'기라티나',min:50,theme:'distortion',pos:'left:51%;top:41%;'}
    };
    let selected='route201';
    const maxLevel=()=>Math.max(0,...((getPlayer()?.squad||[]).map(p=>Number(p.level||0))));
    const canEnter=(cfg)=>maxLevel()>=cfg.min;
    const mk=(name,lv)=>{ const c=getCore(); const base=c?.state?.allPokemon?.find(p=>p.nameKo===name) || c?.state?.allPokemon?.[0]; return c?.createRuntimePokemon(base, Math.max(1, Math.min(100, lv))); };
    const randomEnemy=(lv)=>{ const c=getCore(); const pool=(c?.state?.allPokemon||[]).filter(p=>p&&!p.isMegaEvolution&&!c.shouldExcludeLegend?.(p)); const base=pool[Math.floor(Math.random()*pool.length)]||pool[0]; return c?.createRuntimePokemon(base, Math.max(1, Math.min(100, lv))); };
    PB.dungeon.renderCategory=function(){ const cfg=D[selected], lvl=maxLevel(); return `<section class="panel-card dungeon-map-panel"><div class="section-title-row"><div><h1 class="section-title">던전</h1><p class="section-caption v6-white-text">레벨 조건만 충족하면 도전할 수 있습니다. 현재 최고 Lv.${lvl}</p></div><button class="chip-btn" data-dungeon-map-start="1">도전</button></div><div class="dungeon-map-stage" style="background-image:url('pokemap.jpg');"><button class="dungeon-map-btn route" style="${D.route201.pos}" data-dungeon-map-select="route201"><i></i><span>201번도로</span></button><button class="dungeon-map-btn galaxy" style="${D.galaxy.pos}" data-dungeon-map-select="galaxy"><i></i><span>갤럭시단빌딩</span></button><button class="dungeon-map-btn distortion" style="${D.distortion.pos}" data-dungeon-map-select="distortion"><i></i><span>깨어진세계</span></button></div><div class="placeholder-card dungeon-info-v6"><h3>${cfg.name}</h3><p>보스 ${cfg.boss} · 필요 레벨 ${cfg.min||'없음'} · ${canEnter(cfg)?'도전 가능':'레벨 부족'}</p><p>보상: KO마다 Lv.+1~2, 재화, 알 조각, 신화의 파편, 장인의 지식(갤럭시단/깨어진 세계)</p></div></section>`; };
    PB.dungeon.bindCategory=function(root){
      root.querySelectorAll('[data-dungeon-map-select]').forEach(btn=>btn.addEventListener('click',()=>{ selected=btn.dataset.dungeonMapSelect; PB.ui?.renderAll?.(); }));
      root.querySelectorAll('[data-dungeon-map-start]').forEach(btn=>btn.addEventListener('click',()=>{ const cfg=D[selected]; if(!canEnter(cfg)) return PB.ui?.showToast?.('출전 포켓몬 레벨이 부족합니다.'); const player=getPlayer(); const mainLv=getMainLevel(); const enemyLv=Math.max(1, Math.min(100, mainLv-3)); const foe=[randomEnemy(enemyLv), mk(cfg.boss, enemyLv)]; PB.battleEngine.startBattle({playerId:'p1',opponentId:cfg.id+'_boss',playerName:player.name,opponentName:cfg.name,playerTeam:player.squad,opponentTeam:foe,mode:'dungeon',theme:cfg.theme,specialBgm:selected==='route201'?'enter_darkrai.mp3':null,skipLevelReward:true,onComplete:(payload)=>{ const won=payload?.winnerId==='p1'; if(won){ const stats=payload.stats||{}; const koAny=Object.values(stats).some(s=>s&&s.kos>0); player.squad.forEach(p=>{ if(koAny) getCore().applyLevelReward?.(p,1+Math.floor(Math.random()*2),{}); }); getCore().addMoney?.('p1',80+Math.floor(Math.random()*80)); getCore().addConsumable?.('p1','egg_shard',1+Math.floor(Math.random()*3)); if(selected!=='route201'){ getCore().addConsumable?.('p1','mythic_fragment',selected==='distortion'?2:1); getCore().addConsumable?.('p1','artisan_knowledge',1); } } getCore().healPlayerTeam?.('p1'); setTimeout(()=>{getCore().returnToLobby?.(); PB.ui?.showToast?.(won?'던전 클리어':'던전 패배');},2200); return true;} }); }));
    };
  }
  function patchBattleV6(){
    if(!PB.battleEngine || PB.battleEngine.__v6BattlePatch) return; PB.battleEngine.__v6BattlePatch=true;
    const oldStart=PB.battleEngine.startBattle;
    PB.battleEngine.startBattle=function(options){
      const opt=options||{};
      if(opt.mode==='dungeon' && ['route','galaxy','distortion'].includes(opt.theme)) { document.body.dataset.pendingBattleTheme=opt.theme; const pre=document.getElementById('battle-screen'); if(pre) pre.dataset.battleTheme=opt.theme; } else { delete document.body.dataset.pendingBattleTheme; }
      const res=oldStart.call(this,opt);
      const set=()=>{ const screen=document.getElementById('battle-screen'); if(!screen) return; const snap=PB.battleEngine.getSnapshot?.(); let theme=opt.theme || snap?.theme || 'city'; if(opt.mode==='competitive') theme=theme==='beginner'?'beginner':'city'; screen.dataset.battleTheme=theme; };
      set(); setTimeout(set,0); setTimeout(set,60); setTimeout(set,180);
      return res;
    };
  }
  function patchOnlineV6(){
    const c=getCore(); const online=window.PB_ONLINE_V3?.getOnlineState?.() || PB.online || {};
    const player=getPlayer();
    if(player){
      player.money = Math.max(0, Math.min(Number(player.money ?? 100), 9999999));
      player.bag=player.bag||{holdables:[],consumables:[]}; player.bag.consumables=Array.isArray(player.bag.consumables)?player.bag.consumables:[];
      const ensure=(id,name)=>{ const item=player.bag.consumables.find(x=>norm(x.id)===id); if(item){ item.nameKo=name; if(!Number.isFinite(Number(item.amount))) item.amount=1; } else if(!online.__v6DefaultsGiven){ player.bag.consumables.push({id,nameKo:name,amount:1,category:'소비아이템'}); } };
      if(online.selectedCharacter && !online.selectedCharacter.__v6DefaultsGiven){ ensure('good_potion','고급상처약'); ensure('revive_shard','기력의조각'); online.selectedCharacter.__v6DefaultsGiven=true; online.__v6DefaultsGiven=true; }
    }
  }
  function decorateSpecificText(){
    // only requested labels/cards: keep original white cards untouched
    const whitePhrases=['혈통','포켓몬마다 랜덤 혈통이 부여됩니다.','제작 목록','지닌물건','제작','알/신화/제작','알 조각 10개로 알 교환','AI 트레이너에게 승리하면','신오 챌린지','배지 0/8','4세대 체육관','배지 교환','포인트 0','획득한 배지 포인트','레벨 조건만 충족하면','포켓몬 마켓','1/22','구매한 포켓몬은 리저브','내 포켓몬 판매'];
    document.querySelectorAll('#content-area .placeholder-card,#content-area .section-caption,#content-area .panel-card,#content-area .online-rank-card,#content-area .online-market-row').forEach(el=>{ const text=el.textContent||''; if(whitePhrases.some(p=>text.includes(p))){ el.classList.add('v6-white-target'); el.querySelectorAll('p,span,div,h1,h2,h3,h4,strong,small,button').forEach(n=>{ if(!n.closest('.type-badge')) n.classList.add('v6-white-text'); }); } });
    document.querySelectorAll('#content-area p,#content-area span,#content-area h1,#content-area h2,#content-area h3').forEach(el=>{ if((el.textContent||'').includes('메인 포켓몬 3마리 출전')) el.textContent='출전 포켓몬'; });
    document.querySelectorAll('#content-area .section-caption').forEach(el=>{ if((el.textContent||'').includes('출전 포켓몬')) el.classList.add('v6-white-text'); });
    document.querySelectorAll('#content-area .item-title-row span').forEach(el=>{ if(/시즌2|Lv\.60|60레벨/.test(el.textContent||'')) { el.textContent='Lv 36 이상 강화 가능'; el.classList.add('v6-white-text'); } });
    document.querySelectorAll('.stat-value.is-best').forEach(n=>{ n.style.color='#ff8a00'; n.style.webkitTextFillColor='#ff8a00'; n.style.textShadow='none'; n.style.border='0'; });
    document.querySelectorAll('.online-market-meta').forEach(n=>{ n.textContent=n.textContent.replace(/실전가\s*·\s*|실전기\s*·\s*/g,''); });
    document.querySelectorAll('#battle-action-grid .action-button,#battle-action-grid .action-button *').forEach(n=>{ if(!n.classList?.contains('type-badge')){ n.style.color='#050b18'; n.style.textShadow='none'; } });
    document.querySelectorAll('#items-panel [data-select-uid],#content-area .item-party-card').forEach(card=>card.querySelectorAll('.pokemon-level,.level,span').forEach(n=>{ if(/Lv\.?\s*\d+/.test(n.textContent||'')) n.style.color='#050b18'; }));
    document.querySelectorAll('.battle-matchup').forEach(n=>{ const t=n.textContent||''; if(t.includes('강함')) n.style.color='#159447'; else if(t.includes('약함')||t.includes('불리')) n.style.color='#d43232'; else n.style.color='#050b18'; n.style.fontWeight='1000'; });
    const screen=document.getElementById('battle-screen'); const snap=PB.battleEngine?.getSnapshot?.(); if(screen && snap?.active){ let th=snap.theme||screen.dataset.battleTheme||'city'; if(snap.mode==='competitive') th=th==='beginner'?'beginner':'city'; screen.dataset.battleTheme=th; }
  }
  function showIntroPerCharacter(){
    const online=window.PB_ONLINE_V3?.getOnlineState?.() || PB.online || {}; const c=getCore(); const lobby=document.getElementById('lobby-screen');
    if(!c||!lobby||lobby.classList.contains('hidden')||!online.selectedCharacter) return;
    const p=getPlayer(); if(!p || !(p.squad||[]).length) return;
    document.body.classList.add('pb-lobby-intro-bg-v6');
    const key='pb_intro_v6_seen_'+(online.uid||'local')+'_'+(online.selectedSlot||'char')+'_'+(online.selectedCharacter.createdAt||online.selectedCharacter.name||'new');
    if(localStorage.getItem(key) || document.getElementById('pb-intro-v6')) return;
    const div=document.createElement('div'); div.id='pb-intro-v6';
    div.innerHTML='<div class="pb-intro-card-v6"><p>당신은 배틀에 필요한 몇가지 물건을 챙겨서 최고의 포켓몬들을 다루기 위해 길을 떠났습니다. 경쟁자들을 이기고 올라가서 플레이어 챔피언이 되어보세요.</p><button type="button" class="pb-intro-arrow-v6">▶</button></div>';
    document.body.appendChild(div);
    div.querySelector('button').addEventListener('click',()=>{ localStorage.setItem(key,'1'); div.classList.add('closing'); setTimeout(()=>div.remove(),760); });
  }
  function injectStyle(){ if(document.getElementById('update-v6-style')) return; const st=document.createElement('style'); st.id='update-v6-style'; st.textContent=`
    #pb-intro-v2,#pb-intro-v3,#pb-intro-v4{display:none!important} #pb-intro-v6{position:fixed;inset:0;z-index:100001;background:url('pokebackground.png') center/cover no-repeat;display:flex;align-items:flex-end;justify-content:center;padding:24px;transition:opacity .72s ease}#pb-intro-v6.closing{opacity:0;pointer-events:none}.pb-intro-card-v6{max-width:520px;width:100%;border-radius:22px;background:rgba(255,255,255,.78);padding:18px 18px 46px;box-shadow:0 18px 50px rgba(0,0,0,.35);position:relative;border:1px solid rgba(255,255,255,.8);}.pb-intro-card-v6 p{margin:0;color:#050b18!important;font-weight:1000!important;line-height:1.65}.pb-intro-arrow-v6{position:absolute;right:18px;bottom:12px;color:#e62222!important;background:transparent;font-size:20px;animation:introBlinkV6 1s infinite}@keyframes introBlinkV6{50%{opacity:.35}}
    .pb-lobby-intro-bg-v6 #lobby-screen,.pb-lobby-intro-bg-v6 .app-root{background-image:linear-gradient(rgba(3,8,18,.24),rgba(3,8,18,.34)),url('pokebackground.png')!important;background-size:cover!important;background-position:center!important}.pb-lobby-intro-bg-v6 #lobby-screen .top-shell,.pb-lobby-intro-bg-v6 #lobby-screen .bottom-nav{background:rgba(9,22,40,.56)!important;backdrop-filter:blur(12px)!important}
    .v6-white-target{background:rgba(9,22,40,.22)!important;border-color:rgba(126,207,255,.30)!important;color:#fff!important}.v6-white-text{color:#fff!important;text-shadow:0 1px 5px rgba(0,0,0,.6)!important;font-weight:900!important}.v6-white-target .chip-btn{color:#fff!important;background:rgba(126,207,255,.16)!important;border-color:rgba(126,207,255,.45)!important}.bloodline-text-v3,.battle-bloodline-v3{box-shadow:none!important;text-shadow:none!important;border:1px solid rgba(255,255,255,.55)!important}.blood-elite,.blood-ancient,.blood-mew{box-shadow:none!important}.battle-action-grid .action-button,.battle-action-grid .action-button span,.battle-action-grid .action-button div:not(.type-badge){color:#050b18!important;text-shadow:none!important}.battle-action-grid .action-button{background:rgba(255,255,255,.94)!important}.battle-move-button,.battle-move-button :not(.type-badge):not(.battle-category-pill){color:#050b18!important;text-shadow:none!important}.stat-value.is-best{color:#ff8a00!important;-webkit-text-fill-color:#ff8a00!important;border:0!important;box-shadow:none!important;text-shadow:none!important}.battle-matchup{font-weight:1000!important}
    body[data-pending-battle-theme="route"] #battle-screen .battle-top,.battle-screen[data-battle-theme="route"] .battle-top{background-image:linear-gradient(rgba(0,0,0,.05),rgba(0,0,0,.12)),url('route.jpg')!important;background-size:cover!important;background-position:center!important;--battle-ground:transparent!important}body[data-pending-battle-theme="galaxy"] #battle-screen .battle-top,.battle-screen[data-battle-theme="galaxy"] .battle-top{background-image:linear-gradient(rgba(0,0,0,.08),rgba(0,0,0,.18)),url('galaxybuilding.gif')!important;background-size:cover!important;background-position:center!important;--battle-ground:transparent!important}body[data-pending-battle-theme="distortion"] #battle-screen .battle-top,.battle-screen[data-battle-theme="distortion"] .battle-top{background-image:linear-gradient(rgba(0,0,0,.08),rgba(0,0,0,.22)),url('DistortionWorld.png')!important;background-size:cover!important;background-position:center!important;--battle-ground:transparent!important}.battle-screen[data-battle-theme="beginner"] .battle-top{background-image:linear-gradient(rgba(0,0,0,.08),rgba(0,0,0,.20)),url('bgback.jpg')!important;background-size:cover!important;background-position:center!important;--battle-ground:transparent!important}.battle-screen[data-battle-theme="city"] .battle-top,.battle-screen:not([data-battle-theme="beginner"]):not([data-battle-theme="route"]):not([data-battle-theme="galaxy"]):not([data-battle-theme="distortion"]) .battle-top{background-image:linear-gradient(rgba(0,0,0,.12),rgba(0,0,0,.22)),url('citybattle.jpg')!important;background-size:cover!important;background-position:center!important;--battle-ground:transparent!important}.battle-screen .battle-top::after{display:none!important}.battle-screen .battle-top::before{opacity:.18!important}.battle-status-card{background:rgba(102,54,154,.48)!important;background-image:none!important;border:1px solid rgba(232,188,255,.42)!important;backdrop-filter:blur(10px)!important}.online-market-row .online-market-meta::first-letter{font-size:inherit}.delete-character-section-v4 p{color:#fff!important}.delete-character-section-v4 button::after{content:''}
  `; document.head.appendChild(st); }
  document.addEventListener('click', (e)=>{
    const del=e.target.closest('[data-delete-character-v3],[data-delete-character-v4]');
    if(del){ const n=Number(del.dataset.count||0); if(n<9){ setTimeout(()=>{ del.textContent=`캐릭터 삭제 ${Number(del.dataset.count||0)}/10`; },0); } }
  }, false);
  function tick(){ injectStyle(); patchCoreV6(); patchBattleV6(); patchDungeonV6(); patchOnlineV6(); showIntroPerCharacter(); decorateBloodlineBlocks(); decorateSpecificText(); }
  document.addEventListener('DOMContentLoaded',()=>{ setTimeout(tick,500); /* v8: recurring tick disabled */ });
})();
