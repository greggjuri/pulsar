# PRP: 25 - Public Sharing

> Generated from: `INITIAL/initial-25-public-sharing.md`
> Generated on: 2025-12-28
> Confidence: 9/10

## Summary

Enable users to share diagrams via public links. This adds a public API endpoint, a GSI for looking up diagrams by ID, a share modal UI, and a public viewer route.

## Requirements Addressed

1. Add public diagram endpoint to API (unauthenticated access)
2. Add "Make Public" toggle to diagram settings
3. Add shareable link with copy-to-clipboard
4. Create public viewer route and component

## Technical Approach

### Backend Architecture

The current DynamoDB schema uses `PK: USER#{userId}` and `SK: DIAGRAM#{diagramId}`. To query a diagram by ID alone (for public access), we need a **Global Secondary Index (GSI)** with the diagram ID as the partition key.

**GSI Design:**
- GSI Name: `DiagramIdIndex`
- Partition Key: `id` (the diagram UUID)
- No sort key needed (each ID is unique)

This allows the public endpoint to find any diagram by ID, then check if `isPublic === true`.

### Security Model

1. **Don't reveal existence** - Return 404 for both "not found" and "not public"
2. **UUIDs are unguessable** - No enumeration risk
3. **Read-only access** - Public viewers cannot modify anything
4. **Owner controls** - Can toggle public off anytime

## Implementation Steps

### Step 1: Add GSI to DynamoDB Table

**Files:** `infra/lib/pulsar-stack.ts`

**Changes:**
- [ ] Add GSI `DiagramIdIndex` on `id` attribute to `diagramsTable`

**Validation:**
- [ ] Run `npx cdk diff` to verify GSI will be added
- [ ] Deploy with `npx cdk deploy`
- [ ] Verify GSI exists in AWS Console

### Step 2: Create Public Diagram Handler

**Files:** `lambda/api/handlers/getPublicDiagram.js` (new)

**Changes:**
- [ ] Create handler that queries GSI by diagram ID
- [ ] Check `isPublic === true` before returning
- [ ] Return 404 for not found OR not public (security)
- [ ] Fetch content from S3 using owner's path from DynamoDB record
- [ ] Return full diagram content

**Validation:**
- [ ] Handler returns diagram when `isPublic: true`
- [ ] Handler returns 404 when `isPublic: false`
- [ ] Handler returns 404 for non-existent ID

### Step 3: Update Lambda Router for Public Route

**Files:** `lambda/api/index.js`

**Changes:**
- [ ] Add case for `GET /public/{id}` route
- [ ] This route does NOT require userId (public access)
- [ ] Route to `getPublicDiagram` handler

**Validation:**
- [ ] Router correctly handles unauthenticated requests to `/public/{id}`

### Step 4: Update updateDiagram Handler for isPublic Field

**Files:** `lambda/api/handlers/updateDiagram.js`

**Changes:**
- [ ] Accept `isPublic` boolean in request body
- [ ] Add `isPublic` to DynamoDB UpdateExpression
- [ ] Validate `isPublic` is boolean if provided

**Validation:**
- [ ] PUT request with `isPublic: true` updates DynamoDB record
- [ ] Field persists and can be queried

### Step 5: Add Unauthenticated API Route

**Files:** `infra/lib/pulsar-stack.ts`

**Changes:**
- [ ] Add route for `GET /public/{id}` WITHOUT authorizer
- [ ] Use same Lambda integration

**Validation:**
- [ ] Route accessible without JWT token
- [ ] Authenticated routes still require JWT

### Step 6: Update API Client

**Files:** `src/utils/api.js`

**Changes:**
- [ ] Add `getPublic(id)` method that fetches `/public/{id}` without auth header
- [ ] Handle 404 error with appropriate message

**Validation:**
- [ ] Can fetch public diagram from browser console
- [ ] Returns error for non-public diagrams

### Step 7: Update Cloud Store

**Files:** `src/stores/cloudStore.js`

**Changes:**
- [ ] Add `updateDiagramPublic(id, isPublic)` action
- [ ] Call `diagramsApi.update(id, { isPublic })`
- [ ] Update local diagrams array after toggle
- [ ] Refresh diagrams list

**Validation:**
- [ ] Toggling public status updates both API and local state

### Step 8: Create ShareModal Component

**Files:** `src/components/hud/ShareModal.jsx` (new)

**Changes:**
- [ ] Create modal with sci-fi styling (follow ConfirmDialog pattern)
- [ ] Add toggle switch for "Public Access"
- [ ] Show shareable link when public (format: `pulsar.jurigregg.com/view/{id}`)
- [ ] Add "Copy Link" button using `navigator.clipboard.writeText()`
- [ ] Handle loading/error states
- [ ] Close on backdrop click or X button

**Validation:**
- [ ] Modal opens and closes correctly
- [ ] Toggle updates isPublic via API
- [ ] Copy button copies link to clipboard
- [ ] Visual feedback on copy success

### Step 9: Update CloudDiagramsPanel

**Files:** `src/components/hud/CloudDiagramsPanel.jsx`

**Changes:**
- [ ] Add share button to each diagram row (appears on hover like delete)
- [ ] Add state for which diagram's ShareModal is open
- [ ] Pass diagram data to ShareModal
- [ ] Show public indicator icon on public diagrams

