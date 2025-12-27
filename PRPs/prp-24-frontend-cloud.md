# PRP: 24 - Frontend Cloud Integration

> Generated from: `INITIAL/initial-24-frontend-cloud.md`
> Generated on: 2025-12-27
> Confidence: 9/10

## Summary

Connect the Pulsar frontend to the backend API (deployed in PRP-23), enabling authenticated users to save, load, and manage diagrams in the cloud. Unauthenticated users continue working in "Local Mode" with localStorage. This adds a Cloud Diagrams panel, Save to Cloud button, mode indicator, and unsaved changes tracking.

## Requirements Addressed

1. Create API client with authentication handling
2. Add Cloud Diagrams panel (left sidebar) for listing/loading diagrams
3. Add "Save to Cloud" functionality
4. Add mode indicator (Local Mode vs Cloud Sync)
5. Add confirmation dialog for unsaved changes
6. Add delete diagram from cloud UI

## Technical Approach

- **API Client**: Authenticated fetch wrapper using access token from authStore
- **Cloud Store**: Zustand store for diagram list, current cloud ID, and unsaved state
- **Mode Indicator**: Simple badge showing "Local Mode" or "Cloud Sync"
- **Cloud Diagrams Panel**: Left sidebar panel with diagram list, load, delete
- **Save Cloud Button**: Button with loading state and unsaved indicator
- **Change Tracking**: Hook that detects graph changes after initial load
- **Confirm Dialog**: Reusable modal for destructive actions

All components follow the existing sci-fi holographic aesthetic with cyan accents, monospace fonts, and black/transparent backgrounds.

## Implementation Steps

### Step 1: Create API Client

**Files:** `src/utils/api.js` (create)

**Changes:**
- [ ] Create apiRequest function with Bearer token authentication
- [ ] Handle 401 errors by triggering logout
- [ ] Handle 204 No Content responses
- [ ] Create diagramsApi object with list, get, create, update, delete methods

**Validation:**
- [ ] File exists and exports diagramsApi
- [ ] No syntax errors (npm run lint passes)

---

### Step 2: Create Cloud Store

**Files:** `src/stores/cloudStore.js` (create)

**Changes:**
- [ ] Create Zustand store with diagrams, isLoading, error, currentCloudId, hasUnsavedChanges state
- [ ] Add setLoading, setError, setUnsavedChanges, setCurrentCloudId actions
- [ ] Add fetchDiagrams action to load diagram list from API
- [ ] Add loadDiagram action to fetch single diagram with content
- [ ] Add saveDiagram action to create or update diagram
- [ ] Add deleteDiagram action to remove diagram
- [ ] Add clear action to reset state on logout

**Validation:**
- [ ] File exists and exports useCloudStore
- [ ] No syntax errors

---

### Step 3: Create Confirm Dialog Component

**Files:** `src/components/hud/ConfirmDialog.jsx` (create)

**Changes:**
- [ ] Create ConfirmDialog component with title, message, confirmLabel, cancelLabel, variant props
- [ ] Add modal backdrop with click-to-cancel
- [ ] Add danger variant with red styling
- [ ] Style with sci-fi aesthetic (black bg, cyan borders)

**Validation:**
- [ ] File exists and exports ConfirmDialog
- [ ] Component renders without errors

---

### Step 4: Create Mode Indicator Component

**Files:** `src/components/hud/ModeIndicator.jsx` (create)

**Changes:**
- [ ] Create ModeIndicator component that reads from authStore
- [ ] Show "LOCAL MODE" with gray styling when unauthenticated
- [ ] Show "CLOUD SYNC" with cyan styling when authenticated
- [ ] Show "(unsaved)" badge when hasUnsavedChanges is true
- [ ] Position in top-right below header

**Validation:**
- [ ] File exists and exports ModeIndicator
- [ ] Component renders without errors

---

### Step 5: Create Cloud Diagrams Panel

**Files:** `src/components/hud/CloudDiagramsPanel.jsx` (create)

**Changes:**
- [ ] Create CloudDiagramsPanel component that only renders when authenticated
- [ ] Fetch diagrams on mount when authenticated
- [ ] Display diagram list with name, node count, edge count
- [ ] Highlight current diagram with left border and arrow
- [ ] Show delete button on hover
- [ ] Add "+ NEW DIAGRAM" button at bottom
- [ ] Integrate ConfirmDialog for unsaved changes warning on load
- [ ] Integrate ConfirmDialog for delete confirmation
- [ ] Position in left sidebar below header

**Validation:**
- [ ] File exists and exports CloudDiagramsPanel
- [ ] Component renders without errors
- [ ] Does not render when unauthenticated

---

### Step 6: Create Save Cloud Button

**Files:** `src/components/hud/SaveCloudButton.jsx` (create)

