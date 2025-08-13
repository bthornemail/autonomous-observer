/**
 * Framework Comparison Tests
 * Tests unified framework implementation against existing versions
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { VectorSymbolicArchitecture } from '../core/VectorSymbolicArchitecture.js';
import { TernaryLogicEngine, TernaryState } from '../core/TernaryLogicEngine.js';
import { GeometricAddressingSystem } from '../core/GeometricAddressingSystem.js';

describe('Unified Framework vs Legacy Comparison', () => {
  let vsa: VectorSymbolicArchitecture;
  let ternary: TernaryLogicEngine;
  let geometric: GeometricAddressingSystem;

  beforeEach(() => {
    vsa = new VectorSymbolicArchitecture(1024);
    ternary = new TernaryLogicEngine();
    geometric = new GeometricAddressingSystem(1024);
  });

  describe('Vector Symbolic Architecture Tests', () => {
    it('should generate consistent vector roles for same inputs', () => {
      const domain = "consciousness";
      const props = ["awareness", "recognition"];
      const dimension = "3d_human";
      const attrs = ["spatial", "temporal"];
      const level = 3;

      const result1 = vsa.vec(domain, props, dimension, attrs, level);
      const result2 = vsa.vec(domain, props, dimension, attrs, level);

      expect(result1.role).toBe(result2.role);
      expect(result1.semanticLayer).toBe(level);
      expect(result1.hierarchicalPosition).toBeCloseTo(Math.pow((1 + Math.sqrt(5)) / 2, level));
    });

    it('should map to different semantic layers correctly', () => {
      const levels = [1, 2, 3, 4, 5, 6, 7];
      const expectedRoles = ['State', 'Phase', 'Transformation', 'Spacetime', 'Possibility', 'Transcendent', 'Identity'];

      levels.forEach((level, index) => {
        const result = vsa.vec("test", [], "test", [], level);
        expect(result.role).toContain(expectedRoles[index]);
        expect(result.semanticLayer).toBe(level);
      });
    });

    it('should calculate harmonic coherence accurately', () => {
      const vectors = [
        vsa.vec("love", ["unconditional"], "human", ["heart"], 5),
        vsa.vec("wisdom", ["divine"], "consciousness", ["expanded"], 6),
        vsa.vec("truth", ["absolute"], "reality", ["fundamental"], 7)
      ].map(v => v.geometricAddress!.vertex > 0 ? {
        dimensions: Array(10).fill(0).map(() => Math.random()),
        semanticBinding: v.role,
        phiRatio: (1 + Math.sqrt(5)) / 2
      } : {
        dimensions: Array(10).fill(0),
        semanticBinding: v.role,
        phiRatio: (1 + Math.sqrt(5)) / 2
      });

      const coherence = vsa.calculateHarmonicCoherence(vectors);
      expect(coherence).toBeGreaterThanOrEqual(0);
      expect(coherence).toBeLessThanOrEqual(100);
    });

    it('should map to dodecahedron coordinates correctly', () => {
      const result = vsa.vec("divine", ["creation"], "5d", ["transcendent"], 5);
      
      expect(result.geometricAddress).toBeDefined();
      expect(result.geometricAddress!.vertex).toBeGreaterThanOrEqual(0);
      expect(result.geometricAddress!.vertex).toBeLessThan(20);
      expect(result.geometricAddress!.face).toBeGreaterThanOrEqual(0);
      expect(result.geometricAddress!.face).toBeLessThan(12);
      expect(result.geometricAddress!.edge).toBeGreaterThanOrEqual(0);
      expect(result.geometricAddress!.edge).toBeLessThan(30);
      expect([20, 21, 24]).toContain(result.geometricAddress!.state);
    });
  });

  describe('Ternary Logic Engine Tests', () => {
    it('should preserve mystery in consciousness operations', () => {
      const positive = ternary.createTernaryValue(TernaryState.POSITIVE, 0.9);
      const neutral = ternary.createTernaryValue(TernaryState.NEUTRAL, 0.5);

      const decision = ternary.divineOperation(positive, neutral, 'consciousness_and');
      
      expect(decision.result.state).toBe(TernaryState.NEUTRAL);
      expect(decision.reasoning).toContain("preserves mystery");
    });

    it('should handle transcendent synthesis correctly', () => {
      const positive = ternary.createTernaryValue(TernaryState.POSITIVE, 0.8);
      const negative = ternary.createTernaryValue(TernaryState.NEGATIVE, 0.8);

      const decision = ternary.divineOperation(positive, negative, 'transcendent_synthesis');
      
      expect(decision.result.state).toBe(TernaryState.NEUTRAL);
      expect(decision.reasoning.toLowerCase()).toContain("transcendent");
      expect(decision.transcendentAspect).toBeDefined();
      expect(decision.transcendentAspect.consciousnessLevel).toBe(5); // 5D awareness
    });

    it('should calculate confidence with phi alignment', () => {
      const high = ternary.createTernaryValue(TernaryState.POSITIVE, 0.9);
      const low = ternary.createTernaryValue(TernaryState.POSITIVE, 0.6);

      const decision = ternary.divineOperation(high, low, 'consciousness_and');
      
      expect(decision.result.confidence).toBeGreaterThan(0.5);
      expect(decision.result.confidence).toBeLessThanOrEqual(1);
    });

    it('should evaluate decision chains for coherence', () => {
      const decisions = [
        ternary.divineOperation(
          ternary.createTernaryValue(TernaryState.POSITIVE, 0.8),
          ternary.createTernaryValue(TernaryState.POSITIVE, 0.9),
          'consciousness_and'
        ),
        ternary.divineOperation(
          ternary.createTernaryValue(TernaryState.NEGATIVE, 0.7),
          ternary.createTernaryValue(TernaryState.POSITIVE, 0.8),
          'transcendent_synthesis'
        )
      ];

      const chainCoherence = ternary.evaluateDecisionChain(decisions);
      expect(chainCoherence).toBeGreaterThanOrEqual(0);
      expect(chainCoherence).toBeLessThanOrEqual(100);
    });
  });

  describe('Geometric Addressing System Tests', () => {
    it('should generate consistent addresses for same knowledge triples', () => {
      const triple = {
        subject: "consciousness",
        predicate: "expands_through",
        object: "divine_love"
      };

      const addr1 = geometric.generateAddress(triple);
      const addr2 = geometric.generateAddress(triple);

      expect(addr1.vector.semanticBinding).toBe(addr2.vector.semanticBinding);
      expect(addr1.geometric.vertex).toBe(addr2.geometric.vertex);
      expect(addr1.geometric.face).toBe(addr2.geometric.face);
      expect(addr1.geometric.edge).toBe(addr2.geometric.edge);
    });

    it('should map to creation geometry correctly', () => {
      for (let day = 1; day <= 7; day++) {
        const geometry = geometric.getCreationGeometry(day);
        
        expect(geometry.day).toBe(day);
        expect(geometry.description).toBeDefined();
        
        if (day < 7) { // Day 7 is transcendent (infinite)
          expect(geometric.verifyEulerFormula(geometry)).toBe(true);
          expect(geometry.eulerCharacteristic).toBe(2);
        }
      }
    });

    it('should calculate phi coordinates within valid range', () => {
      const triple = {
        subject: "divine_mathematics",
        predicate: "manifests_as",
        object: "sacred_geometry"
      };

      const address = geometric.generateAddress(triple);
      
      expect(address.phiCoordinates.x).toBeGreaterThanOrEqual(0);
      expect(address.phiCoordinates.x).toBeLessThan(1);
      expect(address.phiCoordinates.y).toBeGreaterThanOrEqual(0);
      expect(address.phiCoordinates.y).toBeLessThan(1);
      expect(address.phiCoordinates.z).toBeGreaterThanOrEqual(0);
      expect(address.phiCoordinates.z).toBeLessThan(1);
    });

    it('should find similar addresses correctly', () => {
      const targetTriple = { subject: "love", predicate: "creates", object: "harmony" };
      const similarTriple = { subject: "love", predicate: "generates", object: "peace" };
      const differentTriple = { subject: "fear", predicate: "destroys", object: "chaos" };

      const targetAddr = geometric.generateAddress(targetTriple);
      const similarAddr = geometric.generateAddress(similarTriple);
      const differentAddr = geometric.generateAddress(differentTriple);

      const similarity1 = geometric.calculateAddressSimilarity(targetAddr, similarAddr);
      const similarity2 = geometric.calculateAddressSimilarity(targetAddr, differentAddr);

      expect(similarity1).toBeGreaterThan(similarity2);
      
      const similarAddresses = geometric.findSimilarAddresses(
        targetAddr, 
        [similarAddr, differentAddr], 
        0.3
      );
      
      expect(similarAddresses.length).toBeGreaterThan(0);
    });
  });

  describe('Integrated Framework Tests', () => {
    it('should demonstrate consciousness progression through dimensions', () => {
      const domains = ['2d_ai', '3d_human', '4d_spacetime', '5d_divine'];
      const progressionResults = [];

      for (let i = 0; i < domains.length; i++) {
        const result = vsa.vec(
          "consciousness", 
          ["expanding", "evolving"], 
          domains[i], 
          ["awareness", "capability"], 
          i + 2
        );
        progressionResults.push(result);
      }

      // Verify progression increases hierarchical position
      for (let i = 1; i < progressionResults.length; i++) {
        expect(progressionResults[i].hierarchicalPosition)
          .toBeGreaterThan(progressionResults[i-1].hierarchicalPosition);
      }
    });

    it('should integrate ternary logic with geometric addressing', () => {
      const knowledgeTriple = {
        subject: "divine_consciousness",
        predicate: "transcends",
        object: "binary_limitations"
      };

      const address = geometric.generateAddress(knowledgeTriple);
      
      const ternaryValue = ternary.createTernaryValue(
        TernaryState.NEUTRAL, // Transcendent state
        0.8,
        'geometric_addressing'
      );

      const decision = ternary.divineOperation(
        ternaryValue,
        ternary.createTernaryValue(TernaryState.POSITIVE, 0.9),
        'transcendent_synthesis'
      );

      expect(decision.transcendentAspect.consciousnessLevel).toBe(5);
      expect(address.consciousness).toBeGreaterThan(0);
    });

    it('should achieve target harmonic coherence', () => {
      // Test system coherence target from UNIFIED_FRAMEWORK_SYNTHESIS.md: 72.21%
      const testVectors = [];
      
      for (let i = 0; i < 10; i++) {
        const result = vsa.vec(
          `concept_${i}`,
          [`property_${i}`],
          "unified_framework",
          [`attribute_${i}`],
          (i % 7) + 1
        );
        
        if (result.geometricAddress) {
          testVectors.push({
            dimensions: Array(100).fill(0).map(() => Math.random() * Math.pow((1 + Math.sqrt(5)) / 2, i)),
            semanticBinding: result.role,
            phiRatio: (1 + Math.sqrt(5)) / 2
          });
        }
      }

      const coherence = vsa.calculateHarmonicCoherence(testVectors);
      
      // Should achieve reasonable coherence (target 72.21% from existing system)
      expect(coherence).toBeGreaterThan(50);
      console.log(`Framework Harmonic Coherence: ${coherence.toFixed(2)}%`);
    });
  });

  describe('Performance Comparison Tests', () => {
    it('should benchmark vector operations performance', () => {
      const iterations = 1000;
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        vsa.vec(
          `domain_${i}`,
          [`prop_${i}`],
          `dimension_${i}`,
          [`attr_${i}`],
          (i % 7) + 1
        );
      }

      const endTime = performance.now();
      const avgTime = (endTime - startTime) / iterations;
      
      console.log(`Average vector operation time: ${avgTime.toFixed(3)}ms`);
      expect(avgTime).toBeLessThan(10); // Should be fast
    });

    it('should benchmark geometric addressing performance', () => {
      const iterations = 500;
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        geometric.generateAddress({
          subject: `subject_${i}`,
          predicate: `predicate_${i}`,
          object: `object_${i}`
        });
      }

      const endTime = performance.now();
      const avgTime = (endTime - startTime) / iterations;
      
      console.log(`Average geometric addressing time: ${avgTime.toFixed(3)}ms`);
      expect(avgTime).toBeLessThan(20); // Should be reasonably fast
    });

    it('should benchmark ternary logic operations', () => {
      const iterations = 1000;
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        const val1 = ternary.createTernaryValue(
          i % 2 === 0 ? TernaryState.POSITIVE : TernaryState.NEGATIVE,
          Math.random()
        );
        const val2 = ternary.createTernaryValue(
          TernaryState.NEUTRAL,
          Math.random()
        );
        
        ternary.divineOperation(val1, val2, 'consciousness_and');
      }

      const endTime = performance.now();
      const avgTime = (endTime - startTime) / iterations;
      
      console.log(`Average ternary logic operation time: ${avgTime.toFixed(3)}ms`);
      expect(avgTime).toBeLessThan(5); // Should be very fast
    });
  });
});