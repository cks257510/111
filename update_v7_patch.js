
(function(){
  'use strict';
  const PB = window.POKEBATTLE || (window.POKEBATTLE = {});
  const BL_LABEL = { normal:'일반혈통', elite:'우수혈통', ancient:'고대혈통', mew:'뮤의 후손' };
  const BL_BG = { normal:'#8b929d', elite:'#2388ff', ancient:'#ffd43b', mew:'#b35cff' };
  const BL_FG = { normal:'#071020', elite:'#071020', ancient:'#1d1600', mew:'#071020' };
  const WHITE_PHRASES = [
    '혈통', '포켓몬마다 랜덤 혈통이 부여됩니다.',
    '제작 목록', '지닌물건', '제작', '알/신화/제작',
    '알 조각 10개로 알 교환', '신화의 파편 50개', '장인의 지식 30개',
    'AI 트레이너에게 승리하면', '포인트 상승, 패배하면 하락', '승급전에서는 이벤트 트레이너',
    '신오 챌린지', '배지 0/8', '4세대 체육관 관장 타입', '모든 배지를 모으면',
    '배지 교환', '포인트 0', '획득한 배지 포인트',
    '레벨 조건만 충족하면', '현재 최고 Lv.',
    '포켓몬 마켓', '실전 채용률과 강함 기준', '구매한 포켓몬은 리저브',
    '내 포켓몬 판매'
  ];
  const MEGA_NAME_COLORS = {
    '라프라스':'#62d4ff', '전룡':'#ffd84f', '라이츄':'#ffc94a', '피존투':'#a7d6ff',
    '헤라크로스':'#87d852', '헬가':'#ff6d53', '레쿠쟈':'#39e095', '독침붕':'#ffe150', '가디안':'#ff8ad7'
  };
  const TRAINERS = [
    ['반바지꼬마', ['오성','민준','태오','지훈'], 'trainer-extra/ggoma.mp4'],
    ['엘리트 트레이너', ['서하','유진','도윤','하린'], 'trainer-extra/elitesprite.mp4'],
    ['백팩커', ['준호','민서','시우'], 'trainer-extra/backpack.mp4'],
    ['애호가클럽', ['나리','현우','지아'], 'trainer-extra/clubpoke.mp4']
  ];
  const norm = (v)=>String(v||'').toLowerCase().replace(/[^a-z0-9_가-힣]/g,'');
  const getPlayer = ()=>PB.core?.getPlayer?.('p1') || PB.core?.getActivePlayer?.();
  function ownedPokemon(){
    const p=getPlayer();
    return [...(p?.squad||[]), ...(p?.reserve||[])].filter(Boolean);
  }
  function bloodKeyFromText(text){
    text = String(text||'');
    if(text.includes('뮤')) return 'mew';
    if(text.includes('고대')) return 'ancient';
    if(text.includes('우수')) return 'elite';
    return 'normal';
  }
  function matchOwned(mon){
    if(!mon) return null;
    const owned = ownedPokemon();
    return owned.find(p=>p.uid && mon.uid && p.uid===mon.uid)
      || owned.find(p=>String(p.currentName||p.nameKo||p.base?.nameKo||'') === String(mon.name||mon.currentName||mon.nameKo||mon.base?.nameKo||''));
  }
  function styleBloodlineElement(el, key){
    key = key && BL_LABEL[key] ? key : bloodKeyFromText(el.textContent);
    el.textContent = BL_LABEL[key] || BL_LABEL.normal;
    el.style.setProperty('background', BL_BG[key] || BL_BG.normal, 'important');
    el.style.setProperty('background-color', BL_BG[key] || BL_BG.normal, 'important');
    el.style.setProperty('color', BL_FG[key] || '#071020', 'important');
    el.style.setProperty('-webkit-text-fill-color', BL_FG[key] || '#071020', 'important');
    el.style.setProperty('box-shadow', 'none', 'important');
    el.style.setProperty('text-shadow', 'none', 'important');
    el.style.setProperty('border', '1px solid rgba(255,255,255,.72)', 'important');
    el.style.setProperty('border-radius', '999px', 'important');
    el.style.setProperty('padding', '3px 9px', 'important');
    el.style.setProperty('font-weight', '1000', 'important');
    el.classList.add('v7-blood-block');
  }
  function decorateBloodline(){
    const byUid = new Map(ownedPokemon().filter(p=>p.uid).map(p=>[p.uid,p]));
    document.querySelectorAll('.bloodline-text-v3,.battle-bloodline-v3').forEach(el=>{
      let key = null;
      const card = el.closest('[data-select-uid]');
      if(card && byUid.has(card.dataset.selectUid)) key = byUid.get(card.dataset.selectUid).bloodline;
      if(!key && el.classList.contains('battle-bloodline-v3')){
        const snap = PB.battleEngine?.getSnapshot?.();
        const cardStatus = el.closest('.battle-status-card');
        const mon = cardStatus?.classList.contains('ally') ? snap?.ally : snap?.enemy;
        const owned = cardStatus?.classList.contains('ally') ? matchOwned(mon) : null;
        key = owned?.bloodline || mon?.bloodline || key;
      }
      styleBloodlineElement(el, key || bloodKeyFromText(el.textContent));
    });
  }
  function forceWhite(el){
    if(!el || el.classList?.contains('type-badge')) return;
    el.classList.add('v7-force-white');
    try {
      el.style.setProperty('color', '#ffffff', 'important');
      el.style.setProperty('-webkit-text-fill-color', '#ffffff', 'important');
      el.style.setProperty('text-shadow', '0 1px 5px rgba(0,0,0,.65)', 'important');
    } catch(e){}
  }
  function forceRequestedWhiteText(){
    const area = document.getElementById('content-area') || document.body;
    const walker = document.createTreeWalker(area, NodeFilter.SHOW_TEXT, {
      acceptNode(node){
        const text = (node.nodeValue || '').replace(/\s+/g,' ').trim();
        if(!text) return NodeFilter.FILTER_REJECT;
        return WHITE_PHRASES.some(p=>text.includes(p)) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    const targets = [];
    while(walker.nextNode()) targets.push(walker.currentNode);
    targets.forEach(node=>{
      const raw = node.nodeValue || '';
      if(raw.includes('메인 포켓몬 3마리 출전')) node.nodeValue = raw.replace(/메인 포켓몬 3마리 출전/g, '출전 포켓몬');
      let el = node.parentElement;
      if(!el) return;
      const box = el.closest('.placeholder-card,.panel-card,.online-rank-card,.online-market-row,.section-title-row,.section-caption,.subheading,.online-mini-row') || el;
      [box, ...box.querySelectorAll('h1,h2,h3,h4,p,span,div,strong,small,button')].forEach(forceWhite);
    });
    document.querySelectorAll('#content-area p,#content-area span,#content-area h1,#content-area h2,#content-area h3,#content-area strong').forEach(el=>{
      if((el.textContent||'').includes('메인 포켓몬 3마리 출전')){
        el.textContent = (el.textContent||'').replace(/메인 포켓몬 3마리 출전/g,'출전 포켓몬');
        forceWhite(el);
      }
    });
  }
  function colorMegaNames(){
    document.querySelectorAll('.info-banner').forEach(banner=>{
      const text = banner.textContent || '';
      if(!text.includes('메가진화')) return;
      banner.querySelectorAll('span').forEach(sp=>{
        const name = (sp.textContent||'').trim();
        if(MEGA_NAME_COLORS[name]){
          sp.style.setProperty('color', MEGA_NAME_COLORS[name], 'important');
          sp.style.setProperty('-webkit-text-fill-color', MEGA_NAME_COLORS[name], 'important');
          sp.style.setProperty('font-weight', '1000', 'important');
          sp.style.setProperty('text-shadow', '0 0 8px rgba(255,255,255,.15)', 'important');
        }
      });
    });
  }
  function simplifySquadGuideText(){
    document.querySelectorAll('.battle-note-emphasis,.battle-note').forEach(el=>{
      el.style.setProperty('font-weight', el.classList.contains('battle-note-emphasis') ? '500' : '500', 'important');
      el.style.setProperty('text-shadow', 'none', 'important');
      el.style.setProperty('-webkit-text-stroke', '0', 'important');
    });
  }
  function patchBattleSnapshot(){
    if(!PB.battleEngine || PB.battleEngine.__v7SnapshotPatch) return;
    PB.battleEngine.__v7SnapshotPatch = true;
    const oldStart = PB.battleEngine.startBattle;
    PB.battleEngine.startBattle = function(options){
      const opt = options || {};
      if(opt.mode === 'competitive' && (!opt.opponentName || /경쟁전\s*AI|AI/.test(String(opt.opponentName)))){
        const t = TRAINERS[Math.floor(Math.random()*TRAINERS.length)];
        const n = t[1][Math.floor(Math.random()*t[1].length)];
        opt.opponentName = `${t[0]} ${n}`;
        opt.trainerIntroSrc = opt.trainerIntroSrc || t[2];
      }
      if(Array.isArray(opt.playerTeam)){
        const owned = ownedPokemon();
        opt.playerTeam.forEach(mon=>{
          if(!mon) return;
          const found = owned.find(p=>p.uid && mon.uid && p.uid===mon.uid)
            || owned.find(p=>String(p.currentName||p.nameKo||p.base?.nameKo||'') === String(mon.currentName||mon.nameKo||mon.base?.nameKo||''));
          if(found?.bloodline) mon.bloodline = found.bloodline;
        });
      }
      return oldStart.call(this, opt);
    };
    const oldSnap = PB.battleEngine.getSnapshot;
    if(oldSnap){
      PB.battleEngine.getSnapshot = function(){
        const snap = oldSnap.call(this);
        if(snap?.ally){
          const owned = matchOwned(snap.ally);
          if(owned?.bloodline) snap.ally.bloodline = owned.bloodline;
        }
        if(Array.isArray(snap?.allyBench)){
          snap.allyBench.forEach(entry=>{
            const owned = matchOwned(entry?.pokemon);
            if(owned?.bloodline) entry.pokemon.bloodline = owned.bloodline;
          });
        }
        return snap;
      };
    }
  }
  function removeAurasAndPatchCss(){
    if(document.getElementById('update-v7-style')) return;
    const st=document.createElement('style');
    st.id='update-v7-style';
    st.textContent = `
      .v7-force-white{color:#fff!important;-webkit-text-fill-color:#fff!important;text-shadow:0 1px 5px rgba(0,0,0,.65)!important}
      .v7-force-white *:not(.type-badge):not(.v7-blood-block){color:#fff!important;-webkit-text-fill-color:#fff!important;text-shadow:0 1px 5px rgba(0,0,0,.65)!important}
      .v7-blood-block,.bloodline-text-v3,.battle-bloodline-v3{box-shadow:none!important;text-shadow:none!important;filter:none!important;background-image:none!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;min-height:18px!important;line-height:1.1!important}
      .pokemon-card .bloodline-text-v3,.battle-status-card .battle-bloodline-v3{box-shadow:none!important;text-shadow:none!important}
      .battle-note-emphasis,.battle-note{font-weight:500!important;text-shadow:none!important;-webkit-text-stroke:0!important}
      .info-banner span[style*="color"]{font-weight:1000!important}
      #battle-action-grid .action-button,#battle-action-grid .action-button span,#battle-action-grid .action-button div:not(.type-badge),
      .battle-bottom .action-button,.battle-bottom .action-button *, .battle-move-button,.battle-move-button *:not(.type-badge):not(.battle-category-pill){
        color:#050b18!important;-webkit-text-fill-color:#050b18!important;text-shadow:none!important;
      }
      .battle-bottom .action-button,.battle-move-button{background:rgba(255,255,255,.95)!important}
    `;
    document.head.appendChild(st);
  }
  function tick(){
    removeAurasAndPatchCss();
    patchBattleSnapshot();
    forceRequestedWhiteText();
    colorMegaNames();
    simplifySquadGuideText();
    decorateBloodline();
  }
  document.addEventListener('DOMContentLoaded',()=>{ setTimeout(tick,450); /* v8: recurring tick disabled */ });
})();
