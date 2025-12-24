# INITIAL: 06 - Node Dragging

> **File:** `initial-06-node-dragging.md`  
> **Generates:** `prp-06-node-dragging.md`

## Summary

Implement drag-to-reposition functionality for selected nodes. When a node is selected, dragging it moves the node in 3D space along a plane parallel to the camera. Edges automatically follow since they read node positions from the store. OrbitControls remain active for camera manipulation when dragging empty space or unselected nodes.

Includes collision detection to prevent nodes from overlapping — dragging too close to another node shows a red warning, and releasing in an invalid position snaps the node back to its original location.

## Requirements

### Functional Requirements

**1. Drag Behavior**

- Only **selected nodes** can be dragged (must click to select first)
- Dragging an unselected node does nothing (just orbits camera) — user must click to select, then drag
- Dragging empty space continues to orbit the camera (OrbitControls unchanged)
- While dragging a node, OrbitControls are temporarily disabled to prevent camera movement

**2. Drag Plane**

- Node moves along a plane **perpendicular to the camera's view direction**
- This means dragging feels intuitive regardless of camera angle — left/right moves left/right on screen, up/down moves up/down on screen
- The plane passes through the node's current position at drag start

**3. Collision Detection**

- **Minimum distance**: `MIN_NODE_DISTANCE = 2.0` units between node centers
- During drag, check distance from dragged node to all other nodes
- If any node is within 2.0 units: collision state is active

**4. Collision Visual Feedback**

When collision is detected during drag:
- Dragged node's core changes to red/orange-red (`#ff4444` or similar)
- Dragged node's glow changes to red tint
- The highlight ring can stay cyan (indicates still selected)

When no collision:
- Node renders with normal colors

**5. Snap-Back on Invalid Release**

- Store the node's **original position** when drag starts
- On pointer release:
  - If collision state is active → snap node back to original position
  - If no collision → node stays at new position
- Snap-back should be instant (no animation needed for MVP)

**6. Store Updates**

Add to `graphStore`:
```javascript
updateNodePosition: (id, position) => void  // position is [x, y, z]
```

Position updates happen in real-time during drag (not just on release) so edges follow smoothly.

**7. Visual Feedback During Drag**

- Cursor changes to `grab` on hover over selected node, `grabbing` while dragging
- Optional: slight scale increase on the dragged node (1.0 → 1.05) to indicate it's being moved
- The highlight ring (from selection) remains visible during drag
- Red color when in collision state (see above)

**8. Edge Behavior**

- Edges already read node positions from the store
- As `updateNodePosition` fires during drag, edges should automatically re-render with new curves
- On snap-back, edges return to original configuration
- No additional work needed if EdgeGroup properly subscribes to node position changes

### Non-Functional Requirements

- Drag must feel responsive (position updates every frame, not debounced)
- Collision detection must not cause frame drops (simple distance checks are fast)
- Maintain 60fps during drag operations
- Works correctly at any camera zoom level and angle
- No jitter or jumping when drag starts

## Technical Approach

### Constants

```javascript
// src/constants/layout.js or inline in Node3D
export const MIN_NODE_DISTANCE = 2.0; // Minimum units between node centers
```

### Select-Then-Drag Flow

```
1. User clicks node → node becomes selected (existing behavior)
2. User presses down on selected node → drag starts, original position stored
3. User moves pointer → node follows, collision checked each frame
4. If too close to another node → node turns red (warning)
5. User releases:
   - If red (collision) → snap back to original position
   - If normal → keep new position
```

### Collision Detection

```javascript
const checkCollision = (draggedNodeId, newPosition, allNodes) => {
  for (const node of allNodes) {
    if (node.id === draggedNodeId) continue;
    
    const dx = newPosition[0] - node.position[0];
    const dy = newPosition[1] - node.position[1];
    const dz = newPosition[2] - node.position[2];
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
    if (distance < MIN_NODE_DISTANCE) {
      return true; // Collision detected
    }
  }
  return false;
};
```

### Distinguishing Drag from Click

Extend the existing click detection in Node3D:

```javascript
const pointerDownPos = useRef(null);
const isDragging = useRef(false);
const originalPosition = useRef(null);

const handlePointerDown = (e) => {
  pointerDownPos.current = { x: e.clientX, y: e.clientY };
  isDragging.current = false;
  
  if (isSelected) {
    originalPosition.current = [...position]; // Store for potential snap-back
    onDragStart();
    e.stopPropagation(); // Prevent OrbitControls
  }
};

const handlePointerMove = (e) => {
  if (!pointerDownPos.current || !isSelected) return;
  
  const dx = e.clientX - pointerDownPos.current.x;
  const dy = e.clientY - pointerDownPos.current.y;
  
  if (Math.sqrt(dx * dx + dy * dy) > 5) {
    isDragging.current = true;
    // Calculate new position and call onDrag(newPosition)
  }
};

const handlePointerUp = (e) => {
  if (!isDragging.current && !isSelected) {
    // This was a click on unselected node
    onSelect();
  }
  
  if (isDragging.current) {
    if (hasCollision) {
      // Snap back to original
      onDrag(originalPosition.current);
    }
    onDragEnd();
  }
  
  isDragging.current = false;
  pointerDownPos.current = null;
  originalPosition.current = null;
};
```

### Drag Plane Calculation

Use Three.js `Plane` and raycaster to project mouse position to 3D:

