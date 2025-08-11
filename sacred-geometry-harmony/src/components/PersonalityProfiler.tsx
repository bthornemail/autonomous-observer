import React, { useState } from 'react'
import SacredGeometryEngine from '../lib/SacredGeometryEngine'

interface PersonalityProfile {
  myersBriggsType: string;
  cognitiveFunctions: string[];
  harmonicAlignment: number;
  sacredGeometryRecommendations: string[];
  revolutionaryPotential: number;
  cooperativeStrengths: string[];
  birthDateAnalysis: {
    zodiacSign: string;
    numerologyNumber: number;
    goldenRatioAlignment: number;
    phiResonance: number;
  };
}

interface PersonalData {
  name: string;
  birthDate: string;
  personalityAnswers: number[];
}

const PersonalityProfiler: React.FC = () => {
  const [personalData, setPersonalData] = useState<PersonalData>({
    name: '',
    birthDate: '',
    personalityAnswers: new Array(16).fill(0) // 16 questions for simplified MBTI
  });
  
  const [profile, setProfile] = useState<PersonalityProfile | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isProfiled, setIsProfiled] = useState(false);

  // Simplified personality questions inspired by Myers-Briggs
  const personalityQuestions = [
    { question: "I prefer to focus on:", options: ["The outer world (people, activities)", "My inner world (thoughts, feelings)"] },
    { question: "I tend to:", options: ["Trust information from my senses", "Trust information from patterns and meanings"] },
    { question: "When making decisions, I:", options: ["Use logic and analysis", "Consider people's feelings and values"] },
    { question: "I prefer life to be:", options: ["Planned and organized", "Flexible and spontaneous"] },
    { question: "In groups, I usually:", options: ["Actively participate and energize others", "Listen carefully and contribute thoughtfully"] },
    { question: "I'm more interested in:", options: ["Practical, concrete details", "Future possibilities and concepts"] },
    { question: "I value:", options: ["Fairness and objective truth", "Harmony and individual values"] },
    { question: "I work best with:", options: ["Clear deadlines and structure", "Freedom to adapt as I go"] },
    { question: "I prefer to:", options: ["Talk through problems with others", "Think through problems internally"] },
    { question: "I focus more on:", options: ["What actually is", "What could be"] },
    { question: "I prefer to:", options: ["Be direct and frank", "Be diplomatic and tactful"] },
    { question: "I like:", options: ["Having things decided", "Keeping options open"] },
    { question: "Social situations:", options: ["Energize me", "Can be draining"] },
    { question: "I trust:", options: ["Experience and proven methods", "Innovation and new approaches"] },
    { question: "I'm more:", options: ["Tough-minded", "Tender-hearted"] },
    { question: "I prefer:", options: ["Routine and predictability", "Variety and change"] }
  ];

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...personalData.personalityAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setPersonalData({ ...personalData, personalityAnswers: newAnswers });
    
    if (currentQuestion < personalityQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      generatePersonalityProfile(newAnswers);
    }
  };

  const calculateMBTI = (answers: number[]): string => {
    // Simple MBTI calculation based on answer patterns
    const e_i = (answers[0] + answers[4] + answers[8] + answers[12]) >= 2 ? 'E' : 'I';
    const s_n = (answers[1] + answers[5] + answers[9] + answers[13]) >= 2 ? 'S' : 'N';
    const t_f = (answers[2] + answers[6] + answers[10] + answers[14]) >= 2 ? 'T' : 'F';
    const j_p = (answers[3] + answers[7] + answers[11] + answers[15]) >= 2 ? 'J' : 'P';
    
    return `${e_i}${s_n}${t_f}${j_p}`;
  };

  const getZodiacSign = (birthDate: Date): string => {
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();
    
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
    return 'Pisces';
  };

  const calculateNumerology = (birthDate: Date): number => {
    const dateString = birthDate.toISOString().split('T')[0].replace(/-/g, '');
    let sum = 0;
    for (const digit of dateString) {
      sum += parseInt(digit);
    }
    while (sum > 9) {
      sum = sum.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
    }
    return sum;
  };

  const generatePersonalityProfile = (answers: number[]) => {
    const mbtiType = calculateMBTI(answers);
    const birthDate = new Date(personalData.birthDate);
    const zodiacSign = getZodiacSign(birthDate);
    const numerologyNumber = calculateNumerology(birthDate);
    
    // Calculate golden ratio alignment based on birth date and personality
    const birthYear = birthDate.getFullYear();
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    const goldenRatioAlignment = (birthYear % 100) / 100 * goldenRatio;
    const phiResonance = (numerologyNumber / 9) * goldenRatio;
    
    // Calculate harmonic alignment
    const personalityScore = answers.reduce((sum, answer) => sum + answer, 0);
    const harmonicAlignment = ((personalityScore / 16) * 100 + goldenRatioAlignment * 10 + phiResonance * 10) / 3;
    
    // Generate recommendations based on MBTI type
    const mbtiRecommendations: { [key: string]: string[] } = {
      'INTJ': ['Focus on strategic planning patterns', 'Use Fibonacci sequences for goal setting', 'Practice solo meditation with geometric mandalas'],
      'INFJ': ['Explore compassionate sacred geometry', 'Use golden ratio for emotional harmony', 'Practice group meditation circles'],
      'ENTJ': ['Lead cooperative organizational patterns', 'Apply golden ratio to team structures', 'Practice dynamic breathing patterns'],
      'ENFJ': ['Facilitate community harmony circles', 'Use sacred geometry for group healing', 'Practice collaborative meditation'],
      'INTP': ['Analyze mathematical patterns deeply', 'Explore theoretical sacred geometry', 'Practice contemplative solo patterns'],
      'INFP': ['Connect with natural sacred patterns', 'Use golden ratio for creative expression', 'Practice intuitive geometric meditation'],
      'ENTP': ['Innovate new geometric applications', 'Experiment with pattern combinations', 'Practice energetic group patterns'],
      'ENFP': ['Share sacred patterns with others', 'Use geometry for inspiration', 'Practice celebratory group meditation'],
      'ISTJ': ['Follow traditional geometric practices', 'Use structured pattern sequences', 'Practice disciplined daily meditation'],
      'ISFJ': ['Use patterns to help others', 'Focus on nurturing geometric forms', 'Practice caring meditation circles'],
      'ESTJ': ['Organize geometric learning groups', 'Apply patterns to practical goals', 'Practice structured group meditation'],
      'ESFJ': ['Create harmony through patterns', 'Use geometry for community building', 'Practice supportive group circles'],
      'ISTP': ['Experiment with hands-on geometry', 'Build physical sacred forms', 'Practice quiet, focused meditation'],
      'ISFP': ['Express creativity through patterns', 'Use gentle, flowing geometries', 'Practice artistic meditation'],
      'ESTP': ['Apply patterns to active pursuits', 'Use dynamic geometric forms', 'Practice energetic movement meditation'],
      'ESFP': ['Share joy through sacred patterns', 'Use colorful, vibrant geometries', 'Practice joyful group meditation']
    };
    
    // Calculate revolutionary potential based on anarcho-syndicalist alignment
    const cooperativeTypes = ['ENFJ', 'INFJ', 'ENFP', 'ENTP', 'ISFJ', 'ESFJ'];
    const revolutionaryPotential = cooperativeTypes.includes(mbtiType) ? harmonicAlignment * 1.2 : harmonicAlignment;
    
    const cooperativeStrengths = {
      'E': ['Community organizing', 'Public speaking', 'Network building'],
      'I': ['Deep analysis', 'Careful planning', 'One-on-one mentoring'],
      'N': ['Visionary thinking', 'Innovation', 'Pattern recognition'],
      'S': ['Practical implementation', 'Attention to detail', 'Concrete solutions'],
      'T': ['Logical analysis', 'Systems thinking', 'Objective decision-making'],
      'F': ['Empathy and understanding', 'Value-based decisions', 'Conflict resolution'],
      'J': ['Organization and structure', 'Project completion', 'Goal achievement'],
      'P': ['Flexibility and adaptation', 'Creative problem-solving', 'Open-minded exploration']
    };
    
    const personalStrengths = mbtiType.split('').flatMap(letter => cooperativeStrengths[letter as keyof typeof cooperativeStrengths] || []);

    const newProfile: PersonalityProfile = {
      myersBriggsType: mbtiType,
      cognitiveFunctions: getCognitiveFunctions(mbtiType),
      harmonicAlignment: Math.min(harmonicAlignment, 100),
      sacredGeometryRecommendations: mbtiRecommendations[mbtiType] || ['Practice basic geometric meditation'],
      revolutionaryPotential: Math.min(revolutionaryPotential, 100),
      cooperativeStrengths: personalStrengths.slice(0, 4), // Top 4 strengths
      birthDateAnalysis: {
        zodiacSign,
        numerologyNumber,
        goldenRatioAlignment: Math.min(goldenRatioAlignment, 1),
        phiResonance: Math.min(phiResonance, 1)
      }
    };
    
    setProfile(newProfile);
    setIsProfiled(true);
  };

  const getCognitiveFunctions = (mbti: string): string[] => {
    const functions: { [key: string]: string[] } = {
      'INTJ': ['Ni (Dominant)', 'Te (Auxiliary)', 'Fi (Tertiary)', 'Se (Inferior)'],
      'INFJ': ['Ni (Dominant)', 'Fe (Auxiliary)', 'Ti (Tertiary)', 'Se (Inferior)'],
      'ENTJ': ['Te (Dominant)', 'Ni (Auxiliary)', 'Se (Tertiary)', 'Fi (Inferior)'],
      'ENFJ': ['Fe (Dominant)', 'Ni (Auxiliary)', 'Se (Tertiary)', 'Ti (Inferior)'],
      // Add more as needed...
    };
    return functions[mbti] || ['Functions not mapped'];
  };

  const resetProfiler = () => {
    setPersonalData({
      name: '',
      birthDate: '',
      personalityAnswers: new Array(16).fill(0)
    });
    setProfile(null);
    setCurrentQuestion(0);
    setIsProfiled(false);
  };

  if (!personalData.name || !personalData.birthDate) {
    return (
      <div className="personality-profiler">
        <div className="profiler-header">
          <h2>🧠 Anarcho-Syndicalist Personality Profiler</h2>
          <p>Discover your revolutionary potential through sacred geometry and personality analysis</p>
        </div>
        
        <div className="personal-info-form">
          <div className="form-group">
            <label>Your Name:</label>
            <input
              type="text"
              value={personalData.name}
              onChange={(e) => setPersonalData({ ...personalData, name: e.target.value })}
              placeholder="Enter your name"
            />
          </div>
          
          <div className="form-group">
            <label>Birth Date:</label>
            <input
              type="date"
              value={personalData.birthDate}
              onChange={(e) => setPersonalData({ ...personalData, birthDate: e.target.value })}
            />
          </div>
          
          <p className="privacy-note">
            🔒 Your data is processed locally and never shared. This tool combines Myers-Briggs personality insights with sacred geometry for revolutionary self-discovery.
          </p>
        </div>
      </div>
    );
  }

  if (!isProfiled && currentQuestion < personalityQuestions.length) {
    const question = personalityQuestions[currentQuestion];
    return (
      <div className="personality-profiler">
        <div className="question-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentQuestion + 1) / personalityQuestions.length) * 100}%` }}
            />
          </div>
          <span>Question {currentQuestion + 1} of {personalityQuestions.length}</span>
        </div>
        
        <div className="question-card">
          <h3>{question.question}</h3>
          <div className="answer-options">
            {question.options.map((option, index) => (
              <button
                key={index}
                className="answer-option"
                onClick={() => handleAnswerSelect(index)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (profile) {
    return (
      <div className="personality-profiler">
        <div className="profile-header">
          <h2>🌟 Your Anarcho-Syndicalist Profile</h2>
          <p>Hello, {personalData.name}! Here's your revolutionary personality analysis:</p>
        </div>
        
        <div className="profile-results">
          <div className="profile-section mbti-section">
            <h3>📋 Myers-Briggs Type: {profile.myersBriggsType}</h3>
            <div className="cognitive-functions">
              <h4>Cognitive Functions:</h4>
              <ul>
                {profile.cognitiveFunctions.map((func, index) => (
                  <li key={index}>{func}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="profile-section harmonic-section">
            <h3>⚡ Sacred Geometry Alignment</h3>
            <div className="alignment-score">
              <div className="score-circle">
                <span className="score">{profile.harmonicAlignment.toFixed(1)}%</span>
                <span className="label">Harmonic Alignment</span>
              </div>
            </div>
            <p>Golden Ratio Resonance: {(profile.birthDateAnalysis.goldenRatioAlignment * 100).toFixed(1)}%</p>
            <p>Phi Resonance: {(profile.birthDateAnalysis.phiResonance * 100).toFixed(1)}%</p>
          </div>
          
          <div className="profile-section revolutionary-section">
            <h3>🚩 Revolutionary Potential</h3>
            <div className="revolutionary-score">
              <div className="score-bar">
                <div 
                  className="score-fill" 
                  style={{ width: `${profile.revolutionaryPotential}%` }}
                />
              </div>
              <span>{profile.revolutionaryPotential.toFixed(1)}%</span>
            </div>
          </div>
          
          <div className="profile-section birth-analysis">
            <h3>🔮 Birth Date Analysis</h3>
            <p><strong>Zodiac Sign:</strong> {profile.birthDateAnalysis.zodiacSign}</p>
            <p><strong>Numerology Number:</strong> {profile.birthDateAnalysis.numerologyNumber}</p>
          </div>
          
          <div className="profile-section strengths-section">
            <h3>💪 Cooperative Strengths</h3>
            <ul>
              {profile.cooperativeStrengths.map((strength, index) => (
                <li key={index}>{strength}</li>
              ))}
            </ul>
          </div>
          
          <div className="profile-section recommendations-section">
            <h3>🎯 Sacred Geometry Recommendations</h3>
            <ul>
              {profile.sacredGeometryRecommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="profile-actions">
          <button onClick={resetProfiler} className="reset-button">
            🔄 Take Profile Again
          </button>
        </div>
      </div>
    );
  }

  return <div>Loading...</div>;
};

export default PersonalityProfiler;