# INITIAL: 05 - Node Selection

> **File:** `initial-05-node-selection.md`  
> **Generates:** `prp-05-node-selection.md`

## Summary

Implement click-to-select functionality for nodes, introducing Zustand for shared state management. When a node is clicked, it becomes "selected" with enhanced visual feedback, and a Node Info Panel appears in the HUD showing the selected node's details. Clicking empty space or pressing Escape clears the selection.

This is the first Phase 2 feature and establishes the state management pattern that will be used throughout the rest of the project.

## Requirements

### Functional Requirements

**1. Zustand Store Setup**

Create a `graphStore` that will hold all graph-related state:

```javascript
{
  nodes: [],           // Array of node objects
  edges: [],           // Array of edge objects
  selectedNodeId: null, // ID of currently selected node (or null)
  
  // Actions
  selectNode: (id) => void,
  clearSelection: () => void,
  // Future: setNodes, addNode, updateNode, etc.
}
```

For this INITIAL, the store should be initialized with the existing `testNodes` and `testEdges` data.

**2. Click Detection**

- Clicking a node selects it (sets `selectedNodeId`)
- Clicking the same node again keeps it selected (no toggle behavior)
- Clicking a different node selects the new one
- Clicking empty space (canvas background) clears selection
- Pressing `Escape` key clears selection

Use React Three Fiber's built-in event system (`onClick` on meshes) rather than manual raycaster setup — R3F handles raycasting automatically.

**3. Visual Feedback on Selection**

Selected node should have enhanced visual treatment:
- **Highlight ring**: Additional rotating ring that only appears when selected (thicker, brighter)
- **Brightness boost**: Core and glow opacity increases slightly
- **Scale pulse**: Subtle one-time scale animation on select (1.0 → 1.15 → 1.0)

The existing node animations (ring rotation, bobbing) continue unchanged.

**4. Node Info Panel**

New HUD component (`NodeInfoPanel`) that appears when a node is selected:
- Position: Bottom-left (same as POC reference)
- Shows:
  - Node label (with glow effect)
  - Close button (×) to clear selection
  - Properties list:
    - Type: `{type}` (uppercase)
    - ID: `{id}`
    - Status: `● ACTIVE` (green, hardcoded for now)
- Styling matches existing HUD panels (semi-transparent background, cyan border, monospace font)
- Panel slides/fades in when selection occurs, slides/fades out when cleared (subtle animation)

### Non-Functional Requirements

- Click detection must not interfere with OrbitControls (clicking and dragging to rotate should NOT select nodes)
- Selection state must be accessible from both 3D scene components and HUD components
- Maintain 60fps with selection effects active
- Keyboard events (Escape) should work when canvas is focused

## Technical Approach

### Store Pattern (Zustand)

```javascript
// src/stores/graphStore.js
import { create } from 'zustand';
import { testNodes, testEdges } from '../data/testData';

export const useGraphStore = create((set) => ({
  nodes: testNodes,
  edges: testEdges,
  selectedNodeId: null,
  
  selectNode: (id) => set({ selectedNodeId: id }),
  clearSelection: () => set({ selectedNodeId: null }),
}));
```

### Click Handling in R3F

React Three Fiber provides `onClick`, `onPointerDown`, `onPointerUp` events on any mesh. To distinguish clicks from drags:

```javascript
// Simple approach: track if pointer moved
const pointerDownPos = useRef(null);

const handlePointerDown = (e) => {
  pointerDownPos.current = { x: e.clientX, y: e.clientY };
};

const handlePointerUp = (e) => {
  if (!pointerDownPos.current) return;
  const dx = e.clientX - pointerDownPos.current.x;
  const dy = e.clientY - pointerDownPos.current.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance < 5) { // Threshold for "click" vs "drag"
    selectNode(nodeId);
    e.stopPropagation(); // Prevent canvas click handler
  }
  pointerDownPos.current = null;
};
```

### Clear Selection on Background Click

The `<Canvas>` or a background plane can handle clicks that don't hit any node:

```jsx
<Canvas onClick={clearSelection}>
  {/* ... scene content */}
</Canvas>
```

Or use a large invisible plane behind nodes to catch background clicks.

## Component Structure

