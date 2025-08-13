/**
 * Sacred Geometry Harmony Widget v2.0.0
 * 
 * Embeddable harmony calculator for any website.
 * 
 * Usage:
 * <script src="https://cdn.sacred-geometry.app/widget.js"></script>
 * <div id="harmony-calculator"></div>
 * <script>
 *   SacredGeometry.createCalculator('#harmony-calculator', {
 *     theme: 'light', // or 'dark'
 *     showBranding: true,
 *     autoFocus: false
 *   })
 * </script>
 */

(function(window, document) {
    'use strict'

    // Sacred Geometry Engine - Core calculations
    class SacredGeometryEngine {
        static PHI = (1 + Math.sqrt(5)) / 2

        static calculatePersonalHarmony(birthDate, name, favoriteNumber) {
            const day = birthDate.getDate()
            const month = birthDate.getMonth() + 1
            const year = birthDate.getFullYear()
            
            const nameValue = name.toLowerCase()
                .split('')
                .reduce((sum, char) => sum + (char.charCodeAt(0) - 96), 0)

            const lifePath = (day + month + year) % 9 || 9
            const nameHarmonic = nameValue % 9 || 9
            const combinedResonance = (lifePath + nameHarmonic + favoriteNumber) / 3

            const phiAlignment = Math.abs(combinedResonance - SacredGeometryEngine.PHI * 3) / 10
            const harmonicResonance = 1 - phiAlignment

            const score = Math.max(0, Math.min(100, 
                (harmonicResonance * 50) + 
                (lifePath * 5) + 
                (nameHarmonic * 3) + 
                (favoriteNumber * 2)
            ))

            const recommendations = this.generateRecommendations(score, lifePath, nameHarmonic)

            return {
                score: Math.round(score),
                phi: SacredGeometryEngine.PHI,
                harmonicResonance: Math.round(harmonicResonance * 100) / 100,
                recommendations
            }
        }

        static generateRecommendations(score, lifePath, nameHarmonic) {
            const recommendations = []

            if (score >= 80) {
                recommendations.push("🌟 Your harmony is excellent! Continue your current practices.")
                recommendations.push("✨ Share your positive energy with others today.")
            } else if (score >= 60) {
                recommendations.push("📐 Focus on golden ratio patterns in nature (flowers, shells).")
                recommendations.push("🧘 Practice meditation during sacred hours (sunrise/sunset).")
            } else if (score >= 40) {
                recommendations.push("🌸 Spend time with Flower of Life patterns for balance.")
                recommendations.push("💫 Consider sacred geometry art for your living space.")
            } else {
                recommendations.push("🎯 Focus on grounding exercises and natural patterns.")
                recommendations.push("⚡ Reset your energy with geometric breathing exercises.")
            }

            if (lifePath <= 3) {
                recommendations.push("🔺 Work with triangle energy - focus and direction.")
            } else if (lifePath <= 6) {
                recommendations.push("⬡ Embrace hexagon patterns - harmony and balance.")
            } else {
                recommendations.push("⭐ Connect with pentagram energy - transformation.")
            }

            return recommendations
        }
    }

    // Widget HTML Templates
    const templates = {
        light: `
            <div class="sg-widget sg-light">
                <div class="sg-header">
                    <h3>📐 Personal Harmony Calculator</h3>
                    <p>Discover your sacred geometric alignment</p>
                </div>
                <form class="sg-form">
                    <div class="sg-input-group">
                        <label>Your Full Name:</label>
                        <input type="text" name="name" placeholder="Enter your full name" required>
                    </div>
                    <div class="sg-input-group">
                        <label>Birth Date:</label>
                        <input type="date" name="birthDate" required>
                    </div>
                    <div class="sg-input-group">
                        <label>Favorite Number (1-9):</label>
                        <input type="number" name="favoriteNumber" min="1" max="9" value="7" required>
                    </div>
                    <button type="submit" class="sg-calculate-btn">
                        <span class="sg-btn-text">✨ Calculate My Harmony</span>
                        <span class="sg-loading">🌀 Calculating...</span>
                    </button>
                </form>
                <div class="sg-results" style="display: none;"></div>
                <div class="sg-branding">
                    <a href="https://sacred-geometry.app" target="_blank">
                        Powered by Sacred Geometry Harmony ✨
                    </a>
                </div>
            </div>
        `,
        
        dark: `
            <div class="sg-widget sg-dark">
                <div class="sg-header">
                    <h3>📐 Personal Harmony Calculator</h3>
                    <p>Discover your sacred geometric alignment</p>
                </div>
                <form class="sg-form">
                    <div class="sg-input-group">
                        <label>Your Full Name:</label>
                        <input type="text" name="name" placeholder="Enter your full name" required>
                    </div>
                    <div class="sg-input-group">
                        <label>Birth Date:</label>
                        <input type="date" name="birthDate" required>
                    </div>
                    <div class="sg-input-group">
                        <label>Favorite Number (1-9):</label>
                        <input type="number" name="favoriteNumber" min="1" max="9" value="7" required>
                    </div>
                    <button type="submit" class="sg-calculate-btn">
                        <span class="sg-btn-text">✨ Calculate My Harmony</span>
                        <span class="sg-loading">🌀 Calculating...</span>
                    </button>
                </form>
                <div class="sg-results" style="display: none;"></div>
                <div class="sg-branding">
                    <a href="https://sacred-geometry.app" target="_blank">
                        Powered by Sacred Geometry Harmony ✨
                    </a>
                </div>
            </div>
        `
    }

    // CSS Styles
    const styles = `
        .sg-widget {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 500px;
            border-radius: 15px;
            padding: 2rem;
            margin: 1rem auto;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
        }
        
        .sg-light {
            background: rgba(255, 255, 255, 0.95);
            color: #333333;
            border: 2px solid rgba(255, 215, 0, 0.3);
        }
        
        .sg-dark {
            background: rgba(0, 17, 34, 0.95);
            color: #ffffff;
            border: 2px solid rgba(255, 215, 0, 0.3);
        }
        
        .sg-header h3 {
            color: #FFD700;
            margin: 0 0 0.5rem 0;
            font-size: 1.5rem;
            text-align: center;
        }
        
        .sg-header p {
            text-align: center;
            opacity: 0.8;
            margin: 0 0 2rem 0;
        }
        
        .sg-input-group {
            margin-bottom: 1.5rem;
        }
        
        .sg-input-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
        }
        
        .sg-input-group input {
            width: 100%;
            padding: 0.8rem;
            border-radius: 8px;
            font-size: 1rem;
            box-sizing: border-box;
            transition: all 0.3s ease;
        }
        
        .sg-light input {
            background: rgba(255, 255, 255, 0.8);
            border: 2px solid rgba(255, 215, 0, 0.3);
            color: #333333;
        }
        
        .sg-dark input {
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(255, 215, 0, 0.3);
            color: #ffffff;
        }
        
        .sg-input-group input:focus {
            outline: none;
            border-color: #FFD700;
            box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
        }
        
        .sg-calculate-btn {
            width: 100%;
            padding: 1rem 2rem;
            background: linear-gradient(45deg, #FFD700, #FF8C00);
            border: none;
            border-radius: 25px;
            color: #000000;
            font-size: 1.1rem;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            position: relative;
            overflow: hidden;
        }
        
        .sg-calculate-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(255, 215, 0, 0.4);
        }
        
        .sg-calculate-btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            transform: none;
        }
        
        .sg-loading {
            display: none;
        }
        
        .sg-calculate-btn.loading .sg-btn-text {
            display: none;
        }
        
        .sg-calculate-btn.loading .sg-loading {
            display: inline;
        }
        
        .sg-results {
            margin-top: 2rem;
            padding: 1.5rem;
            border-radius: 10px;
            text-align: center;
        }
        
        .sg-light .sg-results {
            background: rgba(0, 255, 255, 0.1);
            border: 2px solid rgba(0, 255, 255, 0.3);
        }
        
        .sg-dark .sg-results {
            background: rgba(0, 255, 255, 0.1);
            border: 2px solid rgba(0, 255, 255, 0.3);
        }
        
        .sg-score {
            font-size: 2.5rem;
            font-weight: bold;
            margin: 1rem 0;
        }
        
        .sg-score.excellent { color: #00ff00; }
        .sg-score.good { color: #ffff00; }
        .sg-score.moderate { color: #ff8c00; }
        .sg-score.needs-attention { color: #ff4444; }
        
        .sg-phi-info {
            color: #FFD700;
            margin: 1rem 0;
            font-family: monospace;
        }
        
        .sg-recommendations {
            text-align: left;
            margin-top: 1.5rem;
        }
        
        .sg-recommendation {
            margin: 0.8rem 0;
            padding: 0.8rem;
            border-radius: 8px;
            line-height: 1.5;
        }
        
        .sg-light .sg-recommendation {
            background: rgba(255, 255, 255, 0.5);
        }
        
        .sg-dark .sg-recommendation {
            background: rgba(255, 255, 255, 0.1);
        }
        
        .sg-branding {
            text-align: center;
            margin-top: 2rem;
            padding-top: 1rem;
            border-top: 1px solid rgba(255, 215, 0, 0.3);
            font-size: 0.9rem;
            opacity: 0.8;
        }
        
        .sg-branding a {
            color: #FFD700;
            text-decoration: none;
        }
        
        .sg-branding a:hover {
            text-decoration: underline;
        }
        
        .sg-share-btn {
            background: rgba(0, 255, 255, 0.3);
            border: 1px solid rgba(0, 255, 255, 0.5);
            color: inherit;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            cursor: pointer;
            margin-top: 1rem;
            font-size: 0.9rem;
        }
        
        .sg-share-btn:hover {
            background: rgba(0, 255, 255, 0.5);
        }
        
        @media (max-width: 600px) {
            .sg-widget {
                margin: 1rem;
                padding: 1.5rem;
            }
            
            .sg-score {
                font-size: 2rem;
            }
        }
    `

    // Widget Class
    class HarmonyCalculatorWidget {
        constructor(container, options = {}) {
            this.container = typeof container === 'string' 
                ? document.querySelector(container) 
                : container
            
            this.options = {
                theme: 'dark',
                showBranding: true,
                autoFocus: false,
                onCalculate: null,
                onResult: null,
                ...options
            }
            
            this.init()
        }

        init() {
            this.injectStyles()
            this.render()
            this.attachEventListeners()
            
            if (this.options.autoFocus) {
                setTimeout(() => {
                    const nameInput = this.container.querySelector('input[name="name"]')
                    if (nameInput) nameInput.focus()
                }, 100)
            }
        }

        injectStyles() {
            if (document.getElementById('sg-styles')) return
            
            const styleElement = document.createElement('style')
            styleElement.id = 'sg-styles'
            styleElement.textContent = styles
            document.head.appendChild(styleElement)
        }

        render() {
            const template = templates[this.options.theme] || templates.dark
            this.container.innerHTML = template
            
            if (!this.options.showBranding) {
                const branding = this.container.querySelector('.sg-branding')
                if (branding) branding.style.display = 'none'
            }
        }

        attachEventListeners() {
            const form = this.container.querySelector('.sg-form')
            form.addEventListener('submit', (e) => this.handleCalculate(e))
        }

        async handleCalculate(e) {
            e.preventDefault()
            
            const form = e.target
            const formData = new FormData(form)
            const data = {
                name: formData.get('name'),
                birthDate: formData.get('birthDate'),
                favoriteNumber: parseInt(formData.get('favoriteNumber'))
            }

            if (!data.name || !data.birthDate) {
                alert('Please fill in all fields')
                return
            }

            const button = form.querySelector('.sg-calculate-btn')
            const resultsContainer = this.container.querySelector('.sg-results')

            // Loading state
            button.disabled = true
            button.classList.add('loading')
            resultsContainer.style.display = 'none'

            if (this.options.onCalculate) {
                this.options.onCalculate(data)
            }

            // Simulate calculation time for effect
            setTimeout(() => {
                try {
                    const birthDate = new Date(data.birthDate)
                    const harmony = SacredGeometryEngine.calculatePersonalHarmony(
                        birthDate, data.name, data.favoriteNumber
                    )

                    this.displayResults(harmony, data)

                    if (this.options.onResult) {
                        this.options.onResult(harmony, data)
                    }

                } catch (error) {
                    console.error('Harmony calculation error:', error)
                    resultsContainer.innerHTML = `
                        <div style="color: #ff4444;">
                            <strong>Calculation Error</strong><br>
                            Please check your inputs and try again.
                        </div>
                    `
                    resultsContainer.style.display = 'block'
                }

                button.disabled = false
                button.classList.remove('loading')
            }, 1500)
        }

        displayResults(harmony, userData) {
            const resultsContainer = this.container.querySelector('.sg-results')
            
            const getScoreClass = (score) => {
                if (score >= 80) return 'excellent'
                if (score >= 60) return 'good'
                if (score >= 40) return 'moderate'
                return 'needs-attention'
            }

            const getScoreMessage = (score) => {
                if (score >= 80) return 'Excellent Harmony! ✨'
                if (score >= 60) return 'Good Harmony 🌟'
                if (score >= 40) return 'Moderate Harmony 📐'
                return 'Needs Attention ⚡'
            }

            resultsContainer.innerHTML = `
                <h4>${getScoreMessage(harmony.score)}</h4>
                <div class="sg-score ${getScoreClass(harmony.score)}">
                    ${harmony.score}/100
                </div>
                <div class="sg-phi-info">
                    🌀 Golden Ratio Alignment: ${harmony.harmonicResonance}<br>
                    📐 Φ (Phi): ${harmony.phi.toFixed(6)}
                </div>
                <div class="sg-recommendations">
                    <strong>🎯 Your Personalized Recommendations:</strong>
                    ${harmony.recommendations.map(rec => 
                        `<div class="sg-recommendation">${rec}</div>`
                    ).join('')}
                </div>
                <button class="sg-share-btn" onclick="SacredGeometry.shareHarmony(${harmony.score}, '${userData.name}')">
                    📤 Share My Harmony
                </button>
            `
            
            resultsContainer.style.display = 'block'
        }
    }

    // Main API
    window.SacredGeometry = {
        version: '2.0.0',
        PHI: SacredGeometryEngine.PHI,

        createCalculator: function(container, options = {}) {
            return new HarmonyCalculatorWidget(container, options)
        },

        calculateHarmony: function(birthDate, name, favoriteNumber) {
            return SacredGeometryEngine.calculatePersonalHarmony(birthDate, name, favoriteNumber)
        },

        shareHarmony: function(score, name) {
            const text = `🌸 ${name} just calculated their Sacred Geometry Harmony!

Score: ${score}/100 ✨
Ancient mathematics meets modern wellness.

Try it yourself: https://sacred-geometry.app

#SacredGeometry #PersonalHarmony #GoldenRatio`

            if (navigator.share) {
                navigator.share({
                    title: 'My Sacred Geometry Harmony Score',
                    text: text,
                    url: 'https://sacred-geometry.app'
                }).catch(console.error)
            } else {
                // Fallback: copy to clipboard
                navigator.clipboard.writeText(text).then(() => {
                    alert('Harmony score copied to clipboard! Share it on your social media.')
                }).catch(() => {
                    // Final fallback: show text for manual copy
                    prompt('Copy this text to share your harmony:', text)
                })
            }
        }
    }

    // Auto-initialize widgets with data attributes
    document.addEventListener('DOMContentLoaded', function() {
        const autoWidgets = document.querySelectorAll('[data-sg-widget="harmony"]')
        autoWidgets.forEach(element => {
            const options = {
                theme: element.dataset.sgTheme || 'dark',
                showBranding: element.dataset.sgBranding !== 'false',
                autoFocus: element.dataset.sgAutofocus === 'true'
            }
            new HarmonyCalculatorWidget(element, options)
        })
    })

})(window, document)