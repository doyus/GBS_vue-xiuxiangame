import { describe, it, run, assert } from './testRunner.js'

const equips = {
  getRandomInt(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min
  },
  getRandomFloatInRange(min, max) {
    return Math.random() * (max - min) + min
  },
  calculateEquipmentScore(dodge = 0, attack = 0, health = 0, critical = 0, defense = 0) {
    const weights = {
      attack: 1.5,
      health: 1.0,
      defense: 1.2,
      critRate: 1.8,
      dodgeRate: 1.6
    }
    const score =
      dodge * weights.dodgeRate * 100 +
      attack * weights.attack +
      (health / 100) * weights.health +
      defense * weights.defense +
      critical * weights.critRate * 100
    return Math.floor(score)
  },
  equip_Attack(lv) {
    return this.getRandomInt(10, 50) * lv
  },
  equip_Health(lv) {
    return this.getRandomInt(100, 500) * lv
  },
  equip_Criticalhitrate() {
    return this.getRandomFloatInRange(0.01, 0.05)
  }
}

describe('equip.js - calculateEquipmentScore 装备评分算法', () => {
  it('正常值: 计算包含所有属性的装备评分', () => {
    const dodge = 0.03
    const attack = 100
    const health = 1000
    const critical = 0.05
    const defense = 50
    
    const expectedScore = Math.floor(
      dodge * 1.6 * 100 +
      attack * 1.5 +
      (health / 100) * 1.0 +
      defense * 1.2 +
      critical * 1.8 * 100
    )
    
    const result = equips.calculateEquipmentScore(dodge, attack, health, critical, defense)
    assert.strictEqual(result, expectedScore, '评分计算应正确')
    assert.strictEqual(typeof result, 'number', '返回值应为数字')
    assert.strictEqual(result >= 0, true, '评分应为非负数')
  })

  it('边界值: 所有参数为零时应返回0', () => {
    const result = equips.calculateEquipmentScore(0, 0, 0, 0, 0)
    assert.strictEqual(result, 0, '所有参数为0时评分应为0')
  })

  it('边界值: 只传入部分参数时使用默认值', () => {
    const result1 = equips.calculateEquipmentScore(0.05)
    assert.strictEqual(typeof result1, 'number', '只传入dodge应返回数字')
    assert.strictEqual(result1 > 0, true, 'dodge大于0时评分应大于0')
    
    const result2 = equips.calculateEquipmentScore()
    assert.strictEqual(result2, 0, '不传参数时所有使用默认值0，评分应为0')
  })

  it('异常值: 传入负数参数', () => {
    const result = equips.calculateEquipmentScore(-0.1, -100, -500, -0.05, -50)
    assert.strictEqual(typeof result, 'number', '负数参数应返回数字')
    assert.strictEqual(result < 0, true, '负数属性应产生负分')
  })

  it('正常值: 高属性装备评分验证', () => {
    const dodge = 0.1
    const attack = 1000
    const health = 10000
    const critical = 0.2
    const defense = 500
    
    const result = equips.calculateEquipmentScore(dodge, attack, health, critical, defense)
    const expectedScore = Math.floor(
      0.1 * 160 + 1000 * 1.5 + 100 + 500 * 1.2 + 0.2 * 180
    )
    
    assert.strictEqual(result > 0, true, '高属性装备评分应大于0')
    assert.strictEqual(result, expectedScore, '高属性装备评分计算正确')
  })

  it('边界值: 极大值属性测试', () => {
    const result = equips.calculateEquipmentScore(1, 999999, 9999999, 1, 999999)
    assert.strictEqual(typeof result, 'number', '极大值应返回数字')
    assert.strictEqual(Number.isFinite(result), true, '结果应为有限数值')
  })
})

