#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { analyzeFeeds } = require('./analyzer');

function parseArgs(argv) {
  const args = { urls: [], mock: false, profile: null, out: path.join(__dirname, '..', 'output', 'report.json') };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--mock') args.mock = true;
    else if (a === '--profile') args.profile = argv[++i];
    else if (a === '--out') args.out = argv[++i];
    else if (a.startsWith('-')) continue; // ignore unknown flags
    else args.urls.push(a);
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv);
  const result = await analyzeFeeds({ urls: args.urls, mock: args.mock, profilePath: args.profile });
  fs.mkdirSync(path.dirname(args.out), { recursive: true });
  fs.writeFileSync(args.out, JSON.stringify(result, null, 2));
  console.log(`Saved report to ${args.out}`);
}

main().catch(err => { console.error(err); process.exit(1); });
