# PRP: 22 - Cognito Authentication (Admin-Only)

> Generated from: `INITIAL/initial-22-cognito-auth.md`
> Generated on: 2025-12-27
> Confidence: 9/10

## Summary

Add AWS Cognito authentication to Pulsar with admin-only access. This implements a secure authentication flow using Cognito Hosted UI while keeping self-registration disabled. Users can continue using the local editor without authentication, but cloud features will require sign-in.

## Requirements Addressed

1. Add Cognito User Pool to CDK stack (self-registration disabled)
2. Add Cognito App Client for Hosted UI authentication
3. Create CLI script to provision admin user
4. Add frontend auth state management (Zustand store)
5. Add Sign In / Sign Out UI in top-right corner
6. Handle OAuth callback and token storage

## Technical Approach

### CDK Infrastructure
- Add Cognito User Pool with `selfSignUpEnabled: false`
- Add App Client configured for Authorization Code Grant flow (SPA-friendly, no client secret)
- Add Cognito Domain for Hosted UI (`pulsar-auth.auth.us-east-1.amazoncognito.com`)
- Export UserPoolId, UserPoolClientId, and CognitoDomain as stack outputs

### Frontend Architecture
- Create `authStore.js` following existing Zustand patterns from `graphStore.js`
- Create `src/config/auth.js` for Cognito configuration values
- Create `src/utils/auth.js` for URL builders and token utilities
- Create `src/hooks/useAuthCallback.js` for handling OAuth redirect
- Create `src/components/hud/AuthPanel.jsx` for Sign In/Sign Out UI
- Integrate into `App.jsx` following existing patterns

### Admin User Management
- Create `scripts/create-admin.sh` for provisioning users via AWS CLI
- Users created with `admin-create-user` and `admin-set-user-password` (permanent)

## Implementation Steps

### Step 1: Update CDK Stack with Cognito Resources
**Files:** `infra/lib/pulsar-stack.ts`
**Changes:**
- [ ] Import `aws-cdk-lib/aws-cognito`
- [ ] Add Cognito User Pool with self-signup disabled
- [ ] Add App Client with OAuth configuration for Hosted UI
- [ ] Add Cognito Domain (pulsar-auth prefix)
- [ ] Add CfnOutput for UserPoolId, UserPoolClientId, CognitoDomain

**Validation:**
- [ ] Run `npx cdk synth` and verify Cognito resources in template
- [ ] Run `npx cdk deploy` and note output values

### Step 2: Create Admin User Script
**Files:** `scripts/create-admin.sh`
**Changes:**
- [ ] Create bash script that fetches UserPoolId from CloudFormation
- [ ] Prompt for email and password
- [ ] Use `aws cognito-idp admin-create-user` with email_verified=true
- [ ] Use `aws cognito-idp admin-set-user-password --permanent`
- [ ] Make script executable

**Validation:**
- [ ] Run script and create a test admin user
- [ ] Verify user appears in AWS Cognito Console

### Step 3: Create Auth Configuration
**Files:** `src/config/auth.js` (new)
**Changes:**
- [ ] Create config object with region, userPoolId, userPoolClientId, cognitoDomain
- [ ] Add dynamic redirectUri based on window.location.origin
- [ ] Add scope configuration (email, openid, profile)

**Validation:**
- [ ] Import and log config in App.jsx to verify values

### Step 4: Create Auth Utilities
**Files:** `src/utils/auth.js` (new)
**Changes:**
- [ ] Implement `getLoginUrl()` - builds Cognito Hosted UI URL
- [ ] Implement `getLogoutUrl()` - builds logout URL
- [ ] Implement `exchangeCodeForTokens(code)` - POST to /oauth2/token endpoint
- [ ] Implement `decodeToken(token)` - JWT payload parsing (no verification)
- [ ] Implement `isTokenExpired(token)` - check exp claim

**Validation:**
- [ ] Unit test: getLoginUrl() returns valid URL with correct params
- [ ] Unit test: decodeToken() extracts email from sample JWT

### Step 5: Create Auth Store
**Files:** `src/stores/authStore.js` (new)
**Changes:**
- [ ] Create Zustand store following graphStore.js patterns
- [ ] Add state: isAuthenticated, accessToken, idToken, refreshToken, userInfo, isLoading
- [ ] Add `loadPersistedAuth()` to restore from localStorage on init
- [ ] Add `setTokens(tokens)` action - parse and persist tokens
- [ ] Add `logout()` action - clear tokens from state and localStorage
- [ ] Add `setLoading(loading)` action
- [ ] Add `getAccessToken()` selector with expiry check

**Validation:**
- [ ] Import store, verify initial state is unauthenticated
- [ ] Test setTokens/logout cycle in browser console

