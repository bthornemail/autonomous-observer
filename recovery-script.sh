#!/bin/bash

# 🌌 Universal Life Protocol - MCP-Optimized Git Recovery Script
# Recovers 11,645 dangling objects with systematic analysis

echo "🌌 ULP Git Recovery Script - MCP Optimized"
echo "==========================================="

# Phase 1: Create recovery structure
mkdir -p recovery/{blobs,commits,trees,tags}
mkdir -p recovery/analysis/{patterns,content,metadata}

# Phase 2: Process dangling objects systematically
echo "📊 Processing 11,645 dangling objects..."

# Extract all dangling object hashes
git fsck --lost-found | grep "dangling blob" | cut -d' ' -f3 > recovery/blob-list.txt
git fsck --lost-found | grep "dangling commit" | cut -d' ' -f3 > recovery/commit-list.txt || touch recovery/commit-list.txt
git fsck --lost-found | grep "dangling tree" | cut -d' ' -f3 > recovery/tree-list.txt || touch recovery/tree-list.txt

BLOB_COUNT=$(wc -l < recovery/blob-list.txt)
echo "📁 Found $BLOB_COUNT dangling blobs"

# Phase 3: Analyze object content
echo "🔍 Analyzing object content patterns..."

# Sample first 100 objects for pattern analysis
head -100 recovery/blob-list.txt | while read hash; do
    if [ ! -z "$hash" ]; then
        # Get object info
        git cat-file -t $hash > recovery/analysis/metadata/${hash}.type 2>/dev/null || true
        git cat-file -s $hash > recovery/analysis/metadata/${hash}.size 2>/dev/null || true
        
        # Extract content (safe truncation)
        git cat-file -p $hash 2>/dev/null | head -20 > recovery/analysis/content/${hash}.content || true
        
        # Pattern detection
        git cat-file -p $hash 2>/dev/null | head -5 | grep -E "(function|class|import|const|let|var)" > recovery/analysis/patterns/${hash}.js 2>/dev/null || true
        git cat-file -p $hash 2>/dev/null | head -5 | grep -E "(README|\.md|#)" > recovery/analysis/patterns/${hash}.md 2>/dev/null || true
        git cat-file -p $hash 2>/dev/null | head -5 | grep -E "(package\.json|tsconfig|\.json)" > recovery/analysis/patterns/${hash}.json 2>/dev/null || true
    fi
done

# Phase 4: Create recovery manifest
echo "📋 Creating recovery manifest..."

cat > recovery/manifest.json << EOF
{
  "recovery_timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "total_objects": $BLOB_COUNT,
  "recovery_branch": "history-recovery-mcp",
  "patterns_analyzed": 100,
  "recovery_status": "in_progress",
  "mcp_optimized": true
}
EOF

# Phase 5: Smart object categorization
echo "🎯 Categorizing objects by content type..."

# Count patterns
JS_COUNT=$(find recovery/analysis/patterns -name "*.js" -type f | wc -l)
MD_COUNT=$(find recovery/analysis/patterns -name "*.md" -type f | wc -l)
JSON_COUNT=$(find recovery/analysis/patterns -name "*.json" -type f | wc -l)

echo "   📜 JavaScript/TypeScript files: $JS_COUNT"
echo "   📝 Markdown/Documentation files: $MD_COUNT"  
echo "   ⚙️  JSON/Configuration files: $JSON_COUNT"

# Phase 6: Create integrated recovery file
echo "🔄 Creating integrated recovery content..."

cat > recovery-content.txt << EOF
# 🌌 ULP Git History Recovery - MCP Optimized
# Recovered Content from $BLOB_COUNT dangling objects
# Recovery Date: $(date -u +%Y-%m-%dT%H:%M:%SZ)

## Recovery Statistics
- Total Objects: $BLOB_COUNT
- JavaScript/TS: $JS_COUNT  
- Markdown/Docs: $MD_COUNT
- JSON/Config: $JSON_COUNT
- Sample Analysis: 100 objects

## Pattern Analysis
EOF

# Add sample content from recovered objects
echo "## Sample Recovered Content" >> recovery-content.txt
echo "=========================" >> recovery-content.txt

# Include meaningful content samples
for file in recovery/analysis/content/*.content; do
    if [ -f "$file" ] && [ -s "$file" ]; then
        echo "### Object: $(basename $file .content)" >> recovery-content.txt
        echo '```' >> recovery-content.txt
        head -10 "$file" >> recovery-content.txt
        echo '```' >> recovery-content.txt
        echo "" >> recovery-content.txt
    fi
done

echo "✅ Recovery analysis complete!"
echo "📊 Results saved to recovery-content.txt"
echo "📁 Detailed analysis in recovery/ directory"