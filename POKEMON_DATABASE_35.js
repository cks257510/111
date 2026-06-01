const POKEMON_DATABASE_35 = [
  {
    id: 101,
    nameKo: "눈꼬마",
    nameEn: "Snorunt",
    finalFormKo: "얼음귀신",
    finalFormEn: "Glalie",
    type: [
      "얼음"
    ],
    stats: {
      hp: 50,
      attack: 50,
      defense: 50,
      spAttack: 50,
      spDefense: 50,
      speed: 50
    },
    statTotal: 300,
    battleNote: "초반 성능은 매우 약하지만 얼음뭉치와 날씨 보조로 역할을 만들 수 있고, 최종진화형 얼음귀신은 선공권과 교란기를 섞는 형태로 굴리기 쉽다.",
    evolution: {
      evoLevel: 42,
      nextEvoId: 102
    },
    ability: null,
    appearance: {
      outer: "transparent",
      core: "#F5E45A",
      bars: [
        "#111111",
        "#6FB9E8"
      ]
    },
    moves: [
      {
        nameKo: "얼음뭉치",
        nameEn: "Ice Shard",
        power: 40,
        accuracy: 100,
        type: "얼음",
        category: "물리",
        pp: 30,
        description: "작은 얼음 조각을 먼저 던져 공격한다. (Launches a shard of ice that strikes first.)"
      },
      {
        nameKo: "눈보라",
        nameEn: "Blizzard",
        power: 110,
        accuracy: 70,
        type: "얼음",
        category: "특수",
        pp: 5,
        description: "거센 눈보라로 상대를 덮친다. (A howling blizzard strikes the target.)"
      },
      {
        nameKo: "싸라기눈",
        nameEn: "Hail",
        power: null,
        accuracy: null,
        type: "얼음",
        category: "변화",
        pp: 10,
        description: "눈보라가 휘몰아치는 날씨로 바꾼다. (Summons a hailstorm that lasts for several turns.)",
        logicRef: "hail"
      }
    ]
  },
  {
    id: 102,
    nameKo: "얼음귀신",
    nameEn: "Glalie",
    finalFormKo: "얼음귀신",
    finalFormEn: "Glalie",
    type: [
      "얼음"
    ],
    stats: {
      hp: 80,
      attack: 80,
      defense: 80,
      spAttack: 80,
      spDefense: 80,
      speed: 80
    },
    statTotal: 480,
    battleNote: "공격과 내구가 모두 고르게 배분된 얼음 어태커로, 화력보다도 견제 범위와 보조기를 섞는 운영이 편하다.",
    evolution: {
      evoLevel: null,
      nextEvoId: null
    },
    ability: null,
    appearance: {
      outer: "transparent",
      core: "#4B4B4B",
      bars: [
        "#E0C84F",
        "#F4F7FA"
      ]
    },
    moves: [
      {
        nameKo: "얼음엄니",
        nameEn: "Ice Fang",
        power: 65,
        accuracy: 95,
        type: "얼음",
        category: "물리",
        pp: 15,
        description: "얼음이 맺힌 이빨로 물어뜯는다. (Bites with icy fangs.)"
      },
      {
        nameKo: "냉동빔",
        nameEn: "Ice Beam",
        power: 90,
        accuracy: 100,
        type: "얼음",
        category: "특수",
        pp: 10,
        description: "차가운 광선을 쏘아 공격한다. (Fires an icy beam at the target.)"
      },
      {
        nameKo: "철벽",
        nameEn: "Iron Defense",
        power: null,
        accuracy: null,
        type: "강철",
        category: "변화",
        pp: 15,
        description: "몸을 굳혀 방어를 크게 올린다. (Hardens the body to sharply raise Defense.)",
        logicRef: "iron_defense"
      }
    ]
  },
  {
    id: 103,
    nameKo: "꽁어름",
    nameEn: "Bergmite",
    finalFormKo: "크레베이스",
    finalFormEn: "Avalugg",
    type: [
      "얼음"
    ],
    stats: {
      hp: 55,
      attack: 69,
      defense: 85,
      spAttack: 32,
      spDefense: 35,
      speed: 28
    },
    statTotal: 304,
    battleNote: "방어가 높아 물리 견제에 강하고, 최종진화형 크레베이스는 물리 내구를 바탕으로 받아치면서 시간을 버는 벽 역할이 강하다.",
    evolution: {
      evoLevel: 37,
      nextEvoId: 104
    },
    ability: null,
    appearance: {
      outer: "transparent",
      core: "#88B7E6",
      bars: [
        "#4C78A8",
        "#FFFFFF"
      ]
    },
    moves: [
      {
        nameKo: "얼음뭉치",
        nameEn: "Ice Shard",
        power: 40,
        accuracy: 100,
        type: "얼음",
        category: "물리",
        pp: 30,
        description: "작은 얼음 조각을 먼저 던져 공격한다. (Launches a shard of ice that strikes first.)"
      },
      {
        nameKo: "몸통박치기",
        nameEn: "Tackle",
        power: 50,
        accuracy: 100,
        type: "노말",
        category: "물리",
        pp: 35,
        description: "온몸을 던져 부딪친다. (A physical attack in which the user charges and slams into the target.)"
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
        logicRef: "protect"
      }
    ]
  },
  {
    id: 104,
    nameKo: "크레베이스",
    nameEn: "Avalugg",
    finalFormKo: "크레베이스",
    finalFormEn: "Avalugg",
    type: [
      "얼음"
    ],
    stats: {
      hp: 95,
      attack: 117,
      defense: 184,
      spAttack: 44,
      spDefense: 46,
      speed: 28
    },
    statTotal: 514,
    battleNote: "극단적으로 높은 물리 내구를 바탕으로 정면전에서 버티기 좋고, 지진과 얼음 기술로 받아치며 운영하는 전형적인 물리벽이다.",
    evolution: {
      evoLevel: null,
      nextEvoId: null
    },
    ability: null,
    appearance: {
      outer: "transparent",
      core: "#A8C7E7",
      bars: [
        "#5C7FA3",
        "#F3F8FC"
      ]
    },
    moves: [
      {
        nameKo: "눈보라",
        nameEn: "Blizzard",
        power: 110,
        accuracy: 70,
        type: "얼음",
        category: "특수",
        pp: 5,
        description: "거센 눈보라로 상대를 덮친다. (A howling blizzard strikes the target.)"
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
        nameKo: "철벽",
        nameEn: "Iron Defense",
        power: null,
        accuracy: null,
        type: "강철",
        category: "변화",
        pp: 15,
        description: "몸을 굳혀 방어를 크게 올린다. (Hardens the body to sharply raise Defense.)",
        logicRef: "iron_defense"
      }
    ]
  },
  {
    id: 105,
    nameKo: "뮤츠",
    nameEn: "Mewtwo",
    finalFormKo: "뮤츠",
    finalFormEn: "Mewtwo",
    type: [
      "에스퍼"
    ],
    stats: {
      hp: 106,
      attack: 110,
      defense: 90,
      spAttack: 154,
      spDefense: 90,
      speed: 130
    },
    statTotal: 680,
    battleNote: "특수 화력과 스피드가 매우 높아 초반부터 강하게 압박하기 쉬운 전형적 특수 스위퍼다.",
    evolution: {
      evoLevel: null,
      nextEvoId: null
    },
    ability: null,
    appearance: {
      outer: "transparent",
      core: "#C9A0D9",
      bars: [
        "#FFFFFF",
        "#8E5AA8"
      ]
    },
    moves: [
      {
        nameKo: "사이코키네시스",
        nameEn: "Psychic",
        power: 90,
        accuracy: 100,
        type: "에스퍼",
        category: "특수",
        pp: 10,
        description: "강한 초능력으로 상대를 공격한다. (A strong telekinetic attack strikes the target.)"
      },
      {
        nameKo: "기합구슬",
        nameEn: "Focus Blast",
        power: 120,
        accuracy: 70,
        type: "격투",
        category: "특수",
        pp: 5,
        description: "기합을 모아 강한 에너지를 날린다. (A blast of fighting energy is hurled at the target.)"
      },
      {
        nameKo: "회복",
        nameEn: "Recover",
        power: null,
        accuracy: null,
        type: "노말",
        category: "변화",
        pp: 10,
        description: "자신의 체력을 크게 회복한다. (Restores half of the user's maximum HP.)",
        logicRef: "recover"
      }
    ]
  },
  {
    id: 106,
    nameKo: "루기아",
    nameEn: "Lugia",
    finalFormKo: "루기아",
    finalFormEn: "Lugia",
    type: [
      "에스퍼",
      "비행"
    ],
    stats: {
      hp: 106,
      attack: 90,
      defense: 130,
      spAttack: 90,
      spDefense: 154,
      speed: 110
    },
    statTotal: 680,
    battleNote: "막강한 내구와 회복기로 버티면서 전장을 안정시키는 대표적인 방어형 전설 포켓몬이다.",
    evolution: {
      evoLevel: null,
      nextEvoId: null
    },
    ability: null,
    appearance: {
      outer: "transparent",
      core: "#FFFFFF",
      bars: [
        "#3F8BFF",
        "#E8E8E8"
      ]
    },
    moves: [
      {
        nameKo: "에어로블라스트",
        nameEn: "Aeroblast",
        power: 100,
        accuracy: 95,
        type: "비행",
        category: "특수",
        pp: 5,
        description: "압축된 공기탄을 쏘아 공격한다. (Launches a powerful blast of air.)"
      },
      {
        nameKo: "사이코키네시스",
        nameEn: "Psychic",
        power: 90,
        accuracy: 100,
        type: "에스퍼",
        category: "특수",
        pp: 10,
        description: "강한 초능력으로 상대를 공격한다. (A strong telekinetic attack strikes the target.)"
      },
      {
        nameKo: "날개쉬기",
        nameEn: "Roost",
        power: null,
        accuracy: null,
        type: "비행",
        category: "변화",
        pp: 10,
        description: "날개를 접고 쉬며 체력을 회복한다. (The user lands and rests to recover HP.)",
        logicRef: "roost"
      }
    ]
  },
  {
    id: 107,
    nameKo: "칠색조",
    nameEn: "Ho-Oh",
    finalFormKo: "칠색조",
    finalFormEn: "Ho-Oh",
    type: [
      "불꽃",
      "비행"
    ],
    stats: {
      hp: 106,
      attack: 130,
      defense: 90,
      spAttack: 110,
      spDefense: 154,
      speed: 90
    },
    statTotal: 680,
    battleNote: "성스러운불꽃의 화상 압박과 높은 공격을 함께 갖춘 물리 전설 어태커로, 장기전에서도 힘이 있다.",
    evolution: {
      evoLevel: null,
      nextEvoId: null
    },
    ability: null,
    appearance: {
      outer: "transparent",
      core: "#E65A2B",
      bars: [
        "#F2C94C",
        "#2DBE60"
      ]
    },
    moves: [
      {
        nameKo: "성스러운불꽃",
        nameEn: "Sacred Fire",
        power: 100,
        accuracy: 95,
        type: "불꽃",
        category: "물리",
        pp: 5,
        description: "신성한 불길로 상대를 태워 공격한다. (An inferno of sacred flames engulfs the target.)"
      },
      {
        nameKo: "브레이브버드",
        nameEn: "Brave Bird",
        power: 120,
        accuracy: 100,
        type: "비행",
        category: "물리",
        pp: 15,
        description: "몸을 내던져 날아들며 공격한다. (The user tucks in its wings and dives at the target.)"
      },
      {
        nameKo: "날개쉬기",
        nameEn: "Roost",
        power: null,
        accuracy: null,
        type: "비행",
        category: "변화",
        pp: 10,
        description: "날개를 접고 쉬며 체력을 회복한다. (The user lands and rests to recover HP.)",
        logicRef: "roost"
      }
    ]
  },
  {
    id: 108,
    nameKo: "라이코",
    nameEn: "Raikou",
    finalFormKo: "라이코",
    finalFormEn: "Raikou",
    type: [
      "전기"
    ],
    stats: {
      hp: 90,
      attack: 85,
      defense: 75,
      spAttack: 115,
      spDefense: 100,
      speed: 115
    },
    statTotal: 580,
    battleNote: "빠른 스피드와 높은 특수 화력을 가진 전형적인 전기 스위퍼로, 명상 이후에는 압박력이 급격히 올라간다.",
    evolution: {
      evoLevel: null,
      nextEvoId: null
    },
    ability: null,
    appearance: {
      outer: "transparent",
      core: "#D8C15A",
      bars: [
        "#7A4F9D",
        "#1E1E1E"
      ]
    },
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
        nameKo: "섀도볼",
        nameEn: "Shadow Ball",
        power: 80,
        accuracy: 100,
        type: "고스트",
        category: "특수",
        pp: 15,
        description: "그림자 구체를 날려 공격한다. (Launches a shadowy blob at the target.)"
      },
      {
        nameKo: "명상",
        nameEn: "Calm Mind",
        power: null,
        accuracy: null,
        type: "에스퍼",
        category: "변화",
        pp: 20,
        description: "마음을 가라앉혀 특수공격과 특수방어를 올린다. (Quietly focuses the mind to raise Sp. Atk and Sp. Def.)", logicExplanation: "설명: 사용자의 특수공격과 특수방어를 각각 1랭크 올린다.\n공식: user.stages.spAttack += 1; user.stages.spDefense += 1",
        logicRef: "calm_mind"
      }
    ]
  },
  {
    id: 109,
    nameKo: "엔테이",
    nameEn: "Entei",
    finalFormKo: "엔테이",
    finalFormEn: "Entei",
    type: [
      "불꽃"
    ],
    stats: {
      hp: 115,
      attack: 115,
      defense: 85,
      spAttack: 90,
      spDefense: 75,
      speed: 100
    },
    statTotal: 580,
    battleNote: "직선적인 물리 화력이 강한 불꽃 전설 포켓몬으로, 신속과 강한 불꽃 기술을 섞어 압박하는 형태가 잘 어울린다.",
    evolution: {
      evoLevel: null,
      nextEvoId: null
    },
    ability: null,
    appearance: {
      outer: "transparent",
      core: "#A05030",
      bars: [
        "#C0C0C0",
        "#D9B44A"
      ]
    },
    moves: [
      {
        nameKo: "성스러운불꽃",
        nameEn: "Sacred Fire",
        power: 100,
        accuracy: 95,
        type: "불꽃",
        category: "물리",
        pp: 5,
        description: "신성한 불길로 상대를 태워 공격한다. (An inferno of sacred flames engulfs the target.)"
      },
      {
        nameKo: "신속",
        nameEn: "Extreme Speed",
        power: 80,
        accuracy: 100,
        type: "노말",
        category: "물리",
        pp: 5,
        description: "놀라운 속도로 먼저 들이받는다. (A blindingly fast attack that always goes first.)"
      },
      {
        nameKo: "플레어드라이브",
        nameEn: "Flare Blitz",
        power: 120,
        accuracy: 100,
        type: "불꽃",
        category: "물리",
        pp: 15,
        description: "몸 전체를 불꽃으로 두르고 돌진한다. (The user cloaks itself in fire and charges at the target.)"
      }
    ]
  },
  {
    id: 110,
    nameKo: "스이쿤",
    nameEn: "Suicune",
    finalFormKo: "스이쿤",
    finalFormEn: "Suicune",
    type: [
      "물"
    ],
    stats: {
      hp: 100,
      attack: 75,
      defense: 115,
      spAttack: 90,
      spDefense: 115,
      speed: 85
    },
    statTotal: 580,
    battleNote: "명상과 회복으로 장기전을 가져가기 쉬운 벌키 특수 포켓몬으로, 안정적인 물 내구형 운영에 강하다.",
    evolution: {
      evoLevel: null,
      nextEvoId: null
    },
    ability: null,
    appearance: {
      outer: "transparent",
      core: "#4A8FE5",
      bars: [
        "#FFFFFF",
        "#CDB7E9"
      ]
    },
    moves: [
      {
        nameKo: "파도타기",
        nameEn: "Surf",
        power: 95,
        accuracy: 100,
        type: "물",
        category: "특수",
        pp: 15,
        description: "거대한 파도로 넓게 공격한다. (A big wave strikes the target.)"
      },
      {
        nameKo: "냉동빔",
        nameEn: "Ice Beam",
        power: 90,
        accuracy: 100,
        type: "얼음",
        category: "특수",
        pp: 10,
        description: "차가운 광선을 쏘아 공격한다. (Fires an icy beam at the target.)"
      },
      {
        nameKo: "명상",
        nameEn: "Calm Mind",
        power: null,
        accuracy: null,
        type: "에스퍼",
        category: "변화",
        pp: 20,
        description: "마음을 가라앉혀 특수공격과 특수방어를 올린다. (Quietly focuses the mind to raise Sp. Atk and Sp. Def.)", logicExplanation: "설명: 사용자의 특수공격과 특수방어를 각각 1랭크 올린다.\n공식: user.stages.spAttack += 1; user.stages.spDefense += 1",
        logicRef: "calm_mind"
      }
    ]
  },
  {
    id: 111,
    nameKo: "그란돈",
    nameEn: "Groudon",
    finalFormKo: "그란돈",
    finalFormEn: "Groudon",
    type: [
      "땅"
    ],
    stats: {
      hp: 100,
      attack: 150,
      defense: 140,
      spAttack: 100,
      spDefense: 90,
      speed: 90
    },
    statTotal: 670,
    battleNote: "지진 중심의 압도적인 물리 화력이 강한 높은 종족값으로 한 번 기세를 잡으면 밀어붙이기 쉬운 에이스형이다.",
    evolution: {
      evoLevel: null,
      nextEvoId: null
    },
    ability: null,
    appearance: {
      outer: "transparent",
      core: "#C03030",
      bars: [
        "#1E1E1E",
        "#D4AF37"
      ]
    },
    moves: [
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
        nameKo: "스톤에지",
        nameEn: "Stone Edge",
        power: 100,
        accuracy: 80,
        type: "바위",
        category: "물리",
        pp: 5,
        description: "날카로운 바위의 날로 상대를 찌른다. (The user stabs the target with sharpened stones.)"
      },
      {
        nameKo: "칼춤",
        nameEn: "Swords Dance",
        power: null,
        accuracy: null,
        type: "노말",
        category: "변화",
        pp: 20,
        description: "검무를 추듯 몸을 움직여 공격력을 크게 올린다. (A frenetic dance to sharply raise Attack.)", logicExplanation: "설명: 사용자의 공격을 2랭크 올린다.\n공식: user.stages.attack += 2",
        logicRef: "swords_dance"
      }
    ]
  },
  {
    id: 112,
    nameKo: "가이오가",
    nameEn: "Kyogre",
    finalFormKo: "가이오가",
    finalFormEn: "Kyogre",
    type: [
      "물"
    ],
    stats: {
      hp: 100,
      attack: 100,
      defense: 90,
      spAttack: 150,
      spDefense: 140,
      speed: 90
    },
    statTotal: 670,
    battleNote: "비바라기와 고화력 물 기술로 상대를 짓누르는 대표적인 날씨 특수 어태커다.",
    evolution: {
      evoLevel: null,
      nextEvoId: null
    },
    ability: null,
    appearance: {
      outer: "transparent",
      core: "#2D6FDB",
      bars: [
        "#D43A2F",
        "#EAF2FF"
      ]
    },
    moves: [
      {
        nameKo: "하이드로펌프",
        nameEn: "Hydro Pump",
        power: 110,
        accuracy: 80,
        type: "물",
        category: "특수",
        pp: 5,
        description: "강한 물줄기를 한꺼번에 쏘아 공격한다. (Blasts water at high power.)"
      },
      {
        nameKo: "번개",
        nameEn: "Thunder",
        power: 110,
        accuracy: 70,
        type: "전기",
        category: "특수",
        pp: 10,
        description: "거대한 번개를 떨어뜨린다. (A wicked thunderbolt is dropped on the target.)"
      },
      {
        nameKo: "비바라기",
        nameEn: "Rain Dance",
        power: null,
        accuracy: null,
        type: "물",
        category: "변화",
        pp: 5,
        description: "비가 내리는 날씨로 바꾼다. (Summons a rainstorm that strengthens Water-type moves.)",
        logicRef: "rain_dance"
      }
    ]
  },
  {
    id: 113,
    nameKo: "레쿠쟈",
    nameEn: "Rayquaza",
    finalFormKo: "레쿠쟈",
    finalFormEn: "Rayquaza",
    type: [
      "드래곤",
      "비행"
    ],
    stats: {
      hp: 105,
      attack: 150,
      defense: 90,
      spAttack: 150,
      spDefense: 90,
      speed: 95
    },
    statTotal: 680,
    battleNote: "높은 공격과 스피드를 바탕으로 용의춤 이후 전장을 정리하는 대표적인 스위퍼다.",
    evolution: {
      evoLevel: null,
      nextEvoId: null
    },
    ability: null,
    appearance: {
      outer: "transparent",
      core: "#1E9A5A",
      bars: [
        "#E7D14A",
        "#B43A2E"
      ]
    },
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
        nameKo: "신속",
        nameEn: "Extreme Speed",
        power: 80,
        accuracy: 100,
        type: "노말",
        category: "물리",
        pp: 5,
        description: "놀라운 속도로 먼저 들이받는다. (A blindingly fast attack that always goes first.)"
      },
      {
        nameKo: "용의춤",
        nameEn: "Dragon Dance",
        power: null,
        accuracy: null,
        type: "드래곤",
        category: "변화",
        pp: 20,
        description: "공격과 스피드를 동시에 끌어올린다. (A mystic dance that boosts Attack and Speed.)", logicExplanation: "설명: 사용자의 공격과 스피드를 1랭크 올린다.\n공식: user.stages.attack += 1; user.stages.speed += 1",
        logicRef: "dragon_dance"
      }
    ]
  },
  {
    id: 114,
    nameKo: "디아루가",
    nameEn: "Dialga",
    finalFormKo: "디아루가",
    finalFormEn: "Dialga",
    type: [
      "강철",
      "드래곤"
    ],
    stats: {
      hp: 100,
      attack: 120,
      defense: 120,
      spAttack: 150,
      spDefense: 100,
      speed: 90
    },
    statTotal: 680,
    battleNote: "강철/드래곤의 내성과 높은 특수 화력을 바탕으로 받으면서도 강하게 되받아치는 특수 브레이커다.",
    evolution: {
      evoLevel: null,
      nextEvoId: null
    },
    ability: null,
    appearance: {
      outer: "transparent",
      core: "#4B79A1",
      bars: [
        "#B0B8C0",
        "#EAF0F7"
      ]
    },
    moves: [
      {
        nameKo: "시간의포효",
        nameEn: "Roar of Time",
        power: 150,
        accuracy: 90,
        type: "드래곤",
        category: "특수",
        pp: 5,
        description: "시간의 균열을 일으켜 강하게 공격한다. (The user blasts the target with the distortion of time.)"
      },
      {
        nameKo: "러스터캐논",
        nameEn: "Flash Cannon",
        power: 80,
        accuracy: 100,
        type: "강철",
        category: "특수",
        pp: 10,
        description: "강한 빛을 모아 쏘아낸다. (The user gathers all its light energy and releases it.)"
      },
      {
        nameKo: "명상",
        nameEn: "Calm Mind",
        power: null,
        accuracy: null,
        type: "에스퍼",
        category: "변화",
        pp: 20,
        description: "마음을 가라앉혀 특수공격과 특수방어를 올린다. (Quietly focuses the mind to raise Sp. Atk and Sp. Def.)", logicExplanation: "설명: 사용자의 특수공격과 특수방어를 각각 1랭크 올린다.\n공식: user.stages.spAttack += 1; user.stages.spDefense += 1",
        logicRef: "calm_mind"
      }
    ]
  },
  {
    id: 115,
    nameKo: "펄기아",
    nameEn: "Palkia",
    finalFormKo: "펄기아",
    finalFormEn: "Palkia",
    type: [
      "물",
      "드래곤"
    ],
    stats: {
      hp: 90,
      attack: 120,
      defense: 100,
      spAttack: 150,
      spDefense: 120,
      speed: 100
    },
    statTotal: 680,
    battleNote: "물과 드래곤의 넓은 타점으로 압박하면서, 보조 회복을 섞으면 생각보다 오래 버티는 특수 전설이다.",
    evolution: {
      evoLevel: null,
      nextEvoId: null
    },
    ability: null,
    appearance: {
      outer: "transparent",
      core: "#D98FB5",
      bars: [
        "#8E67C8",
        "#F7F7F7"
      ]
    },
    moves: [
      {
        nameKo: "공간절단",
        nameEn: "Spacial Rend",
        power: 100,
        accuracy: 95,
        type: "드래곤",
        category: "특수",
        pp: 5,
        description: "공간을 찢어 베어낸다. (The user tears the target along with the space around it.)"
      },
      {
        nameKo: "하이드로펌프",
        nameEn: "Hydro Pump",
        power: 110,
        accuracy: 80,
        type: "물",
        category: "특수",
        pp: 5,
        description: "강한 물줄기를 한꺼번에 쏘아 공격한다. (Blasts water at high power.)"
      },
      {
        nameKo: "아쿠아링",
        nameEn: "Aqua Ring",
        power: null,
        accuracy: null,
        type: "물",
        category: "변화",
        pp: 20,
        description: "물의 고리를 만들어 매 턴 체력을 회복한다. (Restores a little HP every turn.)",
        logicRef: "aqua_ring"
      }
    ]
  },
  {
    id: 116,
    nameKo: "기라티나",
    nameEn: "Giratina",
    finalFormKo: "기라티나",
    finalFormEn: "Giratina",
    type: [
      "고스트",
      "드래곤"
    ],
    stats: {
      hp: 150,
      attack: 100,
      defense: 120,
      spAttack: 100,
      spDefense: 120,
      speed: 90
    },
    statTotal: 680,
    battleNote: "압도적인 체력과 좋은 내구를 바탕으로 상대를 천천히 말리는 탱커형 전설 포켓몬이다.",
    evolution: {
      evoLevel: null,
      nextEvoId: null
    },
    ability: null,
    appearance: {
      outer: "transparent",
      core: "#5A5A5A",
      bars: [
        "#C6A03A",
        "#9A2F2F"
      ]
    },
    moves: [
      {
        nameKo: "섀도볼",
        nameEn: "Shadow Ball",
        power: 80,
        accuracy: 100,
        type: "고스트",
        category: "특수",
        pp: 15,
        description: "그림자 구체를 날려 공격한다. (Launches a shadowy blob at the target.)"
      },
      {
        nameKo: "용성군",
        nameEn: "Draco Meteor",
        power: 130,
        accuracy: 90,
        type: "드래곤",
        category: "특수",
        pp: 5,
        description: "하늘에서 운석처럼 강력한 드래곤 에너지를 떨어뜨린다. (A meteor-like dragon blast falls on the target.)"
      },
      {
        nameKo: "잠자기",
        nameEn: "Rest",
        power: null,
        accuracy: null,
        type: "에스퍼",
        category: "변화",
        pp: 10,
        description: "깊은 잠에 들어 체력을 모두 회복한다. (The user goes to sleep and restores HP.)",
        logicRef: "rest"
      }
    ]
  },
  {
    id: 117,
    nameKo: "다크라이",
    nameEn: "Darkrai",
    finalFormKo: "다크라이",
    finalFormEn: "Darkrai",
    type: [
      "악"
    ],
    stats: {
      hp: 70,
      attack: 90,
      defense: 90,
      spAttack: 135,
      spDefense: 90,
      speed: 125
    },
    statTotal: 600,
    battleNote: "고속 특수 화력과 수면 유발기로 선턴 주도권을 잡는 교란형 악 타입 포켓몬이다.",
    evolution: {
      evoLevel: null,
      nextEvoId: null
    },
    ability: null,
    appearance: {
      outer: "transparent",
      core: "#1C1C1C",
      bars: [
        "#C62828",
        "#F0F0F0"
      ]
    },
    moves: [
      {
        nameKo: "악의파동",
        nameEn: "Dark Pulse",
        power: 80,
        accuracy: 100,
        type: "악",
        category: "특수",
        pp: 15,
        description: "어둠의 충격파를 날려 공격한다. (The user attacks with a horrible aura.)"
      },
      {
        nameKo: "다크홀",
        nameEn: "Dark Void",
        power: null,
        accuracy: 80,
        type: "악",
        category: "변화",
        pp: 10,
        description: "상대를 깊은 잠에 빠뜨린다. (Badly lulls the target into a nightmare-like sleep.)",
        logicRef: "dark_void"
      },
      {
        nameKo: "나쁜음모",
        nameEn: "Nasty Plot",
        power: null,
        accuracy: null,
        type: "악",
        category: "변화",
        pp: 20,
        description: "속셈을 굴려 특수공격을 크게 올린다. (The user stimulates its brain to sharply raise Sp. Atk.)", logicExplanation: "설명: 사용자의 특수공격을 2랭크 올린다.\n공식: user.stages.spAttack += 2",
        logicRef: "nasty_plot"
      }
    ]
  },
  {
    id: 118,
    nameKo: "쉐이미",
    nameEn: "Shaymin",
    finalFormKo: "쉐이미",
    finalFormEn: "Shaymin",
    type: [
      "풀"
    ],
    stats: {
      hp: 100,
      attack: 100,
      defense: 100,
      spAttack: 100,
      spDefense: 100,
      speed: 100
    },
    statTotal: 600,
    battleNote: "씨뿌리기와 광합성으로 체력을 회복하면서 장기전에서 이득을 보는 균형형 풀 타입 포켓몬이다.",
    evolution: {
      evoLevel: null,
      nextEvoId: null
    },
    ability: null,
    appearance: {
      outer: "transparent",
      core: "#6BCB5A",
      bars: [
        "#F5A7C5",
        "#FFFFFF"
      ]
    },
    moves: [
      {
        nameKo: "씨폭탄",
        nameEn: "Seed Flare",
        power: 120,
        accuracy: 85,
        type: "풀",
        category: "특수",
        pp: 5,
        description: "씨앗 에너지를 폭발시켜 공격한다. (Explodes with a burst of seed energy.)"
      },
      {
        nameKo: "씨뿌리기",
        nameEn: "Leech Seed",
        power: null,
        accuracy: 90,
        type: "풀",
        category: "변화",
        pp: 10,
        description: "상대에게 씨앗을 심어 매 턴 체력을 흡수한다. (Plants a seed on the target to sap HP each turn.)",
        logicRef: "leech_seed"
      },
      {
        nameKo: "광합성",
        nameEn: "Synthesis",
        power: null,
        accuracy: null,
        type: "풀",
        category: "변화",
        pp: 5,
        description: "햇빛을 받아 자신의 체력을 회복한다. (Restores HP using light energy.)",
        logicRef: "synthesis"
      }
    ]
  },
  {
    id: 119,
    nameKo: "아르세우스",
    nameEn: "Arceus",
    finalFormKo: "아르세우스",
    finalFormEn: "Arceus",
    type: [
      "노말"
    ],
    stats: {
      hp: 120,
      attack: 120,
      defense: 120,
      spAttack: 120,
      spDefense: 120,
      speed: 120
    },
    statTotal: 720,
    battleNote: "멀티타입 덕분에 타입 운용 폭이 매우 넓고, 기본형은 균형형 만능 포켓몬으로 설계하기 좋은 최상위 전설이다.",
    evolution: {
      evoLevel: null,
      nextEvoId: null
    },
    ability: "MultiType",
    appearance: {
      outer: "transparent",
      core: "#F4F4F4",
      bars: [
        "#D8B400",
        "#B0B0B0"
      ]
    },
    moves: [
      {
        nameKo: "심판의뭉치",
        nameEn: "Judgment",
        power: 100,
        accuracy: 100,
        type: "노말",
        category: "특수",
        pp: 10,
        description: "판결의 힘을 모아 상대를 공격한다. (The user unleashes its hidden power.)"
      },
      {
        nameKo: "회복",
        nameEn: "Recover",
        power: null,
        accuracy: null,
        type: "노말",
        category: "변화",
        pp: 10,
        description: "자신의 체력을 크게 회복한다. (Restores half of the user's maximum HP.)",
        logicRef: "recover"
      },
      {
        nameKo: "칼춤",
        nameEn: "Swords Dance",
        power: null,
        accuracy: null,
        type: "노말",
        category: "변화",
        pp: 20,
        description: "검무를 추듯 몸을 움직여 공격력을 크게 올린다. (A frenetic dance to sharply raise Attack.)", logicExplanation: "설명: 사용자의 공격을 2랭크 올린다.\n공식: user.stages.attack += 2",
        logicRef: "swords_dance"
      }
    ]
  },
  {
    id: 120,
    nameKo: "레시라무",
    nameEn: "Reshiram",
    finalFormKo: "레시라무",
    finalFormEn: "Reshiram",
    type: [
      "드래곤",
      "불꽃"
    ],
    stats: {
      hp: 100,
      attack: 120,
      defense: 100,
      spAttack: 150,
      spDefense: 120,
      speed: 90
    },
    statTotal: 680,
    battleNote: "자속 불꽃과 드래곤 기술의 타점이 훌륭한 특수 어태커로, 방어 상성도 뛰어나 강력한 압박 능력을 자랑한다.",
    evolution: {
      evoLevel: null,
      nextEvoId: null
    },
    ability: null,
    appearance: {
      outer: "transparent",
      core: "#F0F0F0",
      bars: [
        "#FFFFFF",
        "#E53935"
      ]
    },
    moves: [
      {
        nameKo: "크로스플레임",
        nameEn: "Fusion Flare",
        power: 100,
        accuracy: 100,
        type: "불꽃",
        category: "특수",
        pp: 5,
        description: "거대한 불꽃을 만들어 공격한다. (Brings down a giant flame.)"
      },
      {
        nameKo: "용성군",
        nameEn: "Draco Meteor",
        power: 130,
        accuracy: 90,
        type: "드래곤",
        category: "특수",
        pp: 5,
        description: "하늘에서 운석처럼 강력한 드래곤 에너지를 떨어뜨린다. (A meteor-like dragon blast falls on the target.)"
      },
      {
        nameKo: "날개쉬기",
        nameEn: "Roost",
        power: null,
        accuracy: null,
        type: "비행",
        category: "변화",
        pp: 10,
        description: "날개를 접고 쉬며 체력을 회복한다. (The user lands and rests to recover HP.)",
        logicRef: "roost"
      }
    ]
  }
