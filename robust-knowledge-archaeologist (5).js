#!/usr/bin/env node

/**
 * 🧠 ROBUST KNOWLEDGE ARCHAEOLOGIST
 * 
 * Fixed version that handles files with special characters
 * Focus on existing, accessible files for knowledge extraction
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Sacred Geometry Constants
const PHI = (1 + Math.sqrt(5)) / 2;

class RobustKnowledgeArchaeologist {
  constructor() {
    this.extractedKnowledge = {
      triples: [],
      axioms: [],
      revolutionaryPatterns: [],
      crossFileRelationships: [],
      harmonicSignatures: []
    };
    this.processedFiles = 0;
  }

  async excavateAccessibleFiles() {
    console.log('🧠 ROBUST KNOWLEDGE ARCHAEOLOGIST');
    console.log('==================================\n');

    // Phase 1: Find all accessible files in current working directory
    console.log('📁 Scanning current directory for accessible files...');
    const accessibleFiles = await this.findAccessibleFiles();
    console.log(`📄 Found ${accessibleFiles.length} accessible files\n`);

    // Phase 2: Extract knowledge from accessible files
    console.log('⛏️  Extracting knowledge from accessible files...\n');
    
    for (let i = 0; i < accessibleFiles.length; i++) {
      const file = accessibleFiles[i];
      try {
        const triples = await this.extractKnowledgeTriplesFromFile(file);
        this.extractedKnowledge.triples.push(...triples);
        
        const revolutionary = await this.identifyRevolutionaryPatternsInFile(file);
        this.extractedKnowledge.revolutionaryPatterns.push(...revolutionary);
        
        this.processedFiles++;
        
        if (i % 10 === 0) {
          console.log(`   📖 Processed: ${i+1}/${accessibleFiles.length} files`);
        }
      } catch (error) {
        console.warn(`   ⚠️  Skipped ${file.path}: ${error.message}`);
      }
    }

    // Phase 3: Analyze relationships
    console.log('\n🔗 Analyzing cross-file relationships...');
    this.extractedKnowledge.crossFileRelationships = await this.discoverCrossFileRelationships();

    // Phase 4: Conway Evolution
    console.log('🧬 Applying Conway evolution...');
    const evolved = await this.applyConwayEvolution();

    // Phase 5: Harmonic Analysis
    console.log('📐 Computing harmonic signatures...');
    this.extractedKnowledge.harmonicSignatures = await this.computeHarmonicSignatures();

    return this.generateReport();
  }

  async findAccessibleFiles() {
    const files = [];
    
    // Get files from current directory recursively
    try {
      const findCommand = 'find . -name "*.js" -o -name "*.md" -o -name "*.json" -o -name "*.txt" -o -name "*.ts" | grep -v node_modules | head -100';
      const output = execSync(findCommand, { encoding: 'utf8' });
      
      const filePaths = output.split('\n').filter(line => line.trim());
      
      for (const filePath of filePaths) {
        try {
          const stats = fs.statSync(filePath);
          if (stats.isFile() && stats.size > 50 && stats.size < 500000) {
            const content = fs.readFileSync(filePath, 'utf8');
            files.push({
              path: filePath,
              content: content,
              size: stats.size,
              modified: stats.mtime,
              type: this.classifyFileType(filePath)
            });
          }
        } catch (error) {
          // Skip files we can't read
          continue;
        }
      }
    } catch (error) {
      console.warn('Error finding files:', error.message);
    }

    return files;
  }

  classifyFileType(filePath) {
    if (filePath.match(/\.md$/i)) return 'markdown';
    if (filePath.match(/\.js$/i)) return 'javascript';
    if (filePath.match(/\.ts$/i)) return 'typescript';
    if (filePath.match(/\.json$/i)) return 'json';
    if (filePath.match(/\.txt$/i)) return 'text';
    if (filePath.match(/README/i)) return 'documentation';
    if (filePath.match(/thesis|manuscript/i)) return 'academic';
    return 'unknown';
  }

  async extractKnowledgeTriplesFromFile(file) {
    const triples = [];
    const content = file.content;

    const patterns = [
      // Core ULP Systems
      {
        pattern: /(Universal.Life.Protocol|ULP|anarcho.*syndicalist)/gi,
        createTriple: (match) => ({
          subject: 'Universal Life Protocol',
          predicate: 'implements',
          object: match[0].toLowerCase(),
          confidence: 0.95
        })
      },
      
      // Sacred Geometry
      {
        pattern: /(golden.ratio|phi|PHI|sacred.geometry|flower.of.life)/gi,
        createTriple: (match) => ({
          subject: 'Sacred Geometry Engine',
          predicate: 'calculates',
          object: match[0].replace(/\./g, ' ').toLowerCase(),
          confidence: 0.9
        })
      },
      
      // Consciousness
      {
        pattern: /(consciousness|dimensional|meta.observer|awareness)/gi,
        createTriple: (match) => ({
          subject: 'Consciousness System',
          predicate: 'develops',
          object: match[0].replace(/\./g, ' ').toLowerCase(),
          confidence: 0.85
        })
      },
      
      // Knowledge Systems
      {
        pattern: /(knowledge.trie|living.knowledge|Conway|evolution)/gi,
        createTriple: (match) => ({
          subject: 'Knowledge System',
          predicate: 'evolves_through',
          object: match[0].replace(/\./g, ' ').toLowerCase(),
          confidence: 0.8
        })
      },
      
      // Economic Systems
      {
        pattern: /(attention.token|marketplace|P2P|decentralized)/gi,
        createTriple: (match) => ({
          subject: 'Economic System',
          predicate: 'uses',
          object: match[0].replace(/\./g, ' ').toLowerCase(),
          confidence: 0.85
        })
      }
    ];

    patterns.forEach(patternConfig => {
      let match;
      while ((match = patternConfig.pattern.exec(content)) !== null) {
        const triple = patternConfig.createTriple(match);
        triple.sourceFile = file.path;
        triple.fileType = file.type;
        triple.timestamp = file.modified;
        triple.survivalFitness = this.calculateSurvivalFitness(triple);
        triple.id = this.generateTripleId(triple);
        
        triples.push(triple);
      }
    });

    return triples;
  }

  calculateSurvivalFitness(triple) {
    let fitness = triple.confidence;
    
    // Boost for important concepts
    if (triple.subject.includes('Universal Life Protocol')) fitness += 0.2;
    if (triple.object.includes('phi') || triple.object.includes('golden')) fitness += 0.15;
    if (triple.object.includes('consciousness')) fitness += 0.15;
    
    return Math.min(1.0, fitness);
  }

  generateTripleId(triple) {
    const content = `${triple.subject}-${triple.predicate}-${triple.object}`;
    return content.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50);
  }

  async identifyRevolutionaryPatternsInFile(file) {
    const patterns = [];
    const content = file.content.toLowerCase();

    const revolutionaryTerms = {
      anarcho_syndicalist: ['anarcho', 'syndicalist', 'mutual aid', 'direct democracy'],
      consciousness_evolution: ['consciousness development', 'dimensional', 'sacred geometry'],
      economic_democracy: ['attention token', 'decentralized', 'P2P marketplace'],
      knowledge_evolution: ['living knowledge', 'Conway', 'evolution', 'trie']
    };

    Object.entries(revolutionaryTerms).forEach(([category, terms]) => {
      terms.forEach(term => {
        if (content.includes(term)) {
          patterns.push({
            type: category,
            pattern: term,
            file: file.path,
            fileType: file.type,
            confidence: 0.8
          });
        }
      });
    });

    return patterns;
  }

  async discoverCrossFileRelationships() {
    const relationships = [];
    const triples = this.extractedKnowledge.triples;

    // Group by subject
    const subjectGroups = {};
    triples.forEach(triple => {
      if (!subjectGroups[triple.subject]) {
        subjectGroups[triple.subject] = [];
      }
      subjectGroups[triple.subject].push(triple);
    });

    Object.entries(subjectGroups).forEach(([subject, subjectTriples]) => {
      const uniqueFiles = new Set(subjectTriples.map(t => t.sourceFile));
      if (uniqueFiles.size > 1) {
        relationships.push({
          concept: subject,
          files: Array.from(uniqueFiles),
          strength: subjectTriples.length,
          avgFitness: subjectTriples.reduce((sum, t) => sum + t.survivalFitness, 0) / subjectTriples.length
        });
      }
    });

    return relationships.sort((a, b) => b.strength - a.strength);
  }

  async applyConwayEvolution() {
    const triples = this.extractedKnowledge.triples;
    let survivedTriples = [];

    triples.forEach(triple => {
      const connections = this.findConnections(triple, triples);
      let newFitness = triple.survivalFitness;

      if (connections.length < 2) {
        newFitness *= 0.5; // Isolation
      } else if (connections.length >= 2 && connections.length <= 3) {
        newFitness *= 1.2; // Optimal
      } else {
        newFitness *= 0.8; // Overcrowding
      }

      if (newFitness > 0.3) {
        survivedTriples.push({
          ...triple,
          survivalFitness: newFitness,
          connections: connections.length
        });
      }
    });

    console.log(`   💀 Evolution: ${triples.length} → ${survivedTriples.length} survived`);
    this.extractedKnowledge.triples = survivedTriples;
    return survivedTriples;
  }

  findConnections(triple, allTriples) {
    return allTriples.filter(other => 
      other.id !== triple.id && (
        other.subject === triple.subject ||
        other.object === triple.object ||
        other.subject === triple.object
      )
    );
  }

  async computeHarmonicSignatures() {
    const signatures = [];
    const triples = this.extractedKnowledge.triples;
    
    // Group by subject
    const subjectGroups = {};
    triples.forEach(triple => {
      if (!subjectGroups[triple.subject]) {
        subjectGroups[triple.subject] = [];
      }
      subjectGroups[triple.subject].push(triple);
    });

    Object.entries(subjectGroups).forEach(([subject, subjectTriples]) => {
      const avgFitness = subjectTriples.reduce((sum, t) => sum + t.survivalFitness, 0) / subjectTriples.length;
      const avgConnections = subjectTriples.reduce((sum, t) => sum + (t.connections || 0), 0) / subjectTriples.length;
      
      signatures.push({
        concept: subject,
        tripleCount: subjectTriples.length,
        harmonicFrequency: avgFitness * PHI,
        phiAlignment: Math.abs(avgConnections - PHI) < 1 ? 0.9 : 0.5,
        coherence: avgFitness * 0.8
      });
    });

    return signatures.sort((a, b) => b.coherence - a.coherence);
  }

  generateReport() {
    const report = {
      summary: {
        processedFiles: this.processedFiles,
        totalTriples: this.extractedKnowledge.triples.length,
        revolutionaryPatterns: this.extractedKnowledge.revolutionaryPatterns.length,
        crossFileRelationships: this.extractedKnowledge.crossFileRelationships.length,
        harmonicSignatures: this.extractedKnowledge.harmonicSignatures.length
      },
      topTriples: this.extractedKnowledge.triples
        .sort((a, b) => b.survivalFitness - a.survivalFitness)
        .slice(0, 20),
      topRelationships: this.extractedKnowledge.crossFileRelationships.slice(0, 10),
      topHarmonics: this.extractedKnowledge.harmonicSignatures.slice(0, 10),
      revolutionaryInsights: this.extractedKnowledge.revolutionaryPatterns.slice(0, 15)
    };

    return report;
  }
}

// Execute the robust archaeological excavation
async function main() {
  const archaeologist = new RobustKnowledgeArchaeologist();
  
  try {
    const report = await archaeologist.excavateAccessibleFiles();
    
    console.log('\n🎉 ROBUST EXCAVATION COMPLETE!');
    console.log('===============================\n');
    
    console.log('📊 SUMMARY:');
    console.log(`   Processed Files: ${report.summary.processedFiles}`);
    console.log(`   Knowledge Triples: ${report.summary.totalTriples}`);
    console.log(`   Revolutionary Patterns: ${report.summary.revolutionaryPatterns}`);
    console.log(`   Cross-File Relationships: ${report.summary.crossFileRelationships}`);
    console.log(`   Harmonic Signatures: ${report.summary.harmonicSignatures}\n`);
    
    console.log('🌟 TOP KNOWLEDGE TRIPLES:');
    report.topTriples.forEach((triple, i) => {
      console.log(`   ${i+1}. ${triple.subject} → ${triple.predicate} → ${triple.object}`);
      console.log(`      Fitness: ${triple.survivalFitness.toFixed(3)}, File: ${triple.sourceFile.split('/').pop()}`);
    });
    
    console.log('\n🔗 TOP CROSS-FILE RELATIONSHIPS:');
    report.topRelationships.forEach((rel, i) => {
      console.log(`   ${i+1}. ${rel.concept}`);
      console.log(`      Files: ${rel.files.length}, Strength: ${rel.strength}`);
    });
    
    console.log('\n📐 TOP HARMONIC SIGNATURES:');
    report.topHarmonics.forEach((harmonic, i) => {
      console.log(`   ${i+1}. ${harmonic.concept}: ${harmonic.harmonicFrequency.toFixed(3)}Φ`);
      console.log(`      Coherence: ${(harmonic.coherence * 100).toFixed(1)}%`);
    });
    
    console.log('\n🚀 REVOLUTIONARY INSIGHTS:');
    report.revolutionaryInsights.forEach((insight, i) => {
      console.log(`   ${i+1}. ${insight.type}: ${insight.pattern}`);
    });
    
    // Calculate overall system harmonic
    const overallHarmonic = report.topHarmonics.reduce((sum, h) => sum + h.harmonicFrequency, 0) / report.topHarmonics.length;
    console.log(`\n🎼 OVERALL SYSTEM HARMONIC: ${overallHarmonic.toFixed(3)}Φ`);
    
    // Save report
    fs.writeFileSync('robust-knowledge-report.json', JSON.stringify(report, null, 2));
    console.log('\n💾 Report saved to: robust-knowledge-report.json');
    
    console.log('\n✅ ROBUST KNOWLEDGE EXTRACTION COMPLETE!');
    
  } catch (error) {
    console.error('❌ Excavation error:', error);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { RobustKnowledgeArchaeologist };