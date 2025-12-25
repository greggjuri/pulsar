/**
 * AWS Services Configuration
 * Centralized definitions for AWS service types used in node type selection.
 */

export const AWS_SERVICES = {
  compute: {
    label: 'Compute',
    services: [
      { key: 'lambda', name: 'Lambda' },
      { key: 'ec2', name: 'EC2' },
      { key: 'ecs', name: 'ECS' },
      { key: 'fargate', name: 'Fargate' },
    ],
  },
  storage: {
    label: 'Storage',
    services: [
      { key: 's3', name: 'S3' },
      { key: 'efs', name: 'EFS' },
      { key: 'ebs', name: 'EBS' },
    ],
  },
  database: {
    label: 'Database',
    services: [
      { key: 'dynamodb', name: 'DynamoDB' },
      { key: 'rds', name: 'RDS' },
      { key: 'aurora', name: 'Aurora' },
      { key: 'elasticache', name: 'ElastiCache' },
    ],
  },
  networking: {
    label: 'Networking',
    services: [
      { key: 'apigateway', name: 'API Gateway' },
      { key: 'cloudfront', name: 'CloudFront' },
      { key: 'route53', name: 'Route 53' },
      { key: 'vpc', name: 'VPC' },
      { key: 'alb', name: 'ALB/ELB' },
    ],
  },
  integration: {
    label: 'Integration',
    services: [
      { key: 'sqs', name: 'SQS' },
      { key: 'sns', name: 'SNS' },
      { key: 'eventbridge', name: 'EventBridge' },
      { key: 'stepfunctions', name: 'Step Functions' },
    ],
  },
  security: {
    label: 'Security',
    services: [
      { key: 'cognito', name: 'Cognito' },
      { key: 'iam', name: 'IAM' },
      { key: 'waf', name: 'WAF' },
    ],
  },
  other: {
    label: 'Other',
    services: [
      { key: 'cloudwatch', name: 'CloudWatch' },
      { key: 'generic', name: 'Generic' },
    ],
  },
};

/**
 * Get service definition by key
 * @param {string} key - Service key (e.g., 'lambda', 's3')
 * @returns {object|null} Service object or null if not found
 */
export const getServiceByKey = (key) => {
  for (const category of Object.values(AWS_SERVICES)) {
    const service = category.services.find((s) => s.key === key);
    if (service) return service;
  }
  return null;
};

/**
 * Get flat list of all services
 * @returns {Array} All services as flat array
 */
export const getAllServicesFlat = () => {
  const services = [];
  for (const category of Object.values(AWS_SERVICES)) {
    services.push(...category.services);
  }
  return services;
};

/**
 * Get display name for a service key
 * @param {string} key - Service key
 * @returns {string} Display name or uppercase key if not found
 */
export const getServiceName = (key) => {
  const service = getServiceByKey(key);
  return service?.name || key?.toUpperCase() || 'GENERIC';
};
