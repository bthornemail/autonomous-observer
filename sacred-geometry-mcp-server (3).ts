/**
 * Sacred Geometry MCP Server for Claude Integration
 * 
 * This enables Claude to calculate personal harmony, generate sacred patterns,
 * and provide meditation guidance through natural conversation.
 * 
 * Users can say: "Claude, calculate my personal harmony" and get results instantly.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
  ToolSchema,
} from '@modelcontextprotocol/sdk/types.js'

// Import our existing Sacred Geometry Engine
import { SacredGeometryEngine, HarmonyCalculation, SacredPoint } from '../sacred-geometry-harmony/src/lib/SacredGeometryEngine'

interface HarmonyParams {
  name: string
  birthDate: string // YYYY-MM-DD format
  favoriteNumber: number // 1-9
}

interface GeometryParams {
  pattern: 'flower_of_life' | 'golden_spiral' | 'pascal_triangle'
  layers?: number
  turns?: number
  pointsPerTurn?: number
}

interface MeditationParams {
  duration: number // minutes
  pattern: 'flower_of_life' | 'golden_spiral'
  breathingStyle: 'phi_breathing' | 'box_breathing'
}

class SacredGeometryMCPServer {
  private server: Server

  constructor() {
    this.server = new Server(
      {
        name: 'sacred-geometry-harmony',
        version: '2.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    )

    this.setupToolHandlers()
    this.setupErrorHandling()
  }

  private setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'calculate_personal_harmony',
            description: 'Calculate a person\'s harmony score using sacred geometry mathematics based on their name, birth date, and favorite number',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Full name of the person',
                },
                birthDate: {
                  type: 'string',
                  description: 'Birth date in YYYY-MM-DD format',
                },
                favoriteNumber: {
                  type: 'number',
                  description: 'Favorite number between 1 and 9',
                  minimum: 1,
                  maximum: 9,
                },
              },
              required: ['name', 'birthDate', 'favoriteNumber'],
            },
          },
          {
            name: 'generate_sacred_pattern',
            description: 'Generate coordinates for sacred geometry patterns like Flower of Life, Golden Spiral, or Pascal Triangle',
            inputSchema: {
              type: 'object',
              properties: {
                pattern: {
                  type: 'string',
                  enum: ['flower_of_life', 'golden_spiral', 'pascal_triangle'],
                  description: 'Type of sacred geometry pattern to generate',
                },
                layers: {
                  type: 'number',
                  description: 'Number of layers for Flower of Life (1-7)',
                  minimum: 1,
                  maximum: 7,
                },
                turns: {
                  type: 'number',
                  description: 'Number of turns for Golden Spiral (1-10)',
                  minimum: 1,
                  maximum: 10,
                },
                pointsPerTurn: {
                  type: 'number',
                  description: 'Points per turn for Golden Spiral (10-50)',
                  minimum: 10,
                  maximum: 50,
                },
              },
              required: ['pattern'],
            },
          },
          {
            name: 'create_meditation_guide',
            description: 'Create a personalized meditation session with sacred geometry and phi breathing',
            inputSchema: {
              type: 'object',
              properties: {
                duration: {
                  type: 'number',
                  description: 'Meditation duration in minutes (1-30)',
                  minimum: 1,
                  maximum: 30,
                },
                pattern: {
                  type: 'string',
                  enum: ['flower_of_life', 'golden_spiral'],
                  description: 'Sacred pattern for visual focus',
                },
                breathingStyle: {
                  type: 'string',
                  enum: ['phi_breathing', 'box_breathing'],
                  description: 'Breathing pattern style',
                },
              },
              required: ['duration'],
            },
          },
          {
            name: 'explain_sacred_mathematics',
            description: 'Provide educational explanation of sacred geometry concepts, golden ratio, or specific patterns',
            inputSchema: {
              type: 'object',
              properties: {
                concept: {
                  type: 'string',
                  enum: ['golden_ratio', 'flower_of_life', 'platonic_solids', 'fibonacci', 'pascal_triangle', 'sacred_geometry_overview'],
                  description: 'Sacred geometry concept to explain',
                },
                level: {
                  type: 'string',
                  enum: ['beginner', 'intermediate', 'advanced'],
                  description: 'Explanation complexity level',
                },
              },
              required: ['concept'],
            },
          },
        ],
      }
    })

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params

      try {
        switch (name) {
          case 'calculate_personal_harmony':
            return await this.calculatePersonalHarmony(args as HarmonyParams)
          
          case 'generate_sacred_pattern':
            return await this.generateSacredPattern(args as GeometryParams)
          
          case 'create_meditation_guide':
            return await this.createMeditationGuide(args as MeditationParams)
          
          case 'explain_sacred_mathematics':
            return await this.explainSacredMathematics(args as any)
          
          default:
            throw new Error(`Unknown tool: ${name}`)
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error executing ${name}: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        }
      }
    })
  }

  private async calculatePersonalHarmony(params: HarmonyParams) {
    const { name, birthDate, favoriteNumber } = params
    
    // Validate input
    if (!name || !birthDate || favoriteNumber < 1 || favoriteNumber > 9) {
      throw new Error('Invalid parameters: name and birthDate are required, favoriteNumber must be 1-9')
    }

    const date = new Date(birthDate)
    if (isNaN(date.getTime())) {
      throw new Error('Invalid birth date format. Please use YYYY-MM-DD')
    }

    // Calculate harmony using our existing engine
    const harmony = SacredGeometryEngine.calculatePersonalHarmony(date, name, favoriteNumber)

    const harmonyLevel = harmony.score >= 80 ? 'Excellent' : 
                        harmony.score >= 60 ? 'Good' : 
                        harmony.score >= 40 ? 'Moderate' : 'Needs Attention'

    return {
      content: [
        {
          type: 'text',
          text: `🌸 **Personal Harmony Report for ${name}**

**Harmony Score: ${harmony.score}/100** (${harmonyLevel} ✨)
**Golden Ratio Alignment: ${harmony.harmonicResonance}**
**Φ (Phi): ${harmony.phi.toFixed(10)}**

**📐 Personalized Recommendations:**
${harmony.recommendations.map(rec => `• ${rec}`).join('\n')}

**🔢 Sacred Mathematics:**
This calculation uses your name's numerological vibration (each letter carries frequency), your birth date's cosmic patterns, and their alignment with the Golden Ratio (Φ = ${harmony.phi.toFixed(6)}), which appears throughout nature in shells, flowers, galaxies, and human proportions.

**🌟 What This Means:**
Your harmony score reflects how closely your personal patterns align with the mathematical principles that govern natural beauty and universal balance. Higher scores suggest stronger resonance with these cosmic patterns.`,
        },
      ],
    }
  }

  private async generateSacredPattern(params: GeometryParams) {
    const { pattern, layers = 3, turns = 5, pointsPerTurn = 20 } = params
    let points: SacredPoint[] = []
    let patternInfo = ''

    switch (pattern) {
      case 'flower_of_life':
        points = SacredGeometryEngine.generateFlowerOfLifePositions(layers)
        patternInfo = `🌸 **Flower of Life Pattern**
Generated ${points.length} sacred points across ${layers} layers.

The Flower of Life is a geometric pattern consisting of multiple evenly-spaced, overlapping circles arranged in a flower-like pattern. It represents the cycle of creation and contains the basis for the design of every atom, molecular structure, and life form in existence.`
        break

      case 'golden_spiral':
        points = SacredGeometryEngine.generateGoldenSpiral(turns, pointsPerTurn)
        patternInfo = `🌀 **Golden Spiral Pattern**
Generated ${points.length} points across ${turns} turns.

The Golden Spiral is based on the Golden Ratio (Φ = ${SacredGeometryEngine.PHI.toFixed(6)}), found throughout nature in shells, galaxies, flower petals, and human proportions. This spiral represents organic growth and natural harmony.`
        break

      case 'pascal_triangle':
        const triangle = SacredGeometryEngine.generatePascalTriangle(layers)
        patternInfo = `🔺 **Pascal Triangle Pattern**
Generated ${layers} rows with sacred numerical relationships.

Pascal's Triangle contains the mathematical foundation for binomial coefficients, Fibonacci numbers, and sacred geometric proportions. Each number is the sum of the two numbers above it, creating infinite mathematical harmonies.`
        
        // Convert triangle to coordinate points for visualization
        points = []
        triangle.forEach((row, i) => {
          row.forEach((value, j) => {
            points.push({
              x: (j - i/2) * 50,
              y: i * 50,
              z: 0,
              layer: i,
              angle: 0,
              distance: Math.sqrt(Math.pow(j - i/2, 2) + Math.pow(i, 2)) * 50,
              geometryType: `pascal_${value}`
            })
          })
        })
        break
    }

    return {
      content: [
        {
          type: 'text',
          text: `${patternInfo}

**📊 Pattern Data:**
- Total Points: ${points.length}
- Pattern Type: ${pattern.replace('_', ' ').toUpperCase()}
- Sacred Geometry Classification: ${points[0]?.geometryType || 'universal'}

**🎨 Usage:**
These coordinates can be used for:
• Meditation visualization and focus
• Sacred art and design projects
• Mathematical education and exploration
• Stress reduction through geometric contemplation

The first few points:
${points.slice(0, 5).map((p, i) => 
  `${i + 1}. (${p.x.toFixed(1)}, ${p.y.toFixed(1)}, ${p.z.toFixed(1)}) - Layer ${p.layer}`
).join('\n')}

*Note: Full coordinate data available for visualization or programming use.*`,
        },
      ],
    }
  }

  private async createMeditationGuide(params: MeditationParams) {
    const { duration, pattern = 'flower_of_life', breathingStyle = 'phi_breathing' } = params

    const phiBreathing = {
      inhale: Math.round(4 * SacredGeometryEngine.PHI),  // ~6.5 seconds
      hold: Math.round(7 * SacredGeometryEngine.PHI),    // ~11.3 seconds  
      exhale: Math.round(8 * SacredGeometryEngine.PHI),  // ~13 seconds
      pause: 2
    }

    const boxBreathing = { inhale: 4, hold: 4, exhale: 4, pause: 2 }
    const breathing = breathingStyle === 'phi_breathing' ? phiBreathing : boxBreathing

    const totalBreathCycle = breathing.inhale + breathing.hold + breathing.exhale + breathing.pause
    const estimatedCycles = Math.floor((duration * 60) / totalBreathCycle)

    const patternDescription = pattern === 'flower_of_life' 
      ? 'Visualize overlapping circles forming the ancient Flower of Life pattern. Each circle represents a cycle of creation, expanding outward in perfect harmony.'
      : 'Visualize a golden spiral growing outward according to the Golden Ratio. Each turn represents natural growth and expansion, like a nautilus shell or galaxy arm.'

    return {
      content: [
        {
          type: 'text',
          text: `🧘 **${duration}-Minute Sacred Geometry Meditation**

**🌸 Visualization Focus:** ${pattern.replace('_', ' ').toUpperCase()}
${patternDescription}

**🌀 Breathing Pattern:** ${breathingStyle.replace('_', ' ').toUpperCase()}
${breathingStyle === 'phi_breathing' ? 
  `Based on the Golden Ratio (Φ = ${SacredGeometryEngine.PHI.toFixed(3)}), this creates natural harmonic resonance:` :
  'A balanced, calming rhythm perfect for beginners:'
}

• **Inhale:** ${breathing.inhale} seconds
• **Hold:** ${breathing.hold} seconds  
• **Exhale:** ${breathing.exhale} seconds
• **Pause:** ${breathing.pause} seconds

**📊 Session Details:**
- Duration: ${duration} minutes
- Breath cycle length: ${totalBreathCycle} seconds
- Estimated breath cycles: ${estimatedCycles}
- Sacred pattern: ${pattern}

**🎯 Meditation Instructions:**

1. **Preparation:** Find a quiet space, sit comfortably, close your eyes
2. **Visualization:** Begin seeing the ${pattern.replace('_', ' ')} pattern in your mind's eye
3. **Breathing:** Follow the rhythm above, letting the pattern expand with each breath
4. **Focus:** If your mind wanders, gently return to the geometric pattern
5. **Integration:** In the final minute, expand the pattern to fill your entire being

**✨ Benefits:**
- Stress reduction through mathematical harmony
- Mental clarity via geometric focus
- Nervous system regulation through rhythmic breathing
- Connection to universal patterns and natural order

**🌟 Meditation Begins Now**
Close your eyes, take a deep breath, and begin visualizing your sacred pattern...`,
        },
      ],
    }
  }

  private async explainSacredMathematics(params: { concept: string, level?: string }) {
    const { concept, level = 'beginner' } = params
    
    const explanations: Record<string, Record<string, string>> = {
      golden_ratio: {
        beginner: `🌟 **The Golden Ratio (Φ = 1.618...)**

The Golden Ratio is nature's most beautiful mathematical relationship. When you divide a line so that the longer part divided by the shorter part equals the whole line divided by the longer part, you get Φ = 1.618...

**🌻 Found Everywhere in Nature:**
• Sunflower seed spirals
• Nautilus shell chambers  
• Flower petal arrangements
• Human body proportions
• Galaxy spiral arms

**🎨 Why It's Special:**
Objects and designs using the Golden Ratio appear naturally pleasing to the human eye. This isn't mystical - it's mathematical. Our brains are pattern-recognition machines, and Φ represents the most efficient growth pattern in nature.`,
        
        intermediate: `📐 **The Golden Ratio: Mathematical Deep Dive**

Φ = (1 + √5) / 2 = 1.6180339887498948...

**🔢 Mathematical Properties:**
• Φ² = Φ + 1 (1.618² = 1.618 + 1 = 2.618)
• 1/Φ = Φ - 1 (the Golden Ratio conjugate = 0.618...)
• Φ = lim(Fₙ₊₁/Fₙ) as n→∞ (limit of Fibonacci ratios)

**🌀 Geometric Construction:**
1. Start with a square
2. Find midpoint of one side
3. Draw arc from midpoint to opposite corner
4. Extend the square using this arc length
5. Result: Golden Rectangle with ratio 1:Φ

**🔬 Scientific Applications:**
• Phyllotaxis (leaf arrangement patterns)
• Crystal growth structures
• DNA molecular geometry
• Economic market analysis (Fibonacci retracements)`,
        
        advanced: `⚛️ **The Golden Ratio: Advanced Mathematics & Physics**

**📊 Continued Fraction Representation:**
Φ = 1 + 1/(1 + 1/(1 + 1/(1 + ...)))

This infinite continued fraction converges to Φ and represents the "most irrational" number - the hardest to approximate with rational fractions.

**🌌 Quantum Mechanical Applications:**
• Quasi-crystal structures follow Golden Ratio proportions
• Penrose tilings exhibit Φ relationships
• Some quantum field theories incorporate Golden Ratio symmetries

**🧬 Biological Optimization:**
The Golden Ratio appears in nature because it represents optimal packing and growth efficiency. Spiral patterns following Φ maximize surface area while minimizing energy expenditure.

**⚡ Information Theory:**
Φ appears in optimal codes and signal processing algorithms, representing the most efficient way to encode certain types of information.`
      },
      
      flower_of_life: {
        beginner: `🌸 **The Flower of Life**

The Flower of Life is a pattern of overlapping circles arranged in a hexagonal pattern. It's called "Flower of Life" because it looks like a flower and represents the cycle of creation.

**🎨 How It's Made:**
1. Start with one circle
2. Draw 6 circles around it, each passing through the center
3. Continue adding layers of circles
4. The intersections create beautiful geometric patterns

**🌍 Cultural Significance:**
Found in ancient temples, art, and sacred sites worldwide:
• Egyptian temples
• Chinese art
• Islamic geometric patterns
• Celtic designs

**✨ Modern Uses:**
• Meditation focus
• Art and design inspiration  
• Stress reduction visualization
• Sacred geometry study`,
        
        intermediate: `🔯 **Flower of Life: Geometric Analysis**

**📐 Mathematical Structure:**
• Based on hexagonal close packing
• Each circle intersects exactly 6 others
• Creates equilateral triangles and hexagons
• Contains all Platonic solids within its structure

**🌀 Generation Algorithm:**
1. Central circle (Layer 0): 1 circle
2. First ring (Layer 1): 6 circles  
3. Second ring (Layer 2): 12 circles
4. Layer n contains 6n circles (except center)
5. Total circles = 1 + 3n(n+1) for n layers

**🎯 Sacred Geometry Relationships:**
• Contains the Vesica Piscis (intersection of two circles)
• Generates the Tree of Life pattern
• Foundation for Metatron's Cube
• Source of all Platonic solid proportions

**🔢 Numerical Properties:**
• 19 complete circles in classical version
• 36 partial arc intersections
• Hexagonal symmetry (6-fold rotational)
• Φ relationships in certain proportions`,
        
        advanced: `⚛️ **Flower of Life: Advanced Sacred Geometry**

**🌌 Topological Properties:**
The Flower of Life represents a 2D projection of higher-dimensional symmetries. It's topologically equivalent to the E8 lattice intersecting a plane, connecting it to:
• String theory compactification
• Exceptional Lie groups  
• Crystal lattice structures
• Hyperdimensional geometry

**🔬 Information Encoding:**
Each intersection point can encode binary information, making the pattern a potential:
• Holographic information storage system
• Genetic code template
• Quantum information structure
• Fractal data compression method

**⚡ Physics Applications:**
• Models 2D quasicrystal structures
• Represents optimal sphere packing projections
• Appears in some unified field theories
• Connected to dodecahedral space topology theories

**🧮 Computational Aspects:**
• Generates through iterative circle packing algorithms
• Optimizes certain network topologies
• Used in biomimetic design optimization
• Foundation for some machine learning architectures`
      }
    }

    const explanation = explanations[concept]?.[level] || 
      `I don't have a ${level} explanation for ${concept} yet. Available concepts: ${Object.keys(explanations).join(', ')}`

    return {
      content: [
        {
          type: 'text',
          text: explanation,
        },
      ],
    }
  }

  private setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error)
    }

    process.on('SIGINT', async () => {
      await this.server.close()
      process.exit(0)
    })
  }

  async run() {
    const transport = new StdioServerTransport()
    await this.server.connect(transport)
    console.error('Sacred Geometry MCP server running on stdio')
  }
}

// Start the server
const server = new SacredGeometryMCPServer()
server.run().catch(console.error)