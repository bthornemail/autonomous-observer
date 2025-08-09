class LivingKnowledgeEcosystem {
  constructor(options = {}) {
    this.options = options;
    this.knowledgeUnits = [];
    this.patterns = [];
    this.alivePatterns = 0;
    this.evolutionCycles = 0;
    this.stability = 0.8;
    this.isActive = false;
  }

  async activate() {
    console.log('🌱 Activating living knowledge ecosystem...');
    this.isActive = true;
    await this.initialize();
    return this;
  }

  async shutdown() {
    console.log('🌱 Shutting down living knowledge ecosystem...');
    this.isActive = false;
    return this;
  }

  async initialize() {
    console.log('🌱 Initializing living knowledge ecosystem...');
    
    if (this.options.seedKnowledge) {
      this.seedFromKnowledge(this.options.seedKnowledge);
    } else {
      this.patterns = new Array(this.options.patterns || 100000).fill(null).map((_, i) => ({
        id: i,
        isAlive: true,
        survival: Math.random()
      }));
    }
    
    this.alivePatterns = this.patterns.filter(p => p.isAlive).length;
    
    return this;
  }

  addKnowledgeUnit(knowledgeUnit) {
    if (!knowledgeUnit || typeof knowledgeUnit !== 'object') {
      throw new Error('Knowledge unit must be a valid object');
    }

    if (!knowledgeUnit.content && knowledgeUnit.content !== '') {
      throw new Error('Knowledge unit must have content');
    }

    // Sanitize and validate the knowledge unit
    const sanitizedUnit = {
      id: this.knowledgeUnits.length,
      content: String(knowledgeUnit.content || '').substring(0, 10000), // Limit content length
      survival: Math.max(0, Math.min(1, Number(knowledgeUnit.survival) || 0.5)),
      relevance: Math.max(0, Math.min(1, Number(knowledgeUnit.relevance) || 0.5)),
      complexity: Math.max(0, Math.min(1, Number(knowledgeUnit.complexity) || 0.5)),
      created: Date.now(),
      isAlive: true
    };

    this.knowledgeUnits.push(sanitizedUnit);
    
    // Also add to patterns for evolution
    this.patterns.push({
      id: sanitizedUnit.id,
      isAlive: true,
      survival: sanitizedUnit.survival,
      relevance: sanitizedUnit.relevance,
      knowledgeUnit: sanitizedUnit
    });

    return sanitizedUnit;
  }

  seedFromKnowledge(seedKnowledge) {
    let patternId = 0;
    Object.entries(seedKnowledge).forEach(([domain, data]) => {
      data.patterns.forEach(pattern => {
        this.patterns.push({
          id: patternId++,
          isAlive: true,
          survival: pattern.confidence || 0.8,
          domain: domain,
          pattern: pattern
        });
      });
    });
  }

  evolve() {
    if (!this.isActive) {
      throw new Error('Cannot evolve inactive ecosystem');
    }

    // Conway's Game of Life evolution
    this.evolutionCycles++;
    let survived = 0;
    
    this.patterns.forEach(pattern => {
      if (pattern.isAlive) {
        // Simple survival based on relevance and random factors
        const survivalChance = (pattern.survival || 0.5) + (Math.random() - 0.5) * 0.2;
        pattern.isAlive = survivalChance > 0.3;
        
        if (pattern.isAlive) {
          survived++;
          // Update corresponding knowledge unit if it exists
          if (pattern.knowledgeUnit) {
            const unitIndex = this.knowledgeUnits.findIndex(u => u.id === pattern.id);
            if (unitIndex !== -1) {
              this.knowledgeUnits[unitIndex].survival = Math.min(1, pattern.survival + 0.1);
            }
          }
        } else {
          // Remove dead knowledge units
          if (pattern.knowledgeUnit) {
            const unitIndex = this.knowledgeUnits.findIndex(u => u.id === pattern.id);
            if (unitIndex !== -1) {
              this.knowledgeUnits[unitIndex].isAlive = false;
            }
          }
        }
      }
    });

    // Remove dead patterns occasionally to prevent memory buildup
    if (this.evolutionCycles % 10 === 0) {
      this.patterns = this.patterns.filter(p => p.isAlive);
      this.knowledgeUnits = this.knowledgeUnits.filter(u => u.isAlive);
    }

    this.alivePatterns = survived;
    
    console.log(`🧬 Evolution cycle ${this.evolutionCycles}: ${survived} patterns survived`);
    
    return {
      cycle: this.evolutionCycles,
      survived: survived,
      total: this.patterns.length
    };
  }

  getPatternCount() {
    return this.patterns.length;
  }

  getAlivePatternCount() {
    return this.alivePatterns;
  }

  getEvolutionCycles() {
    return this.evolutionCycles;
  }

  getStability() {
    return this.stability;
  }
}

module.exports = { LivingKnowledgeEcosystem };