,
  {
    id: 137,
    nameKo: "모부기",
    nameEn: "Turtwig",
    finalFormKo: "토대부기",
    finalFormEn: "Torterra",
    type: ["풀"],
    stats: { hp: 55, attack: 68, defense: 64, spAttack: 45, spDefense: 55, speed: 31 },
    statTotal: 318,
    battleNote: "토대부기: 높은 물리 내구와 지진, 우드해머로 압박하는 느린 탱커형 스타팅이다. 랭크업이나 교체전에서 묵직하게 굴리기 좋다.",
    evolution: { evoLevel: 16, nextEvoId: 138 },
    ability: "심록",
    appearance: { outer: "transparent", core: "#69A33D", bars: ["#8B5A2B", "#D9C25F"] },
    moves: [
      { nameKo: "몸통박치기", nameEn: "Tackle", power: 40, accuracy: 100, type: "노말", category: "물리", pp: 35, description: "몸 전체를 부딪쳐 공격한다. (A physical attack in which the user charges and slams into the target with its whole body.)" },
      { nameKo: "흡수", nameEn: "Absorb", power: 20, accuracy: 100, type: "풀", category: "특수", pp: 25, description: "양분을 흡수해 체력을 회복한다. (A nutrient-draining attack. The user's HP is restored by half the damage taken by the target.)", logicExplanation: "설명: 준 피해의 절반만큼 HP를 회복한다.\\n공식: heal = floor(damageDealt / 2)\\n규칙: 회복량은 최대 HP를 넘지 않는다" },
      { nameKo: "껍질에숨기", nameEn: "Withdraw", power: null, accuracy: null, type: "물", category: "변화", pp: 40, description: "껍질 속에 숨어 방어를 올린다. (The user withdraws its body into its hard shell, raising its Defense stat.)", logicExplanation: "설명: 사용자의 방어를 1랭크 올린다.\\n공식: user.stages.defense += 1" }
    ]
  },
  {
    id: 138,
    nameKo: "수풀부기",
    nameEn: "Grotle",
    finalFormKo: "토대부기",
    finalFormEn: "Torterra",
    type: ["풀"],
    stats: { hp: 75, attack: 89, defense: 85, spAttack: 55, spDefense: 65, speed: 36 },
    statTotal: 405,
    battleNote: "토대부기: 높은 물리 내구와 지진, 우드해머로 압박하는 느린 탱커형 스타팅이다. 랭크업이나 교체전에서 묵직하게 굴리기 좋다.",
    evolution: { evoLevel: 36, nextEvoId: 139 },
    ability: "심록",
    appearance: { outer: "transparent", core: "#547F36", bars: ["#C0A24B", "#8B5A2B"] },
    moves: [
      { nameKo: "씨폭탄", nameEn: "Seed Bomb", power: 80, accuracy: 100, type: "풀", category: "물리", pp: 15, description: "딱딱한 씨앗을 발사해 공격한다. (The user slams a barrage of hard-shelled seeds down on the target from above.)" },
      { nameKo: "저주", nameEn: "Curse", power: null, accuracy: null, type: "고스트", category: "변화", pp: 10, description: "스피드를 내리고 공격과 방어를 올린다. (A move that works differently for the Ghost type than for all other types.)", logicExplanation: "설명: 고스트가 아니면 스피드가 1랭크 내려가고 공격과 방어가 1랭크 오른다." },
      { nameKo: "메가드레인", nameEn: "Mega Drain", power: 40, accuracy: 100, type: "풀", category: "특수", pp: 15, description: "양분을 흡수해 체력을 회복한다. (A nutrient-draining attack. The user's HP is restored by half the damage taken by the target.)", logicExplanation: "설명: 준 피해의 절반만큼 HP를 회복한다.\\n공식: heal = floor(damageDealt / 2)" }
    ]
  },
  {
    id: 139,
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
      { nameKo: "광합성", nameEn: "Synthesis", power: null, accuracy: null, type: "풀", category: "변화", pp: 5, description: "햇빛을 흡수해 체력을 회복한다. (The user restores its own HP. The amount of HP regained varies with the weather.)", logicExplanation: "설명: 사용자의 HP를 회복한다.\\n공식: heal = floor(maxHP / 2)" }
    ]
  },
  {
    id: 140,
    nameKo: "불꽃숭이",
    nameEn: "Chimchar",
    finalFormKo: "초염몽",
    finalFormEn: "Infernape",
    type: ["불꽃"],
    stats: { hp: 44, attack: 58, defense: 44, spAttack: 58, spDefense: 44, speed: 61 },
    statTotal: 309,
    battleNote: "초염몽: 빠른 양면 어태커로서 물리/특수 어느 쪽으로도 압박할 수 있고, 철주먹 숨겨진 특성으로 펀치 기술의 위력이 늘어난다.",
    evolution: { evoLevel: 16, nextEvoId: 141 },
    ability: "맹화",
    appearance: { outer: "transparent", core: "#F08030", bars: ["#D8D8D8", "#F8D030"] },
    moves: [
      { nameKo: "할퀴기", nameEn: "Scratch", power: 40, accuracy: 100, type: "노말", category: "물리", pp: 35, description: "날카로운 발톱으로 할퀴어 공격한다. (Hard, pointed, sharp claws rake the target to inflict damage.)" },
      { nameKo: "불꽃세례", nameEn: "Ember", power: 40, accuracy: 100, type: "불꽃", category: "특수", pp: 25, description: "작은 불꽃을 발사해 공격한다. 화상을 입힐 때가 있다. (The target is attacked with small flames. This may also leave the target with a burn.)", logicExplanation: "공식: if random(100) < 10: target.status = 'burn'" },
      { nameKo: "도발", nameEn: "Taunt", power: null, accuracy: 100, type: "악", category: "변화", pp: 20, description: "상대를 도발해 변화기술만 못 쓰게 한다. (The target is taunted into a rage that allows it to use only attack moves for three turns.)" }
    ]
  },
  {
    id: 141,
    nameKo: "파이숭이",
    nameEn: "Monferno",
    finalFormKo: "초염몽",
    finalFormEn: "Infernape",
    type: ["불꽃", "격투"],
    stats: { hp: 64, attack: 78, defense: 52, spAttack: 78, spDefense: 52, speed: 81 },
    statTotal: 405,
    battleNote: "초염몽: 빠른 양면 어태커로서 물리/특수 어느 쪽으로도 압박할 수 있고, 철주먹 숨겨진 특성으로 펀치 기술의 위력이 늘어난다.",
    evolution: { evoLevel: 36, nextEvoId: 142 },
    ability: "맹화",
    appearance: { outer: "transparent", core: "#EA6B2C", bars: ["#F8D030", "#8B4A23"] },
    moves: [
      { nameKo: "마하펀치", nameEn: "Mach Punch", power: 40, accuracy: 100, type: "격투", category: "물리", pp: 30, description: "눈에도 보이지 않는 빠른 주먹으로 공격한다. (The user throws a punch at blinding speed. This move always goes first.)" },
      { nameKo: "화염바퀴", nameEn: "Flame Wheel", power: 60, accuracy: 100, type: "불꽃", category: "물리", pp: 25, description: "불꽃을 휘감고 돌진해 공격한다. 화상을 입힐 때가 있다. (The user cloaks itself in fire and charges at the target. This may also leave the target with a burn.)" },
      { nameKo: "째려보기", nameEn: "Leer", power: null, accuracy: 100, type: "노말", category: "변화", pp: 30, description: "날카롭게 노려 상대의 방어를 떨어뜨린다. (The user gives opposing Pokémon an intimidating leer that lowers the Defense stat.)", logicExplanation: "설명: 상대의 방어를 1랭크 낮춘다.\\n공식: target.stages.defense -= 1" }
    ]
  },
  {
    id: 142,
    nameKo: "초염몽",
    nameEn: "Infernape",
    finalFormKo: "초염몽",
    finalFormEn: "Infernape",
    type: ["불꽃", "격투"],
    stats: { hp: 76, attack: 104, defense: 71, spAttack: 104, spDefense: 71, speed: 108 },
    statTotal: 534,
    battleNote: "초염몽: 빠른 양면 어태커로서 물리/특수 어느 쪽으로도 압박할 수 있고, 철주먹 숨겨진 특성으로 마하펀치 같은 주먹 기술의 위력이 오른다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: "맹화",
    hiddenAbility: "철주먹",
    appearance: { outer: "transparent", core: "#DB632A", bars: ["#F8D030", "#FFFFFF"] },
    moves: [
      { nameKo: "플레어드라이브", nameEn: "Flare Blitz", power: 120, accuracy: 100, type: "불꽃", category: "물리", pp: 15, description: "몸에 불꽃을 두르고 돌진해 공격하고 반동을 받는다. (The user cloaks itself in fire and charges at the target. The user sustains serious damage, and the target may be burned.)", logicExplanation: "설명: 큰 위력의 불꽃 물리 공격 후 준 피해의 1/4만큼 반동을 받는다." },
      { nameKo: "마하펀치", nameEn: "Mach Punch", power: 40, accuracy: 100, type: "격투", category: "물리", pp: 30, description: "눈에도 보이지 않는 빠른 주먹으로 공격한다. (The user throws a punch at blinding speed. This move always goes first.)" },
      { nameKo: "명상", nameEn: "Calm Mind", power: null, accuracy: null, type: "에스퍼", category: "변화", pp: 20, description: "정신을 집중해 특공과 특방을 올린다. (The user quietly focuses its mind and calms its spirit to raise its Sp. Atk and Sp. Def stats.)", logicExplanation: "설명: 사용자의 특수공격과 특수방어를 각각 1랭크 올린다.\\n공식: user.stages.spAttack += 1; user.stages.spDefense += 1" }
    ]
  },
  {
    id: 143,
    nameKo: "팽도리",
    nameEn: "Piplup",
    finalFormKo: "엠페르트",
    finalFormEn: "Empoleon",
    type: ["물"],
    stats: { hp: 53, attack: 51, defense: 53, spAttack: 61, spDefense: 56, speed: 40 },
    statTotal: 314,
    battleNote: "엠페르트: 강철 복합으로 저항이 우수하고 특수 화력이 좋아 안정적인 특수 탱커 겸 어태커로 굴리기 좋다.",
    evolution: { evoLevel: 16, nextEvoId: 144 },
    ability: "급류",
    appearance: { outer: "transparent", core: "#7AA9FF", bars: ["#E6F2FF", "#F8D030"] },
    moves: [
      { nameKo: "거품", nameEn: "Bubble", power: 40, accuracy: 100, type: "물", category: "특수", pp: 30, description: "거품을 내보내 공격한다. (A spray of countless bubbles is jetted at the opposing team. It may also lower the targets' Speed stats.)" },
      { nameKo: "쪼기", nameEn: "Peck", power: 35, accuracy: 100, type: "비행", category: "물리", pp: 35, description: "날카로운 부리로 쪼아 공격한다. (The target is jabbed with a sharply pointed beak or horn.)" },
      { nameKo: "울음소리", nameEn: "Growl", power: null, accuracy: 100, type: "노말", category: "변화", pp: 40, description: "귀여운 울음소리로 상대의 공격을 떨어뜨린다. (The user growls in an endearing way, making opposing Pokémon less wary. This lowers their Attack stat.)", logicExplanation: "설명: 상대의 공격을 1랭크 낮춘다.\\n공식: target.stages.attack -= 1" }
    ]
  },
  {
    id: 144,
    nameKo: "팽태자",
    nameEn: "Prinplup",
    finalFormKo: "엠페르트",
    finalFormEn: "Empoleon",
    type: ["물"],
    stats: { hp: 64, attack: 66, defense: 68, spAttack: 81, spDefense: 76, speed: 50 },
    statTotal: 405,
    battleNote: "엠페르트: 강철 복합으로 저항이 우수하고 특수 화력이 좋아 안정적인 특수 탱커 겸 어태커로 굴리기 좋다.",
    evolution: { evoLevel: 36, nextEvoId: 145 },
    ability: "급류",
    appearance: { outer: "transparent", core: "#5F8FD9", bars: ["#DDE9FF", "#F8D030"] },
    moves: [
      { nameKo: "거품광선", nameEn: "Bubble Beam", power: 65, accuracy: 100, type: "물", category: "특수", pp: 20, description: "거품을 강하게 발사해 공격한다. (A spray of bubbles is forcefully ejected at the target. It may also lower the target's Speed stat.)" },
      { nameKo: "메탈클로", nameEn: "Metal Claw", power: 50, accuracy: 95, type: "강철", category: "물리", pp: 35, description: "강철 발톱으로 베어 공격한다. (The target is raked with steel claws. This may also raise the user's Attack stat.)" },
      { nameKo: "아쿠아제트", nameEn: "Aqua Jet", power: 40, accuracy: 100, type: "물", category: "물리", pp: 20, description: "엄청난 속도로 돌진해 공격한다. (The user lunges at the target at a speed that makes it almost invisible. This move always goes first.)" }
    ]
  },
  {
    id: 145,
    nameKo: "엠페르트",
    nameEn: "Empoleon",
    finalFormKo: "엠페르트",
    finalFormEn: "Empoleon",
    type: ["물", "강철"],
    stats: { hp: 84, attack: 86, defense: 88, spAttack: 111, spDefense: 101, speed: 60 },
    statTotal: 530,
    battleNote: "엠페르트: 강철 복합으로 저항이 우수하고 특수 화력이 좋아 안정적인 특수 탱커 겸 어태커로 굴리기 좋다. 오기 숨겨진 특성으로 능력 하락을 역이용할 수 있다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: "급류",
    hiddenAbility: "오기",
    appearance: { outer: "transparent", core: "#476FBA", bars: ["#E8F0FF", "#F8D030"] },
    moves: [
      { nameKo: "파도타기", nameEn: "Surf", power: 95, accuracy: 100, type: "물", category: "특수", pp: 15, description: "큰 파도를 일으켜 상대를 공격한다. (The user attacks everything around it by swamping its surroundings with a giant wave.)" },
      { nameKo: "러스터캐논", nameEn: "Flash Cannon", power: 80, accuracy: 100, type: "강철", category: "특수", pp: 10, description: "빛나는 빔을 발사해 공격한다. (The user gathers all its light energy and releases it at once. This may also lower the target's Sp. Def stat.)" },
      { nameKo: "칼춤", nameEn: "Swords Dance", power: null, accuracy: null, type: "노말", category: "변화", pp: 20, description: "격렬한 춤으로 공격을 크게 올린다. (A frenetic dance to uplift the fighting spirit. This sharply raises the user's Attack stat.)", logicExplanation: "설명: 사용자의 공격을 2랭크 올린다.\\n공식: user.stages.attack += 2" }
    ]
  },
  {
    id: 146,
    nameKo: "뚜꾸리",
    nameEn: "Tepig",
    finalFormKo: "염무왕",
    finalFormEn: "Emboar",
    type: ["불꽃"],
    stats: { hp: 65, attack: 63, defense: 45, spAttack: 45, spDefense: 45, speed: 45 },
    statTotal: 308,
    battleNote: "염무왕: 높은 공격과 체력으로 강한 불꽃/격투 물리기를 밀어붙이는 파괴형 스타팅이다. 무모 숨겨진 특성으로 반동기 위력을 더 올릴 수 있다.",
    evolution: { evoLevel: 17, nextEvoId: 147 },
    ability: "맹화",
    appearance: { outer: "transparent", core: "#F26E42", bars: ["#2D2D2D", "#F8D030"] },
    moves: [
      { nameKo: "몸통박치기", nameEn: "Tackle", power: 40, accuracy: 100, type: "노말", category: "물리", pp: 35, description: "몸 전체를 부딪쳐 공격한다. (A physical attack in which the user charges and slams into the target with its whole body.)" },
      { nameKo: "불꽃세례", nameEn: "Ember", power: 40, accuracy: 100, type: "불꽃", category: "특수", pp: 25, description: "작은 불꽃을 발사해 공격한다. 화상을 입힐 때가 있다. (The target is attacked with small flames. This may also leave the target with a burn.)" },
      { nameKo: "꼬리흔들기", nameEn: "Tail Whip", power: null, accuracy: 100, type: "노말", category: "변화", pp: 30, description: "귀엽게 꼬리를 흔들어 상대의 방어를 낮춘다. (The user wags its tail cutely, making opposing Pokémon less wary and lowering their Defense stat.)", logicExplanation: "설명: 상대의 방어를 1랭크 낮춘다.\\n공식: target.stages.defense -= 1" }
    ]
  },
  {
    id: 147,
    nameKo: "차오꿀",
    nameEn: "Pignite",
    finalFormKo: "염무왕",
    finalFormEn: "Emboar",
    type: ["불꽃", "격투"],
    stats: { hp: 90, attack: 93, defense: 55, spAttack: 70, spDefense: 55, speed: 55 },
    statTotal: 418,
    battleNote: "염무왕: 높은 공격과 체력으로 강한 불꽃/격투 물리기를 밀어붙이는 파괴형 스타팅이다. 무모 숨겨진 특성으로 반동기 위력을 더 올릴 수 있다.",
    evolution: { evoLevel: 36, nextEvoId: 148 },
    ability: "맹화",
    appearance: { outer: "transparent", core: "#D85A39", bars: ["#F8D030", "#2C2C2C"] },
    moves: [
      { nameKo: "암해머", nameEn: "Hammer Arm", power: 100, accuracy: 90, type: "격투", category: "물리", pp: 10, description: "거대한 팔을 휘둘러 공격하고 자신의 스피드가 떨어진다. (The user swings and hits with its strong and heavy fist. It lowers the user's Speed stat.)" },
      { nameKo: "니트로차지", nameEn: "Flame Charge", power: 50, accuracy: 100, type: "불꽃", category: "물리", pp: 20, description: "불꽃에 휩싸인 채 돌진해 공격하고 자신의 스피드를 올린다. (Cloaking itself in flame, the user attacks the target. Then, building up more power, the user raises its Speed stat.)" },
      { nameKo: "울부짖기", nameEn: "Roar", power: null, accuracy: null, type: "노말", category: "변화", pp: 20, description: "상대를 몰아내 다른 포켓몬을 끌어낸다. (The target is scared off, and a different Pokémon is dragged out.)" }
    ]
  },
  {
    id: 148,
    nameKo: "염무왕",
    nameEn: "Emboar",
    finalFormKo: "염무왕",
    finalFormEn: "Emboar",
    type: ["불꽃", "격투"],
    stats: { hp: 110, attack: 123, defense: 65, spAttack: 100, spDefense: 65, speed: 65 },
    statTotal: 528,
    battleNote: "염무왕: 높은 공격과 체력으로 강한 불꽃/격투 물리기를 밀어붙이는 파괴형 스타팅이다. 무모 숨겨진 특성으로 플레어드라이브 같은 반동기의 화력이 더 오른다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: "맹화",
    hiddenAbility: "무모",
    appearance: { outer: "transparent", core: "#B84730", bars: ["#F8D030", "#1D1D1D"] },
    moves: [
      { nameKo: "플레어드라이브", nameEn: "Flare Blitz", power: 120, accuracy: 100, type: "불꽃", category: "물리", pp: 15, description: "몸에 불꽃을 두르고 돌진해 공격하고 반동을 받는다. (The user cloaks itself in fire and charges at the target. The user sustains serious damage, and the target may be burned.)", logicExplanation: "설명: 큰 위력의 불꽃 물리 공격 후 준 피해의 1/4만큼 반동을 받는다." },
      { nameKo: "암해머", nameEn: "Hammer Arm", power: 100, accuracy: 90, type: "격투", category: "물리", pp: 10, description: "거대한 팔을 휘둘러 공격하고 자신의 스피드가 떨어진다. (The user swings and hits with its strong and heavy fist. It lowers the user's Speed stat.)" },
      { nameKo: "와일드볼트", nameEn: "Wild Charge", power: 90, accuracy: 100, type: "전기", category: "물리", pp: 15, description: "전기를 두르고 돌진해 공격하고 반동을 받는다. (The user shrouds itself in electricity and smashes into its target. It also damages the user a little.)", logicExplanation: "설명: 준 피해의 1/4만큼 반동을 받는다." }
    ]
  },
  {
    id: 149,
    nameKo: "수댕이",
    nameEn: "Oshawott",
    finalFormKo: "대검귀",
    finalFormEn: "Samurott",
    type: ["물"],
    stats: { hp: 55, attack: 55, defense: 45, spAttack: 63, spDefense: 45, speed: 45 },
    statTotal: 308,
    battleNote: "대검귀: 물리/특수 어느 쪽도 가능하지만 칼 기술과 물 기술을 섞는 균형형 어태커로 굴리기 좋다.",
    evolution: { evoLevel: 17, nextEvoId: 150 },
    ability: "급류",
    appearance: { outer: "transparent", core: "#7ECFFF", bars: ["#2C65A8", "#F3EAD0"] },
    moves: [
      { nameKo: "물대포", nameEn: "Water Gun", power: 40, accuracy: 100, type: "물", category: "특수", pp: 25, description: "물을 세차게 뿜어 공격한다. (The target is blasted with a forceful shot of water.)" },
      { nameKo: "베어가르기", nameEn: "Razor Shell", power: 75, accuracy: 95, type: "물", category: "물리", pp: 10, description: "날카로운 껍질로 베어 공격한다. (The user cuts its target with sharp shells. This may also lower the target's Defense stat.)" },
      { nameKo: "칼춤", nameEn: "Swords Dance", power: null, accuracy: null, type: "노말", category: "변화", pp: 20, description: "격렬한 춤으로 공격을 크게 올린다. (A frenetic dance to uplift the fighting spirit. This sharply raises the user's Attack stat.)", logicExplanation: "설명: 사용자의 공격을 2랭크 올린다.\\n공식: user.stages.attack += 2" }
    ]
  },
  {
    id: 150,
    nameKo: "쌍검자비",
    nameEn: "Dewott",
    finalFormKo: "대검귀",
    finalFormEn: "Samurott",
    type: ["물"],
    stats: { hp: 75, attack: 75, defense: 60, spAttack: 83, spDefense: 60, speed: 60 },
    statTotal: 413,
    battleNote: "대검귀: 물리/특수 어느 쪽도 가능하지만 칼 기술과 물 기술을 섞는 균형형 어태커로 굴리기 좋다.",
    evolution: { evoLevel: 36, nextEvoId: 151 },
    ability: "급류",
    appearance: { outer: "transparent", core: "#66B7F0", bars: ["#254A7A", "#F2E7D0"] },
    moves: [
      { nameKo: "파도타기", nameEn: "Surf", power: 95, accuracy: 100, type: "물", category: "특수", pp: 15, description: "큰 파도를 일으켜 상대를 공격한다. (The user attacks everything around it by swamping its surroundings with a giant wave.)" },
      { nameKo: "깜짝베기", nameEn: "Night Slash", power: 70, accuracy: 100, type: "악", category: "물리", pp: 15, description: "급소를 노려 베어 공격한다. (The user slashes the target the instant an opportunity arises. Critical hits land more easily.)" },
      { nameKo: "껍질에숨기", nameEn: "Withdraw", power: null, accuracy: null, type: "물", category: "변화", pp: 40, description: "껍질 속에 숨어 방어를 올린다. (The user withdraws its body into its hard shell, raising its Defense stat.)", logicExplanation: "설명: 사용자의 방어를 1랭크 올린다.\n공식: user.stages.defense += 1" }
    ]
  },
  {
    id: 151,
    nameKo: "대검귀",
    nameEn: "Samurott",
    finalFormKo: "대검귀",
    finalFormEn: "Samurott",
    type: ["물"],
    stats: { hp: 95, attack: 100, defense: 85, spAttack: 108, spDefense: 70, speed: 70 },
    statTotal: 528,
    battleNote: "대검귀: 물리/특수 어느 쪽도 가능하지만 칼 기술과 물 기술을 섞는 균형형 어태커로 굴리기 좋다. 껍질갑옷 숨겨진 특성으로 급소 변수도 줄인다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: "급류",
    hiddenAbility: "껍질갑옷",
    appearance: { outer: "transparent", core: "#4D9ED8", bars: ["#1F3D63", "#F3E7D1"] },
    moves: [
      { nameKo: "하이드로펌프", nameEn: "Hydro Pump", power: 120, accuracy: 80, type: "물", category: "특수", pp: 5, description: "대량의 물을 발사해 공격한다. (The target is blasted by a huge volume of water launched under great pressure.)" },
      { nameKo: "베어가르기", nameEn: "Razor Shell", power: 75, accuracy: 95, type: "물", category: "물리", pp: 10, description: "날카로운 껍질로 베어 공격한다. (The user cuts its target with sharp shells. This may also lower the target's Defense stat.)" },
      { nameKo: "칼춤", nameEn: "Swords Dance", power: null, accuracy: null, type: "노말", category: "변화", pp: 20, description: "격렬한 춤으로 공격을 크게 올린다. (A frenetic dance to uplift the fighting spirit. This sharply raises the user's Attack stat.)", logicExplanation: "설명: 사용자의 공격을 2랭크 올린다.\n공식: user.stages.attack += 2" }
    ]
  },
  {
    id: 152,
    nameKo: "주리비얀",
    nameEn: "Snivy",
    finalFormKo: "샤로다",
    finalFormEn: "Serperior",
    type: ["풀"],
    stats: { hp: 45, attack: 45, defense: 55, spAttack: 45, spDefense: 55, speed: 63 },
    statTotal: 308,
    battleNote: "샤로다: 빠른 스피드와 변화기, 리프스톰 같은 특수기로 견제하는 운영형 스타팅이다. 심술꾸러기 숨겨진 특성으로 능력치 변화를 뒤집는다.",
    evolution: { evoLevel: 17, nextEvoId: 153 },
    ability: "심록",
    appearance: { outer: "transparent", core: "#6FBE4A", bars: ["#F5F0D4", "#3A7D3D"] },
    moves: [
      { nameKo: "덩굴채찍", nameEn: "Vine Whip", power: 45, accuracy: 100, type: "풀", category: "물리", pp: 25, description: "덩굴을 휘둘러 상대를 때린다. (The target is struck with slender, whiplike vines.)" },
      { nameKo: "뱀눈초리", nameEn: "Glare", power: null, accuracy: 100, type: "노말", category: "변화", pp: 30, description: "무서운 눈빛으로 상대를 마비시킨다. (The user intimidates the target with the pattern on its belly to cause paralysis.)", logicExplanation: "설명: 상대를 마비 상태로 만든다.\\n공식: target.status = 'paralysis'" },
      { nameKo: "성장", nameEn: "Growth", power: null, accuracy: null, type: "노말", category: "변화", pp: 20, description: "몸을 크게 만들어 공격 능력을 올린다. (The user's body grows all at once, raising the Attack and Sp. Atk stats.)", logicExplanation: "설명: 사용자의 공격과 특수공격을 각각 1랭크 올린다.\\n공식: user.stages.attack += 1; user.stages.spAttack += 1" }
    ]
  },
  {
    id: 153,
    nameKo: "샤비",
    nameEn: "Servine",
    finalFormKo: "샤로다",
    finalFormEn: "Serperior",
    type: ["풀"],
    stats: { hp: 60, attack: 60, defense: 75, spAttack: 60, spDefense: 75, speed: 83 },
    statTotal: 413,
    battleNote: "샤로다: 빠른 스피드와 변화기, 리프스톰 같은 특수기로 견제하는 운영형 스타팅이다. 심술꾸러기 숨겨진 특성으로 능력치 변화를 뒤집는다.",
    evolution: { evoLevel: 36, nextEvoId: 154 },
    ability: "심록",
    appearance: { outer: "transparent", core: "#4EAE43", bars: ["#E8E0B0", "#2A6A32"] },
    moves: [
      { nameKo: "리프블레이드", nameEn: "Leaf Blade", power: 90, accuracy: 100, type: "풀", category: "물리", pp: 15, description: "잎사귀를 검처럼 휘둘러 베어낸다. (The user handles a sharp leaf like a sword and attacks by cutting its target.)" },
      { nameKo: "씨뿌리기", nameEn: "Leech Seed", power: null, accuracy: 90, type: "풀", category: "변화", pp: 10, description: "씨앗을 심어 매 턴 체력을 빼앗는다. (Plants a seed that drains HP each turn.)", logicExplanation: "설명: 상대에게 씨앗을 심어 매 턴 체력을 흡수한다." },
      { nameKo: "리플렉터", nameEn: "Reflect", power: null, accuracy: null, type: "에스퍼", category: "변화", pp: 20, description: "이상한 벽을 만들어 물리공격을 약하게 한다. (A wondrous wall of light is put up to reduce damage from physical attacks for five turns.)" }
    ]
  },
  {
    id: 154,
    nameKo: "샤로다",
    nameEn: "Serperior",
    finalFormKo: "샤로다",
    finalFormEn: "Serperior",
    type: ["풀"],
    stats: { hp: 75, attack: 75, defense: 95, spAttack: 75, spDefense: 95, speed: 113 },
    statTotal: 528,
    battleNote: "샤로다: 빠른 스피드와 변화기, 리프스톰 같은 특수기로 견제하는 운영형 스타팅이다. 심술꾸러기 숨겨진 특성으로 능력치 변화를 뒤집어 후반 스윕도 노릴 수 있다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: "심록",
    hiddenAbility: "심술꾸러기",
    appearance: { outer: "transparent", core: "#2F9A41", bars: ["#F5E6A7", "#1F5A2A"] },
    moves: [
      { nameKo: "리프스톰", nameEn: "Leaf Storm", power: 130, accuracy: 90, type: "풀", category: "특수", pp: 5, description: "거센 잎폭풍으로 공격하고 자신의 특수공격이 크게 떨어진다. (The user whips up a storm of leaves around the target. The attack's recoil sharply reduces the user's Sp. Atk stat.)" },
      { nameKo: "용의숨결", nameEn: "Dragon Breath", power: 60, accuracy: 100, type: "드래곤", category: "특수", pp: 20, description: "강한 숨결로 공격한다. 마비시킬 때가 있다. (The user exhales a mighty gust that inflicts damage. It may also paralyze the target.)" },
      { nameKo: "뱀눈초리", nameEn: "Glare", power: null, accuracy: 100, type: "노말", category: "변화", pp: 30, description: "무서운 눈빛으로 상대를 마비시킨다. (The user intimidates the target with the pattern on its belly to cause paralysis.)" }
    ]
  }

];
