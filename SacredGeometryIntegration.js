import { SacredGeometryEngine } from 'sacred-geometry-harmony';
import { CooperativeEconomicsEngine } from './src/services/CooperativeEconomics';
/**
 * Integration bridge between DPO Marketplace and Sacred Geometry Harmony
 */
export class DPOSacredGeometryIntegration {
    constructor() {
        this.geometryEngine = new SacredGeometryEngine();
        this.economicsEngine = new CooperativeEconomicsEngine();
    }
    /**
     * Calculate cooperative member pricing based on personality profile
     */
    calculatePersonalizedCooperativePricing(personalityType, baseCost) {
        const personalityMultiplier = this.getPersonalityCooperativeMultiplier(personalityType);
        const sacredGeometryAdjustment = this.geometryEngine.calculateGoldenRatio();
        return this.economicsEngine.calculateSacredGeometryPricing(baseCost * personalityMultiplier, 8, // Standard 8-hour work day
        1 // Individual pricing
        );
    }
    /**
     * Get cooperative affinity based on Myers-Briggs type
     */
    getPersonalityCooperativeMultiplier(personalityType) {
        const cooperativeTypes = {
            'ENFJ': 1.2, // Natural cooperators
            'INFJ': 1.1, // Idealistic cooperators
            'ENFP': 1.15, // Enthusiastic cooperators
            'ENTP': 1.1, // Innovative cooperators
            'ISFJ': 1.1, // Supportive cooperators
            'ESFJ': 1.15, // Community-minded cooperators
            // Other types get standard pricing
        };
        return cooperativeTypes[personalityType] || 1.0;
    }
}
