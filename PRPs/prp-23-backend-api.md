# PRP: 23 - Backend API for Diagrams

> Generated from: `INITIAL/initial-23-backend-api.md`
> Generated on: 2025-12-27
> Confidence: 9/10

## Summary

Create a serverless backend API for saving, loading, and managing diagrams in the cloud. This enables authenticated users to persist their work beyond localStorage and access diagrams from any device. The API uses DynamoDB for metadata, S3 for diagram content, Lambda for business logic, and HTTP API Gateway with Cognito JWT authorization.

## Requirements Addressed

1. Create DynamoDB table for diagram metadata
2. Create S3 bucket for diagram content storage
3. Create Lambda function for API handlers
4. Create HTTP API Gateway with JWT authorizer
5. Implement CRUD endpoints for diagrams:
   - POST /diagrams - Create diagram
   - GET /diagrams - List user's diagrams
   - GET /diagrams/{id} - Get diagram content
   - PUT /diagrams/{id} - Update diagram
   - DELETE /diagrams/{id} - Delete diagram

## Technical Approach

### Data Architecture
- **DynamoDB**: Stores metadata (PK: USER#{userId}, SK: DIAGRAM#{id})
- **S3**: Stores full diagram content as JSON ({userId}/{id}.json)
- **Separation of concerns**: Quick list queries from DDB, full content from S3

### API Architecture
- **HTTP API Gateway**: Lower cost, lower latency than REST API
- **JWT Authorizer**: Validates Cognito access tokens, extracts userId from sub claim
- **Single Lambda**: One function handles all routes (simpler deployment)

### Security
- All endpoints require valid JWT from Cognito
- Users can only access their own diagrams (userId from JWT)
- S3 bucket private, Lambda-only access via IAM
- Input validation on all requests

## Implementation Steps

### Step 1: Create Lambda Function Code
**Files:**
- `lambda/api/package.json`
- `lambda/api/index.js`
- `lambda/api/handlers/createDiagram.js`
- `lambda/api/handlers/listDiagrams.js`
- `lambda/api/handlers/getDiagram.js`
- `lambda/api/handlers/updateDiagram.js`
- `lambda/api/handlers/deleteDiagram.js`
- `lambda/api/utils/response.js`
- `lambda/api/utils/validation.js`

**Changes:**
- [ ] Create `lambda/api/` directory structure
- [ ] Create package.json with AWS SDK dependencies
- [ ] Create main router (index.js)
- [ ] Create CRUD handlers
- [ ] Create utility functions

**Validation:**
- [ ] Directory structure matches spec
- [ ] package.json has correct dependencies

### Step 2: Install Lambda Dependencies
**Files:** `lambda/api/node_modules/`
**Changes:**
- [ ] Run `npm install` in lambda/api/

**Validation:**
- [ ] node_modules created with AWS SDK packages
- [ ] uuid package installed

### Step 3: Update CDK Stack with Backend Resources
**Files:** `infra/lib/pulsar-stack.ts`
**Changes:**
- [ ] Import dynamodb, lambda, apigatewayv2, apigatewayv2-authorizers, apigatewayv2-integrations
- [ ] Create DynamoDB table (pulsar-diagrams) with PK/SK
- [ ] Create S3 bucket (pulsar-diagrams-{account})
- [ ] Create Lambda function (pulsar-api)
- [ ] Create HTTP API Gateway with CORS
- [ ] Create JWT Authorizer using existing User Pool
- [ ] Add routes with authorizer
- [ ] Grant Lambda permissions to DynamoDB and S3
- [ ] Add stack outputs (ApiUrl, DiagramsTableName, DiagramsBucketName)

**Validation:**
- [ ] `npx cdk synth` succeeds
- [ ] Template includes all expected resources

### Step 4: Deploy Infrastructure
**Files:** None (deployment)
**Changes:**
- [ ] Run `npx cdk deploy`
- [ ] Note API URL from outputs

**Validation:**
- [ ] Stack deploys without errors
- [ ] API URL accessible (returns 401 without auth)

### Step 5: Test API Endpoints
**Files:** None (testing)
**Changes:**
- [ ] Test all endpoints with valid JWT
- [ ] Verify CORS headers
- [ ] Verify error responses

**Validation:**
- [ ] POST /diagrams returns 201 with id
- [ ] GET /diagrams returns 200 with list
- [ ] GET /diagrams/{id} returns 200 with content
- [ ] PUT /diagrams/{id} returns 200
- [ ] DELETE /diagrams/{id} returns 204
- [ ] Unauthorized requests return 401
- [ ] Non-existent diagrams return 404

### Step 6: Update Frontend Auth Config with API URL
**Files:** `src/config/auth.js`
**Changes:**
- [ ] Add apiUrl to config

**Validation:**
- [ ] Config exports apiUrl

## Dependencies

### New NPM Packages (Lambda)
- `@aws-sdk/client-dynamodb`
- `@aws-sdk/lib-dynamodb`
- `@aws-sdk/client-s3`
- `uuid`

### CDK Imports (infra)
- `aws-cdk-lib/aws-dynamodb`
- `aws-cdk-lib/aws-lambda`
- `aws-cdk-lib/aws-apigatewayv2`
- `@aws-cdk/aws-apigatewayv2-authorizers-alpha` or `aws-cdk-lib/aws-apigatewayv2-authorizers`
- `@aws-cdk/aws-apigatewayv2-integrations-alpha` or `aws-cdk-lib/aws-apigatewayv2-integrations`

### Existing Code Dependencies
- `infra/lib/pulsar-stack.ts` - existing CDK stack with Cognito
- `src/config/auth.js` - will add API URL

## Cost Estimate

| Service | Usage Estimate | Monthly Cost |
|---------|----------------|--------------|
| DynamoDB | <1GB storage, <1M requests | $0.00 (free tier: 25GB, 25 RCU/WCU) |
| S3 | <100MB storage, <10K requests | $0.00 (free tier: 5GB, 20K GET/2K PUT) |
| Lambda | <100K invocations, <10K GB-sec | $0.00 (free tier: 1M inv, 400K GB-sec) |
| API Gateway | <1M requests | $0.00 (free tier: 1M req/month for 12 mo) |
| **Total** | | **$0.00** |

**Free Tier Eligible:** Yes (all services within free tier limits)

## Testing Strategy

### Automated Tests
- [ ] Run `npx cdk synth` to validate CloudFormation template

### Manual API Tests (with valid JWT)
```bash
# Get access token from browser localStorage or sign in flow
TOKEN="your-access-token"
API_URL="https://xxx.execute-api.us-east-1.amazonaws.com"

# Test unauthorized
curl -i $API_URL/diagrams  # Should return 401

# Create diagram
curl -X POST $API_URL/diagrams \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","nodes":[],"edges":[]}'

# List diagrams
curl $API_URL/diagrams -H "Authorization: Bearer $TOKEN"

# Get diagram (use id from create response)
curl $API_URL/diagrams/{id} -H "Authorization: Bearer $TOKEN"

# Update diagram
curl -X PUT $API_URL/diagrams/{id} \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated","nodes":[{"id":"1"}],"edges":[]}'

# Delete diagram
curl -X DELETE $API_URL/diagrams/{id} -H "Authorization: Bearer $TOKEN"
```

### Verification Checklist
- [ ] 401 returned without Authorization header
- [ ] 401 returned with invalid/expired token
- [ ] 201 returned on successful create
- [ ] 200 returned on list/get/update
- [ ] 204 returned on delete
- [ ] 404 returned for non-existent diagram
- [ ] 400 returned for invalid input
- [ ] CORS headers present in responses
- [ ] Diagram content correctly stored in S3
- [ ] Metadata correctly stored in DynamoDB

## Rollback Plan

1. **API is optional**: Frontend continues with localStorage
2. **CDK rollback**: `cdk deploy` with previous code reverts Lambda
3. **Data preserved**: DynamoDB/S3 have RETAIN policy
4. **Quick disable**: Can disable routes in API Gateway console

## Open Questions

None - the INITIAL spec is comprehensive with complete code examples for all handlers.

## Files Summary

| File | Action | Description |
|------|--------|-------------|
| `lambda/api/package.json` | Create | Lambda dependencies |
| `lambda/api/index.js` | Create | Main router |
| `lambda/api/handlers/*.js` | Create | CRUD handlers (5 files) |
| `lambda/api/utils/*.js` | Create | Utilities (2 files) |
| `infra/lib/pulsar-stack.ts` | Modify | Add DynamoDB, S3, Lambda, API Gateway |
| `src/config/auth.js` | Modify | Add API URL |

## Architecture Notes

### Why HTTP API vs REST API?
- HTTP API is ~70% cheaper than REST API
- Lower latency (no additional features overhead)
- Simpler JWT authorizer configuration
- Sufficient for our CRUD use case

### Why Single Lambda vs Multiple?
- Simpler deployment and IAM
- Shared cold start across routes
- Can split later if needed (unlikely for our scale)

### Why DynamoDB + S3 Split?
- DynamoDB for fast list queries (metadata only)
- S3 for large diagram content (unlimited size)
- Cost-effective for varying diagram sizes
- Easy to add versioning later (S3 versioning)