```javascript
import { Plane, Vector3 } from 'three';
import { useThree } from '@react-three/fiber';

const { camera, raycaster, pointer } = useThree();

// Create plane perpendicular to camera, passing through node
const dragPlane = useRef(new Plane());
const intersection = useRef(new Vector3());

const startDrag = (nodePosition) => {
  // Plane normal = camera's forward direction
  const planeNormal = new Vector3();
  camera.getWorldDirection(planeNormal);
  dragPlane.current.setFromNormalAndCoplanarPoint(
    planeNormal, 
    new Vector3(...nodePosition)
  );
};

const updateDrag = () => {
  // Update raycaster from current pointer
  raycaster.setFromCamera(pointer, camera);
  
  // Find intersection with drag plane
  raycaster.ray.intersectPlane(dragPlane.current, intersection.current);
  
  if (intersection.current) {
    const newPosition = [intersection.current.x, intersection.current.y, intersection.current.z];
    const collision = checkCollision(nodeId, newPosition, allNodes);
    setHasCollision(collision);
    onDrag(newPosition);
  }
};
```

### Disabling OrbitControls During Drag

Add to graphStore:
```javascript
draggingNodeId: null,
setDraggingNode: (id) => set({ draggingNodeId: id }),
clearDraggingNode: () => set({ draggingNodeId: null }),
```

In Scene3D or App:
```jsx
const draggingNodeId = useGraphStore((s) => s.draggingNodeId);
<OrbitControls enabled={!draggingNodeId} />
```

### Store Changes

```javascript
// In graphStore.js
updateNodePosition: (id, position) => set((state) => ({
  nodes: state.nodes.map(node =>
    node.id === id ? { ...node, position } : node
  )
})),

draggingNodeId: null,
setDraggingNode: (id) => set({ draggingNodeId: id }),
clearDraggingNode: () => set({ draggingNodeId: null }),
```

## Component Structure

```
src/
├── stores/
│   └── graphStore.js         # MODIFY: Add updateNodePosition, draggingNodeId
├── components/
│   ├── canvas/
│   │   ├── Node3D.jsx        # MODIFY: Add drag handlers, collision visuals
│   │   ├── NodeGroup.jsx     # MODIFY: Wire up drag callbacks, pass allNodes
│   │   └── Scene3D.jsx       # MODIFY: OrbitControls enabled state
│   └── ...
```

## Props / API Changes

**Node3D.jsx** — Modify to add:
- `onDragStart: () => void` — Called when drag begins on selected node
- `onDrag: (position: [x, y, z]) => void` — Called during drag with new position
- `onDragEnd: () => void` — Called when drag ends
- `allNodes: Node[]` — All nodes for collision detection (or pass via store)
- Internal state: `hasCollision` — Controls red color rendering

**NodeGroup.jsx** — Wire up:
- `onDragStart` → `setDraggingNode(id)`
- `onDrag` → `updateNodePosition(id, position)`
- `onDragEnd` → `clearDraggingNode()`
- Pass `nodes` array for collision detection

**graphStore.js** — Add:
- `updateNodePosition: (id, position) => void`
- `draggingNodeId: string | null`
- `setDraggingNode: (id) => void`
- `clearDraggingNode: () => void`

## Acceptance Criteria

- [ ] `updateNodePosition` action added to graphStore
- [ ] `draggingNodeId` state added to graphStore with set/clear actions
- [ ] Dragging a **selected** node moves it in 3D space
- [ ] Dragging an **unselected** node does NOT move it (just orbits camera)
- [ ] Must click to select first, then drag to move (two-step interaction)
- [ ] Dragging empty space still orbits camera normally
- [ ] Node moves along camera-perpendicular plane (intuitive at any angle)
- [ ] Edges follow the dragged node in real-time (curves update)
- [ ] OrbitControls disabled while dragging a node
- [ ] Cursor shows `grab` on hover over selected node
- [ ] Cursor shows `grabbing` during active drag
- [ ] No position jump/jitter when drag starts
- [ ] 60fps maintained during drag
- [ ] **Collision: Node turns red when within 2.0 units of another node**
- [ ] **Collision: Releasing while red snaps node back to original position**
- [ ] **Collision: Releasing while not colliding keeps new position**
- [ ] **Collision: Edges update correctly on snap-back**

## Edge Cases

1. **Drag starts, pointer leaves canvas** — End drag gracefully, snap back if in collision state

2. **Very fast drag** — Position updates should keep up; use `onPointerMove` not throttled events

3. **Drag at extreme zoom** — Plane intersection math should still work; test at min/max zoom levels

4. **Drag while edges are animating** — Particles should continue flowing along updated edge paths

5. **Click without drag on selected node** — Should keep node selected (not deselect)

6. **Drag through multiple collision zones** — Color should update as node enters/exits collision range

7. **Drag to original position while in collision** — If released at start position, should stay (no collision at original spot)

## Out of Scope

- Snapping to grid
- Drag constraints (axis lock, bounds)
- Multi-node drag (select multiple, drag together)
- Undo/redo for position changes
- Drag handles or gizmos
- Position persistence (save/load)
- Animated snap-back (instant is fine for MVP)
- Collision with edges (only node-to-node)

## Dependencies

No new packages required.

## Visual Reference

The drag interaction should feel like dragging objects in Figma or Blender's viewport — the object follows the cursor naturally regardless of view angle, with no lag or jitter.

**Cursor states:**
- Default: `default`
- Hover over unselected node: `pointer` (existing)
- Hover over selected node: `grab`
- Dragging selected node: `grabbing`

**Color states during drag:**
- Normal: Original node color (cyan, orange, etc.)
- Collision warning: Red core (`#ff4444`), red-tinted glow

**Collision constant:**
- `MIN_NODE_DISTANCE = 2.0` units

---

**Ready for handoff to Claude Code** — Once approved, generate PRP with `/generate-prp`.
