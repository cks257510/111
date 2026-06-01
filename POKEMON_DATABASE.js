const POKEMON_DATABASE = [
  {
    id: 1,
    nameKo: "이상해씨",
    nameEn: "Bulbasaur",
    finalFormKo: "이상해꽃",
    finalFormEn: "Venusaur",
    type: ["풀", "독"],
    stats: { hp: 45, attack: 49, defense: 49, spAttack: 65, spDefense: 65, speed: 45 },
    statTotal: 318,
    battleNote: "이상해꽃: 씨앗과 덩굴을 활용해 회복과 견제를 동시에 노리는 벌키한 초반 포켓몬으로, 최종진화형 이상해꽃은 씨뿌리기·수면가루·광합성 같은 지속전이 강하다.",
    evolution: { evoLevel: 16, nextEvoId: 2 },
    ability: null,
    appearance: { outer: "transparent", core: "#78C850", bars: ["#4F9D69", "#FFFFFF"] },
    moves: [
      {
        nameKo: "몸통박치기",
        nameEn: "Tackle",
        power: 50,
        accuracy: 100,
        type: "노말",
        category: "물리",
        pp: 35,
        description: "온몸을 부딪쳐서 공격한다. (A physical attack in which the user charges and slams into the target with its whole body.)"
      },
      {
        nameKo: "씨뿌리기",
        nameEn: "Leech Seed",
        power: null,
        accuracy: 90,
        type: "풀",
        category: "변화",
        pp: 10,
        description: "상대에게 씨앗을 심어 매 턴 체력을 흡수한다. (A seed is planted on the target. It steals some HP from the target every turn.)",
        logicRef: "leech_seed",
        logicExplanation: "공식: target.statusEffects.leechSeed = true; turnEndDrain = floor(target.maxHP / 8); target.hp -= turnEndDrain; user.hp = min(user.maxHP, user.hp + turnEndDrain) | 규칙: 풀 타입은 씨뿌리기 면역, 교체해도 씨앗 효과는 유지, 대상은 매 턴 종료 시 자동으로 피해를 입는다."
      },
      {
        nameKo: "덩굴채찍",
        nameEn: "Vine Whip",
        power: 45,
        accuracy: 100,
        type: "풀",
        category: "물리",
        pp: 25,
        description: "가느다란 덩굴로 상대를 때려서 공격한다. (The target is struck with slender, whiplike vines to inflict damage.)"
      }
    ]
  },
  {
    id: 2,
    nameKo: "이상해풀",
    nameEn: "Ivysaur",
    finalFormKo: "이상해꽃",
    finalFormEn: "Venusaur",
    type: ["풀", "독"],
    stats: { hp: 60, attack: 62, defense: 63, spAttack: 80, spDefense: 80, speed: 60 },
    statTotal: 405,
    battleNote: "이상해꽃으로 성장하는 중간 단계로, 특수방어와 특수공격이 상승하여 더 안정적인 풀타입 기술 운용이 가능하다.",
    evolution: { evoLevel: 32, nextEvoId: 3 },
    ability: null,
    appearance: { outer: "transparent", core: "#78C850", bars: ["#FF69B4", "#4F9D69"] },
    moves: [
      {
        nameKo: "돌진",
        nameEn: "Take Down",
        power: 90,
        accuracy: 85,
        type: "노말",
        category: "물리",
        pp: 20,
        description: "기세를 몰아 부딪쳐 공격하지만 자신도 피해를 입는다. (A reckless, full-body charge attack for slamming into the target. This also damages the user a little.)",
        logicExplanation: "공식: recoil = floor(damage / 4); user.hp -= recoil | 규칙: 가한 데미지의 1/4만큼 사용자도 반동 데미지를 입는다."
      },
      {
        nameKo: "수면가루",
        nameEn: "Sleep Powder",
        power: null,
        accuracy: 75,
        type: "풀",
        category: "변화",
        pp: 15,
        description: "수면을 유도하는 가루를 뿌려 상대를 잠재운다. (The user scatters a big cloud of sleep-inducing dust around the target.)",
        logicRef: "sleep_powder",
        logicExplanation: "공식: target.status = 'sleep'; target.sleepTurns = random(1,3) | 규칙: 이미 상태이상이면 실패, 게임 내 수면 면역 대상은 별도 처리."
      },
      {
        nameKo: "잎날가르기",
        nameEn: "Razor Leaf",
        power: 55,
        accuracy: 95,
        type: "풀",
        category: "물리",
        pp: 25,
        description: "날카로운 잎사귀로 상대를 벤다. 급소에 맞기 쉽다. (Sharp-edged leaves are launched to slash at the opposing team. Critical hits land more easily.)"
      }
    ]
  },
  {
    id: 3,
    nameKo: "이상해꽃",
    nameEn: "Venusaur",
    finalFormKo: "이상해꽃",
    finalFormEn: "Venusaur",
    type: ["풀", "독"],
    stats: { hp: 80, attack: 82, defense: 83, spAttack: 100, spDefense: 100, speed: 80 },
    statTotal: 525,
    battleNote: "이상해씨의 최종 진화형으로, 준수한 내구와 높은 특수공격을 바탕으로 장기전에 능한 훌륭한 딜탱 포켓몬이다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: null,
    appearance: { outer: "transparent", core: "#78C850", bars: ["#FF1493", "#8B4513"] },
    moves: [
      {
        nameKo: "광합성",
        nameEn: "Synthesis",
        power: null,
        accuracy: null,
        type: "풀",
        category: "변화",
        pp: 5,
        description: "햇빛을 받아 자신의 체력을 회복한다. (The user restores its own HP. The amount of HP regained varies with the weather.)",
        logicRef: "synthesis",
        logicExplanation: "공식: if weather == 'sunny': heal = floor(user.maxHP * 2 / 3) else heal = floor(user.maxHP / 2); user.hp = min(user.maxHP, user.hp + heal) | 규칙: 최대 체력의 1/2을 회복한다(쾌청 시 2/3)."
      },
      {
        nameKo: "솔라빔",
        nameEn: "Solar Beam",
        power: 120,
        accuracy: 100,
        type: "풀",
        category: "특수",
        pp: 10,
        description: "1턴째에 빛을 모아 2턴째에 적에게 발사한다. (In this two-turn attack, the user gathers light, then blasts a bundled beam on the next turn.)",
        logicExplanation: "공식: turn 1 = charge; turn 2 = damage | 규칙: 쾌청 상태일 때는 1턴째에 바로 발사한다."
      },
      {
        nameKo: "오물폭탄",
        nameEn: "Sludge Bomb",
        power: 90,
        accuracy: 100,
        type: "독",
        category: "특수",
        pp: 10,
        description: "오물을 던져 공격한다. 상대를 독 상태로 만들 때가 있다. (Unsanitary sludge is hurled at the target. This may also poison the target.)",
        logicExplanation: "공식: if random(100) < 30: target.status = 'poison' | 규칙: 강철, 독 타입은 독에 걸리지 않는다."
      }
    ]
  },
  {
    id: 4,
    nameKo: "파이리",
    nameEn: "Charmander",
    finalFormKo: "리자몽",
    finalFormEn: "Charizard",
    type: ["불꽃"],
    stats: { hp: 39, attack: 52, defense: 43, spAttack: 60, spDefense: 50, speed: 65 },
    statTotal: 309,
    battleNote: "리자몽: 종족값만 보면 특수형 어태커임에도 불구하고, 준수한 공격 종족값과 넓은 기술폭으로 특이하게도 형태가 고정되지 않고 물리형, 특수형, 쌍두형으로 운용할 수 있는 잠재력이 크다.",
    evolution: { evoLevel: 16, nextEvoId: 5 },
    ability: null,
    appearance: { outer: "transparent", core: "#F08030", bars: ["#F8D030", "#FFFFFF"] },
    moves: [
      {
        nameKo: "할퀴기",
        nameEn: "Scratch",
        power: 40,
        accuracy: 100,
        type: "노말",
        category: "물리",
        pp: 35,
        description: "날카로운 발톱으로 할퀴어 공격한다. (Hard, pointed, sharp claws rake the target to inflict damage.)"
      },
      {
        nameKo: "불꽃세례",
        nameEn: "Ember",
        power: 40,
        accuracy: 100,
        type: "불꽃",
        category: "특수",
        pp: 25,
        description: "작은 불꽃을 발사하여 공격한다. 화상을 입힐 때가 있다. (The target is attacked with small flames. This may also leave the target with a burn.)",
        logicExplanation: "공식: if random(100) < 10: target.status = 'burn' | 규칙: 불꽃 타입은 화상에 걸리지 않는다."
      },
      {
        nameKo: "연막",
        nameEn: "Smokescreen",
        power: null,
        accuracy: 100,
        type: "노말",
        category: "변화",
        pp: 20,
        description: "연막을 쳐서 상대의 명중률을 떨어뜨린다. (The user releases an obscuring cloud of smoke or ink. This lowers the target's accuracy.)",
        logicExplanation: "공식: target.stages.accuracy -= 1 | 규칙: 명중률 랭크 상/하한선 규정에 따름."
      }
    ]
  },
  {
    id: 5,
    nameKo: "리자드",
    nameEn: "Charmeleon",
    finalFormKo: "리자몽",
    finalFormEn: "Charizard",
    type: ["불꽃"],
    stats: { hp: 58, attack: 64, defense: 58, spAttack: 80, spDefense: 65, speed: 80 },
    statTotal: 405,
    battleNote: "리자몽으로 가기 위한 중간 형태로, 공격과 스피드가 상승하여 어태커로서의 면모를 서서히 드러낸다.",
    evolution: { evoLevel: 36, nextEvoId: 6 },
    ability: null,
    appearance: { outer: "transparent", core: "#F08030", bars: ["#C62828", "#FFFFFF"] },
    moves: [
      {
        nameKo: "용의분노",
        nameEn: "Dragon Rage",
        power: null,
        accuracy: 100,
        type: "드래곤",
        category: "특수",
        pp: 10,
        description: "분노의 충격파로 공격한다. 반드시 40의 정해진 데미지를 준다. (This attack hits the target with a shock wave of pure rage. This attack always inflicts 40 HP damage.)",
        logicExplanation: "공식: damage = 40 | 규칙: 상성 및 방어력에 상관없이 고정 40 데미지."
      },
      {
        nameKo: "화염방사",
        nameEn: "Flamethrower",
        power: 90,
        accuracy: 100,
        type: "불꽃",
        category: "특수",
        pp: 15,
        description: "강렬한 불꽃을 뿜어 공격한다. 화상을 입힐 때가 있다. (The target is scorched with an intense blast of fire. This may also leave the target with a burn.)",
        logicExplanation: "공식: if random(100) < 10: target.status = 'burn' | 규칙: 불꽃 타입 면역 적용."
      },
      {
        nameKo: "베어가르기",
        nameEn: "Slash",
        power: 70,
        accuracy: 100,
        type: "노말",
        category: "물리",
        pp: 20,
        description: "날카로운 낫이나 발톱 등으로 상대를 벤다. 급소에 맞기 쉽다. (The target is attacked with a slash of claws or blades. Critical hits land more easily.)"
      }
    ]
  },
  {
    id: 6,
    nameKo: "리자몽",
    nameEn: "Charizard",
    finalFormKo: "리자몽",
    finalFormEn: "Charizard",
    type: ["불꽃", "비행"],
    stats: { hp: 78, attack: 84, defense: 78, spAttack: 109, spDefense: 85, speed: 100 },
    statTotal: 534,
    battleNote: "뛰어난 스피드와 특수공격을 겸비한 에이스 포켓몬으로, 불꽃/비행의 타점으로 적을 빠르게 제압하는 고속 어태커다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: null,
    appearance: { outer: "transparent", core: "#F08030", bars: ["#6890F0", "#FFFFFF"] },
    moves: [
      {
        nameKo: "불대문자",
        nameEn: "Fire Blast",
        power: 110,
        accuracy: 85,
        type: "불꽃",
        category: "특수",
        pp: 5,
        description: "큰대(大)자 모양의 불꽃으로 상대를 태운다. 화상을 입힐 때가 있다. (The target is attacked with an intense blast of all-consuming fire. This may also leave the target with a burn.)",
        logicExplanation: "공식: if random(100) < 10: target.status = 'burn'"
      },
      {
        nameKo: "에어슬래시",
        nameEn: "Air Slash",
        power: 75,
        accuracy: 95,
        type: "비행",
        category: "특수",
        pp: 15,
        description: "하늘을 가르는 칼바람으로 공격한다. 상대를 풀죽게 할 때가 있다. (The user attacks with a blade of air that slices even the sky. This may also make the target flinch.)",
        logicExplanation: "공식: if random(100) < 30: target.flinch = true | 규칙: 상대보다 먼저 공격했을 때만 움찔 효과 발생."
      },
      {
        nameKo: "용의춤",
        nameEn: "Dragon Dance",
        power: null,
        accuracy: null,
        type: "드래곤",
        category: "변화",
        pp: 20,
        description: "기합을 넣어 자신의 공격과 스피드를 올린다. (The user vigorously performs a mystic, powerful dance that raises its Attack and Speed stats.)",
        logicExplanation: "공식: user.stages.attack += 1; user.stages.speed += 1 | 규칙: 랭크 상한선 6단계 적용."
      }
    ]
  },
  {
    id: 7,
    nameKo: "꼬부기",
    nameEn: "Squirtle",
    finalFormKo: "거북왕",
    finalFormEn: "Blastoise",
    type: ["물"],
    stats: { hp: 44, attack: 48, defense: 65, spAttack: 50, spDefense: 64, speed: 43 },
    statTotal: 314,
    battleNote: "거북왕: 방어와 특수방어가 뛰어나며, 다양한 견제기와 보조기로 안정적인 플레이를 주도하는 밸런스형 수비 포켓몬이다.",
    evolution: { evoLevel: 16, nextEvoId: 8 },
    ability: null,
    appearance: { outer: "transparent", core: "#6890F0", bars: ["#F8D030", "#FFFFFF"] },
    moves: [
      {
        nameKo: "몸통박치기",
        nameEn: "Tackle",
        power: 50,
        accuracy: 100,
        type: "노말",
        category: "물리",
        pp: 35,
        description: "온몸을 부딪쳐서 공격한다. (A physical attack in which the user charges and slams into the target with its whole body.)"
      },
      {
        nameKo: "물대포",
        nameEn: "Water Gun",
        power: 40,
        accuracy: 100,
        type: "물",
        category: "특수",
        pp: 25,
        description: "물대포를 발사하여 공격한다. (The target is blasted with a forceful shot of water.)"
      },
      {
        nameKo: "껍질숨기",
        nameEn: "Withdraw",
        power: null,
        accuracy: null,
        type: "물",
        category: "변화",
        pp: 40,
        description: "단단한 등껍질에 숨어 방어를 올린다. (The user withdraws its body into its hard shell, raising its Defense stat.)",
        logicExplanation: "공식: user.stages.defense += 1"
      }
    ]
  },
  {
    id: 8,
    nameKo: "어니부기",
    nameEn: "Wartortle",
    finalFormKo: "거북왕",
    finalFormEn: "Blastoise",
    type: ["물"],
    stats: { hp: 59, attack: 63, defense: 80, spAttack: 65, spDefense: 80, speed: 58 },
    statTotal: 405,
    battleNote: "방어막이 더욱 탄탄해지는 중간 형태로, 물 타입 특유의 안정성을 바탕으로 교전에서 버티며 딜을 넣는다.",
    evolution: { evoLevel: 36, nextEvoId: 9 },
    ability: null,
    appearance: { outer: "transparent", core: "#6890F0", bars: ["#FFFFFF", "#A8B820"] },
    moves: [
      {
        nameKo: "물기",
        nameEn: "Bite",
        power: 60,
        accuracy: 100,
        type: "악",
        category: "물리",
        pp: 25,
        description: "날카로운 이빨로 물어서 공격한다. 상대를 풀죽게 할 때가 있다. (The target is bitten with viciously sharp fangs. This may also make the target flinch.)",
        logicExplanation: "공식: if random(100) < 30: target.flinch = true"
      },
      {
        nameKo: "물의파동",
        nameEn: "Water Pulse",
        power: 60,
        accuracy: 100,
        type: "물",
        category: "특수",
        pp: 20,
        description: "물의 파동을 일으켜 공격한다. 상대를 혼란에 빠뜨릴 때가 있다. (The user attacks the target with a pulsing blast of water. This may also confuse the target.)",
        logicExplanation: "공식: if random(100) < 20: target.statusEffects.confusion = true"
      },
      {
        nameKo: "아쿠아테일",
        nameEn: "Aqua Tail",
        power: 90,
        accuracy: 90,
        type: "물",
        category: "물리",
        pp: 10,
        description: "거친 파도처럼 꼬리를 휘둘러 공격한다. (The user attacks by swinging its tail as if it were a vicious wave in a raging storm.)"
      }
    ]
  },
  {
    id: 9,
    nameKo: "거북왕",
    nameEn: "Blastoise",
    finalFormKo: "거북왕",
    finalFormEn: "Blastoise",
    type: ["물"],
    stats: { hp: 79, attack: 83, defense: 100, spAttack: 85, spDefense: 105, speed: 78 },
    statTotal: 530,
    battleNote: "단단한 등껍질을 이용한 튼튼한 내구력이 특징이며, 고위력 물타입 기술로 확실하게 반격하는 탱크형 포켓몬이다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: null,
    appearance: { outer: "transparent", core: "#6890F0", bars: ["#A0A0A0", "#F8D030"] },
    moves: [
      {
        nameKo: "파도타기",
        nameEn: "Surf",
        power: 90,
        accuracy: 100,
        type: "물",
        category: "특수",
        pp: 15,
        description: "큰 파도로 주위의 적을 공격한다. (The user attacks everything around it by swamping its surroundings with a giant wave.)"
      },
      {
        nameKo: "하이드로펌프",
        nameEn: "Hydro Pump",
        power: 110,
        accuracy: 80,
        type: "물",
        category: "특수",
        pp: 5,
        description: "엄청난 수압의 물을 맹렬한 기세로 뿜어내어 공격한다. (The target is blasted by a huge volume of water launched under great pressure.)"
      },
      {
        nameKo: "방어",
        nameEn: "Protect",
        power: null,
        accuracy: null,
        type: "노말",
        category: "변화",
        pp: 10,
        description: "그 턴의 적의 공격을 막아낸다. 연속으로 쓰면 실패하기 쉽다. (Enables the user to evade all attacks. Its chance of failing rises if it is used in succession.)",
        logicRef: "protect",
        logicExplanation: "공식: blockIncomingDamage = true for this turn | 규칙: 방어 성공 시 해당 턴의 모든 데미지 및 상태이상 무효, 연속 사용 시 성공 확률 반감."
      }
    ]
  },
  {
    id: 10,
    nameKo: "캐터피",
    nameEn: "Caterpie",
    finalFormKo: "버터플",
    finalFormEn: "Butterfree",
    type: ["벌레"],
    stats: { hp: 45, attack: 30, defense: 35, spAttack: 20, spDefense: 20, speed: 45 },
    statTotal: 195,
    battleNote: "버터플: 낮은 종족값을 복안 특성과 수면가루, 나비춤 등의 강력한 변화기로 극복하는 유틸형 벌레 포켓몬이다.",
    evolution: { evoLevel: 7, nextEvoId: 11 },
    ability: null,
    appearance: { outer: "transparent", core: "#A8B820", bars: ["#FF0000", "#FFFFFF"] },
    moves: [
      {
        nameKo: "몸통박치기",
        nameEn: "Tackle",
        power: 50,
        accuracy: 100,
        type: "노말",
        category: "물리",
        pp: 35,
        description: "온몸을 부딪쳐서 공격한다. (A physical attack in which the user charges and slams into the target with its whole body.)"
      },
      {
        nameKo: "실뿜기",
        nameEn: "String Shot",
        power: null,
        accuracy: 95,
        type: "벌레",
        category: "변화",
        pp: 40,
        description: "실을 뿜어 상대를 휘감아 스피드를 떨어뜨린다. (The targets are bound with silk blown from the user's mouth that harshly lowers the Speed stat.)",
        logicExplanation: "공식: target.stages.speed -= 2"
      },
      {
        nameKo: "벌레먹음",
        nameEn: "Bug Bite",
        power: 60,
        accuracy: 100,
        type: "벌레",
        category: "물리",
        pp: 20,
        description: "상대를 물어서 공격한다. 상대가 열매를 지니고 있으면 빼앗아 먹는다. (The user bites the target. If the target is holding a Berry, the user eats it and gains its effect.)",
        logicExplanation: "공식: if target.item.type == 'berry': user.consume(target.item); target.item = null"
      }
    ]
  },
  {
    id: 11,
    nameKo: "단데기",
    nameEn: "Metapod",
    finalFormKo: "버터플",
    finalFormEn: "Butterfree",
    type: ["벌레"],
    stats: { hp: 50, attack: 20, defense: 55, spAttack: 25, spDefense: 25, speed: 30 },
    statTotal: 205,
    battleNote: "단단해지기만을 쓰며 방어력을 극한으로 끌어올리지만 공격 수단이 제한적인 번데기 단계다.",
    evolution: { evoLevel: 10, nextEvoId: 12 },
    ability: null,
    appearance: { outer: "transparent", core: "#A8B820", bars: ["#4F9D69", "#FFFFFF"] },
    moves: [
      {
        nameKo: "단단해지기",
        nameEn: "Harden",
        power: null,
        accuracy: null,
        type: "노말",
        category: "변화",
        pp: 30,
        description: "몸에 힘을 주어 단단하게 만들어 방어를 올린다. (The user stiffens all the muscles in its body to raise its Defense stat.)",
        logicExplanation: "공식: user.stages.defense += 1"
      },
      {
        nameKo: "몸통박치기",
        nameEn: "Tackle",
        power: 50,
        accuracy: 100,
        type: "노말",
        category: "물리",
        pp: 35,
        description: "온몸을 부딪쳐서 공격한다. (A physical attack in which the user charges and slams into the target with its whole body.)"
      },
      {
        nameKo: "실뿜기",
        nameEn: "String Shot",
        power: null,
        accuracy: 95,
        type: "벌레",
        category: "변화",
        pp: 40,
        description: "실을 뿜어 스피드를 떨어뜨린다. (The targets are bound with silk blown from the user's mouth that harshly lowers the Speed stat.)",
        logicExplanation: "공식: target.stages.speed -= 2"
      }
    ]
  },
  {
    id: 12,
    nameKo: "버터플",
    nameEn: "Butterfree",
    finalFormKo: "버터플",
    finalFormEn: "Butterfree",
    type: ["벌레", "비행"],
    stats: { hp: 60, attack: 45, defense: 50, spAttack: 90, spDefense: 80, speed: 70 },
    statTotal: 395,
    battleNote: "초반에 빠르게 최종 진화하여 다양한 가루 기술로 상대를 농락하는 서포터 겸 기점 마련 포켓몬이다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: null,
    appearance: { outer: "transparent", core: "#6890F0", bars: ["#FFFFFF", "#000000"] },
    moves: [
      {
        nameKo: "수면가루",
        nameEn: "Sleep Powder",
        power: null,
        accuracy: 75,
        type: "풀",
        category: "변화",
        pp: 15,
        description: "수면을 유도하는 가루를 뿌려 상대를 잠재운다. (The user scatters a big cloud of sleep-inducing dust around the target.)",
        logicRef: "sleep_powder",
        logicExplanation: "공식: target.status = 'sleep'; target.sleepTurns = random(1,3) | 규칙: 이미 상태이상이면 실패, 게임 내 수면 면역 대상은 별도 처리."
      },
      {
        nameKo: "나비춤",
        nameEn: "Quiver Dance",
        power: null,
        accuracy: null,
        type: "벌레",
        category: "변화",
        pp: 20,
        description: "아름답고 신비하게 춤을 춘다. 자신의 특수공격, 특수방어, 스피드를 올린다. (The user lightly performs a beautiful, mystic dance. This boosts the user's Sp. Atk, Sp. Def, and Speed stats.)",
        logicExplanation: "공식: user.stages.spAttack += 1; user.stages.spDefense += 1; user.stages.speed += 1"
      },
      {
        nameKo: "벌레의야단법석",
        nameEn: "Bug Buzz",
        power: 90,
        accuracy: 100,
        type: "벌레",
        category: "특수",
        pp: 10,
        description: "날개를 진동시켜 음파를 날려 공격한다. 상대의 특수방어를 떨어뜨릴 때가 있다. (The user generates a damaging sound wave by vibration. This may also lower the target's Sp. Def stat.)",
        logicExplanation: "공식: if random(100) < 10: target.stages.spDefense -= 1"
      }
    ]
  },
  {
    id: 13,
    nameKo: "뿔충이",
    nameEn: "Weedle",
    finalFormKo: "독침붕",
    finalFormEn: "Beedrill",
    type: ["벌레", "독"],
    stats: { hp: 40, attack: 35, defense: 30, spAttack: 20, spDefense: 20, speed: 50 },
    statTotal: 195,
    battleNote: "독침붕: 빠른 스피드와 강력한 공격력을 앞세워 상대를 찌르는 물리형 벌레 포켓몬이다.",
    evolution: { evoLevel: 7, nextEvoId: 14 },
    ability: null,
    appearance: { outer: "transparent", core: "#F08030", bars: ["#FFD700", "#FFFFFF"] },
    moves: [
      {
        nameKo: "독침",
        nameEn: "Poison Sting",
        power: 15,
        accuracy: 100,
        type: "독",
        category: "물리",
        pp: 35,
        description: "독이 있는 바늘로 상대를 찔러 공격한다. 상대를 독 상태로 만들 때가 있다. (The user stabs the target with a poisonous stinger. This may also poison the target.)",
        logicExplanation: "공식: if random(100) < 30: target.status = 'poison'"
      },
      {
        nameKo: "실뿜기",
        nameEn: "String Shot",
        power: null,
        accuracy: 95,
        type: "벌레",
        category: "변화",
        pp: 40,
        description: "실을 뿜어 스피드를 떨어뜨린다. (The targets are bound with silk blown from the user's mouth that harshly lowers the Speed stat.)",
        logicExplanation: "공식: target.stages.speed -= 2"
      },
      {
        nameKo: "벌레먹음",
        nameEn: "Bug Bite",
        power: 60,
        accuracy: 100,
        type: "벌레",
        category: "물리",
        pp: 20,
        description: "상대를 물어서 공격한다. 상대가 열매를 지니고 있으면 빼앗아 먹는다. (The user bites the target. If the target is holding a Berry, the user eats it and gains its effect.)",
        logicExplanation: "공식: if target.item.type == 'berry': user.consume(target.item); target.item = null"
      }
    ]
  },
  {
    id: 14,
    nameKo: "딱충이",
    nameEn: "Kakuna",
    finalFormKo: "독침붕",
    finalFormEn: "Beedrill",
    type: ["벌레", "독"],
    stats: { hp: 45, attack: 25, defense: 50, spAttack: 25, spDefense: 25, speed: 35 },
    statTotal: 205,
    battleNote: "단데기처럼 방어에만 특화된 번데기 형태로, 견뎌내어 독침붕으로 각성할 때를 기다린다.",
    evolution: { evoLevel: 10, nextEvoId: 15 },
    ability: null,
    appearance: { outer: "transparent", core: "#F8D030", bars: ["#000000", "#FFFFFF"] },
    moves: [
      {
        nameKo: "단단해지기",
        nameEn: "Harden",
        power: null,
        accuracy: null,
        type: "노말",
        category: "변화",
        pp: 30,
        description: "몸에 힘을 주어 단단하게 만들어 방어를 올린다. (The user stiffens all the muscles in its body to raise its Defense stat.)",
        logicExplanation: "공식: user.stages.defense += 1"
      },
      {
        nameKo: "독침",
        nameEn: "Poison Sting",
        power: 15,
        accuracy: 100,
        type: "독",
        category: "물리",
        pp: 35,
        description: "독이 있는 바늘로 찔러 공격한다. (The user stabs the target with a poisonous stinger. This may also poison the target.)",
        logicExplanation: "공식: if random(100) < 30: target.status = 'poison'"
      },
      {
        nameKo: "실뿜기",
        nameEn: "String Shot",
        power: null,
        accuracy: 95,
        type: "벌레",
        category: "변화",
        pp: 40,
        description: "실을 뿜어 스피드를 떨어뜨린다. (The targets are bound with silk blown from the user's mouth that harshly lowers the Speed stat.)",
        logicExplanation: "공식: target.stages.speed -= 2"
      }
    ]
  },
  {
    id: 15,
    nameKo: "독침붕",
    nameEn: "Beedrill",
    finalFormKo: "독침붕",
    finalFormEn: "Beedrill",
    type: ["벌레", "독"],
    stats: { hp: 65, attack: 90, defense: 40, spAttack: 45, spDefense: 80, speed: 75 },
    statTotal: 395,
    battleNote: "치명적인 독 타입 공격과 준수한 물리 공격력으로 적의 허점을 찌르는 유리대포형 포켓몬이다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: null,
    appearance: { outer: "transparent", core: "#F8D030", bars: ["#000000", "#FF0000"] },
    moves: [
      {
        nameKo: "더블니들",
        nameEn: "Twineedle",
        power: 25,
        accuracy: 100,
        type: "벌레",
        category: "물리",
        pp: 20,
        description: "양팔의 바늘로 상대를 2번 연속으로 찔러 공격한다. 독 상태로 만들 때가 있다. (The user damages the target twice in succession by jabbing it with two spikes. This may also poison the target.)",
        logicExplanation: "공식: hits = 2; if random(100) < 20: target.status = 'poison' | 규칙: 위력 25로 2회 타격, 마지막 타격 후 20% 확률로 독."
      },
      {
        nameKo: "독찌르기",
        nameEn: "Poison Jab",
        power: 80,
        accuracy: 100,
        type: "독",
        category: "물리",
        pp: 20,
        description: "독이 묻은 촉수나 팔로 상대를 찔러 공격한다. 독 상태로 만들 때가 있다. (The target is stabbed with a tentacle or arm steeped in poison. This may also poison the target.)",
        logicExplanation: "공식: if random(100) < 30: target.status = 'poison'"
      },
      {
        nameKo: "유턴",
        nameEn: "U-turn",
        power: 70,
        accuracy: 100,
        type: "벌레",
        category: "물리",
        pp: 20,
        description: "공격한 다음 재빨리 진영으로 돌아와 대기 중인 포켓몬과 교체한다. (After making its attack, the user rushes back to switch places with a party Pokémon in waiting.)",
        logicExplanation: "공식: damage; user.switch() | 규칙: 타격 후 스쿼드의 교체 가능한 포켓몬 목록 창을 띄운다."
      }
    ]
  },
  {
    id: 16,
    nameKo: "구구",
    nameEn: "Pidgey",
    finalFormKo: "피죤투",
    finalFormEn: "Pidgeot",
    type: ["노말", "비행"],
    stats: { hp: 40, attack: 45, defense: 40, spAttack: 35, spDefense: 35, speed: 56 },
    statTotal: 251,
    battleNote: "피죤투: 높은 스피드와 범용성 좋은 비행 타입 기술로 극초반부터 후반까지 꾸준히 활약할 수 있는 스탠다드한 비행 요원이다.",
    evolution: { evoLevel: 18, nextEvoId: 17 },
    ability: null,
    appearance: { outer: "transparent", core: "#C2B280", bars: ["#A0522D", "#FFFFFF"] },
    moves: [
      {
        nameKo: "몸통박치기",
        nameEn: "Tackle",
        power: 50,
        accuracy: 100,
        type: "노말",
        category: "물리",
        pp: 35,
        description: "온몸을 부딪쳐서 공격한다. (A physical attack in which the user charges and slams into the target with its whole body.)"
      },
      {
        nameKo: "모래뿌리기",
        nameEn: "Sand Attack",
        power: null,
        accuracy: 100,
        type: "땅",
        category: "변화",
        pp: 15,
        description: "상대의 얼굴에 모래를 뿌려 명중률을 떨어뜨린다. (Sand is hurled in the target's face, reducing the target's accuracy.)",
        logicExplanation: "공식: target.stages.accuracy -= 1"
      },
      {
        nameKo: "바람일으키기",
        nameEn: "Gust",
        power: 40,
        accuracy: 100,
        type: "비행",
        category: "특수",
        pp: 35,
        description: "날개로 강한 바람을 일으켜 상대를 공격한다. 공중에 있는 적에게는 2배의 데미지. (A gust of wind is whipped up by wings and launched at the target to inflict damage.)"
      }
    ]
  },
  {
    id: 17,
    nameKo: "피죤",
    nameEn: "Pidgeotto",
    finalFormKo: "피죤투",
    finalFormEn: "Pidgeot",
    type: ["노말", "비행"],
    stats: { hp: 63, attack: 60, defense: 55, spAttack: 50, spDefense: 50, speed: 71 },
    statTotal: 349,
    battleNote: "구구보다 더 날카로운 비행 기술을 습득하며, 스피드 이점을 살려 선공을 잡기 쉬워진다.",
    evolution: { evoLevel: 36, nextEvoId: 18 },
    ability: null,
    appearance: { outer: "transparent", core: "#C2B280", bars: ["#FF4500", "#FFFFFF"] },
    moves: [
      {
        nameKo: "전광석화",
        nameEn: "Quick Attack",
        power: 40,
        accuracy: 100,
        type: "노말",
        category: "물리",
        pp: 30,
        description: "굉장한 속도로 움직여서 상대를 공격한다. 반드시 선제공격할 수 있다. (The user lunges at the target at a speed that makes it almost invisible. This move always goes first.)",
        logicExplanation: "공식: priority = 1 | 규칙: 스피드 스탯에 우선하여 선제 공격권을 가진다."
      },
      {
        nameKo: "날개치기",
        nameEn: "Wing Attack",
        power: 60,
        accuracy: 100,
        type: "비행",
        category: "물리",
        pp: 35,
        description: "크게 펼친 날개를 상대에게 부딪쳐서 공격한다. (The target is struck with large, imposing wings spread wide to inflict damage.)"
      },
      {
        nameKo: "깃털댄스",
        nameEn: "Feather Dance",
        power: null,
        accuracy: 100,
        type: "비행",
        category: "변화",
        pp: 15,
        description: "깃털을 상대의 몸에 엉겨붙게 하여 공격력을 크게 떨어뜨린다. (The user covers the target's body with a mass of down that harshly lowers its Attack stat.)",
        logicExplanation: "공식: target.stages.attack -= 2"
      }
    ]
  },
  {
    id: 18,
    nameKo: "피죤투",
    nameEn: "Pidgeot",
    finalFormKo: "피죤투",
    finalFormEn: "Pidgeot",
    type: ["노말", "비행"],
    stats: { hp: 83, attack: 80, defense: 75, spAttack: 70, spDefense: 70, speed: 101 },
    statTotal: 479,
    battleNote: "100이 넘는 스피드와 브레이브버드, 폭풍 등의 고위력기를 무장하여 선봉이나 후반 스위퍼로 무난하게 운용된다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: null,
    appearance: { outer: "transparent", core: "#C2B280", bars: ["#FF4500", "#FFD700"] },
    moves: [
      {
        nameKo: "브레이브버드",
        nameEn: "Brave Bird",
        power: 120,
        accuracy: 100,
        type: "비행",
        category: "물리",
        pp: 15,
        description: "날개를 접고 낮은 고도로 돌격한다. 자신도 꽤 큰 피해를 입는다. (The user tucks in its wings and charges from a low altitude. This also damages the user quite a lot.)",
        logicExplanation: "공식: recoil = floor(damage / 3); user.hp -= recoil | 규칙: 가한 데미지의 1/3 반동."
      },
      {
        nameKo: "폭풍",
        nameEn: "Hurricane",
        power: 110,
        accuracy: 70,
        type: "비행",
        category: "특수",
        pp: 10,
        description: "강렬한 바람으로 상대를 감싸 공격한다. 상대를 혼란에 빠뜨릴 때가 있다. (The user attacks by wrapping its opponent in a fierce wind that flies up into the sky. This may also confuse the target.)",
        logicExplanation: "공식: if random(100) < 30: target.statusEffects.confusion = true | 규칙: 비가 올 때는 명중률 100%."
      },
      {
        nameKo: "순풍",
        nameEn: "Tailwind",
        power: null,
        accuracy: null,
        type: "비행",
        category: "변화",
        pp: 15,
        description: "격렬한 돌풍을 일으켜 아군 전원의 스피드를 올린다. 4턴 동안 유지된다. (The user whips up a turbulent whirlwind that ups the Speed stat of the user and its allies for four turns.)",
        logicExplanation: "공식: team.tailwindTurns = 4; team.members.speed *= 2"
      }
    ]
  },
  {
    id: 19,
    nameKo: "꼬렛",
    nameEn: "Rattata",
    finalFormKo: "레트라",
    finalFormEn: "Raticate",
    type: ["노말"],
    stats: { hp: 30, attack: 56, defense: 35, spAttack: 25, spDefense: 35, speed: 72 },
    statTotal: 253,
    battleNote: "레트라: 초반부터 분노의앞니나 필살앞니로 강력한 고정 데미지 압박을 주며 돌파구를 여는 초반 깡패다.",
    evolution: { evoLevel: 20, nextEvoId: 20 },
    ability: null,
    appearance: { outer: "transparent", core: "#A8A878", bars: ["#800080", "#FFFFFF"] },
    moves: [
      {
        nameKo: "몸통박치기",
        nameEn: "Tackle",
        power: 50,
        accuracy: 100,
        type: "노말",
        category: "물리",
        pp: 35,
        description: "온몸을 부딪쳐서 공격한다. (A physical attack in which the user charges and slams into the target with its whole body.)"
      },
      {
        nameKo: "전광석화",
        nameEn: "Quick Attack",
        power: 40,
        accuracy: 100,
        type: "노말",
        category: "물리",
        pp: 30,
        description: "굉장한 속도로 움직여서 상대를 공격한다. 반드시 선제공격할 수 있다. (The user lunges at the target at a speed that makes it almost invisible. This move always goes first.)",
        logicExplanation: "공식: priority = 1 | 규칙: 우선도 +1 판정."
      },
      {
        nameKo: "필살앞니",
        nameEn: "Hyper Fang",
        power: 80,
        accuracy: 90,
        type: "노말",
        category: "물리",
        pp: 15,
        description: "날카로운 앞니로 물어서 공격한다. 상대를 풀죽게 할 때가 있다. (The user bites hard on the target with its sharp front fangs. This may also make the target flinch.)",
        logicExplanation: "공식: if random(100) < 10: target.flinch = true"
      }
    ]
  },
  {
    id: 20,
    nameKo: "레트라",
    nameEn: "Raticate",
    finalFormKo: "레트라",
    finalFormEn: "Raticate",
    type: ["노말"],
    stats: { hp: 55, attack: 81, defense: 60, spAttack: 50, spDefense: 70, speed: 97 },
    statTotal: 413,
    battleNote: "내구는 부실하지만 분노의앞니를 통한 확정적인 반피 삭감으로 교체 플레이나 체력돼지 포켓몬의 카운터로 기능한다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: null,
    appearance: { outer: "transparent", core: "#D2B48C", bars: ["#8B4513", "#FFFFFF"] },
    moves: [
      {
        nameKo: "분노의앞니",
        nameEn: "Super Fang",
        power: null,
        accuracy: 90,
        type: "노말",
        category: "물리",
        pp: 10,
        description: "날카로운 앞니로 상대를 강하게 물어 상대의 남은 체력을 절반으로 깎는다. (The user chomps hard on the target with its sharp front fangs. This cuts the target's HP in half.)",
        logicExplanation: "공식: damage = max(1, floor(target.hp / 2)) | 규칙: 상대의 '현재' 남은 체력의 절반을 깎는다."
      },
      {
        nameKo: "기습",
        nameEn: "Sucker Punch",
        power: 80,
        accuracy: 100,
        type: "악",
        category: "물리",
        pp: 5,
        description: "상대보다 먼저 공격할 수 있다. 상대가 공격기술을 쓰지 않으면 실패한다. (This move enables the user to attack first. This move fails if the target is not readying an attack.)",
        logicExplanation: "공식: if target.selectedMove.category != '변화': priority = 1; else fail = true | 규칙: 우선도 +1. 상대가 변화기면 실패."
      },
      {
        nameKo: "이판사판태클",
        nameEn: "Double-Edge",
        power: 120,
        accuracy: 100,
        type: "노말",
        category: "물리",
        pp: 15,
        description: "목숨을 걸고 돌진해 공격한다. 자신도 꽤 큰 데미지를 입는다. (A reckless, life-risking tackle. This also damages the user quite a lot.)",
        logicExplanation: "공식: recoil = floor(damage / 3); user.hp -= recoil | 규칙: 가한 데미지의 1/3 반동."
      }
    ]
  },
  {
    id: 21,
    nameKo: "깨비참",
    nameEn: "Spearow",
    finalFormKo: "깨비드릴조",
    finalFormEn: "Fearow",
    type: ["노말", "비행"],
    stats: { hp: 40, attack: 60, defense: 30, spAttack: 31, spDefense: 31, speed: 70 },
    statTotal: 262,
    battleNote: "깨비드릴조: 피죤투에 비해 내구력은 떨어지지만, 쪼기로 시작되는 매서운 초반 공격 능력과 고속 물리 어태커로서의 입지를 다진다.",
    evolution: { evoLevel: 20, nextEvoId: 22 },
    ability: null,
    appearance: { outer: "transparent", core: "#8B4513", bars: ["#FF4500", "#FFFFFF"] },
    moves: [
      {
        nameKo: "쪼기",
        nameEn: "Peck",
        power: 35,
        accuracy: 100,
        type: "비행",
        category: "물리",
        pp: 35,
        description: "뾰족한 부리 등으로 상대를 찔러서 공격한다. (The target is jabbed with a sharply pointed beak or horn.)"
      },
      {
        nameKo: "따라가때리기",
        nameEn: "Pursuit",
        power: 40,
        accuracy: 100,
        type: "악",
        category: "물리",
        pp: 20,
        description: "교체하려는 상대에게 공격하면 2배의 위력을 준다. (The power of this attack move is doubled if it's used on a target that's switching out of battle.)",
        logicExplanation: "공식: if target.isSwitching: power *= 2; priority = 7"
      },
      {
        nameKo: "제비반환",
        nameEn: "Aerial Ace",
        power: 60,
        accuracy: null,
        type: "비행",
        category: "물리",
        pp: 20,
        description: "빠른 속도로 상대를 농락하며 벤다. 공격은 반드시 명중한다. (The user confounds the target with speed, then slashes. This attack never misses.)",
        logicExplanation: "공식: alwaysHit = true | 규칙: 회피율/명중률 무시 무조건 명중(공중날기 중인 적 제외)."
      }
    ]
  },
  {
    id: 22,
    nameKo: "깨비드릴조",
    nameEn: "Fearow",
    finalFormKo: "깨비드릴조",
    finalFormEn: "Fearow",
    type: ["노말", "비행"],
    stats: { hp: 65, attack: 90, defense: 65, spAttack: 61, spDefense: 61, speed: 100 },
    statTotal: 442,
    battleNote: "스피드 종족값 100을 활용한 회전부리로 비행 타입 타점을 준수하게 꽂아넣으며, 유턴을 활용한 치고 빠지기가 가능하다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: null,
    appearance: { outer: "transparent", core: "#8B4513", bars: ["#FFD700", "#FF4500"] },
    moves: [
      {
        nameKo: "회전부리",
        nameEn: "Drill Peck",
        power: 80,
        accuracy: 100,
        type: "비행",
        category: "물리",
        pp: 20,
        description: "부리를 축으로 하여 회전하면서 상대를 찔러 공격한다. (A corkscrewing attack with a sharp beak acting as a drill.)"
      },
      {
        nameKo: "유턴",
        nameEn: "U-turn",
        power: 70,
        accuracy: 100,
        type: "벌레",
        category: "물리",
        pp: 20,
        description: "공격한 다음 재빨리 진영으로 돌아와 대기 중인 포켓몬과 교체한다. (After making its attack, the user rushes back to switch places with a party Pokémon in waiting.)",
        logicExplanation: "공식: damage; user.switch() | 규칙: 타격 후 스쿼드의 교체 가능한 포켓몬 목록 창을 띄운다."
      },
      {
        nameKo: "은혜갚기",
        nameEn: "Return",
        power: 102,
        accuracy: 100,
        type: "노말",
        category: "물리",
        pp: 20,
        description: "트레이너를 따르는 만큼 위력이 강해진다. (A full-power attack that grows more powerful the more the user likes its Trainer.)",
        logicExplanation: "공식: power = max 친밀도 기준(통상적으로 102 적용) | 규칙: 기본 위력 102로 고정 계산."
      }
    ]
  },
  {
    id: 23,
    nameKo: "아보",
    nameEn: "Ekans",
    finalFormKo: "아보크",
    finalFormEn: "Arbok",
    type: ["독"],
    stats: { hp: 35, attack: 60, defense: 44, spAttack: 40, spDefense: 54, speed: 55 },
    statTotal: 288,
    battleNote: "아보크: 위협과 뱀눈초리를 활용한 물리 봉쇄 및 스피드 제어 능력으로 기점 마련에 특화된 상태이상 전문가다.",
    evolution: { evoLevel: 22, nextEvoId: 24 },
    ability: null,
    appearance: { outer: "transparent", core: "#800080", bars: ["#FFD700", "#FFFFFF"] },
    moves: [
      {
        nameKo: "김밥말이",
        nameEn: "Wrap",
        power: 15,
        accuracy: 90,
        type: "노말",
        category: "물리",
        pp: 20,
        description: "긴 몸이나 덩굴 등을 상대에게 감아 4~5턴 동안 조여서 공격한다. (A long body, vines, or the like are wrapped around the target, squeezing it for four to five turns.)",
        logicExplanation: "공식: target.bindTurns = random(4,5); endTurnDamage = floor(target.maxHP / 8) | 규칙: 지속 턴 동안 교체 불가 및 매 턴 종료 시 1/8 데미지."
      },
      {
        nameKo: "독침",
        nameEn: "Poison Sting",
        power: 15,
        accuracy: 100,
        type: "독",
        category: "물리",
        pp: 35,
        description: "독이 있는 바늘로 상대를 찔러 공격한다. 상대를 독 상태로 만들 때가 있다. (The user stabs the target with a poisonous stinger. This may also poison the target.)",
        logicExplanation: "공식: if random(100) < 30: target.status = 'poison'"
      },
      {
        nameKo: "뱀눈초리",
        nameEn: "Glare",
        power: null,
        accuracy: 100,
        type: "노말",
        category: "변화",
        pp: 30,
        description: "배의 무늬로 위협하여 상대를 마비 상태로 만든다. (The user intimidates the target with the pattern on its belly to cause paralysis.)",
        logicExplanation: "공식: target.status = 'paralysis' | 규칙: 마비 걸린 대상은 스피드가 1/2로 감소하며, 25% 확률로 행동 불능."
      }
    ]
  },
  {
    id: 24,
    nameKo: "아보크",
    nameEn: "Arbok",
    finalFormKo: "아보크",
    finalFormEn: "Arbok",
    type: ["독"],
    stats: { hp: 65, attack: 85, defense: 69, spAttack: 65, spDefense: 79, speed: 80 },
    statTotal: 438,
    battleNote: "똬리틀기를 통해 공격, 방어, 명중률을 동시에 올리며 더스트슈트 등의 고위력 독 기술을 안정적으로 구사한다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: null,
    appearance: { outer: "transparent", core: "#800080", bars: ["#FF0000", "#FFD700"] },
    moves: [
      {
        nameKo: "똬리틀기",
        nameEn: "Coil",
        power: null,
        accuracy: null,
        type: "독",
        category: "변화",
        pp: 20,
        description: "똬리를 틀어 집중한다. 공격, 방어, 명중률을 올린다. (The user coils up and concentrates. This raises its Attack and Defense stats as well as its accuracy.)",
        logicExplanation: "공식: user.stages.attack += 1; user.stages.defense += 1; user.stages.accuracy += 1"
      },
      {
        nameKo: "더스트슈트",
        nameEn: "Gunk Shot",
        power: 120,
        accuracy: 80,
        type: "독",
        category: "물리",
        pp: 5,
        description: "더러운 쓰레기를 쏘아 공격한다. 상대를 독 상태로 만들 때가 있다. (The user shoots filthy garbage at the target to attack. This may also poison the target.)",
        logicExplanation: "공식: if random(100) < 30: target.status = 'poison'"
      },
      {
        nameKo: "얼음엄니",
        nameEn: "Ice Fang",
        power: 65,
        accuracy: 95,
        type: "얼음",
        category: "물리",
        pp: 15,
        description: "냉기를 품은 이빨로 물어서 공격한다. 상대를 얼리거나 풀죽게 할 때가 있다. (The user bites with cold-infused fangs. This may also make the target flinch or leave it frozen.)",
        logicExplanation: "공식: if random(100) < 10: target.status = 'freeze'; if random(100) < 10: target.flinch = true"
      }
    ]
  },
  {
    id: 25,
    nameKo: "피카츄",
    nameEn: "Pikachu",
    finalFormKo: "라이츄",
    finalFormEn: "Raichu",
    type: ["전기"],
    stats: { hp: 35, attack: 55, defense: 40, spAttack: 50, spDefense: 50, speed: 90 },
    statTotal: 320,
    battleNote: "라이츄: 고속 어태커로서 전기 구슬을 지닌 피카츄로 극딜을 넣거나, 진화하여 스피드와 범용성을 챙기는 두 가지 선택지가 있다.",
    evolution: { evoLevel: 16, nextEvoId: 26 },
    ability: null,
    appearance: { outer: "transparent", core: "#F8D030", bars: ["#FF0000", "#000000"] },
    moves: [
      {
        nameKo: "전기쇼크",
        nameEn: "Thunder Shock",
        power: 40,
        accuracy: 100,
        type: "전기",
        category: "특수",
        pp: 30,
        description: "전격으로 공격한다. 마비시킬 때가 있다. (A jolt of electricity crashes down on the target to inflict damage. This may also leave the target with paralysis.)",
        logicExplanation: "공식: if random(100) < 10: target.status = 'paralysis'"
      },
      {
        nameKo: "볼트태클",
        nameEn: "Volt Tackle",
        power: 120,
        accuracy: 100,
        type: "전기",
        category: "물리",
        pp: 15,
        description: "전기를 둘러싸고 돌진한다. 자신도 꽤 큰 데미지를 입는다. 마비시킬 때가 있다. (The user electrifies itself and charges the target. This also damages the user quite a lot. This may leave the target with paralysis.)",
        logicExplanation: "공식: recoil = floor(damage / 3); user.hp -= recoil; if random(100) < 10: target.status = 'paralysis'"
      },
      {
        nameKo: "전광석화",
        nameEn: "Quick Attack",
        power: 40,
        accuracy: 100,
        type: "노말",
        category: "물리",
        pp: 30,
        description: "굉장한 속도로 움직여서 선제공격한다. (The user lunges at the target at a speed that makes it almost invisible. This move always goes first.)",
        logicExplanation: "공식: priority = 1"
      }
    ]
  },
  {
    id: 26,
    nameKo: "라이츄",
    nameEn: "Raichu",
    finalFormKo: "라이츄",
    finalFormEn: "Raichu",
    type: ["전기"],
    stats: { hp: 60, attack: 90, defense: 55, spAttack: 90, spDefense: 80, speed: 110 },
    statTotal: 485,
    battleNote: "높은 스피드(110)를 활용한 10만볼트, 기합구슬 등의 넓은 타점과 앵콜, 볼트체인지로 필드를 장악하는 기동형 딜러다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: null,
    appearance: { outer: "transparent", core: "#F88800", bars: ["#FFE4B5", "#8B4513"] },
    moves: [
      {
        nameKo: "10만볼트",
        nameEn: "Thunderbolt",
        power: 90,
        accuracy: 100,
        type: "전기",
        category: "특수",
        pp: 15,
        description: "강한 전격을 향해 공격한다. 마비시킬 때가 있다. (A strong electric blast crashes down on the target. This may also leave the target with paralysis.)",
        logicExplanation: "공식: if random(100) < 10: target.status = 'paralysis'"
      },
      {
        nameKo: "기합구슬",
        nameEn: "Focus Blast",
        power: 120,
        accuracy: 70,
        type: "격투",
        category: "특수",
        pp: 5,
        description: "기합을 높여 공격한다. 상대의 특수방어를 떨어뜨릴 때가 있다. (The user heightens its mental focus and unleashes its power. This may also lower the target's Sp. Def stat.)",
        logicExplanation: "공식: if random(100) < 10: target.stages.spDefense -= 1"
      },
      {
        nameKo: "볼트체인지",
        nameEn: "Volt Switch",
        power: 70,
        accuracy: 100,
        type: "전기",
        category: "특수",
        pp: 20,
        description: "공격한 다음 재빨리 진영으로 돌아와 대기 중인 포켓몬과 교체한다. (After making its attack, the user rushes back to switch places with a party Pokémon in waiting.)",
        logicExplanation: "공식: damage; user.switch() | 규칙: 타격 후 스쿼드의 교체 가능한 포켓몬 목록 창을 띄운다."
      }
    ]
  },
  {
    id: 27,
    nameKo: "모래두지",
    nameEn: "Sandshrew",
    finalFormKo: "고지",
    finalFormEn: "Sandslash",
    type: ["땅"],
    stats: { hp: 50, attack: 75, defense: 85, spAttack: 20, spDefense: 30, speed: 40 },
    statTotal: 300,
    battleNote: "고지: 물리 내구가 뛰어나며, 모래바람과 칼춤을 기반으로 강력한 지진을 욱여넣는 전통적인 물리형 땅 포켓몬이다.",
    evolution: { evoLevel: 22, nextEvoId: 28 },
    ability: null,
    appearance: { outer: "transparent", core: "#D2B48C", bars: ["#8B4513", "#FFFFFF"] },
    moves: [
      {
        nameKo: "할퀴기",
        nameEn: "Scratch",
        power: 40,
        accuracy: 100,
        type: "노말",
        category: "물리",
        pp: 35,
        description: "날카로운 발톱으로 할퀴어 공격한다. (Hard, pointed, sharp claws rake the target to inflict damage.)"
      },
      {
        nameKo: "웅크리기",
        nameEn: "Defense Curl",
        power: null,
        accuracy: null,
        type: "노말",
        category: "변화",
        pp: 40,
        description: "몸을 둥글게 만들어 약점을 숨긴다. 방어가 올라간다. (The user curls up to conceal weak spots and raise its Defense stat.)",
        logicExplanation: "공식: user.stages.defense += 1"
      },
      {
        nameKo: "구르기",
        nameEn: "Rollout",
        power: 30,
        accuracy: 90,
        type: "바위",
        category: "물리",
        pp: 20,
        description: "5턴 동안 굴러서 공격한다. 맞을 때마다 위력이 올라간다. (The user continually rolls into the target over five turns. It becomes more powerful each time it hits.)",
        logicExplanation: "공식: user.isRolling = true; power = 30 * (2 ^ (rollTurn - 1)) | 규칙: 웅크리기 사용 후라면 위력이 2배가 된다."
      }
    ]
  },
  {
    id: 28,
    nameKo: "고지",
    nameEn: "Sandslash",
    finalFormKo: "고지",
    finalFormEn: "Sandslash",
    type: ["땅"],
    stats: { hp: 75, attack: 100, defense: 110, spAttack: 45, spDefense: 55, speed: 65 },
    statTotal: 450,
    battleNote: "단단한 물리방어력(110)을 앞세워 적의 물리기를 버티고 자속 지진이나 스톤에지로 반격한다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: null,
    appearance: { outer: "transparent", core: "#D2B48C", bars: ["#A0522D", "#8B0000"] },
    moves: [
      {
        nameKo: "지진",
        nameEn: "Earthquake",
        power: 100,
        accuracy: 100,
        type: "땅",
        category: "물리",
        pp: 10,
        description: "땅을 강하게 흔들어 자기 주위에 있는 모든 포켓몬을 공격한다. 구멍파기 중인 적에게는 2배의 데미지. (The user sets off an earthquake that strikes every Pokémon around it.)"
      },
      {
        nameKo: "칼춤",
        nameEn: "Swords Dance",
        power: null,
        accuracy: null,
        type: "노말",
        category: "변화",
        pp: 20,
        description: "싸움의 춤을 격렬하게 춰서 기합을 올린다. 공격을 크게 올린다. (A frenetic dance to uplift the fighting spirit. This sharply raises the user's Attack stat.)",
        logicExplanation: "공식: user.stages.attack += 2"
      },
      {
        nameKo: "스톤에지",
        nameEn: "Stone Edge",
        power: 100,
        accuracy: 80,
        type: "바위",
        category: "물리",
        pp: 5,
        description: "날카로운 바위로 찌른다. 급소에 맞기 쉽다. (The user stabs the target from below with sharpened stones. Critical hits land more easily.)"
      }
    ]
  },
  {
    id: 29,
    nameKo: "니드런♀",
    nameEn: "Nidoran♀",
    finalFormKo: "니드퀸",
    finalFormEn: "Nidoqueen",
    type: ["독"],
    stats: { hp: 55, attack: 47, defense: 52, spAttack: 40, spDefense: 40, speed: 41 },
    statTotal: 275,
    battleNote: "니드퀸: 내구력이 출중하며 공격과 특공을 양면으로 자유자재로 다루는 단단한 딜탱 포켓몬이다.",
    evolution: { evoLevel: 16, nextEvoId: 30 },
    ability: null,
    appearance: { outer: "transparent", core: "#87CEEB", bars: ["#4682B4", "#FFFFFF"] },
    moves: [
      {
        nameKo: "할퀴기",
        nameEn: "Scratch",
        power: 40,
        accuracy: 100,
        type: "노말",
        category: "물리",
        pp: 35,
        description: "날카로운 발톱으로 할퀴어 공격한다. (Hard, pointed, sharp claws rake the target to inflict damage.)"
      },
      {
        nameKo: "독침",
        nameEn: "Poison Sting",
        power: 15,
        accuracy: 100,
        type: "독",
        category: "물리",
        pp: 35,
        description: "독이 있는 바늘로 찔러 공격한다. 독 상태로 만들 때가 있다. (The user stabs the target with a poisonous stinger. This may also poison the target.)",
        logicExplanation: "공식: if random(100) < 30: target.status = 'poison'"
      },
      {
        nameKo: "꼬리흔들기",
        nameEn: "Tail Whip",
        power: null,
        accuracy: 100,
        type: "노말",
        category: "변화",
        pp: 30,
        description: "상대에게 귀엽게 꼬리를 흔들어 방심하게 만들어 방어를 떨어뜨린다. (The user wags its tail cutely, making opposing Pokémon less wary and lowering their Defense stat.)",
        logicExplanation: "공식: target.stages.defense -= 1"
      }
    ]
  },
  {
    id: 30,
    nameKo: "니드리나",
    nameEn: "Nidorina",
    finalFormKo: "니드퀸",
    finalFormEn: "Nidoqueen",
    type: ["독"],
    stats: { hp: 70, attack: 62, defense: 67, spAttack: 55, spDefense: 55, speed: 56 },
    statTotal: 365,
    battleNote: "전반적인 내구력이 상승하여 안심하고 보조기나 견제기를 사용해 상대를 압박할 수 있다.",
    evolution: { evoLevel: 36, nextEvoId: 31 },
    ability: null,
    appearance: { outer: "transparent", core: "#87CEEB", bars: ["#00008B", "#FFFFFF"] },
    moves: [
      {
        nameKo: "물기",
        nameEn: "Bite",
        power: 60,
        accuracy: 100,
        type: "악",
        category: "물리",
        pp: 25,
        description: "날카로운 이빨로 물어서 공격한다. 상대를 풀죽게 할 때가 있다. (The target is bitten with viciously sharp fangs. This may also make the target flinch.)",
        logicExplanation: "공식: if random(100) < 30: target.flinch = true"
      },
      {
        nameKo: "독압정",
        nameEn: "Toxic Spikes",
        power: null,
        accuracy: null,
        type: "독",
        category: "변화",
        pp: 20,
        description: "상대의 발밑에 독압정을 뿌린다. 교체되어 나온 포켓몬은 독 상태가 된다. (The user lays a trap of poison spikes at the feet of the opposing team. The spikes will poison opposing Pokémon that switch into battle.)",
        logicExplanation: "공식: opponentSide.toxicSpikesLayers = min(2, opponentSide.toxicSpikesLayers + 1) | 규칙: 1회 중첩 시 독, 2회 중첩 시 맹독 부여."
      },
      {
        nameKo: "두번치기",
        nameEn: "Double Kick",
        power: 30,
        accuracy: 100,
        type: "격투",
        category: "물리",
        pp: 30,
        description: "두 다리를 이용해 상대를 2번 연속으로 차서 공격한다. (The target is quickly kicked twice in succession using both feet.)",
        logicExplanation: "공식: hits = 2 | 규칙: 위력 30으로 2회 타격."
      }
    ]
  },
  {
    id: 31,
    nameKo: "니드퀸",
    nameEn: "Nidoqueen",
    finalFormKo: "니드퀸",
    finalFormEn: "Nidoqueen",
    type: ["독", "땅"],
    stats: { hp: 90, attack: 92, defense: 87, spAttack: 75, spDefense: 85, speed: 76 },
    statTotal: 505,
    battleNote: "땅/독 타입의 준수한 상성과 넓은 기술폭을 지니며 대지의힘, 냉동빔 등으로 허점을 찌르는 특수 딜탱으로 활용성이 높다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: null,
    appearance: { outer: "transparent", core: "#4682B4", bars: ["#00008B", "#F5F5DC"] },
    moves: [
      {
        nameKo: "대지의힘",
        nameEn: "Earth Power",
        power: 90,
        accuracy: 100,
        type: "땅",
        category: "특수",
        pp: 10,
        description: "땅의 힘을 방출하여 공격한다. 상대의 특수방어를 떨어뜨릴 때가 있다. (The user makes the ground under the target erupt with power. This may also lower the target's Sp. Def stat.)",
        logicExplanation: "공식: if random(100) < 10: target.stages.spDefense -= 1"
      },
      {
        nameKo: "냉동빔",
        nameEn: "Ice Beam",
        power: 90,
        accuracy: 100,
        type: "얼음",
        category: "특수",
        pp: 10,
        description: "냉동빔을 발사하여 공격한다. 얼음 상태로 만들 때가 있다. (The target is struck with an icy-cold beam of energy. This may also leave the target frozen.)",
        logicExplanation: "공식: if random(100) < 10: target.status = 'freeze'"
      },
      {
        nameKo: "맹독",
        nameEn: "Toxic",
        power: null,
        accuracy: 90,
        type: "독",
        category: "변화",
        pp: 10,
        description: "턴이 지날수록 데미지가 커지는 심한 독을 상대에게 퍼뜨린다. (A move that leaves the target badly poisoned. Its poison damage worsens every turn.)",
        logicExplanation: "공식: target.status = 'bad_poison' | 규칙: 독 타입은 맹독에 걸리지 않으며, 명중률 100% 보정을 받는다."
      }
    ]
  },
  {
    id: 32,
    nameKo: "니드런♂",
    nameEn: "Nidoran♂",
    finalFormKo: "니드킹",
    finalFormEn: "Nidoking",
    type: ["독"],
    stats: { hp: 46, attack: 57, defense: 40, spAttack: 40, spDefense: 40, speed: 50 },
    statTotal: 273,
    battleNote: "니드킹: 니드퀸보다 공격적인 스탯 분배를 가지며 특성보다는 높은 결정력으로 밀어붙이는 돌파력이 우수하다.",
    evolution: { evoLevel: 16, nextEvoId: 33 },
    ability: null,
    appearance: { outer: "transparent", core: "#DDA0DD", bars: ["#800080", "#FFFFFF"] },
    moves: [
      {
        nameKo: "쪼기",
        nameEn: "Peck",
        power: 35,
        accuracy: 100,
        type: "비행",
        category: "물리",
        pp: 35,
        description: "뾰족한 부리나 뿔로 찔러서 공격한다. (The target is jabbed with a sharply pointed beak or horn.)"
      },
      {
        nameKo: "독침",
        nameEn: "Poison Sting",
        power: 15,
        accuracy: 100,
        type: "독",
        category: "물리",
        pp: 35,
        description: "독이 있는 바늘로 찔러 공격한다. (The user stabs the target with a poisonous stinger. This may also poison the target.)",
        logicExplanation: "공식: if random(100) < 30: target.status = 'poison'"
      },
      {
        nameKo: "째려보기",
        nameEn: "Leer",
        power: null,
        accuracy: 100,
        type: "노말",
        category: "변화",
        pp: 30,
        description: "상대를 날카로운 눈매로 노려보아 위축시켜서 방어를 떨어뜨린다. (The user gives opposing Pokémon an intimidating leer that lowers the Defense stat.)",
        logicExplanation: "공식: target.stages.defense -= 1"
      }
    ]
  },
  {
    id: 33,
    nameKo: "니드리노",
    nameEn: "Nidorino",
    finalFormKo: "니드킹",
    finalFormEn: "Nidoking",
    type: ["독"],
    stats: { hp: 61, attack: 72, defense: 57, spAttack: 55, spDefense: 55, speed: 65 },
    statTotal: 365,
    battleNote: "뿔찌르기 등의 공격적인 기술을 습득하며, 스피드와 공격 스탯의 이점으로 화력을 발휘하기 시작한다.",
    evolution: { evoLevel: 36, nextEvoId: 34 },
    ability: null,
    appearance: { outer: "transparent", core: "#DA70D6", bars: ["#4B0082", "#FFFFFF"] },
    moves: [
      {
        nameKo: "뿔찌르기",
        nameEn: "Horn Attack",
        power: 65,
        accuracy: 100,
        type: "노말",
        category: "물리",
        pp: 25,
        description: "뾰족한 뿔로 상대를 찔러서 공격한다. (The target is jabbed with a sharply pointed horn to inflict damage.)"
      },
      {
        nameKo: "기충전",
        nameEn: "Focus Energy",
        power: null,
        accuracy: null,
        type: "노말",
        category: "변화",
        pp: 30,
        description: "기합을 넣어 급소에 맞기 쉽게 한다. (The user takes a deep breath and focuses so that critical hits land more easily.)",
        logicExplanation: "공식: user.criticalHitStage += 2"
      },
      {
        nameKo: "독찌르기",
        nameEn: "Poison Jab",
        power: 80,
        accuracy: 100,
        type: "독",
        category: "물리",
        pp: 20,
        description: "독이 묻은 뿔이나 팔로 찔러 공격한다. (The target is stabbed with a tentacle or arm steeped in poison. This may also poison the target.)",
        logicExplanation: "공식: if random(100) < 30: target.status = 'poison'"
      }
    ]
  },
  {
    id: 34,
    nameKo: "니드킹",
    nameEn: "Nidoking",
    finalFormKo: "니드킹",
    finalFormEn: "Nidoking",
    type: ["독", "땅"],
    stats: { hp: 81, attack: 102, defense: 77, spAttack: 85, spDefense: 75, speed: 85 },
    statTotal: 505,
    battleNote: "생명의구슬과 광범위한 견제폭(대지의힘, 오물웨이브, 화염방사 등)을 결합하여 상대방을 붕괴시키는 특수 어태커로 무서운 파괴력을 자랑한다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: null,
    appearance: { outer: "transparent", core: "#800080", bars: ["#4B0082", "#FFFFFF"] },
    moves: [
      {
        nameKo: "대지의힘",
        nameEn: "Earth Power",
        power: 90,
        accuracy: 100,
        type: "땅",
        category: "특수",
        pp: 10,
        description: "땅의 힘을 방출하여 공격한다. 상대의 특수방어를 떨어뜨릴 때가 있다. (The user makes the ground under the target erupt with power. This may also lower the target's Sp. Def stat.)",
        logicExplanation: "공식: if random(100) < 10: target.stages.spDefense -= 1"
      },
      {
        nameKo: "오물웨이브",
        nameEn: "Sludge Wave",
        power: 95,
        accuracy: 100,
        type: "독",
        category: "특수",
        pp: 10,
        description: "오물의 파도로 주위를 감싸서 공격한다. 독 상태로 만들 때가 있다. (The user strikes everything around it by swamping the area with a giant sludge wave. This may also poison those hit.)",
        logicExplanation: "공식: if random(100) < 10: target.status = 'poison'"
      },
      {
        nameKo: "화염방사",
        nameEn: "Flamethrower",
        power: 90,
        accuracy: 100,
        type: "불꽃",
        category: "특수",
        pp: 15,
        description: "강렬한 불꽃을 뿜어 공격한다. 화상을 입힐 때가 있다. (The target is scorched with an intense blast of fire. This may also leave the target with a burn.)",
        logicExplanation: "공식: if random(100) < 10: target.status = 'burn'"
      }
    ]
  },
  {
    id: 35,
    nameKo: "삐삐",
    nameEn: "Clefairy",
    finalFormKo: "픽시",
    finalFormEn: "Clefable",
    type: ["노말"],
    stats: { hp: 70, attack: 45, defense: 48, spAttack: 60, spDefense: 65, speed: 35 },
    statTotal: 323,
    battleNote: "픽시: 탁월한 내구력과 코스믹파워, 달의불빛 같은 회복기, 그리고 막대한 견제폭을 통해 상대에게 끔찍한 절망을 안겨주는 요새 포켓몬이다.",
    evolution: { evoLevel: 16, nextEvoId: 36 },
    ability: null,
    appearance: { outer: "transparent", core: "#FFB6C1", bars: ["#FF69B4", "#FFFFFF"] },
    moves: [
      {
        nameKo: "막치기",
        nameEn: "Pound",
        power: 40,
        accuracy: 100,
        type: "노말",
        category: "물리",
        pp: 35,
        description: "긴 꼬리나 손 등을 사용하여 상대를 때려서 공격한다. (The target is physically pounded with a long tail, a foreleg, or the like.)"
      },
      {
        nameKo: "노래하기",
        nameEn: "Sing",
        power: null,
        accuracy: 55,
        type: "노말",
        category: "변화",
        pp: 15,
        description: "기분 좋은 자장가를 노래하여 상대를 깊은 잠에 빠뜨린다. (A soothing lullaby is sung in a calming voice that puts the target into a deep slumber.)",
        logicRef: "sing",
        logicExplanation: "공식: target.status = 'sleep'; target.sleepTurns = random(1,3) | 규칙: 수면 면역 대상은 무효."
      },
      {
        nameKo: "작아지기",
        nameEn: "Minimize",
        power: null,
        accuracy: null,
        type: "노말",
        category: "변화",
        pp: 10,
        description: "몸을 움츠려 작아져서 회피율을 크게 올린다. (The user shrinks its body to make itself smaller. This sharply raises the user's evasiveness.)",
        logicExplanation: "공식: user.stages.evasion += 2 | 규칙: 짓밟기 등 특정 기술에 피격 시 데미지 2배."
      }
    ]
  },
  {
    id: 36,
    nameKo: "픽시",
    nameEn: "Clefable",
    finalFormKo: "픽시",
    finalFormEn: "Clefable",
    type: ["노말"],
    stats: { hp: 95, attack: 70, defense: 73, spAttack: 85, spDefense: 90, speed: 60 },
    statTotal: 473,
    battleNote: "매직가드나 천진 특성은 없더라도 코스믹파워 랭크업과 맹독 조합으로 무너지지 않는 요새화 구축이 가능하다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: null,
    appearance: { outer: "transparent", core: "#FFC0CB", bars: ["#FF1493", "#FFFFFF"] },
    moves: [
      {
        nameKo: "코스믹파워",
        nameEn: "Cosmic Power",
        power: null,
        accuracy: null,
        type: "에스퍼",
        category: "변화",
        pp: 20,
        description: "신비한 힘을 빨아들여 자신의 방어와 특수방어를 올린다. (The user absorbs a mystical power from space to raise its Defense and Sp. Def stats.)",
        logicExplanation: "공식: user.stages.defense += 1; user.stages.spDefense += 1"
      },
      {
        nameKo: "달의불빛",
        nameEn: "Moonlight",
        power: null,
        accuracy: null,
        type: "노말",
        category: "변화",
        pp: 5,
        description: "자신의 체력을 회복한다. 날씨에 따라 회복량이 바뀐다. (The user restores its own HP. The amount of HP regained varies with the weather.)",
        logicExplanation: "공식: heal = floor(user.maxHP / 2); user.hp = min(user.maxHP, user.hp + heal) | 규칙: 쾌청 시 2/3, 모래바람/싸라기눈 등일 땐 1/4 회복."
      },
      {
        nameKo: "냉동빔",
        nameEn: "Ice Beam",
        power: 90,
        accuracy: 100,
        type: "얼음",
        category: "특수",
        pp: 10,
        description: "냉동빔을 발사하여 공격한다. 얼음 상태로 만들 때가 있다. (The target is struck with an icy-cold beam of energy. This may also leave the target frozen.)",
        logicExplanation: "공식: if random(100) < 10: target.status = 'freeze'"
      }
    ]
  },
  {
    id: 37,
    nameKo: "식스테일",
    nameEn: "Vulpix",
    finalFormKo: "나인테일",
    finalFormEn: "Ninetales",
    type: ["불꽃"],
    stats: { hp: 38, attack: 41, defense: 40, spAttack: 50, spDefense: 65, speed: 65 },
    statTotal: 299,
    battleNote: "나인테일: 빠른 스피드와 특수 내구를 지니고 도깨비불을 통해 물리 어태커를 기능 정지시키는 서포터 역할을 훌륭히 수행한다.",
    evolution: { evoLevel: 16, nextEvoId: 38 },
    ability: null,
    appearance: { outer: "transparent", core: "#B22222", bars: ["#FFA500", "#FFFFFF"] },
    moves: [
      {
        nameKo: "불꽃세례",
        nameEn: "Ember",
        power: 40,
        accuracy: 100,
        type: "불꽃",
        category: "특수",
        pp: 25,
        description: "작은 불꽃을 발사하여 공격한다. 화상을 입힐 때가 있다. (The target is attacked with small flames. This may also leave the target with a burn.)",
        logicExplanation: "공식: if random(100) < 10: target.status = 'burn'"
      },
      {
        nameKo: "도깨비불",
        nameEn: "Will-O-Wisp",
        power: null,
        accuracy: 75,
        type: "불꽃",
        category: "변화",
        pp: 15,
        description: "기분 나쁜 불꽃을 쏘아 상대를 화상 상태로 만든다. (The user shoots a sinister, bluish-white flame at the target to inflict a burn.)",
        logicExplanation: "공식: target.status = 'burn' | 규칙: 화상 상태의 적은 물리 공격력이 반감된다."
      },
      {
        nameKo: "이상한빛",
        nameEn: "Confuse Ray",
        power: null,
        accuracy: 100,
        type: "고스트",
        category: "변화",
        pp: 10,
        description: "요상한 빛으로 적의 눈을 어지럽혀 혼란에 빠뜨린다. (The target is exposed to a sinister ray that triggers confusion.)",
        logicExplanation: "공식: target.statusEffects.confusion = true | 규칙: 1~4턴간 혼란 상태."
      }
    ]
  },
  {
    id: 38,
    nameKo: "나인테일",
    nameEn: "Ninetales",
    finalFormKo: "나인테일",
    finalFormEn: "Ninetales",
    type: ["불꽃"],
    stats: { hp: 73, attack: 76, defense: 75, spAttack: 81, spDefense: 100, speed: 100 },
    statTotal: 505,
    battleNote: "100의 스피드와 100의 특수방어를 살려 화염방사와 에너지볼 등의 특수 공격기로 전장을 이끈다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: null,
    appearance: { outer: "transparent", core: "#F5F5DC", bars: ["#FFA500", "#FF4500"] },
    moves: [
      {
        nameKo: "화염방사",
        nameEn: "Flamethrower",
        power: 90,
        accuracy: 100,
        type: "불꽃",
        category: "특수",
        pp: 15,
        description: "강렬한 불꽃을 뿜어 공격한다. 화상을 입힐 때가 있다. (The target is scorched with an intense blast of fire. This may also leave the target with a burn.)",
        logicExplanation: "공식: if random(100) < 10: target.status = 'burn'"
      },
      {
        nameKo: "에너지볼",
        nameEn: "Energy Ball",
        power: 90,
        accuracy: 100,
        type: "풀",
        category: "특수",
        pp: 10,
        description: "자연의 힘을 모아 발사한다. 상대의 특수방어를 떨어뜨릴 때가 있다. (The user draws power from nature and fires it at the target. This may also lower the target's Sp. Def stat.)",
        logicExplanation: "공식: if random(100) < 10: target.stages.spDefense -= 1"
      },
      {
        nameKo: "도깨비불",
        nameEn: "Will-O-Wisp",
        power: null,
        accuracy: 75,
        type: "불꽃",
        category: "변화",
        pp: 15,
        description: "기분 나쁜 불꽃을 쏘아 상대를 화상 상태로 만든다. (The user shoots a sinister, bluish-white flame at the target to inflict a burn.)",
        logicExplanation: "공식: target.status = 'burn' | 규칙: 화상 상태의 적은 물리 공격력이 반감된다."
      }
    ]
  },
  {
    id: 39,
    nameKo: "푸린",
    nameEn: "Jigglypuff",
    finalFormKo: "푸크린",
    finalFormEn: "Wigglytuff",
    type: ["노말"],
    stats: { hp: 115, attack: 45, defense: 20, spAttack: 45, spDefense: 25, speed: 20 },
    statTotal: 270,
    battleNote: "푸크린: 막대한 HP를 바탕으로 끈질기게 생존하며 상대의 행동을 노래하기와 전기자석파로 묶어버리는 트릭키한 몬스터다.",
    evolution: { evoLevel: 16, nextEvoId: 40 },
    ability: null,
    appearance: { outer: "transparent", core: "#FFB6C1", bars: ["#00BFFF", "#FFFFFF"] },
    moves: [
      {
        nameKo: "막치기",
        nameEn: "Pound",
        power: 40,
        accuracy: 100,
        type: "노말",
        category: "물리",
        pp: 35,
        description: "긴 꼬리나 손 등을 사용하여 상대를 때려서 공격한다. (The target is physically pounded with a long tail, a foreleg, or the like.)"
      },
      {
        nameKo: "노래하기",
        nameEn: "Sing",
        power: null,
        accuracy: 55,
        type: "노말",
        category: "변화",
        pp: 15,
        description: "기분 좋은 자장가를 노래하여 상대를 깊은 잠에 빠뜨린다. (A soothing lullaby is sung in a calming voice that puts the target into a deep slumber.)",
        logicRef: "sing",
        logicExplanation: "공식: target.status = 'sleep'; target.sleepTurns = random(1,3)"
      },
      {
        nameKo: "방어",
        nameEn: "Protect",
        power: null,
        accuracy: null,
        type: "노말",
        category: "변화",
        pp: 10,
        description: "그 턴의 적의 공격을 막아낸다. 연속으로 쓰면 실패하기 쉽다. (Enables the user to evade all attacks. Its chance of failing rises if it is used in succession.)",
        logicRef: "protect",
        logicExplanation: "공식: blockIncomingDamage = true for this turn | 규칙: 방어 성공 시 해당 턴의 데미지 및 상태이상 무효."
      }
    ]
  },
  {
    id: 40,
    nameKo: "푸크린",
    nameEn: "Wigglytuff",
    finalFormKo: "푸크린",
    finalFormEn: "Wigglytuff",
    type: ["노말"],
    stats: { hp: 140, attack: 70, defense: 45, spAttack: 85, spDefense: 50, speed: 45 },
    statTotal: 435,
    battleNote: "압도적인 체력과 폭넓은 특수 공격(화염방사, 10만볼트 등)을 무기로 예상치 못한 타이밍에 큰 타격을 주는 조커 카드다.",
    evolution: { evoLevel: null, nextEvoId: null },
    ability: null,
    appearance: { outer: "transparent", core: "#FFC0CB", bars: ["#00BFFF", "#FFFFFF"] },
    moves: [
      {
        nameKo: "은혜갚기",
        nameEn: "Return",
        power: 102,
        accuracy: 100,
        type: "노말",
        category: "물리",
        pp: 20,
        description: "트레이너를 따르는 만큼 위력이 강해진다. (A full-power attack that grows more powerful the more the user likes its Trainer.)",
        logicExplanation: "공식: power = max 친밀도 기준(통상적으로 102 적용)"
      },
      {
        nameKo: "10만볼트",
        nameEn: "Thunderbolt",
        power: 90,
        accuracy: 100,
        type: "전기",
        category: "특수",
        pp: 15,
        description: "강한 전격을 향해 공격한다. 마비시킬 때가 있다. (A strong electric blast crashes down on the target. This may also leave the target with paralysis.)",
        logicExplanation: "공식: if random(100) < 10: target.status = 'paralysis'"
      },
      {
        nameKo: "전기자석파",
        nameEn: "Thunder Wave",
        power: null,
        accuracy: 100,
        type: "전기",
        category: "변화",
        pp: 20,
        description: "약한 전격을 날려 마비 상태로 만든다. (The user launches a weak jolt of electricity that paralyzes the target.)",
        logicExplanation: "공식: target.status = 'paralysis' | 규칙: 마비 걸린 대상은 스피드가 1/2로 감소하며 25% 확률로 행동 불능. 땅 타입에는 무효."
      }
    ]
  }
];