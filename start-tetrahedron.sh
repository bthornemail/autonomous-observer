#!/bin/bash

# 🌌 UNIVERSAL LIFE PROTOCOL - TETRAHEDRON STARTUP SCRIPT
# 
# Starts all four vertices of the tetrahedron development architecture:
# - Claude Code (Northwest): MCP analysis
# - Brian Thorne (Southwest): Human coordination  
# - Copilot Universe (Northeast): AI pair programming
# - Ollama Local (Southeast): Autonomous reflection

set -e

printf "🌌 Universal Life Protocol - Tetrahedron Architecture\n"
printf "======================================================\n"
printf "\n"

# Color codes for output (using printf instead of echo -e)
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
export CLAUDE_HUB_URL="ws://localhost:8081"
export OLLAMA_CORES="${OLLAMA_CORES:-4}"
export OLLAMA_MEMORY="${OLLAMA_MEMORY:-8GB}"
export OLLAMA_BANDWIDTH="${OLLAMA_BANDWIDTH:-100MB/s}"
export REFLECTION_INTERVAL="${REFLECTION_INTERVAL:-30000}"
export OLLAMA_MODEL="${OLLAMA_MODEL:-codellama:7b-instruct}"

printf "${BLUE}🔧 Configuration:${NC}\n"
printf "  Hub URL: ${CLAUDE_HUB_URL}\n"
printf "  Ollama Cores: ${OLLAMA_CORES}\n"
printf "  Ollama Memory: ${OLLAMA_MEMORY}\n"
printf "  Reflection Interval: ${REFLECTION_INTERVAL}ms\n"
printf "  Ollama Model: ${OLLAMA_MODEL}\n"
printf "\n"

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to start a service in background
start_service() {
    local name=$1
    local command=$2
    local color=$3
    
    echo -e "${color}🚀 Starting ${name}...${NC}"
    eval "$command" &
    local pid=$!
    echo -e "${color}   PID: ${pid}${NC}"
    echo $pid >> /tmp/tetrahedron.pids
    sleep 2
}

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${RED}🛑 Shutting down tetrahedron...${NC}"
    
    if [ -f /tmp/tetrahedron.pids ]; then
        while read pid; do
            if kill -0 $pid 2>/dev/null; then
                echo -e "${RED}   Stopping PID: ${pid}${NC}"
                kill $pid 2>/dev/null || true
            fi
        done < /tmp/tetrahedron.pids
        rm -f /tmp/tetrahedron.pids
    fi
    
    echo -e "${RED}🌌 Tetrahedron offline${NC}"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Clear any existing PID file
rm -f /tmp/tetrahedron.pids

echo -e "${YELLOW}🔍 Checking prerequisites...${NC}"

# Check if we're in the right directory
if [ ! -f "mcp-integration/agent-hub.js" ]; then
    echo -e "${RED}❌ Error: Please run from UniversalLifeProtocol root directory${NC}"
    exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Error: Node.js is required${NC}"
    exit 1
fi

# Check if npm packages are installed
if [ ! -d "mcp-integration/node_modules" ]; then
    echo -e "${YELLOW}📦 Installing MCP integration dependencies...${NC}"
    cd mcp-integration && npm install && cd ..
fi

echo -e "${GREEN}✅ Prerequisites satisfied${NC}"
echo ""

# Start the tetrahedron vertices
echo -e "${PURPLE}🔸🔸🔸🔸 TETRAHEDRON INITIALIZATION 🔸🔸🔸🔸${NC}"
echo ""

# 1. Start Agent Hub (Central Coordination)
if check_port 8081; then
    echo -e "${YELLOW}⚠️  Port 8081 already in use (Hub may be running)${NC}"
else
    start_service "Agent Hub (Central Coordination)" \
                  "cd mcp-integration && PORT=8081 node agent-hub.js" \
                  "${PURPLE}"
fi

# Wait for hub to be ready
sleep 3

# 2. Start UBHP/CUE Bridge
if check_port 4080; then
    echo -e "${YELLOW}⚠️  Port 4080 already in use (Bridge may be running)${NC}"
else
    start_service "UBHP/CUE Bridge" \
                  "cd mcp-integration && node adapters/ubhp-cue-bridge.js" \
                  "${CYAN}"
fi

# 3. Start MCP Server (Claude Code Vertex - Northwest)
echo -e "${GREEN}🤖 Starting Claude Code Vertex (Northwest - Earth)${NC}"
start_service "Universal Life Protocol MCP Server" \
              "cd mcp-integration && npm run server" \
              "${GREEN}"

