# INITIAL-22: Cognito Authentication (Admin-Only)

## Overview

Add AWS Cognito authentication to Pulsar with admin-only access. No public sign-up—only pre-created users can sign in. This secures cloud features (save/load diagrams) while allowing unauthenticated users to use the local editor.

**Phase:** 6 (Backend Integration)
**Depends On:** INITIAL-21 (CDK Foundation)
**Unlocks:** INITIAL-23 (Backend API)

## Goals

1. Add Cognito User Pool to CDK stack (self-registration disabled)
2. Add Cognito App Client for Hosted UI authentication
3. Create CLI script to provision admin user
4. Add frontend auth state management
5. Add Sign In / Sign Out UI in top-right corner
6. Handle OAuth callback and token storage

## Non-Goals

- Public sign-up (disabled by design)
- Social login (Google, GitHub, etc.)
- Forgot password UI (can reset via CLI)
- Email verification (admin creates confirmed users)
- Protected routes (INITIAL-24 will handle this)

## User Flow

```
┌─────────────────────────────────────────────────────────────┐
│  Unauthenticated User                                       │
│  - Full local editor functionality                          │
│  - localStorage save/load works                             │
│  - "Sign In" button visible in top-right                    │
│  - Cloud save shows "Sign in to save to cloud"              │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Clicks "Sign In"
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Cognito Hosted UI                                          │
│  - Login form only (no sign-up link)                        │
│  - Email + password                                         │
│  - Standard password requirements                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Successful login
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Redirect to https://pulsar.jurigregg.com/                  │
│  - URL contains ?code=xxx                                   │
│  - App exchanges code for tokens                            │
│  - Tokens stored in localStorage                            │
│  - User info displayed, "Sign Out" button shown             │
└─────────────────────────────────────────────────────────────┘
```

## Technical Specification

### CDK Resources

#### 1. Cognito User Pool

```typescript
const userPool = new cognito.UserPool(this, 'UserPool', {
  userPoolName: 'pulsar-users',
  selfSignUpEnabled: false,  // Admin-only registration
  signInAliases: {
    email: true,
    username: false,
  },
  autoVerify: {
    email: false,  // Admin creates pre-verified users
  },
  passwordPolicy: {
    minLength: 8,
    requireLowercase: true,
    requireUppercase: true,
    requireDigits: true,
    requireSymbols: true,
  },
  accountRecovery: cognito.AccountRecovery.NONE,  // No self-service recovery
  removalPolicy: RemovalPolicy.RETAIN,
});
```

#### 2. Cognito App Client

```typescript
const userPoolClient = userPool.addClient('WebClient', {
  userPoolClientName: 'pulsar-web',
  authFlows: {
    userPassword: true,
    userSrp: true,
  },
  oAuth: {
    flows: {
      authorizationCodeGrant: true,
    },
    scopes: [
      cognito.OAuthScope.EMAIL,
      cognito.OAuthScope.OPENID,
      cognito.OAuthScope.PROFILE,
    ],
    callbackUrls: [
      'https://pulsar.jurigregg.com/',
      'http://localhost:5173/',  // Local development
    ],
    logoutUrls: [
      'https://pulsar.jurigregg.com/',
      'http://localhost:5173/',
    ],
  },
  preventUserExistenceErrors: true,
  generateSecret: false,  // Required for SPA (no secret)
});
```

#### 3. Cognito Domain (for Hosted UI)

```typescript
const userPoolDomain = userPool.addDomain('Domain', {
  cognitoDomain: {
    domainPrefix: 'pulsar-auth',  // pulsar-auth.auth.us-east-1.amazoncognito.com
  },
});
```

#### 4. Stack Outputs

```typescript
new CfnOutput(this, 'UserPoolId', { value: userPool.userPoolId });
new CfnOutput(this, 'UserPoolClientId', { value: userPoolClient.userPoolClientId });
new CfnOutput(this, 'CognitoDomain', { 
  value: `${userPoolDomain.domainName}.auth.us-east-1.amazoncognito.com` 
});
```

### Admin User Creation Script

`scripts/create-admin.sh`:
```bash
#!/bin/bash
set -e

# Configuration
USER_POOL_ID=$(aws cloudformation describe-stacks \
  --stack-name PulsarStack \
  --query "Stacks[0].Outputs[?OutputKey=='UserPoolId'].OutputValue" \
  --output text)

echo "Pulsar Admin User Setup"
echo "========================"
echo ""

# Prompt for email
read -p "Enter admin email: " ADMIN_EMAIL

# Prompt for password (hidden)
read -s -p "Enter password (min 8 chars, upper+lower+digit+symbol): " ADMIN_PASSWORD
echo ""

# Create user
echo "Creating user..."
aws cognito-idp admin-create-user \
  --user-pool-id "$USER_POOL_ID" \
  --username "$ADMIN_EMAIL" \
  --user-attributes Name=email,Value="$ADMIN_EMAIL" Name=email_verified,Value=true \
  --message-action SUPPRESS

# Set permanent password (skip temporary password flow)
echo "Setting password..."
aws cognito-idp admin-set-user-password \
  --user-pool-id "$USER_POOL_ID" \
  --username "$ADMIN_EMAIL" \
  --password "$ADMIN_PASSWORD" \
  --permanent

echo ""
echo "✅ Admin user created: $ADMIN_EMAIL"
echo "You can now sign in at https://pulsar.jurigregg.com"
```

