(function () {
  'use strict';

  const PB = window.POKEBATTLE || (window.POKEBATTLE = {});
  const FIREBASE_CONFIG = {
    apiKey: "AIzaSyAo-9TdK4etTjVeCyh7Q4E0Uk3HwCujMaU",
    authDomain: "pokeba-d2c8a.firebaseapp.com",
    databaseURL: "https://pokeba-d2c8a-default-rtdb.firebaseio.com",
    projectId: "pokeba-d2c8a",
    storageBucket: "pokeba-d2c8a.firebasestorage.app",
    messagingSenderId: "587818897206",
    appId: "1:587818897206:web:c52fdccfad9a8ca8daad97",
    measurementId: "G-B1XDH5K2K0"
  };

  const HAIR_ASSETS = ['hair1.png', 'hair2.png', 'hair3.png', 'hair4.png'];
  const LOCAL_KEY = 'pokebattle-online-expansion-v1';
  const THEME_KEY = 'pokebattle-theme-mode-v1';
  const TIERS = [
    { key: 'beginner', label: '비기너', icon: '🌱' },
    { key: 'monster', label: '몬스터볼', icon: '몬스터볼' },
    { key: 'super', label: '수퍼볼', icon: '수퍼볼' },
    { key: 'hyper', label: '하이퍼볼', icon: '하이퍼볼' },
    { key: 'master', label: '마스터볼', icon: '마스터볼' }
  ];
  const PROMOTION_TRAINERS = [
    { name: '난천', intro: 'trainer-extra/nancheon.gif', team: ['화강돌', '한카리아스', '밀로틱'] },
    { name: '레드', intro: 'trainer-extra/greensprite.mp4', team: ['피카츄', '망나뇽', '라프라스'] },
    { name: '목호', intro: 'trainer-extra/mokhov.mp4', team: ['망나뇽', '갸라도스', '리자몽'] },
    { name: '태홍', intro: 'trainer-extra/taehongsprite.gif', team: ['헬가', '포푸니라', '갸라도스'] },
    { name: '노간주', intro: 'trainer-extra/noganjoo.mp4', team: ['볼카모스', '버프론', '배바닐라'] }
  ];
  const GYMS = [
    { id: 'roark', name: '강석', type: '바위', color: '#b8a038', team: ['꼬마돌', '롱스톤', '두개도스'] },
    { id: 'gardenia', name: '유채', type: '풀', color: '#65c25f', team: ['꼬몽울', '로젤리아', '로즈레이드'] },
    { id: 'maylene', name: '자두', type: '격투', color: '#d9534f', team: ['근육몬', '루카리오', '헤라크로스'] },
    { id: 'wake', name: '맥실러', type: '물', color: '#5aa8ff', team: ['갸라도스', '라프라스', '샤크니아'] },
    { id: 'fantina', name: '멜리사', type: '고스트', color: '#8b6fd9', team: ['고오스', '고우스트', '팬텀'] },
    { id: 'byron', name: '동관', type: '강철', color: '#9da8c4', team: ['롱스톤', '핫삼', '보스로라'] },
    { id: 'candice', name: '무청', type: '얼음', color: '#86e1ff', team: ['눈꼬마', '포푸니라', '얼음귀신'] },
    { id: 'volkner', name: '전진', type: '전기', color: '#ffd84d', team: ['피카츄', '라이츄', '전룡'] }
  ];
  const TYPE_COLORS = { 노말:'#A8A878', 불꽃:'#F08030', 물:'#6890F0', 전기:'#F8D030', 풀:'#78C850', 얼음:'#98D8D8', 격투:'#C03028', 독:'#A040A0', 땅:'#E0C068', 비행:'#A890F0', 에스퍼:'#F85888', 벌레:'#A8B820', 바위:'#B8A038', 고스트:'#705898', 드래곤:'#7038F8', 악:'#705848', 강철:'#B8B8D0' };

  const online = PB.online = PB.online || {
    firebaseReady: false,
    auth: null,
    db: null,
    user: null,
    uid: null,
    nickname: '',
    characters: {},
    selectedSlot: null,
    selectedCharacter: null,
    creatingSlot: null,
    selectedHair: HAIR_ASSETS[0],
    view: 'ranked',
    marketPage: 0,
    lastAuthMessage: '',
    localStore: loadLocalStore()
  };

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, (ch) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[ch]));
  }
  function now() { return Date.now(); }
  function normalize(value) { return String(value || '').trim().toLowerCase(); }
  function core() { return PB.core; }
  function toast(message) { PB.ui?.showToast?.(message); }
  function tierIndex(tierKey) { return Math.max(0, TIERS.findIndex((tier) => tier.key === tierKey)); }
  function currentTierState() { return online.selectedCharacter?.competitive || { tier: 'beginner', rank: 3, points: 0, promotionReady: false, wins: 0, losses: 0 }; }
  function getTierLabel(state = currentTierState()) {
    const tier = TIERS[tierIndex(state.tier)] || TIERS[0];
    return tier.key === 'beginner' ? `${tier.icon} ${tier.label}` : `${tier.icon} ${tier.label} ${Number(state.rank || 3)}티어`;
  }
  function statTotal(base) {
    const stats = base?.speciesStats || base?.stats || {};
    return ['hp','attack','defense','spAttack','spDefense','speed'].reduce((sum, key) => sum + Number(stats[key] || 0), 0);
  }
  function calculatePokemonPrice(base) {
    if (window.PB_MARKET_PRICES && base?.nameKo && window.PB_MARKET_PRICES[base.nameKo]) return Number(window.PB_MARKET_PRICES[base.nameKo]);
    if (window.POKEBATTLE_EXTRA_PATCH?.calculatePokemonPrice) return window.POKEBATTLE_EXTRA_PATCH.calculatePokemonPrice(base);
    const total = statTotal(base);
    const legendary = core()?.shouldExcludeLegend?.(base) ? 1 : 0;
    const stage = getEvolutionStage(base);
    const rarity = legendary ? 2.8 : (stage >= 3 ? 1.35 : stage === 2 ? 1.12 : 1);
    const raw = Math.round((900 + total * 8.2) * rarity / 100) * 100;
    return Math.max(400, raw);
  }
  function getEvolutionStage(base) {
    const all = core()?.state?.allPokemon || [];
    const hasPrev = all.some((candidate) => Number(candidate?.evolution?.nextEvoId) === Number(base?.id));
    const hasNext = Boolean(base?.evolution?.nextEvoId);
    if (!hasPrev && hasNext) return 1;
    if (hasPrev && hasNext) return 2;
    return 3;
  }
  function shuffle(list) {
    const clone = (list || []).slice();
    for (let i = clone.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [clone[i], clone[j]] = [clone[j], clone[i]];
    }
    return clone;
  }
  function loadLocalStore() {
    try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}') || {}; } catch (error) { return {}; }
  }
  function saveLocalStore() {
    try { localStorage.setItem(LOCAL_KEY, JSON.stringify(online.localStore || {})); } catch (error) {}
  }

  function injectStyles() {
    if (document.getElementById('online-expansion-style')) return;
    const style = document.createElement('style');
    style.id = 'online-expansion-style';
    style.textContent = `
      body.theme-basic { --bg-main:#06101f; --bg-radial:radial-gradient(circle at 50% 18%,#153d66 0%,#0b1d34 38%,#06101f 74%,#030813 100%); --panel-1:rgba(255,255,255,.82); --panel-2:rgba(255,255,255,.72); --panel-3:rgba(180,205,230,.26); --panel-dark:rgba(9,23,42,.82); --panel-solid:#ffffff; --line:rgba(91,190,255,.28); --line-strong:rgba(116,215,255,.52); --text-main:#f8fbff; --text-soft:#c8d9ec; --text-muted:#8aa2bd; --sky:#9bddff; --sky-strong:#52c9ff; --sky-soft:rgba(82,201,255,.18); }
      body.theme-basic .app-root { background:radial-gradient(circle at 50% 5%,rgba(85,196,255,.18),transparent 34%),linear-gradient(180deg,#061a30 0%,#071225 46%,#030713 100%); }
      body.theme-basic .title-screen { background:radial-gradient(circle at 50% 25%,rgba(104,215,255,.22),transparent 34%),linear-gradient(180deg,#092542,#071325 64%,#030713); }
      body.theme-basic .content-scroll .placeholder-card, body.theme-basic .summary-card, body.theme-basic .pokemon-card, body.theme-basic .reserve-chip, body.theme-basic .modal .placeholder-card, body.theme-basic .online-white-card { background:rgba(255,255,255,.94)!important; color:#0e1d31!important; border-color:rgba(52,148,230,.18)!important; box-shadow:0 16px 30px rgba(3,13,30,.12); }
      body.theme-basic .content-scroll .placeholder-card p, body.theme-basic .summary-label, body.theme-basic .section-caption, body.theme-basic .reserve-meta, body.theme-basic .pokemon-role, body.theme-basic .pokemon-level { color:#111827!important; font-weight:900!important; }
      body.theme-basic .content-scroll .placeholder-card h3, body.theme-basic .summary-value, body.theme-basic .pokemon-name { color:#050b18!important; font-weight:1000!important; }
      body.theme-basic .content-scroll .placeholder-card,
      body.theme-basic .summary-card,
      body.theme-basic .pokemon-card,
      body.theme-basic .reserve-chip,
      body.theme-basic .online-white-card,
      body.theme-basic .online-market-row,
      body.theme-basic .online-badge-card,
      body.theme-basic .modal .placeholder-card,
      body.theme-basic .shop-item-card,
      body.theme-basic .shop-tip-card,
      body.theme-basic .shop-section-card,
      body.theme-basic .egg-consumable-card {
        color:#050b18!important;
        font-weight:900!important;
      }
      body.theme-basic .content-scroll .placeholder-card :is(p,span,div,h1,h2,h3,h4,strong,small),
      body.theme-basic .summary-card :is(p,span,div,h1,h2,h3,h4,strong,small),
      body.theme-basic .pokemon-card :is(p,span,div,h1,h2,h3,h4,strong,small),
      body.theme-basic .reserve-chip :is(p,span,div,h1,h2,h3,h4,strong,small),
      body.theme-basic .online-market-row :is(p,span,div,h1,h2,h3,h4,strong,small),
      body.theme-basic .online-badge-card :is(p,span,div,h1,h2,h3,h4,strong,small),
      body.theme-basic .modal .placeholder-card :is(p,span,div,h1,h2,h3,h4,strong,small) {
        color:#050b18!important;
        font-weight:900!important;
      }
      body.theme-basic .content-scroll .placeholder-card .section-caption,
      body.theme-basic .content-scroll .placeholder-card .battle-note,
      body.theme-basic .content-scroll .placeholder-card .battle-note-emphasis,
      body.theme-basic .pokemon-card .ability-row,
      body.theme-basic .pokemon-card .pokemon-level,
      body.theme-basic .reserve-chip .reserve-meta,
      body.theme-basic .online-market-meta {
        color:#111827!important;
        font-weight:900!important;
      }
      body.theme-basic .content-scroll .placeholder-card .chip-btn,
      body.theme-basic .content-scroll .placeholder-card .ghost-btn,
      body.theme-basic .online-badge-card .chip-btn,
      body.theme-basic .online-market-row .chip-btn {
        color:#06162a!important;
        background:linear-gradient(180deg,rgba(230,247,255,.98),rgba(164,224,255,.88))!important;
        border-color:rgba(0,115,190,.34)!important;
      }
      .online-save-btn.saving { opacity:.72; pointer-events:none; }
      body.theme-basic .top-shell, body.theme-basic .bottom-nav { background:linear-gradient(180deg,rgba(5,21,41,.9),rgba(5,15,31,.72)); border-color:rgba(98,206,255,.22); }
      body.theme-basic .chip-btn, body.theme-basic .ghost-btn, body.theme-basic .mini-icon-btn, body.theme-basic .nav-btn.active { border-color:rgba(94,211,255,.46)!important; background:linear-gradient(180deg,rgba(76,199,255,.22),rgba(255,255,255,.07))!important; color:#f8fbff!important; }
      body.theme-basic .action-button { background:rgba(255,255,255,.94)!important; color:#0c1d34!important; border-color:rgba(64,174,255,.26)!important; }
      body.theme-dark .app-root { background:var(--bg-radial); }
      .online-auth-panel { width:min(340px,100%); border:1px solid rgba(116,215,255,.26); border-radius:24px; padding:14px; background:linear-gradient(180deg,rgba(8,23,42,.84),rgba(8,13,24,.7)); box-shadow:0 22px 50px rgba(0,0,0,.34); backdrop-filter:blur(16px); text-align:left; }
      .online-auth-head { display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:10px; }
      .online-auth-title { font-size:15px; font-weight:900; color:#eaf8ff; }
      .online-auth-status { font-size:11px; font-weight:800; color:#8edcff; }
      .online-input { width:100%; border:1px solid rgba(126,207,255,.22); background:rgba(255,255,255,.95); color:#0b1c31; border-radius:14px; padding:10px 12px; outline:none; font-weight:700; margin-top:8px; }
      .online-mini-row { display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-top:10px; }
      .online-small-btn { flex:1; min-width:88px; border-radius:14px; padding:10px 12px; font-size:12px; font-weight:900; border:1px solid rgba(126,207,255,.26); background:rgba(126,207,255,.14); color:#f8fbff; }
      .online-small-btn.alt { background:rgba(255,255,255,.08); }
      .online-character-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:10px; }
      .online-character-card { min-height:126px; border:1px solid rgba(126,207,255,.2); border-radius:18px; background:rgba(255,255,255,.08); color:#f8fbff; padding:10px; display:flex; flex-direction:column; gap:8px; align-items:center; justify-content:center; text-align:center; }
      .online-character-card.active { border-color:rgba(126,207,255,.8); box-shadow:0 0 0 1px rgba(126,207,255,.3) inset; }
      .online-profile-avatar { width:56px; height:56px; border-radius:999px; overflow:hidden; border:2px solid rgba(126,207,255,.75); background:rgba(255,255,255,.88); display:inline-flex; align-items:center; justify-content:center; box-shadow:0 10px 24px rgba(0,0,0,.25); }
      .online-profile-avatar img { width:100%; height:100%; object-fit:cover; object-position:center 12%; transform:scale(1.18); }
      .online-profile-avatar.small { width:34px; height:34px; border-width:1px; }
      .online-profile-avatar.large { width:76px; height:76px; }
      .online-hair-row { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin-top:10px; }
      .online-hair-choice { border:1px solid rgba(126,207,255,.2); border-radius:16px; padding:5px; background:rgba(255,255,255,.08); }
      .online-hair-choice.active { border-color:#8edcff; background:rgba(126,207,255,.18); }
      .online-tab-row { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-bottom:12px; }
      .online-tab-row button { border-radius:16px; padding:11px 8px; border:1px solid rgba(126,207,255,.18); background:rgba(255,255,255,.07); color:#ddecff; font-size:12px; font-weight:900; }
      .online-tab-row button.active { background:linear-gradient(180deg,rgba(126,207,255,.25),rgba(255,255,255,.08)); color:#fff; border-color:rgba(126,207,255,.55); }
      .online-stat-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
      .online-rank-card { border-radius:24px; padding:16px; border:1px solid rgba(126,207,255,.2); background:linear-gradient(180deg,rgba(9,22,40,.82),rgba(8,13,24,.7)); }
      .online-rank-title { display:flex; align-items:center; gap:10px; font-size:20px; font-weight:1000; letter-spacing:-.04em; }
      .online-progress { height:10px; background:rgba(255,255,255,.08); border-radius:999px; overflow:hidden; margin-top:10px; }
      .online-progress > i { display:block; height:100%; background:linear-gradient(90deg,#52c9ff,#b6f1ff); border-radius:999px; }
      .online-market-list { display:grid; gap:8px; }
      .online-market-row { display:grid; grid-template-columns:52px 1fr auto; gap:10px; align-items:center; padding:10px; border-radius:18px; background:rgba(255,255,255,.94); color:#0c1d34; border:1px solid rgba(52,148,230,.16); }
      .online-market-row .avatar-shell, .online-market-row .avatar-shell.small { width:50px; height:50px; }
      .online-market-name { font-weight:1000; color:#081b32; }
      .online-market-meta { font-size:11px; font-weight:800; color:#58708c; margin-top:3px; }
      .online-price { font-weight:1000; color:#0e65a8; white-space:nowrap; }
      .online-badge-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:8px; }
      .online-badge-card { border-radius:18px; padding:12px; background:rgba(255,255,255,.94); color:#0c1d34; border:1px solid rgba(52,148,230,.16); }
      .online-badge-card.done { box-shadow:0 0 0 1px rgba(104,211,145,.28) inset; }
      .online-pill { display:inline-flex; align-items:center; gap:4px; padding:4px 8px; border-radius:999px; font-size:11px; font-weight:900; background:rgba(82,201,255,.16); color:#8edcff; }
      .trainer-avatar.online-face { overflow:hidden; border-radius:999px!important; background:#fff!important; border:2px solid rgba(126,207,255,.8); }
      .trainer-avatar.online-face::before, .trainer-avatar.online-face::after { display:none!important; }
      .trainer-avatar.online-face img { width:100%; height:100%; object-fit:cover; object-position:center 12%; transform:scale(1.2); }
      .battle-skill-overlay { background:transparent!important; pointer-events:none!important; }
      .battle-skill-popup { background:transparent!important; border:0!important; box-shadow:none!important; padding:0!important; }
      .battle-skill-name { text-shadow:0 2px 8px rgba(0,0,0,.8); }
    `;
    document.head.appendChild(style);
  }

  function applyTheme() {
    const mode = localStorage.getItem(THEME_KEY) || 'dark';
    document.body.classList.toggle('theme-basic', mode !== 'dark');
    document.body.classList.toggle('theme-dark', mode === 'dark');
    if (core()?.state?.settings) core().state.settings.theme = mode === 'dark' ? 'dark' : 'basic';
  }

  function initFirebase() {
    try {
      if (!window.firebase || !window.firebase.initializeApp) {
        online.lastAuthMessage = 'Firebase SDK 로딩 전입니다. 로컬 모드로 표시합니다.';
        return;
      }
      const app = window.firebase.apps && window.firebase.apps.length ? window.firebase.app() : window.firebase.initializeApp(FIREBASE_CONFIG);
      online.auth = window.firebase.auth(app);
      online.db = window.firebase.database(app);
      online.firebaseReady = true;
      online.auth.onAuthStateChanged(async (user) => {
        online.user = user || null;
        online.uid = user?.uid || null;
        if (user) {
          await loadUserProfile();
          await loadCharacters();
        } else {
          online.nickname = '';
          online.characters = {};
          online.selectedSlot = null;
          online.selectedCharacter = null;
        }
        renderAuthPanel();
        postRenderDecorate();
      });
    } catch (error) {
      console.warn('Firebase 초기화 실패', error);
      online.firebaseReady = false;
      online.lastAuthMessage = `Firebase 연결 실패: ${error.message || error}`;
    }
  }

  async function loadUserProfile() {
    if (!online.db || !online.uid) return;
    try {
      const snap = await online.db.ref(`users/${online.uid}`).once('value');
      const data = snap.exists() ? snap.val() : {};
      online.nickname = data.nickname || online.user?.displayName || '';
      if (!data.createdAt) {
        await online.db.ref(`users/${online.uid}`).update({ email: online.user?.email || '', nickname: online.selectedCharacter?.nickname || online.selectedCharacter?.name || online.nickname || '', createdAt: now(), lastLoginAt: now() });
      } else {
        await online.db.ref(`users/${online.uid}`).update({ lastLoginAt: now() });
      }
    } catch (error) {
      console.warn('프로필 로드 실패', error);
    }
  }

  async function loadCharacters() {
    if (!online.db || !online.uid) return;
    try {
      const snap = await online.db.ref(`characters/${online.uid}`).once('value');
      online.characters = snap.exists() ? (snap.val() || {}) : {};
      const saveSnap = await online.db.ref(`saves/${online.uid}`).once('value');
      if (saveSnap.exists()) {
        const saved = saveSnap.val() || {};
        online.characters = { ...saved, ...online.characters };
      }
    } catch (error) {
      console.warn('캐릭터 로드 실패', error);
      online.characters = {};
    }
  }

  async function saveCharacter(slot = online.selectedSlot) {
    if (!slot || !online.selectedCharacter) return false;
    const data = { ...online.selectedCharacter, slot, updatedAt: now(), player: compactPlayer(core()?.getPlayer?.('p1')), competitive: currentTierState(), challenge: online.selectedCharacter.challenge || defaultChallengeState() };
    online.selectedCharacter = data;
    online.characters[slot] = data;
    online.localStore.characters = online.localStore.characters || {};
    online.localStore.characters[slot] = data;
    saveLocalStore();
    if (online.db && online.uid) {
      try {
        await online.db.ref(`characters/${online.uid}/${slot}`).set(data);
        await online.db.ref(`saves/${online.uid}/${slot}`).set({ ...data, savedAt: now(), saveVersion: 'online-phase1-v2' });
        await updatePublicPlayer();
      } catch (error) {
        console.warn('캐릭터 저장 실패', error);
        return false;
      }
    }
    renderAuthPanel();
    postRenderDecorate();
    return true;
  }

  async function saveCurrentProgress() {
    if (!online.user || !online.uid) {
      toast('로그인 후 저장할 수 있습니다.');
      renderAuthPanel();
      return false;
    }
    if (!online.selectedSlot || !online.selectedCharacter) {
      toast('캐릭터를 먼저 선택하세요.');
      renderAuthPanel();
      return false;
    }
    const button = document.getElementById('online-lobby-save-btn');
    if (button) {
      button.classList.add('saving');
      button.textContent = '저장중';
    }
    const ok = await saveCharacter(online.selectedSlot);
    if (button) {
      button.classList.remove('saving');
      button.textContent = '저장';
    }
    toast(ok ? 'Firebase 저장 완료' : '저장 실패: 연결을 확인하세요');
    return ok;
  }

  async function updatePublicPlayer() {
    if (!online.db || !online.uid || !online.selectedSlot || !online.selectedCharacter) return;
    const player = core()?.getPlayer?.('p1');
    const main = (player?.squad || [])[0];
    const payload = {
      uid: online.uid,
      slot: online.selectedSlot,
      nickname: online.selectedCharacter?.nickname || online.selectedCharacter?.name || online.nickname || '',
      characterName: online.selectedCharacter.name || player?.name || '트레이너',
      hair: online.selectedCharacter.hair || HAIR_ASSETS[0],
      tierLabel: getTierLabel(),
      points: Number(currentTierState().points || 0),
      mainPokemon: main ? { name: main.currentName || main.base?.nameKo, level: main.level, heldItems: (main.heldItems || []).map((it) => it.nameKo || it.id), status: main.status || '정상' } : null,
      updatedAt: now()
    };
    await online.db.ref(`playerPublicList/${online.uid}_${online.selectedSlot}`).set(payload);
  }

  function defaultChallengeState() { return { badges: {}, badgePoints: 0, allClearRewarded: false }; }
  function defaultCompetitiveState() { return { tier: 'beginner', rank: 3, points: 0, promotionReady: false, wins: 0, losses: 0 }; }

  function compactPlayer(player) {
    if (!player) return null;
    return {
      id: 'p1',
      name: player.name || online.selectedCharacter?.name || '트레이너',
      money: Number(player.money || 0),
      bag: JSON.parse(JSON.stringify(player.bag || { holdables: [], consumables: [] })),
      squad: (player.squad || []).map(compactPokemon).filter(Boolean),
      reserve: (player.reserve || []).map(compactPokemon).filter(Boolean)
    };
  }
  function compactPokemon(pokemon) {
    const baseId = Number(pokemon?.base?.id || pokemon?.id || 0);
    if (!baseId) return null;
    return {
      baseId,
      level: Number(pokemon.level || 5),
      currentHp: Number(pokemon.currentHp || pokemon.maxHp || 1),
      candyUsed: Number(pokemon.candyUsed || 0),
      enhanceLevel: Number(pokemon.enhanceLevel || 0),
      preventEvolution: Boolean(pokemon.preventEvolution),
      heldItems: JSON.parse(JSON.stringify(pokemon.heldItems || [])),
      koCount: Number(pokemon.koCount || 0),
      koStars: Number(pokemon.koStars || 0),
      totalExp: Number(pokemon.totalExp || 0),
      bloodline: pokemon.bloodline || null,
      competitiveDamageDealt: Number(pokemon.competitiveDamageDealt || 0),
      competitiveDamageTaken: Number(pokemon.competitiveDamageTaken || 0),
      isShiny: Boolean(pokemon.isShiny),
      shinyKey: pokemon.shinyKey || null
    };
  }
  function inflatePlayer(data, fallbackName) {
    const c = core();
    const player = {
      id: 'p1',
      name: data?.name || fallbackName || '트레이너',
      seasonLabel: '온라인',
      squad: [],
      reserve: [],
      money: Number(data?.money ?? 0),
      bag: data?.bag ? JSON.parse(JSON.stringify(data.bag)) : { holdables: [], consumables: [] }
    };
    player.squad = (data?.squad || []).map(inflatePokemon).filter(Boolean);
    player.reserve = (data?.reserve || []).map(inflatePokemon).filter(Boolean);
    ensurePlayerOnlineDefaults(player);
    return player;
  }
  function inflatePokemon(data) {
    const c = core();
    const base = c?.state?.pokemonById?.get?.(Number(data?.baseId || 0));
    if (!base) return null;
    const p = c.createRuntimePokemon(base, Number(data.level || 5));
    p.candyUsed = Number(data.candyUsed || 0);
    p.enhanceLevel = Number(data.enhanceLevel || 0);
    p.preventEvolution = Boolean(data.preventEvolution);
    p.heldItems = Array.isArray(data.heldItems) ? JSON.parse(JSON.stringify(data.heldItems)) : [];
    p.heldItem = p.heldItems[0] || null;
    p.koCount = Number(data.koCount || 0);
    p.koStars = Number(data.koStars || 0);
    p.totalExp = Number(data.totalExp || 0);
    p.bloodline = data.bloodline || p.bloodline || 'normal';
    p.competitiveDamageDealt = Number(data.competitiveDamageDealt || 0);
    p.competitiveDamageTaken = Number(data.competitiveDamageTaken || 0);
    p.isShiny = Boolean(data.isShiny);
    p.shinyKey = data.shinyKey || null;
    c.recalculateRuntimeStats?.(p, { fullHeal: true });
    p.currentHp = Math.min(p.maxHp, Number(data.currentHp || p.maxHp));
    return p;
  }

  function expShareItem() {
    return { id: 'exp_share', nameKo: '학습장치', amount: 1, category: '지닌물건', description: '지니고 있으면 배틀 경험치를 나누어 받습니다.', battleEffect: '상대 포켓몬이 쓰러질 때 경험치를 받습니다.', colorA: '#6ed6ff', rank: 99 };
  }
  function ensurePlayerOnlineDefaults(player = core()?.getPlayer?.('p1')) {
    if (!player) return;
    player.bag = player.bag || { holdables: [], consumables: [] };
    player.bag.holdables = Array.isArray(player.bag.holdables) ? player.bag.holdables : [];
    player.bag.consumables = Array.isArray(player.bag.consumables) ? player.bag.consumables : [];
    if (!player.bag.holdables.some((item) => normalize(item.id) === 'exp_share')) player.bag.holdables.push(expShareItem());
    const hasConsumable = (id) => player.bag.consumables.some((item) => normalize(item.id) === id);
    if (!hasConsumable('good_potion')) player.bag.consumables.push({ id:'good_potion', nameKo:'고급상처약', amount:1, category:'소비아이템', description:'HP를 60 회복합니다.' });
    if (!hasConsumable('revive_shard')) player.bag.consumables.push({ id:'revive_shard', nameKo:'기력의조각', amount:1, category:'소비아이템', description:'쓰러진 포켓몬을 부활시킵니다.' });
    if (!online.selectedCharacter?.player && !player.__onlineInitialMoneySet) { player.money = 0; player.__onlineInitialMoneySet = true; }
    else if (player.money == null) player.money = 0;
  }

  function renderAuthPanel() {
    const title = document.getElementById('title-screen');
    if (!title) return;
    let panel = document.getElementById('online-auth-panel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'online-auth-panel';
      panel.className = 'online-auth-panel';
      const actions = title.querySelector('.title-actions');
      title.insertBefore(panel, actions || null);
    }
    if (!online.user) {
      panel.innerHTML = `
        <div class="online-auth-head"><div class="online-auth-title">온라인 계정</div><div class="online-auth-status">${online.firebaseReady ? 'Firebase' : '로컬 대기'}</div></div>
        <input class="online-input" id="online-email" type="email" autocomplete="email" placeholder="이메일">
        <input class="online-input" id="online-password" type="password" autocomplete="current-password" placeholder="비밀번호">
        <input class="online-input" id="online-nickname" type="text" maxlength="12" placeholder="닉네임">
        <div class="online-mini-row"><button class="online-small-btn" data-online-auth="login">로그인</button><button class="online-small-btn alt" data-online-auth="register">회원가입</button></div>
        <div class="online-auth-status" style="margin-top:8px;line-height:1.4;">${escapeHtml(online.lastAuthMessage || '계정 로그인 후 캐릭터를 선택하면 온라인 시작 가능')}</div>`;
      return;
    }
    const slots = ['char1', 'char2'].map((slot, i) => renderCharacterSlot(slot, i + 1)).join('');
    panel.innerHTML = `
      <div class="online-auth-head"><div class="online-auth-title">${escapeHtml(online.nickname || online.user.email || '트레이너')}</div><button class="online-small-btn alt" style="flex:0 0 auto;min-width:72px;padding:8px 10px;" data-online-auth="logout">로그아웃</button></div>
      <div class="online-character-grid">${slots}</div>
      ${renderCharacterCreatePanel()}
      <div class="online-auth-status" style="margin-top:8px;">${online.selectedCharacter ? `${escapeHtml(online.selectedCharacter.nickname || online.selectedCharacter.name)} 선택됨 · 온라인 시작 가능` : '캐릭터는 최대 2개까지 생성 가능'}</div>`;
  }

  function renderProfileAvatar(hair, sizeClass = '') {
    const src = HAIR_ASSETS.includes(hair) ? hair : HAIR_ASSETS[0];
    return `<span class="online-profile-avatar ${sizeClass}"><img src="${src}" alt="캐릭터"></span>`;
  }
  function renderCharacterSlot(slot, number) {
    const ch = online.characters?.[slot];
    if (!ch) {
      return `<button type="button" class="online-character-card" data-character-create="${slot}"><div style="font-size:28px;">＋</div><strong>캐릭터 ${number}</strong><span style="font-size:11px;color:#bdd7ef;">새로 만들기</span></button>`;
    }
    const selected = online.selectedSlot === slot;
    const tier = ch.competitive ? getTierLabel(ch.competitive) : getTierLabel(defaultCompetitiveState());
    return `<button type="button" class="online-character-card ${selected ? 'active' : ''}" data-character-select="${slot}">${renderProfileAvatar(ch.hair, '')}<strong>${escapeHtml(ch.nickname || ch.name || `캐릭터 ${number}`)}</strong><span style="font-size:11px;color:#bdd7ef;">${escapeHtml(tier)}</span></button>`;
  }
  function renderCharacterCreatePanel() {
    if (!online.creatingSlot) return '';
    const hairButtons = HAIR_ASSETS.map((hair, idx) => `<button type="button" class="online-hair-choice ${online.selectedHair === hair ? 'active' : ''}" data-hair-choice="${hair}"><img src="${hair}" alt="hair${idx + 1}" style="width:100%;border-radius:12px;display:block;"></button>`).join('');
    return `<div style="margin-top:12px;border-top:1px solid rgba(126,207,255,.14);padding-top:10px;"><div class="online-auth-title">캐릭터 생성</div><input class="online-input" id="online-character-name" maxlength="10" placeholder="캐릭터 이름"><div class="online-hair-row">${hairButtons}</div><div class="online-mini-row"><button class="online-small-btn" data-character-save="${online.creatingSlot}">생성</button><button class="online-small-btn alt" data-character-cancel="1">취소</button></div></div>`;
  }

  async function handleAuth(kind) {
    const email = document.getElementById('online-email')?.value?.trim();
    const password = document.getElementById('online-password')?.value || '';
    const nickname = document.getElementById('online-nickname')?.value?.trim();
    try {
      if (!online.auth) { online.lastAuthMessage = 'Firebase 연결이 아직 준비되지 않았습니다.'; renderAuthPanel(); return; }
      if (!email || !password) { online.lastAuthMessage = '이메일과 비밀번호를 입력하세요.'; renderAuthPanel(); return; }
      if (kind === 'register') {
        if (!nickname) { online.lastAuthMessage = '회원가입에는 닉네임이 필요합니다.'; renderAuthPanel(); return; }
        const cred = await online.auth.createUserWithEmailAndPassword(email, password);
        online.nickname = nickname;
        await online.db.ref(`users/${cred.user.uid}`).set({ email, nickname, createdAt: now(), lastLoginAt: now() });
        online.lastAuthMessage = '회원가입 완료';
      } else {
        await online.auth.signInWithEmailAndPassword(email, password);
        online.lastAuthMessage = '로그인 완료';
      }
    } catch (error) {
      online.lastAuthMessage = error?.message || String(error);
      renderAuthPanel();
    }
  }

  async function createCharacter(slot) {
    const name = document.getElementById('online-character-name')?.value?.trim() || `캐릭터${slot === 'char1' ? '1' : '2'}`;
    const ch = { slot, name, nickname: name, hair: online.selectedHair || HAIR_ASSETS[0], createdAt: now(), updatedAt: now(), competitive: defaultCompetitiveState(), challenge: defaultChallengeState(), player: null };
    online.characters[slot] = ch;
    online.selectedSlot = slot;
    online.selectedCharacter = ch;
    online.creatingSlot = null;
    online.localStore.characters = online.localStore.characters || {};
    online.localStore.characters[slot] = ch;
    saveLocalStore();
    if (online.db && online.uid) {
      try { await online.db.ref(`characters/${online.uid}/${slot}`).set(ch); } catch (error) { console.warn(error); }
    }
    renderAuthPanel();
    postRenderDecorate();
    toast('캐릭터 생성 완료');
  }

  function selectCharacter(slot) {
    const ch = online.characters?.[slot];
    if (!ch) return;
    online.selectedSlot = slot;
    online.selectedCharacter = ch;
    online.selectedHair = ch.hair || HAIR_ASSETS[0];
    if (ch.player && (ch.player.squad || []).length) {
      core().state.players.p1 = inflatePlayer(ch.player, ch.name);
      core().state.activePlayerId = 'p1';
      core().state.gameMode = 'single';
      core().state.currentCategory = 'squad';
      core().state.currentScreen = 'lobby';
      PB.ui?.showScreen?.('lobby');
      PB.ui?.renderAll?.();
      toast('캐릭터 불러오기 완료');
    }
    renderAuthPanel();
    postRenderDecorate();
  }

  function handleOnlineStart(event) {
    const btn = event.target.closest('[data-start-mode="single"]');
    if (!btn) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (!online.selectedCharacter) {
      toast('먼저 로그인 후 캐릭터를 선택하세요.');
      renderAuthPanel();
      return;
    }
    if (online.selectedCharacter.player && (online.selectedCharacter.player.squad || []).length) {
      selectCharacter(online.selectedSlot);
      return;
    }
    PB.core?.startGame?.('single');
  }

  function ensureLobbySaveButton() {
    const controls = document.querySelector('#lobby-screen .top-controls');
    if (!controls) return;
    let button = document.getElementById('online-lobby-save-btn');
    if (!button) {
      button = document.createElement('button');
      button.id = 'online-lobby-save-btn';
      button.type = 'button';
      button.className = 'mini-icon-btn online-save-btn';
      button.setAttribute('aria-label', '진행상황 저장');
      button.setAttribute('data-save-progress', '1');
      button.textContent = '저장';
      controls.insertBefore(button, controls.firstChild);
    }
    button.style.display = core()?.state?.currentScreen === 'lobby' && online.selectedCharacter ? 'inline-flex' : 'none';
  }

  function darkenReadableCardText() {
    if (!document.body.classList.contains('theme-basic')) return;
    if (core()?.state?.currentCategory === 'league' && ['challenge','market'].includes(online.view || '')) return;
    const selectors = [
      '.content-scroll .placeholder-card', '.summary-card', '.pokemon-card', '.reserve-chip', '.online-market-row', '.online-badge-card', '.modal .placeholder-card', '.shop-item-card', '.shop-tip-card', '.shop-section-card', '.egg-consumable-card'
    ];
    document.querySelectorAll(selectors.join(',')).forEach((card) => {
      card.style.color = '#050b18';
      card.style.fontWeight = '900';
      card.querySelectorAll('p,span,div,h1,h2,h3,h4,strong,small').forEach((node) => {
        const tag = node.tagName.toLowerCase();
        if (node.closest('.type-badge') || node.closest('.held-shape') || node.classList.contains('held-shape')) return;
        node.style.color = '#050b18';
        node.style.fontWeight = tag === 'small' ? '800' : '900';
      });
    });
  }

  function postRenderDecorate() {
    applyTheme();
    const navLeague = document.querySelector('[data-nav="league"] span:last-child');
    if (navLeague) navLeague.textContent = '경쟁전';
    const titleOnline = document.querySelector('[data-start-mode="single"]');
    if (titleOnline) titleOnline.textContent = '온라인';
    ensureLobbySaveButton();
    darkenReadableCardText();
    const avatar = document.getElementById('trainer-avatar');
    if (avatar && online.selectedCharacter) {
      avatar.classList.add('online-face');
      avatar.innerHTML = `<img src="${online.selectedCharacter.hair || HAIR_ASSETS[0]}" alt="profile">`;
    }
    const trainerName = document.getElementById('trainer-name');
    if (trainerName && online.selectedCharacter && core()?.state?.gameMode !== 'duo') trainerName.textContent = online.selectedCharacter.nickname || online.selectedCharacter.name || trainerName.textContent;
    const season = document.getElementById('season-label');
    if (season && online.selectedCharacter && core()?.state?.currentScreen === 'lobby') season.textContent = getTierLabel();
    decorateExperienceLines();
  }

  function decorateExperienceLines() {
    const player = core()?.getActivePlayer?.();
    if (!player) return;
    const mons = [...(player.squad || []), ...(player.reserve || [])];
    document.querySelectorAll('[data-select-uid]').forEach((card) => {
      const uid = card.getAttribute('data-select-uid');
      if (!uid || card.querySelector('.online-exp-line')) return;
      const mon = mons.find((p) => p.uid === uid);
      if (!mon) return;
      const target = card.querySelector('.pokemon-copy') || card.querySelector('.reserve-copy');
      if (!target) return;
      const line = document.createElement('div');
      line.className = 'online-exp-line';
      line.style.cssText = 'margin-top:3px;font-size:11px;font-weight:900;color:#42b9ff;';
      const stars = '★'.repeat(Math.max(0, Math.min(5, Number(mon.koStars || 0))));
      line.textContent = `EXP ${Number(mon.totalExp || 0)}${stars ? ' · KO' + stars : ''}`;
      target.appendChild(line);
    });
  }

  function patchCoreAndUI() {
    const c = core();
    if (!c || c.__onlineExpansionPatched) return;
    c.__onlineExpansionPatched = true;
    c.state.online = c.state.online || { competitive: defaultCompetitiveState(), challenge: defaultChallengeState() };

    mergeExtraPokemonDatabase();
    markShinyStructure();

    const originalFinalize = c.finalizeStarterDraft;
    c.finalizeStarterDraft = function patchedFinalizeStarterDraft() {
      const result = originalFinalize.apply(this, arguments);
      if (c.state.currentScreen === 'lobby' && online.selectedCharacter && c.state.gameMode !== 'duo') {
        const player = c.getPlayer('p1');
        if (player) player.name = online.selectedCharacter.name || player.name;
        ensurePlayerOnlineDefaults(player);
        online.selectedCharacter.player = compactPlayer(player);
        saveCharacter();
      }
      postRenderDecorate();
      return result;
    };

    const originalSetSetting = c.setSetting;
    c.setSetting = function patchedSetSetting(key, value) {
      if (key === 'theme') {
        localStorage.setItem(THEME_KEY, value === 'dark' ? 'dark' : 'basic');
        applyTheme();
        PB.ui?.renderSettingsModal?.();
        return;
      }
      return originalSetSetting.apply(this, arguments);
    };

    const originalConsume = c.consumeBagItem;
    c.consumeBagItem = function patchedConsumeBagItem(playerId, itemId) {
      const limited = getBattleItemLimitType(itemId);
      if (limited && c.state.currentScreen === 'battle') {
        window.PB_BATTLE_ITEM_LIMIT = window.PB_BATTLE_ITEM_LIMIT || { heal: 0, revive: 0 };
        if (window.PB_BATTLE_ITEM_LIMIT[limited] >= 1) { toast(limited === 'heal' ? '회복아이템은 배틀당 1개만 사용 가능' : '부활아이템은 배틀당 1개만 사용 가능'); return false; }
        const ok = originalConsume.apply(this, arguments);
        if (ok) window.PB_BATTLE_ITEM_LIMIT[limited] += 1;
        return ok;
      }
      return originalConsume.apply(this, arguments);
    };
    const originalRefund = c.refundBagItem;
    c.refundBagItem = function patchedRefundBagItem(playerId, itemId) {
      const limited = getBattleItemLimitType(itemId);
      if (limited && c.state.currentScreen === 'battle' && window.PB_BATTLE_ITEM_LIMIT) window.PB_BATTLE_ITEM_LIMIT[limited] = Math.max(0, Number(window.PB_BATTLE_ITEM_LIMIT[limited] || 0) - 1);
      return originalRefund.apply(this, arguments);
    };

    c.calculatePokemonMarketPrice = calculatePokemonPrice;
    c.ensurePlayerOnlineDefaults = ensurePlayerOnlineDefaults;
  }

  function getBattleItemLimitType(itemId) {
    const id = normalize(itemId);
    if (id === 'revive_shard') return 'revive';
    if (['good_potion', 'recovery_potion', 'potion', 'super_potion', 'hyper_potion', 'max_potion'].includes(id)) return 'heal';
    return '';
  }

  function mergeExtraPokemonDatabase() {
    const c = core();
    const extra = window.POKEMON_DATABASE_EXTRA_0422 || (typeof POKEMON_DATABASE_EXTRA_0422 !== 'undefined' ? POKEMON_DATABASE_EXTRA_0422 : []);
    if (!Array.isArray(extra) || !extra.length) return;
    const byId = c.state.pokemonById || new Map();
    extra.forEach((entry) => {
      if (!entry || !Number(entry.id) || byId.has(Number(entry.id))) return;
      if (!entry.speciesStats) entry.speciesStats = { ...(entry.stats || {}) };
      entry.statsCategory = '종족치';
      c.state.allPokemon.push(entry);
      byId.set(Number(entry.id), entry);
    });
    c.state.allPokemon.sort((a, b) => Number(a.id || 0) - Number(b.id || 0));
    c.state.pokemonById = byId;
  }
  function markShinyStructure() {
    const all = core()?.state?.allPokemon || [];
    all.forEach((pokemon) => {
      if (!('shinyAvailable' in pokemon)) pokemon.shinyAvailable = false;
      if (!('shinyAsset' in pokemon)) pokemon.shinyAsset = null;
      if (pokemon.nameKo === '갸라도스') {
        pokemon.shinyAvailable = true;
        pokemon.specialShinyNameKo = '붉은 갸라도스';
        pokemon.shinyKey = 'red_gyarados';
      }
    });
  }

  function patchBattleEngine() {
    if (!PB.battleEngine || PB.battleEngine.__onlineExpansionPatched) return;
    PB.battleEngine.__onlineExpansionPatched = true;
    const originalStart = PB.battleEngine.startBattle;
    PB.battleEngine.startBattle = function patchedStartBattle(options) {
      window.PB_BATTLE_ITEM_LIMIT = { heal: 0, revive: 0 };
      return originalStart.call(this, options || {});
    };
  }

  function enhanceSettingsModal() {
    const root = document.getElementById('modal-root');
    const grid = root?.querySelector?.('.settings-grid');
    if (!grid || grid.querySelector('[data-online-theme-section]')) return;
    const section = document.createElement('section');
    section.className = 'settings-section';
    section.setAttribute('data-online-theme-section', '1');
    const mode = localStorage.getItem(THEME_KEY) || 'dark';
    section.innerHTML = `<h3>테마</h3><div class="settings-row"><button type="button" class="settings-choice ${mode !== 'dark' ? 'active' : ''}" data-theme-mode="basic">기본테마</button><button type="button" class="settings-choice ${mode === 'dark' ? 'active' : ''}" data-theme-mode="dark">다크모드</button></div>`;
    grid.appendChild(section);
    section.querySelectorAll('[data-theme-mode]').forEach((button) => button.addEventListener('click', () => { core()?.setSetting?.('theme', button.dataset.themeMode); }));
  }
  function patchUI() {
    if (!PB.ui || PB.ui.__onlineExpansionPatched) return;
    PB.ui.__onlineExpansionPatched = true;
    const originalRenderAll = PB.ui.renderAll;
    PB.ui.renderAll = function patchedRenderAll() {
      const result = originalRenderAll.apply(this, arguments);
      window.setTimeout(postRenderDecorate, 0);
      return result;
    };
    const originalOpenSettings = PB.ui.openSettingsModal;
    PB.ui.openSettingsModal = function patchedOpenSettingsModal() {
      const result = originalOpenSettings.apply(this, arguments);
      window.setTimeout(enhanceSettingsModal, 0);
      return result;
    };
    const originalRenderSettings = PB.ui.renderSettingsModal;
    PB.ui.renderSettingsModal = function patchedRenderSettingsModal() {
      const result = originalRenderSettings.apply(this, arguments);
      window.setTimeout(enhanceSettingsModal, 0);
      return result;
    };
  }

  function renderCompetitiveCategory() {
    const tab = online.view || 'ranked';
    return `<section class="placeholder-stack">
      <div class="online-tab-row"><button data-online-tab="ranked" class="${tab === 'ranked' ? 'active' : ''}">경쟁전</button><button data-online-tab="challenge" class="${tab === 'challenge' ? 'active' : ''}">챌린지</button><button data-online-tab="market" class="${tab === 'market' ? 'active' : ''}">마켓</button></div>
      ${tab === 'challenge' ? renderChallengeView() : tab === 'market' ? renderMarketView() : renderRankedView()}
    </section>`;
  }

  function renderRankedView() {
    const st = currentTierState();
    const target = st.tier === 'beginner' ? 50 : 100;
    const points = Math.max(0, Math.min(target, Number(st.points || 0)));
    const width = Math.round((points / target) * 100);
    const promotion = st.promotionReady ? '<span class="online-pill alert">승급전</span>' : '';
    return `<div class="online-rank-card">
      <div class="item-title-row">
        <div class="online-rank-title">${online.selectedCharacter ? renderProfileAvatar(online.selectedCharacter.hair, 'small') : ''}<span>${escapeHtml(getTierLabel(st))}</span></div>
        <span class="online-pill">${points}/${target}</span>
      </div>
      <div class="online-progress"><i style="width:${width}%"></i></div>
      <div class="online-mini-row" style="margin-top:10px;"><span class="online-pill">승 ${Number(st.wins || 0)}</span><span class="online-pill">패 ${Number(st.losses || 0)}</span><span class="online-pill">레벨제한 Lv.${competitiveLevelCap()}</span></div>
      <p class="section-caption" style="margin-top:10px;">승리하면 +10~20포인트, 패배하면 -5포인트. 티어마다 레벨 제한이 적용됩니다. 승급전에서는 이벤트 트레이너가 등장합니다.</p>
      <div class="online-mini-row" style="justify-content:center;">${promotion}<button class="online-small-btn" data-competitive-start="1" style="min-width:180px;">경쟁전 시작</button></div>
    </div>`;
  }
  function renderChallengeView() {
    const ch = online.selectedCharacter || { challenge: defaultChallengeState() };
    const state = ch.challenge || defaultChallengeState();
    const cards = GYMS.map((gym, index) => {
      const done = Boolean(state.badges?.[gym.id]);
      return `<button type="button" class="online-badge-card ${done ? 'done' : ''}" data-gym-start="${gym.id}"><div style="font-size:12px;font-weight:900;color:${gym.color};">${escapeHtml(gym.type)}</div><h3 style="margin:4px 0 2px;color:#0c1d34;">${escapeHtml(gym.name)}</h3><p style="margin:0;color:#58708c;font-size:12px;font-weight:800;">${done ? '배지 획득' : `Lv.${12 + index * 6} 도전`}</p></button>`;
    }).join('');
    return `<div class="placeholder-card"><div class="item-title-row"><h3>신오 챌린지</h3><span class="mini-badge">배지 ${Object.keys(state.badges || {}).length}/8</span></div><p>4세대 체육관 관장 타입에 맞춘 AI 팀과 배틀합니다. 모든 배지를 모으면 5000원, 이상한사탕 30개, 신화의 파편 5개를 받습니다.</p></div>
      <div class="online-badge-grid">${cards}</div>
      <div class="placeholder-card"><div class="item-title-row"><h3>배지 교환</h3><span class="mini-badge">포인트 ${Number(state.badgePoints || 0)}</span></div><p>획득한 배지 포인트를 아이템으로 교환합니다.</p><div class="online-mini-row"><button class="chip-btn" data-badge-exchange="good_potion">고급상처약 1P</button><button class="chip-btn" data-badge-exchange="rare_candy">이상한사탕 1P</button></div></div>`;
  }

  function renderMarketView() {
    const c = core();
    const all = (c?.state?.allPokemon || []).filter((p) => p && !p.isMegaEvolution);
    const pageSize = 9;
    const pageCount = Math.max(1, Math.ceil(all.length / pageSize));
    online.marketPage = Math.max(0, Math.min(pageCount - 1, Number(online.marketPage || 0)));
    const rows = all.slice(online.marketPage * pageSize, online.marketPage * pageSize + pageSize).map((base) => {
      const price = calculatePokemonPrice(base);
      const types = (base.type || []).join(' / ');
      return `<div class="online-market-row"><div class="avatar-shell small">${PB.ui?.renderAvatar ? '' : ''}${renderMiniPokemon(base)}</div><div><div class="online-market-name">${escapeHtml(base.nameKo)}</div><div class="online-market-meta">${escapeHtml(types)} · Lv.5</div></div><div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;"><span class="online-price">$${price}</span><button class="chip-btn" style="padding:6px 9px;font-size:11px;" data-market-buy="${base.id}">구입</button></div></div>`;
    }).join('');
    const player = c?.getPlayer?.('p1');
    const reserveSales = (player?.reserve || []).slice(0, 8).map((pokemon) => `<button class="online-small-btn alt" data-market-sell="${escapeHtml(pokemon.uid)}">${escapeHtml(pokemon.currentName)} $${Math.floor(calculatePokemonPrice(pokemon.base)/2)}</button>`).join('') || '<span class="section-caption">판매 가능한 리저브 포켓몬 없음</span>';
    return `<div class="placeholder-card"><div class="item-title-row"><h3>포켓몬 마켓</h3><span class="mini-badge">${online.marketPage + 1}/${pageCount}</span></div><p>실전 채용률과 강함 기준으로 가격이 책정됩니다. 구매한 포켓몬은 리저브로 들어갑니다.</p><div class="online-mini-row"><button class="chip-btn" data-market-page="prev">◀</button><button class="chip-btn" data-market-page="next">▶</button></div></div><div class="online-market-list">${rows}</div><div class="placeholder-card"><h3>내 포켓몬 판매</h3><div class="online-mini-row">${reserveSales}</div></div>`;
  }
  function renderMiniPokemon(base) {
    const src = base?.image || base?.sprite || base?.asset || base?.spriteUrl || base?.media || '';
    const color = TYPE_COLORS[(base?.type || [])[0]] || '#7ecfff';
    if (src) return `<img src="${src}" alt="${escapeHtml(base.nameKo)}" style="width:100%;height:100%;object-fit:contain;">`;
    return `<span style="display:flex;width:100%;height:100%;border-radius:999px;background:${color};align-items:center;justify-content:center;color:#fff;font-weight:1000;">${escapeHtml(String(base?.nameKo || '?').slice(0,1))}</span>`;
  }

  function patchLeagueAdapter() {
    PB.league = PB.league || {};
    PB.league.renderCategory = renderCompetitiveCategory;
    PB.league.startNextMatch = startCompetitiveBattle;
    PB.league.navMatch = () => {};
    PB.league.recordResult = () => {};
    PB.league.getPlayerOrNpc = function getPlayerOrNpc(id) { return core()?.getPlayer?.(id); };
  }

  function findBaseByName(names) {
    const list = Array.isArray(names) ? names : [names];
    const all = core()?.state?.allPokemon || [];
    for (const name of list) {
      const found = all.find((p) => p?.nameKo === name || p?.nameEn === name);
      if (found) return found;
    }
    return null;
  }
  function fallbackByType(type, stageMin = 1) {
    const all = (core()?.state?.allPokemon || []).filter((p) => p && !p.isMegaEvolution && (p.type || []).includes(type) && getEvolutionStage(p) >= stageMin);
    return shuffle(all)[0] || shuffle(core()?.state?.allPokemon || [])[0] || null;
  }
  function makeRuntimeTeamByNames(names, level, fallbackType) {
    const team = [];
    names.forEach((name) => {
      const base = findBaseByName(name) || fallbackByType(fallbackType || '노말', 1);
      if (base) team.push(core().createRuntimePokemon(base, level));
    });
    while (team.length < 3) {
      const base = fallbackByType(fallbackType || '노말', 1);
      if (!base) break;
      team.push(core().createRuntimePokemon(base, level));
    }
    return team.slice(0, 3);
  }
  function averagePlayerLevel() {
    const team = core()?.getPlayer?.('p1')?.squad || [];
    if (!team.length) return 5;
    return Math.round(team.reduce((sum, p) => sum + Number(p.level || 5), 0) / team.length);
  }
  function competitiveLevelCap() {
    const tier = currentTierState().tier;
    if (tier === 'beginner') return 15;
    if (tier === 'monster') return 40;
    if (tier === 'super') return 80;
    return 100;
  }
  function makeCompetitiveAiTeam() {
    const st = currentTierState();
    const idx = tierIndex(st.tier);
    const level = Math.min(competitiveLevelCap(), Math.max(5, averagePlayerLevel() + Math.max(0, idx - 1) * 2));
    const all = (core()?.state?.allPokemon || []).filter((p) => p && !p.isMegaEvolution);
    const nonLegend = all.filter((p) => !core()?.shouldExcludeLegend?.(p));
    const legends = all.filter((p) => core()?.shouldExcludeLegend?.(p));
    const highStats = nonLegend.filter((p) => statTotal(p) >= 500 || ['한카리아스','고릴타','망나뇽','마기라스','핫삼','번치코','갸라도스','볼카모스','팬텀','루카리오','밀로틱','대짱이','자폭코일','초염몽','샤로다','가디안','삼삼드래','포푸니라'].includes(p.nameKo));
    let pool = nonLegend;
    if (st.tier === 'beginner') pool = nonLegend.filter((p) => getEvolutionStage(p) === 1);
    else if (st.tier === 'monster') pool = nonLegend.filter((p) => getEvolutionStage(p) <= 2);
    else if (st.tier === 'super') pool = nonLegend.filter((p) => getEvolutionStage(p) <= 3);
    else if (st.tier === 'hyper') pool = Math.random() < 0.04 && legends.length ? legends : (highStats.length ? highStats : nonLegend);
    else if (st.tier === 'master') pool = Math.random() < 0.30 && legends.length ? legends : (highStats.length ? highStats : nonLegend);
    if (!pool.length) pool = nonLegend.length ? nonLegend : all;
    const chosen = shuffle(pool).slice(0, 3);
    while (chosen.length < 3 && pool.length) chosen.push(shuffle(pool)[0]);
    const team = chosen.map((base) => core().createRuntimePokemon(base, level));
    const shopHoldables = (core()?.getShopCatalog?.() || []).filter((it) => String(it.category||'').includes('지닌물건'));
    const craftIds = ['awakening_lance','fighting_serum','hunting_instinct','storm_claw','unyielding_armor','golden_starlight','infinite_growth_drug','swift_boots','tri_relic_fragment','sealing_chain'];
    const mythIds = ['groudon_skeleton','palkia_pearl','kyogre_heart','dialga_diamond'];
    const byId = (id)=> (core()?.state?.itemsById?.get?.(id) || shopHoldables.find((it)=>normalize(it.id)===id) || {id, nameKo:id, category:'지닌물건'});
    function giveHeld(mon, item){ if(!mon||!item) return; mon.heldItems = mon.heldItems || []; mon.heldItems[0] = {...item, amount:1}; mon.heldItem = mon.heldItems[0]; }
    if (['super','hyper','master'].includes(st.tier)) {
      shuffle(team).slice(0,2).forEach((mon)=> giveHeld(mon, shuffle(shopHoldables)[0]));
      if (st.tier === 'hyper' && Math.random() < 0.03) giveHeld(team[0], byId(shuffle(craftIds)[0]));
      if (st.tier === 'master') {
        if (Math.random() < 0.10) giveHeld(team[0], byId(shuffle(craftIds)[0]));
        if (Math.random() < 0.05) giveHeld(team[1] || team[0], byId(shuffle(mythIds)[0]));
      }
    }
    team.forEach((mon)=>{
      if (st.tier === 'super' && Math.random() < 0.30) mon.bloodline = 'elite';
      if (st.tier === 'hyper' && Math.random() < 0.30) mon.bloodline = 'ancient';
      if (st.tier === 'master' && Math.random() < 0.10) mon.bloodline = 'mew';
    });
    return team;
  }
  function cloneForBattle(pokemon) {
    if (!pokemon?.base) return null;
    const clone = core().createRuntimePokemon(pokemon.base, Math.min(Number(online.__battleLevelCap || 100), Number(pokemon.level || 5)));
    clone.sourceUid = pokemon.uid;
    clone.exp = Number(pokemon.exp || 0);
    clone.heldItems = (pokemon.heldItems || []).map((item) => ({ ...item }));
    clone.heldItem = clone.heldItems[0] || null;
    clone.currentName = pokemon.currentName || clone.currentName;
    clone.moves = (pokemon.moves || []).slice(0, 3).map((move) => ({ ...move }));
    core().recalculateRuntimeStats?.(clone, { fullHeal: true });
    return clone;
  }
  function startCompetitiveBattle() {
    if (!online.selectedCharacter) { toast('캐릭터를 먼저 선택하세요.'); return false; }
    const player = core()?.getPlayer?.('p1');
    if (!player?.squad?.length) { toast('먼저 포켓몬을 선택하세요.'); return false; }
    ensurePlayerOnlineDefaults(player);
    const capCheck = competitiveLevelCap();
    const over = (player.squad || []).find((p) => Number(p.level || 1) > capCheck);
    if (over) { toast(`${getTierLabel(currentTierState())}에서는 Lv.${capCheck} 이하 포켓몬만 출전할 수 있습니다.`); return false; }
    const st = currentTierState();
    let opponentName = '경쟁전 AI';
    let opponentTeam = makeCompetitiveAiTeam();
    let intro = 'trainer-extra/elitesprite.mp4';
    let isPromotion = Boolean(st.promotionReady);
    if (isPromotion) {
      const trainer = PROMOTION_TRAINERS[(tierIndex(st.tier) * 3 + (3 - Number(st.rank || 3))) % PROMOTION_TRAINERS.length];
      opponentName = trainer.name;
      opponentTeam = makeRuntimeTeamByNames(trainer.team, Math.min(competitiveLevelCap(), averagePlayerLevel() + 2), '노말');
      intro = trainer.intro;
    }
    online.__battleLevelCap = competitiveLevelCap();
    const playerTeam = player.squad.map(cloneForBattle).filter(Boolean);
    online.__battleLevelCap = 0;
    PB.battleEngine?.startBattle?.({ playerId: 'p1', opponentId: 'competitive_ai', playerName: player.name, opponentName, playerTeam, opponentTeam, mode: 'competitive', theme: st.tier === 'beginner' ? 'beginner' : 'city', skipLevelReward: true, trainerIntroSrc: intro, specialBgm: isPromotion ? 'orastrainer_battle.mp3' : 'battle.mp3', onComplete: (payload) => handleCompetitiveComplete(payload, { isPromotion, playerTeam, opponentTeam, opponentName }) });
    return true;
  }
  function handleCompetitiveComplete(payload, ctx) {
    const won = payload?.winnerId === 'p1';
    const player = core()?.getPlayer?.('p1');
    if (!player) return false;
    applyCompetitiveExperience(payload, ctx.playerTeam, ctx.opponentTeam);
    core()?.healPlayerTeam?.('p1');
    if (won) core()?.addMoney?.('p1', 160 + tierIndex(currentTierState().tier) * 60);
    updateTierAfterBattle(won, ctx.isPromotion);
    saveCharacter();
    setTimeout(() => { core().returnToLobby(); toast(won ? '경쟁전 승리' : '경쟁전 패배'); }, won ? 4200 : 2200);
    return true;
  }
  function updateTierAfterBattle(won, wasPromotion) {
    const st = { ...defaultCompetitiveState(), ...currentTierState() };
    const target = st.tier === 'beginner' ? 50 : 100;
    if (won) st.wins = Number(st.wins || 0) + 1; else st.losses = Number(st.losses || 0) + 1;
    if (wasPromotion) {
      if (won) advanceTier(st); else { st.promotionReady = false; st.points = Math.max(0, Number(st.points || 0) - 5); }
    } else if (won) {
      st.points = Math.min(target, Number(st.points || 0) + 10 + Math.floor(Math.random() * 11));
      if (st.points >= target) st.promotionReady = true;
    } else {
      st.points = Math.max(0, Number(st.points || 0) - 5);
      st.promotionReady = false;
    }
    online.selectedCharacter.competitive = st;
  }
  function advanceTier(st) {
    st.promotionReady = false;
    st.points = 0;
    if (st.tier === 'beginner') { st.tier = 'monster'; st.rank = 3; return; }
    if (Number(st.rank || 3) > 1) st.rank = Number(st.rank || 3) - 1;
    else {
      const next = Math.min(TIERS.length - 1, tierIndex(st.tier) + 1);
      st.tier = TIERS[next].key;
      st.rank = 3;
    }
  }
  function applyCompetitiveExperience(payload, playerTeam, opponentTeam) {
    const player = core()?.getPlayer?.('p1');
    const stats = payload?.stats || {};
    const originals = new Map((player?.squad || []).map((p) => [p.uid, p]));
    const totalEnemyFaints = (opponentTeam || []).reduce((sum, p) => sum + (Number(stats[p.uid]?.deaths || 0) > 0 ? 1 : 0), 0);
    const leveled = new Set();
    (playerTeam || []).forEach((clone) => {
      const src = originals.get(clone.sourceUid);
      const kos = Number(stats[clone.uid]?.kos || 0);
      if (src && kos > 0) {
        core().applyLevelReward?.(src, kos, {});
        src.koCount = Number(src.koCount || 0) + kos;
        src.koStars = Math.min(5, Math.floor(Number(src.koCount || 0) / 10));
        src.totalExp = Number(src.totalExp || 0) + kos;
        src.competitiveDamageDealt = Number(src.competitiveDamageDealt || 0) + Number(stats[clone.uid]?.damageDealt || 0);
        src.competitiveDamageTaken = Number(src.competitiveDamageTaken || 0) + Number(stats[clone.uid]?.damageTaken || 0);
        leveled.add(src.uid);
      }
    });
    if (totalEnemyFaints > 0) {
      (player?.squad || []).forEach((p) => {
        const hasExpShare = (p.heldItems || []).some((it) => normalize(it.id) === 'exp_share');
        if (hasExpShare && !leveled.has(p.uid)) { core().applyLevelReward?.(p, totalEnemyFaints, {}); p.totalExp = Number(p.totalExp || 0) + totalEnemyFaints; }
      });
    }
  }

  function startGymBattle(gymId) {
    if (!online.selectedCharacter) { toast('캐릭터를 먼저 선택하세요.'); return; }
    const gym = GYMS.find((g) => g.id === gymId);
    const player = core()?.getPlayer?.('p1');
    if (!gym || !player?.squad?.length) return;
    const level = Math.max(8, 12 + GYMS.findIndex((g) => g.id === gymId) * 6, averagePlayerLevel());
    const opponentTeam = makeRuntimeTeamByNames(gym.team, level, gym.type);
    const playerTeam = player.squad.map(cloneForBattle).filter(Boolean);
    PB.battleEngine?.startBattle?.({ playerId: 'p1', opponentId: `gym_${gym.id}`, playerName: player.name, opponentName: `${gym.name}(${gym.type})`, playerTeam, opponentTeam, mode: 'challenge', skipLevelReward: true, trainerIntroSrc: 'trainer-extra/elitesprite.mp4', specialBgm: 'battle.mp3', onComplete: (payload) => handleGymComplete(payload, gym, { playerTeam, opponentTeam }) });
  }
  function handleGymComplete(payload, gym, ctx) {
    const won = payload?.winnerId === 'p1';
    if (won) {
      applyCompetitiveExperience(payload, ctx.playerTeam, ctx.opponentTeam);
      const ch = online.selectedCharacter;
      ch.challenge = ch.challenge || defaultChallengeState();
      if (!ch.challenge.badges[gym.id]) {
        ch.challenge.badges[gym.id] = true;
        ch.challenge.badgePoints = Number(ch.challenge.badgePoints || 0) + 1;
        core()?.addMoney?.('p1', 240 + Object.keys(ch.challenge.badges).length * 80);
      }
      if (Object.keys(ch.challenge.badges || {}).length >= GYMS.length && !ch.challenge.allClearRewarded) {
        ch.challenge.allClearRewarded = true;
        core()?.addConsumable?.('p1', 'rare_candy', 30);
        core()?.addMoney?.('p1', 5000);
        core()?.addConsumable?.('p1', 'mythic_fragment', 5);
      }
    }
    core()?.healPlayerTeam?.('p1');
    saveCharacter();
    setTimeout(() => { core().returnToLobby(); toast(won ? `${gym.name} 배지 획득` : `${gym.name}에게 패배`); }, won ? 4200 : 2200);
    return true;
  }

  function buyMarketPokemon(baseId) {
    const base = core()?.state?.pokemonById?.get?.(Number(baseId));
    const player = core()?.getPlayer?.('p1');
    if (!base || !player) return;
    const price = calculatePokemonPrice(base);
    // v3: 마켓에서도 포켓몬 중복 구입 허용
    if (!core().spendMoney('p1', price)) { toast('재화가 부족합니다.'); return; }
    const runtime = core().createRuntimePokemon(base, 5);
    const added = core().addPokemonToReserve?.('p1', runtime);
    if (!added) { core().addMoney?.('p1', price); toast('구입할 수 없습니다.'); return; }
    saveCharacter();
    PB.ui?.renderAll?.();
    toast(`${base.nameKo} 구입 완료`);
  }
  function sellMarketPokemon(uid) {
    const player = core()?.getPlayer?.('p1');
    if (!player) return;
    const idx = (player.reserve || []).findIndex((p) => p.uid === uid);
    if (idx < 0) return;
    const [pokemon] = player.reserve.splice(idx, 1);
    const price = Math.floor(calculatePokemonPrice(pokemon.base) / 2);
    core().addMoney('p1', price);
    saveCharacter();
    PB.ui?.renderAll?.();
    toast(`${pokemon.currentName} 판매 +$${price}`);
  }
  function exchangeBadge(itemId) {
    const ch = online.selectedCharacter;
    if (!ch) return;
    ch.challenge = ch.challenge || defaultChallengeState();
    const cost = 1;
    if (Number(ch.challenge.badgePoints || 0) < cost) { toast('배지 포인트가 부족합니다.'); return; }
    ch.challenge.badgePoints -= cost;
    core()?.addConsumable?.('p1', itemId, 1);
    saveCharacter();
    PB.ui?.renderAll?.();
    toast('교환 완료');
  }


  async function deleteCurrentCharacterV3() {
    const slot = online.selectedSlot || 'char1';
    if (!online.characters || !online.characters[slot]) { toast('삭제할 캐릭터가 없습니다.'); return false; }
    const name = online.characters[slot].name || slot;
    delete online.characters[slot];
    if (online.localStore?.characters) delete online.localStore.characters[slot];
    if (online.selectedSlot === slot) {
      online.selectedSlot = online.characters.char1 ? 'char1' : (online.characters.char2 ? 'char2' : 'char1');
      online.selectedCharacter = online.characters[online.selectedSlot] || null;
    }
    saveLocalStore();
    if (online.db && online.uid) {
      try {
        await online.db.ref(`characters/${online.uid}/${slot}`).remove();
        await online.db.ref(`saves/${online.uid}/${slot}`).remove();
        await online.db.ref(`playerPublicList/${online.uid}_${slot}`).set({ uid: online.uid, slot, deleted:true, hidden:true, updatedAt: now() });
      } catch (error) { console.warn('캐릭터 삭제 DB 반영 실패', error); }
    }
    if (online.selectedCharacter && online.selectedCharacter.player && (online.selectedCharacter.player.squad || []).length) {
      core().state.players.p1 = inflatePlayer(online.selectedCharacter.player, online.selectedCharacter.name);
      core().state.activePlayerId = 'p1';
      core().state.currentScreen = 'lobby';
      core().state.currentCategory = 'squad';
      PB.ui?.showScreen?.('lobby');
    } else if (!online.selectedCharacter) {
      core().state.currentScreen = 'title';
      PB.ui?.showScreen?.('title');
    }
    renderAuthPanel();
    PB.ui?.renderAll?.();
    toast(`${name} 삭제 완료`);
    return true;
  }

  window.PB_ONLINE_V3 = {
    getOnlineState: () => online,
    saveCharacter,
    renderAuthPanel,
    deleteCurrentCharacter: deleteCurrentCharacterV3
  };

  function bindDelegates() {
    document.addEventListener('click', handleOnlineStart, true);
    document.addEventListener('click', async (event) => {
      const auth = event.target.closest('[data-online-auth]');
      if (auth) {
        const kind = auth.dataset.onlineAuth;
        if (kind === 'logout') { await online.auth?.signOut?.(); renderAuthPanel(); return; }
        handleAuth(kind);
        return;
      }
      const create = event.target.closest('[data-character-create]');
      if (create) { online.creatingSlot = create.dataset.characterCreate; online.selectedHair = HAIR_ASSETS[0]; renderAuthPanel(); return; }
      const cancel = event.target.closest('[data-character-cancel]');
      if (cancel) { online.creatingSlot = null; renderAuthPanel(); return; }
      const hair = event.target.closest('[data-hair-choice]');
      if (hair) { online.selectedHair = hair.dataset.hairChoice; renderAuthPanel(); return; }
      const save = event.target.closest('[data-character-save]');
      if (save) { createCharacter(save.dataset.characterSave); return; }
      const select = event.target.closest('[data-character-select]');
      if (select) { selectCharacter(select.dataset.characterSelect); return; }
      const tab = event.target.closest('[data-online-tab]');
      if (tab) { online.view = tab.dataset.onlineTab; PB.ui?.renderAll?.(); return; }
      if (event.target.closest('[data-competitive-start]')) { startCompetitiveBattle(); return; }
      const gym = event.target.closest('[data-gym-start]');
      if (gym) { startGymBattle(gym.dataset.gymStart); return; }
      const ex = event.target.closest('[data-badge-exchange]');
      if (ex) { exchangeBadge(ex.dataset.badgeExchange); return; }
      const mb = event.target.closest('[data-market-buy]');
      if (mb) { buyMarketPokemon(mb.dataset.marketBuy); return; }
      const ms = event.target.closest('[data-market-sell]');
      if (ms) { sellMarketPokemon(ms.dataset.marketSell); return; }
      const mp = event.target.closest('[data-market-page]');
      if (mp) { const all = (core()?.state?.allPokemon || []).filter((p) => p && !p.isMegaEvolution); const pageCount = Math.max(1, Math.ceil(all.length / 9)); online.marketPage = (Number(online.marketPage || 0) + (mp.dataset.marketPage === 'next' ? 1 : -1) + pageCount) % pageCount; PB.ui?.renderAll?.(); return; }
      if (event.target.closest('[data-save-progress]')) { await saveCurrentProgress(); return; }
      if (event.target.closest('[data-save-character]')) { const ok = await saveCharacter(); toast(ok ? '저장 완료' : '저장 실패'); return; }
    });
    window.addEventListener('beforeunload', () => { try { saveCharacter(); } catch (error) {} });
  }

  function init() {
    if (!PB.core || !PB.ui || !PB.battleEngine) { setTimeout(init, 80); return; }
    injectStyles();
    applyTheme();
    patchCoreAndUI();
    patchBattleEngine();
    patchUI();
    patchLeagueAdapter();
    initFirebase();
    bindDelegates();
    renderAuthPanel();
    PB.ui.renderAll();
    postRenderDecorate();
  }

  document.addEventListener('DOMContentLoaded', () => setTimeout(init, 60));
})();
