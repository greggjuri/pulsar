const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
} = require('@aws-sdk/lib-dynamodb');
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
  const existing = await ddb.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `USER#${userId}`,
        SK: `DIAGRAM#${diagramId}`,
      },
    })
  );

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

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `${userId}/${diagramId}.json`,
      Body: JSON.stringify(diagramContent),
      ContentType: 'application/json',
    })
  );

  // Update DynamoDB metadata
  await ddb.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `USER#${userId}`,
        SK: `DIAGRAM#${diagramId}`,
      },
      UpdateExpression:
        'SET #name = :name, updatedAt = :updatedAt, nodeCount = :nodeCount, edgeCount = :edgeCount',
      ExpressionAttributeNames: {
        '#name': 'name',
      },
      ExpressionAttributeValues: {
        ':name': diagramContent.name,
        ':updatedAt': now,
        ':nodeCount': diagramContent.nodes.length,
        ':edgeCount': diagramContent.edges.length,
      },
    })
  );

  return successResponse(200, {
    id: diagramId,
    name: diagramContent.name,
    updatedAt: now,
    nodeCount: diagramContent.nodes.length,
    edgeCount: diagramContent.edges.length,
  });
};
