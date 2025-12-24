# PRP: 05 - Node Selection

> Generated from: `INITIAL/initial-05-node-selection.md`
> Generated on: 2024-12-23
> Confidence: 8/10

## Summary

Implement click-to-select functionality for nodes using Zustand for state management. Selected nodes show enhanced visual feedback (highlight ring, brightness boost, scale pulse). A NodeInfoPanel appears in the HUD showing selected node details. Clicking empty space or pressing Escape clears selection.

## Requirements Addressed

1. Create Zustand `graphStore` with nodes, edges, selectedNodeId, and actions
2. Click detection that distinguishes clicks from drags (OrbitControls compatibility)
3. Visual feedback: highlight ring, brightness boost, scale pulse on selection
4. NodeInfoPanel in bottom-left showing node details
5. Clear selection on background click or Escape key
6. Maintain 60fps with selection effects

## Technical Approach

### Zustand Store
- Create `graphStore` with nodes, edges, selectedNodeId
- Actions: selectNode(id), clearSelection()
- Initialize with existing testNodes/testEdges data

### Click vs Drag Detection
- Track pointer position on pointerDown
- Compare position on pointerUp
- If distance < 5px, treat as click (not drag)
- Use `e.stopPropagation()` to prevent canvas click from firing

### Selection Visual Effects
- Highlight ring: third torus, thicker (0.04), brighter, faster rotation
- Brightness boost: increase core opacity from 0.9 → 1.0, glow from 0.2 → 0.4
- Scale pulse: use spring animation or manual lerp in useFrame

### Background Click
- Canvas `onPointerMissed` fires when clicking empty space
- Use this to call clearSelection()

## Implementation Steps

### Step 1: Consolidate Test Data
**Files:** `src/data/testData.js`
**Changes:**
- [ ] Create new file combining testNodes and testEdges
- [ ] Add `type` field to nodes (derive from id or default to 'service')
- [ ] Export both arrays

**Validation:**
- [ ] File exports testNodes and testEdges with type field

---

### Step 2: Create Zustand Store
**Files:** `src/stores/graphStore.js`
**Changes:**
- [ ] Create store with initial state from testData
- [ ] Add selectNode action
- [ ] Add clearSelection action
- [ ] Export useGraphStore hook

**Validation:**
- [ ] Store can be imported and used
- [ ] Actions update state correctly

---

### Step 3: Update Node3D for Selection
**Files:** `src/components/canvas/Node3D.jsx`
**Changes:**
- [ ] Add `isSelected` and `onSelect` props
- [ ] Add pointerDown/pointerUp handlers with click vs drag detection
- [ ] Add highlight ring (only visible when selected)
- [ ] Increase core/glow opacity when selected
- [ ] Add scale pulse animation on selection (useRef + useFrame)

**Validation:**
- [ ] Node responds to clicks
- [ ] Dragging to orbit doesn't trigger selection
- [ ] Selected node shows highlight ring
- [ ] Selected node is brighter
- [ ] Scale pulse plays on selection

---

### Step 4: Update NodeGroup for Store Integration
**Files:** `src/components/canvas/NodeGroup.jsx`
**Changes:**
- [ ] Import useGraphStore
- [ ] Get nodes and selectedNodeId from store
- [ ] Pass isSelected and onSelect to each Node3D
- [ ] Wire up selectNode action

**Validation:**
- [ ] Clicking node updates selectedNodeId in store
- [ ] Correct node shows as selected

---

### Step 5: Update EdgeGroup for Store Integration
**Files:** `src/components/canvas/EdgeGroup.jsx`
**Changes:**
- [ ] Import useGraphStore
- [ ] Get edges and nodes from store instead of props

**Validation:**
- [ ] Edges still render correctly

---

### Step 6: Create NodeInfoPanel Component
**Files:** `src/components/hud/NodeInfoPanel.jsx`
**Changes:**
- [ ] Create component matching POC styling
- [ ] Accept `node` and `onClose` props
- [ ] Display: label (with glow), type, id, status
- [ ] Close button (×) calls onClose
- [ ] Add enter/exit animation (CSS transition or Tailwind)

**Validation:**
- [ ] Panel renders with correct styling
- [ ] Close button works
- [ ] Animation plays on enter/exit

---

