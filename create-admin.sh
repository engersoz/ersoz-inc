#!/bin/bash

# ERSOZ INC - Create Admin User Script
# This script creates the admin user and tests login

API_URL="https://ersoz-inc-api.onrender.com/api/v1"
ADMIN_EMAIL="admin@ersozinc.com"
ADMIN_PASSWORD="Admin123!@#"
ADMIN_NAME="Admin User"
ADMIN_COMPANY="ERSOZ INC"

echo "========================================"
echo "ERSOZ INC - Admin User Setup"
echo "========================================"
echo ""

# Step 1: Check backend health
echo "Step 1: Checking backend health..."
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/../health")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -1)
HEALTH_BODY=$(echo "$HEALTH_RESPONSE" | head -1)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Backend is healthy!"
    echo "$HEALTH_BODY" | jq '.' 2>/dev/null || echo "$HEALTH_BODY"
else
    echo "❌ Backend is not responding properly (HTTP $HTTP_CODE)"
    echo "Please wait for Render deployment to complete"
    exit 1
fi

echo ""
echo "Step 2: Creating/Verifying admin user..."

# Try to register admin user
REGISTER_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$ADMIN_NAME\",
    \"email\": \"$ADMIN_EMAIL\",
    \"password\": \"$ADMIN_PASSWORD\",
    \"company\": \"$ADMIN_COMPANY\",
    \"phone\": \"+1234567890\",
    \"role\": \"admin\"
  }")

HTTP_CODE=$(echo "$REGISTER_RESPONSE" | tail -1)
REGISTER_BODY=$(echo "$REGISTER_RESPONSE" | head -1)

if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Admin user created successfully!"
    echo "$REGISTER_BODY" | jq '.' 2>/dev/null || echo "$REGISTER_BODY"
elif echo "$REGISTER_BODY" | grep -q "already exists"; then
    echo "ℹ️  Admin user already exists"
else
    echo "⚠️  Registration response (HTTP $HTTP_CODE):"
    echo "$REGISTER_BODY" | jq '.' 2>/dev/null || echo "$REGISTER_BODY"
fi

echo ""
echo "Step 3: Testing login..."

# Test login
LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$ADMIN_EMAIL\",
    \"password\": \"$ADMIN_PASSWORD\"
  }")

HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -1)
LOGIN_BODY=$(echo "$LOGIN_RESPONSE" | head -1)

echo ""
if [ "$HTTP_CODE" = "200" ]; then
    echo "🎉 SUCCESS! Login works!"
    echo ""
    echo "Admin credentials:"
    echo "  Email:    $ADMIN_EMAIL"
    echo "  Password: $ADMIN_PASSWORD"
    echo ""
    echo "Login at: https://ersoz-inc.vercel.app/login"
    echo ""
    
    # Show token info (first 50 chars)
    ACCESS_TOKEN=$(echo "$LOGIN_BODY" | jq -r '.data.accessToken' 2>/dev/null)
    if [ "$ACCESS_TOKEN" != "null" ] && [ -n "$ACCESS_TOKEN" ]; then
        echo "Access Token (first 50 chars): ${ACCESS_TOKEN:0:50}..."
    fi
else
    echo "❌ LOGIN FAILED (HTTP $HTTP_CODE)"
    echo ""
    echo "Error details:"
    echo "$LOGIN_BODY" | jq '.' 2>/dev/null || echo "$LOGIN_BODY"
    echo ""
    
    # Check for specific errors
    if echo "$LOGIN_BODY" | grep -q "expiresIn"; then
        echo "⚠️  JWT Configuration Error Detected!"
        echo ""
        echo "ACTION REQUIRED:"
        echo "1. Go to: https://dashboard.render.com"
        echo "2. Select: ersoz-inc-api service"
        echo "3. Click: Environment"
        echo "4. Add these variables:"
        echo "   - JWT_EXPIRES_IN = 15m"
        echo "   - REFRESH_TOKEN_EXPIRES_IN = 7d"
        echo "   - JWT_ACCESS_EXPIRATION = 15m"
        echo "   - JWT_REFRESH_EXPIRATION = 7d"
        echo "5. Click: Save Changes"
        echo "6. Wait for redeploy (~2 min)"
        echo "7. Run this script again"
        exit 1
    elif echo "$LOGIN_BODY" | grep -q "Invalid credentials"; then
        echo "⚠️  Credentials are incorrect or user doesn't exist"
        echo ""
        echo "Try resetting the password or check the database"
        exit 1
    fi
fi

echo ""
echo "========================================"
echo "Setup Complete!"
echo "========================================"
