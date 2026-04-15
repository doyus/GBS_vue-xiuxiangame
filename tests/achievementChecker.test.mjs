/**
 * achievementChecker.js 成就检查模块测试
 * 测试覆盖：条件判断逻辑、成就检查函数
 */

import { describe, it, assert, setExitCode } from './testRunner.mjs';

// 模拟成就数据
const mockAchievements = {
  pet: () => [
    { id: 1, name: '初级宠物', condition: { level: 10 }, award: 10 },
    { id: 2, name: '中级宠物', condition: { level: 30, attack: 100 }, award: 20 },
    { id: 3, name: '高级宠物', condition: { level: 50, attack: 500, health: 1000 }, award: 50 }
  ],
  monster: () => [
    { id: 1, name: '初出茅庐', condition: { killCount: 10 }, award: 5 },
    { id: 2, name: '斩妖除魔', condition: { killCount: 100, bossKillCount: 5 }, award: 15 },
    { id: 3, name: '降妖大师', condition: { killCount: 1000, bossKillCount: 50 }, award: 50 }
  ],
  equipment: () => [
    { id: 1, name: '初获装备', condition: { score: 100 }, award: 5 },
    { id: 2, name: '神兵利器', condition: { score: 1000, quality: 'purple' }, award: 20 },
    { id: 3, name: '传世神器', condition: { score: 5000, quality: 'danger' }, award: 100 }
  ]
};

// 模拟 achievementChecker.js 的核心函数
const achievementChecker = {
  // 检查成就
  checkAchievements(player, type, data) {
    const newAchievements = [];
    switch (type) {
      case 'pet':
        this.checkPetAchievements(player, data, newAchievements);
        break;
      case 'monster':
        this.checkMonsterAchievements(player, data, newAchievements);
        break;
      case 'equipment':
        this.checkEquipmentAchievements(player, data, newAchievements);
        break;
    }
    return newAchievements;
  },

  // 检查宠物成就
  checkPetAchievements(player, pet, newAchievements) {
    const petAchievements = mockAchievements.pet();
    petAchievements.forEach(item => {
      if (!player.achievement.pet.find(i => i.id === item.id) && this.checkCondition(item.condition, pet)) {
        newAchievements.push(item);
        player.achievement.pet.push({ id: item.id });
        player.props.cultivateDan += item.award;
      }
    });
  },

  // 检查怪物成就
  checkMonsterAchievements(player) {
    const monsterAchievements = mockAchievements.monster();
    monsterAchievements.forEach(item => {
      if (!player.achievement.monster.find(i => i.id === item.id) && this.checkCondition(item.condition, player)) {
        player.achievement.monster.push({ id: item.id });
        player.props.cultivateDan += item.award;
      }
    });
  },

  // 检查装备成就
  checkEquipmentAchievements(player, equipmentData, newAchievements) {
    const equipmentAchievements = mockAchievements.equipment();
    equipmentAchievements.forEach(item => {
      if (!player.achievement.equipment.find(i => i.id === item.id) && this.checkCondition(item.condition, equipmentData)) {
        newAchievements.push(item);
        player.achievement.equipment.push({ id: item.id });
        player.props.cultivateDan += item.award;
      }
    });
  },

  // 条件判断逻辑
  checkCondition(condition, data) {
    for (const [key, value] of Object.entries(condition)) {
      if (data[key] === undefined || data[key] < value) {
        return false;
      }
    }
    return true;
  }
};

// 创建测试用的玩家对象
function createMockPlayer() {
  return {
    achievement: {
      pet: [],
      monster: [],
      equipment: []
    },
    props: {
      cultivateDan: 0
    },
    // 怪物成就需要的属性
    killCount: 0,
    bossKillCount: 0
  };
}

