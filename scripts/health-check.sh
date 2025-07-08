#!/bin/bash

# Health check script for deployed website
# Usage: ./scripts/health-check.sh [url]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default URL
URL=${1:-"https://young-personal-website.vercel.app"}

echo -e "${BLUE}🏥 Health Check for Personal Website${NC}"
echo -e "${BLUE}URL: ${URL}${NC}"
echo -e "${BLUE}Timestamp: $(date)${NC}"
echo ""

# Check if curl is available
if ! command -v curl &> /dev/null; then
    echo -e "${RED}❌ curl is not installed${NC}"
    exit 1
fi

# Basic HTTP status check
check_http_status() {
    echo -e "${YELLOW}🌐 Checking HTTP status...${NC}"
    
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL")
    RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" "$URL")
    
    if [ "$HTTP_STATUS" = "200" ]; then
        echo -e "${GREEN}✅ HTTP Status: $HTTP_STATUS${NC}"
        echo -e "${GREEN}⏱️  Response Time: ${RESPONSE_TIME}s${NC}"
    else
        echo -e "${RED}❌ HTTP Status: $HTTP_STATUS${NC}"
        return 1
    fi
}

# Check essential pages
check_pages() {
    echo -e "${YELLOW}📄 Checking essential pages...${NC}"
    
    PAGES=("/" "/blog" "/tools")
    
    for page in "${PAGES[@]}"; do
        PAGE_URL="${URL}${page}"
        PAGE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$PAGE_URL")
        
        if [ "$PAGE_STATUS" = "200" ]; then
            echo -e "${GREEN}✅ ${page}: $PAGE_STATUS${NC}"
        else
            echo -e "${RED}❌ ${page}: $PAGE_STATUS${NC}"
            return 1
        fi
    done
}

# Check meta tags and SEO
check_seo() {
    echo -e "${YELLOW}🔍 Checking SEO elements...${NC}"
    
    # Get page content
    CONTENT=$(curl -s "$URL")
    
    # Check for title tag
    if echo "$CONTENT" | grep -q "<title>"; then
        TITLE=$(echo "$CONTENT" | grep -o '<title>[^<]*</title>' | sed 's/<[^>]*>//g')
        echo -e "${GREEN}✅ Title: $TITLE${NC}"
    else
        echo -e "${RED}❌ No title tag found${NC}"
        return 1
    fi
    
    # Check for meta description
    if echo "$CONTENT" | grep -q 'name="description"'; then
        echo -e "${GREEN}✅ Meta description found${NC}"
    else
        echo -e "${RED}❌ No meta description found${NC}"
        return 1
    fi
    
    # Check for Open Graph tags
    if echo "$CONTENT" | grep -q 'property="og:'; then
        echo -e "${GREEN}✅ Open Graph tags found${NC}"
    else
        echo -e "${YELLOW}⚠️  No Open Graph tags found${NC}"
    fi
}

# Check security headers
check_security_headers() {
    echo -e "${YELLOW}🔒 Checking security headers...${NC}"
    
    HEADERS=$(curl -s -I "$URL")
    
    # Check for security headers
    SECURITY_HEADERS=(
        "X-Content-Type-Options"
        "X-Frame-Options"
        "X-XSS-Protection"
        "Referrer-Policy"
    )
    
    for header in "${SECURITY_HEADERS[@]}"; do
        if echo "$HEADERS" | grep -qi "$header"; then
            echo -e "${GREEN}✅ $header header present${NC}"
        else
            echo -e "${YELLOW}⚠️  $header header missing${NC}"
        fi
    done
}

# Check API endpoints
check_api_endpoints() {
    echo -e "${YELLOW}🔌 Checking API endpoints...${NC}"
    
    API_ENDPOINTS=("/sitemap.xml" "/robots.txt" "/feed.xml")
    
    for endpoint in "${API_ENDPOINTS[@]}"; do
        ENDPOINT_URL="${URL}${endpoint}"
        ENDPOINT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$ENDPOINT_URL")
        
        if [ "$ENDPOINT_STATUS" = "200" ]; then
            echo -e "${GREEN}✅ ${endpoint}: $ENDPOINT_STATUS${NC}"
        else
            echo -e "${YELLOW}⚠️  ${endpoint}: $ENDPOINT_STATUS${NC}"
        fi
    done
}

# Check performance metrics
check_performance() {
    echo -e "${YELLOW}⚡ Checking performance metrics...${NC}"
    
    # Measure various timing metrics
    METRICS=$(curl -s -o /dev/null -w "DNS: %{time_namelookup}s\nConnect: %{time_connect}s\nTTFB: %{time_starttransfer}s\nTotal: %{time_total}s\nSize: %{size_download} bytes" "$URL")
    
    echo -e "${BLUE}📊 Performance Metrics:${NC}"
    echo "$METRICS" | while read -r line; do
        echo -e "${BLUE}   $line${NC}"
    done
}

# Main health check function
main() {
    local exit_code=0
    
    # Run all checks
    check_http_status || exit_code=1
    echo ""
    
    check_pages || exit_code=1
    echo ""
    
    check_seo || exit_code=1
    echo ""
    
    check_security_headers
    echo ""
    
    check_api_endpoints
    echo ""
    
    check_performance
    echo ""
    
    # Summary
    if [ $exit_code -eq 0 ]; then
        echo -e "${GREEN}🎉 All health checks passed!${NC}"
        echo -e "${GREEN}Website is healthy and operational.${NC}"
    else
        echo -e "${RED}❌ Some health checks failed!${NC}"
        echo -e "${RED}Please review the issues above.${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}Health check completed at $(date)${NC}"
    
    return $exit_code
}

# Run main function
main "$@"
