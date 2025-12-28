# INITIAL-25: Public Sharing

## Overview

Enable users to share diagrams via public links. Anyone with the link can view the diagram in read-only mode without signing in.

**Phase:** 6 (Backend Integration)
**Depends On:** INITIAL-23 (Backend API), INITIAL-24 (Frontend Cloud Integration)

## Goals

1. Add public diagram endpoint to API (unauthenticated access)
2. Add "Make Public" toggle to diagram settings
3. Add shareable link with copy-to-clipboard
4. Create public viewer route and component

## User Flow

```
Owner:
1. Saves diagram to cloud
2. Clicks "Share" on diagram in MY DIAGRAMS panel
3. Toggles "Public" ON
4. Copies link: pulsar.jurigregg.com/view/{id}
5. Shares link with anyone

Viewer:
1. Opens link (no sign-in required)
2. Sees full 3D visualization
3. Can rotate, zoom, click nodes for info
4. Cannot edit, save, or access other diagrams
```

## Technical Specification

### Backend Changes

#### 1. New API Endpoint: `GET /public/{id}`

Add to Lambda handler - no JWT authorizer required:

```javascript
// In API Gateway - route WITHOUT authorizer
httpApi.addRoutes({
  path: '/public/{id}',
  methods: [apigatewayv2.HttpMethod.GET],
  integration: lambdaIntegration,
  // NO authorizer - public access
});

// In Lambda handler
case 'GET /public/{id}':
  return await getPublicDiagram(event, pathParameters.id);
```

Handler logic:
- Query DynamoDB for diagram by ID (any user's diagram)
- Check `isPublic === true`
- If not public, return 404 (don't reveal existence)
- If public, fetch content from S3 and return

#### 2. Update `PUT /diagrams/{id}` 

Accept `isPublic` field in request body:
- Validate boolean
- Update DynamoDB record

### Frontend Changes

#### 1. Share Modal Component

`src/components/hud/ShareModal.jsx`:

```
┌─────────────────────────────────────┐
│ Share Diagram                    ✕  │
├─────────────────────────────────────┤
│                                     │
│ Public Access                       │
│ [========OFF========]  ← toggle     │
│                                     │
│ ─────────────────────────────────── │
│                                     │
│ (when public is ON)                 │
│                                     │
│ Share Link:                         │
│ ┌─────────────────────────────────┐ │
│ │ pulsar.jurigregg.com/view/abc123│ │
│ └─────────────────────────────────┘ │
│ [📋 Copy Link]                      │
│                                     │
│ Anyone with this link can view      │
│ (read-only)                         │
│                                     │
└─────────────────────────────────────┘
```

#### 2. Update CloudDiagramsPanel

Add share button to each diagram row:
- Shows on hover (like delete button)
- Opens ShareModal
- Only for saved cloud diagrams

#### 3. Update Cloud Store

Add actions:
- `updateDiagramPublic(id, isPublic)` - API call to toggle public status
- Update local diagram list after toggle

#### 4. Update API Client

Add method:
- `diagramsApi.getPublic(id)` - fetch public diagram (no auth header)

#### 5. Public Viewer Route

Add React Router (or simple hash routing):
- Route: `/view/{id}` or `/#/view/{id}`
- Component: `PublicViewer.jsx`

#### 6. PublicViewer Component

`src/components/PublicViewer.jsx`:

- Fetches diagram via `diagramsApi.getPublic(id)`
- Renders full 3D canvas (same Scene component)
- Read-only mode: no editing controls, no save, no cloud panel
- Shows diagram name and "View Only" badge
- Shows error if diagram not found or not public
- Optional: "Made with Pulsar" branding

### Routing Approach

Simple hash-based routing (no react-router needed):

```javascript
// In App.jsx
const [viewId, setViewId] = useState(null);

useEffect(() => {
  // Check for /view/{id} or #/view/{id}
  const match = window.location.pathname.match(/^\/view\/(.+)$/);
  if (match) {
    setViewId(match[1]);
  }
}, []);

// Render
if (viewId) {
  return <PublicViewer diagramId={viewId} />;
}
return <MainApp />;
```

## Acceptance Criteria

- [ ] `GET /public/{id}` returns diagram if public, 404 if not
- [ ] `PUT /diagrams/{id}` accepts and updates `isPublic` field
- [ ] Share button appears on diagrams in MY DIAGRAMS panel
- [ ] ShareModal shows toggle and copy link UI
- [ ] Toggle updates `isPublic` via API
- [ ] Copy button copies link to clipboard
- [ ] `/view/{id}` route loads PublicViewer
- [ ] PublicViewer displays diagram in read-only mode
- [ ] PublicViewer works without authentication
- [ ] Non-public diagrams return 404 to viewers
- [ ] Viewer can rotate, zoom, select nodes
- [ ] Viewer cannot edit, delete, or save

## Cost Estimate

| Service | Usage Estimate | Monthly Cost |
|---------|----------------|--------------|
| API Gateway | <100 additional requests | $0.00 |
| Lambda | <100 additional invocations | $0.00 |
| S3 | No additional storage | $0.00 |
| **Total** | | **$0.00** |

## Security Considerations

1. **Public endpoint has no auth** - intentional, but only serves `isPublic: true` diagrams
2. **Don't reveal existence** - return 404 for both "not found" and "not public"
3. **UUIDs are unguessable** - no enumeration risk
4. **Read-only** - public viewers cannot modify anything
5. **Owner controls access** - can toggle public off anytime

## Future Extensions

- Short URLs (pulsar.to/abc)
- Embed code for iframes
- Password-protected sharing
- Expiring links
- View analytics (how many times viewed)
