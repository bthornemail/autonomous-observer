const crypto = require('crypto');

const PHI = (1 + Math.sqrt(5)) / 2;

function extractKeywords(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2)
    .filter(w => !['the','and','for','are','but','not','you','all','can','had','her','was','one','our','out','day','get','has','him','his','how','its','may','new','now','old','see','two','way','who','boy','did','man','run','try','ask','big','end','far','fun','got','let','put','say','she','too','use'].includes(w));
}

function harmonicSignature(a,b,c) {
  const text = `${a}${b}${c}`;
  const hash = crypto.createHash('md5').update(text).digest('hex');
  const numeric = parseInt(hash.substring(0,8),16);
  return ((numeric % 1000) / 1000) * PHI;
}

function defaultSeeds() {
  const manual = [
    {
      id: 'manual-1', subject: 'Cooperative Economy', predicate: 'implements', object: 'worker ownership',
      revolutionaryValue: 0.98, category: 'economic_democracy', keywords: ['cooperative','worker','ownership','democracy','mutual aid']
    },
    {
      id: 'manual-2', subject: 'Direct Action', predicate: 'challenges', object: 'hierarchical power',
      revolutionaryValue: 0.95, category: 'revolutionary_praxis', keywords: ['direct action','mutual aid','solidarity','organizing','protest']
    },
    {
      id: 'manual-3', subject: 'Decentralized Technology', predicate: 'enables', object: 'autonomous communities',
      revolutionaryValue: 0.92, category: 'technological_liberation', keywords: ['decentralized','p2p','blockchain','mesh networks','open source']
    },
    {
      id: 'manual-4', subject: 'Sacred Geometry', predicate: 'guides', object: 'natural harmony',
      revolutionaryValue: 0.90, category: 'mathematical_foundation', keywords: ['golden ratio','fibonacci','sacred geometry','natural patterns','harmony']
    }
  ];
  for (const s of manual) s.harmonicSignature = harmonicSignature(s.subject, s.predicate, s.object);
  return manual;
}

function buildKnowledgeTrieFromSeeds(seeds) {
  // Simple trie keyed by subject -> predicate -> object
  const root = {};
  for (const s of seeds) {
    root[s.subject] = root[s.subject] || {};
    root[s.subject][s.predicate] = root[s.subject][s.predicate] || {};
    root[s.subject][s.predicate][s.object] = {
      id: s.id,
      category: s.category,
      revolutionaryValue: s.revolutionaryValue,
      keywords: s.keywords,
      harmonicSignature: s.harmonicSignature
    };
  }
  return root;
}

module.exports = {
  PHI,
  extractKeywords,
  harmonicSignature,
  defaultSeeds,
  buildKnowledgeTrieFromSeeds
};
