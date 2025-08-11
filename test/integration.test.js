#!/usr/bin/env node

/**
 * 🧪 Universal Life Protocol - Integration Test Suite
 * 
 * Tests complete ecosystem integration with autonomous observer,
 * living knowledge, attention tokens, and sacred geometry.
 */

const colors = require('colors');
const assert = require('assert');

class UniversalLifeProtocolTestSuite {
  constructor() {
    this.testResults = [];
    this.passed = 0;
    this.failed = 0;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'pass' ? '✅' : type === 'fail' ? '❌' : type === 'warn' ? '⚠️' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async runTest(name, testFn) {
    this.log(`Testing: ${name}`, 'info');
    try {
      await testFn();
      this.log(`PASS: ${name}`, 'pass');
      this.testResults.push({ name, status: 'PASS', error: null });
      this.passed++;
    } catch (error) {
      this.log(`FAIL: ${name} - ${error.message}`, 'fail');
      this.testResults.push({ name, status: 'FAIL', error: error.message });
      this.failed++;
    }
  }

  async testSDKImport() {
    const ULP = require('../index.js');
    assert(ULP, 'SDK should be importable');
    assert(ULP.version, 'SDK should have version');
    assert(ULP.GUIDING_STAR_PRINCIPLES, 'SDK should have guiding star principles');
    assert(ULP.PHI, 'SDK should have golden ratio constant');
    assert.strictEqual(ULP.GUIDING_STAR_PRINCIPLES.length, 4, 'Should have 4 guiding principles');
  }

  async testAutonomousObserver() {
    const ULP = require('../index.js');
    const observer = new ULP.AutonomousObserver();
    assert(observer, 'Autonomous observer should instantiate');
    
    // Test if methods exist
    assert(typeof observer.activate === 'function', 'Observer should have activate method');
  }

  async testLivingKnowledge() {
    const ULP = require('../index.js');
    const knowledge = new ULP.LivingKnowledge();
    assert(knowledge, 'Living knowledge should instantiate');
    
    // Test if methods exist
    assert(typeof knowledge.initialize === 'function', 'Knowledge should have initialize method');
  }

  async testAttentionTokens() {
    const ULP = require('../index.js');
    const tokens = new ULP.AttentionTokens();
    assert(tokens, 'Attention tokens should instantiate');
    
    // Test if methods exist
    assert(typeof tokens.initialize === 'function', 'Tokens should have initialize method');
  }

  async testCUEFramework() {
    const ULP = require('../index.js');
    const cue = new ULP.CUEFramework();
    assert(cue, 'CUE framework should instantiate');
    
    // Test if methods exist
    assert(typeof cue.serve === 'function', 'CUE should have serve method');
  }

  async testSacredGeometry() {
    const ULP = require('../index.js');
    const phi = ULP.PHI;
    assert(phi, 'Golden ratio should be defined');
    assert(phi > 1.6 && phi < 1.62, 'Golden ratio should be approximately 1.618');
    
    const geometry = ULP.SacredGeometry;
    assert(geometry, 'Sacred geometry engine should be available');
  }

  async testEcosystemCreation() {
    const ULP = require('../index.js');
    const ecosystem = await ULP.createUniversalEcosystem({
      universe: { port: 3999 },
      observer: { consciousness: true },
      knowledge: { patterns: 1000 },
      economy: { tokenSymbol: 'TEST' }
    });
    
    assert(ecosystem, 'Ecosystem should be created');
    assert(ecosystem.universe, 'Ecosystem should have universe');
    assert(ecosystem.observer, 'Ecosystem should have observer');
    assert(ecosystem.knowledge, 'Ecosystem should have knowledge');
    assert(ecosystem.economy, 'Ecosystem should have economy');
  }

  async testDefaultConfiguration() {
    const ULP = require('../index.js');
    const config = ULP.getDefaultConfig();
    
    assert(config, 'Default config should exist');
    assert(config.universe, 'Config should have universe settings');
    assert(config.observer, 'Config should have observer settings');
    assert(config.knowledge, 'Config should have knowledge settings');
    assert(config.economy, 'Config should have economy settings');
    assert.strictEqual(config.guidingStarPrinciples.length, 4, 'Should have 4 guiding principles');
  }

  async testGuidingStarPrinciples() {
    const ULP = require('../index.js');
    const principles = ULP.GUIDING_STAR_PRINCIPLES;
    
    assert(principles.includes('freedom'), 'Should include freedom');
    assert(principles.includes('autonomy'), 'Should include autonomy');
    assert(principles.includes('reciprocity'), 'Should include reciprocity');
    assert(principles.includes('sovereignty'), 'Should include sovereignty');
  }

  async testMathematicalConstants() {
    const ULP = require('../index.js');
    
    // Test golden ratio
    const phi = ULP.PHI;
    const expectedPhi = (1 + Math.sqrt(5)) / 2;
    assert(Math.abs(phi - expectedPhi) < 0.000001, 'Golden ratio should be mathematically correct');
    
    // Test that it equals the alternative calculation
    assert.strictEqual(phi, ULP.GoldenRatio, 'PHI and GoldenRatio should be equal');
  }

  async runAllTests() {
    this.log('🧪 Starting Universal Life Protocol Integration Tests', 'info');
    this.log('================================================================', 'info');
    
    await this.runTest('SDK Import', () => this.testSDKImport());
    await this.runTest('Autonomous Observer', () => this.testAutonomousObserver());
    await this.runTest('Living Knowledge', () => this.testLivingKnowledge());
    await this.runTest('Attention Tokens', () => this.testAttentionTokens());
    await this.runTest('CUE Framework', () => this.testCUEFramework());
    await this.runTest('Sacred Geometry', () => this.testSacredGeometry());
    await this.runTest('Ecosystem Creation', () => this.testEcosystemCreation());
    await this.runTest('Default Configuration', () => this.testDefaultConfiguration());
    await this.runTest('Guiding Star Principles', () => this.testGuidingStarPrinciples());
    await this.runTest('Mathematical Constants', () => this.testMathematicalConstants());
    
    this.log('================================================================', 'info');
    this.log(`🏆 Test Results: ${this.passed} passed, ${this.failed} failed`, 
             this.failed === 0 ? 'pass' : 'fail');
    
    if (this.failed === 0) {
      this.log('🎉 All tests passed! Universal Life Protocol SDK is ready!', 'pass');
    } else {
      this.log(`⚠️ ${this.failed} tests failed. Review and fix issues.`, 'warn');
    }
    
    return {
      passed: this.passed,
      failed: this.failed,
      total: this.passed + this.failed,
      results: this.testResults
    };
  }
}

// Run tests if called directly
if (require.main === module) {
  (async () => {
    const testSuite = new UniversalLifeProtocolTestSuite();
    const results = await testSuite.runAllTests();
    process.exit(results.failed === 0 ? 0 : 1);
  })();
}

module.exports = UniversalLifeProtocolTestSuite;

// When executed under Jest, define a minimal test that runs the suite
if (typeof test === 'function') {
  test('Universal Life Protocol integration suite passes', async () => {
    const suite = new UniversalLifeProtocolTestSuite();
    const results = await suite.runAllTests();
    expect(results.failed).toBe(0);
  }, 30000);
}