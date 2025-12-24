# INITIAL: 12 - Context Menu & Edge Management

> **File:** `initial-12-context-menu-edge-management.md`  
> **Generates:** `prp-12-context-menu-edge-management.md`

## Summary

Implement a reusable context menu system and edge management capabilities. This establishes right-click menus as a discoverable interaction pattern that will be leveraged by future features (including INITIAL-13: Edit Node Properties).

**Key features:**
1. **Context Menu System** — Reusable component for right-click menus on nodes and edges
2. **Edge Selection** — Click edges to select them (visual feedback, EdgeInfoPanel)
3. **Edge Deletion** — DEL key or context menu "Delete" option
4. **Edge Creation** — "Connect to..." flow from node context menu

## Requirements

### Functional Requirements

#### 1. Context Menu System

Create a reusable `ContextMenu` component that:
- Appears at cursor position on right-click
- Displays a list of actions with labels and optional icons
- Closes on: action click, outside click, Escape key, scroll
- Supports both node and edge contexts (passed as props)
- Styled to match HUD aesthetic (dark background, cyan accents)

**Node Context Menu options (for this INITIAL):**
- "Connect to..." — enters connection mode
- "Delete" — deletes the node (same as DEL key)

**Edge Context Menu options:**
- "Delete" — deletes the edge

**Future options (deferred):**
- "Edit..." — opens property editor (INITIAL-13)
- "Duplicate" — duplicates node
- "Focus" — centers camera on node

#### 2. Edge Selection

Extend the selection system to support edges:
- Click an edge to select it (curve line area, not just particles)
- Only one thing selected at a time (node OR edge, not both)
- Visual feedback on selected edge:
  - Brighter line color/opacity
  - Thicker line or glow effect
  - Particles brighten
- `selectedEdgeId` in store (alongside existing `selectedNodeId`)
- Clicking empty space or Escape clears any selection

**EdgeInfoPanel** (similar to NodeInfoPanel):
- Appears bottom-left when edge is selected
- Shows: source node, target node, style, animated status
- Close button clears selection

#### 3. Edge Deletion

