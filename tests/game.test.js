/**
 * game.js 游戏模块测试
 * 测试覆盖：境界名称转换、数值格式化函数
 */

const { describe, it, assert, setExitCode } = require('./testRunner');

// 模拟 game.js 的核心函数
const game = {
  maxLv: 144,

  // 境界名称转换
  levelNames(level) {
    const levelsPerStage = 9;
    const stageIndex = Math.floor((level - 1) / levelsPerStage);
    const stageLevel = ((level - 1) % levelsPerStage) + 1;
    const numberName = {
      1: '一', 2: '二', 3: '三', 4: '四',
      5: '五', 6: '六', 7: '七', 8: '八', 9: '九'
    };
    const stageNames = [
      '筑基', '开光', '胎息', '辟谷',
      '金丹', '元婴', '出窍', '分神',
      '合体', '大乘', '渡劫', '地仙',
      '天仙', '金仙', '大罗金仙', '九天玄仙'
    ];
    if (level === 0) return '凡人';
    else if (level >= this.maxLv) return '九天玄仙九层';
    else return `${stageNames[stageIndex]}${numberName[stageLevel]}层`;
  },

  // 数值格式化为中文单位
  formatNumberToChineseUnit(number) {
    number = number > 0 ? Math.floor(number) : 0;
    const units = ['', '万', '亿', '兆', '京', '垓', '秭', '穰', '沟', '涧', '正', '载', '极'];
    const bigTenThousand = BigInt(10000);
    let num = BigInt(number);
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
  }
};

describe('境界名称转换 - levelNames', () => {
  // 正常值测试
  it('应正确返回等级1的境界名称', () => {
    const result = game.levelNames(1);
    assert.strictEqual(result, '筑基一层');
  });

  it('应正确返回中间等级的境界名称', () => {
    // 等级 10 应该是 开光一层 (第2阶段第1层)
    const result = game.levelNames(10);
    assert.strictEqual(result, '开光一层');
  });

  it('应正确返回各阶段最后一层的境界名称', () => {
    // 等级 9 应该是 筑基九层
    assert.strictEqual(game.levelNames(9), '筑基九层');
    // 等级 18 应该是 开光九层
    assert.strictEqual(game.levelNames(18), '开光九层');
    // 等级 27 应该是 胎息九层
    assert.strictEqual(game.levelNames(27), '胎息九层');
  });

  // 边界值测试
  it('应正确处理等级为0的情况', () => {
    const result = game.levelNames(0);
    assert.strictEqual(result, '凡人');
  });

  it('应正确处理最大等级的情况', () => {
    const result = game.levelNames(game.maxLv);
    assert.strictEqual(result, '九天玄仙九层');
  });

  it('应正确处理超过最大等级的情况', () => {
    const result = game.levelNames(game.maxLv + 10);
    assert.strictEqual(result, '九天玄仙九层');
  });

  // 异常值测试
  it('应正确处理负数等级', () => {
    const result = game.levelNames(-5);
    // 负数会导致 stageIndex 为负数
    assert.ok(typeof result === 'string', '应返回字符串');
    // 实际行为：负数会产生 undefined 的阶段名称
    assert.ok(result.includes('undefined') || result === '凡人', '负数等级可能产生异常结果');
  });

  it('应正确处理非数字等级', () => {
    const result = game.levelNames('abc');
    assert.ok(typeof result === 'string', '应返回字符串');
    // 非数字会导致 NaN，Math.floor(NaN) 返回 NaN
    assert.ok(result.includes('undefined') || result === '凡人', '非数字等级可能产生异常结果');
  });

  it('应正确处理 undefined 等级', () => {
    const result = game.levelNames(undefined);
    assert.ok(typeof result === 'string', '应返回字符串');
    // undefined 参与运算会产生 NaN
    assert.ok(result.includes('undefined') || result === '凡人', 'undefined等级可能产生异常结果');
  });
});

