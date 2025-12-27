# INITIAL-23: Backend API for Diagrams

## Overview

Create the serverless backend API for saving, loading, and managing diagrams in the cloud. This enables authenticated users to persist their work beyond localStorage and access diagrams from any device.

**Phase:** 6 (Backend Integration)
**Depends On:** INITIAL-21 (CDK Foundation), INITIAL-22 (Cognito Auth)
**Unlocks:** INITIAL-24 (Frontend Cloud Integration), INITIAL-25 (Public Sharing)

## Goals

1. Create DynamoDB table for diagram metadata
2. Create S3 bucket for diagram content storage
3. Create Lambda function for API handlers
4. Create HTTP API Gateway with JWT authorizer
5. Implement CRUD endpoints for diagrams

## Non-Goals

- Frontend integration (INITIAL-24)
- Public sharing endpoint (INITIAL-25)
- Version history (MVP stores latest only)
- Soft delete (hard delete for simplicity)
- Offline sync / conflict resolution

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Frontend (authenticated)                                       │
│  Authorization: Bearer {accessToken}                            │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│  API Gateway (HTTP API)                                         │
│  https://api.pulsar.jurigregg.com (or CloudFront /api path)     │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  JWT Authorizer (Cognito User Pool)                       │  │
│  │  Validates accessToken, extracts userId (sub claim)       │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│  Lambda Function (Node.js 20)                                   │
│  Single function with route handling                            │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  POST   /diagrams        → createDiagram()                  ││
│  │  GET    /diagrams        → listDiagrams()                   ││
│  │  GET    /diagrams/{id}   → getDiagram()                     ││
│  │  PUT    /diagrams/{id}   → updateDiagram()                  ││
│  │  DELETE /diagrams/{id}   → deleteDiagram()                  ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────┬───────────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
┌───────────────────────────────┐ ┌───────────────────────────────┐
│  DynamoDB                     │ │  S3                           │
│  Table: pulsar-diagrams       │ │  Bucket: pulsar-diagrams-*    │
│  ┌─────────────────────────┐  │ │  ┌─────────────────────────┐  │
│  │ PK: USER#{userId}       │  │ │  │ Key: {userId}/{id}.json │  │
│  │ SK: DIAGRAM#{diagramId} │  │ │  │ Content: Full diagram   │  │
│  │ ──────────────────────  │  │ │  │ (nodes, edges, etc.)    │  │
│  │ id, name, createdAt,    │  │ │  └─────────────────────────┘  │
│  │ updatedAt, nodeCount,   │  │ │                               │
│  │ edgeCount, isPublic     │  │ │                               │
│  └─────────────────────────┘  │ │                               │
└───────────────────────────────┘ └───────────────────────────────┘
```

## Technical Specification

### CDK Resources

#### 1. DynamoDB Table

```typescript
const diagramsTable = new dynamodb.Table(this, 'DiagramsTable', {
  tableName: 'pulsar-diagrams',
  partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
  sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,  // On-demand, scales to zero
  removalPolicy: RemovalPolicy.RETAIN,
  pointInTimeRecovery: true,  // Enable backups
});
```

**Table Schema:**
| Attribute | Type | Description |
|-----------|------|-------------|
| PK | String | `USER#{userId}` - Cognito sub |
| SK | String | `DIAGRAM#{diagramId}` - UUID |
| id | String | Diagram UUID (for convenience) |
| name | String | Diagram display name |
| createdAt | String | ISO 8601 timestamp |
| updatedAt | String | ISO 8601 timestamp |
| nodeCount | Number | Number of nodes (for display) |
| edgeCount | Number | Number of edges (for display) |
| isPublic | Boolean | Whether diagram is publicly shareable |

#### 2. S3 Bucket for Diagram Content

```typescript
const diagramsBucket = new s3.Bucket(this, 'DiagramsBucket', {
  bucketName: `pulsar-diagrams-${this.account}`,
  blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
  encryption: s3.BucketEncryption.S3_MANAGED,
  removalPolicy: RemovalPolicy.RETAIN,
  lifecycleRules: [
    {
      // Clean up incomplete multipart uploads
      abortIncompleteMultipartUploadAfter: Duration.days(1),
    },
  ],
});
```

**Object Key Structure:**
```
{userId}/{diagramId}.json
```

