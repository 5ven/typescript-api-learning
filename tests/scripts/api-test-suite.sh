#!/usr/bin/env bash

# API Test Suite - Enterprise Edition 🚀
# Usage: ./api-test-suite.sh [--verbose] [--endpoint users|posts|all] [--format json|table]
# Compatible with Bash 5+ (uses associative arrays)

# Colors - Initialize FIRST
declare -A COLORS=(
    [RED]='\033[0;31m'
    [GREEN]='\033[0;32m'
    [BLUE]='\033[0;34m'
    [YELLOW]='\033[1;33m'
    [PURPLE]='\033[0;35m'
    [CYAN]='\033[0;36m'
    [NC]='\033[0m'
)

# Configuration
BASE_URL="${API_BASE_URL:-http://localhost:3000}"
VERBOSE=false
ENDPOINT="all"
FORMAT="json"
RESULTS_FILE="test_results_$(date +%Y%m%d_%H%M%S).log"

# Test statistics
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
declare -a TEST_RESULTS=()


# Random data generators - Add after COLORS array
generate_random_string() {
    local length="${1:-8}"
    LC_ALL=C tr -dc 'a-zA-Z0-9' < /dev/urandom | head -c "$length"
}

generate_timestamp() {
    date +%s
}

generate_test_user_data() {
    local timestamp=$(generate_timestamp)
    local random_suffix=$(generate_random_string 6)
    
    cat << EOF
{
    "name": "Test User ${timestamp}",
    "email": "testuser_${random_suffix}_${timestamp}@example.com",
    "age": $((20 + RANDOM % 50))
}
EOF
}

generate_test_post_data() {
    local timestamp=$(generate_timestamp)
    local random_suffix=$(generate_random_string 8)
    local author_id="${1:-1}"
    
    cat << EOF
{
    "title": "Test Post ${random_suffix} - ${timestamp}",
    "content": "This is dynamically generated test content created at $(date). Random ID: ${random_suffix}",
    "authorId": "${author_id}",
    "isVisible": true
}
EOF
}

generate_update_user_data() {
    local timestamp=$(generate_timestamp)
    local random_suffix=$(generate_random_string 4)
    
    cat << EOF
{
    "name": "Updated User ${random_suffix}",
    "age": $((25 + RANDOM % 40))
}
EOF
}

generate_update_post_data() {
    local timestamp=$(generate_timestamp)
    local random_suffix=$(generate_random_string 6)
    
    cat << EOF
{
    "title": "Updated Post ${random_suffix} - ${timestamp}",
    "content": "This content was updated at $(date) with random suffix: ${random_suffix}"
}
EOF
}



# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --verbose|-v) VERBOSE=true; shift ;;
        --endpoint|-e) ENDPOINT="$2"; shift 2 ;;
        --format|-f) FORMAT="$2"; shift 2 ;;
        --help|-h) 
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --verbose, -v           Show detailed output"
            echo "  --endpoint, -e ENDPOINT Test specific endpoint (users|posts|all)"
            echo "  --format, -f FORMAT     Output format (json|table)"
            echo "  --help, -h              Show this help"
            exit 0 ;;
        *) echo "Unknown option $1. Use --help for usage."; exit 1 ;;
    esac
done

# Logging function
log() {
    local message="$1"
    echo -e "$message" | tee -a "$RESULTS_FILE"
}

# Verbose logging
verbose_log() {
    if [[ "$VERBOSE" == true ]]; then
        log "$1"
    fi
}

