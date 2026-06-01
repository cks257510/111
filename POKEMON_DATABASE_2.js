const POKEMON_DATABASE_2 = [
  {
    id: 41,
    nameKo: "킬리아",
    nameEn: "Kirlia",
    finalFormKo: "가디안",
    finalFormEn: "Gardevoir",
    type: ["에스퍼"],
    stats: { hp: 38, attack: 35, defense: 35, spAttack: 65, spDefense: 55, speed: 50 },
    statTotal: 278,
    battleNote: "최종진화형 가디안으로 가는 중간 단계로, 특수 화력이 좋아 에스퍼 기술 중심의 안정적인 전개에 잘 맞는다.",
    evolution: { evoLevel: 30, nextEvoId: 42 },
    ability: null,
    appearance: { outer: "transparent", core: "#F85888", bars: ["#FFFFFF", "#7ED957"] },
    moves: [
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
        nameKo: "매지컬리프",
        nameEn: "Magical Leaf",
        power: 60,
        accuracy: null,
        type: "풀",
        category: "특수",
        pp: 20,
        description: "피할 수 없는 마력의 잎사귀로 공격한다. (Leaves are launched in a mysterious, unavoidable attack.)"
      },
      {
        nameKo: "이상한빛",
        nameEn: "Double Team",
        power: null,
        accuracy: null,
        type: "노말",
        category: "변화",
        pp: 15,
        description: "분신을 늘려 회피율을 올린다. (Creates illusory copies to raise evasion.)",
        logicExplanation: "공식: user.stages.evasion += 1 / 규칙: 사용자의 회피율 1랭크 상승"
      }
    ]
  },
  {
    id: 42,
    nameKo: "가디안",
    nameEn: "Gardevoir",
    finalFormKo: "가디안",
    finalFormEn: "Gardevoir",
    type: ["에스퍼"],
    stats: { hp: 68, attack: 65, defense: 65, spAttack: 125, spDefense: 115, speed: 80 },
    statTotal: 518,
    battleNote: "특수 화력이 매우 높고 보조기 운용도 좋은 정석 특수 어태커로, 선공과 후공 모두에서 압박을 주기 쉽다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: null,
    appearance: { outer: "transparent", core: "#F85888", bars: ["#FFFFFF", "#B58CC0"] },
    moves: [
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
  },
  {
    id: 43,
    nameKo: "딥상어동",
    nameEn: "Gible",
    finalFormKo: "한카리아스",
    finalFormEn: "Garchomp",
    type: ["드래곤", "땅"],
    stats: { hp: 58, attack: 70, defense: 45, spAttack: 40, spDefense: 45, speed: 42 },
    statTotal: 300,
    battleNote: "초반엔 내구가 낮지만 성장 가치가 매우 높은 드래곤으로, 최종진화형 한카리아스는 빠른 물리 스위퍼로 완성된다.",
    evolution: { evoLevel: 24, nextEvoId: 44 },
    ability: null,
    appearance: { outer: "transparent", core: "#5A8DEE", bars: ["#8B5A2B", "#2E5EAA"] },
    moves: [
      {
        nameKo: "용의숨결",
        nameEn: "Dragon Breath",
        power: 60,
        accuracy: 100,
        type: "드래곤",
        category: "특수",
        pp: 20,
        description: "강한 숨결로 상대를 공격하며 마비를 노린다. (Strikes with a gust that may paralyze the foe.)"
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
        nameKo: "모래뿌리기",
        nameEn: "Sand Attack",
        power: null,
        accuracy: 100,
        type: "땅",
        category: "변화",
        pp: 15,
        description: "모래를 뿌려 상대의 명중률을 낮춘다. (Reduces the target's accuracy.)",
        logicExplanation: "공식: target.stages.accuracy -= 1 / 규칙: 대상의 명중률 1랭크 하락"
      }
    ]
  },
  {
    id: 44,
    nameKo: "한바이트",
    nameEn: "Gabite",
    finalFormKo: "한카리아스",
    finalFormEn: "Garchomp",
    type: ["드래곤", "땅"],
    stats: { hp: 68, attack: 90, defense: 65, spAttack: 50, spDefense: 55, speed: 82 },
    statTotal: 410,
    battleNote: "공격과 스피드가 크게 올라가며, 최종진화형 한카리아스로 이어지는 전형적인 물리 중심 성장형 드래곤이다.",
    evolution: { evoLevel: 48, nextEvoId: 45 },
    ability: null,
    appearance: { outer: "transparent", core: "#5A8DEE", bars: ["#7A4E2A", "#2F5D9E"] },
    moves: [
      {
        nameKo: "드래곤클로",
        nameEn: "Dragon Claw",
        power: 80,
        accuracy: 100,
        type: "드래곤",
        category: "물리",
        pp: 15,
        description: "날카로운 발톱으로 베어 공격한다. (Slashes the target with sharp dragon claws.)"
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
        nameKo: "칼춤",
        nameEn: "Swords Dance",
        power: null,
        accuracy: null,
        type: "노말",
        category: "변화",
        pp: 20,
        description: "춤추듯 몸을 움직여 공격력을 크게 올린다. (A frenetic dance to sharply raise Attack.)",
        logicExplanation: "공식: user.stages.attack += 2 / 규칙: 사용자의 공격력 2랭크 상승"
      }
    ]
  },
  {
    id: 45,
    nameKo: "한카리아스",
    nameEn: "Garchomp",
    finalFormKo: "한카리아스",
    finalFormEn: "Garchomp",
    type: ["드래곤", "땅"],
    stats: { hp: 108, attack: 130, defense: 95, spAttack: 80, spDefense: 85, speed: 102 },
    statTotal: 600,
    battleNote: "압도적인 화력과 준수한 스피드를 동시에 갖춘 대표적인 물리 스위퍼로, 지진과 드래곤 기술을 바탕으로 정면 압박이 강하다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: null,
    appearance: { outer: "transparent", core: "#5A8DEE", bars: ["#7A4E2A", "#2E5EAA"] },
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
        nameKo: "드래곤클로",
        nameEn: "Dragon Claw",
        power: 80,
        accuracy: 100,
        type: "드래곤",
        category: "물리",
        pp: 15,
        description: "날카로운 발톱으로 베어 공격한다. (Slashes the target with sharp dragon claws.)"
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
        logicExplanation: "공식: user.stages.attack += 2 / 규칙: 사용자의 공격력 2랭크 상승"
      }
    ]
  },
  {
    id: 46,
    nameKo: "터검니",
    nameEn: "Axew",
    finalFormKo: "액스라이즈",
    finalFormEn: "Haxorus",
    type: ["드래곤"],
    stats: { hp: 46, attack: 87, defense: 60, spAttack: 30, spDefense: 40, speed: 57 },
    statTotal: 320,
    battleNote: "공격 종족값이 이미 높아 육성 보상이 큰 드래곤으로, 최종진화형 액스라이즈는 매우 높은 물리 화력으로 밀어붙인다.",
    evolution: { evoLevel: 38, nextEvoId: 47 },
    ability: null,
    appearance: { outer: "transparent", core: "#5A8DEE", bars: ["#6C4F3D", "#A1C6FF"] },
    moves: [
      {
        nameKo: "드래곤클로",
        nameEn: "Dragon Claw",
        power: 80,
        accuracy: 100,
        type: "드래곤",
        category: "물리",
        pp: 15,
        description: "날카로운 발톱으로 베어 공격한다. (Slashes the target with sharp dragon claws.)"
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
        nameKo: "할퀴기",
        nameEn: "Scratch",
        power: 40,
        accuracy: 100,
        type: "노말",
        category: "물리",
        pp: 35,
        description: "날카로운 발톱으로 긁어 공격한다. (Scratches the target with sharp claws.)"
      }
    ]
  },
  {
    id: 47,
    nameKo: "액슨도",
    nameEn: "Fraxure",
    finalFormKo: "액스라이즈",
    finalFormEn: "Haxorus",
    type: ["드래곤"],
    stats: { hp: 66, attack: 117, defense: 70, spAttack: 40, spDefense: 50, speed: 67 },
    statTotal: 410,
    battleNote: "공격이 크게 상승해 사실상 완성형에 가까운 중간 단계이며, 최종진화형 액스라이즈는 칼춤 이후의 폭발력이 강하다.",
    evolution: { evoLevel: 48, nextEvoId: 48 },
    ability: null,
    appearance: { outer: "transparent", core: "#5A8DEE", bars: ["#7A4E2A", "#2F5D9E"] },
    moves: [
      {
        nameKo: "드래곤클로",
        nameEn: "Dragon Claw",
        power: 80,
        accuracy: 100,
        type: "드래곤",
        category: "물리",
        pp: 15,
        description: "날카로운 발톱으로 베어 공격한다. (Slashes the target with sharp dragon claws.)"
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
        nameKo: "칼춤",
        nameEn: "Swords Dance",
        power: null,
        accuracy: null,
        type: "노말",
        category: "변화",
        pp: 20,
        description: "춤추듯 몸을 움직여 공격력을 크게 올린다. (A frenetic dance to sharply raise Attack.)",
        logicExplanation: "공식: user.stages.attack += 2 / 규칙: 사용자의 공격력 2랭크 상승"
      }
    ]
  },
  {
    id: 48,
    nameKo: "액스라이즈",
    nameEn: "Haxorus",
    finalFormKo: "액스라이즈",
    finalFormEn: "Haxorus",
    type: ["드래곤"],
    stats: { hp: 76, attack: 147, defense: 90, spAttack: 60, spDefense: 70, speed: 97 },
    statTotal: 540,
    battleNote: "극도로 높은 물리 공격을 앞세운 드래곤 브레이커로, 칼춤 한 번이면 대부분의 상대를 강하게 압박할 수 있다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: null,
    appearance: { outer: "transparent", core: "#5A8DEE", bars: ["#7A4E2A", "#1E5AA6"] },
    moves: [
      {
        nameKo: "역린",
        nameEn: "Outrage",
        power: 120,
        accuracy: 100,
        type: "드래곤",
        category: "물리",
        pp: 10,
        description: "격렬하게 난폭한 힘을 쏟아낸다. (Confuses the user after raging wildly for 2-3 turns.)"
      },
      {
        nameKo: "드래곤클로",
        nameEn: "Dragon Claw",
        power: 80,
        accuracy: 100,
        type: "드래곤",
        category: "물리",
        pp: 15,
        description: "날카로운 발톱으로 베어 공격한다. (Slashes the target with sharp dragon claws.)"
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
        logicExplanation: "공식: user.stages.attack += 2 / 규칙: 사용자의 공격력 2랭크 상승"
      }
    ]
  },
  {
    id: 49,
    nameKo: "삼삼드래",
    nameEn: "Hydreigon",
    finalFormKo: "삼삼드래",
    finalFormEn: "Hydreigon",
    type: ["악", "드래곤"],
    stats: { hp: 92, attack: 105, defense: 90, spAttack: 125, spDefense: 90, speed: 98 },
    statTotal: 600,
    battleNote: "특수 화력이 뛰어나고 견제폭도 넓은 악/드래곤 타입 에이스로, 강한 특수 공격으로 상대를 빠르게 압박한다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: null,
    appearance: { outer: "transparent", core: "#4B4B6E", bars: ["#2E2E2E", "#8A4F9E"] },
    moves: [
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
        nameKo: "용성군",
        nameEn: "Draco Meteor",
        power: 130,
        accuracy: 90,
        type: "드래곤",
        category: "특수",
        pp: 5,
        description: "유성 같은 드래곤 에너지를 쏟아부어 공격한다. (Calls down meteors of draconic energy.)"
      },
      {
        nameKo: "불대문자",
        nameEn: "Fire Blast",
        power: 110,
        accuracy: 85,
        type: "불꽃",
        category: "특수",
        pp: 5,
        description: "폭발적인 화염을 날려 큰 피해를 준다. (An intense fire attack that may burn the foe.)"
      }
    ]
  },
  {
    id: 50,
    nameKo: "모노두",
    nameEn: "Deino",
    finalFormKo: "삼삼드래",
    finalFormEn: "Hydreigon",
    type: ["악", "드래곤"],
    stats: { hp: 52, attack: 65, defense: 50, spAttack: 45, spDefense: 50, speed: 38 },
    statTotal: 300,
    battleNote: "이동은 느리지만 성장하면 강력한 특수/물리 혼합 드래곤으로 바뀌는 육성형 포켓몬이다.",
    evolution: { evoLevel: 50, nextEvoId: 51 },
    ability: null,
    appearance: { outer: "transparent", core: "#4B4B6E", bars: ["#2E2E2E", "#8A4F9E"] },
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
        nameKo: "용의숨결",
        nameEn: "Dragon Breath",
        power: 60,
        accuracy: 100,
        type: "드래곤",
        category: "특수",
        pp: 20,
        description: "강한 숨결로 상대를 공격하며 마비를 노린다. (Strikes with a gust that may paralyze the foe.)"
      },
      {
        nameKo: "머리박치기",
        nameEn: "Headbutt",
        power: 70,
        accuracy: 100,
        type: "노말",
        category: "물리",
        pp: 15,
        description: "머리로 강하게 들이받는다. (A physical attack using the head.)"
      }
    ]
  },
  {
    id: 51,
    nameKo: "디헤드",
    nameEn: "Zweilous",
    finalFormKo: "삼삼드래",
    finalFormEn: "Hydreigon",
    type: ["악", "드래곤"],
    stats: { hp: 72, attack: 85, defense: 70, spAttack: 65, spDefense: 70, speed: 58 },
    statTotal: 420,
    battleNote: "공격과 특수공격이 모두 올라가 양면 압박이 가능해지고, 최종진화형 삼삼드래는 강한 특수 화력을 자랑한다.",
    evolution: { evoLevel: 64, nextEvoId: 49 },
    ability: null,
    appearance: { outer: "transparent", core: "#4B4B6E", bars: ["#2E2E2E", "#8A4F9E"] },
    moves: [
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
        nameKo: "용의파동",
        nameEn: "Dragon Pulse",
        power: 85,
        accuracy: 100,
        type: "드래곤",
        category: "특수",
        pp: 10,
        description: "용의 충격파를 날려 공격한다. (A shockwave generated by the user's released dragon power.)"
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
    id: 52,
    nameKo: "나무지기",
    nameEn: "Treecko",
    finalFormKo: "나무킹",
    finalFormEn: "Sceptile",
    type: ["풀"],
    stats: { hp: 40, attack: 45, defense: 35, spAttack: 65, spDefense: 55, speed: 70 },
    statTotal: 310,
    battleNote: "빠른 스피드와 특수 성향이 눈에 띄는 풀 타입으로, 최종진화형 나무킹은 빠른 템포의 공격형 운영이 잘 맞는다.",
    evolution: { evoLevel: 16, nextEvoId: 53 },
    ability: null,
    appearance: { outer: "transparent", core: "#78C850", bars: ["#2E8B57", "#A3D977"] },
    moves: [
      {
        nameKo: "흡수",
        nameEn: "Absorb",
        power: 20,
        accuracy: 100,
        type: "풀",
        category: "특수",
        pp: 25,
        description: "상대의 생명력을 조금 흡수한다. (A nutrient-draining attack.)"
      },
      {
        nameKo: "전광석화",
        nameEn: "Quick Attack",
        power: 40,
        accuracy: 100,
        type: "노말",
        category: "물리",
        pp: 30,
        description: "재빠르게 들이받아 먼저 공격한다. (An almost invisibly fast attack that always goes first.)"
      },
      {
        nameKo: "메가드레인",
        nameEn: "Mega Drain",
        power: 40,
        accuracy: 100,
        type: "풀",
        category: "특수",
        pp: 15,
        description: "상대의 생명력을 빨아들여 자신을 회복한다. (Drains half the damage dealt to restore HP.)"
      }
    ]
  },
  {
    id: 53,
    nameKo: "나무돌이",
    nameEn: "Grovyle",
    finalFormKo: "나무킹",
    finalFormEn: "Sceptile",
    type: ["풀"],
    stats: { hp: 50, attack: 65, defense: 45, spAttack: 85, spDefense: 65, speed: 95 },
    statTotal: 405,
    battleNote: "스피드와 특수공격이 크게 올라 먼저 치고 빠지기 좋으며, 최종진화형 나무킹은 빠른 풀 어태커로 쓰기 쉽다.",
    evolution: { evoLevel: 36, nextEvoId: 54 },
    ability: null,
    appearance: { outer: "transparent", core: "#78C850", bars: ["#2E8B57", "#A3D977"] },
    moves: [
      {
        nameKo: "리프블레이드",
        nameEn: "Leaf Blade",
        power: 90,
        accuracy: 100,
        type: "풀",
        category: "물리",
        pp: 15,
        description: "예리한 잎으로 적을 베어 공격한다. (Slashes with a sharp leaf blade.)"
      },
      {
        nameKo: "전광석화",
        nameEn: "Quick Attack",
        power: 40,
        accuracy: 100,
        type: "노말",
        category: "물리",
        pp: 30,
        description: "재빠르게 들이받아 먼저 공격한다. (An almost invisibly fast attack that always goes first.)"
      },
      {
        nameKo: "이상한빛",
        nameEn: "Double Team",
        power: null,
        accuracy: null,
        type: "노말",
        category: "변화",
        pp: 15,
        description: "분신을 늘려 회피율을 올린다. (Creates illusory copies to raise evasion.)",
        logicExplanation: "공식: user.stages.evasion += 1 / 규칙: 사용자의 회피율 1랭크 상승"
      }
    ]
  },
  {
    id: 54,
    nameKo: "나무킹",
    nameEn: "Sceptile",
    finalFormKo: "나무킹",
    finalFormEn: "Sceptile",
    type: ["풀"],
    stats: { hp: 70, attack: 85, defense: 65, spAttack: 105, spDefense: 85, speed: 120 },
    statTotal: 530,
    battleNote: "매우 빠른 스피드와 준수한 특수 화력을 갖춘 풀 타입 스위퍼로, 선공 압박과 교란이 강점이다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: null,
    appearance: { outer: "transparent", core: "#78C850", bars: ["#2E8B57", "#7ED957"] },
    moves: [
      {
        nameKo: "리프블레이드",
        nameEn: "Leaf Blade",
        power: 90,
        accuracy: 100,
        type: "풀",
        category: "물리",
        pp: 15,
        description: "예리한 잎으로 적을 베어 공격한다. (Slashes with a sharp leaf blade.)"
      },
      {
        nameKo: "용의파동",
        nameEn: "Dragon Pulse",
        power: 85,
        accuracy: 100,
        type: "드래곤",
        category: "특수",
        pp: 10,
        description: "용의 충격파를 날려 공격한다. (A shockwave generated by the user's released dragon power.)"
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
        logicExplanation: "공식: user.stages.attack += 2 / 규칙: 사용자의 공격력 2랭크 상승"
      }
    ]
  },
  {
    id: 55,
    nameKo: "아차모",
    nameEn: "Torchic",
    finalFormKo: "번치코",
    finalFormEn: "Blaziken",
    type: ["불꽃"],
    stats: { hp: 45, attack: 60, defense: 40, spAttack: 70, spDefense: 50, speed: 45 },
    statTotal: 310,
    battleNote: "공격과 특수공격이 모두 가능해 초반부터 형태가 유동적이고, 최종진화형 번치코는 물리 중심 불꽃/격투 에이스로 유명하다.",
    evolution: { evoLevel: 16, nextEvoId: 56 },
    ability: null,
    appearance: { outer: "transparent", core: "#F08030", bars: ["#FFFFFF", "#C04020"] },
    moves: [
      {
        nameKo: "불꽃세례",
        nameEn: "Ember",
        power: 40,
        accuracy: 100,
        type: "불꽃",
        category: "특수",
        pp: 25,
        description: "작은 불꽃을 쏘아 공격한다. (A weak fire attack that may burn the foe.)"
      },
      {
        nameKo: "할퀴기",
        nameEn: "Scratch",
        power: 40,
        accuracy: 100,
        type: "노말",
        category: "물리",
        pp: 35,
        description: "날카로운 발톱으로 긁어 공격한다. (Scratches the target with sharp claws.)"
      },
      {
        nameKo: "마무리차기",
        nameEn: "Feint",
        power: 30,
        accuracy: 100,
        type: "노말",
        category: "물리",
        pp: 10,
        description: "상대의 방어를 허무는 재빠른 공격이다. (An attack that also breaks through protection effects.)"
      }
    ]
  },
  {
    id: 56,
    nameKo: "영치코",
    nameEn: "Combusken",
    finalFormKo: "번치코",
    finalFormEn: "Blaziken",
    type: ["불꽃", "격투"],
    stats: { hp: 60, attack: 85, defense: 60, spAttack: 85, spDefense: 60, speed: 55 },
    statTotal: 405,
    battleNote: "불꽃과 격투 양쪽 화력을 모두 활용할 수 있는 중간 단계로, 최종진화형 번치코는 강력한 물리 돌파형으로 이어진다.",
    evolution: { evoLevel: 36, nextEvoId: 57 },
    ability: null,
    appearance: { outer: "transparent", core: "#F08030", bars: ["#C04020", "#F2D6A2"] },
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
        nameKo: "불꽃펀치",
        nameEn: "Fire Punch",
        power: 75,
        accuracy: 100,
        type: "불꽃",
        category: "물리",
        pp: 15,
        description: "불꽃을 머금은 주먹으로 친다. (Punches the target with a fiery fist.)"
      },
      {
        nameKo: "발차기",
        nameEn: "Double Kick",
        power: 30,
        accuracy: 100,
        type: "격투",
        category: "물리",
        pp: 30,
        description: "두 번 연속으로 발차기를 날린다. (Kicks the target twice in succession.)"
      }
    ]
  },
  {
    id: 57,
    nameKo: "번치코",
    nameEn: "Blaziken",
    finalFormKo: "번치코",
    finalFormEn: "Blaziken",
    type: ["불꽃", "격투"],
    stats: { hp: 80, attack: 120, defense: 70, spAttack: 110, spDefense: 70, speed: 80 },
    statTotal: 530,
    battleNote: "높은 공격과 특수공격을 모두 활용할 수 있는 강력한 불꽃/격투 포켓몬으로, 칼춤이나 가속 계열 전개가 특히 위협적이다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: null,
    appearance: { outer: "transparent", core: "#F08030", bars: ["#C04020", "#F2D6A2"] },
    moves: [
      {
        nameKo: "플레어드라이브",
        nameEn: "Flare Blitz",
        power: 120,
        accuracy: 100,
        type: "불꽃",
        category: "물리",
        pp: 15,
        description: "몸 전체를 불꽃으로 둘러 돌진한다. (Cloaks itself in fire and charges at the target.)"
      },
      {
        nameKo: "인파이트",
        nameEn: "Close Combat",
        power: 120,
        accuracy: 100,
        type: "격투",
        category: "물리",
        pp: 5,
        description: "온몸을 던져 근접전으로 압박한다. (A reckless, full-power physical attack.)"
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
        logicExplanation: "공식: user.stages.attack += 2 / 규칙: 사용자의 공격력 2랭크 상승"
      }
    ]
  },
  {
    id: 58,
    nameKo: "물짱이",
    nameEn: "Mudkip",
    finalFormKo: "대짱이",
    finalFormEn: "Swampert",
    type: ["물"],
    stats: { hp: 50, attack: 70, defense: 50, spAttack: 50, spDefense: 50, speed: 40 },
    statTotal: 310,
    battleNote: "내구와 공격이 안정적으로 올라가는 초반 물 포켓몬으로, 최종진화형 대짱이는 물리형 물/땅 탱커 겸 브레이커로 강하다.",
    evolution: { evoLevel: 16, nextEvoId: 59 },
    ability: null,
    appearance: { outer: "transparent", core: "#6890F0", bars: ["#8B5A2B", "#6CA0DC"] },
    moves: [
      {
        nameKo: "물대포",
        nameEn: "Water Gun",
        power: 40,
        accuracy: 100,
        type: "물",
        category: "특수",
        pp: 25,
        description: "물을 발사해 공격한다. (Squirts water to attack.)"
      },
      {
        nameKo: "진흙뿌리기",
        nameEn: "Mud-Slap",
        power: 20,
        accuracy: 100,
        type: "땅",
        category: "특수",
        pp: 10,
        description: "진흙을 뿌려 공격하고 명중률을 낮춘다. (Hurls mud to attack and lower accuracy.)"
      },
      {
        nameKo: "몸통박치기",
        nameEn: "Tackle",
        power: 50,
        accuracy: 100,
        type: "노말",
        category: "물리",
        pp: 35,
        description: "온몸을 던져 부딪친다. (A physical attack in which the user charges.)"
      }
    ]
  },
  {
    id: 59,
    nameKo: "늪짱이",
    nameEn: "Marshtomp",
    finalFormKo: "대짱이",
    finalFormEn: "Swampert",
    type: ["물", "땅"],
    stats: { hp: 70, attack: 85, defense: 70, spAttack: 60, spDefense: 70, speed: 50 },
    statTotal: 405,
    battleNote: "물/땅 조합으로 공격 범위와 안정성이 크게 좋아지며, 최종진화형 대짱이는 지진과 물 기술을 함께 쓰는 강한 물리형이다.",
    evolution: { evoLevel: 36, nextEvoId: 60 },
    ability: null,
    appearance: { outer: "transparent", core: "#6890F0", bars: ["#8B5A2B", "#4E7F5A"] },
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
        nameKo: "물의파동",
        nameEn: "Water Pulse",
        power: 60,
        accuracy: 100,
        type: "물",
        category: "특수",
        pp: 20,
        description: "물의 파동으로 공격하며 혼란을 노린다. (Attacks with a pulsing blast of water.)"
      },
      {
        nameKo: "땅고르기",
        nameEn: "Bulldoze",
        power: 60,
        accuracy: 100,
        type: "땅",
        category: "물리",
        pp: 20,
        description: "땅을 흔들어 공격하고 스피드를 낮출 수 있다. (Stomps the ground and may lower Speed.)"
      }
    ]
  },
  {
    id: 60,
    nameKo: "대짱이",
    nameEn: "Swampert",
    finalFormKo: "대짱이",
    finalFormEn: "Swampert",
    type: ["물", "땅"],
    stats: { hp: 100, attack: 110, defense: 90, spAttack: 85, spDefense: 90, speed: 60 },
    statTotal: 535,
    battleNote: "내구와 화력이 모두 안정적인 물/땅 타입 에이스로, 지진과 물 기술을 번갈아 쓰며 넓은 상성 커버를 노리기 좋다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: null,
    appearance: { outer: "transparent", core: "#6890F0", bars: ["#8B5A2B", "#4E7F5A"] },
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
        nameKo: "파도타기",
        nameEn: "Surf",
        power: 95,
        accuracy: 100,
        type: "물",
        category: "특수",
        pp: 15,
        description: "큰 파도로 넓게 공격한다. (Hits everything around the user with a giant wave.)"
      },
      {
        nameKo: "얼음펀치",
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
    id: 61,
    nameKo: "찌르꼬",
    nameEn: "Starly",
    finalFormKo: "찌르호크",
    finalFormEn: "Staraptor",
    type: ["노말", "비행"],
    stats: { hp: 40, attack: 55, defense: 30, spAttack: 30, spDefense: 30, speed: 60 },
    statTotal: 245,
    battleNote: "초반부터 빠르게 굴리기 쉬운 노말/비행 포켓몬으로, 최종진화형 찌르호크는 강한 물리 화력과 우선권 압박이 특징이다.",
    evolution: { evoLevel: 14, nextEvoId: 62 },
    ability: null,
    appearance: { outer: "transparent", core: "#A89078", bars: ["#2F2F2F", "#D9C27A"] },
    moves: [
      {
        nameKo: "몸통박치기",
        nameEn: "Tackle",
        power: 50,
        accuracy: 100,
        type: "노말",
        category: "물리",
        pp: 35,
        description: "온몸을 던져 부딪친다. (A physical attack in which the user charges.)"
      },
      {
        nameKo: "전광석화",
        nameEn: "Quick Attack",
        power: 40,
        accuracy: 100,
        type: "노말",
        category: "물리",
        pp: 30,
        description: "재빠르게 들이받아 먼저 공격한다. (An almost invisibly fast attack that always goes first.)"
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
    id: 62,
    nameKo: "찌르버드",
    nameEn: "Staravia",
    finalFormKo: "찌르호크",
    finalFormEn: "Staraptor",
    type: ["노말", "비행"],
    stats: { hp: 55, attack: 75, defense: 50, spAttack: 40, spDefense: 40, speed: 80 },
    statTotal: 340,
    battleNote: "물리 화력이 올라가며 빠른 비행 압박이 가능해지고, 최종진화형 찌르호크는 강제 교환과 강한 일격이 모두 위협적이다.",
    evolution: { evoLevel: 34, nextEvoId: 63 },
    ability: null,
    appearance: { outer: "transparent", core: "#A89078", bars: ["#444444", "#D9C27A"] },
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
        nameKo: "날개쉬기",
        nameEn: "Roost",
        power: null,
        accuracy: null,
        type: "비행",
        category: "변화",
        pp: 10,
        description: "날개를 쉬게 하며 체력을 회복한다. (Restores HP and makes the user lose its Flying type until end of turn.)",
        logicExplanation: "공식: heal = floor(user.maxHP / 2); user.hp = min(user.maxHP, user.hp + heal); user.typeFlyingDisabledUntilEndOfTurn = true / 규칙: 회복량은 최대 HP의 50%, 비행 타입 상실은 그 턴에만 적용"
      },
      {
        nameKo: "제비반환",
        nameEn: "Aerial Ace",
        power: 60,
        accuracy: null,
        type: "비행",
        category: "물리",
        pp: 20,
        description: "빠르고 정확한 비행 공격을 한다. (An extremely fast attack that never misses.)"
      }
    ]
  },
  {
    id: 63,
    nameKo: "찌르호크",
    nameEn: "Staraptor",
    finalFormKo: "찌르호크",
    finalFormEn: "Staraptor",
    type: ["노말", "비행"],
    stats: { hp: 85, attack: 120, defense: 70, spAttack: 50, spDefense: 60, speed: 100 },
    statTotal: 485,
    battleNote: "초반 성능이 아니라 완성형 기준으로는 매우 강한 물리 비행 어태커이며, 브레이브버드와 인파이트로 정면 돌파가 쉽다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: null,
    appearance: { outer: "transparent", core: "#A89078", bars: ["#2F2F2F", "#D9C27A"] },
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
        nameKo: "인파이트",
        nameEn: "Close Combat",
        power: 120,
        accuracy: 100,
        type: "격투",
        category: "물리",
        pp: 5,
        description: "온몸을 던져 근접전으로 압박한다. (A reckless, full-power physical attack.)"
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
        logicExplanation: "공식: heal = floor(user.maxHP / 2); user.hp = min(user.maxHP, user.hp + heal); user.typeFlyingDisabledUntilEndOfTurn = true / 규칙: 회복량은 최대 HP의 50%, 비행 타입 상실은 그 턴에만 적용"
      }
    ]
  },
  {
    id: 64,
    nameKo: "구구",
    nameEn: "Pidgey",
    finalFormKo: "피죤투",
    finalFormEn: "Pidgeot",
    type: ["노말", "비행"],
    stats: { hp: 40, attack: 45, defense: 40, spAttack: 35, spDefense: 35, speed: 56 },
    statTotal: 251,
    battleNote: "가벼운 비행 견제와 교란을 배우는 초반 포켓몬으로, 최종진화형 피죤투는 안정적인 비행 압박과 유틸이 강하다.",
    evolution: { evoLevel: 18, nextEvoId: 65 },
    ability: null,
    appearance: { outer: "transparent", core: "#C2A36B", bars: ["#7A5C3E", "#D9D0C5"] },
    moves: [
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
        nameKo: "전광석화",
        nameEn: "Quick Attack",
        power: 40,
        accuracy: 100,
        type: "노말",
        category: "물리",
        pp: 30,
        description: "재빠르게 들이받아 먼저 공격한다. (An almost invisibly fast attack that always goes first.)"
      },
      {
        nameKo: "날려버리기",
        nameEn: "Whirlwind",
        power: null,
        accuracy: null,
        type: "노말",
        category: "변화",
        pp: 20,
        description: "상대를 강제로 교체시킨다. (Blows away the target and forces a switch.)",
        logicExplanation: "공식: if target.canBeForcedOut: switch(target) / 규칙: 상대가 교체 불가 상태면 실패, 야생전에서는 전투 종료 처리 가능"
      }
    ]
  },
  {
    id: 65,
    nameKo: "피죤",
    nameEn: "Pidgeotto",
    finalFormKo: "피죤투",
    finalFormEn: "Pidgeot",
    type: ["노말", "비행"],
    stats: { hp: 63, attack: 60, defense: 55, spAttack: 50, spDefense: 50, speed: 71 },
    statTotal: 349,
    battleNote: "스피드가 올라가며 선공 견제가 쉬워지고, 최종진화형 피죤투는 순수 비행 압박과 보조기를 함께 쓰기 좋다.",
    evolution: { evoLevel: 36, nextEvoId: 66 },
    ability: null,
    appearance: { outer: "transparent", core: "#C2A36B", bars: ["#7A5C3E", "#CFC5B8"] },
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
        nameKo: "날개흩날리기",
        nameEn: "Feather Dance",
        power: null,
        accuracy: 100,
        type: "비행",
        category: "변화",
        pp: 15,
        description: "깃털을 흩날려 상대의 공격을 크게 낮춘다. (Scatters feathers to sharply lower the target's Attack.)",
        logicExplanation: "공식: target.stages.attack -= 2 / 규칙: 대상의 공격력을 2랭크 하락 (중첩 가능)"
      },
      {
        nameKo: "제비반환",
        nameEn: "Aerial Ace",
        power: 60,
        accuracy: null,
        type: "비행",
        category: "물리",
        pp: 20,
        description: "빠르고 정확한 비행 공격을 한다. (An extremely fast attack that never misses.)"
      }
    ]
  },
  {
    id: 66,
    nameKo: "피죤투",
    nameEn: "Pidgeot",
    finalFormKo: "피죤투",
    finalFormEn: "Pidgeot",
    type: ["노말", "비행"],
    stats: { hp: 83, attack: 80, defense: 75, spAttack: 70, spDefense: 70, speed: 101 },
    statTotal: 479,
    battleNote: "빠른 스피드와 무난한 화력을 바탕으로 교란과 압박을 함께 맡기 좋은 비행형 에이스다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: null,
    appearance: { outer: "transparent", core: "#C2A36B", bars: ["#7A5C3E", "#D9D0C5"] },
    moves: [
      {
        nameKo: "폭풍",
        nameEn: "Hurricane",
        power: 110,
        accuracy: 70,
        type: "비행",
        category: "특수",
        pp: 10,
        description: "거센 폭풍을 일으켜 공격한다. (Swings a gigantic wind to blow away the target.)"
      },
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
        nameKo: "날개쉬기",
        nameEn: "Roost",
        power: null,
        accuracy: null,
        type: "비행",
        category: "변화",
        pp: 10,
        description: "날개를 쉬게 하며 체력을 회복한다. (Restores HP and makes the user lose its Flying type until end of turn.)",
        logicExplanation: "공식: heal = floor(user.maxHP / 2); user.hp = min(user.maxHP, user.hp + heal); user.typeFlyingDisabledUntilEndOfTurn = true / 규칙: 회복량은 최대 HP의 50%, 비행 타입 상실은 그 턴에만 적용"
      }
    ]
  },
  {
    id: 67,
    nameKo: "파비꼬",
    nameEn: "Swablu",
    finalFormKo: "파비코리",
    finalFormEn: "Altaria",
    type: ["노말", "비행"],
    stats: { hp: 45, attack: 40, defense: 60, spAttack: 40, spDefense: 75, speed: 50 },
    statTotal: 310,
    battleNote: "부드러운 내구형 초반 포켓몬으로, 최종진화형 파비코리는 벌키한 드래곤/비행 형태로 바뀌어 오래 버티며 싸우기 좋다.",
    evolution: { evoLevel: 35, nextEvoId: 68 },
    ability: null,
    appearance: { outer: "transparent", core: "#FFFFFF", bars: ["#87CEEB", "#E6E6E6"] },
    moves: [
      {
        nameKo: "날개치기",
        nameEn: "Peck",
        power: 35,
        accuracy: 100,
        type: "비행",
        category: "물리",
        pp: 35,
        description: "부리로 쪼아 공격한다. (Attacks with a jabbing beak.)"
      },
      {
        nameKo: "노래하기",
        nameEn: "Sing",
        power: null,
        accuracy: 55,
        type: "노말",
        category: "변화",
        pp: 15,
        description: "상대를 잠재우는 노래를 부른다. (A soothing song lulls the target into sleep.)",
        logicExplanation: "공식: if hit: target.status = 'sleep'; target.sleepTurns = random(1,3) / 규칙: 대상을 무작위 1~3턴간 수면 상태로 만듦"
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
        logicExplanation: "공식: heal = floor(user.maxHP / 2); user.hp = min(user.maxHP, user.hp + heal); user.typeFlyingDisabledUntilEndOfTurn = true / 규칙: 회복량은 최대 HP의 50%, 비행 타입 상실은 그 턴에만 적용"
      }
    ]
  },
  {
    id: 68,
    nameKo: "파비코",
    nameEn: "Altaria",
    finalFormKo: "파비코리",
    finalFormEn: "Altaria",
    type: ["드래곤", "비행"],
    stats: { hp: 75, attack: 70, defense: 90, spAttack: 70, spDefense: 105, speed: 80 },
    statTotal: 490,
    battleNote: "내구가 좋고 용의춤으로도 굴릴 수 있는 벌키 드래곤/비행 타입으로, 회복기와 축적형 전개가 잘 맞는다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: null,
    appearance: { outer: "transparent", core: "#87CEEB", bars: ["#FFFFFF", "#B9E3F2"] },
    moves: [
      {
        nameKo: "용의파동",
        nameEn: "Dragon Pulse",
        power: 85,
        accuracy: 100,
        type: "드래곤",
        category: "특수",
        pp: 10,
        description: "용의 충격파를 날려 공격한다. (A shockwave generated by the user's released dragon power.)"
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
        logicExplanation: "공식: user.stages.attack += 1; user.stages.speed += 1 / 규칙: 사용자의 공격력과 스피드 각각 1랭크 상승"
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
        logicExplanation: "공식: heal = floor(user.maxHP / 2); user.hp = min(user.maxHP, user.hp + heal); user.typeFlyingDisabledUntilEndOfTurn = true / 규칙: 회복량은 최대 HP의 50%, 비행 타입 상실은 그 턴에만 적용"
      }
    ]
  },
  {
    id: 69,
    nameKo: "파비코리",
    nameEn: "Altaria",
    finalFormKo: "파비코리",
    finalFormEn: "Altaria",
    type: ["드래곤", "비행"],
    stats: { hp: 75, attack: 70, defense: 90, spAttack: 70, spDefense: 105, speed: 80 },
    statTotal: 490,
    battleNote: "사용자 표기상 파비코리 항목으로 반영한 최종 형태이며, 벌키한 내구와 보조 기술로 오래 버티며 싸우는 운영이 강하다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: null,
    appearance: { outer: "transparent", core: "#87CEEB", bars: ["#FFFFFF", "#B9E3F2"] },
    moves: [
      {
        nameKo: "용의파동",
        nameEn: "Dragon Pulse",
        power: 85,
        accuracy: 100,
        type: "드래곤",
        category: "특수",
        pp: 10,
        description: "용의 충격파를 날려 공격한다. (A shockwave generated by the user's released dragon power.)"
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
        logicExplanation: "공식: cost = floor(user.maxHP / 4); if user.hp > cost: user.hp -= cost; user.substituteHP = cost / 규칙: 분신이 대신 피해를 받음"
      },
      {
        nameKo: "코튼가드",
        nameEn: "Cotton Guard",
        power: null,
        accuracy: null,
        type: "풀",
        category: "변화",
        pp: 10,
        description: "솜으로 몸을 감싸 방어를 크게 올린다. (Boosts Defense sharply by wrapping the user in cotton.)",
        logicExplanation: "공식: user.stages.defense += 3 / 규칙: 사용자의 방어력 3랭크 대폭 상승 (중첩 가능)"
      }
    ]
  },
  {
    id: 70,
    nameKo: "두개도스",
    nameEn: "Cranidos",
    finalFormKo: "램펄드",
    finalFormEn: "Rampardos",
    type: ["바위"],
    stats: { hp: 67, attack: 125, defense: 40, spAttack: 30, spDefense: 30, speed: 58 },
    statTotal: 350,
    battleNote: "공격이 매우 높아 육성 직후부터 한 방 화력이 좋고, 최종진화형 램펄드는 전형적인 극딜 물리 바위 포켓몬이다.",
    evolution: { evoLevel: 30, nextEvoId: 71 },
    ability: null,
    appearance: { outer: "transparent", core: "#A38C21", bars: ["#1E4A7A", "#D9C27A"] },
    moves: [
      {
        nameKo: "박치기",
        nameEn: "Headbutt",
        power: 70,
        accuracy: 100,
        type: "노말",
        category: "물리",
        pp: 15,
        description: "머리로 강하게 들이받는다. (A physical attack using the head.)"
      },
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
        nameKo: "로케트박치기",
        nameEn: "Zen Headbutt",
        power: 80,
        accuracy: 90,
        type: "에스퍼",
        category: "물리",
        pp: 15,
        description: "정신을 집중한 머리로 들이받는다. (Strikes the target with a strong headbutt.)"
      }
    ]
  },
  {
    id: 71,
    nameKo: "램펄드",
    nameEn: "Rampardos",
    finalFormKo: "램펄드",
    finalFormEn: "Rampardos",
    type: ["바위"],
    stats: { hp: 97, attack: 165, defense: 60, spAttack: 65, spDefense: 50, speed: 58 },
    statTotal: 495,
    battleNote: "매우 높은 공격으로 한 방의 위력이 엄청난 바위 타입 브레이커이며, 명중 보조나 교환 압박을 곁들이면 쓰기 쉽다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: null,
    appearance: { outer: "transparent", core: "#A38C21", bars: ["#1E4A7A", "#C9A76A"] },
    moves: [
      {
        nameKo: "돌머리",
        nameEn: "Head Smash",
        power: 150,
        accuracy: 80,
        type: "바위",
        category: "물리",
        pp: 5,
        description: "온몸을 던져 머리로 들이받는다. (A reckless, all-out charge headbutt.)"
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
        nameKo: "스톤샤워",
        nameEn: "Rock Slide",
        power: 75,
        accuracy: 90,
        type: "바위",
        category: "물리",
        pp: 10,
        description: "거대한 돌을 굴려 공격한다. (Large boulders are hurled at the target.)"
      }
    ]
  },
  {
    id: 72,
    nameKo: "빈티나",
    nameEn: "Feebas",
    finalFormKo: "밀로틱",
    finalFormEn: "Milotic",
    type: ["물"],
    stats: { hp: 20, attack: 15, defense: 20, spAttack: 10, spDefense: 55, speed: 80 },
    statTotal: 200,
    battleNote: "초반 성능은 매우 약하지만 성장 후에는 극단적으로 아름답고 단단한 특수 탱커로 바뀌는 육성형 포켓몬이다.",
    evolution: { evoLevel: null, nextEvoId: 73 },
    ability: null,
    appearance: { outer: "transparent", core: "#A040A0", bars: ["#C8A0D0", "#F2E6D8"] },
    moves: [
      {
        nameKo: "튀어오르기",
        nameEn: "Splash",
        power: null,
        accuracy: null,
        type: "노말",
        category: "변화",
        pp: 40,
        description: "아무 효과도 없이 튀어 오른다. (Splashs around with no effect at all.)"
      },
      {
        nameKo: "몸통박치기",
        nameEn: "Tackle",
        power: 50,
        accuracy: 100,
        type: "노말",
        category: "물리",
        pp: 35,
        description: "온몸을 던져 부딪친다. (A physical attack in which the user charges.)"
      },
      {
        nameKo: "반동",
        nameEn: "Flail",
        power: null,
        accuracy: 100,
        type: "노말",
        category: "물리",
        pp: 15,
        description: "남은 체력이 적을수록 더 강하게 발악한다. (The lower the user's HP, the greater the damage.)"
      }
    ]
  },
  {
    id: 73,
    nameKo: "밀로틱",
    nameEn: "Milotic",
    finalFormKo: "밀로틱",
    finalFormEn: "Milotic",
    type: ["물"],
    stats: { hp: 95, attack: 60, defense: 79, spAttack: 100, spDefense: 125, speed: 81 },
    statTotal: 540,
    battleNote: "높은 특수 내구와 회복기를 바탕으로 안정적으로 버티는 물 타입 대표 포켓몬이며, 특수 공격과 회복의 균형이 좋다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: null,
    appearance: { outer: "transparent", core: "#6890F0", bars: ["#F2D2D2", "#B7E3F4"] },
    moves: [
      {
        nameKo: "파도타기",
        nameEn: "Surf",
        power: 95,
        accuracy: 100,
        type: "물",
        category: "특수",
        pp: 15,
        description: "큰 파도로 넓게 공격한다. (Hits everything around the user with a giant wave.)"
      },
      {
        nameKo: "HP회복",
        nameEn: "Recover",
        power: null,
        accuracy: null,
        type: "노말",
        category: "변화",
        pp: 10,
        description: "자신의 체력을 크게 회복한다. (Restores half of the user's maximum HP.)",
        logicExplanation: "공식: heal = floor(user.maxHP / 2); user.hp = min(user.maxHP, user.hp + heal) / 규칙: 회복량은 최대 HP의 50%, 최대 HP를 초과하지 않음"
      },
      {
        nameKo: "아쿠아링",
        nameEn: "Aqua Ring",
        power: null,
        accuracy: null,
        type: "물",
        category: "변화",
        pp: 20,
        description: "물의 고리로 둘러싸여 매 턴 체력을 회복한다. (Restores a little HP every turn.)",
        logicExplanation: "공식: endTurnHeal = floor(user.maxHP / 16); user.hp = min(user.maxHP, user.hp + endTurnHeal) / 규칙: 매 턴 종료 시 전체 체력의 1/16 회복"
      }
    ]
  },
  {
    id: 74,
    nameKo: "샤프니아",
    nameEn: "Carvanha",
    finalFormKo: "샤크니아",
    finalFormEn: "Sharpedo",
    type: ["물", "악"],
    stats: { hp: 45, attack: 90, defense: 20, spAttack: 65, spDefense: 20, speed: 65 },
    statTotal: 305,
    battleNote: "공격 성향이 강하고 빠른 편이라 초반부터 날카롭게 압박하기 좋으며, 최종진화형 샤크니아는 빠른 물리/특수 양면 압박이 가능하다.",
    evolution: { evoLevel: 30, nextEvoId: 75 },
    ability: null,
    appearance: { outer: "transparent", core: "#6890F0", bars: ["#8B0000", "#1E3A5F"] },
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
        nameKo: "아쿠아제트",
        nameEn: "Aqua Jet",
        power: 40,
        accuracy: 100,
        type: "물",
        category: "물리",
        pp: 20,
        description: "물줄기를 몸처럼 둘러 빠르게 돌진한다. (Strikes the foe with a high-speed current.)"
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
    id: 75,
    nameKo: "샤크니아",
    nameEn: "Sharpedo",
    finalFormKo: "샤크니아",
    finalFormEn: "Sharpedo",
    type: ["물", "악"],
    stats: { hp: 70, attack: 120, defense: 40, spAttack: 95, spDefense: 40, speed: 95 },
    statTotal: 460,
    battleNote: "높은 공격과 속도로 순식간에 물리 압박을 거는 포켓몬이며, 교환전에서도 위협적인 악/물 타입 스위퍼다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: null,
    appearance: { outer: "transparent", core: "#6890F0", bars: ["#8B0000", "#1E3A5F"] },
    moves: [
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
        nameKo: "폭포오르기",
        nameEn: "Waterfall",
        power: 80,
        accuracy: 100,
        type: "물",
        category: "물리",
        pp: 15,
        description: "거센 폭포처럼 상대를 덮친다. (Charges the target with a powerful splash.)"
      },
      {
        nameKo: "방어",
        nameEn: "Protect",
        power: null,
        accuracy: null,
        type: "노말",
        category: "변화",
        pp: 10,
        description: "그 턴의 대부분의 공격을 막아낸다. (Completely protects the user from most attacks.)",
        logicExplanation: "공식: user.isProtected = true / 규칙: 이번 턴의 공격을 막음, 연속 사용 시 성공률 감소"
      }
    ]
  },
  {
    id: 76,
    nameKo: "화강돌",
    nameEn: "Spiritomb",
    finalFormKo: "화강돌",
    finalFormEn: "Spiritomb",
    type: ["고스트", "악"],
    stats: { hp: 50, attack: 92, defense: 108, spAttack: 92, spDefense: 108, speed: 35 },
    statTotal: 485,
    battleNote: "내구가 균형 있게 높고 교란 수단이 많아 버티면서 상대를 조금씩 무너뜨리는 운영에 잘 맞는다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: null,
    appearance: { outer: "transparent", core: "#705898", bars: ["#3A2A50", "#8B6F9E"] },
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
        nameKo: "나쁜꿈",
        nameEn: "Pain Split",
        power: null,
        accuracy: null,
        type: "노말",
        category: "변화",
        pp: 20,
        description: "양측의 체력을 평균화해 재분배한다. (The user and target share their current HP.)",
        logicExplanation: "공식: avg = floor((user.hp + target.hp) / 2); user.hp = avg; target.hp = avg / 규칙: 최대 HP가 아닌 현재 HP를 기준으로 양측 체력을 동일하게 맞춤"
      }
    ]
  },
  {
    id: 77,
    nameKo: "나옹",
    nameEn: "Meowth",
    finalFormKo: "페르시온",
    finalFormEn: "Persian",
    type: ["노말"],
    stats: { hp: 40, attack: 45, defense: 35, spAttack: 40, spDefense: 40, speed: 90 },
    statTotal: 290,
    battleNote: "빠른 스피드로 선공 보조와 견제가 가능하며, 최종진화형 페르시온은 기동성이 좋아 교란형 운영에 잘 맞는다.",
    evolution: { evoLevel: 28, nextEvoId: 78 },
    ability: null,
    appearance: { outer: "transparent", core: "#C0A070", bars: ["#2D2D2D", "#E8D7A8"] },
    moves: [
      {
        nameKo: "할퀴기",
        nameEn: "Scratch",
        power: 40,
        accuracy: 100,
        type: "노말",
        category: "물리",
        pp: 35,
        description: "날카로운 발톱으로 긁어 공격한다. (Scratches the target with sharp claws.)"
      },
      {
        nameKo: "속임수",
        nameEn: "Fake Out",
        power: 40,
        accuracy: 100,
        type: "노말",
        category: "물리",
        pp: 10,
        description: "첫 턴에만 우선 행동해 상대를 움찔하게 만든다. (A trick that hits first and causes flinching if used right away.)",
        logicExplanation: "공식: if user.isFirstTurnOut: damage; target.flinch = true / 규칙: 첫 턴이 아니면 실패, 우선순위는 매우 높게 처리"
      },
      {
        nameKo: "도발",
        nameEn: "Taunt",
        power: null,
        accuracy: 100,
        type: "악",
        category: "변화",
        pp: 20,
        description: "도발해 상대의 변화기 사용을 막는다. (Taunts the target into only using attacks.)",
        logicExplanation: "공식: target.tauntTurns = 3 / 규칙: 지속 턴 동안 상태기술 사용 불가, 공격기만 선택 가능"
      }
    ]
  },
  {
    id: 78,
    nameKo: "페르시온",
    nameEn: "Persian",
    finalFormKo: "페르시온",
    finalFormEn: "Persian",
    type: ["노말"],
    stats: { hp: 65, attack: 70, defense: 60, spAttack: 65, spDefense: 65, speed: 115 },
    statTotal: 440,
    battleNote: "스피드가 매우 높아 선공권을 잡기 좋고, 페인트식 교란과 약한 체력을 빠르게 정리하는 운영이 잘 맞는다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: null,
    appearance: { outer: "transparent", core: "#C0A070", bars: ["#2D2D2D", "#E8D7A8"] },
    moves: [
      {
        nameKo: "할퀴기",
        nameEn: "Slash",
        power: 70,
        accuracy: 100,
        type: "노말",
        category: "물리",
        pp: 20,
        description: "날카로운 발톱으로 베어 공격한다. (Slashes with a sharp claw.)"
      },
      {
        nameKo: "속임수",
        nameEn: "Fake Out",
        power: 40,
        accuracy: 100,
        type: "노말",
        category: "물리",
        pp: 10,
        description: "첫 턴에만 우선 행동해 상대를 움찔하게 만든다. (A trick that hits first and causes flinching if used right away.)",
        logicExplanation: "공식: if user.isFirstTurnOut: damage; target.flinch = true / 규칙: 첫 턴이 아니면 실패, 우선순위는 매우 높게 처리"
      },
      {
        nameKo: "도발",
        nameEn: "Taunt",
        power: null,
        accuracy: 100,
        type: "악",
        category: "변화",
        pp: 20,
        description: "도발해 상대의 변화기 사용을 막는다. (Taunts the target into only using attacks.)",
        logicExplanation: "공식: target.tauntTurns = 3 / 규칙: 지속 턴 동안 상태기술 사용 불가, 공격기만 선택 가능"
      }
    ]
  },
  {
    id: 79,
    nameKo: "버프론",
    nameEn: "Bouffalant",
    finalFormKo: "버프론",
    finalFormEn: "Bouffalant",
    type: ["노말"],
    stats: { hp: 95, attack: 110, defense: 95, spAttack: 40, spDefense: 95, speed: 55 },
    statTotal: 490,
    battleNote: "높은 공격과 내구를 함께 가진 정직한 물리형 노말 포켓몬으로, 강한 일격과 받아치기를 함께 쓰기 좋다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: null,
    appearance: { outer: "transparent", core: "#2A2A2A", bars: ["#8B5A2B", "#C0C0C0"] },
    moves: [
      {
        nameKo: "두개불꽃",
        nameEn: "Head Charge",
        power: 120,
        accuracy: 100,
        type: "노말",
        category: "물리",
        pp: 15,
        description: "머리로 들이받아 강하게 공격한다. (A reckless charge using the head.)"
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
        nameKo: "반격",
        nameEn: "Revenge",
        power: 60,
        accuracy: 100,
        type: "격투",
        category: "물리",
        pp: 10,
        description: "먼저 맞으면 더 강하게 되받아친다. (Inflicts double damage if the user was hit first.)"
      }
    ]
  },
  {
    id: 80,
    nameKo: "루카리오",
    nameEn: "Lucario",
    finalFormKo: "루카리오",
    finalFormEn: "Lucario",
    type: ["격투", "강철"],
    stats: { hp: 70, attack: 110, defense: 70, spAttack: 115, spDefense: 70, speed: 90 },
    statTotal: 525,
    battleNote: "물리와 특수 모두 강한 전형적인 하이브리드 포켓몬으로, 한쪽에 고정하지 않고 상황에 맞춰 돌파와 전개를 섞기 좋다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: null,
    appearance: { outer: "transparent", core: "#1E4A7A", bars: ["#000000", "#A9A9A9"] },
    moves: [
      {
        nameKo: "파동탄",
        nameEn: "Aura Sphere",
        power: 90,
        accuracy: null,
        type: "격투",
        category: "특수",
        pp: 20,
        description: "파동의 힘을 구체로 모아 발사한다. (A hidden power hits the target with an aura blast.)"
      },
      {
        nameKo: "인파이트",
        nameEn: "Close Combat",
        power: 120,
        accuracy: 100,
        type: "격투",
        category: "물리",
        pp: 5,
        description: "온몸을 던져 근접전으로 압박한다. (A reckless, full-power physical attack.)"
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
        logicExplanation: "공식: user.stages.attack += 2 / 규칙: 사용자의 공격력 2랭크 상승"
      }
    ]
  }
];