### Frontend Implementation

#### 1. Auth Configuration

`src/config/auth.js`:
```javascript
// These values come from CDK stack outputs
// In production, could be injected at build time
export const authConfig = {
  region: 'us-east-1',
  userPoolId: 'us-east-1_XXXXXXXXX',      // From CDK output
  userPoolClientId: 'xxxxxxxxxxxxxxxxxx',  // From CDK output
  cognitoDomain: 'pulsar-auth.auth.us-east-1.amazoncognito.com',
  redirectUri: window.location.origin + '/',
  scope: 'email openid profile',
};
```

#### 2. Auth Utility Functions

`src/utils/auth.js`:
```javascript
import { authConfig } from '../config/auth';

// Build Cognito Hosted UI URL
export function getLoginUrl() {
  const params = new URLSearchParams({
    client_id: authConfig.userPoolClientId,
    response_type: 'code',
    scope: authConfig.scope,
    redirect_uri: authConfig.redirectUri,
  });
  return `https://${authConfig.cognitoDomain}/login?${params}`;
}

// Build logout URL
export function getLogoutUrl() {
  const params = new URLSearchParams({
    client_id: authConfig.userPoolClientId,
    logout_uri: authConfig.redirectUri,
  });
  return `https://${authConfig.cognitoDomain}/logout?${params}`;
}

// Exchange authorization code for tokens
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
    throw new Error('Token exchange failed');
  }

  return response.json();  // { access_token, id_token, refresh_token, expires_in }
}

// Decode JWT to get user info (no verification, just parsing)
export function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

// Check if token is expired
export function isTokenExpired(token) {
  const decoded = decodeToken(token);
  if (!decoded?.exp) return true;
  return Date.now() >= decoded.exp * 1000;
}
```

#### 3. Auth Store (Zustand)

`src/stores/authStore.js`:
```javascript
import { create } from 'zustand';
import { decodeToken, isTokenExpired } from '../utils/auth';

const STORAGE_KEY = 'pulsar-auth';

// Load initial state from localStorage
function loadPersistedAuth() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const { accessToken, idToken, refreshToken } = JSON.parse(stored);
    
    // Check if access token is expired
    if (isTokenExpired(accessToken)) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    
    const userInfo = decodeToken(idToken);
    return { accessToken, idToken, refreshToken, userInfo };
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

const initialAuth = loadPersistedAuth();

export const useAuthStore = create((set, get) => ({
  // State
  isAuthenticated: !!initialAuth,
  accessToken: initialAuth?.accessToken || null,
  idToken: initialAuth?.idToken || null,
  refreshToken: initialAuth?.refreshToken || null,
  userInfo: initialAuth?.userInfo || null,  // { email, sub, ... }
  isLoading: false,

  // Actions
  setTokens: (tokens) => {
    const { access_token, id_token, refresh_token } = tokens;
    const userInfo = decodeToken(id_token);
    
    // Persist to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      accessToken: access_token,
      idToken: id_token,
      refreshToken: refresh_token,
    }));

    set({
      isAuthenticated: true,
      accessToken: access_token,
      idToken: id_token,
      refreshToken: refresh_token,
      userInfo,
      isLoading: false,
    });
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({
      isAuthenticated: false,
      accessToken: null,
      idToken: null,
      refreshToken: null,
      userInfo: null,
    });
  },

  setLoading: (loading) => set({ isLoading: loading }),

  // Get access token for API calls
  getAccessToken: () => {
    const { accessToken } = get();
    if (!accessToken || isTokenExpired(accessToken)) {
      // Token expired, clear auth state
      get().logout();
      return null;
    }
    return accessToken;
  },
}));
```

#### 4. Auth Callback Handler

`src/hooks/useAuthCallback.js`:
```javascript
import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { exchangeCodeForTokens } from '../utils/auth';

export function useAuthCallback() {
  const setTokens = useAuthStore((s) => s.setTokens);
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
      setLoading(true);
      
      // Clean URL (remove ?code=xxx)
      window.history.replaceState({}, '', window.location.pathname);

      // Exchange code for tokens
      exchangeCodeForTokens(code)
        .then(setTokens)
        .catch((error) => {
          console.error('Auth callback error:', error);
          setLoading(false);
        });
    }
  }, [setTokens, setLoading]);
}
```

#### 5. Auth Panel Component

`src/components/hud/AuthPanel.jsx`:
```jsx
import { useAuthStore } from '../../stores/authStore';
import { getLoginUrl, getLogoutUrl } from '../../utils/auth';

