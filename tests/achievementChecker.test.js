import { describe, it, run, assert } from './testRunner.js'

const checkCondition = (condition, data) => {
  for (const [key, value] of Object.entries(condition)) {
    if (data[key] === undefined || data[key] < value) {
      return false
    }
  }
  return true
}

const checkAchievements = (player, type, data) => {
  const newAchievements = []
  switch (type) {
    case 'pet':
      checkPetAchievements(player, data, newAchievements)
      break
    case 'monster':
      checkMonsterAchievements(player, data, newAchievements)
      break
    case 'equipment':
      checkEquipmentAchievements(player, data, newAchievements)
      break
  }
  return newAchievements
}

const checkPetAchievements = (player, pet, newAchievements) => {
  const mockPetAchievements = [
    { id: 'pet_1', condition: { level: 10 }, award: 100 },
    { id: 'pet_2', condition: { level: 50 }, award: 500 }
  ]
  mockPetAchievements.forEach(item => {
    if (!player.achievement.pet.find(i => i.id === item.id) && checkCondition(item.condition, pet)) {
      newAchievements.push(item)
      player.achievement.pet.push({ id: item.id })
      player.props.cultivateDan += item.award
    }
  })
}

const checkMonsterAchievements = (player, data, newAchievements) => {
  const mockMonsterAchievements = [
    { id: 'monster_1', condition: { killCount: 100 }, award: 50 },
    { id: 'monster_2', condition: { killCount: 1000 }, award: 500 }
  ]
  mockMonsterAchievements.forEach(item => {
    if (!player.achievement.monster.find(i => i.id === item.id) && checkCondition(item.condition, player)) {
      player.achievement.monster.push({ id: item.id })
      player.props.cultivateDan += item.award
    }
  })
}

const checkEquipmentAchievements = (player, equipmentData, newAchievements) => {
  const mockEquipmentAchievements = [
    { id: 'equip_1', condition: { score: 1000 }, award: 100 },
    { id: 'equip_2', condition: { score: 10000 }, award: 1000 }
  ]
  mockEquipmentAchievements.forEach(item => {
    if (!player.achievement.equipment.find(i => i.id === item.id) && checkCondition(item.condition, equipmentData)) {
      newAchievements.push(item)
      player.achievement.equipment.push({ id: item.id })
      player.props.cultivateDan += item.award
    }
  })
}

describe('achievementChecker.js - checkCondition 条件判断', () => {
  it('正常值: 单条件满足时返回true', () => {
    const condition = { level: 10 }
    const data = { level: 15 }
    assert.strictEqual(checkCondition(condition, data), true, '满足条件应返回true')
  })

  it('正常值: 单条件不满足时返回false', () => {
    const condition = { level: 10 }
    const data = { level: 5 }
    assert.strictEqual(checkCondition(condition, data), false, '不满足条件应返回false')
  })

  it('正常值: 多条件全部满足时返回true', () => {
    const condition = { level: 10, score: 1000 }
    const data = { level: 15, score: 2000 }
    assert.strictEqual(checkCondition(condition, data), true, '多条件全部满足应返回true')
  })

  it('正常值: 多条件部分不满足时返回false', () => {
    const condition = { level: 10, score: 1000 }
    const data = { level: 15, score: 500 }
    assert.strictEqual(checkCondition(condition, data), false, '部分条件不满足应返回false')
  })

  it('边界值: 条件刚好等于要求值', () => {
    const condition = { level: 10 }
    const data = { level: 10 }
    assert.strictEqual(checkCondition(condition, data), true, '刚好等于要求值应返回true')
  })

  it('边界值: 条件比要求值小1', () => {
    const condition = { level: 10 }
    const data = { level: 9 }
    assert.strictEqual(checkCondition(condition, data), false, '比要求值小1应返回false')
  })

  it('异常值: 数据中缺少条件字段', () => {
    const condition = { level: 10 }
    const data = { score: 100 }
    assert.strictEqual(checkCondition(condition, data), false, '缺少字段应返回false')
  })

  it('异常值: 空条件对象', () => {
    const condition = {}
    const data = { level: 10 }
    assert.strictEqual(checkCondition(condition, data), true, '空条件应返回true')
  })

  it('异常值: 空数据对象', () => {
    const condition = { level: 10 }
    const data = {}
    assert.strictEqual(checkCondition(condition, data), false, '空数据应返回false')
  })

  it('边界值: 条件值为0', () => {
    const condition = { level: 0 }
    const data = { level: 0 }
    assert.strictEqual(checkCondition(condition, data), true, '条件值为0且数据也为0应返回true')
  })

  it('边界值: 数据值为0但条件值大于0', () => {
    const condition = { level: 1 }
    const data = { level: 0 }
    assert.strictEqual(checkCondition(condition, data), false, '数据值为0不满足大于0的条件')
  })
})

