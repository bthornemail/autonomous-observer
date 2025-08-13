#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'public');
const projectRoot = path.join(__dirname, '..');
const reportPath = path.join(projectRoot, 'output', 'report.json');

fs.mkdirSync(outDir, { recursive: true });

// Write feed.json
let feed = { error: 'no report found' };
try {
  if (fs.existsSync(reportPath)) {
    const raw = fs.readFileSync(reportPath, 'utf8');
    feed = JSON.parse(raw);
  }
} catch (e) {
  // ignore
}
fs.writeFileSync(path.join(outDir, 'feed.json'), JSON.stringify(feed, null, 2));

// Write RSS 2.0 feed.xml
function xmlEscape(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;'); }
const items = (feed.items || []).map(function(it){
  const title = xmlEscape(it.item?.title || 'Untitled');
  const link = xmlEscape(it.item?.link || '');
  const desc = xmlEscape((it.item?.description || '').slice(0,280));
  const cats = (it.categories||[]).map(c=>`<category>${xmlEscape(c)}</category>`).join('');
  const score = `Score ${( (it.total||0)*100 ).toFixed(1)}% | Resonance ${(it.resonance||0).toFixed(3)}`;
  const fullDesc = `${desc}\n${xmlEscape(score)}`;
  return [
    '<item>',
    `  <title>${title}</title>`,
    (link?`  <link>${link}</link>`:''),
    `  <description>${fullDesc}</description>`,
    cats,
    '</item>'
  ].join('\n');
}).join('\n');

const rss = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<rss version="2.0">',
  '  <channel>',
  '    <title>News Syndicator (Free)</title>',
  '    <link>http://localhost/</link>',
  '    <description>Static feed generated from analyzer report</description>',
  items,
  '  </channel>',
  '</rss>'
].join('\n');

fs.writeFileSync(path.join(outDir, 'feed.xml'), rss);

const html = [
  '<!doctype html>',
  '<html>',
  '<head>',
  '  <meta charset="utf-8" />',
  '  <meta name="viewport" content="width=device-width, initial-scale=1" />',
  '  <title>News Syndicator (Free)</title>',
  '  <style>',
  '    body{font-family:sans-serif;max-width:960px;margin:2rem auto;padding:0 1rem}',
  '    .item{border:1px solid #ddd;padding:1rem;margin:1rem 0;border-radius:8px}',
  '    .muted{color:#666}',
  '    .tag{display:inline-block;background:#eef;border:1px solid #ccd;padding:2px 6px;border-radius:4px;margin-right:4px}',
  '    .grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem}',
  '    .box{border:1px dashed #ccc;padding:1rem}',
  '  </style>',
  '</head>',
  '<body>',
  '  <h1>News Syndicator (Free)</h1>',
  '  <p class="muted">Static site generated from analyzer report. No servers, no paid APIs.</p>',
  '  <section>',
  '    <h2>Items</h2>',
  '    <div id="items"></div>',
  '  </section>',
  '  <section class="grid">',
  '    <div class="box">',
  '      <h2>Average Score</h2>',
  '      <div id="avg"></div>',
  '    </div>',
  '    <div class="box">',
  '      <h2>Connections (co-occurrence)</h2>',
  '      <pre id="graph"></pre>',
  '    </div>',
  '  </section>',
  '  <script>',
  '    (function(){',
  '      function $(id){ return document.getElementById(id); }',
  '      fetch("./feed.json").then(function(r){return r.json();}).then(function(data){',
  '        var items = data.items || [];',
  '        var itemsEl = $("items");',
  '        for (var i=0;i<items.length;i++){',
  '          var it = items[i];',
  '          var div = document.createElement("div");',
  '          div.className = "item";',
  '          var cats = (it.categories||[]).map(function(c){ return "<span class=\"tag\">"+c+"</span>"; }).join(" ");',
  '          var recs = (it.recs||[]).map(function(r){ return "<li>"+r+"</li>"; }).join("");',
  '          var title = (it.item && it.item.title) ? it.item.title : "Untitled";',
  '          var link = (it.item && it.item.link) ? it.item.link : "#";',
  '          var descr = (it.item && it.item.description) ? it.item.description : "";',
  '          var scoreLine = "Score: " + ( (it.total*100).toFixed(1) ) + "% | Resonance: " + ((it.resonance||0).toFixed(3));',
  '          div.innerHTML = "<h3><a href=\""+link+"\" target=\"_blank\" rel=\"noopener\">"+title+"</a></h3>"'
  + '            + "<p>"+descr.slice(0,280)+"</p>"'
  + '            + "<div>"+cats+"</div>"'
  + '            + "<div class=\"muted\">"+scoreLine+"</div>"'
  + '            + (recs ? "<ul>"+recs+"</ul>" : "");',
  '          itemsEl.appendChild(div);',
  '        }',
  '        var avg = (data.meta && data.meta.averageScore) ? data.meta.averageScore : 0;',
  '        $("avg").textContent = (avg*100).toFixed(1) + "%";',
  '        $("graph").textContent = JSON.stringify(data.connections||{}, null, 2);',
  '      });',
  '    })();',
  '  </script>',
  '</body>',
  '</html>'
].join('\n');

fs.writeFileSync(path.join(outDir, 'index.html'), html);
console.log('Built static site into ' + outDir);
