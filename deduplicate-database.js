#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 Universal Life Protocol - Database Deduplication Tool');
console.log('🌟 Applying φ-aligned deduplication strategy\n');

const PHI = (1 + Math.sqrt(5)) / 2; // Golden Ratio

class PhiAlignedDeduplicator {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      totalEntries: 0,
      duplicatesRemoved: 0,
      φAlignmentImproved: 0
    };
  }

  deduplicateMergedTrie() {
    console.log('📁 Processing merged-knowledge-trie.json...');
    
    try {
      const data = JSON.parse(fs.readFileSync('merged-knowledge-trie.json', 'utf8'));
      
      // Remove undefined entries
      const beforeCount = data.triples.length;
      data.triples = data.triples.filter(t => 
        t.subject !== undefined && 
        t.predicate !== undefined && 
        t.object !== undefined &&
        t.subject && t.predicate && t.object
      );
      
      // Deduplicate by content while preserving highest φ-alignment
      const uniqueTriples = new Map();
      
      data.triples.forEach(triple => {
        const key = `${triple.subject}:${triple.predicate}:${triple.object}`;
        
        if (!uniqueTriples.has(key)) {
          uniqueTriples.set(key, triple);
        } else {
          const existing = uniqueTriples.get(key);
          
          // Keep the one with better φ-alignment
          const currentφScore = this.calculateφAlignment(triple);
          const existingφScore = this.calculateφAlignment(existing);
          
          if (currentφScore > existingφScore) {
            uniqueTriples.set(key, triple);
          }
        }
      });
      
      data.triples = Array.from(uniqueTriples.values());
      
      // Update metadata
      data.metadata.duplicatesRemoved = beforeCount - data.triples.length;
      data.metadata.harmonicCoherence = this.calculateHarmonicCoherence(data.triples);
      data.metadata.φAligned = true;
      data.metadata.deduplicationDate = new Date().toISOString();
      
      // Save deduplicated version
      fs.writeFileSync('merged-knowledge-trie-deduplicated.json', JSON.stringify(data, null, 2));
      
      console.log(`  ✅ Removed ${beforeCount - data.triples.length} duplicates`);
      console.log(`  📊 ${data.triples.length} unique triples remaining`);
      console.log(`  🌟 φ-alignment: ${data.metadata.harmonicCoherence.toFixed(6)}`);
      
      this.stats.filesProcessed++;
      this.stats.duplicatesRemoved += beforeCount - data.triples.length;
      
    } catch (error) {
      console.error('❌ Error processing merged-knowledge-trie.json:', error.message);
    }
  }

  deduplicateKnowledgeBase(filePath) {
    console.log(`\n📁 Processing ${filePath}...`);
    
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      if (!data.patterns || !Array.isArray(data.patterns)) {
        console.log('  ⚠️  No patterns array found, skipping');
        return;
      }
      
      const beforeCount = data.patterns.length;
      const uniquePatterns = new Map();
      
      data.patterns.forEach(pattern => {
        const key = `${pattern.subject || pattern.statement}:${pattern.predicate || 'statement'}:${pattern.object || pattern.category}`;
        
        if (!uniquePatterns.has(key)) {
          uniquePatterns.set(key, pattern);
        } else {
          const existing = uniquePatterns.get(key);
          
          // Keep the one with better properties
          const currentScore = this.scorePattern(pattern);
          const existingScore = this.scorePattern(existing);
          
          if (currentScore > existingScore) {
            uniquePatterns.set(key, pattern);
          }
        }
      });
      
      data.patterns = Array.from(uniquePatterns.values());
      
      // Update metadata with φ-alignment
      data.metadata.totalPatterns = data.patterns.length;
      data.metadata.duplicatesRemoved = beforeCount - data.patterns.length;
      data.metadata.φAlignment = this.calculateφAlignment(data);
      data.metadata.deduplicationDate = new Date().toISOString();
      data.metadata.harmonic_coherence = data.patterns.length * PHI / beforeCount; // φ-based efficiency
      
      // Save deduplicated version
      const outputPath = filePath.replace('.json', '-deduplicated.json');
      fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
      
      console.log(`  ✅ Removed ${beforeCount - data.patterns.length} duplicates`);
      console.log(`  📊 ${data.patterns.length} unique patterns remaining`);
      console.log(`  🌟 φ-efficiency: ${data.metadata.harmonic_coherence.toFixed(6)}`);
      console.log(`  💾 Saved to: ${outputPath}`);
      
      this.stats.filesProcessed++;
      this.stats.totalEntries += beforeCount;
      this.stats.duplicatesRemoved += beforeCount - data.patterns.length;
      
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  }

  calculateφAlignment(item) {
    let score = 0;
    
    // Confidence score aligned with φ
    if (item.confidence) {
      const φDiff = Math.abs(item.confidence - (1 / PHI)); // Target 0.618
      score += Math.max(0, 1 - φDiff);
    }
    
    // Revolutionary value alignment
    if (item.revolutionaryValue) {
      score += item.revolutionaryValue;
    }
    
    // Survival fitness φ-alignment
    if (item.survivalFitness) {
      const φAlignment = (item.survivalFitness * PHI) % 1;
      score += φAlignment;
    }
    
    // Connection count φ-factor
    if (item.connections) {
      const φFactor = (item.connections / 1618) % 1; // φ * 1000
      score += φFactor;
    }
    
    return score;
  }

  scorePattern(pattern) {
    let score = 0;
    
    // Prefer patterns with more metadata
    if (pattern.confidence) score += 1;
    if (pattern.revolutionaryValue) score += 2;
    if (pattern.survivalFitness) score += 1;
    if (pattern.timestamp) score += 0.5;
    if (pattern.sourceFiles && pattern.sourceFiles.length > 0) score += 1;
    
    // φ-alignment bonus
    score += this.calculateφAlignment(pattern);
    
    return score;
  }

  calculateHarmonicCoherence(triples) {
    if (!triples || triples.length === 0) return 0;
    
    let totalφAlignment = 0;
    let count = 0;
    
    triples.forEach(triple => {
      totalφAlignment += this.calculateφAlignment(triple);
      count++;
    });
    
    return count > 0 ? (totalφAlignment / count) * PHI : 0;
  }

  run() {
    console.log('🚀 Starting φ-aligned deduplication process...\n');
    
    // Deduplicate merged knowledge trie
    this.deduplicateMergedTrie();
    
    // Deduplicate large knowledge base files
    const knowledgeFiles = [
      'cleaned-reports/archive/knowledge-data/expanded-knowledge-base.json',
      'cleaned-reports/archive/knowledge-data/classical-expanded-knowledge.json',
      'cleaned-reports/archive/knowledge-data/revolutionary-knowledge-report.json'
    ];
    
    knowledgeFiles.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        this.deduplicateKnowledgeBase(filePath);
      } else {
        console.log(`⚠️  File not found: ${filePath}`);
      }
    });
    
    // Final statistics
    console.log('\n' + '='.repeat(60));
    console.log('🎯 DEDUPLICATION COMPLETE!');
    console.log('📊 STATISTICS:');
    console.log(`   Files processed: ${this.stats.filesProcessed}`);
    console.log(`   Total entries processed: ${this.stats.totalEntries}`);
    console.log(`   Duplicates removed: ${this.stats.duplicatesRemoved}`);
    
    if (this.stats.totalEntries > 0) {
      const efficiency = (this.stats.duplicatesRemoved / this.stats.totalEntries) * 100;
      const φEfficiency = efficiency * (1 / PHI); // φ-weighted efficiency
      console.log(`   Deduplication efficiency: ${efficiency.toFixed(2)}%`);
      console.log(`   φ-weighted efficiency: ${φEfficiency.toFixed(2)}%`);
    }
    
    console.log('\n🌟 φ-aligned database optimization complete!');
    console.log('📁 Deduplicated files created with "-deduplicated" suffix');
    console.log(`🔢 Golden Ratio (φ): ${PHI.toFixed(10)}`);
  }
}

// Run deduplication
const deduplicator = new PhiAlignedDeduplicator();
deduplicator.run();