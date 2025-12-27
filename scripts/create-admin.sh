#!/bin/bash
set -e

# Configuration
STACK_NAME="PulsarStack"

# Colors for output
GREEN='\033[0;32m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}Pulsar Admin User Setup${NC}"
echo "========================"
echo ""

# Get User Pool ID from CloudFormation stack outputs
echo -e "${CYAN}Getting User Pool ID from CloudFormation...${NC}"
USER_POOL_ID=$(aws cloudformation describe-stacks \
  --stack-name ${STACK_NAME} \
  --query "Stacks[0].Outputs[?OutputKey=='UserPoolId'].OutputValue" \
  --output text)

if [ -z "$USER_POOL_ID" ] || [ "$USER_POOL_ID" == "None" ]; then
  echo -e "${RED}Error: Could not get User Pool ID from stack outputs${NC}"
  exit 1
fi

echo "User Pool ID: ${USER_POOL_ID}"
echo ""

# Prompt for email
read -p "Enter admin email: " ADMIN_EMAIL

if [ -z "$ADMIN_EMAIL" ]; then
  echo -e "${RED}Error: Email cannot be empty${NC}"
  exit 1
fi

# Prompt for password (hidden)
echo "Password requirements: min 8 chars, uppercase, lowercase, digit, symbol"
read -s -p "Enter password: " ADMIN_PASSWORD
echo ""

if [ -z "$ADMIN_PASSWORD" ]; then
  echo -e "${RED}Error: Password cannot be empty${NC}"
  exit 1
fi

# Create user
echo -e "${CYAN}Creating user...${NC}"
aws cognito-idp admin-create-user \
  --user-pool-id "$USER_POOL_ID" \
  --username "$ADMIN_EMAIL" \
  --user-attributes Name=email,Value="$ADMIN_EMAIL" Name=email_verified,Value=true \
  --message-action SUPPRESS \
  > /dev/null

# Set permanent password (skip temporary password flow)
echo -e "${CYAN}Setting password...${NC}"
aws cognito-idp admin-set-user-password \
  --user-pool-id "$USER_POOL_ID" \
  --username "$ADMIN_EMAIL" \
  --password "$ADMIN_PASSWORD" \
  --permanent

echo ""
echo -e "${GREEN}✅ Admin user created: $ADMIN_EMAIL${NC}"
echo "You can now sign in at https://pulsar.jurigregg.com"