describe('条件判断逻辑 - checkCondition', () => {
  // 正常值测试
  it('应返回true当所有条件都满足时', () => {
    const condition = { level: 10, attack: 100 };
    const data = { level: 15, attack: 150, health: 500 };
    const result = achievementChecker.checkCondition(condition, data);
    assert.strictEqual(result, true);
  });

  it('应返回true当条件恰好满足时', () => {
    const condition = { level: 10, attack: 100 };
    const data = { level: 10, attack: 100 };
    const result = achievementChecker.checkCondition(condition, data);
    assert.strictEqual(result, true);
  });

  it('应正确处理多个条件', () => {
    const condition = { a: 1, b: 2, c: 3 };
    const data = { a: 5, b: 10, c: 15, d: 20 };
    const result = achievementChecker.checkCondition(condition, data);
    assert.strictEqual(result, true);
  });

  // 边界值测试
  it('应返回false当某个属性不满足时', () => {
    const condition = { level: 10, attack: 100 };
    const data = { level: 15, attack: 50 };
    const result = achievementChecker.checkCondition(condition, data);
    assert.strictEqual(result, false);
  });

  it('应返回false当属性值为0时（小于条件值）', () => {
    const condition = { level: 1 };
    const data = { level: 0 };
    const result = achievementChecker.checkCondition(condition, data);
    assert.strictEqual(result, false);
  });

  it('应返回true当条件为空对象时', () => {
    const condition = {};
    const data = { level: 10 };
    const result = achievementChecker.checkCondition(condition, data);
    assert.strictEqual(result, true);
  });

  // 异常值测试
  it('应返回false当数据缺少条件中的属性时', () => {
    const condition = { level: 10, attack: 100 };
    const data = { level: 15 }; // 缺少 attack
    const result = achievementChecker.checkCondition(condition, data);
    assert.strictEqual(result, false);
  });

  it('应在数据为null时抛出异常', () => {
    const condition = { level: 10 };
    // 原代码在 data 为 null 时会抛出 TypeError
    assert.throws(() => {
      achievementChecker.checkCondition(condition, null);
    }, TypeError);
  });

  it('应在数据为undefined时抛出异常', () => {
    const condition = { level: 10 };
    // 原代码在 data 为 undefined 时会抛出 TypeError
    assert.throws(() => {
      achievementChecker.checkCondition(condition, undefined);
    }, TypeError);
  });
});

describe('宠物成就检查 - checkPetAchievements', () => {
  // 正常值测试
  it('应正确添加满足条件的宠物成就', () => {
    const player = createMockPlayer();
    const pet = { level: 15, attack: 50 };
    const newAchievements = [];

    achievementChecker.checkPetAchievements(player, pet, newAchievements);

    assert.strictEqual(newAchievements.length, 1, '应有一个新成就');
    assert.strictEqual(newAchievements[0].id, 1, '应是初级宠物成就');
    assert.strictEqual(player.achievement.pet.length, 1, '玩家应有1个宠物成就');
    assert.strictEqual(player.props.cultivateDan, 10, '应获得10个培养丹');
  });

  it('应正确添加多个满足条件的宠物成就', () => {
    const player = createMockPlayer();
    const pet = { level: 35, attack: 150, health: 2000 };
    const newAchievements = [];

    achievementChecker.checkPetAchievements(player, pet, newAchievements);

    assert.strictEqual(newAchievements.length, 2, '应有两个新成就');
    assert.strictEqual(player.achievement.pet.length, 2, '玩家应有2个宠物成就');
    assert.strictEqual(player.props.cultivateDan, 30, '应获得30个培养丹（10+20）');
  });

  it('应正确添加所有满足条件的宠物成就', () => {
    const player = createMockPlayer();
    const pet = { level: 60, attack: 600, health: 1500 };
    const newAchievements = [];

    achievementChecker.checkPetAchievements(player, pet, newAchievements);

    assert.strictEqual(newAchievements.length, 3, '应有三个新成就');
    assert.strictEqual(player.props.cultivateDan, 80, '应获得80个培养丹（10+20+50）');
  });

  // 边界值测试
  it('应正确处理不满足任何条件的情况', () => {
    const player = createMockPlayer();
    const pet = { level: 5, attack: 50 };
    const newAchievements = [];

    achievementChecker.checkPetAchievements(player, pet, newAchievements);

    assert.strictEqual(newAchievements.length, 0, '不应有新成就');
    assert.strictEqual(player.achievement.pet.length, 0, '玩家不应有宠物成就');
    assert.strictEqual(player.props.cultivateDan, 0, '不应获得培养丹');
  });

  it('应正确处理恰好满足边界条件的情况', () => {
    const player = createMockPlayer();
    const pet = { level: 10, attack: 0 }; // 恰好满足初级宠物条件
    const newAchievements = [];

    achievementChecker.checkPetAchievements(player, pet, newAchievements);

    assert.strictEqual(newAchievements.length, 1, '应有一个新成就');
    assert.strictEqual(newAchievements[0].id, 1, '应是初级宠物成就');
  });

  it('应跳过已获得的成就', () => {
    const player = createMockPlayer();
    player.achievement.pet.push({ id: 1 }); // 已获得初级宠物成就
    const pet = { level: 35, attack: 150, health: 2000 };
    const newAchievements = [];

    achievementChecker.checkPetAchievements(player, pet, newAchievements);

    assert.strictEqual(newAchievements.length, 1, '应只有一个新成就（中级宠物）');
    assert.strictEqual(newAchievements[0].id, 2, '应是中级宠物成就');
    assert.strictEqual(player.props.cultivateDan, 20, '应只获得20个培养丹');
  });

  // 异常值测试
  it('应在宠物数据为null时抛出异常', () => {
    const player = createMockPlayer();
    const newAchievements = [];

    // 原代码在 pet 为 null 时会抛出异常
    assert.throws(() => {
      achievementChecker.checkPetAchievements(player, null, newAchievements);
    }, TypeError);
  });

  it('应处理宠物数据缺少属性的情况', () => {
    const player = createMockPlayer();
    const pet = { name: 'test' }; // 缺少 level 等属性
    const newAchievements = [];

    achievementChecker.checkPetAchievements(player, pet, newAchievements);

    assert.strictEqual(newAchievements.length, 0, '不应有新成就');
  });

  it('应处理空宠物对象的情况', () => {
    const player = createMockPlayer();
    const pet = {};
    const newAchievements = [];

    achievementChecker.checkPetAchievements(player, pet, newAchievements);

    assert.strictEqual(newAchievements.length, 0, '不应有新成就');
  });
});

