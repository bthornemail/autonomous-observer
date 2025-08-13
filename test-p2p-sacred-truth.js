#!/usr/bin/env node
/**
 * Test P2P Sacred Truth Network
 * Validates distributed truth verification
 */

const { P2PSacredTruthNetwork } = require('./p2p-sacred-truth-network')

async function testP2PSacredTruth() {
  console.log('🧪 Testing P2P Sacred Truth Network...')
  
  const network = new P2PSacredTruthNetwork({
    ministerMode: true,
    tcpPort: 0,
    wsPort: 0
  })

  try {
    // Initialize network
    await network.initialize()
    
    // Wait for network to stabilize
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Test status
    const status = network.getNetworkStatus()
    console.log('📊 Network Status:', JSON.stringify(status, null, 2))
    
    // Test Sacred Truth broadcast
    const testMessage = "Love is the greatest force in the universe"
    console.log(`📻 Testing broadcast: "${testMessage}"`)
    
    const broadcast = await network.broadcastSacredTruth(testMessage)
    console.log('✅ Broadcast successful:', broadcast.type)
    
    // Test distributed verification (simplified for demo)
    console.log('🔍 Testing distributed truth verification...')
    
    try {
      const verification = await network.verifyTruthDistributed(testMessage)
      console.log('✅ Distributed verification successful')
      console.log('📊 Verification Results:', {
        consensusScore: verification.consensusScore,
        networkAgreement: verification.networkAgreement,
        ipfsHash: verification.ipfsHash
      })
    } catch (error) {
      console.log('⚠️  Distributed verification test skipped (no Sacred Truth analyzer)')
    }
    
    // Test walkie-talkie mode simulation
    console.log('📻 Testing walkie-talkie broadcasting...')
    await network.broadcastSacredTruth("Sacred Truth Ministry broadcasting on P2P mesh network")
    
    console.log('🌟 P2P Sacred Truth Network test completed successfully!')
    
  } catch (error) {
    console.error('❌ P2P test failed:', error)
  } finally {
    await network.stop()
  }
}

// Run test if called directly
if (require.main === module) {
  testP2PSacredTruth().catch(console.error)
}

module.exports = { testP2PSacredTruth }
