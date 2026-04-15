import assert from 'node:assert';

globalThis.window = {
  BigInt: BigInt
};

function describe(suiteName, tests) {
  console.log(`\n📦 ${suiteName}`);
  console.log('──────────────────────────────');
  tests();
}

function it(testName, testFn) {
  try {
    testFn();
    console.log(`  ✅ ${testName}`);
  } catch (error) {
    console.log(`  ❌ ${testName}`);
    console.log(`     错误: ${error.message}`);
    if (error.expected !== undefined) {
      console.log(`     期望: ${error.expected}`);
      console.log(`     实际: ${error.actual}`);
    }
  }
}

const equips = {
  calculateEquipmentScore(dodge = 0, attack = 0, health = 0, critical = 0, defense = 0) {
    const weights = {
      attack: 1.5,
      health: 1.0,
      defense: 1.2,
      critRate: 1.8,
      dodgeRate: 1.6
    };
    const score =
      dodge * weights.dodgeRate * 100 +
      attack * weights.attack +
      (health / 100) * weights.health +
      defense * weights.defense +
      critical * weights.critRate * 100;
    return Math.floor(score);
  }
};

const formatNumberToChineseUnit = number => {
  number = number > 0 ? Math.floor(number) : 0;
  const units = ['', '万', '亿', '兆', '京', '垓', '秭', '穰', '沟', '涧', '正', '载', '极'];
  const bigTenThousand = window.BigInt(10000);
  let num = window.BigInt(number);
  let unitIndex = 0;
  let additionalUnits = '';
  while (num >= bigTenThousand) {
    num /= bigTenThousand;
    unitIndex++;
    if (unitIndex >= units.length - 1) {
      additionalUnits += '极';
      unitIndex = 0;
    }
  }
  return num.toString() + units[unitIndex] + additionalUnits;
};

const checkCondition = (condition, data) => {
  for (const [key, value] of Object.entries(condition)) {
    if (data[key] === undefined || data[key] < value) {
      return false;
    }
  }
  return true;
};

console.log('╔══════════════════════════════════════╗');
console.log('║     游戏核心工具函数单元测试         ║');
console.log('╚══════════════════════════════════════╝');

describe('equip.js - 装备评分算法 calculateEquipmentScore', () => {
  
  it('正常值: 普通装备属性计算评分', () => {
    const score = equips.calculateEquipmentScore(0.05, 100, 10000, 0.05, 50);
    const expected = Math.floor(
      0.05 * 1.6 * 100 +
      100 * 1.5 +
      (10000 / 100) * 1.0 +
      50 * 1.2 +
      0.05 * 1.8 * 100
    );
    assert.strictEqual(score, expected);
    assert.strictEqual(score, 327);
  });

  it('正常值: 攻击型装备计算', () => {
    const score = equips.calculateEquipmentScore(0, 500, 0, 0.1, 0);
    assert.strictEqual(score, 768);
  });

  it('边界值: 全0属性装备', () => {
    const score = equips.calculateEquipmentScore(0, 0, 0, 0, 0);
    assert.strictEqual(score, 0);
  });

  it('边界值: 极限高值属性', () => {
    const score = equips.calculateEquipmentScore(1, 99999, 999999, 1, 99999);
    assert.ok(score > 0);
    assert.ok(Number.isInteger(score));
  });

  it('异常值: 负数属性处理', () => {
    const score = equips.calculateEquipmentScore(-0.1, -100, -500, -0.1, -50);
    const expected = Math.floor(
      -0.1 * 1.6 * 100 +
      -100 * 1.5 +
      (-500 / 100) * 1.0 +
      -50 * 1.2 +
      -0.1 * 1.8 * 100
    );
    assert.strictEqual(score, expected);
    assert.strictEqual(score, -249);
  });

  it('异常值: 缺省参数使用默认值0', () => {
    const score = equips.calculateEquipmentScore();
    assert.strictEqual(score, 0);
  });

  it('异常值: 部分参数缺省', () => {
    const score = equips.calculateEquipmentScore(0.1, 200);
    const expected = Math.floor(0.1 * 1.6 * 100 + 200 * 1.5);
    assert.strictEqual(score, expected);
  });
});

describe('game.js - 数值格式化函数 formatNumberToChineseUnit', () => {
  
  it('正常值: 万以内数字不转换单位', () => {
    assert.strictEqual(formatNumberToChineseUnit(9999), '9999');
    assert.strictEqual(formatNumberToChineseUnit(1), '1');
    assert.strictEqual(formatNumberToChineseUnit(5000), '5000');
  });

  it('正常值: 万级数字转换', () => {
    assert.strictEqual(formatNumberToChineseUnit(10000), '1万');
    assert.strictEqual(formatNumberToChineseUnit(15000), '1万');
    assert.strictEqual(formatNumberToChineseUnit(99999), '9万');
  });

  it('正常值: 亿级数字转换', () => {
    assert.strictEqual(formatNumberToChineseUnit(100000000), '1亿');
    assert.strictEqual(formatNumberToChineseUnit(150000000), '1亿');
  });

  it('边界值: 0值处理', () => {
    assert.strictEqual(formatNumberToChineseUnit(0), '0');
  });

  it('边界值: 极大数值', () => {
    assert.strictEqual(formatNumberToChineseUnit(10000 ** 3), '1兆');
    assert.strictEqual(formatNumberToChineseUnit(10000 ** 4), '1京');
  });

  it('异常值: 负数转换为0', () => {
    assert.strictEqual(formatNumberToChineseUnit(-100), '0');
    assert.strictEqual(formatNumberToChineseUnit(-999999), '0');
  });

  it('异常值: 浮点数向下取整', () => {
    assert.strictEqual(formatNumberToChineseUnit(15999.999), '1万');
    assert.strictEqual(formatNumberToChineseUnit(9999.99), '9999');
  });
});

describe('achievementChecker.js - 条件判断逻辑 checkCondition', () => {
  
  it('正常值: 单条件满足', () => {
    const condition = { level: 10 };
    const data = { level: 15 };
    assert.strictEqual(checkCondition(condition, data), true);
  });

  it('正常值: 多条件全部满足', () => {
    const condition = { attack: 100, defense: 50, level: 20 };
    const data = { attack: 150, defense: 80, level: 25, health: 1000 };
    assert.strictEqual(checkCondition(condition, data), true);
  });

  it('正常值: 条件刚好等于阈值', () => {
    const condition = { level: 10 };
    const data = { level: 10 };
    assert.strictEqual(checkCondition(condition, data), true);
  });

  it('边界值: 空条件对象始终通过', () => {
    assert.strictEqual(checkCondition({}, {}), true);
    assert.strictEqual(checkCondition({}, { any: 'data' }), true);
  });

  it('边界值: 刚好不满足条件', () => {
    const condition = { level: 10 };
    const data = { level: 9 };
    assert.strictEqual(checkCondition(condition, data), false);
  });

  it('异常值: 数据缺少关键字段', () => {
    const condition = { attack: 100 };
    const data = { defense: 50 };
    assert.strictEqual(checkCondition(condition, data), false);
  });

  it('异常值: 多条件中部分不满足', () => {
    const condition = { attack: 100, defense: 50, level: 20 };
    const data = { attack: 150, defense: 30, level: 25 };
    assert.strictEqual(checkCondition(condition, data), false);
  });

  it('异常值: undefined值处理', () => {
    const condition = { level: 0 };
    const data = { level: undefined };
    assert.strictEqual(checkCondition(condition, data), false);
  });
});

console.log('\n──────────────────────────────');
console.log('✅ 测试执行完成');
console.log('──────────────────────────────');
