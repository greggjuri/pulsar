const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { successResponse } = require('../utils/response');

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE_NAME = process.env.DIAGRAMS_TABLE;

exports.listDiagrams = async (event, userId) => {
  const result = await ddb.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':sk': 'DIAGRAM#',
      },
      ProjectionExpression:
        'id, #name, createdAt, updatedAt, nodeCount, edgeCount, isPublic',
      ExpressionAttributeNames: {
        '#name': 'name', // 'name' is a reserved word
      },
    })
  );

  // Sort by updatedAt descending (most recent first)
  const diagrams = (result.Items || []).sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
  );

  return successResponse(200, { diagrams });
};
