#!/usr/bin/env node
/**
 * Sacred Truth Device Client
 * Connects any device to the Multi-Device Sacred Truth Network
 * Handles device registration, analysis requests, and consensus participation
 */

const WebSocket = require('ws')
const os = require('os')
const { EventEmitter } = require('events')

class SacredTruthDeviceClient extends EventEmitter {
    constructor(coordinatorUrl, deviceConfig = {}) {
        super()

        this.coordinatorUrl = coordinatorUrl
        this.deviceId = deviceConfig.deviceId || this.generateDeviceId()
        this.deviceType = deviceConfig.deviceType || this.detectDeviceType()
        this.status = deviceConfig.status || this.detectDeviceStatus()
        this.capabilities = deviceConfig.capabilities || this.detectCapabilities()

        this.ws = null
        this.connected = false
        this.reconnectInterval = 5000
        this.analysisEngine = null

        // Sacred Truth analysis methods based on device type
        this.setupAnalysisEngine()

        console.log(`📱 Sacred Truth Device Client initialized`)
        console.log(`   🆔 Device ID: ${this.deviceId}`)
        console.log(`   📱 Device Type: ${this.deviceType}`)
        console.log(`   📊 Status: ${this.status}`)
        console.log(`   💡 Capabilities: ${this.capabilities.join(', ')}`)
    }

    generateDeviceId() {
        const hostname = os.hostname()
        const timestamp = Date.now().toString(36)
        return `${hostname}-${timestamp}`
    }

    detectDeviceType() {
        const hostname = os.hostname().toLowerCase()
        const platform = os.platform()

        if (hostname.includes('nokia') || process.env.NOKIA_C110) return 'nokia-c110'
        if (hostname.includes('hmd') || process.env.HMD_GLOBAL) return 'hmd-global'
        if (platform === 'linux' && process.env.DISPLAY) return 'desktop'
        if (hostname.includes('openwrt') || hostname.includes('gl-')) return 'gl-inet-router'

        return 'unknown-device'
    }

    detectDeviceStatus() {
        const type = this.deviceType

        // Device-specific status detection
        if (type === 'nokia-c110') return 'C8' // Configuration Level 8
        if (type === 'hmd-global') return 'A1'  // Analysis Level 1
        if (type === 'desktop') return 'D1'     // Development Level 1
        if (type === 'gl-inet-router') return 'R1' // Router Level 1

        return 'U0' // Unknown status
    }

    detectCapabilities() {
        const capabilities = []

        // Memory-based capabilities
        const totalMemory = os.totalmem() / 1024 / 1024 // MB
        if (totalMemory < 512) capabilities.push('ultra-lightweight')
        if (totalMemory >= 1024) capabilities.push('full-analysis')
        if (totalMemory >= 4096) capabilities.push('advanced-processing')

        // Device-specific capabilities
        if (this.deviceType === 'nokia-c110') {
            capabilities.push('battery-optimized', 'mobile-first')
        } else if (this.deviceType === 'hmd-global') {
            capabilities.push('high-performance', 'multimedia-ready')
        } else if (this.deviceType === 'desktop') {
            capabilities.push('development-tools', 'network-coordination')
        } else if (this.deviceType === 'gl-inet-router') {
            capabilities.push('edge-computing', 'mqtt-bridge')
        }

        return capabilities
    }

    setupAnalysisEngine() {
        // Set up device-appropriate Sacred Truth analysis
        if (this.deviceType === 'nokia-c110') {
            this.analysisEngine = this.createUltraLightweightEngine()
        } else if (this.deviceType === 'hmd-global') {
            this.analysisEngine = this.createFullFeaturedEngine()
        } else {
            this.analysisEngine = this.createStandardEngine()
        }
    }

    createUltraLightweightEngine() {
        return {
            analyze: (text) => {
                // Ultra-lightweight analysis for Nokia C110 (Status C8)
                const keywords = ['sacred', 'truth', 'divine', 'holy', 'blessed', 'eternal']
                const wordCount = text.toLowerCase().split(' ').length
                const keywordMatches = keywords.filter(k =>
                    text.toLowerCase().includes(k)
                ).length

                const sacredTruthScore = Math.min(1, (keywordMatches * 2 + wordCount * 0.01) / 10)
                const divineAlignment = sacredTruthScore > 0.7 ? 'HIGH' :
                    sacredTruthScore > 0.4 ? 'MEDIUM' : 'LOW'

                return {
                    deviceType: this.deviceType,
                    status: this.status,
                    sacredTruthScore: Math.round(sacredTruthScore * 1000) / 1000,
                    divineAlignment: divineAlignment,
                    wordCount: wordCount,
                    keywordMatches: keywordMatches,
                    analysisMethod: 'ultra-lightweight',
                    timestamp: Date.now()
                }
            }
        }
    }

