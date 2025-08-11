/**
 * Sacred Geometry Engine - Core Mathematical Functions
 * Clean, working implementation of sacred mathematics for personal harmony
 */
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
declare class SacredGeometryEngine {
    static readonly PHI: number;
    static readonly PHI_CONJUGATE: number;
    /**
     * Generate Pascal Triangle - Foundation for harmonic calculations
     */
    static generatePascalTriangle(rows: number): number[][];
    /**
     * Generate Flower of Life sacred positions
     */
    static generateFlowerOfLifePositions(layers?: number): SacredPoint[];
    /**
     * Generate Golden Spiral points
     */
    static generateGoldenSpiral(turns?: number, pointsPerTurn?: number): SacredPoint[];
    /**
     * Calculate Personal Harmony Score based on input data
     */
    static calculatePersonalHarmony(birthDate: Date, name: string, favoriteNumber?: number): HarmonyCalculation;
    /**
     * Generate personalized harmony recommendations
     */
    private static generateHarmonyRecommendations;
    /**
     * Calculate geometric influence for a position
     */
    static calculateGeometricInfluence(position: SacredPoint, pascalValue: number): number;
}
export default SacredGeometryEngine;
