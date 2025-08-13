#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { generateTemplate, applyPlaceholdersToData, encodeBinaryToVector, decodeVectorToBinary } from '../index.mjs';

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const hasEq = a.includes('=');
      if (hasEq) {
        const [k, v] = a.split('=');
        args[k.slice(2)] = v ?? true;
      } else {
        const key = a.slice(2);
        const next = argv[i + 1];
        if (next && !String(next).startsWith('--')) {
          args[key] = next;
          i++; // consume value
        } else {
          args[key] = true;
        }
      }
    } else if (!args._) {
      args._ = [a];
    } else {
      args._.push(a);
    }
  }
  return args;
}

const args = parseArgs(process.argv);
if (args.help || args.h) {
  const phK = '${k}';
  const phRange = '${k:0..100}';
  console.log(`Harmonic Template CLI
Usage: harmonic-template --dim=1024 --seed=my-seed --base=7 --harmonics=1,3,5 --gain=0.5 \
       --placeholders=k:5:0.8,k:13:0.2,range:100..120:0.1 \
       --format=Thesis-Based Marketplace Framework Report_.txt --out=vector.json

Binary:
  Encode: harmonic-template encode --in file.bin --dim=1024 --seed=payload --out payload-vector.json
  Decode: harmonic-template decode --in payload-vector.json --out file.bin

Options:
  --dim            Vector length (required)
  --seed           Seed for deterministic spectrum
  --base           Base frequency index (default 1)
  --harmonics      Comma list of integer multipliers (default 1,2,3,4,5)
  --gain           Harmonic emphasis gain (default 1.0)
  --placeholders   Comma list: k:<idx>:<amp> or range:<start>..<end>:<amp>
  --format         Path to a text file with placeholders like ${phK} or ${phRange}
  --out            Output JSON file for vector/spec (default stdout)
`);
  process.exit(0);
}

const mode = (args._ && args._[0]) || '';
if (mode === 'encode') {
  const inPath = args.in || args.input;
  const dim = Number(args.dim);
  const seed = args.seed ?? 'payload';
  const outPath = args.out || 'payload-vector.json';
  if (!inPath || !Number.isInteger(dim)) {
    console.error('encode requires --in <file> and --dim');
    process.exit(1);
  }
  const buf = fs.readFileSync(path.resolve(process.env.INIT_CWD || process.cwd(), inPath));
  const { vector, spec, manifest } = encodeBinaryToVector(buf, { dim, seed });
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify({ vector, manifest }, null, 2));
  console.log(`Encoded ${inPath} -> ${outPath} (${buf.length} bytes)`);
  process.exit(0);
}

if (mode === 'decode') {
  const inPath = args.in || args.input;
  const outPath = args.out || 'decoded.bin';
  if (!inPath) {
    console.error('decode requires --in <payload-vector.json>');
    process.exit(1);
  }
  const j = JSON.parse(fs.readFileSync(path.resolve(process.env.INIT_CWD || process.cwd(), inPath), 'utf8'));
  const payload = decodeVectorToBinary(j.vector, j.manifest);
  fs.writeFileSync(outPath, payload);
  console.log(`Decoded ${inPath} -> ${outPath} (${payload.length} bytes)`);
  process.exit(0);
}

const dim = Number(args.dim);
if (!Number.isInteger(dim) || dim <= 0) {
  console.error('Error: --dim is required and must be a positive integer');
  process.exit(1);
}
const seed = args.seed ?? 'harmonic';
const base = args.base ? Number(args.base) : 1;
const harmonics = args.harmonics ? String(args.harmonics).split(',').map(Number).filter(n => Number.isFinite(n) && n > 0) : [1,2,3,4,5];
const gain = args.gain ? Number(args.gain) : 1.0;
const placeholders = [];
if (args.placeholders) {
  for (const token of String(args.placeholders).split(',')) {
    const mK = /^k:(\-?\d+):(\-?\d*\.?\d+)$/.exec(token);
    const mR = /^range:(\d+)\.\.(\d+):(\-?\d*\.?\d+)$/.exec(token);
    if (mK) {
      placeholders.push({ k: Number(mK[1]), amplitude: Number(mK[2]) });
    } else if (mR) {
      placeholders.push({ range: { start: Number(mR[1]), end: Number(mR[2]) }, amplitude: Number(mR[3]) });
    }
  }
}

const result = generateTemplate({ dim, seed, baseFreq: base, harmonics, placeholders, gain });
const outPath = args.out;
if (outPath) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify({
    meta: { dim, seed, base, harmonics, gain, placeholders },
    vector: result.vector
  }, null, 2));
  console.log(`Wrote ${outPath}`);
} else {
  console.log(JSON.stringify(result.vector));
}

if (args.format) {
  const candidatePaths = [];
  if (path.isAbsolute(args.format)) {
    candidatePaths.push(args.format);
  } else {
    candidatePaths.push(path.resolve(process.cwd(), args.format));
    if (process.env.INIT_CWD) candidatePaths.push(path.resolve(process.env.INIT_CWD, args.format));
    candidatePaths.push(path.resolve(process.cwd(), '..', '..', args.format));
  }
  let fmtPath = null;
  for (const p of candidatePaths) {
    if (fs.existsSync(p)) { fmtPath = p; break; }
  }
  if (!fmtPath) {
    console.error(`Error: --format file not found: ${args.format}`);
    process.exit(1);
  }
  const txt = fs.readFileSync(fmtPath, 'utf8');
  const rendered = applyPlaceholdersToData(txt, placeholders);
  const fmtOut = args.formatOut
    ? (path.isAbsolute(args.formatOut) ? args.formatOut : path.resolve(process.env.INIT_CWD || process.cwd(), args.formatOut))
    : path.join(path.dirname(fmtPath), path.basename(fmtPath) + '.rendered.txt');
  fs.writeFileSync(fmtOut, rendered);
  console.log(`Rendered placeholders into ${fmtOut}`);
}
