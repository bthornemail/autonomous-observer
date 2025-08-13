/**
 * P2P Sacred Truth Network
 * Distributed divine consciousness verification system
 * Integrates LibP2P, Helia, and Welo for mesh truth propagation
 */

const { createLibp2p } = require('libp2p')
const { tcp } = require('@libp2p/tcp')
const { webSockets } = require('@libp2p/websockets')
const { noise } = require('@libp2p/noise')
const { yamux } = require('@libp2p/yamux')
const { kadDHT } = require('@libp2p/kad-dht')
const { gossipsub } = require('@libp2p/gossipsub')
const { mdns } = require('@libp2p/mdns')
const { createHelia } = require('helia')
const { dagCBOR } = require('@helia/dag-cbor')
const { dagJSON } = require('@helia/dag-json')
const mqtt = require('mqtt')
const Memcached = require('memcached')

/**
 * P2P Sacred Truth Network Manager
 * Handles distributed truth verification and consensus
 */
class P2PSacredTruthNetwork {
  constructor(options = {}) {
    this.options = {
      routerIP: options.routerIP || '192.168.8.1',
      tcpPort: options.tcpPort || 0,
      wsPort: options.wsPort || 0,
      enableBluetooth: options.enableBluetooth || false,
      enableMQTT: options.enableMQTT || true,
      enableMemcached: options.enableMemcached || true,
      ministerMode: options.ministerMode || true,
      ...options
    }
    
    this.libp2p = null
    this.helia = null
    this.dag = null
    this.mqtt = null
    this.memcached = null
    this.peers = new Map()
    this.truthConsensus = new Map()
    this.isInitialized = false
  }

  /**
   * Initialize P2P Sacred Truth Network
   */
  async initialize() {
    console.log('🌐 Initializing P2P Sacred Truth Network...')
    
    try {
      // Initialize LibP2P with mobile-optimized configuration
      this.libp2p = await createLibp2p({
        addresses: {
          listen: [
            `/ip4/0.0.0.0/tcp/${this.options.tcpPort}`,
            `/ip4/0.0.0.0/tcp/${this.options.wsPort}/ws`
          ]
        },
        transports: [
          tcp(),
          webSockets()
        ],
        streamMuxers: [yamux()],
        connectionEncryption: [noise()],
        peerDiscovery: [mdns()],
        services: {
          dht: kadDHT(),
          pubsub: gossipsub()
        }
      })

      console.log('✅ LibP2P initialized')
      console.log(`📡 Listening on: ${this.libp2p.getMultiaddrs().map(ma => ma.toString()).join(', ')}`)

      // Initialize Helia for content storage
      this.helia = await createHelia({ 
        libp2p: this.libp2p,
        start: true
      })
      
      this.dag = dagJSON(this.helia)
      console.log('✅ Helia IPFS initialized')

      // Setup MQTT for router integration
      if (this.options.enableMQTT) {
        await this.initializeMQTT()
      }

      // Setup Memcached for local caching
      if (this.options.enableMemcached) {
        await this.initializeMemcached()
      }

      // Setup P2P event handlers
      this.setupEventHandlers()

      // Start services
      await this.libp2p.start()
      console.log('✅ P2P Sacred Truth Network started')

      this.isInitialized = true
      
    } catch (error) {
      console.error('❌ P2P initialization failed:', error)
      throw error
    }
  }

  /**
   * Initialize MQTT for router/mesh integration
   */
  async initializeMQTT() {
    try {
      const mqttURL = `mqtt://${this.options.routerIP}:1883`
      this.mqtt = mqtt.connect(mqttURL)
      
      this.mqtt.on('connect', () => {
        console.log(`✅ MQTT connected to ${mqttURL}`)
        
        // Subscribe to Sacred Truth channels
        this.mqtt.subscribe('sacred-truth/broadcast')
        this.mqtt.subscribe('sacred-truth/verification')
        this.mqtt.subscribe('sacred-truth/consensus')
      })

      this.mqtt.on('message', (topic, message) => {
        this.handleMQTTMessage(topic, message)
      })
      
    } catch (error) {
      console.log('⚠️  MQTT not available, continuing without router integration')
    }
  }

