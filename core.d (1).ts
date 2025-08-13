/**
 * Sacred Geometry Core - NPM Package Entry Point
 * Clean, dependency-free version for npm distribution
 */
export declare const PHI: number;
export declare const PHI_CONJUGATE: number;
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
export declare class SacredGeometryEngine {
    static readonly PHI: number;
    static readonly PHI_CONJUGATE: number;
    static generatePascalTriangle(rows: number): number[][];
    static generateFlowerOfLifePositions(layers?: number): SacredPoint[];
    static generateGoldenSpiral(turns?: number, pointsPerTurn?: number): SacredPoint[];
    static calculatePersonalHarmony(birthDate: Date, name: string, favoriteNumber?: number): HarmonyCalculation;
    private static generateHarmonyRecommendations;
}
export declare const ULP: {
    name: string;
    version: string;
    description: string;
};
export declare const calculateHarmony: (name: string, birthDate: Date, favoriteNumber?: number) => HarmonyCalculation;
export default SacredGeometryEngine;
