const POKEMON_DATABASE_4 = [
  {
    id: 121,
    nameKo: "제크로무",
    nameEn: "Zekrom",
    finalFormKo: "제크로무",
    finalFormEn: "Zekrom",
    type: ["드래곤", "전기"],
    stats: { hp: 100, attack: 150, defense: 120, spAttack: 120, spDefense: 100, speed: 90 },
    statTotal: 680,
    battleNote: "높은 공격과 넓은 견제 범위를 바탕으로 압박하는 물리형 전설 포켓몬으로, 용의춤 이후에는 전장을 빠르게 정리하는 스위퍼로 쓰기 좋다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: null,
    appearance: { outer: "transparent", core: "#1F1F1F", bars: ["#2E6BD6", "#9AA0A6"] },
    moves: [
      {
        nameKo: "볼트크래시",
        nameEn: "Bolt Strike",
        power: 130,
        accuracy: 85,
        type: "전기",
        category: "물리",
        pp: 5,
        description: "강한 전기 에너지로 몸을 감싸 돌진한다. (The user cloaks itself in electricity and charges at the target.)"
      },
      {
        nameKo: "역린",
        nameEn: "Outrage",
        power: 120,
        accuracy: 100,
        type: "드래곤",
        category: "물리",
        pp: 10,
        description: "격렬하게 난폭한 힘을 쏟아낸다. (The user rampages and attacks for several turns.)"
      },
      {
        nameKo: "용의춤",
        nameEn: "Dragon Dance",
        power: null,
        accuracy: null,
        type: "드래곤",
        category: "변화",
        pp: 20,
        description: "공격과 스피드를 동시에 끌어올린다. (A mystic dance that boosts Attack and Speed.)",
        logicExplanation: "설명: 사용자의 공격과 스피드를 각각 올린다.\\n공식: user.stages.attack += 1; user.stages.speed += 1\\n규칙: 중첩 사용 가능, 랭크 상한은 게임 규칙에 따라 제한한다"
      }
    ]
  },
  {
    id: 122,
    nameKo: "게노세크트",
    nameEn: "Genesect",
    finalFormKo: "게노세크트",
    finalFormEn: "Genesect",
    type: ["벌레", "강철"],
    stats: { hp: 71, attack: 120, defense: 95, spAttack: 120, spDefense: 95, speed: 99 },
    statTotal: 600,
    battleNote: "기술폭과 높은 스피드를 바탕으로 유턴과 특수·물리 혼합 압박을 걸기 쉬운 만능형 벌레/강철 포켓몬이다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: null,
    appearance: { outer: "transparent", core: "#7B2F2F", bars: ["#B9BFC7", "#2B2B2B"] },
    moves: [
      {
        nameKo: "테크노버스터",
        nameEn: "Techno Blast",
        power: 120,
        accuracy: 100,
        type: "노말",
        category: "특수",
        pp: 5,
        description: "특수한 빔을 압축해 발사한다. (Fires a special attack with a modified energy cannon.)"
      },
      {
        nameKo: "시저크로스",
        nameEn: "X-Scissor",
        power: 80,
        accuracy: 100,
        type: "벌레",
        category: "물리",
        pp: 15,
        description: "양팔을 교차시켜 적을 베어낸다. (Slashes the target with crossed scythes.)"
      },
      {
        nameKo: "스피드스타트",
        nameEn: "Shift Gear",
        power: null,
        accuracy: null,
        type: "강철",
        category: "변화",
        pp: 10,
        description: "내부 기어를 재정렬해 공격과 스피드를 높인다. (Rotates its internal gears to sharply raise Attack and Speed.)",
        logicExplanation: "설명: 사용자의 공격을 크게 올리고 스피드를 더 크게 올린다.\\n공식: user.stages.attack += 1; user.stages.speed += 2\\n규칙: 중첩 사용 가능, 랭크 상한은 게임 규칙에 따라 제한한다"
      }
    ]
  },
  {
    id: 123,
    nameKo: "코일",
    nameEn: "Magnemite",
    finalFormKo: "자폭코일",
    finalFormEn: "Magnezone",
    type: ["전기", "강철"],
    stats: { hp: 25, attack: 35, defense: 70, spAttack: 95, spDefense: 55, speed: 45 },
    statTotal: 325,
    battleNote: "특수공격과 내성이 균형 잡혀 있고, 전기자석파와 교체 압박으로 초반부터 템포를 잡기 좋은 전기/강철 초반 포켓몬이다.",
    evolution: { evoLevel: 30, nextEvoId: 124 },
    ability: "Sturdy",
    appearance: { outer: "transparent", core: "#B8BCC4", bars: ["#D44A4A", "#2F6DB5"] },
    moves: [
      {
        nameKo: "전기쇼크",
        nameEn: "Thunder Shock",
        power: 40,
        accuracy: 100,
        type: "전기",
        category: "특수",
        pp: 30,
        description: "약한 전류를 흘려보내 공격한다. (An electrical shock is hurled at the target.)"
      },
      {
        nameKo: "전기자석파",
        nameEn: "Thunder Wave",
        power: null,
        accuracy: 90,
        type: "전기",
        category: "변화",
        pp: 20,
        description: "전류로 상대를 마비시킨다. (A weak electric charge paralyzes the target.)",
        logicExplanation: "설명: 대상에게 마비를 부여해 스피드를 크게 낮추고 행동 실패를 유발한다.\\n공식: if hit and target not immune: target.status = 'paralysis'; target.speedMultiplier = 0.25; target.fullParalysisChance = 0.25\\n규칙: 전기 타입 등 면역 대상은 실패할 수 있다, 마비의 스피드 저하는 즉시 적용된다, 행동 불능 판정은 매 턴마다 독립적으로 계산한다"
      },
      {
        nameKo: "튀어오르기",
        nameEn: "Supersonic",
        power: null,
        accuracy: 55,
        type: "노말",
        category: "변화",
        pp: 20,
        description: "초음파로 상대를 혼란시킨다. (The user generates odd sound waves that confuse the target.)",
        logicExplanation: "설명: 초음파로 대상에게 혼란을 부여한다.\\n공식: if hit and target not immune: target.status = 'confusion'; target.confusionTurns = random(1,4)\\n규칙: 혼란 중에는 매 턴 자가타격 판정을 할 수 있다, 대상 보호기나 면역 규칙은 게임 시스템에 맞춰 처리한다"
      }
    ]
  },
  {
    id: 124,
    nameKo: "레어코일",
    nameEn: "Magneton",
    finalFormKo: "자폭코일",
    finalFormEn: "Magnezone",
    type: ["전기", "강철"],
    stats: { hp: 50, attack: 60, defense: 95, spAttack: 120, spDefense: 70, speed: 70 },
    statTotal: 465,
    battleNote: "강한 특수 화력과 좋은 저항 상성을 바탕으로 선공권을 잡기 쉬운 중간 진화형 전기/강철 어태커다.",
    evolution: { evoLevel: 36, nextEvoId: 125 },
    ability: "Sturdy",
    appearance: { outer: "transparent", core: "#C0C6CF", bars: ["#D54B4B", "#316DB6"] },
    moves: [
      {
        nameKo: "볼트체인지",
        nameEn: "Volt Switch",
        power: 70,
        accuracy: 100,
        type: "전기",
        category: "특수",
        pp: 20,
        description: "공격한 뒤 바로 교체한다. (Attacks and then switches out immediately.)"
      },
      {
        nameKo: "전기자석파",
        nameEn: "Thunder Wave",
        power: null,
        accuracy: 90,
        type: "전기",
        category: "변화",
        pp: 20,
        description: "전류로 상대를 마비시킨다. (A weak electric charge paralyzes the target.)",
        logicExplanation: "설명: 대상에게 마비를 부여해 스피드를 크게 낮추고 행동 실패를 유발한다.\\n공식: if hit and target not immune: target.status = 'paralysis'; target.speedMultiplier = 0.25; target.fullParalysisChance = 0.25\\n규칙: 전기 타입 등 면역 대상은 실패할 수 있다, 마비의 스피드 저하는 즉시 적용된다, 행동 불능 판정은 매 턴마다 독립적으로 계산한다"
      },
      {
        nameKo: "러스터캐논",
        nameEn: "Flash Cannon",
        power: 80,
        accuracy: 100,
        type: "강철",
        category: "특수",
        pp: 10,
        description: "강한 빛의 폭발로 공격한다. (The user gathers all its light energy and releases it.)"
      }
    ]
  },
  {
    id: 125,
    nameKo: "자폭코일",
    nameEn: "Magnezone",
    finalFormKo: "자폭코일",
    finalFormEn: "Magnezone",
    type: ["전기", "강철"],
    stats: { hp: 70, attack: 70, defense: 115, spAttack: 130, spDefense: 90, speed: 60 },
    statTotal: 535,
    battleNote: "특수공격이 매우 높고 내성도 좋아, 전기 견제와 강철 타점으로 교체를 강제하는 강력 특수 브레이커다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: "Sturdy",
    appearance: { outer: "transparent", core: "#AEB5BE", bars: ["#D14D4D", "#1F1F1F"] },
    moves: [
      {
        nameKo: "전기자석파",
        nameEn: "Thunder Wave",
        power: null,
        accuracy: 90,
        type: "전기",
        category: "변화",
        pp: 20,
        description: "전류로 상대를 마비시킨다. (A weak electric charge paralyzes the target.)",
        logicExplanation: "설명: 대상에게 마비를 부여해 스피드를 크게 낮추고 행동 실패를 유발한다.\\n공식: if hit and target not immune: target.status = 'paralysis'; target.speedMultiplier = 0.25; target.fullParalysisChance = 0.25\\n규칙: 전기 타입 등 면역 대상은 실패할 수 있다, 마비의 스피드 저하는 즉시 적용된다, 행동 불능 판정은 매 턴마다 독립적으로 계산한다"
      },
      {
        nameKo: "자기부상",
        nameEn: "Magnet Rise",
        power: null,
        accuracy: null,
        type: "전기",
        category: "변화",
        pp: 10,
        description: "자기장으로 몸을 띄워 땅 기술을 피한다. (The user levitates using electromagnetism.)",
        logicExplanation: "설명: 자기장으로 몸을 띄워 일정 턴 동안 땅 기술에 면역이 된다.\\n공식: user.statusEffects.magnetRise = true; user.magnetRiseTurns = 5\\n규칙: 땅 타입 기술 면역을 부여한다, 교체 시 지속 여부는 게임 규칙에 따라 처리한다"
      },
      {
        nameKo: "전자포",
        nameEn: "Zap Cannon",
        power: 120,
        accuracy: 50,
        type: "전기",
        category: "특수",
        pp: 5,
        description: "강력한 전류 포탄을 발사한다. (An electric blast is fired like a cannon.)"
      }
    ]
  },
  {
    id: 126,
    nameKo: "꼬몽울",
    nameEn: "Budew",
    finalFormKo: "로즈레이드",
    finalFormEn: "Roserade",
    type: ["풀", "독"],
    stats: { hp: 40, attack: 30, defense: 35, spAttack: 50, spDefense: 70, speed: 55 },
    statTotal: 280,
    battleNote: "초반에는 약하지만 상태이상 보조와 씨앗 계열 기술을 익히며, 최종진화형 로즈레이드는 빠른 특수 어태커로 이어진다.",
    evolution: { evoLevel: 16, nextEvoId: 127 },
    ability: null,
    appearance: { outer: "transparent", core: "#7CCB4B", bars: ["#F2D24B", "#C94B7A"] },
    moves: [
      {
        nameKo: "독침",
        nameEn: "Poison Sting",
        power: 15,
        accuracy: 100,
        type: "독",
        category: "물리",
        pp: 35,
        description: "독이 묻은 침을 쏜다. (The user stabs the target with a toxic barb.)"
      },
      {
        nameKo: "씨뿌리기",
        nameEn: "Leech Seed",
        power: null,
        accuracy: 90,
        type: "풀",
        category: "변화",
        pp: 10,
        description: "씨앗을 심어 매 턴 체력을 빼앗는다. (Plants a seed that drains HP each turn.)",
        logicExplanation: "설명: 상대에게 씨앗을 심어 매 턴 체력을 흡수한다.\\n공식: target.statusEffects.leechSeed = true; endTurnDrain = floor(target.maxHP / 8); target.hp -= endTurnDrain; user.hp = min(user.maxHP, user.hp + endTurnDrain)\\n규칙: 풀 타입은 씨뿌리기 면역, 교체 후에도 효과는 유지, 매 턴 종료 시 자동으로 피해를 준다"
      },
      {
        nameKo: "저리가루",
        nameEn: "Stun Spore",
        power: null,
        accuracy: 75,
        type: "풀",
        category: "변화",
        pp: 30,
        description: "가루를 뿌려 상대를 마비시킨다. (Scatters powder to paralyze the target.)",
        logicExplanation: "설명: 가루를 뿌려 상대를 마비시킨다.\\n공식: if hit and target not immune: target.status = 'paralysis'; target.speedMultiplier = 0.25; target.fullParalysisChance = 0.25\\n규칙: 풀 타입이나 면역 상태에는 실패할 수 있다, 전기자석파와 동일한 마비 규칙을 사용한다"
      }
    ]
  },
  {
    id: 127,
    nameKo: "로젤리아",
    nameEn: "Roselia",
    finalFormKo: "로즈레이드",
    finalFormEn: "Roserade",
    type: ["풀", "독"],
    stats: { hp: 50, attack: 60, defense: 45, spAttack: 100, spDefense: 80, speed: 65 },
    statTotal: 400,
    battleNote: "특수공격이 높고 상태이상과 회복기를 섞기 좋아, 초반부터 완성도 있는 특수 어태커처럼 굴리기 쉽다.",
    evolution: { evoLevel: 36, nextEvoId: 128 },
    ability: null,
    appearance: { outer: "transparent", core: "#55B14A", bars: ["#E86C9A", "#FFFFFF"] },
    moves: [
      {
        nameKo: "에너지볼",
        nameEn: "Energy Ball",
        power: 90,
        accuracy: 100,
        type: "풀",
        category: "특수",
        pp: 10,
        description: "자연의 에너지를 한 덩어리로 모아 쏜다. (Draws power from nature and fires it at the target.)"
      },
      {
        nameKo: "오물폭탄",
        nameEn: "Sludge Bomb",
        power: 90,
        accuracy: 100,
        type: "독",
        category: "특수",
        pp: 10,
        description: "진흙 같은 독 덩어리를 던진다. (Unsanitary sludge is hurled at the target.)"
      },
      {
        nameKo: "광합성",
        nameEn: "Synthesis",
        power: null,
        accuracy: null,
        type: "풀",
        category: "변화",
        pp: 5,
        description: "햇빛을 받아 체력을 회복한다. (Restores HP using light energy.)",
        logicExplanation: "설명: 햇빛을 받아 체력을 회복한다.\\n공식: if weather == 'sunny': heal = floor(user.maxHP * 2 / 3) else heal = floor(user.maxHP / 2); user.hp = min(user.maxHP, user.hp + heal)\\n규칙: 회복량은 최대 HP를 넘지 않는다, 날씨에 따라 회복량이 달라진다"
      }
    ]
  },
  {
    id: 128,
    nameKo: "로즈레이드",
    nameEn: "Roserade",
    finalFormKo: "로즈레이드",
    finalFormEn: "Roserade",
    type: ["풀", "독"],
    stats: { hp: 60, attack: 70, defense: 65, spAttack: 125, spDefense: 105, speed: 90 },
    statTotal: 515,
    battleNote: "스피드와 특수공격이 모두 높아 선공 압박이 강하고, 독압정과 회복기를 섞는 운영도 가능한 특수 어태커다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: null,
    appearance: { outer: "transparent", core: "#4FB34B", bars: ["#D84D86", "#2FA3D5"] },
    moves: [
      {
        nameKo: "기가드레인",
        nameEn: "Giga Drain",
        power: 75,
        accuracy: 100,
        type: "풀",
        category: "특수",
        pp: 10,
        description: "상대의 생명력을 빨아들여 공격한다. (A nutrient-draining attack that recovers HP.)",
        logicExplanation: "설명: 공격으로 준 피해의 절반만큼 체력을 회복한다.\\n공식: damage = calculateDamage(...); heal = floor(damage / 2); user.hp = min(user.maxHP, user.hp + heal)\\n규칙: 피해량 기준으로 회복한다, 흡수 불가 상태나 체력 만땅일 때는 회복량이 제한된다"
      },
      {
        nameKo: "오물폭탄",
        nameEn: "Sludge Bomb",
        power: 90,
        accuracy: 100,
        type: "독",
        category: "특수",
        pp: 10,
        description: "진흙 같은 독 덩어리를 던진다. (Unsanitary sludge is hurled at the target.)"
      },
      {
        nameKo: "독압정",
        nameEn: "Toxic Spikes",
        power: null,
        accuracy: null,
        type: "독",
        category: "변화",
        pp: 20,
        description: "상대 진영에 독 가시를 깔아 교체를 견제한다. (Scatters poisonous spikes on the foe's side.)",
        logicExplanation: "설명: 상대 진영에 독 가시를 설치한다.\\n공식: opponentSide.toxicSpikesLayers = min(2, opponentSide.toxicSpikesLayers + 1)\\n규칙: 1겹은 교체 시 독 상태 부여, 2겹은 맹독 부여로 처리 가능, 비행/부유 등 지면 비접촉 대상은 영향이 없을 수 있다, 독 타입 포켓몬이 진입하면 층이 제거될 수 있다"
      }
    ]
  },
  {
    id: 129,
    nameKo: "마디네",
    nameEn: "Venipede",
    finalFormKo: "펜드라",
    finalFormEn: "Scolipede",
    type: ["벌레", "독"],
    stats: { hp: 30, attack: 45, defense: 59, spAttack: 30, spDefense: 39, speed: 57 },
    statTotal: 260,
    battleNote: "초반 물리 내구가 나쁘지 않고, 최종진화형 펜드라는 빠른 스피드와 독압정 압박을 함께 가져가는 전형적인 스위퍼다.",
    evolution: { evoLevel: 22, nextEvoId: 130 },
    ability: null,
    appearance: { outer: "transparent", core: "#A63A3A", bars: ["#1E1E1E", "#E0C22B"] },
    moves: [
      {
        nameKo: "독침",
        nameEn: "Poison Sting",
        power: 15,
        accuracy: 100,
        type: "독",
        category: "물리",
        pp: 35,
        description: "독이 묻은 침을 쏜다. (The user stabs the target with a toxic barb.)"
      },
      {
        nameKo: "구르기",
        nameEn: "Rollout",
        power: 30,
        accuracy: 90,
        type: "바위",
        category: "물리",
        pp: 20,
        description: "몸을 둥글게 말고 연속으로 부딪친다. (Rolls into the target over and over.)"
      },
      {
        nameKo: "방어",
        nameEn: "Protect",
        power: null,
        accuracy: null,
        type: "노말",
        category: "변화",
        pp: 10,
        description: "그 턴의 대부분의 공격을 막아낸다. (Enables the user to evade all attacks.)",
        logicExplanation: "설명: 그 턴의 대부분의 공격을 막아낸다.\\n공식: blockIncomingDamage = true for this turn\\n규칙: 연속 사용 시 성공률 저하를 적용할 수 있다, 일부 관통형 기술은 별도 처리한다"
      }
    ]
  },
  {
    id: 130,
    nameKo: "휠구",
    nameEn: "Whirlipede",
    finalFormKo: "펜드라",
    finalFormEn: "Scolipede",
    type: ["벌레", "독"],
    stats: { hp: 40, attack: 55, defense: 99, spAttack: 40, spDefense: 79, speed: 47 },
    statTotal: 360,
    battleNote: "방어가 매우 높아 한 번 버티고 독압정이나 교란기를 깔기 좋으며, 최종진화형으로 가면 속도형 물리 스위퍼가 된다.",
    evolution: { evoLevel: 30, nextEvoId: 131 },
    ability: null,
    appearance: { outer: "transparent", core: "#693B4B", bars: ["#E0B200", "#1A1A1A"] },
    moves: [
      {
        nameKo: "독압정",
        nameEn: "Toxic Spikes",
        power: null,
        accuracy: null,
        type: "독",
        category: "변화",
        pp: 20,
        description: "상대 진영에 독 가시를 깔아 교체를 견제한다. (Scatters poisonous spikes on the foe's side.)",
        logicExplanation: "설명: 상대 진영에 독 가시를 설치한다.\\n공식: opponentSide.toxicSpikesLayers = min(2, opponentSide.toxicSpikesLayers + 1)\\n규칙: 1겹은 교체 시 독 상태 부여, 2겹은 맹독 부여로 처리 가능, 비행/부유 등 지면 비접촉 대상은 영향이 없을 수 있다, 독 타입 포켓몬이 진입하면 층이 제거될 수 있다"
      },
      {
        nameKo: "방어",
        nameEn: "Protect",
        power: null,
        accuracy: null,
        type: "노말",
        category: "변화",
        pp: 10,
        description: "그 턴의 대부분의 공격을 막아낸다. (Enables the user to evade all attacks.)",
        logicExplanation: "설명: 그 턴의 대부분의 공격을 막아낸다.\\n공식: blockIncomingDamage = true for this turn\\n규칙: 연속 사용 시 성공률 저하를 적용할 수 있다, 일부 관통형 기술은 별도 처리한다"
      },
      {
        nameKo: "독찌르기",
        nameEn: "Poison Jab",
        power: 80,
        accuracy: 100,
        type: "독",
        category: "물리",
        pp: 20,
        description: "독성을 담은 찌르기로 공격한다. (The target is stabbed with a toxic barb.)"
      }
    ]
  },
  {
    id: 131,
    nameKo: "펜드라",
    nameEn: "Scolipede",
    finalFormKo: "펜드라",
    finalFormEn: "Scolipede",
    type: ["벌레", "독"],
    stats: { hp: 60, attack: 100, defense: 89, spAttack: 55, spDefense: 69, speed: 112 },
    statTotal: 485,
    battleNote: "높은 공격과 스피드를 바탕으로 칼춤 이후 전장을 휘젓기 쉽고, 독압정 선봉 운영도 가능한 물리 스위퍼다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: null,
    appearance: { outer: "transparent", core: "#523844", bars: ["#D84B4B", "#E0B200"] },
    moves: [
      {
        nameKo: "메가혼",
        nameEn: "Megahorn",
        power: 120,
        accuracy: 85,
        type: "벌레",
        category: "물리",
        pp: 10,
        description: "거대한 뿔로 세차게 들이받는다. (A brutal charge is made with huge horns.)"
      },
      {
        nameKo: "독압정",
        nameEn: "Toxic Spikes",
        power: null,
        accuracy: null,
        type: "독",
        category: "변화",
        pp: 20,
        description: "상대 진영에 독 가시를 깔아 교체를 견제한다. (Scatters poisonous spikes on the foe's side.)",
        logicExplanation: "설명: 상대 진영에 독 가시를 설치한다.\\n공식: opponentSide.toxicSpikesLayers = min(2, opponentSide.toxicSpikesLayers + 1)\\n규칙: 1겹은 교체 시 독 상태 부여, 2겹은 맹독 부여로 처리 가능, 비행/부유 등 지면 비접촉 대상은 영향이 없을 수 있다, 독 타입 포켓몬이 진입하면 층이 제거될 수 있다"
      },
      {
        nameKo: "칼춤",
        nameEn: "Swords Dance",
        power: null,
        accuracy: null,
        type: "노말",
        category: "변화",
        pp: 20,
        description: "검무를 추듯 몸을 움직여 공격력을 크게 올린다. (A frenetic dance to sharply raise Attack.)",
        logicExplanation: "설명: 사용자의 공격을 크게 올린다.\\n공식: user.stages.attack += 2\\n규칙: 중첩 사용 가능, 랭크 상한은 게임 규칙에 따라 제한한다"
      }
    ]
  },
  {
    id: 132,
    nameKo: "달막화",
    nameEn: "Darumaka",
    finalFormKo: "불비달마",
    finalFormEn: "Darmanitan",
    type: ["불꽃"],
    stats: { hp: 70, attack: 90, defense: 45, spAttack: 15, spDefense: 45, speed: 50 },
    statTotal: 315,
    battleNote: "공격 종족값이 높아 단순 화력으로 밀기 쉬운 물리형 초중반 포켓몬이며, 최종진화형은 폭발적인 힘으로 정면 승부를 건다.",
    evolution: { evoLevel: 35, nextEvoId: 133 },
    ability: null,
    appearance: { outer: "transparent", core: "#D83A2F", bars: ["#F49D37", "#F5D96B"] },
    moves: [
      {
        nameKo: "불꽃세례",
        nameEn: "Ember",
        power: 40,
        accuracy: 100,
        type: "불꽃",
        category: "특수",
        pp: 25,
        description: "작은 불꽃을 날려 공격한다. (The target is attacked with small flames.)"
      },
      {
        nameKo: "화염자동차",
        nameEn: "Flame Charge",
        power: 50,
        accuracy: 100,
        type: "불꽃",
        category: "물리",
        pp: 20,
        description: "몸을 불태우며 돌진하고 스피드를 올린다. (Cloaks the user in flame and charges, raising Speed.)",
        logicExplanation: "설명: 불꽃 돌진 후 사용자의 스피드를 올린다.\\n공식: damage = calculateDamage(...); user.stages.speed += 1\\n규칙: 피해를 준 뒤 스피드 상승이 적용된다, 스피드 상승은 랭크 상한에 따른다"
      },
      {
        nameKo: "깨물어부수기",
        nameEn: "Bite",
        power: 60,
        accuracy: 100,
        type: "악",
        category: "물리",
        pp: 25,
        description: "날카로운 이빨로 물어뜯는다. (The target is bitten with viciously sharp fangs.)"
      }
    ]
  },
  {
    id: 133,
    nameKo: "불비달마",
    nameEn: "Darmanitan",
    finalFormKo: "불비달마",
    finalFormEn: "Darmanitan",
    type: ["불꽃"],
    stats: { hp: 105, attack: 140, defense: 55, spAttack: 30, spDefense: 55, speed: 95 },
    statTotal: 480,
    battleNote: "매우 높은 공격으로 한 번의 교환에 큰 부담을 주는 순수 물리 화력형 포켓몬으로, 화염자동차와 강력한 일격기가 잘 맞는다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: null,
    appearance: { outer: "transparent", core: "#D73B2E", bars: ["#F39A37", "#F2D25E"] },
    moves: [
      {
        nameKo: "플레어드라이브",
        nameEn: "Flare Blitz",
        power: 120,
        accuracy: 100,
        type: "불꽃",
        category: "물리",
        pp: 15,
        description: "몸 전체를 불꽃으로 두르고 돌진한다. (The user cloaks itself in fire and charges at the target.)"
      },
      {
        nameKo: "지진",
        nameEn: "Earthquake",
        power: 100,
        accuracy: 100,
        type: "땅",
        category: "물리",
        pp: 10,
        description: "지면을 크게 흔들어 공격한다. (A powerful quake strikes nearby Pokémon.)"
      },
      {
        nameKo: "화염자동차",
        nameEn: "Flame Charge",
        power: 50,
        accuracy: 100,
        type: "불꽃",
        category: "물리",
        pp: 20,
        description: "몸을 불태우며 돌진하고 스피드를 올린다. (Cloaks the user in flame and charges, raising Speed.)",
        logicExplanation: "설명: 불꽃 돌진 후 사용자의 스피드를 올린다.\\n공식: damage = calculateDamage(...); user.stages.speed += 1\\n규칙: 피해를 준 뒤 스피드 상승이 적용된다, 스피드 상승은 랭크 상한에 따른다"
      }
    ]
  },
  {
    id: 134,
    nameKo: "흥나숭",
    nameEn: "Grookey",
    finalFormKo: "고릴타",
    finalFormEn: "Rillaboom",
    type: ["풀"],
    stats: { hp: 50, attack: 65, defense: 50, spAttack: 40, spDefense: 40, speed: 65 },
    statTotal: 310,
    battleNote: "초반에는 평범하지만 리듬감 있게 성장하며, 최종진화형 고릴타는 강한 물리 화력과 필드 보조를 함께 노릴 수 있다.",
    evolution: { evoLevel: 16, nextEvoId: 135 },
    ability: null,
    appearance: { outer: "transparent", core: "#4CAF50", bars: ["#8B5A2B", "#C8A97E"] },
    moves: [
      {
        nameKo: "나뭇잎",
        nameEn: "Branch Poke",
        power: 40,
        accuracy: 100,
        type: "풀",
        category: "물리",
        pp: 40,
        description: "나뭇가지를 휘둘러 공격한다. (The user attacks with a sharpened branch.)"
      },
      {
        nameKo: "울음소리",
        nameEn: "Growl",
        power: null,
        accuracy: 100,
        type: "노말",
        category: "변화",
        pp: 40,
        description: "귀여운 울음소리로 상대의 공격을 낮춘다. (The user growls in a cute way to lower the target's Attack.)",
        logicExplanation: "설명: 상대의 공격을 1랭크 낮춘다.\\n공식: target.stages.attack -= 1\\n규칙: 랭크 하한은 게임 규칙에 따라 제한한다"
      },
      {
        nameKo: "씨뿌리기",
        nameEn: "Leech Seed",
        power: null,
        accuracy: 90,
        type: "풀",
        category: "변화",
        pp: 10,
        description: "씨앗을 심어 매 턴 체력을 빼앗는다. (Plants a seed that drains HP each turn.)",
        logicExplanation: "설명: 상대에게 씨앗을 심어 매 턴 체력을 흡수한다.\\n공식: target.statusEffects.leechSeed = true; endTurnDrain = floor(target.maxHP / 8); target.hp -= endTurnDrain; user.hp = min(user.maxHP, user.hp + endTurnDrain)\\n규칙: 풀 타입은 씨뿌리기 면역, 교체 후에도 효과는 유지, 매 턴 종료 시 자동으로 피해를 준다"
      }
    ]
  },
  {
    id: 135,
    nameKo: "채키몽",
    nameEn: "Thwackey",
    finalFormKo: "고릴타",
    finalFormEn: "Rillaboom",
    type: ["풀"],
    stats: { hp: 70, attack: 85, defense: 70, spAttack: 55, spDefense: 60, speed: 80 },
    statTotal: 420,
    battleNote: "공격과 스피드가 좋아 중반부터 물리 압박을 거는 역할이 쉽고, 최종진화형 고릴타는 필드전과 화력을 동시에 챙기기 좋다.",
    evolution: { evoLevel: 35, nextEvoId: 136 },
    ability: null,
    appearance: { outer: "transparent", core: "#4BAE4A", bars: ["#8B5A2B", "#D7B98F"] },
    moves: [
      {
        nameKo: "메가드레인",
        nameEn: "Mega Drain",
        power: 40,
        accuracy: 100,
        type: "풀",
        category: "특수",
        pp: 15,
        description: "상대의 생명력을 빨아들여 공격한다. (A nutrient-draining attack that recovers HP.)",
        logicExplanation: "설명: 공격으로 준 피해의 절반만큼 체력을 회복한다.\\n공식: damage = calculateDamage(...); heal = floor(damage / 2); user.hp = min(user.maxHP, user.hp + heal)\\n규칙: 피해량 기준으로 회복한다, 흡수 불가 상태나 체력 만땅일 때는 회복량이 제한된다"
      },
      {
        nameKo: "울음소리",
        nameEn: "Growl",
        power: null,
        accuracy: 100,
        type: "노말",
        category: "변화",
        pp: 40,
        description: "울음소리로 상대의 공격을 낮춘다. (The user growls to lower the target's Attack.)",
        logicExplanation: "설명: 상대의 공격을 1랭크 낮춘다.\\n공식: target.stages.attack -= 1\\n규칙: 랭크 하한은 게임 규칙에 따라 제한한다"
      },
      {
        nameKo: "씨뿌리기",
        nameEn: "Leech Seed",
        power: null,
        accuracy: 90,
        type: "풀",
        category: "변화",
        pp: 10,
        description: "씨앗을 심어 매 턴 체력을 빼앗는다. (Plants a seed that drains HP each turn.)",
        logicExplanation: "설명: 상대에게 씨앗을 심어 매 턴 체력을 흡수한다.\\n공식: target.statusEffects.leechSeed = true; endTurnDrain = floor(target.maxHP / 8); target.hp -= endTurnDrain; user.hp = min(user.maxHP, user.hp + endTurnDrain)\\n규칙: 풀 타입은 씨뿌리기 면역, 교체 후에도 효과는 유지, 매 턴 종료 시 자동으로 피해를 준다"
      }
    ]
  },
  {
    id: 136,
    nameKo: "고릴타",
    nameEn: "Rillaboom",
    finalFormKo: "고릴타",
    finalFormEn: "Rillaboom",
    type: ["풀"],
    stats: { hp: 100, attack: 125, defense: 90, spAttack: 60, spDefense: 70, speed: 85 },
    statTotal: 530,
    battleNote: "공격력이 높고 벌크도 괜찮아 정면 물리전에 강하며, 벌크업과 회복기, 강한 풀 기술을 섞는 물리 어태커로 쓰기 좋다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: null,
    appearance: { outer: "transparent", core: "#409E47", bars: ["#8B5A2B", "#D8C29B"] },
    moves: [
      {
        nameKo: "우드해머",
        nameEn: "Wood Hammer",
        power: 120,
        accuracy: 100,
        type: "풀",
        category: "물리",
        pp: 15,
        description: "나무 망치처럼 몸을 던져 공격한다. (The user slams the target with its body like a wooden hammer.)"
      },
      {
        nameKo: "벌크업",
        nameEn: "Bulk Up",
        power: null,
        accuracy: null,
        type: "격투",
        category: "변화",
        pp: 20,
        description: "근육을 단련해 공격과 방어를 올린다. (The user bulks up to raise Attack and Defense.)",
        logicExplanation: "설명: 사용자의 공격과 방어를 각각 1랭크 올린다.\\n공식: user.stages.attack += 1; user.stages.defense += 1\\n규칙: 중첩 사용 가능, 랭크 상한은 게임 규칙에 따라 제한한다"
      },
      {
        nameKo: "씨뿌리기",
        nameEn: "Leech Seed",
        power: null,
        accuracy: 90,
        type: "풀",
        category: "변화",
        pp: 10,
        description: "씨앗을 심어 매 턴 체력을 빼앗는다. (Plants a seed that drains HP each turn.)",
        logicExplanation: "설명: 상대에게 씨앗을 심어 매 턴 체력을 흡수한다.\\n공식: target.statusEffects.leechSeed = true; endTurnDrain = floor(target.maxHP / 8); target.hp -= endTurnDrain; user.hp = min(user.maxHP, user.hp + endTurnDrain)\\n규칙: 풀 타입은 씨뿌리기 면역, 교체 후에도 효과는 유지, 매 턴 종료 시 자동으로 피해를 준다"
      }
    ]
  }
  ,
  {
    id: 137,
    nameKo: "라프라스",
    nameEn: "Lapras",
    finalFormKo: "라프라스",
    finalFormEn: "Lapras",
    type: ["물", "얼음"],
    stats: { hp: 130, attack: 85, defense: 80, spAttack: 85, spDefense: 95, speed: 60 },
    statTotal: 535,
    battleNote: "높은 체력과 준수한 특수 내구를 바탕으로 오래 버티며 물/얼음 기술로 넓게 압박할 수 있는 탱커형 포켓몬이다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: null,
    appearance: { outer: "transparent", core: "#5FADE2", bars: ["#E8F6FF", "#7A5AC8"] },
    moves: [
      {
        nameKo: "파도타기",
        nameEn: "Surf",
        power: 90,
        accuracy: 100,
        type: "물",
        category: "특수",
        pp: 15,
        description: "큰 파도를 일으켜 상대를 공격한다. (It swamps the area around the user with a giant wave.)"
      },
      {
        nameKo: "냉동빔",
        nameEn: "Ice Beam",
        power: 90,
        accuracy: 100,
        type: "얼음",
        category: "특수",
        pp: 10,
        description: "차가운 빔을 발사해 공격한다. 얼게 만들 때가 있다. (The target is struck with an icy-cold beam of energy.)"
      },
      {
        nameKo: "10만볼트",
        nameEn: "Thunderbolt",
        power: 90,
        accuracy: 100,
        type: "전기",
        category: "특수",
        pp: 15,
        description: "강한 전격으로 상대를 공격한다. 마비시킬 때가 있다. (A strong electric blast crashes down on the target.)"
      }
    ]
  },
  {
    id: 138,
    nameKo: "핫삼",
    nameEn: "Scizor",
    finalFormKo: "핫삼",
    finalFormEn: "Scizor",
    type: ["벌레", "강철"],
    stats: { hp: 70, attack: 130, defense: 100, spAttack: 55, spDefense: 80, speed: 65 },
    statTotal: 500,
    battleNote: "강한 공격과 우수한 타입 저항을 바탕으로 정면 교환에 강하며, 선공기와 벌레/강철 자속기로 압박하는 물리 어태커다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: null,
    appearance: { outer: "transparent", core: "#D74646", bars: ["#F3F3F3", "#4A4A4A"] },
    moves: [
      {
        nameKo: "시저크로스",
        nameEn: "X-Scissor",
        power: 80,
        accuracy: 100,
        type: "벌레",
        category: "물리",
        pp: 15,
        description: "낫처럼 날카로운 팔로 베어 공격한다. (The user slashes at the foe by crossing its scythes.)"
      },
      {
        nameKo: "아이언헤드",
        nameEn: "Iron Head",
        power: 80,
        accuracy: 100,
        type: "강철",
        category: "물리",
        pp: 15,
        description: "강철처럼 단단한 머리로 들이받는다. 풀죽게 만들 때가 있다. (The foe slams the target with its steel-hard head.)"
      },
      {
        nameKo: "전광석화",
        nameEn: "Quick Attack",
        power: 40,
        accuracy: 100,
        type: "노말",
        category: "물리",
        pp: 30,
        description: "상대보다 먼저 공격한다. (An almost invisibly fast attack that is certain to strike first.)"
      }
    ]
  },
  {
    id: 139,
    nameKo: "헤라크로스",
    nameEn: "Heracross",
    finalFormKo: "헤라크로스",
    finalFormEn: "Heracross",
    type: ["벌레", "격투"],
    stats: { hp: 80, attack: 125, defense: 75, spAttack: 40, spDefense: 95, speed: 85 },
    statTotal: 500,
    battleNote: "공격력이 매우 높고 자속 격투/벌레 기술의 파괴력이 뛰어나며, 한 번 기회를 잡으면 강하게 밀어붙일 수 있는 물리 브레이커다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: null,
    appearance: { outer: "transparent", core: "#3556C8", bars: ["#F2E6A3", "#7B3F00"] },
    moves: [
      {
        nameKo: "메가혼",
        nameEn: "Megahorn",
        power: 120,
        accuracy: 85,
        type: "벌레",
        category: "물리",
        pp: 10,
        description: "큰 뿔을 내밀어 강하게 찌른다. (Using its tough and impressive horn, the user rams into the target.)"
      },
      {
        nameKo: "인파이트",
        nameEn: "Close Combat",
        power: 120,
        accuracy: 100,
        type: "격투",
        category: "물리",
        pp: 5,
        description: "방어를 버리고 격렬하게 공격한다. 사용 후 방어와 특수방어가 떨어진다. (The user fights the target up close without guarding itself.)"
      },
      {
        nameKo: "스톤에지",
        nameEn: "Stone Edge",
        power: 100,
        accuracy: 80,
        type: "바위",
        category: "물리",
        pp: 5,
        description: "날카로운 바위 기둥으로 찔러 공격한다. 급소에 맞기 쉽다. (The user stabs the foe with sharpened stones from below.)"
      }
    ]
  }
,
  {
    id: 140,
    nameKo: "미뇽",
    nameEn: "Dratini",
    finalFormKo: "망나뇽",
    finalFormEn: "Dragonite",
    type: ["드래곤"],
    stats: { hp: 41, attack: 64, defense: 45, spAttack: 50, spDefense: 50, speed: 50 },
    statTotal: 300,
    battleNote: "성장 잠재력이 큰 순수 드래곤 미진화체로, 무난한 기술 구성과 안정적인 육성을 통해 최종진화형 망나뇽으로 이어진다.",
    evolution: { evoLevel: 30, nextEvoId: 141 },
    ability: null,
    appearance: { outer: "transparent", core: "#6C8BEA", bars: ["#F7F1C8", "#FFFFFF"] },
    moves: [
      {
        nameKo: "용의숨결",
        nameEn: "Dragon Breath",
        power: 60,
        accuracy: 100,
        type: "드래곤",
        category: "특수",
        pp: 20,
        description: "강한 숨결을 내뿜어 공격한다. 마비시킬 때가 있다. (The user exhales a mighty gust that may paralyze the target.)"
      },
      {
        nameKo: "아쿠아테일",
        nameEn: "Aqua Tail",
        power: 90,
        accuracy: 90,
        type: "물",
        category: "물리",
        pp: 10,
        description: "거대한 꼬리를 휘둘러 상대를 쳐낸다. (The user attacks by swinging its tail as if it were a vicious wave.)"
      },
      {
        nameKo: "전광석화",
        nameEn: "Quick Attack",
        power: 40,
        accuracy: 100,
        type: "노말",
        category: "물리",
        pp: 30,
        description: "상대보다 먼저 공격한다. (An almost invisibly fast attack that is certain to strike first.)"
      }
    ]
  },
  {
    id: 141,
    nameKo: "신뇽",
    nameEn: "Dragonair",
    finalFormKo: "망나뇽",
    finalFormEn: "Dragonite",
    type: ["드래곤"],
    stats: { hp: 61, attack: 84, defense: 65, spAttack: 70, spDefense: 70, speed: 70 },
    statTotal: 420,
    battleNote: "스피드와 화력이 함께 올라가는 중간 진화형 드래곤으로, 안정적인 자속기와 보조기로 후반 성장 폭이 크다.",
    evolution: { evoLevel: 55, nextEvoId: 142 },
    ability: null,
    appearance: { outer: "transparent", core: "#5C73D7", bars: ["#EFE3A6", "#FFFFFF"] },
    moves: [
      {
        nameKo: "용의숨결",
        nameEn: "Dragon Breath",
        power: 60,
        accuracy: 100,
        type: "드래곤",
        category: "특수",
        pp: 20,
        description: "강한 숨결을 내뿜어 공격한다. 마비시킬 때가 있다. (The user exhales a mighty gust that may paralyze the target.)"
      },
      {
        nameKo: "아쿠아테일",
        nameEn: "Aqua Tail",
        power: 90,
        accuracy: 90,
        type: "물",
        category: "물리",
        pp: 10,
        description: "거대한 꼬리를 휘둘러 상대를 쳐낸다. (The user attacks by swinging its tail as if it were a vicious wave.)"
      },
      {
        nameKo: "고속이동",
        nameEn: "Agility",
        power: null,
        accuracy: null,
        type: "에스퍼",
        category: "변화",
        pp: 30,
        description: "몸놀림을 극도로 높여 스피드를 크게 올린다. (The user relaxes and lightens its body to sharply boost its Speed.)",
        logicExplanation: "설명: 사용자의 스피드를 크게 올린다.\\n공식: user.stages.speed += 2\\n규칙: 중첩 사용 가능, 랭크 상한은 게임 규칙에 따라 제한한다"
      }
    ]
  },
  {
    id: 142,
    nameKo: "망나뇽",
    nameEn: "Dragonite",
    finalFormKo: "망나뇽",
    finalFormEn: "Dragonite",
    type: ["드래곤", "비행"],
    stats: { hp: 91, attack: 134, defense: 95, spAttack: 100, spDefense: 100, speed: 80 },
    statTotal: 600,
    battleNote: "높은 공격력과 준수한 내구를 함께 갖춘 드래곤 에이스로, 용의춤 이후 강한 자속기와 선공기로 전장을 정리하기 좋다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: null,
    appearance: { outer: "transparent", core: "#D9A24D", bars: ["#EFE3A6", "#3A5CCB"] },
    mediaNameKo: "망나뇽",
    moves: [
      {
        nameKo: "역린",
        nameEn: "Outrage",
        power: 120,
        accuracy: 100,
        type: "드래곤",
        category: "물리",
        pp: 10,
        description: "격렬하게 난폭한 힘을 쏟아낸다. (The user rampages and attacks for several turns.)"
      },
      {
        nameKo: "용의춤",
        nameEn: "Dragon Dance",
        power: null,
        accuracy: null,
        type: "드래곤",
        category: "변화",
        pp: 20,
        description: "공격과 스피드를 동시에 끌어올린다. (A mystic dance that boosts Attack and Speed.)",
        logicExplanation: "설명: 사용자의 공격과 스피드를 각각 올린다.\\n공식: user.stages.attack += 1; user.stages.speed += 1\\n규칙: 중첩 사용 가능, 랭크 상한은 게임 규칙에 따라 제한한다"
      },
      {
        nameKo: "신속",
        nameEn: "Extreme Speed",
        power: 80,
        accuracy: 100,
        type: "노말",
        category: "물리",
        pp: 5,
        description: "눈으로 좇기 어려운 속도로 먼저 공격한다. (The user charges the target at blinding speed.)"
      }
    ]
  }


,
  {
    id: 155,
    nameKo: "델빌",
    nameEn: "Houndour",
    finalFormKo: "헬가",
    finalFormEn: "Houndoom",
    type: ["악", "불꽃"],
    stats: { hp: 45, attack: 60, defense: 30, spAttack: 80, spDefense: 50, speed: 65 },
    statTotal: 330,
    battleNote: "악/불꽃 복합의 초반 특수 어태커로, 화력과 속도를 살려 교체 압박과 마무리에 강하다.",
    evolution: { evoLevel: 24, nextEvoId: 156 },
    ability: null,
    appearance: { outer: "transparent", core: "#3d2a2a", bars: ["#f08c33", "#c0392b"] },
    moves: [
      { nameKo: "불꽃세례", nameEn: "Ember", power: 40, accuracy: 100, type: "불꽃", category: "특수", pp: 25, description: "작은 불꽃을 날려 공격한다. (The target is attacked with small flames.)" },
      { nameKo: "깨물어부수기", nameEn: "Bite", power: 60, accuracy: 100, type: "악", category: "물리", pp: 25, description: "날카로운 이빨로 상대를 물어뜯는다. (The target is bitten with viciously sharp fangs.)" },
      { nameKo: "째려보기", nameEn: "Leer", power: null, accuracy: 100, type: "노말", category: "변화", pp: 30, description: "날카롭게 노려 상대의 방어를 떨어뜨린다. (The user gives opposing Pokémon an intimidating leer that lowers Defense.)", logicExplanation: "설명: 상대의 방어를 1랭크 낮춘다.\\n공식: target.stages.defense -= 1" }
    ]
  },
  {
    id: 156,
    nameKo: "헬가",
    nameEn: "Houndoom",
    finalFormKo: "헬가",
    finalFormEn: "Houndoom",
    type: ["악", "불꽃"],
    stats: { hp: 75, attack: 90, defense: 50, spAttack: 110, spDefense: 80, speed: 95 },
    statTotal: 500,
    battleNote: "특수공격과 스피드가 좋아 선공 압박에 특화된 악/불꽃 특수 어태커다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: null,
    appearance: { outer: "transparent", core: "#3b2525", bars: ["#f39c12", "#c0392b"] },
    moves: [
      { nameKo: "화염방사", nameEn: "Flamethrower", power: 90, accuracy: 100, type: "불꽃", category: "특수", pp: 15, description: "강한 불꽃을 발사해 공격한다. (The target is scorched with an intense blast of fire.)" },
      { nameKo: "악의파동", nameEn: "Dark Pulse", power: 80, accuracy: 100, type: "악", category: "특수", pp: 15, description: "어둠의 파동으로 상대를 덮친다. (The user releases a horrible aura imbued with dark thoughts.)" },
      { nameKo: "나쁜음모", nameEn: "Nasty Plot", power: null, accuracy: null, type: "악", category: "변화", pp: 20, description: "나쁜 꿍꿍이를 꾸며 특수공격을 크게 올린다. (The user stimulates its brain by thinking bad thoughts. It sharply raises Sp. Atk.)", logicExplanation: "설명: 사용자의 특수공격을 2랭크 올린다.\\n공식: user.stages.spAttack += 2" }
    ]
  },
  {
    id: 157,
    nameKo: "깜눈크",
    nameEn: "Sandile",
    finalFormKo: "악비아르",
    finalFormEn: "Krookodile",
    type: ["땅", "악"],
    stats: { hp: 50, attack: 72, defense: 35, spAttack: 35, spDefense: 35, speed: 65 },
    statTotal: 292,
    battleNote: "초반부터 공격과 속도가 괜찮아 기습적인 물리 압박을 넣기 좋은 땅/악 미진화체다.",
    evolution: { evoLevel: 29, nextEvoId: 158 },
    ability: null,
    appearance: { outer: "transparent", core: "#8e6b3a", bars: ["#3d2a1f", "#c8b273"] },
    moves: [
      { nameKo: "모래뿌리기", nameEn: "Sand Attack", power: null, accuracy: 100, type: "땅", category: "변화", pp: 15, description: "모래를 뿌려 상대의 명중을 떨어뜨린다. (Sand is hurled in the target's face, reducing its accuracy.)", logicExplanation: "설명: 상대의 명중을 1랭크 낮춘다.\\n공식: target.stages.accuracy -= 1" },
      { nameKo: "깨물어부수기", nameEn: "Bite", power: 60, accuracy: 100, type: "악", category: "물리", pp: 25, description: "날카로운 이빨로 상대를 물어뜯는다. (The target is bitten with viciously sharp fangs.)" },
      { nameKo: "구멍파기", nameEn: "Dig", power: 80, accuracy: 100, type: "땅", category: "물리", pp: 10, description: "땅속에 파고든 뒤 다음 순간 공격한다. (The user burrows, then attacks on the next turn.)" }
    ]
  },
  {
    id: 158,
    nameKo: "악비르",
    nameEn: "Krokorok",
    finalFormKo: "악비아르",
    finalFormEn: "Krookodile",
    type: ["땅", "악"],
    stats: { hp: 60, attack: 82, defense: 45, spAttack: 45, spDefense: 45, speed: 74 },
    statTotal: 351,
    battleNote: "중간 진화형이지만 공격과 스피드가 괜찮아 스위치 인 압박과 마무리에 유용하다.",
    evolution: { evoLevel: 40, nextEvoId: 159 },
    ability: null,
    appearance: { outer: "transparent", core: "#8a6535", bars: ["#2f2418", "#d0bb84"] },
    moves: [
      { nameKo: "깨물어부수기", nameEn: "Crunch", power: 80, accuracy: 100, type: "악", category: "물리", pp: 15, description: "강하게 물어 방어를 떨어뜨릴 때가 있다. (The user crunches up the target with sharp fangs.)" },
      { nameKo: "땅고르기", nameEn: "Bulldoze", power: 60, accuracy: 100, type: "땅", category: "물리", pp: 20, description: "지면을 흔들어 상대의 스피드를 떨어뜨린다. (The user strikes everything around it by stomping down on the ground.)" },
      { nameKo: "짓밟기", nameEn: "Torment", power: null, accuracy: 100, type: "악", category: "변화", pp: 15, description: "상대를 괴롭혀 같은 기술을 연속으로 못 쓰게 한다. (The user torments and enrages the target.)" }
    ]
  },
  {
    id: 159,
    nameKo: "악비아르",
    nameEn: "Krookodile",
    finalFormKo: "악비아르",
    finalFormEn: "Krookodile",
    type: ["땅", "악"],
    stats: { hp: 95, attack: 117, defense: 80, spAttack: 65, spDefense: 70, speed: 92 },
    statTotal: 519,
    battleNote: "강한 물리 공격과 좋은 스피드로 압박하는 땅/악 브레이커다. 자속 지진과 악 타입 기술의 범용성이 높다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: null,
    appearance: { outer: "transparent", core: "#7d5e31", bars: ["#21170f", "#d6c184"] },
    moves: [
      { nameKo: "지진", nameEn: "Earthquake", power: 100, accuracy: 100, type: "땅", category: "물리", pp: 10, description: "지면을 크게 흔들어 공격한다. (A powerful quake strikes nearby Pokémon.)" },
      { nameKo: "깨물어부수기", nameEn: "Crunch", power: 80, accuracy: 100, type: "악", category: "물리", pp: 15, description: "강하게 물어 방어를 떨어뜨릴 때가 있다. (The user crunches up the target with sharp fangs.)" },
      { nameKo: "스톤에지", nameEn: "Stone Edge", power: 100, accuracy: 80, type: "바위", category: "물리", pp: 5, description: "날카로운 바위 기둥으로 찔러 공격한다. 급소에 맞기 쉽다. (The user stabs the foe with sharpened stones from below.)" }
    ]
  },
  {
    id: 160,
    nameKo: "갸라도스",
    nameEn: "Gyarados",
    finalFormKo: "갸라도스",
    finalFormEn: "Gyarados",
    type: ["물", "비행"],
    stats: { hp: 95, attack: 125, defense: 79, spAttack: 60, spDefense: 100, speed: 81 },
    statTotal: 540,
    battleNote: "강한 물리 공격과 준수한 내구를 바탕으로 압박하는 물/비행 브루저다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: null,
    appearance: { outer: "transparent", core: "#2e6aa6", bars: ["#7ec8ff", "#163b66"] },
    moves: [
      { nameKo: "아쿠아테일", nameEn: "Aqua Tail", power: 90, accuracy: 90, type: "물", category: "물리", pp: 10, description: "거대한 꼬리로 휘둘러 공격한다. (The user attacks by swinging its tail as if it were a vicious wave.)" },
      { nameKo: "깨물어부수기", nameEn: "Crunch", power: 80, accuracy: 100, type: "악", category: "물리", pp: 15, description: "날카로운 이빨로 상대를 강하게 문다. (The user crunches up the target with sharp fangs.)" },
      { nameKo: "용의춤", nameEn: "Dragon Dance", power: null, accuracy: null, type: "드래곤", category: "변화", pp: 20, description: "신비한 춤으로 공격과 스피드를 올린다. (The user vigorously performs a mystic, powerful dance.)", logicExplanation: "설명: 사용자의 공격과 스피드를 1랭크 올린다.\\n공식: user.stages.attack += 1; user.stages.speed += 1" }
    ]
  },

  {
    id: 161,
    nameKo: "모부기",
    nameEn: "Turtwig",
    finalFormKo: "토대부기",
    finalFormEn: "Torterra",
    type: ["풀"],
    stats: { hp: 55, attack: 68, defense: 64, spAttack: 45, spDefense: 55, speed: 31 },
    statTotal: 318,
    battleNote: "토대부기: 높은 물리 내구와 지진, 우드해머로 압박하는 느린 탱커형 스타팅이다. 랭크업이나 교체전에서 묵직하게 굴리기 좋다.",
    evolution: { evoLevel: 16, nextEvoId: 162 },
    ability: "심록",
    appearance: { outer: "transparent", core: "#69A33D", bars: ["#8B5A2B", "#D9C25F"] },
    moves: [
      { nameKo: "몸통박치기", nameEn: "Tackle", power: 40, accuracy: 100, type: "노말", category: "물리", pp: 35, description: "몸 전체를 부딪쳐 공격한다. (A physical attack in which the user charges and slams into the target with its whole body.)" },
      { nameKo: "흡수", nameEn: "Absorb", power: 20, accuracy: 100, type: "풀", category: "특수", pp: 25, description: "양분을 흡수해 체력을 회복한다. (A nutrient-draining attack. The user's HP is restored by half the damage taken by the target.)", logicExplanation: "설명: 준 피해의 절반만큼 HP를 회복한다.\\n공식: heal = floor(damageDealt / 2)" },
      { nameKo: "껍질에숨기", nameEn: "Withdraw", power: null, accuracy: null, type: "물", category: "변화", pp: 40, description: "껍질 속에 숨어 방어를 올린다. (The user withdraws its body into its hard shell, raising its Defense stat.)", logicExplanation: "설명: 사용자의 방어를 1랭크 올린다.\\n공식: user.stages.defense += 1" }
    ]
  },
  {
    id: 162,
    nameKo: "수풀부기",
    nameEn: "Grotle",
    finalFormKo: "토대부기",
    finalFormEn: "Torterra",
    type: ["풀"],
    stats: { hp: 75, attack: 89, defense: 85, spAttack: 55, spDefense: 65, speed: 36 },
    statTotal: 405,
    battleNote: "토대부기: 높은 물리 내구와 지진, 우드해머로 압박하는 느린 탱커형 스타팅이다.",
    evolution: { evoLevel: 36, nextEvoId: 163 },
    ability: "심록",
    appearance: { outer: "transparent", core: "#547F36", bars: ["#C0A24B", "#8B5A2B"] },
    moves: [
      { nameKo: "씨폭탄", nameEn: "Seed Bomb", power: 80, accuracy: 100, type: "풀", category: "물리", pp: 15, description: "딱딱한 씨앗을 발사해 공격한다. (The user slams a barrage of hard-shelled seeds down on the target from above.)" },
      { nameKo: "저주", nameEn: "Curse", power: null, accuracy: null, type: "고스트", category: "변화", pp: 10, description: "스피드를 내리고 공격과 방어를 올린다. (A move that works differently for the Ghost type than for all other types.)" },
      { nameKo: "메가드레인", nameEn: "Mega Drain", power: 40, accuracy: 100, type: "풀", category: "특수", pp: 15, description: "양분을 흡수해 체력을 회복한다. (A nutrient-draining attack. The user's HP is restored by half the damage taken by the target.)" }
    ]
  },
  {
    id: 163,
    nameKo: "토대부기",
    nameEn: "Torterra",
    finalFormKo: "토대부기",
    finalFormEn: "Torterra",
    type: ["풀", "땅"],
    stats: { hp: 95, attack: 109, defense: 105, spAttack: 75, spDefense: 85, speed: 56 },
    statTotal: 525,
    battleNote: "토대부기: 높은 물리 내구와 지진, 우드해머로 압박하는 느린 탱커형 스타팅이다. 껍질갑옷 숨겨진 특성으로 급소 변수도 줄일 수 있다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: "심록",
    hiddenAbility: "껍질갑옷",
    appearance: { outer: "transparent", core: "#4B7B34", bars: ["#8B5A2B", "#C6B468"] },
    moves: [
      { nameKo: "지진", nameEn: "Earthquake", power: 100, accuracy: 100, type: "땅", category: "물리", pp: 10, description: "지면을 뒤흔들어 주위에 있는 상대를 공격한다. (The user sets off an earthquake that strikes every Pokémon around it.)" },
      { nameKo: "우드해머", nameEn: "Wood Hammer", power: 120, accuracy: 100, type: "풀", category: "물리", pp: 15, description: "몸을 세게 부딪쳐 공격하고 반동을 받는다. (The user slams its rugged body into the target to attack. The user also sustains serious damage.)", logicExplanation: "설명: 큰 위력의 물리 공격 후 준 피해의 1/4만큼 반동을 받는다.\\n공식: recoil = floor(damageDealt / 4)" },
      { nameKo: "광합성", nameEn: "Synthesis", power: null, accuracy: null, type: "풀", category: "변화", pp: 5, description: "햇빛을 흡수해 체력을 회복한다. (The user restores its own HP. The amount of HP regained varies with the weather.)" }
    ]
  },
  {
    id: 164,
    nameKo: "불꽃숭이",
    nameEn: "Chimchar",
    finalFormKo: "초염몽",
    finalFormEn: "Infernape",
    type: ["불꽃"],
    stats: { hp: 44, attack: 58, defense: 44, spAttack: 58, spDefense: 44, speed: 61 },
    statTotal: 309,
    battleNote: "초염몽: 빠른 스피드와 양쪽 공격 수치를 활용하는 공격형 스타팅이다. 초반부터 선공 압박이 좋다.",
    evolution: { evoLevel: 16, nextEvoId: 165 },
    ability: "맹화",
    appearance: { outer: "transparent", core: "#f28c28", bars: ["#f6e27d", "#8b3a1d"] },
    moves: [
      { nameKo: "할퀴기", nameEn: "Scratch", power: 40, accuracy: 100, type: "노말", category: "물리", pp: 35, description: "날카로운 발톱으로 할퀴어 공격한다. (Hard, pointed, sharp claws rake the target.)" },
      { nameKo: "불꽃세례", nameEn: "Ember", power: 40, accuracy: 100, type: "불꽃", category: "특수", pp: 25, description: "작은 불꽃을 날려 공격한다. (The target is attacked with small flames.)" },
      { nameKo: "엉덩이로받기", nameEn: "Taunt", power: null, accuracy: 100, type: "악", category: "변화", pp: 20, description: "상대를 도발해 변화기를 쓰지 못하게 한다. (The target is taunted into a rage.)" }
    ]
  },
  {
    id: 165,
    nameKo: "파이숭이",
    nameEn: "Monferno",
    finalFormKo: "초염몽",
    finalFormEn: "Infernape",
    type: ["불꽃", "격투"],
    stats: { hp: 64, attack: 78, defense: 52, spAttack: 78, spDefense: 52, speed: 81 },
    statTotal: 405,
    battleNote: "초염몽: 빠른 스피드와 양면 화력으로 지속적인 압박이 가능한 중간 진화형이다.",
    evolution: { evoLevel: 36, nextEvoId: 166 },
    ability: "맹화",
    appearance: { outer: "transparent", core: "#ec7f24", bars: ["#f8da6b", "#8a3420"] },
    moves: [
      { nameKo: "마하펀치", nameEn: "Mach Punch", power: 40, accuracy: 100, type: "격투", category: "물리", pp: 30, description: "순식간에 주먹을 내질러 선공한다. (The user throws a punch at blinding speed. This move always goes first.)" },
      { nameKo: "화염자동차", nameEn: "Flame Charge", power: 50, accuracy: 100, type: "불꽃", category: "물리", pp: 20, description: "몸을 불태우며 돌진하고 스피드를 올린다. (Cloaks the user in flame and charges, raising Speed.)" },
      { nameKo: "풀묶기", nameEn: "Grass Knot", power: 60, accuracy: 100, type: "풀", category: "특수", pp: 20, description: "풀로 상대를 얽어 넘어뜨린다. (The user snares the target with grass and trips it.)" }
    ]
  },
  {
    id: 166,
    nameKo: "초염몽",
    nameEn: "Infernape",
    finalFormKo: "초염몽",
    finalFormEn: "Infernape",
    type: ["불꽃", "격투"],
    stats: { hp: 76, attack: 104, defense: 71, spAttack: 104, spDefense: 71, speed: 108 },
    statTotal: 534,
    battleNote: "높은 스피드와 양면 공격이 모두 좋아 상황에 맞춰 휘두르기 좋은 화염/격투 에이스다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: "맹화",
    hiddenAbility: "철주먹",
    appearance: { outer: "transparent", core: "#e56f1f", bars: ["#f4d04e", "#7e2d20"] },
    moves: [
      { nameKo: "플레어드라이브", nameEn: "Flare Blitz", power: 120, accuracy: 100, type: "불꽃", category: "물리", pp: 15, description: "몸 전체를 불꽃으로 두르고 돌진한다. (The user cloaks itself in fire and charges at the target.)" },
      { nameKo: "인파이트", nameEn: "Close Combat", power: 120, accuracy: 100, type: "격투", category: "물리", pp: 5, description: "방어를 버리고 격렬하게 공격한다. (The user fights the target up close without guarding itself.)" },
      { nameKo: "진공파", nameEn: "Vacuum Wave", power: 40, accuracy: 100, type: "격투", category: "특수", pp: 30, description: "진공의 파동을 날려 상대보다 먼저 공격한다. (The user whirls its fists to send a wave of pure vacuum at the target. This move always goes first.)" }
    ]
  },
  {
    id: 167,
    nameKo: "리오르",
    nameEn: "Riolu",
    finalFormKo: "루카리오",
    finalFormEn: "Lucario",
    type: ["격투"],
    stats: { hp: 40, attack: 70, defense: 40, spAttack: 35, spDefense: 40, speed: 60 },
    statTotal: 285,
    battleNote: "초반부터 공격과 스피드가 괜찮은 격투 타입으로, 레벨이 오르면 루카리오로 진화해 폭넓은 압박이 가능하다.",
    evolution: { evoLevel: 16, nextEvoId: 80 },
    ability: "불굴의마음",
    appearance: { outer: "transparent", core: "#3E6BA8", bars: ["#0E2238", "#F7E4A3"] },
    moves: [
      { nameKo: "전광석화", nameEn: "Quick Attack", power: 40, accuracy: 100, type: "노말", category: "물리", pp: 30, description: "재빠르게 돌진해 선공한다. (An almost invisibly fast attack that is certain to strike first.)" },
      { nameKo: "바위깨기", nameEn: "Rock Smash", power: 40, accuracy: 100, type: "격투", category: "물리", pp: 15, description: "주먹으로 바위를 부수듯 공격한다. (The user attacks with a punch that may lower Defense.)", logicExplanation: "설명: 50% 확률로 상대의 방어를 1랭크 낮춘다.\\n공식: if random(100) < 50: target.stages.defense -= 1" },
      { nameKo: "발경", nameEn: "Force Palm", power: 60, accuracy: 100, type: "격투", category: "물리", pp: 10, description: "기운을 담은 손바닥 공격으로 마비시킬 때가 있다. (The user attacks with a shock wave from its palm. This may also leave the target with paralysis.)", logicExplanation: "설명: 30% 확률로 대상을 마비시킨다.\\n공식: if random(100) < 30: target.status = 'paralysis'" }
    ]
  },
  {
    id: 168,
    nameKo: "알통몬",
    nameEn: "Machop",
    finalFormKo: "괴력몬",
    finalFormEn: "Machamp",
    type: ["격투"],
    stats: { hp: 70, attack: 80, defense: 50, spAttack: 35, spDefense: 35, speed: 35 },
    statTotal: 305,
    battleNote: "단순하지만 강한 물리 화력으로 초반부터 압박하기 좋은 격투 포켓몬이다.",
    evolution: { evoLevel: 16, nextEvoId: 169 },
    ability: "근성",
    appearance: { outer: "transparent", core: "#8F9AA5", bars: ["#B9D0DF", "#6D7680"] },
    moves: [
      { nameKo: "안다리걸기", nameEn: "Low Kick", power: 60, accuracy: 100, type: "격투", category: "물리", pp: 20, description: "낮게 파고들어 발을 걸어 공격한다. (A powerful low kick that makes the target fall over.)" },
      { nameKo: "바위깨기", nameEn: "Rock Smash", power: 40, accuracy: 100, type: "격투", category: "물리", pp: 15, description: "주먹으로 바위를 부수듯 공격한다. (The user attacks with a punch that may lower Defense.)", logicExplanation: "설명: 50% 확률로 상대의 방어를 1랭크 낮춘다.\\n공식: if random(100) < 50: target.stages.defense -= 1" },
      { nameKo: "기합모으기", nameEn: "Focus Energy", power: null, accuracy: null, type: "노말", category: "변화", pp: 30, description: "기합을 모아 급소를 노리기 쉽게 한다. (The user takes a deep breath and focuses so that critical hits land more easily.)", logicExplanation: "설명: 사용자의 급소율을 한 단계 높인다.\\n공식: user.volatile.focusEnergy = true" }
    ]
  },
  {
    id: 169,
    nameKo: "근육몬",
    nameEn: "Machoke",
    finalFormKo: "괴력몬",
    finalFormEn: "Machamp",
    type: ["격투"],
    stats: { hp: 80, attack: 100, defense: 70, spAttack: 50, spDefense: 60, speed: 45 },
    statTotal: 405,
    battleNote: "버티면서 벌크업과 강한 격투 기술을 섞기 좋은 중간 진화형이다.",
    evolution: { evoLevel: 36, nextEvoId: 170 },
    ability: "근성",
    appearance: { outer: "transparent", core: "#7C8B98", bars: ["#BCCAD7", "#646E76"] },
    moves: [
      { nameKo: "벌크업", nameEn: "Bulk Up", power: null, accuracy: null, type: "격투", category: "변화", pp: 20, description: "근육을 단련해 공격과 방어를 올린다. (The user bulks up to raise Attack and Defense.)", logicExplanation: "설명: 사용자의 공격과 방어를 각각 1랭크 올린다.\\n공식: user.stages.attack += 1; user.stages.defense += 1" },
      { nameKo: "깨트리기", nameEn: "Brick Break", power: 75, accuracy: 100, type: "격투", category: "물리", pp: 15, description: "단단한 벽도 부수는 강한 타격이다. (The user attacks with a swift chop that can break barriers.)" },
      { nameKo: "암석봉인", nameEn: "Rock Tomb", power: 60, accuracy: 95, type: "바위", category: "물리", pp: 15, description: "바위를 굴려 상대의 스피드를 낮춘다. (Boulders are hurled at the target to inflict damage and lower its Speed.)", logicExplanation: "설명: 상대의 스피드를 1랭크 낮춘다.\\n공식: target.stages.speed -= 1" }
    ]
  },
  {
    id: 170,
    nameKo: "괴력몬",
    nameEn: "Machamp",
    finalFormKo: "괴력몬",
    finalFormEn: "Machamp",
    type: ["격투"],
    stats: { hp: 90, attack: 130, defense: 80, spAttack: 65, spDefense: 85, speed: 55 },
    statTotal: 505,
    battleNote: "높은 공격으로 정면전을 밀어붙이는 순수 물리 브레이커다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: "노가드",
    appearance: { outer: "transparent", core: "#708090", bars: ["#C8D4DE", "#44515C"] },
    moves: [
      { nameKo: "인파이트", nameEn: "Close Combat", power: 120, accuracy: 100, type: "격투", category: "물리", pp: 5, description: "방어를 버리고 격렬하게 공격한다. (The user fights the target up close without guarding itself.)" },
      { nameKo: "스톤에지", nameEn: "Stone Edge", power: 100, accuracy: 80, type: "바위", category: "물리", pp: 5, description: "날카로운 바위로 급소를 노린다. (Launches sharp stones aimed at weak points.)" },
      { nameKo: "깜짝베기", nameEn: "Knock Off", power: 65, accuracy: 100, type: "악", category: "물리", pp: 20, description: "강하게 후려쳐 상대를 흔든다. (The user slaps down the target to inflict damage.)" }
    ]
  },
  {
    id: 171,
    nameKo: "스콜피",
    nameEn: "Skorupi",
    finalFormKo: "드래피온",
    finalFormEn: "Drapion",
    type: ["독", "벌레"],
    stats: { hp: 40, attack: 50, defense: 90, spAttack: 30, spDefense: 55, speed: 65 },
    statTotal: 330,
    battleNote: "방어가 높아 초반 교란에 좋고, 진화 후에는 공격적인 독/악 탱커로 변한다.",
    evolution: { evoLevel: 36, nextEvoId: 172 },
    ability: "전투무장",
    appearance: { outer: "transparent", core: "#6A3C8B", bars: ["#9A61C3", "#D34EC6"] },
    moves: [
      { nameKo: "독침", nameEn: "Poison Sting", power: 15, accuracy: 100, type: "독", category: "물리", pp: 35, description: "독 바늘로 찔러 공격한다. (The user stabs the target with a poisonous stinger.)", logicExplanation: "설명: 30% 확률로 독 상태로 만든다.\\n공식: if random(100) < 30: target.status = 'poison'" },
      { nameKo: "깨물어부수기", nameEn: "Crunch", power: 80, accuracy: 100, type: "악", category: "물리", pp: 15, description: "날카로운 이빨로 물어부순다. (The user crunches up the target with sharp fangs.)", logicExplanation: "설명: 20% 확률로 상대의 방어를 1랭크 낮춘다.\\n공식: if random(100) < 20: target.stages.defense -= 1" },
      { nameKo: "독압정", nameEn: "Toxic Spikes", power: null, accuracy: null, type: "독", category: "변화", pp: 20, description: "독 압정을 뿌려 교체된 상대를 중독시킨다. (The user lays a trap of poison spikes.)", logicExplanation: "설명: 독압정을 설치해 이후 교체되는 상대를 독 상태로 만든다.\\n공식: target.volatile.toxicSpikes = true" }
    ]
  },
  {
    id: 172,
    nameKo: "드래피온",
    nameEn: "Drapion",
    finalFormKo: "드래피온",
    finalFormEn: "Drapion",
    type: ["독", "악"],
    stats: { hp: 70, attack: 90, defense: 110, spAttack: 60, spDefense: 75, speed: 95 },
    statTotal: 500,
    battleNote: "단단한 몸과 빠른 스피드를 겸비해 독과 악 물리 기술로 압박하기 좋은 포켓몬이다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: "전투무장",
    appearance: { outer: "transparent", core: "#5F2E82", bars: ["#A35CD0", "#E86DDA"] },
    moves: [
      { nameKo: "독찌르기", nameEn: "Poison Jab", power: 80, accuracy: 100, type: "독", category: "물리", pp: 20, description: "독이 스민 팔로 찌른다. (The target is stabbed with a tentacle or arm steeped in poison.)", logicExplanation: "설명: 30% 확률로 독 상태로 만든다.\\n공식: if random(100) < 30: target.status = 'poison'" },
      { nameKo: "깨물어부수기", nameEn: "Crunch", power: 80, accuracy: 100, type: "악", category: "물리", pp: 15, description: "날카로운 이빨로 물어부순다. (The user crunches up the target with sharp fangs.)", logicExplanation: "설명: 20% 확률로 상대의 방어를 1랭크 낮춘다.\\n공식: if random(100) < 20: target.stages.defense -= 1" },
      { nameKo: "지진", nameEn: "Earthquake", power: 100, accuracy: 100, type: "땅", category: "물리", pp: 10, description: "지면을 크게 흔들어 공격한다. (A powerful quake that strikes every Pokémon around it.)" }
    ]
  },
  {
    id: 173,
    nameKo: "망키",
    nameEn: "Mankey",
    finalFormKo: "성원숭",
    finalFormEn: "Primeape",
    type: ["격투"],
    stats: { hp: 40, attack: 80, defense: 35, spAttack: 35, spDefense: 45, speed: 70 },
    statTotal: 305,
    battleNote: "빠르고 공격적인 초반 물리 포켓몬으로, 성원숭으로 진화하면 더욱 난폭한 딜러가 된다.",
    evolution: { evoLevel: 16, nextEvoId: 174 },
    ability: "의기양양",
    appearance: { outer: "transparent", core: "#C49B6E", bars: ["#F2E0C0", "#7A4E2D"] },
    moves: [
      { nameKo: "안다리걸기", nameEn: "Low Kick", power: 60, accuracy: 100, type: "격투", category: "물리", pp: 20, description: "낮게 파고들어 발을 걸어 공격한다. (A powerful low kick that makes the target fall over.)" },
      { nameKo: "할퀴기", nameEn: "Scratch", power: 40, accuracy: 100, type: "노말", category: "물리", pp: 35, description: "날카로운 발톱으로 할퀴어 공격한다. (Hard, pointed, sharp claws rake the target.)" },
      { nameKo: "째려보기", nameEn: "Leer", power: null, accuracy: 100, type: "노말", category: "변화", pp: 30, description: "무서운 눈빛으로 방어를 낮춘다. (The user gives opposing Pokémon an intimidating leer that lowers Defense.)", logicExplanation: "설명: 상대의 방어를 1랭크 낮춘다.\\n공식: target.stages.defense -= 1" }
    ]
  },
  {
    id: 174,
    nameKo: "성원숭",
    nameEn: "Primeape",
    finalFormKo: "성원숭",
    finalFormEn: "Primeape",
    type: ["격투"],
    stats: { hp: 65, attack: 105, defense: 60, spAttack: 60, spDefense: 70, speed: 95 },
    statTotal: 455,
    battleNote: "스피드와 공격이 좋아 연속 압박과 마무리에 특화된 물리 어태커다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: "의기양양",
    appearance: { outer: "transparent", core: "#B7895E", bars: ["#F0DFC8", "#70452A"] },
    moves: [
      { nameKo: "인파이트", nameEn: "Close Combat", power: 120, accuracy: 100, type: "격투", category: "물리", pp: 5, description: "방어를 버리고 격렬하게 공격한다. (The user fights the target up close without guarding itself.)" },
      { nameKo: "유턴", nameEn: "U-turn", power: 70, accuracy: 100, type: "벌레", category: "물리", pp: 20, description: "공격 후 아군과 교대한다. (After making its attack, the user rushes back to switch places with a party Pokémon.)" },
      { nameKo: "스톤에지", nameEn: "Stone Edge", power: 100, accuracy: 80, type: "바위", category: "물리", pp: 5, description: "날카로운 바위로 급소를 노린다. (Launches sharp stones aimed at weak points.)" }
    ]
  },
  {
    id: 175,
    nameKo: "메꾸리",
    nameEn: "Piloswine",
    finalFormKo: "맘모꾸리",
    finalFormEn: "Mamoswine",
    type: ["얼음", "땅"],
    stats: { hp: 100, attack: 100, defense: 80, spAttack: 60, spDefense: 60, speed: 50 },
    statTotal: 450,
    battleNote: "꾸꾸리보다 확실히 단단하고 강한 중간 진화형으로, 이후 맘모꾸리로 이어진다.",
    evolution: { evoLevel: 36, nextEvoId: 82 },
    ability: null,
    appearance: { outer: "transparent", core: "#BFA276", bars: ["#7A5A2A", "#EEE0B7"] },
    moves: [
      { nameKo: "얼음엄니", nameEn: "Ice Fang", power: 65, accuracy: 95, type: "얼음", category: "물리", pp: 15, description: "차가운 이빨로 물어뜯는다. (The target is bitten with cold fangs.)" },
      { nameKo: "땅가르기", nameEn: "Fissure", power: null, accuracy: 30, type: "땅", category: "변화", pp: 5, description: "지면을 갈라 상대를 떨어뜨려 단번에 기절시키려 한다. (An OHKO move that drops the target in a fissure.)", logicRef: "fissure", logicExplanation: "공식: user.level >= target.level 일 때만 명중 판정. 명중률 = 30 + 사용자 레벨 - 대상 레벨 / 규칙: 명중 시 상대 즉사, 비행 타입 또는 땅 기술 무효 대상에게는 실패" },
      { nameKo: "얼음뭉치", nameEn: "Ice Shard", power: 40, accuracy: 100, type: "얼음", category: "물리", pp: 30, description: "얼음 조각을 날려 선공한다. (Launches a shard of ice at the target.)" }
    ]
  }
];
