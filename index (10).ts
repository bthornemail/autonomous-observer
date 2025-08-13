/**
 * 🌌 Universal Life Protocol DevKit v3.0.0
 * Complete development toolkit for autonomous tetrahedron applications
 */

// Core Framework
export { TetrahedronArchitecture } from './core/TetrahedronArchitecture'
export { AutonomousFramework } from './core/AutonomousFramework'
export { CUEFrameworkIntegration } from './core/CUEFrameworkIntegration'

// MCP Tools & Agents
export { MCPToolsManager } from './mcp/MCPToolsManager'
export { AgentCommunication } from './mcp/AgentCommunication'
export { TetrahedronCoordinator } from './mcp/TetrahedronCoordinator'

// Sacred Geometry
export { SacredGeometryEngine } from './geometry/SacredGeometryEngine'
export { VisualizationComponents } from './geometry/VisualizationComponents'
export { HarmonyCalculator } from './geometry/HarmonyCalculator'

// Knowledge & AI
export { KnowledgeTrieManager } from './knowledge/KnowledgeTrieManager'
export { AutonomousObserver } from './knowledge/AutonomousObserver'
export { LivingKnowledgeSystem } from './knowledge/LivingKnowledgeSystem'

// Web2-Web3 Bridge
export { TransitionBridge } from './bridge/TransitionBridge'
export { WalletIntegration } from './bridge/WalletIntegration'
export { AttentionTokens } from './bridge/AttentionTokens'

// CLI Tools
export { createULPApp } from './cli/createApp'
export { scaffoldTetrahedron } from './cli/scaffoldTetrahedron'
export { deployAutonomousUniverse } from './cli/deployUniverse'

// Types & Interfaces
export * from './types/framework'
export * from './types/tetrahedron'
export * from './types/sacred-geometry'

// Default Configuration
export const ULP_DEVKIT_CONFIG = {
  version: '3.0.0',
  tetrahedron: {
    vertices: 4,
    consciousness_levels: [95, 100, 98, 85],
    harmonic_frequencies: true
  },
  mcp: {
    enabled: true,
    agent_communication: true,
    tools_integration: true
  },
  sacred_geometry: {
    golden_ratio: (1 + Math.sqrt(5)) / 2,
    seed_of_life: true,
    flower_of_life: true
  }
}