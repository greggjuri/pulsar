# PRP: 12 - Context Menu & Edge Management

> Generated from: `INITIAL/initial-12-context-menu-edge-management.md`
> Generated on: 2025-12-24
> Confidence: 8/10

## Summary

Implement a reusable context menu system and edge management capabilities. This includes right-click menus on nodes/edges, edge selection with visual feedback, edge deletion, and edge creation via "Connect to..." flow.

## Requirements Addressed

1. Context Menu System - Reusable right-click menu component
2. Edge Selection - Click edges to select with visual feedback
3. Edge Deletion - DEL key or context menu
4. Edge Creation - "Connect to..." flow from node context menu
5. EdgeInfoPanel - Display selected edge details

## Technical Approach

### Architecture

- **Store extensions**: Add `selectedEdgeId`, `connectingFromNodeId`, edge actions
- **ContextMenu component**: Reusable HUD component for right-click menus
- **EdgeInfoPanel component**: Similar to NodeInfoPanel for edges
- **Edge3D modifications**: Add click detection via TubeGeometry, selection visuals
- **Node3D modifications**: Add right-click handler, connecting mode visuals

### Key Changes

1. `src/stores/graphStore.js` - Add edge selection, connecting mode, edge actions
2. `src/components/hud/ContextMenu.jsx` - New reusable context menu
3. `src/components/hud/EdgeInfoPanel.jsx` - New edge details panel
4. `src/components/canvas/Edge3D.jsx` - Add click handling, selection visuals
5. `src/components/canvas/Node3D.jsx` - Add right-click handler
6. `src/components/hud/HudOverlay.jsx` - Add ContextMenu and EdgeInfoPanel
7. `src/components/hud/ControlsPanel.jsx` - Add connecting mode hint
8. `src/App.jsx` - Extend keyboard handler for edge deletion

## Implementation Steps

### Step 1: Extend graphStore with Edge Actions
**Files:** `src/stores/graphStore.js` (MODIFY)

**Changes:**
- [ ] Add `selectedEdgeId: null` state
- [ ] Add `connectingFromNodeId: null` state
- [ ] Add `selectEdge(id)` - sets selectedEdgeId, clears selectedNodeId
- [ ] Modify `clearSelection()` - clears both node and edge selection
- [ ] Add `deleteEdge(id)` - removes edge from array
- [ ] Add `startConnecting(nodeId)` - enters connecting mode
- [ ] Add `cancelConnecting()` - exits connecting mode
- [ ] Add `addEdge(source, target)` - creates edge with validation

**Validation:**
- [ ] Edge selection works
- [ ] Edge deletion works
- [ ] Edge creation with validation works

### Step 2: Create ContextMenu Component
**Files:** `src/components/hud/ContextMenu.jsx` (NEW)

**Changes:**
- [ ] Create component with x, y, items, onClose props
- [ ] Position at cursor coordinates (fixed position)
- [ ] Close on outside click (useEffect with window listener)
- [ ] Close on Escape key
- [ ] Style with dark background, cyan accents
- [ ] Stop propagation on menu click

**Validation:**
- [ ] Menu appears at cursor position
- [ ] Closes on outside click
- [ ] Closes on Escape

### Step 3: Create EdgeInfoPanel Component
**Files:** `src/components/hud/EdgeInfoPanel.jsx` (NEW)

**Changes:**
- [ ] Create panel similar to NodeInfoPanel
- [ ] Display source node label, target node label
- [ ] Display style (SOLID/DASHED), animated status
- [ ] Close button clears selection
- [ ] Style matching NodeInfoPanel

**Validation:**
- [ ] Panel appears when edge selected
- [ ] Shows correct edge details
- [ ] Close button works

### Step 4: Modify Edge3D for Selection and Click
**Files:** `src/components/canvas/Edge3D.jsx` (MODIFY)

**Changes:**
- [ ] Add props: isSelected, onSelect, onContextMenu
- [ ] Add invisible TubeGeometry for click detection
- [ ] Add click handler to call onSelect
- [ ] Add right-click handler for context menu
- [ ] Visual feedback for selected state (brighter line, thicker or glow)

**Validation:**
- [ ] Clicking edge selects it
- [ ] Right-click triggers context menu event
- [ ] Selected edge has visual highlight

### Step 5: Modify EdgeGroup for Selection State
**Files:** `src/components/canvas/EdgeGroup.jsx` (MODIFY)

**Changes:**
- [ ] Subscribe to selectedEdgeId from store
- [ ] Subscribe to selectEdge action
- [ ] Pass isSelected and onSelect to Edge3D
- [ ] Pass onContextMenu to Edge3D

**Validation:**
- [ ] Edge selection state flows correctly

### Step 6: Modify Node3D for Context Menu
**Files:** `src/components/canvas/Node3D.jsx` (MODIFY)

