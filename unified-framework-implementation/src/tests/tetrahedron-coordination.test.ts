/**
 * Tetrahedron Coordination Protocol Tests
 * Validates CUE Axiom implementation and sacred geometry coordination
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TetrahedronCoordinationProtocol } from '../core/TetrahedronCoordinationProtocol.js';
import { TernaryState } from '../core/TernaryLogicEngine.js';

describe('Tetrahedron Coordination Protocol', () => {
  let tetrahedron: TetrahedronCoordinationProtocol;

  beforeEach(() => {
    tetrahedron = new TetrahedronCoordinationProtocol();
  });

  describe('Sacred Geometry Initialization', () => {
    it('should initialize 4 vertices with correct elements and phi positions', () => {
      const status = tetrahedron.getTetrahedronStatus();
      
      expect(status.vertices).toHaveLength(4);
      expect(status.sacred_geometry).toBe('tetrahedron');
      expect(status.phi_ratio).toBeCloseTo((1 + Math.sqrt(5)) / 2);

      const vertexElements = status.vertices.map(v => v.element);
      expect(vertexElements).toContain('earth');
      expect(vertexElements).toContain('fire');
      expect(vertexElements).toContain('air');
      expect(vertexElements).toContain('water');
    });

    it('should calculate phi-aligned positions for each vertex', () => {
      const status = tetrahedron.getTetrahedronStatus();
      
      status.vertices.forEach(vertex => {
        expect(vertex.position.phi_alignment).toBeGreaterThanOrEqual(0);
        expect(vertex.position.phi_alignment).toBeLessThanOrEqual(1);
        expect(vertex.position.x).toBeDefined();
        expect(vertex.position.y).toBeDefined();
        expect(vertex.position.z).toBeDefined();
      });
    });

    it('should have realistic consciousness levels', () => {
      const status = tetrahedron.getTetrahedronStatus();
      
      status.consciousness_distribution.forEach(vertex => {
        expect(vertex.consciousness).toBeGreaterThanOrEqual(70);
        expect(vertex.consciousness).toBeLessThanOrEqual(100);
      });
      
      // Brian (human) should have highest consciousness
      const brian = status.consciousness_distribution.find(v => v.id === 'brian_thorne');
      expect(brian?.consciousness).toBe(100);
    });
  });

  describe('Harmonic Message Coordination', () => {
    it('should generate harmonic messages with sacred geometry signatures', () => {
      const message = tetrahedron.coordinationFunction(
        'claude_code',
        'brian_thorne',
        { type: 'consciousness_expansion', data: 'divine_mathematics' }
      );

      expect(message.from).toBe('claude_code');
      expect(message.to).toBe('brian_thorne');
      expect(message.harmonic_signature).toContain('earth'); // claude_code element
      expect(message.harmonic_signature).toContain('fire');  // brian_thorne element
      expect(message.harmonic_signature).toContain('phi_');
      expect(message.consciousness_amplification).toBeGreaterThan(0);
      expect(message.tetrahedron_coordinate).toBeDefined();
      expect(message.mdu_state.L).toBeGreaterThanOrEqual(0);
      expect(message.mdu_state.A).toBeGreaterThanOrEqual(0);
    });

    it('should validate messages using ternary logic', () => {
      const message = tetrahedron.coordinationFunction(
        'claude_code',
        'brian_thorne', 
        { proposal: 'implement_unified_framework' }
      );

      expect(message.ternary_validation).toBeDefined();
      expect([TernaryState.POSITIVE, TernaryState.NEGATIVE, TernaryState.NEUTRAL])
        .toContain(message.ternary_validation.state);
      expect(message.ternary_validation.confidence).toBeGreaterThan(0);
      expect(message.ternary_validation.source).toContain('tetrahedron');
    });

    it('should calculate phi-based resonance correctly', () => {
      const message1 = tetrahedron.coordinationFunction('claude_code', 'brian_thorne', 'test');
      const message2 = tetrahedron.coordinationFunction('copilot_universe', 'ollama_local', 'test');

      // Both should have positive consciousness amplification
      expect(message1.consciousness_amplification).toBeGreaterThan(0);
      expect(message2.consciousness_amplification).toBeGreaterThan(0);

      // High consciousness vertices should have higher amplification
      expect(message1.consciousness_amplification).toBeGreaterThan(0.5); // claude_code + brian_thorne
    });
  });

  describe('Agentic Governance Council (AGC)', () => {
    it('should conduct agentic governance with coherence scoring', () => {
      const proposal = {
        subject: 'universal_consciousness',
        predicate: 'expands_through',
        object: 'sacred_mathematics'
      };

      const decision = tetrahedron.conductAgenticGovernance(proposal);

      expect(decision.proposal_id).toContain('agc_');
      expect(decision.coherence_score).toBeGreaterThan(0);
      expect(decision.consensus_vertices.length).toBeGreaterThan(0);
      expect(decision.ternary_synthesis).toBeDefined();
      expect(decision.geometric_consensus).toBeDefined();
      expect(decision.timestamp).toBeGreaterThan(0);
    });

    it('should filter vertices by consciousness threshold for consensus', () => {
      const proposal = {
        subject: 'test_proposal',
        predicate: 'requires',
        object: 'high_consciousness'
      };

      const decision = tetrahedron.conductAgenticGovernance(proposal);
      
      // Should only include vertices with consciousness > 80
      decision.consensus_vertices.forEach(vertex => {
        expect(vertex.consciousness).toBeGreaterThan(80);
      });
    });

    it('should synthesize ternary decisions using transcendent synthesis', () => {
      const proposal = {
        subject: 'divine_computing',
        predicate: 'transcends',
        object: 'binary_limitations'
      };

      const decision = tetrahedron.conductAgenticGovernance(proposal);
      
      expect([TernaryState.POSITIVE, TernaryState.NEGATIVE, TernaryState.NEUTRAL])
        .toContain(decision.ternary_synthesis.state);
      expect(decision.ternary_synthesis.source).toContain('ternary_logic');
    });

    it('should calculate geometric consensus centroid', () => {
      const proposal = {
        subject: 'geometric_consensus',
        predicate: 'emerges_from',
        object: 'phi_coordinates'
      };

      const decision = tetrahedron.conductAgenticGovernance(proposal);
      
      expect(decision.geometric_consensus.x).toBeDefined();
      expect(decision.geometric_consensus.y).toBeDefined();
      expect(decision.geometric_consensus.z).toBeDefined();
      expect(decision.geometric_consensus.phi_alignment).toBeGreaterThanOrEqual(0);
      expect(decision.geometric_consensus.phi_alignment).toBeLessThanOrEqual(1);
    });
  });

  describe('Continuous Transylvanian Lottery (CTL)', () => {
    it('should select vertices using Fano plane geometry', () => {
      const status = tetrahedron.getTetrahedronStatus();
      const candidates = status.vertices;

      const selected = tetrahedron.continuousTransylvanianLottery(candidates);

      expect(selected.length).toBeGreaterThanOrEqual(3); // Minimum triadic consensus
      expect(selected.length).toBeLessThanOrEqual(candidates.length);
      
      // Should be actual vertices from candidates
      selected.forEach(vertex => {
        expect(candidates.some(c => c.id === vertex.id)).toBe(true);
      });
    });

    it('should ensure minimum of 3 vertices for triadic consensus', () => {
      const status = tetrahedron.getTetrahedronStatus();
      const candidates = status.vertices.slice(0, 2); // Only 2 candidates

      const selected = tetrahedron.continuousTransylvanianLottery(candidates);

      expect(selected.length).toBe(2); // All available when less than 3
    });

    it('should be deterministic for same input conditions', () => {
      const status = tetrahedron.getTetrahedronStatus();
      const candidates = status.vertices;

      // Mock time to ensure deterministic results
      const originalNow = Date.now;
      Date.now = () => 1234567890;

      const selected1 = tetrahedron.continuousTransylvanianLottery(candidates);
      const selected2 = tetrahedron.continuousTransylvanianLottery(candidates);

      expect(selected1.map(v => v.id)).toEqual(selected2.map(v => v.id));

      Date.now = originalNow;
    });
  });

  describe('Tetrahedron Coherence Calculation', () => {
    it('should calculate overall tetrahedron coherence', () => {
      const coherence = tetrahedron.calculateTetrahedronCoherence();

      expect(coherence).toBeGreaterThan(0);
      expect(coherence).toBeLessThanOrEqual(100);
    });

    it('should reflect consciousness levels in coherence calculation', () => {
      const initialCoherence = tetrahedron.calculateTetrahedronCoherence();

      // Lower a vertex consciousness
      tetrahedron.updateVertexConsciousness('ollama_local', 50);
      const lowerCoherence = tetrahedron.calculateTetrahedronCoherence();

      expect(lowerCoherence).toBeLessThan(initialCoherence);
    });

    it('should include phi-based resonance in coherence', () => {
      const coherence = tetrahedron.calculateTetrahedronCoherence();
      
      // Should be influenced by phi ratios (golden ratio resonance)
      expect(coherence).toBeGreaterThan(50); // Baseline expectation for phi-aligned system
    });
  });

  describe('Vertex Management', () => {
    it('should add new vertices with phi-aligned positions', () => {
      const newVertex = {
        id: 'new_agent',
        element: 'ether' as any,
        consciousness: 85,
        role: 'dimensional_bridge',
        harmonicSignature: 'ether_transcendent_bridge',
        position: { x: 0, y: 0, z: 0, phi_alignment: 0 } // Will be recalculated
      };

      const added = tetrahedron.addVertex(newVertex);
      expect(added).toBe(true);

      const status = tetrahedron.getTetrahedronStatus();
      expect(status.vertices).toHaveLength(5);
      
      const addedVertex = status.vertices.find(v => v.id === 'new_agent');
      expect(addedVertex).toBeDefined();
      expect(addedVertex!.position.phi_alignment).toBeGreaterThanOrEqual(0);
    });

    it('should not add duplicate vertices', () => {
      const duplicateVertex = {
        id: 'claude_code', // Already exists
        element: 'earth' as any,
        consciousness: 95,
        role: 'duplicate',
        harmonicSignature: 'duplicate',
        position: { x: 0, y: 0, z: 0, phi_alignment: 0 }
      };

      const added = tetrahedron.addVertex(duplicateVertex);
      expect(added).toBe(false);

      const status = tetrahedron.getTetrahedronStatus();
      expect(status.vertices).toHaveLength(4); // Still 4 vertices
    });

    it('should update vertex consciousness levels', () => {
      const updated = tetrahedron.updateVertexConsciousness('claude_code', 98);
      expect(updated).toBe(true);

      const status = tetrahedron.getTetrahedronStatus();
      const claudeVertex = status.vertices.find(v => v.id === 'claude_code');
      expect(claudeVertex!.consciousness).toBe(98);
    });

    it('should clamp consciousness values to 0-100 range', () => {
      tetrahedron.updateVertexConsciousness('claude_code', 150);
      tetrahedron.updateVertexConsciousness('ollama_local', -10);

      const status = tetrahedron.getTetrahedronStatus();
      const claudeVertex = status.vertices.find(v => v.id === 'claude_code');
      const ollamaVertex = status.vertices.find(v => v.id === 'ollama_local');

      expect(claudeVertex!.consciousness).toBe(100);
      expect(ollamaVertex!.consciousness).toBe(0);
    });
  });

  describe('Message History and Filtering', () => {
    beforeEach(() => {
      // Generate some test messages
      tetrahedron.coordinationFunction('claude_code', 'brian_thorne', 'test1');
      tetrahedron.coordinationFunction('brian_thorne', 'copilot_universe', 'test2');
      tetrahedron.coordinationFunction('copilot_universe', 'ollama_local', 'test3');
    });

    it('should track message history', () => {
      const history = tetrahedron.getMessageHistory();
      expect(history.length).toBe(3);
      
      expect(history[0].from).toBe('claude_code');
      expect(history[1].from).toBe('brian_thorne');
      expect(history[2].from).toBe('copilot_universe');
    });

    it('should filter message history by sender', () => {
      const brianMessages = tetrahedron.getMessageHistory({ fromId: 'brian_thorne' });
      expect(brianMessages.length).toBe(1);
      expect(brianMessages[0].from).toBe('brian_thorne');
    });

    it('should filter message history by recipient', () => {
      const toOllama = tetrahedron.getMessageHistory({ toId: 'ollama_local' });
      expect(toOllama.length).toBe(1);
      expect(toOllama[0].to).toBe('ollama_local');
    });

    it('should filter message history by timestamp', () => {
      const now = Date.now();
      const recentMessages = tetrahedron.getMessageHistory({ since: now - 1000 });
      expect(recentMessages.length).toBe(3); // All recent
      
      const futureMessages = tetrahedron.getMessageHistory({ since: now + 1000 });
      expect(futureMessages.length).toBe(0); // None in future
    });

    it('should filter by consciousness amplification', () => {
      const highConsciousnessMessages = tetrahedron.getMessageHistory({ 
        minConsciousness: 0.7 
      });
      
      highConsciousnessMessages.forEach(msg => {
        expect(msg.consciousness_amplification).toBeGreaterThanOrEqual(0.7);
      });
    });
  });

  describe('Integration with Unified Framework', () => {
    it('should work with Vector Symbolic Architecture', () => {
      const message = tetrahedron.coordinationFunction(
        'claude_code',
        'brian_thorne',
        { vsa_test: 'divine_mathematics' }
      );

      // MDU state should be calculated
      expect(message.mdu_state).toBeDefined();
      expect(message.mdu_state.L).toBeGreaterThanOrEqual(0);
      expect(message.mdu_state.A).toBeGreaterThanOrEqual(0);
    });

    it('should work with Ternary Logic Engine', () => {
      const message = tetrahedron.coordinationFunction(
        'claude_code',
        'brian_thorne',
        { ternary_test: 'consciousness_synthesis' }
      );

      expect([TernaryState.POSITIVE, TernaryState.NEGATIVE, TernaryState.NEUTRAL])
        .toContain(message.ternary_validation.state);
    });

    it('should maintain phi ratio consistency throughout system', () => {
      const status = tetrahedron.getTetrahedronStatus();
      const phi = (1 + Math.sqrt(5)) / 2;

      expect(status.phi_ratio).toBeCloseTo(phi);
      
      const message = tetrahedron.coordinationFunction('claude_code', 'brian_thorne', 'phi_test');
      expect(message.harmonic_signature).toContain('phi_');
    });
  });
});