**Content Format:**
```json
{
  "schemaVersion": "1.0.0",
  "id": "uuid",
  "name": "My Diagram",
  "nodes": [...],
  "edges": [...],
  "metadata": {
    "createdAt": "2025-12-27T...",
    "updatedAt": "2025-12-27T..."
  }
}
```

#### 3. Lambda Function

```typescript
const apiHandler = new lambda.Function(this, 'ApiHandler', {
  functionName: 'pulsar-api',
  runtime: lambda.Runtime.NODEJS_20_X,
  handler: 'index.handler',
  code: lambda.Code.fromAsset('lambda/api'),
  timeout: Duration.seconds(30),
  memorySize: 256,
  environment: {
    DIAGRAMS_TABLE: diagramsTable.tableName,
    DIAGRAMS_BUCKET: diagramsBucket.bucketName,
  },
});

// Grant permissions
diagramsTable.grantReadWriteData(apiHandler);
diagramsBucket.grantReadWrite(apiHandler);
```

#### 4. HTTP API Gateway

```typescript
const httpApi = new apigatewayv2.HttpApi(this, 'HttpApi', {
  apiName: 'pulsar-api',
  corsPreflight: {
    allowOrigins: [
      'https://pulsar.jurigregg.com',
      'http://localhost:5173',
    ],
    allowMethods: [
      apigatewayv2.CorsHttpMethod.GET,
      apigatewayv2.CorsHttpMethod.POST,
      apigatewayv2.CorsHttpMethod.PUT,
      apigatewayv2.CorsHttpMethod.DELETE,
      apigatewayv2.CorsHttpMethod.OPTIONS,
    ],
    allowHeaders: ['Content-Type', 'Authorization'],
    allowCredentials: true,
  },
});

// JWT Authorizer
const authorizer = new apigatewayv2_authorizers.HttpJwtAuthorizer(
  'CognitoAuthorizer',
  `https://cognito-idp.us-east-1.amazonaws.com/${userPool.userPoolId}`,
  {
    jwtAudience: [userPoolClient.userPoolClientId],
  }
);

// Routes
const lambdaIntegration = new apigatewayv2_integrations.HttpLambdaIntegration(
  'LambdaIntegration',
  apiHandler
);

httpApi.addRoutes({
  path: '/diagrams',
  methods: [apigatewayv2.HttpMethod.POST, apigatewayv2.HttpMethod.GET],
  integration: lambdaIntegration,
  authorizer,
});

httpApi.addRoutes({
  path: '/diagrams/{id}',
  methods: [
    apigatewayv2.HttpMethod.GET,
    apigatewayv2.HttpMethod.PUT,
    apigatewayv2.HttpMethod.DELETE,
  ],
  integration: lambdaIntegration,
  authorizer,
});
```

#### 6. Stack Outputs

```typescript
new CfnOutput(this, 'ApiUrl', { value: httpApi.apiEndpoint });
new CfnOutput(this, 'DiagramsTableName', { value: diagramsTable.tableName });
new CfnOutput(this, 'DiagramsBucketName', { value: diagramsBucket.bucketName });
```

### Lambda Function Implementation

**File Structure:**
```
lambda/
└── api/
    ├── index.js          # Main handler with routing
    ├── handlers/
    │   ├── createDiagram.js
    │   ├── listDiagrams.js
    │   ├── getDiagram.js
    │   ├── updateDiagram.js
    │   └── deleteDiagram.js
    └── utils/
        ├── response.js   # HTTP response helpers
        └── validation.js # Input validation
```

#### Main Handler (`lambda/api/index.js`)

```javascript
const { createDiagram } = require('./handlers/createDiagram');
const { listDiagrams } = require('./handlers/listDiagrams');
const { getDiagram } = require('./handlers/getDiagram');
const { updateDiagram } = require('./handlers/updateDiagram');
const { deleteDiagram } = require('./handlers/deleteDiagram');
const { errorResponse } = require('./utils/response');

