#!/usr/bin/env node

/**
 * 📐 PRINCIPIA MATHEMATICA PROCESSOR 
 * 
 * Downloads and processes Russell & Whitehead's Principia Mathematica
 * for foundational mathematical logic patterns. Handles Latin OCR cleanup
 * and extracts axiomatic logical relationships.
 */

const fs = require('fs');
const https = require('https');

class PrincipiaMathematicaProcessor {
  constructor() {
    this.PHI = (1 + Math.sqrt(5)) / 2;
    
    this.principiaSource = {
      name: 'Principia Mathematica - Russell & Whitehead',
      url: 'https://www.gutenberg.org/files/21016/21016-0.txt',
      backup_url: 'https://www.gutenberg.org/files/36766/36766-0.txt', // Volume 1
      description: 'Foundational mathematical logic'
    };

    this.logicalOperators = ['⊃', '⊂', '∨', '∧', '¬', '∃', '∀', '=', '≡', '⊥', '⊤'];
    this.mathematicalConcepts = [
      'proposition', 'inference', 'axiom', 'theorem', 'proof', 'logic', 
      'class', 'relation', 'function', 'number', 'set', 'element',
      'implication', 'conjunction', 'disjunction', 'negation', 'quantifier'
    ];

    this.patterns = [];
  }

  async downloadPrincipia() {
    console.log('📐 PRINCIPIA MATHEMATICA PROCESSOR');
    console.log('=================================\n');

    console.log('📥 Downloading Principia Mathematica from Project Gutenberg...');

    try {
      const text = await this.downloadText(this.principiaSource.url);
      console.log(`✅ Downloaded ${(text.length / 1024).toFixed(0)}KB of text`);
      return text;
    } catch (error) {
      console.warn('⚠️  Primary URL failed, trying backup...');
      try {
        const text = await this.downloadText(this.principiaSource.backup_url);
        console.log(`✅ Downloaded ${(text.length / 1024).toFixed(0)}KB from backup source`);
        return text;
      } catch (backupError) {
        console.error('❌ Both downloads failed, using sample content');
        return this.generateSamplePrincipiaContent();
      }
    }
  }

  async downloadText(url) {
    return new Promise((resolve, reject) => {
      https.get(url, (response) => {
        if (response.statusCode === 200) {
          let data = '';
          response.on('data', chunk => data += chunk);
          response.on('end', () => resolve(data));
        } else {
          reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        }
      }).on('error', reject);
    });
  }

  generateSamplePrincipiaContent() {
    return `
PRINCIPIA MATHEMATICA - Sample Content

*1.1 Anything implied by a true elementary proposition is true

*1.11 If p implies q, and q implies r, then p implies r

*1.2 If p implies q, and p is true, then q is true (Modus Ponens)

*1.3 If p or q is true, and p is false, then q is true

*1.4 If p and q are both true, then p is true

*1.5 If p and q are both true, then q is true

*2.01 The class of all x such that φx is the class determined by φ

*2.02 If x is a member of the class α, then φx where α = {x : φx}

*3.01 A relation R is a class of ordered pairs

*3.02 If xRy, then (x,y) ∈ R

Mathematical Logic Foundations:
- Every proposition is either true or false
- Logical inference follows deductive rules
- Classes are determined by properties
- Relations connect objects systematically
- Numbers emerge from logical constructions
`;
  }

  processLatinOCR(text) {
    console.log('🔍 Processing Latin OCR and cleaning text...');
    
    // Common OCR corrections for Latin mathematical texts
    const corrections = {
      // Latin character corrections
      'æ': 'ae',
      'œ': 'oe', 
      'ſ': 's',
      
      // Mathematical symbol corrections
      'ⅰ': '⊃', // implication often misread
      'ⅰⅰ': '≡', // equivalence 
      '∪': '∨', // union/disjunction
      '∩': '∧', // intersection/conjunction
      '~': '¬', // negation
      
      // Common OCR errors
      'rn': 'm',
      'cl': 'cl', 
      'ii': 'u',
      'vv': 'w',
      
      // Mathematical notation
      '.*1\\.': '*1.', // Proposition numbering
      '.*2\\.': '*2.',
      '.*3\\.': '*3.',
      '.*4\\.': '*4.',
      '.*5\\.': '*5.'
    };

    let cleaned = text;
    Object.entries(corrections).forEach(([error, correction]) => {
      cleaned = cleaned.replace(new RegExp(error, 'g'), correction);
    });

    // Remove excessive whitespace and normalize
    cleaned = cleaned.replace(/\s+/g, ' ');
    cleaned = cleaned.replace(/\n\s*\n/g, '\n');

    console.log('✅ OCR cleanup complete');
    return cleaned;
  }

