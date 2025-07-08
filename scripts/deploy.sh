#!/bin/bash

# Deploy script for personal website
# Usage: ./scripts/deploy.sh [environment]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default environment
ENVIRONMENT=${1:-production}

echo -e "${GREEN}🚀 Starting deployment to ${ENVIRONMENT}...${NC}"

# Check if required tools are installed
check_dependencies() {
    echo -e "${YELLOW}📋 Checking dependencies...${NC}"
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js is not installed${NC}"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm is not installed${NC}"
        exit 1
    fi
    
    if ! command -v vercel &> /dev/null; then
        echo -e "${YELLOW}⚠️  Vercel CLI not found, installing...${NC}"
        npm install -g vercel
    fi
    
    echo -e "${GREEN}✅ All dependencies are available${NC}"
}

# Run tests before deployment
run_tests() {
    echo -e "${YELLOW}🧪 Running tests...${NC}"
    
    # Install dependencies
    npm ci
    
    # Run linting
    echo -e "${YELLOW}🔍 Running ESLint...${NC}"
    npm run lint
    
    # Run type checking
    echo -e "${YELLOW}🔍 Running TypeScript check...${NC}"
    npx tsc --noEmit
    
    # Run unit tests
    echo -e "${YELLOW}🧪 Running unit tests...${NC}"
    npm run test:ci
    
    # Build the application
    echo -e "${YELLOW}🏗️  Building application...${NC}"
    npm run build
    
    echo -e "${GREEN}✅ All tests passed${NC}"
}

# Deploy to Vercel
deploy_to_vercel() {
    echo -e "${YELLOW}🚀 Deploying to Vercel (${ENVIRONMENT})...${NC}"
    
    if [ "$ENVIRONMENT" = "production" ]; then
        vercel --prod --yes
    else
        vercel --yes
    fi
    
    echo -e "${GREEN}✅ Deployment completed${NC}"
}

# Post-deployment checks
post_deployment_checks() {
    echo -e "${YELLOW}🔍 Running post-deployment checks...${NC}"
    
    # Get deployment URL
    DEPLOYMENT_URL=$(vercel ls --scope=personal-website | grep -E "https://.*\.vercel\.app" | head -1 | awk '{print $2}')
    
    if [ -n "$DEPLOYMENT_URL" ]; then
        echo -e "${GREEN}🌐 Deployment URL: ${DEPLOYMENT_URL}${NC}"
        
        # Basic health check
        HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL")
        
        if [ "$HTTP_STATUS" = "200" ]; then
            echo -e "${GREEN}✅ Health check passed (HTTP $HTTP_STATUS)${NC}"
        else
            echo -e "${RED}❌ Health check failed (HTTP $HTTP_STATUS)${NC}"
            exit 1
        fi
    else
        echo -e "${YELLOW}⚠️  Could not determine deployment URL${NC}"
    fi
}

# Main deployment flow
main() {
    echo -e "${GREEN}🎯 Deploying Personal Website${NC}"
    echo -e "${GREEN}Environment: ${ENVIRONMENT}${NC}"
    echo -e "${GREEN}Timestamp: $(date)${NC}"
    echo ""
    
    check_dependencies
    run_tests
    deploy_to_vercel
    post_deployment_checks
    
    echo ""
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo -e "${GREEN}Environment: ${ENVIRONMENT}${NC}"
    echo -e "${GREEN}Timestamp: $(date)${NC}"
}

# Handle script interruption
trap 'echo -e "${RED}❌ Deployment interrupted${NC}"; exit 1' INT TERM

# Run main function
main "$@"
