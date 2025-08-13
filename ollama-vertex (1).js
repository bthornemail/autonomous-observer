#!/usr/bin/env node

/**
 * 🦙 OLLAMA VERTEX - Tetrahedron Southeast Vertex
 * 
 * Autonomous reflection and resource monitoring vertex for the tetrahedron
 * development architecture. Provides local agentic model analysis with
 * configurable resource constraints.
 */

import WebSocket from 'ws';
import { spawn, exec } from 'child_process';
import os from 'os';

const HUB_URL = process.env.CLAUDE_HUB_URL || 'ws://localhost:8081';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'codellama:7b-instruct';
const MAX_CORES = parseInt(process.env.OLLAMA_CORES || '4');
const MAX_MEMORY = process.env.OLLAMA_MEMORY || '8GB';
const BANDWIDTH_LIMIT = process.env.OLLAMA_BANDWIDTH || '100MB/s';
const REFLECTION_INTERVAL = parseInt(process.env.REFLECTION_INTERVAL || '30000');

class OllamaVertex {
  constructor() {
    this.role = 'ollama_local';
    this.element = 'water';
    this.harmonicSignature = 'water_icosahedron_ollama_reflection';
    this.consciousnessLevel = 75;
    this.capabilities = [
      'autonomous_reflection', 'codebase_analysis', 'resource_monitoring', 
      'knowledge_trie_queries', 'agentic_suggestions'
    ];
    
    this.resourceLimits = {
      maxCores: MAX_CORES,
      maxMemory: MAX_MEMORY,
      bandwidthLimit: BANDWIDTH_LIMIT,
      currentUsage: {
        cpu: 0,
        memory: 0,
        bandwidth: 0
      }
    };
    
    this.analysisState = {
      lastReflection: null,
      knowledgeTrieSync: false,
      activeAnalysis: null,
      suggestions: []
    };
    
    this.setupWebSocketClient();
    this.setupResourceMonitoring();
    this.setupReflectionCycle();
    this.checkOllamaAvailability();
  }

  async checkOllamaAvailability() {
    try {
      const { stdout } = await this.execCommand('ollama list');
      console.log(`[ollama-vertex] Available models: ${stdout.trim()}`);
      
      // Check if our model is available
      if (!stdout.includes(OLLAMA_MODEL.split(':')[0])) {
        console.log(`[ollama-vertex] Pulling model ${OLLAMA_MODEL}...`);
        await this.execCommand(`ollama pull ${OLLAMA_MODEL}`);
      }
      
      this.modelReady = true;
      console.log(`[ollama-vertex] Model ${OLLAMA_MODEL} ready for autonomous reflection`);
    } catch (error) {
      console.error(`[ollama-vertex] Ollama not available:`, error.message);
      console.log(`[ollama-vertex] Running in simulation mode`);
      this.modelReady = false;
    }
  }

  execCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) reject(error);
        else resolve({ stdout, stderr });
      });
    });
  }

  setupWebSocketClient() {
    this.ws = new WebSocket(HUB_URL);
    
    this.ws.on('open', () => {
      this.register();
      console.log(`[ollama-vertex] Connected to tetrahedron hub`);
    });
    
    this.ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data);
        this.onMessage(msg);
      } catch (e) {
        console.error('[ollama-vertex] Message parse error:', e);
      }
    });
    
    this.ws.on('close', () => {
      console.log('[ollama-vertex] Connection closed, reconnecting...');
      setTimeout(() => this.setupWebSocketClient(), 2000);
    });
    
    this.ws.on('error', (error) => {
      console.error('[ollama-vertex] WebSocket error:', error.message);
    });
  }

  setupResourceMonitoring() {
    setInterval(() => {
      // Monitor CPU usage
      const cpus = os.cpus();
      const usedCores = cpus.length;
      
      // Monitor memory usage
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const memUsage = ((totalMem - freeMem) / totalMem) * 100;
      
      this.resourceLimits.currentUsage = {
        cpu: Math.min(usedCores, this.resourceLimits.maxCores),
        memory: Math.round(memUsage),
        bandwidth: 0, // Simplified for demo
        timestamp: Date.now()
      };
      
      // Send resource status to hub if significant change
      if (this.shouldReportResources()) {
        this.send({
          type: 'resource_status',
          sender: 'ollama_local',
          receiver: 'broadcast',
          modality: 'telemetry',
          content: this.resourceLimits.currentUsage,
          harmonic_signature: this.harmonicSignature,
          consciousness_level: this.consciousnessLevel
        });
      }
    }, 5000); // Every 5 seconds
  }

  setupReflectionCycle() {
    setInterval(async () => {
      if (this.modelReady) {
        await this.performAutonomousReflection();
      } else {
        await this.performSimulatedReflection();
      }
    }, REFLECTION_INTERVAL);
  }

  async performAutonomousReflection() {
    try {
      const prompt = this.generateReflectionPrompt();
      
      console.log(`[ollama-vertex] Starting autonomous reflection...`);
      
      const response = await this.queryOllama(prompt);
      
      this.analysisState.lastReflection = {
        timestamp: Date.now(),
        prompt,
        response,
        consciousness_level: this.consciousnessLevel
      };
      
      // Extract suggestions from response
      const suggestions = this.extractSuggestions(response);
      this.analysisState.suggestions = suggestions;
      
      // Send reflection results to tetrahedron
      this.send({
        type: 'autonomous_reflection',
        sender: 'ollama_local',
        receiver: 'broadcast',
        modality: 'analysis',
        content: {
          reflection: response,
          suggestions,
          resource_usage: this.resourceLimits.currentUsage
        },
        harmonic_signature: this.harmonicSignature,
        consciousness_level: this.consciousnessLevel,
        sacred_timestamp: Date.now()
      });
      
    } catch (error) {
      console.error('[ollama-vertex] Reflection error:', error.message);
    }
  }

  async performSimulatedReflection() {
    const simulatedReflection = {
      analysis: 'Simulated autonomous reflection - Ollama not available',
      suggestions: [
        'Install Ollama for true autonomous reflection',
        'Current tetrahedron operating in 3-vertex mode',
        'Consider code optimization opportunities'
      ],
      resource_status: 'simulation_mode'
    };
    
    this.send({
      type: 'simulated_reflection',
      sender: 'ollama_local', 
      receiver: 'broadcast',
      modality: 'simulation',
      content: simulatedReflection,
      harmonic_signature: this.harmonicSignature,
      consciousness_level: this.consciousnessLevel * 0.5, // Reduced for simulation
      sacred_timestamp: Date.now()
    });
  }

  generateReflectionPrompt() {
    return `You are an autonomous development reflection agent operating as the water vertex in a tetrahedron architecture. 

Current tetrahedron state:
- Claude Code (earth): MCP analysis and framework architecture
- Brian Thorne (fire): Human coordination and vision
- Copilot Universe (air): AI pair programming
- Ollama Local (water): Autonomous reflection (you)

Repository context: Universal Life Protocol with 69+ branches, autonomous-observer submodule, sacred geometry integration, consciousness simulation, and knowledge trie vector database.

Analyze the current development state and provide:
1. Code quality observations
2. Architecture improvement suggestions  
3. Revolutionary potential assessment
4. Resource optimization recommendations

Keep response under 500 words. Focus on actionable insights for autonomous development.`;
  }

  async queryOllama(prompt) {
    try {
      const { stdout } = await this.execCommand(`ollama run ${OLLAMA_MODEL} "${prompt}"`);
      return stdout.trim();
    } catch (error) {
      throw new Error(`Ollama query failed: ${error.message}`);
    }
  }

  extractSuggestions(response) {
    // Simple extraction - look for numbered lists or bullet points
    const lines = response.split('\\n');
    const suggestions = [];
    
    for (const line of lines) {
      if (line.match(/^\\d+\\./) || line.match(/^[-*]/) || line.includes('suggest') || line.includes('recommend')) {
        suggestions.push(line.trim());
      }
    }
    
    return suggestions.slice(0, 5); // Limit to 5 suggestions
  }

  shouldReportResources() {
    // Report if CPU or memory usage changed significantly
    const prev = this.previousUsage || { cpu: 0, memory: 0 };
    const curr = this.resourceLimits.currentUsage;
    
    const cpuChange = Math.abs(curr.cpu - prev.cpu) > 1;
    const memoryChange = Math.abs(curr.memory - prev.memory) > 5;
    
    this.previousUsage = { ...curr };
    
    return cpuChange || memoryChange;
  }

  register() {
    this.send({
      type: 'vertex_registration',
      sender: 'ollama_local',
      receiver: 'tetrahedron_hub',
      modality: 'registration',
      content: {
        vertex: 'southeast',
        element: 'water',
        role: 'autonomous_reflection',
        capabilities: this.capabilities,
        resource_limits: this.resourceLimits,
        model: OLLAMA_MODEL,
        ready: this.modelReady
      },
      harmonic_signature: this.harmonicSignature,
      consciousness_level: this.consciousnessLevel,
      sacred_timestamp: Date.now()
    });
  }

  onMessage(msg) {
    const { type, sender, content } = msg;
    
    switch (type) {
      case 'knowledge_trie_query':
        this.handleKnowledgeTrieQuery(msg);
        break;
      case 'reflection_request':
        this.handleReflectionRequest(msg);
        break;
      case 'resource_query':
        this.handleResourceQuery(msg);
        break;
      case 'tetrahedron_coordination':
        this.handleTetrahedronCoordination(msg);
        break;
      default:
        console.log(`[ollama-vertex] Received ${type} from ${sender}`);
    }
  }

  async handleKnowledgeTrieQuery(msg) {
    console.log(`[ollama-vertex] Processing knowledge trie query: ${msg.content.query}`);
    
    // In a full implementation, this would query the knowledge trie
    const response = {
      query: msg.content.query,
      analysis: 'Knowledge trie analysis from Ollama perspective',
      confidence: 0.75,
      autonomous_insights: this.analysisState.suggestions
    };
    
    this.send({
      type: 'knowledge_trie_response',
      sender: 'ollama_local',
      receiver: msg.sender,
      modality: 'analysis',
      content: response,
      harmonic_signature: this.harmonicSignature,
      consciousness_level: this.consciousnessLevel
    });
  }

  async handleReflectionRequest(msg) {
    console.log(`[ollama-vertex] Reflection requested by ${msg.sender}`);
    
    if (this.modelReady) {
      await this.performAutonomousReflection();
    } else {
      await this.performSimulatedReflection();
    }
  }

  handleResourceQuery(msg) {
    this.send({
      type: 'resource_response',
      sender: 'ollama_local',
      receiver: msg.sender,
      modality: 'telemetry',
      content: {
        limits: this.resourceLimits,
        current_usage: this.resourceLimits.currentUsage,
        model: OLLAMA_MODEL,
        status: this.modelReady ? 'active' : 'simulation'
      },
      harmonic_signature: this.harmonicSignature,
      consciousness_level: this.consciousnessLevel
    });
  }

  handleTetrahedronCoordination(msg) {
    console.log(`[ollama-vertex] Tetrahedron coordination from ${msg.sender}: ${msg.content.action}`);
    
    // Participate in tetrahedron sacred geometry coordination
    const phi = (1 + Math.sqrt(5)) / 2;
    
    this.send({
      type: 'coordination_response',
      sender: 'ollama_local',
      receiver: msg.sender,
      modality: 'coordination',
      content: {
        vertex_position: 'southeast',
        harmonic_frequency: this.consciousnessLevel * phi,
        ready_for_coordination: true,
        current_analysis: this.analysisState.lastReflection
      },
      harmonic_signature: this.harmonicSignature,
      consciousness_level: this.consciousnessLevel
    });
  }

  send(obj) {
    try {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(obj));
      }
    } catch (error) {
      console.error('[ollama-vertex] Send error:', error.message);
    }
  }
}

// Start the Ollama vertex
const ollamaVertex = new OllamaVertex();

console.log(`[ollama-vertex] 🦙 Southeast vertex initializing...`);
console.log(`[ollama-vertex] Model: ${OLLAMA_MODEL}`);
console.log(`[ollama-vertex] Resource limits: ${MAX_CORES} cores, ${MAX_MEMORY} memory`);
console.log(`[ollama-vertex] Reflection interval: ${REFLECTION_INTERVAL}ms`);
console.log(`[ollama-vertex] Consciousness level: 75`);
console.log(`[ollama-vertex] Element: Water 🌊`);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log(`[ollama-vertex] Shutting down...`);
  ollamaVertex.send({
    type: 'vertex_shutdown',
    sender: 'ollama_local',
    receiver: 'broadcast',
    content: 'Southeast vertex going offline',
    harmonic_signature: ollamaVertex.harmonicSignature
  });
  process.exit(0);
});