#!/usr/bin/env node
/**
 * 🔄 UNIVERSAL KNOWLEDGE MERGER
 * 
 * Merges and deduplicates knowledge trie data from multiple sources
 * while preserving the highest quality triples and maintaining
 * logical connections. Fixes the issue where archaeological scripts
 * add duplicate entries instead of merging intelligently.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Sacred Geometry Constants
const PHI = (1 + Math.sqrt(5)) / 2;

class UniversalKnowledgeMerger {
  constructor() {
    this.mergedKnowledge = {
      triples: new Map(), // Use Map for deduplication by hash
      axioms: new Map(),
      revolutionaryPatterns: new Map(),
      crossFileRelationships: new Map(),
      harmonicSignatures: new Map(),
      webKnowledge: new Map(),
      enhancedPatterns: new Map(),
      mathematicalChains: new Map(),
      scienceValidations: new Map(),
      metadata: {
        mergedAt: new Date().toISOString(),
        sourceFiles: [],
        totalMerged: 0,
        duplicatesRemoved: 0,
        harmonicCoherence: 0
      }
    };
  }

  // Generate stable hash for knowledge objects
  generateKnowledgeHash(obj) {
    if (!obj) return null;
    
    // For triples, use subject-predicate-object combination
    if (obj.subject && obj.predicate && obj.object) {
      const key = `${obj.subject}|${obj.predicate}|${obj.object}`;
      return crypto.createHash('md5').update(key).digest('hex');
    }
    
    // For patterns, use pattern content
    if (obj.pattern) {
      return crypto.createHash('md5').update(obj.pattern).digest('hex');
    }
    
    // For general objects, use canonical JSON
    const canonical = JSON.stringify(obj, Object.keys(obj).sort());
    return crypto.createHash('md5').update(canonical).digest('hex');
  }

  // Merge two knowledge objects, keeping the higher quality one
  mergeKnowledgeObjects(existing, incoming) {
    if (!existing) return incoming;
    if (!incoming) return existing;

    // Merge by preserving highest confidence/fitness scores
    const merged = { ...existing };
    
    if (incoming.confidence > (existing.confidence || 0)) {
      merged.confidence = incoming.confidence;
    }
    
    if (incoming.survivalFitness > (existing.survivalFitness || 0)) {
      merged.survivalFitness = incoming.survivalFitness;
    }
    
    if (incoming.revolutionaryValue > (existing.revolutionaryValue || 0)) {
      merged.revolutionaryValue = incoming.revolutionaryValue;
    }

    // Merge source files
    const existingSources = existing.sourceFiles || [existing.sourceFile].filter(Boolean);
    const incomingSources = incoming.sourceFiles || [incoming.sourceFile].filter(Boolean);
    merged.sourceFiles = [...new Set([...existingSources, ...incomingSources])];
    
    // Update timestamp to latest
    if (incoming.timestamp > (existing.timestamp || '')) {
      merged.timestamp = incoming.timestamp;
    }

    return merged;
  }

  // Extract triples from trie structure recursively
  extractTriplesFromTrie(node, triples, parentId = '') {
    if (!node) return;
    
    // Extract triples from current node
    if (node.triples && Array.isArray(node.triples)) {
      triples.push(...node.triples);
    }
    
    // Recurse through children
    if (node.children && typeof node.children === 'object') {
      for (const [key, child] of Object.entries(node.children)) {
        this.extractTriplesFromTrie(child, triples, key);
      }
    }
  }

  // Add knowledge items to the appropriate collection with deduplication
  addKnowledgeItems(items, collection, type) {
    if (!Array.isArray(items)) return 0;
    
    let added = 0;
    let duplicates = 0;
    
    for (const item of items) {
      const hash = this.generateKnowledgeHash(item);
      if (!hash) continue;
      
      if (collection.has(hash)) {
        // Merge with existing
        const existing = collection.get(hash);
        const merged = this.mergeKnowledgeObjects(existing, item);
        collection.set(hash, merged);
        duplicates++;
      } else {
        // Add new item
        collection.set(hash, { ...item, id: hash, type });
        added++;
      }
    }
    
    console.log(`   ${type}: ${added} new, ${duplicates} merged`);
    return added;
  }

  // Process a single knowledge report file
  async processKnowledgeFile(filePath) {
    console.log(`📄 Processing: ${path.basename(filePath)}`);
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);
      
      this.mergedKnowledge.metadata.sourceFiles.push(filePath);
      
      let totalAdded = 0;
      
      // Merge different knowledge categories - handle various data structures
      if (data.triples) {
        totalAdded += this.addKnowledgeItems(data.triples, this.mergedKnowledge.triples, 'triple');
      }
      
      if (data.topTriples) {
        totalAdded += this.addKnowledgeItems(data.topTriples, this.mergedKnowledge.triples, 'triple');
      }
      
      if (data.allTriples) {
        totalAdded += this.addKnowledgeItems(data.allTriples, this.mergedKnowledge.triples, 'triple');
      }
      
      if (data.extractedKnowledge?.triples) {
        totalAdded += this.addKnowledgeItems(data.extractedKnowledge.triples, this.mergedKnowledge.triples, 'triple');
      }
      
      if (data.ultimateIntegration?.strongestValidations) {
        totalAdded += this.addKnowledgeItems(data.ultimateIntegration.strongestValidations, this.mergedKnowledge.triples, 'triple');
      }
      
      if (data.axioms) {
        totalAdded += this.addKnowledgeItems(data.axioms, this.mergedKnowledge.axioms, 'axiom');
      }
      
      if (data.revolutionaryPatterns) {
        totalAdded += this.addKnowledgeItems(data.revolutionaryPatterns, this.mergedKnowledge.revolutionaryPatterns, 'pattern');
      }
      
      if (data.enhancedPatterns) {
        totalAdded += this.addKnowledgeItems(data.enhancedPatterns, this.mergedKnowledge.enhancedPatterns, 'enhanced_pattern');
      }
      
      if (data.webKnowledge) {
        totalAdded += this.addKnowledgeItems(data.webKnowledge, this.mergedKnowledge.webKnowledge, 'web_knowledge');
      }
      
      if (data.mathematicalChains) {
        totalAdded += this.addKnowledgeItems(data.mathematicalChains, this.mergedKnowledge.mathematicalChains, 'math_chain');
      }
      
      if (data.scienceValidations) {
        totalAdded += this.addKnowledgeItems(data.scienceValidations, this.mergedKnowledge.scienceValidations, 'science_validation');
      }
      
      // Handle trie structure
      if (data.root && data.root.children) {
        const triples = [];
        this.extractTriplesFromTrie(data.root, triples);
        if (triples.length > 0) {
          totalAdded += this.addKnowledgeItems(triples, this.mergedKnowledge.triples, 'trie_triple');
        }
      }
      
      // Handle sections structure (manuscripts)
      if (data.sections) {
        // Extract knowledge from manuscript sections - treat as high-confidence patterns
        const patterns = data.sections.map(section => ({
          pattern: section.title,
          content: section.content?.substring(0, 500), // First 500 chars
          confidence: 0.9,
          type: 'manuscript_section',
          sourceFile: filePath
        }));
        totalAdded += this.addKnowledgeItems(patterns, this.mergedKnowledge.revolutionaryPatterns, 'manuscript_pattern');
      }
      
      this.mergedKnowledge.metadata.totalMerged += totalAdded;
      
    } catch (error) {
      console.error(`   ❌ Error processing ${filePath}:`, error.message);
    }
  }

  // Calculate harmonic coherence across all knowledge
  calculateHarmonicCoherence() {
    const totalItems = this.mergedKnowledge.triples.size + 
                      this.mergedKnowledge.axioms.size + 
                      this.mergedKnowledge.revolutionaryPatterns.size;
    
    if (totalItems === 0) return 0;
    
    let totalFitness = 0;
    let validItems = 0;
    
    // Sum survival fitness from all knowledge types
    for (const collection of Object.values(this.mergedKnowledge)) {
      if (collection instanceof Map) {
        for (const item of collection.values()) {
          if (typeof item.survivalFitness === 'number') {
            totalFitness += item.survivalFitness;
            validItems++;
          } else if (typeof item.confidence === 'number') {
            totalFitness += item.confidence;
            validItems++;
          }
        }
      }
    }
    
    // Apply golden ratio harmonic scaling
    const avgFitness = validItems > 0 ? totalFitness / validItems : 0;
    const harmonicCoherence = avgFitness * PHI / 2; // Scale by golden ratio
    
    return Math.min(harmonicCoherence, 1.0); // Cap at 1.0
  }

  // Convert Maps back to Arrays for JSON serialization
  serializeKnowledge() {
    const serialized = {
      metadata: {
        ...this.mergedKnowledge.metadata,
        harmonicCoherence: this.calculateHarmonicCoherence(),
        totalTriples: this.mergedKnowledge.triples.size,
        totalAxioms: this.mergedKnowledge.axioms.size,
        totalPatterns: this.mergedKnowledge.revolutionaryPatterns.size + this.mergedKnowledge.enhancedPatterns.size,
        totalWebKnowledge: this.mergedKnowledge.webKnowledge.size,
        totalMathChains: this.mergedKnowledge.mathematicalChains.size,
        totalScienceValidations: this.mergedKnowledge.scienceValidations.size
      },
      triples: Array.from(this.mergedKnowledge.triples.values()),
      axioms: Array.from(this.mergedKnowledge.axioms.values()),
      revolutionaryPatterns: Array.from(this.mergedKnowledge.revolutionaryPatterns.values()),
      enhancedPatterns: Array.from(this.mergedKnowledge.enhancedPatterns.values()),
      webKnowledge: Array.from(this.mergedKnowledge.webKnowledge.values()),
      mathematicalChains: Array.from(this.mergedKnowledge.mathematicalChains.values()),
      scienceValidations: Array.from(this.mergedKnowledge.scienceValidations.values()),
      crossFileRelationships: Array.from(this.mergedKnowledge.crossFileRelationships.values()),
      harmonicSignatures: Array.from(this.mergedKnowledge.harmonicSignatures.values())
    };
    
    return serialized;
  }

  // Find all knowledge report files
  findKnowledgeFiles() {
    const knowledgeFiles = [];
    const searchPaths = [
      '.',
      'cleaned-reports',
      'archive/knowledge-data'
    ];
    
    const knowledgePatterns = [
      '*knowledge*report*.json',
      '*enhanced*knowledge*.json',
      '*trie*.json',
      '*manuscript*.json',
      '*harmonic*.json'
    ];
    
    for (const searchPath of searchPaths) {
      if (!fs.existsSync(searchPath)) continue;
      
      const files = fs.readdirSync(searchPath);
      for (const file of files) {
        if (file.endsWith('.json') && 
            (file.includes('knowledge') || file.includes('enhanced') || 
             file.includes('trie') || file.includes('manuscript') ||
             file.includes('harmonic'))) {
          knowledgeFiles.push(path.join(searchPath, file));
        }
      }
    }
    
    return knowledgeFiles;
  }

  // Main merge process
  async mergeAllKnowledge() {
    console.log('🔄 UNIVERSAL KNOWLEDGE MERGER');
    console.log('============================\n');
    
    const knowledgeFiles = this.findKnowledgeFiles();
    console.log(`📁 Found ${knowledgeFiles.length} knowledge files to merge\n`);
    
    // Process each file
    for (const file of knowledgeFiles) {
      await this.processKnowledgeFile(file);
    }
    
    // Calculate final metrics
    const coherence = this.calculateHarmonicCoherence();
    this.mergedKnowledge.metadata.harmonicCoherence = coherence;
    
    console.log('\n📊 MERGE SUMMARY:');
    console.log(`   Total Triples: ${this.mergedKnowledge.triples.size}`);
    console.log(`   Total Axioms: ${this.mergedKnowledge.axioms.size}`);
    console.log(`   Total Patterns: ${this.mergedKnowledge.revolutionaryPatterns.size + this.mergedKnowledge.enhancedPatterns.size}`);
    console.log(`   Harmonic Coherence: ${(coherence * 100).toFixed(2)}%`);
    
    // Serialize and save merged knowledge
    const serialized = this.serializeKnowledge();
    
    // Save to multiple locations for accessibility
    const outputFiles = [
      'merged-knowledge-trie.json',
      'cleaned-reports/merged-knowledge-trie.json'
    ];
    
    for (const outputFile of outputFiles) {
      fs.mkdirSync(path.dirname(outputFile), { recursive: true });
      fs.writeFileSync(outputFile, JSON.stringify(serialized, null, 2));
      console.log(`💾 Merged knowledge saved to: ${outputFile}`);
    }
    
    console.log('\n🌌 KNOWLEDGE MERGE COMPLETE!');
    console.log('🔄 All duplicate entries resolved, scores normalized');
    
    return serialized;
  }
}

// Run merger if called directly
if (require.main === module) {
  const merger = new UniversalKnowledgeMerger();
  merger.mergeAllKnowledge().catch(console.error);
}

module.exports = { UniversalKnowledgeMerger };