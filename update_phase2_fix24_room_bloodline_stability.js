(function(){
  'use strict';
  const PB = window.POKEBATTLE || (window.POKEBATTLE = {});
  const F24 = PB.fix24RoomBloodlineStability = PB.fix24RoomBloodlineStability || { hooked:false, observer:null, timer:null, lastScreen:'', stabilizing:false };
  const BLOOD_META = {
    normal:{key:'normal', label:'일반혈통', cls:'f24-blood-normal', desc:'기본 혈통입니다. 안정적인 성장형입니다.'},
    elite:{key:'elite', label:'우수혈통', cls:'f24-blood-elite', desc:'일반보다 희귀한 혈통입니다.'},
    ancient:{key:'ancient', label:'고대혈통', cls:'f24-blood-ancient', desc:'매우 희귀한 고대 혈통입니다.'},
    mew:{key:'mew', label:'뮤의 후손', cls:'f24-blood-mew', desc:'최상위급 희귀 혈통입니다.'}
  };
  const TITLE_COLORS = {
    '준비완료':['common','#dff7ff','#8bd8ff'], '아이템확인':['common','#dff7ff','#8bd8ff'], '견실한스쿼드':['common','#f4e9bd','#ffd36b'],
    '첫친구':['common','#dff7ff','#8bd8ff'], '삼총사':['common','#dff7ff','#8bd8ff'], '성장시작':['common','#dff7ff','#8bd8ff'], '타입탐험가':['common','#dff7ff','#8bd8ff'],
    '불꽃친구':['rare','#ffb06b','#ff6a4d'], '물친구':['rare','#73c7ff','#42f0ff'], '풀친구':['rare','#87e489','#54ff9a'], '첫승리':['rare','#ffe07a','#ff9f43'], '초보부자':['rare','#ffd15c','#fff18a'],
    '성장가속':['rare','#b8ffca','#73e9ff'], '타입연구가':['rare','#aef0ff','#8effba'], '연승도전자':['rare','#ffdf7e','#ff8f6b'], '상인입문':['rare','#ffd15c','#fff18a'],
    '바다전문가':['epic','#5cc8ff','#4a7dff'], '신화목격자':['epic','#c39bff','#ff9ff8'], '수호자':['epic','#ffb172','#ff6f8f'], '사냥꾼':['rare','#92ffb1','#58d9ff'],
    '불멸':['legend','#ff6868','#ffe16b'], '대지의지배자':['legend','#d79053','#ffe27a'], '바다의지배자':['legend','#4aaeff','#98fff8'], '황금스쿼드':['legend','#ffd44a','#fff8b1'],
    '지배자':['mythic','#fff0a3','#ff8dff'], '전설수집가':['mythic','#ff8dff','#8de4ff'], '강화장인':['epic','#ffaaee','#ffe16b'], '전설의첫걸음':['epic','#d6a4ff','#ff8dff'], '컬렉터':['rare','#b8f7ff','#92ffb1']
  };
  function core(){ return PB.core; }
  function ui(){ return PB.ui; }
  function online(){ return window.PB_ONLINE_V3?.getOnlineState?.() || PB.online || {}; }
  function player(){ return core()?.getPlayer?.('p1') || core()?.getActivePlayer?.(); }
  function ch(){ return online().selectedCharacter || null; }
  function db(){ return online().db || null; }
  function uid(){ return online().uid || ''; }
  function slot(){ return online().selectedSlot || 'char1'; }
  function myKey(){ return uid() ? `${uid()}_${slot()}` : ''; }
  function esc(v){ return String(v ?? '').replace(/[&<>'"]/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m])); }
  function toast(msg){ try{ ui()?.showToast?.(msg); }catch(e){} }
  function norm(v){ return String(v||'').trim().toLowerCase(); }
  function bloodKey(v){
    const s=norm(v);
    if(s.includes('뮤')||s==='mew'||s==='mew_descendant'||s==='purple') return 'mew';
    if(s.includes('고대')||s==='ancient'||s==='gold') return 'ancient';
    if(s.includes('우수')||s==='elite'||s==='superior'||s==='great'||s==='blue') return 'elite';
    return 'normal';
  }
  function bloodMeta(v){ return BLOOD_META[bloodKey(v)] || BLOOD_META.normal; }
  function bloodBadge(v){ const m=bloodMeta(v); return `<span class="f24-blood-chip ${m.cls}" data-f24-blood="${m.key}">${m.label}</span>`; }
  function ownedMons(){ const p=player(); return [...(p?.squad||[]), ...(p?.reserve||[])].filter(Boolean); }
  function monByUid(uid){ return ownedMons().find(m=>String(m.uid)===String(uid)); }
  function titleInfo(title){
    const raw=String(title||'').replace(/장착중|장착/g,'').trim();
    const m=TITLE_COLORS[raw] || (/지배자|전설|신화|뮤|불멸/.test(raw)?['mythic','#fff0a3','#ff8dff']:/바다|물/.test(raw)?['epic','#5cc8ff','#98fff8']:/대지|그란돈/.test(raw)?['legend','#d79053','#ffe27a']:/불꽃/.test(raw)?['rare','#ffb06b','#ff6a4d']:/풀/.test(raw)?['rare','#87e489','#54ff9a']:['common','#dff7ff','#8bd8ff']);
    return {raw, rarity:m[0], a:m[1], b:m[2]};
  }
  function applyTitleStyle(el){
    if(!el) return;
    const info=titleInfo(el.dataset.f24Title || el.textContent || '');
    if(!info.raw) return;
    el.dataset.f24Title=info.raw;
    el.classList.add('f24-title-badge',`f24-title-${info.rarity}`);
    el.style.setProperty('--f24-title-a', info.a, 'important');
    el.style.setProperty('--f24-title-b', info.b, 'important');
    el.style.setProperty('color', info.a, 'important');
    el.style.setProperty('-webkit-text-fill-color', info.a, 'important');
    el.style.setProperty('opacity','1','important');
    el.style.setProperty('filter','none','important');
  }
  function randomBloodlineLowered(){
    const r=Math.random();
    // 기존보다 고대/뮤의 후손 확률을 크게 낮춤: 뮤 0.15%, 고대 0.85%, 우수 18%, 일반 나머지
    if(r < 0.0015) return 'mew';
    if(r < 0.0100) return 'ancient';
    if(r < 0.1900) return 'elite';
    return 'normal';
  }
  function shouldRerollBlood(mon){
    if(!mon || mon.__fix24BloodLocked || mon.__fix24BloodRolled) return false;
    if(Number(mon.enhanceLevel||0) >= 5) return false; // 강화 업그레이드 혈통은 유지
    const k=bloodKey(mon.bloodline);
    return !mon.bloodline || k==='normal' || k==='elite' || k==='ancient' || k==='mew';
  }
  function assignLowerBlood(mon){
    if(!shouldRerollBlood(mon)) return mon;
    mon.bloodline=randomBloodlineLowered();
    mon.__fix24BloodRolled=true;
    return mon;
  }
  function patchAcquisitionBloodline(){
    const c=core(); if(!c || c.__fix24BloodlinePatch) return; c.__fix24BloodlinePatch=true;
    ['addPokemonToCollection','addPokemonToReserve'].forEach(fn=>{
      if(typeof c[fn] !== 'function') return;
      const old=c[fn].bind(c);
      c[fn]=function(playerId, mon){
        try{
          const p=typeof playerId==='string' ? c.getPlayer?.(playerId) : player();
          const list=[...(p?.squad||[]),...(p?.reserve||[])];
          const already=mon?.uid && list.some(x=>x.uid===mon.uid);
          if(!already) assignLowerBlood(mon);
        }catch(e){}
        return old.apply(this, arguments);
      };
    });
  }
  function injectStyle(){
    if(document.getElementById('fix24-room-bloodline-stability-style')) return;
    const st=document.createElement('style'); st.id='fix24-room-bloodline-stability-style'; st.textContent=`
      #title-screen.hidden,#starter-screen.hidden,#battle-screen.hidden,#lobby-screen.hidden{display:none!important;visibility:hidden!important;pointer-events:none!important;opacity:0!important;}
      body.f24-lobby-stable #title-screen,body.f24-lobby-stable #starter-screen{display:none!important;visibility:hidden!important;pointer-events:none!important;opacity:0!important;}
      body.f24-battle-stable #title-screen,body.f24-battle-stable #starter-screen,body.f24-battle-stable #lobby-screen{display:none!important;visibility:hidden!important;pointer-events:none!important;opacity:0!important;}
      #trainer-avatar.online-face{width:38px!important;height:38px!important;min-width:38px!important;min-height:38px!important;max-width:38px!important;max-height:38px!important;overflow:hidden!important;border-radius:999px!important;background:#fff!important;contain:paint!important;transform:none!important;}
      #trainer-avatar.online-face::before,#trainer-avatar.online-face::after{content:none!important;display:none!important;}
      #trainer-avatar.online-face img{width:100%!important;height:100%!important;object-fit:cover!important;object-position:center 12%!important;transform:scale(1.2)!important;display:block!important;}
      .f24-blood-chip{display:inline-flex!important;align-items:center!important;justify-content:center!important;border-radius:999px!important;padding:3px 8px!important;margin:2px 4px 2px 0!important;font-size:10px!important;line-height:1.15!important;font-weight:1000!important;color:#06101f!important;-webkit-text-fill-color:#06101f!important;text-shadow:none!important;box-shadow:none!important;border:1px solid rgba(255,255,255,.56)!important;white-space:nowrap!important;vertical-align:middle!important;}
      .f24-blood-normal{background:#c7ccd6!important}.f24-blood-elite{background:#62c9ff!important}.f24-blood-ancient{background:#ffd85d!important}.f24-blood-mew{background:#bd79ff!important}
      .f24-blood-line{display:flex;align-items:center;flex-wrap:wrap;gap:3px;margin-top:4px;font-size:11px;font-weight:900;color:#cfe7ff!important;}
      .f24-overview-blood{margin-top:2px!important;}
      .f24-title-badge,.f21-title-badge,.f22-title-badge,.f17-title-badge{display:inline-flex!important;align-items:center!important;justify-content:center!important;vertical-align:middle!important;margin-right:5px!important;padding:2px 8px!important;border-radius:999px!important;font-size:10px!important;font-weight:1000!important;line-height:1.35!important;color:var(--f24-title-a,var(--title-color,#dff7ff))!important;-webkit-text-fill-color:var(--f24-title-a,var(--title-color,#dff7ff))!important;background:linear-gradient(135deg,color-mix(in srgb,var(--f24-title-a,var(--title-color,#dff7ff)) 30%,rgba(0,0,0,.42)),color-mix(in srgb,var(--f24-title-b,var(--title-color,#dff7ff)) 18%,rgba(0,0,0,.58)))!important;border:1px solid color-mix(in srgb,var(--f24-title-a,var(--title-color,#dff7ff)) 72%,rgba(255,255,255,.22))!important;box-shadow:0 0 12px color-mix(in srgb,var(--f24-title-b,var(--title-color,#dff7ff)) 28%,transparent)!important;text-shadow:0 0 8px color-mix(in srgb,var(--f24-title-b,var(--title-color,#dff7ff)) 34%,transparent)!important;opacity:1!important;filter:none!important;white-space:nowrap!important;}
      .f24-title-legend,.f24-title-mythic{animation:f24TitlePulse 2.2s ease-in-out infinite alternate!important;}@keyframes f24TitlePulse{from{transform:translateY(0)}to{transform:translateY(-1px)}}
      .f24-title-panel{position:relative!important;min-height:96px!important;max-height:178px!important;overflow-y:auto!important;overflow-x:hidden!important;align-content:flex-start!important;scroll-behavior:auto!important;overscroll-behavior:contain!important;}
      .f24-title-panel .chip-btn{position:relative!important;transform:none!important;flex:0 0 auto!important;}
      .p2-room .f24-room-delete{background:rgba(255,105,105,.18)!important;border-color:rgba(255,130,130,.5)!important;color:#fff!important;-webkit-text-fill-color:#fff!important;}
      .p2-room{grid-template-columns:1fr auto auto auto auto!important;}
      #v8-rest-overlay .v8-rest-pokemon{pointer-events:auto!important;cursor:pointer!important;}
      #v8-rest-overlay .v8-rest-pokemon.f24-rest-jump{animation:f24RestJump 1s ease-in-out both!important;}@keyframes f24RestJump{0%,100%{transform:translateY(0) scale(1)}20%{transform:translateY(-22px) scale(1.03)}45%{transform:translateY(0) scale(1)}68%{transform:translateY(-13px) scale(1.02)}88%{transform:translateY(0) scale(1)}}
    `; document.head.appendChild(st);
  }
  function stabilizeScreens(){
    const c=core(); if(!c) return;
    const screen=String(c.state?.currentScreen || '');
    document.body.classList.toggle('f24-lobby-stable', screen==='lobby');
    document.body.classList.toggle('f24-battle-stable', screen==='battle');
    if(screen==='lobby' || screen==='battle' || screen==='starter' || screen==='title'){
      ['title','starter','lobby','battle'].forEach(k=>{
        const el=document.getElementById(`${k}-screen`); if(!el) return;
        const hide=k!==screen;
        el.classList.toggle('hidden', hide);
        el.setAttribute('aria-hidden', hide?'true':'false');
        if(hide) { try{ el.setAttribute('inert',''); }catch(e){} } else { try{ el.removeAttribute('inert'); }catch(e){} }
      });
    }
    stabilizeAvatar();
  }
  function stabilizeAvatar(){
    const av=document.getElementById('trainer-avatar'); const cc=ch();
    if(!av || !cc || core()?.state?.currentScreen!=='lobby' || core()?.state?.gameMode==='duo') return;
    const src=/^hair[1-4]\.png$/.test(String(cc.hair||'')) ? cc.hair : 'hair1.png';
    av.className='trainer-avatar online-face';
    const img=av.querySelector('img');
    if(!img || img.getAttribute('src')!==src){ av.innerHTML=`<img src="${esc(src)}" alt="profile">`; }
  }
  function decorateBloodlines(){
    const all=ownedMons(); if(!all.length) return;
    document.querySelectorAll('[data-select-uid]').forEach(card=>{
      const mon=monByUid(card.getAttribute('data-select-uid')); if(!mon) return;
      let line=card.querySelector('.f24-blood-line');
      if(!line){
        line=document.createElement('div'); line.className='f24-blood-line';
        const target=card.querySelector('.pokemon-copy,.reserve-copy,.name-line') || card;
        target.appendChild(line);
      }
      const html=`혈통 ${bloodBadge(mon.bloodline)}`;
      if(line.dataset.f24Html!==html){ line.innerHTML=html; line.dataset.f24Html=html; }
    });
    const overviewTitle=document.getElementById('squad-overview-title');
    if(overviewTitle){
      const cards=[...document.querySelectorAll('#modal-root .modal .placeholder-card')];
      (player()?.squad||[]).forEach((mon,idx)=>{
        const card=cards[idx]; if(!card || card.querySelector('.f24-overview-blood')) return;
        const head=card.querySelector('div[style*="font-weight:900"]')?.parentElement || card.firstElementChild || card;
        head.insertAdjacentHTML('beforeend', `<div class="f24-overview-blood f24-blood-line">혈통 ${bloodBadge(mon.bloodline)}</div>`);
      });
    }
    // 플레이어 마켓/공개 포켓몬 카드에 이미 혈통 칩이 있으면 색상을 보정한다.
    document.querySelectorAll('.p2-blood,.rt-blood,.bloodline-text-v3,.battle-bloodline-v3,.v8-blood-badge').forEach(el=>{
      const k=bloodKey(el.dataset.bloodline || el.dataset.f24Blood || el.textContent);
      const m=BLOOD_META[k];
      el.textContent=m.label; el.dataset.f24Blood=m.key;
      el.classList.remove('p2-blood-gray','p2-blood-blue','p2-blood-gold','p2-blood-purple');
      el.style.setProperty('background', k==='mew'?'#bd79ff':k==='ancient'?'#ffd85d':k==='elite'?'#62c9ff':'#c7ccd6', 'important');
      el.style.setProperty('color','#06101f','important'); el.style.setProperty('-webkit-text-fill-color','#06101f','important');
    });
  }
  function ensureBloodTipButton(){
    if(core()?.state?.currentScreen!=='lobby' || core()?.state?.currentCategory!=='squad') return;
    const root=document.getElementById('content-area'); if(!root) return;
    const overview=root.querySelector('[data-open-overview]');
    if(overview && !root.querySelector('[data-f24-blood-tip]')){
      const b=document.createElement('button'); b.type='button'; b.className='chip-btn'; b.dataset.f24BloodTip='1'; b.style.alignSelf='flex-start'; b.style.marginRight='6px'; b.textContent='혈통정보'; overview.parentNode?.insertBefore(b, overview);
    }
  }
  function openBloodTip(){
    const root=document.getElementById('modal-root'); if(!root) return;
    root.innerHTML=`<div class="overlay" data-f24-close="1"><div class="modal" role="dialog" aria-modal="true"><div class="modal-header"><div class="modal-title-wrap"><h2>혈통정보</h2><p>획득 확률과 강화 업그레이드 정보를 확인합니다.</p></div><button type="button" class="ghost-btn" data-f24-close="1">닫기</button></div><div class="modal-body"><div class="placeholder-stack">
      ${Object.values(BLOOD_META).map(m=>`<div class="placeholder-card"><h3>${bloodBadge(m.key)} ${m.label}</h3><p>${esc(m.desc)}</p></div>`).join('')}
      <div class="placeholder-card"><h3>획득 확률</h3><p>새로 얻는 포켓몬은 일반혈통이 가장 흔하고, 우수혈통은 낮은 확률, 고대혈통과 뮤의 후손은 매우 낮은 확률로 등장합니다. 이번 버전에서 고대혈통과 뮤의 후손 획득 확률을 더 낮췄습니다.</p></div>
      <div class="placeholder-card"><h3>강화 업그레이드</h3><p>우수혈통 이상 포켓몬은 +5 강화 성공 시 고대혈통, +7 강화 성공 시 뮤의 후손으로 자동 업그레이드됩니다.</p></div>
    </div></div></div></div>`;
  }
  function stabilizeTitles(){
    document.querySelectorAll('.f17-title-badge,.f21-title-badge,.f22-title-badge,.f24-title-badge').forEach(applyTitleStyle);
    const shell=document.querySelector('.p2-online-shell');
    if(PB.phase2Online?.tab==='achievements' && shell){
      [...shell.querySelectorAll('.f17-card,.p2-card,.placeholder-card')].forEach(card=>{
        const h=card.querySelector('h3');
        if(h && /칭호 목록/.test(h.textContent||'')){
          const row=card.querySelector('.online-mini-row'); if(row) row.classList.add('f24-title-panel');
        }
      });
    }
  }
  function roomIdFromNode(node){
    const btn=node?.querySelector?.('[data-p2-room-start],[data-p2-room-accept],[data-p2-room-decline],[data-p2-room-delete]');
    if(!btn) return '';
    return btn.dataset.p2RoomStart || btn.dataset.p2RoomAccept || btn.dataset.p2RoomDecline || btn.dataset.p2RoomDelete || '';
  }
  function addRoomDeleteButtons(){
    document.querySelectorAll('.p2-room').forEach(room=>{
      if(room.querySelector('[data-p2-room-delete]')) return;
      const id=roomIdFromNode(room); if(!id) return;
      const b=document.createElement('button'); b.type='button'; b.className='p2-btn alt f24-room-delete'; b.dataset.p2RoomDelete=id; b.textContent='방 삭제';
      room.appendChild(b);
    });
  }
  async function deleteRoom(id){
    const d=db(); if(!d||!id){ toast('삭제할 배틀방을 찾지 못했습니다.'); return; }
    try{
      const snap=await d.ref(`battleRooms/${id}`).once('value');
      const r=snap.exists()?snap.val():null;
      const me=myKey();
      if(r && me && r.challengerKey && r.targetKey && r.challengerKey!==me && r.targetKey!==me){ toast('내 캐릭터와 관련 없는 방은 삭제할 수 없습니다.'); return; }
      await d.ref(`battleRooms/${id}`).remove();
      if(PB.phase2Online?.rooms) delete PB.phase2Online.rooms[id];
      toast('배틀방을 삭제했습니다.');
      ui()?.renderAll?.();
    }catch(e){ console.warn('fix24 room delete failed', e); toast('배틀방 삭제 실패'); }
  }
  function patchRoomDeleteClick(){
    if(F24.roomDeleteClick) return; F24.roomDeleteClick=true;
    document.addEventListener('click', e=>{
      const b=e.target.closest?.('[data-p2-room-delete]'); if(!b) return;
      e.preventDefault(); e.stopImmediatePropagation(); deleteRoom(b.dataset.p2RoomDelete);
    }, true);
  }
  function patchRestJump(){
    if(F24.restJump) return; F24.restJump=true;
    document.addEventListener('click', e=>{
      const n=e.target.closest?.('#v8-rest-overlay .v8-rest-pokemon,.v8-rest-pokemon,[data-v8-rest-main],[data-stable-rest-main]'); if(!n) return;
      n.classList.remove('f24-rest-jump'); void n.offsetWidth; n.classList.add('f24-rest-jump');
      setTimeout(()=>n.classList.remove('f24-rest-jump'),1050);
    }, true);
  }
  function patchRenderAndScreen(){
    if(F24.renderPatched || !ui()) return; F24.renderPatched=true;
    const oldRender=ui().renderAll;
    if(typeof oldRender==='function'){
      ui().renderAll=function(){
        const r=oldRender.apply(this, arguments);
        scheduleClean(0); scheduleClean(80); return r;
      };
    }
    const oldShow=ui().showScreen;
    if(typeof oldShow==='function'){
      ui().showScreen=function(name){ const r=oldShow.apply(this, arguments); scheduleClean(0); scheduleClean(80); return r; };
    }
  }
  function scheduleClean(delay=0){
    if(delay===0){ try{ clean(); }catch(e){ console.warn('fix24 clean failed', e); } return; }
    setTimeout(()=>{ try{ clean(); }catch(e){ console.warn('fix24 clean failed', e); } }, delay);
  }
  function clean(){
    injectStyle(); patchAcquisitionBloodline(); stabilizeScreens(); stabilizeAvatar(); ensureBloodTipButton(); decorateBloodlines(); stabilizeTitles(); addRoomDeleteButtons();
  }
  function bind(){
    if(F24.bound) return; F24.bound=true;
    document.addEventListener('click', e=>{
      const b=e.target.closest?.('[data-f24-blood-tip]'); if(!b) return;
      e.preventDefault(); e.stopImmediatePropagation(); openBloodTip();
    }, true);
    document.addEventListener('click', e=>{
      const c=e.target.closest?.('[data-f24-close]'); if(!c) return;
      e.preventDefault(); e.stopImmediatePropagation(); const root=document.getElementById('modal-root'); if(root) root.innerHTML='';
    }, true);
  }
  function init(){
    if(!core() || !ui()){ setTimeout(init,120); return; }
    injectStyle(); bind(); patchRenderAndScreen(); patchRoomDeleteClick(); patchRestJump(); patchAcquisitionBloodline(); clean();
    if(!F24.observer){
      F24.observer=new MutationObserver(()=>{ clearTimeout(F24.moTimer); F24.moTimer=setTimeout(clean,60); });
      F24.observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','aria-hidden']});
    }
    if(!F24.timer) F24.timer=setInterval(clean,900);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(init,360),{once:true}); else setTimeout(init,160);
})();