# Check dependencies
check_dependencies() {
    local missing_deps=()
    
    if ! command -v curl &> /dev/null; then
        missing_deps+=("curl")
    fi
    
    if ! command -v jq &> /dev/null && [[ "$FORMAT" == "json" ]]; then
        missing_deps+=("jq (for JSON formatting)")
    fi
    
    if [[ ${#missing_deps[@]} -gt 0 ]]; then
        log "${COLORS[RED]}❌ Missing dependencies: ${missing_deps[*]}${COLORS[NC]}"
        log "${COLORS[YELLOW]}💡 Install with: brew install curl jq (macOS) or apt-get install curl jq (Ubuntu)${COLORS[NC]}"
        exit 1
    fi
}

# Test endpoint function - FIXED FOR REAL 404s
test_endpoint() {
    local method="$1"
    local endpoint="$2"
    local description="$3"
    local data="${4:-}"
    local expected_status="${5:-200}"
    
    ((TOTAL_TESTS++))
    
    local url="${BASE_URL}${endpoint}"
    
    verbose_log "${COLORS[CYAN]}🔍 Testing: $description${COLORS[NC]}"
    verbose_log "${COLORS[BLUE]}   $method $endpoint${COLORS[NC]}"
    
    # FIXED: Remove --fail-with-body and handle all HTTP codes as success
    local curl_args=(
        -s                           # Silent
        -w "HTTPSTATUS:%{http_code}" # Write HTTP status
        --max-time 10               # Max 10 seconds total
        --connect-timeout 5         # Max 5 seconds to connect
        --retry 0                   # Don't retry
        # REMOVED: --fail-with-body (this was the problem!)
    )
    
    # Add method and data if provided
    if [[ -n "$data" ]]; then
        curl_args+=(-X "$method" -H "Content-Type: application/json" -d "$data")
    else
        curl_args+=(-X "$method")
    fi
    
    # Execute - now 404s won't be treated as failures!
    local response
    echo -n "   🔄 "  # Show progress
    
    # FIXED: Don't use timeout wrapper - curl's own timeouts are sufficient
    if ! response=$(curl "${curl_args[@]}" "$url" 2>/dev/null); then
        echo "❌"  
        log "${COLORS[RED]}❌ $description - Connection failed${COLORS[NC]}"
        TEST_RESULTS+=("FAIL|$method|$endpoint|$description|Connection|Failed to connect")
        ((FAILED_TESTS++))
        return 1
    fi
    
    echo "✓"  
    
    # Parse response (this part was fine)
    local http_code
    local body
    
    if [[ "$response" =~ HTTPSTATUS:([0-9]+)$ ]]; then
        http_code="${BASH_REMATCH[1]}"
        body="${response%HTTPSTATUS:*}"
    else
        log "${COLORS[RED]}❌ $description - Invalid response format${COLORS[NC]}"
        TEST_RESULTS+=("FAIL|$method|$endpoint|$description|Invalid|Bad response format")
        ((FAILED_TESTS++))
        return 1
    fi
    
    # Check status code (this part was also fine)
    if [[ "$http_code" == "$expected_status" ]]; then
        log "${COLORS[GREEN]}✅ $description ($http_code)${COLORS[NC]}"
        TEST_RESULTS+=("PASS|$method|$endpoint|$description|$http_code|Success")
        ((PASSED_TESTS++))
        
        # Show response body if verbose
        if [[ "$VERBOSE" == true && "$FORMAT" == "json" && -n "$body" ]]; then
            if command -v jq &> /dev/null && echo "$body" | jq . &>/dev/null 2>&1; then
                echo "$body" | jq . | sed 's/^/   /' 2>/dev/null || echo "   $body"
            else
                echo "   $body"
            fi
        fi
        
        return 0
    else
        log "${COLORS[RED]}❌ $description - Expected: $expected_status, Got: $http_code${COLORS[NC]}"
        TEST_RESULTS+=("FAIL|$method|$endpoint|$description|$http_code|Status mismatch")
        ((FAILED_TESTS++))
        
        if [[ "$VERBOSE" == true && -n "$body" ]]; then
            log "${COLORS[YELLOW]}   Response: $body${COLORS[NC]}"
        fi
        
        return 1
    fi
}



# Server health check
check_server_health() {
    log "${COLORS[YELLOW]}🏥 Checking server health...${COLORS[NC]}"
    
    if curl -s "$BASE_URL/health" > /dev/null 2>&1; then
        log "${COLORS[GREEN]}✅ Server is running at $BASE_URL${COLORS[NC]}"
        return 0
    else
        log "${COLORS[RED]}❌ Server is not responding at $BASE_URL${COLORS[NC]}"
        log "${COLORS[YELLOW]}💡 Make sure your server is running: npm start${COLORS[NC]}"
        exit 1
    fi
}

# Test Users API
# Test Users API - DYNAMIC VERSION
test_users_api() {
    log "\n${COLORS[BLUE]}👥 Testing Users API...${COLORS[NC]}"
    log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    test_endpoint "GET" "/api/users" "Get all users" "" "200"
    test_endpoint "GET" "/api/users?page=1&limit=5" "Get users with pagination" "" "200"
    test_endpoint "GET" "/api/users/1" "Get user by ID" "" "200"
    test_endpoint "GET" "/api/users/999" "Get non-existent user" "" "404"
    
    # Create a user with dynamic data
    log "${COLORS[CYAN]}📝 Creating test user with random data...${COLORS[NC]}"
    local user_data
    user_data=$(generate_test_user_data)
    test_endpoint "POST" "/api/users" "Create new user" "$user_data" "201"
    
    # Test updates with dynamic data (assuming user ID 1 exists from seed data)
    local update_data
    update_data=$(generate_update_user_data)
    test_endpoint "PUT" "/api/users/1" "Update existing user" "$update_data" "200"
    test_endpoint "PUT" "/api/users/999" "Update non-existent user" \
        '{"name":"Ghost User"}' "404"
}

# Test Posts API - DYNAMIC VERSION  
test_posts_api() {
    log "\n${COLORS[BLUE]}📝 Testing Posts API...${COLORS[NC]}"
    log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    test_endpoint "GET" "/api/posts" "Get all posts" "" "200"
    test_endpoint "GET" "/api/posts?page=1&limit=5" "Get posts with pagination" "" "200"
    test_endpoint "GET" "/api/posts/1" "Get post by ID" "" "200"
    test_endpoint "GET" "/api/posts/999" "Get non-existent post" "" "404"
    test_endpoint "GET" "/api/posts/author/1" "Get posts by author" "" "200"
    
    # Create a post with dynamic data
    log "${COLORS[CYAN]}📝 Creating test post with random data...${COLORS[NC]}"
    local post_data
    post_data=$(generate_test_post_data "1")
    test_endpoint "POST" "/api/posts" "Create new post" "$post_data" "201"
    
    # Test updates with dynamic data (assuming post ID 1 exists from seed data)
    local update_data
    update_data=$(generate_update_post_data)
    test_endpoint "PUT" "/api/posts/1" "Update existing post" "$update_data" "200"
    test_endpoint "PUT" "/api/posts/999" "Update non-existent post" \
        '{"title":"Ghost Post"}' "404"
}

# Generate test report
generate_report() {
    log "\n${COLORS[PURPLE]}📊 Test Results Summary${COLORS[NC]}"
    log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log "${COLORS[GREEN]}✅ Passed: $PASSED_TESTS${COLORS[NC]}"
    log "${COLORS[RED]}❌ Failed: $FAILED_TESTS${COLORS[NC]}"
    log "${COLORS[BLUE]}📈 Total:  $TOTAL_TESTS${COLORS[NC]}"
    
    local success_rate
    if [[ $TOTAL_TESTS -gt 0 ]]; then
        success_rate=$(( (PASSED_TESTS * 100) / TOTAL_TESTS ))
        log "${COLORS[CYAN]}🎯 Success Rate: ${success_rate}%${COLORS[NC]}"
    fi
    
    # Detailed table format
    if [[ "$FORMAT" == "table" && ${#TEST_RESULTS[@]} -gt 0 ]]; then
        log "\n${COLORS[PURPLE]}📋 Detailed Results:${COLORS[NC]}"
        printf "%-6s %-8s %-30s %-35s %-6s %-15s\n" "Status" "Method" "Endpoint" "Description" "Code" "Result"
        printf "%.s─" {1..100}; echo
        
        for result in "${TEST_RESULTS[@]}"; do
            IFS='|' read -r status method endpoint description code result_msg <<< "$result"
            if [[ "$status" == "PASS" ]]; then
                printf "${COLORS[GREEN]}%-6s${COLORS[NC]} %-8s %-30s %-35s %-6s %-15s\n" \
                    "✅" "$method" "$endpoint" "$description" "$code" "$result_msg"
            else
                printf "${COLORS[RED]}%-6s${COLORS[NC]} %-8s %-30s %-35s %-6s %-15s\n" \
                    "❌" "$method" "$endpoint" "$description" "$code" "$result_msg"
            fi
        done
    fi
    
    log "\n${COLORS[CYAN]}📄 Full results saved to: $RESULTS_FILE${COLORS[NC]}"
    
    # Exit with appropriate code
    if [[ $FAILED_TESTS -gt 0 ]]; then
        log "\n${COLORS[RED]}💥 Some tests failed! Check the results above.${COLORS[NC]}"
        exit 1
    else
        log "\n${COLORS[GREEN]}🎉 All tests passed! Your API is working perfectly!${COLORS[NC]}"
        exit 0
    fi
}

# Main execution
main() {
    # Print header
    log "${COLORS[PURPLE]}"
    log "╔══════════════════════════════════════════════════════════════════════════════╗"
    log "║                          🚀 API Test Suite                                   ║"  
    log "║                                                                              ║"
    log "║  Bash Version: $BASH_VERSION                                              ║"
    log "║  Testing: $ENDPOINT endpoints                                                      ║"
    log "║  Format:  $FORMAT                                                               ║"
    log "║  Verbose: $VERBOSE                                                              ║"
    log "╚══════════════════════════════════════════════════════════════════════════════╝"
    log "${COLORS[NC]}"
    
    # Check dependencies and server health
    check_dependencies
    check_server_health
    
    # Run tests based on endpoint selection
    case "$ENDPOINT" in
        "users")
            test_users_api
            ;;
        "posts")
            test_posts_api
            ;;
        "all")
            test_users_api
            test_posts_api
            ;;
        *)
            log "${COLORS[RED]}❌ Invalid endpoint: $ENDPOINT. Use: users, posts, or all${COLORS[NC]}"
            exit 1
            ;;
    esac
    
    # Generate final report
    generate_report
}

# Run main function
main "$@"
