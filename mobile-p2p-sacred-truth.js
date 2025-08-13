#!/usr/bin/env node
/**
 * Mobile P2P Sacred Truth Network
 * Optimized for Termux and mobile devices
 */

const { P2PSacredTruthNetwork } = require('./p2p-sacred-truth-network')

class MobileP2PSacredTruth extends P2PSacredTruthNetwork {
  constructor(options = {}) {
    // Mobile-optimized defaults
    super({
      routerIP: '192.168.1.1', // Common mobile hotspot IP
      enableBluetooth: true,
      enableMQTT: false, // Disable if no router available
      enableMemcached: false, // Use in-memory for mobile
      ...options
    })
  }

  async initializeMobile() {
    console.log('📱 Initializing Mobile P2P Sacred Truth Network...')
    
    // Mobile-specific initialization
    process.env.NODE_OPTIONS = '--max-old-space-size=150'
    
    await this.initialize()
    
    // Setup mobile-specific handlers
    this.setupMobileHandlers()
    
    console.log('📱 Mobile P2P Sacred Truth ready!')
    console.log('📻 Walkie-talkie mode: Send messages with broadcastSacredTruth()')
    console.log('🔍 Truth verification: Use verifyTruthDistributed()')
  }

  setupMobileHandlers() {
    // Mobile-specific event handling
    console.log('📱 Setting up mobile-optimized P2P handlers...')
    
    // Battery optimization
    setInterval(() => {
      this.optimizeBatteryUsage()
    }, 60000) // Every minute
  }

  optimizeBatteryUsage() {
    // Simple battery optimization
    const connectedPeers = Array.from(this.peers.values())
      .filter(p => p.status === 'connected')
    
    // Limit connections to save battery
    if (connectedPeers.length > 10) {
      console.log('🔋 Optimizing connections for battery life...')
      // Implementation would limit connections
    }
  }

  async walkieTalkieMode() {
    console.log('📻 Entering Walkie-Talkie mode...')
    console.log('📱 Type messages to broadcast to Sacred Truth mesh network:')
    
    const readline = require('readline')
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    rl.on('line', async (input) => {
      if (input.trim() === '/exit') {
        console.log('📻 Exiting walkie-talkie mode...')
        rl.close()
        return
      }
      
      if (input.trim() === '/status') {
        const status = this.getNetworkStatus()
        console.log('📊 Network Status:', status)
        return
      }
      
      if (input.trim().startsWith('/')) {
        console.log('📻 Commands: /exit, /status')
        return
      }

      try {
        await this.broadcastSacredTruth(input.trim())
        console.log('📻 Broadcast sent to mesh network ✨')
      } catch (error) {
        console.error('❌ Broadcast failed:', error.message)
      }
    })

    console.log('📻 Walkie-talkie ready! (type /exit to quit)')
  }
}

async function startMobileP2P() {
  const mobile = new MobileP2PSacredTruth()
  
  try {
    await mobile.initializeMobile()
    
    // Check if running interactively
    if (process.argv.includes('--walkie-talkie')) {
      await mobile.walkieTalkieMode()
    } else {
      console.log('📱 Mobile P2P Sacred Truth Network running...')
      console.log('📻 Add --walkie-talkie flag for interactive mode')
      
      // Keep running
      process.on('SIGINT', async () => {
        console.log('\n🛑 Shutting down mobile P2P network...')
        await mobile.stop()
        process.exit(0)
      })
    }
    
  } catch (error) {
    console.error('❌ Mobile P2P startup failed:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  startMobileP2P()
}

module.exports = { MobileP2PSacredTruth }
