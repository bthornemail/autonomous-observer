import { createUniverse, tickUniverse } from './physics.js';
import ForceGraph2D from 'https://cdn.jsdelivr.net/npm/force-graph@1.50.1/+esm';
import ForceGraph3D from 'https://cdn.jsdelivr.net/npm/3d-force-graph@1.78.4/+esm';

const el2d = document.getElementById('graph2d');
const el3d = document.getElementById('graph3d');

// --- Physics engine integration ---
let universe = createUniverse({ nodeCount: 20, p: 3, q: 3, phaseMod: 12 });

const g2d = ForceGraph2D()(el2d)
  .graphData(universe)
  .nodeColor(n => n.chirality > 0 ? '#1e90ff' : '#ff6347')
  .nodeVal(n => 6 + n.phase)
  .nodeLabel(n => `id: ${n.id}\np: ${n.p} q: ${n.q}\nphase: ${n.phase}\nchirality: ${n.chirality}\ndual: ${n.dual}`);

const g3d = ForceGraph3D()(el3d)
  .graphData(universe)
  .nodeColor(n => n.dual > 0 ? '#32cd32' : '#ffa500')
  .nodeVal(n => 6 + n.phase)
  .nodeLabel(n => `id: ${n.id}\np: ${n.p} q: ${n.q}\nphase: ${n.phase}\nchirality: ${n.chirality}\ndual: ${n.dual}`);

function setMode(mode) {
  el2d.classList.toggle('active', mode === '2d');
  el3d.classList.toggle('active', mode === '3d');
}

function updateGraph() {
  g2d.graphData(universe);
  g3d.graphData(universe);
}

// --- Physics panel ---
const panel = document.createElement('div');
panel.style = 'position:fixed;top:8px;right:8px;background:#fff;padding:8px;border-radius:8px;z-index:10;max-width:320px;';
panel.innerHTML = `
  <b>Physics Panel</b><br/>
  <div>Schläfli: <span id="pq"></span></div>
  <div>Phase Mod: <span id="phmod"></span></div>
  <button id="tickBtn">Tick Phase</button>
`;
document.body.appendChild(panel);

function updatePanel() {
  document.getElementById('pq').textContent = `{p: ${universe.nodes[0].p}, q: ${universe.nodes[0].q}}`;
  document.getElementById('phmod').textContent = '12';
}

updatePanel();

document.getElementById('tickBtn').onclick = () => {
  tickUniverse(universe, 12);
  updateGraph();
};

// Toolbar
const btn2d = document.getElementById('btn2d');
const btn3d = document.getElementById('btn3d');
const btnvr = document.getElementById('btnvr');
const btnar = document.getElementById('btnar');

btn2d.onclick = () => setMode('2d');
btn3d.onclick = () => setMode('3d');

// Placeholder for VR/AR (future: 3d-force-graph-vr/ar)
btnvr.onclick = async () => {
  alert('VR mode to be added via 3d-force-graph-vr');
};
btnar.onclick = async () => {
  alert('AR mode to be added via 3d-force-graph-ar');
};

// --- Add stable tetrahedron mesh to 3D scene with dynamic opacity ---
let tetraPhase = 0;
let tetraStable = true;

function getTetraOpacity() {
  // Example: if in transition (phase odd), more opaque; if stable (phase even), more transparent
  return tetraStable ? 0.2 : 0.7;
}

function updateTetrahedronPhase() {
  // Example: alternate stable/transition every tick
  tetraPhase = (tetraPhase + 1) % 6;
  tetraStable = (tetraPhase % 2 === 0);
  if (g3d.tetraMesh) {
    g3d.tetraMesh.material.opacity = getTetraOpacity();
    g3d.tetraMesh.material.needsUpdate = true;
  }
}

g3d.onEngineStop(() => {
  // Remove any previous tetrahedron
  if (g3d.tetraMesh && g3d.scene()) {
    g3d.scene().remove(g3d.tetraMesh);
    g3d.tetraMesh = null;
  }
  // Add new tetrahedron
  if (g3d.scene && g3d.scene()) {
    const THREE = g3d.THREE;
    const geometry = new THREE.TetrahedronGeometry(40);
    const material = new THREE.MeshStandardMaterial({ color: 0x00ffff, opacity: getTetraOpacity(), transparent: true, emissive: 0x008888 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 0, 0);
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    g3d.scene().add(mesh);
    g3d.tetraMesh = mesh;
  }
});

g3d.onEngineTick(() => {
  // Keep tetrahedron mesh fixed at origin
  if (g3d.tetraMesh) {
    g3d.tetraMesh.position.set(0, 0, 0);
    g3d.tetraMesh.rotation.y += 0.01; // gentle spin for visual effect
  }
  updateTetrahedronPhase();
});

// --- Tetrahedron vertex interaction and knowledge ray ---
let selectedVertex = null;

function addTetrahedronVertexHelpers() {
  if (!g3d.tetraMesh) return;
  const THREE = g3d.THREE;
  // Remove old helpers
  if (g3d.vertexHelpers) {
    g3d.vertexHelpers.forEach(h => g3d.scene().remove(h));
  }
  g3d.vertexHelpers = [];
  // Add spheres at each vertex
  const verts = g3d.tetraMesh.geometry.attributes.position;
  for (let i = 0; i < verts.count; i++) {
    const v = new THREE.Vector3().fromBufferAttribute(verts, i);
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(6, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xffff00, opacity: 0.7, transparent: true })
    );
    sphere.position.copy(v);
    sphere.userData.vertexIndex = i;
    g3d.scene().add(sphere);
    g3d.vertexHelpers.push(sphere);
  }
}

g3d.onEngineStop(() => {
  // ...existing code...
  setTimeout(addTetrahedronVertexHelpers, 200); // add helpers after mesh
});

g3d.onEngineTick(() => {
  // ...existing code...
  // Draw ray if a vertex is selected
  if (selectedVertex !== null && g3d.tetraMesh) {
    const THREE = g3d.THREE;
    if (g3d.knowledgeRay) g3d.scene().remove(g3d.knowledgeRay);
    const verts = g3d.tetraMesh.geometry.attributes.position;
    const v = new THREE.Vector3().fromBufferAttribute(verts, selectedVertex);
    const centroid = new THREE.Vector3(0, 0, 0);
    for (let i = 0; i < verts.count; i++) centroid.add(new THREE.Vector3().fromBufferAttribute(verts, i));
    centroid.divideScalar(verts.count);
    const dir = centroid.clone().sub(v).normalize();
    const arrow = new THREE.ArrowHelper(dir, v, 80, 0xff00ff, 12, 8);
    g3d.scene().add(arrow);
    g3d.knowledgeRay = arrow;
  } else if (g3d.knowledgeRay) {
    g3d.scene().remove(g3d.knowledgeRay);
    g3d.knowledgeRay = null;
  }
});

// Raycaster for vertex click
el3d.addEventListener('pointerdown', e => {
  if (!g3d.tetraMesh || !g3d.vertexHelpers) return;
  const mouse = { x: (e.offsetX / el3d.clientWidth) * 2 - 1, y: -(e.offsetY / el3d.clientHeight) * 2 + 1 };
  const camera = g3d.camera();
  const raycaster = new g3d.THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(g3d.vertexHelpers);
  if (intersects.length > 0) {
    selectedVertex = intersects[0].object.userData.vertexIndex;
    // Optionally: highlight knowledge vertices (here, just log phase info)
    console.log('Selected vertex', selectedVertex, 'phase:', tetraPhase);
  } else {
    selectedVertex = null;
  }
});