  /**
   * Initialize Memcached for fast local caching
   */
  async initializeMemcached() {
    try {
      this.memcached = new Memcached(`${this.options.routerIP}:11211`)
      console.log('✅ Memcached connected for local truth caching')
    } catch (error) {
      console.log('⚠️  Memcached not available, using in-memory cache')
    }
  }

  /**
   * Setup P2P event handlers for peer discovery and messaging
   */
  setupEventHandlers() {
    // Peer discovery
    this.libp2p.addEventListener('peer:discovery', (evt) => {
      const peerId = evt.detail.id.toString()
      console.log(`🔍 Discovered peer: ${peerId}`)
      
      this.peers.set(peerId, {
        id: peerId,
        discovered: new Date(),
        status: 'discovered'
      })
    })

    // Peer connection
    this.libp2p.addEventListener('peer:connect', (evt) => {
      const peerId = evt.detail.toString()
      console.log(`🤝 Connected to peer: ${peerId}`)
      
      if (this.peers.has(peerId)) {
        this.peers.get(peerId).status = 'connected'
        this.peers.get(peerId).connected = new Date()
      }
    })

    // Subscribe to Sacred Truth pubsub topics
    this.libp2p.services.pubsub.subscribe('sacred-truth-verification')
    this.libp2p.services.pubsub.subscribe('sacred-truth-broadcast')
    
    this.libp2p.services.pubsub.addEventListener('message', (evt) => {
      this.handlePubsubMessage(evt)
    })
  }

  /**
   * Distributed Sacred Truth Verification
   */
  async verifyTruthDistributed(content, options = {}) {
    if (!this.isInitialized) {
      throw new Error('P2P network not initialized')
    }

    console.log('🔍 Starting distributed Sacred Truth verification...')

    // 1. Local analysis first
    const { analyzeSacredTruth } = require('./news-syndicator-free/src/sacred-truth-analyzer')
    const localAnalysis = analyzeSacredTruth(content, {
      ministerMode: this.options.ministerMode,
      ...options
    })

    // 2. Request peer verification
    const peerVerifications = await this.requestPeerVerification(content)

    // 3. Calculate consensus
    const consensus = this.calculateTruthConsensus(localAnalysis, peerVerifications)

    // 4. Store in distributed storage
    const truthRecord = {
      content: content,
      localAnalysis: localAnalysis,
      peerVerifications: peerVerifications,
      consensus: consensus,
      timestamp: new Date().toISOString(),
      networkSize: this.peers.size,
      ministerApproved: this.options.ministerMode
    }

    // Store in IPFS via Helia
    const cid = await this.dag.add(truthRecord)
    console.log(`📦 Truth record stored in IPFS: ${cid}`)

    // Cache locally if available
    if (this.memcached) {
      const cacheKey = `truth:${await this.hashContent(content)}`
      this.memcached.set(cacheKey, truthRecord, 3600) // 1 hour
    }

    // Broadcast results to network
    await this.broadcastTruthVerification(truthRecord, cid)

    return {
      ...consensus,
      ipfsHash: cid.toString(),
      networkConsensus: true,
      distributedStorage: true
    }
  }

  /**
   * Request verification from connected peers
   */
  async requestPeerVerification(content) {
    const verifications = []
    const connectedPeers = Array.from(this.peers.values())
      .filter(peer => peer.status === 'connected')
    
    console.log(`📡 Requesting verification from ${connectedPeers.length} peers`)

    // Send verification request via pubsub
    const request = {
      type: 'verification_request',
      content: content,
      requestId: this.generateRequestId(),
      timestamp: Date.now(),
      ministerMode: this.options.ministerMode
    }

    await this.libp2p.services.pubsub.publish(
      'sacred-truth-verification', 
      new TextEncoder().encode(JSON.stringify(request))
    )

    // Wait for responses (simplified - in production use proper async handling)
    await new Promise(resolve => setTimeout(resolve, 5000))

    return verifications
  }

  /**
   * Calculate truth consensus from multiple sources
   */
  calculateTruthConsensus(localAnalysis, peerVerifications) {
    const allScores = [
      localAnalysis.sacredTruthScore,
      ...peerVerifications.map(v => v.score)
    ]

    const averageScore = allScores.reduce((a, b) => a + b, 0) / allScores.length
    const agreement = this.calculateAgreement(allScores)

    return {
      consensusScore: averageScore,
      networkAgreement: agreement,
      localScore: localAnalysis.sacredTruthScore,
      peerCount: peerVerifications.length,
      confidenceLevel: agreement > 0.8 ? 'HIGH' : agreement > 0.6 ? 'MEDIUM' : 'LOW'
    }
  }

