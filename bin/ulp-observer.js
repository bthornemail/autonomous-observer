#!/usr/bin/env node

/**
 * 🌌 ULP-OBSERVER CLI BINARY
 * 
 * Command line interface for the Universal Life Protocol Autonomous Observer
 */

const { UniversalLifeProtocolCLI } = require('../index');

// Parse command line arguments
const args = process.argv.slice(2);

if (args.includes('--consciousness')) {
  console.log('🧠 Starting consciousness demo...');
  runDemo('consciousness');
} else if (args.includes('--living-knowledge')) {
  console.log('🌱 Starting living knowledge demo...');
  runDemo('living-knowledge');
} else if (args.includes('--attention-tokens')) {
  console.log('💰 Starting attention token demo...');
  runDemo('attention-tokens');
} else if (args.includes('--complete')) {
  console.log('🔥 Starting complete system...');
  runDemo('complete');
} else {
  // Default: start interactive CLI
  const cli = new UniversalLifeProtocolCLI();
  cli.run().catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
}

async function runDemo(type) {
  const cli = new UniversalLifeProtocolCLI();
  
  switch (type) {
    case 'consciousness':
      await cli.runConsciousnessDemo();
      break;
    case 'living-knowledge':
      await cli.runLivingKnowledgeDemo();
      break;
    case 'attention-tokens':
      await cli.runAttentionEconomyDemo();
      break;
    case 'complete':
      await cli.runCompleteSystem();
      break;
  }
  
  process.exit(0);
}