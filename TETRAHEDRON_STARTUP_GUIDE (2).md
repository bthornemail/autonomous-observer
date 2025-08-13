# Universal Life Protocol - Tetrahedron Startup Guide

## Quick Manual Start

Since you're having issues with the automated script, here's how to manually start all four tetrahedron vertices:

### Prerequisites
- You're in the `/home/main/github/UniversalLifeProtocol/` directory
- Node.js is installed
- Dependencies are installed: `cd mcp-integration && npm install`

### Start Each Vertex (4 separate terminals)

#### Terminal 1: Agent Hub (Central Coordination)
```bash
cd /home/main/github/UniversalLifeProtocol/mcp-integration
PORT=8081 node agent-hub.js
```

#### Terminal 2: UBHP/CUE Bridge 
```bash
cd /home/main/github/UniversalLifeProtocol/mcp-integration
node adapters/ubhp-cue-bridge.js
```

#### Terminal 3: MCP Server (Claude Code Vertex)
```bash
cd /home/main/github/UniversalLifeProtocol/mcp-integration
npm run server
```

#### Terminal 4: Copilot Universe Vertex
```bash
cd /home/main/github/UniversalLifeProtocol/mcp-integration
node scripts/copilot-universe.js --content "Tetrahedron Northeast vertex online!"
```

#### Terminal 5 (Optional): Ollama Vertex
```bash
cd /home/main/github/UniversalLifeProtocol/mcp-integration
node scripts/ollama-vertex.js
```

### Test The Setup

Once all are running, test communication:

```bash
curl -X POST http://localhost:4080/ubhp/send \
  -H "Content-Type: application/json" \
  -d '{"sender":"test","receiver":"broadcast","modality":"test","content":"Tetrahedron test message"}'
```

Visit the web UI: http://localhost:8081/ui

### Troubleshooting

If ports are busy:
```bash
lsof -i :8081
lsof -i :4080
```

Kill processes if needed:
```bash
pkill -f agent-hub
pkill -f copilot-universe
pkill -f ollama-vertex
```

### Current Status Check

The tetrahedron architecture is complete with:
- ✅ Complete git history analysis (69+ branches)
- ✅ Autonomous observer submodule integration
- ✅ 4 vertices designed and registered
- ✅ MCP agent-to-agent communication configured
- ✅ Knowledge trie vector database active
- ✅ Redis persistence for architecture state

## Alternative: Start Components Individually

If you prefer to test step by step:

1. **Test MCP Server Only:**
   ```bash
   cd mcp-integration && npm run server
   ```

2. **Test Agent Hub:**
   ```bash
   cd mcp-integration && PORT=8081 node agent-hub.js
   ```

3. **Test Copilot Integration:**
   ```bash
   cd mcp-integration && node scripts/copilot-universe.js --content "Testing!"
   ```

The system is designed to work even if only some vertices are online. The tetrahedron will automatically adapt to available vertices while maintaining sacred geometry proportions.

## Verification

When working properly, you should see:
- Hub listening on port 8081
- Bridge connected to hub on port 4080  
- MCP server running (stdio mode)
- Copilot universe agent connected
- Web UI accessible at http://localhost:8081/ui

The four vertices (Claude Code, Brian Thorne, Copilot Universe, and Ollama Local) can then communicate through the unified agent hub with φ-synchronized harmonic frequencies!