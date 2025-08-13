#!/usr/bin/env node
/*
 Generates a proper academic-style thesis website from the most comprehensive
 universe model and artifacts found in this repository.

 Output structure (created under thesis-site/):
  - index.html (Abstract + Table of Contents)
  - chapters/NN-*.html (numbered chapters)
  - assets/style.css
  - data/summary.json
  - .nojekyll
*/
const fs = require('fs');
const path = require('path');

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }
function writeFile(p, content) { ensureDir(path.dirname(p)); fs.writeFileSync(p, content); }
function fileExists(p) { try { fs.accessSync(p); return true; } catch { return false; } }
function readIfExists(p) { try { return fs.readFileSync(p, 'utf8'); } catch { return null; } }

function pickBestReport(root) {
  // Prefer the merged knowledge trie which has deduplicated and consolidated data
  const mergedTrie = path.join(root, 'merged-knowledge-trie.json');
  if (fileExists(mergedTrie)) return mergedTrie;
  
  const cleanedMergedTrie = path.join(root, 'cleaned-reports', 'merged-knowledge-trie.json');
  if (fileExists(cleanedMergedTrie)) return cleanedMergedTrie;
  
  // Fallback to other deduplicated files under cleaned-reports/, otherwise originals
  const candidates = [
    'ultimate-enhanced-knowledge-report.json',
    'super-enhanced-knowledge-report.json',
    'robust-knowledge-report.json',
    'universal-format-knowledge-report.json'
  ];
  const preferClean = candidates.map(f => path.join(root, 'cleaned-reports', f)).filter(fileExists);
  const pool = preferClean.length ? preferClean : candidates.map(f => path.join(root, f));
  const found = pool.filter(fileExists).map(p => ({ p, size: fs.statSync(p).size }));
  if (!found.length) return null;
  found.sort((a, b) => b.size - a.size);
  return found[0].p;
}

function traverse(obj, onObject) {
  if (Array.isArray(obj)) { for (const it of obj) traverse(it, onObject); }
  else if (obj && typeof obj === 'object') { onObject(obj); for (const k of Object.keys(obj)) traverse(obj[k], onObject); }
}

function hasTripleKeys(lowerKeys) {
  return (lowerKeys.includes('s') && lowerKeys.includes('p') && lowerKeys.includes('o')) ||
         (lowerKeys.includes('subject') && lowerKeys.includes('predicate') && lowerKeys.includes('object'));
}

function updateValidationNetworks(o, lowerKeys, acc) {
  if (lowerKeys.includes('scientificvalidationnetworks')) { const v = o['scientificValidationNetworks']; if (Array.isArray(v)) acc.validationNetworks = Math.max(acc.validationNetworks, v.length); }
  if (lowerKeys.includes('validationnetworks')) { const v = o['validationNetworks']; if (Array.isArray(v)) acc.validationNetworks = Math.max(acc.validationNetworks, v.length); }
}

function updateProgressionChains(o, lowerKeys, acc) {
  if (lowerKeys.includes('progressionchains')) { const v = o['progressionChains']; if (Array.isArray(v)) acc.progressionChains = Math.max(acc.progressionChains, v.length); }
  if (lowerKeys.includes('mathematicalprogressions')) { const v = o['mathematicalProgressions']; if (Array.isArray(v)) acc.progressionChains = Math.max(acc.progressionChains, v.length); }
}

