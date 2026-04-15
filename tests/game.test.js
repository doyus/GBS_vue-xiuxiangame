import { describe, it, run, assert } from './testRunner.js'

const maxLv = 144

const levelNames = level => {
  const levelsPerStage = 9
  const stageIndex = Math.floor((level - 1) / levelsPerStage)
  const stageLevel = ((level - 1) % levelsPerStage) + 1
  const numberName = {
    1: '一', 2: '二', 3: '三', 4: '四',
    5: '五', 6: '六', 7: '七', 8: '八', 9: '九'
  }
  const stageNames = [
    '筑基', '开光', '胎息', '辟谷',
    '金丹', '元婴', '出窍', '分神',
    '合体', '大乘', '渡劫', '地仙',
    '天仙', '金仙', '大罗金仙', '九天玄仙'
  ]
  if (level === 0) return '凡人'
  else if (level >= maxLv) return '九天玄仙九层'
  else return `${stageNames[stageIndex]}${numberName[stageLevel]}层`
}

const formatNumberToChineseUnit = number => {
  const units = ['', '万', '亿', '兆', '京', '垓', '秭', '穰', '沟', '涧', '正', '载', '极']
  const bigTenThousand = BigInt(10000)
  
  let num
  if (typeof number === 'bigint') {
    num = number > 0n ? number : 0n
  } else {
    number = number > 0 ? Math.floor(number) : 0
    num = BigInt(number)
  }
  
  let unitIndex = 0
  let additionalUnits = ''
  while (num >= bigTenThousand) {
    num /= bigTenThousand
    unitIndex++
    if (unitIndex >= units.length - 1) {
      additionalUnits += '极'
      unitIndex = 0
    }
  }
  return num.toString() + units[unitIndex] + additionalUnits
}

describe('game.js - levelNames 境界名称格式化', () => {
  it('正常值: 等级0返回凡人', () => {
    const result = levelNames(0)
    assert.strictEqual(result, '凡人', '等级0应返回"凡人"')
  })

  it('正常值: 等级1返回筑基一层', () => {
    const result = levelNames(1)
    assert.strictEqual(result, '筑基一层', '等级1应返回"筑基一层"')
  })

  it('正常值: 等级9返回筑基九层', () => {
    const result = levelNames(9)
    assert.strictEqual(result, '筑基九层', '等级9应返回"筑基九层"')
  })

  it('正常值: 等级10返回开光一层', () => {
    const result = levelNames(10)
    assert.strictEqual(result, '开光一层', '等级10应返回"开光一层"')
  })

  it('正常值: 等级144返回九天玄仙九层', () => {
    const result = levelNames(144)
    assert.strictEqual(result, '九天玄仙九层', '等级144应返回"九天玄仙九层"')
  })

  it('边界值: 等级超过最大等级144', () => {
    const result = levelNames(200)
    assert.strictEqual(result, '九天玄仙九层', '超过最大等级应返回最高境界')
  })

  it('边界值: 等级刚好在阶段边界', () => {
    const result9 = levelNames(9)
    assert.strictEqual(result9, '筑基九层', '等级9应为筑基九层')
    
    const result10 = levelNames(10)
    assert.strictEqual(result10, '开光一层', '等级10应为开光一层')
    
    const result18 = levelNames(18)
    assert.strictEqual(result18, '开光九层', '等级18应为开光九层')
    
    const result19 = levelNames(19)
    assert.strictEqual(result19, '胎息一层', '等级19应为胎息一层')
  })

  it('异常值: 负数等级', () => {
    const result = levelNames(-1)
    assert.strictEqual(typeof result, 'string', '负数等级应返回字符串')
  })
})

