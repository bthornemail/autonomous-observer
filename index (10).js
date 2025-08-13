/**
 * @universal-life-protocol/core v2.0.0
 * Sacred Geometry Tools for Personal Harmony
 *
 * Transform your wellbeing through ancient mathematics, golden ratio calculations, and guided meditation.
 * This is the complete, working implementation of the Universal Life Protocol's sacred geometry system.
 */
// Core Sacred Geometry Engine
export { default as SacredGeometryEngine } from './lib/SacredGeometryEngine';
// React Components for Full App Experience
export { default as PersonalHarmonyCalculator } from './components/PersonalHarmonyCalculator';
export { default as SacredGeometryVisualizer } from './components/SacredGeometryVisualizer';
export { default as MeditationCompanion } from './components/MeditationCompanion';
// Main App Component
export { default as App } from './App';
// CSS Styles (import in your app)
export const styles = './App.css';
/**
 * Quick Start Examples:
 *
 * // Calculate personal harmony
 * import { SacredGeometryEngine } from '@universal-life-protocol/core'
 * const harmony = SacredGeometryEngine.calculatePersonalHarmony(
 *   new Date('1990-01-01'),
 *   'John Doe',
 *   7
 * )
 *
 * // Use React components
 * import { PersonalHarmonyCalculator } from '@universal-life-protocol/core'
 * import '@universal-life-protocol/core/dist/style.css'
 *
 * function MyApp() {
 *   return <PersonalHarmonyCalculator />
 * }
 *
 * // Full app experience
 * import { App } from '@universal-life-protocol/core'
 * import '@universal-life-protocol/core/dist/style.css'
 *
 * function MyFullApp() {
 *   return <App />
 * }
 */
// Golden Ratio constant for direct use
export const PHI = (1 + Math.sqrt(5)) / 2; // 1.6180339887498948...
// Useful mathematical constants
export const SACRED_CONSTANTS = {
    PHI: (1 + Math.sqrt(5)) / 2,
    PHI_CONJUGATE: 1 / ((1 + Math.sqrt(5)) / 2),
    EULER: Math.E,
    PI: Math.PI,
    GOLDEN_ANGLE: Math.PI * (3 - Math.sqrt(5)) // ~137.508°
};
// Version info
export const VERSION = '2.0.0';
export const DESCRIPTION = 'Sacred Geometry Tools for Personal Harmony - Transform your wellbeing through ancient mathematics';