exports.handler = async (event) => {
  const { routeKey, pathParameters, requestContext } = event;
  
  // Extract userId from JWT claims (set by API Gateway authorizer)
  const userId = requestContext.authorizer?.jwt?.claims?.sub;
  
  if (!userId) {
    return errorResponse(401, 'Unauthorized');
  }

  try {
    switch (routeKey) {
      case 'POST /diagrams':
        return await createDiagram(event, userId);
      case 'GET /diagrams':
        return await listDiagrams(event, userId);
      case 'GET /diagrams/{id}':
        return await getDiagram(event, userId, pathParameters.id);
      case 'PUT /diagrams/{id}':
        return await updateDiagram(event, userId, pathParameters.id);
      case 'DELETE /diagrams/{id}':
        return await deleteDiagram(event, userId, pathParameters.id);
      default:
        return errorResponse(404, 'Not found');
    }
  } catch (error) {
    console.error('Handler error:', error);
    return errorResponse(500, 'Internal server error');
  }
};
```

#### Create Diagram (`lambda/api/handlers/createDiagram.js`)

```javascript
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');
const { successResponse, errorResponse } = require('../utils/response');
const { validateDiagram } = require('../utils/validation');

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const s3 = new S3Client({});

const TABLE_NAME = process.env.DIAGRAMS_TABLE;
const BUCKET_NAME = process.env.DIAGRAMS_BUCKET;

exports.createDiagram = async (event, userId) => {
  const body = JSON.parse(event.body || '{}');
  
  // Validate input
  const validation = validateDiagram(body);
  if (!validation.valid) {
    return errorResponse(400, validation.error);
  }

  const diagramId = uuidv4();
  const now = new Date().toISOString();

  // Prepare diagram content for S3
  const diagramContent = {
    schemaVersion: '1.0.0',
    id: diagramId,
    name: body.name || 'Untitled',
    nodes: body.nodes || [],
    edges: body.edges || [],
    metadata: {
      createdAt: now,
      updatedAt: now,
    },
  };

  // Prepare metadata for DynamoDB
  const metadata = {
    PK: `USER#${userId}`,
    SK: `DIAGRAM#${diagramId}`,
    id: diagramId,
    name: diagramContent.name,
    createdAt: now,
    updatedAt: now,
    nodeCount: diagramContent.nodes.length,
    edgeCount: diagramContent.edges.length,
    isPublic: false,
  };

  // Save to S3
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: `${userId}/${diagramId}.json`,
    Body: JSON.stringify(diagramContent),
    ContentType: 'application/json',
  }));

  // Save metadata to DynamoDB
  await ddb.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: metadata,
  }));

  return successResponse(201, {
    id: diagramId,
    name: metadata.name,
    createdAt: metadata.createdAt,
    updatedAt: metadata.updatedAt,
    nodeCount: metadata.nodeCount,
    edgeCount: metadata.edgeCount,
  });
};
```

#### List Diagrams (`lambda/api/handlers/listDiagrams.js`)

```javascript
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { successResponse } = require('../utils/response');

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE_NAME = process.env.DIAGRAMS_TABLE;

exports.listDiagrams = async (event, userId) => {
  const result = await ddb.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `USER#${userId}`,
      ':sk': 'DIAGRAM#',
    },
    ProjectionExpression: 'id, #name, createdAt, updatedAt, nodeCount, edgeCount, isPublic',
    ExpressionAttributeNames: {
      '#name': 'name',  // 'name' is a reserved word
    },
  }));

  // Sort by updatedAt descending (most recent first)
  const diagrams = (result.Items || []).sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
  );

  return successResponse(200, { diagrams });
};
```

#### Get Diagram (`lambda/api/handlers/getDiagram.js`)

```javascript
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { successResponse, errorResponse } = require('../utils/response');

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const s3 = new S3Client({});

const TABLE_NAME = process.env.DIAGRAMS_TABLE;
const BUCKET_NAME = process.env.DIAGRAMS_BUCKET;

exports.getDiagram = async (event, userId, diagramId) => {
  // Check ownership in DynamoDB
  const metadata = await ddb.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: `USER#${userId}`,
      SK: `DIAGRAM#${diagramId}`,
    },
  }));

  if (!metadata.Item) {
    return errorResponse(404, 'Diagram not found');
  }

  // Get content from S3
  const s3Result = await s3.send(new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: `${userId}/${diagramId}.json`,
  }));

  const content = JSON.parse(await s3Result.Body.transformToString());

  return successResponse(200, content);
};
```

#### Update Diagram (`lambda/api/handlers/updateDiagram.js`)

```javascript
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { successResponse, errorResponse } = require('../utils/response');
const { validateDiagram } = require('../utils/validation');

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const s3 = new S3Client({});

const TABLE_NAME = process.env.DIAGRAMS_TABLE;
const BUCKET_NAME = process.env.DIAGRAMS_BUCKET;

