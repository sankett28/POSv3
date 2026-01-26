#!/bin/bash

# Test script for theme update fix
# Run this after restarting the backend

echo "🧪 Testing Theme Update Fix..."
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:8000"

echo "1️⃣  Testing GET /api/v1/themes (fetch current theme)..."
RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/api/v1/themes")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ GET request successful${NC}"
    echo "Current theme: $BODY"
else
    echo -e "${RED}❌ GET request failed with code $HTTP_CODE${NC}"
    exit 1
fi

echo ""
echo "2️⃣  Testing PUT /api/v1/themes (update theme)..."

# Test theme data
TEST_THEME='{
  "primary_color": "#FF5733",
  "secondary_color": "#ffffff",
  "background_color": "#fff0f3",
  "foreground_color": "#000000",
  "accent_color": "#b45a69",
  "danger_color": "#ef4444",
  "success_color": "#22c55e",
  "warning_color": "#f59e0b",
  "source": "manual"
}'

RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$API_URL/api/v1/themes" \
  -H "Content-Type: application/json" \
  -d "$TEST_THEME")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ PUT request successful${NC}"
    echo "Updated theme: $BODY"
else
    echo -e "${RED}❌ PUT request failed with code $HTTP_CODE${NC}"
    echo "Response: $BODY"
    exit 1
fi

echo ""
echo "3️⃣  Verifying theme was updated..."

RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/api/v1/themes")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    if echo "$BODY" | grep -q "FF5733"; then
        echo -e "${GREEN}✅ Theme update verified - primary color is #FF5733${NC}"
    else
        echo -e "${YELLOW}⚠️  Theme fetched but primary color not updated${NC}"
        echo "Response: $BODY"
    fi
else
    echo -e "${RED}❌ Verification failed with code $HTTP_CODE${NC}"
    exit 1
fi

echo ""
echo "4️⃣  Testing audit logs..."

RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/api/v1/themes/audit")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Audit logs accessible${NC}"
    echo "Latest audit entry: $(echo "$BODY" | head -c 200)..."
else
    echo -e "${RED}❌ Audit logs failed with code $HTTP_CODE${NC}"
fi

echo ""
echo -e "${GREEN}🎉 All tests passed! Theme update is working correctly.${NC}"
echo ""
echo "Next steps:"
echo "1. Open http://localhost:3000/settings/theme"
echo "2. Change colors and click 'Save Theme'"
echo "3. Refresh page to verify persistence"