### Step 7: Update HudOverlay for Selection
**Files:** `src/components/hud/HudOverlay.jsx`
**Changes:**
- [ ] Import useGraphStore
- [ ] Get nodes, edges, selectedNodeId, clearSelection from store
- [ ] Find selected node by id
- [ ] Conditionally render NodeInfoPanel when node selected
- [ ] Pass nodeCount/edgeCount from store to StatsPanel

**Validation:**
- [ ] NodeInfoPanel appears when node selected
- [ ] NodeInfoPanel disappears when selection cleared
- [ ] Stats still show correct counts

---

### Step 8: Update App for Background Click & Escape
**Files:** `src/App.jsx`
**Changes:**
- [ ] Import useGraphStore
- [ ] Add onPointerMissed to Canvas to clear selection
- [ ] Add useEffect for Escape key listener
- [ ] Remove testNodes/testEdges props (now from store)

**Validation:**
- [ ] Clicking empty space clears selection
- [ ] Pressing Escape clears selection
- [ ] OrbitControls still work

---

### Step 9: Update HUD Index Export
**Files:** `src/components/hud/index.js`
**Changes:**
- [ ] Add NodeInfoPanel export

**Validation:**
- [ ] Clean import available

---

### Step 10: Cleanup Old Data Files
**Files:** `src/data/testNodes.js`, `src/data/testEdges.js`
**Changes:**
- [ ] Delete old separate files (data now in testData.js)

**Validation:**
- [ ] No import errors
- [ ] App still works

---

### Step 11: Update Documentation
**Files:** `docs/TASK.md`, `docs/DECISIONS.md`
**Changes:**
- [ ] Mark PRP-05 as complete
- [ ] Add session notes
- [ ] Add DECISION-011 for Zustand store pattern

**Validation:**
- [ ] TASK.md reflects completed work
- [ ] Git commit and push

## Dependencies

Zustand already installed (v5.0.9). No new packages needed.

Existing code this depends on:
- Node3D component (will be modified)
- NodeGroup component (will be modified)
- EdgeGroup component (will be modified)
- HudOverlay component (will be modified)
- testNodes and testEdges data

## Testing Strategy

- [ ] Visual: Click node → node shows highlight ring + brightness
- [ ] Visual: Scale pulse animation plays on selection
- [ ] Visual: NodeInfoPanel appears bottom-left with correct data
- [ ] Visual: NodeInfoPanel × button clears selection
- [ ] Interaction: Drag to rotate does NOT select nodes
- [ ] Interaction: Click empty space clears selection
- [ ] Interaction: Escape key clears selection
- [ ] Interaction: OrbitControls still work (drag, zoom, pan)
- [ ] Performance: 60fps maintained with selection active
- [ ] Console: No errors or warnings

## Rollback Plan

If issues arise:
1. Revert graphStore usage in components
2. Restore prop-based data passing
3. Remove NodeInfoPanel from HudOverlay
4. Git revert to previous commit

## Open Questions

1. **Scale pulse implementation**: Use Three.js spring/lerp in useFrame, or CSS transform?
   - Recommendation: useFrame with manual lerp for smooth 3D integration

2. **Animation library**: Should we add `@react-spring/three` for smoother animations?
   - Recommendation: Start simple with useFrame, add library later if needed

## Code Patterns

### Store Usage (with selectors for performance)
```javascript
// Read specific state
const selectedNodeId = useGraphStore((s) => s.selectedNodeId);

// Read action
const selectNode = useGraphStore((s) => s.selectNode);
```

### Click vs Drag Detection
```javascript
const pointerDownPos = useRef(null);

const handlePointerDown = (e) => {
  pointerDownPos.current = { x: e.clientX, y: e.clientY };
};

const handlePointerUp = (e) => {
  if (!pointerDownPos.current) return;
  const dx = e.clientX - pointerDownPos.current.x;
  const dy = e.clientY - pointerDownPos.current.y;
  if (Math.sqrt(dx * dx + dy * dy) < 5) {
    onSelect();
    e.stopPropagation();
  }
  pointerDownPos.current = null;
};
```

## Visual Reference

Highlight ring: Third torus, radius 0.9, thickness 0.04, cyan color, opacity 0.8, rotates faster

NodeInfoPanel from POC:
```jsx
<div className="absolute bottom-4 left-4 bg-black/70 border border-cyan-500/50 rounded-lg p-4 backdrop-blur-sm min-w-64">
  {/* Label with glow */}
  {/* Close button */}
  {/* Type, ID, Status rows */}
</div>
```