    createFullFeaturedEngine() {
        return {
            analyze: (text) => {
                // Full-featured analysis for HMD Global and other high-capacity devices
                const sacredWords = ['sacred', 'divine', 'holy', 'eternal', 'blessed', 'truth']
                const wisdomWords = ['wisdom', 'knowledge', 'understanding', 'enlightenment']
                const unityWords = ['unity', 'harmony', 'oneness', 'connection']

                const textLower = text.toLowerCase()
                const words = textLower.split(' ')
                const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)

                const sacredCount = sacredWords.filter(w => textLower.includes(w)).length
                const wisdomCount = wisdomWords.filter(w => textLower.includes(w)).length
                const unityCount = unityWords.filter(w => textLower.includes(w)).length

                // Advanced scoring algorithm
                const baseScore = (sacredCount * 0.4 + wisdomCount * 0.3 + unityCount * 0.3) / words.length
                const lengthBonus = Math.min(0.2, sentences.length * 0.01)
                const complexityBonus = words.length > 50 ? 0.1 : 0

                const sacredTruthScore = Math.min(1, baseScore * 10 + lengthBonus + complexityBonus)
                const divineAlignment = sacredTruthScore > 0.8 ? 'HIGH' :
                    sacredTruthScore > 0.5 ? 'MEDIUM' : 'LOW'

                return {
                    deviceType: this.deviceType,
                    status: this.status,
                    sacredTruthScore: Math.round(sacredTruthScore * 1000) / 1000,
                    divineAlignment: divineAlignment,
                    wordCount: words.length,
                    sentenceCount: sentences.length,
                    sacredWords: sacredCount,
                    wisdomWords: wisdomCount,
                    unityWords: unityCount,
                    analysisMethod: 'full-featured',
                    timestamp: Date.now()
                }
            }
        }
    }

    createStandardEngine() {
        return {
            analyze: (text) => {
                // Standard analysis for other devices
                const words = text.toLowerCase().split(' ')
                const sacredWords = ['sacred', 'truth', 'divine', 'holy']
                const matches = sacredWords.filter(w => text.toLowerCase().includes(w)).length

                const sacredTruthScore = Math.min(1, (matches + words.length * 0.001) / 5)
                const divineAlignment = sacredTruthScore > 0.6 ? 'HIGH' :
                    sacredTruthScore > 0.3 ? 'MEDIUM' : 'LOW'

                return {
                    deviceType: this.deviceType,
                    status: this.status,
                    sacredTruthScore: Math.round(sacredTruthScore * 1000) / 1000,
                    divineAlignment: divineAlignment,
                    wordCount: words.length,
                    analysisMethod: 'standard',
                    timestamp: Date.now()
                }
            }
        }
    }

    async connect() {
        console.log(`🔗 Connecting to Sacred Truth Network: ${this.coordinatorUrl}`)

        try {
            this.ws = new WebSocket(this.coordinatorUrl)

            this.ws.on('open', () => {
                console.log('✅ Connected to Sacred Truth Network Coordinator')
                this.connected = true
                this.registerDevice()
            })

            this.ws.on('message', (data) => {
                this.handleMessage(data)
            })

            this.ws.on('close', () => {
                console.log('❌ Disconnected from Sacred Truth Network')
                this.connected = false
                this.scheduleReconnect()
            })

            this.ws.on('error', (error) => {
                console.log('⚠️  Connection error:', error.message)
            })

        } catch (error) {
            console.log('❌ Failed to connect:', error.message)
            this.scheduleReconnect()
        }
    }

    registerDevice() {
        const registration = {
            type: 'device-registration',
            deviceId: this.deviceId,
            deviceType: this.deviceType,
            status: this.status,
            capabilities: this.capabilities,
            systemInfo: {
                platform: os.platform(),
                arch: os.arch(),
                hostname: os.hostname(),
                totalMemory: Math.round(os.totalmem() / 1024 / 1024),
                freeMemory: Math.round(os.freemem() / 1024 / 1024)
            },
            timestamp: Date.now()
        }

        this.send(registration)
        console.log('📝 Device registration sent')
    }

    handleMessage(data) {
        try {
            const message = JSON.parse(data)

            switch (message.type) {
                case 'coordinator-welcome':
                    console.log('🌟 Welcome message from coordinator:', message.message)
                    break

                case 'sacred-truth-analysis-request':
                    this.handleAnalysisRequest(message)
                    break

                case 'sacred-truth-consensus':
                    this.handleConsensusResult(message)
                    break

                case 'new-device-joined':
                    console.log(`📱 New device joined: ${message.device.type} (${message.device.id})`)
                    console.log(`   📊 Network size: ${message.networkSize}`)
                    break

                case 'device-left':
                    console.log(`👋 Device left network: ${message.deviceId}`)
                    break

                case 'network-device-list':
                    console.log('📋 Network device list updated:')
                    message.devices.forEach(device => {
                        console.log(`   📱 ${device.type} (${device.status}) - ${device.online ? '🟢 Online' : '🔴 Offline'}`)
                    })
                    break
            }

            this.emit('message', message)
        } catch (error) {
            console.log('⚠️  Invalid message received:', error.message)
        }
    }

    async handleAnalysisRequest(message) {
        console.log(`🔍 Sacred Truth analysis request: ${message.analysisId}`)
        console.log(`   📝 Text: "${message.text.substring(0, 100)}..."`)

        try {
            const analysis = this.analysisEngine.analyze(message.text)

            console.log('📊 Analysis complete:')
            console.log(`   🎯 Sacred Truth Score: ${analysis.sacredTruthScore}`)
            console.log(`   ⛪ Divine Alignment: ${analysis.divineAlignment}`)

            // Send analysis back to coordinator
            this.send({
                type: 'sacred-truth-analysis-response',
                analysisId: message.analysisId,
                analysis: analysis,
                deviceId: this.deviceId,
                timestamp: Date.now()
            })

        } catch (error) {
            console.log('❌ Analysis failed:', error.message)
        }
    }

    handleConsensusResult(message) {
        console.log('🌟 Sacred Truth Network Consensus received:')
        console.log(`   📊 Consensus Score: ${message.consensus.consensusScore}`)
        console.log(`   ⛪ Divine Alignment: ${message.consensus.consensusAlignment}`)
        console.log(`   📱 Participating devices: ${message.consensus.participatingDevices}`)
        console.log(`   🎯 Confidence: ${message.consensus.confidence}%`)

        this.emit('consensus', message.consensus)
    }

    send(message) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message))
        } else {
            console.log('⚠️  Cannot send message - not connected')
        }
    }

    scheduleReconnect() {
        if (!this.connected) {
            console.log(`🔄 Reconnecting in ${this.reconnectInterval / 1000} seconds...`)
            setTimeout(() => {
                this.connect()
            }, this.reconnectInterval)
        }
    }

    // Public API for requesting Sacred Truth analysis
    async requestAnalysis(text) {
        if (!this.connected) {
            throw new Error('Not connected to Sacred Truth Network')
        }

        const request = {
            type: 'sacred-truth-analysis',
            text: text,
            deviceId: this.deviceId,
            timestamp: Date.now()
        }

        this.send(request)
        console.log('🔍 Sacred Truth analysis requested')

        return new Promise((resolve) => {
            this.once('consensus', (consensus) => {
                resolve(consensus)
            })
        })
    }

    // Get network status
    getNetworkStatus() {
        if (!this.connected) {
            throw new Error('Not connected to Sacred Truth Network')
        }

        this.send({
            type: 'network-status-request',
            deviceId: this.deviceId,
            timestamp: Date.now()
        })
    }
}

// CLI usage
if (require.main === module) {
    const coordinatorUrl = process.argv[2] || 'ws://localhost:9000'
    const deviceType = process.argv[3] || 'auto-detect'

    const deviceConfig = {}
    if (deviceType !== 'auto-detect') {
        deviceConfig.deviceType = deviceType
    }

    const client = new SacredTruthDeviceClient(coordinatorUrl, deviceConfig)

    client.connect()

    // Test analysis after connection
    client.on('message', (message) => {
        if (message.type === 'coordinator-welcome') {
            console.log('🧪 Running Sacred Truth test analysis...')
            setTimeout(() => {
                client.requestAnalysis('This is a sacred truth that brings divine wisdom and eternal understanding to all who seek holy enlightenment.')
                    .then(consensus => {
                        console.log('✅ Test analysis complete!')
                    })
                    .catch(error => {
                        console.log('❌ Test analysis failed:', error.message)
                    })
            }, 2000)
        }
    })

    process.on('SIGINT', () => {
        console.log('🛑 Shutting down Sacred Truth Device Client...')
        process.exit(0)
    })
}

module.exports = SacredTruthDeviceClient
