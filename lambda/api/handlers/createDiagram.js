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
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `${userId}/${diagramId}.json`,
      Body: JSON.stringify(diagramContent),
      ContentType: 'application/json',
    })
  );

  // Save metadata to DynamoDB
  await ddb.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: metadata,
    })
  );

  return successResponse(201, {
    id: diagramId,
    name: metadata.name,
    createdAt: metadata.createdAt,
    updatedAt: metadata.updatedAt,
    nodeCount: metadata.nodeCount,
    edgeCount: metadata.edgeCount,
  });
};
