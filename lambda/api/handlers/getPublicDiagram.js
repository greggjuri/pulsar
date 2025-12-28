const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { successResponse, errorResponse } = require('../utils/response');

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const s3 = new S3Client({});

const TABLE_NAME = process.env.DIAGRAMS_TABLE;
const BUCKET_NAME = process.env.DIAGRAMS_BUCKET;

/**
 * Get a public diagram by ID (no authentication required)
 * Uses GSI to lookup diagram by ID regardless of owner
 * Returns 404 for both "not found" and "not public" (security: don't reveal existence)
 */
exports.getPublicDiagram = async (event, diagramId) => {
  // Query GSI by diagram ID
  const result = await ddb.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'DiagramIdIndex',
      KeyConditionExpression: 'id = :id',
      ExpressionAttributeValues: {
        ':id': diagramId,
      },
    })
  );

  // Check if diagram exists
  if (!result.Items || result.Items.length === 0) {
    return errorResponse(404, 'Diagram not found');
  }

  const metadata = result.Items[0];

  // Check if diagram is public (return 404 if not to avoid revealing existence)
  if (!metadata.isPublic) {
    return errorResponse(404, 'Diagram not found');
  }

  // Extract userId from PK (format: USER#{userId})
  const userId = metadata.PK.replace('USER#', '');

  // Get content from S3
  try {
    const s3Result = await s3.send(
      new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `${userId}/${diagramId}.json`,
      })
    );

    const content = JSON.parse(await s3Result.Body.transformToString());

    return successResponse(200, content);
  } catch (err) {
    if (err.name === 'NoSuchKey') {
      return errorResponse(404, 'Diagram not found');
    }
    throw err;
  }
};
