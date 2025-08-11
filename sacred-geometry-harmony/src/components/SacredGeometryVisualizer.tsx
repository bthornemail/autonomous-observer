import React, { useState, useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import SacredGeometryEngine from '../lib/SacredGeometryEngine'

// Seed of Life Component (7 circles - the foundation)
const SeedOfLife: React.FC = () => {
  const meshRef = useRef<THREE.Group>(null)
  const points = SacredGeometryEngine.generateSeedOfLifePositions()

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.15
    }
  })

  return (
    <group ref={meshRef}>
      {points.map((point, index) => (
        <mesh key={index} position={[point.x / 100, point.y / 100, point.z / 100]}>
          <circleGeometry args={[0.8, 32]} />
          <meshBasicMaterial 
            color={point.layer === 0 ? '#ffd700' : '#ff6b9d'} 
            transparent 
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
      {/* Add connecting lines to show the sacred pattern */}
      {points.slice(1).map((point, index) => (
        <line key={`line-${index}`}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([0, 0, 0, point.x / 100, point.y / 100, point.z / 100])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#ffd700" opacity={0.3} transparent />
        </line>
      ))}
    </group>
  )
}

// Flower of Life Component
const FlowerOfLife: React.FC<{ layers: number }> = ({ layers }) => {
  const meshRef = useRef<THREE.Group>(null)
  const [points, setPoints] = useState(() => SacredGeometryEngine.generateFlowerOfLifePositions(layers))

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.2
    }
  })

  return (
    <group ref={meshRef}>
      {points.map((point, index) => (
        <mesh key={index} position={[point.x / 100, point.y / 100, point.z / 100]}>
          <circleGeometry args={[0.5, 32]} />
          <meshBasicMaterial 
            color={point.layer === 0 ? '#ffd700' : '#00ffff'} 
            transparent 
            opacity={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  )
}

// Golden Spiral Component
const GoldenSpiral: React.FC = () => {
  const spiralRef = useRef<THREE.Line>(null)
  const points = SacredGeometryEngine.generateGoldenSpiral(3, 50)

  const spiralGeometry = new THREE.BufferGeometry()
  const positions = new Float32Array(points.length * 3)
  
  points.forEach((point, index) => {
    positions[index * 3] = point.x / 100
    positions[index * 3 + 1] = point.y / 100
    positions[index * 3 + 2] = point.z / 100
  })

  spiralGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  useFrame((state) => {
    if (spiralRef.current) {
      spiralRef.current.rotation.z = state.clock.elapsedTime * 0.5
    }
  })

  return (
    <line ref={spiralRef} geometry={spiralGeometry}>
      <lineBasicMaterial color="#ffd700" linewidth={2} />
    </line>
  )
}

// Sacred Polyhedra Component
const SacredPolyhedra: React.FC<{ shape: string }> = ({ shape }) => {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.3
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.4
    }
  })

  const getGeometry = () => {
    switch (shape) {
      case 'tetrahedron':
        return <tetrahedronGeometry args={[2]} />
      case 'cube':
        return <boxGeometry args={[2, 2, 2]} />
      case 'octahedron':
        return <octahedronGeometry args={[2]} />
      case 'dodecahedron':
        return <dodecahedronGeometry args={[2]} />
      case 'icosahedron':
        return <icosahedronGeometry args={[2]} />
      default:
        return <sphereGeometry args={[2]} />
    }
  }

  return (
    <mesh ref={meshRef}>
      {getGeometry()}
      <meshBasicMaterial 
        color="#00ffff" 
        wireframe 
        transparent 
        opacity={0.8}
      />
    </mesh>
  )
}