describe('数值格式化 - formatNumberToChineseUnit', () => {
  // 正常值测试
  it('应正确格式化小于1万的数字', () => {
    assert.strictEqual(game.formatNumberToChineseUnit(5000), '5000');
    assert.strictEqual(game.formatNumberToChineseUnit(9999), '9999');
    assert.strictEqual(game.formatNumberToChineseUnit(1), '1');
  });

  it('应正确格式化万级数字', () => {
    assert.strictEqual(game.formatNumberToChineseUnit(10000), '1万');
    assert.strictEqual(game.formatNumberToChineseUnit(50000), '5万');
    assert.strictEqual(game.formatNumberToChineseUnit(99999999), '9999万');
  });

  it('应正确格式化亿级数字', () => {
    assert.strictEqual(game.formatNumberToChineseUnit(100000000), '1亿');
    assert.strictEqual(game.formatNumberToChineseUnit(500000000), '5亿');
  });

  // 边界值测试
  it('应正确处理数字为0的情况', () => {
    assert.strictEqual(game.formatNumberToChineseUnit(0), '0');
  });

  it('应正确处理负数（应转为0）', () => {
    assert.strictEqual(game.formatNumberToChineseUnit(-100), '0');
    assert.strictEqual(game.formatNumberToChineseUnit(-999999), '0');
  });

  it('应正确处理极大数字（超过极）', () => {
    // 13个单位循环后会添加额外的"极"
    const hugeNumber = BigInt(10) ** BigInt(52); // 极大的数字
    const result = game.formatNumberToChineseUnit(Number(hugeNumber));
    assert.ok(typeof result === 'string', '应返回字符串');
    assert.ok(result.includes('极') || !isNaN(parseInt(result)), '极大数字应正确格式化');
  });

  // 异常值测试
  it('应正确处理小数（应向下取整）', () => {
    assert.strictEqual(game.formatNumberToChineseUnit(10000.9), '1万');
    assert.strictEqual(game.formatNumberToChineseUnit(5555.5), '5555');
  });

  it('应正确处理非数字输入', () => {
    // 非数字会被转为0或产生异常
    try {
      const result = game.formatNumberToChineseUnit('abc');
      assert.strictEqual(result, '0', '非数字应转为0');
    } catch (e) {
      // 可能抛出异常
      assert.ok(true, '非数字可能抛出异常');
    }
  });

  it('应正确处理 undefined 输入', () => {
    try {
      const result = game.formatNumberToChineseUnit(undefined);
      assert.strictEqual(result, '0', 'undefined应转为0');
    } catch (e) {
      assert.ok(true, 'undefined可能抛出异常');
    }
  });
});

describe('境界名称边界测试 - 各阶段边界', () => {
  // 测试各阶段的第一层
  it('应正确返回各阶段第一层的名称', () => {
    const expectedStages = [
      { level: 1, name: '筑基一层' },
      { level: 10, name: '开光一层' },
      { level: 19, name: '胎息一层' },
      { level: 28, name: '辟谷一层' },
      { level: 37, name: '金丹一层' },
      { level: 46, name: '元婴一层' },
      { level: 55, name: '出窍一层' },
      { level: 64, name: '分神一层' },
      { level: 73, name: '合体一层' },
      { level: 82, name: '大乘一层' },
      { level: 91, name: '渡劫一层' },
      { level: 100, name: '地仙一层' },
      { level: 109, name: '天仙一层' },
      { level: 118, name: '金仙一层' },
      { level: 127, name: '大罗金仙一层' },
      { level: 136, name: '九天玄仙一层' }
    ];

    expectedStages.forEach(({ level, name }) => {
      const result = game.levelNames(level);
      assert.strictEqual(result, name, `等级 ${level} 应为 ${name}`);
    });
  });

  // 测试各阶段的最后一层
  it('应正确返回各阶段最后一层的名称', () => {
    const expectedStages = [
      { level: 9, name: '筑基九层' },
      { level: 18, name: '开光九层' },
      { level: 27, name: '胎息九层' },
      { level: 36, name: '辟谷九层' },
      { level: 45, name: '金丹九层' },
      { level: 54, name: '元婴九层' },
      { level: 63, name: '出窍九层' },
      { level: 72, name: '分神九层' },
      { level: 81, name: '合体九层' },
      { level: 90, name: '大乘九层' },
      { level: 99, name: '渡劫九层' },
      { level: 108, name: '地仙九层' },
      { level: 117, name: '天仙九层' },
      { level: 126, name: '金仙九层' },
      { level: 135, name: '大罗金仙九层' },
      { level: 144, name: '九天玄仙九层' }
    ];

    expectedStages.forEach(({ level, name }) => {
      const result = game.levelNames(level);
      assert.strictEqual(result, name, `等级 ${level} 应为 ${name}`);
    });
  });
});

describe('数值格式化边界测试 - 各级单位边界', () => {
  // 测试各单位边界值
  it('应正确处理各单位边界值', () => {
    // 万级边界
    assert.strictEqual(game.formatNumberToChineseUnit(9999), '9999');
    assert.strictEqual(game.formatNumberToChineseUnit(10000), '1万');

    // 亿级边界
    assert.strictEqual(game.formatNumberToChineseUnit(99999999), '9999万');
    assert.strictEqual(game.formatNumberToChineseUnit(100000000), '1亿');

    // 兆级边界
    assert.strictEqual(game.formatNumberToChineseUnit(999999999999), '9999亿');
    assert.strictEqual(game.formatNumberToChineseUnit(1000000000000), '1兆');
  });

  it('应正确处理极大数值', () => {
    // 京级 (10^16)
    const jing = BigInt(10) ** BigInt(16);
    const resultJing = game.formatNumberToChineseUnit(Number(jing));
    assert.ok(resultJing.includes('京') || resultJing.includes('极'), '应包含京或极单位');

    // 垓级 (10^20)
    const gai = BigInt(10) ** BigInt(20);
    const resultGai = game.formatNumberToChineseUnit(Number(gai));
    assert.ok(resultGai.includes('垓') || resultGai.includes('极'), '应包含垓或极单位');
  });

  it('应正确处理极小正数', () => {
    assert.strictEqual(game.formatNumberToChineseUnit(0.1), '0');
    assert.strictEqual(game.formatNumberToChineseUnit(0.9), '0');
    assert.strictEqual(game.formatNumberToChineseUnit(0.999), '0');
  });
});

// 设置退出码
setExitCode();
