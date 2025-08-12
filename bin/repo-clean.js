#!/usr/bin/env node
/**
 * Safe repository cleanup utility for monorepo
 * Modes:
 *  - inspect: print what would be removed
 *  - clean: remove node_modules and build outputs
 *  - deepclean: also remove caches and coverage
 */

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

const GLOBS = {
  clean: [
    'node_modules',
    'packages/*/node_modules',
    'apps/*/node_modules',
    'dist',
    'build',
    '.next',
    'out'
  ],
  deep: [
    '.cache',
    '**/.cache',
    'coverage',
    '.turbo'
  ]
};

function listMatches(globPattern) {
  // Very small glob subset to avoid deps; expand */ and **/.cache naive
  const parts = globPattern.split('/');
  const results = [];

  function walk(dir, idx) {
    if (idx >= parts.length) return;
    const part = parts[idx];
    if (part === '**') {
      // Recurse all subdirs
      walk(dir, idx + 1);
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) walk(path.join(dir, entry.name), idx);
      }
      return;
    }

    const entries = fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }) : [];
    if (part === '*') {
      for (const entry of entries) {
        const next = path.join(dir, entry.name);
        if (idx === parts.length - 1) results.push(next);
        else if (entry.isDirectory()) walk(next, idx + 1);
      }
      return;
    }

    const next = path.join(dir, part);
    if (fs.existsSync(next)) {
      if (idx === parts.length - 1) results.push(next);
      else walk(next, idx + 1);
    }
  }

  walk(ROOT, 0);
  return results;
}

function unique(arr) {
  return Array.from(new Set(arr));
}

function inspect(includeDeep) {
  const clean = GLOBS.clean.flatMap(listMatches);
  const deep = includeDeep ? GLOBS.deep.flatMap(listMatches) : [];
  const all = unique([...clean, ...deep]);
  console.log('Would remove:');
  for (const p of all) console.log('  -', path.relative(ROOT, p));
  console.log(`\nTotal paths: ${all.length}`);
}

function rimraf(target) {
  if (!fs.existsSync(target)) return;
  try {
    const stat = fs.lstatSync(target);
    if (stat.isDirectory() && !stat.isSymbolicLink()) {
      for (const entry of fs.readdirSync(target)) rimraf(path.join(target, entry));
      fs.rmdirSync(target);
    } else {
      fs.unlinkSync(target);
    }
  } catch (e) {
    console.warn('Skip (permission?)', target, e.message);
  }
}

function clean(includeDeep) {
  const clean = GLOBS.clean.flatMap(listMatches);
  const deep = includeDeep ? GLOBS.deep.flatMap(listMatches) : [];
  const all = unique([...clean, ...deep]);
  for (const p of all) {
    console.log('Removing', path.relative(ROOT, p));
    rimraf(p);
  }
  console.log('\nDone.');
}

const mode = process.argv[2] || 'inspect';
if (mode === 'inspect') inspect(false);
else if (mode === 'clean') clean(false);
else if (mode === 'deepclean') clean(true);
else {
  console.log('Usage: repo-clean.js [inspect|clean|deepclean]');
  process.exit(1);
}
