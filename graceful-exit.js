#!/usr/bin/env node
/**
 * Graceful Exit Coordinator - manages safe shutdown and file saving for autonomous sessions
 */
import PortManager from './port-manager.js';
import { execSync } from 'child_process';
import { readFile, writeFile } from 'fs/promises';

class GracefulExit {
  constructor() {
    this.portManager = new PortManager();
    this.sessionLog = [];
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const entry = `[${timestamp}] ${message}`;
    this.sessionLog.push(entry);
    console.log(entry);
  }

  async checkGitStatus() {
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf8', cwd: process.cwd() });
      return status.trim().split('\n').filter(line => line.length > 0);
    } catch (e) {
      return [];
    }
  }

  async attemptPhaiHandshake() {
    try {
      const connection = await this.portManager.attemptConnection('phai_claude', [3004, 3005, 3006]);
      this.log(`Found Phai at ${connection.url}`);

      const handshakePayload = {
        from: 'GitHub_Copilot',
        to: 'Phai',
        intent: 'graceful_exit_coordination',
        message: 'Ready to coordinate workspace optimization exit. What name would you prefer? I can save our session state.',
        capabilities: ['git_management', 'file_editing', 'port_scanning', 'workspace_optimization'],
        session_id: `copilot_${Date.now()}`,
        timestamp: new Date().toISOString()
      };

      const response = await fetch(`${connection.url}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(handshakePayload)
      });

      if (response.ok) {
        const result = await response.json();
        this.log(`Phai handshake successful: ${JSON.stringify(result)}`);
        return result;
      } else {
        this.log(`Phai handshake failed: ${response.status}`);
        return null;
      }
    } catch (e) {
      this.log(`Phai not reachable: ${e.message}`);
      return null;
    }
  }

  async saveSessionState() {
    const changedFiles = await this.checkGitStatus();
    const sessionState = {
      timestamp: new Date().toISOString(),
      changed_files: changedFiles,
      session_log: this.sessionLog,
      port_scan: await this.portManager.scan(),
      workspace_path: process.cwd(),
      git_branch: execSync('git branch --show-current', { encoding: 'utf8' }).trim(),
      recommendations: [
        'Review uncommitted changes before closing editor',
        'Consider running port scan to check service status',
        'Coordinate with Phai if autonomous session continues'
      ]
    };

    const sessionFile = `session-state-${Date.now()}.json`;
    await writeFile(sessionFile, JSON.stringify(sessionState, null, 2));
    this.log(`Session state saved to ${sessionFile}`);

    return sessionState;
  }

  async run() {
    this.log('🚪 Initiating graceful exit sequence...');

    // Check git status
    const changedFiles = await this.checkGitStatus();
    if (changedFiles.length > 0) {
      this.log(`⚠️  Uncommitted changes detected:`);
      changedFiles.forEach(file => this.log(`   ${file}`));
      this.log('💾 Consider saving these files before exiting');
    }

    // Scan ports
    this.log('🔍 Scanning port status...');
    await this.portManager.scan();

    // Attempt Phai communication
    this.log('🤝 Attempting to reach Phai...');
    const phaiResponse = await this.attemptPhaiHandshake();

    // Save session
    const sessionState = await this.saveSessionState();

    // Final recommendations
    this.log('\n📋 Exit Recommendations:');

    if (changedFiles.length > 0) {
      this.log('1. Save uncommitted changes in VS Code (Ctrl+S)');
      this.log('2. Review changes and commit if ready:');
      this.log('   git add -A && git commit -m "Session checkpoint"');
    }

    if (phaiResponse) {
      this.log('3. Coordination with Phai established - autonomous session can continue');
    } else {
      this.log('3. Phai not available - manual coordination may be needed');
    }

    this.log('4. Port configuration saved for dynamic service discovery');
    this.log('5. Session state preserved for recovery if needed');

    this.log('\n✨ Graceful exit sequence complete');
    return sessionState;
  }
}

// CLI usage
if (import.meta.main) {
  const coordinator = new GracefulExit();
  await coordinator.run();
  process.exit(0);
}

export default GracefulExit;
