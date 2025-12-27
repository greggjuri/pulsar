# PRP-21: CDK Foundation & Static Hosting

> Generated from: `INITIAL/initial-21-cdk-static-hosting.md`
> Generated on: 2025-12-27
> Confidence: 9/10

## Summary

Set up AWS CDK v2 infrastructure for Pulsar with static site hosting. This creates the foundation for all subsequent backend features (auth, API, database) and enables hosting at `pulsar.jurigregg.com`.

## Requirements Addressed

1. Initialize AWS CDK v2 project within Pulsar repo
2. Create S3 bucket for static site hosting (private, CloudFront-only access)
3. Create CloudFront distribution with SSL and SPA routing
4. Configure Route53 DNS record for `pulsar.jurigregg.com`
5. Create deployment script for frontend builds

## Prerequisites

Before executing this PRP, verify:
- [ ] AWS CLI configured with appropriate credentials
- [ ] Existing Route53 hosted zone for `jurigregg.com`
- [ ] Existing ACM certificate for `*.jurigregg.com` in us-east-1
- [ ] Node.js 18+ installed

## Technical Approach

### Architecture
```
Route53 (pulsar.jurigregg.com)
         │
         ▼
CloudFront (SSL, CDN, SPA routing)
         │
         ▼
S3 Bucket (private, OAC access only)
```

### Key Design Decisions
- **S3**: Block all public access, CloudFront uses Origin Access Control (OAC)
- **CloudFront**: HTTPS redirect, 403/404 → index.html for SPA routing
- **Bucket naming**: `pulsar-static-{account-id}` for uniqueness
- **Removal policy**: RETAIN to protect production data

## Implementation Steps

### Step 1: Initialize CDK Project

**Files:** Create `infra/` directory structure

**Commands:**
```bash
mkdir -p infra
cd infra
npx cdk init app --language typescript
```

**Manual changes after init:**
- [ ] Update `infra/package.json` with project name "pulsar-infra"
- [ ] Verify TypeScript and CDK versions are compatible

**Validation:**
- [ ] `cd infra && npm install` completes without errors
- [ ] `npx cdk --version` shows CDK v2.x

---

### Step 2: Create Configuration File

**Files:** `infra/lib/config.ts`

**Content:**
```typescript
export const config = {
  domainName: 'pulsar.jurigregg.com',
  hostedZoneName: 'jurigregg.com',
  certificateArn: 'arn:aws:acm:us-east-1:490004610151:certificate/ada55692-5653-49e3-bbcc-ea841060a763',
  accountId: '490004610151',
};
```

**Validation:**
- [ ] File created with correct values
- [ ] Certificate ARN matches existing ACM certificate

---

### Step 3: Implement Main Stack

**Files:** `infra/lib/pulsar-stack.ts`

**Changes:**
- [ ] Import required CDK constructs (s3, cloudfront, route53, acm)
- [ ] Look up existing Route53 hosted zone
- [ ] Import existing ACM certificate
- [ ] Create S3 bucket with:
  - Block all public access
  - S3-managed encryption
  - RETAIN removal policy
- [ ] Create CloudFront distribution with:
  - S3 origin with OAC
  - HTTPS redirect
  - Custom domain + certificate
  - SPA error responses (403/404 → /index.html)
- [ ] Create Route53 A record pointing to CloudFront
- [ ] Add stack outputs (BucketName, DistributionId, SiteUrl)

**Validation:**
- [ ] `npx cdk synth` generates valid CloudFormation template
- [ ] Template includes all expected resources

---

### Step 4: Update CDK App Entry Point

**Files:** `infra/bin/pulsar.ts`

**Changes:**
- [ ] Configure CDK app with account and region
- [ ] Instantiate PulsarStack with proper environment

**Validation:**
- [ ] No TypeScript compilation errors

---

### Step 5: Update CDK Configuration

**Files:** `infra/cdk.json`

**Changes:**
- [ ] Add context for TLS 1.2 security policy
- [ ] Configure app entry point

**Validation:**
- [ ] `npx cdk synth` runs without context warnings

---

### Step 6: Create Deployment Script

**Files:** `scripts/deploy.sh`

**Content:**
```bash
#!/bin/bash
set -e

ACCOUNT_ID="490004610151"
BUCKET_NAME="pulsar-static-${ACCOUNT_ID}"

echo "Building frontend..."
npm run build

echo "Deploying infrastructure..."
cd infra && npx cdk deploy --require-approval never && cd ..

# Get distribution ID from stack outputs
DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
  --stack-name PulsarStack \
  --query "Stacks[0].Outputs[?OutputKey=='DistributionId'].OutputValue" \
  --output text)

echo "Syncing to S3..."
aws s3 sync dist s3://${BUCKET_NAME} --delete

echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id ${DISTRIBUTION_ID} \
  --paths "/*"

echo "✅ Deployed to https://pulsar.jurigregg.com"
```

