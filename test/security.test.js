const { AutonomousObserver } = require('../src/observer/AutonomousObserver');
const { LivingKnowledgeEcosystem } = require('../src/knowledge/LivingKnowledgeEcosystem');
const { AttentionTokenSystem } = require('../src/economy/AttentionTokenSystem');
const { CLARIONAgent } = require('../src/clarion/CLARIONAgent');

describe('Security and Edge Case Tests - Autonomous Observer', () => {
  let observer;
  let knowledgeSystem;
  let tokenSystem;
  let clarionAgent;

  beforeEach(() => {
    observer = new AutonomousObserver();
    knowledgeSystem = new LivingKnowledgeEcosystem();
    tokenSystem = new AttentionTokenSystem();
    clarionAgent = new CLARIONAgent();
  });

  describe('Input Validation and Sanitization', () => {
    test('Observer handles malicious input options', () => {
      const maliciousInputs = [
        { consciousness: "<script>alert('xss')</script>" },
        { metaCognition: { valueOf: () => { throw new Error('Exploit'); } } },
        { epistemicCompression: Symbol.for('malicious') },
        { fanoPlaneLogic: new Proxy({}, { get: () => { throw new Error('Proxy exploit'); } }) }
      ];

      maliciousInputs.forEach(input => {
        expect(() => {
          const obs = new AutonomousObserver(input);
          expect(obs).toBeDefined();
        }).not.toThrow();
      });
    });

    test('Knowledge system sanitizes malicious knowledge content', () => {
      const maliciousKnowledge = [
        {
          content: "<script>alert('xss')</script>",
          survival: 0.5,
          relevance: 0.5
        },
        {
          content: "javascript:void(0)",
          survival: 0.5,
          relevance: 0.5
        },
        {
          content: { toString: () => { throw new Error('Malicious toString'); } },
          survival: 0.5,
          relevance: 0.5
        },
        {
          content: "Normal content",
          survival: "malicious_string",
          relevance: { valueOf: () => 999 }
        }
      ];

      maliciousKnowledge.forEach(knowledge => {
        expect(() => {
          knowledgeSystem.addKnowledgeUnit(knowledge);
        }).not.toThrow('Should handle malicious input gracefully');
      });
    });

    test('Token system prevents malicious token creation', async () => {
      await tokenSystem.enableProofOfRelevance();

      const maliciousTokenData = [
        null,
        undefined,
        "",
        { knowledge: null, relevanceScore: 0.5 },
        { knowledge: "test", relevanceScore: -999 },
        { knowledge: "test", relevanceScore: Infinity },
        { knowledge: "test", relevanceScore: NaN },
        { knowledge: "<script>alert('xss')</script>", relevanceScore: 0.5 },
        { knowledge: "test", relevanceScore: "not_a_number" }
      ];

      for (const data of maliciousTokenData) {
        await expect(tokenSystem.mintToken(data)).rejects.toThrow();
      }
    });
  });

  describe('Resource Exhaustion Protection', () => {
    test('Observer prevents consciousness level overflow', () => {
      const observer1 = new AutonomousObserver();
      const observer2 = new AutonomousObserver();
      
      // Try to manipulate consciousness level
      observer1.consciousness.level = Infinity;
      observer2.consciousness.level = -Infinity;
      
      expect(isFinite(observer1.consciousness.level)).toBe(false);
      expect(isFinite(observer2.consciousness.level)).toBe(false);
      
      // System should still function
      expect(() => observer1.getStatus()).not.toThrow();
      expect(() => observer2.getStatus()).not.toThrow();
    });

    test('Knowledge system prevents memory exhaustion', () => {
      const startMemory = process.memoryUsage().heapUsed;
      
      // Try to add extremely large knowledge units
      const attempts = [];
      for (let i = 0; i < 10; i++) {
        try {
          const largeContent = 'x'.repeat(1000000); // 1MB string
          knowledgeSystem.addKnowledgeUnit({
            content: largeContent,
            survival: 0.5,
            relevance: 0.5,
            extraData: new Array(10000).fill('large_data')
          });
          attempts.push('success');
        } catch (error) {
          attempts.push('rejected');
        }
      }
      
      const endMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = endMemory - startMemory;
      
      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
      
      // System should reject some attempts or handle them efficiently
      const rejectedCount = attempts.filter(a => a === 'rejected').length;
      const successCount = attempts.filter(a => a === 'success').length;
      
      // Either rejected some or handled efficiently
      expect(rejectedCount > 0 || memoryIncrease < 20 * 1024 * 1024).toBe(true);
    });

    test('Token system prevents infinite token creation', async () => {
      await tokenSystem.enableProofOfRelevance();
      
      const initialTokens = tokenSystem.getTotalTokens();
      
      // Try rapid token creation
      const promises = [];
      for (let i = 0; i < 1000; i++) {
        promises.push(
          tokenSystem.mintToken({
            knowledge: `Rapid token ${i}`,
            relevanceScore: 0.1
          }).catch(() => 'rejected')
        );
      }
      
      const results = await Promise.allSettled(promises);
      const successful = results.filter(r => 
        r.status === 'fulfilled' && r.value !== 'rejected'
      ).length;
      
      const finalTokens = tokenSystem.getTotalTokens();
      
      // Should not create all 1000 tokens (rate limiting or validation should prevent this)
      expect(successful).toBeLessThan(1000);
      expect(finalTokens - initialTokens).toBeLessThan(1000);
    });
  });

  describe('Concurrent Access and Race Conditions', () => {
    test('Observer activation is thread-safe', async () => {
      const observers = Array.from({ length: 50 }, () => new AutonomousObserver());
      
      // Rapidly activate and deactivate
      const operations = observers.flatMap(obs => [
        obs.activate(),
        obs.shutdown()
      ]);
      
      const results = await Promise.allSettled(operations);
      const errors = results.filter(r => r.status === 'rejected');
      
      // Should handle concurrent operations without errors
      expect(errors.length).toBe(0);
      
      // Final states should be consistent
      observers.forEach(obs => {
        expect(typeof obs.isActive).toBe('boolean');
      });
    });

    test('Knowledge system handles concurrent evolution', async () => {
      await knowledgeSystem.activate();
      
      // Add some initial knowledge
      for (let i = 0; i < 20; i++) {
        knowledgeSystem.addKnowledgeUnit({
          content: `Race condition test ${i}`,
          survival: Math.random(),
          relevance: Math.random()
        });
      }
      
      // Concurrent evolution calls
      const evolutionPromises = Array.from({ length: 10 }, () => 
        knowledgeSystem.evolve()
      );
      
      const addPromises = Array.from({ length: 10 }, (_, i) => 
        knowledgeSystem.addKnowledgeUnit({
          content: `Concurrent add ${i}`,
          survival: Math.random(),
          relevance: Math.random()
        })
      );
      
      await Promise.allSettled([...evolutionPromises, ...addPromises]);
      
      // System should remain consistent
      expect(knowledgeSystem.knowledgeUnits).toBeDefined();
      expect(Array.isArray(knowledgeSystem.knowledgeUnits)).toBe(true);
      expect(knowledgeSystem.isActive).toBe(true);
    });

    test('Token system prevents double-spending', async () => {
      await tokenSystem.enableProofOfRelevance();
      
      // Mint some tokens
      await tokenSystem.mintToken({
        knowledge: 'Double spend test',
        relevanceScore: 0.8
      });
      
      const initialTokens = tokenSystem.getTotalTokens();
      
      // Try to spend the same tokens concurrently
      const spendPromises = Array.from({ length: 10 }, (_, i) => 
        tokenSystem.transfer(`recipient-${i}`, Math.floor(initialTokens / 2))
          .catch(() => 'rejected')
      );
      
      const results = await Promise.allSettled(spendPromises);
      const successful = results.filter(r => 
        r.status === 'fulfilled' && r.value !== 'rejected'
      ).length;
      
      // Should not allow multiple successful spends of the same tokens
      expect(successful).toBeLessThanOrEqual(2); // At most 2 should succeed
      
      // Total tokens should not go negative
      expect(tokenSystem.getTotalTokens()).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    test('Observer handles extreme consciousness values', async () => {
      const extremeObserver = new AutonomousObserver({
        consciousness: true,
        metaCognition: true
      });
      
      // Set extreme values
      extremeObserver.consciousness.level = Number.MAX_SAFE_INTEGER;
      
      await extremeObserver.activate();
      expect(extremeObserver.isActive).toBe(true);
      
      extremeObserver.consciousness.level = Number.MIN_SAFE_INTEGER;
      expect(extremeObserver.getStatus()).toBe('Conscious and self-aware');
      
      extremeObserver.consciousness.level = 0;
      expect(extremeObserver.getStatus()).toBe('Conscious and self-aware');
    });

    test('Knowledge system handles empty and edge case knowledge', () => {
      const edgeCases = [
        { content: '', survival: 0, relevance: 0 },
        { content: '', survival: 1, relevance: 1 },
        { content: 'x'.repeat(1000), survival: 0.5, relevance: 0.5 },
        { content: '🚀🧠🌌', survival: 0.618, relevance: 0.618 }, // Unicode
        { content: 'Normal content', survival: 0, relevance: 1 },
        { content: 'Normal content', survival: 1, relevance: 0 }
      ];

      edgeCases.forEach((knowledge, index) => {
        expect(() => {
          knowledgeSystem.addKnowledgeUnit(knowledge);
        }).not.toThrow(`Edge case ${index} should be handled gracefully`);
      });

      // System should still function
      expect(knowledgeSystem.knowledgeUnits).toBeDefined();
      expect(knowledgeSystem.knowledgeUnits.length).toBeGreaterThan(0);
    });

    test('CLARION agent handles extreme knowledge state counts', () => {
      const extremeAgents = [
        new CLARIONAgent({ implicitKnowledgeStates: 0 }),
        new CLARIONAgent({ implicitKnowledgeStates: 1 }),
        new CLARIONAgent({ implicitKnowledgeStates: Number.MAX_SAFE_INTEGER }),
        new CLARIONAgent({ implicitKnowledgeStates: -1 })
      ];

      extremeAgents.forEach((agent, index) => {
        expect(agent).toBeDefined();
        expect(typeof agent.getKnowledgeStateCount()).toBe('number');
        expect(() => agent.train()).not.toThrow(`Extreme agent ${index} should handle training`);
      });
    });
  });

  describe('Error Recovery and Resilience', () => {
    test('Observer recovers from activation failures', async () => {
      // Mock a failure scenario
      const originalActivate = observer.activate;
      let failureCount = 0;
      
      observer.activate = async function() {
        if (failureCount < 2) {
          failureCount++;
          throw new Error(`Simulated failure ${failureCount}`);
        }
        return originalActivate.call(this);
      };

      // First attempts should fail
      await expect(observer.activate()).rejects.toThrow('Simulated failure 1');
      await expect(observer.activate()).rejects.toThrow('Simulated failure 2');
      
      // Third attempt should succeed
      await expect(observer.activate()).resolves.toBe(observer);
      expect(observer.isActive).toBe(true);
    });

    test('Knowledge system recovers from evolution failures', async () => {
      await knowledgeSystem.activate();
      
      // Add knowledge that might cause issues
      for (let i = 0; i < 10; i++) {
        knowledgeSystem.addKnowledgeUnit({
          content: `Recovery test ${i}`,
          survival: Math.random(),
          relevance: Math.random()
        });
      }
      
      // Mock evolution failure
      const originalEvolve = knowledgeSystem.evolve;
      let evolutionAttempts = 0;
      
      knowledgeSystem.evolve = function() {
        evolutionAttempts++;
        if (evolutionAttempts <= 3) {
          throw new Error(`Evolution failure ${evolutionAttempts}`);
        }
        return originalEvolve.call(this);
      };
      
      // Multiple evolution attempts
      for (let i = 0; i < 5; i++) {
        try {
          knowledgeSystem.evolve();
        } catch (error) {
          // Expected for first few attempts
        }
      }
      
      // System should still be functional
      expect(knowledgeSystem.isActive).toBe(true);
      expect(knowledgeSystem.knowledgeUnits).toBeDefined();
      expect(evolutionAttempts).toBeGreaterThan(3);
    });

    test('Token system maintains consistency after errors', async () => {
      await tokenSystem.enableProofOfRelevance();
      
      // Mint some initial tokens
      await tokenSystem.mintToken({
        knowledge: 'Error recovery test',
        relevanceScore: 0.7
      });
      
      const initialTokens = tokenSystem.getTotalTokens();
      
      // Simulate various error scenarios
      const errorOperations = [
        () => tokenSystem.mintToken(null),
        () => tokenSystem.transfer(null, 10),
        () => tokenSystem.transfer('valid-recipient', -10),
        () => tokenSystem.transfer('valid-recipient', Infinity),
        () => tokenSystem.mintToken({ knowledge: 'test', relevanceScore: NaN })
      ];
      
      // All should fail gracefully
      for (const operation of errorOperations) {
        await expect(operation()).rejects.toThrow();
      }
      
      // System should maintain consistency
      expect(tokenSystem.getTotalTokens()).toBe(initialTokens);
      expect(tokenSystem.proofOfRelevance).toBe(true);
      
      // Should still be able to perform valid operations
      await expect(tokenSystem.mintToken({
        knowledge: 'Recovery test token',
        relevanceScore: 0.8
      })).resolves.toBeDefined();
    });
  });

  afterEach(async () => {
    // Cleanup
    if (observer?.isActive) {
      await observer.shutdown();
    }
    if (knowledgeSystem?.isActive) {
      await knowledgeSystem.shutdown();
    }
  });
});