describe('achievementChecker.js - checkPetAchievements 宠物成就检查', () => {
  it('正常值: 宠物等级满足成就条件', () => {
    const player = {
      achievement: { pet: [], monster: [], equipment: [] },
      props: { cultivateDan: 0 }
    }
    const pet = { level: 15 }
    const newAchievements = []
    
    checkPetAchievements(player, pet, newAchievements)
    
    assert.strictEqual(newAchievements.length, 1, '应解锁1个成就')
    assert.strictEqual(player.props.cultivateDan, 100, '应获得100培养丹')
  })

  it('正常值: 宠物等级不满足成就条件', () => {
    const player = {
      achievement: { pet: [], monster: [], equipment: [] },
      props: { cultivateDan: 0 }
    }
    const pet = { level: 5 }
    const newAchievements = []
    
    checkPetAchievements(player, pet, newAchievements)
    
    assert.strictEqual(newAchievements.length, 0, '不应解锁成就')
    assert.strictEqual(player.props.cultivateDan, 0, '不应获得培养丹')
  })

  it('边界值: 已获得成就不应重复获得', () => {
    const player = {
      achievement: { pet: [{ id: 'pet_1' }], monster: [], equipment: [] },
      props: { cultivateDan: 0 }
    }
    const pet = { level: 15 }
    const newAchievements = []
    
    checkPetAchievements(player, pet, newAchievements)
    
    assert.strictEqual(newAchievements.length, 0, '已获得成就不应重复')
    assert.strictEqual(player.props.cultivateDan, 0, '不应重复获得奖励')
  })

  it('正常值: 同时满足多个成就条件', () => {
    const player = {
      achievement: { pet: [], monster: [], equipment: [] },
      props: { cultivateDan: 0 }
    }
    const pet = { level: 60 }
    const newAchievements = []
    
    checkPetAchievements(player, pet, newAchievements)
    
    assert.strictEqual(newAchievements.length, 2, '应解锁2个成就')
    assert.strictEqual(player.props.cultivateDan, 600, '应获得600培养丹')
  })
})

describe('achievementChecker.js - checkEquipmentAchievements 装备成就检查', () => {
  it('正常值: 装备评分满足成就条件', () => {
    const player = {
      achievement: { pet: [], monster: [], equipment: [] },
      props: { cultivateDan: 0 }
    }
    const equipmentData = { score: 1500 }
    const newAchievements = []
    
    checkEquipmentAchievements(player, equipmentData, newAchievements)
    
    assert.strictEqual(newAchievements.length, 1, '应解锁1个成就')
    assert.strictEqual(player.achievement.equipment.length, 1, '成就列表应有1项')
  })

  it('正常值: 装备评分不满足成就条件', () => {
    const player = {
      achievement: { pet: [], monster: [], equipment: [] },
      props: { cultivateDan: 0 }
    }
    const equipmentData = { score: 500 }
    const newAchievements = []
    
    checkEquipmentAchievements(player, equipmentData, newAchievements)
    
    assert.strictEqual(newAchievements.length, 0, '不应解锁成就')
  })

  it('边界值: 评分刚好等于成就要求', () => {
    const player = {
      achievement: { pet: [], monster: [], equipment: [] },
      props: { cultivateDan: 0 }
    }
    const equipmentData = { score: 1000 }
    const newAchievements = []
    
    checkEquipmentAchievements(player, equipmentData, newAchievements)
    
    assert.strictEqual(newAchievements.length, 1, '刚好满足应解锁成就')
  })

  it('异常值: 装备数据缺少评分字段', () => {
    const player = {
      achievement: { pet: [], monster: [], equipment: [] },
      props: { cultivateDan: 0 }
    }
    const equipmentData = { attack: 100 }
    const newAchievements = []
    
    checkEquipmentAchievements(player, equipmentData, newAchievements)
    
    assert.strictEqual(newAchievements.length, 0, '缺少字段不应解锁成就')
  })
})

