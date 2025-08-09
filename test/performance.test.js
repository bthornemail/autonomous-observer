const { AutonomousObserver } = require('../src/observer/AutonomousObserver');
const { LivingKnowledgeEcosystem } = require('../src/knowledge/LivingKnowledgeEcosystem');
const { AttentionTokenSystem } = require('../src/economy/AttentionTokenSystem');

describe('Performance Benchmarks - Autonomous Observer', () => {
  let observer;
  let knowledgeSystem;
  let tokenSystem;

  beforeEach(() => {
    observer = new AutonomousObserver();
    knowledgeSystem = new LivingKnowledgeEcosystem();
    tokenSystem = new AttentionTokenSystem();
  });

  describe('Scalability Tests', () => {
    test('Observer handles multiple concurrent activations', async () => {
      const observers = Array.from({ length: 10 }, () => new AutonomousObserver());
      
      const startTime = performance.now();
      await Promise.all(observers.map(obs => obs.activate()));
      const endTime = performance.now();
      
      const avgTimePerActivation = (endTime - startTime) / observers.length;
      
      expect(avgTimePerActivation).toBeLessThan(10); // Less than 10ms per activation
      observers.forEach(obs => expect(obs.isActive).toBe(true));
    });

    test('Knowledge system scales with large datasets', async () => {
      await knowledgeSystem.activate();
      
      // Add 1000 knowledge units
      const startTime = performance.now();
      for (let i = 0; i < 1000; i++) {
        knowledgeSystem.addKnowledgeUnit({
          content: `Large dataset knowledge unit ${i}`,
          survival: Math.random(),
          relevance: Math.random(),
          complexity: Math.random() * 0.5 + 0.5
        });
      }
      const addEndTime = performance.now();
      
      // Evolve the ecosystem
      knowledgeSystem.evolve();
      const evolveEndTime = performance.now();
      
      const addTime = addEndTime - startTime;
      const evolveTime = evolveEndTime - addEndTime;
      
      expect(addTime).toBeLessThan(1000); // Adding 1000 units in under 1 second
      expect(evolveTime).toBeLessThan(2000); // Evolution in under 2 seconds
      expect(knowledgeSystem.knowledgeUnits.length).toBeGreaterThan(0);
    });

    test('Token system handles high-frequency transactions', async () => {
      await tokenSystem.enableProofOfRelevance();
      
      // First mint some tokens
      await tokenSystem.mintToken({
        knowledge: 'High-frequency test tokens',
        relevanceScore: 0.8
      });
      
      const startTime = performance.now();
      
      // Perform 100 rapid transactions
      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(tokenSystem.transfer(`recipient-${i}`, 1));
      }
      
      const results = await Promise.allSettled(promises);
      const endTime = performance.now();
      
      const totalTime = endTime - startTime;
      const avgTimePerTransaction = totalTime / 100;
      
      expect(avgTimePerTransaction).toBeLessThan(50); // Less than 50ms per transaction
      
      // Count successful transactions
      const successful = results.filter(r => r.status === 'fulfilled').length;
      expect(successful).toBeGreaterThan(90); // At least 90% success rate
    });
  });

  describe('Memory Usage Tests', () => {
    test('Observer memory usage stays within bounds', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Create observer with reasonable defaults
      const observer = new AutonomousObserver({ 
        awareness: 0.5,
        patterns: 1000 // Smaller pattern set for memory test
      });
      await observer.activate();
      
      // Stress test the observer
      for (let i = 0; i < 50; i++) {
        await observer.observeEvent(`test-event-${i}`);
      }
      
      const memoryAfterStress = process.memoryUsage().heapUsed;
      const memoryIncrease = memoryAfterStress - initialMemory;
      
      // Memory increase should be reasonable (< 5MB)
      expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024);
      
      // Shutdown observer
      await observer.shutdown();
      
      // Allow garbage collection
      if (global.gc) {
        global.gc();
      }
      
      const memoryAfterCleanup = process.memoryUsage().heapUsed;
      
  // Memory should be partially cleaned up after shutdown (allow for 5MB over initial)
  const postCleanupIncrease = memoryAfterCleanup - initialMemory;
  expect(postCleanupIncrease).toBeLessThan(5 * 1024 * 1024);
    });

    test('Knowledge system manages memory efficiently with evolution', async () => {
      await knowledgeSystem.activate();
      
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Add large amount of knowledge
      for (let cycle = 0; cycle < 10; cycle++) {
        for (let i = 0; i < 100; i++) {
          knowledgeSystem.addKnowledgeUnit({
            content: `Memory test knowledge cycle ${cycle} unit ${i} - ${Math.random().toString(36).substring(7)}`,
            survival: Math.random(),
            relevance: Math.random(),
            data: new Array(100).fill().map(() => Math.random())
          });
        }
        
        // Evolve to potentially clean up weak knowledge
        knowledgeSystem.evolve();
      }
      
      const peakMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = peakMemory - initialMemory;
      
      // Memory increase should be bounded (less than 100MB)
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);
      
      // Knowledge units should be managed, not just accumulating
      expect(knowledgeSystem.knowledgeUnits.length).toBeLessThan(1000);
    });
  });

  describe('Concurrent Operation Tests', () => {
    test('System handles mixed concurrent operations', async () => {
      const startTime = performance.now();
      
      // Concurrent operations of different types
      const operations = [
        observer.activate(),
        knowledgeSystem.activate(),
        tokenSystem.enableProofOfRelevance(),
        
        // Knowledge operations
        ...Array.from({ length: 10 }, (_, i) => 
          knowledgeSystem.addKnowledgeUnit({
            content: `Concurrent knowledge ${i}`,
            survival: Math.random(),
            relevance: Math.random()
          })
        ),
        
        // Token operations after proof of relevance is enabled
        tokenSystem.enableProofOfRelevance().then(() => 
          tokenSystem.mintToken({
            knowledge: 'Concurrent token knowledge',
            relevanceScore: 0.7
          })
        ),
      ];
      
      const results = await Promise.allSettled(operations);
      const endTime = performance.now();
      
      const totalTime = endTime - startTime;
      expect(totalTime).toBeLessThan(2000); // Complete in under 2 seconds
      
      // Most operations should succeed
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const successRate = successful / results.length;
      expect(successRate).toBeGreaterThan(0.8); // At least 80% success
    });

    test('System maintains consistency under concurrent modifications', async () => {
      await knowledgeSystem.activate();
      await tokenSystem.enableProofOfRelevance();
      
      // Concurrent modifications to the same systems
      const knowledgeOperations = Array.from({ length: 20 }, (_, i) => 
        knowledgeSystem.addKnowledgeUnit({
          content: `Consistency test ${i}`,
          survival: Math.random(),
          relevance: Math.random()
        })
      );
      
      const tokenOperations = Array.from({ length: 10 }, (_, i) => 
        tokenSystem.mintToken({
          knowledge: `Consistency token ${i}`,
          relevanceScore: Math.random() * 0.5 + 0.5
        })
      );
      
      const evolutionOperations = Array.from({ length: 5 }, () => 
        knowledgeSystem.evolve()
      );
      
      await Promise.all([
        ...knowledgeOperations,
        ...tokenOperations,
        ...evolutionOperations
      ]);
      
      // System should maintain consistency
      expect(knowledgeSystem.knowledgeUnits).toBeDefined();
      expect(Array.isArray(knowledgeSystem.knowledgeUnits)).toBe(true);
      expect(knowledgeSystem.knowledgeUnits.length).toBeGreaterThan(0);
      expect(tokenSystem.getTotalTokens()).toBeGreaterThan(0);
    });
  });

  describe('Load Testing', () => {
    test('System handles sustained load', async () => {
      await observer.activate();
      await knowledgeSystem.activate();
      await tokenSystem.enableProofOfRelevance();
      
      const startTime = performance.now();
      let operationsCompleted = 0;
      
      // Sustained operations for 3 seconds
      const endTime = startTime + 3000;
      
      const sustainedOperations = async () => {
        while (performance.now() < endTime) {
          try {
            // Mix of operations
            await Promise.all([
              knowledgeSystem.addKnowledgeUnit({
                content: `Load test knowledge ${operationsCompleted}`,
                survival: Math.random(),
                relevance: Math.random()
              }),
              tokenSystem.mintToken({
                knowledge: `Load test token ${operationsCompleted}`,
                relevanceScore: Math.random() * 0.5 + 0.5
              })
            ]);
            
            operationsCompleted++;
            
            // Occasional evolution
            if (operationsCompleted % 10 === 0) {
              knowledgeSystem.evolve();
            }
            
            // Small delay to prevent overwhelming
            await new Promise(resolve => setTimeout(resolve, 10));
          } catch (error) {
            // Log but continue
            console.warn(`Load test operation failed: ${error.message}`);
          }
        }
      };
      
      await sustainedOperations();
      
      const actualDuration = performance.now() - startTime;
      const operationsPerSecond = operationsCompleted / (actualDuration / 1000);
      
      expect(operationsCompleted).toBeGreaterThan(50); // At least 50 operations
      expect(operationsPerSecond).toBeGreaterThan(10); // At least 10 ops/sec
      
      // System should still be functional
      expect(observer.isActive).toBe(true);
      expect(knowledgeSystem.isActive).toBe(true);
      expect(tokenSystem.proofOfRelevance).toBe(true);
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
