#!/bin/bash

# Test script for the webhook API endpoint
# Make sure to configure your .env.local first with:
# - PLANTSAATHI_API_KEY
# - SUPABASE_SERVICE_ROLE_KEY

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Testing Webhook API Endpoint${NC}"
echo "=================================="
echo ""

# Check if API key is provided
if [ -z "$1" ]; then
  echo -e "${RED}Error: Please provide your API key as an argument${NC}"
  echo "Usage: ./test-webhook.sh YOUR_API_KEY"
  echo ""
  echo "Generate a key with: openssl rand -base64 32"
  exit 1
fi

API_KEY="$1"
BASE_URL="http://localhost:3000"

echo -e "${YELLOW}Test 1: Creating a Job Post${NC}"
echo "----------------------------"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$BASE_URL/api/posts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d '{
    "title": "Senior Agricultural Data Scientist",
    "category": "Jobs",
    "company": "FarmTech Solutions",
    "location": "Pune, India",
    "job_type": "Full-time",
    "salary_range": "₹15-20 LPA",
    "application_link": "https://example.com/apply/data-scientist",
    "content": "We are seeking an experienced Agricultural Data Scientist to join our team.",
    "tags": ["data-science", "agriculture", "machine-learning"]
  }')

HTTP_STATUS=$(echo "$RESPONSE" | grep HTTP_STATUS | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

echo "Status: $HTTP_STATUS"
echo "Response: $BODY"
echo ""

if [ "$HTTP_STATUS" = "201" ]; then
  echo -e "${GREEN}✓ Test 1 Passed${NC}"
else
  echo -e "${RED}✗ Test 1 Failed${NC}"
fi

echo ""
echo -e "${YELLOW}Test 2: Creating a Scholarship Post${NC}"
echo "------------------------------------"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$BASE_URL/api/posts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d '{
    "title": "Post-Graduate Agricultural Research Fellowship",
    "category": "Fellowships",
    "company": "ICAR - Indian Council of Agricultural Research",
    "location": "New Delhi",
    "application_link": "https://icar.org.in/fellowship/apply",
    "content": "12-month research fellowship for post-graduate students in agricultural sciences.",
    "tags": ["fellowship", "research", "post-graduate"]
  }')

HTTP_STATUS=$(echo "$RESPONSE" | grep HTTP_STATUS | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

echo "Status: $HTTP_STATUS"
echo "Response: $BODY"
echo ""

if [ "$HTTP_STATUS" = "201" ]; then
  echo -e "${GREEN}✓ Test 2 Passed${NC}"
else
  echo -e "${RED}✗ Test 2 Failed${NC}"
fi

echo ""
echo -e "${YELLOW}Test 3: Invalid API Key${NC}"
echo "------------------------"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$BASE_URL/api/posts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer wrong-key" \
  -d '{
    "title": "Test Post",
    "category": "Jobs"
  }')

HTTP_STATUS=$(echo "$RESPONSE" | grep HTTP_STATUS | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

echo "Status: $HTTP_STATUS"
echo "Response: $BODY"
echo ""

if [ "$HTTP_STATUS" = "401" ]; then
  echo -e "${GREEN}✓ Test 3 Passed (correctly rejected)${NC}"
else
  echo -e "${RED}✗ Test 3 Failed${NC}"
fi

echo ""
echo -e "${YELLOW}Test 4: Missing Title${NC}"
echo "----------------------"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$BASE_URL/api/posts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d '{
    "category": "Jobs",
    "company": "Test Company"
  }')

HTTP_STATUS=$(echo "$RESPONSE" | grep HTTP_STATUS | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

echo "Status: $HTTP_STATUS"
echo "Response: $BODY"
echo ""

if [ "$HTTP_STATUS" = "400" ]; then
  echo -e "${GREEN}✓ Test 4 Passed (correctly rejected)${NC}"
else
  echo -e "${RED}✗ Test 4 Failed${NC}"
fi

echo ""
echo "=================================="
echo -e "${GREEN}Testing Complete!${NC}"
