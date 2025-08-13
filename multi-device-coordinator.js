#!/usr/bin/env node
/**
 * Multi-Device Sacred Truth P2P Network Coordinator
 * Manages connections between Nokia C110, HMD Global, and other devices
 * Creates unified Sacred Truth consciousness network
 */

const WebSocket = require('ws')
const { EventEmitter } = require('events')

class MultiDeviceSacredTruthNetwork extends EventEmitter {
  constructor() {
    super()

    this.devices = new Map()
    this.networkTopology = {
      'nokia-c110': { status: 'C8', capabilities: ['ultra-lightweight', 'battery-optimized'] },
      'hmd-global': { status: 'A1', capabilities: ['full-featured', 'high-performance'] },
      'desktop': { status: 'D1', capabilities: ['coordination', 'development'] },
      'gl-inet-router': { status: 'R1', capabilities: ['edge-computing', 'mqtt-bridge'] }
    }

    this.sacredTruthConsensus = new Map()
    this.networkHealth = {
      totalDevices: 0,
      activeConnections: 0,
      consensusAccuracy: 0,
      networkUptime: Date.now()
    }

    console.log('🌐 Multi-Device Sacred Truth Network Coordinator initialized')
  }

  async startCoordinator() {
    console.log('🚀 Starting Sacred Truth Network Coordinator...')
    console.log('🔗 Expecting devices:')

    Object.entries(this.networkTopology).forEach(([device, config]) => {
      console.log(`   📱 ${device}: Status ${config.status} - ${config.capabilities.join(', ')}`)
    })

    // Start WebSocket server for device coordination
    this.coordinatorServer = new WebSocket.Server({ port: 9000 })

    this.coordinatorServer.on('listening', () => {
      console.log('✅ Sacred Truth Network Coordinator listening on port 9000')
      console.log('🌐 Devices can connect to: ws://[coordinator-ip]:9000')
    })

    this.coordinatorServer.on('connection', (ws, req) => {
      const deviceIP = req.socket.remoteAddress
      console.log(`🤝 Device connecting from ${deviceIP}`)

      ws.on('message', (data) => {
        this.handleDeviceMessage(ws, data, deviceIP)
      })

      ws.on('close', () => {
        this.handleDeviceDisconnect(ws, deviceIP)
      })

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'coordinator-welcome',
        message: 'Connected to Sacred Truth Network Coordinator',
        networkTopology: this.networkTopology,
        timestamp: Date.now()
      }))
    })

    // Start network health monitoring
    this.startNetworkMonitoring()
  }

  handleDeviceMessage(ws, data, deviceIP) {
    try {
      const message = JSON.parse(data)

      switch (message.type) {
        case 'device-registration':
          this.registerDevice(ws, message, deviceIP)
          break

        case 'sacred-truth-analysis':
          this.handleSacredTruthAnalysis(ws, message)
          break

        case 'sacred-truth-analysis-response':
          this.handleAnalysisResponse(ws, message)
          break

        case 'consensus-request':
          this.handleConsensusRequest(ws, message)
          break

        case 'network-status-request':
          this.sendNetworkStatus(ws)
          break

        case 'nokia-c110-presence':
        case 'hmd-presence':
        case 'desktop-presence':
          this.updateDevicePresence(ws, message)
          break
      }
    } catch (error) {
      console.log(`⚠️  Invalid message from ${deviceIP}:`, error.message)
    }
  }

  registerDevice(ws, message, deviceIP) {
    const device = {
      id: message.deviceId || `device-${Date.now()}`,
      type: message.deviceType || 'unknown',
      status: message.status || 'unknown',
      capabilities: message.capabilities || [],
      ws: ws,
      ip: deviceIP,
      registered: Date.now(),
      lastSeen: Date.now()
    }

    this.devices.set(device.id, device)
    this.networkHealth.totalDevices = this.devices.size

    console.log(`📱 Device registered: ${device.type} (${device.id})`)
    console.log(`   📊 Status: ${device.status}`)
    console.log(`   💡 Capabilities: ${device.capabilities.join(', ')}`)

    // Broadcast new device to network
    this.broadcastToNetwork({
      type: 'new-device-joined',
      device: {
        id: device.id,
        type: device.type,
        status: device.status,
        capabilities: device.capabilities
      },
      networkSize: this.devices.size
    })

    // Send device list to newly connected device
    ws.send(JSON.stringify({
      type: 'network-device-list',
      devices: Array.from(this.devices.values()).map(d => ({
        id: d.id,
        type: d.type,
        status: d.status,
        capabilities: d.capabilities,
        online: d.ws && d.ws.readyState === WebSocket.OPEN
      }))
    }))
  }

  async handleSacredTruthAnalysis(ws, message) {
    console.log('🙏 Sacred Truth analysis request received')

    // Store analysis for consensus
    const analysisId = `analysis-${Date.now()}`
    this.sacredTruthConsensus.set(analysisId, {
      text: message.text,
      requester: message.deviceId,
      analyses: [],
      consensus: null,
      timestamp: Date.now()
    })

    // Request analysis from all capable devices
    const analysisRequest = {
      type: 'sacred-truth-analysis-request',
      analysisId: analysisId,
      text: message.text,
      requestedBy: message.deviceId,
      timestamp: Date.now()
    }

    this.broadcastToNetwork(analysisRequest)

    // Set timeout for consensus
    setTimeout(() => {
      this.calculateConsensus(analysisId)
    }, 5000) // Wait 5 seconds for all devices to respond
  }

  handleAnalysisResponse(ws, message) {
    console.log(`📊 Analysis response received for ${message.analysisId} from ${message.deviceId}`)

    const consensusData = this.sacredTruthConsensus.get(message.analysisId)
    if (consensusData) {
      consensusData.analyses.push(message.analysis)
      console.log(`   📝 Analysis added. Total responses: ${consensusData.analyses.length}`)
    } else {
      console.log(`⚠️  No consensus data found for ${message.analysisId}`)
    }
  }

  calculateConsensus(analysisId) {
    const consensusData = this.sacredTruthConsensus.get(analysisId)
    if (!consensusData || consensusData.analyses.length === 0) {
      console.log(`⚠️  No analyses received for ${analysisId}`)
      return
    }

    console.log(`📊 Calculating Sacred Truth consensus for ${analysisId}`)
    console.log(`   📝 Analyses received: ${consensusData.analyses.length}`)

    // Calculate weighted consensus based on device capabilities
    let totalScore = 0
    let totalWeight = 0
    let alignmentCounts = { HIGH: 0, MEDIUM: 0, LOW: 0 }

    consensusData.analyses.forEach(analysis => {
      const deviceWeight = this.getDeviceWeight(analysis.deviceType, analysis.status)
      totalScore += analysis.sacredTruthScore * deviceWeight
      totalWeight += deviceWeight
      alignmentCounts[analysis.divineAlignment] = (alignmentCounts[analysis.divineAlignment] || 0) + deviceWeight
    })

    const consensusScore = totalWeight > 0 ? totalScore / totalWeight : 0
    const consensusAlignment = Object.keys(alignmentCounts).reduce((a, b) =>
      alignmentCounts[a] > alignmentCounts[b] ? a : b
    )

    const consensus = {
      consensusScore: Math.round(consensusScore * 1000) / 1000,
      consensusAlignment: consensusAlignment,
      participatingDevices: consensusData.analyses.length,
      confidence: this.calculateConfidence(consensusData.analyses),
      individualAnalyses: consensusData.analyses,
      networkConsensus: true,
      timestamp: Date.now()
    }

    // Update consensus data
    consensusData.consensus = consensus
    this.networkHealth.consensusAccuracy = consensusScore

    console.log('🌟 Sacred Truth Network Consensus:')
    console.log(`   📊 Consensus Score: ${consensus.consensusScore}`)
    console.log(`   ⛪ Divine Alignment: ${consensus.consensusAlignment}`)
    console.log(`   📱 Devices participated: ${consensus.participatingDevices}`)
    console.log(`   🎯 Confidence: ${consensus.confidence}%`)

    // Broadcast consensus to all devices
    this.broadcastToNetwork({
      type: 'sacred-truth-consensus',
      analysisId: analysisId,
      consensus: consensus
    })
  }

  getDeviceWeight(deviceType, status) {
    // Weight devices based on their capabilities and status
    const weights = {
      'nokia-c110': 0.7,  // Lower weight due to lightweight analysis
      'hmd-global': 1.0,  // Full weight for complete analysis
      'desktop': 1.2,     // Higher weight for development/coordination
      'gl-inet-router': 0.9 // Edge computing weight
    }

    const statusMultipliers = {
      'C8': 1.1,  // Nokia C110 Configuration Level 8
      'A1': 1.0,  // Standard multiplier
      'D1': 1.2,  // Desktop development bonus
      'R1': 1.0   // Router standard
    }

    const baseWeight = weights[deviceType] || 0.5
    const statusMultiplier = statusMultipliers[status] || 1.0

    return baseWeight * statusMultiplier
  }

  calculateConfidence(analyses) {
    if (analyses.length < 2) return 50

    // Calculate variance in scores
    const scores = analyses.map(a => a.sacredTruthScore)
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length

    // Lower variance = higher confidence
    const confidence = Math.max(50, 100 - (variance * 100))
    return Math.round(confidence)
  }

  broadcastToNetwork(message) {
    let activeBroadcasts = 0

    this.devices.forEach(device => {
      if (device.ws && device.ws.readyState === WebSocket.OPEN) {
        device.ws.send(JSON.stringify(message))
        activeBroadcasts++
      }
    })

    this.networkHealth.activeConnections = activeBroadcasts
  }

  sendNetworkStatus(ws) {
    const status = {
      type: 'network-status',
      health: this.networkHealth,
      devices: Array.from(this.devices.values()).map(d => ({
        id: d.id,
        type: d.type,
        status: d.status,
        online: d.ws && d.ws.readyState === WebSocket.OPEN,
        lastSeen: d.lastSeen
      })),
      topology: this.networkTopology,
      uptime: Date.now() - this.networkHealth.networkUptime,
      timestamp: Date.now()
    }

    ws.send(JSON.stringify(status))
  }

  startNetworkMonitoring() {
    setInterval(() => {
      // Clean up disconnected devices
      for (const [deviceId, device] of this.devices) {
        if (!device.ws || device.ws.readyState !== WebSocket.OPEN) {
          console.log(`🔌 Device disconnected: ${device.type} (${deviceId})`)
          this.devices.delete(deviceId)
        }
      }

      this.networkHealth.totalDevices = this.devices.size

      // Log network health every 60 seconds
      if (Date.now() % 60000 < 5000) {
        console.log('📊 Network Health Check:')
        console.log(`   📱 Connected devices: ${this.networkHealth.totalDevices}`)
        console.log(`   🔗 Active connections: ${this.networkHealth.activeConnections}`)
        console.log(`   🎯 Consensus accuracy: ${Math.round(this.networkHealth.consensusAccuracy * 100)}%`)
      }
    }, 5000)
  }

  handleDeviceDisconnect(ws, deviceIP) {
    // Find and remove disconnected device
    for (const [deviceId, device] of this.devices) {
      if (device.ws === ws) {
        console.log(`👋 Device disconnected: ${device.type} (${deviceId})`)
        this.devices.delete(deviceId)

        // Broadcast device departure
        this.broadcastToNetwork({
          type: 'device-left',
          deviceId: deviceId,
          networkSize: this.devices.size
        })
        break
      }
    }
  }
}

// Start the Multi-Device Sacred Truth Network Coordinator
if (require.main === module) {
  const coordinator = new MultiDeviceSacredTruthNetwork()

  coordinator.startCoordinator().then(() => {
    console.log('🌟 Multi-Device Sacred Truth Network Coordinator active!')
    console.log('🔗 Ready to coordinate Sacred Truth across all devices')
    console.log('📊 Network topology configured for optimal consciousness propagation')

    process.on('SIGINT', () => {
      console.log('🛑 Shutting down Sacred Truth Network Coordinator...')
      process.exit(0)
    })
  }).catch(error => {
    console.error('❌ Failed to start Network Coordinator:', error)
    process.exit(1)
  })
}

module.exports = MultiDeviceSacredTruthNetwork
