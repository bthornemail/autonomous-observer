#!/usr/bin/env node

/**
 * Sacred Geometry MCP Server for VS Code - Final Working Version
 * Self-contained, no external dependencies beyond MCP SDK
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const PHI = (1 + Math.sqrt(5)) / 2;

class SacredGeometryEngine {
  static PHI = PHI;

  static calculatePersonalHarmony(birthDate, name, favoriteNumber = 7) {
    const day = birthDate.getDate();
    const month = birthDate.getMonth() + 1;
    const year = birthDate.getFullYear();
    
    const nameValue = name.toLowerCase()
      .split('')
      .reduce((sum, char) => sum + (char.charCodeAt(0) - 96), 0);

    const lifePath = (day + month + year) % 9 || 9;
    const nameHarmonic = nameValue % 9 || 9;
    const combinedResonance = (lifePath + nameHarmonic + favoriteNumber) / 3;

    const phiAlignment = Math.abs(combinedResonance - PHI * 3) / 10;
    const harmonicResonance = 1 - phiAlignment;

    const score = Math.max(0, Math.min(100, 
      (harmonicResonance * 50) + 
      (lifePath * 5) + 
      (nameHarmonic * 3) + 
      (favoriteNumber * 2)
    ));

    const recommendations = this.generateRecommendations(score, lifePath, nameHarmonic);

    return {
      score: Math.round(score),
      phi: PHI,
      harmonicResonance: Math.round(harmonicResonance * 100) / 100,
      recommendations
    };
  }

  static generateRecommendations(score, lifePath, nameHarmonic) {
    const recommendations = [];

    if (score >= 80) {
      recommendations.push("🌟 Your harmony is excellent! Continue your current practices.");
      recommendations.push("✨ Share your positive energy with others today.");
    } else if (score >= 60) {
      recommendations.push("📐 Focus on golden ratio patterns in nature (flowers, shells).");
      recommendations.push("🧘 Practice meditation during sacred hours (sunrise/sunset).");
    } else if (score >= 40) {
      recommendations.push("🌸 Spend time with Flower of Life patterns for balance.");
      recommendations.push("💫 Consider sacred geometry art for your living space.");
    } else {
      recommendations.push("🎯 Focus on grounding exercises and natural patterns.");
      recommendations.push("⚡ Reset your energy with geometric breathing exercises.");
    }

    if (lifePath <= 3) {
      recommendations.push("🔺 Work with triangle energy - focus and direction.");
    } else if (lifePath <= 6) {
      recommendations.push("⬡ Embrace hexagon patterns - harmony and balance.");
    } else {
      recommendations.push("⭐ Connect with pentagram energy - transformation.");
    }

    return recommendations;
  }

  static generateFlowerOfLifePositions(layers = 3) {
    const points = [];
    const radius = 100;

    points.push({ x: 0, y: 0, z: 0, layer: 0, angle: 0, distance: 0 });

    for (let layer = 1; layer <= layers; layer++) {
      const pointsInLayer = layer * 6;
      const layerRadius = radius * layer;

      for (let i = 0; i < pointsInLayer; i++) {
        const angle = (i / pointsInLayer) * 2 * Math.PI;
        points.push({
          x: Math.cos(angle) * layerRadius,
          y: Math.sin(angle) * layerRadius,
          z: 0,
          layer,
          angle,
          distance: layerRadius
        });
      }
    }

    return points;
  }

  static generateGoldenSpiral(turns = 5, pointsPerTurn = 20) {
    const points = [];
    const totalPoints = turns * pointsPerTurn;

    for (let i = 0; i < totalPoints; i++) {
      const t = i / pointsPerTurn;
      const angle = t * 2 * Math.PI;
      const radius = Math.pow(PHI, t * 0.3);

      points.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        z: 0,
        layer: Math.floor(t),
        angle,
        distance: radius
      });
    }

    return points;
  }
}

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
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'calculate_personal_harmony',
            description: 'Calculate personal harmony score using sacred geometry mathematics',
            inputSchema: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'Full name' },
                birthDate: { type: 'string', description: 'Birth date (YYYY-MM-DD)' },
                favoriteNumber: { type: 'number', description: 'Favorite number 1-9', minimum: 1, maximum: 9 },
              },
              required: ['name', 'birthDate', 'favoriteNumber'],
            },
          },
          {
            name: 'generate_sacred_pattern',
            description: 'Generate sacred geometry patterns',
            inputSchema: {
              type: 'object',
              properties: {
                pattern: { type: 'string', enum: ['flower_of_life', 'golden_spiral'], description: 'Pattern type' },
                layers: { type: 'number', description: 'Number of layers', minimum: 1, maximum: 7 },
                turns: { type: 'number', description: 'Spiral turns', minimum: 1, maximum: 10 },
              },
              required: ['pattern'],
            },
          },
          {
            name: 'explain_golden_ratio',
            description: 'Explain the Golden Ratio and its significance',
            inputSchema: {
              type: 'object',
              properties: {
                level: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'], description: 'Explanation level' },
              },
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'calculate_personal_harmony':
            return await this.calculateHarmony(args);
          case 'generate_sacred_pattern':
            return await this.generatePattern(args);
          case 'explain_golden_ratio':
            return await this.explainGoldenRatio(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Error: ${error.message}` }],
        };
      }
    });
  }

  async calculateHarmony(params) {
    const { name, birthDate, favoriteNumber } = params;
    
    const date = new Date(birthDate);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid birth date. Use YYYY-MM-DD format.');
    }

    const harmony = SacredGeometryEngine.calculatePersonalHarmony(date, name, favoriteNumber);
    const level = harmony.score >= 80 ? 'Excellent ✨' : harmony.score >= 60 ? 'Good 🌟' : 'Moderate 📐';

    return {
      content: [{
        type: 'text',
        text: `🌸 **Personal Harmony Report for ${name}**

**Harmony Score: ${harmony.score}/100** (${level})
**Golden Ratio (Φ): ${harmony.phi.toFixed(10)}**
**Harmonic Resonance: ${harmony.harmonicResonance}**

**📐 Your Personalized Recommendations:**
${harmony.recommendations.map(rec => `• ${rec}`).join('\n')}

**🔢 Sacred Mathematics Explanation:**
Your harmony score reflects how closely your personal patterns align with the Golden Ratio (Φ = ${harmony.phi.toFixed(6)}), which appears throughout nature in flower petals, nautilus shells, galaxy spirals, and human body proportions. This calculation combines:
• Your name's numerological vibration
• Your birth date's cosmic numerical patterns  
• The mathematical relationship to the Golden Ratio
• Sacred geometric principles used by ancient civilizations

Higher scores indicate stronger resonance with these universal mathematical principles of beauty and natural harmony.

*Generated by Sacred Geometry Harmony MCP Server v2.0.0*`
      }]
    };
  }

  async generatePattern(params) {
    const { pattern, layers = 3, turns = 5 } = params;
    let points = [];
    let patternInfo = '';

    if (pattern === 'flower_of_life') {
      points = SacredGeometryEngine.generateFlowerOfLifePositions(layers);
      patternInfo = `🌸 **Flower of Life Pattern**
Generated ${points.length} sacred points across ${layers} layers.

The Flower of Life is an ancient sacred geometry pattern found in temples worldwide. It represents the fundamental forms of space and time, containing the mathematical basis for all Platonic solids.`;
    } else if (pattern === 'golden_spiral') {
      points = SacredGeometryEngine.generateGoldenSpiral(turns, 20);
      patternInfo = `🌀 **Golden Spiral Pattern**
Generated ${points.length} points across ${turns} turns following Φ = ${PHI.toFixed(6)}.

The Golden Spiral appears in nautilus shells, galaxy arms, sunflower seed arrangements, and represents organic growth following the most efficient mathematical proportions in nature.`;
    }

    return {
      content: [{
        type: 'text',
        text: `${patternInfo}

**📊 Pattern Coordinates:**
- Total Points: ${points.length}
- Mathematical Foundation: Golden Ratio (Φ = ${PHI.toFixed(10)})

**First 8 Coordinate Points:**
${points.slice(0, 8).map((p, i) => 
  `${i + 1}. (${p.x.toFixed(1)}, ${p.y.toFixed(1)}, ${p.z.toFixed(1)}) - Layer ${p.layer}`
).join('\n')}

*These coordinates can be used for meditation visualization, sacred art creation, architectural design, or mathematical exploration of natural patterns.*`
      }]
    };
  }

  async explainGoldenRatio(params) {
    const level = params.level || 'beginner';
    
    const explanations = {
      beginner: `🌟 **The Golden Ratio (Φ = ${PHI.toFixed(6)})**

The Golden Ratio is nature's most beautiful mathematical relationship! When you divide a line so that the longer part divided by the shorter part equals the whole line divided by the longer part, you get this magical number.

**🌻 Where You'll Find It:**
• Sunflower spirals (55 and 89 spirals - both Fibonacci numbers!)  
• Nautilus shell chambers grow in perfect Golden Ratio proportions
• Your own body: arm length vs height follows Φ
• Flower petals often come in Fibonacci numbers (3, 5, 8, 13, 21...)

**✨ Why It Matters:**
Your brain naturally finds Golden Ratio proportions pleasing to look at. This isn't mystical - it's pure mathematics! The Golden Ratio represents the most efficient growth and proportion pattern found throughout nature.`,

      intermediate: `📐 **Golden Ratio: Mathematical Deep Dive**

Φ = (1 + √5) / 2 = ${PHI.toFixed(15)}

**🔢 Fascinating Properties:**
• Φ² = Φ + 1 (${(PHI * PHI).toFixed(6)} = ${(PHI + 1).toFixed(6)})
• 1/Φ = Φ - 1 (the conjugate = ${(1/PHI).toFixed(6)})  
• Φ is the limit of Fibonacci ratios: 1/1, 2/1, 3/2, 5/3, 8/5, 13/8...
• It's the most "irrational" number - hardest to approximate with fractions

**🏛️ Historical Applications:**
• Greek Parthenon proportions
• Egyptian pyramid ratios
• Renaissance art compositions
• Modern architectural harmony`,

      advanced: `⚛️ **Golden Ratio: Advanced Mathematics**

**📊 Continued Fraction Representation:**
Φ = 1 + 1/(1 + 1/(1 + 1/(1 + ...)))

This infinite continued fraction makes Φ the "most irrational" number, meaning it's the hardest to approximate with simple fractions - making it appear frequently in optimization problems.

**🌌 Advanced Applications:**
• Quasi-crystalline structures follow Golden Ratio proportions
• Some quantum field theories incorporate Φ symmetries  
• Fibonacci spirals optimize packing efficiency (sunflower seeds)
• Used in computer algorithms for optimal search strategies
• Appears in financial market analysis (Fibonacci retracements)

**🧬 Information Theory:**
Φ appears in optimal encoding schemes and represents maximum information density in certain mathematical systems, connecting geometry to information theory.`
    };

    return {
      content: [{
        type: 'text',
        text: explanations[level] || explanations.beginner
      }]
    };
  }

  setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error('[Sacred Geometry MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('🌸 Sacred Geometry MCP Server running - published package: sacred-geometry-harmony@2.0.0');
  }
}

const server = new SacredGeometryMCPServer();
server.run().catch(console.error);