  extractLogicalPatterns(text) {
    console.log('🧮 Extracting logical patterns from Principia...');
    
    const patterns = [];
    const lines = text.split('\n').filter(line => line.trim().length > 10);

    lines.forEach((line, index) => {
      // Extract numbered propositions (*1.1, *1.2, etc.)
      const propMatch = line.match(/\*(\d+\.\d+)\s+(.+)/);
      if (propMatch) {
        const [, number, statement] = propMatch;
        patterns.push(this.createLogicalProposition(number, statement, line));
      }

      // Extract logical relationships
      patterns.push(...this.extractLogicalRelations(line, index));
      
      // Extract mathematical concepts
      patterns.push(...this.extractMathematicalConcepts(line, index));
      
      // Extract axiomatic statements
      if (this.isAxiomaticStatement(line)) {
        patterns.push(this.createAxiomaticPattern(line, index));
      }
    });

    console.log(`✅ Extracted ${patterns.length} logical patterns from Principia`);
    return patterns;
  }

  createLogicalProposition(number, statement, fullLine) {
    return {
      source: 'principia_mathematica',
      category: 'logical_proposition',
      type: 'axiom',
      propositionNumber: number,
      subject: 'mathematical_logic',
      predicate: 'defines_axiom',
      object: statement.substring(0, 100) + (statement.length > 100 ? '...' : ''),
      confidence: 0.95,
      metadata: {
        propositionNumber: number,
        fullStatement: fullLine,
        logicalFoundation: true
      },
      guidingStarPrinciples: this.classifyLogicalPrinciples(statement),
      sacredGeometryAlignment: this.calculateLogicalAlignment(statement)
    };
  }

  extractLogicalRelations(line, index) {
    const patterns = [];
    
    // Detect implication patterns (if...then, implies)
    const implicationMatch = line.match(/(.+?)\s+(?:implies|⊃|→)\s+(.+)/i);
    if (implicationMatch) {
      const [, antecedent, consequent] = implicationMatch;
      patterns.push({
        source: 'principia_mathematica',
        category: 'logical_implication',
        type: 'relation',
        subject: this.cleanLogicalTerm(antecedent),
        predicate: 'implies',
        object: this.cleanLogicalTerm(consequent),
        confidence: 0.9,
        metadata: { lineIndex: index },
        guidingStarPrinciples: ['autonomy'], // logical independence
        sacredGeometryAlignment: this.PHI * 0.3
      });
    }

    // Detect equivalence patterns
    const equivalenceMatch = line.match(/(.+?)\s+(?:≡|equivalent to|if and only if)\s+(.+)/i);
    if (equivalenceMatch) {
      const [, left, right] = equivalenceMatch;
      patterns.push({
        source: 'principia_mathematica', 
        category: 'logical_equivalence',
        type: 'relation',
        subject: this.cleanLogicalTerm(left),
        predicate: 'equivalent_to',
        object: this.cleanLogicalTerm(right),
        confidence: 0.92,
        metadata: { lineIndex: index },
        guidingStarPrinciples: ['reciprocity'], // mutual logical relationship
        sacredGeometryAlignment: this.PHI * 0.4
      });
    }

    return patterns;
  }

  extractMathematicalConcepts(line, index) {
    const patterns = [];
    
    this.mathematicalConcepts.forEach(concept => {
      if (line.toLowerCase().includes(concept)) {
        // Find related concepts in the same line
        const otherConcepts = this.mathematicalConcepts.filter(c => 
          c !== concept && line.toLowerCase().includes(c)
        );
        
        otherConcepts.forEach(related => {
          patterns.push({
            source: 'principia_mathematica',
            category: 'mathematical_concept',
            type: 'conceptual_relation',
            subject: concept,
            predicate: 'relates_to_in_context',
            object: related,
            confidence: 0.75,
            metadata: { 
              lineIndex: index,
              context: line.substring(0, 150)
            },
            guidingStarPrinciples: this.classifyConceptualPrinciples(line),
            sacredGeometryAlignment: this.calculateConceptualAlignment(concept, related)
          });
        });
      }
    });

    return patterns;
  }

  isAxiomaticStatement(line) {
    const axiomaticIndicators = [
      /axiom/i,
      /fundamental/i, 
      /basic principle/i,
      /primitive/i,
      /definition/i,
      /\*\d+\./,  // Numbered propositions
      /theorem/i
    ];

    return axiomaticIndicators.some(pattern => pattern.test(line));
  }

  createAxiomaticPattern(line, index) {
    return {
      source: 'principia_mathematica',
      category: 'axiomatic_foundation',
      type: 'axiom',
      subject: 'mathematical_logic',
      predicate: 'establishes_axiom',
      object: line.substring(0, 100) + (line.length > 100 ? '...' : ''),
      confidence: 0.9,
      metadata: {
        lineIndex: index,
        fullStatement: line,
        axiomaticWeight: this.calculateAxiomaticWeight(line)
      },
      guidingStarPrinciples: ['sovereignty'], // foundational authority
      sacredGeometryAlignment: this.PHI * 0.5
    };
  }