const SacredGeometryVisualizer: React.FC = () => {
  const [activeVisualization, setActiveVisualization] = useState('seed')
  const [layers, setLayers] = useState(3)
  const [polyhedronShape, setPolyhedronShape] = useState('tetrahedron')

  return (
    <div className="visualizer-container">
      <h2>✨ Sacred Geometry Visualizer</h2>
      <p>Explore the mathematical patterns that govern harmony and beauty</p>

      <div style={{ marginBottom: '2rem' }}>
        <button 
          className={`sacred-button ${activeVisualization === 'seed' ? 'active' : ''}`}
          onClick={() => setActiveVisualization('seed')}
        >
          🌱 Seed of Life
        </button>
        <button 
          className={`sacred-button ${activeVisualization === 'flower' ? 'active' : ''}`}
          onClick={() => setActiveVisualization('flower')}
        >
          🌸 Flower of Life
        </button>
        <button 
          className={`sacred-button ${activeVisualization === 'spiral' ? 'active' : ''}`}
          onClick={() => setActiveVisualization('spiral')}
        >
          🌀 Golden Spiral
        </button>
        <button 
          className={`sacred-button ${activeVisualization === 'polyhedra' ? 'active' : ''}`}
          onClick={() => setActiveVisualization('polyhedra')}
        >
          💎 Sacred Solids
        </button>
      </div>

      {activeVisualization === 'flower' && (
        <div style={{ marginBottom: '1rem' }}>
          <label>Layers: </label>
          <input 
            type="range" 
            min="1" 
            max="5" 
            value={layers} 
            onChange={(e) => setLayers(parseInt(e.target.value))}
          />
          <span> {layers}</span>
        </div>
      )}

      {activeVisualization === 'polyhedra' && (
        <div style={{ marginBottom: '1rem' }}>
          <label>Sacred Solid: </label>
          <select 
            value={polyhedronShape} 
            onChange={(e) => setPolyhedronShape(e.target.value)}
            style={{ 
              background: 'rgba(255,255,255,0.1)', 
              color: '#ffffff', 
              border: '2px solid #ffd700', 
              padding: '0.5rem',
              borderRadius: '5px'
            }}
          >
            <option value="tetrahedron">🔺 Tetrahedron (Fire)</option>
            <option value="cube">⬜ Cube (Earth)</option>
            <option value="octahedron">🔸 Octahedron (Air)</option>
            <option value="icosahedron">💧 Icosahedron (Water)</option>
            <option value="dodecahedron">⭐ Dodecahedron (Universe)</option>
          </select>
        </div>
      )}

      <div style={{ width: '100%', height: '500px', border: '2px solid rgba(255,215,0,0.3)', borderRadius: '15px', overflow: 'hidden' }}>
        <Canvas 
          camera={{ position: [0, 0, 10], fov: 60 }}
          style={{ background: 'radial-gradient(circle, #001122 0%, #000011 100%)' }}
        >
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#ffd700" />
          
          {activeVisualization === 'seed' && <SeedOfLife />}
          {activeVisualization === 'flower' && <FlowerOfLife layers={layers} />}
          {activeVisualization === 'spiral' && <GoldenSpiral />}
          {activeVisualization === 'polyhedra' && <SacredPolyhedra shape={polyhedronShape} />}
          
          <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
        </Canvas>
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'left', maxWidth: '800px', margin: '2rem auto' }}>
        {activeVisualization === 'seed' && (
          <div>
            <h4>🌱 Seed of Life</h4>
            <p>
              The Seed of Life is a sacred geometry symbol consisting of seven overlapping circles 
              placed with sixfold symmetry, forming a pattern of circles and lenses. It is considered 
              a fundamental form of space and time, representing the seven days of creation. This pattern 
              is the foundation from which the Flower of Life grows.
            </p>
            <p><strong>Use for:</strong> New beginnings, manifestation, creation energy, foundational meditation</p>
          </div>
        )}
        
        {activeVisualization === 'flower' && (
          <div>
            <h4>🌸 Flower of Life</h4>
            <p>
              The Flower of Life is a geometric pattern consisting of multiple evenly-spaced, 
              overlapping circles arranged in a flower-like pattern. It represents the cycle of creation 
              and contains the basis for the design of every atom, molecular structure, life form, 
              and everything in existence.
            </p>
            <p><strong>Use for:</strong> Meditation, sacred space design, spiritual growth</p>
          </div>
        )}
        
        {activeVisualization === 'spiral' && (
          <div>
            <h4>🌀 Golden Spiral</h4>
            <p>
              The Golden Spiral is based on the Golden Ratio (Φ = {SacredGeometryEngine.PHI.toFixed(6)}), 
              found throughout nature in shells, galaxies, flower petals, and human proportions. 
              This spiral represents organic growth and natural harmony.
            </p>
            <p><strong>Use for:</strong> Understanding natural patterns, design harmony, growth meditation</p>
          </div>
        )}
        
        {activeVisualization === 'polyhedra' && (
          <div>
            <h4>💎 Platonic Solids</h4>
            <p>
              The five Platonic solids represent the classical elements in ancient philosophy:
              Fire (Tetrahedron), Earth (Cube), Air (Octahedron), Water (Icosahedron), 
              and the Universe (Dodecahedron). These perfect geometric forms embody cosmic harmony.
            </p>
            <p><strong>Use for:</strong> Elemental meditation, understanding cosmic order, geometric harmony</p>
          </div>
        )}
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
        <h4>🎯 Meditation Tips</h4>
        <ul style={{ textAlign: 'left', lineHeight: '1.6' }}>
          <li><strong>Focus:</strong> Gaze at the center while breathing deeply</li>
          <li><strong>Visualize:</strong> Imagine the pattern expanding within your body</li>
          <li><strong>Breathe:</strong> Sync your breathing with the rotation</li>
          <li><strong>Intention:</strong> Set a harmony intention as you observe</li>
        </ul>
      </div>
    </div>
  )
}

export default SacredGeometryVisualizer