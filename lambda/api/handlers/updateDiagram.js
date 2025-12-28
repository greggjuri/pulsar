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

  // Validate isPublic if provided
  if (body.isPublic !== undefined && typeof body.isPublic !== 'boolean') {
    return errorResponse(400, 'isPublic must be a boolean');
  }

  // Validate diagram content (skip if only updating isPublic)
  const isMetadataOnlyUpdate = body.isPublic !== undefined && !body.nodes && !body.edges;
  if (!isMetadataOnlyUpdate) {
    const validation = validateDiagram(body);
    if (!validation.valid) {
      return errorResponse(400, validation.error);
    }
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

  // For metadata-only updates (just isPublic), skip S3 update
  let diagramContent;
  if (isMetadataOnlyUpdate) {
    // Use existing values from DynamoDB
    diagramContent = {
      name: existing.Item.name,
      nodes: { length: existing.Item.nodeCount || 0 },
      edges: { length: existing.Item.edgeCount || 0 },
    };
  } else {
    // Update S3 content
    diagramContent = {
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
  }

  // Build update expression dynamically
  const updateExpressionParts = ['updatedAt = :updatedAt'];
  const expressionAttributeNames = {};
  const expressionAttributeValues = {
    ':updatedAt': now,
  };

  // Only update name, nodeCount, edgeCount if not metadata-only update
  if (!isMetadataOnlyUpdate) {
    updateExpressionParts.push('#name = :name', 'nodeCount = :nodeCount', 'edgeCount = :edgeCount');
    expressionAttributeNames['#name'] = 'name';
    expressionAttributeValues[':name'] = diagramContent.name;
    expressionAttributeValues[':nodeCount'] = diagramContent.nodes.length;
    expressionAttributeValues[':edgeCount'] = diagramContent.edges.length;
  }

  // Add isPublic if provided
  if (body.isPublic !== undefined) {
    updateExpressionParts.push('isPublic = :isPublic');
    expressionAttributeValues[':isPublic'] = body.isPublic;
  }

  // Update DynamoDB metadata
  const updateParams = {
    TableName: TABLE_NAME,
    Key: {
      PK: `USER#${userId}`,
      SK: `DIAGRAM#${diagramId}`,
    },
    UpdateExpression: 'SET ' + updateExpressionParts.join(', '),
    ExpressionAttributeValues: expressionAttributeValues,
  };

  // Only add ExpressionAttributeNames if not empty (DynamoDB errors on empty object)
  if (Object.keys(expressionAttributeNames).length > 0) {
    updateParams.ExpressionAttributeNames = expressionAttributeNames;
  }

  await ddb.send(new UpdateCommand(updateParams));

  const response = {
    id: diagramId,
    name: diagramContent.name,
    updatedAt: now,
    nodeCount: diagramContent.nodes.length,
    edgeCount: diagramContent.edges.length,
  };

  // Include isPublic in response if it was updated
  if (body.isPublic !== undefined) {
    response.isPublic = body.isPublic;
  }

  return successResponse(200, response);
};