  cleanLogicalTerm(term) {
    return term.trim()
      .replace(/[()]/g, '')
      .replace(/\s+/g, ' ')
      .toLowerCase()
      .substring(0, 80);
  }

  classifyLogicalPrinciples(statement) {
    const principles = [];
    const text = statement.toLowerCase();
    
    if (text.match(/choice|arbitrary|free|independent/)) principles.push('freedom');
    if (text.match(/self.*contain|autonomous|intrinsic/)) principles.push('autonomy');
    if (text.match(/mutual|reciprocal|symmetric|commutative/)) principles.push('reciprocity');
    if (text.match(/foundation|basic|primitive|sovereign/)) principles.push('sovereignty');
    
    return principles;
  }

  classifyConceptualPrinciples(line) {
    const principles = [];
    if (line.match(/individual|distinct|separate/i)) principles.push('autonomy');
    if (line.match(/class|set|collection/i)) principles.push('sovereignty');
    if (line.match(/relation|connection|correspondence/i)) principles.push('reciprocity');
    return principles;
  }

  calculateLogicalAlignment(statement) {
    let alignment = 0.5;
    
    // Boost for logical perfection indicators
    if (statement.match(/consistent|complete|decidable/i)) alignment += 0.2;
    if (statement.match(/elegant|simple|beautiful/i)) alignment += 0.15;
    if (statement.match(/universal|general|fundamental/i)) alignment += 0.1;
    
    return Math.min(1.0, alignment * this.PHI / 2);
  }

  calculateConceptualAlignment(concept1, concept2) {
    // Sacred geometry alignment based on conceptual harmony
    const conceptWeights = {
      'logic': 1.0,
      'truth': 0.95,
      'proof': 0.9,
      'axiom': 0.95,
      'theorem': 0.85,
      'relation': 0.8,
      'class': 0.75,
      'function': 0.85,
      'number': 0.9
    };
    
    const weight1 = conceptWeights[concept1] || 0.7;
    const weight2 = conceptWeights[concept2] || 0.7;
    
    return ((weight1 + weight2) / 2) * this.PHI * 0.4;
  }

  calculateAxiomaticWeight(statement) {
    let weight = 0.5;
    
    if (statement.match(/\*1\./)) weight = 1.0; // Fundamental propositions
    if (statement.match(/\*[2-3]\./)) weight = 0.9; // Secondary propositions
    if (statement.match(/\*[4-9]\./)) weight = 0.8; // Derived propositions
    if (statement.match(/definition/i)) weight = 0.85;
    if (statement.match(/theorem/i)) weight = 0.75;
    
    return weight;
  }

  async processPrincipiaMathematica() {
    try {
      // Download Principia text
      const rawText = await this.downloadPrincipia();
      
      // Clean up Latin OCR errors
      const cleanText = this.processLatinOCR(rawText);
      
      // Extract logical patterns
      const logicalPatterns = this.extractLogicalPatterns(cleanText);
      
      this.patterns.push(...logicalPatterns);

      console.log('\n📊 PRINCIPIA MATHEMATICA PROCESSING COMPLETE:');
      console.log(`   Total Patterns: ${this.patterns.length}`);
      
      // Categorize patterns
      const categories = {};
      this.patterns.forEach(pattern => {
        categories[pattern.category] = (categories[pattern.category] || 0) + 1;
      });
      
      console.log('\n📋 Pattern Categories:');
      Object.entries(categories).forEach(([category, count]) => {
        console.log(`   ${category}: ${count} patterns`);
      });

      // Calculate statistics
      const avgConfidence = this.patterns.reduce((sum, p) => sum + p.confidence, 0) / this.patterns.length;
      const avgAlignment = this.patterns.reduce((sum, p) => sum + (p.sacredGeometryAlignment || 0), 0) / this.patterns.length;
      
      console.log('\n📈 Pattern Quality:');
      console.log(`   Average Confidence: ${avgConfidence.toFixed(3)}`);
      console.log(`   Average Sacred Alignment: ${avgAlignment.toFixed(3)}`);
      
      return this.patterns;

    } catch (error) {
      console.error('❌ Error processing Principia Mathematica:', error);
      return [];
    }
  }
}

async function main() {
  const processor = new PrincipiaMathematicaProcessor();
  
  const patterns = await processor.processPrincipiaMathematica();
  
  // Save patterns for integration with main knowledge base
  fs.writeFileSync('principia-mathematica-patterns.json', JSON.stringify({
    metadata: {
      source: 'Principia Mathematica - Russell & Whitehead',
      totalPatterns: patterns.length,
      processedAt: new Date(),
      description: 'Foundational mathematical logic patterns'
    },
    patterns: patterns
  }, null, 2));
  
  console.log('\n💾 Principia patterns saved to: principia-mathematica-patterns.json');
  console.log('📐 Mathematical logic foundation ready for integration!');
}

if (require.main === module) {
  main();
}

module.exports = { PrincipiaMathematicaProcessor };