export function AuthPanel() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const userInfo = useAuthStore((s) => s.userInfo);

  if (isLoading) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-black/80 border border-cyan-500/30 px-4 py-2 
                        font-mono text-sm text-cyan-400">
          Signing in...
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-black/80 border border-cyan-500/30 px-4 py-2 
                        font-mono text-sm flex items-center gap-3">
          <span className="text-cyan-400 truncate max-w-[200px]">
            {userInfo?.email}
          </span>
          <a
            href={getLogoutUrl()}
            className="text-cyan-500 hover:text-cyan-300 transition-colors"
          >
            Sign Out
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <a
        href={getLoginUrl()}
        className="bg-black/80 border border-cyan-500/30 px-4 py-2 
                   font-mono text-sm text-cyan-500 hover:text-cyan-300 
                   hover:border-cyan-400/50 transition-colors block"
      >
        Sign In
      </a>
    </div>
  );
}
```

#### 6. App Integration

Update `src/App.jsx`:
```jsx
import { useAuthCallback } from './hooks/useAuthCallback';
import { AuthPanel } from './components/hud/AuthPanel';

function App() {
  // Handle OAuth callback on mount
  useAuthCallback();

  return (
    <>
      {/* ... existing components ... */}
      <AuthPanel />
    </>
  );
}
```

## Implementation Steps

### Step 1: Update CDK Stack

Add Cognito User Pool, App Client, and Domain to `infra/lib/pulsar-stack.ts`.

### Step 2: Deploy Infrastructure

```bash
cd infra && npx cdk deploy
```

### Step 3: Create Admin Script

Create `scripts/create-admin.sh` with proper permissions.

### Step 4: Update Auth Config

Create `src/config/auth.js` with values from CDK outputs.

### Step 5: Create Auth Utilities

Create `src/utils/auth.js` with login/logout URL builders and token handling.

### Step 6: Create Auth Store

Create `src/stores/authStore.js` with Zustand store.

### Step 7: Create Auth Hook

Create `src/hooks/useAuthCallback.js` for handling OAuth callback.

### Step 8: Create Auth Panel

Create `src/components/hud/AuthPanel.jsx` with Sign In/Sign Out UI.

### Step 9: Integrate in App

Update `src/App.jsx` to include AuthPanel and useAuthCallback.

### Step 10: Create Admin User

```bash
./scripts/create-admin.sh
```

### Step 11: Test Auth Flow

1. Visit https://pulsar.jurigregg.com
2. Click "Sign In"
3. Enter admin credentials
4. Verify redirect back with user info displayed
5. Click "Sign Out"
6. Verify redirect back in unauthenticated state

## Acceptance Criteria

- [ ] Cognito User Pool created with self-registration disabled
- [ ] Cognito App Client configured for Hosted UI
- [ ] Cognito Domain created (pulsar-auth.auth.us-east-1.amazoncognito.com)
- [ ] create-admin.sh script creates working admin user
- [ ] "Sign In" button visible in top-right corner
- [ ] Clicking "Sign In" redirects to Cognito Hosted UI
- [ ] Successful login redirects back to app with tokens
- [ ] User email displayed after login
- [ ] "Sign Out" button visible when authenticated
- [ ] Sign out clears tokens and redirects
- [ ] Auth state persists across page refresh
- [ ] Expired tokens are cleared automatically
- [ ] Local editor works without authentication

## Cost Estimate

| Service | Usage Estimate | Monthly Cost |
|---------|----------------|--------------|
| Cognito | 1 MAU | $0.00 (free tier: 50K MAU) |
| **Total** | | **$0.00** |

**Free Tier Eligible:** Yes (50,000 MAU free)

## Security Considerations

1. **No public registration**: selfSignUpEnabled = false
2. **No password recovery UI**: Admin resets via CLI if needed
3. **Token storage**: localStorage (acceptable for single-user SPA)
4. **Token expiration**: Checked on each access, cleared if expired
5. **No client secret**: Required for SPA (public client)
6. **HTTPS only**: Tokens only transmitted over TLS

## Testing Strategy

1. **CDK synth**: Verify Cognito resources in template
2. **Create user**: Run create-admin.sh, verify user in AWS console
3. **Sign in flow**: Click Sign In → login → verify redirect
4. **Token persistence**: Refresh page, verify still authenticated
5. **Sign out flow**: Click Sign Out → verify logged out
6. **Expired token**: Manually expire token, verify auto-logout
7. **Local editor**: Verify works without signing in

## Rollback Plan

If issues occur:
1. Auth is optional—app works without it
2. Can disable AuthPanel component temporarily
3. Cognito resources can be deleted via `cdk destroy` (RETAIN means manual cleanup)

## Future Extensions

- **INITIAL-23**: API Gateway uses Cognito JWT authorizer
- **INITIAL-24**: Frontend checks auth before cloud save
- **Later**: Add refresh token flow if needed
- **Later**: Add more users via create-admin.sh if needed
