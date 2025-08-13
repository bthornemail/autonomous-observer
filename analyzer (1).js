const { fetchUrl } = require('./rss');
const { parseRss, mockItems } = require('./parse');
const { PHI, defaultSeeds, extractKeywords, harmonicSignature, buildKnowledgeTrieFromSeeds } = require('./knowledge');
const { loadProfile, applyPersonalization } = require('./personalize');

async function loadFeeds(urls, mock) {
  if (mock || !urls || urls.length === 0) {
    return mockItems();
  }
  const xmls = await Promise.allSettled(urls.map(u => fetchUrl(u)));
  const items = [];
  for (const res of xmls) {
    if (res.status === 'fulfilled') {
      items.push(...parseRss(res.value));
    }
  }
  return items;
}

function analyzeItem(item, seeds) {
  const text = `${item.title} ${item.description || ''}`.toLowerCase();
  const matches = [];
  let total = 0;
  let resonance = 0;
  const categories = new Set();

  for (const s of seeds) {
    let score = 0;
    const matchedKeywords = [];
    for (const kw of s.keywords) {
      if (text.includes(kw)) { score += 0.1; matchedKeywords.push(kw); }
    }
    const semantic = ['anarchist','syndicalist','cooperative','mutual','direct action','decentralized','worker','solidarity'];
    for (const sw of semantic) if (text.includes(sw)) score += 0.2;

    score *= (s.revolutionaryValue || 0.5);

    if (score > 0.1) {
      matches.push({ id: s.id, label: `${s.subject} -> ${s.object}`, score, matchedKeywords, category: s.category });
      total += score;
      categories.add(s.category);
      resonance += s.harmonicSignature * score;
    }
  }

  resonance *= PHI;
  total = Math.min(total, 1.0);

  const recs = [];
  if (total > 0.75) recs.push('High thematic potential');
  if (categories.has('economic_democracy')) recs.push('Economic democracy: share with coop networks');
  if (categories.has('technological_liberation')) recs.push('Tech liberation: share with decentralization communities');

  return { item, total, resonance, categories: Array.from(categories), matches, recs };
}

function buildConnections(analyses) {
  // Build a simple co-occurrence graph between seeds across items
  const graph = {}; // seedId -> seedId -> weight
  for (const a of analyses) {
    const ids = a.matches.map(m => m.id);
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const u = ids[i], v = ids[j];
        graph[u] = graph[u] || {}; graph[u][v] = (graph[u][v] || 0) + 1;
        graph[v] = graph[v] || {}; graph[v][u] = (graph[v][u] || 0) + 1;
      }
    }
  }
  return graph;
}

async function analyzeFeeds({ urls = [], mock = false, profilePath = null }) {
  const items = await loadFeeds(urls, mock);
  const seeds = defaultSeeds();
  const trie = buildKnowledgeTrieFromSeeds(seeds);
  const profile = loadProfile(profilePath);

  const analyses = items.map(item => {
    const base = analyzeItem(item, seeds);
    return applyPersonalization(base, profile);
  });

  const connections = buildConnections(analyses);
  const avg = analyses.reduce((s,a)=>s + a.total, 0) / (analyses.length || 1);

  return {
    meta: {
      processedAt: new Date().toISOString(),
      urls, mock,
      seedCount: seeds.length,
      averageScore: avg,
    },
    knowledge: { trie },
    items: analyses,
    connections
  };
}

module.exports = { analyzeFeeds };
