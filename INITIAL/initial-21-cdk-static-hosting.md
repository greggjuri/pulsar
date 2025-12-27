# INITIAL-21: CDK Foundation & Static Hosting

## Overview

Set up AWS CDK infrastructure for Pulsar with static site hosting. This creates the foundation for all subsequent backend features (auth, API, database).

**Phase:** 6 (Backend Integration)
**Depends On:** None (foundational)
**Unlocks:** INITIAL-22 (Cognito Auth), INITIAL-23 (Backend API)

## Goals

1. Initialize AWS CDK v2 project within Pulsar repo
2. Create S3 bucket for static site hosting
3. Create CloudFront distribution with SSL
4. Configure Route53 DNS record for `pulsar.jurigregg.com`
5. Create deployment script for frontend builds

## Non-Goals

- Authentication (INITIAL-22)
- API Gateway/Lambda (INITIAL-23)
- DynamoDB tables (INITIAL-23)
- CI/CD pipeline (Phase 7)

## Prerequisites

- AWS CLI configured with appropriate credentials
- Existing Route53 hosted zone for `jurigregg.com`
- Existing ACM certificate for `*.jurigregg.com` in us-east-1 (required for CloudFront)
- Node.js 18+ installed

## Technical Specification

### Directory Structure

```
pulsar/
├── src/                      # Existing React frontend
├── infra/                    # NEW: CDK infrastructure
│   ├── bin/
│   │   └── pulsar.ts         # CDK app entry point
│   ├── lib/
│   │   └── pulsar-stack.ts   # Main stack definition
│   ├── cdk.json
│   ├── tsconfig.json
│   └── package.json          # CDK dependencies (separate from frontend)
├── scripts/
│   └── deploy.sh             # NEW: Build + deploy script
└── package.json              # Existing frontend package.json
```

### CDK Stack Resources

#### 1. S3 Bucket (`pulsar-static-490004610151`)

```typescript
const siteBucket = new s3.Bucket(this, 'SiteBucket', {
  bucketName: `pulsar-static-${this.account}`,  // pulsar-static-490004610151
  blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
  removalPolicy: RemovalPolicy.RETAIN,
  autoDeleteObjects: false,
  encryption: s3.BucketEncryption.S3_MANAGED,
});
```

**Configuration:**
- Block all public access (CloudFront uses OAC)
- S3-managed encryption
- RETAIN on delete (safety for production data)
- No versioning needed for static assets

#### 2. CloudFront Distribution

```typescript
const distribution = new cloudfront.Distribution(this, 'Distribution', {
  defaultBehavior: {
    origin: new origins.S3Origin(siteBucket),
    viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
  },
  domainNames: ['pulsar.jurigregg.com'],
  certificate: certificate,  // Imported ACM cert
  defaultRootObject: 'index.html',
  errorResponses: [
    {
      httpStatus: 403,
      responseHttpStatus: 200,
      responsePagePath: '/index.html',
      ttl: Duration.minutes(5),
    },
    {
      httpStatus: 404,
      responseHttpStatus: 200,
      responsePagePath: '/index.html',
      ttl: Duration.minutes(5),
    },
  ],
});
```

**Configuration:**
- HTTPS redirect enforced
- SPA routing: 403/404 → index.html (React Router support)
- Origin Access Control (OAC) for S3 access
- Caching optimized for static assets

#### 3. Route53 DNS Record

```typescript
new route53.ARecord(this, 'SiteRecord', {
  zone: hostedZone,  // Imported existing zone
  recordName: 'pulsar',
  target: route53.RecordTarget.fromAlias(
    new targets.CloudFrontTarget(distribution)
  ),
});
```

**Configuration:**
- A record (alias) for `pulsar.jurigregg.com`
- Points to CloudFront distribution

#### 4. Origin Access Control (OAC)

CloudFront uses OAC (not legacy OAI) to access S3:

```typescript
// CDK v2 handles this automatically with S3Origin
// But we need to ensure bucket policy allows CloudFront
```

### Deployment Script

`scripts/deploy.sh`:
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

### Environment Configuration

Create `infra/lib/config.ts` for environment-specific values:

```typescript
export const config = {
  domainName: 'pulsar.jurigregg.com',
  hostedZoneName: 'jurigregg.com',
  certificateArn: 'arn:aws:acm:us-east-1:490004610151:certificate/ada55692-5653-49e3-bbcc-ea841060a763',
  accountId: '490004610151',
};
```

### Stack Outputs

Export these values for use in later phases:

