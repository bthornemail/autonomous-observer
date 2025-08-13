#!/usr/bin/env node

/**
 * 🧠 ENHANCED RECURSIVE KNOWLEDGE ARCHAEOLOGIST
 * 
 * COMPLETE RECURSIVE ANALYSIS of ALL 149+ git commits
 * Extracts ALL knowledge triples, relationships, and patterns
 * Uses Conway evolution and sacred geometry validation
 * 
 * ENHANCED FEATURES:
 * - Recursive git commit analysis (ALL commits)
 * - Enhanced pattern recognition
 * - Temporal knowledge evolution tracking
 * - Cross-file relationship discovery
 * - Sacred geometry harmonic validation
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Sacred Geometry Constants
const PHI = (1 + Math.sqrt(5)) / 2;

class EnhancedRecursiveKnowledgeArchaeologist {
  constructor() {
    this.extractedKnowledge = {
      triples: [],
      axioms: [],
      revolutionaryPatterns: [],
      temporalEvolution: {},
      crossFileRelationships: [],
      harmonicSignatures: [],
      guidingStarPrinciples: {
        freedom: [],
        autonomy: [],
        reciprocity: [],
        sovereignty: []
      },
      manuscriptConnections: [],
      codeKnowledgeIntegration: []
    };
    this.processedCommits = 0;
    this.totalKnowledgeNodes = 0;
  }

  async excavateCompleteRepositoryRecursive() {
    console.log('🧠 ENHANCED RECURSIVE KNOWLEDGE ARCHAEOLOGIST');
    console.log('==============================================\n');

    // Phase 1: Complete Git Archaeological Survey
    const commits = await this.getAllCommitsRecursive();
    console.log(`📚 Found ${commits.length} commits for COMPLETE recursive analysis\n`);

    // Phase 2: Recursive Historical Document Extraction
    const documents = await this.extractAllHistoricalDocumentsRecursive(commits);
    console.log(`📄 Extracted ${documents.length} historical documents across ALL commits\n`);

    // Phase 3: Enhanced Knowledge Triple Mining
    console.log('⛏️  ENHANCED knowledge triple mining from ALL sources...\n');
    
    let tripleCount = 0;
    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];
      const triples = await this.extractEnhancedKnowledgeTriples(doc);
      this.extractedKnowledge.triples.push(...triples);
      tripleCount += triples.length;
      
      const revolutionary = await this.identifyRevolutionaryPatterns(doc);
      this.extractedKnowledge.revolutionaryPatterns.push(...revolutionary);
      
      const principles = await this.classifyByGuidingStarPrinciples(doc);
      this.mergeGuidingStarPrinciples(principles);

      // Track manuscript connections
      if (doc.path.includes('manuscript') || doc.path.includes('thesis')) {
        const manuscriptConnections = await this.extractManuscriptConnections(doc);
        this.extractedKnowledge.manuscriptConnections.push(...manuscriptConnections);
      }

      // Track code-knowledge integration
      if (doc.type === 'code') {
        const codeConnections = await this.extractCodeKnowledgeIntegration(doc);
        this.extractedKnowledge.codeKnowledgeIntegration.push(...codeConnections);
      }
      
      if (i % 10 === 0) {
        console.log(`   📖 Processed: ${i+1}/${documents.length} documents (${tripleCount} triples so far)`);
      }
    }

    // Phase 4: Cross-File Relationship Discovery
    console.log('\n🔗 Discovering cross-file relationships...\n');
    this.extractedKnowledge.crossFileRelationships = await this.discoverCrossFileRelationships();

    // Phase 5: Temporal Evolution Analysis
    console.log('⏰ Analyzing temporal knowledge evolution...\n');
    this.extractedKnowledge.temporalEvolution = await this.analyzeTemporalEvolution(commits);

    // Phase 6: Enhanced Axiomatic Relationship Detection  
    console.log('🧮 Detecting enhanced axiomatic relationships...\n');
    const axioms = await this.detectEnhancedAxiomaticRelationships();
    this.extractedKnowledge.axioms = axioms;

    // Phase 7: Conway's Game of Life Evolution (Enhanced)
    console.log('🧬 Applying enhanced Conway\'s evolution rules...\n');
    const evolvedKnowledge = await this.applyEnhancedConwaysEvolution();

    // Phase 8: Sacred Geometry Harmonic Analysis
    console.log('📐 Computing sacred geometry harmonic signatures...\n');
    this.extractedKnowledge.harmonicSignatures = await this.computeHarmonicSignatures();

    return this.generateEnhancedKnowledgeReport();
  }

  async getAllCommitsRecursive() {
    try {
      const output = execSync('git log --oneline --all --reverse', { encoding: 'utf8' });
      return output.split('\n')
        .filter(line => line.trim())
        .map((line, index) => {
          const [hash, ...messageParts] = line.split(' ');
          return {
            hash: hash,
            message: messageParts.join(' '),
            timestamp: this.getCommitTimestamp(hash),
            sequenceNumber: index + 1
          };
        });
    } catch (error) {
      console.error('Error getting commits:', error);
      return [];
    }
  }

  getCommitTimestamp(hash) {
    try {
      const timestamp = execSync(`git show -s --format=%ct ${hash}`, { encoding: 'utf8' });
      return new Date(parseInt(timestamp.trim()) * 1000);
    } catch (error) {
      return new Date();
    }
  }

  async extractAllHistoricalDocumentsRecursive(commits) {
    const documents = [];
    const processedFiles = new Set();
    
    console.log('   📚 Recursively extracting from ALL commits...');
    
    for (let i = 0; i < commits.length; i++) {
      const commit = commits[i];
      try {
        // Get all files in this commit
        const files = execSync(`git ls-tree -r --name-only ${commit.hash}`, { encoding: 'utf8' })
          .split('\n')
          .filter(file => file.match(/\.(md|txt|ts|js|json)$/i) && file.trim())
          .filter(file => !file.includes('node_modules'));

        for (const file of files) {
          const fileKey = `${commit.hash}:${file}`;
          
          // Skip if already processed this exact file at this commit
          if (processedFiles.has(fileKey)) continue;
          processedFiles.add(fileKey);

          try {
            const content = execSync(`git show ${commit.hash}:${file}`, { encoding: 'utf8' });
            
            // Only include if content has meaningful length
            if (content.trim().length < 50) continue;

            documents.push({
              path: file,
              content: content,
              commit: commit.hash,
              commitMessage: commit.message,
              timestamp: commit.timestamp,
              sequenceNumber: commit.sequenceNumber,
              type: this.classifyDocumentType(file),
              contentLength: content.length,
              uniqueIdentifier: fileKey
            });
          } catch (fileError) {
            // File might not exist in this commit, continue
            continue;
          }
        }
        
        if (i % 25 === 0) {
          console.log(`     Processed ${i+1}/${commits.length} commits, found ${documents.length} documents`);
        }
        
        this.processedCommits++;
      } catch (commitError) {
        console.warn(`Warning: Could not process commit ${commit.hash}`);
        continue;
      }
    }

    console.log(`   ✅ Recursive extraction complete: ${documents.length} total documents`);
    return documents;
  }

  classifyDocumentType(filename) {
    if (filename.match(/README|readme/i)) return 'documentation';
    if (filename.match(/\.md$/i)) return 'markdown';
    if (filename.match(/\.txt$/i)) return 'text';
    if (filename.match(/\.(ts|js)$/i)) return 'code';
    if (filename.match(/package\.json$/i)) return 'configuration';
    if (filename.match(/thesis|manuscript/i)) return 'academic';
    return 'unknown';
  }

  async extractEnhancedKnowledgeTriples(document) {
    const triples = [];
    const content = document.content;

    // ENHANCED Pattern Recognition with more sophisticated patterns
    const enhancedPatterns = [
      // ULP Core Systems
      {
        pattern: /(Universal.Life.Protocol|ULP|anarcho.*syndicalist|P2P.*marketplace)/gi,
        createTriple: (match) => ({
          subject: 'Universal Life Protocol',
          predicate: 'implements',
          object: match[0].toLowerCase().replace(/\./g, ' '),
          confidence: 0.95,
          category: 'core_system'
        })
      },
      
      // Economics and Attention Tokens  
      {
        pattern: /(attention.*token|AttentionToken|DPO|decentralized.*offer|consciousness.*based.*value)/gi,
        createTriple: (match) => ({
          subject: 'Economic System',
          predicate: 'uses',
          object: match[0].toLowerCase().replace(/\./g, ' '),
          confidence: 0.9,
          category: 'economic'
        })
      },
      
      // Sacred Geometry and Mathematics
      {
        pattern: /(golden.ratio|phi|PHI|flower.of.life|sacred.geometry|fibonacci|platonic.solid)/gi,
        createTriple: (match) => ({
          subject: 'Sacred Geometry Engine',
          predicate: 'calculates',
          object: match[0].replace(/\./g, ' ').toLowerCase(),
          confidence: 0.9,
          category: 'mathematical'
        })
      },
      
      // Living Knowledge and Conway Evolution
      {
        pattern: /(living.knowledge|knowledge.trie|Conway.*Game|survival.fitness|evolution.*rules)/gi,
        createTriple: (match) => ({
          subject: 'Living Knowledge System',
          predicate: 'evolves_through',
          object: match[0].replace(/\./g, ' ').toLowerCase(),
          confidence: 0.85,
          category: 'knowledge'
        })
      },
      
      // Consciousness and AI Systems
      {
        pattern: /(meta.observer|conscious.*AI|fano.plane|geometric.*inference|dimensional.*consciousness)/gi,
        createTriple: (match) => ({
          subject: 'Consciousness System',
          predicate: 'implements',
          object: match[0].replace(/\./g, ' ').toLowerCase(),
          confidence: 0.9,
          category: 'consciousness'
        })
      },
      
      // Personality and Social Harmony
      {
        pattern: /(Myers.Briggs|MBTI|personality.*profiling|cognitive.*function|social.*harmony)/gi,
        createTriple: (match) => ({
          subject: 'Personality System',
          predicate: 'uses',
          object: match[0].replace(/\./g, ' ').toLowerCase(),
          confidence: 0.8,
          category: 'personality'
        })
      },

      // Hypergraph and Visualization
      {
        pattern: /(hypergraph|visualization|graph.*theory|network.*topology)/gi,
        createTriple: (match) => ({
          subject: 'Visualization System',
          predicate: 'renders',
          object: match[0].replace(/\./g, ' ').toLowerCase(),
          confidence: 0.8,
          category: 'visualization'
        })
      },

      // Manuscript and Academic Content
      {
        pattern: /(thesis|manuscript|doctoral|research|academic.*framework)/gi,
        createTriple: (match) => ({
          subject: 'Academic Framework',
          predicate: 'documents',
          object: match[0].replace(/\./g, ' ').toLowerCase(),
          confidence: 0.85,
          category: 'academic'
        })
      },

      // Integration and System Architecture
      {
        pattern: /(system.*integration|architecture|framework|infrastructure)/gi,
        createTriple: (match) => ({
          subject: 'System Architecture',
          predicate: 'defines',
          object: match[0].replace(/\./g, ' ').toLowerCase(),
          confidence: 0.8,
          category: 'architecture'
        })
      }
    ];

    // Apply enhanced pattern matching
    enhancedPatterns.forEach(patternConfig => {
      let match;
      while ((match = patternConfig.pattern.exec(content)) !== null) {
        const triple = patternConfig.createTriple(match);
        triple.sourceDocument = document.path;
        triple.sourceCommit = document.commit;
        triple.timestamp = document.timestamp;
        triple.sequenceNumber = document.sequenceNumber;
        triple.survivalFitness = this.calculateEnhancedSurvivalFitness(triple);
        triple.id = this.generateTripleId(triple);
        
        triples.push(triple);
      }
    });

    return triples;
  }

  calculateEnhancedSurvivalFitness(triple) {
    let fitness = triple.confidence;
    
    // Category-based fitness bonuses
    const categoryBonuses = {
      'core_system': 0.3,
      'mathematical': 0.25,
      'consciousness': 0.25,
      'economic': 0.2,
      'knowledge': 0.2,
      'academic': 0.15,
      'architecture': 0.15,
      'personality': 0.1,
      'visualization': 0.1
    };
    
    if (categoryBonuses[triple.category]) {
      fitness += categoryBonuses[triple.category];
    }
    
    // Revolutionary concepts boost
    const revolutionaryTerms = ['anarcho', 'syndicalist', 'decentralized', 'mutual aid', 'commons', 'consciousness'];
    if (revolutionaryTerms.some(term => 
      triple.subject.toLowerCase().includes(term) || 
      triple.object.toLowerCase().includes(term)
    )) {
      fitness += 0.2;
    }
    
    // Sacred geometry mathematical enhancement
    if (triple.category === 'mathematical' || 
        triple.object.includes('phi') ||
        triple.object.includes('golden ratio')) {
      fitness = fitness * PHI / 2;
    }
    
    return Math.min(1.0, fitness);
  }

  generateTripleId(triple) {
    const content = `${triple.subject}-${triple.predicate}-${triple.object}-${triple.category}`;
    return content.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 60);
  }

  async extractManuscriptConnections(document) {
    const connections = [];
    const content = document.content;

    // Look for connections between manuscript and system components
    const manuscriptPatterns = [
      {
        pattern: /(chapter|section|thesis).*(\d+)/gi,
        type: 'academic_structure'
      },
      {
        pattern: /(harmonic|resonance|phi|golden.ratio)/gi,
        type: 'mathematical_reference'
      },
      {
        pattern: /(consciousness|dimensional|development)/gi,
        type: 'consciousness_reference'
      },
      {
        pattern: /(anarcho|syndicalist|revolutionary|marketplace)/gi,
        type: 'political_reference'
      }
    ];

    manuscriptPatterns.forEach(patternConfig => {
      let match;
      while ((match = patternConfig.pattern.exec(content)) !== null) {
        connections.push({
          document: document.path,
          commit: document.commit,
          type: patternConfig.type,
          reference: match[0],
          context: this.extractContext(content, match[0]),
          timestamp: document.timestamp
        });
      }
    });

    return connections;
  }

  async extractCodeKnowledgeIntegration(document) {
    const integrations = [];
    const content = document.content;

    // Look for code that implements knowledge concepts
    const codePatterns = [
      {
        pattern: /class\s+(\w+)/gi,
        type: 'class_definition'
      },
      {
        pattern: /function\s+(\w+)/gi,
        type: 'function_definition'
      },
      {
        pattern: /(PHI|golden|ratio|harmony)/gi,
        type: 'mathematical_implementation'
      },
      {
        pattern: /(consciousness|dimensional|meta.*observer)/gi,
        type: 'consciousness_implementation'
      }
    ];

    codePatterns.forEach(patternConfig => {
      let match;
      while ((match = patternConfig.pattern.exec(content)) !== null) {
        integrations.push({
          document: document.path,
          commit: document.commit,
          type: patternConfig.type,
          implementation: match[0],
          context: this.extractContext(content, match[0]),
          timestamp: document.timestamp
        });
      }
    });

    return integrations;
  }

  extractContext(content, pattern) {
    const index = content.toLowerCase().indexOf(pattern.toLowerCase());
    if (index === -1) return '';
    
    const start = Math.max(0, index - 100);
    const end = Math.min(content.length, index + pattern.length + 100);
    return content.substring(start, end).trim();
  }

  async discoverCrossFileRelationships() {
    const relationships = [];
    const triples = this.extractedKnowledge.triples;

    // Group triples by subject and object to find cross-file relationships
    const subjectGroups = {};
    const objectGroups = {};

    triples.forEach(triple => {
      // Group by subject
      if (!subjectGroups[triple.subject]) {
        subjectGroups[triple.subject] = [];
      }
      subjectGroups[triple.subject].push(triple);

      // Group by object
      if (!objectGroups[triple.object]) {
        objectGroups[triple.object] = [];
      }
      objectGroups[triple.object].push(triple);
    });

    // Find cross-file relationships
    Object.entries(subjectGroups).forEach(([subject, subjectTriples]) => {
      const uniqueFiles = new Set(subjectTriples.map(t => t.sourceDocument));
      if (uniqueFiles.size > 1) {
        relationships.push({
          type: 'cross_file_subject',
          concept: subject,
          files: Array.from(uniqueFiles),
          triplesCount: subjectTriples.length,
          strength: subjectTriples.reduce((sum, t) => sum + t.survivalFitness, 0) / subjectTriples.length
        });
      }
    });

    Object.entries(objectGroups).forEach(([object, objectTriples]) => {
      const uniqueFiles = new Set(objectTriples.map(t => t.sourceDocument));
      if (uniqueFiles.size > 1) {
        relationships.push({
          type: 'cross_file_object',
          concept: object,
          files: Array.from(uniqueFiles),
          triplesCount: objectTriples.length,
          strength: objectTriples.reduce((sum, t) => sum + t.survivalFitness, 0) / objectTriples.length
        });
      }
    });

    return relationships.sort((a, b) => b.strength - a.strength);
  }

  async analyzeTemporalEvolution(commits) {
    const evolution = {
      conceptEmergence: {},
      conceptEvolution: {},
      knowledgeGrowthRate: [],
      conceptLifecycles: {}
    };

    const triples = this.extractedKnowledge.triples;
    
    // Group triples by timestamp to analyze temporal patterns
    const timeGroups = {};
    triples.forEach(triple => {
      const timeKey = triple.timestamp.toISOString().substring(0, 7); // YYYY-MM
      if (!timeGroups[timeKey]) {
        timeGroups[timeKey] = [];
      }
      timeGroups[timeKey].push(triple);
    });

    // Analyze knowledge growth rate
    Object.entries(timeGroups).forEach(([timeKey, timeTriples]) => {
      evolution.knowledgeGrowthRate.push({
        period: timeKey,
        tripleCount: timeTriples.length,
        uniqueConcepts: new Set(timeTriples.map(t => t.subject)).size,
        averageFitness: timeTriples.reduce((sum, t) => sum + t.survivalFitness, 0) / timeTriples.length
      });
    });

    // Track concept emergence and evolution
    const conceptTimelines = {};
    triples.forEach(triple => {
      [triple.subject, triple.object].forEach(concept => {
        if (!conceptTimelines[concept]) {
          conceptTimelines[concept] = [];
        }
        conceptTimelines[concept].push({
          timestamp: triple.timestamp,
          context: triple,
          fitness: triple.survivalFitness
        });
      });
    });

    Object.entries(conceptTimelines).forEach(([concept, timeline]) => {
      timeline.sort((a, b) => a.timestamp - b.timestamp);
      
      evolution.conceptEmergence[concept] = timeline[0].timestamp;
      evolution.conceptEvolution[concept] = {
        firstAppearance: timeline[0].timestamp,
        lastAppearance: timeline[timeline.length - 1].timestamp,
        appearances: timeline.length,
        averageFitness: timeline.reduce((sum, t) => sum + t.fitness, 0) / timeline.length,
        evolutionTrend: this.calculateEvolutionTrend(timeline)
      };
    });

    return evolution;
  }

  calculateEvolutionTrend(timeline) {
    if (timeline.length < 3) return 'insufficient_data';
    
    const firstHalf = timeline.slice(0, Math.floor(timeline.length / 2));
    const secondHalf = timeline.slice(Math.floor(timeline.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, t) => sum + t.fitness, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, t) => sum + t.fitness, 0) / secondHalf.length;
    
    const change = secondAvg - firstAvg;
    
    if (change > 0.1) return 'strengthening';
    if (change < -0.1) return 'weakening';
    return 'stable';
  }

  async detectEnhancedAxiomaticRelationships() {
    const axioms = [];
    const triples = this.extractedKnowledge.triples;
    
    // Enhanced axiomatic detection based on multiple criteria
    const subjectGroups = {};
    triples.forEach(triple => {
      if (!subjectGroups[triple.subject]) {
        subjectGroups[triple.subject] = [];
      }
      subjectGroups[triple.subject].push(triple);
    });

    Object.entries(subjectGroups).forEach(([subject, subjectTriples]) => {
      if (subjectTriples.length >= 3) { // Stronger threshold for axioms
        const avgConfidence = subjectTriples.reduce((sum, t) => sum + t.confidence, 0) / subjectTriples.length;
        const avgSurvival = subjectTriples.reduce((sum, t) => sum + t.survivalFitness, 0) / subjectTriples.length;
        const categoryDiversity = new Set(subjectTriples.map(t => t.category)).size;
        
        if (avgConfidence > 0.75 && avgSurvival > 0.6 && categoryDiversity >= 2) {
          axioms.push({
            id: `enhanced-axiom-${subject.toLowerCase().replace(/[^a-z]/g, '-')}`,
            statement: `${subject} demonstrates fundamental axiomatic properties across multiple domains`,
            relatedTriples: subjectTriples.map(t => t.id),
            strength: (avgConfidence + avgSurvival) / 2,
            confidence: avgConfidence,
            survivalFitness: avgSurvival,
            categoryDiversity: categoryDiversity,
            category: this.categorizeAxiom(subject),
            guidingStarAlignment: this.alignWithGuidingStar(subject),
            crossFileStrength: new Set(subjectTriples.map(t => t.sourceDocument)).size,
            temporalSpan: this.calculateTemporalSpan(subjectTriples)
          });
        }
      }
    });

    return axioms.sort((a, b) => b.strength - a.strength);
  }

  calculateTemporalSpan(triples) {
    const timestamps = triples.map(t => t.timestamp).sort();
    const earliest = timestamps[0];
    const latest = timestamps[timestamps.length - 1];
    return {
      earliest: earliest,
      latest: latest,
      spanDays: (latest - earliest) / (1000 * 60 * 60 * 24),
      persistence: timestamps.length > 1 ? 'persistent' : 'singular'
    };
  }

  categorizeAxiom(subject) {
    const s = subject.toLowerCase();
    if (s.includes('sacred') || s.includes('geometry') || s.includes('phi')) return 'mathematical';
    if (s.includes('knowledge') || s.includes('trie')) return 'epistemological';
    if (s.includes('personality') || s.includes('myers')) return 'psychological';
    if (s.includes('consciousness') || s.includes('meta')) return 'metaphysical';
    if (s.includes('protocol') || s.includes('system')) return 'systemic';
    if (s.includes('economic') || s.includes('attention')) return 'economic';
    if (s.includes('academic') || s.includes('thesis')) return 'academic';
    return 'general';
  }

  alignWithGuidingStar(subject) {
    const s = subject.toLowerCase();
    if (s.includes('freedom') || s.includes('liberation')) return 'freedom';
    if (s.includes('autonomy') || s.includes('independent')) return 'autonomy';
    if (s.includes('mutual') || s.includes('cooperation') || s.includes('reciprocity')) return 'reciprocity';
    if (s.includes('sovereignty') || s.includes('community')) return 'sovereignty';
    return 'universal';
  }

  async applyEnhancedConwaysEvolution() {
    console.log('   🧬 Enhanced Conway\'s Game of Life knowledge evolution...');
    
    const triples = this.extractedKnowledge.triples;
    let survivedTriples = [];
    let generationStats = [];

    // Enhanced Conway's Rules for knowledge evolution
    triples.forEach(triple => {
      const connections = this.findEnhancedKnowledgeConnections(triple, triples);
      let newSurvivalFitness = triple.survivalFitness;
      let evolutionReason = '';

      // Enhanced Conway rules with sacred geometry influence
      if (connections.length < 2) {
        // Isolation - but sacred geometry concepts get survival bonus
        newSurvivalFitness *= triple.category === 'mathematical' ? 0.6 : 0.3;
        evolutionReason = 'isolation';
      } else if (connections.length >= 2 && connections.length <= 3) {
        // Optimal survival range - enhanced with phi
        const phiBonus = triple.category === 'mathematical' ? PHI / 5 : 1.0;
        newSurvivalFitness = Math.min(1.0, newSurvivalFitness * 1.2 * phiBonus);
        evolutionReason = 'optimal_survival';
      } else if (connections.length === 4 || connections.length === 5) {
        // Moderate overcrowding - still survivable
        newSurvivalFitness *= 0.85;
        evolutionReason = 'moderate_crowding';
      } else if (connections.length > 5) {
        // Severe overcrowding
        newSurvivalFitness *= 0.4;
        evolutionReason = 'severe_crowding';
      }

      // Cross-file bonus (concepts that span multiple files are stronger)
      const crossFileBonus = connections.filter(c => c.sourceDocument !== triple.sourceDocument).length > 0 ? 1.15 : 1.0;
      newSurvivalFitness *= crossFileBonus;

      if (newSurvivalFitness > 0.25) { // Lower survival threshold for enhanced analysis
        survivedTriples.push({
          ...triple,
          survivalFitness: newSurvivalFitness,
          connections: connections.length,
          evolutionReason: evolutionReason,
          crossFileConnections: connections.filter(c => c.sourceDocument !== triple.sourceDocument).length,
          generation: 1
        });
      }
    });

    generationStats.push({
      generation: 1,
      inputCount: triples.length,
      survivorCount: survivedTriples.length,
      survivalRate: survivedTriples.length / triples.length,
      averageFitness: survivedTriples.reduce((sum, t) => sum + t.survivalFitness, 0) / survivedTriples.length
    });

    console.log(`   💀 Enhanced evolution: ${triples.length} → ${survivedTriples.length} survived`);
    console.log(`   📊 Survival rate: ${(100 * survivedTriples.length / triples.length).toFixed(1)}%`);

    return {
      survivedTriples: survivedTriples,
      generationStats: generationStats,
      evolutionMetrics: this.calculateEvolutionMetrics(survivedTriples)
    };
  }

  findEnhancedKnowledgeConnections(triple, allTriples) {
    return allTriples.filter(other => {
      if (other.id === triple.id) return false;
      
      // Direct subject/object connections
      if (other.subject === triple.subject ||
          other.object === triple.object ||
          other.subject === triple.object ||
          other.object === triple.subject) {
        return true;
      }
      
      // Category-based connections
      if (other.category === triple.category && 
          other.sourceDocument !== triple.sourceDocument) {
        return true;
      }
      
      // Semantic similarity connections (simple approach)
      const semantic = this.calculateSemanticSimilarity(triple, other);
      return semantic > 0.7;
    });
  }

  calculateSemanticSimilarity(triple1, triple2) {
    const words1 = new Set([...triple1.subject.toLowerCase().split(' '), ...triple1.object.toLowerCase().split(' ')]);
    const words2 = new Set([...triple2.subject.toLowerCase().split(' '), ...triple2.object.toLowerCase().split(' ')]);
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  calculateEvolutionMetrics(survivedTriples) {
    const categories = {};
    const documents = {};
    
    survivedTriples.forEach(triple => {
      // Category metrics
      if (!categories[triple.category]) {
        categories[triple.category] = { count: 0, totalFitness: 0 };
      }
      categories[triple.category].count++;
      categories[triple.category].totalFitness += triple.survivalFitness;
      
      // Document metrics
      if (!documents[triple.sourceDocument]) {
        documents[triple.sourceDocument] = { count: 0, totalFitness: 0 };
      }
      documents[triple.sourceDocument].count++;
      documents[triple.sourceDocument].totalFitness += triple.survivalFitness;
    });
    
    // Calculate averages
    Object.keys(categories).forEach(category => {
      categories[category].averageFitness = categories[category].totalFitness / categories[category].count;
    });
    
    Object.keys(documents).forEach(doc => {
      documents[doc].averageFitness = documents[doc].totalFitness / documents[doc].count;
    });
    
    return {
      categoryDistribution: categories,
      documentDistribution: documents,
      totalSurvivors: survivedTriples.length,
      averageConnections: survivedTriples.reduce((sum, t) => sum + t.connections, 0) / survivedTriples.length,
      crossFileTriples: survivedTriples.filter(t => t.crossFileConnections > 0).length
    };
  }

  async computeHarmonicSignatures() {
    console.log('   📐 Computing harmonic signatures...');
    
    const signatures = [];
    const triples = this.extractedKnowledge.triples;
    const categories = [...new Set(triples.map(t => t.category))];
    
    categories.forEach(category => {
      const categoryTriples = triples.filter(t => t.category === category);
      const harmonic = this.calculateCategoryHarmonic(categoryTriples);
      
      signatures.push({
        category: category,
        tripleCount: categoryTriples.length,
        harmonicFrequency: harmonic.frequency,
        phiAlignment: harmonic.phiAlignment,
        resonanceStrength: harmonic.resonance,
        coherenceIndex: harmonic.coherence
      });
    });
    
    // Calculate overall system harmonic
    const overallHarmonic = this.calculateOverallSystemHarmonic(signatures);
    signatures.unshift({
      category: 'SYSTEM_OVERALL',
      ...overallHarmonic
    });
    
    return signatures;
  }

  calculateCategoryHarmonic(triples) {
    if (triples.length === 0) return { frequency: 0, phiAlignment: 0, resonance: 0, coherence: 0 };
    
    const avgFitness = triples.reduce((sum, t) => sum + t.survivalFitness, 0) / triples.length;
    const avgConnections = triples.reduce((sum, t) => sum + (t.connections || 0), 0) / triples.length;
    
    // Sacred geometry calculations
    const frequency = avgFitness * PHI;
    const phiAlignment = Math.abs(avgConnections - PHI) < 0.5 ? 1.0 : 1.0 - Math.abs(avgConnections - PHI) / PHI;
    const resonance = avgFitness * phiAlignment;
    const coherence = (frequency + phiAlignment + resonance) / 3;
    
    return {
      frequency: frequency,
      phiAlignment: phiAlignment,
      resonance: resonance,
      coherence: coherence
    };
  }

  calculateOverallSystemHarmonic(signatures) {
    const categorySignatures = signatures.filter(s => s.category !== 'SYSTEM_OVERALL');
    
    if (categorySignatures.length === 0) {
      return { frequency: 0, phiAlignment: 0, resonanceStrength: 0, coherenceIndex: 0 };
    }
    
    const totalTriples = categorySignatures.reduce((sum, s) => sum + s.tripleCount, 0);
    
    // Weighted averages based on triple count
    const weightedFrequency = categorySignatures.reduce((sum, s) => 
      sum + (s.harmonicFrequency * s.tripleCount), 0) / totalTriples;
    
    const weightedPhiAlignment = categorySignatures.reduce((sum, s) => 
      sum + (s.phiAlignment * s.tripleCount), 0) / totalTriples;
    
    const weightedResonance = categorySignatures.reduce((sum, s) => 
      sum + (s.resonanceStrength * s.tripleCount), 0) / totalTriples;
    
    const weightedCoherence = categorySignatures.reduce((sum, s) => 
      sum + (s.coherenceIndex * s.tripleCount), 0) / totalTriples;
    
    return {
      tripleCount: totalTriples,
      harmonicFrequency: weightedFrequency,
      phiAlignment: weightedPhiAlignment,
      resonanceStrength: weightedResonance,
      coherenceIndex: weightedCoherence,
      categoryCount: categorySignatures.length
    };
  }

  async identifyRevolutionaryPatterns(document) {
    // Same as original but enhanced
    const patterns = [];
    const content = document.content.toLowerCase();

    const revolutionaryCategories = {
      anarcho_syndicalist: [
        'anarcho-syndicalist', 'mutual aid', 'direct democracy', 
        'cooperative', 'commons', 'horizontal organization', 'worker control'
      ],
      economic_democracy: [
        'economic democracy', 'attention token', 'knowledge-backed currency',
        'wealth redistribution', 'decentralized finance', 'cooperative economics'
      ],
      consciousness_evolution: [
        'consciousness development', 'dimensional consciousness', 'meta observer',
        'spiritual technology', 'sacred geometry', 'divine human collaboration'
      ],
      earth_stewardship: [
        'earth stewardship', 'regenerative', 'ecological economics',
        'sustainability', 'environmental care', 'rights of nature'
      ]
    };
    
    Object.entries(revolutionaryCategories).forEach(([category, categoryPatterns]) => {
      categoryPatterns.forEach(pattern => {
        if (content.includes(pattern)) {
          patterns.push({
            type: category,
            pattern: pattern,
            context: this.extractContext(content, pattern),
            document: document.path,
            commit: document.commit,
            timestamp: document.timestamp,
            confidence: 0.9
          });
        }
      });
    });

    return patterns;
  }

  async classifyByGuidingStarPrinciples(document) {
    // Enhanced version of original
    const principles = {
      freedom: [],
      autonomy: [],
      reciprocity: [],
      sovereignty: []
    };
    
    const content = document.content.toLowerCase();
    const enhancedPatterns = {
      freedom: /freedom|liberation|voluntary|choice|agency|liberty|emancipation/gi,
      autonomy: /autonomy|self-govern|independent|decentralized|self-determination/gi,
      reciprocity: /reciprocity|mutual.*aid|cooperation|sharing|collaboration|solidarity/gi,
      sovereignty: /sovereignty|community.*control|local.*power|commons|self-rule/gi
    };

    Object.entries(enhancedPatterns).forEach(([principle, pattern]) => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        principles[principle].push({
          concept: `${principle} expression`,
          match: match[0],
          context: this.extractContext(content, match[0]),
          document: document.path,
          commit: document.commit,
          timestamp: document.timestamp
        });
      }
    });

    return principles;
  }

  mergeGuidingStarPrinciples(principles) {
    Object.keys(principles).forEach(key => {
      this.extractedKnowledge.guidingStarPrinciples[key].push(...principles[key]);
    });
  }

  generateEnhancedKnowledgeReport() {
    const report = {
      excavationSummary: {
        processedCommits: this.processedCommits,
        totalTriples: this.extractedKnowledge.triples.length,
        survivedTriples: this.extractedKnowledge.triples.filter(t => t.generation).length,
        totalAxioms: this.extractedKnowledge.axioms.length,
        revolutionaryPatterns: this.extractedKnowledge.revolutionaryPatterns.length,
        crossFileRelationships: this.extractedKnowledge.crossFileRelationships.length,
        manuscriptConnections: this.extractedKnowledge.manuscriptConnections.length,
        codeKnowledgeIntegrations: this.extractedKnowledge.codeKnowledgeIntegration.length,
        guidingStarPrinciples: Object.values(this.extractedKnowledge.guidingStarPrinciples)
          .reduce((sum, arr) => sum + arr.length, 0),
        harmonicSignatures: this.extractedKnowledge.harmonicSignatures.length
      },
      
      // Top discoveries
      topKnowledgeTriples: this.extractedKnowledge.triples
        .sort((a, b) => b.survivalFitness - a.survivalFitness)
        .slice(0, 30),
      
      strongestAxioms: this.extractedKnowledge.axioms
        .sort((a, b) => b.strength - a.strength)
        .slice(0, 15),
      
      keyRevolutionaryInsights: this.extractedKnowledge.revolutionaryPatterns
        .slice(0, 20),
      
      criticalCrossFileRelationships: this.extractedKnowledge.crossFileRelationships
        .slice(0, 15),
      
      harmonicAnalysis: this.extractedKnowledge.harmonicSignatures,
      
      temporalEvolution: this.extractedKnowledge.temporalEvolution,
      
      guidingStarAlignment: this.extractedKnowledge.guidingStarPrinciples,
      
      manuscriptIntegration: this.extractedKnowledge.manuscriptConnections.slice(0, 20),
      
      codeImplementationAnalysis: this.extractedKnowledge.codeKnowledgeIntegration.slice(0, 20),
      
      enhancedRecommendations: this.generateEnhancedRecommendations()
    };

    return report;
  }

  generateEnhancedRecommendations() {
    const harmonicSignature = this.extractedKnowledge.harmonicSignatures.find(s => s.category === 'SYSTEM_OVERALL');
    const coherence = harmonicSignature ? harmonicSignature.coherenceIndex : 0;
    
    return [
      `🎼 System harmonic coherence: ${(coherence * 100).toFixed(1)}% - ${coherence > 0.7 ? 'EXCELLENT' : 'NEEDS IMPROVEMENT'}`,
      '🏛️ Rebuild P2P marketplace using extracted attention token patterns with sacred geometry optimization',
      '🧠 Integrate consciousness development system with enhanced dimensional assessment',
      '📐 Apply discovered sacred geometry principles to all system calculations',
      '🌱 Implement enhanced Conway evolution for living knowledge system',
      '🤝 Build revolutionary networks based on anarcho-syndicalist patterns',
      '🔗 Strengthen cross-file relationships for better system integration',
      '📚 Complete manuscript-to-implementation integration for academic validation',
      '⚡ Optimize system performance using harmonic resonance principles',
      '🌍 Scale community networks using discovered sovereignty patterns'
    ];
  }
}

// Execute the enhanced recursive archaeological excavation
async function main() {
  const archaeologist = new EnhancedRecursiveKnowledgeArchaeologist();
  
  try {
    const report = await archaeologist.excavateCompleteRepositoryRecursive();
    
    console.log('\n🎉 ENHANCED RECURSIVE EXCAVATION COMPLETE!');
    console.log('===========================================\n');
    
    console.log('📊 COMPREHENSIVE EXCAVATION SUMMARY:');
    console.log(`   Processed Commits: ${report.excavationSummary.processedCommits}`);
    console.log(`   Total Knowledge Triples: ${report.excavationSummary.totalTriples}`);
    console.log(`   Survived Evolution: ${report.excavationSummary.survivedTriples}`);
    console.log(`   Axiomatic Foundations: ${report.excavationSummary.totalAxioms}`);
    console.log(`   Revolutionary Patterns: ${report.excavationSummary.revolutionaryPatterns}`);
    console.log(`   Cross-File Relationships: ${report.excavationSummary.crossFileRelationships}`);
    console.log(`   Manuscript Connections: ${report.excavationSummary.manuscriptConnections}`);
    console.log(`   Code Integrations: ${report.excavationSummary.codeKnowledgeIntegrations}`);
    console.log(`   Guiding Star References: ${report.excavationSummary.guidingStarPrinciples}`);
    console.log(`   Harmonic Signatures: ${report.excavationSummary.harmonicSignatures}\n`);
    
    console.log('📐 HARMONIC ANALYSIS:');
    report.harmonicAnalysis.forEach((harmonic, i) => {
      console.log(`   ${i+1}. ${harmonic.category}: ${(harmonic.coherenceIndex * 100).toFixed(1)}% coherence`);
      if (harmonic.category === 'SYSTEM_OVERALL') {
        console.log(`      🎼 OVERALL SYSTEM HARMONIC: ${(harmonic.harmonicFrequency).toFixed(3)}Φ`);
      }
    });
    
    console.log('\n🌟 TOP SURVIVING KNOWLEDGE TRIPLES:');
    report.topKnowledgeTriples.slice(0, 15).forEach((triple, i) => {
      console.log(`   ${i+1}. ${triple.subject} → ${triple.predicate} → ${triple.object}`);
      console.log(`      Fitness: ${triple.survivalFitness.toFixed(3)}, Category: ${triple.category}`);
      console.log(`      Connections: ${triple.connections || 0}, Source: ${triple.sourceDocument.split('/').pop()}`);
    });
    
    console.log('\n🧮 STRONGEST AXIOMATIC FOUNDATIONS:');
    report.strongestAxioms.slice(0, 10).forEach((axiom, i) => {
      console.log(`   ${i+1}. ${axiom.statement}`);
      console.log(`      Strength: ${axiom.strength.toFixed(3)}, Category: ${axiom.category}`);
      console.log(`      Cross-File Strength: ${axiom.crossFileStrength}, Guiding Star: ${axiom.guidingStarAlignment}`);
    });
    
    console.log('\n🔗 CRITICAL CROSS-FILE RELATIONSHIPS:');
    report.criticalCrossFileRelationships.slice(0, 10).forEach((rel, i) => {
      console.log(`   ${i+1}. ${rel.concept} (${rel.type})`);
      console.log(`      Files: ${rel.files.length}, Strength: ${rel.strength.toFixed(3)}`);
      console.log(`      Triples: ${rel.triplesCount}`);
    });
    
    console.log('\n📋 ENHANCED RECOMMENDATIONS:');
    report.enhancedRecommendations.forEach((rec, i) => {
      console.log(`   ${i+1}. ${rec}`);
    });
    
    // Save comprehensive report
    fs.writeFileSync('enhanced-recursive-knowledge-report.json', JSON.stringify(report, null, 2));
    console.log('\n💾 Complete enhanced report saved to: enhanced-recursive-knowledge-report.json');
    
    console.log('\n🌌 ENHANCED RECURSIVE KNOWLEDGE EXCAVATION COMPLETE!');
    console.log('🚀 Ready for advanced manuscript generation with COMPLETE knowledge base!');
    
  } catch (error) {
    console.error('❌ Enhanced excavation error:', error);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { EnhancedRecursiveKnowledgeArchaeologist };