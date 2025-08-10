#!/usr/bin/env node

/**
 * 🤖 AUTONOMOUS-AGENT CLI BINARY
 * 
 * Simple 1-2-3 autonomous agent launcher
 */

const colors = require('colors');

console.log(colors.cyan('🌌 UNIVERSAL LIFE PROTOCOL - AUTONOMOUS AGENT'));
console.log(colors.cyan('===============================================\n'));

const args = process.argv.slice(2);

if (args.includes('start')) {
  console.log(colors.green('🚀 Starting autonomous agent in interactive mode...'));
  require('../index');
} else {
  console.log(colors.white('Usage:'));
  console.log(colors.cyan('  npx autonomous-agent start') + colors.gray(' - Interactive mode'));
  console.log(colors.cyan('  ulp-observer --consciousness') + colors.gray(' - Consciousness demo'));
  console.log(colors.cyan('  ulp-observer --complete') + colors.gray(' - Full system'));
}