```
src/
├── stores/
│   └── graphStore.js         # NEW: Zustand store
├── data/
│   └── testData.js           # Move testNodes/testEdges here
├── components/
│   ├── canvas/
│   │   ├── Node3D.jsx        # MODIFY: Add click handlers, selection visuals
│   │   ├── NodeGroup.jsx     # MODIFY: Get nodes from store
│   │   └── EdgeGroup.jsx     # MODIFY: Get edges from store
│   └── hud/
│       ├── HudOverlay.jsx    # MODIFY: Add NodeInfoPanel
│       └── NodeInfoPanel.jsx # NEW: Selected node details
```

## Data Migration

Currently `testNodes` and `testEdges` are defined inline in scene components. Move them to a dedicated file:

```javascript
// src/data/testData.js
export const testNodes = [
  { id: 'api', type: 'apigateway', label: 'API\nGateway', position: [-4, 2, 0], color: '#ff9900' },
  // ... rest of nodes
];

export const testEdges = [
  // ... edges
];
```

This makes it easier for the store to initialize with this data, and later for import/export.

## Props / API Changes

**Node3D.jsx** — Add props:
- `isSelected: boolean` — Whether this node is currently selected
- `onSelect: () => void` — Callback when node is clicked

**NodeGroup.jsx** — Changes:
- Read `nodes` and `selectedNodeId` from `useGraphStore`
- Pass `isSelected` and `onSelect` to each `Node3D`

**HudOverlay.jsx** — Changes:
- Read `selectedNodeId` and `nodes` from `useGraphStore`
- Conditionally render `NodeInfoPanel` when `selectedNodeId` is not null

## Dependencies

```bash
npm install zustand
```

No other new dependencies required.

## Acceptance Criteria

- [ ] Zustand installed and `graphStore` created with nodes, edges, and selection state
- [ ] Test data moved to `src/data/testData.js`
- [ ] Clicking a node selects it (sets `selectedNodeId` in store)
- [ ] Clicking canvas background clears selection
- [ ] Pressing Escape clears selection
- [ ] Click vs drag properly distinguished (dragging to orbit does NOT select)
- [ ] Selected node shows highlight ring (additional, brighter rotating ring)
- [ ] Selected node has subtle brightness boost
- [ ] Selected node does brief scale pulse animation on select
- [ ] NodeInfoPanel appears when node selected, positioned bottom-left
- [ ] NodeInfoPanel shows: label, type, ID, status with correct styling
- [ ] NodeInfoPanel close button (×) clears selection
- [ ] NodeInfoPanel has enter/exit animation
- [ ] Existing HUD elements (HeaderPanel, ControlsPanel, StatsPanel) still work
- [ ] 60fps maintained with selection active
- [ ] OrbitControls still work (drag to rotate, scroll to zoom)

## Visual Reference

From POC (`reference/poc-visualization.jsx`), the Node Info Panel:

```jsx
<div className="absolute bottom-4 left-4 bg-black/70 border border-cyan-500/50 rounded-lg p-4 backdrop-blur-sm min-w-64">
  <div className="flex justify-between items-start mb-2">
    <div className="text-cyan-400 font-mono text-lg" style={{ textShadow: '0 0 5px cyan' }}>
      {selectedNode.label}
    </div>
    <button className="text-gray-500 hover:text-cyan-400 text-xl leading-none">×</button>
  </div>
  <div className="text-gray-400 text-sm">
    <div className="flex justify-between py-1 border-b border-gray-700">
      <span>Type:</span>
      <span className="text-cyan-300">{selectedNode.type.toUpperCase()}</span>
    </div>
    <!-- ... more rows -->
  </div>
</div>
```

## Out of Scope

- Drag to reposition nodes (separate INITIAL)
- Multi-select (Shift+click, box select)
- Node editing (changing label, type, etc.)
- Edge selection
- Context menu on right-click
- Hover state highlighting

## Architecture Notes

This INITIAL introduces the pattern of using Zustand to share state between the 3D canvas and the 2D HUD. This is foundational — future features (drag, edit, save/load) will extend this store.

**Store access pattern:**
```javascript
// In any component (3D or 2D):
const selectedNodeId = useGraphStore((state) => state.selectedNodeId);
const selectNode = useGraphStore((state) => state.selectNode);
```

Using selectors like this prevents unnecessary re-renders when unrelated store state changes.

---

**Ready for handoff to Claude Code** — Once you approve this spec, take it to Claude Code with `/generate-prp` to create the implementation plan.
