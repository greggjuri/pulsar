# PRP: 09 - localStorage Persistence

> Generated from: `INITIAL/initial-09-localstorage-persistence.md`
> Generated on: 2025-12-24
> Confidence: 9/10

## Summary

Implement automatic localStorage persistence for Pulsar diagrams. The graph state is saved on every change (debounced) and restored on app load. Adds a "New" button to start fresh diagrams. This completes Phase 3 (Data Management).

## Requirements Addressed

1. Auto-save to localStorage on every graph change (debounced 500ms)
2. Auto-load saved diagram on app startup
3. "New" button to start a fresh diagram with confirmation
4. Graceful handling of storage errors and corrupted data
5. Works in incognito mode (graceful degradation)

## Technical Approach

### Architecture

- **Utility-based**: Storage operations in `src/utils/storage.js`
- **Hook-based**: Auto-save logic in `src/hooks/useAutoSave.js`
- **Store initialization**: Check localStorage before falling back to test data
- **No new dependencies**: Custom debounce using `useRef` and `setTimeout`

### Key Files

1. `src/utils/storage.js` - localStorage helpers (save, load, clear, isAvailable)
2. `src/hooks/useAutoSave.js` - Debounced auto-save hook
3. `src/stores/graphStore.js` - Initialize from localStorage
4. `src/components/hud/FileControlsPanel.jsx` - Add "New" button

## Implementation Steps

### Step 1: Create Storage Utilities
**Files:** `src/utils/storage.js` (NEW)

**Changes:**
- [ ] Export `STORAGE_KEY = 'pulsar-diagram-autosave'`
- [ ] Create `saveToLocalStorage(graph)` - returns boolean success
- [ ] Create `loadFromLocalStorage()` - returns parsed data or null
- [ ] Create `clearLocalStorage()` - removes the key
- [ ] Create `isLocalStorageAvailable()` - tests if localStorage works

**Validation:**
- [ ] Functions handle errors gracefully without throwing
- [ ] Works in environments where localStorage is unavailable

### Step 2: Create useAutoSave Hook
**Files:** `src/hooks/useAutoSave.js` (NEW)

**Changes:**
- [ ] Subscribe to nodes, edges, diagramName from store
- [ ] Debounce saves with 500ms delay using useRef/setTimeout
- [ ] Serialize graph before saving
- [ ] Skip save if localStorage unavailable

**Validation:**
- [ ] Changes trigger save after 500ms debounce
- [ ] Rapid changes don't cause multiple saves

### Step 3: Modify graphStore Initialization
**Files:** `src/stores/graphStore.js` (MODIFY)

**Changes:**
- [ ] Import loadFromLocalStorage and validateGraph
- [ ] Create `getInitialState()` function
- [ ] Check localStorage for saved graph
- [ ] Validate saved data before using
- [ ] Fall back to testNodes/testEdges if invalid or missing

**Validation:**
- [ ] App loads saved diagram on refresh
- [ ] Corrupted data falls back gracefully

### Step 4: Add "New" Button to FileControlsPanel
**Files:** `src/components/hud/FileControlsPanel.jsx` (MODIFY)

**Changes:**
- [ ] Import clearLocalStorage from storage.js
- [ ] Import triggerReset from store
- [ ] Add handleNew function with confirmation dialog
- [ ] Clear localStorage on confirm
- [ ] Load empty graph (nodes: [], edges: [])
- [ ] Reset camera to default position
- [ ] Add "NEW" button before Export button with same styling

**Validation:**
- [ ] "New" button visible and styled correctly
- [ ] Confirmation dialog appears
- [ ] Diagram clears on confirm, localStorage cleared
- [ ] Camera resets to default

### Step 5: Integrate useAutoSave in App
**Files:** `src/App.jsx` (MODIFY)

**Changes:**
- [ ] Import and call useAutoSave hook

**Validation:**
- [ ] Auto-save triggers on node drag
- [ ] Auto-save triggers on import
- [ ] Refreshing page restores state

### Step 6: Test Edge Cases
**Files:** N/A (manual testing)

**Changes:**
- [ ] Test drag node → refresh → position preserved
- [ ] Test import → refresh → imported graph preserved
- [ ] Test "New" → refresh → empty diagram
- [ ] Test corrupted localStorage → app doesn't crash
- [ ] Test incognito mode → no errors

**Validation:**
- [ ] All scenarios work correctly

### Step 7: Update Documentation
**Files:** `docs/TASK.md` (MODIFY)

**Changes:**
- [ ] Mark PRP-09 as complete
- [ ] Add session notes
- [ ] Commit and push

**Validation:**
- [ ] Documentation updated, changes committed

## Dependencies

**No new packages required.**

Uses:
- `localStorage` API
- Existing `serializeGraph` and `validateGraph` from graphSchema.js
- Custom debounce implementation (no external library)

## Cost Estimate

| Service | Usage Estimate | Monthly Cost |
|---------|----------------|--------------|
| N/A | Client-side only | $0.00 |

**Free Tier Eligible:** Yes (no AWS services)

## Testing Strategy

- [ ] Auto-save: Make changes, refresh page, verify state restored
- [ ] Drag node: Drag a node, refresh, verify new position persisted
- [ ] Import then refresh: Import a file, refresh, verify imported state
- [ ] New then refresh: Click New, refresh, verify empty diagram
- [ ] Corrupted data: Manually corrupt localStorage, refresh, verify fallback
- [ ] Rapid changes: Drag quickly, verify no excessive saves (check console)

## Rollback Plan

If issues arise:
1. Remove useAutoSave call from App.jsx
2. Revert graphStore to use testData directly
3. Remove "New" button from FileControlsPanel
4. Delete storage.js and useAutoSave.js

## Open Questions

None - the INITIAL spec is comprehensive with code examples.