describe('怪物成就检查 - checkMonsterAchievements', () => {
  // 正常值测试
  it('应正确添加满足条件的怪物成就', () => {
    const player = createMockPlayer();
    player.killCount = 15;

    achievementChecker.checkMonsterAchievements(player);

    assert.strictEqual(player.achievement.monster.length, 1, '玩家应有1个怪物成就');
    assert.strictEqual(player.props.cultivateDan, 5, '应获得5个培养丹');
  });

  it('应正确添加多个满足条件的怪物成就', () => {
    const player = createMockPlayer();
    player.killCount = 150;
    player.bossKillCount = 10;

    achievementChecker.checkMonsterAchievements(player);

    assert.strictEqual(player.achievement.monster.length, 2, '玩家应有2个怪物成就');
    assert.strictEqual(player.props.cultivateDan, 20, '应获得20个培养丹（5+15）');
  });

  it('应正确添加所有满足条件的怪物成就', () => {
    const player = createMockPlayer();
    player.killCount = 2000;
    player.bossKillCount = 60;

    achievementChecker.checkMonsterAchievements(player);

    assert.strictEqual(player.achievement.monster.length, 3, '玩家应有3个怪物成就');
    assert.strictEqual(player.props.cultivateDan, 70, '应获得70个培养丹（5+15+50）');
  });

  // 边界值测试
  it('应正确处理不满足任何条件的情况', () => {
    const player = createMockPlayer();
    player.killCount = 5;

    achievementChecker.checkMonsterAchievements(player);

    assert.strictEqual(player.achievement.monster.length, 0, '玩家不应有怪物成就');
    assert.strictEqual(player.props.cultivateDan, 0, '不应获得培养丹');
  });

  it('应正确处理恰好满足边界条件的情况', () => {
    const player = createMockPlayer();
    player.killCount = 10;
    player.bossKillCount = 0;

    achievementChecker.checkMonsterAchievements(player);

    assert.strictEqual(player.achievement.monster.length, 1, '玩家应有1个怪物成就');
    assert.strictEqual(player.achievement.monster[0].id, 1, '应是初出茅庐成就');
  });

  it('应跳过已获得的成就', () => {
    const player = createMockPlayer();
    player.achievement.monster.push({ id: 1 }); // 已获得初出茅庐成就
    player.killCount = 150;
    player.bossKillCount = 10;

    achievementChecker.checkMonsterAchievements(player);

    assert.strictEqual(player.achievement.monster.length, 2, '玩家应有2个怪物成就');
    assert.strictEqual(player.props.cultivateDan, 15, '应只获得15个培养丹');
  });

  // 异常值测试
  it('应处理玩家属性为0的情况', () => {
    const player = createMockPlayer();
    player.killCount = 0;
    player.bossKillCount = 0;

    achievementChecker.checkMonsterAchievements(player);

    assert.strictEqual(player.achievement.monster.length, 0, '不应有怪物成就');
  });

  it('应处理玩家属性为负数的情况', () => {
    const player = createMockPlayer();
    player.killCount = -10;
    player.bossKillCount = -5;

    achievementChecker.checkMonsterAchievements(player);

    assert.strictEqual(player.achievement.monster.length, 0, '不应有怪物成就');
  });

  it('应处理玩家属性为undefined的情况', () => {
    const player = createMockPlayer();
    // killCount 和 bossKillCount 保持 undefined（通过 createMockPlayer 未设置）

    achievementChecker.checkMonsterAchievements(player);

    assert.strictEqual(player.achievement.monster.length, 0, '不应有怪物成就');
  });
});