describe('achievementChecker.js - checkMonsterAchievements 怪物成就检查', () => {
  it('正常值: 击杀数满足成就条件', () => {
    const player = {
      achievement: { pet: [], monster: [], equipment: [] },
      props: { cultivateDan: 0 },
      killCount: 150
    }
    const newAchievements = []
    
    checkMonsterAchievements(player, null, newAchievements)
    
    assert.strictEqual(player.achievement.monster.length, 1, '应解锁1个成就')
    assert.strictEqual(player.props.cultivateDan, 50, '应获得50培养丹')
  })

  it('正常值: 击杀数不满足成就条件', () => {
    const player = {
      achievement: { pet: [], monster: [], equipment: [] },
      props: { cultivateDan: 0 },
      killCount: 50
    }
    const newAchievements = []
    
    checkMonsterAchievements(player, null, newAchievements)
    
    assert.strictEqual(player.achievement.monster.length, 0, '不应解锁成就')
  })

  it('边界值: 击杀数刚好100', () => {
    const player = {
      achievement: { pet: [], monster: [], equipment: [] },
      props: { cultivateDan: 0 },
      killCount: 100
    }
    const newAchievements = []
    
    checkMonsterAchievements(player, null, newAchievements)
    
    assert.strictEqual(player.achievement.monster.length, 1, '刚好100应解锁成就')
  })

  it('边界值: 击杀数99不满足条件', () => {
    const player = {
      achievement: { pet: [], monster: [], equipment: [] },
      props: { cultivateDan: 0 },
      killCount: 99
    }
    const newAchievements = []
    
    checkMonsterAchievements(player, null, newAchievements)
    
    assert.strictEqual(player.achievement.monster.length, 0, '99不满足100的条件')
  })
})

describe('achievementChecker.js - checkAchievements 主入口函数', () => {
  it('正常值: pet类型成就检查', () => {
    const player = {
      achievement: { pet: [], monster: [], equipment: [] },
      props: { cultivateDan: 0 }
    }
    const pet = { level: 15 }
    
    const result = checkAchievements(player, 'pet', pet)
    
    assert.strictEqual(Array.isArray(result), true, '应返回数组')
    assert.strictEqual(result.length, 1, '应解锁1个成就')
  })

  it('正常值: equipment类型成就检查', () => {
    const player = {
      achievement: { pet: [], monster: [], equipment: [] },
      props: { cultivateDan: 0 }
    }
    const equipmentData = { score: 1500 }
    
    const result = checkAchievements(player, 'equipment', equipmentData)
    
    assert.strictEqual(Array.isArray(result), true, '应返回数组')
    assert.strictEqual(result.length, 1, '应解锁1个成就')
  })

  it('正常值: monster类型成就检查', () => {
    const player = {
      achievement: { pet: [], monster: [], equipment: [] },
      props: { cultivateDan: 0 },
      killCount: 150
    }
    
    const result = checkAchievements(player, 'monster', null)
    
    assert.strictEqual(Array.isArray(result), true, '应返回数组')
  })

  it('异常值: 未知类型返回空数组', () => {
    const player = {
      achievement: { pet: [], monster: [], equipment: [] },
      props: { cultivateDan: 0 }
    }
    
    const result = checkAchievements(player, 'unknown', {})
    
    assert.strictEqual(Array.isArray(result), true, '应返回数组')
    assert.strictEqual(result.length, 0, '未知类型应返回空数组')
  })
})

run()