```typescript
new CfnOutput(this, 'BucketName', { value: siteBucket.bucketName });
new CfnOutput(this, 'DistributionId', { value: distribution.distributionId });
new CfnOutput(this, 'DistributionDomainName', { value: distribution.distributionDomainName });
new CfnOutput(this, 'SiteUrl', { value: `https://${config.domainName}` });
```

## Implementation Steps

### Step 1: Initialize CDK Project

```bash
mkdir -p infra
cd infra
npx cdk init app --language typescript
```

Install additional dependencies:
```bash
npm install @aws-cdk/aws-s3-deployment  # For future use
```

### Step 2: Configure CDK

Update `infra/cdk.json`:
```json
{
  "app": "npx ts-node --prefer-ts-exts bin/pulsar.ts",
  "context": {
    "@aws-cdk/aws-cloudfront:defaultSecurityPolicyTLSv1.2_2021": true
  }
}
```

### Step 3: Implement Stack

Create `infra/lib/pulsar-stack.ts` with:
- S3 bucket (private, CloudFront access only)
- CloudFront distribution with OAC
- Route53 A record
- Stack outputs

### Step 4: Look Up Existing Resources

The stack needs to reference existing resources:
```typescript
// Look up existing hosted zone
const hostedZone = route53.HostedZone.fromLookup(this, 'Zone', {
  domainName: 'jurigregg.com',
});

// Import existing certificate (must be in us-east-1)
const certificate = acm.Certificate.fromCertificateArn(
  this, 'Certificate', 
  config.certificateArn
);
```

### Step 5: Create Deployment Script

Create `scripts/deploy.sh` with build, CDK deploy, S3 sync, and cache invalidation.

### Step 6: Update .gitignore

Add to root `.gitignore`:
```
# CDK
infra/cdk.out/
infra/node_modules/
*.js
*.d.ts
!jest.config.js
```

### Step 7: Bootstrap CDK (First Time Only)

```bash
cd infra
npx cdk bootstrap aws://490004610151/us-east-1
```

### Step 8: Deploy and Test

```bash
./scripts/deploy.sh
# Visit https://pulsar.jurigregg.com
```

## Acceptance Criteria

- [ ] CDK project initialized in `infra/` directory
- [ ] `npx cdk synth` generates valid CloudFormation template
- [ ] `npx cdk deploy` successfully creates all resources
- [ ] S3 bucket created with correct naming and security settings
- [ ] CloudFront distribution created with SSL certificate
- [ ] `pulsar.jurigregg.com` resolves to CloudFront
- [ ] HTTPS enforced (HTTP redirects to HTTPS)
- [ ] SPA routing works (deep links return index.html)
- [ ] Deployment script builds frontend and syncs to S3
- [ ] Cache invalidation works after deployment
- [ ] Stack outputs display bucket name, distribution ID, and URL

## Cost Estimate

| Service | Usage Estimate | Monthly Cost |
|---------|----------------|--------------|
| S3 | <100MB static assets | $0.00 (free tier: 5GB) |
| S3 Requests | ~1000 PUT/month (deploys) | $0.00 (free tier: 2K PUT) |
| CloudFront | <10GB transfer, <100K requests | $0.00 (free tier: 1TB, 10M req) |
| Route53 | 1 hosted zone (existing), ~10K queries | ~$0.50 (queries) |
| **Total** | | **~$0.50/month** |

**Free Tier Eligible:** Yes (except minimal Route53 query charges)
**Alerts Configured:** Will be added in INITIAL-23 with full backend

## Security Considerations

1. **S3 Bucket**: Block all public access, CloudFront-only via OAC
2. **HTTPS**: Enforced via CloudFront viewer protocol policy
3. **TLS**: Minimum TLS 1.2 via CloudFront security policy
4. **No Secrets**: Certificate ARN is not sensitive (can be in code)

## Rollback Plan

If deployment fails:
1. `npx cdk destroy` removes all created resources
2. Route53 record deletion may take a few minutes to propagate
3. S3 bucket set to RETAIN—manual deletion required if desired

## Future Considerations

This stack will be extended in subsequent phases:
- **INITIAL-22**: Add Cognito User Pool
- **INITIAL-23**: Add API Gateway, Lambda, DynamoDB
- **INITIAL-25**: Add public sharing endpoint

The single-stack approach allows easy cross-resource references (e.g., API URL in frontend config).

## Open Questions

None - all configuration values confirmed.

## References

- [CDK S3 + CloudFront Pattern](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_cloudfront_origins-readme.html)
- [CloudFront OAC](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html)
- [SPA Routing with CloudFront](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/GeneratingCustomErrorResponses.html)
