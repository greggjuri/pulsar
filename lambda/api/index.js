const { createDiagram } = require('./handlers/createDiagram');
const { listDiagrams } = require('./handlers/listDiagrams');
const { getDiagram } = require('./handlers/getDiagram');
const { updateDiagram } = require('./handlers/updateDiagram');
const { deleteDiagram } = require('./handlers/deleteDiagram');
const { getPublicDiagram } = require('./handlers/getPublicDiagram');
const { errorResponse } = require('./utils/response');

exports.handler = async (event) => {
  const { routeKey, pathParameters, requestContext } = event;

  try {
    // Handle public route (no authentication required)
    if (routeKey === 'GET /public/{id}') {
      return await getPublicDiagram(event, pathParameters.id);
    }

    // All other routes require authentication
    const userId = requestContext.authorizer?.jwt?.claims?.sub;

    if (!userId) {
      return errorResponse(401, 'Unauthorized');
    }

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
