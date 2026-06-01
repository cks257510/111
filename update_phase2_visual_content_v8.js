(function(){
  'use strict';
  const PB = window.POKEBATTLE || (window.POKEBATTLE = {});
  const esc = (v)=>String(v ?? '').replace(/[&<>'"]/g, ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  const norm = (v)=>String(v||'').trim().toLowerCase();
  const wait = (fn, tries=240)=>{ const id=setInterval(()=>{ if(fn() || --tries<=0) clearInterval(id); },50); };
  const MEDIA = { '이상해씨':{type:'image',src:'finish-sprites/Bulbasaur.png'}, '이상해풀':{type:'image',src:'finish-sprites/Ivysaur.png'}, '이상해꽃':{type:'image',src:'finish-sprites/Venusaur.png'}, '캐터피':{type:'image',src:'finish-sprites/Caterpie.png'}, '버터플':{type:'image',src:'finish-sprites/Butterfree.png'},
    '뮤츠':{type:'video',src:'media-videos/Mewtwo.mp4'}, '루기아':{type:'video',src:'media-videos/Lugia.mp4'}, '칠색조':{type:'video',src:'media-videos/Ho-Oh.mp4'},
    '그란돈':{type:'video',src:'media-videos/Groudon.mp4'}, '가이오가':{type:'video',src:'media-videos/Kyogre.mp4'}, '레쿠쟈':{type:'video',src:'media-videos/Rayquaza.mp4'},
    '디아루가':{type:'video',src:'media-videos/Dialga.mp4'}, '펄기아':{type:'video',src:'media-videos/Palkia.mp4'}, '쉐이미':{type:'video',src:'media-videos/Shaymin.mp4'},
    '아르세우스':{type:'video',src:'media-videos/Arceus.mp4'}, '레시라무':{type:'video',src:'media-videos/Reshiram.mp4'}, '제크로무':{type:'video',src:'media-videos/Zekrom.mp4'}, '게노세크트':{type:'video',src:'media-videos/Genesect.mp4'},
    '흥나숭':{type:'video',src:'media-videos/Grookey.mp4'}, '채키몽':{type:'video',src:'media-videos/Thwackey.mp4'}, '고릴타':{type:'video',src:'media-videos/Rillaboom.mp4'},
    '염버니':{type:'video',src:'media-videos/Scorbunny.mp4'}, '래비풋':{type:'video',src:'media-videos/Raboot.mp4'}, '에이스번':{type:'video',src:'media-videos/Cinderace.mp4'},
    '울머기':{type:'video',src:'media-videos/Sobble.mp4'}, '누겔레온':{type:'video',src:'media-videos/Drizzile.mp4'}, '인텔리레온':{type:'video',src:'media-videos/Inteleon.mp4'}, '인텔라레온':{type:'video',src:'media-videos/Inteleon.mp4'},
    '원시그란돈':{type:'video',src:'media-videos/PrimalGroudon.mp4'}, '원시가이오가':{type:'video',src:'media-videos/PrimalKyogre.mp4'},
    '깨비참':{type:'image',src:'finish-sprites/Spearow.png'}, '라이츄':{type:'image',src:'finish-sprites/Raichu.png'}, '모래두지':{type:'image',src:'finish-sprites/Sandshrew.png'}, '고지':{type:'image',src:'finish-sprites/Sandslash.png'}, '니드퀸':{type:'image',src:'finish-sprites/Nidoqueen.png'}, '니드런♂':{type:'image',src:'finish-sprites/Nidoran_M.png'}, '니드킹':{type:'image',src:'finish-sprites/Nidoking.png'}, '액스라이즈':{type:'image',src:'finish-sprites/Haxorus.png'}, '삼삼드래':{type:'image',src:'finish-sprites/Hydreigon.png'}, '파비코리':{type:'image',src:'finish-sprites/Altaria.png'}, '빈티나':{type:'image',src:'finish-sprites/Feebas.png'}, '루카리오':{type:'image',src:'finish-sprites/Lucario.png'}, '마기라스':{type:'image',src:'finish-sprites/Tyranitar.png'}, '포푸니':{type:'image',src:'finish-sprites/Sneasel.png'}, '골뱃':{type:'image',src:'finish-sprites/Golbat.png'}, '전룡':{type:'image',src:'finish-sprites/Ampharos.png'}, '루나톤':{type:'image',src:'finish-sprites/Lunatone.png'}, '꽁어름':{type:'image',src:'finish-sprites/Bergmite.png'}, '코일':{type:'image',src:'finish-sprites/Magnemite.png'}, '레어코일':{type:'image',src:'finish-sprites/Magneton.png'}, '불비달마':{type:'image',src:'finish-sprites/Darmanitan.png'}, '팽도리':{type:'image',src:'finish-sprites/Piplup.png'}, '팽태자':{type:'image',src:'finish-sprites/Prinplup.png'}, '엠페르트':{type:'image',src:'finish-sprites/Empoleon.png'}, '갸라도스':{type:'image',src:'finish-sprites/Gyarados.png'}
  };
  const STARTER_EXTRA = [
    {nameKo:'염버니', nameEn:'Scorbunny', finalFormKo:'에이스번', finalFormEn:'Cinderace', type:['불꽃'], stats:{hp:50,attack:71,defense:40,spAttack:40,spDefense:40,speed:69}, evoLevel:16, next:'래비풋', ability:'맹화', hiddenAbility:'리베로', moves:[['불꽃세례','Ember',40,100,'불꽃','특수',25],['전광석화','Quick Attack',40,100,'노말','물리',30],['두번차기','Double Kick',30,100,'격투','물리',30]]},
    {nameKo:'래비풋', nameEn:'Raboot', finalFormKo:'에이스번', finalFormEn:'Cinderace', type:['불꽃'], stats:{hp:65,attack:86,defense:60,spAttack:55,spDefense:60,speed:94}, evoLevel:35, next:'에이스번', ability:'맹화', hiddenAbility:'리베로', moves:[['화염자동차','Flame Charge',50,100,'불꽃','물리',20],['두번차기','Double Kick',30,100,'격투','물리',30],['전광석화','Quick Attack',40,100,'노말','물리',30]]},
    {nameKo:'에이스번', nameEn:'Cinderace', finalFormKo:'에이스번', finalFormEn:'Cinderace', type:['불꽃'], stats:{hp:80,attack:116,defense:75,spAttack:65,spDefense:75,speed:119}, evoLevel:null, next:null, ability:'맹화', hiddenAbility:'리베로', moves:[['화염볼','Pyro Ball',120,90,'불꽃','물리',5],['두번차기','Double Kick',30,100,'격투','물리',30],['전광석화','Quick Attack',40,100,'노말','물리',30]]},
    {nameKo:'울머기', nameEn:'Sobble', finalFormKo:'인텔리레온', finalFormEn:'Inteleon', type:['물'], stats:{hp:50,attack:40,defense:40,spAttack:70,spDefense:40,speed:70}, evoLevel:16, next:'누겔레온', ability:'급류', hiddenAbility:'스나이퍼', moves:[['물대포','Water Gun',40,100,'물','특수',25],['전광석화','Quick Attack',40,100,'노말','물리',30],['눈물그렁그렁','Tearful Look',null,100,'노말','변화',20]]},
    {nameKo:'누겔레온', nameEn:'Drizzile', finalFormKo:'인텔리레온', finalFormEn:'Inteleon', type:['물'], stats:{hp:65,attack:60,defense:55,spAttack:95,spDefense:55,speed:90}, evoLevel:35, next:'인텔리레온', ability:'급류', hiddenAbility:'스나이퍼', moves:[['물의파동','Water Pulse',60,100,'물','특수',20],['전광석화','Quick Attack',40,100,'노말','물리',30],['눈물그렁그렁','Tearful Look',null,100,'노말','변화',20]]},
    {nameKo:'인텔리레온', nameEn:'Inteleon', finalFormKo:'인텔리레온', finalFormEn:'Inteleon', type:['물'], stats:{hp:70,attack:85,defense:65,spAttack:125,spDefense:65,speed:120}, evoLevel:null, next:null, ability:'급류', hiddenAbility:'스나이퍼', moves:[['저격','Snipe Shot',80,100,'물','특수',15],['냉동빔','Ice Beam',90,100,'얼음','특수',10],['전광석화','Quick Attack',40,100,'노말','물리',30]]}
  ];
  function move(nameKo,nameEn,power,acc,type,cat,pp){ return { nameKo, nameEn, power, accuracy:acc, type, category:cat, pp, currentPP:pp, maxPP:pp, description:`${nameKo} 기술입니다.`, logicExplanation:`게임 로직: ${power==null?'피해 없이 효과를 적용합니다.':'타입/공격분류/상성/능력치에 따라 피해를 계산합니다.'}`}; }
  function makeBase(x,id,nextId){ return { id, nameKo:x.nameKo, nameEn:x.nameEn, finalFormKo:x.finalFormKo, finalFormEn:x.finalFormEn, type:x.type, stats:x.stats, speciesStats:{...x.stats}, statTotal:Object.values(x.stats).reduce((a,b)=>a+Number(b||0),0), battleNote:`${x.nameKo}: 숨겨진 특성 ${x.hiddenAbility}을 가진 스타팅 포켓몬입니다.`, evolution:{evoLevel:x.evoLevel,nextEvoId:nextId||null}, ability:x.ability, hiddenAbility:x.hiddenAbility, appearance:{outer:'transparent',core:x.type[0]==='불꽃'?'#ff7657':'#4fb7ff',bars:['#fff','#7edcff']}, moves:x.moves.map(m=>move(...m)) }; }
  function applyDataPatch(){
    const core=PB.core, s=core?.state; if(!s||!Array.isArray(s.allPokemon)||s.__visualContentV8Data) return false; s.__visualContentV8Data=true;
    const removeNames = new Set(['스이쿤','엔테이','앤테이','라이코']);
    s.allPokemon = s.allPokemon.filter(p=>p && !removeNames.has(p.nameKo));
    // Rename Magnezone everywhere.
    s.allPokemon.forEach(p=>{ if(p.nameKo==='자폭코일'){ p.nameKo='자포코일'; p.finalFormKo='자포코일'; } if(p.finalFormKo==='자폭코일') p.finalFormKo='자포코일'; if(['흥나숭','채키몽','고릴타'].includes(p.nameKo)){ p.ability=p.ability||'심록'; p.hiddenAbility='그래스메이커'; } });
    const maxId = Math.max(0,...s.allPokemon.map(p=>Number(p.id)||0));
    const byName = (name)=>s.allPokemon.find(p=>p.nameKo===name);
    const idByName=(name)=>byName(name)?.id||null;
    const addBases=[]; let id=maxId+1;
    // Add missing Galar starters, preserving evolution chains.
    const created={};
    STARTER_EXTRA.forEach(x=>{ if(!byName(x.nameKo)){ created[x.nameKo]=id++; } });
    STARTER_EXTRA.forEach(x=>{ if(!byName(x.nameKo)){ const nextId=created[x.next] || idByName(x.next); addBases.push(makeBase(x, created[x.nameKo], nextId)); } else { const p=byName(x.nameKo); p.ability=x.ability; p.hiddenAbility=x.hiddenAbility; } });
    // Add primal legends.
    if(!byName('원시그란돈')) addBases.push({ id:id++, nameKo:'원시그란돈', nameEn:'Primal Groudon', finalFormKo:'원시그란돈', finalFormEn:'Primal Groudon', type:['땅','불꽃'], stats:{hp:100,attack:180,defense:160,spAttack:150,spDefense:90,speed:90}, speciesStats:{hp:100,attack:180,defense:160,spAttack:150,spDefense:90,speed:90}, statTotal:770, isLegendary:true, ability:'끝의대지', hiddenAbility:null, battleNote:'원시그란돈: 강력한 물리/특수 화력과 높은 방어를 가진 원시회귀 전설 포켓몬이다.', evolution:{evoLevel:null,nextEvoId:null}, appearance:{outer:'transparent',core:'#d34a36',bars:['#111','#ffd35b']}, moves:[move('단애의칼','Precipice Blades',120,85,'땅','물리',10),move('불대문자','Fire Blast',110,85,'불꽃','특수',5),move('스톤샤워','Rock Slide',75,90,'바위','물리',10)] });
    if(!byName('원시가이오가')) addBases.push({ id:id++, nameKo:'원시가이오가', nameEn:'Primal Kyogre', finalFormKo:'원시가이오가', finalFormEn:'Primal Kyogre', type:['물'], stats:{hp:100,attack:150,defense:90,spAttack:180,spDefense:160,speed:90}, speciesStats:{hp:100,attack:150,defense:90,spAttack:180,spDefense:160,speed:90}, statTotal:770, isLegendary:true, ability:'시작의바다', hiddenAbility:null, battleNote:'원시가이오가: 압도적인 특수화력과 특수내구를 가진 원시회귀 전설 포켓몬이다.', evolution:{evoLevel:null,nextEvoId:null}, appearance:{outer:'transparent',core:'#2a7de8',bars:['#fff','#ff5b4d']}, moves:[move('근원의파동','Origin Pulse',110,85,'물','특수',10),move('번개','Thunder',110,70,'전기','특수',10),move('냉동빔','Ice Beam',90,100,'얼음','특수',10)] });
    addBases.forEach(p=>s.allPokemon.push(p));
    s.allPokemon.sort((a,b)=>Number(a.id||0)-Number(b.id||0));
    s.pokemonById = new Map(s.allPokemon.map(p=>[p.id,p]));
    // Fix player-owned names too.
    Object.values(s.players||{}).forEach(pl=>{ [...(pl.squad||[]),...(pl.reserve||[])].forEach(r=>{ if(r.name==='자폭코일') r.name='자포코일'; if(r.currentName==='자폭코일') r.currentName='자포코일'; if(r.base?.nameKo==='자폭코일') r.base.nameKo='자포코일'; }); });
    // Rare Candy price.
    (s.itemList||[]).forEach(it=>{ if(norm(it.id)==='rare_candy' || it.nameKo==='이상한사탕') it.price=200; if(['스이쿤','엔테이','라이코'].includes(it.nameKo)) it.hidden=true; });
    if(s.itemsById?.get('rare_candy')) s.itemsById.get('rare_candy').price=200;
    return true;
  }
  function itemById(id){ return PB.core?.state?.itemsById?.get(id) || (PB.core?.state?.itemList||[]).find(x=>String(x.id)===String(id)); }
  function extraTmLogic(it){
    const m=it?.tmMove||{}; const type=m.type||''; const cat=m.category||''; const power=m.power; const nm=m.nameKo||it?.nameKo||'기술';
    const lines=[];
    lines.push(`운용법: ${cat==='변화'?'능력치 변화나 보조 효과를 노려 턴 흐름을 바꿉니다.': power>=110?'고화력 결정타로 상대 핵심 포켓몬을 압박합니다.':'안정적인 견제/마무리용으로 사용합니다.'}`);
    lines.push(`게임 적용 로직: ${cat==='변화'?'피해 계산 없이 기술별 보조 효과를 적용합니다.':'명중 판정 후 위력, 공격/특수공격, 방어/특수방어, 타입상성, 지닌물건 보정으로 피해를 계산합니다.'}`);
    if(nm.includes('용성군')) lines.push('추가 효과: 사용 후 특수공격이 크게 내려가는 고화력 기술로 처리합니다.');
    if(nm.includes('인파이트')) lines.push('추가 효과: 공격 후 방어와 특수방어가 내려가는 고위험 고화력 기술입니다.');
    if(nm.includes('칼춤')) lines.push('추가 효과: 공격 랭크를 크게 올립니다.');
    if(nm.includes('용의춤')) lines.push('추가 효과: 공격과 스피드 랭크를 올립니다.');
    if(nm.includes('명상')) lines.push('추가 효과: 특수공격과 특수방어 랭크를 올립니다.');
    if(nm.includes('나쁜음모')) lines.push('추가 효과: 특수공격 랭크를 크게 올립니다.');
    if(nm.includes('대타출동')) lines.push('추가 효과: HP를 소모해 대타를 만들고 일부 피해를 대신 받습니다.');
    if(nm.includes('트릭룸')) lines.push('추가 효과: 일정 턴 동안 느린 포켓몬이 먼저 행동합니다.');
    if(nm.includes('도우미')) lines.push('추가 효과: 아군의 다음 공격 위력을 올리는 더블배틀용 보조기로 처리합니다.');
    if(type) lines.push(`학습 제한: ${type==='노말'||cat==='변화'?'대부분의 포켓몬이 배울 수 있습니다.':`${type} 타입 또는 관련 역할/체형의 포켓몬 위주로 배울 수 있습니다.`}`);
    return lines.join('\n');
  }
  function openTmInfo(id){
    const it=itemById(id); if(!it) return false; const m=it.tmMove||{}; const root=document.getElementById('modal-root'); if(!root) return true;
    root.innerHTML = `<div class="overlay"><div class="modal-card tm-detail-modal v8-tm-modal"><div class="modal-header"><h2>${esc((it.nameKo||'').replace(/^기술머신[:：]\s*/,''))}</h2><button class="close-btn" data-p2fp-close-modal="1">✕</button></div><div class="modal-body"><p><b>타입</b> ${esc(m.type||'-')} · <b>분류</b> ${esc(m.category||'-')} · <b class="power-yellow">위력 ${esc(m.power ?? '-')}</b> · <b>명중</b> ${esc(m.accuracy ?? '-')}</p><p>${esc(m.description || it.description || '설명이 없습니다.')}</p><pre class="tm-logic-text">${esc(extraTmLogic(it))}</pre></div></div></div>`;
    return true;
  }
  let restTimer=null;
  function mediaForMon(mon){ const name=mon?.currentName||mon?.name||mon?.base?.nameKo||''; const asset=MEDIA[name]||MEDIA[mon?.base?.nameKo]; if(asset) return asset; const base=mon?.base||{}; const candidates=[base.image,base.sprite,base.asset,base.media,base.icon].filter(Boolean); if(candidates.length) return {type:'image',src:candidates[0]}; return null; }
  function enterRest(){
    clearInterval(restTimer);
    const lobby=document.getElementById('lobby-screen'); if(!lobby) return;
    document.body.classList.add('v8-rest-active');
    let overlay=document.getElementById('v8-rest-overlay'); if(!overlay){ overlay=document.createElement('div'); overlay.id='v8-rest-overlay'; lobby.appendChild(overlay); }
    overlay.innerHTML = `<button class="v8-rest-exit" type="button" data-v8-rest-exit="1">나가기</button><div class="v8-rest-pokemon"></div>`;
    const slot=overlay.querySelector('.v8-rest-pokemon'); const mon=(PB.core?.getActivePlayer?.()?.squad||[])[0]; const media=mediaForMon(mon);
    const render=()=>{ if(!slot) return; const left=18+Math.random()*58; slot.style.left=left+'%'; slot.style.bottom=(7+Math.random()*7)+'%'; const src=media?.src||''; if(media?.type==='video') slot.innerHTML=`<video src="${esc(src)}" autoplay muted loop playsinline webkit-playsinline preload="auto"></video>`; else if(src) slot.innerHTML=`<img src="${esc(src)}" alt="${esc(mon?.currentName||mon?.name||'포켓몬')}">`; else slot.innerHTML=`<span>${esc(String(mon?.currentName||mon?.name||'포').slice(0,1))}</span>`; slot.classList.remove('wiggle'); void slot.offsetWidth; slot.classList.add('wiggle'); };
    render(); restTimer=setInterval(render,5000);
  }
  function exitRest(){ clearInterval(restTimer); restTimer=null; document.body.classList.remove('v8-rest-active'); const o=document.getElementById('v8-rest-overlay'); if(o) o.remove(); }
  function decorate(){
    document.body.classList.add('v8-dark-transparent');
    // remove dog names from rendered lists if accidentally present
    document.querySelectorAll('.shop-item-card,.market-card,.pokemon-card,.placeholder-card').forEach(card=>{ const t=card.textContent||''; if(/라이코|엔테이|스이쿤/.test(t)) card.style.display='none'; });
    document.querySelectorAll('.shop-item-card').forEach(card=>{ card.innerHTML=card.innerHTML.replace(/기술머신[:：]\s*/g,''); const id=card.dataset.shopBuy||''; const it=itemById(id); if(norm(id)==='rare_candy'||(it?.nameKo==='이상한사탕')){ const pr=card.querySelector('.shop-price,.mini-badge'); if(pr) pr.textContent='$200'; } if(id && /^tm_/.test(id) && !card.querySelector('[data-v8-tm-info]')){ card.insertAdjacentHTML('beforeend',`<button class="tm-info-btn v8-tm-info" type="button" data-v8-tm-info="${esc(id)}">설명</button>`); } });
  }
  function injectStyle(){ if(document.getElementById('v8-visual-content-style')) return; const st=document.createElement('style'); st.id='v8-visual-content-style'; st.textContent=`
    body.v8-dark-transparent #lobby-screen{background:linear-gradient(180deg,rgba(3,9,16,.18),rgba(3,9,16,.28)),url('pokebackground.png') center/cover fixed no-repeat!important;}
    body.v8-dark-transparent #lobby-screen .top-shell, body.v8-dark-transparent #lobby-screen .bottom-nav, body.v8-dark-transparent #lobby-screen .panel-card, body.v8-dark-transparent #lobby-screen .placeholder-card, body.v8-dark-transparent #lobby-screen .pokemon-card, body.v8-dark-transparent #lobby-screen .rest-area, body.v8-dark-transparent #lobby-screen .league-panel, body.v8-dark-transparent #lobby-screen .p2-card, body.v8-dark-transparent #lobby-screen .p2-panel{background:rgba(5,13,25,.44)!important;border-color:rgba(126,207,255,.22)!important;backdrop-filter:blur(9px)!important;box-shadow:0 16px 38px rgba(0,0,0,.22)!important;}
    body.v8-dark-transparent #lobby-screen .placeholder-card.white-card, body.v8-dark-transparent #lobby-screen .modal-card.white-card{background:rgba(255,255,255,.82)!important;}
    .shop-modal{background:linear-gradient(180deg,rgba(0,0,0,.18),rgba(0,0,0,.38)),url('shop.png') center/cover no-repeat!important;color:#fff!important;}
    .shop-modal .modal-header,.shop-modal .shop-item-card,.shop-modal .placeholder-card,.shop-modal .modal-body{background:rgba(4,12,20,.38)!important;color:#fff!important;border-color:rgba(255,255,255,.16)!important;backdrop-filter:blur(8px)!important;}
    .shop-modal .shop-item-card h3,.shop-modal .shop-item-card p,.shop-modal .shop-item-card span:not(.shop-price):not(.mini-badge){color:#fff!important;-webkit-text-fill-color:#fff!important;}
    .shop-modal .shop-price,.shop-modal .shop-item-card .mini-badge.shop-price{background:#ffd84f!important;color:#06101f!important;-webkit-text-fill-color:#06101f!important;border-radius:999px!important;padding:4px 10px!important;font-weight:1000!important;}
    .v8-tm-modal{background:#05070d!important;color:#fff!important;}.v8-tm-modal *{color:#fff!important}.v8-tm-modal .power-yellow,.power-yellow{color:#ffd84f!important;-webkit-text-fill-color:#ffd84f!important}.tm-logic-text{white-space:pre-wrap;background:rgba(255,255,255,.08);border-radius:12px;padding:10px;font-weight:800;line-height:1.45;font-family:inherit;color:#fff!important;}
    #v8-rest-overlay{position:fixed;inset:0;z-index:9990;pointer-events:none;background:transparent!important;overflow:hidden;}body.v8-rest-active #lobby-screen .top-shell,body.v8-rest-active #lobby-screen #content-area,body.v8-rest-active #lobby-screen .bottom-nav,body.v8-rest-active #lobby-screen .floating-type-button{visibility:hidden!important;pointer-events:none!important;}#v8-rest-overlay .v8-rest-exit{position:absolute;right:14px;top:calc(env(safe-area-inset-top,0px) + 14px);pointer-events:auto;z-index:2;border:1px solid rgba(255,255,255,.42);background:rgba(0,0,0,.55);color:#fff;border-radius:999px;padding:9px 14px;font-weight:1000}#v8-rest-overlay .v8-rest-pokemon{position:absolute;z-index:1;transform-origin:50% 100%;transition:left 2.4s ease,bottom 2.4s ease;pointer-events:none;}#v8-rest-overlay .v8-rest-pokemon img,#v8-rest-overlay .v8-rest-pokemon video{max-width:min(24vw,120px);max-height:min(24vw,120px);object-fit:contain;filter:drop-shadow(0 12px 16px rgba(0,0,0,.45));}#v8-rest-overlay .v8-rest-pokemon span{display:flex;width:70px;height:70px;border-radius:50%;align-items:center;justify-content:center;background:#ffd84f;color:#06101f;font-weight:1000}.v8-rest-pokemon.wiggle{animation:v8RestWiggle 2.6s ease-in-out both}@keyframes v8RestWiggle{0%{transform:translateY(8px) rotate(0deg);opacity:0}20%{transform:translateY(0) rotate(-16deg);opacity:1}40%{transform:rotate(14deg)}60%{transform:rotate(-10deg)}100%{transform:translateY(0) rotate(0deg);opacity:1}}
  `; document.head.appendChild(st); }
  function patchShop(){ const c=PB.core; if(!c||c.__v8ShopPatched) return; const old=c.getFriendlyShopInventory; if(typeof old==='function'){ c.__v8ShopPatched=true; c.getFriendlyShopInventory=function(pid,force){ const list=old.apply(this,arguments)||[]; list.forEach(it=>{ if(norm(it.id)==='rare_candy'||it.nameKo==='이상한사탕') it.price=200; }); return list; }; } }
  function setupEvents(){ if(window.__v8VisualContentEvents) return; window.__v8VisualContentEvents=true; document.addEventListener('click', function(e){ const tm=e.target.closest('[data-v8-tm-info],[data-p2fp-tm-info],.tm-info-btn'); if(tm){ const id=tm.dataset.v8TmInfo||tm.dataset.p2fpTmInfo||tm.dataset.itemId||tm.closest?.('[data-shop-buy]')?.dataset.shopBuy||''; if(id && norm(id).startsWith('tm_')){ e.preventDefault(); e.stopImmediatePropagation(); openTmInfo(id); return; } } const rest=e.target.closest('[data-p2-tab="rest"]'); if(rest || (e.target.closest('button') && (e.target.closest('button').textContent||'').trim()==='쉼터')){ e.preventDefault(); e.stopImmediatePropagation(); enterRest(); return; } const out=e.target.closest('[data-v8-rest-exit]'); if(out){ e.preventDefault(); e.stopImmediatePropagation(); exitRest(); return; } }, true); }
  function tick(){ applyDataPatch(); patchShop(); decorate(); }
  injectStyle(); setupEvents(); wait(()=>{ const ok=applyDataPatch(); if(ok){ patchShop(); decorate(); } return ok; }); setInterval(tick,900);
})();
