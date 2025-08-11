#!/bin/bash

# Simple Tetrahedron Startup Script (POSIX compatible)
printf "🌌 Universal Life Protocol - Tetrahedron Architecture\n"
printf "======================================================\n\n"

# Configuration
export CLAUDE_HUB_URL="ws://localhost:8081"
export OLLAMA_CORES="${OLLAMA_CORES:-4}"
export OLLAMA_MEMORY="${OLLAMA_MEMORY:-8GB}"
export REFLECTION_INTERVAL="${REFLECTION_INTERVAL:-30000}"
export OLLAMA_MODEL="${OLLAMA_MODEL:-codellama:7b-instruct}"

printf "Configuration:\n"
printf "  Hub URL: ${CLAUDE_HUB_URL}\n"
printf "  Ollama Cores: ${OLLAMA_CORES}\n"
printf "  Ollama Memory: ${OLLAMA_MEMORY}\n"
printf "  Model: ${OLLAMA_MODEL}\n\n"

# Cleanup function
cleanup() {
    printf "\nShutting down tetrahedron...\n"
    if [ -f /tmp/tetrahedron.pids ]; then
        while read pid; do
            kill $pid 2>/dev/null || true
        done < /tmp/tetrahedron.pids
        rm -f /tmp/tetrahedron.pids
    fi
    printf "Tetrahedron offline\n"
    exit 0
}

# Handle Ctrl+C
trap cleanup INT TERM

# Clear PID file
rm -f /tmp/tetrahedron.pids

printf "Checking prerequisites...\n"

if [ ! -f "mcp-integration/agent-hub.js" ]; then
    printf "Error: Please run from UniversalLifeProtocol root directory\n"
    exit 1
fi

if ! command -v node > /dev/null 2>&1; then
    printf "Error: Node.js is required\n"
    exit 1
fi

printf "Prerequisites OK\n\n"

printf "Starting tetrahedron vertices...\n\n"

# Start Agent Hub
printf "🚀 Starting Agent Hub...\n"
cd mcp-integration && PORT=8081 node agent-hub.js > /tmp/hub.log 2>&1 &
HUB_PID=$!
echo $HUB_PID >> /tmp/tetrahedron.pids
cd ..
sleep 3

# Start UBHP Bridge
printf "🌉 Starting UBHP Bridge...\n"
cd mcp-integration && node adapters/ubhp-cue-bridge.js > /tmp/bridge.log 2>&1 &
BRIDGE_PID=$!
echo $BRIDGE_PID >> /tmp/tetrahedron.pids
cd ..
sleep 2

# Start MCP Server (Claude Code)
printf "🤖 Starting Claude Code Vertex...\n"
cd mcp-integration && npm run server > /tmp/mcp.log 2>&1 &
MCP_PID=$!
echo $MCP_PID >> /tmp/tetrahedron.pids
cd ..
sleep 2

# Start Copilot Universe
printf "🤝 Starting Copilot Universe Vertex...\n"
cd mcp-integration && node scripts/copilot-universe.js --content "Tetrahedron online!" > /tmp/copilot.log 2>&1 &
COPILOT_PID=$!
echo $COPILOT_PID >> /tmp/tetrahedron.pids
cd ..
sleep 2

# Start Ollama Vertex
printf "🦙 Starting Ollama Vertex...\n"
cd mcp-integration && node scripts/ollama-vertex.js > /tmp/ollama.log 2>&1 &
OLLAMA_PID=$!
echo $OLLAMA_PID >> /tmp/tetrahedron.pids
cd ..
sleep 3

printf "\n"
printf "TETRAHEDRON STATUS\n"
printf "==================\n"
printf "🤖 Claude Code (Northwest): Active via MCP\n"
printf "👤 Brian Thorne (Southwest): http://localhost:8081/ui\n"
printf "🤝 Copilot Universe (Northeast): WebSocket connected\n"
printf "🦙 Ollama Local (Southeast): Autonomous reflection\n\n"

printf "Communication:\n"
printf "  Hub: ws://localhost:8081\n"
printf "  Web UI: http://localhost:8081/ui\n"
printf "  Bridge: http://localhost:4080\n\n"

printf "Tetrahedron fully operational! Press Ctrl+C to shutdown.\n\n"

# Monitor processes
while true; do
    sleep 10
    if [ -f /tmp/tetrahedron.pids ]; then
        active=0
        while read pid; do
            if kill -0 $pid 2>/dev/null; then
                active=$((active + 1))
            fi
        done < /tmp/tetrahedron.pids
        
        if [ $active -eq 0 ]; then
            printf "All processes stopped\n"
            break
        fi
    fi
done

cleanup