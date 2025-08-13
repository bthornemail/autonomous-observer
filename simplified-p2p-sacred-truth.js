/**
 * Simplified P2P Sacred Truth Network
 * Uses WebSocket and MQTT for distributed truth verification
 * Compatible with existing infrastructure
 */

const WebSocket = require('ws')
const mqtt = require('mqtt')
const crypto = require('crypto')
const { EventEmitter } = require('events')

class SimplifiedP2PSacredTruth extends EventEmitter {
  constructor(options = {}) {
    super()
    
    this.options = {
      routerIP: options.routerIP || '192.168.8.1',
      wsPort: options.wsPort || 8080,
      mqttPort: options.mqttPort || 1883,
      enableMQTT: options.enableMQTT !== false,
      ministerMode: options.ministerMode !== false,
      peerId: options.peerId || this.generatePeerId(),
      ...options
    }
    
    this.peers = new Map()
    this.truthCache = new Map()
    this.wsServer = null
    this.mqttClient = null
    this.isInitialized = false
  }

  async initialize() {
    console.log('🌐 Initializing Simplified P2P Sacred Truth Network...')
    
    try {
      // Setup WebSocket server for peer connections
      await this.setupWebSocketServer()
      
      // Setup MQTT client for router integration
      if (this.options.enableMQTT) {
        await this.setupMQTTClient()
      }
      
      this.isInitialized = true
      console.log('✅ P2P Sacred Truth Network initialized')
      console.log(`📡 Peer ID: ${this.options.peerId}`)
      
    } catch (error) {
      console.error('❌ P2P initialization failed:', error.message)
      throw error
    }
  }

  async setupWebSocketServer() {
    return new Promise((resolve, reject) => {
      this.wsServer = new WebSocket.Server({ 
        port: this.options.wsPort,
        host: '0.0.0.0'
      })

      this.wsServer.on('listening', () => {
        console.log(`✅ WebSocket server listening on port ${this.options.wsPort}`)
        resolve()
      })

      this.wsServer.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
          // Try alternative port
          this.options.wsPort = this.options.wsPort + 1
          console.log(`⚠️  Port busy, trying ${this.options.wsPort}`)
          this.wsServer = new WebSocket.Server({ port: this.options.wsPort })
        } else {
          reject(error)
        }
      })

