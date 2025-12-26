/**
 * AWS Service Icons Registry
 * Maps service type keys to official AWS Architecture Icon SVGs.
 */

// Compute
import lambdaIcon from '../assets/Architecture-Service-Icons_07312025/Arch_Compute/64/Arch_AWS-Lambda_64.svg';
import ec2Icon from '../assets/Architecture-Service-Icons_07312025/Arch_Compute/64/Arch_Amazon-EC2_64.svg';

// Containers
import ecsIcon from '../assets/Architecture-Service-Icons_07312025/Arch_Containers/64/Arch_Amazon-Elastic-Container-Service_64.svg';
import fargateIcon from '../assets/Architecture-Service-Icons_07312025/Arch_Containers/64/Arch_AWS-Fargate_64.svg';

// Storage
import s3Icon from '../assets/Architecture-Service-Icons_07312025/Arch_Storage/64/Arch_Amazon-Simple-Storage-Service_64.svg';
import efsIcon from '../assets/Architecture-Service-Icons_07312025/Arch_Storage/64/Arch_Amazon-EFS_64.svg';
import ebsIcon from '../assets/Architecture-Service-Icons_07312025/Arch_Storage/64/Arch_Amazon-Elastic-Block-Store_64.svg';

// Database
import dynamodbIcon from '../assets/Architecture-Service-Icons_07312025/Arch_Database/64/Arch_Amazon-DynamoDB_64.svg';
import rdsIcon from '../assets/Architecture-Service-Icons_07312025/Arch_Database/64/Arch_Amazon-RDS_64.svg';
import auroraIcon from '../assets/Architecture-Service-Icons_07312025/Arch_Database/64/Arch_Amazon-Aurora_64.svg';
import elasticacheIcon from '../assets/Architecture-Service-Icons_07312025/Arch_Database/64/Arch_Amazon-ElastiCache_64.svg';

// Networking & Content Delivery
import apigatewayIcon from '../assets/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_Amazon-API-Gateway_64.svg';
import cloudfrontIcon from '../assets/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_Amazon-CloudFront_64.svg';
import route53Icon from '../assets/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_Amazon-Route-53_64.svg';
import vpcIcon from '../assets/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_Amazon-Virtual-Private-Cloud_64.svg';
import albIcon from '../assets/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/64/Arch_Elastic-Load-Balancing_64.svg';

// App Integration
import sqsIcon from '../assets/Architecture-Service-Icons_07312025/Arch_App-Integration/64/Arch_Amazon-Simple-Queue-Service_64.svg';
import snsIcon from '../assets/Architecture-Service-Icons_07312025/Arch_App-Integration/64/Arch_Amazon-Simple-Notification-Service_64.svg';
import eventbridgeIcon from '../assets/Architecture-Service-Icons_07312025/Arch_App-Integration/64/Arch_Amazon-EventBridge_64.svg';
import stepfunctionsIcon from '../assets/Architecture-Service-Icons_07312025/Arch_App-Integration/64/Arch_AWS-Step-Functions_64.svg';

// Security, Identity & Compliance
import cognitoIcon from '../assets/Architecture-Service-Icons_07312025/Arch_Security-Identity-Compliance/64/Arch_Amazon-Cognito_64.svg';
import iamIcon from '../assets/Architecture-Service-Icons_07312025/Arch_Security-Identity-Compliance/64/Arch_AWS-IAM-Identity-Center_64.svg';
import wafIcon from '../assets/Architecture-Service-Icons_07312025/Arch_Security-Identity-Compliance/64/Arch_AWS-WAF_64.svg';

// Management & Governance
import cloudwatchIcon from '../assets/Architecture-Service-Icons_07312025/Arch_Management-Governance/64/Arch_Amazon-CloudWatch_64.svg';

/**
 * Icon registry mapping service type keys to imported SVG paths
 */
export const AWS_ICONS = {
  // Compute
  lambda: lambdaIcon,
  ec2: ec2Icon,

  // Containers
  ecs: ecsIcon,
  fargate: fargateIcon,

  // Storage
  s3: s3Icon,
  efs: efsIcon,
  ebs: ebsIcon,

  // Database
  dynamodb: dynamodbIcon,
  rds: rdsIcon,
  aurora: auroraIcon,
  elasticache: elasticacheIcon,

  // Networking
  apigateway: apigatewayIcon,
  cloudfront: cloudfrontIcon,
  route53: route53Icon,
  vpc: vpcIcon,
  alb: albIcon,

  // Integration
  sqs: sqsIcon,
  sns: snsIcon,
  eventbridge: eventbridgeIcon,
  stepfunctions: stepfunctionsIcon,

  // Security
  cognito: cognitoIcon,
  iam: iamIcon,
  waf: wafIcon,

  // Monitoring
  cloudwatch: cloudwatchIcon,

  // Generic (no icon)
  generic: null,
};

/**
 * Get the icon path for a service type
 * @param {string} type - Service type key (e.g., 'lambda', 's3')
 * @returns {string|null} Icon path or null if not found
 */
export const getIcon = (type) => AWS_ICONS[type] ?? null;
