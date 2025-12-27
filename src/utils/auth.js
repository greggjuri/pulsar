import { authConfig } from '../config/auth';

/**
 * Build Cognito Hosted UI login URL
 */
export function getLoginUrl() {
  const params = new URLSearchParams({
    client_id: authConfig.userPoolClientId,
    response_type: 'code',
    scope: authConfig.scope,
    redirect_uri: authConfig.redirectUri,
  });
  return `https://${authConfig.cognitoDomain}/login?${params}`;
}

/**
 * Build Cognito logout URL
 */
export function getLogoutUrl() {
  const params = new URLSearchParams({
    client_id: authConfig.userPoolClientId,
    logout_uri: authConfig.redirectUri,
  });
  return `https://${authConfig.cognitoDomain}/logout?${params}`;
}

/**
 * Exchange authorization code for tokens
 * @param {string} code - Authorization code from OAuth callback
 * @returns {Promise<{access_token: string, id_token: string, refresh_token: string, expires_in: number}>}
 */
export async function exchangeCodeForTokens(code) {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: authConfig.userPoolClientId,
    code,
    redirect_uri: authConfig.redirectUri,
  });

  const response = await fetch(
    `https://${authConfig.cognitoDomain}/oauth2/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  return response.json();
}

/**
 * Decode JWT payload without verification
 * (Client-side validation only - server validates on API calls)
 * @param {string} token - JWT token
 * @returns {object|null} - Decoded payload or null if invalid
 */
export function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

/**
 * Check if JWT token is expired
 * @param {string} token - JWT token
 * @returns {boolean} - true if expired or invalid
 */
export function isTokenExpired(token) {
  const decoded = decodeToken(token);
  if (!decoded?.exp) return true;
  // Add 60 second buffer for clock skew
  return Date.now() >= (decoded.exp * 1000) - 60000;
}
