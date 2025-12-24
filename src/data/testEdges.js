export const testEdges = [
  { id: 'e1', source: 'api-gw', target: 'lambda1', animated: true, style: 'solid' },
  { id: 'e2', source: 'lambda1', target: 'dynamodb', animated: true, style: 'solid' },
  { id: 'e3', source: 'lambda1', target: 'eventbridge', animated: true, style: 'dashed' },
  { id: 'e4', source: 'eventbridge', target: 's3', animated: true, style: 'solid' },
];
