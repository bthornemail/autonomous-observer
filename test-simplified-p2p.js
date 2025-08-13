#!/usr/bin/env node
const { SimplifiedP2PSacredTruth } = require('./simplified-p2p-sacred-truth')

async function testP2P() {
  console.log('🧪 Testing Simplified P2P Sacred Truth Network...')
  
  const network = new SimplifiedP2PSacredTruth({
    wsPort: 9001,
    enableMQTT: false // Disable for test
  })

  try {
    await network.initialize()
    
    // Test broadcast
    await network.broadcastSacredTruth("Testing P2P Sacred Truth broadcast")
    
    // Test status
    const status = network.getNetworkStatus()
    console.log('📊 Status:', status)
    
    // Test verification
    const result = await network.verifyTruthDistributed("Love is the greatest force")
    console.log('✅ Verification result:', result.consensus)
    
    console.log('🌟 P2P test completed successfully!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await network.stop()
  }
}

if (require.main === module) {
  testP2P()
}
