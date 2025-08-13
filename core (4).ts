/**
 * Sacred Geometry Core - NPM Package Entry Point
 * Clean, dependency-free version for npm distribution
 */

// Core Golden Ratio constant
export const PHI = (1 + Math.sqrt(5)) / 2;
export const PHI_CONJUGATE = 1 / PHI;

export interface SacredPoint {
  x: number;
  y: number;
  z: number;
  layer: number;
  angle: number;
  distance: number;
  geometryType: string;
}

export interface HarmonyCalculation {
  score: number;
  phi: number;
  phiConjugate: number;
  goldenRatio: number;
  harmonicResonance: number;
  recommendations: string[];
}

export class SacredGeometryEngine {
  public static readonly PHI = PHI;
  public static readonly PHI_CONJUGATE = PHI_CONJUGATE;

  static generatePascalTriangle(rows: number): number[][] {
    const triangle: number[][] = [];
    
    for (let i = 0; i < rows; i++) {
      const row: number[] = [];
      for (let j = 0; j <= i; j++) {
        if (j === 0 || j === i) {
          row.push(1);
        } else {
          row.push(triangle[i - 1][j - 1] + triangle[i - 1][j]);
        }
      }
      triangle.push(row);
    }
    
    return triangle;
  }

  static generateFlowerOfLifePositions(layers: number = 3): SacredPoint[] {
    const points: SacredPoint[] = [];
    const radius = 100;

    points.push({
      x: 0, y: 0, z: 0, layer: 0, angle: 0, distance: 0,
      geometryType: 'flower_of_life_center'
    });

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
          distance: layerRadius,
          geometryType: 'flower_of_life'
        });
      }
    }

    return points;
  }

  static generateGoldenSpiral(turns: number = 5, pointsPerTurn: number = 20): SacredPoint[] {
    const points: SacredPoint[] = [];
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
        distance: radius,
        geometryType: 'golden_spiral'
      });
    }

    return points;
  }

  static calculatePersonalHarmony(
    birthDate: Date,
    name: string,
    favoriteNumber: number = 7
  ): HarmonyCalculation {
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

    const recommendations = this.generateHarmonyRecommendations(score, lifePath, nameHarmonic);

    return {
      score: Math.round(score),
      phi: PHI,
      phiConjugate: PHI_CONJUGATE,
      goldenRatio: PHI,
      harmonicResonance: Math.round(harmonicResonance * 100) / 100,
      recommendations
    };
  }

  private static generateHarmonyRecommendations(
    score: number, 
    lifePath: number, 
    nameHarmonic: number
  ): string[] {
    const recommendations: string[] = [];

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
}

// Package metadata
export const ULP = {
  name: "Universal Life Protocol Core",
  version: "2.0.0",
  description: "Sacred Geometry Tools for Personal Harmony"
};

// Simple harmony calculator for npm users
export const calculateHarmony = (name: string, birthDate: Date, favoriteNumber: number = 7): HarmonyCalculation => {
  return SacredGeometryEngine.calculatePersonalHarmony(birthDate, name, favoriteNumber);
};

export default SacredGeometryEngine;