import React, { useState } from 'react'

interface SharedResource {
  id: string
  name: string
  category: 'tools' | 'skills' | 'space' | 'time' | 'knowledge'
  owner: string
  available: boolean
  location: string
  proofOfLife: string[]  // Evidence of positive impact
  attentionTokens: number
  cooperationRating: number
}

const SharingPlatform: React.FC = () => {
  const [resources, setResources] = useState<SharedResource[]>([
    {
      id: '1',
      name: 'Professional Lawnmower',
      category: 'tools', 
      owner: 'John from Oak Street',
      available: true,
      location: '2 miles away',
      proofOfLife: ['Maintained 12 neighbor yards', '15 AttentionTokens earned'],
      attentionTokens: 5,
      cooperationRating: 4.8
    },
    {
      id: '2', 
      name: 'Web Development Mentoring',
      category: 'skills',
      owner: 'Sarah the Coder',
      available: true,
      location: 'Remote/Local',
      proofOfLife: ['Taught 50+ people to code', 'Created 8 successful apps'],
      attentionTokens: 10,
      cooperationRating: 4.9
    }
  ])

  return (
    <div className="sharing-platform">
      <header className="platform-header">
        <h1>🌍 Universal Sharing Marketplace</h1>
        <p>Cooperation over Consumerism • Proof of Life over Proof of Work</p>
        <div className="philosophy">
          "Why should everyone buy a lawnmower when the best person can serve the whole community?"
        </div>
      </header>

      <div className="resource-grid">
        {resources.map(resource => (
          <div key={resource.id} className="resource-card">
            <div className="resource-header">
              <h3>{resource.name}</h3>
              <span className={`category ${resource.category}`}>
                {resource.category}
              </span>
            </div>
            
            <div className="owner-info">
              <strong>{resource.owner}</strong>
              <span className="location">📍 {resource.location}</span>
            </div>

            <div className="proof-of-life">
              <h4>🌟 Proof of Life Impact:</h4>
              <ul>
                {resource.proofOfLife.map((proof, index) => (
                  <li key={index}>{proof}</li>
                ))}
              </ul>
            </div>

            <div className="cooperation-metrics">
              <div className="rating">
                ⭐ {resource.cooperationRating}/5 cooperation rating
              </div>
              <div className="tokens">
                🪙 {resource.attentionTokens} AttentionTokens to access
              </div>
            </div>

            <div className="actions">
              <button className="request-btn">
                🤝 Request Cooperation
              </button>
              <button className="learn-btn">
                📚 How They Achieved This
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="add-resource">
        <button className="share-btn">
          ➕ Share Something You Do Well
        </button>
      </div>

      <footer className="platform-footer">
        <p>Building the hypergraph of human potential • One cooperation at a time</p>
      </footer>
    </div>
  )
}

export default SharingPlatform