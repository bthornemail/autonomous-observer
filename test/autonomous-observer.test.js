const { AutonomousObserver } = require('../src/observer/AutonomousObserver');
const { LivingKnowledgeEcosystem } = require('../src/knowledge/LivingKnowledgeEcosystem');
const { AttentionTokenSystem } = require('../src/economy/AttentionTokenSystem');
const { CLARIONAgent } = require('../src/clarion/CLARIONAgent');
const { MDUProcessor } = require('../src/mdu/MDUProcessor');
const { CUEFramework } = require('../src/cue/CUEFramework');

describe('Autonomous Observer System', () => {
  let observer;
  let knowledgeSystem;
  let tokenSystem;
  let clarionAgent;
  let mduProcessor;
  let cueFramework;

  beforeEach(() => {
    observer = new AutonomousObserver({
      consciousness: true,
      metaCognition: true,
      epistemicCompression: true,
      fanoPlaneLogic: true
    });
    
    knowledgeSystem = new LivingKnowledgeEcosystem();
    tokenSystem = new AttentionTokenSystem();
    clarionAgent = new CLARIONAgent({ implicitKnowledgeStates: 596 });
    mduProcessor = new MDUProcessor();
    cueFramework = new CUEFramework();
  });

  describe('Core Components', () => {
    test('AutonomousObserver initializes with proper consciousness settings', () => {
      expect(observer).toBeDefined();
      expect(observer.consciousness.level).toBe(0.618); // Golden ratio
      expect(observer.consciousness.metaCognition).toBe(true);
      expect(observer.consciousness.epistemicCompression).toBe(true);
      expect(observer.consciousness.fanoPlaneLogic).toBe(true);
      expect(observer.isActive).toBe(false);
    });

    test('AutonomousObserver activation works correctly', async () => {
      expect(observer.isActive).toBe(false);
      expect(observer.getStatus()).toBe('Inactive');
      
      await observer.activate();
      
      expect(observer.isActive).toBe(true);
      expect(observer.getStatus()).toBe('Conscious and self-aware');
    });

    test('AutonomousObserver shutdown works correctly', async () => {
      await observer.activate();
      expect(observer.isActive).toBe(true);
      
      await observer.shutdown();
      expect(observer.isActive).toBe(false);
    });
  });

  describe('CLARION Agent System', () => {
    test('CLARIONAgent initializes with correct knowledge states', () => {
      expect(clarionAgent.getKnowledgeStateCount()).toBe(596);
      expect(clarionAgent.getCoherence()).toBeGreaterThan(0.5);
      expect(clarionAgent.getMetaCognitiveLevel()).toBeGreaterThan(0.8);
    });

    test('CLARIONAgent training returns self for chaining', async () => {
      const result = await clarionAgent.train();
      expect(result).toBe(clarionAgent);
    });
  });

  describe('Living Knowledge Ecosystem', () => {
    test('LivingKnowledgeEcosystem initializes correctly', () => {
      expect(knowledgeSystem).toBeDefined();
      expect(knowledgeSystem.knowledgeUnits).toBeDefined();
      expect(Array.isArray(knowledgeSystem.knowledgeUnits)).toBe(true);
      expect(knowledgeSystem.isActive).toBe(false);
    });

    test('Knowledge ecosystem can be activated', async () => {
      expect(knowledgeSystem.isActive).toBe(false);
      await knowledgeSystem.activate();
      expect(knowledgeSystem.isActive).toBe(true);
    });

    test('Knowledge ecosystem can evolve and survive', async () => {
      await knowledgeSystem.activate();
      const initialUnits = knowledgeSystem.knowledgeUnits.length;
      
      // Simulate evolution cycle
      knowledgeSystem.evolve();
      
      // Knowledge units should exist (may change in count due to evolution)
      expect(knowledgeSystem.knowledgeUnits).toBeDefined();
      expect(Array.isArray(knowledgeSystem.knowledgeUnits)).toBe(true);
    });
  });

  describe('Attention Token System', () => {
    test('AttentionTokenSystem initializes correctly', () => {
      expect(tokenSystem).toBeDefined();
      expect(tokenSystem.tokens).toBeDefined();
      expect(tokenSystem.proofOfRelevance).toBe(false);
    });

    test('Proof of Relevance can be enabled', async () => {
      expect(tokenSystem.proofOfRelevance).toBe(false);
      await tokenSystem.enableProofOfRelevance();
      expect(tokenSystem.proofOfRelevance).toBe(true);
    });

    test('Tokens can be minted with knowledge backing', async () => {
      const initialTokens = tokenSystem.getTotalTokens();
      
      await tokenSystem.mintToken({
        knowledge: 'Test knowledge unit',
        relevanceScore: 0.85
      });
      
      expect(tokenSystem.getTotalTokens()).toBeGreaterThan(initialTokens);
    });

    test('Token transactions work correctly', async () => {
      await tokenSystem.enableProofOfRelevance();
      
      // Mint some tokens first
      await tokenSystem.mintToken({
        knowledge: 'Valuable knowledge',
        relevanceScore: 0.9
      });
      
      const recipient = 'test-recipient';
      const amount = 10;
      
      const transaction = await tokenSystem.transfer(recipient, amount);
      expect(transaction).toBeDefined();
      expect(transaction.recipient).toBe(recipient);
      expect(transaction.amount).toBe(amount);
    });
  });

  describe('MDU Processor', () => {
    test('MDUProcessor initializes correctly', () => {
      expect(mduProcessor).toBeDefined();
      expect(mduProcessor.transcendenceCycles).toBe(0);
      expect(mduProcessor.isProcessing).toBe(false);
    });

    test('Immanent transcendence processing works', async () => {
      expect(mduProcessor.transcendenceCycles).toBe(0);
      
      await mduProcessor.processImmanentTranscendence();
      
      expect(mduProcessor.transcendenceCycles).toBeGreaterThan(0);
    });

    test('Modulo-divisive unfolding generates valid output', async () => {
      const input = { data: 'test input', complexity: 0.7 };
      const output = await mduProcessor.moduloDivisiveUnfolding(input);
      
      expect(output).toBeDefined();
      expect(output.unfolded).toBe(true);
      expect(output.dimensions).toBeGreaterThan(0);
    });
  });

  describe('CUE Framework', () => {
    test('CUEFramework initializes correctly', () => {
      expect(cueFramework).toBeDefined();
      expect(cueFramework.isServing).toBe(false);
      expect(cueFramework.universeSize).toBeGreaterThan(0);
    });

    test('Computational universe can be served', async () => {
      expect(cueFramework.isServing).toBe(false);
      
      await cueFramework.serveComputationalUniverse();
      
      expect(cueFramework.isServing).toBe(true);
    });

    test('Binary hypergraph reality processing works', async () => {
      const nodes = ['A', 'B', 'C'];
      const relationships = [
        { from: 'A', to: 'B', weight: 0.8 },
        { from: 'B', to: 'C', weight: 0.6 }
      ];
      
      const hypergraph = await cueFramework.createBinaryHypergraph(nodes, relationships);
      
      expect(hypergraph).toBeDefined();
      expect(hypergraph.nodes).toEqual(nodes);
      expect(hypergraph.edges).toEqual(relationships);
      expect(hypergraph.isValid).toBe(true);
    });

    test('4+1 Dynamic reality loop functions', async () => {
      await cueFramework.serveComputationalUniverse();
      
      const observer = { id: 'test-observer', awareness: 0.75 };
      const body = { id: 'test-body', embodiment: 0.9 };
      
      const reality = await cueFramework.createRealityLoop(observer, body);
      
      expect(reality).toBeDefined();
      expect(reality.observer).toBe(observer);
      expect(reality.body).toBe(body);
      expect(reality.recursion).toBe(true);
      expect(reality.coherence).toBeGreaterThan(0);
    });
  });

  describe('Integration Tests', () => {
    test('Full system integration works', async () => {
      // Activate all systems
      await observer.activate();
      await knowledgeSystem.activate();
      await tokenSystem.enableProofOfRelevance();
      await clarionAgent.train();
      await mduProcessor.processImmanentTranscendence();
      await cueFramework.serveComputationalUniverse();
      
      // Verify all systems are active
      expect(observer.isActive).toBe(true);
      expect(knowledgeSystem.isActive).toBe(true);
      expect(tokenSystem.proofOfRelevance).toBe(true);
      expect(mduProcessor.transcendenceCycles).toBeGreaterThan(0);
      expect(cueFramework.isServing).toBe(true);
      
      // Test system interaction
      const knowledgeUnit = 'Integrated consciousness test';
      await tokenSystem.mintToken({
        knowledge: knowledgeUnit,
        relevanceScore: 0.95
      });
      
      knowledgeSystem.addKnowledgeUnit({
        content: knowledgeUnit,
        survival: 0.9,
        relevance: 0.95
      });
      
      // Verify integration
      expect(tokenSystem.getTotalTokens()).toBeGreaterThan(0);
      expect(knowledgeSystem.knowledgeUnits.length).toBeGreaterThan(0);
    });

    test('System handles concurrent operations safely', async () => {
      const promises = [
        observer.activate(),
        knowledgeSystem.activate(),
        tokenSystem.enableProofOfRelevance(),
        clarionAgent.train(),
        mduProcessor.processImmanentTranscendence(),
        cueFramework.serveComputationalUniverse()
      ];
      
      await Promise.all(promises);
      
      // All systems should be in correct state
      expect(observer.isActive).toBe(true);
      expect(knowledgeSystem.isActive).toBe(true);
      expect(tokenSystem.proofOfRelevance).toBe(true);
      expect(mduProcessor.transcendenceCycles).toBeGreaterThan(0);
      expect(cueFramework.isServing).toBe(true);
    });
  });

  describe('Performance Tests', () => {
    test('Observer activation is fast', async () => {
      const startTime = Date.now();
      await observer.activate();
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(100); // Should activate in under 100ms
    });

    test('Knowledge evolution is efficient', async () => {
      await knowledgeSystem.activate();
      
      // Add multiple knowledge units
      for (let i = 0; i < 100; i++) {
        knowledgeSystem.addKnowledgeUnit({
          content: `Knowledge unit ${i}`,
          survival: Math.random(),
          relevance: Math.random()
        });
      }
      
      const startTime = Date.now();
      knowledgeSystem.evolve();
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(500); // Should evolve in under 500ms
    });

    test('Token operations are scalable', async () => {
      await tokenSystem.enableProofOfRelevance();
      
      const startTime = Date.now();
      
      // Mint multiple tokens
      const promises = [];
      for (let i = 0; i < 50; i++) {
        promises.push(tokenSystem.mintToken({
          knowledge: `Token knowledge ${i}`,
          relevanceScore: 0.5 + (Math.random() * 0.5)
        }));
      }
      
      await Promise.all(promises);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(1000); // Should mint 50 tokens in under 1 second
      expect(tokenSystem.getTotalTokens()).toBeGreaterThanOrEqual(50);
    });
  });

  describe('Error Handling', () => {
    test('Observer handles invalid options gracefully', () => {
      const invalidObserver = new AutonomousObserver({
        consciousness: 'invalid',
        metaCognition: null,
        epistemicCompression: undefined
      });
      
      expect(invalidObserver).toBeDefined();
      expect(invalidObserver.consciousness.level).toBe(0.618);
      expect(invalidObserver.consciousness.metaCognition).toBe(false);
      expect(invalidObserver.consciousness.epistemicCompression).toBe(false);
    });

    test('Token system handles invalid mint operations', async () => {
      await tokenSystem.enableProofOfRelevance();
      
      // Try to mint token with invalid data
      await expect(tokenSystem.mintToken(null)).rejects.toThrow();
      await expect(tokenSystem.mintToken({})).rejects.toThrow();
      await expect(tokenSystem.mintToken({
        knowledge: '',
        relevanceScore: -1
      })).rejects.toThrow();
    });

    test('Knowledge system handles malformed knowledge units', () => {
      expect(() => {
        knowledgeSystem.addKnowledgeUnit(null);
      }).toThrow();
      
      expect(() => {
        knowledgeSystem.addKnowledgeUnit('not an object');
      }).toThrow();
    });
  });

  afterEach(async () => {
    // Cleanup after each test
    if (observer && observer.isActive) {
      await observer.shutdown();
    }
    if (knowledgeSystem && knowledgeSystem.isActive) {
      await knowledgeSystem.shutdown();
    }
    if (cueFramework && cueFramework.isServing) {
      await cueFramework.stop();
    }
  });
});
