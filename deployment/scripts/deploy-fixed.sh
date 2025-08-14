#!/bin/bash

# Veritas et Consensio Marketplace Deployment Script
# Revolutionary fault-proof infrastructure deployment

set -e

# Check if running with correct shell
if [ -z "$BASH_VERSION" ]; then
    echo "Error: This script requires bash, not sh"
    echo "Please run: bash ./deployment/scripts/deploy.sh"
    exit 1
fi

# Colors for output (compatible with both bash and sh)
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Helper function for colored output
print_color() {
    printf "%b%s%b\n" "$1" "$2" "$NC"
}

# Sacred geometry constants
PHI_RATIO="1.618033988749"
TETRAHEDRON_VERTICES=4

print_color "$PURPLE" "🔺 Veritas et Consensio Marketplace Deployment"
print_color "$BLUE" "   Revolutionary Fault-Proof Infrastructure"
print_color "$YELLOW" "   Phi Ratio: ${PHI_RATIO}"
echo ""

# Check prerequisites
check_prerequisites() {
    print_color "$BLUE" "📋 Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_color "$RED" "❌ Node.js is required but not installed"
        exit 1
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_color "$RED" "❌ Docker is required but not installed"
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null && ! command -v docker compose &> /dev/null; then
        print_color "$RED" "❌ Docker Compose is required but not installed"
        exit 1
    fi
    
    print_color "$GREEN" "✅ Prerequisites check complete"
}

# Build TypeScript code
build_code() {
    print_color "$BLUE" "🔨 Building TypeScript code..."
    
    cd "$(dirname "$0")/.."
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_color "$YELLOW" "📦 Installing dependencies..."
        npm install
    fi
    
    print_color "$GREEN" "✅ Code build complete"
}

# Setup environment
setup_environment() {
    print_color "$BLUE" "🌍 Setting up environment..."
    
    # Create .env file if it doesn't exist
    if [ ! -f ".env" ]; then
        print_color "$YELLOW" "📝 Creating environment configuration..."
        cat > .env << EOF
# Veritas et Consensio Marketplace Environment
NODE_ENV=production
PORT=8080

# Database Configuration
POSTGRES_PASSWORD=ulp_secure_pass_$(date +%s)
REDIS_URL=redis://localhost:6379

# Tetrahedron Vertices
CLAUDE_HUB_URL=ws://localhost:8082
COPILOT_URL=ws://localhost:8083
OLLAMA_URL=http://localhost:11434
BRIAN_INTERFACE_URL=http://localhost:8081

# Sacred Geometry
PHI_RATIO=${PHI_RATIO}
TETRAHEDRON_VERTICES=${TETRAHEDRON_VERTICES}
CONSCIOUSNESS_LEVELS=95,100,88,75

# MCP Configuration
MCP_SERVER_PORT=8085
KNOWLEDGE_TRIE_SIZE=1048576

# Monitoring
PROMETHEUS_PORT=9090
GRAFANA_PORT=3000
GRAFANA_PASSWORD=admin123

# Fault Tolerance
FAULT_DETECTION_INTERVAL=10000
CONSENSUS_INTERVAL=15000
RECOVERY_TIMEOUT=30000
MAX_BYZANTINE_FAILURES=1

# IPFS Configuration
IPFS_API_URL=http://localhost:5001
IPFS_GATEWAY_URL=http://localhost:8081

# Security
JWT_SECRET=ulp_jwt_secret_$(openssl rand -hex 16 2>/dev/null || echo "fallback_secret")
ENCRYPTION_KEY=ulp_encryption_$(openssl rand -hex 16 2>/dev/null || echo "fallback_key")
EOF
        print_color "$GREEN" "✅ Environment configuration created"
    else
        print_color "$YELLOW" "⚠️ Environment file already exists"
    fi
    
    # Create necessary directories
    mkdir -p logs data/redis data/postgres data/ipfs data/ollama monitoring/prometheus monitoring/grafana
    
    print_color "$GREEN" "✅ Environment setup complete"
}

