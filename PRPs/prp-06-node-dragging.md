# PRP: 06 - Node Dragging

> Generated from: `INITIAL/initial-06-node-dragging.md`
> Generated on: 2025-12-24
> Confidence: 8/10

## Summary

Implement drag-to-reposition functionality for selected nodes. Only selected nodes can be dragged (select-then-drag pattern). Dragging moves the node along a plane perpendicular to the camera view. Includes collision detection (minimum 2.0 unit distance) with visual feedback (red color) and snap-back on invalid release. OrbitControls are disabled during node drag.

## Requirements Addressed

1. Select-then-drag pattern: must click to select before dragging
2. Node moves along camera-perpendicular plane for intuitive feel
3. Real-time position updates so edges follow the dragged node
4. Collision detection with 2.0 unit minimum distance
5. Red visual feedback when in collision state
6. Snap-back to original position on invalid release
7. OrbitControls disabled during node drag
8. Cursor states: grab/grabbing for selected nodes
9. 60fps maintained during drag operations

## Technical Approach

### Store Changes
Add to graphStore:
- `updateNodePosition(id, position)` - Updates node position in real-time
- `draggingNodeId` - Tracks which node is being dragged (null when none)
- `setDraggingNode(id)` / `clearDraggingNode()` - Actions for drag state

### Drag Plane Calculation
Use Three.js `Plane` class to create a plane perpendicular to camera view:
```javascript
const planeNormal = new Vector3();
camera.getWorldDirection(planeNormal);
dragPlane.setFromNormalAndCoplanarPoint(planeNormal, nodePosition);
```

Then use raycaster to find intersection with plane during drag.

### Collision Detection
Simple distance check between dragged node and all other nodes:
```javascript
const checkCollision = (draggedId, newPos, nodes) => {
  for (const node of nodes) {
    if (node.id === draggedId) continue;
    const dist = distance3D(newPos, node.position);
    if (dist < MIN_NODE_DISTANCE) return true;
  }
  return false;
};
```

### OrbitControls Integration
Pass `draggingNodeId` to OrbitControls' `enabled` prop:
```jsx
<OrbitControls enabled={!draggingNodeId} />
```

### Edge Updates
EdgeGroup already uses `useMemo` on `nodes` array. When `updateNodePosition` creates a new nodes array, EdgeGroup will re-compute positions and edges will update automatically.

## Implementation Steps

### Step 1: Add Store Actions for Dragging
**Files:** `src/stores/graphStore.js`
**Changes:**
- [ ] Add `updateNodePosition: (id, position) => void` action
- [ ] Add `draggingNodeId: null` state
- [ ] Add `setDraggingNode: (id) => void` action
- [ ] Add `clearDraggingNode: () => void` action

**Validation:**
- [ ] Store actions can be called from console/devtools
- [ ] `updateNodePosition` correctly updates node in array

---

### Step 2: Create useDrag Hook
**Files:** `src/hooks/useDrag.js` (NEW)
**Changes:**
- [ ] Create hook that handles drag plane calculation
- [ ] Use `useThree` to access camera, raycaster, pointer
- [ ] Export `startDrag(nodePosition)` and `updateDrag()` functions
- [ ] Return intersection point on drag plane

**Validation:**
- [ ] Hook can be imported and used
- [ ] Drag plane correctly perpendicular to camera

---

### Step 3: Add Collision Detection Utility
**Files:** `src/utils/collision.js` (NEW)
**Changes:**
- [ ] Export `MIN_NODE_DISTANCE = 2.0` constant
- [ ] Export `checkCollision(draggedId, newPosition, nodes)` function
- [ ] Returns true if any node within MIN_NODE_DISTANCE

**Validation:**
- [ ] Function correctly detects collisions
- [ ] Function ignores the dragged node itself

---

### Step 4: Update Node3D for Drag Handling
**Files:** `src/components/canvas/Node3D.jsx`
**Changes:**
- [ ] Add new props: `onDragStart`, `onDrag`, `onDragEnd`, `allNodes`
- [ ] Add internal state: `isDragging`, `hasCollision`, `originalPosition`
- [ ] Modify `handlePointerDown` to initiate drag for selected nodes
- [ ] Add `handlePointerMove` for drag updates (use useDrag hook)
- [ ] Modify `handlePointerUp` to handle snap-back on collision
- [ ] Add collision color logic: use red (`#ff4444`) when `hasCollision` is true
- [ ] Add cursor style logic: `grab` on hover for selected, `grabbing` while dragging

**Validation:**
- [ ] Selected node can be dragged
- [ ] Unselected node does not drag (orbits camera instead)
- [ ] Node turns red when within 2.0 units of another
- [ ] Node snaps back on release during collision
- [ ] Cursor changes appropriately

---

