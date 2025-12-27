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
  const metadata = await ddb.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `USER#${userId}`,
        SK: `DIAGRAM#${diagramId}`,
      },
    })
  );

  if (!metadata.Item) {
    return errorResponse(404, 'Diagram not found');
  }

  // Get content from S3
  const s3Result = await s3.send(
    new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `${userId}/${diagramId}.json`,
    })
  );

  const content = JSON.parse(await s3Result.Body.transformToString());

  return successResponse(200, content);
};