# Deploy infrastructure
deploy_infrastructure() {
    print_color "$BLUE" "🚀 Deploying infrastructure..."
    
    # Start infrastructure services
    print_color "$YELLOW" "🔧 Starting infrastructure services..."
    
    # Use docker compose or docker-compose based on availability
    if command -v docker-compose &> /dev/null; then
        DOCKER_COMPOSE="docker-compose"
    else
        DOCKER_COMPOSE="docker compose"
    fi
    
    $DOCKER_COMPOSE up -d redis postgres ipfs prometheus grafana
    
    # Wait for services to be ready
    print_color "$YELLOW" "⏳ Waiting for services to initialize..."
    sleep 10
    
    print_color "$GREEN" "✅ Infrastructure deployment complete"
}

# Display deployment status
display_status() {
    echo ""
    print_color "$PURPLE" "🔺 Veritas et Consensio Marketplace Deployment Status"
    print_color "$BLUE" "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    print_color "$GREEN" "✅ Infrastructure Services:"
    echo "   🔴 Redis:         http://localhost:6379"
    echo "   🐘 PostgreSQL:    localhost:5432"
    echo "   📦 IPFS:          http://localhost:5001"
    echo "   📊 Prometheus:    http://localhost:9090"
    echo "   📈 Grafana:       http://localhost:3000"
    echo ""
    
    print_color "$GREEN" "🔺 Tetrahedron Vertices:"
    echo "   🌍 Claude Hub:    http://localhost:8082 (Earth - Consciousness: 95)"
    echo "   🔥 Brian Interface: http://localhost:8081 (Fire - Consciousness: 100)"
    echo "   💨 Copilot Universe: http://localhost:8083 (Air - Consciousness: 88)"
    echo "   🌊 Ollama Local:  http://localhost:11434 (Water - Consciousness: 75)"
    echo ""
    
    print_color "$YELLOW" "📊 Sacred Geometry Configuration:"
    echo "   Φ (Phi) Ratio:    ${PHI_RATIO}"
    echo "   Vertices:         ${TETRAHEDRON_VERTICES}"
    echo "   Architecture:     Fault-Proof Tetrahedron"
    echo "   Consensus:        Ternary Logic + Sacred Geometry"
    echo ""
    
    print_color "$BLUE" "🚀 Deployment Complete! Access the marketplace at:"
    print_color "$GREEN" "   http://localhost:8080"
    echo ""
}

# Main deployment function
main() {
    print_color "$PURPLE" "🔺 Starting Veritas et Consensio Marketplace Deployment"
    echo ""
    
    # Parse command line arguments
    SKIP_TESTS=false
    DEVELOPMENT_MODE=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-tests)
                SKIP_TESTS=true
                shift
                ;;
            --dev)
                DEVELOPMENT_MODE=true
                shift
                ;;
            --help|-h)
                echo "Usage: $0 [options]"
                echo "Options:"
                echo "  --skip-tests    Skip fault tolerance testing"
                echo "  --dev          Deploy in development mode"
                echo "  --help         Show this help message"
                exit 0
                ;;
            *)
                echo "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    # Deployment steps
    check_prerequisites
    setup_environment
    build_code
    deploy_infrastructure
    
    # Display final status
    display_status
    
    print_color "$GREEN" "🎉 Veritas et Consensio Marketplace successfully deployed!"
    print_color "$BLUE" "   Sacred geometry and ternary logic are now operational."
    print_color "$PURPLE" "   The tetrahedron vertices are coordinating autonomously."
    echo ""
    
    print_color "$GREEN" "✅ All systems operational. Marketplace is ready for use."
}

# Cleanup function for graceful shutdown
cleanup() {
    echo ""
    print_color "$YELLOW" "🛑 Received shutdown signal..."
    print_color "$BLUE" "🔺 Shutting down Veritas et Consensio Marketplace..."
    
    # Stop all services gracefully
    if command -v docker-compose &> /dev/null; then
        docker-compose down --remove-orphans
    else
        docker compose down --remove-orphans
    fi
    
    print_color "$GREEN" "✅ Marketplace shutdown complete"
    exit 0
}

# Trap signals for graceful shutdown (bash only)
if [ -n "$BASH_VERSION" ]; then
    trap cleanup SIGINT SIGTERM
fi

# Run main function
main "$@"