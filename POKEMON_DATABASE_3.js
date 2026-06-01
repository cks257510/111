const POKEMON_DATABASE_3 = [
  {
    id: 81,
    nameKo: "꾸꾸리",
    nameEn: "Swinub",
    finalFormKo: "맘모꾸리",
    finalFormEn: "Mamoswine",
    type: ["얼음", "땅"],
    stats: { hp: 50, attack: 50, defense: 40, spAttack: 30, spDefense: 30, speed: 50 },
    statTotal: 250,
    battleNote: "초반에는 평범하지만 성장하면 강한 물리 화력과 우선권 압박을 동시에 갖는 맘모꾸리로 이어진다.",
    evolution: { evoLevel: 16, nextEvoId: 175 },
    ability: null,
    appearance: { outer: "transparent", core: "#C2B280", bars: ["#8B5A2B", "#FFFFFF"] },
    moves: [
      {
        nameKo: "얼음엄니",
        nameEn: "Ice Fang",
        power: 65,
        accuracy: 95,
        type: "얼음",
        category: "물리",
        pp: 15,
        description: "차가운 이빨로 물어뜯는다. (The target is bitten with cold fangs.)"
      },
      {
        nameKo: "땅가르기",
        nameEn: "Fissure",
        power: null,
        accuracy: 30,
        type: "땅",
        category: "변화",
        pp: 5,
        description: "지면을 갈라 상대를 떨어뜨려 단번에 기절시키려 한다. (An OHKO move that drops the target in a fissure.)",
        logicRef: "fissure",
        logicExplanation: "공식: user.level >= target.level 일 때만 명중 판정. 명중률 = 30 + 사용자 레벨 - 대상 레벨 / 규칙: 명중 시 상대 즉사, 비행 타입 또는 땅 기술 무효 대상에게는 실패"
      },
      {
        nameKo: "얼음뭉치",
        nameEn: "Ice Shard",
        power: 40,
        accuracy: 100,
        type: "얼음",
        category: "물리",
        pp: 30,
        description: "얼음 조각을 날려 선공한다. (Launches a shard of ice at the target.)"
      }
    ]
  },
  {
    id: 82,
    nameKo: "맘모꾸리",
    nameEn: "Mamoswine",
    finalFormKo: "맘모꾸리",
    finalFormEn: "Mamoswine",
    type: ["얼음", "땅"],
    stats: { hp: 110, attack: 130, defense: 80, spAttack: 70, spDefense: 60, speed: 80 },
    statTotal: 530,
    battleNote: "강한 공격력과 얼음 선공기로 드래곤과 비행을 압박하기 쉬운 물리 브레이커이며, 지진과 얼음 기술의 조합이 강하다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: null,
    appearance: { outer: "transparent", core: "#C2B280", bars: ["#8B5A2B", "#FFFFFF"] },
    moves: [
      {
        nameKo: "지진",
        nameEn: "Earthquake",
        power: 100,
        accuracy: 100,
        type: "땅",
        category: "물리",
        pp: 10,
        description: "지면을 크게 흔들어 공격한다. (A powerful quake that strikes all Pokémon nearby.)"
      },
      {
        nameKo: "얼음뭉치",
        nameEn: "Ice Shard",
        power: 40,
        accuracy: 100,
        type: "얼음",
        category: "물리",
        pp: 30,
        description: "얼음 조각을 날려 선공한다. (Launches a shard of ice at the target.)"
      },
      {
        nameKo: "스톤에지",
        nameEn: "Stone Edge",
        power: 100,
        accuracy: 80,
        type: "바위",
        category: "물리",
        pp: 5,
        description: "날카로운 바위로 급소를 노린다. (Launches sharp stones aimed at weak points.)"
      }
    ]
  },
  {
    id: 83,
    nameKo: "애버라스",
    nameEn: "Larvitar",
    finalFormKo: "마기라스",
    finalFormEn: "Tyranitar",
    type: ["바위", "땅"],
    stats: { hp: 50, attack: 64, defense: 50, spAttack: 45, spDefense: 50, speed: 41 },
    statTotal: 300,
    battleNote: "성장형 물리 포켓몬으로, 최종진화형 마기라스는 높은 종족값과 모래바람 기반의 압박으로 유명하다.",
    evolution: { evoLevel: 30, nextEvoId: 84 },
    ability: null,
    appearance: { outer: "transparent", core: "#78C850", bars: ["#7A5A2A", "#D9C26B"] },
    moves: [
      {
        nameKo: "물기",
        nameEn: "Bite",
        power: 60,
        accuracy: 100,
        type: "악",
        category: "물리",
        pp: 25,
        description: "날카로운 이로 물어뜯는다. (Bites with vicious fangs.)"
      },
      {
        nameKo: "암석봉인",
        nameEn: "Rock Tomb",
        power: 60,
        accuracy: 95,
        type: "바위",
        category: "물리",
        pp: 15,
        description: "바위를 떨어뜨려 공격하고 스피드를 낮춘다. (Drops rocks on the target and lowers Speed.)"
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
        logicRef: "dragon_dance",
        logicExplanation: "공식: user.stages.attack += 1; user.stages.speed += 1 | 규칙: 중첩 사용 가능, 랭크 상한은 게임 규칙에 따라 제한한다."
      }
    ]
  },
  {
    id: 84,
    nameKo: "데기라스",
    nameEn: "Pupitar",
    finalFormKo: "마기라스",
    finalFormEn: "Tyranitar",
    type: ["바위", "땅"],
    stats: { hp: 70, attack: 84, defense: 70, spAttack: 65, spDefense: 70, speed: 51 },
    statTotal: 410,
    battleNote: "방어와 공격이 한층 안정되어 최종진화형 마기라스로 가는 중간 단계의 단단한 물리형 포켓몬이다.",
    evolution: { evoLevel: 55, nextEvoId: 85 },
    ability: null,
    appearance: { outer: "transparent", core: "#78C850", bars: ["#7A5A2A", "#BDB76B"] },
    moves: [
      {
        nameKo: "스톤샤워",
        nameEn: "Rock Slide",
        power: 75,
        accuracy: 90,
        type: "바위",
        category: "물리",
        pp: 10,
        description: "거대한 돌을 굴려 공격한다. (Large boulders are hurled at the target.)"
      },
      {
        nameKo: "지진",
        nameEn: "Earthquake",
        power: 100,
        accuracy: 100,
        type: "땅",
        category: "물리",
        pp: 10,
        description: "지면을 크게 흔들어 공격한다. (A powerful quake that strikes all Pokémon nearby.)"
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
        logicRef: "dragon_dance",
        logicExplanation: "공식: user.stages.attack += 1; user.stages.speed += 1 | 규칙: 중첩 사용 가능, 랭크 상한은 게임 규칙에 따라 제한한다."
      }
    ]
  },
  {
    id: 85,
    nameKo: "마기라스",
    nameEn: "Tyranitar",
    finalFormKo: "마기라스",
    finalFormEn: "Tyranitar",
    type: ["바위", "악"],
    stats: { hp: 100, attack: 134, defense: 110, spAttack: 95, spDefense: 100, speed: 61 },
    statTotal: 600,
    battleNote: "높은 종족값과 강한 화력을 동시에 지닌 대표적인 물리 브레이커이자 벌키한 악/바위 타입 에이스로, 모래바람과 함께 굴리기 좋다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: null,
    appearance: { outer: "transparent", core: "#78C850", bars: ["#4A4A4A", "#8C6B3A"] },
    moves: [
      {
        nameKo: "스톤에지",
        nameEn: "Stone Edge",
        power: 100,
        accuracy: 80,
        type: "바위",
        category: "물리",
        pp: 5,
        description: "날카로운 바위로 급소를 노린다. (Launches sharp stones aimed at weak points.)"
      },
      {
        nameKo: "깨물어부수기",
        nameEn: "Crunch",
        power: 80,
        accuracy: 100,
        type: "악",
        category: "물리",
        pp: 15,
        description: "강한 이빨로 세게 물어뜯는다. (Crunches the target with sharp fangs.)"
      },
      {
        nameKo: "지진",
        nameEn: "Earthquake",
        power: 100,
        accuracy: 100,
        type: "땅",
        category: "물리",
        pp: 10,
        description: "지면을 크게 흔들어 공격한다. (A powerful quake that strikes all Pokémon nearby.)"
      }
    ]
  },
  {
    id: 86,
    nameKo: "포푸니",
    nameEn: "Sneasel",
    finalFormKo: "포푸니라",
    finalFormEn: "Weavile",
    type: ["악", "얼음"],
    stats: { hp: 55, attack: 95, defense: 55, spAttack: 35, spDefense: 75, speed: 115 },
    statTotal: 430,
    battleNote: "빠른 스피드로 선공 압박을 거는 대표적인 물리형 악/얼음 포켓몬이며, 최종진화형 포푸니라는 기습과 우선권 대응이 강하다.",
    evolution: { evoLevel: 36, nextEvoId: 87 },
    ability: null,
    appearance: { outer: "transparent", core: "#705898", bars: ["#000000", "#D0D0D0"] },
    moves: [
      {
        nameKo: "기습",
        nameEn: "Sucker Punch",
        power: 80,
        accuracy: 100,
        type: "악",
        category: "물리",
        pp: 5,
        description: "상대가 공격할 틈을 노려 먼저 친다. (Strikes first if the foe is about to attack.)"
      },
      {
        nameKo: "얼음뭉치",
        nameEn: "Ice Shard",
        power: 40,
        accuracy: 100,
        type: "얼음",
        category: "물리",
        pp: 30,
        description: "얼음 조각을 날려 선공한다. (Launches a shard of ice at the target.)"
      },
      {
        nameKo: "깨물어부수기",
        nameEn: "Crunch",
        power: 80,
        accuracy: 100,
        type: "악",
        category: "물리",
        pp: 15,
        description: "강한 이빨로 세게 물어뜯는다. (Crunches the target with sharp fangs.)"
      }
    ]
  },
  {
    id: 87,
    nameKo: "포푸니라",
    nameEn: "Weavile",
    finalFormKo: "포푸니라",
    finalFormEn: "Weavile",
    type: ["악", "얼음"],
    stats: { hp: 70, attack: 120, defense: 65, spAttack: 45, spDefense: 85, speed: 125 },
    statTotal: 510,
    battleNote: "매우 빠른 스피드와 높은 물리 화력을 바탕으로 선공 기습과 후반 정리 역할을 맡기 좋은 악/얼음 스위퍼다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: null,
    appearance: { outer: "transparent", core: "#705898", bars: ["#000000", "#C0D0E0"] },
    moves: [
      {
        nameKo: "기습",
        nameEn: "Sucker Punch",
        power: 80,
        accuracy: 100,
        type: "악",
        category: "물리",
        pp: 5,
        description: "상대가 공격할 틈을 노려 먼저 친다. (Strikes first if the foe is about to attack.)"
      },
      {
        nameKo: "냉동펀치",
        nameEn: "Ice Punch",
        power: 75,
        accuracy: 100,
        type: "얼음",
        category: "물리",
        pp: 15,
        description: "얼음의 힘을 실은 주먹으로 공격한다. (Punches the target with an icy fist.)"
      },
      {
        nameKo: "칼춤",
        nameEn: "Swords Dance",
        power: null,
        accuracy: null,
        type: "노말",
        category: "변화",
        pp: 20,
        description: "춤추듯 몸을 움직여 공격력을 크게 올린다. (A frenetic dance to sharply raise Attack.)",
        logicRef: "swords_dance",
        logicExplanation: "공식: user.stages.attack += 2 | 규칙: 중첩 사용 가능, 랭크 상한은 게임 규칙에 따라 제한한다."
      }
    ]
  },
  {
    id: 88,
    nameKo: "주벳",
    nameEn: "Zubat",
    finalFormKo: "크로뱃",
    finalFormEn: "Crobat",
    type: ["독", "비행"],
    stats: { hp: 40, attack: 45, defense: 35, spAttack: 30, spDefense: 40, speed: 55 },
    statTotal: 245,
    battleNote: "초반에는 약하지만 빠른 비행 속도를 바탕으로 성장하면, 최종진화형 크로뱃의 초고속 교란형 운영으로 이어진다.",
    evolution: { evoLevel: 22, nextEvoId: 89 },
    ability: null,
    appearance: { outer: "transparent", core: "#705898", bars: ["#1E88E5", "#6D4C41"] },
    moves: [
      {
        nameKo: "독침",
        nameEn: "Poison Sting",
        power: 15,
        accuracy: 100,
        type: "독",
        category: "물리",
        pp: 35,
        description: "독성 침으로 찌른다. (Stings the target with a poisonous barb.)"
      },
      {
        nameKo: "흡혈",
        nameEn: "Leech Life",
        power: 20,
        accuracy: 100,
        type: "벌레",
        category: "물리",
        pp: 15,
        description: "상대의 체력을 빨아들인다. (Saps the target's energy with a bite.)"
      },
      {
        nameKo: "날개치기",
        nameEn: "Wing Attack",
        power: 60,
        accuracy: 100,
        type: "비행",
        category: "물리",
        pp: 35,
        description: "날개를 펼쳐 상대를 친다. (Strikes the target with its wings.)"
      }
    ]
  },
  {
    id: 89,
    nameKo: "골벳",
    nameEn: "Golbat",
    finalFormKo: "크로뱃",
    finalFormEn: "Crobat",
    type: ["독", "비행"],
    stats: { hp: 75, attack: 80, defense: 70, spAttack: 65, spDefense: 75, speed: 90 },
    statTotal: 455,
    battleNote: "스피드가 크게 올라가고 견제도 쉬워지며, 최종진화형 크로뱃은 빠른 교란과 선공 압박에 강하다.",
    evolution: { evoLevel: 24, nextEvoId: 90 },
    ability: null,
    appearance: { outer: "transparent", core: "#705898", bars: ["#1E88E5", "#A67C52"] },
    moves: [
      {
        nameKo: "날개치기",
        nameEn: "Wing Attack",
        power: 60,
        accuracy: 100,
        type: "비행",
        category: "물리",
        pp: 35,
        description: "날개를 펼쳐 상대를 친다. (Strikes the target with its wings.)"
      },
      {
        nameKo: "독엄니",
        nameEn: "Poison Fang",
        power: 50,
        accuracy: 100,
        type: "독",
        category: "물리",
        pp: 15,
        description: "독이 깃든 이빨로 문다. (Bites with fangs coated in venom.)"
      },
      {
        nameKo: "흡혈",
        nameEn: "Leech Life",
        power: 20,
        accuracy: 100,
        type: "벌레",
        category: "물리",
        pp: 15,
        description: "상대의 체력을 빨아들인다. (Saps the target's energy with a bite.)"
      }
    ]
  },
  {
    id: 90,
    nameKo: "크로뱃",
    nameEn: "Crobat",
    finalFormKo: "크로뱃",
    finalFormEn: "Crobat",
    type: ["독", "비행"],
    stats: { hp: 85, attack: 90, defense: 80, spAttack: 70, spDefense: 80, speed: 130 },
    statTotal: 535,
    battleNote: "압도적으로 빠른 스피드를 바탕으로 선공 보조와 마무리, 교란을 모두 맡기 좋은 독/비행 타입이다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: null,
    appearance: { outer: "transparent", core: "#705898", bars: ["#1E88E5", "#6D4C41"] },
    moves: [
      {
        nameKo: "브레이브버드",
        nameEn: "Brave Bird",
        power: 120,
        accuracy: 100,
        type: "비행",
        category: "물리",
        pp: 15,
        description: "몸을 날려 거칠게 돌진한다. (A reckless, full-speed charge.)"
      },
      {
        nameKo: "기습",
        nameEn: "Sucker Punch",
        power: 80,
        accuracy: 100,
        type: "악",
        category: "물리",
        pp: 5,
        description: "상대가 공격할 틈을 노려 먼저 친다. (Strikes first if the foe is about to attack.)"
      },
      {
        nameKo: "날개쉬기",
        nameEn: "Roost",
        power: null,
        accuracy: null,
        type: "비행",
        category: "변화",
        pp: 10,
        description: "날개를 쉬게 하며 체력을 회복한다. (Restores HP and makes the user lose its Flying type until end of turn.)",
        logicRef: "roost",
        logicExplanation: "공식: heal = floor(user.maxHP / 2); user.hp = min(user.maxHP, user.hp + heal); if user.type includes '비행': user.turnFlyingTypeRemoved = true | 규칙: 회복량은 최대 HP의 50%, 비행 타입 상실은 그 턴에만 적용"
      }
    ]
  },
  {
    id: 91,
    nameKo: "메리프",
    nameEn: "Mareep",
    finalFormKo: "전룡",
    finalFormEn: "Ampharos",
    type: ["전기"],
    stats: { hp: 55, attack: 40, defense: 40, spAttack: 65, spDefense: 45, speed: 35 },
    statTotal: 280,
    battleNote: "초반에는 평범하지만 최종진화형 전룡은 특수 화력과 내구를 겸비한 안정적인 전기 타입으로 완성된다.",
    evolution: { evoLevel: 15, nextEvoId: 92 },
    ability: null,
    appearance: { outer: "transparent", core: "#F8D030", bars: ["#FFFFFF", "#222222"] },
    moves: [
      {
        nameKo: "전기쇼크",
        nameEn: "Thunder Shock",
        power: 40,
        accuracy: 100,
        type: "전기",
        category: "특수",
        pp: 30,
        description: "전기 충격을 가한다. (A jolt of electricity crashes down on the target.)"
      },
      {
        nameKo: "전기자석파",
        nameEn: "Thunder Wave",
        power: null,
        accuracy: 90,
        type: "전기",
        category: "변화",
        pp: 20,
        description: "전기로 상대를 마비시킨다. (A weak electric charge that paralyzes the target.)",
        logicRef: "thunder_wave",
        logicExplanation: "공식: if hit and target not immune: target.status = 'paralysis'; target.speedMultiplier = 0.25; target.fullParalysisChance = 0.25 | 규칙: 전기 타입 등 면역 대상은 실패할 수 있다, 마비의 스피드 저하는 즉시 적용된다, 행동 불능 판정은 매 턴마다 독립적으로 계산한다"
      },
      {
        nameKo: "차지빔",
        nameEn: "Charge Beam",
        power: 50,
        accuracy: 90,
        type: "전기",
        category: "특수",
        pp: 10,
        description: "에너지를 모은 빔으로 공격한다. (The user attacks with an electric charge.)"
      }
    ]
  },
  {
    id: 92,
    nameKo: "보송송",
    nameEn: "Flaaffy",
    finalFormKo: "전룡",
    finalFormEn: "Ampharos",
    type: ["전기"],
    stats: { hp: 70, attack: 55, defense: 55, spAttack: 80, spDefense: 60, speed: 45 },
    statTotal: 365,
    battleNote: "특수공격이 크게 올라 최종진화형 전룡의 전기 화력을 미리 보여주는 중간 단계로, 보조와 견제를 함께 쓰기 좋다.",
    evolution: { evoLevel: 30, nextEvoId: 93 },
    ability: null,
    appearance: { outer: "transparent", core: "#F8D030", bars: ["#FFFFFF", "#F28C28"] },
    moves: [
      {
        nameKo: "10만볼트",
        nameEn: "Thunderbolt",
        power: 90,
        accuracy: 100,
        type: "전기",
        category: "특수",
        pp: 15,
        description: "강한 전기를 방출해 공격한다. (A strong electric blast crashes down on the target.)"
      },
      {
        nameKo: "전기자석파",
        nameEn: "Thunder Wave",
        power: null,
        accuracy: 90,
        type: "전기",
        category: "변화",
        pp: 20,
        description: "전기로 상대를 마비시킨다. (A weak electric charge that paralyzes the target.)",
        logicRef: "thunder_wave",
        logicExplanation: "공식: if hit and target not immune: target.status = 'paralysis'; target.speedMultiplier = 0.25; target.fullParalysisChance = 0.25 | 규칙: 전기 타입 등 면역 대상은 실패할 수 있다, 마비의 스피드 저하는 즉시 적용된다, 행동 불능 판정은 매 턴마다 독립적으로 계산한다"
      },
      {
        nameKo: "차지빔",
        nameEn: "Charge Beam",
        power: 50,
        accuracy: 90,
        type: "전기",
        category: "특수",
        pp: 10,
        description: "에너지를 모은 빔으로 공격한다. (The user attacks with an electric charge.)"
      }
    ]
  },
  {
    id: 93,
    nameKo: "전룡",
    nameEn: "Ampharos",
    finalFormKo: "전룡",
    finalFormEn: "Ampharos",
    type: ["전기"],
    stats: { hp: 90, attack: 75, defense: 85, spAttack: 115, spDefense: 90, speed: 55 },
    statTotal: 510,
    battleNote: "특수 화력이 높고 내구도 안정적이라 오래 버티며 압박하는 전기 타입 특수 어태커로 쓰기 좋다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: null,
    appearance: { outer: "transparent", core: "#F8D030", bars: ["#000000", "#F28C28"] },
    moves: [
      {
        nameKo: "10만볼트",
        nameEn: "Thunderbolt",
        power: 90,
        accuracy: 100,
        type: "전기",
        category: "특수",
        pp: 15,
        description: "강한 전기를 방출해 공격한다. (A strong electric blast crashes down on the target.)"
      },
      {
        nameKo: "차지빔",
        nameEn: "Charge Beam",
        power: 50,
        accuracy: 90,
        type: "전기",
        category: "특수",
        pp: 10,
        description: "에너지를 모은 빔으로 공격한다. (The user attacks with an electric charge.)"
      },
      {
        nameKo: "전기자석파",
        nameEn: "Thunder Wave",
        power: null,
        accuracy: 90,
        type: "전기",
        category: "변화",
        pp: 20,
        description: "전기로 상대를 마비시킨다. (A weak electric charge that paralyzes the target.)",
        logicRef: "thunder_wave",
        logicExplanation: "공식: if hit and target not immune: target.status = 'paralysis'; target.speedMultiplier = 0.25; target.fullParalysisChance = 0.25 | 규칙: 전기 타입 등 면역 대상은 실패할 수 있다, 마비의 스피드 저하는 즉시 적용된다, 행동 불능 판정은 매 턴마다 독립적으로 계산한다"
      }
    ]
  },
  {
    id: 94,
    nameKo: "에레키드",
    nameEn: "Elekid",
    finalFormKo: "에레브",
    finalFormEn: "Electabuzz",
    type: ["전기"],
    stats: { hp: 45, attack: 63, defense: 37, spAttack: 65, spDefense: 55, speed: 95 },
    statTotal: 360,
    battleNote: "빠른 스피드를 바탕으로 선공 압박을 하며, 최종진화형 에레브는 견제폭이 넓은 전기 물리/특수 혼합형으로 성장한다.",
    evolution: { evoLevel: 30, nextEvoId: 95 },
    ability: null,
    appearance: { outer: "transparent", core: "#F8D030", bars: ["#222222", "#D67B1D"] },
    moves: [
      {
        nameKo: "전기쇼크",
        nameEn: "Thunder Shock",
        power: 40,
        accuracy: 100,
        type: "전기",
        category: "특수",
        pp: 30,
        description: "전기 충격을 가한다. (A jolt of electricity crashes down on the target.)"
      },
      {
        nameKo: "크로스촙",
        nameEn: "Cross Chop",
        power: 100,
        accuracy: 80,
        type: "격투",
        category: "물리",
        pp: 5,
        description: "두 팔을 교차해 강하게 내리친다. (Slashes the target with crossed arms.)"
      },
      {
        nameKo: "전기자석파",
        nameEn: "Thunder Wave",
        power: null,
        accuracy: 90,
        type: "전기",
        category: "변화",
        pp: 20,
        description: "전기로 상대를 마비시킨다. (A weak electric charge that paralyzes the target.)",
        logicRef: "thunder_wave",
        logicExplanation: "공식: if hit and target not immune: target.status = 'paralysis'; target.speedMultiplier = 0.25; target.fullParalysisChance = 0.25 | 규칙: 전기 타입 등 면역 대상은 실패할 수 있다, 마비의 스피드 저하는 즉시 적용된다, 행동 불능 판정은 매 턴마다 독립적으로 계산한다"
      }
    ]
  },
  {
    id: 95,
    nameKo: "에레브",
    nameEn: "Electabuzz",
    finalFormKo: "에레브",
    finalFormEn: "Electabuzz",
    type: ["전기"],
    stats: { hp: 65, attack: 83, defense: 57, spAttack: 95, spDefense: 85, speed: 105 },
    statTotal: 490,
    battleNote: "속도와 화력이 함께 올라가는 전기 타입 중간 완성형으로, 다양한 견제 기술로 상대를 흔들기 좋다.",
    evolution: { evoLevel: 36, nextEvoId: 96 },
    ability: null,
    appearance: { outer: "transparent", core: "#F8D030", bars: ["#222222", "#D67B1D"] },
    moves: [
      {
        nameKo: "10만볼트",
        nameEn: "Thunderbolt",
        power: 90,
        accuracy: 100,
        type: "전기",
        category: "특수",
        pp: 15,
        description: "강한 전기를 방출해 공격한다. (A strong electric blast crashes down on the target.)"
      },
      {
        nameKo: "냉동펀치",
        nameEn: "Ice Punch",
        power: 75,
        accuracy: 100,
        type: "얼음",
        category: "물리",
        pp: 15,
        description: "얼음의 힘을 실은 주먹으로 공격한다. (Punches the target with an icy fist.)"
      },
      {
        nameKo: "번개펀치",
        nameEn: "Thunder Punch",
        power: 75,
        accuracy: 100,
        type: "전기",
        category: "물리",
        pp: 15,
        description: "전기를 머금은 주먹으로 공격한다. (Punches the target with an electrified fist.)"
      }
    ]
  },
  {
    id: 96,
    nameKo: "에레키블",
    nameEn: "Electivire",
    finalFormKo: "에레키블",
    finalFormEn: "Electivire",
    type: ["전기"],
    stats: { hp: 75, attack: 123, defense: 67, spAttack: 95, spDefense: 85, speed: 95 },
    statTotal: 540,
    battleNote: "강한 물리 화력과 좋은 기술폭을 동시에 가진 전기 타입 브레이커로, 번개펀치와 지진 계열 견제가 강하다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: null,
    appearance: { outer: "transparent", core: "#F8D030", bars: ["#222222", "#4A90E2"] },
    moves: [
      {
        nameKo: "번개펀치",
        nameEn: "Thunder Punch",
        power: 75,
        accuracy: 100,
        type: "전기",
        category: "물리",
        pp: 15,
        description: "전기를 머금은 주먹으로 공격한다. (Punches the target with an electrified fist.)"
      },
      {
        nameKo: "지진",
        nameEn: "Earthquake",
        power: 100,
        accuracy: 100,
        type: "땅",
        category: "물리",
        pp: 10,
        description: "지면을 크게 흔들어 공격한다. (A powerful quake that strikes all Pokémon nearby.)"
      },
      {
        nameKo: "냉동펀치",
        nameEn: "Ice Punch",
        power: 75,
        accuracy: 100,
        type: "얼음",
        category: "물리",
        pp: 15,
        description: "얼음의 힘을 실은 주먹으로 공격한다. (Punches the target with an icy fist.)"
      }
    ]
  },
  {
    id: 97,
    nameKo: "루나톤",
    nameEn: "Lunatone",
    finalFormKo: "루나톤",
    finalFormEn: "Lunatone",
    type: ["바위", "에스퍼"],
    stats: { hp: 70, attack: 55, defense: 65, spAttack: 95, spDefense: 85, speed: 70 },
    statTotal: 440,
    battleNote: "특수 화력이 준수하고 보조 운용도 가능한 바위/에스퍼 타입으로, 여러 특수 기술을 섞어 압박하기 좋다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: null,
    appearance: { outer: "transparent", core: "#A38C21", bars: ["#D8C4FF", "#7E6B8F"] },
    moves: [
      {
        nameKo: "파워젬",
        nameEn: "Power Gem",
        power: 80,
        accuracy: 100,
        type: "바위",
        category: "특수",
        pp: 20,
        description: "빛나는 보석 같은 에너지로 공격한다. (Attacks with a sudden burst of light.)"
      },
      {
        nameKo: "사이코키네시스",
        nameEn: "Psychic",
        power: 90,
        accuracy: 100,
        type: "에스퍼",
        category: "특수",
        pp: 10,
        description: "강한 정신력으로 상대를 공격한다. (A strong telekinetic attack.)"
      },
      {
        nameKo: "지진",
        nameEn: "Earthquake",
        power: 100,
        accuracy: 100,
        type: "땅",
        category: "물리",
        pp: 10,
        description: "지면을 크게 흔들어 공격한다. (A powerful quake that strikes all Pokémon nearby.)"
      }
    ]
  },
  {
    id: 98,
    nameKo: "흔들풍손",
    nameEn: "Drifloon",
    finalFormKo: "둥실라이드",
    finalFormEn: "Drifblim",
    type: ["고스트", "비행"],
    stats: { hp: 90, attack: 50, defense: 34, spAttack: 60, spDefense: 44, speed: 70 },
    statTotal: 348,
    battleNote: "체력이 높고 교란과 보조를 함께 노릴 수 있는 고스트/비행 포켓몬으로, 최종진화형 둥실라이드는 독특한 내구형 운영이 가능하다.",
    evolution: { evoLevel: 16, nextEvoId: 99 },
    ability: null,
    appearance: { outer: "transparent", core: "#705898", bars: ["#F4D35E", "#B58CC0"] },
    moves: [
      {
        nameKo: "섀도볼",
        nameEn: "Shadow Ball",
        power: 80,
        accuracy: 100,
        type: "고스트",
        category: "특수",
        pp: 15,
        description: "그림자 구체를 던져 공격한다. (Hurls a shadowy blob at the target.)"
      },
      {
        nameKo: "바람일으키기",
        nameEn: "Gust",
        power: 40,
        accuracy: 100,
        type: "비행",
        category: "특수",
        pp: 35,
        description: "강한 바람으로 공격한다. (A gust of wind is whipped up to attack the target.)"
      },
      {
        nameKo: "놀래키기",
        nameEn: "Astonish",
        power: 30,
        accuracy: 100,
        type: "고스트",
        category: "물리",
        pp: 15,
        description: "갑자기 놀라게 해 공격한다. (The user attacks the target while startling it.)"
      }
    ]
  },
  {
    id: 99,
    nameKo: "둥실라이드",
    nameEn: "Drifblim",
    finalFormKo: "둥실라이드",
    finalFormEn: "Drifblim",
    type: ["고스트", "비행"],
    stats: { hp: 150, attack: 80, defense: 44, spAttack: 90, spDefense: 54, speed: 80 },
    statTotal: 498,
    battleNote: "체력이 매우 높아 오래 버티며 교란할 수 있는 고스트/비행 포켓몬으로, 보조기와 회복기를 섞은 운영이 잘 맞는다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: null,
    appearance: { outer: "transparent", core: "#705898", bars: ["#F4D35E", "#C9A0DC"] },
    moves: [
      {
        nameKo: "섀도볼",
        nameEn: "Shadow Ball",
        power: 80,
        accuracy: 100,
        type: "고스트",
        category: "특수",
        pp: 15,
        description: "그림자 구체를 던져 공격한다. (Hurls a shadowy blob at the target.)"
      },
      {
        nameKo: "대타출동",
        nameEn: "Substitute",
        power: null,
        accuracy: null,
        type: "노말",
        category: "변화",
        pp: 10,
        description: "자신의 체력을 써서 분신을 만든다. (Creates a decoy using the user's HP.)",
        logicRef: "substitute",
        logicExplanation: "공식: cost = floor(user.maxHP / 4); if user.hp > cost: user.hp -= cost; user.substituteHP = cost | 규칙: 분신은 일정 피해를 대신 받음, 교체/해제 규칙은 게임 시스템에 따름"
      },
      {
        nameKo: "날개쉬기",
        nameEn: "Roost",
        power: null,
        accuracy: null,
        type: "비행",
        category: "변화",
        pp: 10,
        description: "날개를 쉬게 하며 체력을 회복한다. (Restores HP and makes the user lose its Flying type until end of turn.)",
        logicRef: "roost",
        logicExplanation: "공식: heal = floor(user.maxHP / 2); user.hp = min(user.maxHP, user.hp + heal); if user.type includes '비행': user.turnFlyingTypeRemoved = true | 규칙: 회복량은 최대 HP의 50%, 비행 타입 상실은 그 턴에만 적용"
      }
    ]
  },
  {
    id: 100,
    nameKo: "야느와르몽",
    nameEn: "Mismagius",
    finalFormKo: "야느와르몽",
    finalFormEn: "Mismagius",
    type: ["고스트"],
    stats: { hp: 60, attack: 60, defense: 60, spAttack: 105, spDefense: 105, speed: 105 },
    statTotal: 495,
    battleNote: "특수 화력과 스피드가 좋은 고스트 타입 특수 어태커로, 상태이상과 압박을 섞은 교란형 운용이 잘 어울린다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: null,
    appearance: { outer: "transparent", core: "#705898", bars: ["#8B5A2B", "#C9A0DC"] },
    moves: [
      {
        nameKo: "섀도볼",
        nameEn: "Shadow Ball",
        power: 80,
        accuracy: 100,
        type: "고스트",
        category: "특수",
        pp: 15,
        description: "그림자 구체를 던져 공격한다. (Hurls a shadowy blob at the target.)"
      },
      {
        nameKo: "악의파동",
        nameEn: "Dark Pulse",
        power: 80,
        accuracy: 100,
        type: "악",
        category: "특수",
        pp: 15,
        description: "악의가 담긴 충격파를 날린다. (Releases a horrible aura that may flinch the target.)"
      },
      {
        nameKo: "10만볼트",
        nameEn: "Thunderbolt",
        power: 90,
        accuracy: 100,
        type: "전기",
        category: "특수",
        pp: 15,
        description: "강한 전기를 방출해 공격한다. (A strong electric blast crashes down on the target.)"
      }
    ]
  }
];