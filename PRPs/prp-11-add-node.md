# PRP: 11 - Add Node

> Generated from: `INITIAL/initial-11-add-node.md`
> Generated on: 2025-12-24
> Confidence: 10/10

## Summary

Implement the ability to add new nodes via a "+ NODE" button. New nodes are created with default properties, positioned to avoid overlap with existing nodes, and automatically selected. This continues Phase 4 (Editor).

## Requirements Addressed

1. Add "+ NODE" button to FileControlsPanel
2. Create `addNode()` action in graphStore
3. Smart positioning to avoid overlapping existing nodes
4. Auto-select new node after creation
5. Auto-save triggers automatically (via existing useAutoSave)

## Technical Approach

### Architecture

- **Store action**: Add `addNode()` that creates node with calculated position
- **Position calculation**: Place new node to the right of existing nodes
- **Auto-selection**: Set `selectedNodeId` to new node's ID
- **HUD button**: Add button to FileControlsPanel

### Key Changes

1. `src/stores/graphStore.js` - Add `addNode` action with position calculation
2. `src/components/hud/FileControlsPanel.jsx` - Add "+ NODE" button

## Implementation Steps

### Step 1: Add addNode Action to graphStore
**Files:** `src/stores/graphStore.js` (MODIFY)

**Changes:**
- [ ] Import MIN_NODE_DISTANCE from collision.js
- [ ] Add `calculateNewNodePosition(nodes)` helper function
- [ ] Add `addNode: () => void` action
- [ ] Generate unique ID using timestamp
- [ ] Create node with type 'service', label 'New Node', cyan color
- [ ] Auto-select the new node

**Validation:**
- [ ] addNode creates a new node
- [ ] New node has unique ID
- [ ] New node is positioned to avoid overlap
- [ ] New node is auto-selected

### Step 2: Add "+ NODE" Button to FileControlsPanel
**Files:** `src/components/hud/FileControlsPanel.jsx` (MODIFY)

**Changes:**
- [ ] Import addNode from store
- [ ] Add handleAddNode function
- [ ] Add "+ NODE" button after "+ NEW" button
- [ ] Style matching existing buttons

**Validation:**
- [ ] Button visible in panel
- [ ] Clicking button creates new node
- [ ] NodeInfoPanel appears showing new node

### Step 3: Test Edge Cases
**Files:** N/A (manual testing)

**Changes:**
- [ ] Test add node to empty diagram (places at origin)
- [ ] Test add multiple nodes (positions spaced correctly)
- [ ] Test rapid node additions (no ID conflicts)
- [ ] Test auto-save triggers after add

**Validation:**
- [ ] All scenarios work correctly

### Step 4: Update Documentation
**Files:** `docs/TASK.md` (MODIFY)

**Changes:**
- [ ] Mark PRP-11 as complete
- [ ] Add session notes
- [ ] Commit and push

**Validation:**
- [ ] Documentation updated, changes committed

## Dependencies

**No new packages required.**

Uses:
- Existing MIN_NODE_DISTANCE from collision.js
- Existing graphStore infrastructure
- Existing useAutoSave hook

## Cost Estimate

| Service | Usage Estimate | Monthly Cost |
|---------|----------------|--------------|
| N/A | Client-side only | $0.00 |

**Free Tier Eligible:** Yes (no AWS services)

## Testing Strategy

- [ ] "+ NODE" button appears in FileControlsPanel
- [ ] Clicking button creates new node with unique ID
- [ ] New node has type 'service', label 'New Node', cyan color
- [ ] New node positioned to avoid existing nodes
- [ ] New node auto-selected (NodeInfoPanel shows)
- [ ] Stats panel updates node count
- [ ] Auto-save triggers after add
- [ ] Empty diagram: node placed at origin
- [ ] Multiple nodes: spaced correctly to the right

## Rollback Plan

If issues arise:
1. Remove addNode action from graphStore
2. Remove "+ NODE" button from FileControlsPanel

## Open Questions

None - the INITIAL spec is clear and implementation is straightforward.
