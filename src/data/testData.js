export const testNodes = [
  { id: 'api-gw', type: 'apigateway', label: 'API Gateway', position: [-6, 0, 0], color: '#ff9900' },
  { id: 'lambda1', type: 'lambda', label: 'Lambda', position: [-2, 0, 0], color: '#ff9900' },
  { id: 'dynamodb', type: 'dynamodb', label: 'DynamoDB', position: [2, 0, 0], color: '#3b48cc' },
  { id: 'eventbridge', type: 'eventbridge', label: 'EventBridge', position: [6, 0, 2], color: '#ff4f8b' },
  { id: 's3', type: 's3', label: 'S3 Bucket', position: [6, 0, -2], color: '#00ffff' },
];

export const testEdges = [
  { id: 'e1', source: 'api-gw', target: 'lambda1', animated: true, style: 'solid' },
  { id: 'e2', source: 'lambda1', target: 'dynamodb', animated: true, style: 'solid' },
  { id: 'e3', source: 'lambda1', target: 'eventbridge', animated: true, style: 'dashed' },
  { id: 'e4', source: 'eventbridge', target: 's3', animated: true, style: 'solid' },
];