**Changes:**
- [ ] Add onContextMenu prop
- [ ] Add right-click handler (onContextMenu event)
- [ ] Add isConnectingSource prop for visual feedback
- [ ] Visual feedback when node is connecting source (pulsing effect)

**Validation:**
- [ ] Right-click on node triggers context menu event
- [ ] Connecting source node has pulsing visual

### Step 7: Modify NodeGroup for Context Menu and Connecting Mode
**Files:** `src/components/canvas/NodeGroup.jsx` (MODIFY)

**Changes:**
- [ ] Subscribe to connectingFromNodeId from store
- [ ] Subscribe to addEdge action
- [ ] Pass onContextMenu to Node3D
- [ ] Pass isConnectingSource to Node3D
- [ ] When in connecting mode, clicking node calls addEdge

**Validation:**
- [ ] Context menu handler wired correctly
- [ ] Clicking node in connecting mode creates edge

### Step 8: Integrate Context Menu and Panels in HudOverlay
**Files:** `src/components/hud/HudOverlay.jsx` (MODIFY)

**Changes:**
- [ ] Add state for context menu (position, items, visible)
- [ ] Import and render ContextMenu when visible
- [ ] Import and render EdgeInfoPanel when edge selected
- [ ] Wire up context menu handlers from canvas events

**Validation:**
- [ ] Context menu appears on right-click
- [ ] EdgeInfoPanel appears when edge selected

### Step 9: Add Connecting Mode Hint to ControlsPanel
**Files:** `src/components/hud/ControlsPanel.jsx` (MODIFY)

**Changes:**
- [ ] Subscribe to connectingFromNodeId from store
- [ ] Show "CONNECTING" section when in connecting mode
- [ ] Display "Click target node" and "ESC to cancel" hints

**Validation:**
- [ ] Hint visible when in connecting mode
- [ ] Hint hidden when not connecting

### Step 10: Extend App.jsx Keyboard Handler
**Files:** `src/App.jsx` (MODIFY)

**Changes:**
- [ ] Subscribe to selectedEdgeId from store
- [ ] Subscribe to deleteEdge and cancelConnecting from store
- [ ] DEL key deletes selected edge
- [ ] ESC key cancels connecting mode
- [ ] Modify clearSelection to also cancel connecting

**Validation:**
- [ ] DEL deletes selected edge
- [ ] ESC cancels connecting mode

### Step 11: Test Edge Cases
**Files:** N/A (manual testing)

**Changes:**
- [ ] Test edge selection and deselection
- [ ] Test edge deletion via DEL and context menu
- [ ] Test edge creation via Connect to...
- [ ] Test cannot connect to self
- [ ] Test cannot create duplicate edge
- [ ] Test ESC cancels connecting
- [ ] Test context menu positioning near edges

**Validation:**
- [ ] All scenarios work correctly

### Step 12: Update Documentation
**Files:** `docs/TASK.md` (MODIFY)

**Changes:**
- [ ] Mark PRP-12 as complete
- [ ] Add session notes
- [ ] Commit and push

**Validation:**
- [ ] Documentation updated, changes committed

## Dependencies

**No new packages required.**

Uses:
- Existing graphStore infrastructure
- TubeGeometry from Three.js for edge click detection
- Existing NodeInfoPanel as pattern for EdgeInfoPanel

## Cost Estimate

| Service | Usage Estimate | Monthly Cost |
|---------|----------------|--------------|
| N/A | Client-side only | $0.00 |

**Free Tier Eligible:** Yes (no AWS services)

## Testing Strategy

- [ ] Right-click node shows context menu
- [ ] Right-click edge shows context menu
- [ ] Context menu closes on action/outside click/Escape
- [ ] Clicking edge selects it (visual feedback)
- [ ] EdgeInfoPanel shows correct source/target
- [ ] DEL key deletes selected edge
- [ ] Context menu Delete deletes edge
- [ ] Connect to... enters connecting mode
- [ ] Clicking node creates edge
- [ ] Cannot connect node to itself
- [ ] Cannot create duplicate edge
- [ ] ESC/background click cancels connecting
- [ ] Stats panel updates after edge changes
- [ ] Auto-save triggers after edge changes

## Rollback Plan

If issues arise:
1. Revert graphStore edge additions
2. Remove ContextMenu and EdgeInfoPanel components
3. Revert Edge3D and Node3D changes
4. Revert HudOverlay and ControlsPanel changes
5. Revert App.jsx keyboard handler changes

## Open Questions

1. **Edge click sensitivity** - TubeGeometry with radius 0.15 should work, but may need tuning
2. **Context menu overflow** - Should handle viewport edge cases (menu near screen edge)

These are implementation details that can be addressed during development.