exports.updateDiagram = async (event, userId, diagramId) => {
  const body = JSON.parse(event.body || '{}');

  // Validate input
  const validation = validateDiagram(body);
  if (!validation.valid) {
    return errorResponse(400, validation.error);
  }

  // Check ownership
  const existing = await ddb.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: `USER#${userId}`,
      SK: `DIAGRAM#${diagramId}`,
    },
  }));

  if (!existing.Item) {
    return errorResponse(404, 'Diagram not found');
  }

  const now = new Date().toISOString();

  // Update S3 content
  const diagramContent = {
    schemaVersion: '1.0.0',
    id: diagramId,
    name: body.name || existing.Item.name,
    nodes: body.nodes || [],
    edges: body.edges || [],
    metadata: {
      createdAt: existing.Item.createdAt,
      updatedAt: now,
    },
  };

  await s3.send(new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: `${userId}/${diagramId}.json`,
    Body: JSON.stringify(diagramContent),
    ContentType: 'application/json',
  }));

  // Update DynamoDB metadata
  await ddb.send(new UpdateCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: `USER#${userId}`,
      SK: `DIAGRAM#${diagramId}`,
    },
    UpdateExpression: 'SET #name = :name, updatedAt = :updatedAt, nodeCount = :nodeCount, edgeCount = :edgeCount',
    ExpressionAttributeNames: {
      '#name': 'name',
    },
    ExpressionAttributeValues: {
      ':name': diagramContent.name,
      ':updatedAt': now,
      ':nodeCount': diagramContent.nodes.length,
      ':edgeCount': diagramContent.edges.length,
    },
  }));

  return successResponse(200, {
    id: diagramId,
    name: diagramContent.name,
    updatedAt: now,
    nodeCount: diagramContent.nodes.length,
    edgeCount: diagramContent.edges.length,
  });
};
```

#### Delete Diagram (`lambda/api/handlers/deleteDiagram.js`)

```javascript
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { successResponse, errorResponse } = require('../utils/response');

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const s3 = new S3Client({});

const TABLE_NAME = process.env.DIAGRAMS_TABLE;
const BUCKET_NAME = process.env.DIAGRAMS_BUCKET;

exports.deleteDiagram = async (event, userId, diagramId) => {
  // Check ownership
  const existing = await ddb.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: `USER#${userId}`,
      SK: `DIAGRAM#${diagramId}`,
    },
  }));

  if (!existing.Item) {
    return errorResponse(404, 'Diagram not found');
  }

  // Delete from S3
  await s3.send(new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: `${userId}/${diagramId}.json`,
  }));

  // Delete from DynamoDB
  await ddb.send(new DeleteCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: `USER#${userId}`,
      SK: `DIAGRAM#${diagramId}`,
    },
  }));

  return successResponse(204, null);
};
```

#### Response Helpers (`lambda/api/utils/response.js`)

```javascript
const headers = {
  'Content-Type': 'application/json',
};

exports.successResponse = (statusCode, body) => ({
  statusCode,
  headers,
  body: body ? JSON.stringify(body) : '',
});

exports.errorResponse = (statusCode, message) => ({
  statusCode,
  headers,
  body: JSON.stringify({ error: message }),
});
```

#### Validation (`lambda/api/utils/validation.js`)

```javascript
exports.validateDiagram = (data) => {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  if (data.name && typeof data.name !== 'string') {
    return { valid: false, error: 'Name must be a string' };
  }

  if (data.name && data.name.length > 100) {
    return { valid: false, error: 'Name must be 100 characters or less' };
  }

  if (data.nodes && !Array.isArray(data.nodes)) {
    return { valid: false, error: 'Nodes must be an array' };
  }

  if (data.edges && !Array.isArray(data.edges)) {
    return { valid: false, error: 'Edges must be an array' };
  }

  return { valid: true };
};
```

### Lambda Dependencies

Create `lambda/api/package.json`:
```json
{
  "name": "pulsar-api",
  "version": "1.0.0",
  "description": "Pulsar API Lambda handlers",
  "main": "index.js",
  "dependencies": {
    "@aws-sdk/client-dynamodb": "^3.0.0",
    "@aws-sdk/lib-dynamodb": "^3.0.0",
    "@aws-sdk/client-s3": "^3.0.0",
    "uuid": "^9.0.0"
  }
}
```

**Note:** Run `npm install` in `lambda/api/` before deploying.

## Implementation Steps

### Step 1: Create Lambda Directory Structure

Create directories and files:
```
lambda/
└── api/
    ├── package.json
    ├── index.js
    ├── handlers/
    │   ├── createDiagram.js
    │   ├── listDiagrams.js
    │   ├── getDiagram.js
    │   ├── updateDiagram.js
    │   └── deleteDiagram.js
    └── utils/
        ├── response.js
        └── validation.js