**Changes:**
- [ ] Create scripts/ directory if it doesn't exist
- [ ] Make script executable (`chmod +x`)

**Validation:**
- [ ] Script is executable
- [ ] Script syntax is valid (`bash -n scripts/deploy.sh`)

---

### Step 7: Update .gitignore

**Files:** `.gitignore`

**Changes:**
- [ ] Verify CDK-related patterns are present (already added based on file review)
- [ ] Add `infra/node_modules/` if not already present

**Validation:**
- [ ] CDK build artifacts will be ignored

---

### Step 8: Bootstrap CDK (First Deployment Only)

**Commands:**
```bash
cd infra
npx cdk bootstrap aws://490004610151/us-east-1
```

**Validation:**
- [ ] Bootstrap stack created successfully
- [ ] No permission errors

---

### Step 9: Deploy and Test

**Commands:**
```bash
./scripts/deploy.sh
```

**Validation:**
- [ ] CDK deploy completes without errors
- [ ] S3 bucket created with correct name
- [ ] CloudFront distribution created
- [ ] `https://pulsar.jurigregg.com` loads the app
- [ ] HTTP redirects to HTTPS
- [ ] Deep links work (e.g., `/test` returns index.html)

## Dependencies

**New packages (in infra/):**
- `aws-cdk-lib` (included by cdk init)
- `constructs` (included by cdk init)
- `typescript` (included by cdk init)
- `ts-node` (included by cdk init)

**Existing resources required:**
- Route53 hosted zone: `jurigregg.com`
- ACM certificate: `arn:aws:acm:us-east-1:490004610151:certificate/ada55692-5653-49e3-bbcc-ea841060a763`

## Cost Estimate

| Service | Usage Estimate | Monthly Cost |
|---------|----------------|--------------|
| S3 | <100MB static assets | $0.00 (free tier: 5GB) |
| S3 Requests | ~1000 PUT/month (deploys) | $0.00 (free tier: 2K PUT) |
| CloudFront | <10GB transfer, <100K requests | $0.00 (free tier: 1TB, 10M req) |
| Route53 | 1 hosted zone (existing), ~10K queries | ~$0.50 (queries) |
| **Total** | | **~$0.50/month** |

**Free Tier Eligible:** Yes (except minimal Route53 query charges)

## Testing Strategy

1. **Synth test:** `npx cdk synth` generates valid CloudFormation
2. **Deploy test:** Stack deploys without errors
3. **DNS test:** `pulsar.jurigregg.com` resolves correctly
4. **HTTPS test:** HTTP redirects to HTTPS
5. **SPA routing test:** Direct navigation to `/test` returns index.html
6. **S3 security test:** Direct S3 bucket access is blocked
7. **Cache invalidation test:** Deploy changes, verify they appear

## Rollback Plan

If deployment fails:
1. `cd infra && npx cdk destroy` removes all created resources
2. Route53 record deletion may take a few minutes to propagate
3. S3 bucket set to RETAIN—manual deletion required if desired:
   ```bash
   aws s3 rm s3://pulsar-static-490004610151 --recursive
   aws s3 rb s3://pulsar-static-490004610151
   ```

## Security Considerations

1. **S3 Bucket**: Block all public access, CloudFront-only via OAC
2. **HTTPS**: Enforced via CloudFront viewer protocol policy
3. **TLS**: Minimum TLS 1.2 via CloudFront security policy
4. **No Secrets**: Certificate ARN is not sensitive (can be in code)

## Files Changed Summary

| File | Action |
|------|--------|
| `infra/bin/pulsar.ts` | Create (CDK app entry) |
| `infra/lib/pulsar-stack.ts` | Create (main stack) |
| `infra/lib/config.ts` | Create (environment config) |
| `infra/cdk.json` | Modify (add context) |
| `infra/package.json` | Modify (update name) |
| `scripts/deploy.sh` | Create (deployment script) |
| `.gitignore` | Verify (CDK patterns present) |

## Open Questions

None - all configuration values confirmed in INITIAL spec.

## Future Extensions

This stack will be extended in subsequent phases:
- **INITIAL-22**: Add Cognito User Pool
- **INITIAL-23**: Add API Gateway, Lambda, DynamoDB
- **INITIAL-25**: Add public sharing endpoint
