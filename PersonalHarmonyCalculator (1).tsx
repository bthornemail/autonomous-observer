import React, { useState } from 'react'
import SacredGeometryEngine, { HarmonyCalculation } from '../lib/SacredGeometryEngine'

interface PersonalData {
  name: string;
  birthDate: string;
  favoriteNumber: number;
}

const PersonalHarmonyCalculator: React.FC = () => {
  const [personalData, setPersonalData] = useState<PersonalData>({
    name: '',
    birthDate: '',
    favoriteNumber: 7
  });
  
  const [harmonyResult, setHarmonyResult] = useState<HarmonyCalculation | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculate = () => {
    if (!personalData.name || !personalData.birthDate) {
      alert('Please enter your name and birth date');
      return;
    }

    setIsCalculating(true);
    
    // Add a small delay for the sacred calculation effect
    setTimeout(() => {
      const birthDate = new Date(personalData.birthDate);
      const result = SacredGeometryEngine.calculatePersonalHarmony(
        birthDate,
        personalData.name,
        personalData.favoriteNumber
      );
      
      setHarmonyResult(result);
      setIsCalculating(false);
    }, 1000);
  };

  const getHarmonyColor = (score: number): string => {
    if (score >= 80) return '#00ff00'; // Green
    if (score >= 60) return '#ffff00'; // Yellow
    if (score >= 40) return '#ff8c00'; // Orange
    return '#ff4444'; // Red
  };

  const getHarmonyMessage = (score: number): string => {
    if (score >= 80) return 'Excellent Harmony! ✨';
    if (score >= 60) return 'Good Harmony 🌟';
    if (score >= 40) return 'Moderate Harmony 📐';
    return 'Needs Attention ⚡';
  };

  return (
    <div className="harmony-calculator">
      <h2>📐 Personal Harmony Calculator</h2>
      <p>Discover your sacred geometric alignment using ancient mathematical principles</p>

      <div style={{ display: 'grid', gap: '1rem', maxWidth: '400px', margin: '2rem auto' }}>
        <div>
          <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Your Full Name:
          </label>
          <input
            id="name"
            type="text"
            className="sacred-input"
            value={personalData.name}
            onChange={(e) => setPersonalData({...personalData, name: e.target.value})}
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label htmlFor="birthdate" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Birth Date:
          </label>
          <input
            id="birthdate"
            type="date"
            className="sacred-input"
            value={personalData.birthDate}
            onChange={(e) => setPersonalData({...personalData, birthDate: e.target.value})}
          />
        </div>

        <div>
          <label htmlFor="favorite-number" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Favorite Number (1-9):
          </label>
          <input
            id="favorite-number"
            type="number"
            min="1"
            max="9"
            className="sacred-input"
            value={personalData.favoriteNumber}
            onChange={(e) => setPersonalData({...personalData, favoriteNumber: parseInt(e.target.value) || 7})}
          />
        </div>
      </div>

      <button 
        className="sacred-button"
        onClick={handleCalculate}
        disabled={isCalculating}
      >
        {isCalculating ? '🌀 Calculating Sacred Harmony...' : '✨ Calculate My Harmony'}
      </button>

      {harmonyResult && (
        <div className="harmony-result">
          <h3>{getHarmonyMessage(harmonyResult.score)}</h3>
          
          <div 
            className="harmony-score"
            style={{ color: getHarmonyColor(harmonyResult.score) }}
          >
            {harmonyResult.score}/100
          </div>

          <div className="phi-display">
            <p>🌀 Your Golden Ratio Alignment: {harmonyResult.harmonicResonance}</p>
            <p>📐 Φ (Phi): {harmonyResult.phi.toFixed(10)}</p>
          </div>

          <div style={{ textAlign: 'left', marginTop: '2rem' }}>
            <h4>🎯 Personalized Harmony Recommendations:</h4>
            {harmonyResult.recommendations.map((rec, index) => (
              <div key={index} style={{ margin: '1rem 0', padding: '0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                {rec}
              </div>
            ))}
          </div>

          <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#cccccc' }}>
            <p>
              ✨ This calculation uses sacred mathematical principles including the Golden Ratio (Φ = {harmonyResult.phi.toFixed(6)}), 
              numerology, and geometric harmonics to assess your personal energy alignment.
            </p>
          </div>
        </div>
      )}

      <div style={{ marginTop: '3rem', padding: '2rem', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
        <h4>🌟 How It Works</h4>
        <ul style={{ textAlign: 'left', lineHeight: '1.6' }}>
          <li><strong>Name Analysis:</strong> Each letter carries vibrational frequency</li>
          <li><strong>Birth Date Patterns:</strong> Your cosmic numerical signature</li>
          <li><strong>Golden Ratio Alignment:</strong> How closely you match Φ = 1.618...</li>
          <li><strong>Sacred Geometry:</strong> Ancient patterns for modern harmony</li>
        </ul>
      </div>
    </div>
  );
};

export default PersonalHarmonyCalculator;