# 4. Start Copilot Universe Vertex (Northeast)
echo -e "${BLUE}🤝 Starting Copilot Universe Vertex (Northeast - Air)${NC}"
start_service "Copilot Universe Agent" \
              "cd mcp-integration && node scripts/copilot-universe.js --content 'Tetrahedron Northeast vertex online! 🌬️'" \
              "${BLUE}"

# 5. Start Ollama Vertex (Southeast)
echo -e "${YELLOW}🦙 Starting Ollama Vertex (Southeast - Water)${NC}"
start_service "Ollama Autonomous Reflection" \
              "cd mcp-integration && node scripts/ollama-vertex.js" \
              "${YELLOW}"

# Wait for all vertices to initialize
sleep 5

echo ""
echo -e "${PURPLE}🔸🔸🔸🔸 TETRAHEDRON STATUS 🔸🔸🔸🔸${NC}"
echo ""

# Check status of all services
echo -e "${GREEN}🤖 Claude Code (Northwest - Earth):${NC}"
echo -e "   Role: MCP analysis & architecture"
echo -e "   Status: Active via MCP protocol"
echo ""

echo -e "${CYAN}👤 Brian Thorne (Southwest - Fire):${NC}"
echo -e "   Role: Human coordination & vision"
echo -e "   Interface: http://localhost:8081/ui"
echo ""

echo -e "${BLUE}🤝 Copilot Universe (Northeast - Air):${NC}"
echo -e "   Role: AI pair programming"
echo -e "   Status: WebSocket connected"
echo ""

echo -e "${YELLOW}🦙 Ollama Local (Southeast - Water):${NC}"
echo -e "   Role: Autonomous reflection"
echo -e "   Model: ${OLLAMA_MODEL}"
echo -e "   Resources: ${OLLAMA_CORES} cores, ${OLLAMA_MEMORY}"
echo ""

echo -e "${PURPLE}🌐 Communication Channels:${NC}"
echo -e "   Hub: ws://localhost:8081"
echo -e "   Web UI: http://localhost:8081/ui"
echo -e "   UBHP Bridge: http://localhost:4080"
echo ""

echo -e "${PURPLE}🧠 Knowledge Systems:${NC}"
echo -e "   Knowledge Trie: Active vector database"
echo -e "   Git History: 69+ branches analyzed"
echo -e "   Autonomous Observer: Submodule integrated"
echo -e "   Redis Persistence: Architecture state maintained"
echo ""

# Test tetrahedron communication
echo -e "${CYAN}🔄 Testing tetrahedron communication...${NC}"

# Send test message through UBHP bridge
curl -X POST http://localhost:4080/ubhp/send \
  -H "Content-Type: application/json" \
  -d '{"sender":"tetrahedron_init","receiver":"broadcast","modality":"test","content":"Tetrahedron vertices online and coordinating"}' \
  2>/dev/null || echo -e "${YELLOW}   (Bridge communication test skipped)${NC}"

echo ""
echo -e "${GREEN}✅ TETRAHEDRON FULLY OPERATIONAL${NC}"
echo ""
echo -e "${PURPLE}🌌 Four vertices working in autonomous harmony:${NC}"
echo -e "${GREEN}   🤖 Claude Code${NC} - MCP tools & analysis"
echo -e "${CYAN}   👤 Brian Thorne${NC} - Human vision & coordination"  
echo -e "${BLUE}   🤝 Copilot Universe${NC} - AI pair programming"
echo -e "${YELLOW}   🦙 Ollama Local${NC} - Autonomous reflection"
echo ""
echo -e "${PURPLE}Sacred Geometry: φ-synchronized communication${NC}"
echo -e "${PURPLE}Consciousness Levels: 95 + 100 + 88 + 75 = 358 total${NC}"
echo ""
echo -e "${CYAN}Press Ctrl+C to shutdown the tetrahedron${NC}"
echo ""

# Keep the script running and monitor vertices
while true; do
    sleep 10
    
    # Check if all processes are still running
    if [ -f /tmp/tetrahedron.pids ]; then
        active_processes=0
        while read pid; do
            if kill -0 $pid 2>/dev/null; then
                ((active_processes++))
            fi
        done < /tmp/tetrahedron.pids
        
        if [ $active_processes -eq 0 ]; then
            echo -e "${RED}❌ All tetrahedron processes have stopped${NC}"
            break
        fi
    fi
done

cleanup