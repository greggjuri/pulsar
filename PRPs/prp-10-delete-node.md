# PRP: 10 - Delete Node

> Generated from: `INITIAL/initial-10-delete-node.md`
> Generated on: 2024-12-24
> Confidence: 10/10

## Summary

Implement node deletion via keyboard (Delete/Backspace keys). When a node is deleted, all connected edges are automatically removed. This is the first Phase 4 (Editor) feature.

## Requirements Addressed

1. Delete selected node with Delete or Backspace key
2. Cascade delete connected edges when node is removed
3. Clear selection after deletion
4. Update ControlsPanel to show "SELECTED" section with hints
5. Prevent browser back navigation on Backspace
6. Handle empty diagram gracefully

## Technical Approach

### Architecture

- **Store action**: Add `deleteNode(id)` that removes node and connected edges atomically
- **Keyboard handler**: Extend existing `handleKeyDown` in App.jsx
- **HUD update**: Add conditional "SELECTED" section to ControlsPanel

### Key Changes

1. `src/stores/graphStore.js` - Add `deleteNode` action
2. `src/App.jsx` - Add Delete/Backspace to keyboard handler
3. `src/components/hud/ControlsPanel.jsx` - Add conditional selected hints

## Implementation Steps

### Step 1: Add deleteNode Action to graphStore
**Files:** `src/stores/graphStore.js` (MODIFY)

**Changes:**
- [ ] Add `deleteNode: (id) => void` action
- [ ] Remove node from nodes array
- [ ] Remove edges where source or target matches id
- [ ] Clear selection if deleted node was selected

**Validation:**
- [ ] deleteNode removes the node
- [ ] deleteNode removes connected edges
- [ ] Selection is cleared

### Step 2: Add Delete Keyboard Shortcut to App.jsx
**Files:** `src/App.jsx` (MODIFY)

**Changes:**
- [ ] Import selectedNodeId from store
- [ ] Import deleteNode from store
- [ ] Add Delete/Backspace handler to existing useEffect
- [ ] Call e.preventDefault() for Backspace to prevent browser back
- [ ] Add selectedNodeId and deleteNode to useEffect dependencies

**Validation:**
- [ ] Delete key removes selected node
- [ ] Backspace key removes selected node
- [ ] Backspace doesn't trigger browser navigation
- [ ] No action when no node selected

### Step 3: Update ControlsPanel with Selected Hints
**Files:** `src/components/hud/ControlsPanel.jsx` (MODIFY)

**Changes:**
- [ ] Import selectedNodeId from store
- [ ] Add conditional "SELECTED" section when node is selected
- [ ] Show "DEL to delete" and "ESC to deselect" hints
- [ ] Style with separator border matching existing design

**Validation:**
- [ ] Hints hidden when no node selected
- [ ] Hints visible when node selected
- [ ] Styling consistent with panel

### Step 4: Test Edge Cases
**Files:** N/A (manual testing)

**Changes:**
- [ ] Test delete with single node
- [ ] Test delete with connected edges (verify cascade)
- [ ] Test delete all nodes (empty diagram works)
- [ ] Test camera fit/reset with 0 nodes
- [ ] Test auto-save triggers after delete

**Validation:**
- [ ] All scenarios work correctly

### Step 5: Update Documentation
**Files:** `docs/TASK.md` (MODIFY)

**Changes:**
- [ ] Mark PRP-10 as complete
- [ ] Add session notes
- [ ] Commit and push

**Validation:**
- [ ] Documentation updated, changes committed

## Dependencies

**No new packages required.**

Uses:
- Existing graphStore infrastructure
- Existing keyboard handler pattern in App.jsx
- Existing useAutoSave hook (auto-saves on node/edge changes)

## Cost Estimate

| Service | Usage Estimate | Monthly Cost |
|---------|----------------|--------------|
| N/A | Client-side only | $0.00 |

**Free Tier Eligible:** Yes (no AWS services)

## Testing Strategy

- [ ] Delete key removes selected node
- [ ] Backspace key removes selected node (no browser back)
- [ ] Connected edges removed when node deleted
- [ ] Selection cleared after delete
- [ ] NodeInfoPanel disappears after delete
- [ ] Stats panel updates (node/edge counts)
- [ ] Auto-save triggers after deletion
- [ ] ControlsPanel shows SELECTED hints when node selected
- [ ] Camera fit/reset work with 0 nodes
- [ ] Delete with no selection does nothing

## Rollback Plan

If issues arise:
1. Remove deleteNode action from graphStore
2. Remove Delete/Backspace handler from App.jsx
3. Remove SELECTED section from ControlsPanel

## Open Questions

None - the INITIAL spec is clear and implementation is straightforward.
