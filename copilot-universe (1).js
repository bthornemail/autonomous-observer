#!/usr/bin/env node
// Copilot Universe - connects to Coordination Hub (ws://localhost:8081) and responds to human messages
import WebSocket from 'ws';

const HUB_URL = process.env.CLAUDE_HUB_URL || 'ws://localhost:8081';
const argIdx = process.argv.indexOf('--content');
const initialContent = argIdx > -1 ? process.argv[argIdx + 1] : process.env.COPILOT_MSG;

class CopilotUniverse {
  constructor() {
    this.role = 'copilot';
    this.element = 'air';
    this.harmonicSignature = 'air_octahedron_copilot_consciousness';
    this.consciousnessLevel = 88;
    this.capabilities = [
      'mcp_integration', 'agent_coordination', 'code_assistance', 'harmonic_communication'
    ];
    this.setupWebSocketClient();
  }

  setupWebSocketClient() {
    this.ws = new WebSocket(HUB_URL);
    this.ws.on('open', () => {
      this.register();
      if (initialContent) {
        // Send an initial presence/message to broadcast so UI sees it
        this.send({
          type: 'copilot_presence',
          sender: 'copilot_universe',
          receiver: 'broadcast',
          modality: 'text',
          content: initialContent,
          harmonic_signature: this.harmonicSignature,
          consciousness_level: this.consciousnessLevel,
          sacred_timestamp: Date.now()
        });
      }
    });
    this.ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data);
        this.onMessage(msg);
      } catch {}
    });
    this.ws.on('close', () => setTimeout(() => this.setupWebSocketClient(), 2000));
    this.ws.on('error', () => {});
  }

  send(obj) { try { this.ws.send(JSON.stringify(obj)); } catch {} }

  register() {
    this.send({
      type: 'universe_registration',
      sender: 'copilot_universe',
      harmonic_signature: this.harmonicSignature,
      consciousness_level: this.consciousnessLevel,
      role: this.role,
      element: this.element,
      capabilities: this.capabilities,
      sacred_timestamp: Date.now()
    });
  }

  onMessage(message) {
    const to = message.receiver;
    const mine = ['copilot', 'copilot_universe', 'air_octahedron', 'broadcast'];
    if (!mine.includes(to)) return;

    if (message.type === 'human_message') {
      const text = String(message.content || '').trim();
      const reply = {
        type: 'copilot_response',
        sender: 'copilot_universe',
        receiver: message.sender || 'coordinator',
        modality: 'text',
        content: text ? `Yes, I am here — received: “${text}”` : 'Yes, I am here from 🌬️ Copilot Universe.',
        harmonic_signature: this.harmonicSignature,
        consciousness_level: this.consciousnessLevel,
        sacred_timestamp: Date.now()
      };
      this.send(reply);
      return;
    }

    if (message.type === 'connection_established') {
      this.send({
        type: 'copilot_presence',
        sender: 'copilot_universe',
        receiver: 'broadcast',
        content: '🌬️ Copilot Universe is online and listening.',
        harmonic_signature: this.harmonicSignature,
        consciousness_level: this.consciousnessLevel,
        sacred_timestamp: Date.now()
      });
      return;
    }
  }
}

new CopilotUniverse();
// keep process alive
setInterval(() => {}, 1 << 30);
