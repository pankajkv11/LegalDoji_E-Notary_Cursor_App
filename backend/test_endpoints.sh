#!/bin/bash
# Test script for GraphQL and FastAPI endpoints

BASE_URL="http://localhost:8000"
GRAPHQL_URL="${BASE_URL}/api/v1/graphql"

echo "=========================================="
echo "  E-Notary API Testing Suite"
echo "=========================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_test() {
    echo -e "\n${YELLOW}=== $1 ===${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Test 1: FastAPI Health Endpoint
print_test "Testing FastAPI Health Endpoint"
response=$(curl -s -w "\n%{http_code}" http://localhost:8000/health)
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
if [ "$http_code" = "200" ]; then
    print_success "Health endpoint returned 200"
    echo "$body" | python3 -m json.tool
else
    print_error "Health endpoint returned $http_code"
fi

# Test 2: FastAPI Documentation
print_test "Testing FastAPI Documentation Endpoints"
for endpoint in "/docs" "/redoc" "/openapi.json"; do
    code=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}${endpoint}")
    if [ "$code" = "200" ]; then
        print_success "${endpoint} is accessible"
    else
        print_error "${endpoint} returned $code"
    fi
done

# Test 3: GraphQL Introspection
print_test "Testing GraphQL Introspection"
introspection_query='{
  "__schema": {
    "queryType": {
      "name": true,
      "fields": {
        "name": true
      }
    },
    "mutationType": {
      "name": true,
      "fields": {
        "name": true
      }
    }
  }
}'
response=$(curl -s -X POST "$GRAPHQL_URL" \
    -H "Content-Type: application/json" \
    -d "{\"query\": \"{ __schema { queryType { name fields { name } } mutationType { name fields { name } } } }\"}")
if echo "$response" | grep -q '"data"'; then
    print_success "GraphQL introspection successful"
    echo "$response" | python3 -m json.tool | head -60
else
    print_error "GraphQL introspection failed"
    echo "$response"
fi

# Test 4: GraphQL Services Query
print_test "Testing GraphQL Services Query"
response=$(curl -s -X POST "$GRAPHQL_URL" \
    -H "Content-Type: application/json" \
    -d '{"query": "{ services { id name description price } }"}')
if echo "$response" | grep -q '"data"'; then
    print_success "Services query successful"
    echo "$response" | python3 -m json.tool
else
    print_error "Services query failed"
    echo "$response"
fi

# Test 5: GraphQL FAQs Query
print_test "Testing GraphQL FAQs Query"
response=$(curl -s -X POST "$GRAPHQL_URL" \
    -H "Content-Type: application/json" \
    -d '{"query": "{ faqs { id question answer category } }"}')
if echo "$response" | grep -q '"data"'; then
    print_success "FAQs query successful"
    echo "$response" | python3 -m json.tool
else
    print_error "FAQs query failed"
    echo "$response"
fi

# Test 6: GraphQL Document Templates Query
print_test "Testing GraphQL Document Templates Query"
response=$(curl -s -X POST "$GRAPHQL_URL" \
    -H "Content-Type: application/json" \
    -d '{"query": "{ documentTemplates { id slug name category } }"}')
if echo "$response" | grep -q '"data"'; then
    print_success "Document templates query successful"
    echo "$response" | python3 -m json.tool | head -30
else
    print_error "Document templates query failed"
    echo "$response"
fi

# Test 7: GraphQL Pricing Plans Query
print_test "Testing GraphQL Pricing Plans Query"
response=$(curl -s -X POST "$GRAPHQL_URL" \
    -H "Content-Type: application/json" \
    -d '{"query": "{ pricingPlans { id name price features } }"}')
if echo "$response" | grep -q '"data"'; then
    print_success "Pricing plans query successful"
    echo "$response" | python3 -m json.tool | head -30
else
    print_error "Pricing plans query failed"
    echo "$response"
fi

# Test 8: GraphQL Notaries Query
print_test "Testing GraphQL Notaries Query"
response=$(curl -s -X POST "$GRAPHQL_URL" \
    -H "Content-Type: application/json" \
    -d '{"query": "{ notaries { id fullName email specialization location } }"}')
if echo "$response" | grep -q '"data"'; then
    print_success "Notaries query successful"
    echo "$response" | python3 -m json.tool | head -30
else
    print_error "Notaries query failed"
    echo "$response"
fi

# Test 9: GraphQL Signup Mutation
print_test "Testing GraphQL Signup Mutation"
# Generate unique email
TIMESTAMP=$(date +%s)
EMAIL="test${TIMESTAMP}@example.com"
response=$(curl -s -X POST "$GRAPHQL_URL" \
    -H "Content-Type: application/json" \
    -d "{\"query\": \"mutation { signup(input: {name: \\\"Test User\\\", email: \\\"${EMAIL}\\\", phone: \\\"+919876543210\\\", password: \\\"Test123\\\", acceptTerms: true}) { accessToken user { id name email } } }\"}")
if echo "$response" | grep -q '"accessToken"'; then
    print_success "Signup mutation successful"
    ACCESS_TOKEN=$(echo "$response" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('signup', {}).get('accessToken', ''))" 2>/dev/null)
    echo "$response" | python3 -m json.tool
    echo ""
    if [ -n "$ACCESS_TOKEN" ] && [ "$ACCESS_TOKEN" != "None" ]; then
        echo "Access Token: ${ACCESS_TOKEN:0:50}..."
        
        # Test 10: Authenticated Query with token
        print_test "Testing Authenticated Query (me)"
        response=$(curl -s -X POST "$GRAPHQL_URL" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $ACCESS_TOKEN" \
            -d '{"query": "{ me { id name email role status } }"}')
        if echo "$response" | grep -q '"me"'; then
            print_success "Authenticated query successful"
            echo "$response" | python3 -m json.tool
        else
            print_error "Authenticated query failed"
            echo "$response"
        fi
    fi
else
    print_error "Signup mutation failed"
    echo "$response" | python3 -m json.tool
fi

# Test 11: GraphQL Login Mutation
print_test "Testing GraphQL Login Mutation"
response=$(curl -s -X POST "$GRAPHQL_URL" \
    -H "Content-Type: application/json" \
    -d '{"query": "mutation { login(input: {method: \"EMAIL\", email: \"test@example.com\", password: \"Test123\"}) { accessToken user { id name email } } }"}')
if echo "$response" | grep -q '"accessToken"'; then
    print_success "Login mutation successful"
    echo "$response" | python3 -m json.tool
else
    print_error "Login mutation failed (user may not exist)"
    echo "$response" | python3 -m json.tool
fi

echo ""
echo "=========================================="
echo "  Testing Complete"
echo "=========================================="
echo ""
echo "📝 Available Endpoints:"
echo "  - FastAPI Health: ${BASE_URL}/health"
echo "  - FastAPI Docs: ${BASE_URL}/docs"
echo "  - GraphQL Endpoint: ${GRAPHQL_URL}"
echo ""
echo "💡 Tips:"
echo "  - Visit ${BASE_URL}/docs for interactive API documentation"
echo "  - Use GraphQL Playground or Postman to test GraphQL queries"
echo "  - All GraphQL queries use POST method to ${GRAPHQL_URL}"
echo ""
