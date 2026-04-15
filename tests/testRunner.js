import assert from 'assert'

let currentSuite = null
let suites = []
let passCount = 0
let failCount = 0

export function describe(name, fn) {
  const suite = {
    name,
    tests: [],
    beforeEach: null,
    afterEach: null
  }
  currentSuite = suite
  fn()
  suites.push(suite)
  currentSuite = null
}

export function it(name, fn) {
  if (!currentSuite) {
    throw new Error('it() must be called inside describe()')
  }
  currentSuite.tests.push({ name, fn })
}

export function beforeEach(fn) {
  if (!currentSuite) {
    throw new Error('beforeEach() must be called inside describe()')
  }
  currentSuite.beforeEach = fn
}

export function afterEach(fn) {
  if (!currentSuite) {
    throw new Error('afterEach() must be called inside describe()')
  }
  currentSuite.afterEach = fn
}

export function run() {
  console.log('\n')
  console.log('========================================')
  console.log('           测试运行器启动')
  console.log('========================================\n')
  
  const startTime = Date.now()
  
  for (const suite of suites) {
    console.log(`\n📦 ${suite.name}`)
    console.log('─'.repeat(50))
    
    for (const test of suite.tests) {
      try {
        if (suite.beforeEach) suite.beforeEach()
        test.fn()
        if (suite.afterEach) suite.afterEach()
        console.log(`  ✅ ${test.name}`)
        passCount++
      } catch (error) {
        console.log(`  ❌ ${test.name}`)
        console.log(`     错误: ${error.message}`)
        if (error.stack) {
          const stackLines = error.stack.split('\n').slice(0, 3)
          stackLines.forEach(line => console.log(`     ${line}`))
        }
        failCount++
      }
    }
  }
  
  const endTime = Date.now()
  const duration = endTime - startTime
  
  console.log('\n========================================')
  console.log('              测试结果汇总')
  console.log('========================================')
  console.log(`  总计: ${passCount + failCount} 个测试`)
  console.log(`  ✅ 通过: ${passCount}`)
  console.log(`  ❌ 失败: ${failCount}`)
  console.log(`  ⏱️  耗时: ${duration}ms`)
  console.log('========================================\n')
  
  if (failCount > 0) {
    process.exit(1)
  }
}

export { assert }
