/**
 * 自定义 describe/it 测试框架
 * 使用 Node.js 原生 assert 模块
 */

const assert = require('assert');

// 测试统计
let stats = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
};

// 当前测试套件
let currentSuite = '';

/**
 * 格式化错误信息
 */
function formatError(error, suiteName, testName) {
  return {
    suite: suiteName,
    test: testName,
    message: error.message,
    stack: error.stack
  };
}

/**
 * 打印测试结果
 */
function printResults() {
  console.log('\n' + '='.repeat(60));
  console.log('测试结果汇总');
  console.log('='.repeat(60));
  console.log(`总测试数: ${stats.total}`);
  console.log(`通过: \x1b[32m${stats.passed}\x1b[0m`);
  console.log(`失败: \x1b[31m${stats.failed}\x1b[0m`);

  if (stats.errors.length > 0) {
    console.log('\n失败详情:');
    stats.errors.forEach((err, index) => {
      console.log(`\n${index + 1}. ${err.suite} > ${err.test}`);
      console.log(`   错误: ${err.message}`);
    });
  }

  console.log('='.repeat(60));
}

/**
 * 定义测试套件
 * @param {string} name - 套件名称
 * @param {Function} fn - 测试函数
 */
function describe(name, fn) {
  const previousSuite = currentSuite;
  currentSuite = name;

  console.log(`\n📦 ${name}`);
  console.log('-'.repeat(40));

  try {
    fn();
  } catch (error) {
    console.error(`套件 "${name}" 执行出错:`, error.message);
  }

  currentSuite = previousSuite;
}

/**
 * 定义单个测试用例
 * @param {string} name - 测试名称
 * @param {Function} fn - 测试函数
 */
function it(name, fn) {
  stats.total++;
  const testName = name;

  try {
    fn();
    stats.passed++;
    console.log(`  ✅ ${testName}`);
  } catch (error) {
    stats.failed++;
    stats.errors.push(formatError(error, currentSuite, testName));
    console.log(`  ❌ ${testName}`);
    console.log(`     错误: ${error.message}`);
  }
}

/**
 * 跳过测试用例
 * @param {string} name - 测试名称
 * @param {Function} fn - 测试函数
 */
function it.skip(name, fn) {
  console.log(`  ⏭️  ${name} (跳过)`);
}

/**
 * 只运行此测试用例
 * @param {string} name - 测试名称
 * @param {Function} fn - 测试函数
 */
function it.only(name, fn) {
  it(name, fn);
}

/**
 * 在所有测试完成后运行
 */
function afterAll(fn) {
  process.on('exit', () => {
    fn();
  });
}

/**
 * 在每个测试前运行
 */
function beforeEach(fn) {
  // 简化实现，实际项目中可能需要更复杂的逻辑
  fn();
}

/**
 * 在每个测试后运行
 */
function afterEach(fn) {
  // 简化实现
  fn();
}

/**
 * 重置统计信息
 */
function resetStats() {
  stats = {
    total: 0,
    passed: 0,
    failed: 0,
    errors: []
  };
}

/**
 * 获取统计信息
 */
function getStats() {
  return { ...stats };
}

/**
 * 设置退出码
 */
function setExitCode() {
  process.on('exit', () => {
    printResults();
    process.exitCode = stats.failed > 0 ? 1 : 0;
  });
}

module.exports = {
  describe,
  it,
  it: Object.assign(it, { skip: it.skip, only: it.only }),
  assert,
  afterAll,
  beforeEach,
  afterEach,
  resetStats,
  getStats,
  setExitCode,
  printResults
};