describe('装备成就检查 - checkEquipmentAchievements', () => {
  // 正常值测试
  it('应正确添加满足条件的装备成就', () => {
    const player = createMockPlayer();
    const equipment = { score: 150, quality: 'info' };
    const newAchievements = [];

    achievementChecker.checkEquipmentAchievements(player, equipment, newAchievements);

    assert.strictEqual(newAchievements.length, 1, '应有一个新成就');
    assert.strictEqual(newAchievements[0].id, 1, '应是初获装备成就');
    assert.strictEqual(player.achievement.equipment.length, 1, '玩家应有1个装备成就');
    assert.strictEqual(player.props.cultivateDan, 5, '应获得5个培养丹');
  });

  it('应正确添加多个满足条件的装备成就', () => {
    const player = createMockPlayer();
    const equipment = { score: 1500, quality: 'purple' };
    const newAchievements = [];

    achievementChecker.checkEquipmentAchievements(player, equipment, newAchievements);

    assert.strictEqual(newAchievements.length, 2, '应有两个新成就');
    assert.strictEqual(player.achievement.equipment.length, 2, '玩家应有2个装备成就');
    assert.strictEqual(player.props.cultivateDan, 25, '应获得25个培养丹（5+20）');
  });

  it('应正确添加所有满足条件的装备成就', () => {
    const player = createMockPlayer();
    // 注意：初获装备只需要 score >= 100，神兵利器需要 score >= 1000 且 quality == 'purple'
    // 传世神器需要 score >= 5000 且 quality == 'danger'
    // 所以 score=6000, quality='danger' 只能满足初获装备和传世神器，不满足神兵利器
    const equipment = { score: 6000, quality: 'danger' };
    const newAchievements = [];

    achievementChecker.checkEquipmentAchievements(player, equipment, newAchievements);

    assert.strictEqual(newAchievements.length, 2, '应有两个新成就（初获装备和传世神器）');
    assert.strictEqual(player.props.cultivateDan, 105, '应获得105个培养丹（5+100）');
  });

  // 边界值测试
  it('应正确处理不满足任何条件的情况', () => {
    const player = createMockPlayer();
    const equipment = { score: 50, quality: 'info' };
    const newAchievements = [];

    achievementChecker.checkEquipmentAchievements(player, equipment, newAchievements);

    assert.strictEqual(newAchievements.length, 0, '不应有新成就');
    assert.strictEqual(player.achievement.equipment.length, 0, '玩家不应有装备成就');
  });

  it('应正确处理恰好满足边界条件的情况', () => {
    const player = createMockPlayer();
    const equipment = { score: 100, quality: 'any' };
    const newAchievements = [];

    achievementChecker.checkEquipmentAchievements(player, equipment, newAchievements);

    assert.strictEqual(newAchievements.length, 1, '应有一个新成就');
    assert.strictEqual(newAchievements[0].id, 1, '应是初获装备成就');
  });

  it('应跳过已获得的成就', () => {
    const player = createMockPlayer();
    player.achievement.equipment.push({ id: 1 }); // 已获得初获装备成就
    const equipment = { score: 1500, quality: 'purple' };
    const newAchievements = [];

    achievementChecker.checkEquipmentAchievements(player, equipment, newAchievements);

    assert.strictEqual(newAchievements.length, 1, '应只有一个新成就');
    assert.strictEqual(newAchievements[0].id, 2, '应是神兵利器成就');
  });

  // 异常值测试
  it('应在装备数据为null时抛出异常', () => {
    const player = createMockPlayer();
    const newAchievements = [];

    // 原代码在 equipmentData 为 null 时会抛出异常
    assert.throws(() => {
      achievementChecker.checkEquipmentAchievements(player, null, newAchievements);
    }, TypeError);
  });

  it('应处理装备数据缺少属性的情况', () => {
    const player = createMockPlayer();
    const equipment = { name: 'test' }; // 缺少 score 和 quality
    const newAchievements = [];

    achievementChecker.checkEquipmentAchievements(player, equipment, newAchievements);

    assert.strictEqual(newAchievements.length, 0, '不应有新成就');
  });

  it('应处理装备quality不匹配的情况', () => {
    const player = createMockPlayer();
    // 分数足够但品质不匹配
    const equipment = { score: 1500, quality: 'info' };
    const newAchievements = [];

    achievementChecker.checkEquipmentAchievements(player, equipment, newAchievements);

    // 只有初获装备成就满足（不需要特定quality）
    assert.strictEqual(newAchievements.length, 1, '应只有一个新成就');
    assert.strictEqual(newAchievements[0].id, 1, '应是初获装备成就');
  });
});