**Changes:**
- [ ] Create SaveCloudButton component that only renders when authenticated
- [ ] Show loading state while saving
- [ ] Show animated pulse when hasUnsavedChanges is true
- [ ] Call saveDiagram with current graph state on click
- [ ] Position in bottom-left above controls

**Validation:**
- [ ] File exists and exports SaveCloudButton
- [ ] Component renders without errors when authenticated
- [ ] Does not render when unauthenticated

---

### Step 7: Create Change Tracking Hook

**Files:** `src/hooks/useTrackChanges.js` (create)

**Changes:**
- [ ] Create useTrackChanges hook that monitors graphStore changes
- [ ] Skip first render (initial load)
- [ ] Only track when authenticated
- [ ] Compare current state to last saved state
- [ ] Call setUnsavedChanges(true) when changes detected
- [ ] Reset tracking when cloud save completes (hasUnsavedChanges becomes false)

**Validation:**
- [ ] File exists and exports useTrackChanges
- [ ] Hook does not cause errors when called

---

### Step 8: Update Auth Store for Logout Cleanup

**Files:** `src/stores/authStore.js` (modify)

**Changes:**
- [ ] Import useCloudStore
- [ ] In logout action, call useCloudStore.getState().clear()

**Validation:**
- [ ] No circular dependency issues
- [ ] Logout still works correctly

---

### Step 9: Update Graph Store

**Files:** `src/stores/graphStore.js` (modify)

**Changes:**
- [ ] Verify loadGraph action accepts id parameter for cloud diagrams
- [ ] Add cloudId to state if not present
- [ ] Reset cloudId when loading new diagram

**Validation:**
- [ ] loadGraph works with cloud diagram data
- [ ] No breaking changes to existing functionality

---

### Step 10: Integrate in App.jsx

**Files:** `src/App.jsx` (modify)

**Changes:**
- [ ] Import useTrackChanges hook
- [ ] Import ModeIndicator, CloudDiagramsPanel, SaveCloudButton components
- [ ] Add useTrackChanges() hook call
- [ ] Add ModeIndicator component
- [ ] Add CloudDiagramsPanel component
- [ ] Add SaveCloudButton component

**Validation:**
- [ ] App compiles without errors
- [ ] All new components render correctly
- [ ] Dev server starts successfully

---

### Step 11: Manual Integration Testing

**Files:** None (testing only)

**Changes:**
- [ ] Test unauthenticated flow (Local Mode indicator, no cloud panel)
- [ ] Test sign in flow (Cloud Sync indicator, panel appears)
- [ ] Test save new diagram to cloud
- [ ] Test load diagram from cloud
- [ ] Test unsaved changes indicator
- [ ] Test delete diagram from cloud
- [ ] Test sign out (cloud state cleared)

**Validation:**
- [ ] All acceptance criteria pass
- [ ] No console errors during testing

---

### Step 12: Commit and Push

**Files:** All modified files

**Changes:**
- [ ] Git add all new and modified files
- [ ] Commit with descriptive message
- [ ] Push to remote

**Validation:**
- [ ] Clean git status after commit
- [ ] Changes visible on remote

## Dependencies

- Backend API (PRP-23) - already deployed
- Zustand (already installed)
- Existing authStore, graphStore
- API URL in src/config/auth.js (already configured)

## Cost Estimate

| Service | Usage Estimate | Monthly Cost |
|---------|----------------|--------------|
| API Gateway | <1K additional requests | $0.00 |
| Lambda | <1K additional invocations | $0.00 |
| DynamoDB | <100 items | $0.00 |
| S3 | <10MB | $0.00 |
| **Total** | | **$0.00** |

**Note:** This is frontend-only work. Backend already deployed in PRP-23.

**Free Tier Eligible:** Yes

## Testing Strategy

### Manual Testing Checklist

- [ ] **Unauthenticated**: Local Mode indicator shown, no cloud panel
- [ ] **Sign in**: Cloud Sync indicator shown, panel appears, list loads
- [ ] **Empty state**: "No diagrams yet" shown when list empty
- [ ] **Create**: Add nodes, save to cloud, appears in list
- [ ] **Load**: Click diagram in list, loads into editor
- [ ] **Unsaved warning**: Make changes, try to load another, see confirm dialog
- [ ] **Update**: Modify loaded diagram, save, verify changes persist
- [ ] **Delete**: Click delete, confirm, diagram removed from list
- [ ] **Current indicator**: Active diagram highlighted in list
- [ ] **Error handling**: Disconnect network, verify errors displayed
- [ ] **Sign out**: Cloud state cleared, shows Local Mode

## Rollback Plan

1. All cloud features are additive - local mode continues to work
2. Remove new imports from App.jsx to disable cloud features
3. No database migrations or breaking changes
4. Can revert to previous commit if needed

## Open Questions

None - the INITIAL spec is comprehensive and the backend API is already deployed and tested.
