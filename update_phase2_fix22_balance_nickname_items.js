(function(){
  'use strict';
  const PB = window.POKEBATTLE || (window.POKEBATTLE = {});
  const F22 = PB.fix22BalanceNicknameItems = PB.fix22BalanceNicknameItems || { lastSync:0, hooked:false };
  const STATS = ['hp','attack','defense','spAttack','spDefense','speed'];
  const TITLE_COLORS = {
    '첫친구':'#b9f4ff','삼총사':'#b9f4ff','성장시작':'#b9f4ff','타입탐험가':'#b9f4ff','불꽃친구':'#ff9a4b','물친구':'#4dbdff','풀친구':'#65e46f','첫승리':'#ffe072','초보부자':'#ffd15c',
    '준비완료':'#dff7ff','아이템확인':'#dff7ff','견실한스쿼드':'#ffe088','성장가속':'#89e7ff','타입연구가':'#a2ffa8','연승도전자':'#ffb65f','상인입문':'#ffd15c','전설의첫걸음':'#f59cff',
    '바다전문가':'#5cc8ff','신화목격자':'#c39bff','불멸':'#ff6868','대지의지배자':'#d79053','바다의지배자':'#4aaeff','지배자':'#fff0a3','수호자':'#ff9d6c','사냥꾼':'#92ffb1','컬렉터':'#b8f7ff','수집입문':'#dff7ff','황금스쿼드':'#ffd44a','전설수집가':'#ff8dff','강화장인':'#ffaaee'
  };
  function core(){ return PB.core; }
  function ui(){ return PB.ui; }
  function online(){ return window.PB_ONLINE_V3?.getOnlineState?.() || PB.online || {}; }
  function ch(){ return online().selectedCharacter || null; }
  function uid(){ return online().uid || ''; }
  function slot(){ return online().selectedSlot || 'char1'; }
  function key(){ return uid()?`${uid()}_${slot()}`:''; }
  function player(){ return core()?.getPlayer?.('p1') || core()?.getActivePlayer?.(); }
  function norm(v){ return String(v||'').trim().toLowerCase(); }
  function toast(msg){ ui()?.showToast?.(msg); }
  function esc(v){ return String(v ?? '').replace(/[&<>'"]/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m])); }
  function statTotal(base){ const s=base?.speciesStats || base?.stats || {}; return STATS.reduce((sum,k)=>sum+Number(s[k]||0),0); }
  function isLegend(base){ const text=[base?.nameKo,base?.nameEn,base?.rarity,base?.category,base?.tags].flat().join(' '); return Boolean(base?.isLegendary||base?.isMythical||base?.isSemiLegendary||/전설|환상|Legend|Mythic|Mewtwo|Lugia|Ho-Oh|Groudon|Kyogre|Rayquaza|Dialga|Palkia|Giratina|Darkrai|Arceus|Reshiram|Zekrom|Genesect|Shaymin|Mew/i.test(text)); }
  function charNickname(){ const cc=ch(); return (cc?.nickname || cc?.name || online().nickname || '').trim(); }
  function charName(){ const cc=ch(); return cc?.name || charNickname() || player()?.name || '트레이너'; }
  function currentTitle(){ const cc=ch(); return cc?.titles?.equipped || ''; }
  function titleColor(title){ return TITLE_COLORS[title] || '#dff7ff'; }
  function titleBadge(title){ if(!title) return ''; const c=titleColor(title); return `<span class="f22-title-badge" style="--title-color:${esc(c)}">${esc(title)}</span>`; }
  function priceOf(base){ if(!base) return 0; if(window.PB_MARKET_PRICES && base.nameKo && window.PB_MARKET_PRICES[base.nameKo]) return Number(window.PB_MARKET_PRICES[base.nameKo]); const total=statTotal(base); const legend=isLegend(base)?2.8:1; return Math.max(400, Math.round((900 + total*8.2)*legend/100)*100); }
  function marketBuyPrice(base){ return Math.max(1, Math.ceil(priceOf(base)*1.5)); }
  function injectStyle(){
    if(document.getElementById('fix22-style')) return;
    const st=document.createElement('style'); st.id='fix22-style'; st.textContent=`
      .f22-title-badge,.f21-title-badge,.f17-title-badge{display:inline-flex!important;align-items:center!important;justify-content:center!important;vertical-align:middle!important;margin-right:5px!important;padding:2px 7px!important;border-radius:999px!important;font-size:10px!important;font-weight:1000!important;line-height:1.35!important;color:var(--title-color,#dff7ff)!important;-webkit-text-fill-color:var(--title-color,#dff7ff)!important;text-shadow:0 0 8px color-mix(in srgb,var(--title-color,#dff7ff) 42%,transparent)!important;border:1px solid rgba(255,255,255,.22)!important;background:linear-gradient(135deg,rgba(255,255,255,.16),rgba(0,0,0,.34))!important;box-shadow:0 0 12px color-mix(in srgb,var(--title-color,#dff7ff) 26%,transparent)!important;white-space:nowrap!important;opacity:1!important;filter:none!important;}
      .f22-title-badge::before,.f21-title-badge::before,.f17-title-badge::before{content:"";width:5px;height:5px;border-radius:999px;margin-right:4px;background:var(--title-color,#dff7ff);box-shadow:0 0 8px var(--title-color,#dff7ff);}
      .f22-nick-note{font-size:11px;color:#bdd7ef;margin-top:4px}.f22-target-note{font-size:11px;color:#aee8ff!important;-webkit-text-fill-color:#aee8ff!important;}
      .f17-market-actions .chip-btn,[data-f17-market-info],[data-f17-market-buy],[data-f17-market-compare]{color:#111!important;-webkit-text-fill-color:#111!important;font-weight:1000!important;}
    `; document.head.appendChild(st);
  }
  function baseById(id){ return core()?.state?.pokemonById?.get?.(Number(id)); }
  function patchHugeEgg(){
    const c=core(); if(!c || c.__fix22HugeEgg) return; const old=c.hatchEgg?.bind(c); if(typeof old!=='function') return; c.__fix22HugeEgg=true;
    c.hatchEgg=function(playerId, eggType){
      const res=old(playerId, eggType); if(!res?.ok || norm(eggType)!=='huge_egg') return res;
      const p=c.getPlayer?.(playerId||c.state?.activePlayerId); if(!p) return res;
      const count=Math.max(1, Math.min(2, Array.isArray(res.allHatched)?res.allHatched.length:1));
      const all=(c.state?.allPokemon||[]).filter(b=>b && !b.isMegaEvolution && statTotal(b)>=410);
      const legends=all.filter(isLegend); const normals=all.filter(b=>!isLegend(b));
      if(!all.length) return res;
      const oldEntries=Array.isArray(res.allHatched)?res.allHatched:[{basePokemon:res.basePokemon,runtimePokemon:res.runtimePokemon}];
      oldEntries.forEach(e=>{ const rt=e?.runtimePokemon; if(!rt?.uid) return; ['squad','reserve'].forEach(list=>{ const arr=p[list]||[]; const idx=arr.findIndex(x=>x.uid===rt.uid); if(idx>=0) arr.splice(idx,1); }); });
      const legendaryHit = Math.random() < 0.02 && legends.length;
      const chosen=[];
      for(let i=0;i<count;i+=1){
        const pool = (i===0 && legendaryHit) ? legends : (normals.length?normals:all);
        chosen.push(pool[Math.floor(Math.random()*pool.length)]);
      }
      const fixed=chosen.map(base=>{ const rt=c.createRuntimePokemon(base,5); c.addPokemonToCollection?.(p.id||playerId||'p1',rt); return {basePokemon:base,runtimePokemon:rt}; });
      res.allHatched=fixed; res.basePokemon=fixed[0]?.basePokemon; res.runtimePokemon=fixed[0]?.runtimePokemon;
      return res;
    };
  }
  function repairTitleBadges(){
    document.querySelectorAll('.f21-title-badge,.f17-title-badge,.f22-title-badge').forEach(el=>{
      const raw=(el.textContent||'').replace(/장착중/g,'').replace(/장착/g,'').trim();
      const color=titleColor(raw); el.style.setProperty('--title-color', color); el.style.color=color; el.style.webkitTextFillColor=color; el.classList.add('f22-title-safe');
    });
  }
  function syncLobbyNickname(){
    const cc=ch(); if(!cc) return; if(!cc.nickname) cc.nickname=cc.name || online().nickname || '트레이너';
    const o=online(); if(o.characters?.[slot()]) o.characters[slot()].nickname=cc.nickname; if(o.localStore?.characters?.[slot()]) o.localStore.characters[slot()].nickname=cc.nickname;
    const p=player(); if(p && core()?.state?.gameMode!=='duo') p.name=cc.nickname || cc.name || p.name;
    const trainerName=document.getElementById('trainer-name');
    if(trainerName && core()?.state?.currentScreen==='lobby' && core()?.state?.gameMode!=='duo'){
      trainerName.innerHTML=`${titleBadge(currentTitle())}${esc(cc.nickname || cc.name || '트레이너')}`;
      trainerName.dataset.f22NicknameApplied=cc.nickname||cc.name||'';
    }
    document.querySelectorAll('.online-character-card[data-character-select]').forEach(card=>{
      const sl=card.getAttribute('data-character-select'); const data=o.characters?.[sl]; const strong=card.querySelector('strong'); if(strong&&data) strong.textContent=data.nickname || data.name || strong.textContent;
    });
  }
  async function syncPublicNickname(force=false){
    const o=online(), cc=ch(), d=o.db, k=key(); if(!d||!k||!cc) return; const now=Date.now(); if(!force && now-F22.lastSync<8000) return; F22.lastSync=now;
    const nick=cc.nickname || cc.name || o.nickname || ''; const title=cc.titles?.equipped || ''; const cname=cc.name || nick || '트레이너';
    try{
      const updates={}; updates[`playerPublicList/${k}/nickname`]=nick; updates[`playerPublicList/${k}/characterName`]=cname; updates[`playerPublicList/${k}/title`]=title; updates[`playerPublicList/${k}/updatedAt`]=now;
      updates[`competitive/mvp/week/${currentWeekKey()}/${k}/nickname`]=nick; updates[`competitive/mvp/week/${currentWeekKey()}/${k}/characterName`]=cname; updates[`competitive/mvp/week/${currentWeekKey()}/${k}/title`]=title; updates[`competitive/mvp/month/${currentMonthKey()}/${k}/nickname`]=nick; updates[`competitive/mvp/month/${currentMonthKey()}/${k}/characterName`]=cname; updates[`competitive/mvp/month/${currentMonthKey()}/${k}/title`]=title;
      await d.ref().update(updates);
    }catch(e){ console.warn('fix22 nickname sync failed', e); }
  }
  function currentWeekKey(){ const d=new Date(); const oneJan=new Date(d.getFullYear(),0,1); const week=Math.ceil((((d-oneJan)/86400000)+oneJan.getDay()+1)/7); return `${d.getFullYear()}-W${String(week).padStart(2,'0')}`; }
  function currentMonthKey(){ const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; }
  function patchSave(){ const o=window.PB_ONLINE_V3; if(!o||o.__fix22SavePatch||!o.saveCharacter) return; o.__fix22SavePatch=true; const old=o.saveCharacter; o.saveCharacter=async function(){ syncLobbyNickname(); const res=await old.apply(this,arguments); await syncPublicNickname(true); return res; }; }
  function hookMarketBuy(){
    if(F22.marketHooked) return; F22.marketHooked=true;
    window.addEventListener('click', e=>{
      const buy=e.target?.closest?.('[data-f17-market-buy]'); if(!buy) return;
      e.preventDefault(); e.stopImmediatePropagation();
      const base=baseById(buy.dataset.f17MarketBuy); const p=player(); if(!base||!p) return;
      const price=marketBuyPrice(base); if(!core()?.spendMoney?.('p1',price)){ toast('재화가 부족합니다.'); return; }
      const mon=core().createRuntimePokemon(base,5); if(mon && !mon.bloodline){ const r=Math.random(); mon.bloodline=r<0.02?'mew':r<0.10?'ancient':r<0.35?'elite':'normal'; }
      core().addPokemonToReserve?.('p1',mon); window.PB_ONLINE_V3?.saveCharacter?.(); ui()?.renderAll?.(); toast(`${base.nameKo} 구입 완료 -${price}원`);
    }, true);
  }
  function refreshMarketPrices(){
    document.querySelectorAll('.f17-market-row').forEach(row=>{ const btn=row.querySelector('[data-f17-market-buy]'); const price=row.querySelector('.online-price'); const base=baseById(btn?.dataset?.f17MarketBuy); if(base&&price){ price.textContent=`$${marketBuyPrice(base)}`; price.dataset.f22Price='1'; } });
  }
  function annotateBattleTargets(){
    if(PB.battleEngine?.state?.menu==='bag-pokemon-target'){
      const grid=document.getElementById('battle-action-grid'); if(grid&&!grid.querySelector('.f22-target-note')) grid.insertAdjacentHTML('afterbegin','<div class="f22-target-note">사용할 대상 포켓몬을 선택하세요.</div>');
    }
  }
  function clean(){ injectStyle(); patchHugeEgg(); patchSave(); hookMarketBuy(); syncLobbyNickname(); repairTitleBadges(); refreshMarketPrices(); annotateBattleTargets(); syncPublicNickname(false); }
  function init(){ if(!core()||!ui()){ setTimeout(init,120); return; } clean(); if(!F22.hooked){ F22.hooked=true; const old=ui().renderAll; ui().renderAll=function(){ const r=old.apply(this,arguments); setTimeout(clean,40); return r; }; } if(!F22.timer) F22.timer=setInterval(clean,1000); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(init,300),{once:true}); else setTimeout(init,160);
})();