### Step 6: Create Auth Callback Hook
**Files:** `src/hooks/useAuthCallback.js` (new)
**Changes:**
- [ ] Create hook that runs on mount
- [ ] Check URL for ?code= query parameter
- [ ] If code exists: clean URL, exchange for tokens, update store
- [ ] Handle errors gracefully (log, clear loading state)

**Validation:**
- [ ] Add hook to App.jsx, verify no errors on normal page load
- [ ] Verify URL cleaning works (no ?code= visible after redirect)

### Step 7: Create Auth Panel Component
**Files:** `src/components/hud/AuthPanel.jsx` (new)
**Changes:**
- [ ] Create component with sci-fi styling matching existing HUD components
- [ ] Show "Signing in..." during loading state
- [ ] Show email + "Sign Out" link when authenticated
- [ ] Show "Sign In" link when unauthenticated
- [ ] Use getLoginUrl/getLogoutUrl for href values
- [ ] Position fixed in top-right corner (z-50)

**Validation:**
- [ ] Verify component renders "Sign In" initially
- [ ] Verify sci-fi styling matches HeaderPanel/ControlsPanel

### Step 8: Integrate Auth in App
**Files:** `src/App.jsx`
**Changes:**
- [ ] Import useAuthCallback hook
- [ ] Import AuthPanel component
- [ ] Call useAuthCallback() at top of App component
- [ ] Add AuthPanel to JSX (after HudOverlay)

**Validation:**
- [ ] App loads without errors
- [ ] Auth panel visible in top-right corner

### Step 9: Deploy and Test Full Auth Flow
**Files:** None (testing)
**Changes:**
- [ ] Run `npm run build`
- [ ] Run `./scripts/deploy.sh`
- [ ] Clear CloudFront cache if needed

**Validation:**
- [ ] Visit https://pulsar.jurigregg.com
- [ ] Click "Sign In" - redirects to Cognito Hosted UI
- [ ] Enter admin credentials - redirects back to app
- [ ] Verify email displayed and "Sign Out" visible
- [ ] Refresh page - verify still authenticated
- [ ] Click "Sign Out" - verify redirects and shows "Sign In"
- [ ] Verify local editor works without authentication

## Dependencies

### New NPM Packages
None required - using native fetch API and Zustand (already installed)

### Existing Code Dependencies
- `infra/lib/pulsar-stack.ts` - existing CDK stack
- `infra/lib/config.ts` - existing config
- `src/stores/graphStore.js` - pattern reference for Zustand
- `src/App.jsx` - integration point
- `scripts/deploy.sh` - deployment workflow

## Cost Estimate

| Service | Usage Estimate | Monthly Cost |
|---------|----------------|--------------|
| Cognito | 1-5 MAU | $0.00 |
| **Total** | | **$0.00** |

**Free Tier Eligible:** Yes (50,000 MAU free)
**Alerts Configured:** N/A (no cost)

## Testing Strategy

- [ ] **CDK synth**: Verify Cognito resources appear in synthesized CloudFormation template
- [ ] **CDK deploy**: Verify stack deploys without errors, note outputs
- [ ] **Create user**: Run `./scripts/create-admin.sh`, verify user in AWS Console
- [ ] **Sign in flow**: Click Sign In → authenticate → verify redirect with user info
- [ ] **Token persistence**: Refresh page, verify still authenticated
- [ ] **Sign out flow**: Click Sign Out → verify logged out state
- [ ] **Expired token**: Manually modify token exp in localStorage, verify auto-logout
- [ ] **Local editor**: Verify full functionality without signing in
- [ ] **Local dev**: Test OAuth flow with localhost:5173 callback URL

## Rollback Plan

1. **Auth is non-blocking**: App continues to work without authentication
2. **Quick disable**: Comment out `<AuthPanel />` in App.jsx and redeploy
3. **CDK rollback**: Previous stack version can be restored
4. **Cognito RETAIN**: User Pool has RETAIN policy, won't be deleted accidentally

## Open Questions

None - the INITIAL spec is comprehensive and all technical details are specified.

## Files Summary

| File | Action | Description |
|------|--------|-------------|
| `infra/lib/pulsar-stack.ts` | Modify | Add Cognito User Pool, App Client, Domain |
| `scripts/create-admin.sh` | Create | Admin user provisioning script |
| `src/config/auth.js` | Create | Auth configuration values |
| `src/utils/auth.js` | Create | Auth utility functions |
| `src/stores/authStore.js` | Create | Zustand auth state store |
| `src/hooks/useAuthCallback.js` | Create | OAuth callback handler hook |
| `src/components/hud/AuthPanel.jsx` | Create | Sign In/Out UI component |
| `src/App.jsx` | Modify | Integrate auth hook and panel |
