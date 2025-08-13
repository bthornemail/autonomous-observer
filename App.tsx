import React, { useState } from 'react'
import SacredGeometryEngine from './lib/SacredGeometryEngine'
import PersonalHarmonyCalculator from './components/PersonalHarmonyCalculator'
import SacredGeometryVisualizer from './components/SacredGeometryVisualizer'
import MeditationCompanion from './components/MeditationCompanion'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('harmony')
  
  return (
    <div className="app">
      <header className="app-header">
        <h1>🌟 Personal Harmony Tools</h1>
        <p>Sacred Geometry for Inner Balance & Wellbeing</p>
      </header>

      <nav className="app-nav">
        <button 
          className={activeTab === 'harmony' ? 'active' : ''}
          onClick={() => setActiveTab('harmony')}
        >
          📐 Harmony Calculator
        </button>
        <button 
          className={activeTab === 'visualizer' ? 'active' : ''}
          onClick={() => setActiveTab('visualizer')}
        >
          ✨ Sacred Geometry
        </button>
        <button 
          className={activeTab === 'meditation' ? 'active' : ''}
          onClick={() => setActiveTab('meditation')}
        >
          🧘 Meditation
        </button>
      </nav>

      <main className="app-main">
        {activeTab === 'harmony' && <PersonalHarmonyCalculator />}
        {activeTab === 'visualizer' && <SacredGeometryVisualizer />}
        {activeTab === 'meditation' && <MeditationCompanion />}
      </main>

      <footer className="app-footer">
        <p>✨ Find your personal harmony through sacred mathematics ✨</p>
      </footer>
    </div>
  )
}

export default App