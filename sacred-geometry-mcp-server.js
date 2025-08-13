#!/usr/bin/env node

/**
 * Sacred Geometry MCP Server for VS Code
 * Integrates your published npm package with Claude via MCP
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Import your published package
import { SacredGeometryEngine, calculateHarmony, PHI, ULP } from 'sacred-geometry-harmony';

class SacredGeometryMCPServer {
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
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  setupToolHandlers() {
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
            description: 'Generate coordinates for sacred geometry patterns like Flower of Life or Golden Spiral',
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
            name: 'explain_sacred_mathematics',
            description: 'Provide educational explanation of sacred geometry concepts and golden ratio',
            inputSchema: {
              type: 'object',
              properties: {
                concept: {
                  type: 'string',
                  enum: ['golden_ratio', 'flower_of_life', 'fibonacci', 'sacred_geometry_overview'],
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
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'calculate_personal_harmony':
            return await this.calculatePersonalHarmony(args);
          
          case 'generate_sacred_pattern':
            return await this.generateSacredPattern(args);
          
          case 'explain_sacred_mathematics':
            return await this.explainSacredMathematics(args);
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error executing ${name}: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    });
  }

  async calculatePersonalHarmony(params) {
    const { name, birthDate, favoriteNumber } = params;
    
    if (!name || !birthDate || favoriteNumber < 1 || favoriteNumber > 9) {
      throw new Error('Invalid parameters: name and birthDate are required, favoriteNumber must be 1-9');
    }

    const date = new Date(birthDate);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid birth date format. Please use YYYY-MM-DD');
    }

    // Use your published package!
    const harmony = calculateHarmony(name, date, favoriteNumber);

    const harmonyLevel = harmony.score >= 80 ? 'Excellent ✨' : 
                        harmony.score >= 60 ? 'Good 🌟' : 
                        harmony.score >= 40 ? 'Moderate 📐' : 'Needs Attention 🎯';

    return {
      content: [
        {
          type: 'text',
          text: `🌸 **Personal Harmony Report for ${name}**

**Harmony Score: ${harmony.score}/100** (${harmonyLevel})
**Golden Ratio (Φ): ${PHI.toFixed(10)}**
**Harmonic Resonance: ${harmony.harmonicResonance}**

**📐 Personalized Recommendations:**
${harmony.recommendations.map(rec => `• ${rec}`).join('\n')}

**🔢 Sacred Mathematics:**
This calculation uses your name's numerological vibration, your birth date's cosmic patterns, and their alignment with the Golden Ratio (Φ = ${PHI.toFixed(6)}), which appears throughout nature in shells, flowers, galaxies, and human proportions.

**🌟 What This Means:**
Your harmony score reflects how closely your personal patterns align with the mathematical principles that govern natural beauty and universal balance.

*Generated using the Sacred Geometry Harmony npm package v${ULP.version}*`,
        },
      ],
    };
  }

  async generateSacredPattern(params) {
    const { pattern, layers = 3, turns = 5, pointsPerTurn = 20 } = params;
    let points = [];
    let patternInfo = '';

    switch (pattern) {
      case 'flower_of_life':
        points = SacredGeometryEngine.generateFlowerOfLifePositions(layers);
        patternInfo = `🌸 **Flower of Life Pattern**
Generated ${points.length} sacred points across ${layers} layers using precise geometric calculations.

The Flower of Life represents the cycle of creation and contains the basis for every atom, molecular structure, and life form.`;
        break;

      case 'golden_spiral':
        points = SacredGeometryEngine.generateGoldenSpiral(turns, pointsPerTurn);
        patternInfo = `🌀 **Golden Spiral Pattern**
Generated ${points.length} points across ${turns} turns following the Golden Ratio (Φ = ${PHI.toFixed(6)}).

Found in nautilus shells, galaxy arms, sunflower seeds, and represents organic growth and natural harmony.`;
        break;

      case 'pascal_triangle':
        const triangle = SacredGeometryEngine.generatePascalTriangle(layers);
        patternInfo = `🔺 **Pascal Triangle Pattern**
Generated ${layers} rows containing sacred numerical relationships.

Contains Fibonacci numbers, powers of 2, and forms the mathematical foundation for many sacred patterns.`;
        break;
    }

    return {
      content: [
        {
          type: 'text',
          text: `${patternInfo}

**📊 Pattern Data:**
- Total Points: ${points.length}
- Pattern Type: ${pattern.replace('_', ' ').toUpperCase()}
- Golden Ratio (Φ): ${PHI.toFixed(10)}

**First 5 coordinate points:**
${points.slice(0, 5).map((p, i) => 
  `${i + 1}. (${p.x.toFixed(1)}, ${p.y.toFixed(1)}, ${p.z.toFixed(1)}) - Layer ${p.layer}`
).join('\n')}

*Perfect for meditation visualization, sacred art, or mathematical exploration.*`,
        },
      ],
    };
  }

  async explainSacredMathematics(params) {
    const { concept, level = 'beginner' } = params;
    
    const explanations = {
      golden_ratio: {
        beginner: `🌟 **The Golden Ratio (Φ = ${PHI.toFixed(10)})**

The Golden Ratio is nature's most beautiful mathematical relationship. When you divide any line so that the longer part divided by the shorter part equals the whole line divided by the longer part, you get Φ.

**🌻 Found Everywhere in Nature:**
• Sunflower seed spirals (89 and 144 spirals - both Fibonacci numbers!)
• Nautilus shell chambers grow in Golden Ratio proportions
• Human body proportions (arm length vs height)
• Flower petal arrangements follow Φ patterns

**✨ Why It Matters:**
Your brain naturally finds Golden Ratio proportions pleasing. It's not mysticism - it's mathematics! This ratio represents the most efficient growth pattern in nature.`,
        
        intermediate: `📐 **Golden Ratio: Mathematical Properties**

Φ = (1 + √5) / 2 = ${PHI.toFixed(15)}

**🔢 Unique Mathematical Properties:**
• Φ² = Φ + 1 (${(PHI * PHI).toFixed(6)} = ${(PHI + 1).toFixed(6)})
• 1/Φ = Φ - 1 (the conjugate = ${(1/PHI).toFixed(6)})
• Φ appears as the limit of Fibonacci ratios: 1, 1, 2, 3, 5, 8, 13, 21...

**🌀 Sacred Geometry Applications:**
• Pentagon construction and pentagram ratios
• Golden Rectangle and Golden Spiral generation
• Architectural proportions (Parthenon, pyramids)
• Musical harmony and frequency ratios`,

        advanced: `⚛️ **Golden Ratio: Advanced Mathematics**

**📊 Continued Fraction:**
Φ = 1 + 1/(1 + 1/(1 + 1/(1 + ...)))

This infinite continued fraction makes Φ the "most irrational" number - hardest to approximate with simple fractions.

**🌌 Applications in Physics:**
• Quasi-crystal structures follow Φ proportions
• Some quantum field theories incorporate Golden Ratio symmetries
• Optimization algorithms use Φ for efficient search patterns

**🧬 Information Theory:**
Φ appears in optimal encoding schemes and represents maximum information density in certain systems.`
      },
      
      flower_of_life: {
        beginner: `🌸 **The Flower of Life Pattern**

Created by drawing overlapping circles in a hexagonal pattern, each circle passing through the center of surrounding circles.

**🎨 How It's Made:**
1. Start with one circle
2. Draw 6 circles around it, each center touching the original circle
3. Continue adding layers of circles
4. The overlapping areas create beautiful geometric patterns

**🌍 Found Throughout History:**
• Ancient Egyptian temples (Temple of Osiris)
• Leonardo da Vinci's studies
• Islamic geometric art
• Modern meditation and spiritual practices

**✨ Why It's Special:**
Contains the mathematical basis for all Platonic solids and represents the fundamental patterns of creation.`
      }
    };

    const explanation = explanations[concept]?.[level] || 
      `I can explain: ${Object.keys(explanations).join(', ')}. Available levels: beginner, intermediate, advanced.`;

    return {
      content: [
        {
          type: 'text',
          text: explanation,
        },
      ],
    };
  }

  setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Sacred Geometry MCP server running on stdio - using npm package sacred-geometry-harmony@2.0.0');
  }
}

// Start the server
const server = new SacredGeometryMCPServer();
server.run().catch(console.error);