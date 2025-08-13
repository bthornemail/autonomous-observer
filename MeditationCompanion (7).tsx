import React, { useState, useEffect } from 'react'
import SacredGeometryEngine from '../lib/SacredGeometryEngine'

interface MeditationSession {
  duration: number;
  pattern: string;
  breathing: string;
  isActive: boolean;
  timeLeft: number;
}

const MeditationCompanion: React.FC = () => {
  const [session, setSession] = useState<MeditationSession>({
    duration: 5, // minutes
    pattern: 'flower_of_life',
    breathing: 'phi_breathing',
    isActive: false,
    timeLeft: 0
  })

  const [currentPhase, setCurrentPhase] = useState<'inhale' | 'hold' | 'exhale' | 'pause'>('inhale')
  const [breathCount, setBreathCount] = useState(0)

  // Meditation timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (session.isActive && session.timeLeft > 0) {
      interval = setInterval(() => {
        setSession(prev => ({
          ...prev,
          timeLeft: prev.timeLeft - 1
        }))
      }, 1000)
    } else if (session.timeLeft === 0 && session.isActive) {
      // Session complete
      setSession(prev => ({ ...prev, isActive: false }))
      alert('🌟 Meditation session complete! You are now in harmony. ✨')
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [session.isActive, session.timeLeft])

  // Phi breathing pattern (4:7:8 scaled by phi)
  const phiBreathingPattern = {
    inhale: Math.round(4 * SacredGeometryEngine.PHI),  // ~6.5 seconds
    hold: Math.round(7 * SacredGeometryEngine.PHI),    // ~11.3 seconds  
    exhale: Math.round(8 * SacredGeometryEngine.PHI),  // ~13 seconds
    pause: 2
  }

  // Breathing cycle management
  useEffect(() => {
    if (!session.isActive) return

    const cycleBreathing = () => {
      const patterns = session.breathing === 'phi_breathing' ? phiBreathingPattern : {
        inhale: 4, hold: 4, exhale: 4, pause: 2
      }

      let phase: 'inhale' | 'hold' | 'exhale' | 'pause' = 'inhale'
      let timer = patterns.inhale

      const breathingInterval = setInterval(() => {
        timer--
        
        if (timer <= 0) {
          switch (phase) {
            case 'inhale':
              phase = 'hold'
              timer = patterns.hold
              break
            case 'hold':
              phase = 'exhale'
              timer = patterns.exhale
              break
            case 'exhale':
              phase = 'pause'
              timer = patterns.pause
              setBreathCount(prev => prev + 1)
              break
            case 'pause':
              phase = 'inhale'
              timer = patterns.inhale
              break
          }
        }
        
        setCurrentPhase(phase)
      }, 1000)

      return () => clearInterval(breathingInterval)
    }

    const cleanup = cycleBreathing()
    return cleanup
  }, [session.isActive, session.breathing])

  const startMeditation = () => {
    setSession(prev => ({
      ...prev,
      isActive: true,
      timeLeft: prev.duration * 60
    }))
    setBreathCount(0)
    setCurrentPhase('inhale')
  }

  const stopMeditation = () => {
    setSession(prev => ({
      ...prev,
      isActive: false,
      timeLeft: 0
    }))
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getPhaseInstruction = (): string => {
    switch (currentPhase) {
      case 'inhale': return '🌬️ Breathe In'
      case 'hold': return '⏸️ Hold'
      case 'exhale': return '💨 Breathe Out'
      case 'pause': return '⭕ Pause'
    }
  }

  const getPatternVisualization = () => {
    if (session.pattern === 'flower_of_life') {
      return (
        <div style={{ 
          width: '200px', 
          height: '200px', 
          margin: '2rem auto',
          border: '3px solid #ffd700',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(circle, rgba(255,215,0,0.1) 0%, transparent 70%)',
          animation: session.isActive ? 'sacredPulse 4s infinite' : 'none',
          position: 'relative'
        }}>
          <div style={{
            width: '160px',
            height: '160px',
            border: '2px solid #00ffff',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '120px',
              height: '120px',
              border: '2px solid #ffd700',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem'
            }}>
              🌸
            </div>
          </div>
        </div>
      )
    }
    
    return (
      <div style={{
        width: '200px',
        height: '200px',
        margin: '2rem auto',
        border: '3px solid #ffd700',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(45deg, rgba(255,215,0,0.1), rgba(0,255,255,0.1))',
        animation: session.isActive ? 'goldenRotate 20s linear infinite' : 'none'
      }}>
        <div style={{ fontSize: '3rem', textShadow: '0 0 20px currentColor' }}>
          🌀
        </div>
      </div>
    )
  }

  return (
    <div className="meditation-companion">
      <h2>🧘 Sacred Meditation Companion</h2>
      <p>Guided meditation using sacred geometry and golden ratio breathing</p>

      {!session.isActive ? (
        <div>
          <div style={{ margin: '2rem 0' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              Duration (minutes):
            </label>
            <input
              type="range"
              min="1"
              max="30"
              value={session.duration}
              onChange={(e) => setSession(prev => ({
                ...prev,
                duration: parseInt(e.target.value)
              }))}
              style={{ width: '200px' }}
            />
            <span style={{ marginLeft: '1rem', fontSize: '1.2rem', color: '#ffd700' }}>
              {session.duration} minutes
            </span>
          </div>

          <div style={{ margin: '2rem 0' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              Sacred Pattern:
            </label>
            <select
              value={session.pattern}
              onChange={(e) => setSession(prev => ({
                ...prev,
                pattern: e.target.value
              }))}
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: '#ffffff',
                border: '2px solid #ffd700',
                padding: '0.5rem',
                borderRadius: '5px',
                fontSize: '1rem'
              }}
            >
              <option value="flower_of_life">🌸 Flower of Life</option>
              <option value="golden_spiral">🌀 Golden Spiral</option>
            </select>
          </div>

          <div style={{ margin: '2rem 0' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              Breathing Pattern:
            </label>
            <select
              value={session.breathing}
              onChange={(e) => setSession(prev => ({
                ...prev,
                breathing: e.target.value
              }))}
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: '#ffffff',
                border: '2px solid #ffd700',
                padding: '0.5rem',
                borderRadius: '5px',
                fontSize: '1rem'
              }}
            >
              <option value="phi_breathing">🌟 Phi Breathing (Advanced)</option>
              <option value="box_breathing">⬜ Box Breathing (4-4-4-2)</option>
            </select>
          </div>

          <button className="sacred-button" onClick={startMeditation}>
            ✨ Begin Sacred Meditation
          </button>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: '3rem', color: '#00ffff', margin: '1rem 0' }}>
            {formatTime(session.timeLeft)}
          </div>

          <div style={{ fontSize: '2rem', color: '#ffd700', margin: '2rem 0' }}>
            {getPhaseInstruction()}
          </div>

          {getPatternVisualization()}

          <div style={{ margin: '2rem 0' }}>
            <p>Breath Count: <span style={{ color: '#ffd700', fontSize: '1.2rem' }}>{breathCount}</span></p>
            
            {session.breathing === 'phi_breathing' && (
              <div style={{ fontSize: '0.9rem', color: '#cccccc', marginTop: '1rem' }}>
                <p>🌟 Phi Breathing Pattern (scaled by Φ = {SacredGeometryEngine.PHI.toFixed(3)}):</p>
                <p>Inhale: {phiBreathingPattern.inhale}s | Hold: {phiBreathingPattern.hold}s | Exhale: {phiBreathingPattern.exhale}s</p>
              </div>
            )}
          </div>

          <button 
            className="sacred-button" 
            onClick={stopMeditation}
            style={{ background: 'rgba(255,0,0,0.7)' }}
          >
            ⏹️ End Meditation
          </button>
        </div>
      )}

      <div style={{ marginTop: '3rem', padding: '2rem', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
        <h4>🌟 Meditation Benefits</h4>
        <ul style={{ textAlign: 'left', lineHeight: '1.8' }}>
          <li><strong>Sacred Geometry Focus:</strong> Aligns consciousness with universal patterns</li>
          <li><strong>Golden Ratio Breathing:</strong> Synchronizes with natural harmonic frequencies</li>
          <li><strong>Stress Reduction:</strong> Activates parasympathetic nervous system</li>
          <li><strong>Energy Alignment:</strong> Balances chakras through geometric visualization</li>
          <li><strong>Spiritual Connection:</strong> Opens awareness to cosmic consciousness</li>
        </ul>

        <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#cccccc' }}>
          <p>
            <strong>Phi Breathing:</strong> Uses the Golden Ratio ({SacredGeometryEngine.PHI.toFixed(6)}) 
            to create breathing patterns that resonate with natural growth spirals found in galaxies, 
            shells, and DNA. This connects your breath to the fundamental harmony of the universe.
          </p>
        </div>
      </div>
    </div>
  )
}

export default MeditationCompanion