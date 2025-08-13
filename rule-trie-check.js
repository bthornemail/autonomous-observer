#!/usr/bin/env node
/**
 * Minimal Rule Trie checker
 * - Loads docs/rule-trie/rule-trie.seed.json
 * - Evaluates simple regex predicates against listed files
 * - Exits 1 if any severity=block rule fails; 0 otherwise
 */
const fs = require('fs');
const path = require('path');

function readJson(p) {
    try {
        const raw = fs.readFileSync(p, 'utf8');
        return JSON.parse(raw);
    } catch (e) {
        console.error(`Failed to read JSON at ${p}: ${e.message}`);
        process.exit(2);
    }
}

function loadFiles(baseDir, files) {
    const contents = [];
    const missing = [];
    for (const f of files) {
        const fp = path.resolve(baseDir, f);
        try {
            const data = fs.readFileSync(fp, 'utf8');
            contents.push({ file: f, content: data });
        } catch (e) {
            missing.push(f);
        }
    }
    return { contents, missing };
}

function testRegexOverFiles(regexSource, files) {
    let re;
    try {
        re = new RegExp(regexSource, 'm');
    } catch (e) {
        return { ok: false, error: `Invalid regex '${regexSource}': ${e.message}` };
    }
    for (const { content } of files) {
        if (re.test(content)) return { ok: true };
    }
    return { ok: false };
}

function main() {
    const cwd = process.cwd();
    const repoRoot = cwd; // assume run from repo root
    const seedPath = path.resolve(repoRoot, 'docs/rule-trie/rule-trie.seed.json');
    const seed = readJson(seedPath);

    const results = [];
    let blockFailures = 0;
    for (const rule of seed.rules) {
        const appliesFiles = (rule.appliesTo && rule.appliesTo.files) || [];
        const { contents, missing } = loadFiles(repoRoot, appliesFiles);
        const ruleRes = { id: rule.id, title: rule.title, severity: rule.severity, status: 'pass', details: [] };

        if (missing.length) {
            ruleRes.status = 'fail';
            ruleRes.details.push({ type: 'missing_files', files: missing });
        }

        if (Array.isArray(rule.predicates)) {
            for (const p of rule.predicates) {
                if (p.type === 'regex') {
                    const t = testRegexOverFiles(p.expr, contents);
                    if (!t.ok) {
                        ruleRes.status = 'fail';
                        ruleRes.details.push({ type: 'predicate', predicateType: 'regex', expr: p.expr, error: t.error });
                    }
                } else {
                    // Unsupported predicate types are not enforced in this minimal checker
                    ruleRes.details.push({ type: 'predicate_skipped', predicateType: p.type });
                }
            }
        }

        if (ruleRes.status === 'fail' && rule.severity === 'block') {
            blockFailures++;
        }

        results.push(ruleRes);
    }

    // Pretty print summary
    const failed = results.filter(r => r.status === 'fail');
    const warned = results.filter(r => r.status === 'fail' && r.severity === 'warn');
    const blocked = results.filter(r => r.status === 'fail' && r.severity === 'block');

    console.log('Rule Trie Check Summary');
    console.log(`- Total rules: ${results.length}`);
    console.log(`- Failures: ${failed.length} (block: ${blocked.length}, warn: ${warned.length})`);
    if (failed.length) {
        console.log('\nFailures:');
        for (const r of failed) {
            console.log(`- [${r.severity}] ${r.id}: ${r.title}`);
            for (const d of r.details) {
                if (d.type === 'missing_files') {
                    console.log(`    missing files: ${d.files.join(', ')}`);
                } else if (d.type === 'predicate') {
                    console.log(`    predicate failed (${d.predicateType}): ${d.expr}${d.error ? ` — ${d.error}` : ''}`);
                } else if (d.type === 'predicate_skipped') {
                    console.log(`    predicate skipped (${d.predicateType})`);
                }
            }
        }
    }

    // Also emit a machine-readable artifact if requested
    if (process.env.RULE_TRIE_CHECK_OUTPUT) {
        try {
            fs.writeFileSync(process.env.RULE_TRIE_CHECK_OUTPUT, JSON.stringify({ results }, null, 2));
        } catch (e) {
            console.error(`Failed to write report: ${e.message}`);
        }
    }

    process.exit(blockFailures > 0 ? 1 : 0);
}

main();