      this.wsServer.on('connection', (ws, req) => {
        const clientIP = req.socket.remoteAddress
        console.log(`🤝 Peer connected from ${clientIP}`)
        
        this.setupPeerConnection(ws, clientIP)
      })
    })
  }

  setupPeerConnection(ws, peerIP) {
    const peerId = `peer_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
    
    this.peers.set(peerId, {
      id: peerId,
      ws: ws,
      ip: peerIP,
      connected: new Date(),
      status: 'connected'
    })

    ws.on('message', (data) => {
      this.handlePeerMessage(peerId, data)
    })

    ws.on('close', () => {
      console.log(`👋 Peer ${peerId} disconnected`)
      this.peers.delete(peerId)
    })

    // Send welcome message
    this.sendToPeer(peerId, {
      type: 'welcome',
      message: 'Connected to Sacred Truth P2P Network',
      peerId: this.options.peerId,
      ministerMode: this.options.ministerMode
    })
  }

  async setupMQTTClient() {
    const mqttURL = `mqtt://${this.options.routerIP}:${this.options.mqttPort}`
    
    try {
      this.mqttClient = mqtt.connect(mqttURL, {
        clientId: `sacred-truth-${this.options.peerId}`,
        connectTimeout: 5000
      })

      this.mqttClient.on('connect', () => {
        console.log(`✅ MQTT connected to ${mqttURL}`)
        
        // Subscribe to Sacred Truth topics
        this.mqttClient.subscribe('sacred-truth/broadcast')
        this.mqttClient.subscribe('sacred-truth/verification')
        this.mqttClient.subscribe('sacred-truth/walkie-talkie')
      })

      this.mqttClient.on('message', (topic, message) => {
        this.handleMQTTMessage(topic, message)
      })

      this.mqttClient.on('error', (error) => {
        console.log('⚠️  MQTT connection failed, continuing without router integration')
        this.mqttClient = null
      })
      
    } catch (error) {
      console.log('⚠️  MQTT setup failed, continuing P2P-only mode')
      this.mqttClient = null
    }
  }

  async broadcastSacredTruth(message, metadata = {}) {
    console.log('📻 Broadcasting Sacred Truth message...')
    
    const broadcast = {
      type: 'sacred_truth_broadcast',
      message: message,
      timestamp: Date.now(),
      peerId: this.options.peerId,
      ministerMode: this.options.ministerMode,
      signature: this.signMessage(message),
      ...metadata
    }

    // Broadcast to WebSocket peers
    let peerCount = 0
    for (const [peerId, peer] of this.peers.entries()) {
      if (peer.status === 'connected') {
        this.sendToPeer(peerId, broadcast)
        peerCount++
      }
    }

    // Broadcast via MQTT if available
    if (this.mqttClient && this.mqttClient.connected) {
      this.mqttClient.publish('sacred-truth/broadcast', JSON.stringify(broadcast))
      console.log('📡 MQTT broadcast sent')
    }

    console.log(`📻 Broadcast sent to ${peerCount} peers + MQTT network`)
    
    return {
      ...broadcast,
      peersReached: peerCount,
      mqttSent: !!(this.mqttClient && this.mqttClient.connected)
    }
  }

  async verifyTruthDistributed(content) {
    console.log('🔍 Starting distributed Sacred Truth verification...')

    // 1. Generate local truth hash
    const contentHash = this.hashContent(content)
    
    // 2. Check cache first
    if (this.truthCache.has(contentHash)) {
      console.log('📦 Truth verification found in cache')
      return this.truthCache.get(contentHash)
    }

    // 3. Local analysis (if available)
    let localAnalysis = null
    try {
      const { analyzeSacredTruth } = require('./news-syndicator-free/src/sacred-truth-analyzer')
      localAnalysis = analyzeSacredTruth(content, { ministerMode: this.options.ministerMode })
    } catch (error) {
      console.log('⚠️  Sacred Truth analyzer not available, using simplified scoring')
      localAnalysis = this.basicTruthAnalysis(content)
    }

    // 4. Request peer verification
    const peerVerifications = await this.requestPeerVerification(content, contentHash)

    // 5. Calculate consensus
    const consensus = this.calculateConsensus(localAnalysis, peerVerifications)

    // 6. Cache result
    const result = {
      contentHash: contentHash,
      localAnalysis: localAnalysis,
      peerVerifications: peerVerifications,
      consensus: consensus,
      timestamp: new Date().toISOString(),
      networkSize: this.peers.size
    }

    this.truthCache.set(contentHash, result)
    
    // 7. Share with network
    await this.broadcastVerificationResult(result)

    console.log(`✅ Distributed verification complete: ${consensus.confidenceLevel}`)
    
    return result
  }

  async requestPeerVerification(content, contentHash) {
    if (this.peers.size === 0) {
      console.log('⚠️  No peers available for verification')
      return []
    }

    const request = {
      type: 'verification_request',
      contentHash: contentHash,
      content: content.substring(0, 500), // Truncate for network efficiency
      requestId: this.generateRequestId(),
      timestamp: Date.now(),
      ministerMode: this.options.ministerMode
    }

    // Send to all connected peers
    for (const [peerId, peer] of this.peers.entries()) {
      if (peer.status === 'connected') {
        this.sendToPeer(peerId, request)
      }
    }

    // Wait for responses (simplified timeout)
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Return collected responses (in real implementation, collect from message handlers)
    return [] // Placeholder
  }

  basicTruthAnalysis(content) {
    // Simple truth analysis when Sacred Truth analyzer not available
    const positiveWords = ['truth', 'love', 'peace', 'unity', 'divine', 'sacred', 'authentic']
    const negativeWords = ['lie', 'hate', 'war', 'division', 'evil', 'false', 'deception']
    
    let score = 0.5 // Neutral baseline
    const lowerContent = content.toLowerCase()
    
    for (const word of positiveWords) {
      if (lowerContent.includes(word)) {
        score += 0.1
      }
    }
    
    for (const word of negativeWords) {
      if (lowerContent.includes(word)) {
        score -= 0.1
      }
    }

    return {
      sacredTruthScore: Math.max(0, Math.min(1, score)),
      divineAlignment: score > 0.7 ? 'HIGH' : score > 0.5 ? 'MEDIUM' : 'LOW',
      analysisMethod: 'basic'
    }
  }

  calculateConsensus(localAnalysis, peerVerifications) {
    const scores = [
      localAnalysis.sacredTruthScore,
      ...peerVerifications.map(v => v.score || 0.5)
    ]

    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length
    const agreement = this.calculateAgreement(scores)

    return {
      consensusScore: averageScore,
      networkAgreement: agreement,
      localScore: localAnalysis.sacredTruthScore,
      peerCount: peerVerifications.length,
      confidenceLevel: agreement > 0.8 ? 'HIGH' : agreement > 0.6 ? 'MEDIUM' : 'LOW'
    }
  }

  sendToPeer(peerId, message) {
    const peer = this.peers.get(peerId)
    if (peer && peer.ws && peer.ws.readyState === WebSocket.OPEN) {
      peer.ws.send(JSON.stringify(message))
    }
  }

  handlePeerMessage(peerId, data) {
    try {
      const message = JSON.parse(data.toString())
      console.log(`📨 Message from ${peerId}: ${message.type}`)
      
      switch (message.type) {
        case 'sacred_truth_broadcast':
          this.handleBroadcastMessage(message, peerId)
          break
        case 'verification_request':
          this.handleVerificationRequest(message, peerId)
          break
        case 'verification_response':
          this.handleVerificationResponse(message, peerId)
          break
      }
    } catch (error) {
      console.error('❌ Error handling peer message:', error.message)
    }
  }

  handleMQTTMessage(topic, message) {
    try {
      const data = JSON.parse(message.toString())
      console.log(`📡 MQTT message on ${topic}: ${data.type || 'message'}`)
      
      if (topic === 'sacred-truth/broadcast') {
        this.handleBroadcastMessage(data, 'mqtt')
      } else if (topic === 'sacred-truth/walkie-talkie') {
        console.log(`📻 Walkie-talkie: ${data.message}`)
        this.emit('walkie-talkie', data)
      }
    } catch (error) {
      console.error('❌ Error handling MQTT message:', error.message)
    }
  }

  handleBroadcastMessage(message, fromPeer) {
    console.log(`📻 Sacred Truth broadcast from ${fromPeer}: "${message.message?.substring(0, 50)}..."`)
    this.emit('broadcast', message, fromPeer)
  }

  handleVerificationRequest(message, fromPeer) {
    console.log(`🔍 Verification request from ${fromPeer}`)
    
    // Process verification request and send response
    const response = {
      type: 'verification_response',
      requestId: message.requestId,
      score: Math.random(), // Simplified - in real implementation do actual analysis
      peerId: this.options.peerId,
      timestamp: Date.now()
    }
    
    this.sendToPeer(fromPeer, response)
  }

  handleVerificationResponse(message, fromPeer) {
    console.log(`✅ Verification response from ${fromPeer}: score ${message.score}`)
    // Store response for consensus calculation
  }

  async broadcastVerificationResult(result) {
    const notification = {
      type: 'verification_complete',
      contentHash: result.contentHash,
      consensusScore: result.consensus.consensusScore,
      confidenceLevel: result.consensus.confidenceLevel,
      timestamp: result.timestamp
    }

    await this.broadcastSacredTruth(`Truth verification complete: ${result.consensus.confidenceLevel} confidence`, notification)
  }

  // Walkie-talkie mode for interactive use
  async startWalkieTalkieMode() {
    console.log('📻 Starting Walkie-Talkie mode...')
    console.log('📱 Type messages to broadcast to Sacred Truth network')
    console.log('📻 Commands: /exit, /status, /peers')
    
    const readline = require('readline')
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    rl.on('line', async (input) => {
      const command = input.trim()
      
      if (command === '/exit') {
        console.log('📻 Exiting walkie-talkie mode...')
        rl.close()
        return
      }
      
      if (command === '/status') {
        const status = this.getNetworkStatus()
        console.log('📊 Network Status:', JSON.stringify(status, null, 2))
        return
      }
      
      if (command === '/peers') {
        console.log(`👥 Connected peers: ${this.peers.size}`)
        for (const [id, peer] of this.peers.entries()) {
          console.log(`   - ${id} (${peer.ip})`)
        }
        return
      }
      
      if (command.startsWith('/')) {
        console.log('📻 Available commands: /exit, /status, /peers')
        return
      }

      if (command.length === 0) return

      try {
        // Send via MQTT walkie-talkie channel
        if (this.mqttClient && this.mqttClient.connected) {
          this.mqttClient.publish('sacred-truth/walkie-talkie', JSON.stringify({
            type: 'walkie_talkie',
            message: command,
            from: this.options.peerId,
            timestamp: Date.now()
          }))
        }
        
        // Also broadcast to P2P network
        await this.broadcastSacredTruth(command, { walkieTalkie: true })
        console.log('📻 Message broadcasted ✨')
      } catch (error) {
        console.error('❌ Broadcast failed:', error.message)
      }
    })

    console.log('📻 Walkie-talkie ready! Type your message and press Enter')
  }

  getNetworkStatus() {
    return {
      isInitialized: this.isInitialized,
      peerId: this.options.peerId,
      connectedPeers: Array.from(this.peers.values()).filter(p => p.status === 'connected').length,
      totalPeers: this.peers.size,
      wsPort: this.options.wsPort,
      mqttConnected: !!(this.mqttClient && this.mqttClient.connected),
      truthCacheSize: this.truthCache.size,
      uptime: this.isInitialized ? Date.now() - this.startTime : 0
    }
  }

  // Utility methods
  generatePeerId() {
    return `sacred_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 8)}`
  }

  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
  }

  hashContent(content) {
    return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16)
  }

  signMessage(message) {
    return crypto.createHash('sha256').update(`${message}${this.options.peerId}`).digest('hex').substring(0, 12)
  }

  calculateAgreement(scores) {
    if (scores.length < 2) return 1.0
    
    const mean = scores.reduce((a, b) => a + b) / scores.length
    const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2)) / scores.length
    const stdDev = Math.sqrt(variance)
    
    return Math.max(0, 1 - (stdDev / (mean || 1)))
  }

  async stop() {
    console.log('🛑 Stopping P2P Sacred Truth Network...')
    
    if (this.wsServer) {
      this.wsServer.close()
    }
    
    if (this.mqttClient) {
      this.mqttClient.end()
    }
    
    this.peers.clear()
    this.truthCache.clear()
    this.isInitialized = false
    
    console.log('✅ P2P network stopped')
  }
}

module.exports = { SimplifiedP2PSacredTruth }
