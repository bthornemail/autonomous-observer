import React, { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

const TetrahedronVertex: React.FC<{ 
  position: [number, number, number], 
  color: string, 
  label: string,
  isActive: boolean,
  onClick: () => void 
}> = ({ position, color, label, isActive, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5
      meshRef.current.scale.setScalar(isActive ? 1.2 : 1.0)
    }
  })

  return (
    <group position={position}>
      <mesh ref={meshRef} onClick={onClick}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={isActive ? 1.0 : 0.8}
          emissive={color}
          emissiveIntensity={isActive ? 0.3 : 0.1}
        />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <planeGeometry args={[1, 0.3]} />
        <meshBasicMaterial transparent opacity={0.8} color="white" />
      </mesh>
    </group>
  )
}

const TetrahedronFrame: React.FC = () => {
  const lineRef = useRef<THREE.LineSegments>(null)

  useEffect(() => {
    if (lineRef.current) {
      const vertices = new Float32Array([
        // Base triangle
        -1, -0.5, -0.5,  1, -0.5, -0.5,
        1, -0.5, -0.5,   0, -0.5, 1,
        0, -0.5, 1,      -1, -0.5, -0.5,
        // Apex connections
        -1, -0.5, -0.5,  0, 1.2, 0.2,
        1, -0.5, -0.5,   0, 1.2, 0.2,
        0, -0.5, 1,      0, 1.2, 0.2,
      ])
      
      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
      lineRef.current.geometry = geometry
    }
  }, [])

  return (
    <lineSegments ref={lineRef}>
      <lineBasicMaterial color="#ffd700" opacity={0.6} transparent />
    </lineSegments>
  )
}

const TetrahedronExplorer: React.FC = () => {
  const [activeVertex, setActiveVertex] = useState<string | null>(null)

  const vertexData = {
    'claude_code': {
      position: [0, 1.2, 0.2] as [number, number, number],
      color: '#ff6b9d',
      label: 'Claude Code',
      description: 'MCP Tools & Analysis (Northwest Vertex)',
      features: ['Repository Analysis', 'Sacred Geometry Calculations', 'Framework Documentation']
    },
    'copilot': {
      position: [1, -0.5, -0.5] as [number, number, number], 
      color: '#4ecdc4',
      label: 'CoPilot Universe',
      description: 'AI Pair Programming (Northeast Vertex)',
      features: ['Agent Communication', 'Real-time Assistance', 'Harmonic Protocols']
    },
    'brian_thorne': {
      position: [-1, -0.5, -0.5] as [number, number, number],
      color: '#45b7d1', 
      label: 'Brian Thorne',
      description: 'Human Coordination (Southwest Vertex)',
      features: ['Strategic Direction', 'Vision Keeping', 'Multi-branch Management']
    },
    'ollama': {
      position: [0, -0.5, 1] as [number, number, number],
      color: '#96ceb4',
      label: 'Ollama Local',
      description: 'Autonomous Reflection (Southeast Vertex)', 
      features: ['Local AI Models', 'Resource Monitoring', 'Knowledge Trie Interaction']
    }
  }

  return (
    <div style={{ width: '100%', height: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10, color: 'white' }}>
        <h2>🔺 Universal Life Protocol Tetrahedron</h2>
        <p>Interactive 4-Vertex Autonomous Development Architecture</p>
      </div>

      <Canvas camera={{ position: [3, 3, 3], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#ffd700" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff6b9d" />

        <TetrahedronFrame />

        {Object.entries(vertexData).map(([key, data]) => (
          <TetrahedronVertex
            key={key}
            position={data.position}
            color={data.color}
            label={data.label}
            isActive={activeVertex === key}
            onClick={() => setActiveVertex(activeVertex === key ? null : key)}
          />
        ))}

        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>

      {activeVertex && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px', 
          right: '20px',
          background: 'rgba(0,0,0,0.8)',
          padding: '20px',
          borderRadius: '10px',
          color: 'white',
          zIndex: 10
        }}>
          <h3 style={{ color: vertexData[activeVertex].color }}>
            {vertexData[activeVertex].label}
          </h3>
          <p>{vertexData[activeVertex].description}</p>
          <ul>
            {vertexData[activeVertex].features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
          <button 
            onClick={() => setActiveVertex(null)}
            style={{
              background: 'transparent',
              border: '1px solid #ffd700',
              color: '#ffd700',
              padding: '8px 16px',
              borderRadius: '5px',
              marginTop: '10px'
            }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  )
}

export default TetrahedronExplorer