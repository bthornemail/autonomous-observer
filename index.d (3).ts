/**
 * @universal-life-protocol/core v2.0.0
 * Sacred Geometry Tools for Personal Harmony
 *
 * Transform your wellbeing through ancient mathematics, golden ratio calculations, and guided meditation.
 * This is the complete, working implementation of the Universal Life Protocol's sacred geometry system.
 */
export { default as SacredGeometryEngine } from './lib/SacredGeometryEngine';
export type { SacredPoint, HarmonyCalculation } from './lib/SacredGeometryEngine';
export { default as PersonalHarmonyCalculator } from './components/PersonalHarmonyCalculator';
export { default as SacredGeometryVisualizer } from './components/SacredGeometryVisualizer';
export { default as MeditationCompanion } from './components/MeditationCompanion';
export { default as App } from './App';
export declare const styles = "./App.css";
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
export declare const PHI: number;
export declare const SACRED_CONSTANTS: {
    readonly PHI: number;
    readonly PHI_CONJUGATE: number;
    readonly EULER: number;
    readonly PI: number;
    readonly GOLDEN_ANGLE: number;
};
export declare const VERSION = "2.0.0";
export declare const DESCRIPTION = "Sacred Geometry Tools for Personal Harmony - Transform your wellbeing through ancient mathematics";
