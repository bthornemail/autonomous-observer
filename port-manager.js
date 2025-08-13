#!/usr/bin/env node
/**
 * Dynamic Port Manager - discovers and logs available ports for MCP services
 * Integrates with CUE configuration and provides runtime port resolution
 */
import { readFile, writeFile } from 'fs/promises';
import { createServer } from 'net';

const CONFIG_FILE = './port-config.json';
const CUE_OUTPUT_FILE = './ports.cue';

class PortManager {
  constructor() {
    this.config = null;
    this.activeServices = new Map();
  }

  async loadConfig() {
    try {
      const data = await readFile(CONFIG_FILE, 'utf8');
      this.config = JSON.parse(data);
    } catch (e) {
      console.error('Failed to load port config:', e.message);
      this.config = { services: {}, discovery: { fallback_ports: [8080, 8081, 8082] } };
    }
  }

  async checkPort(port) {
    return new Promise((resolve) => {
      const server = createServer();
      server.listen(port, () => {
        server.once('close', () => resolve(true));
        server.close();
      });
      server.on('error', () => resolve(false));
    });
  }

  async discoverServices() {
    const services = this.config.services || {};
    const discovered = {};

    for (const [name, config] of Object.entries(services)) {
      if (config.stdio) {
        discovered[name] = { type: 'stdio', available: true };
        continue;
      }

      const httpPort = config.http;
      const wsPort = config.ws;

      try {
        const httpResponse = await fetch(`http://localhost:${httpPort}/status`, {
          signal: AbortSignal.timeout(this.config.discovery?.health_check_timeout || 2000)
        });

        discovered[name] = {
          http: httpPort,
          ws: wsPort,
          available: httpResponse.ok,
          status: httpResponse.status
        };
      } catch (e) {
        discovered[name] = {
          http: httpPort,
          ws: wsPort,
          available: false,
          error: e.message
        };
      }
    }

    return discovered;
  }

  async findAvailablePorts() {
    const fallbackPorts = this.config.discovery?.fallback_ports || [];
    const available = [];

    for (const port of fallbackPorts) {
      if (await this.checkPort(port)) {
        available.push(port);
      }
    }

    return available;
  }

  generateCueConfig(discovered, availablePorts) {
    const cueConfig = `// Auto-generated port configuration
package config

services: {
${Object.entries(discovered).map(([name, config]) => {
  if (config.type === 'stdio') {
    return `\t${name}: { type: "stdio", available: true }`;
  }
  return `\t${name}: {
\t\thttp: ${config.http},
\t\tws: ${config.ws || config.http},
\t\tavailable: ${config.available},
\t\tstatus: "${config.status || 'unknown'}"
\t}`;
}).join('\n')}
}

discovery: {
\tavailable_ports: [${availablePorts.join(', ')}]
\tlast_scan: "${new Date().toISOString()}"
}
`;
    return cueConfig;
  }

  async generateEnvConfig(discovered) {
    const envLines = [];

    for (const [name, config] of Object.entries(discovered)) {
      if (config.type === 'stdio') continue;

      const upperName = name.toUpperCase().replace(/[^A-Z0-9]/g, '_');
      envLines.push(`${upperName}_HTTP_PORT=${config.http}`);
      if (config.ws) {
        envLines.push(`${upperName}_WS_PORT=${config.ws}`);
      }
      envLines.push(`${upperName}_AVAILABLE=${config.available}`);
    }

    return envLines.join('\n');
  }

  async scan() {
    await this.loadConfig();
    console.log('🔍 Scanning services...');

    const discovered = await this.discoverServices();
    const availablePorts = await this.findAvailablePorts();

    console.log('📊 Service Status:');
    for (const [name, config] of Object.entries(discovered)) {
      const status = config.available ? '✅' : '❌';
      const info = config.type === 'stdio' ? 'stdio' : `${config.http}${config.ws ? `/${config.ws}` : ''}`;
      console.log(`  ${status} ${name}: ${info}`);
    }

    console.log(`\n🔌 Available fallback ports: ${availablePorts.join(', ')}`);

    // Generate CUE config
    const cueConfig = this.generateCueConfig(discovered, availablePorts);
    await writeFile(CUE_OUTPUT_FILE, cueConfig);
    console.log(`📝 Generated ${CUE_OUTPUT_FILE}`);

    // Generate .env format
    const envConfig = await this.generateEnvConfig(discovered);
    await writeFile('.env.ports', envConfig);
    console.log('📝 Generated .env.ports');

    return { discovered, availablePorts };
  }

  async attemptConnection(serviceName, fallbackPorts = []) {
    const service = this.config.services?.[serviceName];
    if (!service) {
      throw new Error(`Unknown service: ${serviceName}`);
    }

    // Try configured port first
    const primaryPort = service.http;
    try {
      const response = await fetch(`http://localhost:${primaryPort}/status`);
      if (response.ok) {
        return { port: primaryPort, url: `http://localhost:${primaryPort}` };
      }
    } catch {}

    // Try fallback ports
    for (const port of fallbackPorts) {
      try {
        const response = await fetch(`http://localhost:${port}/status`);
        if (response.ok) {
          console.log(`🔄 ${serviceName} found on fallback port ${port}`);
          return { port, url: `http://localhost:${port}` };
        }
      } catch {}
    }

    throw new Error(`${serviceName} not reachable on any port`);
  }
}

export default PortManager;

// CLI usage
if (import.meta.main) {
  const manager = new PortManager();
  const result = await manager.scan();

  if (process.argv.includes('--connect-phai')) {
    try {
      const connection = await manager.attemptConnection('phai_claude', [3005, 3006]);
      console.log(`🤝 Ready to connect to Phai at ${connection.url}`);
    } catch (e) {
      console.log(`⚠️  Phai not available: ${e.message}`);
    }
  }

  process.exit(0);
}
