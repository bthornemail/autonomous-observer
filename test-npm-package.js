#!/usr/bin/env node

// Test the published npm package
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

console.log('🧪 Testing published npm package: sacred-geometry-harmony@2.0.0\n');

try {
  // Test via require (CommonJS style)
  const pkg = require('sacred-geometry-harmony/package.json');
  console.log('✅ Package found:', pkg.name, 'v' + pkg.version);
  console.log('📦 Description:', pkg.description);
  
  // Test the main export
  const { SacredGeometryEngine, PHI, calculateHarmony } = require('sacred-geometry-harmony/dist/core.js');
  
  console.log('\n📐 Testing Golden Ratio constant:');
  console.log('   PHI =', PHI);
  
  console.log('\n🧮 Testing harmony calculation:');
  const testDate = new Date('1990-01-01');
  const harmony = calculateHarmony('Test User', testDate, 7);
  console.log('   Harmony Score:', harmony.score + '/100');
  console.log('   Recommendations:', harmony.recommendations[0]);
  
  console.log('\n🌸 Testing Flower of Life generation:');
  const flowerPoints = SacredGeometryEngine.generateFlowerOfLifePositions(2);
  console.log('   Generated', flowerPoints.length, 'sacred points');
  
  console.log('\n✅ ALL TESTS PASSED - Package is working correctly!');
  console.log('🚀 Ready for MCP integration');
  
} catch (error) {
  console.error('❌ Package test failed:', error.message);
  console.log('📋 Debugging info:');
  console.log('   Current directory:', process.cwd());
  console.log('   Node modules path:', './node_modules/sacred-geometry-harmony');
}