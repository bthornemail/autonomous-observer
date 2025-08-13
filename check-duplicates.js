#!/usr/bin/env node

const fs = require('fs');

console.log('🔍 Checking for duplicate entries in knowledge database...\n');

// Check merged-knowledge-trie.json
try {
  const data = JSON.parse(fs.readFileSync('merged-knowledge-trie.json', 'utf8'));
  const ids = data.triples.map(t => t.id);
  const subjects = data.triples.map(t => `${t.subject}:${t.predicate}:${t.object}`);
  
  console.log('📊 MERGED KNOWLEDGE TRIE ANALYSIS:');
  console.log('Total triples:', ids.length);
  console.log('Unique IDs:', new Set(ids).size);
  console.log('Unique subject-predicate-object combinations:', new Set(subjects).size);
  
  // Find duplicate IDs
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  console.log('Duplicate IDs found:', duplicateIds.length);
  
  if (duplicateIds.length > 0) {
    console.log('\n❌ DUPLICATE IDs:');
    [...new Set(duplicateIds)].forEach(id => {
      const entries = data.triples.filter(t => t.id === id);
      console.log(`  ID: ${id} (${entries.length} copies)`);
      entries.forEach((entry, i) => {
        console.log(`    ${i+1}: ${entry.subject} -> ${entry.predicate} -> ${entry.object}`);
      });
    });
  }
  
  // Find duplicate content
  const duplicateContent = subjects.filter((content, index) => subjects.indexOf(content) !== index);
  console.log('\nDuplicate content combinations:', duplicateContent.length);
  
  if (duplicateContent.length > 0) {
    console.log('\n❌ DUPLICATE CONTENT:');
    [...new Set(duplicateContent)].slice(0, 10).forEach(content => {
      const count = subjects.filter(s => s === content).length;
      console.log(`  "${content}" (${count} copies)`);
    });
  }

} catch (error) {
  console.error('❌ Error checking merged-knowledge-trie.json:', error.message);
}

console.log('\n' + '='.repeat(60));

// Check enhanced-data.json
try {
  const enhancedData = JSON.parse(fs.readFileSync('enhanced-agent-data/enhanced-data.json', 'utf8'));
  console.log('\n📊 ENHANCED AGENT DATA ANALYSIS:');
  
  if (enhancedData.geometricStructure && enhancedData.geometricStructure.coordinates) {
    const coords = enhancedData.geometricStructure.coordinates;
    console.log('Total coordinates:', coords.length);
    
    // Check for duplicate coordinates
    const coordStrings = coords.map(c => `${c.x.toFixed(6)},${c.y.toFixed(6)},${c.z.toFixed(6)}`);
    const uniqueCoords = new Set(coordStrings).size;
    console.log('Unique coordinates:', uniqueCoords);
    
    if (uniqueCoords < coords.length) {
      console.log('❌ Duplicate coordinates found:', coords.length - uniqueCoords);
    } else {
      console.log('✅ No duplicate coordinates');
    }
  }
  
} catch (error) {
  console.error('❌ Error checking enhanced-data.json:', error.message);
}

console.log('\n' + '='.repeat(60));

// Check large knowledge base files
const largeFiles = [
  'cleaned-reports/archive/knowledge-data/expanded-knowledge-base.json',
  'cleaned-reports/archive/knowledge-data/classical-expanded-knowledge.json'
];

for (const filePath of largeFiles) {
  try {
    console.log(`\n📊 CHECKING ${filePath}:`);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (data.patterns && Array.isArray(data.patterns)) {
      const patterns = data.patterns;
      console.log('Total patterns:', patterns.length);
      
      // Check for duplicate patterns by content
      const patternStrings = patterns.map(p => `${p.subject || p.statement}:${p.predicate || 'statement'}:${p.object || p.category}`);
      const uniquePatterns = new Set(patternStrings).size;
      console.log('Unique pattern combinations:', uniquePatterns);
      
      if (uniquePatterns < patterns.length) {
        const duplicateCount = patterns.length - uniquePatterns;
        console.log(`❌ Duplicate patterns found: ${duplicateCount}`);
        
        // Show examples of duplicates
        const duplicates = patternStrings.filter((pattern, index) => patternStrings.indexOf(pattern) !== index);
        console.log('Sample duplicates:');
        [...new Set(duplicates)].slice(0, 5).forEach(dup => {
          const count = patternStrings.filter(p => p === dup).length;
          console.log(`  "${dup}" (${count} copies)`);
        });
      } else {
        console.log('✅ No duplicate patterns by content');
      }
      
      // Check for duplicate IDs if present
      if (patterns[0] && patterns[0].id) {
        const patternIds = patterns.map(p => p.id).filter(id => id);
        const uniqueIds = new Set(patternIds).size;
        console.log('Unique IDs:', uniqueIds);
        
        if (uniqueIds < patternIds.length) {
          console.log(`❌ Duplicate IDs found: ${patternIds.length - uniqueIds}`);
        } else {
          console.log('✅ No duplicate IDs');
        }
      }
    }
    
  } catch (error) {
    console.log(`⚠️  Could not check ${filePath}: ${error.message}`);
  }
}

console.log('\n🏁 Duplicate check complete!');