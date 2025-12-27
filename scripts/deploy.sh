#!/bin/bash
set -e

# Configuration
ACCOUNT_ID="490004610151"
BUCKET_NAME="pulsar-static-${ACCOUNT_ID}"
STACK_NAME="PulsarStack"

# Colors for output
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}Building frontend...${NC}"
npm run build

echo -e "${CYAN}Deploying infrastructure...${NC}"
cd infra && npx cdk deploy --require-approval never && cd ..

# Get distribution ID from stack outputs
echo -e "${CYAN}Getting CloudFront distribution ID...${NC}"
DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
  --stack-name ${STACK_NAME} \
  --query "Stacks[0].Outputs[?OutputKey=='DistributionId'].OutputValue" \
  --output text)

echo "Distribution ID: ${DISTRIBUTION_ID}"

echo -e "${CYAN}Syncing to S3...${NC}"
aws s3 sync dist s3://${BUCKET_NAME} --delete

echo -e "${CYAN}Invalidating CloudFront cache...${NC}"
aws cloudfront create-invalidation \
  --distribution-id ${DISTRIBUTION_ID} \
  --paths "/*" > /dev/null

echo -e "${GREEN}✅ Deployed to https://pulsar.jurigregg.com${NC}"