### Step 5: Update NodeGroup for Drag Wiring
**Files:** `src/components/canvas/NodeGroup.jsx`
**Changes:**
- [ ] Import store actions: `updateNodePosition`, `setDraggingNode`, `clearDraggingNode`
- [ ] Pass `onDragStart`, `onDrag`, `onDragEnd` callbacks to Node3D
- [ ] Pass `allNodes={nodes}` for collision detection
- [ ] Wire callbacks to store actions

**Validation:**
- [ ] Dragging updates store state
- [ ] `draggingNodeId` is set during drag

---

### Step 6: Update App for OrbitControls Toggle
**Files:** `src/App.jsx`
**Changes:**
- [ ] Import `draggingNodeId` from store
- [ ] Pass `enabled={!draggingNodeId}` to OrbitControls

**Validation:**
- [ ] OrbitControls disabled while dragging node
- [ ] OrbitControls enabled when drag ends
- [ ] Camera can still orbit when dragging empty space

---

### Step 7: Update ControlsPanel Hint
**Files:** `src/components/hud/ControlsPanel.jsx`
**Changes:**
- [ ] Add "Drag selected node to move" hint

**Validation:**
- [ ] New hint visible in controls panel

---

### Step 8: Verify Edge Following
**Files:** None (verification only)
**Changes:**
- [ ] Verify edges update in real-time during drag
- [ ] Verify edges return correctly on snap-back

**Validation:**
- [ ] Edges smoothly follow dragged node
- [ ] No edge glitches or jumps

---

### Step 9: Update Documentation
**Files:** `docs/TASK.md`, `docs/DECISIONS.md`
**Changes:**
- [ ] Mark PRP-06 as complete in TASK.md
- [ ] Add session notes
- [ ] Add DECISION-012 for drag plane approach (camera-perpendicular)

**Validation:**
- [ ] Documentation reflects completed work
- [ ] Git commit and push

## Dependencies

No new packages required. Uses existing:
- Three.js `Plane`, `Vector3`, `Raycaster` classes
- React Three Fiber's `useThree` hook
- Zustand store pattern

Existing code this depends on:
- Node3D component (will be modified)
- NodeGroup component (will be modified)
- graphStore (will be extended)
- App.jsx OrbitControls (will be modified)
- EdgeGroup (no changes, just needs to react to store updates)

## Testing Strategy

- [ ] Visual: Click to select, then drag node → node follows cursor
- [ ] Visual: Edges follow dragged node in real-time
- [ ] Visual: Node turns red when close to another node
- [ ] Visual: Node snaps back when released in collision state
- [ ] Visual: Cursor shows grab/grabbing appropriately
- [ ] Interaction: Dragging unselected node orbits camera (doesn't move node)
- [ ] Interaction: Dragging empty space orbits camera
- [ ] Interaction: OrbitControls work normally when not dragging node
- [ ] Interaction: Works at different zoom levels and camera angles
- [ ] Performance: 60fps maintained during drag
- [ ] Edge case: Fast drag doesn't lose tracking
- [ ] Edge case: Pointer leaving canvas ends drag gracefully
- [ ] Console: No errors or warnings

## Rollback Plan

If issues arise:
1. Remove drag handlers from Node3D
2. Remove drag state from graphStore
3. Restore simple click handling
4. Remove useDrag hook
5. Git revert to previous commit

## Open Questions

1. **Should bobbing animation pause during drag?**
   - Recommendation: Keep bobbing - node is still "alive" while being moved

2. **Should edges visually indicate collision too?**
   - Recommendation: No, just the node is enough for MVP

3. **What if pointer leaves canvas during drag?**
   - Recommendation: Treat as drag end, apply snap-back if in collision

## Code Patterns

### Drag State in Node3D
```javascript
const [isDragging, setIsDragging] = useState(false);
const [hasCollision, setHasCollision] = useState(false);
const originalPositionRef = useRef(null);

// Determine color based on collision state during drag
const displayColor = isDragging && hasCollision ? '#ff4444' : color;
```

### Store Update Pattern
```javascript
updateNodePosition: (id, position) => set((state) => ({
  nodes: state.nodes.map(node =>
    node.id === id ? { ...node, position } : node
  )
})),
```

### Cursor Style
```jsx
<mesh
  style={{ cursor: isSelected ? (isDragging ? 'grabbing' : 'grab') : 'pointer' }}
  // or use document.body.style.cursor in handlers
>
```

Note: In R3F, cursor styles are handled via CSS on the canvas or document, not on mesh elements directly. Will need to set `document.body.style.cursor` in handlers.

## Visual Reference

**Drag behavior:**
- Node floats on invisible plane perpendicular to camera view
- Left/right mouse movement = left/right node movement on screen
- Up/down mouse movement = up/down node movement on screen
- Feels like dragging a 2D object, but in 3D space

**Collision visual:**
- Normal: Node's original color (orange, cyan, etc.)
- Collision: Core and glow turn red (#ff4444)
- Highlight ring stays cyan (still selected)
- Orbital rings also turn red (use displayColor for consistency)

**Constants:**
- `MIN_NODE_DISTANCE = 2.0` units between node centers