function scanStringProps(keys, o, acc) {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === 'string') {
      const m = v.match(/\.([A-Za-z0-9]{1,8})(?:$|[?#])/);
      if (m) acc.formats.add(m[1].toLowerCase());
      if (v.includes('/') || v.includes('\\') || v.startsWith('http')) acc.files.add(v);
    }
  }
}

function inferFromObject(o, acc) {
  const keys = Object.keys(o); const lowerKeys = keys.map(k => k.toLowerCase());
  if (hasTripleKeys(lowerKeys)) acc.triples++;
  updateValidationNetworks(o, lowerKeys, acc);
  updateProgressionChains(o, lowerKeys, acc);
  scanStringProps(keys, o, acc);
}

function computeMetrics(report) {
  const acc = { triples: 0, files: new Set(), formats: new Set(), validationNetworks: 0, progressionChains: 0 };
  traverse(report, (o) => inferFromObject(o, acc));
  const summary = report.summary || report.metrics || {};
  acc.triples = Math.max(acc.triples, summary.triples || summary.totalTriples || 0);
  acc.validationNetworks = Math.max(acc.validationNetworks, summary.scientificValidationNetworks || 0);
  acc.progressionChains = Math.max(acc.progressionChains, summary.progressionChains || 0);
  const filesCount = summary.files || summary.totalFiles || acc.files.size;
  const formatsCount = summary.formats || summary.totalFormats || acc.formats.size;
  return { triples: acc.triples, files: filesCount, formats: formatsCount, validationNetworks: acc.validationNetworks, progressionChains: acc.progressionChains };
}

function mdToHtml(md) {
  if (!md) return '';
  const esc = (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  return md
    .replace(/```([\s\S]*?)```/g, (_, code) => `<pre><code>${esc(code)}</code></pre>`)
    .replace(/^######\s+(.*)$/gm, '<h6>$1</h6>')
    .replace(/^#####\s+(.*)$/gm, '<h5>$1</h5>')
    .replace(/^####\s+(.*)$/gm, '<h4>$1</h4>')
    .replace(/^###\s+(.*)$/gm, '<h3>$1</h3>')
    .replace(/^##\s+(.*)$/gm, '<h2>$1</h2>')
    .replace(/^#\s+(.*)$/gm, '<h1>$1</h1>')
    .replace(/^(\s*)[-*]\s+(.*)$/gm, '$1<li>$2</li>')
    .replace(/(<li>[^<]*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .replace(/^(?!<h\d|<ul|<pre|\s*$)(.+)$/gm, '<p>$1</p>');
}

function escHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function deriveWhy(report) {
  const candidates = [report.why, report.purpose, report.motivation, report.objectives, report.researchQuestions, report.background && report.background.motivation].filter(Boolean);
  const firstString = candidates.find(x => typeof x === 'string');
  return firstString || 'We seek a unified, empirically grounded representation of knowledge that bridges mathematical structure and scientific observation, enabling reliable inference across disciplines.';
}

function clampText(txt, maxChars = 2000) { if (!txt) return ''; return txt.length <= maxChars ? txt : txt.slice(0, maxChars).trimEnd() + '…'; }

function page(title, body, nav) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <link rel="stylesheet" href="assets/style.css" />
  <meta name="color-scheme" content="dark light" />
  <meta name="description" content="Universal Life Protocol Thesis" />
  <link rel="icon" href="data:," />
  <script>/* no js */</script>
  <style>/* inline critical minimal */ body{opacity:0.99}</style>
  <meta property="og:title" content="${title}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Universal Life Protocol" />
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"Book","name":"${title}"}</script>
</head>
<body>
  <header>
    <h1>${title}</h1>
    ${nav}
  </header>
  <main>
    ${body}
  </main>
  <footer>
    <p>© ${new Date().getUTCFullYear()} Universal Life Protocol Community</p>
  </footer>
</body>
</html>`;
}

function nav(chapters = []) {
  const links = ['<a href="index.html">Abstract & ToC</a>', ...chapters.map(([slug, title]) => `<a href="chapters/${slug}.html">${title}</a>`)].join('\n  ');
  return `<nav>\n  ${links}\n</nav>`;
}

function renderSite(outDir, modelName, metrics, report, sources) {
  const fmt = new Intl.NumberFormat('en-US');
  const chapters = [
    ['01-problem', 'Problem Statement (Why)'],
    ['02-background', 'Background & Related Work'],
    ['03-methodology', 'Methodology'],
    ['04-data', 'Data & Corpora'],
    ['05-results', 'Results'],
    ['06-discussion', 'Discussion'],
    ['07-limitations', 'Limitations'],
    ['08-future-work', 'Future Work'],
    ['09-conclusion', 'Conclusion'],
    ['10-references', 'References'],
    ['11-appendix', 'Appendix']
  ];
  const n = nav(chapters);
  const why = deriveWhy(report);
  const abstract = `
  <section class="lead">
    <h2>Abstract</h2>
    <p>${clampText(why, 800)}</p>
    <p><strong>Selected Model:</strong> ${modelName}</p>
  </section>
  <section class="metrics">
    <h2>Key Metrics</h2>
    <ul>
      <li><strong>Triples:</strong> ${fmt.format(metrics.triples)}</li>
      <li><strong>Files:</strong> ${fmt.format(metrics.files)}</li>
      <li><strong>Formats:</strong> ${fmt.format(metrics.formats)}</li>
      <li><strong>Scientific Validation Networks:</strong> ${fmt.format(metrics.validationNetworks)}</li>
      <li><strong>Mathematical Progression Chains:</strong> ${fmt.format(metrics.progressionChains)}</li>
    </ul>
  </section>
  <section>
    <h2>Table of Contents</h2>
    <ol>
      ${chapters.map(([slug, title]) => `<li><a href="chapters/${slug}.html">${title}</a></li>`).join('\n      ')}
    </ol>
  </section>`;
  writeFile(path.join(outDir, 'index.html'), page('Universal Life Protocol – Thesis', abstract, n));
  const body = {
    '01-problem': `
      <h2>Research Problem and Significance</h2>
      <p>${clampText(why, 1500)}</p>
      <h3>Objectives</h3>
      <ul>
        <li>Unify mathematical structure with empirical scientific evidence.</li>
        <li>Enable cross-domain inference with explicit provenance.</li>
        <li>Quantify model coherence using triples, validation networks, and progression chains.</li>
      </ul>
    `,
    '02-background': `
      <h2>Background & Related Work</h2>
      ${sources.exec ? `<section><h3>Executive Analysis Summary (excerpt)</h3>${mdToHtml(clampText(sources.exec, 2500))}</section>` : ''}
      ${sources.audit ? `<section><h3>Audit Report (excerpt)</h3>${mdToHtml(clampText(sources.audit, 2000))}</section>` : ''}
    `,
    '03-methodology': `
      <h2>Methodology</h2>
      <ol>
        <li>Aggregate and normalize heterogeneous knowledge sources.</li>
        <li>Induce and evolve graphs via selection pressures (relevance, coherence, scientific validation bonuses).</li>
        <li>Construct validation networks mapping mathematical constructs to empirical domains.</li>
        <li>Identify progression chains that encode conceptual derivations across disciplines.</li>
      </ol>
    `,
    '04-data': `
      <h2>Data & Corpora</h2>
      <p>Analyzed files: <strong>${fmt.format(metrics.files)}</strong> across <strong>${fmt.format(metrics.formats)}</strong> formats. See <code>data/summary.json</code> for machine-readable metrics.</p>
    `,
    '05-results': `
      <h2>Results</h2>
      <ul>
        <li>Triples identified: <strong>${fmt.format(metrics.triples)}</strong></li>
        <li>Scientific validation networks: <strong>${fmt.format(metrics.validationNetworks)}</strong></li>
        <li>Progression chains: <strong>${fmt.format(metrics.progressionChains)}</strong></li>
      </ul>
    `,
    '06-discussion': `
      <h2>Discussion</h2>
      <p>The model exhibits cross-disciplinary coherence. Validation networks indicate where mathematical constructs are grounded in empirical science; progression chains highlight conceptual dependencies across domains.</p>
    `,
    '07-limitations': `
      <h2>Limitations</h2>
      <ul>
        <li>Availability and quality of source data may bias the induced graphs.</li>
        <li>Progression chain detection may undercount nuanced conceptual links.</li>
        <li>Scientific validation networks are sensitive to mapping coverage.</li>
      </ul>
    `,
    '08-future-work': `
      <h2>Future Work</h2>
      <ul>
        <li>Deeper causal modeling and probabilistic entailment.</li>
        <li>Automated formal proof extraction and verification.</li>
        <li>Richer cross-domain datasets and improved validation mappings.</li>
      </ul>
    `,
    '09-conclusion': `
      <h2>Conclusion</h2>
      <p>We present a unifying approach that ties mathematical structure to scientific observation. The resulting knowledge fabric supports robust inference and invites further formalization.</p>
    `,
    '10-references': `
      <h2>References</h2>
      <ol>
        <li>Universal Life Protocol repository documentation.</li>
        ${sources.exec ? '<li>Executive Analysis Summary (local).</li>' : ''}
        ${sources.audit ? '<li>Autonomous Observer Audit Report (local).</li>' : ''}
      </ol>
    `,
    '11-appendix': `
      <h2>Appendix</h2>
      <p>Selected metrics snapshot:</p>
      <pre><code>${escHtml(JSON.stringify({ model: modelName, metrics }, null, 2))}</code></pre>
    `
  };
  for (const [slug, title] of chapters) {
    const html = page(`${title} – ULP Thesis`, `<section>${body[slug] || ''}</section>`, n);
    writeFile(path.join(outDir, 'chapters', `${slug}.html`), html);
  }
}

function main() {
  const root = process.cwd();
  const best = pickBestReport(root);
  if (!best) { console.error('No comprehensive report JSON found.'); process.exit(1); }
  const raw = fs.readFileSync(best, 'utf8');
  let report; try { report = JSON.parse(raw); } catch (e) { console.error('Failed to parse JSON:', best); throw e; }
  const metrics = computeMetrics(report);
  const outDir = path.join(root, 'thesis-site');
  ensureDir(outDir);
  writeFile(path.join(outDir, '.nojekyll'), '');
  const css = `:root{--bg:#0b0d10;--fg:#eaeef2;--muted:#9aa4af;--acc:#8b5cf6;--ok:#22c55e}\n*{box-sizing:border-box}html{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Helvetica,Arial,sans-serif}\nbody{margin:0;background:var(--bg);color:var(--fg);line-height:1.6}\nheader{padding:2rem 1rem;border-bottom:1px solid #222}\nheader h1{margin:0 0 0.5rem 0;font-size:1.8rem}\nnav{display:flex;flex-wrap:wrap;gap:.5rem}\nnav a{color:var(--fg);text-decoration:none;padding:.35rem .6rem;border:1px solid #222;border-radius:8px}\nnav a:hover{background:#111}\nmain{max-width:960px;margin:0 auto;padding:1.5rem}\n.lead{font-size:1.05rem;color:var(--muted)}\n.metrics ul{list-style:none;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:.5rem}\n.metrics li{background:#0f1216;border:1px solid #1b1f26;border-radius:10px;padding:.75rem}\nh2{margin-top:1.25rem}\npre{background:#0f1216;border:1px solid #1b1f26;border-radius:10px;padding:1rem;overflow:auto}\nfooter{padding:2rem 1rem;border-top:1px solid #222;color:var(--muted);text-align:center}`;
  writeFile(path.join(outDir, 'assets', 'style.css'), css);
  writeFile(path.join(outDir, 'data', 'summary.json'), JSON.stringify({ model: path.basename(best), generatedAt: new Date().toISOString(), metrics }, null, 2));
  const sources = { exec: readIfExists(path.join(root, 'EXECUTIVE_ANALYSIS_SUMMARY.md')), audit: readIfExists(path.join(root, 'AUTONOMOUS_OBSERVER_AUDIT_REPORT.md')) };
  renderSite(outDir, path.basename(best), metrics, report, sources);
  console.log(`[thesis] Generated site at: ${outDir}`);
  console.log(`[thesis] Selected model: ${path.basename(best)}`);
  console.log(`[thesis] Metrics:`, metrics);
}

if (require.main === module) { main(); }

