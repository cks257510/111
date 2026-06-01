(function(){
  'use strict';
  const PB = window.POKEBATTLE || (window.POKEBATTLE = {});
  const F21 = PB.fix21Bugfixes = PB.fix21Bugfixes || { patched:false, renderWrapper:null, pendingChecked:false, lastIdentitySync:0 };
  const STATS = [['hp','HP'],['attack','공격'],['defense','방어'],['spAttack','특공'],['spDefense','특방'],['speed','스피드']];
  const TITLE_META = {
    '첫친구':['common','#dff7ff','첫 만남'], '삼총사':['common','#dff7ff','팀 구성'], '성장시작':['common','#dff7ff','성장'], '타입탐험가':['common','#dff7ff','탐험'],
    '불꽃친구':['common','#ffb06b','불꽃'], '물친구':['common','#73c7ff','물'], '풀친구':['common','#87e489','풀'], '첫승리':['rare','#ffe07a','승리'], '초보부자':['rare','#ffd15c','재화'],
    '바다전문가':['rare','#5cc8ff','물'], '신화목격자':['epic','#c39bff','신화'], '불멸':['legend','#ff6868','연승'], '대지의지배자':['legend','#d79053','대지'],
    '바다의지배자':['legend','#4aaeff','바다'], '지배자':['mythic','#fff0a3','창조'], '수호자':['epic','#ff9d6c','수호'], '사냥꾼':['rare','#92ffb1','KO'],
    '컬렉터':['rare','#b8f7ff','수집'], '수집입문':['common','#dff7ff','수집'], '황금스쿼드':['legend','#ffd44a','가치'], '전설수집가':['mythic','#ff8dff','전설'],
    '강화장인':['epic','#ffaaee','강화']
  };
  const EXTRA_ACH = [
    {id:'login_ready',title:'준비완료',desc:'온라인 캐릭터로 로비 입장',goal:1,kind:'easy',progress:()=>ch()?1:0,reward:'칭호'},
    {id:'bag_check',title:'아이템확인',desc:'소비 아이템 1개 이상 보유',goal:1,kind:'easy',progress:()=>((player()?.bag?.consumables||[]).some(x=>Number(x.amount||0)>0)?1:0),reward:'칭호'},
    {id:'squad_value_10000',title:'견실한스쿼드',desc:'팀가치 10000원 이상',goal:10000,kind:'easy',progress:()=>teamValue(player()),reward:'칭호'},
    {id:'level_20',title:'성장가속',desc:'20레벨 이상 포켓몬 보유',goal:20,kind:'normal',progress:()=>Math.max(0,...ownedMons().map(m=>Number(m.level||0))),reward:'칭호'},
    {id:'three_types_5',title:'타입연구가',desc:'서로 다른 타입 5종 이상 보유',goal:5,kind:'normal',progress:()=>new Set(ownedBases().flatMap(b=>b.type||[])).size,reward:'칭호'},
    {id:'win_3',title:'연승도전자',desc:'경쟁전 최대 3연승',goal:3,kind:'normal',progress:()=>Number(ch()?.records?.maxWinStreak||0),reward:'칭호'},
    {id:'money_10000',title:'상인입문',desc:'10000원 이상 보유',goal:10000,kind:'normal',progress:()=>Number(player()?.money||0),reward:'칭호'},
    {id:'legend_one',title:'전설의첫걸음',desc:'전설/환상 포켓몬 1종 이상 획득',goal:1,kind:'hard',progress:()=>ownedBases().filter(isLegend).length,reward:'칭호'}
  ];
  function c(){ return PB.core; }
  function ui(){ return PB.ui; }
  function online(){ return window.PB_ONLINE_V3?.getOnlineState?.() || PB.online || {}; }
  function player(){ return c()?.getPlayer?.('p1') || c()?.getActivePlayer?.(); }
  function ch(){ return online().selectedCharacter || null; }
  function db(){ return online().db || null; }
  function uid(){ return online().uid || ''; }
  function slot(){ return online().selectedSlot || 'char1'; }
  function key(){ return uid()?`${uid()}_${slot()}`:''; }
  function esc(v){ return String(v ?? '').replace(/[&<>'"]/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m])); }
  function norm(v){ return String(v||'').trim().toLowerCase(); }
  function toast(msg){ ui()?.showToast?.(msg); }
  function baseOf(mon){ return mon?.base || c()?.state?.pokemonById?.get?.(Number(mon?.baseId||mon?.id)); }
  function nameOf(mon){ return mon?.currentName || mon?.name || baseOf(mon)?.nameKo || '포켓몬'; }
  function statTotal(baseOrMon){ const s=baseOrMon?.speciesStats || baseOrMon?.stats || baseOrMon?.base?.speciesStats || baseOrMon?.base?.stats || {}; return STATS.reduce((a,[k])=>a+Number(s[k]||0),0); }
  function priceOf(base){ if(!base) return 0; if(window.PB_MARKET_PRICES && base.nameKo && window.PB_MARKET_PRICES[base.nameKo]) return Number(window.PB_MARKET_PRICES[base.nameKo]); const total=statTotal(base); const legend=isLegend(base)?2.8:1; return Math.max(400, Math.round((900 + total*8.2)*legend/100)*100); }
  function teamValue(pubOrPlayer){ return (pubOrPlayer?.squad||[]).slice(0,3).reduce((sum,m)=>sum+priceOf(baseOf(m)||c()?.state?.pokemonById?.get?.(Number(m.baseId||m.id))),0); }
  function isLegend(base){ const text=[base?.nameKo,base?.nameEn,base?.rarity,base?.category,base?.tags].flat().join(' '); return Boolean(base?.isLegendary||base?.isMythical||base?.isSemiLegendary||/전설|환상|Legend|Mythic|Mewtwo|Lugia|Ho-Oh|Groudon|Kyogre|Rayquaza|Dialga|Palkia|Giratina|Darkrai|Arceus|Reshiram|Zekrom|Genesect|Shaymin|Mew/i.test(text)); }
  function ownedMons(){ return [...(player()?.squad||[]),...(player()?.reserve||[])]; }
  function ownedBases(){ const out=[]; const seen=new Set(); ownedMons().forEach(m=>{ const b=baseOf(m); if(b&&!seen.has(b.id)){seen.add(b.id);out.push(b);} }); (ch()?.ownedSpeciesHistory||[]).forEach(id=>{ const b=c()?.state?.pokemonById?.get?.(Number(id)); if(b&&!seen.has(b.id)){seen.add(b.id);out.push(b);} }); return out; }
  function ensureChar(){ const cc=ch(); if(!cc) return null; cc.titles=cc.titles||{earned:{},equipped:null}; cc.titles.earned=cc.titles.earned||{}; cc.achievements=cc.achievements||{claimed:{}}; cc.achievements.claimed=cc.achievements.claimed||{}; cc.records=cc.records||{currentWinStreak:0,maxWinStreak:0,competitiveWins:0,competitiveLosses:0}; cc.competitive=cc.competitive||{tier:'beginner',rank:3,points:0,promotionReady:false,wins:0,losses:0}; return cc; }
  function titleMeta(title){ return TITLE_META[title] || ['common','#dff7ff','칭호']; }
  function titleBadge(title, extraClass=''){ if(!title) return ''; const [rare,color,theme]=titleMeta(title); return `<span class="f21-title-badge ${extraClass} f21-title-${esc(rare)}" style="--title-color:${esc(color)}" title="${esc(theme)}">${esc(title)}</span>`; }
  function currentTitle(){ return ensureChar()?.titles?.equipped || ''; }
  function avatarBase(base,size=46){ const src=base?.image||base?.sprite||base?.asset||base?.spriteUrl||''; const letter=esc(String(base?.nameKo||'?').slice(0,1)); if(src) return `<span class="f21-mon-avatar" style="width:${size}px;height:${size}px"><img src="${esc(src)}" alt="${esc(base?.nameKo||'포켓몬')}" onerror="this.style.display='none';this.parentNode.textContent='${letter}'"></span>`; return `<span class="f21-mon-avatar" style="width:${size}px;height:${size}px">${letter}</span>`; }
  function charAvatar(pub,size=42){ const hair=String(pub?.hair||pub?.characterHair||ch()?.hair||'hair1.png'); const src=/^hair[1-4]\.png$/.test(hair)?hair:'hair1.png'; return `<span class="f21-char-avatar" style="width:${size}px;height:${size}px"><img src="${esc(src)}" alt="캐릭터"></span>`; }
  function tierLabel(st){ const names={beginner:'비기너',monster:'몬스터볼',super:'수퍼볼',hyper:'하이퍼볼',master:'마스터볼'}; return st?.tier==='beginner'?`${names[st.tier]||'비기너'} ${Number(st.points||0)}/50`:`${names[st?.tier]||st?.tier||'비기너'} ${Number(st?.rank||3)}티어 ${Number(st?.points||0)}/100`; }
  function rankValue(st){ const order={beginner:0,monster:1,super:2,hyper:3,master:4}; return (order[st?.tier]||0)*10000 + (3-Number(st?.rank||3))*1000 + Number(st?.points||0); }
  function currentWeekKey(){ const d=new Date(); const oneJan=new Date(d.getFullYear(),0,1); const week=Math.ceil((((d-oneJan)/86400000)+oneJan.getDay()+1)/7); return `${d.getFullYear()}-W${String(week).padStart(2,'0')}`; }
  function currentMonthKey(){ const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; }

  function injectStyle(){
    if(document.getElementById('fix21-bugfix-style')) return;
    const s=document.createElement('style'); s.id='fix21-bugfix-style'; s.textContent=`
      .f21-title-badge{display:inline-flex;align-items:center;justify-content:center;vertical-align:middle;margin-right:5px;padding:2px 7px;border-radius:999px;font-size:10px;font-weight:1000;line-height:1.35;color:var(--title-color,#e8f7ff)!important;border:1px solid color-mix(in srgb,var(--title-color,#e8f7ff) 72%, transparent);background:color-mix(in srgb,var(--title-color,#e8f7ff) 18%, rgba(0,0,0,.52));box-shadow:0 0 10px color-mix(in srgb,var(--title-color,#e8f7ff) 24%, transparent);white-space:nowrap;-webkit-text-fill-color:var(--title-color,#e8f7ff)!important;}
      .f21-title-legend,.f21-title-mythic{animation:f21TitleGlow 1.8s ease-in-out infinite alternate;}@keyframes f21TitleGlow{from{filter:brightness(1)}to{filter:brightness(1.35)}}
      .f21-mon-avatar,.f21-char-avatar{display:inline-flex;align-items:center;justify-content:center;border-radius:14px;overflow:hidden;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.14);flex:0 0 auto;color:#fff;font-weight:1000;}
      .f21-mon-avatar img,.f21-char-avatar img{width:100%;height:100%;object-fit:contain;display:block;}
      .f21-rank-media{display:flex;align-items:center;gap:6px;}
      .f17-market-actions .chip-btn,[data-f17-market-info],[data-f17-market-buy],[data-f17-market-compare]{color:#111!important;-webkit-text-fill-color:#111!important;font-weight:1000!important;}
      .f21-egg-overlay{position:fixed;inset:0;z-index:10020;background:rgba(0,0,0,.72);display:flex;align-items:center;justify-content:center;padding:16px;}
      .f21-egg-modal{width:min(92vw,420px);border-radius:28px;overflow:hidden;background:rgba(11,15,22,.96);border:1px solid rgba(255,255,255,.14);box-shadow:0 28px 70px rgba(0,0,0,.48);}
      .f21-egg-cut{min-height:420px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 20%,rgba(255,255,255,.08),rgba(0,0,0,.28));padding:18px;}
      .f21-egg-cut img{width:min(74vw,270px);height:auto;image-rendering:auto;}
      .f21-egg-caption{margin-top:10px;font-weight:1000;color:#fff;letter-spacing:.08em;font-size:13px;}
      .f21-egg-result{min-height:420px;display:flex;align-items:center;justify-content:center;background:linear-gradient(180deg,#27bd7d 0%,#84ed77 54%,#ccf8a5 100%);padding:18px;text-align:center;}
      .f21-egg-result-inner{width:100%;display:flex;flex-direction:column;align-items:center;gap:14px}.f21-egg-title{font-size:26px;font-weight:1000;text-shadow:0 2px 10px rgba(0,0,0,.16)}.f21-egg-list{display:flex;gap:12px;flex-wrap:wrap;justify-content:center}.f21-egg-copy{font-size:13px;font-weight:900;color:#17301d;background:rgba(255,255,255,.32);padding:6px 12px;border-radius:999px;}
      .f21-mvp-top3{display:grid;gap:8px}.f21-mvp-row{display:grid;grid-template-columns:34px 1fr auto;gap:10px;align-items:center;padding:10px;border-radius:16px;background:rgba(255,255,255,.06);border:1px solid rgba(126,207,255,.15)}.f21-mvp-row b{font-size:18px;color:#ffd965}.f21-mvp-row em{font-style:normal;font-weight:1000;color:#9ff7b9}.f21-ach-easy{border-color:rgba(159,247,185,.32)!important;}
      .v8-rest-pokemon,.stable-rest-main,.v8-rest-main{pointer-events:auto!important;touch-action:manipulation!important;cursor:pointer!important}.v8-rest-pokemon.f21-jump,.stable-rest-main.f21-jump,.v8-rest-main.f21-jump{animation:f21RestJump 1s ease-in-out 1!important}@keyframes f21RestJump{0%,100%{transform:translateY(0) scale(1)}25%{transform:translateY(-28px) scale(1.03)}55%{transform:translateY(0) scale(.98)}72%{transform:translateY(-12px) scale(1.01)}}
    `; document.head.appendChild(s);
  }

  function syncTitleToLobby(){
    const tn=document.getElementById('trainer-name'); if(!tn) return;
    const title=currentTitle();
    const p=player(); const rawName=(p?.name || ch()?.name || tn.textContent || '트레이너');
    tn.innerHTML = `${titleBadge(title)}${esc(rawName)}`;
    tn.dataset.f21TitleApplied=title||'';
  }

  function patchMoneyGuard(){
    const core=c(); if(!core || core.__fix21MoneyGuard) return; core.__fix21MoneyGuard=true;
    const oldAdd=core.addMoney?.bind(core);
    if(typeof oldAdd==='function') core.addMoney=function(playerId, amount){
      const stack=(new Error()).stack||'';
      const n=Number(amount||0);
      if(/\baward\b|scanAchievements|renderAchievementsF20|renderAchievements/.test(stack) && n>=1000){
        // fix17/fix20의 렌더링 중 자동 도전과제 보상금이 여러 캐릭터에 반복 지급되는 것을 차단합니다.
        return core.getPlayer?.(playerId||core.state?.activePlayerId)?.money || 0;
      }
      return oldAdd(playerId, amount);
    };
    const oldAddCons=core.addConsumable?.bind(core);
    if(typeof oldAddCons==='function') core.addConsumable=function(playerId,itemId,amount){
      const stack=(new Error()).stack||'';
      if(/\baward\b|scanAchievements|renderAchievementsF20|renderAchievements/.test(stack)){
        // 칭호 자체는 획득시키되, 자동 렌더 루프에서 알 보상이 불어나는 현상은 막습니다.
        return false;
      }
      return oldAddCons(playerId,itemId,amount);
    };
  }

  function hugePool(){
    return (c()?.state?.allPokemon||[]).filter(b=>b && !b.isMegaEvolution && statTotal(b)>=580);
  }
  function patchHugeEgg(){
    const core=c(); if(!core || core.__fix21HugeEgg) return; core.__fix21HugeEgg=true;
    const old=core.hatchEgg?.bind(core); if(typeof old!=='function') return;
    core.hatchEgg=function(playerId,eggType){
      const res=old(playerId,eggType); const id=norm(eggType); if(!res?.ok || id!=='huge_egg') return res;
      const p=core.getPlayer?.(playerId||core.state?.activePlayerId); const pool=hugePool(); if(!p||!pool.length) return res;
      const removeRuntime=(rt)=>{ if(!rt?.uid) return; ['squad','reserve'].forEach(list=>{ const arr=p[list]||[]; const idx=arr.findIndex(x=>x.uid===rt.uid); if(idx>=0) arr.splice(idx,1); }); };
      const entries=Array.isArray(res.allHatched)?res.allHatched:[{basePokemon:res.basePokemon,runtimePokemon:res.runtimePokemon}];
      const fixed=entries.map(entry=>{
        if(statTotal(entry.basePokemon)>=580) return entry;
        removeRuntime(entry.runtimePokemon);
        const base=pool[Math.floor(Math.random()*pool.length)];
        const rt=core.createRuntimePokemon(base,5);
        core.addPokemonToCollection?.(p.id||playerId||'p1',rt);
        return {basePokemon:base,runtimePokemon:rt};
      });
      res.allHatched=fixed; res.basePokemon=fixed[0]?.basePokemon; res.runtimePokemon=fixed[0]?.runtimePokemon;
      return res;
    };
  }

  function openEggModal(result){
    const root=document.getElementById('modal-root'); if(!root) return;
    const first=result?.basePokemon; const titleColor=first?.colors?.primary||first?.primaryColor||'#0d3b1f';
    root.innerHTML=`<div class="f21-egg-overlay"><div class="f21-egg-modal"><div class="f21-egg-cut" data-f21-egg-scene="1"><img src="egg_hatching.gif?fix21=${Date.now()}" alt="egg hatching"><div class="f21-egg-caption">알 부화 중...</div></div></div></div>`;
    try{ ui()?.playEffectSound?.('egg_hatching.mp3'); }catch(e){ try{ const a=new Audio('egg_hatching.mp3'); a.play().catch(()=>{}); }catch(_){} }
    setTimeout(()=>{
      const scene=root.querySelector('[data-f21-egg-scene]'); if(!scene) return;
      const list=Array.isArray(result?.allHatched)?result.allHatched:[{basePokemon:result?.basePokemon,runtimePokemon:result?.runtimePokemon}];
      scene.className='f21-egg-result'; scene.innerHTML=`<div class="f21-egg-result-inner"><div class="f21-egg-title" style="color:${esc(titleColor)}">${list.length>1?'알 부화 결과':esc(list[0]?.basePokemon?.nameKo||list[0]?.runtimePokemon?.currentName||'포켓몬')}</div><div class="f21-egg-list">${list.map(e=>`<div><div>${avatarBase(e.basePokemon,118)}</div><div class="f21-egg-copy">${esc(e.basePokemon?.nameKo||e.runtimePokemon?.currentName||'포켓몬')}</div></div>`).join('')}</div><button type="button" class="action-button" data-f21-egg-close="1"><span class="action-title">확인</span><span class="action-sub">보관함에 추가</span></button></div>`;
    },3600);
  }

  function patchEggClick(){
    if(F21.eggClick) return; F21.eggClick=true;
    document.addEventListener('click', e=>{
      const b=e.target.closest?.('[data-hatch-egg]'); if(!b) return;
      e.preventDefault(); e.stopImmediatePropagation();
      const result=c()?.hatchEgg?.(c()?.state?.activePlayerId || 'p1', b.dataset.hatchEgg);
      if(!result?.ok){ toast(result?.message||'부화할 수 없습니다.'); return; }
      openEggModal(result); window.PB_ONLINE_V3?.saveCharacter?.();
    }, true);
    document.addEventListener('click', e=>{
      if(!e.target.closest?.('[data-f21-egg-close]')) return;
      e.preventDefault(); e.stopImmediatePropagation(); const root=document.getElementById('modal-root'); if(root) root.innerHTML=''; ui()?.renderAll?.();
    }, true);
  }

  function currentMvp(kind){ return PB.fix17Content?.mvp?.[kind] || {}; }
  function renderTabs(active){ const tabs=[['ranked','경쟁전'],['mow','주간 MVP(MoW)'],['mom','이달의 MVP(MoM)'],['players','플레이어 랭킹'],['champion','챔피언'],['friendly','친선배틀'],['challenge','챌린지'],['market','시스템마켓'],['playerMarket','플레이어 마켓'],['rankings','포켓몬 랭킹'],['achievements','도전과제 및 칭호']]; return `<div class="online-tab-row p2-tabs">${tabs.map(([id,label])=>`<button data-p2-tab="${id}" class="${active===id?'active':''}">${label}</button>`).join('')}</div>`; }
  function renderMvp(kind){
    const data=currentMvp(kind); const arr=Object.entries(data).map(([id,r])=>({id,...r})).sort((a,b)=>Number(b.wins||0)-Number(a.wins||0));
    const top3=arr.slice(0,3); const isWeek=kind==='week'; const title=isWeek?'주간 MVP(MoW)':'이달의 MVP(MoM)';
    return `<section class="placeholder-stack p2-online-shell">${renderTabs(isWeek?'mow':'mom')}<div class="p2-card"><h3>${title} 진행 상황 TOP3</h3><p>${isWeek?'이번 주':'이번 달'} 경쟁전 승리 횟수 기준입니다. 1위 달성자는 1회 5000원을 받을 수 있습니다.</p></div><div class="p2-card f21-mvp-top3">${top3.map((r,i)=>`<div class="f21-mvp-row"><b>${i+1}</b><span>${titleBadge(r.title)}${esc(r.nickname||'')} ${esc(r.characterName||'트레이너')}<br><small>${esc(r.tierLabel||'')}</small></span><em>${Number(r.wins||0)}승</em></div>`).join('')||'<p>아직 집계된 승리 기록이 없습니다.</p>'}</div></section>`;
  }
  function renderPlayers(){
    const phase=PB.phase2Online||{}; const arr=Object.entries(phase.players||{}).map(([id,p])=>({id,...p})).filter(p=>p&&!p.deleted&&!p.hidden&&p.characterName).sort((a,b)=>(Number(b.rankValue||0)-Number(a.rankValue||0))||Number(b.updatedAt||0)-Number(a.updatedAt||0));
    const rows=arr.map((p,i)=>{ const main=p.mainPokemon||(p.squad||[])[0]; const base=c()?.state?.pokemonById?.get?.(Number(main?.baseId)); const self=p.key===key(); return `<div class="p2-player-row ${self?'p2-me-row':''}"><div class="p2-rank-no">${i+1}</div><div class="f21-rank-media">${avatarBase(base,46)}${charAvatar(p,42)}</div><div class="p2-grow"><b>${titleBadge(p.title)}${self?'내 정보 · ':''}${esc(p.nickname||'')} ${esc(p.characterName||'트레이너')}</b><small>${esc(p.tierLabel||'')} · 경쟁전 ${Number(p.rankWins||0)}승 ${Number(p.rankLosses||0)}패 · 팀가치 ${Number(p.teamValue||teamValue(p)).toLocaleString()}원</small><div>${main?`${esc(main.name||'포켓몬')} Lv.${Number(main.level||5)}`:'메인 포켓몬 없음'}</div></div><div class="p2-col"><button class="p2-btn" data-p2-view-player="${esc(p.key||p.id)}">출전목록</button><button class="p2-btn alt" data-f17-view-info="${esc(p.key||p.id)}">정보</button></div></div>`; }).join('')||'<div class="p2-card">접속/저장된 플레이어가 없습니다.</div>';
    return `<section class="placeholder-stack p2-online-shell">${renderTabs('players')}<div class="p2-card"><h3>플레이어 랭킹</h3><p>메인포켓몬 오른쪽에 캐릭터 이미지와 장착 칭호가 표시됩니다.</p></div><div class="p2-list">${rows}</div></section>`;
  }
  function renderFriendly(){
    const phase=PB.phase2Online||{}; const arr=Object.entries(phase.players||{}).map(([id,p])=>({id,...p})).filter(p=>p&&!p.deleted&&!p.hidden&&p.characterName&&p.key!==key()).sort((a,b)=>Number(b.updatedAt||0)-Number(a.updatedAt||0));
    const rooms=Object.entries(phase.rooms||{}).map(([id,r])=>({id,...r})).filter(r=>r.mode==='friendly'&&(r.challengerKey===key()||r.targetKey===key())).slice(0,4);
    const rows=arr.map(p=>{ const main=p.mainPokemon||(p.squad||[])[0]; const base=c()?.state?.pokemonById?.get?.(Number(main?.baseId)); return `<div class="p2-player-row">${avatarBase(base,46)}<div class="p2-grow"><b>${titleBadge(p.title)}${esc(p.characterName||'트레이너')}</b><small>${esc(p.tierLabel||'')} · 친선 ${Number(p.onlineWins||0)}승 ${Number(p.onlineLosses||0)}패</small><div>${esc(main?.name||'포켓몬 없음')}</div></div><button class="p2-btn" data-p2-friendly="${esc(p.key||p.id)}">도전</button></div>`; }).join('')||'<div class="p2-card">도전 가능한 플레이어가 없습니다.</div>';
    const roomRows=rooms.map(r=>{ const isTarget=r.targetKey===key(); const opp=isTarget?r.challenger:r.target; const start=(r.status==='accepted'||r.status==='inProgress'||r.status==='readying')?`<button class="p2-btn" data-p2-room-start="${esc(r.id)}">배틀방 입장</button>`:''; const accept=(r.status==='pending'&&isTarget)?`<button class="p2-btn" data-p2-room-accept="${esc(r.id)}">수락</button><button class="p2-btn alt" data-p2-room-decline="${esc(r.id)}">거절</button>`:''; return `<div class="p2-room"><b>${titleBadge(opp?.title)}${esc(opp?.characterName||'상대')}</b><span>${esc(r.status||'대기')} · ${Number(r.wager||0)}원</span>${accept}${start}</div>`; }).join('')||'<p>진행 중인 친선 방이 없습니다.</p>';
    return `<section class="placeholder-stack p2-online-shell">${renderTabs('friendly')}<div class="p2-card"><h3>실시간 친선배틀</h3><p>친선배틀 목록에도 장착 칭호가 표시됩니다.</p></div><div class="p2-list">${rows}</div><div class="p2-card"><h3>친선 배틀방</h3>${roomRows}</div></section>`;
  }
  function renderPokemonRankings(){
    const data=PB.phase2Online?.rankings||{};
    const card=(kind,title,label)=>{ const arr=Object.entries(data[kind]||{}).map(([id,r])=>({id,...r})).sort((a,b)=>Number(b.score||0)-Number(a.score||0)).slice(0,10); return `<div class="p2-card"><h3>${title}</h3>${arr.map((r,i)=>`<div class="p2-rank-row"><b>${i+1}</b><span>${esc(r.pokemonName||'포켓몬')}</span><small>${titleBadge(r.title)}${esc(r.nickname||'')} ${esc(r.characterName||'')}</small><em>${Number(r.score||0)} ${label}</em></div>`).join('')||'<p>아직 기록 없음</p>'}</div>`; };
    return `<section class="placeholder-stack p2-online-shell">${renderTabs('rankings')}<div class="p2-card"><h3>포켓몬 랭킹</h3><p>닉네임 변경과 장착 칭호가 랭킹 기록에도 반영됩니다.</p></div>${card('ko','KO 랭킹','KO')}${card('damage','누적 피해 랭킹','DMG')}${card('tank','받은 피해 랭킹','DMG')}</section>`;
  }
  function renderAchievements(){
    const cc=ensureChar(); grantExtraTitles(true); const all=EXTRA_ACH; const titleRows=Object.keys(cc?.titles?.earned||{}).map(t=>`<button class="chip-btn ${cc.titles.equipped===t?'active':''}" data-f21-equip-title="${esc(t)}">${titleBadge(t)}${cc.titles.equipped===t?'장착중':'장착'}</button>`).join('')||'<div class="empty-state">아직 획득한 칭호가 없습니다.</div>';
    const rows=all.map(a=>{ const v=Number(a.progress()||0), pct=Math.min(100,Math.round(v/a.goal*100)); const done=v>=a.goal; return `<div class="f17-card ${a.kind==='easy'?'f21-ach-easy':''}"><div class="f17-title-row"><h3>${esc(a.title)} ${a.kind==='easy'?'<span class="mini-badge">쉬움</span>':''}</h3><span class="mini-badge">${cc?.titles?.earned?.[a.title]?'칭호 획득':done?'달성':'진행중'}</span></div><p>${esc(a.desc)}</p><div class="f17-progress"><i style="width:${pct}%"></i></div><small>진행도 ${Math.min(v,a.goal).toLocaleString()} / ${Number(a.goal).toLocaleString()} · 보상 ${esc(a.reward)}</small></div>`; }).join('');
    return `<section class="placeholder-stack p2-online-shell">${renderTabs('achievements')}<div class="f17-card"><h3>도전과제 및 칭호</h3><p>쉬운 칭호를 추가했습니다. 재화/알 자동 지급 루프는 막고, 칭호 획득과 장착 표시를 안정화했습니다.</p></div><div class="f17-card"><h3>칭호 목록</h3><div class="online-mini-row">${titleRows}</div></div>${rows}</section>`;
  }
  function grantExtraTitles(saveIt=true){ const cc=ensureChar(); if(!cc) return; let changed=false; EXTRA_ACH.forEach(a=>{ if(cc.titles.earned[a.title]) return; if(Number(a.progress()||0)>=a.goal){ cc.titles.earned[a.title]=true; cc.achievements.claimed[a.id]=Date.now(); if(!cc.titles.equipped) cc.titles.equipped=a.title; changed=true; } }); if(changed&&saveIt) save(); }

  function patchRender(){
    if(!PB.league) return; const cur=PB.league.renderCategory; if(cur===F21.renderWrapper) return; const old=cur;
    F21.renderWrapper=function(){ const tab=PB.phase2Online?.tab || 'ranked'; if(tab==='mow') return renderMvp('week'); if(tab==='mom') return renderMvp('month'); if(tab==='players') return renderPlayers(); if(tab==='friendly') return renderFriendly(); if(tab==='rankings') return renderPokemonRankings(); if(tab==='achievements') return renderAchievements(); let html=old?old.apply(this,arguments):''; if(tab==='challenge') html=dedupeMvpChallengeHtml(html); return html; };
    PB.league.renderCategory=F21.renderWrapper;
  }
  function dedupeMvpChallengeHtml(html){
    html=String(html||''); const marker='f17-mvp-challenge'; const first=html.indexOf(marker); if(first<0) return html;
    // 문자열 렌더 단계에서 중복 카드를 완전히 정리하기 어렵기 때문에, 렌더 후 DOM 정리도 함께 수행합니다.
    return html;
  }
  function cleanDom(){
    syncTitleToLobby(); grantExtraTitles(false); decorateFriendlyAndRooms(); cleanMvpChallengeDuplicates();
  }
  function cleanMvpChallengeDuplicates(){ const nodes=[...document.querySelectorAll('.f17-mvp-challenge')]; nodes.forEach((n,i)=>{ if(i>0) n.remove(); }); }
  function decorateFriendlyAndRooms(){ document.querySelectorAll('.p2-room b').forEach(b=>{ if(b.dataset.f21Done) return; const txt=b.textContent.trim(); const match=Object.values(PB.phase2Online?.players||{}).find(p=>p?.characterName&&txt.includes(p.characterName)); if(match?.title){ b.innerHTML=`${titleBadge(match.title)}${esc(txt)}`; b.dataset.f21Done='1'; } }); }

  function compactMon(mon){ const base=baseOf(mon); return base?{uid:mon.uid,name:nameOf(mon),baseId:base.id,level:mon.level,types:base.type||[],heldItems:(mon.heldItems||[]).map(it=>({id:it.id,nameKo:it.nameKo})),status:mon.status||'정상',koCount:mon.koCount||0,koStars:mon.koStars||0,damageDealt:mon.damageDealt||mon.competitiveDamageDealt||0,damageTaken:mon.damageTaken||mon.competitiveDamageTaken||0,bloodline:mon.bloodline||''}:null; }
  function publicPayload(){ const cc=ensureChar(); const p=player(); const squad=(p?.squad||[]).slice(0,3).map(compactMon).filter(Boolean); const st=cc?.competitive||{}; return { uid:uid(), slot:slot(), key:key(), nickname:cc?.nickname||cc?.name||online().nickname||'', hair:cc?.hair||'hair1.png', characterName:cc?.name||p?.name||'트레이너', tier:st.tier||'beginner', rank:Number(st.rank||3), points:Number(st.points||0), promotionReady:Boolean(st.promotionReady), tierLabel:tierLabel(st), rankWins:Number(st.wins||cc?.records?.competitiveWins||0), rankLosses:Number(st.losses||cc?.records?.competitiveLosses||0), rankValue:rankValue(st), title:cc?.titles?.equipped||'', titles:Object.keys(cc?.titles?.earned||{}), records:cc?.records||{}, teamValue:teamValue(p), mainPokemon:squad[0]||null, squad, battleTeam:squad, updatedAt:Date.now() };
  }
  async function syncIdentity(force=false){
    const now=Date.now(); if(!force && now-F21.lastIdentitySync<12000) return; F21.lastIdentitySync=now;
    const d=db(), k=key(); if(!d||!k||!ch()) return; const pub=publicPayload();
    try{
      const updates={}; updates[`playerPublicList/${k}`]=pub;
      (pub.squad||[]).forEach((p,idx)=>{ const id=`${k}_${p.uid||idx}`.replace(/[^a-zA-Z0-9_-]/g,'_'); const base={uid:uid(),slot:slot(),key:k,nickname:pub.nickname,characterName:pub.characterName,pokemonName:p.name,baseId:p.baseId,level:p.level,updatedAt:now,title:pub.title}; updates[`competitive/rankings/ko/${id}`]={...base,score:Number(p.koCount||0),stars:Number(p.koStars||0)}; updates[`competitive/rankings/damage/${id}`]={...base,score:Number(p.damageDealt||0)}; updates[`competitive/rankings/tank/${id}`]={...base,score:Number(p.damageTaken||0)}; });
      updates[`competitive/mvp/week/${currentWeekKey()}/${k}`]={key:k,nickname:pub.nickname,characterName:pub.characterName,tierLabel:pub.tierLabel,title:pub.title,wins:Number(ch()?.mvp?.weekWins||0),updatedAt:now};
      updates[`competitive/mvp/month/${currentMonthKey()}/${k}`]={key:k,nickname:pub.nickname,characterName:pub.characterName,tierLabel:pub.tierLabel,title:pub.title,wins:Number(ch()?.mvp?.monthWins||0),updatedAt:now};
      await d.ref().update(updates);
    }catch(e){ console.warn('fix21 identity sync failed', e); }
  }
  function patchSave(){ if(window.PB_ONLINE_V3?.__fix21Save) return; const o=window.PB_ONLINE_V3; if(!o?.saveCharacter) return; o.__fix21Save=true; const old=o.saveCharacter; o.saveCharacter=async function(){ const res=await old.apply(this,arguments); await syncIdentity(true); return res; }; }

  function patchCompetitivePending(){
    const be=PB.battleEngine; if(!be || be.__fix21Pending) return; be.__fix21Pending=true;
    const oldStart=be.startBattle?.bind(be); if(typeof oldStart!=='function') return;
    be.startBattle=function(options){
      let opts=options||{};
      if(opts.mode==='competitive'){
        const originalComplete=opts.onComplete;
        opts={...opts,onComplete:function(payload){
          try{ localStorage.removeItem('PB_FIX21_COMPETITIVE_PENDING'); }catch(e){}
          return originalComplete ? originalComplete.call(this,payload) : false;
        }};
      }
      const res=oldStart(opts);
      if(res && opts?.mode==='competitive'){
        const pending={key:key(),slot:slot(),uid:uid(),startedAt:Date.now(),promo:Boolean(ch()?.competitive?.promotionReady)};
        try{ localStorage.setItem('PB_FIX21_COMPETITIVE_PENDING', JSON.stringify(pending)); }catch(e){}
      }
      return res;
    };
    const oldReturn=c()?.returnToLobby?.bind(c());
    if(oldReturn && !c().__fix21ReturnPatch){ c().__fix21ReturnPatch=true; c().returnToLobby=function(){ clearPendingIfBattleInactive(); return oldReturn.apply(this,arguments); }; }
    window.addEventListener('beforeunload',()=>{ /* pending 유지: 새로고침 시 다음 로그인에서 패배 처리 */ });
  }
  function clearPendingIfBattleInactive(){ try{ const raw=localStorage.getItem('PB_FIX21_COMPETITIVE_PENDING'); if(!raw) return; if(PB.battleEngine?.state?.active) return; localStorage.removeItem('PB_FIX21_COMPETITIVE_PENDING'); }catch(e){} }
  function applyDisconnectLossIfNeeded(){
    if(F21.pendingChecked || !ch()) return; F21.pendingChecked=true;
    let pending=null; try{ pending=JSON.parse(localStorage.getItem('PB_FIX21_COMPETITIVE_PENDING')||'null'); }catch(e){}
    if(!pending || pending.key!==key()) return; try{ localStorage.removeItem('PB_FIX21_COMPETITIVE_PENDING'); }catch(e){}
    const cc=ensureChar(); if(!cc) return; const st=cc.competitive=cc.competitive||{tier:'beginner',rank:3,points:0,promotionReady:false,wins:0,losses:0};
    st.losses=Number(st.losses||0)+1; st.points=Math.max(0,Number(st.points||0)-10); st.promotionReady=false;
    cc.records.currentWinStreak=0; cc.records.competitiveLosses=Number(cc.records.competitiveLosses||0)+1;
    save(); toast('경쟁전 중 새로고침/연결 끊김으로 패배 처리되었습니다.');
  }

  function save(){ try{ window.PB_ONLINE_V3?.saveCharacter?.(); }catch(e){} }
  function patchTitleEquip(){
    if(F21.titleClick) return; F21.titleClick=true;
    document.addEventListener('click', e=>{ const b=e.target.closest?.('[data-f21-equip-title]'); if(!b) return; e.preventDefault(); e.stopImmediatePropagation(); const cc=ensureChar(); if(cc){ cc.titles.equipped=b.dataset.f21EquipTitle; save(); syncIdentity(true); ui()?.renderAll?.(); } }, true);
  }
  function patchRestJump(){
    if(F21.restClick) return; F21.restClick=true;
    document.addEventListener('click', e=>{ const n=e.target.closest?.('.v8-rest-pokemon,[data-stable-rest-main],[data-v8-rest-main],.stable-rest-main,.v8-rest-main'); if(!n) return; n.classList.remove('f21-jump'); void n.offsetWidth; n.classList.add('f21-jump'); setTimeout(()=>n.classList.remove('f21-jump'),1050); }, true);
  }

  function init(){
    if(!c()||!ui()){ setTimeout(init,120); return; }
    injectStyle(); patchMoneyGuard(); patchHugeEgg(); patchEggClick(); patchRender(); patchSave(); patchCompetitivePending(); patchTitleEquip(); patchRestJump(); applyDisconnectLossIfNeeded(); syncIdentity(false);
    if(!F21.renderHooked){ F21.renderHooked=true; const old=ui().renderAll; ui().renderAll=function(){ const r=old.apply(this,arguments); setTimeout(()=>{ patchRender(); cleanDom(); syncIdentity(false); applyDisconnectLossIfNeeded(); },30); return r; }; }
    if(!F21.timer) F21.timer=setInterval(()=>{ patchRender(); cleanDom(); patchSave(); syncIdentity(false); applyDisconnectLossIfNeeded(); },1000);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(init,300),{once:true}); else setTimeout(init,120);
})();
