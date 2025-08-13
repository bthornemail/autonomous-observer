// Minimal physics engine for the Autonomous Universe
// Each entity is a {p, q, phase, chirality, dual} object
// Forces and updates are based on Schläfli symbol and phase relationships

export function createUniverse({ nodeCount = 20, p = 3, q = 3, phaseMod = 12 } = {}) {
  // Create nodes with random phase/chirality/dual
  const nodes = [];
  for (let i = 0; i < nodeCount; i++) {
    nodes.push({
      id: 'n' + i,
      p,
      q,
      phase: Math.floor(Math.random() * phaseMod),
      chirality: Math.random() < 0.5 ? 1 : -1,
      dual: Math.random() < 0.5 ? 1 : -1,
      group: i % 5
    });
  }
  // Connect nodes with random links (shared edges)
  const links = [];
  for (let i = 0; i < nodeCount * 2; i++) {
    const a = nodes[Math.floor(Math.random() * nodeCount)];
    const b = nodes[Math.floor(Math.random() * nodeCount)];
    if (a !== b) links.push({ source: a.id, target: b.id });
  }
  return { nodes, links };
}

// Update phases: each node's phase = (sum of neighbor phases + chirality + dual) mod phaseMod
export function tickUniverse(universe, phaseMod = 12) {
  const id2node = Object.fromEntries(universe.nodes.map(n => [n.id, n]));
  const neighborMap = {};
  for (const l of universe.links) {
    neighborMap[l.source] = neighborMap[l.source] || [];
    neighborMap[l.target] = neighborMap[l.target] || [];
    neighborMap[l.source].push(l.target);
    neighborMap[l.target].push(l.source);
  }
  for (const n of universe.nodes) {
    const neighbors = (neighborMap[n.id] || []).map(id => id2node[id]);
    const sum = neighbors.reduce((acc, m) => acc + (m ? m.phase : 0), 0);
    n.phase = (sum + n.chirality + n.dual) % phaseMod;
    if (n.phase < 0) n.phase += phaseMod;
  }
}
