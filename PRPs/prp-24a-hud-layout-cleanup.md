# PRP: 24a - HUD Layout Cleanup

> Generated from: `INITIAL/initial-24a-hud-layout-cleanup.md`
> Generated on: 2025-12-27
> Confidence: 9/10

## Summary

Consolidate overlapping HUD elements into a unified header bar. The cloud integration added several new components (DiagramNameEditor, AuthPanel, SaveCloudButton) that now conflict with existing panels (HeaderPanel, ControlsPanel). This cleanup creates a single header row containing logo, diagram name, save button, auth info, and mode indicator.

## Requirements Addressed

1. Fix overlapping UI elements in top corners
2. Create unified header bar with all top-level controls
3. Move Save button from bottom-left to header
4. Integrate mode indicator (CLOUD/LOCAL) into header
5. Adjust other panel positions to avoid header overlap
6. Maintain sci-fi aesthetic throughout

## Technical Approach

Create a new `HeaderBar.jsx` component that consolidates:
- PULSAR logo (from HeaderPanel)
- Editable diagram name (from DiagramNameEditor)
- Save button (from SaveCloudButton)
- User email + Sign Out (from AuthPanel)
- Mode badge CLOUD/LOCAL (from AuthPanel)

Remove or simplify:
- `HeaderPanel.jsx` - delete (logo moves to HeaderBar)
- `DiagramNameEditor.jsx` - delete (functionality in HeaderBar)
- `SaveCloudButton.jsx` - delete (functionality in HeaderBar)
- `AuthPanel.jsx` - delete (functionality in HeaderBar)

Adjust positions:
- `ControlsPanel.jsx` - move to `top-16` (below header)
- `CloudDiagramsPanel.jsx` - adjust to `top-16`
- `FileControlsPanel.jsx` - adjust to `top-16`

## Implementation Steps

### Step 1: Create HeaderBar Component

**Files:** `src/components/hud/HeaderBar.jsx` (create)

**Changes:**
- [ ] Create unified header bar component with fixed positioning
- [ ] Add PULSAR logo on left side
- [ ] Add editable diagram name input (click to edit)
- [ ] Add SAVE button (shows loading state, yellow when unsaved)
- [ ] Add user email when authenticated
- [ ] Add mode badge (CLOUD cyan / LOCAL gray)
- [ ] Add Sign In / Sign Out link
- [ ] Style with sci-fi aesthetic (bg-black/90, border-b border-cyan-500/30)

**Validation:**
- [ ] File exists and exports HeaderBar
- [ ] No syntax errors

---

### Step 2: Update App.jsx Imports

**Files:** `src/App.jsx` (modify)

**Changes:**
- [ ] Remove AuthPanel import
- [ ] Remove DiagramNameEditor import
- [ ] Remove SaveCloudButton import
- [ ] Add HeaderBar import
- [ ] Replace AuthPanel, DiagramNameEditor, SaveCloudButton with HeaderBar in JSX

**Validation:**
- [ ] App compiles without errors

---

### Step 3: Update HudOverlay

**Files:** `src/components/hud/HudOverlay.jsx` (modify)

**Changes:**
- [ ] Remove HeaderPanel import
- [ ] Remove HeaderPanel from JSX
- [ ] Header is now rendered by HeaderBar in App.jsx

**Validation:**
- [ ] HudOverlay renders without HeaderPanel

---

### Step 4: Adjust ControlsPanel Position

**Files:** `src/components/hud/ControlsPanel.jsx` (modify)

**Changes:**
- [ ] Change position from `top-4` to `top-16` (below header bar)

**Validation:**
- [ ] ControlsPanel doesn't overlap with header

---

### Step 5: Adjust CloudDiagramsPanel Position

**Files:** `src/components/hud/CloudDiagramsPanel.jsx` (modify)

**Changes:**
- [ ] Change position from `top-24` to `top-16` (aligns with ControlsPanel row)

**Validation:**
- [ ] CloudDiagramsPanel doesn't overlap with header

---

### Step 6: Adjust FileControlsPanel Position

**Files:** `src/components/hud/FileControlsPanel.jsx` (modify)

**Changes:**
- [ ] Change position from `top-14` to `top-16` (aligns with other panels)

**Validation:**
- [ ] FileControlsPanel doesn't overlap with header

---

### Step 7: Delete Obsolete Components

**Files:**
- `src/components/hud/HeaderPanel.jsx` (delete)
- `src/components/hud/DiagramNameEditor.jsx` (delete)
- `src/components/hud/SaveCloudButton.jsx` (delete)
- `src/components/hud/AuthPanel.jsx` (delete)

**Changes:**
- [ ] Delete HeaderPanel.jsx
- [ ] Delete DiagramNameEditor.jsx
- [ ] Delete SaveCloudButton.jsx
- [ ] Delete AuthPanel.jsx

**Validation:**
- [ ] Files removed
- [ ] No import errors in remaining code

---

### Step 8: Build and Test

**Files:** None (testing only)

**Changes:**
- [ ] Run npm run build
- [ ] Start dev server
- [ ] Test unauthenticated: LOCAL badge, Sign In link, diagram name editable
- [ ] Test authenticated: CLOUD badge, email shown, Save button works
- [ ] Verify no overlapping elements
- [ ] Verify all panels properly positioned below header

**Validation:**
- [ ] Build passes
- [ ] No visual overlaps
- [ ] All functionality preserved

---

### Step 9: Commit and Push

**Files:** All modified/created/deleted files

**Changes:**
- [ ] Git add all changes
- [ ] Commit with descriptive message
- [ ] Push to remote

**Validation:**
- [ ] Clean git status after commit

## Dependencies

- Existing stores: authStore, cloudStore, graphStore
- Existing utils: auth.js (getLoginUrl, getLogoutUrl)
- No new packages needed

## Cost Estimate

| Service | Usage Estimate | Monthly Cost |
|---------|----------------|--------------|
| N/A | Frontend-only changes | $0.00 |

**Free Tier Eligible:** N/A

## Testing Strategy

### Manual Testing Checklist

- [ ] **Header visible**: Fixed at top, full width
- [ ] **Logo displayed**: PULSAR with glow effect
- [ ] **Diagram name**: Click to edit, Enter to save, Escape to cancel
- [ ] **Save button**: Shows SAVE, SAVING when loading, yellow when unsaved
- [ ] **Unauthenticated**: Sign In link, LOCAL badge (gray)
- [ ] **Authenticated**: Email shown, Sign Out link, CLOUD badge (cyan)
- [ ] **Unsaved indicator**: (unsaved) text appears when changes pending
- [ ] **ControlsPanel**: Below header, no overlap
- [ ] **CloudDiagramsPanel**: Below header, no overlap
- [ ] **FileControlsPanel**: Below header, no overlap
- [ ] **StatsPanel**: Unchanged position (bottom-right)

## Rollback Plan

1. Revert git commit
2. Restore deleted files from git history
3. All changes are additive UI reorganization - no data migrations

## Open Questions

None - the INITIAL spec is clear and the current component structure is well understood. This is a straightforward UI consolidation task.
