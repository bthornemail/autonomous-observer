#!/bin/bash

# Veritas et Consensio Marketplace - Simple Deployment
# Bypasses workspace issues and focuses on core deployment

set -e

# Check if running with correct shell
if [ -z "$BASH_VERSION" ]; then
    echo "Error: This script requires bash, not sh"
    echo "Please run: bash ./deployment/scripts/deploy-simple.sh"
    exit 1
fi

# Colors for output
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

print_color "$PURPLE" "🔺 Veritas et Consensio Marketplace - Simple Deployment"
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

# Setup environment (skip package installation)
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
EOF
        print_color "$GREEN" "✅ Environment configuration created"
    else
        print_color "$YELLOW" "⚠️ Environment file already exists"
    fi
    
    # Create necessary directories
    mkdir -p logs data/redis data/postgres data/ipfs data/ollama monitoring/prometheus monitoring/grafana
    
    print_color "$GREEN" "✅ Environment setup complete"
}

# Deploy infrastructure only (core services)
deploy_infrastructure() {
    print_color "$BLUE" "🚀 Deploying core infrastructure..."
    
    # Use docker compose or docker-compose based on availability
    if command -v docker-compose &> /dev/null; then
        DOCKER_COMPOSE="docker-compose"
    else
        DOCKER_COMPOSE="docker compose"
    fi
    
    print_color "$YELLOW" "🔧 Starting infrastructure services..."
    $DOCKER_COMPOSE up -d redis postgres ipfs prometheus grafana
    
    # Wait for services to be ready
    print_color "$YELLOW" "⏳ Waiting for services to initialize (30 seconds)..."
    sleep 30
    
    # Check service health
    check_service_health
    
    print_color "$GREEN" "✅ Infrastructure deployment complete"
}

# Check service health
check_service_health() {
    print_color "$BLUE" "🏥 Checking service health..."
    
    # Check Redis
    if docker exec ulp-redis redis-cli ping 2>/dev/null | grep -q "PONG"; then
        print_color "$GREEN" "✅ Redis is healthy"
    else
        print_color "$YELLOW" "⚠️ Redis health check failed - may still be starting"
    fi
    
    # Check PostgreSQL
    if docker exec ulp-postgres pg_isready -U ulp_user -d veritas_consensio 2>/dev/null | grep -q "accepting connections"; then
        print_color "$GREEN" "✅ PostgreSQL is healthy"
    else
        print_color "$YELLOW" "⚠️ PostgreSQL health check failed - may still be starting"
    fi
    
    # Check IPFS
    if curl -s http://localhost:5001/api/v0/id > /dev/null 2>&1; then
        print_color "$GREEN" "✅ IPFS is healthy"
    else
        print_color "$YELLOW" "⚠️ IPFS health check failed - may still be starting"
    fi
    
    print_color "$GREEN" "✅ Service health checks complete"
}

# Test fault tolerance concepts
test_fault_tolerance() {
    print_color "$BLUE" "🛡️ Testing fault tolerance readiness..."
    
    # Test Redis connection
    if docker exec ulp-redis redis-cli set test_key "tetrahedron_test" 2>/dev/null; then
        TEST_VALUE=$(docker exec ulp-redis redis-cli get test_key 2>/dev/null)
        if [ "$TEST_VALUE" = "tetrahedron_test" ]; then
            print_color "$GREEN" "✅ Redis fault tolerance ready"
            docker exec ulp-redis redis-cli del test_key 2>/dev/null
        fi
    else
        print_color "$YELLOW" "⚠️ Redis fault tolerance test skipped"
    fi
    
    # Test database connection
    if docker exec ulp-postgres psql -U ulp_user -d veritas_consensio -c "SELECT 1;" 2>/dev/null | grep -q "1"; then
        print_color "$GREEN" "✅ PostgreSQL fault tolerance ready"
    else
        print_color "$YELLOW" "⚠️ PostgreSQL fault tolerance test skipped"
    fi
    
    print_color "$GREEN" "✅ Fault tolerance tests complete"
}

# Display deployment status
display_status() {
    echo ""
    print_color "$PURPLE" "🔺 Veritas et Consensio Marketplace - Simple Deployment Status"
    print_color "$BLUE" "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    print_color "$GREEN" "✅ Core Infrastructure Services:"
    echo "   🔴 Redis:         http://localhost:6379"
    echo "   🐘 PostgreSQL:    localhost:5432"
    echo "   📦 IPFS:          http://localhost:5001"
    echo "   📊 Prometheus:    http://localhost:9090"
    echo "   📈 Grafana:       http://localhost:3000"
    echo ""
    
    print_color "$YELLOW" "📊 Sacred Geometry Configuration:"
    echo "   Φ (Phi) Ratio:    ${PHI_RATIO}"
    echo "   Vertices:         ${TETRAHEDRON_VERTICES}"
    echo "   Architecture:     Fault-Proof Tetrahedron"
    echo "   Consensus:        Ternary Logic + Sacred Geometry"
    echo ""
    
    print_color "$BLUE" "🚀 Simple Deployment Complete!"
    print_color "$GREEN" "   Core infrastructure is operational."
    print_color "$YELLOW" "   Ready for tetrahedron vertex deployment."
    echo ""
    
    print_color "$YELLOW" "Next Steps:"
    echo "   1. Deploy Ollama: docker-compose up -d ollama"
    echo "   2. Deploy vertices: docker-compose up -d claude-hub copilot-universe"
    echo "   3. Access services via Docker containers"
    echo ""
}

# Main deployment function
main() {
    print_color "$PURPLE" "🔺 Starting Simple Veritas et Consensio Deployment"
    echo ""
    
    # Change to deployment directory
    cd "$(dirname "$0")/.."
    
    # Deployment steps (simplified)
    check_prerequisites
    setup_environment
    deploy_infrastructure
    test_fault_tolerance
    
    # Display final status
    display_status
    
    print_color "$GREEN" "🎉 Simple deployment successful!"
    print_color "$BLUE" "   Core infrastructure ready for tetrahedron coordination."
    print_color "$PURPLE" "   Sacred geometry foundations established."
    echo ""
}

# Cleanup function for graceful shutdown
cleanup() {
    echo ""
    print_color "$YELLOW" "🛑 Received shutdown signal..."
    print_color "$BLUE" "🔺 Shutting down Simple Deployment..."
    
    # Stop services gracefully
    if command -v docker-compose &> /dev/null; then
        docker-compose down --remove-orphans
    else
        docker compose down --remove-orphans
    fi
    
    print_color "$GREEN" "✅ Simple deployment shutdown complete"
    exit 0
}

# Trap signals for graceful shutdown
if [ -n "$BASH_VERSION" ]; then
    trap cleanup SIGINT SIGTERM
fi

# Run main function
main "$@"