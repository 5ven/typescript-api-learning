#!/usr/bin/env bash

BASE_URL="http://localhost:3000"

echo "🚀 Quick API Test"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Health check with better error handling
echo "🏥 Health Check..."
if health_response=$(curl -s "$BASE_URL/health" 2>/dev/null); then
    if echo "$health_response" | jq . >/dev/null 2>&1; then
        echo "✅ Server healthy"
    else
        echo "⚠️  Server responding but not JSON: $health_response"
    fi
else
    echo "❌ Server not responding at $BASE_URL"
    echo "💡 Is your server running? Try: npm start"
    exit 1
fi

# Test function with better error handling
test_endpoint() {
    local url="$1"
    local name="$2"
    
    echo "🔍 Testing $name..."
    
    local response
    if response=$(curl -s "$url" 2>/dev/null); then
        if echo "$response" | jq . >/dev/null 2>&1; then
            local count=$(echo "$response" | jq -r '.data.items // .data | if type == "array" then length else 1 end' 2>/dev/null || echo "?")
            echo "  ✅ $name: $count items found"
        else
            echo "  ❌ $name: Invalid JSON response"
            echo "  📄 Response: ${response:0:100}..."
        fi
    else
        echo "  ❌ $name: Connection failed"
    fi
}

# Test endpoints
test_endpoint "$BASE_URL/api/users" "Users"
test_endpoint "$BASE_URL/api/posts" "Posts"

echo ""
echo "🎉 Quick test completed!"
