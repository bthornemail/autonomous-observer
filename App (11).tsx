import React, { useState } from 'react'
import PersonalHarmonyCalculator from './components/PersonalHarmonyCalculator'
import SacredGeometryVisualizer from './components/SacredGeometryVisualizer'
import MeditationCompanion from './components/MeditationCompanion'
import PersonalityProfiler from './components/PersonalityProfiler'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('harmony')
  
  return (
    <div className="app">
      <header className="app-header">
        <h1>🌸 Sacred Geometry Harmony</h1>
        <p>Ancient Mathematics for Modern Wellbeing</p>
        <div className="app-subtitle">
          Transform your life through sacred patterns, golden ratio calculations, and guided meditation
        </div>
      </header>

      <nav className="app-nav">
        <button 
          className={activeTab === 'harmony' ? 'active' : ''}
          onClick={() => setActiveTab('harmony')}
          title="Calculate your personal harmony score using sacred mathematics"
        >
          📐 Harmony Calculator
        </button>
        <button 
          className={activeTab === 'visualizer' ? 'active' : ''}
          onClick={() => setActiveTab('visualizer')}
          title="Explore interactive sacred geometry patterns"
        >
          ✨ Sacred Geometry
        </button>
        <button 
          className={activeTab === 'meditation' ? 'active' : ''}
          onClick={() => setActiveTab('meditation')}
          title="Guided meditation with phi breathing and sacred patterns"
        >
          🧘 Meditation
        </button>
        <button 
          className={activeTab === 'personality' ? 'active' : ''}
          onClick={() => setActiveTab('personality')}
          title="Discover your revolutionary potential through personality analysis"
        >
          🧠 Personality Profiler
        </button>
      </nav>

      <main className="app-main">
        {activeTab === 'harmony' && <PersonalHarmonyCalculator />}
        {activeTab === 'visualizer' && <SacredGeometryVisualizer />}
        {activeTab === 'meditation' && <MeditationCompanion />}
        {activeTab === 'personality' && <PersonalityProfiler />}
      </main>

      <footer className="app-footer">
        <p>✨ Discover your personal harmony through the mathematics of nature ✨</p>
        <div className="footer-links">
          <a href="https://github.com/universallifeprotocol/sacred-geometry-harmony" target="_blank" rel="noopener noreferrer">
            📚 Documentation
          </a>
          <span>•</span>
          <a href="https://github.com/universallifeprotocol/sacred-geometry-harmony/issues" target="_blank" rel="noopener noreferrer">
            💬 Support
          </a>
          <span>•</span>
          <span>Open Source MIT License</span>
        </div>
      </footer>
    </div>
  )
}

export default App