#!/usr/bin/env node
/**
 * JSON de-duplication utility for UniversalLifeProtocol
 *
 * Features:
 * - Scans provided paths (files or directories) for .json files
 * - Detects duplicate objects within arrays using a stable canonical hash
 * - Optionally uses identity keys via --key id --key name --key type (composite)
 * - Writes cleaned files to a sibling directory `cleaned-reports/` by default
 * - Emits a machine-readable summary at docs/data-quality/dedupe-report.json
 */
const fs = require('fs');
const path = require('path');

// Simple CLI arg parser
const argv = process.argv.slice(2);
const keys = [];
let inPlace = false;
let outDir = 'cleaned-reports';
let silent = false;
const inputs = [];

for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--key' && argv[i + 1]) { keys.push(argv[++i]); continue; }
  if (a === '--in-place') { inPlace = true; continue; }
  if (a === '--out-dir' && argv[i + 1]) { outDir = argv[++i]; continue; }
  if (a === '--silent') { silent = true; continue; }
  inputs.push(a);
}

function walk(dir) {
  const res = [];
  for (const entry of fs.readdirSync(dir)) {
    const p = path.join(dir, entry);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) res.push(...walk(p));
    else if (entry.toLowerCase().endsWith('.json')) res.push(p);
  }
  return res;
}

function canonicalize(value) {
  // Deterministic JSON stringify with sorted keys
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(canonicalize).join(',') + ']';
  const keys = Object.keys(value).sort();
  const parts = keys.map(k => JSON.stringify(k) + ':' + canonicalize(value[k]));
  return '{' + parts.join(',') + '}';
}

function identityHash(obj) {
  if (keys.length) {
    const parts = keys.map(k => obj && Object.prototype.hasOwnProperty.call(obj, k) ? String(obj[k]) : '');
    return 'ID:' + parts.join('|');
  }
  return 'CANON:' + canonicalize(obj);
}

function dedupeArray(arr) {
  const seen = new Map();
  const out = [];
  let dupes = 0;
  for (const item of arr) {
    const h = identityHash(item);
    if (seen.has(h)) { dupes++; continue; }
    seen.set(h, true);
    out.push(item);
  }
  return { array: out, duplicates: dupes, unique: out.length, total: arr.length };
}

function processJSON(doc) {
  // Strategy:
  // - If root is an array, dedupe at root
  // - If root is object: dedupe array-valued properties at shallow level
  // Returns cleaned doc and metrics
  if (Array.isArray(doc)) {
    const r = dedupeArray(doc);
    return { cleaned: r.array, metrics: { rootArray: r } };
  }
  if (doc && typeof doc === 'object') {
    const cleaned = Array.isArray(doc) ? [] : { ...doc };
    const metrics = {};
    for (const [k, v] of Object.entries(doc)) {
      if (Array.isArray(v)) {
        const r = dedupeArray(v);
        cleaned[k] = r.array;
        metrics[k] = r;
      }
    }
    return { cleaned, metrics };
  }
  // Primitive: nothing to dedupe
  return { cleaned: doc, metrics: {} };
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function collectTargets(args) {
  const files = new Set();
  for (const a of args.length ? args : ['.']) {
    const p = path.resolve(a);
    if (!fs.existsSync(p)) continue;
    const stat = fs.statSync(p);
    if (stat.isDirectory()) walk(p).forEach(f => files.add(f));
    else if (p.toLowerCase().endsWith('.json')) files.add(p);
  }
  return [...files];
}

function main() {
  const root = process.cwd();
  const targets = collectTargets(inputs);
  if (!silent) console.log(`[dedupe] scanning ${targets.length} JSON file(s)`);

  const report = {
    generatedAt: new Date().toISOString(),
    root,
    keys,
    inPlace,
    files: [],
    summary: { totalFiles: 0, totalDuplicates: 0, totalArrays: 0 }
  };

  const outBase = inPlace ? '' : path.resolve(root, outDir);
  if (!inPlace) ensureDir(outBase);

  for (const file of targets) {
    try {
      const raw = fs.readFileSync(file, 'utf8');
      const json = JSON.parse(raw);
      const { cleaned, metrics } = processJSON(json);
      let fileDuplicates = 0;
      let arraysCount = 0;
      for (const m of Object.values(metrics)) {
        if (m && typeof m === 'object' && 'duplicates' in m) {
          fileDuplicates += m.duplicates;
          arraysCount += 1;
        }
      }
      // If root array, metrics.rootArray exists
      if (metrics.rootArray) {
        fileDuplicates += metrics.rootArray.duplicates;
        arraysCount += 1;
      }

      const relative = path.relative(root, file);
      const outPath = inPlace ? file : path.join(outBase, relative);
      if (!inPlace) ensureDir(path.dirname(outPath));
      fs.writeFileSync(outPath, JSON.stringify(cleaned, null, 2) + '\n', 'utf8');

      report.files.push({
        file: relative,
        output: path.relative(root, outPath),
        arraysProcessed: arraysCount,
        duplicatesRemoved: fileDuplicates
      });
      report.summary.totalFiles += 1;
      report.summary.totalDuplicates += fileDuplicates;
      report.summary.totalArrays += arraysCount;

      if (!silent) console.log(`[dedupe] ${relative} -> ${path.relative(root, outPath)} | removed ${fileDuplicates} duplicate(s)`);
    } catch (err) {
      report.files.push({ file: path.relative(root, file), error: String(err && err.message || err) });
      if (!silent) console.warn(`[dedupe] failed ${file}:`, err.message);
    }
  }

  const reportDir = path.resolve(root, 'docs', 'data-quality');
  ensureDir(reportDir);
  const reportPath = path.join(reportDir, 'dedupe-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n', 'utf8');
  if (!silent) console.log(`[dedupe] wrote report ${path.relative(root, reportPath)}`);
}

main();
