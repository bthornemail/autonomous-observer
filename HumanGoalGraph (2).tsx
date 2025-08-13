import React, { useState } from 'react'

interface Achievement {
  id: string
  goal: string
  achiever: string
  path: string[]
  resources: string[]
  timeline: string
  proofOfAchievement: string[]
  mentorAvailable: boolean
  attentionTokens: number
}

const HumanGoalGraph: React.FC = () => {
  const [searchGoal, setSearchGoal] = useState('')
  const [achievements] = useState<Achievement[]>([
    {
      id: '1',
      goal: 'Become a Software Engineer',
      achiever: 'Maria Santos',
      path: [
        '1. Learned HTML/CSS basics (3 months)',
        '2. Built 5 personal projects', 
        '3. Contributed to open source',
        '4. Applied to 50+ companies',
        '5. Got hired at tech startup'
      ],
      resources: ['FreeCodeCamp', 'GitHub', 'Local coding meetup', 'Online portfolio'],
      timeline: '18 months total',
      proofOfAchievement: ['GitHub: 200+ commits', 'Current job at TechCorp', '5-star mentoring reviews'],
      mentorAvailable: true,
      attentionTokens: 25
    },
    {
      id: '2',
      goal: 'Start a Successful Restaurant',
      achiever: 'Chef Rodriguez',
      path: [
        '1. Worked in 3 different restaurants (2 years)',
        '2. Saved $30K while learning', 
        '3. Found perfect location',
        '4. Built loyal customer base',
        '5. Expanded to 2nd location'
      ],
      resources: ['Culinary school', 'Restaurant jobs', 'Small business loan', 'Local suppliers'],
      timeline: '5 years total',
      proofOfAchievement: ['2 successful locations', '$500K annual revenue', '4.9 Yelp rating'],
      mentorAvailable: true,
      attentionTokens: 40
    },
    {
      id: '3',
      goal: 'Become a Minister',
      achiever: 'Reverend Thompson',
      path: [
        '1. Deepened personal faith journey (ongoing)',
        '2. Completed seminary education',
        '3. Served in youth ministry',
        '4. Led community outreach programs', 
        '5. Received ordination'
      ],
      resources: ['Seminary school', 'Mentor pastor', 'Church community', 'Theological books'],
      timeline: '7 years total',
      proofOfAchievement: ['Ordained minister', '300+ congregation', 'Community food bank leader'],
      mentorAvailable: true,
      attentionTokens: 30
    }
  ])

  const filteredAchievements = achievements.filter(achievement =>
    achievement.goal.toLowerCase().includes(searchGoal.toLowerCase())
  )

  return (
    <div className="goal-graph">
      <header>
        <h1>🎯 Human Achievement Hypergraph</h1>
        <p>"Want to do something? See how others did it. Learn their path."</p>
      </header>

      <div className="search-section">
        <input
          type="text"
          placeholder="What do you want to achieve? (e.g., 'become a minister', 'start business')"
          value={searchGoal}
          onChange={(e) => setSearchGoal(e.target.value)}
          className="goal-search"
        />
      </div>

      <div className="achievements-grid">
        {filteredAchievements.map(achievement => (
          <div key={achievement.id} className="achievement-card">
            <div className="goal-header">
              <h3>🎯 {achievement.goal}</h3>
              <div className="achiever">
                by <strong>{achievement.achiever}</strong>
              </div>
            </div>

            <div className="path-section">
              <h4>📋 The Path They Took:</h4>
              <ol className="achievement-path">
                {achievement.path.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>

            <div className="resources-section">
              <h4>🛠️ Resources They Used:</h4>
              <div className="resources">
                {achievement.resources.map((resource, index) => (
                  <span key={index} className="resource-tag">
                    {resource}
                  </span>
                ))}
              </div>
            </div>

            <div className="proof-section">
              <h4>✅ Proof of Achievement:</h4>
              <ul className="proof-list">
                {achievement.proofOfAchievement.map((proof, index) => (
                  <li key={index}>{proof}</li>
                ))}
              </ul>
            </div>

            <div className="meta-info">
              <div className="timeline">⏰ {achievement.timeline}</div>
              <div className="tokens">🪙 {achievement.attentionTokens} tokens to connect</div>
            </div>

            <div className="actions">
              {achievement.mentorAvailable && (
                <button className="mentor-btn">
                  🤝 Request Mentoring
                </button>
              )}
              <button className="path-btn">
                📚 Study Their Full Path
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="add-achievement">
        <button className="share-achievement-btn">
          ➕ Share Your Achievement Path
        </button>
        <p className="encourage">Help others by sharing how you achieved your goals!</p>
      </div>
    </div>
  )
}

export default HumanGoalGraph