**Validation:**
- [ ] Share button visible on hover
- [ ] Clicking opens ShareModal with correct diagram
- [ ] Public indicator shows for public diagrams

### Step 10: Create PublicViewer Component

**Files:** `src/components/PublicViewer.jsx` (new)

**Changes:**
- [ ] Create component that fetches diagram via `diagramsApi.getPublic(id)`
- [ ] Render full 3D scene (reuse Canvas, SceneContent, PostProcessing)
- [ ] Load diagram into graphStore (temporary, read-only)
- [ ] Show diagram name and "View Only" badge in header
- [ ] Show loading state while fetching
- [ ] Show error state if diagram not found/not public
- [ ] Hide all editing controls (no save, no cloud panel, no edit buttons)
- [ ] Optional: "Made with Pulsar" branding link

**Validation:**
- [ ] Public diagram renders correctly
- [ ] Viewer can rotate, zoom, select nodes for info
- [ ] No edit/save controls visible
- [ ] Error shown for invalid/private diagrams

### Step 11: Add Routing in App.jsx

**Files:** `src/App.jsx`

**Changes:**
- [ ] Add `useEffect` to check `window.location.pathname` for `/view/{id}` pattern
- [ ] Store matched ID in state
- [ ] If match found, render `<PublicViewer diagramId={id} />` instead of main app
- [ ] Handle back navigation (optional)

**Validation:**
- [ ] Visiting `/view/{id}` shows PublicViewer
- [ ] Visiting `/` shows normal app
- [ ] Invalid view URLs show error in PublicViewer

### Step 12: Deploy and Test End-to-End

**Files:** Various

**Changes:**
- [ ] Deploy CDK changes (`./scripts/deploy.sh` or `npx cdk deploy`)
- [ ] Build and deploy frontend
- [ ] Test full flow: make diagram public, copy link, view in incognito

**Validation:**
- [ ] Owner can toggle diagram public/private
- [ ] Public link works without authentication
- [ ] Private diagrams return 404 to public viewers
- [ ] Viewer experience is read-only

## Dependencies

### New Packages
None required - uses existing dependencies.

### Existing Code Dependencies
- `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing` - for 3D scene in viewer
- Zustand stores: `graphStore`, `cloudStore`, `authStore`
- API client: `src/utils/api.js`
- Scene components: `Canvas`, `SceneContent`, `PostProcessing`
- HUD components: `HudOverlay`, `HeaderBar`

## Cost Estimate

| Service | Usage Estimate | Monthly Cost |
|---------|----------------|--------------|
| DynamoDB GSI | On-demand, minimal queries | $0.00 |
| API Gateway | <1000 additional requests | $0.00 |
| Lambda | <1000 additional invocations | $0.00 |
| S3 | No additional storage | $0.00 |
| CloudFront | Minimal additional transfer | $0.00 |
| **Total** | | **$0.00** |

**Free Tier Eligible:** Yes - all usage within free tier limits.

## Testing Strategy

### Unit Tests
- [ ] `getPublicDiagram` handler returns correct responses
- [ ] `updateDiagram` correctly updates `isPublic` field

### Integration Tests
- [ ] API endpoint accessible without authentication
- [ ] Toggle public status persists to DynamoDB
- [ ] Frontend can fetch public diagrams

### Manual E2E Tests
- [ ] Create diagram, save to cloud
- [ ] Open share modal, toggle public ON
- [ ] Copy link, open in incognito browser
- [ ] Verify diagram loads in read-only mode
- [ ] Toggle public OFF, verify link returns 404
- [ ] Test with non-existent diagram ID

## Rollback Plan

1. **CDK Rollback:** Run `npx cdk deploy` with previous version of stack
2. **Lambda Rollback:** Redeploy previous Lambda code from git
3. **Frontend Rollback:** Deploy previous build to S3
4. **Data:** No migration needed - `isPublic` field is additive, defaults to `false`

## Open Questions

None - the INITIAL spec is clear and comprehensive. All technical decisions are straightforward:

1. **GSI vs Scan:** Using GSI for efficient lookups (decided)
2. **Routing approach:** Simple pathname matching, no React Router needed (decided)
3. **Toggle vs separate modal:** Using toggle in share modal (decided per INITIAL spec)

## File Summary

### New Files
| File | Purpose |
|------|---------|
| `lambda/api/handlers/getPublicDiagram.js` | Public diagram fetch handler |
| `src/components/hud/ShareModal.jsx` | Share settings modal |
| `src/components/PublicViewer.jsx` | Read-only public viewer |

### Modified Files
| File | Changes |
|------|---------|
| `infra/lib/pulsar-stack.ts` | Add GSI, add public route |
| `lambda/api/index.js` | Add public route handler |
| `lambda/api/handlers/updateDiagram.js` | Handle `isPublic` field |
| `src/utils/api.js` | Add `getPublic()` method |
| `src/stores/cloudStore.js` | Add `updateDiagramPublic()` action |
| `src/components/hud/CloudDiagramsPanel.jsx` | Add share button, public indicator |
| `src/App.jsx` | Add public view routing |
