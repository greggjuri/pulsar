const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  GetCommand,
  DeleteCommand,
} = require('@aws-sdk/lib-dynamodb');
const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { successResponse, errorResponse } = require('../utils/response');

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const s3 = new S3Client({});

const TABLE_NAME = process.env.DIAGRAMS_TABLE;
const BUCKET_NAME = process.env.DIAGRAMS_BUCKET;

exports.deleteDiagram = async (event, userId, diagramId) => {
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

  // Delete from S3
  await s3.send(
    new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `${userId}/${diagramId}.json`,
    })
  );

  // Delete from DynamoDB
  await ddb.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `USER#${userId}`,
        SK: `DIAGRAM#${diagramId}`,
      },
    })
  );

  return successResponse(204, null);
};