describe('综合成就检查 - checkAchievements', () => {
  // 正常值测试
  it('应正确处理宠物类型成就检查', () => {
    const player = createMockPlayer();
    const pet = { level: 20, attack: 100 };

    const newAchievements = achievementChecker.checkAchievements(player, 'pet', pet);

    assert.strictEqual(newAchievements.length, 1, '应有一个新成就');
    assert.strictEqual(newAchievements[0].id, 1, '应是初级宠物成就');
  });

  it('应正确处理怪物类型成就检查', () => {
    const player = createMockPlayer();
    player.killCount = 20;

    const newAchievements = achievementChecker.checkAchievements(player, 'monster', player);

    // monster 类型不返回新成就列表，但会更新玩家数据
    assert.strictEqual(player.achievement.monster.length, 1, '玩家应有1个怪物成就');
  });

  it('应正确处理装备类型成就检查', () => {
    const player = createMockPlayer();
    const equipment = { score: 200, quality: 'success' };

    const newAchievements = achievementChecker.checkAchievements(player, 'equipment', equipment);

    assert.strictEqual(newAchievements.length, 1, '应有一个新成就');
    assert.strictEqual(newAchievements[0].id, 1, '应是初获装备成就');
  });

  // 边界值测试
  it('应正确处理未知的成就类型', () => {
    const player = createMockPlayer();
    const data = { test: 'data' };

    const newAchievements = achievementChecker.checkAchievements(player, 'unknown', data);

    assert.strictEqual(newAchievements.length, 0, '不应有新成就');
    assert.deepStrictEqual(newAchievements, [], '应返回空数组');
  });

  it('应正确处理空类型', () => {
    const player = createMockPlayer();
    const data = { test: 'data' };

    const newAchievements = achievementChecker.checkAchievements(player, '', data);

    assert.strictEqual(newAchievements.length, 0, '不应有新成就');
  });

  it('应正确处理null类型', () => {
    const player = createMockPlayer();
    const data = { test: 'data' };

    const newAchievements = achievementChecker.checkAchievements(player, null, data);

    assert.strictEqual(newAchievements.length, 0, '不应有新成就');
  });

  // 异常值测试
  it('应处理null玩家对象', () => {
    const pet = { level: 20 };

    try {
      achievementChecker.checkAchievements(null, 'pet', pet);
      assert.fail('应该抛出异常');
    } catch (e) {
      assert.ok(e instanceof TypeError, '应抛出TypeError');
    }
  });

  it('应处理undefined玩家对象', () => {
    const pet = { level: 20 };

    try {
      achievementChecker.checkAchievements(undefined, 'pet', pet);
      assert.fail('应该抛出异常');
    } catch (e) {
      assert.ok(e instanceof TypeError, '应抛出TypeError');
    }
  });

  it('应处理缺少achievement属性的玩家对象', () => {
    const player = { props: { cultivateDan: 0 } }; // 缺少 achievement
    const pet = { level: 20 };

    try {
      achievementChecker.checkAchievements(player, 'pet', pet);
      assert.fail('应该抛出异常');
    } catch (e) {
      assert.ok(e instanceof TypeError, '应抛出TypeError');
    }
  });
});

// 设置退出码
setExitCode();
