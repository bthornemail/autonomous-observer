#!/usr/bin/env node
// Ingest ChatGPT History export and produce a knowledge report for merging
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(process.cwd());
const CHAT_DIR = process.env.CHAT_DIR || path.join(ROOT, 'archive', 'Chat GPT HIstory');
const OUT_DIR = path.join(ROOT, 'cleaned-reports');
const OUT_PATH = path.join(OUT_DIR, 'chatgpt-history-knowledge.json');

function safeReadJSON(p) {
  try {
    const txt = fs.readFileSync(p, 'utf8');
    return JSON.parse(txt);
  } catch {
    return null;
  }
}

function extractFromMessageText(text, sourceFile) {
  const triples = [];
  const patterns = [
    { regex: /(golden ratio|phi|sacred geometry)/gi, make: (m) => ({ subject: 'Sacred Geometry', predicate: 'mentions', object: m.toLowerCase(), confidence: 0.7 }) },
    { regex: /(universal life protocol|ulp)/gi, make: (m) => ({ subject: 'Universal Life Protocol', predicate: 'references', object: m.toLowerCase(), confidence: 0.8 }) },
    { regex: /(knowledge trie|knowledge graph|embedding|vector db)/gi, make: (m) => ({ subject: 'Knowledge System', predicate: 'mentions', object: m.toLowerCase(), confidence: 0.7 }) },
    { regex: /(jwt|api key|rate limit|prometheus|metrics)/gi, make: (m) => ({ subject: 'Operations', predicate: 'concerns', object: m.toLowerCase(), confidence: 0.7 }) },
  ];
  for (const pat of patterns) {
    let match;
    while ((match = pat.regex.exec(text)) !== null) {
      const obj = pat.make(match[0]);
      obj.sourceFile = sourceFile;
      obj.timestamp = new Date().toISOString();
      triples.push(obj);
    }
  }
  // Simple "X is Y" extractor
  const isRe = /([A-Z][A-Za-z0-9 _-]{2,})\s+is\s+([A-Za-z0-9 _-]{2,})[\.!?]/g;
  let im;
  while ((im = isRe.exec(text)) !== null) {
    const s = im[1].trim();
    const o = im[2].trim();
    if (s && o) {
      triples.push({ subject: s, predicate: 'is', object: o, confidence: 0.6, sourceFile, timestamp: new Date().toISOString() });
    }
  }
  return triples;
}

function extractFromConversations(convos, label) {
  const triples = [];
  if (!Array.isArray(convos)) return triples;
  for (const c of convos) {
    const title = c?.title || label;
    // OpenAI export style has mapping nodes
    const mapping = c?.mapping || {};
    for (const key of Object.keys(mapping)) {
      const node = mapping[key];
      const msg = node?.message;
      const role = msg?.author?.role;
      const parts = msg?.content?.parts;
      if (!parts || !Array.isArray(parts)) continue;
      for (const p of parts) {
        const text = typeof p === 'string' ? p : (p?.text || '');
        if (!text || text.length < 15) continue;
        const t = extractFromMessageText(text, `${label}:${title}`);
        triples.push(...t);
      }
    }
  }
  return triples;
}

function ensureDir(p) { try { fs.mkdirSync(p, { recursive: true }); } catch { } }

async function main() {
  console.log('[ingest] scanning dir', CHAT_DIR);
  const convPath = path.join(CHAT_DIR, 'conversations.json');
  const sharedPath = path.join(CHAT_DIR, 'shared_conversations.json');

  const conv = safeReadJSON(convPath);
  const shared = safeReadJSON(sharedPath);

  let triples = [];
  if (conv) triples.push(...extractFromConversations(conv, 'conversations'));
  if (shared) triples.push(...extractFromConversations(shared, 'shared'));

  // Fallback: parse chat.html lightly (strip tags)
  const chatHtml = path.join(CHAT_DIR, 'chat.html');
  try {
    const html = fs.readFileSync(chatHtml, 'utf8');
    const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 200000);
    triples.push(...extractFromMessageText(text, 'chat.html'));
  } catch { }

  ensureDir(OUT_DIR);
  const report = {
    metadata: {
      source: CHAT_DIR,
      generatedAt: new Date().toISOString(),
      totalTriples: triples.length
    },
    triples
  };
  fs.writeFileSync(OUT_PATH, JSON.stringify(report, null, 2));
  console.log('[ingest] wrote', OUT_PATH, 'triples:', triples.length);
}

main().catch((e) => { console.error('[ingest] failed', e); process.exit(1); });