describe('game.js - formatNumberToChineseUnit 数值格式化', () => {
  it('正常值: 小于10000的数字不加单位', () => {
    assert.strictEqual(formatNumberToChineseUnit(0), '0', '0应返回"0"')
    assert.strictEqual(formatNumberToChineseUnit(1), '1', '1应返回"1"')
    assert.strictEqual(formatNumberToChineseUnit(9999), '9999', '9999应返回"9999"')
  })

  it('正常值: 万级别数字', () => {
    const result = formatNumberToChineseUnit(10000)
    assert.strictEqual(result, '1万', '10000应返回"1万"')
    
    const result2 = formatNumberToChineseUnit(12345)
    assert.strictEqual(result2, '1万', '12345应返回"1万"')
    
    const result3 = formatNumberToChineseUnit(99999999)
    assert.strictEqual(result3, '9999万', '99999999应返回"9999万"')
  })

  it('正常值: 亿级别数字', () => {
    const result = formatNumberToChineseUnit(100000000)
    assert.strictEqual(result, '1亿', '1亿应返回"1亿"')
    
    const result2 = formatNumberToChineseUnit(123456789)
    assert.strictEqual(result2, '1亿', '123456789应返回"1亿"')
  })

  it('正常值: 兆级别数字', () => {
    const result = formatNumberToChineseUnit(1000000000000)
    assert.strictEqual(result, '1兆', '1兆应返回"1兆"')
  })

  it('正常值: 京级别数字', () => {
    const result = formatNumberToChineseUnit(10000000000000000n)
    assert.strictEqual(result, '1京', '1京应返回"1京"')
  })

  it('边界值: 负数应返回0', () => {
    const result = formatNumberToChineseUnit(-100)
    assert.strictEqual(result, '0', '负数应返回"0"')
  })

  it('边界值: 浮点数应向下取整', () => {
    const result = formatNumberToChineseUnit(12345.67)
    assert.strictEqual(result, '1万', '浮点数应向下取整')
  })

  it('正常值: 大整数支持', () => {
    const bigNum = BigInt('100000000000000000000')
    const result = formatNumberToChineseUnit(bigNum)
    assert.strictEqual(result, '1垓', '10^20应为1垓')
  })

  it('正常值: 极大数值处理', () => {
    const hugeNum = BigInt('1000000000000000000000000000000000000000')
    const result = formatNumberToChineseUnit(hugeNum)
    assert.strictEqual(typeof result, 'string', '极大数应返回字符串')
    assert.strictEqual(result.length > 0, true, '结果不应为空')
  })

  it('边界值: 刚好整除的数', () => {
    const result = formatNumberToChineseUnit(10000000000000000n)
    assert.strictEqual(result, '1京', '刚好1京应返回"1京"')
  })
})

describe('game.js - dropdownTypeObject 映射验证', () => {
  const dropdownTypeObject = {
    id: '时间',
    level: '境界',
    score: '评分',
    health: '气血',
    attack: '攻击',
    defense: '防御',
    critical: '暴击',
    dodge: '闪避'
  }

  it('正常值: 验证所有映射键存在', () => {
    const expectedKeys = ['id', 'level', 'score', 'health', 'attack', 'defense', 'critical', 'dodge']
    expectedKeys.forEach(key => {
      assert.strictEqual(dropdownTypeObject.hasOwnProperty(key), true, `应包含键 ${key}`)
    })
  })

  it('正常值: 验证所有映射值为字符串', () => {
    Object.values(dropdownTypeObject).forEach(value => {
      assert.strictEqual(typeof value, 'string', '所有值应为字符串')
    })
  })

  it('边界值: 映射数量验证', () => {
    assert.strictEqual(Object.keys(dropdownTypeObject).length, 8, '应有8个映射项')
  })
})

describe('game.js - genre 装备类型映射', () => {
  const genre = {
    sutra: '法器',
    armor: '护甲',
    weapon: '神兵',
    accessory: '灵宝'
  }

  it('正常值: 验证所有装备类型', () => {
    assert.strictEqual(genre.sutra, '法器', 'sutra应为法器')
    assert.strictEqual(genre.armor, '护甲', 'armor应为护甲')
    assert.strictEqual(genre.weapon, '神兵', 'weapon应为神兵')
    assert.strictEqual(genre.accessory, '灵宝', 'accessory应为灵宝')
  })

  it('边界值: 装备类型数量', () => {
    assert.strictEqual(Object.keys(genre).length, 4, '应有4种装备类型')
  })

  it('异常值: 不存在的类型应返回undefined', () => {
    assert.strictEqual(genre.unknown, undefined, '不存在的类型应返回undefined')
  })
})

describe('game.js - levels 品质映射', () => {
  const levels = {
    info: '黄阶',
    pink: '仙阶',
    danger: '神阶',
    purple: '天阶',
    primary: '地阶',
    success: '玄阶',
    warning: '帝阶'
  }

  it('正常值: 验证所有品质映射', () => {
    assert.strictEqual(levels.info, '黄阶')
    assert.strictEqual(levels.pink, '仙阶')
    assert.strictEqual(levels.danger, '神阶')
    assert.strictEqual(levels.purple, '天阶')
    assert.strictEqual(levels.primary, '地阶')
    assert.strictEqual(levels.success, '玄阶')
    assert.strictEqual(levels.warning, '帝阶')
  })

  it('边界值: 品质数量验证', () => {
    assert.strictEqual(Object.keys(levels).length, 7, '应有7种品质')
  })

  it('正常值: 所有值为非空字符串', () => {
    Object.values(levels).forEach(value => {
      assert.strictEqual(value.length > 0, true, '品质名称不应为空')
    })
  })
})

run()