- **DEL key**: Deletes selected edge (if edge is selected)
- **Context menu**: Right-click edge → "Delete"
- Store action: `deleteEdge(id)` — removes edge from edges array
- No cascading effects (edges don't have dependencies)

#### 4. Edge Creation ("Connect to..." Flow)

When user clicks "Connect to..." on a node's context menu:

1. **Enter connecting mode:**
   - Store state: `connectingFromNodeId` (source node ID)
   - Visual feedback: source node highlighted differently (pulsing?)
   - Cursor changes to crosshair
   - HUD shows hint: "Click a node to connect, ESC to cancel"

2. **User clicks another node:**
   - Create new edge: `{ id: generated, source: connectingFromNodeId, target: clickedNodeId, animated: true, style: 'solid' }`
   - Exit connecting mode
   - Select the new edge (show EdgeInfoPanel)

3. **Cancel:**
   - ESC key or clicking empty space exits connecting mode
   - No edge created

**Validation:**
- Cannot connect node to itself
- Cannot create duplicate edge (same source+target already exists)
- Show error/warning if either condition fails

### Non-Functional Requirements

- Context menu should feel snappy (no animation delay on open)
- Edge click detection needs generous hitbox (curves are thin)
- Maintain 60fps during all interactions
- Keyboard shortcuts work when canvas is focused

## Technical Approach

### Store Changes

```javascript
// Add to graphStore.js
selectedEdgeId: null,
connectingFromNodeId: null,

selectEdge: (id) => set({ selectedEdgeId: id, selectedNodeId: null }),
clearSelection: () => set({ selectedNodeId: null, selectedEdgeId: null }),

deleteEdge: (id) => set((state) => ({
  edges: state.edges.filter(e => e.id !== id),
  selectedEdgeId: state.selectedEdgeId === id ? null : state.selectedEdgeId,
})),

startConnecting: (nodeId) => set({ connectingFromNodeId: nodeId }),
cancelConnecting: () => set({ connectingFromNodeId: null }),

addEdge: (source, target) => set((state) => {
  // Check for self-connection
  if (source === target) return state;
  
  // Check for duplicate
  const exists = state.edges.some(
    e => (e.source === source && e.target === target) ||
         (e.source === target && e.target === source)
  );
  if (exists) return state;
  
  const newEdge = {
    id: `edge-${Date.now()}`,
    source,
    target,
    animated: true,
    style: 'solid',
  };
  
  return {
    edges: [...state.edges, newEdge],
    connectingFromNodeId: null,
    selectedEdgeId: newEdge.id,
    selectedNodeId: null,
  };
}),
```

### Context Menu Component

```jsx
// src/components/hud/ContextMenu.jsx
const ContextMenu = ({ x, y, items, onClose }) => {
  // Close on outside click
  useEffect(() => {
    const handleClick = () => onClose();
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [onClose]);
  
  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
  
  return (
    <div 
      className="fixed bg-black/90 border border-cyan-500/50 rounded shadow-lg py-1 z-50"
      style={{ left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item, i) => (
        <button
          key={i}
          onClick={() => { item.action(); onClose(); }}
          className="block w-full px-4 py-2 text-left text-sm text-cyan-400 
                     hover:bg-cyan-500/20 font-mono"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};
```

### Edge Click Detection

Edges (THREE.Line) have thin geometry. For better UX, we can:
1. Add an invisible wider tube/cylinder along the curve for hit detection
2. Use raycaster with increased threshold
3. Create a wider invisible mesh that follows the curve

**Recommended approach:** Add a transparent `TubeGeometry` along the curve with a small radius (0.15) for click detection. This is separate from the visible line.

```jsx
// In Edge3D.jsx - add clickable tube
<mesh 
  onPointerUp={handleClick}
  onContextMenu={handleContextMenu}
>
  <tubeGeometry args={[curve, 20, 0.15, 8, false]} />
  <meshBasicMaterial transparent opacity={0} />
</mesh>
```

### Context Menu Positioning

Right-click events provide `clientX/clientY`. The context menu is rendered as a fixed-position HUD element at those coordinates.

**Edge case:** If menu would overflow viewport, adjust position to keep it visible.

## Component Structure

```
src/
├── stores/
│   └── graphStore.js           # MODIFY: Add edge selection, connecting mode, edge actions
├── components/
│   ├── canvas/
│   │   ├── Edge3D.jsx          # MODIFY: Add click handling, selection visuals
│   │   ├── EdgeGroup.jsx       # MODIFY: Pass selection state and handlers
│   │   ├── Node3D.jsx          # MODIFY: Add right-click handler, connecting mode visuals
│   │   └── NodeGroup.jsx       # MODIFY: Wire up context menu handlers
│   └── hud/
│       ├── ContextMenu.jsx     # NEW: Reusable context menu
│       ├── EdgeInfoPanel.jsx   # NEW: Selected edge details
│       ├── HudOverlay.jsx      # MODIFY: Add ContextMenu and EdgeInfoPanel
│       ├── ControlsPanel.jsx   # MODIFY: Show connecting mode hint
│       └── NodeInfoPanel.jsx   # (existing)
├── App.jsx                     # MODIFY: Extend keyboard handler for edge deletion
```

## Props / API Changes

**graphStore** — Add:
- `selectedEdgeId: string | null`
- `connectingFromNodeId: string | null`
- `selectEdge: (id) => void`
- `deleteEdge: (id) => void`
- `startConnecting: (nodeId) => void`
- `cancelConnecting: () => void`
- `addEdge: (source, target) => void`
- Modify `clearSelection` to clear both node and edge selection

**Edge3D** — Add props:
- `isSelected: boolean`
- `onSelect: () => void`
- `onContextMenu: (event) => void`

**Node3D** — Add:
- `onContextMenu: (event) => void`
- `isConnectingSource: boolean` — visual feedback when in connecting mode

**ContextMenu** — Props:
- `x: number` — left position
- `y: number` — top position
- `items: Array<{ label: string, action: () => void }>`
- `onClose: () => void`

## Dependencies

No new packages required.

## Acceptance Criteria

### Context Menu
- [ ] Right-click on node shows context menu at cursor position
- [ ] Right-click on edge shows context menu at cursor position
- [ ] Context menu closes on action click
- [ ] Context menu closes on outside click
- [ ] Context menu closes on Escape
- [ ] Menu styled with dark background, cyan text, hover states

### Edge Selection
- [ ] Clicking edge selects it
- [ ] Selected edge has visual highlight (brighter, optional glow)
- [ ] EdgeInfoPanel appears when edge selected
- [ ] EdgeInfoPanel shows source, target, style, animated
- [ ] Clicking node while edge selected switches to node selection
- [ ] Clicking empty space clears edge selection
- [ ] Escape clears edge selection

### Edge Deletion
- [ ] DEL key deletes selected edge
- [ ] Context menu "Delete" deletes edge
- [ ] Stats panel updates after edge deletion
- [ ] Auto-save triggers after edge deletion

### Edge Creation
- [ ] Node context menu shows "Connect to..." option
- [ ] Clicking "Connect to..." enters connecting mode
- [ ] Source node shows visual feedback (pulsing or highlight)
- [ ] ControlsPanel shows connecting mode hint
- [ ] Clicking another node creates edge
- [ ] New edge is auto-selected
- [ ] Cannot connect node to itself (no action, no error)
- [ ] Cannot create duplicate edge (no action, no error)
- [ ] Escape cancels connecting mode
- [ ] Clicking empty space cancels connecting mode

## Visual Reference

**Context Menu:**
```
┌──────────────────┐
│ Connect to...    │
│ Delete           │
└──────────────────┘
```

**EdgeInfoPanel (when edge selected):**
```
┌─────────────────────────────────┐
│ EDGE                          × │
├─────────────────────────────────┤
│ Source:    API Gateway          │
│ Target:    Lambda               │
│ Style:     SOLID                │
│ Animated:  ● YES                │
└─────────────────────────────────┘
```

**Connecting Mode hint in ControlsPanel:**
```
CONNECTING
Click target node
ESC to cancel
```

## Out of Scope (Deferred)

- **Drag-from-node edge creation** — More intuitive but complex; defer to Phase 5
- **Edge property editing** — Style, animated toggle; could add to INITIAL-13 or separate
- **Bidirectional edges** — Particles flowing both ways
- **Edge labels** — Text along the curve
- **Multi-select** — Select multiple nodes/edges at once
- **Undo/redo** — Revert edge creation/deletion

## Architecture Notes

### Context Menu as Infrastructure

The `ContextMenu` component is designed to be reusable:
- Items are passed as props, not hardcoded
- Can be triggered from any component (nodes, edges, canvas background)
- Positioning logic handles viewport bounds

This pattern will be extended in INITIAL-13 for "Edit..." functionality and can support future features like "Duplicate", "Group", etc.

### Unified Selection Model

We're keeping `selectedNodeId` and `selectedEdgeId` as separate state but ensuring only one can be non-null at a time. The `selectEdge` and `selectNode` actions clear the other.

Alternative: single `selection: { type: 'node' | 'edge', id: string } | null`
This is cleaner but requires more refactoring of existing code. Current approach is additive.

### Click Detection Strategy

Edges are thin curves — we add an invisible TubeGeometry for better click targets. This is a common pattern in 3D editors.

---

**Ready for handoff to Claude Code** — Once you approve this spec, take it to Claude Code with `/generate-prp` to create the implementation plan.