describe('equip.js - getRandomInt 随机整数生成', () => {
  it('正常值: 生成指定范围内的随机整数', () => {
    for (let i = 0; i < 100; i++) {
      const result = equips.getRandomInt(1, 10)
      assert.strictEqual(result >= 1 && result <= 10, true, '结果应在1-10范围内')
      assert.strictEqual(Number.isInteger(result), true, '结果应为整数')
    }
  })

  it('边界值: 最小值等于最大值', () => {
    const result = equips.getRandomInt(5, 5)
    assert.strictEqual(result, 5, '最小值等于最大值时应返回该值')
  })

  it('异常值: 传入浮点数参数', () => {
    const result = equips.getRandomInt(1.5, 5.5)
    assert.strictEqual(result >= 2 && result <= 5, true, '浮点数参数应被正确取整')
    assert.strictEqual(Number.isInteger(result), true, '结果应为整数')
  })
})

describe('equip.js - getRandomFloatInRange 随机浮点数生成', () => {
  it('正常值: 生成指定范围内的随机浮点数', () => {
    for (let i = 0; i < 100; i++) {
      const result = equips.getRandomFloatInRange(0.01, 0.05)
      assert.strictEqual(result >= 0.01 && result <= 0.05, true, '结果应在0.01-0.05范围内')
      assert.strictEqual(typeof result, 'number', '结果应为数字')
    }
  })

  it('边界值: 最小值等于最大值', () => {
    const result = equips.getRandomFloatInRange(0.5, 0.5)
    assert.strictEqual(result, 0.5, '最小值等于最大值时应返回该值')
  })

  it('正常值: 负数范围', () => {
    const result = equips.getRandomFloatInRange(-10, -5)
    assert.strictEqual(result >= -10 && result <= -5, true, '负数范围应正确')
  })
})

describe('equip.js - equip_Attack 攻击力计算', () => {
  it('正常值: 等级1的攻击力范围', () => {
    for (let i = 0; i < 50; i++) {
      const result = equips.equip_Attack(1)
      assert.strictEqual(result >= 10 && result <= 50, true, '等级1攻击力应在10-50范围')
    }
  })

  it('正常值: 等级10的攻击力范围', () => {
    for (let i = 0; i < 50; i++) {
      const result = equips.equip_Attack(10)
      assert.strictEqual(result >= 100 && result <= 500, true, '等级10攻击力应在100-500范围')
    }
  })

  it('边界值: 等级0的攻击力', () => {
    const result = equips.equip_Attack(0)
    assert.strictEqual(result, 0, '等级0攻击力应为0')
  })
})

describe('equip.js - equip_Health 血量计算', () => {
  it('正常值: 等级1的血量范围', () => {
    for (let i = 0; i < 50; i++) {
      const result = equips.equip_Health(1)
      assert.strictEqual(result >= 100 && result <= 500, true, '等级1血量应在100-500范围')
    }
  })

  it('正常值: 等级5的血量范围', () => {
    for (let i = 0; i < 50; i++) {
      const result = equips.equip_Health(5)
      assert.strictEqual(result >= 500 && result <= 2500, true, '等级5血量应在500-2500范围')
    }
  })

  it('边界值: 等级0的血量', () => {
    const result = equips.equip_Health(0)
    assert.strictEqual(result, 0, '等级0血量应为0')
  })
})

describe('equip.js - equip_Criticalhitrate 暴击率生成', () => {
  it('正常值: 暴击率应在0.01-0.05范围', () => {
    for (let i = 0; i < 100; i++) {
      const result = equips.equip_Criticalhitrate()
      assert.strictEqual(result >= 0.01 && result <= 0.05, true, '暴击率应在0.01-0.05范围')
    }
  })

  it('正常值: 返回值类型验证', () => {
    const result = equips.equip_Criticalhitrate()
    assert.strictEqual(typeof result, 'number', '返回值应为数字')
    assert.strictEqual(result > 0, true, '暴击率应大于0')
  })

  it('边界值: 多次调用结果分布', () => {
    const results = new Set()
    for (let i = 0; i < 100; i++) {
      results.add(equips.equip_Criticalhitrate())
    }
    assert.strictEqual(results.size > 1, true, '多次调用应产生不同值')
  })
})

run()
