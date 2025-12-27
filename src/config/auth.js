/**
 * Cognito authentication configuration
 * Values from CDK stack outputs (PulsarStack)
 */
export const authConfig = {
  region: 'us-east-1',
  userPoolId: 'us-east-1_pLbpih1A2',
  userPoolClientId: '74dfjpapo3gt1nhnfslfhgvmqk',
  cognitoDomain: 'pulsar-auth.auth.us-east-1.amazoncognito.com',
  redirectUri: window.location.origin + '/',
  scope: 'email openid profile',
  apiUrl: 'https://np3nbnrpc5.execute-api.us-east-1.amazonaws.com',
};
