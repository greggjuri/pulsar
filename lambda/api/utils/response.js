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