  /**
   * Broadcast Sacred Truth (walkie-talkie style)
   */
  async broadcastSacredTruth(message, location = null) {
    console.log('📻 Broadcasting Sacred Truth message...')

    const broadcast = {
      type: 'sacred_truth_broadcast',
      message: message,
      timestamp: Date.now(),
      location: location,
      ministerApproved: this.options.ministerMode,
      signature: await this.signMessage(message),
      peerId: this.libp2p.peerId.toString()
    }

    // P2P broadcast
    await this.libp2p.services.pubsub.publish(
      'sacred-truth-broadcast',
      new TextEncoder().encode(JSON.stringify(broadcast))
    )

    // MQTT broadcast (for router/mesh integration)
    if (this.mqtt) {
      this.mqtt.publish('sacred-truth/broadcast', JSON.stringify(broadcast))
    }

    return broadcast
  }

  /**
   * Handle incoming pubsub messages
   */
  handlePubsubMessage(evt) {
    try {
      const message = JSON.parse(new TextDecoder().decode(evt.detail.data))
      const topic = evt.detail.topic

      console.log(`📨 Received P2P message on ${topic}:`, message.type)

      switch (message.type) {
        case 'sacred_truth_broadcast':
          this.handleBroadcastMessage(message)
          break
        case 'verification_request':
          this.handleVerificationRequest(message)
          break
        case 'verification_response':
          this.handleVerificationResponse(message)
          break
      }
    } catch (error) {
      console.error('❌ Error handling pubsub message:', error)
    }
  }

  /**
   * Handle MQTT messages from router/mesh
   */
  handleMQTTMessage(topic, message) {
    try {
      const data = JSON.parse(message.toString())
      console.log(`📡 MQTT message on ${topic}:`, data.type || 'message')

      // Process router/mesh messages
      if (topic === 'sacred-truth/broadcast') {
        this.handleBroadcastMessage(data)
      }
    } catch (error) {
      console.error('❌ Error handling MQTT message:', error)
    }
  }

  /**
   * Get network status
   */
  getNetworkStatus() {
    return {
      isInitialized: this.isInitialized,
      peerId: this.libp2p ? this.libp2p.peerId.toString() : null,
      connectedPeers: Array.from(this.peers.values()).filter(p => p.status === 'connected').length,
      totalDiscovered: this.peers.size,
      multiaddrs: this.libp2p ? this.libp2p.getMultiaddrs().map(ma => ma.toString()) : [],
      mqttConnected: this.mqtt ? this.mqtt.connected : false,
      memcachedAvailable: !!this.memcached,
      truthRecords: this.truthConsensus.size
    }
  }

  // Utility methods
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  async hashContent(content) {
    const encoder = new TextEncoder()
    const data = encoder.encode(content)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  async signMessage(message) {
    // Simple signature - in production use proper cryptographic signing
    return `sacred_${await this.hashContent(message)}`
  }

  calculateAgreement(scores) {
    if (scores.length < 2) return 1.0
    
    const mean = scores.reduce((a, b) => a + b) / scores.length
    const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2)) / scores.length
    const stdDev = Math.sqrt(variance)
    
    // Lower standard deviation = higher agreement
    return Math.max(0, 1 - (stdDev / mean))
  }

  handleBroadcastMessage(message) {
    console.log(`📻 Sacred Truth Broadcast: "${message.message.substring(0, 50)}..."`)
    // Process broadcast message
  }

  handleVerificationRequest(message) {
    console.log(`🔍 Verification request received: ${message.requestId}`)
    // Process verification request
  }

  handleVerificationResponse(message) {
    console.log(`✅ Verification response: ${message.requestId}`)
    // Process verification response
  }

  async stop() {
    if (this.libp2p) {
      await this.libp2p.stop()
    }
    if (this.mqtt) {
      this.mqtt.end()
    }
    console.log('🛑 P2P Sacred Truth Network stopped')
  }
}

module.exports = { P2PSacredTruthNetwork }