```

### Step 2: Install Lambda Dependencies

```bash
cd lambda/api
npm install
cd ../..
```

### Step 3: Update CDK Stack

Add to `infra/lib/pulsar-stack.ts`:
- DynamoDB table
- S3 bucket (diagrams)
- Lambda function
- HTTP API Gateway with JWT authorizer
- IAM permissions
- Budget alert
- Stack outputs

### Step 4: Deploy

```bash
cd infra
npx cdk deploy
```

### Step 5: Test API Endpoints

Use curl or Postman to test each endpoint with a valid JWT token.

## Acceptance Criteria

- [ ] DynamoDB table created with correct schema
- [ ] S3 bucket created for diagram content
- [ ] Lambda function deployed with all handlers
- [ ] HTTP API Gateway created with JWT authorizer
- [ ] CORS configured for production and localhost
- [ ] All endpoints return appropriate status codes
- [ ] POST /diagrams creates diagram and returns ID
- [ ] GET /diagrams returns list with metadata only
- [ ] GET /diagrams/{id} returns full diagram content
- [ ] PUT /diagrams/{id} updates diagram
- [ ] DELETE /diagrams/{id} removes diagram
- [ ] Unauthorized requests return 401
- [ ] Accessing other user's diagrams returns 404
- [ ] Stack outputs include API URL

## Cost Estimate

| Service | Usage Estimate | Monthly Cost |
|---------|----------------|--------------|
| DynamoDB | <1GB storage, <1M requests | $0.00 (free tier: 25GB, 25 RCU/WCU) |
| S3 | <100MB storage, <10K requests | $0.00 (free tier: 5GB, 20K GET/2K PUT) |
| Lambda | <100K invocations, <10K GB-sec | $0.00 (free tier: 1M inv, 400K GB-sec) |
| API Gateway | <1M requests | $0.00 (free tier: 1M req/month for 12 mo) |
| **Total** | | **$0.00** |

**Free Tier Eligible:** Yes (all services within free tier)

## Security Considerations

1. **Authentication**: All endpoints require valid JWT from Cognito
2. **Authorization**: Users can only access their own diagrams (userId from JWT)
3. **Input validation**: All inputs validated before processing
4. **S3 access**: Bucket is private, Lambda-only access via IAM
5. **No secrets in code**: All sensitive values from environment variables
6. **HTTPS only**: API Gateway enforces HTTPS

## Testing Strategy

### Manual Testing with curl

```bash
# Set your access token
TOKEN="eyJraWQiOi..."

# Create diagram
curl -X POST https://API_URL/diagrams \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Diagram", "nodes": [], "edges": []}'

# List diagrams
curl https://API_URL/diagrams \
  -H "Authorization: Bearer $TOKEN"

# Get diagram
curl https://API_URL/diagrams/{id} \
  -H "Authorization: Bearer $TOKEN"

# Update diagram
curl -X PUT https://API_URL/diagrams/{id} \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Name", "nodes": [{"id": "1"}], "edges": []}'

# Delete diagram
curl -X DELETE https://API_URL/diagrams/{id} \
  -H "Authorization: Bearer $TOKEN"
```

### Verification Checklist

- [ ] 401 returned without Authorization header
- [ ] 401 returned with invalid/expired token
- [ ] 201 returned on successful create
- [ ] 200 returned on list/get/update
- [ ] 204 returned on delete
- [ ] 404 returned for non-existent diagram
- [ ] 400 returned for invalid input
- [ ] Diagram content correctly stored in S3
- [ ] Metadata correctly stored in DynamoDB

## Rollback Plan

If issues occur:
1. API is optional—frontend continues with localStorage
2. `cdk deploy` with previous code reverts Lambda
3. DynamoDB/S3 have RETAIN policy—data preserved
4. Can disable API routes in API Gateway console

## Future Extensions

- **INITIAL-24**: Frontend integration (save/load to cloud)
- **INITIAL-25**: Public sharing (`GET /public/{id}` without auth)
- **Later**: Pagination for list endpoint
- **Later**: Search/filter diagrams
